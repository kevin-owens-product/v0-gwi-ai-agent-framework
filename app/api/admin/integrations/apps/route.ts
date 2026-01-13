import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { validateSuperAdminSession } from "@/lib/super-admin"
import { cookies } from "next/headers"
import { IntegrationCategory, IntegrationStatus } from "@prisma/client"

// Generate a slug from a name
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
}

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
    const status = searchParams.get("status")
    const category = searchParams.get("category")
    const isFeatured = searchParams.get("isFeatured")
    const isOfficial = searchParams.get("isOfficial")

    const where: Record<string, unknown> = {}

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { slug: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { developer: { contains: search, mode: "insensitive" } },
      ]
    }

    if (status && status !== "all") {
      where.status = status
    }

    if (category && category !== "all") {
      where.category = category
    }

    if (isFeatured !== null && isFeatured !== undefined && isFeatured !== "all") {
      where.isFeatured = isFeatured === "true"
    }

    if (isOfficial !== null && isOfficial !== undefined && isOfficial !== "all") {
      where.isOfficial = isOfficial === "true"
    }

    const [apps, total] = await Promise.all([
      prisma.integrationApp.findMany({
        where,
        orderBy: [
          { isFeatured: "desc" },
          { isOfficial: "desc" },
          { installCount: "desc" },
          { createdAt: "desc" },
        ],
        skip: (page - 1) * limit,
        take: limit,
        include: {
          _count: {
            select: {
              installations: true,
            },
          },
        },
      }),
      prisma.integrationApp.count({ where }),
    ])

    // Get category counts
    const categoryCounts = await prisma.integrationApp.groupBy({
      by: ["category"],
      _count: true,
    })

    return NextResponse.json({
      apps,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      categoryCounts: categoryCounts.reduce((acc, c) => {
        acc[c.category] = c._count
        return acc
      }, {} as Record<string, number>),
    })
  } catch (error) {
    console.error("Get integration apps error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

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
      slug: customSlug,
      description,
      shortDescription,
      category,
      developer,
      developerUrl,
      supportUrl,
      privacyUrl,
      iconUrl,
      bannerUrl,
      status = "DRAFT",
      isOfficial = false,
      isFeatured = false,
      requiredScopes = [],
      optionalScopes = [],
      setupInstructions,
      configSchema = {},
      allowedPlans = [],
      blockedOrgs = [],
    } = body

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 })
    }

    if (!developer) {
      return NextResponse.json({ error: "Developer is required" }, { status: 400 })
    }

    if (!category) {
      return NextResponse.json({ error: "Category is required" }, { status: 400 })
    }

    // Generate or validate slug
    let slug = customSlug || generateSlug(name)

    // Check for uniqueness
    let counter = 1
    let checkSlug = slug
    while (await prisma.integrationApp.findUnique({ where: { slug: checkSlug } })) {
      checkSlug = `${slug}-${counter}`
      counter++
    }
    slug = checkSlug

    const app = await prisma.integrationApp.create({
      data: {
        name,
        slug,
        description,
        shortDescription,
        category: category as IntegrationCategory,
        developer,
        developerUrl,
        supportUrl,
        privacyUrl,
        iconUrl,
        bannerUrl,
        status: status as IntegrationStatus,
        isOfficial,
        isFeatured,
        requiredScopes,
        optionalScopes,
        setupInstructions,
        configSchema,
        allowedPlans,
        blockedOrgs,
      },
    })

    // Log to audit
    await prisma.platformAuditLog.create({
      data: {
        adminId: session.adminId,
        action: "integration_app.created",
        resourceType: "IntegrationApp",
        resourceId: app.id,
        details: {
          name: app.name,
          slug: app.slug,
          category: app.category,
          developer: app.developer,
        },
      },
    })

    return NextResponse.json({ app }, { status: 201 })
  } catch (error) {
    console.error("Create integration app error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
