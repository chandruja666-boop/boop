import React, { useState } from 'react';
import {
  Sparkles,
  ArrowRight,
  Copy,
  Check,
  Tag,
  Flame,
  ShieldCheck,
  Award,
  Store,
  ChevronRight
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { FestiveBannerConfig } from '../../types';

interface VinayagarFestiveHeroProps {
  config?: FestiveBannerConfig;
}

export const VinayagarFestiveHero: React.FC<VinayagarFestiveHeroProps> = ({ config }) => {
  const { websiteContent, setCurrentView, showToast, applyCoupon } = useApp();
  const [copied, setCopied] = useState(false);
  const [animate, setAnimate] = React.useState(false);

  React.useEffect(() => {
    const t = setTimeout(() => setAnimate(true), 50);
    return () => clearTimeout(t);
  }, []);

  const banner = config || websiteContent.festiveBanner;

  if (!banner || banner.enabled === false) {
    return null;
  }

  // Clean badge text: keep the Vinayagar motif (🕉️ / 🪔) and remove any 'SHREE GANESHA' text
  const rawBadge = banner.badge || '🕉️ AUSPICIOUS BLESSINGS • VINAYAGAR CHATHURTHI SPECIAL';
  const cleanedBadgeText = rawBadge
    .replace(/SHREE\s*GANESHA\s*[•·\-|–—]?\s*/gi, '')
    .replace(/[•·\-|–—]?\s*SHREE\s*GANESHA/gi, '')
    .replace(/\s*•\s*•\s*/g, ' • ')
    .trim()
    .replace(/^[•·\-|–—]\s*|\s*[•·\-|–—]$/g, '')
    .trim();
  const displayBadge = cleanedBadgeText.startsWith('🕉️') ? cleanedBadgeText : `🕉️ ${cleanedBadgeText}`;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(banner.code);
    setCopied(true);
    applyCoupon(banner.code);
    showToast(`Festive coupon code "${banner.code}" copied & applied to your cart!`, 'success');
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <section className={`relative overflow-hidden bg-gradient-to-b from-stone-950 via-stone-900 to-stone-950 border-y border-amber-500/30 text-stone-100 shadow-2xl transition-all duration-1000 ease-out transform ${animate ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-[0.99]'
      }`}>
      {/* Ambient Gold Glow & Background Mesh */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-amber-600/15 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-64 bg-gradient-to-r from-amber-500/5 via-amber-400/10 to-amber-500/5 blur-2xl" />
      </div>

      <div className="max-w-7xl 2xl:max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left / Center Content Column */}
          <div className="lg:col-span-7 space-y-5 text-left">
            {/* Auspicious Badge & Running Premium Offer Ticker */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/15 border border-amber-400/40 text-amber-300 text-xs font-semibold tracking-wide shadow-sm w-fit">
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 text-xs">
                  🪔
                </span>
                <span className="font-serif-luxury font-bold uppercase tracking-wider text-[11px] sm:text-xs">
                  {displayBadge}
                </span>
              </div>

              {/* Running Premium Offer Marquee */}
              <div className="overflow-hidden whitespace-nowrap bg-amber-500/10 border border-amber-500/30 rounded-full px-3 py-1 text-xs text-amber-300 font-medium">
                <div className="inline-block animate-marquee">
                  <span className="mx-4">✨ PREMIUM FESTIVE COLLECTION • EXCLUSIVE HANDCRAFTED TEAKWOOD • LIMITED TIME GRAND OFFER ✨</span>
                </div>
              </div>
            </div>

            {/* Headline with Luxury Gold Gradient */}
            <div className="space-y-2">
              <h2 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold font-serif-luxury tracking-tight text-white leading-tight">
                {banner.title || 'Divine Beginnings for Your Luxury Home'}
              </h2>
              <p className="text-xs sm:text-sm text-stone-300 font-normal leading-relaxed max-w-2xl">
                {banner.subtitle ||
                  'Celebrate the auspicious occasion of Vinayagar Chathurthi with handcrafted solid teakwood suites, sculpted dining sets, and bespoke Italian velvet seating at exclusive festive privileges.'}
              </p>
            </div>

            {/* Festive Coupon Promo Box */}
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-stone-900/90 via-amber-950/40 to-stone-900/90 border border-amber-500/40 shadow-inner flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1">
                    <Tag className="w-3.5 h-3.5" />
                    <span>Exclusive Festive Discount</span>
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500 text-stone-950 font-mono">
                    {banner.discountText || 'EXTRA 15% OFF'}
                  </span>
                </div>
                <p className="text-xs text-stone-300">
                  Applicable on all Solid Teakwood, Living Suites & Luxury Recliners
                </p>
              </div>

              {/* Code Pill & Copy Button */}
              <div className="flex items-center gap-2 bg-stone-950/90 px-3 py-2 rounded-xl border border-amber-500/50 shadow-md">
                <div className="text-left">
                  <span className="text-[9px] uppercase tracking-wider text-stone-400 block font-semibold">
                    Promo Voucher
                  </span>
                  <span className="text-xs sm:text-sm font-bold font-mono tracking-widest text-amber-300">
                    {banner.code || 'VINAYAGAR15'}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleCopyCode}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow ${copied
                    ? 'bg-emerald-500 text-stone-950'
                    : 'bg-amber-500 hover:bg-amber-400 text-stone-950 active:scale-95'
                    }`}
                  title="Click to copy festive coupon code"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                      <span>Applied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Code</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* CTAs & Trust Badges */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                type="button"
                onClick={() => {
                  setCurrentView((banner.ctaLink || 'shop') as Parameters<typeof setCurrentView>[0]);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 text-xs sm:text-sm font-bold rounded-xl shadow-lg hover:shadow-amber-500/25 transition-all cursor-pointer flex items-center gap-2 group"
              >
                <span>{banner.ctaText || 'Explore Festive Collection'}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                type="button"
                onClick={() => {
                  setCurrentView((banner.secondaryCtaLink || 'showrooms') as Parameters<typeof setCurrentView>[0]);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="px-5 py-3 bg-stone-800/80 hover:bg-stone-700 text-stone-200 hover:text-white text-xs sm:text-sm font-semibold rounded-xl border border-stone-700 hover:border-amber-400/50 transition-all cursor-pointer flex items-center gap-2"
              >
                <Store className="w-4 h-4 text-amber-400" />
                <span>{banner.secondaryCtaText || 'Visit Experience Centers'}</span>
              </button>
            </div>

            {/* Sub-notice */}
            <div className="flex flex-wrap items-center gap-4 text-[11px] text-stone-400 pt-1">
              <span className="flex items-center gap-1.5 text-amber-400/90 font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                <span>100% Certified Solid Wood</span>
              </span>
              <span className="text-stone-600">&bull;</span>
              <span>Free White-Glove Home Assembly</span>
              <span className="text-stone-600">&bull;</span>
              <span className="text-amber-300 font-semibold">{banner.expiryText || 'Valid Till Chaturthi Weekend'}</span>
            </div>
          </div>

          {/* Right Visual Motif & Fixed Stable Grand Offer Image */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-3xl overflow-hidden border border-amber-500/40 shadow-2xl bg-stone-950 group">
              {/* Stable Single Custom Image Selected by Admin */}
              <div className="aspect-[4/3] sm:aspect-[16/11] relative overflow-hidden bg-stone-950">
                <img
                  src={banner.image || 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1200&q=80'}
                  alt="Vinayagar Chathurthi Grand Offer Collection"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  referrerPolicy="no-referrer"
                />

                {/* Dark Vignette Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/40 to-black/30" />

                {/* Floating Bottom Card on Image */}
                <div className="absolute bottom-4 left-4 right-4 p-3.5 rounded-2xl bg-stone-950/90 backdrop-blur-md border border-amber-500/30 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider block">
                      Festive Showcase
                    </span>
                    <h4 className="text-xs sm:text-sm font-bold text-white font-serif-luxury truncate">
                      Royal Teak Living & Dining Suites
                    </h4>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-stone-400 block">Festive Price</span>
                    <span className="text-xs sm:text-sm font-bold text-amber-300 font-mono">
                      Starting ₹24,999
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};