import { withSentryConfig } from "@sentry/nextjs";

// Check if we're in a memory-constrained build environment
const isMemoryConstrained = process.env.RENDER === 'true' || process.env.MEMORY_CONSTRAINED === 'true';

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  experimental: {
    turbopackUseSystemTlsCerts: true,
    // Reduce memory usage during builds
    workerThreads: isMemoryConstrained ? false : undefined,
    cpus: isMemoryConstrained ? 1 : undefined,
  },
}

// Sentry configuration options
const sentryWebpackPluginOptions = {
  // For all available options, see:
  // https://github.com/getsentry/sentry-webpack-plugin#options

  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,

  // Only upload source maps in production CI (not on Render builds to save memory)
  silent: !process.env.CI,

  // Disable source map upload on memory-constrained builds (saves significant memory)
  // Source maps can be uploaded separately via CI/CD pipeline if needed
  sourcemaps: {
    disable: isMemoryConstrained,
  },

  // Hides source maps from generated client bundles
  hideSourceMaps: true,

  // Upload source maps for better error tracking (disabled in memory-constrained environments)
  widenClientFileUpload: !isMemoryConstrained,

  // Transpiles SDK to be compatible with IE11 if needed
  transpileClientSDK: true,

  // Route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers
  tunnelRoute: "/monitoring",

  // Webpack-specific Sentry options (migrated from deprecated top-level options)
  webpack: {
    treeshake: {
      // Automatically tree-shake Sentry logger statements for smaller bundle size
      removeDebugLogging: true,
    },
    // Automatically annotate React components to show their full name in breadcrumbs and session replay
    reactComponentAnnotation: {
      enabled: true,
    },
  },
};

// Make sure adding Sentry options is the last code to run before exporting
export default withSentryConfig(nextConfig, sentryWebpackPluginOptions);
