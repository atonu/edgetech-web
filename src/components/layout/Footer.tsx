import Link from 'next/link';
import Image from 'next/image';
import { Mail, Phone, MapPin, Globe, ExternalLink, MessageCircle, Rss, ShieldCheck, Truck, FileCheck } from 'lucide-react';
import PaymentBanner from '@/components/ui/PaymentBanner';
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
          {/* Brand & Registration */}
          <div className={styles.brand}>
            <Link href="/" className={styles.logo}>
              <div className={styles.logoIcon}>
                <Image src="/logo.png" alt="EdgeTech Logo" width={38} height={38} className={styles.logoImage} />
              </div>
              <span>Edge<span className={styles.accent}>Tech</span></span>
            </Link>
            <p className={styles.tagline}>
              Bangladesh&apos;s trusted partner for CCTV surveillance, networking, and security solutions since 2015.
            </p>
            <div className={styles.socials}>
              <a href="#" className={styles.social} aria-label="Facebook"><Globe size={18} /></a>
              <a href="#" className={styles.social} aria-label="Youtube"><ExternalLink size={18} /></a>
              <a href="https://wa.me/8801329661250" target="_blank" rel="noopener noreferrer" className={styles.social} aria-label="WhatsApp"><MessageCircle size={18} /></a>
              <a href="#" className={styles.social} aria-label="RSS"><Rss size={18} /></a>
            </div>
          </div>

          {/* Quick Links & Policy */}
          <div>
            <h4 className={styles.colTitle}>Company & Policies</h4>
            <ul className={styles.links}>
              {[
                { href: '/about', label: 'About Us & Management' },
                { href: '/terms', label: 'Terms & Conditions' },
                { href: '/privacy', label: 'Privacy Policy' },
                { href: '/refund-policy', label: 'Return & Refund Policy' },
                { href: '/contact', label: 'Contact Us' },
              ].map(l => (
                <li key={l.href}><Link href={l.href} className={styles.link}>{l.label}</Link></li>
              ))}
            </ul>
          </div>

          {/* Customer Care */}
          <div>
            <h4 className={styles.colTitle}>Customer Care</h4>
            <ul className={styles.links}>
              {[
                { href: '/products', label: 'All Products' },
                { href: '/package-builder', label: 'Build Your Solution' },
                { href: '/cart', label: 'Shopping Cart' },
                { href: '/account/orders', label: 'EMI & Order Tracking' },
                { href: '/auth/login', label: 'Customer Login' },
              ].map(c => (
                <li key={c.href}><Link href={c.href} className={styles.link}>{c.label}</Link></li>
              ))}
            </ul>
          </div>

          {/* Contact & Registered Address */}
          <div>
            <h4 className={styles.colTitle}>Registered Office</h4>
            <ul className={styles.contactList}>
              <li className={styles.contactItem}>
                <MapPin size={16} />
                <span>
                  373, South Monipur, Mirpur-2, Dhaka 1216
                </span>
              </li>
              <li className={styles.contactItem}>
                <Phone size={16} />
                <a href="tel:+8801329661250">+880 1329-661250</a>
              </li>
              <li className={styles.contactItem}>
                <Mail size={16} />
                <a href="mailto:info@edgetech.com.bd">info@edgetech.com.bd</a>
              </li>
            </ul>
            <div className={styles.hours}>
              <p className={styles.hoursTitle}>Business Hours</p>
              <p>Sat – Thu: 9:00 AM – 8:00 PM (Friday Closed)</p>
            </div>
          </div>
        </div>

        {/* Compliance Bar: Trade License & Delivery Timeline */}
        <div className={styles.complianceBar}>
          <div className={styles.tradeLicense}>
            <FileCheck size={16} color="var(--color-primary)" />
            <span>Trade License No: <strong>TRAD/DNCC/042819/2023</strong></span>
          </div>

          <div className={styles.deliveryTime}>
            <Truck size={16} color="var(--color-primary)" />
            <span>Delivery Time: <span className={styles.deliveryHighlight}>Inside Dhaka: 5 Days</span> | <span className={styles.deliveryHighlight}>Outside Dhaka: 10 Days</span></span>
          </div>

          <div className={styles.tradeLicense}>
            <ShieldCheck size={16} color="var(--color-primary)" />
            <span>Return & Refund Timeline: <strong>7 to 10 Working Days</strong></span>
          </div>
        </div>

        {/* Updated Payment Banner */}
        <PaymentBanner />

        {/* Bottom Bar */}
        <div className={styles.bottom}>
          <p>© {new Date().getFullYear()} EdgeTech Solutions. All rights reserved.</p>
          <div className={styles.bottomLinks}>
            <Link href="/about">About Us</Link>
            <Link href="/terms">Terms & Conditions</Link>
            <Link href="/privacy">Privacy Policy</Link>
            <Link href="/refund-policy">Return & Refund Policy</Link>
            <Link href="/contact">Contact Us</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
