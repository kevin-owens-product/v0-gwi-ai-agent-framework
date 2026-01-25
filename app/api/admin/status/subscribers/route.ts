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
    const verified = searchParams.get("verified")
    const search = searchParams.get("search")

    const where: Record<string, unknown> = {
      unsubscribedAt: null, // Only show active subscriptions
    }

    if (verified === "true") {
      where.isVerified = true
    } else if (verified === "false") {
      where.isVerified = false
    }

    if (search) {
      where.email = { contains: search, mode: "insensitive" }
    }

    const [subscribers, total] = await Promise.all([
      prisma.statusPageSubscription.findMany({
        where,
        orderBy: { subscribedAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.statusPageSubscription.count({ where }),
    ])

    // Get total verified count
    const verifiedCount = await prisma.statusPageSubscription.count({
      where: { isVerified: true, unsubscribedAt: null },
    })

    return NextResponse.json({
      subscribers,
      total,
      verifiedCount,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    })
  } catch (error) {
    console.error("Get status page subscribers error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
