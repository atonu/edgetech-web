'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  MessageSquare,
  Send,
  CheckCircle2,
  Phone,
  Mail,
  MapPin,
  Clock,
  Star,
  HelpCircle,
  ShieldCheck,
  Headphones,
  ArrowRight,
} from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { feedbacksApi } from '@/lib/api';
import toast from 'react-hot-toast';
import styles from './support.module.css';

const categories = [
  { id: 'General', label: 'General Feedback' },
  { id: 'Support', label: 'Technical Support' },
  { id: 'ProductInquiry', label: 'Product Inquiry' },
  { id: 'OrderAssistance', label: 'Order Assistance' },
  { id: 'BugReport', label: 'Bug / Issue Report' },
];

export default function SupportPage() {
  const { user, isAuthenticated } = useAuthStore();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    category: 'General',
    subject: '',
    message: '',
    rating: 0,
  });

  const [hoverRating, setHoverRating] = useState(0);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Pre-fill if user is logged in
  useEffect(() => {
    if (isAuthenticated && user) {
      setFormData(prev => ({
        ...prev,
        name: prev.name || `${user.firstName || ''} ${user.lastName || ''}`.trim(),
        email: prev.email || user.email || '',
      }));
    }
  }, [isAuthenticated, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error('Please provide your name.');
      return;
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      toast.error('Please provide a valid email address.');
      return;
    }
    if (!formData.subject.trim()) {
      toast.error('Please enter a subject.');
      return;
    }
    if (!formData.message.trim()) {
      toast.error('Please enter your feedback or support message.');
      return;
    }

    setLoading(true);
    try {
      await feedbacksApi.create({
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim() || undefined,
        category: formData.category,
        subject: formData.subject.trim(),
        message: formData.message.trim(),
        rating: formData.rating > 0 ? formData.rating : undefined,
      });

      setSubmitted(true);
      toast.success('Your feedback has been submitted successfully!');
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Failed to submit feedback. Please try again.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({
      name: isAuthenticated && user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : '',
      email: isAuthenticated && user ? user.email || '' : '',
      phone: '',
      category: 'General',
      subject: '',
      message: '',
      rating: 0,
    });
    setSubmitted(false);
  };

  return (
    <div className={styles.pageContainer}>
      <div className="container">
        {/* Header */}
        <header className={styles.header}>
          <div className={styles.badge}>
            <Headphones size={14} />
            <span>Customer Care & Feedback</span>
          </div>
          <h1 className={styles.title}>Support & Feedback Center</h1>
          <p className={styles.subtitle}>
            Have questions, feedback, or need technical assistance? Submit your message below or contact our support team directly.
          </p>
        </header>

        {/* Main Grid */}
        <div className={styles.grid}>
          {/* Form Card */}
          <div className={styles.formCard}>
            {submitted ? (
              <div className={styles.successCard}>
                <div className={styles.successIconWrap}>
                  <CheckCircle2 size={32} />
                </div>
                <h2 className={styles.successTitle}>Thank You for Your Feedback!</h2>
                <p className={styles.successText}>
                  Your message has been received and routed to our support team. If you requested assistance, our team will reach out to you via email or phone promptly.
                </p>
                <button onClick={handleReset} className={`btn btn-primary ${styles.submitBtn}`}>
                  Submit Another Message
                </button>
              </div>
            ) : (
              <div>
                <h2 className={styles.cardTitle}>
                  <MessageSquare size={22} color="var(--primary)" />
                  Send Us a Message
                </h2>
                <p className={styles.cardDesc}>
                  Fill out the form below. You do not need an account to submit support inquiries or general feedback.
                </p>

                <form onSubmit={handleSubmit} className={styles.form}>
                  {/* Category Selection */}
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Feedback Category <span className={styles.required}>*</span></label>
                    <div className={styles.categoryGroup}>
                      {categories.map(c => (
                        <button
                          key={c.id}
                          type="button"
                          className={`${styles.categoryChip} ${formData.category === c.id ? styles.categoryChipActive : ''}`}
                          onClick={() => setFormData(p => ({ ...p, category: c.id }))}
                        >
                          {c.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Name & Email */}
                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label className={styles.label}>
                        Full Name <span className={styles.required}>*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Tanvir Ahmed"
                        className={styles.input}
                        value={formData.name}
                        onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.label}>
                        Email Address <span className={styles.required}>*</span>
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="tanvir@example.com"
                        className={styles.input}
                        value={formData.email}
                        onChange={e => setFormData(p => ({ ...p, email: e.target.value }))}
                      />
                    </div>
                  </div>

                  {/* Phone & Subject */}
                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label className={styles.label}>Phone Number (Optional)</label>
                      <input
                        type="tel"
                        placeholder="+880 1XXXXXXXXX"
                        className={styles.input}
                        value={formData.phone}
                        onChange={e => setFormData(p => ({ ...p, phone: e.target.value }))}
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.label}>
                        Subject <span className={styles.required}>*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Brief summary of your inquiry"
                        className={styles.input}
                        value={formData.subject}
                        onChange={e => setFormData(p => ({ ...p, subject: e.target.value }))}
                      />
                    </div>
                  </div>

                  {/* Experience Rating */}
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Overall Experience Rating (Optional)</label>
                    <div className={styles.ratingWrap}>
                      {[1, 2, 3, 4, 5].map(star => (
                        <button
                          key={star}
                          type="button"
                          className={`${styles.starBtn} ${(hoverRating || formData.rating) >= star ? styles.starActive : ''}`}
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                          onClick={() => setFormData(p => ({ ...p, rating: star === p.rating ? 0 : star }))}
                          aria-label={`Rate ${star} star`}
                        >
                          <Star size={22} fill={(hoverRating || formData.rating) >= star ? '#f59e0b' : 'none'} />
                        </button>
                      ))}
                      <span className={styles.ratingLabel}>
                        {formData.rating === 5 && 'Outstanding'}
                        {formData.rating === 4 && 'Very Good'}
                        {formData.rating === 3 && 'Average'}
                        {formData.rating === 2 && 'Needs Improvement'}
                        {formData.rating === 1 && 'Poor'}
                      </span>
                    </div>
                  </div>

                  {/* Message */}
                  <div className={styles.formGroup}>
                    <label className={styles.label}>
                      Your Message / Feedback <span className={styles.required}>*</span>
                    </label>
                    <textarea
                      required
                      placeholder="Please describe your question, issue, or feedback in detail..."
                      className={styles.textarea}
                      value={formData.message}
                      onChange={e => setFormData(p => ({ ...p, message: e.target.value }))}
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className={`btn btn-primary ${styles.submitBtn}`}
                  >
                    {loading ? (
                      'Submitting Message...'
                    ) : (
                      <>
                        Submit Feedback & Inquiries <Send size={16} />
                      </>
                    )}
                  </button>
                </form>
              </div>
            )}
          </div>

          {/* Side Info Cards */}
          <div className={styles.sideColumn}>
            {/* Quick Contact Card */}
            <div className={styles.infoCard}>
              <h3 className={styles.infoCardTitle}>
                <Phone size={18} color="var(--primary)" />
                Direct Support Channels
              </h3>
              <ul className={styles.channelList}>
                <li className={styles.channelItem}>
                  <div className={styles.channelIcon}>
                    <Phone size={18} />
                  </div>
                  <div>
                    <p className={styles.channelLabel}>Customer Helpline</p>
                    <a href="tel:+8801329661250" className={styles.channelValue}>
                      +880 1329-661250
                    </a>
                    <p className={styles.channelSub}>Sat – Thu (9:00 AM – 8:00 PM)</p>
                  </div>
                </li>

                <li className={styles.channelItem}>
                  <div className={styles.channelIcon}>
                    <Mail size={18} />
                  </div>
                  <div>
                    <p className={styles.channelLabel}>Official Email</p>
                    <a href="mailto:info@edgetech.com.bd" className={styles.channelValue}>
                      info@edgetech.com.bd
                    </a>
                    <p className={styles.channelSub}>Response within 24 hours</p>
                  </div>
                </li>

                <li className={styles.channelItem}>
                  <div className={styles.channelIcon}>
                    <MapPin size={18} />
                  </div>
                  <div>
                    <p className={styles.channelLabel}>Experience Center</p>
                    <p className={styles.channelValue}>Mirpur-2, Dhaka 1216</p>
                    <p className={styles.channelSub}>373, South Monipur</p>
                  </div>
                </li>
              </ul>
            </div>

            {/* Quick FAQs */}
            <div className={styles.infoCard}>
              <h3 className={styles.infoCardTitle}>
                <HelpCircle size={18} color="var(--primary)" />
                Frequently Asked
              </h3>
              <div className={styles.faqItem}>
                <h4 className={styles.faqQ}>What is the typical warranty on CCTV products?</h4>
                <p className={styles.faqA}>
                  All official cameras and NVR/DVR units come with official brand warranty ranging from 1 to 2 years.
                </p>
              </div>
              <div className={styles.faqItem}>
                <h4 className={styles.faqQ}>Do you provide on-site installation in Dhaka?</h4>
                <p className={styles.faqA}>
                  Yes, our certified technicians provide complete wiring, camera mounting, and network configuration.
                </p>
              </div>
              <div className={styles.faqItem}>
                <h4 className={styles.faqQ}>Can I track my support ticket or order?</h4>
                <p className={styles.faqA}>
                  Yes! You can view your orders under <Link href="/account/orders" style={{ color: 'var(--primary)', textDecoration: 'underline' }}>My Orders</Link> or reach out on WhatsApp.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
