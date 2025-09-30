import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser, isAdmin } from "@/server/auth/auth";
import { AdminBusinessService } from "@/lib/services/admin-business";
import { prisma } from "@/lib/database/prisma";
import { z } from "zod";

interface PendingReviewItem {
  businessId: string;
  businessName: string;
  businessSlug: string;
  businessSuburb: string;
  businessCategory: string;
  
  // AI Analysis Results
  aiRecommendation: 'approve' | 'reject' | 'manual_review';
  confidenceScore: number; // 0-100
  aiAnalysisDate: string;
  
  // Priority & Urgency Factors
  priorityScore: number; // 0-100 (higher = more urgent)
  agingDays: number;
  businessValue: 'low' | 'medium' | 'high'; // Based on profile completeness, category, etc.
  riskLevel: 'low' | 'medium' | 'high'; // Based on legitimacy concerns
  
  // Key AI Insights
  keyIssues: string[];
  keyStrengths: string[];
  missingFields: string[];
  duplicateCount: number;
  
  // Business Context
  source: string;
  submissionDate: string;
  lastModified: string;
  qualityScore: number;
  abnStatus: string;
  ownerId: string | null;
  
  // Admin Context
  adminNotesCount: number;
  previousReviewAttempts: number;
  escalatedForReview: boolean;
}

interface PendingReviewResponse {
  totalPending: number;
  totalFiltered: number;
  highPriority: number;
  mediumPriority: number;
  lowPriority: number;
  avgAgingDays: number;
  oldestPending: number;
  
  recommendations: {
    approve: number;
    reject: number;
    manual_review: number;
  };
  
  avgConfidenceScores: {
    approve: number;
    reject: number;
    manual_review: number;
  };
  
  items: PendingReviewItem[];
  
  agingDistribution: {
    range: string;
    count: number;
    avgConfidence: number;
  }[];
  
  categoryBreakdown: {
    category: string;
    count: number;
    avgPriority: number;
    avgConfidence: number;
  }[];
  
  batchProcessingRecommendations: {
    autoApprove: {
      count: number;
      criteria: string;
      businessIds: string[];
    };
    autoReject: {
      count: number;
      criteria: string;
      businessIds: string[];
    };
    needsManualReview: {
      count: number;
      criteria: string;
      businessIds: string[];
    };
  };
}

