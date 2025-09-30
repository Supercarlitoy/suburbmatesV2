import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser, isAdmin } from "@/server/auth/auth";
import { calculateQualityScore, updateBusinessQualityScore } from "@/lib/services/quality-scoring";
import { AdminBusinessService } from "@/lib/services/admin-business";
import { prisma } from "@/lib/database/prisma";

const QualityQuerySchema = z.object({
  limit: z.string().transform(val => parseInt(val)).optional().default(50),
  offset: z.string().transform(val => parseInt(val)).optional().default(0),
  minScore: z.string().transform(val => parseInt(val)).optional(),
  maxScore: z.string().transform(val => parseInt(val)).optional(),
  suburb: z.string().optional(),
  category: z.string().optional(),
  sortBy: z.enum(['score_asc', 'score_desc', 'updated_asc', 'updated_desc']).optional().default('score_desc'),
  approvalStatus: z.enum(['PENDING', 'APPROVED', 'REJECTED']).optional(),
  abnStatus: z.enum(['NOT_PROVIDED', 'PENDING', 'VERIFIED', 'INVALID', 'EXPIRED']).optional(),
});

interface QualityStats {
  totalBusinesses: number;
  averageScore: number;
  highQualityCount: number; // 80+
  mediumQualityCount: number; // 50-79
  lowQualityCount: number; // 0-49
  scoreDistribution: {
    range: string;
    count: number;
  }[];
}

/**
 * GET /api/admin/quality-scoring
 * List businesses with quality scores and filtering options
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

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const {
      limit,
      offset,
      minScore,
      maxScore,
      suburb,
      category,
      sortBy,
      approvalStatus,
      abnStatus
    } = QualityQuerySchema.parse({
      limit: searchParams.get('limit'),
      offset: searchParams.get('offset'),
      minScore: searchParams.get('minScore'),
      maxScore: searchParams.get('maxScore'),
      suburb: searchParams.get('suburb'),
      category: searchParams.get('category'),
      sortBy: searchParams.get('sortBy'),
      approvalStatus: searchParams.get('approvalStatus'),
      abnStatus: searchParams.get('abnStatus'),
    });

    const adminService = new AdminBusinessService(prisma);

    // Build filters
    const filters: any = {};
    if (minScore !== undefined) filters.qualityScore = { gte: minScore };
    if (maxScore !== undefined) {
      filters.qualityScore = { 
        ...filters.qualityScore,
        lte: maxScore 
      };
    }
    if (suburb) filters.suburb = { contains: suburb, mode: 'insensitive' };
    if (category) filters.category = category;
    if (approvalStatus) filters.approvalStatus = approvalStatus;
    if (abnStatus) filters.abnStatus = abnStatus;

    // Build sort order
    let orderBy: any = {};
    switch (sortBy) {
      case 'score_asc':
        orderBy = { qualityScore: 'asc' };
        break;
      case 'score_desc':
        orderBy = { qualityScore: 'desc' };
        break;
      case 'updated_asc':
        orderBy = { updatedAt: 'asc' };
        break;
      case 'updated_desc':
        orderBy = { updatedAt: 'desc' };
        break;
      default:
        orderBy = { qualityScore: 'desc' };
    }

    // Fetch businesses
    const businesses = await prisma.business.findMany({
      where: filters,
      select: {
        id: true,
        name: true,
        slug: true,
        suburb: true,
        category: true,
        phone: true,
        email: true,
        website: true,
        abn: true,
        abnStatus: true,
        approvalStatus: true,
        qualityScore: true,
        createdAt: true,
        updatedAt: true,
        ownerId: true,
        duplicateOfId: true,
      },
      orderBy,
      take: limit,
      skip: offset,
    });

    // Get total count for pagination
    const totalCount = await prisma.business.count({
      where: filters
    });

    // Calculate statistics
    const allBusinesses = await prisma.business.findMany({
      where: filters,
      select: { qualityScore: true }
    });

    const scores = allBusinesses.map(b => b.qualityScore || 0);
    const averageScore = scores.length > 0 ? Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length) : 0;

    const stats: QualityStats = {
      totalBusinesses: allBusinesses.length,
      averageScore,
      highQualityCount: scores.filter(s => s >= 80).length,
      mediumQualityCount: scores.filter(s => s >= 50 && s < 80).length,
      lowQualityCount: scores.filter(s => s < 50).length,
      scoreDistribution: [
        { range: '90-100', count: scores.filter(s => s >= 90).length },
        { range: '80-89', count: scores.filter(s => s >= 80 && s < 90).length },
        { range: '70-79', count: scores.filter(s => s >= 70 && s < 80).length },
        { range: '60-69', count: scores.filter(s => s >= 60 && s < 70).length },
        { range: '50-59', count: scores.filter(s => s >= 50 && s < 60).length },
        { range: '40-49', count: scores.filter(s => s >= 40 && s < 50).length },
        { range: '30-39', count: scores.filter(s => s >= 30 && s < 40).length },
        { range: '20-29', count: scores.filter(s => s >= 20 && s < 30).length },
        { range: '10-19', count: scores.filter(s => s >= 10 && s < 20).length },
        { range: '0-9', count: scores.filter(s => s < 10).length },
      ].filter(item => item.count > 0), // Only show ranges with businesses
    };

    // Add quality analysis to each business
    const businessesWithAnalysis = businesses.map(business => ({
      ...business,
      qualityAnalysis: getQualityAnalysis(business),
    }));

    // Log admin access
    await adminService.logAdminAccess(
      'ADMIN_QUALITY_SCORING_LIST_ACCESS',
      null,
      user.id,
      {
        filters: { minScore, maxScore, suburb, category, sortBy, approvalStatus, abnStatus },
        resultCount: businesses.length,
        stats,
      },
      request.headers.get('x-forwarded-for') || 'unknown',
      request.headers.get('user-agent') || 'unknown'
    );

    return NextResponse.json({
      success: true,
      businesses: businessesWithAnalysis,
      pagination: {
        total: totalCount,
        limit,
        offset,
        hasMore: offset + limit < totalCount,
      },
      stats,
    });

  } catch (error) {
    console.error("Admin quality scoring list error:", error);

    // Log error for audit
    try {
      const user = await getCurrentUser();
      const adminService = new AdminBusinessService(prisma);
      await adminService.logAdminAccess(
        'ADMIN_QUALITY_SCORING_LIST_ERROR',
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

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid parameters", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to fetch quality scores", message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * Helper function to analyze quality score factors
 */
