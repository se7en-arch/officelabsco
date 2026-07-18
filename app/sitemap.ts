import type { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';

export const revalidate = 3600;

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL?.startsWith('http://localhost')
  ? 'https://officelabsco.com'
  : (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://officelabsco.com');

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await prisma.product.findMany({
    where: { archived: false },
    select: { slug: true, createdAt: true },
  });

  const staticPages = ['', '/shop', '/about', '/contact', '/gallery/nova', '/gallery/astra', '/gallery/terra', '/gallery/loft'];

  const staticUrls: MetadataRoute.Sitemap = staticPages.map((path) => ({
    url: `${BASE_URL}${path}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: path === '' ? 1 : 0.8,
  }));

  // English versions (non-default locale gets /en/ prefix)
  const staticEnUrls: MetadataRoute.Sitemap = staticPages.map((path) => ({
    url: `${BASE_URL}/en${path}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: path === '' ? 0.9 : 0.7,
  }));

  const productUrls: MetadataRoute.Sitemap = products.flatMap((p) => [
    {
      url: `${BASE_URL}/shop/${p.slug}`,
      lastModified: p.createdAt,
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/en/shop/${p.slug}`,
      lastModified: p.createdAt,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
  ]);

  return [...staticUrls, ...staticEnUrls, ...productUrls];
}
