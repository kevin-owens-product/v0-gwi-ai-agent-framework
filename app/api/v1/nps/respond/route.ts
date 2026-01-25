/**
 * @prompt-id forge-v4.1:feature:feedback-nps:006
 * @generated-at 2026-01-25T00:00:00Z
 * @model claude-opus-4-5
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { cookies } from 'next/headers'
import { NPSCategory } from '@prisma/client'

function getNpsCategory(score: number): NPSCategory {
  if (score >= 9) return 'PROMOTER'
  if (score >= 7) return 'PASSIVE'
  return 'DETRACTOR'
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    // Get current organization
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
      surveyId,
      score,
      feedback,
      followUpResponse,
    } = body

    // Validate required fields
    if (!surveyId) {
      return NextResponse.json(
        { error: 'Survey ID is required' },
        { status: 400 }
      )
    }

    if (score === undefined || score === null) {
      return NextResponse.json(
        { error: 'Score is required' },
        { status: 400 }
      )
    }

    // Validate score range
    if (typeof score !== 'number' || score < 0 || score > 10) {
      return NextResponse.json(
        { error: 'Score must be a number between 0 and 10' },
        { status: 400 }
      )
    }

    // Check if survey exists and is active
    const survey = await prisma.nPSSurvey.findUnique({
      where: { id: surveyId },
    })

    if (!survey) {
      return NextResponse.json(
        { error: 'Survey not found' },
        { status: 404 }
      )
    }

    if (!survey.isActive) {
      return NextResponse.json(
        { error: 'Survey is not active' },
        { status: 400 }
      )
    }

    // Check date range
    const now = new Date()
    if (survey.startDate && now < survey.startDate) {
      return NextResponse.json(
        { error: 'Survey has not started yet' },
        { status: 400 }
      )
    }
    if (survey.endDate && now > survey.endDate) {
      return NextResponse.json(
        { error: 'Survey has ended' },
        { status: 400 }
      )
    }

    // Check if user already responded (if logged in)
    if (userId) {
      const existingResponse = await prisma.nPSResponse.findFirst({
        where: {
          surveyId,
          userId,
        },
      })

      if (existingResponse) {
        return NextResponse.json(
          { error: 'You have already responded to this survey' },
          { status: 400 }
        )
      }
    }

    // Determine category
    const category = getNpsCategory(score)

    // Create response and update survey stats in a transaction
    const [npsResponse] = await prisma.$transaction([
      prisma.nPSResponse.create({
        data: {
          surveyId,
          userId,
          orgId,
          score,
          feedback,
          followUpResponse,
          category,
          metadata: {},
        },
      }),
      prisma.nPSSurvey.update({
        where: { id: surveyId },
        data: {
          totalResponses: { increment: 1 },
          ...(category === 'PROMOTER' && { promoters: { increment: 1 } }),
          ...(category === 'PASSIVE' && { passives: { increment: 1 } }),
          ...(category === 'DETRACTOR' && { detractors: { increment: 1 } }),
        },
      }),
    ])

    // Calculate and update NPS score
    const updatedSurvey = await prisma.nPSSurvey.findUnique({
      where: { id: surveyId },
    })

    if (updatedSurvey && updatedSurvey.totalResponses > 0) {
      const npsScore = ((updatedSurvey.promoters - updatedSurvey.detractors) / updatedSurvey.totalResponses) * 100
      await prisma.nPSSurvey.update({
        where: { id: surveyId },
        data: { npsScore },
      })
    }

    return NextResponse.json({
      success: true,
      response: {
        id: npsResponse.id,
        score: npsResponse.score,
        category: npsResponse.category,
        respondedAt: npsResponse.respondedAt,
      },
    })
  } catch (error) {
    console.error('POST /api/v1/nps/respond error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
