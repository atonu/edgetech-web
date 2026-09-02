'use client';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useState, useEffect, useRef, useMemo } from 'react';
import { ShoppingCart, Search, Menu, X, User, LogOut, ChevronDown, Package, Shield, Sun, Moon, ArrowRight } from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';
import { useAuthStore } from '@/store/useAuthStore';
import { categoriesApi, CategoryDto } from '@/lib/api';
import styles from './Header.module.css';

type ThemeMode = 'dark' | 'light';

export default function Header() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [theme, setTheme] = useState<ThemeMode>(() => {
    if (typeof window === 'undefined') return 'light';
    const savedTheme = localStorage.getItem('theme') as ThemeMode | null;
    if (savedTheme) return savedTheme;
    return 'light';
  });
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [megaMenuOpen, setMegaMenuOpen] = useState<string | null>(null);
  const [expandedMobileCategories, setExpandedMobileCategories] = useState<number[]>([]);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { count, toggleCart } = useCartStore();
  const { user, isAuthenticated, logout } = useAuthStore();
  const isAdmin = user?.role === 'Admin';
  const searchRef = useRef<HTMLInputElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const megaMenuRef = useRef<HTMLDivElement>(null);
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    categoriesApi.getAll().then(r => setCategories(r.data)).catch(() => { });
  }, []);

  const orderedCategories = useMemo(() => {
    const slugPriority: Record<string, number> = {
      'cctv-camera': 1,
      'cctv-surveillance': 1,
      'accessories': 2,
      'storage': 3,
      'access-control': 4,
      'networking': 5,
    };

    return [...categories].sort((a, b) => {
      const pA = slugPriority[a.slug?.toLowerCase() || ''] ?? (a.displayOrder || 99);
      const pB = slugPriority[b.slug?.toLowerCase() || ''] ?? (b.displayOrder || 99);
      if (pA !== pB) return pA - pB;
      return (a.displayOrder || 0) - (b.displayOrder || 0);
    });
  }, [categories]);

  useEffect(() => {
    if (searchOpen) searchRef.current?.focus();
  }, [searchOpen]);

  useEffect(() => {
    if (!userMenuOpen) return;
    const onClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, [userMenuOpen]);

  useEffect(() => {
    if (!megaMenuOpen) return;
    const onClickOutside = (e: MouseEvent) => {
      if (megaMenuRef.current && !megaMenuRef.current.contains(e.target as Node)) {
        setMegaMenuOpen(null);
      }
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, [megaMenuOpen]);

  const handleMegaMenuEnter = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    setMegaMenuOpen('categories');
  };

  const handleMegaMenuLeave = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
    }
    closeTimeoutRef.current = setTimeout(() => {
      setMegaMenuOpen(null);
      closeTimeoutRef.current = null;
    }, 350);
  };

  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
      }
    };
  }, []);

  const toggleMegaMenu = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    setMegaMenuOpen(prev => (prev === 'categories' ? null : 'categories'));
  };

  const toggleMobileCategory = (id: number) => {
    setExpandedMobileCategories(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    const nextTheme: ThemeMode = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`;
      setSearchOpen(false);
    }
  };

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/products', label: 'All Products' },
    { href: '/package-builder', label: 'Build Your Solution', highlight: true },
  ];

  const visibleNavLinks = isAdmin
    ? [{ href: '/admin', label: 'Admin', highlight: false }, ...navLinks]
    : navLinks;

  return (
    <>
      <header className={`${styles.header} ${scrolled ? styles.scrolled : ''} ${menuOpen ? styles.headerMenuOpen : ''}`}>
        <div className={`container ${styles.inner}`}>
          {/* Logo */}
          <Link href="/" className={styles.logo}>
            <div className={styles.logoIcon}>
              <Image src="/logo.png" alt="EdgeTech Logo" width={38} height={38} className={styles.logoImage} />
            </div>
            <span className={styles.logoText}>
              Edge<span className={styles.logoAccent}>Tech</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className={styles.nav}>
            {visibleNavLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className={`${styles.navLink} ${pathname === link.href ? styles.active : ''} ${link.highlight ? styles.highlight : ''}`}
              >
                {link.label}
              </Link>
            ))}

            {/* Category Mega Menu */}
            <div
              ref={megaMenuRef}
              className={styles.megaMenuTrigger}
              onMouseEnter={handleMegaMenuEnter}
              onMouseLeave={handleMegaMenuLeave}
            >
              <button
                type="button"
                className={`${styles.navLink} ${styles.megaMenuBtn} ${megaMenuOpen === 'categories' ? styles.active : ''}`}
                onClick={toggleMegaMenu}
                aria-expanded={megaMenuOpen === 'categories'}
              >
                Categories <ChevronDown size={14} className={`${styles.chevron} ${megaMenuOpen === 'categories' ? styles.chevronOpen : ''}`} />
              </button>
              {megaMenuOpen === 'categories' && categories.length > 0 && (
                <div className={styles.megaMenu}>
                  <div className={styles.megaMenuGrid}>
                    {orderedCategories.map(cat => {
                      const hasSub = Boolean(cat.subCategories && cat.subCategories.length > 0);
                      return (
                        <div
                          key={cat.id}
                          className={`${styles.megaMenuCategory} ${!hasSub ? styles.megaMenuCategoryEmpty : ''}`}
                        >
                          <Link
                            href={`/products?category=${encodeURIComponent(cat.slug || cat.name)}`}
                            className={`${styles.megaMenuTitle} ${!hasSub ? styles.megaMenuTitleEmpty : ''}`}
                            onClick={() => setMegaMenuOpen(null)}
                          >
                            <span>{cat.name}</span>
                          </Link>
                          {hasSub && (
                            <div className={styles.megaMenuSubList}>
                              {cat.subCategories!.map(sub => (
                                <Link
                                  key={sub.id}
                                  href={`/products?category=${encodeURIComponent(sub.slug || sub.name)}`}
                                  className={styles.megaMenuSub}
                                  onClick={() => setMegaMenuOpen(null)}
                                >
                                  {sub.name}
                                </Link>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  <div className={styles.megaMenuFooter}>
                    <Link
                      href="/products"
                      className={styles.megaMenuAllLink}
                      onClick={() => setMegaMenuOpen(null)}
                    >
                      Browse All Products <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </nav>

          {/* Actions */}
          <div className={styles.actions}>
            <button
              onClick={toggleTheme}
              className={`${styles.iconBtn} ${styles.themeBtn}`}
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              {theme === 'dark' ? <Sun size={19} /> : <Moon size={19} />}
            </button>

            {/* Search */}
            <div className={`${styles.searchWrapper} ${searchOpen ? styles.searchOpen : ''}`}>
              {searchOpen ? (
                <form onSubmit={handleSearch} className={styles.searchForm}>
                  <input
                    ref={searchRef}
                    type="text"
                    className={styles.searchInput}
                    placeholder="Search cameras, DVRs, accessories..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                  />
                  <button type="submit" className={styles.searchBtn}><Search size={16} /></button>
                  <button type="button" onClick={() => setSearchOpen(false)} className={styles.searchClose}><X size={16} /></button>
                </form>
              ) : (
                <button onClick={() => setSearchOpen(true)} className={`${styles.iconBtn}`} aria-label="Search">
                  <Search size={20} />
                </button>
              )}
            </div>

            {/* Cart */}
            <button onClick={toggleCart} className={styles.iconBtn} aria-label="Cart">
              <ShoppingCart size={20} />
              {count() > 0 && <span className={styles.cartBadge}>{count()}</span>}
            </button>

            {/* Auth */}
            {isAuthenticated ? (
              <div className={styles.userMenu} ref={userMenuRef}>
                <button className={styles.userBtn} onClick={() => setUserMenuOpen(o => !o)}>
                  <User size={18} />
                  <span>{user?.firstName}</span>
                  <ChevronDown size={14} />
                </button>
                {userMenuOpen && (
                  <div className={styles.userDropdown}>
                    <Link href="/account" className={styles.dropdownItem} onClick={() => setUserMenuOpen(false)}><User size={15} /> My Account</Link>
                    <Link href="/account/orders" className={styles.dropdownItem} onClick={() => setUserMenuOpen(false)}><Package size={15} /> Orders</Link>
                    {isAdmin && (
                      <Link href="/admin" className={`${styles.dropdownItem} ${styles.adminItem}`} onClick={() => setUserMenuOpen(false)}><Shield size={15} /> Admin Panel</Link>
                    )}
                    <button onClick={() => { logout(); setUserMenuOpen(false); }} className={`${styles.dropdownItem} ${styles.logoutItem}`}><LogOut size={15} /> Logout</button>
                  </div>
                )}
              </div>
            ) : (
              <Link href="/auth/login" className="btn btn-primary btn-sm">Login</Link>
            )}

            {/* Mobile menu toggle */}
            <button className={styles.mobileMenuBtn} onClick={() => setMenuOpen(!menuOpen)}>
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className={styles.mobileMenu}>
            <form onSubmit={handleSearch} className={styles.mobileSearch}>
              <input
                className={styles.searchInput}
                placeholder="Search..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
              <button type="submit"><Search size={16} /></button>
            </form>
            {visibleNavLinks.map(link => (
              <Link key={link.href} href={link.href} className={styles.mobileNavLink} onClick={() => setMenuOpen(false)}>
                {link.label}
              </Link>
            ))}
            <div className={styles.mobileCategorySection}>
              <span className={styles.mobileCategoryHeader}>Categories</span>
              {orderedCategories.map(cat => {
                const hasSub = Boolean(cat.subCategories && cat.subCategories.length > 0);
                const isExpanded = expandedMobileCategories.includes(cat.id);

                return (
                  <div key={cat.id} className={styles.mobileCategoryItem}>
                    <div className={styles.mobileCategoryRow}>
                      <Link
                        href={`/products?category=${encodeURIComponent(cat.slug || cat.name)}`}
                        className={styles.mobileCategoryTitleLink}
                        onClick={() => setMenuOpen(false)}
                      >
                        {cat.name}
                      </Link>
                      {hasSub && (
                        <button
                          type="button"
                          className={styles.mobileCategoryExpandBtn}
                          onClick={() => toggleMobileCategory(cat.id)}
                          aria-expanded={isExpanded}
                          aria-label={`Toggle ${cat.name} subcategories`}
                        >
                          <ChevronDown
                            size={24}
                            className={`${styles.mobileChevron} ${isExpanded ? styles.mobileChevronOpen : ''}`}
                          />
                        </button>
                      )}
                    </div>
                    {hasSub && isExpanded && (
                      <div className={styles.mobileSubList}>
                        {cat.subCategories!.map(sub => (
                          <Link
                            key={sub.id}
                            href={`/products?category=${encodeURIComponent(sub.slug || sub.name)}`}
                            className={styles.mobileSubNavLink}
                            onClick={() => setMenuOpen(false)}
                          >
                            ↳ {sub.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            {isAuthenticated ? (
              <>
                <Link href="/account" className={styles.mobileNavLink} onClick={() => setMenuOpen(false)}>My Account</Link>
                {isAdmin && <Link href="/admin" className={styles.mobileNavLink} onClick={() => setMenuOpen(false)}>Admin Panel</Link>}
                <button onClick={() => { logout(); setMenuOpen(false); }} className={styles.mobileNavLink}>Logout</button>
              </>
            ) : (
              <Link href="/auth/login" className={styles.mobileNavLink} onClick={() => setMenuOpen(false)}>Login / Register</Link>
            )}
          </div>
        )}
      </header>
      {/* Spacer */}
      <div style={{ height: '72px' }} />
    </>
  );
}
