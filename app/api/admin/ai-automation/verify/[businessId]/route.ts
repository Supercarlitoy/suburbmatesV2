import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser, isAdmin } from "@/server/auth/auth";
import { AdminBusinessService } from "@/lib/services/admin-business";
import { calculateQualityScore } from "@/lib/services/quality-scoring";
import { prisma } from "@/lib/database/prisma";
import { z } from "zod";

interface RouteParams {
  params: Promise<{
    businessId: string;
  }>;
}

interface AIVerificationResult {
  businessId: string;
  businessName: string;
  verificationTimestamp: string;
  overallRecommendation: 'approve' | 'reject' | 'manual_review';
  confidenceScore: number; // 0-100
  
  analysis: {
    completeness: {
      score: number; // 0-100
      missingFields: string[];
      requiredFields: string[];
      optionalFields: string[];
      recommendation: string;
    };
    dataQuality: {
      score: number; // 0-100
      issues: Array<{
        field: string;
        issue: 'format' | 'validity' | 'consistency' | 'duplicate';
        severity: 'low' | 'medium' | 'high';
        description: string;
        suggestion?: string;
      }>;
      recommendation: string;
    };
    businessLegitimacy: {
      score: number; // 0-100
      factors: {
        abnVerification: 'verified' | 'pending' | 'invalid' | 'not_provided';
        contactVerification: 'verified' | 'pending' | 'failed' | 'not_attempted';
        websiteVerification: 'verified' | 'suspicious' | 'invalid' | 'not_provided';
        locationVerification: 'verified' | 'approximate' | 'invalid' | 'not_provided';
      };
      flags: Array<{
        type: 'suspicious_contact' | 'duplicate_listing' | 'invalid_location' | 'fake_website' | 'spam_content';
        severity: 'low' | 'medium' | 'high';
        description: string;
      }>;
      recommendation: string;
    };
    contentModeration: {
      score: number; // 0-100
      spamIndicators: number;
      profanityDetected: boolean;
      inappropriateContent: boolean;
      duplicateContent: boolean;
      flags: string[];
      recommendation: string;
    };
    duplicateAnalysis: {
      duplicatesFound: number;
      highConfidenceDuplicates: number;
      mediumConfidenceDuplicates: number;
      lowConfidenceDuplicates: number;
      duplicateDetails: Array<{
        duplicateBusinessId: string;
        duplicateBusinessName: string;
        confidence: number;
        matchingFields: string[];
        recommendation: 'merge' | 'mark_duplicate' | 'investigate';
      }>;
      recommendation: string;
    };
  };
  
  rationale: {
    primaryReasons: string[];
    supportingFactors: string[];
    riskFactors: string[];
    mitigatingFactors: string[];
  };

  recommendations: {
    immediate: string[];
    beforeApproval: string[];
    postApproval: string[];
    monitoring: string[];
  };

  manualOverride?: {
    allowed: boolean;
    reasons: string[];
    requiredActions: string[];
  };
}

const VerifyRequestSchema = z.object({
  forceRecompute: z.boolean().optional().default(false),
  confidenceThreshold: z.number().min(0).max(100).optional(),
  includeDuplicateAnalysis: z.boolean().optional().default(true),
  includeContentModeration: z.boolean().optional().default(true),
});

