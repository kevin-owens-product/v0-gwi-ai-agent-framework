import type { RoleScope } from '@prisma/client'

/**
 * Default platform (super admin) roles
 */
export const DEFAULT_PLATFORM_ROLES = [
  {
    name: 'super-admin',
    displayName: 'Super Admin',
    description: 'Full platform access with all permissions',
    scope: 'PLATFORM' as RoleScope,
    isSystem: true,
    priority: 100,
    color: '#8B5CF6', // Purple
    icon: 'Shield',
    permissions: ['super:*'],
    parentRoleId: null,
  },
  {
    name: 'platform-admin',
    displayName: 'Platform Admin',
    description: 'Standard admin with most management capabilities',
    scope: 'PLATFORM' as RoleScope,
    isSystem: true,
    priority: 80,
    color: '#3B82F6', // Blue
    icon: 'UserCog',
    parentRoleId: null, // Will inherit from support and analyst conceptually, but we define explicit permissions
    permissions: [
      // Organizations
      'organizations:list', 'organizations:read', 'organizations:create', 'organizations:update',
      'organizations:suspend', 'organizations:restore', 'organizations:export',
      // Users
      'users:list', 'users:read', 'users:create', 'users:update',
      'users:ban', 'users:unban', 'users:reset-password', 'users:export',
      // Admins (limited)
      'admins:list', 'admins:read',
      // Roles
      'roles:list', 'roles:read', 'roles:create', 'roles:update', 'roles:assign',
      // Security
      'security:dashboard', 'security:policies:read', 'security:threats:read',
      'security:violations:read', 'security:violations:manage',
      // Audit
      'audit:read', 'audit:export',
      // Analytics
      'analytics:dashboard', 'analytics:usage:read', 'analytics:revenue:read',
      'analytics:growth:read', 'analytics:export', 'analytics:reports:create',
      // Features
      'features:list', 'features:read', 'features:create', 'features:update', 'features:toggle', 'features:rollout',
      // Billing
      'billing:dashboard', 'billing:plans:read', 'billing:subscriptions:read',
      'billing:subscriptions:write', 'billing:invoices:read',
      // Support
      'support:tickets:list', 'support:tickets:read', 'support:tickets:create',
      'support:tickets:respond', 'support:tickets:assign', 'support:tickets:close', 'support:tickets:escalate',
      'support:knowledge:read', 'support:knowledge:write',
      // System
      'system:config:read', 'system:rules:read', 'system:rules:write',
      'system:health:read', 'system:logs:read', 'system:jobs:read',
      // Notifications
      'notifications:list', 'notifications:create', 'notifications:broadcast',
      'notifications:templates:read', 'notifications:templates:write',
      // Integrations
      'integrations:list', 'integrations:read', 'integrations:create', 'integrations:update',
      'integrations:webhooks:read', 'integrations:webhooks:write',
      'integrations:api-clients:read', 'integrations:api-clients:write',
      // Compliance
      'compliance:dashboard', 'compliance:frameworks:read', 'compliance:audits:read',
      'compliance:legal-holds:read', 'compliance:data-retention:read',
      // Identity
      'identity:domains:read', 'identity:sso:read', 'identity:scim:read', 'identity:devices:read',
      // Operations
      'operations:incidents:read', 'operations:releases:read', 'operations:capacity:read',
    ],
  },
  {
    name: 'support-agent',
    displayName: 'Support Agent',
    description: 'Customer support with limited write access',
    scope: 'PLATFORM' as RoleScope,
    isSystem: true,
    priority: 60,
    color: '#10B981', // Green
    icon: 'HeadphonesIcon',
    parentRoleId: null,
    permissions: [
      // Organizations (read-only)
      'organizations:list', 'organizations:read',
      // Users
      'users:list', 'users:read', 'users:reset-password',
      // Audit
      'audit:read',
      // Analytics (limited)
      'analytics:dashboard', 'analytics:usage:read',
      // Features (read-only)
      'features:list', 'features:read',
      // Billing (read-only)
      'billing:dashboard', 'billing:subscriptions:read', 'billing:invoices:read',
      // Support (full)
      'support:tickets:list', 'support:tickets:read', 'support:tickets:create',
      'support:tickets:respond', 'support:tickets:close',
      'support:knowledge:read',
      // Notifications (limited)
      'notifications:list', 'notifications:create',
    ],
  },
  {
    name: 'analyst',
    displayName: 'Analyst',
    description: 'Read-only analytics access',
    scope: 'PLATFORM' as RoleScope,
    isSystem: true,
    priority: 40,
    color: '#F59E0B', // Amber
    icon: 'BarChart',
    parentRoleId: null,
    permissions: [
      // Organizations (read-only)
      'organizations:list', 'organizations:read',
      // Users (read-only)
      'users:list', 'users:read',
      // Audit (read-only)
      'audit:read',
      // Analytics (full read + export)
      'analytics:dashboard', 'analytics:usage:read', 'analytics:revenue:read',
      'analytics:growth:read', 'analytics:export', 'analytics:reports:create', 'analytics:reports:schedule',
      // Features (read-only)
      'features:list', 'features:read',
    ],
  },
]

/**
 * Default tenant (organization) roles
 */
