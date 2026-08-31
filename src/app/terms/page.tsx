import type { Metadata } from 'next';
import Link from 'next/link';
import { ShieldCheck, Truck, Clock, AlertCircle, FileText, CheckCircle2 } from 'lucide-react';
import styles from '../compliance.module.css';

export const metadata: Metadata = {
  title: 'Terms and Conditions | EdgeTech Bangladesh',
  description: 'Terms and Conditions of EdgeTech. Read our service rules, order policies, warranty terms, delivery timelines, and customer privacy standards.',
};

export default function TermsAndConditionsPage() {
  return (
    <div className={styles.pageContainer}>
      <div className="container">
        <header className={styles.header}>
          <span className={styles.badge}><FileText size={14} /> Legal & Compliance</span>
          <h1 className={styles.title}>Terms and Conditions</h1>
          <p className={styles.subtitle}>
            Please review the legal terms governing purchases, warranties, delivery timelines, and services on EdgeTech.
          </p>
          <p className={styles.lastUpdated}>Last Updated: August 2026</p>
        </header>

        <div className={styles.contentCard}>
          {/* Section 1: Overview & Trade License */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}><ShieldCheck size={20} className={styles.listIcon} /> 1. Company Information & Legal Status</h2>
            <p className={styles.sectionText}>
              EdgeTech Solutions (&ldquo;EdgeTech&rdquo;, &ldquo;we&rdquo;, &ldquo;our&rdquo;, &ldquo;us&rdquo;) operates this online commerce platform specializing in professional CCTV surveillance, security systems, IP cameras, DVR/NVR hardware, networking, and comprehensive IT solutions across Bangladesh.
            </p>
            <div className={styles.highlightBox}>
              <div className={styles.highlightBoxTitle}>Registered Business Information</div>
              <p className={styles.highlightBoxText}>
                <strong>Registered Name:</strong> EdgeTech Solutions<br />
                <strong>Trade License Number:</strong> TRAD/DNCC/042819/2023 (Dhaka North City Corporation)<br />
                <strong>Registered Office:</strong> 373, South Monipur, Mirpur-2, Dhaka 1216.<br />
                <strong>Direct Contact:</strong> +880 1329-661250 | info@edgetech.com.bd
              </p>
            </div>
          </section>

          {/* Section 2: Delivery Timeline */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}><Truck size={20} className={styles.listIcon} /> 2. Delivery & Fulfillment Timelines</h2>
            <p className={styles.sectionText}>
              We partner with premier nationwide logistics couriers to ensure fast and secure doorstep delivery for all equipment orders:
            </p>
            <div className={styles.gridTwo}>
              <div className={styles.infoBox}>
                <div className={styles.infoBoxTitle}><Clock size={16} /> Inside Dhaka City</div>
                <p className={styles.infoBoxText}>
                  Standard delivery timeline is <strong>5 working days</strong> from order confirmation and verification.
                </p>
              </div>
              <div className={styles.infoBox}>
                <div className={styles.infoBoxTitle}><Clock size={16} /> Outside Dhaka / Nationwide</div>
                <p className={styles.infoBoxText}>
                  Standard delivery timeline is <strong>10 working days</strong> across all divisions and districts in Bangladesh.
                </p>
              </div>
            </div>
          </section>

          {/* Section 3: Orders, Pricing & Stock Availability */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}><CheckCircle2 size={20} className={styles.listIcon} /> 3. Orders, Pricing & Product Availability</h2>
            <p className={styles.sectionText}>
              All product prices listed on our portal are in Bangladeshi Taka (BDT / ৳) and include applicable trade taxes unless explicitly noted. Product stock quantities are actively updated. In the rare scenario where an item becomes unavailable after placement, our customer care team will notify you immediately with equivalent options or an immediate full refund.
            </p>
          </section>

          {/* Section 4: Return & Refund Policy Linkage */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}><AlertCircle size={20} className={styles.listIcon} /> 4. Return and Refund Guarantee</h2>
            <p className={styles.sectionText}>
              Customers are protected by our standard <strong>7 to 10 working days</strong> return and refund policy. If an item arrives physically damaged, missing parts, or non-functional, please file a claim within 48 hours. Detailed terms are available on our <Link href="/refund-policy" style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'underline' }}>Return & Refund Policy</Link> page.
            </p>
          </section>

          {/* Section 5: Third-Party Advertising & Data Liability Disclaimer */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}><AlertCircle size={20} className={styles.listIcon} /> 5. Third-Party Advertisements & Data Protection</h2>
            <p className={styles.sectionText}>
              EdgeTech maintains a strictly focused commercial store. No unauthorized third-party advertisements are published on our platform. In the event any external third-party links or advertisements appear, EdgeTech assumes merchant responsibility for ensuring our platform remains secure, but cannot control third-party destinations.
            </p>
            <p className={styles.sectionText}>
              Furthermore, EdgeTech strictly safeguards all customer personally identifiable information (PII). We do not sell, rent, or unauthorizedly disclose customer details to any third-party advertisers. All data handling complies with our <Link href="/privacy" style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'underline' }}>Privacy Policy</Link>.
            </p>
          </section>

          {/* Section 6: Payment Methods & Gateway Compliance */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}><ShieldCheck size={20} className={styles.listIcon} /> 6. Payments & EMI Terms</h2>
            <p className={styles.sectionText}>
              We accept online payments via SSLCommerz certified payment gateways (Visa, MasterCard, American Express, bKash, Nagad, Rocket, Upay, and internet banking) and Cash on Delivery (COD). For eligible purchases, Equal Monthly Installment (EMI) facilities of 3, 6, 9, 12, 18, 24, or 36 months are provided in partnership with supported Bangladeshi commercial banks.
            </p>
          </section>

          {/* Section 7: Governing Law */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}><FileText size={20} className={styles.listIcon} /> 7. Governing Law & Jurisdiction</h2>
            <p className={styles.sectionText}>
              These Terms & Conditions shall be governed by and construed in accordance with the laws of the People&apos;s Republic of Bangladesh. Any dispute arising out of or in connection with these terms shall be subject to the exclusive jurisdiction of the courts of Dhaka, Bangladesh.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
