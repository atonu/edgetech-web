'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, Eye, EyeOff, UserPlus, Shield, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/useAuthStore';
import { authApi } from '@/lib/api';
import { Spinner } from '@/components/ui/Spinner';
import toast from 'react-hot-toast';
import styles from '../login/auth.module.css';

export default function RegisterPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const updateField = (field: string, value: string) => setForm(prev => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) { toast.error('Passwords do not match'); return; }
    if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setIsLoading(true);
    try {
      const res = await authApi.register({ email: form.email, password: form.password, firstName: form.firstName, lastName: form.lastName });
      setAuth(res.data.user, res.data.token);
      toast.success('Account created successfully!');
      router.push('/');
    } catch {
      toast.error('Registration failed. Email may already be in use.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.authPage}>
      <div className={styles.authBg} />
      <motion.div className={styles.authCard} initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}>
        <div className={styles.authHeader}>
          <div className={styles.authLogo}><Shield size={28} /></div>
          <h1>Create Account</h1>
          <p className="text-muted">Join EdgeTech for the best security deals</p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.nameRow}>
            <div className={styles.formGroup}>
              <label>First Name</label>
              <div className={styles.inputWrap}>
                <User size={16} />
                <input type="text" className="input" placeholder="John" value={form.firstName} onChange={e => updateField('firstName', e.target.value)} required />
              </div>
            </div>
            <div className={styles.formGroup}>
              <label>Last Name</label>
              <div className={styles.inputWrap}>
                <User size={16} />
                <input type="text" className="input" placeholder="Doe" value={form.lastName} onChange={e => updateField('lastName', e.target.value)} required />
              </div>
            </div>
          </div>

          <div className={styles.formGroup}>
            <label>Email Address</label>
            <div className={styles.inputWrap}>
              <Mail size={16} />
              <input type="email" className="input" placeholder="you@example.com" value={form.email} onChange={e => updateField('email', e.target.value)} required />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label>Password</label>
            <div className={styles.inputWrap}>
              <Lock size={16} />
              <input type={showPassword ? 'text' : 'password'} className="input" placeholder="Create a password" value={form.password} onChange={e => updateField('password', e.target.value)} required />
              <button type="button" className={styles.eyeBtn} onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className={styles.formGroup}>
            <label>Confirm Password</label>
            <div className={styles.inputWrap}>
              <Lock size={16} />
              <input type="password" className="input" placeholder="Confirm your password" value={form.confirmPassword} onChange={e => updateField('confirmPassword', e.target.value)} required />
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-lg w-full" style={{ justifyContent: 'center' }} disabled={isLoading}>
            {isLoading ? <><Spinner size={16} /> Creating Account...</> : <><UserPlus size={18} /> Create Account</>}
          </button>
        </form>

        <p className={styles.switchText}>
          Already have an account? <Link href="/auth/login">Sign In</Link>
        </p>
      </motion.div>
    </div>
  );
}
