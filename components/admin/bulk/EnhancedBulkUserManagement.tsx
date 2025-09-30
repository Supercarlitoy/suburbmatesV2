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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuCheckboxItem,
} from '@/components/ui/dropdown-menu';
import { 
  Users,
  UserPlus,
  UserMinus,
  UserCheck,
  UserX,
  Mail,
  MessageSquare,
  Download,
  Upload,
  Filter,
  Search,
  Eye,
  Edit,
  MoreHorizontal,
  Shield,
  Crown,
  User,
  Activity,
  Clock,
  Calendar,
  MapPin,
  Phone,
  Globe,
  Star,
  Award,
  Zap,
  Target,
  ChevronDown,
  ChevronRight,
  Info,
  RefreshCw,
  Database,
  Settings,
  CheckSquare,
  History,
  TrendingUp,
  Send,
  Ban,
  Unlock,
  Lock,
  Trash2,
  FileText,
  PieChart,
  BarChart3,
  AlertTriangle,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Enhanced interfaces for Task #7 Phase 2
interface UserRecord {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  fullName: string;
  role: 'ADMIN' | 'BUSINESS_OWNER' | 'CUSTOMER' | 'MODERATOR' | 'SUPPORT';
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'PENDING_VERIFICATION' | 'BANNED';
  accountType: 'PERSONAL' | 'BUSINESS' | 'PREMIUM' | 'ENTERPRISE';
  createdAt: string;
  lastLogin?: string;
  lastActivity?: string;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  profileCompleteness: number;
  engagementScore: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  
  // Business associations
  ownedBusinesses: number;
  claimedBusinesses: number;
  
  // Activity metrics
  loginCount: number;
  inquiriesSent: number;
  reviewsPosted: number;
  
  // Location data
  suburb?: string;
  state?: string;
  country: string;
  
  // Subscription and billing
  subscriptionStatus?: 'ACTIVE' | 'CANCELLED' | 'EXPIRED' | 'TRIAL';
  subscriptionTier?: string;
  billingStatus?: 'CURRENT' | 'OVERDUE' | 'FAILED';
  
  // Communication preferences
  emailNotifications: boolean;
  smsNotifications: boolean;
  marketingOptIn: boolean;
  
  // Lifecycle stage
  lifecycleStage: 'NEW_USER' | 'ACTIVE_USER' | 'ENGAGED_USER' | 'AT_RISK' | 'CHURNED' | 'REACTIVATED';
  
  // Tags and segments
  tags?: string[];
  segments?: string[];
  
  // Security flags
  requiresPasswordReset: boolean;
  isSuspicious: boolean;
  lastSecurityCheck?: string;
}

interface BulkUserOperation {
  id: string;
  name: string;
  description: string;
  status: 'DRAFT' | 'READY' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'CANCELLED' | 'PAUSED';
  type: 'ROLE_ASSIGNMENT' | 'ACCOUNT_STATUS' | 'COMMUNICATION' | 'EXPORT' | 'LIFECYCLE_UPDATE' | 'SEGMENTATION';
  createdBy: string;
  createdAt: string;
  scheduledFor?: string;
  startedAt?: string;
  completedAt?: string;
  
  // Target users
  targetCount: number;
  processedCount: number;
  successCount: number;
  failedCount: number;
  skippedCount: number;
  
  // Operation details
  operationConfig: {
    roleChanges?: {
      newRole: UserRecord['role'];
      reason: string;
      notifyUsers: boolean;
    };
    statusChanges?: {
      newStatus: UserRecord['status'];
      reason: string;
      suspensionDuration?: string;
      notifyUsers: boolean;
    };
    communicationConfig?: {
      type: 'EMAIL' | 'SMS' | 'IN_APP' | 'PUSH';
      template: string;
      subject?: string;
      message: string;
      scheduledFor?: string;
    };
    exportConfig?: {
      format: 'CSV' | 'JSON' | 'EXCEL';
      fields: string[];
      includeMetadata: boolean;
    };
    lifecycleConfig?: {
      newStage: UserRecord['lifecycleStage'];
      triggerActions: string[];
      automatedFollowUp: boolean;
    };
    segmentationConfig?: {
      segments: string[];
      operation: 'ADD' | 'REMOVE' | 'REPLACE';
      criteria: any[];
    };
  };
  
  // Safety and audit
  safetyChecks: {
    maxUsers: number;
    requireApproval: boolean;
    confirmationRequired: boolean;
    rollbackEnabled: boolean;
    checkpointFrequency: number;
  };
  
  // Results and metrics
  results?: {
    successfulOperations: string[];
    failedOperations: string[];
    warnings: string[];
    metrics: Record<string, number>;
  };
  
  auditLog: {
    timestamp: string;
    user: string;
    action: string;
    userId?: string;
    userName?: string;
    details: string;
    metadata?: Record<string, any>;
  }[];
}

interface UserSegment {
  id: string;
  name: string;
  description: string;
  criteria: {
    field: string;
    operator: string;
    value: any;
  }[];
  userCount: number;
  createdAt: string;
  lastUpdated: string;
  isActive: boolean;
}

interface EnhancedBulkUserManagementProps {
  className?: string;
}

export default function EnhancedBulkUserManagement({ className }: EnhancedBulkUserManagementProps) {
  // State management
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [bulkOperations, setBulkOperations] = useState<BulkUserOperation[]>([]);
  const [userSegments, setUserSegments] = useState<UserSegment[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [operationInProgress, setOperationInProgress] = useState(false);
  
  // UI State
  const [activeTab, setActiveTab] = useState('users');
  const [showOperationBuilder, setShowOperationBuilder] = useState(false);
  const [showSegmentBuilder, setShowSegmentBuilder] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [showCommunicationDialog, setShowCommunicationDialog] = useState(false);
  
  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [accountTypeFilter, setAccountTypeFilter] = useState('all');
  const [lifecycleFilter, setLifecycleFilter] = useState('all');
  const [riskFilter, setRiskFilter] = useState('all');
  const [segmentFilter, setSegmentFilter] = useState('all');
  const [dateRangeFilter, setDateRangeFilter] = useState('all');
  
  // Operation builder state
  const [newOperation, setNewOperation] = useState<Partial<BulkUserOperation>>({
    name: '',
    description: '',
    type: 'ROLE_ASSIGNMENT',
    operationConfig: {},
    safetyChecks: {
      maxUsers: 500,
      requireApproval: true,
      confirmationRequired: true,
      rollbackEnabled: true,
      checkpointFrequency: 50
    }
  });

  // Filter users based on criteria
  const filteredUsers = useMemo(() => {
    let filtered = users;
    
    // Search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(user => 
        user.fullName.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query) ||
        user.suburb?.toLowerCase().includes(query) ||
        user.tags?.some(tag => tag.toLowerCase().includes(query))
      );
    }
    
    // Role filter
    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => user.role === roleFilter);
    }
    
    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(user => user.status === statusFilter);
    }
    
    // Account type filter
    if (accountTypeFilter !== 'all') {
      filtered = filtered.filter(user => user.accountType === accountTypeFilter);
    }
    
    // Lifecycle filter
    if (lifecycleFilter !== 'all') {
      filtered = filtered.filter(user => user.lifecycleStage === lifecycleFilter);
    }
    
    // Risk filter
    if (riskFilter !== 'all') {
      filtered = filtered.filter(user => user.riskLevel === riskFilter);
    }
    
    // Segment filter
    if (segmentFilter !== 'all') {
      filtered = filtered.filter(user => user.segments?.includes(segmentFilter));
    }
    
    // Date range filter
    if (dateRangeFilter !== 'all') {
      const now = new Date();
      const filterDate = new Date();
      
      switch (dateRangeFilter) {
        case 'last_week':
          filterDate.setDate(now.getDate() - 7);
          break;
        case 'last_month':
          filterDate.setMonth(now.getMonth() - 1);
          break;
        case 'last_3_months':
          filterDate.setMonth(now.getMonth() - 3);
          break;
        case 'last_year':
          filterDate.setFullYear(now.getFullYear() - 1);
          break;
      }
      
      if (dateRangeFilter !== 'all') {
        filtered = filtered.filter(user => new Date(user.createdAt) >= filterDate);
      }
    }
    
    return filtered;
  }, [users, searchQuery, roleFilter, statusFilter, accountTypeFilter, lifecycleFilter, riskFilter, segmentFilter, dateRangeFilter]);

  // Load data
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [usersRes, operationsRes, segmentsRes] = await Promise.all([
        fetch('/api/admin/users/bulk-management', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('supabase_access_token')}`,
          },
        }),
        fetch('/api/admin/bulk-operations/users', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('supabase_access_token')}`,
          },
        }),
        fetch('/api/admin/user-segments', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('supabase_access_token')}`,
          },
        })
      ]);
      
      if (usersRes.ok) {
        const userData = await usersRes.json();
        setUsers(userData.users || []);
      }
      
      if (operationsRes.ok) {
        const operationsData = await operationsRes.json();
        setBulkOperations(operationsData.operations || []);
      }
      
      if (segmentsRes.ok) {
        const segmentsData = await segmentsRes.json();
        setUserSegments(segmentsData.segments || []);
      }
    } catch (error) {
      console.error('Error fetching bulk user management data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handle user selection
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedUsers(filteredUsers.map(u => u.id));
    } else {
      setSelectedUsers([]);
    }
  };

  const handleSelectUser = (userId: string, checked: boolean) => {
    if (checked) {
      setSelectedUsers([...selectedUsers, userId]);
    } else {
      setSelectedUsers(selectedUsers.filter(id => id !== userId));
    }
  };

  // Execute bulk operation
  const executeBulkOperation = async (operation: Partial<BulkUserOperation>) => {
    setOperationInProgress(true);
    try {
      const response = await fetch('/api/admin/bulk-operations/users/execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('supabase_access_token')}`,
        },
        body: JSON.stringify({
          ...operation,
          targetUsers: selectedUsers
        }),
      });

      if (response.ok) {
        await fetchData();
        setSelectedUsers([]);
        setShowOperationBuilder(false);
        setShowCommunicationDialog(false);
      }
    } catch (error) {
      console.error('Error executing bulk user operation:', error);
    } finally {
      setOperationInProgress(false);
    }
  };

  // Quick actions
  const handleQuickRoleChange = async (newRole: UserRecord['role']) => {
    if (selectedUsers.length === 0) return;
    
    const operation: Partial<BulkUserOperation> = {
      name: `Change Role to ${newRole}`,
      description: `Bulk role assignment: ${selectedUsers.length} users to ${newRole}`,
      type: 'ROLE_ASSIGNMENT',
      operationConfig: {
        roleChanges: {
          newRole,
          reason: 'Bulk role assignment',
          notifyUsers: true
        }
      },
      safetyChecks: newOperation.safetyChecks!
    };
    
    await executeBulkOperation(operation);
  };

  const handleQuickStatusChange = async (newStatus: UserRecord['status']) => {
    if (selectedUsers.length === 0) return;
    
    const operation: Partial<BulkUserOperation> = {
      name: `Change Status to ${newStatus}`,
      description: `Bulk status update: ${selectedUsers.length} users to ${newStatus}`,
      type: 'ACCOUNT_STATUS',
      operationConfig: {
        statusChanges: {
          newStatus,
          reason: 'Bulk status update',
          notifyUsers: true
        }
      },
      safetyChecks: newOperation.safetyChecks!
    };
    
    await executeBulkOperation(operation);
  };

  // Export users
  const handleExportUsers = async (format: 'CSV' | 'JSON' | 'EXCEL', fields: string[]) => {
    const operation: Partial<BulkUserOperation> = {
      name: `Export Users (${format})`,
      description: `Export ${selectedUsers.length} users in ${format} format`,
      type: 'EXPORT',
      operationConfig: {
        exportConfig: {
          format,
          fields,
          includeMetadata: true
        }
      },
      safetyChecks: { ...newOperation.safetyChecks!, requireApproval: false }
    };
    
    await executeBulkOperation(operation);
    setShowExportDialog(false);
  };

  if (loading) {
    return (
      <div className={cn("space-y-6", className)}>
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center space-x-2">
            <RefreshCw className="h-5 w-5 animate-spin text-blue-500" />
            <span className="text-sm text-gray-600">Loading bulk user management...</span>
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
            <h1 className="text-3xl font-bold text-gray-900">Bulk User Management</h1>
            <p className="text-gray-600">
              Mass user operations including role assignment, account management, communication, and lifecycle management
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
              variant="outline"
              onClick={() => setShowSegmentBuilder(true)}
              className="flex items-center gap-2"
            >
              <Target className="h-4 w-4" />
              Create Segment
            </Button>
            <Button 
              onClick={() => setShowOperationBuilder(true)}
              disabled={selectedUsers.length === 0}
              className="flex items-center gap-2"
            >
              <Zap className="h-4 w-4" />
              Bulk Operation ({selectedUsers.length})
            </Button>
          </div>
        </div>

        {/* Summary Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Users</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {users.length.toLocaleString()}
                  </p>
                </div>
                <Users className="h-8 w-8 text-blue-500" />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {filteredUsers.length.toLocaleString()} filtered
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Selected</p>
                  <p className="text-2xl font-bold text-green-600">
                    {selectedUsers.length.toLocaleString()}
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
                  <p className="text-sm font-medium text-gray-600">Active Users</p>
                  <p className="text-2xl font-bold text-emerald-600">
                    {users.filter(u => u.status === 'ACTIVE').length.toLocaleString()}
                  </p>
                </div>
                <UserCheck className="h-8 w-8 text-emerald-500" />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Currently active
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Business Owners</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {users.filter(u => u.role === 'BUSINESS_OWNER').length.toLocaleString()}
                  </p>
                </div>
                <Crown className="h-8 w-8 text-purple-500" />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Business role
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">High Risk</p>
                  <p className="text-2xl font-bold text-red-600">
                    {users.filter(u => u.riskLevel === 'HIGH').length}
                  </p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-500" />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Require attention
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

      {/* Quick Actions Bar */}
      {selectedUsers.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <p className="text-sm font-medium">
                  {selectedUsers.length} user{selectedUsers.length === 1 ? '' : 's'} selected
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Crown className="h-4 w-4 mr-2" />
                      Change Role
                      <ChevronDown className="h-4 w-4 ml-2" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => handleQuickRoleChange('CUSTOMER')}>
                      <User className="h-4 w-4 mr-2" />
                      Customer
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleQuickRoleChange('BUSINESS_OWNER')}>
                      <Crown className="h-4 w-4 mr-2" />
                      Business Owner
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleQuickRoleChange('MODERATOR')}>
                      <Shield className="h-4 w-4 mr-2" />
                      Moderator
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleQuickRoleChange('ADMIN')}>
                      <Crown className="h-4 w-4 mr-2 text-red-500" />
                      Admin
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Activity className="h-4 w-4 mr-2" />
                      Change Status
                      <ChevronDown className="h-4 w-4 ml-2" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => handleQuickStatusChange('ACTIVE')}>
                      <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                      Activate
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleQuickStatusChange('INACTIVE')}>
                      <XCircle className="h-4 w-4 mr-2 text-gray-500" />
                      Deactivate
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleQuickStatusChange('SUSPENDED')}>
                      <Ban className="h-4 w-4 mr-2 text-orange-500" />
                      Suspend
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleQuickStatusChange('BANNED')}>
                      <XCircle className="h-4 w-4 mr-2 text-red-500" />
                      Ban
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowCommunicationDialog(true)}
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Send Message
                </Button>

                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowExportDialog(true)}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="users">User Management</TabsTrigger>
          <TabsTrigger value="operations">Active Operations</TabsTrigger>
          <TabsTrigger value="segments">User Segments</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="lifecycle">Lifecycle</TabsTrigger>
        </TabsList>

        {/* User Management Tab */}
        <TabsContent value="users" className="space-y-4">
          {/* Search and Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search users by name, email, or location..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <Select value={roleFilter} onValueChange={setRoleFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Roles</SelectItem>
                      <SelectItem value="CUSTOMER">Customer</SelectItem>
                      <SelectItem value="BUSINESS_OWNER">Business Owner</SelectItem>
                      <SelectItem value="MODERATOR">Moderator</SelectItem>
                      <SelectItem value="ADMIN">Admin</SelectItem>
                      <SelectItem value="SUPPORT">Support</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="ACTIVE">Active</SelectItem>
                      <SelectItem value="INACTIVE">Inactive</SelectItem>
                      <SelectItem value="SUSPENDED">Suspended</SelectItem>
                      <SelectItem value="BANNED">Banned</SelectItem>
                      <SelectItem value="PENDING_VERIFICATION">Pending</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-5 gap-4">
                  <Select value={accountTypeFilter} onValueChange={setAccountTypeFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Account Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="PERSONAL">Personal</SelectItem>
                      <SelectItem value="BUSINESS">Business</SelectItem>
                      <SelectItem value="PREMIUM">Premium</SelectItem>
                      <SelectItem value="ENTERPRISE">Enterprise</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select value={lifecycleFilter} onValueChange={setLifecycleFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Lifecycle" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Stages</SelectItem>
                      <SelectItem value="NEW_USER">New User</SelectItem>
                      <SelectItem value="ACTIVE_USER">Active User</SelectItem>
                      <SelectItem value="ENGAGED_USER">Engaged User</SelectItem>
                      <SelectItem value="AT_RISK">At Risk</SelectItem>
                      <SelectItem value="CHURNED">Churned</SelectItem>
                    </SelectContent>
                  </Select>
                  
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
                  
                  <Select value={segmentFilter} onValueChange={setSegmentFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Segment" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Segments</SelectItem>
                      {userSegments.map((segment) => (
                        <SelectItem key={segment.id} value={segment.name}>
                          {segment.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <Select value={dateRangeFilter} onValueChange={setDateRangeFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Created" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Time</SelectItem>
                      <SelectItem value="last_week">Last Week</SelectItem>
                      <SelectItem value="last_month">Last Month</SelectItem>
                      <SelectItem value="last_3_months">Last 3 Months</SelectItem>
                      <SelectItem value="last_year">Last Year</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* User Selection Table */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  User Selection ({filteredUsers.length} users)
                </CardTitle>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
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
                      <TableHead>User</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Account Type</TableHead>
                      <TableHead>Lifecycle</TableHead>
                      <TableHead>Risk</TableHead>
                      <TableHead>Last Activity</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.slice(0, 50).map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <Checkbox
                            checked={selectedUsers.includes(user.id)}
                            onCheckedChange={(checked) => handleSelectUser(user.id, !!checked)}
                          />
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{user.fullName}</p>
                            <p className="text-sm text-gray-500">{user.email}</p>
                            {user.suburb && (
                              <p className="text-xs text-gray-400">{user.suburb}, {user.state}</p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={
                              user.role === 'ADMIN' ? 'destructive' :
                              user.role === 'BUSINESS_OWNER' ? 'default' :
                              'secondary'
                            }
                          >
                            {user.role.replace('_', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={
                              user.status === 'ACTIVE' ? 'default' :
                              user.status === 'SUSPENDED' ? 'secondary' :
                              user.status === 'BANNED' ? 'destructive' :
                              'outline'
                            }
                          >
                            {user.status.replace('_', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {user.accountType}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant="outline"
                            className={
                              user.lifecycleStage === 'ENGAGED_USER' ? 'border-green-300 text-green-600' :
                              user.lifecycleStage === 'AT_RISK' ? 'border-orange-300 text-orange-600' :
                              user.lifecycleStage === 'CHURNED' ? 'border-red-300 text-red-600' :
                              'border-gray-300 text-gray-600'
                            }
                          >
                            {user.lifecycleStage.replace('_', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant="outline"
                            className={
                              user.riskLevel === 'HIGH' ? 'border-red-300 text-red-600' :
                              user.riskLevel === 'MEDIUM' ? 'border-yellow-300 text-yellow-600' :
                              'border-green-300 text-green-600'
                            }
                          >
                            {user.riskLevel}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {user.lastActivity ? (
                              <span>{new Date(user.lastActivity).toLocaleDateString()}</span>
                            ) : (
                              <span className="text-gray-400">Never</span>
                            )}
                          </div>
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
                                View Profile
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit User
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem>
                                <Mail className="h-4 w-4 mr-2" />
                                Send Message
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Activity className="h-4 w-4 mr-2" />
                                View Activity
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem>
                                <Shield className="h-4 w-4 mr-2" />
                                Security Check
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {filteredUsers.length > 50 && (
                  <div className="text-center py-4">
                    <Button variant="outline">
                      Load More ({filteredUsers.length - 50} remaining)
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Other tabs would be implemented here... */}
        <TabsContent value="operations">
          <div className="text-center py-8">
            <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Active User Operations</p>
            <p className="text-sm text-gray-400">View and manage running bulk operations</p>
          </div>
        </TabsContent>

        <TabsContent value="segments">
          <div className="text-center py-8">
            <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">User Segments</p>
            <p className="text-sm text-gray-400">Create and manage user segments for targeted operations</p>
          </div>
        </TabsContent>

        <TabsContent value="analytics">
          <div className="text-center py-8">
            <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">User Analytics</p>
            <p className="text-sm text-gray-400">View user metrics and bulk operation analytics</p>
          </div>
        </TabsContent>

        <TabsContent value="lifecycle">
          <div className="text-center py-8">
            <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">User Lifecycle Management</p>
            <p className="text-sm text-gray-400">Manage user lifecycle stages and automated workflows</p>
          </div>
        </TabsContent>
      </Tabs>

      {/* Dialogs would be added here for operation builder, communication, export, etc. */}
      
    </div>
  );
}