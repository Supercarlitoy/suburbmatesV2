import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser, isAdmin } from "@/server/auth/auth";
import { AdminBusinessService } from "@/lib/services/admin-business";
import { prisma } from "@/lib/database/prisma";

interface QualityDistribution {
  range: string;
  count: number;
  percentage: number;
}

interface TrendingData {
  period: string;
  averageScore: number;
  businessCount: number;
  improvementRate: number; // Percentage of businesses that improved
}

interface CategoryBreakdown {
  category: string;
  averageScore: number;
  businessCount: number;
  highQuality: number;
  mediumQuality: number;
  lowQuality: number;
}

interface SuburbBreakdown {
  suburb: string;
  averageScore: number;
  businessCount: number;
  topCategory: string;
}

interface ImprovementRecommendation {
  type: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  businessCount: number;
  averageScoreIncrease: number;
}

interface QualityStats {
  overview: {
    totalBusinesses: number;
    averageQualityScore: number;
    highQualityCount: number;
    mediumQualityCount: number;
    lowQualityCount: number;
    lastUpdated: string;
  };
  distribution: QualityDistribution[];
  trending: TrendingData[];
  categoryBreakdown: CategoryBreakdown[];
  suburbBreakdown: SuburbBreakdown[];
  improvementRecommendations: ImprovementRecommendation[];
  cacheInfo: {
    generated: string;
    ttl: number;
    source: 'cache' | 'database';
  };
}

// Cache configuration
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes
const CACHE_KEY = 'quality-scoring-stats';
let statsCache: { data: QualityStats; timestamp: number } | null = null;

/**
 * GET /api/admin/quality-scoring/stats
 * Get comprehensive quality scoring statistics with caching
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
    const forceRefresh = searchParams.get('refresh') === 'true';
    const adminService = new AdminBusinessService(prisma);

    // Check cache first (unless force refresh)
    if (!forceRefresh && statsCache && Date.now() - statsCache.timestamp < CACHE_TTL) {
      // Log cache hit
      await adminService.logAdminAccess(
        'ADMIN_QUALITY_SCORING_STATS_ACCESS',
        null,
        user.id,
        { cacheHit: true, forceRefresh: false },
        request.headers.get('x-forwarded-for') || 'unknown',
        request.headers.get('user-agent') || 'unknown'
      );

      return NextResponse.json({
        success: true,
        stats: {
          ...statsCache.data,
          cacheInfo: {
            ...statsCache.data.cacheInfo,
            source: 'cache' as const,
          },
        },
      });
    }

    // Generate fresh stats
    console.log('Generating fresh quality scoring statistics...');
    const stats = await generateQualityStats();

    // Update cache
    statsCache = {
      data: stats,
      timestamp: Date.now(),
    };

    // Log stats access
    await adminService.logAdminAccess(
      'ADMIN_QUALITY_SCORING_STATS_ACCESS',
      null,
      user.id,
      {
        cacheHit: false,
        forceRefresh,
        totalBusinesses: stats.overview.totalBusinesses,
        averageScore: stats.overview.averageQualityScore,
      },
      request.headers.get('x-forwarded-for') || 'unknown',
      request.headers.get('user-agent') || 'unknown'
    );

    return NextResponse.json({
      success: true,
      stats: {
        ...stats,
        cacheInfo: {
          ...stats.cacheInfo,
          source: 'database' as const,
        },
      },
    });

  } catch (error) {
    console.error("Quality scoring stats error:", error);

    // Log error for audit
    try {
      const user = await getCurrentUser();
      const adminService = new AdminBusinessService(prisma);
      await adminService.logAdminAccess(
        'ADMIN_QUALITY_SCORING_STATS_ERROR',
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
      { error: "Failed to fetch quality scoring statistics", message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * Generate comprehensive quality statistics
 */
