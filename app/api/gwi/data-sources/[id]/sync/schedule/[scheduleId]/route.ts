import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { prisma } from "@/lib/db"
import { validateSuperAdminSession } from "@/lib/super-admin"
import { hasGWIPermission } from "@/lib/gwi-permissions"

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; scheduleId: string }> }
) {
  try {
    const { id, scheduleId } = await params
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

    // Verify schedule exists and belongs to data source
    const schedule = await prisma.dataSourceSyncSchedule.findFirst({
      where: { id: scheduleId, dataSourceId: id },
    })

    if (!schedule) {
      return NextResponse.json({ error: "Schedule not found" }, { status: 404 })
    }

    await prisma.dataSourceSyncSchedule.delete({
      where: { id: scheduleId },
    })

    // Log the action
    await prisma.gWIAuditLog.create({
      data: {
        adminId: session.admin.id,
        action: "DELETE_SYNC_SCHEDULE",
        resourceType: "data_source_schedule",
        resourceId: scheduleId,
        previousState: {
          dataSourceId: id,
          schedule: schedule.schedule,
        },
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to delete sync schedule:", error)
    return NextResponse.json(
      { error: "Failed to delete sync schedule" },
      { status: 500 }
    )
  }
}