export const DEFAULT_TENANT_ROLES = [
  {
    name: 'org-owner',
    displayName: 'Owner',
    description: 'Full organization access',
    scope: 'TENANT' as RoleScope,
    isSystem: true,
    priority: 100,
    color: '#8B5CF6', // Purple
    icon: 'Crown',
    permissions: ['admin:*'],
    parentRoleId: null,
  },
  {
    name: 'org-admin',
    displayName: 'Admin',
    description: 'Full feature access, limited billing/team management',
    scope: 'TENANT' as RoleScope,
    isSystem: true,
    priority: 80,
    color: '#3B82F6', // Blue
    icon: 'UserCog',
    parentRoleId: null,
    permissions: [
      // Agents
      'agents:list', 'agents:read', 'agents:create', 'agents:update', 'agents:delete', 'agents:execute', 'agents:publish',
      // Workflows
      'workflows:list', 'workflows:read', 'workflows:create', 'workflows:update', 'workflows:delete', 'workflows:execute', 'workflows:schedule',
      // Reports
      'reports:list', 'reports:read', 'reports:create', 'reports:update', 'reports:delete', 'reports:export', 'reports:share',
      // Dashboards
      'dashboards:list', 'dashboards:read', 'dashboards:create', 'dashboards:update', 'dashboards:delete', 'dashboards:share',
      // Data Sources
      'datasources:list', 'datasources:read', 'datasources:create', 'datasources:update', 'datasources:delete', 'datasources:sync',
      // Team
      'team:list', 'team:read', 'team:invite', 'team:update', 'team:roles:assign',
      // Organization Settings
      'org:settings:read', 'org:settings:write', 'org:branding:read', 'org:branding:write',
      'org:billing:read', 'org:api-keys:read', 'org:api-keys:write',
      'org:integrations:read', 'org:integrations:write', 'org:audit:read',
      // Audiences
      'audiences:list', 'audiences:read', 'audiences:create', 'audiences:update', 'audiences:delete',
      // Charts
      'charts:list', 'charts:read', 'charts:create', 'charts:update', 'charts:delete',
      // Brand Tracking
      'brand-tracking:list', 'brand-tracking:read', 'brand-tracking:create', 'brand-tracking:update', 'brand-tracking:delete',
      // Memory
      'memory:list', 'memory:read', 'memory:create', 'memory:update', 'memory:delete',
      // Hierarchy
      'hierarchy:read', 'hierarchy:write', 'hierarchy:relationships:read', 'hierarchy:relationships:write',
      'hierarchy:sharing:read', 'hierarchy:sharing:write',
    ],
  },
  {
    name: 'org-member',
    displayName: 'Member',
    description: 'Standard feature access',
    scope: 'TENANT' as RoleScope,
    isSystem: true,
    priority: 60,
    color: '#10B981', // Green
    icon: 'User',
    parentRoleId: null,
    permissions: [
      // Agents
      'agents:list', 'agents:read', 'agents:create', 'agents:update', 'agents:execute',
      // Workflows
      'workflows:list', 'workflows:read', 'workflows:create', 'workflows:update', 'workflows:execute',
      // Reports
      'reports:list', 'reports:read', 'reports:create', 'reports:update', 'reports:export',
      // Dashboards
      'dashboards:list', 'dashboards:read', 'dashboards:create', 'dashboards:update',
      // Data Sources
      'datasources:list', 'datasources:read',
      // Team
      'team:list', 'team:read',
      // Organization Settings
      'org:settings:read', 'org:api-keys:read',
      // Audiences
      'audiences:list', 'audiences:read', 'audiences:create', 'audiences:update',
      // Charts
      'charts:list', 'charts:read', 'charts:create', 'charts:update',
      // Brand Tracking
      'brand-tracking:list', 'brand-tracking:read', 'brand-tracking:create', 'brand-tracking:update',
      // Memory
      'memory:list', 'memory:read', 'memory:create', 'memory:update',
      // Hierarchy
      'hierarchy:read', 'hierarchy:relationships:read', 'hierarchy:sharing:read',
    ],
  },
  {
    name: 'org-viewer',
    displayName: 'Viewer',
    description: 'Read-only access',
    scope: 'TENANT' as RoleScope,
    isSystem: true,
    priority: 40,
    color: '#6B7280', // Gray
    icon: 'Eye',
    parentRoleId: null,
    permissions: [
      // Agents
      'agents:list', 'agents:read',
      // Workflows
      'workflows:list', 'workflows:read',
      // Reports
      'reports:list', 'reports:read',
      // Dashboards
      'dashboards:list', 'dashboards:read',
      // Data Sources
      'datasources:list', 'datasources:read',
      // Team
      'team:list', 'team:read',
      // Organization Settings
      'org:settings:read',
      // Audiences
      'audiences:list', 'audiences:read',
      // Charts
      'charts:list', 'charts:read',
      // Brand Tracking
      'brand-tracking:list', 'brand-tracking:read',
      // Memory
      'memory:list', 'memory:read',
      // Hierarchy
      'hierarchy:read', 'hierarchy:sharing:read',
    ],
  },
]

/**
 * Get all default roles
 */
export function getAllDefaultRoles() {
  return [...DEFAULT_PLATFORM_ROLES, ...DEFAULT_TENANT_ROLES]
}

/**
 * Get default roles by scope
 */
export function getDefaultRolesByScope(scope: RoleScope) {
  return scope === 'PLATFORM' ? DEFAULT_PLATFORM_ROLES : DEFAULT_TENANT_ROLES
}

/**
 * Map legacy role name to new role name
 */
export function mapLegacyRole(legacyRole: string): string {
  const mapping: Record<string, string> = {
    SUPER_ADMIN: 'super-admin',
    ADMIN: 'platform-admin',
    SUPPORT: 'support-agent',
    ANALYST: 'analyst',
    OWNER: 'org-owner',
    // Note: For tenant roles, the existing Role enum uses same names but different format
  }
  return mapping[legacyRole] || legacyRole.toLowerCase()
}
