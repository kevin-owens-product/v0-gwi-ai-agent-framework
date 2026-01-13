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

    // Verify webhook exists
    const webhook = await prisma.webhookEndpoint.findUnique({
      where: { id },
      select: { id: true, name: true, url: true },
    })

    if (!webhook) {
      return NextResponse.json({ error: "Webhook not found" }, { status: 404 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "20")
    const status = searchParams.get("status")
    const eventType = searchParams.get("eventType")
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")

    const where: Record<string, unknown> = {
      webhookId: id,
    }

    if (status && status !== "all") {
      where.status = status
    }

    if (eventType && eventType !== "all") {
      where.eventType = eventType
    }

    if (startDate) {
      where.createdAt = {
        ...(where.createdAt as Record<string, unknown> || {}),
        gte: new Date(startDate),
      }
    }

    if (endDate) {
      where.createdAt = {
        ...(where.createdAt as Record<string, unknown> || {}),
        lte: new Date(endDate),
      }
    }

    const [deliveries, total] = await Promise.all([
      prisma.webhookDelivery.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.webhookDelivery.count({ where }),
    ])

    // Get delivery statistics
    const stats = await prisma.webhookDelivery.groupBy({
      by: ["status"],
      where: { webhookId: id },
      _count: true,
    })

    const statusCounts = {
      PENDING: 0,
      DELIVERED: 0,
      FAILED: 0,
      RETRYING: 0,
    }

    stats.forEach(s => {
      statusCounts[s.status as keyof typeof statusCounts] = s._count
    })

    return NextResponse.json({
      deliveries,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      webhook,
      stats: statusCounts,
    })
  } catch (error) {
    console.error("Get webhook deliveries error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
