/**
 * Statistical Analysis Engine
 * 
 * Comprehensive statistical analysis functions for data analysis
 * including regression, ANOVA, hypothesis testing, and forecasting
 */

export interface StatisticalResult {
  value: number
  pValue?: number
  significant?: boolean
  confidenceInterval?: [number, number]
  metadata?: Record<string, unknown>
}

export interface RegressionResult {
  slope: number
  intercept: number
  rSquared: number
  adjustedRSquared: number
  standardError: number
  equation: string
  coefficients: Array<{ name: string; value: number; pValue: number; significant: boolean }>
  residuals?: number[]
  predictions?: number[]
}

export interface ANOVAResult {
  fStatistic: number
  pValue: number
  significant: boolean
  degreesOfFreedom: { between: number; within: number; total: number }
  sumOfSquares: { between: number; within: number; total: number }
  meanSquares: { between: number; within: number }
  groups: Array<{ name: string; mean: number; stdDev: number; count: number }>
}

export interface HypothesisTestResult {
  testType: "t-test" | "z-test" | "chi-square" | "mann-whitney"
  statistic: number
  pValue: number
  significant: boolean
  confidenceLevel: number
  nullHypothesis: string
  alternativeHypothesis: string
  conclusion: string
}

/**
 * Perform linear regression analysis
 */
export function performLinearRegression(
  data: Array<Record<string, number>>,
  xField: string,
  yField: string
): RegressionResult {
  const points = data
    .map((row) => ({
      x: row[xField] || 0,
      y: row[yField] || 0,
    }))
    .filter((p) => !isNaN(p.x) && !isNaN(p.y))

  if (points.length < 2) {
    return {
      slope: 0,
      intercept: 0,
      rSquared: 0,
      adjustedRSquared: 0,
      standardError: 0,
      equation: "y = 0",
      coefficients: [],
    }
  }

  const n = points.length
  const sumX = points.reduce((sum, p) => sum + p.x, 0)
  const sumY = points.reduce((sum, p) => sum + p.y, 0)
  const sumXY = points.reduce((sum, p) => sum + p.x * p.y, 0)
  const sumX2 = points.reduce((sum, p) => sum + p.x * p.x, 0)
  const sumY2 = points.reduce((sum, p) => sum + p.y * p.y, 0)

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX)
  const intercept = (sumY - slope * sumX) / n

  // Calculate R-squared
  const meanY = sumY / n
  const ssRes = points.reduce((sum, p) => {
    const predicted = slope * p.x + intercept
    return sum + Math.pow(p.y - predicted, 2)
  }, 0)
  const ssTot = points.reduce((sum, p) => sum + Math.pow(p.y - meanY, 2), 0)
  const rSquared = ssTot !== 0 ? 1 - ssRes / ssTot : 0

  // Adjusted R-squared
  const adjustedRSquared = n > 2 ? 1 - (1 - rSquared) * ((n - 1) / (n - 2)) : rSquared

  // Standard error
  const standardError = Math.sqrt(ssRes / (n - 2))

  // Calculate p-value for slope
  const slopeStdError = standardError / Math.sqrt(sumX2 - (sumX * sumX) / n)
  const tStat = slope / slopeStdError
  const pValue = 2 * (1 - tDistribution(Math.abs(tStat), n - 2))

  return {
    slope: Math.round(slope * 10000) / 10000,
    intercept: Math.round(intercept * 10000) / 10000,
    rSquared: Math.round(rSquared * 10000) / 10000,
    adjustedRSquared: Math.round(adjustedRSquared * 10000) / 10000,
    standardError: Math.round(standardError * 10000) / 10000,
    equation: `y = ${Math.round(slope * 1000) / 1000}x + ${Math.round(intercept * 1000) / 1000}`,
    coefficients: [
      {
        name: "slope",
        value: slope,
        pValue: Math.round(pValue * 10000) / 10000,
        significant: pValue < 0.05,
      },
      {
        name: "intercept",
        value: intercept,
        pValue: 1, // Simplified
        significant: false,
      },
    ],
    residuals: points.map((p) => p.y - (slope * p.x + intercept)),
    predictions: points.map((p) => slope * p.x + intercept),
  }
}

