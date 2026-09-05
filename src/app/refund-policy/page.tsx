'use client';
import PolicyPageRenderer from '@/components/compliance/PolicyPageRenderer';
import { RefreshCw } from 'lucide-react';

export default function RefundPolicyPage() {
  return <PolicyPageRenderer slug="refund-policy" defaultBadgeIcon={<RefreshCw size={14} />} />;
}
