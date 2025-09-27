import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Adjust this value in production, or use tracesSampler for greater control
  tracesSampleRate: 1,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,

  replaysOnErrorSampleRate: 1.0,

  // This sets the sample rate to be 10%. You may want this to be 100% while
  // in development and sample at a lower rate in production
  replaysSessionSampleRate: 0.1,

  // You can remove this option if you're not planning to use the Sentry Session Replay feature:
  integrations: [
    Sentry.replayIntegration({
      // Additional Replay configuration goes in here, for example:
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],

  // Environment-specific configuration
  environment: process.env.NODE_ENV,

  // Set additional tags for better organization
  initialScope: {
    tags: {
      component: "client",
    },
  },

  // Configure beforeSend to filter out common noise
  beforeSend(event, hint) {
    // Filter out network errors and other noise
    if (event.exception) {
      const exception = event.exception.values?.[0];
      if (exception?.type === 'ChunkLoadError' || 
          exception?.type === 'TypeError' && exception?.value?.includes('NetworkError')) {
        return null;
      }
    }

    // Filter out GA4 errors
    if (event.message && event.message.includes('gtag')) {
      return null;
    }

    return event;
  },

  // Add user context enrichment
  beforeBreadcrumb(breadcrumb) {
    // Filter out noisy breadcrumbs
    if (breadcrumb.category === 'console' && breadcrumb.level === 'log') {
      return null;
    }
    
    return breadcrumb;
  },
});