/**
 * POST /api/admin/ai-automation/verify/{businessId}
 * Perform comprehensive AI verification analysis on a specific business
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
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
    const validationResult = VerifyRequestSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: "Invalid verification request",
          details: validationResult.error.issues
        },
        { status: 400 }
      );
    }

    const { forceRecompute, confidenceThreshold, includeDuplicateAnalysis, includeContentModeration } = validationResult.data;

    // Get business with comprehensive data
    const business = await prisma.business.findUnique({
      where: { id: businessId },
      include: {
        customization: true,
        content: {
          where: { isPublic: true },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        inquiries: {
          where: {
            createdAt: {
              gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), // Last 90 days
            },
          },
          take: 50,
        },
        leads: {
          where: {
            createdAt: {
              gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), // Last 90 days
            },
          },
          take: 50,
        },
        ownershipClaims: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
        auditLogs: {
          where: {
            createdAt: {
              gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 100,
        },
      },
    });

    if (!business) {
      return NextResponse.json(
        { error: "Business not found" },
        { status: 404 }
      );
    }

    // Perform AI verification analysis
    const verificationResult = await performAIVerification(
      business, 
      { forceRecompute, confidenceThreshold, includeDuplicateAnalysis, includeContentModeration }
    );

    // Log the AI verification
    await adminService.logAdminAccess(
      'ADMIN_AI_AUTOMATION_VERIFY_BUSINESS',
      businessId,
      user.id,
      {
        businessName: business.name,
        overallRecommendation: verificationResult.overallRecommendation,
        confidenceScore: verificationResult.confidenceScore,
        completenessScore: verificationResult.analysis.completeness.score,
        dataQualityScore: verificationResult.analysis.dataQuality.score,
        legitimacyScore: verificationResult.analysis.businessLegitimacy.score,
        contentModerationScore: verificationResult.analysis.contentModeration.score,
        duplicatesFound: verificationResult.analysis.duplicateAnalysis.duplicatesFound,
        forceRecompute,
        confidenceThreshold,
        includeDuplicateAnalysis,
        includeContentModeration,
        primaryReasons: verificationResult.rationale.primaryReasons,
        riskFactors: verificationResult.rationale.riskFactors,
      },
      request.headers.get('x-forwarded-for') || 'unknown',
      request.headers.get('user-agent') || 'unknown'
    );

    return NextResponse.json({
      success: true,
      message: `AI verification completed for ${business.name}`,
      result: verificationResult,
    });

  } catch (error) {
    console.error("AI verification error:", error);

    // Log error for audit
    try {
      const user = await getCurrentUser();
      const adminService = new AdminBusinessService(prisma);
      await adminService.logAdminAccess(
        'ADMIN_AI_AUTOMATION_VERIFY_ERROR',
        (await params).businessId,
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
      { error: "Failed to perform AI verification", message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * Perform comprehensive AI verification analysis
 */
async function performAIVerification(
  business: any, 
  options: { forceRecompute?: boolean; confidenceThreshold?: number; includeDuplicateAnalysis?: boolean; includeContentModeration?: boolean }
): Promise<AIVerificationResult> {
  
  // Analyze completeness
  const completenessAnalysis = analyzeCompleteness(business);
  
  // Analyze data quality
  const dataQualityAnalysis = analyzeDataQuality(business);
  
  // Analyze business legitimacy
  const legitimacyAnalysis = analyzeBusinessLegitimacy(business);
  
  // Analyze content moderation (if requested)
  const contentModerationAnalysis = options.includeContentModeration 
    ? analyzeContentModeration(business) 
    : getEmptyContentModerationAnalysis();
  
  // Analyze duplicates (if requested)
  const duplicateAnalysis = options.includeDuplicateAnalysis 
    ? await analyzeDuplicates(business) 
    : getEmptyDuplicateAnalysis();

  // Calculate overall confidence score
  const confidenceScore = calculateOverallConfidence(
    completenessAnalysis, 
    dataQualityAnalysis, 
    legitimacyAnalysis, 
    contentModerationAnalysis, 
    duplicateAnalysis
  );

  // Generate overall recommendation
  const overallRecommendation = generateOverallRecommendation(
    confidenceScore, 
    completenessAnalysis, 
    dataQualityAnalysis, 
    legitimacyAnalysis, 
    contentModerationAnalysis, 
    duplicateAnalysis,
    options.confidenceThreshold || 75
  );

  // Generate rationale
  const rationale = generateRationale(
    overallRecommendation,
    completenessAnalysis, 
    dataQualityAnalysis, 
    legitimacyAnalysis, 
    contentModerationAnalysis, 
    duplicateAnalysis
  );

  // Generate recommendations
  const recommendations = generateRecommendations(
    overallRecommendation,
    completenessAnalysis, 
    dataQualityAnalysis, 
    legitimacyAnalysis, 
    contentModerationAnalysis, 
    duplicateAnalysis
  );

  // Check for manual override options
  const manualOverride = generateManualOverrideOptions(
    overallRecommendation,
    confidenceScore,
    legitimacyAnalysis,
    duplicateAnalysis
  );

  return {
    businessId: business.id,
    businessName: business.name,
    verificationTimestamp: new Date().toISOString(),
    overallRecommendation,
    confidenceScore,
    analysis: {
      completeness: completenessAnalysis,
      dataQuality: dataQualityAnalysis,
      businessLegitimacy: legitimacyAnalysis,
      contentModeration: contentModerationAnalysis,
      duplicateAnalysis,
    },
    rationale,
    recommendations,
    manualOverride,
  };
}

