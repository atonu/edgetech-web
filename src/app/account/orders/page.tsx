'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { OrderDto, ordersApi } from '@/lib/api';
import { useAuthStore } from '@/store/useAuthStore';
import { Skeleton } from '@/components/ui/Skeleton';
import styles from '../account.module.css';

export default function AccountOrdersPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [orders, setOrders] = useState<OrderDto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/auth/login');
      return;
    }

    ordersApi.getMyOrders()
      .then(res => setOrders(res.data ?? []))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className={styles.accountPage}>
      <div className="container">
        <div className={styles.header}>
          <h1>My Orders</h1>
          <p className={styles.muted}>Track your placed orders and statuses.</p>
        </div>

        <div className={styles.card}>
          {loading ? (
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Order</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Total</th>
                    <th>Items</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.from({ length: 4 }).map((_, i) => (
                    <tr key={`order-skeleton-${i}`}>
                      <td><Skeleton width="3rem" /></td>
                      <td><Skeleton width="5rem" /></td>
                      <td><Skeleton width="4rem" /></td>
                      <td><Skeleton width="3rem" /></td>
                      <td><Skeleton width="2rem" /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : orders.length === 0 ? (
            <>
              <p className={styles.muted}>You have no orders yet.</p>
              <div className={styles.actions}>
                <Link href="/products" className="btn btn-primary">Shop Products</Link>
              </div>
            </>
          ) : (
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Order</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Total</th>
                    <th>Items</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map(order => (
                    <tr key={order.id}>
                      <td><strong>{order.orderNumber ? (order.orderNumber.startsWith('#') ? order.orderNumber : `#${order.orderNumber}`) : `#ET-${String(order.id).padStart(6, '0')}`}</strong></td>
                      <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                      <td><span className={styles.badge}>{order.status}</span></td>
                      <td>৳{order.totalAmount.toLocaleString()}</td>
                      <td>{order.items.length} items</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
