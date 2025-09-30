import { prisma } from '@/lib/database/prisma';
import { logAuditEvent } from '@/lib/utils/audit';
import { sendBusinessApprovalEmail, sendBusinessRejectionEmail } from '@/lib/email';
import { AbnVerificationResult, getAbnStatus, isActiveBusinessAbn } from './abn-verification';
import type { AbnStatus, ApprovalStatus, BusinessSource } from '@prisma/client';

export interface ApprovalCriteria {
  hasValidAbn?: boolean;
  hasCompleteBio?: boolean;
  hasContactInfo?: boolean;
  noSpamIndicators?: boolean;
  passesContentModeration?: boolean;
  abnVerificationRequired?: boolean;
  manualReviewRequired?: boolean;
}

export interface ApprovalResult {
  approved: boolean;
  requiresManualReview: boolean;
  approvalStatus: ApprovalStatus;
  abnStatus?: AbnStatus;
  reasons: string[];
  metadata?: Record<string, any>;
}

export interface BusinessApprovalData {
  businessId: string;
  name: string;
  email?: string;
  phone?: string;
  website?: string;
  abn?: string;
  bio?: string;
  suburb: string;
  category?: string;
  source: BusinessSource;
  abnVerification?: AbnVerificationResult;
}

/**
 * Evaluates if a business meets automatic approval criteria
 */
export async function evaluateAutoApprovalCriteria(data: BusinessApprovalData): Promise<ApprovalCriteria> {
  const criteria: ApprovalCriteria = {
    hasValidAbn: false,
    hasCompleteBio: false,
    hasContactInfo: false,
    noSpamIndicators: false,
    passesContentModeration: false,
    abnVerificationRequired: false,
    manualReviewRequired: false,
  };

  // Check ABN status
  if (data.abn && data.abnVerification) {
    criteria.hasValidAbn = data.abnVerification.isValid && data.abnVerification.isActive;
    criteria.abnVerificationRequired = !isActiveBusinessAbn(data.abnVerification.details);
  } else {
    criteria.abnVerificationRequired = false; // ABN is optional for basic listing
  }

  // Check bio completeness (minimum 10 characters, but prefer 50+)
  if (data.bio) {
    criteria.hasCompleteBio = data.bio.length >= 10;
    if (data.bio.length < 50) {
      criteria.manualReviewRequired = true; // Short bio might need review
    }
  }

  // Check contact information completeness
  criteria.hasContactInfo = Boolean(data.email || data.phone);
  if (!data.email && !data.phone) {
    criteria.manualReviewRequired = true; // No contact info is suspicious
  }

  // Basic spam detection
  criteria.noSpamIndicators = !containsSpamIndicators(data);
  if (!criteria.noSpamIndicators) {
    criteria.manualReviewRequired = true;
  }

  // Content moderation check
  criteria.passesContentModeration = await checkContentModeration(data);
  if (!criteria.passesContentModeration) {
    criteria.manualReviewRequired = true;
  }

  // Additional manual review triggers
  if (isHighRiskBusiness(data)) {
    criteria.manualReviewRequired = true;
  }

  return criteria;
}

/**
 * Determines final approval decision based on criteria
 */
export function determineApprovalDecision(criteria: ApprovalCriteria, data: BusinessApprovalData): ApprovalResult {
  const reasons: string[] = [];
  let approved = true;
  let requiresManualReview = criteria.manualReviewRequired || false;

  // Automatic rejection criteria
  if (!criteria.passesContentModeration) {
    approved = false;
    reasons.push('Failed content moderation review');
  }

  if (!criteria.hasContactInfo) {
    approved = false;
    reasons.push('Missing contact information');
  }

  if (!criteria.noSpamIndicators) {
    approved = false;
    reasons.push('Contains spam indicators');
  }

  // Auto-approval criteria (if not flagged for manual review)
  if (approved && !requiresManualReview) {
    const autoApprovalScore = calculateApprovalScore(criteria, data);
    
    if (autoApprovalScore >= 80) {
      reasons.push('Meets automatic approval criteria');
    } else if (autoApprovalScore >= 60) {
      requiresManualReview = true;
      reasons.push('Requires manual review - moderate confidence');
    } else {
      requiresManualReview = true;
      reasons.push('Requires manual review - low confidence');
    }
  }

  // Determine status
  let approvalStatus: ApprovalStatus;
  if (!approved) {
    approvalStatus = 'REJECTED';
  } else if (requiresManualReview) {
    approvalStatus = 'PENDING';
  } else {
    approvalStatus = 'APPROVED';
  }

  // Determine ABN status
  let abnStatus: AbnStatus = 'NOT_PROVIDED';
  if (data.abn && data.abnVerification) {
    abnStatus = getAbnStatus(data.abnVerification);
  }

  return {
    approved: approved && !requiresManualReview,
    requiresManualReview,
    approvalStatus,
    abnStatus,
    reasons,
    metadata: {
      autoApprovalScore: calculateApprovalScore(criteria, data),
      evaluatedAt: new Date().toISOString(),
    }
  };
}

