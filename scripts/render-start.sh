#!/bin/bash
# Render Start Script
# This script ensures the Next.js build exists before starting the server.
# Render sometimes doesn't preserve build artifacts between build and deploy phases.

set -e

# Ensure PORT is set (default to 3000 for Next.js)
export PORT="${PORT:-3000}"

echo "========================================="
echo "  Render Start Script"
echo "========================================="
echo "  Node version: $(node -v)"
echo "  Working directory: $(pwd)"
echo "  PORT: $PORT"
echo "========================================="

# Check if the standalone build exists
if [ -d ".next/standalone" ] && [ -f ".next/standalone/server.js" ]; then
    echo "==> Standalone build found, starting server on port $PORT..."
    exec node .next/standalone/server.js
fi

# Check if the regular .next build exists
if [ -d ".next" ] && [ -f ".next/BUILD_ID" ]; then
    echo "==> Regular build found, starting with next start..."
    exec npm start
fi

# No build found - need to rebuild
echo "==> No build found, rebuilding..."
echo "==> Directory contents:"
ls -la

# Generate Prisma client (needed for build)
echo "==> Generating Prisma client..."
npx prisma generate

# Build Next.js
echo "==> Building Next.js..."
npx next build

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
    echo "==> Starting standalone server on port $PORT..."
    exec node .next/standalone/server.js
else
    echo "==> Starting with next start on port $PORT..."
    exec npm start
fi
