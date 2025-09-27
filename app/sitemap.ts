import { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://suburbmates.com.au';

  // Static pages
  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/businesses`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/search`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    },
    {
      url: `${baseUrl}/register-business`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    },
  ];

  // Get all published/approved businesses
  const businesses = await prisma.business.findMany({
    where: {
      status: 'APPROVED',
      // Only include businesses that have basic required fields
      name: {
        not: null,
      },
      slug: {
        not: null,
      },
    },
    select: {
      slug: true,
      updatedAt: true,
    },
    orderBy: {
      updatedAt: 'desc',
    },
  });

  // Generate business profile URLs
  const businessPages = businesses.map(business => ({
    url: `${baseUrl}/business/${business.slug}`,
    lastModified: business.updatedAt,
    changeFrequency: 'weekly' as const,
    priority: 0.9, // High priority for business profiles
  }));

  // Get unique suburbs for location pages
  const suburbs = await prisma.business.findMany({
    where: {
      status: 'APPROVED',
    },
    select: {
      suburb: true,
    },
    distinct: ['suburb'],
  });

  // Generate suburb-specific pages
  const suburbPages = suburbs.map(({ suburb }) => ({
    url: `${baseUrl}/businesses?suburb=${encodeURIComponent(suburb)}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }));

  // Get unique categories for category pages
  const categories = await prisma.business.findMany({
    where: {
      status: 'APPROVED',
      category: {
        not: null,
      },
    },
    select: {
      category: true,
    },
    distinct: ['category'],
  });

  // Generate category-specific pages
  const categoryPages = categories.map(({ category }) => ({
    url: `${baseUrl}/businesses?category=${encodeURIComponent(category || '')}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }));

  return [
    ...staticPages,
    ...businessPages,
    ...suburbPages,
    ...categoryPages,
  ];
}

// Revalidate sitemap every hour
export const revalidate = 3600;