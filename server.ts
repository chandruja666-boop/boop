import 'dotenv/config';
import express from 'express';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { cert, initializeApp } from 'firebase-admin/app';
import { getDatabase, type Database as FirebaseDatabase } from 'firebase-admin/database';
import { INITIAL_CATEGORIES, INITIAL_COUPONS, INITIAL_ORDERS, INITIAL_PRODUCTS, INITIAL_WEBSITE_CONTENT } from './src/services/mockData';
import { Category, Coupon, Order, Product } from './src/types';

interface Database {
    products: Product[];
    orders: Order[];
    categories?: Category[];
    coupons?: Coupon[];
    websiteContent?: Record<string, unknown>;
    paymentIntents?: Record<string, {
        amount: number;
        currency: string;
        createdAt: string;
        items?: Array<{ productId: string; quantity: number }>;
        subtotal?: number;
        discount?: number;
        deliveryCharge?: number;
    }>;
    verifiedPayments?: Record<string, { paymentId: string; amount: number; verifiedAt: string }>;
    webhookEvents?: Record<string, string>;
}

const app = express();
const port = Number(process.env.PORT || process.env.API_PORT || 4000);
const dataDirectory = path.resolve(process.env.DATA_DIR || process.cwd());
fs.mkdirSync(dataDirectory, { recursive: true });
const databasePath = path.join(dataDirectory, 'server-data.json');
let firebaseDatabase: FirebaseDatabase | null = null;
let firebaseWriteQueue: Promise<void> = Promise.resolve();
const realtimeClients = new Set<express.Response>();
const otpStore = new Map<string, { codeHash: string; expiresAt: number; attempts: number; sentAt?: number }>();
const razorpayKeyId = process.env.RAZORPAY_KEY_ID || '';
const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET || '';
const paymentMode = process.env.PAYMENT_MODE || 'disabled';
const adminEmail = process.env.ADMIN_EMAIL?.trim() || '';
const adminPassword = process.env.ADMIN_PASSWORD || '';
const adminSessions = new Map<string, { user: { name: string; email: string; role: string }; expiresAt: number }>();

function describeError(error: unknown): { name: string; code?: string | number; message: string } {
    if (error instanceof Error) {
        const firebaseError = error as Error & { code?: string | number };
        let message = error.message;
        const sensitiveValues = [
            adminEmail,
            adminPassword,
            process.env.FIREBASE_DATABASE_URL || '',
            process.env.FIREBASE_SERVICE_ACCOUNT_JSON || '',
            process.env.FAST2SMS_API_KEY || '',
            razorpayKeySecret
        ].filter(Boolean);
        sensitiveValues.forEach((value) => {
            message = message.replaceAll(value, '[REDACTED]');
        });
        return {
            name: error.name,
            ...(firebaseError.code !== undefined ? { code: firebaseError.code } : {}),
            message
        };
    }
    return { name: 'UnknownError', message: 'An unknown error occurred.' };
}

// CORS Policy Configuration allowing Authorization header
app.use((_req, res, next) => {
    if (_req.path.startsWith('/api/')) res.setHeader('Cache-Control', 'no-store, max-age=0');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET,PUT,POST,PATCH,DELETE,OPTIONS');
    if (_req.method === 'OPTIONS') {
        res.sendStatus(204);
        return;
    }
    next();
});

function readDatabase(): Database {
    if (!fs.existsSync(databasePath)) {
        const initial: Database = { products: [], orders: INITIAL_ORDERS, categories: INITIAL_CATEGORIES, coupons: INITIAL_COUPONS };
        fs.writeFileSync(databasePath, JSON.stringify(initial, null, 2), 'utf8');
        return initial;
    }

    try {
        return JSON.parse(fs.readFileSync(databasePath, 'utf8')) as Database;
    } catch (error) {
        console.error('[database] Failed to read/parse local database snapshot.', {
            path: databasePath,
            error: describeError(error)
        });
        throw error;
    }
}

