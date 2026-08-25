import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/shadcn';
import styles from './AdminPagination.module.css';

interface Props {
  page: number;
  totalPages: number;
  totalCount: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

export default function AdminPagination({ page, totalPages, totalCount, pageSize, onPageChange }: Props) {
  if (totalCount === 0) return null;

  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, totalCount);

  return (
    <div className={styles.pagination}>
      <span className={styles.info}>
        Showing {start}–{end} of {totalCount}
      </span>
      <div className={styles.controls}>
        <Button size="sm" variant="ghost" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
          <ChevronLeft size={14} /> Prev
        </Button>
        <span className={styles.pageIndicator}>Page {page} of {totalPages}</span>
        <Button size="sm" variant="ghost" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>
          Next <ChevronRight size={14} />
        </Button>
      </div>
    </div>
  );
}
