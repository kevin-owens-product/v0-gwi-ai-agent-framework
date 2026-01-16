import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { validateSuperAdminSession } from "@/lib/super-admin"
import {
  getPermissionsFromRegistry,
  getPermissionsByCategory,
  PLATFORM_PERMISSIONS,
  TENANT_PERMISSIONS,
  PERMISSION_CATEGORIES,
} from "@/lib/permissions"
import { adminHasPermission } from "@/lib/roles"
import type { RoleScope } from "@prisma/client"

/**
 * GET /api/admin/permissions
 * List all available permissions
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

    // Check permission - need roles:read to view permissions
    const hasPermission = await adminHasPermission(session.admin.id, "roles:read")
    if (!hasPermission) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const scope = searchParams.get("scope") as RoleScope | null
    const category = searchParams.get("category")
    const grouped = searchParams.get("grouped") === "true"
    const source = searchParams.get("source") || "constants" // "constants" or "database"

    // If source is "database", fetch from Permission model
    if (source === "database") {
      if (grouped && scope) {
        const permissionsByCategory = await getPermissionsByCategory(scope)
        return NextResponse.json({
          permissions: permissionsByCategory,
          categories: scope === "PLATFORM"
            ? PERMISSION_CATEGORIES.PLATFORM
            : PERMISSION_CATEGORIES.TENANT,
        })
      }

      const permissions = await getPermissionsFromRegistry({
        scope: scope || undefined,
        category: category || undefined,
      })

      return NextResponse.json({
        permissions,
        total: permissions.length,
      })
    }

    // Otherwise, return from constants (faster, no DB call)
    const platformPermissions = Object.entries(PLATFORM_PERMISSIONS).map(
      ([key, value]) => ({
        key,
        ...value,
        scope: "PLATFORM" as RoleScope,
      })
    )

    const tenantPermissions = Object.entries(TENANT_PERMISSIONS).map(
      ([key, value]) => ({
        key,
        ...value,
        scope: "TENANT" as RoleScope,
      })
    )

    let permissions = scope === "PLATFORM"
      ? platformPermissions
      : scope === "TENANT"
        ? tenantPermissions
        : [...platformPermissions, ...tenantPermissions]

    // Filter by category if specified
    if (category) {
      permissions = permissions.filter(p => p.category === category)
    }

    // Group by category if requested
    if (grouped) {
      const groupedPermissions: Record<string, typeof permissions> = {}
      for (const permission of permissions) {
        if (!groupedPermissions[permission.category]) {
          groupedPermissions[permission.category] = []
        }
        groupedPermissions[permission.category].push(permission)
      }

      // Sort within each category
      for (const cat of Object.keys(groupedPermissions)) {
        groupedPermissions[cat].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
      }

      return NextResponse.json({
        permissions: groupedPermissions,
        categories: scope === "PLATFORM"
          ? PERMISSION_CATEGORIES.PLATFORM
          : scope === "TENANT"
            ? PERMISSION_CATEGORIES.TENANT
            : { ...PERMISSION_CATEGORIES.PLATFORM, ...PERMISSION_CATEGORIES.TENANT },
      })
    }

    // Sort by category and then sortOrder
    permissions.sort((a, b) => {
      if (a.category !== b.category) {
        return a.category.localeCompare(b.category)
      }
      return (a.sortOrder ?? 0) - (b.sortOrder ?? 0)
    })

    return NextResponse.json({
      permissions,
      total: permissions.length,
      categories: scope === "PLATFORM"
        ? PERMISSION_CATEGORIES.PLATFORM
        : scope === "TENANT"
          ? PERMISSION_CATEGORIES.TENANT
          : { ...PERMISSION_CATEGORIES.PLATFORM, ...PERMISSION_CATEGORIES.TENANT },
    })
  } catch (error) {
    console.error("Get permissions error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
