import Link from 'next/link';
import { Shield, Mail, Phone, MapPin, Globe, ExternalLink, MessageCircle, Rss } from 'lucide-react';
import styles from './Footer.module.css';

export default function Footer() {
  const categories = [
    { name: 'IP Cameras', slug: 'ip-cameras' },
    { name: 'Dome Cameras', slug: 'dome-cameras' },
    { name: 'PTZ Cameras', slug: 'ptz-cameras' },
    { name: 'DVR / NVR', slug: 'dvr-nvr' },
    { name: 'Networking', slug: 'networking' },
    { name: 'Storage', slug: 'storage' },
  ];

  return (
    <footer className={styles.footer}>
      <div className={styles.glow} />
      <div className="container">
        <div className={styles.grid}>
          {/* Brand */}
          <div className={styles.brand}>
            <Link href="/" className={styles.logo}>
              <div className={styles.logoIcon}><Shield size={20} /></div>
              <span>Edge<span className={styles.accent}>Tech</span></span>
            </Link>
            <p className={styles.tagline}>
              Bangladesh&apos;s trusted partner for CCTV surveillance, networking, and IT solutions since 2015.
            </p>
            <div className={styles.socials}>
              <a href="#" className={styles.social} aria-label="Facebook"><Globe size={18} /></a>
              <a href="#" className={styles.social} aria-label="Youtube"><ExternalLink size={18} /></a>
              <a href="#" className={styles.social} aria-label="Instagram"><MessageCircle size={18} /></a>
              <a href="#" className={styles.social} aria-label="Twitter"><Rss size={18} /></a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className={styles.colTitle}>Quick Links</h4>
            <ul className={styles.links}>
              {[
                { href: '/products', label: 'All Products' },
                { href: '/package-builder', label: 'CCTV Package Builder' },
                { href: '/cart', label: 'Shopping Cart' },
                { href: '/account/orders', label: 'Order History' },
                { href: '/auth/login', label: 'Login' },
                { href: '/auth/register', label: 'Register' },
              ].map(l => (
                <li key={l.href}><Link href={l.href} className={styles.link}>{l.label}</Link></li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className={styles.colTitle}>Categories</h4>
            <ul className={styles.links}>
              {categories.map(c => (
                <li key={c.slug}><Link href={`/category/${c.slug}`} className={styles.link}>{c.name}</Link></li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className={styles.colTitle}>Contact Us</h4>
            <ul className={styles.contactList}>
              <li className={styles.contactItem}>
                <MapPin size={16} />
                <span>Dhaka, Bangladesh</span>
              </li>
              <li className={styles.contactItem}>
                <Phone size={16} />
                <a href="tel:+8801XXXXXXXXX">+880 1XXX-XXXXXX</a>
              </li>
              <li className={styles.contactItem}>
                <Mail size={16} />
                <a href="mailto:info@edgetech.com.bd">info@edgetech.com.bd</a>
              </li>
            </ul>
            <div className={styles.hours}>
              <p className={styles.hoursTitle}>Business Hours</p>
              <p>Sat – Thu: 9AM – 8PM</p>
              <p>Friday: Closed</p>
            </div>
          </div>
        </div>

        <div className={styles.bottom}>
          <p>© {new Date().getFullYear()} EdgeTech. All rights reserved.</p>
          <div className={styles.bottomLinks}>
            <Link href="/privacy">Privacy Policy</Link>
            <Link href="/terms">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
