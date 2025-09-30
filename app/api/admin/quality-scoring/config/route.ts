import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser, isAdmin } from "@/server/auth/auth";
import { AdminBusinessService } from "@/lib/services/admin-business";
import { prisma } from "@/lib/database/prisma";
import { z } from "zod";

/**
 * Quality scoring configuration schema
 */
const QualityScoringConfigSchema = z.object({
  weights: z.object({
    completeness: z.object({
      businessName: z.number().min(0).max(50).default(10),
      description: z.number().min(0).max(50).default(15),
      phone: z.number().min(0).max(50).default(10),
      email: z.number().min(0).max(50).default(10),
      website: z.number().min(0).max(50).default(10),
      address: z.number().min(0).max(50).default(5),
    }).optional(),
    verification: z.object({
      abnVerification: z.number().min(0).max(50).default(15),
      locationVerification: z.number().min(0).max(50).default(5),
    }).optional(),
    recency: z.object({
      profileFreshness: z.number().min(0).max(50).default(10),
    }).optional(),
    contentRichness: z.object({
      businessImages: z.number().min(0).max(50).default(5),
      businessHours: z.number().min(0).max(50).default(3),
      customerReviews: z.number().min(0).max(50).default(2),
    }).optional(),
  }).optional(),
  thresholds: z.object({
    highQuality: z.number().min(50).max(100).default(80),
    mediumQuality: z.number().min(25).max(75).default(50),
    recencyDays: z.object({
      fresh: z.number().min(1).max(90).default(30),
      stale: z.number().min(31).max(365).default(90),
    }).optional(),
    descriptionMinLength: z.number().min(10).max(200).default(50),
  }).optional(),
  features: z.object({
    enableAutomaticScoring: z.boolean().default(true),
    enableCompetitorComparison: z.boolean().default(true),
    enableManualBoosts: z.boolean().default(true),
    maxManualBoost: z.number().min(0).max(50).default(20),
  }).optional(),
});

type QualityScoringConfig = z.infer<typeof QualityScoringConfigSchema>;

/**
 * Default quality scoring configuration
 */
const DEFAULT_CONFIG: Required<QualityScoringConfig> = {
  weights: {
    completeness: {
      businessName: 10,
      description: 15,
      phone: 10,
      email: 10,
      website: 10,
      address: 5,
    },
    verification: {
      abnVerification: 15,
      locationVerification: 5,
    },
    recency: {
      profileFreshness: 10,
    },
    contentRichness: {
      businessImages: 5,
      businessHours: 3,
      customerReviews: 2,
    },
  },
  thresholds: {
    highQuality: 80,
    mediumQuality: 50,
    recencyDays: {
      fresh: 30,
      stale: 90,
    },
    descriptionMinLength: 50,
  },
  features: {
    enableAutomaticScoring: true,
    enableCompetitorComparison: true,
    enableManualBoosts: true,
    maxManualBoost: 20,
  },
};

/**
 * GET /api/admin/quality-scoring/config
 * Get current quality scoring configuration
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

    const adminService = new AdminBusinessService(prisma);

    // Try to get config from database, fall back to default
    let config: QualityScoringConfig;
    
    try {
      const configRecord = await prisma.featureFlag.findUnique({
        where: { key: 'quality-scoring-config' },
      });

      if (configRecord?.value && typeof configRecord.value === 'object') {
        config = { ...DEFAULT_CONFIG, ...configRecord.value as QualityScoringConfig };
      } else {
        config = DEFAULT_CONFIG;
      }
    } catch (error) {
      console.warn('Failed to load config from database, using defaults:', error);
      config = DEFAULT_CONFIG;
    }

    // Calculate total possible score for validation
    const totalPossibleScore = Object.values(config.weights.completeness || {}).reduce((a, b) => a + b, 0) +
      Object.values(config.weights.verification || {}).reduce((a, b) => a + b, 0) +
      Object.values(config.weights.recency || {}).reduce((a, b) => a + b, 0) +
      Object.values(config.weights.contentRichness || {}).reduce((a, b) => a + b, 0);

    // Log config access
    await adminService.logAdminAccess(
      'ADMIN_QUALITY_SCORING_CONFIG_ACCESS',
      null,
      user.id,
      {
        configSource: configRecord ? 'database' : 'default',
        totalPossibleScore,
        features: config.features,
      },
      request.headers.get('x-forwarded-for') || 'unknown',
      request.headers.get('user-agent') || 'unknown'
    );

    return NextResponse.json({
      success: true,
      config,
      metadata: {
        totalPossibleScore,
        isDefault: !configRecord,
        lastUpdated: configRecord?.updatedAt,
      },
    });

  } catch (error) {
    console.error("Quality scoring config fetch error:", error);

    return NextResponse.json(
      { error: "Failed to fetch quality scoring configuration", message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/quality-scoring/config
 * Update quality scoring configuration
 */
