"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle, XCircle, Clock, ExternalLink, Mail, Phone } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface PendingBusiness {
  id: string;
  slug: string;
  name: string;
  abn: string;
  email: string;
  suburb: string;
  phone?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
  user?: {
    email: string;
  };
}

export default function AdminApprovePage() {
  const [businesses, setBusinesses] = useState<PendingBusiness[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchPendingBusinesses();
  }, []);

  const fetchPendingBusinesses = async () => {
    try {
      const response = await fetch('/api/admin/businesses');
      const data = await response.json();
      
      if (response.ok) {
        setBusinesses(data.businesses);
      } else {
        toast({
          title: "Error",
          description: "Failed to load businesses",
          variant: "destructive"
        });
      }
    } catch (err) {
      toast({
        title: "Network Error",
        description: "Failed to connect to server",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApproval = async (businessId: string, action: 'approve' | 'reject') => {
    setActionLoading(businessId);
    
    try {
      const response = await fetch('/api/admin/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessId, action })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        toast({
          title: "Success",
          description: `Business ${action}d successfully`,
        });
        
        // Update local state
        setBusinesses(prev => prev.map(business => 
          business.id === businessId 
            ? { ...business, status: action === 'approve' ? 'APPROVED' : 'REJECTED' }
            : business
        ));
      } else {
        toast({
          title: "Error",
          description: data.error || `Failed to ${action} business`,
          variant: "destructive"
        });
      }
    } catch (err) {
      toast({
        title: "Network Error",
        description: "Failed to process request",
        variant: "destructive"
      });
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Badge variant="secondary" className="bg-warning/10 text-warning"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case 'APPROVED':
        return <Badge variant="secondary" className="bg-success/10 text-success"><CheckCircle className="w-3 h-3 mr-1" />Approved</Badge>;
      case 'REJECTED':
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const pendingBusinesses = businesses.filter(b => b.status === 'PENDING');
  const approvedBusinesses = businesses.filter(b => b.status === 'APPROVED');
  const rejectedBusinesses = businesses.filter(b => b.status === 'REJECTED');

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading businesses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-primary mb-2">Business Approvals</h1>
        <p className="text-muted-foreground">
          Review and approve business registrations for Suburbmates
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-warning">{pendingBusinesses.length}</div>
            <div className="text-sm text-muted-foreground">Pending Review</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-success">{approvedBusinesses.length}</div>
            <div className="text-sm text-muted-foreground">Approved</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-destructive">{rejectedBusinesses.length}</div>
            <div className="text-sm text-muted-foreground">Rejected</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="pending" className="space-y-6">
        <TabsList>
          <TabsTrigger value="pending">Pending ({pendingBusinesses.length})</TabsTrigger>
          <TabsTrigger value="approved">Approved ({approvedBusinesses.length})</TabsTrigger>
          <TabsTrigger value="rejected">Rejected ({rejectedBusinesses.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          {pendingBusinesses.length === 0 ? (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                No businesses pending approval. Great job!
              </AlertDescription>
            </Alert>
          ) : (
            pendingBusinesses.map((business) => (
              <Card key={business.id} className="glass-card">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-xl">{business.name}</CardTitle>
                      <CardDescription className="flex items-center gap-4 mt-2">
                        <span>ABN: {business.abn}</span>
                        <span>•</span>
                        <span>{business.suburb}</span>
                        <span>•</span>
                        <span>{new Date(business.createdAt).toLocaleDateString()}</span>
                      </CardDescription>
                    </div>
                    {getStatusBadge(business.status)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{business.email}</span>
                      </div>
                      {business.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{business.phone}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <ExternalLink className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-primary">
                          /business/{business.slug}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 pt-4">
                    <Button
                      onClick={() => handleApproval(business.id, 'approve')}
                      disabled={actionLoading === business.id}
                      className="flex-1"
                    >
                      {actionLoading === business.id ? (
                        "Processing..."
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Approve Business
                        </>
                      )}
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => handleApproval(business.id, 'reject')}
                      disabled={actionLoading === business.id}
                      className="flex-1"
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Reject
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="approved" className="space-y-4">
          {approvedBusinesses.map((business) => (
            <Card key={business.id} className="glass-card">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-xl">{business.name}</CardTitle>
                    <CardDescription>{business.suburb} • {business.email}</CardDescription>
                  </div>
                  {getStatusBadge(business.status)}
                </div>
              </CardHeader>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="rejected" className="space-y-4">
          {rejectedBusinesses.map((business) => (
            <Card key={business.id} className="glass-card">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-xl">{business.name}</CardTitle>
                    <CardDescription>{business.suburb} • {business.email}</CardDescription>
                  </div>
                  {getStatusBadge(business.status)}
                </div>
              </CardHeader>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}