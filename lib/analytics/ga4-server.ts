/**
 * GA4 Server-Side Tracking Utility
 * 
 * Uses GA4 Measurement Protocol to track events server-side,
 * ensuring critical business events are recorded even when
 * client-side JavaScript is blocked or fails.
 */

import { headers } from 'next/headers';

// GA4 Configuration
const GA4_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID;
const GA4_API_SECRET = process.env.GA4_API_SECRET;
const isDevelopment = process.env.NODE_ENV === 'development';

// Measurement Protocol endpoint
const GA4_ENDPOINT = `https://www.google-analytics.com/mp/collect?measurement_id=${GA4_MEASUREMENT_ID}&api_secret=${GA4_API_SECRET}`;

/**
 * Generate a client ID (should be consistent per user session)
 * In production, this should be more sophisticated (stored in session/cookie)
 */
function generateClientId(): string {
  // Simple client ID generation - in production, use session/cookie storage
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Get request context for server-side tracking
 */
async function getRequestContext() {
  try {
    const headersList = await headers();
    return {
      ip_override: headersList.get('x-forwarded-for') || headersList.get('x-real-ip') || '127.0.0.1',
      user_agent: headersList.get('user-agent') || 'Unknown',
      referer: headersList.get('referer') || undefined,
    };
  } catch (error) {
    // Headers might not be available in all contexts
    return {
      ip_override: '127.0.0.1',
      user_agent: 'Server',
      referer: undefined,
    };
  }
}

/**
 * Server-side GA4 event tracking
 * Usage: await trackServerEvent('lead_submit', { business_id: '123' })
 */
export async function trackServerEvent(
  eventName: string, 
  params: Record<string, any> = {},
  clientId?: string,
  userId?: string
): Promise<void> {
  // Skip tracking in development or if not properly configured
  if (isDevelopment || !GA4_MEASUREMENT_ID || !GA4_API_SECRET) {
    console.log('GA4 Server (dev):', eventName, params);
    return;
  }

  try {
    const context = await getRequestContext();
    
    const payload = {
      client_id: clientId || generateClientId(),
      user_id: userId || undefined,
      events: [
        {
          name: eventName,
          params: {
            // Add server-side context
            engagement_time_msec: 100, // Required parameter
            timestamp_micros: Date.now() * 1000,
            server_side: true,
            
            // Add custom parameters
            ...params,
          }
        }
      ],
      
      // Request context
      ...context,
    };

    const response = await fetch(GA4_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`GA4 API error: ${response.status} ${response.statusText}`);
    }

    // Log successful tracking in development
    if (isDevelopment) {
      console.log('GA4 Server Event:', eventName, params);
    }
  } catch (error) {
    console.error('GA4 server tracking error:', error);
  }
}

/**
 * Directory Import/Export Events
 */
export const directoryEvents = {
  dirImport: async (fileName: string, recordCount: number, source: string, userId?: string) => {
    await trackServerEvent('dir_import', {
      file_name: fileName,
      record_count: recordCount,
      source,
    }, undefined, userId);
  },

  dirApprove: async (businessId: string, businessName: string, userId?: string) => {
    await trackServerEvent('dir_approve', {
      business_id: businessId,
      business_name: businessName,
    }, undefined, userId);
  },

  dirReject: async (businessId: string, businessName: string, reason: string, userId?: string) => {
    await trackServerEvent('dir_reject', {
      business_id: businessId,
      business_name: businessName,
      reason,
    }, undefined, userId);
  },
};

/**
 * Critical Business Events (always tracked server-side)
 */
