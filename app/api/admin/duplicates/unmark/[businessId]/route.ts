import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser, isAdmin } from "@/server/auth/auth";
import { AdminBusinessService } from "@/lib/services/admin-business";
import { prisma } from "@/lib/database/prisma";

interface RouteParams {
  params: Promise<{
    businessId: string;
  }>;
}

const UnmarkRequestSchema = z.object({
  reason: z.string().optional(),
  restoreApprovalStatus: z.enum(['APPROVED', 'PENDING', 'REJECTED']).optional().default('PENDING'),
});

/**
 * DELETE /api/admin/duplicates/unmark/[businessId]
 * Remove duplicate marking from a business
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
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
    
    // Parse request body
    let requestData: z.infer<typeof UnmarkRequestSchema> = {};
    try {
      const body = await request.json();
      requestData = UnmarkRequestSchema.parse(body);
    } catch (parseError) {
      // If no body or invalid JSON, use defaults
    }

    const { reason, restoreApprovalStatus } = requestData;

    const adminService = new AdminBusinessService(prisma);

    // Get the business to unmark
    const business = await prisma.business.findUnique({
      where: { id: businessId },
      select: {
        id: true,
        name: true,
        suburb: true,
        duplicateOfId: true,
        approvalStatus: true,
        source: true,
      },
    });

    if (!business) {
      return NextResponse.json(
        { error: "Business not found" },
        { status: 404 }
      );
    }

    if (!business.duplicateOfId) {
      return NextResponse.json(
        { error: "Business is not marked as a duplicate" },
        { status: 400 }
      );
    }

    // Store original state for audit
    const originalState = {
      duplicateOfId: business.duplicateOfId,
      approvalStatus: business.approvalStatus,
    };

    // Remove duplicate marking and restore approval status
    const updatedBusiness = await prisma.business.update({
      where: { id: businessId },
      data: {
        duplicateOfId: null,
        approvalStatus: restoreApprovalStatus,
      },
      select: {
        id: true,
        name: true,
        suburb: true,
        duplicateOfId: true,
        approvalStatus: true,
        qualityScore: true,
      },
    });

    // Log unmark action
    await adminService.logAdminAccess(
      'ADMIN_UNMARK_DUPLICATE',
      businessId,
      user.id,
      {
        businessName: business.name,
        originalState,
        newState: {
          duplicateOfId: null,
          approvalStatus: restoreApprovalStatus,
        },
        restoreApprovalStatus,
        reason,
      },
      request.headers.get('x-forwarded-for') || 'unknown',
      request.headers.get('user-agent') || 'unknown'
    );

    return NextResponse.json({
      success: true,
      message: `Successfully removed duplicate marking from ${business.name}`,
      business: updatedBusiness,
      changes: {
        duplicateOfId: {
          from: originalState.duplicateOfId,
          to: null,
        },
        approvalStatus: {
          from: originalState.approvalStatus,
          to: restoreApprovalStatus,
        },
      },
    });

  } catch (error) {
    console.error("Unmark duplicate error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid unmark request", details: error.errors },
        { status: 400 }
      );
    }

    // Log error for audit
    try {
      const user = await getCurrentUser();
      const adminService = new AdminBusinessService(prisma);
      await adminService.logAdminAccess(
        'ADMIN_UNMARK_DUPLICATE_ERROR',
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
      { error: "Failed to unmark duplicate", message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/duplicates/unmark/[businessId]
 * Alternative endpoint for removing duplicate marking (for compatibility)
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  return DELETE(request, { params });
}