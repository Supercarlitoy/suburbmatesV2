'use client';

import React, { useState, useEffect } from 'react';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  FileText,
  Search,
  Filter,
  Download,
  RefreshCw,
  Eye,
  Calendar,
  Clock,
  User,
  Building2,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
  Settings,
  Database,
  Mail,
  Phone,
  Globe,
  GitMerge,
  Trash2,
  Edit3,
  Upload,
  Target,
  Zap,
  Shield,
  Activity,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface AuditLogEntry {
  id: string;
  action: string;
  actorId?: string;
  targetType?: string;
  target?: string;
  oldValues?: Record<string, any>;
  newValues?: Record<string, any>;
  meta?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
  
  // Resolved relationships
  actor?: {
    id: string;
    email: string;
    role?: string;
  };
  targetBusiness?: {
    id: string;
    name: string;
    slug?: string;
  };
  targetUser?: {
    id: string;
    email: string;
  };
}

interface AuditStats {
  totalEntries: number;
  todayEntries: number;
  weekEntries: number;
  monthEntries: number;
  topActions: Array<{
    action: string;
    count: number;
    percentage: number;
  }>;
  topUsers: Array<{
    userId: string;
    userEmail: string;
    count: number;
    lastActivity: string;
  }>;
  failureRate: number;
  systemHealth: 'healthy' | 'warning' | 'critical';
}

interface AuditTrailViewProps {
  className?: string;
  targetId?: string; // If provided, shows audit logs for specific target
  targetType?: string; // business, user, system, etc.
  actorId?: string; // If provided, shows logs for specific actor
}

