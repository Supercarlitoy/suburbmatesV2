import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser, isAdmin } from "@/server/auth/auth";
import { AdminBusinessService } from "@/lib/services/admin-business";
import { prisma } from "@/lib/database/prisma";
import { z } from "zod";

interface RouteParams {
  params: Promise<{
    businessId: string;
  }>;
}

interface AdminReviewResult {
  businessId: string;
  businessName: string;
  reviewTimestamp: string;
  adminId: string;
  
  decision: {
    action: 'approve' | 'reject' | 'defer' | 'request_changes';
    reason: string;
    detailedNotes?: string;
    conditionsForApproval?: string[];
    confidenceAdjustment?: number; // Admin can adjust confidence threshold
  };
  
  aiAnalysisReview: {
    agreedWithRecommendation: boolean;
    originalAiRecommendation: 'approve' | 'reject' | 'manual_review';
    originalConfidenceScore: number;
    accuracyFeedback: 'accurate' | 'partially_accurate' | 'inaccurate';
    aiStrengthsConfirmed: string[];
    aiWeaknessesIdentified: string[];
    missedIssues: string[];
    falsePositives: string[];
    improvementSuggestions?: string[];
  };

  businessUpdates: {
    approvalStatusChanged: boolean;
    newApprovalStatus?: 'APPROVED' | 'REJECTED' | 'PENDING';
    qualityScoreUpdated: boolean;
    newQualityScore?: number;
    abnStatusUpdated: boolean;
    newAbnStatus?: string;
    flagsApplied: string[];
    notificationsTriggered: string[];
  };

  systemImpact: {
    confidenceThresholdAdjusted: boolean;
    newConfidenceThreshold?: number;
    aiModelFeedbackRecorded: boolean;
    duplicateResolutionApplied: boolean;
    relatedBusinessesAffected: number;
  };

  nextSteps: {
    immediate: string[];
    followUp: string[];
    monitoring: string[];
  };
}

const AdminReviewSchema = z.object({
  // Primary decision
  action: z.enum(['approve', 'reject', 'defer', 'request_changes']),
  reason: z.string().min(10).max(500),
  detailedNotes: z.string().optional(),
  conditionsForApproval: z.array(z.string()).optional(),
  
  // AI feedback and learning
  agreedWithRecommendation: z.boolean(),
  accuracyFeedback: z.enum(['accurate', 'partially_accurate', 'inaccurate']),
  aiStrengthsConfirmed: z.array(z.string()).optional().default([]),
  aiWeaknessesIdentified: z.array(z.string()).optional().default([]),
  missedIssues: z.array(z.string()).optional().default([]),
  falsePositives: z.array(z.string()).optional().default([]),
  improvementSuggestions: z.array(z.string()).optional().default([]),
  
  // System adjustments
  adjustConfidenceThreshold: z.boolean().optional().default(false),
  newConfidenceThreshold: z.number().min(0).max(100).optional(),
  
  // Business updates
  updateQualityScore: z.boolean().optional().default(false),
  newQualityScore: z.number().min(0).max(100).optional(),
  updateAbnStatus: z.boolean().optional().default(false),
  newAbnStatus: z.enum(['VERIFIED', 'PENDING', 'INVALID', 'EXPIRED', 'NOT_PROVIDED']).optional(),
  applyFlags: z.array(z.string()).optional().default([]),
  
  // Duplicate handling
  resolveDuplicates: z.boolean().optional().default(false),
  duplicateResolutionStrategy: z.enum(['merge', 'mark_duplicate', 'keep_separate']).optional(),
  duplicateBusinessIds: z.array(z.string()).optional().default([]),
  
  // Notifications and communication
  notifyBusinessOwner: z.boolean().optional().default(false),
  customNotificationMessage: z.string().optional(),
  escalateToSeniorAdmin: z.boolean().optional().default(false),
  
  // Follow-up and monitoring
  scheduleFollowUp: z.boolean().optional().default(false),
  followUpDays: z.number().min(1).max(90).optional(),
  enableEnhancedMonitoring: z.boolean().optional().default(false),
  monitoringDuration: z.number().min(7).max(180).optional(), // Days
});

