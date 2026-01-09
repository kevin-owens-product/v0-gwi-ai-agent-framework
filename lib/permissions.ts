export const PERMISSIONS = {
  // Agents
  'agents:read': 'View agents',
  'agents:write': 'Create and edit agents',
  'agents:delete': 'Delete agents',
  'agents:execute': 'Run agents',

  // Workflows
  'workflows:read': 'View workflows',
  'workflows:write': 'Create and edit workflows',
  'workflows:delete': 'Delete workflows',
  'workflows:execute': 'Run workflows',

  // Reports
  'reports:read': 'View reports',
  'reports:write': 'Create and edit reports',
  'reports:delete': 'Delete reports',

  // Dashboards
  'dashboards:read': 'View dashboards',
  'dashboards:write': 'Create and edit dashboards',
  'dashboards:delete': 'Delete dashboards',

  // Crosstabs
  'crosstabs:read': 'View crosstabs',
  'crosstabs:write': 'Create and edit crosstabs',
  'crosstabs:delete': 'Delete crosstabs',

  // Audiences
  'audiences:read': 'View audiences',
  'audiences:write': 'Create and edit audiences',
  'audiences:delete': 'Delete audiences',

  // Charts
  'charts:read': 'View charts',
  'charts:write': 'Create and edit charts',
  'charts:delete': 'Delete charts',

  // Memory
  'memory:read': 'View memory/context',
  'memory:write': 'Create and edit memory',
  'memory:delete': 'Delete memory',

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
    'workflows:read', 'workflows:write', 'workflows:delete', 'workflows:execute',
    'reports:read', 'reports:write', 'reports:delete',
    'dashboards:read', 'dashboards:write', 'dashboards:delete',
    'crosstabs:read', 'crosstabs:write', 'crosstabs:delete',
    'audiences:read', 'audiences:write', 'audiences:delete',
    'charts:read', 'charts:write', 'charts:delete',
    'memory:read', 'memory:write', 'memory:delete',
    'insights:read', 'insights:export',
    'data_sources:read', 'data_sources:write', 'data_sources:delete',
    'team:read', 'team:invite', 'team:manage',
    'settings:read', 'settings:manage',
    'audit:read',
  ],
  MEMBER: [
    'agents:read', 'agents:write', 'agents:execute',
    'workflows:read', 'workflows:write', 'workflows:execute',
    'reports:read', 'reports:write',
    'dashboards:read', 'dashboards:write',
    'crosstabs:read', 'crosstabs:write',
    'audiences:read', 'audiences:write',
    'charts:read', 'charts:write',
    'memory:read', 'memory:write',
    'insights:read',
    'data_sources:read',
    'team:read',
  ],
  VIEWER: [
    'agents:read',
    'workflows:read',
    'reports:read',
    'dashboards:read',
    'crosstabs:read',
    'audiences:read',
    'charts:read',
    'memory:read',
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
