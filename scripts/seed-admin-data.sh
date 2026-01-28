#!/bin/bash
# Script to seed admin data on Render
# Run this via Render shell or as a one-off command

set -e

echo "🌱 Seeding admin data..."
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
  echo "❌ Error: package.json not found. Please run this from the project root."
  exit 1
fi

# Run seed-if-empty (safe for production - only seeds if database is empty)
echo "Running seed-if-empty (safe for production)..."
npm run db:seed-if-empty

echo ""
echo "✅ Admin data seeding complete!"
echo ""
echo "📧 Test Admin Credentials:"
echo "   Email: demo-admin@gwi.com"
echo "   Password: demo123"
echo ""
echo "   Email: superadmin@gwi.com"
echo "   Password: SuperAdmin123!"
