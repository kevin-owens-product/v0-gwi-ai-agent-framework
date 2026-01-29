import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { getUserMembership, getValidatedOrgId } from '@/lib/tenant'
import { hasPermission } from '@/lib/permissions'

/**
 * POST /api/v1/audiences/lookalike
 * Generate lookalike audiences based on source audience
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

    if (!hasPermission(membership.role, 'audiences:write')) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 })
    }

    const body = await request.json()
    const { sourceAudienceId, similarityThreshold, excludeOverlap } = body

    if (!sourceAudienceId) {
      return NextResponse.json({ error: 'Source audience ID is required' }, { status: 400 })
    }

    // Fetch source audience
    const sourceAudience = await prisma.audience.findFirst({
      where: {
        id: sourceAudienceId,
        orgId,
      },
    })

    if (!sourceAudience) {
      return NextResponse.json({ error: 'Source audience not found' }, { status: 404 })
    }

    // Generate lookalike audience
    const lookalike = await generateLookalikeAudience(
      sourceAudience,
      similarityThreshold || 0.05, // Default 5% similarity
      excludeOverlap !== false
    )

    return NextResponse.json({
      success: true,
      lookalike: {
        criteria: lookalike.criteria,
        estimatedSize: lookalike.estimatedSize,
        similarity: lookalike.similarity,
        overlap: lookalike.overlap,
        differentiators: lookalike.differentiators,
      },
    })
  } catch (error) {
    console.error('Error generating lookalike audience:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * Generate lookalike audience based on source audience characteristics
 * TODO: Integrate with ML model for actual lookalike generation
 */
async function generateLookalikeAudience(
  sourceAudience: {
    id: string
    name: string
    criteria: unknown
    markets: string[]
  },
  similarityThreshold: number,
  excludeOverlap: boolean
): Promise<{
  criteria: unknown
  estimatedSize: number
  similarity: number
  overlap: number
  differentiators: Array<{ dimension: string; sourceValue: string; lookalikeValue: string; reason: string }>
}> {
  const sourceCriteria = sourceAudience.criteria as {
    attributes?: Array<{ dimension: string; operator: string; value: string | number | [number, number] }>
  }

  const attributes = sourceCriteria?.attributes || []
  
  // Generate lookalike by slightly modifying criteria
  // In production, this would use ML to find similar users who don't match current criteria
  const lookalikeAttributes = attributes.map(attr => {
    if (attr.dimension === 'age' && attr.operator === 'between' && Array.isArray(attr.value)) {
      const [min, max] = attr.value as [number, number]
      const range = max - min
      // Shift age range slightly
      return {
        ...attr,
        value: [min + Math.floor(range * 0.2), max + Math.floor(range * 0.2)] as [number, number],
      }
    }
    
    if (attr.dimension === 'income' && typeof attr.value === 'number') {
      // Adjust income range slightly
      return {
        ...attr,
        value: Math.floor(attr.value * 0.9),
      }
    }
    
    // For other attributes, keep similar but not identical values
    return attr
  })

  // Add some variation to create "lookalike" effect
  // In production, this would be based on behavioral similarity analysis
  const differentiators: Array<{ dimension: string; sourceValue: string; lookalikeValue: string; reason: string }> = []
  
  if (attributes.some(a => a.dimension === 'interests')) {
    differentiators.push({
      dimension: 'interests',
      sourceValue: 'primary_interest',
      lookalikeValue: 'related_interest',
      reason: 'Similar but distinct interest profile',
    })
  }

  // Estimate size (lookalike audiences are typically larger)
  const baseSize = 1000000
  const reductionFactor = Math.pow(0.75, lookalikeAttributes.length)
  const estimatedSize = Math.floor(baseSize * reductionFactor * 1.2) // 20% larger than source

  // Calculate similarity (placeholder - should use actual ML model)
  const similarity = 0.85 - (similarityThreshold * 10) // Inverse relationship

  // Estimate overlap (placeholder)
  const overlap = excludeOverlap ? 0.15 : 0.25

  return {
    criteria: {
      attributes: lookalikeAttributes,
      logic: 'AND',
    },
    estimatedSize,
    similarity,
    overlap,
    differentiators,
  }
}
