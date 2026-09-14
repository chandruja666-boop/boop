import React from 'react';
import { Heart, ShoppingBag, Star, Eye, Sparkles, Check } from 'lucide-react';
import { Product } from '../../types';
import { useApp } from '../../context/AppContext';
import { useIntersectionObserver } from '../../hooks/useIntersectionObserver';

interface ProductCardProps {
  product: Product;
  viewMode?: 'grid' | 'list';
  index?: number;
  delay?: number;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  viewMode = 'grid',
  index,
  delay
}) => {
  const { openProductDetail, addToCart, toggleWishlist, customer, quickBuyNow, setQuickViewProductId } = useApp();
  const { ref, isVisible } = useIntersectionObserver<HTMLDivElement>({
    threshold: 0.1,
    rootMargin: '0px 0px -30px 0px',
    triggerOnce: true,
  });

  const isWishlisted = customer?.wishlist.includes(product.id);
  const isOutOfStock = product.stock <= 0;

  // Stagger calculation (capped to prevent long waits on scroll)
  const staggerDelay = delay !== undefined ? delay : (index !== undefined ? (index % 4) * 80 : 0);

  if (viewMode === 'list') {
    return (
      <div
        ref={ref}
        style={{
          transitionDelay: `${staggerDelay}ms`,
          transitionDuration: '650ms',
        }}
        className={`bg-white rounded-2xl border border-stone-200 hover:border-amber-700/40 hover:shadow-lg transition-all ease-[cubic-bezier(0.16,1,0.3,1)] p-3.5 sm:p-4 flex flex-col sm:flex-row gap-4 sm:gap-5 group will-change-[opacity,transform] ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
        }`}
      >
        {/* Product Image */}
        <div
          onClick={() => openProductDetail(product.id)}
          className="relative w-full sm:w-52 md:w-56 h-48 sm:h-52 flex-shrink-0 rounded-xl overflow-hidden bg-stone-100 cursor-pointer"
        >
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            referrerPolicy="no-referrer"
          />
          {product.discount > 0 && (
            <span className="absolute top-2.5 left-2.5 bg-amber-800 text-white text-[10px] sm:text-[11px] font-bold px-2 py-0.5 rounded-full shadow">
              {product.discount}% OFF
            </span>
          )}
          {product.isBestSeller && (
            <span className="absolute bottom-2.5 left-2.5 bg-stone-900 text-amber-400 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded shadow">
              Best Seller
            </span>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col justify-between min-w-0">
          <div>
            <div className="flex items-center justify-between text-[11px] sm:text-xs text-stone-500 mb-1">
              <span className="font-semibold text-amber-900 uppercase tracking-wider">{product.brand}</span>
              <span className="font-mono text-stone-400 text-[10px] sm:text-xs">{product.sku}</span>
            </div>

            <h3
              onClick={() => openProductDetail(product.id)}
              className="text-sm sm:text-base lg:text-lg font-bold text-stone-900 group-hover:text-amber-900 cursor-pointer transition-colors leading-snug break-words"
            >
              {product.name}
            </h3>

            <p className="text-xs text-stone-600 line-clamp-2 mt-1 leading-relaxed">
              {product.description}
            </p>

            <div className="flex items-center gap-2.5 mt-2 text-xs">
              <div className="flex items-center gap-1 text-amber-500 font-semibold text-[11px] sm:text-xs">
                <Star className="w-3.5 h-3.5 fill-current" />
                <span>{product.rating.toFixed(1)}</span>
                <span className="text-stone-400 font-normal">({product.reviewCount})</span>
              </div>
              <span className="text-stone-300">&bull;</span>
              <span className="text-stone-600 truncate text-[11px] sm:text-xs">{product.material}</span>
            </div>
          </div>

          <div className="pt-3 sm:pt-4 mt-3 border-t border-stone-100 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-baseline gap-1.5 sm:gap-2 flex-wrap">
              <span className="text-base sm:text-lg lg:text-xl font-extrabold text-stone-900">
                ₹{(product.salePrice ?? 0).toLocaleString()}
              </span>
              {(product.discount || 0) > 0 && (
                <span className="text-[11px] sm:text-xs text-stone-400 line-through">
                  ₹{(product.price ?? 0).toLocaleString()}
                </span>
              )}
              <span className="text-[10px] sm:text-xs text-emerald-700 font-medium">
                Save ₹{Math.max(0, (product.price || 0) - (product.salePrice || 0)).toLocaleString()}
              </span>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
              <button
                onClick={() => toggleWishlist(product.id)}
                className={`p-2 sm:p-2.5 rounded-xl border transition-colors cursor-pointer ${
                  isWishlisted
                    ? 'border-red-200 bg-red-50 text-red-600'
                    : 'border-stone-200 hover:border-stone-400 text-stone-600'
                }`}
                title="Wishlist"
              >
                <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
              </button>

              <button
                onClick={() => setQuickViewProductId(product.id)}
                className="p-2 sm:p-2.5 rounded-xl border border-stone-200 hover:border-stone-400 text-stone-600 hover:text-stone-950 bg-white transition-colors cursor-pointer flex items-center justify-center"
                title="Quick View summary"
              >
                <Eye className="w-4 h-4" />
              </button>

              <button
                onClick={() => addToCart(product.id)}
                disabled={isOutOfStock}
                className="px-3 sm:px-4 py-2 sm:py-2.5 bg-stone-900 hover:bg-amber-900 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer"
              >
                <ShoppingBag className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span>{isOutOfStock ? 'Out of Stock' : 'Add to Cart'}</span>
              </button>

              <button
                onClick={() => quickBuyNow(product.id)}
                disabled={isOutOfStock}
                className="px-3 sm:px-4 py-2 sm:py-2.5 bg-amber-100 hover:bg-amber-200 text-amber-900 text-xs font-semibold rounded-xl transition-colors disabled:opacity-50 cursor-pointer"
              >
                Buy Now
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={ref}
      style={{
        transitionDelay: `${staggerDelay}ms`,
        transitionDuration: '650ms',
      }}
      className={`bg-white rounded-2xl border border-stone-200 hover:border-amber-700/40 hover:shadow-xl transition-all ease-[cubic-bezier(0.16,1,0.3,1)] flex flex-col overflow-hidden group will-change-[opacity,transform] ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
      }`}
    >
      {/* Product Image Stage */}
      <div
        onClick={() => openProductDetail(product.id)}
        className="relative aspect-[4/3] w-full overflow-hidden bg-stone-100 cursor-pointer"
      >
        <img
          src={product.images[0]}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          referrerPolicy="no-referrer"
        />

        {/* Badges */}
        <div className="absolute top-2 left-2 sm:top-3 sm:left-3 flex flex-col gap-1 max-w-[70%]">
          {product.discount > 0 && (
            <span className="bg-amber-800 text-white text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded-full shadow-sm tracking-wide self-start truncate">
              {product.discount}% OFF
            </span>
          )}
          {product.isBestSeller && (
            <span className="bg-stone-900 text-amber-300 text-[8px] sm:text-[9px] font-bold uppercase tracking-wider px-1.5 sm:px-2 py-0.5 rounded shadow-sm self-start truncate">
              Best Seller
            </span>
          )}
          {(product.isNewArrival || product.id.startsWith('prod-')) && (
            <span className="bg-emerald-800 text-white text-[8px] sm:text-[9px] font-bold uppercase tracking-wider px-1.5 sm:px-2 py-0.5 rounded shadow-sm flex items-center gap-1 self-start truncate">
              <Sparkles className="w-2 h-2 sm:w-2.5 sm:h-2.5 text-amber-300 shrink-0" />
              <span>New</span>
            </span>
          )}
        </div>

        {/* Floating actions container */}
        <div className="absolute top-2 right-2 sm:top-3 sm:right-3 flex flex-col gap-1.5 z-10">
          {/* Wishlist button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleWishlist(product.id);
            }}
            className={`p-1.5 sm:p-2 rounded-full backdrop-blur-md transition-all shadow-sm cursor-pointer ${
              isWishlisted
                ? 'bg-red-50 text-red-600'
                : 'bg-white/80 hover:bg-white text-stone-700 hover:text-stone-950'
            }`}
            title={isWishlisted ? 'Remove from wishlist' : 'Save to wishlist'}
          >
            <Heart className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isWishlisted ? 'fill-current text-red-600' : ''}`} />
          </button>

          {/* Quick View Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setQuickViewProductId(product.id);
            }}
            className="p-1.5 sm:p-2 rounded-full bg-white/85 hover:bg-white text-stone-700 hover:text-stone-950 backdrop-blur-md transition-all shadow-sm cursor-pointer opacity-100 md:opacity-0 md:group-hover:opacity-100 flex items-center justify-center scale-90 sm:scale-100"
            title="Quick View summary"
          >
            <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
        </div>

        {/* Quick Color Swatches overlay at bottom of image */}
        {product.colors && product.colors.length > 0 && (
          <div className="absolute bottom-2 left-2 sm:bottom-2.5 sm:left-3 flex items-center gap-1 bg-stone-950/60 backdrop-blur-sm px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full">
            {product.colors.slice(0, 3).map((col, idx) => (
              <span
                key={idx}
                className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full border border-white/40"
                style={{ backgroundColor: col.hex }}
                title={col.name}
              />
            ))}
            {product.colors.length > 3 && (
              <span className="text-[8px] sm:text-[9px] text-stone-300 font-bold">+{product.colors.length - 3}</span>
            )}
          </div>
        )}

        {/* Out of stock overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-stone-950/50 backdrop-blur-[1px] flex items-center justify-center">
            <span className="bg-stone-900 text-white text-[11px] sm:text-xs font-bold px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg shadow-lg">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* Product Content Details */}
      <div className="p-3 sm:p-4 lg:p-4.5 flex-1 flex flex-col justify-between min-w-0">
        <div>
          <div className="flex items-center justify-between text-[10px] sm:text-[11px] text-stone-500 mb-1 gap-1">
            <span className="text-amber-900 font-semibold uppercase tracking-wider truncate">{product.brand}</span>
            <div className="flex items-center gap-0.5 sm:gap-1 text-amber-600 font-bold shrink-0">
              <Star className="w-3 h-3 fill-current" />
              <span>{product.rating.toFixed(1)}</span>
            </div>
          </div>

          <h3
            onClick={() => openProductDetail(product.id)}
            className="text-xs sm:text-sm lg:text-base font-bold text-stone-900 group-hover:text-amber-900 transition-colors line-clamp-2 cursor-pointer leading-tight sm:leading-snug break-words min-h-[2.2rem] sm:min-h-[2.5rem]"
          >
            {product.name}
          </h3>

          <p className="text-[10px] sm:text-[11px] text-stone-500 mt-1 truncate">
            {product.material}
          </p>
        </div>

        <div className="mt-3 sm:mt-4 pt-2.5 sm:pt-3 border-t border-stone-100">
          <div className="flex items-end justify-between gap-1.5">
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline gap-1 sm:gap-1.5 flex-wrap">
                <span className="text-sm sm:text-base lg:text-lg font-black text-stone-900">
                  ₹{(product.salePrice ?? 0).toLocaleString()}
                </span>
                {(product.discount || 0) > 0 && (
                  <span className="text-[10px] sm:text-xs text-stone-400 line-through">
                    ₹{(product.price ?? 0).toLocaleString()}
                  </span>
                )}
              </div>
              <span className="text-[9px] sm:text-[10px] text-stone-500 block truncate">
                Free White-Glove Setup
              </span>
            </div>

            {/* Quick Add Button */}
            <button
              onClick={() => addToCart(product.id)}
              disabled={isOutOfStock}
              className="p-2 sm:px-3 sm:py-2 bg-stone-900 hover:bg-amber-900 text-white rounded-xl flex items-center justify-center gap-1 sm:gap-1.5 transition-colors disabled:opacity-40 text-xs font-semibold shadow-xs shrink-0 cursor-pointer"
              title="Add to cart"
            >
              <ShoppingBag className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Add</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
