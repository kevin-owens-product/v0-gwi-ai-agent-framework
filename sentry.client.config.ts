// This file configures the initialization of Sentry on the client.
// The config you add here will be used whenever a user loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Adjust this value in production, or use tracesSampler for greater control
  tracesSampleRate: 1.0,

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

  // Environment configuration
  environment: process.env.NODE_ENV,

  // Release tracking for better error tracking across deployments
  release: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA || process.env.RENDER_GIT_COMMIT || 'development',

  // Ignore common errors that don't need tracking
  ignoreErrors: [
    // Browser extensions
    'top.GLOBALS',
    // Random plugins/extensions
    'originalCreateNotification',
    'canvas.contentDocument',
    'MyApp_RemoveAllHighlights',
    // Facebook borked
    'fb_xd_fragment',
    // ISP "optimizing" proxy - `Cache-Control: no-transform` seems to reduce this. (thanks @acdha)
    'bmi_SafeAddOnload',
    'EBCallBackMessageReceived',
    // Network errors that are expected
    'NetworkError',
    'Network request failed',
    // ResizeObserver loop limit exceeded (harmless)
    'ResizeObserver loop limit exceeded',
    'ResizeObserver loop completed with undelivered notifications',
  ],

  // Filter out localhost and development URLs
  beforeSend(event, _hint) {
    // Don't send events in development
    if (process.env.NODE_ENV === 'development') {
      return null;
    }

    // Filter out errors from browser extensions
    if (event.exception && event.exception.values) {
      const exceptionValue = event.exception.values[0];
      if (exceptionValue && exceptionValue.stacktrace) {
        const frames = exceptionValue.stacktrace.frames || [];
        const isBrowserExtension = frames.some(frame =>
          frame.filename?.includes('chrome-extension://') ||
          frame.filename?.includes('moz-extension://') ||
          frame.filename?.includes('safari-extension://')
        );
        if (isBrowserExtension) {
          return null;
        }
      }
    }

    return event;
  },
});
