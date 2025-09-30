import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { MELBOURNE_SUBURBS } from '@/lib/constants/melbourne-suburbs';

interface Props {
  params: Promise<{ slug: string }>;
  children: React.ReactNode;
}

function findSuburbBySlug(slug: string) {
  return MELBOURNE_SUBURBS.find(suburb => 
    suburb.id === slug || 
    suburb.name.toLowerCase().replace(/\s+/g, '-') === slug.toLowerCase()
  );
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const suburb = findSuburbBySlug(slug);
  
  if (!suburb) {
    return {
      title: 'Suburb Not Found - SuburbMates',
    };
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://suburbmates.com.au';
  const suburbUrl = `${baseUrl}/suburb/${slug}`;
  
  // Generate OG image with fallback
  const ogUrl = `/api/og?slug=${encodeURIComponent(slug)}&name=${encodeURIComponent(`Businesses in ${suburb.name}`)}&suburb=${encodeURIComponent(suburb.name)}`;
  const fallback = "/social/og-image-default.png";

  return {
    title: `Businesses in ${suburb.name} – Verified Local Directory | SuburbMates`,
    description: `Discover verified local businesses in ${suburb.name}, Melbourne. From plumbers to cafes, find trusted services backed by ABN checks and real community reviews.`,
    keywords: `${suburb.name} businesses, ${suburb.name} Melbourne, local businesses ${suburb.name}, verified businesses, ${suburb.name} directory`,
    openGraph: {
      title: `Businesses in ${suburb.name} – Verified Local Directory`,
      description: `Find trusted local businesses in ${suburb.name}, Melbourne. Verified profiles with reviews and direct contact.`,
      url: suburbUrl,
      type: 'website',
      locale: 'en_AU',
      siteName: 'SuburbMates',
      images: [ogUrl, fallback],
    },
    twitter: {
      card: 'summary_large_image',
      title: `Businesses in ${suburb.name}`,
      description: `Verified local businesses in ${suburb.name}, Melbourne`,
      images: [ogUrl, fallback],
    },
    alternates: {
      canonical: suburbUrl,
    },
    robots: {
      index: true,
      follow: true,
    }
  };
}

export default async function SuburbLayout({ params, children }: Props) {
  const { slug } = await params;
  const suburb = findSuburbBySlug(slug);
  
  if (!suburb) {
    notFound();
  }

  return <>{children}</>;
}