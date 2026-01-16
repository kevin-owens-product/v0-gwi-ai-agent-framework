import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { validateSuperAdminSession } from "@/lib/super-admin"
import {
  getRoles,
  createRole,
  getRoleHierarchy,
  adminHasPermission,
} from "@/lib/roles"
import type { RoleScope } from "@prisma/client"

/**
 * GET /api/admin/roles
 * List all roles with optional filtering
 */
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

    // Check permission
    const hasPermission = await adminHasPermission(session.admin.id, "roles:list")
    if (!hasPermission) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const scope = searchParams.get("scope") as RoleScope | null
    const isActive = searchParams.get("isActive")
    const search = searchParams.get("search")
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "50")
    const view = searchParams.get("view") // "list" or "hierarchy"

    if (view === "hierarchy" && scope) {
      const hierarchy = await getRoleHierarchy(scope)
      return NextResponse.json({ hierarchy })
    }

    const result = await getRoles({
      scope: scope || undefined,
      isActive: isActive === "true" ? true : isActive === "false" ? false : undefined,
      search: search || undefined,
      includeAdmins: true,
      page,
      limit,
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error("Get roles error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

/**
 * POST /api/admin/roles
 * Create a new role
 */
export async function POST(request: NextRequest) {
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

    const body = await request.json()
    const {
      name,
      displayName,
      description,
      scope = "PLATFORM",
      permissions = [],
      parentRoleId,
      color,
      icon,
      priority = 0,
    } = body

    // Validation
    if (!name || !displayName) {
      return NextResponse.json(
        { error: "Name and display name are required" },
        { status: 400 }
      )
    }

    // Validate name format (lowercase, alphanumeric, hyphens only)
    if (!/^[a-z0-9-]+$/.test(name)) {
      return NextResponse.json(
        { error: "Name must be lowercase alphanumeric with hyphens only" },
        { status: 400 }
      )
    }

    // Validate scope
    if (scope !== "PLATFORM" && scope !== "TENANT") {
      return NextResponse.json(
        { error: "Scope must be PLATFORM or TENANT" },
        { status: 400 }
      )
    }

    const role = await createRole(
      {
        name,
        displayName,
        description,
        scope: scope as RoleScope,
        permissions,
        parentRoleId,
        color,
        icon,
        isSystem: false,
        priority,
        createdById: session.admin.id,
      },
      session.admin.id
    )

    return NextResponse.json({ role }, { status: 201 })
  } catch (error) {
    console.error("Create role error:", error)

    if (error instanceof Error) {
      if (error.message.includes("already exists")) {
        return NextResponse.json(
          { error: error.message },
          { status: 400 }
        )
      }
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