/**
 * PATCH /api/admin/ai-automation/review/{businessId}
 * Process admin decision and provide AI feedback for learning
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    // Check admin authentication
    const user = await getCurrentUser();
    if (!user || !(await isAdmin())) {
      return NextResponse.json(
        { error: "Unauthorized. Admin access required." },
        { status: 403 }
      );
    }

    const { businessId } = await params;
    const body = await request.json();
    const adminService = new AdminBusinessService(prisma);

    // Validate request
    const validationResult = AdminReviewSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: "Invalid review request",
          details: validationResult.error.issues
        },
        { status: 400 }
      );
    }

    const reviewData = validationResult.data;

    // Get business with AI analysis history
    const business = await prisma.business.findUnique({
      where: { id: businessId },
      include: {
        auditLogs: {
          where: {
            eventType: 'ADMIN_AI_AUTOMATION_VERIFY_BUSINESS',
          },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
        ownershipClaims: {
          where: { status: 'PENDING' },
          take: 5,
        },
        duplicateOf: true,
        duplicates: true,
      },
    });

    if (!business) {
      return NextResponse.json(
        { error: "Business not found" },
        { status: 404 }
      );
    }

    // Process the admin review
    const reviewResult = await processAdminReview(
      business, 
      reviewData, 
      user.id,
      adminService
    );

    // Log the comprehensive admin review
    await adminService.logAdminAccess(
      'ADMIN_AI_AUTOMATION_REVIEW_DECISION',
      businessId,
      user.id,
      {
        businessName: business.name,
        decision: reviewData.action,
        reason: reviewData.reason,
        agreedWithRecommendation: reviewData.agreedWithRecommendation,
        accuracyFeedback: reviewData.accuracyFeedback,
        originalAiRecommendation: reviewResult.aiAnalysisReview.originalAiRecommendation,
        originalConfidenceScore: reviewResult.aiAnalysisReview.originalConfidenceScore,
        businessUpdates: reviewResult.businessUpdates,
        systemImpact: reviewResult.systemImpact,
        aiStrengthsConfirmed: reviewData.aiStrengthsConfirmed,
        aiWeaknessesIdentified: reviewData.aiWeaknessesIdentified,
        missedIssues: reviewData.missedIssues,
        falsePositives: reviewData.falsePositives,
        improvementSuggestions: reviewData.improvementSuggestions,
      },
      request.headers.get('x-forwarded-for') || 'unknown',
      request.headers.get('user-agent') || 'unknown'
    );

    return NextResponse.json({
      success: true,
      message: `Admin review completed for ${business.name}`,
      result: reviewResult,
    });

  } catch (error) {
    console.error("Admin review error:", error);

    // Log error for audit
    try {
      const user = await getCurrentUser();
      const adminService = new AdminBusinessService(prisma);
      const { businessId: errorBusinessId } = await params;
      await adminService.logAdminAccess(
        'ADMIN_AI_AUTOMATION_REVIEW_ERROR',
        errorBusinessId,
        user?.id || null,
        {
          error: error instanceof Error ? error.message : 'Unknown error',
          requestBody: await request.json().catch(() => ({})),
        },
        request.headers.get('x-forwarded-for') || 'unknown',
        request.headers.get('user-agent') || 'unknown'
      );
    } catch (auditError) {
      console.error('Failed to log audit event:', auditError);
    }

    return NextResponse.json(
      { error: "Failed to process admin review", message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * Process comprehensive admin review with AI feedback and system updates
 */
async function processAdminReview(
  business: any, 
  reviewData: any, 
  adminId: string,
  adminService: AdminBusinessService
): Promise<AdminReviewResult> {
  
  // Get the latest AI analysis
  const latestAiAnalysis = business.auditLogs[0];
  const originalAiRecommendation = latestAiAnalysis?.eventData?.overallRecommendation || 'manual_review';
  const originalConfidenceScore = latestAiAnalysis?.eventData?.confidenceScore || 75;

  // Process business status updates
  const businessUpdates = await processBusinessUpdates(business, reviewData, adminService);
  
  // Process system impact and AI feedback
  const systemImpact = await processSystemImpact(
    reviewData,
    originalAiRecommendation,
    originalConfidenceScore,
    adminService
  );
  
  // Handle duplicates if requested
  if (reviewData.resolveDuplicates && reviewData.duplicateBusinessIds.length > 0) {
    await processDuplicateResolution(
      business,
      reviewData.duplicateResolutionStrategy,
      reviewData.duplicateBusinessIds,
      adminService
    );
  }
  
  // Schedule follow-ups and monitoring
  const nextSteps = await scheduleFollowUpActions(
    business,
    reviewData,
    businessUpdates,
    adminService
  );
  
  // Send notifications if requested
  if (reviewData.notifyBusinessOwner) {
    await sendBusinessOwnerNotification(
      business,
      reviewData,
      businessUpdates,
      adminService
    );
  }

  return {
    businessId: business.id,
    businessName: business.name,
    reviewTimestamp: new Date().toISOString(),
    adminId,
    
    decision: {
      action: reviewData.action,
      reason: reviewData.reason,
      detailedNotes: reviewData.detailedNotes,
      conditionsForApproval: reviewData.conditionsForApproval,
      confidenceAdjustment: reviewData.newConfidenceThreshold,
    },
    
    aiAnalysisReview: {
      agreedWithRecommendation: reviewData.agreedWithRecommendation,
      originalAiRecommendation,
      originalConfidenceScore,
      accuracyFeedback: reviewData.accuracyFeedback,
      aiStrengthsConfirmed: reviewData.aiStrengthsConfirmed,
      aiWeaknessesIdentified: reviewData.aiWeaknessesIdentified,
      missedIssues: reviewData.missedIssues,
      falsePositives: reviewData.falsePositives,
      improvementSuggestions: reviewData.improvementSuggestions,
    },

    businessUpdates,
    systemImpact,
    nextSteps,
  };
}

