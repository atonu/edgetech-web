import type { Metadata } from 'next';
import Link from 'next/link';
import { Lock, Eye, CheckCircle2, FileText, AlertTriangle } from 'lucide-react';
import styles from '../compliance.module.css';

export const metadata: Metadata = {
  title: 'Privacy Policy | EdgeTech Bangladesh',
  description: 'EdgeTech Privacy Policy. Understand how we protect your personal information, order details, encryption standards, and strict third-party data rules.',
};

export default function PrivacyPolicyPage() {
  return (
    <div className={styles.pageContainer}>
      <div className="container">
        <header className={styles.header}>
          <span className={styles.badge}><Lock size={14} /> Data Protection & Privacy</span>
          <h1 className={styles.title}>Privacy Policy</h1>
          <p className={styles.subtitle}>
            Your privacy and security are paramount. Learn how EdgeTech collects, protects, and handles your data.
          </p>
          <p className={styles.lastUpdated}>Last Updated: August 2026</p>
        </header>

        <div className={styles.contentCard}>
          {/* Section 1: Overview */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}><Lock size={20} className={styles.listIcon} /> 1. Commitment to Privacy</h2>
            <p className={styles.sectionText}>
              EdgeTech Solutions (&ldquo;EdgeTech&rdquo;, &ldquo;we&rdquo;, &ldquo;our&rdquo;) is committed to protecting your personal information. This Privacy Policy details how we collect, store, utilize, and protect your information when you visit or place orders on our official website.
            </p>
          </section>

          {/* Section 2: Data We Collect */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}><Eye size={20} className={styles.listIcon} /> 2. Information We Collect</h2>
            <p className={styles.sectionText}>
              To process your surveillance and IT orders, verify shipping, and deliver hardware safely to your doorstep, we collect:
            </p>
            <ul className={styles.list}>
              <li className={styles.listItem}>
                <CheckCircle2 size={16} className={styles.listIcon} />
                <span><strong>Contact & Shipping Data:</strong> Full Name, delivery address, division/district, active phone number, and email address.</span>
              </li>
              <li className={styles.listItem}>
                <CheckCircle2 size={16} className={styles.listIcon} />
                <span><strong>Order Details:</strong> Items purchased, quantity, package builder configurations, and preferred delivery time slots.</span>
              </li>
              <li className={styles.listItem}>
                <CheckCircle2 size={16} className={styles.listIcon} />
                <span><strong>Payment Information:</strong> Transaction identifiers and payment status (card details and mobile banking PINs are processed securely by certified gateways like SSLCommerz and never stored on our servers).</span>
              </li>
            </ul>
          </section>

          {/* Section 3: Third Party Advertising & Sharing Policy */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}><AlertTriangle size={20} className={styles.listIcon} /> 3. Third-Party Advertisements & Non-Disclosure</h2>
            <div className={styles.highlightBox}>
              <div className={styles.highlightBoxTitle}>Strict Data Protection Standard</div>
              <p className={styles.highlightBoxText}>
                EdgeTech does not allow unauthorized third-party advertisements on our platform. We strictly do not sell, trade, monetize, or disclose customer personal information to any third-party advertisers or marketing brokers. Any information provided by customers is handled with merchant-level responsibility and used exclusively for fulfilling orders and customer support.
              </p>
            </div>
          </section>

          {/* Section 4: Security & Encryption */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}><Lock size={20} className={styles.listIcon} /> 4. Security & Encryption Standards</h2>
            <p className={styles.sectionText}>
              We employ industry-standard 256-bit SSL encryption across all browsing sessions and checkout steps. All account credentials, passwords, and administrative access points are protected with modern cryptographic hashing (PBKDF2/SHA256) and strict role-based access control.
            </p>
          </section>

          {/* Section 5: Trade License & Contact Information */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}><FileText size={20} className={styles.listIcon} /> 5. Data Controller & Inquiries</h2>
            <p className={styles.sectionText}>
              For any questions or data requests regarding your personal details, contact our registered compliance office:
            </p>
            <div className={styles.infoBox}>
              <div className={styles.infoBoxTitle}>EdgeTech Privacy Officer</div>
              <p className={styles.infoBoxText}>
                <strong>Company:</strong> EdgeTech Solutions (Trade License: TRAD/DNCC/042819/2023)<br />
                <strong>Address:</strong> Suite 402, Level 4, Computer City Centre (Multiplan Center), 69-71 New Elephant Road, Dhaka-1205, Bangladesh.<br />
                <strong>Email:</strong> privacy@edgetech.com.bd | info@edgetech.com.bd<br />
                <strong>Direct Helpline:</strong> +880 1329-661250
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
