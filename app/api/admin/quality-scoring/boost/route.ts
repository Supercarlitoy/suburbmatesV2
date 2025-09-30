import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser, isAdmin } from "@/server/auth/auth";
import { AdminBusinessService } from "@/lib/services/admin-business";
import { prisma } from "@/lib/database/prisma";
import { z } from "zod";
import { calculateQualityScore, updateBusinessQualityScore } from "@/lib/services/quality-scoring";

/**
 * Manual boost request schema
 */
const ManualBoostSchema = z.object({
  businessIds: z.array(z.string()).min(1).max(100),
  boostAmount: z.number().min(-50).max(50),
  reason: z.string().min(10).max(500),
  duration: z.enum(['permanent', '30days', '90days', '365days']).default('permanent'),
  category: z.enum([
    'premium_listing',
    'quality_exception',
    'marketing_boost',
    'partnership',
    'correction',
    'seasonal_promotion',
    'other'
  ]).default('other'),
});

type ManualBoostRequest = z.infer<typeof ManualBoostSchema>;

/**
 * POST /api/admin/quality-scoring/boost
 * Apply manual quality score boosts to businesses
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

    // Validate the boost request
    const validationResult = ManualBoostSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: "Invalid boost request format",
          details: validationResult.error.issues
        },
        { status: 400 }
      );
    }

    const { businessIds, boostAmount, reason, duration, category } = validationResult.data;

    // Check configuration limits
    const config = await getQualityScoringConfig();
    const maxBoost = config?.features?.maxManualBoost || 20;
    
    if (Math.abs(boostAmount) > maxBoost) {
      return NextResponse.json(
        { 
          error: `Boost amount exceeds maximum allowed limit of ±${maxBoost}`,
          requested: boostAmount,
          maxAllowed: maxBoost
        },
        { status: 400 }
      );
    }

    // Check if manual boosts are enabled
    if (!config?.features?.enableManualBoosts) {
      return NextResponse.json(
        { 
          error: "Manual quality score boosts are currently disabled in configuration"
        },
        { status: 403 }
      );
    }

    // Get all businesses and validate they exist
    const businesses = await prisma.business.findMany({
      where: {
        id: { in: businessIds },
        approvalStatus: 'APPROVED', // Only allow boosts for approved businesses
      },
      select: {
        id: true,
        name: true,
        slug: true,
        qualityScore: true,
        category: true,
        suburb: true,
      },
    });

    const foundIds = businesses.map(b => b.id);
    const missingIds = businessIds.filter(id => !foundIds.includes(id));
    
    if (missingIds.length > 0) {
      return NextResponse.json(
        { 
          error: "Some businesses not found or not approved",
          missingBusinessIds: missingIds
        },
        { status: 400 }
      );
    }

    // Calculate expiry date if applicable
    let expiresAt: Date | null = null;
    if (duration !== 'permanent') {
      const daysMap = {
        '30days': 30,
        '90days': 90,
        '365days': 365,
      };
      const days = daysMap[duration];
      expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
    }

    // Apply boosts and track results
    const results = [];
    const transaction = await prisma.$transaction(async (tx) => {
      const transactionResults = [];

      for (const business of businesses) {
        // Calculate new scores
        const originalScore = business.qualityScore;
        const newScore = Math.max(0, Math.min(100, originalScore + boostAmount));
        const actualBoost = newScore - originalScore;

        // Create manual boost record
        const boostRecord = await tx.manualQualityBoost.create({
          data: {
            businessId: business.id,
            adminUserId: user.id,
            originalScore,
            boostAmount: actualBoost,
            newScore,
            reason,
            category,
            expiresAt,
          },
        });

        // Update business quality score
        await tx.business.update({
          where: { id: business.id },
          data: { 
            qualityScore: newScore,
            updatedAt: new Date(),
          },
        });

        // Log the boost action
        await adminService.logAdminAccess(
          'ADMIN_QUALITY_SCORING_MANUAL_BOOST',
          business.id,
          user.id,
          {
            businessName: business.name,
            originalScore,
            boostAmount: actualBoost,
            newScore,
            reason,
            category,
            duration,
            expiresAt: expiresAt?.toISOString(),
            boostRecordId: boostRecord.id,
          },
          request.headers.get('x-forwarded-for') || 'unknown',
          request.headers.get('user-agent') || 'unknown'
        );

        transactionResults.push({
          businessId: business.id,
          businessName: business.name,
          originalScore,
          boostAmount: actualBoost,
          newScore,
          boostRecordId: boostRecord.id,
        });
      }

      return transactionResults;
    });

    return NextResponse.json({
      success: true,
      message: `Successfully applied ${boostAmount > 0 ? 'positive' : 'negative'} boost to ${businesses.length} business${businesses.length > 1 ? 'es' : ''}`,
      results: transaction,
      summary: {
        totalBusinesses: businesses.length,
        averageOriginalScore: Math.round(businesses.reduce((sum, b) => sum + b.qualityScore, 0) / businesses.length),
        averageNewScore: Math.round(transaction.reduce((sum, r) => sum + r.newScore, 0) / transaction.length),
        boostAmount,
        category,
        duration,
        expiresAt: expiresAt?.toISOString(),
      },
    });

  } catch (error) {
    console.error("Manual quality boost error:", error);

    // Log error for audit
    try {
      const user = await getCurrentUser();
      const adminService = new AdminBusinessService(prisma);
      await adminService.logAdminAccess(
        'ADMIN_QUALITY_SCORING_MANUAL_BOOST_ERROR',
        null,
        user?.id || null,
        {
          error: error instanceof Error ? error.message : 'Unknown error',
          requestBody: body,
        },
        request.headers.get('x-forwarded-for') || 'unknown',
        request.headers.get('user-agent') || 'unknown'
      );
    } catch (auditError) {
      console.error('Failed to log audit event:', auditError);
    }

    return NextResponse.json(
      { error: "Failed to apply manual quality boost", message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/admin/quality-scoring/boost
 * Get history of manual quality score boosts
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
    const businessId = searchParams.get('businessId');
    const category = searchParams.get('category');
    const adminUserId = searchParams.get('adminUserId');
    const includeExpired = searchParams.get('includeExpired') === 'true';
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20')));
    const offset = (page - 1) * limit;

    // Build where clause
    const where: any = {};
    
    if (businessId) where.businessId = businessId;
    if (category) where.category = category;
    if (adminUserId) where.adminUserId = adminUserId;
    
    if (!includeExpired) {
      where.OR = [
        { expiresAt: null },
        { expiresAt: { gt: new Date() } }
      ];
    }

    // Get boosts with pagination
    const [boosts, totalCount] = await Promise.all([
      prisma.manualQualityBoost.findMany({
        where,
        include: {
          business: {
            select: {
              id: true,
              name: true,
              slug: true,
              category: true,
              suburb: true,
              approvalStatus: true,
            },
          },
          adminUser: {
            select: {
              id: true,
              email: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit,
      }),
      prisma.manualQualityBoost.count({ where }),
    ]);

    // Calculate statistics
    const activeBoosts = boosts.filter(b => !b.expiresAt || b.expiresAt > new Date());
    const totalBoostAmount = boosts.reduce((sum, b) => sum + b.boostAmount, 0);
    const averageBoost = boosts.length > 0 ? totalBoostAmount / boosts.length : 0;

    const categoryBreakdown = boosts.reduce((acc, boost) => {
      acc[boost.category] = (acc[boost.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Log history access
    await adminService.logAdminAccess(
      'ADMIN_QUALITY_SCORING_BOOST_HISTORY_ACCESS',
      businessId || null,
      user.id,
      {
        filters: {
          businessId,
          category,
          adminUserId,
          includeExpired,
        },
        pagination: { page, limit },
        totalResults: totalCount,
      },
      request.headers.get('x-forwarded-for') || 'unknown',
      request.headers.get('user-agent') || 'unknown'
    );

    return NextResponse.json({
      success: true,
      boosts,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        hasNext: page * limit < totalCount,
        hasPrevious: page > 1,
      },
      statistics: {
        totalBoosts: totalCount,
        activeBoosts: activeBoosts.length,
        expiredBoosts: boosts.length - activeBoosts.length,
        totalBoostAmount: Math.round(totalBoostAmount),
        averageBoost: Math.round(averageBoost * 10) / 10,
        categoryBreakdown,
      },
    });

  } catch (error) {
    console.error("Boost history fetch error:", error);

    return NextResponse.json(
      { error: "Failed to fetch boost history", message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/quality-scoring/boost
 * Remove or expire manual quality score boosts
 */
