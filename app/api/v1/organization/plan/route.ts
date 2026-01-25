import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getOrganizationFeatures } from '@/lib/features'
import { getValidatedOrgId } from '@/lib/tenant'

/**
 * GET /api/v1/organization/plan
 * Get organization's current plan and features
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get validated organization ID (validates user membership)
    const orgId = await getValidatedOrgId(request, session.user.id)

    if (!orgId) {
      return NextResponse.json(
        { error: 'Organization not found or access denied' },
        { status: 403 }
      )
    }

    // Get organization with plan
    const organization = await prisma.organization.findUnique({
      where: { id: orgId },
      include: {
        plan: {
          include: {
            planFeatures: {
              include: {
                feature: true,
              },
            },
          },
        },
      },
    })

    if (!organization) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 })
    }

    // Get all features with overrides
    const features = await getOrganizationFeatures(orgId)

    return NextResponse.json({
      plan: organization.plan,
      features,
    })
  } catch (error) {
    console.error('Error fetching organization plan:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
