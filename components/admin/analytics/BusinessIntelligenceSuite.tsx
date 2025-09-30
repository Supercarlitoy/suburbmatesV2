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
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ComposedChart,
  ScatterChart,
  Scatter,
  Treemap
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Brain,
  Target,
  DollarSign,
  Users,
  Building,
  MapPin,
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
  Heart,
  Snowflake,
  Lightbulb,
  Shield,
  Clock,
  Globe,
  Briefcase,
  Star,
  Award,
  Gauge,
  TrendingDown as TrendDown,
  Calculator,
  Database,
  BarChart2,
  LineChart as LineChartIcon,
  Analytics,
  BookOpen,
  FileBarChart,
  PresentationChart,
  Layers,
  Settings,
  PlayCircle,
  StopCircle,
  RotateCcw,
  MoreHorizontal
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Data Interfaces
interface PredictiveModel {
  id: string;
  name: string;
  type: 'revenue' | 'churn' | 'market_growth' | 'demand' | 'pricing';
  description: string;
  accuracy: number;
  lastTrained: string;
  predictions: {
    period: string;
    value: number;
    confidence: number;
    trend: 'up' | 'down' | 'stable';
  }[];
  features: {
    name: string;
    importance: number;
  }[];
  performance: {
    mae: number;
    rmse: number;
    r2: number;
  };
}

interface MarketAnalysis {
  marketSize: number;
  marketGrowth: number;
  marketShare: number;
  competitorCount: number;
  entryBarriers: 'low' | 'medium' | 'high';
  competitiveAdvantage: string[];
  threats: string[];
  opportunities: string[];
  segments: {
    name: string;
    size: number;
    growth: number;
    penetration: number;
  }[];
  trends: {
    trend: string;
    impact: 'positive' | 'negative' | 'neutral';
    likelihood: number;
  }[];
}

interface CompetitorData {
  id: string;
  name: string;
  marketShare: number;
  revenue: number;
  revenueGrowth: number;
  pricing: {
    model: string;
    averagePrice: number;
    pricePosition: 'premium' | 'mid-market' | 'budget';
  };
  strengths: string[];
  weaknesses: string[];
  products: {
    name: string;
    marketPosition: string;
    features: string[];
  }[];
  marketing: {
    channels: string[];
    spend: number;
    reach: number;
  };
  performance: {
    customerSatisfaction: number;
    brandAwareness: number;
    marketPresence: number;
  };
}

interface FinancialMetrics {
  revenue: {
    current: number;
    projected: number;
    growth: number;
    breakdown: {
      source: string;
      amount: number;
      percentage: number;
    }[];
  };
  profitability: {
    grossMargin: number;
    netMargin: number;
    ebitda: number;
    operatingCosts: number;
  };
  cashFlow: {
    operating: number;
    investing: number;
    financing: number;
    free: number;
  };
  kpis: {
    name: string;
    value: number;
    target: number;
    trend: 'up' | 'down' | 'stable';
    status: 'good' | 'warning' | 'critical';
  }[];
  forecasts: {
    period: string;
    revenue: number;
    costs: number;
    profit: number;
    confidence: number;
  }[];
}

interface AutomatedReport {
  id: string;
  name: string;
  description: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly';
  recipients: string[];
  sections: string[];
  lastGenerated: string;
  nextScheduled: string;
  status: 'active' | 'paused' | 'error';
  format: 'pdf' | 'excel' | 'dashboard';
  filters: Record<string, any>;
  metrics: string[];
}

interface BusinessIntelligenceSuiteProps {
  className?: string;
}

const CHART_COLORS = [
  '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
  '#06b6d4', '#84cc16', '#f97316', '#ec4899', '#6b7280'
];

const STATUS_COLORS = {
  good: 'text-green-600 bg-green-50',
  warning: 'text-yellow-600 bg-yellow-50',
  critical: 'text-red-600 bg-red-50'
};

const TREND_ICONS = {
  up: TrendingUp,
  down: TrendingDown,
  stable: Minus
};

