import React, { useState, useEffect, useMemo } from 'react';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Truck,
  RotateCcw,
  CreditCard,
  ChevronLeft,
  ChevronRight,
  Star,
  MapPin,
  Clock,
  Phone,
  CheckCircle2,
  Calendar,
  Layers,
  Award,
  Store,
  Tag,
  Search
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ProductCard } from '../common/ProductCard';
import { ScrollReveal, SectionHeader } from '../common/ScrollReveal';
import { VinayagarFestiveHero } from './VinayagarFestiveHero';

export const HomeView: React.FC = () => {
  const {
    websiteContent,
    products,
    categories,
    selectCategoryFromHome,
    setCurrentView,
    resetFilters,
    showToast
  } = useApp();

  const [activeRoomTab, setActiveRoomTab] = useState<string>('Living Room');
  const [consultationSubmitted, setConsultationSubmitted] = useState(false);
  const [consultName, setConsultName] = useState('');
  const [consultPhone, setConsultPhone] = useState('');
  const [consultCity, setConsultCity] = useState('Bengaluru');

  // Live Storefront Catalog Section State
  const [storefrontFilter, setStorefrontFilter] = useState('All');
  const [storefrontSearch, setStorefrontSearch] = useState('');

  const [scrollProgress, setScrollProgress] = useState(0);
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -320, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 320, behavior: 'smooth' });
    }
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const maxScroll = target.scrollWidth - target.clientWidth;
    if (maxScroll > 0) {
      setScrollProgress((target.scrollLeft / maxScroll) * 100);
    }
  };

  const bestSellers = products.filter((p) => p.isBestSeller && p.isPublished).slice(0, 4);
  const newArrivals = products
    .filter((p) => (p.isNewArrival || p.id.startsWith('prod-')) && p.isPublished)
    .slice(0, 4);

  // Live Storefront Products Filtered & Sorted (Newest first)
  const liveStorefrontProducts = useMemo(() => {
    return products.filter((p) => {
      if (!p.isPublished) return false;
      if (storefrontFilter !== 'All' && p.category !== storefrontFilter) return false;
      if (storefrontSearch.trim()) {
        const q = storefrontSearch.toLowerCase();
        return (
          p.name.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          p.material.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [products, storefrontFilter, storefrontSearch]);

  // Quick navigation department tiles
  const quickNavDepartments = [
    { name: 'Living Room', categoryName: 'Sofas & Seating', icon: '🛋️', badge: 'Popular' },
    { name: 'Bedroom', categoryName: 'Beds & Bedroom', icon: '🛏️', badge: 'Best Value' },
    { name: 'Dining', categoryName: 'Dining & Kitchen', icon: '🍽️', badge: '' },
    { name: 'Wardrobes', categoryName: 'Wardrobes & Storage', icon: '🚪', badge: '' },
    { name: 'Study & Office', categoryName: 'Office & Study', icon: '💼', badge: 'Ergo' },
    { name: 'Mattresses', categoryName: 'Mattresses & Pillows', icon: '☁️', badge: '10-Yr' },
    { name: 'Decor & Lights', categoryName: 'Home Decor & Lighting', icon: '💡', badge: '' },
    { name: 'Outdoor', categoryName: 'Outdoor & Balcony', icon: '🌿', badge: '' },
    { name: 'Sale & Offers', view: 'offers', icon: '🏷️', badge: 'Up to 50%' },
    { name: 'Showrooms', view: 'showrooms', icon: '🏢', badge: 'Visit' }
  ];

  // Room category filter mapping
  const roomCategoryMap: Record<string, string> = {
    'Living Room': 'Sofas & Seating',
    'Bedroom': 'Beds & Bedroom',
    'Dining': 'Dining & Kitchen',
    'Office': 'Office & Study',
    'Mattress': 'Mattresses & Pillows',
    'Home Decor': 'Home Decor & Lighting'
  };

  const currentRoomCategory = roomCategoryMap[activeRoomTab] || 'Sofas & Seating';
  const roomProducts = products
    .filter((p) => p.category === currentRoomCategory && p.isPublished)
    .slice(0, 4);

  const handleBookConsultation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!consultName || !consultPhone) {
      showToast('Please enter your name and contact phone number.', 'warning');
      return;
    }
    setConsultationSubmitted(true);
    showToast('Showroom visit confirmed! Our design consultant will call you within 2 hours.', 'success');
  };

  return (
    <div className="space-y-10 sm:space-y-16 pb-24 md:pb-16">
      {/* 0. STRICTLY LOCKED AUSPICIOUS FESTIVE HERO BANNER (NO ROTATION) */}
      <VinayagarFestiveHero />

      {/* 1. FRONT HOME PAGE QUICK DEPARTMENT NAVIGATION STRIP */}
      <section className="bg-stone-950 border-b border-stone-900 py-6 sm:py-8 relative overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-500/25 to-transparent" />
        <div className="absolute -top-12 left-1/3 w-72 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />

        <div className="max-w-7xl 2xl:max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5 sm:mb-6">
            <div className="space-y-0.5">
              <span className="text-[10px] font-extrabold text-amber-500 uppercase tracking-widest block">
                Atelier Collections
              </span>
              <h2 className="text-lg sm:text-xl font-bold font-serif-luxury text-stone-100 tracking-tight">
                Explore by Department
              </h2>
            </div>

            <div className="flex items-center gap-3 self-end sm:self-center">
              {/* Sliding Navigation Buttons */}
              <div className="flex items-center gap-1.5 mr-2">
                <button
                  onClick={scrollLeft}
                  className="w-8 h-8 rounded-full border border-stone-800 hover:border-amber-500/40 bg-stone-900/50 hover:bg-stone-900 text-stone-400 hover:text-amber-400 flex items-center justify-center transition-all cursor-pointer shadow-sm active:scale-95"
                  title="Scroll Left"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={scrollRight}
                  className="w-8 h-8 rounded-full border border-stone-800 hover:border-amber-500/40 bg-stone-900/50 hover:bg-stone-900 text-stone-400 hover:text-amber-400 flex items-center justify-center transition-all cursor-pointer shadow-sm active:scale-95"
                  title="Scroll Right"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <button
                onClick={() => {
                  resetFilters();
                  setCurrentView('shop');
                }}
                className="text-[10px] sm:text-xs font-bold text-stone-400 hover:text-amber-400 flex items-center gap-1.5 cursor-pointer transition-colors border border-stone-800 rounded-full px-3.5 py-1.5 bg-stone-900/30 hover:bg-stone-900/60"
              >
                <span>View Full Catalog ({categories.length} Departments)</span>
                <ArrowRight className="w-3.5 h-3.5 text-amber-500" />
              </button>
            </div>
          </div>

          {/* Cards container */}
          <div
            ref={scrollContainerRef}
            onScroll={handleScroll}
            className="overflow-x-auto no-scrollbar scroll-smooth relative"
          >
            <div className="flex items-center gap-3 sm:gap-4.5 min-w-max py-2 px-1">
              {quickNavDepartments.map((dept) => {
                const categoryData = categories.find(
                  (c) => c.name.toLowerCase() === dept.categoryName?.toLowerCase()
                );

                return (
                  <button
                    key={dept.name}
                    onClick={() => {
                      if (dept.view) {
                        setCurrentView(dept.view as Parameters<typeof setCurrentView>[0]);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      } else if (dept.categoryName) {
                        selectCategoryFromHome(dept.categoryName);
                      }
                    }}
                    className="flex flex-col items-center gap-4 p-4 sm:p-5 rounded-2xl bg-gradient-to-b from-stone-900 to-stone-950 border border-amber-500/15 hover:border-amber-500/40 hover:shadow-[0_4px_25px_rgba(245,158,11,0.15)] transition-all duration-500 text-center min-w-[110px] sm:min-w-[140px] group cursor-pointer relative"
                  >
                    {dept.badge && (
                      <span className="absolute -top-2 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-500 via-amber-600 to-orange-600 text-stone-950 text-[7px] sm:text-[8px] font-black px-2 py-0.5 rounded-full shadow-md uppercase tracking-wider whitespace-nowrap border border-amber-400/30 z-10">
                        {dept.badge}
                      </span>
                    )}

                    <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full p-1 bg-gradient-to-b from-amber-500/20 to-transparent border border-stone-800 group-hover:border-amber-500/30 transition-colors shadow-inner flex items-center justify-center shrink-0">
                      <div className="w-full h-full rounded-full overflow-hidden bg-stone-950 flex items-center justify-center">
                        {categoryData?.image ? (
                          <img
                            src={categoryData.image}
                            alt={dept.name}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-115"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <span className="text-xl sm:text-2xl drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">{dept.icon}</span>
                        )}
                      </div>
                    </div>

                    <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-white group-hover:text-amber-400 transition-colors truncate max-w-[95px] sm:max-w-[120px] pb-1">
                      {dept.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-4 flex justify-center">
            <div className="w-36 h-0.5 bg-stone-850 rounded-full overflow-hidden relative">
              <div
                className="absolute top-0 bottom-0 left-0 bg-gradient-to-r from-amber-600 to-amber-400 rounded-full transition-all duration-150 ease-out"
                style={{ width: `${Math.max(12, scrollProgress)}%` }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* 3. FEATURED SHOWROOM CATEGORIES */}
      <section className="max-w-7xl 2xl:max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Curated Showroom Spaces"
          title="Featured Categories"
          action={
            <button
              onClick={() => {
                resetFilters();
                setCurrentView('shop');
              }}
              className="text-xs sm:text-sm font-semibold text-amber-900 hover:text-amber-800 flex items-center gap-1 cursor-pointer"
            >
              <span>View All Departments ({categories.length})</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          }
          className="mb-6 sm:mb-8"
        />

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4.5">
          {categories.slice(0, 10).map((cat, idx) => (
            <ScrollReveal
              key={cat.id}
              animation="fade-up"
              delay={(idx % 5) * 60}
              className="h-full"
            >
              <div
                onClick={() => selectCategoryFromHome(cat.name)}
                className="group cursor-pointer rounded-2xl overflow-hidden border border-stone-200 bg-white hover:border-amber-800/40 hover:shadow-lg transition-all h-full flex flex-col justify-between"
              >
                <div className="aspect-[4/3] sm:aspect-square overflow-hidden bg-stone-100 relative">
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="w-full h-full object-cover group-hover:scale-106 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-950/75 via-stone-950/20 to-transparent" />
                  <span className="absolute bottom-2.5 left-3 right-3 text-white text-xs sm:text-sm font-bold font-serif-luxury drop-shadow truncate">
                    {cat.name}
                  </span>
                </div>
                <div className="p-2 sm:p-2.5 text-[10px] sm:text-[11px] text-stone-500 truncate flex items-center justify-between">
                  <span>{cat.subcategories[0] || 'Explore'}</span>
                  <span className="text-amber-800 font-semibold group-hover:translate-x-1 transition-transform">
                    &rarr;
                  </span>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* 4. PROMO & COMBO OFFERS BANNERS */}
      <section className="max-w-7xl 2xl:max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {websiteContent.promoBanners.map((promo, idx) => (
            <ScrollReveal
              key={promo.id}
              animation={idx === 0 ? 'fade-right' : 'fade-left'}
              delay={idx * 100}
            >
              <div
                className={`relative rounded-3xl overflow-hidden shadow-lg bg-gradient-to-br ${promo.bgGradient} text-white p-6 sm:p-8 flex flex-col justify-between min-h-[220px] sm:min-h-[250px]`}
              >
                <div className="absolute right-0 top-0 bottom-0 w-1/2 opacity-25 pointer-events-none">
                  <img
                    src={promo.image}
                    alt={promo.title}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>

                <div className="relative z-10 space-y-1.5 sm:space-y-2 max-w-sm">
                  <span className="inline-block px-2.5 py-0.5 bg-amber-500 text-stone-950 text-[10px] font-extrabold uppercase tracking-widest rounded-full shadow">
                    {promo.discount}
                  </span>
                  <h3 className="text-xl sm:text-2xl font-bold font-serif-luxury text-white">{promo.title}</h3>
                  <p className="text-xs text-stone-300">{promo.subtitle}</p>
                </div>

                <div className="relative z-10 pt-4 flex items-center gap-3">
                  <button
                    onClick={() => selectCategoryFromHome(promo.linkCategory)}
                    className="px-4 py-2 sm:px-5 sm:py-2.5 bg-white text-stone-900 text-xs font-bold rounded-xl hover:bg-amber-100 transition-colors shadow cursor-pointer"
                  >
                    Explore Bundle
                  </button>
                  <div className="text-[11px] sm:text-xs text-stone-300 font-mono bg-black/40 px-2.5 py-1.5 rounded-lg border border-white/20">
                    Use: <span className="text-amber-400 font-bold">{promo.code}</span>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* 5. BEST SELLERS */}
      <section className="max-w-7xl 2xl:max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Top Rated Showroom Picks"
          title="Best Selling Furniture"
          subtitle="Our most beloved pieces across residential and commercial interiors."
          action={
            <button
              onClick={() => {
                resetFilters();
                useApp().updateFilter('sortBy', 'popular');
                setCurrentView('shop');
              }}
              className="text-xs sm:text-sm font-semibold text-amber-900 hover:text-amber-800 flex items-center gap-1 cursor-pointer"
            >
              <span>View All Best Sellers</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          }
          className="mb-6 sm:mb-8"
        />

        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-6">
          {bestSellers.map((product, idx) => (
            <ProductCard key={product.id} product={product} index={idx} />
          ))}
        </div>
      </section>

      {/* 6. INTERACTIVE ROOM BY ROOM SHOWCASE */}
      <section className="bg-stone-100/70 py-12 sm:py-16 border-y border-stone-200">
        <div className="max-w-7xl 2xl:max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            eyebrow="Complete Space Solutions"
            title="Furnish Room by Room"
            subtitle="Select your room to discover harmonized teakwood, plush upholstery, and ergonomic layouts."
            align="center"
            className="mb-8"
          />

          <ScrollReveal animation="fade-in" delay={150}>
            <div className="overflow-x-auto no-scrollbar scroll-smooth flex sm:flex-wrap items-center sm:justify-center gap-2 mb-8 pb-1">
              {['Living Room', 'Bedroom', 'Dining', 'Office', 'Mattress', 'Home Decor'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveRoomTab(tab)}
                  className={`px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer ${activeRoomTab === tab
                      ? 'bg-stone-900 text-white shadow-md'
                      : 'bg-white text-stone-700 hover:bg-stone-200 border border-stone-300/60'
                    }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-6">
            {roomProducts.length > 0 ? (
              roomProducts.map((p, idx) => <ProductCard key={p.id} product={p} index={idx} />)
            ) : (
              <div className="col-span-2 lg:col-span-4 text-center py-12 text-stone-500 text-xs sm:text-sm">
                Browse our showroom collection for {activeRoomTab}.
              </div>
            )}
          </div>

          <div className="text-center mt-8 sm:mt-10">
            <button
              onClick={() => selectCategoryFromHome(currentRoomCategory)}
              className="px-6 py-3 bg-white border border-stone-300 hover:border-amber-900 text-stone-900 text-xs font-bold rounded-xl shadow-xs hover:shadow transition-all cursor-pointer"
            >
              Explore Full {activeRoomTab} Range &rarr;
            </button>
          </div>
        </div>
      </section>

      {/* 7. NEW ARRIVALS */}
      <section className="max-w-7xl 2xl:max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Fresh Off the Workshop"
          title="New Arrivals & Trending Designs"
          subtitle="Modern silhouettes engineered with traditional mortise-and-tenon craftsmanship."
          action={
            <button
              onClick={() => {
                resetFilters();
                useApp().updateFilter('sortBy', 'newest');
                setCurrentView('shop');
              }}
              className="text-xs sm:text-sm font-semibold text-amber-900 hover:text-amber-800 flex items-center gap-1 cursor-pointer"
            >
              <span>View All New</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          }
          className="mb-6 sm:mb-8"
        />

        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-6">
          {newArrivals.map((product, idx) => (
            <ProductCard key={product.id} product={product} index={idx} />
          ))}
        </div>
      </section>

      {/* 8. LIVE STOREFRONT PRODUCTS LIST */}
      <section id="storefront-catalog-section" className="max-w-7xl 2xl:max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal animation="fade-up">
          <div className="bg-stone-50/80 border border-stone-200/80 rounded-3xl p-6 sm:p-10 shadow-xs space-y-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-[11px] font-bold text-amber-900 uppercase tracking-widest">
                    Live Showroom Catalog
                  </span>
                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-full border border-emerald-300 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                    <span>Storefront Products</span>
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-stone-900 font-serif-luxury">
                  Storefront Products List ({liveStorefrontProducts.length})
                </h2>
                <p className="text-xs text-stone-500 mt-1">
                  Browse our active showroom collection. New items added via the Admin Dashboard appear here instantly.
                </p>
              </div>

              <div className="relative w-full md:w-72">
                <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={storefrontSearch}
                  onChange={(e) => setStorefrontSearch(e.target.value)}
                  placeholder="Search products, materials, SKU..."
                  className="w-full pl-9 pr-4 py-2.5 bg-white border border-stone-300 rounded-xl text-xs text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-amber-900 shadow-2xs"
                />
                {storefrontSearch && (
                  <button
                    onClick={() => setStorefrontSearch('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 text-xs font-bold"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
              {['All', ...categories.map((c) => c.name)].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setStorefrontFilter(cat)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer ${storefrontFilter === cat
                      ? 'bg-stone-900 text-white shadow-sm'
                      : 'bg-white text-stone-700 hover:bg-stone-200 border border-stone-200'
                    }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {liveStorefrontProducts.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-6">
                {liveStorefrontProducts.slice(0, 8).map((product, idx) => (
                  <ProductCard key={product.id} product={product} index={idx} />
                ))}
              </div>
            ) : (
              <div className="py-12 text-center text-stone-500 text-xs sm:text-sm bg-white rounded-2xl border border-stone-200">
                No products found matching "{storefrontSearch || storefrontFilter}".
              </div>
            )}

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-stone-200 text-xs text-stone-500">
              <span>
                Showing {Math.min(8, liveStorefrontProducts.length)} of {liveStorefrontProducts.length} published products
              </span>
              <button
                onClick={() => {
                  resetFilters();
                  setCurrentView('shop');
                }}
                className="font-bold text-amber-900 hover:text-amber-800 flex items-center gap-1.5 cursor-pointer"
              >
                <span>Explore All in Shop View</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* 9. WHY CHOOSE CP FURNITURE */}
      <section className="max-w-7xl 2xl:max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal animation="fade-up">
          <div className="bg-stone-900 rounded-3xl p-6 sm:p-12 text-white shadow-xl">
            <SectionHeader
              eyebrow="The CP Furniture Standard"
              title="Why 250,000+ Indian Homes Choose Us"
              subtitle="Every curve, dovetail joint, and velvet weave is executed with perfectionist standards."
              align="center"
              className="mb-8 sm:mb-12"
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 text-center">
              <ScrollReveal animation="fade-up" delay={50}>
                <div className="p-5 sm:p-6 rounded-2xl bg-stone-800/60 border border-stone-700/60 h-full">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-amber-900/40 text-amber-400 mx-auto flex items-center justify-center mb-3 sm:mb-4">
                    <Award className="w-6 h-6 sm:w-7 sm:h-7" />
                  </div>
                  <h3 className="font-bold text-sm sm:text-base mb-1.5">100% Seasoned Solid Woods</h3>
                  <p className="text-xs text-stone-400 leading-relaxed">
                    Zero hollow particle boards. We use certified Grade-A Kiln-Dried Teakwood and Sheesham built to last for generations.
                  </p>
                </div>
              </ScrollReveal>

              <ScrollReveal animation="fade-up" delay={150}>
                <div className="p-5 sm:p-6 rounded-2xl bg-stone-800/60 border border-stone-700/60 h-full">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-amber-900/40 text-amber-400 mx-auto flex items-center justify-center mb-3 sm:mb-4">
                    <ShieldCheck className="w-6 h-6 sm:w-7 sm:h-7" />
                  </div>
                  <h3 className="font-bold text-sm sm:text-base mb-1.5">10 to 15-Year Showroom Warranty</h3>
                  <p className="text-xs text-stone-400 leading-relaxed">
                    Complete structural, termite, and borer guarantee with complimentary on-site service at your doorstep.
                  </p>
                </div>
              </ScrollReveal>

              <ScrollReveal animation="fade-up" delay={250}>
                <div className="p-5 sm:p-6 rounded-2xl bg-stone-800/60 border border-stone-700/60 h-full">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-amber-900/40 text-amber-400 mx-auto flex items-center justify-center mb-3 sm:mb-4">
                    <Truck className="w-6 h-6 sm:w-7 sm:h-7" />
                  </div>
                  <h3 className="font-bold text-sm sm:text-base mb-1.5">White-Glove Delivery & Installation</h3>
                  <p className="text-xs text-stone-400 leading-relaxed">
                    Our technicians unpack, assemble, and position your furniture in your room of choice, then remove all packing material.
                  </p>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* 10. CUSTOMER REVIEWS */}
      <section className="max-w-7xl 2xl:max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Real Buyer Feedback"
          title="Loved by Interior Designers & Homeowners"
          subtitle="4.9 / 5.0 Average Rating across 18,500+ Verified Home Installations"
          align="center"
          className="mb-8 sm:mb-10"
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <ScrollReveal animation="fade-up" delay={50}>
            <div className="bg-white p-5 sm:p-6 rounded-2xl border border-stone-200 shadow-2xs space-y-3 h-full">
              <div className="flex text-amber-500">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-current" />
                ))}
              </div>
              <h4 className="font-bold text-sm text-stone-900">
                "The Royal Teak Bed exceeded every expectation."
              </h4>
              <p className="text-xs text-stone-600 leading-relaxed">
                We visited the Indiranagar showroom to feel the wood finish. The hydraulic storage lifts like a feather and the teak grain under natural light is breathtaking.
              </p>
              <div className="pt-2 border-t border-stone-100 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-900 flex items-center justify-center text-xs font-bold">
                  AK
                </div>
                <div>
                  <p className="text-xs font-bold text-stone-900">Ananya & Karthik</p>
                  <p className="text-[10px] text-stone-400">Verified Buyers &bull; Bengaluru</p>
                </div>
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal animation="fade-up" delay={150}>
            <div className="bg-white p-5 sm:p-6 rounded-2xl border border-stone-200 shadow-2xs space-y-3 h-full">
              <div className="flex text-amber-500">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-current" />
                ))}
              </div>
              <h4 className="font-bold text-sm text-stone-900">
                "Velvet L-shaped sectional transformed our apartment."
              </h4>
              <p className="text-xs text-stone-600 leading-relaxed">
                High-density foam feels plush yet supportive. Delivered to our 14th-floor flat in Mumbai on the exact date promised with zero hassle.
              </p>
              <div className="pt-2 border-t border-stone-100 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-900 flex items-center justify-center text-xs font-bold">
                  RM
                </div>
                <div>
                  <p className="text-xs font-bold text-stone-900">Rahul Mehta</p>
                  <p className="text-[10px] text-stone-400">Verified Buyer &bull; Mumbai</p>
                </div>
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal animation="fade-up" delay={250}>
            <div className="bg-white p-5 sm:p-6 rounded-2xl border border-stone-200 shadow-2xs space-y-3 h-full">
              <div className="flex text-amber-500">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-current" />
                ))}
              </div>
              <h4 className="font-bold text-sm text-stone-900">
                "Nordic 6-seater dining table is solid as a fortress."
              </h4>
              <p className="text-xs text-stone-600 leading-relaxed">
                Real Sheesham grain patterns are gorgeous. Assembly team wore shoe covers, checked table level with a spirit level, and gave care wax for free.
              </p>
              <div className="pt-2 border-t border-stone-100 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-900 flex items-center justify-center text-xs font-bold">
                  SP
                </div>
                <div>
                  <p className="text-xs font-bold text-stone-900">Shweta Parikh</p>
                  <p className="text-[10px] text-stone-400">Verified Buyer &bull; Delhi NCR</p>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* 11. SHOWROOM EXPERIENCE & LOCATIONS */}
      <section className="max-w-7xl 2xl:max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal animation="fade-up">
          <div className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-lg p-6 sm:p-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-10 items-center">
              <div>
                <span className="text-[11px] sm:text-xs font-bold text-amber-900 uppercase tracking-widest block mb-1">
                  Touch, Feel & Experience
                </span>
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-stone-900 font-serif-luxury mb-3 sm:mb-4">
                  Visit Our Flagship Experience Centers
                </h2>
                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed mb-6">
                  Step inside our 15,000+ sq.ft designer showrooms. Walk through fully styled master suites, test mattress firmness levels, and work with our in-house interior consultants.
                </p>

                <div className="space-y-3">
                  {websiteContent.showrooms.map((sr) => (
                    <div
                      key={sr.id}
                      className="p-3.5 sm:p-4 rounded-xl border border-stone-200 hover:border-amber-800/60 bg-stone-50/50 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-bold text-xs sm:text-sm text-stone-900">{sr.name}</h4>
                        <span className="text-[10px] font-semibold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                          {sr.city}
                        </span>
                      </div>
                      <p className="text-xs text-stone-500">{sr.address}</p>
                      <div className="flex items-center gap-4 mt-2 text-[11px] text-stone-600">
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3 text-amber-800" /> {sr.phone}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-amber-800" /> {sr.timing}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Consultation Booking Form */}
              <div className="bg-stone-900 rounded-2xl p-6 sm:p-8 text-white">
                <h3 className="text-lg sm:text-xl font-bold font-serif-luxury mb-1.5">
                  Book a Free Showroom Consultation
                </h3>
                <p className="text-xs text-stone-300 mb-5">
                  Receive complimentary 1-on-1 space planning and 3D wood sample swatches.
                </p>

                {consultationSubmitted ? (
                  <div className="bg-emerald-950/80 border border-emerald-500/40 rounded-xl p-5 sm:p-6 text-center space-y-3">
                    <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
                    <h4 className="font-bold text-white text-base">Visit Scheduled!</h4>
                    <p className="text-xs text-stone-300">
                      Thank you {consultName}. Our Indiranagar concierge has reserved your private designer slot. A confirmation SMS was sent to {consultPhone}.
                    </p>
                    <button
                      onClick={() => setConsultationSubmitted(false)}
                      className="text-xs text-amber-400 underline cursor-pointer"
                    >
                      Book for another date
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleBookConsultation} className="space-y-3.5">
                    <div>
                      <label className="text-xs font-semibold text-stone-300 block mb-1">Full Name</label>
                      <input
                        type="text"
                        required
                        value={consultName}
                        onChange={(e) => setConsultName(e.target.value)}
                        placeholder="e.g. Priya Iyer"
                        className="w-full px-3.5 py-2.5 bg-stone-800 border border-stone-700 rounded-xl text-xs text-white placeholder:text-stone-500 focus:outline-none focus:border-amber-500"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-stone-300 block mb-1">Phone Number</label>
                      <input
                        type="tel"
                        required
                        value={consultPhone}
                        onChange={(e) => setConsultPhone(e.target.value)}
                        placeholder="10-digit mobile number"
                        className="w-full px-3.5 py-2.5 bg-stone-800 border border-stone-700 rounded-xl text-xs text-white placeholder:text-stone-500 focus:outline-none focus:border-amber-500"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-stone-300 block mb-1">Select Experience Center</label>
                      <select
                        value={consultCity}
                        onChange={(e) => setConsultCity(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-stone-800 border border-stone-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                      >
                        {websiteContent.showrooms && websiteContent.showrooms.length > 0 ? (
                          websiteContent.showrooms.map((sr) => (
                            <option key={sr.id} value={`${sr.city} - ${sr.name}`}>
                              {sr.city} - {sr.name}
                            </option>
                          ))
                        ) : (
                          <>
                            <option value="Bengaluru">Bengaluru - Indiranagar Flagship</option>
                            <option value="Mumbai">Mumbai - Lower Parel Experience Center</option>
                            <option value="Delhi NCR">Delhi NCR - Sultanpur MG Road</option>
                          </>
                        )}
                      </select>
                    </div>
                    <button
                      type="submit"
                      className="w-full py-3 bg-amber-800 hover:bg-amber-700 text-white text-xs font-bold rounded-xl transition-all shadow-lg mt-2 cursor-pointer"
                    >
                      Confirm Showroom Appointment
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </ScrollReveal>
      </section>
    </div>
  );
};