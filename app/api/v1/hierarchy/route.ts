/**
 * Organization Hierarchy API
 *
 * GET /api/v1/hierarchy - Get hierarchy tree for current organization
 * GET /api/v1/hierarchy?orgId=xxx - Get hierarchy tree for specific org
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getUserMembership } from '@/lib/tenant'
import { getOrgIdFromRequest } from '@/lib/shared-utils'
import { hasPermission } from '@/lib/permissions'
import {
  getHierarchyTree,
  getAncestors,
  getDescendants,
  getHierarchyStats,
  getAccessibleOrganizations,
  getEffectivePermissions,
} from '@/lib/tenant-hierarchy'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id
    const searchParams = request.nextUrl.searchParams
    const view = searchParams.get('view') || 'tree' // tree, ancestors, descendants, stats, accessible

    // Get org from request
    const orgId = await getOrgIdFromRequest(request, userId)
    if (!orgId) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 })
    }

    // Check membership
    const membership = await getUserMembership(userId, orgId)
    if (!membership) {
      return NextResponse.json({ error: 'Not a member of this organization' }, { status: 403 })
    }

    // Check hierarchy read permission
    if (!hasPermission(membership.role, 'hierarchy:read')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    switch (view) {
      case 'tree': {
        const maxDepth = parseInt(searchParams.get('maxDepth') || '10', 10)
        const tree = await getHierarchyTree(orgId, maxDepth)
        return NextResponse.json({ data: tree })
      }

      case 'ancestors': {
        const ancestors = await getAncestors(orgId)
        return NextResponse.json({ data: ancestors })
      }

      case 'descendants': {
        const maxDepth = searchParams.get('maxDepth')
          ? parseInt(searchParams.get('maxDepth')!, 10)
          : undefined
        const orgTypes = searchParams.get('orgTypes')?.split(',') as any[] | undefined

        const descendants = await getDescendants(orgId, { maxDepth, orgTypes })
        return NextResponse.json({ data: descendants })
      }

      case 'stats': {
        const stats = await getHierarchyStats(orgId)
        return NextResponse.json({ data: stats })
      }

      case 'accessible': {
        const accessible = await getAccessibleOrganizations(userId)
        return NextResponse.json({ data: accessible })
      }

      case 'permissions': {
        const targetOrgId = searchParams.get('targetOrgId') || orgId
        const permissions = await getEffectivePermissions(userId, targetOrgId)
        return NextResponse.json({ data: permissions })
      }

      default:
        return NextResponse.json({ error: 'Invalid view parameter' }, { status: 400 })
    }
  } catch (error) {
    console.error('Hierarchy API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
