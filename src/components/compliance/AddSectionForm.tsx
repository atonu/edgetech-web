'use client';
import React, { useState } from 'react';
import { Plus, Check, X, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/store/useAuthStore';
import styles from '@/app/compliance.module.css';

interface AddSectionFormProps {
  onAddSection: (data: {
    title: string;
    body: string;
    highlightTitle?: string;
    highlightText?: string;
  }) => Promise<void>;
}

export default function AddSectionForm({ onAddSection }: AddSectionFormProps) {
  const { user, isHydrated } = useAuthStore();
  const isAdmin = isHydrated && user?.role === 'Admin';

  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [highlightTitle, setHighlightTitle] = useState('');
  const [highlightText, setHighlightText] = useState('');
  const [showHighlight, setShowHighlight] = useState(false);
  const [saving, setSaving] = useState(false);

  if (!isAdmin) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error('Please enter a section title');
      return;
    }

    setSaving(true);
    try {
      await onAddSection({
        title: title.trim(),
        body: body.trim(),
        highlightTitle: showHighlight && highlightTitle.trim() ? highlightTitle.trim() : undefined,
        highlightText: showHighlight && highlightText.trim() ? highlightText.trim() : undefined,
      });
      toast.success('Section added successfully');
      setTitle('');
      setBody('');
      setHighlightTitle('');
      setHighlightText('');
      setShowHighlight(false);
      setIsOpen(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to add section';
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.addSectionContainer}>
      {!isOpen ? (
        <button
          type="button"
          className={styles.addBtn}
          onClick={() => setIsOpen(true)}
        >
          <Plus size={18} /> + ADD
        </button>
      ) : (
        <form onSubmit={handleSubmit} className={styles.addSectionForm}>
          <div>
            <label className={styles.formLabel}>TITLE</label>
            <input
              type="text"
              className={styles.formInput}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. 8. Return Window & Exclusions"
              autoFocus
              required
            />
          </div>

          <div>
            <label className={styles.formLabel}>Body</label>
            <textarea
              className={styles.formTextarea}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Enter section content and paragraphs..."
              rows={4}
            />
          </div>

          <div>
            <button
              type="button"
              className={styles.btnCancel}
              onClick={() => setShowHighlight(!showHighlight)}
              style={{ fontSize: '0.8rem', padding: '4px 10px', marginBottom: '8px' }}
            >
              {showHighlight ? '- Remove Highlight Box' : '+ Add Highlight Box (Optional)'}
            </button>

            {showHighlight && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '6px' }}>
                <input
                  type="text"
                  className={styles.formInput}
                  value={highlightTitle}
                  onChange={(e) => setHighlightTitle(e.target.value)}
                  placeholder="Highlight Box Title (e.g. Important Notice)"
                />
                <textarea
                  className={styles.formTextarea}
                  value={highlightText}
                  onChange={(e) => setHighlightText(e.target.value)}
                  placeholder="Highlight Box Details..."
                  rows={2}
                />
              </div>
            )}
          </div>

          <div className={styles.formActions}>
            <button
              type="button"
              className={styles.btnCancel}
              onClick={() => setIsOpen(false)}
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
                  Save Section
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
