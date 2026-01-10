import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { cookies } from 'next/headers'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Get current organization
    const cookieStore = await cookies()
    const memberships = await prisma.organizationMember.findMany({
      where: { userId: session.user.id },
      include: { organization: true },
      orderBy: { joinedAt: 'asc' },
    })

    if (memberships.length === 0) {
      return NextResponse.json({ error: 'No organization found' }, { status: 404 })
    }

    const currentOrgId = cookieStore.get('currentOrgId')?.value || memberships[0].organization.id

    // Fetch the insight
    const insight = await prisma.insight.findFirst({
      where: {
        id,
        orgId: currentOrgId,
      },
      include: {
        agentRun: {
          include: {
            agent: { select: { id: true, name: true, type: true } },
          },
        },
      },
    })

    if (!insight) {
      return NextResponse.json({ error: 'Insight not found' }, { status: 404 })
    }

    return NextResponse.json({ data: insight })
  } catch (error) {
    console.error('GET /api/v1/insights/[id] error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
