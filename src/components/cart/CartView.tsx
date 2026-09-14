import React, { useState } from 'react';
import {
  Trash2,
  Heart,
  ShoppingBag,
  Plus,
  Minus,
  ArrowRight,
  Sparkles,
  Tag,
  ShieldCheck,
  Truck,
  RotateCcw,
  Check,
  X
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const CartView: React.FC = () => {
  const {
    customer,
    cartItems,
    cartTotal,
    removeFromCart,
    updateCartQuantity,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    setCurrentView,
    toggleWishlist,
    showToast,
    coupons
  } = useApp();

  const [couponInput, setCouponInput] = useState('');

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    const ok = applyCoupon(couponInput.trim());
    if (ok) {
      setCouponInput('');
    }
  };

  const handleMoveToWishlist = (productId: string) => {
    toggleWishlist(productId);
    removeFromCart(productId);
    showToast('Item moved from cart to your Wishlist.', 'info');
  };

  if (cartItems.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-20 h-20 rounded-full bg-stone-100 mx-auto flex items-center justify-center text-stone-400">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-bold font-serif-luxury text-stone-900">Your Furniture Cart is Empty</h2>
        <p className="text-xs sm:text-sm text-stone-500 max-w-md mx-auto">
          Explore our solid teak beds, plush sofas, ergonomic workspaces, and luxury dining tables to style your sanctuary.
        </p>
        <button
          onClick={() => setCurrentView('shop')}
          className="px-8 py-3.5 bg-stone-900 hover:bg-amber-900 text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-lg inline-flex items-center gap-2"
        >
          <span>Explore Showroom Catalog</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  // Delivery progress calculation (Complimentary Teak Care Kit over 40k)
  const freeGiftThreshold = 40000;
  const progressPercent = Math.min(100, Math.round((cartTotal.subtotal / freeGiftThreshold) * 100));
  const remainingForGift = Math.max(0, freeGiftThreshold - cartTotal.subtotal);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <h1 className="text-2xl sm:text-3xl font-bold font-serif-luxury text-stone-900 mb-8">
        Showroom Shopping Cart ({cartTotal.totalItems} {cartTotal.totalItems === 1 ? 'item' : 'items'})
      </h1>

      {/* Complimentary gift progress banner */}
      <div className="mb-8 p-4 bg-amber-50 rounded-2xl border border-amber-200">
        <div className="flex items-center justify-between text-xs font-bold text-stone-900 mb-1.5">
          <span className="flex items-center gap-1.5 text-amber-900">
            <Sparkles className="w-4 h-4" />
            {progressPercent >= 100
              ? 'Unlocked: Complimentary Solid Teak Wood Polish & Microfiber Kit included!'
              : `Add ₹${remainingForGift.toLocaleString()} more to unlock Free Teak Care Kit`}
          </span>
          <span className="text-amber-800">{progressPercent}%</span>
        </div>
        <div className="w-full bg-amber-200/60 rounded-full h-2 overflow-hidden">
          <div
            className="bg-amber-800 h-2 rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Cart Items List (7 cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="hidden sm:grid grid-cols-12 text-xs font-bold text-stone-400 uppercase tracking-wider pb-3 border-b border-stone-200 px-2">
            <span className="col-span-6">Furniture Item</span>
            <span className="col-span-3 text-center">Quantity</span>
            <span className="col-span-3 text-right">Subtotal</span>
          </div>

          {cartItems.map(({ product, item }) => (
            <div
              key={`${item.productId}-${item.selectedColor}-${item.selectedSize}`}
              className="bg-white rounded-2xl border border-stone-200 p-4 sm:p-5 flex flex-col sm:grid sm:grid-cols-12 items-start sm:items-center gap-4 transition-all hover:border-amber-900/40 shadow-sm"
            >
              {/* Product Info (6 cols) */}
              <div className="sm:col-span-6 flex items-start gap-4 w-full">
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-xl bg-stone-100 flex-shrink-0"
                  referrerPolicy="no-referrer"
                />
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] font-bold text-amber-900 uppercase tracking-wider">
                    {product.brand}
                  </span>
                  <h3 className="font-bold text-xs sm:text-sm text-stone-900 truncate">
                    {product.name}
                  </h3>
                  <div className="text-[11px] text-stone-500 mt-1 space-x-2">
                    {item.selectedColor && (
                      <span className="inline-block bg-stone-100 px-2 py-0.5 rounded">
                        Finish: {item.selectedColor}
                      </span>
                    )}
                    {item.selectedSize && (
                      <span className="inline-block bg-stone-100 px-2 py-0.5 rounded">
                        Size: {item.selectedSize}
                      </span>
                    )}
                  </div>
                  <div className="text-xs font-bold text-stone-900 mt-1 sm:hidden">
                    ₹{product.salePrice.toLocaleString()}
                  </div>

                  {/* Actions row for mobile and desktop */}
                  <div className="flex items-center gap-4 mt-2 text-xs">
                    <button
                      onClick={() => handleMoveToWishlist(product.id)}
                      className="text-stone-500 hover:text-amber-900 flex items-center gap-1 transition-colors"
                    >
                      <Heart className="w-3.5 h-3.5" />
                      <span>Save for later</span>
                    </button>
                    <button
                      onClick={() => removeFromCart(product.id)}
                      className="text-red-600 hover:text-red-700 flex items-center gap-1 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Quantity Controls (3 cols) */}
              <div className="sm:col-span-3 flex sm:justify-center items-center gap-2">
                <div className="flex items-center border border-stone-200 rounded-xl bg-white shadow-sm">
                  <button
                    onClick={() => updateCartQuantity(product.id, item.quantity - 1)}
                    className="p-1.5 text-stone-500 hover:text-stone-900"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="px-3 text-xs font-bold text-stone-900">{item.quantity}</span>
                  <button
                    onClick={() => updateCartQuantity(product.id, item.quantity + 1)}
                    disabled={item.quantity >= product.stock}
                    className="p-1.5 text-stone-500 hover:text-stone-900 disabled:opacity-30"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Item Total (3 cols) */}
              <div className="sm:col-span-3 text-right hidden sm:block">
                <div className="text-sm font-black text-stone-900">
                  ₹{(product.salePrice * item.quantity).toLocaleString()}
                </div>
                {product.discount > 0 && (
                  <div className="text-[11px] text-stone-400 line-through">
                    ₹{(product.price * item.quantity).toLocaleString()}
                  </div>
                )}
                <div className="text-[10px] text-emerald-700 font-medium">Free White-Glove Setup</div>
              </div>
            </div>
          ))}

          {/* Continue Shopping Button */}
          <div className="pt-4">
            <button
              onClick={() => setCurrentView('shop')}
              className="text-xs font-bold text-amber-900 hover:underline inline-flex items-center gap-1"
            >
              &larr; Continue browsing more furniture
            </button>
          </div>
        </div>

        {/* Order Summary Box (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-stone-50 rounded-3xl p-6 border border-stone-200 shadow-sm space-y-5">
            <h2 className="text-lg font-bold font-serif-luxury text-stone-900 pb-3 border-b border-stone-200">
              Order Summary
            </h2>

            {/* Coupon Code Input */}
            <div>
              <label className="text-xs font-bold text-stone-700 block mb-1">Promo & Coupon Code</label>
              {appliedCoupon ? (
                <div className="flex items-center justify-between p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs">
                  <div className="flex items-center gap-2 text-emerald-900 font-bold">
                    <Tag className="w-4 h-4 text-emerald-700" />
                    <span>{appliedCoupon.code} Applied</span>
                  </div>
                  <button
                    onClick={removeCoupon}
                    className="text-red-600 hover:text-red-800 p-1 font-bold text-xs"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <input
                    type="text"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                    placeholder="e.g. CPWELCOME10"
                    className="flex-1 px-3 py-2 border border-stone-300 rounded-xl text-xs bg-white uppercase font-mono focus:outline-none focus:border-amber-900"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-stone-900 hover:bg-amber-900 text-white text-xs font-bold rounded-xl transition-colors"
                  >
                    Apply
                  </button>
                </form>
              )}

              {/* Quick coupons pills */}
              {!appliedCoupon && coupons.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {coupons.slice(0, 2).map((c) => (
                    <button
                      key={c.code}
                      onClick={() => applyCoupon(c.code)}
                      className="text-[10px] font-mono font-semibold bg-stone-200/80 hover:bg-amber-100 text-stone-700 hover:text-amber-900 px-2 py-0.5 rounded transition-colors"
                    >
                      +{c.code} ({c.discountPercent}% off)
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Price Calculations Breakdown */}
            <div className="space-y-2.5 text-xs pt-2 border-t border-stone-200">
              <div className="flex justify-between text-stone-600">
                <span>Showroom MRP Total</span>
                <span>₹{(cartTotal.subtotal + cartTotal.discount).toLocaleString()}</span>
              </div>

              {cartTotal.discount > 0 && (
                <div className="flex justify-between text-emerald-700 font-medium">
                  <span>Store Instant Discount</span>
                  <span>-₹{cartTotal.discount.toLocaleString()}</span>
                </div>
              )}

              {appliedCoupon && (
                <div className="flex justify-between text-emerald-700 font-bold">
                  <span>Coupon ({appliedCoupon.code})</span>
                  <span>-₹{cartTotal.couponDiscount.toLocaleString()}</span>
                </div>
              )}

              <div className="flex justify-between text-stone-600">
                <span className="flex items-center gap-1">
                  <span>White-Glove Delivery & Setup</span>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1 rounded font-bold">FREE</span>
                </span>
                <span className="text-emerald-700 font-bold">₹0</span>
              </div>

              <div className="flex justify-between text-stone-500 text-[11px]">
                <span>Applicable GST (18% included)</span>
                <span>₹{cartTotal.tax.toLocaleString()}</span>
              </div>

              <div className="pt-3 border-t border-stone-200 flex justify-between items-baseline">
                <div>
                  <span className="text-sm font-bold text-stone-900 block">Total Payable</span>
                  <span className="text-[10px] text-stone-400">All taxes & assembly included</span>
                </div>
                <span className="text-2xl font-black text-amber-950">
                  ₹{cartTotal.total.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Proceed to Checkout Button */}
            <button
              id="cart-checkout-btn"
              onClick={() => setCurrentView('checkout')}
              className="w-full py-3.5 bg-stone-900 hover:bg-stone-800 text-white text-xs sm:text-sm font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Proceed to Secure Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="pt-2 text-center">
              <span className="text-[11px] text-stone-500 flex items-center justify-center gap-1.5 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Instant Checkout powered by <strong>Razorpay</strong> &bull; Direct Bank Settlement</span>
              </span>
            </div>
          </div>

          {/* Trust Guarantees */}
          <div className="bg-white rounded-2xl p-4 border border-stone-200 space-y-2 text-xs text-stone-600">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-800" />
              <span>10-Year Showroom Certified Structural Guarantee</span>
            </div>
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-amber-800" />
              <span>Room-of-Choice Uncrating & Assembly</span>
            </div>
            <div className="flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-amber-800" />
              <span>30-Day Hassle-Free Home Trial Period</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
