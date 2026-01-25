/**
 * @prompt-id forge-v4.1:feature:feedback-nps:001
 * @generated-at 2026-01-25T00:00:00Z
 * @model claude-opus-4-5
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    // Get current organization (optional for anonymous feedback)
    const cookieStore = await cookies()
    let orgId: string | null = null
    let userId: string | null = null

    if (session?.user?.id) {
      userId = session.user.id
      const memberships = await prisma.organizationMember.findMany({
        where: { userId: session.user.id },
        include: { organization: true },
        orderBy: { joinedAt: 'asc' },
      })

      if (memberships.length > 0) {
        orgId = cookieStore.get('currentOrgId')?.value || memberships[0].organization.id
      }
    }

    const body = await request.json()
    const {
      type,
      category,
      title,
      content,
      rating,
      source = 'in_app',
      pageUrl,
    } = body

    // Validate required fields
    if (!type || !content) {
      return NextResponse.json(
        { error: 'Type and content are required' },
        { status: 400 }
      )
    }

    // Validate type enum
    const validTypes = ['BUG_REPORT', 'FEATURE_REQUEST', 'GENERAL', 'COMPLAINT', 'PRAISE', 'NPS']
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: 'Invalid feedback type' },
        { status: 400 }
      )
    }

    // Validate rating if provided
    if (rating !== undefined && (rating < 1 || rating > 5)) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 }
      )
    }

    // Determine sentiment based on rating if provided
    let sentiment: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE' | null = null
    if (rating !== undefined) {
      if (rating >= 4) sentiment = 'POSITIVE'
      else if (rating >= 3) sentiment = 'NEUTRAL'
      else sentiment = 'NEGATIVE'
    }

    // Get user agent from request
    const userAgent = request.headers.get('user-agent') || undefined

    // Create feedback item
    const feedbackItem = await prisma.feedbackItem.create({
      data: {
        orgId,
        userId,
        type,
        category,
        title,
        content,
        rating,
        sentiment,
        source,
        pageUrl,
        userAgent,
        status: 'NEW',
        priority: 'MEDIUM',
        metadata: {},
      },
    })

    return NextResponse.json({
      success: true,
      feedback: {
        id: feedbackItem.id,
        type: feedbackItem.type,
        status: feedbackItem.status,
        createdAt: feedbackItem.createdAt,
      },
    })
  } catch (error) {
    console.error('POST /api/v1/feedback error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
