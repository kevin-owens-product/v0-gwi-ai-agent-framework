import Stripe from 'stripe'
import { prisma } from './db'
import type { PlanTier } from '@prisma/client'

// Lazy-initialized Stripe client to avoid build-time errors
let _stripe: Stripe | null = null

function getStripe(): Stripe {
  if (_stripe) return _stripe

  const apiKey = process.env.STRIPE_SECRET_KEY
  if (!apiKey) {
    throw new Error('STRIPE_SECRET_KEY environment variable is not configured')
  }

  _stripe = new Stripe(apiKey, {
    apiVersion: '2025-02-24.acacia',
  })

  return _stripe
}

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

// Stripe helpers - use getStripe() for lazy initialization
export async function createCustomer(orgId: string, email: string, name: string) {
  const stripe = getStripe()
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
  const stripe = getStripe()
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
  const stripe = getStripe()
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
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      const orgId = session.metadata?.orgId
      const customerId = session.customer as string
      const subscriptionId = session.subscription as string

      if (orgId && subscriptionId) {
        // Get subscription details to determine plan
        const stripe = getStripe()
        const subscription = await stripe.subscriptions.retrieve(subscriptionId)
        const priceId = subscription.items.data[0]?.price.id

        // Determine plan tier from price ID
        let planTier: PlanTier = 'STARTER'
        if (priceId === PLAN_PRICES.PROFESSIONAL.monthly || priceId === PLAN_PRICES.PROFESSIONAL.yearly) {
          planTier = 'PROFESSIONAL'
        } else if (priceId === PLAN_PRICES.ENTERPRISE.monthly || priceId === PLAN_PRICES.ENTERPRISE.yearly) {
          planTier = 'ENTERPRISE'
        }

        // Update billing subscription
        await prisma.billingSubscription.upsert({
          where: { orgId },
          create: {
            orgId,
            stripeCustomerId: customerId,
            stripeSubscriptionId: subscriptionId,
            planId: planTier.toLowerCase(),
            status: 'ACTIVE',
            currentPeriodEnd: new Date(subscription.current_period_end * 1000),
          },
          update: {
            stripeCustomerId: customerId,
            stripeSubscriptionId: subscriptionId,
            planId: planTier.toLowerCase(),
            status: 'ACTIVE',
            currentPeriodEnd: new Date(subscription.current_period_end * 1000),
            cancelAtPeriodEnd: false,
          }
        })

        // Update organization plan tier
        await prisma.organization.update({
          where: { id: orgId },
          data: { planTier }
        })

        console.log(`Checkout completed: org ${orgId} upgraded to ${planTier}`)
      }
      break
    }

    case 'customer.subscription.created':
    case 'customer.subscription.updated': {
      const subscription = event.data.object as Stripe.Subscription
      const orgId = subscription.metadata.orgId

      if (orgId) {
        const status = mapStripeStatus(subscription.status)

        // Determine plan tier from price ID
        const priceId = subscription.items?.data?.[0]?.price?.id
        let planTier: PlanTier = 'STARTER'
        if (priceId === PLAN_PRICES.PROFESSIONAL.monthly || priceId === PLAN_PRICES.PROFESSIONAL.yearly) {
          planTier = 'PROFESSIONAL'
        } else if (priceId === PLAN_PRICES.ENTERPRISE.monthly || priceId === PLAN_PRICES.ENTERPRISE.yearly) {
          planTier = 'ENTERPRISE'
        }

        await prisma.billingSubscription.update({
          where: { orgId },
          data: {
            stripeSubscriptionId: subscription.id,
            status,
            currentPeriodEnd: new Date(subscription.current_period_end * 1000),
            cancelAtPeriodEnd: subscription.cancel_at_period_end,
          }
        })

        // Update plan tier if subscription is active
        if (status === 'ACTIVE') {
          await prisma.organization.update({
            where: { id: orgId },
            data: { planTier }
          })
        }
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

        console.log(`Subscription canceled: org ${orgId} downgraded to STARTER`)
      }
      break
    }

    case 'invoice.paid': {
      const invoice = event.data.object as Stripe.Invoice
      const subscriptionId = invoice.subscription as string

      if (subscriptionId) {
        // Find org by subscription ID
        const subscription = await prisma.billingSubscription.findFirst({
          where: { stripeSubscriptionId: subscriptionId }
        })

        if (subscription) {
          // Update status to active if it was past due
          if (subscription.status === 'PAST_DUE') {
            await prisma.billingSubscription.update({
              where: { id: subscription.id },
              data: { status: 'ACTIVE' }
            })
            console.log(`Invoice paid: org ${subscription.orgId} restored to ACTIVE`)
          }
        }
      }
      break
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice
      const subscriptionId = invoice.subscription as string

      if (subscriptionId) {
        // Find org by subscription ID
        const subscription = await prisma.billingSubscription.findFirst({
          where: { stripeSubscriptionId: subscriptionId }
        })

        if (subscription) {
          await prisma.billingSubscription.update({
            where: { id: subscription.id },
            data: { status: 'PAST_DUE' }
          })
          console.log(`Payment failed: org ${subscription.orgId} marked as PAST_DUE`)

          // TODO: Send dunning email notification
        }
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

// Export a getter for Stripe (for webhook verification)
export { getStripe }
