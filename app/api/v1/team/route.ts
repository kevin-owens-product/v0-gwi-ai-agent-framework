import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { cookies } from 'next/headers'
import { getUserMembership } from '@/lib/tenant'
import { hasPermission } from '@/lib/permissions'
import { logAuditEvent, createAuditEventFromRequest } from '@/lib/audit'
import { sendInvitationEmail } from '@/lib/email'
import { randomBytes } from 'crypto'
import { z } from 'zod'

const inviteTeamMemberSchema = z.object({
  email: z.string().email('Invalid email address'),
  role: z.enum(['OWNER', 'ADMIN', 'MEMBER', 'VIEWER']).optional().default('MEMBER'),
})

// Helper to get org ID from header or cookies
async function getOrgId(request: NextRequest, userId: string): Promise<string | null> {
  const headerOrgId = request.headers.get('x-organization-id')
  if (headerOrgId) return headerOrgId

  const cookieStore = await cookies()
  const memberships = await prisma.organizationMember.findMany({
    where: { userId },
    include: { organization: true },
    orderBy: { joinedAt: 'asc' },
  })

  if (memberships.length === 0) return null
  return cookieStore.get('currentOrgId')?.value || memberships[0].organization.id
}

// GET /api/v1/team - List team members
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const orgId = await getOrgId(request, session.user.id)
    if (!orgId) {
      return NextResponse.json({ error: 'No organization found' }, { status: 404 })
    }

    // Check membership
    const membership = await getUserMembership(session.user.id, orgId)
    if (!membership) {
      return NextResponse.json({ error: 'Not a member of this organization' }, { status: 403 })
    }

    // Fetch team members
    const members = await prisma.organizationMember.findMany({
      where: { orgId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
            createdAt: true,
          },
        },
      },
      orderBy: { joinedAt: 'asc' },
    })

    // Get last session for each member
    const membersWithActivity = await Promise.all(
      members.map(async (member) => {
        const lastSession = await prisma.session.findFirst({
          where: { userId: member.userId },
          orderBy: { expires: 'desc' },
          select: { expires: true },
        })
        return {
          id: member.id,
          userId: member.userId,
          role: member.role,
          joinedAt: member.joinedAt,
          user: member.user,
          lastActive: lastSession?.expires || null,
        }
      })
    )

    return NextResponse.json({ members: membersWithActivity })
  } catch (error) {
    console.error('GET /api/v1/team error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/v1/team - Invite team member
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const orgId = await getOrgId(request, session.user.id)
    if (!orgId) {
      return NextResponse.json({ error: 'No organization found' }, { status: 404 })
    }

    const membership = await getUserMembership(session.user.id, orgId)
    if (!membership) {
      return NextResponse.json({ error: 'Not a member of this organization' }, { status: 403 })
    }

    if (!hasPermission(membership.role, 'team:write')) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 })
    }

    const body = await request.json()
    const validationResult = inviteTeamMemberSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation error', details: validationResult.error.errors },
        { status: 400 }
      )
    }

    const { email, role } = validationResult.data
    const normalizedEmail = email.toLowerCase()

    // Get organization details
    const organization = await prisma.organization.findUnique({
      where: { id: orgId },
      select: { id: true, name: true },
    })

    if (!organization) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 })
    }

    // Check if user is already a member
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: { id: true },
    })

    if (existingUser) {
      const existingMembership = await prisma.organizationMember.findFirst({
        where: { userId: existingUser.id, orgId },
      })

      if (existingMembership) {
        return NextResponse.json(
          { error: 'User is already a member of this organization' },
          { status: 400 }
        )
      }
    }

    // Generate invitation token
    const inviteToken = randomBytes(32).toString('hex')
    const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days

    // Store invitation (reusing VerificationToken model)
    await prisma.verificationToken.create({
      data: {
        identifier: `invite:${normalizedEmail}:${orgId}`,
        token: inviteToken,
        expires,
      },
    })

    // Get inviter name
    const inviter = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { name: true },
    })

    // Build invitation URL
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
    const inviteUrl = `${baseUrl}/accept-invitation?token=${inviteToken}`

    // Send invitation email
    try {
      await sendInvitationEmail({
        to: normalizedEmail,
        inviterName: inviter?.name || 'A team member',
        organizationName: organization.name,
        inviteUrl,
        role,
      })
    } catch (emailError) {
      console.error('Failed to send invitation email:', emailError)
      return NextResponse.json(
        { error: 'Failed to send invitation email' },
        { status: 500 }
      )
    }

    // Log audit event
    await logAuditEvent(createAuditEventFromRequest(request, {
      orgId,
      userId: session.user.id,
      action: 'create',
      resourceType: 'team_invitation',
      resourceId: inviteToken,
      metadata: { email: normalizedEmail, role },
    }))

    return NextResponse.json({
      success: true,
      message: 'Invitation sent successfully',
    })
  } catch (error) {
    console.error('POST /api/v1/team error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PATCH /api/v1/team - Update member role
export async function PATCH(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const orgId = await getOrgId(request, session.user.id)
    if (!orgId) {
      return NextResponse.json({ error: 'No organization found' }, { status: 404 })
    }

    const membership = await getUserMembership(session.user.id, orgId)
    if (!membership) {
      return NextResponse.json({ error: 'Not a member of this organization' }, { status: 403 })
    }

    if (!hasPermission(membership.role, 'team:write')) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 })
    }

    const body = await request.json()
    const { memberId, role } = body

    if (!memberId || !role) {
      return NextResponse.json({ error: 'Member ID and role are required' }, { status: 400 })
    }

    // Validate role
    if (!['OWNER', 'ADMIN', 'MEMBER', 'VIEWER'].includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
    }

    // Check target member exists in org
    const targetMember = await prisma.organizationMember.findFirst({
      where: { id: memberId, orgId },
      include: { user: { select: { email: true } } },
    })

    if (!targetMember) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 })
    }

    // Prevent demoting the last owner
    if (targetMember.role === 'OWNER' && role !== 'OWNER') {
      const ownerCount = await prisma.organizationMember.count({
        where: { orgId, role: 'OWNER' },
      })
      if (ownerCount <= 1) {
        return NextResponse.json({ error: 'Cannot remove the last owner' }, { status: 400 })
      }
    }

    // Update role
    const updated = await prisma.organizationMember.update({
      where: { id: memberId },
      data: { role },
      include: { user: { select: { id: true, name: true, email: true } } },
    })

    // Log audit event
    await logAuditEvent(createAuditEventFromRequest(request, {
      orgId,
      userId: session.user.id,
      action: 'update',
      resourceType: 'team_member',
      resourceId: memberId,
      metadata: { newRole: role, email: targetMember.user.email },
    }))

    return NextResponse.json({ member: updated })
  } catch (error) {
    console.error('PATCH /api/v1/team error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/v1/team - Remove team member
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const orgId = await getOrgId(request, session.user.id)
    if (!orgId) {
      return NextResponse.json({ error: 'No organization found' }, { status: 404 })
    }

    const membership = await getUserMembership(session.user.id, orgId)
    if (!membership) {
      return NextResponse.json({ error: 'Not a member of this organization' }, { status: 403 })
    }

    if (!hasPermission(membership.role, 'team:write')) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const memberId = searchParams.get('memberId')

    if (!memberId) {
      return NextResponse.json({ error: 'Member ID is required' }, { status: 400 })
    }

    // Check target member exists in org
    const targetMember = await prisma.organizationMember.findFirst({
      where: { id: memberId, orgId },
      include: { user: { select: { email: true } } },
    })

    if (!targetMember) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 })
    }

    // Prevent removing the last owner
    if (targetMember.role === 'OWNER') {
      const ownerCount = await prisma.organizationMember.count({
        where: { orgId, role: 'OWNER' },
      })
      if (ownerCount <= 1) {
        return NextResponse.json({ error: 'Cannot remove the last owner' }, { status: 400 })
      }
    }

    // Remove member
    await prisma.organizationMember.delete({
      where: { id: memberId },
    })

    // Log audit event
    await logAuditEvent(createAuditEventFromRequest(request, {
      orgId,
      userId: session.user.id,
      action: 'delete',
      resourceType: 'team_member',
      resourceId: memberId,
      metadata: { email: targetMember.user.email },
    }))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('DELETE /api/v1/team error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
