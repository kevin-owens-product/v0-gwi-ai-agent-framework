#!/bin/bash
# Render Start Script
# This script ensures the Next.js build exists before starting the server.
# Render sometimes doesn't preserve build artifacts between build and deploy phases.

set -e

# Ensure PORT is set (default to 3000 for Next.js)
export PORT="${PORT:-3000}"

# Memory configuration (must match render-build.js)
export NODE_MEMORY_LIMIT="${NODE_MEMORY_LIMIT:-1280}"
export NODE_OPTIONS="--max-old-space-size=${NODE_MEMORY_LIMIT} --gc-interval=100 ${NODE_OPTIONS:-}"
export MEMORY_CONSTRAINED="${MEMORY_CONSTRAINED:-true}"
export NEXT_TELEMETRY_DISABLED="1"

echo "========================================="
echo "  Render Start Script"
echo "========================================="
echo "  Node version: $(node -v)"
echo "  Working directory: $(pwd)"
echo "  PORT: $PORT"
echo "  NODE_MEMORY_LIMIT: ${NODE_MEMORY_LIMIT}MB"
echo "  MEMORY_CONSTRAINED: $MEMORY_CONSTRAINED"
echo "========================================="

# Function to verify static assets exist and are valid (not turbopack)
verify_static_assets() {
    local static_dir="$1"

    if [ ! -d "$static_dir" ]; then
        echo "    WARNING: Static directory not found: $static_dir"
        return 1
    fi

    # Count JS files
    local js_count=$(find "$static_dir" -name "*.js" 2>/dev/null | wc -l)
    local css_count=$(find "$static_dir" -name "*.css" 2>/dev/null | wc -l)

    echo "    Static assets: ${js_count} JS files, ${css_count} CSS files"

    # Check for turbopack files (should NOT exist in production build)
    local turbopack_files=$(find "$static_dir" -name "turbopack-*" 2>/dev/null | wc -l)
    if [ "$turbopack_files" -gt 0 ]; then
        echo "    ERROR: Found $turbopack_files turbopack files in production build!"
        echo "    This indicates a dev build was used instead of production build."
        find "$static_dir" -name "turbopack-*" 2>/dev/null | head -5
        return 1
    fi

    if [ "$js_count" -eq 0 ] && [ "$css_count" -eq 0 ]; then
        echo "    WARNING: No static assets found"
        return 1
    fi

    echo "    Static assets verified OK"
    return 0
}

# Function to list build directory contents for debugging
debug_build_contents() {
    echo "==> Build directory contents:"
    if [ -d ".next" ]; then
        echo "    .next/ exists"
        ls -la .next/ 2>/dev/null | head -15

        if [ -d ".next/static" ]; then
            echo "    .next/static/ contents:"
            ls -la .next/static/ 2>/dev/null | head -10
        fi

        if [ -d ".next/standalone" ]; then
            echo "    .next/standalone/ exists"
            if [ -d ".next/standalone/.next/static" ]; then
                echo "    .next/standalone/.next/static/ contents:"
                ls -la .next/standalone/.next/static/ 2>/dev/null | head -10
            else
                echo "    WARNING: .next/standalone/.next/static/ NOT FOUND"
            fi
        fi
    else
        echo "    WARNING: .next/ directory NOT FOUND"
    fi
}

# Check if the standalone build exists
if [ -d ".next/standalone" ] && [ -f ".next/standalone/server.js" ]; then
    echo "==> Standalone build found"

    # Verify static assets in standalone directory
    if verify_static_assets ".next/standalone/.next/static"; then
        echo "==> Starting standalone server on port $PORT..."
        exec node .next/standalone/server.js
    else
        echo "==> WARNING: Static assets missing or invalid in standalone build"
        debug_build_contents

        # Try to copy static files if they exist in the main .next directory
        if [ -d ".next/static" ]; then
            echo "==> Attempting to copy missing static files..."
            mkdir -p .next/standalone/.next
            cp -r .next/static .next/standalone/.next/

            if verify_static_assets ".next/standalone/.next/static"; then
                echo "==> Static files recovered, starting server..."
                exec node .next/standalone/server.js
            fi
        fi

        echo "==> ERROR: Cannot start with invalid static assets"
        echo "==> Falling back to rebuild..."
    fi
fi

# Check if the regular .next build exists
if [ -d ".next" ] && [ -f ".next/BUILD_ID" ]; then
    echo "==> Regular build found (BUILD_ID: $(cat .next/BUILD_ID))"

    if verify_static_assets ".next/static"; then
        echo "==> Starting with next start..."
        exec npm start
    else
        echo "==> WARNING: Static assets missing or invalid"
        debug_build_contents
    fi
fi

# No valid build found - need to rebuild
echo "========================================="
echo "  WARNING: No valid build found!"
echo "  Initiating emergency rebuild..."
echo "========================================="
debug_build_contents

# Generate Prisma client (needed for build)
echo "==> Generating Prisma client..."
npx prisma generate

# Build Next.js with proper memory constraints (matching render-build.js)
echo "==> Building Next.js with memory-optimized settings..."
echo "    Memory limit: ${NODE_MEMORY_LIMIT}MB"
echo "    Memory constrained: $MEMORY_CONSTRAINED"
npx next build

# Verify build succeeded
if [ ! -f ".next/BUILD_ID" ]; then
    echo "==> ERROR: Build failed - no BUILD_ID found"
    exit 1
fi

echo "==> Build completed: $(cat .next/BUILD_ID)"

# Check for standalone build
if [ -d ".next/standalone" ] && [ -f ".next/standalone/server.js" ]; then
    # Copy public and static folders to standalone
    echo "==> Preparing standalone deployment..."
    if [ -d "public" ]; then
        echo "    Copying public/ to .next/standalone/public/"
        cp -r public .next/standalone/
    fi
    if [ -d ".next/static" ]; then
        echo "    Copying .next/static/ to .next/standalone/.next/static/"
        mkdir -p .next/standalone/.next
        cp -r .next/static .next/standalone/.next/
    fi

    # Verify static assets after copy
    if ! verify_static_assets ".next/standalone/.next/static"; then
        echo "==> ERROR: Static assets still invalid after rebuild"
        exit 1
    fi

    echo "==> Starting standalone server on port $PORT..."
    exec node .next/standalone/server.js
else
    # Verify static assets for regular build
    if ! verify_static_assets ".next/static"; then
        echo "==> ERROR: Static assets invalid in regular build"
        exit 1
    fi

    echo "==> Starting with next start on port $PORT..."
    exec npm start
fi
