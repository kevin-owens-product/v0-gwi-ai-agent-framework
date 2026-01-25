/**
 * @prompt-id forge-v4.1:feature:feedback-nps:003
 * @generated-at 2026-01-25T00:00:00Z
 * @model claude-opus-4-5
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { validateSuperAdminSession, hasSuperAdminPermission } from '@/lib/super-admin'
import { cookies } from 'next/headers'
import { FeedbackStatus, FeedbackPriority } from '@prisma/client'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('adminToken')?.value

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const session = await validateSuperAdminSession(token)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!hasSuperAdminPermission(session.admin.role, 'feedback:read')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await params

    const feedbackItem = await prisma.feedbackItem.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            image: true,
          },
        },
      },
    })

    if (!feedbackItem) {
      return NextResponse.json({ error: 'Feedback not found' }, { status: 404 })
    }

    // Get related feedback from same user/org
    const relatedFeedback = await prisma.feedbackItem.findMany({
      where: {
        id: { not: id },
        OR: [
          { userId: feedbackItem.userId },
          { orgId: feedbackItem.orgId },
        ].filter(Boolean),
      },
      select: {
        id: true,
        type: true,
        title: true,
        status: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
    })

    return NextResponse.json({
      feedbackItem,
      relatedFeedback,
    })
  } catch (error) {
    console.error('GET /api/admin/feedback/[id] error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('adminToken')?.value

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const session = await validateSuperAdminSession(token)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!hasSuperAdminPermission(session.admin.role, 'feedback:write')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await params
    const body = await request.json()
    const {
      status,
      priority,
      assignedTo,
      responseContent,
      tags,
      isPublic,
    } = body

    // Validate status
    if (status) {
      const validStatuses = ['NEW', 'UNDER_REVIEW', 'PLANNED', 'IN_PROGRESS', 'COMPLETED', 'WONT_DO', 'DUPLICATE']
      if (!validStatuses.includes(status)) {
        return NextResponse.json(
          { error: 'Invalid status' },
          { status: 400 }
        )
      }
    }

    // Validate priority
    if (priority) {
      const validPriorities = ['LOW', 'MEDIUM', 'HIGH', 'URGENT']
      if (!validPriorities.includes(priority)) {
        return NextResponse.json(
          { error: 'Invalid priority' },
          { status: 400 }
        )
      }
    }

    // Build update data
    const updateData: Record<string, unknown> = {}
    if (status !== undefined) updateData.status = status as FeedbackStatus
    if (priority !== undefined) updateData.priority = priority as FeedbackPriority
    if (assignedTo !== undefined) updateData.assignedTo = assignedTo
    if (tags !== undefined) updateData.tags = tags
    if (isPublic !== undefined) updateData.isPublic = isPublic

    // Handle response
    if (responseContent !== undefined) {
      updateData.responseContent = responseContent
      updateData.respondedAt = new Date()
    }

    const feedbackItem = await prisma.feedbackItem.update({
      where: { id },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    })

    return NextResponse.json({ feedbackItem })
  } catch (error) {
    console.error('PATCH /api/admin/feedback/[id] error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