/**
 * Perform ANOVA (Analysis of Variance)
 */
export function performANOVA(
  groups: Array<{ name: string; values: number[] }>
): ANOVAResult {
  if (groups.length < 2) {
    throw new Error("ANOVA requires at least 2 groups")
  }

  const allValues: number[] = []
  groups.forEach((g) => allValues.push(...g.values))

  const grandMean = allValues.reduce((sum, v) => sum + v, 0) / allValues.length
  const totalCount = allValues.length

  // Calculate group means
  const groupStats = groups.map((g) => {
    const mean = g.values.reduce((sum, v) => sum + v, 0) / g.values.length
    const variance = g.values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / g.values.length
    const stdDev = Math.sqrt(variance)
    return {
      name: g.name,
      mean,
      stdDev,
      count: g.values.length,
    }
  })

  // Sum of Squares Between (SSB)
  const ssBetween = groupStats.reduce(
    (sum, g) => sum + g.count * Math.pow(g.mean - grandMean, 2),
    0
  )

  // Sum of Squares Within (SSW)
  const ssWithin = groups.reduce((sum, g) => {
    const groupMean = g.values.reduce((s, v) => s + v, 0) / g.values.length
    return sum + g.values.reduce((s, v) => s + Math.pow(v - groupMean, 2), 0)
  }, 0)

  const ssTotal = ssBetween + ssWithin

  // Degrees of freedom
  const dfBetween = groups.length - 1
  const dfWithin = totalCount - groups.length
  const dfTotal = totalCount - 1

  // Mean squares
  const msBetween = ssBetween / dfBetween
  const msWithin = ssWithin / dfWithin

  // F-statistic
  const fStatistic = msWithin !== 0 ? msBetween / msWithin : 0

  // P-value from F-distribution
  const pValue = fDistribution(fStatistic, dfBetween, dfWithin)
  const significant = pValue < 0.05

  return {
    fStatistic: Math.round(fStatistic * 10000) / 10000,
    pValue: Math.round(pValue * 10000) / 10000,
    significant,
    degreesOfFreedom: {
      between: dfBetween,
      within: dfWithin,
      total: dfTotal,
    },
    sumOfSquares: {
      between: Math.round(ssBetween * 10000) / 10000,
      within: Math.round(ssWithin * 10000) / 10000,
      total: Math.round(ssTotal * 10000) / 10000,
    },
    meanSquares: {
      between: Math.round(msBetween * 10000) / 10000,
      within: Math.round(msWithin * 10000) / 10000,
    },
    groups: groupStats.map((g) => ({
      name: g.name,
      mean: Math.round(g.mean * 10000) / 10000,
      stdDev: Math.round(g.stdDev * 10000) / 10000,
      count: g.count,
    })),
  }
}

/**
 * Perform hypothesis test (t-test, z-test, etc.)
 */
