import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser, isAdmin } from "@/server/auth/auth";
import { AdminBusinessService } from "@/lib/services/admin-business";
import { prisma } from "@/lib/database/prisma";
import { z } from "zod";

// UTM Analytics Data Interfaces
interface UTMCampaignData {
  campaign: string;
  source: string;
  medium: string;
  content?: string;
  sessions: number;
  users: number;
  newUsers: number;
  leads: number;
  conversions: number;
  conversionRate: number;
  adSpend: number;
  revenue: number;
  roi: number;
  roas: number; // Return on Ad Spend
  cpl: number; // Cost Per Lead
  cpc: number; // Cost Per Click
  averageSessionDuration: number;
  bounceRate: number;
  previousPeriodData: {
    sessions: number;
    conversions: number;
    revenue: number;
  };
}

interface ConversionFunnelData {
  stage: string;
  sessions: number;
  conversions: number;
  conversionRate: number;
  dropOffRate: number;
  averageTime: number; // in minutes
}

interface AttributionModelData {
  model: string;
  sessions: number;
  conversions: number;
  revenue: number;
  weight: number;
}

interface CampaignOptimization {
  campaign: string;
  currentPerformance: {
    cpl: number;
    conversionRate: number;
    roi: number;
  };
  recommendations: {
    type: 'budget' | 'targeting' | 'creative' | 'bidding' | 'audience';
    recommendation: string;
    expectedImpact: string;
    priority: 'high' | 'medium' | 'low';
    potentialGains: {
      cplReduction?: number;
      conversionIncrease?: number;
      roiImprovement?: number;
    };
  }[];
}

