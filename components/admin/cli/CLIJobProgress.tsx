"use client";

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Terminal,
  Clock,
  CheckCircle,
  XCircle,
  Square,
  Loader2,
  AlertCircle,
  Play
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface CLIJob {
  id: string;
  command: string;
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

interface CLIJobProgressBarProps {
  job: CLIJob;
  className?: string;
}

export function CLIJobProgressBar({ job, className }: CLIJobProgressBarProps) {
  const getProgressValue = () => {
    if (job.status === 'COMPLETED') return 100;
    if (job.status === 'FAILED' || job.status === 'CANCELLED') return 0;
    return job.progress?.percentage || 0;
  };

  const getProgressColor = () => {
    switch (job.status) {
      case 'COMPLETED':
        return 'bg-green-500';
      case 'FAILED':
      case 'CANCELLED':
        return 'bg-red-500';
      case 'RUNNING':
        return 'bg-blue-500';
      default:
        return 'bg-yellow-500';
    }
  };

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">{job.command}</span>
        <span className="text-gray-500">{getProgressValue()}%</span>
      </div>
      
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={cn('h-2 rounded-full transition-all duration-300', getProgressColor())}
          style={{ width: `${getProgressValue()}%` }}
        />
      </div>
      
      {job.progress?.message && (
        <p className="text-xs text-gray-500">{job.progress.message}</p>
      )}
    </div>
  );
}

interface CLIJobStatusBadgeProps {
  status: CLIJob['status'];
  className?: string;
}

export function CLIJobStatusBadge({ status, className }: CLIJobStatusBadgeProps) {
  const getStatusConfig = () => {
    switch (status) {
      case 'PENDING':
        return {
          icon: Clock,
          className: 'bg-yellow-100 text-yellow-700 border-yellow-200',
          text: 'Pending'
        };
      case 'RUNNING':
        return {
          icon: Loader2,
          className: 'bg-blue-100 text-blue-700 border-blue-200',
          text: 'Running'
        };
      case 'COMPLETED':
        return {
          icon: CheckCircle,
          className: 'bg-green-100 text-green-700 border-green-200',
          text: 'Completed'
        };
      case 'FAILED':
        return {
          icon: XCircle,
          className: 'bg-red-100 text-red-700 border-red-200',
          text: 'Failed'
        };
      case 'CANCELLED':
        return {
          icon: Square,
          className: 'bg-gray-100 text-gray-700 border-gray-200',
          text: 'Cancelled'
        };
      default:
        return {
          icon: AlertCircle,
          className: 'bg-gray-100 text-gray-700 border-gray-200',
          text: 'Unknown'
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <Badge className={cn('border', config.className, className)}>
      <Icon className={cn('w-3 h-3 mr-1', status === 'RUNNING' && 'animate-spin')} />
      {config.text}
    </Badge>
  );
}

interface CLIJobOutputViewerProps {
  output: string[];
  errors?: string[];
  warnings?: string[];
  className?: string;
}

export function CLIJobOutputViewer({ 
  output, 
  errors = [], 
  warnings = [], 
  className 
}: CLIJobOutputViewerProps) {
  return (
    <div className={cn('space-y-3', className)}>
      {output.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
            <Terminal className="w-4 h-4 mr-2" />
            Output
          </h4>
          <pre className="text-xs bg-gray-50 p-3 rounded-md border overflow-x-auto font-mono">
            {output.join('\n')}
          </pre>
        </div>
      )}

      {warnings.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-orange-700 mb-2 flex items-center">
            <AlertCircle className="w-4 h-4 mr-2" />
            Warnings
          </h4>
          <pre className="text-xs bg-orange-50 p-3 rounded-md border border-orange-200 overflow-x-auto font-mono text-orange-800">
            {warnings.join('\n')}
          </pre>
        </div>
      )}

      {errors.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-red-700 mb-2 flex items-center">
            <XCircle className="w-4 h-4 mr-2" />
            Errors
          </h4>
          <pre className="text-xs bg-red-50 p-3 rounded-md border border-red-200 overflow-x-auto font-mono text-red-800">
            {errors.join('\n')}
          </pre>
        </div>
      )}
    </div>
  );
}

interface CLIJobResultsTableProps {
  results: any[];
  className?: string;
}

export function CLIJobResultsTable({ results, className }: CLIJobResultsTableProps) {
  if (!results || results.length === 0) {
    return (
      <div className={cn('text-center py-8 text-gray-500', className)}>
        No results to display
      </div>
    );
  }

  // Get column headers from first result object
  const headers = results.length > 0 ? Object.keys(results[0]) : [];

  return (
    <div className={cn('overflow-x-auto', className)}>
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {headers.map((header) => (
              <th
                key={header}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {results.map((result, index) => (
            <tr key={index} className="hover:bg-gray-50">
              {headers.map((header) => (
                <td
                  key={header}
                  className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                >
                  {typeof result[header] === 'object' 
                    ? JSON.stringify(result[header]) 
                    : String(result[header])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

interface CLIJobTimelineProps {
  jobs: CLIJob[];
  className?: string;
}

export function CLIJobTimeline({ jobs, className }: CLIJobTimelineProps) {
  const sortedJobs = [...jobs].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <div className={cn('space-y-4', className)}>
      {sortedJobs.map((job, index) => {
        const isLast = index === sortedJobs.length - 1;
        const duration = job.completedAt 
          ? Math.round((new Date(job.completedAt).getTime() - new Date(job.startedAt || job.createdAt).getTime()) / 1000)
          : null;

        return (
          <div key={job.id} className="relative">
            {/* Timeline line */}
            {!isLast && (
              <div className="absolute left-4 top-8 w-0.5 h-full bg-gray-200" />
            )}
            
            <div className="flex items-start">
              {/* Timeline dot */}
              <div className="flex-shrink-0 w-8 h-8 rounded-full border-2 border-gray-200 bg-white flex items-center justify-center z-10">
                <CLIJobStatusBadge status={job.status} />
              </div>
              
              {/* Job details */}
              <div className="ml-4 flex-1">
                <Card className="shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center justify-between">
                      <span className="flex items-center">
                        <Terminal className="w-4 h-4 mr-2" />
                        {job.command}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(job.createdAt).toLocaleString()}
                      </span>
                    </CardTitle>
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    <div className="space-y-2">
                      {/* Progress for running jobs */}
                      {job.status === 'RUNNING' && job.progress && (
                        <CLIJobProgressBar job={job} />
                      )}
                      
                      {/* Job metadata */}
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>Created by: {job.createdBy.email}</span>
                        {duration && (
                          <span>Duration: {duration}s</span>
                        )}
                      </div>
                      
                      {/* Quick result summary */}
                      {job.result && (
                        <div className="text-xs">
                          {job.result.success ? (
                            <span className="text-green-600">✓ Completed successfully</span>
                          ) : (
                            <span className="text-red-600">✗ Failed: {job.result.error}</span>
                          )}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}