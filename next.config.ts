import type { NextConfig } from 'next';

const INTERNAL_API_URL =
  process.env.INTERNAL_API_URL ||
  (process.env.NODE_ENV === 'production'
    ? 'http://edgetech-api-container:5001'
    : 'http://localhost:5001');

const nextConfig: NextConfig = {
  serverExternalPackages: ['sharp'],
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.blob.core.windows.net' },
      { protocol: 'https', hostname: 'placehold.co' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${INTERNAL_API_URL}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
