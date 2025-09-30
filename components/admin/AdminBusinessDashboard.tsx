'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  Building2, 
  CheckCircle, 
  Clock, 
  XCircle, 
  Search,
  Filter,
  Download,
  Upload,
  Eye,
  Edit3,
  AlertTriangle,
  Star,
  Users2,
  FileX2,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  MoreHorizontal,
  AlertCircle,
  Sparkles
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { BusinessSource } from '@/lib/domain';
import { SOURCE_LABELS } from '@/lib/domain';

// Types based on AdminBusinessService
interface AdminBusiness {
  id: string;
  name: string;
  slug?: string;
  suburb: string;
  category: string | null;
  email: string | null;
  phone: string | null;
  website: string | null;
  abn: string | null;
  approvalStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
  abnStatus: 'NOT_PROVIDED' | 'PENDING' | 'VERIFIED' | 'INVALID' | 'EXPIRED';
  source: BusinessSource;
  qualityScore: number | null;
  createdAt: string;
  updatedAt: string;
  duplicateOfId?: string;
  ownerId?: string;
  
  // Service layer enhancements
  owner?: {
    id: string;
    email: string;
    role: string;
    createdAt: string;
  };
  leadCount?: number;
  inquiryCount?: number;
  calculatedQualityScore?: number;
  qualityScoreUpToDate?: boolean;
  duplicates?: {
    hasStrictDuplicates: boolean;
    hasLooseDuplicates: boolean;
    strict: any[];
    loose: any[];
  };
  aiAnalysis?: {
    confidence: number;
    recommendation: string;
    reasons: string[];
    lastAnalyzed: string;
  };
}

interface AdminStats {
  pending: number;
  approved: number;
  rejected: number;
  duplicates: number;
  total: number;
  totalCount: number;
  averageQualityScore: number;
  recentRegistrations: number;
  abnVerifiedCount: number;
}

interface AdminBusinessDashboardProps {
  className?: string;
  initialTab?: 'pending' | 'approved' | 'rejected' | 'duplicates';
}

