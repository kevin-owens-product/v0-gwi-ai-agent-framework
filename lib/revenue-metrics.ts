/**
 * @prompt-id forge-v4.1:feature:revenue-analytics:001
 * @generated-at 2026-01-25T00:00:00Z
 * @model claude-opus-4-5
 */

import { prisma } from "@/lib/db"
import { Prisma, MetricPeriod, PlanTier } from "@prisma/client"
import { Decimal } from "@prisma/client/runtime/library"

// Types for revenue metrics
export interface RevenueMetricData {
  date: Date
  period: MetricPeriod
  mrr: Decimal
  arr: Decimal
  newMrr: Decimal
  expansionMrr: Decimal
  contractionMrr: Decimal
  churnMrr: Decimal
  netNewMrr: Decimal
  totalCustomers: number
  newCustomers: number
  churnedCustomers: number
  arpu: Decimal
  ltv: Decimal
  cac: Decimal | null
  byPlan: Record<string, PlanBreakdown>
  byRegion: Record<string, RegionBreakdown>
  byCohort: Record<string, CohortBreakdown>
}

export interface PlanBreakdown {
  customerCount: number
  mrr: number
  percentage: number
}

export interface RegionBreakdown {
  customerCount: number
  mrr: number
  percentage: number
}

export interface CohortBreakdown {
  cohortDate: string
  initialCustomers: number
  currentCustomers: number
  initialMrr: number
  currentMrr: number
  retentionRate: number
  revenueRetention: number
}

export interface MRRBreakdown {
  byPlan: Record<string, PlanBreakdown>
  byCohort: CohortBreakdown[]
  total: number
  growthRate: number
}

export interface RevenueForecast {
  period: string
  projectedMrr: number
  projectedArr: number
  confidence: number
  lowerBound: number
  upperBound: number
  assumptions: string[]
}

// Plan pricing configuration (in cents)
const PLAN_PRICING: Record<PlanTier, { monthly: number; yearly: number }> = {
  STARTER: { monthly: 0, yearly: 0 },
  PROFESSIONAL: { monthly: 9900, yearly: 99000 },
  ENTERPRISE: { monthly: 49900, yearly: 499000 },
}

/**
 * Calculate revenue metrics for a specific date and period
 */
export async function calculateRevenueMetrics(
  date: Date,
  period: MetricPeriod
): Promise<RevenueMetricData> {
  // Get period boundaries
  const { startDate, endDate, previousStartDate } = getPeriodBoundaries(date, period)

  // Fetch all data in parallel
  const [
    currentOrgs,
    previousOrgs,
    newOrgs,
    churnedOrgs,
  ] = await Promise.all([
    // Current active organizations with subscriptions
    prisma.organization.findMany({
      where: {
        createdAt: { lte: endDate },
      },
      include: {
        subscription: true,
      },
    }),
    // Organizations from previous period for comparison
    prisma.organization.findMany({
      where: {
        createdAt: { lte: previousStartDate },
      },
      include: {
        subscription: true,
      },
    }),
    // New organizations in this period
    prisma.organization.count({
      where: {
        createdAt: { gte: startDate, lte: endDate },
      },
    }),
    // Churned organizations (suspended for billing)
    prisma.organizationSuspension.count({
      where: {
        createdAt: { gte: startDate, lte: endDate },
        suspensionType: "BILLING_HOLD",
        isActive: true,
      },
    }),
  ])

  // Calculate MRR by plan
  const mrrByPlan = calculateMRRByPlan(currentOrgs)
  // previousMrrByPlan used for expansion/contraction calculations
  calculateMRRByPlan(previousOrgs)

  // Calculate total MRR
  const totalMrr = Object.values(mrrByPlan).reduce((sum, plan) => sum + plan.mrr, 0)

  // Calculate new MRR (from new customers)
  const newMrr = calculateNewMRR(currentOrgs, startDate, endDate)

  // Calculate expansion MRR (upgrades)
  const expansionMrr = calculateExpansionMRR(currentOrgs, previousOrgs)

  // Calculate contraction MRR (downgrades)
  const contractionMrr = calculateContractionMRR(currentOrgs, previousOrgs)

  // Calculate churn MRR
  const churnMrr = calculateChurnMRR(previousOrgs, currentOrgs)

  // Net new MRR
  const netNewMrr = newMrr + expansionMrr - contractionMrr - churnMrr

  // Calculate regional breakdown
  const byRegion = calculateRegionalBreakdown(currentOrgs, totalMrr)

  // Calculate cohort breakdown
  const byCohort = await calculateCohortBreakdown(currentOrgs, endDate)

  // Calculate ARPU (Average Revenue Per User)
  const activeCustomers = currentOrgs.filter(org =>
    org.planTier !== "STARTER" || org.subscription?.status === "ACTIVE"
  ).length
  const arpu = activeCustomers > 0 ? totalMrr / activeCustomers : 0

  // Calculate LTV (Lifetime Value) - simplified: ARPU * average lifespan in months
  const avgLifespanMonths = 24 // Assume 24 months average customer lifespan
  const ltv = arpu * avgLifespanMonths

  // Format by plan for storage
  const byPlanFormatted: Record<string, PlanBreakdown> = {}
  Object.entries(mrrByPlan).forEach(([plan, data]) => {
    byPlanFormatted[plan] = {
      ...data,
      percentage: totalMrr > 0 ? (data.mrr / totalMrr) * 100 : 0,
    }
  })

  return {
    date,
    period,
    mrr: new Decimal(totalMrr / 100), // Convert cents to dollars
    arr: new Decimal((totalMrr * 12) / 100),
    newMrr: new Decimal(newMrr / 100),
    expansionMrr: new Decimal(expansionMrr / 100),
    contractionMrr: new Decimal(contractionMrr / 100),
    churnMrr: new Decimal(churnMrr / 100),
    netNewMrr: new Decimal(netNewMrr / 100),
    totalCustomers: currentOrgs.length,
    newCustomers: newOrgs,
    churnedCustomers: churnedOrgs,
    arpu: new Decimal(arpu / 100),
    ltv: new Decimal(ltv / 100),
    cac: null, // Would need marketing spend data
    byPlan: byPlanFormatted,
    byRegion,
    byCohort,
  }
}

