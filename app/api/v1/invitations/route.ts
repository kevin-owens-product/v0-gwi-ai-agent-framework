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

const inviteSchema = z.object({
  email: z.string().email(),
  role: z.enum(['ADMIN', 'MEMBER', 'VIEWER']),
})

// GET /api/v1/invitations - List pending invitations
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

    const membership = await getUserMembership(session.user.id, orgId)
    if (!membership) {
      return NextResponse.json({ error: 'Not a member of this organization' }, { status: 403 })
    }

    // Fetch pending invitations
    const invitations = await prisma.invitation.findMany({
      where: { orgId, status: 'PENDING' },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ invitations })
  } catch (error) {
    console.error('GET /api/v1/invitations error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/v1/invitations - Send invitation
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
    const validation = inviteSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation error', details: validation.error.errors },
        { status: 400 }
      )
    }

    const { email, role } = validation.data

    // Check if user is already a member
    const existingUser = await prisma.user.findUnique({
      where: { email },
      include: {
        memberships: { where: { orgId } },
      },
    })

    if (existingUser?.memberships.length) {
      return NextResponse.json({ error: 'User is already a member' }, { status: 400 })
    }

    // Check for existing pending invitation
    const existingInvitation = await prisma.invitation.findFirst({
      where: { orgId, email, status: 'PENDING' },
    })

    if (existingInvitation) {
      return NextResponse.json({ error: 'Invitation already sent to this email' }, { status: 400 })
    }

    // Get organization details
    const organization = await prisma.organization.findUnique({
      where: { id: orgId },
      select: { name: true },
    })

    // Create invitation
    const token = randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days

    const invitation = await prisma.invitation.create({
      data: {
        orgId,
        email,
        role,
        token,
        expiresAt,
      },
    })

    // Send invitation email
    await sendInvitationEmail({
      to: email,
      inviterName: session.user.name || 'A team member',
      organizationName: organization?.name || 'the organization',
      inviteUrl: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/invite/${token}`,
    })

    // Log audit event
    await logAuditEvent(createAuditEventFromRequest(request, {
      orgId,
      userId: session.user.id,
      action: 'create',
      resourceType: 'invitation',
      resourceId: invitation.id,
      metadata: { email, role },
    }))

    return NextResponse.json({ invitation }, { status: 201 })
  } catch (error) {
    console.error('POST /api/v1/invitations error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/v1/invitations - Revoke invitation
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
    const invitationId = searchParams.get('id')

    if (!invitationId) {
      return NextResponse.json({ error: 'Invitation ID is required' }, { status: 400 })
    }

    // Check invitation exists
    const invitation = await prisma.invitation.findFirst({
      where: { id: invitationId, orgId },
    })

    if (!invitation) {
      return NextResponse.json({ error: 'Invitation not found' }, { status: 404 })
    }

    // Revoke invitation
    await prisma.invitation.update({
      where: { id: invitationId },
      data: { status: 'REVOKED' },
    })

    // Log audit event
    await logAuditEvent(createAuditEventFromRequest(request, {
      orgId,
      userId: session.user.id,
      action: 'delete',
      resourceType: 'invitation',
      resourceId: invitationId,
      metadata: { email: invitation.email },
    }))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('DELETE /api/v1/invitations error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
