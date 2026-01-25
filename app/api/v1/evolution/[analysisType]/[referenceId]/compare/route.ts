import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getUserMembership, getValidatedOrgId } from '@/lib/tenant'
import { hasPermission } from '@/lib/permissions'
import {
  analysisEvolution,
  generateEvolutionExplanation,
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

// GET /api/v1/evolution/[analysisType]/[referenceId]/compare - Compare analysis versions
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
    const fromVersionStr = searchParams.get('from')
    const toVersionStr = searchParams.get('to')
    const includeExplanation = searchParams.get('includeExplanation') !== 'false'

    let comparison

    // If versions specified, compare specific versions
    if (fromVersionStr && toVersionStr) {
      const fromVersion = parseInt(fromVersionStr)
      const toVersion = parseInt(toVersionStr)

      if (isNaN(fromVersion) || isNaN(toVersion)) {
        return NextResponse.json(
          { error: 'from and to must be valid version numbers' },
          { status: 400 }
        )
      }

      comparison = await analysisEvolution.compareVersions(
        analysisType as AnalysisType,
        referenceId,
        fromVersion,
        toVersion
      )
    } else {
      // Compare with previous version
      comparison = await analysisEvolution.compareWithPrevious(
        analysisType as AnalysisType,
        referenceId
      )
    }

    if (!comparison) {
      return NextResponse.json(
        { error: 'Unable to compare versions. Ensure both versions exist.' },
        { status: 404 }
      )
    }

    // Generate explanation if requested
    let explanation = null
    if (includeExplanation) {
      explanation = await generateEvolutionExplanation(comparison)
    }

    return NextResponse.json({
      comparison,
      explanation,
    })
  } catch (error) {
    console.error('GET /api/v1/evolution/[analysisType]/[referenceId]/compare error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
