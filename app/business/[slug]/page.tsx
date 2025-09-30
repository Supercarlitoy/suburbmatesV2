import { notFound } from "next/navigation";
import { prisma } from "@/lib/database/prisma";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  Clock, 
  CheckCircle, 
  Star,
  Building2,
  Facebook,
  Instagram,
  Linkedin,
  AlertTriangle
} from "lucide-react";
import Link from "next/link";
import { Metadata } from "next";
import { getThemeById, generateThemeCSS } from "@/lib/constants/profile-themes";
import { createClient } from '@/lib/supabase/server';
import { BusinessProfileClient } from './BusinessProfileClient';

interface BusinessProfileProps {
  params: Promise<{ slug: string }>;
}

// Server-side data fetching function
async function getBusinessData(slug: string) {
  try {
    // Get the current user to determine access level
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    let isAdmin = false;
    let isOwner = false;
    
    if (user) {
      // Check if user is admin
      const userData = await prisma.user.findUnique({
        where: { id: user.id },
        select: { role: true }
      });
      
      isAdmin = userData?.role === 'ADMIN';
    }

    // Find business by slug with new schema
    const business = await prisma.business.findUnique({
      where: { slug },
      include: {
        owner: {
          select: {
            id: true,
            email: true,
            role: true,
          }
        },
        customization: true,
      }
    });

    if (!business) {
      return null;
    }

    // Check if current user is the business owner
    if (user && business.ownerId === user.id) {
      isOwner = true;
    }

    // Access control: Only show approved businesses to public, unless user is admin or owner
    if (business.approvalStatus !== 'APPROVED' && !isAdmin && !isOwner) {
      return null;
    }

    // Parse service areas via centralized helper
    const { parseServiceAreas } = await import('@/lib/business/normalize');
    const serviceAreas: string[] = parseServiceAreas(business.serviceAreas, business.suburb);

    return {
      id: business.id,
      slug: business.slug,
      name: business.name,
      email: business.email,
      phone: business.phone,
      website: business.website,
      abn: business.abn,
      bio: business.bio,
      suburb: business.suburb,
      category: business.category,
      serviceAreas,
      themeId: business.themeId,
      layoutId: business.layoutId,
      headerStyle: business.headerStyle,
      ctaText: business.ctaText,
      ctaStyle: business.ctaStyle,
      showTestimonials: business.showTestimonials,
      showGallery: business.showGallery,
      showBusinessHours: business.showBusinessHours,
      facebookUrl: business.facebookUrl,
      instagramUrl: business.instagramUrl,
      linkedinUrl: business.linkedinUrl,
      approvalStatus: business.approvalStatus,
      abnStatus: business.abnStatus,
      requiresVerification: business.requiresVerification,
      qualityScore: business.qualityScore,
      source: business.source,
      createdAt: business.createdAt,
      updatedAt: business.updatedAt,
      customization: business.customization,
      _canEdit: isOwner || isAdmin,
      _isOwner: isOwner,
      _isAdmin: isAdmin,
    };
    
  } catch (error) {
    console.error('Error fetching business:', error);
    return null;
  }
}

