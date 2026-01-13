import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { prisma } from "@/lib/db"
import { validateSuperAdminSession, logPlatformAudit } from "@/lib/super-admin"

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("adminToken")?.value

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const session = await validateSuperAdminSession(token)
    if (!session) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "20")
    const search = searchParams.get("search")
    const isActive = searchParams.get("isActive")

    const where: Record<string, unknown> = {}

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { code: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ]
    }

    if (isActive !== null && isActive !== "all") {
      where.isActive = isActive === "true"
    }

    const [frameworks, total] = await Promise.all([
      prisma.complianceFramework.findMany({
        where,
        orderBy: [{ isActive: "desc" }, { name: "asc" }],
        skip: (page - 1) * limit,
        take: limit,
        include: {
          _count: {
            select: {
              attestations: true,
              audits: true,
            },
          },
        },
      }),
      prisma.complianceFramework.count({ where }),
    ])

    const formattedFrameworks = frameworks.map((framework) => ({
      ...framework,
      attestationCount: framework._count.attestations,
      auditCount: framework._count.audits,
      _count: undefined,
    }))

    return NextResponse.json({
      frameworks: formattedFrameworks,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    })
  } catch (error) {
    console.error("Compliance frameworks fetch error:", error)
    return NextResponse.json(
      { error: "Failed to fetch compliance frameworks" },
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
      return NextResponse.json({ error: "Invalid session" }, { status: 401 })
    }

    const body = await request.json()
    const {
      name,
      code,
      description,
      version,
      requirements,
      controls,
      isActive,
      metadata,
    } = body

    if (!name || !code) {
      return NextResponse.json(
        { error: "Name and code are required" },
        { status: 400 }
      )
    }

    // Check for existing code
    const existingFramework = await prisma.complianceFramework.findUnique({
      where: { code },
    })

    if (existingFramework) {
      return NextResponse.json(
        { error: "Framework with this code already exists" },
        { status: 400 }
      )
    }

    const framework = await prisma.complianceFramework.create({
      data: {
        name,
        code,
        description,
        version,
        requirements: requirements || [],
        controls: controls || [],
        isActive: isActive ?? true,
        metadata: metadata || {},
      },
    })

    await logPlatformAudit({
      adminId: session.adminId,
      action: "create_compliance_framework",
      resourceType: "compliance_framework",
      resourceId: framework.id,
      details: { name, code, version },
    })

    return NextResponse.json({ framework }, { status: 201 })
  } catch (error) {
    console.error("Compliance framework creation error:", error)
    return NextResponse.json(
      { error: "Failed to create compliance framework" },
      { status: 500 }
    )
  }
}
