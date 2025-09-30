"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { ProfileWatermark } from './ProfileWatermark';
import { SocialShareButtons } from './SocialShareButtons';
import { ContactBusinessForm } from './ContactBusinessForm';
import { glass } from '@/lib/design-system';
import { SuburbMatesLogo } from '@/components/ui/SuburbMatesLogo';
import { StatusBadge } from '@/components/ui/StatusBadge';
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
  Linkedin,
  ExternalLink
} from 'lucide-react';
import { getThemeById, generateThemeCSS } from '@/lib/constants/profile-themes';
import { cn } from '@/lib/utils';

interface Business {
  id: string;
  name: string;
  slug: string;
  email: string;
  phone?: string;
  website?: string;
  bio?: string;
  suburb: string;
  category?: string;
  themeId?: string;
  layoutId?: string;
  ctaText?: string;
  facebookUrl?: string;
  instagramUrl?: string;
  linkedinUrl?: string;
  approvalStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
}

interface BusinessProfileCustomization {
  layout: string;
  accent: string;
  watermarkOpacity: number;
  shareTheme: string;
  logoUrl?: string | null;
  coverImageUrl?: string | null;
  gallery: string[];
}

interface ShareableProfileViewProps {
  business: Business;
  customization?: BusinessProfileCustomization;
  showWatermark?: boolean;
  enableSharing?: boolean;
  variant?: 'profile' | 'share' | 'preview';
  className?: string;
}

export function ShareableProfileView({
  business,
  customization,
  showWatermark = true,
  enableSharing = false,
  variant = 'profile',
  className
}: ShareableProfileViewProps) {
  const [showContactForm, setShowContactForm] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

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
    setShowContactForm(true);
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: business.name,
          text: `Check out ${business.name} on SuburbMates`,
          url: window.location.href
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      // Fallback to copying URL
      navigator.clipboard.writeText(window.location.href);
      // TODO: Show toast notification
    }
  };

  const profileUrl = typeof window !== 'undefined' ? window.location.href : '';
  const shareUrl = profileUrl.replace('/share', '') + '/share';

  return (
    <div 
      className={cn(
        "min-h-screen relative",
        variant === 'share' && glass.heroBg,
        className
      )}
      style={{ backgroundColor: theme?.colors.background || '#f8fafc' }}
    >
      {/* Dynamic Theme Styles */}
      <style jsx>{themeCSS}</style>

      {/* Header */}
      {variant !== 'preview' && (
        <header className={`border-b ${glass.navBar} sticky top-0 z-50`}>
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <SuburbMatesLogo variant="NavigationLogo" size="sm" />
              {enableSharing && (
                <div className="flex items-center gap-2">
                  <SocialShareButtons 
                    business={business}
                    url={shareUrl}
                  />
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleNativeShare}
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    Share
                  </Button>
                </div>
              )}
            </div>
          </div>
        </header>
      )}

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 relative">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Business Header Card */}
          <Card className="glass-card shadow-premium">
            <CardHeader className="pb-4">
              <div className="flex flex-col md:flex-row gap-6">
                {/* Business Avatar */}
                <div className="flex-shrink-0">
                  <Avatar className="w-24 h-24 border-4 border-white shadow-lg">
                    <AvatarImage 
                      src={customization?.logoUrl || business.website} 
                      alt={business.name} 
                    />
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
                        <StatusBadge variant="blue" size="sm">
                          <Building2 className="w-3 h-3 mr-1" />
                          {business.category}
                        </StatusBadge>
                      )}
                      <StatusBadge variant="green" size="sm">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Verified Business
                      </StatusBadge>
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
                  </div>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Business Description */}
          {business.bio && (
            <Card>
              <CardContent className="pt-6">
                <h3 className="text-xl font-semibold mb-3">About {business.name}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {business.bio}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Contact Details */}
                <div className="space-y-3">
                  {business.phone && (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Phone className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">Phone</p>
                        <a 
                          href={`tel:${business.phone}`}
                          className="text-muted-foreground hover:text-primary transition-colors"
                        >
                          {business.phone}
                        </a>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Mail className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Email</p>
                      <a 
                        href={`mailto:${business.email}`}
                        className="text-muted-foreground hover:text-primary transition-colors"
                      >
                        {business.email}
                      </a>
                    </div>
                  </div>

                  {business.website && (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Globe className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">Website</p>
                        <a 
                          href={business.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
                        >
                          {business.website.replace(/^https?:\/\//, '')}
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  )}
                </div>

                {/* Social Media Links */}
                {(business.facebookUrl || business.instagramUrl || business.linkedinUrl) && (
                  <div className="space-y-3">
                    <h4 className="font-medium">Follow Us</h4>
                    <div className="flex gap-3">
                      {business.facebookUrl && (
                        <a 
                          href={business.facebookUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-10 h-10 rounded-full bg-[#1877f2] flex items-center justify-center text-white hover:opacity-80 transition-opacity"
                        >
                          <Facebook className="w-5 h-5" />
                        </a>
                      )}
                      
                      {business.instagramUrl && (
                        <a 
                          href={business.instagramUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center text-white hover:opacity-80 transition-opacity"
                        >
                          <Instagram className="w-5 h-5" />
                        </a>
                      )}
                      
                      {business.linkedinUrl && (
                        <a 
                          href={business.linkedinUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-10 h-10 rounded-full bg-[#0077b5] flex items-center justify-center text-white hover:opacity-80 transition-opacity"
                        >
                          <Linkedin className="w-5 h-5" />
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Gallery if available */}
          {customization?.gallery && customization.gallery.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Gallery</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {customization.gallery.slice(0, 6).map((image, index) => (
                    <div key={index} className="aspect-square rounded-lg overflow-hidden">
                      <img 
                        src={image} 
                        alt={`${business.name} gallery ${index + 1}`}
                        className="w-full h-full object-cover hover:scale-105 transition-transform"
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* SuburbMates Watermark */}
        {showWatermark && (
          <ProfileWatermark 
            opacity={customization?.watermarkOpacity || 0.15}
            position="bottom-right"
            style="minimal"
            theme="adaptive"
          />
        )}
      </main>

      {/* Contact Form Modal */}
      {showContactForm && (
        <ContactBusinessForm
          business={business}
          isOpen={showContactForm}
          onClose={() => setShowContactForm(false)}
        />
      )}

      {/* Footer with Attribution */}
      <footer className={`border-t ${glass.navBar} mt-16`}>
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Powered by</span>
              <a 
                href="https://suburbmates.com.au" 
                className="font-medium text-primary hover:underline"
              >
                SuburbMates
              </a>
              <span>• Melbourne's Business Community Platform</span>
            </div>
            <div className="text-xs text-muted-foreground">
              © 2024 SuburbMates. Professional business profiles.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}