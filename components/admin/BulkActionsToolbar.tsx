'use client';

import React, { useState, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { 
  CheckCircle, 
  XCircle, 
  Trash2,
  AlertTriangle,
  Info,
  Clock,
  RefreshCw,
  Download,
  Upload,
  FileText,
  Users,
  Building2,
  Mail,
  Zap,
  Target
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from '@/components/ui/use-toast';

export interface SelectedBusiness {
  id: string;
  name: string;
  suburb: string;
  approvalStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
  source: string;
  owner?: {
    id: string;
    email: string;
  };
}

export type BulkAction = 'approve' | 'reject' | 'delete' | 'export' | 'notify' | 'quality-update';

interface BulkOperationProgress {
  total: number;
  completed: number;
  failed: number;
  errors: Array<{
    businessId: string;
    businessName: string;
    error: string;
  }>;
  isRunning: boolean;
  canUndo: boolean;
}

interface BulkActionsToolbarProps {
  selectedBusinesses: string[];
  businessesData: SelectedBusiness[];
  activeTab: 'pending' | 'approved' | 'rejected' | 'duplicates';
  onRefresh?: () => void;
  onSelectionClear?: () => void;
  className?: string;
}

export default function BulkActionsToolbar({ 
  selectedBusinesses, 
  businessesData,
  activeTab,
  onRefresh,
  onSelectionClear,
  className 
}: BulkActionsToolbarProps) {
  const [isOperationRunning, setIsOperationRunning] = useState(false);
  const [operationProgress, setOperationProgress] = useState<BulkOperationProgress | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState<BulkAction | null>(null);
  const [operationNotes, setOperationNotes] = useState('');
  const [showProgressDialog, setShowProgressDialog] = useState(false);

  // Get selected businesses data
  const selectedBusinessesData = businessesData.filter(b => 
    selectedBusinesses.includes(b.id)
  );

  // Get counts by status
  const getCounts = () => {
    const counts = {
      pending: 0,
      approved: 0,
      rejected: 0,
      withOwners: 0,
      total: selectedBusinesses.length
    };

    selectedBusinessesData.forEach(business => {
      switch (business.approvalStatus) {
        case 'PENDING':
          counts.pending++;
          break;
        case 'APPROVED':
          counts.approved++;
          break;
        case 'REJECTED':
          counts.rejected++;
          break;
      }
      if (business.owner) {
        counts.withOwners++;
      }
    });

    return counts;
  };

  const counts = getCounts();

  // Check if action is available for current context
  const isActionAvailable = (action: BulkAction): boolean => {
    if (selectedBusinesses.length === 0) return false;

    switch (action) {
      case 'approve':
        return activeTab === 'pending' && counts.pending > 0;
      case 'reject':
        return activeTab === 'pending' && counts.pending > 0;
      case 'delete':
        return true; // Can delete from any tab
      case 'export':
        return true; // Can export from any tab
      case 'notify':
        return counts.withOwners > 0; // Only if businesses have owners
      case 'quality-update':
        return true; // Can update quality for any business
      default:
        return false;
    }
  };

  // Get action button style
  const getActionButtonStyle = (action: BulkAction) => {
    switch (action) {
      case 'approve':
        return 'text-green-600 hover:bg-green-50 border-green-200';
      case 'reject':
        return 'text-red-600 hover:bg-red-50 border-red-200';
      case 'delete':
        return 'text-red-600 hover:bg-red-50 border-red-200';
      case 'export':
        return 'text-blue-600 hover:bg-blue-50 border-blue-200';
      case 'notify':
        return 'text-purple-600 hover:bg-purple-50 border-purple-200';
      case 'quality-update':
        return 'text-orange-600 hover:bg-orange-50 border-orange-200';
      default:
        return '';
    }
  };

  // Execute bulk operation
  const executeBulkOperation = useCallback(async (action: BulkAction, notes?: string) => {
    if (selectedBusinesses.length === 0) return;

    setIsOperationRunning(true);
    setOperationProgress({
      total: selectedBusinesses.length,
      completed: 0,
      failed: 0,
      errors: [],
      isRunning: true,
      canUndo: false
    });
    setShowProgressDialog(true);

    try {
      // Determine API endpoint based on action
      let endpoint = '/api/admin/businesses/bulk';
      let method = 'POST';
      let body: any = {
        businessIds: selectedBusinesses,
        action,
        notes
      };

      // Special handling for different actions
      switch (action) {
        case 'export':
          endpoint = '/api/admin/csv-operations/export';
          body = {
            filters: {
              businessIds: selectedBusinesses
            },
            format: 'csv',
            includeHeaders: true
          };
          break;
        case 'notify':
          endpoint = '/api/admin/notify';
          body = {
            businessIds: selectedBusinesses,
            type: 'bulk_update',
            message: notes || 'Your business information has been updated.'
          };
          break;
        case 'quality-update':
          endpoint = '/api/admin/quality-scoring/batch-update';
          body = {
            businessIds: selectedBusinesses,
            recalculate: true
          };
          break;
      }

      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Operation failed');
      }

      const result = await response.json();

      // Update progress based on result
      if (result.progress) {
        setOperationProgress(prev => prev ? {
          ...prev,
          completed: result.progress.completed || selectedBusinesses.length,
          failed: result.progress.failed || 0,
          errors: result.progress.errors || [],
          isRunning: false,
          canUndo: action !== 'delete' && action !== 'export'
        } : null);
      } else {
        // If no detailed progress, assume all completed
        setOperationProgress(prev => prev ? {
          ...prev,
          completed: selectedBusinesses.length,
          failed: 0,
          errors: [],
          isRunning: false,
          canUndo: action !== 'delete' && action !== 'export'
        } : null);
      }

      // Show success message
      const actionLabels = {
        approve: 'approved',
        reject: 'rejected',
        delete: 'deleted',
        export: 'exported',
        notify: 'notified',
        'quality-update': 'updated'
      };

      toast({
        title: "Operation Completed",
        description: `Successfully ${actionLabels[action]} ${selectedBusinesses.length} business${selectedBusinesses.length > 1 ? 'es' : ''}.`,
        variant: "default",
      });

      // Handle export download
      if (action === 'export' && result.downloadUrl) {
        window.open(result.downloadUrl, '_blank');
      }

      // Refresh data and clear selection
      setTimeout(() => {
        onRefresh?.();
        onSelectionClear?.();
      }, 1500);

    } catch (error) {
      console.error('Bulk operation error:', error);
      
      setOperationProgress(prev => prev ? {
        ...prev,
        failed: selectedBusinesses.length,
        errors: [{
          businessId: 'all',
          businessName: 'All selected businesses',
          error: error instanceof Error ? error.message : 'Unknown error'
        }],
        isRunning: false,
        canUndo: false
      } : null);

      toast({
        title: "Operation Failed",
        description: error instanceof Error ? error.message : 'An unexpected error occurred.',
        variant: "destructive",
      });
    } finally {
      setIsOperationRunning(false);
      setOperationNotes('');
    }
  }, [selectedBusinesses, onRefresh, onSelectionClear]);

  // Handle action confirmation
  const handleActionClick = (action: BulkAction) => {
    if (!isActionAvailable(action)) return;
    
    if (action === 'delete') {
      // Direct confirm for destructive actions
      setShowConfirmDialog(action);
    } else if (action === 'export' || action === 'quality-update') {
      // Execute immediately for non-destructive actions
      executeBulkOperation(action);
    } else {
      // Show notes dialog for approve/reject/notify
      setShowConfirmDialog(action);
    }
  };

  // Get confirmation dialog content
  const getConfirmationContent = (action: BulkAction) => {
    const actionLabels = {
      approve: { title: 'Approve Businesses', action: 'approve', icon: CheckCircle, color: 'text-green-600' },
      reject: { title: 'Reject Businesses', action: 'reject', icon: XCircle, color: 'text-red-600' },
      delete: { title: 'Delete Businesses', action: 'delete', icon: Trash2, color: 'text-red-600' },
      notify: { title: 'Notify Business Owners', action: 'notify', icon: Mail, color: 'text-purple-600' },
      export: { title: 'Export Businesses', action: 'export', icon: Download, color: 'text-blue-600' },
      'quality-update': { title: 'Update Quality Scores', action: 'update quality scores for', icon: Target, color: 'text-orange-600' }
    };

    const config = actionLabels[action];
    const Icon = config.icon;

    return {
      title: config.title,
      description: `Are you sure you want to ${config.action} ${selectedBusinesses.length} business${selectedBusinesses.length > 1 ? 'es' : ''}?`,
      icon: <Icon className={cn('h-6 w-6', config.color)} />,
      isDestructive: action === 'delete',
      requiresNotes: action === 'approve' || action === 'reject' || action === 'notify'
    };
  };

  if (selectedBusinesses.length === 0) return null;

  return (
    <>
      <Card className={cn('mb-4', className)}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600">
                  {selectedBusinesses.length} business{selectedBusinesses.length > 1 ? 'es' : ''} selected
                </span>
              </div>

              {/* Selection Summary */}
              <div className="flex items-center gap-2 text-xs text-gray-500">
                {counts.pending > 0 && (
                  <Badge variant="outline" className="text-yellow-600">
                    <Clock className="h-3 w-3 mr-1" />
                    {counts.pending} Pending
                  </Badge>
                )}
                {counts.approved > 0 && (
                  <Badge variant="outline" className="text-green-600">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    {counts.approved} Approved
                  </Badge>
                )}
                {counts.rejected > 0 && (
                  <Badge variant="outline" className="text-red-600">
                    <XCircle className="h-3 w-3 mr-1" />
                    {counts.rejected} Rejected
                  </Badge>
                )}
                {counts.withOwners > 0 && (
                  <Badge variant="outline" className="text-blue-600">
                    <Users className="h-3 w-3 mr-1" />
                    {counts.withOwners} Owned
                  </Badge>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Approval Actions (only for pending tab) */}
              {activeTab === 'pending' && (
                <>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleActionClick('approve')}
                    disabled={!isActionAvailable('approve') || isOperationRunning}
                    className={getActionButtonStyle('approve')}
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Approve All
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleActionClick('reject')}
                    disabled={!isActionAvailable('reject') || isOperationRunning}
                    className={getActionButtonStyle('reject')}
                  >
                    <XCircle className="h-4 w-4 mr-1" />
                    Reject All
                  </Button>
                </>
              )}

              {/* Utility Actions */}
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleActionClick('export')}
                disabled={!isActionAvailable('export') || isOperationRunning}
                className={getActionButtonStyle('export')}
              >
                <Download className="h-4 w-4 mr-1" />
                Export
              </Button>

              <Button
                size="sm"
                variant="outline"
                onClick={() => handleActionClick('quality-update')}
                disabled={!isActionAvailable('quality-update') || isOperationRunning}
                className={getActionButtonStyle('quality-update')}
              >
                <Target className="h-4 w-4 mr-1" />
                Update Quality
              </Button>

              {/* Notification Action (only if businesses have owners) */}
              {counts.withOwners > 0 && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleActionClick('notify')}
                  disabled={!isActionAvailable('notify') || isOperationRunning}
                  className={getActionButtonStyle('notify')}
                >
                  <Mail className="h-4 w-4 mr-1" />
                  Notify Owners
                </Button>
              )}

              {/* Destructive Actions */}
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleActionClick('delete')}
                disabled={!isActionAvailable('delete') || isOperationRunning}
                className={getActionButtonStyle('delete')}
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Delete All
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <AlertDialog open={!!showConfirmDialog} onOpenChange={(open) => !open && setShowConfirmDialog(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <div className="flex items-center gap-3">
                {getConfirmationContent(showConfirmDialog).icon}
                <AlertDialogTitle>
                  {getConfirmationContent(showConfirmDialog).title}
                </AlertDialogTitle>
              </div>
              <AlertDialogDescription className="space-y-4">
                <p>{getConfirmationContent(showConfirmDialog).description}</p>
                
                {/* Show affected businesses */}
                <div className="text-sm">
                  <p className="font-medium text-gray-700">Affected businesses:</p>
                  <div className="mt-2 max-h-32 overflow-y-auto space-y-1">
                    {selectedBusinessesData.slice(0, 5).map(business => (
                      <div key={business.id} className="text-xs text-gray-600">
                        • {business.name} ({business.suburb})
                      </div>
                    ))}
                    {selectedBusinessesData.length > 5 && (
                      <div className="text-xs text-gray-500 italic">
                        ... and {selectedBusinessesData.length - 5} more
                      </div>
                    )}
                  </div>
                </div>

                {/* Notes input for certain actions */}
                {getConfirmationContent(showConfirmDialog).requiresNotes && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      {showConfirmDialog === 'notify' ? 'Message' : 'Admin Notes'} (optional)
                    </label>
                    <Textarea
                      value={operationNotes}
                      onChange={(e) => setOperationNotes(e.target.value)}
                      placeholder={
                        showConfirmDialog === 'notify'
                          ? 'Message to send to business owners...'
                          : 'Add notes about this action...'
                      }
                      className="min-h-[80px]"
                    />
                  </div>
                )}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isOperationRunning}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  executeBulkOperation(showConfirmDialog, operationNotes);
                  setShowConfirmDialog(null);
                }}
                disabled={isOperationRunning}
                className={cn(
                  getConfirmationContent(showConfirmDialog).isDestructive &&
                  'bg-red-600 hover:bg-red-700'
                )}
              >
                {isOperationRunning ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  `Confirm ${getConfirmationContent(showConfirmDialog).title}`
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      {/* Progress Dialog */}
      {operationProgress && (
        <Dialog open={showProgressDialog} onOpenChange={setShowProgressDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {operationProgress.isRunning ? (
                  <RefreshCw className="h-5 w-5 animate-spin" />
                ) : operationProgress.failed > 0 ? (
                  <AlertTriangle className="h-5 w-5 text-orange-500" />
                ) : (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                )}
                Bulk Operation Progress
              </DialogTitle>
              <DialogDescription>
                {operationProgress.isRunning
                  ? 'Processing your request...'
                  : 'Operation completed'
                }
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress</span>
                  <span>
                    {operationProgress.completed + operationProgress.failed} / {operationProgress.total}
                  </span>
                </div>
                <Progress 
                  value={((operationProgress.completed + operationProgress.failed) / operationProgress.total) * 100} 
                  className="w-full"
                />
              </div>

              {/* Results Summary */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Completed: {operationProgress.completed}</span>
                </div>
                <div className="flex items-center gap-2">
                  <XCircle className="h-4 w-4 text-red-500" />
                  <span>Failed: {operationProgress.failed}</span>
                </div>
              </div>

              {/* Error List */}
              {operationProgress.errors.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700">Errors:</p>
                  <div className="max-h-32 overflow-y-auto space-y-1 text-xs">
                    {operationProgress.errors.map((error, index) => (
                      <div key={index} className="text-red-600">
                        <strong>{error.businessName}:</strong> {error.error}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <DialogFooter>
              {operationProgress.canUndo && (
                <Button variant="outline" size="sm" disabled>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Undo (Coming Soon)
                </Button>
              )}
              <DialogClose asChild>
                <Button 
                  disabled={operationProgress.isRunning}
                  onClick={() => setShowProgressDialog(false)}
                >
                  {operationProgress.isRunning ? 'Cancel' : 'Close'}
                </Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}