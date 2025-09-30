"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Clock,
  Play,
  Pause,
  Square,
  RotateCcw,
  Filter,
  Search,
  Eye,
  Edit,
  MoreHorizontal,
  Shield,
  FileText,
  Calendar,
  MapPin,
  Phone,
  Mail,
  Globe,
  Star,
  Award,
  Activity,
  Zap,
  Target,
  ChevronDown,
  ChevronRight,
  Info,
  Building2,
  Users,
  RefreshCw,
  Download,
  Upload,
  Database,
  Settings,
  CheckSquare,
  History,
  TrendingUp,
  Gauge
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Enhanced interfaces for Task #7 Phase 1
interface BusinessRecord {
  id: string;
  name: string;
  ownerName?: string;
  email: string | null;
  phone: string | null;
  address: string;
  suburb: string;
  postcode: string;
  category: string;
  abnStatus: 'NOT_PROVIDED' | 'PENDING' | 'VERIFIED' | 'INVALID' | 'EXPIRED';
  approvalStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
  source: 'MANUAL' | 'CSV' | 'AUTO_ENRICH' | 'CLAIMED' | 'CSV_IMPORT';
  qualityScore: number;
  createdAt: string;
  lastUpdated: string;
  tags?: string[];
  assignedTo?: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  completeness: number;
  verificationScore: number;
  ownershipClaimed: boolean;
  leadCount: number;
  inquiryCount: number;
  lastActivity?: string;
}

interface BulkApprovalOperation {
  id: string;
  name: string;
  description: string;
  status: 'DRAFT' | 'READY' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'CANCELLED' | 'PAUSED';
  type: 'APPROVE' | 'REJECT' | 'CONDITIONAL_APPROVE' | 'STAGED_APPROVAL' | 'BULK_UPDATE';
  createdBy: string;
  createdAt: string;
  scheduledFor?: string;
  startedAt?: string;
  completedAt?: string;
  
  // Selection criteria
  criteria: {
    field: string;
    operator: 'EQUALS' | 'CONTAINS' | 'GREATER_THAN' | 'LESS_THAN' | 'IN' | 'NOT_IN' | 'BETWEEN';
    value: any;
    label: string;
  }[];
  
  // Target businesses
  targetCount: number;
  processedCount: number;
  successCount: number;
  failedCount: number;
  skippedCount: number;
  
  // Workflow stages
  workflow: {
    id: string;
    name: string;
    type: 'VALIDATION' | 'APPROVAL' | 'NOTIFICATION' | 'AUDIT' | 'CHECKPOINT';
    status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'SKIPPED';
    config: {
      requiresManualApproval?: boolean;
      notificationTemplate?: string;
      validationRules?: string[];
      checkpointMessage?: string;
      rollbackEnabled?: boolean;
    };
    completedAt?: string;
    results?: {
      success: number;
      failed: number;
      messages: string[];
    };
  }[];
  
  // Safety and rollback
  safetyChecks: {
    maxRecords: number;
    requireApproval: boolean;
    confirmationRequired: boolean;
    backupRequired: boolean;
    rollbackEnabled: boolean;
    stagingEnabled: boolean;
    checkpointFrequency: number; // Records between checkpoints
  };
  
  // Approval and rejection details
  approvalDetails?: {
    reason: string;
    conditions?: string[];
    notifyOwners: boolean;
    customMessage?: string;
    futureEffectiveDate?: string;
    qualityScoreThreshold?: number;
  };
  
  rejectionDetails?: {
    reason: string;
    category: 'INCOMPLETE' | 'INVALID' | 'DUPLICATE' | 'POLICY_VIOLATION' | 'OTHER';
    appealAllowed: boolean;
    improvementSuggestions?: string[];
    resubmissionAllowed: boolean;
    notifyOwners: boolean;
    customMessage?: string;
  };
  
  // Audit and rollback
  auditLog: {
    timestamp: string;
    user: string;
    action: string;
    stage?: string;
    businessId?: string;
    businessName?: string;
    details: string;
    metadata?: Record<string, any>;
  }[];
  
  rollbackInfo?: {
    available: boolean;
    snapshotId?: string;
    rollbackSteps: string[];
    originalState: Record<string, any>;
  };
}

