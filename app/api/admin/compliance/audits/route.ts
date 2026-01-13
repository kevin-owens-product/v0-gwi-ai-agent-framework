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
    const frameworkId = searchParams.get("frameworkId")
    const status = searchParams.get("status")
    const type = searchParams.get("type")

    const where: Record<string, unknown> = {}

    if (orgId) {
      where.orgId = orgId
    }

    if (frameworkId) {
      where.frameworkId = frameworkId
    }

    if (status && status !== "all") {
      where.status = status
    }

    if (type && type !== "all") {
      where.type = type
    }

    const [audits, total] = await Promise.all([
      prisma.complianceAudit.findMany({
        where,
        orderBy: { scheduledDate: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          framework: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
        },
      }),
      prisma.complianceAudit.count({ where }),
    ])

    // Fetch organization names for audits (where applicable)
    const orgIds = [...new Set(audits.filter((a) => a.orgId).map((a) => a.orgId as string))]
    const organizations = orgIds.length > 0
      ? await prisma.organization.findMany({
          where: { id: { in: orgIds } },
          select: { id: true, name: true, slug: true },
        })
      : []
    const orgMap = new Map(organizations.map((o) => [o.id, o]))

    const formattedAudits = audits.map((audit) => ({
      ...audit,
      organization: audit.orgId ? orgMap.get(audit.orgId) : null,
    }))

    return NextResponse.json({
      audits: formattedAudits,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    })
  } catch (error) {
    console.error("Compliance audits fetch error:", error)
    return NextResponse.json(
      { error: "Failed to fetch compliance audits" },
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
      frameworkId,
      orgId,
      type,
      status,
      scheduledDate,
      auditor,
      findings,
      recommendations,
      score,
      reportUrl,
      metadata,
    } = body

    if (!frameworkId || !scheduledDate) {
      return NextResponse.json(
        { error: "Framework ID and scheduled date are required" },
        { status: 400 }
      )
    }

    // Verify framework exists
    const framework = await prisma.complianceFramework.findUnique({
      where: { id: frameworkId },
    })

    if (!framework) {
      return NextResponse.json(
        { error: "Framework not found" },
        { status: 404 }
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

    const audit = await prisma.complianceAudit.create({
      data: {
        frameworkId,
        orgId,
        type: type || "INTERNAL",
        status: status || "SCHEDULED",
        scheduledDate: new Date(scheduledDate),
        auditor,
        findings: findings || [],
        recommendations: recommendations || [],
        score,
        reportUrl,
        metadata: metadata || {},
      },
      include: {
        framework: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
    })

    await logPlatformAudit({
      adminId: session.adminId,
      action: "schedule_compliance_audit",
      resourceType: "compliance_audit",
      resourceId: audit.id,
      targetOrgId: orgId,
      details: { frameworkId, frameworkCode: framework.code, type, scheduledDate },
    })

    return NextResponse.json({ audit }, { status: 201 })
  } catch (error) {
    console.error("Compliance audit creation error:", error)
    return NextResponse.json(
      { error: "Failed to schedule compliance audit" },
      { status: 500 }
    )
  }
}
