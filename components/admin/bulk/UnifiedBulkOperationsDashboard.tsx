"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Building2,
  Users,
  Mail,
  Upload,
  Download,
  Activity,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  BarChart3,
  TrendingUp,
  Zap,
  RefreshCw,
  Settings,
  Eye,
  Plus,
  FileText,
  Database,
  Target,
  Send,
  Gauge,
  PieChart,
  Award,
  Star,
  Shield,
  History
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Import the specialized components
import EnhancedBulkBusinessManagement from './EnhancedBulkBusinessManagement';
import EnhancedBulkUserManagement from './EnhancedBulkUserManagement';
import EnhancedMassCommunication from './EnhancedMassCommunication';
import EnhancedCSVOperations from './EnhancedCSVOperations';

// Unified interfaces for dashboard overview
interface OverviewMetrics {
  totalOperations: number;
  activeOperations: number;
  completedToday: number;
  failedToday: number;
  
  // Business operations
  businessesProcessed: number;
  businessApprovals: number;
  businessRejections: number;
  
  // User operations
  usersProcessed: number;
  roleChanges: number;
  statusUpdates: number;
  
  // Communication
  campaignsSent: number;
  messagesSent: number;
  openRate: number;
  clickRate: number;
  
  // CSV operations
  filesProcessed: number;
  rowsImported: number;
  dataExported: number;
  scheduledJobs: number;
}

interface RecentActivity {
  id: string;
  type: 'BUSINESS' | 'USER' | 'COMMUNICATION' | 'CSV';
  operation: string;
  status: 'SUCCESS' | 'FAILED' | 'IN_PROGRESS';
  itemsProcessed: number;
  timestamp: string;
  user: string;
  details: string;
}

interface UnifiedBulkOperationsDashboardProps {
  className?: string;
}

