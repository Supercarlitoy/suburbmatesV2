import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getCurrentUser, isAdmin } from "@/server/auth/auth";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    // Check if user is admin
    const user = await getCurrentUser();
    if (!user || !(await isAdmin())) {
      return NextResponse.json(
        { error: "Unauthorized. Admin access required." },
        { status: 403 }
      );
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status'); // 'PENDING', 'APPROVED', 'REJECTED'
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Build where clause
    const where = status ? { status: status as any } : {};

    // Fetch businesses with user data
    const businesses = await prisma.business.findMany({
      where,
      include: {
        user: {
          select: {
            email: true,
            createdAt: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: limit,
      skip: offset
    });

    // Get total count for pagination
    const total = await prisma.business.count({ where });

    return NextResponse.json({
      success: true,
      businesses,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total
      }
    });

  } catch (error: unknown) {
    console.error("Admin businesses fetch error:", error);

    return NextResponse.json(
      { error: "Failed to fetch businesses" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}