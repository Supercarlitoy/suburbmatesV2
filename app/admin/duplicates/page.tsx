'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Copy, 
  Search, 
  Filter, 
  CheckCircle, 
  XCircle,
  Eye,
  Merge,
  RefreshCw,
  AlertTriangle,
  Info,
  Phone,
  Globe,
  Mail,
  Building2,
  MapPin
} from 'lucide-react';

// Disable prerendering for admin pages
export const dynamic = 'force-dynamic';

interface Business {
  id: string;
  name: string;
  suburb: string;
  category?: string;
  phone?: string;
  email?: string;
  website?: string;
  approvalStatus: string;
  qualityScore?: number;
  duplicateOfId?: string;
  createdAt: string;
}

interface DuplicateGroup {
  id: string;
  businesses: Business[];
  duplicateType: 'strict' | 'loose';
  confidence: 'high' | 'medium';
  createdAt: Date;
  resolved: boolean;
  mergedInto?: string;
}

interface DuplicateStats {
  totalGroups: number;
  unresolvedGroups: number;
  strictDuplicates: number;
  looseDuplicates: number;
}

export default function AdminDuplicatesPage() {
  const [duplicateGroups, setDuplicateGroups] = useState<DuplicateGroup[]>([]);
  const [stats, setStats] = useState<DuplicateStats>({
    totalGroups: 0,
    unresolvedGroups: 0,
    strictDuplicates: 0,
    looseDuplicates: 0,
  });
  const [loading, setLoading] = useState(true);
  const [selectedMode, setSelectedMode] = useState<'strict' | 'loose'>('strict');
  const [suburbFilter, setSuburbFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [resolvedFilter, setResolvedFilter] = useState<string>('false');
  const [error, setError] = useState<string | null>(null);
  const [merging, setMerging] = useState<string | null>(null);

  // Fetch duplicate groups
  const fetchDuplicates = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams({
        mode: selectedMode,
        limit: '20',
        offset: '0',
      });
      
      if (suburbFilter) params.append('suburb', suburbFilter);
      if (categoryFilter) params.append('category', categoryFilter);
      if (resolvedFilter !== 'all') params.append('resolved', resolvedFilter);

      const response = await fetch(`/api/admin/duplicates?${params}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch duplicates: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.success) {
        setDuplicateGroups(data.duplicateGroups || []);
        setStats(data.stats || {
          totalGroups: 0,
          unresolvedGroups: 0,
          strictDuplicates: 0,
          looseDuplicates: 0,
        });
      } else {
        throw new Error(data.error || 'Unknown error');
      }
    } catch (err) {
      console.error('Error fetching duplicates:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch duplicates');
    } finally {
      setLoading(false);
    }
  };

  // Merge duplicates
  const mergeDuplicates = async (primaryBusinessId: string, duplicateBusinessIds: string[]) => {
    try {
      setMerging(primaryBusinessId);
      
      const response = await fetch('/api/admin/duplicates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          primaryBusinessId,
          duplicateBusinessIds,
          mergeStrategy: 'merge_data',
          reason: 'Admin duplicate merge via UI',
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to merge: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (result.success) {
        // Refresh the list
        await fetchDuplicates();
        alert(`Successfully merged ${duplicateBusinessIds.length} duplicate businesses!`);
      } else {
        throw new Error(result.error || 'Merge failed');
      }
    } catch (err) {
      console.error('Error merging duplicates:', err);
      alert(`Failed to merge duplicates: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setMerging(null);
    }
  };

  // Unmark as duplicate
  const unmarkDuplicate = async (businessId: string) => {
    try {
      const response = await fetch(`/api/admin/duplicates/unmark/${businessId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reason: 'Admin unmarked via UI - not a duplicate',
          restoreApprovalStatus: 'PENDING',
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to unmark: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (result.success) {
        await fetchDuplicates();
        alert(`Successfully unmarked business as duplicate!`);
      } else {
        throw new Error(result.error || 'Unmark failed');
      }
    } catch (err) {
      console.error('Error unmarking duplicate:', err);
      alert(`Failed to unmark duplicate: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  useEffect(() => {
    fetchDuplicates();
  }, [selectedMode, suburbFilter, categoryFilter, resolvedFilter]);

  const getConfidenceColor = (confidence: 'high' | 'medium') => {
    return confidence === 'high' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800';
  };

  const getBusinessContactInfo = (business: Business) => {
    const contacts = [];
    if (business.phone) contacts.push({ icon: Phone, value: business.phone });
    if (business.email) contacts.push({ icon: Mail, value: business.email });
    if (business.website) contacts.push({ icon: Globe, value: business.website });
    return contacts;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
        <span className="ml-2 text-gray-600">Loading duplicate groups...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Duplicate Management</h1>
          <p className="text-gray-600 mt-2">
            Review and manage duplicate business entries in your directory.
          </p>
        </div>
        <Button onClick={fetchDuplicates} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Copy className="h-8 w-8 text-orange-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Total Groups</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalGroups}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <AlertTriangle className="h-8 w-8 text-red-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Unresolved</p>
                <p className="text-2xl font-bold text-gray-900">{stats.unresolvedGroups}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Strict Matches</p>
                <p className="text-2xl font-bold text-gray-900">{stats.strictDuplicates}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Info className="h-8 w-8 text-blue-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Loose Matches</p>
                <p className="text-2xl font-bold text-gray-900">{stats.looseDuplicates}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="h-5 w-5 mr-2" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Detection Mode</label>
              <Select value={selectedMode} onValueChange={(value: 'strict' | 'loose') => setSelectedMode(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="strict">Strict (Exact matches)</SelectItem>
                  <SelectItem value="loose">Loose (Similar matches)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Suburb</label>
              <Input
                placeholder="Filter by suburb..."
                value={suburbFilter}
                onChange={(e) => setSuburbFilter(e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Category</label>
              <Input
                placeholder="Filter by category..."
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Status</label>
              <Select value={resolvedFilter} onValueChange={setResolvedFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="false">Unresolved Only</SelectItem>
                  <SelectItem value="true">Resolved Only</SelectItem>
                  <SelectItem value="all">All</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Duplicate Groups */}
      <div className="space-y-4">
        {duplicateGroups.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Copy className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Duplicate Groups Found</h3>
              <p className="text-gray-600">
                {resolvedFilter === 'false' 
                  ? 'No unresolved duplicate groups found with the current filters.'
                  : 'No duplicate groups found with the current filters.'
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          duplicateGroups.map((group) => (
            <Card key={group.id} className="border-l-4 border-l-orange-500">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <CardTitle className="text-lg">Duplicate Group</CardTitle>
                    <Badge className={getConfidenceColor(group.confidence)}>
                      {group.confidence.toUpperCase()} CONFIDENCE
                    </Badge>
                    <Badge variant="outline">
                      {group.duplicateType.toUpperCase()}
                    </Badge>
                    {group.resolved && (
                      <Badge className="bg-green-100 text-green-800">
                        RESOLVED
                      </Badge>
                    )}
                  </div>
                  <div className="text-sm text-gray-500">
                    {group.businesses.length} businesses
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {group.businesses.map((business, index) => (
                    <div key={business.id} className="p-4 border rounded-lg bg-gray-50">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h4 className="font-medium text-gray-900">{business.name}</h4>
                            {business.duplicateOfId && (
                              <Badge variant="secondary" className="text-xs">
                                MARKED AS DUPLICATE
                              </Badge>
                            )}
                          </div>
                          
                          <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                            <div className="flex items-center">
                              <MapPin className="h-4 w-4 mr-1" />
                              {business.suburb}
                            </div>
                            {business.category && (
                              <div className="flex items-center">
                                <Building2 className="h-4 w-4 mr-1" />
                                {business.category}
                              </div>
                            )}
                          </div>

                          <div className="flex items-center space-x-4 text-sm">
                            {getBusinessContactInfo(business).map((contact, contactIndex) => (
                              <div key={contactIndex} className="flex items-center text-gray-600">
                                <contact.icon className="h-3 w-3 mr-1" />
                                <span className="truncate max-w-32">{contact.value}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="flex flex-col space-y-2 ml-4">
                          {!business.duplicateOfId ? (
                            <>
                              {index === 0 && (
                                <Button
                                  size="sm"
                                  onClick={() => {
                                    const duplicateIds = group.businesses
                                      .filter((_, i) => i !== 0)
                                      .map(b => b.id);
                                    mergeDuplicates(business.id, duplicateIds);
                                  }}
                                  disabled={merging === business.id}
                                  className="bg-orange-600 hover:bg-orange-700"
                                >
                                  <Merge className="h-3 w-3 mr-1" />
                                  {merging === business.id ? 'Merging...' : 'Keep as Primary'}
                                </Button>
                              )}
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => unmarkDuplicate(business.id)}
                              >
                                <XCircle className="h-3 w-3 mr-1" />
                                Not Duplicate
                              </Button>
                            </>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => unmarkDuplicate(business.id)}
                            >
                              <RefreshCw className="h-3 w-3 mr-1" />
                              Restore
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}