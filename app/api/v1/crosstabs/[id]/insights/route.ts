import { NextRequest, NextResponse } from "next/server"
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { cookies } from 'next/headers'
import { getUserMembership } from '@/lib/tenant'
import { hasPermission } from '@/lib/permissions'
import { executeTool } from '@/lib/tool-registry'
import type { ToolExecutionContext } from '@/types/tools'

// Automated Insights Detection Engine for Cross-tabs
// Analyzes data patterns and generates actionable insights

interface Insight {
  id: string
  type: "highest" | "lowest" | "difference" | "outlier" | "trend" | "correlation"
  priority: "high" | "medium" | "low"
  title: string
  description: string
  metric?: string
  audience?: string
  value?: number
  comparison?: { base: string; target: string; difference: number }
  confidence: number
}

interface InsightsResponse {
  insights: Insight[]
  summary: string
  generatedAt: string
}

// Helper to detect significant differences
function detectDifferences(
  data: { metric: string; values: Record<string, number> }[],
  _audiences: string[]
): Insight[] {
  const insights: Insight[] = []

  for (const row of data) {
    const values = Object.entries(row.values)
    if (values.length < 2) continue

    // Find max and min
    const sorted = values.sort((a, b) => b[1] - a[1])
    const [maxAudience, maxValue] = sorted[0]
    const [minAudience, minValue] = sorted[sorted.length - 1]
    const difference = maxValue - minValue

    // Significant difference (> 30 percentage points)
    if (difference >= 30) {
      insights.push({
        id: `diff-${row.metric}-${Date.now()}`,
        type: "difference",
        priority: difference >= 50 ? "high" : "medium",
        title: `${row.metric}: ${difference} point gap`,
        description: `${maxAudience} leads at ${maxValue}% while ${minAudience} is at ${minValue}% - a ${difference} percentage point difference.`,
        metric: row.metric,
        comparison: {
          base: minAudience,
          target: maxAudience,
          difference,
        },
        confidence: 0.92,
      })
    }
  }

  return insights.sort((a, b) => (b.comparison?.difference || 0) - (a.comparison?.difference || 0))
}

// Detect highest performers for each metric
function detectHighest(
  data: { metric: string; values: Record<string, number> }[]
): Insight[] {
  const insights: Insight[] = []

  for (const row of data) {
    const values = Object.entries(row.values)
    const [topAudience, topValue] = values.sort((a, b) => b[1] - a[1])[0]

    if (topValue >= 75) {
      insights.push({
        id: `high-${row.metric}-${Date.now()}`,
        type: "highest",
        priority: topValue >= 85 ? "high" : "medium",
        title: `${topAudience} dominates ${row.metric}`,
        description: `${topAudience} shows exceptional ${row.metric} at ${topValue}%, significantly above average.`,
        metric: row.metric,
        audience: topAudience,
        value: topValue,
        confidence: 0.95,
      })
    }
  }

  return insights
}

// Detect outliers (values that stand out from the rest)
function detectOutliers(
  data: { metric: string; values: Record<string, number> }[]
): Insight[] {
  const insights: Insight[] = []

  for (const row of data) {
    const values = Object.values(row.values)
    const mean = values.reduce((a, b) => a + b, 0) / values.length
    const stdDev = Math.sqrt(
      values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length
    )

    // Find values > 2 standard deviations from mean
    for (const [audience, value] of Object.entries(row.values)) {
      const zScore = Math.abs(value - mean) / stdDev
      if (zScore > 2) {
        insights.push({
          id: `outlier-${row.metric}-${audience}-${Date.now()}`,
          type: "outlier",
          priority: zScore > 2.5 ? "high" : "medium",
          title: `Unusual ${row.metric} for ${audience}`,
          description: `${audience} shows an unexpected ${value > mean ? "high" : "low"} value of ${value}% for ${row.metric}, ${Math.round(zScore * 10) / 10} standard deviations from average.`,
          metric: row.metric,
          audience,
          value,
          confidence: 0.88,
        })
      }
    }
  }

  return insights
}

