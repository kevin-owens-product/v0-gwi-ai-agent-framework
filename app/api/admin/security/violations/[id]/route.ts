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

    const violation = await prisma.securityViolation.findUnique({
      where: { id },
      include: {
        policy: {
          select: {
            id: true,
            name: true,
            type: true,
            scope: true,
            enforcementMode: true,
          },
        },
      },
    })

    if (!violation) {
      return NextResponse.json({ error: "Violation not found" }, { status: 404 })
    }

    return NextResponse.json({ violation })
  } catch (error) {
    console.error("Security violation fetch error:", error)
    return NextResponse.json(
      { error: "Failed to fetch security violation" },
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
      violationType,
      severity,
      description,
      details,
      status: violationStatus,
      resolution,
      resolvedBy,
      resolvedAt,
    } = body

    const existingViolation = await prisma.securityViolation.findUnique({
      where: { id },
    })

    if (!existingViolation) {
      return NextResponse.json({ error: "Violation not found" }, { status: 404 })
    }

    const updateData: Record<string, unknown> = {}
    if (violationType !== undefined) updateData.violationType = violationType
    if (severity !== undefined) updateData.severity = severity
    if (description !== undefined) updateData.description = description
    if (details !== undefined) updateData.details = details
    if (violationStatus !== undefined) updateData.status = violationStatus
    if (resolution !== undefined) updateData.resolution = resolution
    if (resolvedBy !== undefined) updateData.resolvedBy = resolvedBy
    if (resolvedAt !== undefined) updateData.resolvedAt = resolvedAt ? new Date(resolvedAt) : null

    // Auto-set resolvedBy and resolvedAt when status changes to RESOLVED
    if (violationStatus === "RESOLVED" && existingViolation.status !== "RESOLVED") {
      if (!updateData.resolvedBy) updateData.resolvedBy = session.adminId
      if (!updateData.resolvedAt) updateData.resolvedAt = new Date()
    }

    const violation = await prisma.securityViolation.update({
      where: { id },
      data: updateData,
      include: {
        policy: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
      },
    })

    await logPlatformAudit({
      adminId: session.adminId,
      action: "update_security_violation",
      resourceType: "security_violation",
      resourceId: id,
      targetOrgId: violation.orgId ?? undefined,
      targetUserId: violation.userId ?? undefined,
      details: {
        changes: Object.keys(body),
        previousStatus: existingViolation.status,
        newStatus: violation.status,
      },
    })

    return NextResponse.json({ violation })
  } catch (error) {
    console.error("Security violation update error:", error)
    return NextResponse.json(
      { error: "Failed to update security violation" },
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

    const existingViolation = await prisma.securityViolation.findUnique({
      where: { id },
    })

    if (!existingViolation) {
      return NextResponse.json({ error: "Violation not found" }, { status: 404 })
    }

    await prisma.securityViolation.delete({
      where: { id },
    })

    await logPlatformAudit({
      adminId: session.adminId,
      action: "delete_security_violation",
      resourceType: "security_violation",
      resourceId: id,
      targetOrgId: existingViolation.orgId ?? undefined,
      targetUserId: existingViolation.userId ?? undefined,
      details: {
        violationType: existingViolation.violationType,
        severity: existingViolation.severity,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Security violation deletion error:", error)
    return NextResponse.json(
      { error: "Failed to delete security violation" },
      { status: 500 }
    )
  }
}
