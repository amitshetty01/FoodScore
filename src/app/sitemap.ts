import { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://foodscore.app';

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${baseUrl}/search`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
    { url: `${baseUrl}/scan`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/login`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
    { url: `${baseUrl}/signup`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
  ];

  // Add cached product pages
  let productRoutes: MetadataRoute.Sitemap = [];

  try {
    const cachedProducts = await prisma.cachedProduct.findMany({
      select: { barcode: true, updatedAt: true },
      orderBy: { viewCount: 'desc' },
      take: 1000,
    });

    productRoutes = cachedProducts.map(p => ({
      url: `${baseUrl}/product/${p.barcode}`,
      lastModified: p.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    }));
  } catch (error) {
    console.warn('Sitemap fallback: database unavailable, serving static routes only.', error);
  }

  return [...staticRoutes, ...productRoutes];
}
