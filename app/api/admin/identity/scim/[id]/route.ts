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

    const scimIntegration = await prisma.sCIMIntegration.findUnique({
      where: { id },
    })

    if (!scimIntegration) {
      return NextResponse.json({ error: "SCIM integration not found" }, { status: 404 })
    }

    // Fetch organization details
    const org = await prisma.organization.findUnique({
      where: { id: scimIntegration.orgId },
      select: { id: true, name: true, slug: true, planTier: true },
    })

    // Fetch SSO configuration if exists
    const ssoConfig = await prisma.enterpriseSSO.findUnique({
      where: { orgId: scimIntegration.orgId },
      select: { id: true, provider: true, status: true },
    })

    // Count users in organization
    const userCount = await prisma.organizationMember.count({
      where: { orgId: scimIntegration.orgId },
    })

    return NextResponse.json({
      scimIntegration: {
        ...scimIntegration,
        // Mask bearer token
        bearerToken: scimIntegration.tokenPrefix ? `${scimIntegration.tokenPrefix}...` : null,
        organization: org,
        ssoConfig,
        userCount,
      },
    })
  } catch (error) {
    console.error("SCIM integration fetch error:", error)
    return NextResponse.json(
      { error: "Failed to fetch SCIM integration" },
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
      syncUsers,
      syncGroups,
      autoDeactivate,
      defaultRole,
      metadata,
    } = body

    const existing = await prisma.sCIMIntegration.findUnique({
      where: { id },
    })

    if (!existing) {
      return NextResponse.json({ error: "SCIM integration not found" }, { status: 404 })
    }

    const scimIntegration = await prisma.sCIMIntegration.update({
      where: { id },
      data: {
        ...(status !== undefined && { status }),
        ...(syncUsers !== undefined && { syncUsers }),
        ...(syncGroups !== undefined && { syncGroups }),
        ...(autoDeactivate !== undefined && { autoDeactivate }),
        ...(defaultRole !== undefined && { defaultRole }),
        ...(metadata !== undefined && { metadata }),
      },
    })

    await logPlatformAudit({
      adminId: session.adminId,
      action: "update_scim_integration",
      resourceType: "scim_integration",
      resourceId: scimIntegration.id,
      details: {
        changes: Object.keys(body),
        previousStatus: existing.status,
        newStatus: scimIntegration.status,
      },
    })

    return NextResponse.json({
      scimIntegration: {
        ...scimIntegration,
        bearerToken: scimIntegration.tokenPrefix ? `${scimIntegration.tokenPrefix}...` : null,
      },
    })
  } catch (error) {
    console.error("SCIM integration update error:", error)
    return NextResponse.json(
      { error: "Failed to update SCIM integration" },
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

    const existing = await prisma.sCIMIntegration.findUnique({
      where: { id },
    })

    if (!existing) {
      return NextResponse.json({ error: "SCIM integration not found" }, { status: 404 })
    }

    // Check if SCIM is active
    if (existing.status === "ACTIVE") {
      return NextResponse.json(
        {
          error: "Cannot delete active SCIM integration. Please pause it first.",
        },
        { status: 400 }
      )
    }

    await prisma.sCIMIntegration.delete({
      where: { id },
    })

    await logPlatformAudit({
      adminId: session.adminId,
      action: "delete_scim_integration",
      resourceType: "scim_integration",
      resourceId: id,
      details: {
        orgId: existing.orgId,
        usersProvisioned: existing.usersProvisioned,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("SCIM integration deletion error:", error)
    return NextResponse.json(
      { error: "Failed to delete SCIM integration" },
      { status: 500 }
    )
  }
}
