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
  BarChart3,
  PieChart as PieIcon,
  Target,
  DollarSign,
  Users,
  MousePointer,
  Eye,
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
  Globe,
  Mail,
  Search,
  Share2,
  Phone,
  MessageCircle,
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  Linkedin
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface UTMCampaignData {
  // UTM Parameters
  utm_source: string;
  utm_medium: string;
  utm_campaign: string;
  utm_content?: string;
  utm_term?: string;

  // Performance Metrics
  sessions: number;
  users: number;
  newUsers: number;
  pageviews: number;
  bounceRate: number;
  avgSessionDuration: number;
  
  // Conversion Metrics
  leads: number;
  conversions: number;
  conversionRate: number;
  leadQualityScore: number;
  costPerLead: number;
  customerLifetimeValue: number;
  
  // Attribution Data
  firstTouchAttributions: number;
  lastTouchAttributions: number;
  assistedConversions: number;
  attributionValue: number;
  
  // Time Series Data
  dateRange: string;
  timestamp: string;
  
  // Financial Metrics
  adSpend: number;
  revenue: number;
  roi: number;
  roas: number;
}

interface ConversionFunnelData {
  stage: string;
  visitors: number;
  conversions: number;
  conversionRate: number;
  dropoffRate: number;
  averageTimeInStage: number;
}

interface AttributionModelData {
  model: 'first-touch' | 'last-touch' | 'linear' | 'time-decay' | 'position-based';
  modelName: string;
  conversions: number;
  revenue: number;
  weight: number;
}

interface CampaignOptimization {
  campaign: string;
  currentPerformance: {
    cpl: number;
    conversionRate: number;
    roi: number;
  };
  recommendations: {
    type: 'budget' | 'targeting' | 'creative' | 'bidding' | 'audience';
    recommendation: string;
    expectedImpact: string;
    priority: 'high' | 'medium' | 'low';
    potentialGains: {
      cplReduction?: number;
      conversionIncrease?: number;
      roiImprovement?: number;
    };
  }[];
}

interface UTMAnalyticsDashboardProps {
  className?: string;
}

const CHART_COLORS = [
  '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
  '#06b6d4', '#84cc16', '#f97316', '#ec4899', '#6b7280'
];

