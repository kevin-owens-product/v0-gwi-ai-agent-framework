import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { hasPermission } from '@/lib/permissions'
import { getValidatedOrgId } from '@/lib/tenant'

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

    const member = await prisma.organizationMember.findFirst({
      where: { userId: session.user.id, organizationId: orgId },
    })

    if (!member || !hasPermission(member.role, 'analytics:view')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    const [agentCount, workflowCount, reportCount, memberCount] = await Promise.all([
      prisma.agent.count({ where: { organizationId: orgId } }),
      prisma.workflow.count({ where: { organizationId: orgId } }),
      prisma.report.count({ where: { organizationId: orgId } }),
      prisma.organizationMember.count({ where: { organizationId: orgId } }),
    ])

    return NextResponse.json({
      overview: {
        period: { start: startOfMonth.toISOString(), end: now.toISOString() },
      },
      counts: {
        agents: agentCount,
        workflows: workflowCount,
        reports: reportCount,
        members: memberCount,
      },
    })
  } catch (error) {
    console.error('Error fetching analytics:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
