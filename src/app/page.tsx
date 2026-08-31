'use client';
import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, Shield, Wifi, Monitor, HardDrive, Camera, Package, ArrowRight, Zap, Star, Clock } from 'lucide-react';
import ProductCard from '@/components/products/ProductCard';
import ProductCardSkeleton from '@/components/products/ProductCardSkeleton';
import { HomeGroupsResponse, ProductListDto, productGroupsApi, productsApi } from '@/lib/api';
import styles from './page.module.css';

const heroSlides = [
  {
    title: 'Secure Your World\nWith Smart Surveillance',
    subtitle: 'Professional-grade CCTV systems trusted by thousands across Bangladesh',
    cta: 'Shop CCTV Cameras',
    ctaLink: '/products?category=analog-cameras',
    image: '/1.png',
  },
  {
    title: 'Build Your Custom\nSolution',
    subtitle: 'Configure your perfect surveillance and IT setup with our interactive solution builder',
    cta: 'Build Your Solution',
    ctaLink: '/package-builder',
    image: '/2.png',
  },
  {
    title: 'Enterprise Networking\nSolutions',
    subtitle: 'Switches, routers, and complete networking infrastructure for any scale',
    cta: 'Explore Networking',
    ctaLink: '/products?category=networking',
    image: '/3.png',
  },
  {
    title: 'Complete Office\nInfrastructure Stack',
    subtitle: 'Servers, network switches, storage, and deployment-ready enterprise equipment',
    cta: 'Shop Infrastructure',
    ctaLink: '/products?category=storage',
    image: '/4.png',
  },
];

const heroSlideVariants = {
  enter: (direction: number) => ({ x: `${direction * 100}%` }),
  center: { x: '0%' },
  exit: (direction: number) => ({ x: `${direction * -100}%` }),
};

const categories = [
  { name: 'IP Camera', slug: 'ip-cameras', icon: Camera, color: '#00c8e0', image: '/categories/ip-camera.jpg' },
  { name: 'CC Camera', slug: 'analog-cameras', icon: Shield, color: '#f5a623', image: '/categories/cc-camera.jpg' },
  { name: 'NVR / DVR', slug: 'dvr-nvr', icon: HardDrive, color: '#22c55e', image: '/categories/nvr-dvr.jpg' },
  { name: 'Networking', slug: 'networking', icon: Wifi, color: '#3b82f6', image: '/categories/networking.jpg' },
  { name: 'Monitor', slug: 'monitor', icon: Monitor, color: '#a855f7', image: '/categories/monitor.jpg' },
  { name: 'Accessories', slug: 'accessories', icon: Package, color: '#ef4444', image: '/categories/accessories.jpg' },
];

const brands = [
  { name: 'Hikvision', slug: 'hikvision', logo: '/brand/hikvision.jpg' },
  { name: 'Dahua', slug: 'dahua', logo: '/brand/dahua.jpg' },
  { name: 'TP-Link', slug: 'tp-link', logo: '/brand/tp-link.png' },
  { name: 'Imou', slug: 'imou', logo: '/brand/imou.png' },
  { name: 'ZKTeco', slug: 'zkteco', logo: '/brand/zkteco.png' },
  { name: 'Ruijie', slug: 'ruijie', logo: '/brand/ruijie.png' },
  { name: 'Seagate', slug: 'seagate', logo: '/brand/seagate.png' },
  { name: 'Dell', slug: 'dell', logo: '/brand/dell.png' },
];

