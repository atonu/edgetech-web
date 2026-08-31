'use client';
import React from 'react';
import { MessageCircle } from 'lucide-react';
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
    >
      <div className={styles.iconWrap}>
        <div className={styles.pulseRing} />
        <MessageCircle size={22} />
      </div>
      <div className={styles.label}>
        <span>Chat on WhatsApp</span>
        <span className={styles.subText}>+880 1329-661250</span>
      </div>
    </a>
  );
}
