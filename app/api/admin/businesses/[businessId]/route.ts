import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/database/prisma';
import { createClient } from '@/lib/supabase/server';
import { logAuditEvent } from '@/lib/utils/audit';
import { checkAdminAccess } from '@/lib/auth/checkAdminAccess';
import { adminApproveBusiness, adminRejectBusiness } from '@/lib/services/approval-workflow';
import { AdminBusinessService } from '@/lib/services/admin-business';

// Schema for updating business details
const BusinessUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  website: z.string().url().optional(),
  abn: z.string().optional(),
  bio: z.string().optional(),
  category: z.string().optional(),
  approvalStatus: z.enum(['PENDING', 'APPROVED', 'REJECTED']).optional(),
  abnStatus: z.enum(['NOT_PROVIDED', 'PENDING', 'VERIFIED', 'INVALID', 'EXPIRED']).optional(),
  requiresVerification: z.boolean().optional(),
  qualityScore: z.number().min(0).max(100).optional(),
});

/**
 * GET /api/admin/businesses/[businessId]
 * Get detailed business information for admin review
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ businessId: string }> }
) {
  try {
    // Check admin authentication
    const supabase = await createClient();
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    
    if (authError || !session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Check if user is admin
    const isAdmin = await checkAdminAccess(session.user.id);
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const { businessId } = await params;

    // Initialize admin business service
    const adminService = new AdminBusinessService(prisma);

    // Get business with full service layer enhancement
    const enhancedBusiness = await adminService.getBusinessForAdmin(businessId, {
      includeQualityScore: true,
      includeDuplicates: true,
      includeAIAnalysis: true,
      includeOwner: true,
      includeCustomization: true,
      includeLeads: true,
      includeInquiries: true
    });

    if (!enhancedBusiness) {
      return NextResponse.json(
        { error: 'Business not found' },
        { status: 404 }
      );
    }

    // Get additional admin-specific data (ownership claims, audit logs)
    const additionalData = await prisma.business.findUnique({
      where: { id: businessId },
      select: {
        slug: true,
        requiresVerification: true,
        ownershipClaims: {
          orderBy: { createdAt: 'desc' }
        },
        auditLogs: {
          take: 20,
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    // Merge additional data with enhanced business
    const fullBusinessData = {
      ...enhancedBusiness,
      slug: additionalData?.slug,
      requiresVerification: additionalData?.requiresVerification,
      ownershipClaims: additionalData?.ownershipClaims || [],
      auditLogs: additionalData?.auditLogs || []
    };

    // Log admin access for audit
    await adminService.logAdminAccess(
      'ADMIN_BUSINESS_DETAIL_ACCESS',
      businessId,
      session.user.id,
      {
        businessName: enhancedBusiness.name,
        businessStatus: enhancedBusiness.approvalStatus,
        includeQualityScore: true,
        includeDuplicates: true,
        includeAIAnalysis: true
      },
      request.headers.get('x-forwarded-for') || 'unknown',
      request.headers.get('user-agent') || 'unknown'
    );

    return NextResponse.json({
      success: true,
      data: {
        business: fullBusinessData
      }
    });

  } catch (error) {
    console.error('Admin business fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch business details' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/businesses/[businessId]
 * Update business details (admin only)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ businessId: string }> }
) {
  try {
    // Check admin authentication
    const supabase = await createClient();
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    
    if (authError || !session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Check if user is admin
    const isAdmin = await checkAdminAccess(session.user.id);
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const { businessId } = await params;

  // Parse and validate request body
  const body = await request.json();
  
  // Handle simple action-based requests
  if (body.action) {
    const { action } = body;
    if (!['approve', 'reject', 'delete'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    // Get current business for audit logging
    const currentBusiness = await prisma.business.findUnique({
      where: { id: businessId },
      select: { id: true, name: true, approvalStatus: true }
    });

    if (!currentBusiness) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 });
    }

    let result;
    switch (action) {
        case 'approve':
        await adminApproveBusiness(businessId, session.user.id, body.notes);
        result = await prisma.business.findUnique({ 
          where: { id: businessId },
          include: { owner: { select: { id: true, email: true, role: true } } }
        });
        break;
      case 'reject':
        const rejectionReason = body.reason || 'Admin rejection';
        await adminRejectBusiness(businessId, session.user.id, rejectionReason, body.notes);
        result = await prisma.business.findUnique({ 
          where: { id: businessId },
          include: { owner: { select: { id: true, email: true, role: true } } }
        });
        break;
      case 'delete':
        // Handle cascading deletes
        await prisma.$transaction(async (tx) => {
          await tx.auditLog.deleteMany({ where: { target: businessId } });
          await tx.inquiry.deleteMany({ where: { businessId } });
          await tx.ownershipClaim.deleteMany({ where: { businessId } });
          result = await tx.business.delete({ where: { id: businessId } });
        });
        break;
    }

    // Log audit event
    await logAuditEvent({
      actorId: session.user.id,
      action: `ADMIN_${action.toUpperCase()}_BUSINESS`,
      target: action === 'delete' ? undefined : businessId,
      meta: {
        businessId,
        businessName: currentBusiness.name,
        previousStatus: currentBusiness.approvalStatus,
        adminUserId: session.user.id,
      },
      ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
    });

    return NextResponse.json({
      success: true,
      message: `Successfully ${action}ed business "${currentBusiness.name}"`,
      business: action === 'delete' ? null : result,
    });
  }

  // Handle detailed field updates
  const validatedData = BusinessUpdateSchema.parse(body);

    // Get current business state
    const currentBusiness = await prisma.business.findUnique({
      where: { id: businessId }
    });

    if (!currentBusiness) {
      return NextResponse.json(
        { error: 'Business not found' },
        { status: 404 }
      );
    }

    // Update business
    const updatedBusiness = await prisma.business.update({
      where: { id: businessId },
      data: {
        ...validatedData,
        updatedAt: new Date(),
      },
      include: {
        owner: {
          select: {
            id: true,
            email: true,
            role: true,
          }
        },
        customization: true,
      }
    });

    // Log audit event for admin changes
    await logAuditEvent({
      actorId: session.user.id,
      action: 'ADMIN_UPDATE_BUSINESS',
      target: businessId,
      meta: {
        businessName: updatedBusiness.name,
        changes: validatedData,
        previousState: {
          approvalStatus: currentBusiness.approvalStatus,
          abnStatus: currentBusiness.abnStatus,
          requiresVerification: currentBusiness.requiresVerification,
          qualityScore: currentBusiness.qualityScore,
        },
        adminUserId: session.user.id,
      },
      ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
    });

    return NextResponse.json({
      success: true,
      message: 'Business updated successfully',
      data: {
        business: {
          id: updatedBusiness.id,
          slug: updatedBusiness.slug,
          name: updatedBusiness.name,
          email: updatedBusiness.email,
          phone: updatedBusiness.phone,
          website: updatedBusiness.website,
          abn: updatedBusiness.abn,
          bio: updatedBusiness.bio,
          suburb: updatedBusiness.suburb,
          category: updatedBusiness.category,
          approvalStatus: updatedBusiness.approvalStatus,
          abnStatus: updatedBusiness.abnStatus,
          requiresVerification: updatedBusiness.requiresVerification,
          qualityScore: updatedBusiness.qualityScore,
          source: updatedBusiness.source,
          updatedAt: updatedBusiness.updatedAt,
          owner: updatedBusiness.owner,
          customization: updatedBusiness.customization,
        }
      }
    });

  } catch (error) {
    console.error('Admin business update error:', error);

    // Handle validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message,
          })),
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update business' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/businesses/[businessId]
 * Delete a business (admin only)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ businessId: string }> }
) {
  try {
    // Check admin authentication
    const supabase = await createClient();
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    
    if (authError || !session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Check if user is admin
    const isAdmin = await checkAdminAccess(session.user.id);
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const { businessId } = await params;

    // Get business for audit log
    const business = await prisma.business.findUnique({
      where: { id: businessId },
      select: { id: true, name: true, email: true, ownerId: true }
    });

    if (!business) {
      return NextResponse.json(
        { error: 'Business not found' },
        { status: 404 }
      );
    }

    // Delete business (cascade will handle related records)
    await prisma.business.delete({
      where: { id: businessId }
    });

    // Log audit event
    await logAuditEvent({
      actorId: session.user.id,
      action: 'ADMIN_DELETE_BUSINESS',
      target: businessId,
      meta: {
        businessName: business.name,
        businessEmail: business.email,
        businessOwnerId: business.ownerId,
        deletedBy: session.user.id,
        deletedAt: new Date().toISOString(),
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Business deleted successfully',
    });

  } catch (error) {
    console.error('Admin business deletion error:', error);
    return NextResponse.json(
      { error: 'Failed to delete business' },
      { status: 500 }
    );
  }
}