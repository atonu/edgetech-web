'use client';

import { use, useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Check, ChevronRight, Package as PackageIcon, ShoppingCart, Zap } from 'lucide-react';
import toast from 'react-hot-toast';
import { PackageDto, packagesApi } from '@/lib/api';
import { aggregatePackageItems } from '@/lib/packageItems';
import { getImageUrl } from '@/lib/imageUrl';
import { useCartStore } from '@/store/useCartStore';
import { Skeleton } from '@/components/ui/Skeleton';
import styles from './package-detail.module.css';

export default function PackageDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [pkg, setPkg] = useState<PackageDto | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [loading, setLoading] = useState(true);
  const { addPackage } = useCartStore();
  const invalidPackageId = !Number.isInteger(Number(id)) || Number(id) <= 0;

  useEffect(() => {
    const packageId = Number(id);
    if (!Number.isInteger(packageId) || packageId <= 0) return;
    packagesApi.get(packageId)
      .then(response => setPkg(response.data))
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id]);

  const addToCart = () => {
    if (!pkg) return;
    addPackage(pkg);
    toast.success(`${pkg.name} added to cart!`);
    router.push('/cart');
  };

  if (loading) {
    return (
      <div className={styles.page}>
        <div className="container">
          <Skeleton width="35%" height="1rem" style={{ marginBottom: 24 }} />
          <div className={styles.summary}>
            <Skeleton height="360px" radius="var(--radius-xl)" />
            <div><Skeleton width="70%" height="2rem" /><Skeleton width="90%" height="1rem" style={{ marginTop: 18 }} /><Skeleton width="45%" height="2rem" style={{ marginTop: 28 }} /></div>
          </div>
        </div>
      </div>
    );
  }

  if (invalidPackageId || notFound || !pkg) {
    return (
      <div className={styles.page}>
        <div className="container">
          <div className={styles.empty}>
            <PackageIcon size={48} />
            <h1>Package not found</h1>
            <p>This package may have been removed or is no longer available.</p>
            <Link href="/packages" className="btn btn-primary">Browse packages</Link>
          </div>
        </div>
      </div>
    );
  }

  const items = aggregatePackageItems(pkg.items);
  const savings = pkg.regularPrice - pkg.packagePrice;
  const savingsPercent = pkg.regularPrice > 0 ? Math.round((savings / pkg.regularPrice) * 100) : 0;

  return (
    <main className={styles.page}>
      <div className="container">
        <nav className={styles.breadcrumb} aria-label="Breadcrumb">
          <Link href="/">Home</Link><ChevronRight size={14} />
          <Link href="/packages">Packages</Link><ChevronRight size={14} />
          <span>{pkg.name}</span>
        </nav>

        <section className={styles.summary}>
          <div className={styles.imageWrap}>
            {pkg.imageUrl ? (
              <Image src={getImageUrl(pkg.imageUrl)!} alt={pkg.name} fill priority sizes="(max-width: 768px) 100vw, 50vw" className={styles.image} />
            ) : (
              <div className={styles.imagePlaceholder}><PackageIcon size={64} /></div>
            )}
            {savings > 0 && <span className={styles.savingsBadge}>Save {savingsPercent}%</span>}
          </div>

          <div className={styles.info}>
            <span className="section-label"><PackageIcon size={14} /> Ready-Made Package</span>
            <h1>{pkg.name}</h1>
            {pkg.description && <p className={styles.description}>{pkg.description}</p>}
            <div className={styles.pricing}>
              <strong>৳{pkg.packagePrice.toLocaleString()}</strong>
              {pkg.regularPrice > pkg.packagePrice && <del>৳{pkg.regularPrice.toLocaleString()}</del>}
            </div>
            <p className={styles.includedSummary}><Check size={16} /> Includes {items.length} product{items.length === 1 ? '' : 's'} ({items.reduce((sum, item) => sum + item.quantity, 0)} units)</p>
            <button type="button" className="btn btn-primary btn-lg" onClick={addToCart}>
              <ShoppingCart size={18} /> Add Package to Cart
            </button>
            <Link href="/packages" className={styles.backLink}><ArrowLeft size={15} /> Back to packages</Link>
          </div>
        </section>

        <section className={styles.contents}>
          <div className={styles.sectionHeading}>
            <span className="section-label"><Zap size={14} /> Package contents</span>
            <h2>Included Products</h2>
            <p className="text-muted">Review each product and quantity included in this package.</p>
          </div>
          {items.length === 0 ? (
            <p className={styles.noItems}>This package has no listed products.</p>
          ) : (
            <div className={styles.itemsGrid}>
              {items.map(item => (
                <article className={styles.itemCard} key={`${pkg.id}-${item.productId}`}>
                  <div className={styles.itemImageWrap}>
                    {item.imageUrl ? (
                      <Image src={getImageUrl(item.imageUrl)!} alt={item.productName} fill sizes="(max-width: 640px) 45vw, 220px" className={styles.itemImage} />
                    ) : (
                      <div className={styles.itemImagePlaceholder}><PackageIcon size={36} /></div>
                    )}
                    <span className={styles.quantityBadge}>×{item.quantity}</span>
                  </div>
                  <div className={styles.itemInfo}>
                    <h3>{item.productName}</h3>
                    <p>৳{item.unitPrice.toLocaleString()} each</p>
                    <strong>Line total: ৳{(item.unitPrice * item.quantity).toLocaleString()}</strong>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
