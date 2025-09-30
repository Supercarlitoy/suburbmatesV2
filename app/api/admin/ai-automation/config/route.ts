import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser, isAdmin } from "@/server/auth/auth";
import { AdminBusinessService } from "@/lib/services/admin-business";
import { prisma } from "@/lib/database/prisma";
import { z } from "zod";

interface AIConfiguration {
  // System-wide AI Settings
  systemSettings: {
    enableAIAutomation: boolean;
    globalConfidenceThreshold: number; // 0-100
    fallbackToManualReview: boolean;
    enablePerformanceOptimization: boolean;
    enableAdvancedAnalytics: boolean;
  };
  
  // Business Verification Thresholds
  businessVerification: {
    confidenceThresholds: {
      autoApprove: number; // 85-100
      manualReview: number; // 60-84
      autoReject: number; // 0-59
    };
    
    // Risk Assessment Configuration
    riskAssessment: {
      enableRiskScoring: boolean;
      highRiskThreshold: number;
      mediumRiskThreshold: number;
      riskFactorWeights: {
        missingContact: number;
        duplicateDetection: number;
        qualityScore: number;
        abnVerification: number;
        agingFactor: number;
      };
    };
    
    // Quality Scoring Weights
    qualityWeights: {
      completeness: number; // % weight (0-100)
      recency: number;
      reviews: number;
      verification: number;
      consistency: number;
    };
    
    // Processing Rules
    processingRules: {
      enableBatchProcessing: boolean;
      maxBatchSize: number;
      processingTimeout: number; // seconds
      retryAttempts: number;
      enableParallelProcessing: boolean;
    };
  };
  
  // Duplicate Detection Settings
  duplicateDetection: {
    enabled: boolean;
    strictMatchingEnabled: boolean;
    looseMatchingEnabled: boolean;
    looseMatchThreshold: number; // 0-100 similarity percentage
    
    // Match Criteria Weights
    matchCriteria: {
      phoneWeight: number;
      emailWeight: number;
      nameWeight: number;
      addressWeight: number;
      abnWeight: number;
    };
    
    // Auto-merge Rules
    autoMergeRules: {
      enableAutoMerge: boolean;
      highConfidenceMergeThreshold: number;
      requireManualConfirmation: boolean;
    };
  };
  
  // Content Moderation
  contentModeration: {
    enabled: boolean;
    spamDetection: {
      enabled: boolean;
      aggressiveness: 'low' | 'medium' | 'high';
      customKeywords: string[];
    };
    profanityFiltering: {
      enabled: boolean;
      severity: 'strict' | 'moderate' | 'lenient';
    };
    disposableEmailBlocking: {
      enabled: boolean;
      blocklistUpdated: string;
    };
  };
  
  // Rate Limiting Configuration
  rateLimiting: {
    enabled: boolean;
    limits: {
      businessRegistrations: {
        perHour: number;
        perDay: number;
      };
      inquiries: {
        perHour: number;
        perDay: number;
      };
      aiProcessing: {
        perMinute: number;
        perHour: number;
      };
    };
  };
  
  // Category-specific Rules
  categoryRules: {
    [category: string]: {
      enabled: boolean;
      confidenceAdjustment: number; // -20 to +20
      priorityAdjustment: number; // -20 to +20
      specialRequirements: string[];
      autoProcessingEnabled: boolean;
    };
  };
  
  // Notification Settings
  notifications: {
    adminAlerts: boolean;
    businessOwnerNotifications: boolean;
    escalationThresholds: {
      queueSize: number;
      oldestPendingDays: number;
      lowConfidenceCount: number;
    };
    emailTemplates: {
      [key: string]: {
        enabled: boolean;
        template: string;
      };
    };
  };
  
  // Performance Settings
  performance: {
    enableCaching: boolean;
    cacheExpiryMinutes: number;
    enablePreprocessing: boolean;
    parallelProcessingEnabled: boolean;
    maxConcurrentProcessing: number;
  };
  
  // Audit & Logging
  auditSettings: {
    logAllDecisions: boolean;
    retainLogsMonths: number;
    enablePerformanceMetrics: boolean;
    enableAccuracyTracking: boolean;
  };
  
  // System Metadata
  lastModified: string;
  modifiedBy: string;
  version: string;
  appliedAt: string;
}

