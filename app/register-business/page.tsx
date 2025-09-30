"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { ga } from '@/lib/ga';
import { ProfileCustomizer } from "@/features/business-profiles/components/ProfileCustomizer";
import { 
  ArrowLeft, 
  ArrowRight, 
  Check, 
  Building2, 
  MapPin, 
  Palette, 
  Eye 
} from "lucide-react";
import { MELBOURNE_SUBURBS } from "@/lib/constants/melbourne-suburbs";
import { BUSINESS_CATEGORIES } from "@/lib/constants/business-categories";
import { DEFAULT_THEME, DEFAULT_LAYOUT, type CustomizationOptions } from "@/lib/constants/profile-themes";

interface BusinessFormData {
  name: string;
  email: string;
  phone: string;
  website: string;
  abn: string;
  bio: string;
  suburb: string;
  serviceAreas: string[];
  category: string;
  customization: CustomizationOptions;
}

const STEPS = [
  { id: 'business', title: 'Business Details', description: 'Basic information about your business' },
  { id: 'location', title: 'Location & Services', description: 'Where you operate and what you offer' },
  { id: 'customize', title: 'Customize Profile', description: 'Make your profile uniquely yours' },
  { id: 'preview', title: 'Review & Publish', description: 'Preview and publish your profile' },
];

