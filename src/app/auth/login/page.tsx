'use client';
import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, Eye, EyeOff, LogIn, Shield } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/useAuthStore';
import { authApi } from '@/lib/api';
import { Spinner } from '@/components/ui/Spinner';
import toast from 'react-hot-toast';
import styles from './auth.module.css';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setAuth } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await authApi.login({ email, password });
      setAuth(res.data.user, res.data.token);
      toast.success('Welcome back!');
      const returnTo = searchParams.get('returnTo');
      router.push(returnTo ? decodeURIComponent(returnTo) : '/');
    } catch {
      toast.error('Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.formGroup}>
        <label>Email Address</label>
        <div className={styles.inputWrap}>
          <Mail size={16} />
          <input type="email" className="input" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
        </div>
      </div>

      <div className={styles.formGroup}>
        <div className={styles.labelRow}>
          <label>Password</label>
          <Link href="#" className={styles.forgotLink}>Forgot Password?</Link>
        </div>
        <div className={styles.inputWrap}>
          <Lock size={16} />
          <input type={showPassword ? 'text' : 'password'} className="input" placeholder="Enter your password" value={password} onChange={e => setPassword(e.target.value)} required />
          <button type="button" className={styles.eyeBtn} onClick={() => setShowPassword(!showPassword)}>
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </div>

      <button type="submit" className="btn btn-primary btn-lg w-full" style={{ justifyContent: 'center' }} disabled={isLoading}>
        {isLoading ? <><Spinner size={16} /> Signing in...</> : <><LogIn size={18} /> Sign In</>}
      </button>
    </form>
  );
}

export default function LoginPage() {
  return (
    <div className={styles.authPage}>
      <div className={styles.authBg} />
      <motion.div className={styles.authCard} initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}>
        <div className={styles.authHeader}>
          <div className={styles.authLogo}>
            <Shield size={28} />
          </div>
          <h1>Welcome Back</h1>
          <p className="text-muted">Sign in to your EdgeTech account</p>
        </div>

        <Suspense fallback={<div className="flex justify-center p-8"><Spinner size={24} /></div>}>
          <LoginForm />
        </Suspense>

        <p className={styles.switchText}>
          Don&apos;t have an account? <Link href="/auth/register">Create one</Link>
        </p>
      </motion.div>
    </div>
  );
}