function writeDatabase(database: Database): Promise<void> {
    const snapshot = JSON.parse(JSON.stringify(database)) as Database;
    const writeLocalSnapshot = () => {
        const temporaryPath = `${databasePath}.tmp`;
        fs.writeFileSync(temporaryPath, JSON.stringify(snapshot, null, 2), 'utf8');
        fs.renameSync(temporaryPath, databasePath);
    };

    if (!firebaseDatabase) {
        try {
            writeLocalSnapshot();
            return Promise.resolve();
        } catch (error) {
            console.error('[database] Failed to write local JSON snapshot.', {
                path: databasePath,
                error: describeError(error)
            });
            return Promise.reject(error);
        }
    }

    firebaseWriteQueue = firebaseWriteQueue.catch(() => undefined).then(async () => {
        try {
            await firebaseDatabase?.ref('cpFurniture/state').set(snapshot);
            console.info('[database] Firebase state write succeeded.');
        } catch (error) {
            console.error('[database] Firebase state write failed.', { error: describeError(error) });
            throw error;
        }
        writeLocalSnapshot();
    });
    return firebaseWriteQueue;
}

function asyncRoute(handler: (req: express.Request, res: express.Response) => Promise<void>): express.RequestHandler {
    return (req, res, next) => {
        void handler(req, res).catch((error: unknown) => {
            console.error('API request failed:', error);
            if (!res.headersSent) res.status(503).json({ message: 'Shared database write failed. Please retry.' });
            else next(error);
        });
    };
}

async function initializePersistentStore(): Promise<void> {
    const serviceAccountSetting = process.env.FIREBASE_SERVICE_ACCOUNT_JSON || '';
    const databaseUrl = process.env.FIREBASE_DATABASE_URL || '';
    const firebaseRequired = process.env.FIREBASE_REQUIRED?.trim().toLowerCase() === 'true';
    console.info('[database] Starting persistence initialization.', {
        firebaseRequired,
        hasFirebaseDatabaseUrl: Boolean(databaseUrl),
        hasFirebaseServiceAccount: Boolean(serviceAccountSetting),
        hasAdminEmail: Boolean(adminEmail),
        hasAdminPassword: Boolean(adminPassword),
        localSnapshotPath: databasePath
    });
    if (adminPassword && adminPassword.length < 12) {
        console.warn('[auth] ADMIN_PASSWORD is shorter than 12 characters; use a longer, unique secret.');
    }
    if (!serviceAccountSetting || !databaseUrl) {
        if (firebaseRequired) {
            throw new Error('Firebase is required but FIREBASE_DATABASE_URL or FIREBASE_SERVICE_ACCOUNT_JSON is missing.');
        }
        console.warn('[database] Firebase is not configured; using local JSON storage. Cross-instance persistence is unavailable.');
        return;
    }

    try {
        const decodedAccount = serviceAccountSetting.startsWith('base64:')
            ? Buffer.from(serviceAccountSetting.slice(7), 'base64').toString('utf8')
            : serviceAccountSetting;
        const serviceAccount = JSON.parse(decodedAccount) as { project_id?: string; private_key?: string; client_email?: string };
        if (!serviceAccount.project_id || !serviceAccount.private_key || !serviceAccount.client_email) {
            throw new Error('FIREBASE_SERVICE_ACCOUNT_JSON is missing project_id, private_key, or client_email.');
        }
        serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');

        const databaseHost = new URL(databaseUrl).host;
        const projectId = serviceAccount.project_id;
        console.info('[database] Firebase credentials parsed; initializing Admin SDK.', {
            projectId,
            databaseHost,
            serviceAccountEmailPresent: Boolean(serviceAccount.client_email)
        });
        const firebaseApp = initializeApp({
            credential: cert({
                projectId,
                clientEmail: serviceAccount.client_email,
                privateKey: serviceAccount.private_key
            }),
            databaseURL: databaseUrl
        }, `cp-furniture-${projectId}`);
        firebaseDatabase = getDatabase(firebaseApp);
        const stateReference = firebaseDatabase.ref('cpFurniture/state');
        console.info('[database] Checking Firebase state path.');
        const remoteState = await stateReference.get();
        if (remoteState.exists()) {
            const temporaryPath = `${databasePath}.tmp`;
            fs.writeFileSync(temporaryPath, JSON.stringify(remoteState.val(), null, 2), 'utf8');
            fs.renameSync(temporaryPath, databasePath);
            console.info('[database] Existing Firebase state loaded into local snapshot.');
        } else {
            const initialState = readDatabase();
            await stateReference.set(JSON.parse(JSON.stringify(initialState)));
            console.info('[database] Firebase state path was empty; initialized it from local snapshot.');
        }
        stateReference.on('value', (snapshot) => {
            if (!snapshot.exists()) return;
            const state = snapshot.val() as Database;
            try {
                const temporaryPath = `${databasePath}.tmp`;
                fs.writeFileSync(temporaryPath, JSON.stringify(state, null, 2), 'utf8');
                fs.renameSync(temporaryPath, databasePath);
                publish('data.updated', null);
            } catch (error) {
                console.error('[database] Failed to refresh local cache from Firebase.', { error: describeError(error) });
            }
        }, (error) => {
            console.error('[database] Firebase Realtime Database listener failed.', { error: describeError(error) });
        });
        console.info(`[database] Firebase Realtime Database connected for project ${projectId}.`);
    } catch (error) {
        console.error('[database] Firebase initialization failed.', {
            databaseUrlConfigured: Boolean(databaseUrl),
            serviceAccountConfigured: Boolean(serviceAccountSetting),
            error: describeError(error)
        });
        throw error;
    }
}

