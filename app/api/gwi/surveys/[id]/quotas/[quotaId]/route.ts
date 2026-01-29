import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { prisma } from "@/lib/db"
import { validateSuperAdminSession } from "@/lib/super-admin"
import { hasGWIPermission } from "@/lib/gwi-permissions"

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; quotaId: string }> }
) {
  try {
    const { id, quotaId } = await params
    const cookieStore = await cookies()
    const token = cookieStore.get("gwiToken")?.value

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const session = await validateSuperAdminSession(token)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (!hasGWIPermission(session.admin.role, "surveys:write")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Verify quota exists and belongs to survey
    const existingQuota = await prisma.surveyQuota.findFirst({
      where: { id: quotaId, surveyId: id },
    })

    if (!existingQuota) {
      return NextResponse.json({ error: "Quota not found" }, { status: 404 })
    }

    const body = await request.json()
    const { name, targetCount, conditions, isActive } = body

    const updateData: Record<string, unknown> = {}
    if (name !== undefined) updateData.name = name
    if (targetCount !== undefined) {
      if (targetCount < 0) {
        return NextResponse.json(
          { error: "targetCount must be non-negative" },
          { status: 400 }
        )
      }
      updateData.targetCount = targetCount
    }
    if (conditions !== undefined) updateData.conditions = conditions
    if (isActive !== undefined) updateData.isActive = isActive

    const quota = await prisma.surveyQuota.update({
      where: { id: quotaId },
      data: updateData,
    })

    // Log the action
    await prisma.gWIAuditLog.create({
      data: {
        adminId: session.admin.id,
        action: "UPDATE_QUOTA",
        resourceType: "survey_quota",
        resourceId: quota.id,
        previousState: {
          name: existingQuota.name,
          targetCount: existingQuota.targetCount,
          currentCount: existingQuota.currentCount,
        },
        newState: updateData,
      },
    })

    return NextResponse.json(quota)
  } catch (error) {
    console.error("Failed to update quota:", error)
    return NextResponse.json(
      { error: "Failed to update quota" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; quotaId: string }> }
) {
  try {
    const { id, quotaId } = await params
    const cookieStore = await cookies()
    const token = cookieStore.get("gwiToken")?.value

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const session = await validateSuperAdminSession(token)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (!hasGWIPermission(session.admin.role, "surveys:write")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Verify quota exists and belongs to survey
    const existingQuota = await prisma.surveyQuota.findFirst({
      where: { id: quotaId, surveyId: id },
    })

    if (!existingQuota) {
      return NextResponse.json({ error: "Quota not found" }, { status: 404 })
    }

    await prisma.surveyQuota.delete({
      where: { id: quotaId },
    })

    // Log the action
    await prisma.gWIAuditLog.create({
      data: {
        adminId: session.admin.id,
        action: "DELETE_QUOTA",
        resourceType: "survey_quota",
        resourceId: quotaId,
        previousState: {
          name: existingQuota.name,
          targetCount: existingQuota.targetCount,
        },
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to delete quota:", error)
    return NextResponse.json(
      { error: "Failed to delete quota" },
      { status: 500 }
    )
  }
}
