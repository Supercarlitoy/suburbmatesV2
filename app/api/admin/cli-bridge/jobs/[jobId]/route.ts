import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient, CLIJobStatus } from '@prisma/client';
import { createClient } from '@supabase/supabase-js';
import { logAuditEvent } from '@/lib/utils/audit';
import { executeRealCLIJob } from '@/lib/services/cli-execution-service';

const prisma = new PrismaClient();
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface RouteContext {
  params: Promise<{
    jobId: string;
  }>;
}

/**
 * GET /api/admin/cli-bridge/jobs/[jobId]
 * Get specific CLI job details
 */
export async function GET(
  request: NextRequest,
  { params }: RouteContext
) {
  try {
    const { jobId } = await params;

    // Get the authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Missing or invalid authorization header' }, { status: 401 });
    }

    // Verify the user session
    const token = authHeader.substring(7);
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid authentication token' }, { status: 401 });
    }

    // Check if user is admin
    const userRecord = await prisma.user.findUnique({
      where: { id: user.id },
      select: { id: true, email: true, role: true }
    });

    if (!userRecord || userRecord.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Get the job
    const job = await prisma.cLIJob.findUnique({
      where: { id: jobId },
      include: {
        creator: {
          select: { id: true, email: true }
        }
      }
    });

    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    // Check if user can access this job (admins can see all, users can only see their own)
    if (userRecord.role !== 'ADMIN' && job.createdBy !== user.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    return NextResponse.json({
      success: true,
      job: {
        id: job.id,
        command: job.command,
        args: job.args,
        status: job.status,
        progress: job.progress,
        result: job.result,
        createdAt: job.createdAt,
        startedAt: job.startedAt,
        completedAt: job.completedAt,
        createdBy: {
          id: job.creator.id,
          email: job.creator.email
        },
        metadata: job.metadata
      }
    });

  } catch (error) {
    console.error('Get CLI job error:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/cli-bridge/jobs/[jobId]
 * Cancel a CLI job
 */
export async function DELETE(
  request: NextRequest,
  { params }: RouteContext
) {
  try {
    const { jobId } = await params;

    // Get the authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Missing or invalid authorization header' }, { status: 401 });
    }

    // Verify the user session
    const token = authHeader.substring(7);
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid authentication token' }, { status: 401 });
    }

    // Check if user is admin
    const userRecord = await prisma.user.findUnique({
      where: { id: user.id },
      select: { id: true, email: true, role: true }
    });

    if (!userRecord || userRecord.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Get the job
    const job = await prisma.cLIJob.findUnique({
      where: { id: jobId }
    });

    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    // Check if user can cancel this job
    if (userRecord.role !== 'ADMIN' && job.createdBy !== user.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Check if job can be cancelled
    if (!['PENDING', 'RUNNING'].includes(job.status)) {
      return NextResponse.json({ 
        error: `Cannot cancel job with status: ${job.status}. Only PENDING or RUNNING jobs can be cancelled.` 
      }, { status: 400 });
    }

    // Update job status to CANCELLED
    const updatedJob = await prisma.cLIJob.update({
      where: { id: jobId },
      data: {
        status: 'CANCELLED',
        completedAt: new Date(),
        result: {
          success: false,
          error: `Job cancelled by user ${user.email}`,
          output: ['Job was cancelled before completion'],
          warnings: []
        }
      },
      include: {
        creator: {
          select: { id: true, email: true }
        }
      }
    });

    // Log audit event
    await logAuditEvent({
      action: 'CLI_JOB_CANCELLED',
      target: jobId,
      meta: {
        command: job.command,
        cancelledBy: user.id,
        originalStatus: job.status
      },
      ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown'
    });

    return NextResponse.json({
      success: true,
      message: 'Job cancelled successfully',
      job: {
        id: updatedJob.id,
        command: updatedJob.command,
        status: updatedJob.status,
        completedAt: updatedJob.completedAt
      }
    });

  } catch (error) {
    console.error('Cancel CLI job error:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}

/**
 * POST /api/admin/cli-bridge/jobs/[jobId]/retry
 * Retry a failed CLI job
 */
export async function POST(
  request: NextRequest,
  { params }: RouteContext
) {
  try {
    const { jobId } = await params;

    // Get the authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Missing or invalid authorization header' }, { status: 401 });
    }

    // Verify the user session
    const token = authHeader.substring(7);
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid authentication token' }, { status: 401 });
    }

    // Check if user is admin
    const userRecord = await prisma.user.findUnique({
      where: { id: user.id },
      select: { id: true, email: true, role: true }
    });

    if (!userRecord || userRecord.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Get the original job
    const originalJob = await prisma.cLIJob.findUnique({
      where: { id: jobId }
    });

    if (!originalJob) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    // Check if user can retry this job
    if (userRecord.role !== 'ADMIN' && originalJob.createdBy !== user.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Check if job can be retried
    if (originalJob.status !== 'FAILED') {
      return NextResponse.json({ 
        error: `Cannot retry job with status: ${originalJob.status}. Only FAILED jobs can be retried.` 
      }, { status: 400 });
    }

    // Check user's concurrent job limit
    const activeJobs = await prisma.cLIJob.count({
      where: {
        createdBy: user.id,
        status: {
          in: ['PENDING', 'RUNNING']
        }
      }
    });

    const maxConcurrentJobs = 3;
    if (activeJobs >= maxConcurrentJobs) {
      return NextResponse.json({ 
        error: `Maximum concurrent jobs limit reached (${maxConcurrentJobs})` 
      }, { status: 429 });
    }

    // Create a new job as a retry of the original
    const retryJob = await prisma.cLIJob.create({
      data: {
        command: originalJob.command,
        args: originalJob.args,
        status: 'PENDING',
        createdBy: user.id,
        metadata: {
          ...originalJob.metadata,
          retryOf: originalJob.id,
          retryAttempt: (originalJob.metadata as any)?.retryAttempt ? ((originalJob.metadata as any).retryAttempt + 1) : 1
        }
      },
      include: {
        creator: {
          select: { id: true, email: true }
        }
      }
    });

    // Log audit event
    await logAuditEvent({
      action: 'CLI_JOB_RETRIED',
      target: retryJob.id,
      meta: {
        command: originalJob.command,
        originalJobId: originalJob.id,
        retryAttempt: (retryJob.metadata as any).retryAttempt || 1
      },
      ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown'
    });

    // Queue the retry job for execution using real CLI integration
    setImmediate(() => executeRealCLIJob(retryJob.id));

    return NextResponse.json({
      success: true,
      message: 'Job retry created successfully',
      job: {
        id: retryJob.id,
        command: retryJob.command,
        args: retryJob.args,
        status: retryJob.status,
        createdAt: retryJob.createdAt,
        createdBy: {
          id: retryJob.creator.id,
          email: retryJob.creator.email
        },
        metadata: retryJob.metadata
      },
      originalJob: {
        id: originalJob.id,
        status: originalJob.status
      }
    });

  } catch (error) {
    console.error('Retry CLI job error:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}

// Retry job execution is now handled by the cli-execution-service module
// The same real CLI integration is used for both original and retry jobs
