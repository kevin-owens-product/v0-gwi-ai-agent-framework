/**
 * @prompt-id forge-v4.1:feature:customer-health-scoring:004
 * @generated-at 2026-01-25T00:00:00Z
 * @model claude-opus-4-5
 */

import { NextResponse } from "next/server"
import { validateSuperAdminSession, logPlatformAudit } from "@/lib/super-admin"
import { batchCalculateHealthScores } from "@/lib/health-score"
import { cookies } from "next/headers"

export async function POST() {
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

    // Start batch calculation
    const startTime = Date.now()
    const result = await batchCalculateHealthScores()
    const duration = Date.now() - startTime

    // Log the batch calculation
    await logPlatformAudit({
      adminId: session.admin.id,
      action: "batch_calculate_health_scores",
      resourceType: "system",
      details: {
        succeeded: result.succeeded,
        failed: result.failed,
        total: result.total,
        durationMs: duration,
      },
    })

    return NextResponse.json({
      success: true,
      calculated: result.succeeded,
      failed: result.failed,
      total: result.total,
      durationMs: duration,
    })
  } catch (error) {
    console.error("Batch calculate health scores error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
