'use client';
import React from 'react';
import Image from 'next/image';
import styles from './WhatsAppButton.module.css';

export default function WhatsAppButton() {
  const whatsappUrl = 'https://wa.me/8801329661250?text=Hello%20EdgeTech%2C%20I%20would%20like%20to%20inquire%20about%20your%20products';

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={styles.floatingBtn}
      aria-label="Chat with EdgeTech on WhatsApp"
      title="Chat on WhatsApp (+880 1329-661250)"
    >
      <div className={styles.pulseRing} />
      <div className={styles.imageWrap}>
        <Image
          src="/wa.png"
          alt="WhatsApp"
          width={58}
          height={58}
          className={styles.waImage}
          priority
        />
      </div>
    </a>
  );
}
