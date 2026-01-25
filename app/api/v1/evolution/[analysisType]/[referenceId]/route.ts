import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getUserMembership, getValidatedOrgId } from '@/lib/tenant'
import { hasPermission } from '@/lib/permissions'
import {
  getAnalysisHistory,
  compareAnalysisWithPrevious,
  getMetricTrends,
  generateEvolutionExplanation,
  analysisEvolution,
  type AnalysisType,
} from '@/lib/analysis-evolution'

// Valid analysis types
const VALID_ANALYSIS_TYPES: AnalysisType[] = [
  'crosstab',
  'audience_insight',
  'brand_health',
  'market_analysis',
  'competitor_analysis',
  'trend_analysis',
]

// GET /api/v1/evolution/[analysisType]/[referenceId] - Get analysis evolution
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ analysisType: string; referenceId: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { analysisType, referenceId } = await params

    if (!VALID_ANALYSIS_TYPES.includes(analysisType as AnalysisType)) {
      return NextResponse.json(
        { error: `Invalid analysis type. Must be one of: ${VALID_ANALYSIS_TYPES.join(', ')}` },
        { status: 400 }
      )
    }

    const orgId = await getValidatedOrgId(request, session.user.id)
    if (!orgId) {
      return NextResponse.json({ error: 'Organization not found or access denied' }, { status: 404 })
    }

    const membership = await getUserMembership(session.user.id, orgId)
    if (!membership) {
      return NextResponse.json({ error: 'Not a member of this organization' }, { status: 403 })
    }

    if (!hasPermission(membership.role, 'insights:read')) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 })
    }

    // Parse query params
    const { searchParams } = new URL(request.url)
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100)
    const offset = parseInt(searchParams.get('offset') || '0')
    const periods = parseInt(searchParams.get('periods') || '12')
    const includeComparison = searchParams.get('includeComparison') !== 'false'
    const includeTrends = searchParams.get('includeTrends') !== 'false'

    // Get analysis history
    const { history, total } = await getAnalysisHistory(
      analysisType as AnalysisType,
      referenceId,
      { limit, offset }
    )

    let comparison = null
    let trends: Awaited<ReturnType<typeof getMetricTrends>> = []
    let explanation = null

    // Get comparison with previous version if requested
    if (includeComparison && history.length > 0) {
      comparison = await compareAnalysisWithPrevious(
        analysisType as AnalysisType,
        referenceId
      )

      // Generate explanation if comparison exists
      if (comparison) {
        explanation = await generateEvolutionExplanation(comparison)
      }
    }

    // Get metric trends if requested
    if (includeTrends && history.length > 0) {
      const latestMetrics = history[0]?.keyMetrics || {}
      const metricNames = Object.keys(latestMetrics)
      if (metricNames.length > 0) {
        trends = await getMetricTrends(
          analysisType as AnalysisType,
          referenceId,
          metricNames,
          periods
        )
      }
    }

    // Get confidence history
    const confidenceHistory = await analysisEvolution.getConfidenceHistory(
      analysisType as AnalysisType,
      referenceId,
      periods
    )

    return NextResponse.json({
      analysisType,
      referenceId,
      history,
      total,
      limit,
      offset,
      comparison,
      trends,
      explanation,
      confidenceHistory,
    })
  } catch (error) {
    console.error('GET /api/v1/evolution/[analysisType]/[referenceId] error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
