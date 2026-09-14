import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  Heart,
  ShoppingBag,
  User,
  Menu,
  X,
  Phone,
  MapPin,
  Truck,
  ChevronDown,
  ChevronRight,
  Sparkles,
  SlidersHorizontal,
  Lock,
  LogOut,
  PackageCheck,
  Tag,
  Store,
  Layers,
  Home as HomeIcon
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const Header: React.FC = () => {
  const {
    currentView,
    setCurrentView,
    websiteContent,
    cartItemCount,
    wishlistCount,
    setIsSearchOpen,
    customer,
    customerLogout,
    categories,
    selectCategoryFromHome,
    resetFilters,
    updateFilter
  } = useApp();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeMegaCategory, setActiveMegaCategory] = useState<string | null>(null);
  const [allCategoriesOpen, setAllCategoriesOpen] = useState(false);
  const [accountDropdownOpen, setAccountDropdownOpen] = useState(false);
  const [expandedMobileCategory, setExpandedMobileCategory] = useState<string | null>(null);
  const megaMenuTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Departments mapped to core categories
  const PRIMARY_DEPARTMENTS = [
    { label: 'Living Room', catName: 'Sofas & Seating', badge: 'Popular' },
    { label: 'Bedroom', catName: 'Beds & Bedroom', badge: 'Best Value' },
    { label: 'Dining', catName: 'Dining & Kitchen', badge: '' },
    { label: 'Wardrobes & Storage', catName: 'Wardrobes & Storage', badge: '' },
    { label: 'Study & Office', catName: 'Office & Study', badge: 'Ergonomic' },
    { label: 'Mattresses', catName: 'Mattresses & Pillows', badge: '10-Yr Warranty' },
    { label: 'Lighting & Decor', catName: 'Home Decor & Lighting', badge: '' },
    { label: 'Balcony & Outdoor', catName: 'Outdoor & Balcony', badge: '' }
  ];

  const handleNavClick = (view: any) => {
    if (view === 'shop') {
      resetFilters();
    }
    setCurrentView(view);
    setMobileMenuOpen(false);
    setAllCategoriesOpen(false);
    setActiveMegaCategory(null);
    setAccountDropdownOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCategorySelect = (catName: string, subcategory?: string) => {
    selectCategoryFromHome(catName, subcategory);
    setAllCategoriesOpen(false);
    setActiveMegaCategory(null);
    setMobileMenuOpen(false);
  };

  const handleMegaMouseEnter = (catName: string) => {
    if (megaMenuTimeoutRef.current) clearTimeout(megaMenuTimeoutRef.current);
    setActiveMegaCategory(catName);
    setAllCategoriesOpen(false);
  };

  const handleMegaMouseLeave = () => {
    megaMenuTimeoutRef.current = setTimeout(() => {
      setActiveMegaCategory(null);
    }, 150);
  };

  // Helper to get category object by name
  const getCategoryDetails = (catName: string) => {
    return categories.find(
      (c) => c.name.toLowerCase() === catName.toLowerCase() || c.slug === catName.toLowerCase()
    );
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-stone-200 shadow-xs">
      {/* 1. TOP UTILITY & ANNOUNCEMENT BAR */}
      <div id="top-announcement-bar" className="bg-stone-900 text-stone-300 text-xs border-b border-stone-800">
        <div className="max-w-7xl 2xl:max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-1.5 flex items-center justify-between gap-4">
          {/* Left: Showroom locator & Hotline */}
          <div className="hidden md:flex items-center space-x-5 text-stone-400 text-[11px]">
            <button
              onClick={() => handleNavClick('showrooms')}
              className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer"
            >
              <MapPin className="w-3.5 h-3.5 text-amber-500" />
              <span>Showrooms ({websiteContent.showrooms?.length || 3} Centers)</span>
            </button>
            <span className="text-stone-700">|</span>
            <a
              href={`tel:${websiteContent.contactPhone}`}
              className="flex items-center gap-1.5 hover:text-white transition-colors"
            >
              <Phone className="w-3.5 h-3.5 text-amber-500" />
              <span>{websiteContent.contactPhone}</span>
            </a>
          </div>

          {/* Center Announcement */}
          {websiteContent.announcementEnabled !== false && websiteContent.announcement?.trim() ? (
            <div className="flex-1 text-center font-medium text-amber-300 text-xs flex items-center justify-center gap-2 overflow-hidden px-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0 animate-pulse" />
              <span className="truncate">{websiteContent.announcement}</span>
            </div>
          ) : (
            <div className="flex-1 text-center text-stone-400 text-xs hidden sm:flex items-center justify-center gap-1.5 font-serif-luxury italic">
              <span>Authentic Handcrafted Luxury Living &bull; Seasoned Solid Teak</span>
            </div>
          )}

          {/* Right: Order Tracking & Admin Portal Access */}
          <div className="flex items-center space-x-3 text-[11px]">
            <button
              id="header-track-order-btn"
              onClick={() => handleNavClick('account')}
              className="text-stone-400 hover:text-white transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Truck className="w-3.5 h-3.5 text-amber-500" />
              <span>Track Order</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. MAIN HEADER BAR (Brand Logo, Live Search, Action Icons) */}
      <div className="max-w-7xl 2xl:max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-3 sm:gap-6">
          {/* Mobile Menu Hamburger Button */}
          <button
            id="mobile-menu-toggle-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-stone-700 hover:text-stone-950 hover:bg-stone-100 rounded-lg focus:outline-none transition-colors"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          {/* Brand Identity Logo */}
          <div
            id="cp-brand-logo"
            onClick={() => handleNavClick('home')}
            className="cursor-pointer flex flex-col items-start select-none group shrink-0"
          >
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight text-stone-900 font-serif-luxury group-hover:text-amber-900 transition-colors">
                CP
              </span>
              <span className="text-xl sm:text-2xl lg:text-3xl font-light tracking-widest text-amber-800 uppercase">
                FURNITURE
              </span>
            </div>
            <span className="text-[9px] sm:text-[10px] tracking-[0.2em] text-stone-500 font-medium uppercase -mt-0.5 sm:-mt-1 pl-0.5">
              Showroom &bull; Handcrafted
            </span>
          </div>

          {/* Prominent Live Search Bar (Medium & Large screens) */}
          <div className="hidden md:flex flex-1 max-w-md lg:max-w-xl mx-2 lg:mx-6">
            <button
              onClick={() => setIsSearchOpen(true)}
              className="w-full flex items-center justify-between px-4 py-2.5 bg-stone-100/90 hover:bg-stone-100 text-stone-500 hover:text-stone-800 rounded-xl border border-stone-200 text-xs transition-all shadow-2xs group cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <Search className="w-4 h-4 text-amber-800 group-hover:scale-110 transition-transform" />
                <span className="text-stone-500 truncate">
                  Search sofas, beds, dining, wardrobes, study desks...
                </span>
              </div>
              <kbd className="hidden lg:inline-block px-1.5 py-0.5 bg-white border border-stone-300 text-stone-400 rounded text-[10px] font-mono">
                ⌘K
              </kbd>
            </button>
          </div>

          {/* Action Icons */}
          <div className="flex items-center space-x-1.5 sm:space-x-3 shrink-0">
            {/* Search Trigger for Mobile */}
            <button
              id="header-search-mobile-btn"
              onClick={() => setIsSearchOpen(true)}
              className="md:hidden p-2 text-stone-700 hover:text-stone-950 hover:bg-stone-100 rounded-full transition-colors"
              title="Search"
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Wishlist */}
            <button
              id="header-wishlist-btn"
              onClick={() => handleNavClick('wishlist')}
              className="p-2 text-stone-700 hover:text-stone-950 hover:bg-stone-100 rounded-full transition-colors relative"
              title="View Wishlist"
              aria-label="Wishlist"
            >
              <Heart className="w-5 h-5 hover:text-red-600 transition-colors" />
              {wishlistCount > 0 && (
                <span
                  id="header-wishlist-badge"
                  className="absolute -top-0.5 -right-0.5 bg-amber-800 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow"
                >
                  {wishlistCount}
                </span>
              )}
            </button>

            {/* Cart Button */}
            <button
              id="header-cart-btn"
              onClick={() => handleNavClick('cart')}
              className="p-2 text-stone-700 hover:text-stone-950 hover:bg-stone-100 rounded-full transition-colors relative"
              title="View Shopping Cart"
              aria-label="Shopping Cart"
            >
              <ShoppingBag className="w-5 h-5" />
              {cartItemCount > 0 && (
                <span
                  id="header-cart-badge"
                  className="absolute -top-0.5 -right-0.5 bg-stone-900 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow"
                >
                  {cartItemCount}
                </span>
              )}
            </button>

            {/* Customer Account Button / Dropdown */}
            <div className="relative">
              {customer ? (
                <button
                  id="header-account-btn"
                  onClick={() => setAccountDropdownOpen(!accountDropdownOpen)}
                  className="flex items-center gap-1.5 py-1.5 px-2.5 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-800 transition-colors text-xs font-semibold cursor-pointer"
                >
                  {customer.avatar ? (
                    <img
                      src={customer.avatar}
                      alt={customer.name}
                      className="w-6 h-6 rounded-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-amber-800 text-white flex items-center justify-center text-xs font-bold">
                      {customer.name.charAt(0)}
                    </div>
                  )}
                  <span className="hidden sm:inline max-w-[90px] truncate">{customer.name.split(' ')[0]}</span>
                  <ChevronDown className="w-3 h-3 text-stone-500" />
                </button>
              ) : (
                <button
                  id="header-signin-btn"
                  onClick={() => handleNavClick('auth')}
                  className="flex items-center gap-1.5 py-1.5 px-3.5 rounded-full bg-stone-900 hover:bg-amber-900 text-white text-xs font-semibold transition-all shadow-xs cursor-pointer"
                >
                  <User className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Sign In</span>
                </button>
              )}

              {/* Account Dropdown Menu */}
              {accountDropdownOpen && customer && (
                <div
                  onMouseLeave={() => setAccountDropdownOpen(false)}
                  className="absolute right-0 top-full mt-2 w-60 bg-white border border-stone-200 rounded-2xl shadow-xl py-2 z-50 animate-in fade-in"
                >
                  <div className="px-4 py-2.5 border-b border-stone-100">
                    <p className="text-[11px] text-stone-400">Signed in as</p>
                    <p className="text-xs font-bold text-stone-900 truncate">{customer.name}</p>
                    <p className="text-[11px] text-stone-500 truncate">{customer.email}</p>
                  </div>
                  <button
                    onClick={() => handleNavClick('account')}
                    className="w-full text-left px-4 py-2 text-xs text-stone-700 hover:bg-stone-50 flex items-center gap-2.5 transition-colors"
                  >
                    <User className="w-3.5 h-3.5 text-stone-400" /> My Profile & Dashboard
                  </button>
                  <button
                    onClick={() => handleNavClick('account')}
                    className="w-full text-left px-4 py-2 text-xs text-stone-700 hover:bg-stone-50 flex items-center gap-2.5 transition-colors"
                  >
                    <PackageCheck className="w-3.5 h-3.5 text-stone-400" /> Orders & Invoices
                  </button>
                  <button
                    onClick={() => handleNavClick('wishlist')}
                    className="w-full text-left px-4 py-2 text-xs text-stone-700 hover:bg-stone-50 flex items-center gap-2.5 transition-colors"
                  >
                    <Heart className="w-3.5 h-3.5 text-stone-400" /> Saved Wishlist ({wishlistCount})
                  </button>
                  <div className="border-t border-stone-100 my-1"></div>
                  <button
                    onClick={() => {
                      customerLogout();
                      setAccountDropdownOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-xs text-red-600 hover:bg-red-50 flex items-center gap-2.5 font-medium transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" /> Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 3. PRIMARY DEPARTMENT NAVIGATION BAR (DESKTOP & TABLETS) */}
      <nav className="hidden md:block bg-stone-50/80 border-t border-stone-200">
        <div className="max-w-7xl 2xl:max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-11 text-xs font-semibold text-stone-700">
            {/* All Catalog Categories Button */}
            <div
              className="relative"
              onMouseEnter={() => {
                if (megaMenuTimeoutRef.current) clearTimeout(megaMenuTimeoutRef.current);
                setAllCategoriesOpen(true);
                setActiveMegaCategory(null);
              }}
              onMouseLeave={() => {
                megaMenuTimeoutRef.current = setTimeout(() => setAllCategoriesOpen(false), 150);
              }}
            >
              <button
                id="nav-all-categories-btn"
                onClick={() => setAllCategoriesOpen(!allCategoriesOpen)}
                className="flex items-center gap-1.5 py-2 px-3 hover:text-amber-900 transition-colors cursor-pointer"
              >
                <Layers className="w-4 h-4 text-amber-800" />
                <span className="font-bold text-stone-900">All Departments</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${allCategoriesOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* All Categories Mega Panel */}
              {allCategoriesOpen && (
                <div
                  className="absolute left-0 top-full w-96 bg-white border border-stone-200 rounded-2xl shadow-2xl p-4 z-50 animate-in fade-in slide-in-from-top-1 duration-150"
                  onMouseEnter={() => {
                    if (megaMenuTimeoutRef.current) clearTimeout(megaMenuTimeoutRef.current);
                  }}
                  onMouseLeave={() => setAllCategoriesOpen(false)}
                >
                  <div className="flex items-center justify-between pb-2 border-b border-stone-100 mb-2">
                    <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">
                      Complete Showroom Catalog
                    </span>
                    <button
                      onClick={() => handleNavClick('shop')}
                      className="text-[11px] font-bold text-amber-800 hover:underline"
                    >
                      Shop All Catalog &rarr;
                    </button>
                  </div>

                  <div className="grid grid-cols-1 gap-1 max-h-[420px] overflow-y-auto pr-1">
                    {categories.map((cat) => (
                      <div key={cat.id} className="p-2 hover:bg-stone-50 rounded-xl transition-colors group">
                        <button
                          onClick={() => handleCategorySelect(cat.name)}
                          className="w-full text-left font-bold text-stone-900 group-hover:text-amber-900 flex items-center justify-between text-xs"
                        >
                          <span>{cat.name}</span>
                          <span className="text-[10px] text-stone-400 group-hover:text-amber-800">&rarr;</span>
                        </button>
                        {cat.subcategories && cat.subcategories.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-1.5">
                            {cat.subcategories.slice(0, 4).map((sub, i) => (
                              <button
                                key={i}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCategorySelect(cat.name, sub);
                                }}
                                className="text-[11px] px-2 py-0.5 bg-stone-100 hover:bg-amber-100 hover:text-amber-900 text-stone-600 rounded transition-colors"
                              >
                                {sub}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Department Quick Links with Subcategory Flyouts */}
            <div className="flex items-center space-x-1 xl:space-x-2">
              {PRIMARY_DEPARTMENTS.map((dept) => {
                const catDetails = getCategoryDetails(dept.catName);
                const isHovered = activeMegaCategory === dept.catName;

                return (
                  <div
                    key={dept.label}
                    className="relative"
                    onMouseEnter={() => handleMegaMouseEnter(dept.catName)}
                    onMouseLeave={handleMegaMouseLeave}
                  >
                    <button
                      onClick={() => handleCategorySelect(dept.catName)}
                      className={`px-2.5 py-2 hover:text-amber-900 transition-colors flex items-center gap-1 cursor-pointer ${
                        isHovered ? 'text-amber-900 font-bold' : ''
                      }`}
                    >
                      <span>{dept.label}</span>
                      {catDetails?.subcategories && catDetails.subcategories.length > 0 && (
                        <ChevronDown className="w-3 h-3 text-stone-400" />
                      )}
                    </button>

                    {/* Flyout Subcategories Panel */}
                    {isHovered && catDetails && (
                      <div
                        className="absolute left-0 top-full w-72 bg-white border border-stone-200 rounded-2xl shadow-xl p-3.5 z-50 animate-in fade-in slide-in-from-top-1 duration-150"
                        onMouseEnter={() => {
                          if (megaMenuTimeoutRef.current) clearTimeout(megaMenuTimeoutRef.current);
                        }}
                        onMouseLeave={handleMegaMouseLeave}
                      >
                        <div className="flex items-center justify-between pb-2 mb-2 border-b border-stone-100">
                          <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">
                            {catDetails.name}
                          </span>
                          {dept.badge && (
                            <span className="text-[9px] bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded font-bold">
                              {dept.badge}
                            </span>
                          )}
                        </div>

                        <div className="space-y-1">
                          {catDetails.subcategories.map((sub, idx) => (
                            <button
                              key={idx}
                              onClick={() => handleCategorySelect(catDetails.name, sub)}
                              className="w-full text-left px-2.5 py-1.5 text-xs text-stone-700 hover:bg-amber-50 hover:text-amber-900 rounded-lg flex items-center justify-between transition-colors"
                            >
                              <span>{sub}</span>
                              <ChevronRight className="w-3 h-3 text-stone-300 group-hover:text-amber-800" />
                            </button>
                          ))}
                        </div>

                        <div className="mt-2.5 pt-2 border-t border-stone-100">
                          <button
                            onClick={() => handleCategorySelect(catDetails.name)}
                            className="w-full py-1.5 px-3 bg-stone-50 hover:bg-stone-100 text-amber-900 font-bold text-[11px] rounded-lg text-center transition-colors"
                          >
                            Explore All {catDetails.name} &rarr;
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Right Specials: New Arrivals & Offers & Showrooms */}
            <div className="flex items-center space-x-2 pl-2 border-l border-stone-200 shrink-0">
              <button
                id="nav-new-arrivals-btn"
                onClick={() => {
                  resetFilters();
                  updateFilter('sortBy', 'newest');
                  setCurrentView('shop');
                }}
                className="px-2 py-1.5 hover:text-amber-900 transition-colors text-stone-700 cursor-pointer"
              >
                New In
              </button>

              <button
                id="nav-offers-btn"
                onClick={() => handleNavClick('offers')}
                className="px-2.5 py-1 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-full transition-colors flex items-center gap-1 font-bold cursor-pointer"
              >
                <Sparkles className="w-3 h-3 text-amber-700" />
                <span>Sale & Offers</span>
              </button>

              <button
                id="nav-showrooms-link"
                onClick={() => handleNavClick('showrooms')}
                className="px-2 py-1.5 hover:text-amber-900 transition-colors text-stone-700 cursor-pointer flex items-center gap-1"
              >
                <Store className="w-3.5 h-3.5 text-stone-500" />
                <span>Showrooms</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* 4. MOBILE NAVIGATION DRAWER */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-stone-200 px-4 pt-3 pb-8 space-y-4 shadow-2xl max-h-[85vh] overflow-y-auto animate-in slide-in-from-top-2 duration-200">
          {/* Search Bar inside Drawer */}
          <div className="relative">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                setIsSearchOpen(true);
              }}
              className="w-full flex items-center gap-2.5 px-3.5 py-2.5 bg-stone-100 rounded-xl text-stone-500 text-xs border border-stone-200"
            >
              <Search className="w-4 h-4 text-amber-800" />
              <span>Search furniture, sets, dimensions...</span>
            </button>
          </div>

          {/* Quick Primary Actions */}
          <div className="grid grid-cols-2 gap-2 text-xs font-bold">
            <button
              onClick={() => handleNavClick('home')}
              className={`p-2.5 rounded-xl border flex items-center gap-2 ${
                currentView === 'home' ? 'bg-amber-50 border-amber-300 text-amber-900' : 'bg-stone-50 border-stone-200 text-stone-800'
              }`}
            >
              <HomeIcon className="w-4 h-4 text-amber-800" />
              <span>Home</span>
            </button>
            <button
              onClick={() => handleNavClick('shop')}
              className={`p-2.5 rounded-xl border flex items-center gap-2 ${
                currentView === 'shop' ? 'bg-amber-50 border-amber-300 text-amber-900' : 'bg-stone-50 border-stone-200 text-stone-800'
              }`}
            >
              <SlidersHorizontal className="w-4 h-4 text-amber-800" />
              <span>Shop All Catalog</span>
            </button>
            <button
              onClick={() => handleNavClick('offers')}
              className="p-2.5 rounded-xl bg-amber-100/80 border border-amber-300 text-amber-950 flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-amber-700" />
              <span>Offers & Deals</span>
            </button>
            <button
              onClick={() => handleNavClick('showrooms')}
              className="p-2.5 rounded-xl bg-stone-50 border border-stone-200 text-stone-800 flex items-center gap-2"
            >
              <MapPin className="w-4 h-4 text-amber-700" />
              <span>Showrooms</span>
            </button>
          </div>

          {/* Room / Department Accordion Navigation */}
          <div className="pt-2 border-t border-stone-100">
            <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block mb-2">
              Browse by Department
            </span>
            <div className="space-y-1">
              {categories.map((cat) => {
                const isExpanded = expandedMobileCategory === cat.id;

                return (
                  <div key={cat.id} className="border border-stone-100 rounded-xl overflow-hidden">
                    <div className="flex items-center justify-between p-2.5 bg-stone-50/70 hover:bg-stone-100 transition-colors">
                      <button
                        onClick={() => handleCategorySelect(cat.name)}
                        className="text-left text-xs font-bold text-stone-900 hover:text-amber-900 flex-1"
                      >
                        {cat.name}
                      </button>

                      {cat.subcategories && cat.subcategories.length > 0 && (
                        <button
                          onClick={() => setExpandedMobileCategory(isExpanded ? null : cat.id)}
                          className="p-1 text-stone-500 hover:text-stone-900"
                          aria-label="Expand category"
                        >
                          <ChevronDown className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                        </button>
                      )}
                    </div>

                    {isExpanded && cat.subcategories && (
                      <div className="bg-white p-2.5 pl-4 border-t border-stone-100 grid grid-cols-1 gap-1">
                        {cat.subcategories.map((sub, i) => (
                          <button
                            key={i}
                            onClick={() => handleCategorySelect(cat.name, sub)}
                            className="text-left text-xs py-1.5 px-2 text-stone-600 hover:text-amber-900 hover:bg-amber-50 rounded-lg flex items-center justify-between"
                          >
                            <span>{sub}</span>
                            <ChevronRight className="w-3 h-3 text-stone-300" />
                          </button>
                        ))}
                        <button
                          onClick={() => handleCategorySelect(cat.name)}
                          className="text-left text-xs font-bold text-amber-800 py-1.5 px-2 hover:underline mt-1"
                        >
                          View All in {cat.name} &rarr;
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Customer Account & Admin Shortcuts */}
          <div className="pt-3 border-t border-stone-100 space-y-2">
            <button
              onClick={() => handleNavClick(customer ? 'account' : 'auth')}
              className="w-full text-left px-3.5 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold flex items-center justify-between"
            >
              <div className="flex items-center gap-2.5">
                <User className="w-4 h-4 text-stone-600" />
                <span>{customer ? `My Account (${customer.name.split(' ')[0]})` : 'Customer Login / Register'}</span>
              </div>
              <ChevronRight className="w-4 h-4 text-stone-400" />
            </button>
          </div>
        </div>
      )}

      {/* 5. MOBILE STICKY BOTTOM NAVIGATION BAR */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-stone-200/90 px-1.5 sm:px-3 py-1.5 flex items-center justify-around shadow-2xl safe-area-bottom">
        <button
          onClick={() => handleNavClick('home')}
          className={`flex flex-col items-center justify-center gap-0.5 min-w-[48px] py-1 px-1.5 rounded-xl text-[10px] font-bold transition-all cursor-pointer ${
            currentView === 'home' ? 'text-amber-900 bg-amber-50 font-black' : 'text-stone-500 hover:text-stone-900'
          }`}
        >
          <HomeIcon className="w-4 h-4 sm:w-5 sm:h-5" />
          <span>Home</span>
        </button>

        <button
          onClick={() => handleNavClick('shop')}
          className={`flex flex-col items-center justify-center gap-0.5 min-w-[48px] py-1 px-1.5 rounded-xl text-[10px] font-bold transition-all cursor-pointer ${
            currentView === 'shop' ? 'text-amber-900 bg-amber-50 font-black' : 'text-stone-500 hover:text-stone-900'
          }`}
        >
          <SlidersHorizontal className="w-4 h-4 sm:w-5 sm:h-5" />
          <span>Shop</span>
        </button>

        <button
          onClick={() => setIsSearchOpen(true)}
          className="flex flex-col items-center justify-center gap-0.5 min-w-[48px] py-1 px-1.5 rounded-xl text-[10px] font-bold text-stone-500 hover:text-stone-900 transition-all cursor-pointer"
        >
          <Search className="w-4 h-4 sm:w-5 sm:h-5" />
          <span>Search</span>
        </button>

        <button
          onClick={() => handleNavClick('wishlist')}
          className={`flex flex-col items-center justify-center gap-0.5 min-w-[48px] py-1 px-1.5 rounded-xl text-[10px] font-bold relative transition-all cursor-pointer ${
            currentView === 'wishlist' ? 'text-amber-900 bg-amber-50 font-black' : 'text-stone-500 hover:text-stone-900'
          }`}
        >
          <Heart className="w-4 h-4 sm:w-5 sm:h-5" />
          {wishlistCount > 0 && (
            <span className="absolute 0 right-1.5 bg-amber-800 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center ring-1 ring-white">
              {wishlistCount}
            </span>
          )}
          <span>Wishlist</span>
        </button>

        <button
          onClick={() => handleNavClick('cart')}
          className={`flex flex-col items-center justify-center gap-0.5 min-w-[48px] py-1 px-1.5 rounded-xl text-[10px] font-bold relative transition-all cursor-pointer ${
            currentView === 'cart' ? 'text-amber-900 bg-amber-50 font-black' : 'text-stone-500 hover:text-stone-900'
          }`}
        >
          <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5" />
          {cartItemCount > 0 && (
            <span className="absolute 0 right-1.5 bg-stone-900 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center ring-1 ring-white">
              {cartItemCount}
            </span>
          )}
          <span>Cart</span>
        </button>

        <button
          onClick={() => handleNavClick(customer ? 'account' : 'auth')}
          className={`flex flex-col items-center justify-center gap-0.5 min-w-[48px] py-1 px-1.5 rounded-xl text-[10px] font-bold transition-all cursor-pointer ${
            currentView === 'account' || currentView === 'auth' ? 'text-amber-900 bg-amber-50 font-black' : 'text-stone-500 hover:text-stone-900'
          }`}
        >
          <User className="w-4 h-4 sm:w-5 sm:h-5" />
          <span>{customer ? 'Account' : 'Login'}</span>
        </button>
      </div>
    </header>
  );
};
