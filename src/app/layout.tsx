import type { Metadata } from 'next';
import './globals.css';
import Providers from '@/components/Providers';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import CartDrawer from '@/components/layout/CartDrawer';
import CursorEffect from '@/components/ui/CursorEffect';

export const metadata: Metadata = {
  title: { default: 'EdgeTech — CCTV, Security & IT Solutions', template: '%s | EdgeTech' },
  description: 'Bangladesh\'s premier destination for CCTV cameras, surveillance systems, networking, and IT solutions. Build your custom security package today.',
  keywords: ['CCTV', 'security camera', 'surveillance', 'Hikvision', 'Dahua', 'Bangladesh', 'EdgeTech'],
  openGraph: {
    siteName: 'EdgeTech',
    locale: 'en_BD',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <CursorEffect />
          <Header />
          <CartDrawer />
          <main>{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
