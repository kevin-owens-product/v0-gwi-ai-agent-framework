import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { createCheckoutSession, PLAN_PRICES, createCustomer } from '@/lib/billing'
import { prisma } from '@/lib/db'
import type { PlanTier } from '@prisma/client'

export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { planTier, billingPeriod = 'monthly' } = body as {
      planTier: PlanTier
      billingPeriod: 'monthly' | 'yearly'
    }

    if (!planTier || !['PROFESSIONAL', 'ENTERPRISE'].includes(planTier)) {
      return NextResponse.json(
        { error: 'Invalid plan tier' },
        { status: 400 }
      )
    }

    // Get user's organization
    const membership = await prisma.organizationMember.findFirst({
      where: { userId: session.user.id },
      include: {
        organization: {
          include: { subscription: true }
        }
      }
    })

    if (!membership) {
      return NextResponse.json(
        { error: 'No organization found' },
        { status: 404 }
      )
    }

    const org = membership.organization
    const priceKey = billingPeriod === 'yearly' ? 'yearly' : 'monthly'
    const priceId = PLAN_PRICES[planTier][priceKey]

    if (!priceId) {
      return NextResponse.json(
        { error: 'Price not configured for this plan' },
        { status: 400 }
      )
    }

    // Ensure customer exists in Stripe
    if (!org.subscription?.stripeCustomerId) {
      const user = await prisma.user.findUnique({
        where: { id: session.user.id }
      })

      if (!user?.email) {
        return NextResponse.json(
          { error: 'User email not found' },
          { status: 400 }
        )
      }

      // Create billing subscription record if it doesn't exist
      await prisma.billingSubscription.upsert({
        where: { orgId: org.id },
        create: {
          orgId: org.id,
          planId: 'starter',
          status: 'TRIALING',
        },
        update: {}
      })

      await createCustomer(org.id, user.email, org.name)
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const successUrl = `${baseUrl}/dashboard/settings/billing?success=true&plan=${planTier.toLowerCase()}`
    const cancelUrl = `${baseUrl}/dashboard/settings/billing/upgrade?canceled=true`

    const checkoutSession = await createCheckoutSession(
      org.id,
      priceId,
      successUrl,
      cancelUrl
    )

    return NextResponse.json({ url: checkoutSession.url })
  } catch (error) {
    console.error('Failed to create checkout session:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
