import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { cookies } from 'next/headers'

export async function GET(_request: NextRequest) {
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

    // Get time series data for the last 24 hours
    const now = new Date()
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)

    // Fetch agent runs grouped by hour
    const agentRuns = await prisma.agentRun.findMany({
      where: {
        orgId: currentOrgId,
        startedAt: { gte: twentyFourHoursAgo },
      },
      select: {
        startedAt: true,
        insights: { select: { id: true } },
      },
    })

    // Aggregate by hour
    const hourlyData: Record<string, { runs: number; insights: number }> = {}

    // Initialize all hours
    for (let i = 0; i < 7; i++) {
      const time = new Date(now)
      time.setHours(time.getHours() - (6 - i) * 4)
      const key = `${time.getHours()}:00`
      hourlyData[key] = { runs: 0, insights: 0 }
    }

    // Fill in actual data
    agentRuns.forEach(run => {
      const hour = run.startedAt.getHours()
      const _key = `${hour}:00`
      // Find the closest 4-hour bucket
      for (const bucketKey of Object.keys(hourlyData)) {
        const bucketHour = parseInt(bucketKey)
        if (hour >= bucketHour && hour < bucketHour + 4) {
          hourlyData[bucketKey].runs++
          hourlyData[bucketKey].insights += run.insights.length
          break
        }
      }
    })

    const timeSeriesData = Object.entries(hourlyData).map(([time, data]) => ({
      time: time === `${now.getHours()}:00` ? 'Now' : time,
      runs: data.runs,
      insights: data.insights,
    }))

    // Get agent usage stats
    const agentUsage = await prisma.agentRun.groupBy({
      by: ['agentId'],
      where: { orgId: currentOrgId },
      _count: { id: true },
    })

    // Get agent names
    const agentIds = agentUsage.map(a => a.agentId)
    const agents = await prisma.agent.findMany({
      where: { id: { in: agentIds } },
      select: { id: true, name: true },
    })

    const agentNameMap = new Map(agents.map(a => [a.id, a.name]))

    const agentUsageData = agentUsage
      .map(a => ({
        name: agentNameMap.get(a.agentId) || 'Unknown',
        usage: a._count.id,
      }))
      .sort((a, b) => b.usage - a.usage)
      .slice(0, 5)

    // Calculate totals
    const totalRuns = agentRuns.length
    const totalInsights = agentRuns.reduce((acc, run) => acc + run.insights.length, 0)

    return NextResponse.json({
      timeSeriesData,
      agentUsage: agentUsageData,
      totals: {
        runs: totalRuns,
        insights: totalInsights,
      },
    })
  } catch (error) {
    console.error('GET /api/v1/analytics/performance error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