export function performHypothesisTest(
  sample1: number[],
  sample2: number[] | null,
  testType: "t-test" | "z-test" | "chi-square" | "mann-whitney" = "t-test",
  options: {
    alternative?: "two-sided" | "greater" | "less"
    confidenceLevel?: number
    mu0?: number // Null hypothesis mean
  } = {}
): HypothesisTestResult {
  const { alternative = "two-sided", confidenceLevel = 95, mu0 = 0 } = options

  if (testType === "t-test") {
    if (sample2 === null) {
      // One-sample t-test
      const n = sample1.length
      const mean = sample1.reduce((sum, v) => sum + v, 0) / n
      const variance = sample1.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / (n - 1)
      const stdDev = Math.sqrt(variance)
      const standardError = stdDev / Math.sqrt(n)
      const tStat = (mean - mu0) / standardError
      const pValue = calculatePValue(tStat, n - 1, alternative)

      return {
        testType: "t-test",
        statistic: Math.round(tStat * 10000) / 10000,
        pValue: Math.round(pValue * 10000) / 10000,
        significant: pValue < (100 - confidenceLevel) / 100,
        confidenceLevel,
        nullHypothesis: `μ = ${mu0}`,
        alternativeHypothesis:
          alternative === "two-sided"
            ? `μ ≠ ${mu0}`
            : alternative === "greater"
            ? `μ > ${mu0}`
            : `μ < ${mu0}`,
        conclusion: pValue < (100 - confidenceLevel) / 100
          ? "Reject null hypothesis"
          : "Fail to reject null hypothesis",
      }
    } else {
      // Two-sample t-test
      const n1 = sample1.length
      const n2 = sample2.length
      const mean1 = sample1.reduce((sum, v) => sum + v, 0) / n1
      const mean2 = sample2.reduce((sum, v) => sum + v, 0) / n2
      const var1 = sample1.reduce((sum, v) => sum + Math.pow(v - mean1, 2), 0) / (n1 - 1)
      const var2 = sample2.reduce((sum, v) => sum + Math.pow(v - mean2, 2), 0) / (n2 - 1)

      const pooledStd = Math.sqrt(((n1 - 1) * var1 + (n2 - 1) * var2) / (n1 + n2 - 2))
      const standardError = pooledStd * Math.sqrt(1 / n1 + 1 / n2)
      const tStat = (mean1 - mean2) / standardError
      const df = n1 + n2 - 2
      const pValue = calculatePValue(tStat, df, alternative)

      return {
        testType: "t-test",
        statistic: Math.round(tStat * 10000) / 10000,
        pValue: Math.round(pValue * 10000) / 10000,
        significant: pValue < (100 - confidenceLevel) / 100,
        confidenceLevel,
        nullHypothesis: "μ₁ = μ₂",
        alternativeHypothesis:
          alternative === "two-sided"
            ? "μ₁ ≠ μ₂"
            : alternative === "greater"
            ? "μ₁ > μ₂"
            : "μ₁ < μ₂",
        conclusion: pValue < (100 - confidenceLevel) / 100
          ? "Reject null hypothesis - means are significantly different"
          : "Fail to reject null hypothesis - no significant difference",
      }
    }
  }

  // Placeholder for other test types
  return {
    testType,
    statistic: 0,
    pValue: 1,
    significant: false,
    confidenceLevel,
    nullHypothesis: "",
    alternativeHypothesis: "",
    conclusion: "Test not implemented",
  }
}

/**
 * Calculate correlation matrix for multiple variables
 */
export function calculateCorrelationMatrix(
  data: Array<Record<string, number>>,
  fields: string[]
): Array<{ field1: string; field2: string; coefficient: number; pValue: number; significant: boolean }> {
  const correlations: Array<{
    field1: string
    field2: string
    coefficient: number
    pValue: number
    significant: boolean
  }> = []

  for (let i = 0; i < fields.length; i++) {
    for (let j = i + 1; j < fields.length; j++) {
      const field1 = fields[i]
      const field2 = fields[j]

      const values = data
        .map((row) => ({
          x: row[field1] || 0,
          y: row[field2] || 0,
        }))
        .filter((v) => !isNaN(v.x) && !isNaN(v.y))

      if (values.length < 2) continue

      const n = values.length
      const sumX = values.reduce((sum, v) => sum + v.x, 0)
      const sumY = values.reduce((sum, v) => sum + v.y, 0)
      const sumXY = values.reduce((sum, v) => sum + v.x * v.y, 0)
      const sumX2 = values.reduce((sum, v) => sum + v.x * v.x, 0)
      const sumY2 = values.reduce((sum, v) => sum + v.y * v.y, 0)

      const numerator = n * sumXY - sumX * sumY
      const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY))

      const coefficient = denominator !== 0 ? numerator / denominator : 0
      const tStat = coefficient * Math.sqrt((n - 2) / (1 - coefficient * coefficient))
      const pValue = 2 * (1 - tDistribution(Math.abs(tStat), n - 2))

      correlations.push({
        field1,
        field2,
        coefficient: Math.round(coefficient * 10000) / 10000,
        pValue: Math.round(pValue * 10000) / 10000,
        significant: pValue < 0.05,
      })
    }
  }

  return correlations
}

/**
 * Generate forecast with confidence intervals
 */
