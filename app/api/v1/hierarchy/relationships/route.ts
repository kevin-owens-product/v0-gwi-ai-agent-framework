/**
 * Organization Relationships API
 *
 * GET /api/v1/hierarchy/relationships - Get relationships for current organization
 * POST /api/v1/hierarchy/relationships - Create a new relationship
 * PATCH /api/v1/hierarchy/relationships - Update relationship status
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { getUserMembership } from '@/lib/tenant'
import { getOrgIdFromRequest } from '@/lib/shared-utils'
import { hasPermission, canManageRelationships } from '@/lib/permissions'
import {
  createOrgRelationship,
  updateRelationshipStatus,
  getOrgRelationships,
} from '@/lib/tenant-hierarchy'
import type {
  OrgRelationshipType,
  RelationshipStatus,
  ResourceSharingScope,
  BillingRelationship,
} from '@prisma/client'

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

    // Check relationships read permission
    if (!hasPermission(membership.role, 'relationships:read')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // Parse filters
    const direction = searchParams.get('direction') as 'from' | 'to' | 'both' | undefined
    const types = searchParams.get('types')?.split(',') as OrgRelationshipType[] | undefined
    const status = searchParams.get('status')?.split(',') as RelationshipStatus[] | undefined

    const relationships = await getOrgRelationships(orgId, { direction, types, status })

    return NextResponse.json({ data: relationships })
  } catch (error) {
    console.error('Get relationships API error:', error)
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

    // Check relationships write permission
    if (!canManageRelationships(membership.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // Parse request body
    const body = await request.json()
    const {
      toOrgId,
      relationshipType,
      accessLevel,
      billingRelation,
      billingConfig,
      permissions,
      contractStart,
      contractEnd,
      notes,
    } = body

    // Validate required fields
    if (!toOrgId || !relationshipType) {
      return NextResponse.json(
        { error: 'toOrgId and relationshipType are required' },
        { status: 400 }
      )
    }

    // Validate relationship type
    const validTypes: OrgRelationshipType[] = [
      'OWNERSHIP',
      'MANAGEMENT',
      'PARTNERSHIP',
      'LICENSING',
      'RESELLER',
      'WHITE_LABEL',
      'DATA_SHARING',
      'CONSORTIUM',
    ]

    if (!validTypes.includes(relationshipType)) {
      return NextResponse.json(
        { error: 'Invalid relationship type' },
        { status: 400 }
      )
    }

    // Validate access level if provided
    if (accessLevel) {
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
    }

    // Validate billing relation if provided
    if (billingRelation) {
      const validBillingRelations: BillingRelationship[] = [
        'INDEPENDENT',
        'PARENT_PAYS',
        'CONSOLIDATED',
        'PASS_THROUGH',
        'SUBSIDIZED',
      ]
      if (!validBillingRelations.includes(billingRelation)) {
        return NextResponse.json(
          { error: 'Invalid billing relationship' },
          { status: 400 }
        )
      }
    }

    // Create relationship
    const result = await createOrgRelationship({
      fromOrgId: orgId,
      toOrgId,
      relationshipType,
      accessLevel,
      billingRelation,
      billingConfig,
      permissions,
      contractStart: contractStart ? new Date(contractStart) : undefined,
      contractEnd: contractEnd ? new Date(contractEnd) : undefined,
      notes,
      initiatedBy: userId,
    })

    return NextResponse.json({ data: result }, { status: 201 })
  } catch (error: any) {
    console.error('Create relationship API error:', error)

    if (error.message?.includes('not found')) {
      return NextResponse.json({ error: error.message }, { status: 404 })
    }

    if (error.message?.includes('Cannot create a relationship with self')) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'A relationship of this type already exists between these organizations' },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
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

    // Parse request body
    const body = await request.json()
    const { relationshipId, status } = body

    if (!relationshipId || !status) {
      return NextResponse.json(
        { error: 'relationshipId and status are required' },
        { status: 400 }
      )
    }

    // Validate status
    const validStatuses: RelationshipStatus[] = ['PENDING', 'ACTIVE', 'SUSPENDED', 'TERMINATED']
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      )
    }

    // Get the relationship to check permissions
    const relationship = await prisma.orgRelationship.findUnique({
      where: { id: relationshipId },
    })

    if (!relationship) {
      return NextResponse.json({ error: 'Relationship not found' }, { status: 404 })
    }

    // Check if user has permission to update this relationship
    const isFromOrg = relationship.fromOrgId === orgId
    const isToOrg = relationship.toOrgId === orgId

    if (!isFromOrg && !isToOrg) {
      return NextResponse.json(
        { error: 'You are not part of this relationship' },
        { status: 403 }
      )
    }

    // Only 'toOrg' can approve pending relationships
    if (status === 'ACTIVE' && relationship.status === 'PENDING') {
      if (!isToOrg || !hasPermission(membership.role, 'relationships:approve')) {
        return NextResponse.json(
          { error: 'Only the target organization can approve relationships' },
          { status: 403 }
        )
      }
    }

    // For other status changes, need manage permission
    if (status !== 'ACTIVE' && !canManageRelationships(membership.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    await updateRelationshipStatus(
      relationshipId,
      status,
      userId,
      status === 'ACTIVE' ? userId : undefined
    )

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Update relationship API error:', error)

    if (error.message?.includes('not found')) {
      return NextResponse.json({ error: error.message }, { status: 404 })
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
