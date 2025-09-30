import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser, isAdmin } from "@/server/auth/auth";
import { AdminBusinessService } from "@/lib/services/admin-business";
import { prisma } from "@/lib/database/prisma";
import { z } from "zod";

interface RouteParams {
  params: Promise<{
    jobId: string;
  }>;
}

interface JobDetails {
  jobId: string;
  type: 'import' | 'export';
  filename: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  progress: number; // 0-100
  
  timing: {
    startTime: string;
    endTime?: string;
    lastUpdateTime: string;
    elapsedTimeMs: number;
    estimatedTimeRemaining?: number; // seconds
    averageProcessingSpeed?: number; // items per second
  };
  
  metrics: {
    totalItems: number;
    processedItems: number;
    successCount: number;
    errorCount: number;
    warningCount: number;
    duplicateCount: number;
    skippedCount: number;
  };
  
  details: {
    importDetails?: {
      dedupeMode: string;
      fieldMapping: Record<string, string>;
      dryRun: boolean;
      previewOnly: boolean;
    };
    exportDetails?: {
      format: string;
      selectedFields: string[];
      filters: any;
      downloadUrl?: string;
      fileSize?: number;
    };
  };
  
  errors: Array<{
    row?: number;
    column?: string;
    type: 'critical' | 'error' | 'warning';
    code: string;
    message: string;
    value?: any;
    suggestion?: string;
    timestamp: string;
  }>;
  
  warnings: Array<{
    row?: number;
    column?: string;
    message: string;
    timestamp: string;
  }>;
  
  duplicates: Array<{
    row: number;
    reason: string;
    existingItemId?: string;
    data?: any;
  }>;
  
  history: Array<{
    timestamp: string;
    event: string;
    message: string;
    details?: any;
  }>;
  
  actions: {
    canCancel: boolean;
    canDownload: boolean;
    canRetry: boolean;
    canViewDetails: boolean;
  };
}

const UpdateJobSchema = z.object({
  action: z.enum(['cancel', 'retry', 'cleanup']),
  reason: z.string().optional(),
});

