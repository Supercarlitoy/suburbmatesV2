import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/database/prisma';
import { logAuditEvent } from '@/lib/utils/audit';
import { AILeadQualification } from '@/lib/services/ai-automation';
import { trackLeadSubmission } from '@/lib/ga4mp';
import * as Sentry from '@sentry/nextjs';

// Validation schema for business inquiry
const InquirySchema = z.object({
  businessId: z.string().min(1, 'Business ID is required'),
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().optional(),
  message: z.string().min(10, 'Message must be at least 10 characters'),
  utmSource: z.string().optional(),
  utmMedium: z.string().optional(),
  utmCampaign: z.string().optional(),
  source: z.string().optional(), // URL where inquiry originated
});

export async function POST(request: NextRequest) {
  let requestBody: any = null;
  try {
    // Parse request body
    let requestBody: any = null;
    const body = await request.json();
    requestBody = body;
    
    // Validate input
    const validatedData = InquirySchema.parse(body);
    
    // Verify the business exists
    const business = await prisma.business.findUnique({
      where: { id: validatedData.businessId },
      select: { id: true, name: true, email: true, ownerId: true },
    });

    if (!business) {
      return NextResponse.json(
        { error: 'Business not found' },
        { status: 404 }
      );
    }

    // Prepare UTM tracking data
    const utmData = {
      source: validatedData.utmSource,
      medium: validatedData.utmMedium,
      campaign: validatedData.utmCampaign,
      referrer: validatedData.source,
    };

    // Run AI lead qualification
    let leadQualification = null;
    let inquiryStatus = 'NEW';
    
    try {
      leadQualification = await AILeadQualification.qualifyLead({
        name: validatedData.name,
        email: validatedData.email,
        phone: validatedData.phone,
        message: validatedData.message,
        source: validatedData.source,
      });
      
      // Auto-reject spam leads
      if (leadQualification.priority === 'spam') {
        inquiryStatus = 'SPAM';
      }
    } catch (aiError) {
      console.error('AI lead qualification failed:', aiError);
      // Continue with normal processing if AI fails
    }

    // Create the inquiry with AI analysis
    const inquiry = await prisma.inquiry.create({
      data: {
        businessId: validatedData.businessId,
        name: validatedData.name,
        email: validatedData.email,
        phone: validatedData.phone || null,
        message: validatedData.message,
        utm: utmData,
      },
    });

    // Log audit event
    await logAuditEvent({
      action: 'SUBMIT_BUSINESS_INQUIRY',
      target: validatedData.businessId,
      meta: {
        inquiryId: inquiry.id,
        businessName: business.name,
        customerName: validatedData.name,
        customerEmail: validatedData.email,
        utmData,
      },
      ipAddress: request.headers.get('x-forwarded-for') || 
                 request.headers.get('x-real-ip') || 
                 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
    });

    // Track server-side lead submission event
    await trackLeadSubmission(validatedData.businessId, 'profile');

    // TODO: Send email notifications
    // - Notify business owner of new inquiry
    // - Send confirmation email to customer
    // - Add to email queue for follow-up sequences

    try {
      // Send notification email to business (implement based on your email system)
      const emailResponse = await fetch('/api/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: business.email,
          template: 'new-inquiry',
          data: {
            businessName: business.name,
            customerName: validatedData.name,
            customerEmail: validatedData.email,
            customerPhone: validatedData.phone,
            message: validatedData.message,
            inquiryId: inquiry.id,
          },
        }),
      });
      
      if (!emailResponse.ok) {
        console.error('Failed to send notification email');
      }
    } catch (emailError) {
      console.error('Email notification error:', emailError);
      // Don't fail the inquiry if email fails
    }
    
    // Return success response
    return NextResponse.json({
      success: true,
      message: 'Inquiry submitted successfully',
      inquiry: {
        id: inquiry.id,
        submittedAt: inquiry.createdAt,
        businessName: business.name,
      },
    });

  } catch (error) {
    console.error('Inquiry submission error:', error);

    // Capture error in Sentry with context
    Sentry.captureException(error, {
      tags: {
        api_route: 'business_inquiry',
        action: 'submit',
      },
      extra: {
        businessId: requestBody?.businessId,
        requestUrl: request.url,
        userAgent: request.headers.get('user-agent'),
      },
    });

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

    // Generic error response
    return NextResponse.json(
      { error: 'Failed to submit inquiry' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const businessId = searchParams.get('businessId');
    
    if (!businessId) {
      return NextResponse.json(
        { error: 'Business ID is required' },
        { status: 400 }
      );
    }

    // Get inquiries for the business
    const inquiries = await prisma.inquiry.findMany({
      where: { businessId },
      orderBy: { createdAt: 'desc' },
      take: 50, // Limit to recent inquiries
    });

    return NextResponse.json({
      inquiries: inquiries.map(inquiry => ({
        id: inquiry.id,
        name: inquiry.name,
        email: inquiry.email,
        phone: inquiry.phone,
        message: inquiry.message,
        utm: inquiry.utm,
        createdAt: inquiry.createdAt,
      })),
    });

  } catch (error) {
    console.error('Failed to fetch inquiries:', error);
    return NextResponse.json(
      { error: 'Failed to fetch inquiries' },
      { status: 500 }
    );
  }
}