export default function AuditTrailView({ 
  className,
  targetId,
  targetType,
  actorId
}: AuditTrailViewProps) {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [auditStats, setAuditStats] = useState<AuditStats | null>(null);
  const [selectedEntry, setSelectedEntry] = useState<AuditLogEntry | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [actorFilter, setActorFilter] = useState('');
  const [dateRange, setDateRange] = useState<'today' | '7d' | '30d' | '90d' | 'all'>('7d');
  const [severityFilter, setSeverityFilter] = useState<'all' | 'info' | 'warning' | 'error'>('all');
  
  // Pagination
  const [page, setPage] = useState(1);
  const [limit] = useState(50);
  const [hasMore, setHasMore] = useState(true);

  // Fetch audit logs
  const fetchAuditLogs = async (showLoader = true, resetPage = false) => {
    if (showLoader) setLoading(true);
    else setRefreshing(true);

    try {
      const params = new URLSearchParams({
        page: (resetPage ? 1 : page).toString(),
        limit: limit.toString(),
        dateRange
      });

      if (targetId) params.append('targetId', targetId);
      if (targetType) params.append('targetType', targetType);
      if (actorId) params.append('actorId', actorId);
      if (searchTerm) params.append('search', searchTerm);
      if (actionFilter) params.append('action', actionFilter);
      if (actorFilter) params.append('actor', actorFilter);
      if (severityFilter !== 'all') params.append('severity', severityFilter);

      const response = await fetch(`/api/admin/audit-logs?${params}`);
      if (!response.ok) throw new Error('Failed to fetch audit logs');
      
      const data = await response.json();
      
      if (resetPage || page === 1) {
        setAuditLogs(data.logs || []);
      } else {
        setAuditLogs(prev => [...prev, ...(data.logs || [])]);
      }
      
      setHasMore(data.hasMore || false);
      
      // Only fetch stats on initial load or refresh
      if (showLoader || resetPage) {
        setAuditStats(data.stats || null);
      }
      
      if (resetPage) setPage(1);
      
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      setAuditLogs([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAuditLogs(true, true);
  }, [targetId, targetType, actorId, searchTerm, actionFilter, actorFilter, dateRange, severityFilter]);

  // Load more entries
  const loadMore = () => {
    setPage(prev => prev + 1);
    fetchAuditLogs(false, false);
  };

  // Get action icon and color
  const getActionDisplay = (action: string) => {
    const lowerAction = action.toLowerCase();
    
    if (lowerAction.includes('create') || lowerAction.includes('register')) {
      return { icon: <CheckCircle className="h-4 w-4" />, color: 'text-green-600 bg-green-100', severity: 'info' };
    }
    if (lowerAction.includes('update') || lowerAction.includes('edit')) {
      return { icon: <Edit3 className="h-4 w-4" />, color: 'text-blue-600 bg-blue-100', severity: 'info' };
    }
    if (lowerAction.includes('delete') || lowerAction.includes('remove')) {
      return { icon: <Trash2 className="h-4 w-4" />, color: 'text-red-600 bg-red-100', severity: 'warning' };
    }
    if (lowerAction.includes('approve')) {
      return { icon: <CheckCircle className="h-4 w-4" />, color: 'text-green-600 bg-green-100', severity: 'info' };
    }
    if (lowerAction.includes('reject')) {
      return { icon: <XCircle className="h-4 w-4" />, color: 'text-red-600 bg-red-100', severity: 'warning' };
    }
    if (lowerAction.includes('merge')) {
      return { icon: <GitMerge className="h-4 w-4" />, color: 'text-purple-600 bg-purple-100', severity: 'info' };
    }
    if (lowerAction.includes('login') || lowerAction.includes('auth')) {
      return { icon: <Shield className="h-4 w-4" />, color: 'text-indigo-600 bg-indigo-100', severity: 'info' };
    }
    if (lowerAction.includes('error') || lowerAction.includes('fail')) {
      return { icon: <AlertTriangle className="h-4 w-4" />, color: 'text-red-600 bg-red-100', severity: 'error' };
    }
    if (lowerAction.includes('export') || lowerAction.includes('import')) {
      return { icon: <Upload className="h-4 w-4" />, color: 'text-orange-600 bg-orange-100', severity: 'info' };
    }
    
    return { icon: <Activity className="h-4 w-4" />, color: 'text-gray-600 bg-gray-100', severity: 'info' };
  };

  // Get target type icon
  const getTargetIcon = (targetType?: string) => {
    switch (targetType?.toLowerCase()) {
      case 'business':
        return <Building2 className="h-4 w-4" />;
      case 'user':
        return <User className="h-4 w-4" />;
      case 'system':
        return <Settings className="h-4 w-4" />;
      default:
        return <Database className="h-4 w-4" />;
    }
  };

  // Format metadata for display
  const formatMetadata = (meta?: Record<string, any>) => {
    if (!meta) return null;
    
    return Object.entries(meta).map(([key, value]) => ({
      key,
      value: typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)
    }));
  };

  // Get severity badge color
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'error':
        return 'bg-red-100 text-red-700';
      case 'warning':
        return 'bg-orange-100 text-orange-700';
      case 'info':
        return 'bg-blue-100 text-blue-700';
      default:
        return 'bg-gray-100 text-gray-700';
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

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FileText className="h-6 w-6" />
            Audit Trail
          </h2>
          <p className="text-gray-600 mt-1">
            {targetId 
              ? `Audit history for ${targetType || 'selected item'}`
              : actorId 
              ? 'User activity history'
              : 'Complete system audit log'
            }
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchAuditLogs(false, true)}
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

      {/* Stats Overview */}
      {auditStats && !targetId && !actorId && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <Activity className="h-8 w-8 text-blue-500" />
                <Badge className={cn('text-xs', 
                  auditStats.systemHealth === 'healthy' ? 'bg-green-100 text-green-700' :
                  auditStats.systemHealth === 'warning' ? 'bg-orange-100 text-orange-700' :
                  'bg-red-100 text-red-700'
                )}>
                  {auditStats.systemHealth.toUpperCase()}
                </Badge>
              </div>
              <div className="space-y-1">
                <p className="text-2xl font-bold text-gray-900">{auditStats.todayEntries}</p>
                <p className="text-sm text-gray-600">Today's Events</p>
                <p className="text-xs text-gray-500">
                  {auditStats.totalEntries.toLocaleString()} total entries
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <Calendar className="h-8 w-8 text-green-500" />
                <span className="text-xs text-gray-500">7d</span>
              </div>
              <div className="space-y-1">
                <p className="text-2xl font-bold text-gray-900">{auditStats.weekEntries}</p>
                <p className="text-sm text-gray-600">This Week</p>
                <p className="text-xs text-gray-500">
                  {auditStats.monthEntries} this month
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <Target className="h-8 w-8 text-purple-500" />
                <Badge className="text-xs bg-purple-100 text-purple-700">
                  {auditStats.topActions[0]?.action || 'N/A'}
                </Badge>
              </div>
              <div className="space-y-1">
                <p className="text-2xl font-bold text-gray-900">
                  {auditStats.topActions[0]?.count || 0}
                </p>
                <p className="text-sm text-gray-600">Top Action</p>
                <p className="text-xs text-gray-500">
                  {auditStats.topActions[0]?.percentage.toFixed(1)}% of all events
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <Shield className="h-8 w-8 text-orange-500" />
                <Badge className={cn('text-xs', 
                  auditStats.failureRate > 10 ? 'bg-red-100 text-red-700' :
                  auditStats.failureRate > 5 ? 'bg-orange-100 text-orange-700' :
                  'bg-green-100 text-green-700'
                )}>
                  {auditStats.failureRate.toFixed(1)}%
                </Badge>
              </div>
              <div className="space-y-1">
                <p className="text-2xl font-bold text-gray-900">
                  {auditStats.topUsers.length}
                </p>
                <p className="text-sm text-gray-600">Active Users</p>
                <p className="text-xs text-gray-500">Failure rate shown</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search audit logs by action, user, or details..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            
            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="All Actions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Actions</SelectItem>
                <SelectItem value="CREATE">Create</SelectItem>
                <SelectItem value="UPDATE">Update</SelectItem>
                <SelectItem value="DELETE">Delete</SelectItem>
                <SelectItem value="APPROVE">Approve</SelectItem>
                <SelectItem value="REJECT">Reject</SelectItem>
                <SelectItem value="MERGE">Merge</SelectItem>
                <SelectItem value="LOGIN">Login</SelectItem>
              </SelectContent>
            </Select>

            <Select value={severityFilter} onValueChange={setSeverityFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="All Levels" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="info">Info</SelectItem>
                <SelectItem value="warning">Warning</SelectItem>
                <SelectItem value="error">Error</SelectItem>
              </SelectContent>
            </Select>

            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
                <SelectItem value="all">All time</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Audit Log Table */}
      <Card>
        <CardContent className="p-0">
          {auditLogs.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Audit Logs Found</h3>
              <p>No audit entries match your current filters.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Actor</TableHead>
                  <TableHead>Target</TableHead>
                  <TableHead>Details</TableHead>
                  <TableHead>IP Address</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {auditLogs.map((entry) => {
                  const actionDisplay = getActionDisplay(entry.action);
                  
                  return (
                    <TableRow key={entry.id} className="hover:bg-gray-50">
                      <TableCell className="font-mono text-sm">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Clock className="h-3 w-3 text-gray-400" />
                            <span>{new Date(entry.createdAt).toLocaleTimeString()}</span>
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(entry.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className={cn('p-1.5 rounded-full', actionDisplay.color)}>
                            {actionDisplay.icon}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{entry.action}</p>
                            <Badge className={cn('text-xs', getSeverityColor(actionDisplay.severity))}>
                              {actionDisplay.severity}
                            </Badge>
                          </div>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        {entry.actor ? (
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <User className="h-3 w-3 text-gray-400" />
                              <span className="font-medium text-gray-900">{entry.actor.email}</span>
                            </div>
                            {entry.actor.role && (
                              <Badge variant="outline" className="text-xs">
                                {entry.actor.role}
                              </Badge>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-500 text-sm">System</span>
                        )}
                      </TableCell>
                      
                      <TableCell>
                        {entry.target ? (
                          <div className="flex items-center gap-2">
                            {getTargetIcon(entry.targetType)}
                            <div>
                              <p className="font-medium text-gray-900">
                                {entry.targetBusiness?.name || entry.targetUser?.email || entry.target}
                              </p>
                              {entry.targetType && (
                                <p className="text-xs text-gray-500">{entry.targetType}</p>
                              )}
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-500 text-sm">—</span>
                        )}
                      </TableCell>
                      
                      <TableCell className="max-w-xs">
                        <div className="space-y-1">
                          {entry.meta && Object.keys(entry.meta).length > 0 && (
                            <div className="text-sm text-gray-600">
                              {Object.entries(entry.meta).slice(0, 2).map(([key, value]) => (
                                <div key={key} className="truncate">
                                  <span className="font-medium">{key}:</span> {String(value)}
                                </div>
                              ))}
                              {Object.keys(entry.meta).length > 2 && (
                                <span className="text-xs text-gray-500">
                                  +{Object.keys(entry.meta).length - 2} more
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      
                      <TableCell className="font-mono text-xs text-gray-500">
                        {entry.ipAddress || '—'}
                      </TableCell>
                      
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedEntry(entry);
                            setShowDetailsDialog(true);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Load More */}
      {hasMore && auditLogs.length > 0 && (
        <div className="flex justify-center">
          <Button
            variant="outline"
            onClick={loadMore}
            disabled={refreshing}
          >
            {refreshing ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <ChevronRight className="h-4 w-4 mr-2" />
            )}
            Load More
          </Button>
        </div>
      )}

      {/* Details Dialog */}
      {selectedEntry && (
        <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Audit Entry Details
              </DialogTitle>
              <DialogDescription>
                Complete information for audit entry {selectedEntry.id}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Entry Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">ID</span>
                      <span className="font-mono text-sm">{selectedEntry.id}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Timestamp</span>
                      <span className="text-sm">
                        {new Date(selectedEntry.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Action</span>
                      <Badge className={cn('text-xs', getActionDisplay(selectedEntry.action).color)}>
                        {selectedEntry.action}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">IP Address</span>
                      <span className="font-mono text-sm">{selectedEntry.ipAddress || '—'}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Actor & Target</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-2">
                      <span className="text-sm text-gray-600">Actor</span>
                      {selectedEntry.actor ? (
                        <div className="space-y-1">
                          <p className="font-medium">{selectedEntry.actor.email}</p>
                          {selectedEntry.actor.role && (
                            <Badge variant="outline" className="text-xs">
                              {selectedEntry.actor.role}
                            </Badge>
                          )}
                        </div>
                      ) : (
                        <p className="text-gray-500">System</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <span className="text-sm text-gray-600">Target</span>
                      {selectedEntry.target ? (
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            {getTargetIcon(selectedEntry.targetType)}
                            <p className="font-medium">
                              {selectedEntry.targetBusiness?.name || 
                               selectedEntry.targetUser?.email || 
                               selectedEntry.target}
                            </p>
                          </div>
                          {selectedEntry.targetType && (
                            <Badge variant="outline" className="text-xs">
                              {selectedEntry.targetType}
                            </Badge>
                          )}
                          {selectedEntry.targetBusiness?.slug && (
                            <Button variant="ghost" size="sm" asChild>
                              <a 
                                href={`/business/${selectedEntry.targetBusiness.slug}`} 
                                target="_blank" 
                                rel="noopener noreferrer"
                              >
                                <ExternalLink className="h-3 w-3 mr-1" />
                                View Business
                              </a>
                            </Button>
                          )}
                        </div>
                      ) : (
                        <p className="text-gray-500">—</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Changes */}
              {(selectedEntry.oldValues || selectedEntry.newValues) && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Changes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {selectedEntry.oldValues && (
                        <div>
                          <h4 className="font-medium text-red-600 mb-3">Previous Values</h4>
                          <pre className="text-xs bg-red-50 p-4 rounded-lg overflow-auto max-h-64">
                            {JSON.stringify(selectedEntry.oldValues, null, 2)}
                          </pre>
                        </div>
                      )}
                      {selectedEntry.newValues && (
                        <div>
                          <h4 className="font-medium text-green-600 mb-3">New Values</h4>
                          <pre className="text-xs bg-green-50 p-4 rounded-lg overflow-auto max-h-64">
                            {JSON.stringify(selectedEntry.newValues, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Metadata */}
              {selectedEntry.meta && Object.keys(selectedEntry.meta).length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Metadata</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {formatMetadata(selectedEntry.meta)?.map((item, index) => (
                        <div key={index} className="flex items-start gap-4 py-2 border-b border-gray-100 last:border-b-0">
                          <span className="text-sm font-medium text-gray-600 min-w-[120px]">
                            {item.key}:
                          </span>
                          <span className="text-sm text-gray-900 flex-1 font-mono">
                            {item.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* User Agent */}
              {selectedEntry.userAgent && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">User Agent</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs font-mono bg-gray-50 p-4 rounded-lg">
                      {selectedEntry.userAgent}
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}