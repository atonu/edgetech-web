'use client';
import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2, ArrowRight, Package } from 'lucide-react';
import { motion } from 'framer-motion';
import styles from './success.module.css';

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderNumberParam = searchParams.get('orderNumber');
  const displayOrderNumber = orderNumberParam
    ? (orderNumberParam.startsWith('#') ? orderNumberParam : `#${orderNumberParam}`)
    : `#ET-${Date.now().toString().slice(-6)}`;

  return (
    <div className={styles.card}>
      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}>
        <CheckCircle2 size={72} className={styles.icon} />
      </motion.div>
      <h1>Order Placed Successfully!</h1>
      <p className="text-muted">Thank you for your purchase. Your order has been received and is being processed.</p>
      <div className={styles.orderInfo}>
        <div className={styles.infoItem}>
          <span className={styles.infoLabel}>Order Number</span>
          <span className={styles.infoValue}>{displayOrderNumber}</span>
        </div>
        <div className={styles.infoItem}>
          <span className={styles.infoLabel}>Status</span>
          <span className="badge badge-warning">Placed</span>
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
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <div className={styles.successPage}>
      <div className="container">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}>
          <Suspense fallback={<div className={styles.card}><h1>Order Placed Successfully!</h1></div>}>
            <SuccessContent />
          </Suspense>
        </motion.div>
      </div>
    </div>
  );
}
