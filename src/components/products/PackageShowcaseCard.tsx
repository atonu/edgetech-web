'use client';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ShoppingCart, Zap, Package as PackageIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { PackageDto } from '@/lib/api';
import { getImageUrl } from '@/lib/imageUrl';
import { useCartStore } from '@/store/useCartStore';
import styles from './PackageShowcaseCard.module.css';

interface Props { pkg: PackageDto; index?: number; maxItems?: number; }

// Large "detail" card for the storefront CCTV Packages showcase and the /packages listing.
export default function PackageShowcaseCard({ pkg, index = 0, maxItems = 4 }: Props) {
  const router = useRouter();
  const { addPackage } = useCartStore();

  const savings = pkg.regularPrice - pkg.packagePrice;
  const savingsPct = pkg.regularPrice > 0 ? Math.round((savings / pkg.regularPrice) * 100) : 0;
  const shownItems = pkg.items.slice(0, maxItems);
  const remaining = pkg.items.length - shownItems.length;

  const handleAdd = () => {
    addPackage(pkg);
    toast.success(`${pkg.name} added to cart!`);
    router.push('/cart');
  };

  return (
    <motion.div className={styles.card}
      initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
      transition={{ duration: 0.25, delay: index * 0.05 }}>
      <div className={styles.imageWrap}>
        {pkg.imageUrl ? (
          <Image src={getImageUrl(pkg.imageUrl)!} alt={pkg.name} fill sizes="(max-width: 640px) 100vw, 33vw" className={styles.image} />
        ) : (
          <div className={styles.imagePlaceholder}><PackageIcon size={48} /></div>
        )}
        <span className={styles.packageTag}><PackageIcon size={12} /> Package</span>
        {savings > 0 && <span className={styles.saveBadge}>Save {savingsPct}%</span>}
      </div>

      <div className={styles.body}>
        <span className={styles.title}>{pkg.name}</span>
        {pkg.description && <p className={styles.description}>{pkg.description}</p>}

        <div className={styles.items}>
          {shownItems.map((item, i) => (
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
          {remaining > 0 && <span className={styles.moreItems}>+{remaining} more item{remaining === 1 ? '' : 's'}</span>}
        </div>

        <div className={styles.priceRow}>
          <span className={styles.packagePrice}>৳{pkg.packagePrice.toLocaleString()}</span>
          {savings > 0 && <span className={styles.regularPrice}>৳{pkg.regularPrice.toLocaleString()}</span>}
        </div>

        <div className={styles.footer}>
          <button className="btn btn-primary btn-lg w-full" style={{ justifyContent: 'center' }} onClick={handleAdd}>
            <ShoppingCart size={18} /> Add Package to Cart
          </button>
        </div>
      </div>
    </motion.div>
  );
}
