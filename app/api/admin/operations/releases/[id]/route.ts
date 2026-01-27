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

    const release = await prisma.releaseManagement.findUnique({
      where: { id },
    })

    if (!release) {
      return NextResponse.json({ error: "Release not found" }, { status: 404 })
    }

    // Get creator details
    const creatorDetails = release.createdBy
      ? await prisma.superAdmin.findUnique({
          where: { id: release.createdBy },
          select: { id: true, name: true, email: true, role: true },
        })
      : null

    // Get related maintenance windows during rollout
    const relatedMaintenance = release.startedAt && release.completedAt
      ? await prisma.maintenanceWindow.findMany({
          where: {
            OR: [
              {
                scheduledStart: {
                  gte: release.startedAt,
                  lte: release.completedAt,
                },
              },
              {
                scheduledEnd: {
                  gte: release.startedAt,
                  lte: release.completedAt,
                },
              },
            ],
          },
          select: {
            id: true,
            title: true,
            type: true,
            status: true,
            scheduledStart: true,
            scheduledEnd: true,
          },
          orderBy: { scheduledStart: "desc" },
        })
      : []

    // Get incidents during rollout
    const relatedIncidents = release.startedAt
      ? await prisma.platformIncident.findMany({
          where: {
            startedAt: {
              gte: release.startedAt,
              ...(release.completedAt ? { lte: release.completedAt } : {}),
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
      : []

    // Get audit logs
    const auditLogs = await prisma.platformAuditLog.findMany({
      where: {
        resourceType: "release",
        resourceId: id,
      },
      orderBy: { timestamp: "desc" },
      take: 20,
    })

    return NextResponse.json({
      release: {
        ...release,
        creatorDetails,
        relatedMaintenance,
        relatedIncidents,
        auditLogs,
      },
    })
  } catch (error) {
    console.error("Get release error:", error)
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

    const existingRelease = await prisma.releaseManagement.findUnique({
      where: { id },
    })

    if (!existingRelease) {
      return NextResponse.json({ error: "Release not found" }, { status: 404 })
    }

    const updateData: Record<string, unknown> = { ...body }

    // Handle status transitions
    if (body.status && body.status !== existingRelease.status) {
      switch (body.status) {
        case "ROLLING_OUT":
          if (!existingRelease.startedAt) {
            updateData.startedAt = new Date()
          }
          break
        case "COMPLETED":
          if (!existingRelease.completedAt) {
            updateData.completedAt = new Date()
            updateData.rolloutPercentage = 100
          }
          break
        case "ROLLBACK":
          updateData.rollbackedAt = new Date()
          break
      }
    }

    // Convert date strings to Date objects
    if (body.plannedDate) {
      updateData.plannedDate = new Date(body.plannedDate)
    }

    // Check version uniqueness if changing version
    if (body.version && body.version !== existingRelease.version) {
      const duplicate = await prisma.releaseManagement.findUnique({
        where: { version: body.version },
      })
      if (duplicate) {
        return NextResponse.json(
          { error: "Version already exists" },
          { status: 400 }
        )
      }
    }

    const release = await prisma.releaseManagement.update({
      where: { id },
      data: updateData,
    })

    // Log audit
    await prisma.platformAuditLog.create({
      data: {
        adminId: session.admin.id,
        action: "UPDATE",
        resourceType: "release",
        resourceId: id,
        details: body,
      },
    })

    return NextResponse.json({ release })
  } catch (error) {
    console.error("Update release error:", error)
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

    // Only super admins can delete releases
    if (session.admin.role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 }
      )
    }

    const { id } = await params

    const release = await prisma.releaseManagement.findUnique({
      where: { id },
    })

    if (!release) {
      return NextResponse.json({ error: "Release not found" }, { status: 404 })
    }

    // Don't allow deletion of releases that are rolling out or completed
    if (["ROLLING_OUT", "COMPLETED"].includes(release.status)) {
      return NextResponse.json(
        { error: "Cannot delete a release that is rolling out or completed" },
        { status: 400 }
      )
    }

    await prisma.releaseManagement.delete({
      where: { id },
    })

    // Log audit
    await prisma.platformAuditLog.create({
      data: {
        adminId: session.admin.id,
        action: "DELETE",
        resourceType: "release",
        resourceId: id,
        details: { version: release.version },
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete release error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
