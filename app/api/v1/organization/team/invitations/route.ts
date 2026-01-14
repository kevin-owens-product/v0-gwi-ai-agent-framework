import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/v1/organization/team/invitations
 * Get pending invitations
 */
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const orgId = request.headers.get('x-organization-id')
    if (!orgId) {
      return NextResponse.json(
        { error: 'Organization ID required in X-Organization-Id header' },
        { status: 400 }
      )
    }

    // Verify membership
    const member = await prisma.organizationMember.findFirst({
      where: { userId: session.user.id, organizationId: orgId },
    })

    if (!member) {
      return NextResponse.json(
        { error: 'Not a member of this organization' },
        { status: 403 }
      )
    }

    // Get invitations
    const invitations = await prisma.invitation.findMany({
      where: {
        organizationId: orgId,
        status: 'PENDING',
      },
      include: {
        invitedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(invitations)
  } catch (error) {
    console.error('Error fetching invitations:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
