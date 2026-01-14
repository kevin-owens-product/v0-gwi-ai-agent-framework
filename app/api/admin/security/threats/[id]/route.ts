import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { prisma } from "@/lib/db"
import { validateSuperAdminSession, logPlatformAudit } from "@/lib/super-admin"

export async function GET(
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

    const threat = await prisma.threatEvent.findUnique({
      where: { id },
    })

    if (!threat) {
      return NextResponse.json({ error: "Threat event not found" }, { status: 404 })
    }

    // Get related threats if any
    let relatedThreats: Awaited<ReturnType<typeof prisma.threatEvent.findMany>> = []
    if (threat.relatedEvents && threat.relatedEvents.length > 0) {
      relatedThreats = await prisma.threatEvent.findMany({
        where: {
          id: { in: threat.relatedEvents },
        },
      })
    }

    return NextResponse.json({ threat, relatedThreats })
  } catch (error) {
    console.error("Threat event fetch error:", error)
    return NextResponse.json(
      { error: "Failed to fetch threat event" },
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
      type,
      severity,
      source,
      description,
      details,
      indicators,
      status: threatStatus,
      mitigation,
      mitigatedBy,
      mitigatedAt,
      relatedEvents,
    } = body

    const existingThreat = await prisma.threatEvent.findUnique({
      where: { id },
    })

    if (!existingThreat) {
      return NextResponse.json({ error: "Threat event not found" }, { status: 404 })
    }

    const updateData: Record<string, unknown> = {}
    if (type !== undefined) updateData.type = type
    if (severity !== undefined) updateData.severity = severity
    if (source !== undefined) updateData.source = source
    if (description !== undefined) updateData.description = description
    if (details !== undefined) updateData.details = details
    if (indicators !== undefined) updateData.indicators = indicators
    if (threatStatus !== undefined) updateData.status = threatStatus
    if (mitigation !== undefined) updateData.mitigation = mitigation
    if (mitigatedBy !== undefined) updateData.mitigatedBy = mitigatedBy
    if (mitigatedAt !== undefined) updateData.mitigatedAt = mitigatedAt ? new Date(mitigatedAt) : null
    if (relatedEvents !== undefined) updateData.relatedEvents = relatedEvents

    // Auto-set mitigatedBy and mitigatedAt when status changes to MITIGATED
    if (threatStatus === "MITIGATED" && existingThreat.status !== "MITIGATED") {
      if (!updateData.mitigatedBy) updateData.mitigatedBy = session.adminId
      if (!updateData.mitigatedAt) updateData.mitigatedAt = new Date()
    }

    const threat = await prisma.threatEvent.update({
      where: { id },
      data: updateData,
    })

    await logPlatformAudit({
      adminId: session.adminId,
      action: "update_threat_event",
      resourceType: "threat_event",
      resourceId: id,
      targetOrgId: threat.orgId ?? undefined,
      targetUserId: threat.userId ?? undefined,
      details: {
        changes: Object.keys(body),
        previousStatus: existingThreat.status,
        newStatus: threat.status,
      },
    })

    return NextResponse.json({ threat })
  } catch (error) {
    console.error("Threat event update error:", error)
    return NextResponse.json(
      { error: "Failed to update threat event" },
      { status: 500 }
    )
  }
}

export async function PATCH(
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
    const { status: threatStatus, mitigation } = body

    if (!threatStatus) {
      return NextResponse.json(
        { error: "status is required for PATCH request" },
        { status: 400 }
      )
    }

    const existingThreat = await prisma.threatEvent.findUnique({
      where: { id },
    })

    if (!existingThreat) {
      return NextResponse.json({ error: "Threat event not found" }, { status: 404 })
    }

    const updateData: Record<string, unknown> = {
      status: threatStatus,
    }

    if (mitigation !== undefined) {
      updateData.mitigation = mitigation
    }

    // Auto-set mitigatedBy and mitigatedAt for mitigation-related statuses
    if (
      (threatStatus === "MITIGATED" || threatStatus === "CONTAINED" || threatStatus === "RESOLVED") &&
      existingThreat.status === "ACTIVE"
    ) {
      updateData.mitigatedBy = session.adminId
      updateData.mitigatedAt = new Date()
    }

    const threat = await prisma.threatEvent.update({
      where: { id },
      data: updateData,
    })

    await logPlatformAudit({
      adminId: session.adminId,
      action: "update_threat_status",
      resourceType: "threat_event",
      resourceId: id,
      targetOrgId: threat.orgId ?? undefined,
      targetUserId: threat.userId ?? undefined,
      details: {
        previousStatus: existingThreat.status,
        newStatus: threat.status,
        mitigation: mitigation || null,
      },
    })

    return NextResponse.json({ threat })
  } catch (error) {
    console.error("Threat event status update error:", error)
    return NextResponse.json(
      { error: "Failed to update threat event status" },
      { status: 500 }
    )
  }
}

export async function DELETE(
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

    const existingThreat = await prisma.threatEvent.findUnique({
      where: { id },
    })

    if (!existingThreat) {
      return NextResponse.json({ error: "Threat event not found" }, { status: 404 })
    }

    await prisma.threatEvent.delete({
      where: { id },
    })

    await logPlatformAudit({
      adminId: session.adminId,
      action: "delete_threat_event",
      resourceType: "threat_event",
      resourceId: id,
      targetOrgId: existingThreat.orgId ?? undefined,
      targetUserId: existingThreat.userId ?? undefined,
      details: {
        type: existingThreat.type,
        severity: existingThreat.severity,
        status: existingThreat.status,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Threat event deletion error:", error)
    return NextResponse.json(
      { error: "Failed to delete threat event" },
      { status: 500 }
    )
  }
}