interface StagedApprovalWorkflow {
  stages: {
    id: string;
    name: string;
    description: string;
    order: number;
    type: 'AUTO_APPROVE' | 'MANUAL_REVIEW' | 'CONDITIONAL' | 'CHECKPOINT';
    conditions?: {
      qualityScoreMin?: number;
      abnRequired?: boolean;
      ownershipVerified?: boolean;
      customRules?: string[];
    };
    approvers?: string[];
    checkpointConfig?: {
      message: string;
      allowContinue: boolean;
      requireConfirmation: boolean;
    };
  }[];
}

interface EnhancedBulkBusinessManagementProps {
  className?: string;
}

export default function EnhancedBulkBusinessManagement({ className }: EnhancedBulkBusinessManagementProps) {
  // State management
  const [businesses, setBusinesses] = useState<BusinessRecord[]>([]);
  const [bulkOperations, setBulkOperations] = useState<BulkApprovalOperation[]>([]);
  const [selectedBusinesses, setSelectedBusinesses] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [operationInProgress, setOperationInProgress] = useState(false);
  
  // UI State
  const [activeTab, setActiveTab] = useState('selection');
  const [showOperationBuilder, setShowOperationBuilder] = useState(false);
  const [showStagedWorkflow, setShowStagedWorkflow] = useState(false);
  const [showRollbackDialog, setShowRollbackDialog] = useState<string | null>(null);
  
  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('PENDING');
  const [qualityFilter, setQualityFilter] = useState('all');
  const [riskFilter, setRiskFilter] = useState('all');
  const [sourceFilter, setSourceFilter] = useState('all');
  const [advancedFilters, setAdvancedFilters] = useState<any[]>([]);
  
  // Operation builder state
  const [newOperation, setNewOperation] = useState<Partial<BulkApprovalOperation>>({
    name: '',
    description: '',
    type: 'APPROVE',
    criteria: [],
    workflow: [],
    safetyChecks: {
      maxRecords: 1000,
      requireApproval: true,
      confirmationRequired: true,
      backupRequired: true,
      rollbackEnabled: true,
      stagingEnabled: true,
      checkpointFrequency: 100
    }
  });
  
  // Staged workflow state
  const [stagedWorkflow, setStagedWorkflow] = useState<StagedApprovalWorkflow>({
    stages: []
  });

  // Filter businesses based on criteria
  const filteredBusinesses = useMemo(() => {
    let filtered = businesses;
    
    // Search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(business => 
        business.name.toLowerCase().includes(query) ||
        business.ownerName?.toLowerCase().includes(query) ||
        business.email?.toLowerCase().includes(query) ||
        business.suburb.toLowerCase().includes(query) ||
        business.category.toLowerCase().includes(query)
      );
    }
    
    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(business => business.approvalStatus === statusFilter);
    }
    
    // Quality filter
    if (qualityFilter !== 'all') {
      switch (qualityFilter) {
        case 'high':
          filtered = filtered.filter(business => business.qualityScore >= 80);
          break;
        case 'medium':
          filtered = filtered.filter(business => business.qualityScore >= 60 && business.qualityScore < 80);
          break;
        case 'low':
          filtered = filtered.filter(business => business.qualityScore < 60);
          break;
      }
    }
    
    // Risk filter
    if (riskFilter !== 'all') {
      filtered = filtered.filter(business => business.riskLevel === riskFilter);
    }
    
    // Source filter
    if (sourceFilter !== 'all') {
      filtered = filtered.filter(business => business.source === sourceFilter);
    }
    
    // Advanced filters
    advancedFilters.forEach(filter => {
      if (!filter.field || !filter.operator || filter.value === undefined) return;
      
      filtered = filtered.filter(business => {
        const fieldValue = business[filter.field as keyof BusinessRecord];
        
        switch (filter.operator) {
          case 'EQUALS':
            return fieldValue === filter.value;
          case 'CONTAINS':
            return String(fieldValue).toLowerCase().includes(String(filter.value).toLowerCase());
          case 'GREATER_THAN':
            return Number(fieldValue) > Number(filter.value);
          case 'LESS_THAN':
            return Number(fieldValue) < Number(filter.value);
          case 'IN':
            return Array.isArray(filter.value) && filter.value.includes(fieldValue);
          case 'BETWEEN':
            return Array.isArray(filter.value) && 
                   Number(fieldValue) >= Number(filter.value[0]) && 
                   Number(fieldValue) <= Number(filter.value[1]);
          default:
            return true;
        }
      });
    });
    
    return filtered;
  }, [businesses, searchQuery, statusFilter, qualityFilter, riskFilter, sourceFilter, advancedFilters]);

  // Load data
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [businessesRes, operationsRes] = await Promise.all([
        fetch('/api/admin/businesses/bulk-management', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('supabase_access_token')}`,
          },
        }),
        fetch('/api/admin/bulk-operations/approval', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('supabase_access_token')}`,
          },
        })
      ]);
      
      if (businessesRes.ok) {
        const businessData = await businessesRes.json();
        setBusinesses(businessData.businesses || []);
      }
      
      if (operationsRes.ok) {
        const operationsData = await operationsRes.json();
        setBulkOperations(operationsData.operations || []);
      }
    } catch (error) {
      console.error('Error fetching bulk management data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handle business selection
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedBusinesses(filteredBusinesses.map(b => b.id));
    } else {
      setSelectedBusinesses([]);
    }
  };

  const handleSelectBusiness = (businessId: string, checked: boolean) => {
    if (checked) {
      setSelectedBusinesses([...selectedBusinesses, businessId]);
    } else {
      setSelectedBusinesses(selectedBusinesses.filter(id => id !== businessId));
    }
  };

  // Execute bulk operation
  const executeBulkOperation = async (operation: Partial<BulkApprovalOperation>) => {
    setOperationInProgress(true);
    try {
      const response = await fetch('/api/admin/bulk-operations/approval/execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('supabase_access_token')}`,
        },
        body: JSON.stringify({
          ...operation,
          targetBusinesses: selectedBusinesses,
          stagedWorkflow: showStagedWorkflow ? stagedWorkflow : undefined
        }),
      });

      if (response.ok) {
        await fetchData();
        setSelectedBusinesses([]);
        setShowOperationBuilder(false);
        setShowStagedWorkflow(false);
      }
    } catch (error) {
      console.error('Error executing bulk operation:', error);
    } finally {
      setOperationInProgress(false);
    }
  };

  // Rollback operation
  const rollbackOperation = async (operationId: string) => {
    try {
      const response = await fetch(`/api/admin/bulk-operations/approval/${operationId}/rollback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('supabase_access_token')}`,
        },
      });

      if (response.ok) {
        await fetchData();
        setShowRollbackDialog(null);
      }
    } catch (error) {
      console.error('Error rolling back operation:', error);
    }
  };

  if (loading) {
    return (
      <div className={cn("space-y-6", className)}>
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center space-x-2">
            <RefreshCw className="h-5 w-5 animate-spin text-blue-500" />
            <span className="text-sm text-gray-600">Loading bulk business management...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Bulk Business Management</h1>
            <p className="text-gray-600">
              Mass business approval interface with safety checks, staged workflows, and comprehensive audit logging
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              onClick={fetchData}
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
            <Button 
              onClick={() => setShowOperationBuilder(true)}
              disabled={selectedBusinesses.length === 0}
              className="flex items-center gap-2"
            >
              <Zap className="h-4 w-4" />
              Create Operation ({selectedBusinesses.length})
            </Button>
          </div>
        </div>

        {/* Summary Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Businesses</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {businesses.length.toLocaleString()}
                  </p>
                </div>
                <Building2 className="h-8 w-8 text-blue-500" />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {filteredBusinesses.length.toLocaleString()} filtered
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Selected</p>
                  <p className="text-2xl font-bold text-green-600">
                    {selectedBusinesses.length.toLocaleString()}
                  </p>
                </div>
                <CheckSquare className="h-8 w-8 text-green-500" />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Ready for bulk operation
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {businesses.filter(b => b.approvalStatus === 'PENDING').length.toLocaleString()}
                  </p>
                </div>
                <Clock className="h-8 w-8 text-yellow-500" />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Awaiting review
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">High Quality</p>
                  <p className="text-2xl font-bold text-emerald-600">
                    {businesses.filter(b => b.qualityScore >= 80).length.toLocaleString()}
                  </p>
                </div>
                <Star className="h-8 w-8 text-emerald-500" />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Quality score ≥ 80
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Operations</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {bulkOperations.filter(op => op.status === 'RUNNING' || op.status === 'PAUSED').length}
                  </p>
                </div>
                <Activity className="h-8 w-8 text-orange-500" />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Currently processing
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="selection">Business Selection</TabsTrigger>
          <TabsTrigger value="operations">Active Operations</TabsTrigger>
          <TabsTrigger value="workflows">Staged Workflows</TabsTrigger>
          <TabsTrigger value="history">History & Audit</TabsTrigger>
        </TabsList>

        {/* Business Selection Tab */}
        <TabsContent value="selection" className="space-y-4">
          {/* Search and Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search businesses by name, owner, email, or location..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="PENDING">Pending</SelectItem>
                      <SelectItem value="APPROVED">Approved</SelectItem>
                      <SelectItem value="REJECTED">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={qualityFilter} onValueChange={setQualityFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Quality" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Quality</SelectItem>
                      <SelectItem value="high">High (80+)</SelectItem>
                      <SelectItem value="medium">Medium (60-79)</SelectItem>
                      <SelectItem value="low">Low (&lt;60)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <Select value={riskFilter} onValueChange={setRiskFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Risk Level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Risk Levels</SelectItem>
                      <SelectItem value="LOW">Low Risk</SelectItem>
                      <SelectItem value="MEDIUM">Medium Risk</SelectItem>
                      <SelectItem value="HIGH">High Risk</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={sourceFilter} onValueChange={setSourceFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Source" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Sources</SelectItem>
                      <SelectItem value="MANUAL">Manual</SelectItem>
                      <SelectItem value="CSV_IMPORT">CSV Import</SelectItem>
                      <SelectItem value="CLAIMED">Claimed</SelectItem>
                      <SelectItem value="AUTO_ENRICH">Auto Enriched</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" className="w-full">
                    <Filter className="h-4 w-4 mr-2" />
                    Advanced Filters
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Business Selection Table */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Business Selection ({filteredBusinesses.length} businesses)
                </CardTitle>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    checked={selectedBusinesses.length === filteredBusinesses.length && filteredBusinesses.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                  <Label className="text-sm">Select All</Label>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">Select</TableHead>
                      <TableHead>Business Name</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Quality Score</TableHead>
                      <TableHead>Risk Level</TableHead>
                      <TableHead>ABN Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredBusinesses.slice(0, 50).map((business) => (
                      <TableRow key={business.id}>
                        <TableCell>
                          <Checkbox
                            checked={selectedBusinesses.includes(business.id)}
                            onCheckedChange={(checked) => handleSelectBusiness(business.id, !!checked)}
                          />
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{business.name}</p>
                            <p className="text-sm text-gray-500">{business.category}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="text-sm">{business.suburb}</p>
                            <p className="text-xs text-gray-500">{business.postcode}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={
                              business.approvalStatus === 'APPROVED' ? 'default' :
                              business.approvalStatus === 'PENDING' ? 'secondary' : 
                              'destructive'
                            }
                          >
                            {business.approvalStatus}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <div className="w-12 bg-gray-200 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full ${
                                  business.qualityScore >= 80 ? 'bg-green-500' :
                                  business.qualityScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                                }`}
                                style={{ width: `${business.qualityScore}%` }}
                              />
                            </div>
                            <span className="text-sm font-medium">{business.qualityScore}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant="outline"
                            className={
                              business.riskLevel === 'HIGH' ? 'border-red-300 text-red-600' :
                              business.riskLevel === 'MEDIUM' ? 'border-yellow-300 text-yellow-600' :
                              'border-green-300 text-green-600'
                            }
                          >
                            {business.riskLevel}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={business.abnStatus === 'VERIFIED' ? 'default' : 'secondary'}
                          >
                            {business.abnStatus}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit Business
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem>
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Quick Approve
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <XCircle className="h-4 w-4 mr-2" />
                                Quick Reject
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {filteredBusinesses.length > 50 && (
                  <div className="text-center py-4">
                    <Button variant="outline">
                      Load More ({filteredBusinesses.length - 50} remaining)
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Active Operations Tab */}
        <TabsContent value="operations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Active Bulk Operations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {bulkOperations.filter(op => ['RUNNING', 'PAUSED', 'READY'].includes(op.status)).map((operation) => (
                  <div key={operation.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <Badge 
                          variant={
                            operation.status === 'RUNNING' ? 'default' :
                            operation.status === 'PAUSED' ? 'secondary' :
                            operation.status === 'READY' ? 'outline' : 'destructive'
                          }
                        >
                          {operation.status}
                        </Badge>
                        <div>
                          <h4 className="font-semibold">{operation.name}</h4>
                          <p className="text-sm text-gray-600">{operation.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {operation.status === 'RUNNING' && (
                          <Button size="sm" variant="outline">
                            <Pause className="h-4 w-4" />
                          </Button>
                        )}
                        {operation.status === 'PAUSED' && (
                          <Button size="sm" variant="outline">
                            <Play className="h-4 w-4" />
                          </Button>
                        )}
                        {operation.rollbackInfo?.available && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => setShowRollbackDialog(operation.id)}
                          >
                            <RotateCcw className="h-4 w-4" />
                          </Button>
                        )}
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    {/* Progress metrics */}
                    <div className="grid grid-cols-4 gap-4 mb-3">
                      <div className="text-center">
                        <p className="text-lg font-bold">{operation.targetCount}</p>
                        <p className="text-xs text-gray-500">Target</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-bold">{operation.processedCount}</p>
                        <p className="text-xs text-gray-500">Processed</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-bold text-green-600">{operation.successCount}</p>
                        <p className="text-xs text-gray-500">Success</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-bold text-red-600">{operation.failedCount}</p>
                        <p className="text-xs text-gray-500">Failed</p>
                      </div>
                    </div>
                    
                    {/* Progress bar */}
                    {operation.status === 'RUNNING' && (
                      <div className="mb-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm text-gray-600">Progress</span>
                          <span className="text-sm text-gray-600">
                            {operation.targetCount > 0 ? 
                              ((operation.processedCount / operation.targetCount) * 100).toFixed(1) : 0}%
                          </span>
                        </div>
                        <Progress 
                          value={operation.targetCount > 0 ? 
                            (operation.processedCount / operation.targetCount) * 100 : 0} 
                          className="h-2" 
                        />
                      </div>
                    )}
                    
                    {/* Workflow stages */}
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-gray-700">Workflow Progress:</p>
                      <div className="flex items-center space-x-2 text-sm">
                        {operation.workflow.map((stage, index) => (
                          <div key={stage.id} className="flex items-center space-x-1">
                            <div className={`w-3 h-3 rounded-full ${
                              stage.status === 'COMPLETED' ? 'bg-green-500' :
                              stage.status === 'RUNNING' ? 'bg-blue-500 animate-pulse' :
                              stage.status === 'FAILED' ? 'bg-red-500' :
                              'bg-gray-300'
                            }`} />
                            <span className="text-xs">{stage.name}</span>
                            {index < operation.workflow.length - 1 && (
                              <ChevronRight className="h-3 w-3 text-gray-400" />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
                
                {bulkOperations.filter(op => ['RUNNING', 'PAUSED', 'READY'].includes(op.status)).length === 0 && (
                  <div className="text-center py-8">
                    <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No active bulk operations</p>
                    <p className="text-sm text-gray-400">Create a new operation to get started</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Additional tabs would continue here... */}
        <TabsContent value="workflows">
          <div className="text-center py-8">
            <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Staged Workflows</p>
            <p className="text-sm text-gray-400">Configure multi-stage approval processes with checkpoints</p>
          </div>
        </TabsContent>

        <TabsContent value="history">
          <div className="text-center py-8">
            <History className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">History & Audit Trail</p>
            <p className="text-sm text-gray-400">View completed operations and audit logs</p>
          </div>
        </TabsContent>
      </Tabs>

      {/* Operation Builder Dialog would be added here */}
      {/* Rollback Confirmation Dialog would be added here */}
      
    </div>
  );
}