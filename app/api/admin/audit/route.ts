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
    const action = searchParams.get("action")
    const resourceType = searchParams.get("resourceType")

    const where: Record<string, unknown> = {}

    if (action && action !== "all") where.action = action
    if (resourceType && resourceType !== "all") where.resourceType = resourceType

    if (search) {
      where.OR = [
        { action: { contains: search, mode: "insensitive" } },
        { resourceType: { contains: search, mode: "insensitive" } },
        { admin: { name: { contains: search, mode: "insensitive" } } },
        { admin: { email: { contains: search, mode: "insensitive" } } },
      ]
    }

    const [logs, total] = await Promise.all([
      prisma.platformAuditLog.findMany({
        where,
        include: {
          admin: {
            select: { name: true, email: true },
          },
        },
        orderBy: { timestamp: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.platformAuditLog.count({ where }),
    ])

    return NextResponse.json({
      logs,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    })
  } catch (error) {
    console.error("Get audit logs error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
