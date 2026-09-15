import 'dotenv/config';
import express from 'express';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { INITIAL_ORDERS, INITIAL_PRODUCTS, INITIAL_WEBSITE_CONTENT } from './services/mockData.ts';
import { Order, Product } from './types.ts';

interface Database {
    products: Product[];
    orders: Order[];
    websiteContent?: Record<string, unknown>;
    paymentIntents?: Record<string, { amount: number; currency: string; createdAt: string }>;
    verifiedPayments?: Record<string, { paymentId: string; amount: number; verifiedAt: string }>;
}

const app = express();
const port = Number(process.env.API_PORT || 4000);
const databasePath = path.join(path.dirname(fileURLToPath(import.meta.url)), 'server-data.json');
const realtimeClients = new Set<express.Response>();
const otpStore = new Map<string, { codeHash: string; expiresAt: number; attempts: number }>();
const razorpayKeyId = process.env.RAZORPAY_KEY_ID || '';
const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET || '';
const paymentMode = process.env.PAYMENT_MODE || 'disabled';
const adminEmail = process.env.ADMIN_EMAIL || 'admin@cpfurniture.com';
const adminPasswordHash = hash(process.env.ADMIN_PASSWORD || '');
const adminSessions = new Map<string, { user: { name: string; email: string; role: string }; expiresAt: number }>();

app.use(express.json({ limit: '10mb' }));
app.use((_req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Access-Control-Allow-Methods', 'GET,PUT,POST,PATCH,DELETE,OPTIONS');
    if (_req.method === 'OPTIONS') {
        res.sendStatus(204);
        return;
    }
    next();
});

function readDatabase(): Database {
    if (!fs.existsSync(databasePath)) {
        const initial: Database = { products: INITIAL_PRODUCTS, orders: INITIAL_ORDERS };
        fs.writeFileSync(databasePath, JSON.stringify(initial, null, 2));
        return initial;
    }

    try {
        return JSON.parse(fs.readFileSync(databasePath, 'utf8')) as Database;
    } catch {
        return { products: INITIAL_PRODUCTS, orders: INITIAL_ORDERS };
    }
}

function writeDatabase(database: Database): void {
    const temporaryPath = `${databasePath}.tmp`;
    fs.writeFileSync(temporaryPath, JSON.stringify(database, null, 2));
    fs.renameSync(temporaryPath, databasePath);
}

function publish(event: string, payload: unknown): void {
    const message = `event: ${event}\ndata: ${JSON.stringify(payload)}\n\n`;
    realtimeClients.forEach((client) => client.write(message));
}

function hash(value: string): string {
    return crypto.createHash('sha256').update(value).digest('hex');
}

function razorpaySignature(payload: string): string {
    return crypto.createHmac('sha256', razorpayKeySecret).update(payload).digest('hex');
}

function getVerifiedPayments(database: Database): Record<string, { paymentId: string; amount: number; verifiedAt: string }> {
    return database.verifiedPayments || {};
}

function getPaymentIntents(database: Database): Record<string, { amount: number; currency: string; createdAt: string }> {
    return database.paymentIntents || {};
}

app.get('/api/health', (_req, res) => res.json({ ok: true, service: 'cp-furniture-cloud-backend' }));

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

app.get('/api/content', (_req, res) => {
    res.json(readDatabase().websiteContent || INITIAL_WEBSITE_CONTENT);
});

app.put('/api/content', (req, res) => {
    const database = readDatabase();
    database.websiteContent = req.body;
    writeDatabase(database);
    publish('content.updated', database.websiteContent);
    res.json(database.websiteContent);
});

app.put('/api/products/:id', (req, res) => {
    const database = readDatabase();
    const product = { ...req.body, id: req.params.id } as Product;
    const index = database.products.findIndex((item) => item.id === product.id);

    if (index >= 0) database.products[index] = product;
    else database.products.unshift(product);

    writeDatabase(database);
    publish('products.updated', database.products);
    res.json(product);
});

app.delete('/api/products/:id', (req, res) => {
    const database = readDatabase();
    database.products = database.products.filter((product) => product.id !== req.params.id);
    writeDatabase(database);
    publish('products.updated', database.products);
    res.json({ success: true });
});

app.get('/api/orders', (_req, res) => {
    res.json(readDatabase().orders);
});

