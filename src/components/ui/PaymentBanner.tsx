import React from 'react';
import Image from 'next/image';
import { ShieldCheck, Lock, CreditCard } from 'lucide-react';
import styles from './PaymentBanner.module.css';

export default function PaymentBanner() {
  const paymentMethods = [
    { name: 'SSLCommerz', isGateway: true },
    { name: 'bKash', color: '#E2136E' },
    { name: 'Nagad', color: '#F7941D' },
    { name: 'Rocket', color: '#8C3494' },
    { name: 'Upay', color: '#0059A1' },
    { name: 'Visa Card', color: '#1A1F71' },
    { name: 'Mastercard', color: '#EB001B' },
    { name: 'Amex', color: '#006FCF' },
    { name: 'Internet Banking', isGateway: false },
    { name: 'Cash on Delivery', isGateway: false },
    { name: 'EMI Available (3-36 Mo)', isGateway: true },
  ];

  return (
    <div className={styles.paymentBannerContainer}>
      <div className={styles.bannerTitle}>
        <ShieldCheck size={16} color="var(--primary)" />
        100% Secure & Verified Payment Options
      </div>

      <div className={styles.methodsGrid}>
        {paymentMethods.map((m) => (
          <div
            key={m.name}
            className={`${styles.methodBadge} ${m.isGateway ? styles.gatewayBadge : ''}`}
          >
            {m.isGateway ? <Lock size={12} /> : <CreditCard size={12} />}
            <span>{m.name}</span>
          </div>
        ))}
      </div>

      <div className={styles.securityNote}>
        <Lock size={12} />
        All online card and mobile banking transactions are encrypted via 256-bit SSL certified payment gateways.
      </div>

      <div className={styles.gatewayImages}>
        <Image
          src="/sslcommerz/SSLCommerz-Pay-With-logo-All-Size-04.png"
          alt="Accepted payment methods verified by SSLCommerz"
          width={1058}
          height={2702}
          className={`${styles.gatewayImage} ${styles.gatewayImageMobile}`}
          sizes="(max-width: 640px) 100vw, 0px"
        />
        <Image
          src="/sslcommerz/SSLCommerz-Pay-With-logo-All-Size-01.png"
          alt="Accepted payment methods verified by SSLCommerz"
          width={5235}
          height={586}
          className={`${styles.gatewayImage} ${styles.gatewayImageDesktop}`}
          sizes="(min-width: 641px) 100vw, 0px"
        />
      </div>
    </div>
  );
}
