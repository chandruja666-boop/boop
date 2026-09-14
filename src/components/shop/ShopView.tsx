import React, { useState, useMemo } from 'react';
import {
  SlidersHorizontal,
  LayoutGrid,
  List,
  Search,
  X,
  Star,
  RotateCcw,
  ChevronDown,
  Check,
  Filter
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ProductCard } from '../common/ProductCard';
import { ScrollReveal } from '../common/ScrollReveal';

export const ShopView: React.FC = () => {
  const { products, categories, filters, setFilters, updateFilter, resetFilters } = useApp();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Extract available distinct values
  const allBrands = useMemo(() => {
    return Array.from(new Set(products.map((p) => p.brand))).filter(Boolean);
  }, [products]);

  const allMaterials = useMemo(() => {
    const list = products.map((p) => {
      if (p.material.includes('Teak')) return 'Solid Teak Wood';
      if (p.material.includes('Sheesham')) return 'Sheesham Wood';
      if (p.material.includes('Velvet')) return 'Plush Velvet';
      if (p.material.includes('Leather')) return 'Vegan Leatherette';
      if (p.material.includes('Mesh')) return 'Aerodynamic Mesh';
      if (p.material.includes('Oak')) return 'Solid Oak';
      if (p.material.includes('Engineered')) return 'High-Density Board';
      if (p.material.includes('Memory Foam')) return 'Memory Foam & Latex';
      return p.material;
    });
    return Array.from(new Set(list));
  }, [products]);

  const allColors = useMemo(() => {
    const colorMap = new Map<string, string>();
    products.forEach((p) => {
      p.colors.forEach((c) => {
        if (!colorMap.has(c.name)) {
          colorMap.set(c.name, c.hex);
        }
      });
    });
    return Array.from(colorMap.entries()).map(([name, hex]) => ({ name, hex }));
  }, [products]);

  const allSizes = useMemo(() => {
    const sizes = new Set<string>();
    products.forEach((p) => {
      p.sizes.forEach((s) => sizes.add(s));
    });
    return Array.from(sizes);
  }, [products]);

  // Dynamic filter logic
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (!p.isPublished) return false;

      // Search query
      if (filters.searchQuery) {
        const q = filters.searchQuery.toLowerCase();
        const matchesQ =
          p.name.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.material.toLowerCase().includes(q);
        if (!matchesQ) return false;
      }

      // Category
      if (filters.category && p.category !== filters.category) {
        return false;
      }

      // Subcategory
      if (filters.subcategory && p.subcategory !== filters.subcategory) {
        return false;
      }

      // Brand
      if (filters.brand && p.brand !== filters.brand) {
        return false;
      }

      // Price Range
      if (p.salePrice < filters.minPrice || p.salePrice > filters.maxPrice) {
        return false;
      }

      // Discount
      if (filters.minDiscount > 0 && p.discount < filters.minDiscount) {
        return false;
      }

      // Material
      if (filters.material && !p.material.toLowerCase().includes(filters.material.toLowerCase())) {
        return false;
      }

      // Color
      if (filters.color && !p.colors.some((c) => c.name.toLowerCase().includes(filters.color.toLowerCase()))) {
        return false;
      }

      // Size
      if (filters.size && !p.sizes.some((s) => s.toLowerCase().includes(filters.size.toLowerCase()))) {
        return false;
      }

      // Availability
      if (filters.availability === 'in-stock' && p.stock <= 0) return false;
      if (filters.availability === 'low-stock' && (p.stock <= 0 || p.stock > p.lowStockLimit)) return false;

      // Rating
      if (filters.minRating > 0 && p.rating < filters.minRating) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      if (filters.sortBy === 'price-low') return a.salePrice - b.salePrice;
      if (filters.sortBy === 'price-high') return b.salePrice - a.salePrice;
      if (filters.sortBy === 'newest') return (b.isNewArrival ? 1 : 0) - (a.isNewArrival ? 1 : 0);
      if (filters.sortBy === 'rating') return b.rating - a.rating;
      if (filters.sortBy === 'popular')
        return (b.isBestSeller ? 1 : 0) - (a.isBestSeller ? 1 : 0);
      return 0; // featured default
    });
  }, [products, filters]);

  // Active filter count
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.category) count++;
    if (filters.subcategory) count++;
    if (filters.brand) count++;
    if (filters.minPrice > 0 || filters.maxPrice < 100000) count++;
    if (filters.minDiscount > 0) count++;
    if (filters.material) count++;
    if (filters.color) count++;
    if (filters.size) count++;
    if (filters.availability !== 'all') count++;
    if (filters.minRating > 0) count++;
    if (filters.searchQuery) count++;
    return count;
  }, [filters]);

  const selectedCategoryObj = categories.find((c) => c.name === filters.category);

  // Filter Sidebar Component
  const FilterContent = (
    <div className="space-y-6 text-xs text-stone-700">
      <div className="flex items-center justify-between pb-3 border-b border-stone-200">
        <div className="flex items-center gap-1.5 font-bold text-sm text-stone-900 uppercase tracking-wider">
          <SlidersHorizontal className="w-4 h-4 text-amber-800" />
          <span>Filters ({activeFiltersCount})</span>
        </div>
        {activeFiltersCount > 0 && (
          <button
            onClick={resetFilters}
            className="text-[11px] text-amber-800 font-semibold hover:underline flex items-center gap-1"
          >
            <RotateCcw className="w-3 h-3" /> Reset
          </button>
        )}
      </div>

      {/* Category Filter */}
      <div className="space-y-2">
        <h4 className="font-bold text-stone-900 uppercase tracking-wider text-[11px]">Categories</h4>
        <div className="space-y-1 max-h-52 overflow-y-auto pr-1">
          <button
            onClick={() => {
              updateFilter('category', '');
              updateFilter('subcategory', '');
            }}
            className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center justify-between ${!filters.category ? 'bg-amber-900 text-white font-bold' : 'hover:bg-stone-100 text-stone-700'
              }`}
          >
            <span>All Categories</span>
            <span>{products.length}</span>
          </button>
          {categories.map((cat) => {
            const count = products.filter((p) => p.category === cat.name).length;
            const isSelected = filters.category === cat.name;
            return (
              <div key={cat.id}>
                <button
                  onClick={() => {
                    updateFilter('category', isSelected ? '' : cat.name);
                    updateFilter('subcategory', '');
                  }}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center justify-between ${isSelected ? 'bg-amber-900 text-white font-bold' : 'hover:bg-stone-100 text-stone-700'
                    }`}
                >
                  <span className="truncate">{cat.name}</span>
                  <span className="text-[10px] opacity-75">({count})</span>
                </button>

                {/* Subcategories if this category is active */}
                {isSelected && cat.subcategories.length > 0 && (
                  <div className="pl-4 py-1 space-y-0.5">
                    {cat.subcategories.map((sub) => {
                      const isSubSelected = filters.subcategory === sub;
                      return (
                        <button
                          key={sub}
                          onClick={() => updateFilter('subcategory', isSubSelected ? '' : sub)}
                          className={`w-full text-left px-2 py-1 rounded text-[11px] flex items-center justify-between ${isSubSelected ? 'text-amber-900 font-bold bg-amber-50' : 'text-stone-500 hover:text-stone-900'
                            }`}
                        >
                          <span>{sub}</span>
                          {isSubSelected && <Check className="w-3 h-3 text-amber-900" />}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Price Range Filter */}
      <div className="space-y-3 pt-2 border-t border-stone-100">
        <div className="flex items-center justify-between">
          <h4 className="font-bold text-stone-900 uppercase tracking-wider text-[11px]">Price Range (₹)</h4>
          <span className="text-[11px] font-mono text-amber-900 font-bold">
            ₹{filters.minPrice.toLocaleString()} - ₹{filters.maxPrice.toLocaleString()}
          </span>
        </div>
        <input
          type="range"
          min={0}
          max={100000}
          step={2000}
          value={filters.maxPrice}
          onChange={(e) => updateFilter('maxPrice', Number(e.target.value))}
          className="w-full accent-amber-900"
        />
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[10px] text-stone-400 block mb-0.5">Min (₹)</label>
            <input
              type="number"
              value={filters.minPrice}
              onChange={(e) => updateFilter('minPrice', Math.max(0, Number(e.target.value)))}
              className="w-full p-1.5 border border-stone-200 rounded text-xs"
            />
          </div>
          <div>
            <label className="text-[10px] text-stone-400 block mb-0.5">Max (₹)</label>
            <input
              type="number"
              value={filters.maxPrice}
              onChange={(e) => updateFilter('maxPrice', Math.min(100000, Number(e.target.value)))}
              className="w-full p-1.5 border border-stone-200 rounded text-xs"
            />
          </div>
        </div>
      </div>

      {/* Discount Filter */}
      <div className="space-y-2 pt-2 border-t border-stone-100">
        <h4 className="font-bold text-stone-900 uppercase tracking-wider text-[11px]">Discount Offer</h4>
        <div className="grid grid-cols-2 gap-1.5">
          {[0, 10, 20, 30].map((disc) => (
            <button
              key={disc}
              onClick={() => updateFilter('minDiscount', disc)}
              className={`px-2.5 py-1.5 rounded-lg border text-xs text-center transition-colors ${filters.minDiscount === disc
                ? 'border-amber-900 bg-amber-50 text-amber-900 font-bold'
                : 'border-stone-200 hover:border-stone-400 text-stone-700'
                }`}
            >
              {disc === 0 ? 'All Items' : `${disc}% or more`}
            </button>
          ))}
        </div>
      </div>

      {/* Material Filter */}
      <div className="space-y-2 pt-2 border-t border-stone-100">
        <h4 className="font-bold text-stone-900 uppercase tracking-wider text-[11px]">Primary Material</h4>
        <div className="space-y-1 max-h-36 overflow-y-auto pr-1">
          {allMaterials.map((mat) => {
            const isSelected = filters.material === mat;
            return (
              <button
                key={mat}
                onClick={() => updateFilter('material', isSelected ? '' : mat)}
                className={`w-full text-left px-2 py-1 rounded flex items-center justify-between text-xs ${isSelected ? 'bg-stone-900 text-white font-semibold' : 'hover:bg-stone-100 text-stone-600'
                  }`}
              >
                <span className="truncate">{mat}</span>
                {isSelected && <Check className="w-3 h-3 text-amber-400" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Colors Filter */}
      <div className="space-y-2 pt-2 border-t border-stone-100">
        <h4 className="font-bold text-stone-900 uppercase tracking-wider text-[11px]">Color Palette</h4>
        <div className="flex flex-wrap gap-2">
          {allColors.slice(0, 10).map((col) => {
            const isSelected = filters.color === col.name;
            return (
              <button
                key={col.name}
                onClick={() => updateFilter('color', isSelected ? '' : col.name)}
                className={`w-6 h-6 rounded-full border transition-all flex items-center justify-center ${isSelected ? 'ring-2 ring-amber-900 ring-offset-2 scale-110' : 'border-stone-300'
                  }`}
                style={{ backgroundColor: col.hex }}
                title={col.name}
              >
                {isSelected && <Check className="w-3 h-3 text-white drop-shadow" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Rating Filter */}
      <div className="space-y-2 pt-2 border-t border-stone-100">
        <h4 className="font-bold text-stone-900 uppercase tracking-wider text-[11px]">Customer Rating</h4>
        <div className="space-y-1">
          {[4, 3, 0].map((rate) => (
            <button
              key={rate}
              onClick={() => updateFilter('minRating', rate)}
              className={`w-full text-left px-2 py-1 rounded flex items-center justify-between text-xs ${filters.minRating === rate ? 'bg-amber-50 text-amber-900 font-bold' : 'hover:bg-stone-100 text-stone-600'
                }`}
            >
              <div className="flex items-center gap-1">
                {rate > 0 ? (
                  <>
                    <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                    <span>{rate}★ & above</span>
                  </>
                ) : (
                  <span>All Ratings</span>
                )}
              </div>
              {filters.minRating === rate && <Check className="w-3 h-3 text-amber-900" />}
            </button>
          ))}
        </div>
      </div>

      {/* Availability Filter */}
      <div className="space-y-2 pt-2 border-t border-stone-100">
        <h4 className="font-bold text-stone-900 uppercase tracking-wider text-[11px]">Availability</h4>
        <div className="flex gap-2">
          <button
            onClick={() => updateFilter('availability', 'all')}
            className={`flex-1 py-1.5 rounded border text-xs text-center ${filters.availability === 'all'
              ? 'border-stone-900 bg-stone-900 text-white font-bold'
              : 'border-stone-200 text-stone-700'
              }`}
          >
            All
          </button>
          <button
            onClick={() => updateFilter('availability', 'in-stock')}
            className={`flex-1 py-1.5 rounded border text-xs text-center ${filters.availability === 'in-stock'
              ? 'border-emerald-700 bg-emerald-50 text-emerald-800 font-bold'
              : 'border-stone-200 text-stone-700'
              }`}
          >
            In Stock
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl 2xl:max-w-screen-2xl mx-auto px-3.5 sm:px-6 lg:px-8 py-6 sm:py-10">
      {/* Breadcrumbs & Header Title */}
      <ScrollReveal animation="fade-down">
        <div className="mb-6">
          <div className="text-xs text-stone-500 mb-2 flex items-center gap-1">
            <span>Home</span>
            <span>/</span>
            <span className="text-stone-900 font-medium">Showroom Catalog</span>
            {filters.category && (
              <>
                <span>/</span>
                <span className="text-amber-900 font-bold">{filters.category}</span>
              </>
            )}
            {filters.subcategory && (
              <>
                <span>/</span>
                <span className="text-stone-700">{filters.subcategory}</span>
              </>
            )}
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-4xl font-bold text-stone-900 font-serif-luxury">
                {filters.category || 'All Furniture Collections'}
              </h1>
              <p className="text-xs sm:text-sm text-stone-500 mt-1">
                Showing {filteredProducts.length} handcrafted pieces crafted from solid teak and luxury upholstery.
              </p>
            </div>

            {/* Controls Bar */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 self-start sm:self-auto">
              {/* Mobile Filter Trigger */}
              <button
                onClick={() => setMobileFiltersOpen(true)}
                className="lg:hidden px-3 py-2 bg-stone-900 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Filter className="w-3.5 h-3.5" />
                <span>Filters ({activeFiltersCount})</span>
              </button>

              {/* Sort Dropdown */}
              <div className="flex items-center gap-1 text-xs">
                <span className="text-stone-400 hidden sm:inline">Sort by:</span>
                <select
                  id="shop-sort-select"
                  value={filters.sortBy}
                  onChange={(e) => updateFilter('sortBy', e.target.value as any)}
                  className="bg-white border border-stone-200 text-stone-900 font-medium rounded-xl px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs focus:outline-none focus:border-amber-900 cursor-pointer"
                >
                  <option value="featured">Showroom Featured</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="newest">Newest Arrivals</option>
                  <option value="best-selling">Best Selling</option>
                  <option value="rating">Highest Rated</option>
                </select>
              </div>

              {/* Grid/List View Mode */}
              <div className="hidden sm:flex items-center border border-stone-200 rounded-xl p-0.5 bg-stone-50">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-lg cursor-pointer transition-colors ${viewMode === 'grid' ? 'bg-white shadow text-stone-900' : 'text-stone-400 hover:text-stone-700'}`}
                  title="Grid view"
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 rounded-lg cursor-pointer transition-colors ${viewMode === 'list' ? 'bg-white shadow text-stone-900' : 'text-stone-400 hover:text-stone-700'}`}
                  title="List view"
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Active Filter Chips */}
          {activeFiltersCount > 0 && (
            <div className="flex flex-wrap items-center gap-2 mt-4 pt-3 border-t border-stone-200">
              <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">Active:</span>
              {filters.category && (
                <span className="inline-flex items-center gap-1 bg-stone-100 text-stone-800 text-xs px-2.5 py-1 rounded-full">
                  {filters.category}
                  <X className="w-3 h-3 cursor-pointer" onClick={() => updateFilter('category', '')} />
                </span>
              )}
              {filters.subcategory && (
                <span className="inline-flex items-center gap-1 bg-stone-100 text-stone-800 text-xs px-2.5 py-1 rounded-full">
                  {filters.subcategory}
                  <X className="w-3 h-3 cursor-pointer" onClick={() => updateFilter('subcategory', '')} />
                </span>
              )}
              {filters.searchQuery && (
                <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-900 text-xs px-2.5 py-1 rounded-full font-medium">
                  Keyword: "{filters.searchQuery}"
                  <X className="w-3 h-3 cursor-pointer" onClick={() => updateFilter('searchQuery', '')} />
                </span>
              )}
              {filters.material && (
                <span className="inline-flex items-center gap-1 bg-stone-100 text-stone-800 text-xs px-2.5 py-1 rounded-full">
                  Material: {filters.material}
                  <X className="w-3 h-3 cursor-pointer" onClick={() => updateFilter('material', '')} />
                </span>
              )}
              {filters.minDiscount > 0 && (
                <span className="inline-flex items-center gap-1 bg-stone-100 text-stone-800 text-xs px-2.5 py-1 rounded-full">
                  {filters.minDiscount}%+ Discount
                  <X className="w-3 h-3 cursor-pointer" onClick={() => updateFilter('minDiscount', 0)} />
                </span>
              )}
              {filters.minRating > 0 && (
                <span className="inline-flex items-center gap-1 bg-stone-100 text-stone-800 text-xs px-2.5 py-1 rounded-full">
                  {filters.minRating}★ & above
                  <X className="w-3 h-3 cursor-pointer" onClick={() => updateFilter('minRating', 0)} />
                </span>
              )}
              <button
                onClick={resetFilters}
                className="text-xs text-amber-800 hover:underline font-semibold ml-2 cursor-pointer"
              >
                Clear All
              </button>
            </div>
          )}
        </div>
      </ScrollReveal>

      {/* Main Layout: Filters Sidebar + Products Display */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block lg:col-span-1 bg-white p-5 rounded-2xl border border-stone-200 h-fit sticky top-28 shadow-sm">
          {FilterContent}
        </aside>

        {/* Products Grid / List */}
        <main className="lg:col-span-3">
          {filteredProducts.length === 0 ? (
            <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center">
              <div className="w-16 h-16 rounded-full bg-stone-100 mx-auto flex items-center justify-center text-stone-400 mb-4">
                <Search className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-stone-900 mb-1">No furniture items matched your filters</h3>
              <p className="text-xs text-stone-500 max-w-sm mx-auto mb-6">
                Try widening your price range, resetting material preferences, or removing specific subcategories.
              </p>
              <button
                onClick={resetFilters}
                className="px-5 py-2.5 bg-stone-900 text-white text-xs font-semibold rounded-xl hover:bg-amber-900 transition-colors"
              >
                Reset All Filters
              </button>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-3.5 sm:gap-5 lg:gap-6">
              {filteredProducts.map((p, idx) => (
                <ProductCard key={p.id} product={p} viewMode="grid" index={idx} />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredProducts.map((p, idx) => (
                <ProductCard key={p.id} product={p} viewMode="list" index={idx} />
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Mobile Filters Drawer */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-sm flex justify-end">
          <div className="bg-white w-full max-w-xs h-full p-5 overflow-y-auto flex flex-col justify-between animate-in slide-in-from-right">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-stone-200 mb-4">
                <span className="font-bold text-base text-stone-900 font-serif-luxury">Refine Furniture</span>
                <button
                  onClick={() => setMobileFiltersOpen(false)}
                  className="p-1 text-stone-400 hover:text-stone-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              {FilterContent}
            </div>

            <div className="pt-4 border-t border-stone-200 mt-6 sticky bottom-0 bg-white">
              <button
                onClick={() => setMobileFiltersOpen(false)}
                className="w-full py-3 bg-stone-900 text-white text-xs font-bold rounded-xl"
              >
                Show {filteredProducts.length} Results
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