// Configuration validation schema
const ConfigurationSchema = z.object({
  systemSettings: z.object({
    enableAIAutomation: z.boolean(),
    globalConfidenceThreshold: z.number().min(0).max(100),
    fallbackToManualReview: z.boolean(),
    enablePerformanceOptimization: z.boolean(),
    enableAdvancedAnalytics: z.boolean(),
  }),
  businessVerification: z.object({
    confidenceThresholds: z.object({
      autoApprove: z.number().min(85).max(100),
      manualReview: z.number().min(60).max(84),
      autoReject: z.number().min(0).max(59),
    }),
    riskAssessment: z.object({
      enableRiskScoring: z.boolean(),
      highRiskThreshold: z.number().min(0).max(100),
      mediumRiskThreshold: z.number().min(0).max(100),
      riskFactorWeights: z.object({
        missingContact: z.number().min(0).max(100),
        duplicateDetection: z.number().min(0).max(100),
        qualityScore: z.number().min(0).max(100),
        abnVerification: z.number().min(0).max(100),
        agingFactor: z.number().min(0).max(100),
      }),
    }),
    qualityWeights: z.object({
      completeness: z.number().min(0).max(100),
      recency: z.number().min(0).max(100),
      reviews: z.number().min(0).max(100),
      verification: z.number().min(0).max(100),
      consistency: z.number().min(0).max(100),
    }),
    processingRules: z.object({
      enableBatchProcessing: z.boolean(),
      maxBatchSize: z.number().min(1).max(1000),
      processingTimeout: z.number().min(10).max(300),
      retryAttempts: z.number().min(1).max(10),
      enableParallelProcessing: z.boolean(),
    }),
  }),
  duplicateDetection: z.object({
    enabled: z.boolean(),
    strictMatchingEnabled: z.boolean(),
    looseMatchingEnabled: z.boolean(),
    looseMatchThreshold: z.number().min(0).max(100),
    matchCriteria: z.object({
      phoneWeight: z.number().min(0).max(100),
      emailWeight: z.number().min(0).max(100),
      nameWeight: z.number().min(0).max(100),
      addressWeight: z.number().min(0).max(100),
      abnWeight: z.number().min(0).max(100),
    }),
    autoMergeRules: z.object({
      enableAutoMerge: z.boolean(),
      highConfidenceMergeThreshold: z.number().min(0).max(100),
      requireManualConfirmation: z.boolean(),
    }),
  }),
  // Add other schema validations as needed...
}).partial(); // Allow partial updates

// Configuration change request schema
const ConfigChangeRequestSchema = z.object({
  configuration: ConfigurationSchema,
  reason: z.string().min(1).max(500),
  testMode: z.boolean().default(false),
});

