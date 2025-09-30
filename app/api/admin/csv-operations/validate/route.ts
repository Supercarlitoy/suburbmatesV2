import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser, isAdmin } from "@/server/auth/auth";
import { AdminBusinessService } from "@/lib/services/admin-business";
import { prisma } from "@/lib/database/prisma";
import { z } from "zod";
import { parse } from "csv-parse/sync";

interface ValidationResult {
  isValid: boolean;
  summary: {
    totalRows: number;
    totalColumns: number;
    validRows: number;
    invalidRows: number;
    warningRows: number;
    emptyRows: number;
  };
  
  structure: {
    headers: string[];
    columnTypes: Record<string, 'text' | 'number' | 'email' | 'phone' | 'url' | 'date' | 'mixed'>;
    encoding: string;
    delimiter: string;
    hasHeaders: boolean;
  };

  fieldMapping: {
    detected: Record<string, string>; // CSV header -> standard field
    recommended: Record<string, string>;
    unmapped: string[];
    missing: string[];
    confidence: Record<string, number>; // 0-100 confidence in mapping
  };

  validation: {
    errors: Array<{
      row: number;
      column?: string;
      type: 'critical' | 'error' | 'warning';
      code: string;
      message: string;
      value?: any;
      suggestion?: string;
    }>;
    
    statistics: {
      duplicateRows: number;
      emptyValues: Record<string, number>;
      invalidFormats: Record<string, number>;
      outliers: Record<string, Array<{ row: number; value: any }>>;
    };

    dataQuality: {
      completeness: number; // 0-100
      consistency: number; // 0-100
      accuracy: number; // 0-100
      validity: number; // 0-100
      overall: number; // 0-100
    };
  };

  samples: {
    valid: any[][];
    invalid: any[][];
    headers: string[];
  };

  recommendations: Array<{
    type: 'structure' | 'mapping' | 'data' | 'processing';
    priority: 'high' | 'medium' | 'low';
    message: string;
    action?: string;
  }>;

  configuration: {
    suggestedImportSettings: {
      skipRows: number;
      dedupeMode: 'strict' | 'loose' | 'none';
      fieldMapping: Record<string, string>;
      validationRules: Record<string, any>;
      batchSize: number;
    };
    
    estimatedProcessingTime: {
      validationMinutes: number;
      importMinutes: number;
      totalMinutes: number;
    };
  };
}

const ValidateRequestSchema = z.object({
  // File content
  fileContent: z.string().min(1), // Base64 encoded CSV content
  filename: z.string().min(1),
  
  // Parsing options
  delimiter: z.enum([',', ';', '\t', '|']).optional(),
  encoding: z.enum(['utf8', 'latin1', 'ascii']).optional().default('utf8'),
  hasHeaders: z.boolean().optional().default(true),
  skipRows: z.number().min(0).max(10).optional().default(0),
  
  // Validation options
  maxSampleRows: z.number().min(5).max(100).optional().default(20),
  strictValidation: z.boolean().optional().default(false),
  validateDataTypes: z.boolean().optional().default(true),
  detectOutliers: z.boolean().optional().default(true),
  
  // Business-specific validation
  requireBusinessName: z.boolean().optional().default(true),
  requireContactInfo: z.boolean().optional().default(false),
  validateAustralianFormats: z.boolean().optional().default(true),
  
  // Field mapping hints
  customFieldMapping: z.record(z.string()).optional().default({}),
  ignoredColumns: z.array(z.string()).optional().default([]),
});

