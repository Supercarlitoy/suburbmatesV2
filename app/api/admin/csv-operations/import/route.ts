import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser, isAdmin } from "@/server/auth/auth";
import { AdminBusinessService } from "@/lib/services/admin-business";
import { prisma } from "@/lib/database/prisma";
import { z } from "zod";
import { randomUUID } from "crypto";
import fs from "fs/promises";
import path from "path";
import { parse } from "csv-parse/sync";

interface CSVImportJob {
  jobId: string;
  filename: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  progress: number; // 0-100
  totalRows: number;
  processedRows: number;
  successCount: number;
  errorCount: number;
  duplicateCount: number;
  startTime: string;
  endTime?: string;
  estimatedTimeRemaining?: number; // seconds
  errors: Array<{
    row: number;
    field?: string;
    message: string;
    data?: any;
  }>;
  warnings: Array<{
    row: number;
    field?: string;
    message: string;
    data?: any;
  }>;
  duplicates: Array<{
    row: number;
    reason: string;
    existingBusinessId?: string;
    data?: any;
  }>;
  preview?: {
    headers: string[];
    sampleRows: any[][];
    fieldMapping: Record<string, string>;
    recommendations: string[];
  };
}

interface CSVImportResult {
  jobId: string;
  status: string;
  message: string;
  preview?: {
    headers: string[];
    sampleRows: any[][];
    totalRows: number;
    fieldMapping: Record<string, string>;
    recommendations: string[];
    validationIssues: Array<{
      type: 'error' | 'warning';
      message: string;
      field?: string;
      count?: number;
    }>;
  };
  options?: {
    dryRun: boolean;
    dedupeMode: string;
    fieldMapping: Record<string, string>;
    skipValidation: boolean;
    batchSize: number;
  };
}

// Global job storage (in production, this should be Redis or database)
const jobs = new Map<string, CSVImportJob>();

const ImportRequestSchema = z.object({
  // File handling
  filename: z.string().min(1),
  fileContent: z.string().min(1), // Base64 encoded CSV content
  
  // Import options
  dryRun: z.boolean().optional().default(true),
  previewOnly: z.boolean().optional().default(false),
  
  // Deduplication options
  dedupeMode: z.enum(['strict', 'loose', 'none']).optional().default('loose'),
  dedupeScope: z.enum(['global', 'import_only']).optional().default('global'),
  
  // Field mapping
  fieldMapping: z.record(z.string()).optional().default({}),
  skipUnmappedFields: z.boolean().optional().default(false),
  
  // Validation options
  skipValidation: z.boolean().optional().default(false),
  allowPartialData: z.boolean().optional().default(true),
  
  // Processing options
  batchSize: z.number().min(1).max(1000).optional().default(100),
  maxErrors: z.number().min(1).max(1000).optional().default(100),
  
  // Notification options
  notifyOnCompletion: z.boolean().optional().default(false),
  webhookUrl: z.string().url().optional(),
});

