/**
 * Analysis Evolution Service
 *
 * Tracks how AI-generated analyses and insights evolve over time.
 * Features:
 * - Analysis version history
 * - Trend detection and tracking
 * - Insight comparison across versions
 * - AI-powered change explanations
 */

import { prisma } from '@/lib/db'
import { Prisma } from '@prisma/client'

// Supported analysis types
export type AnalysisType =
  | 'crosstab'
  | 'audience_insight'
  | 'brand_health'
  | 'market_analysis'
  | 'competitor_analysis'
  | 'trend_analysis'

// Analysis history entry
export interface AnalysisHistoryEntry {
  id: string
  orgId: string
  analysisType: AnalysisType
  referenceId: string
  analysisVersion: number
  results: Record<string, unknown>
  aiInsights: string[]
  keyMetrics: Record<string, number>
  confidence: number | null
  dataSourceDate: Date | null
  metadata: Record<string, unknown>
  createdAt: Date
}

// Trend data point
export interface TrendDataPoint {
  version: number
  date: Date
  value: number
  confidence?: number
}

// Trend analysis result
export interface TrendAnalysis {
  metric: string
  dataPoints: TrendDataPoint[]
  direction: 'increasing' | 'decreasing' | 'stable' | 'volatile'
  changePercent: number
  trendStrength: number // 0-1 indicating how clear the trend is
}

// Trend shift detection
export interface TrendShift {
  metric: string
  shiftType: 'reversal' | 'acceleration' | 'deceleration' | 'breakout'
  previousDirection: 'increasing' | 'decreasing' | 'stable'
  newDirection: 'increasing' | 'decreasing' | 'stable'
  magnitude: number
  detectedAt: Date
  significance: 'low' | 'medium' | 'high'
}

// Insight evolution
export interface InsightEvolution {
  previousInsights: string[]
  currentInsights: string[]
  addedInsights: string[]
  removedInsights: string[]
  consistentInsights: string[]
  evolutionSummary: string
}

// Evolution comparison
export interface EvolutionComparison {
  analysisType: AnalysisType
  referenceId: string
  versions: {
    from: number
    to: number
  }
  metricChanges: Array<{
    metric: string
    fromValue: number
    toValue: number
    changePercent: number
    isSignificant: boolean
  }>
  insightEvolution: InsightEvolution
  trends: TrendAnalysis[]
  shifts: TrendShift[]
}

/**
 * Analysis Evolution Service
 */
class AnalysisEvolutionService {
  /**
   * Track an analysis result
   */
  async trackAnalysis(
    orgId: string,
    analysisType: AnalysisType,
    referenceId: string,
    results: Record<string, unknown>,
    aiInsights: string[],
    keyMetrics: Record<string, number>,
    options: {
      confidence?: number
      dataSourceDate?: Date
      metadata?: Record<string, unknown>
    } = {}
  ): Promise<AnalysisHistoryEntry> {
    // Get the current latest version
    const latestVersion = await prisma.analysisHistory.findFirst({
      where: { analysisType, referenceId },
      orderBy: { analysisVersion: 'desc' },
    })

    const newVersion = (latestVersion?.analysisVersion || 0) + 1

    const entry = await prisma.analysisHistory.create({
      data: {
        orgId,
        analysisType,
        referenceId,
        analysisVersion: newVersion,
        results: results as Prisma.InputJsonValue,
        aiInsights,
        keyMetrics: keyMetrics as Prisma.InputJsonValue,
        confidence: options.confidence,
        dataSourceDate: options.dataSourceDate,
        metadata: (options.metadata || {}) as Prisma.InputJsonValue,
      },
    })

    return this.mapToHistoryEntry(entry)
  }

