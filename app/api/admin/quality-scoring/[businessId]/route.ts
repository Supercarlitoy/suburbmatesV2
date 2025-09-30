import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser, isAdmin } from "@/server/auth/auth";
import { calculateQualityScore } from "@/lib/services/quality-scoring";
import { AdminBusinessService } from "@/lib/services/admin-business";
import { prisma } from "@/lib/database/prisma";

interface RouteParams {
  params: Promise<{
    businessId: string;
  }>;
}

interface QualityFactorAnalysis {
  name: string;
  currentScore: number;
  maxScore: number;
  percentage: number;
  status: 'complete' | 'partial' | 'missing';
  description: string;
  recommendations?: string[];
}

interface DetailedQualityAnalysis {
  business: any;
  currentScore: number;
  maxPossibleScore: number;
  level: 'high' | 'medium' | 'low';
  factors: {
    completeness: QualityFactorAnalysis[];
    verification: QualityFactorAnalysis[];
    recency: QualityFactorAnalysis[];
    contentRichness: QualityFactorAnalysis[];
  };
  overallRecommendations: string[];
  competitorComparison?: {
    categoryAverage: number;
    suburbAverage: number;
    ranking: {
      inCategory: number;
      totalInCategory: number;
      inSuburb: number;
      totalInSuburb: number;
    };
  };
  improvementPlan: {
    quickWins: string[];
    mediumEffort: string[];
    longTerm: string[];
    estimatedScoreIncrease: number;
  };
}

/**
 * GET /api/admin/quality-scoring/[businessId]
 * Get detailed quality score analysis for a specific business
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
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

    // Get business with all related data for comprehensive analysis
    const business = await prisma.business.findUnique({
      where: { id: businessId },
      include: {
        inquiries: {
          where: {
            createdAt: {
              gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) // Last 90 days
            }
          }
        },
        ownershipClaims: true,
        customization: true,
        content: {
          where: { isPublic: true },
          orderBy: { createdAt: 'desc' },
          take: 10, // Recent content for analysis
        },
        leads: {
          where: {
            createdAt: {
              gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) // Last 90 days
            }
          }
        },
      }
    });

    if (!business) {
      return NextResponse.json(
        { error: "Business not found" },
        { status: 404 }
      );
    }

    // Calculate current score
    const currentScore = calculateQualityScore(business);

    // Get competitor comparison data
    const categoryAverage = await getAverageScore({
      category: business.category,
      excludeId: businessId
    });

    const suburbAverage = await getAverageScore({
      suburb: business.suburb,
      excludeId: businessId
    });

    // Get ranking information
    const categoryRanking = await getRanking({
      category: business.category,
      businessId,
      currentScore
    });

    const suburbRanking = await getRanking({
      suburb: business.suburb,
      businessId,
      currentScore
    });

    // Build detailed analysis
    const analysis: DetailedQualityAnalysis = {
      business: {
        id: business.id,
        name: business.name,
        slug: business.slug,
        category: business.category,
        suburb: business.suburb,
        approvalStatus: business.approvalStatus,
        abnStatus: business.abnStatus,
        createdAt: business.createdAt,
        updatedAt: business.updatedAt,
      },
      currentScore,
      maxPossibleScore: 100,
      level: currentScore >= 80 ? 'high' : currentScore >= 50 ? 'medium' : 'low',
      factors: {
        completeness: analyzeCompleteness(business),
        verification: analyzeVerification(business),
        recency: analyzeRecency(business),
        contentRichness: analyzeContentRichness(business),
      },
      overallRecommendations: [],
      competitorComparison: {
        categoryAverage,
        suburbAverage,
        ranking: {
          inCategory: categoryRanking.position,
          totalInCategory: categoryRanking.total,
          inSuburb: suburbRanking.position,
          totalInSuburb: suburbRanking.total,
        },
      },
      improvementPlan: generateImprovementPlan(business, currentScore),
    };

    // Generate overall recommendations
    analysis.overallRecommendations = generateOverallRecommendations(analysis);

    // Log detailed analysis access
    await adminService.logAdminAccess(
      'ADMIN_QUALITY_SCORING_DETAIL_ACCESS',
      businessId,
      user.id,
      {
        businessName: business.name,
        currentScore,
        level: analysis.level,
        categoryComparison: {
          businessScore: currentScore,
          categoryAverage,
          suburbAverage,
        },
      },
      request.headers.get('x-forwarded-for') || 'unknown',
      request.headers.get('user-agent') || 'unknown'
    );

    return NextResponse.json({
      success: true,
      analysis,
    });

  } catch (error) {
    console.error("Quality score detail analysis error:", error);

    // Log error for audit
    try {
      const user = await getCurrentUser();
      const adminService = new AdminBusinessService(prisma);
      await adminService.logAdminAccess(
        'ADMIN_QUALITY_SCORING_DETAIL_ERROR',
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
      { error: "Failed to analyze business quality score", message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * Helper function to analyze completeness factors
 */
