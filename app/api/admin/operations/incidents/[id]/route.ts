import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { validateSuperAdminSession } from "@/lib/super-admin"
import { cookies } from "next/headers"

export async function GET(
  _request: NextRequest,
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

    const incident = await prisma.platformIncident.findUnique({
      where: { id },
      include: {
        updates: {
          orderBy: { createdAt: "desc" },
        },
      },
    })

    if (!incident) {
      return NextResponse.json({ error: "Incident not found" }, { status: 404 })
    }

    // Get affected organization details
    const affectedOrgDetails = incident.affectedOrgs.length > 0
      ? await prisma.organization.findMany({
          where: { id: { in: incident.affectedOrgs } },
          select: { id: true, name: true, slug: true, planTier: true },
        })
      : []

    // Get responder details
    const responderDetails = incident.responders.length > 0
      ? await prisma.superAdmin.findMany({
          where: { id: { in: incident.responders } },
          select: { id: true, name: true, email: true, role: true },
        })
      : []

    // Get commander details
    const commanderDetails = incident.commanderId
      ? await prisma.superAdmin.findUnique({
          where: { id: incident.commanderId },
          select: { id: true, name: true, email: true, role: true },
        })
      : null

    return NextResponse.json({
      incident: {
        ...incident,
        affectedOrgDetails,
        responderDetails,
        commanderDetails,
      },
    })
  } catch (error) {
    console.error("Get incident error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function PUT(
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

    const existingIncident = await prisma.platformIncident.findUnique({
      where: { id },
    })

    if (!existingIncident) {
      return NextResponse.json({ error: "Incident not found" }, { status: 404 })
    }

    // Build timeline event if status changed
    let timeline = existingIncident.timeline as Array<Record<string, unknown>>
    if (body.status && body.status !== existingIncident.status) {
      timeline = [
        ...timeline,
        {
          timestamp: new Date().toISOString(),
          event: `Status changed from ${existingIncident.status} to ${body.status}`,
          actor: session.admin.name || session.admin.email,
        },
      ]

      // Set resolved timestamp if resolving
      if (body.status === "RESOLVED" && !existingIncident.resolvedAt) {
        body.resolvedAt = new Date()
      }

      // Set mitigated timestamp if monitoring
      if (body.status === "MONITORING" && !existingIncident.mitigatedAt) {
        body.mitigatedAt = new Date()
      }

      // Set acknowledged timestamp if identified
      if (body.status === "IDENTIFIED" && !existingIncident.acknowledgedAt) {
        body.acknowledgedAt = new Date()
      }
    }

    const incident = await prisma.platformIncident.update({
      where: { id },
      data: {
        ...body,
        timeline,
        updatedAt: new Date(),
      },
      include: {
        updates: {
          orderBy: { createdAt: "desc" },
        },
      },
    })

    // Log audit
    await prisma.platformAuditLog.create({
      data: {
        adminId: session.admin.id,
        action: "UPDATE",
        resourceType: "incident",
        resourceId: id,
        details: body,
      },
    })

    return NextResponse.json({ incident })
  } catch (error) {
    console.error("Update incident error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // PATCH is an alias for PUT with partial updates
  return PUT(request, { params })
}

export async function DELETE(
  _request: NextRequest,
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

    // Only super admins can delete incidents
    if (session.admin.role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 }
      )
    }

    const { id } = await params

    await prisma.platformIncident.delete({
      where: { id },
    })

    // Log audit
    await prisma.platformAuditLog.create({
      data: {
        adminId: session.admin.id,
        action: "DELETE",
        resourceType: "incident",
        resourceId: id,
        details: {},
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete incident error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
