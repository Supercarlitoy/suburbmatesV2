"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Brain,
  TrendingUp,
  AlertCircle,
  Filter,
  Search,
  ChevronDown,
  Eye,
  RefreshCw,
  ThumbsUp,
  ThumbsDown,
  Zap,
  BarChart3,
  Settings,
  Users,
  Building,
  MapPin,
  Calendar,
  Tag,
  FileText,
  Star,
  Target,
  Activity,
  ArrowRight,
  Info
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface PendingReviewItem {
  businessId: string;
  businessName: string;
  businessSlug: string;
  businessSuburb: string;
  businessCategory: string;
  
  // AI Analysis Results
  aiRecommendation: 'approve' | 'reject' | 'manual_review';
  confidenceScore: number; // 0-100
  aiAnalysisDate: string;
  
  // Priority & Urgency Factors
  priorityScore: number; // 0-100
  agingDays: number;
  businessValue: 'low' | 'medium' | 'high';
  riskLevel: 'low' | 'medium' | 'high';
  
  // Key AI Insights
  keyIssues: string[];
  keyStrengths: string[];
  missingFields: string[];
  duplicateCount: number;
  
  // Business Context
  source: string;
  submissionDate: string;
  lastModified: string;
  qualityScore: number;
  abnStatus: string;
  ownerId: string | null;
  
  // Admin Context
  adminNotesCount: number;
  previousReviewAttempts: number;
  escalatedForReview: boolean;
}

interface PendingReviewResponse {
  totalPending: number;
  totalFiltered: number;
  highPriority: number;
  mediumPriority: number;
  lowPriority: number;
  avgAgingDays: number;
  oldestPending: number;
  
  recommendations: {
    approve: number;
    reject: number;
    manual_review: number;
  };
  
  avgConfidenceScores: {
    approve: number;
    reject: number;
    manual_review: number;
  };
  
  items: PendingReviewItem[];
  
  agingDistribution: {
    range: string;
    count: number;
    avgConfidence: number;
  }[];
  
  categoryBreakdown: {
    category: string;
    count: number;
    avgPriority: number;
    avgConfidence: number;
  }[];
  
  batchProcessingRecommendations: {
    autoApprove: {
      count: number;
      criteria: string;
      businessIds: string[];
    };
    autoReject: {
      count: number;
      criteria: string;
      businessIds: string[];
    };
    needsManualReview: {
      count: number;
      criteria: string;
      businessIds: string[];
    };
  };
}

interface AIDecisionReviewInterfaceProps {
  className?: string;
}

