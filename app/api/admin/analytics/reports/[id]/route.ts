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
      return NextResponse.json({ error: "Invalid session" }, { status: 401 })
    }

    const { id } = await params

    const report = await prisma.customReport.findUnique({
      where: { id },
    })

    if (!report) {
      return NextResponse.json(
        { error: "Custom report not found" },
        { status: 404 }
      )
    }

    // Get run history from audit logs
    const runHistory = await prisma.platformAuditLog.findMany({
      where: {
        resourceType: "custom_report",
        resourceId: id,
        action: { in: ["RUN_CUSTOM_REPORT", "CUSTOM_REPORT_COMPLETED", "CUSTOM_REPORT_FAILED"] },
      },
      orderBy: { timestamp: "desc" },
      take: 20,
    })

    // Get modification history
    const auditLogs = await prisma.platformAuditLog.findMany({
      where: {
        resourceType: "custom_report",
        resourceId: id,
        action: { notIn: ["RUN_CUSTOM_REPORT", "CUSTOM_REPORT_COMPLETED", "CUSTOM_REPORT_FAILED"] },
      },
      orderBy: { timestamp: "desc" },
      take: 10,
    })

    return NextResponse.json({
      report,
      runHistory,
      auditLogs,
    })
  } catch (error) {
    console.error("Get custom report error:", error)
    return NextResponse.json(
      { error: "Failed to fetch custom report" },
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
      return NextResponse.json({ error: "Invalid session" }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()

    const existingReport = await prisma.customReport.findUnique({
      where: { id },
    })

    if (!existingReport) {
      return NextResponse.json(
        { error: "Custom report not found" },
        { status: 404 }
      )
    }

    const {
      name,
      description,
      type,
      query,
      schedule,
      recipients,
      format,
      isActive,
    } = body

    // Calculate next run time if schedule changed
    let nextRunAt = existingReport.nextRunAt
    if (schedule && schedule !== existingReport.schedule) {
      const now = new Date()
      if (schedule === "daily") {
        nextRunAt = new Date(now)
        nextRunAt.setDate(nextRunAt.getDate() + 1)
        nextRunAt.setHours(0, 0, 0, 0)
      } else if (schedule === "weekly") {
        nextRunAt = new Date(now)
        nextRunAt.setDate(nextRunAt.getDate() + (7 - nextRunAt.getDay()))
        nextRunAt.setHours(0, 0, 0, 0)
      } else if (schedule === "monthly") {
        nextRunAt = new Date(now)
        nextRunAt.setMonth(nextRunAt.getMonth() + 1)
        nextRunAt.setDate(1)
        nextRunAt.setHours(0, 0, 0, 0)
      } else {
        nextRunAt = null
      }
    } else if (!schedule) {
      nextRunAt = null
    }

    const report = await prisma.customReport.update({
      where: { id },
      data: {
        name: name !== undefined ? name : existingReport.name,
        description: description !== undefined ? description : existingReport.description,
        type: type !== undefined ? type : existingReport.type,
        query: query !== undefined ? query : existingReport.query,
        schedule: schedule !== undefined ? schedule : existingReport.schedule,
        recipients: recipients !== undefined ? recipients : existingReport.recipients,
        format: format !== undefined ? format : existingReport.format,
        isActive: isActive !== undefined ? isActive : existingReport.isActive,
        nextRunAt,
        metadata: {
          ...(existingReport.metadata as object || {}),
          lastModifiedBy: session.admin.id,
          lastModifiedAt: new Date().toISOString(),
        },
      },
    })

    // Log the action
    await prisma.platformAuditLog.create({
      data: {
        adminId: session.admin.id,
        action: "UPDATE_CUSTOM_REPORT",
        resourceType: "custom_report",
        resourceId: report.id,
        details: {
          changes: Object.keys(body),
          previousValues: {
            name: existingReport.name,
            type: existingReport.type,
            isActive: existingReport.isActive,
          },
        },
      },
    })

    return NextResponse.json({ report })
  } catch (error) {
    console.error("Update custom report error:", error)
    return NextResponse.json(
      { error: "Failed to update custom report" },
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
      return NextResponse.json({ error: "Invalid session" }, { status: 401 })
    }

    const { id } = await params

    const existingReport = await prisma.customReport.findUnique({
      where: { id },
    })

    if (!existingReport) {
      return NextResponse.json(
        { error: "Custom report not found" },
        { status: 404 }
      )
    }

    await prisma.customReport.delete({
      where: { id },
    })

    // Log the action
    await prisma.platformAuditLog.create({
      data: {
        adminId: session.admin.id,
        action: "DELETE_CUSTOM_REPORT",
        resourceType: "custom_report",
        resourceId: id,
        details: {
          name: existingReport.name,
          type: existingReport.type,
        },
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete custom report error:", error)
    return NextResponse.json(
      { error: "Failed to delete custom report" },
      { status: 500 }
    )
  }
}
