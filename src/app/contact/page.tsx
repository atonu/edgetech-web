'use client';
import PolicyPageRenderer from '@/components/compliance/PolicyPageRenderer';
import { Phone } from 'lucide-react';

export default function ContactUsPage() {
  return <PolicyPageRenderer slug="contact" defaultBadgeIcon={<Phone size={14} />} />;
}
