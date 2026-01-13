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
    const policyId = searchParams.get("policyId")
    const orgId = searchParams.get("orgId")
    const userId = searchParams.get("userId")
    const violationType = searchParams.get("violationType")
    const severity = searchParams.get("severity")
    const status = searchParams.get("status")
    const search = searchParams.get("search")
    const sortBy = searchParams.get("sortBy") || "createdAt"
    const sortOrder = searchParams.get("sortOrder") || "desc"
    const limit = parseInt(searchParams.get("limit") || "50", 10)
    const offset = parseInt(searchParams.get("offset") || "0", 10)
    const cursor = searchParams.get("cursor")

    const where: Record<string, unknown> = {}

    if (policyId) {
      where.policyId = policyId
    }
    if (orgId) {
      where.orgId = orgId
    }
    if (userId) {
      where.userId = userId
    }
    if (violationType && violationType !== "all") {
      where.violationType = violationType
    }
    if (severity && severity !== "all") {
      where.severity = severity
    }
    if (status && status !== "all") {
      where.status = status
    }
    if (search) {
      where.OR = [
        { description: { contains: search, mode: "insensitive" } },
        { resolution: { contains: search, mode: "insensitive" } },
        { ipAddress: { contains: search, mode: "insensitive" } },
      ]
    }

    // Cursor-based pagination
    if (cursor) {
      where.id = { lt: cursor }
    }

    const orderBy: Record<string, string> = {}
    orderBy[sortBy] = sortOrder

    const [violations, total] = await Promise.all([
      prisma.securityViolation.findMany({
        where,
        orderBy,
        take: limit,
        skip: cursor ? 0 : offset,
        include: {
          policy: {
            select: {
              id: true,
              name: true,
              type: true,
            },
          },
        },
      }),
      prisma.securityViolation.count({ where }),
    ])

    const nextCursor = violations.length === limit ? violations[violations.length - 1]?.id : null

    return NextResponse.json({
      violations,
      pagination: {
        total,
        limit,
        offset: cursor ? 0 : offset,
        hasMore: violations.length === limit,
        nextCursor,
      },
    })
  } catch (error) {
    console.error("Security violations fetch error:", error)
    return NextResponse.json(
      { error: "Failed to fetch security violations" },
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
      policyId,
      orgId,
      userId,
      violationType,
      severity,
      description,
      details,
      ipAddress,
      userAgent,
      resourceType,
      resourceId,
      status: violationStatus,
    } = body

    if (!policyId || !violationType || !description) {
      return NextResponse.json(
        { error: "policyId, violationType, and description are required" },
        { status: 400 }
      )
    }

    // Verify policy exists
    const policy = await prisma.securityPolicy.findUnique({
      where: { id: policyId },
    })

    if (!policy) {
      return NextResponse.json({ error: "Security policy not found" }, { status: 404 })
    }

    const violation = await prisma.securityViolation.create({
      data: {
        policyId,
        orgId,
        userId,
        violationType,
        severity: severity || "WARNING",
        description,
        details: details || {},
        ipAddress,
        userAgent,
        resourceType,
        resourceId,
        status: violationStatus || "OPEN",
      },
      include: {
        policy: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
      },
    })

    await logPlatformAudit({
      adminId: session.adminId,
      action: "create_security_violation",
      resourceType: "security_violation",
      resourceId: violation.id,
      targetOrgId: orgId,
      targetUserId: userId,
      details: { violationType, severity, policyId },
    })

    return NextResponse.json({ violation }, { status: 201 })
  } catch (error) {
    console.error("Security violation creation error:", error)
    return NextResponse.json(
      { error: "Failed to create security violation" },
      { status: 500 }
    )
  }
}
