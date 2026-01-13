/**
 * Move Organization API
 *
 * POST /api/v1/hierarchy/move - Move an organization to a new parent
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getUserMembership } from '@/lib/tenant'
import { getOrgIdFromRequest } from '@/lib/shared-utils'
import { hasPermission } from '@/lib/permissions'
import { moveOrganization, isDescendantOf } from '@/lib/tenant-hierarchy'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id

    // Get current org from request (will be used to verify permissions)
    const currentOrgId = await getOrgIdFromRequest(request, userId)
    if (!currentOrgId) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 })
    }

    // Check membership in current org
    const membership = await getUserMembership(userId, currentOrgId)
    if (!membership) {
      return NextResponse.json({ error: 'Not a member of this organization' }, { status: 403 })
    }

    // Need hierarchy:move permission
    if (!hasPermission(membership.role, 'hierarchy:move') && !hasPermission(membership.role, 'hierarchy:manage')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // Parse request body
    const body = await request.json()
    const { orgId, newParentOrgId } = body

    if (!orgId) {
      return NextResponse.json(
        { error: 'orgId is required' },
        { status: 400 }
      )
    }

    // Verify the org to be moved exists
    const orgToMove = await prisma.organization.findUnique({
      where: { id: orgId },
      select: { id: true, parentOrgId: true, rootOrgId: true },
    })

    if (!orgToMove) {
      return NextResponse.json({ error: 'Organization to move not found' }, { status: 404 })
    }

    // User must have permission in the org being moved or its current parent
    // (either be a member of the org, its parent, or its root)
    const hasPermissionToMove = await checkMovePermissions(
      userId,
      orgId,
      currentOrgId,
      orgToMove.parentOrgId,
      orgToMove.rootOrgId
    )

    if (!hasPermissionToMove) {
      return NextResponse.json(
        { error: 'You do not have permission to move this organization' },
        { status: 403 }
      )
    }

    // If newParentOrgId is provided, verify user has permission there too
    if (newParentOrgId) {
      const newParent = await prisma.organization.findUnique({
        where: { id: newParentOrgId },
        select: { id: true, allowChildOrgs: true },
      })

      if (!newParent) {
        return NextResponse.json({ error: 'New parent organization not found' }, { status: 404 })
      }

      if (!newParent.allowChildOrgs) {
        return NextResponse.json(
          { error: 'New parent organization does not allow child organizations' },
          { status: 400 }
        )
      }

      // Check user has permission in new parent
      const newParentMembership = await getUserMembership(userId, newParentOrgId)
      if (!newParentMembership || !hasPermission(newParentMembership.role, 'hierarchy:write')) {
        // Also check if user is in ancestor of new parent
        const isInAncestor = await checkAncestorPermission(userId, newParentOrgId)
        if (!isInAncestor) {
          return NextResponse.json(
            { error: 'You do not have permission to add children to the new parent organization' },
            { status: 403 }
          )
        }
      }
    }

    // Perform the move
    const movedOrg = await moveOrganization(orgId, newParentOrgId, userId)

    return NextResponse.json({ data: movedOrg })
  } catch (error: any) {
    console.error('Move organization API error:', error)

    if (error.message?.includes('not found')) {
      return NextResponse.json({ error: error.message }, { status: 404 })
    }

    if (error.message?.includes('circular') || error.message?.includes('descendant')) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    if (error.message?.includes('Maximum hierarchy depth')) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * Check if user has permission to move an organization
 */
async function checkMovePermissions(
  userId: string,
  orgId: string,
  currentOrgId: string,
  parentOrgId: string | null,
  rootOrgId: string | null
): Promise<boolean> {
  // Check if user is in the org being moved with appropriate permissions
  const directMembership = await getUserMembership(userId, orgId)
  if (directMembership && hasPermission(directMembership.role, 'hierarchy:move')) {
    return true
  }

  // Check if user is in parent org with appropriate permissions
  if (parentOrgId) {
    const parentMembership = await getUserMembership(userId, parentOrgId)
    if (parentMembership && hasPermission(parentMembership.role, 'hierarchy:manage')) {
      return true
    }
  }

  // Check if user is in root org with appropriate permissions
  if (rootOrgId && rootOrgId !== parentOrgId) {
    const rootMembership = await getUserMembership(userId, rootOrgId)
    if (rootMembership && hasPermission(rootMembership.role, 'hierarchy:manage')) {
      return true
    }
  }

  // Check current org context
  if (currentOrgId !== orgId && currentOrgId !== parentOrgId && currentOrgId !== rootOrgId) {
    // Check if current org is an ancestor
    const isAncestor = await isDescendantOf(orgId, currentOrgId)
    if (isAncestor) {
      const membership = await getUserMembership(userId, currentOrgId)
      if (membership && hasPermission(membership.role, 'hierarchy:manage')) {
        return true
      }
    }
  }

  return false
}

/**
 * Check if user has permission through an ancestor org
 */
async function checkAncestorPermission(userId: string, orgId: string): Promise<boolean> {
  const org = await prisma.organization.findUnique({
    where: { id: orgId },
    select: { hierarchyPath: true },
  })

  if (!org) return false

  const ancestorIds = org.hierarchyPath.split('/').filter(Boolean)

  for (const ancestorId of ancestorIds) {
    const membership = await getUserMembership(userId, ancestorId)
    if (membership && hasPermission(membership.role, 'hierarchy:manage')) {
      return true
    }
  }

  return false
}