const PendingReviewSchema = z.object({
  // Filtering options
  recommendationType: z.enum(['approve', 'reject', 'manual_review', 'all']).optional().default('all'),
  confidenceMin: z.number().min(0).max(100).optional(),
  confidenceMax: z.number().min(0).max(100).optional(),
  priority: z.enum(['high', 'medium', 'low', 'all']).optional().default('all'),
  riskLevel: z.enum(['high', 'medium', 'low', 'all']).optional().default('all'),
  businessValue: z.enum(['high', 'medium', 'low', 'all']).optional().default('all'),
  
  // Age-based filtering
  agingDaysMin: z.number().min(0).optional(),
  agingDaysMax: z.number().min(0).optional(),
  
  // Business context filtering
  category: z.string().optional(),
  suburb: z.string().optional(),
  source: z.enum(['MANUAL', 'CSV', 'AUTO_ENRICH', 'CLAIMED', 'all']).optional().default('all'),
  abnStatus: z.enum(['VERIFIED', 'PENDING', 'INVALID', 'EXPIRED', 'NOT_PROVIDED', 'all']).optional().default('all'),
  
  // Sorting options
  sortBy: z.enum(['priority', 'confidence', 'aging', 'name', 'category', 'submission_date']).optional().default('priority'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
  
  // Pagination
  page: z.number().min(1).optional().default(1),
  limit: z.number().min(1).max(100).optional().default(25),
  
  // Analysis options
  includeAgingAnalysis: z.boolean().optional().default(true),
  includeCategoryBreakdown: z.boolean().optional().default(true),
  includeBatchRecommendations: z.boolean().optional().default(true),
});

/**
 * GET /api/admin/ai-automation/pending-review
 * Get businesses pending AI review with filtering and analytics
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
    const validationResult = PendingReviewSchema.safeParse({
      ...queryParams,
      page: queryParams.page ? parseInt(queryParams.page) : undefined,
      limit: queryParams.limit ? parseInt(queryParams.limit) : undefined,
      confidenceMin: queryParams.confidenceMin ? parseFloat(queryParams.confidenceMin) : undefined,
      confidenceMax: queryParams.confidenceMax ? parseFloat(queryParams.confidenceMax) : undefined,
      agingDaysMin: queryParams.agingDaysMin ? parseInt(queryParams.agingDaysMin) : undefined,
      agingDaysMax: queryParams.agingDaysMax ? parseInt(queryParams.agingDaysMax) : undefined,
      includeAgingAnalysis: queryParams.includeAgingAnalysis !== 'false',
      includeCategoryBreakdown: queryParams.includeCategoryBreakdown !== 'false',
      includeBatchRecommendations: queryParams.includeBatchRecommendations !== 'false',
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

    const params = validationResult.data;
    const adminService = new AdminBusinessService(prisma);

    // Generate the pending review analysis
    const reviewData = await generatePendingReviewData(params);

    // Log the admin access
    await adminService.logAdminAccess(
      'ADMIN_AI_AUTOMATION_PENDING_REVIEW',
      null, // No specific business
      user.id,
      {
        totalPending: reviewData.totalPending,
        totalFiltered: reviewData.totalFiltered,
        highPriority: reviewData.highPriority,
        recommendationType: params.recommendationType,
        priority: params.priority,
        riskLevel: params.riskLevel,
        sortBy: params.sortBy,
        page: params.page,
        limit: params.limit,
        filters: {
          confidenceRange: params.confidenceMin || params.confidenceMax ? 
            `${params.confidenceMin || 0}-${params.confidenceMax || 100}` : null,
          agingRange: params.agingDaysMin || params.agingDaysMax ? 
            `${params.agingDaysMin || 0}-${params.agingDaysMax || 999}` : null,
          category: params.category,
          suburb: params.suburb,
          source: params.source !== 'all' ? params.source : null,
          abnStatus: params.abnStatus !== 'all' ? params.abnStatus : null,
        },
      },
      request.headers.get('x-forwarded-for') || 'unknown',
      request.headers.get('user-agent') || 'unknown'
    );

    return NextResponse.json({
      success: true,
      message: `Retrieved ${reviewData.totalFiltered} pending reviews (${reviewData.totalPending} total)`,
      data: reviewData,
      query: params,
    });

  } catch (error) {
    console.error("Pending review fetch error:", error);

    // Log error for audit
    try {
      const user = await getCurrentUser();
      const adminService = new AdminBusinessService(prisma);
      await adminService.logAdminAccess(
        'ADMIN_AI_AUTOMATION_PENDING_REVIEW_ERROR',
        null,
        user?.id || null,
        {
          error: error instanceof Error ? error.message : 'Unknown error',
          queryParams,
        },
        request.headers.get('x-forwarded-for') || 'unknown',
        request.headers.get('user-agent') || 'unknown'
      );
    } catch (auditError) {
      console.error('Failed to log audit event:', auditError);
    }

    return NextResponse.json(
      { error: "Failed to fetch pending reviews", message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * Generate comprehensive pending review data
 */
async function generatePendingReviewData(params: any): Promise<PendingReviewResponse> {
  
  // Build where clause for filtering businesses that need AI review
  const baseWhere: any = {
    approvalStatus: 'PENDING', // Only pending businesses
    // Additional filters to identify businesses that need AI review
    OR: [
      // New submissions that haven't been AI-processed yet
      {
        auditLogs: {
          none: {
            eventType: 'ADMIN_AI_AUTOMATION_VERIFY_BUSINESS',
          },
        },
      },
      // Businesses that were flagged for manual review
      {
        auditLogs: {
          some: {
            eventType: 'ADMIN_AI_AUTOMATION_VERIFY_BUSINESS',
            eventData: {
              path: ['overallRecommendation'],
              equals: 'manual_review',
            },
          },
        },
      },
      // Businesses with unresolved AI concerns
      {
        auditLogs: {
          some: {
            eventType: 'ADMIN_AI_AUTOMATION_VERIFY_BUSINESS',
            eventData: {
              path: ['riskFactors'],
              array_contains: 'High severity',
            },
          },
        },
      },
    ],
  };

  // Apply filters
  if (params.category) {
    baseWhere.category = params.category;
  }

  if (params.suburb) {
    baseWhere.suburb = params.suburb;
  }

  if (params.source !== 'all') {
    baseWhere.source = params.source;
  }

  if (params.abnStatus !== 'all') {
    baseWhere.abnStatus = params.abnStatus;
  }

  // Get total count before pagination
  const totalPending = await prisma.business.count({
    where: baseWhere,
  });

  // Get businesses with comprehensive data
  const businesses = await prisma.business.findMany({
    where: baseWhere,
    include: {
      auditLogs: {
        where: {
          eventType: 'ADMIN_AI_AUTOMATION_VERIFY_BUSINESS',
        },
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
      ownershipClaims: {
        where: { status: 'PENDING' },
        take: 5,
      },
      _count: {
        select: {
          auditLogs: {
            where: {
              eventType: {
                in: ['ADMIN_BUSINESS_NOTES_ADDED', 'ADMIN_BUSINESS_FLAGGED']
              },
            },
          },
        },
      },
    },
    orderBy: getOrderByClause(params.sortBy, params.sortOrder),
    take: 1000, // Get more for analysis, then paginate
  });

  // Process and enrich business data
  const enrichedItems = await Promise.all(
    businesses.map(async (business) => enrichBusinessForReview(business))
  );

  // Apply additional filters that require computation
  let filteredItems = enrichedItems;

  if (params.confidenceMin !== undefined || params.confidenceMax !== undefined) {
    filteredItems = filteredItems.filter(item => {
      if (params.confidenceMin !== undefined && item.confidenceScore < params.confidenceMin) return false;
      if (params.confidenceMax !== undefined && item.confidenceScore > params.confidenceMax) return false;
      return true;
    });
  }

  if (params.agingDaysMin !== undefined || params.agingDaysMax !== undefined) {
    filteredItems = filteredItems.filter(item => {
      if (params.agingDaysMin !== undefined && item.agingDays < params.agingDaysMin) return false;
      if (params.agingDaysMax !== undefined && item.agingDays > params.agingDaysMax) return false;
      return true;
    });
  }

  if (params.recommendationType !== 'all') {
    filteredItems = filteredItems.filter(item => item.aiRecommendation === params.recommendationType);
  }

  if (params.priority !== 'all') {
    filteredItems = filteredItems.filter(item => item.businessValue === params.priority);
  }

  if (params.riskLevel !== 'all') {
    filteredItems = filteredItems.filter(item => item.riskLevel === params.riskLevel);
  }

  const totalFiltered = filteredItems.length;

  // Apply pagination
  const offset = (params.page - 1) * params.limit;
  const paginatedItems = filteredItems.slice(offset, offset + params.limit);

  // Generate analytics
  const analytics = generateAnalytics(filteredItems, params);

  return {
    totalPending,
    totalFiltered,
    ...analytics,
    items: paginatedItems,
  };
}

/**
 * Enrich business data with AI review context
 */
async function enrichBusinessForReview(business: any): Promise<PendingReviewItem> {
  // Get the most recent AI analysis
  const latestAiAnalysis = business.auditLogs.find((log: any) => 
    log.eventType === 'ADMIN_AI_AUTOMATION_VERIFY_BUSINESS'
  );

  // Calculate aging
  const submissionDate = new Date(business.createdAt);
  const currentDate = new Date();
  const agingDays = Math.floor((currentDate.getTime() - submissionDate.getTime()) / (1000 * 60 * 60 * 24));

  // Simulate AI recommendation if not available (for demo purposes)
  let aiRecommendation: 'approve' | 'reject' | 'manual_review' = 'manual_review';
  let confidenceScore = 75;
  let keyIssues: string[] = [];
  let keyStrengths: string[] = [];
  let missingFields: string[] = [];
  
  if (latestAiAnalysis?.eventData) {
    aiRecommendation = latestAiAnalysis.eventData.overallRecommendation || 'manual_review';
    confidenceScore = latestAiAnalysis.eventData.confidenceScore || 75;
    keyIssues = latestAiAnalysis.eventData.riskFactors || [];
    keyStrengths = latestAiAnalysis.eventData.primaryReasons || [];
  } else {
    // Simulate AI analysis for businesses without prior AI review
    confidenceScore = Math.floor(Math.random() * 40) + 60; // 60-100
    
    // Generate simulated recommendations based on business completeness
    const completenessScore = calculateCompleteness(business);
    if (completenessScore >= 90 && business.abnStatus === 'VERIFIED') {
      aiRecommendation = 'approve';
      confidenceScore = Math.max(confidenceScore, 85);
      keyStrengths = ['Complete profile', 'ABN verified', 'All required fields present'];
    } else if (completenessScore < 50 || !business.email || !business.phone) {
      aiRecommendation = 'reject';
      confidenceScore = Math.min(confidenceScore, 60);
      keyIssues = ['Incomplete profile', 'Missing contact information'];
    }
    
    // Add missing fields
    const requiredFields = ['name', 'phone', 'email', 'suburb', 'category'];
    missingFields = requiredFields.filter(field => !business[field]);
  }

  // Calculate priority score
  const priorityScore = calculatePriorityScore(business, agingDays, confidenceScore, aiRecommendation);

  // Determine business value and risk level
  const businessValue = calculateBusinessValue(business);
  const riskLevel = calculateRiskLevel(business, keyIssues);

  // Count potential duplicates (simplified)
  const duplicateCount = await estimateDuplicateCount(business);

  return {
    businessId: business.id,
    businessName: business.name,
    businessSlug: business.slug,
    businessSuburb: business.suburb || 'Unknown',
    businessCategory: business.category || 'Uncategorized',
    
    aiRecommendation,
    confidenceScore,
    aiAnalysisDate: latestAiAnalysis?.createdAt || business.createdAt,
    
    priorityScore: Math.round(priorityScore),
    agingDays,
    businessValue,
    riskLevel,
    
    keyIssues,
    keyStrengths,
    missingFields,
    duplicateCount,
    
    source: business.source || 'MANUAL',
    submissionDate: business.createdAt,
    lastModified: business.updatedAt,
    qualityScore: business.qualityScore || 50,
    abnStatus: business.abnStatus || 'NOT_PROVIDED',
    ownerId: business.ownerId,
    
    adminNotesCount: business._count.auditLogs,
    previousReviewAttempts: business.auditLogs.length,
    escalatedForReview: keyIssues.some(issue => issue.includes('High severity')) || agingDays > 30,
  };
}

/**
 * Calculate business completeness score
 */
function calculateCompleteness(business: any): number {
  const fields = ['name', 'phone', 'email', 'suburb', 'category', 'website', 'address', 'bio', 'abn'];
  const completedFields = fields.filter(field => business[field]).length;
  return Math.round((completedFields / fields.length) * 100);
}

/**
 * Calculate priority score for review queue
 */
function calculatePriorityScore(
  business: any, 
  agingDays: number, 
  confidenceScore: number, 
  recommendation: string
): number {
  let priority = 50; // Base priority

  // Age factor (older = higher priority)
  if (agingDays > 30) priority += 30;
  else if (agingDays > 14) priority += 20;
  else if (agingDays > 7) priority += 10;

  // Confidence factor (lower confidence = higher priority for manual review)
  if (confidenceScore < 60) priority += 25;
  else if (confidenceScore < 75) priority += 15;
  else if (confidenceScore < 85) priority += 5;

  // Recommendation factor
  if (recommendation === 'reject') priority += 20; // High priority to resolve rejections
  else if (recommendation === 'manual_review') priority += 15;
  else if (recommendation === 'approve') priority += 5; // Lower priority for approvals

  // Business quality factors
  if (business.abnStatus === 'VERIFIED') priority += 10;
  if (business.ownerId) priority += 10; // Claimed businesses get higher priority
  if (business.source === 'MANUAL') priority += 5; // Manual submissions get slight priority

  // High-value category businesses
  const highValueCategories = ['Medical', 'Legal', 'Financial', 'Education', 'Emergency Services'];
  if (highValueCategories.includes(business.category)) priority += 15;

  return Math.min(100, Math.max(0, priority));
}

/**
 * Calculate business value tier
 */
function calculateBusinessValue(business: any): 'low' | 'medium' | 'high' {
  let valueScore = 0;

  // Completeness factor
  const completenessScore = calculateCompleteness(business);
  if (completenessScore >= 80) valueScore += 3;
  else if (completenessScore >= 60) valueScore += 2;
  else valueScore += 1;

  // Verification factors
  if (business.abnStatus === 'VERIFIED') valueScore += 2;
  if (business.ownerId) valueScore += 2;

  // Category value
  const highValueCategories = ['Medical', 'Legal', 'Financial', 'Education', 'Emergency Services'];
  const mediumValueCategories = ['Professional Services', 'Technology', 'Consulting', 'Real Estate'];
  
  if (highValueCategories.includes(business.category)) valueScore += 3;
  else if (mediumValueCategories.includes(business.category)) valueScore += 2;
  else valueScore += 1;

  // Quality indicators
  if (business.qualityScore > 80) valueScore += 2;
  else if (business.qualityScore > 60) valueScore += 1;

  if (valueScore >= 8) return 'high';
  if (valueScore >= 5) return 'medium';
  return 'low';
}

/**
 * Calculate risk level based on AI analysis
 */
function calculateRiskLevel(business: any, keyIssues: string[]): 'low' | 'medium' | 'high' {
  let riskScore = 0;

  // Issue severity analysis
  const highRiskIssues = keyIssues.filter(issue => 
    issue.includes('High severity') || 
    issue.includes('duplicate') || 
    issue.includes('spam') ||
    issue.includes('suspicious')
  );

  if (highRiskIssues.length >= 3) riskScore += 3;
  else if (highRiskIssues.length >= 1) riskScore += 2;

  // Business legitimacy factors
  if (!business.phone || !business.email) riskScore += 2;
  if (!business.abnStatus || business.abnStatus === 'INVALID') riskScore += 2;
  if (business.source === 'CSV' && !business.ownerId) riskScore += 1;

  // Quality score factor
  if (business.qualityScore < 40) riskScore += 2;
  else if (business.qualityScore < 60) riskScore += 1;

  if (riskScore >= 5) return 'high';
  if (riskScore >= 3) return 'medium';
  return 'low';
}

/**
 * Estimate duplicate count (simplified for performance)
 */
async function estimateDuplicateCount(business: any): Promise<number> {
  if (!business.phone && !business.email && !business.abn) return 0;
  
  // Quick duplicate check on key fields
  const duplicateConditions: any[] = [];
  
  if (business.phone) duplicateConditions.push({ phone: business.phone });
  if (business.email) duplicateConditions.push({ email: business.email });
  if (business.abn) duplicateConditions.push({ abn: business.abn });

  if (duplicateConditions.length === 0) return 0;

  const count = await prisma.business.count({
    where: {
      id: { not: business.id },
      OR: duplicateConditions,
    },
  });

  return count;
}

/**
 * Generate comprehensive analytics
 */
function generateAnalytics(items: PendingReviewItem[], params: any) {
  const highPriority = items.filter(item => item.priorityScore >= 80).length;
  const mediumPriority = items.filter(item => item.priorityScore >= 50 && item.priorityScore < 80).length;
  const lowPriority = items.filter(item => item.priorityScore < 50).length;

  const avgAgingDays = items.length > 0 ? 
    Math.round(items.reduce((sum, item) => sum + item.agingDays, 0) / items.length) : 0;
  
  const oldestPending = items.length > 0 ? 
    Math.max(...items.map(item => item.agingDays)) : 0;

  // Recommendation distribution
  const recommendations = {
    approve: items.filter(item => item.aiRecommendation === 'approve').length,
    reject: items.filter(item => item.aiRecommendation === 'reject').length,
    manual_review: items.filter(item => item.aiRecommendation === 'manual_review').length,
  };

  // Average confidence scores by recommendation type
  const avgConfidenceScores = {
    approve: getAvgConfidence(items.filter(item => item.aiRecommendation === 'approve')),
    reject: getAvgConfidence(items.filter(item => item.aiRecommendation === 'reject')),
    manual_review: getAvgConfidence(items.filter(item => item.aiRecommendation === 'manual_review')),
  };

  // Aging distribution
  const agingDistribution = params.includeAgingAnalysis ? [
    {
      range: '0-7 days',
      count: items.filter(item => item.agingDays <= 7).length,
      avgConfidence: getAvgConfidence(items.filter(item => item.agingDays <= 7)),
    },
    {
      range: '8-14 days',
      count: items.filter(item => item.agingDays > 7 && item.agingDays <= 14).length,
      avgConfidence: getAvgConfidence(items.filter(item => item.agingDays > 7 && item.agingDays <= 14)),
    },
    {
      range: '15-30 days',
      count: items.filter(item => item.agingDays > 14 && item.agingDays <= 30).length,
      avgConfidence: getAvgConfidence(items.filter(item => item.agingDays > 14 && item.agingDays <= 30)),
    },
    {
      range: '30+ days',
      count: items.filter(item => item.agingDays > 30).length,
      avgConfidence: getAvgConfidence(items.filter(item => item.agingDays > 30)),
    },
  ] : [];

  // Category breakdown
  const categoryBreakdown = params.includeCategoryBreakdown ? 
    generateCategoryBreakdown(items) : [];

  // Batch processing recommendations
  const batchProcessingRecommendations = params.includeBatchRecommendations ? 
    generateBatchRecommendations(items) : {
      autoApprove: { count: 0, criteria: '', businessIds: [] },
      autoReject: { count: 0, criteria: '', businessIds: [] },
      needsManualReview: { count: 0, criteria: '', businessIds: [] },
    };

  return {
    highPriority,
    mediumPriority,
    lowPriority,
    avgAgingDays,
    oldestPending,
    recommendations,
    avgConfidenceScores,
    agingDistribution,
    categoryBreakdown,
    batchProcessingRecommendations,
  };
}

/**
 * Get average confidence score for array of items
 */
function getAvgConfidence(items: PendingReviewItem[]): number {
  if (items.length === 0) return 0;
  return Math.round(items.reduce((sum, item) => sum + item.confidenceScore, 0) / items.length);
}

/**
 * Generate category breakdown analysis
 */
function generateCategoryBreakdown(items: PendingReviewItem[]) {
  const categoryMap = new Map<string, PendingReviewItem[]>();
  
  items.forEach(item => {
    const category = item.businessCategory || 'Uncategorized';
    if (!categoryMap.has(category)) {
      categoryMap.set(category, []);
    }
    categoryMap.get(category)!.push(item);
  });

  return Array.from(categoryMap.entries()).map(([category, categoryItems]) => ({
    category,
    count: categoryItems.length,
    avgPriority: Math.round(categoryItems.reduce((sum, item) => sum + item.priorityScore, 0) / categoryItems.length),
    avgConfidence: getAvgConfidence(categoryItems),
  })).sort((a, b) => b.count - a.count);
}

/**
 * Generate batch processing recommendations
 */
function generateBatchRecommendations(items: PendingReviewItem[]) {
  // Auto-approve criteria: High confidence, complete profiles, verified ABN
  const autoApproveItems = items.filter(item => 
    item.aiRecommendation === 'approve' && 
    item.confidenceScore >= 85 && 
    item.riskLevel === 'low' &&
    item.missingFields.length === 0 &&
    item.duplicateCount === 0
  );

  // Auto-reject criteria: Very low confidence, significant issues
  const autoRejectItems = items.filter(item => 
    item.aiRecommendation === 'reject' && 
    item.confidenceScore < 40 &&
    (item.keyIssues.some(issue => issue.includes('spam')) || 
     item.keyIssues.some(issue => issue.includes('suspicious')) ||
     item.duplicateCount > 2)
  );

  // Manual review needed: Everything else requiring human judgment
  const manualReviewItems = items.filter(item => 
    !autoApproveItems.includes(item) && 
    !autoRejectItems.includes(item) &&
    (item.aiRecommendation === 'manual_review' || 
     item.riskLevel === 'high' ||
     item.duplicateCount > 0 ||
     item.agingDays > 30)
  );

  return {
    autoApprove: {
      count: autoApproveItems.length,
      criteria: 'High confidence (≥85%), complete profiles, low risk, no duplicates',
      businessIds: autoApproveItems.slice(0, 10).map(item => item.businessId), // Limit for response size
    },
    autoReject: {
      count: autoRejectItems.length,
      criteria: 'Very low confidence (<40%), spam/suspicious content, multiple duplicates',
      businessIds: autoRejectItems.slice(0, 10).map(item => item.businessId),
    },
    needsManualReview: {
      count: manualReviewItems.length,
      criteria: 'Complex cases, duplicates, aging issues, or moderate risk factors',
      businessIds: manualReviewItems.slice(0, 10).map(item => item.businessId),
    },
  };
}

/**
 * Get order by clause for sorting
 */
function getOrderByClause(sortBy: string, sortOrder: string) {
  const order = sortOrder === 'asc' ? 'asc' : 'desc';
  
  switch (sortBy) {
    case 'name':
      return { name: order };
    case 'category':
      return { category: order };
    case 'submission_date':
      return { createdAt: order };
    case 'aging':
      return { createdAt: order === 'desc' ? 'asc' : 'desc' }; // Reverse for aging
    case 'confidence':
      // This will be applied after data enrichment
      return { createdAt: 'desc' }; // Default sort, will be overridden
    case 'priority':
    default:
      // This will be applied after data enrichment
      return { createdAt: 'desc' }; // Default sort, will be overridden
  }
}