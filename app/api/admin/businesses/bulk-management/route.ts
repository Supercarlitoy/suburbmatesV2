import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { headers } from 'next/headers';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface BusinessRecord {
  id: string;
  name: string;
  ownerName?: string;
  email: string | null;
  phone: string | null;
  address: string;
  suburb: string;
  postcode: string;
  category: string;
  abnStatus: 'NOT_PROVIDED' | 'PENDING' | 'VERIFIED' | 'INVALID' | 'EXPIRED';
  approvalStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
  source: 'MANUAL' | 'CSV' | 'AUTO_ENRICH' | 'CLAIMED' | 'CSV_IMPORT';
  qualityScore: number;
  createdAt: string;
  lastUpdated: string;
  tags?: string[];
  assignedTo?: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  completeness: number;
  verificationScore: number;
  ownershipClaimed: boolean;
  leadCount: number;
  inquiryCount: number;
  lastActivity?: string;
}

// Helper function to calculate risk level based on various factors
function calculateRiskLevel(business: any): 'LOW' | 'MEDIUM' | 'HIGH' {
  let riskScore = 0;
  
  // ABN status risk
  if (business.abn_status === 'INVALID' || business.abn_status === 'EXPIRED') {
    riskScore += 3;
  } else if (business.abn_status === 'NOT_PROVIDED') {
    riskScore += 2;
  } else if (business.abn_status === 'PENDING') {
    riskScore += 1;
  }
  
  // Quality score risk
  if (business.quality_score < 50) {
    riskScore += 3;
  } else if (business.quality_score < 70) {
    riskScore += 2;
  } else if (business.quality_score < 80) {
    riskScore += 1;
  }
  
  // Source risk
  if (business.source === 'CSV_IMPORT' || business.source === 'AUTO_ENRICH') {
    riskScore += 1;
  }
  
  // Ownership claims (potential disputes)
  if (business.ownership_claimed) {
    riskScore += 1;
  }
  
  // Determine final risk level
  if (riskScore >= 5) return 'HIGH';
  if (riskScore >= 3) return 'MEDIUM';
  return 'LOW';
}

// Helper function to calculate priority based on various factors
function calculatePriority(business: any): 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT' {
  let priorityScore = 0;
  
  // High quality scores get higher priority
  if (business.quality_score >= 90) {
    priorityScore += 3;
  } else if (business.quality_score >= 80) {
    priorityScore += 2;
  } else if (business.quality_score >= 70) {
    priorityScore += 1;
  }
  
  // Verified businesses get higher priority
  if (business.abn_status === 'VERIFIED') {
    priorityScore += 2;
  }
  
  // Claimed businesses get higher priority
  if (business.ownership_claimed) {
    priorityScore += 2;
  }
  
  // Businesses with leads/inquiries get higher priority
  if (business.leads?.length > 0) {
    priorityScore += 1;
  }
  if (business.inquiries?.length > 0) {
    priorityScore += 1;
  }
  
  // Determine final priority level
  if (priorityScore >= 6) return 'URGENT';
  if (priorityScore >= 4) return 'HIGH';
  if (priorityScore >= 2) return 'MEDIUM';
  return 'LOW';
}

// Helper function to calculate completeness score
function calculateCompleteness(business: any): number {
  const requiredFields = ['name', 'address', 'suburb', 'postcode', 'category'];
  const optionalFields = ['email', 'phone', 'description', 'website', 'abn'];
  
  let completedRequired = 0;
  let completedOptional = 0;
  
  for (const field of requiredFields) {
    if (business[field] && business[field].trim() !== '') {
      completedRequired++;
    }
  }
  
  for (const field of optionalFields) {
    if (business[field] && business[field].trim() !== '') {
      completedOptional++;
    }
  }
  
  // Required fields are worth 60%, optional fields are worth 40%
  const requiredScore = (completedRequired / requiredFields.length) * 60;
  const optionalScore = (completedOptional / optionalFields.length) * 40;
  
  return Math.round(requiredScore + optionalScore);
}

// Helper function to calculate verification score
function calculateVerificationScore(business: any): number {
  let score = 0;
  
  // ABN verification
  if (business.abn_status === 'VERIFIED') {
    score += 30;
  } else if (business.abn_status === 'PENDING') {
    score += 15;
  }
  
  // Ownership verification
  if (business.ownership_claimed) {
    score += 25;
  }
  
  // Contact verification (if email/phone are provided and valid)
  if (business.email && business.email.includes('@')) {
    score += 15;
  }
  if (business.phone && business.phone.length >= 10) {
    score += 15;
  }
  
  // Source verification
  if (business.source === 'CLAIMED' || business.source === 'MANUAL') {
    score += 15;
  } else if (business.source === 'CSV_IMPORT') {
    score += 5;
  }
  
  return Math.min(score, 100);
}

