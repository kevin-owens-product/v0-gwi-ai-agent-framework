import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { getUserMembership, getValidatedOrgId } from '@/lib/tenant'
import { hasPermission } from '@/lib/permissions'
import { logAuditEvent, createAuditEventFromRequest } from '@/lib/audit'
import { executeTool } from '@/lib/tool-registry'
import { sendEmail } from '@/lib/email'
import type { ToolExecutionContext, GeneratedInsight } from '@/types/tools'
import { z } from 'zod'

const analyzeSchema = z.object({
  focusAreas: z.array(z.string()).optional(),
  checkThresholds: z.boolean().optional(),
  sendAlerts: z.boolean().optional(),
})

// Check alert thresholds and return breaches
interface ThresholdBreach {
  metric: string
  threshold: number
  currentValue: number
  direction: 'above' | 'below'
  severity: 'high' | 'medium' | 'low'
}

function checkThresholds(
  snapshot: {
    brandHealth?: number | null
    awareness?: number | null
    consideration?: number | null
    preference?: number | null
    loyalty?: number | null
    nps?: number | null
    sentimentScore?: number | null
  },
  thresholds: Record<string, { min?: number; max?: number; critical?: boolean }>
): ThresholdBreach[] {
  const breaches: ThresholdBreach[] = []

  const metrics: Array<{ key: string; value: number | null | undefined }> = [
    { key: 'brandHealth', value: snapshot.brandHealth },
    { key: 'awareness', value: snapshot.awareness },
    { key: 'consideration', value: snapshot.consideration },
    { key: 'preference', value: snapshot.preference },
    { key: 'loyalty', value: snapshot.loyalty },
    { key: 'nps', value: snapshot.nps },
    { key: 'sentimentScore', value: snapshot.sentimentScore },
  ]

  for (const { key, value } of metrics) {
    if (value === null || value === undefined) continue

    const threshold = thresholds[key]
    if (!threshold) continue

    if (threshold.min !== undefined && value < threshold.min) {
      breaches.push({
        metric: key,
        threshold: threshold.min,
        currentValue: value,
        direction: 'below',
        severity: threshold.critical ? 'high' : 'medium',
      })
    }

    if (threshold.max !== undefined && value > threshold.max) {
      breaches.push({
        metric: key,
        threshold: threshold.max,
        currentValue: value,
        direction: 'above',
        severity: threshold.critical ? 'high' : 'medium',
      })
    }
  }

  return breaches
}

