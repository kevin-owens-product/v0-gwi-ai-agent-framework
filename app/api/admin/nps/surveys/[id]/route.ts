/**
 * @prompt-id forge-v4.1:feature:feedback-nps:005
 * @generated-at 2026-01-25T00:00:00Z
 * @model claude-opus-4-5
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { validateSuperAdminSession, hasSuperAdminPermission } from '@/lib/super-admin'
import { cookies } from 'next/headers'

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

    if (!hasSuperAdminPermission(session.admin.role, 'nps:read')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await params

    // Parse query params for response pagination
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100)
    const category = searchParams.get('category')

    const survey = await prisma.nPSSurvey.findUnique({
      where: { id },
    })

    if (!survey) {
      return NextResponse.json({ error: 'Survey not found' }, { status: 404 })
    }

    // Build where clause for responses
    const responseWhere: Record<string, unknown> = { surveyId: id }
    if (category) responseWhere.category = category

    // Get responses with pagination
    const [responses, totalResponses] = await Promise.all([
      prisma.nPSResponse.findMany({
        where: responseWhere,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
            },
          },
        },
        orderBy: { respondedAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.nPSResponse.count({ where: responseWhere }),
    ])

    // Get score distribution
    const scoreDistribution = await prisma.nPSResponse.groupBy({
      by: ['score'],
      where: { surveyId: id },
      _count: { id: true },
    })

    // Get responses over time (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    const responsesOverTime = await prisma.nPSResponse.groupBy({
      by: ['category'],
      where: {
        surveyId: id,
        respondedAt: { gte: thirtyDaysAgo },
      },
      _count: { id: true },
    })

    return NextResponse.json({
      survey,
      responses,
      totalResponses,
      page,
      totalPages: Math.ceil(totalResponses / limit),
      analytics: {
        scoreDistribution: scoreDistribution.reduce((acc, item) => {
          acc[item.score] = item._count.id
          return acc
        }, {} as Record<number, number>),
        responsesOverTime: responsesOverTime.reduce((acc, item) => {
          acc[item.category] = item._count.id
          return acc
        }, {} as Record<string, number>),
        npsScore: survey.npsScore ? Number(survey.npsScore) : null,
        responseRate: {
          promoters: survey.promoters,
          passives: survey.passives,
          detractors: survey.detractors,
        },
      },
    })
  } catch (error) {
    console.error('GET /api/admin/nps/surveys/[id] error:', error)
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

    if (!hasSuperAdminPermission(session.admin.role, 'nps:write')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await params
    const body = await request.json()
    const {
      name,
      description,
      question,
      followUpQuestion,
      targetType,
      targetOrgs,
      targetPlans,
      isActive,
      startDate,
      endDate,
    } = body

    // Validate target type if provided
    if (targetType) {
      const validTargetTypes = ['ALL', 'SPECIFIC_ORGS', 'SPECIFIC_PLANS']
      if (!validTargetTypes.includes(targetType)) {
        return NextResponse.json(
          { error: 'Invalid target type' },
          { status: 400 }
        )
      }
    }

    // Build update data
    const updateData: Record<string, unknown> = {}
    if (name !== undefined) updateData.name = name
    if (description !== undefined) updateData.description = description
    if (question !== undefined) updateData.question = question
    if (followUpQuestion !== undefined) updateData.followUpQuestion = followUpQuestion
    if (targetType !== undefined) updateData.targetType = targetType
    if (targetOrgs !== undefined) updateData.targetOrgs = targetOrgs
    if (targetPlans !== undefined) updateData.targetPlans = targetPlans
    if (isActive !== undefined) updateData.isActive = isActive
    if (startDate !== undefined) updateData.startDate = startDate ? new Date(startDate) : null
    if (endDate !== undefined) updateData.endDate = endDate ? new Date(endDate) : null

    const survey = await prisma.nPSSurvey.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json({ survey })
  } catch (error) {
    console.error('PATCH /api/admin/nps/surveys/[id] error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  _request: NextRequest,
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

    if (!hasSuperAdminPermission(session.admin.role, 'nps:write')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await params

    // Delete survey (responses will be cascade deleted due to schema)
    await prisma.nPSSurvey.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('DELETE /api/admin/nps/surveys/[id] error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
