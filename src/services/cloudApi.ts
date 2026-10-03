import { Category, Coupon, Order, Product, WebsiteContent } from '../types';
import { INITIAL_PRODUCTS, INITIAL_ORDERS } from './mockData';

const API_BASE = (
    import.meta.env.VITE_API_BASE_URL?.trim() ||
    (import.meta.env.PROD ? 'https://cp-furniture.in/api' : '/api')
).replace(/\/+$/, '');

interface ApiEnvelope {
    success: boolean;
    data?: unknown;
    message?: string;
}

function isApiEnvelope(value: unknown): value is ApiEnvelope {
    return typeof value === 'object' && value !== null && 'success' in value;
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
    const headers = new Headers(options?.headers);
    if (!headers.has('Content-Type')) headers.set('Content-Type', 'application/json');
    const adminToken = localStorage.getItem('cp_admin_session_token');
    if (adminToken && !headers.has('Authorization')) headers.set('Authorization', `Bearer ${adminToken}`);
    const response = await fetch(`${API_BASE}${path}`, {
        ...options,
        cache: 'no-store',
        headers
    });

    if (!response.ok) {
        let message = `Cloud API request failed: ${response.status}`;
        try {
            const errorBody = await response.json() as { message?: string };
            if (errorBody.message) message = errorBody.message;
        } catch {
            // Keep the HTTP status when the backend does not return JSON.
        }
        throw new Error(message);
    }

    let responseBody: unknown;
    try {
        responseBody = await response.json() as unknown;
    } catch {
        throw new Error(`Cloud API returned an invalid response for ${path}.`);
    }

    if (isApiEnvelope(responseBody)) {
        if (!responseBody.success) {
            throw new Error(responseBody.message || `Cloud API request failed: ${path}`);
        }
        if ('data' in responseBody) return responseBody.data as T;
    }

    return responseBody as T;
}

export const cloudApi = {
    subscribe(onEvent: (event: string) => void): () => void {
        const events = new EventSource(`${API_BASE}/events`);
        ['products.updated', 'orders.updated', 'content.updated', 'catalog.updated', 'payment.updated', 'data.updated'].forEach((event) => {
            events.addEventListener(event, () => onEvent(event));
        });
        return () => events.close();
    },
    async getProducts(): Promise<Product[]> {
        return request<Product[]>('/products');
    },

    async getCatalog(): Promise<{ categories: Category[]; coupons: Coupon[] }> {
        return request('/catalog');
    },

    async getOrders(): Promise<Order[]> {
        return request<Order[]>('/orders');
    },

    async getContent(): Promise<WebsiteContent> {
        return request<WebsiteContent>('/content');
    },

    async saveContent(content: Partial<WebsiteContent>): Promise<WebsiteContent> {
        return request<WebsiteContent>('/content', { method: 'PUT', body: JSON.stringify(content) });
    },

    async saveCategory(category: Category): Promise<Category> {
        return request<Category>(`/categories/${encodeURIComponent(category.id)}`, { method: 'PUT', body: JSON.stringify(category) });
    },

    async deleteCategory(categoryId: string): Promise<void> {
        await request<{ success: boolean }>(`/categories/${encodeURIComponent(categoryId)}`, { method: 'DELETE' });
    },

    async saveCoupon(coupon: Coupon): Promise<Coupon> {
        return request<Coupon>(`/coupons/${encodeURIComponent(coupon.code)}`, { method: 'PUT', body: JSON.stringify(coupon) });
    },

    async deleteCoupon(couponCode: string): Promise<void> {
        await request<{ success: boolean }>(`/coupons/${encodeURIComponent(couponCode)}`, { method: 'DELETE' });
    },

    async saveProduct(product: Product): Promise<Product> {
        return request<Product>(`/products/${encodeURIComponent(product.id)}`, {
            method: 'PUT',
            body: JSON.stringify(product)
        });
    },

    async deleteProduct(productId: string): Promise<void> {
        await request<{ success: boolean }>(`/products/${encodeURIComponent(productId)}`, {
            method: 'DELETE'
        });
    },

    async createOrder(order: Order): Promise<Order> {
        return request<Order>('/orders', {
            method: 'POST',
            body: JSON.stringify(order)
        });
    },

    async updateOrderStatus(orderId: string, status: string): Promise<Order> {
        return request<Order>(`/orders/${encodeURIComponent(orderId)}/status`, {
            method: 'PATCH',
            body: JSON.stringify({ status })
        });
    },

    async requestOtp(recipient: string): Promise<{ success: boolean; expiresAt: number; testCode?: string }> {
        return request('/auth/otp/request', { method: 'POST', body: JSON.stringify({ recipient }) });
    },

    async verifyOtp(recipient: string, code: string): Promise<{ success: boolean; message: string }> {
        return request('/auth/otp/verify', { method: 'POST', body: JSON.stringify({ recipient, code }) });
    },

    async adminLogin(email: string, password: string): Promise<{ success: boolean; user?: { name: string; email: string; role: string }; token?: string }> {
        const result = await request<Omit<{ success: boolean; user?: { name: string; email: string; role: string }; token?: string }, 'success'> & { success?: boolean }>(
            '/auth/admin/login',
            { method: 'POST', body: JSON.stringify({ email, password }) }
        );
        return { ...result, success: result.success ?? Boolean(result.user) };
    },

    async adminSession(token: string): Promise<{ success: boolean; user?: { name: string; email: string; role: string } }> {
        return request('/auth/admin/session', { headers: { Authorization: `Bearer ${token}` } });
    },

    async createRazorpayOrder(amount: number, currency: string, receipt: string, items: Array<{ productId: string; quantity: number }>, couponCode?: string): Promise<{ id: string; amount: number; currency: string; testMode?: boolean; keyId?: string }> {
        return request('/payments/razorpay/order', { method: 'POST', body: JSON.stringify({ amount, currency, receipt, items, couponCode }) });
    },

    async verifyRazorpayPayment(orderId: string, paymentId: string, signature: string, amount: number): Promise<{ verified: boolean }> {
        return request('/payments/razorpay/verify', {
            method: 'POST',
            body: JSON.stringify({ orderId, paymentId, signature, amount: Math.round(amount * 100) })
        });
    },

    async seedIfEmpty(): Promise<void> {
        await request<{ success: boolean }>('/sync/seed', {
            method: 'POST',
            body: JSON.stringify({ products: INITIAL_PRODUCTS, orders: INITIAL_ORDERS })
        });
    }
};
