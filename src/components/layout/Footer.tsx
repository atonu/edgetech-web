'use client';
import Link from 'next/link';
import Image from 'next/image';
import { Mail, Phone, MapPin, Globe, ExternalLink, MessageCircle, Rss, ShieldCheck, Truck, FileCheck } from 'lucide-react';
import PaymentBanner from '@/components/ui/PaymentBanner';
import AdminEditableText from '@/components/compliance/AdminEditableText';
import { usePolicyPage } from '@/hooks/usePolicyPage';
import styles from './Footer.module.css';

const defaultFooterData = {
  slug: 'footer',
  title: 'Website Footer Configuration',
  subtitle: 'Footer settings and disclosures',
  badge: 'Footer Settings',
  lastUpdated: 'September 2026',
  sections: [
    {
      id: 'brand',
      order: 1,
      title: 'Brand & Tagline',
      body: "Bangladesh's trusted partner for CCTV surveillance, networking, and security solutions since 2015.",
    },
    {
      id: 'office',
      order: 2,
      title: 'Registered Office',
      highlightTitle: '373, South Monipur, Mirpur-2, Dhaka 1216',
      highlightText: '+880 1329-661250',
      body: 'info@edgetech.com.bd',
      subtitle: 'Sat – Thu: 9:00 AM – 8:00 PM (Friday Closed)',
    },
    {
      id: 'compliance',
      order: 3,
      title: 'Compliance Disclosures',
      highlightTitle: 'TRAD/DNCC/042819/2023',
      highlightText: 'Inside Dhaka: 5 Days | Outside Dhaka: 10 Days',
      body: '7 to 10 Working Days',
    },
  ],
};

export default function Footer() {
  const { page, updateField } = usePolicyPage('footer', defaultFooterData);

  const brandSection = page?.sections?.find((s) => s.id === 'brand' || s.title?.toLowerCase().includes('brand'));
  const officeSection = page?.sections?.find((s) => s.id === 'office' || s.title?.toLowerCase().includes('office'));
  const complianceSection = page?.sections?.find((s) => s.id === 'compliance' || s.title?.toLowerCase().includes('compliance'));

  const brandSectionId = brandSection?.id || 'brand';
  const officeSectionId = officeSection?.id || 'office';
  const complianceSectionId = complianceSection?.id || 'compliance';

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
            <AdminEditableText
              as="p"
              className={styles.tagline}
              value={brandSection?.body || "Bangladesh's trusted partner for CCTV surveillance, networking, and security solutions since 2015."}
              onSave={(val) => updateField(`sections/${brandSectionId}/body`, val)}
              label="Brand Tagline"
              multiline
            />
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
                { href: '/support', label: 'Support & Feedback' },
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
                { href: '/support', label: 'Help & Feedback' },
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
                <AdminEditableText
                  as="span"
                  value={officeSection?.highlightTitle || '373, South Monipur, Mirpur-2, Dhaka 1216'}
                  onSave={(val) => updateField(`sections/${officeSectionId}/highlighttitle`, val)}
                  label="Office Address"
                />
              </li>
              <li className={styles.contactItem}>
                <Phone size={16} />
                <AdminEditableText
                  as="span"
                  value={officeSection?.highlightText || '+880 1329-661250'}
                  onSave={(val) => updateField(`sections/${officeSectionId}/highlighttext`, val)}
                  label="Phone Number"
                />
              </li>
              <li className={styles.contactItem}>
                <Mail size={16} />
                <AdminEditableText
                  as="span"
                  value={officeSection?.body || 'info@edgetech.com.bd'}
                  onSave={(val) => updateField(`sections/${officeSectionId}/body`, val)}
                  label="Email Address"
                />
              </li>
            </ul>
            <div className={styles.hours}>
              <p className={styles.hoursTitle}>Business Hours</p>
              <AdminEditableText
                as="p"
                value={officeSection?.subtitle || 'Sat – Thu: 9:00 AM – 8:00 PM (Friday Closed)'}
                onSave={(val) => updateField(`sections/${officeSectionId}/subtitle`, val)}
                label="Business Hours"
              />
            </div>
          </div>
        </div>

        {/* Compliance Bar: Trade License & Delivery Timeline */}
        <div className={styles.complianceBar}>
          <div className={styles.tradeLicense}>
            <FileCheck size={16} color="var(--color-primary)" />
            <span>Trade License No: <strong>
              <AdminEditableText
                value={complianceSection?.highlightTitle || 'TRAD/DNCC/042819/2023'}
                onSave={(val) => updateField(`sections/${complianceSectionId}/highlighttitle`, val)}
                label="Trade License Number"
              />
            </strong></span>
          </div>

          <div className={styles.deliveryTime}>
            <Truck size={16} color="var(--color-primary)" />
            <span>Delivery Time: <span className={styles.deliveryHighlight}>
              <AdminEditableText
                value={complianceSection?.highlightText || 'Inside Dhaka: 5 Days | Outside Dhaka: 10 Days'}
                onSave={(val) => updateField(`sections/${complianceSectionId}/highlighttext`, val)}
                label="Delivery Timeline"
              />
            </span></span>
          </div>

          <div className={styles.tradeLicense}>
            <ShieldCheck size={16} color="var(--color-primary)" />
            <span>Return & Refund Timeline: <strong>
              <AdminEditableText
                value={complianceSection?.body || '7 to 10 Working Days'}
                onSave={(val) => updateField(`sections/${complianceSectionId}/body`, val)}
                label="Return & Refund Timeline"
              />
            </strong></span>
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
            <Link href="/support">Support & Feedback</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
