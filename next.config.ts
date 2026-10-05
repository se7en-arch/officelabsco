import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

const nextConfig: NextConfig = {
  // Prisma here only talks to Turso through @prisma/adapter-libsql, so the
  // native query engine binaries (and the CLI) are never touched at
  // runtime — but Next's function-bundling trace doesn't know that and was
  // pulling them into every single API route's serverless function bundle,
  // multiplying tens of MB across dozens of routes into a large chunk of
  // Vercel's "Functions Storage" usage.
  outputFileTracingExcludes: {
    '*': [
      'node_modules/@prisma/engines/**',
      'node_modules/@prisma/fetch-engine/**',
      'node_modules/prisma/**',
    ],
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.public.blob.vercel-storage.com',
      },
    ],
  },
  async redirects() {
    return [
      { source: '/favicon.ico', destination: '/icon', permanent: false },
    ];
  },
  async headers() {
    // L-05: Vercel already sets HSTS — removed duplicate to avoid conflicting values.
    // Content-Security-Policy is set per request in middleware.ts (nonce-based).
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options',           value: 'DENY' },
          { key: 'X-Content-Type-Options',     value: 'nosniff' },
          { key: 'Referrer-Policy',            value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy',         value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
    ];
  },
};

export default withNextIntl(nextConfig);