/**
 * Analyze business profile completeness
 */
function analyzeCompleteness(business: any) {
  const requiredFields = ['name', 'phone', 'email', 'suburb', 'category'];
  const optionalFields = ['website', 'address', 'bio', 'abn'];
  
  const missingFields: string[] = [];
  let completenessScore = 0;

  // Check required fields
  requiredFields.forEach(field => {
    if (!business[field]) {
      missingFields.push(field);
    } else {
      completenessScore += 15; // 15 points per required field
    }
  });

  // Check optional fields
  optionalFields.forEach(field => {
    if (business[field]) {
      completenessScore += 6.25; // 6.25 points per optional field
    }
  });

  // Cap at 100
  completenessScore = Math.min(100, completenessScore);

  let recommendation = '';
  if (completenessScore >= 90) {
    recommendation = 'Excellent profile completeness. Ready for approval.';
  } else if (completenessScore >= 75) {
    recommendation = 'Good profile completeness. Minor improvements recommended.';
  } else if (completenessScore >= 60) {
    recommendation = 'Moderate profile completeness. Several fields missing.';
  } else {
    recommendation = 'Poor profile completeness. Major improvements required before approval.';
  }

  return {
    score: Math.round(completenessScore),
    missingFields,
    requiredFields,
    optionalFields,
    recommendation,
  };
}

/**
 * Analyze data quality issues
 */
function analyzeDataQuality(business: any) {
  const issues: Array<{
    field: string;
    issue: 'format' | 'validity' | 'consistency' | 'duplicate';
    severity: 'low' | 'medium' | 'high';
    description: string;
    suggestion?: string;
  }> = [];

  let qualityScore = 100; // Start with perfect score and deduct for issues

  // Email validation
  if (business.email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(business.email)) {
      issues.push({
        field: 'email',
        issue: 'format',
        severity: 'high',
        description: 'Invalid email format detected',
        suggestion: 'Correct the email format to ensure deliverability',
      });
      qualityScore -= 15;
    }
    
    // Check for suspicious email patterns
    const suspiciousEmailDomains = ['10minutemail.com', 'tempmail.org', 'guerrillamail.com', 'mailinator.com'];
    const emailDomain = business.email.split('@')[1]?.toLowerCase();
    if (emailDomain && suspiciousEmailDomains.includes(emailDomain)) {
      issues.push({
        field: 'email',
        issue: 'validity',
        severity: 'high',
        description: 'Temporary or suspicious email domain detected',
        suggestion: 'Use a permanent business email address',
      });
      qualityScore -= 20;
    }
  }

  // Phone validation
  if (business.phone) {
    const phoneRegex = /^(\+61|0)[2-9]\d{8}$/;
    if (!phoneRegex.test(business.phone.replace(/\s/g, ''))) {
      issues.push({
        field: 'phone',
        issue: 'format',
        severity: 'medium',
        description: 'Phone number format may not be valid Australian format',
        suggestion: 'Use Australian phone format: +61 X XXXX XXXX or 0X XXXX XXXX',
      });
      qualityScore -= 10;
    }
  }

  // Website validation
  if (business.website) {
    try {
      new URL(business.website);
      // Check for suspicious patterns
      const suspiciousPatterns = ['bit.ly', 'tinyurl.com', 'facebook.com/profile'];
      if (suspiciousPatterns.some(pattern => business.website.includes(pattern))) {
        issues.push({
          field: 'website',
          issue: 'validity',
          severity: 'medium',
          description: 'Website URL appears to be a redirect or social media profile',
          suggestion: 'Use the main business website URL',
        });
        qualityScore -= 8;
      }
    } catch {
      issues.push({
        field: 'website',
        issue: 'format',
        severity: 'medium',
        description: 'Invalid website URL format',
        suggestion: 'Ensure website URL includes http:// or https://',
      });
      qualityScore -= 10;
    }
  }

  // ABN validation
  if (business.abn) {
    const abnRegex = /^\d{11}$/;
    if (!abnRegex.test(business.abn.replace(/\s/g, ''))) {
      issues.push({
        field: 'abn',
        issue: 'format',
        severity: 'medium',
        description: 'ABN format appears invalid (should be 11 digits)',
        suggestion: 'Verify ABN format and ensure it\'s correctly entered',
      });
      qualityScore -= 8;
    }
  }

  // Business name validation
  if (business.name) {
    if (business.name.length < 3) {
      issues.push({
        field: 'name',
        issue: 'validity',
        severity: 'high',
        description: 'Business name is too short',
        suggestion: 'Provide full business name (at least 3 characters)',
      });
      qualityScore -= 15;
    }

    // Check for suspicious patterns
    const suspiciousPatterns = ['test', 'example', 'lorem ipsum', '123', 'asdf'];
    if (suspiciousPatterns.some(pattern => business.name.toLowerCase().includes(pattern))) {
      issues.push({
        field: 'name',
        issue: 'validity',
        severity: 'high',
        description: 'Business name appears to be placeholder or test data',
        suggestion: 'Provide the actual business name',
      });
      qualityScore -= 20;
    }
  }

  // Description quality check
  if (business.bio) {
    if (business.bio.length < 20) {
      issues.push({
        field: 'bio',
        issue: 'validity',
        severity: 'low',
        description: 'Business description is very brief',
        suggestion: 'Expand description to provide more details about services',
      });
      qualityScore -= 5;
    }

    // Check for spam patterns
    const spamPatterns = ['click here', 'buy now', 'limited time', 'act fast', '!!!'];
    if (spamPatterns.some(pattern => business.bio.toLowerCase().includes(pattern))) {
      issues.push({
        field: 'bio',
        issue: 'validity',
        severity: 'high',
        description: 'Description contains potential spam content',
        suggestion: 'Remove promotional language and focus on business services',
      });
      qualityScore -= 15;
    }
  }

  qualityScore = Math.max(0, qualityScore);

  let recommendation = '';
  if (qualityScore >= 90) {
    recommendation = 'Excellent data quality. No significant issues detected.';
  } else if (qualityScore >= 75) {
    recommendation = 'Good data quality. Minor formatting issues to address.';
  } else if (qualityScore >= 60) {
    recommendation = 'Moderate data quality. Several issues need attention.';
  } else {
    recommendation = 'Poor data quality. Major issues must be resolved before approval.';
  }

  return {
    score: Math.round(qualityScore),
    issues,
    recommendation,
  };
}

