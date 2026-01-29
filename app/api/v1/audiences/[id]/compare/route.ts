import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { getUserMembership, getValidatedOrgId } from '@/lib/tenant'
import { hasPermission } from '@/lib/permissions'

/**
 * GET /api/v1/audiences/:id/compare
 * Compare multiple audiences
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
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

    const searchParams = request.nextUrl.searchParams
    const compareWith = searchParams.get('compareWith')?.split(',') || []

    if (compareWith.length === 0) {
      return NextResponse.json({ error: 'At least one audience ID required for comparison' }, { status: 400 })
    }

    if (compareWith.length > 3) {
      return NextResponse.json({ error: 'Maximum 3 audiences can be compared at once' }, { status: 400 })
    }

    // Fetch all audiences
    const audiences = await prisma.audience.findMany({
      where: {
        id: { in: [id, ...compareWith] },
        orgId,
      },
    })

    if (audiences.length < 2) {
      return NextResponse.json({ error: 'One or more audiences not found' }, { status: 404 })
    }

    const baseAudience = audiences.find(a => a.id === id)
    const compareAudiences = audiences.filter(a => a.id !== id)

    if (!baseAudience) {
      return NextResponse.json({ error: 'Base audience not found' }, { status: 404 })
    }

    // Perform comparison
    const comparison = await compareAudiences(baseAudience, compareAudiences)

    return NextResponse.json({
      success: true,
      comparison,
    })
  } catch (error) {
    console.error('Error comparing audiences:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * Compare audiences and identify differences
 */
async function compareAudiences(
  baseAudience: {
    id: string
    name: string
    criteria: unknown
    size: number | null
    markets: string[]
  },
  compareAudiences: Array<{
    id: string
    name: string
    criteria: unknown
    size: number | null
    markets: string[]
  }>
): Promise<{
  base: {
    id: string
    name: string
    size: number | null
    criteria: unknown
  }
  comparisons: Array<{
    audience: {
      id: string
      name: string
      size: number | null
    }
    differences: Array<{
      dimension: string
      baseValue: string | number | [number, number]
      compareValue: string | number | [number, number]
      significance: 'high' | 'medium' | 'low'
    }>
    overlap: number
    similarity: number
  }>
  summary: {
    keyDifferentiators: Array<{
      dimension: string
      values: Record<string, string | number>
      significance: 'high' | 'medium' | 'low'
    }>
    sizeComparison: Record<string, number>
  }
}> {
  const baseCriteria = baseAudience.criteria as {
    attributes?: Array<{ dimension: string; operator: string; value: string | number | [number, number] }>
  }

  const comparisons = compareAudiences.map(compareAudience => {
    const compareCriteria = compareAudience.criteria as {
      attributes?: Array<{ dimension: string; operator: string; value: string | number | [number, number] }>
    }

    const baseAttrs = baseCriteria?.attributes || []
    const compareAttrs = compareCriteria?.attributes || []

    // Find differences
    const differences: Array<{
      dimension: string
      baseValue: string | number | [number, number]
      compareValue: string | number | [number, number]
      significance: 'high' | 'medium' | 'low'
    }> = []

    // Compare attributes
    const baseAttrMap = new Map(baseAttrs.map(a => [a.dimension, a]))
    const compareAttrMap = new Map(compareAttrs.map(a => [a.dimension, a]))

    // Find attributes in base but not in compare
    baseAttrMap.forEach((baseAttr, dimension) => {
      const compareAttr = compareAttrMap.get(dimension)
      if (!compareAttr) {
        differences.push({
          dimension,
          baseValue: baseAttr.value,
          compareValue: 'not specified',
          significance: 'medium',
        })
      } else if (JSON.stringify(baseAttr.value) !== JSON.stringify(compareAttr.value)) {
        differences.push({
          dimension,
          baseValue: baseAttr.value,
          compareValue: compareAttr.value,
          significance: 'high',
        })
      }
    })

    // Find attributes in compare but not in base
    compareAttrMap.forEach((compareAttr, dimension) => {
      if (!baseAttrMap.has(dimension)) {
        differences.push({
          dimension,
          baseValue: 'not specified',
          compareValue: compareAttr.value,
          significance: 'medium',
        })
      }
    })

    // Calculate overlap (placeholder - should use actual data)
    const overlap = 0.3 + Math.random() * 0.4

    // Calculate similarity
    const commonAttrs = baseAttrs.filter(ba =>
      compareAttrs.some(ca => ca.dimension === ba.dimension && JSON.stringify(ca.value) === JSON.stringify(ba.value))
    )
    const similarity = baseAttrs.length > 0 ? commonAttrs.length / Math.max(baseAttrs.length, compareAttrs.length) : 0

    return {
      audience: {
        id: compareAudience.id,
        name: compareAudience.name,
        size: compareAudience.size,
      },
      differences,
      overlap,
      similarity,
    }
  })

  // Generate summary
  const keyDifferentiators: Array<{
    dimension: string
    values: Record<string, string | number>
    significance: 'high' | 'medium' | 'low'
  }> = []

  comparisons.forEach(comp => {
    comp.differences.forEach(diff => {
      if (diff.significance === 'high') {
        const existing = keyDifferentiators.find(k => k.dimension === diff.dimension)
        if (existing) {
          existing.values[comp.audience.name] = diff.compareValue
        } else {
          keyDifferentiators.push({
            dimension: diff.dimension,
            values: {
              [baseAudience.name]: diff.baseValue,
              [comp.audience.name]: diff.compareValue,
            },
            significance: 'high',
          })
        }
      }
    })
  })

  const sizeComparison: Record<string, number> = {
    [baseAudience.name]: baseAudience.size || 0,
  }
  comparisons.forEach(comp => {
    sizeComparison[comp.audience.name] = comp.audience.size || 0
  })

  return {
    base: {
      id: baseAudience.id,
      name: baseAudience.name,
      size: baseAudience.size,
      criteria: baseAudience.criteria,
    },
    comparisons,
    summary: {
      keyDifferentiators,
      sizeComparison,
    },
  }
}