function getQualityAnalysis(business: any) {
  const analysis = {
    score: business.qualityScore || 0,
    level: 'low' as 'high' | 'medium' | 'low',
    factors: {
      completeness: 0,
      verification: 0,
      recency: 0,
    },
    missingElements: [] as string[],
    recommendations: [] as string[],
  };

  // Determine quality level
  if (analysis.score >= 80) {
    analysis.level = 'high';
  } else if (analysis.score >= 50) {
    analysis.level = 'medium';
  } else {
    analysis.level = 'low';
  }

  // Completeness analysis (60 points max)
  let completenessScore = 0;
  const completenessFactors = [
    { field: business.name, points: 10, name: 'Business name', required: true },
    { field: business.email, points: 10, name: 'Email address', required: true },
    { field: business.phone, points: 10, name: 'Phone number', required: true },
    { field: business.website, points: 10, name: 'Website URL', required: false },
  ];

  completenessFactors.forEach(factor => {
    if (factor.field && factor.field.toString().trim().length > 0) {
      completenessScore += factor.points;
    } else {
      analysis.missingElements.push(factor.name);
      if (factor.required) {
        analysis.recommendations.push(`Add ${factor.name} for better visibility`);
      }
    }
  });

  analysis.factors.completeness = Math.round((completenessScore / 60) * 100);

  // Verification analysis (20 points max)
  let verificationScore = 0;
  if (business.abnStatus === 'VERIFIED') {
    verificationScore += 15;
  } else {
    analysis.recommendations.push('Verify ABN for credibility boost (+15 points)');
  }

  analysis.factors.verification = Math.round((verificationScore / 20) * 100);

  // Recency analysis (10 points max)
  let recencyScore = 0;
  if (business.updatedAt) {
    const daysSinceUpdate = Math.floor((Date.now() - business.updatedAt.getTime()) / (1000 * 60 * 60 * 24));
    if (daysSinceUpdate < 30) {
      recencyScore = 10;
    } else if (daysSinceUpdate < 90) {
      recencyScore = 5;
    } else {
      analysis.recommendations.push('Update business profile to improve freshness score');
    }
  }

  analysis.factors.recency = Math.round((recencyScore / 10) * 100);

  // Add level-specific recommendations
  if (analysis.level === 'low') {
    analysis.recommendations.unshift('Priority: Complete missing required information');
  } else if (analysis.level === 'medium') {
    analysis.recommendations.unshift('Good progress! Add optional details for higher ranking');
  } else {
    analysis.recommendations.unshift('Excellent quality! Consider premium features');
  }

  return analysis;
}

