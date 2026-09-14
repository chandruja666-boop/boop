import { Order, Product, WebsiteContent } from '../types';
import { INITIAL_PRODUCTS, INITIAL_ORDERS } from './mockData';

const API_BASE = '/api';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${API_BASE}${path}`, {
        headers: { 'Content-Type': 'application/json' },
        ...options
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

    return response.json() as Promise<T>;
}

export const cloudApi = {
    subscribe(onEvent: (event: string) => void): () => void {
        const events = new EventSource(`${API_BASE}/events`);
        ['products.updated', 'orders.updated', 'content.updated', 'payment.updated'].forEach((event) => {
            events.addEventListener(event, () => onEvent(event));
        });
        return () => events.close();
    },
    async getProducts(): Promise<Product[]> {
        return request<Product[]>('/products');
    },

    async getOrders(): Promise<Order[]> {
        return request<Order[]>('/orders');
    },

    async getContent(): Promise<WebsiteContent> {
        return request<WebsiteContent>('/content');
    },

    async saveContent(content: WebsiteContent): Promise<WebsiteContent> {
        return request<WebsiteContent>('/content', { method: 'PUT', body: JSON.stringify(content) });
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
        return request('/auth/admin/login', { method: 'POST', body: JSON.stringify({ email, password }) });
    },

    async adminSession(token: string): Promise<{ success: boolean; user?: { name: string; email: string; role: string } }> {
        return request('/auth/admin/session', { headers: { Authorization: `Bearer ${token}` } });
    },

    async createRazorpayOrder(amount: number, receipt: string): Promise<{ id: string; amount: number; currency: string; testMode?: boolean; keyId?: string }> {
        return request('/payments/razorpay/order', { method: 'POST', body: JSON.stringify({ amount, receipt }) });
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
