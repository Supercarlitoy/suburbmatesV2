import { NextRequest, NextResponse } from 'next/server';
import { geocodeAddress } from '@/lib/services/mapbox';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const address = searchParams.get('address');

  if (!address) {
    return NextResponse.json(
      { error: 'Address parameter is required' },
      { status: 400 }
    );
  }

  try {
    const result = await geocodeAddress(address);
    
    if (!result) {
      return NextResponse.json(
        { error: 'Unable to geocode address' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Geocoding API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { address } = body;

    if (!address) {
      return NextResponse.json(
        { error: 'Address is required' },
        { status: 400 }
      );
    }

    const result = await geocodeAddress(address);
    
    if (!result) {
      return NextResponse.json(
        { error: 'Unable to geocode address' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Geocoding API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}