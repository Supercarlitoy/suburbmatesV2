"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { 
  Shield, 
  CheckCircle, 
  Clock, 
  XCircle, 
  AlertTriangle,
  Loader2,
  Building2,
  MapPin,
  Calendar,
  CreditCard
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface BusinessVerificationProps {
  businessId: string;
  currentAbn?: string;
  verificationStatus?: string;
  verificationDate?: string;
  verificationNotes?: string;
  onVerificationUpdate?: () => void;
}

interface VerificationResult {
  success: boolean;
  status: string;
  aiRecommendation: string;
  businessData?: {
    entityName: string;
    abn: string;
    status: string;
    gst: boolean;
    address?: {
      state?: string;
      postcode?: string;
      suburb?: string;
    };
    entityType?: string;
  };
  message: string;
  error?: string;
}

export function BusinessVerification({
  businessId,
  currentAbn = "",
  verificationStatus = "unverified",
  verificationDate,
  verificationNotes,
  onVerificationUpdate
}: BusinessVerificationProps) {
  const [abn, setAbn] = useState(currentAbn);
  const [isLoading, setIsLoading] = useState(false);
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
  const [error, setError] = useState("");

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-600" />;
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Shield className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'verified':
        return 'Verified';
      case 'pending':
        return 'Pending Review';
      case 'rejected':
        return 'Rejected';
      default:
        return 'Unverified';
    }
  };

  const handleVerification = async () => {
    if (!abn || abn.length < 11) {
      setError("Please enter a valid 11-digit ABN");
      return;
    }

    setIsLoading(true);
    setError("");
    setVerificationResult(null);

    try {
      const response = await fetch('/api/verify-business', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          businessId, 
          abn: abn.replace(/\s/g, '') // Remove spaces
        }),
      });

      const data = await response.json();

      if (data.success) {
        setVerificationResult(data);
        toast({
          title: "Verification Submitted",
          description: data.message,
        });
        onVerificationUpdate?.();
      } else {
        setError(data.error || "Verification failed");
        if (data.status === 'rejected') {
          setVerificationResult(data);
        }
      }
    } catch (error) {
      setError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const canVerify = verificationStatus === 'unverified' || verificationStatus === 'rejected';

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {getStatusIcon(verificationStatus)}
            <div>
              <CardTitle className="text-lg">Business Verification</CardTitle>
              <CardDescription>
                Verify your ABN to gain additional trust signals and credibility
              </CardDescription>
            </div>
          </div>
          <Badge className={getStatusColor(verificationStatus)}>
            {getStatusText(verificationStatus)}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Current Status */}
        {verificationStatus !== 'unverified' && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {verificationDate ? `Submitted: ${new Date(verificationDate).toLocaleDateString()}` : 'Date not available'}
              </span>
            </div>
            
            {verificationNotes && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription className="whitespace-pre-line">
                  {verificationNotes}
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}

        {/* Verification Form */}
        {canVerify && (
          <>
            <Separator />
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="abn-verify">Australian Business Number (ABN)</Label>
                <div className="flex gap-2">
                  <Input
                    id="abn-verify"
                    type="text"
                    placeholder="12 345 678 901"
                    maxLength={14}
                    value={abn}
                    onChange={(e) => {
                      setAbn(e.target.value);
                      setError("");
                    }}
                    disabled={isLoading}
                  />
                  <Button
                    onClick={handleVerification}
                    disabled={isLoading || !abn}
                    className="min-w-[120px]"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Verifying...
                      </>
                    ) : (
                      <>
                        <Shield className="h-4 w-4 mr-2" />
                        Verify ABN
                      </>
                    )}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  We'll verify your ABN with the Australian Business Register and review your application
                </p>
              </div>

              {error && (
                <Alert variant="destructive">
                  <XCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </div>
          </>
        )}

        {/* Verification Result */}
        {verificationResult && (
          <>
            <Separator />
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <h4 className="font-medium">Verification Details</h4>
              </div>
              
              {verificationResult.businessData && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Business Name</span>
                    </div>
                    <p className="text-sm">{verificationResult.businessData.entityName}</p>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">ABN</span>
                    </div>
                    <p className="text-sm font-mono">{verificationResult.businessData.abn}</p>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Status</span>
                    </div>
                    <Badge variant="outline">{verificationResult.businessData.status}</Badge>
                  </div>
                  
                  {verificationResult.businessData.gst && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">GST Registered</span>
                      </div>
                      <Badge variant="secondary">Yes</Badge>
                    </div>
                  )}
                  
                  {verificationResult.businessData.address && (
                    <div className="space-y-2 md:col-span-2">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Address</span>
                      </div>
                      <p className="text-sm">
                        {[verificationResult.businessData.address.suburb,
                          verificationResult.businessData.address.state,
                          verificationResult.businessData.address.postcode
                        ].filter(Boolean).join(', ')}
                      </p>
                    </div>
                  )}
                </div>
              )}
              
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  {verificationResult.message}
                  {verificationResult.aiRecommendation === 'auto_approve' && (
                    <span className="block mt-1 text-green-700 font-medium">
                      🤖 Automatically approved by AI verification
                    </span>
                  )}
                </AlertDescription>
              </Alert>
            </div>
          </>
        )}

        {/* Benefits of Verification */}
        {verificationStatus === 'unverified' && (
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="font-medium text-blue-900 mb-2">Benefits of Verification</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Verified badge on your business profile</li>
              <li>• Higher search ranking and visibility</li>
              <li>• Increased customer trust and credibility</li>
              <li>• Access to premium features</li>
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}