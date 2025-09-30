import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/database/prisma';
import { ShareableProfileView } from '@/components/business/ShareableProfileView';
import { SocialShareButtons } from '@/components/business/SocialShareButtons';
import QRCodeGenerator from '@/components/business/QRCodeGenerator';
import EmbedCodeGenerator from '@/components/business/EmbedCodeGenerator';
import { generateBusinessStructuredData } from '@/lib/utils/structured-data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface ShareBusinessPageProps {
  params: Promise<{ slug: string }>;
}

// Generate metadata for social sharing
export async function generateMetadata({ params }: ShareBusinessPageProps): Promise<Metadata> {
  try {
    const { slug } = await params;
    const business = await prisma.business.findUnique({
      where: { slug },
      include: { customization: true },
    });

    if (!business) {
      return {
        title: 'Business Not Found | SuburbMates',
        description: 'The business profile you are looking for could not be found.',
      };
    }

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://suburbmates.com.au';
    const profileUrl = `${baseUrl}/business/${business.slug}`;
    const shareUrl = `${baseUrl}/business/${business.slug}/share`;
    const ogImageUrl = `${baseUrl}/api/og?slug=${business.slug}&type=share`;

    return {
      title: `${business.name} | ${business.suburb} | SuburbMates`,
      description: business.bio || `Professional ${business.category || 'business'} services in ${business.suburb}, Melbourne. Connect with ${business.name} through SuburbMates.`,
      keywords: [
        business.name,
        business.category || 'business',
        business.suburb,
        'Melbourne',
        'business directory',
        'local business',
        'professional services',
      ],
      authors: [{ name: 'SuburbMates' }],
      creator: 'SuburbMates',
      publisher: 'SuburbMates',
      alternates: {
        canonical: profileUrl,
      },
      openGraph: {
        title: `${business.name} - Professional Services in ${business.suburb}`,
        description: business.bio || `Connect with ${business.name}, a trusted ${business.category || 'business'} in ${business.suburb}, Melbourne.`,
        url: shareUrl,
        siteName: 'SuburbMates',
        type: 'website',
        locale: 'en_AU',
        images: [
          {
            url: ogImageUrl,
            width: 1200,
            height: 630,
            alt: `${business.name} - ${business.category} in ${business.suburb}`,
            type: 'image/png',
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        site: '@SuburbMates',
        creator: '@SuburbMates',
        title: `${business.name} | ${business.suburb}`,
        description: business.bio?.substring(0, 160) || `Professional ${business.category || 'business'} services in ${business.suburb}, Melbourne.`,
        images: [ogImageUrl],
      },
      robots: {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
          'max-video-preview': -1,
          'max-image-preview': 'large',
          'max-snippet': -1,
        },
      },
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: 'Business Profile | SuburbMates',
      description: 'Professional business services in Melbourne.',
    };
  }
}

export default async function ShareBusinessPage({ params }: ShareBusinessPageProps) {
  try {
    const { slug } = await params;
    const business = await prisma.business.findUnique({
      where: { slug },
      include: {
        customization: true,
        leads: {
          where: { status: 'NEW' },
          take: 5, // Recent inquiries for social proof
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!business) {
      notFound();
    }

    // Log profile view for analytics
    try {
      const { logAuditEvent } = await import('@/lib/utils/audit');
      await logAuditEvent({
        action: 'VIEW_SHARED_PROFILE',
        target: business.id,
        meta: {
          businessName: business.name,
          viewType: 'share',
          slug: business.slug,
        },
      });
    } catch (auditError) {
      console.error('Failed to log profile view:', auditError);
      // Don't fail the page load for audit logging
    }

    // Generate structured data for search engines
const structuredData = generateBusinessStructuredData(business as any);

    const baseUrl = process.env.NODE_ENV === 'production' 
      ? 'https://suburbmates.com.au' 
      : 'http://localhost:3000';
    const shareUrl = `${baseUrl}/business/${business.slug}/share`;

    return (
      <>
        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />

        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Shareable Profile Preview */}
            <div className="space-y-4">
              <h1 className="text-2xl font-bold text-gray-900">
                Share {business.name}
              </h1>
              <p className="text-gray-600">
                Share this professional business profile on social media, embed it on websites, or generate QR codes for offline marketing.
              </p>
              
              <ShareableProfileView 
                business={{
                  id: business.id,
                  name: business.name,
                  slug: business.slug,
                  email: business.email || '',
                  suburb: business.suburb,
                  category: business.category || undefined,
                  ctaText: business.ctaText || undefined,
                  approvalStatus: business.approvalStatus,
                  createdAt: business.createdAt.toISOString(),
                } as any}
                customization={business.customization || undefined}
                showWatermark={true}
                enableSharing={false}
                variant="share"
                className="max-w-md"
              />
            </div>

            {/* Sharing Tools */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Sharing Tools</CardTitle>
                  <p className="text-sm text-gray-600">
Choose how you&apos;d like to share this business profile
                  </p>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="social" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="social">Social Media</TabsTrigger>
                      <TabsTrigger value="qr">QR Code</TabsTrigger>
                      <TabsTrigger value="embed">Embed Code</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="social" className="space-y-4">
                      <SocialShareButtons
                        business={{ id: business.id, name: business.name, slug: business.slug, suburb: business.suburb, category: business.category || undefined, bio: business.bio || undefined }}
                        url={shareUrl}
                      />
                    </TabsContent>
                    
                    <TabsContent value="qr">
                      <QRCodeGenerator
                        businessName={business.name}
                        businessSlug={business.slug}
                      />
                    </TabsContent>
                    
                    <TabsContent value="embed">
                      <EmbedCodeGenerator
                        businessName={business.name}
                        businessSlug={business.slug}
                      />
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
              
              {/* Additional Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Marketing Tips</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-gray-600 space-y-3">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">Social Media Sharing</h4>
                    <p>Share on Facebook, Twitter, LinkedIn, and WhatsApp to reach different audiences and maximize visibility.</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">QR Code Usage</h4>
                    <p>Print QR codes on business cards, flyers, or display them in your physical location for easy profile access.</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">Website Embedding</h4>
                    <p>Embed your profile on your website or partner sites to showcase your SuburbMates presence.</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </>
    );
  } catch (error) {
    console.error('Error rendering share page:', error);
    notFound();
  }
}