/**
 * POST /api/admin/csv-operations/import
 * Import businesses from CSV file with validation, deduplication, and progress tracking
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
    const validationResult = ImportRequestSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: "Invalid import request",
          details: validationResult.error.issues
        },
        { status: 400 }
      );
    }

    const importData = validationResult.data;

    // Decode CSV content
    let csvContent: string;
    try {
      csvContent = Buffer.from(importData.fileContent, 'base64').toString('utf-8');
    } catch (error) {
      return NextResponse.json(
        { error: "Invalid file content encoding" },
        { status: 400 }
      );
    }

    // Parse CSV content
    let csvData: any[][];
    try {
      csvData = parse(csvContent, {
        skip_empty_lines: true,
        trim: true,
        relaxColumnCount: true,
      });
    } catch (error) {
      return NextResponse.json(
        { 
          error: "Failed to parse CSV file",
          message: error instanceof Error ? error.message : 'Invalid CSV format'
        },
        { status: 400 }
      );
    }

    if (csvData.length === 0) {
      return NextResponse.json(
        { error: "CSV file is empty" },
        { status: 400 }
      );
    }

    const headers = csvData[0];
    const dataRows = csvData.slice(1);

    // Create import job
    const jobId = randomUUID();
    const importJob: CSVImportJob = {
      jobId,
      filename: importData.filename,
      status: 'pending',
      progress: 0,
      totalRows: dataRows.length,
      processedRows: 0,
      successCount: 0,
      errorCount: 0,
      duplicateCount: 0,
      startTime: new Date().toISOString(),
      errors: [],
      warnings: [],
      duplicates: [],
    };

    // Generate preview and validation
    const preview = await generatePreview(
      headers,
      dataRows,
      importData.fieldMapping,
      importData
    );

    importJob.preview = preview;

    // Store job
    jobs.set(jobId, importJob);

    // If preview only, return preview data
    if (importData.previewOnly) {
      await adminService.logAdminAccess(
        'ADMIN_CSV_IMPORT_PREVIEW',
        null,
        user.id,
        {
          filename: importData.filename,
          jobId,
          totalRows: dataRows.length,
          previewHeaders: headers,
          validationIssues: preview.validationIssues.length,
          fieldMapping: importData.fieldMapping,
        },
        request.headers.get('x-forwarded-for') || 'unknown',
        request.headers.get('user-agent') || 'unknown'
      );

      const result: CSVImportResult = {
        jobId,
        status: 'preview_ready',
        message: `Preview generated for ${dataRows.length} rows`,
        preview,
        options: {
          dryRun: importData.dryRun,
          dedupeMode: importData.dedupeMode,
          fieldMapping: importData.fieldMapping,
          skipValidation: importData.skipValidation,
          batchSize: importData.batchSize,
        },
      };

      return NextResponse.json({
        success: true,
        result,
      });
    }

    // Start processing (async)
    processImportJob(jobId, importData, headers, dataRows, user.id, adminService)
      .catch(error => {
        console.error('Import job processing error:', error);
        const job = jobs.get(jobId);
        if (job) {
          job.status = 'failed';
          job.errors.push({
            row: -1,
            message: error instanceof Error ? error.message : 'Unknown processing error'
          });
          job.endTime = new Date().toISOString();
          jobs.set(jobId, job);
        }
      });

    // Log import initiation
    await adminService.logAdminAccess(
      'ADMIN_CSV_IMPORT_INITIATED',
      null,
      user.id,
      {
        filename: importData.filename,
        jobId,
        totalRows: dataRows.length,
        dryRun: importData.dryRun,
        dedupeMode: importData.dedupeMode,
        batchSize: importData.batchSize,
        fieldMapping: importData.fieldMapping,
      },
      request.headers.get('x-forwarded-for') || 'unknown',
      request.headers.get('user-agent') || 'unknown'
    );

    const result: CSVImportResult = {
      jobId,
      status: 'processing',
      message: `Import job started for ${dataRows.length} rows`,
      preview: importData.dryRun ? preview : undefined,
      options: {
        dryRun: importData.dryRun,
        dedupeMode: importData.dedupeMode,
        fieldMapping: importData.fieldMapping,
        skipValidation: importData.skipValidation,
        batchSize: importData.batchSize,
      },
    };

    return NextResponse.json({
      success: true,
      result,
    });

  } catch (error) {
    console.error("CSV import error:", error);

    // Log error for audit
    try {
      const user = await getCurrentUser();
      const adminService = new AdminBusinessService(prisma);
      await adminService.logAdminAccess(
        'ADMIN_CSV_IMPORT_ERROR',
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
      { error: "Failed to process CSV import", message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * Generate preview and validation for CSV data
 */
