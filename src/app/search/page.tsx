'use client';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search } from 'lucide-react';
import ProductCard from '@/components/products/ProductCard';
import { ProductListDto } from '@/lib/api';
import styles from './search.module.css';

const mockProducts: ProductListDto[] = Array.from({ length: 12 }).map((_, i) => ({
  id: i + 1,
  name: ['Hikvision 4MP Dome Camera', 'Dahua 8CH NVR System', 'TP-Link 16-Port Switch', 'Seagate 4TB HDD',
    'Hikvision PTZ Camera', 'Dahua 2MP Bullet Cam', 'APC UPS 1200VA', 'Cat6 Network Cable 305m',
    'Hikvision 8MP Turret', 'Dell 24" Monitor', 'Dahua XVR 16CH', 'BNC Video Balun Pack'][i],
  slug: `product-${i + 1}`,
  price: [12500, 35000, 8500, 14000, 45000, 8900, 11500, 6500, 28000, 22000, 25000, 2500][i],
  primaryImageUrl: undefined, stock: 20, isFeatured: i < 4,
  categoryName: ['IP Camera', 'NVR/DVR', 'Networking', 'Storage', 'IP Camera', 'CC Camera', 'UPS', 'Cable', 'IP Camera', 'Monitor', 'NVR/DVR', 'Accessories'][i],
  brandName: ['Hikvision', 'Dahua', 'TP-Link', 'Seagate', 'Hikvision', 'Dahua', 'APC', 'Generic', 'Hikvision', 'Dell', 'Dahua', 'Generic'][i],
}));

function SearchContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const [results, setResults] = useState<ProductListDto[]>([]);

  useEffect(() => {
    if (query) {
      const filtered = mockProducts.filter(p =>
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.categoryName.toLowerCase().includes(query.toLowerCase()) ||
        p.brandName.toLowerCase().includes(query.toLowerCase())
      );
      setResults(filtered);
    } else {
      setResults([]);
    }
  }, [query]);

  return (
    <div className={styles.searchPage}>
      <div className="container">
        <div className={styles.header}>
          <h1>Search Results</h1>
          {query && <p className="text-muted">Showing results for &ldquo;{query}&rdquo; — {results.length} products found</p>}
        </div>

        {results.length === 0 ? (
          <div className={styles.emptyState}>
            <Search size={48} />
            <h3>{query ? 'No results found' : 'Start searching'}</h3>
            <p className="text-muted">{query ? 'Try a different search term' : 'Use the search bar to find products'}</p>
          </div>
        ) : (
          <div className="grid-4">
            {results.map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className={styles.searchPage}><div className="container"><h1>Loading...</h1></div></div>}>
      <SearchContent />
    </Suspense>
  );
}
