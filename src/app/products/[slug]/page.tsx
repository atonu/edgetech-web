'use client';
import { useState, useEffect } from 'react';
import { use } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ShoppingCart, Heart, Star, ChevronRight, Minus, Plus, Zap, Shield, Truck, RefreshCw, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { useCartStore } from '@/store/useCartStore';
import { ProductDto, ProductListDto, productsApi } from '@/lib/api';
import ProductCard from '@/components/products/ProductCard';
import toast from 'react-hot-toast';
import styles from './detail.module.css';

// Mock product
const createMockProduct = (slug: string): ProductDto => ({
  id: 1, name: 'Hikvision DS-2CD1143G2-I 4MP IR Fixed Dome Network Camera',
  slug, description: 'The Hikvision DS-2CD1143G2-I is a 4MP IR Fixed Dome Network Camera featuring advanced H.265+ compression, built-in IR LEDs up to 30m, water and dust resistant (IP67), and PoE support. Ideal for indoor/outdoor surveillance in retail, office, and residential settings.',
  shortDescription: '4MP IR Fixed Dome Network Camera with H.265+, PoE, and IP67 rating',
  price: 12500, discountPrice: 10625, sku: 'HK-DS2CD1143G2I',
  primaryImageUrl: undefined, stock: 25, isFeatured: true, isActive: true,
  categoryId: 1, categoryName: 'IP Camera', categorySlug: 'ip-camera',
  brandId: 1, brandName: 'Hikvision', brandSlug: 'hikvision',
  averageRating: 4.5, reviewCount: 23, createdAt: new Date().toISOString(),
  images: [],
  specifications: [
    { id: 1, key: 'Resolution', value: '4MP (2560×1440)', displayOrder: 1 },
    { id: 2, key: 'Lens', value: '2.8mm Fixed', displayOrder: 2 },
    { id: 3, key: 'IR Range', value: 'Up to 30m', displayOrder: 3 },
    { id: 4, key: 'Compression', value: 'H.265+/H.265/H.264+/H.264', displayOrder: 4 },
    { id: 5, key: 'Protection', value: 'IP67, IK10', displayOrder: 5 },
    { id: 6, key: 'Power', value: 'PoE (802.3af) / 12V DC', displayOrder: 6 },
    { id: 7, key: 'WDR', value: '120dB True WDR', displayOrder: 7 },
    { id: 8, key: 'Storage', value: 'microSD up to 256GB', displayOrder: 8 },
  ],
});

const mockRelated: ProductListDto[] = Array.from({ length: 4 }).map((_, i) => ({
  id: i + 10, name: ['Dahua 4MP Bullet Cam', 'Hikvision 2MP Turret', 'Uniview 4MP Dome', 'Imou Cruiser SE'][i],
  slug: `related-${i + 1}`, price: [9500, 7800, 11000, 13500][i],
  discountPrice: i === 1 ? 6630 : undefined, primaryImageUrl: undefined,
  stock: 15, isFeatured: i < 2,
  categoryName: 'IP Camera', brandName: ['Dahua', 'Hikvision', 'Uniview', 'Imou'][i],
}));

export default function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params);
  const [product, setProduct] = useState<ProductDto>(createMockProduct(resolvedParams.slug));
  const [selectedImageIdx, setSelectedImageIdx] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'description' | 'specs' | 'reviews'>('description');
  const [wishlisted, setWishlisted] = useState(false);
  const { addItem } = useCartStore();

  useEffect(() => {
    productsApi.getBySlug(resolvedParams.slug).then(res => {
      if (res.data) setProduct(res.data);
    }).catch(() => {});
  }, [resolvedParams.slug]);

  const discount = product.discountPrice
    ? Math.round((1 - product.discountPrice / product.price) * 100)
    : null;
  const effectivePrice = product.discountPrice ?? product.price;

  const handleAddToCart = () => {
    const listDto: ProductListDto = {
      id: product.id, name: product.name, slug: product.slug,
      price: product.price, discountPrice: product.discountPrice,
      primaryImageUrl: product.primaryImageUrl, stock: product.stock,
      isFeatured: product.isFeatured, categoryName: product.categoryName,
      brandName: product.brandName,
    };
    for (let i = 0; i < quantity; i++) addItem(listDto);
    toast.success(`${product.name} added to cart!`);
  };

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
              {product.primaryImageUrl ? (
                <Image src={product.primaryImageUrl} alt={product.name} fill style={{ objectFit: 'contain' }} />
              ) : (
                <div className={styles.imagePlaceholder}>
                  <Zap size={64} />
                  <span>Product Image</span>
                </div>
              )}
              {discount && <span className={`badge badge-success ${styles.discountBadge}`}>-{discount}%</span>}
            </div>
            {product.images.length > 0 && (
              <div className={styles.thumbnails}>
                {product.images.map((img, i) => (
                  <button key={img.id} className={`${styles.thumbnail} ${i === selectedImageIdx ? styles.thumbActive : ''}`}
                    onClick={() => setSelectedImageIdx(i)}>
                    <Image src={img.imageUrl} alt="" fill style={{ objectFit: 'cover' }} />
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

            {/* Stock */}
            <div className={styles.stockRow}>
              {product.stock > 0 ? (
                <span className={styles.inStock}><Check size={14} /> In Stock ({product.stock} available)</span>
              ) : (
                <span className={styles.outOfStock}>Out of Stock</span>
              )}
              {product.sku && <span className={styles.sku}>SKU: {product.sku}</span>}
            </div>

            <div className="divider" />

            {/* Quantity + Add to Cart */}
            <div className={styles.actions}>
              <div className={styles.quantityControl}>
                <button onClick={() => setQuantity(q => Math.max(1, q - 1))}><Minus size={16} /></button>
                <span>{quantity}</span>
                <button onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}><Plus size={16} /></button>
              </div>
              <button className="btn btn-primary btn-lg" style={{ flex: 1 }} onClick={handleAddToCart} disabled={product.stock === 0}>
                <ShoppingCart size={18} /> Add to Cart — ৳{(effectivePrice * quantity).toLocaleString()}
              </button>
              <button className={`${styles.wishBtn} ${wishlisted ? styles.wishlisted : ''}`} onClick={() => setWishlisted(!wishlisted)}>
                <Heart size={20} fill={wishlisted ? 'currentColor' : 'none'} />
              </button>
            </div>

            {/* Trust Badges */}
            <div className={styles.trustBadges}>
              <div className={styles.trustBadge}><Truck size={16} /> Free Delivery</div>
              <div className={styles.trustBadge}><Shield size={16} /> Warranty</div>
              <div className={styles.trustBadge}><RefreshCw size={16} /> Easy Returns</div>
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
