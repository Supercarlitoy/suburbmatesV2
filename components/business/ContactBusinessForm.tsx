"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { ga } from '@/lib/ga';
import { 
  MessageCircle, 
  Mail, 
  Phone, 
  User,
  Send,
  CheckCircle
} from 'lucide-react';

interface Business {
  id: string;
  name: string;
  slug: string;
  suburb: string;
  category?: string;
  email: string;
}

interface ContactBusinessFormProps {
  business: Business;
  isOpen: boolean;
  onClose: () => void;
}

const ContactFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Valid email address is required'),
  phone: z.string().optional(),
  message: z.string().min(10, 'Please provide more details about your inquiry'),
  utmSource: z.string().optional(),
  utmMedium: z.string().optional(),
  utmCampaign: z.string().optional(),
});

type ContactFormData = z.infer<typeof ContactFormSchema>;

export function ContactBusinessForm({
  business,
  isOpen,
  onClose
}: ContactBusinessFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ContactFormData>({
    resolver: zodResolver(ContactFormSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      message: '',
    },
  });

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);
    
    try {
      // Get UTM parameters from URL
      const urlParams = new URLSearchParams(window.location.search);
      const utmData = {
        utmSource: urlParams.get('utm_source') || undefined,
        utmMedium: urlParams.get('utm_medium') || undefined, 
        utmCampaign: urlParams.get('utm_campaign') || undefined,
      };

      const response = await fetch('/api/business/inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          businessId: business.id,
          ...utmData,
          source: window.location.href,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit inquiry');
      }

      setIsSuccess(true);
      reset();
      
      // Track lead submission event
      ga('lead_submit', {
        business_id: business.id,
        business_name: business.name,
        source: 'profile',
        suburb: business.suburb,
        category: business.category || 'unknown',
        currency: 'AUD',
        value: 50, // Estimated lead value
      });
      
      toast({
        title: "Message sent successfully!",
        description: `Your inquiry has been sent to ${business.name}. They will get back to you soon.`,
      });

      // Close modal after delay
      setTimeout(() => {
        onClose();
        setIsSuccess(false);
      }, 2000);

    } catch (error) {
      console.error('Contact form error:', error);
      toast({
        title: "Failed to send message",
        description: "Please try again or contact the business directly.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
      reset();
      setIsSuccess(false);
    }
  };

  if (isSuccess) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="rounded-full bg-green-100 p-3 mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Message Sent!</h3>
            <p className="text-muted-foreground mb-4">
              Your inquiry has been sent to {business.name}. They will respond soon.
            </p>
            <div className="text-sm text-muted-foreground">
              This window will close automatically...
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Contact {business.name}
          </DialogTitle>
          <DialogDescription>
            Send a message to {business.name} in {business.suburb}. 
            They will receive your inquiry and respond directly to your email.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Contact Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="flex items-center gap-1">
                <User className="h-3 w-3" />
                Your Name *
              </Label>
              <Input
                id="name"
                {...register('name')}
                placeholder="Your full name"
                className={errors.name ? 'border-destructive' : ''}
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-1">
                <Mail className="h-3 w-3" />
                Email Address *
              </Label>
              <Input
                id="email"
                type="email"
                {...register('email')}
                placeholder="your@email.com"
                className={errors.email ? 'border-destructive' : ''}
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone" className="flex items-center gap-1">
              <Phone className="h-3 w-3" />
              Phone Number (Optional)
            </Label>
            <Input
              id="phone"
              type="tel"
              {...register('phone')}
              placeholder="0412 345 678"
            />
          </div>

          {/* Message */}
          <div className="space-y-2">
            <Label htmlFor="message">
              Your Message *
            </Label>
            <Textarea
              id="message"
              {...register('message')}
              placeholder={`Hi ${business.name}, I'm interested in your ${business.category || 'services'} in ${business.suburb}. Please contact me with more information about...`}
              className={`min-h-[100px] ${errors.message ? 'border-destructive' : ''}`}
            />
            {errors.message && (
              <p className="text-sm text-destructive">{errors.message.message}</p>
            )}
          </div>

          {/* Business Info Display */}
          <div className="bg-muted/50 rounded-lg p-4 text-sm">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <MessageCircle className="h-4 w-4 text-primary" />
              </div>
              <div>
                <div className="font-medium">{business.name}</div>
                <div className="text-muted-foreground">{business.suburb}, VIC</div>
              </div>
            </div>
            <div className="text-xs text-muted-foreground">
              Your message will be sent directly to this business. They will respond to your email address.
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
              className="order-2 sm:order-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="order-1 sm:order-2 flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Sending...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Send Message
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}