import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser, isAdmin } from "@/server/auth/auth";
import { findDuplicates, isStrictDuplicate, isLooseDuplicate } from "@/lib/services/duplicate-detection";
import { AdminBusinessService } from "@/lib/services/admin-business";
import { prisma } from "@/lib/database/prisma";

const DuplicateQuerySchema = z.object({
  mode: z.enum(['strict', 'loose']).optional().default('strict'),
  limit: z.string().transform(val => parseInt(val)).optional().default(50),
  offset: z.string().transform(val => parseInt(val)).optional().default(0),
  suburb: z.string().optional(),
  category: z.string().optional(),
  resolved: z.enum(['true', 'false']).optional(),
});

interface DuplicateGroup {
  id: string;
  businesses: any[];
  duplicateType: 'strict' | 'loose';
  confidence: 'high' | 'medium';
  createdAt: Date;
  resolved: boolean;
  mergedInto?: string;
}

/**
 * GET /api/admin/duplicates
 * List all duplicate groups with filtering and pagination
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
    const { mode, limit, offset, suburb, category, resolved } = DuplicateQuerySchema.parse({
      mode: searchParams.get('mode'),
      limit: searchParams.get('limit'),
      offset: searchParams.get('offset'),
      suburb: searchParams.get('suburb'),
      category: searchParams.get('category'),
      resolved: searchParams.get('resolved'),
    });

    const adminService = new AdminBusinessService(prisma);

    // Build filters for businesses
    const businessFilters: any = {};
    if (suburb) businessFilters.suburb = { contains: suburb, mode: 'insensitive' };
    if (category) businessFilters.category = category;

    // Get businesses to check for duplicates
    const businesses = await prisma.business.findMany({
      where: {
        ...businessFilters,
        duplicateOfId: resolved === 'false' ? null : undefined, // Filter by resolution status
      },
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
      },
      orderBy: { createdAt: 'desc' },
      take: limit * 2, // Get more to account for filtering
      skip: offset,
    });

    // Find duplicate groups
    const duplicateGroups: DuplicateGroup[] = [];
    const processedIds = new Set<string>();

    for (const business of businesses) {
      if (processedIds.has(business.id)) continue;

      // Find duplicates for this business
      const duplicates = await findDuplicates({
        name: business.name,
        phone: business.phone || undefined,
        website: business.website || undefined,
        suburb: business.suburb,
        email: business.email || undefined,
      }, prisma, mode, business.id);

      if (duplicates.length > 0) {
        // Create duplicate group
        const group: DuplicateGroup = {
          id: `group-${business.id}`,
          businesses: [business, ...duplicates],
          duplicateType: mode,
          confidence: mode === 'strict' ? 'high' : 'medium',
          createdAt: business.createdAt,
          resolved: business.duplicateOfId !== null,
          mergedInto: business.duplicateOfId || undefined,
        };

        duplicateGroups.push(group);

        // Mark all businesses in this group as processed
        processedIds.add(business.id);
        duplicates.forEach(dup => processedIds.add(dup.id));
      }
    }

    // Apply pagination to groups
    const paginatedGroups = duplicateGroups.slice(0, limit);

    // Get statistics
    const stats = {
      totalGroups: duplicateGroups.length,
      unresolvedGroups: duplicateGroups.filter(g => !g.resolved).length,
      strictDuplicates: duplicateGroups.filter(g => g.duplicateType === 'strict').length,
      looseDuplicates: duplicateGroups.filter(g => g.duplicateType === 'loose').length,
    };

    // Log admin access
    await adminService.logAdminAccess(
      'ADMIN_DUPLICATES_LIST_ACCESS',
      null,
      user.id,
      {
        filters: { mode, suburb, category, resolved },
        resultCount: paginatedGroups.length,
        stats,
      },
      request.headers.get('x-forwarded-for') || 'unknown',
      request.headers.get('user-agent') || 'unknown'
    );

    return NextResponse.json({
      success: true,
      duplicateGroups: paginatedGroups,
      pagination: {
        total: duplicateGroups.length,
        limit,
        offset,
        hasMore: offset + limit < duplicateGroups.length,
      },
      stats,
    });

  } catch (error) {
    console.error("Admin duplicates fetch error:", error);

    // Log error for audit
    try {
      const user = await getCurrentUser();
      const adminService = new AdminBusinessService(prisma);
      await adminService.logAdminAccess(
        'ADMIN_DUPLICATES_LIST_ERROR',
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
      { error: "Failed to fetch duplicates", message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

const MergeRequestSchema = z.object({
  primaryBusinessId: z.string(),
  duplicateBusinessIds: z.array(z.string()),
  mergeStrategy: z.enum(['keep_primary', 'merge_data', 'manual']).default('keep_primary'),
  preserveFields: z.array(z.string()).optional(),
  reason: z.string().optional(),
});

/**
 * POST /api/admin/duplicates/merge
 * Merge duplicate businesses
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
    const { primaryBusinessId, duplicateBusinessIds, mergeStrategy, preserveFields, reason } = MergeRequestSchema.parse(body);

    const adminService = new AdminBusinessService(prisma);

    // Validate that primary business exists
    const primaryBusiness = await prisma.business.findUnique({
      where: { id: primaryBusinessId },
      include: {
        inquiries: true,
        ownershipClaims: true,
      }
    });

    if (!primaryBusiness) {
      return NextResponse.json(
        { error: "Primary business not found" },
        { status: 404 }
      );
    }

    // Validate duplicate businesses exist
    const duplicateBusinesses = await prisma.business.findMany({
      where: {
        id: { in: duplicateBusinessIds }
      },
      include: {
        inquiries: true,
        ownershipClaims: true,
      }
    });

    if (duplicateBusinesses.length !== duplicateBusinessIds.length) {
      return NextResponse.json(
        { error: "Some duplicate businesses not found" },
        { status: 404 }
      );
    }

    // Perform merge operation in transaction
    const mergeResult = await prisma.$transaction(async (tx) => {
      const mergedData: any = {};

      // Apply merge strategy
      if (mergeStrategy === 'merge_data') {
        // Merge data from duplicates into primary business
        duplicateBusinesses.forEach(duplicate => {
          if (!primaryBusiness.phone && duplicate.phone) mergedData.phone = duplicate.phone;
          if (!primaryBusiness.email && duplicate.email) mergedData.email = duplicate.email;
          if (!primaryBusiness.website && duplicate.website) mergedData.website = duplicate.website;
          if (!primaryBusiness.bio && duplicate.bio) mergedData.bio = duplicate.bio;
          if (!primaryBusiness.abn && duplicate.abn) mergedData.abn = duplicate.abn;
        });
      }

      // Update primary business with merged data
      if (Object.keys(mergedData).length > 0) {
        await tx.business.update({
          where: { id: primaryBusinessId },
          data: mergedData,
        });
      }

      // Transfer inquiries and claims to primary business
      for (const duplicate of duplicateBusinesses) {
        if (duplicate.inquiries.length > 0) {
          await tx.inquiry.updateMany({
            where: { businessId: duplicate.id },
            data: { businessId: primaryBusinessId },
          });
        }

        if (duplicate.ownershipClaims.length > 0) {
          await tx.ownershipClaim.updateMany({
            where: { businessId: duplicate.id },
            data: { businessId: primaryBusinessId },
          });
        }
      }

      // Mark duplicates as merged
      await tx.business.updateMany({
        where: {
          id: { in: duplicateBusinessIds }
        },
        data: {
          duplicateOfId: primaryBusinessId,
          approvalStatus: 'REJECTED', // Mark as inactive
        }
      });

      return {
        primaryBusinessId,
        mergedBusinessIds: duplicateBusinessIds,
        mergedData,
        inquiriesTransferred: duplicateBusinesses.reduce((sum, b) => sum + b.inquiries.length, 0),
        claimsTransferred: duplicateBusinesses.reduce((sum, b) => sum + b.ownershipClaims.length, 0),
      };
    });

    // Log merge action
    await adminService.logAdminAccess(
      'ADMIN_MERGE_DUPLICATES',
      primaryBusinessId,
      user.id,
      {
        primaryBusinessId,
        duplicateBusinessIds,
        mergeStrategy,
        mergeResult,
        reason,
      },
      request.headers.get('x-forwarded-for') || 'unknown',
      request.headers.get('user-agent') || 'unknown'
    );

    return NextResponse.json({
      success: true,
      message: `Successfully merged ${duplicateBusinessIds.length} duplicate businesses`,
      result: mergeResult,
    });

  } catch (error) {
    console.error("Duplicate merge error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid merge request", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to merge duplicates", message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}