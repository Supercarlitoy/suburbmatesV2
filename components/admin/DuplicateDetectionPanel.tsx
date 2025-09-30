'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Textarea } from '@/components/ui/textarea';
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
  FileX2,
  AlertTriangle,
  CheckCircle,
  GitMerge,
  Eye,
  X,
  RefreshCw,
  Search,
  Filter,
  ArrowLeftRight,
  Building2,
  Mail,
  Phone,
  Globe,
  MapPin,
  Calendar,
  Users,
  Star,
  TrendingUp,
  ExternalLink,
  Copy,
  Zap,
  Info,
  Target
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface DuplicateBusiness {
  id: string;
  name: string;
  slug?: string;
  email?: string;
  phone?: string;
  website?: string;
  abn?: string;
  bio?: string;
  suburb: string;
  category?: string;
  approvalStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
  abnStatus: 'NOT_PROVIDED' | 'PENDING' | 'VERIFIED' | 'INVALID' | 'EXPIRED';
  qualityScore?: number;
  source: string;
  createdAt: string;
  updatedAt: string;
  owner?: {
    id: string;
    email: string;
    name?: string;
  };
  leadCount?: number;
  inquiryCount?: number;
}

interface DuplicateGroup {
  id: string;
  confidence: number;
  matchType: 'strict' | 'loose';
  reasons: string[];
  businesses: DuplicateBusiness[];
  primaryBusiness?: DuplicateBusiness; // Suggested primary
  mergeRecommendation: {
    suggested: boolean;
    priority: 'high' | 'medium' | 'low';
    reasoning: string;
    potentialDataLoss: string[];
    estimatedImpact: number;
  };
  lastDetected: string;
  status: 'detected' | 'reviewing' | 'merged' | 'dismissed';
}

interface DuplicateDetectionPanelProps {
  className?: string;
  businessId?: string; // If provided, shows duplicates for specific business
}

