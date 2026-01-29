import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./lib/i18n/request.ts');

// Check if we're in a memory-constrained build environment
const isMemoryConstrained = process.env.RENDER === 'true' || process.env.MEMORY_CONSTRAINED === 'true';
const isDevelopment = process.env.NODE_ENV === 'development';

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  typescript: {
    // TODO: Fix TypeScript errors and set to false
    // Known issues:
    // 1. Next.js 16 async params migration (params is now Promise<T>)
    // 2. Unused imports after enabling noUnusedLocals
    // Run `npx tsc --noEmit` to see all errors
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Turbopack configuration - required by Next.js 16 when webpack config exists
  // In production builds on memory-constrained environments, we use --webpack flag
  // to explicitly use webpack with memory optimizations instead of Turbopack
  turbopack: {
    ...(isDevelopment && { useSystemTlsCerts: true }),
  },
  experimental: {
    // Reduce memory usage during builds on memory-constrained environments
    workerThreads: isMemoryConstrained ? false : undefined,
    cpus: isMemoryConstrained ? 1 : undefined,
  },
  // Suppress Fast Refresh logs in development
  reactStrictMode: true,
  // Add cache-control headers to prevent stale HTML caching
  async headers() {
    const commonNoCacheHeaders = [
      {
        key: 'Cache-Control',
        value: 'no-cache, no-store, must-revalidate, max-age=0',
      },
      {
        key: 'Pragma',
        value: 'no-cache',
      },
      {
        key: 'Expires',
        value: '0',
      },
      {
        key: 'Surrogate-Control',
        value: 'no-store',
      },
    ];

    return [
      {
        // HTML pages should not be cached to ensure fresh chunk references
        source: '/((?!_next/static|_next/image|favicon.ico).*)',
        headers: commonNoCacheHeaders,
      },
      // In development, don't cache JS chunks either for faster iteration
      ...(isDevelopment ? [
        {
          source: '/_next/static/chunks/:path*',
          headers: commonNoCacheHeaders,
        },
        {
          source: '/_next/static/development/:path*',
          headers: commonNoCacheHeaders,
        },
      ] : [
        {
          // Static assets with hashed filenames can be cached forever in production
          source: '/_next/static/:path*',
          headers: [
            {
              key: 'Cache-Control',
              value: 'public, max-age=31536000, immutable',
            },
          ],
        },
      ]),
    ];
  },
  // Optimize webpack for memory-constrained environments
  webpack: (config, { isServer, dev }) => {
    if (isMemoryConstrained) {
      // Disable source maps entirely to save memory
      config.devtool = false;

      // Reduce parallelism in terser to save memory
      if (config.optimization?.minimizer) {
        config.optimization.minimizer.forEach((minimizer) => {
          if (minimizer.constructor.name === 'TerserPlugin') {
            minimizer.options.parallel = false;
          }
        });
      }

      // Disable performance hints to reduce memory overhead
      config.performance = { hints: false };
    }

    // Suppress Fast Refresh logs in development
    if (dev && !isServer) {
      // Reduce webpack logging verbosity to suppress Fast Refresh messages
      config.infrastructureLogging = {
        level: 'warn', // Show warnings and errors, suppress info logs (including Fast Refresh)
      };
    }

    return config;
  },
}

// Conditionally wrap with Sentry - skip entirely on memory-constrained builds
// This saves ~200-300MB of memory during build
let finalConfig = nextConfig;

if (!isMemoryConstrained) {
  // Only import and use Sentry on non-memory-constrained builds
  const { withSentryConfig } = await import("@sentry/nextjs");

  const sentryWebpackPluginOptions = {
    org: process.env.SENTRY_ORG,
    project: process.env.SENTRY_PROJECT,
    silent: !process.env.CI,
    sourcemaps: {
      disable: false,
    },
    hideSourceMaps: true,
    widenClientFileUpload: true,
    transpileClientSDK: true,
    tunnelRoute: "/monitoring",
    webpack: {
      treeshake: {
        removeDebugLogging: true,
      },
      reactComponentAnnotation: {
        enabled: true,
      },
    },
  };

  finalConfig = withSentryConfig(nextConfig, sentryWebpackPluginOptions);
} else {
  console.log('Memory-constrained build: Skipping Sentry webpack plugin to save ~200-300MB');
}

// Wrap with next-intl plugin for internationalization
export default withNextIntl(finalConfig);