function analyzeCompleteness(business: any): QualityFactorAnalysis[] {
  const factors: QualityFactorAnalysis[] = [
    {
      name: "Business Name",
      currentScore: business.name ? 10 : 0,
      maxScore: 10,
      percentage: business.name ? 100 : 0,
      status: business.name ? 'complete' : 'missing',
      description: "Primary business identifier for search and recognition",
      recommendations: !business.name ? ["Add a clear, descriptive business name"] : undefined,
    },
    {
      name: "Business Description", 
      currentScore: (business.bio && business.bio.length > 50) ? 15 : (business.bio ? 8 : 0),
      maxScore: 15,
      percentage: (business.bio && business.bio.length > 50) ? 100 : (business.bio ? 53 : 0),
      status: (business.bio && business.bio.length > 50) ? 'complete' : (business.bio ? 'partial' : 'missing'),
      description: "Detailed description of services and expertise",
      recommendations: !business.bio 
        ? ["Add a comprehensive business description"] 
        : business.bio.length < 50 
          ? ["Expand description to at least 50 characters for better SEO"]
          : undefined,
    },
    {
      name: "Phone Number",
      currentScore: business.phone ? 10 : 0,
      maxScore: 10,
      percentage: business.phone ? 100 : 0,
      status: business.phone ? 'complete' : 'missing',
      description: "Primary contact method for potential customers",
      recommendations: !business.phone ? ["Add a valid Australian phone number"] : undefined,
    },
    {
      name: "Email Address",
      currentScore: business.email ? 10 : 0,
      maxScore: 10,
      percentage: business.email ? 100 : 0,
      status: business.email ? 'complete' : 'missing',
      description: "Professional contact for inquiries and lead management",
      recommendations: !business.email ? ["Add a professional email address"] : undefined,
    },
    {
      name: "Website URL",
      currentScore: business.website ? 10 : 0,
      maxScore: 10,
      percentage: business.website ? 100 : 0,
      status: business.website ? 'complete' : 'missing',
      description: "Online presence for credibility and detailed information",
      recommendations: !business.website ? ["Add website URL for increased credibility"] : undefined,
    },
    {
      name: "Physical Address",
      currentScore: business.address ? 5 : 0,
      maxScore: 5,
      percentage: business.address ? 100 : 0,
      status: business.address ? 'complete' : 'missing',
      description: "Location information for local search optimization",
      recommendations: !business.address ? ["Add business address for local SEO"] : undefined,
    },
  ];

  return factors;
}

/**
 * Helper function to analyze verification factors
 */
function analyzeVerification(business: any): QualityFactorAnalysis[] {
  const factors: QualityFactorAnalysis[] = [
    {
      name: "ABN Verification",
      currentScore: business.abnStatus === 'VERIFIED' ? 15 : 0,
      maxScore: 15,
      percentage: business.abnStatus === 'VERIFIED' ? 100 : 0,
      status: business.abnStatus === 'VERIFIED' ? 'complete' : 
              business.abn ? 'partial' : 'missing',
      description: "Official business registration verification",
      recommendations: business.abnStatus !== 'VERIFIED' 
        ? business.abn 
          ? ["Complete ABN verification process"]
          : ["Add and verify ABN for maximum credibility"]
        : undefined,
    },
    {
      name: "Location Verification",
      currentScore: (business.latitude && business.longitude) ? 5 : 0,
      maxScore: 5,
      percentage: (business.latitude && business.longitude) ? 100 : 0,
      status: (business.latitude && business.longitude) ? 'complete' : 'missing',
      description: "Geographic location confirmation for local search",
      recommendations: !(business.latitude && business.longitude) 
        ? ["Verify business location coordinates"] : undefined,
    },
  ];

  return factors;
}

