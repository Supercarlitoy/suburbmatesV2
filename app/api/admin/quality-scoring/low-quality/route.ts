import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser, isAdmin } from "@/server/auth/auth";
import { AdminBusinessService } from "@/lib/services/admin-business";
import { prisma } from "@/lib/database/prisma";

interface ImprovementAction {
  type: 'critical' | 'high' | 'medium' | 'low';
  category: 'completeness' | 'verification' | 'content' | 'engagement';
  action: string;
  expectedScoreIncrease: number;
  effort: 'quick' | 'moderate' | 'significant';
  priority: number; // 1-100, higher = more important
}

interface LowQualityBusiness {
  id: string;
  name: string;
  slug: string;
  suburb: string;
  category: string;
  qualityScore: number;
  qualityLevel: 'critical' | 'low' | 'medium';
  approvalStatus: string;
  abnStatus: string;
  createdAt: string;
  updatedAt: string;
  improvementActions: ImprovementAction[];
  missingFields: string[];
  potentialScoreIncrease: number;
  improvementPriority: number; // Calculated priority score
  lastUpdated: number; // Days since last update
  engagementLevel: 'none' | 'low' | 'medium' | 'high';
}

interface LowQualityStats {
  totalCount: number;
  criticalCount: number; // Score < 30
  lowCount: number; // Score 30-49
  mediumCount: number; // Score 50-69 (below high threshold)
  averageScore: number;
  mostCommonIssues: Array<{
    issue: string;
    businessCount: number;
    averageScoreIncrease: number;
  }>;
  suburbBreakdown: Array<{
    suburb: string;
    count: number;
    averageScore: number;
  }>;
  categoryBreakdown: Array<{
    category: string;
    count: number;
    averageScore: number;
  }>;
}

/**
 * GET /api/admin/quality-scoring/low-quality
 * Get businesses needing quality improvements with actionable recommendations
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
    const adminService = new AdminBusinessService(prisma);

    // Parse query parameters
    const maxScore = parseInt(searchParams.get('maxScore') || '69'); // Default: below 70 (not high quality)
    const minScore = parseInt(searchParams.get('minScore') || '0');
    const suburb = searchParams.get('suburb');
    const category = searchParams.get('category');
    const abnStatus = searchParams.get('abnStatus');
    const sortBy = searchParams.get('sortBy') || 'priority'; // priority, score, lastUpdated
    const sortOrder = (searchParams.get('sortOrder') || 'desc') as 'asc' | 'desc';
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20')));
    const includeStats = searchParams.get('stats') === 'true';

    // Build where clause
    const where: any = {
      approvalStatus: 'APPROVED', // Only approved businesses
      qualityScore: {
        gte: minScore,
        lte: maxScore,
      },
    };

    if (suburb) where.suburb = suburb;
    if (category) where.category = category;
    if (abnStatus) where.abnStatus = abnStatus;

    // Get businesses with related data
    const businesses = await prisma.business.findMany({
      where,
      include: {
        customization: true,
        content: {
          where: { isPublic: true },
          take: 5,
          orderBy: { createdAt: 'desc' },
        },
        inquiries: {
          where: {
            createdAt: {
              gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), // Last 90 days
            },
          },
        },
        leads: {
          where: {
            createdAt: {
              gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), // Last 90 days
            },
          },
        },
      },
      orderBy: { qualityScore: 'asc' }, // Default: lowest scores first
    });

    // Transform and analyze businesses
    const lowQualityBusinesses: LowQualityBusiness[] = businesses.map(business => 
      analyzeLowQualityBusiness(business)
    );

    // Sort by requested criteria
    sortBusinesses(lowQualityBusinesses, sortBy, sortOrder);

    // Paginate results
    const offset = (page - 1) * limit;
    const paginatedBusinesses = lowQualityBusinesses.slice(offset, offset + limit);

    // Calculate statistics if requested
    let stats: LowQualityStats | undefined;
    if (includeStats) {
      stats = calculateLowQualityStats(lowQualityBusinesses);
    }

    // Log access
    await adminService.logAdminAccess(
      'ADMIN_QUALITY_SCORING_LOW_QUALITY_ACCESS',
      null,
      user.id,
      {
        filters: {
          maxScore,
          minScore,
          suburb,
          category,
          abnStatus,
        },
        sorting: { sortBy, sortOrder },
        pagination: { page, limit },
        totalFound: lowQualityBusinesses.length,
        averageScore: lowQualityBusinesses.length > 0 
          ? Math.round(lowQualityBusinesses.reduce((sum, b) => sum + b.qualityScore, 0) / lowQualityBusinesses.length)
          : 0,
      },
      request.headers.get('x-forwarded-for') || 'unknown',
      request.headers.get('user-agent') || 'unknown'
    );

    return NextResponse.json({
      success: true,
      businesses: paginatedBusinesses,
      pagination: {
        page,
        limit,
        totalCount: lowQualityBusinesses.length,
        totalPages: Math.ceil(lowQualityBusinesses.length / limit),
        hasNext: page * limit < lowQualityBusinesses.length,
        hasPrevious: page > 1,
      },
      filters: {
        maxScore,
        minScore,
        suburb,
        category,
        abnStatus,
      },
      sorting: {
        sortBy,
        sortOrder,
      },
      stats,
    });

  } catch (error) {
    console.error("Low quality businesses fetch error:", error);

    // Log error for audit
    try {
      const user = await getCurrentUser();
      const adminService = new AdminBusinessService(prisma);
      await adminService.logAdminAccess(
        'ADMIN_QUALITY_SCORING_LOW_QUALITY_ERROR',
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
      { error: "Failed to fetch low-quality businesses", message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * Analyze a business and generate improvement recommendations
 */
