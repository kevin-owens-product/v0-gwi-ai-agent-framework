import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { hasPermission } from '@/lib/permissions'
import { getValidatedOrgId } from '@/lib/tenant'

/**
 * POST /api/v1/organization/team/invite
 * Invite team members
 */
export async function POST(request: NextRequest) {
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
              where: { orgId },
            },
          },
        })

        if (existingUser?.memberships && existingUser.memberships.length > 0) {
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
            orgId,
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

        // Generate a unique token for the invitation
        const crypto = await import('crypto')
        const token = crypto.randomUUID()

        // Create invitation
        const invitation = await prisma.invitation.create({
          data: {
            email,
            role,
            orgId,
            token,
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