async function generatePreview(
  headers: string[],
  dataRows: any[][],
  fieldMapping: Record<string, string>,
  importData: any
) {
  // Standard business fields for mapping
  const standardFields = [
    'name', 'email', 'phone', 'website', 'address', 'suburb', 'postcode',
    'category', 'bio', 'abn', 'abnStatus', 'source'
  ];

  // Generate automatic field mapping recommendations
  const autoFieldMapping: Record<string, string> = {};
  const recommendations: string[] = [];
  
  headers.forEach(header => {
    const normalizedHeader = header.toLowerCase().trim();
    
    // Direct matches
    if (standardFields.includes(normalizedHeader)) {
      autoFieldMapping[header] = normalizedHeader;
      return;
    }
    
    // Fuzzy matching
    const fuzzyMatches: Record<string, string[]> = {
      'name': ['business_name', 'company', 'title', 'business name', 'company name'],
      'email': ['email_address', 'e-mail', 'business_email', 'contact_email'],
      'phone': ['telephone', 'mobile', 'contact_number', 'phone_number'],
      'website': ['url', 'web', 'homepage', 'site'],
      'address': ['street', 'location', 'street_address'],
      'suburb': ['city', 'town', 'locality'],
      'category': ['type', 'industry', 'sector', 'business_type'],
      'abn': ['abn_number', 'australian_business_number'],
    };
    
    Object.entries(fuzzyMatches).forEach(([field, variations]) => {
      if (variations.some(variant => normalizedHeader.includes(variant) || variant.includes(normalizedHeader))) {
        autoFieldMapping[header] = field;
        recommendations.push(`Mapped "${header}" to "${field}" based on similarity`);
      }
    });
  });

  // Merge with provided mapping
  const finalMapping = { ...autoFieldMapping, ...fieldMapping };

  // Sample data (first 5 rows)
  const sampleRows = dataRows.slice(0, 5);

  // Validation issues
  const validationIssues: Array<{
    type: 'error' | 'warning';
    message: string;
    field?: string;
    count?: number;
  }> = [];

  // Check for required fields
  const requiredFields = ['name'];
  const mappedFields = Object.values(finalMapping);
  
  requiredFields.forEach(field => {
    if (!mappedFields.includes(field)) {
      validationIssues.push({
        type: 'error',
        message: `Required field "${field}" is not mapped`,
        field
      });
    }
  });

  // Check data quality in sample
  if (sampleRows.length > 0) {
    const nameColumnIndex = headers.findIndex(h => finalMapping[h] === 'name');
    if (nameColumnIndex >= 0) {
      const emptyNames = sampleRows.filter(row => !row[nameColumnIndex] || row[nameColumnIndex].trim() === '').length;
      if (emptyNames > 0) {
        validationIssues.push({
          type: 'warning',
          message: `${emptyNames} rows have empty business names in sample data`,
          field: 'name'
        });
      }
    }

    // Check email format in sample
    const emailColumnIndex = headers.findIndex(h => finalMapping[h] === 'email');
    if (emailColumnIndex >= 0) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const invalidEmails = sampleRows.filter(row => {
        const email = row[emailColumnIndex];
        return email && email.trim() !== '' && !emailRegex.test(email);
      }).length;
      
      if (invalidEmails > 0) {
        validationIssues.push({
          type: 'warning',
          message: `${invalidEmails} rows have invalid email formats in sample data`,
          field: 'email'
        });
      }
    }

    // Check phone format in sample
    const phoneColumnIndex = headers.findIndex(h => finalMapping[h] === 'phone');
    if (phoneColumnIndex >= 0) {
      const phoneRegex = /^(\+61|0)[2-9]\d{8}$/;
      const invalidPhones = sampleRows.filter(row => {
        const phone = row[phoneColumnIndex];
        return phone && phone.trim() !== '' && !phoneRegex.test(phone.replace(/\s/g, ''));
      }).length;
      
      if (invalidPhones > 0) {
        validationIssues.push({
          type: 'warning',
          message: `${invalidPhones} rows have invalid Australian phone formats in sample data`,
          field: 'phone'
        });
      }
    }
  }

  // Generate additional recommendations
  if (headers.length > 10) {
    recommendations.push(`Large CSV with ${headers.length} columns - consider mapping only essential fields`);
  }

  if (dataRows.length > 1000) {
    recommendations.push(`Large dataset with ${dataRows.length} rows - consider using batch processing`);
  }

  if (!mappedFields.includes('email') && !mappedFields.includes('phone')) {
    recommendations.push('No contact information mapped - consider adding email or phone for better business profiles');
  }

  return {
    headers,
    sampleRows,
    totalRows: dataRows.length,
    fieldMapping: finalMapping,
    recommendations,
    validationIssues,
  };
}

/**
 * Process import job asynchronously
 */
