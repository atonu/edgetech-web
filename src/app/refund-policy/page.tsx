import type { Metadata } from 'next';
import Link from 'next/link';
import { RefreshCw, Clock, CheckCircle2, AlertCircle, HelpCircle, ArrowRight } from 'lucide-react';
import styles from '../compliance.module.css';

export const metadata: Metadata = {
  title: 'Return and Refund Policy | EdgeTech Bangladesh',
  description: 'Return and Refund Policy of EdgeTech. Standard 7 to 10 working days refund timeline, replacement guarantee, and step-by-step return instructions.',
};

export default function RefundPolicyPage() {
  return (
    <div className={styles.pageContainer}>
      <div className="container">
        <header className={styles.header}>
          <span className={styles.badge}><RefreshCw size={14} /> Customer Assurance</span>
          <h1 className={styles.title}>Return and Refund Policy</h1>
          <p className={styles.subtitle}>
            We stand behind the quality of our CCTV surveillance, networking equipment, and security products.
          </p>
          <p className={styles.lastUpdated}>Last Updated: August 2026</p>
        </header>

        <div className={styles.contentCard}>
          {/* Section 1: Standard Timeline */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}><Clock size={20} className={styles.listIcon} /> 1. Standard Return & Refund Timeline</h2>
            <div className={styles.highlightBox}>
              <div className={styles.highlightBoxTitle}>7 to 10 Working Days Standard Resolution</div>
              <p className={styles.highlightBoxText}>
                All approved returns and refunds are processed within <strong>7 to 10 working days</strong> from the date our quality assessment team receives the returned item at our Dhaka service hub.
              </p>
            </div>
            <p className={styles.sectionText}>
              Refunds will be issued directly through the original method of payment (bKash, Nagad, Visa/MasterCard, or direct bank transfer).
            </p>
          </section>

          {/* Section 2: Eligibility for Return */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}><CheckCircle2 size={20} className={styles.listIcon} /> 2. Eligibility for Returns & Replacements</h2>
            <p className={styles.sectionText}>
              You may initiate a return or replacement request under the following circumstances:
            </p>
            <ul className={styles.list}>
              <li className={styles.listItem}>
                <CheckCircle2 size={16} className={styles.listIcon} />
                <span><strong>Defective or Damaged Products:</strong> The item is non-functional on arrival or damaged during transit.</span>
              </li>
              <li className={styles.listItem}>
                <CheckCircle2 size={16} className={styles.listIcon} />
                <span><strong>Wrong Item Delivered:</strong> The received camera, NVR, cable, or accessory differs from the placed order description.</span>
              </li>
              <li className={styles.listItem}>
                <CheckCircle2 size={16} className={styles.listIcon} />
                <span><strong>Missing Accessories / Components:</strong> Parts, power adapters, or mounting kits listed in the product specifications are missing.</span>
              </li>
            </ul>
          </section>

          {/* Section 3: Return Conditions */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}><AlertCircle size={20} className={styles.listIcon} /> 3. Conditions for Return Acceptance</h2>
            <div className={styles.gridTwo}>
              <div className={styles.infoBox}>
                <div className={styles.infoBoxTitle}>Original Packaging Required</div>
                <p className={styles.infoBoxText}>
                  Products must be returned in their original box with all warranty cards, user manuals, accessories, and uncompromised serial numbers / barcodes.
                </p>
              </div>
              <div className={styles.infoBox}>
                <div className={styles.infoBoxTitle}>Notification Window</div>
                <p className={styles.infoBoxText}>
                  Return claims must be submitted to our support team within <strong>48 hours</strong> of receiving the package for prompt handling.
                </p>
              </div>
            </div>
          </section>

          {/* Section 4: 4-Step Return Process */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}><RefreshCw size={20} className={styles.listIcon} /> 4. How to Initiate a Return</h2>
            <p className={styles.sectionText}>
              Following these 4 simple steps guarantees swift resolution:
            </p>
            <ul className={styles.list}>
              <li className={styles.listItem}>
                <CheckCircle2 size={16} className={styles.listIcon} />
                <span><strong>Step 1:</strong> Contact our helpline at <strong>+880 1329-661250</strong> (WhatsApp or Call) or email <strong>support@edgetech.com.bd</strong> with your Order ID and photo/video of the issue.</span>
              </li>
              <li className={styles.listItem}>
                <CheckCircle2 size={16} className={styles.listIcon} />
                <span><strong>Step 2:</strong> Our support representative will verify details and issue a Return Authorization Code.</span>
              </li>
              <li className={styles.listItem}>
                <CheckCircle2 size={16} className={styles.listIcon} />
                <span><strong>Step 3:</strong> Hand over the securely packaged parcel to our designated courier pickup or drop it off at our Multiplan Center location.</span>
              </li>
              <li className={styles.listItem}>
                <CheckCircle2 size={16} className={styles.listIcon} />
                <span><strong>Step 4:</strong> Upon receiving and verifying the parcel, your replacement item will be dispatched or your refund credited within <strong>7 to 10 working days</strong>.</span>
              </li>
            </ul>
          </section>

          {/* Section 5: Need Help */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}><HelpCircle size={20} className={styles.listIcon} /> 5. Questions & Assistance</h2>
            <p className={styles.sectionText}>
              Need assistance with an existing return? Visit our <Link href="/contact" style={{ color: 'var(--primary)', fontWeight: 600 }}>Contact Us</Link> page or chat directly with our support team on WhatsApp.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
