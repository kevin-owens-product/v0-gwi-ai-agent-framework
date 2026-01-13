import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { validateSuperAdminSession } from "@/lib/super-admin"
import { cookies } from "next/headers"
import {
  createOrgRelationship,
  updateRelationshipStatus,
} from "@/lib/tenant-hierarchy"
import { OrgRelationshipType, ResourceSharingScope, BillingRelationship, RelationshipStatus } from "@prisma/client"

// GET - List all relationships or filter by org
export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url)
    const orgId = searchParams.get("orgId")
    const status = searchParams.get("status")
    const type = searchParams.get("type")

    const where: Record<string, unknown> = {}

    if (orgId) {
      where.OR = [{ fromOrgId: orgId }, { toOrgId: orgId }]
    }

    if (status) {
      where.status = status
    }

    if (type) {
      where.relationshipType = type
    }

    const relationships = await prisma.orgRelationship.findMany({
      where,
      include: {
        fromOrg: {
          select: {
            id: true,
            name: true,
            slug: true,
            orgType: true,
            planTier: true,
          },
        },
        toOrg: {
          select: {
            id: true,
            name: true,
            slug: true,
            orgType: true,
            planTier: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    // Get stats
    const stats = await prisma.orgRelationship.groupBy({
      by: ["relationshipType", "status"],
      _count: true,
    })

    return NextResponse.json({
      relationships,
      stats: stats.reduce((acc, s) => {
        const key = `${s.relationshipType}_${s.status}`
        acc[key] = s._count
        return acc
      }, {} as Record<string, number>),
    })
  } catch (error) {
    console.error("Get relationships error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// POST - Create a new relationship
export async function POST(request: NextRequest) {
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

    const body = await request.json()
    const {
      fromOrgId,
      toOrgId,
      relationshipType,
      accessLevel = "READ_ONLY",
      billingRelation = "INDEPENDENT",
      billingConfig,
      permissions,
      contractStart,
      contractEnd,
      notes,
    } = body

    if (!fromOrgId || !toOrgId || !relationshipType) {
      return NextResponse.json(
        { error: "fromOrgId, toOrgId, and relationshipType are required" },
        { status: 400 }
      )
    }

    const result = await createOrgRelationship({
      fromOrgId,
      toOrgId,
      relationshipType: relationshipType as OrgRelationshipType,
      accessLevel: accessLevel as ResourceSharingScope,
      billingRelation: billingRelation as BillingRelationship,
      billingConfig,
      permissions,
      contractStart: contractStart ? new Date(contractStart) : undefined,
      contractEnd: contractEnd ? new Date(contractEnd) : undefined,
      notes,
      initiatedBy: session.adminId,
    })

    return NextResponse.json({ relationshipId: result.id }, { status: 201 })
  } catch (error) {
    console.error("Create relationship error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    )
  }
}

// PATCH - Update relationship status
export async function PATCH(request: NextRequest) {
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

    const body = await request.json()
    const { relationshipId, status } = body

    if (!relationshipId || !status) {
      return NextResponse.json(
        { error: "relationshipId and status are required" },
        { status: 400 }
      )
    }

    await updateRelationshipStatus(
      relationshipId,
      status as RelationshipStatus,
      session.adminId,
      status === "ACTIVE" ? session.adminId : undefined
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Update relationship error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    )
  }
}
