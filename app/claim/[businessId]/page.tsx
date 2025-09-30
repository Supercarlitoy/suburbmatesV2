"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { ga } from '@/lib/ga';
import { 
  ArrowLeft, 
  ArrowRight, 
  Check,
  Building2, 
  Shield, 
  FileText,
  Mail,
  Phone,
  AlertTriangle,
  CheckCircle
} from "lucide-react";

interface Business {
  id: string;
  name: string;
  email: string;
  phone?: string;
  website?: string;
  suburb: string;
  category: string;
  bio?: string;
  approvalStatus?: string;
}

interface ClaimFormData {
  method: 'EMAIL_DOMAIN' | 'PHONE_OTP' | 'DOCUMENT' | 'ABN_VERIFICATION';
  evidence: {
    email?: string;
    phone?: string;
    documents?: File[];
    abn?: string;
    businessName?: string;
    explanation?: string;
  };
  contactDetails: {
    name: string;
    email: string;
    phone?: string;
    position?: string;
  };
}

const STEPS = [
  { id: 'verify', title: 'Verify Business', description: 'Confirm this is your business' },
  { id: 'method', title: 'Verification Method', description: 'Choose how to verify ownership' },
  { id: 'evidence', title: 'Provide Evidence', description: 'Submit verification documents' },
  { id: 'contact', title: 'Contact Details', description: 'Your contact information' },
  { id: 'submit', title: 'Submit Claim', description: 'Review and submit your claim' },
];

const VERIFICATION_METHODS = [
  {
    id: 'EMAIL_DOMAIN' as const,
    title: 'Email Domain Verification',
    description: 'Use an email address from your business domain',
    icon: <Mail className="h-5 w-5" />,
    requirements: 'Email from business domain (e.g., name@yourbusiness.com.au)',
  },
  {
    id: 'PHONE_OTP' as const,
    title: 'Phone Number Verification',
    description: 'Verify using the business phone number',
    icon: <Phone className="h-5 w-5" />,
    requirements: 'Access to the business phone number listed',
  },
  {
    id: 'DOCUMENT' as const,
    title: 'Document Verification',
    description: 'Upload business registration documents',
    icon: <FileText className="h-5 w-5" />,
    requirements: 'Business registration, ABN certificate, or official documents',
  },
  {
    id: 'ABN_VERIFICATION' as const,
    title: 'ABN Verification',
    description: 'Verify using Australian Business Number',
    icon: <Shield className="h-5 w-5" />,
    requirements: 'Valid ABN and business details matching official records',
  },
];

