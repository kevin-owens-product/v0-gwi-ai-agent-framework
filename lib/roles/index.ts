export {
  // Role CRUD operations
  getRoles,
  getRoleById,
  getRoleByName,
  createRole,
  updateRole,
  deleteRole,
  cloneRole,

  // Admin role assignment
  assignRoleToAdmin,
  removeRoleFromAdmin,

  // Permission resolution
  getEffectivePermissions,
  roleHasPermission,
  adminHasPermission,

  // Audit
  getRoleAuditLogs,

  // Hierarchy
  getRoleHierarchy,

  // Types
  type CreateRoleInput,
  type UpdateRoleInput,
} from './service'

export {
  DEFAULT_PLATFORM_ROLES,
  DEFAULT_TENANT_ROLES,
  getAllDefaultRoles,
  getDefaultRolesByScope,
  mapLegacyRole,
} from './defaults'

import { prisma } from '../db'
import { DEFAULT_PLATFORM_ROLES, DEFAULT_TENANT_ROLES } from './defaults'

/**
 * Seed default roles to database
 * Used during initial setup or migration
 */
export async function seedDefaultRoles() {
  const allRoles = [...DEFAULT_PLATFORM_ROLES, ...DEFAULT_TENANT_ROLES]
  const results: { created: number; updated: number; errors: string[] } = {
    created: 0,
    updated: 0,
    errors: [],
  }

  for (const roleData of allRoles) {
    try {
      const existing = await prisma.adminRole.findUnique({
        where: { name: roleData.name },
      })

      if (existing) {
        // Update existing system role
        await prisma.adminRole.update({
          where: { name: roleData.name },
          data: {
            displayName: roleData.displayName,
            description: roleData.description,
            permissions: roleData.permissions,
            priority: roleData.priority,
            color: roleData.color,
            icon: roleData.icon,
            isSystem: roleData.isSystem,
            // Don't update scope or parentRoleId as those could break existing assignments
          },
        })
        results.updated++
      } else {
        // Create new role
        await prisma.adminRole.create({
          data: {
            name: roleData.name,
            displayName: roleData.displayName,
            description: roleData.description,
            scope: roleData.scope,
            permissions: roleData.permissions,
            isSystem: roleData.isSystem,
            priority: roleData.priority,
            color: roleData.color,
            icon: roleData.icon,
            parentRoleId: roleData.parentRoleId,
          },
        })
        results.created++
      }
    } catch (error) {
      results.errors.push(`Failed to seed role ${roleData.name}: ${error}`)
    }
  }

  return results
}

/**
 * Migrate existing admins from legacy role enum to dynamic roles
 */
export async function migrateAdminsToNewRoleSystem() {
  // First, ensure default roles exist
  await seedDefaultRoles()

  // Get mapping of legacy roles to new role IDs
  const legacyToNewMapping: Record<string, string | null> = {}
  const legacyRoles = ['SUPER_ADMIN', 'ADMIN', 'SUPPORT', 'ANALYST']
  const newRoleNames = ['super-admin', 'platform-admin', 'support-agent', 'analyst']

  for (let i = 0; i < legacyRoles.length; i++) {
    const newRole = await prisma.adminRole.findUnique({
      where: { name: newRoleNames[i] },
    })
    legacyToNewMapping[legacyRoles[i]] = newRole?.id || null
  }

  // Find admins without adminRoleId and migrate them
  const adminsToMigrate = await prisma.superAdmin.findMany({
    where: { adminRoleId: null },
  })

  let migrated = 0
  const errors: string[] = []

  for (const admin of adminsToMigrate) {
    const newRoleId = legacyToNewMapping[admin.role]
    if (newRoleId) {
      try {
        await prisma.superAdmin.update({
          where: { id: admin.id },
          data: { adminRoleId: newRoleId },
        })
        migrated++
      } catch (error) {
        errors.push(`Failed to migrate admin ${admin.email}: ${error}`)
      }
    }
  }

  return {
    total: adminsToMigrate.length,
    migrated,
    errors,
  }
}
