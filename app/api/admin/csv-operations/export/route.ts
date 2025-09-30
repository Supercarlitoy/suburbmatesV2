import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser, isAdmin } from "@/server/auth/auth";
import { AdminBusinessService } from "@/lib/services/admin-business";
import { prisma } from "@/lib/database/prisma";
import { z } from "zod";
import { randomUUID } from "crypto";

interface CSVExportJob {
  jobId: string;
  filename: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  progress: number; // 0-100
  totalRecords: number;
  processedRecords: number;
  startTime: string;
  endTime?: string;
  estimatedTimeRemaining?: number; // seconds
  downloadUrl?: string;
  fileSize?: number; // bytes
  errors: Array<{
    message: string;
    details?: any;
  }>;
  filters: any;
  selectedFields: string[];
  format: string;
}

// Global export job storage (in production, this should be Redis or database)
const exportJobs = new Map<string, CSVExportJob>();

const ExportRequestSchema = z.object({
  // File options
  filename: z.string().optional().default('suburbmates_export'),
  format: z.enum(['csv', 'xlsx', 'json']).optional().default('csv'),
  
  // Field selection
  selectedFields: z.array(z.string()).optional().default([
    'name', 'email', 'phone', 'website', 'address', 'suburb', 'category', 'approvalStatus'
  ]),
  includeAllFields: z.boolean().optional().default(false),
  
  // Filtering options
  approvalStatus: z.enum(['PENDING', 'APPROVED', 'REJECTED', 'all']).optional().default('all'),
  abnStatus: z.enum(['VERIFIED', 'PENDING', 'INVALID', 'EXPIRED', 'NOT_PROVIDED', 'all']).optional().default('all'),
  source: z.enum(['MANUAL', 'CSV', 'AUTO_ENRICH', 'CLAIMED', 'all']).optional().default('all'),
  category: z.string().optional(),
  suburb: z.string().optional(),
  
  // Quality and date filters
  qualityScoreMin: z.number().min(0).max(100).optional(),
  qualityScoreMax: z.number().min(0).max(100).optional(),
  createdAfter: z.string().datetime().optional(),
  createdBefore: z.string().datetime().optional(),
  updatedAfter: z.string().datetime().optional(),
  updatedBefore: z.string().datetime().optional(),
  
  // Owner and claim filters
  hasOwner: z.enum(['yes', 'no', 'all']).optional().default('all'),
  hasClaims: z.enum(['yes', 'no', 'all']).optional().default('all'),
  
  // Content and engagement filters
  hasWebsite: z.enum(['yes', 'no', 'all']).optional().default('all'),
  hasEmail: z.enum(['yes', 'no', 'all']).optional().default('all'),
  hasPhone: z.enum(['yes', 'no', 'all']).optional().default('all'),
  
  // Advanced filters
  isDuplicate: z.enum(['yes', 'no', 'all']).optional().default('all'),
  hasRecentActivity: z.enum(['yes', 'no', 'all']).optional().default('all'), // inquiries in last 30 days
  
  // Processing options
  batchSize: z.number().min(1).max(10000).optional().default(1000),
  includeRelatedData: z.boolean().optional().default(false),
  
  // Notification options
  notifyOnCompletion: z.boolean().optional().default(false),
  webhookUrl: z.string().url().optional(),
});

