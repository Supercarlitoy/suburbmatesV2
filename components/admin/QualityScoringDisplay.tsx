'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Star, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle,
  CheckCircle,
  Target,
  BarChart3,
  PieChart,
  RefreshCw,
  Download,
  Users,
  Building2,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Info,
  Lightbulb
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface QualityScoreData {
  businessId: string;
  businessName: string;
  currentScore: number;
  previousScore?: number;
  scoreBreakdown: {
    completeness: number;
    recency: number;
    verification: number;
    engagement: number;
  };
  recommendations: Array<{
    category: 'completeness' | 'recency' | 'verification' | 'engagement';
    priority: 'high' | 'medium' | 'low';
    title: string;
    description: string;
    impact: number; // Points improvement potential
  }>;
  lastUpdated: string;
}

interface QualityStats {
  averageScore: number;
  scoreDistribution: {
    excellent: number; // 90-100
    good: number;      // 70-89
    fair: number;      // 50-69
    poor: number;      // 0-49
  };
  trends: {
    daily: Array<{ date: string; averageScore: number; businessCount: number }>;
    monthly: Array<{ month: string; averageScore: number; businessCount: number }>;
  };
  improvements: {
    totalBusinesses: number;
    improved: number;
    declined: number;
    unchanged: number;
  };
}

interface QualityScoringDisplayProps {
  businessId?: string; // If provided, shows single business view
  className?: string;
}

