import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { hasPermission, canManageRole } from '@/lib/permissions'

/**
 * PUT /api/v1/organization/team/members/[id]
 * Update member role
 */
export async function PUT(
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
    const currentMember = await prisma.organizationMember.findFirst({
      where: { userId: session.user.id, organizationId: orgId },
    })

    if (!currentMember || !hasPermission(currentMember.role, 'team:change-role')) {
      return NextResponse.json(
        { error: 'You do not have permission to change member roles' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { role } = body

    if (!role || !['OWNER', 'ADMIN', 'MEMBER', 'VIEWER'].includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role' },
        { status: 400 }
      )
    }

    // Get target member
    const targetMember = await prisma.organizationMember.findUnique({
      where: { id },
    })

    if (!targetMember || targetMember.organizationId !== orgId) {
      return NextResponse.json(
        { error: 'Member not found' },
        { status: 404 }
      )
    }

    // Check if current user can manage target role
    if (!canManageRole(currentMember.role, targetMember.role)) {
      return NextResponse.json(
        { error: 'You cannot manage this member' },
        { status: 403 }
      )
    }

    // Update role
    const updatedMember = await prisma.organizationMember.update({
      where: { id },
      data: { role },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    // Log action
    await prisma.auditLog.create({
      data: {
        action: 'MEMBER_ROLE_CHANGED',
        entityType: 'ORGANIZATION_MEMBER',
        entityId: id,
        userId: session.user.id,
        organizationId: orgId,
        metadata: {
          targetUserId: targetMember.userId,
          oldRole: targetMember.role,
          newRole: role,
        },
      },
    })

    return NextResponse.json(updatedMember)
  } catch (error) {
    console.error('Error updating member role:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/v1/organization/team/members/[id]
 * Remove member from organization
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
    const currentMember = await prisma.organizationMember.findFirst({
      where: { userId: session.user.id, organizationId: orgId },
    })

    if (!currentMember || !hasPermission(currentMember.role, 'team:remove')) {
      return NextResponse.json(
        { error: 'You do not have permission to remove members' },
        { status: 403 }
      )
    }

    // Get target member
    const targetMember = await prisma.organizationMember.findUnique({
      where: { id },
    })

    if (!targetMember || targetMember.organizationId !== orgId) {
      return NextResponse.json(
        { error: 'Member not found' },
        { status: 404 }
      )
    }

    // Can't remove yourself
    if (targetMember.userId === session.user.id) {
      return NextResponse.json(
        { error: 'You cannot remove yourself' },
        { status: 400 }
      )
    }

    // Check if current user can manage target role
    if (!canManageRole(currentMember.role, targetMember.role)) {
      return NextResponse.json(
        { error: 'You cannot remove this member' },
        { status: 403 }
      )
    }

    // Remove member
    await prisma.organizationMember.delete({
      where: { id },
    })

    // Log action
    await prisma.auditLog.create({
      data: {
        action: 'MEMBER_REMOVED',
        entityType: 'ORGANIZATION_MEMBER',
        entityId: id,
        userId: session.user.id,
        organizationId: orgId,
        metadata: {
          targetUserId: targetMember.userId,
          role: targetMember.role,
        },
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error removing member:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
