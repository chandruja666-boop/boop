import { useEffect, useRef } from 'react';
import { cloudApi } from '../../services/cloudApi';

interface RazorpayResponse {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
}

interface RazorpayOptions {
    key: string;
    amount: number;
    currency: string;
    name: string;
    description: string;
    order_id: string;
    prefill: { name: string; email: string; contact: string };
    handler: (response: RazorpayResponse) => void;
    modal: { ondismiss: () => void };
}

interface RazorpayInstance {
    open: () => void;
}

declare global {
    interface Window {
        Razorpay?: new (options: RazorpayOptions) => RazorpayInstance;
    }
}

interface RazorpayPaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onError: (message: string) => void;
    amount: number;
    items: Array<{ productId: string; quantity: number }>;
    couponCode?: string;
    customerName: string;
    customerPhone: string;
    customerEmail: string;
    onPaymentSuccess: (paymentDetails: {
        paymentId: string;
        orderId: string;
    }) => void;
}

let checkoutScriptPromise: Promise<void> | undefined;

function loadRazorpayCheckout(): Promise<void> {
    if (window.Razorpay) return Promise.resolve();
    if (!checkoutScriptPromise) {
        checkoutScriptPromise = new Promise<void>((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.async = true;
            script.onload = () => resolve();
            script.onerror = () => reject(new Error('Unable to load Razorpay Checkout.'));
            document.body.appendChild(script);
        }).catch((error: unknown) => {
            checkoutScriptPromise = undefined;
            throw error;
        });
    }
    return checkoutScriptPromise;
}

export const RazorpayPaymentModal: React.FC<RazorpayPaymentModalProps> = (props) => {
    const latestProps = useRef(props);
    latestProps.current = props;

    useEffect(() => {
        if (!props.isOpen) return;
        let cancelled = false;

        const startCheckout = async () => {
            const current = latestProps.current;
            try {
                const order = await cloudApi.createRazorpayOrder(
                    current.amount,
                    'INR',
                    `cpfurniture-${Date.now()}`,
                    current.items,
                    current.couponCode
                );
                if (cancelled) return;

                if (!order.id || !order.keyId || order.testMode) {
                    throw new Error('Razorpay did not return a valid checkout order. Check the backend payment mode and credentials.');
                }

                const completePayment = async (response: RazorpayResponse) => {
                    if (response.razorpay_order_id !== order.id) {
                        latestProps.current.onError('Payment response does not match this order.');
                        latestProps.current.onClose();
                        return;
                    }

                    try {
                        const verification = await cloudApi.verifyRazorpayPayment(
                            response.razorpay_order_id,
                            response.razorpay_payment_id,
                            response.razorpay_signature,
                            current.amount
                        );
                        if (!verification.verified) throw new Error('Razorpay payment verification failed.');
                        latestProps.current.onPaymentSuccess({
                            paymentId: response.razorpay_payment_id,
                            orderId: response.razorpay_order_id
                        });
                    } catch (error) {
                        latestProps.current.onError(error instanceof Error ? error.message : 'Payment verification failed.');
                        latestProps.current.onClose();
                    }
                };

                await loadRazorpayCheckout();
                if (cancelled) return;
                if (!window.Razorpay) {
                    throw new Error('Razorpay Checkout is unavailable. Check the configured Razorpay key ID.');
                }

                const checkout = new window.Razorpay({
                    key: order.keyId,
                    amount: order.amount,
                    currency: order.currency,
                    name: 'CP Furniture',
                    description: 'CP Furniture order',
                    order_id: order.id,
                    prefill: {
                        name: current.customerName,
                        email: current.customerEmail,
                        contact: current.customerPhone
                    },
                    handler: (response) => { void completePayment(response); },
                    modal: { ondismiss: () => latestProps.current.onClose() }
                });
                checkout.open();
            } catch (error) {
                if (!cancelled) {
                    latestProps.current.onError(error instanceof Error ? error.message : 'Unable to open Razorpay Checkout.');
                    latestProps.current.onClose();
                }
            }
        };

        void startCheckout();
        return () => { cancelled = true; };
    }, [props.isOpen]);

    return null;
};
