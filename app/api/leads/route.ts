import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/database/prisma";
import { z } from "zod";

const createLeadSchema = z.object({
  businessId: z.string().min(1, "Business ID is required"),
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().optional(),
  message: z.string().min(1, "Message is required"),
  source: z.enum(['PROFILE', 'SEARCH', 'FEED', 'SHARE']).optional().default('PROFILE'),
});

const updateLeadSchema = z.object({
  status: z.enum(['NEW', 'CONTACTED', 'QUALIFIED', 'CONVERTED', 'CLOSED']).optional(),
});

// GET - Fetch leads for authenticated business owner
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Get user's business
    const business = await prisma.business.findFirst({
      where: {
        ownerId: session.user.id,
      },
    });

    if (!business) {
      return NextResponse.json(
        { error: "Business profile not found" },
        { status: 404 }
      );
    }

    // Build where clause
    const whereClause: any = {
      businessId: business.id,
    };

    if (status && ['NEW', 'CONTACTED', 'QUALIFIED', 'CONVERTED', 'CLOSED'].includes(status)) {
      whereClause.status = status;
    }

    // Get leads with pagination
    const [leads, totalCount] = await Promise.all([
      prisma.lead.findMany({
        where: whereClause,
        orderBy: {
          createdAt: 'desc',
        },
        take: limit,
        skip: offset,
      }),
      prisma.lead.count({
        where: whereClause,
      }),
    ]);

    return NextResponse.json({
      leads,
      pagination: {
        total: totalCount,
        limit,
        offset,
        hasMore: offset + limit < totalCount,
      },
    });
  } catch (error) {
    console.error('GET leads error:', error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST - Create new lead (public endpoint for contact forms)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = createLeadSchema.parse(body);

    // Verify business exists and is approved
  const business = await prisma.business.findUnique({
    where: {
      id: validatedData.businessId,
    },
  });

  if (!business || business.approvalStatus !== 'APPROVED') {
    return NextResponse.json(
      { error: "Business not found or not approved" },
      { status: 404 }
    );
  }

    if (!business) {
      return NextResponse.json(
        { error: "Business not found or not approved" },
        { status: 404 }
      );
    }

    // Create the lead
    const lead = await prisma.lead.create({
      data: {
        businessId: validatedData.businessId,
        name: validatedData.name,
        email: validatedData.email,
        phone: validatedData.phone,
        message: validatedData.message,
        source: validatedData.source,
        status: 'NEW',
      },
    });

    // TODO: Send email notification to business owner
    // This would be implemented with a real email service in production
    console.log(`New lead created for business ${business.name}:`, {
      leadId: lead.id,
      customerName: lead.name,
      customerEmail: lead.email,
      message: lead.message,
    });

    return NextResponse.json(lead, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }

    console.error('POST lead error:', error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}