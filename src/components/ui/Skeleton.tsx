import styles from './Skeleton.module.css';

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  radius?: string;
  className?: string;
  style?: React.CSSProperties;
}

export function Skeleton({ width, height, radius, className, style }: SkeletonProps) {
  return (
    <span
      className={`${styles.skeleton} ${className ?? ''}`}
      style={{
        width: width ?? '100%',
        height: height ?? '1em',
        borderRadius: radius,
        ...style,
      }}
    />
  );
}
