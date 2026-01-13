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
    const status = searchParams.get("status")
    const type = searchParams.get("type")
    const search = searchParams.get("search")
    const sortBy = searchParams.get("sortBy") || "createdAt"
    const sortOrder = searchParams.get("sortOrder") || "desc"

    const where: Record<string, unknown> = {}

    if (status) {
      where.status = status
    }

    if (type) {
      where.type = type
    }

    if (search) {
      where.OR = [
        { version: { contains: search, mode: "insensitive" } },
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ]
    }

    const [releases, total] = await Promise.all([
      prisma.releaseManagement.findMany({
        where,
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.releaseManagement.count({ where }),
    ])

    return NextResponse.json({
      releases,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    })
  } catch (error) {
    console.error("Get releases error:", error)
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
      version,
      name,
      description,
      type = "MINOR",
      features = [],
      bugFixes = [],
      breakingChanges = [],
      rolloutStrategy = "STAGED",
      rolloutRegions = [],
      plannedDate,
      changelogUrl,
    } = body

    if (!version) {
      return NextResponse.json(
        { error: "Version is required" },
        { status: 400 }
      )
    }

    // Check for duplicate version
    const existing = await prisma.releaseManagement.findUnique({
      where: { version },
    })

    if (existing) {
      return NextResponse.json(
        { error: "Version already exists" },
        { status: 400 }
      )
    }

    const release = await prisma.releaseManagement.create({
      data: {
        version,
        name,
        description,
        type,
        status: "PLANNED",
        features,
        bugFixes,
        breakingChanges,
        rolloutStrategy,
        rolloutPercentage: 0,
        rolloutRegions,
        plannedDate: plannedDate ? new Date(plannedDate) : null,
        changelogUrl,
        createdBy: session.admin.id,
      },
    })

    // Log audit
    await prisma.platformAuditLog.create({
      data: {
        adminId: session.admin.id,
        action: "CREATE",
        resourceType: "release",
        resourceId: release.id,
        details: { version, type, plannedDate },
      },
    })

    return NextResponse.json({ release }, { status: 201 })
  } catch (error) {
    console.error("Create release error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