export function generateForecast(
  data: number[],
  periods: number,
  confidenceLevel: number = 95
): Array<{
  period: number
  value: number
  confidenceInterval: [number, number]
  predictionInterval: [number, number]
}> {
  if (data.length < 2) {
    return []
  }

  // Simple linear trend
  const n = data.length
  const indices = data.map((_, i) => i)
  const sumX = indices.reduce((sum, x) => sum + x, 0)
  const sumY = data.reduce((sum, y) => sum + y, 0)
  const sumXY = indices.reduce((sum, x, i) => sum + x * data[i], 0)
  const sumX2 = indices.reduce((sum, x) => sum + x * x, 0)

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX)
  const intercept = (sumY - slope * sumX) / n

  // Calculate residuals for prediction intervals
  const residuals = data.map((y, i) => y - (slope * i + intercept))
  const residualStdDev = Math.sqrt(
    residuals.reduce((sum, r) => sum + r * r, 0) / (n - 2)
  )

  const zScore = confidenceLevel === 95 ? 1.96 : confidenceLevel === 99 ? 2.58 : 1.645

  const forecast: Array<{
    period: number
    value: number
    confidenceInterval: [number, number]
    predictionInterval: [number, number]
  }> = []

  for (let i = 1; i <= periods; i++) {
    const x = n + i - 1
    const predicted = slope * x + intercept

    // Confidence interval (for mean prediction)
    const seMean = residualStdDev * Math.sqrt(1 / n + Math.pow(x - sumX / n, 2) / (sumX2 - sumX * sumX / n))
    const margin = zScore * seMean

    // Prediction interval (for individual prediction)
    const sePred = residualStdDev * Math.sqrt(1 + 1 / n + Math.pow(x - sumX / n, 2) / (sumX2 - sumX * sumX / n))
    const predMargin = zScore * sePred

    forecast.push({
      period: n + i,
      value: Math.round(predicted * 1000) / 1000,
      confidenceInterval: [
        Math.round((predicted - margin) * 1000) / 1000,
        Math.round((predicted + margin) * 1000) / 1000,
      ],
      predictionInterval: [
        Math.round((predicted - predMargin) * 1000) / 1000,
        Math.round((predicted + predMargin) * 1000) / 1000,
      ],
    })
  }

  return forecast
}

// Helper functions

function calculatePValue(
  statistic: number,
  degreesOfFreedom: number,
  alternative: "two-sided" | "greater" | "less"
): number {
  const tCDF = tDistribution(Math.abs(statistic), degreesOfFreedom)
  if (alternative === "two-sided") {
    return 2 * (1 - tCDF)
  } else if (alternative === "greater") {
    return 1 - tCDF
  } else {
    return tCDF
  }
}

function tDistribution(t: number, df: number): number {
  if (df > 30) {
    return 0.5 * (1 + erf(t / Math.sqrt(2)))
  }
  return 0.5 + (t / Math.sqrt(df + t * t)) * 0.5
}

function fDistribution(f: number, df1: number, df2: number): number {
  // Simplified F-distribution approximation
  // In production, use proper statistical library
  if (f < 0) return 0
  if (df1 <= 0 || df2 <= 0) return 1

  // Approximation using beta distribution
  const x = (df1 * f) / (df1 * f + df2)
  return 1 - betaCDF(x, df1 / 2, df2 / 2)
}

function betaCDF(x: number, a: number, b: number): number {
  // Simplified beta CDF approximation
  // In production, use proper statistical library
  if (x <= 0) return 0
  if (x >= 1) return 1
  return Math.pow(x, a) * Math.pow(1 - x, b) / beta(a, b)
}

function beta(a: number, b: number): number {
  // Beta function approximation
  return (gamma(a) * gamma(b)) / gamma(a + b)
}

function gamma(z: number): number {
  // Simplified gamma function approximation
  if (z < 0.5) {
    return Math.PI / (Math.sin(Math.PI * z) * gamma(1 - z))
  }
  z -= 1
  let x = 0.99999999999980993
  const coefficients = [
    676.5203681218851, -1259.1392167224028, 771.32342877765313, -176.61502916214059,
    12.507343278686905, -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7,
  ]
  for (let i = 0; i < coefficients.length; i++) {
    x += coefficients[i] / (z + i + 1)
  }
  const t = z + coefficients.length - 0.5
  return Math.sqrt(2 * Math.PI) * Math.pow(t, z + 0.5) * Math.exp(-t) * x
}

function erf(x: number): number {
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