export default function UnifiedBulkOperationsDashboard({ className }: UnifiedBulkOperationsDashboardProps) {
  // State management
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<OverviewMetrics | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);

  // Load dashboard data
  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      const [metricsRes, activityRes] = await Promise.all([
        fetch('/api/admin/bulk-operations/overview', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('supabase_access_token')}`,
          },
        }),
        fetch('/api/admin/bulk-operations/recent-activity', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('supabase_access_token')}`,
          },
        })
      ]);
      
      if (metricsRes.ok) {
        const metricsData = await metricsRes.json();
        setMetrics(metricsData);
      }
      
      if (activityRes.ok) {
        const activityData = await activityRes.json();
        setRecentActivity(activityData.activities || []);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Set mock data for demonstration
      setMetrics({
        totalOperations: 1247,
        activeOperations: 23,
        completedToday: 89,
        failedToday: 3,
        businessesProcessed: 15420,
        businessApprovals: 12350,
        businessRejections: 890,
        usersProcessed: 8750,
        roleChanges: 234,
        statusUpdates: 567,
        campaignsSent: 45,
        messagesSent: 125000,
        openRate: 24.5,
        clickRate: 3.2,
        filesProcessed: 156,
        rowsImported: 45000,
        dataExported: 12500,
        scheduledJobs: 8
      });
      
      setRecentActivity([
        {
          id: '1',
          type: 'BUSINESS',
          operation: 'Bulk Business Approval',
          status: 'SUCCESS',
          itemsProcessed: 150,
          timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          user: 'Admin User',
          details: 'Approved 150 high-quality businesses with verified ABN'
        },
        {
          id: '2',
          type: 'USER',
          operation: 'User Role Assignment',
          status: 'SUCCESS',
          itemsProcessed: 45,
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          user: 'Admin User',
          details: 'Assigned business owner roles to 45 users'
        },
        {
          id: '3',
          type: 'COMMUNICATION',
          operation: 'Welcome Email Campaign',
          status: 'IN_PROGRESS',
          itemsProcessed: 2340,
          timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          user: 'Marketing Team',
          details: 'Sending welcome emails to new users - 2,340 sent so far'
        },
        {
          id: '4',
          type: 'CSV',
          operation: 'Business Data Import',
          status: 'SUCCESS',
          itemsProcessed: 890,
          timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
          user: 'Data Team',
          details: 'Successfully imported 890 business records from CSV'
        },
        {
          id: '5',
          type: 'USER',
          operation: 'User Export',
          status: 'FAILED',
          itemsProcessed: 0,
          timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
          user: 'Admin User',
          details: 'Export failed due to permission issues'
        }
      ]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Get status icon
  const getStatusIcon = (status: RecentActivity['status']) => {
    switch (status) {
      case 'SUCCESS':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'FAILED':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'IN_PROGRESS':
        return <Clock className="h-4 w-4 text-blue-500" />;
    }
  };

  // Get type icon
  const getTypeIcon = (type: RecentActivity['type']) => {
    switch (type) {
      case 'BUSINESS':
        return <Building2 className="h-4 w-4 text-purple-500" />;
      case 'USER':
        return <Users className="h-4 w-4 text-blue-500" />;
      case 'COMMUNICATION':
        return <Mail className="h-4 w-4 text-green-500" />;
      case 'CSV':
        return <FileText className="h-4 w-4 text-orange-500" />;
    }
  };

  // Format time ago
  const formatTimeAgo = (timestamp: string) => {
    const now = Date.now();
    const time = new Date(timestamp).getTime();
    const diffInMinutes = Math.floor((now - time) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  if (loading && !metrics) {
    return (
      <div className={cn("space-y-6", className)}>
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center space-x-2">
            <RefreshCw className="h-5 w-5 animate-spin text-blue-500" />
            <span className="text-sm text-gray-600">Loading bulk operations dashboard...</span>
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
            <h1 className="text-3xl font-bold text-gray-900">Bulk Operations Dashboard</h1>
            <p className="text-gray-600">
              Centralized control center for all bulk operations across businesses, users, communications, and data management
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              onClick={fetchDashboardData}
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Quick Action
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="businesses">Businesses</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="communications">Communications</TabsTrigger>
          <TabsTrigger value="data">Data Operations</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Operations</p>
                    <p className="text-3xl font-bold text-blue-600">
                      {metrics?.totalOperations.toLocaleString()}
                    </p>
                  </div>
                  <Database className="h-10 w-10 text-blue-500" />
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  All-time bulk operations
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Operations</p>
                    <p className="text-3xl font-bold text-green-600">
                      {metrics?.activeOperations}
                    </p>
                  </div>
                  <Activity className="h-10 w-10 text-green-500" />
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Currently processing
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Completed Today</p>
                    <p className="text-3xl font-bold text-purple-600">
                      {metrics?.completedToday}
                    </p>
                  </div>
                  <CheckCircle className="h-10 w-10 text-purple-500" />
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Successful operations
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Failed Today</p>
                    <p className="text-3xl font-bold text-red-600">
                      {metrics?.failedToday}
                    </p>
                  </div>
                  <XCircle className="h-10 w-10 text-red-500" />
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Need attention
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Operation Type Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Business Operations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-purple-500" />
                  Business Operations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-2xl font-bold text-blue-600">
                        {metrics?.businessesProcessed.toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-600">Total Processed</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-green-600">
                        {metrics?.businessApprovals.toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-600">Approvals</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-red-600">
                        {metrics?.businessRejections.toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-600">Rejections</p>
                    </div>
                  </div>
                  <div className="pt-2">
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => setActiveTab('businesses')}
                    >
                      <Building2 className="h-4 w-4 mr-2" />
                      Manage Businesses
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* User Operations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-500" />
                  User Operations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-2xl font-bold text-blue-600">
                        {metrics?.usersProcessed.toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-600">Total Processed</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-green-600">
                        {metrics?.roleChanges.toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-600">Role Changes</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-orange-600">
                        {metrics?.statusUpdates.toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-600">Status Updates</p>
                    </div>
                  </div>
                  <div className="pt-2">
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => setActiveTab('users')}
                    >
                      <Users className="h-4 w-4 mr-2" />
                      Manage Users
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Communication Operations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5 text-green-500" />
                  Communications
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <p className="text-2xl font-bold text-blue-600">
                        {metrics?.campaignsSent}
                      </p>
                      <p className="text-sm text-gray-600">Campaigns Sent</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-green-600">
                        {metrics?.messagesSent.toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-600">Messages Sent</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <p className="text-xl font-bold text-purple-600">
                        {metrics?.openRate}%
                      </p>
                      <p className="text-sm text-gray-600">Avg Open Rate</p>
                    </div>
                    <div>
                      <p className="text-xl font-bold text-orange-600">
                        {metrics?.clickRate}%
                      </p>
                      <p className="text-sm text-gray-600">Avg Click Rate</p>
                    </div>
                  </div>
                  <div className="pt-2">
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => setActiveTab('communications')}
                    >
                      <Mail className="h-4 w-4 mr-2" />
                      Manage Communications
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Data Operations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-orange-500" />
                  Data Operations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <p className="text-2xl font-bold text-blue-600">
                        {metrics?.filesProcessed}
                      </p>
                      <p className="text-sm text-gray-600">Files Processed</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-green-600">
                        {metrics?.rowsImported.toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-600">Rows Imported</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <p className="text-xl font-bold text-purple-600">
                        {metrics?.dataExported.toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-600">Rows Exported</p>
                    </div>
                    <div>
                      <p className="text-xl font-bold text-orange-600">
                        {metrics?.scheduledJobs}
                      </p>
                      <p className="text-sm text-gray-600">Scheduled Jobs</p>
                    </div>
                  </div>
                  <div className="pt-2">
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => setActiveTab('data')}
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Manage Data
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <History className="h-5 w-5" />
                  Recent Activity
                </CardTitle>
                <Button variant="outline" size="sm">
                  <Eye className="h-4 w-4 mr-2" />
                  View All
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      {getTypeIcon(activity.type)}
                      <div>
                        <p className="font-medium">{activity.operation}</p>
                        <p className="text-sm text-gray-600">{activity.details}</p>
                        <p className="text-xs text-gray-500">
                          {activity.user} • {formatTimeAgo(activity.timestamp)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="text-right">
                        <p className="font-semibold">{activity.itemsProcessed.toLocaleString()}</p>
                        <p className="text-xs text-gray-500">items processed</p>
                      </div>
                      {getStatusIcon(activity.status)}
                    </div>
                  </div>
                ))}
                
                {recentActivity.length === 0 && (
                  <div className="text-center py-8">
                    <History className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No recent activity</p>
                    <p className="text-sm text-gray-400">Bulk operations will appear here</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Businesses Tab - Load the Enhanced Business Management Component */}
        <TabsContent value="businesses">
          <EnhancedBulkBusinessManagement />
        </TabsContent>

        {/* Users Tab - Load the Enhanced User Management Component */}
        <TabsContent value="users">
          <EnhancedBulkUserManagement />
        </TabsContent>

        {/* Communications Tab - Load the Mass Communication Component */}
        <TabsContent value="communications">
          <EnhancedMassCommunication />
        </TabsContent>

        {/* Data Operations Tab - Load the CSV Operations Component */}
        <TabsContent value="data">
          <EnhancedCSVOperations />
        </TabsContent>
      </Tabs>
    </div>
  );
}