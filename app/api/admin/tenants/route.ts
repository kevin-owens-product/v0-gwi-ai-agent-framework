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
    const planTier = searchParams.get("planTier")
    const status = searchParams.get("status")

    const where: Record<string, unknown> = {}

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { slug: { contains: search, mode: "insensitive" } },
      ]
    }

    if (planTier && planTier !== "all") {
      where.planTier = planTier
    }

    const [tenants, total] = await Promise.all([
      prisma.organization.findMany({
        where,
        include: {
          _count: {
            select: {
              members: true,
              agents: true,
              workflows: true,
            },
          },
          subscription: true,
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.organization.count({ where }),
    ])

    // Get suspension status for each tenant
    const suspensions = await prisma.organizationSuspension.findMany({
      where: {
        orgId: { in: tenants.map(t => t.id) },
        isActive: true,
      },
    })

    const suspensionMap = new Map(suspensions.map(s => [s.orgId, s]))

    let tenantsWithStatus = tenants.map(tenant => ({
      ...tenant,
      isSuspended: suspensionMap.has(tenant.id),
      suspension: suspensionMap.get(tenant.id),
    }))

    // Filter by status if needed
    if (status === "suspended") {
      tenantsWithStatus = tenantsWithStatus.filter(t => t.isSuspended)
    } else if (status === "active") {
      tenantsWithStatus = tenantsWithStatus.filter(t => !t.isSuspended)
    }

    return NextResponse.json({
      tenants: tenantsWithStatus,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    })
  } catch (error) {
    console.error("Get tenants error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
