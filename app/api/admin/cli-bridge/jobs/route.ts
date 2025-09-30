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

// CLI Job Validation Schema
interface CreateCLIJobRequest {
  command: string;
  args: Record<string, any>;
  metadata?: Record<string, any>;
}

interface CLIJob {
  id: string;
  command: string;
  args: Record<string, any>;
  status: CLIJobStatus;
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
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  createdBy: string;
  metadata: Record<string, any>;
}

/**
 * POST /api/admin/cli-bridge/jobs
 * Create a new CLI job
 */
export async function POST(request: NextRequest) {
  try {
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

    // Parse and validate request body
    const body: CreateCLIJobRequest = await request.json();

    if (!body.command || !body.args) {
      return NextResponse.json({ 
        error: 'Missing required fields: command and args' 
      }, { status: 400 });
    }

    // Validate command is one of the allowed CLI commands
    const allowedCommands = [
      'list-businesses',
      'import-csv',
      'export-csv',
      'approve-business',
      'reject-business',
      'stats',
      'list-suburbs',
      'list-categories',
      'batch-approve',
      'batch-reject',
      'quality-recalculation',
      'duplicate-detection'
    ];

    if (!allowedCommands.includes(body.command)) {
      return NextResponse.json({ 
        error: `Invalid command. Allowed commands: ${allowedCommands.join(', ')}` 
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

    const maxConcurrentJobs = 3; // Per user limit
    if (activeJobs >= maxConcurrentJobs) {
      return NextResponse.json({ 
        error: `Maximum concurrent jobs limit reached (${maxConcurrentJobs})` 
      }, { status: 429 });
    }

    // Create the CLI job
    const newJob = await prisma.cLIJob.create({
      data: {
        command: body.command,
        args: body.args,
        status: 'PENDING',
        createdBy: user.id,
        metadata: body.metadata || {}
      },
      include: {
        creator: {
          select: { id: true, email: true }
        }
      }
    });

    // Log audit event
    await logAuditEvent({
      action: 'CLI_JOB_CREATED',
      target: newJob.id,
      meta: {
        command: body.command,
        args: body.args,
        jobId: newJob.id
      },
      ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown'
    });

    // Queue the job for execution using real CLI integration
    setImmediate(() => executeRealCLIJob(newJob.id));

    return NextResponse.json({
      success: true,
      job: {
        id: newJob.id,
        command: newJob.command,
        args: newJob.args,
        status: newJob.status,
        createdAt: newJob.createdAt,
        createdBy: {
          id: newJob.creator.id,
          email: newJob.creator.email
        },
        metadata: newJob.metadata
      }
    });

  } catch (error) {
    console.error('Create CLI job error:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}

/**
 * GET /api/admin/cli-bridge/jobs
 * List CLI jobs with pagination and filtering
 */
export async function GET(request: NextRequest) {
  try {
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

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '10')));
    const status = searchParams.get('status') as CLIJobStatus | null;
    const command = searchParams.get('command');
    const createdBy = searchParams.get('createdBy'); // For admin to see all users' jobs

    // Build where clause
    const where: any = {};
    
    if (status && ['PENDING', 'RUNNING', 'COMPLETED', 'FAILED', 'CANCELLED'].includes(status)) {
      where.status = status;
    }
    
    if (command) {
      where.command = command;
    }
    
    if (createdBy) {
      where.createdBy = createdBy;
    } else {
      // Non-admin users can only see their own jobs
      if (userRecord.role !== 'ADMIN') {
        where.createdBy = user.id;
      }
    }

    // Get jobs with pagination
    const [jobs, totalCount] = await Promise.all([
      prisma.cLIJob.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          creator: {
            select: { id: true, email: true }
          }
        }
      }),
      prisma.cLIJob.count({ where })
    ]);

    // Get summary statistics
    const stats = await prisma.cLIJob.groupBy({
      by: ['status'],
      where: userRecord.role === 'ADMIN' ? {} : { createdBy: user.id },
      _count: true
    });

    const statusCounts = stats.reduce((acc, stat) => {
      acc[stat.status] = stat._count;
      return acc;
    }, {} as Record<string, number>);

    return NextResponse.json({
      success: true,
      jobs: jobs.map(job => ({
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
      })),
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit)
      },
      stats: {
        pending: statusCounts.PENDING || 0,
        running: statusCounts.RUNNING || 0,
        completed: statusCounts.COMPLETED || 0,
        failed: statusCounts.FAILED || 0,
        cancelled: statusCounts.CANCELLED || 0
      }
    });

  } catch (error) {
    console.error('List CLI jobs error:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}

// CLI execution is now handled by the cli-execution-service module
// which provides real CLI integration instead of mock responses