export async function GET(request: NextRequest) {
  try {
    const headersList = headers();
    const authorization = headersList.get('authorization');
    
    if (!authorization?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '1000');
    const offset = parseInt(url.searchParams.get('offset') || '0');
    const status = url.searchParams.get('status');
    const source = url.searchParams.get('source');
    const riskLevel = url.searchParams.get('riskLevel');
    const qualityMin = parseInt(url.searchParams.get('qualityMin') || '0');
    const qualityMax = parseInt(url.searchParams.get('qualityMax') || '100');

    // Build the query
    let query = supabase
      .from('businesses')
      .select(`
        *,
        leads(id),
        inquiries(id),
        ownership_claims(id, status)
      `);

    // Apply filters
    if (status) {
      query = query.eq('approval_status', status);
    }
    if (source) {
      query = query.eq('source', source);
    }
    if (qualityMin > 0 || qualityMax < 100) {
      query = query.gte('quality_score', qualityMin).lte('quality_score', qualityMax);
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1);
    query = query.order('created_at', { ascending: false });

    const { data: businesses, error } = await query;

    if (error) {
      console.error('Error fetching businesses for bulk management:', error);
      return NextResponse.json({ error: 'Failed to fetch businesses' }, { status: 500 });
    }

    // Transform and enrich the data
    const enrichedBusinesses: BusinessRecord[] = businesses?.map((business: any) => {
      const riskLevel = calculateRiskLevel(business);
      const priority = calculatePriority(business);
      const completeness = calculateCompleteness(business);
      const verificationScore = calculateVerificationScore(business);
      const ownershipClaimed = business.ownership_claims?.length > 0;
      const leadCount = business.leads?.length || 0;
      const inquiryCount = business.inquiries?.length || 0;

      // Filter by calculated risk level if specified
      if (url.searchParams.get('riskLevel') && riskLevel !== url.searchParams.get('riskLevel')) {
        return null;
      }

      return {
        id: business.id,
        name: business.name,
        ownerName: business.owner_name,
        email: business.email,
        phone: business.phone,
        address: business.address,
        suburb: business.suburb,
        postcode: business.postcode,
        category: business.category,
        abnStatus: business.abn_status || 'NOT_PROVIDED',
        approvalStatus: business.approval_status || 'PENDING',
        source: business.source || 'MANUAL',
        qualityScore: business.quality_score || 0,
        createdAt: business.created_at,
        lastUpdated: business.updated_at,
        tags: business.tags || [],
        assignedTo: business.assigned_to,
        priority,
        riskLevel,
        completeness,
        verificationScore,
        ownershipClaimed,
        leadCount,
        inquiryCount,
        lastActivity: business.last_activity_at
      };
    }).filter(Boolean) || [];

    // Get summary statistics
    const totalBusinesses = enrichedBusinesses.length;
    const pendingCount = enrichedBusinesses.filter(b => b.approvalStatus === 'PENDING').length;
    const approvedCount = enrichedBusinesses.filter(b => b.approvalStatus === 'APPROVED').length;
    const rejectedCount = enrichedBusinesses.filter(b => b.approvalStatus === 'REJECTED').length;
    const highQualityCount = enrichedBusinesses.filter(b => b.qualityScore >= 80).length;
    const highRiskCount = enrichedBusinesses.filter(b => b.riskLevel === 'HIGH').length;
    const claimedCount = enrichedBusinesses.filter(b => b.ownershipClaimed).length;

    return NextResponse.json({
      businesses: enrichedBusinesses,
      summary: {
        total: totalBusinesses,
        pending: pendingCount,
        approved: approvedCount,
        rejected: rejectedCount,
        highQuality: highQualityCount,
        highRisk: highRiskCount,
        claimed: claimedCount
      },
      pagination: {
        limit,
        offset,
        hasMore: totalBusinesses === limit // Indicates there might be more records
      }
    });

  } catch (error) {
    console.error('Error in bulk business management API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST endpoint for bulk actions (approval, rejection, updates)
export async function POST(request: NextRequest) {
  try {
    const headersList = headers();
    const authorization = headersList.get('authorization');
    
    if (!authorization?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { action, businessIds, approvalData, rejectionData, updateData } = body;

    if (!action || !businessIds || !Array.isArray(businessIds) || businessIds.length === 0) {
      return NextResponse.json({ error: 'Invalid request data' }, { status: 400 });
    }

    let updateFields: any = {
      updated_at: new Date().toISOString()
    };

    // Prepare update fields based on action
    switch (action) {
      case 'APPROVE':
        updateFields.approval_status = 'APPROVED';
        updateFields.approved_at = new Date().toISOString();
        if (approvalData?.approver) {
          updateFields.approved_by = approvalData.approver;
        }
        if (approvalData?.reason) {
          updateFields.approval_reason = approvalData.reason;
        }
        break;

      case 'REJECT':
        updateFields.approval_status = 'REJECTED';
        updateFields.rejected_at = new Date().toISOString();
        if (rejectionData?.rejector) {
          updateFields.rejected_by = rejectionData.rejector;
        }
        if (rejectionData?.reason) {
          updateFields.rejection_reason = rejectionData.reason;
        }
        if (rejectionData?.category) {
          updateFields.rejection_category = rejectionData.category;
        }
        break;

      case 'BULK_UPDATE':
        if (updateData) {
          Object.assign(updateFields, updateData);
        }
        break;

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    // Execute the bulk update
    const { data, error } = await supabase
      .from('businesses')
      .update(updateFields)
      .in('id', businessIds)
      .select('id, name, approval_status');

    if (error) {
      console.error('Error executing bulk business operation:', error);
      return NextResponse.json({ error: 'Failed to execute bulk operation' }, { status: 500 });
    }

    // Log the bulk operation in audit_logs
    const auditPromises = businessIds.map(async (businessId: string) => {
      const business = data?.find(b => b.id === businessId);
      return supabase.from('audit_logs').insert({
        table_name: 'businesses',
        record_id: businessId,
        action: action,
        changes: updateFields,
        user_id: 'system', // Would be actual user ID in production
        metadata: {
          business_name: business?.name,
          bulk_operation: true,
          operation_id: `bulk_${Date.now()}`,
          ...approvalData,
          ...rejectionData,
          ...updateData
        }
      });
    });

    await Promise.all(auditPromises);

    return NextResponse.json({
      success: true,
      processed: data?.length || 0,
      businesses: data,
      action,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error in bulk business operation API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}