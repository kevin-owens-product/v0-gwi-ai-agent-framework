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
    const limit = parseInt(searchParams.get("limit") || "50")
    const search = searchParams.get("search")
    const category = searchParams.get("category")
    const isActive = searchParams.get("isActive")

    const where: Record<string, unknown> = {}

    if (search) {
      where.OR = [
        { key: { contains: search, mode: "insensitive" } },
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ]
    }

    if (category && category !== "all") {
      where.category = category
    }

    if (isActive !== null && isActive !== "all") {
      where.isActive = isActive === "true"
    }

    const [features, total] = await Promise.all([
      prisma.feature.findMany({
        where,
        include: {
          _count: {
            select: {
              plans: true,
              tenantEntitlements: true,
            },
          },
        },
        orderBy: [{ category: "asc" }, { sortOrder: "asc" }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.feature.count({ where }),
    ])

    return NextResponse.json({
      features,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    })
  } catch (error) {
    console.error("Get features error:", error)
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
      key,
      name,
      description,
      category,
      isActive,
      sortOrder,
      valueType,
      defaultValue,
      metadata,
    } = body

    // Validate required fields
    if (!key || !name) {
      return NextResponse.json(
        { error: "Key and name are required" },
        { status: 400 }
      )
    }

    // Validate key format (snake_case)
    if (!/^[a-z][a-z0-9_]*$/.test(key)) {
      return NextResponse.json(
        { error: "Key must be in snake_case format (lowercase letters, numbers, underscores)" },
        { status: 400 }
      )
    }

    // Check if feature key already exists
    const existing = await prisma.feature.findUnique({
      where: { key },
    })

    if (existing) {
      return NextResponse.json(
        { error: "A feature with this key already exists" },
        { status: 400 }
      )
    }

    const feature = await prisma.feature.create({
      data: {
        key,
        name,
        description,
        category: category || "CORE",
        isActive: isActive ?? true,
        sortOrder: sortOrder ?? 0,
        valueType: valueType || "BOOLEAN",
        defaultValue: defaultValue ?? false,
        metadata: metadata || {},
      },
    })

    // Log action
    await prisma.platformAuditLog.create({
      data: {
        adminId: session.admin.id,
        action: "FEATURE_CREATED",
        resourceType: "Feature",
        resourceId: feature.id,
        details: { featureKey: feature.key },
      },
    })

    return NextResponse.json({ feature }, { status: 201 })
  } catch (error) {
    console.error("Create feature error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
