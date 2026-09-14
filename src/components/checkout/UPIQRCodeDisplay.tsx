import React, { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import {
  QrCode,
  Smartphone,
  ExternalLink,
  Copy,
  Check,
  ShieldCheck,
  Building2,
  Download,
  Sparkles,
  ArrowUpRight,
  Info,
  CheckCircle2,
  Lock,
  MapPin
} from 'lucide-react';
import { Address, RAZORPAY_CONFIG } from '../../types';

interface UPIQRCodeDisplayProps {
  amount: number;
  customerName?: string;
  customerPhone?: string;
  onPaymentConfirmed?: (utrNumber: string) => void;
  isCompact?: boolean;
  shippingAddress?: Address;
}

export const UPIQRCodeDisplay: React.FC<UPIQRCodeDisplayProps> = ({
  amount,
  customerName,
  customerPhone,
  onPaymentConfirmed,
  isCompact = false,
  shippingAddress
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [qrType, setQrType] = useState<'upi' | 'razorpay'>('upi');
  const [qrError, setQrError] = useState<string | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [utrInput, setUtrInput] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  // Standard UPI URI format with exact amount & merchant details
  const formattedAmount = Number(amount).toFixed(2);
  const upiPayload = `upi://pay?pa=${encodeURIComponent(
    RAZORPAY_CONFIG.upiId
  )}&pn=${encodeURIComponent(
    RAZORPAY_CONFIG.businessName
  )}&am=${formattedAmount}&cu=INR&tn=${encodeURIComponent('CP Furniture Order')}`;

  // Direct Razorpay handle URL
  const razorpayUrl = RAZORPAY_CONFIG.paymentUrl;

  const currentPayload = qrType === 'upi' ? upiPayload : razorpayUrl;

  // Render QR Code onto Canvas and export high-res data URL
  useEffect(() => {
    if (!canvasRef.current) return;

    QRCode.toCanvas(
      canvasRef.current,
      currentPayload,
      {
        width: isCompact ? 200 : 240,
        margin: 1.5,
        color: {
          dark: '#1c1917', // Dark stone for maximum scanner contrast
          light: '#ffffff'  // Pure crisp white background
        },
        errorCorrectionLevel: 'H' // High error tolerance for center logo
      },
      (err) => {
        if (err) {
          console.error('QR Generation failed:', err);
          setQrError('Failed to render QR Code');
        } else {
          setQrError(null);
          try {
            if (canvasRef.current) {
              setQrDataUrl(canvasRef.current.toDataURL('image/png'));
            }
          } catch (e) {
            console.error('Error getting data URL', e);
          }
        }
      }
    );
  }, [currentPayload, amount, isCompact]);

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(RAZORPAY_CONFIG.upiId);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(razorpayUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleDownloadQR = () => {
    if (!qrDataUrl) return;
    const link = document.createElement('a');
    link.download = `CP-Furniture-Razorpay-QR-₹${amount}.png`;
    link.href = qrDataUrl;
    link.click();
  };

  const handleConfirmUTR = (e: React.FormEvent) => {
    e.preventDefault();
    if (!utrInput.trim()) return;
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      if (onPaymentConfirmed) {
        onPaymentConfirmed(utrInput.trim());
      }
    }, 800);
  };

  return (
    <div
      id="upi-qr-payment-card"
      className="bg-gradient-to-br from-stone-950 via-stone-900 to-amber-950/40 rounded-3xl border border-amber-500/30 text-stone-100 p-5 sm:p-7 shadow-2xl space-y-6 animate-in fade-in zoom-in-95 duration-200"
    >
      {/* Top Banner: Beneficiary & Amount Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-stone-800">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-serif-luxury font-black text-2xl shadow-inner shrink-0">
            ₹
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="font-bold text-base text-white tracking-wide">
                Instant UPI & QR Payment
              </h4>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-full uppercase tracking-wider">
                <ShieldCheck className="w-3 h-3 text-emerald-400" /> Razorpay Verified
              </span>
            </div>
            <p className="text-xs text-amber-200/90 font-mono mt-0.5">
              Merchant UPI ID: <strong className="text-amber-300">{RAZORPAY_CONFIG.upiId}</strong> &bull; {RAZORPAY_CONFIG.businessName}
            </p>
          </div>
        </div>

        <div className="bg-stone-900/90 border border-amber-500/30 rounded-2xl px-4 py-2.5 sm:text-right shadow-inner">
          <span className="text-[10px] text-stone-400 uppercase tracking-widest block font-medium">
            Exact Cart Amount
          </span>
          <span className="text-xl sm:text-2xl font-black text-amber-400 font-mono">
            ₹{amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>
      </div>

      {/* Main Grid: QR Code Visualizer (Left) + 1-Click Pay & Deep Links (Right) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        {/* Left: Interactive Scannable Canvas QR with Gold Frame */}
        <div className="md:col-span-6 flex flex-col items-center justify-center text-center space-y-3">
          {/* Format selector pill */}
          <div className="inline-flex p-1 bg-stone-900 border border-stone-800 rounded-xl text-xs font-semibold">
            <button
              type="button"
              onClick={() => setQrType('upi')}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${qrType === 'upi'
                  ? 'bg-amber-500 text-stone-950 font-bold shadow-sm'
                  : 'text-stone-400 hover:text-stone-200'
                }`}
            >
              Exact Amount UPI QR
            </button>
            <button
              type="button"
              onClick={() => setQrType('razorpay')}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${qrType === 'razorpay'
                  ? 'bg-amber-500 text-stone-950 font-bold shadow-sm'
                  : 'text-stone-400 hover:text-stone-200'
                }`}
            >
              Razorpay Page QR
            </button>
          </div>

          {/* Luxury Frame Container for Scannable QR */}
          <div className="relative p-3.5 bg-gradient-to-b from-stone-900 via-stone-850 to-stone-950 rounded-2xl border-2 border-amber-500/50 shadow-2xl shadow-amber-950/40 group">
            {/* Corner Decorative Gold Accents */}
            <div className="absolute top-1.5 left-1.5 w-3 h-3 border-t-2 border-l-2 border-amber-400 rounded-tl-sm pointer-events-none" />
            <div className="absolute top-1.5 right-1.5 w-3 h-3 border-t-2 border-r-2 border-amber-400 rounded-tr-sm pointer-events-none" />
            <div className="absolute bottom-1.5 left-1.5 w-3 h-3 border-b-2 border-l-2 border-amber-400 rounded-bl-sm pointer-events-none" />
            <div className="absolute bottom-1.5 right-1.5 w-3 h-3 border-b-2 border-r-2 border-amber-400 rounded-br-sm pointer-events-none" />

            {/* High-Contrast White Scanning Surface */}
            <div className="bg-white p-3 rounded-xl relative shadow-inner overflow-hidden flex items-center justify-center">
              <canvas
                ref={canvasRef}
                className="w-48 h-48 sm:w-56 sm:h-56 block rounded-lg cursor-pointer"
                title={`Scan to pay ₹${amount.toLocaleString()} directly via Razorpay`}
              />

              {/* Center CP Furniture Badge */}
              <div className="absolute inset-0 m-auto w-10 h-10 rounded-xl bg-stone-950 border-2 border-amber-400 flex items-center justify-center shadow-lg pointer-events-none">
                <span className="font-serif-luxury font-black text-xs text-amber-400">CP</span>
              </div>
            </div>

            {/* Scan Guidance Tag */}
            <div className="mt-2.5 flex items-center justify-center gap-1.5 text-[11px] font-semibold text-amber-300">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Scan with Google Pay, PhonePe, Paytm or BHIM</span>
            </div>
          </div>

          {/* Action Row below QR: Download & Live Status */}
          <div className="flex items-center gap-3 text-xs">
            <button
              type="button"
              onClick={handleDownloadQR}
              className="px-3 py-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-300 hover:text-white border border-stone-800 flex items-center gap-1.5 transition-all text-[11px] cursor-pointer"
              title="Save QR image to scan from another device"
            >
              <Download className="w-3.5 h-3.5 text-amber-400" />
              <span>Save QR Code</span>
            </button>

            <span className="text-[11px] text-stone-400 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Live Razorpay Node</span>
            </span>
          </div>
        </div>

        {/* Right: Instant UPI Deep Link Buttons & Direct Payment Gateways */}
        <div className="md:col-span-6 space-y-4">
          {/* Primary 1-Click Mobile Deep Link */}
          <div>
            <span className="text-[11px] font-bold text-amber-300 uppercase tracking-wider block mb-2">
              Mobile Instant 1-Click Payment
            </span>
            <a
              id="upi-instant-app-btn"
              href={upiPayload}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:from-amber-400 hover:to-amber-600 text-stone-950 font-black text-xs sm:text-sm rounded-2xl shadow-lg shadow-amber-950/50 flex items-center justify-center gap-2 transition-all transform active:scale-95 cursor-pointer"
            >
              <Smartphone className="w-4 h-4 text-stone-950" />
              <span>Open Google Pay / PhonePe / Any UPI</span>
              <ArrowUpRight className="w-4 h-4 text-stone-950" />
            </a>
          </div>

          {/* Quick App Badges Grid */}
          <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
            <a
              href={upiPayload}
              className="p-3 bg-stone-900/90 hover:bg-stone-850 border border-stone-800 hover:border-blue-500/50 text-stone-200 rounded-xl flex items-center justify-between transition-all cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-400" />
                <span>Google Pay</span>
              </div>
              <ArrowUpRight className="w-3.5 h-3.5 text-stone-400" />
            </a>

            <a
              href={upiPayload}
              className="p-3 bg-stone-900/90 hover:bg-stone-850 border border-stone-800 hover:border-purple-500/50 text-stone-200 rounded-xl flex items-center justify-between transition-all cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-purple-400" />
                <span>PhonePe</span>
              </div>
              <ArrowUpRight className="w-3.5 h-3.5 text-stone-400" />
            </a>

            <a
              href={upiPayload}
              className="p-3 bg-stone-900/90 hover:bg-stone-850 border border-stone-800 hover:border-sky-500/50 text-stone-200 rounded-xl flex items-center justify-between transition-all cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-sky-400" />
                <span>Paytm UPI</span>
              </div>
              <ArrowUpRight className="w-3.5 h-3.5 text-stone-400" />
            </a>

            <a
              href={upiPayload}
              className="p-3 bg-stone-900/90 hover:bg-stone-850 border border-stone-800 hover:border-emerald-500/50 text-stone-200 rounded-xl flex items-center justify-between transition-all cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>BHIM / CRED</span>
              </div>
              <ArrowUpRight className="w-3.5 h-3.5 text-stone-400" />
            </a>
          </div>

          {/* Copyable VPA & Razorpay Portal Link Box */}
          <div className="p-4 bg-stone-900/80 rounded-2xl border border-stone-800 space-y-2.5 text-xs">
            {/* VPA Copy Row */}
            <div className="flex items-center justify-between gap-2">
              <span className="text-stone-400 font-medium">Merchant UPI VPA:</span>
              <div className="flex items-center gap-2">
                <code className="font-mono text-amber-300 font-bold bg-stone-950 px-2 py-1 rounded border border-stone-800">
                  {RAZORPAY_CONFIG.upiId}
                </code>
                <button
                  type="button"
                  onClick={handleCopyUpi}
                  className="p-1.5 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-lg transition-colors cursor-pointer"
                  title="Copy UPI VPA"
                >
                  {copiedUpi ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>

            {/* Razorpay Handle Direct Link Row */}
            <div className="flex items-center justify-between gap-2 pt-2 border-t border-stone-800/80">
              <span className="text-stone-400 font-medium">Razorpay URL:</span>
              <div className="flex items-center gap-2">
                <a
                  href={razorpayUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-amber-300/90 hover:text-amber-200 text-[11px] underline flex items-center gap-1 cursor-pointer"
                >
                  <span>{RAZORPAY_CONFIG.merchantHandle}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="p-1.5 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-lg transition-colors cursor-pointer"
                  title="Copy Razorpay Link"
                >
                  {copiedLink ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Settlement Route Assurance */}
          <div className="flex items-center justify-between text-[11px] text-stone-400 px-1">
            <span className="flex items-center gap-1 text-emerald-400 font-medium">
              <ShieldCheck className="w-3.5 h-3.5" /> 100% Direct Bank Settlement
            </span>
            <span className="flex items-center gap-1 text-stone-300 font-medium">
              <Lock className="w-3.5 h-3.5 text-amber-400" /> 0% Convenience Fee
            </span>
          </div>
        </div>
      </div>

      {/* Target Shipping Address Visualizer */}
      {shippingAddress && (
        <div className="p-4 bg-stone-950/90 border border-amber-500/20 rounded-2xl text-[11px] text-stone-300 space-y-1.5 shadow-inner">
          <div className="flex items-center gap-1.5 text-amber-400 font-bold uppercase tracking-widest text-[10px]">
            <MapPin className="w-4 h-4 text-amber-400 animate-pulse" />
            <span>Target Delivery & White-Glove Installation Destination:</span>
          </div>
          <div className="pl-5 space-y-1">
            <p className="font-bold text-white text-xs">{shippingAddress.name} &bull; {shippingAddress.phone}</p>
            <p className="text-stone-400 font-medium leading-relaxed">
              {shippingAddress.apartment ? `${shippingAddress.apartment}, ` : ''}
              {shippingAddress.street}, {shippingAddress.city}, {shippingAddress.state} - {shippingAddress.pincode}
            </p>
          </div>
        </div>
      )}

      {/* Optional UTR / Instant Confirmation Footer */}
      {onPaymentConfirmed && (
        <form onSubmit={handleConfirmUTR} className="pt-4 border-t border-stone-800 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <label htmlFor="upi-utr-input" className="text-xs font-bold text-stone-300 flex items-center gap-1.5">
              <span>Enter UPI Transaction Reference / UTR (Optional for instant validation):</span>
            </label>
            <span className="text-[10px] text-stone-500 font-mono">12-Digit Banking Ref</span>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <input
              id="upi-utr-input"
              type="text"
              value={utrInput}
              onChange={(e) => setUtrInput(e.target.value)}
              placeholder="e.g. 423589124578 or RPZ987654"
              className="flex-1 p-3 bg-stone-950 border border-stone-800 focus:border-amber-500 rounded-xl text-xs font-mono text-stone-100 placeholder:text-stone-600 focus:outline-none"
            />
            <button
              type="submit"
              disabled={isVerifying}
              className="px-5 py-3 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-md cursor-pointer disabled:opacity-50 active:scale-95"
            >
              {isVerifying ? (
                <span>Verifying...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 text-stone-950" />
                  <span>Confirm UPI Transfer</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
