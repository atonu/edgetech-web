'use client';
import { usePolicyPage } from '@/hooks/usePolicyPage';
import { AlertCircle } from 'lucide-react';
import styles from './ProductBannerSection.module.css';

interface ProductBannerSectionProps {
  productNotes?: string | null;
}

const DEFAULT_PRODUCT_BANNER_ITEMS = [
  { order: 1, title: 'Express Fast Delivery', body: 'Inside Dhaka 5 Days • Nationwide 10 Days', highlightTitle: 'DELIVERY', highlightText: '🚚' },
  { order: 2, title: 'Official Brand Warranty', body: '100% Genuine with manufacturer warranty support', highlightTitle: 'WARRANTY', highlightText: '🛡️' },
  { order: 3, title: '7-10 Days Return & Exchange', body: 'Hassle-free replacement guarantee', highlightTitle: 'EXCHANGE', highlightText: '🔄' },
];

export default function ProductBannerSection({ productNotes }: ProductBannerSectionProps) {
  const { page } = usePolicyPage('product-banner');

  const rawSections = page?.sections && page.sections.length > 0 ? page.sections : DEFAULT_PRODUCT_BANNER_ITEMS;
  const items = [...rawSections].sort((a, b) => a.order - b.order);

  // Duplicate items to ensure smooth continuous marquee loop across all widths
  const renderItems = [...items, ...items, ...items];

  return (
    <div className={styles.sectionContainer}>
      {/* Infinite Marquee Loop Banner */}
      <div className={styles.marqueeWrapper} aria-label="Product Guarantees and Services">
        <div className={styles.marqueeContainer}>
          {/* Track 1 */}
          <div className={styles.marqueeTrack}>
            {renderItems.map((item, idx) => (
              <div key={`p-track1-${item.order}-${idx}`} className={styles.bannerItem}>
                {item.highlightText && <span className={styles.itemIcon}>{item.highlightText}</span>}
                <div className={styles.itemTextGroup}>
                  {item.highlightTitle && <span className={styles.itemTag}>{item.highlightTitle}</span>}
                  <span className={styles.itemTitle}>{item.title}</span>
                  {item.body && (
                    <>
                      <span className={styles.itemDot}>•</span>
                      <span className={styles.itemBody}>{item.body}</span>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Track 2 (for seamless continuous loop) */}
          <div className={styles.marqueeTrack} aria-hidden="true">
            {renderItems.map((item, idx) => (
              <div key={`p-track2-${item.order}-${idx}`} className={styles.bannerItem}>
                {item.highlightText && <span className={styles.itemIcon}>{item.highlightText}</span>}
                <div className={styles.itemTextGroup}>
                  {item.highlightTitle && <span className={styles.itemTag}>{item.highlightTitle}</span>}
                  <span className={styles.itemTitle}>{item.title}</span>
                  {item.body && (
                    <>
                      <span className={styles.itemDot}>•</span>
                      <span className={styles.itemBody}>{item.body}</span>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Dynamic Product Notice (Powered by Admin Product Notes field) */}
      {productNotes && productNotes.trim().length > 0 && (
        <div className={styles.dynamicNotice}>
          <AlertCircle size={18} className={styles.noticeIcon} />
          <div className={styles.noticeContent}>
            <span className={styles.noticeTitle}>Special Product Note</span>
            <p className={styles.noticeText}>{productNotes}</p>
          </div>
        </div>
      )}
    </div>
  );
}
