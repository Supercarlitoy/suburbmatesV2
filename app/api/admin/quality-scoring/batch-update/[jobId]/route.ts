import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser, isAdmin } from "@/server/auth/auth";

interface RouteParams {
  params: Promise<{
    jobId: string;
  }>;
}

// Import batch jobs from parent route (in production, use shared storage)
// This is a simplified approach - in production you'd use Redis or database
declare global {
  var batchJobs: Map<string, any> | undefined;
}

/**
 * GET /api/admin/quality-scoring/batch-update/[jobId]
 * Get specific batch job status and progress
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

    const { jobId } = params;

    // Access the shared batch jobs storage
    const batchJobs = globalThis.batchJobs;
    if (!batchJobs) {
      return NextResponse.json(
        { error: "Batch job storage not initialized" },
        { status: 500 }
      );
    }

    const job = batchJobs.get(jobId);
    if (!job) {
      return NextResponse.json(
        { error: "Batch job not found", jobId },
        { status: 404 }
      );
    }

    // Check if user can access this job (created by them or admin)
    if (job.createdBy !== user.id && user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: "Access denied to this batch job" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const includeResults = searchParams.get('results') === 'true';

    // Prepare response
    const response: any = {
      success: true,
      job: {
        id: job.id,
        status: job.status,
        progress: job.progress,
        startedAt: job.startedAt,
        completedAt: job.completedAt,
        estimatedDuration: job.estimatedDuration,
        createdBy: job.createdBy,
      }
    };

    // Calculate estimated time remaining
    if (job.status === 'processing' && job.estimatedDuration) {
      const elapsedSeconds = Math.floor((Date.now() - new Date(job.startedAt).getTime()) / 1000);
      const progressRatio = job.progress.processed / job.progress.total;
      const estimatedTotalSeconds = progressRatio > 0 ? elapsedSeconds / progressRatio : job.estimatedDuration;
      const remainingSeconds = Math.max(0, Math.round(estimatedTotalSeconds - elapsedSeconds));
      
      response.job.estimatedTimeRemaining = remainingSeconds;
      response.job.estimatedCompletionTime = new Date(Date.now() + remainingSeconds * 1000).toISOString();
    }

    // Include full results if requested and job is completed
    if (includeResults && (job.status === 'completed' || job.status === 'failed')) {
      response.results = {
        successful: job.results.successful,
        failed: job.results.failed,
        summary: {
          totalProcessed: job.progress.processed,
          successfulCount: job.results.successful.length,
          failedCount: job.results.failed.length,
          averageScoreChange: job.results.successful.length > 0 
            ? Math.round(job.results.successful.reduce((sum: number, r: any) => sum + r.scoreChange, 0) / job.results.successful.length)
            : 0,
        }
      };
    } else {
      // Just include counts for in-progress jobs
      response.results = {
        successful: job.results.successful.length,
        failed: job.results.failed.length,
      };
    }

    return NextResponse.json(response);

  } catch (error) {
    console.error("Batch job status error:", error);
    return NextResponse.json(
      { error: "Failed to get batch job status", message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/quality-scoring/batch-update/[jobId]
 * Cancel specific batch job
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

    // Access the shared batch jobs storage
    const batchJobs = globalThis.batchJobs;
    if (!batchJobs) {
      return NextResponse.json(
        { error: "Batch job storage not initialized" },
        { status: 500 }
      );
    }

    const job = batchJobs.get(jobId);
    if (!job) {
      return NextResponse.json(
        { error: "Batch job not found", jobId },
        { status: 404 }
      );
    }

    // Check if user can cancel this job (created by them or admin)
    if (job.createdBy !== user.id && user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: "Access denied to cancel this batch job" },
        { status: 403 }
      );
    }

    if (job.status === 'completed' || job.status === 'failed') {
      return NextResponse.json(
        { 
          error: "Cannot cancel completed job",
          currentStatus: job.status
        },
        { status: 400 }
      );
    }

    if (job.status === 'cancelled') {
      return NextResponse.json(
        { 
          error: "Job already cancelled",
          cancelledAt: job.completedAt
        },
        { status: 400 }
      );
    }

    // Cancel the job
    job.status = 'cancelled';
    job.completedAt = new Date().toISOString();
    batchJobs.set(jobId, job);

    return NextResponse.json({
      success: true,
      message: "Batch job cancelled successfully",
      jobId,
      status: job.status,
      cancelledAt: job.completedAt,
      progress: job.progress,
    });

  } catch (error) {
    console.error("Batch job cancel error:", error);
    return NextResponse.json(
      { error: "Failed to cancel batch job", message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}