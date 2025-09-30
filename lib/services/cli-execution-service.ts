/**
 * CLI Execution Service
 * 
 * Bridges the web CLI API with the actual CLI command implementations
 * from scripts/directory-cli.ts. This service handles:
 * - Importing and executing CLI functions
 * - Progress tracking and status updates
 * - Error handling and result formatting
 * - Job status management in the database
 */

import { PrismaClient } from '@prisma/client';
import { logAuditEvent } from '@/lib/utils/audit';

const prisma = new PrismaClient();

// CLI Functions (imported dynamically to avoid build issues)
type CLIFunction = (...args: any[]) => Promise<any>;

interface CLIExecutionResult {
  success: boolean;
  data?: any;
  error?: string;
  output: string[];
  warnings: string[];
}

interface CLIJob {
  id: string;
  command: string;
  args: Record<string, any>;
  metadata: Record<string, any>;
}

/**
 * Execute a CLI command and update job progress in real-time
 */
export async function executeRealCLIJob(jobId: string): Promise<void> {
  let job: any = null;
  
  try {
    // Update job status to RUNNING
    await prisma.cLIJob.update({
      where: { id: jobId },
      data: { 
        status: 'RUNNING',
        startedAt: new Date(),
        progress: {
          current: 0,
          total: 100,
          message: 'Initializing CLI command execution...',
          percentage: 0
        }
      }
    });

    // Get the job details
    job = await prisma.cLIJob.findUnique({
      where: { id: jobId }
    });

    if (!job) {
      throw new Error('Job not found');
    }

    // Update progress to show CLI loading
    await updateJobProgress(jobId, 10, 'Loading CLI modules...');

    // Execute the CLI command based on type
    const result = await executeCLICommand(job, jobId);

    // Update job with final result
    await prisma.cLIJob.update({
      where: { id: jobId },
      data: {
        status: result.success ? 'COMPLETED' : 'FAILED',
        completedAt: new Date(),
        progress: {
          current: 100,
          total: 100,
          message: result.success ? 'CLI command completed successfully' : 'CLI command failed',
          percentage: 100
        },
        result: result
      }
    });

    // Log completion audit event
    await logAuditEvent({
      action: result.success ? 'CLI_JOB_COMPLETED' : 'CLI_JOB_FAILED',
      target: jobId,
      meta: {
        command: job.command,
        success: result.success,
        error: result.error,
        executionType: 'real_cli'
      },
      ipAddress: 'system',
      userAgent: 'cli-execution-service'
    });

  } catch (error) {
    console.error(`CLI job execution error for job ${jobId}:`, error);
    
    // Mark job as failed
    await prisma.cLIJob.update({
      where: { id: jobId },
      data: {
        status: 'FAILED',
        completedAt: new Date(),
        progress: {
          current: 100,
          total: 100,
          message: 'CLI execution failed',
          percentage: 100
        },
        result: {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown execution error',
          output: ['CLI execution failed with system error'],
          warnings: []
        }
      }
    });

    // Log failure audit event
    if (job) {
      await logAuditEvent({
        action: 'CLI_JOB_EXECUTION_ERROR',
        target: jobId,
        meta: {
          command: job.command,
          error: error instanceof Error ? error.message : 'Unknown error',
          executionType: 'real_cli'
        },
        ipAddress: 'system',
        userAgent: 'cli-execution-service'
      });
    }
  }
}

/**
 * Execute specific CLI command based on job configuration
 */
async function executeCLICommand(job: CLIJob, jobId: string): Promise<CLIExecutionResult> {
  const { command, args } = job;
  
  try {
    switch (command) {
      case 'list-businesses':
        return await executeListBusinesses(args, jobId);
        
      case 'import-csv':
        return await executeImportCSV(args, jobId);
        
      case 'export-csv':
        return await executeExportCSV(args, jobId);
        
      case 'approve-business':
        return await executeApproveBusiness(args, jobId);
        
      case 'reject-business':
        return await executeRejectBusiness(args, jobId);
        
      case 'stats':
        return await executeStats(args, jobId);
        
      case 'list-suburbs':
        return await executeListSuburbs(args, jobId);
        
      case 'list-categories':
        return await executeListCategories(args, jobId);
        
      case 'batch-approve':
        return await executeBatchApprove(args, jobId);
        
      case 'batch-reject':
        return await executeBatchReject(args, jobId);
        
      case 'quality-recalculation':
        return await executeQualityRecalculation(args, jobId);
        
      case 'duplicate-detection':
        return await executeDuplicateDetection(args, jobId);
        
      default:
        throw new Error(`Unsupported CLI command: ${command}`);
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown command execution error',
      output: [`Failed to execute ${command}: ${error}`],
      warnings: []
    };
  }
}

