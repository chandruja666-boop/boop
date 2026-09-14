import React from 'react';
import { Heart, ShoppingBag, Trash2, ArrowRight, Share2, Star } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const WishlistView: React.FC = () => {
  const {
    customer,
    products,
    toggleWishlist,
    addToCart,
    openProductDetail,
    setCurrentView,
    showToast
  } = useApp();

  const wishlistedProducts = products.filter((p) =>
    customer?.wishlist.includes(p.id)
  );

  const handleAddAllToCart = () => {
    if (wishlistedProducts.length === 0) return;
    wishlistedProducts.forEach((p) => {
      if (p.stock > 0) {
        addToCart(p.id, 1);
      }
    });
    showToast('All in-stock wishlist items added to your cart!', 'success');
  };

  const handleShareWishlist = () => {
    navigator.clipboard?.writeText(window.location.href);
    showToast('Wishlist link copied to clipboard!', 'info');
  };

  if (wishlistedProducts.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-20 h-20 rounded-full bg-red-50 text-red-400 mx-auto flex items-center justify-center">
          <Heart className="w-10 h-10 fill-current" />
        </div>
        <h2 className="text-2xl font-bold font-serif-luxury text-stone-900">Your Wishlist is Empty</h2>
        <p className="text-xs sm:text-sm text-stone-500 max-w-md mx-auto">
          Keep track of your dream beds, sofas, dining tables, and executive desks by tapping the heart icon on any piece.
        </p>
        <button
          onClick={() => setCurrentView('shop')}
          className="px-8 py-3.5 bg-stone-900 hover:bg-amber-900 text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-lg inline-flex items-center gap-2"
        >
          <span>Discover Handcrafted Pieces</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif-luxury text-stone-900">
            Saved Furniture Wishlist ({wishlistedProducts.length})
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Personalized collection of handcrafted pieces reserved for your home redesign.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleShareWishlist}
            className="px-4 py-2.5 bg-white border border-stone-200 hover:border-stone-400 text-stone-700 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Share</span>
          </button>

          <button
            onClick={handleAddAllToCart}
            className="px-5 py-2.5 bg-stone-900 hover:bg-amber-900 text-white text-xs font-bold rounded-xl shadow transition-colors flex items-center gap-1.5"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Add All to Cart</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {wishlistedProducts.map((p) => {
          const isOutOfStock = p.stock <= 0;
          return (
            <div
              key={p.id}
              className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm hover:shadow-lg transition-all flex flex-col justify-between"
            >
              <div>
                <div
                  onClick={() => openProductDetail(p.id)}
                  className="relative aspect-[4/3] bg-stone-100 overflow-hidden cursor-pointer group"
                >
                  <img
                    src={p.images[0]}
                    alt={p.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleWishlist(p.id);
                    }}
                    className="absolute top-3 right-3 p-2 bg-white/90 hover:bg-white text-red-600 rounded-full shadow-sm"
                    title="Remove from wishlist"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="p-4">
                  <div className="flex items-center justify-between text-[11px] text-stone-500 mb-1">
                    <span className="font-bold text-amber-900 uppercase">{p.brand}</span>
                    <div className="flex items-center gap-1 text-amber-600 font-bold">
                      <Star className="w-3 h-3 fill-current" />
                      <span>{p.rating.toFixed(1)}</span>
                    </div>
                  </div>

                  <h3
                    onClick={() => openProductDetail(p.id)}
                    className="text-sm font-bold text-stone-900 hover:text-amber-900 cursor-pointer line-clamp-2 leading-snug"
                  >
                    {p.name}
                  </h3>

                  <p className="text-[11px] text-stone-500 mt-1 truncate">{p.material}</p>

                  <div className="flex items-baseline gap-2 mt-3">
                    <span className="text-base font-black text-stone-900">
                      ₹{p.salePrice.toLocaleString()}
                    </span>
                    {p.discount > 0 && (
                      <span className="text-xs text-stone-400 line-through">
                        ₹{p.price.toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-4 pt-0">
                <button
                  onClick={() => addToCart(p.id)}
                  disabled={isOutOfStock}
                  className="w-full py-2.5 bg-stone-900 hover:bg-amber-900 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors disabled:opacity-40"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>{isOutOfStock ? 'Out of Stock' : 'Move to Cart'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
