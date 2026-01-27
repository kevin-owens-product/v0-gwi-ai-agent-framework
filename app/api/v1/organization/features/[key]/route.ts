import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { checkFeatureAccess } from '@/lib/features'

/**
 * GET /api/v1/organization/features/[key]
 * Check access to a specific feature
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  try {
    const { key } = await params
    const session = await auth()

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

    // Verify user is a member
    const member = await prisma.organizationMember.findFirst({
      where: {
        userId: session.user.id!,
        orgId,
      },
    })

    if (!member) {
      return NextResponse.json(
        { error: 'Not a member of this organization' },
        { status: 403 }
      )
    }

    // Check feature access
    const featureAccess = await checkFeatureAccess(orgId, key)

    return NextResponse.json(featureAccess)
  } catch (error) {
    console.error('Error checking feature access:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
