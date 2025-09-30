import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser, isAdmin } from "@/server/auth/auth";
import { calculateQualityScore } from "@/lib/services/quality-scoring";
import { AdminBusinessService } from "@/lib/services/admin-business";
import { prisma } from "@/lib/database/prisma";
import { z } from "zod";

interface BatchJob {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  progress: {
    total: number;
    processed: number;
    successful: number;
    failed: number;
    percentage: number;
  };
  criteria: any;
  results: {
    successful: Array<{
      businessId: string;
      businessName: string;
      previousScore: number;
      newScore: number;
      scoreChange: number;
    }>;
    failed: Array<{
      businessId: string;
      businessName: string;
      error: string;
    }>;
  };
  startedAt: string;
  completedAt?: string;
  createdBy: string;
  estimatedDuration?: number; // in seconds
}

// In-memory job storage (in production, use Redis or database)
// Use global variable to persist across requests
declare global {
  var batchJobs: Map<string, BatchJob> | undefined;
}

if (!globalThis.batchJobs) {
  globalThis.batchJobs = new Map<string, BatchJob>();
}
const batchJobs = globalThis.batchJobs;

const BatchUpdateSchema = z.object({
  criteria: z.object({
    businessIds: z.array(z.string()).optional(),
    minScore: z.number().min(0).max(100).optional(),
    maxScore: z.number().min(0).max(100).optional(),
    category: z.string().optional(),
    suburb: z.string().optional(),
    abnStatus: z.enum(['NOT_PROVIDED', 'PENDING', 'VERIFIED', 'INVALID', 'EXPIRED']).optional(),
    approvalStatus: z.enum(['PENDING', 'APPROVED', 'REJECTED']).default('APPROVED'),
    limit: z.number().min(1).max(5000).optional(),
  }),
  options: z.object({
    async: z.boolean().default(true),
    webhookUrl: z.string().url().optional(),
    rollbackOnError: z.boolean().default(false),
    dryRun: z.boolean().default(false),
  }).optional(),
});

type BatchUpdateRequest = z.infer<typeof BatchUpdateSchema>;

/**
 * POST /api/admin/quality-scoring/batch-update
 * Start batch processing of quality score updates
 */
