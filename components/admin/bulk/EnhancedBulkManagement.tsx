"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { 
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Users,
  Building2,
  Target,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  Play,
  Pause,
  Square,
  RotateCcw,
  Filter,
  Download,
  Upload,
  RefreshCw,
  ExternalLink,
  ArrowUp,
  ArrowDown,
  ChevronDown,
  ChevronRight,
  Search,
  Edit,
  Eye,
  Trash2,
  MoreHorizontal,
  Settings,
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
  Database,
  Layers,
  GitBranch,
  Timer,
  Gauge,
  BarChart3,
  TrendingUp,
  AlertCircle,
  Info,
  CheckSquare,
  Square as SquareIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Data Interfaces
interface BusinessRecord {
  id: string;
  businessName: string;
  ownerName: string;
  email: string;
  phone: string;
  address: string;
  suburb: string;
  state: string;
  postcode: string;
  businessType: string;
  industry: string;
  status: 'pending' | 'approved' | 'rejected' | 'under_review' | 'suspended';
  submissionDate: string;
  lastUpdated: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  riskLevel: 'low' | 'medium' | 'high';
  completeness: number;
  verificationScore: number;
  tags: string[];
  assignedTo?: string;
  notes?: string[];
  attachments?: string[];
  previousActions?: {
    action: string;
    user: string;
    timestamp: string;
    reason?: string;
  }[];
}

interface BulkOperation {
  id: string;
  name: string;
  description: string;
  type: 'approve' | 'reject' | 'suspend' | 'archive' | 'assign' | 'tag' | 'export' | 'notify';
  status: 'draft' | 'ready' | 'running' | 'completed' | 'failed' | 'cancelled';
  createdBy: string;
  createdAt: string;
  scheduledFor?: string;
  targetCount: number;
  processedCount: number;
  successCount: number;
  failedCount: number;
  criteria: {
    field: string;
    operator: 'equals' | 'contains' | 'starts_with' | 'ends_with' | 'greater_than' | 'less_than' | 'in' | 'not_in';
    value: string | string[] | number;
  }[];
  workflow: {
    stage: string;
    action: string;
    condition?: string;
    delay?: number;
    approvalRequired?: boolean;
  }[];
  safetyChecks: {
    maxRecords: number;
    requireApproval: boolean;
    confirmationRequired: boolean;
    backupRequired: boolean;
    rollbackEnabled: boolean;
  };
  auditLog: {
    timestamp: string;
    user: string;
    action: string;
    details: string;
    metadata?: Record<string, any>;
  }[];
}

interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  category: 'approval' | 'maintenance' | 'compliance' | 'communication';
  stages: {
    id: string;
    name: string;
    type: 'action' | 'condition' | 'approval' | 'notification';
    config: Record<string, any>;
    dependencies?: string[];
  }[];
  estimatedDuration: number;
  riskLevel: 'low' | 'medium' | 'high';
  usageCount: number;
}

interface FilterCriteria {
  field: string;
  label: string;
  type: 'text' | 'select' | 'number' | 'date' | 'boolean';
  options?: { value: string; label: string }[];
  operators: string[];
}

interface EnhancedBulkManagementProps {
  className?: string;
}

const BULK_OPERATION_TYPES = [
  { value: 'approve', label: 'Approve Businesses', icon: CheckCircle, color: 'text-green-600' },
  { value: 'reject', label: 'Reject Applications', icon: XCircle, color: 'text-red-600' },
  { value: 'suspend', label: 'Suspend Accounts', icon: AlertTriangle, color: 'text-yellow-600' },
  { value: 'archive', label: 'Archive Records', icon: Database, color: 'text-gray-600' },
  { value: 'assign', label: 'Assign to Staff', icon: Users, color: 'text-blue-600' },
  { value: 'tag', label: 'Add Tags/Labels', icon: Target, color: 'text-purple-600' },
  { value: 'export', label: 'Export Data', icon: Download, color: 'text-indigo-600' },
  { value: 'notify', label: 'Send Notifications', icon: Mail, color: 'text-orange-600' }
];

const WORKFLOW_STAGE_TYPES = [
  { value: 'action', label: 'Execute Action', icon: Zap },
  { value: 'condition', label: 'Check Condition', icon: GitBranch },
  { value: 'approval', label: 'Require Approval', icon: Shield },
  { value: 'notification', label: 'Send Notification', icon: Mail }
];

