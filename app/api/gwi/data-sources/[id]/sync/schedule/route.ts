import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { prisma } from "@/lib/db"
import { validateSuperAdminSession } from "@/lib/super-admin"
import { hasGWIPermission } from "@/lib/gwi-permissions"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const cookieStore = await cookies()
    const token = cookieStore.get("gwiToken")?.value

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const session = await validateSuperAdminSession(token)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (!hasGWIPermission(session.admin.role, "datasources:write")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const dataSource = await prisma.gWIDataSourceConnection.findUnique({
      where: { id },
    })

    if (!dataSource) {
      return NextResponse.json(
        { error: "Data source not found" },
        { status: 404 }
      )
    }

    const body = await request.json()
    const { schedule, isActive = true } = body

    if (!schedule) {
      return NextResponse.json(
        { error: "Schedule (cron expression) is required" },
        { status: 400 }
      )
    }

    // Basic cron validation (5 or 6 fields)
    const cronParts = schedule.trim().split(/\s+/)
    if (cronParts.length !== 5 && cronParts.length !== 6) {
      return NextResponse.json(
        { error: "Invalid cron expression format" },
        { status: 400 }
      )
    }

    // Calculate next run time (simplified - in production use a cron parser)
    const nextRunAt = new Date()
    nextRunAt.setHours(nextRunAt.getHours() + 1) // Placeholder

    const syncSchedule = await prisma.dataSourceSyncSchedule.create({
      data: {
        dataSourceId: id,
        schedule,
        isActive,
        nextRunAt,
      },
    })

    // Log the action
    await prisma.gWIAuditLog.create({
      data: {
        adminId: session.admin.id,
        action: "CREATE_SYNC_SCHEDULE",
        resourceType: "data_source_schedule",
        resourceId: syncSchedule.id,
        newState: {
          dataSourceId: id,
          schedule,
        },
      },
    })

    return NextResponse.json(syncSchedule, { status: 201 })
  } catch (error) {
    console.error("Failed to create sync schedule:", error)
    return NextResponse.json(
      { error: "Failed to create sync schedule" },
      { status: 500 }
    )
  }
}
