import type { Metadata } from 'next';
import './globals.css';
import Providers from '@/components/Providers';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import CartDrawer from '@/components/layout/CartDrawer';
import CursorEffect from '@/components/ui/CursorEffect';

export const metadata: Metadata = {
  metadataBase: new URL('https://www.edgetech.com.bd'),
  title: { default: 'EdgeTech — CCTV, Security & IT Solutions', template: '%s | EdgeTech' },
  description: 'Bangladesh\'s premier destination for CCTV cameras, surveillance systems, networking, and IT solutions. Build your custom security package today.',
  keywords: ['CCTV', 'security camera', 'surveillance', 'Hikvision', 'Dahua', 'Bangladesh', 'EdgeTech'],
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/logo.png' },
      { url: '/logo.png', type: 'image/png' },
    ],
    shortcut: '/logo.png',
    apple: '/logo.png',
  },
  openGraph: {
    title: 'EdgeTech — CCTV, Security & IT Solutions',
    description: 'Bangladesh\'s premier destination for CCTV cameras, surveillance systems, networking, and IT solutions. Build your custom security package today.',
    url: 'https://www.edgetech.com.bd',
    siteName: 'EdgeTech',
    images: [
      {
        url: '/logo.png',
        width: 800,
        height: 800,
        alt: 'EdgeTech Logo',
      },
    ],
    locale: 'en_BD',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'EdgeTech — CCTV, Security & IT Solutions',
    description: 'Bangladesh\'s premier destination for CCTV cameras, surveillance systems, networking, and IT solutions.',
    images: ['/logo.png'],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="light">
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
