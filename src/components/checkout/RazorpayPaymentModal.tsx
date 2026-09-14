import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  ExternalLink,
  QrCode,
  Smartphone,
  CreditCard,
  Building2,
  CheckCircle2,
  Copy,
  Check,
  Loader2,
  Lock,
  ArrowRight,
  X,
  AlertCircle,
  Sparkles
} from 'lucide-react';
import { Address, RAZORPAY_CONFIG } from '../../types';
import { UPIQRCodeDisplay } from './UPIQRCodeDisplay';
import { cloudApi } from '../../services/cloudApi';

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  prefill: { name: string; email: string; contact: string };
  handler: (response: { razorpay_payment_id: string; razorpay_order_id: string; razorpay_signature: string }) => void;
  modal: { ondismiss: () => void };
}

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => { open: () => void };
  }
}

interface RazorpayPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
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
  shippingAddress?: Address;
}

export const RazorpayPaymentModal: React.FC<RazorpayPaymentModalProps> = ({
  isOpen,
  onClose,
  amount,
  customerName,
  customerPhone,
  customerEmail,
  onPaymentSuccess,
  shippingAddress
}) => {
  const [activeTab, setActiveTab] = useState<'qr' | 'upi' | 'portal' | 'card'>('qr');
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [utrNumber, setUtrNumber] = useState('');
  const [gatewayOrder, setGatewayOrder] = useState<{ id: string; testMode?: boolean; keyId?: string } | null>(null);
  const [paymentError, setPaymentError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setPaymentError('');
      setGatewayOrder(null);
      setUtrNumber(`RPZ${Date.now().toString().slice(-8)}`);
      setIsVerifying(false);
      cloudApi.createRazorpayOrder(amount, `cpfurniture-${Date.now()}`)
        .then((order) => setGatewayOrder({ id: order.id, testMode: order.testMode, keyId: order.keyId }))
        .catch((error) => setPaymentError(error instanceof Error ? error.message : 'Unable to initialize Razorpay securely.'));
    }
  }, [amount, isOpen]);

  if (!isOpen) return null;

  const upiDeepLink = `upi://pay?pa=${encodeURIComponent(RAZORPAY_CONFIG.upiId)}&pn=${encodeURIComponent(
    RAZORPAY_CONFIG.businessName
  )}&am=${Number(amount).toFixed(2)}&cu=INR&tn=${encodeURIComponent('CP Furniture Showroom Order')}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(RAZORPAY_CONFIG.paymentUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(RAZORPAY_CONFIG.upiId);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  const handleOpenRazorpayPortal = () => {
    window.open(RAZORPAY_CONFIG.paymentUrl, '_blank', 'noopener,noreferrer');
  };

  const completeVerifiedPayment = async (paymentId: string, method: string) => {
    if (!gatewayOrder) {
      setPaymentError('Secure payment order is not ready. Please try again.');
      return;
    }
    setIsVerifying(true);
    try {
      const verification = await cloudApi.verifyRazorpayPayment(gatewayOrder.id, paymentId, gatewayOrder.testMode ? 'test' : '', amount);
      if (!verification.verified) {
        throw new Error('Payment verification failed. No order was placed.');
      }
      setIsVerifying(false);
      onPaymentSuccess({
        paymentId,
        orderId: gatewayOrder.id,
        handle: RAZORPAY_CONFIG.merchantHandle,
        method,
        bankSettlement: RAZORPAY_CONFIG.settlementType
      });
    } catch (error) {
      setIsVerifying(false);
      setPaymentError(error instanceof Error ? error.message : 'Payment verification failed.');
    }
  };

  const handleConfirmPayment = () => {
    if (!gatewayOrder) {
      setPaymentError('Secure payment order is not ready. Please try again.');
      return;
    }
    if (gatewayOrder.testMode) {
      void completeVerifiedPayment(`pay_test_${Date.now()}`, activeTab === 'qr' || activeTab === 'upi' ? 'Razorpay UPI (test)' : 'Razorpay Gateway (test)');
      return;
    }
    if (!window.Razorpay || !gatewayOrder.keyId) {
      setPaymentError('Razorpay Checkout is unavailable. Check the production key configuration.');
      return;
    }
    const checkout = new window.Razorpay({
      key: gatewayOrder.keyId,
      amount: Math.round(amount * 100),
      currency: 'INR',
      name: 'CP Furniture',
      description: 'CP Furniture order',
      order_id: gatewayOrder.id,
      prefill: { name: customerName, email: customerEmail, contact: customerPhone },
      handler: (response: { razorpay_payment_id: string; razorpay_order_id: string; razorpay_signature: string }) => {
        void cloudApi.verifyRazorpayPayment(response.razorpay_order_id, response.razorpay_payment_id, response.razorpay_signature, amount)
          .then((verification) => {
            if (!verification.verified) throw new Error('Razorpay signature verification failed.');
            onPaymentSuccess({ paymentId: response.razorpay_payment_id, orderId: response.razorpay_order_id, handle: RAZORPAY_CONFIG.merchantHandle, method: 'Razorpay Checkout', bankSettlement: RAZORPAY_CONFIG.settlementType });
          })
          .catch((error) => setPaymentError(error instanceof Error ? error.message : 'Payment verification failed.'));
      },
      modal: { ondismiss: () => setPaymentError('Payment was cancelled before verification.') }
    });
    checkout.open();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="bg-stone-900 border border-amber-500/30 text-stone-100 rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Razorpay & CP Furniture branding */}
        <div className="bg-gradient-to-r from-stone-950 via-stone-900 to-amber-950/60 p-5 sm:p-6 border-b border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-black text-lg">
              ₹
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base text-white tracking-wide">Razorpay Secured Gateway</span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> Verified
                </span>
              </div>
              <p className="text-xs text-amber-200/80 font-mono">
                {RAZORPAY_CONFIG.merchantHandle} &bull; {RAZORPAY_CONFIG.merchantName}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-stone-800/80 hover:bg-stone-700 text-stone-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close Razorpay Modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Amount to Pay Banner */}
        <div className="bg-stone-950/70 px-6 py-4 border-b border-stone-800/60 flex items-center justify-between">
          <div>
            <span className="text-xs text-stone-400 block">Total Order Payable</span>
            <span className="text-2xl sm:text-3xl font-black text-amber-400 font-mono">
              ₹{amount.toLocaleString()}
            </span>
          </div>
          <div className="text-right">
            <span className="text-[11px] text-stone-400 block">Settlement Destination</span>
            <span className="text-xs font-semibold text-stone-200 flex items-center gap-1 justify-end">
              <Building2 className="w-3.5 h-3.5 text-amber-400" /> Registered Bank Account
            </span>
          </div>
        </div>

        {/* Payment Navigation Tabs */}
        <div className="flex border-b border-stone-800 bg-stone-950/40 p-2 gap-1.5 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('qr')}
            className={`flex-1 py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${activeTab === 'qr'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
              : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/50'
              }`}
          >
            <QrCode className="w-4 h-4" />
            <span>Scan QR Code</span>
          </button>

          <button
            onClick={() => setActiveTab('upi')}
            className={`flex-1 py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${activeTab === 'upi'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
              : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/50'
              }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>UPI Apps</span>
          </button>

          <button
            onClick={() => setActiveTab('portal')}
            className={`flex-1 py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${activeTab === 'portal'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
              : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/50'
              }`}
          >
            <ExternalLink className="w-4 h-4" />
            <span>Razorpay Link</span>
          </button>

          <button
            onClick={() => setActiveTab('card')}
            className={`flex-1 py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${activeTab === 'card'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
              : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/50'
              }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>Card / NetBanking</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {paymentError && (
            <div className="p-3 rounded-xl border border-red-500/40 bg-red-950/30 text-red-200 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{paymentError}</span>
            </div>
          )}
          {/* TAB 1: QR CODE */}
          {activeTab === 'qr' && (
            <div className="space-y-4">
              <UPIQRCodeDisplay
                amount={amount}
                customerName={customerName}
                customerPhone={customerPhone}
                shippingAddress={shippingAddress}
                onPaymentConfirmed={(utr) => {
                  setUtrNumber(utr);
                  if (gatewayOrder?.testMode) {
                    void completeVerifiedPayment(utr || `pay_test_${Date.now()}`, 'Razorpay UPI QR (test)');
                  } else {
                    setPaymentError('Manual UTR confirmation is unavailable in production. Complete payment through Razorpay Checkout so the signature can be verified.');
                  }
                }}
              />
            </div>
          )}

          {/* TAB 2: ONE-CLICK UPI APPS */}
          {activeTab === 'upi' && (
            <div className="space-y-4">
              <p className="text-xs text-stone-400">
                Choose your preferred UPI application to route ₹{amount.toLocaleString()} directly to{' '}
                <strong className="text-amber-300">{RAZORPAY_CONFIG.merchantHandle}</strong>:
              </p>

              <div className="grid grid-cols-2 gap-3">
                {[
                  { name: 'Google Pay', color: 'border-blue-500/40 bg-blue-950/20 text-blue-300' },
                  { name: 'PhonePe', color: 'border-purple-500/40 bg-purple-950/20 text-purple-300' },
                  { name: 'Paytm UPI', color: 'border-sky-500/40 bg-sky-950/20 text-sky-300' },
                  { name: 'BHIM / CRED', color: 'border-emerald-500/40 bg-emerald-950/20 text-emerald-300' },
                  { name: 'Amazon Pay', color: 'border-amber-500/40 bg-amber-950/20 text-amber-300' },
                  { name: 'Any Other UPI App', color: 'border-stone-500/40 bg-stone-800/40 text-stone-300' }
                ].map((app) => (
                  <a
                    key={app.name}
                    href={upiDeepLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`p-3.5 rounded-2xl border flex items-center justify-between transition-all hover:scale-[1.02] cursor-pointer ${app.color}`}
                  >
                    <span className="text-xs font-bold">{app.name}</span>
                    <ExternalLink className="w-3.5 h-3.5 opacity-70" />
                  </a>
                ))}
              </div>

              <div className="p-3.5 bg-stone-950 rounded-xl border border-stone-800 text-[11px] text-stone-400 space-y-1">
                <div className="flex items-center justify-between">
                  <span>Merchant Razorpay VPA:</span>
                  <span className="font-mono text-amber-300 font-bold">{RAZORPAY_CONFIG.upiId}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Payee Name:</span>
                  <span className="text-stone-200 font-semibold">{RAZORPAY_CONFIG.merchantName} (CP Furniture)</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: RAZORPAY PAYMENT LINK & PORTAL */}
          {activeTab === 'portal' && (
            <div className="space-y-4">
              <div className="p-5 bg-stone-950 rounded-2xl border border-amber-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-400">Direct Razorpay Portal</span>
                  <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded font-mono">
                    256-Bit SSL
                  </span>
                </div>

                <p className="text-xs text-stone-300">
                  You can complete your purchase directly on the official Razorpay payment page created for Anandhan
                  Chandru:
                </p>

                <div className="p-3 bg-stone-900 rounded-xl border border-stone-800 font-mono text-xs text-amber-300 break-all flex items-center justify-between gap-2">
                  <span>{RAZORPAY_CONFIG.paymentUrl}</span>
                  <button
                    onClick={handleCopyLink}
                    className="shrink-0 p-1.5 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded transition-colors"
                    title="Copy Link"
                  >
                    {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>

                <button
                  onClick={handleOpenRazorpayPortal}
                  className="w-full py-3 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white text-xs font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Open {RAZORPAY_CONFIG.merchantHandle} in New Tab</span>
                </button>
              </div>

              <div className="text-[11px] text-stone-400 space-y-1">
                <p>&bull; Supports Credit/Debit Cards (Visa, Mastercard, RuPay, Amex)</p>
                <p>&bull; Supports NetBanking across 50+ Indian Banks & Wallets</p>
                <p>&bull; Auto-settles directly into the registered business bank account</p>
              </div>
            </div>
          )}

          {/* TAB 4: CARD / NETBANKING GATEWAY */}
          {activeTab === 'card' && (
            <div className="space-y-4">
              <div className="p-4 bg-stone-950 rounded-2xl border border-stone-800 space-y-3">
                <div className="flex items-center justify-between text-xs text-stone-400">
                  <span>Gateway Provider:</span>
                  <span className="font-bold text-white">Razorpay Payments System</span>
                </div>
                <div className="flex items-center justify-between text-xs text-stone-400">
                  <span>Direct Account:</span>
                  <span className="font-mono text-amber-400 font-bold">{RAZORPAY_CONFIG.merchantHandle}</span>
                </div>
                <div className="flex items-center justify-between text-xs text-stone-400">
                  <span>Settlement Route:</span>
                  <span className="text-emerald-400 font-semibold">{RAZORPAY_CONFIG.settlementType}</span>
                </div>
              </div>

              <p className="text-xs text-stone-300">
                Cards, International Payments, and Corporate NetBanking will be processed securely via Razorpay's
                certified gateway.
              </p>

              <button
                onClick={handleOpenRazorpayPortal}
                className="w-full py-3.5 bg-stone-800 hover:bg-stone-700 border border-stone-700 text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <CreditCard className="w-4 h-4 text-amber-400" />
                <span>Launch Razorpay Card & NetBanking Window &rarr;</span>
              </button>
            </div>
          )}

          {/* Confirmation & Order Placement Section */}
          <div className="pt-4 border-t border-stone-800 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <label className="text-stone-400 font-semibold">Razorpay Transaction Reference / UTR ID:</label>
              <span className="font-mono text-[11px] text-amber-400/90">{gatewayOrder?.id || 'Awaiting secure order'}</span>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={utrNumber}
                onChange={(e) => setUtrNumber(e.target.value)}
                placeholder="e.g. UTR / Razorpay Ref #12345678"
                className="flex-1 p-2.5 bg-stone-950 border border-stone-800 text-stone-100 rounded-xl text-xs font-mono focus:outline-none focus:border-amber-500"
              />
            </div>

            <button
              onClick={handleConfirmPayment}
              disabled={isVerifying}
              className="w-full py-4 bg-gradient-to-r from-amber-600 via-amber-700 to-amber-800 hover:from-amber-500 hover:to-amber-700 text-white text-sm font-bold rounded-xl shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {isVerifying ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Verifying Razorpay Bank Settlement...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                  <span>I Have Completed Payment &bull; Confirm Order</span>
                </>
              )}
            </button>

            <div className="flex items-center justify-center gap-4 text-[10px] text-stone-500 pt-1">
              <span className="flex items-center gap-1">
                <Lock className="w-3 h-3 text-emerald-500" /> 256-Bit SSL Encrypted
              </span>
              <span>&bull;</span>
              <span className="flex items-center gap-1">
                <Building2 className="w-3 h-3 text-amber-500" /> Direct Bank Settlement
              </span>
              <span>&bull;</span>
              <span>Instant Invoice Generated</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
