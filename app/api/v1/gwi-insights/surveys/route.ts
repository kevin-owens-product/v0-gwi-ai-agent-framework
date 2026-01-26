import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { getValidatedOrgId } from '@/lib/tenant'

/**
 * GET /api/v1/gwi-insights/surveys
 * List surveys and their summary results for user's organization.
 * This is a read-only endpoint for end-users to view GWI-generated survey insights.
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get validated organization ID (validates user membership)
    const orgId = await getValidatedOrgId(request, session.user.id)

    if (!orgId) {
      return NextResponse.json(
        { error: 'Organization not found or access denied' },
        { status: 403 }
      )
    }

    // Parse query params
    const { searchParams } = new URL(request.url)
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100)
    const offset = parseInt(searchParams.get('offset') || '0')
    const status = searchParams.get('status')
    const search = searchParams.get('search')

    // Build where clause - scope to user's organization
    const where: Record<string, unknown> = { orgId }

    // Only show active/completed surveys to end users (not drafts)
    if (status) {
      where.status = status
    } else {
      // Default: exclude draft surveys from user view
      where.status = { in: ['ACTIVE', 'COMPLETED'] }
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ]
    }

    // Fetch surveys with summary data
    const [surveys, total] = await Promise.all([
      prisma.survey.findMany({
        where,
        select: {
          id: true,
          name: true,
          description: true,
          status: true,
          version: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              questions: true,
              responses: true,
              distributions: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit,
      }),
      prisma.survey.count({ where }),
    ])

    // Transform to user-friendly format with summary insights
    const surveysWithInsights = surveys.map((survey) => ({
      id: survey.id,
      name: survey.name,
      description: survey.description,
      status: formatStatus(survey.status),
      version: survey.version,
      createdAt: survey.createdAt,
      updatedAt: survey.updatedAt,
      summary: {
        totalQuestions: survey._count.questions,
        totalResponses: survey._count.responses,
        distributionChannels: survey._count.distributions,
        completionRate: survey._count.distributions > 0
          ? calculateCompletionRate(survey.id, survey._count.responses)
          : null,
      },
    }))

    return NextResponse.json({
      surveys: surveysWithInsights,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    })
  } catch (error) {
    console.error('GET /api/v1/gwi-insights/surveys error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * Format status for user-friendly display
 */
function formatStatus(status: string): string {
  const statusMap: Record<string, string> = {
    DRAFT: 'Draft',
    ACTIVE: 'Active',
    PAUSED: 'Paused',
    COMPLETED: 'Completed',
    ARCHIVED: 'Archived',
  }
  return statusMap[status] || status
}

/**
 * Placeholder for completion rate calculation
 * In a real implementation, this would query distribution targets vs completed
 */
function calculateCompletionRate(_surveyId: string, responses: number): number | null {
  // This is a simplified calculation - in production, we'd calculate based on
  // actual distribution targets vs completed responses
  if (responses === 0) return 0
  return null // Return null if we can't calculate
}
