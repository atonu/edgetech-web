import React from 'react';
import Image from 'next/image';
import { ShieldCheck, Lock, CreditCard, Truck } from 'lucide-react';
import styles from './PaymentBanner.module.css';

export default function PaymentBanner() {
  const paymentMethods = [
    { name: 'SSLCommerz', isGateway: true, icon: Lock },
    { name: 'Cash on Delivery', isGateway: false, icon: Truck },
    { name: 'EMI Available on 32 Banks up to 36 Months', isGateway: true, icon: CreditCard },
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
            <m.icon size={13} />
            <span>{m.name}</span>
          </div>
        ))}
      </div>

      <div className={styles.securityNote}>
        <Lock style={{ marginTop: 'px' }} size={12} />
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
