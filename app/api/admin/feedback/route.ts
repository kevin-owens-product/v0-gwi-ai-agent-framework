/**
 * @prompt-id forge-v4.1:feature:feedback-nps:002
 * @generated-at 2026-01-25T00:00:00Z
 * @model claude-opus-4-5
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { validateSuperAdminSession, hasSuperAdminPermission } from '@/lib/super-admin'
import { cookies } from 'next/headers'
import { FeedbackType, FeedbackStatus, FeedbackPriority } from '@prisma/client'

export async function GET(request: NextRequest) {
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

    // Parse query params
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100)
    const type = searchParams.get('type') as FeedbackType | null
    const status = searchParams.get('status') as FeedbackStatus | null
    const priority = searchParams.get('priority') as FeedbackPriority | null
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    const orgId = searchParams.get('orgId')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    // Build where clause
    const where: Record<string, unknown> = {}

    if (type) where.type = type
    if (status) where.status = status
    if (priority) where.priority = priority
    if (category) where.category = category
    if (orgId) where.orgId = orgId

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
      ]
    }

    if (startDate || endDate) {
      where.createdAt = {}
      if (startDate) (where.createdAt as Record<string, Date>).gte = new Date(startDate)
      if (endDate) (where.createdAt as Record<string, Date>).lte = new Date(endDate)
    }

    // Fetch feedback items with pagination
    const [feedbackItems, total] = await Promise.all([
      prisma.feedbackItem.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.feedbackItem.count({ where }),
    ])

    // Get stats for overview
    const [
      totalNew,
      totalUnderReview,
      totalInProgress,
      byType,
      bySentiment,
    ] = await Promise.all([
      prisma.feedbackItem.count({ where: { status: 'NEW' } }),
      prisma.feedbackItem.count({ where: { status: 'UNDER_REVIEW' } }),
      prisma.feedbackItem.count({ where: { status: 'IN_PROGRESS' } }),
      prisma.feedbackItem.groupBy({
        by: ['type'],
        _count: { id: true },
      }),
      prisma.feedbackItem.groupBy({
        by: ['sentiment'],
        _count: { id: true },
      }),
    ])

    return NextResponse.json({
      feedbackItems,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      stats: {
        totalNew,
        totalUnderReview,
        totalInProgress,
        byType: byType.reduce((acc, item) => {
          acc[item.type] = item._count.id
          return acc
        }, {} as Record<string, number>),
        bySentiment: bySentiment.reduce((acc, item) => {
          if (item.sentiment) acc[item.sentiment] = item._count.id
          return acc
        }, {} as Record<string, number>),
      },
    })
  } catch (error) {
    console.error('GET /api/admin/feedback error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
