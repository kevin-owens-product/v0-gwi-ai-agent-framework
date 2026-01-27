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

    const ssoConfig = await prisma.enterpriseSSO.findUnique({
      where: { id },
    })

    if (!ssoConfig) {
      return NextResponse.json({ error: "SSO configuration not found" }, { status: 404 })
    }

    // Fetch organization details
    const org = await prisma.organization.findUnique({
      where: { id: ssoConfig.orgId },
      select: { id: true, name: true, slug: true, planTier: true },
    })

    // Fetch related domain verifications
    const domains = await prisma.domainVerification.findMany({
      where: { orgId: ssoConfig.orgId },
      select: { id: true, domain: true, status: true, ssoEnforced: true },
    })

    // Count users provisioned via SSO (users in this org)
    const userCount = await prisma.organizationMember.count({
      where: { orgId: ssoConfig.orgId },
    })

    return NextResponse.json({
      ssoConfig: {
        ...ssoConfig,
        // Mask sensitive fields
        clientSecret: ssoConfig.clientSecret ? "***" : null,
        certificate: ssoConfig.certificate ? "[CERTIFICATE]" : null,
        organization: org,
        domains,
        userCount,
      },
    })
  } catch (error) {
    console.error("SSO config fetch error:", error)
    return NextResponse.json(
      { error: "Failed to fetch SSO configuration" },
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
    const {
      status,
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

    const existing = await prisma.enterpriseSSO.findUnique({
      where: { id },
    })

    if (!existing) {
      return NextResponse.json({ error: "SSO configuration not found" }, { status: 404 })
    }

    const ssoConfig = await prisma.enterpriseSSO.update({
      where: { id },
      data: {
        ...(status !== undefined && { status }),
        ...(displayName !== undefined && { displayName }),
        ...(entityId !== undefined && { entityId }),
        ...(ssoUrl !== undefined && { ssoUrl }),
        ...(sloUrl !== undefined && { sloUrl }),
        ...(certificate !== undefined && { certificate }),
        ...(clientId !== undefined && { clientId }),
        ...(clientSecret !== undefined && { clientSecret }),
        ...(discoveryUrl !== undefined && { discoveryUrl }),
        ...(authorizationUrl !== undefined && { authorizationUrl }),
        ...(tokenUrl !== undefined && { tokenUrl }),
        ...(userInfoUrl !== undefined && { userInfoUrl }),
        ...(defaultRole !== undefined && { defaultRole }),
        ...(jitProvisioning !== undefined && { jitProvisioning }),
        ...(autoDeactivate !== undefined && { autoDeactivate }),
        ...(attributeMapping !== undefined && { attributeMapping }),
        ...(allowedDomains !== undefined && { allowedDomains }),
        ...(metadata !== undefined && { metadata }),
      },
    })

    await logPlatformAudit({
      adminId: session.adminId,
      action: "update_sso_config",
      resourceType: "enterprise_sso",
      resourceId: ssoConfig.id,
      details: {
        changes: Object.keys(body),
        previousStatus: existing.status,
        newStatus: ssoConfig.status,
      },
    })

    return NextResponse.json({
      ssoConfig: {
        ...ssoConfig,
        clientSecret: ssoConfig.clientSecret ? "***" : null,
        certificate: ssoConfig.certificate ? "[CERTIFICATE]" : null,
      },
    })
  } catch (error) {
    console.error("SSO config update error:", error)
    return NextResponse.json(
      { error: "Failed to update SSO configuration" },
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

    const existing = await prisma.enterpriseSSO.findUnique({
      where: { id },
    })

    if (!existing) {
      return NextResponse.json({ error: "SSO configuration not found" }, { status: 404 })
    }

    // Check if SSO is actively enforced on any domains
    const enforcedDomains = await prisma.domainVerification.findMany({
      where: {
        orgId: existing.orgId,
        ssoEnforced: true,
      },
    })

    if (enforcedDomains.length > 0) {
      return NextResponse.json(
        {
          error: "Cannot delete SSO configuration while it is enforced on domains",
          enforcedDomains: enforcedDomains.map((d) => d.domain),
        },
        { status: 400 }
      )
    }

    await prisma.enterpriseSSO.delete({
      where: { id },
    })

    await logPlatformAudit({
      adminId: session.adminId,
      action: "delete_sso_config",
      resourceType: "enterprise_sso",
      resourceId: id,
      details: {
        orgId: existing.orgId,
        provider: existing.provider,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("SSO config deletion error:", error)
    return NextResponse.json(
      { error: "Failed to delete SSO configuration" },
      { status: 500 }
    )
  }
}
