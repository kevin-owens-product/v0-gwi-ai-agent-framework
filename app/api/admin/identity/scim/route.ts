import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { prisma } from "@/lib/db"
import { validateSuperAdminSession, logPlatformAudit } from "@/lib/super-admin"
import { randomBytes, createHash } from "crypto"

// Generate a secure SCIM bearer token
function generateSCIMToken(): { token: string; hashedToken: string; prefix: string } {
  const token = `scim_${randomBytes(32).toString("hex")}`
  const hashedToken = createHash("sha256").update(token).digest("hex")
  const prefix = token.substring(0, 12)
  return { token, hashedToken, prefix }
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
      return NextResponse.json({ error: "Invalid session" }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get("status")
    const search = searchParams.get("search")
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "20")
    const skip = (page - 1) * limit

    const where: Record<string, unknown> = {}

    if (status && status !== "all") {
      where.status = status
    }
    if (search) {
      where.orgId = { contains: search, mode: "insensitive" }
    }

    const [scimIntegrations, total] = await Promise.all([
      prisma.sCIMIntegration.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.sCIMIntegration.count({ where }),
    ])

    // Fetch organization names
    const orgIds = [...new Set(scimIntegrations.map((s) => s.orgId))]
    const orgs = await prisma.organization.findMany({
      where: { id: { in: orgIds } },
      select: { id: true, name: true, slug: true },
    })
    const orgMap = new Map(orgs.map((o) => [o.id, o]))

    const integrationsWithOrgNames = scimIntegrations.map((integration) => ({
      ...integration,
      // Mask bearer token
      bearerToken: integration.tokenPrefix ? `${integration.tokenPrefix}...` : null,
      organization: orgMap.get(integration.orgId) || null,
    }))

    return NextResponse.json({
      scimIntegrations: integrationsWithOrgNames,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("SCIM integrations fetch error:", error)
    return NextResponse.json(
      { error: "Failed to fetch SCIM integrations" },
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
      orgId,
      syncUsers,
      syncGroups,
      autoDeactivate,
      defaultRole,
      metadata,
    } = body

    if (!orgId) {
      return NextResponse.json(
        { error: "Organization ID is required" },
        { status: 400 }
      )
    }

    // Check if SCIM already exists for this org
    const existing = await prisma.sCIMIntegration.findUnique({
      where: { orgId },
    })

    if (existing) {
      return NextResponse.json(
        { error: "SCIM integration already exists for this organization" },
        { status: 409 }
      )
    }

    // Verify organization exists
    const org = await prisma.organization.findUnique({
      where: { id: orgId },
    })

    if (!org) {
      return NextResponse.json(
        { error: "Organization not found" },
        { status: 404 }
      )
    }

    // Generate SCIM token and endpoint
    const { token: scimToken, hashedToken, prefix } = generateSCIMToken()
    const endpoint = `/api/scim/v2/${orgId}`

    const scimIntegration = await prisma.sCIMIntegration.create({
      data: {
        orgId,
        status: "CONFIGURING",
        endpoint,
        bearerToken: hashedToken,
        tokenPrefix: prefix,
        syncUsers: syncUsers ?? true,
        syncGroups: syncGroups ?? true,
        autoDeactivate: autoDeactivate ?? true,
        defaultRole: defaultRole || "MEMBER",
        metadata: metadata || {},
        createdBy: session.adminId,
      },
    })

    await logPlatformAudit({
      adminId: session.adminId,
      action: "create_scim_integration",
      resourceType: "scim_integration",
      resourceId: scimIntegration.id,
      details: { orgId, syncUsers, syncGroups },
    })

    // Return the plain token ONLY on creation - it won't be retrievable later
    return NextResponse.json({
      scimIntegration: {
        ...scimIntegration,
        bearerToken: scimToken, // Return the actual token only on creation
        tokenPrefix: prefix,
      },
      message: "IMPORTANT: Save the bearer token now. It will not be shown again.",
    }, { status: 201 })
  } catch (error) {
    console.error("SCIM integration creation error:", error)
    return NextResponse.json(
      { error: "Failed to create SCIM integration" },
      { status: 500 }
    )
  }
}
