import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getUserMembership, getValidatedOrgId } from '@/lib/tenant'
import { hasPermission } from '@/lib/permissions'

/**
 * POST /api/v1/charts/analyze
 * Perform statistical analysis on chart data
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const orgId = await getValidatedOrgId(request, session.user.id)
    if (!orgId) {
      return NextResponse.json({ error: 'No organization found' }, { status: 404 })
    }

    const membership = await getUserMembership(session.user.id, orgId)
    if (!membership) {
      return NextResponse.json({ error: 'Not a member of this organization' }, { status: 403 })
    }

    if (!hasPermission(membership.role, 'charts:read')) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 })
    }

    const body = await request.json()
    const { data, analysisType, options } = body

    if (!data || !Array.isArray(data)) {
      return NextResponse.json({ error: 'Data is required and must be an array' }, { status: 400 })
    }

    let result: unknown

    switch (analysisType) {
      case 'correlation':
        result = calculateCorrelation(data, options)
        break
      case 'trend':
        result = calculateTrend(data, options)
        break
      case 'significance':
        result = calculateSignificance(data, options)
        break
      case 'forecast':
        result = calculateForecast(data, options)
        break
      default:
        return NextResponse.json({ error: 'Invalid analysis type' }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      analysisType,
      result,
    })
  } catch (error) {
    console.error('Error analyzing data:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * Calculate correlation between two variables
 */
function calculateCorrelation(
  data: Array<Record<string, unknown>>,
  options: { xField: string; yField: string }
): { coefficient: number; pValue: number; significant: boolean } {
  const { xField, yField } = options
  const values = data
    .map((row) => ({
      x: Number(row[xField]) || 0,
      y: Number(row[yField]) || 0,
    }))
    .filter((v) => !isNaN(v.x) && !isNaN(v.y))

  if (values.length < 2) {
    return { coefficient: 0, pValue: 1, significant: false }
  }

  // Calculate Pearson correlation coefficient
  const n = values.length
  const sumX = values.reduce((sum, v) => sum + v.x, 0)
  const sumY = values.reduce((sum, v) => sum + v.y, 0)
  const sumXY = values.reduce((sum, v) => sum + v.x * v.y, 0)
  const sumX2 = values.reduce((sum, v) => sum + v.x * v.x, 0)
  const sumY2 = values.reduce((sum, v) => sum + v.y * v.y, 0)

  const numerator = n * sumXY - sumX * sumY
  const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY))

  const coefficient = denominator !== 0 ? numerator / denominator : 0

  // Simplified p-value calculation (in production, use proper statistical library)
  const tStat = coefficient * Math.sqrt((n - 2) / (1 - coefficient * coefficient))
  const pValue = 2 * (1 - tDistribution(Math.abs(tStat), n - 2))

  return {
    coefficient: Math.round(coefficient * 1000) / 1000,
    pValue: Math.round(pValue * 1000) / 1000,
    significant: pValue < 0.05,
  }
}

/**
 * Calculate trend (linear regression)
 */
function calculateTrend(
  data: Array<Record<string, unknown>>,
  options: { xField: string; yField: string }
): {
  slope: number
  intercept: number
  rSquared: number
  equation: string
} {
  const { xField, yField } = options
  const values = data
    .map((row, index) => ({
      x: Number(row[xField]) || index,
      y: Number(row[yField]) || 0,
    }))
    .filter((v) => !isNaN(v.x) && !isNaN(v.y))

  if (values.length < 2) {
    return { slope: 0, intercept: 0, rSquared: 0, equation: 'y = 0' }
  }

  const n = values.length
  const sumX = values.reduce((sum, v) => sum + v.x, 0)
  const sumY = values.reduce((sum, v) => sum + v.y, 0)
  const sumXY = values.reduce((sum, v) => sum + v.x * v.y, 0)
  const sumX2 = values.reduce((sum, v) => sum + v.x * v.x, 0)
  const sumY2 = values.reduce((sum, v) => sum + v.y * v.y, 0)

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX)
  const intercept = (sumY - slope * sumX) / n

  // Calculate R-squared
  const meanY = sumY / n
  const ssRes = values.reduce((sum, v) => {
    const predicted = slope * v.x + intercept
    return sum + Math.pow(v.y - predicted, 2)
  }, 0)
  const ssTot = values.reduce((sum, v) => sum + Math.pow(v.y - meanY, 2), 0)
  const rSquared = ssTot !== 0 ? 1 - ssRes / ssTot : 0

  return {
    slope: Math.round(slope * 1000) / 1000,
    intercept: Math.round(intercept * 1000) / 1000,
    rSquared: Math.round(rSquared * 1000) / 1000,
    equation: `y = ${Math.round(slope * 1000) / 1000}x + ${Math.round(intercept * 1000) / 1000}`,
  }
}

