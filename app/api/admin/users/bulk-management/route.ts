import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { headers } from 'next/headers';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface UserRecord {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  fullName: string;
  role: 'ADMIN' | 'BUSINESS_OWNER' | 'CUSTOMER' | 'MODERATOR' | 'SUPPORT';
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'PENDING_VERIFICATION' | 'BANNED';
  accountType: 'PERSONAL' | 'BUSINESS' | 'PREMIUM' | 'ENTERPRISE';
  createdAt: string;
  lastLogin?: string;
  lastActivity?: string;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  profileCompleteness: number;
  engagementScore: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  
  // Business associations
  ownedBusinesses: number;
  claimedBusinesses: number;
  
  // Activity metrics
  loginCount: number;
  inquiriesSent: number;
  reviewsPosted: number;
  
  // Location data
  suburb?: string;
  state?: string;
  country: string;
  
  // Subscription and billing
  subscriptionStatus?: 'ACTIVE' | 'CANCELLED' | 'EXPIRED' | 'TRIAL';
  subscriptionTier?: string;
  billingStatus?: 'CURRENT' | 'OVERDUE' | 'FAILED';
  
  // Communication preferences
  emailNotifications: boolean;
  smsNotifications: boolean;
  marketingOptIn: boolean;
  
  // Lifecycle stage
  lifecycleStage: 'NEW_USER' | 'ACTIVE_USER' | 'ENGAGED_USER' | 'AT_RISK' | 'CHURNED' | 'REACTIVATED';
  
  // Tags and segments
  tags?: string[];
  segments?: string[];
  
  // Security flags
  requiresPasswordReset: boolean;
  isSuspicious: boolean;
  lastSecurityCheck?: string;
}

// Helper function to calculate risk level based on various factors
function calculateRiskLevel(user: any): 'LOW' | 'MEDIUM' | 'HIGH' {
  let riskScore = 0;
  
  // Email verification risk
  if (!user.email_verified) {
    riskScore += 2;
  }
  
  // Phone verification risk
  if (!user.phone_verified) {
    riskScore += 1;
  }
  
  // Account age risk (very new or inactive accounts)
  const accountAge = Date.now() - new Date(user.created_at).getTime();
  const daysSinceCreated = accountAge / (1000 * 60 * 60 * 24);
  
  if (daysSinceCreated < 7) {
    riskScore += 2; // Very new account
  }
  
  // Activity risk
  if (user.last_login) {
    const daysSinceLogin = (Date.now() - new Date(user.last_login).getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceLogin > 90) {
      riskScore += 2; // Inactive for 3+ months
    }
  } else {
    riskScore += 3; // Never logged in
  }
  
  // Profile completeness risk
  const profileComplete = user.first_name && user.last_name && user.suburb;
  if (!profileComplete) {
    riskScore += 1;
  }
  
  // Suspicious activity flags
  if (user.suspicious_activity) {
    riskScore += 3;
  }
  
  // Multiple business claims might indicate fraud
  if (user.claimed_businesses?.length > 5) {
    riskScore += 2;
  }
  
  // Determine final risk level
  if (riskScore >= 6) return 'HIGH';
  if (riskScore >= 3) return 'MEDIUM';
  return 'LOW';
}

// Helper function to calculate profile completeness
function calculateProfileCompleteness(user: any): number {
  const requiredFields = ['first_name', 'last_name', 'email'];
  const optionalFields = ['phone', 'suburb', 'state', 'bio', 'avatar_url'];
  
  let completedRequired = 0;
  let completedOptional = 0;
  
  for (const field of requiredFields) {
    if (user[field] && user[field].trim() !== '') {
      completedRequired++;
    }
  }
  
  for (const field of optionalFields) {
    if (user[field] && user[field].trim() !== '') {
      completedOptional++;
    }
  }
  
  // Required fields are worth 60%, optional fields are worth 40%
  const requiredScore = (completedRequired / requiredFields.length) * 60;
  const optionalScore = (completedOptional / optionalFields.length) * 40;
  
  return Math.round(requiredScore + optionalScore);
}

