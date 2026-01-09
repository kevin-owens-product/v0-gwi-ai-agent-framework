import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

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

    // Parse query params
    const { searchParams } = new URL(request.url)
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100)
    const offset = parseInt(searchParams.get('offset') || '0')
    const type = searchParams.get('type')
    const agentId = searchParams.get('agentId')

    // Build where clause
    const where: any = { orgId: currentOrgId }
    if (type) {
      where.type = type
    }
    if (agentId) {
      where.agentRun = { agentId }
    }

    // Fetch insights
    const [insights, total] = await Promise.all([
      prisma.insight.findMany({
        where,
        include: {
          agentRun: {
            include: {
              agent: { select: { id: true, name: true, type: true } },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit,
      }),
      prisma.insight.count({ where }),
    ])

    return NextResponse.json({
      insights,
      total,
      limit,
      offset,
    })
  } catch (error) {
    console.error('GET /api/v1/insights error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
