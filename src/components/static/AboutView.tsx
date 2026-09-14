import React from 'react';
import { Award, ShieldCheck, Sparkles, TreePine, Users, Compass, CheckCircle2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const AboutView: React.FC = () => {
  const { websiteContent, setCurrentView } = useApp();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16 space-y-16">
      {/* Hero */}
      <div className="max-w-3xl mx-auto text-center space-y-4">
        <span className="text-xs font-bold text-amber-900 uppercase tracking-widest block">
          Since 2012 &bull; Handcrafted Legacy
        </span>
        <h1 className="text-3xl sm:text-5xl font-bold font-serif-luxury text-stone-900 leading-tight">
          Where Generational Woodcraft Meets Contemporary Living
        </h1>
        <p className="text-sm sm:text-base text-stone-600 leading-relaxed">
          {websiteContent.aboutUsText}
        </p>
      </div>

      {/* Showroom Image Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="aspect-[4/3] rounded-3xl overflow-hidden shadow-md">
          <img
            src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1000&q=80"
            alt="Showroom display"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>
        <div className="aspect-[4/3] rounded-3xl overflow-hidden shadow-md">
          <img
            src="https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1000&q=80"
            alt="Handcrafted wood workshop"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>
        <div className="aspect-[4/3] rounded-3xl overflow-hidden shadow-md">
          <img
            src="https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1000&q=80"
            alt="Design Studio"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>
      </div>

      {/* Values */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="p-8 bg-stone-50 rounded-3xl border border-stone-200 space-y-3">
          <TreePine className="w-8 h-8 text-amber-800" />
          <h3 className="font-bold text-lg font-serif-luxury text-stone-900">Sustainable Kiln Seasoning</h3>
          <p className="text-xs text-stone-600 leading-relaxed">
            Every log of teakwood and sheesham is sourced from FSC-certified sustainable forest plantations and dried in computerized kilns to exact moisture thresholds.
          </p>
        </div>

        <div className="p-8 bg-stone-50 rounded-3xl border border-stone-200 space-y-3">
          <Award className="w-8 h-8 text-amber-800" />
          <h3 className="font-bold text-lg font-serif-luxury text-stone-900">Master Joinery & Mortise</h3>
          <p className="text-xs text-stone-600 leading-relaxed">
            We reject flimsy plastic dowels. Our artisans hand-craft traditional dovetail, mortise, and tenon joints built to withstand decades of energetic daily life.
          </p>
        </div>

        <div className="p-8 bg-stone-50 rounded-3xl border border-stone-200 space-y-3">
          <ShieldCheck className="w-8 h-8 text-amber-800" />
          <h3 className="font-bold text-lg font-serif-luxury text-stone-900">10-Year Comprehensive Warranty</h3>
          <p className="text-xs text-stone-600 leading-relaxed">
            We stand behind every headboard, dining leg, and drawer runner with on-site technician service and lifetime customer assistance.
          </p>
        </div>
      </div>

      {/* CTA */}
      <div className="bg-stone-900 rounded-3xl p-8 sm:p-12 text-white text-center space-y-6">
        <h2 className="text-2xl sm:text-3xl font-bold font-serif-luxury">
          Experience the Texture in Person
        </h2>
        <p className="text-xs sm:text-sm text-stone-400 max-w-md mx-auto">
          Visit any of our 3 flagship experience centers or explore our full collection online.
        </p>
        <div className="flex justify-center gap-4">
          <button
            onClick={() => setCurrentView('shop')}
            className="px-6 py-3 bg-amber-800 hover:bg-amber-700 text-white font-bold text-xs rounded-xl transition-all"
          >
            Explore Furniture Range
          </button>
          <button
            onClick={() => setCurrentView('showrooms')}
            className="px-6 py-3 bg-stone-800 hover:bg-stone-700 text-white font-bold text-xs rounded-xl transition-all border border-stone-700"
          >
            Find a Showroom
          </button>
        </div>
      </div>
    </div>
  );
};
