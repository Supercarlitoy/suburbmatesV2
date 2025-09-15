"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { 
  Shield, 
  CheckCircle, 
  Clock, 
  XCircle,
  Building2,
  MapPin,
  Calendar,
  CreditCard,
  Bot
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface VerificationRequest {
  id: string;
  businessId: string;
  businessName: string;
  businessEmail: string;
  abn: string;
  abnVerificationStatus: string;
  abnVerificationDate: string;
  abnVerificationData: any;
  abnVerificationNotes: string;
  abnAutoVerified: boolean;
  abnVerifiedBy?: string;
}

export default function AdminVerifyPage() {
  const [requests, setRequests] = useState<VerificationRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Mock data - in real app, this would come from API
  useEffect(() => {
    setTimeout(() => {
      setRequests([
        {
          id: "1",
          businessId: "1",
          businessName: "Joe's Plumbing Services",
          businessEmail: "joe@joesplumbing.com.au",
          abn: "12345678901",
          abnVerificationStatus: "pending",
          abnVerificationDate: new Date().toISOString(),
          abnVerificationData: {
            ABN: "12345678901",
            entityName: "Joe's Plumbing Services Pty Ltd",
            status: "Active",
            GST: true,
            entityType: "Australian Private Company",
            address: {
              state: "VIC",
              postcode: "3121",
              suburb: "Richmond"
            }
          },
          abnVerificationNotes: "🤖 AI Recommendation: MANUAL REVIEW (Score: 75/100)\n✓ Business name matches ABR records\n✓ ABN status is Active\n✓ GST registered\n✓ Complete address information available\n✓ Valid entity type: Australian Private Company",
          abnAutoVerified: false
        },
        {
          id: "2",
          businessId: "2",
          businessName: "Melbourne Cafe Co",
          businessEmail: "info@melbournecafe.com.au",
          abn: "98765432109",
          abnVerificationStatus: "pending",
          abnVerificationDate: new Date(Date.now() - 86400000).toISOString(),
          abnVerificationData: {
            ABN: "98765432109",
            entityName: "Melbourne Cafe Company Pty Ltd",
            status: "Active",
            GST: true,
            entityType: "Australian Private Company",
            address: {
              state: "VIC",
              postcode: "3000",
              suburb: "Melbourne"
            }
          },
          abnVerificationNotes: "🤖 AI Recommendation: AUTO-APPROVE (Score: 95/100)\n✓ Business name matches ABR records\n✓ ABN status is Active\n✓ GST registered\n✓ Complete address information available\n✓ Valid entity type: Australian Private Company",
          abnAutoVerified: true
        }
      ]);
      setIsLoading(false);
    }, 1000);
  }, []);

  const handleApprove = async (requestId: string, notes?: string) => {
    setProcessingId(requestId);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setRequests(prev => prev.map(req => 
        req.id === requestId 
          ? { ...req, abnVerificationStatus: 'verified', abnVerifiedBy: 'Admin User' }
          : req
      ));
      
      toast({
        title: "Verification Approved",
        description: "Business has been successfully verified.",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to approve verification.",
        variant: "destructive"
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (requestId: string, notes: string) => {
    if (!notes.trim()) {
      toast({
        title: "Rejection Reason Required",
        description: "Please provide a reason for rejection.",
        variant: "destructive"
      });
      return;
    }

    setProcessingId(requestId);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setRequests(prev => prev.map(req => 
        req.id === requestId 
          ? { 
              ...req, 
              abnVerificationStatus: 'rejected', 
              abnVerificationNotes: req.abnVerificationNotes + '\n\n❌ REJECTED: ' + notes,
              abnVerifiedBy: 'Admin User'
            }
          : req
      ));
      
      toast({
        title: "Verification Rejected",
        description: "Business verification has been rejected.",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to reject verification.",
        variant: "destructive"
      });
    } finally {
      setProcessingId(null);
    }
  };

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

  const pendingRequests = requests.filter(req => req.abnVerificationStatus === 'pending');
  const processedRequests = requests.filter(req => req.abnVerificationStatus !== 'pending');

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Business Verification</h1>
            <p className="text-muted-foreground">
              Review and approve ABN verification requests
            </p>
          </div>
          <div className="flex gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{pendingRequests.length}</div>
              <div className="text-sm text-muted-foreground">Pending</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {processedRequests.filter(r => r.abnVerificationStatus === 'verified').length}
              </div>
              <div className="text-sm text-muted-foreground">Approved</div>
            </div>
          </div>
        </div>

        {/* Pending Requests */}
        {pendingRequests.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Clock className="h-5 w-5 text-yellow-600" />
              Pending Verification Requests
            </h2>
            
            {pendingRequests.map((request) => (
              <VerificationRequestCard
                key={request.id}
                request={request}
                onApprove={handleApprove}
                onReject={handleReject}
                isProcessing={processingId === request.id}
              />
            ))}
          </div>
        )}

        {/* Processed Requests */}
        {processedRequests.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Processed Requests
            </h2>
            
            {processedRequests.map((request) => (
              <Card key={request.id} className="opacity-75">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(request.abnVerificationStatus)}
                      <div>
                        <CardTitle className="text-lg">{request.businessName}</CardTitle>
                        <CardDescription>{request.businessEmail}</CardDescription>
                      </div>
                    </div>
                    <Badge className={getStatusColor(request.abnVerificationStatus)}>
                      {request.abnVerificationStatus.charAt(0).toUpperCase() + request.abnVerificationStatus.slice(1)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-muted-foreground">
                    Processed on {new Date(request.abnVerificationDate).toLocaleDateString()}
                    {request.abnVerifiedBy && ` by ${request.abnVerifiedBy}`}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {requests.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No Verification Requests</h3>
              <p className="text-muted-foreground">All verification requests have been processed.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

function VerificationRequestCard({ 
  request, 
  onApprove, 
  onReject, 
  isProcessing 
}: {
  request: VerificationRequest;
  onApprove: (id: string, notes?: string) => void;
  onReject: (id: string, notes: string) => void;
  isProcessing: boolean;
}) {
  const [rejectionNotes, setRejectionNotes] = useState("");
  const [showRejectForm, setShowRejectForm] = useState(false);

  const abrData = request.abnVerificationData;

  return (
    <Card className="border-l-4 border-l-yellow-500">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Clock className="h-5 w-5 text-yellow-600" />
            <div>
              <CardTitle className="text-lg">{request.businessName}</CardTitle>
              <CardDescription>{request.businessEmail}</CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {request.abnAutoVerified && (
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                <Bot className="h-3 w-3 mr-1" />
                AI Recommended
              </Badge>
            )}
            <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
              Pending Review
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* ABR Data */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Entity Name</span>
            </div>
            <p className="text-sm">{abrData.entityName}</p>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">ABN</span>
            </div>
            <p className="text-sm font-mono">{abrData.ABN}</p>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Status</span>
            </div>
            <Badge variant="outline">{abrData.status}</Badge>
          </div>
          
          {abrData.GST && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">GST Registered</span>
              </div>
              <Badge variant="secondary">Yes</Badge>
            </div>
          )}
          
          {abrData.address && (
            <div className="space-y-2 md:col-span-2">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Address</span>
              </div>
              <p className="text-sm">
                {[abrData.address.suburb, abrData.address.state, abrData.address.postcode]
                  .filter(Boolean).join(', ')}
              </p>
            </div>
          )}
        </div>

        {/* AI Analysis */}
        <Alert>
          <Bot className="h-4 w-4" />
          <AlertDescription className="whitespace-pre-line">
            {request.abnVerificationNotes}
          </AlertDescription>
        </Alert>

        {/* Submission Date */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span>Submitted: {new Date(request.abnVerificationDate).toLocaleString()}</span>
        </div>

        <Separator />

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button
            onClick={() => onApprove(request.id)}
            disabled={isProcessing}
            className="bg-green-600 hover:bg-green-700"
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            {isProcessing ? 'Processing...' : 'Approve'}
          </Button>
          
          <Button
            variant="destructive"
            onClick={() => setShowRejectForm(!showRejectForm)}
            disabled={isProcessing}
          >
            <XCircle className="h-4 w-4 mr-2" />
            Reject
          </Button>
        </div>

        {/* Rejection Form */}
        {showRejectForm && (
          <div className="space-y-3 p-4 bg-red-50 rounded-lg border border-red-200">
            <Label htmlFor="rejection-notes">Reason for Rejection</Label>
            <Textarea
              id="rejection-notes"
              placeholder="Please provide a detailed reason for rejecting this verification..."
              value={rejectionNotes}
              onChange={(e) => setRejectionNotes(e.target.value)}
              rows={3}
            />
            <div className="flex gap-2">
              <Button
                variant="destructive"
                onClick={() => {
                  onReject(request.id, rejectionNotes);
                  setShowRejectForm(false);
                  setRejectionNotes("");
                }}
                disabled={!rejectionNotes.trim() || isProcessing}
              >
                Confirm Rejection
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowRejectForm(false);
                  setRejectionNotes("");
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}