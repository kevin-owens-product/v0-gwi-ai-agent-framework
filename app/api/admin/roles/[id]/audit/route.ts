import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { validateSuperAdminSession } from "@/lib/super-admin"
import { getRoleAuditLogs, adminHasPermission } from "@/lib/roles"
import type { RoleAuditAction } from "@prisma/client"

interface RouteParams {
  params: Promise<{ id: string }>
}

/**
 * GET /api/admin/roles/:id/audit
 * Get audit logs for a specific role
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
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

    // Check permission
    const hasPermission = await adminHasPermission(session.admin.id, "audit:read")
    if (!hasPermission) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { id: roleId } = await params
    const { searchParams } = new URL(request.url)
    const action = searchParams.get("action") as RoleAuditAction | null
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "50")

    const result = await getRoleAuditLogs({
      roleId,
      action: action || undefined,
      page,
      limit,
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error("Get role audit logs error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
