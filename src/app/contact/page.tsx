import type { Metadata } from 'next';
import Link from 'next/link';
import { Phone, Mail, MapPin, Clock, MessageSquare, Truck, ShieldCheck, Building } from 'lucide-react';
import styles from '../compliance.module.css';

export const metadata: Metadata = {
  title: 'Contact Us | EdgeTech Bangladesh',
  description: 'Get in touch with EdgeTech Solutions. Official registered address, WhatsApp helpline +880 1329-661250, trade license details, and store hours.',
};

export default function ContactUsPage() {
  return (
    <div className={styles.pageContainer}>
      <div className="container">
        <header className={styles.header}>
          <span className={styles.badge}><Phone size={14} /> Get in Touch</span>
          <h1 className={styles.title}>Contact & Registered Office</h1>
          <p className={styles.subtitle}>
            Have questions about CCTV surveillance systems, custom packages, order tracking, or warranty support? We are here to help.
          </p>
        </header>

        <div className={styles.contentCard}>
          {/* Section 1: Registered Address & Trade License */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}><Building size={20} className={styles.listIcon} /> Registered Business Details</h2>
            <div className={styles.highlightBox}>
              <div className={styles.highlightBoxTitle}>Trade License & Registered Address (DNCC)</div>
              <p className={styles.highlightBoxText}>
                <strong>Company Name:</strong> EdgeTech Solutions<br />
                <strong>Trade License No:</strong> TRAD/DNCC/042819/2023<br />
                <strong>Registered Office:</strong> 373, South Monipur, Mirpur-2, Dhaka 1216.
              </p>
            </div>
          </section>

          {/* Section 2: Contact Options */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}><Phone size={20} className={styles.listIcon} /> Direct Channels & Helplines</h2>
            <div className={styles.gridTwo}>
              <div className={styles.infoBox}>
                <div className={styles.infoBoxTitle}><MessageSquare size={16} color="#25D366" /> WhatsApp Direct Support</div>
                <p className={styles.infoBoxText}>
                  Instant live chat assistance for product consultation and order inquiries:<br />
                  <a
                    href="https://wa.me/8801329661250?text=Hello%20EdgeTech%20Support%2C%20I%20would%20like%20to%20inquire%20about%20a%20product"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: '#16a34a', fontWeight: 700, fontSize: '1rem', display: 'inline-block', marginTop: '6px' }}
                  >
                    +880 1329-661250 (Click to Chat)
                  </a>
                </p>
              </div>

              <div className={styles.infoBox}>
                <div className={styles.infoBoxTitle}><Phone size={16} /> Official Hotline</div>
                <p className={styles.infoBoxText}>
                  Direct voice support available during operating hours:<br />
                  <a href="tel:+8801329661250" style={{ color: 'var(--primary)', fontWeight: 700, fontSize: '1rem', display: 'inline-block', marginTop: '6px' }}>
                    +880 1329-661250
                  </a>
                </p>
              </div>

              <div className={styles.infoBox}>
                <div className={styles.infoBoxTitle}><Mail size={16} /> Official Email</div>
                <p className={styles.infoBoxText}>
                  General inquiries: <a href="mailto:info@edgetech.com.bd" style={{ color: 'var(--primary)', fontWeight: 600 }}>info@edgetech.com.bd</a><br />
                  Warranty & Returns: <a href="mailto:support@edgetech.com.bd" style={{ color: 'var(--primary)', fontWeight: 600 }}>support@edgetech.com.bd</a>
                </p>
              </div>

              <div className={styles.infoBox}>
                <div className={styles.infoBoxTitle}><Clock size={16} /> Business Hours</div>
                <p className={styles.infoBoxText}>
                  <strong>Saturday – Thursday:</strong> 9:00 AM – 8:00 PM<br />
                  <strong>Friday:</strong> Weekly Holiday (Online store orders 24/7 active)
                </p>
              </div>
            </div>
          </section>

          {/* Section 3: Delivery Timelines */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}><Truck size={20} className={styles.listIcon} /> Nationwide Delivery Standard</h2>
            <div className={styles.gridTwo}>
              <div className={styles.infoBox}>
                <div className={styles.infoBoxTitle}>Inside Dhaka</div>
                <p className={styles.infoBoxText}><strong>5 working days</strong> delivery via express courier.</p>
              </div>
              <div className={styles.infoBox}>
                <div className={styles.infoBoxTitle}>Outside Dhaka</div>
                <p className={styles.infoBoxText}><strong>10 working days</strong> delivery across all 64 districts in Bangladesh.</p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
