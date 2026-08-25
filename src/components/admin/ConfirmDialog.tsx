'use client';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/shadcn';
import styles from './ConfirmDialog.module.css';

interface Props {
  title: string;
  message: string;
  confirmLabel?: string;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({ title, message, confirmLabel = 'Delete', loading = false, onConfirm, onCancel }: Props) {
  return (
    <div className={styles.overlay} onClick={onCancel}>
      <div className={styles.dialog} onClick={e => e.stopPropagation()} role="alertdialog" aria-modal="true" aria-labelledby="confirm-dialog-title">
        <div className={styles.header}>
          <AlertTriangle size={20} className={styles.icon} />
          <span className={styles.title} id="confirm-dialog-title">{title}</span>
        </div>
        <p className={styles.message}>{message}</p>
        <div className={styles.actions}>
          <Button variant="ghost" onClick={onCancel} disabled={loading}>Cancel</Button>
          <Button variant="destructive" onClick={onConfirm} loading={loading}>{confirmLabel}</Button>
        </div>
      </div>
    </div>
  );
}
