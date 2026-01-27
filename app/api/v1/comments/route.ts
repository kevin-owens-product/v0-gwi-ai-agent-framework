import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { getValidatedOrgId, getUserMembership } from '@/lib/tenant'
import { logAuditEvent, createAuditEventFromRequest } from '@/lib/audit'
import { recordUsage } from '@/lib/billing'
import { createCommentSchema } from '@/lib/schemas/collaboration'

export async function GET(request: NextRequest) {
  try {
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

    // Parse query params
    const { searchParams } = new URL(request.url)
    const entityType = searchParams.get('entityType')
    const entityId = searchParams.get('entityId')
    const parentId = searchParams.get('parentId')
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100)
    const offset = parseInt(searchParams.get('offset') || '0')

    if (!entityType || !entityId) {
      return NextResponse.json(
        { error: 'entityType and entityId are required query parameters' },
        { status: 400 }
      )
    }

    // Build where clause
    const where: any = {
      orgId,
      entityType,
      entityId,
    }

    // If parentId is explicitly null, fetch root comments only
    if (parentId === 'null' || parentId === '') {
      where.parentId = null
    } else if (parentId) {
      where.parentId = parentId
    }

    // Fetch comments with user info and reply counts
    const [comments, total] = await Promise.all([
      prisma.comment.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              avatarUrl: true,
            },
          },
          _count: {
            select: { replies: true },
          },
        },
        orderBy: { createdAt: 'asc' },
        skip: offset,
        take: limit,
      }),
      prisma.comment.count({ where }),
    ])

    recordUsage(orgId, 'API_CALLS', 1).catch(console.error)

    return NextResponse.json({
      data: comments,
      total,
      limit,
      offset,
    })
  } catch (error) {
    console.error('GET /api/v1/comments error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
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

    const body = await request.json()
    const validationResult = createCommentSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation error', details: validationResult.error.errors },
        { status: 400 }
      )
    }

    const { entityType, entityId, content, parentId, mentions } = validationResult.data

    // If parentId is provided, verify it exists and belongs to the same entity
    if (parentId) {
      const parentComment = await prisma.comment.findFirst({
        where: {
          id: parentId,
          orgId,
          entityType,
          entityId,
        },
      })

      if (!parentComment) {
        return NextResponse.json(
          { error: 'Parent comment not found' },
          { status: 404 }
        )
      }
    }

    const comment = await prisma.comment.create({
      data: {
        orgId,
        userId: session.user.id,
        entityType,
        entityId,
        content,
        parentId: parentId || null,
        mentions,
      },
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

    await logAuditEvent(createAuditEventFromRequest(request, {
      orgId,
      userId: session.user.id,
      action: 'create',
      resourceType: 'comment',
      resourceId: comment.id,
      metadata: { entityType, entityId, parentId },
    }))

    recordUsage(orgId, 'API_CALLS', 1).catch(console.error)

    return NextResponse.json({ data: comment }, { status: 201 })
  } catch (error) {
    console.error('POST /api/v1/comments error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