export default function UTMAnalyticsDashboard({ className }: UTMAnalyticsDashboardProps) {
  // State Management
  const [utmData, setUtmData] = useState<UTMCampaignData[]>([]);
  const [funnelData, setFunnelData] = useState<ConversionFunnelData[]>([]);
  const [attributionData, setAttributionData] = useState<AttributionModelData[]>([]);
  const [optimizationData, setOptimizationData] = useState<CampaignOptimization[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // UI State
  const [activeTab, setActiveTab] = useState('overview');
  const [dateRange, setDateRange] = useState('30d');
  const [selectedSource, setSelectedSource] = useState('all');
  const [selectedMedium, setSelectedMedium] = useState('all');
  const [selectedCampaign, setSelectedCampaign] = useState('all');
  const [comparisonMode, setComparisonMode] = useState(false);
  const [selectedAttributionModel, setSelectedAttributionModel] = useState<string>('last-touch');

  // Filter State
  const [filters, setFilters] = useState({
    minSessions: '',
    minConversions: '',
    minSpend: '',
    sortBy: 'sessions',
    sortOrder: 'desc' as 'asc' | 'desc'
  });

  // Fetch UTM Analytics Data
  const fetchUTMData = useCallback(async (showLoader = true) => {
    if (showLoader) setLoading(true);
    if (!showLoader) setRefreshing(true);

    try {
      const queryParams = new URLSearchParams({
        dateRange,
        source: selectedSource,
        medium: selectedMedium,
        campaign: selectedCampaign,
        ...filters
      });

      const response = await fetch(`/api/admin/analytics/utm?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('supabase_access_token')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUtmData(data.campaigns || []);
        setFunnelData(data.funnel || []);
        setAttributionData(data.attribution || []);
        setOptimizationData(data.optimizations || []);
      } else {
        console.error('Failed to fetch UTM analytics:', response.statusText);
      }
    } catch (error) {
      console.error('Error fetching UTM analytics:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [dateRange, selectedSource, selectedMedium, selectedCampaign, filters]);

  // Initial load and data refresh
  useEffect(() => {
    fetchUTMData();
  }, [fetchUTMData]);

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

  const getTrendIcon = (current: number, previous: number) => {
    if (current > previous) return <ArrowUp className="h-3 w-3 text-green-500" />;
    if (current < previous) return <ArrowDown className="h-3 w-3 text-red-500" />;
    return <Minus className="h-3 w-3 text-gray-500" />;
  };

  const getChannelIcon = (medium: string) => {
    const iconMap: { [key: string]: React.ReactNode } = {
      email: <Mail className="h-4 w-4" />,
      social: <Share2 className="h-4 w-4" />,
      organic: <Search className="h-4 w-4" />,
      paid: <Target className="h-4 w-4" />,
      referral: <ExternalLink className="h-4 w-4" />,
      direct: <Globe className="h-4 w-4" />,
      facebook: <Facebook className="h-4 w-4" />,
      google: <Search className="h-4 w-4" />,
      youtube: <Youtube className="h-4 w-4" />,
      linkedin: <Linkedin className="h-4 w-4" />
    };
    return iconMap[medium.toLowerCase()] || <Globe className="h-4 w-4" />;
  };

  // Computed Metrics
  const summaryMetrics = useMemo(() => {
    if (!utmData.length) return null;

    const totals = utmData.reduce((acc, campaign) => ({
      sessions: acc.sessions + campaign.sessions,
      users: acc.users + campaign.users,
      leads: acc.leads + campaign.leads,
      conversions: acc.conversions + campaign.conversions,
      adSpend: acc.adSpend + campaign.adSpend,
      revenue: acc.revenue + campaign.revenue
    }), { sessions: 0, users: 0, leads: 0, conversions: 0, adSpend: 0, revenue: 0 });

    return {
      ...totals,
      conversionRate: totals.sessions > 0 ? totals.conversions / totals.sessions : 0,
      costPerLead: totals.leads > 0 ? totals.adSpend / totals.leads : 0,
      roi: totals.adSpend > 0 ? (totals.revenue - totals.adSpend) / totals.adSpend : 0,
      roas: totals.adSpend > 0 ? totals.revenue / totals.adSpend : 0
    };
  }, [utmData]);

  // Top Performing Campaigns
  const topCampaigns = useMemo(() => {
    return [...utmData]
      .sort((a, b) => {
        switch (filters.sortBy) {
          case 'sessions': return b.sessions - a.sessions;
          case 'conversions': return b.conversions - a.conversions;
          case 'roi': return b.roi - a.roi;
          case 'spend': return b.adSpend - a.adSpend;
          default: return b.sessions - a.sessions;
        }
      })
      .slice(0, 10);
  }, [utmData, filters.sortBy]);

  if (loading) {
    return (
      <div className={cn("space-y-6", className)}>
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center space-x-2">
            <RefreshCw className="h-5 w-5 animate-spin text-blue-500" />
            <span className="text-sm text-gray-600">Loading UTM analytics...</span>
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
            <h1 className="text-3xl font-bold text-gray-900">UTM Analytics Dashboard</h1>
            <p className="text-gray-600">
              Track campaign performance, attribution, and optimization opportunities
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
              onClick={() => fetchUTMData(false)}
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
        {summaryMetrics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Sessions</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {formatNumber(summaryMetrics.sessions)}
                    </p>
                  </div>
                  <Users className="h-8 w-8 text-blue-500" />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {formatNumber(summaryMetrics.users)} unique users
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Conversions</p>
                    <p className="text-2xl font-bold text-green-600">
                      {formatNumber(summaryMetrics.conversions)}
                    </p>
                  </div>
                  <Target className="h-8 w-8 text-green-500" />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {formatPercentage(summaryMetrics.conversionRate)} conversion rate
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Cost Per Lead</p>
                    <p className="text-2xl font-bold text-orange-600">
                      {formatCurrency(summaryMetrics.costPerLead)}
                    </p>
                  </div>
                  <DollarSign className="h-8 w-8 text-orange-500" />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {formatNumber(summaryMetrics.leads)} total leads
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">ROI</p>
                    <p className={cn("text-2xl font-bold", 
                      summaryMetrics.roi > 0 ? "text-green-600" : "text-red-600"
                    )}>
                      {formatPercentage(summaryMetrics.roi)}
                    </p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-purple-500" />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {formatCurrency(summaryMetrics.revenue)} revenue
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filter Controls */}
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <Label>UTM Source</Label>
                <Select value={selectedSource} onValueChange={setSelectedSource}>
                  <SelectTrigger>
                    <SelectValue placeholder="All sources" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Sources</SelectItem>
                    <SelectItem value="google">Google</SelectItem>
                    <SelectItem value="facebook">Facebook</SelectItem>
                    <SelectItem value="linkedin">LinkedIn</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="organic">Organic</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>UTM Medium</Label>
                <Select value={selectedMedium} onValueChange={setSelectedMedium}>
                  <SelectTrigger>
                    <SelectValue placeholder="All mediums" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Mediums</SelectItem>
                    <SelectItem value="cpc">CPC</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="social">Social</SelectItem>
                    <SelectItem value="organic">Organic</SelectItem>
                    <SelectItem value="referral">Referral</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Campaign</Label>
                <Select value={selectedCampaign} onValueChange={setSelectedCampaign}>
                  <SelectTrigger>
                    <SelectValue placeholder="All campaigns" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Campaigns</SelectItem>
                    {[...new Set(utmData.map(d => d.utm_campaign))].map(campaign => (
                      <SelectItem key={campaign} value={campaign}>
                        {campaign}
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
                    <SelectItem value="sessions">Sessions</SelectItem>
                    <SelectItem value="conversions">Conversions</SelectItem>
                    <SelectItem value="roi">ROI</SelectItem>
                    <SelectItem value="spend">Ad Spend</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Dashboard Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="attribution">Attribution</TabsTrigger>
          <TabsTrigger value="funnel">Conversion Funnel</TabsTrigger>
          <TabsTrigger value="optimization">Optimization</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Performance Trends */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Performance Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={utmData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="timestamp" 
                        tickFormatter={(value) => new Date(value).toLocaleDateString()}
                      />
                      <YAxis yAxisId="left" />
                      <YAxis yAxisId="right" orientation="right" />
                      <Tooltip 
                        labelFormatter={(value) => new Date(value).toLocaleDateString()}
                      />
                      <Legend />
                      <Line 
                        yAxisId="left"
                        type="monotone" 
                        dataKey="sessions" 
                        stroke="#3b82f6" 
                        strokeWidth={2}
                        name="Sessions"
                      />
                      <Line 
                        yAxisId="left"
                        type="monotone" 
                        dataKey="conversions" 
                        stroke="#10b981" 
                        strokeWidth={2}
                        name="Conversions"
                      />
                      <Line 
                        yAxisId="right"
                        type="monotone" 
                        dataKey="roi" 
                        stroke="#f59e0b" 
                        strokeWidth={2}
                        name="ROI %"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Channel Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieIcon className="h-5 w-5" />
                  Traffic by Channel
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={utmData.slice(0, 6)}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ utm_medium, percent }) => 
                          `${utm_medium} ${(percent * 100).toFixed(0)}%`
                        }
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="sessions"
                      >
                        {utmData.slice(0, 6).map((_, index) => (
                          <Cell key={`cell-${index}`} fill={CHART_COLORS[index]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => formatNumber(value as number)} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Top Performing Sources */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Top Performing Sources
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topCampaigns}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="utm_source" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="sessions" fill="#3b82f6" name="Sessions" />
                    <Bar dataKey="conversions" fill="#10b981" name="Conversions" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Campaigns Tab */}
        <TabsContent value="campaigns" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Campaign Performance Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Campaign</TableHead>
                      <TableHead>Source/Medium</TableHead>
                      <TableHead className="text-right">Sessions</TableHead>
                      <TableHead className="text-right">Users</TableHead>
                      <TableHead className="text-right">Conversions</TableHead>
                      <TableHead className="text-right">Conv. Rate</TableHead>
                      <TableHead className="text-right">Cost/Lead</TableHead>
                      <TableHead className="text-right">ROI</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {topCampaigns.map((campaign, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{campaign.utm_campaign}</Badge>
                            {campaign.utm_content && (
                              <Badge variant="secondary" className="text-xs">
                                {campaign.utm_content}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getChannelIcon(campaign.utm_medium)}
                            <span className="text-sm">
                              {campaign.utm_source} / {campaign.utm_medium}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          {formatNumber(campaign.sessions)}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatNumber(campaign.users)}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatNumber(campaign.conversions)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            {formatPercentage(campaign.conversionRate)}
                            {getTrendIcon(campaign.conversionRate, 0.02)}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(campaign.costPerLead)}
                        </TableCell>
                        <TableCell className="text-right">
                          <span className={cn(
                            "font-medium",
                            campaign.roi > 0 ? "text-green-600" : "text-red-600"
                          )}>
                            {formatPercentage(campaign.roi)}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Attribution Tab */}
        <TabsContent value="attribution" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Attribution Model Comparison */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Attribution Models
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {attributionData.map((model, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{model.modelName}</h4>
                        <Badge variant="outline">
                          {formatNumber(model.conversions)} conversions
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <span>Revenue: {formatCurrency(model.revenue)}</span>
                        <span>Weight: {formatPercentage(model.weight)}</span>
                      </div>
                      <Progress value={model.weight * 100} className="mt-2 h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Attribution Analysis */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Attribution Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={attributionData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="modelName" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="conversions" fill="#3b82f6" name="Conversions" />
                      <Bar dataKey="revenue" fill="#10b981" name="Revenue" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Attribution Journey */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ArrowUp className="h-5 w-5" />
                Customer Journey Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-medium text-blue-900">First Touch</h4>
                    <p className="text-2xl font-bold text-blue-600">
                      {formatNumber(utmData.reduce((sum, d) => sum + d.firstTouchAttributions, 0))}
                    </p>
                    <p className="text-sm text-blue-700">Initial discoveries</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <h4 className="font-medium text-green-900">Assisted</h4>
                    <p className="text-2xl font-bold text-green-600">
                      {formatNumber(utmData.reduce((sum, d) => sum + d.assistedConversions, 0))}
                    </p>
                    <p className="text-sm text-green-700">Journey touchpoints</p>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <h4 className="font-medium text-purple-900">Last Touch</h4>
                    <p className="text-2xl font-bold text-purple-600">
                      {formatNumber(utmData.reduce((sum, d) => sum + d.lastTouchAttributions, 0))}
                    </p>
                    <p className="text-sm text-purple-700">Final conversions</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Conversion Funnel Tab */}
        <TabsContent value="funnel" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingDown className="h-5 w-5" />
                Conversion Funnel Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <FunnelChart>
                      <Tooltip />
                      <Funnel
                        dataKey="visitors"
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
                        <Badge variant="outline">
                          {formatPercentage(stage.conversionRate)}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Visitors:</span>
                          <span className="font-medium ml-1">
                            {formatNumber(stage.visitors)}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">Dropoff:</span>
                          <span className="font-medium ml-1 text-red-600">
                            {formatPercentage(stage.dropoffRate)}
                          </span>
                        </div>
                      </div>
                      <Progress 
                        value={stage.conversionRate * 100} 
                        className="mt-2 h-2" 
                      />
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Optimization Tab */}
        <TabsContent value="optimization" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Campaign Optimization Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {optimizationData.map((campaign, index) => (
                  <div key={index} className="border rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold">{campaign.campaign}</h3>
                      <div className="flex items-center gap-4 text-sm">
                        <span>CPL: {formatCurrency(campaign.currentPerformance.cpl)}</span>
                        <span>Conv Rate: {formatPercentage(campaign.currentPerformance.conversionRate)}</span>
                        <span className={cn(
                          campaign.currentPerformance.roi > 0 ? "text-green-600" : "text-red-600"
                        )}>
                          ROI: {formatPercentage(campaign.currentPerformance.roi)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                      {campaign.recommendations.map((rec, recIndex) => (
                        <div key={recIndex} className="p-4 border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <Badge 
                              variant={rec.priority === 'high' ? 'destructive' : 
                                     rec.priority === 'medium' ? 'default' : 'secondary'}
                            >
                              {rec.priority} priority
                            </Badge>
                            <Badge variant="outline">{rec.type}</Badge>
                          </div>
                          <h4 className="font-medium mb-2">{rec.recommendation}</h4>
                          <p className="text-sm text-gray-600 mb-3">{rec.expectedImpact}</p>
                          
                          {rec.potentialGains && (
                            <div className="space-y-1 text-xs">
                              {rec.potentialGains.cplReduction && (
                                <div className="flex justify-between">
                                  <span>CPL Reduction:</span>
                                  <span className="text-green-600">
                                    -{formatPercentage(rec.potentialGains.cplReduction)}
                                  </span>
                                </div>
                              )}
                              {rec.potentialGains.conversionIncrease && (
                                <div className="flex justify-between">
                                  <span>Conversion Increase:</span>
                                  <span className="text-green-600">
                                    +{formatPercentage(rec.potentialGains.conversionIncrease)}
                                  </span>
                                </div>
                              )}
                              {rec.potentialGains.roiImprovement && (
                                <div className="flex justify-between">
                                  <span>ROI Improvement:</span>
                                  <span className="text-green-600">
                                    +{formatPercentage(rec.potentialGains.roiImprovement)}
                                  </span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}