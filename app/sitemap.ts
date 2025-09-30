import { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';
import { BUSINESS_CATEGORIES } from '@/lib/constants/business-categories';
import { MELBOURNE_SUBURBS } from '@/lib/constants/melbourne-suburbs';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://suburbmates.com.au';

  // Static pages - only core indexable pages
  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1,
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
      url: `${baseUrl}/help`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.4,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'yearly' as const,
      priority: 0.3,
    },
  ];

  // Get all published/approved businesses
  const businesses = await prisma.business.findMany({
    where: {
      approvalStatus: 'APPROVED',
      // Only include businesses that have basic required fields
      name: {
        not: '',
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

  // Generate category landing pages
  const categoryPages = BUSINESS_CATEGORIES.map(category => ({
    url: `${baseUrl}/category/${category.id}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8, // High priority for category pages
  }));

  // Generate suburb landing pages (top suburbs only to start)
  const topSuburbs = ['richmond', 'fitzroy', 'hawthorn', 'st-kilda', 'prahran', 'carlton', 'south-yarra', 'brunswick', 'collingwood', 'northcote'];
  const suburbPages = topSuburbs.map(suburbSlug => ({
    url: `${baseUrl}/suburb/${suburbSlug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7, // Medium-high priority for suburb pages
  }));

  // Note: Parameterized URLs (/search?category=X&suburb=Y) are excluded
  // from sitemap to avoid crawl bloat. These are handled by page-level
  // noindex,follow meta tags instead.
  //
  // Static landing pages (/category/plumbing, /suburb/richmond) provide
  // clean SEO-friendly URLs with rich content for search engines.

  return [
    ...staticPages,
    ...businessPages,
    ...categoryPages,
    ...suburbPages,
  ];
}

// Revalidate sitemap every hour to catch new business profiles
// This focuses on high-quality, indexable content only
export const revalidate = 3600;
