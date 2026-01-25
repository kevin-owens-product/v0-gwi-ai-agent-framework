import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getUserMembership, getValidatedOrgId } from '@/lib/tenant'
import { hasPermission } from '@/lib/permissions'
import { ChangeAlertType, AlertSeverity } from '@prisma/client'
import {
  getChangeAlerts,
  markAlertAsRead,
  markAllAlertsAsRead,
  dismissChangeAlert,
  getUnreadAlertCount,
} from '@/lib/change-notifications'

// GET /api/v1/changes/alerts - Get change alerts
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
    const alertTypesStr = searchParams.get('alertTypes')
    const severitiesStr = searchParams.get('severities')
    const entityTypesStr = searchParams.get('entityTypes')
    const includeRead = searchParams.get('includeRead') === 'true'
    const includeDismissed = searchParams.get('includeDismissed') === 'true'
    const startDateStr = searchParams.get('startDate')
    const endDateStr = searchParams.get('endDate')

    // Build options
    const options: Parameters<typeof getChangeAlerts>[1] = {
      limit,
      offset,
      includeRead,
      includeDismissed,
    }

    if (alertTypesStr) {
      options.alertTypes = alertTypesStr.split(',') as ChangeAlertType[]
    }

    if (severitiesStr) {
      options.severities = severitiesStr.split(',') as AlertSeverity[]
    }

    if (entityTypesStr) {
      options.entityTypes = entityTypesStr.split(',')
    }

    if (startDateStr) options.startDate = new Date(startDateStr)
    if (endDateStr) options.endDate = new Date(endDateStr)

    // Get alerts
    const { alerts, total } = await getChangeAlerts(orgId, options)

    // Get unread count
    const unreadCount = await getUnreadAlertCount(orgId)

    // Group alerts by severity for summary
    const bySeverity = {
      critical: alerts.filter(a => a.severity === 'CRITICAL').length,
      warning: alerts.filter(a => a.severity === 'WARNING').length,
      info: alerts.filter(a => a.severity === 'INFO').length,
    }

    return NextResponse.json({
      alerts,
      total,
      limit,
      offset,
      unreadCount,
      bySeverity,
    })
  } catch (error) {
    console.error('GET /api/v1/changes/alerts error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/v1/changes/alerts - Batch operations on alerts
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

    if (!hasPermission(membership.role, 'dashboards:read')) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 })
    }

    const body = await request.json()
    const { action, alertId, alertIds } = body

    switch (action) {
      case 'markRead':
        if (alertId) {
          await markAlertAsRead(alertId)
          return NextResponse.json({ success: true, action: 'markRead', alertId })
        }
        break

      case 'markAllRead':
        const count = await markAllAlertsAsRead(orgId)
        return NextResponse.json({ success: true, action: 'markAllRead', count })

      case 'dismiss':
        if (alertId) {
          await dismissChangeAlert(alertId)
          return NextResponse.json({ success: true, action: 'dismiss', alertId })
        }
        break

      case 'dismissMultiple':
        if (alertIds && Array.isArray(alertIds)) {
          await Promise.all(alertIds.map(id => dismissChangeAlert(id)))
          return NextResponse.json({
            success: true,
            action: 'dismissMultiple',
            count: alertIds.length,
          })
        }
        break

      default:
        return NextResponse.json(
          { error: 'Invalid action. Must be one of: markRead, markAllRead, dismiss, dismissMultiple' },
          { status: 400 }
        )
    }

    return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 })
  } catch (error) {
    console.error('POST /api/v1/changes/alerts error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
