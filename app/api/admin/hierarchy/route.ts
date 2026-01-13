import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { validateSuperAdminSession } from "@/lib/super-admin"
import { cookies } from "next/headers"
import { getHierarchyTree, createChildOrganization } from "@/lib/tenant-hierarchy"
import { OrganizationType, PlanTier, CompanySize } from "@prisma/client"

// GET - List all organizations with hierarchy info or get hierarchy tree
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
    const rootOrgId = searchParams.get("rootOrgId")
    const includeTree = searchParams.get("tree") === "true"

    // If requesting a specific hierarchy tree
    if (rootOrgId && includeTree) {
      const tree = await getHierarchyTree(rootOrgId)
      return NextResponse.json({ tree })
    }

    // Get all root-level organizations (those without parents)
    const rootOrgs = await prisma.organization.findMany({
      where: {
        parentOrgId: null,
      },
      include: {
        _count: {
          select: {
            members: true,
            childOrgs: true,
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
      },
      orderBy: { createdAt: "desc" },
    })

    // Get hierarchy statistics
    const stats = await prisma.$queryRaw<Array<{ orgType: string; count: bigint }>>`
      SELECT "orgType", COUNT(*) as count
      FROM "Organization"
      GROUP BY "orgType"
    `

    const orgsByType = stats.reduce((acc, s) => {
      acc[s.orgType] = Number(s.count)
      return acc
    }, {} as Record<string, number>)

    const totalWithChildren = await prisma.organization.count({
      where: { allowChildOrgs: true },
    })

    const totalWithParent = await prisma.organization.count({
      where: { parentOrgId: { not: null } },
    })

    const maxDepth = await prisma.organization.aggregate({
      _max: { hierarchyLevel: true },
    })

    return NextResponse.json({
      organizations: rootOrgs,
      stats: {
        totalOrgs: rootOrgs.length,
        totalWithChildren,
        totalWithParent,
        maxDepth: maxDepth._max.hierarchyLevel || 0,
        orgsByType,
      },
    })
  } catch (error) {
    console.error("Get hierarchy error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// POST - Create a child organization
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
      name,
      slug,
      parentOrgId,
      orgType = "STANDARD",
      planTier,
      inheritSettings = true,
      industry,
      companySize,
      country,
      timezone = "UTC",
      logoUrl,
      brandColor,
      domain,
    } = body

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 })
    }

    if (!parentOrgId) {
      return NextResponse.json({ error: "Parent organization ID is required" }, { status: 400 })
    }

    const organization = await createChildOrganization(
      {
        name,
        slug,
        parentOrgId,
        orgType: orgType as OrganizationType,
        planTier: planTier as PlanTier | undefined,
        inheritSettings,
        industry,
        companySize: companySize as CompanySize | undefined,
        country,
        timezone,
        logoUrl,
        brandColor,
        domain,
      },
      session.adminId
    )

    return NextResponse.json({ organization }, { status: 201 })
  } catch (error) {
    console.error("Create child org error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    )
  }
}
