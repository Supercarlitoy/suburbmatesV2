"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  Loader2,
  XCircle,
  Square,
  Bell,
  BellOff,
  Volume2,
  VolumeX,
  Activity,
  Zap,
  Pause,
  Play,
  RotateCcw
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useJobProgress } from '@/hooks/useJobProgress';

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

interface RealTimeJobMonitorProps {
  className?: string;
  maxVisibleJobs?: number;
  enableNotifications?: boolean;
  enableSounds?: boolean;
}

interface JobNotification {
  id: string;
  jobId: string;
  type: 'started' | 'completed' | 'failed' | 'warning';
  message: string;
  timestamp: Date;
  read: boolean;
}

export default function RealTimeJobMonitor({
  className,
  maxVisibleJobs = 10,
  enableNotifications = true,
  enableSounds = true
}: RealTimeJobMonitorProps) {
  // State management
  const [activeJobs, setActiveJobs] = useState<CLIJob[]>([]);
  const [recentJobs, setRecentJobs] = useState<CLIJob[]>([]);
  const [notifications, setNotifications] = useState<JobNotification[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(enableSounds);
  const [notificationsEnabled, setNotificationsEnabled] = useState(enableNotifications);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [systemStatus, setSystemStatus] = useState<'healthy' | 'warning' | 'critical'>('healthy');

  // Real-time updates
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null);

  // Fetch active and recent jobs
  const fetchJobs = useCallback(async () => {
    if (!isMonitoring) return;

    try {
      const response = await fetch('/api/admin/cli-bridge/jobs?limit=50&status=active', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('supabase_access_token')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        const jobs = data.jobs || [];
        
        // Separate active and recent jobs
        const active = jobs.filter((job: CLIJob) => 
          ['PENDING', 'RUNNING'].includes(job.status)
        );
        
        const recent = jobs.filter((job: CLIJob) => 
          ['COMPLETED', 'FAILED', 'CANCELLED'].includes(job.status)
        ).slice(0, maxVisibleJobs);

        // Check for status changes and create notifications
        checkForStatusChanges(active.concat(recent));
        
        setActiveJobs(active);
        setRecentJobs(recent);
        setLastUpdate(new Date());
        
        // Update system status based on job health
        updateSystemStatus(active, recent);
      }
    } catch (error) {
      console.error('Error fetching real-time job data:', error);
      setSystemStatus('critical');
    }
  }, [isMonitoring, maxVisibleJobs]);

  // Check for status changes and create notifications
  const checkForStatusChanges = useCallback((newJobs: CLIJob[]) => {
    const currentJobsMap = new Map(
      [...activeJobs, ...recentJobs].map(job => [job.id, job])
    );

    newJobs.forEach(newJob => {
      const existingJob = currentJobsMap.get(newJob.id);
      
      if (existingJob && existingJob.status !== newJob.status) {
        // Status changed - create notification
        let notificationType: JobNotification['type'] = 'completed';
        let message = '';

        switch (newJob.status) {
          case 'RUNNING':
            notificationType = 'started';
            message = `Job "${newJob.command}" has started`;
            break;
          case 'COMPLETED':
            notificationType = 'completed';
            message = `Job "${newJob.command}" completed successfully`;
            break;
          case 'FAILED':
            notificationType = 'failed';
            message = `Job "${newJob.command}" failed`;
            break;
        }

        if (message) {
          addNotification({
            id: `${newJob.id}-${Date.now()}`,
            jobId: newJob.id,
            type: notificationType,
            message,
            timestamp: new Date(),
            read: false,
          });

          // Play sound if enabled
          if (soundEnabled && notificationType !== 'started') {
            playNotificationSound(notificationType);
          }
        }
      }
    });
  }, [activeJobs, recentJobs, soundEnabled]);

  // Add notification
  const addNotification = useCallback((notification: JobNotification) => {
    if (!notificationsEnabled) return;
    
    setNotifications(prev => [notification, ...prev].slice(0, 50)); // Keep last 50
    
    // Browser notification if permission granted
    if (Notification.permission === 'granted') {
      new Notification('CLI Job Update', {
        body: notification.message,
        icon: '/favicon.ico',
        tag: notification.jobId, // Prevents duplicate notifications
      });
    }
  }, [notificationsEnabled]);

  // Play notification sound
  const playNotificationSound = useCallback((type: JobNotification['type']) => {
    try {
      const audio = new Audio();
      switch (type) {
        case 'completed':
          // Success sound - higher pitch
          audio.src = 'data:audio/wav;base64,UklGRvIBAABXQVZFZm10IAAAAAAQAAABACAAQAAEAD0ABAAEAAAAZmFjdAAAAABmYWN0BAAAAAYAAABEQVRBAAAAAAAAAAAAAAAAAAAAAA==';
          break;
        case 'failed':
          // Error sound - lower pitch
          audio.src = 'data:audio/wav;base64,UklGRvIBAABXQVZFZm10IAAAAAAQAAABAEAAAABABBBBBBBBBBBBBBBBBBBBBBBBfmFjdAAAAABmYWN0BAAAAAYAAABEQVRBAAAAAAAAAAAAAAAAAAAAAA==';
          break;
        case 'warning':
          // Warning sound - medium pitch
          audio.src = 'data:audio/wav;base64,UklGRvIBAABXQVZFZm10IAAAAAAQAAABAEAAAABABBBBBBBBBBBBBBBBBBBBBBBBfmFjdAAAAABmYWN0BAAAAAYAAABEQVRBAAAAAAAAAAAAAAAAAAAAAA==';
          break;
      }
      audio.volume = 0.3;
      audio.play().catch(() => {
        // Ignore audio play failures (user interaction required)
      });
    } catch (error) {
      // Ignore audio errors
    }
  }, []);

  // Update system status
  const updateSystemStatus = useCallback((active: CLIJob[], recent: CLIJob[]) => {
    const recentFailures = recent.filter(job => 
      job.status === 'FAILED' && 
      new Date(job.completedAt || job.createdAt).getTime() > Date.now() - 5 * 60 * 1000 // Last 5 minutes
    ).length;

    const longRunningJobs = active.filter(job => 
      job.status === 'RUNNING' && 
      new Date(job.startedAt || job.createdAt).getTime() < Date.now() - 30 * 60 * 1000 // Running > 30 minutes
    ).length;

    if (recentFailures > 2 || longRunningJobs > 3) {
      setSystemStatus('critical');
    } else if (recentFailures > 0 || longRunningJobs > 1 || active.length > 10) {
      setSystemStatus('warning');
    } else {
      setSystemStatus('healthy');
    }
  }, []);

  // Mark notification as read
  const markNotificationRead = useCallback((notificationId: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    );
  }, []);

  // Clear all notifications
  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  // Request notification permission
  useEffect(() => {
    if (notificationsEnabled && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, [notificationsEnabled]);

  // Setup polling
  useEffect(() => {
    if (isMonitoring) {
      fetchJobs(); // Initial fetch
      const interval = setInterval(fetchJobs, 3000); // Poll every 3 seconds
      setPollingInterval(interval);
      return () => clearInterval(interval);
    } else if (pollingInterval) {
      clearInterval(pollingInterval);
      setPollingInterval(null);
    }
  }, [isMonitoring, fetchJobs]);

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

  // System status indicator
  const getSystemStatusColor = () => {
    switch (systemStatus) {
      case 'healthy': return 'text-green-500';
      case 'warning': return 'text-yellow-500';
      case 'critical': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const unreadNotifications = notifications.filter(n => !n.read).length;

  return (
    <div className={cn('space-y-6', className)}>
      {/* Monitor Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className={cn("h-5 w-5", getSystemStatusColor())} />
              Real-Time Job Monitor
              <Badge variant="outline" className="ml-2">
                {systemStatus.toUpperCase()}
              </Badge>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setNotificationsEnabled(!notificationsEnabled)}
              >
                {notificationsEnabled ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSoundEnabled(!soundEnabled)}
              >
                {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMonitoring(!isMonitoring)}
              >
                {isMonitoring ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{activeJobs.length}</p>
              <p className="text-sm text-gray-600">Active Jobs</p>
            </div>
            
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">
                {recentJobs.filter(j => j.status === 'COMPLETED').length}
              </p>
              <p className="text-sm text-gray-600">Recently Completed</p>
            </div>
            
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">
                {recentJobs.filter(j => j.status === 'FAILED').length}
              </p>
              <p className="text-sm text-gray-600">Recent Failures</p>
            </div>
          </div>
          
          {lastUpdate && (
            <p className="text-xs text-gray-500 mt-4 text-center">
              Last updated: {lastUpdate.toLocaleTimeString()}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Active Jobs */}
      {activeJobs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-blue-500" />
              Active Jobs ({activeJobs.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activeJobs.map(job => (
                <div key={job.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h4 className="font-medium">{job.command}</h4>
                      <p className="text-sm text-gray-500">
                        by {job.createdBy.email} • Started {
                          job.startedAt 
                            ? new Date(job.startedAt).toLocaleTimeString()
                            : 'Pending'
                        }
                      </p>
                    </div>
                    {getStatusBadge(job.status)}
                  </div>
                  
                  {job.progress && (
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>{job.progress.message}</span>
                        <span>{job.progress.percentage}%</span>
                      </div>
                      <Progress value={job.progress.percentage} className="h-2" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Notifications */}
      {notifications.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notifications
                {unreadNotifications > 0 && (
                  <Badge className="bg-red-100 text-red-700">
                    {unreadNotifications}
                  </Badge>
                )}
              </div>
              <Button variant="ghost" size="sm" onClick={clearNotifications}>
                Clear All
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {notifications.slice(0, 10).map(notification => (
                <Alert
                  key={notification.id}
                  className={cn(
                    "cursor-pointer transition-colors",
                    !notification.read && "border-blue-200 bg-blue-50",
                    notification.type === 'failed' && "border-red-200",
                    notification.type === 'completed' && "border-green-200"
                  )}
                  onClick={() => markNotificationRead(notification.id)}
                >
                  <div className="flex items-start gap-2">
                    {notification.type === 'completed' && <CheckCircle className="h-4 w-4 text-green-500" />}
                    {notification.type === 'failed' && <XCircle className="h-4 w-4 text-red-500" />}
                    {notification.type === 'started' && <Loader2 className="h-4 w-4 text-blue-500" />}
                    {notification.type === 'warning' && <AlertTriangle className="h-4 w-4 text-yellow-500" />}
                    
                    <div className="flex-1">
                      <AlertDescription className="text-sm">
                        {notification.message}
                      </AlertDescription>
                      <p className="text-xs text-gray-500 mt-1">
                        {notification.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                </Alert>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Jobs */}
      {recentJobs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Jobs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentJobs.slice(0, maxVisibleJobs).map(job => {
                const duration = job.completedAt 
                  ? Math.round((new Date(job.completedAt).getTime() - new Date(job.startedAt || job.createdAt).getTime()) / 1000)
                  : null;

                return (
                  <div key={job.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div>
                        <p className="font-medium text-gray-900">{job.command}</p>
                        <p className="text-sm text-gray-500">
                          by {job.createdBy.email} • {new Date(job.completedAt || job.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {duration && (
                        <span className="text-xs text-gray-500">{duration}s</span>
                      )}
                      {getStatusBadge(job.status)}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* System Status Alert */}
      {systemStatus !== 'healthy' && (
        <Alert className={cn(
          systemStatus === 'critical' ? 'border-red-200 bg-red-50' : 'border-yellow-200 bg-yellow-50'
        )}>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {systemStatus === 'critical' 
              ? 'System experiencing issues. Multiple job failures or long-running processes detected.'
              : 'System performance degraded. Monitor active jobs and recent failures.'
            }
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}