export default function BusinessIntelligenceSuite({ className }: BusinessIntelligenceSuiteProps) {
  // State Management
  const [predictiveModels, setPredictiveModels] = useState<PredictiveModel[]>([]);
  const [marketAnalysis, setMarketAnalysis] = useState<MarketAnalysis | null>(null);
  const [competitors, setCompetitors] = useState<CompetitorData[]>([]);
  const [financialMetrics, setFinancialMetrics] = useState<FinancialMetrics | null>(null);
  const [automatedReports, setAutomatedReports] = useState<AutomatedReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // UI State
  const [activeTab, setActiveTab] = useState('overview');
  const [dateRange, setDateRange] = useState('30d');
  const [selectedModel, setSelectedModel] = useState('all');
  const [selectedCompetitor, setSelectedCompetitor] = useState('all');
  const [showAdvancedAnalytics, setShowAdvancedAnalytics] = useState(false);

  // Advanced Filters
  const [filters, setFilters] = useState({
    marketSegment: 'all',
    geography: 'all',
    industry: 'all',
    confidence: 0.8,
    timeHorizon: '12m'
  });

  // Fetch Business Intelligence Data
  const fetchBIData = useCallback(async (showLoader = true) => {
    if (showLoader) setLoading(true);
    if (!showLoader) setRefreshing(true);

    try {
      const queryParams = new URLSearchParams({
        dateRange,
        model: selectedModel,
        competitor: selectedCompetitor,
        ...filters
      });

      const response = await fetch(`/api/admin/analytics/business-intelligence?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('supabase_access_token')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setPredictiveModels(data.predictiveModels || []);
        setMarketAnalysis(data.marketAnalysis || null);
        setCompetitors(data.competitors || []);
        setFinancialMetrics(data.financialMetrics || null);
        setAutomatedReports(data.automatedReports || []);
      } else {
        console.error('Failed to fetch business intelligence data:', response.statusText);
      }
    } catch (error) {
      console.error('Error fetching business intelligence data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [dateRange, selectedModel, selectedCompetitor, filters]);

  // Initial load and data refresh
  useEffect(() => {
    fetchBIData();
  }, [fetchBIData]);

  // Helper Functions
  const formatNumber = (num: number): string => {
    if (num >= 1000000000) return `${(num / 1000000000).toFixed(1)}B`;
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

  const getStatusColor = (status: 'good' | 'warning' | 'critical'): string => {
    return STATUS_COLORS[status];
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    const Icon = TREND_ICONS[trend];
    const color = trend === 'up' ? 'text-green-500' : 
                  trend === 'down' ? 'text-red-500' : 'text-gray-500';
    return <Icon className={cn("h-4 w-4", color)} />;
  };

  // Overview Metrics
  const overviewMetrics = useMemo(() => {
    if (!financialMetrics || !marketAnalysis) return null;

    return {
      totalRevenue: financialMetrics.revenue.current,
      revenueGrowth: financialMetrics.revenue.growth,
      marketShare: marketAnalysis.marketShare,
      competitorCount: marketAnalysis.competitorCount,
      profitMargin: financialMetrics.profitability.netMargin,
      cashFlow: financialMetrics.cashFlow.free
    };
  }, [financialMetrics, marketAnalysis]);

  if (loading) {
    return (
      <div className={cn("space-y-6", className)}>
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center space-x-2">
            <RefreshCw className="h-5 w-5 animate-spin text-blue-500" />
            <span className="text-sm text-gray-600">Loading business intelligence...</span>
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
            <h1 className="text-3xl font-bold text-gray-900">Business Intelligence Suite</h1>
            <p className="text-gray-600">
              Advanced analytics, predictive modeling, market analysis, and competitive intelligence
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
              onClick={() => fetchBIData(false)}
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

        {/* Overview Cards */}
        {overviewMetrics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {formatCurrency(overviewMetrics.totalRevenue)}
                    </p>
                  </div>
                  <DollarSign className="h-8 w-8 text-blue-500" />
                </div>
                <div className="flex items-center gap-2 mt-2">
                  {getTrendIcon(overviewMetrics.revenueGrowth > 0 ? 'up' : 'down')}
                  <span className="text-sm text-gray-600">
                    {formatPercentage(Math.abs(overviewMetrics.revenueGrowth))} growth
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Market Share</p>
                    <p className="text-2xl font-bold text-green-600">
                      {formatPercentage(overviewMetrics.marketShare)}
                    </p>
                  </div>
                  <Target className="h-8 w-8 text-green-500" />
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  {overviewMetrics.competitorCount} competitors tracked
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Profit Margin</p>
                    <p className={cn("text-2xl font-bold", 
                      overviewMetrics.profitMargin > 0 ? "text-green-600" : "text-red-600"
                    )}>
                      {formatPercentage(overviewMetrics.profitMargin)}
                    </p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-purple-500" />
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  {formatCurrency(overviewMetrics.cashFlow)} free cash flow
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Advanced Controls */}
        <Card>
          <CardContent className="p-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="advanced-analytics"
                    checked={showAdvancedAnalytics}
                    onCheckedChange={setShowAdvancedAnalytics}
                  />
                  <Label htmlFor="advanced-analytics">Advanced Analytics</Label>
                </div>
              </div>

              {showAdvancedAnalytics && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t">
                  <div>
                    <Label>Market Segment</Label>
                    <Select 
                      value={filters.marketSegment} 
                      onValueChange={(value) => setFilters({ ...filters, marketSegment: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All segments" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Segments</SelectItem>
                        <SelectItem value="enterprise">Enterprise</SelectItem>
                        <SelectItem value="smb">SMB</SelectItem>
                        <SelectItem value="consumer">Consumer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Geography</Label>
                    <Select 
                      value={filters.geography} 
                      onValueChange={(value) => setFilters({ ...filters, geography: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All regions" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Regions</SelectItem>
                        <SelectItem value="apac">APAC</SelectItem>
                        <SelectItem value="emea">EMEA</SelectItem>
                        <SelectItem value="americas">Americas</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Confidence Threshold</Label>
                    <Input
                      type="number"
                      min="0"
                      max="1"
                      step="0.1"
                      value={filters.confidence}
                      onChange={(e) => setFilters({ ...filters, confidence: parseFloat(e.target.value) })}
                    />
                  </div>
                  <div>
                    <Label>Time Horizon</Label>
                    <Select 
                      value={filters.timeHorizon} 
                      onValueChange={(value) => setFilters({ ...filters, timeHorizon: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Time horizon" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="3m">3 Months</SelectItem>
                        <SelectItem value="6m">6 Months</SelectItem>
                        <SelectItem value="12m">12 Months</SelectItem>
                        <SelectItem value="24m">24 Months</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Dashboard Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="predictive">Predictive</TabsTrigger>
          <TabsTrigger value="market">Market</TabsTrigger>
          <TabsTrigger value="competitive">Competitive</TabsTrigger>
          <TabsTrigger value="financial">Financial</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue Forecast */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Revenue Forecast
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={financialMetrics?.forecasts || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="period" />
                      <YAxis />
                      <Tooltip formatter={(value) => formatCurrency(value as number)} />
                      <Legend />
                      <Area
                        type="monotone"
                        dataKey="revenue"
                        fill="#3b82f6"
                        fillOpacity={0.3}
                        stroke="#3b82f6"
                        name="Revenue"
                      />
                      <Line
                        type="monotone"
                        dataKey="profit"
                        stroke="#10b981"
                        strokeWidth={2}
                        name="Profit"
                      />
                      <Bar dataKey="costs" fill="#ef4444" name="Costs" />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Key Performance Indicators */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gauge className="h-5 w-5" />
                  Key Performance Indicators
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {financialMetrics?.kpis.map((kpi, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-3 h-3 rounded-full",
                          kpi.status === 'good' ? 'bg-green-500' :
                          kpi.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                        )} />
                        <div>
                          <p className="font-medium text-sm">{kpi.name}</p>
                          <p className="text-xs text-gray-500">
                            Target: {formatNumber(kpi.target)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold">
                          {formatNumber(kpi.value)}
                        </span>
                        {getTrendIcon(kpi.trend)}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Market Segments Performance */}
          {marketAnalysis && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieIcon className="h-5 w-5" />
                  Market Segments
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={marketAnalysis.segments}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, size }) => `${name} (${formatNumber(size)})`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="size"
                        >
                          {marketAnalysis.segments.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={CHART_COLORS[index]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => formatNumber(value as number)} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="space-y-3">
                    {marketAnalysis.segments.map((segment, index) => (
                      <div key={index} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">{segment.name}</h4>
                          <Badge variant="outline" style={{ backgroundColor: CHART_COLORS[index] + '20' }}>
                            {formatPercentage(segment.penetration)} penetration
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Size:</span>
                            <span className="font-medium ml-1">
                              {formatNumber(segment.size)}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-600">Growth:</span>
                            <span className="font-medium ml-1">
                              {formatPercentage(segment.growth)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Predictive Analytics Tab */}
        <TabsContent value="predictive" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Model Performance */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  Predictive Models
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {predictiveModels.map((model, index) => (
                    <div key={model.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h4 className="font-semibold">{model.name}</h4>
                          <p className="text-sm text-gray-600">{model.description}</p>
                        </div>
                        <div className="text-right">
                          <Badge 
                            variant={model.accuracy > 0.8 ? 'default' : 'secondary'}
                          >
                            {formatPercentage(model.accuracy)} accuracy
                          </Badge>
                          <p className="text-xs text-gray-500 mt-1">
                            Updated: {new Date(model.lastTrained).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4 text-sm mb-3">
                        <div>
                          <span className="text-gray-600">MAE:</span>
                          <span className="font-medium ml-1">{model.performance.mae.toFixed(3)}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">RMSE:</span>
                          <span className="font-medium ml-1">{model.performance.rmse.toFixed(3)}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">R²:</span>
                          <span className="font-medium ml-1">{model.performance.r2.toFixed(3)}</span>
                        </div>
                      </div>

                      <div>
                        <p className="text-xs text-gray-500 mb-2">Top Features:</p>
                        <div className="flex flex-wrap gap-1">
                          {model.features.slice(0, 3).map((feature, fIndex) => (
                            <Badge key={fIndex} variant="outline" className="text-xs">
                              {feature.name} ({formatPercentage(feature.importance)})
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Predictions Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Analytics className="h-5 w-5" />
                  Forecast Accuracy
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={predictiveModels[0]?.predictions || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="period" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="value"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        name="Predicted Value"
                      />
                      <Line
                        type="monotone"
                        dataKey="confidence"
                        stroke="#10b981"
                        strokeWidth={2}
                        name="Confidence %"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Model Comparison */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Model Performance Comparison
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={predictiveModels.map(model => ({
                    name: model.name,
                    accuracy: model.accuracy * 100,
                    r2: model.performance.r2 * 100,
                    reliability: (1 - model.performance.mae) * 100
                  }))}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="name" />
                    <PolarRadiusAxis />
                    <Radar
                      name="Performance"
                      dataKey="accuracy"
                      stroke="#3b82f6"
                      fill="#3b82f6"
                      fillOpacity={0.6}
                    />
                    <Tooltip />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Market Analysis Tab */}
        <TabsContent value="market" className="space-y-6">
          {marketAnalysis && (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Market Overview */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Globe className="h-5 w-5" />
                      Market Overview
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-4 bg-blue-50 rounded-lg">
                          <p className="text-2xl font-bold text-blue-600">
                            {formatCurrency(marketAnalysis.marketSize)}
                          </p>
                          <p className="text-sm text-blue-700">Market Size</p>
                        </div>
                        <div className="text-center p-4 bg-green-50 rounded-lg">
                          <p className="text-2xl font-bold text-green-600">
                            {formatPercentage(marketAnalysis.marketGrowth)}
                          </p>
                          <p className="text-sm text-green-700">Growth Rate</p>
                        </div>
                      </div>
                      
                      <div className="p-4 border rounded-lg">
                        <h4 className="font-medium mb-2">Entry Barriers</h4>
                        <Badge 
                          variant={
                            marketAnalysis.entryBarriers === 'high' ? 'destructive' :
                            marketAnalysis.entryBarriers === 'medium' ? 'default' : 'secondary'
                          }
                        >
                          {marketAnalysis.entryBarriers} barriers
                        </Badge>
                      </div>

                      <div>
                        <h4 className="font-medium mb-2">Competitive Advantages</h4>
                        <div className="space-y-1">
                          {marketAnalysis.competitiveAdvantage.map((advantage, index) => (
                            <div key={index} className="flex items-center gap-2">
                              <CheckCircle className="h-4 w-4 text-green-500" />
                              <span className="text-sm">{advantage}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Market Trends */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Market Trends
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {marketAnalysis.trends.map((trend, index) => (
                        <div key={index} className="p-3 border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <h5 className="font-medium text-sm">{trend.trend}</h5>
                            <div className="flex items-center gap-2">
                              <Badge 
                                variant={
                                  trend.impact === 'positive' ? 'default' :
                                  trend.impact === 'negative' ? 'destructive' : 'secondary'
                                }
                                className="text-xs"
                              >
                                {trend.impact}
                              </Badge>
                              <span className="text-xs text-gray-500">
                                {formatPercentage(trend.likelihood)} likely
                              </span>
                            </div>
                          </div>
                          <Progress value={trend.likelihood * 100} className="h-2" />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Opportunities & Threats */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Lightbulb className="h-5 w-5 text-yellow-500" />
                      Opportunities
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {marketAnalysis.opportunities.map((opportunity, index) => (
                        <div key={index} className="flex items-start gap-2 p-2">
                          <ThumbsUp className="h-4 w-4 text-green-500 mt-0.5" />
                          <span className="text-sm">{opportunity}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5 text-red-500" />
                      Threats
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {marketAnalysis.threats.map((threat, index) => (
                        <div key={index} className="flex items-start gap-2 p-2">
                          <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5" />
                          <span className="text-sm">{threat}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </TabsContent>

        {/* Competitive Analysis Tab */}
        <TabsContent value="competitive" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Competitive Landscape
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Competitor</TableHead>
                      <TableHead className="text-right">Market Share</TableHead>
                      <TableHead className="text-right">Revenue</TableHead>
                      <TableHead className="text-right">Growth</TableHead>
                      <TableHead>Price Position</TableHead>
                      <TableHead className="text-right">Customer Sat.</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {competitors.map((competitor) => (
                      <TableRow key={competitor.id}>
                        <TableCell className="font-medium">
                          {competitor.name}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatPercentage(competitor.marketShare)}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(competitor.revenue)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            {formatPercentage(competitor.revenueGrowth)}
                            {getTrendIcon(competitor.revenueGrowth > 0 ? 'up' : 'down')}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={
                              competitor.pricing.pricePosition === 'premium' ? 'default' :
                              competitor.pricing.pricePosition === 'mid-market' ? 'secondary' : 'outline'
                            }
                          >
                            {competitor.pricing.pricePosition}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <span>{formatPercentage(competitor.performance.customerSatisfaction)}</span>
                            <div className={cn(
                              "w-2 h-2 rounded-full",
                              competitor.performance.customerSatisfaction > 0.8 ? 'bg-green-500' :
                              competitor.performance.customerSatisfaction > 0.6 ? 'bg-yellow-500' : 'bg-red-500'
                            )} />
                          </div>
                        </TableCell>
                        <TableCell>
                          <Button size="sm" variant="outline">
                            <Eye className="h-3 w-3" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Competitive Matrix */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart2 className="h-5 w-5" />
                Competitive Positioning
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart
                    data={competitors.map(c => ({
                      name: c.name,
                      marketShare: c.marketShare * 100,
                      customerSatisfaction: c.performance.customerSatisfaction * 100,
                      revenue: c.revenue
                    }))}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="marketShare" 
                      name="Market Share %" 
                      unit="%" 
                    />
                    <YAxis 
                      dataKey="customerSatisfaction" 
                      name="Customer Satisfaction %" 
                      unit="%" 
                    />
                    <Tooltip 
                      formatter={(value, name) => [
                        `${value}${name?.includes('Share') || name?.includes('Satisfaction') ? '%' : ''}`,
                        name
                      ]}
                    />
                    <Scatter 
                      name="Competitors" 
                      dataKey="customerSatisfaction" 
                      fill="#8b5cf6"
                    />
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Financial Analysis Tab */}
        <TabsContent value="financial" className="space-y-6">
          {financialMetrics && (
            <>
              {/* Revenue Breakdown */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <PieIcon className="h-5 w-5" />
                      Revenue Breakdown
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={financialMetrics.revenue.breakdown}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ source, percentage }) => 
                              `${source} ${formatPercentage(percentage)}`
                            }
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="amount"
                          >
                            {financialMetrics.revenue.breakdown.map((_, index) => (
                              <Cell key={`cell-${index}`} fill={CHART_COLORS[index]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => formatCurrency(value as number)} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                {/* Cash Flow */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Cash Flow Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 border rounded-lg">
                          <p className="text-sm text-gray-600">Operating</p>
                          <p className={cn("text-lg font-bold",
                            financialMetrics.cashFlow.operating > 0 ? "text-green-600" : "text-red-600"
                          )}>
                            {formatCurrency(financialMetrics.cashFlow.operating)}
                          </p>
                        </div>
                        <div className="p-3 border rounded-lg">
                          <p className="text-sm text-gray-600">Free Cash Flow</p>
                          <p className={cn("text-lg font-bold",
                            financialMetrics.cashFlow.free > 0 ? "text-green-600" : "text-red-600"
                          )}>
                            {formatCurrency(financialMetrics.cashFlow.free)}
                          </p>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Investing:</span>
                          <span className="font-medium">
                            {formatCurrency(financialMetrics.cashFlow.investing)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Financing:</span>
                          <span className="font-medium">
                            {formatCurrency(financialMetrics.cashFlow.financing)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Profitability Metrics */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calculator className="h-5 w-5" />
                    Profitability Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 border rounded-lg">
                      <p className="text-2xl font-bold text-blue-600">
                        {formatPercentage(financialMetrics.profitability.grossMargin)}
                      </p>
                      <p className="text-sm text-gray-600">Gross Margin</p>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <p className="text-2xl font-bold text-green-600">
                        {formatPercentage(financialMetrics.profitability.netMargin)}
                      </p>
                      <p className="text-sm text-gray-600">Net Margin</p>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <p className="text-2xl font-bold text-purple-600">
                        {formatCurrency(financialMetrics.profitability.ebitda)}
                      </p>
                      <p className="text-sm text-gray-600">EBITDA</p>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <p className="text-2xl font-bold text-orange-600">
                        {formatCurrency(financialMetrics.profitability.operatingCosts)}
                      </p>
                      <p className="text-sm text-gray-600">Operating Costs</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        {/* Automated Reports Tab */}
        <TabsContent value="reports" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <FileBarChart className="h-5 w-5" />
                  Automated Reports
                </CardTitle>
                <Button className="flex items-center gap-2">
                  <PresentationChart className="h-4 w-4" />
                  Create Report
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {automatedReports.map((report, index) => (
                  <div key={report.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-semibold">{report.name}</h4>
                        <p className="text-sm text-gray-600">{report.description}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant={
                            report.status === 'active' ? 'default' :
                            report.status === 'paused' ? 'secondary' : 'destructive'
                          }
                        >
                          {report.status}
                        </Badge>
                        <Button size="sm" variant="outline">
                          <MoreHorizontal className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                      <div>
                        <span className="text-sm text-gray-600">Frequency:</span>
                        <span className="font-medium ml-2">{report.frequency}</span>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">Format:</span>
                        <span className="font-medium ml-2">{report.format}</span>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">Recipients:</span>
                        <span className="font-medium ml-2">{report.recipients.length}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-4">
                        <span className="text-gray-600">
                          Last: {new Date(report.lastGenerated).toLocaleDateString()}
                        </span>
                        <span className="text-gray-600">
                          Next: {new Date(report.nextScheduled).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline">
                          <Eye className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <PlayCircle className="h-3 w-3" />
                        </Button>
                      </div>
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