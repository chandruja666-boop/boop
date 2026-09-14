import React from 'react';
import { Tag, Copy, Check, Sparkles, CreditCard, Gift, ArrowRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ScrollReveal, SectionHeader } from '../common/ScrollReveal';

export const OffersView: React.FC = () => {
  const { coupons, applyCoupon, setCurrentView, showToast, selectCategoryFromHome } = useApp();
  const [copiedCode, setCopiedCode] = React.useState<string | null>(null);

  const handleCopy = (code: string) => {
    navigator.clipboard?.writeText(code);
    setCopiedCode(code);
    showToast(`Coupon code ${code} copied to clipboard!`, 'success');
    setTimeout(() => setCopiedCode(null), 2500);
  };

  const handleApplyDirect = (code: string) => {
    applyCoupon(code);
    setCurrentView('cart');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-12">
      <SectionHeader
        eyebrow="Showroom Privileges"
        title="Exclusive Furniture Offers & Vouchers"
        subtitle="Save on certified teakwood bedroom sets, velvet living suites, and ergonomic office configurations."
        align="center"
        className="max-w-2xl mx-auto"
      />

      {/* Active Coupons Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {coupons.map((c, idx) => (
          <ScrollReveal
            key={c.code}
            animation="fade-up"
            delay={idx * 90}
            className="h-full"
          >
            <div
              className="bg-white rounded-3xl border-2 border-dashed border-stone-200 hover:border-amber-800 p-6 flex flex-col justify-between shadow-sm hover:shadow-md transition-all relative overflow-hidden h-full"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 bg-amber-100 text-amber-900 text-xs font-bold rounded-full">
                    {c.discountType === 'percentage' ? `${c.discountValue}%` : `₹${(c.discountValue || 0).toLocaleString()}`} Instant Off
                  </span>
                  <span className="text-[11px] text-stone-400 font-medium">Expires {c.expiryDate}</span>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xl font-black text-stone-900 tracking-wider">
                      {c.code}
                    </span>
                    <button
                      onClick={() => handleCopy(c.code)}
                      className="p-2 text-stone-400 hover:text-stone-900 rounded-lg border border-stone-200 transition-colors cursor-pointer"
                      title="Copy code"
                    >
                      {copiedCode === c.code ? (
                        <Check className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-stone-600">{c.description}</p>
                </div>

                <div className="text-[11px] text-stone-500 pt-2 border-t border-stone-100">
                  <span>Minimum Order Value: <strong>₹{(c.minOrderValue || 0).toLocaleString()}</strong></span>
                </div>
              </div>

              <div className="pt-6">
                <button
                  onClick={() => handleApplyDirect(c.code)}
                  className="w-full py-2.5 bg-stone-900 hover:bg-amber-900 text-white text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>Apply Code in Cart</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </ScrollReveal>
        ))}
      </div>

      {/* Bank Partner Offers */}
      <ScrollReveal animation="fade-up">
        <div className="bg-stone-900 rounded-3xl p-8 text-white space-y-6">
          <div className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-amber-400" />
            <h2 className="text-xl font-bold font-serif-luxury">Bank & Payment Partner Offers</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
            <ScrollReveal animation="fade-up" delay={50}>
              <div className="p-5 rounded-2xl bg-stone-800 border border-stone-700 space-y-2 h-full">
                <span className="text-amber-400 font-bold block text-sm">HDFC Bank Credit Cards</span>
                <p className="text-stone-300">
                  Flat 10% instant discount up to ₹7,500 on all solid wood bedroom collections on 6-month EMI transactions.
                </p>
                <span className="text-[10px] text-stone-500 block">Valid on orders above ₹40,000</span>
              </div>
            </ScrollReveal>

            <ScrollReveal animation="fade-up" delay={150}>
              <div className="p-5 rounded-2xl bg-stone-800 border border-stone-700 space-y-2 h-full">
                <span className="text-amber-400 font-bold block text-sm">ICICI Bank NetBanking</span>
                <p className="text-stone-300">
                  Complimentary ₹2,500 furniture care kit voucher with every modular wardrobe or sofa set purchase.
                </p>
                <span className="text-[10px] text-stone-500 block">Auto-applied at checkout</span>
              </div>
            </ScrollReveal>

            <ScrollReveal animation="fade-up" delay={250}>
              <div className="p-5 rounded-2xl bg-stone-800 border border-stone-700 space-y-2 h-full">
                <span className="text-amber-400 font-bold block text-sm">Bajaj Finserv No-Cost EMI</span>
                <p className="text-stone-300">
                  Zero down payment and zero interest for 12 months across all dining and study furniture ranges.
                </p>
                <span className="text-[10px] text-stone-500 block">Select EMI at checkout</span>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </ScrollReveal>
    </div>
  );
};
