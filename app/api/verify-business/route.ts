import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/database/prisma";
import { verifyABN, ABRVerificationError } from "@/features/verification/services/abr";
import { z } from "zod";

const VerifyBusinessSchema = z.object({
  businessId: z.string(),
  abn: z.string().min(11, "ABN must be 11 digits")
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { businessId, abn } = VerifyBusinessSchema.parse(body);

    // Get business from database
    const business = await prisma.business.findUnique({
      where: { id: businessId },
      select: {
        id: true,
        name: true,
        abn: true,
        abnStatus: true
      }
    });

    if (!business) {
      return NextResponse.json(
        { error: "Business not found" },
        { status: 404 }
      );
    }

    // Check if already verified
    if (business.abnStatus === 'VERIFIED') {
      return NextResponse.json(
        { error: "Business is already verified" },
        { status: 400 }
      );
    }

    // Verify ABN using ABR API with your GUID
    let abrData;
    let aiRecommendation = 'pending'; // Default to manual review
    let verificationNotes = '';

    try {
      abrData = await verifyABN(abn);
      
      // AI-Assisted Verification Logic
      const aiVerification = performAIVerification(business, abrData);
      aiRecommendation = aiVerification.recommendation;
      verificationNotes = aiVerification.notes;
      
    } catch (error) {
      if (error instanceof ABRVerificationError) {
        // Store failed verification attempt
        await prisma.business.update({
          where: { id: businessId },
          data: {
            abnStatus: 'INVALID'
          }
        });

        return NextResponse.json(
          { 
            error: "ABN verification failed", 
            details: error.message,
            status: 'rejected'
          },
          { status: 400 }
        );
      }
      throw error;
    }

    // Update business with verification data
    const updatedBusiness = await prisma.business.update({
      where: { id: businessId },
      data: {
        abn: abrData.ABN, // Update with verified ABN format
        abnStatus: aiRecommendation === 'auto_approve' ? 'VERIFIED' : 'PENDING'
      }
    });

    return NextResponse.json({
      success: true,
      status: updatedBusiness.abnStatus,
      aiRecommendation,
      businessData: {
        entityName: abrData.entityName,
        abn: abrData.ABN,
        status: abrData.status,
        gst: abrData.GST,
        address: abrData.address,
        entityType: abrData.entityType
      },
      message: aiRecommendation === 'auto_approve' 
        ? 'Business automatically verified by AI'
        : 'Verification submitted for admin review'
    });

  } catch (error) {
    console.error("Business verification error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Verification failed. Please try again." },
      { status: 500 }
    );
  }
}

/**
 * AI-Assisted Verification Logic
 * Analyzes ABR data to determine if business can be auto-approved
 */
function performAIVerification(business: any, abrData: any) {
  const checks = {
    nameMatch: false,
    statusActive: false,
    gstRegistered: false,
    addressComplete: false,
    entityTypeValid: false
  };

  let score = 0;
  const notes = [];

  // Check 1: Business name similarity
  const businessName = business.name.toLowerCase().trim();
  const abrName = (abrData.entityName || '').toLowerCase().trim();
  const businessNameAlt = (abrData.businessName || '').toLowerCase().trim();
  
  if (abrName.includes(businessName) || businessName.includes(abrName) ||
      businessNameAlt.includes(businessName) || businessName.includes(businessNameAlt)) {
    checks.nameMatch = true;
    score += 25;
    notes.push('✓ Business name matches ABR records');
  } else {
    notes.push('⚠ Business name does not closely match ABR records');
  }

  // Check 2: ABN Status
  if (abrData.status === 'Active' || abrData.abnStatus === 'Active') {
    checks.statusActive = true;
    score += 25;
    notes.push('✓ ABN status is Active');
  } else {
    notes.push(`⚠ ABN status: ${abrData.status || abrData.abnStatus || 'Unknown'}`);
  }

  // Check 3: GST Registration (positive indicator)
  if (abrData.GST === true) {
    checks.gstRegistered = true;
    score += 15;
    notes.push('✓ GST registered');
  } else {
    notes.push('• Not GST registered (not required)');
  }

  // Check 4: Address completeness
  if (abrData.address && abrData.address.state && abrData.address.postcode) {
    checks.addressComplete = true;
    score += 15;
    notes.push('✓ Complete address information available');
  } else {
    notes.push('⚠ Limited address information');
  }

  // Check 5: Valid entity type
  const validEntityTypes = [
    'Australian Private Company',
    'Australian Public Company', 
    'Sole Trader',
    'Partnership',
    'Trust',
    'Other Incorporated Entity'
  ];
  
  if (abrData.entityType && validEntityTypes.some(type => 
    abrData.entityType.toLowerCase().includes(type.toLowerCase()))) {
    checks.entityTypeValid = true;
    score += 20;
    notes.push(`✓ Valid entity type: ${abrData.entityType}`);
  } else {
    notes.push(`⚠ Entity type: ${abrData.entityType || 'Unknown'}`);
  }

  // AI Decision Logic
  let recommendation;
  if (score >= 80 && checks.nameMatch && checks.statusActive) {
    recommendation = 'auto_approve';
    notes.unshift(`🤖 AI Recommendation: AUTO-APPROVE (Score: ${score}/100)`);
  } else if (score >= 50) {
    recommendation = 'pending';
    notes.unshift(`🤖 AI Recommendation: MANUAL REVIEW (Score: ${score}/100)`);
  } else {
    recommendation = 'reject';
    notes.unshift(`🤖 AI Recommendation: REJECT (Score: ${score}/100)`);
  }

  return {
    recommendation,
    score,
    checks,
    notes: notes.join('\n')
  };
}