/**
 * POST /api/admin/csv-operations/export
 * Export businesses to CSV with filtering and progress tracking
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
    const validationResult = ExportRequestSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: "Invalid export request",
          details: validationResult.error.issues
        },
        { status: 400 }
      );
    }

    const exportData = validationResult.data;

    // Build query filters
    const whereClause = buildWhereClause(exportData);

    // Count total records to export
    const totalRecords = await prisma.business.count({
      where: whereClause
    });

    if (totalRecords === 0) {
      return NextResponse.json(
        { error: "No businesses match the specified filters" },
        { status: 400 }
      );
    }

    // Generate filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const filename = `${exportData.filename}_${timestamp}.${exportData.format}`;

    // Create export job
    const jobId = randomUUID();
    const exportJob: CSVExportJob = {
      jobId,
      filename,
      status: 'pending',
      progress: 0,
      totalRecords,
      processedRecords: 0,
      startTime: new Date().toISOString(),
      errors: [],
      filters: exportData,
      selectedFields: exportData.includeAllFields ? getAllAvailableFields() : exportData.selectedFields,
      format: exportData.format,
    };

    // Store job
    exportJobs.set(jobId, exportJob);

    // Start processing (async)
    processExportJob(jobId, exportData, whereClause, user.id, adminService)
      .catch(error => {
        console.error('Export job processing error:', error);
        const job = exportJobs.get(jobId);
        if (job) {
          job.status = 'failed';
          job.errors.push({
            message: error instanceof Error ? error.message : 'Unknown processing error'
          });
          job.endTime = new Date().toISOString();
          exportJobs.set(jobId, job);
        }
      });

    // Log export initiation
    await adminService.logAdminAccess(
      'ADMIN_CSV_EXPORT_INITIATED',
      null,
      user.id,
      {
        filename,
        jobId,
        totalRecords,
        format: exportData.format,
        selectedFields: exportJob.selectedFields,
        filters: {
          approvalStatus: exportData.approvalStatus,
          abnStatus: exportData.abnStatus,
          source: exportData.source,
          category: exportData.category,
          suburb: exportData.suburb,
          qualityScoreRange: exportData.qualityScoreMin || exportData.qualityScoreMax ? 
            `${exportData.qualityScoreMin || 0}-${exportData.qualityScoreMax || 100}` : null,
          dateFilters: {
            createdAfter: exportData.createdAfter,
            createdBefore: exportData.createdBefore,
            updatedAfter: exportData.updatedAfter,
            updatedBefore: exportData.updatedBefore,
          },
        },
      },
      request.headers.get('x-forwarded-for') || 'unknown',
      request.headers.get('user-agent') || 'unknown'
    );

    return NextResponse.json({
      success: true,
      result: {
        jobId,
        status: 'processing',
        message: `Export job started for ${totalRecords} businesses`,
        filename,
        totalRecords,
        estimatedTimeMinutes: Math.ceil(totalRecords / 1000), // Rough estimate
        selectedFields: exportJob.selectedFields,
        filters: exportData,
      },
    });

  } catch (error) {
    console.error("CSV export error:", error);

    // Log error for audit
    try {
      const user = await getCurrentUser();
      const adminService = new AdminBusinessService(prisma);
      await adminService.logAdminAccess(
        'ADMIN_CSV_EXPORT_ERROR',
        null,
        user?.id || null,
        {
          error: error instanceof Error ? error.message : 'Unknown error',
          requestBody: JSON.stringify(body).substring(0, 1000), // Limit size
        },
        request.headers.get('x-forwarded-for') || 'unknown',
        request.headers.get('user-agent') || 'unknown'
      );
    } catch (auditError) {
      console.error('Failed to log audit event:', auditError);
    }

    return NextResponse.json(
      { error: "Failed to process CSV export", message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * Build where clause for database query
 */
function buildWhereClause(exportData: any) {
  const where: any = {};

  // Approval status filter
  if (exportData.approvalStatus !== 'all') {
    where.approvalStatus = exportData.approvalStatus;
  }

  // ABN status filter
  if (exportData.abnStatus !== 'all') {
    where.abnStatus = exportData.abnStatus;
  }

  // Source filter
  if (exportData.source !== 'all') {
    where.source = exportData.source;
  }

  // Category filter
  if (exportData.category) {
    where.category = exportData.category;
  }

  // Suburb filter
  if (exportData.suburb) {
    where.suburb = exportData.suburb;
  }

  // Quality score range
  if (exportData.qualityScoreMin !== undefined || exportData.qualityScoreMax !== undefined) {
    where.qualityScore = {};
    if (exportData.qualityScoreMin !== undefined) {
      where.qualityScore.gte = exportData.qualityScoreMin;
    }
    if (exportData.qualityScoreMax !== undefined) {
      where.qualityScore.lte = exportData.qualityScoreMax;
    }
  }

  // Date filters
  if (exportData.createdAfter || exportData.createdBefore) {
    where.createdAt = {};
    if (exportData.createdAfter) {
      where.createdAt.gte = new Date(exportData.createdAfter);
    }
    if (exportData.createdBefore) {
      where.createdAt.lte = new Date(exportData.createdBefore);
    }
  }

  if (exportData.updatedAfter || exportData.updatedBefore) {
    where.updatedAt = {};
    if (exportData.updatedAfter) {
      where.updatedAt.gte = new Date(exportData.updatedAfter);
    }
    if (exportData.updatedBefore) {
      where.updatedAt.lte = new Date(exportData.updatedBefore);
    }
  }

  // Owner filter
  if (exportData.hasOwner !== 'all') {
    if (exportData.hasOwner === 'yes') {
      where.ownerId = { not: null };
    } else {
      where.ownerId = null;
    }
  }

  // Claims filter
  if (exportData.hasClaims !== 'all') {
    if (exportData.hasClaims === 'yes') {
      where.ownershipClaims = { some: {} };
    } else {
      where.ownershipClaims = { none: {} };
    }
  }

  // Contact info filters
  if (exportData.hasWebsite !== 'all') {
    if (exportData.hasWebsite === 'yes') {
      where.website = { not: null };
    } else {
      where.website = null;
    }
  }

  if (exportData.hasEmail !== 'all') {
    if (exportData.hasEmail === 'yes') {
      where.email = { not: null };
    } else {
      where.email = null;
    }
  }

  if (exportData.hasPhone !== 'all') {
    if (exportData.hasPhone === 'yes') {
      where.phone = { not: null };
    } else {
      where.phone = null;
    }
  }

  // Duplicate filter
  if (exportData.isDuplicate !== 'all') {
    if (exportData.isDuplicate === 'yes') {
      where.duplicateOfId = { not: null };
    } else {
      where.duplicateOfId = null;
    }
  }

  // Recent activity filter
  if (exportData.hasRecentActivity !== 'all') {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    if (exportData.hasRecentActivity === 'yes') {
      where.inquiries = {
        some: {
          createdAt: { gte: thirtyDaysAgo }
        }
      };
    } else {
      where.inquiries = {
        none: {
          createdAt: { gte: thirtyDaysAgo }
        }
      };
    }
  }

  return where;
}

