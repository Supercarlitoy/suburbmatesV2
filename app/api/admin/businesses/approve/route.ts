import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { adminApproveBusiness, adminRejectBusiness, getPendingBusinessesForReview, getApprovalQueueStats } from '@/lib/services/approval-workflow';
import { checkAdminAccess } from '@/lib/auth/checkAdminAccess';

// Schema for approval action
const ApprovalActionSchema = z.object({
  businessId: z.string().min(1),
  action: z.enum(['approve', 'reject']),
  reason: z.string().optional(),
  notes: z.string().optional(),
});

/**
 * GET /api/admin/businesses/approve
 * Get businesses pending approval and queue statistics
 */
export async function GET(request: NextRequest) {
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

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Get pending businesses and statistics
    const [pendingBusinesses, stats] = await Promise.all([
      getPendingBusinessesForReview(limit, offset),
      getApprovalQueueStats(),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        businesses: pendingBusinesses.map(business => ({
          id: business.id,
          name: business.name,
          email: business.email,
          phone: business.phone,
          website: business.website,
          abn: business.abn,
          bio: business.bio,
          suburb: business.suburb,
          category: business.category,
          approvalStatus: business.approvalStatus,
          abnStatus: business.abnStatus,
          requiresVerification: business.requiresVerification,
          qualityScore: business.qualityScore,
          source: business.source,
          createdAt: business.createdAt,
          owner: business.owner ? {
            id: business.owner.id,
            email: business.owner.email,
            role: business.owner.role,
          } : null,
        })),
        stats,
        pagination: {
          limit,
          offset,
          hasMore: pendingBusinesses.length === limit,
        },
      },
    });

  } catch (error) {
    console.error('Admin approval queue error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch approval queue' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/businesses/approve
 * Approve or reject a business
 */
export async function POST(request: NextRequest) {
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

    // Parse and validate request body
    const body = await request.json();
    const validatedData = ApprovalActionSchema.parse(body);

    // Perform approval or rejection action
    if (validatedData.action === 'approve') {
      await adminApproveBusiness(
        validatedData.businessId,
        session.user.id,
        validatedData.notes
      );
      
      return NextResponse.json({
        success: true,
        message: 'Business approved successfully',
      });
      
    } else if (validatedData.action === 'reject') {
      if (!validatedData.reason) {
        return NextResponse.json(
          { error: 'Rejection reason is required' },
          { status: 400 }
        );
      }
      
      await adminRejectBusiness(
        validatedData.businessId,
        session.user.id,
        validatedData.reason,
        validatedData.notes
      );
      
      return NextResponse.json({
        success: true,
        message: 'Business rejected successfully',
      });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Admin approval action error:', error);

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

    // Handle business not found
    if (error instanceof Error && error.message.includes('not found')) {
      return NextResponse.json(
        { error: 'Business not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to process approval action' },
      { status: 500 }
    );
  }
}