function analyzeLowQualityBusiness(business: any): LowQualityBusiness {
  const improvementActions: ImprovementAction[] = [];
  const missingFields: string[] = [];
  let potentialScoreIncrease = 0;

  // Analyze completeness
  if (!business.name) {
    missingFields.push('Business Name');
    improvementActions.push({
      type: 'critical',
      category: 'completeness',
      action: 'Add business name',
      expectedScoreIncrease: 10,
      effort: 'quick',
      priority: 95,
    });
    potentialScoreIncrease += 10;
  }

  if (!business.bio || business.bio.length < 50) {
    if (!business.bio) {
      missingFields.push('Business Description');
    }
    improvementActions.push({
      type: business.bio ? 'medium' : 'high',
      category: 'completeness',
      action: business.bio ? 'Expand business description to at least 50 characters' : 'Add business description',
      expectedScoreIncrease: business.bio ? 7 : 15,
      effort: 'moderate',
      priority: 85,
    });
    potentialScoreIncrease += business.bio ? 7 : 15;
  }

  if (!business.phone) {
    missingFields.push('Phone Number');
    improvementActions.push({
      type: 'high',
      category: 'completeness',
      action: 'Add phone number',
      expectedScoreIncrease: 10,
      effort: 'quick',
      priority: 90,
    });
    potentialScoreIncrease += 10;
  }

  if (!business.email) {
    missingFields.push('Email Address');
    improvementActions.push({
      type: 'high',
      category: 'completeness',
      action: 'Add email address',
      expectedScoreIncrease: 10,
      effort: 'quick',
      priority: 88,
    });
    potentialScoreIncrease += 10;
  }

  if (!business.website) {
    missingFields.push('Website URL');
    improvementActions.push({
      type: 'medium',
      category: 'completeness',
      action: 'Add website URL',
      expectedScoreIncrease: 10,
      effort: 'quick',
      priority: 75,
    });
    potentialScoreIncrease += 10;
  }

  if (!business.address) {
    missingFields.push('Physical Address');
    improvementActions.push({
      type: 'medium',
      category: 'completeness',
      action: 'Add business address',
      expectedScoreIncrease: 5,
      effort: 'quick',
      priority: 70,
    });
    potentialScoreIncrease += 5;
  }

  // Analyze verification
  if (business.abnStatus !== 'VERIFIED') {
    improvementActions.push({
      type: 'low',
      category: 'verification',
      action: business.abn ? 'Complete ABN verification' : 'Add and verify ABN',
      expectedScoreIncrease: 15,
      effort: 'significant',
      priority: 60,
    });
    potentialScoreIncrease += 15;
  }

  if (!business.latitude || !business.longitude) {
    improvementActions.push({
      type: 'low',
      category: 'verification',
      action: 'Verify location coordinates',
      expectedScoreIncrease: 5,
      effort: 'moderate',
      priority: 50,
    });
    potentialScoreIncrease += 5;
  }

  // Analyze content richness
  const hasImages = business.customization?.gallery && business.customization.gallery.length > 0;
  const hasContentImages = business.content && business.content.some((c: any) => {
    try {
      const images = JSON.parse(c.images || '[]');
      return Array.isArray(images) && images.length > 0;
    } catch {
      return false;
    }
  });

  if (!hasImages && !hasContentImages) {
    improvementActions.push({
      type: 'medium',
      category: 'content',
      action: 'Add business photos',
      expectedScoreIncrease: 5,
      effort: 'moderate',
      priority: 65,
    });
    potentialScoreIncrease += 5;
  }

  if (!business.showBusinessHours) {
    improvementActions.push({
      type: 'low',
      category: 'content',
      action: 'Enable business hours display',
      expectedScoreIncrease: 3,
      effort: 'quick',
      priority: 45,
    });
    potentialScoreIncrease += 3;
  }

  // Analyze engagement
  const hasRecentEngagement = (business.inquiries && business.inquiries.length > 0) ||
                             (business.leads && business.leads.length > 0);

  if (!hasRecentEngagement) {
    improvementActions.push({
      type: 'low',
      category: 'engagement',
      action: 'Increase profile visibility to encourage inquiries',
      expectedScoreIncrease: 2,
      effort: 'significant',
      priority: 40,
    });
    potentialScoreIncrease += 2;
  }

  // Calculate improvement priority (weighted score)
  const improvementPriority = calculateImprovementPriority(business, improvementActions);

  // Calculate days since last update
  const lastUpdated = business.updatedAt 
    ? Math.floor((Date.now() - business.updatedAt.getTime()) / (1000 * 60 * 60 * 24))
    : Infinity;

  // Determine engagement level
  const engagementCount = (business.inquiries?.length || 0) + (business.leads?.length || 0);
  const engagementLevel = engagementCount >= 10 ? 'high' : 
                         engagementCount >= 5 ? 'medium' :
                         engagementCount >= 1 ? 'low' : 'none';

  return {
    id: business.id,
    name: business.name,
    slug: business.slug,
    suburb: business.suburb,
    category: business.category || 'Uncategorized',
    qualityScore: business.qualityScore,
    qualityLevel: business.qualityScore < 30 ? 'critical' : 
                  business.qualityScore < 50 ? 'low' : 'medium',
    approvalStatus: business.approvalStatus,
    abnStatus: business.abnStatus,
    createdAt: business.createdAt.toISOString(),
    updatedAt: business.updatedAt.toISOString(),
    improvementActions: improvementActions.sort((a, b) => b.priority - a.priority),
    missingFields,
    potentialScoreIncrease: Math.min(potentialScoreIncrease, 100 - business.qualityScore),
    improvementPriority,
    lastUpdated: Math.min(lastUpdated, 999),
    engagementLevel,
  };
}

