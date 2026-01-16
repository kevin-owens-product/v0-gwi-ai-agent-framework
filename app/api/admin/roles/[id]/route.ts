import { NextRequest, NextResponse } from "next/server"
import { cookies, headers } from "next/headers"
import { validateSuperAdminSession } from "@/lib/super-admin"
import {
  getRoleById,
  updateRole,
  deleteRole,
  cloneRole,
  getEffectivePermissions,
  getRoleAuditLogs,
  adminHasPermission,
} from "@/lib/roles"

interface RouteParams {
  params: Promise<{ id: string }>
}

/**
 * GET /api/admin/roles/:id
 * Get role details
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
    const hasPermission = await adminHasPermission(session.admin.id, "roles:read")
    if (!hasPermission) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { id } = await params
    const { searchParams } = new URL(request.url)
    const includeEffectivePermissions = searchParams.get("includeEffectivePermissions") === "true"
    const includeAudit = searchParams.get("includeAudit") === "true"

    const role = await getRoleById(id)

    if (!role) {
      return NextResponse.json({ error: "Role not found" }, { status: 404 })
    }

    const response: Record<string, unknown> = { role }

    // Include effective permissions (including inherited) if requested
    if (includeEffectivePermissions) {
      const effectivePermissions = await getEffectivePermissions(id)
      response.effectivePermissions = effectivePermissions
    }

    // Include recent audit logs if requested
    if (includeAudit) {
      const auditResult = await getRoleAuditLogs({ roleId: id, limit: 10 })
      response.auditLogs = auditResult.logs
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error("Get role error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/admin/roles/:id
 * Update a role
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
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
    const hasPermission = await adminHasPermission(session.admin.id, "roles:update")
    if (!hasPermission) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { id } = await params
    const body = await request.json()
    const {
      displayName,
      description,
      permissions,
      parentRoleId,
      color,
      icon,
      isActive,
      priority,
    } = body

    // Get request metadata for audit
    const headersList = await headers()
    const ipAddress = headersList.get("x-forwarded-for") || headersList.get("x-real-ip") || undefined
    const userAgent = headersList.get("user-agent") || undefined

    const role = await updateRole(
      id,
      {
        displayName,
        description,
        permissions,
        parentRoleId,
        color,
        icon,
        isActive,
        priority,
      },
      session.admin.id,
      ipAddress,
      userAgent
    )

    return NextResponse.json({ role })
  } catch (error) {
    console.error("Update role error:", error)

    if (error instanceof Error) {
      if (error.message.includes("not found")) {
        return NextResponse.json(
          { error: error.message },
          { status: 404 }
        )
      }
      if (error.message.includes("circular") || error.message.includes("cannot be")) {
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
 * DELETE /api/admin/roles/:id
 * Delete a role
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
    const hasPermission = await adminHasPermission(session.admin.id, "roles:delete")
    if (!hasPermission) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { id } = await params

    // Get request metadata for audit
    const headersList = await headers()
    const ipAddress = headersList.get("x-forwarded-for") || headersList.get("x-real-ip") || undefined
    const userAgent = headersList.get("user-agent") || undefined

    await deleteRole(id, session.admin.id, ipAddress, userAgent)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete role error:", error)

    if (error instanceof Error) {
      if (error.message.includes("not found")) {
        return NextResponse.json(
          { error: error.message },
          { status: 404 }
        )
      }
      if (error.message.includes("System roles") || error.message.includes("Cannot delete")) {
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
 * POST /api/admin/roles/:id (with action=clone)
 * Clone a role
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
    const hasPermission = await adminHasPermission(session.admin.id, "roles:create")
    if (!hasPermission) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { id } = await params
    const body = await request.json()
    const { action, name, displayName } = body

    if (action !== "clone") {
      return NextResponse.json(
        { error: "Invalid action. Use action=clone to clone a role." },
        { status: 400 }
      )
    }

    if (!name || !displayName) {
      return NextResponse.json(
        { error: "Name and display name are required for cloning" },
        { status: 400 }
      )
    }

    // Validate name format
    if (!/^[a-z0-9-]+$/.test(name)) {
      return NextResponse.json(
        { error: "Name must be lowercase alphanumeric with hyphens only" },
        { status: 400 }
      )
    }

    const role = await cloneRole(id, name, displayName, session.admin.id)

    return NextResponse.json({ role }, { status: 201 })
  } catch (error) {
    console.error("Clone role error:", error)

    if (error instanceof Error) {
      if (error.message.includes("not found")) {
        return NextResponse.json(
          { error: error.message },
          { status: 404 }
        )
      }
      if (error.message.includes("already exists")) {
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
