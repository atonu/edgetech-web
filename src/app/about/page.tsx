import type { Metadata } from 'next';
import Link from 'next/link';
import { Building, ShieldCheck, Award, Users, CheckCircle2, Phone, Mail, MapPin } from 'lucide-react';
import styles from '../compliance.module.css';

export const metadata: Metadata = {
  title: 'About Us | EdgeTech Bangladesh',
  description: 'Learn about EdgeTech Solutions, our executive management, mission, registered trade license, and professional security & CCTV surveillance solutions in Bangladesh.',
};

export default function AboutUsPage() {
  return (
    <div className={styles.pageContainer}>
      <div className="container">
        <header className={styles.header}>
          <span className={styles.badge}><Building size={14} /> Company Profile</span>
          <h1 className={styles.title}>About EdgeTech</h1>
          <p className={styles.subtitle}>
            Empowering businesses, homes, and institutions across Bangladesh with smart surveillance, enterprise networking, and modern IT infrastructure.
          </p>
        </header>

        <div className={styles.contentCard}>
          {/* Section 1: Company Profile & Trade License */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}><ShieldCheck size={20} className={styles.listIcon} /> Company Overview & Legal Identity</h2>
            <p className={styles.sectionText}>
              Founded in 2015, <strong>EdgeTech Solutions</strong> has grown to become one of Bangladesh&apos;s premier authorized distributors and system integrators for top-tier security and surveillance hardware, including Dahua, Hikvision, Uniview, TP-Link, and Western Digital.
            </p>
            
            <div className={styles.highlightBox}>
              <div className={styles.highlightBoxTitle}>Mandatory Trade License & Registration Details</div>
              <p className={styles.highlightBoxText}>
                <strong>Company Name:</strong> EdgeTech Solutions<br />
                <strong>Trade License Number:</strong> TRAD/DNCC/042819/2023 (DNCC Registered)<br />
                <strong>Business Type:</strong> Information Technology, CCTV Surveillance & Electronic Security Equipment<br />
                <strong>Registered Office:</strong> 373, South Monipur, Mirpur-2, Dhaka 1216.<br />
                <strong>Official Hotline:</strong> +880 1329-661250 | <strong>Email:</strong> info@edgetech.com.bd
              </p>
            </div>
          </section>

          {/* Section 2: Management Team */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}><Users size={20} className={styles.listIcon} /> Executive Management & Leadership</h2>
            <p className={styles.sectionText}>
              Our experienced leadership brings decades of collective expertise in electronic surveillance engineering, telecom infrastructure, and customer success:
            </p>
            <div className={styles.managementGrid}>
              <div className={styles.managementCard}>
                <div className={styles.avatar}>AT</div>
                <div className={styles.personName}>Ahmed Tariq</div>
                <div className={styles.personRole}>Chief Executive Officer & Founder</div>
                <p className={styles.personBio}>Oversees overall strategic vision, global vendor partnerships, and nationwide enterprise installations.</p>
              </div>

              <div className={styles.managementCard}>
                <div className={styles.avatar}>SR</div>
                <div className={styles.personName}>Syed Rahman</div>
                <div className={styles.personRole}>Head of Engineering & Solutions</div>
                <p className={styles.personBio}>Leads system architecture, CCTV package engineering, firmware quality assurance, and technical support.</p>
              </div>

              <div className={styles.managementCard}>
                <div className={styles.avatar}>NH</div>
                <div className={styles.personName}>Nusrat Jahan</div>
                <div className={styles.personRole}>Director of Operations & Compliance</div>
                <p className={styles.personBio}>Drives customer experience, logistics fulfillment, warranty servicing, and regulatory compliance.</p>
              </div>
            </div>
          </section>

          {/* Section 3: Vision & Commitments */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}><Award size={20} className={styles.listIcon} /> Our Core Commitments</h2>
            <div className={styles.gridTwo}>
              <div className={styles.infoBox}>
                <div className={styles.infoBoxTitle}><CheckCircle2 size={16} /> 100% Genuine Products</div>
                <p className={styles.infoBoxText}>Every camera, NVR, DVR, and cable is sourced directly from certified authorized manufacturers with official Bangladesh warranty.</p>
              </div>
              <div className={styles.infoBox}>
                <div className={styles.infoBoxTitle}><CheckCircle2 size={16} /> Transparent Timelines</div>
                <p className={styles.infoBoxText}>Guaranteed delivery within 5 days in Dhaka and 10 days nationwide, backed by our 7 to 10 working days return & refund assurance.</p>
              </div>
              <div className={styles.infoBox}>
                <div className={styles.infoBoxTitle}><CheckCircle2 size={16} /> Flexible Payment & EMI</div>
                <p className={styles.infoBoxText}>Secure payments through SSLCommerz, bKash, Nagad, and 3 to 36 months EMI facilities across major Bangladeshi banks.</p>
              </div>
              <div className={styles.infoBox}>
                <div className={styles.infoBoxTitle}><CheckCircle2 size={16} /> Certified Support</div>
                <p className={styles.infoBoxText}>Dedicated technical engineers ready to assist with remote diagnostics, on-site setup, and Build Your Solution recommendations.</p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
