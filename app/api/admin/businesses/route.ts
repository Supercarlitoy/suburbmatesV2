import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser, isAdmin } from "@/server/auth/auth";
import { AdminBusinessService, type AdminBusinessFilters, type AdminBusinessOptions } from "@/lib/services/admin-business";
import { prisma } from "@/lib/database/prisma";

export async function GET(request: NextRequest) {
  try {
    // Check if user is admin
    const user = await getCurrentUser();
    if (!user || !(await isAdmin())) {
      return NextResponse.json(
        { error: "Unauthorized. Admin access required." },
        { status: 403 }
      );
    }

    // Initialize admin business service
    const adminService = new AdminBusinessService(prisma);

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') as any; // 'PENDING', 'APPROVED', 'REJECTED'
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const suburb = searchParams.get('suburb');
    const category = searchParams.get('category');
    const abnStatus = searchParams.get('abnStatus');
    const source = searchParams.get('source');
    const includeQualityScore = searchParams.get('includeQualityScore') === 'true';
    const includeDuplicates = searchParams.get('includeDuplicates') === 'true';
    const includeAIAnalysis = searchParams.get('includeAIAnalysis') === 'true';

    // Build filters
    const filters: AdminBusinessFilters = {};
    if (status) filters.status = status;
    if (suburb) filters.suburb = suburb;
    if (category) filters.category = category;
    if (abnStatus) filters.abnStatus = abnStatus;
    if (source) filters.source = source;

    // Build options
    const options: AdminBusinessOptions = {
      includeQualityScore,
      includeDuplicates,
      includeAIAnalysis,
      includeOwner: true,
      includeCustomization: true,
      includeLeads: true,
      includeInquiries: true
    };

    // Get businesses using service layer
    const { businesses: enhancedBusinesses, total } = await adminService.getBusinessesForAdmin(
      filters,
      options,
      limit,
      offset
    );

    // Get admin statistics if requested
    let stats;
    if (status === 'PENDING' || searchParams.get('includeStats') === 'true') {
      stats = await adminService.getAdminStats();
    }

    // Log admin access for audit
    await adminService.logAdminAccess(
      'ADMIN_BUSINESS_LIST_ACCESS',
      null,
      user?.id || null,
      {
        filters: { status, limit, offset, suburb, category, abnStatus, source },
        enhancements: { includeQualityScore, includeDuplicates, includeAIAnalysis },
        resultCount: enhancedBusinesses.length,
      },
      request.headers.get('x-forwarded-for') || 'unknown',
      request.headers.get('user-agent') || 'unknown'
    );

    const response = {
      success: true,
      businesses: enhancedBusinesses,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total
      },
      ...(stats && { stats }) // Include stats if available
    };

    return NextResponse.json(response);

  } catch (error: unknown) {
    console.error("Admin businesses fetch error:", error);

    // Log error for audit
    try {
      const user = await getCurrentUser();
      const adminService = new AdminBusinessService(prisma);
      await adminService.logAdminAccess(
        'ADMIN_BUSINESS_LIST_ERROR',
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
      { error: "Failed to fetch businesses", message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
