import { NextRequest, NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { getUserMembership, getValidatedOrgId } from '@/lib/tenant'
import { hasPermission } from '@/lib/permissions'
import { logAuditEvent, createAuditEventFromRequest } from '@/lib/audit'
import { recordUsage } from '@/lib/billing'

// Generate mock brand tracking metrics
function generateBrandMetrics(_brandName: string, competitors: any[]) {
  const baseAwareness = 45 + Math.random() * 40
  const baseConsideration = baseAwareness * (0.4 + Math.random() * 0.3)
  const basePreference = baseConsideration * (0.5 + Math.random() * 0.3)
  const baseLoyalty = basePreference * (0.6 + Math.random() * 0.3)

  const competitorData: any = {}
  if (Array.isArray(competitors)) {
    competitors.forEach((comp: string) => {
      competitorData[comp] = {
        awareness: 30 + Math.random() * 50,
        consideration: 20 + Math.random() * 40,
        preference: 15 + Math.random() * 35,
        marketShare: 10 + Math.random() * 30,
        sentiment: -0.2 + Math.random() * 1.2,
      }
    })
  }

  return {
    brandHealth: 60 + Math.random() * 30,
    marketShare: 15 + Math.random() * 25,
    sentimentScore: -0.1 + Math.random() * 1.1,
    awareness: baseAwareness,
    consideration: baseConsideration,
    preference: basePreference,
    loyalty: baseLoyalty,
    nps: -20 + Math.random() * 90,
    competitorData,
    audienceBreakdown: {
      '18-24': { awareness: baseAwareness * 1.2, preference: basePreference * 1.1 },
      '25-34': { awareness: baseAwareness * 1.15, preference: basePreference * 1.05 },
      '35-44': { awareness: baseAwareness, preference: basePreference },
      '45-54': { awareness: baseAwareness * 0.9, preference: basePreference * 0.95 },
      '55+': { awareness: baseAwareness * 0.8, preference: basePreference * 0.85 },
    },
    insights: [
      'Brand awareness has increased by 5% compared to last month',
      'Younger demographics (18-34) show higher engagement rates',
      'Sentiment trending positive across all channels',
      'Consider increasing focus on loyalty programs',
    ],
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    if (!hasPermission(membership.role, 'brand-tracking:write')) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 })
    }

    const { id } = await params

    const brandTracking = await prisma.brandTracking.findUnique({
      where: { id },
    })

    if (!brandTracking) {
      return NextResponse.json({ error: 'Brand tracking not found' }, { status: 404 })
    }

    if (brandTracking.orgId !== orgId) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 })
    }

    // Generate metrics for the snapshot
    const metrics = generateBrandMetrics(brandTracking.brandName, brandTracking.competitors as any[])

    // Create snapshot
    const snapshot = await prisma.brandTrackingSnapshot.create({
      data: {
        brandTrackingId: id,
        orgId,
        snapshotDate: new Date(),
        metrics: metrics as Prisma.InputJsonValue,
        brandHealth: metrics.brandHealth,
        marketShare: metrics.marketShare,
        sentimentScore: metrics.sentimentScore,
        awareness: metrics.awareness,
        consideration: metrics.consideration,
        preference: metrics.preference,
        loyalty: metrics.loyalty,
        nps: metrics.nps,
        competitorData: metrics.competitorData as Prisma.InputJsonValue,
        audienceBreakdown: metrics.audienceBreakdown as Prisma.InputJsonValue,
        insights: metrics.insights,
      },
    })

    // Update brand tracking
    await prisma.brandTracking.update({
      where: { id },
      data: {
        lastSnapshot: new Date(),
        snapshotCount: { increment: 1 },
      },
    })

    await logAuditEvent(createAuditEventFromRequest(request, {
      orgId,
      userId: session.user.id,
      action: 'create',
      resourceType: 'brand_tracking_snapshot',
      resourceId: snapshot.id,
      metadata: { brandTrackingId: id, brandName: brandTracking.brandName },
    }))

    recordUsage(orgId, 'API_CALLS', 1).catch(console.error)

    return NextResponse.json(snapshot, { status: 201 })
  } catch (error) {
    console.error('Error creating brand tracking snapshot:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
