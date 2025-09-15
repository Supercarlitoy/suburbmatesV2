import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/database/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get user's business profile
    const business = await prisma.business.findUnique({
      where: {
        userId: session.user.id,
      },
    });

    let leadsCount = 0;
    let recentLeads: any[] = [];

    if (business) {
      // Get total leads count
      leadsCount = await prisma.lead.count({
        where: {
          businessId: business.id,
        },
      });

      // Get recent leads (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      recentLeads = await prisma.lead.findMany({
        where: {
          businessId: business.id,
          createdAt: {
            gte: thirtyDaysAgo,
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 5,
      });
    }

    return NextResponse.json({
      business,
      leadsCount,
      recentLeads,
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}