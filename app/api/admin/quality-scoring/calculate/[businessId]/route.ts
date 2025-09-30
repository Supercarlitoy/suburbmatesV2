import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser, isAdmin } from "@/server/auth/auth";
import { calculateQualityScore, updateBusinessQualityScore } from "@/lib/services/quality-scoring";
import { AdminBusinessService } from "@/lib/services/admin-business";
import { prisma } from "@/lib/database/prisma";

interface RouteParams {
  params: Promise<{
    businessId: string;
  }>;
}

interface QualityScoreBreakdown {
  factor: string;
  category: 'completeness' | 'verification' | 'recency' | 'contentRichness';
  currentValue: any;
  points: number;
  maxPoints: number;
  percentage: number;
  status: 'complete' | 'partial' | 'missing';
  recommendation?: string;
}

interface CalculationResult {
  businessId: string;
  businessName: string;
  previousScore: number;
  newScore: number;
  scoreChange: number;
  calculatedAt: string;
  breakdown: QualityScoreBreakdown[];
  recommendations: {
    immediate: string[];
    shortTerm: string[];
    longTerm: string[];
  };
  nextSteps: {
    priority: 'high' | 'medium' | 'low';
    action: string;
    expectedScoreIncrease: number;
  }[];
}

/**
 * POST /api/admin/quality-scoring/calculate/{businessId}
 * Calculate and update quality score for a specific business
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    // Check admin authentication
    const user = await getCurrentUser();
    if (!user || !(await isAdmin())) {
      return NextResponse.json(
        { error: "Unauthorized. Admin access required." },
        { status: 403 }
      );
    }

    const { businessId } = params;
    const adminService = new AdminBusinessService(prisma);

    // Validate business exists and is approved
    const business = await prisma.business.findUnique({
      where: { id: businessId },
      include: {
        customization: true,
        content: {
          where: { isPublic: true },
          orderBy: { createdAt: 'desc' },
          take: 5,
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
        ownershipClaims: {
          where: { status: 'APPROVED' },
        },
      },
    });

    if (!business) {
      return NextResponse.json(
        { error: "Business not found" },
        { status: 404 }
      );
    }

    if (business.approvalStatus !== 'APPROVED') {
      return NextResponse.json(
        { 
          error: "Cannot calculate quality score for non-approved business",
          currentStatus: business.approvalStatus
        },
        { status: 400 }
      );
    }

    // Store previous score
    const previousScore = business.qualityScore;

    // Calculate new quality score
    const newScore = calculateQualityScore(business);

    // Generate detailed breakdown
    const breakdown = generateScoreBreakdown(business, newScore);

    // Update the business in the database
    await prisma.business.update({
      where: { id: businessId },
      data: {
        qualityScore: newScore,
        updatedAt: new Date(),
      },
    });

    // Generate recommendations and next steps
    const recommendations = generateRecommendations(breakdown, business);
    const nextSteps = generateNextSteps(breakdown, business, newScore);

    const result: CalculationResult = {
      businessId,
      businessName: business.name,
      previousScore,
      newScore,
      scoreChange: newScore - previousScore,
      calculatedAt: new Date().toISOString(),
      breakdown,
      recommendations,
      nextSteps,
    };

    // Log the calculation
    await adminService.logAdminAccess(
      'ADMIN_QUALITY_SCORING_CALCULATE',
      businessId,
      user.id,
      {
        businessName: business.name,
        previousScore,
        newScore,
        scoreChange: newScore - previousScore,
        suburb: business.suburb,
        category: business.category,
        abnStatus: business.abnStatus,
        calculationDetails: {
          totalFactors: breakdown.length,
          completenessScore: breakdown.filter(b => b.category === 'completeness').reduce((sum, b) => sum + b.points, 0),
          verificationScore: breakdown.filter(b => b.category === 'verification').reduce((sum, b) => sum + b.points, 0),
          recencyScore: breakdown.filter(b => b.category === 'recency').reduce((sum, b) => sum + b.points, 0),
          contentScore: breakdown.filter(b => b.category === 'contentRichness').reduce((sum, b) => sum + b.points, 0),
        },
      },
      request.headers.get('x-forwarded-for') || 'unknown',
      request.headers.get('user-agent') || 'unknown'
    );

    return NextResponse.json({
      success: true,
      message: `Quality score ${newScore > previousScore ? 'increased' : newScore < previousScore ? 'decreased' : 'unchanged'}`,
      result,
    });

  } catch (error) {
    console.error("Quality score calculation error:", error);

    // Log error for audit
    try {
      const user = await getCurrentUser();
      const adminService = new AdminBusinessService(prisma);
      await adminService.logAdminAccess(
        'ADMIN_QUALITY_SCORING_CALCULATE_ERROR',
        params.businessId,
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
      { error: "Failed to calculate quality score", message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * Generate detailed score breakdown
 */