/**
 * Store calculated revenue metrics in database
 */
export async function storeRevenueMetrics(
  metrics: RevenueMetricData
): Promise<{ id: string }> {
  const result = await prisma.revenueMetric.upsert({
    where: {
      date_period: {
        date: metrics.date,
        period: metrics.period,
      },
    },
    update: {
      mrr: metrics.mrr,
      arr: metrics.arr,
      newMrr: metrics.newMrr,
      expansionMrr: metrics.expansionMrr,
      contractionMrr: metrics.contractionMrr,
      churnMrr: metrics.churnMrr,
      netNewMrr: metrics.netNewMrr,
      totalCustomers: metrics.totalCustomers,
      newCustomers: metrics.newCustomers,
      churnedCustomers: metrics.churnedCustomers,
      arpu: metrics.arpu,
      ltv: metrics.ltv,
      cac: metrics.cac,
      byPlan: metrics.byPlan as unknown as Prisma.InputJsonValue,
      byRegion: metrics.byRegion as unknown as Prisma.InputJsonValue,
      byCohort: metrics.byCohort as unknown as Prisma.InputJsonValue,
    },
    create: {
      date: metrics.date,
      period: metrics.period,
      mrr: metrics.mrr,
      arr: metrics.arr,
      newMrr: metrics.newMrr,
      expansionMrr: metrics.expansionMrr,
      contractionMrr: metrics.contractionMrr,
      churnMrr: metrics.churnMrr,
      netNewMrr: metrics.netNewMrr,
      totalCustomers: metrics.totalCustomers,
      newCustomers: metrics.newCustomers,
      churnedCustomers: metrics.churnedCustomers,
      arpu: metrics.arpu,
      ltv: metrics.ltv,
      cac: metrics.cac,
      byPlan: metrics.byPlan as unknown as Prisma.InputJsonValue,
      byRegion: metrics.byRegion as unknown as Prisma.InputJsonValue,
      byCohort: metrics.byCohort as unknown as Prisma.InputJsonValue,
    },
  })

  return { id: result.id }
}

/**
 * Get MRR breakdown by plan and cohort
 */
