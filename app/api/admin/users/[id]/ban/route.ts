import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { validateSuperAdminSession, banUser } from "@/lib/super-admin"
import { logAdminActivity, AdminActivityAction, AdminResourceType } from "@/lib/admin-activity"
import { prisma } from "@/lib/db"

export async function POST(
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
    const { reason, banType = "TEMPORARY", expiresAt, orgId } = body

    if (!reason) {
      return NextResponse.json(
        { error: "Reason is required" },
        { status: 400 }
      )
    }

    // Get user info for logging
    const user = await prisma.user.findUnique({
      where: { id },
      select: { name: true, email: true },
    })

    const ban = await banUser({
      userId: id,
      orgId,
      reason,
      bannedBy: session.admin.id,
      banType,
      expiresAt: expiresAt ? new Date(expiresAt) : undefined,
    })

    // Log admin activity
    await logAdminActivity({
      adminId: session.admin.id,
      action: AdminActivityAction.USER_BAN,
      resourceType: AdminResourceType.USER,
      resourceId: id,
      description: `Banned user: ${user?.name || user?.email || 'Unknown'}`,
      metadata: {
        reason,
        banType,
        expiresAt,
        userEmail: user?.email,
        orgId,
      },
    })

    return NextResponse.json({ ban })
  } catch (error) {
    console.error("Ban user error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
