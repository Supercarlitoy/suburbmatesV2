import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/database/prisma";
import { z } from "zod";

const businessProfileSchema = z.object({
  name: z.string().min(1, "Business name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().optional(),
  website: z.string().url().optional().or(z.literal("")),
  bio: z.string().optional(),
  suburb: z.string().min(1, "Suburb is required"),
  postcode: z.string().optional(),
  category: z.string().min(1, "Category is required"),
  serviceAreas: z.string().optional(),
  abn: z.string().optional(),
});

// GET - Fetch user's business profile
export async function GET(_request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

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

    return NextResponse.json(business);
  } catch (error) {
    console.error('GET business profile error:', error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST - Create new business profile
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check if user already has a business profile
    const existingBusiness = await prisma.business.findFirst({
      where: {
        ownerId: session.user.id,
      },
    });

    if (existingBusiness) {
      return NextResponse.json(
        { error: "Business profile already exists" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const validatedData = businessProfileSchema.parse(body);

    // Generate slug from business name
    const slug = validatedData.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
      + '-' + Math.random().toString(36).substring(2, 8);

    const business = await prisma.business.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        phone: validatedData.phone || undefined,
        website: validatedData.website || undefined,
        bio: validatedData.bio || undefined,
        suburb: validatedData.suburb,
        postcode: validatedData.postcode || undefined,
        category: validatedData.category || undefined,
        serviceAreas: validatedData.serviceAreas || "",
        abn: validatedData.abn || undefined,
        slug,
        ownerId: session.user.id,
        approvalStatus: 'APPROVED', // Auto-approve for development
      },
    });

    return NextResponse.json(business, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }

    console.error('POST business profile error:', error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT - Update existing business profile
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

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

    const body = await request.json();
    const validatedData = businessProfileSchema.parse(body);

    // Update slug if name changed
    let slug = business.slug;
    if (validatedData.name !== business.name) {
      slug = validatedData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
        + '-' + Math.random().toString(36).substring(2, 8);
    }

    const updatedBusiness = await prisma.business.update({
      where: {
        id: business.id,
      },
      data: {
        name: validatedData.name,
        email: validatedData.email,
        phone: validatedData.phone || undefined,
        website: validatedData.website || undefined,
        bio: validatedData.bio || undefined,
        suburb: validatedData.suburb,
        postcode: validatedData.postcode || undefined,
        category: validatedData.category || undefined,
        serviceAreas: validatedData.serviceAreas || "",
        abn: validatedData.abn || undefined,
        slug,
      },
    });

    return NextResponse.json(updatedBusiness);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }

    console.error('PUT business profile error:', error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE - Delete business profile
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

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

    await prisma.business.delete({
      where: {
        id: business.id,
      },
    });

    return NextResponse.json({ message: "Business profile deleted successfully" });
  } catch (error) {
    console.error('DELETE business profile error:', error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}