// Helper function to calculate engagement score
function calculateEngagementScore(user: any): number {
  let score = 0;
  
  // Login frequency
  if (user.login_count > 50) {
    score += 30;
  } else if (user.login_count > 10) {
    score += 20;
  } else if (user.login_count > 0) {
    score += 10;
  }
  
  // Recent activity
  if (user.last_login) {
    const daysSinceLogin = (Date.now() - new Date(user.last_login).getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceLogin < 7) {
      score += 25; // Active within last week
    } else if (daysSinceLogin < 30) {
      score += 15; // Active within last month
    } else if (daysSinceLogin < 90) {
      score += 5; // Active within last 3 months
    }
  }
  
  // Business engagement
  if (user.owned_businesses > 0) {
    score += 20;
  }
  if (user.claimed_businesses > 0) {
    score += 10;
  }
  
  // Content engagement
  if (user.reviews_posted > 0) {
    score += Math.min(user.reviews_posted * 2, 15);
  }
  if (user.inquiries_sent > 0) {
    score += Math.min(user.inquiries_sent, 10);
  }
  
  return Math.min(score, 100);
}

// Helper function to determine lifecycle stage
function calculateLifecycleStage(user: any, engagementScore: number): UserRecord['lifecycleStage'] {
  const accountAge = (Date.now() - new Date(user.created_at).getTime()) / (1000 * 60 * 60 * 24);
  const daysSinceLogin = user.last_login ? 
    (Date.now() - new Date(user.last_login).getTime()) / (1000 * 60 * 60 * 24) : 999;
  
  // New users (< 30 days old)
  if (accountAge < 30) {
    return 'NEW_USER';
  }
  
  // Churned users (no login in 180+ days)
  if (daysSinceLogin > 180) {
    return 'CHURNED';
  }
  
  // At-risk users (no login in 30-180 days or low engagement)
  if (daysSinceLogin > 30 || (engagementScore < 30 && daysSinceLogin > 14)) {
    return 'AT_RISK';
  }
  
  // Engaged users (high engagement score and recent activity)
  if (engagementScore >= 70 && daysSinceLogin <= 7) {
    return 'ENGAGED_USER';
  }
  
  // Reactivated users (recently returned after being inactive)
  if (daysSinceLogin <= 7 && accountAge > 90 && user.login_count > 1) {
    return 'REACTIVATED';
  }
  
  // Default to active user
  return 'ACTIVE_USER';
}