/**
 * Calculates a numerical approval score (0-100) based on criteria
 */
function calculateApprovalScore(criteria: ApprovalCriteria, data: BusinessApprovalData): number {
  let score = 0;

  // Base score for having complete business profile
  if (criteria.hasCompleteBio) score += 25;
  if (criteria.hasContactInfo) score += 25;
  
  // ABN verification bonus
  if (criteria.hasValidAbn) score += 20;
  
  // Content quality
  if (criteria.passesContentModeration) score += 15;
  if (criteria.noSpamIndicators) score += 15;

  // Additional quality indicators
  if (data.website) score += 5;
  if (data.phone && data.email) score += 5; // Both contact methods
  if (data.bio && data.bio.length > 100) score += 5; // Detailed bio
  if (data.category) score += 5;

  return Math.min(score, 100);
}

/**
 * Basic spam detection
 */
function containsSpamIndicators(data: BusinessApprovalData): boolean {
  const text = [data.name, data.bio, data.website].filter(Boolean).join(' ').toLowerCase();
  
  // Common spam indicators
  const spamKeywords = [
    'guaranteed', 'free money', 'make money fast', 'work from home',
    'viagra', 'cialis', 'weight loss', 'get rich quick',
    'casino', 'poker', 'betting', 'loan', 'credit repair',
    'mlm', 'pyramid', 'investment opportunity',
  ];

  const suspiciousPatterns = [
    /\b\d{1,3}-\d{1,3}-\d{4}\b/g, // Phone numbers in text
    /https?:\/\/[^\s]+/gi, // URLs in bio
    /(FREE|GUARANTEED|AMAZING|INCREDIBLE){2,}/gi, // Excessive caps
    /(.)\1{4,}/g, // Repeated characters
  ];

  // Check for spam keywords
  const hasSpamKeywords = spamKeywords.some(keyword => text.includes(keyword));
  
  // Check for suspicious patterns
  const hasSuspiciousPatterns = suspiciousPatterns.some(pattern => pattern.test(text));

  return hasSpamKeywords || hasSuspiciousPatterns;
}

/**
 * Content moderation check
 */
async function checkContentModeration(data: BusinessApprovalData): Promise<boolean> {
  // Basic profanity and inappropriate content detection
  const text = [data.name, data.bio].filter(Boolean).join(' ').toLowerCase();
  
  const inappropriateContent = [
    'fuck', 'shit', 'damn', 'bitch', 'ass', 'crap',
    'sex', 'porn', 'xxx', 'adult', 'escort',
    'illegal', 'drugs', 'marijuana', 'cocaine',
  ];

  const hasInappropriateContent = inappropriateContent.some(word => text.includes(word));
  
  if (hasInappropriateContent) {
    console.log(`Content moderation flag for business: ${data.name}`);
    return false;
  }

  return true;
}

/**
 * Identifies high-risk business types that need manual review
 */
function isHighRiskBusiness(data: BusinessApprovalData): boolean {
  const businessText = [data.name, data.bio, data.category].filter(Boolean).join(' ').toLowerCase();
  
  const highRiskCategories = [
    'financial', 'investment', 'loan', 'credit', 'debt',
    'legal', 'law', 'lawyer', 'attorney',
    'medical', 'health', 'doctor', 'clinic',
    'real estate', 'property', 'mortgage',
    'insurance', 'tax', 'accounting',
    'adult', 'entertainment', 'gambling',
    'cryptocurrency', 'bitcoin', 'trading'
  ];

  return highRiskCategories.some(category => businessText.includes(category));
}

/**
 * Processes business registration with approval workflow
 */
