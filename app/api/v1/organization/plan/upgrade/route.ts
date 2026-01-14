import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

/**
 * POST /api/v1/organization/plan/upgrade
 * Request a plan upgrade
 */
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get organization ID from header
    const orgId = request.headers.get('x-organization-id')

    if (!orgId) {
      return NextResponse.json(
        { error: 'Organization ID required in X-Organization-Id header' },
        { status: 400 }
      )
    }

    // Verify user is owner or admin
    const member = await prisma.organizationMember.findFirst({
      where: {
        userId: session.user.id,
        organizationId: orgId,
        role: {
          in: ['OWNER', 'ADMIN'],
        },
      },
    })

    if (!member) {
      return NextResponse.json(
        { error: 'Only owners and admins can upgrade plans' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { tier } = body

    if (!tier || !['STARTER', 'PROFESSIONAL', 'ENTERPRISE'].includes(tier)) {
      return NextResponse.json(
        { error: 'Invalid tier specified' },
        { status: 400 }
      )
    }

    // Get current organization
    const org = await prisma.organization.findUnique({
      where: { id: orgId },
      include: { plan: true },
    })

    if (!org) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 })
    }

    // TODO: In a real implementation, this would:
    // 1. Create a Stripe checkout session
    // 2. Send notification to billing team
    // 3. Create a pending subscription record

    // For now, we'll just log the request
    await prisma.platformAuditLog.create({
      data: {
        action: 'PLAN_UPGRADE_REQUESTED',
        entityType: 'ORGANIZATION',
        entityId: orgId,
        performedById: session.user.id,
        performedByType: 'USER',
        metadata: {
          currentPlan: org.plan?.tier,
          requestedPlan: tier,
          organizationId: orgId,
        },
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Upgrade request submitted successfully',
      requestedTier: tier,
    })
  } catch (error) {
    console.error('Error requesting plan upgrade:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
