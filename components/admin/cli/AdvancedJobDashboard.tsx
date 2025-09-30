"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  Terminal,
  Clock,
  CheckCircle,
  XCircle,
  Square,
  Loader2,
  AlertTriangle,
  Activity,
  TrendingUp,
  Filter,
  Search,
  Calendar,
  Users,
  Zap,
  RotateCcw,
  Eye,
  RefreshCw,
  Download,
  Settings
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useJobProgress } from '@/hooks/useJobProgress';
import RealTimeJobMonitor from './RealTimeJobMonitor';

interface CLIJob {
  id: string;
  command: string;
  args: Record<string, any>;
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  progress?: {
    current: number;
    total: number;
    message: string;
    percentage: number;
  };
  result?: {
    success: boolean;
    data?: any;
    error?: string;
    output: string[];
    warnings: string[];
  };
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  createdBy: {
    id: string;
    email: string;
  };
  metadata: Record<string, any>;
}

interface CLIJobStats {
  pending: number;
  running: number;
  completed: number;
  failed: number;
  cancelled: number;
}

interface JobPerformanceMetrics {
  averageExecutionTime: Record<string, number>;
  successRate: Record<string, number>;
  commandFrequency: Record<string, number>;
  hourlyDistribution: Array<{ hour: number; count: number }>;
  dailyTrends: Array<{ date: string; completed: number; failed: number }>;
  resourceUsage: {
    cpu: number[];
    memory: number[];
    activeJobs: number;
  };
}

interface JobQueue {
  name: string;
  priority: 'high' | 'medium' | 'low';
  jobs: CLIJob[];
  maxConcurrent: number;
  activeCount: number;
}

interface AdvancedJobDashboardProps {
  className?: string;
}