  /**
   * Get analysis history
   */
  async getAnalysisHistory(
    analysisType: AnalysisType,
    referenceId: string,
    options: { limit?: number; offset?: number } = {}
  ): Promise<{ history: AnalysisHistoryEntry[]; total: number }> {
    const { limit = 50, offset = 0 } = options

    const [history, total] = await Promise.all([
      prisma.analysisHistory.findMany({
        where: { analysisType, referenceId },
        orderBy: { analysisVersion: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.analysisHistory.count({ where: { analysisType, referenceId } }),
    ])

    return {
      history: history.map(h => this.mapToHistoryEntry(h)),
      total,
    }
  }

  /**
   * Compare current analysis with previous version
   */
  async compareWithPrevious(
    analysisType: AnalysisType,
    referenceId: string
  ): Promise<EvolutionComparison | null> {
    const [current, previous] = await Promise.all([
      prisma.analysisHistory.findFirst({
        where: { analysisType, referenceId },
        orderBy: { analysisVersion: 'desc' },
      }),
      prisma.analysisHistory.findFirst({
        where: { analysisType, referenceId },
        orderBy: { analysisVersion: 'desc' },
        skip: 1,
      }),
    ])

    if (!current || !previous) return null

    return this.compareVersions(
      analysisType,
      referenceId,
      previous.analysisVersion,
      current.analysisVersion
    )
  }

  /**
   * Compare two specific analysis versions
   */
  async compareVersions(
    analysisType: AnalysisType,
    referenceId: string,
    fromVersion: number,
    toVersion: number
  ): Promise<EvolutionComparison | null> {
    const [from, to] = await Promise.all([
      prisma.analysisHistory.findFirst({
        where: { analysisType, referenceId, analysisVersion: fromVersion },
      }),
      prisma.analysisHistory.findFirst({
        where: { analysisType, referenceId, analysisVersion: toVersion },
      }),
    ])

    if (!from || !to) return null

    const fromMetrics = from.keyMetrics as Record<string, number>
    const toMetrics = to.keyMetrics as Record<string, number>
    const fromInsights = from.aiInsights
    const toInsights = to.aiInsights

    // Calculate metric changes
    const metricChanges = this.calculateMetricChanges(fromMetrics, toMetrics)

    // Calculate insight evolution
    const insightEvolution = this.calculateInsightEvolution(fromInsights, toInsights)

    // Get trend data for metrics
    const trends = await this.getMetricTrends(analysisType, referenceId, Object.keys(toMetrics))

    // Detect trend shifts
    const shifts = this.detectTrendShifts(trends)

    return {
      analysisType,
      referenceId,
      versions: { from: fromVersion, to: toVersion },
      metricChanges,
      insightEvolution,
      trends,
      shifts,
    }
  }

  /**
   * Get trend data for specified metrics
   */
  async getMetricTrends(
    analysisType: AnalysisType,
    referenceId: string,
    metrics: string[],
    periods: number = 12
  ): Promise<TrendAnalysis[]> {
    const history = await prisma.analysisHistory.findMany({
      where: { analysisType, referenceId },
      orderBy: { analysisVersion: 'asc' },
      take: periods,
    })

    if (history.length < 2) return []

    const trends: TrendAnalysis[] = []

    for (const metric of metrics) {
      const dataPoints: TrendDataPoint[] = history
        .map(h => {
          const keyMetrics = h.keyMetrics as Record<string, number>
          return {
            version: h.analysisVersion,
            date: h.createdAt,
            value: keyMetrics[metric],
            confidence: h.confidence ?? undefined,
          }
        })
        .filter(dp => dp.value !== undefined)

      if (dataPoints.length < 2) continue

      const trend = this.analyzeTrend(metric, dataPoints)
      trends.push(trend)
    }

    return trends
  }

  /**
   * Analyze trend for a single metric
   */
  private analyzeTrend(metric: string, dataPoints: TrendDataPoint[]): TrendAnalysis {
    const values = dataPoints.map(dp => dp.value)
    const firstValue = values[0]
    const lastValue = values[values.length - 1]

    // Calculate overall change
    const changePercent = firstValue !== 0
      ? ((lastValue - firstValue) / Math.abs(firstValue))
      : (lastValue !== 0 ? 1 : 0)

    // Determine direction using linear regression slope
    const slope = this.calculateSlope(values)
    const volatility = this.calculateVolatility(values)

    let direction: TrendAnalysis['direction']
    if (volatility > 0.3) {
      direction = 'volatile'
    } else if (Math.abs(slope) < 0.02) {
      direction = 'stable'
    } else {
      direction = slope > 0 ? 'increasing' : 'decreasing'
    }

    // Calculate trend strength (R-squared like measure)
    const trendStrength = 1 - volatility

    return {
      metric,
      dataPoints,
      direction,
      changePercent,
      trendStrength,
    }
  }

  /**
   * Calculate linear regression slope
   */
  private calculateSlope(values: number[]): number {
    const n = values.length
    const xMean = (n - 1) / 2
    const yMean = values.reduce((a, b) => a + b, 0) / n

    let numerator = 0
    let denominator = 0

    for (let i = 0; i < n; i++) {
      numerator += (i - xMean) * (values[i] - yMean)
      denominator += (i - xMean) ** 2
    }

    return denominator !== 0 ? numerator / denominator : 0
  }

  /**
   * Calculate volatility (coefficient of variation)
   */
  private calculateVolatility(values: number[]): number {
    const mean = values.reduce((a, b) => a + b, 0) / values.length
    if (mean === 0) return 0

    const variance = values.reduce((sum, val) => sum + (val - mean) ** 2, 0) / values.length
    const stdDev = Math.sqrt(variance)

    return stdDev / Math.abs(mean)
  }

  /**
   * Detect trend shifts
   */
  private detectTrendShifts(trends: TrendAnalysis[]): TrendShift[] {
    const shifts: TrendShift[] = []

    for (const trend of trends) {
      if (trend.dataPoints.length < 4) continue

      // Split data into two halves and compare directions
      const midpoint = Math.floor(trend.dataPoints.length / 2)
      const firstHalf = trend.dataPoints.slice(0, midpoint).map(dp => dp.value)
      const secondHalf = trend.dataPoints.slice(midpoint).map(dp => dp.value)

      const firstSlope = this.calculateSlope(firstHalf)
      const secondSlope = this.calculateSlope(secondHalf)

      const firstDirection = this.slopeToDirection(firstSlope)
      const secondDirection = this.slopeToDirection(secondSlope)

      if (firstDirection !== secondDirection) {
        const magnitude = Math.abs(secondSlope - firstSlope)
        const significance = magnitude > 0.2 ? 'high' : magnitude > 0.1 ? 'medium' : 'low'

        let shiftType: TrendShift['shiftType']
        if (firstDirection === 'increasing' && secondDirection === 'decreasing' ||
            firstDirection === 'decreasing' && secondDirection === 'increasing') {
          shiftType = 'reversal'
        } else if (Math.abs(secondSlope) > Math.abs(firstSlope)) {
          shiftType = 'acceleration'
        } else {
          shiftType = 'deceleration'
        }

        shifts.push({
          metric: trend.metric,
          shiftType,
          previousDirection: firstDirection,
          newDirection: secondDirection,
          magnitude,
          detectedAt: trend.dataPoints[midpoint].date,
          significance,
        })
      }
    }

    return shifts
  }

  private slopeToDirection(slope: number): 'increasing' | 'decreasing' | 'stable' {
    if (Math.abs(slope) < 0.02) return 'stable'
    return slope > 0 ? 'increasing' : 'decreasing'
  }

  /**
   * Calculate metric changes between two versions
   */
  private calculateMetricChanges(
    fromMetrics: Record<string, number>,
    toMetrics: Record<string, number>
  ): EvolutionComparison['metricChanges'] {
    const allKeys = new Set([...Object.keys(fromMetrics), ...Object.keys(toMetrics)])
    const changes: EvolutionComparison['metricChanges'] = []

    for (const metric of allKeys) {
      const fromValue = fromMetrics[metric] ?? 0
      const toValue = toMetrics[metric] ?? 0
      const changePercent = fromValue !== 0
        ? ((toValue - fromValue) / Math.abs(fromValue))
        : (toValue !== 0 ? 1 : 0)

      changes.push({
        metric,
        fromValue,
        toValue,
        changePercent,
        isSignificant: Math.abs(changePercent) >= 0.1, // 10% threshold
      })
    }

    return changes.sort((a, b) => Math.abs(b.changePercent) - Math.abs(a.changePercent))
  }

  /**
   * Calculate insight evolution between versions
   */
  private calculateInsightEvolution(
    previousInsights: string[],
    currentInsights: string[]
  ): InsightEvolution {
    const previousSet = new Set(previousInsights)
    const currentSet = new Set(currentInsights)

    const addedInsights = currentInsights.filter(i => !previousSet.has(i))
    const removedInsights = previousInsights.filter(i => !currentSet.has(i))
    const consistentInsights = currentInsights.filter(i => previousSet.has(i))

    // Generate evolution summary
    let evolutionSummary: string
    if (addedInsights.length === 0 && removedInsights.length === 0) {
      evolutionSummary = 'Insights remain consistent with previous analysis.'
    } else if (addedInsights.length > removedInsights.length) {
      evolutionSummary = `${addedInsights.length} new insights identified. Analysis reveals additional patterns.`
    } else if (removedInsights.length > addedInsights.length) {
      evolutionSummary = `${removedInsights.length} previous insights no longer apply. Data patterns have shifted.`
    } else {
      evolutionSummary = `Analysis evolved with ${addedInsights.length} new and ${removedInsights.length} outdated insights.`
    }

    return {
      previousInsights,
      currentInsights,
      addedInsights,
      removedInsights,
      consistentInsights,
      evolutionSummary,
    }
  }

  /**
   * Generate AI-powered explanation of changes (placeholder for LLM integration)
   */
  async generateEvolutionExplanation(
    comparison: EvolutionComparison
  ): Promise<{
    explanation: string
    factors: string[]
    recommendations: string[]
  }> {
    // In a real implementation, this would call the LLM service
    // For now, return a structured explanation based on the data

    const significantMetrics = comparison.metricChanges.filter(m => m.isSignificant)
    const factors: string[] = []
    const recommendations: string[] = []

    // Analyze metric changes
    for (const metric of significantMetrics.slice(0, 3)) {
      const direction = metric.changePercent > 0 ? 'increased' : 'decreased'
      factors.push(`${metric.metric} ${direction} by ${Math.abs(metric.changePercent * 100).toFixed(1)}%`)
    }

    // Analyze trend shifts
    for (const shift of comparison.shifts) {
      if (shift.significance !== 'low') {
        factors.push(`${shift.metric} shows ${shift.shiftType} from ${shift.previousDirection} to ${shift.newDirection}`)
      }
    }

    // Generate recommendations based on patterns
    if (comparison.shifts.some(s => s.shiftType === 'reversal')) {
      recommendations.push('Review recent changes that may have caused trend reversals')
    }

    if (comparison.insightEvolution.addedInsights.length > 0) {
      recommendations.push('Investigate newly identified patterns for actionable opportunities')
    }

    if (significantMetrics.some(m => m.changePercent < -0.1)) {
      recommendations.push('Analyze factors contributing to declining metrics')
    }

    const explanation = `Analysis has evolved across ${comparison.metricChanges.length} metrics. ` +
      `${significantMetrics.length} show significant changes. ` +
      comparison.insightEvolution.evolutionSummary

    return { explanation, factors, recommendations }
  }

  /**
   * Get the latest analysis for a reference
   */
  async getLatestAnalysis(
    analysisType: AnalysisType,
    referenceId: string
  ): Promise<AnalysisHistoryEntry | null> {
    const entry = await prisma.analysisHistory.findFirst({
      where: { analysisType, referenceId },
      orderBy: { analysisVersion: 'desc' },
    })

    return entry ? this.mapToHistoryEntry(entry) : null
  }

  /**
   * Get analysis confidence over time
   */
  async getConfidenceHistory(
    analysisType: AnalysisType,
    referenceId: string,
    periods: number = 12
  ): Promise<Array<{ version: number; date: Date; confidence: number | null }>> {
    const history = await prisma.analysisHistory.findMany({
      where: { analysisType, referenceId },
      orderBy: { analysisVersion: 'asc' },
      take: periods,
      select: {
        analysisVersion: true,
        createdAt: true,
        confidence: true,
      },
    })

    return history.map(h => ({
      version: h.analysisVersion,
      date: h.createdAt,
      confidence: h.confidence,
    }))
  }

  /**
   * Map database entry to AnalysisHistoryEntry
   */
  private mapToHistoryEntry(entry: {
    id: string
    orgId: string
    analysisType: string
    referenceId: string
    analysisVersion: number
    results: Prisma.JsonValue
    aiInsights: string[]
    keyMetrics: Prisma.JsonValue
    confidence: number | null
    dataSourceDate: Date | null
    metadata: Prisma.JsonValue
    createdAt: Date
  }): AnalysisHistoryEntry {
    return {
      id: entry.id,
      orgId: entry.orgId,
      analysisType: entry.analysisType as AnalysisType,
      referenceId: entry.referenceId,
      analysisVersion: entry.analysisVersion,
      results: entry.results as Record<string, unknown>,
      aiInsights: entry.aiInsights,
      keyMetrics: entry.keyMetrics as Record<string, number>,
      confidence: entry.confidence,
      dataSourceDate: entry.dataSourceDate,
      metadata: entry.metadata as Record<string, unknown>,
      createdAt: entry.createdAt,
    }
  }
}

// Export singleton instance
export const analysisEvolution = new AnalysisEvolutionService()

// Convenience functions
export async function trackAnalysis(
  orgId: string,
  analysisType: AnalysisType,
  referenceId: string,
  results: Record<string, unknown>,
  aiInsights: string[],
  keyMetrics: Record<string, number>,
  options?: {
    confidence?: number
    dataSourceDate?: Date
    metadata?: Record<string, unknown>
  }
): Promise<AnalysisHistoryEntry> {
  return analysisEvolution.trackAnalysis(
    orgId,
    analysisType,
    referenceId,
    results,
    aiInsights,
    keyMetrics,
    options
  )
}

export async function getAnalysisHistory(
  analysisType: AnalysisType,
  referenceId: string,
  options?: { limit?: number; offset?: number }
): Promise<{ history: AnalysisHistoryEntry[]; total: number }> {
  return analysisEvolution.getAnalysisHistory(analysisType, referenceId, options)
}

export async function compareAnalysisWithPrevious(
  analysisType: AnalysisType,
  referenceId: string
): Promise<EvolutionComparison | null> {
  return analysisEvolution.compareWithPrevious(analysisType, referenceId)
}

export async function getMetricTrends(
  analysisType: AnalysisType,
  referenceId: string,
  metrics: string[],
  periods?: number
): Promise<TrendAnalysis[]> {
  return analysisEvolution.getMetricTrends(analysisType, referenceId, metrics, periods)
}

export async function generateEvolutionExplanation(
  comparison: EvolutionComparison
): Promise<{
  explanation: string
  factors: string[]
  recommendations: string[]
}> {
  return analysisEvolution.generateEvolutionExplanation(comparison)
}
