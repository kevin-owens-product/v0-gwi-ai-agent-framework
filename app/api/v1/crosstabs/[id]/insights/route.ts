import { NextResponse } from "next/server"

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
  audiences: string[]
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

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Mock crosstab data - in production this would come from the database
    const crosstabData: Record<string, {
      audiences: string[]
      data: { metric: string; values: Record<string, number> }[]
    }> = {
      "1": {
        audiences: ["Gen Z (18-24)", "Millennials (25-40)", "Gen X (41-56)", "Boomers (57-75)"],
        data: [
          { metric: "TikTok", values: { "Gen Z (18-24)": 87, "Millennials (25-40)": 52, "Gen X (41-56)": 24, "Boomers (57-75)": 8 } },
          { metric: "Instagram", values: { "Gen Z (18-24)": 82, "Millennials (25-40)": 71, "Gen X (41-56)": 48, "Boomers (57-75)": 28 } },
          { metric: "Facebook", values: { "Gen Z (18-24)": 42, "Millennials (25-40)": 68, "Gen X (41-56)": 78, "Boomers (57-75)": 72 } },
          { metric: "YouTube", values: { "Gen Z (18-24)": 91, "Millennials (25-40)": 85, "Gen X (41-56)": 76, "Boomers (57-75)": 62 } },
          { metric: "LinkedIn", values: { "Gen Z (18-24)": 28, "Millennials (25-40)": 52, "Gen X (41-56)": 48, "Boomers (57-75)": 35 } },
          { metric: "Twitter/X", values: { "Gen Z (18-24)": 38, "Millennials (25-40)": 42, "Gen X (41-56)": 35, "Boomers (57-75)": 22 } },
          { metric: "Snapchat", values: { "Gen Z (18-24)": 72, "Millennials (25-40)": 35, "Gen X (41-56)": 12, "Boomers (57-75)": 4 } },
          { metric: "Pinterest", values: { "Gen Z (18-24)": 45, "Millennials (25-40)": 48, "Gen X (41-56)": 42, "Boomers (57-75)": 38 } },
        ],
      },
      "2": {
        audiences: ["Under $50K", "$50K-$100K", "$100K-$150K", "$150K-$250K", "$250K+"],
        data: [
          { metric: "E-commerce", values: { "Under $50K": 72, "$50K-$100K": 78, "$100K-$150K": 82, "$150K-$250K": 85, "$250K+": 79 } },
          { metric: "In-Store Retail", values: { "Under $50K": 68, "$50K-$100K": 62, "$100K-$150K": 58, "$150K-$250K": 55, "$250K+": 62 } },
          { metric: "Mobile Apps", values: { "Under $50K": 58, "$50K-$100K": 65, "$100K-$150K": 72, "$150K-$250K": 75, "$250K+": 71 } },
          { metric: "Social Commerce", values: { "Under $50K": 42, "$50K-$100K": 45, "$100K-$150K": 38, "$150K-$250K": 32, "$250K+": 28 } },
          { metric: "Subscription Services", values: { "Under $50K": 35, "$50K-$100K": 52, "$100K-$150K": 68, "$150K-$250K": 78, "$250K+": 82 } },
          { metric: "Direct-to-Consumer", values: { "Under $50K": 28, "$50K-$100K": 42, "$100K-$150K": 55, "$150K-$250K": 65, "$250K+": 72 } },
          { metric: "Luxury Retail", values: { "Under $50K": 8, "$50K-$100K": 18, "$100K-$150K": 35, "$150K-$250K": 58, "$250K+": 78 } },
          { metric: "Resale/Second-hand", values: { "Under $50K": 48, "$50K-$100K": 42, "$100K-$150K": 35, "$150K-$250K": 28, "$250K+": 22 } },
        ],
      },
    }

    // Get crosstab data (fallback to generic data if not found)
    const crosstab = crosstabData[id] || {
      audiences: ["Segment A", "Segment B", "Segment C", "Segment D"],
      data: [
        { metric: "Metric 1", values: { "Segment A": 75, "Segment B": 45, "Segment C": 62, "Segment D": 38 } },
        { metric: "Metric 2", values: { "Segment A": 42, "Segment B": 78, "Segment C": 55, "Segment D": 68 } },
        { metric: "Metric 3", values: { "Segment A": 88, "Segment B": 32, "Segment C": 71, "Segment D": 45 } },
        { metric: "Metric 4", values: { "Segment A": 55, "Segment B": 62, "Segment C": 48, "Segment D": 82 } },
      ],
    }

    // Generate insights
    const allInsights: Insight[] = []

    allInsights.push(...detectDifferences(crosstab.data, crosstab.audiences))
    allInsights.push(...detectHighest(crosstab.data))
    allInsights.push(...detectOutliers(crosstab.data))
    allInsights.push(...detectAudiencePatterns(crosstab.data, crosstab.audiences))

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
      crosstab.audiences.length,
      crosstab.data.length
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
