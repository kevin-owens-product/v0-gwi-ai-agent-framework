import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { hasPermission } from '@/lib/permissions'
import { getValidatedOrgId } from '@/lib/tenant'

/**
 * GET /api/v1/organization/security/policies
 * Get security policies that apply to the organization
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const orgId = await getValidatedOrgId(request, session.user.id!)
    if (!orgId) {
      return NextResponse.json(
        { error: 'No organization found' },
        { status: 404 }
      )
    }

    // Verify membership and permission
    const member = await prisma.organizationMember.findFirst({
      where: { userId: session.user.id!, orgId },
    })

    if (!member || !hasPermission(member.role, 'security:view')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get organization to check its plan tier
    const organization = await prisma.organization.findUnique({
      where: { id: orgId },
      select: { planTier: true },
    })

    if (!organization) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 })
    }

    // Get security policies that apply to this organization
    // (either platform-wide, targeting this org specifically, or targeting its plan tier)
    const policies = await prisma.securityPolicy.findMany({
      where: {
        isActive: true,
        OR: [
          { scope: 'PLATFORM' },
          { targetOrgs: { has: orgId } },
          { targetPlans: { has: organization.planTier } },
        ],
      },
      orderBy: { priority: 'desc' },
    })

    // Transform to a more usable format
    const settings = policies.reduce((acc, policy) => {
      acc[policy.type] = {
        name: policy.name,
        isActive: policy.isActive,
        settings: policy.settings,
        enforcementMode: policy.enforcementMode,
      }
      return acc
    }, {} as Record<string, unknown>)

    return NextResponse.json(settings)
  } catch (error) {
    console.error('Error fetching security policies:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