/**
 * Calculate improvement priority score
 */
function calculateImprovementPriority(business: any, actions: ImprovementAction[]): number {
  let score = 0;

  // Base score from quality score (lower = higher priority)
  score += (100 - business.qualityScore) * 0.4;

  // Add points for each critical/high action
  const criticalActions = actions.filter(a => a.type === 'critical').length;
  const highActions = actions.filter(a => a.type === 'high').length;
  score += criticalActions * 15;
  score += highActions * 10;

  // Add points for potential score increase
  const potentialIncrease = actions.reduce((sum, a) => sum + a.expectedScoreIncrease, 0);
  score += potentialIncrease * 0.3;

  // Add points for staleness (haven't been updated recently)
  const daysSinceUpdate = business.updatedAt 
    ? Math.floor((Date.now() - business.updatedAt.getTime()) / (1000 * 60 * 60 * 24))
    : 365;
  
  if (daysSinceUpdate > 180) score += 20;
  else if (daysSinceUpdate > 90) score += 10;
  else if (daysSinceUpdate > 30) score += 5;

  return Math.min(100, Math.round(score));
}

/**
 * Sort businesses by specified criteria
 */
function sortBusinesses(businesses: LowQualityBusiness[], sortBy: string, sortOrder: 'asc' | 'desc') {
  businesses.sort((a, b) => {
    let compareValue = 0;

    switch (sortBy) {
      case 'score':
        compareValue = a.qualityScore - b.qualityScore;
        break;
      case 'priority':
        compareValue = a.improvementPriority - b.improvementPriority;
        break;
      case 'lastUpdated':
        compareValue = a.lastUpdated - b.lastUpdated;
        break;
      case 'potential':
        compareValue = a.potentialScoreIncrease - b.potentialScoreIncrease;
        break;
      case 'name':
        compareValue = a.name.localeCompare(b.name);
        break;
      default:
        compareValue = a.improvementPriority - b.improvementPriority;
    }

    return sortOrder === 'desc' ? -compareValue : compareValue;
  });
}