// POST - Analyze brand tracking data and generate insights
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const orgId = await getValidatedOrgId(request, session.user.id)
    if (!orgId) {
      return NextResponse.json({ error: 'Organization not found or access denied' }, { status: 404 })
    }

    const membership = await getUserMembership(session.user.id, orgId)
    if (!membership || !hasPermission(membership.role, 'dashboards:write')) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 })
    }

    // Validate request body
    const body = await request.json().catch(() => ({}))
    const validationResult = analyzeSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation error', details: validationResult.error.errors },
        { status: 400 }
      )
    }

    const {
      focusAreas = ['trend_analysis', 'threshold_alerts', 'recommendations'],
      checkThresholds: shouldCheckThresholds = true,
      sendAlerts = true,
    } = validationResult.data

    // Get brand tracking with snapshots
    const brandTracking = await prisma.brandTracking.findFirst({
      where: { id, orgId },
      include: {
        snapshots: {
          orderBy: { snapshotDate: 'desc' },
          take: 12, // Last 12 snapshots for trend analysis
        },
      },
    })

    if (!brandTracking) {
      return NextResponse.json({ error: 'Brand tracking not found' }, { status: 404 })
    }

    // Build tool execution context
    const toolContext: ToolExecutionContext = {
      orgId,
      userId: session.user.id,
      runId: `brand-analyze-${id}-${Date.now()}`,
    }

    // Execute the analyze_insights tool
    const analysisResult = await executeTool('analyze_insights', {
      dataType: 'brand_tracking',
      dataId: id,
      focusAreas,
    }, toolContext)

    // Check thresholds if enabled
    let thresholdBreaches: ThresholdBreach[] = []
    if (shouldCheckThresholds && brandTracking.snapshots.length > 0) {
      const latestSnapshot = brandTracking.snapshots[0]
      const thresholdConfig = (brandTracking.alertThresholds || {}) as Record<string, { min?: number; max?: number; critical?: boolean }>
      thresholdBreaches = checkThresholds(latestSnapshot, thresholdConfig)
    }

    // Calculate trend data if we have multiple snapshots
    const trends: Record<string, { change: number; direction: 'up' | 'down' | 'stable' }> = {}
    if (brandTracking.snapshots.length >= 2) {
      const current = brandTracking.snapshots[0]
      const previous = brandTracking.snapshots[1]

      const calculateTrend = (curr: number | null, prev: number | null): { change: number; direction: 'up' | 'down' | 'stable' } | null => {
        if (curr === null || prev === null) return null
        const change = curr - prev
        const direction: 'up' | 'down' | 'stable' = change > 0.5 ? 'up' : change < -0.5 ? 'down' : 'stable'
        return {
          change: Math.round(change * 10) / 10,
          direction,
        }
      }

      const metrics = ['brandHealth', 'awareness', 'consideration', 'preference', 'loyalty', 'nps', 'sentimentScore']
      for (const metric of metrics) {
        const trend = calculateTrend(
          current[metric as keyof typeof current] as number | null,
          previous[metric as keyof typeof previous] as number | null
        )
        if (trend) {
          trends[metric] = trend
        }
      }
    }

    // Update snapshot with generated insights if analysis was successful
    if (analysisResult.success && brandTracking.snapshots.length > 0) {
      const insights = (analysisResult.data as { insights?: GeneratedInsight[] })?.insights || []

      await prisma.brandTrackingSnapshot.update({
        where: { id: brandTracking.snapshots[0].id },
        data: {
          insights: insights.map(i => i.title),
        },
      })
    }

    // Send alert notifications if there are high-priority breaches
    if (sendAlerts && thresholdBreaches.some(b => b.severity === 'high')) {
      try {
        const user = await prisma.user.findUnique({
          where: { id: session.user.id },
          select: { email: true, name: true },
        })

        if (user?.email) {
          const highBreaches = thresholdBreaches.filter(b => b.severity === 'high')

          const html = `
            <!DOCTYPE html>
            <html>
              <head>
                <meta charset="utf-8">
                <title>Brand Alert: ${brandTracking.brandName}</title>
              </head>
              <body style="font-family: -apple-system, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; background-color: #f9fafb;">
                <div style="background: white; border-radius: 12px; padding: 40px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                  <h1 style="font-size: 24px; color: #dc2626; margin: 0 0 16px 0;">Brand Health Alert</h1>
                  <p style="color: #374151; margin-bottom: 16px;">Hi ${user.name || 'there'},</p>
                  <p style="color: #374151; margin-bottom: 24px;">
                    Critical threshold breaches detected for <strong>${brandTracking.brandName}</strong>:
                  </p>
                  <ul style="color: #374151; margin-bottom: 24px;">
                    ${highBreaches.map(b => `
                      <li><strong>${b.metric}</strong>: ${b.currentValue} (${b.direction} threshold of ${b.threshold})</li>
                    `).join('')}
                  </ul>
                  <div style="text-align: center; margin: 32px 0;">
                    <a href="${process.env.NEXTAUTH_URL}/dashboard/brand-tracking/${id}" style="display: inline-block; padding: 14px 28px; background: #dc2626; color: #fff; text-decoration: none; border-radius: 8px; font-weight: 500;">
                      View Brand Dashboard
                    </a>
                  </div>
                </div>
              </body>
            </html>
          `

          await sendEmail({
            to: user.email,
            subject: `Brand Alert: ${brandTracking.brandName} - Critical Thresholds Breached`,
            html,
          })
        }
      } catch (emailError) {
        console.error('Failed to send brand alert email:', emailError)
      }
    }

    // Log audit event
    await logAuditEvent(createAuditEventFromRequest(request, {
      orgId,
      userId: session.user.id,
      action: 'analyze',
      resourceType: 'brand_tracking',
      resourceId: id,
      metadata: {
        focusAreas,
        thresholdBreaches: thresholdBreaches.length,
        insightsGenerated: analysisResult.success,
      },
    }))

    return NextResponse.json({
      success: true,
      data: {
        brandId: id,
        brandName: brandTracking.brandName,
        analysis: analysisResult.success ? analysisResult.data : null,
        trends,
        thresholdBreaches,
        snapshotCount: brandTracking.snapshots.length,
        latestSnapshot: brandTracking.snapshots[0] ? {
          date: brandTracking.snapshots[0].snapshotDate.toISOString(),
          brandHealth: brandTracking.snapshots[0].brandHealth,
          awareness: brandTracking.snapshots[0].awareness,
          nps: brandTracking.snapshots[0].nps,
        } : null,
        analyzedAt: new Date().toISOString(),
      },
      metadata: analysisResult.metadata,
    })
  } catch (error) {
    console.error('Brand tracking analysis error:', error)
    return NextResponse.json(
      { error: 'Failed to analyze brand tracking' },
      { status: 500 }
    )
  }
}
