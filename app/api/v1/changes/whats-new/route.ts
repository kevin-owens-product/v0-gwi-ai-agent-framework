import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getUserMembership, getValidatedOrgId } from '@/lib/tenant'
import { hasPermission } from '@/lib/permissions'
import {
  getNewItemsSince,
  getUnseenChangesCount,
  changeTracking,
  type VersionedEntityType,
} from '@/lib/change-tracking'

// Valid entity types
const VALID_ENTITY_TYPES: VersionedEntityType[] = [
  'audience',
  'crosstab',
  'insight',
  'chart',
  'report',
  'dashboard',
  'brand_tracking',
]

// GET /api/v1/changes/whats-new - Get new items since user's last visit
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const orgId = await getValidatedOrgId(request, session.user.id)
    if (!orgId) {
      return NextResponse.json({ error: 'Organization not found or access denied' }, { status: 404 })
    }

    const membership = await getUserMembership(session.user.id, orgId)
    if (!membership) {
      return NextResponse.json({ error: 'Not a member of this organization' }, { status: 403 })
    }

    if (!hasPermission(membership.role, 'dashboards:read')) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 })
    }

    // Parse query params
    const { searchParams } = new URL(request.url)
    const sinceStr = searchParams.get('since')
    const entityTypesStr = searchParams.get('entityTypes')

    // Determine since date - either from param or user's last visit
    let since: Date
    if (sinceStr) {
      since = new Date(sinceStr)
    } else {
      const lastVisit = await changeTracking.getUserLastVisit(orgId, session.user.id)
      since = lastVisit || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Default to 7 days ago
    }

    // Parse entity types filter
    let entityTypes: VersionedEntityType[] | undefined
    if (entityTypesStr) {
      entityTypes = entityTypesStr
        .split(',')
        .filter(t => VALID_ENTITY_TYPES.includes(t as VersionedEntityType)) as VersionedEntityType[]
    }

    // Get new items
    const newItems = await getNewItemsSince(orgId, since, entityTypes)

    // Calculate totals
    const totalNewItems = newItems.reduce((sum, category) => sum + category.count, 0)

    // Get changes count (updates, not just new items)
    const changesCount = await getUnseenChangesCount(orgId, session.user.id)

    return NextResponse.json({
      since: since.toISOString(),
      newItems,
      totalNewItems,
      changesCount,
      categories: newItems.map(category => ({
        entityType: category.entityType,
        count: category.count,
        label: formatEntityTypeLabel(category.entityType),
      })),
    })
  } catch (error) {
    console.error('GET /api/v1/changes/whats-new error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/v1/changes/whats-new - Mark changes as seen
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const orgId = await getValidatedOrgId(request, session.user.id)
    if (!orgId) {
      return NextResponse.json({ error: 'Organization not found or access denied' }, { status: 404 })
    }

    const membership = await getUserMembership(session.user.id, orgId)
    if (!membership) {
      return NextResponse.json({ error: 'Not a member of this organization' }, { status: 403 })
    }

    // Mark changes as seen
    await changeTracking.markChangesSeen(orgId, session.user.id)

    return NextResponse.json({ success: true, markedAt: new Date().toISOString() })
  } catch (error) {
    console.error('POST /api/v1/changes/whats-new error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Helper to format entity type as human-readable label
function formatEntityTypeLabel(entityType: VersionedEntityType): string {
  const labels: Record<VersionedEntityType, string> = {
    audience: 'Audiences',
    crosstab: 'Crosstabs',
    insight: 'Insights',
    chart: 'Charts',
    report: 'Reports',
    dashboard: 'Dashboards',
    brand_tracking: 'Brand Tracking',
  }
  return labels[entityType] || entityType
}
