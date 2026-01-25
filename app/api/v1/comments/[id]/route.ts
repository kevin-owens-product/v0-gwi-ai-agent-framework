import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { getValidatedOrgId, getUserMembership } from '@/lib/tenant'
import { hasPermission } from '@/lib/permissions'
import { logAuditEvent, createAuditEventFromRequest } from '@/lib/audit'
import { recordUsage } from '@/lib/billing'
import { updateCommentSchema } from '@/lib/schemas/collaboration'

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

    const comment = await prisma.comment.findFirst({
      where: { id, orgId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        replies: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
              },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    })

    if (!comment) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 })
    }

    recordUsage(orgId, 'API_CALLS', 1).catch(console.error)

    return NextResponse.json({ data: comment })
  } catch (error) {
    console.error('GET /api/v1/comments/[id] error:', error)
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

    const existingComment = await prisma.comment.findFirst({
      where: { id, orgId },
    })

    if (!existingComment) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 })
    }

    const body = await request.json()
    const validationResult = updateCommentSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation error', details: validationResult.error.errors },
        { status: 400 }
      )
    }

    const { content, isResolved } = validationResult.data

    // Only allow editing content if you're the author
    if (content !== undefined && existingComment.userId !== session.user.id) {
      // Allow admins to edit
      if (!hasPermission(membership.role, 'admin:*')) {
        return NextResponse.json(
          { error: 'Only the author can edit comment content' },
          { status: 403 }
        )
      }
    }

    const updateData: any = {}

    if (content !== undefined) {
      updateData.content = content
    }

    if (isResolved !== undefined) {
      updateData.isResolved = isResolved
      if (isResolved) {
        updateData.resolvedBy = session.user.id
        updateData.resolvedAt = new Date()
      } else {
        updateData.resolvedBy = null
        updateData.resolvedAt = null
      }
    }

    const comment = await prisma.comment.update({
      where: { id },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    })

    await logAuditEvent(createAuditEventFromRequest(request, {
      orgId,
      userId: session.user.id,
      action: 'update',
      resourceType: 'comment',
      resourceId: id,
      metadata: validationResult.data,
    }))

    recordUsage(orgId, 'API_CALLS', 1).catch(console.error)

    return NextResponse.json({ data: comment })
  } catch (error) {
    console.error('PATCH /api/v1/comments/[id] error:', error)
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

    const existingComment = await prisma.comment.findFirst({
      where: { id, orgId },
    })

    if (!existingComment) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 })
    }

    // Only allow deleting if you're the author or an admin
    if (existingComment.userId !== session.user.id) {
      if (!hasPermission(membership.role, 'admin:*')) {
        return NextResponse.json(
          { error: 'Only the author or admin can delete this comment' },
          { status: 403 }
        )
      }
    }

    // Delete the comment (cascades to replies due to schema)
    await prisma.comment.delete({ where: { id } })

    await logAuditEvent(createAuditEventFromRequest(request, {
      orgId,
      userId: session.user.id,
      action: 'delete',
      resourceType: 'comment',
      resourceId: id,
    }))

    recordUsage(orgId, 'API_CALLS', 1).catch(console.error)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('DELETE /api/v1/comments/[id] error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
