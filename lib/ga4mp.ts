/**
 * GA4 Measurement Protocol for Server-Side Event Tracking
 * Sends critical events to GA4 from server to ensure they're captured
 * even if client-side tracking fails
 */

import { randomUUID } from 'crypto';

interface GA4Event {
  name: string;
  params?: Record<string, any>;
  clientId?: string;
  userId?: string;
}

/**
 * Track server-side event via GA4 Measurement Protocol
 * @param event Event configuration
 */
export async function trackServerEvent(event: GA4Event) {
  const GA4_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID;
  const GA4_API_SECRET = process.env.GA4_API_SECRET;

  // Skip if not configured
  if (!GA4_MEASUREMENT_ID || !GA4_API_SECRET) {
    if (process.env.NODE_ENV === 'development') {
      console.log('GA4 MP Event (mock):', event);
    }
    return;
  }

  const endpoint = `https://www.google-analytics.com/mp/collect?measurement_id=${GA4_MEASUREMENT_ID}&api_secret=${GA4_API_SECRET}`;

  const payload = {
    client_id: event.clientId || randomUUID(),
    user_id: event.userId,
    timestamp_micros: Date.now() * 1000,
    events: [
      {
        name: event.name,
        params: {
          ...event.params,
          // Add server-side context
          source: 'server',
          app_name: 'suburbmates',
          engagement_time_msec: 1, // Required for some events
        },
      },
    ],
  };

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`GA4 MP failed: ${response.status} ${response.statusText}`);
    }

    if (process.env.NODE_ENV === 'development') {
      console.log('GA4 MP Event sent:', event);
    }
  } catch (error) {
    console.error('GA4 MP error:', error);
    // Don't throw - analytics failures shouldn't break app functionality
  }
}

/**
 * Track lead submission from server
 */
export async function trackLeadSubmission(businessId: string, source: string = 'profile', userId?: string) {
  return trackServerEvent({
    name: 'lead_submit',
    params: {
      business_id: businessId,
      source,
      currency: 'AUD', // For conversion tracking
      value: 50, // Estimated lead value
    },
    userId,
  });
}

/**
 * Track claim decision from server
 */
export async function trackClaimDecision(
  businessId: string, 
  decision: 'approved' | 'rejected', 
  userId?: string,
  reason?: string
) {
  const eventName = decision === 'approved' ? 'claim_auto_approved' : 'claim_rejected';
  
  return trackServerEvent({
    name: eventName,
    params: {
      business_id: businessId,
      reason: reason || 'unknown',
      currency: 'AUD',
      value: decision === 'approved' ? 100 : 0, // Business acquisition value
    },
    userId,
  });
}

/**
 * Track business registration completion from server
 */
export async function trackBusinessRegistration(businessId: string, step: string = 'completed', userId?: string) {
  return trackServerEvent({
    name: 'register_business',
    params: {
      business_id: businessId,
      step,
      currency: 'AUD',
      value: 200, // New business signup value
    },
    userId,
  });
}