/**
 * Process business status and data updates
 */
async function processBusinessUpdates(
  business: any,
  reviewData: any,
  adminService: AdminBusinessService
) {
  const updates: any = {};
  let approvalStatusChanged = false;
  let qualityScoreUpdated = false;
  let abnStatusUpdated = false;
  const flagsApplied: string[] = [];
  const notificationsTriggered: string[] = [];

  // Update approval status based on admin decision
  if (reviewData.action === 'approve') {
    updates.approvalStatus = 'APPROVED';
    updates.approvedAt = new Date();
    approvalStatusChanged = true;
    notificationsTriggered.push('business_approved');
  } else if (reviewData.action === 'reject') {
    updates.approvalStatus = 'REJECTED';
    updates.rejectedAt = new Date();
    approvalStatusChanged = true;
    notificationsTriggered.push('business_rejected');
  } else if (reviewData.action === 'request_changes') {
    // Keep as PENDING but flag for changes
    flagsApplied.push('changes_requested');
    notificationsTriggered.push('changes_requested');
  }

  // Update quality score if specified
  if (reviewData.updateQualityScore && reviewData.newQualityScore !== undefined) {
    updates.qualityScore = reviewData.newQualityScore;
    qualityScoreUpdated = true;
  }

  // Update ABN status if specified
  if (reviewData.updateAbnStatus && reviewData.newAbnStatus) {
    updates.abnStatus = reviewData.newAbnStatus;
    abnStatusUpdated = true;
    
    if (reviewData.newAbnStatus === 'VERIFIED') {
      flagsApplied.push('abn_verified');
      notificationsTriggered.push('abn_verified');
    }
  }

  // Apply additional flags
  if (reviewData.applyFlags && reviewData.applyFlags.length > 0) {
    flagsApplied.push(...reviewData.applyFlags);
  }

  // Update the business record
  if (Object.keys(updates).length > 0) {
    await prisma.business.update({
      where: { id: business.id },
      data: updates,
    });

    // Log the business update
    await adminService.logAdminAccess(
      'ADMIN_BUSINESS_STATUS_UPDATE',
      business.id,
      adminService.getCurrentAdminId?.() || 'system',
      {
        updates,
        reason: reviewData.reason,
        previousStatus: {
          approvalStatus: business.approvalStatus,
          qualityScore: business.qualityScore,
          abnStatus: business.abnStatus,
        },
      }
    );
  }

  return {
    approvalStatusChanged,
    newApprovalStatus: updates.approvalStatus,
    qualityScoreUpdated,
    newQualityScore: updates.qualityScore,
    abnStatusUpdated,
    newAbnStatus: updates.abnStatus,
    flagsApplied,
    notificationsTriggered,
  };
}

/**
 * Process system-wide impact and AI feedback
 */