export async function PUT(request: NextRequest) {
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

    // Validate the configuration
    const validationResult = QualityScoringConfigSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: "Invalid configuration format",
          details: validationResult.error.issues
        },
        { status: 400 }
      );
    }

    const newConfig = validationResult.data;

    // Merge with existing config to preserve unspecified values
    const existingConfigRecord = await prisma.featureFlag.findUnique({
      where: { key: 'quality-scoring-config' },
    });

    const existingConfig = existingConfigRecord?.value as QualityScoringConfig || DEFAULT_CONFIG;
    const mergedConfig = deepMerge(existingConfig, newConfig);

    // Validate that total score doesn't exceed reasonable limits
    const totalPossibleScore = calculateTotalPossibleScore(mergedConfig);
    if (totalPossibleScore > 150) {
      return NextResponse.json(
        { 
          error: "Configuration rejected: total possible score exceeds maximum limit",
          totalPossibleScore,
          maxAllowed: 150
        },
        { status: 400 }
      );
    }

    // Save the updated configuration
    const configRecord = await prisma.featureFlag.upsert({
      where: { key: 'quality-scoring-config' },
      update: {
        value: mergedConfig,
        updatedAt: new Date(),
      },
      create: {
        key: 'quality-scoring-config',
        value: mergedConfig,
        enabled: true,
        description: 'Quality scoring algorithm configuration and weights',
      },
    });

    // Log configuration update
    await adminService.logAdminAccess(
      'ADMIN_QUALITY_SCORING_CONFIG_UPDATE',
      null,
      user.id,
      {
        previousConfig: existingConfig,
        newConfig: mergedConfig,
        totalPossibleScore,
        changedFields: getChangedFields(existingConfig, mergedConfig),
      },
      request.headers.get('x-forwarded-for') || 'unknown',
      request.headers.get('user-agent') || 'unknown'
    );

    return NextResponse.json({
      success: true,
      message: "Quality scoring configuration updated successfully",
      config: mergedConfig,
      metadata: {
        totalPossibleScore,
        lastUpdated: configRecord.updatedAt,
      },
    });

  } catch (error) {
    console.error("Quality scoring config update error:", error);

    // Log error for audit
    try {
      const user = await getCurrentUser();
      const adminService = new AdminBusinessService(prisma);
      await adminService.logAdminAccess(
        'ADMIN_QUALITY_SCORING_CONFIG_UPDATE_ERROR',
        null,
        user?.id || null,
        {
          error: error instanceof Error ? error.message : 'Unknown error',
        },
        request.headers.get('x-forwarded-for') || 'unknown',
        request.headers.get('user-agent') || 'unknown'
      );
    } catch (auditError) {
      console.error('Failed to log audit event:', auditError);
    }

    return NextResponse.json(
      { error: "Failed to update quality scoring configuration", message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * Helper function to deep merge configurations
 */
function deepMerge(target: any, source: any): any {
  const output = { ...target };
  
  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach(key => {
      if (isObject(source[key])) {
        if (!(key in target)) {
          Object.assign(output, { [key]: source[key] });
        } else {
          output[key] = deepMerge(target[key], source[key]);
        }
      } else {
        Object.assign(output, { [key]: source[key] });
      }
    });
  }
  
  return output;
}

/**
 * Helper function to check if value is an object
 */
function isObject(item: any): boolean {
  return item && typeof item === 'object' && !Array.isArray(item);
}

/**
 * Calculate total possible score from configuration
 */
function calculateTotalPossibleScore(config: QualityScoringConfig): number {
  let total = 0;
  
  if (config.weights?.completeness) {
    total += Object.values(config.weights.completeness).reduce((a, b) => a + b, 0);
  }
  
  if (config.weights?.verification) {
    total += Object.values(config.weights.verification).reduce((a, b) => a + b, 0);
  }
  
  if (config.weights?.recency) {
    total += Object.values(config.weights.recency).reduce((a, b) => a + b, 0);
  }
  
  if (config.weights?.contentRichness) {
    total += Object.values(config.weights.contentRichness).reduce((a, b) => a + b, 0);
  }
  
  return total;
}

/**
 * Get list of fields that changed between configs
 */
function getChangedFields(oldConfig: any, newConfig: any, prefix = ''): string[] {
  const changes: string[] = [];
  
  const allKeys = new Set([...Object.keys(oldConfig || {}), ...Object.keys(newConfig || {})]);
  
  for (const key of allKeys) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    const oldValue = oldConfig?.[key];
    const newValue = newConfig?.[key];
    
    if (isObject(oldValue) || isObject(newValue)) {
      changes.push(...getChangedFields(oldValue, newValue, fullKey));
    } else if (oldValue !== newValue) {
      changes.push(fullKey);
    }
  }
  
  return changes;
}