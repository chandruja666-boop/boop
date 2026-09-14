import React, { useState, useEffect } from 'react';
import { X, Star, ShoppingBag, Heart, ShieldCheck, Check, ArrowRight, Minus, Plus, Bell } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const QuickViewModal: React.FC = () => {
  const {
    products,
    quickViewProductId,
    setQuickViewProductId,
    addToCart,
    toggleWishlist,
    customer,
    openProductDetail,
    showToast
  } = useApp();

  const [selectedColor, setSelectedColor] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [activeImage, setActiveImage] = useState<string>('');

  // Notification signup states
  const [notifyEmail, setNotifyEmail] = useState<string>('');
  const [hasSubscribed, setHasSubscribed] = useState<boolean>(false);

  // Find the product
  const product = products.find((p) => p.id === quickViewProductId);

  // Sync state when product or customer changes
  useEffect(() => {
    if (customer?.email) {
      setNotifyEmail(customer.email);
    } else {
      setNotifyEmail('');
    }
    setHasSubscribed(false);
  }, [quickViewProductId, customer]);

  // Initialize selected values when product changes
  useEffect(() => {
    if (product) {
      if (product.colors && product.colors.length > 0) {
        setSelectedColor(product.colors[0].name);
      } else {
        setSelectedColor('');
      }
      if (product.sizes && product.sizes.length > 0) {
        setSelectedSize(product.sizes[0]);
      } else {
        setSelectedSize('');
      }
      if (product.images && product.images.length > 0) {
        setActiveImage(product.images[0]);
      } else {
        setActiveImage('');
      }
      setQuantity(1);
    }
  }, [product]);

  if (!quickViewProductId || !product) {
    return null;
  }

  const isWishlisted = customer?.wishlist.includes(product.id);
  const isOutOfStock = product.stock <= 0;

  const handleClose = () => {
    setQuickViewProductId(null);
  };

  const handleAddToCart = () => {
    if (isOutOfStock) {
      showToast('This item is currently out of stock.', 'warning');
      return;
    }
    addToCart(product.id, quantity, selectedColor || undefined, selectedSize || undefined);
    setQuickViewProductId(null); // Optional: close on add
  };

  const handleNotifyMe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!notifyEmail || !notifyEmail.includes('@')) {
      showToast('Please enter a valid email address.', 'error');
      return;
    }

    // Save back-in-stock notification subscription
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
    showToast(`Registered! We will notify you at ${notifyEmail} when this luxury item returns.`, 'success');
  };

  const handleViewFullDetails = () => {
    setQuickViewProductId(null);
    openProductDetail(product.id);
  };

  const incrementQty = () => {
    if (quantity < Math.min(10, product.stock)) {
      setQuantity((prev) => prev + 1);
    } else {
      showToast(`Cannot order more than available stock (${product.stock} units).`, 'warning');
    }
  };

  const decrementQty = () => {
    if (quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div 
        onClick={handleClose}
        className="fixed inset-0 bg-stone-900/85 backdrop-blur-md transition-opacity duration-300"
      />

      {/* Modal Alignment Wrapper */}
      <div className="flex min-h-full items-center justify-center p-4 sm:p-6 text-center">
        <div className="relative transform overflow-hidden rounded-3xl bg-white text-left shadow-2xl transition-all sm:my-8 w-full max-w-4xl border border-stone-200 flex flex-col md:flex-row animate-in fade-in zoom-in-95 duration-200">
          
          {/* Close Button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 z-10 p-2 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 hover:text-stone-900 transition-colors shadow-sm cursor-pointer"
            title="Close Quick View"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Left Column: Media Stage */}
          <div className="w-full md:w-1/2 bg-stone-50 p-6 flex flex-col justify-between border-b md:border-b-0 md:border-r border-stone-100">
            <div className="space-y-4">
              {/* Main Image View */}
              <div className="aspect-[4/3] w-full rounded-2xl overflow-hidden bg-white border border-stone-200 shadow-xs relative">
                <img
                  src={activeImage}
                  alt={product.name}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                
                {product.discount > 0 && (
                  <span className="absolute top-3 left-3 bg-amber-800 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-md">
                    {product.discount}% OFF
                  </span>
                )}

                {isOutOfStock && (
                  <div className="absolute inset-0 bg-stone-950/40 backdrop-blur-[1px] flex items-center justify-center">
                    <span className="bg-stone-900 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-lg">
                      Out of Stock
                    </span>
                  </div>
                )}
              </div>

              {/* Thumbnails (Only show if multiple exist) */}
              {product.images && product.images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto py-1 no-scrollbar">
                  {product.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImage(img)}
                      className={`w-14 h-14 rounded-lg overflow-hidden bg-white border shrink-0 transition-all cursor-pointer ${
                        activeImage === img 
                          ? 'border-amber-800 ring-1 ring-amber-800 shadow-xs' 
                          : 'border-stone-200 hover:border-stone-400'
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Micro Trust Indicators */}
            <div className="pt-4 mt-4 border-t border-stone-100 flex flex-col sm:flex-row gap-3 text-[11px] text-stone-500">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-amber-800" />
                <span className="font-semibold">10-Year Timber Warranty</span>
              </div>
              <div className="hidden sm:block text-stone-300">&bull;</div>
              <div>Free White-Glove Professional Assembly</div>
            </div>
          </div>

          {/* Right Column: Essential Details */}
          <div className="w-full md:w-1/2 p-6 sm:p-8 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              {/* Brand & SKU Header */}
              <div className="flex items-center justify-between text-xs text-stone-500">
                <span className="font-bold text-amber-900 uppercase tracking-widest">{product.brand}</span>
                <span className="font-mono text-stone-400">SKU: {product.sku}</span>
              </div>

              {/* Product Title */}
              <h2 className="text-xl sm:text-2xl font-bold font-serif-luxury text-stone-900 tracking-tight leading-tight">
                {product.name}
              </h2>

              {/* Rating & Short Info */}
              <div className="flex items-center gap-3 text-xs border-y border-stone-100 py-2">
                <div className="flex items-center gap-1 text-amber-500 font-bold">
                  <Star className="w-4 h-4 fill-current" />
                  <span>{product.rating.toFixed(1)}</span>
                  <span className="text-stone-400 font-normal">({product.reviewCount} Reviews)</span>
                </div>
                <span className="text-stone-200">|</span>
                <span className="text-stone-600 font-medium">{product.material}</span>
                <span className="text-stone-200">|</span>
                <span className={`font-semibold ${isOutOfStock ? 'text-red-600' : 'text-emerald-700'}`}>
                  {isOutOfStock ? 'Out of Stock' : 'In Stock'}
                </span>
              </div>

              {/* Dynamic Prices */}
              <div className="space-y-1">
                <div className="flex items-baseline gap-2">
                  <span className="text-xl sm:text-2xl font-extrabold text-stone-900">
                    ₹{product.salePrice.toLocaleString()}
                  </span>
                  {product.discount > 0 && (
                    <span className="text-sm text-stone-400 line-through">
                      ₹{product.price.toLocaleString()}
                    </span>
                  )}
                </div>
                {product.discount > 0 && (
                  <span className="text-xs text-emerald-700 font-semibold block bg-emerald-50 px-2 py-0.5 rounded self-start inline-block">
                    Save ₹{(product.price - product.salePrice).toLocaleString()}
                  </span>
                )}
              </div>

              {/* Description */}
              <p className="text-xs text-stone-600 leading-relaxed line-clamp-4">
                {product.description}
              </p>

              {/* Configurable Swatches (Color & Size selectors) */}
              <div className="space-y-3.5 pt-2">
                {/* Colors */}
                {product.colors && product.colors.length > 0 && (
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500 block">
                      Color Finish: <span className="text-stone-900 font-medium">{selectedColor}</span>
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {product.colors.map((color, idx) => (
                        <button
                          key={idx}
                          onClick={() => setSelectedColor(color.name)}
                          className={`w-7 h-7 rounded-full border flex items-center justify-center transition-all relative cursor-pointer ${
                            selectedColor === color.name 
                              ? 'border-stone-950 ring-2 ring-stone-950/20 shadow-sm' 
                              : 'border-stone-200 hover:border-stone-400'
                          }`}
                          style={{ backgroundColor: color.hex }}
                          title={color.name}
                        >
                          {selectedColor === color.name && (
                            <Check className="w-3.5 h-3.5 text-white stroke-[3] drop-shadow-sm invert" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Sizes */}
                {product.sizes && product.sizes.length > 0 && (
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500 block">
                      Dimensions / Size: <span className="text-stone-900 font-medium">{selectedSize}</span>
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {product.sizes.map((size) => (
                        <button
                          key={size}
                          onClick={() => setSelectedSize(size)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                            selectedSize === size
                              ? 'border-stone-900 bg-stone-900 text-white shadow-xs'
                              : 'border-stone-200 hover:border-stone-400 bg-white text-stone-700'
                          }`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Actions Stage */}
            <div className="space-y-4 pt-4 border-t border-stone-100">
              {isOutOfStock ? (
                <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4.5 space-y-3">
                  <div className="flex items-start gap-2.5">
                    <div className="p-2 bg-amber-500/10 border border-amber-500/20 text-amber-900 rounded-lg shrink-0">
                      <Bell className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-stone-900">Notify Me When Restocked</h4>
                      <p className="text-[11px] text-stone-500 leading-normal mt-0.5">
                        This bespoke furniture item is temporarily unavailable in our showroom. Enter your email to receive an automated priority alert.
                      </p>
                    </div>
                  </div>

                  {hasSubscribed ? (
                    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-center text-[11px] text-emerald-800 font-bold flex items-center justify-center gap-1.5">
                      <Check className="w-4 h-4 text-emerald-600" />
                      <span>Subscription recorded. We will email you at {notifyEmail}.</span>
                    </div>
                  ) : (
                    <form onSubmit={handleNotifyMe} className="flex gap-2">
                      <input
                        type="email"
                        required
                        value={notifyEmail}
                        onChange={(e) => setNotifyEmail(e.target.value)}
                        placeholder="your.email@premium.com"
                        className="flex-1 px-3 py-2 bg-white border border-stone-200 rounded-xl text-xs text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-stone-900 focus:ring-1 focus:ring-stone-900 font-medium"
                      />
                      <button
                        type="submit"
                        className="px-4 py-2 bg-stone-900 hover:bg-amber-950 text-white font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                      >
                        <Bell className="w-3.5 h-3.5" />
                        <span>Register Alert</span>
                      </button>
                    </form>
                  )}
                </div>
              ) : (
                /* Quantity and Checkout Controls */
                <div className="flex items-center gap-3">
                  <div className="flex items-center border border-stone-300 rounded-xl overflow-hidden bg-stone-50 shrink-0">
                    <button
                      type="button"
                      onClick={decrementQty}
                      disabled={isOutOfStock || quantity <= 1}
                      className="p-2.5 text-stone-600 hover:text-stone-900 disabled:opacity-40 transition-colors"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="px-3 text-xs font-bold text-stone-900 w-8 text-center select-none">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={incrementQty}
                      disabled={isOutOfStock || quantity >= product.stock}
                      className="p-2.5 text-stone-600 hover:text-stone-900 disabled:opacity-40 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={handleAddToCart}
                    disabled={isOutOfStock}
                    className="flex-1 py-3 bg-stone-900 hover:bg-amber-900 disabled:bg-stone-300 text-white text-xs sm:text-sm font-bold rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-md"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>Add to Shopping Cart</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => toggleWishlist(product.id)}
                    className={`p-3 rounded-xl border transition-colors shrink-0 cursor-pointer ${
                      isWishlisted
                        ? 'border-red-200 bg-red-50 text-red-600'
                        : 'border-stone-200 hover:border-stone-400 text-stone-700'
                    }`}
                    title="Save to Wishlist"
                  >
                    <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current text-red-600' : ''}`} />
                  </button>
                </div>
              )}

              {/* View Full Product Details CTA */}
              <button
                type="button"
                onClick={handleViewFullDetails}
                className="w-full text-center py-2 text-stone-500 hover:text-amber-900 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer hover:underline"
              >
                <span>View Complete Specifications & 3D Interactive Floor Plan</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};
