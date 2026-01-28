import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { getValidatedOrgId, getUserMembership } from '@/lib/tenant'
import { hasPermission } from '@/lib/permissions'

// GET /api/v1/notifications - Get user notifications
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const orgId = await getValidatedOrgId(request, session.user.id)
    if (!orgId) {
      return NextResponse.json({ error: 'No organization found or access denied' }, { status: 404 })
    }

    const membership = await getUserMembership(session.user.id, orgId)
    if (!membership) {
      return NextResponse.json({ error: 'Not a member of this organization' }, { status: 403 })
    }

    // Get organization to access planTier
    const organization = await prisma.organization.findUnique({
      where: { id: orgId },
      select: { planTier: true },
    })

    const searchParams = request.nextUrl.searchParams
    const unreadOnly = searchParams.get('unread') === 'true'
    const limit = parseInt(searchParams.get('limit') || '50')

    const notifications: any[] = []

    // Get system notifications for this org/user
    const systemNotifications = await prisma.systemNotification.findMany({
      where: {
        isActive: true,
        OR: [
          { targetType: 'ALL' },
          { targetType: 'SPECIFIC_ORGS', targetOrgs: { has: orgId } },
          {
            targetType: 'SPECIFIC_PLANS',
            targetPlans: { has: organization?.planTier || 'STARTER' },
          },
        ],
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    })

    for (const sysNotif of systemNotifications) {
      notifications.push({
        id: `system-${sysNotif.id}`,
        type: 'system',
        title: sysNotif.title,
        description: sysNotif.message,
        time: sysNotif.createdAt.toISOString(),
        read: false, // System notifications are always unread
        metadata: sysNotif.metadata,
      })
    }

    // Get change alerts for this user/org
    const changeAlerts = await prisma.changeAlert.findMany({
      where: {
        orgId,
        ...(unreadOnly && { isRead: false }),
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
    })

    for (const alert of changeAlerts) {
      notifications.push({
        id: `alert-${alert.id}`,
        type: alert.entityType === 'report' ? 'report' : 'system',
        title: alert.title,
        description: alert.message,
        time: alert.createdAt.toISOString(),
        read: alert.isRead,
        actionUrl: alert.entityId ? `/dashboard/${alert.entityType}s/${alert.entityId}` : undefined,
        metadata: alert.metadata,
      })
    }

    // Get workflow run completions
    const workflowRuns = await prisma.workflowRun.findMany({
      where: {
        orgId,
        status: { in: ['COMPLETED', 'FAILED'] },
        completedAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
        },
      },
      include: {
        workflow: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { completedAt: 'desc' },
      take: 10,
    })

    for (const run of workflowRuns) {
      notifications.push({
        id: `workflow-${run.id}`,
        type: 'workflow',
        title: run.status === 'COMPLETED' ? 'Workflow Completed' : 'Workflow Failed',
        description: `Workflow "${run.workflow.name}" has ${run.status === 'COMPLETED' ? 'finished running' : 'encountered an error'}`,
        time: run.completedAt?.toISOString() || run.startedAt.toISOString(),
        read: false,
        actionUrl: `/dashboard/workflows/${run.workflow.id}`,
      })
    }

    // Get pending invitations for this user
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { email: true },
    })

    const invitations = user?.email ? await prisma.invitation.findMany({
      where: {
        orgId,
        email: user.email,
        status: 'PENDING',
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }) : []

    for (const inv of invitations) {
      notifications.push({
        id: `invitation-${inv.id}`,
        type: 'team',
        title: 'Team Invitation',
        description: `You have been invited to join as ${inv.role}`,
        time: inv.createdAt.toISOString(),
        read: false,
        actionUrl: `/dashboard/settings/team`,
      })
    }

    // Sort by time and limit
    const sortedNotifications = notifications
      .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
      .slice(0, limit)

    const unreadCount = sortedNotifications.filter((n) => !n.read).length

    return NextResponse.json({
      notifications: sortedNotifications,
      unreadCount,
      total: sortedNotifications.length,
    })
  } catch (error) {
    console.error('Error fetching notifications:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PATCH /api/v1/notifications - Mark notifications as read
export async function PATCH(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const orgId = await getValidatedOrgId(request, session.user.id)
    if (!orgId) {
      return NextResponse.json({ error: 'No organization found or access denied' }, { status: 404 })
    }

    const body = await request.json()
    const { notificationIds, markAllAsRead } = body

    if (markAllAsRead) {
      // Mark all change alerts as read
      await prisma.changeAlert.updateMany({
        where: {
          orgId,
          isRead: false,
        },
        data: {
          isRead: true,
        },
      })
    } else if (notificationIds && Array.isArray(notificationIds)) {
      // Mark specific notifications as read
      for (const notifId of notificationIds) {
        if (notifId.startsWith('alert-')) {
          const alertId = notifId.replace('alert-', '')
          await prisma.changeAlert.updateMany({
            where: {
              id: alertId,
              orgId,
            },
            data: {
              isRead: true,
            },
          })
        }
        // System notifications and workflow runs don't have read status
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating notifications:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
