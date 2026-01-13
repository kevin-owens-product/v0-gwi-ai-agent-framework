import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { validateSuperAdminSession } from "@/lib/super-admin"
import { cookies } from "next/headers"
import { randomBytes, createHmac } from "crypto"
import { WebhookStatus } from "@prisma/client"

// Generate a secure webhook secret
function generateWebhookSecret(): string {
  return `whsec_${randomBytes(32).toString("hex")}`
}

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
    const status = searchParams.get("status")
    const orgId = searchParams.get("orgId")
    const isHealthy = searchParams.get("isHealthy")

    const where: Record<string, unknown> = {}

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { url: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ]
    }

    if (status && status !== "all") {
      where.status = status
    }

    if (orgId) {
      where.orgId = orgId
    }

    if (isHealthy !== null && isHealthy !== undefined) {
      where.isHealthy = isHealthy === "true"
    }

    const [webhooks, total] = await Promise.all([
      prisma.webhookEndpoint.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          _count: {
            select: {
              deliveries: true,
            },
          },
        },
      }),
      prisma.webhookEndpoint.count({ where }),
    ])

    // Get organization names for display
    const orgIds = [...new Set(webhooks.map(w => w.orgId))]
    const orgs = await prisma.organization.findMany({
      where: { id: { in: orgIds } },
      select: { id: true, name: true },
    })
    const orgMap = new Map(orgs.map(o => [o.id, o.name]))

    const webhooksWithOrgNames = webhooks.map(webhook => ({
      ...webhook,
      orgName: orgMap.get(webhook.orgId) || webhook.orgId,
      totalDeliveries: Number(webhook.totalDeliveries),
      successfulDeliveries: Number(webhook.successfulDeliveries),
      failedDeliveries: Number(webhook.failedDeliveries),
      // Don't expose the secret
      secret: undefined,
    }))

    return NextResponse.json({
      webhooks: webhooksWithOrgNames,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    })
  } catch (error) {
    console.error("Get webhooks error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
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
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const {
      name,
      description,
      url,
      orgId,
      events = [],
      timeout = 30,
      retryPolicy = { maxRetries: 3, retryDelay: 60 },
    } = body

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 })
    }

    if (!orgId) {
      return NextResponse.json({ error: "Organization ID is required" }, { status: 400 })
    }

    // Validate URL format
    try {
      new URL(url)
    } catch {
      return NextResponse.json({ error: "Invalid URL format" }, { status: 400 })
    }

    // Verify organization exists
    const org = await prisma.organization.findUnique({
      where: { id: orgId },
    })

    if (!org) {
      return NextResponse.json({ error: "Organization not found" }, { status: 404 })
    }

    // Generate webhook secret
    const secret = generateWebhookSecret()

    const webhook = await prisma.webhookEndpoint.create({
      data: {
        name: name || `Webhook for ${url}`,
        description,
        url,
        orgId,
        events,
        secret,
        timeout,
        retryPolicy,
        status: "ACTIVE" as WebhookStatus,
        createdBy: session.adminId,
      },
    })

    // Log to audit
    await prisma.platformAuditLog.create({
      data: {
        adminId: session.adminId,
        action: "webhook.created",
        resourceType: "WebhookEndpoint",
        resourceId: webhook.id,
        targetOrgId: orgId,
        details: {
          name: webhook.name,
          url: webhook.url,
          events: webhook.events,
        },
      },
    })

    return NextResponse.json(
      {
        webhook: {
          ...webhook,
          totalDeliveries: Number(webhook.totalDeliveries),
          successfulDeliveries: Number(webhook.successfulDeliveries),
          failedDeliveries: Number(webhook.failedDeliveries),
        },
        secret, // Return the plain secret once
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Create webhook error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