// Detect audience patterns (consistent high/low performers)
function detectAudiencePatterns(
  data: { metric: string; values: Record<string, number> }[],
  audiences: string[]
): Insight[] {
  const insights: Insight[] = []

  for (const audience of audiences) {
    const audienceValues = data.map(row => row.values[audience]).filter(v => v !== undefined)
    if (audienceValues.length === 0) continue

    const avgValue = audienceValues.reduce((a, b) => a + b, 0) / audienceValues.length
    const highCount = audienceValues.filter(v => v >= 70).length
    const lowCount = audienceValues.filter(v => v <= 30).length

    // Consistently high performer
    if (highCount >= audienceValues.length * 0.6) {
      insights.push({
        id: `pattern-high-${audience}-${Date.now()}`,
        type: "trend",
        priority: "high",
        title: `${audience} is a consistent high performer`,
        description: `${audience} scores above 70% on ${highCount} of ${audienceValues.length} metrics, with an average of ${Math.round(avgValue)}%.`,
        audience,
        value: Math.round(avgValue),
        confidence: 0.90,
      })
    }

    // Consistently low performer
    if (lowCount >= audienceValues.length * 0.6) {
      insights.push({
        id: `pattern-low-${audience}-${Date.now()}`,
        type: "trend",
        priority: "medium",
        title: `${audience} shows low engagement across metrics`,
        description: `${audience} scores below 30% on ${lowCount} of ${audienceValues.length} metrics, averaging ${Math.round(avgValue)}%.`,
        audience,
        value: Math.round(avgValue),
        confidence: 0.90,
      })
    }
  }

  return insights
}

// Generate natural language summary
function generateSummary(insights: Insight[], audienceCount: number, metricCount: number): string {
  const highPriority = insights.filter(i => i.priority === "high")
  const differences = insights.filter(i => i.type === "difference")
  const outliers = insights.filter(i => i.type === "outlier")

  const parts: string[] = []

  parts.push(`Analysis of ${audienceCount} audiences across ${metricCount} metrics reveals ${insights.length} key findings.`)

  if (highPriority.length > 0) {
    parts.push(`${highPriority.length} high-priority insights require attention.`)
  }

  if (differences.length > 0) {
    const maxDiff = Math.max(...differences.map(d => d.comparison?.difference || 0))
    parts.push(`Largest gap: ${maxDiff} percentage points.`)
  }

  if (outliers.length > 0) {
    parts.push(`${outliers.length} outlier values detected.`)
  }

  return parts.join(" ")
}

// Helper to get org ID from header or cookies
async function getOrgId(request: NextRequest, userId: string): Promise<string | null> {
  const headerOrgId = request.headers.get('x-organization-id')
  if (headerOrgId) return headerOrgId

  const cookieStore = await cookies()
  const memberships = await prisma.organizationMember.findMany({
    where: { userId },
    include: { organization: true },
    orderBy: { joinedAt: 'asc' },
  })

  if (memberships.length === 0) return null
  return cookieStore.get('currentOrgId')?.value || memberships[0].organization.id
}

