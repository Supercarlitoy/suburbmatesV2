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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
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
  ComposedChart,
  ScatterChart,
  Scatter
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  BarChart3,
  Activity,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw,
  Download,
  Calendar,
  Clock,
  Target,
  Zap,
  Brain,
  Shield,
  Users,
  Building,
  MapPin,
  Star,
  Award,
  AlertCircle,
  Info,
  Settings,
  Filter,
  Eye,
  ChevronUp,
  ChevronDown,
  ArrowUp,
  ArrowDown,
  Minus,
  Plus,
  Gauge,
  RotateCcw,
  PlayCircle,
  PauseCircle,
  StopCircle,
  Timer,
  Database,
  Server,
  Cpu,
  HardDrive,
  Network,
  Wifi,
  WifiOff,
  Globe,
  FileText,
  Search,
  Calendar as CalendarIcon,
  Hash
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface PerformanceMetrics {
  // Overall System Performance
  systemHealth: {
    overallScore: number; // 0-100
    status: 'healthy' | 'warning' | 'critical';
    uptime: number; // hours
    lastRestart: string;
  };

  // Processing Performance
  processingMetrics: {
    avgProcessingTimeMs: number;
    throughputPerHour: number;
    queueSize: number;
    backlogHours: number;
    concurrentProcessing: number;
    maxConcurrentCapacity: number;
  };

  // Accuracy Metrics
  accuracyMetrics: {
    overallAccuracy: number; // 0-100
    approvalAccuracy: number;
    rejectionAccuracy: number;
    falsePositives: number;
    falseNegatives: number;
    adminOverrideRate: number;
    confidenceCalibration: number;
  };

  // Business Impact
  businessMetrics: {
    totalBusinessesProcessed: number;
    autoApprovedCount: number;
    autoRejectedCount: number;
    manualReviewCount: number;
    avgReviewTime: number;
    customerSatisfactionScore: number;
    timeToMarketDays: number;
  };

  // Resource Utilization
  resourceMetrics: {
    cpuUtilization: number;
    memoryUtilization: number;
    diskUtilization: number;
    networkLatency: number;
    apiResponseTime: number;
    cacheHitRate: number;
    databaseConnectionPool: number;
  };

  // Time-based Data
  timeSeriesData: {
    timestamp: string;
    accuracy: number;
    throughput: number;
    processingTime: number;
    queueSize: number;
    errorRate: number;
  }[];

  // Error Analysis
  errorAnalysis: {
    totalErrors: number;
    errorRate: number;
    commonErrors: {
      type: string;
      count: number;
      percentage: number;
      trend: 'increasing' | 'decreasing' | 'stable';
    }[];
    recentErrors: {
      timestamp: string;
      type: string;
      message: string;
      businessId?: string;
      resolved: boolean;
    }[];
  };

  // Category Performance
  categoryPerformance: {
    category: string;
    accuracy: number;
    processingTime: number;
    throughput: number;
    confidenceScore: number;
    manualReviewRate: number;
  }[];

  // Optimization Recommendations
  recommendations: {
    id: string;
    type: 'performance' | 'accuracy' | 'resource' | 'configuration';
    priority: 'high' | 'medium' | 'low';
    title: string;
    description: string;
    expectedImpact: string;
    implementationEffort: 'low' | 'medium' | 'high';
    estimatedTimeToImplement: string;
    potentialGains: {
      accuracy?: number;
      throughput?: number;
      resourceSaving?: number;
    };
  }[];

  // Confidence Distribution
  confidenceDistribution: {
    range: string;
    count: number;
    accuracy: number;
    overrideRate: number;
  }[];

  // Geographic Performance
  geographicPerformance: {
    region: string;
    accuracy: number;
    processingTime: number;
    volumeCount: number;
    complexityScore: number;
  }[];
}

interface AIPerformanceDashboardProps {
  className?: string;
}

const CHART_COLORS = [
  '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
  '#06b6d4', '#84cc16', '#f97316', '#ec4899', '#6b7280'
];