function generateScoreBreakdown(business: any, totalScore: number): QualityScoreBreakdown[] {
  const breakdown: QualityScoreBreakdown[] = [];

  // Completeness factors
  breakdown.push({
    factor: "Business Name",
    category: 'completeness',
    currentValue: business.name || null,
    points: business.name ? 10 : 0,
    maxPoints: 10,
    percentage: business.name ? 100 : 0,
    status: business.name ? 'complete' : 'missing',
    recommendation: !business.name ? "Add a clear, descriptive business name" : undefined,
  });

  breakdown.push({
    factor: "Business Description",
    category: 'completeness',
    currentValue: business.bio ? `${business.bio.length} characters` : null,
    points: (business.bio && business.bio.length > 50) ? 15 : (business.bio ? 8 : 0),
    maxPoints: 15,
    percentage: (business.bio && business.bio.length > 50) ? 100 : (business.bio ? 53 : 0),
    status: (business.bio && business.bio.length > 50) ? 'complete' : (business.bio ? 'partial' : 'missing'),
    recommendation: !business.bio 
      ? "Add a comprehensive business description" 
      : business.bio.length < 50 
        ? "Expand description to at least 50 characters"
        : undefined,
  });

  breakdown.push({
    factor: "Phone Number",
    category: 'completeness',
    currentValue: business.phone ? "Provided" : null,
    points: business.phone ? 10 : 0,
    maxPoints: 10,
    percentage: business.phone ? 100 : 0,
    status: business.phone ? 'complete' : 'missing',
    recommendation: !business.phone ? "Add a valid Australian phone number" : undefined,
  });

  breakdown.push({
    factor: "Email Address",
    category: 'completeness',
    currentValue: business.email ? "Provided" : null,
    points: business.email ? 10 : 0,
    maxPoints: 10,
    percentage: business.email ? 100 : 0,
    status: business.email ? 'complete' : 'missing',
    recommendation: !business.email ? "Add a professional email address" : undefined,
  });

  breakdown.push({
    factor: "Website URL",
    category: 'completeness',
    currentValue: business.website ? "Provided" : null,
    points: business.website ? 10 : 0,
    maxPoints: 10,
    percentage: business.website ? 100 : 0,
    status: business.website ? 'complete' : 'missing',
    recommendation: !business.website ? "Add website URL for increased credibility" : undefined,
  });

  breakdown.push({
    factor: "Physical Address",
    category: 'completeness',
    currentValue: business.address ? "Provided" : null,
    points: business.address ? 5 : 0,
    maxPoints: 5,
    percentage: business.address ? 100 : 0,
    status: business.address ? 'complete' : 'missing',
    recommendation: !business.address ? "Add business address for local SEO" : undefined,
  });

  // Verification factors
  breakdown.push({
    factor: "ABN Verification",
    category: 'verification',
    currentValue: business.abnStatus,
    points: business.abnStatus === 'VERIFIED' ? 15 : 0,
    maxPoints: 15,
    percentage: business.abnStatus === 'VERIFIED' ? 100 : 0,
    status: business.abnStatus === 'VERIFIED' ? 'complete' : 
             business.abn ? 'partial' : 'missing',
    recommendation: business.abnStatus !== 'VERIFIED' 
      ? business.abn 
        ? "Complete ABN verification process"
        : "Add and verify ABN for maximum credibility"
      : undefined,
  });

  breakdown.push({
    factor: "Location Verification",
    category: 'verification',
    currentValue: (business.latitude && business.longitude) ? "Coordinates verified" : null,
    points: (business.latitude && business.longitude) ? 5 : 0,
    maxPoints: 5,
    percentage: (business.latitude && business.longitude) ? 100 : 0,
    status: (business.latitude && business.longitude) ? 'complete' : 'missing',
    recommendation: !(business.latitude && business.longitude) 
      ? "Verify business location coordinates" : undefined,
  });

  // Recency factor
  const daysSinceUpdate = business.updatedAt 
    ? Math.floor((Date.now() - business.updatedAt.getTime()) / (1000 * 60 * 60 * 24))
    : Infinity;

  let recencyPoints = 0;
  let recencyStatus: 'complete' | 'partial' | 'missing' = 'missing';
  
  if (daysSinceUpdate < 30) {
    recencyPoints = 10;
    recencyStatus = 'complete';
  } else if (daysSinceUpdate < 90) {
    recencyPoints = 5;
    recencyStatus = 'partial';
  }

  breakdown.push({
    factor: "Profile Freshness",
    category: 'recency',
    currentValue: daysSinceUpdate < Infinity ? `${daysSinceUpdate} days ago` : "Never updated",
    points: recencyPoints,
    maxPoints: 10,
    percentage: (recencyPoints / 10) * 100,
    status: recencyStatus,
    recommendation: daysSinceUpdate > 90 
      ? "Update business profile to improve search ranking"
      : daysSinceUpdate > 30
        ? "Consider updating profile information"
        : undefined,
  });

  // Content richness factors
  const hasImages = business.customization?.gallery && business.customization.gallery.length > 0;
  const hasContentImages = business.content && business.content.some((c: any) => {
    try {
      const images = JSON.parse(c.images || '[]');
      return Array.isArray(images) && images.length > 0;
    } catch {
      return false;
    }
  });
  const totalImages = hasImages || hasContentImages;

  breakdown.push({
    factor: "Business Images",
    category: 'contentRichness',
    currentValue: hasImages ? `${business.customization.gallery.length} in gallery` : 
                  hasContentImages ? "In content posts" : null,
    points: totalImages ? 5 : 0,
    maxPoints: 5,
    percentage: totalImages ? 100 : 0,
    status: totalImages ? 'complete' : 'missing',
    recommendation: !totalImages ? "Add business photos to gallery" : undefined,
  });

  breakdown.push({
    factor: "Business Hours Display",
    category: 'contentRichness',
    currentValue: business.showBusinessHours ? "Enabled" : "Disabled",
    points: business.showBusinessHours ? 3 : 0,
    maxPoints: 3,
    percentage: business.showBusinessHours ? 100 : 0,
    status: business.showBusinessHours ? 'complete' : 'missing',
    recommendation: !business.showBusinessHours ? "Enable business hours display" : undefined,
  });

  const hasEngagement = (business.inquiries && business.inquiries.length > 0) ||
                       (business.leads && business.leads.length > 0);

  breakdown.push({
    factor: "Customer Engagement",
    category: 'contentRichness',
    currentValue: hasEngagement ? 
      `${(business.inquiries?.length || 0) + (business.leads?.length || 0)} recent interactions` : 
      "No recent activity",
    points: hasEngagement ? 2 : 0,
    maxPoints: 2,
    percentage: hasEngagement ? 100 : 0,
    status: hasEngagement ? 'complete' : 'missing',
    recommendation: !hasEngagement ? "Encourage customer inquiries through profile sharing" : undefined,
  });

  return breakdown;
}