export default function QualityScoringDisplay({ 
  businessId, 
  className 
}: QualityScoringDisplayProps) {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<'daily' | 'weekly' | 'monthly'>('monthly');
  const [qualityData, setQualityData] = useState<QualityScoreData | null>(null);
  const [qualityStats, setQualityStats] = useState<QualityStats | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'trends' | 'recommendations'>('overview');

  // Fetch quality data
  const fetchQualityData = async (showLoader = true) => {
    if (showLoader) setLoading(true);
    else setRefreshing(true);

    try {
      if (businessId) {
        // Fetch individual business quality data
        const response = await fetch(`/api/admin/quality-scoring/${businessId}`);
        if (!response.ok) throw new Error('Failed to fetch quality data');
        
        const data = await response.json();
        setQualityData(data.qualityData);
      } else {
        // Fetch overall quality statistics
        const response = await fetch(`/api/admin/quality-scoring/stats?period=${selectedPeriod}`);
        if (!response.ok) throw new Error('Failed to fetch quality stats');
        
        const data = await response.json();
        setQualityStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching quality data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchQualityData();
  }, [businessId, selectedPeriod]);

  // Handle score recalculation
  const handleRecalculateScore = async () => {
    if (!businessId) return;
    
    try {
      setRefreshing(true);
      const response = await fetch(`/api/admin/quality-scoring/calculate/${businessId}`, {
        method: 'POST'
      });
      
      if (!response.ok) throw new Error('Failed to recalculate score');
      
      // Refresh data
      await fetchQualityData(false);
    } catch (error) {
      console.error('Error recalculating score:', error);
    }
  };

  // Get score color and icon
  const getScoreDisplay = (score: number) => {
    if (score >= 90) {
      return {
        color: 'text-green-600',
        bgColor: 'bg-green-100',
        icon: <Star className="h-5 w-5 fill-current" />,
        label: 'Excellent'
      };
    } else if (score >= 70) {
      return {
        color: 'text-blue-600',
        bgColor: 'bg-blue-100',
        icon: <CheckCircle className="h-5 w-5" />,
        label: 'Good'
      };
    } else if (score >= 50) {
      return {
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-100',
        icon: <Target className="h-5 w-5" />,
        label: 'Fair'
      };
    } else {
      return {
        color: 'text-red-600',
        bgColor: 'bg-red-100',
        icon: <AlertTriangle className="h-5 w-5" />,
        label: 'Poor'
      };
    }
  };

  // Get trend indicator
  const getTrendIndicator = (current: number, previous?: number) => {
    if (!previous) return <Minus className="h-4 w-4 text-gray-400" />;
    
    if (current > previous) {
      return (
        <div className="flex items-center text-green-600">
          <ArrowUpRight className="h-4 w-4" />
          <span className="text-xs ml-1">+{(current - previous).toFixed(1)}</span>
        </div>
      );
    } else if (current < previous) {
      return (
        <div className="flex items-center text-red-600">
          <ArrowDownRight className="h-4 w-4" />
          <span className="text-xs ml-1">{(current - previous).toFixed(1)}</span>
        </div>
      );
    } else {
      return <Minus className="h-4 w-4 text-gray-400" />;
    }
  };

  // Get recommendation priority color
  const getRecommendationPriorityColor = (priority: 'high' | 'medium' | 'low') => {
    switch (priority) {
      case 'high':
        return 'text-red-600 bg-red-100';
      case 'medium':
        return 'text-orange-600 bg-orange-100';
      case 'low':
        return 'text-blue-600 bg-blue-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
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

  // Single business view
  if (businessId && qualityData) {
    const scoreDisplay = getScoreDisplay(qualityData.currentScore);
    
    return (
      <div className={cn('space-y-6', className)}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Quality Score Analysis</h2>
            <p className="text-gray-600 mt-1">{qualityData.businessName}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRecalculateScore}
              disabled={refreshing}
            >
              <RefreshCw className={cn("h-4 w-4 mr-2", refreshing && "animate-spin")} />
              Recalculate
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Current Score */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={cn('p-3 rounded-full', scoreDisplay.bgColor)}>
                  {React.cloneElement(scoreDisplay.icon, { className: cn(scoreDisplay.icon.props.className, scoreDisplay.color) })}
                </div>
                {getTrendIndicator(qualityData.currentScore, qualityData.previousScore)}
              </div>
              <div className="space-y-1">
                <p className="text-3xl font-bold text-gray-900">{qualityData.currentScore}%</p>
                <p className={cn('text-sm font-medium', scoreDisplay.color)}>{scoreDisplay.label}</p>
                <p className="text-xs text-gray-500">
                  Updated {new Date(qualityData.lastUpdated).toLocaleDateString()}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Score Breakdown */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg">Score Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-700">Completeness</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Progress value={qualityData.scoreBreakdown.completeness} className="w-20" />
                    <span className="text-sm font-medium w-8">{qualityData.scoreBreakdown.completeness}%</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-700">Recency</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Progress value={qualityData.scoreBreakdown.recency} className="w-20" />
                    <span className="text-sm font-medium w-8">{qualityData.scoreBreakdown.recency}%</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-700">Verification</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Progress value={qualityData.scoreBreakdown.verification} className="w-20" />
                    <span className="text-sm font-medium w-8">{qualityData.scoreBreakdown.verification}%</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-700">Engagement</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Progress value={qualityData.scoreBreakdown.engagement} className="w-20" />
                    <span className="text-sm font-medium w-8">{qualityData.scoreBreakdown.engagement}%</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recommendations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-yellow-500" />
              Improvement Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {qualityData.recommendations.map((recommendation, index) => (
                <div
                  key={index}
                  className="flex items-start gap-4 p-4 border rounded-lg"
                >
                  <Badge className={cn('text-xs', getRecommendationPriorityColor(recommendation.priority))}>
                    {recommendation.priority.toUpperCase()}
                  </Badge>
                  <div className="flex-1 space-y-1">
                    <h4 className="font-medium text-gray-900">{recommendation.title}</h4>
                    <p className="text-sm text-gray-600">{recommendation.description}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>Category: {recommendation.category}</span>
                      <span>Impact: +{recommendation.impact} points</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Overall statistics view
  if (qualityStats) {
    return (
      <div className={cn('space-y-6', className)}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Quality Score Analytics</h2>
            <p className="text-gray-600 mt-1">Directory-wide quality metrics and trends</p>
          </div>
          <div className="flex items-center gap-2">
            <Select value={selectedPeriod} onValueChange={(value: any) => setSelectedPeriod(value)}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchQualityData(false)}
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
            <TabsTrigger value="trends">Trends</TabsTrigger>
            <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <BarChart3 className="h-8 w-8 text-blue-500" />
                    <TrendingUp className="h-4 w-4 text-green-500" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-2xl font-bold text-gray-900">
                      {Math.round(qualityStats.averageScore)}%
                    </p>
                    <p className="text-sm text-gray-600">Average Score</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <Star className="h-8 w-8 text-yellow-500" />
                    <ArrowUpRight className="h-4 w-4 text-green-500" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-2xl font-bold text-gray-900">
                      {qualityStats.scoreDistribution.excellent}
                    </p>
                    <p className="text-sm text-gray-600">Excellent (90%+)</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <TrendingUp className="h-8 w-8 text-green-500" />
                    <span className="text-xs text-gray-500">30d</span>
                  </div>
                  <div className="space-y-1">
                    <p className="text-2xl font-bold text-green-600">
                      {qualityStats.improvements.improved}
                    </p>
                    <p className="text-sm text-gray-600">Improved</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <AlertTriangle className="h-8 w-8 text-red-500" />
                    <span className="text-xs text-gray-500">Need Help</span>
                  </div>
                  <div className="space-y-1">
                    <p className="text-2xl font-bold text-red-600">
                      {qualityStats.scoreDistribution.poor}
                    </p>
                    <p className="text-sm text-gray-600">Poor (&lt;50%)</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Score Distribution */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Score Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span className="text-sm">Excellent (90-100%)</span>
                      </div>
                      <span className="text-sm font-medium">{qualityStats.scoreDistribution.excellent}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <span className="text-sm">Good (70-89%)</span>
                      </div>
                      <span className="text-sm font-medium">{qualityStats.scoreDistribution.good}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                        <span className="text-sm">Fair (50-69%)</span>
                      </div>
                      <span className="text-sm font-medium">{qualityStats.scoreDistribution.fair}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                        <span className="text-sm">Poor (0-49%)</span>
                      </div>
                      <span className="text-sm font-medium">{qualityStats.scoreDistribution.poor}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Changes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <ArrowUpRight className="h-4 w-4 text-green-500" />
                        <span className="text-sm">Improved</span>
                      </div>
                      <span className="text-sm font-medium text-green-600">
                        {qualityStats.improvements.improved}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <ArrowDownRight className="h-4 w-4 text-red-500" />
                        <span className="text-sm">Declined</span>
                      </div>
                      <span className="text-sm font-medium text-red-600">
                        {qualityStats.improvements.declined}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Minus className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">Unchanged</span>
                      </div>
                      <span className="text-sm font-medium text-gray-600">
                        {qualityStats.improvements.unchanged}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="trends" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Quality Trends Over Time</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  <BarChart3 className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                  <p>Trend charts will be displayed here</p>
                  <p className="text-xs">Integration with charting library needed</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="recommendations" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>System-wide Recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 border border-yellow-200 bg-yellow-50 rounded-lg">
                    <div className="flex items-start gap-3">
                      <Info className="h-5 w-5 text-yellow-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-yellow-900">Low completion rates detected</h4>
                        <p className="text-sm text-yellow-800 mt-1">
                          {qualityStats.scoreDistribution.poor + qualityStats.scoreDistribution.fair} businesses have completion scores below 70%. 
                          Consider implementing guided completion flows.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 border border-blue-200 bg-blue-50 rounded-lg">
                    <div className="flex items-start gap-3">
                      <Lightbulb className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-blue-900">Verification opportunity</h4>
                        <p className="text-sm text-blue-800 mt-1">
                          Businesses with verified ABN status show 15% higher quality scores on average. 
                          Promote ABN verification to improve overall directory quality.
                        </p>
                      </div>
                    </div>
                  </div>
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