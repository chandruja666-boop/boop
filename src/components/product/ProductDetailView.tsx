import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Star,
  Heart,
  ShoppingBag,
  Truck,
  ShieldCheck,
  RotateCcw,
  Share2,
  Check,
  Plus,
  Minus,
  Sparkles,
  MapPin,
  Clock,
  ArrowRight,
  Info,
  CheckCircle2,
  Layers,
  ChevronLeft,
  ChevronRight,
  ThumbsUp,
  MessageSquare,
  Filter,
  Award,
  Maximize2,
  X,
  Eye,
  Bell
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ProductCard } from '../common/ProductCard';
import { ScrollReveal, SectionHeader } from '../common/ScrollReveal';
import { CustomerReview } from '../../types';
import { ARPreviewModal } from './ARPreviewModal';

export const ProductDetailView: React.FC = () => {
  const {
    selectedProductId,
    products,
    addToCart,
    quickBuyNow,
    toggleWishlist,
    customer,
    refreshCustomer,
    showToast,
    selectCategoryFromHome,
    openProductDetail,
    reviews,
    addCustomerReview
  } = useApp();

  const product = products.find((p) => p.id === selectedProductId) || products[0];

  const galleryRef = useRef<HTMLDivElement>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [showLightbox, setShowLightbox] = useState(false);
  const [isSwiping, setIsSwiping] = useState(false);
  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);

  const [selectedColor, setSelectedColor] = useState<string>(
    product?.colors[0]?.name || ''
  );
  const [selectedSize, setSelectedSize] = useState<string>(
    product?.sizes[0] || ''
  );
  const [quantity, setQuantity] = useState(1);
  const [pincode, setPincode] = useState('560001');
  const [pincodeChecked, setPincodeChecked] = useState(true);
  const [activeTab, setActiveTab] = useState<'desc' | 'specs' | 'care' | 'warranty' | 'returns'>('desc');
  const [showEmiModal, setShowEmiModal] = useState(false);
  const [showARModal, setShowARModal] = useState(false);

  // Notification states
  const [notifyEmail, setNotifyEmail] = useState<string>('');
  const [hasSubscribed, setHasSubscribed] = useState<boolean>(false);

  // Sync notification state on product/customer change
  useEffect(() => {
    if (customer?.email) {
      setNotifyEmail(customer.email);
    } else {
      setNotifyEmail('');
    }
    setHasSubscribed(false);
  }, [product?.id, customer]);

  const handleNotifyMe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!notifyEmail || !notifyEmail.includes('@')) {
      showToast('Please enter a valid email address.', 'error');
      return;
    }

    const existing = localStorage.getItem('cpf_back_in_stock_subscriptions_v1');
    const list = existing ? JSON.parse(existing) : [];

    const newSub = {
      id: `sub_${Math.random().toString(36).substr(2, 9)}`,
      productId: product.id,
      productName: product.name,
      sku: product.sku,
      email: notifyEmail.trim(),
      date: new Date().toISOString().substring(0, 10),
      status: 'pending'
    };

    list.push(newSub);
    localStorage.setItem('cpf_back_in_stock_subscriptions_v1', JSON.stringify(list));
    setHasSubscribed(true);
    showToast(`Bespoke restock alert confirmed for ${notifyEmail}. We will notify you instantly!`, 'success');
  };

  // Reviews State
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [reviewHeadline, setReviewHeadline] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [reviewAuthorName, setReviewAuthorName] = useState(customer?.name || '');
  const [reviewAuthorCity, setReviewAuthorCity] = useState(customer?.addresses[0]?.city || '');
  const [reviewFilterRating, setReviewFilterRating] = useState<number | 'all'>('all');
  const [reviewSort, setReviewSort] = useState<'newest' | 'highest' | 'lowest'>('newest');
  const [helpfulCounts, setHelpfulCounts] = useState<Record<string, number>>({});

  // Scroll to selected image in gallery
  const scrollToImage = (index: number) => {
    const safeIndex = Math.max(0, Math.min((product?.images?.length || 1) - 1, index));
    setActiveImageIndex(safeIndex);
    if (galleryRef.current) {
      const container = galleryRef.current;
      const slideWidth = container.clientWidth;
      container.scrollTo({
        left: safeIndex * slideWidth,
        behavior: 'smooth'
      });
    }
  };

  const handleNextImage = () => {
    if (!product?.images?.length) return;
    const nextIdx = (activeImageIndex + 1) % product.images.length;
    scrollToImage(nextIdx);
  };

  const handlePrevImage = () => {
    if (!product?.images?.length) return;
    const prevIdx = (activeImageIndex - 1 + product.images.length) % product.images.length;
    scrollToImage(prevIdx);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
    touchEndX.current = e.targetTouches[0].clientX;
    setIsSwiping(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!isSwiping) return;
    setIsSwiping(false);
    const distance = touchStartX.current - touchEndX.current;
    const threshold = 40; // minimum px swipe threshold
    if (distance > threshold) {
      // Swiped Left -> Next
      handleNextImage();
    } else if (distance < -threshold) {
      // Swiped Right -> Previous
      handlePrevImage();
    }
  };

  const handleGalleryScroll = () => {
    if (!galleryRef.current) return;
    const container = galleryRef.current;
    const { scrollLeft, clientWidth } = container;
    if (clientWidth > 0) {
      const newIdx = Math.round(scrollLeft / clientWidth);
      if (newIdx !== activeImageIndex && newIdx >= 0 && newIdx < (product?.images?.length || 0)) {
        setActiveImageIndex(newIdx);
      }
    }
  };

  // Sync reviewer details when customer changes
  React.useEffect(() => {
    if (customer) {
      if (!reviewAuthorName) setReviewAuthorName(customer.name);
      if (!reviewAuthorCity && customer.addresses?.[0]?.city) {
        setReviewAuthorCity(`${customer.addresses[0].city}, ${customer.addresses[0].state || ''}`);
      }
    }
  }, [customer]);

  // Update selection when product changes
  React.useEffect(() => {
    if (product) {
      scrollToImage(0);
      setSelectedColor(product.colors[0]?.name || '');
      setSelectedSize(product.sizes[0] || '');
      setQuantity(1);
    }
  }, [product]);

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h2 className="text-xl font-bold">Product not found</h2>
      </div>
    );
  }

  const isWishlisted = customer?.wishlist.includes(product.id);
  const isOutOfStock = product.stock <= 0;

  // Monthly EMI estimation (3 months, 6 months)
  const emiPerMonth = Math.round(product.salePrice / 6);

  // Frequently bought together bundle
  const bundleItems = useMemo(() => {
    if (!product.frequentlyBoughtWith || product.frequentlyBoughtWith.length === 0) {
      return products.filter((p) => p.id !== product.id).slice(0, 2);
    }
    return products.filter((p) => product.frequentlyBoughtWith?.includes(p.id));
  }, [product, products]);

  const bundleTotal = product.salePrice + bundleItems.reduce((acc, item) => acc + item.salePrice, 0);
  const bundleDiscounted = Math.round(bundleTotal * 0.95); // extra 5% bundle discount

  const handleAddBundle = () => {
    addToCart(product.id, 1, selectedColor, selectedSize);
    bundleItems.forEach((b) => addToCart(b.id, 1));
    showToast('Bundle added to cart with extra 5% combo savings!', 'success');
  };

  const handlePincodeCheck = (e: React.FormEvent) => {
    e.preventDefault();
    if (pincode.trim().length === 6) {
      setPincodeChecked(true);
      showToast(`Pincode ${pincode} eligible for Free White-Glove delivery & assembly!`, 'success');
    } else {
      showToast('Please enter a valid 6-digit postal code.', 'warning');
    }
  };

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    showToast('Product link copied to clipboard!', 'info');
  };

  const productReviews = useMemo(() => {
    return reviews.filter(
      (r) => r.productId === product.id && (r.status === 'published' || !r.status)
    );
  }, [reviews, product.id]);

  const ratingStats = useMemo(() => {
    const total = productReviews.length;
    if (total === 0) {
      return {
        average: product.rating || 5.0,
        count: 0,
        distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 } as Record<number, number>,
        recommendPercent: 100
      };
    }
    const sum = productReviews.reduce((acc, r) => acc + (Number(r.rating) || 5), 0);
    const avg = Number((sum / total).toFixed(1));
    const distribution: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    let positiveCount = 0;
    productReviews.forEach((r) => {
      const star = Math.max(1, Math.min(5, Math.round(Number(r.rating) || 5)));
      distribution[star] = (distribution[star] || 0) + 1;
      if (star >= 4) positiveCount++;
    });
    const recommendPercent = Math.round((positiveCount / total) * 100);
    return {
      average: avg,
      count: total,
      distribution,
      recommendPercent
    };
  }, [productReviews, product.rating]);

  const filteredReviews = useMemo(() => {
    let list = [...productReviews];
    if (reviewFilterRating !== 'all') {
      list = list.filter((r) => Math.round(Number(r.rating)) === reviewFilterRating);
    }
    if (reviewSort === 'newest') {
      list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    } else if (reviewSort === 'highest') {
      list.sort((a, b) => (b.rating || 5) - (a.rating || 5));
    } else if (reviewSort === 'lowest') {
      list.sort((a, b) => (a.rating || 5) - (b.rating || 5));
    }
    return list;
  }, [productReviews, reviewFilterRating, reviewSort]);

  const handleAddReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewHeadline.trim() || !reviewComment.trim()) {
      showToast('Please fill out both the headline and review text.', 'warning');
      return;
    }

    addCustomerReview({
      productId: product.id,
      productName: product.name,
      productImage: product.images[0] || 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80',
      rating: reviewRating,
      headline: reviewHeadline.trim(),
      comment: reviewComment.trim(),
      authorName: reviewAuthorName.trim() || customer?.name || 'Verified Customer',
      authorEmail: customer?.email || 'customer@cpfurniture.com',
      authorCity: reviewAuthorCity.trim() || 'Bengaluru, India',
      verified: true,
      status: 'published'
    });

    setShowReviewForm(false);
    setReviewHeadline('');
    setReviewComment('');
    setReviewRating(5);
  };

  const handleToggleHelpful = (reviewId: string) => {
    setHelpfulCounts((prev) => ({
      ...prev,
      [reviewId]: (prev[reviewId] || 0) + 1
    }));
    showToast('Marked as helpful. Thank you for your feedback!', 'info');
  };

  // Similar Products in the same category
  const similarProducts = products
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-16 pb-28 sm:pb-32 lg:pb-16">
      {/* Breadcrumb Navigation */}
      <nav className="text-xs text-stone-500 flex items-center gap-1.5 flex-wrap">
        <button onClick={() => selectCategoryFromHome('')} className="hover:text-amber-800">
          Home
        </button>
        <span>/</span>
        <button
          onClick={() => selectCategoryFromHome(product.category)}
          className="hover:text-amber-800"
        >
          {product.category}
        </button>
        <span>/</span>
        <span className="text-stone-900 font-medium truncate max-w-xs">{product.name}</span>
      </nav>

      {/* Product Hero: Image Gallery & Core Buy Box */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Images Stage (7 cols on lg) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Main Large Image & Swipeable Touch Carousel */}
          <div className="relative aspect-[4/3] rounded-3xl overflow-hidden bg-stone-100 border border-stone-200 shadow-md group select-none">
            {/* Horizontal Swipeable Track */}
            <div
              ref={galleryRef}
              onScroll={handleGalleryScroll}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              className="w-full h-full flex overflow-x-auto snap-x snap-mandatory scroll-smooth no-scrollbar"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {product.images.map((img, idx) => (
                <div
                  key={idx}
                  className="w-full h-full min-w-full shrink-0 snap-center relative overflow-hidden flex items-center justify-center bg-stone-100 cursor-zoom-in"
                  onClick={() => setShowLightbox(true)}
                >
                  <img
                    src={img}
                    alt={`${product.name} angle ${idx + 1}`}
                    className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                    referrerPolicy="no-referrer"
                    loading={idx === 0 ? 'eager' : 'lazy'}
                  />
                </div>
              ))}
            </div>

            {/* Left & Right Chevron Navigation Overlay (Visible on Hover / Always accessible on touch) */}
            {product.images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePrevImage();
                  }}
                  aria-label="Previous image"
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 hover:bg-white text-stone-800 shadow-lg flex items-center justify-center transition-all opacity-80 sm:opacity-0 group-hover:opacity-100 hover:scale-110 active:scale-95 z-10 border border-stone-200/50 backdrop-blur-sm cursor-pointer"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNextImage();
                  }}
                  aria-label="Next image"
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 hover:bg-white text-stone-800 shadow-lg flex items-center justify-center transition-all opacity-80 sm:opacity-0 group-hover:opacity-100 hover:scale-110 active:scale-95 z-10 border border-stone-200/50 backdrop-blur-sm cursor-pointer"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}

            {/* Badges Overlay */}
            <div className="absolute top-4 left-4 flex flex-col gap-2 z-10 pointer-events-none">
              {product.discount > 0 && (
                <span className="bg-amber-800 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
                  {product.discount}% DISCOUNT
                </span>
              )}
              {product.isBestSeller && (
                <span className="bg-stone-900 text-amber-300 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded shadow-md">
                  Showroom Favorite
                </span>
              )}
            </div>

            {/* Top Right Actions: AR Preview, Lightbox Zoom & Wishlist button */}
            <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
              <button
                type="button"
                id="gallery-ar-preview-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowARModal(true);
                }}
                title="View in AR / Room Visualizer"
                aria-label="View piece in AR Room"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-stone-900/85 hover:bg-stone-900 text-amber-300 border border-amber-400/40 backdrop-blur-md shadow-md text-xs font-bold transition-all active:scale-95 cursor-pointer hover:shadow-lg hover:border-amber-400"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">AR View</span>
                <span className="sm:hidden">AR</span>
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowLightbox(true);
                }}
                title="Expand Fullscreen Image"
                aria-label="Expand image"
                className="p-2.5 rounded-full bg-white/80 hover:bg-white text-stone-700 backdrop-blur-md shadow-md transition-all active:scale-95 cursor-pointer"
              >
                <Maximize2 className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleWishlist(product.id);
                }}
                aria-label="Add to Wishlist"
                className={`p-2.5 rounded-full backdrop-blur-md shadow-md transition-all active:scale-95 cursor-pointer ${isWishlisted
                    ? 'bg-red-50 text-red-600'
                    : 'bg-white/80 hover:bg-white text-stone-700'
                  }`}
              >
                <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
              </button>
            </div>

            {/* Bottom Floating Counter & Swipe Hint */}
            <div className="absolute bottom-4 inset-x-4 flex items-center justify-between z-10 pointer-events-none">
              <span className="text-[10px] font-medium text-stone-700 bg-white/85 backdrop-blur-md px-2.5 py-1 rounded-full shadow-sm border border-stone-200/60 hidden sm:inline-block">
                Swipe or click to view angles
              </span>
              <div className="ml-auto bg-stone-900/80 backdrop-blur-md text-white font-mono text-[11px] font-bold px-3 py-1 rounded-full shadow-md border border-white/20">
                {activeImageIndex + 1} / {product.images.length}
              </div>
            </div>
          </div>

          {/* Swipeable Gallery Dot Pagination (Mobile & Desktop) */}
          {product.images.length > 1 && (
            <div className="flex items-center justify-center gap-1.5 py-1">
              {product.images.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => scrollToImage(idx)}
                  aria-label={`Go to slide ${idx + 1}`}
                  className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${idx === activeImageIndex
                      ? 'w-7 bg-amber-900 shadow-sm'
                      : 'w-2 bg-stone-300 hover:bg-stone-400'
                    }`}
                />
              ))}
            </div>
          )}

          {/* Thumbnails Row */}
          {product.images.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => scrollToImage(idx)}
                  className={`relative w-20 h-20 rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 cursor-pointer ${idx === activeImageIndex
                      ? 'border-amber-900 ring-2 ring-amber-900/20 shadow-md scale-102'
                      : 'border-stone-200 opacity-70 hover:opacity-100'
                    }`}
                >
                  <img
                    src={img}
                    alt={`Thumbnail ${idx + 1}`}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  {idx === activeImageIndex && (
                    <div className="absolute inset-0 bg-amber-900/10 border-b-2 border-amber-900" />
                  )}
                </button>
              ))}
            </div>
          )}

          {/* Quick Specifications Highlights Pill Bar */}
          <div className="grid grid-cols-3 gap-3 p-4 bg-stone-50 rounded-2xl border border-stone-200 text-center text-xs">
            <div>
              <span className="text-stone-400 block text-[10px] uppercase font-bold">Primary Material</span>
              <span className="font-semibold text-stone-800 truncate block mt-0.5">{product.material}</span>
            </div>
            <div className="border-x border-stone-200">
              <span className="text-stone-400 block text-[10px] uppercase font-bold">Dimensions</span>
              <span className="font-semibold text-stone-800 block mt-0.5">
                {product.dimensions.length}×{product.dimensions.width}×{product.dimensions.height} {product.dimensions.unit}
              </span>
            </div>
            <div>
              <span className="text-stone-400 block text-[10px] uppercase font-bold">Showroom Warranty</span>
              <span className="font-semibold text-amber-900 block mt-0.5">{product.warranty.split(' ')[0]}</span>
            </div>
          </div>
        </div>

        {/* Product Details & Purchase Form (5 cols on lg) */}
        <div className="lg:col-span-5 space-y-6">
          <div>
            <div className="flex items-center justify-between text-xs text-stone-500 mb-1.5">
              <span className="font-bold text-amber-900 uppercase tracking-widest">{product.brand}</span>
              <span className="font-mono bg-stone-100 px-2 py-0.5 rounded text-stone-600">SKU: {product.sku}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 font-serif-luxury leading-tight">
              {product.name}
            </h1>

            {/* Ratings Summary */}
            <div
              onClick={() => {
                document.getElementById('customer-reviews-section')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="flex items-center gap-3 mt-2.5 cursor-pointer group"
              title="Click to view verified customer reviews"
            >
              <div className="flex items-center gap-1 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-lg text-amber-900 font-bold text-xs group-hover:bg-amber-100 transition-colors">
                <Star className="w-3.5 h-3.5 fill-current text-amber-500" />
                <span>{ratingStats.average.toFixed(1)}</span>
              </div>
              <span className="text-xs text-stone-600 group-hover:text-amber-900 underline-offset-2 group-hover:underline transition-colors">
                {ratingStats.count || product.reviewCount} Verified Reviews
              </span>
              <span className="text-stone-300">&bull;</span>
              <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> 100% Genuine Solid Wood
              </span>
            </div>
          </div>

          {/* Pricing Box */}
          <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-2">
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-black text-stone-900">
                ₹{product.salePrice.toLocaleString()}
              </span>
              {product.discount > 0 && (
                <>
                  <span className="text-base text-stone-400 line-through">
                    ₹{product.price.toLocaleString()}
                  </span>
                  <span className="text-xs font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
                    Save ₹{(product.price - product.salePrice).toLocaleString()} ({product.discount}%)
                  </span>
                </>
              )}
            </div>
            <p className="text-[11px] text-stone-500">
              Inclusive of 18% GST and Free White-Glove Installation.
            </p>

            {/* EMI snippet */}
            <div className="pt-2 border-t border-stone-200/80 flex items-center justify-between text-xs">
              <span className="text-stone-700">
                From <strong className="text-amber-950 font-bold">₹{emiPerMonth.toLocaleString()}/mo</strong> with No-Cost EMI
              </span>
              <button
                onClick={() => setShowEmiModal(true)}
                className="text-amber-800 font-semibold hover:underline text-[11px] cursor-pointer"
              >
                View Plans &rarr;
              </button>
            </div>
          </div>

          {/* AR Room Fit & Scale Visualizer Callout */}
          <div className="p-4 bg-gradient-to-r from-stone-900 via-stone-850 to-stone-900 rounded-2xl border border-stone-800 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 shadow-md">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-white">Preview in Your Room (AR Visualizer)</span>
                  <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[9px] font-bold uppercase">1:1 Fit</span>
                </div>
                <p className="text-[11px] text-stone-300 mt-0.5">
                  Overlay in generic living room, bedroom or floorplan to verify space & dimensions.
                </p>
              </div>
            </div>

            <button
              type="button"
              id="product-open-ar-preview-btn"
              onClick={() => setShowARModal(true)}
              className="px-3.5 py-2.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-md cursor-pointer shrink-0 active:scale-95"
            >
              <span>Launch AR Preview</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Colors Choice */}
          {product.colors && product.colors.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-stone-900 uppercase tracking-wider text-[11px]">
                  Finish / Upholstery: <span className="text-amber-900">{selectedColor}</span>
                </span>
              </div>
              <div className="flex flex-wrap gap-2.5">
                {product.colors.map((c) => {
                  const isSelected = selectedColor === c.name;
                  return (
                    <button
                      key={c.name}
                      onClick={() => setSelectedColor(c.name)}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs transition-all ${isSelected
                          ? 'border-amber-900 bg-amber-50 text-amber-900 font-bold shadow-sm ring-1 ring-amber-900'
                          : 'border-stone-200 bg-white text-stone-700 hover:border-stone-300'
                        }`}
                    >
                      <span
                        className="w-3.5 h-3.5 rounded-full border border-stone-300 flex-shrink-0"
                        style={{ backgroundColor: c.hex }}
                      />
                      <span>{c.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Sizes Choice */}
          {product.sizes && product.sizes.length > 0 && (
            <div className="space-y-2">
              <span className="font-bold text-stone-900 uppercase tracking-wider text-[11px] block">
                Size Configuration: <span className="text-amber-900">{selectedSize}</span>
              </span>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((s) => {
                  const isSelected = selectedSize === s;
                  return (
                    <button
                      key={s}
                      onClick={() => setSelectedSize(s)}
                      className={`px-3.5 py-2 rounded-xl border text-xs transition-all ${isSelected
                          ? 'border-stone-900 bg-stone-900 text-white font-bold'
                          : 'border-stone-200 bg-white text-stone-700 hover:border-stone-300'
                        }`}
                    >
                      {s}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Stock Indicator & Quantity */}
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-stone-700">Quantity:</span>
              <div className="flex items-center border border-stone-200 rounded-xl bg-white shadow-sm">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={quantity <= 1 || isOutOfStock}
                  className="p-2 text-stone-500 hover:text-stone-900 disabled:opacity-30"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="px-3 text-xs font-bold text-stone-900">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                  disabled={quantity >= product.stock || isOutOfStock}
                  className="p-2 text-stone-500 hover:text-stone-900 disabled:opacity-30"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Stock status badge */}
            <div className="text-right">
              {isOutOfStock ? (
                <span className="text-xs font-bold text-red-600 bg-red-50 px-2.5 py-1 rounded-full">
                  Sold Out
                </span>
              ) : product.stock <= product.lowStockLimit ? (
                <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full animate-pulse">
                  Only {product.stock} left in showroom
                </span>
              ) : (
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
                  In Stock ({product.stock} available)
                </span>
              )}
            </div>
          </div>

          {/* Action Buttons or Notify Restock Alert */}
          {isOutOfStock ? (
            <div className="bg-stone-50 border border-stone-200/60 rounded-2xl p-5 space-y-4">
              <div className="flex items-start gap-3">
                <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 text-amber-900 rounded-xl shrink-0">
                  <Bell className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-stone-900 font-serif-luxury">Bespoke Restock Priority Subscription</h4>
                  <p className="text-xs text-stone-600 leading-relaxed mt-1">
                    This handcrafted teakwood masterpiece is temporarily sold out. Submit your email to join our exclusive back-in-stock priority notification dispatch.
                  </p>
                </div>
              </div>

              {hasSubscribed ? (
                <div className="bg-emerald-50 border border-emerald-200/80 rounded-xl p-3.5 text-center text-xs text-emerald-800 font-bold flex items-center justify-center gap-1.5">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Your priority spot is secured! We will email you at {notifyEmail}.</span>
                </div>
              ) : (
                <form onSubmit={handleNotifyMe} className="flex gap-2">
                  <input
                    type="email"
                    required
                    value={notifyEmail}
                    onChange={(e) => setNotifyEmail(e.target.value)}
                    placeholder="luxurious.living@interior.com"
                    className="flex-1 px-3.5 py-3 bg-white border border-stone-200 rounded-xl text-xs text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-stone-900 focus:ring-1 focus:ring-stone-900 font-semibold"
                  />
                  <button
                    type="submit"
                    className="px-5 py-3 bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
                  >
                    <Bell className="w-3.5 h-3.5" />
                    <span>Notify Me</span>
                  </button>
                </form>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                id="product-add-to-cart-btn"
                onClick={() => addToCart(product.id, quantity, selectedColor, selectedSize)}
                disabled={isOutOfStock}
                className="py-3.5 px-4 bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs sm:text-sm rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all disabled:opacity-40 cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Add to Cart</span>
              </button>

              <button
                id="product-buy-now-btn"
                onClick={() => quickBuyNow(product.id, quantity, selectedColor, selectedSize)}
                disabled={isOutOfStock}
                className="py-3.5 px-4 bg-amber-800 hover:bg-amber-700 text-white font-bold text-xs sm:text-sm rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all disabled:opacity-40 cursor-pointer"
              >
                <span>Buy Now</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Share & Wishlist quick links */}
          <div className="flex items-center justify-between text-xs text-stone-500 pt-1">
            <button
              onClick={() => toggleWishlist(product.id)}
              className="flex items-center gap-1.5 hover:text-red-600 transition-colors"
            >
              <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current text-red-600' : ''}`} />
              <span>{isWishlisted ? 'Saved in Wishlist' : 'Add to Wishlist'}</span>
            </button>
            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 hover:text-stone-900 transition-colors"
            >
              <Share2 className="w-4 h-4" />
              <span>Share Furniture</span>
            </button>
          </div>

          {/* Delivery Pin-Code Checker */}
          <div className="p-4 bg-white rounded-2xl border border-stone-200 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-stone-900">
              <Truck className="w-4 h-4 text-amber-800" />
              <span>Delivery & Showroom Assembly Check</span>
            </div>

            <form onSubmit={handlePincodeCheck} className="flex gap-2">
              <input
                type="text"
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                maxLength={6}
                placeholder="Enter 6-digit PIN"
                className="flex-1 px-3 py-2 border border-stone-200 rounded-xl text-xs focus:outline-none focus:border-amber-900"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-900 text-xs font-bold rounded-xl"
              >
                Check
              </button>
            </form>

            {pincodeChecked && (
              <div className="space-y-1 text-xs text-stone-600">
                <p className="flex items-center gap-1.5 text-emerald-700 font-semibold">
                  <Check className="w-3.5 h-3.5" /> Free White-Glove Showroom Assembly to {pincode}
                </p>
                <p className="text-[11px] text-stone-500">
                  Estimated Arrival: <strong>3-5 business days</strong> with professional room placement.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Frequently Bought Together Combo Bundle */}
      {bundleItems.length > 0 && (
        <div className="bg-amber-50/50 border border-amber-200/80 rounded-3xl p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-700" />
            <h3 className="text-lg sm:text-xl font-bold font-serif-luxury text-stone-900">
              Frequently Bought Together (Save an extra 5%)
            </h3>
          </div>

          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            <div className="flex flex-wrap items-center gap-4">
              {/* Main Product */}
              <div className="flex items-center gap-3 p-2 bg-white rounded-xl border border-stone-200 w-64">
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="w-14 h-14 object-cover rounded-lg"
                />
                <div className="truncate">
                  <p className="text-xs font-bold text-stone-900 truncate">{product.name}</p>
                  <p className="text-xs text-stone-500">₹{product.salePrice.toLocaleString()}</p>
                </div>
              </div>

              <span className="text-lg font-bold text-stone-400">+</span>

              {/* Bundle items */}
              {bundleItems.map((b) => (
                <div key={b.id} className="flex items-center gap-3 p-2 bg-white rounded-xl border border-stone-200 w-64">
                  <img
                    src={b.images[0]}
                    alt={b.name}
                    className="w-14 h-14 object-cover rounded-lg"
                  />
                  <div className="truncate">
                    <p className="text-xs font-bold text-stone-900 truncate">{b.name}</p>
                    <p className="text-xs text-stone-500">₹{b.salePrice.toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Bundle Total & Add Button */}
            <div className="text-right flex-shrink-0 flex items-center gap-4">
              <div>
                <span className="text-xs text-stone-500 block">Combo Price:</span>
                <span className="text-2xl font-black text-amber-950">₹{bundleDiscounted.toLocaleString()}</span>
                <span className="text-xs text-stone-400 line-through ml-2">₹{bundleTotal.toLocaleString()}</span>
              </div>
              <button
                onClick={handleAddBundle}
                className="px-6 py-3 bg-amber-800 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow transition-all cursor-pointer"
              >
                Add 3 Items to Cart
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tabs: Specifications, Care, Warranty & Returns */}
      <div className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-sm">
        <div className="flex border-b border-stone-200 overflow-x-auto">
          {[
            { id: 'desc', label: 'Description' },
            { id: 'specs', label: 'Technical Specifications' },
            { id: 'care', label: 'Care Instructions' },
            { id: 'warranty', label: '10-Year Warranty' },
            { id: 'returns', label: 'Return Policy' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-6 py-4 text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${activeTab === tab.id
                  ? 'border-b-2 border-amber-900 text-amber-900 bg-amber-50/40'
                  : 'text-stone-500 hover:text-stone-900'
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-6 sm:p-8 text-sm text-stone-700 leading-relaxed">
          {activeTab === 'desc' && (
            <div className="space-y-4 max-w-3xl">
              <p>{product.description}</p>
              <h4 className="font-bold text-stone-900 text-sm pt-2">Craftsmanship Highlights:</h4>
              <ul className="list-disc pl-5 space-y-1.5 text-xs text-stone-600">
                {product.craftsmanshipHighlights && product.craftsmanshipHighlights.length > 0 ? (
                  product.craftsmanshipHighlights.map((highlight, idx) => (
                    <li key={idx}>{highlight}</li>
                  ))
                ) : (
                  <>
                    <li>Kiln-seasoned hardwood frame engineered to resist warpage across humidity fluctuations.</li>
                    <li>German precision hardware fittings certified for over 100,000 opening cycles.</li>
                    <li>Hand-applied organic beeswax and non-toxic Italian polyurethane matte protective clear-coat.</li>
                    <li>Custom-engineered high resilience multi-density core offering lifetime back posture support.</li>
                  </>
                )}
              </ul>
            </div>
          )}

          {activeTab === 'specs' && (
            <div className="max-w-2xl">
              <table className="w-full text-xs text-left border-collapse">
                <tbody>
                  {Object.entries(product.specifications || {}).map(([key, val], idx) => (
                    <tr key={key} className={idx % 2 === 0 ? 'bg-stone-50' : 'bg-white'}>
                      <td className="py-2.5 px-4 font-semibold text-stone-900 w-1/3 border border-stone-200">
                        {key}
                      </td>
                      <td className="py-2.5 px-4 text-stone-600 border border-stone-200">
                        {val}
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-stone-50">
                    <td className="py-2.5 px-4 font-semibold text-stone-900 border border-stone-200">
                      Item Weight
                    </td>
                    <td className="py-2.5 px-4 text-stone-600 border border-stone-200">
                      Approx. {product.weight} kg
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-4 font-semibold text-stone-900 border border-stone-200">
                      Assembly
                    </td>
                    <td className="py-2.5 px-4 text-stone-600 border border-stone-200">
                      {product.assemblyRequired ? 'Showroom Technician Assembly (Complimentary on delivery)' : 'Pre-assembled'}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'care' && (
            <div className="space-y-3 max-w-3xl">
              <h4 className="font-bold text-stone-900 text-sm">Preserving Your CP Furniture</h4>
              <ul className="list-disc pl-5 space-y-2 text-xs text-stone-600">
                {product.careInstructions && product.careInstructions.length > 0 ? (
                  product.careInstructions.map((inst, i) => (
                    <li key={i}>{inst}</li>
                  ))
                ) : (
                  <>
                    <li>Vacuum clean once a week using a soft brush attachment.</li>
                    <li>Blot liquid spills immediately with a dry, clean micro-fiber cloth; do not rub.</li>
                    <li>Avoid prolonged direct exposure to intense sunlight to maintain rich fabric color.</li>
                  </>
                )}
                <li>Always use coasters and placemats when resting hot serving pans or frosty glasses.</li>
                <li>Avoid using harsh chemical bleaching agents or acidic citrus sprays.</li>
              </ul>
            </div>
          )}

          {activeTab === 'warranty' && (
            <div className="space-y-4 max-w-3xl">
              <div className="flex items-center gap-3 p-4 bg-amber-50 rounded-2xl border border-amber-200">
                <ShieldCheck className="w-8 h-8 text-amber-800 flex-shrink-0" />
                <div>
                  <h4 className="font-bold text-amber-950 text-sm">{product.warranty || '10-Year Comprehensive Wood Warranty'}</h4>
                  <p className="text-xs text-amber-800">
                    Official CP Furniture Warranty Certificate is included inside your delivery dossier.
                  </p>
                </div>
              </div>
              <p className="text-xs text-stone-600">
                Covers any termite damage, wood boring insects, frame joints separation, and hydraulic piston failures under standard residential use.
              </p>
            </div>
          )}

          {activeTab === 'returns' && (
            <div className="space-y-3 max-w-3xl text-xs text-stone-600">
              <h4 className="font-bold text-stone-900 text-sm">30-Day Hassle-Free Returns</h4>
              {product.returnPolicy ? (
                <div className="whitespace-pre-wrap text-stone-600 leading-relaxed font-sans">{product.returnPolicy}</div>
              ) : (
                <>
                  <p>
                    If your furniture piece does not match your home aesthetic or room proportions, you may request a return within 30 days of delivery directly from your Customer Account dashboard.
                  </p>
                  <ul className="list-disc pl-5 space-y-1 text-stone-500">
                    <li>Item must be in its original undamaged condition.</li>
                    <li>Our logistics team will inspect and collect the furniture from your home for free.</li>
                    <li>100% refund is credited back to your original payment method or bank account within 3-5 business days.</li>
                  </ul>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Customer Reviews & Write a Review Section */}
      <div id="customer-reviews-section" className="space-y-8 scroll-mt-24">
        {/* Header with Title & Action */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-stone-200">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-widest text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                Verified Customer Feedback
              </span>
              <span className="text-xs text-stone-400 font-mono">CP-REVIEWS-AUDIT</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold font-serif-luxury text-stone-900">
              Ratings & Customer Reviews ({ratingStats.count})
            </h3>
            <p className="text-xs text-stone-500 mt-1">
              Read authentic evaluations from verified homeowners, interior designers, and architects across India.
            </p>
          </div>
          <button
            id="write-review-toggle-btn"
            onClick={() => setShowReviewForm(!showReviewForm)}
            className="px-6 py-3 bg-stone-900 hover:bg-amber-900 text-white text-xs font-bold rounded-xl transition-all shadow-md self-start sm:self-auto flex items-center gap-2 cursor-pointer group"
          >
            <MessageSquare className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
            <span>{showReviewForm ? 'Close Review Form' : 'Write a Review'}</span>
          </button>
        </div>

        {/* Rating Overview Breakdown Card */}
        <div className="bg-stone-50 border border-stone-200 rounded-3xl p-6 sm:p-8 shadow-xs">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left: Big Score & Stars */}
            <div className="lg:col-span-4 text-center lg:text-left lg:border-r lg:border-stone-200 lg:pr-8 space-y-3">
              <div className="flex items-baseline justify-center lg:justify-start gap-2">
                <span className="text-5xl sm:text-6xl font-black text-stone-900 font-serif-luxury">
                  {ratingStats.average.toFixed(1)}
                </span>
                <span className="text-base text-stone-400 font-medium">/ 5.0</span>
              </div>
              <div className="flex items-center justify-center lg:justify-start gap-1 text-amber-500">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-5 h-5 ${star <= Math.round(ratingStats.average) ? 'fill-current' : 'text-stone-300'
                      }`}
                  />
                ))}
              </div>
              <p className="text-xs text-stone-600 font-medium">
                Based on <strong className="text-stone-900">{ratingStats.count}</strong> verified customer reviews
              </p>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full text-[11px] font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>{ratingStats.recommendPercent}% of buyers recommend this piece</span>
              </div>
            </div>

            {/* Middle: Star Rating Distribution Bars */}
            <div className="lg:col-span-5 space-y-2">
              <div className="text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                Rating Breakdown (Click to filter)
              </div>
              {[5, 4, 3, 2, 1].map((star) => {
                const count = ratingStats.distribution[star] || 0;
                const percent = ratingStats.count > 0 ? Math.round((count / ratingStats.count) * 100) : 0;
                const isSelected = reviewFilterRating === star;
                return (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setReviewFilterRating(isSelected ? 'all' : star)}
                    className={`w-full flex items-center gap-3 text-xs py-1 px-2 rounded-lg transition-colors group cursor-pointer ${isSelected ? 'bg-amber-100/70 text-amber-900 font-bold' : 'hover:bg-stone-100 text-stone-600'
                      }`}
                  >
                    <span className="w-8 text-right font-semibold flex items-center justify-end gap-1">
                      <span>{star}</span>
                      <Star className="w-3 h-3 fill-current text-amber-500 inline" />
                    </span>
                    <div className="flex-1 h-2.5 bg-stone-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${isSelected ? 'bg-amber-600' : 'bg-amber-500 group-hover:bg-amber-600'
                          }`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                    <span className="w-16 text-right text-stone-400 group-hover:text-stone-700 text-[11px]">
                      {percent}% ({count})
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Right: CP Furniture Trust Seals */}
            <div className="lg:col-span-3 lg:border-l lg:border-stone-200 lg:pl-8 space-y-3">
              <div className="text-xs font-bold text-stone-800 uppercase tracking-wider">
                CP Verified Promise
              </div>
              <ul className="space-y-2 text-xs text-stone-600">
                <li className="flex items-start gap-2">
                  <ShieldCheck className="w-4 h-4 text-amber-800 shrink-0 mt-0.5" />
                  <span>100% Solid Seasoned Teak & Sheesham Wood guarantee</span>
                </li>
                <li className="flex items-start gap-2">
                  <Award className="w-4 h-4 text-amber-800 shrink-0 mt-0.5" />
                  <span>Reviews submitted exclusively by verified purchasers</span>
                </li>
                <li className="flex items-start gap-2">
                  <Truck className="w-4 h-4 text-amber-800 shrink-0 mt-0.5" />
                  <span>Complimentary White-Glove doorstep installation</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Interactive Write a Review Form */}
        {showReviewForm && (
          <div className="bg-stone-900 text-stone-100 p-6 sm:p-8 rounded-3xl border border-stone-800 shadow-xl space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-stone-800">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-amber-400">
                  Customer Community
                </span>
                <h4 className="text-xl font-bold font-serif-luxury text-white">
                  Write a Customer Review for {product.name}
                </h4>
                <p className="text-xs text-stone-400 mt-0.5">
                  Share your honest assessment of the wood grain, comfort, build quality, and showroom service.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowReviewForm(false)}
                className="text-xs text-stone-400 hover:text-white px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 transition-colors"
              >
                Cancel
              </button>
            </div>

            <form onSubmit={handleAddReview} className="space-y-5 text-xs">
              {/* Star Selection with Labels */}
              <div>
                <label className="text-xs font-bold text-stone-200 block mb-2">
                  Overall Rating * <span className="text-amber-400 font-normal ml-1">
                    {reviewRating === 5 && '5 Stars — Masterpiece / Exceptional Showroom Quality'}
                    {reviewRating === 4 && '4 Stars — Very Good / Highly Recommended'}
                    {reviewRating === 3 && '3 Stars — Average / Met Expectations'}
                    {reviewRating === 2 && '2 Stars — Below Expectations'}
                    {reviewRating === 1 && '1 Star — Disappointed / Needs Improvement'}
                  </span>
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => {
                    const activeVal = hoverRating ?? reviewRating;
                    return (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReviewRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(null)}
                        className="p-1.5 transition-transform hover:scale-110 focus:outline-none"
                        title={`${star} Star${star > 1 ? 's' : ''}`}
                      >
                        <Star
                          className={`w-7 h-7 transition-colors ${star <= activeVal ? 'fill-amber-400 text-amber-400' : 'text-stone-600'
                            }`}
                        />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Author Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-stone-300 block mb-1">Your Full Name *</label>
                  <input
                    type="text"
                    required
                    value={reviewAuthorName}
                    onChange={(e) => setReviewAuthorName(e.target.value)}
                    placeholder="e.g. Vikramaditya Singhania"
                    className="w-full p-3 bg-stone-800 border border-stone-700 rounded-xl text-white placeholder-stone-500 focus:outline-none focus:border-amber-500 text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-stone-300 block mb-1">Your City / State *</label>
                  <input
                    type="text"
                    required
                    value={reviewAuthorCity}
                    onChange={(e) => setReviewAuthorCity(e.target.value)}
                    placeholder="e.g. Bengaluru, Karnataka"
                    className="w-full p-3 bg-stone-800 border border-stone-700 rounded-xl text-white placeholder-stone-500 focus:outline-none focus:border-amber-500 text-xs"
                  />
                </div>
              </div>

              {/* Review Headline */}
              <div>
                <label className="text-xs font-bold text-stone-300 block mb-1">Review Headline *</label>
                <input
                  type="text"
                  required
                  value={reviewHeadline}
                  onChange={(e) => setReviewHeadline(e.target.value)}
                  placeholder="e.g. Exquisite solid teak finish — the highlight of our living room!"
                  className="w-full p-3 bg-stone-800 border border-stone-700 rounded-xl text-white placeholder-stone-500 focus:outline-none focus:border-amber-500 text-xs"
                />
              </div>

              {/* Review Detailed Comments */}
              <div>
                <label className="text-xs font-bold text-stone-300 block mb-1">
                  Your Detailed Review *
                </label>
                <textarea
                  required
                  rows={4}
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Describe your tactile experience with the wood, cushion firmness, joinery precision, and white-glove delivery..."
                  className="w-full p-3 bg-stone-800 border border-stone-700 rounded-xl text-white placeholder-stone-500 focus:outline-none focus:border-amber-500 text-xs leading-relaxed"
                />
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
                <div className="flex items-center gap-2 text-stone-400 text-[11px]">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Review will display as Verified Buyer on CP Furniture.</span>
                </div>
                <button
                  type="submit"
                  className="px-7 py-3 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-xl shadow-lg transition-all text-xs cursor-pointer flex items-center justify-center gap-2"
                >
                  <Star className="w-4 h-4 fill-current" />
                  <span>Submit Verified Review</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Filter and Sorting Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-3 border-y border-stone-200">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-stone-500 flex items-center gap-1 mr-1">
              <Filter className="w-3.5 h-3.5" /> Filter:
            </span>
            <button
              onClick={() => setReviewFilterRating('all')}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${reviewFilterRating === 'all'
                  ? 'bg-stone-900 text-white'
                  : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                }`}
            >
              All ({productReviews.length})
            </button>
            {[5, 4, 3, 2, 1].map((star) => {
              const count = ratingStats.distribution[star] || 0;
              return (
                <button
                  key={star}
                  onClick={() => setReviewFilterRating(star)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors flex items-center gap-1 ${reviewFilterRating === star
                      ? 'bg-amber-500 text-stone-950 font-bold shadow-xs'
                      : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                    }`}
                >
                  <span>{star}</span>
                  <Star className="w-3 h-3 fill-current text-amber-500" />
                  <span className="text-[10px] opacity-70">({count})</span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <span className="text-xs text-stone-500">Sort by:</span>
            <select
              value={reviewSort}
              onChange={(e) => setReviewSort(e.target.value as any)}
              className="text-xs font-semibold text-stone-800 bg-stone-100 border border-stone-200 rounded-xl px-3 py-1.5 focus:outline-none cursor-pointer"
            >
              <option value="newest">Most Recent</option>
              <option value="highest">Highest Rating</option>
              <option value="lowest">Lowest Rating</option>
            </select>
          </div>
        </div>

        {/* Customer Reviews List */}
        {filteredReviews.length === 0 ? (
          <div className="text-center py-12 px-4 bg-stone-50 rounded-3xl border border-dashed border-stone-300 space-y-3">
            <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center mx-auto">
              <Star className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-stone-900 text-base font-serif-luxury">
              {reviewFilterRating !== 'all'
                ? `No ${reviewFilterRating}-Star Reviews Found`
                : 'No Customer Reviews Yet for this Piece'}
            </h4>
            <p className="text-xs text-stone-500 max-w-md mx-auto">
              {reviewFilterRating !== 'all'
                ? 'Try viewing all ratings or clearing your filter selection.'
                : 'Be the first discerning homeowner to rate this handcrafted furniture piece!'}
            </p>
            <div className="pt-2">
              {reviewFilterRating !== 'all' ? (
                <button
                  onClick={() => setReviewFilterRating('all')}
                  className="px-4 py-2 bg-stone-800 text-white rounded-xl text-xs font-semibold hover:bg-stone-700"
                >
                  Show All Reviews
                </button>
              ) : (
                <button
                  onClick={() => setShowReviewForm(true)}
                  className="px-5 py-2.5 bg-amber-800 text-white rounded-xl text-xs font-semibold hover:bg-amber-700"
                >
                  Write the First Review
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredReviews.map((rev) => {
              const helpfulCount = (rev.helpfulCount || 0) + (helpfulCounts[rev.id] || 0);
              const authorName = rev.authorName || 'Verified Homeowner';
              const authorCity = rev.authorCity || 'Bengaluru, India';
              const initial = authorName.charAt(0).toUpperCase();

              return (
                <div
                  key={rev.id}
                  className="p-6 bg-white rounded-3xl border border-stone-200 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    {/* Top Row: Stars + Date */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-amber-500">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            className={`w-4 h-4 ${s <= rev.rating ? 'fill-current text-amber-500' : 'text-stone-200'
                              }`}
                          />
                        ))}
                      </div>
                      <span className="text-[11px] text-stone-400 font-medium">
                        {new Date(rev.date).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </span>
                    </div>

                    {/* Headline */}
                    <h5 className="font-bold text-sm text-stone-900 font-serif-luxury leading-snug">
                      {rev.headline}
                    </h5>

                    {/* Comment Body */}
                    <p className="text-xs text-stone-600 leading-relaxed">
                      {rev.comment}
                    </p>
                  </div>

                  {/* Author Footer & Helpful Reaction */}
                  <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-stone-900 text-amber-400 font-bold flex items-center justify-center text-xs shadow-xs">
                        {initial}
                      </div>
                      <div>
                        <div className="font-bold text-stone-900 text-xs flex items-center gap-1">
                          <span>{authorName}</span>
                          {rev.verified && (
                            <CheckCircle2
                              className="w-3.5 h-3.5 text-emerald-600"
                              aria-label="Verified CP Furniture Purchaser"
                            />
                          )}
                        </div>
                        <span className="text-[11px] text-stone-400 block">{authorCity}</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleToggleHelpful(rev.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-200 text-stone-600 hover:text-amber-900 hover:bg-stone-50 hover:border-amber-300 transition-colors text-[11px] font-medium cursor-pointer"
                      title="Mark review as helpful"
                    >
                      <ThumbsUp className="w-3 h-3 text-stone-400" />
                      <span>Helpful ({helpfulCount})</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Similar Products Recommendation Slider */}
      {similarProducts.length > 0 && (
        <ScrollReveal animation="fade-up" className="space-y-6 pt-6 border-t border-stone-200">
          <div className="flex items-center justify-between">
            <h3 className="text-xl sm:text-2xl font-bold font-serif-luxury text-stone-900">
              Similar Pieces from {product.category}
            </h3>
            <button
              onClick={() => selectCategoryFromHome(product.category)}
              className="text-xs font-semibold text-amber-900 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Explore Collection</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {similarProducts.map((p, idx) => (
              <ProductCard key={p.id} product={p} index={idx} />
            ))}
          </div>
        </ScrollReveal>
      )}

      {/* EMI Modal */}
      {showEmiModal && (
        <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-stone-200 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <h4 className="font-bold text-base text-stone-900 font-serif-luxury">
                No-Cost EMI Options
              </h4>
              <button
                onClick={() => setShowEmiModal(false)}
                className="text-xs font-bold text-stone-400 hover:text-stone-700"
              >
                Close
              </button>
            </div>

            <p className="text-xs text-stone-500">
              Available across HDFC, ICICI, SBI, Axis, and Kotak credit cards for ₹{product.salePrice.toLocaleString()}.
            </p>

            <div className="space-y-2 text-xs">
              <div className="p-3 bg-stone-50 rounded-xl flex items-center justify-between">
                <div>
                  <span className="font-bold text-stone-900">3 Months No-Cost EMI</span>
                  <p className="text-[10px] text-stone-500">0% Interest &bull; ₹0 Processing Fee</p>
                </div>
                <span className="font-bold text-amber-900">₹{Math.round(product.salePrice / 3).toLocaleString()} /mo</span>
              </div>

              <div className="p-3 bg-stone-50 rounded-xl flex items-center justify-between border border-amber-800/30">
                <div>
                  <span className="font-bold text-stone-900">6 Months No-Cost EMI (Popular)</span>
                  <p className="text-[10px] text-stone-500">0% Interest &bull; ₹0 Processing Fee</p>
                </div>
                <span className="font-bold text-amber-900">₹{Math.round(product.salePrice / 6).toLocaleString()} /mo</span>
              </div>

              <div className="p-3 bg-stone-50 rounded-xl flex items-center justify-between">
                <div>
                  <span className="font-bold text-stone-900">9 Months Standard EMI</span>
                  <p className="text-[10px] text-stone-500">13.5% p.a. bank interest</p>
                </div>
                <span className="font-bold text-stone-900">₹{Math.round((product.salePrice * 1.07) / 9).toLocaleString()} /mo</span>
              </div>

              <div className="p-3 bg-stone-50 rounded-xl flex items-center justify-between">
                <div>
                  <span className="font-bold text-stone-900">12 Months Low EMI</span>
                  <p className="text-[10px] text-stone-500">14% p.a. bank interest</p>
                </div>
                <span className="font-bold text-stone-900">₹{Math.round((product.salePrice * 1.09) / 12).toLocaleString()} /mo</span>
              </div>
            </div>

            <p className="text-[10px] text-stone-400 text-center">
              Select your preferred EMI plan during checkout under Payment Step.
            </p>
          </div>
        </div>
      )}

      {/* Fullscreen Lightbox Modal */}
      {showLightbox && (
        <div
          className="fixed inset-0 z-50 bg-stone-950/95 backdrop-blur-md flex flex-col justify-between p-4 select-none"
          onClick={() => setShowLightbox(false)}
        >
          {/* Lightbox Header */}
          <div className="flex items-center justify-between text-white max-w-5xl mx-auto w-full pt-2">
            <div>
              <h4 className="font-bold text-sm text-stone-200">{product.name}</h4>
              <p className="text-xs text-stone-400 font-mono">
                Angle {activeImageIndex + 1} of {product.images.length}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowLightbox(false)}
              className="p-2.5 rounded-full bg-stone-800/80 hover:bg-stone-700 text-white transition-all cursor-pointer"
              aria-label="Close fullscreen view"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Lightbox Main Stage */}
          <div
            className="relative flex-1 flex items-center justify-center max-w-5xl mx-auto w-full my-4"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={product.images[activeImageIndex]}
              alt={`${product.name} angle ${activeImageIndex + 1}`}
              className="max-h-[75vh] max-w-full object-contain rounded-2xl shadow-2xl"
              referrerPolicy="no-referrer"
            />

            {product.images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={handlePrevImage}
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-stone-900/80 hover:bg-stone-800 text-white shadow-xl flex items-center justify-center border border-stone-700 transition-all cursor-pointer"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  type="button"
                  onClick={handleNextImage}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-stone-900/80 hover:bg-stone-800 text-white shadow-xl flex items-center justify-center border border-stone-700 transition-all cursor-pointer"
                  aria-label="Next image"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}
          </div>

          {/* Lightbox Thumbnails Bottom Strip */}
          <div
            className="flex items-center justify-center gap-2 max-w-5xl mx-auto w-full overflow-x-auto pb-2 scrollbar-none"
            onClick={(e) => e.stopPropagation()}
          >
            {product.images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setActiveImageIndex(idx)}
                className={`w-14 h-14 rounded-xl overflow-hidden border-2 transition-all shrink-0 cursor-pointer ${idx === activeImageIndex
                    ? 'border-amber-500 ring-2 ring-amber-500/40 opacity-100 scale-105'
                    : 'border-stone-700 opacity-60 hover:opacity-100'
                  }`}
              >
                <img
                  src={img}
                  alt={`Thumbnail ${idx + 1}`}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Sticky Mobile Add to Cart & Buy Now Bottom Bar (lg:hidden) */}
      <div className="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-stone-200 shadow-[0_-8px_30px_rgba(0,0,0,0.12)] p-3 sm:px-6 lg:hidden">
        <div className="flex items-center justify-between gap-3 max-w-lg mx-auto">
          {/* Mini Product Preview & Pricing */}
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-stone-100 border border-stone-200 shrink-0">
              <img
                src={product.images[0]}
                alt={product.name}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="min-w-0">
              <div className="flex items-baseline gap-1.5">
                <span className="text-base font-black text-stone-900 font-mono leading-none">
                  ₹{product.salePrice.toLocaleString()}
                </span>
                {product.discount > 0 && (
                  <span className="text-[10px] text-stone-400 line-through">
                    ₹{product.price.toLocaleString()}
                  </span>
                )}
              </div>
              <div className="text-[11px] text-stone-600 truncate font-medium mt-0.5">
                {selectedColor || product.colors[0]?.name} &bull; {selectedSize || product.sizes[0]}
              </div>
              {product.stock <= product.lowStockLimit && product.stock > 0 && (
                <span className="text-[10px] text-amber-700 font-bold block">
                  Only {product.stock} left
                </span>
              )}
            </div>
          </div>

          {/* Actions on Mobile Bottom Bar */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              id="mobile-sticky-ar-btn"
              onClick={() => setShowARModal(true)}
              className="p-2.5 rounded-xl border border-amber-500/50 bg-amber-50 text-amber-900 hover:bg-amber-100 transition-all cursor-pointer"
              aria-label="View in AR"
              title="AR Room Fit Preview"
            >
              <Sparkles className="w-4 h-4 text-amber-800" />
            </button>

            <button
              type="button"
              onClick={() => toggleWishlist(product.id)}
              className={`p-2.5 rounded-xl border transition-all cursor-pointer ${isWishlisted
                  ? 'bg-red-50 text-red-600 border-red-200'
                  : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                }`}
              aria-label="Wishlist"
            >
              <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current text-red-600' : ''}`} />
            </button>

            {isOutOfStock ? (
              <span className="py-2.5 px-4 bg-stone-200 text-stone-500 font-bold text-xs rounded-xl">
                Sold Out
              </span>
            ) : (
              <>
                <button
                  type="button"
                  id="mobile-sticky-add-cart-btn"
                  onClick={() => addToCart(product.id, quantity, selectedColor, selectedSize)}
                  className="py-2.5 px-3.5 bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-md active:scale-95 transition-all cursor-pointer"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>Add</span>
                </button>

                <button
                  type="button"
                  id="mobile-sticky-buy-now-btn"
                  onClick={() => quickBuyNow(product.id, quantity, selectedColor, selectedSize)}
                  className="py-2.5 px-4 bg-amber-800 hover:bg-amber-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-md active:scale-95 transition-all cursor-pointer"
                >
                  <span>Buy Now</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* AR Room Fit & Scale Preview Overlay Modal */}
      {showARModal && (
        <ARPreviewModal
          product={product}
          selectedColor={selectedColor}
          onColorChange={setSelectedColor}
          onClose={() => setShowARModal(false)}
          onAddToCart={() => addToCart(product.id, quantity, selectedColor, selectedSize)}
        />
      )}
    </div>
  );
};
