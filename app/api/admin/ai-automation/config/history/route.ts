import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser, isAdmin } from "@/server/auth/auth";
import { AdminBusinessService } from "@/lib/services/admin-business";
import { prisma } from "@/lib/database/prisma";
import { z } from "zod";

interface ConfigurationHistory {
  id: string;
  timestamp: string;
  modifiedBy: string;
  modifiedByUser: {
    id: string;
    email: string;
    name?: string;
  };
  changes: {
    field: string;
    oldValue: any;
    newValue: any;
    reason?: string;
  }[];
  reason: string;
  appliedSuccessfully: boolean;
  rollbackAvailable: boolean;
  version: string;
  testMode: boolean;
  summary: {
    totalChanges: number;
    criticalChanges: number;
    categories: string[];
  };
}

interface HistoryFilters {
  page: number;
  limit: number;
  modifiedBy?: string;
  fromDate?: string;
  toDate?: string;
  changeType?: 'all' | 'critical' | 'configuration' | 'thresholds';
  includeTestMode: boolean;
  sortBy: 'timestamp' | 'changes' | 'user';
  sortOrder: 'asc' | 'desc';
}

const HistoryFiltersSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(25),
  modifiedBy: z.string().optional(),
  fromDate: z.string().optional(),
  toDate: z.string().optional(),
  changeType: z.enum(['all', 'critical', 'configuration', 'thresholds']).default('all'),
  includeTestMode: z.boolean().default(false),
  sortBy: z.enum(['timestamp', 'changes', 'user']).default('timestamp'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

/**
 * GET /api/admin/ai-automation/config/history
 * Get AI configuration change history with filtering and pagination
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const queryParams = Object.fromEntries(searchParams.entries());

  try {
    // Check admin authentication
    const user = await getCurrentUser();
    if (!user || !(await isAdmin())) {
      return NextResponse.json(
        { error: "Unauthorized. Admin access required." },
        { status: 403 }
      );
    }
    
    // Parse and validate query parameters
    const validationResult = HistoryFiltersSchema.safeParse({
      page: queryParams.page ? parseInt(queryParams.page) : undefined,
      limit: queryParams.limit ? parseInt(queryParams.limit) : undefined,
      modifiedBy: queryParams.modifiedBy,
      fromDate: queryParams.fromDate,
      toDate: queryParams.toDate,
      changeType: queryParams.changeType,
      includeTestMode: queryParams.includeTestMode === 'true',
      sortBy: queryParams.sortBy,
      sortOrder: queryParams.sortOrder,
    });

    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: "Invalid query parameters",
          details: validationResult.error.issues
        },
        { status: 400 }
      );
    }

    const filters = validationResult.data;
    const adminService = new AdminBusinessService(prisma);

    // Get configuration history from audit logs
    const history = await getConfigurationHistory(filters);

    // Log history access
    await adminService.logAdminAccess(
      'ADMIN_AI_AUTOMATION_CONFIG_HISTORY_ACCESS',
      null,
      user.id,
      {
        totalRecords: history.total,
        filteredRecords: history.filtered,
        filters: {
          changeType: filters.changeType,
          modifiedBy: filters.modifiedBy,
          dateRange: filters.fromDate || filters.toDate ? {
            from: filters.fromDate,
            to: filters.toDate
          } : null,
          includeTestMode: filters.includeTestMode,
        },
        sortBy: filters.sortBy,
        page: filters.page,
        limit: filters.limit,
      },
      request.headers.get('x-forwarded-for') || 'unknown',
      request.headers.get('user-agent') || 'unknown'
    );

    return NextResponse.json({
      success: true,
      message: `Retrieved ${history.filtered} configuration history records (${history.total} total)`,
      data: {
        history: history.items,
        pagination: {
          page: filters.page,
          limit: filters.limit,
          total: history.total,
          filtered: history.filtered,
          pages: Math.ceil(history.filtered / filters.limit),
        },
        summary: history.summary,
      },
      filters,
    });

  } catch (error) {
    console.error("Configuration history fetch error:", error);

    // Log error for audit
    try {
      const user = await getCurrentUser();
      const adminService = new AdminBusinessService(prisma);
      await adminService.logAdminAccess(
        'ADMIN_AI_AUTOMATION_CONFIG_HISTORY_ERROR',
        null,
        user?.id || null,
        {
          error: error instanceof Error ? error.message : 'Unknown error',
          queryParams: JSON.stringify(queryParams),
        },
        request.headers.get('x-forwarded-for') || 'unknown',
        request.headers.get('user-agent') || 'unknown'
      );
    } catch (auditError) {
      console.error('Failed to log audit event:', auditError);
    }

    return NextResponse.json(
      { error: "Failed to fetch configuration history", message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * Get configuration history from audit logs and other sources
 */
async function getConfigurationHistory(filters: HistoryFilters): Promise<{
  items: ConfigurationHistory[];
  total: number;
  filtered: number;
  summary: {
    totalChanges: number;
    uniqueUsers: number;
    criticalChanges: number;
    testModeChanges: number;
    recentActivity: {
      last24h: number;
      last7d: number;
      last30d: number;
    };
  };
}> {
  // Build where conditions for audit log query
  const whereConditions: any = {
    eventType: {
      in: [
        'ADMIN_AI_AUTOMATION_CONFIG_UPDATE',
        'ADMIN_AI_AUTOMATION_CONFIG_TEST',
      ],
    },
  };

  // Apply filters
  if (filters.modifiedBy) {
    whereConditions.userId = filters.modifiedBy;
  }

  if (filters.fromDate || filters.toDate) {
    whereConditions.createdAt = {};
    if (filters.fromDate) {
      whereConditions.createdAt.gte = new Date(filters.fromDate);
    }
    if (filters.toDate) {
      whereConditions.createdAt.lte = new Date(filters.toDate + 'T23:59:59.999Z');
    }
  }

  if (!filters.includeTestMode) {
    whereConditions.eventType = 'ADMIN_AI_AUTOMATION_CONFIG_UPDATE';
  }

  // Get total count
  const totalCount = await prisma.auditLog.count({
    where: whereConditions,
  });

  // Get audit logs with user information
  const auditLogs = await prisma.auditLog.findMany({
    where: whereConditions,
    // Include user data in separate query
    orderBy: { createdAt: 'desc' },
    take: filters.limit,
    skip: (filters.page - 1) * filters.limit,
  });

  // Transform audit logs to configuration history format
  const historyItems: ConfigurationHistory[] = await Promise.all(
    auditLogs.map(log => transformAuditLogToHistory(log))
  );

  // Apply additional filters that require post-processing
  let filteredItems = historyItems;

  if (filters.changeType !== 'all') {
    filteredItems = filteredItems.filter(item => {
      switch (filters.changeType) {
        case 'critical':
          return item.summary.criticalChanges > 0;
        case 'configuration':
          return item.changes.some(change => 
            change.field.includes('systemSettings') || 
            change.field.includes('performance')
          );
        case 'thresholds':
          return item.changes.some(change => 
            change.field.includes('confidenceThresholds') || 
            change.field.includes('riskAssessment')
          );
        default:
          return true;
      }
    });
  }

  const filteredCount = filteredItems.length;

  // Generate summary statistics
  const summary = generateHistorySummary(historyItems);

  return {
    items: filteredItems,
    total: totalCount,
    filtered: filteredCount,
    summary,
  };
}

/**
 * Transform audit log to configuration history format
 */
async function transformAuditLogToHistory(auditLog: any): Promise<ConfigurationHistory> {
  const eventData = auditLog.eventData || {};
  const changes = eventData.changes || [];
  
  // Analyze changes for categorization
  const criticalChanges = countCriticalChanges(changes);
  const categories = getChangeCategories(changes);
  
  const testMode = auditLog.eventType === 'ADMIN_AI_AUTOMATION_CONFIG_TEST';

  return {
    id: auditLog.id,
    timestamp: auditLog.createdAt.toISOString(),
    modifiedBy: auditLog.userId || 'system',
    modifiedByUser: auditLog.user || {
      id: auditLog.userId || 'system',
      email: 'system@suburbmates.com.au',
      name: 'System',
    },
    changes: changes.map((change: any) => ({
      field: change.field,
      oldValue: change.oldValue,
      newValue: change.newValue,
      reason: change.reason,
    })),
    reason: eventData.reason || 'No reason provided',
    appliedSuccessfully: !eventData.error,
    rollbackAvailable: !testMode && !eventData.error,
    version: eventData.newVersion || 'unknown',
    testMode,
    summary: {
      totalChanges: changes.length,
      criticalChanges,
      categories,
    },
  };
}

/**
 * Count critical changes that affect core system behavior
 */
function countCriticalChanges(changes: any[]): number {
  const criticalFields = [
    'systemSettings.enableAIAutomation',
    'businessVerification.confidenceThresholds.autoApprove',
    'businessVerification.confidenceThresholds.autoReject',
    'duplicateDetection.enabled',
    'rateLimiting.enabled',
  ];

  return changes.filter(change => 
    criticalFields.some(field => change.field.includes(field))
  ).length;
}

/**
 * Get change categories for filtering and organization
 */
function getChangeCategories(changes: any[]): string[] {
  const categories = new Set<string>();

  changes.forEach(change => {
    const field = change.field.toLowerCase();
    
    if (field.includes('systemsettings')) categories.add('System');
    if (field.includes('confidencethresholds') || field.includes('riskassessment')) categories.add('Thresholds');
    if (field.includes('duplicatedetection')) categories.add('Duplicates');
    if (field.includes('contentmoderation')) categories.add('Moderation');
    if (field.includes('ratelimiting')) categories.add('Rate Limiting');
    if (field.includes('notifications')) categories.add('Notifications');
    if (field.includes('performance')) categories.add('Performance');
    if (field.includes('categoryrules')) categories.add('Category Rules');
    if (field.includes('auditsettings')) categories.add('Audit');
  });

  return Array.from(categories);
}

/**
 * Generate summary statistics for history
 */
function generateHistorySummary(items: ConfigurationHistory[]) {
  const now = new Date();
  const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const last7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const last30d = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const uniqueUsers = new Set(items.map(item => item.modifiedBy)).size;
  const totalChanges = items.reduce((sum, item) => sum + item.summary.totalChanges, 0);
  const criticalChanges = items.reduce((sum, item) => sum + item.summary.criticalChanges, 0);
  const testModeChanges = items.filter(item => item.testMode).length;

  const recentActivity = {
    last24h: items.filter(item => new Date(item.timestamp) >= last24h).length,
    last7d: items.filter(item => new Date(item.timestamp) >= last7d).length,
    last30d: items.filter(item => new Date(item.timestamp) >= last30d).length,
  };

  return {
    totalChanges,
    uniqueUsers,
    criticalChanges,
    testModeChanges,
    recentActivity,
  };
}

/**
 * Get sort order for audit logs
 */
function getSortOrder(sortBy: string, sortOrder: string) {
  const order = sortOrder === 'asc' ? 'asc' : 'desc';
  
  switch (sortBy) {
    case 'timestamp':
      return { createdAt: order };
    case 'user':
      return { userId: order, createdAt: 'desc' };
    case 'changes':
      // Sort by timestamp since we can't sort by changes count directly
      return { createdAt: order };
    default:
      return { createdAt: 'desc' };
  }
}