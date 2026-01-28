import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'

// GET /api/gwi/services/stats - Get GWI Portal dashboard stats
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's organization
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        memberships: {
          include: {
            organization: true,
          },
        },
      },
    })

    if (!user || user.memberships.length === 0) {
      return NextResponse.json({ error: 'No organization found' }, { status: 404 })
    }

    // ServiceClient and ServiceProject are global (not org-scoped)
    // Count clients
    const [totalClients, activeClients] = await Promise.all([
      prisma.serviceClient.count(),
      prisma.serviceClient.count({
        where: {
          status: 'ACTIVE',
        },
      }),
    ])

    // Count projects
    const [totalProjects, inProgressProjects] = await Promise.all([
      prisma.serviceProject.count(),
      prisma.serviceProject.count({
        where: {
          status: { in: ['IN_PROGRESS', 'APPROVED'] },
        },
      }),
    ])

    // Count invoices (if Invoice model exists)
    // For now, return placeholder values
    const invoices = {
      draft: 0,
      sent: 0,
      overdue: 0,
      totalDue: 0,
    }

    // Count team members
    const teamMembers = await prisma.organizationMember.count({
      where: { organizationId: orgId },
    })

    // Count unique team members on active projects
    const activeProjectIds = await prisma.serviceProject.findMany({
      where: {
        status: { in: ['IN_PROGRESS', 'APPROVED'] },
      },
      select: { id: true },
    })

    const onProjects = activeProjectIds.length > 0 ? await prisma.projectTeamMember.count({
      where: {
        projectId: { in: activeProjectIds.map(p => p.id) },
        isActive: true,
      },
      distinct: ['employeeId'],
    }) : 0

    // Get recent activity (last 10 audit events)
    // Note: Audit logs are org-scoped, so we'll use the user's org
    const orgId = user.memberships[0]?.organizationId
    const recentActivity = orgId ? await prisma.auditLog.findMany({
      where: {
        orgId,
        resourceType: { in: ['service_client', 'service_project', 'invoice'] },
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    }) : []

    const formattedActivity = recentActivity.map((log) => {
      let title = ''
      let type = 'project'

      if (log.resourceType === 'service_client') {
        type = 'client'
        title = `Client ${log.action === 'create' ? 'added' : log.action === 'update' ? 'updated' : 'deleted'}`
      } else if (log.resourceType === 'service_project') {
        type = 'project'
        title = `Project ${log.action === 'create' ? 'created' : log.action === 'update' ? 'updated' : 'completed'}`
      } else if (log.resourceType === 'invoice') {
        type = 'invoice'
        title = `Invoice ${log.action === 'create' ? 'created' : log.action === 'update' ? 'updated' : 'sent'}`
      }

      return {
        id: log.id,
        type,
        title,
        time: log.createdAt.toISOString(),
      }
    })

    return NextResponse.json({
      clients: {
        total: totalClients,
        active: activeClients,
      },
      projects: {
        total: totalProjects,
        inProgress: inProgressProjects,
      },
      invoices,
      team: {
        total: teamMembers,
        onProjects: typeof onProjects === 'number' ? onProjects : 0,
      },
      recentActivity: formattedActivity,
    })
  } catch (error) {
    console.error('Error fetching GWI Portal stats:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
