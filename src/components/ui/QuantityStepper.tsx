'use client';
import { Minus, Plus } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import styles from './QuantityStepper.module.css';

interface QuantityStepperProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  label?: string;
  className?: string;
}

export default function QuantityStepper({
  value,
  onChange,
  min = 1,
  max,
  label = 'Quantity',
  className,
}: QuantityStepperProps) {
  const [draft, setDraft] = useState(String(value));
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setDraft(String(value));
  }, [value]);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  const commit = (next: number) => {
    let safe = Math.max(min, Math.floor(next));
    if (max !== undefined) safe = Math.min(max, safe);
    if (Number.isInteger(safe)) {
      setDraft(String(safe));
      if (safe !== value) onChange(safe);
    }
  };

  const clearTimer = () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
  };

  return (
    <div className={`${styles.control} ${className ?? ''}`} role="group" aria-label={label}>
      <button type="button" className={styles.button} aria-label={`Decrease ${label}`} onClick={() => commit(value - 1)} disabled={value <= min}>
        <Minus size={13} />
      </button>
      <input
        type="number"
        min={min}
        max={max}
        step="1"
        className={styles.input}
        aria-label={label}
        value={draft}
        onChange={event => {
          const nextDraft = event.target.value;
          setDraft(nextDraft);
          clearTimer();
          const next = Number(nextDraft);
          if (nextDraft !== '' && Number.isInteger(next) && next >= min && (max === undefined || next <= max)) {
            timer.current = setTimeout(() => commit(next), 250);
          }
        }}
        onBlur={() => {
          clearTimer();
          const next = Number(draft);
          commit(Number.isInteger(next) && next >= min ? next : value);
        }}
      />
      <button type="button" className={styles.button} aria-label={`Increase ${label}`} onClick={() => commit(value + 1)} disabled={max !== undefined && value >= max}>
        <Plus size={13} />
      </button>
    </div>
  );
}
