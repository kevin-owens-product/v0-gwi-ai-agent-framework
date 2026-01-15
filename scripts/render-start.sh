#!/bin/bash
# Render Start Script
# This script ensures the Next.js build exists before starting the server.
# Render sometimes doesn't preserve build artifacts between build and deploy phases.

set -e

# Ensure PORT is set (default to 3000 for Next.js)
export PORT="${PORT:-3000}"

# Memory configuration (must match render-build.js)
# Note: --gc-interval is NOT allowed in NODE_OPTIONS, only --max-old-space-size
export NODE_MEMORY_LIMIT="${NODE_MEMORY_LIMIT:-1280}"
export NODE_OPTIONS="--max-old-space-size=${NODE_MEMORY_LIMIT} ${NODE_OPTIONS:-}"
export MEMORY_CONSTRAINED="${MEMORY_CONSTRAINED:-true}"
export NEXT_TELEMETRY_DISABLED="1"

echo "========================================="
echo "  Render Start Script"
echo "========================================="
echo "  Node version: $(node -v)"
echo "  Working directory: $(pwd)"
echo "  PORT: $PORT"
echo "  NODE_MEMORY_LIMIT: ${NODE_MEMORY_LIMIT}MB"
echo "========================================="

# Function to verify static assets exist and are valid (not turbopack)
verify_static_assets() {
    local static_dir="$1"

    if [ ! -d "$static_dir" ]; then
        echo "    Static directory not found: $static_dir"
        return 1
    fi

    # Check if chunks directory exists (primary indicator of valid build)
    if [ ! -d "$static_dir/chunks" ]; then
        echo "    No chunks directory found in $static_dir"
        return 1
    fi

    # Count files in chunks directory
    local chunk_count=$(ls -1 "$static_dir/chunks" 2>/dev/null | wc -l)
    echo "    Found $chunk_count files in chunks directory"

    if [ "$chunk_count" -eq 0 ]; then
        echo "    WARNING: chunks directory is empty"
        return 1
    fi

    # Check for turbopack files (should NOT exist in production build)
    local turbopack_files=$(ls -1 "$static_dir/chunks" 2>/dev/null | grep -c "^turbopack-" || true)
    if [ "$turbopack_files" -gt 0 ]; then
        echo "    ERROR: Found $turbopack_files turbopack files in production build!"
        echo "    This indicates a dev build was used instead of production build."
        ls -1 "$static_dir/chunks" | grep "^turbopack-" | head -5
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

        if [ -d ".next/static/chunks" ]; then
            echo "    .next/static/chunks/ sample (first 10 files):"
            ls -1 .next/static/chunks/ 2>/dev/null | head -10
        fi

        if [ -d ".next/standalone" ]; then
            echo "    .next/standalone/ contents:"
            ls -la .next/standalone/ 2>/dev/null | head -10
        fi
    else
        echo "    WARNING: .next/ directory NOT FOUND"
    fi
}

# Check if the standalone build exists
if [ -d ".next/standalone" ] && [ -f ".next/standalone/server.js" ]; then
    echo "==> Standalone build found with server.js"

    # Verify static assets in standalone directory
    if verify_static_assets ".next/standalone/.next/static"; then
        echo "==> Starting standalone server on port $PORT..."
        exec node .next/standalone/server.js
    else
        echo "==> Static assets missing or invalid in standalone build"

        # Try to copy static files if they exist in the main .next directory
        if [ -d ".next/static/chunks" ]; then
            echo "==> Attempting to copy static files from main build..."
            mkdir -p .next/standalone/.next
            cp -r .next/static .next/standalone/.next/

            if verify_static_assets ".next/standalone/.next/static"; then
                echo "==> Static files recovered, starting server..."
                exec node .next/standalone/server.js
            fi
        fi

        echo "==> Could not recover static assets, will try regular start..."
    fi
fi

# Check if the regular .next build exists with BUILD_ID
if [ -d ".next" ] && [ -f ".next/BUILD_ID" ]; then
    BUILD_ID=$(cat .next/BUILD_ID)
    echo "==> Regular build found (BUILD_ID: $BUILD_ID)"

    if verify_static_assets ".next/static"; then
        echo "==> Starting with next start..."
        exec npm start
    else
        echo "==> Static assets verification failed, checking chunks directly..."
        debug_build_contents

        # If chunks exist, try to start anyway
        if [ -d ".next/static/chunks" ] && [ "$(ls -1 .next/static/chunks 2>/dev/null | wc -l)" -gt 0 ]; then
            echo "==> Chunks directory has content, attempting to start..."
            exec npm start
        fi
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

# Build Next.js with proper memory constraints
echo "==> Building Next.js..."
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
        cp -r public .next/standalone/
    fi
    if [ -d ".next/static" ]; then
        mkdir -p .next/standalone/.next
        cp -r .next/static .next/standalone/.next/
    fi

    echo "==> Starting standalone server on port $PORT..."
    exec node .next/standalone/server.js
else
    echo "==> Starting with next start on port $PORT..."
    exec npm start
fi
