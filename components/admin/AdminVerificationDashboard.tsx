'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  User, 
  Building, 
  Mail, 
  Phone,
  Calendar,
  MessageSquare,
  ExternalLink
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface OwnershipClaim {
  id: string;
  businessId: string;
  userId: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  verificationType: string;
  verificationData: Record<string, any>;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  business: {
    id: string;
    name: string;
    email?: string;
    phone?: string;
    address?: string;
    slug: string;
  };
  user: {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
  };
}

interface AdminVerificationDashboardProps {
  className?: string;
}

export default function AdminVerificationDashboard({ className }: AdminVerificationDashboardProps) {
  const [claims, setClaims] = useState<OwnershipClaim[]>([]);
  const [selectedClaim, setSelectedClaim] = useState<OwnershipClaim | null>(null);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [adminNotes, setAdminNotes] = useState('');

  // Fetch claims from API
  useEffect(() => {
    fetchClaims();
  }, []);

  const fetchClaims = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/claims');
      if (response.ok) {
        const data = await response.json();
        setClaims(data.claims);
      }
    } catch (error) {
      console.error('Failed to fetch claims:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle claim approval/rejection
  const handleClaimAction = async (claimId: string, action: 'approve' | 'reject') => {
    try {
      setActionLoading(claimId);
      
      const response = await fetch(`/api/admin/claims/${claimId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: action === 'approve' ? 'APPROVED' : 'REJECTED',
          notes: adminNotes,
        }),
      });

      if (response.ok) {
        // Refresh claims
        await fetchClaims();
        setSelectedClaim(null);
        setAdminNotes('');
      }
    } catch (error) {
      console.error(`Failed to ${action} claim:`, error);
    } finally {
      setActionLoading(null);
    }
  };

  // Get status color
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

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Clock className="h-4 w-4" />;
      case 'APPROVED':
        return <CheckCircle className="h-4 w-4" />;
      case 'REJECTED':
        return <XCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const pendingClaims = claims.filter(c => c.status === 'PENDING');
  const processedClaims = claims.filter(c => c.status !== 'PENDING');

  if (loading) {
    return (
      <div className={cn('space-y-4', className)}>
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Verification Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Manage business ownership claims and verification requests
          </p>
        </div>
        <div className="flex space-x-2">
          <Badge variant="outline" className="text-yellow-600 border-yellow-200">
            {pendingClaims.length} Pending
          </Badge>
          <Badge variant="outline" className="text-gray-600 border-gray-200">
            {claims.length} Total
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Claims List */}
        <Card>
          <CardHeader>
            <CardTitle>Pending Claims</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 max-h-96 overflow-y-auto">
            {pendingClaims.length === 0 ? (
              <div className="text-center text-gray-500 py-4">
                No pending claims
              </div>
            ) : (
              pendingClaims.map((claim) => (
                <div
                  key={claim.id}
                  className={cn(
                    'p-3 border rounded-lg cursor-pointer transition-colors',
                    selectedClaim?.id === claim.id
                      ? 'border-primary bg-primary/5'
                      : 'border-gray-200 hover:border-gray-300'
                  )}
                  onClick={() => setSelectedClaim(claim)}
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <p className="font-medium text-sm">{claim.business.name}</p>
                      <p className="text-xs text-gray-500">{claim.user.email}</p>
                      <div className="flex items-center text-xs text-gray-400">
                        <Calendar className="h-3 w-3 mr-1" />
                        {new Date(claim.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <Badge className={cn('text-xs', getStatusColor(claim.status))}>
                      {getStatusIcon(claim.status)}
                      <span className="ml-1">{claim.status}</span>
                    </Badge>
                  </div>
                  <div className="mt-2 text-xs text-gray-500">
                    Via {claim.verificationType.replace('_', ' ').toLowerCase()}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Claim Details */}
        <Card>
          <CardHeader>
            <CardTitle>
              {selectedClaim ? 'Claim Details' : 'Select a Claim'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!selectedClaim ? (
              <div className="text-center text-gray-500 py-8">
                Select a claim to view details and take action
              </div>
            ) : (
              <div className="space-y-4">
                {/* Business Info */}
                <div className="space-y-2">
                  <h3 className="font-medium flex items-center">
                    <Building className="h-4 w-4 mr-2" />
                    Business Details
                  </h3>
                  <div className="bg-gray-50 p-3 rounded-lg space-y-1 text-sm">
                    <p><strong>Name:</strong> {selectedClaim.business.name}</p>
                    {selectedClaim.business.email && (
                      <p><strong>Email:</strong> {selectedClaim.business.email}</p>
                    )}
                    {selectedClaim.business.phone && (
                      <p><strong>Phone:</strong> {selectedClaim.business.phone}</p>
                    )}
                    {selectedClaim.business.address && (
                      <p><strong>Address:</strong> {selectedClaim.business.address}</p>
                    )}
                    <div className="pt-2">
                      <a
                        href={`/business/${selectedClaim.business.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline inline-flex items-center"
                      >
                        View Profile <ExternalLink className="h-3 w-3 ml-1" />
                      </a>
                    </div>
                  </div>
                </div>

                {/* User Info */}
                <div className="space-y-2">
                  <h3 className="font-medium flex items-center">
                    <User className="h-4 w-4 mr-2" />
                    Claiming User
                  </h3>
                  <div className="bg-gray-50 p-3 rounded-lg space-y-1 text-sm">
                    <p><strong>Email:</strong> {selectedClaim.user.email}</p>
                    {(selectedClaim.user.firstName || selectedClaim.user.lastName) && (
                      <p><strong>Name:</strong> {selectedClaim.user.firstName} {selectedClaim.user.lastName}</p>
                    )}
                  </div>
                </div>

                {/* Verification Data */}
                <div className="space-y-2">
                  <h3 className="font-medium">Verification Information</h3>
                  <div className="bg-gray-50 p-3 rounded-lg space-y-1 text-sm">
                    <p><strong>Method:</strong> {selectedClaim.verificationType.replace('_', ' ')}</p>
                    {Object.entries(selectedClaim.verificationData).map(([key, value]) => (
                      <p key={key}>
                        <strong>{key}:</strong> {String(value)}
                      </p>
                    ))}
                  </div>
                </div>

                {/* Admin Notes */}
                {selectedClaim.status === 'PENDING' && (
                  <div className="space-y-2">
                    <label className="font-medium">Admin Notes</label>
                    <Textarea
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      placeholder="Add notes about this verification (optional)"
                      className="min-h-[80px]"
                    />
                  </div>
                )}

                {/* Existing Notes */}
                {selectedClaim.notes && (
                  <div className="space-y-2">
                    <h3 className="font-medium flex items-center">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Previous Notes
                    </h3>
                    <div className="bg-gray-50 p-3 rounded-lg text-sm">
                      {selectedClaim.notes}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                {selectedClaim.status === 'PENDING' && (
                  <div className="flex space-x-3 pt-4 border-t">
                    <Button
                      onClick={() => handleClaimAction(selectedClaim.id, 'approve')}
                      disabled={actionLoading === selectedClaim.id}
                      className="flex-1"
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Approve
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleClaimAction(selectedClaim.id, 'reject')}
                      disabled={actionLoading === selectedClaim.id}
                      className="flex-1"
                    >
                      <XCircle className="h-4 w-4 mr-1" />
                      Reject
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      {processedClaims.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-48 overflow-y-auto">
              {processedClaims.slice(0, 10).map((claim) => (
                <div key={claim.id} className="flex items-center justify-between py-2 border-b last:border-b-0">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(claim.status)}
                    <div>
                      <p className="text-sm font-medium">{claim.business.name}</p>
                      <p className="text-xs text-gray-500">{claim.user.email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge className={cn('text-xs', getStatusColor(claim.status))}>
                      {claim.status}
                    </Badge>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(claim.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}