function normalizeIndianMobile(value: string): string | null {
    const digits = value.replace(/\D/g, '');
    const mobile = digits.length === 12 && digits.startsWith('91') ? digits.slice(2) : digits;
    return /^[6-9]\d{9}$/.test(mobile) ? mobile : null;
}

function publish(event: string, payload: unknown): void {
    const message = `event: ${event}\ndata: ${JSON.stringify(payload)}\n\n`;
    realtimeClients.forEach((client) => client.write(message));
}

function hash(value: string): string {
    return crypto.createHash('sha256').update(value).digest('hex');
}

function hasMatchingSecret(expected: string, actual: string): boolean {
    const expectedBytes = Buffer.from(expected);
    const actualBytes = Buffer.from(actual);
    return expectedBytes.length === actualBytes.length && crypto.timingSafeEqual(expectedBytes, actualBytes);
}

function razorpaySignature(payload: string): string {
    return crypto.createHmac('sha256', razorpayKeySecret).update(payload).digest('hex');
}

function hasValidSignature(expected: string, actual: string): boolean {
    if (!/^[a-f\d]{64}$/i.test(expected) || !/^[a-f\d]{64}$/i.test(actual)) return false;
    return crypto.timingSafeEqual(Buffer.from(expected, 'hex'), Buffer.from(actual, 'hex'));
}

function getVerifiedPayments(database: Database): Record<string, { paymentId: string; amount: number; verifiedAt: string }> {
    return database.verifiedPayments || {};
}

function getPaymentIntents(database: Database): NonNullable<Database['paymentIntents']> {
    return database.paymentIntents || {};
}

function requireAdmin(req: express.Request, res: express.Response, next: express.NextFunction): void {
    const token = String(req.headers.authorization || '').replace(/^Bearer\s+/i, '');
    const session = adminSessions.get(token);
    if (!session || Date.now() > session.expiresAt) {
        if (token) adminSessions.delete(token);
        res.status(401).json({ message: 'A valid admin session is required.' });
        return;
    }
    next();
}

app.post('/api/webhooks/razorpay', express.raw({ type: 'application/json', limit: '1mb' }), asyncRoute(async (req, res) => {
    const rawBody = req.body as Buffer;
    const signature = String(req.headers['x-razorpay-signature'] || '');
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || '';
    if (!webhookSecret || !Buffer.isBuffer(rawBody) || !hasValidSignature(
        crypto.createHmac('sha256', webhookSecret).update(rawBody).digest('hex'),
        signature
    )) {
        res.status(401).json({ message: 'Invalid webhook signature.' });
        return;
    }

    let event: {
        event?: string;
        payload?: { payment?: { entity?: { id?: string; order_id?: string; amount?: number; currency?: string; status?: string } } };
    };
    try {
        event = JSON.parse(rawBody.toString('utf8')) as typeof event;
    } catch {
        res.status(400).json({ message: 'Invalid webhook payload.' });
        return;
    }

    const database = readDatabase();
    const eventId = String(req.headers['x-razorpay-event-id'] || crypto.createHash('sha256').update(rawBody).digest('hex'));
    database.webhookEvents = database.webhookEvents || {};
    if (database.webhookEvents[eventId]) {
        res.json({ received: true, duplicate: true });
        return;
    }

    if (event.event === 'payment.captured') {
        const payment = event.payload?.payment?.entity;
        const orderId = payment?.order_id;
        const intent = orderId ? getPaymentIntents(database)[orderId] : undefined;
        if (!payment?.id || !orderId || payment.status !== 'captured' || !intent || payment.amount !== intent.amount || payment.currency !== intent.currency) {
            res.status(400).json({ message: 'Captured payment does not match a server-created payment order.' });
            return;
        }

        database.verifiedPayments = getVerifiedPayments(database);
        database.verifiedPayments[orderId] = { paymentId: payment.id, amount: payment.amount, verifiedAt: new Date().toISOString() };
        const order = database.orders.find((candidate) => candidate.razorpayOrderId === orderId || candidate.paymentReference === orderId);
        if (order && Math.round(Number(order.grandTotal) * 100) === payment.amount) {
            order.paymentStatus = 'Paid';
            if (order.orderStatus === 'Pending') order.orderStatus = 'Order Placed';
        }
    }

    database.webhookEvents[eventId] = new Date().toISOString();
    await writeDatabase(database);
    if (event.event === 'payment.captured') publish('orders.updated', database.orders);
    publish('payment.updated', event);
    res.json({ received: true });
}));

