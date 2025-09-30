import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { generateBusinessJsonLd, generateBreadcrumbJsonLd } from '@/lib/json-ld';

interface Props {
  params: { slug: string };
  children: React.ReactNode;
}

// Generate metadata for SEO
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const business = await prisma.business.findFirst({
    where: { 
      OR: [
        { slug },
        { id: slug }
      ]
    },
  });

  if (!business) {
    return {
      title: 'Business Not Found - SuburbMates',
    };
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://suburbmates.com.au';
  const profileUrl = `${baseUrl}/business/${business.slug}`;
  
  // Generate OG image with fallback
  const businessSlug = business.slug;
  const name = business.name;
  const suburb = business.suburb || "";
  
  const ogUrl = `/api/og?slug=${encodeURIComponent(businessSlug)}&name=${encodeURIComponent(name)}&suburb=${encodeURIComponent(suburb)}`;
  const fallback = "/social/og-image-default.png";

  return {
    title: `${business.name} - ${business.category || 'Business'} in ${business.suburb} | SuburbMates`,
    description: business.bio || `Connect with ${business.name}, a trusted ${business.category || 'business'} in ${business.suburb}, Melbourne. Professional services with verified credentials.`,
    keywords: `${business.name}, ${business.suburb}, ${business.category}, Melbourne business, professional services`,
    openGraph: {
      title: `${business.name} - Professional Services in ${business.suburb}`,
      description: business.bio || `Connect with ${business.name} on SuburbMates`,
      url: profileUrl,
      type: 'website',
      locale: 'en_AU',
      siteName: 'SuburbMates',
      images: [ogUrl, fallback],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${business.name} - ${business.suburb}`,
      description: business.bio || `Professional ${business.category || 'services'} in ${business.suburb}`,
      images: [ogUrl, fallback],
    },
    alternates: {
      canonical: profileUrl,
    },
  };
}

export default async function BusinessLayout({ params, children }: { params: Promise<{ slug: string }>; children: React.ReactNode; }) {
  const { slug } = await params;
  const business = await prisma.business.findFirst({
    where: { 
      OR: [
        { slug },
        { id: slug }
      ]
    },
    include: {
      customization: true,
    }
  });

  if (!business) {
    notFound();
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://suburbmates.com.au';
  const profileUrl = `${baseUrl}/business/${business.slug}`;

  // Generate JSON-LD structured data
const businessJsonLd = generateBusinessJsonLd(business as any, profileUrl);
  const breadcrumbJsonLd = generateBreadcrumbJsonLd(business as any, profileUrl);

  return (
    <>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: businessJsonLd }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: breadcrumbJsonLd }}
      />
      
      {children}
    </>
  );
}