const RISK_LEVELS = {
  low: { color: 'text-green-600 bg-green-50', label: 'Low Risk' },
  medium: { color: 'text-yellow-600 bg-yellow-50', label: 'Medium Risk' },
  high: { color: 'text-red-600 bg-red-50', label: 'High Risk' }
};

const STATUS_CONFIG = {
  pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  approved: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
  rejected: { color: 'bg-red-100 text-red-800', icon: XCircle },
  under_review: { color: 'bg-blue-100 text-blue-800', icon: Eye },
  suspended: { color: 'bg-orange-100 text-orange-800', icon: AlertTriangle }
};

const OPERATION_STATUS_CONFIG = {
  draft: { color: 'bg-gray-100 text-gray-800', icon: Edit },
  ready: { color: 'bg-blue-100 text-blue-800', icon: CheckSquare },
  running: { color: 'bg-yellow-100 text-yellow-800', icon: Play },
  completed: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
  failed: { color: 'bg-red-100 text-red-800', icon: XCircle },
  cancelled: { color: 'bg-gray-100 text-gray-800', icon: Square }
};

export default function EnhancedBulkManagement({ className }: EnhancedBulkManagementProps) {
  // State Management
  const [businesses, setBusinesses] = useState<BusinessRecord[]>([]);
  const [bulkOperations, setBulkOperations] = useState<BulkOperation[]>([]);
  const [workflowTemplates, setWorkflowTemplates] = useState<WorkflowTemplate[]>([]);
  const [selectedRecords, setSelectedRecords] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [operationInProgress, setOperationInProgress] = useState(false);

  // UI State
  const [activeTab, setActiveTab] = useState('records');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [showFilters, setShowFilters] = useState(false);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [showOperationBuilder, setShowOperationBuilder] = useState(false);

  // Filter and Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [industryFilter, setIndustryFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [advancedFilters, setAdvancedFilters] = useState<{
    field: string;
    operator: string;
    value: string;
  }[]>([]);

  // Operation Builder State
  const [newOperation, setNewOperation] = useState<Partial<BulkOperation>>({
    name: '',
    description: '',
    type: 'approve',
    criteria: [],
    workflow: [],
    safetyChecks: {
      maxRecords: 1000,
      requireApproval: true,
      confirmationRequired: true,
      backupRequired: true,
      rollbackEnabled: true
    }
  });

  // Available filter criteria
  const filterCriteria: FilterCriteria[] = [
    {
      field: 'status',
      label: 'Status',
      type: 'select',
      options: [
        { value: 'pending', label: 'Pending' },
        { value: 'approved', label: 'Approved' },
        { value: 'rejected', label: 'Rejected' },
        { value: 'under_review', label: 'Under Review' },
        { value: 'suspended', label: 'Suspended' }
      ],
      operators: ['equals', 'not_in']
    },
    {
      field: 'priority',
      label: 'Priority',
      type: 'select',
      options: [
        { value: 'low', label: 'Low' },
        { value: 'medium', label: 'Medium' },
        { value: 'high', label: 'High' },
        { value: 'urgent', label: 'Urgent' }
      ],
      operators: ['equals', 'in']
    },
    {
      field: 'businessType',
      label: 'Business Type',
      type: 'text',
      operators: ['equals', 'contains']
    },
    {
      field: 'completeness',
      label: 'Completeness %',
      type: 'number',
      operators: ['greater_than', 'less_than']
    },
    {
      field: 'submissionDate',
      label: 'Submission Date',
      type: 'date',
      operators: ['greater_than', 'less_than']
    }
  ];

  // Fetch data
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [businessesRes, operationsRes, templatesRes] = await Promise.all([
        fetch('/api/admin/businesses/bulk', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('supabase_access_token')}`,
          },
        }),
        fetch('/api/admin/bulk-operations', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('supabase_access_token')}`,
          },
        }),
        fetch('/api/admin/workflow-templates', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('supabase_access_token')}`,
          },
        })
      ]);

      if (businessesRes.ok) {
        const businessesData = await businessesRes.json();
        setBusinesses(businessesData.businesses || []);
      }

      if (operationsRes.ok) {
        const operationsData = await operationsRes.json();
        setBulkOperations(operationsData.operations || []);
      }

      if (templatesRes.ok) {
        const templatesData = await templatesRes.json();
        setWorkflowTemplates(templatesData.templates || []);
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

  // Helper Functions
  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat().format(num);
  };

  const formatDate = (date: string): string => {
    return new Date(date).toLocaleDateString('en-AU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatDateTime = (date: string): string => {
    return new Date(date).toLocaleString('en-AU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Filter businesses based on current filters
  const filteredBusinesses = useMemo(() => {
    let filtered = businesses;

    // Search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(business => 
        business.businessName.toLowerCase().includes(query) ||
        business.ownerName.toLowerCase().includes(query) ||
        business.email.toLowerCase().includes(query) ||
        business.suburb.toLowerCase().includes(query)
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(business => business.status === statusFilter);
    }

    // Priority filter
    if (priorityFilter !== 'all') {
      filtered = filtered.filter(business => business.priority === priorityFilter);
    }

    // Industry filter
    if (industryFilter !== 'all') {
      filtered = filtered.filter(business => business.industry === industryFilter);
    }

    // Advanced filters
    advancedFilters.forEach(filter => {
      if (!filter.field || !filter.operator || !filter.value) return;

      filtered = filtered.filter(business => {
        const fieldValue = business[filter.field as keyof BusinessRecord];
        
        switch (filter.operator) {
          case 'equals':
            return fieldValue === filter.value;
          case 'contains':
            return String(fieldValue).toLowerCase().includes(filter.value.toLowerCase());
          case 'greater_than':
            return Number(fieldValue) > Number(filter.value);
          case 'less_than':
            return Number(fieldValue) < Number(filter.value);
          default:
            return true;
        }
      });
    });

    return filtered;
  }, [businesses, searchQuery, statusFilter, priorityFilter, industryFilter, advancedFilters]);

  // Handle record selection
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRecords(filteredBusinesses.map(b => b.id));
    } else {
      setSelectedRecords([]);
    }
  };

  const handleSelectRecord = (recordId: string, checked: boolean) => {
    if (checked) {
      setSelectedRecords([...selectedRecords, recordId]);
    } else {
      setSelectedRecords(selectedRecords.filter(id => id !== recordId));
    }
  };

  // Execute bulk operation
  const executeBulkOperation = async (operation: Partial<BulkOperation>) => {
    setOperationInProgress(true);
    try {
      const response = await fetch('/api/admin/bulk-operations/execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('supabase_access_token')}`,
        },
        body: JSON.stringify({
          ...operation,
          targetRecords: selectedRecords
        }),
      });

      if (response.ok) {
        await fetchData();
        setSelectedRecords([]);
        setShowOperationBuilder(false);
      } else {
        console.error('Failed to execute bulk operation');
      }
    } catch (error) {
      console.error('Error executing bulk operation:', error);
    } finally {
      setOperationInProgress(false);
    }
  };

  if (loading) {
    return (
      <div className={cn("space-y-6", className)}>
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center space-x-2">
            <RefreshCw className="h-5 w-5 animate-spin text-blue-500" />
            <span className="text-sm text-gray-600">Loading bulk management...</span>
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
            <h1 className="text-3xl font-bold text-gray-900">Enhanced Bulk Management</h1>
            <p className="text-gray-600">
              Advanced bulk operations with safety checks, workflow automation, and comprehensive audit logging
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
              className="flex items-center gap-2"
            >
              <Zap className="h-4 w-4" />
              New Operation
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Records</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {formatNumber(businesses.length)}
                  </p>
                </div>
                <Database className="h-8 w-8 text-blue-500" />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {formatNumber(filteredBusinesses.length)} filtered
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Selected</p>
                  <p className="text-2xl font-bold text-green-600">
                    {formatNumber(selectedRecords.length)}
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
                  <p className="text-sm font-medium text-gray-600">Active Operations</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {bulkOperations.filter(op => op.status === 'running').length}
                  </p>
                </div>
                <Activity className="h-8 w-8 text-orange-500" />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Currently processing
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending Approval</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {businesses.filter(b => b.status === 'pending').length}
                  </p>
                </div>
                <Clock className="h-8 w-8 text-purple-500" />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Awaiting review
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="records">Business Records</TabsTrigger>
            <TabsTrigger value="operations">Bulk Operations</TabsTrigger>
            <TabsTrigger value="workflows">Workflow Templates</TabsTrigger>
            <TabsTrigger value="audit">Audit Log</TabsTrigger>
          </TabsList>

          {activeTab === 'records' && (
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2"
              >
                <Filter className="h-4 w-4" />
                Filters
              </Button>
              {selectedRecords.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowBulkActions(!showBulkActions)}
                  className="flex items-center gap-2"
                >
                  <Target className="h-4 w-4" />
                  Bulk Actions ({selectedRecords.length})
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Business Records Tab */}
        <TabsContent value="records" className="space-y-4">
          {/* Search and Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search businesses, owners, emails, or locations..."
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
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                    <SelectItem value="under_review">Under Review</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {showFilters && (
                <Collapsible>
                  <CollapsibleContent className="pt-4 border-t mt-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label>Priority</Label>
                        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                          <SelectTrigger>
                            <SelectValue placeholder="All Priorities" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Priorities</SelectItem>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                            <SelectItem value="urgent">Urgent</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Industry</Label>
                        <Select value={industryFilter} onValueChange={setIndustryFilter}>
                          <SelectTrigger>
                            <SelectValue placeholder="All Industries" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Industries</SelectItem>
                            <SelectItem value="retail">Retail</SelectItem>
                            <SelectItem value="food">Food & Beverage</SelectItem>
                            <SelectItem value="professional">Professional Services</SelectItem>
                            <SelectItem value="health">Health & Wellness</SelectItem>
                            <SelectItem value="automotive">Automotive</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Date Range</Label>
                        <Select value={dateFilter} onValueChange={setDateFilter}>
                          <SelectTrigger>
                            <SelectValue placeholder="All Dates" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Dates</SelectItem>
                            <SelectItem value="today">Today</SelectItem>
                            <SelectItem value="week">This Week</SelectItem>
                            <SelectItem value="month">This Month</SelectItem>
                            <SelectItem value="quarter">This Quarter</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Advanced Filters */}
                    <div className="mt-4 pt-4 border-t">
                      <div className="flex items-center justify-between mb-3">
                        <Label className="text-sm font-medium">Advanced Filters</Label>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setAdvancedFilters([...advancedFilters, { field: '', operator: '', value: '' }])}
                        >
                          Add Filter
                        </Button>
                      </div>
                      <div className="space-y-2">
                        {advancedFilters.map((filter, index) => (
                          <div key={index} className="grid grid-cols-4 gap-2">
                            <Select 
                              value={filter.field} 
                              onValueChange={(value) => {
                                const updated = [...advancedFilters];
                                updated[index].field = value;
                                setAdvancedFilters(updated);
                              }}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Field" />
                              </SelectTrigger>
                              <SelectContent>
                                {filterCriteria.map(criteria => (
                                  <SelectItem key={criteria.field} value={criteria.field}>
                                    {criteria.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <Select 
                              value={filter.operator}
                              onValueChange={(value) => {
                                const updated = [...advancedFilters];
                                updated[index].operator = value;
                                setAdvancedFilters(updated);
                              }}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Operator" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="equals">Equals</SelectItem>
                                <SelectItem value="contains">Contains</SelectItem>
                                <SelectItem value="greater_than">Greater Than</SelectItem>
                                <SelectItem value="less_than">Less Than</SelectItem>
                              </SelectContent>
                            </Select>
                            <Input
                              placeholder="Value"
                              value={filter.value}
                              onChange={(e) => {
                                const updated = [...advancedFilters];
                                updated[index].value = e.target.value;
                                setAdvancedFilters(updated);
                              }}
                            />
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const updated = advancedFilters.filter((_, i) => i !== index);
                                setAdvancedFilters(updated);
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              )}
            </CardContent>
          </Card>

          {/* Bulk Actions Panel */}
          {showBulkActions && selectedRecords.length > 0 && (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Badge variant="outline" className="px-3 py-1">
                      {selectedRecords.length} records selected
                    </Badge>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline" className="text-green-600">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Approve
                      </Button>
                      <Button size="sm" variant="outline" className="text-red-600">
                        <XCircle className="h-4 w-4 mr-1" />
                        Reject
                      </Button>
                      <Button size="sm" variant="outline" className="text-blue-600">
                        <Users className="h-4 w-4 mr-1" />
                        Assign
                      </Button>
                      <Button size="sm" variant="outline" className="text-purple-600">
                        <Target className="h-4 w-4 mr-1" />
                        Tag
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button 
                      size="sm" 
                      onClick={() => setShowOperationBuilder(true)}
                      className="flex items-center gap-1"
                    >
                      <Settings className="h-4 w-4" />
                      Custom Operation
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => setShowBulkActions(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Business Records Table */}
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <Checkbox
                          checked={selectedRecords.length === filteredBusinesses.length && filteredBusinesses.length > 0}
                          indeterminate={selectedRecords.length > 0 && selectedRecords.length < filteredBusinesses.length}
                          onCheckedChange={handleSelectAll}
                        />
                      </TableHead>
                      <TableHead>Business</TableHead>
                      <TableHead>Owner</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Completeness</TableHead>
                      <TableHead>Submitted</TableHead>
                      <TableHead className="w-24">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredBusinesses.map((business) => {
                      const StatusIcon = STATUS_CONFIG[business.status].icon;
                      return (
                        <TableRow key={business.id}>
                          <TableCell>
                            <Checkbox
                              checked={selectedRecords.includes(business.id)}
                              onCheckedChange={(checked) => handleSelectRecord(business.id, checked as boolean)}
                            />
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">{business.businessName}</p>
                              <p className="text-sm text-gray-500">{business.businessType}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">{business.ownerName}</p>
                              <p className="text-sm text-gray-500">{business.email}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="text-sm">{business.suburb}, {business.state}</p>
                              <p className="text-xs text-gray-500">{business.postcode}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={STATUS_CONFIG[business.status].color}>
                              <StatusIcon className="h-3 w-3 mr-1" />
                              {business.status.replace('_', ' ')}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant={
                                business.priority === 'urgent' ? 'destructive' :
                                business.priority === 'high' ? 'default' : 'secondary'
                              }
                            >
                              {business.priority}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Progress value={business.completeness} className="w-16 h-2" />
                              <span className="text-sm text-gray-600">
                                {business.completeness}%
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <p>{formatDate(business.submissionDate)}</p>
                              <p className="text-xs text-gray-500">
                                {formatDate(business.lastUpdated)}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent>
                                <DropdownMenuItem>
                                  <Eye className="h-4 w-4 mr-2" />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit Business
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-green-600">
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Approve
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-red-600">
                                  <XCircle className="h-4 w-4 mr-2" />
                                  Reject
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Bulk Operations Tab */}
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
                {bulkOperations.map((operation) => {
                  const StatusIcon = OPERATION_STATUS_CONFIG[operation.status].icon;
                  const progress = operation.targetCount > 0 ? 
                    (operation.processedCount / operation.targetCount) * 100 : 0;

                  return (
                    <div key={operation.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <Badge className={OPERATION_STATUS_CONFIG[operation.status].color}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {operation.status}
                          </Badge>
                          <div>
                            <h4 className="font-semibold">{operation.name}</h4>
                            <p className="text-sm text-gray-600">{operation.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {operation.status === 'running' && (
                            <Button size="sm" variant="outline">
                              <Pause className="h-4 w-4" />
                            </Button>
                          )}
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

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

                      {operation.status === 'running' && (
                        <div className="mb-3">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm text-gray-600">Progress</span>
                            <span className="text-sm text-gray-600">{progress.toFixed(1)}%</span>
                          </div>
                          <Progress value={progress} className="h-2" />
                        </div>
                      )}

                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <span>Created by {operation.createdBy}</span>
                        <span>{formatDateTime(operation.createdAt)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Workflow Templates Tab */}
        <TabsContent value="workflows" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Layers className="h-5 w-5" />
                  Workflow Templates
                </CardTitle>
                <Button className="flex items-center gap-2">
                  <GitBranch className="h-4 w-4" />
                  Create Template
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {workflowTemplates.map((template) => (
                  <div key={template.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-semibold">{template.name}</h4>
                        <p className="text-sm text-gray-600">{template.description}</p>
                      </div>
                      <Badge 
                        className={RISK_LEVELS[template.riskLevel].color}
                      >
                        {RISK_LEVELS[template.riskLevel].label}
                      </Badge>
                    </div>

                    <div className="space-y-2 mb-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Stages:</span>
                        <span className="font-medium">{template.stages.length}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Est. Duration:</span>
                        <span className="font-medium">{template.estimatedDuration}min</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Usage:</span>
                        <span className="font-medium">{template.usageCount} times</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Button size="sm" variant="outline" className="flex-1">
                        <Eye className="h-4 w-4 mr-1" />
                        Preview
                      </Button>
                      <Button size="sm" className="flex-1">
                        <Play className="h-4 w-4 mr-1" />
                        Use Template
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Audit Log Tab */}
        <TabsContent value="audit" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Audit Log
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {bulkOperations.flatMap(op => op.auditLog || []).slice(0, 20).map((entry, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 border rounded-lg">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-sm">{entry.action}</p>
                        <span className="text-xs text-gray-500">{formatDateTime(entry.timestamp)}</span>
                      </div>
                      <p className="text-sm text-gray-600">{entry.details}</p>
                      <p className="text-xs text-gray-500 mt-1">by {entry.user}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Operation Builder Dialog */}
      <Dialog open={showOperationBuilder} onOpenChange={setShowOperationBuilder}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Bulk Operation</DialogTitle>
            <DialogDescription>
              Configure a new bulk operation with safety checks and workflow automation
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Basic Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Operation Name</Label>
                  <Input
                    value={newOperation.name}
                    onChange={(e) => setNewOperation({ ...newOperation, name: e.target.value })}
                    placeholder="Enter operation name"
                  />
                </div>
                <div>
                  <Label>Operation Type</Label>
                  <Select 
                    value={newOperation.type} 
                    onValueChange={(value) => setNewOperation({ ...newOperation, type: value as any })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select operation type" />
                    </SelectTrigger>
                    <SelectContent>
                      {BULK_OPERATION_TYPES.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          <div className="flex items-center space-x-2">
                            <type.icon className={cn("h-4 w-4", type.color)} />
                            <span>{type.label}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>Description</Label>
                <Textarea
                  value={newOperation.description}
                  onChange={(e) => setNewOperation({ ...newOperation, description: e.target.value })}
                  placeholder="Describe what this operation will do"
                />
              </div>
            </div>

            {/* Safety Checks */}
            <div className="space-y-4 border-t pt-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Safety Checks
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Require Approval</Label>
                    <Switch
                      checked={newOperation.safetyChecks?.requireApproval}
                      onCheckedChange={(checked) => setNewOperation({
                        ...newOperation,
                        safetyChecks: { ...newOperation.safetyChecks!, requireApproval: checked }
                      })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Confirmation Required</Label>
                    <Switch
                      checked={newOperation.safetyChecks?.confirmationRequired}
                      onCheckedChange={(checked) => setNewOperation({
                        ...newOperation,
                        safetyChecks: { ...newOperation.safetyChecks!, confirmationRequired: checked }
                      })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Backup Required</Label>
                    <Switch
                      checked={newOperation.safetyChecks?.backupRequired}
                      onCheckedChange={(checked) => setNewOperation({
                        ...newOperation,
                        safetyChecks: { ...newOperation.safetyChecks!, backupRequired: checked }
                      })}
                    />
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Rollback Enabled</Label>
                    <Switch
                      checked={newOperation.safetyChecks?.rollbackEnabled}
                      onCheckedChange={(checked) => setNewOperation({
                        ...newOperation,
                        safetyChecks: { ...newOperation.safetyChecks!, rollbackEnabled: checked }
                      })}
                    />
                  </div>
                  <div>
                    <Label>Max Records</Label>
                    <Input
                      type="number"
                      value={newOperation.safetyChecks?.maxRecords}
                      onChange={(e) => setNewOperation({
                        ...newOperation,
                        safetyChecks: { ...newOperation.safetyChecks!, maxRecords: parseInt(e.target.value) }
                      })}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowOperationBuilder(false)}>
              Cancel
            </Button>
            <Button 
              onClick={() => executeBulkOperation(newOperation)}
              disabled={operationInProgress}
            >
              {operationInProgress ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4 mr-2" />
                  Create Operation
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}