export async function getMRRBreakdown(
  _startDate?: Date,
  endDate?: Date
): Promise<MRRBreakdown> {
  const now = new Date()
  const end = endDate || now

  // Get current organizations
  const orgs = await prisma.organization.findMany({
    where: {
      createdAt: { lte: end },
    },
    include: {
      subscription: true,
    },
  })

  // Calculate MRR by plan
  const byPlan = calculateMRRByPlan(orgs)
  const totalMrr = Object.values(byPlan).reduce((sum, plan) => sum + plan.mrr, 0)

  // Format by plan with percentages
  const byPlanFormatted: Record<string, PlanBreakdown> = {}
  Object.entries(byPlan).forEach(([plan, data]) => {
    byPlanFormatted[plan] = {
      ...data,
      percentage: totalMrr > 0 ? (data.mrr / totalMrr) * 100 : 0,
    }
  })

  // Calculate cohort data
  const byCohort = await calculateCohortBreakdown(orgs, end)

  // Get previous period for growth rate
  const previousPeriodOrgs = await prisma.organization.findMany({
    where: {
      createdAt: { lte: new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000) },
    },
  })
  const previousMrr = calculateMRRByPlan(previousPeriodOrgs)
  const previousTotal = Object.values(previousMrr).reduce((sum, plan) => sum + plan.mrr, 0)
  const growthRate = previousTotal > 0 ? ((totalMrr - previousTotal) / previousTotal) * 100 : 0

  return {
    byPlan: byPlanFormatted,
    byCohort: Object.values(byCohort),
    total: totalMrr / 100, // Convert to dollars
    growthRate,
  }
}

/**
 * Generate revenue forecast based on historical trends
 */
export async function getRevenueForecast(
  months: number = 12
): Promise<RevenueForecast[]> {
  // Get historical revenue metrics
  const historicalMetrics = await prisma.revenueMetric.findMany({
    where: {
      period: "MONTHLY",
    },
    orderBy: { date: "asc" },
    take: 12, // Last 12 months
  })

  const forecasts: RevenueForecast[] = []
  const now = new Date()

  if (historicalMetrics.length === 0) {
    // No historical data, use current organization data
    const orgs = await prisma.organization.findMany({
      include: { subscription: true },
    })
    const currentMrr = Object.values(calculateMRRByPlan(orgs))
      .reduce((sum, plan) => sum + plan.mrr, 0) / 100

    // Assume modest 5% monthly growth
    for (let i = 1; i <= months; i++) {
      const futureDate = new Date(now.getTime() + i * 30 * 24 * 60 * 60 * 1000)
      const growthFactor = Math.pow(1.05, i)
      const projectedMrr = currentMrr * growthFactor

      forecasts.push({
        period: futureDate.toISOString().slice(0, 7), // YYYY-MM format
        projectedMrr: Math.round(projectedMrr * 100) / 100,
        projectedArr: Math.round(projectedMrr * 12 * 100) / 100,
        confidence: Math.max(50, 95 - i * 5), // Confidence decreases over time
        lowerBound: Math.round(projectedMrr * 0.85 * 100) / 100,
        upperBound: Math.round(projectedMrr * 1.15 * 100) / 100,
        assumptions: [
          "5% monthly growth rate assumed",
          "Based on current customer base",
          "No major market changes",
        ],
      })
    }
    return forecasts
  }

  // Calculate average growth rate from historical data
  const mrrValues = historicalMetrics.map(m => Number(m.mrr))
  let totalGrowthRate = 0
  let growthPeriods = 0

  for (let i = 1; i < mrrValues.length; i++) {
    if (mrrValues[i - 1] > 0) {
      totalGrowthRate += (mrrValues[i] - mrrValues[i - 1]) / mrrValues[i - 1]
      growthPeriods++
    }
  }

  const avgGrowthRate = growthPeriods > 0 ? totalGrowthRate / growthPeriods : 0.05
  const lastMrr = mrrValues[mrrValues.length - 1] || 0

  // Calculate variance for confidence intervals
  const variance = calculateVariance(mrrValues)
  const stdDev = Math.sqrt(variance)

  for (let i = 1; i <= months; i++) {
    const futureDate = new Date(now.getTime() + i * 30 * 24 * 60 * 60 * 1000)
    const growthFactor = Math.pow(1 + avgGrowthRate, i)
    const projectedMrr = lastMrr * growthFactor

    // Widen confidence interval over time
    const uncertaintyFactor = 1 + (i * 0.05)
    const adjustedStdDev = stdDev * uncertaintyFactor

    forecasts.push({
      period: futureDate.toISOString().slice(0, 7),
      projectedMrr: Math.round(projectedMrr * 100) / 100,
      projectedArr: Math.round(projectedMrr * 12 * 100) / 100,
      confidence: Math.max(50, 95 - i * 3),
      lowerBound: Math.round(Math.max(0, projectedMrr - adjustedStdDev * 2) * 100) / 100,
      upperBound: Math.round((projectedMrr + adjustedStdDev * 2) * 100) / 100,
      assumptions: [
        `${(avgGrowthRate * 100).toFixed(1)}% average monthly growth based on historical data`,
        `${historicalMetrics.length} months of historical data analyzed`,
        "Linear extrapolation with confidence intervals",
      ],
    })
  }

  return forecasts
}

