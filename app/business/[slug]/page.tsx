"use client";

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
  MessageCircle,
  Share2,
  Building2,
  Facebook,
  Instagram,
  Linkedin
} from "lucide-react";
import Link from "next/link";
import { Metadata } from "next";
import { getThemeById, generateThemeCSS, type ProfileTheme } from "@/lib/constants/profile-themes";
import { useEffect, useState } from "react";

// Using prisma singleton from lib/prisma.ts

interface BusinessProfileProps {
  params: {
    slug: string;
  };
}

// Note: Metadata generation removed for client component compatibility
// For SEO, consider implementing server-side rendering or using a separate layout

export default function BusinessProfilePage({ params }: BusinessProfileProps) {
  const [business, setBusiness] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBusiness = async () => {
      try {
        const response = await fetch(`/api/business/${params.slug}`);
        if (!response.ok) {
          if (response.status === 404) {
            notFound();
          }
          throw new Error('Failed to fetch business');
        }
        const data = await response.json();
        setBusiness(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchBusiness();
  }, [params.slug]);

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  if (error || !business) {
    notFound();
  }

  // Get theme configuration
  const theme = getThemeById(business.themeId || 'corporate-blue');
  const themeCSS = theme ? generateThemeCSS(theme) : '';

  const businessInitials = business.name
    .split(' ')
    .map((word: string) => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const handleContactClick = () => {
    // This would typically open a contact modal or lead form
    console.log('Contact business:', business.id);
  };

  const handleShareClick = () => {
    if (navigator.share) {
      navigator.share({
        title: business.name,
        text: `Check out ${business.name} on Suburbmates`,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: theme?.colors.background || '#f8fafc' }}>
      {/* Dynamic Theme Styles */}
      <style jsx>{themeCSS}</style>
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
                    <AvatarImage src={business.logo || undefined} alt={business.name} />
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
                      <Badge variant="secondary" className="bg-success/10 text-success">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Verified Business
                      </Badge>
                      {business.abn && (
                        <Badge variant="secondary" className="bg-blue-50 text-blue-700">
                          ABN Verified
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center text-muted-foreground mb-2">
                      <MapPin className="w-4 h-4 mr-2" />
                      <span>Based in {business.suburb}, VIC</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-3">
                    <Button 
                      onClick={handleContactClick} 
                      size="lg" 
                      className="flex-1 md:flex-none"
                      style={{ 
                        backgroundColor: theme?.colors.primary,
                        borderColor: theme?.colors.primary 
                      }}
                    >
                      <MessageCircle className="w-4 h-4 mr-2" />
                      {business.ctaText || 'Get Quote'}
                    </Button>
                    <Button variant="outline" onClick={handleShareClick}>
                      <Share2 className="w-4 h-4 mr-2" />
                      Share
                    </Button>
                  </div>
                </div>
              </div>
            </CardHeader>
          </Card>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="md:col-span-2 space-y-6">
              {/* About Section */}
              {business.bio && (
                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Building2 className="w-5 h-5" />
                      About {business.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 leading-relaxed">
                      {business.bio}
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Service Areas */}
              {business.serviceAreas.length > 0 && (
                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="w-5 h-5" />
                      Service Areas
                    </CardTitle>
                    <CardDescription>
                      We provide services in the following Melbourne suburbs:
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {business.serviceAreas.map((suburb: string) => (
                        <Badge 
                          key={suburb} 
                          variant="outline" 
                          className="bg-blue-50 text-blue-700 border-blue-200"
                        >
                          {suburb}
                        </Badge>
                      ))}
                    </div>
                    <p className="text-sm text-muted-foreground mt-3">
                      Serving {business.serviceAreas.length} suburb{business.serviceAreas.length !== 1 ? 's' : ''} across Melbourne
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Gallery Section */}
              {business.showGallery && (
                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Building2 className="w-5 h-5" />
                      Gallery
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {/* Placeholder gallery items */}
                      {[1, 2, 3, 4, 5, 6].map((item) => (
                        <div 
                          key={item}
                          className="aspect-square bg-muted rounded-lg flex items-center justify-center"
                        >
                          <Building2 className="w-8 h-8 text-muted-foreground" />
                        </div>
                      ))}
                    </div>
                    <p className="text-sm text-muted-foreground mt-3 text-center">
                      Gallery coming soon! Upload photos in your dashboard.
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Reviews Section */}
              {business.showTestimonials && (
                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Star className="w-5 h-5" />
                      Customer Reviews
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8 text-muted-foreground">
                      <Star className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>No reviews yet. Be the first to review {business.name}!</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Contact Information */}
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle>Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {business.phone && (
                    <div className="flex items-center gap-3">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{business.phone}</p>
                        <p className="text-sm text-muted-foreground">Phone</p>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{business.email}</p>
                      <p className="text-sm text-muted-foreground">Email</p>
                    </div>
                  </div>

                  {business.website && (
                    <div className="flex items-center gap-3">
                      <Globe className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <Link 
                          href={business.website} 
                          target="_blank" 
                          className="font-medium text-primary hover:underline"
                        >
                          Visit Website
                        </Link>
                        <p className="text-sm text-muted-foreground">Website</p>
                      </div>
                    </div>
                  )}

                  <Separator />
                  
                  <Button onClick={handleContactClick} className="w-full">
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Send Message
                  </Button>
                </CardContent>
              </Card>

              {/* Business Hours */}
              {business.showBusinessHours && (
                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="w-5 h-5" />
                      Business Hours
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Monday - Friday</span>
                        <span className="text-muted-foreground">9:00 AM - 5:00 PM</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Saturday</span>
                        <span className="text-muted-foreground">9:00 AM - 2:00 PM</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Sunday</span>
                        <span className="text-muted-foreground">Closed</span>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-3">
                      Hours may vary. Please contact for confirmation.
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Social Media Links */}
              {(business.facebookUrl || business.instagramUrl || business.linkedinUrl) && (
                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle>Follow Us</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-3">
                      {business.facebookUrl && (
                        <Link href={business.facebookUrl} target="_blank" className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors">
                          <Facebook className="w-5 h-5" />
                        </Link>
                      )}
                      {business.instagramUrl && (
                        <Link href={business.instagramUrl} target="_blank" className="p-2 rounded-lg bg-pink-50 text-pink-600 hover:bg-pink-100 transition-colors">
                          <Instagram className="w-5 h-5" />
                        </Link>
                      )}
                      {business.linkedinUrl && (
                        <Link href={business.linkedinUrl} target="_blank" className="p-2 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors">
                          <Linkedin className="w-5 h-5" />
                        </Link>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Trust Signals */}
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle>Trust & Safety</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-success" />
                    <span>Identity Verified</span>
                  </div>
                  {business.abn && (
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-success" />
                      <span>ABN Verified</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-success" />
                    <span>Suburbmates Member</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      {/* Footer with Suburbmates Branding */}
      <footer className="border-t bg-white/80 backdrop-blur-sm mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <span className="text-sm">Powered by</span>
              <Link href="/" className="font-bold text-primary hover:underline">
                Suburbmates
              </Link>
            </div>
            <p className="text-xs text-muted-foreground max-w-md mx-auto">
              Connecting Melbourne's business community. Find trusted local businesses 
              and grow your network with Suburbmates.
            </p>
            <div className="flex justify-center gap-4 text-xs text-muted-foreground">
              <Link href="/about" className="hover:text-primary">
                About
              </Link>
              <Link href="/signup" className="hover:text-primary">
                List Your Business
              </Link>
              <Link href="/search" className="hover:text-primary">
                Find Businesses
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Cleanup Prisma connection
export const dynamic = 'force-dynamic';
export const revalidate = 3600; // Revalidate every hour