/**
 * Helper function to analyze recency factors
 */
function analyzeRecency(business: any): QualityFactorAnalysis[] {
  const daysSinceUpdate = business.updatedAt 
    ? Math.floor((Date.now() - business.updatedAt.getTime()) / (1000 * 60 * 60 * 24))
    : Infinity;

  let recencyScore = 0;
  let status: 'complete' | 'partial' | 'missing' = 'missing';
  
  if (daysSinceUpdate < 30) {
    recencyScore = 10;
    status = 'complete';
  } else if (daysSinceUpdate < 90) {
    recencyScore = 5;
    status = 'partial';
  }

  const factors: QualityFactorAnalysis[] = [
    {
      name: "Profile Freshness",
      currentScore: recencyScore,
      maxScore: 10,
      percentage: (recencyScore / 10) * 100,
      status,
      description: "How recently the business profile was updated",
      recommendations: daysSinceUpdate > 90 
        ? ["Update business profile to improve search ranking"]
        : daysSinceUpdate > 30
          ? ["Consider updating profile information to maintain freshness"]
          : undefined,
    },
  ];

  return factors;
}

/**
 * Helper function to analyze content richness factors
 */
function analyzeContentRichness(business: any): QualityFactorAnalysis[] {
  // Check images from customization gallery
  const hasImages = business.customization?.gallery && business.customization.gallery.length > 0;
  
  // Check for content posts with images
  const hasContentImages = business.content && business.content.some((c: any) => {
    try {
      const images = JSON.parse(c.images || '[]');
      return Array.isArray(images) && images.length > 0;
    } catch {
      return false;
    }
  });
  
  const totalImages = hasImages || hasContentImages;
  
  // Use recent inquiries and leads as proxy for customer engagement (reviews)
  const hasCustomerEngagement = (
    (business.inquiries && business.inquiries.length > 0) ||
    (business.leads && business.leads.length > 0)
  );
  
  const factors: QualityFactorAnalysis[] = [
    {
      name: "Business Images",
      currentScore: totalImages ? 5 : 0,
      maxScore: 5,
      percentage: totalImages ? 100 : 0,
      status: totalImages ? 'complete' : 'missing',
      description: "Visual content to showcase business and services",
      recommendations: !totalImages 
        ? ["Add business photos to gallery or upload content images"] : undefined,
    },
    {
      name: "Business Hours Display",
      currentScore: business.showBusinessHours ? 3 : 0,
      maxScore: 3,
      percentage: business.showBusinessHours ? 100 : 0,
      status: business.showBusinessHours ? 'complete' : 'missing',
      description: "Operating hours visibility for customer convenience",
      recommendations: !business.showBusinessHours 
        ? ["Enable business hours display in profile settings"] : undefined,
    },
    {
      name: "Customer Engagement",
      currentScore: hasCustomerEngagement ? 2 : 0,
      maxScore: 2,
      percentage: hasCustomerEngagement ? 100 : 0,
      status: hasCustomerEngagement ? 'complete' : 'missing',
      description: "Recent customer inquiries and lead activity",
      recommendations: !hasCustomerEngagement 
        ? ["Encourage customer inquiries through profile sharing"] : undefined,
    },
  ];

  return factors;
}

/**
 * Generate improvement plan with actionable steps
 */
