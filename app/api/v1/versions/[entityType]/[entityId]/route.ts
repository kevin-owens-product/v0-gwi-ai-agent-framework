import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getValidatedOrgId, getUserMembership } from '@/lib/tenant'
import { hasPermission, type Permission } from '@/lib/permissions'
import {
  getEntityVersionHistory,
  compareEntityVersions,
  type VersionedEntityType,
} from '@/lib/change-tracking'

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

// GET /api/v1/versions/[entityType]/[entityId] - Get version history
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

    const orgId = await getValidatedOrgId(request, session.user.id)
    if (!orgId) {
      return NextResponse.json({ error: 'No organization access' }, { status: 403 })
    }

    const membership = await getUserMembership(session.user.id, orgId)
    if (!membership) {
      return NextResponse.json({ error: 'Not a member of this organization' }, { status: 403 })
    }

    // Check permission based on entity type
    const permissionKey = ENTITY_TYPE_PERMISSIONS[entityType as VersionedEntityType]
    if (!hasPermission(membership.role, permissionKey)) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 })
    }

    // Parse query params
    const { searchParams } = new URL(request.url)
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100)
    const offset = parseInt(searchParams.get('offset') || '0')
    const beforeStr = searchParams.get('before')
    const afterStr = searchParams.get('after')

    const options: { limit: number; offset: number; before?: Date; after?: Date } = {
      limit,
      offset,
    }

    if (beforeStr) options.before = new Date(beforeStr)
    if (afterStr) options.after = new Date(afterStr)

    const { versions, total } = await getEntityVersionHistory(
      entityType as VersionedEntityType,
      entityId,
      options
    )

    return NextResponse.json({
      entityType,
      entityId,
      versions,
      total,
      limit,
      offset,
    })
  } catch (error) {
    console.error('GET /api/v1/versions/[entityType]/[entityId] error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
