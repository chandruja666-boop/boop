import React, { useEffect, useState } from 'react';
import { AlertCircle, Building2, CheckCircle2, Loader2, Lock, ShieldCheck, X } from 'lucide-react';
import { RAZORPAY_CONFIG } from '../../types';
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
    amount: number;
    items: Array<{ productId: string; quantity: number }>;
    couponCode?: string;
    customerName: string;
    customerPhone: string;
    customerEmail: string;
    onPaymentSuccess: (paymentDetails: {
        paymentId: string;
        orderId: string;
        handle: string;
        method: string;
        bankSettlement: string;
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

export const RazorpayPaymentModal: React.FC<RazorpayPaymentModalProps> = ({
    isOpen,
    onClose,
    amount,
    items,
    couponCode,
    customerName,
    customerPhone,
    customerEmail,
    onPaymentSuccess
}) => {
    const [gatewayOrder, setGatewayOrder] = useState<{ id: string; amount: number; currency: string; testMode?: boolean; keyId?: string } | null>(null);
    const [paymentError, setPaymentError] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        if (!isOpen) return;
        setPaymentError('');
        setGatewayOrder(null);
        setIsProcessing(false);
        cloudApi.createRazorpayOrder(amount, 'INR', `cpfurniture-${Date.now()}`, items, couponCode)
            .then(setGatewayOrder)
            .catch((error: unknown) => setPaymentError(error instanceof Error ? error.message : 'Unable to initialize Razorpay securely.'));
    }, [amount, couponCode, isOpen, items]);

    if (!isOpen) return null;

    const completeVerifiedPayment = async (response: RazorpayResponse) => {
        if (!gatewayOrder || response.razorpay_order_id !== gatewayOrder.id) {
            setPaymentError('The payment response does not match this checkout order.');
            setIsProcessing(false);
            return;
        }
        try {
            const verification = await cloudApi.verifyRazorpayPayment(
                response.razorpay_order_id,
                response.razorpay_payment_id,
                response.razorpay_signature,
                amount
            );
            if (!verification.verified) throw new Error('Razorpay payment verification failed.');
            setIsProcessing(false);
            onPaymentSuccess({
                paymentId: response.razorpay_payment_id,
                orderId: response.razorpay_order_id,
                handle: RAZORPAY_CONFIG.merchantHandle,
                method: 'Razorpay Standard Checkout',
                bankSettlement: RAZORPAY_CONFIG.settlementType
            });
        } catch (error) {
            setIsProcessing(false);
            setPaymentError(error instanceof Error ? error.message : 'Payment verification failed.');
        }
    };

    const handleOpenCheckout = async () => {
        if (!gatewayOrder) {
            setPaymentError('Secure payment order is not ready. Please try again.');
            return;
        }

        setIsProcessing(true);
        if (gatewayOrder.testMode) {
            await completeVerifiedPayment({
                razorpay_payment_id: `pay_test_${Date.now()}`,
                razorpay_order_id: gatewayOrder.id,
                razorpay_signature: 'test'
            });
            return;
        }

        try {
            await loadRazorpayCheckout();
            if (!window.Razorpay || !gatewayOrder.keyId) throw new Error('Razorpay Checkout is unavailable. Check the production key configuration.');
            const checkout = new window.Razorpay({
                key: gatewayOrder.keyId,
                amount: gatewayOrder.amount,
                currency: gatewayOrder.currency,
                name: 'CP Furniture',
                description: 'CP Furniture order',
                order_id: gatewayOrder.id,
                prefill: { name: customerName, email: customerEmail, contact: customerPhone },
                handler: (response) => { void completeVerifiedPayment(response); },
                modal: { ondismiss: () => setIsProcessing(false) }
            });
            checkout.open();
        } catch (error) {
            setIsProcessing(false);
            setPaymentError(error instanceof Error ? error.message : 'Unable to open Razorpay Checkout.');
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-full max-w-md overflow-hidden rounded-2xl border border-amber-500/30 bg-stone-900 text-stone-100 shadow-2xl">
                <div className="flex items-center justify-between border-b border-stone-800 bg-stone-950 px-5 py-4">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-amber-500/30 bg-amber-500/10 text-lg font-bold text-amber-400">₹</div>
                        <div>
                            <h2 className="flex items-center gap-2 text-sm font-bold text-white"><ShieldCheck className="h-4 w-4 text-emerald-400" /> Secure Razorpay Checkout</h2>
                            <p className="text-xs text-stone-400">{RAZORPAY_CONFIG.businessName}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="rounded-lg p-2 text-stone-400 transition-colors hover:bg-stone-800 hover:text-white" aria-label="Close payment dialog">
                        <X className="h-4 w-4" />
                    </button>
                </div>

                <div className="space-y-5 p-5">
                    <div className="flex items-center justify-between border-b border-stone-800 pb-4">
                        <span className="text-sm text-stone-400">Order total</span>
                        <span className="font-mono text-2xl font-bold text-amber-400">₹{amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>

                    <div className="flex gap-3 rounded-xl border border-stone-800 bg-stone-950/70 p-4">
                        <Building2 className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
                        <p className="text-xs leading-5 text-stone-300">Choose an available payment method in Razorpay Checkout, including UPI apps, cards, netbanking, and wallets.</p>
                    </div>

                    {gatewayOrder && <p className="break-all font-mono text-[11px] text-stone-500">Order: {gatewayOrder.id}</p>}
                    {paymentError && (
                        <div className="flex items-start gap-2 rounded-lg border border-red-500/40 bg-red-950/30 p-3 text-xs text-red-200">
                            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                            <span>{paymentError}</span>
                        </div>
                    )}

                    <button
                        onClick={() => void handleOpenCheckout()}
                        disabled={!gatewayOrder || isProcessing}
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-amber-600 px-4 py-3.5 text-sm font-bold text-white transition-colors hover:bg-amber-500 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {isProcessing ? <><Loader2 className="h-4 w-4 animate-spin" /> Verifying payment...</> : <><CheckCircle2 className="h-4 w-4" /> Pay securely with Razorpay</>}
                    </button>

                    <div className="flex items-center justify-center gap-2 text-[11px] text-stone-500">
                        <Lock className="h-3 w-3 text-emerald-500" /> Payment is verified by the CP Furniture server
                    </div>
                </div>
            </div>
        </div>
    );
};
