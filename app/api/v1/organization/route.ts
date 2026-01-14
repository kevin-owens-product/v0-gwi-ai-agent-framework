import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/v1/organization
 * Get current organization details
 */
export async function GET(request: Request) {
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

    // Verify user is a member
    const member = await prisma.organizationMember.findFirst({
      where: {
        userId: session.user.id,
        organizationId: orgId,
      },
    })

    if (!member) {
      return NextResponse.json(
        { error: 'Not a member of this organization' },
        { status: 403 }
      )
    }

    // Get organization with plan
    const organization = await prisma.organization.findUnique({
      where: { id: orgId },
      include: {
        plan: true,
        _count: {
          select: {
            members: true,
            agents: true,
            workflows: true,
            reports: true,
          },
        },
      },
    })

    if (!organization) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 })
    }

    return NextResponse.json(organization)
  } catch (error) {
    console.error('Error fetching organization:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