export default function AdvancedJobDashboard({ className }: AdvancedJobDashboardProps) {
  // State management
  const [jobs, setJobs] = useState<CLIJob[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<CLIJob[]>([]);
  const [stats, setStats] = useState<CLIJobStats>({
    pending: 0,
    running: 0,
    completed: 0,
    failed: 0,
    cancelled: 0
  });
  const [metrics, setMetrics] = useState<JobPerformanceMetrics>({
    averageExecutionTime: {},
    successRate: {},
    commandFrequency: {},
    hourlyDistribution: [],
    dailyTrends: [],
    resourceUsage: {
      cpu: [],
      memory: [],
      activeJobs: 0
    }
  });
  const [queues, setQueues] = useState<JobQueue[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filtering state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [commandFilter, setCommandFilter] = useState<string>('all');
  const [creatorFilter, setCreatorFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState<string>('week');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // UI state
  const [selectedJob, setSelectedJob] = useState<CLIJob | null>(null);
  const [showMetrics, setShowMetrics] = useState(false);
  const [activeTab, setActiveTab] = useState('monitor');

  // Real-time job monitoring
  const [monitoredJobs, setMonitoredJobs] = useState<Set<string>>(new Set());

  // Fetch jobs data with enhanced metrics
  const fetchJobs = useCallback(async (showLoader = true) => {
    if (showLoader) setLoading(true);
    if (!showLoader) setRefreshing(true);
    
    try {
      const [jobsResponse, metricsResponse] = await Promise.all([
        fetch('/api/admin/cli-bridge/jobs?limit=100&include_metrics=true', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('supabase_access_token')}`,
          },
        }),
        fetch('/api/admin/cli-bridge/metrics', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('supabase_access_token')}`,
          },
        }).catch(() => null) // Optional metrics endpoint
      ]);
      
      if (jobsResponse.ok) {
        const jobsData = await jobsResponse.json();
        setJobs(jobsData.jobs || []);
        setStats(jobsData.stats || {});
        
        // Mock job queues (would be real in production)
        setQueues([
          {
            name: 'High Priority',
            priority: 'high',
            jobs: (jobsData.jobs || []).filter((job: CLIJob) => 
              ['import-csv', 'export-csv'].includes(job.command) && job.status === 'PENDING'
            ),
            maxConcurrent: 2,
            activeCount: (jobsData.jobs || []).filter((job: CLIJob) => 
              ['import-csv', 'export-csv'].includes(job.command) && job.status === 'RUNNING'
            ).length
          },
          {
            name: 'Standard',
            priority: 'medium',
            jobs: (jobsData.jobs || []).filter((job: CLIJob) => 
              !['import-csv', 'export-csv', 'batch-approve', 'batch-reject'].includes(job.command) && job.status === 'PENDING'
            ),
            maxConcurrent: 5,
            activeCount: (jobsData.jobs || []).filter((job: CLIJob) => 
              !['import-csv', 'export-csv', 'batch-approve', 'batch-reject'].includes(job.command) && job.status === 'RUNNING'
            ).length
          },
          {
            name: 'Batch Operations',
            priority: 'low',
            jobs: (jobsData.jobs || []).filter((job: CLIJob) => 
              ['batch-approve', 'batch-reject'].includes(job.command) && job.status === 'PENDING'
            ),
            maxConcurrent: 3,
            activeCount: (jobsData.jobs || []).filter((job: CLIJob) => 
              ['batch-approve', 'batch-reject'].includes(job.command) && job.status === 'RUNNING'
            ).length
          }
        ]);
      }

      // Process metrics if available
      if (metricsResponse?.ok) {
        const metricsData = await metricsResponse.json();
        setMetrics(metricsData.metrics || metrics);
      } else {
        // Generate mock metrics from job data
        const jobList = jobs.length ? jobs : (await jobsResponse.json()).jobs || [];
        generateMockMetrics(jobList);
      }

    } catch (error) {
      console.error('Error fetching jobs and metrics:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [jobs.length, metrics]);

  // Generate mock metrics from job data
  const generateMockMetrics = useCallback((jobList: CLIJob[]) => {
    const commandStats: Record<string, { total: number; successful: number; totalTime: number }> = {};
    const hourlyData: Record<number, number> = {};
    const dailyData: Record<string, { completed: number; failed: number }> = {};

    jobList.forEach(job => {
      // Command statistics
      if (!commandStats[job.command]) {
        commandStats[job.command] = { total: 0, successful: 0, totalTime: 0 };
      }
      commandStats[job.command].total++;
      
      if (job.status === 'COMPLETED') {
        commandStats[job.command].successful++;
      }

      if (job.startedAt && job.completedAt) {
        const duration = new Date(job.completedAt).getTime() - new Date(job.startedAt).getTime();
        commandStats[job.command].totalTime += duration;
      }

      // Hourly distribution
      const hour = new Date(job.createdAt).getHours();
      hourlyData[hour] = (hourlyData[hour] || 0) + 1;

      // Daily trends
      const date = new Date(job.createdAt).toISOString().split('T')[0];
      if (!dailyData[date]) {
        dailyData[date] = { completed: 0, failed: 0 };
      }
      if (job.status === 'COMPLETED') dailyData[date].completed++;
      if (job.status === 'FAILED') dailyData[date].failed++;
    });

    setMetrics({
      averageExecutionTime: Object.entries(commandStats).reduce((acc, [cmd, stats]) => {
        acc[cmd] = stats.total > 0 ? stats.totalTime / stats.total : 0;
        return acc;
      }, {} as Record<string, number>),
      successRate: Object.entries(commandStats).reduce((acc, [cmd, stats]) => {
        acc[cmd] = stats.total > 0 ? (stats.successful / stats.total) * 100 : 0;
        return acc;
      }, {} as Record<string, number>),
      commandFrequency: Object.entries(commandStats).reduce((acc, [cmd, stats]) => {
        acc[cmd] = stats.total;
        return acc;
      }, {} as Record<string, number>),
      hourlyDistribution: Array.from({ length: 24 }, (_, hour) => ({
        hour,
        count: hourlyData[hour] || 0
      })),
      dailyTrends: Object.entries(dailyData).map(([date, data]) => ({
        date,
        ...data
      })).slice(-7), // Last 7 days
      resourceUsage: {
        cpu: Array.from({ length: 10 }, () => Math.random() * 100),
        memory: Array.from({ length: 10 }, () => Math.random() * 100),
        activeJobs: jobList.filter(j => j.status === 'RUNNING').length
      }
    });
  }, []);

  // Filter jobs based on current filters
  const applyFilters = useCallback(() => {
    let filtered = jobs;

    // Search term filter
    if (searchTerm) {
      filtered = filtered.filter(job => 
        job.command.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.createdBy.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(job => job.status === statusFilter);
    }

    // Command filter
    if (commandFilter !== 'all') {
      filtered = filtered.filter(job => job.command === commandFilter);
    }

    // Creator filter
    if (creatorFilter !== 'all') {
      filtered = filtered.filter(job => job.createdBy.email === creatorFilter);
    }

    // Date range filter
    const now = new Date();
    let dateThreshold = new Date();
    
    switch (dateRange) {
      case 'hour':
        dateThreshold.setHours(now.getHours() - 1);
        break;
      case 'day':
        dateThreshold.setDate(now.getDate() - 1);
        break;
      case 'week':
        dateThreshold.setDate(now.getDate() - 7);
        break;
      case 'month':
        dateThreshold.setMonth(now.getMonth() - 1);
        break;
    }
    
    if (dateRange !== 'all') {
      filtered = filtered.filter(job => new Date(job.createdAt) >= dateThreshold);
    }

    setFilteredJobs(filtered);
  }, [jobs, searchTerm, statusFilter, commandFilter, creatorFilter, dateRange]);

  // Initial load and periodic refresh
  useEffect(() => {
    fetchJobs();
    const interval = setInterval(() => fetchJobs(false), 10000); // Refresh every 10 seconds
    return () => clearInterval(interval);
  }, [fetchJobs]);

  // Apply filters when dependencies change
  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  // Get unique values for filters
  const uniqueCommands = useMemo(() => 
    [...new Set(jobs.map(job => job.command))].sort(), 
    [jobs]
  );
  
  const uniqueCreators = useMemo(() => 
    [...new Set(jobs.map(job => job.createdBy.email))].sort(), 
    [jobs]
  );

  // Chart data preparation
  const commandFrequencyData = useMemo(() => 
    Object.entries(metrics.commandFrequency).map(([command, count]) => ({
      command: command.replace('-', ' '),
      count,
      successRate: metrics.successRate[command] || 0
    })), 
    [metrics]
  );

  const statusDistributionData = useMemo(() => [
    { name: 'Completed', value: stats.completed, color: '#10b981' },
    { name: 'Running', value: stats.running, color: '#3b82f6' },
    { name: 'Pending', value: stats.pending, color: '#f59e0b' },
    { name: 'Failed', value: stats.failed, color: '#ef4444' },
    { name: 'Cancelled', value: stats.cancelled, color: '#6b7280' },
  ].filter(item => item.value > 0), [stats]);

  // Status badge component
  const getStatusBadge = (status: CLIJob['status']) => {
    const variants = {
      PENDING: { className: "bg-yellow-100 text-yellow-700", icon: Clock },
      RUNNING: { className: "bg-blue-100 text-blue-700", icon: Loader2 },
      COMPLETED: { className: "bg-green-100 text-green-700", icon: CheckCircle },
      FAILED: { className: "bg-red-100 text-red-700", icon: XCircle },
      CANCELLED: { className: "bg-gray-100 text-gray-700", icon: Square }
    };
    
    const variant = variants[status];
    const Icon = variant.icon;
    
    return (
      <Badge className={variant.className}>
        <Icon className={cn("w-3 h-3 mr-1", status === 'RUNNING' && "animate-spin")} />
        {status}
      </Badge>
    );
  };

  // Queue priority badge
  const getPriorityBadge = (priority: JobQueue['priority']) => {
    const variants = {
      high: { className: "bg-red-100 text-red-700", text: "High" },
      medium: { className: "bg-yellow-100 text-yellow-700", text: "Medium" },
      low: { className: "bg-green-100 text-green-700", text: "Low" }
    };
    
    const variant = variants[priority];
    
    return (
      <Badge className={variant.className}>
        {variant.text}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className={cn('flex items-center justify-center p-12', className)}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Enhanced Header with Controls */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Advanced Job Management</h1>
          <p className="text-gray-600 mt-2">
            Real-time monitoring and management of CLI operations with performance insights
          </p>
        </div>
        
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowMetrics(!showMetrics)}
          >
            <BarChart className="h-4 w-4 mr-2" />
            Metrics
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchJobs(false)}
            disabled={refreshing}
          >
            <RefreshCw className={cn("h-4 w-4 mr-2", refreshing && "animate-spin")} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Advanced Filters */}
      {showAdvancedFilters && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Filter className="h-5 w-5 mr-2" />
              Advanced Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Search</label>
                <div className="relative mt-1">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search jobs..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700">Status</label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="RUNNING">Running</SelectItem>
                    <SelectItem value="COMPLETED">Completed</SelectItem>
                    <SelectItem value="FAILED">Failed</SelectItem>
                    <SelectItem value="CANCELLED">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700">Command</label>
                <Select value={commandFilter} onValueChange={setCommandFilter}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Commands</SelectItem>
                    {uniqueCommands.map(cmd => (
                      <SelectItem key={cmd} value={cmd}>{cmd}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700">Creator</label>
                <Select value={creatorFilter} onValueChange={setCreatorFilter}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Users</SelectItem>
                    {uniqueCreators.map(creator => (
                      <SelectItem key={creator} value={creator}>{creator}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700">Time Range</label>
                <Select value={dateRange} onValueChange={setDateRange}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hour">Last Hour</SelectItem>
                    <SelectItem value="day">Last Day</SelectItem>
                    <SelectItem value="week">Last Week</SelectItem>
                    <SelectItem value="month">Last Month</SelectItem>
                    <SelectItem value="all">All Time</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-end">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    setSearchTerm('');
                    setStatusFilter('all');
                    setCommandFilter('all');
                    setCreatorFilter('all');
                    setDateRange('week');
                  }}
                >
                  Clear All
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Performance Metrics */}
      {showMetrics && (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Command Frequency</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={commandFrequencyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="command" 
                    angle={-45}
                    textAnchor="end"
                    height={60}
                    fontSize={10}
                  />
                  <YAxis fontSize={10} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Status Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={statusDistributionData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {statusDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Daily Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={metrics.dailyTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    fontSize={10}
                    tick={{ fontSize: 10 }}
                  />
                  <YAxis fontSize={10} />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="completed" 
                    stroke="#10b981" 
                    strokeWidth={2}
                    name="Completed"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="failed" 
                    stroke="#ef4444" 
                    strokeWidth={2}
                    name="Failed"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Resource Usage</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Active Jobs</span>
                    <span className="text-sm text-gray-500">{metrics.resourceUsage.activeJobs}</span>
                  </div>
                  <Progress value={(metrics.resourceUsage.activeJobs / 10) * 100} />
                </div>
                
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">CPU Usage</span>
                    <span className="text-sm text-gray-500">
                      {Math.round(metrics.resourceUsage.cpu.slice(-1)[0] || 0)}%
                    </span>
                  </div>
                  <Progress value={metrics.resourceUsage.cpu.slice(-1)[0] || 0} />
                </div>
                
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Memory Usage</span>
                    <span className="text-sm text-gray-500">
                      {Math.round(metrics.resourceUsage.memory.slice(-1)[0] || 0)}%
                    </span>
                  </div>
                  <Progress value={metrics.resourceUsage.memory.slice(-1)[0] || 0} />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Dashboard Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="monitor" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Monitor
          </TabsTrigger>
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="jobs" className="flex items-center gap-2">
            <Terminal className="h-4 w-4" />
            Jobs
          </TabsTrigger>
          <TabsTrigger value="queues" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Queues
          </TabsTrigger>
                  </TabsList>
        
        {/* Real-Time Monitor Tab */}
        <TabsContent value="monitor" className="space-y-6">
          <RealTimeJobMonitor />
        </TabsContent>
        
        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Enhanced Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <Card className="relative overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-center">
                  <Clock className="h-4 w-4 text-yellow-500" />
                  <div className="ml-2">
                    <p className="text-sm font-medium text-gray-600">Pending</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
                  </div>
                </div>
                <div className="absolute top-0 right-0 w-2 h-full bg-yellow-500 opacity-20"></div>
              </CardContent>
            </Card>
            
            <Card className="relative overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-center">
                  <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />
                  <div className="ml-2">
                    <p className="text-sm font-medium text-gray-600">Running</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.running}</p>
                  </div>
                </div>
                <div className="absolute top-0 right-0 w-2 h-full bg-blue-500 opacity-20"></div>
              </CardContent>
            </Card>
            
            <Card className="relative overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <div className="ml-2">
                    <p className="text-sm font-medium text-gray-600">Completed</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.completed}</p>
                  </div>
                </div>
                <div className="absolute top-0 right-0 w-2 h-full bg-green-500 opacity-20"></div>
              </CardContent>
            </Card>
            
            <Card className="relative overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-center">
                  <XCircle className="h-4 w-4 text-red-500" />
                  <div className="ml-2">
                    <p className="text-sm font-medium text-gray-600">Failed</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.failed}</p>
                  </div>
                </div>
                <div className="absolute top-0 right-0 w-2 h-full bg-red-500 opacity-20"></div>
              </CardContent>
            </Card>
            
            <Card className="relative overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-center">
                  <Square className="h-4 w-4 text-gray-500" />
                  <div className="ml-2">
                    <p className="text-sm font-medium text-gray-600">Cancelled</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.cancelled}</p>
                  </div>
                </div>
                <div className="absolute top-0 right-0 w-2 h-full bg-gray-500 opacity-20"></div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredJobs.slice(0, 10).map((job) => {
                  const duration = job.completedAt 
                    ? Math.round((new Date(job.completedAt).getTime() - new Date(job.startedAt || job.createdAt).getTime()) / 1000)
                    : null;
                  
                  return (
                    <div key={job.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Terminal className="h-4 w-4 text-gray-500" />
                        <div>
                          <p className="font-medium text-gray-900">{job.command}</p>
                          <p className="text-sm text-gray-500">
                            by {job.createdBy.email} • {new Date(job.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {duration && (
                          <span className="text-xs text-gray-500">{duration}s</span>
                        )}
                        {getStatusBadge(job.status)}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedJob(job)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Jobs Tab */}
        <TabsContent value="jobs">
          <Card>
            <CardHeader>
              <CardTitle>Job History ({filteredJobs.length})</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Command</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Creator</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredJobs.map((job) => {
                    const duration = job.completedAt 
                      ? Math.round((new Date(job.completedAt).getTime() - new Date(job.startedAt || job.createdAt).getTime()) / 1000)
                      : job.startedAt 
                      ? Math.round((Date.now() - new Date(job.startedAt).getTime()) / 1000)
                      : null;
                    
                    return (
                      <TableRow key={job.id}>
                        <TableCell>
                          <div className="flex items-center">
                            <Terminal className="h-4 w-4 mr-2 text-gray-500" />
                            <span className="font-medium">{job.command}</span>
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          {getStatusBadge(job.status)}
                        </TableCell>
                        
                        <TableCell>
                          {job.progress && job.status === 'RUNNING' ? (
                            <div className="w-24">
                              <Progress value={job.progress.percentage} className="h-2" />
                              <p className="text-xs text-gray-500 mt-1">{job.progress.percentage}%</p>
                            </div>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </TableCell>
                        
                        <TableCell className="text-gray-500 text-sm">
                          {duration ? `${duration}s` : '—'}
                        </TableCell>
                        
                        <TableCell className="text-gray-500 text-sm">
                          {job.createdBy.email}
                        </TableCell>
                        
                        <TableCell className="text-gray-500 text-sm">
                          {new Date(job.createdAt).toLocaleString()}
                        </TableCell>
                        
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedJob(job)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Queues Tab */}
        <TabsContent value="queues" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {queues.map((queue, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{queue.name}</span>
                    {getPriorityBadge(queue.priority)}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between text-sm">
                      <span>Active Jobs</span>
                      <span>{queue.activeCount} / {queue.maxConcurrent}</span>
                    </div>
                    
                    <Progress 
                      value={(queue.activeCount / queue.maxConcurrent) * 100} 
                      className="h-2" 
                    />
                    
                    <div className="text-sm text-gray-600">
                      <p>{queue.jobs.length} jobs in queue</p>
                    </div>
                    
                    {queue.jobs.slice(0, 3).map((job, jobIndex) => (
                      <div key={jobIndex} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span className="text-sm font-medium">{job.command}</span>
                        {getStatusBadge(job.status)}
                      </div>
                    ))}
                    
                    {queue.jobs.length > 3 && (
                      <p className="text-xs text-gray-500 text-center">
                        and {queue.jobs.length - 3} more...
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Hourly Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={metrics.hourlyDistribution}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="hour" 
                      tickFormatter={(hour) => `${hour}:00`}
                    />
                    <YAxis />
                    <Tooltip 
                      labelFormatter={(hour) => `${hour}:00`}
                      formatter={(value) => [value, 'Jobs']}
                    />
                    <Bar dataKey="count" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Success Rates by Command</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(metrics.successRate).map(([command, rate]) => (
                    <div key={command}>
                      <div className="flex justify-between text-sm mb-1">
                        <span>{command}</span>
                        <span>{Math.round(rate)}%</span>
                      </div>
                      <Progress value={rate} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Average Execution Times</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart 
                  data={Object.entries(metrics.averageExecutionTime).map(([command, time]) => ({
                    command: command.replace('-', ' '),
                    time: Math.round(time / 1000) // Convert to seconds
                  }))}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="command" 
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis />
                  <Tooltip 
                    formatter={(value) => [`${value}s`, 'Average Time']}
                  />
                  <Bar dataKey="time" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Job Details Modal */}
      <Dialog open={!!selectedJob} onOpenChange={() => setSelectedJob(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Terminal className="h-5 w-5 mr-2" />
              Job Details: {selectedJob?.command}
            </DialogTitle>
          </DialogHeader>
          
          {selectedJob && (
            <div className="space-y-6">
              {/* Job Overview */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-600">Status</p>
                  <div className="mt-1">{getStatusBadge(selectedJob.status)}</div>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-600">Created</p>
                  <p className="mt-1 text-sm">{new Date(selectedJob.createdAt).toLocaleString()}</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-600">Creator</p>
                  <p className="mt-1 text-sm">{selectedJob.createdBy.email}</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-600">Duration</p>
                  <p className="mt-1 text-sm">
                    {selectedJob.completedAt 
                      ? `${Math.round((new Date(selectedJob.completedAt).getTime() - new Date(selectedJob.startedAt || selectedJob.createdAt).getTime()) / 1000)}s`
                      : selectedJob.startedAt 
                      ? `${Math.round((Date.now() - new Date(selectedJob.startedAt).getTime()) / 1000)}s`
                      : '—'
                    }
                  </p>
                </div>
              </div>
              
              {/* Progress */}
              {selectedJob.progress && (
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-2">Progress</p>
                  <div>
                    <Progress value={selectedJob.progress.percentage} className="h-3" />
                    <p className="text-sm text-gray-500 mt-1">{selectedJob.progress.message}</p>
                  </div>
                </div>
              )}
              
              {/* Arguments */}
              <div>
                <p className="text-sm font-medium text-gray-600 mb-2">Arguments</p>
                <pre className="text-xs bg-gray-50 p-3 rounded border overflow-x-auto">
                  {JSON.stringify(selectedJob.args, null, 2)}
                </pre>
              </div>
              
              {/* Metadata */}
              {Object.keys(selectedJob.metadata).length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-2">Metadata</p>
                  <pre className="text-xs bg-gray-50 p-3 rounded border overflow-x-auto">
                    {JSON.stringify(selectedJob.metadata, null, 2)}
                  </pre>
                </div>
              )}
              
              {/* Results */}
              {selectedJob.result && (
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-2">Results</p>
                  <div className="space-y-3">
                    {selectedJob.result.output.length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-gray-500 mb-1">Output:</p>
                        <pre className="text-xs bg-gray-50 p-3 rounded border overflow-x-auto">
                          {selectedJob.result.output.join('\n')}
                        </pre>
                      </div>
                    )}
                    
                    {selectedJob.result.warnings.length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-orange-600 mb-1">Warnings:</p>
                        <pre className="text-xs bg-orange-50 p-3 rounded border border-orange-200 overflow-x-auto">
                          {selectedJob.result.warnings.join('\n')}
                        </pre>
                      </div>
                    )}
                    
                    {selectedJob.result.error && (
                      <div>
                        <p className="text-xs font-medium text-red-600 mb-1">Error:</p>
                        <pre className="text-xs bg-red-50 p-3 rounded border border-red-200 overflow-x-auto">
                          {selectedJob.result.error}
                        </pre>
                      </div>
                    )}
                    
                    {selectedJob.result.data && (
                      <div>
                        <p className="text-xs font-medium text-gray-500 mb-1">Data:</p>
                        <pre className="text-xs bg-gray-50 p-3 rounded border overflow-x-auto">
                          {JSON.stringify(selectedJob.result.data, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}