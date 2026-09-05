'use client';
import React, { useState } from 'react';
import { Trash2, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/store/useAuthStore';
import styles from '@/app/compliance.module.css';

interface SectionDeleteButtonProps {
  sectionTitle: string;
  onDelete: () => Promise<void>;
}

export default function SectionDeleteButton({ sectionTitle, onDelete }: SectionDeleteButtonProps) {
  const { user, isHydrated } = useAuthStore();
  const isAdmin = isHydrated && user?.role === 'Admin';
  const [deleting, setDeleting] = useState(false);

  if (!isAdmin) return null;

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const confirmed = window.confirm(`Are you sure you want to delete "${sectionTitle || 'this section'}"?`);
    if (!confirmed) return;

    setDeleting(true);
    try {
      await onDelete();
      toast.success('Section deleted');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to delete section';
      toast.error(msg);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <button
      type="button"
      className={styles.deleteSectionBtn}
      onClick={handleDelete}
      disabled={deleting}
      title="Delete this section"
      aria-label="Delete this section"
    >
      {deleting ? (
        <Loader2 size={12} className="animate-spin" />
      ) : (
        <Trash2 size={12} />
      )}
      <span>Remove</span>
    </button>
  );
}
