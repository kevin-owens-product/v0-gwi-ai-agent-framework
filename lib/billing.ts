import Stripe from 'stripe'
import { prisma } from './db'
import type { PlanTier } from '@prisma/client'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-06-20',
})

export const PLAN_LIMITS = {
  STARTER: {
    agentRuns: 100,
    teamSeats: 3,
    dataSources: 5,
    apiCallsPerMin: 100,
    retentionDays: 30,
    tokensPerMonth: 100000,
  },
  PROFESSIONAL: {
    agentRuns: 1000,
    teamSeats: 10,
    dataSources: 25,
    apiCallsPerMin: 500,
    retentionDays: 90,
    tokensPerMonth: 1000000,
  },
  ENTERPRISE: {
    agentRuns: -1, // unlimited
    teamSeats: -1,
    dataSources: -1,
    apiCallsPerMin: 2000,
    retentionDays: 365,
    tokensPerMonth: -1,
  },
} as const

export const PLAN_PRICES = {
  STARTER: {
    monthly: process.env.STRIPE_STARTER_MONTHLY_PRICE_ID,
    yearly: process.env.STRIPE_STARTER_YEARLY_PRICE_ID,
    amount: 0, // Free tier
  },
  PROFESSIONAL: {
    monthly: process.env.STRIPE_PROFESSIONAL_MONTHLY_PRICE_ID,
    yearly: process.env.STRIPE_PROFESSIONAL_YEARLY_PRICE_ID,
    amount: 99,
  },
  ENTERPRISE: {
    monthly: process.env.STRIPE_ENTERPRISE_MONTHLY_PRICE_ID,
    yearly: process.env.STRIPE_ENTERPRISE_YEARLY_PRICE_ID,
    amount: 499,
  },
} as const

export type UsageMetricType =
  | 'AGENT_RUNS'
  | 'TOKENS_CONSUMED'
  | 'API_CALLS'
  | 'DATA_SOURCES'
  | 'TEAM_SEATS'
  | 'STORAGE_GB'

export async function recordUsage(
  orgId: string,
  metricType: UsageMetricType,
  quantity: number
) {
  await prisma.usageRecord.create({
    data: { orgId, metricType, quantity }
  })
}

export async function getUsageSummary(orgId: string, startDate: Date, endDate: Date) {
  const records = await prisma.usageRecord.groupBy({
    by: ['metricType'],
    where: {
      orgId,
      recordedAt: { gte: startDate, lte: endDate }
    },
    _sum: { quantity: true }
  })

  return records.reduce((acc, r) => {
    acc[r.metricType] = r._sum.quantity || 0
    return acc
  }, {} as Record<string, number>)
}

export type PlanLimitKey = keyof typeof PLAN_LIMITS.STARTER

export async function checkUsageLimit(
  orgId: string,
  metricType: PlanLimitKey
): Promise<{ allowed: boolean; current: number; limit: number }> {
  const org = await prisma.organization.findUnique({
    where: { id: orgId },
    select: { planTier: true }
  })

  const planTier = org?.planTier || 'STARTER'
  const limit = PLAN_LIMITS[planTier][metricType]

  if (limit === -1) return { allowed: true, current: 0, limit: -1 }

  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)

  // Map metric type to usage metric enum
  const usageMetricMap: Record<PlanLimitKey, UsageMetricType | null> = {
    agentRuns: 'AGENT_RUNS',
    teamSeats: 'TEAM_SEATS',
    dataSources: 'DATA_SOURCES',
    apiCallsPerMin: 'API_CALLS',
    retentionDays: null,
    tokensPerMonth: 'TOKENS_CONSUMED',
  }

  const usageMetric = usageMetricMap[metricType]
  if (!usageMetric) {
    return { allowed: true, current: 0, limit }
  }

  const usage = await getUsageSummary(orgId, startOfMonth, new Date())
  const current = usage[usageMetric] || 0

  return { allowed: current < limit, current, limit }
}

// Stripe helpers
export async function createCustomer(orgId: string, email: string, name: string) {
  const customer = await stripe.customers.create({
    email,
    name,
    metadata: { orgId },
  })

  await prisma.billingSubscription.update({
    where: { orgId },
    data: { stripeCustomerId: customer.id }
  })

  return customer
}

export async function createCheckoutSession(
  orgId: string,
  priceId: string,
  successUrl: string,
  cancelUrl: string
) {
  const subscription = await prisma.billingSubscription.findUnique({
    where: { orgId },
    include: { organization: true }
  })

  if (!subscription?.stripeCustomerId) {
    throw new Error('No Stripe customer ID found')
  }

  const session = await stripe.checkout.sessions.create({
    customer: subscription.stripeCustomerId,
    mode: 'subscription',
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: { orgId },
  })

  return session
}

export async function createPortalSession(orgId: string, returnUrl: string) {
  const subscription = await prisma.billingSubscription.findUnique({
    where: { orgId }
  })

  if (!subscription?.stripeCustomerId) {
    throw new Error('No Stripe customer ID found')
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: subscription.stripeCustomerId,
    return_url: returnUrl,
  })

  return session
}

export async function handleStripeWebhook(event: Stripe.Event) {
  switch (event.type) {
    case 'customer.subscription.created':
    case 'customer.subscription.updated': {
      const subscription = event.data.object as Stripe.Subscription
      const orgId = subscription.metadata.orgId

      if (orgId) {
        const status = mapStripeStatus(subscription.status)
        await prisma.billingSubscription.update({
          where: { orgId },
          data: {
            stripeSubscriptionId: subscription.id,
            status,
            currentPeriodEnd: new Date(subscription.current_period_end * 1000),
            cancelAtPeriodEnd: subscription.cancel_at_period_end,
          }
        })
      }
      break
    }
    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription
      const orgId = subscription.metadata.orgId

      if (orgId) {
        await prisma.billingSubscription.update({
          where: { orgId },
          data: {
            status: 'CANCELED',
            stripeSubscriptionId: null,
          }
        })

        // Downgrade to starter plan
        await prisma.organization.update({
          where: { id: orgId },
          data: { planTier: 'STARTER' }
        })
      }
      break
    }
  }
}

function mapStripeStatus(status: Stripe.Subscription.Status) {
  const statusMap: Record<string, 'TRIALING' | 'ACTIVE' | 'PAST_DUE' | 'CANCELED' | 'UNPAID'> = {
    trialing: 'TRIALING',
    active: 'ACTIVE',
    past_due: 'PAST_DUE',
    canceled: 'CANCELED',
    unpaid: 'UNPAID',
  }
  return statusMap[status] || 'ACTIVE'
}