function generateImprovementPlan(business: any, currentScore: number) {
  const plan = {
    quickWins: [] as string[],
    mediumEffort: [] as string[],
    longTerm: [] as string[],
    estimatedScoreIncrease: 0,
  };

  let potentialIncrease = 0;

  // Quick wins (easy to implement, immediate impact)
  if (!business.phone) {
    plan.quickWins.push("Add phone number (+10 points)");
    potentialIncrease += 10;
  }
  if (!business.email) {
    plan.quickWins.push("Add email address (+10 points)");
    potentialIncrease += 10;
  }
  if (!business.website) {
    plan.quickWins.push("Add website URL (+10 points)");
    potentialIncrease += 10;
  }

  // Medium effort (requires some work, good impact)
  if (!business.bio || business.bio.length < 50) {
    plan.mediumEffort.push("Write comprehensive business description (+15 points)");
    potentialIncrease += 15;
  }
  if (!business.showBusinessHours) {
    plan.mediumEffort.push("Enable business hours display (+3 points)");
    potentialIncrease += 3;
  }
  
  // Check if images are missing from gallery
  const hasImages = business.customization?.gallery && business.customization.gallery.length > 0;
  if (!hasImages) {
    plan.mediumEffort.push("Upload business photos to gallery (+5 points)");
    potentialIncrease += 5;
  }

  // Long term (requires significant effort or time)
  if (business.abnStatus !== 'VERIFIED') {
    plan.longTerm.push("Complete ABN verification process (+15 points)");
    potentialIncrease += 15;
  }
  
  // Check for customer engagement
  const hasEngagement = (
    (business.inquiries && business.inquiries.length > 0) ||
    (business.leads && business.leads.length > 0)
  );
  if (!hasEngagement) {
    plan.longTerm.push("Build customer engagement and inquiry activity (+2 points)");
    potentialIncrease += 2;
  }

  // Cap the estimated increase at 100 total score
  plan.estimatedScoreIncrease = Math.min(potentialIncrease, 100 - currentScore);

  return plan;
}

/**
 * Generate overall recommendations based on analysis
 */
function generateOverallRecommendations(analysis: DetailedQualityAnalysis): string[] {
  const recommendations = [];

  if (analysis.level === 'low') {
    recommendations.push("🚨 Priority: Focus on completing basic business information");
    recommendations.push("📞 Ensure all contact methods (phone, email) are provided");
  } else if (analysis.level === 'medium') {
    recommendations.push("📈 Good foundation! Focus on verification and content richness");
    recommendations.push("🎯 Consider ABN verification for maximum credibility");
  } else {
    recommendations.push("🎉 Excellent quality score! Your business profile is well-optimized");
    recommendations.push("💡 Consider premium features to maximize visibility");
  }

  // Competition-based recommendations
  if (analysis.competitorComparison?.categoryAverage) {
    if (analysis.currentScore > analysis.competitorComparison.categoryAverage + 10) {
      recommendations.push(`🏆 Above category average by ${Math.round(analysis.currentScore - analysis.competitorComparison.categoryAverage)} points`);
    } else if (analysis.currentScore < analysis.competitorComparison.categoryAverage - 10) {
      recommendations.push(`📊 Below category average - focus on improvements to compete effectively`);
    }
  }

  return recommendations;
}

/**
 * Get average quality score for comparison
 */
async function getAverageScore(filters: { category?: string; suburb?: string; excludeId: string }): Promise<number> {
  const whereClause: any = {
    id: { not: filters.excludeId },
    approvalStatus: 'APPROVED',
  };
  
  if (filters.category) whereClause.category = filters.category;
  if (filters.suburb) whereClause.suburb = filters.suburb;

  const result = await prisma.business.aggregate({
    where: whereClause,
    _avg: { qualityScore: true },
  });

  return Math.round(result._avg.qualityScore || 0);
}

/**
 * Get ranking position within category or suburb
 */
async function getRanking(filters: { category?: string; suburb?: string; businessId: string; currentScore: number }) {
  const whereClause: any = {
    id: { not: filters.businessId },
    approvalStatus: 'APPROVED',
  };
  
  if (filters.category) whereClause.category = filters.category;
  if (filters.suburb) whereClause.suburb = filters.suburb;

  const total = await prisma.business.count({
    where: whereClause,
  });

  const betterThanMe = await prisma.business.count({
    where: {
      ...whereClause,
      qualityScore: { gt: filters.currentScore },
    },
  });

  return {
    position: betterThanMe + 1,
    total: total + 1, // +1 to include the current business
  };
}