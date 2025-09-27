import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { generateBusinessJsonLd, generateBreadcrumbJsonLd } from '@/lib/json-ld';

interface Props {
  params: { slug: string };
  children: React.ReactNode;
}

// Generate metadata for SEO
export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const business = await prisma.business.findUnique({
    where: { 
      OR: [
        { slug: params.slug },
        { id: params.slug }
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
      images: business.logo ? [
        {
          url: business.logo.startsWith('http') ? business.logo : `${baseUrl}${business.logo}`,
          width: 1200,
          height: 630,
          alt: `${business.name} - ${business.suburb}`,
        }
      ] : [
        {
          url: `${baseUrl}/api/og?slug=${business.slug}`,
          width: 1200,
          height: 630,
          alt: `${business.name} - ${business.suburb}`,
        }
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${business.name} - ${business.suburb}`,
      description: business.bio || `Professional ${business.category || 'services'} in ${business.suburb}`,
      images: business.logo ? [business.logo] : [`${baseUrl}/api/og?slug=${business.slug}`],
    },
    alternates: {
      canonical: profileUrl,
    },
  };
}

export default async function BusinessLayout({ params, children }: Props) {
  const business = await prisma.business.findUnique({
    where: { 
      OR: [
        { slug: params.slug },
        { id: params.slug }
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
  const businessJsonLd = generateBusinessJsonLd(business, profileUrl);
  const breadcrumbJsonLd = generateBreadcrumbJsonLd(business, profileUrl);

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