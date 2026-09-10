'use client';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Package, ShoppingCart, Zap, Boxes } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { packagesApi, PackageDto } from '@/lib/api';
import { getImageUrl } from '@/lib/imageUrl';
import { useCartStore } from '@/store/useCartStore';
import { Skeleton } from '@/components/ui/Skeleton';
import styles from './packages.module.css';

export default function PackagesPage() {
  const [packages, setPackages] = useState<PackageDto[]>([]);
  const [loading, setLoading] = useState(true);
  const { addPackage } = useCartStore();

  useEffect(() => {
    packagesApi.getAll()
      .then(res => setPackages(res.data ?? []))
      .catch(() => toast.error('Failed to load packages.'))
      .finally(() => setLoading(false));
  }, []);

  const handleAdd = (pkg: PackageDto) => {
    addPackage(pkg);
    toast.success(`${pkg.name} added to cart!`);
  };

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
                <Skeleton width="70%" height="1.4rem" />
                <Skeleton width="100%" height="3rem" />
                <Skeleton width="100%" height="6rem" />
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
            {packages.map((pkg, idx) => {
              const savings = pkg.regularPrice - pkg.packagePrice;
              const savingsPct = pkg.regularPrice > 0 ? Math.round((savings / pkg.regularPrice) * 100) : 0;
              return (
                <motion.div key={pkg.id} className={styles.card}
                  initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, delay: idx * 0.05 }}>
                  <div className={styles.cardHead}>
                    <span className={styles.cardTitle}>{pkg.name}</span>
                    {savings > 0 && <span className={styles.saveBadge}>Save {savingsPct}%</span>}
                  </div>

                  {pkg.description && <p className={styles.description}>{pkg.description}</p>}

                  <div className={styles.items}>
                    {pkg.items.map((item, i) => (
                      <div key={`${pkg.id}-${i}`} className={styles.item}>
                        <div className={styles.itemImg}>
                          {item.imageUrl ? (
                            <Image src={getImageUrl(item.imageUrl)!} alt="" fill sizes="34px" style={{ objectFit: 'cover' }} />
                          ) : (
                            <Zap size={15} />
                          )}
                        </div>
                        <span className={styles.itemName}>{item.productName}</span>
                        {item.quantity > 1 && <span className={styles.itemQty}>×{item.quantity}</span>}
                      </div>
                    ))}
                  </div>

                  <div className={styles.priceBlock}>
                    <span className={styles.packagePrice}>৳{pkg.packagePrice.toLocaleString()}</span>
                    {savings > 0 && <span className={styles.regularPrice}>৳{pkg.regularPrice.toLocaleString()}</span>}
                  </div>

                  <div className={styles.footer}>
                    <button className="btn btn-primary btn-lg w-full" style={{ justifyContent: 'center' }} onClick={() => handleAdd(pkg)}>
                      <ShoppingCart size={18} /> Add Package to Cart
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
