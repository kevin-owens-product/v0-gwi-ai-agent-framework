# Memory Optimization for Render Deployments

This document describes the memory optimization strategy for deploying to Render's 2GB memory limit.

## Problem

Render's standard plan has a 2GB memory limit. Our Next.js build process was exceeding this limit due to:

1. **Next.js Build** (~800-1000MB) - Compilation, minification, code splitting
2. **Sentry Webpack Plugin** (~200-300MB) - Source map processing
3. **Database Seeding** (~400-500MB) - Creating 10K+ lines of demo data
4. **Node.js Base** (~100-200MB) - Runtime overhead

Total: ~1500-2000MB, frequently exceeding 2GB during peak usage.

## Solution

### Memory Budget

```
Total Available:        2048 MB
├── OS & System:        ~200 MB
├── Node.js Base:       ~100 MB
├── Safety Margin:      ~200 MB
└── Available for App:  ~1548 MB
    └── Target Heap:    1280 MB (conservative)
```

### Optimizations Implemented

#### 1. Next.js Configuration (`next.config.mjs`)

| Setting | Normal Build | Memory-Constrained |
|---------|--------------|-------------------|
| Worker Threads | Enabled | Disabled |
| CPUs | Auto | 1 |
| Source Maps | Enabled | Disabled |
| Sentry Plugin | Full | Skipped |
| Terser Parallel | Yes | No |

Detection: `RENDER=true` or `MEMORY_CONSTRAINED=true`

#### 2. Build Script (`scripts/render-build.js`)

- **Phased Approach**: Separates build into discrete phases with memory logging
- **Reduced Heap**: 1280MB (down from 1536MB)
- **Cache Clearing**: Clears caches between phases
- **GC Hints**: More frequent garbage collection

#### 3. Database Seeding Strategy

| Script | Records | Memory | Use Case |
|--------|---------|--------|----------|
| `db:seed` | 10K+ | ~500MB | Development |
| `db:seed:minimal` | ~20 | ~50MB | Memory-constrained |
| `db:seed-if-empty` | Conditional | Varies | CI/CD |

Production builds skip seeding entirely (NODE_ENV=production).

## Environment Variables

| Variable | Value | Purpose |
|----------|-------|---------|
| `RENDER` | `true` | Trigger Render optimizations |
| `MEMORY_CONSTRAINED` | `true` | Force memory-optimized build |
| `NODE_MEMORY_LIMIT` | `1280` | Heap size in MB |
| `SKIP_SEED` | `true` | Skip database seeding |
| `USE_MINIMAL_SEED` | `true` | Use lightweight seed |

## Commands

```bash
# Production build (memory-optimized)
npm run build:render

# Minimal seed (for staging/preview)
npm run db:seed:minimal

# Full seed (development only)
npm run db:seed

# Conditional seed (skips if data exists)
npm run db:seed-if-empty
```

## Monitoring Memory Usage

The build script logs memory at each phase:

```
[Memory @ start] Heap: 45/67MB, RSS: 156MB
[Memory @ end] Heap: 89/134MB, RSS: 245MB
```

If builds still fail:

1. Check RSS (Resident Set Size) - should stay under 1800MB
2. Look for memory spikes during "Building Next.js application" phase
3. Consider further reducing `NODE_MEMORY_LIMIT`

## Troubleshooting

### Build Still Failing with OOM

1. Reduce `NODE_MEMORY_LIMIT` to `1024`
2. Ensure `MEMORY_CONSTRAINED=true` is set
3. Clear Render's build cache (Render Dashboard > Manual Deploy > Clear Build Cache)
4. Check for large dependencies being bundled

### Sentry Not Working After Deploy

Sentry SDK still works at runtime for error tracking. Only the build-time source map upload is disabled. To upload source maps:

```bash
# Run locally after build
npx @sentry/cli sourcemaps upload .next --org YOUR_ORG --project YOUR_PROJECT
```

### Database Has No Data

If database is empty after deploy:

```bash
# Connect to Render shell and run:
npm run db:seed:minimal

# Or for full data:
npm run db:seed
```

## Files Modified

| File | Change |
|------|--------|
| `next.config.mjs` | Conditional Sentry, webpack optimizations |
| `scripts/render-build.js` | Phased build, memory monitoring |
| `prisma/seed-minimal.ts` | Lightweight seed script |
| `render.yaml` | Updated memory settings |
| `package.json` | Added `db:seed:minimal` script |

## Memory Usage by Phase

Typical memory usage on Render (measured):

```
Phase 1 - Prisma Generate:     ~150 MB
Phase 2 - Database Migration:  ~200 MB
Phase 3 - Next.js Build:       ~1200 MB (peak)
Phase 4 - Verification:        ~400 MB
Phase 5 - Standalone Prep:     ~450 MB
Final:                         ~500 MB
```

Peak usage should stay under 1500MB to leave headroom for OS processes.
