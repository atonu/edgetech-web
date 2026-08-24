import { Skeleton } from '@/components/ui/Skeleton';
import styles from './ProductCard.module.css';

export default function ProductCardSkeleton() {
  return (
    <div className={styles.card} aria-hidden="true">
      <div className={styles.imageWrap}>
        <Skeleton height="100%" radius="0" style={{ position: 'absolute', inset: 0 }} />
      </div>
      <div className={styles.info}>
        <div className={styles.meta}>
          <Skeleton width="35%" height="0.72rem" />
          <Skeleton width="25%" height="1.2rem" radius="var(--radius-full)" />
        </div>
        <Skeleton width="90%" height="0.9rem" style={{ marginBottom: 6 }} />
        <Skeleton width="60%" height="0.9rem" style={{ marginBottom: 10 }} />
        <Skeleton width="45%" height="0.8rem" style={{ marginBottom: 10 }} />
        <Skeleton width="40%" height="1.1rem" />
      </div>
    </div>
  );
}