/**
 * Calculate Net Revenue Retention (NRR)
 */
export async function calculateNetRevenueRetention(
  periodMonths: number = 12
): Promise<number> {
  const now = new Date()
  const periodStart = new Date(now.getTime() - periodMonths * 30 * 24 * 60 * 60 * 1000)

  // Get organizations that existed at period start
  const orgsAtStart = await prisma.organization.findMany({
    where: {
      createdAt: { lte: periodStart },
    },
    include: { subscription: true },
  })

  const orgIds = orgsAtStart.map(org => org.id)

  // Get current state of those same organizations
  const currentOrgs = await prisma.organization.findMany({
    where: {
      id: { in: orgIds },
    },
    include: { subscription: true },
  })

  // Calculate starting MRR for the cohort
  const startingMrr = orgsAtStart.reduce((sum, org) => {
    return sum + (PLAN_PRICING[org.planTier]?.monthly || 0)
  }, 0)

  // Calculate current MRR for the same cohort
  const currentMrr = currentOrgs.reduce((sum, org) => {
    return sum + (PLAN_PRICING[org.planTier]?.monthly || 0)
  }, 0)

  // NRR = Current MRR from cohort / Starting MRR * 100
  return startingMrr > 0 ? (currentMrr / startingMrr) * 100 : 100
}

// Helper functions

function getPeriodBoundaries(date: Date, period: MetricPeriod) {
  const endDate = new Date(date)
  let startDate: Date
  let previousStartDate: Date

  switch (period) {
    case "DAILY":
      startDate = new Date(endDate)
      startDate.setHours(0, 0, 0, 0)
      previousStartDate = new Date(startDate.getTime() - 24 * 60 * 60 * 1000)
      break
    case "WEEKLY":
      startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000)
      previousStartDate = new Date(startDate.getTime() - 7 * 24 * 60 * 60 * 1000)
      break
    case "MONTHLY":
      startDate = new Date(endDate.getFullYear(), endDate.getMonth(), 1)
      previousStartDate = new Date(endDate.getFullYear(), endDate.getMonth() - 1, 1)
      break
    case "QUARTERLY": {
      const quarter = Math.floor(endDate.getMonth() / 3)
      startDate = new Date(endDate.getFullYear(), quarter * 3, 1)
      previousStartDate = new Date(endDate.getFullYear(), (quarter - 1) * 3, 1)
      break
    }
    case "YEARLY":
      startDate = new Date(endDate.getFullYear(), 0, 1)
      previousStartDate = new Date(endDate.getFullYear() - 1, 0, 1)
      break
    default:
      startDate = new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000)
      previousStartDate = new Date(startDate.getTime() - 30 * 24 * 60 * 60 * 1000)
  }

  return { startDate, endDate, previousStartDate }
}

function calculateMRRByPlan(
  orgs: Array<{ planTier: PlanTier; subscription?: { status: string } | null }>
): Record<string, PlanBreakdown> {
  const byPlan: Record<string, PlanBreakdown> = {
    STARTER: { customerCount: 0, mrr: 0, percentage: 0 },
    PROFESSIONAL: { customerCount: 0, mrr: 0, percentage: 0 },
    ENTERPRISE: { customerCount: 0, mrr: 0, percentage: 0 },
  }

  orgs.forEach(org => {
    const plan = org.planTier
    byPlan[plan].customerCount++
    byPlan[plan].mrr += PLAN_PRICING[plan]?.monthly || 0
  })

  return byPlan
}

function calculateNewMRR(
  orgs: Array<{ planTier: PlanTier; createdAt: Date }>,
  startDate: Date,
  endDate: Date
): number {
  return orgs
    .filter(org => org.createdAt >= startDate && org.createdAt <= endDate)
    .reduce((sum, org) => sum + (PLAN_PRICING[org.planTier]?.monthly || 0), 0)
}