export async function POST(request: NextRequest) {
  try {
    // Check admin authentication
    const user = await getCurrentUser();
    if (!user || !(await isAdmin())) {
      return NextResponse.json(
        { error: "Unauthorized. Admin access required." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const adminService = new AdminBusinessService(prisma);

    // Validate request
    const validationResult = BatchUpdateSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: "Invalid batch update request",
          details: validationResult.error.issues
        },
        { status: 400 }
      );
    }

    const { criteria, options = {} } = validationResult.data;

    // Get businesses matching criteria
    const businesses = await getBusinessesForBatch(criteria);

    if (businesses.length === 0) {
      return NextResponse.json(
        { 
          error: "No businesses match the specified criteria",
          criteria
        },
        { status: 400 }
      );
    }

    if (businesses.length > 1000 && !options.async) {
      return NextResponse.json(
        { 
          error: "Large batches (>1000) must use async processing",
          businessCount: businesses.length,
          suggestion: "Set options.async = true"
        },
        { status: 400 }
      );
    }

    // Create job
    const jobId = generateJobId();
    const job: BatchJob = {
      id: jobId,
      status: 'pending',
      progress: {
        total: businesses.length,
        processed: 0,
        successful: 0,
        failed: 0,
        percentage: 0,
      },
      criteria,
      results: {
        successful: [],
        failed: [],
      },
      startedAt: new Date().toISOString(),
      createdBy: user.id,
      estimatedDuration: Math.ceil(businesses.length / 10), // ~10 businesses per second
    };

    batchJobs.set(jobId, job);

    // Log batch start
    await adminService.logAdminAccess(
      'ADMIN_QUALITY_SCORING_BATCH_START',
      null,
      user.id,
      {
        jobId,
        criteria,
        businessCount: businesses.length,
        async: options.async,
        dryRun: options.dryRun,
        estimatedDuration: job.estimatedDuration,
      },
      request.headers.get('x-forwarded-for') || 'unknown',
      request.headers.get('user-agent') || 'unknown'
    );

    // Start processing
    if (options.async) {
      // Start background processing
      processBatchAsync(jobId, businesses, options, user.id).catch(error => {
        console.error(`Batch job ${jobId} failed:`, error);
        const job = batchJobs.get(jobId);
        if (job) {
          job.status = 'failed';
          job.completedAt = new Date().toISOString();
          batchJobs.set(jobId, job);
        }
      });

      return NextResponse.json({
        success: true,
        message: "Batch processing started",
        jobId,
        status: 'processing',
        progress: job.progress,
        estimatedDuration: job.estimatedDuration,
        pollUrl: `/api/admin/quality-scoring/batch-update/${jobId}`,
        webhookUrl: options.webhookUrl,
      });
    } else {
      // Process synchronously for small batches
      job.status = 'processing';
      batchJobs.set(jobId, job);

      const result = await processBatchSync(job, businesses, options, user.id);
      
      return NextResponse.json({
        success: true,
        message: "Batch processing completed",
        jobId,
        result,
      });
    }

  } catch (error) {
    console.error("Batch update error:", error);

    // Log error for audit
    try {
      const user = await getCurrentUser();
      const adminService = new AdminBusinessService(prisma);
      await adminService.logAdminAccess(
        'ADMIN_QUALITY_SCORING_BATCH_ERROR',
        null,
        user?.id || null,
        {
          error: error instanceof Error ? error.message : 'Unknown error',
          requestBody: body,
        },
        request.headers.get('x-forwarded-for') || 'unknown',
        request.headers.get('user-agent') || 'unknown'
      );
    } catch (auditError) {
      console.error('Failed to log audit event:', auditError);
    }

    return NextResponse.json(
      { error: "Failed to start batch processing", message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/admin/quality-scoring/batch-update
 * Get list of batch jobs
 */
export async function GET(request: NextRequest) {
  try {
    // Check admin authentication
    const user = await getCurrentUser();
    if (!user || !(await isAdmin())) {
      return NextResponse.json(
        { error: "Unauthorized. Admin access required." },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') as BatchJob['status'] | null;
    const limit = Math.min(50, parseInt(searchParams.get('limit') || '20'));

    // Filter jobs
    let jobs = Array.from(batchJobs.values());
    
    if (status) {
      jobs = jobs.filter(job => job.status === status);
    }

    // Sort by creation date (newest first)
    jobs.sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime());

    // Apply limit
    jobs = jobs.slice(0, limit);

    // Clean up old completed jobs (older than 24 hours)
    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);
    for (const [jobId, job] of batchJobs.entries()) {
      if (job.status === 'completed' && new Date(job.startedAt) < cutoff) {
        batchJobs.delete(jobId);
      }
    }

    return NextResponse.json({
      success: true,
      jobs: jobs.map(job => ({
        ...job,
        results: {
          successful: job.results.successful.length,
          failed: job.results.failed.length,
          // Include only summary for list view
        }
      })),
      total: batchJobs.size,
    });

  } catch (error) {
    console.error("Batch jobs list error:", error);
    return NextResponse.json(
      { error: "Failed to fetch batch jobs", message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/quality-scoring/batch-update
 * Cancel running batch jobs
 */
export async function DELETE(request: NextRequest) {
  try {
    // Check admin authentication
    const user = await getCurrentUser();
    if (!user || !(await isAdmin())) {
      return NextResponse.json(
        { error: "Unauthorized. Admin access required." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { jobIds } = z.object({ 
      jobIds: z.array(z.string()).min(1).max(10) 
    }).parse(body);

    const results = [];

    for (const jobId of jobIds) {
      const job = batchJobs.get(jobId);
      if (!job) {
        results.push({ jobId, status: 'not_found', message: 'Job not found' });
        continue;
      }

      if (job.status === 'completed' || job.status === 'failed') {
        results.push({ jobId, status: 'already_finished', message: 'Job already completed' });
        continue;
      }

      // Cancel the job
      job.status = 'cancelled';
      job.completedAt = new Date().toISOString();
      batchJobs.set(jobId, job);
      
      results.push({ jobId, status: 'cancelled', message: 'Job cancelled successfully' });
    }

    return NextResponse.json({
      success: true,
      message: `Processed ${jobIds.length} cancellation requests`,
      results,
    });

  } catch (error) {
    console.error("Batch cancel error:", error);
    return NextResponse.json(
      { error: "Failed to cancel batch jobs", message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * Get businesses for batch processing based on criteria
 */
async function getBusinessesForBatch(criteria: any) {
  const where: any = {
    approvalStatus: criteria.approvalStatus || 'APPROVED',
  };

  if (criteria.businessIds && criteria.businessIds.length > 0) {
    where.id = { in: criteria.businessIds };
  }

  if (criteria.minScore !== undefined || criteria.maxScore !== undefined) {
    where.qualityScore = {};
    if (criteria.minScore !== undefined) where.qualityScore.gte = criteria.minScore;
    if (criteria.maxScore !== undefined) where.qualityScore.lte = criteria.maxScore;
  }

  if (criteria.category) where.category = criteria.category;
  if (criteria.suburb) where.suburb = criteria.suburb;
  if (criteria.abnStatus) where.abnStatus = criteria.abnStatus;

  return await prisma.business.findMany({
    where,
    select: {
      id: true,
      name: true,
      slug: true,
      qualityScore: true,
      suburb: true,
      category: true,
      abnStatus: true,
    },
    take: criteria.limit || 5000,
    orderBy: { qualityScore: 'asc' }, // Process lowest scores first
  });
}

/**
 * Process batch synchronously (for small batches)
 */
async function processBatchSync(job: BatchJob, businesses: any[], options: any, userId: string) {
  job.status = 'processing';
  batchJobs.set(job.id, job);

  const adminService = new AdminBusinessService(prisma);

  for (const business of businesses) {
    try {
      if (job.status === 'cancelled') break;

      // Get full business data for scoring
      const fullBusiness = await prisma.business.findUnique({
        where: { id: business.id },
        include: {
          customization: true,
          content: { where: { isPublic: true } },
          inquiries: {
            where: {
              createdAt: { gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) },
            },
          },
          leads: {
            where: {
              createdAt: { gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) },
            },
          },
        },
      });

      if (!fullBusiness) {
        job.results.failed.push({
          businessId: business.id,
          businessName: business.name,
          error: 'Business not found during processing',
        });
        continue;
      }

      const previousScore = fullBusiness.qualityScore;
      const newScore = calculateQualityScore(fullBusiness);
      const scoreChange = newScore - previousScore;

      if (!options.dryRun) {
        await prisma.business.update({
          where: { id: business.id },
          data: {
            qualityScore: newScore,
            updatedAt: new Date(),
          },
        });
      }

      job.results.successful.push({
        businessId: business.id,
        businessName: business.name,
        previousScore,
        newScore,
        scoreChange,
      });

      job.progress.successful++;
      
    } catch (error) {
      job.results.failed.push({
        businessId: business.id,
        businessName: business.name,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      job.progress.failed++;
    }

    job.progress.processed++;
    job.progress.percentage = Math.round((job.progress.processed / job.progress.total) * 100);
    batchJobs.set(job.id, job);
  }

  job.status = job.progress.failed > 0 && options.rollbackOnError ? 'failed' : 'completed';
  job.completedAt = new Date().toISOString();
  batchJobs.set(job.id, job);

  // Log completion
  await adminService.logAdminAccess(
    'ADMIN_QUALITY_SCORING_BATCH_COMPLETE',
    null,
    userId,
    {
      jobId: job.id,
      totalProcessed: job.progress.processed,
      successful: job.progress.successful,
      failed: job.progress.failed,
      status: job.status,
      dryRun: options.dryRun,
    },
    'system',
    'batch-processor'
  );

  return job;
}

/**
 * Process batch asynchronously in background
 */
async function processBatchAsync(jobId: string, businesses: any[], options: any, userId: string) {
  const job = batchJobs.get(jobId);
  if (!job) return;

  // Add small delay to ensure response is sent first
  await new Promise(resolve => setTimeout(resolve, 100));

  job.status = 'processing';
  batchJobs.set(jobId, job);

  const adminService = new AdminBusinessService(prisma);

  // Process in batches to avoid overwhelming the database
  const batchSize = 10;
  for (let i = 0; i < businesses.length; i += batchSize) {
    if (job.status === 'cancelled') break;

    const batch = businesses.slice(i, i + batchSize);
    
    await Promise.all(batch.map(async (business) => {
      try {
        // Get full business data for scoring
        const fullBusiness = await prisma.business.findUnique({
          where: { id: business.id },
          include: {
            customization: true,
            content: { where: { isPublic: true } },
            inquiries: {
              where: {
                createdAt: { gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) },
              },
            },
            leads: {
              where: {
                createdAt: { gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) },
              },
            },
          },
        });

        if (!fullBusiness) {
          job.results.failed.push({
            businessId: business.id,
            businessName: business.name,
            error: 'Business not found during processing',
          });
          job.progress.failed++;
          return;
        }

        const previousScore = fullBusiness.qualityScore;
        const newScore = calculateQualityScore(fullBusiness);
        const scoreChange = newScore - previousScore;

        if (!options.dryRun) {
          await prisma.business.update({
            where: { id: business.id },
            data: {
              qualityScore: newScore,
              updatedAt: new Date(),
            },
          });
        }

        job.results.successful.push({
          businessId: business.id,
          businessName: business.name,
          previousScore,
          newScore,
          scoreChange,
        });

        job.progress.successful++;
        
      } catch (error) {
        job.results.failed.push({
          businessId: business.id,
          businessName: business.name,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
        job.progress.failed++;
      }

      job.progress.processed++;
      job.progress.percentage = Math.round((job.progress.processed / job.progress.total) * 100);
    }));

    // Update job progress
    batchJobs.set(jobId, job);

    // Send webhook update if configured
    if (options.webhookUrl && job.progress.processed % 50 === 0) {
      try {
        await fetch(options.webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jobId,
            status: job.status,
            progress: job.progress,
            timestamp: new Date().toISOString(),
          }),
        });
      } catch (webhookError) {
        console.warn('Webhook notification failed:', webhookError);
      }
    }

    // Small delay between batches to prevent overwhelming
    if (i + batchSize < businesses.length) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  // Finalize job
  const finalJob = batchJobs.get(jobId);
  if (finalJob) {
    finalJob.status = finalJob.progress.failed > 0 && options.rollbackOnError ? 'failed' : 'completed';
    finalJob.completedAt = new Date().toISOString();
    batchJobs.set(jobId, finalJob);

    // Final webhook notification
    if (options.webhookUrl) {
      try {
        await fetch(options.webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jobId,
            status: finalJob.status,
            progress: finalJob.progress,
            results: {
              successful: finalJob.results.successful.length,
              failed: finalJob.results.failed.length,
            },
            completedAt: finalJob.completedAt,
          }),
        });
      } catch (webhookError) {
        console.warn('Final webhook notification failed:', webhookError);
      }
    }

    // Log completion
    await adminService.logAdminAccess(
      'ADMIN_QUALITY_SCORING_BATCH_COMPLETE',
      null,
      userId,
      {
        jobId,
        totalProcessed: finalJob.progress.processed,
        successful: finalJob.progress.successful,
        failed: finalJob.progress.failed,
        status: finalJob.status,
        dryRun: options.dryRun,
      },
      'system',
      'batch-processor'
    );
  }
}

/**
 * Generate unique job ID
 */
function generateJobId(): string {
  return `batch_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
}