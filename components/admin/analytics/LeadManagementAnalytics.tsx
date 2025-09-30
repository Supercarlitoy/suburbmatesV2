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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  FunnelChart,
  Funnel,
  LabelList,
  ComposedChart,
  ScatterChart,
  Scatter
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Users,
  UserCheck,
  UserX,
  Target,
  DollarSign,
  Timer,
  Star,
  Award,
  Clock,
  Calendar,
  Filter,
  Download,
  RefreshCw,
  ExternalLink,
  ArrowUp,
  ArrowDown,
  Minus,
  AlertTriangle,
  CheckCircle,
  Info,
  Zap,
  Activity,
  Mail,
  Phone,
  MessageCircle,
  FileText,
  BarChart3,
  PieChart as PieIcon,
  Search,
  Edit,
  Eye,
  AlertCircle,
  ThumbsUp,
  ThumbsDown,
  Flame,
  IceCream,
  Snowflake,
  Heart,
  Brain,
  Building,
  MapPin,
  Briefcase,
  HomeIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface LeadData {
  id: string;
  // Lead Information
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  company?: string;
  
  // Lead Scoring
  leadScore: number;
  demographicScore: number;
  behavioralScore: number;
  engagementScore: number;
  
  // Lead Qualification
  status: 'new' | 'qualified' | 'marketing-qualified' | 'sales-qualified' | 'converted' | 'disqualified' | 'nurturing';
  qualification: 'hot' | 'warm' | 'cold' | 'unqualified';
  temperature: 'hot' | 'warm' | 'cold';
  
  // Source & Attribution
  source: string;
  medium: string;
  campaign: string;
  utm_content?: string;
  referrer?: string;
  
  // Lifecycle Tracking
  createdAt: string;
  firstContact: string;
  lastActivity: string;
  lastTouchpoint: string;
  daysInPipeline: number;
  touchpointCount: number;
  
  // Sales Data
  assignedTo?: string;
  estimatedValue: number;
  probability: number;
  expectedCloseDate?: string;
  actualCloseDate?: string;
  
  // Engagement Metrics
  emailOpens: number;
  emailClicks: number;
  websiteVisits: number;
  formSubmissions: number;
  downloadCount: number;
  socialEngagement: number;
  
  // Geographic & Demographic
  location: string;
  industry?: string;
  companySize?: string;
  jobTitle?: string;
  
  // Nurturing Status
  lastNurtureActivity: string;
  nurtureStage: string;
  nextFollowUp: string;
  automationStatus: 'active' | 'paused' | 'completed' | 'none';
}

interface LeadScoringModel {
  name: string;
  weight: number;
  criteria: {
    category: string;
    factor: string;
    score: number;
    weight: number;
  }[];
}

interface ConversionFunnelData {
  stage: string;
  leads: number;
  conversions: number;
  conversionRate: number;
  averageTime: number;
  dropOffReasons: { reason: string; count: number }[];
}

interface NurturingWorkflow {
  id: string;
  name: string;
  description: string;
  triggers: string[];
  stages: {
    name: string;
    duration: number;
    actions: string[];
    successRate: number;
  }[];
  totalLeads: number;
  activeLeads: number;
  completionRate: number;
  averageConversionTime: number;
}

interface LeadManagementAnalyticsProps {
  className?: string;
}

const CHART_COLORS = [
  '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
  '#06b6d4', '#84cc16', '#f97316', '#ec4899', '#6b7280'
];

const LEAD_STATUS_CONFIG = {
  new: { color: 'bg-blue-50 text-blue-700 border-blue-200', icon: Users },
  qualified: { color: 'bg-green-50 text-green-700 border-green-200', icon: UserCheck },
  'marketing-qualified': { color: 'bg-purple-50 text-purple-700 border-purple-200', icon: Target },
  'sales-qualified': { color: 'bg-orange-50 text-orange-700 border-orange-200', icon: Award },
  converted: { color: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: CheckCircle },
  disqualified: { color: 'bg-red-50 text-red-700 border-red-200', icon: UserX },
  nurturing: { color: 'bg-yellow-50 text-yellow-700 border-yellow-200', icon: Timer }
};