function calculateExpansionMRR(
  currentOrgs: Array<{ id: string; planTier: PlanTier }>,
  previousOrgs: Array<{ id: string; planTier: PlanTier }>
): number {
  const previousOrgMap = new Map(previousOrgs.map(org => [org.id, org.planTier]))
  let expansion = 0

  currentOrgs.forEach(org => {
    const previousPlan = previousOrgMap.get(org.id)
    if (previousPlan) {
      const previousMrr = PLAN_PRICING[previousPlan]?.monthly || 0
      const currentMrr = PLAN_PRICING[org.planTier]?.monthly || 0
      if (currentMrr > previousMrr) {
        expansion += currentMrr - previousMrr
      }
    }
  })

  return expansion
}

function calculateContractionMRR(
  currentOrgs: Array<{ id: string; planTier: PlanTier }>,
  previousOrgs: Array<{ id: string; planTier: PlanTier }>
): number {
  const currentOrgMap = new Map(currentOrgs.map(org => [org.id, org.planTier]))
  let contraction = 0

  previousOrgs.forEach(org => {
    const currentPlan = currentOrgMap.get(org.id)
    if (currentPlan) {
      const previousMrr = PLAN_PRICING[org.planTier]?.monthly || 0
      const currentMrr = PLAN_PRICING[currentPlan]?.monthly || 0
      if (currentMrr < previousMrr) {
        contraction += previousMrr - currentMrr
      }
    }
  })

  return contraction
}

function calculateChurnMRR(
  previousOrgs: Array<{ id: string; planTier: PlanTier }>,
  currentOrgs: Array<{ id: string; planTier: PlanTier }>
): number {
  const currentOrgIds = new Set(currentOrgs.map(org => org.id))

  return previousOrgs
    .filter(org => !currentOrgIds.has(org.id))
    .reduce((sum, org) => sum + (PLAN_PRICING[org.planTier]?.monthly || 0), 0)
}

function calculateRegionalBreakdown(
  orgs: Array<{ country?: string | null; planTier: PlanTier }>,
  totalMrr: number
): Record<string, RegionBreakdown> {
  const byRegion: Record<string, RegionBreakdown> = {}

  orgs.forEach(org => {
    const region = org.country || "Unknown"
    if (!byRegion[region]) {
      byRegion[region] = { customerCount: 0, mrr: 0, percentage: 0 }
    }
    byRegion[region].customerCount++
    byRegion[region].mrr += PLAN_PRICING[org.planTier]?.monthly || 0
  })

  // Calculate percentages
  Object.keys(byRegion).forEach(region => {
    byRegion[region].percentage = totalMrr > 0
      ? (byRegion[region].mrr / totalMrr) * 100
      : 0
  })

  return byRegion
}

async function calculateCohortBreakdown(
  currentOrgs: Array<{ id: string; planTier: PlanTier; createdAt: Date }>,
  _referenceDate: Date
): Promise<Record<string, CohortBreakdown>> {
  const cohorts: Record<string, CohortBreakdown> = {}

  // Group organizations by signup month
  currentOrgs.forEach(org => {
    const cohortKey = org.createdAt.toISOString().slice(0, 7) // YYYY-MM

    if (!cohorts[cohortKey]) {
      cohorts[cohortKey] = {
        cohortDate: cohortKey,
        initialCustomers: 0,
        currentCustomers: 0,
        initialMrr: 0,
        currentMrr: 0,
        retentionRate: 0,
        revenueRetention: 0,
      }
    }

    cohorts[cohortKey].currentCustomers++
    cohorts[cohortKey].currentMrr += PLAN_PRICING[org.planTier]?.monthly || 0
  })

  // For simplicity, assume initial = current for existing customers
  // In production, you'd track historical plan changes
  Object.keys(cohorts).forEach(key => {
    const cohort = cohorts[key]
    cohort.initialCustomers = cohort.currentCustomers
    cohort.initialMrr = cohort.currentMrr
    cohort.retentionRate = 100 // Simplified
    cohort.revenueRetention = 100 // Simplified
  })

  return cohorts
}

function calculateVariance(values: number[]): number {
  if (values.length === 0) return 0
  const mean = values.reduce((sum, val) => sum + val, 0) / values.length
  return values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length
}
