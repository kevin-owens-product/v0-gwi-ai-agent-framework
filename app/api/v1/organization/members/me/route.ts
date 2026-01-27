import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getValidatedOrgId } from '@/lib/tenant'

/**
 * GET /api/v1/organization/members/me
 * Get current user's membership in the organization
 */
export async function GET(request: NextRequest) {
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

    // Get member info
    const member = await prisma.organizationMember.findFirst({
      where: {
        userId: session.user.id!,
        orgId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
          },
        },
        organization: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    })

    if (!member) {
      return NextResponse.json(
        { error: 'Not a member of this organization' },
        { status: 403 }
      )
    }

    return NextResponse.json(member)
  } catch (error) {
    console.error('Error fetching member info:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