const UTMAnalyticsSchema = z.object({
  // Date range
  dateRange: z.enum(['7d', '30d', '90d', '1y']).optional().default('30d'),
  
  // UTM Filters
  source: z.string().optional().default('all'),
  medium: z.string().optional().default('all'),
  campaign: z.string().optional().default('all'),
  
  // Advanced Filters
  minSessions: z.string().optional().default(''),
  minConversions: z.string().optional().default(''),
  minSpend: z.string().optional().default(''),
  
  // Sorting
  sortBy: z.enum(['sessions', 'conversions', 'revenue', 'roi', 'spend']).optional().default('sessions'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
  
  // Analysis Options
  includeAttribution: z.boolean().optional().default(true),
  includeFunnel: z.boolean().optional().default(true),
  includeOptimization: z.boolean().optional().default(true),
});

/**
 * GET /api/admin/analytics/utm
 * Get UTM campaign analytics with attribution modeling and optimization recommendations
 */
export async function GET(request: NextRequest) {
  try {
    // Check admin authentication
    const user = await getCurrentUser();
    if (!user || !(await isAdmin())) {
      return NextResponse.json(
        { error: "Unauthorized. Admin access required." },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const queryParams = Object.fromEntries(searchParams.entries());
    
    // Parse and validate query parameters
    const validationResult = UTMAnalyticsSchema.safeParse({
      ...queryParams,
      includeAttribution: queryParams.includeAttribution !== 'false',
      includeFunnel: queryParams.includeFunnel !== 'false',
      includeOptimization: queryParams.includeOptimization !== 'false',
    });

    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: "Invalid query parameters",
          details: validationResult.error.issues
        },
        { status: 400 }
      );
    }

    const params = validationResult.data;
    const adminService = new AdminBusinessService(prisma);

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    
    switch (params.dateRange) {
      case '7d':
        startDate.setDate(endDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(endDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(endDate.getDate() - 90);
        break;
      case '1y':
        startDate.setFullYear(endDate.getFullYear() - 1);
        break;
    }

    // Generate UTM analytics data
    const utmAnalytics = await generateUTMAnalytics(params, startDate, endDate);

    // Log the admin access
    await adminService.logAdminAccess(
      'ADMIN_ANALYTICS_UTM_VIEW',
      null,
      user.id,
      {
        dateRange: params.dateRange,
        source: params.source,
        medium: params.medium,
        campaign: params.campaign,
        totalCampaigns: utmAnalytics.campaigns.length,
        includeAttribution: params.includeAttribution,
        includeFunnel: params.includeFunnel,
        includeOptimization: params.includeOptimization,
      }
    );

    return NextResponse.json({
      success: true,
      data: utmAnalytics,
      metadata: {
        dateRange: {
          start: startDate.toISOString(),
          end: endDate.toISOString(),
          period: params.dateRange
        },
        filters: {
          source: params.source,
          medium: params.medium,
          campaign: params.campaign
        },
        totalCampaigns: utmAnalytics.campaigns.length
      }
    });

  } catch (error) {
    console.error('Error in UTM analytics endpoint:', error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * Generate UTM Analytics Data
 */
async function generateUTMAnalytics(
  params: z.infer<typeof UTMAnalyticsSchema>,
  startDate: Date,
  endDate: Date
) {
  // Get UTM data from inquiries
  const utmInquiries = await prisma.inquiry.findMany({
    where: {
      createdAt: {
        gte: startDate,
        lte: endDate
      },
      utm: {
        not: null
      }
    },
    include: {
      business: {
        select: {
          id: true,
          name: true,
          category: true,
          approvalStatus: true,
          leads: {
            where: {
              createdAt: {
                gte: startDate,
                lte: endDate
              }
            },
            select: {
              status: true,
              createdAt: true
            }
          }
        }
      }
    }
  });

  // Process UTM data and group by campaigns
  const campaignMap = new Map<string, any>();
  
  utmInquiries.forEach(inquiry => {
    const utm = inquiry.utm as any;
    const campaign = utm?.utm_campaign || 'direct';
    const source = utm?.utm_source || 'direct';
    const medium = utm?.utm_medium || 'none';
    const content = utm?.utm_content || '';

    const campaignKey = `${campaign}-${source}-${medium}`;
    
    if (!campaignMap.has(campaignKey)) {
      campaignMap.set(campaignKey, {
        campaign,
        source,
        medium,
        content,
        sessions: 0,
        users: 0,
        newUsers: 0,
        leads: 0,
        conversions: 0,
        inquiries: [],
        businesses: new Set(),
        timestamps: []
      });
    }

    const campaignData = campaignMap.get(campaignKey);
    campaignData.sessions += 1;
    campaignData.users += 1; // Simplified - each inquiry represents a user session
    campaignData.newUsers += 1;
    campaignData.leads += 1;
    campaignData.inquiries.push(inquiry);
    campaignData.businesses.add(inquiry.business.id);
    campaignData.timestamps.push(inquiry.createdAt);
    
    // Count conversions based on lead status
    const conversions = inquiry.business.leads.filter(lead => 
      ['QUALIFIED', 'CONVERTED', 'CLOSED'].includes(lead.status)
    ).length;
    campaignData.conversions += conversions;
  });

  // Convert map to array and calculate metrics
  const campaigns: UTMCampaignData[] = Array.from(campaignMap.values()).map(data => {
    // Simulated metrics (in a real implementation, these would come from actual analytics)
    const adSpend = Math.random() * 1000 + 100; // Simulated ad spend
    const revenue = data.conversions * (Math.random() * 500 + 200); // Simulated revenue per conversion
    const averageSessionDuration = Math.random() * 300 + 60; // 1-6 minutes
    const bounceRate = Math.random() * 0.4 + 0.3; // 30-70%
    
    const conversionRate = data.sessions > 0 ? data.conversions / data.sessions : 0;
    const roi = adSpend > 0 ? (revenue - adSpend) / adSpend : 0;
    const roas = adSpend > 0 ? revenue / adSpend : 0;
    const cpl = data.leads > 0 ? adSpend / data.leads : 0;
    const cpc = data.sessions > 0 ? adSpend / data.sessions : 0;

    return {
      campaign: data.campaign,
      source: data.source,
      medium: data.medium,
      content: data.content,
      sessions: data.sessions,
      users: data.users,
      newUsers: data.newUsers,
      leads: data.leads,
      conversions: data.conversions,
      conversionRate,
      adSpend,
      revenue,
      roi,
      roas,
      cpl,
      cpc,
      averageSessionDuration,
      bounceRate,
      previousPeriodData: {
        sessions: Math.floor(data.sessions * (0.8 + Math.random() * 0.4)), // Simulated previous period
        conversions: Math.floor(data.conversions * (0.8 + Math.random() * 0.4)),
        revenue: revenue * (0.8 + Math.random() * 0.4)
      }
    };
  });

  // Apply filters
  let filteredCampaigns = campaigns.filter(campaign => {
    if (params.source !== 'all' && campaign.source !== params.source) return false;
    if (params.medium !== 'all' && campaign.medium !== params.medium) return false;
    if (params.campaign !== 'all' && campaign.campaign !== params.campaign) return false;
    if (params.minSessions && campaign.sessions < parseInt(params.minSessions)) return false;
    if (params.minConversions && campaign.conversions < parseInt(params.minConversions)) return false;
    if (params.minSpend && campaign.adSpend < parseFloat(params.minSpend)) return false;
    return true;
  });

  // Sort campaigns
  filteredCampaigns.sort((a, b) => {
    const sortValue = params.sortOrder === 'desc' ? -1 : 1;
    switch (params.sortBy) {
      case 'sessions':
        return (b.sessions - a.sessions) * sortValue;
      case 'conversions':
        return (b.conversions - a.conversions) * sortValue;
      case 'revenue':
        return (b.revenue - a.revenue) * sortValue;
      case 'roi':
        return (b.roi - a.roi) * sortValue;
      case 'spend':
        return (b.adSpend - a.adSpend) * sortValue;
      default:
        return 0;
    }
  });

  // Generate funnel data
  const funnel: ConversionFunnelData[] = [
    {
      stage: 'Impressions',
      sessions: filteredCampaigns.reduce((sum, c) => sum + Math.floor(c.sessions * 10), 0), // Simulated impressions
      conversions: filteredCampaigns.reduce((sum, c) => sum + c.sessions, 0),
      conversionRate: 0.1, // 10% impression to session
      dropOffRate: 0.9,
      averageTime: 0
    },
    {
      stage: 'Sessions',
      sessions: filteredCampaigns.reduce((sum, c) => sum + c.sessions, 0),
      conversions: filteredCampaigns.reduce((sum, c) => sum + c.leads, 0),
      conversionRate: filteredCampaigns.length > 0 ? 
        filteredCampaigns.reduce((sum, c) => sum + c.leads, 0) / 
        filteredCampaigns.reduce((sum, c) => sum + c.sessions, 0) : 0,
      dropOffRate: 0.7,
      averageTime: 2.5
    },
    {
      stage: 'Leads',
      sessions: filteredCampaigns.reduce((sum, c) => sum + c.leads, 0),
      conversions: filteredCampaigns.reduce((sum, c) => sum + c.conversions, 0),
      conversionRate: filteredCampaigns.length > 0 ? 
        filteredCampaigns.reduce((sum, c) => sum + c.conversions, 0) / 
        filteredCampaigns.reduce((sum, c) => sum + c.leads, 0) : 0,
      dropOffRate: 0.6,
      averageTime: 24 * 60 // 24 hours in minutes
    },
    {
      stage: 'Conversions',
      sessions: filteredCampaigns.reduce((sum, c) => sum + c.conversions, 0),
      conversions: filteredCampaigns.reduce((sum, c) => sum + c.conversions, 0),
      conversionRate: 1,
      dropOffRate: 0,
      averageTime: 0
    }
  ];

  // Generate attribution models
  const attribution: AttributionModelData[] = [
    {
      model: 'Last Touch',
      sessions: filteredCampaigns.reduce((sum, c) => sum + c.sessions, 0),
      conversions: filteredCampaigns.reduce((sum, c) => sum + c.conversions, 0),
      revenue: filteredCampaigns.reduce((sum, c) => sum + c.revenue, 0),
      weight: 1.0
    },
    {
      model: 'First Touch',
      sessions: filteredCampaigns.reduce((sum, c) => sum + c.sessions, 0),
      conversions: Math.floor(filteredCampaigns.reduce((sum, c) => sum + c.conversions, 0) * 0.8),
      revenue: filteredCampaigns.reduce((sum, c) => sum + c.revenue, 0) * 0.8,
      weight: 0.8
    },
    {
      model: 'Linear',
      sessions: filteredCampaigns.reduce((sum, c) => sum + c.sessions, 0),
      conversions: Math.floor(filteredCampaigns.reduce((sum, c) => sum + c.conversions, 0) * 0.9),
      revenue: filteredCampaigns.reduce((sum, c) => sum + c.revenue, 0) * 0.9,
      weight: 0.9
    }
  ];

  // Generate optimization recommendations
  const optimizations: CampaignOptimization[] = filteredCampaigns.slice(0, 5).map(campaign => ({
    campaign: campaign.campaign,
    currentPerformance: {
      cpl: campaign.cpl,
      conversionRate: campaign.conversionRate,
      roi: campaign.roi
    },
    recommendations: generateOptimizationRecommendations(campaign)
  }));

  return {
    campaigns: filteredCampaigns,
    funnel: params.includeFunnel ? funnel : [],
    attribution: params.includeAttribution ? attribution : [],
    optimizations: params.includeOptimization ? optimizations : []
  };
}

/**
 * Generate optimization recommendations for a campaign
 */
function generateOptimizationRecommendations(campaign: UTMCampaignData) {
  const recommendations = [];

  // Budget optimization
  if (campaign.roi > 2) {
    recommendations.push({
      type: 'budget' as const,
      recommendation: `Increase budget by 25% for this high-ROI campaign (current ROI: ${(campaign.roi * 100).toFixed(1)}%)`,
      expectedImpact: `Potential 20-30% increase in conversions`,
      priority: 'high' as const,
      potentialGains: {
        conversionIncrease: 0.25,
        roiImprovement: 0.15
      }
    });
  } else if (campaign.roi < 0.5) {
    recommendations.push({
      type: 'budget' as const,
      recommendation: `Consider reducing budget or pausing this low-ROI campaign (current ROI: ${(campaign.roi * 100).toFixed(1)}%)`,
      expectedImpact: `Reduce ad spend waste by 40-60%`,
      priority: 'high' as const,
      potentialGains: {
        cplReduction: 0.4
      }
    });
  }

  // Conversion rate optimization
  if (campaign.conversionRate < 0.02) { // Less than 2%
    recommendations.push({
      type: 'creative' as const,
      recommendation: `Low conversion rate detected. Test new ad creatives or landing pages`,
      expectedImpact: `Potential 50-100% improvement in conversion rate`,
      priority: 'high' as const,
      potentialGains: {
        conversionIncrease: 0.75
      }
    });
  }

  // Targeting optimization
  if (campaign.cpl > 50) { // High cost per lead
    recommendations.push({
      type: 'targeting' as const,
      recommendation: `High cost per lead. Consider refining audience targeting`,
      expectedImpact: `Reduce CPL by 20-40%`,
      priority: 'medium' as const,
      potentialGains: {
        cplReduction: 0.3
      }
    });
  }

  return recommendations.length > 0 ? recommendations : [{
    type: 'creative' as const,
    recommendation: `Campaign performing well. Consider A/B testing new creatives to maintain growth`,
    expectedImpact: `Maintain current performance with potential 10-15% improvement`,
    priority: 'low' as const,
    potentialGains: {
      conversionIncrease: 0.12
    }
  }];
}