/**
 * Calculate statistical significance
 */
function calculateSignificance(
  data: Array<Record<string, unknown>>,
  options: { field: string; baseline?: number }
): { mean: number; stdDev: number; confidenceInterval: [number, number]; significant: boolean } {
  const { field, baseline = 0 } = options
  const values = data
    .map((row) => Number(row[field]) || 0)
    .filter((v) => !isNaN(v))

  if (values.length === 0) {
    return { mean: 0, stdDev: 0, confidenceInterval: [0, 0], significant: false }
  }

  const mean = values.reduce((sum, v) => sum + v, 0) / values.length
  const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length
  const stdDev = Math.sqrt(variance)

  // 95% confidence interval
  const zScore = 1.96
  const margin = (zScore * stdDev) / Math.sqrt(values.length)
  const confidenceInterval: [number, number] = [mean - margin, mean + margin]

  // Test if significantly different from baseline
  const tStat = (mean - baseline) / (stdDev / Math.sqrt(values.length))
  const pValue = 2 * (1 - tDistribution(Math.abs(tStat), values.length - 1))
  const significant = pValue < 0.05

  return {
    mean: Math.round(mean * 1000) / 1000,
    stdDev: Math.round(stdDev * 1000) / 1000,
    confidenceInterval: [
      Math.round(confidenceInterval[0] * 1000) / 1000,
      Math.round(confidenceInterval[1] * 1000) / 1000,
    ],
    significant,
  }
}

/**
 * Calculate forecast (simple linear projection)
 */
function calculateForecast(
  data: Array<Record<string, unknown>>,
  options: { field: string; periods: number }
): Array<{ period: number; value: number; confidenceInterval: [number, number] }> {
  const { field, periods = 5 } = options
  const trend = calculateTrend(data, { xField: 'index', yField: field })
  
  const lastIndex = data.length - 1
  const lastValue = Number(data[lastIndex]?.[field]) || 0
  
  const forecast: Array<{ period: number; value: number; confidenceInterval: [number, number] }> = []
  
  for (let i = 1; i <= periods; i++) {
    const x = lastIndex + i
    const value = trend.slope * x + trend.intercept
    const stdDev = Math.sqrt(trend.rSquared) * (lastValue * 0.1) // Simplified
    const margin = 1.96 * stdDev
    
    forecast.push({
      period: x,
      value: Math.round(value * 1000) / 1000,
      confidenceInterval: [
        Math.round((value - margin) * 1000) / 1000,
        Math.round((value + margin) * 1000) / 1000,
      ],
    })
  }
  
  return forecast
}

/**
 * Simplified t-distribution CDF
 * TODO: Use proper statistical library
 */
function tDistribution(t: number, df: number): number {
  // Simplified approximation
  if (df > 30) {
    // Use normal approximation
    return 0.5 * (1 + erf(t / Math.sqrt(2)))
  }
  // Simplified t-distribution
  return 0.5 + (t / Math.sqrt(df + t * t)) * 0.5
}

function erf(x: number): number {
  // Error function approximation
  const a1 = 0.254829592
  const a2 = -0.284496736
  const a3 = 1.421413741
  const a4 = -1.453152027
  const a5 = 1.061405429
  const p = 0.3275911

  const sign = x < 0 ? -1 : 1
  x = Math.abs(x)

  const t = 1.0 / (1.0 + p * x)
  const y = 1.0 - (((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t) * Math.exp(-x * x)

  return sign * y
}