export default function AIDecisionReviewInterface({ className }: AIDecisionReviewInterfaceProps) {
  // State management
  const [pendingReviews, setPendingReviews] = useState<PendingReviewResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [processingBatch, setProcessingBatch] = useState(false);

  // Filter state
  const [filters, setFilters] = useState({
    recommendationType: 'all',
    confidenceMin: '',
    confidenceMax: '',
    priority: 'all',
    riskLevel: 'all',
    businessValue: 'all',
    agingDaysMin: '',
    agingDaysMax: '',
    category: '',
    suburb: '',
    source: 'all',
    abnStatus: 'all',
    sortBy: 'priority',
    sortOrder: 'desc'
  });

  // UI state
  const [activeTab, setActiveTab] = useState('overview');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedBusiness, setSelectedBusiness] = useState<PendingReviewItem | null>(null);
  const [reviewDecision, setReviewDecision] = useState({
    action: '',
    reason: '',
    detailedNotes: '',
    agreedWithRecommendation: false,
    accuracyFeedback: '',
    adjustConfidenceThreshold: false,
    newConfidenceThreshold: '',
    notifyBusinessOwner: false
  });

  // Fetch pending reviews
  const fetchPendingReviews = useCallback(async (showLoader = true) => {
    if (showLoader) setLoading(true);
    if (!showLoader) setRefreshing(true);

    try {
      const queryParams = new URLSearchParams();
      
      // Add filters to query
      Object.entries(filters).forEach(([key, value]) => {
        if (value && value !== 'all' && value !== '') {
          queryParams.append(key, value.toString());
        }
      });

      const response = await fetch(`/api/admin/ai-automation/pending-review?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('supabase_access_token')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setPendingReviews(data);
      } else {
        console.error('Failed to fetch pending reviews:', response.statusText);
      }
    } catch (error) {
      console.error('Error fetching pending reviews:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [filters]);

  // Initial load and periodic refresh
  useEffect(() => {
    fetchPendingReviews();
    const interval = setInterval(() => fetchPendingReviews(false), 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [fetchPendingReviews]);

  // Helper functions
  const getRecommendationIcon = (recommendation: string) => {
    switch (recommendation) {
      case 'approve':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'reject':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'manual_review':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getRecommendationColor = (recommendation: string) => {
    switch (recommendation) {
      case 'approve':
        return 'text-green-700 bg-green-100 border-green-200';
      case 'reject':
        return 'text-red-700 bg-red-100 border-red-200';
      case 'manual_review':
        return 'text-yellow-700 bg-yellow-100 border-yellow-200';
      default:
        return 'text-gray-700 bg-gray-100 border-gray-200';
    }
  };

  const getPriorityColor = (priority: 'low' | 'medium' | 'high') => {
    switch (priority) {
      case 'high':
        return 'text-red-700 bg-red-100 border-red-200';
      case 'medium':
        return 'text-yellow-700 bg-yellow-100 border-yellow-200';
      case 'low':
        return 'text-green-700 bg-green-100 border-green-200';
    }
  };

  const getRiskColor = (risk: 'low' | 'medium' | 'high') => {
    switch (risk) {
      case 'high':
        return 'text-red-700 bg-red-100 border-red-200';
      case 'medium':
        return 'text-yellow-700 bg-yellow-100 border-yellow-200';
      case 'low':
        return 'text-green-700 bg-green-100 border-green-200';
    }
  };

  const getConfidenceColor = (score: number) => {
    if (score >= 80) return 'text-green-700';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  // Handle selection
  const handleSelectItem = (businessId: string, checked: boolean) => {
    const newSelected = new Set(selectedItems);
    if (checked) {
      newSelected.add(businessId);
    } else {
      newSelected.delete(businessId);
    }
    setSelectedItems(newSelected);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked && pendingReviews?.items) {
      setSelectedItems(new Set(pendingReviews.items.map(item => item.businessId)));
    } else {
      setSelectedItems(new Set());
    }
  };

  // Handle individual business review
  const handleBusinessReview = async (businessId: string, decision: any) => {
    try {
      const response = await fetch(`/api/admin/ai-automation/review/${businessId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('supabase_access_token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(decision),
      });

      if (response.ok) {
        // Refresh the pending reviews
        await fetchPendingReviews(false);
        setSelectedBusiness(null);
        setReviewDecision({
          action: '',
          reason: '',
          detailedNotes: '',
          agreedWithRecommendation: false,
          accuracyFeedback: '',
          adjustConfidenceThreshold: false,
          newConfidenceThreshold: '',
          notifyBusinessOwner: false
        });
      } else {
        console.error('Failed to process review:', response.statusText);
      }
    } catch (error) {
      console.error('Error processing review:', error);
    }
  };

  // Handle batch operations
  const handleBatchOperation = async (action: 'approve' | 'reject', businessIds: string[], reason: string) => {
    setProcessingBatch(true);
    
    try {
      // Process each business individually (in a real implementation, this would be a batch API)
      for (const businessId of businessIds) {
        await handleBusinessReview(businessId, {
          action,
          reason,
          agreedWithRecommendation: true,
          accuracyFeedback: 'accurate',
          notifyBusinessOwner: true
        });
      }
      
      // Clear selection
      setSelectedItems(new Set());
    } catch (error) {
      console.error('Error in batch operation:', error);
    } finally {
      setProcessingBatch(false);
    }
  };

  if (loading) {
    return (
      <div className={cn("space-y-6", className)}>
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center space-x-2">
            <RefreshCw className="h-5 w-5 animate-spin text-blue-500" />
            <span className="text-sm text-gray-600">Loading AI decision reviews...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!pendingReviews) {
    return (
      <div className={cn("space-y-6", className)}>
        <Card>
          <CardContent className="flex items-center justify-center h-64">
            <div className="text-center space-y-3">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
              <h3 className="text-lg font-medium">Failed to Load AI Reviews</h3>
              <p className="text-sm text-gray-600">Please check your connection and try again.</p>
              <Button onClick={() => fetchPendingReviews()} variant="outline">
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header and Summary */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">AI Decision Review</h1>
            <p className="text-gray-600">
              Review and manage AI-powered business approval recommendations
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
            >
              <Filter className="h-4 w-4" />
              Filters
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchPendingReviews(false)}
              disabled={refreshing}
              className="flex items-center gap-2"
            >
              <RefreshCw className={cn("h-4 w-4", refreshing && "animate-spin")} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Pending</p>
                  <p className="text-2xl font-bold text-gray-900">{pendingReviews.totalPending}</p>
                </div>
                <Clock className="h-8 w-8 text-blue-500" />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Avg aging: {pendingReviews.avgAgingDays} days
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">High Priority</p>
                  <p className="text-2xl font-bold text-red-600">{pendingReviews.highPriority}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-500" />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Requires immediate attention
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Auto-Approve Ready</p>
                  <p className="text-2xl font-bold text-green-600">
                    {pendingReviews.batchProcessingRecommendations.autoApprove.count}
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                High confidence recommendations
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">AI Confidence</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {Math.round(
                      (pendingReviews.avgConfidenceScores.approve + 
                       pendingReviews.avgConfidenceScores.reject + 
                       pendingReviews.avgConfidenceScores.manual_review) / 3
                    )}%
                  </p>
                </div>
                <Brain className="h-8 w-8 text-blue-500" />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Average across all recommendations
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filter Options
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="recommendationType">Recommendation Type</Label>
                <Select
                  value={filters.recommendationType}
                  onValueChange={(value) => setFilters({ ...filters, recommendationType: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="approve">Approve</SelectItem>
                    <SelectItem value="reject">Reject</SelectItem>
                    <SelectItem value="manual_review">Manual Review</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="priority">Priority Level</Label>
                <Select
                  value={filters.priority}
                  onValueChange={(value) => setFilters({ ...filters, priority: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All priorities" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priorities</SelectItem>
                    <SelectItem value="high">High Priority</SelectItem>
                    <SelectItem value="medium">Medium Priority</SelectItem>
                    <SelectItem value="low">Low Priority</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="riskLevel">Risk Level</Label>
                <Select
                  value={filters.riskLevel}
                  onValueChange={(value) => setFilters({ ...filters, riskLevel: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All risk levels" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Risk Levels</SelectItem>
                    <SelectItem value="high">High Risk</SelectItem>
                    <SelectItem value="medium">Medium Risk</SelectItem>
                    <SelectItem value="low">Low Risk</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="businessValue">Business Value</Label>
                <Select
                  value={filters.businessValue}
                  onValueChange={(value) => setFilters({ ...filters, businessValue: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All values" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Values</SelectItem>
                    <SelectItem value="high">High Value</SelectItem>
                    <SelectItem value="medium">Medium Value</SelectItem>
                    <SelectItem value="low">Low Value</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="confidenceMin">Min Confidence</Label>
                <Input
                  id="confidenceMin"
                  type="number"
                  min="0"
                  max="100"
                  placeholder="0"
                  value={filters.confidenceMin}
                  onChange={(e) => setFilters({ ...filters, confidenceMin: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="confidenceMax">Max Confidence</Label>
                <Input
                  id="confidenceMax"
                  type="number"
                  min="0"
                  max="100"
                  placeholder="100"
                  value={filters.confidenceMax}
                  onChange={(e) => setFilters({ ...filters, confidenceMax: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  placeholder="e.g., Restaurant, Retail"
                  value={filters.category}
                  onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="suburb">Suburb</Label>
                <Input
                  id="suburb"
                  placeholder="e.g., Melbourne, Carlton"
                  value={filters.suburb}
                  onChange={(e) => setFilters({ ...filters, suburb: e.target.value })}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="pending-reviews">
            Pending Reviews ({pendingReviews.totalFiltered})
          </TabsTrigger>
          <TabsTrigger value="batch-operations">Batch Operations</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Recommendation Distribution */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Approve Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {pendingReviews.recommendations.approve}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Avg confidence: {Math.round(pendingReviews.avgConfidenceScores.approve)}%
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <XCircle className="h-4 w-4 text-red-500" />
                  Reject Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {pendingReviews.recommendations.reject}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Avg confidence: {Math.round(pendingReviews.avgConfidenceScores.reject)}%
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-500" />
                  Manual Review Needed
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">
                  {pendingReviews.recommendations.manual_review}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Avg confidence: {Math.round(pendingReviews.avgConfidenceScores.manual_review)}%
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Category Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Category Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {pendingReviews.categoryBreakdown.map((category) => (
                  <div key={category.category} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="font-medium text-gray-900">{category.category}</h4>
                      <p className="text-sm text-gray-600">{category.count} businesses pending</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">
                        Avg Priority: <span className="text-blue-600">{Math.round(category.avgPriority)}</span>
                      </p>
                      <p className="text-sm text-gray-600">
                        Avg Confidence: {Math.round(category.avgConfidence)}%
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Aging Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Aging Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {pendingReviews.agingDistribution.map((age) => (
                  <div key={age.range} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="font-medium text-gray-900">{age.range}</h4>
                      <p className="text-sm text-gray-600">{age.count} businesses</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">
                        Avg Confidence: <span className="text-blue-600">{Math.round(age.avgConfidence)}%</span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pending-reviews" className="space-y-6">
          {/* Bulk Selection Controls */}
          {selectedItems.size > 0 && (
            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-blue-900">
                      {selectedItems.size} selected
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedItems(new Set())}
                    >
                      Clear Selection
                    </Button>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      className="bg-green-600 hover:bg-green-700"
                      disabled={processingBatch}
                      onClick={() => {
                        const reason = prompt("Enter approval reason:");
                        if (reason) {
                          handleBatchOperation('approve', Array.from(selectedItems), reason);
                        }
                      }}
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Batch Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      disabled={processingBatch}
                      onClick={() => {
                        const reason = prompt("Enter rejection reason:");
                        if (reason) {
                          handleBatchOperation('reject', Array.from(selectedItems), reason);
                        }
                      }}
                    >
                      <XCircle className="h-4 w-4 mr-1" />
                      Batch Reject
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Pending Reviews Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  Pending AI Reviews
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={selectedItems.size === pendingReviews.items.length && pendingReviews.items.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                  <span className="text-sm text-gray-600">Select All</span>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12"></TableHead>
                    <TableHead>Business</TableHead>
                    <TableHead>AI Recommendation</TableHead>
                    <TableHead>Confidence</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Risk Level</TableHead>
                    <TableHead>Aging</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingReviews.items.map((item) => (
                    <TableRow key={item.businessId} className="hover:bg-gray-50">
                      <TableCell>
                        <Checkbox
                          checked={selectedItems.has(item.businessId)}
                          onCheckedChange={(checked) => handleSelectItem(item.businessId, !!checked)}
                        />
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium text-gray-900">{item.businessName}</div>
                          <div className="text-sm text-gray-600 flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {item.businessSuburb}
                            <span className="mx-1">•</span>
                            <Tag className="h-3 w-3" />
                            {item.businessCategory}
                          </div>
                          {item.keyIssues.length > 0 && (
                            <div className="text-xs text-red-600 mt-1">
                              Issues: {item.keyIssues.slice(0, 2).join(', ')}
                              {item.keyIssues.length > 2 && '...'}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getRecommendationIcon(item.aiRecommendation)}
                          <Badge className={cn("text-xs", getRecommendationColor(item.aiRecommendation))}>
                            {item.aiRecommendation.replace('_', ' ').toUpperCase()}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress value={item.confidenceScore} className="w-16 h-2" />
                          <span className={cn("text-sm font-medium", getConfidenceColor(item.confidenceScore))}>
                            {item.confidenceScore}%
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={cn("text-xs", getPriorityColor(item.businessValue))}>
                          {item.businessValue.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={cn("text-xs", getRiskColor(item.riskLevel))}>
                          {item.riskLevel.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="font-medium">{item.agingDays} days</div>
                          <div className="text-gray-600">
                            {item.agingDays > 7 ? 'Overdue' : 'On time'}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedBusiness(item)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-4xl">
                              <DialogHeader>
                                <DialogTitle>Review: {item.businessName}</DialogTitle>
                              </DialogHeader>
                              <BusinessReviewDialog 
                                business={item}
                                onReview={handleBusinessReview}
                                onClose={() => setSelectedBusiness(null)}
                              />
                            </DialogContent>
                          </Dialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="batch-operations" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Auto-Approve Candidates */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="h-5 w-5" />
                  Auto-Approve Ready
                </CardTitle>
                <p className="text-sm text-gray-600">
                  {pendingReviews.batchProcessingRecommendations.autoApprove.criteria}
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="text-2xl font-bold text-green-600">
                    {pendingReviews.batchProcessingRecommendations.autoApprove.count}
                  </div>
                  <p className="text-sm text-gray-600">
                    businesses ready for automatic approval
                  </p>
                  <Button
                    className="w-full bg-green-600 hover:bg-green-700"
                    disabled={processingBatch || pendingReviews.batchProcessingRecommendations.autoApprove.count === 0}
                    onClick={() => {
                      const reason = "Batch auto-approval based on high AI confidence (>85%) and complete business profiles";
                      handleBatchOperation(
                        'approve', 
                        pendingReviews.batchProcessingRecommendations.autoApprove.businessIds,
                        reason
                      );
                    }}
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    {processingBatch ? 'Processing...' : 'Batch Approve All'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Auto-Reject Candidates */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-600">
                  <XCircle className="h-5 w-5" />
                  Auto-Reject Ready
                </CardTitle>
                <p className="text-sm text-gray-600">
                  {pendingReviews.batchProcessingRecommendations.autoReject.criteria}
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="text-2xl font-bold text-red-600">
                    {pendingReviews.batchProcessingRecommendations.autoReject.count}
                  </div>
                  <p className="text-sm text-gray-600">
                    businesses recommended for rejection
                  </p>
                  <Button
                    variant="destructive"
                    className="w-full"
                    disabled={processingBatch || pendingReviews.batchProcessingRecommendations.autoReject.count === 0}
                    onClick={() => {
                      const reason = "Batch auto-rejection based on high AI confidence (>85%) for quality/legitimacy issues";
                      handleBatchOperation(
                        'reject', 
                        pendingReviews.batchProcessingRecommendations.autoReject.businessIds,
                        reason
                      );
                    }}
                  >
                    <XCircle className="h-4 w-4 mr-1" />
                    {processingBatch ? 'Processing...' : 'Batch Reject All'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Manual Review Needed */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-yellow-600">
                  <AlertTriangle className="h-5 w-5" />
                  Manual Review Needed
                </CardTitle>
                <p className="text-sm text-gray-600">
                  {pendingReviews.batchProcessingRecommendations.needsManualReview.criteria}
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="text-2xl font-bold text-yellow-600">
                    {pendingReviews.batchProcessingRecommendations.needsManualReview.count}
                  </div>
                  <p className="text-sm text-gray-600">
                    businesses require manual review
                  </p>
                  <Button
                    variant="outline"
                    className="w-full border-yellow-300 text-yellow-700 hover:bg-yellow-50"
                    onClick={() => {
                      // Filter to show only manual review items
                      setFilters({ ...filters, recommendationType: 'manual_review' });
                      setActiveTab('pending-reviews');
                    }}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    Review Individual Items
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Performance Metrics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  AI Performance Metrics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium">Average Confidence</span>
                    <span className="text-lg font-bold text-blue-600">
                      {Math.round(
                        (pendingReviews.avgConfidenceScores.approve + 
                         pendingReviews.avgConfidenceScores.reject + 
                         pendingReviews.avgConfidenceScores.manual_review) / 3
                      )}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium">Processing Efficiency</span>
                    <span className="text-lg font-bold text-green-600">
                      {Math.round(
                        ((pendingReviews.batchProcessingRecommendations.autoApprove.count + 
                          pendingReviews.batchProcessingRecommendations.autoReject.count) / 
                         pendingReviews.totalPending) * 100
                      )}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium">Manual Review Rate</span>
                    <span className="text-lg font-bold text-yellow-600">
                      {Math.round(
                        (pendingReviews.batchProcessingRecommendations.needsManualReview.count / 
                         pendingReviews.totalPending) * 100
                      )}%
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* System Health */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  System Health
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm font-medium">AI System Status</span>
                    </div>
                    <Badge className="bg-green-100 text-green-700 border-green-200">
                      Operational
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-blue-500" />
                      <span className="text-sm font-medium">Queue Processing</span>
                    </div>
                    <span className="text-sm font-medium text-blue-600">Real-time</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium">Last Updated</span>
                    <span className="text-sm text-gray-600">
                      {new Date().toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Business Review Dialog Component
function BusinessReviewDialog({ 
  business, 
  onReview, 
  onClose 
}: { 
  business: PendingReviewItem; 
  onReview: (businessId: string, decision: any) => void;
  onClose: () => void;
}) {
  const [decision, setDecision] = useState({
    action: '',
    reason: '',
    detailedNotes: '',
    agreedWithRecommendation: false,
    accuracyFeedback: '',
    adjustConfidenceThreshold: false,
    newConfidenceThreshold: '',
    notifyBusinessOwner: false
  });

  const handleSubmit = () => {
    if (!decision.action || !decision.reason || !decision.accuracyFeedback) {
      alert('Please fill in all required fields');
      return;
    }

    onReview(business.businessId, decision);
  };

  return (
    <div className="space-y-6">
      {/* Business Details */}
      <div className="grid grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Business Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label className="text-sm font-medium text-gray-600">Name</Label>
              <p className="text-sm">{business.businessName}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-600">Location</Label>
              <p className="text-sm">{business.businessSuburb}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-600">Category</Label>
              <p className="text-sm">{business.businessCategory}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-600">Quality Score</Label>
              <p className="text-sm">{business.qualityScore}/100</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-600">ABN Status</Label>
              <p className="text-sm">{business.abnStatus}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">AI Analysis</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label className="text-sm font-medium text-gray-600">Recommendation</Label>
              <div className="flex items-center gap-2">
                {business.aiRecommendation === 'approve' && <CheckCircle className="h-4 w-4 text-green-500" />}
                {business.aiRecommendation === 'reject' && <XCircle className="h-4 w-4 text-red-500" />}
                {business.aiRecommendation === 'manual_review' && <AlertTriangle className="h-4 w-4 text-yellow-500" />}
                <span className="text-sm capitalize">{business.aiRecommendation.replace('_', ' ')}</span>
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-600">Confidence Score</Label>
              <div className="flex items-center gap-2">
                <Progress value={business.confidenceScore} className="flex-1 h-2" />
                <span className="text-sm font-medium">{business.confidenceScore}%</span>
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-600">Priority</Label>
              <Badge className={cn("text-xs", getPriorityColor(business.businessValue))}>
                {business.businessValue.toUpperCase()}
              </Badge>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-600">Risk Level</Label>
              <Badge className={cn("text-xs", getRiskColor(business.riskLevel))}>
                {business.riskLevel.toUpperCase()}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">AI Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <Label className="text-sm font-medium text-gray-600 mb-2 block">Key Strengths</Label>
              <ul className="space-y-1">
                {business.keyStrengths.map((strength, index) => (
                  <li key={index} className="text-sm flex items-center gap-2">
                    <CheckCircle className="h-3 w-3 text-green-500 flex-shrink-0" />
                    {strength}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-600 mb-2 block">Key Issues</Label>
              <ul className="space-y-1">
                {business.keyIssues.map((issue, index) => (
                  <li key={index} className="text-sm flex items-center gap-2">
                    <XCircle className="h-3 w-3 text-red-500 flex-shrink-0" />
                    {issue}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          {business.missingFields.length > 0 && (
            <div className="mt-4">
              <Label className="text-sm font-medium text-gray-600 mb-2 block">Missing Fields</Label>
              <div className="flex flex-wrap gap-2">
                {business.missingFields.map((field, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {field}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Decision Form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Admin Decision</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="action">Action *</Label>
            <Select value={decision.action} onValueChange={(value) => setDecision({ ...decision, action: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="approve">Approve</SelectItem>
                <SelectItem value="reject">Reject</SelectItem>
                <SelectItem value="defer">Defer</SelectItem>
                <SelectItem value="request_changes">Request Changes</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="reason">Reason *</Label>
            <Textarea
              id="reason"
              placeholder="Provide a detailed reason for your decision..."
              value={decision.reason}
              onChange={(e) => setDecision({ ...decision, reason: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="accuracyFeedback">AI Accuracy Feedback *</Label>
            <Select 
              value={decision.accuracyFeedback} 
              onValueChange={(value) => setDecision({ ...decision, accuracyFeedback: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="How accurate was the AI recommendation?" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="accurate">Accurate - AI was correct</SelectItem>
                <SelectItem value="partially_accurate">Partially Accurate - Some issues</SelectItem>
                <SelectItem value="inaccurate">Inaccurate - AI was wrong</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="agreedWithRecommendation"
              checked={decision.agreedWithRecommendation}
              onCheckedChange={(checked) => setDecision({ ...decision, agreedWithRecommendation: !!checked })}
            />
            <Label htmlFor="agreedWithRecommendation" className="text-sm">
              I agree with the AI recommendation
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="notifyBusinessOwner"
              checked={decision.notifyBusinessOwner}
              onCheckedChange={(checked) => setDecision({ ...decision, notifyBusinessOwner: !!checked })}
            />
            <Label htmlFor="notifyBusinessOwner" className="text-sm">
              Notify business owner of decision
            </Label>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>
              Submit Decision
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Helper function to determine priority color (defined outside component to avoid re-creation)
function getPriorityColor(priority: 'low' | 'medium' | 'high') {
  switch (priority) {
    case 'high':
      return 'text-red-700 bg-red-100 border-red-200';
    case 'medium':
      return 'text-yellow-700 bg-yellow-100 border-yellow-200';
    case 'low':
      return 'text-green-700 bg-green-100 border-green-200';
  }
}

// Helper function to determine risk color
function getRiskColor(risk: 'low' | 'medium' | 'high') {
  switch (risk) {
    case 'high':
      return 'text-red-700 bg-red-100 border-red-200';
    case 'medium':
      return 'text-yellow-700 bg-yellow-100 border-yellow-200';
    case 'low':
      return 'text-green-700 bg-green-100 border-green-200';
  }
}