import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { cookies } from 'next/headers'
import { getUserMembership } from '@/lib/tenant'
import { hasPermission, type Permission } from '@/lib/permissions'
import { compareEntityVersions, type VersionedEntityType } from '@/lib/change-tracking'

// Helper to get org ID from header or cookies
async function getOrgId(request: NextRequest, userId: string): Promise<string | null> {
  const headerOrgId = request.headers.get('x-organization-id')
  if (headerOrgId) return headerOrgId

  const cookieStore = await cookies()
  const memberships = await prisma.organizationMember.findMany({
    where: { userId },
    include: { organization: true },
    orderBy: { joinedAt: 'asc' },
  })

  if (memberships.length === 0) return null
  return cookieStore.get('currentOrgId')?.value || memberships[0].organization.id
}

// Valid entity types
const VALID_ENTITY_TYPES: VersionedEntityType[] = [
  'audience',
  'crosstab',
  'insight',
  'chart',
  'report',
  'dashboard',
  'brand_tracking',
]

// Map entity types to permission keys
const ENTITY_TYPE_PERMISSIONS: Record<VersionedEntityType, Permission> = {
  audience: 'audiences:read',
  crosstab: 'crosstabs:read',
  insight: 'insights:read',
  chart: 'charts:read',
  report: 'reports:read',
  dashboard: 'dashboards:read',
  brand_tracking: 'brand-tracking:read',
}

// GET /api/v1/versions/[entityType]/[entityId]/compare - Compare two versions
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ entityType: string; entityId: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { entityType, entityId } = await params

    if (!VALID_ENTITY_TYPES.includes(entityType as VersionedEntityType)) {
      return NextResponse.json(
        { error: `Invalid entity type. Must be one of: ${VALID_ENTITY_TYPES.join(', ')}` },
        { status: 400 }
      )
    }

    const orgId = await getOrgId(request, session.user.id)
    if (!orgId) {
      return NextResponse.json({ error: 'No organization found' }, { status: 404 })
    }

    const membership = await getUserMembership(session.user.id, orgId)
    if (!membership) {
      return NextResponse.json({ error: 'Not a member of this organization' }, { status: 403 })
    }

    const permissionKey = ENTITY_TYPE_PERMISSIONS[entityType as VersionedEntityType]
    if (!hasPermission(membership.role, permissionKey)) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 })
    }

    // Parse query params
    const { searchParams } = new URL(request.url)
    const v1Str = searchParams.get('v1')
    const v2Str = searchParams.get('v2')

    if (!v1Str || !v2Str) {
      return NextResponse.json(
        { error: 'Both v1 and v2 query parameters are required' },
        { status: 400 }
      )
    }

    const v1 = parseInt(v1Str)
    const v2 = parseInt(v2Str)

    if (isNaN(v1) || isNaN(v2)) {
      return NextResponse.json(
        { error: 'v1 and v2 must be valid version numbers' },
        { status: 400 }
      )
    }

    const comparison = await compareEntityVersions(
      entityType as VersionedEntityType,
      entityId,
      v1,
      v2
    )

    if (!comparison) {
      return NextResponse.json(
        { error: 'One or both versions not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(comparison)
  } catch (error) {
    console.error('GET /api/v1/versions/[entityType]/[entityId]/compare error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
