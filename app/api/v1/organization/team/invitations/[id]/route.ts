import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { hasPermission } from '@/lib/permissions'

/**
 * DELETE /api/v1/organization/team/invitations/[id]
 * Cancel an invitation
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await auth()
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

    // Verify membership and permission
    const member = await prisma.organizationMember.findFirst({
      where: { userId: session.user.id!, orgId },
    })

    if (!member || !hasPermission(member.role, 'team:invite')) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    // Cancel invitation
    const invitation = await prisma.invitation.update({
      where: { id },
      data: { status: 'REVOKED' },
    })

    return NextResponse.json(invitation)
  } catch (error) {
    console.error('Error cancelling invitation:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
