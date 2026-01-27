import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { createPortalSession } from '@/lib/billing'
import { prisma } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
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

    if (!membership.organization.subscription?.stripeCustomerId) {
      return NextResponse.json(
        { error: 'No billing subscription found' },
        { status: 404 }
      )
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const returnUrl = `${baseUrl}/dashboard/settings/billing`

    const portalSession = await createPortalSession(
      membership.organization.id,
      returnUrl
    )

    return NextResponse.json({ url: portalSession.url })
  } catch (error) {
    console.error('Failed to create portal session:', error)
    return NextResponse.json(
      { error: 'Failed to create billing portal session' },
      { status: 500 }
    )
  }
}
