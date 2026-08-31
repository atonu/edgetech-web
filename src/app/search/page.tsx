'use client';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search } from 'lucide-react';
import ProductCard from '@/components/products/ProductCard';
import ProductCardSkeleton from '@/components/products/ProductCardSkeleton';
import { ProductListDto, productsApi } from '@/lib/api';
import styles from './search.module.css';

function SearchContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const [results, setResults] = useState<ProductListDto[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setLoading(false);
      return;
    }

    let active = true;
    setLoading(true);

    productsApi.getAll({ search: query.trim(), pageSize: 24 })
      .then(res => {
        if (!active) return;
        setResults(res.data.items || []);
      })
      .catch(() => {
        if (!active) return;
        setResults([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => { active = false; };
  }, [query]);

  return (
    <div className={styles.searchPage}>
      <div className="container">
        <div className={styles.header}>
          <h1>Search Results</h1>
          {query && !loading && (
            <p className="text-muted">Showing results for &ldquo;{query}&rdquo; — {results.length} products found</p>
          )}
          {loading && <p className="text-muted">Searching for &ldquo;{query}&rdquo;...</p>}
        </div>

        {loading ? (
          <div className="grid-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <ProductCardSkeleton key={`search-skel-${i}`} />
            ))}
          </div>
        ) : results.length === 0 ? (
          <div className={styles.emptyState}>
            <Search size={48} />
            <h3>{query ? 'No results found' : 'Start searching'}</h3>
            <p className="text-muted">{query ? 'Try a different search term or check spelling' : 'Use the search bar to find products'}</p>
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
    <Suspense
      fallback={
        <div className={styles.searchPage}>
          <div className="container">
            <div className={styles.header}>
              <h1>Search Results</h1>
              <p className="text-muted">Loading...</p>
            </div>
            <div className="grid-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <ProductCardSkeleton key={`fallback-skel-${i}`} />
              ))}
            </div>
          </div>
        </div>
      }
    >
      <SearchContent />
    </Suspense>
  );
}
