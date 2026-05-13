'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { ShoppingCart, Search, Menu, X, User, LogOut, ChevronDown, Package, Shield } from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';
import { useAuthStore } from '@/store/useAuthStore';
import { categoriesApi, CategoryDto } from '@/lib/api';
import styles from './Header.module.css';

export default function Header() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [megaMenuOpen, setMegaMenuOpen] = useState<string | null>(null);
  const { count, toggleCart } = useCartStore();
  const { user, isAuthenticated, logout } = useAuthStore();
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    categoriesApi.getAll().then(r => setCategories(r.data)).catch(() => {});
  }, []);

  useEffect(() => {
    if (searchOpen) searchRef.current?.focus();
  }, [searchOpen]);

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
    { href: '/package-builder', label: '📦 Package Builder', highlight: true },
  ];

  return (
    <>
      <header className={`${styles.header} ${scrolled ? styles.scrolled : ''}`}>
        <div className={`container ${styles.inner}`}>
          {/* Logo */}
          <Link href="/" className={styles.logo}>
            <div className={styles.logoIcon}>
              <Shield size={20} />
            </div>
            <span className={styles.logoText}>
              Edge<span className={styles.logoAccent}>Tech</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className={styles.nav}>
            {navLinks.map(link => (
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
              className={styles.megaMenuTrigger}
              onMouseEnter={() => setMegaMenuOpen('categories')}
              onMouseLeave={() => setMegaMenuOpen(null)}
            >
              <span className={styles.navLink}>
                Categories <ChevronDown size={14} />
              </span>
              {megaMenuOpen === 'categories' && categories.length > 0 && (
                <div className={styles.megaMenu}>
                  <div className={styles.megaMenuGrid}>
                    {categories.map(cat => (
                      <div key={cat.id} className={styles.megaMenuCategory}>
                        <Link href={`/category/${cat.slug}`} className={styles.megaMenuTitle}>
                          {cat.name}
                        </Link>
                        {cat.subCategories?.map(sub => (
                          <Link key={sub.id} href={`/category/${sub.slug}`} className={styles.megaMenuSub}>
                            {sub.name}
                          </Link>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </nav>

          {/* Actions */}
          <div className={styles.actions}>
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
              <div className={styles.userMenu}>
                <button className={styles.userBtn}>
                  <User size={18} />
                  <span>{user?.firstName}</span>
                  <ChevronDown size={14} />
                </button>
                <div className={styles.userDropdown}>
                  <Link href="/account" className={styles.dropdownItem}><User size={15} /> My Account</Link>
                  <Link href="/account/orders" className={styles.dropdownItem}><Package size={15} /> Orders</Link>
                  {user?.role === 'Admin' && (
                    <Link href="/admin" className={`${styles.dropdownItem} ${styles.adminItem}`}><Shield size={15} /> Admin Panel</Link>
                  )}
                  <button onClick={logout} className={`${styles.dropdownItem} ${styles.logoutItem}`}><LogOut size={15} /> Logout</button>
                </div>
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
            {navLinks.map(link => (
              <Link key={link.href} href={link.href} className={styles.mobileNavLink} onClick={() => setMenuOpen(false)}>
                {link.label}
              </Link>
            ))}
            {categories.map(cat => (
              <Link key={cat.id} href={`/category/${cat.slug}`} className={styles.mobileNavLink} onClick={() => setMenuOpen(false)}>
                {cat.name}
              </Link>
            ))}
            {isAuthenticated ? (
              <>
                <Link href="/account" className={styles.mobileNavLink} onClick={() => setMenuOpen(false)}>My Account</Link>
                {user?.role === 'Admin' && <Link href="/admin" className={styles.mobileNavLink} onClick={() => setMenuOpen(false)}>Admin Panel</Link>}
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
