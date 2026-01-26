import type { SuperAdminRole } from '@prisma/client'

// GWI Portal Permission Categories
export const GWI_PERMISSIONS = {
  // Survey Management
  'surveys:read': 'View surveys',
  'surveys:write': 'Create and edit surveys',
  'surveys:delete': 'Delete surveys',
  'surveys:publish': 'Publish surveys',
  'surveys:responses': 'View survey responses',

  // Taxonomy Management
  'taxonomy:read': 'View taxonomy',
  'taxonomy:write': 'Create and edit taxonomy',
  'taxonomy:delete': 'Delete taxonomy items',
  'taxonomy:mappings': 'Manage mapping rules',

  // Data Pipelines
  'pipelines:read': 'View pipelines',
  'pipelines:write': 'Create and edit pipelines',
  'pipelines:delete': 'Delete pipelines',
  'pipelines:run': 'Execute pipelines',
  'pipelines:schedule': 'Manage pipeline schedules',

  // LLM Configuration
  'llm:read': 'View LLM configurations',
  'llm:write': 'Manage LLM configurations',
  'llm:prompts': 'Manage prompt templates',
  'llm:usage': 'View LLM usage analytics',
  'llm:test': 'Test LLM configurations',

  // Agent Configuration
  'agents:read': 'View agent configurations',
  'agents:write': 'Manage agent templates',
  'agents:tools': 'Manage agent tools',
  'agents:publish': 'Publish agent templates',

  // Data Sources
  'datasources:read': 'View data sources',
  'datasources:write': 'Manage data sources',
  'datasources:sync': 'Trigger data syncs',
  'datasources:delete': 'Delete data sources',

  // Monitoring
  'monitoring:read': 'View monitoring dashboards',
  'monitoring:alerts': 'Manage monitoring alerts',
  'monitoring:errors': 'View error logs',

  // System
  'system:settings': 'Manage GWI portal settings',
  'system:access': 'Manage access control',
  'system:audit': 'View audit logs',
  'system:apikeys': 'Manage API keys',

  // Full Access
  'gwi:*': 'Full GWI portal access',
} as const

export type GWIPermission = keyof typeof GWI_PERMISSIONS

// Role-based permissions for GWI Portal
export const GWI_ROLE_PERMISSIONS: Record<SuperAdminRole, GWIPermission[]> = {
  SUPER_ADMIN: ['gwi:*'],
  GWI_ADMIN: ['gwi:*'],
  DATA_ENGINEER: [
    'surveys:read',
    'taxonomy:read',
    'pipelines:read', 'pipelines:write', 'pipelines:delete', 'pipelines:run', 'pipelines:schedule',
    'llm:read',
    'agents:read',
    'datasources:read', 'datasources:write', 'datasources:sync', 'datasources:delete',
    'monitoring:read', 'monitoring:alerts', 'monitoring:errors',
    'system:audit',
  ],
  TAXONOMY_MANAGER: [
    'surveys:read', 'surveys:write', 'surveys:delete', 'surveys:publish', 'surveys:responses',
    'taxonomy:read', 'taxonomy:write', 'taxonomy:delete', 'taxonomy:mappings',
    'pipelines:read',
    'llm:read',
    'agents:read',
    'datasources:read',
    'monitoring:read',
    'system:audit',
  ],
  ML_ENGINEER: [
    'surveys:read',
    'taxonomy:read',
    'pipelines:read', 'pipelines:write', 'pipelines:run',
    'llm:read', 'llm:write', 'llm:prompts', 'llm:usage', 'llm:test',
    'agents:read', 'agents:write', 'agents:tools', 'agents:publish',
    'datasources:read',
    'monitoring:read', 'monitoring:alerts', 'monitoring:errors',
    'system:audit',
  ],
  ADMIN: [
    'surveys:read',
    'taxonomy:read',
    'pipelines:read',
    'llm:read',
    'agents:read',
    'datasources:read',
    'monitoring:read',
  ],
  SUPPORT: [
    'surveys:read',
    'taxonomy:read',
    'monitoring:read', 'monitoring:errors',
  ],
  ANALYST: [
    'surveys:read', 'surveys:responses',
    'taxonomy:read',
    'llm:usage',
    'monitoring:read',
  ],
}

// Check if a role has a specific GWI permission
export function hasGWIPermission(
  role: SuperAdminRole,
  permission: GWIPermission
): boolean {
  const permissions = GWI_ROLE_PERMISSIONS[role] || []
  if (permissions.includes('gwi:*')) return true
  return permissions.includes(permission)
}

// Get all permissions for a role
export function getGWIPermissionsForRole(role: SuperAdminRole): GWIPermission[] {
  return GWI_ROLE_PERMISSIONS[role] || []
}

// Check if role has access to GWI portal
export function canAccessGWIPortal(role: SuperAdminRole): boolean {
  const allowedRoles: SuperAdminRole[] = [
    'SUPER_ADMIN',
    'GWI_ADMIN',
    'DATA_ENGINEER',
    'TAXONOMY_MANAGER',
    'ML_ENGINEER',
  ]
  return allowedRoles.includes(role)
}

// Navigation section visibility based on permissions
export const GWI_NAV_PERMISSIONS = {
  overview: [] as GWIPermission[], // Everyone can see overview
  surveys: ['surveys:read'] as GWIPermission[],
  taxonomy: ['taxonomy:read'] as GWIPermission[],
  pipelines: ['pipelines:read'] as GWIPermission[],
  llm: ['llm:read'] as GWIPermission[],
  agents: ['agents:read'] as GWIPermission[],
  dataSources: ['datasources:read'] as GWIPermission[],
  monitoring: ['monitoring:read'] as GWIPermission[],
  system: ['system:settings', 'system:access', 'system:audit', 'system:apikeys'] as GWIPermission[],
}

// Check if role can see a navigation section
export function canSeeNavSection(
  role: SuperAdminRole,
  section: keyof typeof GWI_NAV_PERMISSIONS
): boolean {
  const requiredPermissions = GWI_NAV_PERMISSIONS[section]
  if (requiredPermissions.length === 0) return true

  return requiredPermissions.some(perm => hasGWIPermission(role, perm))
}