/**
 * GET /api/admin/ai-automation/config
 * Get current AI automation configuration
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

    // Get current AI configuration from database or use defaults
    const configuration = await getCurrentConfiguration();

    // Log configuration access
    await adminService.logAdminAccess(
      'ADMIN_AI_AUTOMATION_CONFIG_ACCESS',
      null,
      user.id,
      {
        configVersion: configuration.version,
        globalConfidenceThreshold: configuration.systemSettings.globalConfidenceThreshold,
        enableAIAutomation: configuration.systemSettings.enableAIAutomation,
        lastModified: configuration.lastModified,
      },
      request.headers.get('x-forwarded-for') || 'unknown',
      request.headers.get('user-agent') || 'unknown'
    );

    return NextResponse.json({
      success: true,
      ...configuration,
    });

  } catch (error) {
    console.error("AI configuration fetch error:", error);

    // Log error for audit
    try {
      const user = await getCurrentUser();
      const adminService = new AdminBusinessService(prisma);
      await adminService.logAdminAccess(
        'ADMIN_AI_AUTOMATION_CONFIG_ERROR',
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
      { error: "Failed to fetch AI configuration", message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/ai-automation/config
 * Update AI automation configuration
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
    
    // Validate the request
    const validationResult = ConfigChangeRequestSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: "Invalid configuration data",
          details: validationResult.error.issues
        },
        { status: 400 }
      );
    }

    const { configuration, reason, testMode } = validationResult.data;
    const adminService = new AdminBusinessService(prisma);

    // Get current configuration for comparison
    const currentConfig = await getCurrentConfiguration();

    // Generate change diff
    const changes = generateConfigurationDiff(currentConfig, configuration);

    if (changes.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No changes detected",
        configuration: currentConfig,
      });
    }

    // Validate configuration changes
    const validationErrors = await validateConfigurationChanges(configuration, currentConfig);
    if (validationErrors.length > 0) {
      return NextResponse.json(
        { 
          error: "Configuration validation failed",
          validationErrors
        },
        { status: 400 }
      );
    }

    let updatedConfig: AIConfiguration;

    if (testMode) {
      // Test mode - simulate changes without applying
      updatedConfig = {
        ...currentConfig,
        ...configuration,
        lastModified: new Date().toISOString(),
        modifiedBy: user.id,
        version: `${currentConfig.version}-test`,
        appliedAt: new Date().toISOString(),
      };

      // Log test mode access
      await adminService.logAdminAccess(
        'ADMIN_AI_AUTOMATION_CONFIG_TEST',
        null,
        user.id,
        {
          changes,
          reason,
          testMode: true,
          changeCount: changes.length,
        },
        request.headers.get('x-forwarded-for') || 'unknown',
        request.headers.get('user-agent') || 'unknown'
      );

    } else {
      // Production mode - apply changes
      updatedConfig = await applyConfigurationChanges(configuration, currentConfig, user.id, reason);

      // Save configuration to database/file system
      await saveConfiguration(updatedConfig);

      // Log configuration update
      await adminService.logAdminAccess(
        'ADMIN_AI_AUTOMATION_CONFIG_UPDATE',
        null,
        user.id,
        {
          changes,
          reason,
          testMode: false,
          changeCount: changes.length,
          newVersion: updatedConfig.version,
          configSnapshot: {
            globalConfidenceThreshold: updatedConfig.systemSettings.globalConfidenceThreshold,
            enableAIAutomation: updatedConfig.systemSettings.enableAIAutomation,
            autoApproveThreshold: updatedConfig.businessVerification.confidenceThresholds.autoApprove,
            duplicateDetectionEnabled: updatedConfig.duplicateDetection.enabled,
          },
        },
        request.headers.get('x-forwarded-for') || 'unknown',
        request.headers.get('user-agent') || 'unknown'
      );

      // Save change history
      await saveConfigurationHistory({
        timestamp: new Date().toISOString(),
        modifiedBy: user.id,
        changes,
        appliedSuccessfully: true,
        rollbackAvailable: true,
        reason,
      });
    }

    return NextResponse.json({
      success: true,
      message: testMode 
        ? `Configuration validated successfully. ${changes.length} changes would be applied.`
        : `Configuration updated successfully. Applied ${changes.length} changes.`,
      configuration: updatedConfig,
      changes,
      testMode,
    });

  } catch (error) {
    console.error("AI configuration update error:", error);

    // Log error for audit
    try {
      const user = await getCurrentUser();
      const adminService = new AdminBusinessService(prisma);
      await adminService.logAdminAccess(
        'ADMIN_AI_AUTOMATION_CONFIG_UPDATE_ERROR',
        null,
        user?.id || null,
        {
          error: error instanceof Error ? error.message : 'Unknown error',
          requestBody: 'configuration update request',
        },
        request.headers.get('x-forwarded-for') || 'unknown',
        request.headers.get('user-agent') || 'unknown'
      );
    } catch (auditError) {
      console.error('Failed to log audit event:', auditError);
    }

    return NextResponse.json(
      { error: "Failed to update AI configuration", message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * Get current AI configuration (from database, cache, or defaults)
 */
async function getCurrentConfiguration(): Promise<AIConfiguration> {
  // In a real implementation, this would fetch from database
  // For now, return a comprehensive default configuration
  return {
    systemSettings: {
      enableAIAutomation: true,
      globalConfidenceThreshold: 75,
      fallbackToManualReview: true,
      enablePerformanceOptimization: true,
      enableAdvancedAnalytics: true,
    },
    businessVerification: {
      confidenceThresholds: {
        autoApprove: 85,
        manualReview: 60,
        autoReject: 40,
      },
      riskAssessment: {
        enableRiskScoring: true,
        highRiskThreshold: 70,
        mediumRiskThreshold: 40,
        riskFactorWeights: {
          missingContact: 25,
          duplicateDetection: 20,
          qualityScore: 20,
          abnVerification: 20,
          agingFactor: 15,
        },
      },
      qualityWeights: {
        completeness: 40,
        recency: 20,
        reviews: 20,
        verification: 15,
        consistency: 5,
      },
      processingRules: {
        enableBatchProcessing: true,
        maxBatchSize: 50,
        processingTimeout: 60,
        retryAttempts: 3,
        enableParallelProcessing: true,
      },
    },
    duplicateDetection: {
      enabled: true,
      strictMatchingEnabled: true,
      looseMatchingEnabled: true,
      looseMatchThreshold: 80,
      matchCriteria: {
        phoneWeight: 30,
        emailWeight: 25,
        nameWeight: 20,
        addressWeight: 15,
        abnWeight: 10,
      },
      autoMergeRules: {
        enableAutoMerge: false,
        highConfidenceMergeThreshold: 95,
        requireManualConfirmation: true,
      },
    },
    contentModeration: {
      enabled: true,
      spamDetection: {
        enabled: true,
        aggressiveness: 'medium',
        customKeywords: ['spam', 'fake', 'test'],
      },
      profanityFiltering: {
        enabled: true,
        severity: 'moderate',
      },
      disposableEmailBlocking: {
        enabled: true,
        blocklistUpdated: new Date().toISOString(),
      },
    },
    rateLimiting: {
      enabled: true,
      limits: {
        businessRegistrations: { perHour: 10, perDay: 50 },
        inquiries: { perHour: 30, perDay: 100 },
        aiProcessing: { perMinute: 100, perHour: 1000 },
      },
    },
    categoryRules: {
      'Medical': {
        enabled: true,
        confidenceAdjustment: 10,
        priorityAdjustment: 15,
        specialRequirements: ['ABN verification required', 'Manual contact verification'],
        autoProcessingEnabled: false,
      },
      'Legal': {
        enabled: true,
        confidenceAdjustment: 5,
        priorityAdjustment: 10,
        specialRequirements: ['Professional certification check'],
        autoProcessingEnabled: false,
      },
    },
    notifications: {
      adminAlerts: true,
      businessOwnerNotifications: true,
      escalationThresholds: {
        queueSize: 100,
        oldestPendingDays: 7,
        lowConfidenceCount: 50,
      },
      emailTemplates: {
        'business_approved': {
          enabled: true,
          template: 'default',
        },
        'business_rejected': {
          enabled: true,
          template: 'default',
        },
      },
    },
    performance: {
      enableCaching: true,
      cacheExpiryMinutes: 15,
      enablePreprocessing: true,
      parallelProcessingEnabled: true,
      maxConcurrentProcessing: 10,
    },
    auditSettings: {
      logAllDecisions: true,
      retainLogsMonths: 12,
      enablePerformanceMetrics: true,
      enableAccuracyTracking: true,
    },
    lastModified: new Date().toISOString(),
    modifiedBy: 'system',
    version: '1.0.0',
    appliedAt: new Date().toISOString(),
  };
}