app.use(express.json({ limit: '30mb' }));

app.get('/api/health', (_req, res) => res.json({ ok: true, service: 'cp-furniture-cloud-backend', persistence: firebaseDatabase ? 'firebase-realtime-database' : 'local-json' }));

app.get('/api/events', (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();
    res.write('event: ready\ndata: {"ok":true}\n\n');
    realtimeClients.add(res);
    req.on('close', () => realtimeClients.delete(res));
});

app.get('/api/products', (_req, res) => {
    res.json(readDatabase().products);
});

app.get('/api/catalog', (_req, res) => {
    const database = readDatabase();
    res.json({
        categories: database.categories || INITIAL_CATEGORIES,
        coupons: database.coupons || INITIAL_COUPONS
    });
});

app.get('/api/content', (_req, res) => {
    res.json(readDatabase().websiteContent || INITIAL_WEBSITE_CONTENT);
});

app.put('/api/content', requireAdmin, asyncRoute(async (req, res) => {
    const database = readDatabase();
    // Securely deep merge website content and festive banner so admin updates persist permanently
    database.websiteContent = {
        ...(database.websiteContent || INITIAL_WEBSITE_CONTENT),
        ...req.body,
        festiveBanner: {
            ...((database.websiteContent as any)?.festiveBanner || (INITIAL_WEBSITE_CONTENT as any).festiveBanner || {}),
            ...((req.body as any)?.festiveBanner || {})
        }
    };
    await writeDatabase(database);
    publish('content.updated', database.websiteContent);
    res.json(database.websiteContent);
}));

app.put('/api/categories/:id', requireAdmin, asyncRoute(async (req, res) => {
    const database = readDatabase();
    database.categories = database.categories || INITIAL_CATEGORIES;
    const category = { ...req.body, id: req.params.id } as Category;
    const index = database.categories.findIndex((item) => item.id === category.id);
    if (index >= 0) database.categories[index] = category;
    else database.categories.push(category);
    await writeDatabase(database);
    publish('catalog.updated', { categories: database.categories, coupons: database.coupons || INITIAL_COUPONS });
    res.json(category);
}));

app.delete('/api/categories/:id', requireAdmin, asyncRoute(async (req, res) => {
    const database = readDatabase();
    database.categories = (database.categories || INITIAL_CATEGORIES).filter((category) => category.id !== req.params.id);
    await writeDatabase(database);
    publish('catalog.updated', { categories: database.categories, coupons: database.coupons || INITIAL_COUPONS });
    res.json({ success: true });
}));

app.put('/api/coupons/:code', requireAdmin, asyncRoute(async (req, res) => {
    const database = readDatabase();
    database.coupons = database.coupons || INITIAL_COUPONS;
    const coupon = { ...req.body, code: req.params.code } as Coupon;
    const index = database.coupons.findIndex((item) => item.code.toUpperCase() === coupon.code.toUpperCase());
    if (index >= 0) database.coupons[index] = coupon;
    else database.coupons.push(coupon);
    await writeDatabase(database);
    publish('catalog.updated', { categories: database.categories || INITIAL_CATEGORIES, coupons: database.coupons });
    res.json(coupon);
}));

app.delete('/api/coupons/:code', requireAdmin, asyncRoute(async (req, res) => {
    const database = readDatabase();
    database.coupons = (database.coupons || INITIAL_COUPONS).filter((coupon) => coupon.code.toUpperCase() !== req.params.code.toUpperCase());
    await writeDatabase(database);
    publish('catalog.updated', { categories: database.categories || INITIAL_CATEGORIES, coupons: database.coupons });
    res.json({ success: true });
}));

app.put('/api/products/:id', requireAdmin, asyncRoute(async (req, res) => {
    const database = readDatabase();
    const product = { ...req.body, id: req.params.id } as Product;
    const index = database.products.findIndex((item) => item.id === product.id);

    if (index >= 0) database.products[index] = product;
    else database.products.unshift(product);

    await writeDatabase(database);
    publish('products.updated', database.products);
    res.json(product);
}));

