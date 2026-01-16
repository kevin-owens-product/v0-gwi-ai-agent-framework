import { NextRequest, NextResponse } from "next/server"
import { cookies, headers } from "next/headers"
import { validateSuperAdminSession } from "@/lib/super-admin"
import {
  assignRoleToAdmin,
  removeRoleFromAdmin,
  adminHasPermission,
} from "@/lib/roles"

interface RouteParams {
  params: Promise<{ id: string }>
}

/**
 * POST /api/admin/roles/:id/assign
 * Assign this role to an admin
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
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
    const hasPermission = await adminHasPermission(session.admin.id, "roles:assign")
    if (!hasPermission) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { id: roleId } = await params
    const body = await request.json()
    const { adminId } = body

    if (!adminId) {
      return NextResponse.json(
        { error: "Admin ID is required" },
        { status: 400 }
      )
    }

    // Get request metadata for audit
    const headersList = await headers()
    const ipAddress = headersList.get("x-forwarded-for") || headersList.get("x-real-ip") || undefined
    const userAgent = headersList.get("user-agent") || undefined

    const admin = await assignRoleToAdmin(
      adminId,
      roleId,
      session.admin.id,
      ipAddress,
      userAgent
    )

    return NextResponse.json({ admin })
  } catch (error) {
    console.error("Assign role error:", error)

    if (error instanceof Error) {
      if (error.message.includes("not found")) {
        return NextResponse.json(
          { error: error.message },
          { status: 404 }
        )
      }
      if (error.message.includes("Can only assign")) {
        return NextResponse.json(
          { error: error.message },
          { status: 400 }
        )
      }
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/admin/roles/:id/assign
 * Remove role from an admin
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
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
    const hasPermission = await adminHasPermission(session.admin.id, "roles:assign")
    if (!hasPermission) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Role ID from params is not used for removal, we get adminId from body
    await params // acknowledge the params
    const body = await request.json()
    const { adminId } = body

    if (!adminId) {
      return NextResponse.json(
        { error: "Admin ID is required" },
        { status: 400 }
      )
    }

    // Get request metadata for audit
    const headersList = await headers()
    const ipAddress = headersList.get("x-forwarded-for") || headersList.get("x-real-ip") || undefined
    const userAgent = headersList.get("user-agent") || undefined

    const admin = await removeRoleFromAdmin(
      adminId,
      session.admin.id,
      ipAddress,
      userAgent
    )

    return NextResponse.json({ admin })
  } catch (error) {
    console.error("Remove role error:", error)

    if (error instanceof Error) {
      if (error.message.includes("not found")) {
        return NextResponse.json(
          { error: error.message },
          { status: 404 }
        )
      }
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
