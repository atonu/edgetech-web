'use client';
import PolicyPageRenderer from '@/components/compliance/PolicyPageRenderer';
import { Building } from 'lucide-react';

export default function AboutUsPage() {
  return <PolicyPageRenderer slug="about" defaultBadgeIcon={<Building size={14} />} />;
}
