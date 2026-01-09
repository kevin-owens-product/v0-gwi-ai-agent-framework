export const PERMISSIONS = {
  // Agents
  'agents:read': 'View agents',
  'agents:write': 'Create and edit agents',
  'agents:delete': 'Delete agents',
  'agents:execute': 'Run agents',

  // Insights
  'insights:read': 'View insights',
  'insights:export': 'Export insights',

  // Data Sources
  'data_sources:read': 'View data sources',
  'data_sources:write': 'Create and edit data sources',
  'data_sources:delete': 'Delete data sources',

  // Team
  'team:read': 'View team members',
  'team:invite': 'Invite team members',
  'team:manage': 'Manage team roles',

  // Billing
  'billing:read': 'View billing info',
  'billing:manage': 'Manage subscription',

  // Settings
  'settings:read': 'View settings',
  'settings:manage': 'Manage settings',

  // Audit
  'audit:read': 'View audit logs',

  // Admin
  'admin:*': 'Full admin access',
} as const

export type Permission = keyof typeof PERMISSIONS

export const ROLE_PERMISSIONS: Record<string, Permission[]> = {
  OWNER: ['admin:*'],
  ADMIN: [
    'agents:read', 'agents:write', 'agents:delete', 'agents:execute',
    'insights:read', 'insights:export',
    'data_sources:read', 'data_sources:write', 'data_sources:delete',
    'team:read', 'team:invite', 'team:manage',
    'settings:read', 'settings:manage',
    'audit:read',
  ],
  MEMBER: [
    'agents:read', 'agents:write', 'agents:execute',
    'insights:read',
    'data_sources:read',
    'team:read',
  ],
  VIEWER: [
    'agents:read',
    'insights:read',
  ],
}

export function hasPermission(
  userRole: string,
  requiredPermission: Permission
): boolean {
  const permissions = ROLE_PERMISSIONS[userRole] || []

  if (permissions.includes('admin:*')) return true

  return permissions.includes(requiredPermission)
}

export function hasAnyPermission(
  userRole: string,
  requiredPermissions: Permission[]
): boolean {
  return requiredPermissions.some(p => hasPermission(userRole, p))
}

export function hasAllPermissions(
  userRole: string,
  requiredPermissions: Permission[]
): boolean {
  return requiredPermissions.every(p => hasPermission(userRole, p))
}

// Get all permissions for a role
export function getRolePermissions(role: string): Permission[] {
  const permissions = ROLE_PERMISSIONS[role] || []
  if (permissions.includes('admin:*')) {
    return Object.keys(PERMISSIONS) as Permission[]
  }
  return permissions
}

// Check if a role can manage another role
export function canManageRole(managerRole: string, targetRole: string): boolean {
  const roleHierarchy: Record<string, number> = {
    OWNER: 4,
    ADMIN: 3,
    MEMBER: 2,
    VIEWER: 1,
  }

  const managerLevel = roleHierarchy[managerRole] || 0
  const targetLevel = roleHierarchy[targetRole] || 0

  return managerLevel > targetLevel
}
