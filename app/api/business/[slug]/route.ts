import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  try {
    const business = await prisma.business.findUnique({
      where: { slug },
      include: {
        owner: {
          select: {
            email: true
          }
        }
      }
    });

    if (!business || business.approvalStatus !== 'APPROVED') {
      return NextResponse.json(
        { error: 'Business not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(business);
  } catch (error) {
    console.error('Error fetching business:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}