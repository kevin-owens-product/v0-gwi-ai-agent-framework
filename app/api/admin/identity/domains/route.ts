import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { prisma } from "@/lib/db"
import { validateSuperAdminSession, logPlatformAudit } from "@/lib/super-admin"
import { randomBytes } from "crypto"

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
      where.OR = [
        { domain: { contains: search, mode: "insensitive" } },
        { orgId: { contains: search, mode: "insensitive" } },
      ]
    }

    const [domains, total] = await Promise.all([
      prisma.domainVerification.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.domainVerification.count({ where }),
    ])

    // Fetch organization names for each domain
    const orgIds = [...new Set(domains.map((d) => d.orgId))]
    const orgs = await prisma.organization.findMany({
      where: { id: { in: orgIds } },
      select: { id: true, name: true },
    })
    const orgMap = new Map(orgs.map((o) => [o.id, o.name]))

    const domainsWithOrgNames = domains.map((domain) => ({
      ...domain,
      orgName: orgMap.get(domain.orgId) || null,
    }))

    return NextResponse.json({
      domains: domainsWithOrgNames,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Domain verification fetch error:", error)
    return NextResponse.json(
      { error: "Failed to fetch domain verifications" },
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
    const { domain, orgId, verificationMethod, autoJoin, ssoEnforced, metadata } = body

    if (!domain || !orgId) {
      return NextResponse.json(
        { error: "Domain and organization ID are required" },
        { status: 400 }
      )
    }

    // Check if domain already exists
    const existing = await prisma.domainVerification.findUnique({
      where: { domain },
    })

    if (existing) {
      return NextResponse.json(
        { error: "Domain already registered" },
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

    // Generate verification token
    const verificationToken = `gwi-verify-${randomBytes(16).toString("hex")}`

    const domainVerification = await prisma.domainVerification.create({
      data: {
        domain: domain.toLowerCase().trim(),
        orgId,
        verificationMethod: verificationMethod || "DNS_TXT",
        verificationToken,
        autoJoin: autoJoin ?? false,
        ssoEnforced: ssoEnforced ?? false,
        metadata: metadata || {},
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      },
    })

    await logPlatformAudit({
      adminId: session.adminId,
      action: "create_domain_verification",
      resourceType: "domain_verification",
      resourceId: domainVerification.id,
      details: { domain, orgId, verificationMethod },
    })

    return NextResponse.json({ domain: domainVerification }, { status: 201 })
  } catch (error) {
    console.error("Domain verification creation error:", error)
    return NextResponse.json(
      { error: "Failed to create domain verification" },
      { status: 500 }
    )
  }
}