async function processSystemImpact(
  reviewData: any,
  originalAiRecommendation: string,
  originalConfidenceScore: number,
  adminService: AdminBusinessService
) {
  let confidenceThresholdAdjusted = false;
  let newConfidenceThreshold = undefined;
  let aiModelFeedbackRecorded = false;
  let duplicateResolutionApplied = false;
  let relatedBusinessesAffected = 0;

  // Adjust confidence threshold if requested and justified
  if (reviewData.adjustConfidenceThreshold && reviewData.newConfidenceThreshold !== undefined) {
    // Store new confidence threshold in feature flags or configuration
    await updateFeatureFlag(
      'ai_confidence_threshold',
      reviewData.newConfidenceThreshold,
      adminService
    );
    confidenceThresholdAdjusted = true;
    newConfidenceThreshold = reviewData.newConfidenceThreshold;
  }

  // Record AI model feedback for future training
  const feedbackEntry = {
    originalRecommendation: originalAiRecommendation,
    originalConfidenceScore,
    adminDecision: reviewData.action,
    agreedWithAi: reviewData.agreedWithRecommendation,
    accuracyRating: reviewData.accuracyFeedback,
    confirmedStrengths: reviewData.aiStrengthsConfirmed,
    identifiedWeaknesses: reviewData.aiWeaknessesIdentified,
    missedIssues: reviewData.missedIssues,
    falsePositives: reviewData.falsePositives,
    improvementSuggestions: reviewData.improvementSuggestions,
    timestamp: new Date(),
  };

  // Store AI feedback for model improvement (this could integrate with ML pipeline)
  await storeAIFeedback(feedbackEntry, adminService);
  aiModelFeedbackRecorded = true;

  // Handle duplicate resolution impact
  if (reviewData.resolveDuplicates) {
    relatedBusinessesAffected = reviewData.duplicateBusinessIds.length;
    duplicateResolutionApplied = true;
  }

  return {
    confidenceThresholdAdjusted,
    newConfidenceThreshold,
    aiModelFeedbackRecorded,
    duplicateResolutionApplied,
    relatedBusinessesAffected,
  };
}

/**
 * Process duplicate business resolution
 */
async function processDuplicateResolution(
  business: any,
  strategy: string,
  duplicateIds: string[],
  adminService: AdminBusinessService
) {
  for (const duplicateId of duplicateIds) {
    switch (strategy) {
      case 'merge':
        // Merge duplicate business into main business
        await prisma.business.update({
          where: { id: duplicateId },
          data: {
            duplicateOfId: business.id,
            approvalStatus: 'REJECTED',
            rejectedAt: new Date(),
          },
        });
        break;
        
      case 'mark_duplicate':
        // Mark as duplicate but keep record
        await prisma.business.update({
          where: { id: duplicateId },
          data: {
            duplicateOfId: business.id,
          },
        });
        break;
        
      case 'keep_separate':
        // Remove duplicate relationship if it exists
        await prisma.business.update({
          where: { id: duplicateId },
          data: {
            duplicateOfId: null,
          },
        });
        break;
    }

    // Log the duplicate resolution
    await adminService.logAdminAccess(
      'ADMIN_DUPLICATE_RESOLUTION',
      duplicateId,
      adminService.getCurrentAdminId?.() || 'system',
      {
        strategy,
        mainBusinessId: business.id,
        mainBusinessName: business.name,
        resolution: strategy,
      }
    );
  }
}

/**
 * Schedule follow-up actions and monitoring
 */
async function scheduleFollowUpActions(
  business: any,
  reviewData: any,
  businessUpdates: any,
  adminService: AdminBusinessService
) {
  const immediate: string[] = [];
  const followUp: string[] = [];
  const monitoring: string[] = [];

  // Immediate actions
  if (businessUpdates.approvalStatusChanged) {
    immediate.push('Update business directory listing status');
    immediate.push('Trigger status change notifications');
  }

  if (businessUpdates.flagsApplied.length > 0) {
    immediate.push('Apply business flags and restrictions');
  }

  if (reviewData.notifyBusinessOwner) {
    immediate.push('Send notification to business owner');
  }

  // Follow-up actions
  if (reviewData.scheduleFollowUp) {
    const followUpDate = new Date();
    followUpDate.setDate(followUpDate.getDate() + (reviewData.followUpDays || 30));
    
    followUp.push(`Review business status on ${followUpDate.toDateString()}`);
    
    // Create follow-up audit entry
    await adminService.logAdminAccess(
      'ADMIN_FOLLOW_UP_SCHEDULED',
      business.id,
      adminService.getCurrentAdminId?.() || 'system',
      {
        scheduledDate: followUpDate,
        reason: 'Admin review follow-up',
        originalDecision: reviewData.action,
      }
    );
  }

  if (reviewData.action === 'request_changes') {
    followUp.push('Monitor for business profile updates');
    followUp.push('Re-review when changes are submitted');
  }

  if (reviewData.escalateToSeniorAdmin) {
    followUp.push('Escalate to senior admin for additional review');
  }

  // Monitoring actions
  if (reviewData.enableEnhancedMonitoring) {
    monitoring.push('Enable enhanced monitoring for unusual activity');
    monitoring.push(`Monitor business for ${reviewData.monitoringDuration || 30} days`);
    
    // Store monitoring configuration
    await storeMonitoringConfig(
      business.id,
      reviewData.monitoringDuration || 30,
      adminService
    );
  }

  if (businessUpdates.approvalStatusChanged && businessUpdates.newApprovalStatus === 'APPROVED') {
    monitoring.push('Monitor new customer interactions and feedback');
    monitoring.push('Track quality metrics and lead generation');
  }

  if (businessUpdates.abnStatusUpdated) {
    monitoring.push('Monitor ABN verification status changes');
  }

  return {
    immediate,
    followUp,
    monitoring,
  };
}

