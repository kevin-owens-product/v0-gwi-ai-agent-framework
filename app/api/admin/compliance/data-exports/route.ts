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
    const orgId = searchParams.get("orgId")
    const userId = searchParams.get("userId")
    const type = searchParams.get("type")
    const status = searchParams.get("status")
    const legalHoldId = searchParams.get("legalHoldId")

    const where: Record<string, unknown> = {}

    if (orgId) {
      where.orgId = orgId
    }

    if (userId) {
      where.userId = userId
    }

    if (type && type !== "all") {
      where.type = type
    }

    if (status && status !== "all") {
      where.status = status
    }

    if (legalHoldId) {
      where.legalHoldId = legalHoldId
    }

    const [exports, total] = await Promise.all([
      prisma.dataExport.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          legalHold: {
            select: {
              id: true,
              name: true,
              caseNumber: true,
            },
          },
        },
      }),
      prisma.dataExport.count({ where }),
    ])

    // Fetch organization and user names
    const orgIds = [...new Set(exports.filter((e) => e.orgId).map((e) => e.orgId as string))]
    const userIds = [...new Set(exports.filter((e) => e.userId).map((e) => e.userId as string))]
    const requestedByIds = [...new Set(exports.map((e) => e.requestedBy))]

    const [organizations, users, requestedByUsers] = await Promise.all([
      orgIds.length > 0
        ? prisma.organization.findMany({
            where: { id: { in: orgIds } },
            select: { id: true, name: true, slug: true },
          })
        : [],
      userIds.length > 0
        ? prisma.user.findMany({
            where: { id: { in: userIds } },
            select: { id: true, name: true, email: true },
          })
        : [],
      prisma.user.findMany({
        where: { id: { in: requestedByIds } },
        select: { id: true, name: true, email: true },
      }),
    ])

    const orgMap = new Map(organizations.map((o) => [o.id, o]))
    const userMap = new Map(users.map((u) => [u.id, u]))
    const requestedByMap = new Map(requestedByUsers.map((u) => [u.id, u]))

    const formattedExports = exports.map((exp) => ({
      ...exp,
      organization: exp.orgId ? orgMap.get(exp.orgId) : null,
      user: exp.userId ? userMap.get(exp.userId) : null,
      requestedByUser: requestedByMap.get(exp.requestedBy),
      fileSize: exp.fileSize ? Number(exp.fileSize) : null,
    }))

    return NextResponse.json({
      exports: formattedExports,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    })
  } catch (error) {
    console.error("Data exports fetch error:", error)
    return NextResponse.json(
      { error: "Failed to fetch data exports" },
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
      type,
      orgId,
      userId,
      legalHoldId,
      scope,
      format,
      expiresAt,
      metadata,
    } = body

    if (!type) {
      return NextResponse.json(
        { error: "Export type is required" },
        { status: 400 }
      )
    }

    // Verify organization exists if provided
    if (orgId) {
      const organization = await prisma.organization.findUnique({
        where: { id: orgId },
      })

      if (!organization) {
        return NextResponse.json(
          { error: "Organization not found" },
          { status: 404 }
        )
      }
    }

    // Verify user exists if provided
    if (userId) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
      })

      if (!user) {
        return NextResponse.json(
          { error: "User not found" },
          { status: 404 }
        )
      }
    }

    // Verify legal hold exists if provided
    if (legalHoldId) {
      const legalHold = await prisma.legalHold.findUnique({
        where: { id: legalHoldId },
      })

      if (!legalHold) {
        return NextResponse.json(
          { error: "Legal hold not found" },
          { status: 404 }
        )
      }
    }

    const dataExport = await prisma.dataExport.create({
      data: {
        type,
        requestedBy: session.adminId,
        orgId,
        userId,
        legalHoldId,
        status: "PENDING",
        scope: scope || {},
        format: format || "json",
        expiresAt: expiresAt ? new Date(expiresAt) : undefined,
        metadata: metadata || {},
      },
      include: {
        legalHold: {
          select: {
            id: true,
            name: true,
            caseNumber: true,
          },
        },
      },
    })

    await logPlatformAudit({
      adminId: session.adminId,
      action: "create_data_export",
      resourceType: "data_export",
      resourceId: dataExport.id,
      targetOrgId: orgId,
      targetUserId: userId,
      details: { type, format, legalHoldId },
    })

    return NextResponse.json({ export: dataExport }, { status: 201 })
  } catch (error) {
    console.error("Data export creation error:", error)
    return NextResponse.json(
      { error: "Failed to create data export" },
      { status: 500 }
    )
  }
}
