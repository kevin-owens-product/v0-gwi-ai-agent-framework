// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN,

  // Adjust this value in production, or use tracesSampler for greater control
  tracesSampleRate: 1.0,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,

  // Environment configuration
  environment: process.env.NODE_ENV,

  // Release tracking for better error tracking across deployments
  release: process.env.VERCEL_GIT_COMMIT_SHA || process.env.RENDER_GIT_COMMIT || 'development',

  // Enable profiling
  profilesSampleRate: 1.0,

  // Ignore common errors
  ignoreErrors: [
    // Database connection errors during startup (expected during migrations)
    'ECONNREFUSED',
    // Graceful shutdowns
    'SIGTERM',
    'SIGINT',
  ],

  beforeSend(event, hint) {
    // Don't send events in development
    if (process.env.NODE_ENV === 'development') {
      return null;
    }

    // Add server context
    if (event.request) {
      // Remove sensitive headers
      if (event.request.headers) {
        delete event.request.headers['authorization'];
        delete event.request.headers['cookie'];
        delete event.request.headers['x-api-key'];
      }

      // Remove sensitive query parameters
      if (event.request.query_string) {
        const sensitiveParams = ['token', 'api_key', 'password', 'secret'];
        sensitiveParams.forEach(param => {
          if (event.request.query_string?.includes(param)) {
            event.request.query_string = '[REDACTED]';
          }
        });
      }
    }

    return event;
  },
});
