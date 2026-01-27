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

    const window = await prisma.maintenanceWindow.findUnique({
      where: { id },
    })

    if (!window) {
      return NextResponse.json({ error: "Maintenance window not found" }, { status: 404 })
    }

    // Get creator details
    const creatorDetails = window.createdBy
      ? await prisma.superAdmin.findUnique({
          where: { id: window.createdBy },
          select: { id: true, name: true, email: true, role: true },
        })
      : null

    // Get related incidents during this window
    const relatedIncidents = await prisma.platformIncident.findMany({
      where: {
        startedAt: {
          gte: window.scheduledStart,
          lte: window.scheduledEnd,
        },
      },
      select: {
        id: true,
        title: true,
        severity: true,
        status: true,
        startedAt: true,
      },
      orderBy: { startedAt: "desc" },
    })

    // Get audit logs
    const auditLogs = await prisma.platformAuditLog.findMany({
      where: {
        resourceType: "maintenance_window",
        resourceId: id,
      },
      orderBy: { timestamp: "desc" },
      take: 10,
    })

    return NextResponse.json({
      window: {
        ...window,
        creatorDetails,
        relatedIncidents,
        auditLogs,
      },
    })
  } catch (error) {
    console.error("Get maintenance window error:", error)
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

    const existingWindow = await prisma.maintenanceWindow.findUnique({
      where: { id },
    })

    if (!existingWindow) {
      return NextResponse.json({ error: "Maintenance window not found" }, { status: 404 })
    }

    // Handle status transitions
    const updateData: Record<string, unknown> = { ...body }

    if (body.status === "IN_PROGRESS" && existingWindow.status === "SCHEDULED") {
      updateData.actualStart = new Date()
    }

    if (body.status === "COMPLETED" && existingWindow.status === "IN_PROGRESS") {
      updateData.actualEnd = new Date()
    }

    // Convert date strings to Date objects
    if (body.scheduledStart) {
      updateData.scheduledStart = new Date(body.scheduledStart)
    }
    if (body.scheduledEnd) {
      updateData.scheduledEnd = new Date(body.scheduledEnd)
    }

    const window = await prisma.maintenanceWindow.update({
      where: { id },
      data: updateData,
    })

    // Log audit
    await prisma.platformAuditLog.create({
      data: {
        adminId: session.admin.id,
        action: "UPDATE",
        resourceType: "maintenance_window",
        resourceId: id,
        details: body,
      },
    })

    return NextResponse.json({ window })
  } catch (error) {
    console.error("Update maintenance window error:", error)
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

    const { id } = await params

    const window = await prisma.maintenanceWindow.findUnique({
      where: { id },
    })

    if (!window) {
      return NextResponse.json({ error: "Maintenance window not found" }, { status: 404 })
    }

    // Only allow deletion of scheduled windows
    if (window.status === "IN_PROGRESS") {
      return NextResponse.json(
        { error: "Cannot delete an in-progress maintenance window" },
        { status: 400 }
      )
    }

    await prisma.maintenanceWindow.delete({
      where: { id },
    })

    // Log audit
    await prisma.platformAuditLog.create({
      data: {
        adminId: session.admin.id,
        action: "DELETE",
        resourceType: "maintenance_window",
        resourceId: id,
        details: { title: window.title },
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete maintenance window error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
