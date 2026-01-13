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
    const status = searchParams.get("status")
    const provider = searchParams.get("provider")
    const search = searchParams.get("search")
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "20")
    const skip = (page - 1) * limit

    const where: Record<string, unknown> = {}

    if (status && status !== "all") {
      where.status = status
    }
    if (provider && provider !== "all") {
      where.provider = provider
    }
    if (search) {
      where.OR = [
        { displayName: { contains: search, mode: "insensitive" } },
        { orgId: { contains: search, mode: "insensitive" } },
      ]
    }

    const [ssoConfigs, total] = await Promise.all([
      prisma.enterpriseSSO.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.enterpriseSSO.count({ where }),
    ])

    // Fetch organization names
    const orgIds = [...new Set(ssoConfigs.map((s) => s.orgId))]
    const orgs = await prisma.organization.findMany({
      where: { id: { in: orgIds } },
      select: { id: true, name: true, slug: true },
    })
    const orgMap = new Map(orgs.map((o) => [o.id, o]))

    const configsWithOrgNames = ssoConfigs.map((config) => ({
      ...config,
      // Mask sensitive fields
      clientSecret: config.clientSecret ? "***" : null,
      certificate: config.certificate ? "[CERTIFICATE]" : null,
      organization: orgMap.get(config.orgId) || null,
    }))

    return NextResponse.json({
      ssoConfigs: configsWithOrgNames,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("SSO configs fetch error:", error)
    return NextResponse.json(
      { error: "Failed to fetch SSO configurations" },
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
      provider,
      displayName,
      // SAML fields
      entityId,
      ssoUrl,
      sloUrl,
      certificate,
      // OIDC fields
      clientId,
      clientSecret,
      discoveryUrl,
      authorizationUrl,
      tokenUrl,
      userInfoUrl,
      // Common settings
      defaultRole,
      jitProvisioning,
      autoDeactivate,
      attributeMapping,
      allowedDomains,
      metadata,
    } = body

    if (!orgId || !provider) {
      return NextResponse.json(
        { error: "Organization ID and provider are required" },
        { status: 400 }
      )
    }

    // Check if SSO already exists for this org
    const existing = await prisma.enterpriseSSO.findUnique({
      where: { orgId },
    })

    if (existing) {
      return NextResponse.json(
        { error: "SSO configuration already exists for this organization" },
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

    const ssoConfig = await prisma.enterpriseSSO.create({
      data: {
        orgId,
        provider,
        displayName: displayName || `${provider} SSO`,
        status: "CONFIGURING",
        // SAML
        entityId,
        ssoUrl,
        sloUrl,
        certificate,
        // OIDC
        clientId,
        clientSecret,
        discoveryUrl,
        authorizationUrl,
        tokenUrl,
        userInfoUrl,
        // Common
        defaultRole: defaultRole || "MEMBER",
        jitProvisioning: jitProvisioning ?? true,
        autoDeactivate: autoDeactivate ?? false,
        attributeMapping: attributeMapping || {},
        allowedDomains: allowedDomains || [],
        metadata: metadata || {},
      },
    })

    await logPlatformAudit({
      adminId: session.adminId,
      action: "create_sso_config",
      resourceType: "enterprise_sso",
      resourceId: ssoConfig.id,
      details: { orgId, provider, displayName },
    })

    return NextResponse.json({
      ssoConfig: {
        ...ssoConfig,
        clientSecret: ssoConfig.clientSecret ? "***" : null,
        certificate: ssoConfig.certificate ? "[CERTIFICATE]" : null,
      },
    }, { status: 201 })
  } catch (error) {
    console.error("SSO config creation error:", error)
    return NextResponse.json(
      { error: "Failed to create SSO configuration" },
      { status: 500 }
    )
  }
}
