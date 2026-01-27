import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { validateSuperAdminSession } from "@/lib/super-admin"
import { cookies } from "next/headers"
import {
  getAncestors,
  getDescendants,
  moveOrganization,
  getHierarchyStats,
} from "@/lib/tenant-hierarchy"

// GET - Get organization hierarchy details
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("adminToken")?.value

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const session = await validateSuperAdminSession(token)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    const org = await prisma.organization.findUnique({
      where: { id },
      include: {
        parentOrg: {
          select: {
            id: true,
            name: true,
            slug: true,
            orgType: true,
          },
        },
        childOrgs: {
          include: {
            _count: {
              select: {
                members: true,
                childOrgs: true,
              },
            },
          },
          orderBy: { displayOrder: "asc" },
        },
        _count: {
          select: {
            members: true,
            childOrgs: true,
            relationshipsFrom: true,
            relationshipsTo: true,
          },
        },
      },
    })

    if (!org) {
      return NextResponse.json({ error: "Organization not found" }, { status: 404 })
    }

    // Get ancestors
    const ancestors = await getAncestors(id)

    // Get descendants count
    const descendants = await getDescendants(id)

    // Get stats if this is a root org or has children
    let stats = null
    if (org.allowChildOrgs || org.hierarchyLevel === 0) {
      try {
        stats = await getHierarchyStats(id)
      } catch (e) {
        // Stats may fail for orgs with no valid hierarchy
      }
    }

    // Get relationships
    const relationships = await prisma.orgRelationship.findMany({
      where: {
        OR: [{ fromOrgId: id }, { toOrgId: id }],
      },
      include: {
        fromOrg: {
          select: { id: true, name: true, slug: true, orgType: true },
        },
        toOrg: {
          select: { id: true, name: true, slug: true, orgType: true },
        },
      },
    })

    return NextResponse.json({
      organization: org,
      ancestors,
      descendantCount: descendants.length,
      relationships,
      stats,
    })
  } catch (error) {
    console.error("Get org hierarchy error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// PATCH - Move organization or update hierarchy settings
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("adminToken")?.value

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const session = await validateSuperAdminSession(token)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { newParentOrgId, allowChildOrgs, maxChildDepth, orgType } = body

    // If moving to a new parent
    if (newParentOrgId !== undefined) {
      const org = await moveOrganization(id, newParentOrgId, session.adminId)
      return NextResponse.json({ organization: org })
    }

    // Otherwise update hierarchy settings
    const updates: Record<string, unknown> = {}
    if (allowChildOrgs !== undefined) updates.allowChildOrgs = allowChildOrgs
    if (maxChildDepth !== undefined) updates.maxChildDepth = maxChildDepth
    if (orgType !== undefined) updates.orgType = orgType

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "No updates provided" }, { status: 400 })
    }

    const org = await prisma.organization.update({
      where: { id },
      data: updates,
    })

    return NextResponse.json({ organization: org })
  } catch (error) {
    console.error("Update org hierarchy error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    )
  }
}