export async function processBusinessApproval(data: BusinessApprovalData, userId?: string): Promise<ApprovalResult> {
  try {
    // Evaluate approval criteria
    const criteria = await evaluateAutoApprovalCriteria(data);
    
    // Make approval decision
    const result = determineApprovalDecision(criteria, data);

    // Log audit event
    if (userId) {
      await logAuditEvent({
        actorId: userId,
        action: 'BUSINESS_APPROVAL_EVALUATION',
        target: data.businessId,
        meta: {
          businessName: data.name,
          approvalStatus: result.approvalStatus,
          abnStatus: result.abnStatus,
          reasons: result.reasons,
          autoApprovalScore: result.metadata?.autoApprovalScore,
          requiresManualReview: result.requiresManualReview,
        },
      });
    }

    return result;

  } catch (error) {
    console.error('Business approval processing error:', error);
    
    // Default to manual review on error
    return {
      approved: false,
      requiresManualReview: true,
      approvalStatus: 'PENDING',
      abnStatus: 'NOT_PROVIDED',
      reasons: ['Error during approval evaluation - requires manual review'],
      metadata: { error: error instanceof Error ? error.message : 'Unknown error' }
    };
  }
}

/**
 * Admin function to manually approve a business
 */
export async function adminApproveBusiness(businessId: string, adminUserId: string, notes?: string): Promise<void> {
  const business = await prisma.business.findUnique({
    where: { id: businessId },
    include: { owner: true }
  });

  if (!business) {
    throw new Error('Business not found');
  }

  // Update business status
  await prisma.business.update({
    where: { id: businessId },
    data: {
      approvalStatus: 'APPROVED',
      requiresVerification: false,
    }
  });

  // Log audit event
  await logAuditEvent({
    actorId: adminUserId,
    action: 'ADMIN_APPROVE_BUSINESS',
    target: businessId,
    meta: {
      businessName: business.name,
      previousStatus: business.approvalStatus,
      adminNotes: notes,
    },
  });

  // Send approval email
  if (business.email && business.owner) {
    try {
      await sendBusinessApprovalEmail(business.email, {
        ownerName: business.owner.email?.split('@')[0] || 'Business Owner',
        businessName: business.name,
        profileUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/business/${business.slug}`,
      });
    } catch (emailError) {
      console.error('Failed to send approval email:', emailError);
    }
  }
}

/**
 * Admin function to manually reject a business
 */
export async function adminRejectBusiness(businessId: string, adminUserId: string, reason: string, notes?: string): Promise<void> {
  const business = await prisma.business.findUnique({
    where: { id: businessId },
    include: { owner: true }
  });

  if (!business) {
    throw new Error('Business not found');
  }

  // Update business status
  await prisma.business.update({
    where: { id: businessId },
    data: {
      approvalStatus: 'REJECTED',
      requiresVerification: false,
    }
  });

  // Log audit event
  await logAuditEvent({
    actorId: adminUserId,
    action: 'ADMIN_REJECT_BUSINESS',
    target: businessId,
    meta: {
      businessName: business.name,
      previousStatus: business.approvalStatus,
      rejectionReason: reason,
      adminNotes: notes,
    },
  });

  // Send rejection email
  if (business.email && business.owner) {
    try {
      await sendBusinessRejectionEmail(business.email, {
        ownerName: business.owner.email?.split('@')[0] || 'Business Owner',
        businessName: business.name,
        reason: reason,
        appealUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/appeal`,
      });
    } catch (emailError) {
      console.error('Failed to send rejection email:', emailError);
    }
  }
}

/**
 * Gets businesses pending manual review
 */
export async function getPendingBusinessesForReview(limit = 50, offset = 0) {
  return prisma.business.findMany({
    where: {
      approvalStatus: 'PENDING',
      requiresVerification: true,
    },
    include: {
      owner: {
        select: {
          id: true,
          email: true,
          role: true,
        }
      }
    },
    orderBy: {
      createdAt: 'asc', // Oldest first
    },
    take: limit,
    skip: offset,
  });
}

/**
 * Gets approval queue statistics
 */
export async function getApprovalQueueStats() {
  const [pending, approved, rejected] = await Promise.all([
    prisma.business.count({ where: { approvalStatus: 'PENDING' } }),
    prisma.business.count({ where: { approvalStatus: 'APPROVED' } }),
    prisma.business.count({ where: { approvalStatus: 'REJECTED' } }),
  ]);

  return {
    pending,
    approved,
    rejected,
    total: pending + approved + rejected,
    approvalRate: approved / Math.max(approved + rejected, 1),
  };
}