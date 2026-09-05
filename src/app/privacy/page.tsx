'use client';
import PolicyPageRenderer from '@/components/compliance/PolicyPageRenderer';
import { Lock } from 'lucide-react';

export default function PrivacyPolicyPage() {
  return <PolicyPageRenderer slug="privacy" defaultBadgeIcon={<Lock size={14} />} />;
}
