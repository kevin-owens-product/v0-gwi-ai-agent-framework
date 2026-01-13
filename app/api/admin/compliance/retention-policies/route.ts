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
    const dataType = searchParams.get("dataType")
    const scope = searchParams.get("scope")
    const isActive = searchParams.get("isActive")

    const where: Record<string, unknown> = {}

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { dataType: { contains: search, mode: "insensitive" } },
      ]
    }

    if (dataType && dataType !== "all") {
      where.dataType = dataType
    }

    if (scope && scope !== "all") {
      where.scope = scope
    }

    if (isActive !== null && isActive !== "all") {
      where.isActive = isActive === "true"
    }

    const [policies, total] = await Promise.all([
      prisma.dataRetentionPolicy.findMany({
        where,
        orderBy: [{ isActive: "desc" }, { name: "asc" }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.dataRetentionPolicy.count({ where }),
    ])

    // Calculate days until next run for active policies
    const formattedPolicies = policies.map((policy) => {
      const daysUntilNextRun = policy.nextRun
        ? Math.ceil((policy.nextRun.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
        : null

      return {
        ...policy,
        daysUntilNextRun,
        retentionPeriod: policy.retentionDays === -1 ? "Forever" : `${policy.retentionDays} days`,
      }
    })

    return NextResponse.json({
      policies: formattedPolicies,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    })
  } catch (error) {
    console.error("Retention policies fetch error:", error)
    return NextResponse.json(
      { error: "Failed to fetch retention policies" },
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
      dataType,
      retentionDays,
      scope,
      targetOrgs,
      targetPlans,
      deleteAction,
      isActive,
      nextRun,
    } = body

    if (!name || !dataType || retentionDays === undefined) {
      return NextResponse.json(
        { error: "Name, data type, and retention days are required" },
        { status: 400 }
      )
    }

    // Validate retention days
    if (retentionDays !== -1 && (typeof retentionDays !== "number" || retentionDays < 0)) {
      return NextResponse.json(
        { error: "Retention days must be a positive number or -1 for forever" },
        { status: 400 }
      )
    }

    // Validate target orgs exist if provided
    if (targetOrgs && targetOrgs.length > 0) {
      const orgs = await prisma.organization.findMany({
        where: { id: { in: targetOrgs } },
      })

      if (orgs.length !== targetOrgs.length) {
        return NextResponse.json(
          { error: "One or more target organizations not found" },
          { status: 404 }
        )
      }
    }

    const policy = await prisma.dataRetentionPolicy.create({
      data: {
        name,
        description,
        dataType,
        retentionDays,
        scope: scope || "PLATFORM",
        targetOrgs: targetOrgs || [],
        targetPlans: targetPlans || [],
        deleteAction: deleteAction || "SOFT_DELETE",
        isActive: isActive ?? true,
        nextRun: nextRun ? new Date(nextRun) : undefined,
        createdBy: session.adminId,
      },
    })

    await logPlatformAudit({
      adminId: session.adminId,
      action: "create_retention_policy",
      resourceType: "data_retention_policy",
      resourceId: policy.id,
      details: { name, dataType, retentionDays, scope, deleteAction },
    })

    return NextResponse.json({ policy }, { status: 201 })
  } catch (error) {
    console.error("Retention policy creation error:", error)
    return NextResponse.json(
      { error: "Failed to create retention policy" },
      { status: 500 }
    )
  }
}
