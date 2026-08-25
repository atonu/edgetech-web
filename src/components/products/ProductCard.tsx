'use client';
import Image from 'next/image';
import Link from 'next/link';
import { ShoppingCart, Star, Heart, Zap } from 'lucide-react';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useCartStore } from '@/store/useCartStore';
import { ProductListDto } from '@/lib/api';
import toast from 'react-hot-toast';
import { getImageUrl } from '@/lib/imageUrl';
import styles from './ProductCard.module.css';

interface Props { product: ProductListDto; index?: number; }

export default function ProductCard({ product, index = 0 }: Props) {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [wishlisted, setWishlisted] = useState(false);
  const { addItem } = useCartStore();

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: y * 12, y: -x * 12 });
  };
  const handleMouseLeave = () => setTilt({ x: 0, y: 0 });

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addItem(product);
    toast.success(`${product.name} added to cart!`);
  };

  const discount = product.discountPrice
    ? Math.round((1 - product.discountPrice / product.price) * 100)
    : null;

  const effectivePrice = product.discountPrice ?? product.price;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.06 }}
    >
      <Link href={`/products/${product.slug}`}>
        <div
          className={styles.card}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          style={{ transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)` }}
        >
          {/* Image */}
          <div className={styles.imageWrap}>
            {product.primaryImageUrl ? (
              <Image
                src={getImageUrl(product.primaryImageUrl)!}
                alt={product.name}
                fill
                style={{ objectFit: 'cover' }}
                className={styles.image}
              />
            ) : (
              <div className={styles.imagePlaceholder}>
                <Zap size={40} />
              </div>
            )}

            {/* Badges */}
            <div className={styles.badges}>
              {product.isFeatured && <span className="badge badge-primary">Featured</span>}
              {discount && <span className="badge badge-success">-{discount}%</span>}
              {product.stock === 0 && <span className="badge badge-error">Out of Stock</span>}
            </div>

            {/* Wishlist */}
            <button
              className={`${styles.wishlistBtn} ${wishlisted ? styles.wishlisted : ''}`}
              onClick={(e) => { e.preventDefault(); setWishlisted(!wishlisted); }}
            >
              <Heart size={16} fill="none" stroke="currentColor" strokeWidth={2} />
            </button>

            {/* Quick Add */}
            <button
              className={styles.addToCartBtn}
              onClick={handleAddToCart}
              disabled={product.stock === 0}
            >
              <ShoppingCart size={15} />
              Add to Cart
            </button>
          </div>

          {/* Info */}
          <div className={styles.info}>
            <div className={styles.meta}>
              <span className={styles.brand}>{product.brandName}</span>
              <span className={styles.category}>{product.categoryName}</span>
            </div>

            <h3 className={styles.name}>{product.name}</h3>

            <div className={styles.stars}>
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} size={12} className={i < 4 ? styles.starFilled : styles.starEmpty} fill={i < 4 ? 'currentColor' : 'none'} />
              ))}
            </div>

            <div className={styles.pricing}>
              <span className={styles.price}>৳{effectivePrice.toLocaleString()}</span>
              {product.discountPrice && (
                <span className={styles.original}>৳{product.price.toLocaleString()}</span>
              )}
            </div>
          </div>

          {/* Glow border on hover */}
          <div className={styles.glowBorder} />
        </div>
      </Link>
    </motion.div>
  );
}
