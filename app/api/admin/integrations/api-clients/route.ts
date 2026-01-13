import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { validateSuperAdminSession } from "@/lib/super-admin"
import { cookies } from "next/headers"
import { randomBytes, createHash } from "crypto"
import { APIClientType, APIClientStatus } from "@prisma/client"

// Generate a secure client ID
function generateClientId(): string {
  return `cli_${randomBytes(16).toString("hex")}`
}

// Generate a secure client secret
function generateClientSecret(): string {
  return `sec_${randomBytes(32).toString("hex")}`
}

// Hash a secret for storage
function hashSecret(secret: string): string {
  return createHash("sha256").update(secret).digest("hex")
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
    const type = searchParams.get("type")
    const orgId = searchParams.get("orgId")

    const where: Record<string, unknown> = {}

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { clientId: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ]
    }

    if (status && status !== "all") {
      where.status = status
    }

    if (type && type !== "all") {
      where.type = type
    }

    if (orgId) {
      where.orgId = orgId
    }

    const [clients, total] = await Promise.all([
      prisma.aPIClient.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.aPIClient.count({ where }),
    ])

    // Get organization names for display
    const orgIds = [...new Set(clients.map(c => c.orgId))]
    const orgs = await prisma.organization.findMany({
      where: { id: { in: orgIds } },
      select: { id: true, name: true },
    })
    const orgMap = new Map(orgs.map(o => [o.id, o.name]))

    const clientsWithOrgNames = clients.map(client => ({
      ...client,
      orgName: orgMap.get(client.orgId) || client.orgId,
      totalRequests: Number(client.totalRequests),
    }))

    return NextResponse.json({
      clients: clientsWithOrgNames,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    })
  } catch (error) {
    console.error("Get API clients error:", error)
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
      orgId,
      type = "CONFIDENTIAL",
      redirectUris = [],
      allowedScopes = [],
      allowedGrants = ["authorization_code"],
      rateLimit = 1000,
      dailyLimit,
      monthlyLimit,
    } = body

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 })
    }

    if (!orgId) {
      return NextResponse.json({ error: "Organization ID is required" }, { status: 400 })
    }

    // Verify organization exists
    const org = await prisma.organization.findUnique({
      where: { id: orgId },
    })

    if (!org) {
      return NextResponse.json({ error: "Organization not found" }, { status: 404 })
    }

    // Generate client credentials
    const clientId = generateClientId()
    const clientSecret = generateClientSecret()
    const clientSecretHash = hashSecret(clientSecret)

    const client = await prisma.aPIClient.create({
      data: {
        name,
        description,
        orgId,
        clientId,
        clientSecretHash,
        type: type as APIClientType,
        status: "ACTIVE" as APIClientStatus,
        redirectUris,
        allowedScopes,
        allowedGrants,
        rateLimit,
        dailyLimit: dailyLimit || null,
        monthlyLimit: monthlyLimit || null,
        createdBy: session.adminId,
      },
    })

    // Log to audit
    await prisma.platformAuditLog.create({
      data: {
        adminId: session.adminId,
        action: "api_client.created",
        resourceType: "APIClient",
        resourceId: client.id,
        targetOrgId: orgId,
        details: {
          name: client.name,
          type: client.type,
          clientId: client.clientId,
        },
      },
    })

    return NextResponse.json(
      {
        client: {
          ...client,
          totalRequests: Number(client.totalRequests),
        },
        clientSecret, // Return the plain secret once (won't be retrievable later)
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Create API client error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
