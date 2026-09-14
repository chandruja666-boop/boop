import React, { useState, useEffect, useRef } from 'react';
import { Search, X, ArrowRight, Sparkles, Tag, Layers, CheckCircle2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Product } from '../../types';

export const SearchModal: React.FC = () => {
  const {
    isSearchOpen,
    setIsSearchOpen,
    products,
    openProductDetail,
    setCurrentView,
    setFilters
  } = useApp();

  const [query, setQuery] = useState('');
  const [recentSearches, setRecentSearches] = useState<string[]>([
    'Teak King Bed',
    'Chesterfield Velvet Sofa',
    'Dining Set',
    'Ergonomic Mesh Chair'
  ]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isSearchOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setQuery('');
    }
  }, [isSearchOpen]);

  if (!isSearchOpen) return null;

  const cleanQuery = query.trim().toLowerCase();

  const filteredProducts = cleanQuery
    ? products.filter((p) => {
        return (
          p.name.toLowerCase().includes(cleanQuery) ||
          p.sku.toLowerCase().includes(cleanQuery) ||
          p.category.toLowerCase().includes(cleanQuery) ||
          p.subcategory.toLowerCase().includes(cleanQuery) ||
          p.brand.toLowerCase().includes(cleanQuery) ||
          p.material.toLowerCase().includes(cleanQuery)
        );
      })
    : [];

  const handleSelectProduct = (prod: Product) => {
    if (query.trim() && !recentSearches.includes(query.trim())) {
      setRecentSearches((prev) => [query.trim(), ...prev.slice(0, 4)]);
    }
    setIsSearchOpen(false);
    openProductDetail(prod.id);
  };

  const handleSearchAll = () => {
    if (query.trim()) {
      if (!recentSearches.includes(query.trim())) {
        setRecentSearches((prev) => [query.trim(), ...prev.slice(0, 4)]);
      }
      setFilters((prev) => ({ ...prev, searchQuery: query.trim() }));
      setIsSearchOpen(false);
      setCurrentView('shop');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/70 backdrop-blur-sm flex items-start justify-center pt-16 sm:pt-24 px-4 pb-8">
      <div
        id="search-modal-container"
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-stone-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-5 py-4 border-b border-stone-200 bg-stone-50/50">
          <Search className="w-5 h-5 text-amber-800 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            id="global-search-input"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSearchAll();
              if (e.key === 'Escape') setIsSearchOpen(false);
            }}
            placeholder="Search by furniture name, SKU (e.g. CP-SOF), category, or solid teak..."
            className="w-full bg-transparent px-3 py-1 text-sm sm:text-base text-stone-900 placeholder:text-stone-400 focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-stone-400 hover:text-stone-700 mr-2"
              title="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => setIsSearchOpen(false)}
            className="px-2.5 py-1 text-xs font-semibold text-stone-500 hover:text-stone-800 bg-stone-200/80 rounded-md"
          >
            ESC
          </button>
        </div>

        {/* Search Results / Suggestions */}
        <div className="max-h-[60vh] overflow-y-auto p-4 sm:p-5">
          {cleanQuery ? (
            <div>
              <div className="flex items-center justify-between mb-3 text-xs text-stone-500 font-medium px-1">
                <span>Matching Products ({filteredProducts.length})</span>
                {filteredProducts.length > 0 && (
                  <button
                    onClick={handleSearchAll}
                    className="text-amber-800 hover:underline font-semibold flex items-center gap-1"
                  >
                    View all in Shop &rarr;
                  </button>
                )}
              </div>

              {filteredProducts.length === 0 ? (
                <div className="text-center py-10">
                  <div className="w-12 h-12 rounded-full bg-stone-100 mx-auto flex items-center justify-center text-stone-400 mb-2">
                    <Search className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-semibold text-stone-700">No matching furniture found</h4>
                  <p className="text-xs text-stone-400 mt-1 max-w-xs mx-auto">
                    Try searching for "sofa", "hydraulic bed", "sheesham", or browse our categories.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredProducts.map((p) => (
                    <div
                      key={p.id}
                      onClick={() => handleSelectProduct(p)}
                      className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-stone-50 transition-colors cursor-pointer border border-transparent hover:border-stone-200 group"
                    >
                      <img
                        src={p.images[0]}
                        alt={p.name}
                        className="w-16 h-16 object-cover rounded-lg bg-stone-100 flex-shrink-0"
                        referrerPolicy="no-referrer"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono font-medium px-1.5 py-0.5 bg-stone-100 text-stone-600 rounded">
                            {p.sku}
                          </span>
                          <span className="text-xs text-amber-800 font-medium truncate">{p.category}</span>
                        </div>
                        <h4 className="text-xs sm:text-sm font-semibold text-stone-900 group-hover:text-amber-900 transition-colors truncate">
                          {p.name}
                        </h4>
                        <div className="flex items-center gap-2 text-xs mt-0.5">
                          <span className="font-bold text-stone-900">₹{p.salePrice.toLocaleString()}</span>
                          {p.discount > 0 && (
                            <span className="text-stone-400 line-through text-[11px]">
                              ₹{p.price.toLocaleString()}
                            </span>
                          )}
                          <span className="text-[11px] text-green-700 font-medium">
                            {p.stock > 0 ? `${p.stock} in stock` : 'Out of stock'}
                          </span>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-stone-300 group-hover:text-amber-900 group-hover:translate-x-1 transition-all" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {/* Recent Searches */}
              {recentSearches.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">
                    Recent Searches
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {recentSearches.map((term, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          setQuery(term);
                        }}
                        className="text-xs px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-full flex items-center gap-1.5 transition-colors"
                      >
                        <Search className="w-3 h-3 text-stone-400" />
                        <span>{term}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Popular Curations */}
              <div>
                <h4 className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">
                  Popular Showroom Collections
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    'Sofas & Seating',
                    'Beds & Bedroom',
                    'Dining & Kitchen',
                    'Office & Study',
                    'Wardrobes & Storage',
                    'Mattresses & Pillows'
                  ].map((cat, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setIsSearchOpen(false);
                        useApp().selectCategoryFromHome(cat);
                      }}
                      className="text-left text-xs p-2.5 rounded-lg border border-stone-200 hover:border-amber-700 hover:bg-amber-50/50 text-stone-800 transition-colors"
                    >
                      <span className="font-semibold block truncate">{cat}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
