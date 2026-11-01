'use client';
import { usePolicyPage } from '@/hooks/usePolicyPage';
import styles from './HomeInfiniteBanner.module.css';

const DEFAULT_BANNER_ITEMS = [
  { order: 1, title: '100% Genuine Products', body: 'Direct from authorized brand distributors', highlightTitle: 'GENUINE', highlightText: '🛡️' },
  { order: 2, title: 'Express Fast Delivery', body: 'Inside Dhaka 5 Days • Nationwide 10 Days', highlightTitle: 'EXPRESS', highlightText: '🚚' },
  { order: 3, title: '7-10 Days Return & Exchange', body: 'Hassle-free replacement guarantee', highlightTitle: 'EXCHANGE', highlightText: '🔄' },
  { order: 4, title: '0% EMI Facility Available', body: 'Up to 36 months on major credit cards', highlightTitle: '0% EMI', highlightText: '💳' },
  { order: 5, title: '24/7 Expert Technical Support', body: 'Certified security engineers on standby', highlightTitle: 'SUPPORT', highlightText: '🎧' },
  { order: 6, title: 'Professional On-Site Installation', body: 'Nationwide setup and warranty coverage', highlightTitle: 'SETUP', highlightText: '⚡' },
];

const PRODUCT_SCROLL_DURATION_SECONDS = 96;
const PRODUCT_SCROLL_CYCLE_ITEM_COUNT = 9;

export default function HomeInfiniteBanner() {
  const { page } = usePolicyPage('home-banner');

  const rawSections = page?.sections && page.sections.length > 0 ? page.sections : DEFAULT_BANNER_ITEMS;
  const items = [...rawSections].sort((a, b) => a.order - b.order);
  const scrollDuration = (PRODUCT_SCROLL_DURATION_SECONDS * items.length) / PRODUCT_SCROLL_CYCLE_ITEM_COUNT;

  const renderItems = (keyPrefix: string) =>
    items.map((item, idx) => (
      <div key={`${keyPrefix}-${item.order}-${idx}`} className={styles.bannerItem}>
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
    ));

  return (
    <div className={styles.bannerWrapper} aria-label="Store Announcements and Guarantees">
      <div className={styles.marqueeContainer}>
        <div className={styles.marqueeTrack} style={{ animationDuration: `${scrollDuration}s` }}>
          <div className={styles.marqueeGroup}>{renderItems('first')}</div>
          <div className={styles.marqueeGroup} aria-hidden="true">{renderItems('second')}</div>
        </div>
      </div>
    </div>
  );
}