/**
 * Analyze business legitimacy factors
 */
function analyzeBusinessLegitimacy(business: any) {
  let legitimacyScore = 100;
  const flags: Array<{
    type: 'suspicious_contact' | 'duplicate_listing' | 'invalid_location' | 'fake_website' | 'spam_content';
    severity: 'low' | 'medium' | 'high';
    description: string;
  }> = [];

  // ABN verification factor
  const abnVerification = business.abnStatus || 'not_provided';
  
  // Contact verification (simulated)
  const contactVerification = business.phone && business.email ? 'verified' : 'not_attempted';
  
  // Website verification (simulated)
  let websiteVerification = 'not_provided';
  if (business.website) {
    // Simple heuristics for website legitimacy
    if (business.website.includes(business.name.toLowerCase().replace(/\s/g, ''))) {
      websiteVerification = 'verified';
    } else {
      websiteVerification = 'suspicious';
      flags.push({
        type: 'fake_website',
        severity: 'medium',
        description: 'Website URL does not appear to match business name',
      });
      legitimacyScore -= 15;
    }
  }

  // Location verification
  const locationVerification = (business.latitude && business.longitude) ? 'verified' : 'not_provided';
  if (!business.latitude && !business.longitude && business.address) {
    legitimacyScore -= 10;
  }

  // Check for suspicious patterns
  if (business.email && business.phone && business.website) {
    // All contact methods match pattern (potential spam)
    const emailDomain = business.email.split('@')[1];
    if (business.website.includes(emailDomain)) {
      // This is actually good - email domain matches website
      legitimacyScore += 5;
    }
  }

  // Check for duplicate indicators
  if (business.source === 'CSV' && !business.ownerId) {
    flags.push({
      type: 'duplicate_listing',
      severity: 'low',
      description: 'Business imported from CSV without owner verification',
    });
    legitimacyScore -= 5;
  }

  // Check recent activity
  const recentInquiries = business.inquiries?.length || 0;
  const recentLeads = business.leads?.length || 0;
  
  if (recentInquiries + recentLeads > 0) {
    // Recent activity is a good legitimacy indicator
    legitimacyScore += 10;
  } else if (business.createdAt < new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)) {
    // Old business with no activity is suspicious
    flags.push({
      type: 'suspicious_contact',
      severity: 'low',
      description: 'No recent customer interactions despite being listed for over 90 days',
    });
    legitimacyScore -= 8;
  }

  legitimacyScore = Math.max(0, Math.min(100, legitimacyScore));

  let recommendation = '';
  if (legitimacyScore >= 85) {
    recommendation = 'High business legitimacy confidence. Strong indicators of genuine business.';
  } else if (legitimacyScore >= 70) {
    recommendation = 'Good legitimacy indicators. Minor verification recommended.';
  } else if (legitimacyScore >= 50) {
    recommendation = 'Moderate legitimacy concerns. Additional verification required.';
  } else {
    recommendation = 'Significant legitimacy concerns. Manual review strongly recommended.';
  }

  return {
    score: Math.round(legitimacyScore),
    factors: {
      abnVerification,
      contactVerification,
      websiteVerification,
      locationVerification,
    },
    flags,
    recommendation,
  };
}

