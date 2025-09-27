import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN,

  // Adjust this value in production, or use tracesSampler for greater control
  tracesSampleRate: 1,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,

  // Environment-specific configuration
  environment: process.env.NODE_ENV,

  // Set additional tags for better organization
  initialScope: {
    tags: {
      component: "server",
    },
  },

  // Configure integrations for server-side
  integrations: [
    // Node.js specific integrations
    Sentry.httpIntegration(),
    Sentry.nodeContextIntegration(),
    Sentry.consoleIntegration(),
  ],

  // Enhanced error capturing for server actions
  beforeSend(event, hint) {
    // Add additional context for server errors
    if (event.exception) {
      const exception = event.exception.values?.[0];
      
      // Filter out database connection errors in development
      if (process.env.NODE_ENV === 'development' && 
          exception?.value?.includes('connect ECONNREFUSED')) {
        return null;
      }

      // Add more context for API errors
      if (event.request?.url) {
        event.tags = {
          ...event.tags,
          api_route: event.request.url,
        };
      }
    }

    return event;
  },

  // Configure sampling for performance monitoring
  tracesSampler(samplingContext) {
    // Always sample critical paths
    if (samplingContext.request?.url?.includes('/api/business/')) {
      return 1.0;
    }
    
    // Sample auth routes more frequently
    if (samplingContext.request?.url?.includes('/api/auth/')) {
      return 0.8;
    }
    
    // Lower sampling for static assets
    if (samplingContext.request?.url?.includes('/_next/static/')) {
      return 0.1;
    }
    
    return 0.5; // Default sampling
  },

  // Configure release tracking
  release: process.env.VERCEL_GIT_COMMIT_SHA || process.env.npm_package_version,
});