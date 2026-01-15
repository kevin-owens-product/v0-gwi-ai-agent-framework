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
    // Reduce memory usage during builds on memory-constrained environments
    workerThreads: isMemoryConstrained ? false : undefined,
    cpus: isMemoryConstrained ? 1 : undefined,
  },
  // Optimize webpack for memory-constrained environments
  webpack: (config, { isServer }) => {
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

export default finalConfig;
