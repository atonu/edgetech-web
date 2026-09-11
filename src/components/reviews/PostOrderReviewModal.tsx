'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Star, X, Check, Zap, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { reviewsApi } from '@/lib/api';
import { getImageUrl } from '@/lib/imageUrl';
import toast from 'react-hot-toast';
import styles from './PostOrderReviewModal.module.css';

export interface PurchasedProductItem {
  productId: number;
  name: string;
  image?: string;
}

interface Props {
  isOpen: boolean;
  items: PurchasedProductItem[];
  onClose: () => void;
}

const RATING_LABELS: Record<number, string> = {
  1: '1 Star - Poor',
  2: '2 Stars - Fair',
  3: '3 Stars - Good',
  4: '4 Stars - Very Good',
  5: '5 Stars - Excellent',
};

export default function PostOrderReviewModal({ isOpen, items, onClose }: Props) {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [ratings, setRatings] = useState<Record<number, number>>({});
  const [comments, setComments] = useState<Record<number, string>>({});
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [reviewedProductIds, setReviewedProductIds] = useState<Set<number>>(new Set());

  if (!isOpen || items.length === 0) return null;

  const currentItem = items[selectedIdx] || items[0];
  const currentRating = ratings[currentItem.productId] ?? 5;
  const currentComment = comments[currentItem.productId] ?? '';
  const isCurrentReviewed = reviewedProductIds.has(currentItem.productId);

  const handleRatingChange = (productId: number, rating: number) => {
    setRatings(prev => ({ ...prev, [productId]: rating }));
  };

  const handleCommentChange = (productId: number, comment: string) => {
    setComments(prev => ({ ...prev, [productId]: comment }));
  };

  const handleSubmitCurrent = async () => {
    setSubmitting(true);
    try {
      await reviewsApi.add(currentItem.productId, {
        rating: currentRating,
        comment: currentComment.trim() || undefined,
      });

      toast.success(`Thank you! Review submitted for ${currentItem.name}`);
      const nextReviewed = new Set(reviewedProductIds);
      nextReviewed.add(currentItem.productId);
      setReviewedProductIds(nextReviewed);

      // Check if there are other unreviewed items
      const nextUnreviewedIdx = items.findIndex((item, idx) => !nextReviewed.has(item.productId) && idx !== selectedIdx);
      if (nextUnreviewedIdx !== -1) {
        setSelectedIdx(nextUnreviewedIdx);
      } else {
        // All done! Close modal smoothly
        setTimeout(() => {
          onClose();
        }, 600);
      }
    } catch {
      toast.error('Failed to submit review. You can try again from the product page.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className={styles.backdrop} onClick={onClose}>
        <motion.div
          className={styles.modal}
          onClick={e => e.stopPropagation()}
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ duration: 0.2 }}
        >
          {/* Header */}
          <div className={styles.modalHeader}>
            <div>
              <h2 className={styles.headerTitle}>Rate Your Experience</h2>
              <p className={styles.headerSubtitle}>
                Help other customers by sharing your quick review and rating.
              </p>
            </div>
            <button
              type="button"
              className={styles.closeBtn}
              onClick={onClose}
              aria-label="Close modal"
            >
              <X size={20} />
            </button>
          </div>

          {/* Body */}
          <div className={styles.modalBody}>
            {/* Multiple product tabs if order had more than 1 item */}
            {items.length > 1 && (
              <div className={styles.productSelector}>
                {items.map((item, idx) => (
                  <button
                    key={item.productId}
                    type="button"
                    className={`${styles.productTab} ${selectedIdx === idx ? styles.productTabActive : ''}`}
                    onClick={() => {
                      setSelectedIdx(idx);
                      setHoverRating(null);
                    }}
                  >
                    {reviewedProductIds.has(item.productId) && (
                      <Check size={12} color="var(--color-success)" />
                    )}
                    <span>{item.name}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Current Product Card */}
            <div className={styles.productCard}>
              <div className={styles.productImage}>
                {currentItem.image ? (
                  <Image
                    src={getImageUrl(currentItem.image)!}
                    alt={currentItem.name}
                    fill
                    sizes="56px"
                    style={{ objectFit: 'cover' }}
                  />
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                    <Zap size={22} color="var(--color-primary)" />
                  </div>
                )}
              </div>
              <div className={styles.productInfo}>
                <h4 className={styles.productName}>{currentItem.name}</h4>
                {isCurrentReviewed && (
                  <span style={{ fontSize: '0.78rem', color: 'var(--color-success)', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    <Check size={12} /> Review Submitted
                  </span>
                )}
              </div>
            </div>

            {/* Rating Stars Picker */}
            <div className={styles.ratingSection}>
              <span className={styles.ratingLabel}>Select your rating:</span>
              <div className={styles.starsRow}>
                {Array.from({ length: 5 }).map((_, i) => {
                  const starValue = i + 1;
                  const active = starValue <= (hoverRating ?? currentRating);
                  return (
                    <button
                      key={i}
                      type="button"
                      className={`${styles.starBtn} ${active ? styles.starFilled : ''}`}
                      onMouseEnter={() => setHoverRating(starValue)}
                      onMouseLeave={() => setHoverRating(null)}
                      onClick={() => handleRatingChange(currentItem.productId, starValue)}
                      title={`${starValue} Stars`}
                    >
                      <Star size={28} fill={active ? 'currentColor' : 'none'} />
                    </button>
                  );
                })}
              </div>
              <span className={styles.ratingBadge}>
                {RATING_LABELS[hoverRating ?? currentRating]}
              </span>
            </div>

            {/* Comment Textarea */}
            <div className={styles.commentField}>
              <label className={styles.commentLabel}>Review comment (optional):</label>
              <textarea
                className={styles.textarea}
                placeholder="What did you like about this product? How was the performance?"
                value={currentComment}
                onChange={e => handleCommentChange(currentItem.productId, e.target.value)}
                rows={3}
              />
            </div>
          </div>

          {/* Footer */}
          <div className={styles.modalFooter}>
            <button
              type="button"
              className={styles.cancelBtn}
              onClick={onClose}
            >
              Skip / Maybe Later
            </button>
            <button
              type="button"
              className={styles.submitBtn}
              onClick={handleSubmitCurrent}
              disabled={submitting || isCurrentReviewed}
            >
              {submitting ? 'Submitting...' : isCurrentReviewed ? 'Reviewed' : 'Submit Review'}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
