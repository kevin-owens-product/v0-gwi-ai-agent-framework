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
    const orgId = searchParams.get("orgId")
    const status = searchParams.get("status")

    const where: Record<string, unknown> = {}

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { caseNumber: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ]
    }

    if (orgId) {
      where.orgId = orgId
    }

    if (status && status !== "all") {
      where.status = status
    }

    const [legalHolds, total] = await Promise.all([
      prisma.legalHold.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          _count: {
            select: { exports: true },
          },
        },
      }),
      prisma.legalHold.count({ where }),
    ])

    // Fetch organization names for legal holds
    const orgIds = [...new Set(legalHolds.filter((h) => h.orgId).map((h) => h.orgId as string))]
    const organizations = orgIds.length > 0
      ? await prisma.organization.findMany({
          where: { id: { in: orgIds } },
          select: { id: true, name: true, slug: true },
        })
      : []
    const orgMap = new Map(organizations.map((o) => [o.id, o]))

    const formattedLegalHolds = legalHolds.map((hold) => ({
      ...hold,
      organization: hold.orgId ? orgMap.get(hold.orgId) : null,
      exportCount: hold._count.exports,
      custodianCount: hold.custodians.length,
      _count: undefined,
    }))

    return NextResponse.json({
      legalHolds: formattedLegalHolds,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    })
  } catch (error) {
    console.error("Legal holds fetch error:", error)
    return NextResponse.json(
      { error: "Failed to fetch legal holds" },
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
      description,
      caseNumber,
      orgId,
      custodians,
      startDate,
      endDate,
      status,
      scope,
      notes,
      metadata,
    } = body

    if (!name) {
      return NextResponse.json(
        { error: "Name is required" },
        { status: 400 }
      )
    }

    // Check for duplicate case number if provided
    if (caseNumber) {
      const existingHold = await prisma.legalHold.findUnique({
        where: { caseNumber },
      })

      if (existingHold) {
        return NextResponse.json(
          { error: "Legal hold with this case number already exists" },
          { status: 400 }
        )
      }
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

    // Verify custodians exist if provided
    if (custodians && custodians.length > 0) {
      const users = await prisma.user.findMany({
        where: { id: { in: custodians } },
      })

      if (users.length !== custodians.length) {
        return NextResponse.json(
          { error: "One or more custodian users not found" },
          { status: 404 }
        )
      }
    }

    const legalHold = await prisma.legalHold.create({
      data: {
        name,
        description,
        caseNumber,
        orgId,
        custodians: custodians || [],
        startDate: startDate ? new Date(startDate) : new Date(),
        endDate: endDate ? new Date(endDate) : undefined,
        status: status || "ACTIVE",
        scope: scope || {},
        createdBy: session.adminId,
        notes,
        metadata: metadata || {},
      },
    })

    await logPlatformAudit({
      adminId: session.adminId,
      action: "create_legal_hold",
      resourceType: "legal_hold",
      resourceId: legalHold.id,
      targetOrgId: orgId,
      details: { name, caseNumber, custodianCount: custodians?.length || 0 },
    })

    return NextResponse.json({ legalHold }, { status: 201 })
  } catch (error) {
    console.error("Legal hold creation error:", error)
    return NextResponse.json(
      { error: "Failed to create legal hold" },
      { status: 500 }
    )
  }
}
