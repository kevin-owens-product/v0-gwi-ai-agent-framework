import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { prisma } from "@/lib/db"
import { validateSuperAdminSession } from "@/lib/super-admin"
import { hasGWIPermission } from "@/lib/gwi-permissions"

export async function GET(
  _request: NextRequest,
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

    if (!hasGWIPermission(session.admin.role, "surveys:read")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Verify survey exists
    const survey = await prisma.survey.findUnique({
      where: { id },
    })

    if (!survey) {
      return NextResponse.json({ error: "Survey not found" }, { status: 404 })
    }

    const quotas = await prisma.surveyQuota.findMany({
      where: { surveyId: id, isActive: true },
      orderBy: { createdAt: "desc" },
    })

    const status = quotas.map((quota) => ({
      id: quota.id,
      name: quota.name,
      targetCount: quota.targetCount,
      currentCount: quota.currentCount,
      remaining: Math.max(0, quota.targetCount - quota.currentCount),
      percentage: quota.targetCount > 0
        ? Math.round((quota.currentCount / quota.targetCount) * 100)
        : 0,
      isComplete: quota.currentCount >= quota.targetCount,
      conditions: quota.conditions,
    }))

    const totalTarget = quotas.reduce((sum, q) => sum + q.targetCount, 0)
    const totalCurrent = quotas.reduce((sum, q) => sum + q.currentCount, 0)
    const overallPercentage = totalTarget > 0
      ? Math.round((totalCurrent / totalTarget) * 100)
      : 0

    return NextResponse.json({
      quotas: status,
      summary: {
        totalQuotas: quotas.length,
        totalTarget: totalTarget,
        totalCurrent: totalCurrent,
        totalRemaining: Math.max(0, totalTarget - totalCurrent),
        overallPercentage,
        completedQuotas: quotas.filter((q) => q.currentCount >= q.targetCount).length,
      },
    })
  } catch (error) {
    console.error("Failed to fetch quota status:", error)
    return NextResponse.json(
      { error: "Failed to fetch quota status" },
      { status: 500 }
    )
  }
}