export default function AIPerformanceDashboard({ className }: AIPerformanceDashboardProps) {
  // State management
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(30000); // 30 seconds

  // UI State
  const [activeTab, setActiveTab] = useState('overview');
  const [timeRange, setTimeRange] = useState('24h');
  const [selectedMetric, setSelectedMetric] = useState('accuracy');
  const [showAlerts, setShowAlerts] = useState(true);
  const [comparisonMode, setComparisonMode] = useState(false);

  // Filter state
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [regionFilter, setRegionFilter] = useState('all');
  const [dateRange, setDateRange] = useState({
    from: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    to: new Date().toISOString().split('T')[0]
  });

  // Fetch performance metrics
  const fetchMetrics = useCallback(async (showLoader = true) => {
    if (showLoader) setLoading(true);
    if (!showLoader) setRefreshing(true);

    try {
      const queryParams = new URLSearchParams({
        timeRange,
        categoryFilter,
        regionFilter,
        dateFrom: dateRange.from,
        dateTo: dateRange.to
      });

      const response = await fetch(`/api/admin/ai-automation/performance?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('supabase_access_token')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setMetrics(data);
      } else {
        console.error('Failed to fetch performance metrics:', response.statusText);
      }
    } catch (error) {
      console.error('Error fetching performance metrics:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [timeRange, categoryFilter, regionFilter, dateRange]);

  // Auto-refresh setup
  useEffect(() => {
    fetchMetrics();
    
    if (autoRefresh) {
      const interval = setInterval(() => fetchMetrics(false), refreshInterval);
      return () => clearInterval(interval);
    }
  }, [fetchMetrics, autoRefresh, refreshInterval]);

  // Export performance report
  const exportReport = async () => {
    try {
      const response = await fetch('/api/admin/ai-automation/performance/export', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('supabase_access_token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          timeRange,
          categoryFilter,
          regionFilter,
          dateRange,
          includeRawData: true
        }),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `ai-performance-report-${new Date().toISOString().split('T')[0]}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Error exporting report:', error);
    }
  };

  // Helper functions
  const getHealthStatus = (score: number) => {
    if (score >= 90) return { status: 'healthy', color: 'text-green-600', bgColor: 'bg-green-100' };
    if (score >= 70) return { status: 'warning', color: 'text-yellow-600', bgColor: 'bg-yellow-100' };
    return { status: 'critical', color: 'text-red-600', bgColor: 'bg-red-100' };
  };

  const getTrendIcon = (current: number, previous: number) => {
    if (current > previous) return <ArrowUp className="h-3 w-3 text-green-500" />;
    if (current < previous) return <ArrowDown className="h-3 w-3 text-red-500" />;
    return <Minus className="h-3 w-3 text-gray-500" />;
  };

  const formatDuration = (hours: number) => {
    if (hours < 1) return `${Math.round(hours * 60)}m`;
    if (hours < 24) return `${hours.toFixed(1)}h`;
    return `${Math.round(hours / 24)}d`;
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  if (loading) {
    return (
      <div className={cn("space-y-6", className)}>
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center space-x-2">
            <RefreshCw className="h-5 w-5 animate-spin text-blue-500" />
            <span className="text-sm text-gray-600">Loading performance metrics...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className={cn("space-y-6", className)}>
        <Card>
          <CardContent className="flex items-center justify-center h-64">
            <div className="text-center space-y-3">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
              <h3 className="text-lg font-medium">Failed to Load Performance Metrics</h3>
              <p className="text-sm text-gray-600">Please check your connection and try again.</p>
              <Button onClick={() => fetchMetrics()} variant="outline">
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const healthStatus = getHealthStatus(metrics.systemHealth.overallScore);

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">AI Performance Dashboard</h1>
            <p className="text-gray-600">
              Monitor AI system performance, accuracy, and optimization opportunities
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="flex items-center gap-2">
              <Label className="text-sm">Auto-refresh</Label>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={cn(
                  "flex items-center gap-2",
                  autoRefresh ? "bg-green-50 border-green-200" : ""
                )}
              >
                {autoRefresh ? <PlayCircle className="h-4 w-4 text-green-500" /> : <PauseCircle className="h-4 w-4" />}
                {autoRefresh ? 'ON' : 'OFF'}
              </Button>
            </div>
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Time range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1h">1 Hour</SelectItem>
                <SelectItem value="6h">6 Hours</SelectItem>
                <SelectItem value="24h">24 Hours</SelectItem>
                <SelectItem value="7d">7 Days</SelectItem>
                <SelectItem value="30d">30 Days</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              onClick={() => fetchMetrics(false)}
              disabled={refreshing}
              className="flex items-center gap-2"
            >
              <RefreshCw className={cn("h-4 w-4", refreshing && "animate-spin")} />
              Refresh
            </Button>
            <Button
              onClick={exportReport}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Export Report
            </Button>
          </div>
        </div>

        {/* System Health Alert */}
        {metrics.systemHealth.status !== 'healthy' && showAlerts && (
          <Alert className={cn(
            "border-2",
            metrics.systemHealth.status === 'warning' ? "border-yellow-200 bg-yellow-50" : "border-red-200 bg-red-50"
          )}>
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>
              System Health {metrics.systemHealth.status === 'warning' ? 'Warning' : 'Critical'}
            </AlertTitle>
            <AlertDescription>
              AI system health score is {metrics.systemHealth.overallScore}%. 
              {metrics.systemHealth.status === 'critical' 
                ? ' Immediate attention required.' 
                : ' Monitoring recommended.'
              }
              <Button
                variant="link"
                className="p-0 ml-2"
                onClick={() => setActiveTab('system')}
              >
                View Details →
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Key Performance Indicators */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">System Health</p>
                  <div className="flex items-center gap-2">
                    <p className={cn("text-2xl font-bold", healthStatus.color)}>
                      {metrics.systemHealth.overallScore}%
                    </p>
                    <Badge className={cn("text-xs", healthStatus.bgColor, healthStatus.color)}>
                      {healthStatus.status.toUpperCase()}
                    </Badge>
                  </div>
                </div>
                <Activity className={cn("h-8 w-8", healthStatus.color)} />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Uptime: {formatDuration(metrics.systemHealth.uptime)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Accuracy Rate</p>
                  <div className="flex items-center gap-2">
                    <p className="text-2xl font-bold text-blue-600">
                      {metrics.accuracyMetrics.overallAccuracy.toFixed(1)}%
                    </p>
                    {getTrendIcon(metrics.accuracyMetrics.overallAccuracy, 85)}
                  </div>
                </div>
                <Target className="h-8 w-8 text-blue-500" />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Override rate: {metrics.accuracyMetrics.adminOverrideRate.toFixed(1)}%
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Throughput</p>
                  <div className="flex items-center gap-2">
                    <p className="text-2xl font-bold text-green-600">
                      {formatNumber(metrics.processingMetrics.throughputPerHour)}/h
                    </p>
                    {getTrendIcon(metrics.processingMetrics.throughputPerHour, 150)}
                  </div>
                </div>
                <Zap className="h-8 w-8 text-green-500" />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Avg: {metrics.processingMetrics.avgProcessingTimeMs}ms
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Queue Status</p>
                  <div className="flex items-center gap-2">
                    <p className="text-2xl font-bold text-purple-600">
                      {formatNumber(metrics.processingMetrics.queueSize)}
                    </p>
                    {getTrendIcon(100, metrics.processingMetrics.queueSize)}
                  </div>
                </div>
                <Clock className="h-8 w-8 text-purple-500" />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Backlog: {formatDuration(metrics.processingMetrics.backlogHours)}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Main Dashboard Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="accuracy">Accuracy</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="system">System Health</TabsTrigger>
          <TabsTrigger value="recommendations">Optimization</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Performance Trend Chart */}
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
                    <LineChart data={metrics.timeSeriesData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="timestamp" 
                        tickFormatter={(value) => new Date(value).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      />
                      <YAxis />
                      <Tooltip 
                        labelFormatter={(value) => new Date(value).toLocaleString()}
                        formatter={(value: number, name: string) => [
                          `${value.toFixed(1)}${name === 'accuracy' ? '%' : name === 'processingTime' ? 'ms' : ''}`,
                          name.charAt(0).toUpperCase() + name.slice(1)
                        ]}
                      />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="accuracy" 
                        stroke="#3b82f6" 
                        strokeWidth={2}
                        name="Accuracy (%)"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="throughput" 
                        stroke="#10b981" 
                        strokeWidth={2}
                        name="Throughput"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="processingTime" 
                        stroke="#f59e0b" 
                        strokeWidth={2}
                        name="Processing Time (ms)"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Business Impact Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  Business Impact
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <p className="text-2xl font-bold text-green-600">
                        {formatNumber(metrics.businessMetrics.autoApprovedCount)}
                      </p>
                      <p className="text-sm text-gray-600">Auto-Approved</p>
                    </div>
                    <div className="text-center p-4 bg-red-50 rounded-lg">
                      <p className="text-2xl font-bold text-red-600">
                        {formatNumber(metrics.businessMetrics.autoRejectedCount)}
                      </p>
                      <p className="text-sm text-gray-600">Auto-Rejected</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Manual Reviews</span>
                      <span className="font-medium">{formatNumber(metrics.businessMetrics.manualReviewCount)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Avg Review Time</span>
                      <span className="font-medium">{formatDuration(metrics.businessMetrics.avgReviewTime)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Customer Satisfaction</span>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-500" />
                        <span className="font-medium">{metrics.businessMetrics.customerSatisfactionScore}/5</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Time to Market</span>
                      <span className="font-medium">{metrics.businessMetrics.timeToMarketDays} days</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Processing Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Processing Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Auto-Approved', value: metrics.businessMetrics.autoApprovedCount, color: '#10b981' },
                        { name: 'Auto-Rejected', value: metrics.businessMetrics.autoRejectedCount, color: '#ef4444' },
                        { name: 'Manual Review', value: metrics.businessMetrics.manualReviewCount, color: '#f59e0b' }
                      ]}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {[
                        { name: 'Auto-Approved', value: metrics.businessMetrics.autoApprovedCount, color: '#10b981' },
                        { name: 'Auto-Rejected', value: metrics.businessMetrics.autoRejectedCount, color: '#ef4444' },
                        { name: 'Manual Review', value: metrics.businessMetrics.manualReviewCount, color: '#f59e0b' }
                      ].map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatNumber(value as number)} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Accuracy Analysis Tab */}
        <TabsContent value="accuracy" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Accuracy Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Accuracy Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Overall Accuracy</span>
                      <span className="font-medium">{metrics.accuracyMetrics.overallAccuracy.toFixed(1)}%</span>
                    </div>
                    <Progress value={metrics.accuracyMetrics.overallAccuracy} className="h-2" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Approval Accuracy</span>
                      <span className="font-medium">{metrics.accuracyMetrics.approvalAccuracy.toFixed(1)}%</span>
                    </div>
                    <Progress value={metrics.accuracyMetrics.approvalAccuracy} className="h-2" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Rejection Accuracy</span>
                      <span className="font-medium">{metrics.accuracyMetrics.rejectionAccuracy.toFixed(1)}%</span>
                    </div>
                    <Progress value={metrics.accuracyMetrics.rejectionAccuracy} className="h-2" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Confidence Calibration</span>
                      <span className="font-medium">{metrics.accuracyMetrics.confidenceCalibration.toFixed(1)}%</span>
                    </div>
                    <Progress value={metrics.accuracyMetrics.confidenceCalibration} className="h-2" />
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-red-50 rounded-lg">
                    <p className="text-lg font-bold text-red-600">
                      {metrics.accuracyMetrics.falsePositives}
                    </p>
                    <p className="text-xs text-gray-600">False Positives</p>
                  </div>
                  <div className="text-center p-3 bg-orange-50 rounded-lg">
                    <p className="text-lg font-bold text-orange-600">
                      {metrics.accuracyMetrics.falseNegatives}
                    </p>
                    <p className="text-xs text-gray-600">False Negatives</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Confidence Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Confidence Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={metrics.confidenceDistribution}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="range" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="count" fill="#3b82f6" name="Count" />
                      <Bar dataKey="accuracy" fill="#10b981" name="Accuracy %" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Error Analysis */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Error Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-4">Common Error Types</h4>
                  <div className="space-y-3">
                    {metrics.errorAnalysis.commonErrors.map((error, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <span className="font-medium text-sm">{error.type}</span>
                          <p className="text-xs text-gray-600">{error.percentage.toFixed(1)}% of total errors</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{error.count}</span>
                          {error.trend === 'increasing' && <TrendingUp className="h-4 w-4 text-red-500" />}
                          {error.trend === 'decreasing' && <TrendingDown className="h-4 w-4 text-green-500" />}
                          {error.trend === 'stable' && <Minus className="h-4 w-4 text-gray-500" />}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-4">Recent Errors</h4>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {metrics.errorAnalysis.recentErrors.slice(0, 10).map((error, index) => (
                      <div key={index} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium">{error.type}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500">
                              {new Date(error.timestamp).toLocaleTimeString()}
                            </span>
                            {error.resolved ? (
                              <CheckCircle className="h-3 w-3 text-green-500" />
                            ) : (
                              <XCircle className="h-3 w-3 text-red-500" />
                            )}
                          </div>
                        </div>
                        <p className="text-xs text-gray-600">{error.message}</p>
                        {error.businessId && (
                          <p className="text-xs text-blue-600 mt-1">Business ID: {error.businessId}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Processing Metrics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Processing Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <p className="text-2xl font-bold text-blue-600">
                        {metrics.processingMetrics.avgProcessingTimeMs}ms
                      </p>
                      <p className="text-sm text-gray-600">Avg Processing Time</p>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <p className="text-2xl font-bold text-green-600">
                        {formatNumber(metrics.processingMetrics.throughputPerHour)}
                      </p>
                      <p className="text-sm text-gray-600">Throughput/Hour</p>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Concurrent Processing</span>
                      <span className="font-medium">
                        {metrics.processingMetrics.concurrentProcessing} / {metrics.processingMetrics.maxConcurrentCapacity}
                      </span>
                    </div>
                    <Progress 
                      value={(metrics.processingMetrics.concurrentProcessing / metrics.processingMetrics.maxConcurrentCapacity) * 100} 
                      className="h-2" 
                    />
                  </div>
                  
                  <div className="pt-4 border-t">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-600">Queue Size</span>
                      <span className="font-medium">{formatNumber(metrics.processingMetrics.queueSize)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Estimated Backlog</span>
                      <span className="font-medium">{formatDuration(metrics.processingMetrics.backlogHours)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Resource Utilization */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Server className="h-5 w-5" />
                  Resource Utilization
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="flex items-center gap-2">
                        <Cpu className="h-4 w-4" />
                        CPU Usage
                      </span>
                      <span className="font-medium">{metrics.resourceMetrics.cpuUtilization.toFixed(1)}%</span>
                    </div>
                    <Progress value={metrics.resourceMetrics.cpuUtilization} className="h-2" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="flex items-center gap-2">
                        <Database className="h-4 w-4" />
                        Memory Usage
                      </span>
                      <span className="font-medium">{metrics.resourceMetrics.memoryUtilization.toFixed(1)}%</span>
                    </div>
                    <Progress value={metrics.resourceMetrics.memoryUtilization} className="h-2" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="flex items-center gap-2">
                        <HardDrive className="h-4 w-4" />
                        Disk Usage
                      </span>
                      <span className="font-medium">{metrics.resourceMetrics.diskUtilization.toFixed(1)}%</span>
                    </div>
                    <Progress value={metrics.resourceMetrics.diskUtilization} className="h-2" />
                  </div>
                  
                  <div className="pt-4 border-t space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="flex items-center gap-2">
                        <Network className="h-4 w-4" />
                        Network Latency
                      </span>
                      <span className="font-medium">{metrics.resourceMetrics.networkLatency}ms</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>API Response Time</span>
                      <span className="font-medium">{metrics.resourceMetrics.apiResponseTime}ms</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Cache Hit Rate</span>
                      <span className="font-medium">{(metrics.resourceMetrics.cacheHitRate * 100).toFixed(1)}%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Performance Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Performance Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={metrics.timeSeriesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="timestamp" 
                      tickFormatter={(value) => new Date(value).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip 
                      labelFormatter={(value) => new Date(value).toLocaleString()}
                    />
                    <Legend />
                    <Area
                      yAxisId="left"
                      type="monotone"
                      dataKey="queueSize"
                      fill="#3b82f6"
                      stroke="#3b82f6"
                      fillOpacity={0.3}
                      name="Queue Size"
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="processingTime"
                      stroke="#f59e0b"
                      strokeWidth={2}
                      name="Processing Time (ms)"
                    />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="throughput"
                      stroke="#10b981"
                      strokeWidth={2}
                      name="Throughput"
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Category Performance Tab */}
        <TabsContent value="categories" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Category Performance Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">Category</th>
                      <th className="text-center py-3 px-4">Accuracy</th>
                      <th className="text-center py-3 px-4">Processing Time</th>
                      <th className="text-center py-3 px-4">Throughput</th>
                      <th className="text-center py-3 px-4">Confidence</th>
                      <th className="text-center py-3 px-4">Manual Review Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {metrics.categoryPerformance.map((category, index) => (
                      <tr key={index} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4 font-medium">{category.category}</td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <div className={cn(
                              "w-2 h-2 rounded-full",
                              category.accuracy >= 90 ? "bg-green-500" :
                              category.accuracy >= 80 ? "bg-yellow-500" : "bg-red-500"
                            )} />
                            {category.accuracy.toFixed(1)}%
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center">{category.processingTime}ms</td>
                        <td className="py-3 px-4 text-center">{formatNumber(category.throughput)}/h</td>
                        <td className="py-3 px-4 text-center">{category.confidenceScore.toFixed(1)}%</td>
                        <td className="py-3 px-4 text-center">
                          <Progress value={category.manualReviewRate * 100} className="w-16 h-2" />
                          <span className="text-xs text-gray-500 ml-1">
                            {(category.manualReviewRate * 100).toFixed(1)}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Geographic Performance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Geographic Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart data={metrics.geographicPerformance}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="accuracy" 
                      name="Accuracy" 
                      unit="%" 
                      domain={['dataMin - 5', 'dataMax + 5']}
                    />
                    <YAxis 
                      dataKey="processingTime" 
                      name="Processing Time" 
                      unit="ms"
                    />
                    <Tooltip 
                      cursor={{ strokeDasharray: '3 3' }}
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-white p-3 border rounded-lg shadow-lg">
                              <h4 className="font-medium">{data.region}</h4>
                              <p className="text-sm text-gray-600">Accuracy: {data.accuracy}%</p>
                              <p className="text-sm text-gray-600">Processing Time: {data.processingTime}ms</p>
                              <p className="text-sm text-gray-600">Volume: {formatNumber(data.volumeCount)}</p>
                              <p className="text-sm text-gray-600">Complexity Score: {data.complexityScore}</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Scatter 
                      dataKey="volumeCount" 
                      fill="#3b82f6"
                      name="Volume"
                    />
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Bubble size represents processing volume. X-axis shows accuracy, Y-axis shows processing time.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* System Health Tab */}
        <TabsContent value="system" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* System Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  System Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="font-medium">Overall Health Score</h4>
                      <p className="text-sm text-gray-600">Combined system health indicator</p>
                    </div>
                    <div className="text-right">
                      <div className={cn("text-2xl font-bold", healthStatus.color)}>
                        {metrics.systemHealth.overallScore}%
                      </div>
                      <Badge className={cn("text-xs", healthStatus.bgColor, healthStatus.color)}>
                        {healthStatus.status.toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">System Uptime</span>
                      <span className="font-medium">{formatDuration(metrics.systemHealth.uptime)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Last Restart</span>
                      <span className="font-medium">
                        {new Date(metrics.systemHealth.lastRestart).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Error Rate</span>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{metrics.errorAnalysis.errorRate.toFixed(3)}%</span>
                        {metrics.errorAnalysis.errorRate < 0.1 ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <AlertTriangle className="h-4 w-4 text-yellow-500" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Resource Health */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gauge className="h-5 w-5" />
                  Resource Health
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { name: 'CPU', value: metrics.resourceMetrics.cpuUtilization, icon: Cpu },
                    { name: 'Memory', value: metrics.resourceMetrics.memoryUtilization, icon: Database },
                    { name: 'Disk', value: metrics.resourceMetrics.diskUtilization, icon: HardDrive },
                    { name: 'Network', value: (metrics.resourceMetrics.networkLatency / 1000) * 100, icon: Network }
                  ].map((resource, index) => (
                    <div key={index}>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="flex items-center gap-2">
                          <resource.icon className="h-4 w-4" />
                          {resource.name}
                        </span>
                        <span className="font-medium">
                          {resource.name === 'Network' 
                            ? `${metrics.resourceMetrics.networkLatency}ms`
                            : `${resource.value.toFixed(1)}%`
                          }
                        </span>
                      </div>
                      <Progress 
                        value={resource.value} 
                        className={cn(
                          "h-2",
                          resource.value > 80 ? "text-red-500" : 
                          resource.value > 60 ? "text-yellow-500" : "text-green-500"
                        )}
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* System Alerts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                System Alerts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {metrics.systemHealth.overallScore < 80 && (
                  <Alert className="border-yellow-200 bg-yellow-50">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Performance Warning</AlertTitle>
                    <AlertDescription>
                      System health score has dropped below optimal levels. Consider reviewing resource utilization and recent changes.
                    </AlertDescription>
                  </Alert>
                )}
                
                {metrics.processingMetrics.queueSize > 1000 && (
                  <Alert className="border-orange-200 bg-orange-50">
                    <Clock className="h-4 w-4" />
                    <AlertTitle>Queue Backlog</AlertTitle>
                    <AlertDescription>
                      Processing queue has {formatNumber(metrics.processingMetrics.queueSize)} items with an estimated backlog of {formatDuration(metrics.processingMetrics.backlogHours)}.
                    </AlertDescription>
                  </Alert>
                )}
                
                {metrics.errorAnalysis.errorRate > 1 && (
                  <Alert className="border-red-200 bg-red-50">
                    <XCircle className="h-4 w-4" />
                    <AlertTitle>High Error Rate</AlertTitle>
                    <AlertDescription>
                      System error rate is {metrics.errorAnalysis.errorRate.toFixed(2)}%, which is above normal thresholds.
                    </AlertDescription>
                  </Alert>
                )}
                
                {metrics.resourceMetrics.cpuUtilization > 80 && (
                  <Alert className="border-red-200 bg-red-50">
                    <Cpu className="h-4 w-4" />
                    <AlertTitle>High CPU Usage</AlertTitle>
                    <AlertDescription>
                      CPU utilization is at {metrics.resourceMetrics.cpuUtilization.toFixed(1)}%. Consider scaling resources or optimizing processing.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Optimization Recommendations Tab */}
        <TabsContent value="recommendations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                AI Optimization Recommendations
              </CardTitle>
              <p className="text-sm text-gray-600">
                Automated recommendations to improve AI system performance and accuracy
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {metrics.recommendations.map((recommendation, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-3 h-3 rounded-full",
                          recommendation.priority === 'high' ? "bg-red-500" :
                          recommendation.priority === 'medium' ? "bg-yellow-500" : "bg-green-500"
                        )} />
                        <div>
                          <h4 className="font-medium">{recommendation.title}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {recommendation.type}
                            </Badge>
                            <Badge 
                              variant="outline" 
                              className={cn(
                                "text-xs",
                                recommendation.priority === 'high' ? "border-red-200 text-red-700" :
                                recommendation.priority === 'medium' ? "border-yellow-200 text-yellow-700" :
                                "border-green-200 text-green-700"
                              )}
                            >
                              {recommendation.priority} priority
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {recommendation.implementationEffort} effort
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        Implement
                      </Button>
                    </div>
                    
                    <p className="text-sm text-gray-700 mb-3">
                      {recommendation.description}
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Expected Impact:</span>
                        <p className="font-medium">{recommendation.expectedImpact}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Time to Implement:</span>
                        <p className="font-medium">{recommendation.estimatedTimeToImplement}</p>
                      </div>
                    </div>
                    
                    {Object.keys(recommendation.potentialGains).length > 0 && (
                      <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                        <h5 className="text-sm font-medium mb-2">Potential Gains:</h5>
                        <div className="flex gap-4 text-sm">
                          {recommendation.potentialGains.accuracy && (
                            <span>Accuracy: +{recommendation.potentialGains.accuracy}%</span>
                          )}
                          {recommendation.potentialGains.throughput && (
                            <span>Throughput: +{recommendation.potentialGains.throughput}%</span>
                          )}
                          {recommendation.potentialGains.resourceSaving && (
                            <span>Resource Saving: {recommendation.potentialGains.resourceSaving}%</span>
                          )}
                        </div>
                      </div>
                    )}
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