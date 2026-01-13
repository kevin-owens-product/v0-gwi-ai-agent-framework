import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { validateSuperAdminSession } from "@/lib/super-admin"
import { cookies } from "next/headers"
import { PlanTier, OrganizationType, CompanySize } from "@prisma/client"

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
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "20")
    const search = searchParams.get("search")
    const planTier = searchParams.get("planTier")
    const status = searchParams.get("status")

    const where: Record<string, unknown> = {}

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { slug: { contains: search, mode: "insensitive" } },
      ]
    }

    if (planTier && planTier !== "all") {
      where.planTier = planTier
    }

    const [tenants, total] = await Promise.all([
      prisma.organization.findMany({
        where,
        include: {
          _count: {
            select: {
              members: true,
              agents: true,
              workflows: true,
            },
          },
          subscription: true,
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.organization.count({ where }),
    ])

    // Get suspension status for each tenant
    const suspensions = await prisma.organizationSuspension.findMany({
      where: {
        orgId: { in: tenants.map(t => t.id) },
        isActive: true,
      },
    })

    const suspensionMap = new Map(suspensions.map(s => [s.orgId, s]))

    let tenantsWithStatus = tenants.map(tenant => ({
      ...tenant,
      isSuspended: suspensionMap.has(tenant.id),
      suspension: suspensionMap.get(tenant.id),
    }))

    // Filter by status if needed
    if (status === "suspended") {
      tenantsWithStatus = tenantsWithStatus.filter(t => t.isSuspended)
    } else if (status === "active") {
      tenantsWithStatus = tenantsWithStatus.filter(t => !t.isSuspended)
    }

    return NextResponse.json({
      tenants: tenantsWithStatus,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    })
  } catch (error) {
    console.error("Get tenants error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// Create a new tenant/organization
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
      planTier = "STARTER",
      orgType = "STANDARD",
      parentOrgId,
      industry,
      companySize,
      country,
      timezone = "UTC",
      logoUrl,
      brandColor,
      domain,
      allowChildOrgs = false,
      ownerEmail,
      ownerName,
    } = body

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 })
    }

    // Generate slug if not provided
    let finalSlug = slug
    if (!finalSlug) {
      finalSlug = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "")

      // Check for uniqueness
      let counter = 1
      let checkSlug = finalSlug
      while (await prisma.organization.findUnique({ where: { slug: checkSlug } })) {
        checkSlug = `${finalSlug}-${counter}`
        counter++
      }
      finalSlug = checkSlug
    } else {
      // Verify slug is unique
      const existing = await prisma.organization.findUnique({ where: { slug: finalSlug } })
      if (existing) {
        return NextResponse.json({ error: "Slug already exists" }, { status: 400 })
      }
    }

    // If parent org specified, validate and calculate hierarchy
    let hierarchyData: Record<string, unknown> = {
      hierarchyPath: "/",
      hierarchyLevel: 0,
      rootOrgId: null,
    }

    if (parentOrgId) {
      const parent = await prisma.organization.findUnique({
        where: { id: parentOrgId },
      })

      if (!parent) {
        return NextResponse.json({ error: "Parent organization not found" }, { status: 400 })
      }

      if (!parent.allowChildOrgs) {
        return NextResponse.json({ error: "Parent organization does not allow child organizations" }, { status: 400 })
      }

      hierarchyData = {
        parentOrgId,
        hierarchyPath: `${parent.hierarchyPath}${parent.id}/`,
        hierarchyLevel: parent.hierarchyLevel + 1,
        rootOrgId: parent.rootOrgId || parent.id,
      }
    }

    // Create the organization
    const organization = await prisma.$transaction(async (tx) => {
      const org = await tx.organization.create({
        data: {
          name,
          slug: finalSlug,
          planTier: planTier as PlanTier,
          orgType: orgType as OrganizationType,
          industry,
          companySize: companySize as CompanySize | undefined,
          country,
          timezone,
          logoUrl,
          brandColor,
          domain: domain || undefined,
          allowChildOrgs,
          ...hierarchyData,
        },
      })

      // If owner email provided, create user and add as owner
      if (ownerEmail) {
        let user = await tx.user.findUnique({ where: { email: ownerEmail } })

        if (!user) {
          user = await tx.user.create({
            data: {
              email: ownerEmail,
              name: ownerName || null,
            },
          })
        }

        await tx.organizationMember.create({
          data: {
            orgId: org.id,
            userId: user.id,
            role: "OWNER",
          },
        })
      }

      // Log to audit
      await tx.auditLog.create({
        data: {
          orgId: org.id,
          action: "organization.created",
          details: {
            name: org.name,
            planTier: org.planTier,
            orgType: org.orgType,
            createdBy: session.adminId,
          },
        },
      })

      return org
    })

    return NextResponse.json({ organization }, { status: 201 })
  } catch (error) {
    console.error("Create tenant error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