// GET - Retrieve existing insights or generate statistical insights
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const orgId = await getOrgId(request, session.user.id)
    if (!orgId) {
      return NextResponse.json({ error: 'No organization found' }, { status: 404 })
    }

    // Get crosstab from database
    const crosstab = await prisma.crosstab.findFirst({
      where: { id, orgId },
    })

    if (!crosstab) {
      return NextResponse.json({ error: 'Crosstab not found' }, { status: 404 })
    }

    // Parse results or generate mock data
    let crosstabData: {
      audiences: string[]
      data: { metric: string; values: Record<string, number> }[]
    }

    if (crosstab.results) {
      const results = crosstab.results as { rows?: { metric: string; [key: string]: unknown }[] }
      const audiences = crosstab.audiences

      // Fetch audience names
      const audienceDetails = await prisma.audience.findMany({
        where: { id: { in: audiences } },
        select: { id: true, name: true },
      })
      const audienceNameMap = new Map(audienceDetails.map(a => [a.id, a.name]))
      const audienceNames = audiences.map(id => audienceNameMap.get(id) || id)

      // Transform results to expected format
      const data = (results.rows || []).map(row => {
        const values: Record<string, number> = {}
        for (const audienceId of audiences) {
          const audienceData = row[audienceId] as { value?: number } | undefined
          values[audienceNameMap.get(audienceId) || audienceId] = audienceData?.value || 0
        }
        return { metric: row.metric as string, values }
      })

      crosstabData = { audiences: audienceNames, data }
    } else {
      // Fallback mock data
      crosstabData = {
        audiences: ["Segment A", "Segment B", "Segment C", "Segment D"],
        data: [
          { metric: "Metric 1", values: { "Segment A": 75, "Segment B": 45, "Segment C": 62, "Segment D": 38 } },
          { metric: "Metric 2", values: { "Segment A": 42, "Segment B": 78, "Segment C": 55, "Segment D": 68 } },
          { metric: "Metric 3", values: { "Segment A": 88, "Segment B": 32, "Segment C": 71, "Segment D": 45 } },
          { metric: "Metric 4", values: { "Segment A": 55, "Segment B": 62, "Segment C": 48, "Segment D": 82 } },
        ],
      }
    }

    // Generate insights using statistical analysis
    const allInsights: Insight[] = []
    allInsights.push(...detectDifferences(crosstabData.data, crosstabData.audiences))
    allInsights.push(...detectHighest(crosstabData.data))
    allInsights.push(...detectOutliers(crosstabData.data))
    allInsights.push(...detectAudiencePatterns(crosstabData.data, crosstabData.audiences))

    // Sort by priority and limit
    const sortedInsights = allInsights
      .sort((a, b) => {
        const priorityOrder = { high: 0, medium: 1, low: 2 }
        return priorityOrder[a.priority] - priorityOrder[b.priority]
      })
      .slice(0, 10)

    // Generate summary
    const summary = generateSummary(
      sortedInsights,
      crosstabData.audiences.length,
      crosstabData.data.length
    )

    const response: InsightsResponse = {
      insights: sortedInsights,
      summary,
      generatedAt: new Date().toISOString(),
    }

    return NextResponse.json({
      success: true,
      data: response,
    })
  } catch (error) {
    console.error("Insights generation error:", error)
    return NextResponse.json(
      { error: "Failed to generate insights" },
      { status: 500 }
    )
  }
}

// POST - Generate AI-powered insights using the analyze_insights tool
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

    const orgId = await getOrgId(request, session.user.id)
    if (!orgId) {
      return NextResponse.json({ error: 'No organization found' }, { status: 404 })
    }

    const membership = await getUserMembership(session.user.id, orgId)
    if (!membership || !hasPermission(membership.role, 'crosstabs:write')) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 })
    }

    // Get optional focus areas from request body
    const body = await request.json().catch(() => ({}))
    const focusAreas = body.focusAreas || ['trends', 'anomalies', 'key_differentiators', 'recommendations']

    // Build tool execution context
    const toolContext: ToolExecutionContext = {
      orgId,
      userId: session.user.id,
      runId: `crosstab-insights-${id}-${Date.now()}`,
    }

    // Execute the analyze_insights tool
    const result = await executeTool('analyze_insights', {
      dataType: 'crosstab',
      dataId: id,
      focusAreas,
    }, toolContext)

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      data: result.data,
      metadata: result.metadata,
    })
  } catch (error) {
    console.error("AI insights generation error:", error)
    return NextResponse.json(
      { error: "Failed to generate AI insights" },
      { status: 500 }
    )
  }
}