export default function DuplicateDetectionPanel({ 
  className,
  businessId 
}: DuplicateDetectionPanelProps) {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [duplicateGroups, setDuplicateGroups] = useState<DuplicateGroup[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<DuplicateGroup | null>(null);
  const [activeTab, setActiveTab] = useState<'strict' | 'loose' | 'all'>('strict');
  const [showMergeDialog, setShowMergeDialog] = useState(false);
  const [showCompareDialog, setShowCompareDialog] = useState(false);
  const [mergeNotes, setMergeNotes] = useState('');
  const [selectedBusinesses, setSelectedBusinesses] = useState<string[]>([]);
  const [mergePrimary, setMergePrimary] = useState<string>('');

  // Fetch duplicate groups
  const fetchDuplicates = async (showLoader = true) => {
    if (showLoader) setLoading(true);
    else setRefreshing(true);

    try {
      const params = new URLSearchParams();
      
      if (businessId) {
        params.append('businessId', businessId);
      }
      
      if (activeTab !== 'all') {
        params.append('matchType', activeTab);
      }

      const response = await fetch(`/api/admin/duplicates?${params}`);
      if (!response.ok) throw new Error('Failed to fetch duplicates');
      
      const data = await response.json();
      setDuplicateGroups(data.duplicateGroups || []);
    } catch (error) {
      console.error('Error fetching duplicates:', error);
      setDuplicateGroups([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDuplicates();
  }, [activeTab, businessId]);

  // Handle merge operation
  const handleMerge = async () => {
    if (!selectedGroup || selectedBusinesses.length < 2 || !mergePrimary) return;

    try {
      const response = await fetch('/api/admin/duplicates/merge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          primaryBusinessId: mergePrimary,
          duplicateBusinessIds: selectedBusinesses.filter(id => id !== mergePrimary),
          mergeStrategy: 'preserve_primary_with_enhancement',
          notes: mergeNotes,
          groupId: selectedGroup.id
        })
      });

      if (!response.ok) throw new Error('Merge operation failed');

      // Refresh data and close dialogs
      setShowMergeDialog(false);
      setSelectedGroup(null);
      setMergeNotes('');
      setSelectedBusinesses([]);
      setMergePrimary('');
      await fetchDuplicates(false);

    } catch (error) {
      console.error('Merge error:', error);
    }
  };

  // Handle dismissal
  const handleDismiss = async (groupId: string) => {
    try {
      const response = await fetch(`/api/admin/duplicates/dismiss`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ groupId, reason: 'admin_dismissed' })
      });

      if (!response.ok) throw new Error('Dismiss operation failed');

      await fetchDuplicates(false);
    } catch (error) {
      console.error('Dismiss error:', error);
    }
  };

  // Get confidence color
  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return 'text-red-600 bg-red-100';
    if (confidence >= 70) return 'text-orange-600 bg-orange-100';
    if (confidence >= 50) return 'text-yellow-600 bg-yellow-100';
    return 'text-blue-600 bg-blue-100';
  };

  // Get match type badge
  const getMatchTypeBadge = (matchType: 'strict' | 'loose') => {
    return matchType === 'strict' 
      ? <Badge className="bg-red-100 text-red-700">Strict Match</Badge>
      : <Badge className="bg-orange-100 text-orange-700">Loose Match</Badge>;
  };

  // Get priority badge
  const getPriorityBadge = (priority: 'high' | 'medium' | 'low') => {
    const colors = {
      high: 'bg-red-100 text-red-700',
      medium: 'bg-orange-100 text-orange-700',
      low: 'bg-blue-100 text-blue-700'
    };
    
    return <Badge className={colors[priority]}>{priority.toUpperCase()}</Badge>;
  };

  // Business comparison component
  const BusinessCard = ({ business, isSelected, onSelect, isPrimary, onSetPrimary }: {
    business: DuplicateBusiness;
    isSelected?: boolean;
    onSelect?: (selected: boolean) => void;
    isPrimary?: boolean;
    onSetPrimary?: () => void;
  }) => (
    <Card className={cn(
      'transition-all duration-200',
      isSelected && 'ring-2 ring-blue-500',
      isPrimary && 'ring-2 ring-green-500 bg-green-50'
    )}>
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-gray-900">{business.name}</h3>
                {onSelect && (
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={onSelect}
                  />
                )}
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Badge variant="outline">{business.source}</Badge>
                <span>•</span>
                <span>{business.approvalStatus}</span>
                {business.qualityScore && (
                  <>
                    <span>•</span>
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3" />
                      <span>{business.qualityScore}%</span>
                    </div>
                  </>
                )}
              </div>
            </div>
            {onSetPrimary && (
              <Button
                variant={isPrimary ? "default" : "outline"}
                size="sm"
                onClick={onSetPrimary}
              >
                {isPrimary ? "Primary" : "Set Primary"}
              </Button>
            )}
          </div>

          {/* Business Details */}
          <div className="grid grid-cols-1 gap-2 text-sm">
            {business.email && (
              <div className="flex items-center gap-2 text-gray-600">
                <Mail className="h-4 w-4" />
                <span>{business.email}</span>
              </div>
            )}
            {business.phone && (
              <div className="flex items-center gap-2 text-gray-600">
                <Phone className="h-4 w-4" />
                <span>{business.phone}</span>
              </div>
            )}
            {business.website && (
              <div className="flex items-center gap-2 text-gray-600">
                <Globe className="h-4 w-4" />
                <span className="truncate">{business.website}</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-gray-600">
              <MapPin className="h-4 w-4" />
              <span>{business.suburb} • {business.category || 'Uncategorized'}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Calendar className="h-4 w-4" />
              <span>Created {new Date(business.createdAt).toLocaleDateString()}</span>
            </div>
            {(business.leadCount || business.inquiryCount) && (
              <div className="flex items-center gap-4 text-gray-600">
                {business.leadCount && business.leadCount > 0 && (
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>{business.leadCount} leads</span>
                  </div>
                )}
                {business.inquiryCount && business.inquiryCount > 0 && (
                  <div className="flex items-center gap-1">
                    <Mail className="h-4 w-4" />
                    <span>{business.inquiryCount} inquiries</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Owner Info */}
          {business.owner && (
            <div className="pt-2 border-t border-gray-100">
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Users className="h-3 w-3" />
                <span>Owner: {business.owner.name || business.owner.email}</span>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
            {business.slug && (
              <Button variant="ghost" size="sm" asChild>
                <a href={`/business/${business.slug}`} target="_blank" rel="noopener noreferrer">
                  <Eye className="h-4 w-4 mr-1" />
                  View
                </a>
              </Button>
            )}
            <Button variant="ghost" size="sm">
              <ExternalLink className="h-4 w-4 mr-1" />
              Edit
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className={cn('space-y-6', className)}>
        <div className="flex items-center justify-center p-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  // Filter groups by active tab
  const filteredGroups = duplicateGroups.filter(group => {
    if (activeTab === 'all') return true;
    return group.matchType === activeTab;
  });

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FileX2 className="h-6 w-6" />
            Duplicate Detection Panel
          </h2>
          <p className="text-gray-600 mt-1">
            {businessId ? 'Duplicates for selected business' : 'Manage duplicate businesses and merge conflicts'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchDuplicates(false)}
            disabled={refreshing}
          >
            <RefreshCw className={cn("h-4 w-4 mr-2", refreshing && "animate-spin")} />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Search className="h-4 w-4 mr-2" />
            Detect New
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <AlertTriangle className="h-8 w-8 text-red-500" />
              <TrendingUp className="h-4 w-4 text-red-500" />
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold text-gray-900">
                {duplicateGroups.filter(g => g.matchType === 'strict').length}
              </p>
              <p className="text-sm text-gray-600">Strict Duplicates</p>
              <p className="text-xs text-red-600">High confidence matches</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <Target className="h-8 w-8 text-orange-500" />
              <span className="text-xs text-gray-500">Review</span>
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold text-gray-900">
                {duplicateGroups.filter(g => g.matchType === 'loose').length}
              </p>
              <p className="text-sm text-gray-600">Loose Matches</p>
              <p className="text-xs text-orange-600">Require manual review</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <GitMerge className="h-8 w-8 text-blue-500" />
              <CheckCircle className="h-4 w-4 text-green-500" />
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold text-gray-900">
                {duplicateGroups.filter(g => g.mergeRecommendation.suggested).length}
              </p>
              <p className="text-sm text-gray-600">Merge Recommended</p>
              <p className="text-xs text-blue-600">Ready for action</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(value: any) => setActiveTab(value)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="strict" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Strict ({duplicateGroups.filter(g => g.matchType === 'strict').length})
          </TabsTrigger>
          <TabsTrigger value="loose" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Loose ({duplicateGroups.filter(g => g.matchType === 'loose').length})
          </TabsTrigger>
          <TabsTrigger value="all" className="flex items-center gap-2">
            <FileX2 className="h-4 w-4" />
            All ({duplicateGroups.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          {filteredGroups.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Duplicates Found</h3>
                <p className="text-gray-600">
                  {activeTab === 'strict' 
                    ? 'No strict duplicate matches detected.' 
                    : activeTab === 'loose'
                    ? 'No loose matches requiring review.'
                    : 'No duplicates detected in your directory.'
                  }
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredGroups.map((group) => (
                <Card key={group.id} className="overflow-hidden">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div>
                          <CardTitle className="text-lg flex items-center gap-2">
                            Duplicate Group ({group.businesses.length} businesses)
                            {getMatchTypeBadge(group.matchType)}
                          </CardTitle>
                          <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                            <Badge className={cn('text-xs', getConfidenceColor(group.confidence))}>
                              {group.confidence}% confidence
                            </Badge>
                            {getPriorityBadge(group.mergeRecommendation.priority)}
                            <span className="text-gray-500">
                              Detected {new Date(group.lastDetected).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedGroup(group);
                            setShowCompareDialog(true);
                          }}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Compare
                        </Button>
                        {group.mergeRecommendation.suggested && (
                          <Button
                            size="sm"
                            onClick={() => {
                              setSelectedGroup(group);
                              setSelectedBusinesses(group.businesses.map(b => b.id));
                              setMergePrimary(group.primaryBusiness?.id || group.businesses[0].id);
                              setShowMergeDialog(true);
                            }}
                          >
                            <GitMerge className="h-4 w-4 mr-2" />
                            Merge
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDismiss(group.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    {/* Match Reasons */}
                    <div className="mb-4">
                      <p className="text-sm font-medium text-gray-700 mb-2">Match Reasons:</p>
                      <div className="flex items-center gap-2 flex-wrap">
                        {group.reasons.map((reason, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {reason}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Business Preview */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {group.businesses.slice(0, 3).map((business) => (
                        <div key={business.id} className="p-3 border rounded-lg bg-gray-50">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium text-gray-900">{business.name}</h4>
                              {business.id === group.primaryBusiness?.id && (
                                <Badge className="text-xs bg-green-100 text-green-700">Primary</Badge>
                              )}
                            </div>
                            <div className="space-y-1 text-xs text-gray-600">
                              {business.email && <p>📧 {business.email}</p>}
                              {business.phone && <p>📞 {business.phone}</p>}
                              <p>📍 {business.suburb}</p>
                              <p>📅 {new Date(business.createdAt).toLocaleDateString()}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                      {group.businesses.length > 3 && (
                        <div className="p-3 border rounded-lg bg-gray-100 flex items-center justify-center">
                          <span className="text-gray-500">
                            +{group.businesses.length - 3} more
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Merge Recommendation */}
                    {group.mergeRecommendation.suggested && (
                      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-start gap-3">
                          <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                          <div>
                            <h4 className="font-medium text-blue-900">Merge Recommended</h4>
                            <p className="text-sm text-blue-800 mt-1">
                              {group.mergeRecommendation.reasoning}
                            </p>
                            {group.mergeRecommendation.potentialDataLoss.length > 0 && (
                              <p className="text-xs text-blue-700 mt-2">
                                ⚠️ Potential data loss: {group.mergeRecommendation.potentialDataLoss.join(', ')}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Compare Dialog */}
      {selectedGroup && (
        <Dialog open={showCompareDialog} onOpenChange={setShowCompareDialog}>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Compare Duplicate Businesses</DialogTitle>
              <DialogDescription>
                Review the details of each business to determine if they should be merged.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              {/* Match Information */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-4">
                  <Badge className={cn('text-xs', getConfidenceColor(selectedGroup.confidence))}>
                    {selectedGroup.confidence}% Match Confidence
                  </Badge>
                  {getMatchTypeBadge(selectedGroup.matchType)}
                  {getPriorityBadge(selectedGroup.mergeRecommendation.priority)}
                </div>
                <div className="text-sm text-gray-600">
                  Match Reasons: {selectedGroup.reasons.join(', ')}
                </div>
              </div>

              {/* Business Comparison */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {selectedGroup.businesses.map((business) => (
                  <BusinessCard
                    key={business.id}
                    business={business}
                    isPrimary={business.id === selectedGroup.primaryBusiness?.id}
                  />
                ))}
              </div>

              {/* Recommendation */}
              {selectedGroup.mergeRecommendation.suggested && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Merge Recommendation</h4>
                  <p className="text-sm text-blue-800">{selectedGroup.mergeRecommendation.reasoning}</p>
                  <p className="text-sm text-blue-700 mt-2">
                    Estimated impact: {selectedGroup.mergeRecommendation.estimatedImpact} point quality score increase
                  </p>
                </div>
              )}
            </div>

            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Close</Button>
              </DialogClose>
              <Button
                onClick={() => {
                  setShowCompareDialog(false);
                  setSelectedBusinesses(selectedGroup.businesses.map(b => b.id));
                  setMergePrimary(selectedGroup.primaryBusiness?.id || selectedGroup.businesses[0].id);
                  setShowMergeDialog(true);
                }}
                disabled={!selectedGroup.mergeRecommendation.suggested}
              >
                <GitMerge className="h-4 w-4 mr-2" />
                Proceed to Merge
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Merge Dialog */}
      {selectedGroup && (
        <AlertDialog open={showMergeDialog} onOpenChange={setShowMergeDialog}>
          <AlertDialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <GitMerge className="h-5 w-5" />
                Merge Duplicate Businesses
              </AlertDialogTitle>
              <AlertDialogDescription>
                This action will merge the selected businesses into one primary business. This cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>

            <div className="space-y-6">
              {/* Business Selection */}
              <div className="space-y-4">
                <h4 className="font-medium">Select businesses to merge:</h4>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {selectedGroup.businesses.map((business) => (
                    <BusinessCard
                      key={business.id}
                      business={business}
                      isSelected={selectedBusinesses.includes(business.id)}
                      onSelect={(selected) => {
                        if (selected) {
                          setSelectedBusinesses(prev => [...prev, business.id]);
                        } else {
                          setSelectedBusinesses(prev => prev.filter(id => id !== business.id));
                          if (mergePrimary === business.id) {
                            setMergePrimary('');
                          }
                        }
                      }}
                      isPrimary={mergePrimary === business.id}
                      onSetPrimary={() => setMergePrimary(business.id)}
                    />
                  ))}
                </div>
              </div>

              {/* Merge Notes */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Merge Notes (optional)</label>
                <Textarea
                  value={mergeNotes}
                  onChange={(e) => setMergeNotes(e.target.value)}
                  placeholder="Add notes about this merge operation..."
                  className="min-h-[80px]"
                />
              </div>

              {/* Warnings */}
              {selectedGroup.mergeRecommendation.potentialDataLoss.length > 0 && (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-yellow-900">Potential Data Loss</h4>
                      <ul className="text-sm text-yellow-800 mt-1 list-disc list-inside">
                        {selectedGroup.mergeRecommendation.potentialDataLoss.map((loss, index) => (
                          <li key={index}>{loss}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleMerge}
                disabled={selectedBusinesses.length < 2 || !mergePrimary}
                className="bg-red-600 hover:bg-red-700"
              >
                <GitMerge className="h-4 w-4 mr-2" />
                Confirm Merge
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}