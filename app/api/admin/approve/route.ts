import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getCurrentUser, isAdmin } from "@/server/auth/auth";
import { z } from "zod";

const prisma = new PrismaClient();

const ApprovalSchema = z.object({
  businessId: z.string(),
  action: z.enum(['approve', 'reject'])
});

export async function POST(request: NextRequest) {
  try {
    // Check if user is admin
    const user = await getCurrentUser();
    if (!user || !(await isAdmin())) {
      return NextResponse.json(
        { error: "Unauthorized. Admin access required." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { businessId, action } = ApprovalSchema.parse(body);

    // Get business details before updating
    const business = await prisma.business.findUnique({
      where: { id: businessId },
      include: {
        user: {
          select: {
            email: true
          }
        }
      }
    });

    if (!business) {
      return NextResponse.json(
        { error: "Business not found" },
        { status: 404 }
      );
    }

    // Update business status
    const newStatus = action === 'approve' ? 'APPROVED' : 'REJECTED';
    const updatedBusiness = await prisma.business.update({
      where: { id: businessId },
      data: { 
        status: newStatus,
        updatedAt: new Date()
      }
    });

    // Send notification email to business owner
    try {
      const emailType = action === 'approve' ? 'approval' : 'rejection';
      await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/email/${emailType}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: business.email,
          businessName: business.name,
          slug: business.slug,
          suburb: business.suburb
        })
      });
    } catch (emailError) {
      console.error('Failed to send notification email:', emailError);
      // Don't fail the approval if email fails
    }

    return NextResponse.json({
      success: true,
      message: `Business ${action}d successfully`,
      business: {
        id: updatedBusiness.id,
        name: updatedBusiness.name,
        status: updatedBusiness.status,
        slug: updatedBusiness.slug
      }
    });

  } catch (error) {
    console.error("Business approval error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to process approval" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}