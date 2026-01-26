import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { getValidatedOrgId } from '@/lib/tenant'

/**
 * GET /api/v1/gwi-insights/pipelines
 * List pipeline run results for user's organization.
 * Returns pipeline status, last run date, and output summary.
 * This is a read-only endpoint for end-users to view pipeline insights.
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
    const type = searchParams.get('type')
    const isActive = searchParams.get('isActive')

    // Build where clause - scope to user's organization
    const where: Record<string, unknown> = { orgId }

    if (type) {
      where.type = type
    }

    if (isActive !== null && isActive !== undefined) {
      where.isActive = isActive === 'true'
    }

    // Fetch pipelines with their latest run
    const [pipelines, total] = await Promise.all([
      prisma.dataPipeline.findMany({
        where,
        select: {
          id: true,
          name: true,
          description: true,
          type: true,
          schedule: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
          runs: {
            select: {
              id: true,
              status: true,
              startedAt: true,
              completedAt: true,
              recordsProcessed: true,
              recordsFailed: true,
              metrics: true,
            },
            orderBy: { startedAt: 'desc' },
            take: 1,
          },
          _count: {
            select: {
              runs: true,
              validationRules: true,
            },
          },
        },
        orderBy: { updatedAt: 'desc' },
        skip: offset,
        take: limit,
      }),
      prisma.dataPipeline.count({ where }),
    ])

    // Transform to user-friendly format with run summaries
    const pipelinesWithInsights = pipelines.map((pipeline) => {
      const lastRun = pipeline.runs[0] || null

      return {
        id: pipeline.id,
        name: pipeline.name,
        description: pipeline.description,
        type: formatPipelineType(pipeline.type),
        schedule: pipeline.schedule,
        isActive: pipeline.isActive,
        status: getPipelineStatus(pipeline.isActive, lastRun),
        createdAt: pipeline.createdAt,
        updatedAt: pipeline.updatedAt,
        lastRun: lastRun ? {
          id: lastRun.id,
          status: formatRunStatus(lastRun.status),
          startedAt: lastRun.startedAt,
          completedAt: lastRun.completedAt,
          duration: calculateDuration(lastRun.startedAt, lastRun.completedAt),
          summary: {
            recordsProcessed: lastRun.recordsProcessed || 0,
            recordsFailed: lastRun.recordsFailed || 0,
            successRate: calculateSuccessRate(
              lastRun.recordsProcessed,
              lastRun.recordsFailed
            ),
          },
        } : null,
        stats: {
          totalRuns: pipeline._count.runs,
          validationRules: pipeline._count.validationRules,
        },
      }
    })

    return NextResponse.json({
      pipelines: pipelinesWithInsights,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    })
  } catch (error) {
    console.error('GET /api/v1/gwi-insights/pipelines error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * Format pipeline type for user-friendly display
 */
function formatPipelineType(type: string): string {
  const typeMap: Record<string, string> = {
    ETL: 'Data Extract/Load',
    TRANSFORMATION: 'Data Transformation',
    AGGREGATION: 'Data Aggregation',
    EXPORT: 'Data Export',
    SYNC: 'Data Sync',
  }
  return typeMap[type] || type
}

/**
 * Format run status for user-friendly display
 */
function formatRunStatus(status: string): string {
  const statusMap: Record<string, string> = {
    PENDING: 'Pending',
    RUNNING: 'Running',
    COMPLETED: 'Completed',
    FAILED: 'Failed',
    CANCELLED: 'Cancelled',
  }
  return statusMap[status] || status
}

/**
 * Get overall pipeline status based on activity and last run
 */
function getPipelineStatus(
  isActive: boolean,
  lastRun: { status: string } | null
): string {
  if (!isActive) return 'Inactive'
  if (!lastRun) return 'Never Run'

  switch (lastRun.status) {
    case 'RUNNING':
      return 'Running'
    case 'FAILED':
      return 'Last Run Failed'
    case 'COMPLETED':
      return 'Healthy'
    default:
      return 'Ready'
  }
}

/**
 * Calculate duration between start and end times
 */
function calculateDuration(
  startedAt: Date,
  completedAt: Date | null
): string | null {
  if (!completedAt) return null

  const durationMs = new Date(completedAt).getTime() - new Date(startedAt).getTime()
  const seconds = Math.floor(durationMs / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)

  if (hours > 0) {
    return `${hours}h ${minutes % 60}m`
  } else if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`
  } else {
    return `${seconds}s`
  }
}

/**
 * Calculate success rate as a percentage
 */
function calculateSuccessRate(
  processed: number | null,
  failed: number | null
): number | null {
  if (processed === null || processed === 0) return null
  const failedCount = failed || 0
  const successCount = processed - failedCount
  return Math.round((successCount / processed) * 100)
}
