import { prisma } from '../db'
import { Prisma, RoleScope, RoleAuditAction } from '@prisma/client'
import { PLATFORM_PERMISSIONS, TENANT_PERMISSIONS } from '../permissions/constants'

export interface CreateRoleInput {
  name: string
  displayName: string
  description?: string
  scope: RoleScope
  permissions: string[]
  parentRoleId?: string
  color?: string
  icon?: string
  isSystem?: boolean
  priority?: number
  createdById?: string
}

export interface UpdateRoleInput {
  displayName?: string
  description?: string
  permissions?: string[]
  parentRoleId?: string | null
  color?: string
  icon?: string
  isActive?: boolean
  priority?: number
}

/**
 * Get all roles with optional filtering
 */
export async function getRoles(options?: {
  scope?: RoleScope
  isActive?: boolean
  search?: string
  includeAdmins?: boolean
  page?: number
  limit?: number
}) {
  const {
    scope,
    isActive,
    search,
    includeAdmins = false,
    page = 1,
    limit = 50
  } = options || {}

  const where: Prisma.AdminRoleWhereInput = {}

  if (scope) where.scope = scope
  if (isActive !== undefined) where.isActive = isActive
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { displayName: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ]
  }

  const [roles, total] = await Promise.all([
    prisma.adminRole.findMany({
      where,
      include: {
        parentRole: {
          select: { id: true, name: true, displayName: true },
        },
        childRoles: {
          select: { id: true, name: true, displayName: true },
        },
        _count: includeAdmins ? {
          select: { superAdmins: true },
        } : undefined,
      },
      orderBy: [
        { priority: 'desc' },
        { displayName: 'asc' },
      ],
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.adminRole.count({ where }),
  ])

  return {
    roles,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  }
}

/**
 * Get a role by ID with full details
 */
export async function getRoleById(id: string) {
  return prisma.adminRole.findUnique({
    where: { id },
    include: {
      parentRole: {
        select: { id: true, name: true, displayName: true, permissions: true, priority: true },
      },
      childRoles: {
        select: { id: true, name: true, displayName: true },
      },
      superAdmins: {
        select: { id: true, email: true, name: true },
      },
      creator: {
        select: { id: true, email: true, name: true },
      },
    },
  })
}

/**
 * Get a role by name
 */
export async function getRoleByName(name: string) {
  return prisma.adminRole.findUnique({
    where: { name },
    include: {
      parentRole: true,
    },
  })
}

/**
 * Create a new role
 */
export async function createRole(input: CreateRoleInput, performedById?: string) {
  // Validate permissions
  const validPermissions = validatePermissions(input.permissions, input.scope)

  // Check if name already exists
  const existing = await prisma.adminRole.findUnique({
    where: { name: input.name },
  })
  if (existing) {
    throw new Error(`Role with name "${input.name}" already exists`)
  }

  // Validate parent role if specified
  if (input.parentRoleId) {
    const parentRole = await prisma.adminRole.findUnique({
      where: { id: input.parentRoleId },
    })
    if (!parentRole) {
      throw new Error('Parent role not found')
    }
    if (parentRole.scope !== input.scope) {
      throw new Error('Parent role must be in the same scope')
    }
  }

  const role = await prisma.adminRole.create({
    data: {
      name: input.name,
      displayName: input.displayName,
      description: input.description,
      scope: input.scope,
      permissions: validPermissions,
      parentRoleId: input.parentRoleId,
      color: input.color,
      icon: input.icon,
      isSystem: input.isSystem ?? false,
      priority: input.priority ?? 0,
      createdById: input.createdById,
    },
    include: {
      parentRole: {
        select: { id: true, name: true, displayName: true },
      },
    },
  })

  // Log the creation
  if (performedById) {
    await logRoleAudit({
      roleId: role.id,
      action: 'CREATED',
      performedById,
      newState: role,
    })
  }

  return role
}

/**
 * Update a role
 */
export async function updateRole(
  id: string,
  input: UpdateRoleInput,
  performedById: string,
  ipAddress?: string,
  userAgent?: string
) {
  const existingRole = await prisma.adminRole.findUnique({
    where: { id },
    include: { parentRole: true },
  })

  if (!existingRole) {
    throw new Error('Role not found')
  }

  // Validate permissions if provided
  let validPermissions: string[] | undefined
  if (input.permissions) {
    validPermissions = validatePermissions(input.permissions, existingRole.scope)
  }

  // Validate parent role if changing
  if (input.parentRoleId !== undefined) {
    if (input.parentRoleId === id) {
      throw new Error('Role cannot be its own parent')
    }
    if (input.parentRoleId) {
      // Check for circular dependency
      const wouldCreateCircle = await checkCircularDependency(id, input.parentRoleId)
      if (wouldCreateCircle) {
        throw new Error('This would create a circular dependency in the role hierarchy')
      }
    }
  }

  const updatedRole = await prisma.adminRole.update({
    where: { id },
    data: {
      displayName: input.displayName,
      description: input.description,
      permissions: validPermissions,
      parentRoleId: input.parentRoleId,
      color: input.color,
      icon: input.icon,
      isActive: input.isActive,
      priority: input.priority,
    },
    include: {
      parentRole: {
        select: { id: true, name: true, displayName: true },
      },
    },
  })

  // Determine what changed for audit
  const changes: Record<string, { old: unknown; new: unknown }> = {}
  if (input.displayName && input.displayName !== existingRole.displayName) {
    changes.displayName = { old: existingRole.displayName, new: input.displayName }
  }
  if (input.permissions) {
    const added = input.permissions.filter(p => !existingRole.permissions.includes(p))
    const removed = existingRole.permissions.filter(p => !input.permissions!.includes(p))
    if (added.length || removed.length) {
      changes.permissions = { old: existingRole.permissions, new: input.permissions }
    }
  }
  if (input.isActive !== undefined && input.isActive !== existingRole.isActive) {
    changes.isActive = { old: existingRole.isActive, new: input.isActive }
  }

  const action = input.permissions
    ? 'PERMISSIONS_CHANGED' as RoleAuditAction
    : input.isActive === false
      ? 'DEACTIVATED' as RoleAuditAction
      : input.isActive === true
        ? 'ACTIVATED' as RoleAuditAction
        : 'UPDATED' as RoleAuditAction

  await logRoleAudit({
    roleId: id,
    action,
    performedById,
    previousState: existingRole,
    newState: updatedRole,
    changes,
    ipAddress,
    userAgent,
  })

  return updatedRole
}

/**
 * Delete a role
 */
export async function deleteRole(id: string, performedById: string, ipAddress?: string, userAgent?: string) {
  const role = await prisma.adminRole.findUnique({
    where: { id },
    include: {
      _count: { select: { superAdmins: true } },
    },
  })

  if (!role) {
    throw new Error('Role not found')
  }

  if (role.isSystem) {
    throw new Error('System roles cannot be deleted')
  }

  if (role._count.superAdmins > 0) {
    throw new Error('Cannot delete role with assigned admins. Please reassign them first.')
  }

  // Update child roles to remove parent reference
  await prisma.adminRole.updateMany({
    where: { parentRoleId: id },
    data: { parentRoleId: null },
  })

  await prisma.adminRole.delete({
    where: { id },
  })

  await logRoleAudit({
    roleId: id,
    action: 'DELETED',
    performedById,
    previousState: role,
    ipAddress,
    userAgent,
  })

  return role
}

/**
 * Assign a role to an admin
 */
export async function assignRoleToAdmin(
  adminId: string,
  roleId: string,
  performedById: string,
  ipAddress?: string,
  userAgent?: string
) {
  const [admin, role] = await Promise.all([
    prisma.superAdmin.findUnique({ where: { id: adminId } }),
    prisma.adminRole.findUnique({ where: { id: roleId } }),
  ])

  if (!admin) throw new Error('Admin not found')
  if (!role) throw new Error('Role not found')
  if (role.scope !== 'PLATFORM') throw new Error('Can only assign platform roles to admins')

  const previousRoleId = admin.adminRoleId

  const updatedAdmin = await prisma.superAdmin.update({
    where: { id: adminId },
    data: { adminRoleId: roleId },
    include: { adminRole: true },
  })

  await logRoleAudit({
    roleId,
    action: 'ADMIN_ASSIGNED',
    performedById,
    changes: {
      adminId,
      previousRoleId,
      newRoleId: roleId,
    },
    ipAddress,
    userAgent,
  })

  return updatedAdmin
}

/**
 * Remove role from an admin
 */
export async function removeRoleFromAdmin(
  adminId: string,
  performedById: string,
  ipAddress?: string,
  userAgent?: string
) {
  const admin = await prisma.superAdmin.findUnique({
    where: { id: adminId },
    include: { adminRole: true },
  })

  if (!admin) throw new Error('Admin not found')

  const previousRoleId = admin.adminRoleId

  const updatedAdmin = await prisma.superAdmin.update({
    where: { id: adminId },
    data: { adminRoleId: null },
  })

  if (previousRoleId) {
    await logRoleAudit({
      roleId: previousRoleId,
      action: 'ADMIN_UNASSIGNED',
      performedById,
      changes: {
        adminId,
        previousRoleId,
        newRoleId: null,
      },
      ipAddress,
      userAgent,
    })
  }

  return updatedAdmin
}

/**
 * Get effective permissions for a role (including inherited permissions)
 */
export async function getEffectivePermissions(roleId: string): Promise<string[]> {
  const role = await prisma.adminRole.findUnique({
    where: { id: roleId },
    include: { parentRole: true },
  })

  if (!role) return []

  // Start with the role's own permissions
  const permissions = new Set<string>(role.permissions)

  // If there's a parent role, get its effective permissions and add them
  if (role.parentRoleId) {
    const parentPermissions = await getEffectivePermissions(role.parentRoleId)
    parentPermissions.forEach(p => permissions.add(p))
  }

  return Array.from(permissions)
}

/**
 * Check if a role has a specific permission (including inherited)
 */
export async function roleHasPermission(roleId: string, permission: string): Promise<boolean> {
  const permissions = await getEffectivePermissions(roleId)

  // Check for super access
  if (permissions.includes('super:*')) return true
  if (permissions.includes('admin:*')) return true

  return permissions.includes(permission)
}

/**
 * Check if an admin has a specific permission
 */
export async function adminHasPermission(adminId: string, permission: string): Promise<boolean> {
  const admin = await prisma.superAdmin.findUnique({
    where: { id: adminId },
    include: { adminRole: true },
  })

  if (!admin) return false

  // If admin has a dynamic role, use that
  if (admin.adminRoleId) {
    return roleHasPermission(admin.adminRoleId, permission)
  }

  // Fall back to legacy role system
  return legacyRoleHasPermission(admin.role, permission)
}

/**
 * Legacy role permission check (for backward compatibility)
 */
function legacyRoleHasPermission(role: string, permission: string): boolean {
  const legacyRolePermissions: Record<string, string[]> = {
    SUPER_ADMIN: ['super:*'],
    ADMIN: [
      'organizations:list', 'organizations:read', 'organizations:create', 'organizations:update', 'organizations:suspend',
      'users:list', 'users:read', 'users:update', 'users:ban', 'users:unban',
      'analytics:dashboard', 'analytics:usage:read', 'analytics:export',
      'features:list', 'features:read', 'features:update', 'features:toggle',
      'support:tickets:list', 'support:tickets:read', 'support:tickets:respond', 'support:tickets:assign', 'support:tickets:close',
      'system:rules:read', 'system:rules:write', 'system:config:read',
      'audit:read',
      'notifications:list', 'notifications:create',
      'billing:dashboard', 'billing:subscriptions:read', 'billing:invoices:read',
      'admins:list', 'admins:read',
      'roles:list', 'roles:read',
    ],
    SUPPORT: [
      'organizations:list', 'organizations:read',
      'users:list', 'users:read', 'users:reset-password',
      'analytics:dashboard', 'analytics:usage:read',
      'features:list', 'features:read',
      'support:tickets:list', 'support:tickets:read', 'support:tickets:respond',
      'audit:read',
      'notifications:list',
      'billing:dashboard', 'billing:invoices:read',
    ],
    ANALYST: [
      'organizations:list', 'organizations:read',
      'users:list', 'users:read',
      'analytics:dashboard', 'analytics:usage:read', 'analytics:revenue:read', 'analytics:growth:read', 'analytics:export',
      'features:list', 'features:read',
      'audit:read',
    ],
  }

  const permissions = legacyRolePermissions[role] || []
  if (permissions.includes('super:*')) return true
  return permissions.includes(permission)
}

/**
 * Validate permissions against the permission registry
 */
function validatePermissions(permissions: string[], scope: RoleScope): string[] {
  const registry = scope === 'PLATFORM' ? PLATFORM_PERMISSIONS : TENANT_PERMISSIONS
  const validKeys = Object.keys(registry)

  const valid: string[] = []
  const invalid: string[] = []

  for (const permission of permissions) {
    if (validKeys.includes(permission)) {
      valid.push(permission)
    } else {
      invalid.push(permission)
    }
  }

  if (invalid.length > 0) {
    console.warn(`Invalid permissions ignored: ${invalid.join(', ')}`)
  }

  return valid
}

/**
 * Check for circular dependency in role hierarchy
 */
async function checkCircularDependency(roleId: string, newParentId: string): Promise<boolean> {
  let currentId: string | null = newParentId
  const visited = new Set<string>()

  while (currentId) {
    if (currentId === roleId) return true
    if (visited.has(currentId)) return true
    visited.add(currentId)

    const role = await prisma.adminRole.findUnique({
      where: { id: currentId },
      select: { parentRoleId: true },
    })
    currentId = role?.parentRoleId || null
  }

  return false
}

/**
 * Log role audit event
 */
async function logRoleAudit(data: {
  roleId: string
  action: RoleAuditAction
  performedById: string
  previousState?: unknown
  newState?: unknown
  changes?: unknown
  ipAddress?: string
  userAgent?: string
}) {
  try {
    await prisma.roleAuditLog.create({
      data: {
        roleId: data.roleId,
        action: data.action,
        performedById: data.performedById,
        previousState: data.previousState as Prisma.InputJsonValue,
        newState: data.newState as Prisma.InputJsonValue,
        changes: data.changes as Prisma.InputJsonValue,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
      },
    })
  } catch (error) {
    console.error('Failed to log role audit:', error)
  }
}

/**
 * Get role audit logs
 */
export async function getRoleAuditLogs(options?: {
  roleId?: string
  performedById?: string
  action?: RoleAuditAction
  page?: number
  limit?: number
}) {
  const { roleId, performedById, action, page = 1, limit = 50 } = options || {}

  const where: Prisma.RoleAuditLogWhereInput = {}
  if (roleId) where.roleId = roleId
  if (performedById) where.performedById = performedById
  if (action) where.action = action

  const [logs, total] = await Promise.all([
    prisma.roleAuditLog.findMany({
      where,
      include: {
        role: { select: { id: true, name: true, displayName: true } },
        performedBy: { select: { id: true, email: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.roleAuditLog.count({ where }),
  ])

  return {
    logs,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  }
}

/**
 * Clone a role
 */
export async function cloneRole(
  sourceRoleId: string,
  newName: string,
  newDisplayName: string,
  performedById: string
) {
  const sourceRole = await prisma.adminRole.findUnique({
    where: { id: sourceRoleId },
  })

  if (!sourceRole) {
    throw new Error('Source role not found')
  }

  return createRole({
    name: newName,
    displayName: newDisplayName,
    description: `Cloned from ${sourceRole.displayName}`,
    scope: sourceRole.scope,
    permissions: sourceRole.permissions,
    parentRoleId: sourceRole.parentRoleId || undefined,
    color: sourceRole.color || undefined,
    icon: sourceRole.icon || undefined,
    isSystem: false, // Cloned roles are never system roles
    priority: sourceRole.priority,
    createdById: performedById,
  }, performedById)
}

/**
 * Get role hierarchy tree
 */
export async function getRoleHierarchy(scope: RoleScope) {
  const roles = await prisma.adminRole.findMany({
    where: { scope, isActive: true },
    include: {
      _count: { select: { superAdmins: true } },
    },
    orderBy: [{ priority: 'desc' }, { displayName: 'asc' }],
  })

  // Build tree structure
  const roleMap = new Map(roles.map(r => [r.id, { ...r, children: [] as typeof roles }]))
  const rootRoles: Array<typeof roles[0] & { children: typeof roles }> = []

  for (const role of roles) {
    const roleWithChildren = roleMap.get(role.id)!
    if (role.parentRoleId && roleMap.has(role.parentRoleId)) {
      roleMap.get(role.parentRoleId)!.children.push(roleWithChildren)
    } else {
      rootRoles.push(roleWithChildren)
    }
  }

  return rootRoles
}
