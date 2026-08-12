'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import styles from './account.module.css';

export default function AccountPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/auth/login');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className={styles.accountPage}>
      <div className="container">
        <div className={styles.header}>
          <h1>My Account</h1>
          <p className={styles.muted}>Manage your profile and review your orders.</p>
        </div>

        <div className={styles.grid}>
          <div className={styles.card}>
            <h3>Profile</h3>
            <div className={styles.row}>
              <div>
                <span className={styles.label}>First Name</span>
                <span className={styles.value}>{user.firstName}</span>
              </div>
              <div>
                <span className={styles.label}>Last Name</span>
                <span className={styles.value}>{user.lastName}</span>
              </div>
              <div>
                <span className={styles.label}>Email</span>
                <span className={styles.value}>{user.email}</span>
              </div>
              <div>
                <span className={styles.label}>Role</span>
                <span className={styles.value}>{user.role}</span>
              </div>
            </div>

            <div className={styles.actions}>
              <Link href="/account/orders" className="btn btn-primary">View Orders</Link>
              <Link href="/products" className="btn btn-ghost">Continue Shopping</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
