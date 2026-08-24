import styles from './Spinner.module.css';

interface SpinnerProps {
  size?: number;
  className?: string;
}

export function Spinner({ size = 16, className }: SpinnerProps) {
  return (
    <span
      className={`${styles.spinner} ${className ?? ''}`}
      style={{ width: size, height: size }}
      role="status"
      aria-label="Loading"
    />
  );
}
