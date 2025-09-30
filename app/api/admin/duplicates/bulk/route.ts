import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser, isAdmin } from "@/server/auth/auth";
import { AdminBusinessService } from "@/lib/services/admin-business";
import { prisma } from "@/lib/database/prisma";

const BulkOperationSchema = z.object({
  operation: z.enum(['merge', 'unmark', 'mark_as_duplicate']),
  businessIds: z.array(z.string()),
  primaryBusinessId: z.string().optional(), // Required for merge operations
  reason: z.string().optional(),
  mergeStrategy: z.enum(['keep_primary', 'merge_data']).optional().default('keep_primary'),
  restoreApprovalStatus: z.enum(['APPROVED', 'PENDING', 'REJECTED']).optional().default('PENDING'),
});

/**
 * POST /api/admin/duplicates/bulk
 * Perform bulk operations on duplicate businesses
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
    const { operation, businessIds, primaryBusinessId, reason, mergeStrategy, restoreApprovalStatus } = BulkOperationSchema.parse(body);

    const adminService = new AdminBusinessService(prisma);

    // Validate businessIds exist
    if (businessIds.length === 0) {
      return NextResponse.json(
        { error: "No business IDs provided" },
        { status: 400 }
      );
    }

    if (operation === 'merge' && !primaryBusinessId) {
      return NextResponse.json(
        { error: "Primary business ID required for merge operations" },
        { status: 400 }
      );
    }

    if (operation === 'merge' && !businessIds.includes(primaryBusinessId!)) {
      return NextResponse.json(
        { error: "Primary business ID must be included in business IDs list" },
        { status: 400 }
      );
    }

    const results: any[] = [];
    let successCount = 0;
    let errorCount = 0;

    switch (operation) {
      case 'merge':
        try {
          // Validate primary business exists
          const primaryBusiness = await prisma.business.findUnique({
            where: { id: primaryBusinessId! },
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

          const duplicateBusinessIds = businessIds.filter(id => id !== primaryBusinessId);

          // Get duplicate businesses
          const duplicateBusinesses = await prisma.business.findMany({
            where: {
              id: { in: duplicateBusinessIds }
            },
            include: {
              inquiries: true,
              ownershipClaims: true,
            }
          });

          // Perform merge in transaction
          const mergeResult = await prisma.$transaction(async (tx) => {
            const mergedData: any = {};

            // Apply merge strategy
            if (mergeStrategy === 'merge_data') {
              duplicateBusinesses.forEach(duplicate => {
                if (!primaryBusiness.phone && duplicate.phone) mergedData.phone = duplicate.phone;
                if (!primaryBusiness.email && duplicate.email) mergedData.email = duplicate.email;
                if (!primaryBusiness.website && duplicate.website) mergedData.website = duplicate.website;
                if (!primaryBusiness.bio && duplicate.bio) mergedData.bio = duplicate.bio;
                if (!primaryBusiness.abn && duplicate.abn) mergedData.abn = duplicate.abn;
              });

              // Update primary business with merged data
              if (Object.keys(mergedData).length > 0) {
                await tx.business.update({
                  where: { id: primaryBusinessId! },
                  data: mergedData,
                });
              }
            }

            // Transfer related records
            for (const duplicate of duplicateBusinesses) {
              if (duplicate.inquiries.length > 0) {
                await tx.inquiry.updateMany({
                  where: { businessId: duplicate.id },
                  data: { businessId: primaryBusinessId! },
                });
              }

              if (duplicate.ownershipClaims.length > 0) {
                await tx.ownershipClaim.updateMany({
                  where: { businessId: duplicate.id },
                  data: { businessId: primaryBusinessId! },
                });
              }
            }

            // Mark duplicates as merged
            await tx.business.updateMany({
              where: {
                id: { in: duplicateBusinessIds }
              },
              data: {
                duplicateOfId: primaryBusinessId!,
                approvalStatus: 'REJECTED',
              }
            });

            return {
              primaryBusinessId: primaryBusinessId!,
              mergedBusinessIds: duplicateBusinessIds,
              mergedData,
              inquiriesTransferred: duplicateBusinesses.reduce((sum, b) => sum + b.inquiries.length, 0),
              claimsTransferred: duplicateBusinesses.reduce((sum, b) => sum + b.ownershipClaims.length, 0),
            };
          });

          results.push({
            operation: 'merge',
            success: true,
            result: mergeResult,
          });
          successCount++;

        } catch (error) {
          results.push({
            operation: 'merge',
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
          });
          errorCount++;
        }
        break;

      case 'unmark':
        for (const businessId of businessIds) {
          try {
            const business = await prisma.business.findUnique({
              where: { id: businessId },
              select: {
                id: true,
                name: true,
                duplicateOfId: true,
                approvalStatus: true,
              },
            });

            if (!business) {
              results.push({
                businessId,
                success: false,
                error: 'Business not found',
              });
              errorCount++;
              continue;
            }

            if (!business.duplicateOfId) {
              results.push({
                businessId,
                success: false,
                error: 'Business is not marked as duplicate',
              });
              errorCount++;
              continue;
            }

            const originalState = {
              duplicateOfId: business.duplicateOfId,
              approvalStatus: business.approvalStatus,
            };

            await prisma.business.update({
              where: { id: businessId },
              data: {
                duplicateOfId: null,
                approvalStatus: restoreApprovalStatus,
              },
            });

            results.push({
              businessId,
              success: true,
              originalState,
              newState: {
                duplicateOfId: null,
                approvalStatus: restoreApprovalStatus,
              },
            });
            successCount++;

          } catch (error) {
            results.push({
              businessId,
              success: false,
              error: error instanceof Error ? error.message : 'Unknown error',
            });
            errorCount++;
          }
        }
        break;

      case 'mark_as_duplicate':
        if (!primaryBusinessId) {
          return NextResponse.json(
            { error: "Primary business ID required for mark_as_duplicate operation" },
            { status: 400 }
          );
        }

        for (const businessId of businessIds) {
          if (businessId === primaryBusinessId) continue; // Skip primary business

          try {
            const business = await prisma.business.findUnique({
              where: { id: businessId },
              select: {
                id: true,
                name: true,
                duplicateOfId: true,
                approvalStatus: true,
              },
            });

            if (!business) {
              results.push({
                businessId,
                success: false,
                error: 'Business not found',
              });
              errorCount++;
              continue;
            }

            const originalState = {
              duplicateOfId: business.duplicateOfId,
              approvalStatus: business.approvalStatus,
            };

            await prisma.business.update({
              where: { id: businessId },
              data: {
                duplicateOfId: primaryBusinessId,
                approvalStatus: 'REJECTED',
              },
            });

            results.push({
              businessId,
              success: true,
              originalState,
              newState: {
                duplicateOfId: primaryBusinessId,
                approvalStatus: 'REJECTED',
              },
            });
            successCount++;

          } catch (error) {
            results.push({
              businessId,
              success: false,
              error: error instanceof Error ? error.message : 'Unknown error',
            });
            errorCount++;
          }
        }
        break;
    }

    // Log bulk operation
    await adminService.logAdminAccess(
      'ADMIN_BULK_DUPLICATE_OPERATION',
      null,
      user.id,
      {
        operation,
        businessIds,
        primaryBusinessId,
        reason,
        mergeStrategy,
        restoreApprovalStatus,
        results: {
          total: businessIds.length,
          success: successCount,
          errors: errorCount,
        },
      },
      request.headers.get('x-forwarded-for') || 'unknown',
      request.headers.get('user-agent') || 'unknown'
    );

    return NextResponse.json({
      success: true,
      message: `Bulk ${operation} operation completed: ${successCount} successful, ${errorCount} failed`,
      summary: {
        operation,
        total: businessIds.length,
        successful: successCount,
        failed: errorCount,
      },
      results,
    });

  } catch (error) {
    console.error("Bulk duplicate operation error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid bulk operation request", details: error.errors },
        { status: 400 }
      );
    }

    // Log error for audit
    try {
      const user = await getCurrentUser();
      const adminService = new AdminBusinessService(prisma);
      await adminService.logAdminAccess(
        'ADMIN_BULK_DUPLICATE_OPERATION_ERROR',
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
      { error: "Failed to perform bulk duplicate operation", message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}