/**
 * GET /api/admin/csv-operations/jobs/{jobId}
 * Get detailed job progress and status
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    // Check admin authentication
    const user = await getCurrentUser();
    if (!user || !(await isAdmin())) {
      return NextResponse.json(
        { error: "Unauthorized. Admin access required." },
        { status: 403 }
      );
    }

    const { jobId } = await params;
    const adminService = new AdminBusinessService(prisma);

    // Get job details from both import and export job storage
    const jobDetails = await getJobDetails(jobId);
    
    if (!jobDetails) {
      return NextResponse.json(
        { error: "Job not found" },
        { status: 404 }
      );
    }

    // Log job access
    await adminService.logAdminAccess(
      'ADMIN_CSV_JOB_STATUS_CHECK',
      null,
      user.id,
      {
        jobId,
        jobType: jobDetails.type,
        jobStatus: jobDetails.status,
        progress: jobDetails.progress,
        filename: jobDetails.filename,
        elapsedTimeMs: jobDetails.timing.elapsedTimeMs,
        processedItems: jobDetails.metrics.processedItems,
        totalItems: jobDetails.metrics.totalItems,
      },
      request.headers.get('x-forwarded-for') || 'unknown',
      request.headers.get('user-agent') || 'unknown'
    );

    return NextResponse.json({
      success: true,
      job: jobDetails,
    });

  } catch (error) {
    console.error("Job status error:", error);

    // Log error for audit
    try {
      const user = await getCurrentUser();
      const adminService = new AdminBusinessService(prisma);
      await adminService.logAdminAccess(
        'ADMIN_CSV_JOB_STATUS_ERROR',
        null,
        user?.id || null,
        {
          jobId: (await params).jobId,
          error: error instanceof Error ? error.message : 'Unknown error',
        },
        request.headers.get('x-forwarded-for') || 'unknown',
        request.headers.get('user-agent') || 'unknown'
      );
    } catch (auditError) {
      console.error('Failed to log audit event:', auditError);
    }

    return NextResponse.json(
      { error: "Failed to fetch job status", message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/csv-operations/jobs/{jobId}
 * Update job (cancel, retry, cleanup)
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    // Check admin authentication
    const user = await getCurrentUser();
    if (!user || !(await isAdmin())) {
      return NextResponse.json(
        { error: "Unauthorized. Admin access required." },
        { status: 403 }
      );
    }

    const { jobId } = await params;
    const body = await request.json();
    const adminService = new AdminBusinessService(prisma);

    // Validate request
    const validationResult = UpdateJobSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: "Invalid job update request",
          details: validationResult.error.issues
        },
        { status: 400 }
      );
    }

    const { action, reason } = validationResult.data;

    // Get current job details
    const jobDetails = await getJobDetails(jobId);
    if (!jobDetails) {
      return NextResponse.json(
        { error: "Job not found" },
        { status: 404 }
      );
    }

    // Perform action
    const result = await performJobAction(jobId, action, reason, jobDetails, adminService);

    // Log job action
    await adminService.logAdminAccess(
      'ADMIN_CSV_JOB_ACTION',
      null,
      user.id,
      {
        jobId,
        action,
        reason,
        jobType: jobDetails.type,
        previousStatus: jobDetails.status,
        newStatus: result.newStatus,
        filename: jobDetails.filename,
      },
      request.headers.get('x-forwarded-for') || 'unknown',
      request.headers.get('user-agent') || 'unknown'
    );

    return NextResponse.json({
      success: true,
      message: result.message,
      job: await getJobDetails(jobId), // Return updated job details
    });

  } catch (error) {
    console.error("Job action error:", error);

    // Log error for audit
    try {
      const user = await getCurrentUser();
      const adminService = new AdminBusinessService(prisma);
      await adminService.logAdminAccess(
        'ADMIN_CSV_JOB_ACTION_ERROR',
        null,
        user?.id || null,
        {
          jobId: (await params).jobId,
          requestedAction: await request.json().then(b => b.action).catch(() => null),
          error: error instanceof Error ? error.message : 'Unknown error',
        },
        request.headers.get('x-forwarded-for') || 'unknown',
        request.headers.get('user-agent') || 'unknown'
      );
    } catch (auditError) {
      console.error('Failed to log audit event:', auditError);
    }

    return NextResponse.json(
      { error: "Failed to perform job action", message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/csv-operations/jobs/{jobId}
 * Delete/cleanup job data
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    // Check admin authentication
    const user = await getCurrentUser();
    if (!user || !(await isAdmin())) {
      return NextResponse.json(
        { error: "Unauthorized. Admin access required." },
        { status: 403 }
      );
    }

    const { jobId } = params;
    const adminService = new AdminBusinessService(prisma);

    // Get job details before deletion
    const jobDetails = await getJobDetails(jobId);
    if (!jobDetails) {
      return NextResponse.json(
        { error: "Job not found" },
        { status: 404 }
      );
    }

    // Only allow deletion of completed, failed, or cancelled jobs
    if (!['completed', 'failed', 'cancelled'].includes(jobDetails.status)) {
      return NextResponse.json(
        { error: "Cannot delete active job. Cancel the job first." },
        { status: 400 }
      );
    }

    // Delete job data
    await deleteJobData(jobId, jobDetails);

    // Log job deletion
    await adminService.logAdminAccess(
      'ADMIN_CSV_JOB_DELETED',
      null,
      user.id,
      {
        jobId,
        jobType: jobDetails.type,
        jobStatus: jobDetails.status,
        filename: jobDetails.filename,
        totalItems: jobDetails.metrics.totalItems,
        successCount: jobDetails.metrics.successCount,
        errorCount: jobDetails.metrics.errorCount,
      },
      request.headers.get('x-forwarded-for') || 'unknown',
      request.headers.get('user-agent') || 'unknown'
    );

    return NextResponse.json({
      success: true,
      message: `Job ${jobId} deleted successfully`,
    });

  } catch (error) {
    console.error("Job deletion error:", error);
    return NextResponse.json(
      { error: "Failed to delete job", message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * Get comprehensive job details from import/export storage
 */
