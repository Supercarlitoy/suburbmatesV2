import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { BUSINESS_CATEGORIES } from '@/lib/constants/business-categories';

interface Props {
  params: Promise<{ slug: string }>;
  children: React.ReactNode;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  const category = BUSINESS_CATEGORIES.find(cat => cat.id === resolvedParams.slug);
  
  if (!category) {
    return {
      title: 'Category Not Found - SuburbMates',
    };
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://suburbmates.com.au';
  const categoryUrl = `${baseUrl}/category/${category.id}`;
  
  // Generate OG image with fallback
  const ogUrl = `/api/og?slug=${encodeURIComponent(category.id)}&name=${encodeURIComponent(category.name)}&suburb=Melbourne`;
  const fallback = "/social/og-image-default.png";

  return {
    title: `${category.name} in Melbourne – Verified Local Experts | SuburbMates`,
    description: `Discover trusted ${category.name.toLowerCase()} across Melbourne's suburbs. Verified business profiles, local reviews, and direct contact – no middlemen.`,
    keywords: `${category.name}, Melbourne ${category.name.toLowerCase()}, local ${category.name.toLowerCase()}, verified ${category.name.toLowerCase()}, ${category.name.toLowerCase()} near me`,
    openGraph: {
      title: `${category.name} in Melbourne – Verified Local Experts`,
      description: `Find trusted ${category.name.toLowerCase()} across Melbourne suburbs. Verified profiles, reviews, and direct contact.`,
      url: categoryUrl,
      type: 'website',
      locale: 'en_AU',
      siteName: 'SuburbMates',
      images: [ogUrl, fallback],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${category.name} in Melbourne`,
      description: `Trusted ${category.name.toLowerCase()} with verified credentials and reviews`,
      images: [ogUrl, fallback],
    },
    alternates: {
      canonical: categoryUrl,
    },
    robots: {
      index: true,
      follow: true,
    }
  };
}

export default async function CategoryLayout({ params, children }: Props) {
  const resolvedParams = await params;
  const category = BUSINESS_CATEGORIES.find(cat => cat.id === resolvedParams.slug);
  
  if (!category) {
    notFound();
  }

  return <>{children}</>;
}