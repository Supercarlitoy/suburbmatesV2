"use client";

import React, { useState, useEffect, useCallback } from 'react';
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
  Terminal,
  Upload,
  Download,
  Play,
  Square,
  RotateCcw,
  FileText,
  BarChart3,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  FileX2,
  Loader2,
  Eye,
  Trash2,
  RefreshCw
} from 'lucide-react';
import { cn } from '@/lib/utils';

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

interface CLIOperationsDashboardProps {
  className?: string;
}

export default function CLIOperationsDashboard({ className }: CLIOperationsDashboardProps) {
  const [jobs, setJobs] = useState<CLIJob[]>([]);
  const [stats, setStats] = useState<CLIJobStats>({
    pending: 0,
    running: 0,
    completed: 0,
    failed: 0,
    cancelled: 0
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // State for forms
  const [showImportForm, setShowImportForm] = useState(false);
  const [showExportForm, setShowExportForm] = useState(false);
  const [showBatchForm, setShowBatchForm] = useState(false);
  const [selectedJobDetails, setSelectedJobDetails] = useState<CLIJob | null>(null);
  
  // Import form state
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importDedupe, setImportDedupe] = useState<'strict' | 'loose'>('strict');
  const [importDryRun, setImportDryRun] = useState(false);
  
  // Export form state
  const [exportStatus, setExportStatus] = useState<string>('');
  const [exportFilename, setExportFilename] = useState('businesses-export.csv');
  
  // Batch operations form state
  const [batchOperation, setBatchOperation] = useState<string>('');
  const [batchBusinessIds, setBatchBusinessIds] = useState<string>('');
  const [batchReason, setBatchReason] = useState<string>('');

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Fetch jobs data
  const fetchJobs = useCallback(async (showLoader = true) => {
    if (showLoader) setLoading(true);
    if (!showLoader) setRefreshing(true);
    
    try {
      const response = await fetch(`/api/admin/cli-bridge/jobs?page=${page}&limit=20`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('supabase_access_token')}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setJobs(data.jobs || []);
        setStats(data.stats || {});
        setTotalPages(data.pagination?.totalPages || 1);
      }
    } catch (error) {
      console.error('Error fetching CLI jobs:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [page]);

  // Initial load and polling
  useEffect(() => {
    fetchJobs();
    const interval = setInterval(() => fetchJobs(false), 5000); // Poll every 5 seconds
    return () => clearInterval(interval);
  }, [fetchJobs]);

  // Create job helper
  const createJob = async (command: string, args: Record<string, any>, metadata?: Record<string, any>) => {
    try {
      const response = await fetch('/api/admin/cli-bridge/jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('supabase_access_token')}`,
        },
        body: JSON.stringify({ command, args, metadata }),
      });
      
      if (response.ok) {
        fetchJobs(false); // Refresh jobs list
        return true;
      }
    } catch (error) {
      console.error('Error creating job:', error);
    }
    return false;
  };

  // Handle import CSV
  const handleImportCSV = async () => {
    if (!importFile) return;
    
    const success = await createJob('import-csv', {
      file: importFile.name,
      dedupe: importDedupe,
      dryRun: importDryRun
    }, {
      originalFilename: importFile.name,
      fileSize: importFile.size
    });
    
    if (success) {
      setShowImportForm(false);
      setImportFile(null);
      setImportDryRun(false);
    }
  };

  // Handle export CSV
  const handleExportCSV = async () => {
    const success = await createJob('export-csv', {
      output: exportFilename,
      status: exportStatus || undefined
    });
    
    if (success) {
      setShowExportForm(false);
      setExportFilename('businesses-export.csv');
      setExportStatus('');
    }
  };

  // Handle batch operations
  const handleBatchOperation = async () => {
    if (!batchOperation || !batchBusinessIds.trim()) return;
    
    const businessIds = batchBusinessIds.split(',').map(id => id.trim()).filter(Boolean);
    
    const success = await createJob(batchOperation, {
      businessIds,
      reason: batchReason || undefined
    });
    
    if (success) {
      setShowBatchForm(false);
      setBatchOperation('');
      setBatchBusinessIds('');
      setBatchReason('');
    }
  };

  // Handle quick actions
  const handleQuickAction = async (action: string) => {
    switch (action) {
      case 'stats':
        await createJob('stats', {});
        break;
      case 'list-suburbs':
        await createJob('list-suburbs', {});
        break;
      case 'list-categories':
        await createJob('list-categories', {});
        break;
      case 'duplicate-detection':
        await createJob('duplicate-detection', {});
        break;
      case 'quality-recalculation':
        await createJob('quality-recalculation', {});
        break;
    }
  };

  // Cancel job
  const cancelJob = async (jobId: string) => {
    try {
      const response = await fetch(`/api/admin/cli-bridge/jobs/${jobId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('supabase_access_token')}`,
        },
      });
      
      if (response.ok) {
        fetchJobs(false);
      }
    } catch (error) {
      console.error('Error cancelling job:', error);
    }
  };

  // Retry job
  const retryJob = async (jobId: string) => {
    try {
      const response = await fetch(`/api/admin/cli-bridge/jobs/${jobId}/retry`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('supabase_access_token')}`,
        },
      });
      
      if (response.ok) {
        fetchJobs(false);
      }
    } catch (error) {
      console.error('Error retrying job:', error);
    }
  };

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
        <Icon className="w-3 h-3 mr-1" />
        {status}
      </Badge>
    );
  };

  const getCommandIcon = (command: string) => {
    const icons = {
      'import-csv': Upload,
      'export-csv': Download,
      'stats': BarChart3,
      'list-businesses': FileText,
      'list-suburbs': FileText,
      'list-categories': FileText,
      'duplicate-detection': FileX2,
      'quality-recalculation': RefreshCw,
      'batch-approve': CheckCircle,
      'batch-reject': XCircle,
      'approve-business': CheckCircle,
      'reject-business': XCircle
    };
    
    return icons[command as keyof typeof icons] || Terminal;
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">CLI Operations</h1>
          <p className="text-gray-600 mt-2">
            Execute CLI commands through the web interface with real-time monitoring
          </p>
        </div>
        <div className="flex items-center gap-2">
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

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Clock className="h-4 w-4 text-yellow-500" />
              <div className="ml-2">
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />
              <div className="ml-2">
                <p className="text-sm font-medium text-gray-600">Running</p>
                <p className="text-2xl font-bold text-gray-900">{stats.running}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <div className="ml-2">
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">{stats.completed}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <XCircle className="h-4 w-4 text-red-500" />
              <div className="ml-2">
                <p className="text-sm font-medium text-gray-600">Failed</p>
                <p className="text-2xl font-bold text-gray-900">{stats.failed}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Square className="h-4 w-4 text-gray-500" />
              <div className="ml-2">
                <p className="text-sm font-medium text-gray-600">Cancelled</p>
                <p className="text-2xl font-bold text-gray-900">{stats.cancelled}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Terminal className="h-5 w-5 mr-2" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
            <Button
              variant="outline"
              className="h-20 flex flex-col items-center"
              onClick={() => setShowImportForm(true)}
            >
              <Upload className="h-5 w-5 mb-2" />
              Import CSV
            </Button>
            
            <Button
              variant="outline"
              className="h-20 flex flex-col items-center"
              onClick={() => setShowExportForm(true)}
            >
              <Download className="h-5 w-5 mb-2" />
              Export CSV
            </Button>
            
            <Button
              variant="outline"
              className="h-20 flex flex-col items-center"
              onClick={() => setShowBatchForm(true)}
            >
              <CheckCircle className="h-5 w-5 mb-2" />
              Batch Ops
            </Button>
            
            <Button
              variant="outline"
              className="h-20 flex flex-col items-center"
              onClick={() => handleQuickAction('stats')}
            >
              <BarChart3 className="h-5 w-5 mb-2" />
              Statistics
            </Button>
            
            <Button
              variant="outline"
              className="h-20 flex flex-col items-center"
              onClick={() => handleQuickAction('duplicate-detection')}
            >
              <FileX2 className="h-5 w-5 mb-2" />
              Duplicates
            </Button>
            
            <Button
              variant="outline"
              className="h-20 flex flex-col items-center"
              onClick={() => handleQuickAction('quality-recalculation')}
            >
              <RefreshCw className="h-5 w-5 mb-2" />
              Quality
            </Button>
            
            <Button
              variant="outline"
              className="h-20 flex flex-col items-center"
              onClick={() => handleQuickAction('list-suburbs')}
            >
              <FileText className="h-5 w-5 mb-2" />
              Suburbs
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Jobs Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Jobs</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {jobs.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No CLI jobs found. Click on Quick Actions above to get started.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Command</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Created By</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {jobs.map((job) => {
                  const Icon = getCommandIcon(job.command);
                  const duration = job.completedAt 
                    ? Math.round((new Date(job.completedAt).getTime() - new Date(job.startedAt || job.createdAt).getTime()) / 1000)
                    : job.startedAt 
                    ? Math.round((Date.now() - new Date(job.startedAt).getTime()) / 1000)
                    : 0;
                  
                  return (
                    <TableRow key={job.id}>
                      <TableCell>
                        <div className="flex items-center">
                          <Icon className="h-4 w-4 mr-2 text-gray-500" />
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
                        {new Date(job.createdAt).toLocaleString()}
                      </TableCell>
                      
                      <TableCell className="text-gray-500 text-sm">
                        {duration > 0 ? `${duration}s` : '—'}
                      </TableCell>
                      
                      <TableCell className="text-gray-500 text-sm">
                        {job.createdBy.email}
                      </TableCell>
                      
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedJobDetails(job)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          
                          {job.status === 'FAILED' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => retryJob(job.id)}
                            >
                              <RotateCcw className="h-4 w-4" />
                            </Button>
                          )}
                          
                          {(['PENDING', 'RUNNING'] as const).includes(job.status) && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => cancelJob(job.id)}
                            >
                              <Square className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Import CSV Dialog */}
      <Dialog open={showImportForm} onOpenChange={setShowImportForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Import CSV</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">CSV File</label>
              <Input
                type="file"
                accept=".csv"
                onChange={(e) => setImportFile(e.target.files?.[0] || null)}
                className="mt-1"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium">Deduplication Mode</label>
              <Select value={importDedupe} onValueChange={(value: 'strict' | 'loose') => setImportDedupe(value)}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="strict">Strict (Phone/Domain/Name+Suburb)</SelectItem>
                  <SelectItem value="loose">Loose (80% name similarity)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="dryRun"
                checked={importDryRun}
                onChange={(e) => setImportDryRun(e.target.checked)}
              />
              <label htmlFor="dryRun" className="text-sm">Dry run (preview changes)</label>
            </div>
            
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowImportForm(false)}>
                Cancel
              </Button>
              <Button onClick={handleImportCSV} disabled={!importFile}>
                Import
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Export CSV Dialog */}
      <Dialog open={showExportForm} onOpenChange={setShowExportForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Export CSV</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Output Filename</label>
              <Input
                value={exportFilename}
                onChange={(e) => setExportFilename(e.target.value)}
                className="mt-1"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium">Filter by Status</label>
              <Select value={exportStatus} onValueChange={setExportStatus}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Statuses</SelectItem>
                  <SelectItem value="APPROVED">Approved</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="REJECTED">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowExportForm(false)}>
                Cancel
              </Button>
              <Button onClick={handleExportCSV}>
                Export
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Batch Operations Dialog */}
      <Dialog open={showBatchForm} onOpenChange={setShowBatchForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Batch Operations</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Operation</label>
              <Select value={batchOperation} onValueChange={setBatchOperation}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select operation" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="batch-approve">Batch Approve</SelectItem>
                  <SelectItem value="batch-reject">Batch Reject</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium">Business IDs</label>
              <Textarea
                placeholder="Enter comma-separated business IDs"
                value={batchBusinessIds}
                onChange={(e) => setBatchBusinessIds(e.target.value)}
                className="mt-1"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium">Reason (Optional)</label>
              <Input
                value={batchReason}
                onChange={(e) => setBatchReason(e.target.value)}
                className="mt-1"
                placeholder="Reason for batch operation"
              />
            </div>
            
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowBatchForm(false)}>
                Cancel
              </Button>
              <Button onClick={handleBatchOperation} disabled={!batchOperation || !batchBusinessIds.trim()}>
                Execute
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Job Details Dialog */}
      <Dialog open={!!selectedJobDetails} onOpenChange={() => setSelectedJobDetails(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              {selectedJobDetails && (
                <>
                  {React.createElement(getCommandIcon(selectedJobDetails.command), { className: "h-5 w-5 mr-2" })}
                  Job Details: {selectedJobDetails.command}
                </>
              )}
            </DialogTitle>
          </DialogHeader>
          
          {selectedJobDetails && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-600">Status</p>
                  <div className="mt-1">{getStatusBadge(selectedJobDetails.status)}</div>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-600">Created</p>
                  <p className="mt-1 text-sm">{new Date(selectedJobDetails.createdAt).toLocaleString()}</p>
                </div>
              </div>
              
              {selectedJobDetails.progress && (
                <div>
                  <p className="text-sm font-medium text-gray-600">Progress</p>
                  <div className="mt-1">
                    <Progress value={selectedJobDetails.progress.percentage} className="h-2" />
                    <p className="text-xs text-gray-500 mt-1">{selectedJobDetails.progress.message}</p>
                  </div>
                </div>
              )}
              
              <div>
                <p className="text-sm font-medium text-gray-600">Arguments</p>
                <pre className="mt-1 text-xs bg-gray-50 p-2 rounded border overflow-x-auto">
                  {JSON.stringify(selectedJobDetails.args, null, 2)}
                </pre>
              </div>
              
              {selectedJobDetails.result && (
                <div>
                  <p className="text-sm font-medium text-gray-600">Result</p>
                  <div className="mt-1 space-y-2">
                    {selectedJobDetails.result.output.length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-gray-500">Output:</p>
                        <pre className="text-xs bg-gray-50 p-2 rounded border overflow-x-auto">
                          {selectedJobDetails.result.output.join('\n')}
                        </pre>
                      </div>
                    )}
                    
                    {selectedJobDetails.result.warnings.length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-orange-600">Warnings:</p>
                        <pre className="text-xs bg-orange-50 p-2 rounded border overflow-x-auto">
                          {selectedJobDetails.result.warnings.join('\n')}
                        </pre>
                      </div>
                    )}
                    
                    {selectedJobDetails.result.error && (
                      <div>
                        <p className="text-xs font-medium text-red-600">Error:</p>
                        <pre className="text-xs bg-red-50 p-2 rounded border overflow-x-auto">
                          {selectedJobDetails.result.error}
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