app.delete('/api/products/:id', requireAdmin, asyncRoute(async (req, res) => {
    const database = readDatabase();
    database.products = database.products.filter((product) => product.id !== req.params.id);
    await writeDatabase(database);
    publish('products.updated', database.products);
    res.json({ success: true });
}));

app.get('/api/orders', (_req, res) => {
    res.json(readDatabase().orders);
});

app.post('/api/orders', asyncRoute(async (req, res) => {
    const database = readDatabase();
    const incoming = req.body as Order;
    const existing = database.orders.find((order) => order.id === incoming.id);

    if (existing) {
        res.json(existing);
        return;
    }

    if (incoming.paymentMethod?.toString().includes('Razorpay') && incoming.paymentStatus === 'Paid') {
        const paymentReference = incoming.paymentReference || incoming.razorpayOrderId;
        const verifiedPayment = paymentReference ? getVerifiedPayments(database)[paymentReference] : undefined;
        const intent = paymentReference ? getPaymentIntents(database)[paymentReference] : undefined;
        const requestedItems = (incoming.items || []).map((item) => ({ productId: item.productId, quantity: item.quantity })).sort((a, b) => a.productId.localeCompare(b.productId));
        const quotedItems = (intent?.items || []).map((item) => ({ productId: item.productId, quantity: item.quantity })).sort((a, b) => a.productId.localeCompare(b.productId));
        const productsMatch = (incoming.items || []).every((item) => {
            const product = database.products.find((candidate) => candidate.id === item.productId);
            return product && item.price === product.salePrice && item.subtotal === product.salePrice * item.quantity;
        });
        if (!verifiedPayment || !intent?.items || JSON.stringify(requestedItems) !== JSON.stringify(quotedItems) || !productsMatch || incoming.subtotal !== intent.subtotal || incoming.discount !== intent.discount || incoming.deliveryCharge !== intent.deliveryCharge || verifiedPayment.amount !== Math.round(Number(incoming.grandTotal) * 100) || verifiedPayment.amount !== intent.amount || verifiedPayment.paymentId !== incoming.razorpayPaymentId) {
            res.status(400).json({ message: 'Order cannot be marked PAID before verified Razorpay payment details are matched.' });
            return;
        }
    }

    for (const item of incoming.items || []) {
        const product = database.products.find((candidate) => candidate.id === item.productId);
        if (product) {
            product.stock = Math.max(0, product.stock - item.quantity);
        }
    }

    database.orders.unshift(incoming);
    await writeDatabase(database);
    publish('orders.updated', database.orders);
    publish('products.updated', database.products);
    res.status(201).json(incoming);
}));

app.patch('/api/orders/:id/status', requireAdmin, asyncRoute(async (req, res) => {
    const database = readDatabase();
    const order = database.orders.find((candidate) => candidate.id === req.params.id);
    if (!order) {
        res.status(404).json({ message: 'Order not found' });
        return;
    }

    order.orderStatus = req.body.status;
    await writeDatabase(database);
    publish('orders.updated', database.orders);
    res.json(order);
}));

