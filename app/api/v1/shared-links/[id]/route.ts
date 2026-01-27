import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { getValidatedOrgId, getUserMembership } from '@/lib/tenant'
import { hasPermission } from '@/lib/permissions'
import { logAuditEvent, createAuditEventFromRequest } from '@/lib/audit'
import { recordUsage } from '@/lib/billing'
import { updateSharedLinkSchema } from '@/lib/schemas/collaboration'
import bcrypt from 'bcryptjs'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const orgId = await getValidatedOrgId(request, session.user.id)
    if (!orgId) {
      return NextResponse.json({ error: 'Organization not found or access denied' }, { status: 404 })
    }

    const membership = await getUserMembership(session.user.id, orgId)
    if (!membership) {
      return NextResponse.json({ error: 'Not a member of this organization' }, { status: 403 })
    }

    if (!hasPermission(membership.role, 'sharing:read')) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 })
    }

    const sharedLink = await prisma.sharedLink.findFirst({
      where: { id, orgId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
          },
        },
        views: {
          orderBy: { viewedAt: 'desc' },
          take: 50,
        },
        _count: {
          select: { views: true },
        },
      },
    })

    if (!sharedLink) {
      return NextResponse.json({ error: 'Shared link not found' }, { status: 404 })
    }

    // Build the shareable URL
    const baseUrl = process.env.NEXTAUTH_URL || process.env.RENDER_EXTERNAL_URL || 'http://localhost:3000'
    const shareUrl = `${baseUrl}/shared/${sharedLink.token}`

    recordUsage(orgId, 'API_CALLS', 1).catch(console.error)

    return NextResponse.json({
      data: {
        ...sharedLink,
        hasPassword: !!sharedLink.password,
        password: undefined,
        shareUrl,
      },
    })
  } catch (error) {
    console.error('GET /api/v1/shared-links/[id] error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const orgId = await getValidatedOrgId(request, session.user.id)
    if (!orgId) {
      return NextResponse.json({ error: 'Organization not found or access denied' }, { status: 404 })
    }

    const membership = await getUserMembership(session.user.id, orgId)
    if (!membership) {
      return NextResponse.json({ error: 'Not a member of this organization' }, { status: 403 })
    }

    if (!hasPermission(membership.role, 'sharing:write')) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 })
    }

    const existingLink = await prisma.sharedLink.findFirst({
      where: { id, orgId },
    })

    if (!existingLink) {
      return NextResponse.json({ error: 'Shared link not found' }, { status: 404 })
    }

    // Only allow the creator or admin to modify the link
    if (existingLink.userId !== session.user.id) {
      if (!hasPermission(membership.role, 'sharing:manage')) {
        return NextResponse.json(
          { error: 'Only the creator or admin can modify this link' },
          { status: 403 }
        )
      }
    }

    const body = await request.json()
    const validationResult = updateSharedLinkSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation error', details: validationResult.error.errors },
        { status: 400 }
      )
    }

    const { password, expiresAt, maxViews, allowedEmails, permissions, isActive } = validationResult.data

    const updateData: any = {}

    // Handle password update
    if (password !== undefined) {
      if (password === null) {
        updateData.password = null
      } else {
        updateData.password = await bcrypt.hash(password, 12)
      }
    }

    if (expiresAt !== undefined) {
      updateData.expiresAt = expiresAt ? new Date(expiresAt) : null
    }

    if (maxViews !== undefined) {
      updateData.maxViews = maxViews
    }

    if (allowedEmails !== undefined) {
      updateData.allowedEmails = allowedEmails
    }

    if (permissions !== undefined) {
      updateData.permissions = permissions
    }

    if (isActive !== undefined) {
      updateData.isActive = isActive
    }

    const sharedLink = await prisma.sharedLink.update({
      where: { id },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
          },
        },
      },
    })

    // Build the shareable URL
    const baseUrl = process.env.NEXTAUTH_URL || process.env.RENDER_EXTERNAL_URL || 'http://localhost:3000'
    const shareUrl = `${baseUrl}/shared/${sharedLink.token}`

    await logAuditEvent(createAuditEventFromRequest(request, {
      orgId,
      userId: session.user.id,
      action: 'update',
      resourceType: 'shared_link',
      resourceId: id,
      metadata: validationResult.data,
    }))

    recordUsage(orgId, 'API_CALLS', 1).catch(console.error)

    return NextResponse.json({
      data: {
        ...sharedLink,
        hasPassword: !!sharedLink.password,
        password: undefined,
        shareUrl,
      },
    })
  } catch (error) {
    console.error('PATCH /api/v1/shared-links/[id] error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const orgId = await getValidatedOrgId(request, session.user.id)
    if (!orgId) {
      return NextResponse.json({ error: 'Organization not found or access denied' }, { status: 404 })
    }

    const membership = await getUserMembership(session.user.id, orgId)
    if (!membership) {
      return NextResponse.json({ error: 'Not a member of this organization' }, { status: 403 })
    }

    if (!hasPermission(membership.role, 'sharing:delete')) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 })
    }

    const existingLink = await prisma.sharedLink.findFirst({
      where: { id, orgId },
    })

    if (!existingLink) {
      return NextResponse.json({ error: 'Shared link not found' }, { status: 404 })
    }

    // Only allow the creator or admin to delete the link
    if (existingLink.userId !== session.user.id) {
      if (!hasPermission(membership.role, 'sharing:manage')) {
        return NextResponse.json(
          { error: 'Only the creator or admin can delete this link' },
          { status: 403 }
        )
      }
    }

    // Delete the shared link (cascades to views)
    await prisma.sharedLink.delete({ where: { id } })

    await logAuditEvent(createAuditEventFromRequest(request, {
      orgId,
      userId: session.user.id,
      action: 'delete',
      resourceType: 'shared_link',
      resourceId: id,
    }))

    recordUsage(orgId, 'API_CALLS', 1).catch(console.error)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('DELETE /api/v1/shared-links/[id] error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