const TEMPERATURE_CONFIG = {
  hot: { color: 'text-red-600 bg-red-50', icon: Flame },
  warm: { color: 'text-orange-600 bg-orange-50', icon: Heart },
  cold: { color: 'text-blue-600 bg-blue-50', icon: Snowflake }
};

export default function LeadManagementAnalytics({ className }: LeadManagementAnalyticsProps) {
  // State Management
  const [leads, setLeads] = useState<LeadData[]>([]);
  const [scoringModels, setScoringModels] = useState<LeadScoringModel[]>([]);
  const [funnelData, setFunnelData] = useState<ConversionFunnelData[]>([]);
  const [workflows, setWorkflows] = useState<NurturingWorkflow[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // UI State
  const [activeTab, setActiveTab] = useState('overview');
  const [dateRange, setDateRange] = useState('30d');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedSource, setSelectedSource] = useState('all');
  const [selectedTemperature, setSelectedTemperature] = useState('all');
  const [selectedAssignee, setSelectedAssignee] = useState('all');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Advanced Filters
  const [filters, setFilters] = useState({
    minScore: '',
    maxScore: '',
    minValue: '',
    maxValue: '',
    daysInPipeline: '',
    sortBy: 'leadScore',
    sortOrder: 'desc' as 'asc' | 'desc',
    includeConverted: true,
    includeDisqualified: false
  });

  // Fetch Lead Management Data
  const fetchLeadData = useCallback(async (showLoader = true) => {
    if (showLoader) setLoading(true);
    if (!showLoader) setRefreshing(true);

    try {
      const queryParams = new URLSearchParams({
        dateRange,
        status: selectedStatus,
        source: selectedSource,
        temperature: selectedTemperature,
        assignee: selectedAssignee,
        ...filters
      });

      const response = await fetch(`/api/admin/analytics/leads?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('supabase_access_token')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setLeads(data.leads || []);
        setScoringModels(data.scoringModels || []);
        setFunnelData(data.funnel || []);
        setWorkflows(data.workflows || []);
      } else {
        console.error('Failed to fetch lead analytics:', response.statusText);
      }
    } catch (error) {
      console.error('Error fetching lead analytics:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [dateRange, selectedStatus, selectedSource, selectedTemperature, selectedAssignee, filters]);

  // Initial load and data refresh
  useEffect(() => {
    fetchLeadData();
  }, [fetchLeadData]);

  // Helper Functions
  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD'
    }).format(amount);
  };

  const formatPercentage = (value: number): string => {
    return `${(value * 100).toFixed(1)}%`;
  };

  const formatDuration = (days: number): string => {
    if (days < 1) return `${Math.round(days * 24)}h`;
    if (days < 7) return `${Math.round(days)}d`;
    if (days < 30) return `${Math.round(days / 7)}w`;
    return `${Math.round(days / 30)}m`;
  };

  const getScoreColor = (score: number): string => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    if (score >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  const getTrendIcon = (current: number, previous: number) => {
    if (current > previous) return <ArrowUp className="h-3 w-3 text-green-500" />;
    if (current < previous) return <ArrowDown className="h-3 w-3 text-red-500" />;
    return <Minus className="h-3 w-3 text-gray-500" />;
  };

  // Computed Analytics
  const analytics = useMemo(() => {
    if (!leads.length) return null;

    const totalLeads = leads.length;
    const qualifiedLeads = leads.filter(l => ['qualified', 'marketing-qualified', 'sales-qualified'].includes(l.status)).length;
    const convertedLeads = leads.filter(l => l.status === 'converted').length;
    const averageScore = leads.reduce((sum, l) => sum + l.leadScore, 0) / totalLeads;
    const averageValue = leads.reduce((sum, l) => sum + l.estimatedValue, 0) / totalLeads;
    const averageTimeInPipeline = leads.reduce((sum, l) => sum + l.daysInPipeline, 0) / totalLeads;

    // Temperature distribution
    const temperatureDistribution = leads.reduce((acc, lead) => {
      acc[lead.temperature] = (acc[lead.temperature] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Source performance
    const sourcePerformance = leads.reduce((acc, lead) => {
      if (!acc[lead.source]) {
        acc[lead.source] = { total: 0, qualified: 0, converted: 0, totalValue: 0 };
      }
      acc[lead.source].total += 1;
      if (['qualified', 'marketing-qualified', 'sales-qualified'].includes(lead.status)) {
        acc[lead.source].qualified += 1;
      }
      if (lead.status === 'converted') {
        acc[lead.source].converted += 1;
      }
      acc[lead.source].totalValue += lead.estimatedValue;
      return acc;
    }, {} as Record<string, any>);

    return {
      totalLeads,
      qualifiedLeads,
      convertedLeads,
      averageScore,
      averageValue,
      averageTimeInPipeline,
      qualificationRate: totalLeads > 0 ? qualifiedLeads / totalLeads : 0,
      conversionRate: totalLeads > 0 ? convertedLeads / totalLeads : 0,
      temperatureDistribution,
      sourcePerformance
    };
  }, [leads]);

  // Score Distribution Data
  const scoreDistribution = useMemo(() => {
    if (!leads.length) return [];
    
    const ranges = [
      { range: '0-20', min: 0, max: 20 },
      { range: '21-40', min: 21, max: 40 },
      { range: '41-60', min: 41, max: 60 },
      { range: '61-80', min: 61, max: 80 },
      { range: '81-100', min: 81, max: 100 }
    ];

    return ranges.map(({ range, min, max }) => ({
      range,
      count: leads.filter(l => l.leadScore >= min && l.leadScore <= max).length,
      qualified: leads.filter(l => 
        l.leadScore >= min && 
        l.leadScore <= max && 
        ['qualified', 'marketing-qualified', 'sales-qualified'].includes(l.status)
      ).length
    }));
  }, [leads]);

  // Top Performing Leads
  const topLeads = useMemo(() => {
    return [...leads]
      .sort((a, b) => {
        switch (filters.sortBy) {
          case 'leadScore': return b.leadScore - a.leadScore;
          case 'estimatedValue': return b.estimatedValue - a.estimatedValue;
          case 'engagementScore': return b.engagementScore - a.engagementScore;
          case 'daysInPipeline': return b.daysInPipeline - a.daysInPipeline;
          default: return b.leadScore - a.leadScore;
        }
      })
      .slice(0, 20);
  }, [leads, filters.sortBy]);

  if (loading) {
    return (
      <div className={cn("space-y-6", className)}>
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center space-x-2">
            <RefreshCw className="h-5 w-5 animate-spin text-blue-500" />
            <span className="text-sm text-gray-600">Loading lead analytics...</span>
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
            <h1 className="text-3xl font-bold text-gray-900">Lead Management Analytics</h1>
            <p className="text-gray-600">
              Track lead qualification, scoring, lifecycle progression, and nurturing performance
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Date range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">7 Days</SelectItem>
                <SelectItem value="30d">30 Days</SelectItem>
                <SelectItem value="90d">90 Days</SelectItem>
                <SelectItem value="1y">1 Year</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              onClick={() => fetchLeadData(false)}
              disabled={refreshing}
              className="flex items-center gap-2"
            >
              <RefreshCw className={cn("h-4 w-4", refreshing && "animate-spin")} />
              Refresh
            </Button>
            <Button className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Export Report
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        {analytics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Leads</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {formatNumber(analytics.totalLeads)}
                    </p>
                  </div>
                  <Users className="h-8 w-8 text-blue-500" />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {formatPercentage(analytics.qualificationRate)} qualified
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Average Score</p>
                    <p className={cn("text-2xl font-bold", getScoreColor(analytics.averageScore))}>
                      {Math.round(analytics.averageScore)}
                    </p>
                  </div>
                  <Star className="h-8 w-8 text-yellow-500" />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Lead quality indicator
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
                    <p className="text-2xl font-bold text-green-600">
                      {formatPercentage(analytics.conversionRate)}
                    </p>
                  </div>
                  <Target className="h-8 w-8 text-green-500" />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {formatNumber(analytics.convertedLeads)} conversions
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Avg Pipeline Time</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {formatDuration(analytics.averageTimeInPipeline)}
                    </p>
                  </div>
                  <Timer className="h-8 w-8 text-purple-500" />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {formatCurrency(analytics.averageValue)} avg value
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filter Controls */}
        <Card>
          <CardContent className="p-4">
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <Label>Status</Label>
                  <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                    <SelectTrigger>
                      <SelectValue placeholder="All statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="new">New</SelectItem>
                      <SelectItem value="qualified">Qualified</SelectItem>
                      <SelectItem value="marketing-qualified">Marketing Qualified</SelectItem>
                      <SelectItem value="sales-qualified">Sales Qualified</SelectItem>
                      <SelectItem value="converted">Converted</SelectItem>
                      <SelectItem value="nurturing">Nurturing</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Temperature</Label>
                  <Select value={selectedTemperature} onValueChange={setSelectedTemperature}>
                    <SelectTrigger>
                      <SelectValue placeholder="All temperatures" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Temperatures</SelectItem>
                      <SelectItem value="hot">Hot</SelectItem>
                      <SelectItem value="warm">Warm</SelectItem>
                      <SelectItem value="cold">Cold</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Source</Label>
                  <Select value={selectedSource} onValueChange={setSelectedSource}>
                    <SelectTrigger>
                      <SelectValue placeholder="All sources" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Sources</SelectItem>
                      {Object.keys(analytics?.sourcePerformance || {}).map(source => (
                        <SelectItem key={source} value={source}>
                          {source}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Sort By</Label>
                  <Select 
                    value={filters.sortBy} 
                    onValueChange={(value) => setFilters({ ...filters, sortBy: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="leadScore">Lead Score</SelectItem>
                      <SelectItem value="estimatedValue">Estimated Value</SelectItem>
                      <SelectItem value="engagementScore">Engagement</SelectItem>
                      <SelectItem value="daysInPipeline">Pipeline Time</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="advanced-filters"
                    checked={showAdvancedFilters}
                    onCheckedChange={setShowAdvancedFilters}
                  />
                  <Label htmlFor="advanced-filters">Advanced Filters</Label>
                </div>
              </div>

              {showAdvancedFilters && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 border-t">
                  <div>
                    <Label>Min Lead Score</Label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={filters.minScore}
                      onChange={(e) => setFilters({ ...filters, minScore: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Max Lead Score</Label>
                    <Input
                      type="number"
                      placeholder="100"
                      value={filters.maxScore}
                      onChange={(e) => setFilters({ ...filters, maxScore: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Min Estimated Value</Label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={filters.minValue}
                      onChange={(e) => setFilters({ ...filters, minValue: e.target.value })}
                    />
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Dashboard Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="scoring">Lead Scoring</TabsTrigger>
          <TabsTrigger value="funnel">Lifecycle</TabsTrigger>
          <TabsTrigger value="nurturing">Nurturing</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Score Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Lead Score Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={scoreDistribution}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="range" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="count" fill="#3b82f6" name="Total Leads" />
                      <Bar dataKey="qualified" fill="#10b981" name="Qualified" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Temperature Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieIcon className="h-5 w-5" />
                  Lead Temperature
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={Object.entries(analytics?.temperatureDistribution || {}).map(([temp, count]) => ({
                          name: temp,
                          value: count,
                          fill: temp === 'hot' ? '#ef4444' : temp === 'warm' ? '#f59e0b' : '#3b82f6'
                        }))}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => 
                          `${name} ${(percent * 100).toFixed(0)}%`
                        }
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {Object.entries(analytics?.temperatureDistribution || {}).map((_, index) => (
                          <Cell key={`cell-${index}`} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => formatNumber(value as number)} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Source Performance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Source Performance Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Source</TableHead>
                      <TableHead className="text-right">Total Leads</TableHead>
                      <TableHead className="text-right">Qualified</TableHead>
                      <TableHead className="text-right">Converted</TableHead>
                      <TableHead className="text-right">Qualification Rate</TableHead>
                      <TableHead className="text-right">Conversion Rate</TableHead>
                      <TableHead className="text-right">Total Value</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Object.entries(analytics?.sourcePerformance || {}).map(([source, data]) => (
                      <TableRow key={source}>
                        <TableCell className="font-medium">{source}</TableCell>
                        <TableCell className="text-right">
                          {formatNumber(data.total)}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatNumber(data.qualified)}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatNumber(data.converted)}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatPercentage(data.total > 0 ? data.qualified / data.total : 0)}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatPercentage(data.total > 0 ? data.converted / data.total : 0)}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(data.totalValue)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Lead Scoring Tab */}
        <TabsContent value="scoring" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Scoring Model Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  Scoring Models
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {scoringModels.map((model, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold">{model.name}</h4>
                        <Badge variant="outline">
                          Weight: {formatPercentage(model.weight)}
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        {model.criteria.map((criterion, cIndex) => (
                          <div key={cIndex} className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">
                              {criterion.category}: {criterion.factor}
                            </span>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{criterion.score}</span>
                              <Progress value={criterion.weight * 100} className="w-16 h-2" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Top Scoring Leads */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  High-Value Leads
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {topLeads.slice(0, 10).map((lead, index) => (
                    <div key={lead.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="flex-shrink-0">
                          <div className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold",
                            TEMPERATURE_CONFIG[lead.temperature].color
                          )}>
                            {lead.leadScore}
                          </div>
                        </div>
                        <div>
                          <p className="font-medium text-sm">
                            {lead.firstName} {lead.lastName}
                          </p>
                          <p className="text-xs text-gray-500">
                            {lead.company} • {lead.source}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge 
                          variant="outline" 
                          className={LEAD_STATUS_CONFIG[lead.status].color}
                        >
                          {lead.status}
                        </Badge>
                        <p className="text-xs text-gray-500 mt-1">
                          {formatCurrency(lead.estimatedValue)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Lifecycle Funnel Tab */}
        <TabsContent value="funnel" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Lead Lifecycle Funnel
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <FunnelChart>
                      <Tooltip />
                      <Funnel
                        dataKey="leads"
                        data={funnelData}
                        isAnimationActive
                      >
                        <LabelList position="center" fill="#fff" stroke="none" />
                      </Funnel>
                    </FunnelChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-4">
                  {funnelData.map((stage, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{stage.stage}</h4>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">
                            {formatPercentage(stage.conversionRate)}
                          </Badge>
                          <Badge variant="secondary">
                            {formatDuration(stage.averageTime)}
                          </Badge>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                        <div>
                          <span className="text-gray-600">Leads:</span>
                          <span className="font-medium ml-1">
                            {formatNumber(stage.leads)}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">Conversions:</span>
                          <span className="font-medium ml-1">
                            {formatNumber(stage.conversions)}
                          </span>
                        </div>
                      </div>
                      <Progress 
                        value={stage.conversionRate * 100} 
                        className="h-2" 
                      />
                      {stage.dropOffReasons.length > 0 && (
                        <div className="mt-3 pt-3 border-t">
                          <p className="text-xs text-gray-600 mb-2">Drop-off reasons:</p>
                          <div className="space-y-1">
                            {stage.dropOffReasons.slice(0, 3).map((reason, rIndex) => (
                              <div key={rIndex} className="flex justify-between text-xs">
                                <span className="text-gray-500">{reason.reason}</span>
                                <span className="font-medium">{reason.count}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Nurturing Tab */}
        <TabsContent value="nurturing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Nurturing Workflows Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {workflows.map((workflow, index) => (
                  <div key={workflow.id} className="border rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold">{workflow.name}</h3>
                        <p className="text-sm text-gray-600">{workflow.description}</p>
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <div className="text-center">
                          <p className="font-semibold">{formatNumber(workflow.totalLeads)}</p>
                          <p className="text-gray-500">Total</p>
                        </div>
                        <div className="text-center">
                          <p className="font-semibold text-blue-600">{formatNumber(workflow.activeLeads)}</p>
                          <p className="text-gray-500">Active</p>
                        </div>
                        <div className="text-center">
                          <p className="font-semibold text-green-600">{formatPercentage(workflow.completionRate)}</p>
                          <p className="text-gray-500">Success</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-4">
                      {workflow.stages.map((stage, stageIndex) => (
                        <div key={stageIndex} className="p-4 border rounded-lg">
                          <h4 className="font-medium mb-2">{stage.name}</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Duration:</span>
                              <span className="font-medium">
                                {formatDuration(stage.duration)}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Success Rate:</span>
                              <span className={cn(
                                "font-medium",
                                stage.successRate > 0.7 ? "text-green-600" :
                                stage.successRate > 0.4 ? "text-yellow-600" : "text-red-600"
                              )}>
                                {formatPercentage(stage.successRate)}
                              </span>
                            </div>
                            <div className="mt-2">
                              <p className="text-xs text-gray-500 mb-1">Actions:</p>
                              <div className="flex flex-wrap gap-1">
                                {stage.actions.slice(0, 2).map((action, aIndex) => (
                                  <Badge key={aIndex} variant="secondary" className="text-xs">
                                    {action}
                                  </Badge>
                                ))}
                                {stage.actions.length > 2 && (
                                  <Badge variant="secondary" className="text-xs">
                                    +{stage.actions.length - 2}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="mt-4 pt-4 border-t">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-4">
                          <span className="text-gray-600">Triggers:</span>
                          <div className="flex flex-wrap gap-1">
                            {workflow.triggers.map((trigger, tIndex) => (
                              <Badge key={tIndex} variant="outline" className="text-xs">
                                {trigger}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div className="text-gray-600">
                          Avg Conversion Time: {formatDuration(workflow.averageConversionTime)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Engagement Metrics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Engagement Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={leads.slice(0, 30)}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="firstName" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="emailOpens" 
                        stroke="#3b82f6" 
                        name="Email Opens"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="websiteVisits" 
                        stroke="#10b981" 
                        name="Website Visits"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="formSubmissions" 
                        stroke="#f59e0b" 
                        name="Form Submissions"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Lead Value vs Score */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Value vs Score Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart data={leads.slice(0, 50)}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="leadScore" name="Lead Score" />
                      <YAxis dataKey="estimatedValue" name="Estimated Value" />
                      <Tooltip 
                        formatter={(value, name) => [
                          name === 'estimatedValue' ? formatCurrency(value as number) : value,
                          name === 'estimatedValue' ? 'Value' : 'Score'
                        ]}
                        labelFormatter={() => ''}
                      />
                      <Scatter 
                        name="Leads" 
                        dataKey="estimatedValue" 
                        fill="#8b5cf6"
                      />
                    </ScatterChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Lead Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Table className="h-5 w-5" />
                Lead Performance Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Lead</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Temperature</TableHead>
                      <TableHead className="text-right">Score</TableHead>
                      <TableHead className="text-right">Value</TableHead>
                      <TableHead className="text-right">Days in Pipeline</TableHead>
                      <TableHead className="text-right">Touchpoints</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {topLeads.slice(0, 15).map((lead) => (
                      <TableRow key={lead.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">
                              {lead.firstName} {lead.lastName}
                            </p>
                            <p className="text-sm text-gray-500">
                              {lead.email}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant="outline" 
                            className={LEAD_STATUS_CONFIG[lead.status].color}
                          >
                            {lead.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className={cn(
                            "flex items-center gap-1 px-2 py-1 rounded-full w-fit text-xs",
                            TEMPERATURE_CONFIG[lead.temperature].color
                          )}>
                            {React.createElement(TEMPERATURE_CONFIG[lead.temperature].icon, { className: "h-3 w-3" })}
                            {lead.temperature}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <span className={cn("font-medium", getScoreColor(lead.leadScore))}>
                            {lead.leadScore}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(lead.estimatedValue)}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatDuration(lead.daysInPipeline)}
                        </TableCell>
                        <TableCell className="text-right">
                          {lead.touchpointCount}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button size="sm" variant="outline">
                              <Eye className="h-3 w-3" />
                            </Button>
                            <Button size="sm" variant="outline">
                              <Edit className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}