/**
 * Get all available fields for export
 */
function getAllAvailableFields(): string[] {
  return [
    // Core business data
    'id', 'name', 'email', 'phone', 'website', 'address', 'suburb', 'postcode',
    'category', 'bio', 'abn', 'abnStatus', 'source', 'approvalStatus', 'qualityScore',
    
    // Metadata
    'createdAt', 'updatedAt', 'approvedAt', 'rejectedAt',
    
    // Ownership and claims
    'ownerId', 'duplicateOfId',
    
    // Location data
    'latitude', 'longitude',
    
    // Counts and stats
    'inquiryCount', 'leadCount', 'claimCount',
  ];
}

/**
 * Process export job asynchronously
 */
async function processExportJob(
  jobId: string,
  exportData: any,
  whereClause: any,
  userId: string,
  adminService: AdminBusinessService
) {
  const job = exportJobs.get(jobId);
  if (!job) return;

  job.status = 'processing';
  exportJobs.set(jobId, job);

  const batchSize = exportData.batchSize || 1000;
  let processedCount = 0;
  const exportedData: any[] = [];

  try {
    // Process in batches
    let skip = 0;
    let hasMore = true;

    while (hasMore && job.status !== 'cancelled') {
      // Fetch batch of businesses
      const businesses = await fetchBusinessBatch(
        whereClause,
        skip,
        batchSize,
        job.selectedFields,
        exportData.includeRelatedData
      );

      if (businesses.length === 0) {
        hasMore = false;
        break;
      }

      // Process batch
      const processedBatch = await processBatch(businesses, job.selectedFields, exportData);
      exportedData.push(...processedBatch);

      processedCount += businesses.length;
      skip += batchSize;

      // Update progress
      job.processedRecords = processedCount;
      job.progress = Math.round((processedCount / job.totalRecords) * 100);

      // Calculate ETA
      const elapsed = new Date().getTime() - new Date(job.startTime).getTime();
      const avgTimePerRecord = elapsed / processedCount;
      const remainingRecords = job.totalRecords - processedCount;
      job.estimatedTimeRemaining = Math.round((remainingRecords * avgTimePerRecord) / 1000);

      exportJobs.set(jobId, job);

      // Check if we've processed all records
      if (businesses.length < batchSize) {
        hasMore = false;
      }
    }

    // Generate file content
    let fileContent: string;
    let mimeType: string;
    
    if (job.format === 'csv') {
      fileContent = generateCSVContent(exportedData, job.selectedFields);
      mimeType = 'text/csv';
    } else if (job.format === 'json') {
      fileContent = JSON.stringify(exportedData, null, 2);
      mimeType = 'application/json';
    } else {
      // For XLSX, we'd need a library like 'xlsx'
      fileContent = generateCSVContent(exportedData, job.selectedFields);
      mimeType = 'text/csv';
    }

    // In a real implementation, you'd save this to a file storage service
    // For now, we'll store it in memory (not suitable for production)
    job.fileSize = Buffer.byteLength(fileContent, 'utf8');
    job.downloadUrl = `data:${mimeType};base64,${Buffer.from(fileContent).toString('base64')}`;

    // Job completed
    job.status = 'completed';
    job.progress = 100;
    job.endTime = new Date().toISOString();
    job.estimatedTimeRemaining = 0;
    exportJobs.set(jobId, job);

    // Log completion
    await adminService.logAdminAccess(
      'ADMIN_CSV_EXPORT_COMPLETED',
      null,
      userId,
      {
        jobId,
        filename: job.filename,
        totalRecords: job.totalRecords,
        processedRecords: processedCount,
        format: job.format,
        fileSize: job.fileSize,
        processingTimeMs: new Date().getTime() - new Date(job.startTime).getTime(),
        selectedFields: job.selectedFields,
      }
    );

  } catch (error) {
    job.status = 'failed';
    job.endTime = new Date().toISOString();
    job.errors.push({
      message: error instanceof Error ? error.message : 'Processing failed'
    });
    exportJobs.set(jobId, job);

    // Log failure
    await adminService.logAdminAccess(
      'ADMIN_CSV_EXPORT_FAILED',
      null,
      userId,
      {
        jobId,
        filename: job.filename,
        error: error instanceof Error ? error.message : 'Unknown error',
        processedRecords: processedCount,
      }
    );
  }
}