// Generate metadata for SEO
export async function generateMetadata({ params }: BusinessProfileProps): Promise<Metadata> {
  const { slug } = await params;
  const business = await getBusinessData(slug);
  
  if (!business) {
    return {
      title: 'Business Not Found',
      description: 'The requested business could not be found.'
    };
  }

  const title = `${business.name} - ${business.suburb} | SuburbMates`;
  const description = business.bio 
    ? `${business.bio.slice(0, 155)}...` 
    : `Find ${business.name} in ${business.suburb}. ${business.category ? `${business.category} services` : 'Local business'} on SuburbMates.`;
  
  const url = `https://suburbmates.com.au/business/${business.slug}`;
  const image = business.customization?.logoUrl || '/images/default-business.jpg';

  return {
    title,
    description,
    keywords: [
      business.name,
      business.suburb,
      business.category || 'business',
      'Melbourne',
      'local business',
      'SuburbMates'
    ].filter(Boolean).join(', '),
    authors: [{ name: 'SuburbMates' }],
    creator: 'SuburbMates',
    publisher: 'SuburbMates',
    openGraph: {
      type: 'website',
      url,
      title,
      description,
      images: [{
        url: image,
        width: 1200,
        height: 630,
        alt: `${business.name} profile image`
      }],
      siteName: 'SuburbMates',
      locale: 'en_AU',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
    },
    alternates: {
      canonical: url,
    },
    robots: {
      index: business.approvalStatus === 'APPROVED',
      follow: true,
      googleBot: {
        index: business.approvalStatus === 'APPROVED',
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
}

export default async function BusinessProfilePage({ params }: BusinessProfileProps) {
  const { slug } = await params;
  const business = await getBusinessData(slug);

  if (!business) {
    notFound();
  }

  // Generate LocalBusiness JSON-LD structured data
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: business.name,
    description: business.bio || `${business.name} - Local business in ${business.suburb}, Melbourne`,
    url: `https://suburbmates.com.au/business/${business.slug}`,
    address: {
      '@type': 'PostalAddress',
      addressLocality: business.suburb,
      addressRegion: 'Victoria',
      addressCountry: 'AU',
    },
    ...(business.phone && { telephone: business.phone }),
    ...(business.email && { email: business.email }),
    ...(business.website && { sameAs: [business.website] }),
    ...(business.category && { 
      '@type': business.category.includes('Restaurant') ? 'Restaurant' : 'LocalBusiness',
      category: business.category 
    }),
    ...(business.facebookUrl || business.instagramUrl || business.linkedinUrl) && {
      sameAs: [
        business.website,
        business.facebookUrl,
        business.instagramUrl,
        business.linkedinUrl,
      ].filter(Boolean)
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: business.qualityScore ? (business.qualityScore / 20).toFixed(1) : '4.5',
      bestRating: '5',
      worstRating: '1',
      ratingCount: business.qualityScore ? Math.floor(business.qualityScore / 10) : 25,
    },
    openingHoursSpecification: business.showBusinessHours ? {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      opens: '09:00',
      closes: '17:00',
    } : undefined,
    areaServed: business.serviceAreas?.length ? business.serviceAreas.map(area => ({
      '@type': 'City',
      name: area,
      addressRegion: 'Victoria',
      addressCountry: 'AU',
    })) : [{
      '@type': 'City', 
      name: business.suburb,
      addressRegion: 'Victoria',
      addressCountry: 'AU',
    }],
    founder: {
      '@type': 'Organization',
      name: 'SuburbMates',
      url: 'https://suburbmates.com.au',
    },
    ...(business.abnStatus === 'VERIFIED' && business.abn && {
      taxID: business.abn,
      identifier: {
        '@type': 'PropertyValue',
        name: 'ABN',
        value: business.abn,
      },
    }),
  };

  // Get theme configuration for styling
  const theme = getThemeById(business.themeId || 'corporate-blue');
  const themeCSS = theme ? generateThemeCSS(theme) : '';

  // Generate business initials for avatar
  const businessInitials = business.name
    .split(' ')
    .map((word: string) => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="min-h-screen" style={{ backgroundColor: theme?.colors.background || '#f8fafc' }}>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd),
        }}
      />
      
      {/* Dynamic Theme Styles */}
      {themeCSS && (
        <style dangerouslySetInnerHTML={{ __html: themeCSS }} />
      )}
      
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold text-primary">
              Suburbmates
            </Link>
            <div className="flex items-center gap-4">
              <Link href="/search">
                <Button variant="ghost" size="sm">
                  Find Businesses
                </Button>
              </Link>
              <Link href="/signup">
                <Button variant="outline" size="sm">
                  List Your Business
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Business Header Card */}
          <Card className="glass-card shadow-premium">
            <CardHeader className="pb-4">
              <div className="flex flex-col md:flex-row gap-6">
                {/* Business Avatar */}
                <div className="flex-shrink-0">
                  <Avatar className="w-24 h-24 border-4 border-white shadow-lg">
                    <AvatarImage src={business.customization?.logoUrl || undefined} alt={business.name} />
                    <AvatarFallback className="text-2xl font-bold bg-primary text-white">
                      {businessInitials}
                    </AvatarFallback>
                  </Avatar>
                </div>

                {/* Business Info */}
                <div className="flex-1 space-y-3">
                  <div>
                    <CardTitle className="text-3xl font-bold text-gray-900 mb-2">
                      {business.name}
                    </CardTitle>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {business.category && (
                        <Badge variant="secondary" className="bg-primary/10 text-primary">
                          <Building2 className="w-3 h-3 mr-1" />
                          {business.category}
                        </Badge>
                      )}
                      
                      {/* 
                        Badge Display Rules per directory-admin-spec.md:
                        - "Verified" badge: Only when abnStatus = 'VERIFIED'
                        - "Community-listed" chip: When APPROVED without ABN verification
                      */}
                      {business.abnStatus === 'VERIFIED' && (
                        <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-200">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Verified
                        </Badge>
                      )}
                      
                      {business.approvalStatus === 'APPROVED' && business.abnStatus !== 'VERIFIED' && (
                        <Badge variant="secondary" className="bg-blue-100 text-blue-700 border-blue-200">
                          <Star className="w-3 h-3 mr-1" />
                          Community-listed
                        </Badge>
                      )}
                      
                      {/* Status badges for owner/admin view only */}
                      {business.approvalStatus === 'PENDING' && (business._isOwner || business._isAdmin) && (
                        <Badge variant="secondary" className="bg-yellow-100 text-yellow-700 border-yellow-200">
                          <Clock className="w-3 h-3 mr-1" />
                          Pending Approval
                        </Badge>
                      )}
                      
                      {business.abnStatus === 'PENDING' && (business._isOwner || business._isAdmin) && (
                        <Badge variant="secondary" className="bg-orange-100 text-orange-700 border-orange-200">
                          <Clock className="w-3 h-3 mr-1" />
                          ABN Verification Pending
                        </Badge>
                      )}
                      
                      {business.abnStatus === 'INVALID' && (business._isOwner || business._isAdmin) && (
                        <Badge variant="destructive" className="bg-red-100 text-red-700 border-red-200">
                          <AlertTriangle className="w-3 h-3 mr-1" />
                          ABN Invalid
                        </Badge>
                      )}
                      
                      {business.abnStatus === 'EXPIRED' && (business._isOwner || business._isAdmin) && (
                        <Badge variant="secondary" className="bg-gray-100 text-gray-700 border-gray-200">
                          <AlertTriangle className="w-3 h-3 mr-1" />
                          ABN Expired
                        </Badge>
                      )}
                      
                      {/* Quality Score (for admin/owner) */}
                      {(business._isAdmin || business._isOwner) && business.qualityScore > 0 && (
                        <Badge variant="secondary" className="bg-purple-100 text-purple-700 border-purple-200">
                          <Star className="w-3 h-3 mr-1" />
                          Quality: {business.qualityScore}%
                        </Badge>
                      )}
                    </div>
                  </div>

                  {business.bio && (
                    <CardDescription className="text-lg text-gray-700 leading-relaxed">
                      {business.bio}
                    </CardDescription>
                  )}

                  {/* Location */}
                  <div className="flex items-center text-gray-600">
                    <MapPin className="w-4 h-4 mr-2" />
                    <span>{business.suburb}, Victoria</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col gap-2 md:w-auto w-full">
          <BusinessProfileClient business={{ id: business.id, name: business.name, ctaText: business.ctaText || undefined }} />
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="w-5 h-5" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {business.phone && (
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <span>{business.phone}</span>
                </div>
              )}
              
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-gray-400" />
                <span>{business.email}</span>
              </div>
              
              {business.website && (
                <div className="flex items-center gap-3">
                  <Globe className="w-4 h-4 text-gray-400" />
                  <a 
                    href={business.website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    Visit Website
                  </a>
                </div>
              )}
              
              {/* Social Media Links */}
              {(business.facebookUrl || business.instagramUrl || business.linkedinUrl) && (
                <>
                  <Separator className="my-4" />
                  <div className="flex items-center gap-4">
                    {business.facebookUrl && (
                      <a 
                        href={business.facebookUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-700"
                      >
                        <Facebook className="w-5 h-5" />
                      </a>
                    )}
                    {business.instagramUrl && (
                      <a 
                        href={business.instagramUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-pink-600 hover:text-pink-700"
                      >
                        <Instagram className="w-5 h-5" />
                      </a>
                    )}
                    {business.linkedinUrl && (
                      <a 
                        href={business.linkedinUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-700 hover:text-blue-800"
                      >
                        <Linkedin className="w-5 h-5" />
                      </a>
                    )}
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Service Areas */}
          {business.serviceAreas && business.serviceAreas.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Service Areas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {business.serviceAreas.map((area: string) => (
                    <Badge key={area} variant="outline">
                      {area}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}

export const dynamic = 'force-dynamic';
export const revalidate = 3600; // Revalidate every hour
