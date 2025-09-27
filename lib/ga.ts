/**
 * GA4 Analytics Event Helper
 * Safely sends events to Google Analytics with proper error handling
 */

declare global {
  interface Window {
    gtag: (...args: any[]) => void;
  }
}

/**
 * Send a custom event to Google Analytics
 * @param event Event name (e.g., 'lead_submit', 'share_click')
 * @param params Event parameters (e.g., { business_id: '123', source: 'profile' })
 */
export function ga(event: string, params?: Record<string, any>) {
  if (typeof window === 'undefined') {
    return; // Server-side, skip
  }

  if (!window.gtag) {
    if (process.env.NODE_ENV === 'development') {
      console.log(`GA4 Event: ${event}`, params);
    }
    return;
  }

  try {
    window.gtag('event', event, {
      ...params,
      // Add consistent metadata
      timestamp: Date.now(),
      app_name: 'suburbmates',
    });

    if (process.env.NODE_ENV === 'development') {
      console.log(`GA4 Event sent: ${event}`, params);
    }
  } catch (error) {
    console.warn('GA4 event failed:', error);
  }
}

/**
 * Set user properties in GA4
 * @param properties User properties (e.g., { role: 'business', suburb: 'Melbourne' })
 */
export function setUserProperties(properties: Record<string, any>) {
  if (typeof window === 'undefined' || !window.gtag) {
    return;
  }

  try {
    window.gtag('set', 'user_properties', properties);
  } catch (error) {
    console.warn('GA4 user properties failed:', error);
  }
}

/**
 * Track page views manually (useful for SPA navigation)
 * @param page_title Page title
 * @param page_location Page URL
 */
export function trackPageView(page_title?: string, page_location?: string) {
  if (typeof window === 'undefined' || !window.gtag) {
    return;
  }

  try {
    window.gtag('config', process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID, {
      page_title,
      page_location: page_location || window.location.href,
    });
  } catch (error) {
    console.warn('GA4 page view failed:', error);
  }
}