/**
 * Analyze content moderation factors
 */
function analyzeContentModeration(business: any) {
  let contentScore = 100;
  let spamIndicators = 0;
  let profanityDetected = false;
  let inappropriateContent = false;
  let duplicateContent = false;
  const flags: string[] = [];

  // Check business description for spam patterns
  if (business.bio) {
    const spamPatterns = [
      'click here', 'buy now', 'limited time offer', 'act fast', 'guaranteed',
      'free money', 'make money fast', '100% guaranteed', 'no risk', 'urgent',
      'call now', 'don\'t miss out', 'exclusive deal', 'once in a lifetime',
    ];

    spamPatterns.forEach(pattern => {
      if (business.bio.toLowerCase().includes(pattern)) {
        spamIndicators++;
        flags.push(`Spam pattern detected: "${pattern}"`);
      }
    });

    if (spamIndicators > 0) {
      contentScore -= Math.min(30, spamIndicators * 10);
    }

    // Check for excessive capitalization
    const capsRatio = (business.bio.match(/[A-Z]/g) || []).length / business.bio.length;
    if (capsRatio > 0.3) {
      flags.push('Excessive capitalization detected');
      contentScore -= 10;
    }

    // Check for excessive punctuation
    const punctuationCount = (business.bio.match(/[!?]{2,}/g) || []).length;
    if (punctuationCount > 0) {
      flags.push('Excessive punctuation detected');
      contentScore -= 5;
    }

    // Basic profanity detection (simplified)
    const profanityPatterns = ['damn', 'hell', 'crap']; // Very basic list
    profanityPatterns.forEach(word => {
      if (business.bio.toLowerCase().includes(word)) {
        profanityDetected = true;
        flags.push(`Potential profanity: "${word}"`);
        contentScore -= 15;
      }
    });
  }

  // Check content posts for moderation issues
  if (business.content && business.content.length > 0) {
    business.content.forEach((content: any) => {
      if (content.text) {
        // Similar checks for content posts
        const contentSpamCount = ['click here', 'buy now', 'limited time'].reduce((count, pattern) => {
          return count + (content.text.toLowerCase().includes(pattern) ? 1 : 0);
        }, 0);
        
        if (contentSpamCount > 0) {
          spamIndicators += contentSpamCount;
          flags.push(`Spam content in posts detected`);
          contentScore -= 5;
        }
      }
    });
  }

  contentScore = Math.max(0, contentScore);

  let recommendation = '';
  if (contentScore >= 90) {
    recommendation = 'Content passes moderation checks. No issues detected.';
  } else if (contentScore >= 75) {
    recommendation = 'Minor content issues detected. Review recommended.';
  } else if (contentScore >= 60) {
    recommendation = 'Moderate content issues. Cleanup required before approval.';
  } else {
    recommendation = 'Significant content issues. Manual review required.';
  }

  return {
    score: Math.round(contentScore),
    spamIndicators,
    profanityDetected,
    inappropriateContent,
    duplicateContent,
    flags,
    recommendation,
  };
}