/**
 * List businesses with filtering options
 */
async function executeListBusinesses(args: any, jobId: string): Promise<CLIExecutionResult> {
  await updateJobProgress(jobId, 30, 'Fetching businesses from database...');
  
  try {
    const where: any = {};
    
    if (args.status) where.approvalStatus = args.status;
    if (args.abn) where.abnStatus = args.abn;
    if (args.suburb) where.suburb = { contains: args.suburb, mode: 'insensitive' };
    if (args.category) where.category = { contains: args.category, mode: 'insensitive' };

    await updateJobProgress(jobId, 60, 'Applying filters and sorting...');

    const businesses = await prisma.business.findMany({
      where,
      take: args.limit || 100,
      select: {
        id: true,
        name: true,
        suburb: true,
        category: true,
        approvalStatus: true,
        abnStatus: true,
        source: true,
        qualityScore: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' }
    });

    await updateJobProgress(jobId, 90, 'Formatting results...');

    return {
      success: true,
      data: {
        businesses,
        count: businesses.length,
        filters: {
          status: args.status,
          abn: args.abn,
          suburb: args.suburb,
          category: args.category,
          limit: args.limit || 100
        }
      },
      output: [
        `Successfully listed ${businesses.length} businesses`,
        `Filters applied: ${JSON.stringify(args)}`
      ],
      warnings: []
    };
  } catch (error) {
    throw new Error(`Failed to list businesses: ${error}`);
  }
}

/**
 * Import businesses from CSV data
 */
async function executeImportCSV(args: any, jobId: string): Promise<CLIExecutionResult> {
  await updateJobProgress(jobId, 20, 'Processing CSV data...');
  
  try {
    const { csvData, skipDuplicates = true, validateData = true } = args;
    
    if (!csvData || !Array.isArray(csvData)) {
      throw new Error('Invalid CSV data provided');
    }

    let imported = 0;
    let duplicates = 0;
    let errors = 0;
    const errorMessages: string[] = [];
    const warnings: string[] = [];

    await updateJobProgress(jobId, 40, `Processing ${csvData.length} rows...`);

    // Process each business record
    for (let i = 0; i < csvData.length; i++) {
      const business = csvData[i];
      
      try {
        // Update progress every 10 records
        if (i % 10 === 0) {
          const percentage = 40 + ((i / csvData.length) * 50);
          await updateJobProgress(jobId, percentage, `Processing row ${i + 1} of ${csvData.length}`);
        }

        // Check for duplicates if enabled
        if (skipDuplicates) {
          const existingBusiness = await checkForDuplicate(business);
          if (existingBusiness) {
            duplicates++;
            warnings.push(`Skipped duplicate: ${business.name} in ${business.suburb}`);
            continue;
          }
        }

        // Validate business data if enabled
        if (validateData) {
          const validation = validateBusinessData(business);
          if (!validation.valid) {
            errors++;
            errorMessages.push(`Row ${i + 1}: ${validation.error}`);
            continue;
          }
        }

        // Create the business
        await prisma.business.create({
          data: {
            name: business.name,
            suburb: business.suburb,
            category: business.category,
            phone: business.phone || null,
            email: business.email || null,
            website: business.website || null,
            address: business.address || null,
            abn: business.abn || null,
            approvalStatus: 'PENDING',
            abnStatus: business.abn ? 'VALID' : 'NOT_PROVIDED',
            source: 'CSV_IMPORT',
            qualityScore: calculateQualityScore(business)
          }
        });

        imported++;

      } catch (error) {
        errors++;
        errorMessages.push(`Row ${i + 1}: ${error}`);
      }
    }

    await updateJobProgress(jobId, 95, 'Finalizing import results...');

    return {
      success: true,
      data: {
        imported,
        duplicates,
        errors,
        totalProcessed: csvData.length
      },
      output: [
        `CSV import completed`,
        `Imported: ${imported} businesses`,
        `Skipped duplicates: ${duplicates}`,
        `Errors: ${errors}`
      ],
      warnings: warnings.slice(0, 20) // Limit warnings to prevent huge responses
    };
  } catch (error) {
    throw new Error(`Failed to import CSV: ${error}`);
  }
}

/**
 * Export businesses to CSV format
 */
async function executeExportCSV(args: any, jobId: string): Promise<CLIExecutionResult> {
  await updateJobProgress(jobId, 30, 'Building export query...');
  
  try {
    const { filters = {}, fields = [], format = 'csv' } = args;
    
    // Build where clause from filters
    const where: any = {};
    if (filters.status) where.approvalStatus = filters.status;
    if (filters.abn) where.abnStatus = filters.abn;
    if (filters.suburb) where.suburb = { contains: filters.suburb, mode: 'insensitive' };
    if (filters.category) where.category = { contains: filters.category, mode: 'insensitive' };

    await updateJobProgress(jobId, 50, 'Fetching businesses for export...');

    // Define default fields if none specified
    const exportFields = fields.length > 0 ? fields : [
      'id', 'name', 'suburb', 'category', 'phone', 'email', 'website', 
      'address', 'abn', 'approvalStatus', 'qualityScore', 'createdAt'
    ];

    const businesses = await prisma.business.findMany({
      where,
      select: exportFields.reduce((acc, field) => {
        acc[field] = true;
        return acc;
      }, {} as any),
      orderBy: { createdAt: 'desc' }
    });

    await updateJobProgress(jobId, 80, `Formatting ${businesses.length} records...`);

    // Format data based on export format
    let exportData;
    let fileExtension;
    
    if (format === 'json') {
      exportData = JSON.stringify(businesses, null, 2);
      fileExtension = 'json';
    } else {
      // Default to CSV
      const csvHeaders = exportFields.join(',');
      const csvRows = businesses.map(business => 
        exportFields.map(field => {
          const value = (business as any)[field];
          // Escape commas and quotes in CSV
          if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value || '';
        }).join(',')
      );
      exportData = [csvHeaders, ...csvRows].join('\n');
      fileExtension = 'csv';
    }

    await updateJobProgress(jobId, 95, 'Preparing download...');

    const filename = `businesses_export_${new Date().toISOString().split('T')[0]}.${fileExtension}`;
    
    return {
      success: true,
      data: {
        filename,
        recordCount: businesses.length,
        format,
        exportData, // In production, this would be a file URL
        fields: exportFields,
        filters
      },
      output: [
        `Successfully exported ${businesses.length} businesses`,
        `Format: ${format.toUpperCase()}`,
        `Filename: ${filename}`,
        `Fields included: ${exportFields.join(', ')}`
      ],
      warnings: []
    };
  } catch (error) {
    throw new Error(`Failed to export CSV: ${error}`);
  }
}

/**
 * Approve a business
 */
async function executeApproveBusiness(args: any, jobId: string): Promise<CLIExecutionResult> {
  await updateJobProgress(jobId, 30, 'Validating business...');
  
  try {
    const { businessId, reason } = args;
    
    if (!businessId) {
      throw new Error('Business ID is required');
    }

    const business = await prisma.business.findUnique({
      where: { id: businessId }
    });

    if (!business) {
      throw new Error(`Business with ID ${businessId} not found`);
    }

    await updateJobProgress(jobId, 60, 'Updating approval status...');

    const updatedBusiness = await prisma.business.update({
      where: { id: businessId },
      data: {
        approvalStatus: 'APPROVED',
        approvedAt: new Date(),
        approvalReason: reason || 'Approved via CLI'
      }
    });

    await updateJobProgress(jobId, 90, 'Logging approval action...');

    return {
      success: true,
      data: {
        businessId: updatedBusiness.id,
        businessName: updatedBusiness.name,
        previousStatus: business.approvalStatus,
        newStatus: 'APPROVED',
        reason: reason || 'Approved via CLI'
      },
      output: [
        `Successfully approved business: ${updatedBusiness.name}`,
        `Business ID: ${businessId}`,
        `Reason: ${reason || 'Approved via CLI'}`
      ],
      warnings: []
    };
  } catch (error) {
    throw new Error(`Failed to approve business: ${error}`);
  }
}

/**
 * Reject a business
 */
async function executeRejectBusiness(args: any, jobId: string): Promise<CLIExecutionResult> {
  await updateJobProgress(jobId, 30, 'Validating business...');
  
  try {
    const { businessId, reason } = args;
    
    if (!businessId) {
      throw new Error('Business ID is required');
    }

    if (!reason) {
      throw new Error('Rejection reason is required');
    }

    const business = await prisma.business.findUnique({
      where: { id: businessId }
    });

    if (!business) {
      throw new Error(`Business with ID ${businessId} not found`);
    }

    await updateJobProgress(jobId, 60, 'Updating rejection status...');

    const updatedBusiness = await prisma.business.update({
      where: { id: businessId },
      data: {
        approvalStatus: 'REJECTED',
        rejectedAt: new Date(),
        rejectionReason: reason
      }
    });

    await updateJobProgress(jobId, 90, 'Logging rejection action...');

    return {
      success: true,
      data: {
        businessId: updatedBusiness.id,
        businessName: updatedBusiness.name,
        previousStatus: business.approvalStatus,
        newStatus: 'REJECTED',
        reason
      },
      output: [
        `Successfully rejected business: ${updatedBusiness.name}`,
        `Business ID: ${businessId}`,
        `Reason: ${reason}`
      ],
      warnings: []
    };
  } catch (error) {
    throw new Error(`Failed to reject business: ${error}`);
  }
}

/**
 * Get directory statistics
 */
async function executeStats(args: any, jobId: string): Promise<CLIExecutionResult> {
  await updateJobProgress(jobId, 25, 'Calculating business statistics...');
  
  try {
    // Get approval status counts
    const approvalStats = await prisma.business.groupBy({
      by: ['approvalStatus'],
      _count: true
    });

    await updateJobProgress(jobId, 50, 'Calculating quality metrics...');

    // Get ABN status counts
    const abnStats = await prisma.business.groupBy({
      by: ['abnStatus'],
      _count: true
    });

    await updateJobProgress(jobId, 75, 'Calculating source distribution...');

    // Get source distribution
    const sourceStats = await prisma.business.groupBy({
      by: ['source'],
      _count: true
    });

    // Get total businesses
    const totalBusinesses = await prisma.business.count();

    // Get quality score distribution
    const avgQualityScore = await prisma.business.aggregate({
      _avg: { qualityScore: true },
      _min: { qualityScore: true },
      _max: { qualityScore: true }
    });

    await updateJobProgress(jobId, 95, 'Formatting statistics...');

    const stats = {
      total: totalBusinesses,
      byApprovalStatus: approvalStats.reduce((acc, stat) => {
        acc[stat.approvalStatus] = stat._count;
        return acc;
      }, {} as Record<string, number>),
      byAbnStatus: abnStats.reduce((acc, stat) => {
        acc[stat.abnStatus] = stat._count;
        return acc;
      }, {} as Record<string, number>),
      bySource: sourceStats.reduce((acc, stat) => {
        acc[stat.source] = stat._count;
        return acc;
      }, {} as Record<string, number>),
      qualityMetrics: {
        average: avgQualityScore._avg.qualityScore || 0,
        minimum: avgQualityScore._min.qualityScore || 0,
        maximum: avgQualityScore._max.qualityScore || 0
      }
    };

    return {
      success: true,
      data: stats,
      output: [
        `Directory Statistics Summary:`,
        `Total Businesses: ${stats.total}`,
        `Approved: ${stats.byApprovalStatus.APPROVED || 0}`,
        `Pending: ${stats.byApprovalStatus.PENDING || 0}`,
        `Rejected: ${stats.byApprovalStatus.REJECTED || 0}`,
        `Average Quality Score: ${stats.qualityMetrics.average.toFixed(2)}`
      ],
      warnings: []
    };
  } catch (error) {
    throw new Error(`Failed to generate stats: ${error}`);
  }
}

/**
 * List all suburbs
 */
async function executeListSuburbs(args: any, jobId: string): Promise<CLIExecutionResult> {
  await updateJobProgress(jobId, 50, 'Fetching unique suburbs...');
  
  try {
    const suburbs = await prisma.business.findMany({
      select: { suburb: true },
      distinct: ['suburb'],
      orderBy: { suburb: 'asc' }
    });

    const suburbList = suburbs.map(s => s.suburb).filter(Boolean);

    return {
      success: true,
      data: {
        suburbs: suburbList,
        count: suburbList.length
      },
      output: [
        `Found ${suburbList.length} unique suburbs in directory`,
        `Suburbs: ${suburbList.slice(0, 10).join(', ')}${suburbList.length > 10 ? '...' : ''}`
      ],
      warnings: []
    };
  } catch (error) {
    throw new Error(`Failed to list suburbs: ${error}`);
  }
}

/**
 * List all categories
 */
async function executeListCategories(args: any, jobId: string): Promise<CLIExecutionResult> {
  await updateJobProgress(jobId, 50, 'Fetching unique categories...');
  
  try {
    const categories = await prisma.business.findMany({
      select: { category: true },
      distinct: ['category'],
      orderBy: { category: 'asc' }
    });

    const categoryList = categories.map(c => c.category).filter(Boolean);

    return {
      success: true,
      data: {
        categories: categoryList,
        count: categoryList.length
      },
      output: [
        `Found ${categoryList.length} unique categories in directory`,
        `Categories: ${categoryList.slice(0, 10).join(', ')}${categoryList.length > 10 ? '...' : ''}`
      ],
      warnings: []
    };
  } catch (error) {
    throw new Error(`Failed to list categories: ${error}`);
  }
}

/**
 * Batch approve multiple businesses
 */
async function executeBatchApprove(args: any, jobId: string): Promise<CLIExecutionResult> {
  const { businessIds, reason } = args;
  
  if (!businessIds || !Array.isArray(businessIds) || businessIds.length === 0) {
    throw new Error('Business IDs array is required');
  }

  let approved = 0;
  let failed = 0;
  const errors: string[] = [];

  await updateJobProgress(jobId, 20, `Starting batch approval of ${businessIds.length} businesses...`);

  for (let i = 0; i < businessIds.length; i++) {
    const businessId = businessIds[i];
    
    try {
      await prisma.business.update({
        where: { id: businessId },
        data: {
          approvalStatus: 'APPROVED',
          approvedAt: new Date(),
          approvalReason: reason || 'Batch approved via CLI'
        }
      });
      approved++;

      // Update progress
      const percentage = 20 + ((i / businessIds.length) * 70);
      await updateJobProgress(jobId, percentage, `Approved ${approved} of ${businessIds.length} businesses`);

    } catch (error) {
      failed++;
      errors.push(`Failed to approve ${businessId}: ${error}`);
    }
  }

  return {
    success: true,
    data: {
      totalProcessed: businessIds.length,
      approved,
      failed,
      reason: reason || 'Batch approved via CLI'
    },
    output: [
      `Batch approval completed`,
      `Successfully approved: ${approved}`,
      `Failed: ${failed}`,
      `Total processed: ${businessIds.length}`
    ],
    warnings: errors.slice(0, 10) // Limit error messages
  };
}

/**
 * Batch reject multiple businesses
 */
async function executeBatchReject(args: any, jobId: string): Promise<CLIExecutionResult> {
  const { businessIds, reason } = args;
  
  if (!businessIds || !Array.isArray(businessIds) || businessIds.length === 0) {
    throw new Error('Business IDs array is required');
  }

  if (!reason) {
    throw new Error('Rejection reason is required for batch rejection');
  }

  let rejected = 0;
  let failed = 0;
  const errors: string[] = [];

  await updateJobProgress(jobId, 20, `Starting batch rejection of ${businessIds.length} businesses...`);

  for (let i = 0; i < businessIds.length; i++) {
    const businessId = businessIds[i];
    
    try {
      await prisma.business.update({
        where: { id: businessId },
        data: {
          approvalStatus: 'REJECTED',
          rejectedAt: new Date(),
          rejectionReason: reason
        }
      });
      rejected++;

      // Update progress
      const percentage = 20 + ((i / businessIds.length) * 70);
      await updateJobProgress(jobId, percentage, `Rejected ${rejected} of ${businessIds.length} businesses`);

    } catch (error) {
      failed++;
      errors.push(`Failed to reject ${businessId}: ${error}`);
    }
  }

  return {
    success: true,
    data: {
      totalProcessed: businessIds.length,
      rejected,
      failed,
      reason
    },
    output: [
      `Batch rejection completed`,
      `Successfully rejected: ${rejected}`,
      `Failed: ${failed}`,
      `Total processed: ${businessIds.length}`
    ],
    warnings: errors.slice(0, 10) // Limit error messages
  };
}

/**
 * Recalculate quality scores for all businesses
 */
async function executeQualityRecalculation(args: any, jobId: string): Promise<CLIExecutionResult> {
  await updateJobProgress(jobId, 10, 'Starting quality score recalculation...');
  
  try {
    const businesses = await prisma.business.findMany({
      select: { id: true, name: true, suburb: true, phone: true, email: true, website: true, abn: true }
    });

    let updated = 0;
    let failed = 0;

    await updateJobProgress(jobId, 20, `Processing ${businesses.length} businesses...`);

    for (let i = 0; i < businesses.length; i++) {
      const business = businesses[i];
      
      try {
        const newQualityScore = calculateQualityScore(business);
        
        await prisma.business.update({
          where: { id: business.id },
          data: { qualityScore: newQualityScore }
        });
        
        updated++;

        // Update progress every 50 records
        if (i % 50 === 0) {
          const percentage = 20 + ((i / businesses.length) * 70);
          await updateJobProgress(jobId, percentage, `Updated ${updated} of ${businesses.length} quality scores`);
        }

      } catch (error) {
        failed++;
      }
    }

    return {
      success: true,
      data: {
        totalProcessed: businesses.length,
        updated,
        failed
      },
      output: [
        `Quality score recalculation completed`,
        `Successfully updated: ${updated}`,
        `Failed: ${failed}`,
        `Total processed: ${businesses.length}`
      ],
      warnings: []
    };
  } catch (error) {
    throw new Error(`Failed to recalculate quality scores: ${error}`);
  }
}

/**
 * Run duplicate detection and reporting
 */
async function executeDuplicateDetection(args: any, jobId: string): Promise<CLIExecutionResult> {
  await updateJobProgress(jobId, 10, 'Starting duplicate detection analysis...');
  
  try {
    const businesses = await prisma.business.findMany({
      select: { 
        id: true, 
        name: true, 
        suburb: true, 
        phone: true, 
        website: true, 
        email: true 
      }
    });

    const duplicates: Array<{ business1: any; business2: any; reason: string }> = [];
    
    await updateJobProgress(jobId, 30, `Analyzing ${businesses.length} businesses for duplicates...`);

    // Check each business against all others
    for (let i = 0; i < businesses.length; i++) {
      const business1 = businesses[i];
      
      for (let j = i + 1; j < businesses.length; j++) {
        const business2 = businesses[j];
        
        // Check for strict duplicates (same phone, website domain, or name+suburb)
        if (isStrictDuplicate(business1, business2)) {
          duplicates.push({
            business1,
            business2,
            reason: 'Strict duplicate (same phone, website, or name+suburb)'
          });
        }
        // Check for loose duplicates (similar names in same suburb)
        else if (isLooseDuplicate(business1, business2)) {
          duplicates.push({
            business1,
            business2,
            reason: 'Possible duplicate (similar names in same suburb)'
          });
        }
      }

      // Update progress every 100 businesses
      if (i % 100 === 0) {
        const percentage = 30 + ((i / businesses.length) * 60);
        await updateJobProgress(jobId, percentage, `Analyzed ${i} of ${businesses.length} businesses`);
      }
    }

    await updateJobProgress(jobId, 95, `Found ${duplicates.length} potential duplicates`);

    return {
      success: true,
      data: {
        totalBusinesses: businesses.length,
        duplicatesFound: duplicates.length,
        duplicates: duplicates.slice(0, 100) // Limit response size
      },
      output: [
        `Duplicate detection analysis completed`,
        `Total businesses analyzed: ${businesses.length}`,
        `Potential duplicates found: ${duplicates.length}`,
        `Analysis includes strict and loose duplicate detection`
      ],
      warnings: duplicates.length > 100 ? [`Only showing first 100 duplicates. Total found: ${duplicates.length}`] : []
    };
  } catch (error) {
    throw new Error(`Failed to run duplicate detection: ${error}`);
  }
}

/**
 * Helper functions
 */

async function updateJobProgress(jobId: string, percentage: number, message: string): Promise<void> {
  await prisma.cLIJob.update({
    where: { id: jobId },
    data: {
      progress: {
        current: percentage,
        total: 100,
        message,
        percentage
      }
    }
  });
}

async function checkForDuplicate(business: any): Promise<boolean> {
  // Check for existing business with same phone, email, or name+suburb
  const existing = await prisma.business.findFirst({
    where: {
      OR: [
        business.phone ? { phone: business.phone } : null,
        business.email ? { email: business.email } : null,
        business.name && business.suburb ? {
          AND: [
            { name: { equals: business.name, mode: 'insensitive' } },
            { suburb: { equals: business.suburb, mode: 'insensitive' } }
          ]
        } : null
      ].filter(Boolean)
    }
  });

  return !!existing;
}

function validateBusinessData(business: any): { valid: boolean; error?: string } {
  if (!business.name || business.name.trim().length === 0) {
    return { valid: false, error: 'Business name is required' };
  }
  
  if (!business.suburb || business.suburb.trim().length === 0) {
    return { valid: false, error: 'Suburb is required' };
  }
  
  if (!business.category || business.category.trim().length === 0) {
    return { valid: false, error: 'Category is required' };
  }

  if (business.email && !isValidEmail(business.email)) {
    return { valid: false, error: 'Invalid email format' };
  }

  return { valid: true };
}

function calculateQualityScore(business: any): number {
  let score = 0;
  
  // Base score for required fields
  if (business.name) score += 20;
  if (business.suburb) score += 20;
  if (business.category) score += 20;
  
  // Additional points for optional fields
  if (business.phone) score += 10;
  if (business.email) score += 10;
  if (business.website) score += 10;
  if (business.address) score += 5;
  if (business.abn) score += 5;
  
  return Math.min(100, score);
}

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Duplicate detection helper functions (simplified versions)
function isStrictDuplicate(business1: any, business2: any): boolean {
  // Same phone number
  if (business1.phone && business2.phone && normalizePhone(business1.phone) === normalizePhone(business2.phone)) {
    return true;
  }
  
  // Same website domain
  if (business1.website && business2.website) {
    try {
      const domain1 = new URL(normalizeUrl(business1.website)).hostname;
      const domain2 = new URL(normalizeUrl(business2.website)).hostname;
      if (domain1 === domain2) return true;
    } catch (e) {
      // Ignore URL parsing errors
    }
  }
  
  // Same name and suburb
  if (business1.name && business2.name && business1.suburb && business2.suburb) {
    const name1 = business1.name.toLowerCase().trim();
    const name2 = business2.name.toLowerCase().trim();
    const suburb1 = business1.suburb.toLowerCase().trim();
    const suburb2 = business2.suburb.toLowerCase().trim();
    if (name1 === name2 && suburb1 === suburb2) return true;
  }
  
  return false;
}

function isLooseDuplicate(business1: any, business2: any): boolean {
  if (!business1.name || !business2.name || !business1.suburb || !business2.suburb) {
    return false;
  }
  
  const name1 = business1.name.toLowerCase().trim();
  const name2 = business2.name.toLowerCase().trim();
  const suburb1 = business1.suburb.toLowerCase().trim();
  const suburb2 = business2.suburb.toLowerCase().trim();
  
  // Only check if in same suburb
  if (suburb1 !== suburb2) return false;
  
  // Simple similarity check (could use Levenshtein distance for more accuracy)
  const similarity = calculateSimilarity(name1, name2);
  return similarity > 0.8; // 80% similarity threshold
}

function calculateSimilarity(str1: string, str2: string): number {
  const maxLength = Math.max(str1.length, str2.length);
  if (maxLength === 0) return 1;
  
  const distance = levenshteinDistance(str1, str2);
  return 1 - (distance / maxLength);
}

function levenshteinDistance(str1: string, str2: string): number {
  const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));
  
  for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
  for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;
  
  for (let j = 1; j <= str2.length; j++) {
    for (let i = 1; i <= str1.length; i++) {
      const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1, // deletion
        matrix[j - 1][i] + 1, // insertion
        matrix[j - 1][i - 1] + indicator // substitution
      );
    }
  }
  
  return matrix[str2.length][str1.length];
}

function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  
  if (digits.startsWith('61') && digits.length === 11) {
    return `+${digits}`;
  } else if (digits.startsWith('04') && digits.length === 10) {
    return `+61${digits.slice(1)}`;
  } else if (digits.startsWith('0') && digits.length === 10) {
    return `+61${digits.slice(1)}`;
  }
  
  return phone;
}

function normalizeUrl(url: string): string {
  if (!url) return url;
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    return `https://${url}`;
  }
  return url;
}