'use client';
import { usePolicyPage } from '@/hooks/usePolicyPage';
import { AlertCircle } from 'lucide-react';
import styles from './ProductBannerSection.module.css';

interface ProductBannerSectionProps {
  productNotes?: string | null;
}

const DEFAULT_PRODUCT_BANNER_ITEMS = [
  { order: 1, title: 'Fast Delivery', body: 'Inside Dhaka 5 Days • Outside Dhaka 10 Days nationwide express shipping.', highlightTitle: 'DELIVERY', highlightText: '🚚' },
  { order: 2, title: 'Official Warranty', body: '100% Genuine product with authorized brand warranty support.', highlightTitle: 'WARRANTY', highlightText: '🛡️' },
  { order: 3, title: 'Easy Exchange', body: '7 to 10 working days hassle-free return and exchange guarantee.', highlightTitle: 'EXCHANGE', highlightText: '🔄' },
];

export default function ProductBannerSection({ productNotes }: ProductBannerSectionProps) {
  const { page } = usePolicyPage('product-banner');

  const rawSections = page?.sections && page.sections.length > 0 ? page.sections : DEFAULT_PRODUCT_BANNER_ITEMS;
  const items = [...rawSections].sort((a, b) => a.order - b.order);

  return (
    <div className={styles.bannerContainer}>
      {/* Product Banner Items (Editable via Admin > Banners > Product Banners) */}
      <div className={styles.bannerList}>
        {items.map(item => (
          <div key={item.order} className={styles.bannerItem}>
            {item.highlightText && <span className={styles.itemIcon}>{item.highlightText}</span>}
            <div className={styles.itemContent}>
              <div className={styles.itemHeader}>
                <span className={styles.itemTitle}>{item.title}</span>
                {item.highlightTitle && <span className={styles.itemTag}>{item.highlightTitle}</span>}
              </div>
              {item.body && <p className={styles.itemBody}>{item.body}</p>}
            </div>
          </div>
        ))}
      </div>

      {/* Dynamic Product Notice (Powered by Admin Product Notes field) */}
      {productNotes && productNotes.trim().length > 0 && (
        <div className={styles.dynamicNotice}>
          <AlertCircle size={18} className={styles.noticeIcon} />
          <div className={styles.noticeContent}>
            <span className={styles.noticeTitle}>Special Product Note & Instructions</span>
            <p className={styles.noticeText}>{productNotes}</p>
          </div>
        </div>
      )}
    </div>
  );
}
