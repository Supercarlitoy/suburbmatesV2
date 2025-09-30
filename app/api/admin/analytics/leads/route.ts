import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser, isAdmin } from "@/server/auth/auth";
import { AdminBusinessService } from "@/lib/services/admin-business";
import { prisma } from "@/lib/database/prisma";
import { z } from "zod";

// Lead Management Analytics Data Interfaces
interface LeadData {
  id: string;
  // Lead Information
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  company?: string;
  
  // Lead Scoring
  leadScore: number;
  demographicScore: number;
  behavioralScore: number;
  engagementScore: number;
  
  // Lead Qualification
  status: 'new' | 'qualified' | 'marketing-qualified' | 'sales-qualified' | 'converted' | 'disqualified' | 'nurturing';
  qualification: 'hot' | 'warm' | 'cold' | 'unqualified';
  temperature: 'hot' | 'warm' | 'cold';
  
  // Source & Attribution
  source: string;
  medium: string;
  campaign: string;
  utm_content?: string;
  referrer?: string;
  
  // Lifecycle Tracking
  createdAt: string;
  firstContact: string;
  lastActivity: string;
  lastTouchpoint: string;
  daysInPipeline: number;
  touchpointCount: number;
  
  // Sales Data
  assignedTo?: string;
  estimatedValue: number;
  probability: number;
  expectedCloseDate?: string;
  actualCloseDate?: string;
  
  // Engagement Metrics
  emailOpens: number;
  emailClicks: number;
  websiteVisits: number;
  formSubmissions: number;
  downloadCount: number;
  socialEngagement: number;
  
  // Geographic & Demographic
  location: string;
  industry?: string;
  companySize?: string;
  jobTitle?: string;
  
  // Nurturing Status
  lastNurtureActivity: string;
  nurtureStage: string;
  nextFollowUp: string;
  automationStatus: 'active' | 'paused' | 'completed' | 'none';
}

interface LeadScoringModel {
  name: string;
  weight: number;
  criteria: {
    category: string;
    factor: string;
    score: number;
    weight: number;
  }[];
}

interface ConversionFunnelData {
  stage: string;
  leads: number;
  conversions: number;
  conversionRate: number;
  averageTime: number;
  dropOffReasons: { reason: string; count: number }[];
}

interface NurturingWorkflow {
  id: string;
  name: string;
  description: string;
  triggers: string[];
  stages: {
    name: string;
    duration: number;
    actions: string[];
    successRate: number;
  }[];
  totalLeads: number;
  activeLeads: number;
  completionRate: number;
  averageConversionTime: number;
}

