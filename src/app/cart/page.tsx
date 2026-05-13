'use client';
import Image from 'next/image';
import Link from 'next/link';
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft, Zap, ShieldCheck, Truck } from 'lucide-react';
import { motion } from 'framer-motion';
import { useCartStore } from '@/store/useCartStore';
import styles from './cart.module.css';

export default function CartPage() {
  const { items, updateQuantity, removeItem, clearCart, total, count } = useCartStore();

  if (items.length === 0) {
    return (
      <div className={styles.cartPage}>
        <div className="container">
          <div className={styles.emptyCart}>
            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
              <ShoppingBag size={64} className={styles.emptyIcon} />
            </motion.div>
            <h2>Your Cart is Empty</h2>
            <p className="text-muted">Looks like you haven&apos;t added any products yet.</p>
            <Link href="/products" className="btn btn-primary btn-lg">
              <ArrowLeft size={18} /> Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const totalAmount = total();

  return (
    <div className={styles.cartPage}>
      <div className="container">
        <div className={styles.header}>
          <h1>Shopping Cart</h1>
          <span className="text-muted">{count()} items</span>
        </div>

        <div className={styles.layout}>
          {/* Cart Items */}
          <div className={styles.itemsSection}>
            {items.map((item, idx) => {
              const effectivePrice = item.discountPrice ?? item.price;
              return (
                <motion.div key={item.productId} className={styles.cartItem}
                  initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}>
                  <div className={styles.itemImage}>
                    {item.imageUrl ? (
                      <Image src={item.imageUrl} alt={item.productName} fill style={{ objectFit: 'contain' }} />
                    ) : (
                      <div className={styles.imagePlaceholder}><Zap size={24} /></div>
                    )}
                  </div>
                  <div className={styles.itemInfo}>
                    <Link href={`/products/${item.productId}`} className={styles.itemName}>{item.productName}</Link>
                    <div className={styles.itemPricing}>
                      <span className={styles.itemPrice}>৳{effectivePrice.toLocaleString()}</span>
                      {item.discountPrice && <span className={styles.itemOriginal}>৳{item.price.toLocaleString()}</span>}
                    </div>
                  </div>
                  <div className={styles.quantityControl}>
                    <button onClick={() => updateQuantity(item.productId, item.quantity - 1)}><Minus size={14} /></button>
                    <span>{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.productId, item.quantity + 1)}><Plus size={14} /></button>
                  </div>
                  <span className={styles.itemTotal}>৳{(effectivePrice * item.quantity).toLocaleString()}</span>
                  <button className={styles.removeBtn} onClick={() => removeItem(item.productId)}>
                    <Trash2 size={16} />
                  </button>
                </motion.div>
              );
            })}
            <div className={styles.cartActions}>
              <Link href="/products" className="btn btn-ghost btn-sm"><ArrowLeft size={16} /> Continue Shopping</Link>
              <button className="btn btn-ghost btn-sm" onClick={clearCart}><Trash2 size={14} /> Clear Cart</button>
            </div>
          </div>

          {/* Summary */}
          <div className={styles.summary}>
            <div className={styles.summaryCard}>
              <h3>Order Summary</h3>
              <div className="divider" style={{ margin: '16px 0' }} />
              <div className={styles.summaryRow}>
                <span>Subtotal ({count()} items)</span>
                <span>৳{totalAmount.toLocaleString()}</span>
              </div>
              <div className={styles.summaryRow}>
                <span>Shipping</span>
                <span className={styles.freeShipping}>Free</span>
              </div>
              <div className="divider" style={{ margin: '16px 0' }} />
              <div className={`${styles.summaryRow} ${styles.totalRow}`}>
                <span>Total</span>
                <span>৳{totalAmount.toLocaleString()}</span>
              </div>
              <Link href="/checkout" className="btn btn-primary btn-lg w-full" style={{ marginTop: 16, justifyContent: 'center' }}>
                Proceed to Checkout
              </Link>
              <div className={styles.trustRow}>
                <span><ShieldCheck size={14} /> Secure Checkout</span>
                <span><Truck size={14} /> Free Delivery</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
