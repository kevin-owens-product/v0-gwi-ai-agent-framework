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

    // Helper function to recursively fetch child orgs
    async function fetchChildOrgsRecursively(parentId: string, depth: number = 0, maxDepth: number = 10): Promise<any[]> {
      if (depth >= maxDepth) return []

      const children = await prisma.organization.findMany({
        where: { parentOrgId: parentId },
        include: {
          _count: {
            select: {
              members: true,
              childOrgs: true,
            },
          },
        },
        orderBy: { displayOrder: "asc" },
      })

      // Recursively fetch grandchildren for each child
      for (const child of children) {
        if (child._count.childOrgs > 0) {
          (child as any).childOrgs = await fetchChildOrgsRecursively(child.id, depth + 1, maxDepth)
        } else {
          (child as any).childOrgs = []
        }
      }

      return children
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
      },
      orderBy: { createdAt: "desc" },
    })

    // Recursively fetch all child organizations for each root org
    for (const rootOrg of rootOrgs) {
      if (rootOrg._count.childOrgs > 0) {
        (rootOrg as any).childOrgs = await fetchChildOrgsRecursively(rootOrg.id)
      } else {
        (rootOrg as any).childOrgs = []
      }
    }

    // Get hierarchy statistics
    const [stats, totalOrgs, totalWithChildren, totalWithParent, maxDepth] = await Promise.all([
      prisma.$queryRaw<Array<{ orgType: string; count: bigint }>>`
        SELECT "orgType", COUNT(*) as count
        FROM "Organization"
        GROUP BY "orgType"
      `,
      prisma.organization.count(),
      prisma.organization.count({
        where: { allowChildOrgs: true },
      }),
      prisma.organization.count({
        where: { parentOrgId: { not: null } },
      }),
      prisma.organization.aggregate({
        _max: { hierarchyLevel: true },
      }),
    ])

    const orgsByType = stats.reduce((acc, s) => {
      acc[s.orgType] = Number(s.count)
      return acc
    }, {} as Record<string, number>)

    return NextResponse.json({
      organizations: rootOrgs,
      stats: {
        totalOrgs,
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
