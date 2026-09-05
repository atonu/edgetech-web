'use client';
import React, { useState } from 'react';
import { Pencil, X, Check, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/store/useAuthStore';
import styles from '@/app/compliance.module.css';

interface AdminEditableTextProps {
  value: string;
  onSave: (newValue: string) => Promise<void>;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'span' | 'div' | 'strong';
  className?: string;
  style?: React.CSSProperties;
  multiline?: boolean;
  label?: string;
  children?: React.ReactNode;
  iconPrefix?: React.ReactNode;
}

export default function AdminEditableText({
  value,
  onSave,
  as: Component = 'span',
  className,
  style,
  multiline = false,
  label = 'Content',
  children,
  iconPrefix,
}: AdminEditableTextProps) {
  const { user, isHydrated } = useAuthStore();
  const isAdmin = isHydrated && user?.role === 'Admin';

  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const [saving, setSaving] = useState(false);

  const displayValue = value || (typeof children === 'string' ? children : '');

  if (!isAdmin) {
    return (
      <Component className={className} style={style}>
        {iconPrefix}
        {children || displayValue}
      </Component>
    );
  }

  const handleOpen = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDraft(value || (typeof children === 'string' ? children : ''));
    setIsEditing(true);
  };

  const handleClose = () => {
    if (saving) return;
    setIsEditing(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave(draft);
      toast.success(`${label} updated`);
      setIsEditing(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update';
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Component className={className} style={style}>
        {iconPrefix}
        <span>{children || displayValue}</span>
        <button
          type="button"
          className={styles.editIconBtn}
          onClick={handleOpen}
          title={`Edit ${label}`}
          aria-label={`Edit ${label}`}
        >
          <Pencil size={11} />
        </button>
      </Component>

      {isEditing && (
        <div className={styles.editModalBackdrop} onClick={handleClose}>
          <div className={styles.editModal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.editModalHeader}>
              <span>Edit {label}</span>
              <button
                type="button"
                className={styles.btnCancel}
                onClick={handleClose}
                style={{ padding: '4px 8px', display: 'inline-flex', alignItems: 'center' }}
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {multiline ? (
                <textarea
                  className={styles.formTextarea}
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  rows={5}
                  autoFocus
                  placeholder={`Enter ${label.toLowerCase()}...`}
                />
              ) : (
                <input
                  type="text"
                  className={styles.formInput}
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  autoFocus
                  placeholder={`Enter ${label.toLowerCase()}...`}
                />
              )}

              <div className={styles.formActions}>
                <button
                  type="button"
                  className={styles.btnCancel}
                  onClick={handleClose}
                  disabled={saving}
                >
                  Cancel
                </button>
                <button type="submit" className={styles.btnSave} disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2 size={14} className="animate-spin" style={{ display: 'inline', marginRight: 6 }} />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Check size={14} style={{ display: 'inline', marginRight: 4 }} />
                      Save
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