async function processImportJob(
  jobId: string,
  importData: any,
  headers: string[],
  dataRows: any[][],
  userId: string,
  adminService: AdminBusinessService
) {
  const job = jobs.get(jobId);
  if (!job) return;

  job.status = 'processing';
  jobs.set(jobId, job);

  const batchSize = importData.batchSize || 100;
  let processedCount = 0;

  try {
    // Process in batches
    for (let i = 0; i < dataRows.length; i += batchSize) {
      const batch = dataRows.slice(i, i + batchSize);
      
      // Process batch
      await processBatch(
        batch,
        headers,
        importData,
        jobId,
        i,
        adminService
      );

      processedCount += batch.length;
      
      // Update progress
      job.processedRows = processedCount;
      job.progress = Math.round((processedCount / dataRows.length) * 100);
      
      // Calculate ETA
      const elapsed = new Date().getTime() - new Date(job.startTime).getTime();
      const avgTimePerRow = elapsed / processedCount;
      const remainingRows = dataRows.length - processedCount;
      job.estimatedTimeRemaining = Math.round((remainingRows * avgTimePerRow) / 1000);
      
      jobs.set(jobId, job);

      // Check if cancelled
      if (job.status === 'cancelled') {
        return;
      }
    }

    // Job completed
    job.status = 'completed';
    job.progress = 100;
    job.endTime = new Date().toISOString();
    job.estimatedTimeRemaining = 0;
    jobs.set(jobId, job);

    // Log completion
    await adminService.logAdminAccess(
      'ADMIN_CSV_IMPORT_COMPLETED',
      null,
      userId,
      {
        jobId,
        filename: importData.filename,
        totalRows: dataRows.length,
        successCount: job.successCount,
        errorCount: job.errorCount,
        duplicateCount: job.duplicateCount,
        dryRun: importData.dryRun,
        processingTimeMs: new Date().getTime() - new Date(job.startTime).getTime(),
      }
    );

  } catch (error) {
    job.status = 'failed';
    job.endTime = new Date().toISOString();
    job.errors.push({
      row: -1,
      message: error instanceof Error ? error.message : 'Processing failed'
    });
    jobs.set(jobId, job);

    // Log failure
    await adminService.logAdminAccess(
      'ADMIN_CSV_IMPORT_FAILED',
      null,
      userId,
      {
        jobId,
        filename: importData.filename,
        error: error instanceof Error ? error.message : 'Unknown error',
        processedRows: processedCount,
      }
    );
  }
}

/**
 * Process a batch of CSV rows
 */
async function processBatch(
  batch: any[][],
  headers: string[],
  importData: any,
  jobId: string,
  batchStartIndex: number,
  adminService: AdminBusinessService
) {
  const job = jobs.get(jobId);
  if (!job) return;

  const fieldMapping = importData.fieldMapping || {};

  for (let i = 0; i < batch.length; i++) {
    const row = batch[i];
    const rowIndex = batchStartIndex + i + 1; // +1 for header row

    try {
      // Map row data to business fields
      const businessData: any = {};
      
      headers.forEach((header, index) => {
        const fieldName = fieldMapping[header];
        if (fieldName && row[index] !== undefined && row[index] !== '') {
          businessData[fieldName] = row[index].toString().trim();
        }
      });

      // Validate required fields
      if (!businessData.name || businessData.name === '') {
        job.errors.push({
          row: rowIndex,
          field: 'name',
          message: 'Business name is required',
          data: businessData
        });
        job.errorCount++;
        continue;
      }

      // Check for duplicates if enabled
      if (importData.dedupeMode !== 'none') {
        const isDuplicate = await checkForDuplicate(businessData, importData.dedupeMode);
        if (isDuplicate) {
          job.duplicates.push({
            row: rowIndex,
            reason: `Duplicate detected (${importData.dedupeMode} mode)`,
            existingBusinessId: isDuplicate.id,
            data: businessData
          });
          job.duplicateCount++;
          
          if (importData.dedupeScope === 'global') {
            continue; // Skip this row
          }
        }
      }

      // Validate data if not skipped
      if (!importData.skipValidation) {
        const validationErrors = validateBusinessData(businessData);
        if (validationErrors.length > 0) {
          validationErrors.forEach(error => {
            job.warnings.push({
              row: rowIndex,
              field: error.field,
              message: error.message,
              data: businessData
            });
          });
        }
      }

      // If not dry run, actually create the business
      if (!importData.dryRun) {
        await createBusinessFromImport(businessData, adminService);
      }

      job.successCount++;

    } catch (error) {
      job.errors.push({
        row: rowIndex,
        message: error instanceof Error ? error.message : 'Processing error',
        data: batch[i]
      });
      job.errorCount++;
    }

    // Stop if max errors reached
    if (job.errorCount >= importData.maxErrors) {
      job.status = 'failed';
      job.errors.push({
        row: -1,
        message: `Maximum error limit (${importData.maxErrors}) reached`
      });
      break;
    }
  }

  jobs.set(jobId, job);
}

