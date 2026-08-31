'use client';
import { useState, useEffect } from 'react';
import { use } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShoppingCart, Heart, Star, ChevronRight, Minus, Plus, Zap, Shield, Truck, RefreshCw, Check, AlertOctagon, ArrowRight, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { useCartStore } from '@/store/useCartStore';
import { ProductDto, ProductListDto, productsApi } from '@/lib/api';
import ProductCard from '@/components/products/ProductCard';
import { Skeleton } from '@/components/ui/Skeleton';
import { getImageUrl } from '@/lib/imageUrl';
import toast from 'react-hot-toast';
import styles from './detail.module.css';

const mockRelated: ProductListDto[] = Array.from({ length: 4 }).map((_, i) => ({
  id: i + 10, name: ['Dahua 4MP Bullet Cam', 'Hikvision 2MP Turret', 'Uniview 4MP Dome', 'Imou Cruiser SE'][i],
  slug: `related-${i + 1}`, price: [9500, 7800, 11000, 13500][i],
  discountPrice: i === 1 ? 6630 : undefined, primaryImageUrl: undefined,
  stock: 15, isFeatured: i < 2,
  categoryName: 'IP Camera', brandName: ['Dahua', 'Hikvision', 'Uniview', 'Imou'][i],
}));

export default function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const [product, setProduct] = useState<ProductDto | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [selectedImageIdx, setSelectedImageIdx] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'description' | 'specs' | 'reviews'>('description');
  const [wishlisted, setWishlisted] = useState(false);
  const { addItem } = useCartStore();

  useEffect(() => {
    productsApi.getBySlug(resolvedParams.slug).then(res => {
      setProduct(res.data);
    }).catch(() => setNotFound(true));
  }, [resolvedParams.slug]);

  const discount = product?.discountPrice
    ? Math.round((1 - product.discountPrice / product.price) * 100)
    : null;
  const effectivePrice = product ? (product.discountPrice ?? product.price) : 0;
  const isOutOfStock = product ? product.stock === 0 : false;
  const mainImageUrl = product?.images[selectedImageIdx]?.imageUrl ?? product?.primaryImageUrl;

  const handleAddToCart = () => {
    if (!product || isOutOfStock) return;
    const listDto: ProductListDto = {
      id: product.id, name: product.name, slug: product.slug,
      price: product.price, discountPrice: product.discountPrice,
      primaryImageUrl: product.primaryImageUrl, stock: product.stock,
      isFeatured: product.isFeatured, categoryName: product.categoryName,
      brandName: product.brandName,
    };
    for (let i = 0; i < quantity; i++) addItem(listDto);
    toast.success(`${product.name} (x${quantity}) added to cart!`);
  };

  const handleOrderNow = () => {
    if (!product || isOutOfStock) return;
    const listDto: ProductListDto = {
      id: product.id, name: product.name, slug: product.slug,
      price: product.price, discountPrice: product.discountPrice,
      primaryImageUrl: product.primaryImageUrl, stock: product.stock,
      isFeatured: product.isFeatured, categoryName: product.categoryName,
      brandName: product.brandName,
    };
    for (let i = 0; i < quantity; i++) addItem(listDto);
    router.push('/checkout');
  };

  if (notFound) {
    return (
      <div className={styles.detailPage}>
        <div className="container" style={{ padding: '80px 0', textAlign: 'center' }}>
          <h2>Product not found</h2>
          <p className="text-muted">This product may have been removed or is no longer available.</p>
          <Link href="/products" className="btn btn-primary" style={{ marginTop: 16 }}>Back to Products</Link>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className={styles.detailPage}>
        <div className="container">
          <Skeleton width="40%" height="1rem" style={{ marginBottom: 24 }} />
          <div className={styles.productSection}>
            <div className={styles.gallery}>
              <Skeleton height="420px" radius="var(--radius-lg)" />
            </div>
            <div className={styles.info}>
              <Skeleton width="30%" height="1.4rem" style={{ marginBottom: 16 }} />
              <Skeleton width="80%" height="1.8rem" style={{ marginBottom: 16 }} />
              <Skeleton width="50%" height="1rem" style={{ marginBottom: 20 }} />
              <Skeleton width="40%" height="2.2rem" style={{ marginBottom: 20 }} />
              <Skeleton width="100%" height="46px" radius="var(--radius-md)" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.detailPage}>
      <div className="container">
        {/* Breadcrumb */}
        <nav className={styles.breadcrumb}>
          <Link href="/">Home</Link>
          <ChevronRight size={12} />
          <Link href="/products">Products</Link>
          <ChevronRight size={12} />
          <Link href={`/products?category=${product.categorySlug}`}>{product.categoryName}</Link>
          <ChevronRight size={12} />
          <span>{product.name}</span>
        </nav>

        {/* Product Section */}
        <div className={styles.productSection}>
          {/* Gallery */}
          <motion.div className={styles.gallery} initial={{ opacity: 0, x: -24 }} animate={{ opacity: 1, x: 0 }}>
            <div className={styles.mainImage}>
              {mainImageUrl ? (
                <Image src={getImageUrl(mainImageUrl)!} alt={product.name} fill sizes="(max-width: 768px) 100vw, 50vw" style={{ objectFit: 'cover' }} />
              ) : (
                <div className={styles.imagePlaceholder}>
                  <Zap size={64} />
                  <span>Product Image</span>
                </div>
              )}
              {isOutOfStock && (
                <div className={styles.outOfStockOverlay}>
                  <AlertOctagon size={36} />
                  <div>Out of Stock</div>
                  <span>Currently Unavailable</span>
                </div>
              )}
              {discount && <span className={`badge badge-success ${styles.discountBadge}`}>-{discount}%</span>}
            </div>
            {product.images.length > 0 && (
              <div className={styles.thumbnails}>
                {product.images.map((img, i) => (
                  <button key={img.id} className={`${styles.thumbnail} ${i === selectedImageIdx ? styles.thumbActive : ''}`}
                    onClick={() => setSelectedImageIdx(i)}>
                    <Image src={getImageUrl(img.imageUrl)!} alt="" fill sizes="70px" style={{ objectFit: 'cover' }} />
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          {/* Info */}
          <motion.div className={styles.info} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
            <div className={styles.metaRow}>
              <Link href={`/products?brand=${product.brandSlug}`} className="badge badge-primary">{product.brandName}</Link>
              <Link href={`/products?category=${product.categorySlug}`} className={styles.categoryLink}>{product.categoryName}</Link>
            </div>

            <h1 className={styles.productName}>{product.name}</h1>

            {/* Rating */}
            <div className={styles.ratingRow}>
              <div className="stars">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={16} fill={i < Math.round(product.averageRating) ? 'currentColor' : 'none'}
                    className={i < Math.round(product.averageRating) ? 'star' : 'star-empty'} />
                ))}
              </div>
              <span className={styles.ratingText}>{product.averageRating} ({product.reviewCount} reviews)</span>
            </div>

            {product.shortDescription && <p className={styles.shortDesc}>{product.shortDescription}</p>}

            {/* Pricing */}
            <div className={styles.priceSection}>
              <span className={styles.currentPrice}>৳{effectivePrice.toLocaleString()}</span>
              {product.discountPrice && (
                <>
                  <span className={styles.originalPrice}>৳{product.price.toLocaleString()}</span>
                  <span className={styles.saveBadge}>Save ৳{(product.price - product.discountPrice).toLocaleString()}</span>
                </>
              )}
            </div>

            {/* Stock Availability */}
            <div className={styles.stockRow}>
              {product.stock > 0 ? (
                <span className={styles.inStock}><Check size={14} /> In Stock ({product.stock} units available)</span>
              ) : (
                <span className={styles.outOfStock}>● Out of Stock / Unavailable</span>
              )}
              {product.sku && <span className={styles.sku}>SKU: {product.sku}</span>}
            </div>

            {/* Delivery & Compliance Notice */}
            <div className={styles.deliveryNotice}>
              <div><Truck size={14} style={{ display: 'inline', marginRight: 4 }} /> <strong>Delivery Time:</strong> Inside Dhaka (5 Days) | Outside Dhaka (10 Days)</div>
              <div><RefreshCw size={14} style={{ display: 'inline', marginRight: 4 }} /> <strong>Return Policy:</strong> 7 to 10 working days return guarantee</div>
            </div>

            <div className="divider" />

            {/* Quantity + Add to Cart + Order Now */}
            <div className={styles.actions}>
              <div className={styles.quantityControl}>
                <button onClick={() => setQuantity(q => Math.max(1, q - 1))} disabled={isOutOfStock}><Minus size={16} /></button>
                <span>{quantity}</span>
                <button onClick={() => setQuantity(q => Math.min(product.stock, q + 1))} disabled={isOutOfStock}><Plus size={16} /></button>
              </div>

              <div className={styles.btnGroup}>
                <button className="btn btn-secondary btn-lg" style={{ flex: 1 }} onClick={handleAddToCart} disabled={isOutOfStock}>
                  <ShoppingCart size={18} /> Add to Cart
                </button>
                <button className={styles.orderNowBtn} onClick={handleOrderNow} disabled={isOutOfStock}>
                  Order Now <ArrowRight size={18} />
                </button>
              </div>

              <button className={`${styles.wishBtn} ${wishlisted ? styles.wishlisted : ''}`} onClick={() => setWishlisted(!wishlisted)}>
                <Heart size={20} fill="none" stroke="currentColor" strokeWidth={2} />
              </button>
            </div>

            {/* Trust Badges */}
            <div className={styles.trustBadges}>
              <div className={styles.trustBadge}><Truck size={16} /> Fast Delivery</div>
              <div className={styles.trustBadge}><Shield size={16} /> Official Warranty</div>
              <div className={styles.trustBadge}><RefreshCw size={16} /> 7-10 Days Return</div>
            </div>
          </motion.div>
        </div>

        {/* Tabs */}
        <div className={styles.tabs}>
          <div className={styles.tabHeaders}>
            {(['description', 'specs', 'reviews'] as const).map(tab => (
              <button key={tab} className={`${styles.tab} ${activeTab === tab ? styles.tabActive : ''}`}
                onClick={() => setActiveTab(tab)}>
                {tab === 'description' ? 'Description' : tab === 'specs' ? 'Specifications' : `Reviews (${product.reviewCount})`}
              </button>
            ))}
          </div>
          <div className={styles.tabContent}>
            {activeTab === 'description' && (
              <div className={styles.description}>
                <p>{product.description}</p>
              </div>
            )}
            {activeTab === 'specs' && (
              <div className={styles.specsTable}>
                {product.specifications.map(spec => (
                  <div key={spec.id} className={styles.specRow}>
                    <span className={styles.specKey}>{spec.key}</span>
                    <span className={styles.specVal}>{spec.value}</span>
                  </div>
                ))}
              </div>
            )}
            {activeTab === 'reviews' && (
              <div className={styles.reviews}>
                <p className="text-muted">Reviews will be available soon.</p>
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        <section style={{ marginTop: 64 }}>
          <div className="section-header">
            <div>
              <span className="section-label">You May Also Like</span>
              <h2>Related Products</h2>
            </div>
          </div>
          <div className="grid-4">
            {mockRelated.map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
