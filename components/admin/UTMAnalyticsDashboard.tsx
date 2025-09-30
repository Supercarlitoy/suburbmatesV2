'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  BarChart3,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  MousePointer,
  ExternalLink,
  RefreshCw,
  Download,
  Filter,
  Calendar,
  Target,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  Globe,
  Share2,
  Mail,
  MessageSquare,
  Search,
  ShoppingCart,
  Star,
  Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface UTMCampaign {
  id: string;
  source: string;
  medium: string;
  campaign: string;
  term?: string;
  content?: string;
  
  // Analytics data
  clicks: number;
  sessions: number;
  users: number;
  pageviews: number;
  avgSessionDuration: number; // in seconds
  bounceRate: number; // percentage
  
  // Business metrics
  profileViews: number;
  contactFormSubmissions: number;
  phoneClicks: number;
  websiteClicks: number;
  
  // Conversion data
  leadGenerated: number;
  businessRegistrations: number;
  conversionRate: number; // percentage
  
  // ROI calculations
  estimatedValue: number;
  costPerClick?: number;
  totalSpent?: number;
  roi?: number; // percentage
  
  // Timeframe
  startDate: string;
  endDate?: string;
  lastActivity: string;
  isActive: boolean;
}

interface UTMAnalytics {
  totalCampaigns: number;
  activeCampaigns: number;
  totalClicks: number;
  totalConversions: number;
  averageConversionRate: number;
  totalEstimatedValue: number;
  
  // Top performers
  topSources: Array<{
    source: string;
    clicks: number;
    conversions: number;
    conversionRate: number;
    estimatedValue: number;
  }>;
  
  topMediums: Array<{
    medium: string;
    clicks: number;
    conversions: number;
    conversionRate: number;
    estimatedValue: number;
  }>;
  
  // Trends
  dailyMetrics: Array<{
    date: string;
    clicks: number;
    sessions: number;
    conversions: number;
    estimatedValue: number;
  }>;
  
  // Attribution analysis
  conversionPaths: Array<{
    path: string[];
    conversions: number;
    averageTimeToConversion: number; // in days
  }>;
}

interface UTMAnalyticsDashboardProps {
  className?: string;
  campaignId?: string; // If provided, shows single campaign view
  dateRange?: {
    start: string;
    end: string;
  };
}