/**
 * Calculate statistics for low-quality businesses
 */
function calculateLowQualityStats(businesses: LowQualityBusiness[]): LowQualityStats {
  const totalCount = businesses.length;
  const criticalCount = businesses.filter(b => b.qualityLevel === 'critical').length;
  const lowCount = businesses.filter(b => b.qualityLevel === 'low').length;
  const mediumCount = businesses.filter(b => b.qualityLevel === 'medium').length;
  const averageScore = totalCount > 0 
    ? Math.round(businesses.reduce((sum, b) => sum + b.qualityScore, 0) / totalCount)
    : 0;

  // Most common issues
  const issueMap = new Map<string, { count: number; totalIncrease: number }>();
  businesses.forEach(business => {
    business.improvementActions.forEach(action => {
      const existing = issueMap.get(action.action) || { count: 0, totalIncrease: 0 };
      existing.count++;
      existing.totalIncrease += action.expectedScoreIncrease;
      issueMap.set(action.action, existing);
    });
  });

  const mostCommonIssues = Array.from(issueMap.entries())
    .map(([issue, data]) => ({
      issue,
      businessCount: data.count,
      averageScoreIncrease: Math.round(data.totalIncrease / data.count),
    }))
    .sort((a, b) => b.businessCount - a.businessCount)
    .slice(0, 10);

  // Suburb breakdown
  const suburbMap = new Map<string, { count: number; totalScore: number }>();
  businesses.forEach(business => {
    const existing = suburbMap.get(business.suburb) || { count: 0, totalScore: 0 };
    existing.count++;
    existing.totalScore += business.qualityScore;
    suburbMap.set(business.suburb, existing);
  });

  const suburbBreakdown = Array.from(suburbMap.entries())
    .map(([suburb, data]) => ({
      suburb,
      count: data.count,
      averageScore: Math.round(data.totalScore / data.count),
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // Category breakdown
  const categoryMap = new Map<string, { count: number; totalScore: number }>();
  businesses.forEach(business => {
    const existing = categoryMap.get(business.category) || { count: 0, totalScore: 0 };
    existing.count++;
    existing.totalScore += business.qualityScore;
    categoryMap.set(business.category, existing);
  });

  const categoryBreakdown = Array.from(categoryMap.entries())
    .map(([category, data]) => ({
      category,
      count: data.count,
      averageScore: Math.round(data.totalScore / data.count),
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  return {
    totalCount,
    criticalCount,
    lowCount,
    mediumCount,
    averageScore,
    mostCommonIssues,
    suburbBreakdown,
    categoryBreakdown,
  };
}