app.post('/api/orders', (req, res) => {
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
        if (!verifiedPayment || verifiedPayment.amount !== Math.round(Number(incoming.grandTotal) * 100) || verifiedPayment.paymentId !== incoming.razorpayPaymentId) {
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
    writeDatabase(database);
    publish('orders.updated', database.orders);
    publish('products.updated', database.products);
    res.status(201).json(incoming);
});

app.patch('/api/orders/:id/status', (req, res) => {
    const database = readDatabase();
    const order = database.orders.find((candidate) => candidate.id === req.params.id);
    if (!order) {
        res.status(404).json({ message: 'Order not found' });
        return;
    }

    order.orderStatus = req.body.status;
    writeDatabase(database);
    publish('orders.updated', database.orders);
    res.json(order);
});

app.post('/api/auth/otp/request', async (req, res) => {
    const recipient = String(req.body.recipient || '').trim().toLowerCase();
    if (!recipient) {
        res.status(400).json({ message: 'A phone number or email address is required.' });
        return;
    }

    const isTest = process.env.OTP_MODE === 'test';
    const code = crypto.randomInt(100000, 1000000).toString();
    const expiresAt = Date.now() + 5 * 60 * 1000;

    if (isTest) {
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
                    numbers: recipient
                })
            });

            const data = await response.json() as { return?: boolean; message?: string };

            if (response.ok && data.return) {
                otpStore.set(recipient, { codeHash: hash(code), expiresAt, attempts: 0 });
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
    const recipient = String(req.body.recipient || '').trim().toLowerCase();
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
    const email = String(req.body.email || '').trim().toLowerCase();
    const password = String(req.body.password || '');
    if (!process.env.ADMIN_PASSWORD || email !== adminEmail.toLowerCase() || hash(password) !== adminPasswordHash) {
        res.status(401).json({ success: false, message: 'Invalid admin credentials.' });
        return;
    }
    const user = { name: 'Chief Merchandiser', email: adminEmail, role: 'Super Admin' };
    const token = crypto.randomBytes(32).toString('hex');
    adminSessions.set(token, { user, expiresAt: Date.now() + 8 * 60 * 60 * 1000 });
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
    const amount = Math.round(Number(req.body.amount) * 100);
    if (!Number.isInteger(amount) || amount <= 0) {
        res.status(400).json({ message: 'A valid positive payment amount is required.' });
        return;
    }
    if (paymentMode === 'test') {
        const id = `order_test_${Date.now()}`;
        const database = readDatabase();
        database.paymentIntents = getPaymentIntents(database);
        database.paymentIntents[id] = { amount, currency: 'INR', createdAt: new Date().toISOString() };
        writeDatabase(database);
        res.json({ id, amount, currency: 'INR', testMode: true });
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
            body: JSON.stringify({ amount, currency: 'INR', receipt: req.body.receipt })
        });
        const razorpayOrder = await response.json() as { id?: string; amount?: number; currency?: string };
        if (response.ok && razorpayOrder.id) {
            const database = readDatabase();
            database.paymentIntents = getPaymentIntents(database);
            database.paymentIntents[razorpayOrder.id] = {
                amount,
                currency: razorpayOrder.currency || 'INR',
                createdAt: new Date().toISOString()
            };
            writeDatabase(database);
        }
        res.status(response.status).json({ ...razorpayOrder, keyId: razorpayKeyId });
    } catch {
        res.status(502).json({ message: 'Unable to reach Razorpay order service.' });
    }
});

app.post('/api/payments/razorpay/verify', (req, res) => {
    const orderId = String(req.body.orderId || '');
    const paymentId = String(req.body.paymentId || '');
    const amount = Math.round(Number(req.body.amount));
    if (!orderId || !paymentId || !Number.isInteger(amount) || amount <= 0) {
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
        writeDatabase(intentDatabase);
        res.json({ verified: true, testMode: true, orderId, amount });
        return;
    }
    if (!razorpayKeySecret) {
        res.status(503).json({ verified: false, message: 'Razorpay production credentials are not configured.' });
        return;
    }
    const payload = `${orderId}|${paymentId}`;
    if (razorpaySignature(payload) !== req.body.signature) {
        res.json({ verified: false, message: 'Invalid Razorpay payment signature.' });
        return;
    }
    fetch(`https://api.razorpay.com/v1/orders/${encodeURIComponent(orderId)}`, {
        headers: { Authorization: `Basic ${Buffer.from(`${razorpayKeyId}:${razorpayKeySecret}`).toString('base64')}` }
    }).then(async (orderResponse) => {
        const razorpayOrder = await orderResponse.json() as { id?: string; amount?: number };
        if (!orderResponse.ok || razorpayOrder.id !== orderId || razorpayOrder.amount !== amount) {
            res.json({ verified: false, message: 'Razorpay order ID or amount mismatch.' });
            return;
        }
        const database = readDatabase();
        database.verifiedPayments = getVerifiedPayments(database);
        database.verifiedPayments[orderId] = { paymentId, amount, verifiedAt: new Date().toISOString() };
        writeDatabase(database);
        res.json({ verified: true, orderId, amount });
    }).catch(() => res.status(502).json({ verified: false, message: 'Unable to verify Razorpay order amount.' }));
});

app.post('/api/webhooks/razorpay', (req, res) => {
    const signature = String(req.headers['x-razorpay-signature'] || '');
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || '';
    if (!webhookSecret || crypto.createHmac('sha256', webhookSecret).update(JSON.stringify(req.body)).digest('hex') !== signature) {
        res.status(401).json({ message: 'Invalid webhook signature.' });
        return;
    }
    publish('payment.updated', req.body);
    res.json({ received: true });
});

app.post('/api/sync/seed', (req, res) => {
    const database = readDatabase();
    if (database.products.length === 0 && database.orders.length === 0) {
        database.products = req.body.products || INITIAL_PRODUCTS;
        database.orders = req.body.orders || INITIAL_ORDERS;
        writeDatabase(database);
    }
    res.json({ success: true });
});
import path from 'node:path';

// ... 

const frontendDistPath = path.join(path.dirname(fileURLToPath(import.meta.url)), '../dist');
if (fs.existsSync(frontendDistPath)) {
    app.use(express.static(frontendDistPath));
    app.get('*', (_req, res) => {
        res.sendFile(path.join(frontendDistPath, 'index.html'));
    });
}
app.listen(port, () => {
    console.log(`CP Furniture cloud backend listening on http://localhost:${port}`);
});