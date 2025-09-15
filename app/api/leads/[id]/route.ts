import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/database/prisma";
import { z } from "zod";

const updateLeadSchema = z.object({
  status: z.enum(['NEW', 'CONTACTED', 'QUALIFIED', 'CONVERTED', 'CLOSED']).optional(),
});

// GET - Fetch individual lead
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get user's business
    const business = await prisma.business.findUnique({
      where: {
        userId: session.user.id,
      },
    });

    if (!business) {
      return NextResponse.json(
        { error: "Business profile not found" },
        { status: 404 }
      );
    }

    // Get the lead
    const lead = await prisma.lead.findUnique({
      where: {
        id,
        businessId: business.id, // Ensure user owns this lead
      },
    });

    if (!lead) {
      return NextResponse.json(
        { error: "Lead not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(lead);
  } catch (error) {
    console.error('GET lead error:', error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT - Update lead status
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get user's business
    const business = await prisma.business.findUnique({
      where: {
        userId: session.user.id,
      },
    });

    if (!business) {
      return NextResponse.json(
        { error: "Business profile not found" },
        { status: 404 }
      );
    }

    // Verify lead exists and belongs to user
    const existingLead = await prisma.lead.findUnique({
      where: {
        id,
        businessId: business.id,
      },
    });

    if (!existingLead) {
      return NextResponse.json(
        { error: "Lead not found" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const validatedData = updateLeadSchema.parse(body);

    // Update the lead
    const updatedLead = await prisma.lead.update({
      where: {
        id,
      },
      data: validatedData,
    });

    return NextResponse.json(updatedLead);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }

    console.error('PUT lead error:', error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE - Delete lead
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get user's business
    const business = await prisma.business.findUnique({
      where: {
        userId: session.user.id,
      },
    });

    if (!business) {
      return NextResponse.json(
        { error: "Business profile not found" },
        { status: 404 }
      );
    }

    // Verify lead exists and belongs to user
    const existingLead = await prisma.lead.findUnique({
      where: {
        id,
        businessId: business.id,
      },
    });

    if (!existingLead) {
      return NextResponse.json(
        { error: "Lead not found" },
        { status: 404 }
      );
    }

    // Delete the lead
    await prisma.lead.delete({
      where: {
        id,
      },
    });

    return NextResponse.json({ message: "Lead deleted successfully" });
  } catch (error) {
    console.error('DELETE lead error:', error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}