'use client';
import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, Shield, Wifi, Monitor, HardDrive, Camera, Package, ArrowRight, Zap, Star, Clock } from 'lucide-react';
import ProductCard from '@/components/products/ProductCard';
import ProductCardSkeleton from '@/components/products/ProductCardSkeleton';
import PackageProductCard from '@/components/products/PackageProductCard';
import PackageShowcaseCard from '@/components/products/PackageShowcaseCard';
import { HeroCarouselDto, HomeGroupsResponse, PackageDto, ProductListDto, heroCarouselApi, packagesApi, productGroupsApi, productsApi } from '@/lib/api';
import HeroCarouselSettings from '@/components/home/HeroCarouselSettings';
import styles from './page.module.css';

// Shown until the carousel settings load (and if the API is unreachable), so the
// hero never renders empty. Admins manage the live slides from the settings modal.
const fallbackCarousel: HeroCarouselDto = {
  autoplayMs: 6000,
  slides: [
    {
      title: 'Secure Your World\nWith Smart Surveillance',
      subtitle: 'Professional-grade CCTV systems trusted by thousands across Bangladesh',
      cta: 'Shop CCTV Cameras',
      ctaLink: '/products?category=analog-cameras',
      imageUrl: '/1.png',
      order: 0,
    },
    {
      title: 'Build Your Custom\nSolution',
      subtitle: 'Configure your perfect surveillance and IT setup with our interactive solution builder',
      cta: 'Build Your Solution',
      ctaLink: '/package-builder',
      imageUrl: '/2.png',
      order: 1,
    },
    {
    title: 'Enterprise Networking\nSolutions',
    subtitle: 'Switches, routers, and complete networking infrastructure for any scale',
    cta: 'Explore Networking',
    ctaLink: '/products?category=networking',
    imageUrl: '/3.png',
      order: 2,
    },
    {
    title: 'Complete Office\nInfrastructure Stack',
    subtitle: 'Servers, network switches, storage, and deployment-ready enterprise equipment',
    cta: 'Shop Infrastructure',
    ctaLink: '/products?category=storage',
    imageUrl: '/4.png',
      order: 3,
    },
  ],
};

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
  const [carousel, setCarousel] = useState<HeroCarouselDto>(fallbackCarousel);
  const [products, setProducts] = useState<ProductListDto[]>([]);
  const [homeGroups, setHomeGroups] = useState<HomeGroupsResponse | null>(null);
  const [packages, setPackages] = useState<PackageDto[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [countdown, setCountdown] = useState({ hours: 23, minutes: 45, seconds: 12 });

  // Slide count, indicators and autoplay speed all follow the admin-managed settings.
  const heroSlides = carousel.slides;
  const slideCount = heroSlides.length;

  // Load the admin-managed carousel; the fallback stays on screen if this fails.
  useEffect(() => {
    heroCarouselApi.get()
      .then(res => {
        if (res.data?.slides?.length) setCarousel(res.data);
      })
      .catch(() => { /* keep fallback slides */ });
  }, []);

  // Auto-advance hero carousel
  useEffect(() => {
    if (slideCount < 2) return;
    const timer = setInterval(() => {
      setSlideDirection(1);
      setCurrentSlide(prev => (prev + 1) % slideCount);
    }, carousel.autoplayMs || 6000);
    return () => clearInterval(timer);
  }, [slideCount, carousel.autoplayMs]);

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
      productsApi.getFeatured(20),
      productGroupsApi.getHome(),
      packagesApi.getAll(),
    ]).then(([featuredResult, groupsResult, packagesResult]) => {
      if (featuredResult.status === 'fulfilled') setProducts(featuredResult.value.data);
      if (groupsResult.status === 'fulfilled') setHomeGroups(groupsResult.value.data);
      if (packagesResult.status === 'fulfilled') setPackages(packagesResult.value.data ?? []);
      setProductsLoading(false);
    });
  }, []);

  const nextSlide = useCallback(() => {
    setSlideDirection(1);
    setCurrentSlide(p => (p + 1) % slideCount);
  }, [slideCount]);

  const prevSlide = useCallback(() => {
    setSlideDirection(-1);
    setCurrentSlide(p => (p - 1 + slideCount) % slideCount);
  }, [slideCount]);

  // An admin removing slides can leave the index past the end.
  const activeIndex = slideCount > 0 ? Math.min(currentSlide, slideCount - 1) : 0;
  const activeSlide = heroSlides[activeIndex];

  const fallbackFeatured = products.filter(p => p.isFeatured);
  const featuredRow1 = homeGroups?.bestSellers?.slice(0, 5) ?? (fallbackFeatured.length >= 5 ? fallbackFeatured.slice(0, 5) : products.slice(0, 5));
  const featuredRow2 = homeGroups?.mostPopular?.slice(0, 5) ?? (fallbackFeatured.length >= 10 ? fallbackFeatured.slice(5, 10) : products.slice(5, 10));
  const hotDealProducts = (featuredRow2.length >= 2 ? featuredRow2 : products).slice(0, 2);
  const newArrivals = homeGroups?.newArrivals?.slice(0, 5) ?? products.slice(0, 5);
  const featuredPackages = packages.filter(p => p.isFeatured);

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
              <HeroCarouselSettings carousel={carousel} onSaved={setCarousel} />
              <AnimatePresence initial={false} custom={slideDirection}>
                <motion.div
                  key={`slide-${activeIndex}`}
                  className={styles.heroSlide}
                  custom={slideDirection}
                  variants={heroSlideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.6, ease: 'easeInOut' }}
                >
                  {activeSlide?.imageUrl && (
                    <Image
                      src={activeSlide.imageUrl}
                      alt={`Hero slide ${activeIndex + 1}`}
                      fill
                      priority={activeIndex === 0}
                      sizes="(max-width: 900px) 100vw, 70vw"
                      className={styles.heroSlideImage}
                    />
                  )}
                  <div className={styles.heroImageMask} />

                  <div className={styles.heroSlideContent}>
                    <div className={styles.heroText}>
                      <h1 className={styles.heroTitle}>
                        {(activeSlide?.title ?? '').split('\n').map((line, i) => (
                          <span key={i}>
                            {i === 1 ? <span className="gradient-text">{line}</span> : line}
                            {i === 0 && <br />}
                          </span>
                        ))}
                      </h1>
                      {/* <p className={styles.heroSubtitle}>{activeSlide?.subtitle}</p> */}
                      <div className={styles.heroCtas}>
                        {activeSlide?.cta && activeSlide?.ctaLink && (
                          <Link href={activeSlide.ctaLink} className="btn btn-outline btn-lg">
                            {activeSlide.cta} <ArrowRight size={18} />
                          </Link>
                        )}
                        <Link href="/products" className="btn btn-primary  btn-lg">
                          Browse All Products
                        </Link>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Hero Nav — one dot per configured slide */}
              {slideCount > 1 && (
                <div className={styles.heroNav}>
                  <button className={styles.heroArrow} onClick={prevSlide} aria-label="Previous slide"><ChevronLeft size={20} /></button>
                  <div className={styles.heroDots}>
                    {heroSlides.map((slide, i) => (
                      <button
                        key={slide.id ?? i}
                        className={`${styles.heroDot} ${i === activeIndex ? styles.heroDotActive : ''}`}
                        aria-label={`Go to slide ${i + 1}`}
                        onClick={() => {
                          if (i === activeIndex) return;
                          setSlideDirection(i > activeIndex ? 1 : -1);
                          setCurrentSlide(i);
                        }}
                      />
                    ))}
                  </div>
                  <button className={styles.heroArrow} onClick={nextSlide} aria-label="Next slide"><ChevronRight size={20} /></button>
                </div>
              )}
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
          <div className="grid-5">
            {productsLoading
              ? Array.from({ length: 5 }).map((_, i) => <ProductCardSkeleton key={`row1-skeleton-${i}`} />)
              : [
                  ...featuredPackages.map((pkg, i) => <PackageProductCard key={`bs-pkg-${pkg.id}`} pkg={pkg} index={i} />),
                  ...featuredRow1.map((p, i) => <ProductCard key={p.id} product={p} index={featuredPackages.length + i} />),
                ]}
          </div>
        </div>
      </section>

      {/* ===== EDGETECH CCTV PACKAGES ===== */}
      {(productsLoading || packages.length > 0) && (
        <section className={styles.section}>
          <div className="container">
            <div className="section-header">
              <div>
                <span className="section-label"><Package size={14} /> Ready-Made Security Bundles</span>
                <h2>EdgeTech CCTV Packages</h2>
              </div>
              <Link href="/packages" className="btn btn-ghost btn-sm">
                View All <ChevronRight size={16} />
              </Link>
            </div>
            <div className={styles.packageShowcaseGrid}>
              {productsLoading
                ? Array.from({ length: 3 }).map((_, i) => <ProductCardSkeleton key={`pkg-showcase-skeleton-${i}`} />)
                : packages.slice(0, 6).map((pkg, i) => <PackageShowcaseCard key={`showcase-${pkg.id}`} pkg={pkg} index={i} />)}
            </div>
          </div>
        </section>
      )}

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
          <div className="grid-5">
            {productsLoading
              ? Array.from({ length: 5 }).map((_, i) => <ProductCardSkeleton key={`row2-skeleton-${i}`} />)
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

      {/* ===== MOBILE HOT DEALS (Shown only on phone, just above New Arrivals) ===== */}
      <section className={styles.mobileHotDealsSection}>
        <div className="container">
          <div className="section-header">
            <div>
              <span className="section-label"><Clock size={14} /> Limited Time</span>
              <h2>Hot Deals of the Day</h2>
            </div>
            <Link href="/products?sale=true" className="btn btn-ghost btn-sm">
              View All <ChevronRight size={16} />
            </Link>
          </div>
          <div className="grid-5">
            {productsLoading ? (
              Array.from({ length: 2 }).map((_, i) => <ProductCardSkeleton key={`hot-m-skeleton-${i}`} />)
            ) : (
              hotDealProducts.map((product, index) => (
                <ProductCard key={`hot-m-${product.id}`} product={product} index={index} />
              ))
            )}
          </div>
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
          <div className="grid-5">
            {productsLoading
              ? Array.from({ length: 5 }).map((_, i) => <ProductCardSkeleton key={`new-skeleton-${i}`} />)
              : newArrivals.map((p, i) => <ProductCard key={`new-${p.id}`} product={p} index={i} />)}
          </div>
        </div>
      </section>
    </div>
  );
}
