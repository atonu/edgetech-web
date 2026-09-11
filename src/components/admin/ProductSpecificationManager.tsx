'use client';

import React from 'react';
import { Plus, Trash2, ArrowUp, ArrowDown, Sparkles } from 'lucide-react';
import { Input, Button } from '@/components/ui/shadcn';
import styles from './ProductSpecificationManager.module.css';

export interface SpecificationItem {
  id?: number;
  key: string;
  value: string;
  displayOrder?: number;
}

interface Props {
  specifications: SpecificationItem[];
  onChange: (specs: SpecificationItem[]) => void;
}

const COMMON_SPEC_KEYS = [
  'Resolution',
  'Camera Sensor',
  'Lens',
  'Night Vision / IR Range',
  'Video Compression',
  'Audio / Microphone',
  'Connectivity / Interface',
  'Power Supply',
  'Storage / Card Slot',
  'Ingress Protection (IP)',
  'Operating Temperature',
  'Warranty',
];

export default function ProductSpecificationManager({ specifications, onChange }: Props) {
  const handleAddSpec = (initialKey = '') => {
    onChange([
      ...specifications,
      {
        key: initialKey,
        value: '',
        displayOrder: specifications.length,
      },
    ]);
  };

  const handleUpdateSpec = (index: number, field: 'key' | 'value', value: string) => {
    const updated = [...specifications];
    updated[index] = {
      ...updated[index],
      [field]: value,
    };
    onChange(updated);
  };

  const handleRemoveSpec = (index: number) => {
    const updated = specifications.filter((_, i) => i !== index);
    onChange(updated);
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= specifications.length) return;

    const updated = [...specifications];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    onChange(updated);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <span className={styles.title}>Product Specifications</span>
          <span className={styles.countBadge}>{specifications.length} items</span>
        </div>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => handleAddSpec()}
        >
          <Plus size={14} style={{ marginRight: 4 }} /> Add Specification
        </Button>
      </div>

      {/* Suggested Quick Keys */}
      <div className={styles.suggestedSection}>
        <div className={styles.suggestedLabel}>
          <Sparkles size={12} /> Suggested Spec Attributes:
        </div>
        <div className={styles.suggestedPills}>
          {COMMON_SPEC_KEYS.map((keyName) => {
            const isAlreadyAdded = specifications.some(
              (s) => s.key.toLowerCase().trim() === keyName.toLowerCase().trim()
            );
            return (
              <button
                key={keyName}
                type="button"
                className={styles.pillBtn}
                onClick={() => handleAddSpec(keyName)}
                title={isAlreadyAdded ? 'Already added (click to add another)' : `Add ${keyName}`}
              >
                + {keyName}
              </button>
            );
          })}
        </div>
      </div>

      {/* Spec list */}
      {specifications.length === 0 ? (
        <div className={styles.emptyState}>
          <div>No technical specifications added yet.</div>
          <div className={styles.emptySubtext}>
            Add key-value specifications (like Resolution, Lens, Warranty) to help customers evaluate this product.
          </div>
          <button
            type="button"
            className={styles.addBtn}
            onClick={() => handleAddSpec()}
          >
            <Plus size={14} /> Add First Specification
          </button>
        </div>
      ) : (
        <div className={styles.specList}>
          {specifications.map((spec, idx) => (
            <div key={spec.id ? `spec-${spec.id}` : `idx-${idx}`} className={styles.specRow}>
              <div className={styles.specIndex}>#{idx + 1}</div>
              <div className={styles.rowInputs}>
                <Input
                  placeholder="Specification Name (e.g. Resolution)"
                  value={spec.key}
                  onChange={(e) => handleUpdateSpec(idx, 'key', e.target.value)}
                />
                <Input
                  placeholder="Specification Value (e.g. 4MP 2560x1440)"
                  value={spec.value}
                  onChange={(e) => handleUpdateSpec(idx, 'value', e.target.value)}
                />
              </div>

              <div className={styles.reorderButtons}>
                <button
                  type="button"
                  className={styles.iconBtn}
                  title="Move Up"
                  disabled={idx === 0}
                  onClick={() => handleMove(idx, 'up')}
                >
                  <ArrowUp size={14} />
                </button>
                <button
                  type="button"
                  className={styles.iconBtn}
                  title="Move Down"
                  disabled={idx === specifications.length - 1}
                  onClick={() => handleMove(idx, 'down')}
                >
                  <ArrowDown size={14} />
                </button>
              </div>

              <button
                type="button"
                className={`${styles.iconBtn} ${styles.deleteBtn}`}
                title="Remove specification"
                onClick={() => handleRemoveSpec(idx)}
              >
                <Trash2 size={15} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