export default function HomePage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [slideDirection, setSlideDirection] = useState(1);
  const [products, setProducts] = useState<ProductListDto[]>([]);
  const [homeGroups, setHomeGroups] = useState<HomeGroupsResponse | null>(null);
  const [productsLoading, setProductsLoading] = useState(true);
  const [countdown, setCountdown] = useState({ hours: 23, minutes: 45, seconds: 12 });

  // Auto-advance hero carousel
  useEffect(() => {
    const timer = setInterval(() => {
      setSlideDirection(1);
      setCurrentSlide(prev => (prev + 1) % heroSlides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        let { hours, minutes, seconds } = prev;
        seconds--;
        if (seconds < 0) { seconds = 59; minutes--; }
        if (minutes < 0) { minutes = 59; hours--; }
        if (hours < 0) { hours = 23; minutes = 59; seconds = 59; }
        return { hours, minutes, seconds };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    Promise.allSettled([
      productsApi.getFeatured(12),
      productGroupsApi.getHome(),
    ]).then(([featuredResult, groupsResult]) => {
      if (featuredResult.status === 'fulfilled') setProducts(featuredResult.value.data);
      if (groupsResult.status === 'fulfilled') setHomeGroups(groupsResult.value.data);
      setProductsLoading(false);
    });
  }, []);

  const nextSlide = useCallback(() => {
    setSlideDirection(1);
    setCurrentSlide(p => (p + 1) % heroSlides.length);
  }, []);

  const prevSlide = useCallback(() => {
    setSlideDirection(-1);
    setCurrentSlide(p => (p - 1 + heroSlides.length) % heroSlides.length);
  }, []);

  const fallbackFeatured = products.filter(p => p.isFeatured);
  const featuredRow1 = homeGroups?.bestSellers?.slice(0, 4) ?? fallbackFeatured.slice(0, 4);
  const featuredRow2 = homeGroups?.mostPopular?.slice(0, 4) ?? fallbackFeatured.slice(4, 8);
  const hotDealProducts = (featuredRow2.length >= 2 ? featuredRow2 : products).slice(0, 2);
  const newArrivals = homeGroups?.newArrivals?.slice(0, 6) ?? products.slice(0, 6);

  return (
    <div className={styles.home}>
      {/* ===== HERO SECTION ===== */}
      <section className={styles.hero}>
        <div className={styles.heroBackground}>
          <div className={styles.heroGrid} />
          <div className={styles.heroOrb1} />
          <div className={styles.heroOrb2} />
        </div>

        <div className={`container ${styles.heroContent}`}>
          <div className={styles.heroMain}>
            <div className={styles.heroBanner}>
              <AnimatePresence initial={false} custom={slideDirection}>
                <motion.div
                  key={`slide-${currentSlide}`}
                  className={styles.heroSlide}
                  custom={slideDirection}
                  variants={heroSlideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.6, ease: 'easeInOut' }}
                >
                  <Image
                    src={heroSlides[currentSlide].image}
                    alt={`Hero slide ${currentSlide + 1}`}
                    fill
                    priority={currentSlide === 0}
                    sizes="(max-width: 900px) 100vw, 70vw"
                    className={styles.heroSlideImage}
                  />
                  <div className={styles.heroImageMask} />

                  <div className={styles.heroSlideContent}>
                    <div className={styles.heroText}>
                      <h1 className={styles.heroTitle}>
                        {heroSlides[currentSlide].title.split('\n').map((line, i) => (
                          <span key={i}>
                            {i === 1 ? <span className="gradient-text">{line}</span> : line}
                            {i === 0 && <br />}
                          </span>
                        ))}
                      </h1>
                      {/* <p className={styles.heroSubtitle}>{heroSlides[currentSlide].subtitle}</p> */}
                      <div className={styles.heroCtas}>
                        <Link href={heroSlides[currentSlide].ctaLink} className="btn btn-outline btn-lg">
                          {heroSlides[currentSlide].cta} <ArrowRight size={18} />
                        </Link>
                        <Link href="/products" className="btn btn-primary  btn-lg">
                          Browse All Products
                        </Link>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Hero Nav */}
              <div className={styles.heroNav}>
                <button className={styles.heroArrow} onClick={prevSlide}><ChevronLeft size={20} /></button>
                <div className={styles.heroDots}>
                  {heroSlides.map((_, i) => (
                    <button
                      key={i}
                      className={`${styles.heroDot} ${i === currentSlide ? styles.heroDotActive : ''}`}
                      onClick={() => {
                        if (i === currentSlide) return;
                        setSlideDirection(i > currentSlide ? 1 : -1);
                        setCurrentSlide(i);
                      }}
                    />
                  ))}
                </div>
                <button className={styles.heroArrow} onClick={nextSlide}><ChevronRight size={20} /></button>
              </div>
            </div>

            <aside className={styles.hotDealsPanel}>
              <span className="section-label">Browse by Category</span>
              <h3>HOT DEAL OF THE DAY</h3>
              <br/>
            
            <div className={styles.hotDealsList}>
                {productsLoading ? (
                  Array.from({ length: 2 }).map((_, i) => (
                    <div key={`hot-skeleton-${i}`} className={styles.hotDealCardWrap}>
                      <ProductCardSkeleton />
                    </div>
                  ))
                ) : (
                  hotDealProducts.map((product, index) => (
                    <div key={`hot-${product.id}`} className={styles.hotDealCardWrap}>
                      <ProductCard product={product} index={index} />
                    </div>
                  ))
                )}
              </div>
              <Link href="/products?sale=true" className={styles.hotDealsViewAll}>
                View All <ChevronRight size={16} />
              </Link>
            </aside>
          </div>
        </div>

        {/* Stats bar */}
        <div className={styles.statsBar}>
          <div className="container">
            <div className={styles.stats}>
              <div className={styles.stat}>
                <strong>5,000+</strong>
                <span>Products Sold</span>
              </div>
              <div className={styles.stat}>
                <strong>50+</strong>
                <span>Top Brands</span>
              </div>
              <div className={styles.stat}>
                <strong>2,000+</strong>
                <span>Happy Clients</span>
              </div>
              <div className={styles.stat}>
                <strong>24/7</strong>
                <span>Support</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== CATEGORIES GRID ===== */}
      <section className={styles.section}>
        <div className="container">
          <div className="section-header">
            <div>
              <span className="section-label">Browse by Category</span>
              <h2>Find What You Need</h2>
            </div>
            <Link href="/products" className="btn btn-ghost btn-sm">
              View All <ChevronRight size={16} />
            </Link>
          </div>
          <div className={styles.categoryGrid}>
            {categories.map((cat, i) => (
              <motion.div
                key={cat.slug}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
              >
                <Link href={`/products?category=${cat.slug}`} className={styles.categoryCard}>
                  <div
                    className={styles.categoryBgImage}
                    style={{ backgroundImage: `url(${cat.image})` }}
                  />
                  <div className={styles.categoryOverlay} />
                  <div className={styles.categoryIcon} style={{ background: `${cat.color}25`, borderColor: `${cat.color}50` }}>
                    <cat.icon size={28} style={{ color: cat.color }} />
                  </div>
                  <span className={styles.categoryName}>{cat.name}</span>
                  <ChevronRight size={14} className={styles.categoryArrow} />
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FEATURED PRODUCTS ROW 1 ===== */}
      <section className={styles.section}>
        <div className="container">
          <div className="section-header">
            <div>
              <span className="section-label"><Zap size={14} /> Featured Products</span>
              <h2>Bestselling Security Solutions</h2>
            </div>
            <Link href="/products?featured=true" className="btn btn-ghost btn-sm">
              View All <ChevronRight size={16} />
            </Link>
          </div>
          <div className="grid-4">
            {productsLoading
              ? Array.from({ length: 4 }).map((_, i) => <ProductCardSkeleton key={`row1-skeleton-${i}`} />)
              : featuredRow1.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
          </div>
        </div>
      </section>

      {/* ===== HOT DEAL BANNER ===== */}
      <section className={styles.hotDeal}>
        <div className={styles.hotDealBg} />
        <div className={`container ${styles.hotDealContent}`}>
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className={styles.hotDealText}
          >
            <span className="badge badge-warning" style={{ fontSize: '0.8rem', padding: '5px 14px' }}>
              <Clock size={12} /> Limited Time Offer
            </span>
            <h2>Flash Sale — Up to <span className="gradient-text">40% OFF</span></h2>
            <p className="text-muted">Get premium Hikvision & Dahua cameras at unbeatable prices. Offer ends soon!</p>
            <div className={styles.countdownRow}>
              {[
                { val: countdown.hours, label: 'Hours' },
                { val: countdown.minutes, label: 'Mins' },
                { val: countdown.seconds, label: 'Secs' },
              ].map((t) => (
                <div key={t.label} className={styles.countdownBlock}>
                  <span className={styles.countdownNum}>{String(t.val).padStart(2, '0')}</span>
                  <span className={styles.countdownLabel}>{t.label}</span>
                </div>
              ))}
            </div>
            <Link href="/products?sale=true" className="btn btn-primary btn-lg" style={{ marginTop: 16 }}>
              Shop the Sale <ArrowRight size={18} />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ===== FEATURED PRODUCTS ROW 2 ===== */}
      <section className={styles.section}>
        <div className="container">
          <div className="section-header">
            <div>
              <span className="section-label"><Star size={14} /> Top Picks</span>
              <h2>Most Popular This Week</h2>
            </div>
          </div>
          <div className="grid-4">
            {productsLoading
              ? Array.from({ length: 4 }).map((_, i) => <ProductCardSkeleton key={`row2-skeleton-${i}`} />)
              : featuredRow2.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
          </div>
        </div>
      </section>

      {/* ===== BRAND CAROUSEL ===== */}
      <section className={styles.section}>
        <div className="container">
          <div className="section-header" style={{ justifyContent: 'center' }}>
            <div className="text-center">
              <span className="section-label" style={{ justifyContent: 'center' }}>Trusted Partners</span>
              <h2>Our Premium Brands</h2>
            </div>
          </div>
          <div className={styles.brandTrack}>
            <div className={styles.brandScroll}>
              {[...brands, ...brands].map((b, i) => (
                <Link key={`${b.slug}-${i}`} href={`/products?brand=${b.slug}`} className={styles.brandCard}>
                  <div className={styles.brandLogoWrap}>
                    <Image
                      src={b.logo}
                      alt={`${b.name} logo`}
                      fill
                      sizes="160px"
                      className={styles.brandLogo}
                    />
                  </div>
                  <span className={styles.brandName}>{b.name}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===== BUILD YOUR SOLUTION CTA ===== */}
      <section className={styles.builderCta}>
        <div className={styles.builderBg} />
        <div className={`container ${styles.builderContent}`}>
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className={styles.builderText}
          >
            <span className="badge badge-primary" style={{ fontSize: '0.85rem', padding: '6px 16px' }}>
              <Package size={14} /> Interactive Tool
            </span>
            <h2>Build Your Solution</h2>
            <p>Configure your perfect surveillance and security system. Choose cameras, DVR/NVR, storage, cables, and accessories — all in one interactive builder.</p>
            <div className={styles.builderFeatures}>
              <div className={styles.builderFeature}>
                <Shield size={16} /> Select Components
              </div>
              <div className={styles.builderFeature}>
                <Monitor size={16} /> Live Price Total
              </div>
              <div className={styles.builderFeature}>
                <Package size={16} /> One-Click Cart Add
              </div>
            </div>
            <Link href="/package-builder" className="btn btn-primary btn-lg" style={{ marginTop: 8 }}>
              Build Your Solution <ArrowRight size={18} />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ===== NEW ARRIVALS ===== */}
      <section className={styles.section}>
        <div className="container">
          <div className="section-header">
            <div>
              <span className="section-label">Just In</span>
              <h2>New Arrivals</h2>
            </div>
            <Link href="/products?sort=newest" className="btn btn-ghost btn-sm">
              View All <ChevronRight size={16} />
            </Link>
          </div>
          <div className="grid-4">
            {productsLoading
              ? Array.from({ length: 6 }).map((_, i) => <ProductCardSkeleton key={`new-skeleton-${i}`} />)
              : newArrivals.map((p, i) => <ProductCard key={`new-${p.id}`} product={p} index={i} />)}
          </div>
        </div>
      </section>
    </div>
  );
}
