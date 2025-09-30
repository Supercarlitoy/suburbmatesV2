"use client";

import { useState, useEffect, useCallback, useRef } from 'react';

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

interface UseJobProgressOptions {
  jobId: string;
  enabled?: boolean;
  onUpdate?: (job: CLIJob) => void;
  onComplete?: (job: CLIJob) => void;
  onError?: (error: string) => void;
}

interface UseJobProgressReturn {
  job: CLIJob | null;
  isConnected: boolean;
  connectionType: 'sse' | 'polling' | null;
  error: string | null;
  lastUpdated: Date | null;
  reconnect: () => void;
  disconnect: () => void;
}

export function useJobProgress({
  jobId,
  enabled = true,
  onUpdate,
  onComplete,
  onError,
}: UseJobProgressOptions): UseJobProgressReturn {
  const [job, setJob] = useState<CLIJob | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionType, setConnectionType] = useState<'sse' | 'polling' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Refs for cleanup
  const eventSourceRef = useRef<EventSource | null>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Get auth token
  const getAuthToken = useCallback(() => {
    return localStorage.getItem('supabase_access_token');
  }, []);

  // Clean up connections
  const cleanup = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
    
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    setIsConnected(false);
    setConnectionType(null);
  }, []);

  // Fetch job data via polling
  const fetchJobData = useCallback(async (): Promise<CLIJob | null> => {
    const token = getAuthToken();
    if (!token) {
      setError('No authentication token available');
      return null;
    }

    try {
      const response = await fetch(`/api/admin/cli-bridge/jobs/${jobId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      if (data.success && data.job) {
        return data.job;
      }
      
      throw new Error(data.error || 'Failed to fetch job data');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      onError?.(errorMessage);
      return null;
    }
  }, [jobId, getAuthToken, onError]);

  // Update job state
  const updateJob = useCallback((newJob: CLIJob) => {
    setJob(newJob);
    setLastUpdated(new Date());
    setError(null);
    
    onUpdate?.(newJob);
    
    // Check if job is complete
    if (['COMPLETED', 'FAILED', 'CANCELLED'].includes(newJob.status)) {
      onComplete?.(newJob);
      cleanup();
    }
  }, [onUpdate, onComplete, cleanup]);

  // Setup Server-Sent Events connection
  const connectSSE = useCallback(() => {
    const token = getAuthToken();
    if (!token) {
      setError('No authentication token available');
      return false;
    }

    try {
      const eventSource = new EventSource(
        `/api/admin/cli-bridge/jobs/${jobId}/stream`,
        {
          // Note: EventSource doesn't support custom headers, so we'll fall back to polling
          // In a production environment, you might want to use WebSockets or pass auth via URL
        }
      );

      eventSource.onopen = () => {
        console.log('SSE connection opened');
        setIsConnected(true);
        setConnectionType('sse');
        setError(null);
      };

      eventSource.addEventListener('initial', (event) => {
        try {
          const jobData = JSON.parse(event.data);
          updateJob(jobData);
        } catch (err) {
          console.error('Failed to parse initial job data:', err);
        }
      });

      eventSource.addEventListener('update', (event) => {
        try {
          const jobData = JSON.parse(event.data);
          updateJob(jobData);
        } catch (err) {
          console.error('Failed to parse job update:', err);
        }
      });

      eventSource.addEventListener('complete', (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('Job completed:', data.message);
        } catch (err) {
          console.error('Failed to parse completion data:', err);
        }
      });

      eventSource.addEventListener('error', (event) => {
        try {
          const data = JSON.parse((event as any).data);
          setError(data.error);
          onError?.(data.error);
        } catch (err) {
          // Handle generic EventSource errors
          console.error('SSE error event:', event);
        }
      });

      eventSource.onerror = (event) => {
        console.error('SSE connection error:', event);
        setError('Connection lost. Falling back to polling...');
        eventSource.close();
        
        // Fall back to polling after a brief delay
        reconnectTimeoutRef.current = setTimeout(() => {
          connectPolling();
        }, 2000);
      };

      eventSourceRef.current = eventSource;
      return true;
    } catch (err) {
      console.error('Failed to setup SSE:', err);
      return false;
    }
  }, [jobId, getAuthToken, updateJob, onError]);

  // Setup polling connection
  const connectPolling = useCallback(() => {
    console.log('Setting up polling for job:', jobId);
    setConnectionType('polling');
    setIsConnected(true);
    setError(null);

    const poll = async () => {
      const jobData = await fetchJobData();
      if (jobData) {
        updateJob(jobData);
        
        // Stop polling if job is complete
        if (['COMPLETED', 'FAILED', 'CANCELLED'].includes(jobData.status)) {
          if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
            pollingIntervalRef.current = null;
          }
        }
      }
    };

    // Initial fetch
    poll();

    // Set up polling interval
    pollingIntervalRef.current = setInterval(poll, 2000); // Poll every 2 seconds
  }, [jobId, fetchJobData, updateJob]);

  // Connect to job updates
  const connect = useCallback(() => {
    cleanup();
    
    if (!enabled) return;

    // Try SSE first, fall back to polling
    // Note: Due to EventSource limitations with auth headers, we'll use polling for now
    // In production, consider using WebSockets or server-side auth token handling
    connectPolling();
    
    // Alternative: Try SSE (would need server-side auth handling)
    // if (!connectSSE()) {
    //   connectPolling();
    // }
  }, [enabled, connectPolling, cleanup]);

  // Reconnect function
  const reconnect = useCallback(() => {
    connect();
  }, [connect]);

  // Disconnect function
  const disconnect = useCallback(() => {
    cleanup();
  }, [cleanup]);

  // Effect to manage connection lifecycle
  useEffect(() => {
    if (enabled && jobId) {
      connect();
    } else {
      cleanup();
    }

    return cleanup;
  }, [enabled, jobId, connect, cleanup]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  return {
    job,
    isConnected,
    connectionType,
    error,
    lastUpdated,
    reconnect,
    disconnect,
  };
}