export default function RegisterBusinessPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<BusinessFormData>({
    name: '',
    email: '',
    phone: '',
    website: '',
    abn: '',
    bio: '',
    suburb: '',
    serviceAreas: [],
    category: '',
    customization: {
      theme: DEFAULT_THEME,
      layout: DEFAULT_LAYOUT,
      headerStyle: 'standard',
      showTestimonials: true,
      showGallery: true,
      showServiceAreas: true,
      showBusinessHours: true,
      ctaText: 'Get Quote',
      ctaStyle: 'button',
      socialLinks: {},
    },
  });

  const updateFormData = (updates: Partial<BusinessFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const nextStep = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const validateCurrentStep = () => {
    switch (currentStep) {
      case 0: // Business Details
        return formData.name && formData.email && formData.category;
      case 1: // Location & Services
        return formData.suburb && formData.bio;
      case 2: // Customize Profile
        return formData.customization.theme && formData.customization.layout;
      case 3: // Review
        return true;
      default:
        return false;
    }
  };

  const handleSubmit = async () => {
    if (!validateCurrentStep()) {
      toast({
        title: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/business/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to register business');
      }

      const { business } = await response.json();
      
      // Track business registration completion
      ga('register_business', {
        business_id: business.id,
        business_name: business.name,
        step: 'completed',
        suburb: business.suburb,
        category: business.category || 'unknown',
        currency: 'AUD',
        value: 200, // Business signup value
      });
      
      toast({
        title: "Business profile created successfully!",
        description: "Your profile is now live and ready to share.",
      });

      // Redirect to the new business profile
      router.push(`/business/${business.slug}`);
    } catch (error) {
      console.error('Registration error:', error);
      toast({
        title: "Failed to create business profile",
        description: "Please try again or contact support.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const progress = ((currentStep + 1) / STEPS.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/')}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Home
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Register Your Business</h1>
                <p className="text-sm text-muted-foreground">
                  Create your professional profile in just a few steps
                </p>
              </div>
            </div>
            <Badge variant="secondary" className="text-sm">
              Step {currentStep + 1} of {STEPS.length}
            </Badge>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Progress Bar */}
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">{STEPS[currentStep].title}</span>
                  <span className="text-muted-foreground">{Math.round(progress)}% Complete</span>
                </div>
                <Progress value={progress} className="h-2" />
                <div className="flex justify-between text-xs text-muted-foreground">
                  {STEPS.map((step, index) => (
                    <div
                      key={step.id}
                      className={`flex items-center gap-1 ${
                        index <= currentStep ? 'text-primary' : 'text-muted-foreground'
                      }`}
                    >
                      {index < currentStep ? (
                        <Check className="h-3 w-3" />
                      ) : index === currentStep ? (
                        <div className="h-3 w-3 rounded-full bg-primary" />
                      ) : (
                        <div className="h-3 w-3 rounded-full bg-muted" />
                      )}
                      <span className="hidden sm:inline">{step.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Step Content */}
          <div className="grid gap-6">
            {/* Step 1: Business Details */}
            {currentStep === 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    Business Details
                  </CardTitle>
                  <CardDescription>
                    Tell us about your business - this information will be displayed on your profile.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Business Name *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => updateFormData({ name: e.target.value })}
                        placeholder="Your Business Name"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="category">Business Category *</Label>
                      <Select
                        value={formData.category}
                        onValueChange={(value) => updateFormData({ category: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {BUSINESS_CATEGORIES.map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => updateFormData({ email: e.target.value })}
                        placeholder="business@example.com"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => updateFormData({ phone: e.target.value })}
                        placeholder="0412 345 678"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="website">Website</Label>
                      <Input
                        id="website"
                        type="url"
                        value={formData.website}
                        onChange={(e) => updateFormData({ website: e.target.value })}
                        placeholder="https://yourbusiness.com.au"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="abn">ABN (Optional)</Label>
                      <Input
                        id="abn"
                        value={formData.abn}
                        onChange={(e) => updateFormData({ abn: e.target.value })}
                        placeholder="12 345 678 901"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 2: Location & Services */}
            {currentStep === 1 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Location & Services
                  </CardTitle>
                  <CardDescription>
                    Where do you operate and what services do you provide?
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="suburb">Primary Suburb *</Label>
                    <Select
                      value={formData.suburb}
                      onValueChange={(value) => updateFormData({ suburb: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select your primary suburb" />
                      </SelectTrigger>
                      <SelectContent>
                        {MELBOURNE_SUBURBS.map((suburb) => (
                          <SelectItem key={suburb.id} value={suburb.name}>
                            {suburb.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio">Business Description *</Label>
                    <Textarea
                      id="bio"
                      value={formData.bio}
                      onChange={(e) => updateFormData({ bio: e.target.value })}
                      placeholder="Describe your business, services, and what makes you unique..."
                      className="min-h-[100px]"
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      This will be the main description visitors see on your profile.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 3: Customize Profile */}
            {currentStep === 2 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Palette className="h-5 w-5" />
                    Customize Your Profile
                  </CardTitle>
                  <CardDescription>
                    Choose how your business profile looks and feels.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ProfileCustomizer
                    businessCategory={formData.category}
                    currentOptions={formData.customization}
                    onChange={(customization) => updateFormData({ customization })}
                  />
                </CardContent>
              </Card>
            )}

            {/* Step 4: Review & Publish */}
            {currentStep === 3 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="h-5 w-5" />
                    Review & Publish
                  </CardTitle>
                  <CardDescription>
                    Review your business profile before publishing.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h3 className="font-semibold">Business Information</h3>
                      <div className="space-y-2 text-sm">
                        <div><span className="font-medium">Name:</span> {formData.name}</div>
                        <div><span className="font-medium">Category:</span> {formData.category}</div>
                        <div><span className="font-medium">Email:</span> {formData.email}</div>
                        <div><span className="font-medium">Phone:</span> {formData.phone || 'Not provided'}</div>
                        <div><span className="font-medium">Suburb:</span> {formData.suburb}</div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <h3 className="font-semibold">Profile Customization</h3>
                      <div className="space-y-2 text-sm">
                        <div><span className="font-medium">Theme:</span> {formData.customization.theme}</div>
                        <div><span className="font-medium">Layout:</span> {formData.customization.layout}</div>
                        <div><span className="font-medium">CTA Text:</span> {formData.customization.ctaText}</div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-semibold">Business Description</h3>
                    <p className="text-sm text-muted-foreground">{formData.bio}</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Navigation */}
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 0}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Previous
            </Button>
            
            {currentStep < STEPS.length - 1 ? (
              <Button
                onClick={nextStep}
                disabled={!validateCurrentStep()}
                className="flex items-center gap-2"
              >
                Next
                <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={!validateCurrentStep() || isSubmitting}
                className="flex items-center gap-2"
              >
                {isSubmitting ? 'Publishing...' : 'Publish Profile'}
                <Check className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}