/**
 * Send notification to business owner
 */
async function sendBusinessOwnerNotification(
  business: any,
  reviewData: any,
  businessUpdates: any,
  adminService: AdminBusinessService
) {
  // This would integrate with the email notification system
  const notificationData = {
    businessId: business.id,
    businessName: business.name,
    decision: reviewData.action,
    reason: reviewData.reason,
    customMessage: reviewData.customNotificationMessage,
    statusChanged: businessUpdates.approvalStatusChanged,
    newStatus: businessUpdates.newApprovalStatus,
    conditionsForApproval: reviewData.conditionsForApproval,
  };

  // Log the notification
  await adminService.logAdminAccess(
    'ADMIN_BUSINESS_NOTIFICATION_SENT',
    business.id,
    adminService.getCurrentAdminId?.() || 'system',
    {
      notificationType: 'admin_review_result',
      notificationData,
      recipientEmail: business.email,
    }
  );

  console.log('Business owner notification queued:', notificationData);
}

/**
 * Update feature flag value
 */
async function updateFeatureFlag(
  flagName: string,
  value: any,
  adminService: AdminBusinessService
) {
  await prisma.featureFlag.upsert({
    where: { key: flagName },
    create: {
      key: flagName,
      enabled: true,
      configuration: { value },
      description: `AI confidence threshold updated by admin`,
    },
    update: {
      value: { value },
      updatedAt: new Date(),
    },
  });

  // Log the configuration change
  await adminService.logAdminAccess(
    'ADMIN_SYSTEM_CONFIG_UPDATE',
    null,
    adminService.getCurrentAdminId?.() || 'system',
    {
      featureFlag: flagName,
      newValue: value,
      reason: 'Admin confidence threshold adjustment',
    }
  );
}

/**
 * Store AI feedback for model improvement
 */
async function storeAIFeedback(
  feedbackEntry: any,
  adminService: AdminBusinessService
) {
  // This could integrate with ML pipeline or external feedback system
  // For now, store in audit logs as structured feedback
  
  await adminService.logAdminAccess(
    'ADMIN_AI_MODEL_FEEDBACK',
    null,
    adminService.getCurrentAdminId?.() || 'system',
    {
      feedbackType: 'model_accuracy_review',
      originalRecommendation: feedbackEntry.originalRecommendation,
      originalConfidenceScore: feedbackEntry.originalConfidenceScore,
      adminDecision: feedbackEntry.adminDecision,
      accuracyRating: feedbackEntry.accuracyRating,
      agreedWithAi: feedbackEntry.agreedWithAi,
      confirmedStrengths: feedbackEntry.confirmedStrengths,
      identifiedWeaknesses: feedbackEntry.identifiedWeaknesses,
      missedIssues: feedbackEntry.missedIssues,
      falsePositives: feedbackEntry.falsePositives,
      improvementSuggestions: feedbackEntry.improvementSuggestions,
      timestamp: feedbackEntry.timestamp,
    }
  );

  console.log('AI model feedback recorded:', feedbackEntry);
}

/**
 * Store enhanced monitoring configuration
 */
async function storeMonitoringConfig(
  businessId: string,
  durationDays: number,
  adminService: AdminBusinessService
) {
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + durationDays);

  await adminService.logAdminAccess(
    'ADMIN_ENHANCED_MONITORING_ENABLED',
    businessId,
    adminService.getCurrentAdminId?.() || 'system',
    {
      monitoringType: 'enhanced_business_monitoring',
      startDate: new Date(),
      endDate,
      durationDays,
      monitoringFlags: ['unusual_activity', 'quality_metrics', 'customer_feedback'],
    }
  );

  console.log(`Enhanced monitoring enabled for business ${businessId} for ${durationDays} days`);
}