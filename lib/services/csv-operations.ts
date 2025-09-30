/**
 * Advanced CSV Import/Export Operations
 * 
 * Based on Canvas Export project's sophisticated CSV handling
 */

import { parse } from 'csv-parse/sync';
import { stringify } from 'csv-stringify/sync';
import { readFile, writeFile } from 'fs/promises';
import { findDuplicates, isStrictDuplicate, isLooseDuplicate } from './duplicate-detection';
import { calculateQualityScore } from './quality-scoring';
import { logAuditEvent } from '@/lib/utils/audit';

interface CSVBusinessRow {
  name: string;
  phone?: string;
  email?: string;
  website?: string;
  address?: string;
  suburb: string;
  category: string;
  description?: string;
  abn?: string;
  latitude?: string;
  longitude?: string;
}

interface ImportResult {
  successful: number;
  duplicates: number;
  errors: number;
  details: {
    imported: any[];
    duplicates: any[];
    errors: any[];
  };
}

/**
 * Import businesses from CSV with advanced deduplication
 */
export async function importBusinessesFromCSV(
  filePath: string,
  prisma: any,
  options: {
    dryRun?: boolean;
    dedupeMode?: 'strict' | 'loose' | 'none';
    source?: string;
    userId?: string;
  } = {}
): Promise<ImportResult> {
  const { dryRun = false, dedupeMode = 'strict', source = 'CSV', userId } = options;
  
  const result: ImportResult = {
    successful: 0,
    duplicates: 0,
    errors: 0,
    details: {
      imported: [],
      duplicates: [],
      errors: []
    }
  };

  try {
    // Read and parse CSV file
    const fileContent = await readFile(filePath, 'utf-8');
    const records: CSVBusinessRow[] = parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true
    });

    console.log(`📊 Processing ${records.length} businesses from CSV`);

    for (let i = 0; i < records.length; i++) {
      const row = records[i];
      const rowNumber = i + 2; // +2 for header row and 0-based index

      try {
        // Validate required fields
        if (!row.name || !row.suburb || !row.category) {
          result.errors++;
          result.details.errors.push({
            row: rowNumber,
            data: row,
            error: 'Missing required fields: name, suburb, or category'
          });
          continue;
        }

        // Check for duplicates if enabled
        if (dedupeMode !== 'none') {
          const duplicates = await findDuplicates({
            name: row.name,
            phone: row.phone,
            website: row.website,
            suburb: row.suburb,
            email: row.email
          }, prisma, dedupeMode);

          if (duplicates.length > 0) {
            result.duplicates++;
            result.details.duplicates.push({
              row: rowNumber,
              data: row,
              existingBusiness: duplicates[0],
              confidence: dedupeMode === 'strict' ? 'high' : 'medium'
            });
            continue;
          }
        }

        // Prepare business data
        const businessData = {
          name: row.name,
          phone: row.phone || null,
          email: row.email || null,
          website: row.website || null,
          bio: row.description || null,
          suburb: row.suburb,
          category: row.category,
          abn: row.abn || null,
          abnStatus: row.abn ? 'PENDING' : 'NOT_PROVIDED',
          approvalStatus: 'PENDING',
          source: source as any,
          latitude: row.latitude ? parseFloat(row.latitude) : null,
          longitude: row.longitude ? parseFloat(row.longitude) : null,
          qualityScore: 0, // Will be calculated after creation
          ownerId: userId || null,
        };

        if (!dryRun) {
          // Generate unique slug
          const baseSlug = row.name
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim();
          
          let slug = baseSlug;
          let counter = 1;
          
          while (await prisma.business.findUnique({ where: { slug } })) {
            slug = `${baseSlug}-${counter}`;
            counter++;
          }

          // Create business
          const business = await prisma.business.create({
            data: {
              ...businessData,
              slug
            }
          });

          // Calculate and update quality score
          const qualityScore = calculateQualityScore({
            name: business.name,
            description: business.bio,
            phone: business.phone,
            email: business.email,
            website: business.website,
            latitude: business.latitude,
            longitude: business.longitude,
            abnStatus: business.abnStatus,
            createdAt: business.createdAt,
            updatedAt: business.updatedAt
          });

          await prisma.business.update({
            where: { id: business.id },
            data: { qualityScore }
          });

          result.details.imported.push({
            row: rowNumber,
            businessId: business.id,
            data: row,
            qualityScore
          });
        } else {
          // Dry run - just record what would be imported
          result.details.imported.push({
            row: rowNumber,
            data: row,
            action: 'WOULD_IMPORT'
          });
        }

        result.successful++;

      } catch (error) {
        result.errors++;
        result.details.errors.push({
          row: rowNumber,
          data: row,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
        console.error(`Error processing row ${rowNumber}:`, error);
      }
    }

    // Log audit event if not dry run
    if (!dryRun && result.successful > 0) {
      await logAuditEvent({
        action: 'IMPORT_CSV',
        target: filePath,
        meta: {
          recordsProcessed: records.length,
          successful: result.successful,
          duplicates: result.duplicates,
          errors: result.errors,
          dedupeMode,
          source,
          actorId: userId || 'SYSTEM'
        },
        ipAddress: 'system',
        userAgent: 'csv-import-service'
      });
    }

    return result;

  } catch (error) {
    console.error('CSV import failed:', error);
    throw new Error(`Failed to import CSV: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Export businesses to CSV with filtering
 */
export async function exportBusinessesToCSV(
  outputPath: string,
  prisma: any,
  options: {
    status?: string;
    abnStatus?: string;
    suburb?: string;
    category?: string;
    limit?: number;
    userId?: string;
  } = {}
): Promise<number> {
  const { status, abnStatus, suburb, category, limit, userId } = options;

  // Build where clause
  const where: any = {};
  
  if (status) {
    where.approvalStatus = status;
  }
  
  if (abnStatus) {
    where.abnStatus = abnStatus;
  }
  
  if (suburb) {
    where.suburb = { contains: suburb, mode: 'insensitive' };
  }
  
  if (category) {
    where.category = { contains: category, mode: 'insensitive' };
  }

  // Fetch businesses
  const businesses = await prisma.business.findMany({
    where,
    take: limit,
    orderBy: [
      { qualityScore: 'desc' },
      { createdAt: 'desc' }
    ]
  });

  // Convert to CSV format
  const csvData = businesses.map((b: any) => ({
    id: b.id,
    name: b.name,
    phone: b.phone || '',
    email: b.email || '',
    website: b.website || '',
    address: b.address || '',
    suburb: b.suburb,
    category: b.category,
    description: b.bio || '',
    abn: b.abn || '',
    abnStatus: b.abnStatus,
    approvalStatus: b.approvalStatus,
    source: b.source,
    qualityScore: b.qualityScore,
    latitude: b.latitude || '',
    longitude: b.longitude || '',
    createdAt: b.createdAt,
    updatedAt: b.updatedAt
  }));

  // Generate CSV content
  const csvContent = stringify(csvData, {
    header: true,
    columns: {
      id: 'ID',
      name: 'Name',
      phone: 'Phone',
      email: 'Email',
      website: 'Website',
      address: 'Address',
      suburb: 'Suburb',
      category: 'Category',
      description: 'Description',
      abn: 'ABN',
      abnStatus: 'ABN Status',
      approvalStatus: 'Approval Status',
      source: 'Source',
      qualityScore: 'Quality Score',
      latitude: 'Latitude',
      longitude: 'Longitude',
      createdAt: 'Created At',
      updatedAt: 'Updated At'
    }
  });

  // Write to file
  await writeFile(outputPath, csvContent);

  // Log audit event
  await logAuditEvent({
    action: 'EXPORT_CSV',
    target: outputPath,
    meta: {
      recordCount: businesses.length,
      filters: options,
      actorId: userId || 'SYSTEM'
    },
    ipAddress: 'system',
    userAgent: 'csv-export-service'
  });

  return businesses.length;
}

/**
 * Validate CSV file structure before import
 */
export async function validateCSVStructure(filePath: string): Promise<{
  isValid: boolean;
  errors: string[];
  preview: any[];
  totalRows: number;
}> {
  try {
    const fileContent = await readFile(filePath, 'utf-8');
    const records: any[] = parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true
    });

    const errors: string[] = [];
    const requiredFields = ['name', 'suburb', 'category'];
    
    if (records.length === 0) {
      errors.push('CSV file is empty or has no data rows');
      return {
        isValid: false,
        errors,
        preview: [],
        totalRows: 0
      };
    }

    // Check required columns
    const firstRow: any = records[0];
    const columns = Object.keys(firstRow);
    
    for (const field of requiredFields) {
      if (!columns.includes(field)) {
        errors.push(`Missing required column: ${field}`);
      }
    }

    // Validate first few rows
    for (let i = 0; i < Math.min(records.length, 5); i++) {
      const row: any = records[i];
      for (const field of requiredFields) {
        if (!row[field] || (typeof row[field] === 'string' && row[field].trim() === '')) {
          errors.push(`Row ${i + 2}: Missing value for required field '${field}'`);
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      preview: records.slice(0, 5),
      totalRows: records.length
    };

  } catch (error) {
    return {
      isValid: false,
      errors: [`Failed to parse CSV file: ${error instanceof Error ? error.message : 'Unknown error'}`],
      preview: [],
      totalRows: 0
    };
  }
}