/**
 * Generate improvement recommendations
 */
function generateRecommendations(breakdown: QualityScoreBreakdown[], business: any) {
  const immediate: string[] = [];
  const shortTerm: string[] = [];
  const longTerm: string[] = [];

  breakdown.forEach(factor => {
    if (factor.recommendation) {
      if (factor.status === 'missing' && factor.category === 'completeness') {
        immediate.push(factor.recommendation);
      } else if (factor.category === 'contentRichness' || factor.status === 'partial') {
        shortTerm.push(factor.recommendation);
      } else if (factor.category === 'verification') {
        longTerm.push(factor.recommendation);
      }
    }
  });

  return { immediate, shortTerm, longTerm };
}

/**
 * Generate prioritized next steps
 */
function generateNextSteps(breakdown: QualityScoreBreakdown[], business: any, currentScore: number) {
  const steps: { priority: 'high' | 'medium' | 'low'; action: string; expectedScoreIncrease: number }[] = [];

  // High priority: Missing completeness factors with high point values
  const missingCompleteness = breakdown.filter(b => 
    b.category === 'completeness' && b.status === 'missing' && b.maxPoints >= 10
  );
  
  missingCompleteness.forEach(factor => {
    steps.push({
      priority: 'high',
      action: factor.recommendation || `Complete ${factor.factor}`,
      expectedScoreIncrease: factor.maxPoints,
    });
  });

  // Medium priority: Partial completeness and content richness
  const partialFactors = breakdown.filter(b => 
    (b.category === 'completeness' && b.status === 'partial') ||
    (b.category === 'contentRichness' && b.status === 'missing')
  );
  
  partialFactors.forEach(factor => {
    steps.push({
      priority: 'medium',
      action: factor.recommendation || `Improve ${factor.factor}`,
      expectedScoreIncrease: factor.maxPoints - factor.points,
    });
  });

  // Low priority: Verification and optimization
  const verificationFactors = breakdown.filter(b => 
    b.category === 'verification' && b.status !== 'complete'
  );
  
  verificationFactors.forEach(factor => {
    steps.push({
      priority: 'low',
      action: factor.recommendation || `Complete ${factor.factor}`,
      expectedScoreIncrease: factor.maxPoints - factor.points,
    });
  });

  // Sort by expected score increase (descending) within each priority
  return steps.sort((a, b) => {
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    }
    return b.expectedScoreIncrease - a.expectedScoreIncrease;
  }).slice(0, 5); // Top 5 next steps
}