app.post('/api/auth/otp/request', async (req, res) => {
    const rawRecipient = String(req.body.recipient || '').trim().toLowerCase();
    if (!rawRecipient) {
        res.status(400).json({ message: 'A phone number or email address is required.' });
        return;
    }

    const otpMode = process.env.OTP_MODE || 'production';
    let recipient = rawRecipient;
    let phoneNumber = '';
    if (otpMode !== 'test' && process.env.OTP_PROVIDER === 'fast2sms') {
        const mobile = normalizeIndianMobile(rawRecipient);
        if (!mobile) {
            res.status(400).json({ message: 'Enter a valid 10-digit Indian mobile number for SMS OTP.' });
            return;
        }
        phoneNumber = mobile;
        recipient = phoneNumber;
        const previousRequest = otpStore.get(recipient);
        if (previousRequest?.sentAt && Date.now() - previousRequest.sentAt < 30_000) {
            res.status(429).json({ message: 'Please wait 30 seconds before requesting another OTP.' });
            return;
        }
    }
    const code = crypto.randomInt(100000, 1000000).toString();
    const expiresAt = Date.now() + 5 * 60 * 1000;

    if (otpMode === 'test') {
        otpStore.set(recipient, { codeHash: hash(code), expiresAt, attempts: 0 });
        console.log(`[OTP TEST] ${recipient}: ${code}`);
        res.json({ success: true, expiresAt, testCode: code });
        return;
    }

    if (process.env.OTP_PROVIDER === 'fast2sms') {
        const apiKey = process.env.FAST2SMS_API_KEY;
        if (!apiKey) {
            res.status(503).json({ message: 'Fast2SMS API key is missing in environment variables.' });
            return;
        }

        try {
            const response = await fetch('https://www.fast2sms.com/dev/bulkV2', {
                method: 'POST',
                headers: {
                    'authorization': apiKey,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    route: 'otp',
                    variables_values: code,
                    numbers: phoneNumber
                })
            });

            const data = await response.json() as { return?: boolean; message?: string };

            if (response.ok && data.return) {
                otpStore.set(recipient, { codeHash: hash(code), expiresAt, attempts: 0, sentAt: Date.now() });
                console.log(`[Fast2SMS] OTP sent successfully to ${recipient}`);
                res.json({ success: true, expiresAt });
            } else {
                console.error('Fast2SMS Error Response:', data);
                res.status(502).json({ message: data.message || 'Failed to send SMS through Fast2SMS.' });
            }
        } catch (error) {
            console.error('Fast2SMS Network Error:', error);
            res.status(502).json({ message: 'Unable to reach Fast2SMS service.' });
        }
        return;
    }

    res.status(503).json({ message: 'OTP provider is not configured for production.' });
});

app.post('/api/auth/otp/verify', (req, res) => {
    const rawRecipient = String(req.body.recipient || '').trim().toLowerCase();
    const recipient = (process.env.OTP_MODE || 'production') !== 'test' && process.env.OTP_PROVIDER === 'fast2sms'
        ? normalizeIndianMobile(rawRecipient)
        : rawRecipient;
    if (!recipient) {
        res.status(400).json({ success: false, message: 'Enter the same valid Indian mobile number used to request the OTP.' });
        return;
    }
    const code = String(req.body.code || '').trim();
    const entry = otpStore.get(recipient);
    if (!entry || Date.now() > entry.expiresAt) {
        otpStore.delete(recipient);
        res.status(400).json({ success: false, message: 'OTP expired or not requested.' });
        return;
    }
    if (entry.attempts >= 5 || hash(code) !== entry.codeHash) {
        entry.attempts += 1;
        res.status(400).json({ success: false, message: 'Invalid OTP.' });
        return;
    }
    otpStore.delete(recipient);
    res.json({ success: true, message: 'OTP verified.' });
});

app.post('/api/auth/admin/login', (req, res) => {
    console.info('[auth] Admin login request received.', {
        emailProvided: typeof req.body.email === 'string' && req.body.email.trim().length > 0,
        passwordProvided: typeof req.body.password === 'string' && req.body.password.length > 0,
        adminEmailConfigured: Boolean(adminEmail),
        adminPasswordConfigured: Boolean(adminPassword)
    });
    if (!adminEmail || !adminPassword) {
        console.error('[auth] Admin login unavailable because backend credentials are not fully configured.');
        return res.status(503).json({ success: false, message: 'Admin credentials are not configured on the backend.' });
    }
    const email = String(req.body.email || '').trim().toLowerCase();
    const password = String(req.body.password || '');
    const emailMatches = Boolean(email) && email === adminEmail.toLowerCase();
    const passwordMatches = hasMatchingSecret(adminPassword, password);
    if (!emailMatches || !passwordMatches) {
        console.warn('[auth] Admin login rejected.', {
            emailMatches,
            passwordMatches
        });
        return res.status(401).json({ success: false, message: 'Invalid admin credentials.' });
    }
    const user = { name: 'Chief Merchandiser', email: '', role: 'Super Admin' };
    const token = crypto.randomBytes(32).toString('hex');
    adminSessions.set(token, { user, expiresAt: Date.now() + 8 * 60 * 60 * 1000 });
    console.info('[auth] Admin login succeeded; session issued.');
    res.json({ success: true, user, token });
});

app.get('/api/auth/admin/session', (req, res) => {
    const token = String(req.headers.authorization || '').replace(/^Bearer\s+/i, '');
    const session = adminSessions.get(token);
    if (!session || Date.now() > session.expiresAt) {
        adminSessions.delete(token);
        res.status(401).json({ success: false });
        return;
    }
    res.json({ success: true, user: session.user });
});

