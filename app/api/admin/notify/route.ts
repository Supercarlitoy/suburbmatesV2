import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { adminNotificationService } from "@/lib/services/admin-notification";
import { getCurrentUser } from "@/server/auth/auth";

const AdminNotifySchema = z.object({
  type: z.enum(['new_business', 'business_update', 'claim_submitted', 'quality_alert', 'duplicate_detected']),
  businessId: z.string(),
  businessName: z.string(),
  email: z.string().email().optional(),
  suburb: z.string().optional(),
  additionalData: z.record(z.any()).optional()
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, businessId, businessName, email, suburb, additionalData } = AdminNotifySchema.parse(body);

    // Get current user for audit logging (if available)
    const user = await getCurrentUser().catch(() => null);
    
    // Get request metadata for audit logging
    const ipAddress = request.headers.get('x-forwarded-for') || 'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Use the notification service based on notification type
    let notificationResult;

    switch (type) {
      case 'new_business':
        notificationResult = await adminNotificationService.notifyNewBusinessRegistration({
          businessId,
          businessName,
          email,
          suburb,
          adminUserId: user?.id,
          ipAddress,
          userAgent
        });
        break;
        
      case 'claim_submitted':
        notificationResult = await adminNotificationService.notifyClaimSubmitted({
          businessId,
          businessName,
          claimantEmail: email,
          suburb,
          claimId: additionalData?.claimId as string,
          adminUserId: user?.id,
          ipAddress,
          userAgent
        });
        break;
        
      case 'quality_alert':
        notificationResult = await adminNotificationService.notifyQualityAlert({
          businessId,
          businessName,
          qualityScore: additionalData?.qualityScore as number || 0,
          issue: additionalData?.issue as string || 'Quality issue detected',
          adminUserId: user?.id,
          ipAddress,
          userAgent
        });
        break;
        
      case 'duplicate_detected':
        notificationResult = await adminNotificationService.notifyDuplicateDetected({
          businessId,
          businessName,
          duplicateType: additionalData?.duplicateType as 'strict' | 'loose' || 'loose',
          duplicateCount: additionalData?.count as number || 1,
          confidence: additionalData?.confidence as string || 'Medium',
          adminUserId: user?.id,
          ipAddress,
          userAgent
        });
        break;
        
      case 'business_update':
      default:
        // Generic notification for other types
        notificationResult = await adminNotificationService.sendNotification({
          type: 'BUSINESS_UPDATE',
          businessId,
          businessName,
          email,
          suburb,
          additionalData,
          adminUserId: user?.id,
          ipAddress,
          userAgent
        });
        break;
    }
    
    if (!notificationResult.success) {
      console.warn('Admin notification partially failed:', notificationResult.error);
    }

    return NextResponse.json({
      success: true,
      emailSent: notificationResult.emailSent,
      auditLogged: notificationResult.auditLogged,
      message: "Admin notification processed"
    });

  } catch (error) {
    console.error("Admin notification error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid notification data", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to process admin notification", message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
