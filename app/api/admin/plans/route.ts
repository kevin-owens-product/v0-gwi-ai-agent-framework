import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { validateSuperAdminSession } from "@/lib/super-admin"
import { cookies } from "next/headers"

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
    const tier = searchParams.get("tier")
    const isActive = searchParams.get("isActive")

    const where: Record<string, unknown> = {}

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { displayName: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ]
    }

    if (tier && tier !== "all") {
      where.tier = tier
    }

    if (isActive !== null && isActive !== "all") {
      where.isActive = isActive === "true"
    }

    const [plans, total] = await Promise.all([
      prisma.plan.findMany({
        where,
        include: {
          _count: {
            select: {
              features: true,
              tenantEntitlements: true,
            },
          },
          features: {
            include: {
              feature: {
                select: {
                  key: true,
                  name: true,
                  category: true,
                },
              },
            },
          },
        },
        orderBy: { sortOrder: "asc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.plan.count({ where }),
    ])

    return NextResponse.json({
      plans,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    })
  } catch (error) {
    console.error("Get plans error:", error)
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
      displayName,
      description,
      tier,
      isActive,
      isPublic,
      sortOrder,
      monthlyPrice,
      yearlyPrice,
      stripePriceIdMonthly,
      stripePriceIdYearly,
      limits,
      metadata,
      features, // Array of { featureId, value, limit }
    } = body

    // Validate required fields
    if (!name || !displayName) {
      return NextResponse.json(
        { error: "Name and display name are required" },
        { status: 400 }
      )
    }

    // Check if plan name already exists
    const existing = await prisma.plan.findUnique({
      where: { name },
    })

    if (existing) {
      return NextResponse.json(
        { error: "A plan with this name already exists" },
        { status: 400 }
      )
    }

    // Create plan with features
    const plan = await prisma.plan.create({
      data: {
        name,
        displayName,
        description,
        tier: tier || "STARTER",
        isActive: isActive ?? true,
        isPublic: isPublic ?? true,
        sortOrder: sortOrder ?? 0,
        monthlyPrice: monthlyPrice ?? 0,
        yearlyPrice: yearlyPrice ?? 0,
        stripePriceIdMonthly,
        stripePriceIdYearly,
        limits: limits || {},
        metadata: metadata || {},
        features: features?.length
          ? {
              create: features.map((f: { featureId: string; value: unknown; limit?: number }) => ({
                featureId: f.featureId,
                value: f.value ?? true,
                limit: f.limit,
              })),
            }
          : undefined,
      },
      include: {
        features: {
          include: { feature: true },
        },
      },
    })

    // Log action
    await prisma.platformAuditLog.create({
      data: {
        adminId: session.admin.id,
        action: "PLAN_CREATED",
        resourceType: "Plan",
        resourceId: plan.id,
        details: { planName: plan.name },
      },
    })

    return NextResponse.json({ plan }, { status: 201 })
  } catch (error) {
    console.error("Create plan error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
