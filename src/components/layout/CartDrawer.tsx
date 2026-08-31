'use client';
import { X, Plus, Minus, Trash2, ShoppingBag } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useCartStore } from '@/store/useCartStore';
import styles from './CartDrawer.module.css';

export default function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQuantity, total } = useCartStore();

  if (!isOpen) return null;

  const formatPrice = (p: number) => `৳${p.toLocaleString()}`;

  return (
    <>
      <div className={styles.overlay} onClick={closeCart} />
      <div className={styles.drawer}>
        <div className={styles.header}>
          <div className={styles.title}>
            <ShoppingBag size={20} />
            Shopping Cart
            {items.length > 0 && <span className={styles.count}>{items.length}</span>}
          </div>
          <button onClick={closeCart} className={styles.closeBtn}><X size={20} /></button>
        </div>

        {items.length === 0 ? (
          <div className={styles.empty}>
            <ShoppingBag size={48} />
            <p>Your cart is empty</p>
            <Link href="/products" className="btn btn-primary" onClick={closeCart}>Browse Products</Link>
          </div>
        ) : (
          <>
            <div className={styles.items}>
              {items.map(item => (
                <div key={item.productId} className={styles.item}>
                  <div className={styles.imgWrap}>
                    {item.imageUrl ? (
                      <Image src={item.imageUrl} alt={item.productName} fill sizes="60px" style={{ objectFit: 'cover' }} />
                    ) : (
                      <div className={styles.imgPlaceholder}><ShoppingBag size={20} /></div>
                    )}
                  </div>
                  <div className={styles.itemInfo}>
                    <p className={styles.itemName}>{item.productName}</p>
                    <p className={styles.itemPrice}>{formatPrice((item.discountPrice ?? item.price))}</p>
                    <div className={styles.qtyControls}>
                      <button onClick={() => updateQuantity(item.productId, item.quantity - 1)} className={styles.qtyBtn}><Minus size={13} /></button>
                      <span className={styles.qty}>{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.productId, item.quantity + 1)} disabled={item.quantity >= item.stock} className={styles.qtyBtn}><Plus size={13} /></button>
                    </div>
                  </div>
                  <div className={styles.itemRight}>
                    <p className={styles.subtotal}>{formatPrice((item.discountPrice ?? item.price) * item.quantity)}</p>
                    <button onClick={() => removeItem(item.productId)} className={styles.removeBtn}><Trash2 size={15} /></button>
                  </div>
                </div>
              ))}
            </div>

            <div className={styles.footer}>
              <div className={styles.totalsRow}>
                <span>Subtotal</span>
                <span className={styles.totalAmount}>{formatPrice(total())}</span>
              </div>
              <p className={styles.shipping}>Shipping calculated at checkout</p>
              <Link href="/checkout" className="btn btn-primary w-full" onClick={closeCart}>
                Proceed to Checkout
              </Link>
              <Link href="/cart" className="btn btn-outline w-full" onClick={closeCart}>
                View Cart
              </Link>
            </div>
          </>
        )}
      </div>
    </>
  );
}