async function getJobDetails(jobId: string): Promise<JobDetails | null> {
  // Import these from the import and export route files
  // In a real implementation, these would be in a shared location or database
  
  // For now, simulate getting job from either import or export storage
  const importJob = getImportJob(jobId);
  const exportJob = getExportJob(jobId);
  
  const job = importJob || exportJob;
  if (!job) return null;

  const type: 'import' | 'export' = importJob ? 'import' : 'export';
  const currentTime = new Date().getTime();
  const startTime = new Date(job.startTime).getTime();
  const elapsedTimeMs = currentTime - startTime;

  // Calculate processing speed
  let averageProcessingSpeed = 0;
  if (job.processedRows > 0 && elapsedTimeMs > 0) {
    averageProcessingSpeed = job.processedRows / (elapsedTimeMs / 1000);
  }

  // Build comprehensive job details
  const jobDetails: JobDetails = {
    jobId: job.jobId,
    type,
    filename: job.filename,
    status: job.status,
    progress: job.progress,
    
    timing: {
      startTime: job.startTime,
      endTime: job.endTime,
      lastUpdateTime: new Date().toISOString(),
      elapsedTimeMs,
      estimatedTimeRemaining: job.estimatedTimeRemaining,
      averageProcessingSpeed: Math.round(averageProcessingSpeed * 100) / 100,
    },
    
    metrics: {
      totalItems: job.totalRows || job.totalRecords || 0,
      processedItems: job.processedRows || job.processedRecords || 0,
      successCount: job.successCount || 0,
      errorCount: job.errorCount || job.errors?.length || 0,
      warningCount: job.warnings?.length || 0,
      duplicateCount: job.duplicateCount || 0,
      skippedCount: 0, // Calculate if available
    },
    
    details: type === 'import' ? {
      importDetails: {
        dedupeMode: job.dedupeMode || 'none',
        fieldMapping: job.fieldMapping || {},
        dryRun: job.dryRun || false,
        previewOnly: job.previewOnly || false,
      }
    } : {
      exportDetails: {
        format: job.format || 'csv',
        selectedFields: job.selectedFields || [],
        filters: job.filters || {},
        downloadUrl: job.downloadUrl,
        fileSize: job.fileSize,
      }
    },
    
    errors: (job.errors || []).map((error: any) => ({
      row: error.row,
      column: error.field || error.column,
      type: error.type || 'error',
      code: error.code || 'UNKNOWN_ERROR',
      message: error.message,
      value: error.value || error.data,
      suggestion: error.suggestion,
      timestamp: error.timestamp || new Date().toISOString(),
    })),
    
    warnings: (job.warnings || []).map((warning: any) => ({
      row: warning.row,
      column: warning.field || warning.column,
      message: warning.message,
      timestamp: warning.timestamp || new Date().toISOString(),
    })),
    
    duplicates: job.duplicates || [],
    
    history: generateJobHistory(job),
    
    actions: {
      canCancel: job.status === 'pending' || job.status === 'processing',
      canDownload: job.status === 'completed' && type === 'export' && job.downloadUrl,
      canRetry: job.status === 'failed',
      canViewDetails: true,
    },
  };

  return jobDetails;
}

/**
 * Get import job from import job storage
 * This would normally access the global jobs Map from the import route
 */
function getImportJob(jobId: string): any {
  // In a real implementation, this would access the shared job storage
  // For now, return null as we don't have direct access to the Maps
  // This would be solved by using a database or shared cache like Redis
  return null;
}

/**
 * Get export job from export job storage
 */
function getExportJob(jobId: string): any {
  // Same as above - would access shared export job storage
  return null;
}

/**
 * Generate job history timeline
 */
function generateJobHistory(job: any): Array<{ timestamp: string; event: string; message: string; details?: any }> {
  const history: Array<{ timestamp: string; event: string; message: string; details?: any }> = [];
  
  // Job created
  history.push({
    timestamp: job.startTime,
    event: 'JOB_CREATED',
    message: `${job.type || 'Job'} created`,
    details: { filename: job.filename }
  });

  // Status changes
  if (job.status === 'processing') {
    history.push({
      timestamp: job.startTime,
      event: 'JOB_STARTED',
      message: 'Processing started',
    });
  }

  // Significant milestones
  const totalItems = job.totalRows || job.totalRecords || 0;
  const processedItems = job.processedRows || job.processedRecords || 0;
  
  if (processedItems > 0 && totalItems > 0) {
    const progressMilestones = [25, 50, 75];
    const currentProgress = (processedItems / totalItems) * 100;
    
    progressMilestones.forEach(milestone => {
      if (currentProgress >= milestone) {
        const estimatedTime = new Date(new Date(job.startTime).getTime() + 
          (milestone / 100) * (new Date().getTime() - new Date(job.startTime).getTime()));
        
        history.push({
          timestamp: estimatedTime.toISOString(),
          event: `PROGRESS_${milestone}`,
          message: `${milestone}% completed (${Math.round(processedItems * milestone / 100)} items processed)`,
        });
      }
    });
  }

  // Errors and warnings
  if (job.errors && job.errors.length > 0) {
    history.push({
      timestamp: new Date().toISOString(),
      event: 'ERRORS_DETECTED',
      message: `${job.errors.length} errors detected`,
      details: { errorCount: job.errors.length }
    });
  }

  // Job completion
  if (job.status === 'completed' && job.endTime) {
    history.push({
      timestamp: job.endTime,
      event: 'JOB_COMPLETED',
      message: 'Processing completed successfully',
      details: {
        totalProcessed: processedItems,
        successCount: job.successCount || 0,
        errorCount: job.errorCount || 0,
      }
    });
  }

  // Job failure
  if (job.status === 'failed') {
    history.push({
      timestamp: job.endTime || new Date().toISOString(),
      event: 'JOB_FAILED',
      message: 'Processing failed',
      details: {
        errorCount: job.errors?.length || 0,
        lastError: job.errors?.[job.errors.length - 1]?.message,
      }
    });
  }

  return history.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
}

