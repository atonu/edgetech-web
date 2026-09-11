'use client';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShoppingCart, Star, Heart, Check, ArrowRight, Package as PackageIcon } from 'lucide-react';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useCartStore } from '@/store/useCartStore';
import { PackageDto } from '@/lib/api';
import toast from 'react-hot-toast';
import { getImageUrl } from '@/lib/imageUrl';
import styles from './ProductCard.module.css';

interface Props { pkg: PackageDto; index?: number; }

// Renders an admin package using the exact same visual card as a product, so featured packages
// can sit in the storefront "Best Selling" row indistinguishably from products.
export default function PackageProductCard({ pkg, index = 0 }: Props) {
  const router = useRouter();
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [wishlisted, setWishlisted] = useState(false);
  const { addPackage } = useCartStore();

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: y * 12, y: -x * 12 });
  };
  const handleMouseLeave = () => setTilt({ x: 0, y: 0 });

  // Add to cart → drop the bundle in and take the customer straight to the cart.
  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addPackage(pkg);
    toast.success(`${pkg.name} added to cart!`);
    router.push('/cart');
  };

  const handleOrderNow = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addPackage(pkg);
    router.push('/checkout');
  };

  const discount = pkg.regularPrice > pkg.packagePrice
    ? Math.round((1 - pkg.packagePrice / pkg.regularPrice) * 100)
    : null;

  const itemCount = pkg.items.length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.06 }}
    >
      <Link href="/packages">
        <div
          className={styles.card}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          style={{ transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)` }}
        >
          {/* Image */}
          <div className={styles.imageWrap}>
            {pkg.imageUrl ? (
              <Image
                src={getImageUrl(pkg.imageUrl)!}
                alt={pkg.name}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                style={{ objectFit: 'cover' }}
                className={styles.image}
              />
            ) : (
              <div className={styles.imagePlaceholder}>
                <PackageIcon size={40} />
              </div>
            )}

            {/* Badges */}
            <div className={styles.badges}>
              <span className="badge badge-primary">Package</span>
              {discount && <span className="badge badge-success">-{discount}%</span>}
            </div>

            {/* Wishlist */}
            <button
              className={`${styles.wishlistBtn} ${wishlisted ? styles.wishlisted : ''}`}
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); setWishlisted(!wishlisted); }}
              aria-label="Add to Wishlist"
            >
              <Heart size={16} fill="none" stroke="currentColor" strokeWidth={2} />
            </button>

            {/* Quick Actions */}
            <div className={styles.cardActions}>
              <button className={`${styles.actionBtn} ${styles.addToCartBtn}`} onClick={handleAddToCart}>
                <ShoppingCart size={13} />
                Add to Cart
              </button>
              <button className={`${styles.actionBtn} ${styles.orderNowBtn}`} onClick={handleOrderNow}>
                Order Now
                <ArrowRight size={13} />
              </button>
            </div>
          </div>

          {/* Info */}
          <div className={styles.info}>
            <div className={styles.meta}>
              <span className={styles.brand}>EdgeTech Package</span>
              <span className={styles.category}>{itemCount} item{itemCount === 1 ? '' : 's'}</span>
            </div>

            <h3 className={styles.name}>{pkg.name}</h3>

            <div className={styles.stars}>
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} size={12} className={i < 4 ? styles.starFilled : styles.starEmpty} fill={i < 4 ? 'currentColor' : 'none'} />
              ))}
            </div>

            <div className={styles.pricing}>
              <span className={styles.price}>৳{pkg.packagePrice.toLocaleString()}</span>
              {pkg.regularPrice > pkg.packagePrice && (
                <span className={styles.original}>৳{pkg.regularPrice.toLocaleString()}</span>
              )}
            </div>

            <div className={styles.stockStatus}>
              <span className={styles.inStockText}><Check size={12} /> Complete bundle · ready to ship</span>
            </div>
          </div>

          {/* Glow border on hover */}
          <div className={styles.glowBorder} />
        </div>
      </Link>
    </motion.div>
  );
}
