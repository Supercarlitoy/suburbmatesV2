"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  CheckCircle, 
  Clock, 
  ArrowLeft, 
  Mail, 
  Phone,
  Calendar,
  Building2
} from "lucide-react";

interface Claim {
  id: string;
  status: string;
  method: string;
  submittedAt: string;
  business: {
    id?: string;
    name: string;
    slug?: string | null;
    suburb?: string | null;
    category?: string | null;
  };
}

export default function ClaimSubmittedPage() {
  const router = useRouter();
  const params = useParams();
  const [claim, setClaim] = useState<Claim | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClaim = async () => {
      try {
        const response = await fetch('/api/business/claim');
        if (response.ok) {
          const data = await response.json();
          // Find the most recent claim for this business
          const businessId = (params as { businessId: string }).businessId;
          const matchingClaim = data.claims.find((c: Claim) => 
            c.business.slug === businessId || c.business.id === businessId
          );
          if (matchingClaim) {
            setClaim(matchingClaim);
          }
        }
      } catch (error) {
        console.error('Failed to fetch claim:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchClaim();
  }, [params.businessId]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'APPROVED':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'REJECTED':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getMethodLabel = (method: string) => {
    switch (method) {
      case 'EMAIL_DOMAIN':
        return 'Email Domain Verification';
      case 'PHONE_OTP':
        return 'Phone Number Verification';
      case 'DOCUMENT':
        return 'Document Verification';
      case 'ABN_VERIFICATION':
        return 'ABN Verification';
      default:
        return method;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
          <p className="mt-4 text-muted-foreground">Loading claim details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
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
              <h1 className="text-2xl font-bold text-gray-900">Claim Submitted</h1>
              <p className="text-sm text-muted-foreground">
                Your business ownership claim has been received
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Success Message */}
          <Card className="border-green-200 bg-green-50/50">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="rounded-full bg-green-100 p-2">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-semibold text-green-900 mb-2">
                    Claim Successfully Submitted!
                  </h2>
                  <p className="text-green-700">
                    We've received your ownership claim and will review it within 1-2 business days. 
                    You'll receive an email update about the status of your claim.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Claim Details */}
          {claim && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Claim Details
                </CardTitle>
                <CardDescription>
                  Your ownership claim information and current status
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-lg">{claim.business.name}</h3>
                      <p className="text-muted-foreground">{claim.business.category}</p>
                      <p className="text-sm text-muted-foreground">{claim.business.suburb}, VIC</p>
                    </div>
                    
                    <div>
                      <span className="text-sm font-medium text-muted-foreground">Claim ID</span>
                      <p className="font-mono text-sm">{claim.id}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <span className="text-sm font-medium text-muted-foreground">Status</span>
                      <div className="mt-1">
                        <Badge variant="outline" className={getStatusColor(claim.status)}>
                          <Clock className="h-3 w-3 mr-1" />
                          {claim.status}
                        </Badge>
                      </div>
                    </div>
                    
                    <div>
                      <span className="text-sm font-medium text-muted-foreground">Verification Method</span>
                      <p className="text-sm">{getMethodLabel(claim.method)}</p>
                    </div>
                    
                    <div>
                      <span className="text-sm font-medium text-muted-foreground">Submitted</span>
                      <p className="text-sm flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(claim.submittedAt).toLocaleDateString('en-AU', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* What Happens Next */}
          <Card>
            <CardHeader>
              <CardTitle>What Happens Next?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="rounded-full bg-primary/10 p-1 mt-1">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                  </div>
                  <div>
                    <p className="font-medium">Review Process</p>
                    <p className="text-sm text-muted-foreground">
                      Our team will review your claim and verification evidence within 1-2 business days.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="rounded-full bg-primary/10 p-1 mt-1">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                  </div>
                  <div>
                    <p className="font-medium">Email Notification</p>
                    <p className="text-sm text-muted-foreground">
                      You'll receive an email update about the status of your claim (approved, rejected, or more information needed).
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="rounded-full bg-primary/10 p-1 mt-1">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                  </div>
                  <div>
                    <p className="font-medium">Profile Access</p>
                    <p className="text-sm text-muted-foreground">
                      If approved, you'll gain full access to manage this business profile and customize it.
                    </p>
                  </div>
                </div>
              </div>

              <Alert className="mt-6">
                <Mail className="h-4 w-4" />
                <AlertDescription>
                  <strong>Need to update your claim?</strong><br />
                  If you need to provide additional information or have questions about your claim, 
                  please contact our support team with your claim ID.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>Need Help?</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium">Email Support</p>
                    <p className="text-sm text-muted-foreground">support@suburbmates.com.au</p>
                    <p className="text-xs text-muted-foreground">Response within 24 hours</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Phone className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium">Phone Support</p>
                    <p className="text-sm text-muted-foreground">1300 SUBURB (782 872)</p>
                    <p className="text-xs text-muted-foreground">Mon-Fri, 9am-5pm AEST</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Button 
              onClick={() => router.push('/')}
              className="flex-1"
            >
              Return Home
            </Button>
            {claim && (
              <Button 
                variant="outline"
                onClick={() => router.push(`/business/${claim.business.slug}`)}
                className="flex-1"
              >
                View Business Profile
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}