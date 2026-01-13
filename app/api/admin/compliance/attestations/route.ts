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
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "20")
    const orgId = searchParams.get("orgId")
    const frameworkId = searchParams.get("frameworkId")
    const status = searchParams.get("status")

    const where: Record<string, unknown> = {}

    if (orgId) {
      where.orgId = orgId
    }

    if (frameworkId) {
      where.frameworkId = frameworkId
    }

    if (status && status !== "all") {
      where.status = status
    }

    const [attestations, total] = await Promise.all([
      prisma.complianceAttestation.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          framework: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
        },
      }),
      prisma.complianceAttestation.count({ where }),
    ])

    // Fetch organization names for attestations
    const orgIds = [...new Set(attestations.map((a) => a.orgId))]
    const organizations = await prisma.organization.findMany({
      where: { id: { in: orgIds } },
      select: { id: true, name: true, slug: true },
    })
    const orgMap = new Map(organizations.map((o) => [o.id, o]))

    const formattedAttestations = attestations.map((attestation) => ({
      ...attestation,
      organization: orgMap.get(attestation.orgId),
    }))

    return NextResponse.json({
      attestations: formattedAttestations,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    })
  } catch (error) {
    console.error("Compliance attestations fetch error:", error)
    return NextResponse.json(
      { error: "Failed to fetch compliance attestations" },
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
      frameworkId,
      orgId,
      status,
      score,
      findings,
      evidence,
      attestedBy,
      attestedAt,
      validUntil,
      notes,
      metadata,
    } = body

    if (!frameworkId || !orgId) {
      return NextResponse.json(
        { error: "Framework ID and Organization ID are required" },
        { status: 400 }
      )
    }

    // Verify framework exists
    const framework = await prisma.complianceFramework.findUnique({
      where: { id: frameworkId },
    })

    if (!framework) {
      return NextResponse.json(
        { error: "Framework not found" },
        { status: 404 }
      )
    }

    // Verify organization exists
    const organization = await prisma.organization.findUnique({
      where: { id: orgId },
    })

    if (!organization) {
      return NextResponse.json(
        { error: "Organization not found" },
        { status: 404 }
      )
    }

    // Check for existing attestation
    const existingAttestation = await prisma.complianceAttestation.findUnique({
      where: {
        frameworkId_orgId: {
          frameworkId,
          orgId,
        },
      },
    })

    if (existingAttestation) {
      return NextResponse.json(
        { error: "Attestation already exists for this framework and organization" },
        { status: 400 }
      )
    }

    const attestation = await prisma.complianceAttestation.create({
      data: {
        frameworkId,
        orgId,
        status: status || "NOT_STARTED",
        score,
        findings: findings || [],
        evidence: evidence || [],
        attestedBy,
        attestedAt: attestedAt ? new Date(attestedAt) : undefined,
        validUntil: validUntil ? new Date(validUntil) : undefined,
        notes,
        metadata: metadata || {},
      },
      include: {
        framework: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
    })

    await logPlatformAudit({
      adminId: session.adminId,
      action: "create_compliance_attestation",
      resourceType: "compliance_attestation",
      resourceId: attestation.id,
      targetOrgId: orgId,
      details: { frameworkId, frameworkCode: framework.code, status },
    })

    return NextResponse.json({ attestation }, { status: 201 })
  } catch (error) {
    console.error("Compliance attestation creation error:", error)
    return NextResponse.json(
      { error: "Failed to create compliance attestation" },
      { status: 500 }
    )
  }
}
