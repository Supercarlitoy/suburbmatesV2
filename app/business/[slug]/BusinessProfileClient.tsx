"use client";

import { Button } from "@/components/ui/button";
import { MessageCircle, Share2 } from "lucide-react";

interface BusinessProfileClientProps {
  business: {
    id: string;
    name: string;
    ctaText?: string;
  };
}

export function BusinessProfileClient({ business }: BusinessProfileClientProps) {
  const handleContactClick = () => {
    // This would typically open a contact modal or lead form
    console.log('Contact business:', business.id);
    // TODO: Implement ContactBusinessForm modal
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
      // TODO: Show toast notification
      console.log('Link copied to clipboard');
    }
  };

  return (
    <>
      <Button 
        className="w-full md:w-auto"
        onClick={handleContactClick}
      >
        <MessageCircle className="w-4 h-4 mr-2" />
        Contact Business
      </Button>
      
      <Button 
        variant="outline" 
        onClick={handleShareClick}
        className="w-full md:w-auto"
      >
        <Share2 className="w-4 h-4 mr-2" />
        Share Profile
      </Button>
    </>
  );
}