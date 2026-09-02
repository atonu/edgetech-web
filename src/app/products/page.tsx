'use client';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
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
  const searchParams = useSearchParams();

  const [products, setProducts] = useState<ProductListDto[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [resolvedRequestKey, setResolvedRequestKey] = useState<string | null>(null);

  const [categoryOptions, setCategoryOptions] = useState<FilterOption[]>([]);
  const [brandOptions, setBrandOptions] = useState<FilterOption[]>([]);

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(true);
  const [search, setSearch] = useState(searchParams.get('q') || '');
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [selectedBrand, setSelectedBrand] = useState(searchParams.get('brand') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'newest');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100000]);

  // Load filter option lists once
  useEffect(() => {
    categoriesApi.getAll().then(res => setCategoryOptions(flattenCategories(res.data))).catch(() => setCategoryOptions([]));
    brandsApi.getAll().then(res => setBrandOptions(res.data.map(b => ({ name: b.name, slug: b.slug })))).catch(() => setBrandOptions([]));
  }, []);

  // Debounce free-text search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 350);
    return () => clearTimeout(timer);
  }, [search]);

  // Filters identify a page-1 request; changing any of them invalidates the current page.
  // Adjusted during render (React's documented pattern) rather than in an effect.
  const filterKey = JSON.stringify([debouncedSearch, selectedCategory, selectedBrand, sortBy, priceRange]);
  const [lastFilterKey, setLastFilterKey] = useState(filterKey);
  let page = currentPage;
  if (filterKey !== lastFilterKey) {
    setLastFilterKey(filterKey);
    setCurrentPage(1);
    page = 1;
  }

  const requestKey = `${filterKey}|${page}`;
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
      page,
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
    // requestKey already encodes every filter plus the page, so it's the only real dependency.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requestKey]);

  const clearFilters = () => {
    setSearch('');
    setSelectedCategory('');
    setSelectedBrand('');
    setSortBy('newest');
    setPriceRange([0, 100000]);
  };

  const activeFilterCount = [search, selectedCategory, selectedBrand].filter(Boolean).length;

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
              <select value={sortBy} onChange={e => setSortBy(e.target.value)} className={styles.sortSelect}>
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
                      onClick={() => setSelectedCategory(selectedCategory === cat.slug ? '' : cat.slug)}>
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
                      onClick={() => setSelectedBrand(selectedBrand === brand.slug ? '' : brand.slug)}>
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
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    >
                      <ChevronLeft size={16} /> Prev
                    </button>
                    <span className={styles.pageIndicator}>Page {currentPage} of {totalPages}</span>
                    <button
                      className="btn btn-ghost btn-sm"
                      disabled={currentPage >= totalPages}
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
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