const LeadAnalyticsSchema = z.object({
  // Date range
  dateRange: z.enum(['7d', '30d', '90d', '1y']).optional().default('30d'),
  
  // Lead Filters
  status: z.string().optional().default('all'),
  source: z.string().optional().default('all'),
  temperature: z.enum(['hot', 'warm', 'cold', 'all']).optional().default('all'),
  assignee: z.string().optional().default('all'),
  
  // Score Filters
  minScore: z.string().optional().default(''),
  maxScore: z.string().optional().default(''),
  minValue: z.string().optional().default(''),
  maxValue: z.string().optional().default(''),
  daysInPipeline: z.string().optional().default(''),
  
  // Sorting
  sortBy: z.enum(['leadScore', 'estimatedValue', 'engagementScore', 'daysInPipeline']).optional().default('leadScore'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
  
  // Additional Options
  includeConverted: z.boolean().optional().default(true),
  includeDisqualified: z.boolean().optional().default(false),
  includeScoring: z.boolean().optional().default(true),
  includeFunnel: z.boolean().optional().default(true),
  includeWorkflows: z.boolean().optional().default(true),
});

/**
 * GET /api/admin/analytics/leads
 * Get lead management analytics with scoring, funnel analysis, and nurturing workflows
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
    const validationResult = LeadAnalyticsSchema.safeParse({
      ...queryParams,
      includeConverted: queryParams.includeConverted !== 'false',
      includeDisqualified: queryParams.includeDisqualified === 'true',
      includeScoring: queryParams.includeScoring !== 'false',
      includeFunnel: queryParams.includeFunnel !== 'false',
      includeWorkflows: queryParams.includeWorkflows !== 'false',
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

    // Generate lead analytics data
    const leadAnalytics = await generateLeadAnalytics(params, startDate, endDate);

    // Log the admin access
    await adminService.logAdminAccess(
      'ADMIN_ANALYTICS_LEADS_VIEW',
      null,
      user.id,
      {
        dateRange: params.dateRange,
        status: params.status,
        source: params.source,
        temperature: params.temperature,
        totalLeads: leadAnalytics.leads.length,
        includeScoring: params.includeScoring,
        includeFunnel: params.includeFunnel,
        includeWorkflows: params.includeWorkflows,
      }
    );

    return NextResponse.json({
      success: true,
      data: leadAnalytics,
      metadata: {
        dateRange: {
          start: startDate.toISOString(),
          end: endDate.toISOString(),
          period: params.dateRange
        },
        filters: {
          status: params.status,
          source: params.source,
          temperature: params.temperature,
          assignee: params.assignee
        },
        totalLeads: leadAnalytics.leads.length
      }
    });

  } catch (error) {
    console.error('Error in lead analytics endpoint:', error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * Generate Lead Analytics Data
 */
async function generateLeadAnalytics(
  params: z.infer<typeof LeadAnalyticsSchema>,
  startDate: Date,
  endDate: Date
) {
  // Get leads from database
  const leads = await prisma.lead.findMany({
    where: {
      createdAt: {
        gte: startDate,
        lte: endDate
      }
    },
    include: {
      business: {
        select: {
          id: true,
          name: true,
          category: true,
          suburb: true,
          inquiries: {
            where: {
              createdAt: {
                gte: startDate,
                lte: endDate
              }
            },
            select: {
              utm: true,
              createdAt: true
            }
          }
        }
      }
    }
  });

  // Transform leads to analytics format
  const transformedLeads: LeadData[] = leads.map(lead => {
    const nameParts = lead.name.split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';
    
    // Get UTM data from business inquiries
    const utmData = lead.business.inquiries.find(inq => inq.utm)?.utm as any;
    const source = utmData?.utm_source || 'direct';
    const medium = utmData?.utm_medium || 'organic';
    const campaign = utmData?.utm_campaign || 'none';
    
    // Calculate lead metrics
    const daysInPipeline = Math.floor((new Date().getTime() - lead.createdAt.getTime()) / (1000 * 60 * 60 * 24));
    
    // Generate lead scoring (simulated based on available data)
    const leadScore = calculateLeadScore(lead, source, medium);
    const demographicScore = Math.floor(leadScore * 0.3);
    const behavioralScore = Math.floor(leadScore * 0.4);
    const engagementScore = Math.floor(leadScore * 0.3);
    
    // Determine qualification and temperature
    const { qualification, temperature } = determineLeadQualification(leadScore, lead.status);
    
    return {
      id: lead.id,
      firstName,
      lastName,
      email: lead.email,
      phone: lead.phone || undefined,
      company: `${lead.business.name} Lead`,
      
      leadScore,
      demographicScore,
      behavioralScore,
      engagementScore,
      
      status: mapLeadStatus(lead.status),
      qualification,
      temperature,
      
      source,
      medium,
      campaign,
      utm_content: utmData?.utm_content,
      referrer: 'direct',
      
      createdAt: lead.createdAt.toISOString(),
      firstContact: lead.createdAt.toISOString(),
      lastActivity: lead.createdAt.toISOString(),
      lastTouchpoint: 'inquiry_form',
      daysInPipeline,
      touchpointCount: 1,
      
      assignedTo: 'system',
      estimatedValue: calculateEstimatedValue(leadScore, lead.business.category),
      probability: leadScore / 100,
      expectedCloseDate: new Date(Date.now() + daysInPipeline * 24 * 60 * 60 * 1000).toISOString(),
      
      emailOpens: Math.floor(Math.random() * 10),
      emailClicks: Math.floor(Math.random() * 5),
      websiteVisits: Math.floor(Math.random() * 20) + 1,
      formSubmissions: 1,
      downloadCount: Math.floor(Math.random() * 3),
      socialEngagement: Math.floor(Math.random() * 8),
      
      location: lead.business.suburb,
      industry: lead.business.category || undefined,
      companySize: getRandomCompanySize(),
      jobTitle: getRandomJobTitle(),
      
      lastNurtureActivity: lead.createdAt.toISOString(),
      nurtureStage: getNurtureStage(lead.status),
      nextFollowUp: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days from now
      automationStatus: getAutomationStatus(lead.status)
    };
  });

  // Apply filters
  let filteredLeads = transformedLeads.filter(lead => {
    if (params.status !== 'all' && lead.status !== params.status) return false;
    if (params.source !== 'all' && lead.source !== params.source) return false;
    if (params.temperature !== 'all' && lead.temperature !== params.temperature) return false;
    if (params.minScore && lead.leadScore < parseInt(params.minScore)) return false;
    if (params.maxScore && lead.leadScore > parseInt(params.maxScore)) return false;
    if (params.minValue && lead.estimatedValue < parseFloat(params.minValue)) return false;
    if (params.maxValue && lead.estimatedValue > parseFloat(params.maxValue)) return false;
    if (params.daysInPipeline && lead.daysInPipeline > parseInt(params.daysInPipeline)) return false;
    if (!params.includeConverted && lead.status === 'converted') return false;
    if (!params.includeDisqualified && lead.status === 'disqualified') return false;
    return true;
  });

  // Sort leads
  filteredLeads.sort((a, b) => {
    const sortValue = params.sortOrder === 'desc' ? -1 : 1;
    switch (params.sortBy) {
      case 'leadScore':
        return (b.leadScore - a.leadScore) * sortValue;
      case 'estimatedValue':
        return (b.estimatedValue - a.estimatedValue) * sortValue;
      case 'engagementScore':
        return (b.engagementScore - a.engagementScore) * sortValue;
      case 'daysInPipeline':
        return (b.daysInPipeline - a.daysInPipeline) * sortValue;
      default:
        return 0;
    }
  });

  // Generate lead scoring models
  const scoringModels: LeadScoringModel[] = params.includeScoring ? [
    {
      name: 'Demographic Scoring',
      weight: 0.3,
      criteria: [
        { category: 'Location', factor: 'Melbourne Metro', score: 20, weight: 0.4 },
        { category: 'Industry', factor: 'Target Industry', score: 15, weight: 0.3 },
        { category: 'Company Size', factor: 'SME (10-50 employees)', score: 10, weight: 0.3 }
      ]
    },
    {
      name: 'Behavioral Scoring',
      weight: 0.4,
      criteria: [
        { category: 'Engagement', factor: 'Website Visits', score: 25, weight: 0.4 },
        { category: 'Content', factor: 'Form Submissions', score: 20, weight: 0.3 },
        { category: 'Email', factor: 'Email Interactions', score: 15, weight: 0.3 }
      ]
    },
    {
      name: 'Intent Scoring',
      weight: 0.3,
      criteria: [
        { category: 'Inquiry', factor: 'Direct Business Inquiry', score: 30, weight: 0.5 },
        { category: 'Urgency', factor: 'Immediate Need Indicated', score: 15, weight: 0.3 },
        { category: 'Budget', factor: 'Budget Authority', score: 10, weight: 0.2 }
      ]
    }
  ] : [];

  // Generate conversion funnel
  const funnel: ConversionFunnelData[] = params.includeFunnel ? [
    {
      stage: 'Prospects',
      leads: Math.floor(filteredLeads.length * 2.5), // Simulated prospects
      conversions: filteredLeads.length,
      conversionRate: 0.4, // 40% prospect to lead
      averageTime: 30, // 30 minutes
      dropOffReasons: [
        { reason: 'Not interested', count: Math.floor(filteredLeads.length * 0.3) },
        { reason: 'Wrong timing', count: Math.floor(filteredLeads.length * 0.2) },
        { reason: 'Price concerns', count: Math.floor(filteredLeads.length * 0.1) }
      ]
    },
    {
      stage: 'Leads',
      leads: filteredLeads.length,
      conversions: filteredLeads.filter(l => ['qualified', 'marketing-qualified', 'sales-qualified'].includes(l.status)).length,
      conversionRate: filteredLeads.length > 0 ? 
        filteredLeads.filter(l => ['qualified', 'marketing-qualified', 'sales-qualified'].includes(l.status)).length / filteredLeads.length : 0,
      averageTime: 48 * 60, // 48 hours
      dropOffReasons: [
        { reason: 'Unresponsive', count: Math.floor(filteredLeads.length * 0.2) },
        { reason: 'Not qualified', count: Math.floor(filteredLeads.length * 0.15) },
        { reason: 'Competitor chosen', count: Math.floor(filteredLeads.length * 0.1) }
      ]
    },
    {
      stage: 'Qualified',
      leads: filteredLeads.filter(l => ['qualified', 'marketing-qualified', 'sales-qualified'].includes(l.status)).length,
      conversions: filteredLeads.filter(l => l.status === 'converted').length,
      conversionRate: filteredLeads.filter(l => ['qualified', 'marketing-qualified', 'sales-qualified'].includes(l.status)).length > 0 ?
        filteredLeads.filter(l => l.status === 'converted').length / 
        filteredLeads.filter(l => ['qualified', 'marketing-qualified', 'sales-qualified'].includes(l.status)).length : 0,
      averageTime: 7 * 24 * 60, // 7 days
      dropOffReasons: [
        { reason: 'Long sales cycle', count: Math.floor(filteredLeads.length * 0.08) },
        { reason: 'Budget constraints', count: Math.floor(filteredLeads.length * 0.06) },
        { reason: 'Decision delayed', count: Math.floor(filteredLeads.length * 0.04) }
      ]
    },
    {
      stage: 'Converted',
      leads: filteredLeads.filter(l => l.status === 'converted').length,
      conversions: filteredLeads.filter(l => l.status === 'converted').length,
      conversionRate: 1,
      averageTime: 0,
      dropOffReasons: []
    }
  ] : [];

  // Generate nurturing workflows
  const workflows: NurturingWorkflow[] = params.includeWorkflows ? [
    {
      id: 'new-lead-nurture',
      name: 'New Lead Nurturing',
      description: 'Automated nurturing sequence for new leads',
      triggers: ['new_lead', 'form_submission'],
      stages: [
        {
          name: 'Welcome & Introduction',
          duration: 1,
          actions: ['send_welcome_email', 'add_to_crm'],
          successRate: 0.85
        },
        {
          name: 'Value Proposition',
          duration: 3,
          actions: ['send_case_study', 'schedule_demo'],
          successRate: 0.65
        },
        {
          name: 'Qualification',
          duration: 7,
          actions: ['qualification_call', 'needs_assessment'],
          successRate: 0.45
        }
      ],
      totalLeads: Math.floor(filteredLeads.length * 0.7),
      activeLeads: Math.floor(filteredLeads.length * 0.4),
      completionRate: 0.35,
      averageConversionTime: 14.5
    },
    {
      id: 're-engagement',
      name: 'Lead Re-engagement',
      description: 'Re-engage cold or inactive leads',
      triggers: ['lead_inactive_30_days', 'no_response'],
      stages: [
        {
          name: 'Re-engagement Attempt',
          duration: 2,
          actions: ['send_special_offer', 'personal_outreach'],
          successRate: 0.25
        },
        {
          name: 'Final Value Proposition',
          duration: 5,
          actions: ['send_testimonials', 'limited_time_offer'],
          successRate: 0.15
        }
      ],
      totalLeads: Math.floor(filteredLeads.length * 0.3),
      activeLeads: Math.floor(filteredLeads.length * 0.1),
      completionRate: 0.18,
      averageConversionTime: 21.3
    }
  ] : [];

  return {
    leads: filteredLeads,
    scoringModels,
    funnel,
    workflows
  };
}

// Helper functions
function calculateLeadScore(lead: any, source: string, medium: string): number {
  let score = 50; // Base score
  
  // Source scoring
  if (source === 'google' || source === 'organic') score += 20;
  if (source === 'referral') score += 15;
  if (source === 'social') score += 10;
  
  // Medium scoring  
  if (medium === 'organic') score += 15;
  if (medium === 'cpc') score += 10;
  if (medium === 'email') score += 12;
  
  // Status scoring
  switch (lead.status) {
    case 'QUALIFIED': score += 25; break;
    case 'CONVERTED': score += 40; break;
    case 'CLOSED': score += 35; break;
    default: score += 0;
  }
  
  // Random variation
  score += Math.floor(Math.random() * 20) - 10;
  
  return Math.max(0, Math.min(100, score));
}

function determineLeadQualification(score: number, status: string): { qualification: 'hot' | 'warm' | 'cold' | 'unqualified', temperature: 'hot' | 'warm' | 'cold' } {
  if (score >= 80 || status === 'CONVERTED') return { qualification: 'hot', temperature: 'hot' };
  if (score >= 60 || status === 'QUALIFIED') return { qualification: 'warm', temperature: 'warm' };
  if (score >= 40) return { qualification: 'cold', temperature: 'cold' };
  return { qualification: 'unqualified', temperature: 'cold' };
}

function mapLeadStatus(status: string): 'new' | 'qualified' | 'marketing-qualified' | 'sales-qualified' | 'converted' | 'disqualified' | 'nurturing' {
  switch (status) {
    case 'NEW': return 'new';
    case 'CONTACTED': return 'nurturing';
    case 'QUALIFIED': return 'qualified';
    case 'CONVERTED': return 'converted';
    case 'CLOSED': return 'converted';
    default: return 'new';
  }
}

function calculateEstimatedValue(score: number, category: string | null): number {
  let baseValue = 500; // Base value
  
  // Category multiplier
  const categoryMultipliers: { [key: string]: number } = {
    'Professional Services': 2.5,
    'Construction': 3.0,
    'Healthcare': 2.0,
    'Technology': 4.0,
    'Retail': 1.2,
    'Hospitality': 1.5
  };
  
  const multiplier = category ? categoryMultipliers[category] || 1.0 : 1.0;
  
  // Score multiplier (higher score = higher value)
  const scoreMultiplier = 1 + (score / 100);
  
  return Math.floor(baseValue * multiplier * scoreMultiplier);
}

function getRandomCompanySize(): string {
  const sizes = ['1-10', '11-50', '51-200', '201-500', '500+'];
  return sizes[Math.floor(Math.random() * sizes.length)];
}

function getRandomJobTitle(): string {
  const titles = ['Owner', 'Manager', 'Director', 'CEO', 'Operations Manager', 'Marketing Manager'];
  return titles[Math.floor(Math.random() * titles.length)];
}

function getNurtureStage(status: string): string {
  switch (status) {
    case 'NEW': return 'Initial Contact';
    case 'CONTACTED': return 'Nurturing';
    case 'QUALIFIED': return 'Qualification';
    case 'CONVERTED': return 'Closed Won';
    default: return 'New Lead';
  }
}

function getAutomationStatus(status: string): 'active' | 'paused' | 'completed' | 'none' {
  switch (status) {
    case 'NEW': return 'active';
    case 'CONTACTED': return 'active';
    case 'QUALIFIED': return 'paused';
    case 'CONVERTED': return 'completed';
    default: return 'none';
  }
}