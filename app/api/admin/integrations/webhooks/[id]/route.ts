import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { validateSuperAdminSession } from "@/lib/super-admin"
import { cookies } from "next/headers"
import { WebhookStatus } from "@prisma/client"

export async function GET(
  _request: NextRequest,
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

    const webhook = await prisma.webhookEndpoint.findUnique({
      where: { id },
      include: {
        deliveries: {
          orderBy: { createdAt: "desc" },
          take: 10,
        },
      },
    })

    if (!webhook) {
      return NextResponse.json({ error: "Webhook not found" }, { status: 404 })
    }

    // Get organization details
    const org = await prisma.organization.findUnique({
      where: { id: webhook.orgId },
      select: { id: true, name: true, slug: true },
    })

    // Calculate health metrics
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    const recentDeliveries = await prisma.webhookDelivery.findMany({
      where: {
        webhookId: id,
        createdAt: { gte: sevenDaysAgo },
      },
      select: {
        status: true,
        httpStatus: true,
        createdAt: true,
      },
    })

    const healthMetrics = {
      totalLast7Days: recentDeliveries.length,
      successfulLast7Days: recentDeliveries.filter(d => d.status === "DELIVERED").length,
      failedLast7Days: recentDeliveries.filter(d => d.status === "FAILED").length,
      averageResponseTime: 0, // Would be calculated from actual response times
      successRate: recentDeliveries.length > 0
        ? (recentDeliveries.filter(d => d.status === "DELIVERED").length / recentDeliveries.length) * 100
        : 100,
    }

    return NextResponse.json({
      webhook: {
        ...webhook,
        totalDeliveries: Number(webhook.totalDeliveries),
        successfulDeliveries: Number(webhook.successfulDeliveries),
        failedDeliveries: Number(webhook.failedDeliveries),
        organization: org,
        healthMetrics,
        // Don't expose the secret
        secret: undefined,
      },
    })
  } catch (error) {
    console.error("Get webhook error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function PUT(
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
    const body = await request.json()

    const existing = await prisma.webhookEndpoint.findUnique({
      where: { id },
    })

    if (!existing) {
      return NextResponse.json({ error: "Webhook not found" }, { status: 404 })
    }

    const {
      name,
      description,
      url,
      events,
      status,
      timeout,
      retryPolicy,
      metadata,
    } = body

    const updateData: Record<string, unknown> = {}
    if (name !== undefined) updateData.name = name
    if (description !== undefined) updateData.description = description
    if (url !== undefined) {
      // Validate URL format
      try {
        new URL(url)
        updateData.url = url
      } catch {
        return NextResponse.json({ error: "Invalid URL format" }, { status: 400 })
      }
    }
    if (events !== undefined) updateData.events = events
    if (status !== undefined) updateData.status = status as WebhookStatus
    if (timeout !== undefined) updateData.timeout = timeout
    if (retryPolicy !== undefined) updateData.retryPolicy = retryPolicy
    if (metadata !== undefined) updateData.metadata = metadata

    // If status is being changed to ACTIVE, reset health indicators
    if (status === "ACTIVE" && existing.status !== "ACTIVE") {
      updateData.isHealthy = true
      updateData.consecutiveFailures = 0
      updateData.disabledAt = null
      updateData.disabledReason = null
    }

    const webhook = await prisma.webhookEndpoint.update({
      where: { id },
      data: updateData,
    })

    // Log to audit
    await prisma.platformAuditLog.create({
      data: {
        adminId: session.adminId,
        action: "webhook.updated",
        resourceType: "WebhookEndpoint",
        resourceId: webhook.id,
        targetOrgId: webhook.orgId,
        details: {
          updates: Object.keys(updateData),
        },
      },
    })

    return NextResponse.json({
      webhook: {
        ...webhook,
        totalDeliveries: Number(webhook.totalDeliveries),
        successfulDeliveries: Number(webhook.successfulDeliveries),
        failedDeliveries: Number(webhook.failedDeliveries),
        secret: undefined,
      },
    })
  } catch (error) {
    console.error("Update webhook error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return PUT(request, { params })
}

export async function DELETE(
  _request: NextRequest,
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

    const existing = await prisma.webhookEndpoint.findUnique({
      where: { id },
    })

    if (!existing) {
      return NextResponse.json({ error: "Webhook not found" }, { status: 404 })
    }

    // Delete the webhook and all its deliveries (cascade)
    await prisma.webhookEndpoint.delete({
      where: { id },
    })

    // Log to audit
    await prisma.platformAuditLog.create({
      data: {
        adminId: session.adminId,
        action: "webhook.deleted",
        resourceType: "WebhookEndpoint",
        resourceId: id,
        targetOrgId: existing.orgId,
        details: {
          name: existing.name,
          url: existing.url,
        },
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete webhook error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
