import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { getUserMembership, getValidatedOrgId } from '@/lib/tenant'
import { hasPermission } from '@/lib/permissions'

/**
 * GET /api/v1/audiences/:id/overlap
 * Analyze overlap between audiences (Venn diagram data)
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
      return NextResponse.json({ error: 'At least one audience ID required for overlap analysis' }, { status: 400 })
    }

    if (compareWith.length > 2) {
      return NextResponse.json({ error: 'Maximum 2 audiences can be compared for overlap (3 total)' }, { status: 400 })
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

    // Calculate overlap
    const overlap = await calculateAudienceOverlap(baseAudience, compareAudiences)

    return NextResponse.json({
      success: true,
      overlap,
    })
  } catch (error) {
    console.error('Error calculating audience overlap:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * Calculate overlap between audiences
 * Returns data suitable for Venn diagram visualization
 */
async function calculateAudienceOverlap(
  baseAudience: {
    id: string
    name: string
    criteria: unknown
    size: number | null
  },
  compareAudiences: Array<{
    id: string
    name: string
    criteria: unknown
    size: number | null
  }>
): Promise<{
  audiences: Array<{
    id: string
    name: string
    size: number
  }>
  overlaps: Array<{
    audienceIds: string[]
    size: number
    percentage: number
    label: string
  }>
  vennData: {
    sets: Array<{ id: string; label: string; size: number }>
    intersections: Array<{
      sets: string[]
      size: number
      label: string
    }>
  }
  recommendations: Array<{
    type: 'combine' | 'exclude' | 'refine'
    message: string
    audiences: string[]
  }>
}> {
  const baseSize = baseAudience.size || 1000000
  const compareSizes = compareAudiences.map(a => a.size || 1000000)

  // Calculate overlap percentages (placeholder - should use actual data)
  // For 2 audiences: A only, B only, A∩B
  // For 3 audiences: A only, B only, C only, A∩B, A∩C, B∩C, A∩B∩C

  const audiences = [
    { id: baseAudience.id, name: baseAudience.name, size: baseSize },
    ...compareAudiences.map(a => ({ id: a.id, name: a.name, size: a.size || 1000000 })),
  ]

  if (compareAudiences.length === 1) {
    // 2-audience overlap
    const overlapSize = Math.floor(baseSize * 0.25) // 25% overlap (placeholder)
    const aOnly = baseSize - overlapSize
    const bOnly = compareSizes[0] - overlapSize
    const total = aOnly + bOnly + overlapSize

    const overlaps = [
      {
        audienceIds: [baseAudience.id],
        size: aOnly,
        percentage: (aOnly / total) * 100,
        label: `${baseAudience.name} only`,
      },
      {
        audienceIds: [compareAudiences[0].id],
        size: bOnly,
        percentage: (bOnly / total) * 100,
        label: `${compareAudiences[0].name} only`,
      },
      {
        audienceIds: [baseAudience.id, compareAudiences[0].id],
        size: overlapSize,
        percentage: (overlapSize / total) * 100,
        label: `${baseAudience.name} ∩ ${compareAudiences[0].name}`,
      },
    ]

    const recommendations: Array<{
      type: 'combine' | 'exclude' | 'refine'
      message: string
      audiences: string[]
    }> = []

    if (overlapSize / baseSize > 0.5) {
      recommendations.push({
        type: 'combine',
        message: 'High overlap detected. Consider combining these audiences.',
        audiences: [baseAudience.id, compareAudiences[0].id],
      })
    } else if (overlapSize / baseSize < 0.1) {
      recommendations.push({
        type: 'exclude',
        message: 'Low overlap. These audiences are largely distinct.',
        audiences: [baseAudience.id, compareAudiences[0].id],
      })
    }

    return {
      audiences,
      overlaps,
      vennData: {
        sets: audiences,
        intersections: overlaps.map(o => ({
          sets: o.audienceIds,
          size: o.size,
          label: o.label,
        })),
      },
      recommendations,
    }
  } else {
    // 3-audience overlap (simplified)
    const overlapSize = Math.floor(baseSize * 0.15) // 15% three-way overlap
    const aOnly = Math.floor(baseSize * 0.4)
    const bOnly = Math.floor(compareSizes[0] * 0.4)
    const cOnly = Math.floor(compareSizes[1] * 0.4)
    const abOnly = Math.floor(baseSize * 0.1)
    const acOnly = Math.floor(baseSize * 0.1)
    const bcOnly = Math.floor(compareSizes[0] * 0.1)

    const overlaps = [
      { audienceIds: [baseAudience.id], size: aOnly, percentage: (aOnly / (aOnly + bOnly + cOnly + abOnly + acOnly + bcOnly + overlapSize)) * 100, label: `${baseAudience.name} only` },
      { audienceIds: [compareAudiences[0].id], size: bOnly, percentage: (bOnly / (aOnly + bOnly + cOnly + abOnly + acOnly + bcOnly + overlapSize)) * 100, label: `${compareAudiences[0].name} only` },
      { audienceIds: [compareAudiences[1].id], size: cOnly, percentage: (cOnly / (aOnly + bOnly + cOnly + abOnly + acOnly + bcOnly + overlapSize)) * 100, label: `${compareAudiences[1].name} only` },
      { audienceIds: [baseAudience.id, compareAudiences[0].id], size: abOnly, percentage: (abOnly / (aOnly + bOnly + cOnly + abOnly + acOnly + bcOnly + overlapSize)) * 100, label: `${baseAudience.name} ∩ ${compareAudiences[0].name}` },
      { audienceIds: [baseAudience.id, compareAudiences[1].id], size: acOnly, percentage: (acOnly / (aOnly + bOnly + cOnly + abOnly + acOnly + bcOnly + overlapSize)) * 100, label: `${baseAudience.name} ∩ ${compareAudiences[1].name}` },
      { audienceIds: [compareAudiences[0].id, compareAudiences[1].id], size: bcOnly, percentage: (bcOnly / (aOnly + bOnly + cOnly + abOnly + acOnly + bcOnly + overlapSize)) * 100, label: `${compareAudiences[0].name} ∩ ${compareAudiences[1].name}` },
      { audienceIds: [baseAudience.id, compareAudiences[0].id, compareAudiences[1].id], size: overlapSize, percentage: (overlapSize / (aOnly + bOnly + cOnly + abOnly + acOnly + bcOnly + overlapSize)) * 100, label: `${baseAudience.name} ∩ ${compareAudiences[0].name} ∩ ${compareAudiences[1].name}` },
    ]

    return {
      audiences,
      overlaps,
      vennData: {
        sets: audiences,
        intersections: overlaps.map(o => ({
          sets: o.audienceIds,
          size: o.size,
          label: o.label,
        })),
      },
      recommendations: [],
    }
  }
}
