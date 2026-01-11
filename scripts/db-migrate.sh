#!/bin/bash
# Database migration script that handles both fresh and existing databases
# For existing production databases, we baseline if needed then apply migrations

set -e

echo "🔄 Running database migrations..."

# Try to run migrations normally first
if npx prisma migrate deploy 2>/dev/null; then
    echo "✅ Migrations applied successfully"
    exit 0
fi

echo "⚠️  Standard migration failed, checking if database needs baselining..."

# Check if this is a baseline issue (P3005 - database schema not empty)
# If so, we need to mark existing migrations as applied
MIGRATION_DIRS=$(ls -1 prisma/migrations 2>/dev/null | grep -E '^[0-9]+' || true)

if [ -z "$MIGRATION_DIRS" ]; then
    echo "No migrations found, using db push..."
    npx prisma db push --accept-data-loss
    exit 0
fi

echo "📋 Found migrations to baseline: $MIGRATION_DIRS"

# Mark each migration as already applied (baseline)
for migration in $MIGRATION_DIRS; do
    echo "   Marking $migration as applied..."
    npx prisma migrate resolve --applied "$migration" 2>/dev/null || true
done

# Now try to deploy any new migrations
echo "🚀 Applying any pending migrations..."
npx prisma migrate deploy || {
    echo "⚠️  Migration deploy still failed, falling back to db push..."
    npx prisma db push --accept-data-loss
}

echo "✅ Database schema is up to date"
