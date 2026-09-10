'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Package, Boxes } from 'lucide-react';
import toast from 'react-hot-toast';
import { packagesApi, PackageDto } from '@/lib/api';
import { Skeleton } from '@/components/ui/Skeleton';
import PackageShowcaseCard from '@/components/products/PackageShowcaseCard';
import styles from './packages.module.css';

export default function PackagesPage() {
  const [packages, setPackages] = useState<PackageDto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    packagesApi.getAll()
      .then(res => setPackages(res.data ?? []))
      .catch(() => toast.error('Failed to load packages.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className={styles.page}>
      <div className="container">
        <div className={styles.header}>
          <span className="section-label"><Boxes size={14} /> Bundle Packages</span>
          <h1><span className="gradient-text">Ready-Made Packages</span></h1>
          <p className="text-muted">Curated bundles at a special price. Add a full setup to your cart in a single click.</p>
        </div>

        {loading ? (
          <div className={styles.grid}>
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={`pkg-skel-${i}`} className={styles.card}>
                <Skeleton width="100%" height="180px" radius="var(--radius-md)" style={{ marginBottom: 16 }} />
                <Skeleton width="70%" height="1.4rem" />
                <Skeleton width="100%" height="3rem" />
                <Skeleton width="50%" height="1.8rem" />
                <Skeleton width="100%" height="44px" radius="var(--radius-md)" />
              </div>
            ))}
          </div>
        ) : packages.length === 0 ? (
          <div className={styles.emptyState}>
            <Package size={64} />
            <h2>No packages available yet</h2>
            <p className="text-muted">Check back soon, or build your own custom solution.</p>
            <Link href="/package-builder" className="btn btn-primary btn-lg" style={{ marginTop: 16 }}>
              Build Your Solution
            </Link>
          </div>
        ) : (
          <div className={styles.grid}>
            {packages.map((pkg, idx) => (
              <PackageShowcaseCard key={pkg.id} pkg={pkg} index={idx} maxItems={6} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
