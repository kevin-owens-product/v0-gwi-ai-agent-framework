import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getUserMembership, getValidatedOrgId } from '@/lib/tenant'
import { hasPermission } from '@/lib/permissions'

/**
 * POST /api/v1/audiences/estimate
 * Real-time audience size estimation
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const orgId = await getValidatedOrgId(request, session.user.id)
    if (!orgId) {
      return NextResponse.json({ error: 'No organization found' }, { status: 404 })
    }

    const membership = await getUserMembership(session.user.id, orgId)
    if (!membership) {
      return NextResponse.json({ error: 'Not a member of this organization' }, { status: 403 })
    }

    if (!hasPermission(membership.role, 'audiences:read')) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 })
    }

    const body = await request.json()
    const { criteria, markets } = body

    if (!criteria) {
      return NextResponse.json({ error: 'Criteria is required' }, { status: 400 })
    }

    // Estimate audience size based on criteria
    const estimation = await estimateAudienceSize(criteria, markets || ['Global'])

    return NextResponse.json({
      success: true,
      estimatedSize: estimation.totalSize,
      marketBreakdown: estimation.marketBreakdown,
      confidence: estimation.confidence,
      sampleSize: estimation.sampleSize,
      validation: estimation.validation,
    })
  } catch (error) {
    console.error('Error estimating audience size:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * Estimate audience size based on criteria
 * TODO: Integrate with actual GWI Platform API for real estimates
 */
async function estimateAudienceSize(
  criteria: {
    attributes?: Array<{ dimension: string; operator: string; value: string | number | [number, number] }>
    filters?: unknown
    logic?: 'AND' | 'OR'
  },
  markets: string[]
): Promise<{
  totalSize: number
  marketBreakdown: Record<string, { size: number; percentage: number }>
  confidence: number
  sampleSize: number
  validation: {
    isValid: boolean
    warnings: string[]
    errors: string[]
  }
}> {
  const baseSize = 1000000
  const attributes = criteria.attributes || []
  
  // Calculate reduction factor based on number of criteria
  // More criteria = smaller audience
  const reductionFactor = Math.pow(0.7, attributes.length)
  
  // Adjust based on operator types (AND logic reduces more than OR)
  const logicMultiplier = criteria.logic === 'OR' ? 0.9 : 0.7
  
  // Calculate base estimate
  const baseEstimate = baseSize * reductionFactor * logicMultiplier
  
  // Add some randomness for demo (should be replaced with actual API call)
  const variance = 0.8 + Math.random() * 0.4
  const totalSize = Math.floor(baseEstimate * variance)
  
  // Market breakdown
  const marketBreakdown: Record<string, { size: number; percentage: number }> = {}
  const marketPercentages: Record<string, number> = {
    Global: 1.0,
    US: 0.25,
    UK: 0.05,
    DE: 0.08,
    FR: 0.07,
    JP: 0.12,
    AU: 0.03,
    CA: 0.04,
  }
  
  markets.forEach(market => {
    const percentage = marketPercentages[market] || 0.02
    marketBreakdown[market] = {
      size: Math.floor(totalSize * percentage),
      percentage: percentage * 100,
    }
  })
  
  // Calculate confidence based on criteria specificity
  let confidence = 0.7
  if (attributes.length === 0) {
    confidence = 0.5
  } else if (attributes.length <= 2) {
    confidence = 0.8
  } else if (attributes.length <= 4) {
    confidence = 0.75
  } else {
    confidence = 0.65 // Too many criteria may reduce accuracy
  }
  
  // Sample size calculation (for statistical validity)
  // Using standard sample size formula: n = (Z^2 * p * (1-p)) / E^2
  // Z = 1.96 for 95% confidence, E = 0.05 for 5% margin of error
  const zScore = 1.96
  const marginOfError = 0.05
  const proportion = 0.5 // Conservative estimate
  const sampleSize = Math.ceil((zScore * zScore * proportion * (1 - proportion)) / (marginOfError * marginOfError))
  
  // Validation
  const validation = {
    isValid: true,
    warnings: [] as string[],
    errors: [] as string[],
  }
  
  if (totalSize < 1000) {
    validation.warnings.push('Audience size is very small. Consider broadening criteria.')
  }
  
  if (totalSize > 50000000) {
    validation.warnings.push('Audience size is very large. Consider adding more specific criteria.')
  }
  
  if (attributes.length === 0) {
    validation.warnings.push('No criteria specified. Audience will include all users.')
  }
  
  if (sampleSize > totalSize) {
    validation.errors.push('Required sample size exceeds estimated audience size.')
    validation.isValid = false
  }
  
  return {
    totalSize,
    marketBreakdown,
    confidence,
    sampleSize,
    validation,
  }
}
