'use client';
import Link from 'next/link';
import { CheckCircle2, ArrowRight, Package } from 'lucide-react';
import { motion } from 'framer-motion';
import styles from './success.module.css';

export default function CheckoutSuccessPage() {
  return (
    <div className={styles.successPage}>
      <div className="container">
        <motion.div className={styles.card} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}>
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}>
            <CheckCircle2 size={72} className={styles.icon} />
          </motion.div>
          <h1>Order Placed Successfully!</h1>
          <p className="text-muted">Thank you for your purchase. Your order has been received and is being processed.</p>
          <div className={styles.orderInfo}>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Order Number</span>
              <span className={styles.infoValue}>#ET-{Date.now().toString().slice(-6)}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Status</span>
              <span className="badge badge-warning">Processing</span>
            </div>
          </div>
          <div className={styles.actions}>
            <Link href="/products" className="btn btn-primary btn-lg">
              Continue Shopping <ArrowRight size={18} />
            </Link>
            <Link href="/" className="btn btn-outline">
              <Package size={18} /> Go to Homepage
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
