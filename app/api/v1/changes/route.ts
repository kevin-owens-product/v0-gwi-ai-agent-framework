import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getUserMembership, getValidatedOrgId } from '@/lib/tenant'
import { hasPermission } from '@/lib/permissions'
import {
  getChangeTimeline,
  getNewItemsSince,
  getUnseenChangesCount,
  trackUserVisit,
  changeTracking,
  type VersionedEntityType,
  type ChangeTimelineOptions,
} from '@/lib/change-tracking'
import {
  getChangeAlerts,
  generateChangeSummary,
  getChangeSummaries,
  getUnreadAlertCount,
} from '@/lib/change-notifications'

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

// GET /api/v1/changes - Get change timeline and summary
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
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100)
    const offset = parseInt(searchParams.get('offset') || '0')
    const entityTypesStr = searchParams.get('entityTypes')
    const startDateStr = searchParams.get('startDate')
    const endDateStr = searchParams.get('endDate')
    const significantOnly = searchParams.get('significantOnly') === 'true'
    const period = searchParams.get('period') as 'daily' | 'weekly' | 'monthly' | null

    // Build options
    const options: ChangeTimelineOptions = {
      limit,
      offset,
      significantOnly,
    }

    if (entityTypesStr) {
      const entityTypes = entityTypesStr.split(',').filter(t =>
        VALID_ENTITY_TYPES.includes(t as VersionedEntityType)
      ) as VersionedEntityType[]
      if (entityTypes.length > 0) {
        options.entityTypes = entityTypes
      }
    }

    if (startDateStr) options.startDate = new Date(startDateStr)
    if (endDateStr) options.endDate = new Date(endDateStr)

    // Get change timeline
    const { changes, total } = await getChangeTimeline(orgId, options)

    // Get user's unseen changes count
    const unseenCount = await getUnseenChangesCount(orgId, session.user.id)

    // Get unread alerts count
    const unreadAlertCount = await getUnreadAlertCount(orgId)

    // Get recent summaries if period specified
    let summaries: Awaited<ReturnType<typeof getChangeSummaries>> = []
    if (period) {
      summaries = await getChangeSummaries(orgId, { period, limit: 5 })
    }

    // Track user visit
    await trackUserVisit(orgId, session.user.id)

    return NextResponse.json({
      changes,
      total,
      limit,
      offset,
      unseenCount,
      unreadAlertCount,
      summaries,
    })
  } catch (error) {
    console.error('GET /api/v1/changes error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