export default function ClaimBusinessPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  
  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState<ClaimFormData>({
    method: 'EMAIL_DOMAIN',
    evidence: {},
    contactDetails: {
      name: '',
      email: '',
    },
  });

  // Fetch business details
  useEffect(() => {
    const fetchBusiness = async () => {
      try {
        const response = await fetch(`/api/business/${params.businessId}`);
        if (!response.ok) {
          throw new Error('Business not found');
        }
        const data = await response.json();
        setBusiness(data);
        
        // Track claim start event
        ga('claim_start', {
          business_id: data.id,
          business_name: data.name,
          suburb: data.suburb,
          category: data.category || 'unknown',
        });
      } catch (error) {
        console.error('Failed to fetch business:', error);
        toast({
          title: "Business not found",
          description: "The business you're trying to claim could not be found.",
          variant: "destructive",
        });
        router.push('/');
      } finally {
        setLoading(false);
      }
    };

    if (params.businessId) {
      fetchBusiness();
    }
  }, [params.businessId, toast, router]);

  const updateFormData = (updates: Partial<ClaimFormData>) => {
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
      case 0: // Verify Business
        return true; // Just confirmation step
      case 1: // Method Selection
        return formData.method !== undefined;
      case 2: // Evidence
        const { method, evidence } = formData;
        switch (method) {
          case 'EMAIL_DOMAIN':
            return evidence.email && evidence.email.includes('@');
          case 'PHONE_OTP':
            return evidence.phone && evidence.phone.length > 8;
          case 'ABN_VERIFICATION':
            return evidence.abn && evidence.abn.length >= 11;
          case 'DOCUMENT':
            return evidence.explanation && evidence.explanation.length > 10;
          default:
            return false;
        }
      case 3: // Contact Details
        return formData.contactDetails.name && formData.contactDetails.email;
      case 4: // Submit
        return true;
      default:
        return false;
    }
  };

  const handleSubmit = async () => {
    if (!validateCurrentStep() || !business) {
      toast({
        title: "Please complete all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/business/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessId: business.id,
          method: formData.method,
          evidence: formData.evidence,
          contactDetails: formData.contactDetails,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit claim');
      }

      await response.json();
      
      toast({
        title: "Claim submitted successfully!",
        description: "We'll review your claim and get back to you within 1-2 business days.",
      });

      // Redirect to success page or dashboard
      router.push(`/claim/${business.id}/submitted`);
    } catch (error) {
      console.error('Claim submission error:', error);
      toast({
        title: "Failed to submit claim",
        description: "Please try again or contact support.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const progress = ((currentStep + 1) / STEPS.length) * 100;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
          <p className="mt-4 text-muted-foreground">Loading business details...</p>
        </div>
      </div>
    );
  }

  if (!business) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Business Not Found
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
The business you&apos;re trying to claim could not be found or may have been removed.
            </p>
            <Button onClick={() => router.push('/')} className="w-full">
              Return Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

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
onClick={() => router.push(`/business/${business.id}`)}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Profile
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Claim Business</h1>
                <p className="text-sm text-muted-foreground">
                  Verify ownership of {business.name}
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
            {/* Step 1: Verify Business */}
            {currentStep === 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    Verify This Is Your Business
                  </CardTitle>
                  <CardDescription>
                    Please confirm this is the business you want to claim ownership of.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="border rounded-lg p-6 bg-muted/50">
                    <div className="space-y-4">
                      <div className="flex items-start gap-4">
                        <div className="w-16 h-16 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Building2 className="h-8 w-8 text-primary" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold">{business.name}</h3>
                          <p className="text-muted-foreground">{business.category}</p>
                          <p className="text-sm text-muted-foreground">{business.suburb}, VIC</p>
                        </div>
                        <Badge variant="secondary">
{(business as unknown as { approvalStatus?: string }).approvalStatus === 'APPROVED' ? 'Listed' : (business as unknown as { approvalStatus?: string }).approvalStatus}
                        </Badge>
                      </div>
                      
                      {business.bio && (
                        <div>
                          <h4 className="font-medium mb-2">Business Description</h4>
                          <p className="text-sm text-muted-foreground">{business.bio}</p>
                        </div>
                      )}
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                        {business.email && (
                          <div>
                            <span className="text-sm font-medium">Email:</span>
                            <p className="text-sm text-muted-foreground">{business.email}</p>
                          </div>
                        )}
                        {business.phone && (
                          <div>
                            <span className="text-sm font-medium">Phone:</span>
                            <p className="text-sm text-muted-foreground">{business.phone}</p>
                          </div>
                        )}
                        {business.website && (
                          <div>
                            <span className="text-sm font-medium">Website:</span>
                            <p className="text-sm text-muted-foreground">{business.website}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <Alert>
                    <Shield className="h-4 w-4" />
                    <AlertDescription>
                      By claiming this business, you confirm that you are authorized to manage this business profile 
                      and its information. False claims may result in account suspension.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            )}

            {/* Step 2: Verification Method */}
            {currentStep === 1 && (
              <Card>
                <CardHeader>
                  <CardTitle>Choose Verification Method</CardTitle>
                  <CardDescription>
Select how you&apos;d like to verify ownership of this business.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <RadioGroup
                    value={formData.method}
onValueChange={(value) => updateFormData({ method: value as ClaimFormData['method'] })}
                    className="space-y-4"
                  >
                    {VERIFICATION_METHODS.map((method) => (
                      <div
                        key={method.id}
                        className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-muted/50 cursor-pointer"
                      >
                        <RadioGroupItem value={method.id} id={method.id} className="mt-1" />
                        <div className="flex-1">
                          <label htmlFor={method.id} className="flex items-center gap-3 cursor-pointer">
                            {method.icon}
                            <div>
                              <div className="font-medium">{method.title}</div>
                              <div className="text-sm text-muted-foreground">{method.description}</div>
                              <div className="text-xs text-muted-foreground mt-1">
                                <span className="font-medium">Requirements:</span> {method.requirements}
                              </div>
                            </div>
                          </label>
                        </div>
                      </div>
                    ))}
                  </RadioGroup>
                </CardContent>
              </Card>
            )}

            {/* Step 3: Provide Evidence */}
            {currentStep === 2 && (
              <Card>
                <CardHeader>
                  <CardTitle>Provide Verification Evidence</CardTitle>
                  <CardDescription>
                    {VERIFICATION_METHODS.find(m => m.id === formData.method)?.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {formData.method === 'EMAIL_DOMAIN' && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="business-email">Business Email Address *</Label>
                        <Input
                          id="business-email"
                          type="email"
                          value={formData.evidence.email || ''}
                          onChange={(e) => updateFormData({
                            evidence: { ...formData.evidence, email: e.target.value }
                          })}
                          placeholder="name@yourbusiness.com.au"
                        />
                        <p className="text-xs text-muted-foreground">
Use an email address from your business domain. We&apos;ll send a verification link to this email.
                        </p>
                      </div>
                    </div>
                  )}

                  {formData.method === 'PHONE_OTP' && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="business-phone">Business Phone Number *</Label>
                        <Input
                          id="business-phone"
                          type="tel"
                          value={formData.evidence.phone || ''}
                          onChange={(e) => updateFormData({
                            evidence: { ...formData.evidence, phone: e.target.value }
                          })}
                          placeholder="0312 345 678"
                        />
                        <p className="text-xs text-muted-foreground">
We&apos;ll send a verification code to this phone number.
                        </p>
                      </div>
                    </div>
                  )}

                  {formData.method === 'ABN_VERIFICATION' && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="abn">Australian Business Number *</Label>
                          <Input
                            id="abn"
                            value={formData.evidence.abn || ''}
                            onChange={(e) => updateFormData({
                              evidence: { ...formData.evidence, abn: e.target.value }
                            })}
                            placeholder="12 345 678 901"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="business-name">Registered Business Name *</Label>
                          <Input
                            id="business-name"
                            value={formData.evidence.businessName || ''}
                            onChange={(e) => updateFormData({
                              evidence: { ...formData.evidence, businessName: e.target.value }
                            })}
                            placeholder="As registered with ABR"
                          />
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground">
We&apos;ll verify your ABN against official ABR records.
                      </p>
                    </div>
                  )}

                  {formData.method === 'DOCUMENT' && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="explanation">Explanation of Ownership *</Label>
                        <Textarea
                          id="explanation"
                          value={formData.evidence.explanation || ''}
                          onChange={(e) => updateFormData({
                            evidence: { ...formData.evidence, explanation: e.target.value }
                          })}
                          placeholder="Explain your relationship to this business and how you can verify ownership..."
                          className="min-h-[100px]"
                        />
                        <p className="text-xs text-muted-foreground">
                          Provide details about your role and any supporting documents you have.
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Step 4: Contact Details */}
            {currentStep === 3 && (
              <Card>
                <CardHeader>
                  <CardTitle>Your Contact Details</CardTitle>
                  <CardDescription>
                    We need your contact information to process the claim.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="contact-name">Full Name *</Label>
                      <Input
                        id="contact-name"
                        value={formData.contactDetails.name}
                        onChange={(e) => updateFormData({
                          contactDetails: { ...formData.contactDetails, name: e.target.value }
                        })}
                        placeholder="Your full name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contact-position">Position/Role</Label>
                      <Input
                        id="contact-position"
                        value={formData.contactDetails.position || ''}
                        onChange={(e) => updateFormData({
                          contactDetails: { ...formData.contactDetails, position: e.target.value }
                        })}
                        placeholder="e.g., Owner, Manager, Director"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="contact-email">Email Address *</Label>
                      <Input
                        id="contact-email"
                        type="email"
                        value={formData.contactDetails.email}
                        onChange={(e) => updateFormData({
                          contactDetails: { ...formData.contactDetails, email: e.target.value }
                        })}
                        placeholder="your.email@example.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contact-phone">Phone Number</Label>
                      <Input
                        id="contact-phone"
                        type="tel"
                        value={formData.contactDetails.phone || ''}
                        onChange={(e) => updateFormData({
                          contactDetails: { ...formData.contactDetails, phone: e.target.value }
                        })}
                        placeholder="0412 345 678"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 5: Submit */}
            {currentStep === 4 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    Review and Submit Claim
                  </CardTitle>
                  <CardDescription>
                    Please review your claim details before submitting.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h3 className="font-semibold">Business Details</h3>
                      <div className="space-y-2 text-sm">
                        <div><span className="font-medium">Name:</span> {business.name}</div>
                        <div><span className="font-medium">Category:</span> {business.category}</div>
                        <div><span className="font-medium">Location:</span> {business.suburb}, VIC</div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <h3 className="font-semibold">Verification Method</h3>
                      <div className="text-sm">
                        <div className="font-medium">
                          {VERIFICATION_METHODS.find(m => m.id === formData.method)?.title}
                        </div>
                        <div className="text-muted-foreground mt-1">
                          {VERIFICATION_METHODS.find(m => m.id === formData.method)?.description}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-semibold">Contact Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div><span className="font-medium">Name:</span> {formData.contactDetails.name}</div>
                      <div><span className="font-medium">Email:</span> {formData.contactDetails.email}</div>
                      {formData.contactDetails.position && (
                        <div><span className="font-medium">Position:</span> {formData.contactDetails.position}</div>
                      )}
                      {formData.contactDetails.phone && (
                        <div><span className="font-medium">Phone:</span> {formData.contactDetails.phone}</div>
                      )}
                    </div>
                  </div>

                  <Alert>
                    <Shield className="h-4 w-4" />
                    <AlertDescription>
                      <strong>What happens next?</strong><br />
We&apos;ll review your claim within 1-2 business days. You&apos;ll receive an email update about the status 
of your claim. If approved, you&apos;ll gain full access to manage this business profile.
                    </AlertDescription>
                  </Alert>
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
                {isSubmitting ? 'Submitting...' : 'Submit Claim'}
                <Check className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}