export default function AdminBusinessDashboard({ 
  className, 
  initialTab = 'pending' 
}: AdminBusinessDashboardProps) {
  const [businesses, setBusinesses] = useState<AdminBusiness[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBusinesses, setSelectedBusinesses] = useState<string[]>([]);
  const [filterSuburb, setFilterSuburb] = useState<string>('');
  const [filterCategory, setFilterCategory] = useState<string>('');
  const [filterABNStatus, setFilterABNStatus] = useState<string>('');
  const [filterSource, setFilterSource] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'rejected' | 'duplicates'>(initialTab);
  const [showEnhancements, setShowEnhancements] = useState(true);

  // Stats for tabs and dashboard
  const [stats, setStats] = useState<AdminStats>({
    pending: 0,
    approved: 0,
    rejected: 0,
    duplicates: 0,
    total: 0,
    totalCount: 0,
    averageQualityScore: 0,
    recentRegistrations: 0,
    abnVerifiedCount: 0
  });

  // Pagination
  const [pagination, setPagination] = useState({
    limit: 50,
    offset: 0,
    total: 0,
    hasMore: false
  });

  // Fetch businesses data with service layer enhancements
  const fetchBusinesses = useCallback(async (showLoader = true) => {
    if (showLoader) setLoading(true);
    else setRefreshing(true);

    try {
      const params = new URLSearchParams({
        status: activeTab === 'duplicates' ? '' : activeTab.toUpperCase(),
        limit: pagination.limit.toString(),
        offset: pagination.offset.toString(),
        includeStats: 'true'
      });

      // Add filters
      if (searchTerm) params.append('search', searchTerm);
      if (filterSuburb) params.append('suburb', filterSuburb);
      if (filterCategory) params.append('category', filterCategory);
      if (filterABNStatus) params.append('abnStatus', filterABNStatus);
      if (filterSource) params.append('source', filterSource);

      // Add service layer enhancements
      if (showEnhancements) {
        params.append('includeQualityScore', 'true');
        params.append('includeDuplicates', 'true');
        params.append('includeAIAnalysis', 'true');
      }

      // Special handling for duplicates tab
      if (activeTab === 'duplicates') {
        params.set('includeDuplicates', 'true');
        params.append('duplicatesOnly', 'true');
      }

      const response = await fetch(`/api/admin/businesses?${params}`);
      if (!response.ok) throw new Error('Failed to fetch businesses');
      
      const data = await response.json();
      setBusinesses(data.businesses || []);
      
      // Update stats if provided
      if (data.stats) {
        setStats({
          pending: data.stats.pendingCount || 0,
          approved: data.stats.approvedCount || 0,
          rejected: data.stats.rejectedCount || 0,
          duplicates: data.stats.duplicatesDetected || 0,
          total: data.stats.totalCount || 0,
          totalCount: data.stats.totalCount || 0,
          averageQualityScore: data.stats.averageQualityScore || 0,
          recentRegistrations: data.stats.recentRegistrations || 0,
          abnVerifiedCount: data.stats.abnVerifiedCount || 0
        });
      }

      // Update pagination
      if (data.pagination) {
        setPagination(prev => ({
          ...prev,
          total: data.pagination.total,
          hasMore: data.pagination.hasMore
        }));
      }

    } catch (error) {
      console.error('Error fetching businesses:', error);
      setBusinesses([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [activeTab, searchTerm, filterSuburb, filterCategory, filterABNStatus, filterSource, pagination.limit, pagination.offset, showEnhancements]);

  // Initial data fetch and refresh on dependencies
  useEffect(() => {
    fetchBusinesses();
  }, [fetchBusinesses]);

  // Handle tab change
  const handleTabChange = (newTab: string) => {
    setActiveTab(newTab as typeof activeTab);
    setSelectedBusinesses([]);
    setPagination(prev => ({ ...prev, offset: 0 }));
  };

  // Handle search and filters
  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setPagination(prev => ({ ...prev, offset: 0 }));
  };

  const handleFilterChange = (type: string, value: string) => {
    switch (type) {
      case 'suburb':
        setFilterSuburb(value);
        break;
      case 'category':
        setFilterCategory(value);
        break;
      case 'abnStatus':
        setFilterABNStatus(value);
        break;
      case 'source':
        setFilterSource(value);
        break;
    }
    setPagination(prev => ({ ...prev, offset: 0 }));
  };

  // Refresh data
  const handleRefresh = () => {
    fetchBusinesses(false);
  };

  // Get status badge
  const getStatusBadge = (status: string, type: 'approval' | 'abn') => {
    if (type === 'approval') {
      switch (status) {
        case 'APPROVED':
          return <Badge className="bg-green-100 text-green-700"><CheckCircle className="w-3 h-3 mr-1" />Approved</Badge>;
        case 'PENDING':
          return <Badge className="bg-yellow-100 text-yellow-700"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
        case 'REJECTED':
          return <Badge className="bg-red-100 text-red-700"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
        default:
          return null;
      }
    } else {
      switch (status) {
        case 'VERIFIED':
          return <Badge className="bg-green-100 text-green-700"><CheckCircle className="w-3 h-3 mr-1" />Verified</Badge>;
        case 'PENDING':
          return <Badge className="bg-orange-100 text-orange-700"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
        case 'INVALID':
          return <Badge className="bg-red-100 text-red-700"><AlertTriangle className="w-3 h-3 mr-1" />Invalid</Badge>;
        case 'EXPIRED':
          return <Badge className="bg-gray-100 text-gray-700"><AlertTriangle className="w-3 h-3 mr-1" />Expired</Badge>;
        case 'NOT_PROVIDED':
          return <Badge variant="outline" className="text-gray-600">Not Provided</Badge>;
        default:
          return null;
      }
    }
  };

  // Get source badge
  const getSourceBadge = (source: BusinessSource) => {
    const label = SOURCE_LABELS[source] ?? 'Unknown';
    switch (source) {
      case 'MANUAL':
        return <Badge variant="outline" className="text-blue-600">{label}</Badge>;
      case 'CSV':
        return <Badge variant="outline" className="text-purple-600">{label}</Badge>;
      case 'AUTO_ENRICH':
        return <Badge variant="outline" className="text-orange-600">{label}</Badge>;
      case 'CLAIMED':
        return <Badge variant="outline" className="text-green-600">{label}</Badge>;
      default:
        return <Badge variant="outline">{label}</Badge>;
    }
  };

  // Get quality score display
  const getQualityScoreDisplay = (business: AdminBusiness) => {
    const score = business.calculatedQualityScore || business.qualityScore || 0;
    const isUpToDate = business.qualityScoreUpToDate ?? true;
    
    return (
      <div className="flex items-center justify-center">
        <Star className={`h-4 w-4 mr-1 ${score > 70 ? 'text-yellow-400' : 'text-gray-300'}`} />
        <span className={cn(
          'font-medium',
          score > 70 ? 'text-gray-900' : 'text-gray-500',
          !isUpToDate && 'text-orange-600'
        )}>
          {score}%
        </span>
        {!isUpToDate && (
          <AlertCircle className="h-3 w-3 ml-1 text-orange-500" title="Score may be outdated" />
        )}
      </div>
    );
  };

  // Get AI analysis badge
  const getAIAnalysisBadge = (business: AdminBusiness) => {
    if (!business.aiAnalysis) return null;

    const { confidence, recommendation } = business.aiAnalysis;
    
    if (recommendation === 'approve' && confidence > 80) {
      return <Badge className="bg-green-100 text-green-700"><Sparkles className="w-3 h-3 mr-1" />AI: Approve</Badge>;
    } else if (recommendation === 'reject' && confidence > 80) {
      return <Badge className="bg-red-100 text-red-700"><Sparkles className="w-3 h-3 mr-1" />AI: Reject</Badge>;
    } else {
      return <Badge variant="outline" className="text-gray-600"><Sparkles className="w-3 h-3 mr-1" />AI: Review</Badge>;
    }
  };

  // Filter businesses based on current tab
  const getFilteredBusinesses = () => {
    let filtered = businesses;

    if (activeTab === 'duplicates') {
      filtered = businesses.filter(b => b.duplicateOfId || (b.duplicates?.hasStrictDuplicates || b.duplicates?.hasLooseDuplicates));
    }

    return filtered.filter(business => {
      const matchesSearch = !searchTerm || 
        business.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        business.suburb.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (business.category || '').toLowerCase().includes(searchTerm.toLowerCase());

      return matchesSearch;
    });
  };

  const filteredBusinesses = getFilteredBusinesses();

  if (loading) {
    return (
      <div className={cn('space-y-6', className)}>
        <div className="flex items-center justify-center p-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header with Stats */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Business Management</h1>
          <p className="text-gray-600 mt-2">
            Manage business listings, approvals, and quality control
          </p>
          <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
            <span>Total: {stats.totalCount}</span>
            <span>Avg Quality: {Math.round(stats.averageQualityScore)}%</span>
            <span>Recent (7d): {stats.recentRegistrations}</span>
            <span>ABN Verified: {stats.abnVerifiedCount}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw className={cn("h-4 w-4 mr-2", refreshing && "animate-spin")} />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm">
            <Upload className="h-4 w-4 mr-2" />
            Import
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setShowEnhancements(!showEnhancements)}
            className={showEnhancements ? 'bg-blue-50 border-blue-200' : ''}
          >
            <Sparkles className="h-4 w-4 mr-2" />
            AI Insights
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search businesses, suburbs, or categories..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <Select value={filterSuburb} onValueChange={(value) => handleFilterChange('suburb', value)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by suburb" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Suburbs</SelectItem>
                <SelectItem value="South Yarra">South Yarra</SelectItem>
                <SelectItem value="Richmond">Richmond</SelectItem>
                <SelectItem value="Toorak">Toorak</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterCategory} onValueChange={(value) => handleFilterChange('category', value)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Categories</SelectItem>
                <SelectItem value="Restaurant">Restaurant</SelectItem>
                <SelectItem value="Retail">Retail</SelectItem>
                <SelectItem value="Professional Services">Professional Services</SelectItem>
              </SelectContent>
            </Select>
            {showEnhancements && (
              <>
                <Select value={filterABNStatus} onValueChange={(value) => handleFilterChange('abnStatus', value)}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="ABN Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All ABN</SelectItem>
                    <SelectItem value="VERIFIED">Verified</SelectItem>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="INVALID">Invalid</SelectItem>
                    <SelectItem value="NOT_PROVIDED">Not Provided</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterSource} onValueChange={(value) => handleFilterChange('source', value)}>
                  <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="Source" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Sources</SelectItem>
                    <SelectItem value="MANUAL">Manual</SelectItem>
                    <SelectItem value="CSV">CSV</SelectItem>
                    <SelectItem value="CLAIMED">Claimed</SelectItem>
                    <SelectItem value="AUTO_ENRICH">Auto Enriched</SelectItem>
                  </SelectContent>
                </Select>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="pending" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Pending ({stats.pending})
          </TabsTrigger>
          <TabsTrigger value="approved" className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Approved ({stats.approved})
          </TabsTrigger>
          <TabsTrigger value="rejected" className="flex items-center gap-2">
            <XCircle className="h-4 w-4" />
            Rejected ({stats.rejected})
          </TabsTrigger>
          <TabsTrigger value="duplicates" className="flex items-center gap-2">
            <FileX2 className="h-4 w-4" />
            Duplicates ({stats.duplicates})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          <Card>
            <CardContent className="p-0">
              {filteredBusinesses.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  No businesses found matching your criteria.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <Checkbox
                          checked={selectedBusinesses.length === filteredBusinesses.length && filteredBusinesses.length > 0}
                          onCheckedChange={(checked) => {
                            setSelectedBusinesses(checked ? filteredBusinesses.map(b => b.id) : []);
                          }}
                        />
                      </TableHead>
                      <TableHead>Business</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>ABN Status</TableHead>
                      <TableHead>Source</TableHead>
                      <TableHead className="text-center">Quality</TableHead>
                      {showEnhancements && <TableHead className="text-center">AI Analysis</TableHead>}
                      <TableHead>Created</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredBusinesses.map((business) => (
                      <TableRow key={business.id} className={cn(
                        business.duplicates?.hasStrictDuplicates && "bg-red-50",
                        business.duplicates?.hasLooseDuplicates && "bg-orange-50"
                      )}>
                        <TableCell>
                          <Checkbox
                            checked={selectedBusinesses.includes(business.id)}
                            onCheckedChange={(checked) => {
                              setSelectedBusinesses(prev => 
                                checked 
                                  ? [...prev, business.id]
                                  : prev.filter(id => id !== business.id)
                              );
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="font-medium text-gray-900">{business.name}</div>
                            {business.owner && (
                              <div className="text-xs text-gray-500 flex items-center">
                                <Users2 className="h-3 w-3 mr-1" />
                                {business.owner.email}
                              </div>
                            )}
                            <div className="flex items-center gap-1 flex-wrap">
                              {business.leadCount && business.leadCount > 0 && (
                                <Badge variant="outline" className="text-xs">
                                  {business.leadCount} leads
                                </Badge>
                              )}
                              {business.duplicateOfId && (
                                <Badge variant="outline" className="text-xs">
                                  <FileX2 className="h-3 w-3 mr-1" />
                                  Duplicate
                                </Badge>
                              )}
                              {business.duplicates?.hasStrictDuplicates && (
                                <Badge className="text-xs bg-red-100 text-red-700">
                                  Strict Duplicate
                                </Badge>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-gray-600">{business.suburb}</TableCell>
                        <TableCell className="text-gray-600">{business.category || 'N/A'}</TableCell>
                        <TableCell>{getStatusBadge(business.abnStatus, 'abn')}</TableCell>
                        <TableCell>{getSourceBadge(business.source)}</TableCell>
                        <TableCell>{getQualityScoreDisplay(business)}</TableCell>
                        {showEnhancements && (
                          <TableCell className="text-center">
                            {getAIAnalysisBadge(business)}
                          </TableCell>
                        )}
                        <TableCell className="text-gray-500 text-sm">
                          {new Date(business.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            {business.slug && (
                              <Button variant="ghost" size="sm" asChild>
                                <Link href={`/business/${business.slug}`} target="_blank">
                                  <Eye className="h-4 w-4" />
                                </Link>
                              </Button>
                            )}
                            <Button variant="ghost" size="sm">
                              <Edit3 className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {/* Pagination */}
          {pagination.hasMore && (
            <div className="flex justify-center">
              <Button
                variant="outline"
                onClick={() => setPagination(prev => ({ ...prev, offset: prev.offset + prev.limit }))}
                disabled={loading}
              >
                Load More
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}