/**
 * Analyze potential duplicates
 */
async function analyzeDuplicates(business: any) {
  // Find potential duplicates based on various matching criteria
  const potentialDuplicates = await prisma.business.findMany({
    where: {
      id: { not: business.id },
      approvalStatus: 'APPROVED',
      OR: [
        // Exact name match in same suburb
        {
          name: { equals: business.name, mode: 'insensitive' },
          suburb: business.suburb,
        },
        // Same phone number
        business.phone ? { phone: business.phone } : {},
        // Same email
        business.email ? { email: business.email } : {},
        // Same website
        business.website ? { website: business.website } : {},
        // Same ABN
        business.abn ? { abn: business.abn } : {},
      ].filter(condition => Object.keys(condition).length > 0),
    },
    select: {
      id: true,
      name: true,
      suburb: true,
      phone: true,
      email: true,
      website: true,
      abn: true,
      category: true,
      createdAt: true,
    },
    take: 10,
  });

  const duplicateDetails = potentialDuplicates.map(duplicate => {
    const matchingFields: string[] = [];
    let confidence = 0;

    // Calculate confidence based on matching fields
    if (business.name.toLowerCase() === duplicate.name.toLowerCase()) {
      matchingFields.push('name');
      confidence += 30;
    }
    
    if (business.suburb === duplicate.suburb) {
      matchingFields.push('suburb');
      confidence += 10;
    }
    
    if (business.phone && business.phone === duplicate.phone) {
      matchingFields.push('phone');
      confidence += 25;
    }
    
    if (business.email && business.email === duplicate.email) {
      matchingFields.push('email');
      confidence += 25;
    }
    
    if (business.website && business.website === duplicate.website) {
      matchingFields.push('website');
      confidence += 20;
    }
    
    if (business.abn && business.abn === duplicate.abn) {
      matchingFields.push('abn');
      confidence += 35;
    }

    let recommendation: 'merge' | 'mark_duplicate' | 'investigate';
    if (confidence >= 80) {
      recommendation = 'merge';
    } else if (confidence >= 60) {
      recommendation = 'mark_duplicate';
    } else {
      recommendation = 'investigate';
    }

    return {
      duplicateBusinessId: duplicate.id,
      duplicateBusinessName: duplicate.name,
      confidence: Math.min(100, confidence),
      matchingFields,
      recommendation,
    };
  });

  const duplicatesFound = duplicateDetails.length;
  const highConfidenceDuplicates = duplicateDetails.filter(d => d.confidence >= 80).length;
  const mediumConfidenceDuplicates = duplicateDetails.filter(d => d.confidence >= 60 && d.confidence < 80).length;
  const lowConfidenceDuplicates = duplicateDetails.filter(d => d.confidence < 60).length;

  let recommendation = '';
  if (duplicatesFound === 0) {
    recommendation = 'No duplicates detected. Safe to approve.';
  } else if (highConfidenceDuplicates > 0) {
    recommendation = `${highConfidenceDuplicates} high-confidence duplicate(s) found. Review required before approval.`;
  } else if (mediumConfidenceDuplicates > 0) {
    recommendation = `${mediumConfidenceDuplicates} potential duplicate(s) found. Investigation recommended.`;
  } else {
    recommendation = `${lowConfidenceDuplicates} low-confidence match(es) found. May proceed with caution.`;
  }

  return {
    duplicatesFound,
    highConfidenceDuplicates,
    mediumConfidenceDuplicates,
    lowConfidenceDuplicates,
    duplicateDetails,
    recommendation,
  };
}

/**
 * Calculate overall confidence score
 */
function calculateOverallConfidence(
  completeness: any,
  dataQuality: any,
  legitimacy: any,
  contentModeration: any,
  duplicateAnalysis: any
): number {
  // Weighted average of different factors
  const weights = {
    completeness: 0.25,
    dataQuality: 0.25,
    legitimacy: 0.30,
    contentModeration: 0.15,
    duplicates: 0.05,
  };

  // Duplicate penalty
  let duplicatePenalty = 0;
  if (duplicateAnalysis.highConfidenceDuplicates > 0) {
    duplicatePenalty = 30;
  } else if (duplicateAnalysis.mediumConfidenceDuplicates > 0) {
    duplicatePenalty = 15;
  } else if (duplicateAnalysis.lowConfidenceDuplicates > 0) {
    duplicatePenalty = 5;
  }

  const weightedScore = 
    (completeness.score * weights.completeness) +
    (dataQuality.score * weights.dataQuality) +
    (legitimacy.score * weights.legitimacy) +
    (contentModeration.score * weights.contentModeration) +
    ((100 - duplicatePenalty) * weights.duplicates);

  return Math.round(Math.max(0, Math.min(100, weightedScore)));
}

