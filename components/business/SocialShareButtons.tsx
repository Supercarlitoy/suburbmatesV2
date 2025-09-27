"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { ga } from '@/lib/ga';
import { 
  Facebook, 
  Twitter, 
  Linkedin, 
  Link, 
  QrCode,
  Code,
  Download
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { QRCodeGenerator } from './QRCodeGenerator';
import { EmbedCodeGenerator } from './EmbedCodeGenerator';

interface Business {
  id: string;
  name: string;
  slug: string;
  suburb: string;
  category?: string;
  bio?: string;
}

interface SocialShareButtonsProps {
  business: Business;
  url: string;
  className?: string;
  variant?: 'default' | 'compact' | 'expanded';
}

export function SocialShareButtons({
  business,
  url,
  className,
  variant = 'default'
}: SocialShareButtonsProps) {
  const { toast } = useToast();
  const [showQR, setShowQR] = useState(false);
  const [showEmbed, setShowEmbed] = useState(false);

  const shareTitle = `${business.name} - Professional Services in ${business.suburb}`;
  const shareDescription = business.bio || `Connect with ${business.name}, a trusted ${business.category || 'business'} in ${business.suburb}, Melbourne.`;

  const handleFacebookShare = () => {
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
    window.open(facebookUrl, '_blank', 'width=600,height=400');
    logShare('facebook');
  };

  const handleTwitterShare = () => {
    const twitterText = `Check out ${business.name} on SuburbMates - ${shareDescription.substring(0, 120)}...`;
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(twitterText)}&url=${encodeURIComponent(url)}`;
    window.open(twitterUrl, '_blank', 'width=600,height=400');
    logShare('twitter');
  };

  const handleLinkedInShare = () => {
    const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
    window.open(linkedinUrl, '_blank', 'width=600,height=400');
    logShare('linkedin');
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      toast({
        title: "Link copied!",
        description: "The profile link has been copied to your clipboard.",
      });
      logShare('copy_link');
    } catch (error) {
      console.error('Failed to copy link:', error);
      toast({
        title: "Failed to copy link",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  const logShare = async (platform: string) => {
    // Track GA4 event
    ga('share_click', {
      business_id: business.id,
      business_name: business.name,
      network: platform,
      suburb: business.suburb,
      category: business.category || 'unknown',
    });

    try {
      await fetch('/api/analytics/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessId: business.id,
          platform,
          url,
        }),
      });
    } catch (error) {
      console.error('Failed to log share:', error);
    }
  };

  const handleDownloadCard = async () => {
    try {
      // Generate business card image
      const response = await fetch(`/api/og?businessId=${business.id}&type=business-card`);
      const blob = await response.blob();
      
      // Create download link
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `${business.slug}-business-card.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
      
      toast({
        title: "Business card downloaded!",
        description: "Your business card image has been saved.",
      });
      logShare('download_card');
    } catch (error) {
      console.error('Failed to download business card:', error);
      toast({
        title: "Download failed",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  if (variant === 'compact') {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <Button
          variant="outline"
          size="sm"
          onClick={handleFacebookShare}
          className="w-8 h-8 p-0"
        >
          <Facebook className="h-4 w-4" />
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={handleTwitterShare}
          className="w-8 h-8 p-0"
        >
          <Twitter className="h-4 w-4" />
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={handleLinkedInShare}
          className="w-8 h-8 p-0"
        >
          <Linkedin className="h-4 w-4" />
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={handleCopyLink}
          className="w-8 h-8 p-0"
        >
          <Link className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  if (variant === 'expanded') {
    return (
      <div className={cn("space-y-4", className)}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Button
            variant="outline"
            onClick={handleFacebookShare}
            className="flex items-center gap-2 bg-[#1877f2] text-white hover:bg-[#166fe5] border-[#1877f2]"
          >
            <Facebook className="h-4 w-4" />
            Facebook
          </Button>
          
          <Button
            variant="outline"
            onClick={handleTwitterShare}
            className="flex items-center gap-2 bg-[#1da1f2] text-white hover:bg-[#1a8cd8] border-[#1da1f2]"
          >
            <Twitter className="h-4 w-4" />
            Twitter
          </Button>
          
          <Button
            variant="outline"
            onClick={handleLinkedInShare}
            className="flex items-center gap-2 bg-[#0077b5] text-white hover:bg-[#006ba1] border-[#0077b5]"
          >
            <Linkedin className="h-4 w-4" />
            LinkedIn
          </Button>
          
          <Button
            variant="outline"
            onClick={handleCopyLink}
            className="flex items-center gap-2"
          >
            <Link className="h-4 w-4" />
            Copy Link
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Button
            variant="outline"
            onClick={() => setShowQR(true)}
            className="flex items-center gap-2"
          >
            <QrCode className="h-4 w-4" />
            QR Code
          </Button>
          
          <Button
            variant="outline"
            onClick={() => setShowEmbed(true)}
            className="flex items-center gap-2"
          >
            <Code className="h-4 w-4" />
            Embed Code
          </Button>
          
          <Button
            variant="outline"
            onClick={handleDownloadCard}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Business Card
          </Button>
        </div>

        {/* QR Code Modal */}
        {showQR && (
          <QRCodeGenerator
            business={business}
            url={url}
            isOpen={showQR}
            onClose={() => setShowQR(false)}
          />
        )}

        {/* Embed Code Modal */}
        {showEmbed && (
          <EmbedCodeGenerator
            business={business}
            url={url}
            isOpen={showEmbed}
            onClose={() => setShowEmbed(false)}
          />
        )}
      </div>
    );
  }

  // Default variant
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Button
        variant="outline"
        size="sm"
        onClick={handleFacebookShare}
        className="flex items-center gap-2"
      >
        <Facebook className="h-4 w-4" />
        <span className="hidden sm:inline">Share</span>
      </Button>
      
      <Button
        variant="outline"
        size="sm"
        onClick={handleTwitterShare}
        className="flex items-center gap-2"
      >
        <Twitter className="h-4 w-4" />
        <span className="hidden sm:inline">Tweet</span>
      </Button>
      
      <Button
        variant="outline"
        size="sm"
        onClick={handleLinkedInShare}
        className="flex items-center gap-2"
      >
        <Linkedin className="h-4 w-4" />
        <span className="hidden sm:inline">Share</span>
      </Button>
      
      <Button
        variant="outline"
        size="sm"
        onClick={handleCopyLink}
        className="flex items-center gap-2"
      >
        <Link className="h-4 w-4" />
        <span className="hidden sm:inline">Copy</span>
      </Button>
    </div>
  );
}