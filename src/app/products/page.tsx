'use client';
import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { SlidersHorizontal, Grid3X3, LayoutList, ChevronDown, X, Search } from 'lucide-react';
import ProductCard from '@/components/products/ProductCard';
import { ProductListDto, productsApi, categoriesApi, brandsApi, CategoryDto, BrandDto, PagedResult } from '@/lib/api';
import styles from './products.module.css';

// Mock data
const mockProducts: ProductListDto[] = Array.from({ length: 16 }).map((_, i) => ({
  id: i + 1,
  name: ['Hikvision 4MP Dome Camera', 'Dahua 8CH NVR System', 'TP-Link 16-Port Switch', 'Seagate 4TB HDD',
    'Hikvision PTZ Camera', 'Dahua 2MP Bullet Cam', 'APC UPS 1200VA', 'Cat6 Network Cable 305m',
    'Hikvision 8MP Turret', 'Dell 24" Monitor', 'Dahua XVR 16CH', 'BNC Video Balun Pack',
    'Imou Cruiser 4MP', 'Uniview 4CH NVR', 'Ruijie 24-Port Switch', 'ZKTeco Biometric'][i],
  slug: `product-${i + 1}`,
  price: [12500, 35000, 8500, 14000, 45000, 8900, 11500, 6500, 28000, 22000, 25000, 2500, 15000, 18000, 12000, 9500][i],
  discountPrice: i % 4 === 0 ? [12500, 35000, 8500, 14000, 45000, 8900, 11500, 6500, 28000, 22000, 25000, 2500, 15000, 18000, 12000, 9500][i] * 0.85 : undefined,
  primaryImageUrl: undefined,
  stock: i === 5 ? 0 : 20 + i,
  isFeatured: i < 8,
  categoryName: ['IP Camera', 'NVR/DVR', 'Networking', 'Storage', 'IP Camera', 'CC Camera', 'UPS', 'Cable',
    'IP Camera', 'Monitor', 'NVR/DVR', 'Accessories', 'IP Camera', 'NVR/DVR', 'Networking', 'Access Control'][i],
  brandName: ['Hikvision', 'Dahua', 'TP-Link', 'Seagate', 'Hikvision', 'Dahua', 'APC', 'Generic',
    'Hikvision', 'Dell', 'Dahua', 'Generic', 'Imou', 'Uniview', 'Ruijie', 'ZKTeco'][i],
}));

const sortOptions = [
  { value: 'newest', label: 'Newest First' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'name-asc', label: 'Name: A-Z' },
  { value: 'popular', label: 'Most Popular' },
];

function ProductsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [products, setProducts] = useState<ProductListDto[]>(mockProducts);
  const [filteredProducts, setFilteredProducts] = useState<ProductListDto[]>(mockProducts);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(true);
  const [search, setSearch] = useState(searchParams.get('q') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [selectedBrand, setSelectedBrand] = useState(searchParams.get('brand') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'newest');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100000]);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);

  const categoryList = ['IP Camera', 'CC Camera', 'NVR/DVR', 'Networking', 'Monitor', 'Storage', 'UPS', 'Accessories', 'Cable', 'Access Control'];
  const brandList = ['Hikvision', 'Dahua', 'TP-Link', 'Imou', 'Uniview', 'Seagate', 'APC', 'Dell', 'ZKTeco', 'Ruijie'];

  // Filter + sort logic (client-side for mock)
  useEffect(() => {
    let result = [...products];
    if (search) result = result.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
    if (selectedCategory) result = result.filter(p => p.categoryName.toLowerCase().replace(/[^a-z]/g, '') === selectedCategory.toLowerCase().replace(/[^a-z-]/g, '').replace(/-/g, ''));
    if (selectedBrand) result = result.filter(p => p.brandName.toLowerCase() === selectedBrand.toLowerCase());
    result = result.filter(p => {
      const effectivePrice = p.discountPrice ?? p.price;
      return effectivePrice >= priceRange[0] && effectivePrice <= priceRange[1];
    });
    
    if (sortBy === 'price-asc') result.sort((a, b) => (a.discountPrice ?? a.price) - (b.discountPrice ?? b.price));
    if (sortBy === 'price-desc') result.sort((a, b) => (b.discountPrice ?? b.price) - (a.discountPrice ?? a.price));
    if (sortBy === 'name-asc') result.sort((a, b) => a.name.localeCompare(b.name));
    
    setFilteredProducts(result);
  }, [products, search, selectedCategory, selectedBrand, sortBy, priceRange]);

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
            <p className="text-muted">{filteredProducts.length} products found</p>
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
                  {categoryList.map(cat => (
                    <button key={cat} className={`${styles.filterOption} ${selectedCategory === cat.toLowerCase().replace(/[\s/]+/g, '-') ? styles.filterOptionActive : ''}`}
                      onClick={() => setSelectedCategory(selectedCategory === cat.toLowerCase().replace(/[\s/]+/g, '-') ? '' : cat.toLowerCase().replace(/[\s/]+/g, '-'))}>
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Brands */}
              <div className={styles.filterGroup}>
                <label className={styles.filterLabel}>Brand</label>
                <div className={styles.filterOptions}>
                  {brandList.map(brand => (
                    <button key={brand} className={`${styles.filterOption} ${selectedBrand === brand.toLowerCase() ? styles.filterOptionActive : ''}`}
                      onClick={() => setSelectedBrand(selectedBrand === brand.toLowerCase() ? '' : brand.toLowerCase())}>
                      {brand}
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
            {filteredProducts.length === 0 ? (
              <div className={styles.emptyState}>
                <Search size={48} />
                <h3>No products found</h3>
                <p className="text-muted">Try adjusting your filters or search term</p>
                <button className="btn btn-primary" onClick={clearFilters}>Clear Filters</button>
              </div>
            ) : (
              <div className={viewMode === 'grid' ? 'grid-4' : styles.listView}>
                {filteredProducts.map((p, i) => (
                  <ProductCard key={p.id} product={p} index={i} />
                ))}
              </div>
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