/**
 * Generate overall recommendation
 */
function generateOverallRecommendation(
  confidenceScore: number,
  completeness: any,
  dataQuality: any,
  legitimacy: any,
  contentModeration: any,
  duplicateAnalysis: any,
  threshold: number
): 'approve' | 'reject' | 'manual_review' {
  
  // Hard rejection criteria
  if (legitimacy.score < 40 || contentModeration.score < 40 || duplicateAnalysis.highConfidenceDuplicates > 0) {
    return 'reject';
  }

  // Manual review criteria
  if (confidenceScore < threshold || 
      completeness.score < 60 || 
      dataQuality.score < 60 ||
      duplicateAnalysis.mediumConfidenceDuplicates > 0 ||
      legitimacy.flags.some((flag: any) => flag.severity === 'high')) {
    return 'manual_review';
  }

  // Approval criteria
  if (confidenceScore >= threshold && 
      completeness.score >= 75 && 
      dataQuality.score >= 75 && 
      legitimacy.score >= 70) {
    return 'approve';
  }

  return 'manual_review';
}

// Helper functions for empty analyses
function getEmptyContentModerationAnalysis() {
  return {
    score: 100,
    spamIndicators: 0,
    profanityDetected: false,
    inappropriateContent: false,
    duplicateContent: false,
    flags: [],
    recommendation: 'Content moderation analysis skipped.',
  };
}

function getEmptyDuplicateAnalysis() {
  return {
    duplicatesFound: 0,
    highConfidenceDuplicates: 0,
    mediumConfidenceDuplicates: 0,
    lowConfidenceDuplicates: 0,
    duplicateDetails: [],
    recommendation: 'Duplicate analysis skipped.',
  };
}

/**
 * Generate rationale for the recommendation
 */
function generateRationale(
  recommendation: string,
  completeness: any,
  dataQuality: any,
  legitimacy: any,
  contentModeration: any,
  duplicateAnalysis: any
) {
  const primaryReasons: string[] = [];
  const supportingFactors: string[] = [];
  const riskFactors: string[] = [];
  const mitigatingFactors: string[] = [];

  // Primary reasons based on recommendation
  if (recommendation === 'approve') {
    primaryReasons.push('High confidence score indicates legitimate business');
    if (completeness.score >= 90) primaryReasons.push('Excellent profile completeness');
    if (legitimacy.score >= 80) primaryReasons.push('Strong legitimacy indicators');
  } else if (recommendation === 'reject') {
    if (legitimacy.score < 40) primaryReasons.push('Significant legitimacy concerns identified');
    if (contentModeration.score < 40) primaryReasons.push('Content moderation flags detected');
    if (duplicateAnalysis.highConfidenceDuplicates > 0) primaryReasons.push('High-confidence duplicates found');
  } else {
    primaryReasons.push('Requires human review due to moderate confidence');
    if (completeness.score < 60) primaryReasons.push('Profile completeness below threshold');
    if (dataQuality.score < 60) primaryReasons.push('Data quality issues detected');
  }

  // Supporting factors
  if (completeness.missingFields.length === 0) supportingFactors.push('All required fields completed');
  if (dataQuality.issues.length === 0) supportingFactors.push('No data quality issues found');
  if (legitimacy.flags.length === 0) supportingFactors.push('No legitimacy flags raised');
  if (contentModeration.spamIndicators === 0) supportingFactors.push('Clean content with no spam indicators');

  // Risk factors
  completeness.missingFields.forEach(field => riskFactors.push(`Missing required field: ${field}`));
  dataQuality.issues.filter((issue: any) => issue.severity === 'high').forEach((issue: any) => 
    riskFactors.push(`High severity ${issue.issue} in ${issue.field}`)
  );
  legitimacy.flags.forEach((flag: any) => riskFactors.push(flag.description));
  if (duplicateAnalysis.duplicatesFound > 0) riskFactors.push(`${duplicateAnalysis.duplicatesFound} potential duplicate(s) detected`);

  // Mitigating factors
  if (legitimacy.factors.abnVerification === 'verified') mitigatingFactors.push('ABN verified');
  if (legitimacy.factors.websiteVerification === 'verified') mitigatingFactors.push('Website appears legitimate');
  if (completeness.score >= 80) mitigatingFactors.push('High profile completeness');

  return {
    primaryReasons,
    supportingFactors,
    riskFactors,
    mitigatingFactors,
  };
}