/**
 * GET /api/admin/csv-operations/validate
 * Validate CSV structure and content for business import
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
    
    // For GET, we expect validation configuration and rules
    return NextResponse.json({
      success: true,
      config: {
        supportedFormats: ['csv', 'tsv'],
        maxFileSize: '10MB',
        maxRows: 50000,
        supportedEncodings: ['utf8', 'latin1', 'ascii'],
        supportedDelimiters: [',', ';', '\t', '|'],
        
        standardFields: getStandardBusinessFields(),
        validationRules: getValidationRules(),
        
        recommendations: {
          optimalBatchSize: 1000,
          maxErrorThreshold: 5, // percentage
          recommendedPreviewRows: 20,
        }
      }
    });

  } catch (error) {
    console.error("CSV validation config error:", error);
    return NextResponse.json(
      { error: "Failed to fetch validation configuration" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/csv-operations/validate
 * Validate uploaded CSV content
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
    const validationResult = ValidateRequestSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: "Invalid validation request",
          details: validationResult.error.issues
        },
        { status: 400 }
      );
    }

    const validateData = validationResult.data;

    // Decode CSV content
    let csvContent: string;
    try {
      csvContent = Buffer.from(validateData.fileContent, 'base64').toString(validateData.encoding);
    } catch (error) {
      return NextResponse.json(
        { error: "Invalid file content encoding" },
        { status: 400 }
      );
    }

    // Perform comprehensive validation
    const validationResults = await performCSVValidation(csvContent, validateData);

    // Log validation
    await adminService.logAdminAccess(
      'ADMIN_CSV_VALIDATION',
      null,
      user.id,
      {
        filename: validateData.filename,
        totalRows: validationResults.summary.totalRows,
        isValid: validationResults.isValid,
        errorCount: validationResults.validation.errors.length,
        dataQualityScore: validationResults.validation.dataQuality.overall,
        recommendedMapping: validationResults.fieldMapping.recommended,
        processingEstimate: validationResults.configuration.estimatedProcessingTime,
      },
      request.headers.get('x-forwarded-for') || 'unknown',
      request.headers.get('user-agent') || 'unknown'
    );

    return NextResponse.json({
      success: true,
      result: validationResults,
    });

  } catch (error) {
    console.error("CSV validation error:", error);

    // Log error for audit
    try {
      const user = await getCurrentUser();
      const adminService = new AdminBusinessService(prisma);
      await adminService.logAdminAccess(
        'ADMIN_CSV_VALIDATION_ERROR',
        null,
        user?.id || null,
        {
          error: error instanceof Error ? error.message : 'Unknown error',
          requestBody: JSON.stringify(body).substring(0, 1000),
        },
        request.headers.get('x-forwarded-for') || 'unknown',
        request.headers.get('user-agent') || 'unknown'
      );
    } catch (auditError) {
      console.error('Failed to log audit event:', auditError);
    }

    return NextResponse.json(
      { error: "Failed to validate CSV", message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * Perform comprehensive CSV validation
 */