export async function DELETE(request: NextRequest) {
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

    const schema = z.object({
      boostIds: z.array(z.string()).min(1).max(50),
      reason: z.string().min(5).max(200),
      action: z.enum(['expire', 'remove']).default('expire'),
    });

    const validationResult = schema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: "Invalid removal request format",
          details: validationResult.error.issues
        },
        { status: 400 }
      );
    }

    const { boostIds, reason, action } = validationResult.data;

    // Get existing boosts
    const existingBoosts = await prisma.manualQualityBoost.findMany({
      where: {
        id: { in: boostIds },
      },
      include: {
        business: {
          select: {
            id: true,
            name: true,
            qualityScore: true,
          },
        },
      },
    });

    if (existingBoosts.length === 0) {
      return NextResponse.json(
        { error: "No boosts found with provided IDs" },
        { status: 404 }
      );
    }

    // Process removal/expiration in transaction
    const results = await prisma.$transaction(async (tx) => {
      const transactionResults = [];

      for (const boost of existingBoosts) {
        if (action === 'expire') {
          // Expire the boost (set expiry to now)
          await tx.manualQualityBoost.update({
            where: { id: boost.id },
            data: { 
              expiresAt: new Date(),
              updatedAt: new Date(),
            },
          });
        } else {
          // Remove the boost entirely
          await tx.manualQualityBoost.delete({
            where: { id: boost.id },
          });
        }

        // Recalculate business quality score without the boost
        const business = boost.business;
        const originalScore = business.qualityScore - boost.boostAmount;
        
        await tx.business.update({
          where: { id: business.id },
          data: { 
            qualityScore: Math.max(0, Math.min(100, originalScore)),
            updatedAt: new Date(),
          },
        });

        // Log the removal
        await adminService.logAdminAccess(
          `ADMIN_QUALITY_SCORING_BOOST_${action.toUpperCase()}`,
          business.id,
          user.id,
          {
            boostId: boost.id,
            businessName: business.name,
            removedBoostAmount: boost.boostAmount,
            previousScore: business.qualityScore,
            newScore: originalScore,
            reason,
            action,
            originalBoostReason: boost.reason,
            originalCategory: boost.category,
          },
          request.headers.get('x-forwarded-for') || 'unknown',
          request.headers.get('user-agent') || 'unknown'
        );

        transactionResults.push({
          boostId: boost.id,
          businessId: business.id,
          businessName: business.name,
          removedBoostAmount: boost.boostAmount,
          newScore: originalScore,
          action,
        });
      }

      return transactionResults;
    });

    return NextResponse.json({
      success: true,
      message: `Successfully ${action === 'expire' ? 'expired' : 'removed'} ${results.length} boost${results.length > 1 ? 's' : ''}`,
      results,
    });

  } catch (error) {
    console.error("Boost removal error:", error);

    return NextResponse.json(
      { error: "Failed to remove/expire boosts", message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * Get quality scoring configuration from database or defaults
 */
async function getQualityScoringConfig() {
  try {
    const configRecord = await prisma.featureFlag.findUnique({
      where: { key: 'quality-scoring-config' },
    });

    if (configRecord?.value && typeof configRecord.value === 'object') {
      return configRecord.value as any;
    }
  } catch (error) {
    console.warn('Failed to load quality scoring config:', error);
  }

  return {
    features: {
      enableManualBoosts: true,
      maxManualBoost: 20,
    },
  };
}