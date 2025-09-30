/**
 * GA4 Client-Side Tracking Utility
 * 
 * Provides a simple interface for tracking events on the client-side
 * with automatic environment detection and error handling.
 */

declare global {
  interface Window {
    gtag: (...args: any[]) => void;
  }
}

// GA4 Configuration
const GA4_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID;
const isDevelopment = process.env.NODE_ENV === 'development';

/**
 * Client-side GA4 event tracking
 * Usage: ga('event_name', { custom_parameter: 'value' })
 */
export function ga(eventName: string, parameters?: Record<string, any>): void {
  // Skip tracking in development or if measurement ID is not configured
  if (isDevelopment || !GA4_MEASUREMENT_ID) {
    console.log('GA4 (dev):', eventName, parameters);
    return;
  }

  // Skip if gtag is not available
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') {
    console.warn('GA4: gtag not available');
    return;
  }

  try {
    // Send event to GA4
    window.gtag('event', eventName, {
      // Add default parameters
      timestamp: Date.now(),
      page_url: window.location.href,
      page_title: document.title,
      
      // Add custom parameters
      ...parameters,
    });

    // Log successful tracking in development
    if (isDevelopment) {
      console.log('GA4 Event:', eventName, parameters);
    }
  } catch (error) {
    console.error('GA4 tracking error:', error);
  }
}

/**
 * Track page views
 * Automatically called by Next.js router or can be called manually
 */
export function trackPageView(url?: string, title?: string): void {
  ga('page_view', {
    page_location: url || (typeof window !== 'undefined' ? window.location.href : ''),
    page_title: title || (typeof document !== 'undefined' ? document.title : ''),
  });
}

/**
 * User Journey Events
 */
export const userJourneyEvents = {
  homeSearchSubmit: (query: string, category?: string, suburb?: string) => {
    ga('home_search_submit', {
      search_term: query,
      category,
      suburb,
    });
  },

  searchView: (query?: string, category?: string, suburb?: string, resultsCount?: number) => {
    ga('search_view', {
      search_term: query,
      category,
      suburb,
      results_count: resultsCount,
    });
  },

  filterApply: (filterType: string, filterValue: string) => {
    ga('filter_apply', {
      filter_type: filterType,
      filter_value: filterValue,
    });
  },

  resultClick: (businessId: string, position: number, category?: string) => {
    ga('result_click', {
      business_id: businessId,
      position,
      category,
    });
  },

  profileView: (businessId: string, businessName?: string, category?: string) => {
    ga('profile_view', {
      business_id: businessId,
      business_name: businessName,
      category,
    });
  },

  leadSubmit: (businessId: string, businessName?: string, method?: string) => {
    ga('lead_submit', {
      business_id: businessId,
      business_name: businessName,
      contact_method: method,
    });
  },

  shareClick: (businessId: string, platform: string) => {
    ga('share_click', {
      business_id: businessId,
      platform,
    });
  },

  reviewSubmit: (businessId: string, rating: number) => {
    ga('review_submit', {
      business_id: businessId,
      rating,
    });
  },
};

/**
 * Authentication Events
 */
export const authEvents = {
  signupSubmit: (method?: string) => {
    ga('signup_submit', {
      method: method || 'email',
    });
  },

  emailVerifySent: () => {
    ga('email_verify_sent');
  },

  loginSubmit: (method?: string) => {
    ga('login_submit', {
      method: method || 'email',
    });
  },

  passwordResetRequest: () => {
    ga('password_reset_request');
  },
};

/**
 * Business Owner Events
 */
export const businessOwnerEvents = {
  registerBusinessStep: (step: number, stepName: string) => {
    ga('register_business_step', {
      step_number: step,
      step_name: stepName,
    });
  },

  registerBusinessComplete: (businessId?: string, category?: string) => {
    ga('register_business_complete', {
      business_id: businessId,
      category,
    });
  },

  claimStart: (businessId: string, method?: string) => {
    ga('claim_start', {
      business_id: businessId,
      method,
    });
  },

  claimSubmit: (businessId: string, method: string) => {
    ga('claim_submit', {
      business_id: businessId,
      method,
    });
  },

  claimAutoApproved: (businessId: string) => {
    ga('claim_auto_approved', {
      business_id: businessId,
    });
  },

  claimRejected: (businessId: string, reason?: string) => {
    ga('claim_rejected', {
      business_id: businessId,
      reason,
    });
  },

  dashboardView: (section?: string) => {
    ga('dashboard_view', {
      section,
    });
  },

  profileUpdate: (section: string) => {
    ga('profile_update', {
      section,
    });
  },

  leadReply: (inquiryId: string) => {
    ga('lead_reply', {
      inquiry_id: inquiryId,
    });
  },

  shareGenerate: (type: string, businessId: string) => {
    ga('share_generate', {
      share_type: type, // qr_code, social_link, embed_code
      business_id: businessId,
    });
  },
};

/**
 * Static Page Events
 */
export const staticPageEvents = {
  aboutView: () => ga('about_view'),
  supportView: () => ga('support_view'),
  privacyView: () => ga('privacy_view'),
  termsView: () => ga('terms_view'),
};

/**
 * CTA and Navigation Events
 */
export const ctaEvents = {
  ctaClaimClick: (businessId?: string) => {
    ga('cta_claim_click', {
      business_id: businessId,
    });
  },

  ctaRegisterClick: (source?: string) => {
    ga('cta_register_click', {
      source,
    });
  },
};

/**
 * Admin Events (for admin users)
 */
export const adminEvents = {
  adminClaimsReview: (action?: string) => {
    ga('admin_claims_review', {
      action,
    });
  },

  flagToggle: (flagName: string, enabled: boolean) => {
    ga('flag_toggle', {
      flag_name: flagName,
      enabled,
    });
  },

  adminAction: (action: string, target?: string) => {
    ga('admin_action', {
      action,
      target,
    });
  },
};

// Export main tracking function and event helpers
export default ga;