async function generateQualityStats(): Promise<QualityStats> {
  const now = new Date();
  
  // Get all approved businesses for analysis
  const businesses = await prisma.business.findMany({
    where: { approvalStatus: 'APPROVED' },
    select: {
      id: true,
      name: true,
      suburb: true,
      category: true,
      qualityScore: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (businesses.length === 0) {
    return getEmptyStats(now);
  }

  // Calculate overview statistics
  const totalBusinesses = businesses.length;
  const averageQualityScore = Math.round(
    businesses.reduce((sum, b) => sum + b.qualityScore, 0) / totalBusinesses
  );

  const highQualityCount = businesses.filter(b => b.qualityScore >= 80).length;
  const mediumQualityCount = businesses.filter(b => b.qualityScore >= 50 && b.qualityScore < 80).length;
  const lowQualityCount = businesses.filter(b => b.qualityScore < 50).length;

  // Calculate quality distribution
  const distribution = calculateDistribution(businesses);

  // Calculate trending data (last 6 months)
  const trending = await calculateTrendingData();

  // Calculate category breakdown
  const categoryBreakdown = calculateCategoryBreakdown(businesses);

  // Calculate suburb breakdown (top 20)
  const suburbBreakdown = calculateSuburbBreakdown(businesses);

  // Generate improvement recommendations
  const improvementRecommendations = generateImprovementRecommendations(businesses);

  return {
    overview: {
      totalBusinesses,
      averageQualityScore,
      highQualityCount,
      mediumQualityCount,
      lowQualityCount,
      lastUpdated: now.toISOString(),
    },
    distribution,
    trending,
    categoryBreakdown,
    suburbBreakdown,
    improvementRecommendations,
    cacheInfo: {
      generated: now.toISOString(),
      ttl: CACHE_TTL,
      source: 'database',
    },
  };
}

/**
 * Calculate quality score distribution
 */
function calculateDistribution(businesses: any[]): QualityDistribution[] {
  const ranges = [
    { range: '90-100', min: 90, max: 100 },
    { range: '80-89', min: 80, max: 89 },
    { range: '70-79', min: 70, max: 79 },
    { range: '60-69', min: 60, max: 69 },
    { range: '50-59', min: 50, max: 59 },
    { range: '40-49', min: 40, max: 49 },
    { range: '30-39', min: 30, max: 39 },
    { range: '20-29', min: 20, max: 29 },
    { range: '10-19', min: 10, max: 19 },
    { range: '0-9', min: 0, max: 9 },
  ];

  return ranges.map(({ range, min, max }) => {
    const count = businesses.filter(b => b.qualityScore >= min && b.qualityScore <= max).length;
    const percentage = Math.round((count / businesses.length) * 100);
    
    return { range, count, percentage };
  });
}

/**
 * Calculate trending data over time
 */
async function calculateTrendingData(): Promise<TrendingData[]> {
  const now = new Date();
  const periods = [];
  
  // Generate last 6 months of data
  for (let i = 5; i >= 0; i--) {
    const periodStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const periodEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
    
    const businesses = await prisma.business.findMany({
      where: {
        approvalStatus: 'APPROVED',
        createdAt: { lte: periodEnd },
      },
      select: { qualityScore: true, updatedAt: true, createdAt: true },
    });

    if (businesses.length > 0) {
      const averageScore = Math.round(
        businesses.reduce((sum, b) => sum + b.qualityScore, 0) / businesses.length
      );

      // Calculate improvement rate (businesses updated in this period with score > creation score)
      const updatedInPeriod = businesses.filter(b => 
        b.updatedAt >= periodStart && b.updatedAt <= periodEnd && b.updatedAt > b.createdAt
      );
      const improvementRate = updatedInPeriod.length > 0 
        ? Math.round((updatedInPeriod.length / businesses.length) * 100) 
        : 0;

      periods.push({
        period: periodStart.toLocaleDateString('en-US', { year: 'numeric', month: 'short' }),
        averageScore,
        businessCount: businesses.length,
        improvementRate,
      });
    }
  }

  return periods;
}

/**
 * Calculate category breakdown
 */
function calculateCategoryBreakdown(businesses: any[]): CategoryBreakdown[] {
  const categoryMap = new Map<string, any[]>();

  businesses.forEach(business => {
    const category = business.category || 'Uncategorized';
    if (!categoryMap.has(category)) {
      categoryMap.set(category, []);
    }
    categoryMap.get(category)!.push(business);
  });

  return Array.from(categoryMap.entries()).map(([category, categoryBusinesses]) => {
    const averageScore = Math.round(
      categoryBusinesses.reduce((sum, b) => sum + b.qualityScore, 0) / categoryBusinesses.length
    );
    const businessCount = categoryBusinesses.length;
    const highQuality = categoryBusinesses.filter(b => b.qualityScore >= 80).length;
    const mediumQuality = categoryBusinesses.filter(b => b.qualityScore >= 50 && b.qualityScore < 80).length;
    const lowQuality = categoryBusinesses.filter(b => b.qualityScore < 50).length;

    return {
      category,
      averageScore,
      businessCount,
      highQuality,
      mediumQuality,
      lowQuality,
    };
  }).sort((a, b) => b.businessCount - a.businessCount);
}

/**
 * Calculate suburb breakdown
 */
function calculateSuburbBreakdown(businesses: any[]): SuburbBreakdown[] {
  const suburbMap = new Map<string, any[]>();

  businesses.forEach(business => {
    const suburb = business.suburb || 'Unknown';
    if (!suburbMap.has(suburb)) {
      suburbMap.set(suburb, []);
    }
    suburbMap.get(suburb)!.push(business);
  });

  return Array.from(suburbMap.entries())
    .map(([suburb, suburbBusinesses]) => {
      const averageScore = Math.round(
        suburbBusinesses.reduce((sum, b) => sum + b.qualityScore, 0) / suburbBusinesses.length
      );
      const businessCount = suburbBusinesses.length;
      
      // Find top category in this suburb
      const categoryCount = new Map<string, number>();
      suburbBusinesses.forEach(b => {
        const cat = b.category || 'Uncategorized';
        categoryCount.set(cat, (categoryCount.get(cat) || 0) + 1);
      });
      const topCategory = Array.from(categoryCount.entries())
        .sort(([,a], [,b]) => b - a)[0]?.[0] || 'Unknown';

      return {
        suburb,
        averageScore,
        businessCount,
        topCategory,
      };
    })
    .sort((a, b) => b.businessCount - a.businessCount)
    .slice(0, 20); // Top 20 suburbs
}

/**
 * Generate improvement recommendations
 */
function generateImprovementRecommendations(businesses: any[]): ImprovementRecommendation[] {
  const recommendations: ImprovementRecommendation[] = [];

  // Critical: Very low quality businesses (< 30)
  const criticalCount = businesses.filter(b => b.qualityScore < 30).length;
  if (criticalCount > 0) {
    recommendations.push({
      type: 'critical',
      title: 'Address Critical Quality Issues',
      description: 'Businesses with scores below 30 need immediate attention for basic profile completion',
      businessCount: criticalCount,
      averageScoreIncrease: 40, // Could potentially increase by 40 points
    });
  }

  // High: Low quality businesses (30-49)
  const lowQualityCount = businesses.filter(b => b.qualityScore >= 30 && b.qualityScore < 50).length;
  if (lowQualityCount > 0) {
    recommendations.push({
      type: 'high',
      title: 'Improve Low-Quality Profiles',
      description: 'Focus on completing missing contact information and business descriptions',
      businessCount: lowQualityCount,
      averageScoreIncrease: 25,
    });
  }

  // Medium: Medium quality businesses (50-79)
  const mediumQualityCount = businesses.filter(b => b.qualityScore >= 50 && b.qualityScore < 80).length;
  if (mediumQualityCount > 0) {
    recommendations.push({
      type: 'medium',
      title: 'Enhance Medium-Quality Profiles',
      description: 'Add images, verify ABN status, and encourage customer engagement',
      businessCount: mediumQualityCount,
      averageScoreIncrease: 15,
    });
  }

  // Low: High quality businesses (80+) - optimization
  const highQualityCount = businesses.filter(b => b.qualityScore >= 80).length;
  if (highQualityCount > 0) {
    recommendations.push({
      type: 'low',
      title: 'Optimize High-Quality Profiles',
      description: 'Focus on premium features and advanced customization options',
      businessCount: highQualityCount,
      averageScoreIncrease: 5,
    });
  }

  return recommendations.sort((a, b) => {
    const priority = { critical: 4, high: 3, medium: 2, low: 1 };
    return priority[b.type] - priority[a.type];
  });
}

/**
 * Generate empty stats structure
 */
function getEmptyStats(now: Date): QualityStats {
  return {
    overview: {
      totalBusinesses: 0,
      averageQualityScore: 0,
      highQualityCount: 0,
      mediumQualityCount: 0,
      lowQualityCount: 0,
      lastUpdated: now.toISOString(),
    },
    distribution: [],
    trending: [],
    categoryBreakdown: [],
    suburbBreakdown: [],
    improvementRecommendations: [],
    cacheInfo: {
      generated: now.toISOString(),
      ttl: CACHE_TTL,
      source: 'database',
    },
  };
}