/**
 * Generate actionable recommendations
 */
function generateRecommendations(
  recommendation: string,
  completeness: any,
  dataQuality: any,
  legitimacy: any,
  contentModeration: any,
  duplicateAnalysis: any
) {
  const immediate: string[] = [];
  const beforeApproval: string[] = [];
  const postApproval: string[] = [];
  const monitoring: string[] = [];

  if (recommendation === 'reject') {
    immediate.push('Reject business listing due to significant issues');
    immediate.push('Send detailed feedback to business owner');
    if (duplicateAnalysis.highConfidenceDuplicates > 0) {
      immediate.push('Merge with existing duplicate listing');
    }
  }

  if (recommendation === 'manual_review') {
    immediate.push('Queue for manual admin review');
    immediate.push('Flag for priority review if high-value business');
  }

  // Before approval recommendations
  completeness.missingFields.forEach((field: string) => {
    beforeApproval.push(`Request completion of ${field} field`);
  });

  dataQuality.issues.filter((issue: any) => issue.severity === 'high').forEach((issue: any) => {
    beforeApproval.push(`Address ${issue.issue} in ${issue.field}: ${issue.description}`);
  });

  if (legitimacy.factors.abnVerification === 'not_provided' && legitimacy.score < 70) {
    beforeApproval.push('Request ABN verification for additional legitimacy');
  }

  if (duplicateAnalysis.mediumConfidenceDuplicates > 0) {
    beforeApproval.push('Investigate potential duplicate listings before approval');
  }

  // Post approval recommendations
  if (recommendation === 'approve') {
    postApproval.push('Welcome email with onboarding information');
    postApproval.push('Set up quality score monitoring');
    
    if (completeness.score < 90) {
      postApproval.push('Encourage completion of optional profile fields');
    }
    
    if (!legitimacy.factors.abnVerification || legitimacy.factors.abnVerification === 'not_provided') {
      postApproval.push('Offer ABN verification as premium feature');
    }
  }

  // Monitoring recommendations
  monitoring.push('Monitor for customer complaints or negative feedback');
  monitoring.push('Track engagement metrics and lead generation');
  
  if (contentModeration.spamIndicators > 0) {
    monitoring.push('Monitor content updates for spam patterns');
  }
  
  if (duplicateAnalysis.lowConfidenceDuplicates > 0) {
    monitoring.push('Watch for additional duplicate indicators');
  }

  return {
    immediate,
    beforeApproval,
    postApproval,
    monitoring,
  };
}

/**
 * Generate manual override options
 */
function generateManualOverrideOptions(
  recommendation: string,
  confidenceScore: number,
  legitimacy: any,
  duplicateAnalysis: any
) {
  const allowed = recommendation === 'manual_review' || 
                 (recommendation === 'reject' && legitimacy.score > 30);
  
  const reasons: string[] = [];
  const requiredActions: string[] = [];

  if (recommendation === 'manual_review') {
    reasons.push('Confidence score below automatic threshold');
    reasons.push('Admin discretion can override based on business value');
    requiredActions.push('Document override reason');
    requiredActions.push('Set enhanced monitoring');
  }

  if (recommendation === 'reject' && allowed) {
    reasons.push('Soft rejection - issues may be addressable');
    reasons.push('Business may have high strategic value');
    requiredActions.push('Document detailed override justification');
    requiredActions.push('Require business owner corrections');
    requiredActions.push('Set strict monitoring and review schedule');
    
    if (duplicateAnalysis.highConfidenceDuplicates > 0) {
      requiredActions.push('Resolve duplicate business conflicts');
    }
  }

  return allowed ? {
    allowed,
    reasons,
    requiredActions,
  } : undefined;
}