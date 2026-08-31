'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { CreditCard, Truck, MapPin, ChevronRight, ShieldCheck, Check, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { useCartStore } from '@/store/useCartStore';
import { useAuthStore } from '@/store/useAuthStore';
import { ordersApi } from '@/lib/api';
import { getImageUrl } from '@/lib/imageUrl';
import { Spinner } from '@/components/ui/Spinner';
import toast from 'react-hot-toast';
import styles from './checkout.module.css';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, total, count, clearCart } = useCartStore();
  const { user } = useAuthStore();
  const [step, setStep] = useState(1);
  const [isPlacing, setIsPlacing] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false); // MANDATORY unchecked by default
  const [emiTenure, setEmiTenure] = useState(12);
  const [emiBank, setEmiBank] = useState('City Bank');

  const [form, setForm] = useState({
    fullName: user ? `${user.firstName} ${user.lastName}` : '',
    email: user?.email || '',
    phone: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'Bangladesh',
    notes: '',
    paymentMethod: 'cod',
  });

  const updateField = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const isEmi = form.paymentMethod === 'emi';
  const totalAmount = total();
  const emiMonthlyAmount = isEmi && emiTenure > 0 ? Math.round(totalAmount / emiTenure) : 0;

  const handlePlaceOrder = async () => {
    if (!form.fullName || !form.phone || !form.address || !form.city) {
      toast.error('Please complete required shipping details.');
      return;
    }

    if (!agreedToTerms) {
      toast.error('You must agree to the Terms & Conditions, Privacy Policy, and Return Policy to place an order.');
      return;
    }

    try {
      setIsPlacing(true);
      const res = await ordersApi.place({
        shippingAddress: {
          fullName: form.fullName,
          phone: form.phone,
          address: form.address,
          city: form.city,
          state: form.state,
          postalCode: form.postalCode,
          country: form.country,
        },
        notes: form.notes,
        paymentMethod: form.paymentMethod,
        isEmi: isEmi,
        emiTenureMonths: isEmi ? emiTenure : undefined,
        emiBank: isEmi ? emiBank : undefined,
        customer: {
          fullName: form.fullName,
          email: form.email,
          phone: form.phone,
        },
        items: items.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
      });

      clearCart();
      toast.success('Order placed successfully!');
      const orderNumber = res.data?.orderNumber;
      router.push(orderNumber ? `/checkout/success?orderNumber=${encodeURIComponent(orderNumber)}` : '/checkout/success');
    } catch {
      toast.error('Unable to place order. Please try again.');
    } finally {
      setIsPlacing(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className={styles.checkoutPage}>
        <div className="container">
          <div className={styles.emptyState}>
            <h2>No items in cart</h2>
            <p className="text-muted">Add some products before checking out.</p>
            <Link href="/products" className="btn btn-primary">Browse Products</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.checkoutPage}>
      <div className="container">
        <h1 className={styles.pageTitle}>Checkout</h1>

        {/* Progress Steps */}
        <div className={styles.progress}>
          {['Shipping', 'Review', 'Payment'].map((label, i) => (
            <div key={label} className={`${styles.progressStep} ${step >= i + 1 ? styles.stepActive : ''} ${step > i + 1 ? styles.stepDone : ''}`}>
              <div className={styles.stepCircle}>{step > i + 1 ? <Check size={14} /> : i + 1}</div>
              <span>{label}</span>
              {i < 2 && <div className={styles.stepLine} />}
            </div>
          ))}
        </div>

        <div className={styles.layout}>
          {/* Form Area */}
          <div className={styles.formArea}>
            {step === 1 && (
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className={styles.formCard}>
                <h3><MapPin size={18} /> Shipping Address</h3>
                <div className={styles.formGrid}>
                  <div className={styles.formGroup}>
                    <label>Full Name *</label>
                    <input className="input" value={form.fullName} onChange={e => updateField('fullName', e.target.value)} placeholder="Enter your full name" />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Email</label>
                    <input className="input" type="email" value={form.email} onChange={e => updateField('email', e.target.value)} placeholder="your@email.com" />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Phone *</label>
                    <input className="input" value={form.phone} onChange={e => updateField('phone', e.target.value)} placeholder="+880 1XXXXXXXXX" />
                  </div>
                  <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                    <label>Address *</label>
                    <input className="input" value={form.address} onChange={e => updateField('address', e.target.value)} placeholder="Street address, apartment, suite, etc." />
                  </div>
                  <div className={styles.formGroup}>
                    <label>City *</label>
                    <input className="input" value={form.city} onChange={e => updateField('city', e.target.value)} placeholder="Dhaka" />
                  </div>
                  <div className={styles.formGroup}>
                    <label>State / Division</label>
                    <input className="input" value={form.state} onChange={e => updateField('state', e.target.value)} placeholder="Dhaka Division" />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Postal Code</label>
                    <input className="input" value={form.postalCode} onChange={e => updateField('postalCode', e.target.value)} placeholder="1200" />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Country</label>
                    <input className="input" value={form.country} disabled />
                  </div>
                  <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                    <label>Notes (optional)</label>
                    <textarea className="input" value={form.notes} onChange={e => updateField('notes', e.target.value)} rows={3} placeholder="Any special delivery instructions..." />
                  </div>
                </div>
                <button className="btn btn-primary btn-lg" style={{ marginTop: 16 }}
                  onClick={() => setStep(2)} disabled={!form.fullName || !form.phone || !form.address || !form.city}>
                  Continue to Review <ChevronRight size={18} />
                </button>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className={styles.formCard}>
                <h3><Truck size={18} /> Order Review</h3>
                <div className={styles.reviewSection}>
                  <h4>Shipping To:</h4>
                  <p>{form.fullName}<br />{form.address}<br />{form.city}, {form.state} {form.postalCode}<br />{form.phone}</p>
                </div>
                <div className={styles.reviewSection}>
                  <h4>Items ({count()}):</h4>
                  {items.map(item => (
                    <div key={item.productId} className={styles.reviewItem}>
                      <div className={styles.reviewItemIcon}>
                        {item.imageUrl ? (
                          <Image src={getImageUrl(item.imageUrl)!} alt={item.productName} fill sizes="50px" style={{ objectFit: 'cover' }} />
                        ) : (
                          <Zap size={16} />
                        )}
                      </div>
                      <span className={styles.reviewItemName}>{item.productName}</span>
                      <span className={styles.reviewItemQty}>x{item.quantity}</span>
                      <span className={styles.reviewItemPrice}>৳{((item.discountPrice ?? item.price) * item.quantity).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
                <div className={styles.stepBtns}>
                  <button className="btn btn-ghost" onClick={() => setStep(1)}>← Back</button>
                  <button className="btn btn-primary btn-lg" onClick={() => setStep(3)}>
                    Continue to Payment <ChevronRight size={18} />
                  </button>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className={styles.formCard}>
                <h3><CreditCard size={18} /> Payment Method</h3>
                <div className={styles.paymentOptions}>
                  {[
                    { value: 'cod', label: 'Cash on Delivery', desc: 'Pay with cash when your package arrives' },
                    { value: 'bkash', label: 'bKash / Mobile Banking', desc: 'Instant bKash, Nagad, Rocket payment' },
                    { value: 'card', label: 'Credit / Debit Card', desc: 'Visa, Mastercard, AMEX via SSLCommerz' },
                    { value: 'emi', label: 'Equal Monthly Installment (EMI)', desc: 'Flexible 3 to 36 months zero-cost/low-cost EMI' },
                  ].map(opt => (
                    <label key={opt.value} className={`${styles.paymentOption} ${form.paymentMethod === opt.value ? styles.paymentActive : ''}`}>
                      <input type="radio" name="payment" value={opt.value}
                        checked={form.paymentMethod === opt.value} onChange={e => updateField('paymentMethod', e.target.value)} />
                      <div style={{ flex: 1 }}>
                        <strong>{opt.label}</strong>
                        <span>{opt.desc}</span>
                      </div>
                    </label>
                  ))}
                </div>

                {/* EMI Configuration */}
                {isEmi && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className={styles.emiDetailsBox}>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--color-text)' }}>Configure EMI Plan</div>
                    <div className={styles.emiGrid}>
                      <div className={styles.formGroup}>
                        <label>Select Bank</label>
                        <select className="input" value={emiBank} onChange={e => setEmiBank(e.target.value)}>
                          <option value="City Bank">City Bank (Amex / Visa)</option>
                          <option value="BRAC Bank">BRAC Bank</option>
                          <option value="Eastern Bank (EBL)">Eastern Bank (EBL)</option>
                          <option value="Standard Chartered">Standard Chartered</option>
                          <option value="Mutual Trust Bank (MTB)">Mutual Trust Bank</option>
                          <option value="Dhaka Bank">Dhaka Bank</option>
                          <option value="Prime Bank">Prime Bank</option>
                          <option value="Dutch-Bangla Bank (DBBL)">Dutch-Bangla Bank</option>
                        </select>
                      </div>

                      <div className={styles.formGroup}>
                        <label>EMI Tenure (Months)</label>
                        <select className="input" value={emiTenure} onChange={e => setEmiTenure(Number(e.target.value))}>
                          <option value={3}>3 Months</option>
                          <option value={6}>6 Months</option>
                          <option value={9}>9 Months</option>
                          <option value={12}>12 Months (Recommended)</option>
                          <option value={18}>18 Months</option>
                          <option value={24}>24 Months</option>
                          <option value={36}>36 Months</option>
                        </select>
                      </div>
                    </div>

                    <div className={styles.emiCalculated}>
                      <div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Estimated Monthly Installment:</div>
                        <div className={styles.emiAmount}>৳{emiMonthlyAmount.toLocaleString()} / month</div>
                      </div>
                      <div style={{ textAlign: 'right', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                        Tenure: <strong>{emiTenure} Months</strong><br />
                        Bank: <strong>{emiBank}</strong>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Mandatory Compliance 11: Agreement Checkbox */}
                <div className={styles.agreementBox}>
                  <input
                    type="checkbox"
                    id="checkout-terms-checkbox"
                    className={styles.agreementCheckbox}
                    checked={agreedToTerms}
                    onChange={e => setAgreedToTerms(e.target.checked)}
                  />
                  <label htmlFor="checkout-terms-checkbox" className={styles.agreementLabel}>
                    I have read and agree to EdgeTech&apos;s{' '}
                    <Link href="/terms" target="_blank" className={styles.agreementLink}>
                      Terms & Conditions
                    </Link>
                    ,{' '}
                    <Link href="/privacy" target="_blank" className={styles.agreementLink}>
                      Privacy Policy
                    </Link>
                    , and{' '}
                    <Link href="/refund-policy" target="_blank" className={styles.agreementLink}>
                      Return & Refund Policy
                    </Link>
                    .
                  </label>
                </div>

                <div className={styles.stepBtns}>
                  <button className="btn btn-ghost" onClick={() => setStep(2)}>← Back</button>
                  <button
                    className="btn btn-primary btn-lg"
                    onClick={handlePlaceOrder}
                    disabled={isPlacing || !agreedToTerms}
                    style={{ opacity: !agreedToTerms ? 0.6 : 1 }}
                  >
                    {isPlacing ? <><Spinner size={16} /> Placing Order...</> : `Place Order — ৳${totalAmount.toLocaleString()}`}
                  </button>
                </div>
              </motion.div>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div className={styles.sidebar}>
            <div className={styles.summaryCard}>
              <h3>Order Summary</h3>
              <div className="divider" style={{ margin: '14px 0' }} />
              <div className={styles.summaryRow}><span>Subtotal</span><span>৳{totalAmount.toLocaleString()}</span></div>
              <div className={styles.summaryRow}><span>Shipping</span><span className={styles.free}>Free</span></div>
              {isEmi && (
                <div className={styles.summaryRow}>
                  <span>EMI Plan</span>
                  <span style={{ color: 'var(--color-primary)', fontWeight: 600 }}>৳{emiMonthlyAmount.toLocaleString()}/mo ({emiTenure}m)</span>
                </div>
              )}
              <div className="divider" style={{ margin: '14px 0' }} />
              <div className={`${styles.summaryRow} ${styles.totalRow}`}><span>Total</span><span>৳{totalAmount.toLocaleString()}</span></div>

              {/* Delivery Timeline Card */}
              <div className={styles.deliveryTimelineCard}>
                <div><strong>Standard Delivery Timeline:</strong></div>
                <div>• Inside Dhaka: <strong>5 working days</strong></div>
                <div>• Outside Dhaka: <strong>10 working days</strong></div>
                <div style={{ marginTop: 4 }}>• <strong>7 to 10 Days</strong> Return Guarantee</div>
              </div>

              <div className={styles.trust}><ShieldCheck size={14} /> Secure 256-bit SSL Encryption</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
