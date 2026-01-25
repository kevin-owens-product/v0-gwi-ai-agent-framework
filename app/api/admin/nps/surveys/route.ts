/**
 * @prompt-id forge-v4.1:feature:feedback-nps:004
 * @generated-at 2026-01-25T00:00:00Z
 * @model claude-opus-4-5
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { validateSuperAdminSession, hasSuperAdminPermission } from '@/lib/super-admin'
import { cookies } from 'next/headers'

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

    if (!hasSuperAdminPermission(session.admin.role, 'nps:read')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Parse query params
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100)
    const isActive = searchParams.get('isActive')

    // Build where clause
    const where: Record<string, unknown> = {}
    if (isActive !== null && isActive !== undefined) {
      where.isActive = isActive === 'true'
    }

    // Fetch surveys with pagination
    const [surveys, total] = await Promise.all([
      prisma.nPSSurvey.findMany({
        where,
        include: {
          _count: {
            select: { responses: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.nPSSurvey.count({ where }),
    ])

    // Calculate overall NPS score across all surveys
    const allSurveys = await prisma.nPSSurvey.findMany({
      select: {
        promoters: true,
        passives: true,
        detractors: true,
        totalResponses: true,
      },
    })

    const totalResponses = allSurveys.reduce((acc, s) => acc + s.totalResponses, 0)
    const totalPromoters = allSurveys.reduce((acc, s) => acc + s.promoters, 0)
    const totalDetractors = allSurveys.reduce((acc, s) => acc + s.detractors, 0)
    const overallNpsScore = totalResponses > 0
      ? Math.round(((totalPromoters - totalDetractors) / totalResponses) * 100)
      : null

    return NextResponse.json({
      surveys,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      overallStats: {
        totalSurveys: total,
        totalResponses,
        overallNpsScore,
        totalPromoters,
        totalPassives: allSurveys.reduce((acc, s) => acc + s.passives, 0),
        totalDetractors,
      },
    })
  } catch (error) {
    console.error('GET /api/admin/nps/surveys error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
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

    const body = await request.json()
    const {
      name,
      description,
      question,
      followUpQuestion,
      targetType = 'ALL',
      targetOrgs = [],
      targetPlans = [],
      isActive = true,
      startDate,
      endDate,
    } = body

    // Validate required fields
    if (!name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      )
    }

    // Validate target type
    const validTargetTypes = ['ALL', 'SPECIFIC_ORGS', 'SPECIFIC_PLANS']
    if (!validTargetTypes.includes(targetType)) {
      return NextResponse.json(
        { error: 'Invalid target type' },
        { status: 400 }
      )
    }

    // Create survey
    const survey = await prisma.nPSSurvey.create({
      data: {
        name,
        description,
        question: question || 'How likely are you to recommend us to a friend or colleague?',
        followUpQuestion,
        targetType,
        targetOrgs,
        targetPlans,
        isActive,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        metadata: {},
      },
    })

    return NextResponse.json({ survey })
  } catch (error) {
    console.error('POST /api/admin/nps/surveys error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
