// OG Image Generator API
import { NextRequest } from 'next/server';
import { ImageResponse } from 'next/og';
import { prisma } from '@/lib/prisma';
import React from 'react';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');

    if (!slug) {
      return new Response('Missing slug parameter', { status: 400 });
    }

    // Fetch business data
    const business = await prisma.business.findUnique({
      where: { slug },
      include: {
        customization: true
      }
    });

    if (!business) {
      return new Response('Business not found', { status: 404 });
    }

    // Determine colors based on theme
const getThemeColors = (customization: { accent?: string } | null | undefined) => {
      const accent: string = customization?.accent || 'BLUE';
      
      const colorMap: Record<string, { primary: string; secondary: string; text: string }> = {
        BLUE: { primary: '#2563eb', secondary: '#dbeafe', text: '#1e40af' },
        MINT: { primary: '#059669', secondary: '#d1fae5', text: '#065f46' },
        AMBER: { primary: '#d97706', secondary: '#fef3c7', text: '#92400e' },
        PURPLE: { primary: '#7c3aed', secondary: '#ede9fe', text: '#5b21b6' },
        RED: { primary: '#dc2626', secondary: '#fecaca', text: '#991b1b' },
        GREEN: { primary: '#16a34a', secondary: '#dcfce7', text: '#15803d' }
      };

      return colorMap[accent] || colorMap.BLUE;
    };

    const colors = getThemeColors(business.customization);

    return new ImageResponse(
      (
        <div
          style={{
            background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.text} 100%)`,
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '60px',
            fontFamily: 'Inter, sans-serif',
          }}
        >
          {/* SuburbMates Logo/Branding */}
          <div
            style={{
              position: 'absolute',
              top: '40px',
              right: '40px',
              display: 'flex',
              alignItems: 'center',
              color: 'white',
              fontSize: '18px',
              fontWeight: '600',
              opacity: 0.9,
            }}
          >
            SuburbMates
          </div>

          {/* Main Content */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              color: 'white',
              maxWidth: '800px',
            }}
          >
            {/* Business Name */}
            <h1
              style={{
                fontSize: '64px',
                fontWeight: '800',
                margin: '0',
                marginBottom: '24px',
                textShadow: '0 4px 8px rgba(0,0,0,0.3)',
                lineHeight: '1.1',
              }}
            >
              {business.name}
            </h1>

            {/* Business Bio/Description */}
            {business.bio && (
              <p
                style={{
                  fontSize: '24px',
                  fontWeight: '400',
                  margin: '0',
                  marginBottom: '32px',
                  opacity: 0.95,
                  lineHeight: '1.4',
                  maxWidth: '600px',
                }}
              >
                {business.bio.length > 120 ? `${business.bio.substring(0, 120)}...` : business.bio}
              </p>
            )}

            {/* Location & Category */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '24px',
                fontSize: '20px',
                fontWeight: '500',
                opacity: 0.9,
              }}
            >
              {business.suburb && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  📍 {business.suburb}
                </div>
              )}
              {business.category && business.suburb && (
                <div style={{ opacity: 0.7 }}>•</div>
              )}
              {business.category && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  🏢 {business.category}
                </div>
              )}
            </div>
          </div>

          {/* Bottom Gradient Overlay */}
          <div
            style={{
              position: 'absolute',
              bottom: '0',
              left: '0',
              right: '0',
              height: '120px',
              background: 'linear-gradient(to top, rgba(0,0,0,0.2), transparent)',
            }}
          />

          {/* Decorative Elements */}
          <div
            style={{
              position: 'absolute',
              top: '0',
              left: '0',
              right: '0',
              bottom: '0',
              opacity: 0.05,
              background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="1"%3E%3Cpath d="m36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
            }}
          />
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );

  } catch (error) {
    console.error('OG image generation error:', error);
    return new Response('Failed to generate image', { status: 500 });
  }
}