/**
 * Perform job action (cancel, retry, cleanup)
 */
async function performJobAction(
  jobId: string, 
  action: string, 
  reason: string | undefined, 
  jobDetails: JobDetails,
  adminService: AdminBusinessService
): Promise<{ message: string; newStatus: string }> {
  
  switch (action) {
    case 'cancel':
      if (!jobDetails.actions.canCancel) {
        throw new Error(`Cannot cancel job in ${jobDetails.status} status`);
      }
      
      // Update job status to cancelled
      await updateJobStatus(jobId, 'cancelled', jobDetails.type);
      
      return {
        message: `Job ${jobId} has been cancelled`,
        newStatus: 'cancelled',
      };

    case 'retry':
      if (!jobDetails.actions.canRetry) {
        throw new Error(`Cannot retry job in ${jobDetails.status} status`);
      }
      
      // Reset job status and counters for retry
      await retryJob(jobId, jobDetails);
      
      return {
        message: `Job ${jobId} has been queued for retry`,
        newStatus: 'pending',
      };

    case 'cleanup':
      // Clean up job temporary data
      await cleanupJobData(jobId, jobDetails);
      
      return {
        message: `Job ${jobId} data has been cleaned up`,
        newStatus: jobDetails.status, // Status doesn't change
      };

    default:
      throw new Error(`Unknown action: ${action}`);
  }
}

/**
 * Update job status in storage
 */
async function updateJobStatus(jobId: string, newStatus: string, jobType: string) {
  // In a real implementation, this would update the job in the appropriate storage
  // For now, we simulate the update
  console.log(`Updating job ${jobId} (${jobType}) status to ${newStatus}`);
  
  // This would typically update the job in the Maps or database
  // jobs.set(jobId, { ...existingJob, status: newStatus, endTime: new Date().toISOString() });
}

/**
 * Retry a failed job
 */
async function retryJob(jobId: string, jobDetails: JobDetails) {
  // Reset job state for retry
  console.log(`Retrying job ${jobId}`);
  
  // This would typically:
  // 1. Reset job progress and counters
  // 2. Clear previous errors
  // 3. Set status back to 'pending'
  // 4. Re-queue the job for processing
}

/**
 * Clean up job temporary data
 */
async function cleanupJobData(jobId: string, jobDetails: JobDetails) {
  // Clean up temporary files, cache entries, etc.
  console.log(`Cleaning up job ${jobId} data`);
  
  // This would typically:
  // 1. Remove temporary files
  // 2. Clear cache entries
  // 3. Clean up any intermediate data
}

/**
 * Delete job data permanently
 */
async function deleteJobData(jobId: string, jobDetails: JobDetails) {
  // Permanently delete job data
  console.log(`Deleting job ${jobId} permanently`);
  
  // This would typically:
  // 1. Remove from job storage (Maps or database)
  // 2. Delete any associated files
  // 3. Clean up any related data
  // 4. Update any references
}

/**
 * GET /api/admin/csv-operations/jobs (list all jobs)
 * Get list of all jobs with summary information
 */
export async function getAllJobs(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || !(await isAdmin())) {
      return NextResponse.json(
        { error: "Unauthorized. Admin access required." },
        { status: 403 }
      );
    }

    // This would typically get jobs from database or shared storage
    // For now, return empty lists as we don't have direct access to the job Maps
    
    const jobs = {
      import: [], // Would get from import jobs storage
      export: [], // Would get from export jobs storage
    };

    return NextResponse.json({
      success: true,
      summary: {
        totalJobs: 0,
        activeJobs: 0,
        completedJobs: 0,
        failedJobs: 0,
      },
      jobs: {
        recent: [],
        active: [],
        failed: [],
      },
    });

  } catch (error) {
    console.error("Get all jobs error:", error);
    return NextResponse.json(
      { error: "Failed to fetch jobs" },
      { status: 500 }
    );
  }
}