/**
 * Generate configuration diff
 */
function generateConfigurationDiff(oldConfig: any, newConfig: any): any[] {
  const changes: any[] = [];

  function compareObjects(oldObj: any, newObj: any, path: string = '') {
    for (const key in newObj) {
      const newPath = path ? `${path}.${key}` : key;
      
      if (typeof newObj[key] === 'object' && newObj[key] !== null && !Array.isArray(newObj[key])) {
        if (oldObj[key]) {
          compareObjects(oldObj[key], newObj[key], newPath);
        }
      } else {
        if (oldObj[key] !== newObj[key]) {
          changes.push({
            field: newPath,
            oldValue: oldObj[key],
            newValue: newObj[key],
          });
        }
      }
    }
  }

  compareObjects(oldConfig, newConfig);
  return changes;
}

/**
 * Validate configuration changes
 */
async function validateConfigurationChanges(newConfig: any, currentConfig: any): Promise<string[]> {
  const errors: string[] = [];

  // Validate thresholds
  if (newConfig.businessVerification?.confidenceThresholds) {
    const thresholds = newConfig.businessVerification.confidenceThresholds;
    if (thresholds.autoApprove <= thresholds.manualReview) {
      errors.push('Auto-approve threshold must be higher than manual review threshold');
    }
    if (thresholds.manualReview <= thresholds.autoReject) {
      errors.push('Manual review threshold must be higher than auto-reject threshold');
    }
  }

  // Validate weights sum to 100%
  if (newConfig.businessVerification?.qualityWeights) {
    const weights = Object.values(newConfig.businessVerification.qualityWeights) as number[];
    const sum = weights.reduce((a, b) => a + b, 0);
    if (Math.abs(sum - 100) > 0.1) {
      errors.push('Quality weights must sum to 100%');
    }
  }

  return errors;
}

/**
 * Apply configuration changes
 */
async function applyConfigurationChanges(
  newConfig: any, 
  currentConfig: AIConfiguration, 
  userId: string, 
  reason: string
): Promise<AIConfiguration> {
  const timestamp = new Date().toISOString();
  
  return {
    ...currentConfig,
    ...newConfig,
    lastModified: timestamp,
    modifiedBy: userId,
    version: incrementVersion(currentConfig.version),
    appliedAt: timestamp,
  };
}

/**
 * Increment version number
 */
function incrementVersion(currentVersion: string): string {
  const parts = currentVersion.split('.');
  const patch = parseInt(parts[2] || '0') + 1;
  return `${parts[0]}.${parts[1]}.${patch}`;
}

/**
 * Save configuration (placeholder - would implement actual persistence)
 */
async function saveConfiguration(config: AIConfiguration): Promise<void> {
  // In a real implementation, this would save to database or file system
  console.log('Configuration saved:', config.version);
}

/**
 * Save configuration change history
 */
async function saveConfigurationHistory(historyEntry: any): Promise<void> {
  // In a real implementation, this would save to database
  console.log('Configuration history saved:', historyEntry);
}