/**
 * Fetch a batch of businesses for export
 */
async function fetchBusinessBatch(
  whereClause: any,
  skip: number,
  take: number,
  selectedFields: string[],
  includeRelatedData: boolean
) {
  // Build select clause based on selected fields
  const select: any = {};
  selectedFields.forEach(field => {
    if (field === 'inquiryCount' || field === 'leadCount' || field === 'claimCount') {
      // Skip these as they'll be calculated
      return;
    }
    select[field] = true;
  });

  // Include related data if requested
  const include: any = {};
  if (includeRelatedData) {
    include.ownershipClaims = {
      select: { id: true, status: true, createdAt: true }
    };
    include.inquiries = {
      select: { id: true, createdAt: true },
      take: 5,
      orderBy: { createdAt: 'desc' }
    };
    include._count = {
      select: {
        inquiries: true,
        leads: true,
        ownershipClaims: true,
      }
    };
  }

  return await prisma.business.findMany({
    where: whereClause,
    select: Object.keys(select).length > 0 ? select : undefined,
    include: Object.keys(include).length > 0 ? include : undefined,
    skip,
    take,
    orderBy: { createdAt: 'desc' },
  });
}

/**
 * Process a batch of businesses for export
 */
async function processBatch(businesses: any[], selectedFields: string[], exportData: any) {
  return businesses.map(business => {
    const record: any = {};
    
    selectedFields.forEach(field => {
      if (field === 'inquiryCount') {
        record[field] = business._count?.inquiries || 0;
      } else if (field === 'leadCount') {
        record[field] = business._count?.leads || 0;
      } else if (field === 'claimCount') {
        record[field] = business._count?.ownershipClaims || 0;
      } else {
        record[field] = business[field];
      }
    });

    // Format dates for better readability
    ['createdAt', 'updatedAt', 'approvedAt', 'rejectedAt'].forEach(dateField => {
      if (record[dateField] && selectedFields.includes(dateField)) {
        record[dateField] = new Date(record[dateField]).toISOString().split('T')[0]; // YYYY-MM-DD format
      }
    });

    return record;
  });
}

/**
 * Generate CSV content from data
 */
function generateCSVContent(data: any[], fields: string[]): string {
  if (data.length === 0) {
    return fields.join(',') + '\n';
  }

  // Generate CSV header
  const header = fields.join(',');
  
  // Generate CSV rows
  const rows = data.map(record => {
    return fields.map(field => {
      let value = record[field] || '';
      
      // Handle values that need escaping
      if (typeof value === 'string') {
        // Escape quotes and wrap in quotes if contains comma or quotes
        if (value.includes(',') || value.includes('"') || value.includes('\n')) {
          value = '"' + value.replace(/"/g, '""') + '"';
        }
      }
      
      return value;
    }).join(',');
  });

  return [header, ...rows].join('\n');
}

/**
 * GET /api/admin/csv-operations/export
 * Get list of export jobs
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || !(await isAdmin())) {
      return NextResponse.json(
        { error: "Unauthorized. Admin access required." },
        { status: 403 }
      );
    }

    // Get all export jobs
    const allJobs = Array.from(exportJobs.values()).map(job => ({
      jobId: job.jobId,
      filename: job.filename,
      status: job.status,
      progress: job.progress,
      totalRecords: job.totalRecords,
      processedRecords: job.processedRecords,
      startTime: job.startTime,
      endTime: job.endTime,
      estimatedTimeRemaining: job.estimatedTimeRemaining,
      fileSize: job.fileSize,
      format: job.format,
      selectedFields: job.selectedFields,
      downloadReady: job.status === 'completed' && job.downloadUrl,
    })).sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());

    return NextResponse.json({
      success: true,
      jobs: allJobs,
      summary: {
        total: allJobs.length,
        pending: allJobs.filter(j => j.status === 'pending').length,
        processing: allJobs.filter(j => j.status === 'processing').length,
        completed: allJobs.filter(j => j.status === 'completed').length,
        failed: allJobs.filter(j => j.status === 'failed').length,
        totalRecordsExported: allJobs
          .filter(j => j.status === 'completed')
          .reduce((sum, j) => sum + j.totalRecords, 0),
      },
      availableFields: getAllAvailableFields(),
    });

  } catch (error) {
    console.error("Export jobs fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch export jobs" },
      { status: 500 }
    );
  }
}