/**
 * Check for duplicate business
 */
async function checkForDuplicate(businessData: any, dedupeMode: string) {
  const conditions: any[] = [];

  if (dedupeMode === 'strict') {
    // Exact matching on key fields
    if (businessData.phone) {
      conditions.push({ phone: businessData.phone });
    }
    if (businessData.email) {
      conditions.push({ email: businessData.email });
    }
    if (businessData.abn) {
      conditions.push({ abn: businessData.abn });
    }
  } else if (dedupeMode === 'loose') {
    // Fuzzy matching on name + suburb
    if (businessData.name && businessData.suburb) {
      conditions.push({
        name: { contains: businessData.name, mode: 'insensitive' },
        suburb: businessData.suburb
      });
    }
  }

  if (conditions.length === 0) return null;

  const existingBusiness = await prisma.business.findFirst({
    where: {
      OR: conditions
    },
    select: { id: true, name: true }
  });

  return existingBusiness;
}

/**
 * Validate business data
 */
function validateBusinessData(businessData: any) {
  const errors: Array<{ field: string; message: string }> = [];

  // Email validation
  if (businessData.email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(businessData.email)) {
      errors.push({ field: 'email', message: 'Invalid email format' });
    }
  }

  // Phone validation (Australian format)
  if (businessData.phone) {
    const phoneRegex = /^(\+61|0)[2-9]\d{8}$/;
    if (!phoneRegex.test(businessData.phone.replace(/\s/g, ''))) {
      errors.push({ field: 'phone', message: 'Invalid Australian phone format' });
    }
  }

  // ABN validation
  if (businessData.abn) {
    const abnRegex = /^\d{11}$/;
    if (!abnRegex.test(businessData.abn.replace(/\s/g, ''))) {
      errors.push({ field: 'abn', message: 'Invalid ABN format (should be 11 digits)' });
    }
  }

  // URL validation
  if (businessData.website) {
    try {
      new URL(businessData.website);
    } catch {
      errors.push({ field: 'website', message: 'Invalid website URL format' });
    }
  }

  return errors;
}

/**
 * Create business from import data
 */
async function createBusinessFromImport(businessData: any, adminService: AdminBusinessService) {
  // Set default values
  const businessRecord = {
    name: businessData.name,
    email: businessData.email || null,
    phone: businessData.phone || null,
    website: businessData.website || null,
    address: businessData.address || null,
    suburb: businessData.suburb || null,
    postcode: businessData.postcode || null,
    category: businessData.category || 'General',
    bio: businessData.bio || null,
    abn: businessData.abn || null,
    abnStatus: businessData.abnStatus || 'NOT_PROVIDED',
    source: 'CSV',
    approvalStatus: 'PENDING',
    qualityScore: 50, // Default score
    slug: generateBusinessSlug(businessData.name),
  };

  // Create business
  const business = await prisma.business.create({
    data: businessRecord
  });

  return business;
}

/**
 * Generate business slug
 */
function generateBusinessSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
    .substring(0, 100) + `-${Date.now()}`;
}

/**
 * GET /api/admin/csv-operations/import
 * Get list of import jobs
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

    // Get all jobs (in production, this should be from database)
    const allJobs = Array.from(jobs.values()).map(job => ({
      jobId: job.jobId,
      filename: job.filename,
      status: job.status,
      progress: job.progress,
      totalRows: job.totalRows,
      processedRows: job.processedRows,
      successCount: job.successCount,
      errorCount: job.errorCount,
      duplicateCount: job.duplicateCount,
      startTime: job.startTime,
      endTime: job.endTime,
      estimatedTimeRemaining: job.estimatedTimeRemaining,
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
      }
    });

  } catch (error) {
    console.error("Import jobs fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch import jobs" },
      { status: 500 }
    );
  }
}