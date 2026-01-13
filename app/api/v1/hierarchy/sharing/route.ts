/**
 * Resource Sharing API
 *
 * GET /api/v1/hierarchy/sharing - Get shared resources (both shared by and shared with)
 * POST /api/v1/hierarchy/sharing - Share a resource with another organization
 * DELETE /api/v1/hierarchy/sharing - Revoke shared access
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getUserMembership } from '@/lib/tenant'
import { getOrgIdFromRequest } from '@/lib/shared-utils'
import { hasPermission, canShareResources } from '@/lib/permissions'
import {
  shareResource,
  revokeResourceAccess,
  getAccessibleResources,
} from '@/lib/tenant-hierarchy'
import type { SharedResourceType, ResourceSharingScope } from '@prisma/client'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id
    const searchParams = request.nextUrl.searchParams

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

    // Check sharing read permission
    if (!hasPermission(membership.role, 'sharing:read')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const view = searchParams.get('view') || 'accessible' // accessible, shared, all
    const resourceType = searchParams.get('resourceType') as SharedResourceType | undefined

    if (view === 'accessible') {
      // Resources shared WITH this organization
      const accessible = await getAccessibleResources(orgId, resourceType)
      return NextResponse.json({ data: accessible })
    }

    if (view === 'shared') {
      // Resources shared BY this organization
      const shared = await prisma.sharedResourceAccess.findMany({
        where: {
          ownerOrgId: orgId,
          isActive: true,
          ...(resourceType && { resourceType }),
        },
        include: {
          targetOrg: {
            select: {
              id: true,
              name: true,
              slug: true,
              orgType: true,
            },
          },
        },
      })

      return NextResponse.json({ data: shared })
    }

    // view === 'all' - both directions
    const [accessible, shared] = await Promise.all([
      getAccessibleResources(orgId, resourceType),
      prisma.sharedResourceAccess.findMany({
        where: {
          ownerOrgId: orgId,
          isActive: true,
          ...(resourceType && { resourceType }),
        },
        include: {
          targetOrg: {
            select: {
              id: true,
              name: true,
              slug: true,
              orgType: true,
            },
          },
        },
      }),
    ])

    return NextResponse.json({
      data: {
        accessibleResources: accessible,
        sharedResources: shared,
      },
    })
  } catch (error) {
    console.error('Get sharing API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id

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

    // Check sharing write permission
    if (!canShareResources(membership.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // Parse request body
    const body = await request.json()
    const {
      targetOrgId,
      resourceType,
      resourceId,
      accessLevel,
      canView,
      canEdit,
      canDelete,
      canShare,
      propagateToChildren,
      expiresAt,
    } = body

    // Validate required fields
    if (!targetOrgId || !resourceType || !accessLevel) {
      return NextResponse.json(
        { error: 'targetOrgId, resourceType, and accessLevel are required' },
        { status: 400 }
      )
    }

    // Validate resource type
    const validResourceTypes: SharedResourceType[] = [
      'TEMPLATE',
      'AUDIENCE',
      'DATA_SOURCE',
      'BRAND_TRACKING',
      'WORKFLOW',
      'AGENT',
      'CHART',
      'ALL',
    ]

    if (!validResourceTypes.includes(resourceType)) {
      return NextResponse.json(
        { error: 'Invalid resource type' },
        { status: 400 }
      )
    }

    // Validate access level
    const validAccessLevels: ResourceSharingScope[] = [
      'NONE',
      'READ_ONLY',
      'FULL_ACCESS',
      'INHERIT',
    ]

    if (!validAccessLevels.includes(accessLevel)) {
      return NextResponse.json(
        { error: 'Invalid access level' },
        { status: 400 }
      )
    }

    // If resourceId is provided, verify the resource exists and belongs to this org
    if (resourceId) {
      const resourceExists = await verifyResourceOwnership(orgId, resourceType, resourceId)
      if (!resourceExists) {
        return NextResponse.json(
          { error: 'Resource not found or does not belong to this organization' },
          { status: 404 }
        )
      }
    }

    // Create sharing access
    const result = await shareResource({
      ownerOrgId: orgId,
      targetOrgId,
      resourceType,
      resourceId,
      accessLevel,
      canView: canView ?? true,
      canEdit: canEdit ?? false,
      canDelete: canDelete ?? false,
      canShare: canShare ?? false,
      propagateToChildren: propagateToChildren ?? false,
      expiresAt: expiresAt ? new Date(expiresAt) : undefined,
      grantedBy: userId,
    })

    return NextResponse.json({ data: result }, { status: 201 })
  } catch (error: any) {
    console.error('Create sharing API error:', error)

    if (error.message?.includes('not found')) {
      return NextResponse.json({ error: error.message }, { status: 404 })
    }

    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'This resource is already shared with the target organization' },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id

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

    // Check sharing delete permission
    if (!hasPermission(membership.role, 'sharing:delete') && !canShareResources(membership.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // Get accessId from query params
    const searchParams = request.nextUrl.searchParams
    const accessId = searchParams.get('accessId')

    if (!accessId) {
      return NextResponse.json(
        { error: 'accessId is required' },
        { status: 400 }
      )
    }

    // Verify the shared access belongs to this org
    const sharedAccess = await prisma.sharedResourceAccess.findUnique({
      where: { id: accessId },
    })

    if (!sharedAccess) {
      return NextResponse.json({ error: 'Shared access not found' }, { status: 404 })
    }

    if (sharedAccess.ownerOrgId !== orgId) {
      return NextResponse.json(
        { error: 'You can only revoke sharing from your own organization' },
        { status: 403 }
      )
    }

    await revokeResourceAccess(accessId, userId)

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Delete sharing API error:', error)

    if (error.message?.includes('not found')) {
      return NextResponse.json({ error: error.message }, { status: 404 })
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * Helper function to verify resource ownership
 */
async function verifyResourceOwnership(
  orgId: string,
  resourceType: SharedResourceType,
  resourceId: string
): Promise<boolean> {
  const modelMap: Record<SharedResourceType, string> = {
    TEMPLATE: 'template',
    AUDIENCE: 'audience',
    DATA_SOURCE: 'dataSource',
    BRAND_TRACKING: 'brandTracking',
    WORKFLOW: 'workflow',
    AGENT: 'agent',
    CHART: 'chart',
    ALL: '', // Special case - not applicable
  }

  if (resourceType === 'ALL') {
    return false // Cannot share a specific resource with type 'ALL'
  }

  const model = modelMap[resourceType]
  if (!model) return false

  try {
    const resource = await (prisma as any)[model].findFirst({
      where: {
        id: resourceId,
        orgId,
      },
    })
    return !!resource
  } catch {
    return false
  }
}
