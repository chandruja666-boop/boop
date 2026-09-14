import React, { useState, useEffect, useRef } from 'react';
import {
  Smartphone,
  ShieldCheck,
  ArrowRight,
  RotateCcw,
  CheckCircle2,
  Lock,
  MessageSquare,
  Sparkles,
  ChevronLeft,
  KeyRound,
  AlertCircle,
  Copy,
  Check
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { otpService, SendOTPResult } from '../../services/otpService';

interface OTPLoginFormProps {
  onSuccess?: () => void;
  onSwitchToPassword?: () => void;
  initialPhone?: string;
  isModal?: boolean;
}

export const OTPLoginForm: React.FC<OTPLoginFormProps> = ({
  onSuccess,
  onSwitchToPassword,
  initialPhone = '',
  isModal = false
}) => {
  const { loginCustomerWithPhone, showToast, setCurrentView } = useApp();

  // Step: 'phone' or 'otp'
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [countryCode, setCountryCode] = useState('+91');
  const [phone, setPhone] = useState(initialPhone || '9876543210');
  const [fullName, setFullName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // 6-digit OTP state
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Timer & Simulated SMS Toast
  const [countdown, setCountdown] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const [simulatedSms, setSimulatedSms] = useState<{
    otp: string;
    phone: string;
    sender: string;
  } | null>(null);
  const [copiedOtp, setCopiedOtp] = useState(false);

  // Focus first input on step change
  useEffect(() => {
    if (step === 'otp') {
      inputRefs.current[0]?.focus();
      setCountdown(30);
      setCanResend(false);
    }
  }, [step]);

  // Countdown timer for resend
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (step === 'otp' && countdown > 0) {
      timer = setTimeout(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else if (countdown === 0) {
      setCanResend(true);
    }
    return () => clearTimeout(timer);
  }, [step, countdown]);

  // Listen for custom SMS delivered events
  useEffect(() => {
    const handleSmsDelivered = (e: any) => {
      if (e.detail) {
        setSimulatedSms({
          otp: e.detail.otp,
          phone: e.detail.phone,
          sender: e.detail.formattedSender || 'CP-FURNTR'
        });
      }
    };

    window.addEventListener('cp-sms-otp-received', handleSmsDelivered);
    return () => {
      window.removeEventListener('cp-sms-otp-received', handleSmsDelivered);
    };
  }, []);

  // Format raw phone input
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '');
    if (val.length <= 10) {
      setPhone(val);
      setErrorMessage(null);
    }
  };

  // SEND OTP HANDLER
  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage(null);

    const cleanDigits = phone.replace(/\D/g, '');
    if (cleanDigits.length < 10) {
      setErrorMessage('Please enter a valid 10-digit Indian mobile number.');
      return;
    }

    setIsLoading(true);

    setTimeout(async () => {
      const fullPhone = `${countryCode} ${cleanDigits}`;
      const res: SendOTPResult = await otpService.sendOTP(fullPhone);
      setIsLoading(false);

      if (res.success) {
        setStep('otp');
        setOtpDigits(['', '', '', '', '', '']);
        showToast(`Verification code sent to ${res.normalizedPhone}`, 'info');

        // Show simulated SMS notification
        if (res.otp) {
          setSimulatedSms({
            otp: res.otp,
            phone: res.normalizedPhone,
            sender: 'CP-FURNTR'
          });
        }
      } else {
        setErrorMessage(res.message);
        showToast(res.message, 'error');
      }
    }, 600);
  };

  // RESEND OTP
  const handleResendOtp = async () => {
    if (!canResend) return;
    setErrorMessage(null);
    setIsLoading(true);

    setTimeout(async () => {
      const fullPhone = `${countryCode} ${phone}`;
      const res = await otpService.sendOTP(fullPhone);
      setIsLoading(false);
      setCountdown(30);
      setCanResend(false);

      if (res.success) {
        showToast(`New code dispatched to ${res.normalizedPhone}`, 'success');
        if (res.otp) {
          setSimulatedSms({
            otp: res.otp,
            phone: res.normalizedPhone,
            sender: 'CP-FURNTR'
          });
        }
      } else {
        setErrorMessage(res.message);
      }
    }, 500);
  };

  // Handle single digit input
  const handleDigitChange = (index: number, val: string) => {
    const char = val.slice(-1).replace(/\D/g, '');
    const newDigits = [...otpDigits];
    newDigits[index] = char;
    setOtpDigits(newDigits);
    setErrorMessage(null);

    // Auto-advance
    if (char && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-verify if all 6 digits are filled
    if (char && index === 5 && newDigits.every((d) => d !== '')) {
      const fullCode = newDigits.join('');
      handleVerifyCode(fullCode);
    }
  };

  // Handle backspace navigation
  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Handle pasting full 6 digits
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pastedData) return;

    const newDigits = ['', '', '', '', '', ''];
    for (let i = 0; i < pastedData.length; i++) {
      newDigits[i] = pastedData[i];
    }
    setOtpDigits(newDigits);

    if (pastedData.length === 6) {
      inputRefs.current[5]?.focus();
      handleVerifyCode(pastedData);
    } else {
      inputRefs.current[pastedData.length]?.focus();
    }
  };

  // Auto-fill from simulated SMS
  const handleAutoFill = (code: string) => {
    const chars = code.split('').slice(0, 6);
    const newDigits = ['', '', '', '', '', ''];
    chars.forEach((c, idx) => {
      newDigits[idx] = c;
    });
    setOtpDigits(newDigits);
    setCopiedOtp(true);
    setTimeout(() => setCopiedOtp(false), 2000);
    handleVerifyCode(code);
  };

  // VERIFY & SIGN IN
  const handleVerifyCode = async (codeToVerify?: string) => {
    const fullOtp = codeToVerify || otpDigits.join('');
    if (fullOtp.length !== 6) {
      setErrorMessage('Please enter all 6 digits.');
      return;
    }

    setErrorMessage(null);
    setIsLoading(true);

    setTimeout(async () => {
      const fullPhone = `${countryCode} ${phone}`;
      const verifyRes = await otpService.verifyOTP(fullPhone, fullOtp);

      if (verifyRes.success) {
        // Complete customer session in storage
        const ok = loginCustomerWithPhone(fullPhone, fullName || undefined);
        setIsLoading(false);

        if (ok) {
          showToast('Welcome to CP Furniture VIP Studio!', 'success');
          if (onSuccess) {
            onSuccess();
          } else {
            setCurrentView('account');
          }
        }
      } else {
        setIsLoading(false);
        setErrorMessage(verifyRes.message);
        showToast(verifyRes.message, 'error');
      }
    }, 600);
  };

  return (
    <div className={`space-y-6 ${isModal ? '' : 'max-w-md mx-auto'}`}>
      {/* Brand Header Banner */}
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl mx-auto flex items-center justify-center bg-gradient-to-br from-stone-900 via-stone-950 to-stone-900 border border-amber-500/30 text-amber-400 shadow-lg shadow-amber-900/10">
          <Smartphone className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h2 className="text-xl font-bold font-serif-luxury text-stone-900 tracking-tight flex items-center justify-center gap-1.5">
            <span>{step === 'phone' ? 'Instant Mobile Login' : 'Verify Mobile Access'}</span>
            <Sparkles className="w-4 h-4 text-amber-500" />
          </h2>
          <p className="text-xs text-stone-500 max-w-xs mx-auto">
            {step === 'phone'
              ? 'Enter your phone number to receive a 6-digit VIP verification code.'
              : `Enter the 6-digit OTP sent to ${countryCode} ${phone.slice(0, 5)} ${phone.slice(5)}`}
          </p>
        </div>
      </div>

      {/* Simulated Live SMS Alert Banner (For Testing & Real-time Evaluation) */}
      {simulatedSms && (
        <div className="p-3.5 bg-stone-950 rounded-2xl border border-amber-500/40 text-stone-200 shadow-xl relative overflow-hidden transition-all animate-fadeIn">
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-amber-600 via-amber-400 to-amber-600" />
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <div className="p-1.5 bg-amber-500/10 rounded-lg border border-amber-500/30 text-amber-400 shrink-0 mt-0.5">
                <MessageSquare className="w-4 h-4" />
              </div>
              <div className="text-left space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-amber-400">
                    SMS Gateway: {simulatedSms.sender}
                  </span>
                  <span className="text-[10px] text-stone-400">• Just now</span>
                </div>
                <p className="text-xs text-stone-300 font-mono">
                  Your CP Furniture OTP is{' '}
                  <strong className="text-amber-300 text-sm font-bold bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-500/30">
                    {simulatedSms.otp}
                  </strong>
                  . Valid for 5 mins.
                </p>
              </div>
            </div>

            {step === 'otp' && (
              <button
                type="button"
                onClick={() => handleAutoFill(simulatedSms.otp)}
                className="px-2.5 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/50 text-amber-300 rounded-lg font-bold text-[11px] transition-all cursor-pointer flex items-center gap-1 shrink-0 self-center hover:scale-105 active:scale-95"
              >
                {copiedOtp ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>Auto-Fill</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* STEP 1: ENTER PHONE NUMBER */}
      {step === 'phone' && (
        <form onSubmit={handleSendOtp} className="space-y-4">
          <div className="space-y-1.5 text-left">
            <label className="font-bold text-stone-700 text-xs flex items-center justify-between">
              <span>Mobile Phone Number</span>
              <span className="text-[11px] text-stone-400 font-normal">SMS verification</span>
            </label>

            <div className="flex gap-2">
              {/* Country Code Picker */}
              <div className="relative w-28 shrink-0">
                <select
                  value={countryCode}
                  onChange={(e) => setCountryCode(e.target.value)}
                  className="w-full h-11 px-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs font-semibold text-stone-800 focus:outline-none focus:border-amber-900 focus:ring-1 focus:ring-amber-900 appearance-none cursor-pointer"
                >
                  <option value="+91">🇮🇳 +91 (IN)</option>
                  <option value="+1">🇺🇸 +1 (US)</option>
                  <option value="+44">🇬🇧 +44 (UK)</option>
                  <option value="+971">🇦🇪 +971 (UAE)</option>
                  <option value="+65">🇸🇬 +65 (SG)</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-stone-500 text-[10px]">
                  ▼
                </div>
              </div>

              {/* 10-Digit Mobile Input */}
              <div className="relative flex-1">
                <input
                  id="otp-phone-input"
                  type="tel"
                  required
                  autoFocus
                  placeholder="98765 43210"
                  value={phone}
                  onChange={handlePhoneChange}
                  className="w-full h-11 px-3.5 bg-stone-50 border border-stone-300 rounded-xl text-sm font-mono tracking-wider font-semibold text-stone-900 focus:outline-none focus:border-amber-900 focus:ring-1 focus:ring-amber-900 focus:bg-white transition-all placeholder:text-stone-400"
                />
              </div>
            </div>
          </div>

          {/* Optional Name for first-time shoppers */}
          <div className="space-y-1 text-left">
            <label className="font-bold text-stone-700 text-xs flex items-center justify-between">
              <span>Your Name (Optional)</span>
              <span className="text-[10px] text-stone-400">For concierge greetings</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Rohan Verma"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full h-10 px-3 bg-stone-50 border border-stone-300 rounded-xl text-xs text-stone-800 focus:outline-none focus:border-amber-900"
            />
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-rose-700 text-xs animate-shake">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Send OTP CTA */}
          <button
            id="send-otp-submit-btn"
            type="submit"
            disabled={isLoading || phone.length < 10}
            className="w-full py-3 px-4 bg-gradient-to-r from-stone-900 via-stone-950 to-stone-900 hover:from-amber-950 hover:to-stone-900 text-white font-bold text-xs rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2 border border-stone-800 group"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <RotateCcw className="w-4 h-4 animate-spin text-amber-400" />
                <span>Dispatching SMS Code...</span>
              </div>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
                <span>Send 6-Digit OTP</span>
                <ArrowRight className="w-4 h-4 text-amber-400 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>

          {/* 1-Click Demo VIP Account Helper */}
          <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-left space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-stone-700">VIP Test Profile:</span>
              <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100/80 px-1.5 py-0.5 rounded">
                Verified Customer
              </span>
            </div>
            <button
              type="button"
              onClick={() => {
                setPhone('9876543210');
                setFullName('Rohan Verma');
                handleSendOtp();
              }}
              className="w-full py-1.5 px-2 bg-white hover:bg-amber-50 border border-stone-300 hover:border-amber-400 rounded-lg text-[11px] font-mono text-stone-800 transition-all flex items-center justify-between cursor-pointer group"
            >
              <span>+91 98765 43210 (Rohan Verma)</span>
              <span className="text-amber-900 font-bold group-hover:underline text-[10px]">1-Click OTP &rarr;</span>
            </button>
          </div>
        </form>
      )}

      {/* STEP 2: ENTER 6-DIGIT OTP */}
      {step === 'otp' && (
        <div className="space-y-5 animate-fadeIn">
          {/* Change phone header */}
          <div className="flex items-center justify-between bg-stone-100 p-2.5 rounded-xl border border-stone-200 text-xs">
            <div className="flex items-center gap-1.5 text-stone-700 font-mono font-bold">
              <Smartphone className="w-3.5 h-3.5 text-amber-800" />
              <span>{countryCode} {phone}</span>
            </div>
            <button
              type="button"
              onClick={() => {
                setStep('phone');
                setErrorMessage(null);
              }}
              className="text-amber-900 font-semibold hover:underline flex items-center gap-1 text-[11px] cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Change Number</span>
            </button>
          </div>

          {/* 6 Digit Input Boxes */}
          <div className="space-y-2">
            <label className="font-bold text-stone-700 text-xs block text-left">
              Enter 6-Digit Verification Code:
            </label>

            <div className="flex justify-between gap-1.5 sm:gap-2.5" onPaste={handlePaste}>
              {otpDigits.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => {
                    inputRefs.current[index] = el;
                  }}
                  id={`otp-digit-${index}`}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleDigitChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className={`w-11 h-13 sm:w-12 sm:h-14 text-center font-mono text-xl font-extrabold rounded-xl border transition-all focus:outline-none ${digit
                    ? 'bg-stone-900 text-amber-400 border-amber-600 ring-2 ring-amber-500/20 shadow-md'
                    : 'bg-stone-50 text-stone-900 border-stone-300 focus:border-amber-900 focus:bg-white focus:ring-2 focus:ring-amber-900/10'
                    }`}
                />
              ))}
            </div>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-rose-700 text-xs animate-shake">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Verify CTA */}
          <button
            id="verify-otp-submit-btn"
            type="button"
            disabled={isLoading || otpDigits.some((d) => d === '')}
            onClick={() => handleVerifyCode()}
            className="w-full py-3.5 px-4 bg-gradient-to-r from-stone-900 via-stone-950 to-stone-900 hover:from-amber-950 hover:to-stone-900 text-white font-bold text-xs rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2 border border-stone-800 group"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <RotateCcw className="w-4 h-4 animate-spin text-amber-400" />
                <span>Authenticating Session...</span>
              </div>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
                <span>Verify OTP & Sign In</span>
                <ArrowRight className="w-4 h-4 text-amber-400 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>

          {/* Resend OTP Row */}
          <div className="flex items-center justify-between text-xs pt-1">
            <span className="text-stone-500">Didn't receive SMS code?</span>
            {canResend ? (
              <button
                type="button"
                onClick={handleResendOtp}
                className="text-amber-900 font-bold hover:underline cursor-pointer flex items-center gap-1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Resend OTP</span>
              </button>
            ) : (
              <span className="text-stone-400 font-mono text-[11px]">
                Resend in 0:{countdown < 10 ? `0${countdown}` : countdown}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Switch to Password Login */}
      {onSwitchToPassword && (
        <div className="pt-4 border-t border-stone-200 text-center">
          <button
            type="button"
            onClick={onSwitchToPassword}
            className="text-xs text-stone-600 hover:text-stone-900 font-medium flex items-center justify-center gap-1.5 mx-auto cursor-pointer"
          >
            <KeyRound className="w-3.5 h-3.5 text-stone-500" />
            <span>Prefer Password Sign In? Use Email & Password</span>
          </button>
        </div>
      )}
    </div>
  );
};