app.post('/api/payments/razorpay/order', async (req, res) => {
    const amountInRupees = Number(req.body.amount);
    const currency = String(req.body.currency || 'INR').toUpperCase();
    const receipt = String(req.body.receipt || '');
    const amount = Math.round(amountInRupees * 100);
    if (!Number.isFinite(amountInRupees) || amountInRupees <= 0 || amountInRupees > 99999999 || !Number.isSafeInteger(amount) || Math.abs(amountInRupees * 100 - amount) > 0.000001 || currency !== 'INR') {
        res.status(400).json({ message: 'A valid amount and supported currency (INR) are required.' });
        return;
    }
    if (receipt && !/^[A-Za-z0-9_-]{1,40}$/.test(receipt)) {
        res.status(400).json({ message: 'Receipt must contain only letters, numbers, underscores, or hyphens (maximum 40 characters).' });
        return;
    }
    const items = Array.isArray(req.body.items) ? req.body.items as Array<{ productId?: string; quantity?: number }> : [];
    if (items.length === 0 || items.length > 50 || items.some((item) => typeof item.productId !== 'string' || !Number.isSafeInteger(item.quantity) || Number(item.quantity) <= 0 || Number(item.quantity) > 100)) {
        res.status(400).json({ message: 'A cart with valid product IDs and quantities is required.' });
        return;
    }
    const quoteDatabase = readDatabase();
    let subtotal = 0;
    const quotedItems: Array<{ productId: string; quantity: number }> = [];
    for (const item of items) {
        const product = quoteDatabase.products.find((candidate) => candidate.id === item.productId && candidate.isPublished);
        const quantity = Number(item.quantity);
        if (!product || product.stock < quantity) {
            res.status(400).json({ message: 'A cart product is unavailable or has insufficient stock.' });
            return;
        }
        subtotal += product.salePrice * quantity;
        quotedItems.push({ productId: product.id, quantity });
    }
    let discount = 0;
    const couponCode = String(req.body.couponCode || '').trim().toUpperCase();
    if (couponCode) {
        const coupon = (quoteDatabase.coupons || INITIAL_COUPONS).find((candidate) => candidate.code.toUpperCase() === couponCode && candidate.isEnabled);
        if (!coupon || new Date(coupon.expiryDate) < new Date() || subtotal < (coupon.minOrderValue || 0)) {
            res.status(400).json({ message: 'The submitted coupon is invalid, expired, or does not meet its minimum order amount.' });
            return;
        }
        discount = coupon.discountType === 'percentage' ? Math.round(Math.min(subtotal * coupon.discountValue / 100, coupon.maxDiscount || Number.MAX_SAFE_INTEGER)) : Math.round(coupon.discountValue);
        discount = Math.min(discount, subtotal);
    }
    const deliveryCharge = subtotal > 25000 || subtotal === 0 ? 0 : 999;
    const expectedAmount = Math.round(Math.max(0, subtotal - discount + deliveryCharge) * 100);
    if (amount !== expectedAmount) {
        res.status(400).json({ message: 'The checkout amount does not match the server-calculated cart total. Refresh your cart and try again.' });
        return;
    }
    if (paymentMode === 'test') {
        const id = `order_test_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
        quoteDatabase.paymentIntents = getPaymentIntents(quoteDatabase);
        quoteDatabase.paymentIntents[id] = { amount, currency, createdAt: new Date().toISOString(), items: quotedItems, subtotal, discount, deliveryCharge };
        await writeDatabase(quoteDatabase);
        res.json({ id, amount, currency, testMode: true });
        return;
    }
    if (paymentMode !== 'production') {
        res.status(503).json({ message: 'Razorpay payments are disabled. Set PAYMENT_MODE=production to enable them.' });
        return;
    }
    if (!razorpayKeyId.startsWith('rzp_live_')) {
        res.status(503).json({ message: 'Live Razorpay credentials are required for production payments.' });
        return;
    }
    if (!razorpayKeyId || !razorpayKeySecret) {
        res.status(503).json({ message: 'Razorpay production credentials are not configured.' });
        return;
    }
    const auth = Buffer.from(`${razorpayKeyId}:${razorpayKeySecret}`).toString('base64');
    try {
        const response = await fetch('https://api.razorpay.com/v1/orders', {
            method: 'POST',
            headers: { Authorization: `Basic ${auth}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ amount, currency, ...(receipt ? { receipt } : {}) })
        });
        const razorpayOrder = await response.json() as { id?: string; amount?: number; currency?: string };
        if (response.ok && razorpayOrder.id) {
            quoteDatabase.paymentIntents = getPaymentIntents(quoteDatabase);
            quoteDatabase.paymentIntents[razorpayOrder.id] = {
                amount,
                currency: razorpayOrder.currency || 'INR',
                createdAt: new Date().toISOString(),
                items: quotedItems,
                subtotal,
                discount,
                deliveryCharge
            };
            await writeDatabase(quoteDatabase);
        }
        res.status(response.status).json({ ...razorpayOrder, keyId: razorpayKeyId });
    } catch {
        res.status(502).json({ message: 'Unable to reach Razorpay order service.' });
    }
});

