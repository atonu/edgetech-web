'use client';
import PolicyPageRenderer from '@/components/compliance/PolicyPageRenderer';
import { FileText } from 'lucide-react';

export default function TermsAndConditionsPage() {
  return <PolicyPageRenderer slug="terms" defaultBadgeIcon={<FileText size={14} />} />;
}
