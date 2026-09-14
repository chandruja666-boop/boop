import React, { useState } from 'react';
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  ShieldCheck,
  Truck,
  RotateCcw,
  Sparkles,
  Lock,
  CreditCard,
  Heart,
  CheckCircle2,
  Send,
  Gift,
  Copy,
  Check,
  AlertCircle,
  ArrowRight,
  Boxes
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { storage } from '../../services/storage';

export const Footer: React.FC = () => {
  const { setCurrentView, selectCategoryFromHome, websiteContent, categories, showToast } = useApp();

  // Newsletter Subscription state
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscribedEmail, setSubscribedEmail] = useState('');
  const [copiedCode, setCopiedCode] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Handle newsletter submission
  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const cleanEmail = newsletterEmail.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!cleanEmail || !emailRegex.test(cleanEmail)) {
      setErrorMessage('Please enter a valid email address (e.g. yourname@example.com).');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      const result = storage.addNewsletterSubscriber(cleanEmail, 'footer_newsletter');
      setIsSubmitting(false);
      setIsSubscribed(true);
      setSubscribedEmail(cleanEmail);
      setNewsletterEmail('');

      if (result.alreadySubscribed) {
        showToast('Welcome back! You are already enrolled in CP VIP Previews. Here is your voucher code.', 'info');
      } else {
        showToast('Successfully subscribed to CP VIP Club! Voucher WELCOME25 unlocked.', 'success');
      }
    }, 400);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText('WELCOME25');
    setCopiedCode(true);
    showToast('Promo code WELCOME25 copied to clipboard!', 'success');
    setTimeout(() => setCopiedCode(false), 3000);
  };

  return (
    <footer className="bg-stone-900 text-stone-300 pt-16 pb-24 md:pb-12 border-t border-stone-800">
      {/* Value Badges Banner */}
      <div className="max-w-7xl 2xl:max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 border-b border-stone-800">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-stone-800 flex items-center justify-center text-amber-400 mb-3">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h4 className="font-semibold text-white text-sm">10-Year Warranty</h4>
            <p className="text-xs text-stone-400 mt-1">Guaranteed authentic seasoned teak & sheesham</p>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-stone-800 flex items-center justify-center text-amber-400 mb-3">
              <Truck className="w-6 h-6" />
            </div>
            <h4 className="font-semibold text-white text-sm">White-Glove Assembly</h4>
            <p className="text-xs text-stone-400 mt-1">Free delivery and room placement by specialists</p>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-stone-800 flex items-center justify-center text-amber-400 mb-3">
              <RotateCcw className="w-6 h-6" />
            </div>
            <h4 className="font-semibold text-white text-sm">30-Day Easy Trial</h4>
            <p className="text-xs text-stone-400 mt-1">100% money back guarantee on mattresses & sofas</p>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-stone-800 flex items-center justify-center text-amber-400 mb-3">
              <CreditCard className="w-6 h-6" />
            </div>
            <h4 className="font-semibold text-white text-sm">No-Cost EMI</h4>
            <p className="text-xs text-stone-400 mt-1">Up to 12 months 0% interest on major banks</p>
          </div>
        </div>
      </div>

      {/* Newsletter Subscription Section (Promotional Marketing) */}
      <div id="footer-newsletter-section" className="max-w-7xl 2xl:max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12 border-b border-stone-800">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-stone-950 via-stone-900 to-amber-950/40 border border-amber-500/30 p-6 sm:p-10 lg:p-12 shadow-2xl">
          {/* Ambient Lighting Gradients */}
          <div className="absolute -right-16 -bottom-16 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -left-16 -top-16 w-80 h-80 bg-amber-600/5 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Column: Heading & Value Proposition */}
            <div className="lg:col-span-7 space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold tracking-wider uppercase">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>CP Connoisseurs Club</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-black text-white font-serif-luxury tracking-tight">
                Unlock Private Previews & A ₹2,500 Welcome Privilege
              </h3>
              <p className="text-xs sm:text-sm text-stone-400 leading-relaxed max-w-xl">
                Subscribe to our curated dispatch for private showroom sales, limited teakwood craftsman releases, and interior styling inspirations. Enter your email to receive an instant welcome voucher.
              </p>

              {/* Promotional Pillars */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs text-stone-300">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                    <Gift className="w-3.5 h-3.5" />
                  </div>
                  <span>₹2,500 Off First Order</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                    <Send className="w-3.5 h-3.5" />
                  </div>
                  <span>VIP Private Sales</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-3.5 h-3.5" />
                  </div>
                  <span>Strictly Curated • No Spam</span>
                </div>
              </div>
            </div>

            {/* Right Column: Interactive Subscription Form or Success Card */}
            <div className="lg:col-span-5">
              {!isSubscribed ? (
                <form onSubmit={handleNewsletterSubmit} className="space-y-3">
                  <div className="space-y-1.5">
                    <label htmlFor="newsletter-email-input" className="block text-xs font-bold text-stone-300 uppercase tracking-wider">
                      Your Email Address
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-500">
                        <Mail className="w-4 h-4 text-stone-400" />
                      </div>
                      <input
                        id="newsletter-email-input"
                        type="email"
                        value={newsletterEmail}
                        onChange={(e) => {
                          setNewsletterEmail(e.target.value);
                          if (errorMessage) setErrorMessage('');
                        }}
                        placeholder="e.g. rohan.sharma@example.com"
                        className="w-full pl-10 pr-4 py-3.5 bg-stone-950/90 border border-stone-700 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 rounded-2xl text-stone-100 placeholder-stone-500 text-sm outline-none transition-all shadow-inner"
                        disabled={isSubmitting}
                      />
                    </div>
                    {errorMessage && (
                      <p className="text-xs text-rose-400 flex items-center gap-1.5 pt-0.5">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{errorMessage}</span>
                      </p>
                    )}
                  </div>

                  <button
                    id="newsletter-submit-btn"
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-r from-amber-500 via-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-bold text-sm py-3.5 px-6 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 transition-all cursor-pointer disabled:opacity-60"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-stone-950 border-t-transparent rounded-full animate-spin" />
                        <span>Enrolling into VIP Club...</span>
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <span>Subscribe & Claim ₹2,500 Voucher</span>
                        <ArrowRight className="w-4 h-4" />
                      </span>
                    )}
                  </button>

                  <p className="text-[11px] text-stone-400 text-center leading-relaxed">
                    By subscribing, you agree to receive promotional updates from CP Furniture. You can unsubscribe at any time with one click.
                  </p>
                </form>
              ) : (
                /* Subscribed Success State with Copyable Promo Voucher */
                <div className="bg-stone-950/90 border border-amber-500/40 rounded-2xl p-5 sm:p-6 space-y-4 shadow-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">Welcome to the Club!</h4>
                      <p className="text-xs text-stone-400 truncate max-w-[240px] sm:max-w-xs">
                        VIP invitation active for {subscribedEmail}
                      </p>
                    </div>
                  </div>

                  {/* Promo Voucher Box */}
                  <div className="p-3.5 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/30 rounded-xl flex items-center justify-between gap-3">
                    <div>
                      <span className="text-[10px] uppercase tracking-wider font-bold text-amber-400 block">
                        Your Welcome Gift Code
                      </span>
                      <span className="text-base font-black font-mono text-white tracking-wider">
                        WELCOME25
                      </span>
                      <span className="text-[10px] text-stone-400 block">
                        ₹2,500 Off orders over ₹30,000
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={handleCopyCode}
                      className="px-3 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs rounded-lg flex items-center gap-1.5 transition-all shadow cursor-pointer shrink-0"
                    >
                      {copiedCode ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="flex items-center justify-between text-xs text-stone-400 pt-1">
                    <span>Applied automatically or enter at checkout.</span>
                    <button
                      type="button"
                      onClick={() => {
                        setIsSubscribed(false);
                        setSubscribedEmail('');
                      }}
                      className="text-amber-400 hover:underline cursor-pointer text-[11px]"
                    >
                      Subscribe another email
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl 2xl:max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-3xl font-black tracking-tighter text-white font-serif-luxury">CP</span>
              <span className="text-3xl font-extralight tracking-widest text-amber-500 uppercase">FURNITURE</span>
            </div>
            <p className="text-xs text-stone-400 leading-relaxed max-w-sm">
              {websiteContent.aboutUsText}
            </p>
            <div className="pt-2 space-y-2 text-xs text-stone-300">
              <p className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-amber-500 flex-shrink-0" />
                <span>{websiteContent.headquartersAddress}</span>
              </p>
              <p className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-amber-500 flex-shrink-0" />
                <span>{websiteContent.contactPhone}</span>
              </p>
              <p className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-amber-500 flex-shrink-0" />
                <span>{websiteContent.contactEmail}</span>
              </p>
              <p className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-500 flex-shrink-0" />
                <span>{websiteContent.showroomHours}</span>
              </p>
            </div>
          </div>

          {/* Categories */}
          <div>
            <h5 className="text-xs font-bold text-white uppercase tracking-widest mb-4">Categories</h5>
            <ul className="space-y-2 text-xs">
              {categories.slice(0, 6).map((cat) => (
                <li key={cat.id}>
                  <button
                    onClick={() => selectCategoryFromHome(cat.name)}
                    className="hover:text-amber-400 transition-colors text-left text-stone-400 hover:text-white"
                  >
                    {cat.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Care */}
          <div>
            <h5 className="text-xs font-bold text-white uppercase tracking-widest mb-4">Customer Care</h5>
            <ul className="space-y-2 text-xs text-stone-400">
              <li>
                <button onClick={() => setCurrentView('account')} className="hover:text-white transition-colors">
                  My Account
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentView('account')} className="hover:text-white transition-colors">
                  Track My Order
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentView('offers')} className="hover:text-white transition-colors">
                  Discount Coupons
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentView('showrooms')} className="hover:text-white transition-colors">
                  Experience Centers
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentView('contact')} className="hover:text-white transition-colors">
                  Warranty & Returns
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentView('contact')} className="hover:text-white transition-colors">
                  Book Free Design Visit
                </button>
              </li>
            </ul>
          </div>

          {/* Quality & Guarantees */}
          <div>
            <h5 className="text-xs font-bold text-white uppercase tracking-widest mb-4">Quality & Guarantees</h5>
            <ul className="space-y-2 text-xs text-stone-400 mb-4">
              <li className="flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span>10-Year Solid Wood Structural Warranty</span>
              </li>
              <li className="flex items-center gap-2">
                <Truck className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span>Complimentary White-Glove Assembly</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Zero-Cost 14-Day In-Home Trial</span>
              </li>
            </ul>
            <div className="p-3 bg-stone-950 rounded-xl border border-stone-800 text-[11px] text-stone-400 space-y-1">
              <span className="font-bold text-amber-400 block">FSC Certified Timber</span>
              <p>Every wooden dining, bed, and sofa frame is hand-shaped from certified kiln-dried plantation timber.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Copyright */}
      <div className="max-w-7xl 2xl:max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 border-t border-stone-800 flex flex-col md:flex-row items-center justify-between text-xs text-stone-500 gap-3">
        <p>&copy; {new Date().getFullYear()} CP Furniture Showrooms Ltd. All rights reserved.</p>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
          <span className="hover:text-stone-300 cursor-pointer" onClick={() => setCurrentView('contact')}>Privacy Policy</span>
          <span className="hover:text-stone-300 cursor-pointer" onClick={() => setCurrentView('contact')}>Terms & Conditions</span>
          <span className="hover:text-stone-300 cursor-pointer" onClick={() => setCurrentView('contact')}>Warranty Card</span>
          <span className="text-stone-700 hidden sm:inline">|</span>
          <button
            id="footer-admin-login-btn"
            onClick={() => {
              setCurrentView('admin');
              window.history.pushState(null, '', '#/admin');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="text-stone-500 hover:text-amber-400 transition-colors flex items-center gap-1 cursor-pointer text-[11px]"
            title="Admin Login (/admin)"
          >
            <Lock className="w-3 h-3 text-stone-500" />
            <span>Admin Login</span>
          </button>
          <span className="text-stone-700 hidden sm:inline">|</span>
          <button
            id="footer-purchasing-portal-btn"
            onClick={() => {
              setCurrentView('purchasing');
              window.history.pushState(null, '', '#/purchasing');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="text-stone-500 hover:text-amber-400 transition-colors flex items-center gap-1 cursor-pointer text-[11px]"
            title="Purchasing & Stock Inward Portal (/purchasing)"
          >
            <Boxes className="w-3 h-3 text-stone-500" />
            <span>Purchasing Portal</span>
          </button>
        </div>
      </div>
    </footer>
  );
};
