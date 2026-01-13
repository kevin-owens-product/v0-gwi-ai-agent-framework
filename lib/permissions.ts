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

  // Brand Tracking
  'brand-tracking:read': 'View brand tracking',
  'brand-tracking:write': 'Create and edit brand tracking',
  'brand-tracking:delete': 'Delete brand tracking',

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
  // Aliases for camelCase usage
  'dataSources:read': 'View data sources',
  'dataSources:write': 'Create and edit data sources',
  'dataSources:delete': 'Delete data sources',

  // Team
  'team:read': 'View team members',
  'team:write': 'Create and edit team members',
  'team:invite': 'Invite team members',
  'team:manage': 'Manage team roles',

  // API Keys
  'apiKeys:read': 'View API keys',
  'apiKeys:write': 'Create and manage API keys',
  'apiKeys:delete': 'Delete API keys',

  // Analytics
  'analytics:read': 'View analytics',
  'analytics:write': 'Manage analytics',

  // Integrations
  'integrations:read': 'View integrations',
  'integrations:write': 'Manage integrations',
  'integrations:delete': 'Delete integrations',

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

  // ==================== HIERARCHY PERMISSIONS ====================

  // Hierarchy Management
  'hierarchy:read': 'View organization hierarchy',
  'hierarchy:write': 'Create and edit child organizations',
  'hierarchy:delete': 'Delete child organizations',
  'hierarchy:move': 'Move organizations within hierarchy',
  'hierarchy:manage': 'Full hierarchy management',

  // Cross-Organization Relationships
  'relationships:read': 'View organization relationships',
  'relationships:write': 'Create organization relationships',
  'relationships:delete': 'Remove organization relationships',
  'relationships:approve': 'Approve incoming relationship requests',
  'relationships:manage': 'Full relationship management',

  // Resource Sharing
  'sharing:read': 'View shared resources',
  'sharing:write': 'Share resources with other organizations',
  'sharing:delete': 'Revoke shared resource access',
  'sharing:manage': 'Full sharing management',

  // Child Organization Access
  'children:read': 'View child organization data',
  'children:write': 'Modify child organization data',
  'children:admin': 'Administer child organizations',

  // Billing Hierarchy
  'billing:children:read': 'View child organization billing',
  'billing:children:manage': 'Manage child organization billing',
  'billing:consolidated': 'Access consolidated billing across hierarchy',

  // Hierarchy Templates
  'templates:hierarchy:read': 'View hierarchy templates',
  'templates:hierarchy:write': 'Create hierarchy templates',
  'templates:hierarchy:apply': 'Apply hierarchy templates',

  // Cross-Org Invitations
  'invitations:cross-org:send': 'Send cross-organization invitations',
  'invitations:cross-org:manage': 'Manage cross-organization invitations',
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
    'brand-tracking:read', 'brand-tracking:write', 'brand-tracking:delete',
    'memory:read', 'memory:write', 'memory:delete',
    'insights:read', 'insights:export',
    'data_sources:read', 'data_sources:write', 'data_sources:delete',
    'dataSources:read', 'dataSources:write', 'dataSources:delete',
    'team:read', 'team:write', 'team:invite', 'team:manage',
    'apiKeys:read', 'apiKeys:write', 'apiKeys:delete',
    'analytics:read', 'analytics:write',
    'integrations:read', 'integrations:write', 'integrations:delete',
    'settings:read', 'settings:manage',
    'audit:read',
    // Hierarchy permissions for ADMIN
    'hierarchy:read', 'hierarchy:write',
    'relationships:read', 'relationships:write', 'relationships:approve',
    'sharing:read', 'sharing:write',
    'children:read', 'children:write',
    'templates:hierarchy:read',
    'invitations:cross-org:send',
  ],
  MEMBER: [
    'agents:read', 'agents:write', 'agents:execute',
    'workflows:read', 'workflows:write', 'workflows:execute',
    'reports:read', 'reports:write',
    'dashboards:read', 'dashboards:write',
    'crosstabs:read', 'crosstabs:write',
    'audiences:read', 'audiences:write',
    'charts:read', 'charts:write',
    'brand-tracking:read', 'brand-tracking:write',
    'memory:read', 'memory:write',
    'insights:read',
    'data_sources:read',
    'dataSources:read',
    'team:read',
    'apiKeys:read',
    'analytics:read',
    'integrations:read',
    // Hierarchy permissions for MEMBER
    'hierarchy:read',
    'relationships:read',
    'sharing:read',
    'children:read',
    'templates:hierarchy:read',
  ],
  VIEWER: [
    'agents:read',
    'workflows:read',
    'reports:read',
    'dashboards:read',
    'crosstabs:read',
    'audiences:read',
    'charts:read',
    'brand-tracking:read',
    'memory:read',
    'insights:read',
    'analytics:read',
    // Hierarchy permissions for VIEWER
    'hierarchy:read',
    'sharing:read',
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

// ==================== HIERARCHY PERMISSION HELPERS ====================

/**
 * Check if a role can manage hierarchy (create/edit child orgs)
 */
export function canManageHierarchy(role: string): boolean {
  return hasPermission(role, 'hierarchy:manage') || hasPermission(role, 'hierarchy:write')
}

/**
 * Check if a role can manage relationships
 */
export function canManageRelationships(role: string): boolean {
  return hasPermission(role, 'relationships:manage') || hasPermission(role, 'relationships:write')
}

/**
 * Check if a role can share resources
 */
export function canShareResources(role: string): boolean {
  return hasPermission(role, 'sharing:manage') || hasPermission(role, 'sharing:write')
}

/**
 * Check if a role can access child organization data
 */
export function canAccessChildOrgs(role: string): boolean {
  return hasPermission(role, 'children:admin') || hasPermission(role, 'children:write') || hasPermission(role, 'children:read')
}

/**
 * Check if a role can administer child organizations
 */
export function canAdministerChildOrgs(role: string): boolean {
  return hasPermission(role, 'children:admin') || role === 'OWNER'
}

/**
 * Get the effective role when accessing a child organization
 * Parents typically get admin-level access to children
 */
export function getEffectiveRoleForChild(parentRole: string): string | null {
  if (parentRole === 'OWNER') return 'ADMIN'
  if (parentRole === 'ADMIN') return 'ADMIN'
  if (parentRole === 'MEMBER') return 'VIEWER'
  return null
}

/**
 * Get the effective role when accessing through a relationship
 */
export function getEffectiveRoleForRelationship(
  memberRole: string,
  relationshipType: string,
  accessLevel: string
): string | null {
  // Only OWNER/ADMIN get access through relationships
  if (memberRole !== 'OWNER' && memberRole !== 'ADMIN') {
    return null
  }

  const relationshipRoles: Record<string, Record<string, string | null>> = {
    OWNERSHIP: {
      NONE: null,
      READ_ONLY: 'VIEWER',
      FULL_ACCESS: 'ADMIN',
      INHERIT: 'ADMIN',
    },
    MANAGEMENT: {
      NONE: null,
      READ_ONLY: 'VIEWER',
      FULL_ACCESS: 'MEMBER',
      INHERIT: 'MEMBER',
    },
    PARTNERSHIP: {
      NONE: null,
      READ_ONLY: 'VIEWER',
      FULL_ACCESS: 'VIEWER',
      INHERIT: 'VIEWER',
    },
    LICENSING: {
      NONE: null,
      READ_ONLY: 'VIEWER',
      FULL_ACCESS: 'MEMBER',
      INHERIT: 'VIEWER',
    },
    RESELLER: {
      NONE: null,
      READ_ONLY: 'VIEWER',
      FULL_ACCESS: 'MEMBER',
      INHERIT: 'MEMBER',
    },
    WHITE_LABEL: {
      NONE: null,
      READ_ONLY: 'VIEWER',
      FULL_ACCESS: 'ADMIN',
      INHERIT: 'ADMIN',
    },
    DATA_SHARING: {
      NONE: null,
      READ_ONLY: 'VIEWER',
      FULL_ACCESS: 'VIEWER',
      INHERIT: 'VIEWER',
    },
    CONSORTIUM: {
      NONE: null,
      READ_ONLY: 'VIEWER',
      FULL_ACCESS: 'VIEWER',
      INHERIT: 'VIEWER',
    },
  }

  return relationshipRoles[relationshipType]?.[accessLevel] || null
}

/**
 * Check if an organization type can have child organizations
 */
export function orgTypeCanHaveChildren(orgType: string): boolean {
  const typesWithChildren = [
    'AGENCY',
    'HOLDING_COMPANY',
    'BRAND',
    'DIVISION',
    'FRANCHISE',
    'RESELLER',
    'REGIONAL',
  ]
  return typesWithChildren.includes(orgType)
}

/**
 * Get recommended child organization types for a given parent type
 */
export function getRecommendedChildTypes(orgType: string): string[] {
  const recommendations: Record<string, string[]> = {
    AGENCY: ['CLIENT', 'BRAND'],
    HOLDING_COMPANY: ['SUBSIDIARY', 'PORTFOLIO_COMPANY', 'BRAND'],
    BRAND: ['SUB_BRAND', 'REGIONAL'],
    DIVISION: ['DEPARTMENT'],
    FRANCHISE: ['FRANCHISEE'],
    RESELLER: ['CLIENT'],
    REGIONAL: ['STANDARD', 'BRAND'],
    SUBSIDIARY: ['DIVISION', 'DEPARTMENT'],
  }

  return recommendations[orgType] || ['STANDARD']
}
