import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { hasPermission } from '@/lib/permissions'

/**
 * POST /api/v1/organization/team/invite
 * Invite team members
 */
export async function POST(request: Request) {
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

    // Verify membership and permission
    const member = await prisma.organizationMember.findFirst({
      where: { userId: session.user.id, organizationId: orgId },
    })

    if (!member) {
      return NextResponse.json(
        { error: 'Not a member of this organization' },
        { status: 403 }
      )
    }

    if (!hasPermission(member.role, 'team:invite')) {
      return NextResponse.json(
        { error: 'You do not have permission to invite team members' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { emails, role = 'MEMBER' } = body

    if (!emails || !Array.isArray(emails) || emails.length === 0) {
      return NextResponse.json(
        { error: 'Email addresses required' },
        { status: 400 }
      )
    }

    // Create invitations
    const invitations = await Promise.all(
      emails.map(async (email: string) => {
        // Check if user already exists and is member
        const existingUser = await prisma.user.findUnique({
          where: { email },
          include: {
            memberships: {
              where: { organizationId: orgId },
            },
          },
        })

        if (existingUser?.memberships.length > 0) {
          return {
            email,
            status: 'already_member',
            error: 'User is already a member',
          }
        }

        // Check for existing pending invitation
        const existingInvitation = await prisma.invitation.findFirst({
          where: {
            email,
            organizationId: orgId,
            status: 'PENDING',
          },
        })

        if (existingInvitation) {
          return {
            email,
            status: 'already_invited',
            invitation: existingInvitation,
          }
        }

        // Create invitation
        const invitation = await prisma.invitation.create({
          data: {
            email,
            role,
            organizationId: orgId,
            invitedById: session.user.id,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
          },
        })

        // TODO: Send invitation email

        return {
          email,
          status: 'invited',
          invitation,
        }
      })
    )

    return NextResponse.json({
      success: true,
      invitations,
    })
  } catch (error) {
    console.error('Error inviting team members:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