export async function GET(request: NextRequest) {
  try {
    const headersList = headers();
    const authorization = headersList.get('authorization');
    
    if (!authorization?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '500');
    const offset = parseInt(url.searchParams.get('offset') || '0');
    const role = url.searchParams.get('role');
    const status = url.searchParams.get('status');
    const riskLevel = url.searchParams.get('riskLevel');
    const lifecycleStage = url.searchParams.get('lifecycleStage');

    // Build the query - fetch users with related data
    let query = supabase
      .from('users')
      .select(`
        *,
        businesses!businesses_owner_id_fkey(id),
        ownership_claims!ownership_claims_user_id_fkey(id, status),
        inquiries!inquiries_user_id_fkey(id),
        user_business_reviews(id)
      `);

    // Apply basic filters
    if (role) {
      query = query.eq('role', role);
    }
    if (status) {
      query = query.eq('status', status);
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1);
    query = query.order('created_at', { ascending: false });

    const { data: users, error } = await query;

    if (error) {
      console.error('Error fetching users for bulk management:', error);
      return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
    }

    // Transform and enrich the data
    const enrichedUsers: UserRecord[] = users?.map((user: any) => {
      const profileCompleteness = calculateProfileCompleteness(user);
      const engagementScore = calculateEngagementScore(user);
      const riskLevel = calculateRiskLevel(user);
      const lifecycleStage = calculateLifecycleStage(user, engagementScore);
      
      const ownedBusinesses = user.businesses?.length || 0;
      const claimedBusinesses = user.ownership_claims?.filter((claim: any) => claim.status === 'APPROVED').length || 0;
      const inquiriesSent = user.inquiries?.length || 0;
      const reviewsPosted = user.user_business_reviews?.length || 0;

      // Filter by calculated fields if specified
      if (url.searchParams.get('riskLevel') && riskLevel !== url.searchParams.get('riskLevel')) {
        return null;
      }
      if (url.searchParams.get('lifecycleStage') && lifecycleStage !== url.searchParams.get('lifecycleStage')) {
        return null;
      }

      return {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        fullName: `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email,
        role: user.role || 'CUSTOMER',
        status: user.status || 'ACTIVE',
        accountType: user.account_type || 'PERSONAL',
        createdAt: user.created_at,
        lastLogin: user.last_login,
        lastActivity: user.last_activity_at,
        isEmailVerified: user.email_verified || false,
        isPhoneVerified: user.phone_verified || false,
        profileCompleteness,
        engagementScore,
        riskLevel,
        ownedBusinesses,
        claimedBusinesses,
        loginCount: user.login_count || 0,
        inquiriesSent,
        reviewsPosted,
        suburb: user.suburb,
        state: user.state,
        country: user.country || 'Australia',
        subscriptionStatus: user.subscription_status,
        subscriptionTier: user.subscription_tier,
        billingStatus: user.billing_status,
        emailNotifications: user.email_notifications ?? true,
        smsNotifications: user.sms_notifications ?? false,
        marketingOptIn: user.marketing_opt_in ?? false,
        lifecycleStage,
        tags: user.tags || [],
        segments: user.segments || [],
        requiresPasswordReset: user.requires_password_reset || false,
        isSuspicious: user.suspicious_activity || false,
        lastSecurityCheck: user.last_security_check
      };
    }).filter(Boolean) || [];

    // Get summary statistics
    const totalUsers = enrichedUsers.length;
    const activeCount = enrichedUsers.filter(u => u.status === 'ACTIVE').length;
    const businessOwners = enrichedUsers.filter(u => u.role === 'BUSINESS_OWNER').length;
    const highRiskCount = enrichedUsers.filter(u => u.riskLevel === 'HIGH').length;
    const engagedCount = enrichedUsers.filter(u => u.lifecycleStage === 'ENGAGED_USER').length;
    const atRiskCount = enrichedUsers.filter(u => u.lifecycleStage === 'AT_RISK').length;
    const verifiedCount = enrichedUsers.filter(u => u.isEmailVerified && u.isPhoneVerified).length;

    return NextResponse.json({
      users: enrichedUsers,
      summary: {
        total: totalUsers,
        active: activeCount,
        businessOwners,
        highRisk: highRiskCount,
        engaged: engagedCount,
        atRisk: atRiskCount,
        verified: verifiedCount
      },
      pagination: {
        limit,
        offset,
        hasMore: totalUsers === limit
      }
    });

  } catch (error) {
    console.error('Error in bulk user management API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST endpoint for bulk user operations
export async function POST(request: NextRequest) {
  try {
    const headersList = headers();
    const authorization = headersList.get('authorization');
    
    if (!authorization?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { action, userIds, operationConfig } = body;

    if (!action || !userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return NextResponse.json({ error: 'Invalid request data' }, { status: 400 });
    }

    let updateFields: any = {
      updated_at: new Date().toISOString()
    };

    // Prepare update fields based on operation type
    switch (action) {
      case 'ROLE_ASSIGNMENT':
        if (!operationConfig?.roleChanges?.newRole) {
          return NextResponse.json({ error: 'Missing role assignment data' }, { status: 400 });
        }
        updateFields.role = operationConfig.roleChanges.newRole;
        if (operationConfig.roleChanges.reason) {
          updateFields.role_change_reason = operationConfig.roleChanges.reason;
        }
        break;

      case 'ACCOUNT_STATUS':
        if (!operationConfig?.statusChanges?.newStatus) {
          return NextResponse.json({ error: 'Missing status change data' }, { status: 400 });
        }
        updateFields.status = operationConfig.statusChanges.newStatus;
        if (operationConfig.statusChanges.reason) {
          updateFields.status_change_reason = operationConfig.statusChanges.reason;
        }
        if (operationConfig.statusChanges.newStatus === 'SUSPENDED' && operationConfig.statusChanges.suspensionDuration) {
          const suspensionEnd = new Date();
          const duration = operationConfig.statusChanges.suspensionDuration;
          if (duration === '7_DAYS') {
            suspensionEnd.setDate(suspensionEnd.getDate() + 7);
          } else if (duration === '30_DAYS') {
            suspensionEnd.setDate(suspensionEnd.getDate() + 30);
          } else if (duration === '90_DAYS') {
            suspensionEnd.setDate(suspensionEnd.getDate() + 90);
          }
          updateFields.suspended_until = suspensionEnd.toISOString();
        }
        break;

      case 'LIFECYCLE_UPDATE':
        if (!operationConfig?.lifecycleConfig?.newStage) {
          return NextResponse.json({ error: 'Missing lifecycle update data' }, { status: 400 });
        }
        updateFields.lifecycle_stage = operationConfig.lifecycleConfig.newStage;
        break;

      case 'SEGMENTATION':
        if (!operationConfig?.segmentationConfig) {
          return NextResponse.json({ error: 'Missing segmentation data' }, { status: 400 });
        }
        // Handle segment operations
        const { segments, operation } = operationConfig.segmentationConfig;
        if (operation === 'ADD') {
          // Add segments (would need to implement segment management)
          updateFields.segments = segments;
        } else if (operation === 'REMOVE') {
          // Remove segments
          updateFields.segments_to_remove = segments;
        } else if (operation === 'REPLACE') {
          // Replace all segments
          updateFields.segments = segments;
        }
        break;

      default:
        return NextResponse.json({ error: 'Invalid operation type' }, { status: 400 });
    }

    // Execute the bulk update
    const { data, error } = await supabase
      .from('users')
      .update(updateFields)
      .in('id', userIds)
      .select('id, email, first_name, last_name, role, status');

    if (error) {
      console.error('Error executing bulk user operation:', error);
      return NextResponse.json({ error: 'Failed to execute bulk operation' }, { status: 500 });
    }

    // Log the bulk operation in audit_logs
    const auditPromises = userIds.map(async (userId: string) => {
      const user = data?.find(u => u.id === userId);
      return supabase.from('audit_logs').insert({
        table_name: 'users',
        record_id: userId,
        action: `BULK_${action}`,
        changes: updateFields,
        user_id: 'system', // Would be actual user ID in production
        metadata: {
          user_email: user?.email,
          bulk_operation: true,
          operation_id: `bulk_users_${Date.now()}`,
          ...operationConfig
        }
      });
    });

    await Promise.all(auditPromises);

    // Handle communication if requested
    if (operationConfig?.communicationConfig && 
        (operationConfig.roleChanges?.notifyUsers || operationConfig.statusChanges?.notifyUsers)) {
      
      const communicationPromises = data?.map(async (user: any) => {
        // In production, this would send actual notifications
        console.log(`Notification would be sent to ${user.email} regarding ${action}`);
        
        return supabase.from('audit_logs').insert({
          table_name: 'users',
          record_id: user.id,
          action: 'NOTIFICATION_SENT',
          changes: { notification_type: action },
          user_id: 'system',
          metadata: {
            user_email: user.email,
            notification_method: operationConfig.communicationConfig.type,
            message: operationConfig.communicationConfig.message
          }
        });
      }) || [];

      await Promise.all(communicationPromises);
    }

    return NextResponse.json({
      success: true,
      processed: data?.length || 0,
      users: data,
      action,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error in bulk user operation API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}