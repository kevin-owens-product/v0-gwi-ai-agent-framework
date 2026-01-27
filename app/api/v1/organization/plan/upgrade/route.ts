import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getValidatedOrgId } from '@/lib/tenant'

/**
 * POST /api/v1/organization/plan/upgrade
 * Request a plan upgrade
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get validated organization ID (validates user membership)
    const orgId = await getValidatedOrgId(request, session.user.id!)

    if (!orgId) {
      return NextResponse.json(
        { error: 'Organization not found or access denied' },
        { status: 403 }
      )
    }

    // Verify user is owner or admin (additional permission check)
    const member = await prisma.organizationMember.findFirst({
      where: {
        userId: session.user.id!,
        orgId,
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
        resourceType: 'ORGANIZATION',
        resourceId: orgId,
        targetOrgId: orgId,
        details: {
          currentPlan: org.planTier,
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