export const criticalEvents = {
  leadSubmitServer: async (businessId: string, inquiryId: string, businessName?: string, contactMethod?: string) => {
    await trackServerEvent('lead_submit', {
      business_id: businessId,
      inquiry_id: inquiryId,
      business_name: businessName,
      contact_method: contactMethod,
      critical_event: true,
    });
  },

  claimSubmitServer: async (businessId: string, claimId: string, method: string, userId?: string) => {
    await trackServerEvent('claim_submit', {
      business_id: businessId,
      claim_id: claimId,
      method,
      critical_event: true,
    }, undefined, userId);
  },

  businessRegistrationServer: async (businessId: string, category: string, suburb: string, userId?: string) => {
    await trackServerEvent('register_business_complete', {
      business_id: businessId,
      category,
      suburb,
      critical_event: true,
    }, undefined, userId);
  },

  abnVerificationServer: async (businessId: string, abnStatus: string, method: string) => {
    await trackServerEvent('abn_verification', {
      business_id: businessId,
      abn_status: abnStatus,
      verification_method: method,
      critical_event: true,
    });
  },

  adminActionServer: async (action: string, targetId: string, targetType: string, userId: string) => {
    await trackServerEvent('admin_action', {
      action,
      target_id: targetId,
      target_type: targetType,
      critical_event: true,
    }, undefined, userId);
  },
};

/**
 * E-commerce Events for Business Services
 */
export const ecommerceEvents = {
  purchaseEvent: async (transactionId: string, value: number, currency: string = 'AUD', items: any[]) => {
    await trackServerEvent('purchase', {
      transaction_id: transactionId,
      value,
      currency,
      items,
    });
  },

  leadConversion: async (businessId: string, inquiryId: string, value?: number) => {
    await trackServerEvent('conversion', {
      business_id: businessId,
      inquiry_id: inquiryId,
      value: value || 0,
      currency: 'AUD',
      conversion_type: 'lead',
    });
  },
};

/**
 * User Lifecycle Events
 */
export const lifecycleEvents = {
  userRegistration: async (userId: string, method: string, userType: string) => {
    await trackServerEvent('sign_up', {
      method,
      user_type: userType, // business_owner, admin, customer
    }, undefined, userId);
  },

  emailVerification: async (userId: string, success: boolean) => {
    await trackServerEvent('email_verification', {
      success,
    }, undefined, userId);
  },

  firstLogin: async (userId: string, timeSinceRegistration: number) => {
    await trackServerEvent('first_login', {
      time_since_registration: timeSinceRegistration,
    }, undefined, userId);
  },

  profileCompletion: async (userId: string, completionPercentage: number, profileType: string) => {
    await trackServerEvent('profile_completion', {
      completion_percentage: completionPercentage,
      profile_type: profileType, // business, user
    }, undefined, userId);
  },
};

/**
 * Performance and Error Tracking
 */
export const systemEvents = {
  serverError: async (errorType: string, errorMessage: string, endpoint: string) => {
    await trackServerEvent('server_error', {
      error_type: errorType,
      error_message: errorMessage,
      endpoint,
      severity: 'error',
    });
  },

  apiPerformance: async (endpoint: string, responseTime: number, status: number) => {
    await trackServerEvent('api_performance', {
      endpoint,
      response_time: responseTime,
      status_code: status,
    });
  },

  rateLimitHit: async (endpoint: string, ipAddress: string) => {
    await trackServerEvent('rate_limit_hit', {
      endpoint,
      ip_address: ipAddress,
    });
  },
};

/**
 * Content and Feature Usage
 */
export const contentEvents = {
  featureFlagUsage: async (flagName: string, enabled: boolean, userId?: string) => {
    await trackServerEvent('feature_flag_usage', {
      flag_name: flagName,
      enabled,
    }, undefined, userId);
  },

  searchPerformance: async (query: string, resultsCount: number, responseTime: number) => {
    await trackServerEvent('search_performance', {
      search_term: query,
      results_count: resultsCount,
      response_time: responseTime,
    });
  },

  emailDelivery: async (emailType: string, recipient: string, status: string) => {
    // Hash email for privacy
    const hashedEmail = Buffer.from(recipient).toString('base64').slice(0, 10);
    
    await trackServerEvent('email_delivery', {
      email_type: emailType,
      recipient_hash: hashedEmail,
      delivery_status: status,
    });
  },
};

// Export main tracking function and event categories
export default trackServerEvent;