app.post('/api/payments/razorpay/verify', async (req, res) => {
    const orderId = String(req.body.orderId || '');
    const paymentId = String(req.body.paymentId || '');
    const amount = Math.round(Number(req.body.amount));
    if (!orderId || !paymentId || !Number.isSafeInteger(amount) || amount <= 0) {
        res.status(400).json({ verified: false, message: 'Payment order ID, payment ID, and amount are required.' });
        return;
    }
    const intentDatabase = readDatabase();
    const intent = getPaymentIntents(intentDatabase)[orderId];
    if (!intent || intent.amount !== amount || intent.currency !== 'INR') {
        res.status(400).json({ verified: false, message: 'Payment order ID or amount does not match the server-created payment intent.' });
        return;
    }
    if (paymentMode === 'test' && paymentId.startsWith('pay_test_') && orderId.startsWith('order_test_')) {
        intentDatabase.verifiedPayments = getVerifiedPayments(intentDatabase);
        intentDatabase.verifiedPayments[orderId] = { paymentId, amount, verifiedAt: new Date().toISOString() };
        await writeDatabase(intentDatabase);
        res.json({ verified: true, testMode: true, orderId, amount });
        return;
    }
    if (!razorpayKeySecret) {
        res.status(503).json({ verified: false, message: 'Razorpay production credentials are not configured.' });
        return;
    }
    if (paymentMode !== 'production' || !razorpayKeyId.startsWith('rzp_live_')) {
        res.status(503).json({ verified: false, message: 'Live Razorpay credentials are required for production payment verification.' });
        return;
    }
    const payload = `${orderId}|${paymentId}`;
    if (!hasValidSignature(razorpaySignature(payload), String(req.body.signature || ''))) {
        res.json({ verified: false, message: 'Invalid Razorpay payment signature.' });
        return;
    }
    fetch(`https://api.razorpay.com/v1/payments/${encodeURIComponent(paymentId)}`, {
        headers: { Authorization: `Basic ${Buffer.from(`${razorpayKeyId}:${razorpayKeySecret}`).toString('base64')}` }
    }).then(async (orderResponse) => {
        const razorpayPayment = await orderResponse.json() as { id?: string; order_id?: string; amount?: number; currency?: string; status?: string };
        if (!orderResponse.ok || razorpayPayment.id !== paymentId || razorpayPayment.order_id !== orderId || razorpayPayment.amount !== amount || razorpayPayment.currency !== intent.currency || razorpayPayment.status !== 'captured') {
            res.json({ verified: false, message: 'Razorpay payment is not captured or its order, amount, or currency does not match.' });
            return;
        }
        const database = readDatabase();
        database.verifiedPayments = getVerifiedPayments(database);
        database.verifiedPayments[orderId] = { paymentId, amount, verifiedAt: new Date().toISOString() };
        await writeDatabase(database);
        res.json({ verified: true, orderId, amount });
    }).catch(() => res.status(502).json({ verified: false, message: 'Unable to verify Razorpay order amount.' }));
});

app.post('/api/sync/seed', requireAdmin, asyncRoute(async (req, res) => {
    const database = readDatabase();
    if (database.products.length === 0 && database.orders.length === 0) {
        database.products = req.body.products || INITIAL_PRODUCTS;
        database.orders = req.body.orders || INITIAL_ORDERS;
        await writeDatabase(database);
    }
    res.json({ success: true });
}));

const frontendDistPath = path.join(process.cwd(), 'dist');
if (fs.existsSync(frontendDistPath)) {
    app.use(express.static(frontendDistPath));
    app.get('*', (_req, res) => {
        res.sendFile(path.join(frontendDistPath, 'index.html'));
    });
}

initializePersistentStore().then(() => {
    app.listen(port, () => {
        console.log(`CP Furniture cloud backend listening on http://localhost:${port}`);
    });
}).catch((error) => {
    console.error('Backend startup failed:', error);
    process.exitCode = 1;
});