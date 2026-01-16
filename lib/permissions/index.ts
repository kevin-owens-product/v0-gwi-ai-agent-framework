export {
  PERMISSION_CATEGORIES,
  PLATFORM_PERMISSIONS,
  TENANT_PERMISSIONS,
  getAllPermissions,
  getPermissionCategories,
  type PlatformPermissionKey,
  type TenantPermissionKey,
} from './constants'

import { RoleScope } from '@prisma/client'
import { prisma } from '../db'
import { PLATFORM_PERMISSIONS, TENANT_PERMISSIONS } from './constants'

/**
 * Get all permissions from the database registry
 */
export async function getPermissionsFromRegistry(options?: {
  scope?: RoleScope
  category?: string
  isActive?: boolean
}) {
  const { scope, category, isActive = true } = options || {}

  const where: Record<string, unknown> = {}
  if (scope) where.scope = scope
  if (category) where.category = category
  if (isActive !== undefined) where.isActive = isActive

  return prisma.permission.findMany({
    where,
    orderBy: [
      { category: 'asc' },
      { sortOrder: 'asc' },
    ],
  })
}

/**
 * Get permissions grouped by category
 */
export async function getPermissionsByCategory(scope: RoleScope) {
  const permissions = await getPermissionsFromRegistry({ scope })

  const grouped: Record<string, typeof permissions> = {}
  for (const permission of permissions) {
    if (!grouped[permission.category]) {
      grouped[permission.category] = []
    }
    grouped[permission.category].push(permission)
  }

  return grouped
}

/**
 * Sync permissions from constants to database
 * Used during seeding/migration
 */
export async function syncPermissionsToDatabase() {
  const platformPermissions = Object.entries(PLATFORM_PERMISSIONS).map(([key, value], index) => ({
    key,
    displayName: value.displayName,
    description: value.description,
    category: value.category,
    scope: 'PLATFORM' as RoleScope,
    sortOrder: value.sortOrder ?? index,
    isActive: true,
  }))

  const tenantPermissions = Object.entries(TENANT_PERMISSIONS).map(([key, value], index) => ({
    key,
    displayName: value.displayName,
    description: value.description,
    category: value.category,
    scope: 'TENANT' as RoleScope,
    sortOrder: value.sortOrder ?? index,
    isActive: true,
  }))

  const allPermissions = [...platformPermissions, ...tenantPermissions]

  // Upsert each permission
  const results = await Promise.all(
    allPermissions.map(permission =>
      prisma.permission.upsert({
        where: { key: permission.key },
        update: {
          displayName: permission.displayName,
          description: permission.description,
          category: permission.category,
          scope: permission.scope,
          sortOrder: permission.sortOrder,
        },
        create: permission,
      })
    )
  )

  return {
    synced: results.length,
    platform: platformPermissions.length,
    tenant: tenantPermissions.length,
  }
}
