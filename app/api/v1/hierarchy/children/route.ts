/**
 * Child Organizations API
 *
 * GET /api/v1/hierarchy/children - Get direct children of current organization
 * POST /api/v1/hierarchy/children - Create a child organization
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { getUserMembership } from '@/lib/tenant'
import { getOrgIdFromRequest } from '@/lib/shared-utils'
import { hasPermission, canManageHierarchy, getRecommendedChildTypes } from '@/lib/permissions'
import {
  createChildOrganization,
  getDirectChildren,
  canOrgTypeHaveChildren,
} from '@/lib/tenant-hierarchy'
import type { OrganizationType, PlanTier, CompanySize } from '@prisma/client'

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

    // Check hierarchy read permission
    if (!hasPermission(membership.role, 'hierarchy:read')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // Parse filters
    const orgTypes = searchParams.get('orgTypes')?.split(',') as OrganizationType[] | undefined
    const planTiers = searchParams.get('planTiers')?.split(',') as PlanTier[] | undefined

    const children = await getDirectChildren(orgId, { orgTypes, planTiers })

    // Get current org to provide recommended child types
    const currentOrg = await prisma.organization.findUnique({
      where: { id: orgId },
      select: { orgType: true, allowChildOrgs: true },
    })

    return NextResponse.json({
      data: children,
      meta: {
        canCreateChildren: currentOrg?.allowChildOrgs ?? false,
        recommendedChildTypes: currentOrg ? getRecommendedChildTypes(currentOrg.orgType) : [],
      },
    })
  } catch (error) {
    console.error('Get children API error:', error)
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

    // Check hierarchy write permission
    if (!canManageHierarchy(membership.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // Parse request body
    const body = await request.json()
    const {
      name,
      slug,
      orgType,
      planTier,
      settings,
      inheritSettings,
      industry,
      companySize,
      country,
      timezone,
      logoUrl,
      brandColor,
      domain,
    } = body

    // Validate required fields
    if (!name || !orgType) {
      return NextResponse.json(
        { error: 'Name and orgType are required' },
        { status: 400 }
      )
    }

    // Validate org type
    const validOrgTypes: OrganizationType[] = [
      'STANDARD',
      'AGENCY',
      'HOLDING_COMPANY',
      'SUBSIDIARY',
      'BRAND',
      'SUB_BRAND',
      'DIVISION',
      'DEPARTMENT',
      'FRANCHISE',
      'FRANCHISEE',
      'RESELLER',
      'CLIENT',
      'REGIONAL',
      'PORTFOLIO_COMPANY',
    ]

    if (!validOrgTypes.includes(orgType)) {
      return NextResponse.json(
        { error: 'Invalid organization type' },
        { status: 400 }
      )
    }

    // Check if parent org allows children
    const parentOrg = await prisma.organization.findUnique({
      where: { id: orgId },
      select: { allowChildOrgs: true, orgType: true },
    })

    if (!parentOrg?.allowChildOrgs) {
      return NextResponse.json(
        { error: 'This organization does not allow child organizations' },
        { status: 400 }
      )
    }

    // Create child organization
    const childOrg = await createChildOrganization(
      {
        name,
        slug,
        orgType,
        parentOrgId: orgId,
        planTier,
        settings,
        inheritSettings,
        industry,
        companySize,
        country,
        timezone,
        logoUrl,
        brandColor,
        domain,
      },
      userId
    )

    return NextResponse.json({ data: childOrg }, { status: 201 })
  } catch (error: any) {
    console.error('Create child API error:', error)

    if (error.message?.includes('Maximum hierarchy depth')) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'An organization with this slug or domain already exists' },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
