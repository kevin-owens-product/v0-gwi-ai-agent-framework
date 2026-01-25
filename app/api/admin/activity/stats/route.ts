/**
 * @prompt-id forge-v4.1:feature:admin-activity:003
 * @generated-at 2026-01-25T00:00:00Z
 * @model claude-opus-4-5
 */

import { NextRequest, NextResponse } from "next/server"
import { validateSuperAdminSession } from "@/lib/super-admin"
import { getActivityStats } from "@/lib/admin-activity"
import { cookies } from "next/headers"

export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url)
    const adminId = searchParams.get("adminId") || undefined
    const startDateStr = searchParams.get("startDate")
    const endDateStr = searchParams.get("endDate")

    const startDate = startDateStr ? new Date(startDateStr) : undefined
    const endDate = endDateStr ? new Date(endDateStr) : undefined

    const stats = await getActivityStats({
      adminId,
      startDate,
      endDate,
    })

    return NextResponse.json(stats)
  } catch (error) {
    console.error("Get activity stats error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
