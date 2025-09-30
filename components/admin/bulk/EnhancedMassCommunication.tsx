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
} from '@/components/ui/dropdown-menu';
import { 
  Mail,
  MessageSquare,
  Send,
  Calendar,
  Users,
  Target,
  BarChart3,
  PieChart,
  TrendingUp,
  Activity,
  Clock,
  CheckCircle,
  XCircle,
  Pause,
  Play,
  Eye,
  Edit,
  Copy,
  Trash2,
  Settings,
  RefreshCw,
  Filter,
  Search,
  Plus,
  FileText,
  Image,
  Video,
  Link,
  Zap,
  Bell,
  Smartphone,
  Globe,
  AlertTriangle,
  Info,
  Gauge,
  MousePointer,
  ThumbsUp,
  ThumbsDown,
  Reply,
  Forward,
  Archive,
  Star,
  Flag,
  Hash,
  AtSign,
  Phone,
  ChevronDown,
  ChevronRight,
  MoreHorizontal,
  Download,
  Upload
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Enhanced interfaces for Task #7 Phase 3
interface CommunicationTemplate {
  id: string;
  name: string;
  description: string;
  type: 'EMAIL' | 'SMS' | 'PUSH' | 'IN_APP';
  category: 'MARKETING' | 'TRANSACTIONAL' | 'NOTIFICATION' | 'ANNOUNCEMENT';
  subject?: string;
  content: string;
  variables: string[];
  isActive: boolean;
  createdAt: string;
  lastUsed?: string;
  usageCount: number;
  createdBy: string;
  tags: string[];
  previewData?: any;
}

interface CommunicationCampaign {
  id: string;
  name: string;
  description: string;
  type: 'EMAIL' | 'SMS' | 'PUSH' | 'IN_APP' | 'MULTI_CHANNEL';
  status: 'DRAFT' | 'SCHEDULED' | 'SENDING' | 'SENT' | 'PAUSED' | 'CANCELLED' | 'FAILED';
  
  // Template and content
  templateId?: string;
  subject?: string;
  content: string;
  
  // Targeting
  targetType: 'ALL_USERS' | 'SEGMENT' | 'INDIVIDUAL' | 'CRITERIA';
  targetSegments?: string[];
  targetUserIds?: string[];
  targetCriteria?: {
    field: string;
    operator: string;
    value: any;
  }[];
  
  // Scheduling
  scheduledFor?: string;
  timezone: string;
  sendImmediately: boolean;
  
  // Settings
  settings: {
    trackOpens: boolean;
    trackClicks: boolean;
    unsubscribeLink: boolean;
    personalizeContent: boolean;
    rateLimited: boolean;
    maxPerHour?: number;
    retryFailures: boolean;
    testMode: boolean;
  };
  
  // Results and metrics
  targetCount: number;
  sentCount: number;
  deliveredCount: number;
  openedCount: number;
  clickedCount: number;
  unsubscribedCount: number;
  bouncedCount: number;
  failedCount: number;
  
  // Timing
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  createdBy: string;
  
  // Analytics
  metrics: {
    deliveryRate: number;
    openRate: number;
    clickRate: number;
    unsubscribeRate: number;
    bounceRate: number;
  };
  
  // A/B testing
  abTest?: {
    enabled: boolean;
    variants: {
      id: string;
      name: string;
      percentage: number;
      subject?: string;
      content: string;
    }[];
    winnerCriteria: 'OPEN_RATE' | 'CLICK_RATE' | 'CONVERSION_RATE';
  };
}

interface CommunicationSegment {
  id: string;
  name: string;
  description: string;
  criteria: {
    field: string;
    operator: string;
    value: any;
    label: string;
  }[];
  userCount: number;
  isActive: boolean;
  createdAt: string;
  lastUpdated: string;
  tags: string[];
}

interface AutomatedWorkflow {
  id: string;
  name: string;
  description: string;
  type: 'TRIGGER_BASED' | 'DRIP_CAMPAIGN' | 'LIFECYCLE' | 'BEHAVIORAL';
  status: 'ACTIVE' | 'PAUSED' | 'DRAFT' | 'ARCHIVED';
  
  // Trigger conditions
  triggers: {
    event: string;
    conditions?: {
      field: string;
      operator: string;
      value: any;
    }[];
    delay?: number; // Minutes
  }[];
  
  // Actions
  actions: {
    id: string;
    type: 'SEND_EMAIL' | 'SEND_SMS' | 'SEND_PUSH' | 'UPDATE_SEGMENT' | 'TAG_USER' | 'DELAY';
    order: number;
    config: {
      templateId?: string;
      delay?: number;
      segmentId?: string;
      tags?: string[];
      customContent?: string;
    };
    status: 'PENDING' | 'ACTIVE' | 'COMPLETED' | 'FAILED';
  }[];
  
  // Metrics
  triggerCount: number;
  completedCount: number;
  activeUsers: number;
  
  createdAt: string;
  createdBy: string;
}

interface EnhancedMassCommunicationProps {
  className?: string;
}

export default function EnhancedMassCommunication({ className }: EnhancedMassCommunicationProps) {
  // State management
  const [campaigns, setCampaigns] = useState<CommunicationCampaign[]>([]);
  const [templates, setTemplates] = useState<CommunicationTemplate[]>([]);
  const [segments, setSegments] = useState<CommunicationSegment[]>([]);
  const [workflows, setWorkflows] = useState<AutomatedWorkflow[]>([]);
  const [loading, setLoading] = useState(true);
  
  // UI State
  const [activeTab, setActiveTab] = useState('campaigns');
  const [showCampaignBuilder, setShowCampaignBuilder] = useState(false);
  const [showTemplateBuilder, setShowTemplateBuilder] = useState(false);
  const [showWorkflowBuilder, setShowWorkflowBuilder] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<string | null>(null);
  
  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [dateRangeFilter, setDateRangeFilter] = useState('all');
  
  // Campaign builder state
  const [newCampaign, setNewCampaign] = useState<Partial<CommunicationCampaign>>({
    name: '',
    description: '',
    type: 'EMAIL',
    targetType: 'SEGMENT',
    content: '',
    sendImmediately: false,
    timezone: 'Australia/Sydney',
    settings: {
      trackOpens: true,
      trackClicks: true,
      unsubscribeLink: true,
      personalizeContent: true,
      rateLimited: true,
      maxPerHour: 1000,
      retryFailures: true,
      testMode: false
    }
  });

  // Filter campaigns based on criteria
  const filteredCampaigns = useMemo(() => {
    let filtered = campaigns;
    
    // Search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(campaign => 
        campaign.name.toLowerCase().includes(query) ||
        campaign.description.toLowerCase().includes(query) ||
        campaign.content.toLowerCase().includes(query)
      );
    }
    
    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(campaign => campaign.status === statusFilter);
    }
    
    // Type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(campaign => campaign.type === typeFilter);
    }
    
    // Date range filter
    if (dateRangeFilter !== 'all') {
      const now = new Date();
      const filterDate = new Date();
      
      switch (dateRangeFilter) {
        case 'today':
          filterDate.setHours(0, 0, 0, 0);
          break;
        case 'week':
          filterDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          filterDate.setMonth(now.getMonth() - 1);
          break;
        case 'quarter':
          filterDate.setMonth(now.getMonth() - 3);
          break;
      }
      
      if (dateRangeFilter !== 'all') {
        filtered = filtered.filter(campaign => new Date(campaign.createdAt) >= filterDate);
      }
    }
    
    return filtered;
  }, [campaigns, searchQuery, statusFilter, typeFilter, dateRangeFilter]);

  // Load data
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [campaignsRes, templatesRes, segmentsRes, workflowsRes] = await Promise.all([
        fetch('/api/admin/communication/campaigns', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('supabase_access_token')}`,
          },
        }),
        fetch('/api/admin/communication/templates', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('supabase_access_token')}`,
          },
        }),
        fetch('/api/admin/communication/segments', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('supabase_access_token')}`,
          },
        }),
        fetch('/api/admin/communication/workflows', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('supabase_access_token')}`,
          },
        })
      ]);
      
      if (campaignsRes.ok) {
        const campaignData = await campaignsRes.json();
        setCampaigns(campaignData.campaigns || []);
      }
      
      if (templatesRes.ok) {
        const templateData = await templatesRes.json();
        setTemplates(templateData.templates || []);
      }
      
      if (segmentsRes.ok) {
        const segmentData = await segmentsRes.json();
        setSegments(segmentData.segments || []);
      }
      
      if (workflowsRes.ok) {
        const workflowData = await workflowsRes.json();
        setWorkflows(workflowData.workflows || []);
      }
    } catch (error) {
      console.error('Error fetching mass communication data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handle campaign actions
  const handleCampaignAction = async (campaignId: string, action: 'START' | 'PAUSE' | 'RESUME' | 'CANCEL') => {
    try {
      const response = await fetch(`/api/admin/communication/campaigns/${campaignId}/action`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('supabase_access_token')}`,
        },
        body: JSON.stringify({ action }),
      });

      if (response.ok) {
        await fetchData();
      }
    } catch (error) {
      console.error('Error executing campaign action:', error);
    }
  };

  // Calculate summary metrics
  const summaryMetrics = useMemo(() => {
    return {
      totalCampaigns: campaigns.length,
      activeCampaigns: campaigns.filter(c => c.status === 'SENDING' || c.status === 'SCHEDULED').length,
      sentThisMonth: campaigns.filter(c => {
        if (!c.completedAt) return false;
        const completedDate = new Date(c.completedAt);
        const monthAgo = new Date();
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        return completedDate >= monthAgo;
      }).length,
      totalSent: campaigns.reduce((sum, c) => sum + c.sentCount, 0),
      avgOpenRate: campaigns.length > 0 ? 
        campaigns.reduce((sum, c) => sum + c.metrics.openRate, 0) / campaigns.length : 0,
      avgClickRate: campaigns.length > 0 ? 
        campaigns.reduce((sum, c) => sum + c.metrics.clickRate, 0) / campaigns.length : 0,
      totalTemplates: templates.length,
      activeWorkflows: workflows.filter(w => w.status === 'ACTIVE').length
    };
  }, [campaigns, templates, workflows]);

  if (loading) {
    return (
      <div className={cn("space-y-6", className)}>
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center space-x-2">
            <RefreshCw className="h-5 w-5 animate-spin text-blue-500" />
            <span className="text-sm text-gray-600">Loading mass communication...</span>
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
            <h1 className="text-3xl font-bold text-gray-900">Mass Communication</h1>
            <p className="text-gray-600">
              Bulk notification system with template management, email campaigns, SMS, analytics, and automated workflows
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
              onClick={() => setShowTemplateBuilder(true)}
              className="flex items-center gap-2"
            >
              <FileText className="h-4 w-4" />
              New Template
            </Button>
            <Button 
              onClick={() => setShowCampaignBuilder(true)}
              className="flex items-center gap-2"
            >
              <Send className="h-4 w-4" />
              New Campaign
            </Button>
          </div>
        </div>

        {/* Summary Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-8 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Campaigns</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {summaryMetrics.totalCampaigns.toLocaleString()}
                  </p>
                </div>
                <Mail className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active</p>
                  <p className="text-2xl font-bold text-green-600">
                    {summaryMetrics.activeCampaigns}
                  </p>
                </div>
                <Activity className="h-8 w-8 text-green-500" />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Currently sending
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Sent This Month</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {summaryMetrics.sentThisMonth}
                  </p>
                </div>
                <Send className="h-8 w-8 text-purple-500" />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Last 30 days
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Sent</p>
                  <p className="text-2xl font-bold text-indigo-600">
                    {summaryMetrics.totalSent.toLocaleString()}
                  </p>
                </div>
                <Users className="h-8 w-8 text-indigo-500" />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                All time messages
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg Open Rate</p>
                  <p className="text-2xl font-bold text-emerald-600">
                    {summaryMetrics.avgOpenRate.toFixed(1)}%
                  </p>
                </div>
                <Eye className="h-8 w-8 text-emerald-500" />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Email campaigns
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg Click Rate</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {summaryMetrics.avgClickRate.toFixed(1)}%
                  </p>
                </div>
                <MousePointer className="h-8 w-8 text-orange-500" />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Email campaigns
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Templates</p>
                  <p className="text-2xl font-bold text-teal-600">
                    {summaryMetrics.totalTemplates}
                  </p>
                </div>
                <FileText className="h-8 w-8 text-teal-500" />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Available templates
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Workflows</p>
                  <p className="text-2xl font-bold text-red-600">
                    {summaryMetrics.activeWorkflows}
                  </p>
                </div>
                <Zap className="h-8 w-8 text-red-500" />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Active automations
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="segments">Segments</TabsTrigger>
          <TabsTrigger value="workflows">Workflows</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Campaigns Tab */}
        <TabsContent value="campaigns" className="space-y-4">
          {/* Search and Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search campaigns by name, description, or content..."
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
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="DRAFT">Draft</SelectItem>
                      <SelectItem value="SCHEDULED">Scheduled</SelectItem>
                      <SelectItem value="SENDING">Sending</SelectItem>
                      <SelectItem value="SENT">Sent</SelectItem>
                      <SelectItem value="PAUSED">Paused</SelectItem>
                      <SelectItem value="CANCELLED">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="EMAIL">Email</SelectItem>
                      <SelectItem value="SMS">SMS</SelectItem>
                      <SelectItem value="PUSH">Push</SelectItem>
                      <SelectItem value="IN_APP">In-App</SelectItem>
                      <SelectItem value="MULTI_CHANNEL">Multi-Channel</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={dateRangeFilter} onValueChange={setDateRangeFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Date Range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Time</SelectItem>
                      <SelectItem value="today">Today</SelectItem>
                      <SelectItem value="week">Last Week</SelectItem>
                      <SelectItem value="month">Last Month</SelectItem>
                      <SelectItem value="quarter">Last Quarter</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Campaign List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="h-5 w-5" />
                Communication Campaigns ({filteredCampaigns.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredCampaigns.map((campaign) => (
                  <div key={campaign.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <Badge 
                          variant={
                            campaign.status === 'SENT' ? 'default' :
                            campaign.status === 'SENDING' ? 'default' :
                            campaign.status === 'SCHEDULED' ? 'secondary' :
                            campaign.status === 'DRAFT' ? 'outline' :
                            campaign.status === 'PAUSED' ? 'secondary' :
                            'destructive'
                          }
                        >
                          {campaign.status}
                        </Badge>
                        <Badge variant="outline">
                          {campaign.type}
                        </Badge>
                        <div>
                          <h4 className="font-semibold">{campaign.name}</h4>
                          <p className="text-sm text-gray-600">{campaign.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {campaign.status === 'DRAFT' && (
                          <Button size="sm" variant="outline">
                            <Edit className="h-4 w-4" />
                          </Button>
                        )}
                        {campaign.status === 'SCHEDULED' && (
                          <>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleCampaignAction(campaign.id, 'START')}
                            >
                              <Play className="h-4 w-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleCampaignAction(campaign.id, 'CANCEL')}
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                        {campaign.status === 'SENDING' && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleCampaignAction(campaign.id, 'PAUSE')}
                          >
                            <Pause className="h-4 w-4" />
                          </Button>
                        )}
                        {campaign.status === 'PAUSED' && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleCampaignAction(campaign.id, 'RESUME')}
                          >
                            <Play className="h-4 w-4" />
                          </Button>
                        )}
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button size="sm" variant="ghost">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Copy className="h-4 w-4 mr-2" />
                              Duplicate
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Download className="h-4 w-4 mr-2" />
                              Export Results
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600">
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                    
                    {/* Campaign metrics */}
                    <div className="grid grid-cols-6 gap-4 mb-3">
                      <div className="text-center">
                        <p className="text-lg font-bold">{campaign.targetCount.toLocaleString()}</p>
                        <p className="text-xs text-gray-500">Target</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-bold">{campaign.sentCount.toLocaleString()}</p>
                        <p className="text-xs text-gray-500">Sent</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-bold text-green-600">{campaign.deliveredCount.toLocaleString()}</p>
                        <p className="text-xs text-gray-500">Delivered</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-bold text-blue-600">{campaign.openedCount.toLocaleString()}</p>
                        <p className="text-xs text-gray-500">Opened</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-bold text-purple-600">{campaign.clickedCount.toLocaleString()}</p>
                        <p className="text-xs text-gray-500">Clicked</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-bold text-red-600">{campaign.failedCount.toLocaleString()}</p>
                        <p className="text-xs text-gray-500">Failed</p>
                      </div>
                    </div>
                    
                    {/* Progress bar for sending campaigns */}
                    {campaign.status === 'SENDING' && (
                      <div className="mb-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm text-gray-600">Sending Progress</span>
                          <span className="text-sm text-gray-600">
                            {campaign.targetCount > 0 ? 
                              ((campaign.sentCount / campaign.targetCount) * 100).toFixed(1) : 0}%
                          </span>
                        </div>
                        <Progress 
                          value={campaign.targetCount > 0 ? 
                            (campaign.sentCount / campaign.targetCount) * 100 : 0} 
                          className="h-2" 
                        />
                      </div>
                    )}
                    
                    {/* Performance metrics */}
                    {campaign.status === 'SENT' && (
                      <div className="flex items-center space-x-6 text-sm">
                        <div className="flex items-center space-x-1">
                          <Gauge className="h-4 w-4 text-green-500" />
                          <span>Delivery: {campaign.metrics.deliveryRate.toFixed(1)}%</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Eye className="h-4 w-4 text-blue-500" />
                          <span>Opens: {campaign.metrics.openRate.toFixed(1)}%</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <MousePointer className="h-4 w-4 text-purple-500" />
                          <span>Clicks: {campaign.metrics.clickRate.toFixed(1)}%</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <AlertTriangle className="h-4 w-4 text-orange-500" />
                          <span>Bounce: {campaign.metrics.bounceRate.toFixed(1)}%</span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                
                {filteredCampaigns.length === 0 && (
                  <div className="text-center py-8">
                    <Send className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No campaigns found</p>
                    <p className="text-sm text-gray-400">Create your first campaign to get started</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Templates Tab */}
        <TabsContent value="templates">
          <div className="text-center py-8">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Communication Templates</p>
            <p className="text-sm text-gray-400">Manage email, SMS, and push notification templates</p>
          </div>
        </TabsContent>

        {/* Segments Tab */}
        <TabsContent value="segments">
          <div className="text-center py-8">
            <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Communication Segments</p>
            <p className="text-sm text-gray-400">Create and manage user segments for targeted campaigns</p>
          </div>
        </TabsContent>

        {/* Workflows Tab */}
        <TabsContent value="workflows">
          <div className="text-center py-8">
            <Zap className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Automated Workflows</p>
            <p className="text-sm text-gray-400">Set up trigger-based communication workflows</p>
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics">
          <div className="text-center py-8">
            <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Communication Analytics</p>
            <p className="text-sm text-gray-400">View performance metrics and campaign effectiveness</p>
          </div>
        </TabsContent>
      </Tabs>

      {/* Dialogs would be added here for campaign builder, template builder, etc. */}
      
    </div>
  );
}