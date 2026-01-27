import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { prisma } from "@/lib/db"
import { validateSuperAdminSession, logPlatformAudit } from "@/lib/super-admin"

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const cookieStore = await cookies()
    const token = cookieStore.get("adminToken")?.value

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const session = await validateSuperAdminSession(token)
    if (!session) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 })
    }

    const domain = await prisma.domainVerification.findUnique({
      where: { id },
    })

    if (!domain) {
      return NextResponse.json({ error: "Domain not found" }, { status: 404 })
    }

    // Fetch organization details
    const org = await prisma.organization.findUnique({
      where: { id: domain.orgId },
      select: { id: true, name: true, slug: true, planTier: true },
    })

    // Check for SSO config on this org
    const ssoConfig = await prisma.enterpriseSSO.findUnique({
      where: { orgId: domain.orgId },
      select: { id: true, provider: true, status: true },
    })

    return NextResponse.json({
      domain: {
        ...domain,
        organization: org,
        ssoConfig,
      },
    })
  } catch (error) {
    console.error("Domain fetch error:", error)
    return NextResponse.json(
      { error: "Failed to fetch domain" },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
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
    const { autoJoin, ssoEnforced, verificationMethod, metadata } = body

    const existing = await prisma.domainVerification.findUnique({
      where: { id },
    })

    if (!existing) {
      return NextResponse.json({ error: "Domain not found" }, { status: 404 })
    }

    const domain = await prisma.domainVerification.update({
      where: { id },
      data: {
        ...(autoJoin !== undefined && { autoJoin }),
        ...(ssoEnforced !== undefined && { ssoEnforced }),
        ...(verificationMethod !== undefined && { verificationMethod }),
        ...(metadata !== undefined && { metadata }),
      },
    })

    await logPlatformAudit({
      adminId: session.adminId,
      action: "update_domain_verification",
      resourceType: "domain_verification",
      resourceId: domain.id,
      details: {
        changes: Object.keys(body),
        domain: domain.domain,
      },
    })

    return NextResponse.json({ domain })
  } catch (error) {
    console.error("Domain update error:", error)
    return NextResponse.json(
      { error: "Failed to update domain" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const cookieStore = await cookies()
    const token = cookieStore.get("adminToken")?.value

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const session = await validateSuperAdminSession(token)
    if (!session) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 })
    }

    const existing = await prisma.domainVerification.findUnique({
      where: { id },
    })

    if (!existing) {
      return NextResponse.json({ error: "Domain not found" }, { status: 404 })
    }

    await prisma.domainVerification.delete({
      where: { id },
    })

    await logPlatformAudit({
      adminId: session.adminId,
      action: "delete_domain_verification",
      resourceType: "domain_verification",
      resourceId: id,
      details: {
        domain: existing.domain,
        orgId: existing.orgId,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Domain deletion error:", error)
    return NextResponse.json(
      { error: "Failed to delete domain" },
      { status: 500 }
    )
  }
}
