import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { validateSuperAdminSession } from "@/lib/super-admin"
import { cookies } from "next/headers"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params

    // Verify app exists
    const app = await prisma.integrationApp.findUnique({
      where: { id },
      select: { id: true, name: true, slug: true },
    })

    if (!app) {
      return NextResponse.json({ error: "Integration app not found" }, { status: 404 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "20")
    const status = searchParams.get("status")
    const search = searchParams.get("search")

    const where: Record<string, unknown> = {
      appId: id,
    }

    if (status && status !== "all") {
      where.status = status
    }

    const [installs, total] = await Promise.all([
      prisma.integrationInstall.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.integrationInstall.count({ where }),
    ])

    // Get organization details
    const orgIds = installs.map(i => i.orgId)
    const orgs = await prisma.organization.findMany({
      where: {
        id: { in: orgIds },
        ...(search
          ? {
              OR: [
                { name: { contains: search, mode: "insensitive" } },
                { slug: { contains: search, mode: "insensitive" } },
              ],
            }
          : {}),
      },
      select: { id: true, name: true, slug: true, planTier: true },
    })
    const orgMap = new Map(orgs.map(o => [o.id, o]))

    const installsWithOrgs = installs
      .map(install => ({
        ...install,
        organization: orgMap.get(install.orgId),
      }))
      .filter(i => !search || i.organization) // Filter by search if provided

    // Get status statistics
    const stats = await prisma.integrationInstall.groupBy({
      by: ["status"],
      where: { appId: id },
      _count: true,
    })

    const statusCounts = {
      ACTIVE: 0,
      PAUSED: 0,
      UNINSTALLED: 0,
    }

    stats.forEach(s => {
      statusCounts[s.status as keyof typeof statusCounts] = s._count
    })

    return NextResponse.json({
      installs: installsWithOrgs,
      total: search ? installsWithOrgs.length : total,
      page,
      limit,
      totalPages: Math.ceil((search ? installsWithOrgs.length : total) / limit),
      app,
      stats: statusCounts,
    })
  } catch (error) {
    console.error("Get integration installs error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
