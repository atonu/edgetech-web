'use client';
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { SlidersHorizontal, Grid3X3, LayoutList, ChevronDown, X, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import ProductCard from '@/components/products/ProductCard';
import ProductCardSkeleton from '@/components/products/ProductCardSkeleton';
import { ProductListDto, productsApi, categoriesApi, brandsApi, CategoryDto } from '@/lib/api';
import styles from './products.module.css';

const sortOptions = [
  { value: 'newest', label: 'Newest First' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'name-asc', label: 'Name: A-Z' },
  { value: 'popular', label: 'Most Popular' },
];

interface FilterOption { name: string; slug: string; }

function flattenCategories(categories: CategoryDto[]): FilterOption[] {
  const result: FilterOption[] = [];
  for (const c of categories) {
    result.push({ name: c.name, slug: c.slug ?? '' });
    if (c.subCategories?.length) result.push(...flattenCategories(c.subCategories));
  }
  return result;
}

function ProductsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Read current filters directly from URL searchParams
  const selectedCategory = searchParams.get('category') || '';
  const selectedBrand = searchParams.get('brand') || '';
  const sortBy = searchParams.get('sort') || 'newest';
  const pageParam = parseInt(searchParams.get('page') || '1', 10);
  const currentPage = isNaN(pageParam) || pageParam < 1 ? 1 : pageParam;

  const [products, setProducts] = useState<ProductListDto[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [resolvedRequestKey, setResolvedRequestKey] = useState<string | null>(null);

  const [categoryOptions, setCategoryOptions] = useState<FilterOption[]>([]);
  const [brandOptions, setBrandOptions] = useState<FilterOption[]>([]);

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(true);

  const urlQ = searchParams.get('q') || '';
  const [search, setSearch] = useState(urlQ);
  const [debouncedSearch, setDebouncedSearch] = useState(urlQ);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100000]);

  // Sync search input if URL changes externally
  useEffect(() => {
    setSearch(urlQ);
    setDebouncedSearch(urlQ);
  }, [urlQ]);

  // Load filter option lists once
  useEffect(() => {
    categoriesApi.getAll().then(res => setCategoryOptions(flattenCategories(res.data))).catch(() => setCategoryOptions([]));
    brandsApi.getAll().then(res => setBrandOptions(res.data.map(b => ({ name: b.name, slug: b.slug })))).catch(() => setBrandOptions([]));
  }, []);

  // Update URL search parameters helper
  const updateUrlParams = (updates: Record<string, string | number | null | undefined>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, val]) => {
      if (val === null || val === undefined || val === '') {
        params.delete(key);
      } else {
        params.set(key, String(val));
      }
    });
    // Reset page to 1 unless page is specifically being updated
    if (!('page' in updates)) {
      params.delete('page');
    }
    const query = params.toString();
    router.push(query ? `/products?${query}` : '/products', { scroll: false });
  };

  // Debounce free-text search and update URL
  useEffect(() => {
    const timer = setTimeout(() => {
      const trimmed = search.trim();
      if (trimmed !== urlQ) {
        setDebouncedSearch(trimmed);
        updateUrlParams({ q: trimmed || null });
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  const handleCategoryClick = (slug: string) => {
    const next = selectedCategory === slug ? null : slug;
    updateUrlParams({ category: next });
  };

  const handleBrandClick = (slug: string) => {
    const next = selectedBrand === slug ? null : slug;
    updateUrlParams({ brand: next });
  };

  const handleSortChange = (newSort: string) => {
    updateUrlParams({ sort: newSort === 'newest' ? null : newSort });
  };

  const handlePageChange = (newPage: number) => {
    updateUrlParams({ page: newPage > 1 ? newPage : null });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const clearFilters = () => {
    setSearch('');
    setDebouncedSearch('');
    setPriceRange([0, 100000]);
    router.push('/products', { scroll: false });
  };

  const requestKey = `${debouncedSearch}|${selectedCategory}|${selectedBrand}|${sortBy}|${priceRange[0]}|${priceRange[1]}|${currentPage}`;
  const loading = requestKey !== resolvedRequestKey;

  // Fetch products from the API whenever filters/page change
  useEffect(() => {
    let active = true;
    productsApi.getAll({
      search: debouncedSearch || undefined,
      category: selectedCategory || undefined,
      brand: selectedBrand || undefined,
      sort: sortBy,
      minPrice: priceRange[0] || undefined,
      maxPrice: priceRange[1] === 100000 ? undefined : priceRange[1],
      page: currentPage,
      pageSize: 15,
    }).then(res => {
      if (!active) return;
      setProducts(res.data.items);
      setTotalCount(res.data.totalCount);
      setTotalPages(res.data.totalPages);
    }).catch(() => {
      if (!active) return;
      setProducts([]);
      setTotalCount(0);
      setTotalPages(1);
    }).finally(() => {
      if (active) setResolvedRequestKey(requestKey);
    });
    return () => { active = false; };
  }, [requestKey]);

  const activeFilterCount = [debouncedSearch, selectedCategory, selectedBrand].filter(Boolean).length;

  return (
    <div className={styles.productsPage}>
      <div className="container">
        {/* Page Header */}
        <div className={styles.pageHeader}>
          <div>
            <h1>Products</h1>
            <p className="text-muted">{loading ? 'Loading…' : `${totalCount} products found`}</p>
          </div>
          <div className={styles.headerControls}>
            <div className={styles.sortWrap}>
              <select value={sortBy} onChange={e => handleSortChange(e.target.value)} className={styles.sortSelect}>
                {sortOptions.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
              <ChevronDown size={14} className={styles.sortIcon} />
            </div>
            <div className={styles.viewToggle}>
              <button className={`${styles.viewBtn} ${viewMode === 'grid' ? styles.viewBtnActive : ''}`} onClick={() => setViewMode('grid')}>
                <Grid3X3 size={16} />
              </button>
              <button className={`${styles.viewBtn} ${viewMode === 'list' ? styles.viewBtnActive : ''}`} onClick={() => setViewMode('list')}>
                <LayoutList size={16} />
              </button>
            </div>
            <button className={`${styles.filterToggle} btn btn-ghost btn-sm`} onClick={() => setShowFilters(!showFilters)}>
              <SlidersHorizontal size={16} />
              Filters {activeFilterCount > 0 && <span className={styles.filterBadge}>{activeFilterCount}</span>}
            </button>
          </div>
        </div>

        <div className={styles.content}>
          {/* Sidebar Filters */}
          <aside className={`${styles.sidebar} ${showFilters ? styles.sidebarOpen : ''}`}>
            <div className={styles.filterCard}>
              <div className={styles.filterHeader}>
                <h4>Filters</h4>
                {activeFilterCount > 0 && (
                  <button className={styles.clearBtn} onClick={clearFilters}>Clear All</button>
                )}
              </div>

              {/* Search */}
              <div className={styles.filterGroup}>
                <label className={styles.filterLabel}>Search</label>
                <div className={styles.searchInput}>
                  <Search size={14} />
                  <input type="text" placeholder="Search products..." value={search} onChange={e => setSearch(e.target.value)} />
                  {search && <button onClick={() => setSearch('')}><X size={12} /></button>}
                </div>
              </div>

              {/* Categories */}
              <div className={styles.filterGroup}>
                <label className={styles.filterLabel}>Category</label>
                <div className={styles.filterOptions}>
                  {categoryOptions.map(cat => (
                    <button key={cat.slug} className={`${styles.filterOption} ${selectedCategory === cat.slug ? styles.filterOptionActive : ''}`}
                      onClick={() => handleCategoryClick(cat.slug)}>
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Brands */}
              <div className={styles.filterGroup}>
                <label className={styles.filterLabel}>Brand</label>
                <div className={styles.filterOptions}>
                  {brandOptions.map(brand => (
                    <button key={brand.slug} className={`${styles.filterOption} ${selectedBrand === brand.slug ? styles.filterOptionActive : ''}`}
                      onClick={() => handleBrandClick(brand.slug)}>
                      {brand.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div className={styles.filterGroup}>
                <label className={styles.filterLabel}>Price Range</label>
                <div className={styles.priceInputs}>
                  <input type="number" placeholder="Min" value={priceRange[0] || ''} className="input"
                    onChange={e => setPriceRange([Number(e.target.value) || 0, priceRange[1]])} />
                  <span>—</span>
                  <input type="number" placeholder="Max" value={priceRange[1] === 100000 ? '' : priceRange[1]} className="input"
                    onChange={e => setPriceRange([priceRange[0], Number(e.target.value) || 100000])} />
                </div>
              </div>
            </div>
          </aside>

          {/* Product Grid */}
          <div className={styles.productArea}>
            {loading ? (
              <div className={viewMode === 'grid' ? 'grid-5' : styles.listView}>
                {Array.from({ length: 15 }).map((_, i) => <ProductCardSkeleton key={`skeleton-${i}`} />)}
              </div>
            ) : products.length === 0 ? (
              <div className={styles.emptyState}>
                <Search size={48} />
                <h3>No products found</h3>
                <p className="text-muted">Try adjusting your filters or search term</p>
                <button className="btn btn-primary" onClick={clearFilters}>Clear Filters</button>
              </div>
            ) : (
              <>
                <div className={viewMode === 'grid' ? 'grid-5' : styles.listView}>
                  {products.map((p, i) => (
                    <ProductCard key={p.id} product={p} index={i} />
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className={styles.pagination}>
                    <button
                      className="btn btn-ghost btn-sm"
                      disabled={currentPage <= 1}
                      onClick={() => handlePageChange(currentPage - 1)}
                    >
                      <ChevronLeft size={16} /> Prev
                    </button>
                    <span className={styles.pageIndicator}>Page {currentPage} of {totalPages}</span>
                    <button
                      className="btn btn-ghost btn-sm"
                      disabled={currentPage >= totalPages}
                      onClick={() => handlePageChange(currentPage + 1)}
                    >
                      Next <ChevronRight size={16} />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className={styles.productsPage}><div className="container"><h1>Loading...</h1></div></div>}>
      <ProductsContent />
    </Suspense>
  );
}
