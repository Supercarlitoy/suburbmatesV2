import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser, isAdmin } from "@/server/auth/auth";
import { adminApproveBusiness, adminRejectBusiness } from "@/lib/services/approval-workflow";
import { logAuditEvent } from "@/lib/utils/audit";
import { z } from "zod";

const ApprovalSchema = z.object({
  businessId: z.string(),
  action: z.enum(['approve', 'reject']),
  reason: z.string().optional(),
  notes: z.string().optional()
});

export async function POST(request: NextRequest) {
  try {
    // Check if user is admin
    const user = await getCurrentUser();
    if (!user || !(await isAdmin())) {
      return NextResponse.json(
        { error: "Unauthorized. Admin access required." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { businessId, action, reason, notes } = ApprovalSchema.parse(body);

    // Use service layer for business approval/rejection
    if (action === 'approve') {
      await adminApproveBusiness(businessId, user.id, notes);
      
      // Log admin approval action for audit
      await logAuditEvent({
        actorId: user.id,
        action: 'ADMIN_APPROVE_BUSINESS_ROUTE',
        target: businessId,
        meta: {
          adminNotes: notes,
          approvedVia: 'admin_approve_route',
        },
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
      });
      
    } else if (action === 'reject') {
      if (!reason) {
        return NextResponse.json(
          { error: "Rejection reason is required" },
          { status: 400 }
        );
      }
      
      await adminRejectBusiness(businessId, user.id, reason, notes);
      
      // Log admin rejection action for audit
      await logAuditEvent({
        actorId: user.id,
        action: 'ADMIN_REJECT_BUSINESS_ROUTE',
        target: businessId,
        meta: {
          rejectionReason: reason,
          adminNotes: notes,
          rejectedVia: 'admin_approve_route',
        },
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
      });
    }

    return NextResponse.json({
      success: true,
      message: `Business ${action}d successfully using service layer`,
      action,
      businessId,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error("Business approval error:", error);

    // Log error for audit
    try {
      const user = await getCurrentUser();
      await logAuditEvent({
        actorId: user?.id || 'unknown',
        action: 'ADMIN_APPROVAL_ERROR',
        target: undefined,
        meta: {
          error: error instanceof Error ? error.message : 'Unknown error',
          errorType: 'admin_approval_route_error',
        },
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
      });
    } catch (auditError) {
      console.error('Failed to log audit event:', auditError);
    }

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.errors },
        { status: 400 }
      );
    }

    // Handle business not found error from service layer
    if (error instanceof Error && error.message.includes('not found')) {
      return NextResponse.json(
        { error: "Business not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: "Failed to process approval" },
      { status: 500 }
    );
  }
}