const RecalculateRequestSchema = z.object({
  businessIds: z.array(z.string()).optional(),
  filters: z.object({
    suburb: z.string().optional(),
    category: z.string().optional(),
    approvalStatus: z.enum(['PENDING', 'APPROVED', 'REJECTED']).optional(),
    minScore: z.number().optional(),
    maxScore: z.number().optional(),
  }).optional(),
  recalculateAll: z.boolean().optional().default(false),
});

/**
 * POST /api/admin/quality-scoring/recalculate
 * Recalculate quality scores for specified businesses or all businesses
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
    const { businessIds, filters, recalculateAll } = RecalculateRequestSchema.parse(body);

    const adminService = new AdminBusinessService(prisma);

    let businessesToUpdate: any[] = [];

    // Determine which businesses to recalculate
    if (recalculateAll) {
      businessesToUpdate = await prisma.business.findMany({
        select: { id: true, name: true }
      });
    } else if (businessIds && businessIds.length > 0) {
      businessesToUpdate = await prisma.business.findMany({
        where: { id: { in: businessIds } },
        select: { id: true, name: true }
      });
    } else if (filters) {
      const whereClause: any = {};
      if (filters.suburb) whereClause.suburb = { contains: filters.suburb, mode: 'insensitive' };
      if (filters.category) whereClause.category = filters.category;
      if (filters.approvalStatus) whereClause.approvalStatus = filters.approvalStatus;
      if (filters.minScore !== undefined || filters.maxScore !== undefined) {
        whereClause.qualityScore = {};
        if (filters.minScore !== undefined) whereClause.qualityScore.gte = filters.minScore;
        if (filters.maxScore !== undefined) whereClause.qualityScore.lte = filters.maxScore;
      }

      businessesToUpdate = await prisma.business.findMany({
        where: whereClause,
        select: { id: true, name: true }
      });
    } else {
      return NextResponse.json(
        { error: "Must specify businessIds, filters, or recalculateAll=true" },
        { status: 400 }
      );
    }

    if (businessesToUpdate.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No businesses found matching criteria",
        results: {
          total: 0,
          updated: 0,
          failed: 0,
          businesses: []
        }
      });
    }

    // Recalculate scores
    const results = {
      total: businessesToUpdate.length,
      updated: 0,
      failed: 0,
      businesses: [] as any[],
    };

    for (const business of businessesToUpdate) {
      try {
        const newScore = await updateBusinessQualityScore(business.id, prisma);
        results.updated++;
        results.businesses.push({
          id: business.id,
          name: business.name,
          success: true,
          newScore,
        });
      } catch (error) {
        results.failed++;
        results.businesses.push({
          id: business.id,
          name: business.name,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    // Log bulk recalculation
    await adminService.logAdminAccess(
      'ADMIN_QUALITY_SCORING_RECALCULATE',
      null,
      user.id,
      {
        requestType: recalculateAll ? 'all' : businessIds ? 'specific' : 'filtered',
        businessIds: businessIds || null,
        filters: filters || null,
        results,
      },
      request.headers.get('x-forwarded-for') || 'unknown',
      request.headers.get('user-agent') || 'unknown'
    );

    return NextResponse.json({
      success: true,
      message: `Quality score recalculation completed: ${results.updated} updated, ${results.failed} failed`,
      results,
    });

  } catch (error) {
    console.error("Quality score recalculation error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid recalculation request", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to recalculate quality scores", message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}