export default function UTMAnalyticsDashboard({ 
  className,
  campaignId,
  dateRange 
}: UTMAnalyticsDashboardProps) {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d' | 'custom'>('30d');
  const [activeTab, setActiveTab] = useState<'overview' | 'campaigns' | 'attribution' | 'sources'>('overview');
  const [analytics, setAnalytics] = useState<UTMAnalytics | null>(null);
  const [campaigns, setCampaigns] = useState<UTMCampaign[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<UTMCampaign | null>(null);

  // Fetch UTM analytics data
  const fetchAnalytics = async (showLoader = true) => {
    if (showLoader) setLoading(true);
    else setRefreshing(true);

    try {
      const params = new URLSearchParams({
        period: selectedPeriod
      });

      if (dateRange) {
        params.append('startDate', dateRange.start);
        params.append('endDate', dateRange.end);
      }

      if (campaignId) {
        params.append('campaignId', campaignId);
      }

      const [analyticsResponse, campaignResponse] = await Promise.all([
        fetch(`/api/admin/analytics/utm?${params}`),
        fetch(`/api/admin/analytics/utm/campaigns?${params}`)
      ]);

      if (!analyticsResponse.ok || !campaignResponse.ok) {
        throw new Error('Failed to fetch analytics data');
      }

      const [analyticsData, campaignData] = await Promise.all([
        analyticsResponse.json(),
        campaignResponse.json()
      ]);

      setAnalytics(analyticsData.analytics);
      setCampaigns(campaignData.campaigns);

      if (campaignId && campaignData.campaigns.length > 0) {
        setSelectedCampaign(campaignData.campaigns.find((c: UTMCampaign) => c.id === campaignId) || null);
      }
    } catch (error) {
      console.error('Error fetching UTM analytics:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [selectedPeriod, campaignId, dateRange]);

  // Get source icon
  const getSourceIcon = (source: string) => {
    const lowerSource = source.toLowerCase();
    
    if (lowerSource.includes('google')) return <Search className="h-4 w-4 text-blue-600" />;
    if (lowerSource.includes('facebook')) return <Globe className="h-4 w-4 text-blue-800" />;
    if (lowerSource.includes('instagram')) return <Globe className="h-4 w-4 text-pink-600" />;
    if (lowerSource.includes('linkedin')) return <Globe className="h-4 w-4 text-blue-700" />;
    if (lowerSource.includes('twitter')) return <Globe className="h-4 w-4 text-blue-400" />;
    if (lowerSource.includes('email')) return <Mail className="h-4 w-4 text-green-600" />;
    if (lowerSource.includes('sms')) return <MessageSquare className="h-4 w-4 text-purple-600" />;
    if (lowerSource.includes('direct')) return <Globe className="h-4 w-4 text-gray-600" />;
    
    return <Globe className="h-4 w-4 text-gray-500" />;
  };

  // Get medium badge color
  const getMediumBadgeColor = (medium: string) => {
    const lowerMedium = medium.toLowerCase();
    
    if (lowerMedium.includes('cpc') || lowerMedium.includes('paid')) return 'bg-red-100 text-red-700';
    if (lowerMedium.includes('organic')) return 'bg-green-100 text-green-700';
    if (lowerMedium.includes('social')) return 'bg-blue-100 text-blue-700';
    if (lowerMedium.includes('email')) return 'bg-purple-100 text-purple-700';
    if (lowerMedium.includes('referral')) return 'bg-orange-100 text-orange-700';
    
    return 'bg-gray-100 text-gray-700';
  };

  // Get conversion rate color
  const getConversionRateColor = (rate: number) => {
    if (rate >= 5) return 'text-green-600';
    if (rate >= 2) return 'text-yellow-600';
    return 'text-red-600';
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD'
    }).format(amount);
  };

  // Format duration
  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  if (loading) {
    return (
      <div className={cn('space-y-6', className)}>
        <div className="flex items-center justify-center p-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  // Single campaign view
  if (campaignId && selectedCampaign) {
    return (
      <div className={cn('space-y-6', className)}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Campaign Analytics</h2>
            <div className="flex items-center gap-2 mt-1">
              <Badge className="text-xs">{selectedCampaign.source}</Badge>
              <Badge className={cn('text-xs', getMediumBadgeColor(selectedCampaign.medium))}>
                {selectedCampaign.medium}
              </Badge>
              <span className="text-gray-600">•</span>
              <span className="text-gray-600 text-sm">{selectedCampaign.campaign}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchAnalytics(false)}
              disabled={refreshing}
            >
              <RefreshCw className={cn("h-4 w-4 mr-2", refreshing && "animate-spin")} />
              Refresh
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Campaign Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <MousePointer className="h-8 w-8 text-blue-500" />
                <TrendingUp className="h-4 w-4 text-green-500" />
              </div>
              <div className="space-y-1">
                <p className="text-2xl font-bold text-gray-900">
                  {selectedCampaign.clicks.toLocaleString()}
                </p>
                <p className="text-sm text-gray-600">Total Clicks</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <Users className="h-8 w-8 text-green-500" />
                <span className="text-xs text-gray-500">CVR</span>
              </div>
              <div className="space-y-1">
                <p className="text-2xl font-bold text-gray-900">
                  {selectedCampaign.leadGenerated}
                </p>
                <p className="text-sm text-gray-600">Conversions</p>
                <p className={cn('text-xs font-medium', getConversionRateColor(selectedCampaign.conversionRate))}>
                  {selectedCampaign.conversionRate}% conversion rate
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <DollarSign className="h-8 w-8 text-yellow-500" />
                {selectedCampaign.roi && selectedCampaign.roi > 0 ? (
                  <ArrowUpRight className="h-4 w-4 text-green-500" />
                ) : (
                  <ArrowDownRight className="h-4 w-4 text-red-500" />
                )}
              </div>
              <div className="space-y-1">
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(selectedCampaign.estimatedValue)}
                </p>
                <p className="text-sm text-gray-600">Estimated Value</p>
                {selectedCampaign.roi && (
                  <p className={cn('text-xs font-medium', selectedCampaign.roi > 0 ? 'text-green-600' : 'text-red-600')}>
                    {selectedCampaign.roi > 0 ? '+' : ''}{selectedCampaign.roi}% ROI
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <Eye className="h-8 w-8 text-purple-500" />
                <span className="text-xs text-gray-500">Bounce: {selectedCampaign.bounceRate}%</span>
              </div>
              <div className="space-y-1">
                <p className="text-2xl font-bold text-gray-900">
                  {selectedCampaign.profileViews}
                </p>
                <p className="text-sm text-gray-600">Profile Views</p>
                <p className="text-xs text-gray-500">
                  Avg. session: {formatDuration(selectedCampaign.avgSessionDuration)}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Campaign Performance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Contact Form Submissions</span>
                  <span className="font-medium">{selectedCampaign.contactFormSubmissions}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Phone Clicks</span>
                  <span className="font-medium">{selectedCampaign.phoneClicks}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Website Clicks</span>
                  <span className="font-medium">{selectedCampaign.websiteClicks}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Business Registrations</span>
                  <span className="font-medium">{selectedCampaign.businessRegistrations}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Campaign Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Status</span>
                  <Badge className={selectedCampaign.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}>
                    {selectedCampaign.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Start Date</span>
                  <span className="font-medium">{new Date(selectedCampaign.startDate).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Last Activity</span>
                  <span className="font-medium">{new Date(selectedCampaign.lastActivity).toLocaleDateString()}</span>
                </div>
                {selectedCampaign.costPerClick && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Cost per Click</span>
                    <span className="font-medium">{formatCurrency(selectedCampaign.costPerClick)}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Overview dashboard
  if (analytics) {
    return (
      <div className={cn('space-y-6', className)}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">UTM Analytics Dashboard</h2>
            <p className="text-gray-600 mt-1">Marketing campaign performance and attribution</p>
          </div>
          <div className="flex items-center gap-2">
            <Select value={selectedPeriod} onValueChange={(value: any) => setSelectedPeriod(value)}>
              <SelectTrigger className="w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
                <SelectItem value="custom">Custom range</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchAnalytics(false)}
              disabled={refreshing}
            >
              <RefreshCw className={cn("h-4 w-4 mr-2", refreshing && "animate-spin")} />
              Refresh
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={(value: any) => setActiveTab(value)}>
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
            <TabsTrigger value="sources">Sources</TabsTrigger>
            <TabsTrigger value="attribution">Attribution</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <Target className="h-8 w-8 text-blue-500" />
                    <TrendingUp className="h-4 w-4 text-green-500" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-2xl font-bold text-gray-900">{analytics.activeCampaigns}</p>
                    <p className="text-sm text-gray-600">Active Campaigns</p>
                    <p className="text-xs text-gray-500">of {analytics.totalCampaigns} total</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <MousePointer className="h-8 w-8 text-green-500" />
                    <span className="text-xs text-gray-500">Clicks</span>
                  </div>
                  <div className="space-y-1">
                    <p className="text-2xl font-bold text-gray-900">
                      {analytics.totalClicks.toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-600">Total Clicks</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <Users className="h-8 w-8 text-purple-500" />
                    <span className={cn('text-xs font-medium', getConversionRateColor(analytics.averageConversionRate))}>
                      {analytics.averageConversionRate}%
                    </span>
                  </div>
                  <div className="space-y-1">
                    <p className="text-2xl font-bold text-gray-900">{analytics.totalConversions}</p>
                    <p className="text-sm text-gray-600">Total Conversions</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <DollarSign className="h-8 w-8 text-yellow-500" />
                    <ArrowUpRight className="h-4 w-4 text-green-500" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-2xl font-bold text-gray-900">
                      {formatCurrency(analytics.totalEstimatedValue)}
                    </p>
                    <p className="text-sm text-gray-600">Estimated Value</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Top Sources and Mediums */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Top Sources</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analytics.topSources.map((source, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {getSourceIcon(source.source)}
                          <div>
                            <p className="font-medium text-gray-900">{source.source}</p>
                            <p className="text-xs text-gray-500">
                              {source.clicks.toLocaleString()} clicks • {source.conversions} conversions
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-gray-900">{formatCurrency(source.estimatedValue)}</p>
                          <p className={cn('text-xs', getConversionRateColor(source.conversionRate))}>
                            {source.conversionRate}% CVR
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Top Mediums</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analytics.topMediums.map((medium, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Badge className={cn('text-xs', getMediumBadgeColor(medium.medium))}>
                            {medium.medium}
                          </Badge>
                          <div>
                            <p className="text-xs text-gray-500">
                              {medium.clicks.toLocaleString()} clicks • {medium.conversions} conversions
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-gray-900">{formatCurrency(medium.estimatedValue)}</p>
                          <p className={cn('text-xs', getConversionRateColor(medium.conversionRate))}>
                            {medium.conversionRate}% CVR
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="campaigns" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>All Campaigns</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Campaign</TableHead>
                      <TableHead>Source/Medium</TableHead>
                      <TableHead>Clicks</TableHead>
                      <TableHead>Conversions</TableHead>
                      <TableHead>CVR</TableHead>
                      <TableHead>Est. Value</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {campaigns.map((campaign) => (
                      <TableRow key={campaign.id}>
                        <TableCell className="font-medium">{campaign.campaign}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getSourceIcon(campaign.source)}
                            <span className="text-sm">{campaign.source}</span>
                            <Badge className={cn('text-xs', getMediumBadgeColor(campaign.medium))}>
                              {campaign.medium}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>{campaign.clicks.toLocaleString()}</TableCell>
                        <TableCell>{campaign.leadGenerated}</TableCell>
                        <TableCell className={getConversionRateColor(campaign.conversionRate)}>
                          {campaign.conversionRate}%
                        </TableCell>
                        <TableCell>{formatCurrency(campaign.estimatedValue)}</TableCell>
                        <TableCell>
                          <Badge className={campaign.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}>
                            {campaign.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm">
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sources" className="space-y-6">
            <div className="text-center py-8 text-gray-500">
              <BarChart3 className="h-12 w-12 mx-auto mb-2 text-gray-300" />
              <p>Detailed source analysis will be displayed here</p>
              <p className="text-xs">Channel performance breakdown and insights</p>
            </div>
          </TabsContent>

          <TabsContent value="attribution" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Conversion Attribution Paths</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.conversionPaths.map((path, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">Path {index + 1}</span>
                          <Badge variant="outline" className="text-xs">
                            {path.conversions} conversions
                          </Badge>
                        </div>
                        <span className="text-xs text-gray-500">
                          Avg. {path.averageTimeToConversion} days to convert
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {path.path.map((touchpoint, touchIndex) => (
                          <React.Fragment key={touchIndex}>
                            <Badge variant="outline" className="text-xs">
                              {touchpoint}
                            </Badge>
                            {touchIndex < path.path.length - 1 && (
                              <ArrowUpRight className="h-3 w-3 text-gray-400" />
                            )}
                          </React.Fragment>
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

  return null;
}