async function performCSVValidation(csvContent: string, options: any): Promise<ValidationResult> {
  
  // Detect CSV structure
  const structure = detectCSVStructure(csvContent, options);
  
  // Parse CSV data
  let csvData: any[][];
  try {
    csvData = parse(csvContent, {
      delimiter: structure.delimiter,
      skip_empty_lines: true,
      trim: true,
      relaxColumnCount: true,
      from_line: options.skipRows + 1,
    });
  } catch (error) {
    throw new Error(`Failed to parse CSV: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  if (csvData.length === 0) {
    throw new Error('CSV file is empty or contains no valid data');
  }

  // Extract headers and data
  const headers = structure.hasHeaders ? csvData[0] : generateDefaultHeaders(csvData[0].length);
  const dataRows = structure.hasHeaders ? csvData.slice(1) : csvData;
  
  // Perform field mapping
  const fieldMapping = performFieldMapping(headers, options.customFieldMapping);
  
  // Validate data
  const validation = await validateCSVData(headers, dataRows, options, fieldMapping);
  
  // Generate samples
  const samples = generateSamples(headers, dataRows, validation.errors, options.maxSampleRows);
  
  // Generate recommendations
  const recommendations = generateRecommendations(structure, fieldMapping, validation, options);
  
  // Generate configuration
  const configuration = generateConfiguration(structure, fieldMapping, validation, dataRows.length);
  
  // Calculate summary
  const summary = {
    totalRows: dataRows.length,
    totalColumns: headers.length,
    validRows: dataRows.length - validation.errors.filter(e => e.type === 'critical' || e.type === 'error').length,
    invalidRows: validation.errors.filter(e => e.type === 'critical' || e.type === 'error').length,
    warningRows: validation.errors.filter(e => e.type === 'warning').length,
    emptyRows: validation.statistics.duplicateRows, // Approximate
  };

  return {
    isValid: validation.dataQuality.overall >= 70 && summary.invalidRows === 0,
    summary,
    structure,
    fieldMapping,
    validation,
    samples,
    recommendations,
    configuration,
  };
}

/**
 * Detect CSV structure and format
 */
function detectCSVStructure(csvContent: string, options: any) {
  const lines = csvContent.split('\n').slice(0, 10); // Sample first 10 lines
  
  // Detect delimiter
  let delimiter = options.delimiter;
  if (!delimiter) {
    const delimiters = [',', ';', '\t', '|'];
    const counts = delimiters.map(d => ({
      delimiter: d,
      count: lines.join('').split(d).length
    }));
    delimiter = counts.sort((a, b) => b.count - a.count)[0].delimiter;
  }

  // Detect if first row contains headers
  let hasHeaders = options.hasHeaders;
  if (hasHeaders === undefined) {
    // Simple heuristic: if first row values are mostly text and second row has different patterns
    const firstRowValues = lines[0]?.split(delimiter) || [];
    const secondRowValues = lines[1]?.split(delimiter) || [];
    
    hasHeaders = firstRowValues.some(val => 
      val && isNaN(Number(val)) && val.length > 2 && 
      !val.match(/^\d+$/) && !val.includes('@')
    );
  }

  // Detect column types from sample data
  const sampleRows = lines.slice(hasHeaders ? 1 : 0, 5);
  const columnTypes: Record<string, string> = {};
  
  if (sampleRows.length > 0) {
    const headers = (hasHeaders ? lines[0] : generateDefaultHeaders(sampleRows[0].split(delimiter).length)).split(delimiter);
    
    headers.forEach((header, index) => {
      const values = sampleRows.map(row => row.split(delimiter)[index]).filter(Boolean);
      columnTypes[header] = detectColumnType(values);
    });
  }

  return {
    headers: hasHeaders && lines[0] ? lines[0].split(delimiter) : [],
    columnTypes,
    encoding: options.encoding || 'utf8',
    delimiter,
    hasHeaders,
  };
}

/**
 * Generate default headers for CSV without headers
 */
function generateDefaultHeaders(columnCount: number): string[] {
  return Array.from({ length: columnCount }, (_, i) => `Column_${i + 1}`);
}

/**
 * Detect column data type from sample values
 */
function detectColumnType(values: string[]): string {
  if (values.length === 0) return 'text';
  
  const patterns = {
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    phone: /^[\+]?[\d\s\-\(\)]{8,15}$/,
    url: /^https?:\/\/.+/,
    number: /^\d+\.?\d*$/,
    date: /^\d{1,2}\/\d{1,2}\/\d{2,4}$|^\d{4}-\d{1,2}-\d{1,2}$/,
  };

  const typeCounts: Record<string, number> = {};
  
  values.forEach(value => {
    Object.entries(patterns).forEach(([type, pattern]) => {
      if (pattern.test(value)) {
        typeCounts[type] = (typeCounts[type] || 0) + 1;
      }
    });
  });

  // Return type with highest match percentage
  const totalValues = values.length;
  const bestType = Object.entries(typeCounts)
    .map(([type, count]) => ({ type, percentage: count / totalValues }))
    .filter(({ percentage }) => percentage >= 0.5)
    .sort((a, b) => b.percentage - a.percentage)[0];

  return bestType?.type || 'text';
}

/**
 * Perform automatic field mapping
 */
function performFieldMapping(headers: string[], customMapping: Record<string, string>) {
  const standardFields = getStandardBusinessFields();
  const detected: Record<string, string> = {};
  const recommended: Record<string, string> = {};
  const confidence: Record<string, number> = {};

  // Apply custom mapping first
  Object.entries(customMapping).forEach(([header, field]) => {
    if (headers.includes(header) && standardFields.includes(field)) {
      detected[header] = field;
      recommended[header] = field;
      confidence[header] = 100;
    }
  });

  // Auto-detect mapping for unmapped headers
  headers.forEach(header => {
    if (detected[header]) return; // Already mapped

    const normalizedHeader = header.toLowerCase().trim();
    
    // Direct matches
    const directMatch = standardFields.find(field => 
      normalizedHeader === field.toLowerCase() || 
      normalizedHeader.includes(field.toLowerCase())
    );
    
    if (directMatch) {
      detected[header] = directMatch;
      recommended[header] = directMatch;
      confidence[header] = 90;
      return;
    }

    // Fuzzy matching
    const fuzzyMatches: Record<string, { patterns: string[]; confidence: number }> = {
      'name': { patterns: ['business_name', 'company', 'title', 'business name', 'company name'], confidence: 85 },
      'email': { patterns: ['email_address', 'e-mail', 'business_email', 'contact_email'], confidence: 90 },
      'phone': { patterns: ['telephone', 'mobile', 'contact_number', 'phone_number'], confidence: 85 },
      'website': { patterns: ['url', 'web', 'homepage', 'site'], confidence: 80 },
      'address': { patterns: ['street', 'location', 'street_address'], confidence: 80 },
      'suburb': { patterns: ['city', 'town', 'locality'], confidence: 85 },
      'category': { patterns: ['type', 'industry', 'sector', 'business_type'], confidence: 75 },
      'abn': { patterns: ['abn_number', 'australian_business_number'], confidence: 95 },
    };

    Object.entries(fuzzyMatches).forEach(([field, { patterns, confidence: confLevel }]) => {
      if (patterns.some(pattern => 
        normalizedHeader.includes(pattern) || 
        pattern.includes(normalizedHeader)
      )) {
        detected[header] = field;
        recommended[header] = field;
        confidence[header] = confLevel;
      }
    });
  });

  const unmapped = headers.filter(h => !detected[h]);
  const missing = standardFields.filter(f => 
    !Object.values(detected).includes(f) && 
    ['name', 'email', 'phone'].includes(f) // Only flag important missing fields
  );

  return {
    detected,
    recommended,
    unmapped,
    missing,
    confidence,
  };
}

/**
 * Validate CSV data content
 */
async function validateCSVData(headers: string[], dataRows: any[][], options: any, fieldMapping: any) {
  const errors: any[] = [];
  const statistics = {
    duplicateRows: 0,
    emptyValues: {} as Record<string, number>,
    invalidFormats: {} as Record<string, number>,
    outliers: {} as Record<string, Array<{ row: number; value: any }>>,
  };

  // Track seen rows for duplicate detection
  const seenRows = new Set<string>();
  
  // Validate each row
  dataRows.forEach((row, rowIndex) => {
    const actualRowNumber = rowIndex + 2; // +1 for 0-based, +1 for header

    // Check for duplicate rows
    const rowString = row.join('|');
    if (seenRows.has(rowString)) {
      statistics.duplicateRows++;
      errors.push({
        row: actualRowNumber,
        type: 'warning',
        code: 'DUPLICATE_ROW',
        message: 'Duplicate row detected',
      });
    }
    seenRows.add(rowString);

    // Validate each column
    headers.forEach((header, colIndex) => {
      const value = row[colIndex];
      const mappedField = fieldMapping.detected[header];
      
      // Check for empty values
      if (!value || value.trim() === '') {
        statistics.emptyValues[header] = (statistics.emptyValues[header] || 0) + 1;
        
        // Critical error for required fields
        if (mappedField === 'name') {
          errors.push({
            row: actualRowNumber,
            column: header,
            type: 'critical',
            code: 'MISSING_REQUIRED_FIELD',
            message: 'Business name is required',
            suggestion: 'Provide a valid business name',
          });
        }
        return;
      }

      // Validate by mapped field type
      if (mappedField) {
        const validationError = validateFieldValue(mappedField, value, options);
        if (validationError) {
          statistics.invalidFormats[header] = (statistics.invalidFormats[header] || 0) + 1;
          errors.push({
            row: actualRowNumber,
            column: header,
            type: validationError.severity,
            code: validationError.code,
            message: validationError.message,
            value,
            suggestion: validationError.suggestion,
          });
        }
      }
    });
  });

  // Calculate data quality metrics
  const totalCells = dataRows.length * headers.length;
  const errorCells = errors.filter(e => e.type === 'error' || e.type === 'critical').length;
  const warningCells = errors.filter(e => e.type === 'warning').length;
  const emptyCells = Object.values(statistics.emptyValues).reduce((sum, count) => sum + count, 0);

  const completeness = Math.max(0, ((totalCells - emptyCells) / totalCells) * 100);
  const validity = Math.max(0, ((totalCells - errorCells) / totalCells) * 100);
  const consistency = Math.max(0, ((totalCells - warningCells) / totalCells) * 100);
  const accuracy = Math.max(0, ((totalCells - errorCells - warningCells) / totalCells) * 100);
  const overall = (completeness + validity + consistency + accuracy) / 4;

  return {
    errors,
    statistics,
    dataQuality: {
      completeness: Math.round(completeness),
      consistency: Math.round(consistency),
      accuracy: Math.round(accuracy),
      validity: Math.round(validity),
      overall: Math.round(overall),
    },
  };
}

/**
 * Validate individual field value
 */
function validateFieldValue(fieldType: string, value: string, options: any) {
  const trimmedValue = value.trim();
  
  switch (fieldType) {
    case 'email':
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(trimmedValue)) {
        return {
          severity: 'error' as const,
          code: 'INVALID_EMAIL_FORMAT',
          message: 'Invalid email format',
          suggestion: 'Use format: user@domain.com',
        };
      }
      
      // Check for suspicious domains
      const suspiciousDomains = ['10minutemail.com', 'tempmail.org', 'example.com'];
      const domain = trimmedValue.split('@')[1]?.toLowerCase();
      if (domain && suspiciousDomains.includes(domain)) {
        return {
          severity: 'warning' as const,
          code: 'SUSPICIOUS_EMAIL_DOMAIN',
          message: 'Suspicious or temporary email domain',
          suggestion: 'Use a permanent business email address',
        };
      }
      break;

    case 'phone':
      if (options.validateAustralianFormats) {
        const phoneRegex = /^(\+61|0)[2-9]\d{8}$/;
        if (!phoneRegex.test(trimmedValue.replace(/\s/g, ''))) {
          return {
            severity: 'warning' as const,
            code: 'INVALID_PHONE_FORMAT',
            message: 'Invalid Australian phone format',
            suggestion: 'Use format: +61 X XXXX XXXX or 0X XXXX XXXX',
          };
        }
      }
      break;

    case 'website':
      try {
        new URL(trimmedValue);
      } catch {
        return {
          severity: 'warning' as const,
          code: 'INVALID_URL_FORMAT',
          message: 'Invalid website URL',
          suggestion: 'Include http:// or https://',
        };
      }
      break;

    case 'abn':
      if (options.validateAustralianFormats) {
        const abnRegex = /^\d{11}$/;
        if (!abnRegex.test(trimmedValue.replace(/\s/g, ''))) {
          return {
            severity: 'warning' as const,
            code: 'INVALID_ABN_FORMAT',
            message: 'Invalid ABN format',
            suggestion: 'ABN should be 11 digits',
          };
        }
      }
      break;

    case 'name':
      if (trimmedValue.length < 2) {
        return {
          severity: 'error' as const,
          code: 'BUSINESS_NAME_TOO_SHORT',
          message: 'Business name too short',
          suggestion: 'Provide full business name (at least 2 characters)',
        };
      }
      
      // Check for placeholder text
      const placeholderPatterns = ['test', 'example', 'lorem ipsum', 'asdf', '123'];
      if (placeholderPatterns.some(pattern => trimmedValue.toLowerCase().includes(pattern))) {
        return {
          severity: 'warning' as const,
          code: 'PLACEHOLDER_BUSINESS_NAME',
          message: 'Business name appears to be placeholder text',
          suggestion: 'Use the actual business name',
        };
      }
      break;
  }

  return null;
}

/**
 * Generate data samples for preview
 */
function generateSamples(headers: string[], dataRows: any[][], errors: any[], maxRows: number) {
  // Get valid rows (no critical or error issues)
  const errorRows = new Set(errors.filter(e => e.type === 'critical' || e.type === 'error').map(e => e.row - 2));
  const validRows = dataRows.filter((_, index) => !errorRows.has(index)).slice(0, Math.floor(maxRows / 2));
  
  // Get invalid rows for demonstration
  const invalidRows = dataRows.filter((_, index) => errorRows.has(index)).slice(0, Math.floor(maxRows / 2));

  return {
    valid: validRows,
    invalid: invalidRows,
    headers,
  };
}

/**
 * Generate validation recommendations
 */
function generateRecommendations(structure: any, fieldMapping: any, validation: any, options: any) {
  const recommendations: any[] = [];

  // Structure recommendations
  if (!structure.hasHeaders) {
    recommendations.push({
      type: 'structure',
      priority: 'high',
      message: 'CSV appears to be missing headers',
      action: 'Add column headers or enable "first row as headers" option',
    });
  }

  if (structure.headers.length > 20) {
    recommendations.push({
      type: 'structure',
      priority: 'medium',
      message: `Large number of columns (${structure.headers.length}) detected`,
      action: 'Consider mapping only essential fields to improve performance',
    });
  }

  // Mapping recommendations
  if (fieldMapping.missing.length > 0) {
    recommendations.push({
      type: 'mapping',
      priority: 'high',
      message: `Missing required fields: ${fieldMapping.missing.join(', ')}`,
      action: 'Map these fields or ensure they exist in your CSV',
    });
  }

  if (fieldMapping.unmapped.length > 0) {
    recommendations.push({
      type: 'mapping',
      priority: 'medium',
      message: `${fieldMapping.unmapped.length} columns are unmapped`,
      action: 'Review unmapped columns and map important business data',
    });
  }

  // Data quality recommendations
  if (validation.dataQuality.overall < 70) {
    recommendations.push({
      type: 'data',
      priority: 'high',
      message: `Low data quality score (${validation.dataQuality.overall}%)`,
      action: 'Clean data before import to improve success rate',
    });
  }

  if (validation.dataQuality.completeness < 80) {
    recommendations.push({
      type: 'data',
      priority: 'medium',
      message: `Many empty values detected (${100 - validation.dataQuality.completeness}% incomplete)`,
      action: 'Fill in missing data where possible, especially for required fields',
    });
  }

  // Processing recommendations
  const criticalErrors = validation.errors.filter(e => e.type === 'critical').length;
  if (criticalErrors > 0) {
    recommendations.push({
      type: 'processing',
      priority: 'high',
      message: `${criticalErrors} critical errors must be fixed before import`,
      action: 'Resolve critical errors or rows will be skipped during import',
    });
  }

  const duplicateRows = validation.statistics.duplicateRows;
  if (duplicateRows > 0) {
    recommendations.push({
      type: 'processing',
      priority: 'medium',
      message: `${duplicateRows} duplicate rows detected`,
      action: 'Enable deduplication during import or clean data beforehand',
    });
  }

  return recommendations;
}

/**
 * Generate import configuration suggestions
 */
function generateConfiguration(structure: any, fieldMapping: any, validation: any, totalRows: number) {
  // Suggest deduplication mode
  let dedupeMode: 'strict' | 'loose' | 'none' = 'none';
  if (validation.statistics.duplicateRows > 0) {
    dedupeMode = validation.statistics.duplicateRows > totalRows * 0.1 ? 'strict' : 'loose';
  }

  // Suggest batch size based on data size and complexity
  let batchSize = 100;
  if (totalRows > 10000) batchSize = 500;
  if (totalRows > 50000) batchSize = 1000;
  if (structure.headers.length > 20) batchSize = Math.max(50, batchSize / 2);

  // Estimate processing time
  const complexityFactor = structure.headers.length * 0.1 + validation.errors.length * 0.01;
  const baseTimePerRow = 0.01 + complexityFactor; // seconds per row
  
  const validationMinutes = Math.ceil((totalRows * baseTimePerRow) / 60);
  const importMinutes = Math.ceil((totalRows * baseTimePerRow * 2) / 60); // Import takes longer
  const totalMinutes = validationMinutes + importMinutes;

  return {
    suggestedImportSettings: {
      skipRows: 0,
      dedupeMode,
      fieldMapping: fieldMapping.recommended,
      validationRules: getValidationRules(),
      batchSize,
    },
    
    estimatedProcessingTime: {
      validationMinutes,
      importMinutes,
      totalMinutes,
    },
  };
}

/**
 * Get standard business fields
 */
function getStandardBusinessFields(): string[] {
  return [
    'name', 'email', 'phone', 'website', 'address', 'suburb', 'postcode',
    'category', 'bio', 'abn', 'abnStatus', 'source'
  ];
}

/**
 * Get validation rules configuration
 */
function getValidationRules() {
  return {
    required: ['name'],
    optional: ['email', 'phone', 'website', 'address', 'suburb', 'category', 'bio', 'abn'],
    formats: {
      email: '^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$',
      phone: '^(\\+61|0)[2-9]\\d{8}$',
      abn: '^\\d{11}$',
      website: '^https?://.+',
    },
    lengths: {
      name: { min: 2, max: 200 },
      bio: { min: 0, max: 1000 },
      address: { min: 0, max: 500 },
    },
    enums: {
      abnStatus: ['VERIFIED', 'PENDING', 'INVALID', 'EXPIRED', 'NOT_PROVIDED'],
      source: ['MANUAL', 'CSV', 'AUTO_ENRICH', 'CLAIMED'],
    },
  };
}