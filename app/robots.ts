import type { MetadataRoute } from 'next';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL?.startsWith('http://localhost')
  ? 'https://officelabsco.com'
  : (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://officelabsco.com');

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/adminpanel', '/api/'],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
