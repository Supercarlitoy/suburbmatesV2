import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser, isAdmin } from "@/server/auth/auth";
import { findDuplicates } from "@/lib/services/duplicate-detection";
import { AdminBusinessService } from "@/lib/services/admin-business";
import { prisma } from "@/lib/database/prisma";

interface RouteParams {
  params: Promise<{
    businessId: string;
  }>;
}

const DetectionQuerySchema = z.object({
  mode: z.enum(['strict', 'loose']).optional().default('strict'),
  includeResolved: z.enum(['true', 'false']).optional().default('false'),
});

/**
 * GET /api/admin/duplicates/detect/[businessId]
 * Detect duplicates for a specific business
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

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const { mode, includeResolved } = DetectionQuerySchema.parse({
      mode: searchParams.get('mode'),
      includeResolved: searchParams.get('includeResolved'),
    });

    const adminService = new AdminBusinessService(prisma);

    // Get the target business
    const business = await prisma.business.findUnique({
      where: { id: businessId },
      select: {
        id: true,
        name: true,
        phone: true,
        website: true,
        suburb: true,
        email: true,
        category: true,
        approvalStatus: true,
        qualityScore: true,
        createdAt: true,
        duplicateOfId: true,
        abn: true,
      },
    });

    if (!business) {
      return NextResponse.json(
        { error: "Business not found" },
        { status: 404 }
      );
    }

    // Find duplicates
    const duplicates = await findDuplicates({
      name: business.name,
      phone: business.phone || undefined,
      website: business.website || undefined,
      suburb: business.suburb,
      email: business.email || undefined,
    }, prisma, mode, business.id);

    // Filter out resolved duplicates if not requested
    const filteredDuplicates = includeResolved === 'true' 
      ? duplicates 
      : duplicates.filter(dup => !dup.duplicateOfId);

    // Calculate confidence scores and reasons
    const analysisResults = filteredDuplicates.map(duplicate => {
      const matches: string[] = [];
      let confidence = 0;

      // Check exact matches
      if (business.phone && duplicate.phone === business.phone) {
        matches.push('phone');
        confidence += 30;
      }
      if (business.website && duplicate.website === business.website) {
        matches.push('website');
        confidence += 25;
      }
      if (business.email && duplicate.email === business.email) {
        matches.push('email');
        confidence += 20;
      }
      if (business.abn && duplicate.abn === business.abn) {
        matches.push('abn');
        confidence += 35;
      }

      // Name similarity
      if (business.name.toLowerCase() === duplicate.name.toLowerCase()) {
        matches.push('exact_name');
        confidence += 20;
      }

      // Suburb match
      if (business.suburb === duplicate.suburb) {
        matches.push('suburb');
        confidence += 10;
      }

      return {
        ...duplicate,
        analysisResult: {
          confidence: Math.min(confidence, 100),
          matches,
          duplicateType: mode,
          recommendation: confidence >= 80 ? 'merge' : confidence >= 50 ? 'review' : 'ignore',
        },
      };
    });

    // Sort by confidence
    analysisResults.sort((a, b) => b.analysisResult.confidence - a.analysisResult.confidence);

    // Log detection access
    await adminService.logAdminAccess(
      'ADMIN_DUPLICATE_DETECTION',
      businessId,
      user.id,
      {
        targetBusiness: {
          id: business.id,
          name: business.name,
          suburb: business.suburb,
        },
        mode,
        duplicatesFound: analysisResults.length,
        highConfidence: analysisResults.filter(d => d.analysisResult.confidence >= 80).length,
        includeResolved: includeResolved === 'true',
      },
      request.headers.get('x-forwarded-for') || 'unknown',
      request.headers.get('user-agent') || 'unknown'
    );

    return NextResponse.json({
      success: true,
      business,
      duplicates: analysisResults,
      summary: {
        totalFound: analysisResults.length,
        highConfidence: analysisResults.filter(d => d.analysisResult.confidence >= 80).length,
        mediumConfidence: analysisResults.filter(d => d.analysisResult.confidence >= 50 && d.analysisResult.confidence < 80).length,
        lowConfidence: analysisResults.filter(d => d.analysisResult.confidence < 50).length,
        recommendMerge: analysisResults.filter(d => d.analysisResult.recommendation === 'merge').length,
      },
      detectionMode: mode,
    });

  } catch (error) {
    console.error("Duplicate detection error:", error);

    // Log error for audit
    try {
      const user = await getCurrentUser();
      const adminService = new AdminBusinessService(prisma);
      await adminService.logAdminAccess(
        'ADMIN_DUPLICATE_DETECTION_ERROR',
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
      { error: "Failed to detect duplicates", message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}