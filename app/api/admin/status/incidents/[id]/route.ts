import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { validateSuperAdminSession } from "@/lib/super-admin"
import { cookies } from "next/headers"

export async function GET(
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

    const incident = await prisma.statusPageIncident.findUnique({
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

    return NextResponse.json({ incident })
  } catch (error) {
    console.error("Get status page incident error:", error)
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

    const existingIncident = await prisma.statusPageIncident.findUnique({
      where: { id },
    })

    if (!existingIncident) {
      return NextResponse.json({ error: "Incident not found" }, { status: 404 })
    }

    const updateData: Record<string, unknown> = {}

    if (body.title !== undefined) updateData.title = body.title
    if (body.description !== undefined) updateData.description = body.description
    if (body.status !== undefined) updateData.status = body.status
    if (body.impact !== undefined) updateData.impact = body.impact
    if (body.affectedSystems !== undefined) updateData.affectedSystems = body.affectedSystems
    if (body.isPublic !== undefined) updateData.isPublic = body.isPublic
    if (body.postmortemUrl !== undefined) updateData.postmortemUrl = body.postmortemUrl

    // Set resolved timestamp if resolving
    if (body.status === "RESOLVED" && !existingIncident.resolvedAt) {
      updateData.resolvedAt = new Date()
    }

    const incident = await prisma.statusPageIncident.update({
      where: { id },
      data: updateData,
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
        resourceType: "status_page_incident",
        resourceId: id,
        details: body,
      },
    })

    return NextResponse.json({ incident })
  } catch (error) {
    console.error("Update status page incident error:", error)
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

    // Only super admins can delete incidents
    if (session.admin.role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 }
      )
    }

    const { id } = await params

    const incident = await prisma.statusPageIncident.findUnique({
      where: { id },
    })

    if (!incident) {
      return NextResponse.json({ error: "Incident not found" }, { status: 404 })
    }

    // Delete incident (cascade deletes updates)
    await prisma.statusPageIncident.delete({
      where: { id },
    })

    // Log audit
    await prisma.platformAuditLog.create({
      data: {
        adminId: session.admin.id,
        action: "DELETE",
        resourceType: "status_page_incident",
        resourceId: id,
        details: { title: incident.title },
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete status page incident error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
