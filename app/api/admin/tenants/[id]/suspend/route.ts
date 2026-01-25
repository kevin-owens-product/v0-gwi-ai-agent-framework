import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { validateSuperAdminSession, suspendOrganization, liftOrganizationSuspension } from "@/lib/super-admin"
import { logAdminActivity, AdminActivityAction, AdminResourceType } from "@/lib/admin-activity"
import { prisma } from "@/lib/db"

export async function POST(
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
    const { reason, suspensionType = "FULL", expiresAt, notes } = body

    if (!reason) {
      return NextResponse.json(
        { error: "Reason is required" },
        { status: 400 }
      )
    }

    // Get tenant info for logging
    const tenant = await prisma.organization.findUnique({
      where: { id },
      select: { name: true, slug: true },
    })

    const suspension = await suspendOrganization({
      orgId: id,
      reason,
      suspendedBy: session.admin.id,
      suspensionType,
      expiresAt: expiresAt ? new Date(expiresAt) : undefined,
      notes,
    })

    // Log admin activity
    await logAdminActivity({
      adminId: session.admin.id,
      action: AdminActivityAction.TENANT_SUSPEND,
      resourceType: AdminResourceType.TENANT,
      resourceId: id,
      description: `Suspended tenant: ${tenant?.name || 'Unknown'}`,
      metadata: {
        reason,
        suspensionType,
        expiresAt,
        tenantSlug: tenant?.slug,
      },
    })

    return NextResponse.json({ suspension })
  } catch (error) {
    console.error("Suspend tenant error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function DELETE(
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

    // Get tenant info for logging
    const tenant = await prisma.organization.findUnique({
      where: { id },
      select: { name: true, slug: true },
    })

    await liftOrganizationSuspension(id, session.admin.id)

    // Log admin activity
    await logAdminActivity({
      adminId: session.admin.id,
      action: AdminActivityAction.TENANT_UNSUSPEND,
      resourceType: AdminResourceType.TENANT,
      resourceId: id,
      description: `Lifted suspension for tenant: ${tenant?.name || 'Unknown'}`,
      metadata: {
        tenantSlug: tenant?.slug,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Lift suspension error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
