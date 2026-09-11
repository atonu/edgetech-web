'use client';
import { X, Plus, Minus, Trash2, ShoppingBag, Package } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useCartStore } from '@/store/useCartStore';
import styles from './CartDrawer.module.css';

export default function CartDrawer() {
  const { items, packages, isOpen, closeCart, removeItem, updateQuantity, removePackage, updatePackageQuantity, total } = useCartStore();

  if (!isOpen) return null;

  const formatPrice = (p: number) => `৳${p.toLocaleString()}`;
  const lineCount = items.length + packages.length;

  return (
    <>
      <div className={styles.overlay} onClick={closeCart} />
      <div className={styles.drawer}>
        <div className={styles.header}>
          <div className={styles.title}>
            <ShoppingBag size={20} />
            Shopping Cart
            {lineCount > 0 && <span className={styles.count}>{lineCount}</span>}
          </div>
          <button onClick={closeCart} className={styles.closeBtn}><X size={20} /></button>
        </div>

        {lineCount === 0 ? (
          <div className={styles.empty}>
            <ShoppingBag size={48} />
            <p>Your cart is empty</p>
            <Link href="/products" className="btn btn-primary" onClick={closeCart}>Browse Products</Link>
          </div>
        ) : (
          <>
            <div className={styles.items}>
              {packages.map(pkg => (
                <div key={`pkg-${pkg.packageId}`} className={styles.packageLine}>
                  <div className={styles.packageTop}>
                    <div className={styles.packageThumb}>
                      {pkg.imageUrl ? (
                        <Image src={pkg.imageUrl} alt={pkg.name} fill sizes="40px" style={{ objectFit: 'cover' }} />
                      ) : (
                        <Package size={16} />
                      )}
                    </div>
                    <div className={styles.packageTopInfo}>
                      <span className={styles.packageBadge}><Package size={11} /> Package</span>
                      <span className={styles.packageLineName}>{pkg.name}</span>
                    </div>
                    <button onClick={() => removePackage(pkg.packageId)} className={styles.removeBtn}><Trash2 size={15} /></button>
                  </div>
                  <div className={styles.packageComponents}>
                    {pkg.items.map(i => i.productName).join(' · ')}
                  </div>
                  <div className={styles.packageBottom}>
                    <div className={styles.qtyControls}>
                      <button onClick={() => updatePackageQuantity(pkg.packageId, pkg.quantity - 1)} className={styles.qtyBtn}><Minus size={13} /></button>
                      <span className={styles.qty}>{pkg.quantity}</span>
                      <button onClick={() => updatePackageQuantity(pkg.packageId, pkg.quantity + 1)} className={styles.qtyBtn}><Plus size={13} /></button>
                    </div>
                    <div className={styles.packagePriceLine}>
                      {pkg.regularPrice > pkg.packagePrice && (
                        <span className={styles.packageRegularStrike}>{formatPrice(pkg.regularPrice * pkg.quantity)}</span>
                      )}
                      <span className={styles.subtotal}>{formatPrice(pkg.packagePrice * pkg.quantity)}</span>
                    </div>
                  </div>
                </div>
              ))}
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
