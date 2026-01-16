import type { RoleScope } from '@prisma/client'

/**
 * Permission categories for organizing permissions in the UI
 */
export const PERMISSION_CATEGORIES = {
  PLATFORM: {
    ORGANIZATIONS: 'Organizations',
    USERS: 'Users',
    ADMINS: 'Admins',
    ROLES: 'Roles',
    SECURITY: 'Security',
    AUDIT: 'Audit',
    ANALYTICS: 'Analytics',
    FEATURES: 'Features',
    BILLING: 'Billing',
    SUPPORT: 'Support',
    SYSTEM: 'System',
    NOTIFICATIONS: 'Notifications',
    INTEGRATIONS: 'Integrations',
    COMPLIANCE: 'Compliance',
    IDENTITY: 'Identity',
    OPERATIONS: 'Operations',
  },
  TENANT: {
    AGENTS: 'Agents',
    WORKFLOWS: 'Workflows',
    REPORTS: 'Reports',
    DASHBOARDS: 'Dashboards',
    DATA_SOURCES: 'Data Sources',
    TEAM: 'Team',
    ORG_SETTINGS: 'Organization Settings',
    AUDIENCES: 'Audiences',
    CHARTS: 'Charts',
    BRAND_TRACKING: 'Brand Tracking',
    MEMORY: 'Memory',
    HIERARCHY: 'Hierarchy',
  },
} as const

/**
 * Platform-level (super admin) permissions
 */
export const PLATFORM_PERMISSIONS = {
  // Organizations
  'organizations:list': { displayName: 'List Organizations', description: 'View list of all organizations', category: 'Organizations', sortOrder: 1 },
  'organizations:read': { displayName: 'View Organization Details', description: 'View detailed organization information', category: 'Organizations', sortOrder: 2 },
  'organizations:create': { displayName: 'Create Organizations', description: 'Create new organizations', category: 'Organizations', sortOrder: 3 },
  'organizations:update': { displayName: 'Update Organizations', description: 'Modify organization settings', category: 'Organizations', sortOrder: 4 },
  'organizations:delete': { displayName: 'Delete Organizations', description: 'Permanently delete organizations', category: 'Organizations', sortOrder: 5 },
  'organizations:suspend': { displayName: 'Suspend Organizations', description: 'Suspend organization access', category: 'Organizations', sortOrder: 6 },
  'organizations:restore': { displayName: 'Restore Organizations', description: 'Restore suspended organizations', category: 'Organizations', sortOrder: 7 },
  'organizations:export': { displayName: 'Export Organization Data', description: 'Export organization data', category: 'Organizations', sortOrder: 8 },
  'organizations:impersonate': { displayName: 'Impersonate Organization', description: 'Access org as if logged in', category: 'Organizations', sortOrder: 9 },

  // Users
  'users:list': { displayName: 'List Users', description: 'View list of all users', category: 'Users', sortOrder: 1 },
  'users:read': { displayName: 'View User Details', description: 'View detailed user information', category: 'Users', sortOrder: 2 },
  'users:create': { displayName: 'Create Users', description: 'Create new user accounts', category: 'Users', sortOrder: 3 },
  'users:update': { displayName: 'Update Users', description: 'Modify user information', category: 'Users', sortOrder: 4 },
  'users:delete': { displayName: 'Delete Users', description: 'Permanently delete user accounts', category: 'Users', sortOrder: 5 },
  'users:ban': { displayName: 'Ban Users', description: 'Ban users from platform', category: 'Users', sortOrder: 6 },
  'users:unban': { displayName: 'Unban Users', description: 'Remove user bans', category: 'Users', sortOrder: 7 },
  'users:reset-password': { displayName: 'Reset User Passwords', description: 'Force password reset for users', category: 'Users', sortOrder: 8 },
  'users:export': { displayName: 'Export User Data', description: 'Export user data', category: 'Users', sortOrder: 9 },
  'users:impersonate': { displayName: 'Impersonate Users', description: 'Access platform as user', category: 'Users', sortOrder: 10 },

  // Admins
  'admins:list': { displayName: 'List Admins', description: 'View list of all admins', category: 'Admins', sortOrder: 1 },
  'admins:read': { displayName: 'View Admin Details', description: 'View detailed admin information', category: 'Admins', sortOrder: 2 },
  'admins:create': { displayName: 'Create Admins', description: 'Create new admin accounts', category: 'Admins', sortOrder: 3 },
  'admins:update': { displayName: 'Update Admins', description: 'Modify admin information', category: 'Admins', sortOrder: 4 },
  'admins:delete': { displayName: 'Delete Admins', description: 'Delete admin accounts', category: 'Admins', sortOrder: 5 },
  'admins:reset-password': { displayName: 'Reset Admin Passwords', description: 'Force password reset for admins', category: 'Admins', sortOrder: 6 },
  'admins:manage-2fa': { displayName: 'Manage Admin 2FA', description: 'Enable/disable admin 2FA', category: 'Admins', sortOrder: 7 },
  'admins:revoke-sessions': { displayName: 'Revoke Admin Sessions', description: 'Force logout admin sessions', category: 'Admins', sortOrder: 8 },

  // Roles
  'roles:list': { displayName: 'List Roles', description: 'View list of all roles', category: 'Roles', sortOrder: 1 },
  'roles:read': { displayName: 'View Role Details', description: 'View role permissions and assignments', category: 'Roles', sortOrder: 2 },
  'roles:create': { displayName: 'Create Roles', description: 'Create new custom roles', category: 'Roles', sortOrder: 3 },
  'roles:update': { displayName: 'Update Roles', description: 'Modify role permissions', category: 'Roles', sortOrder: 4 },
  'roles:delete': { displayName: 'Delete Roles', description: 'Delete custom roles', category: 'Roles', sortOrder: 5 },
  'roles:assign': { displayName: 'Assign Roles', description: 'Assign roles to admins', category: 'Roles', sortOrder: 6 },

  // Security
  'security:dashboard': { displayName: 'Security Dashboard', description: 'View security overview', category: 'Security', sortOrder: 1 },
  'security:policies:read': { displayName: 'View Security Policies', description: 'View security policy settings', category: 'Security', sortOrder: 2 },
  'security:policies:write': { displayName: 'Manage Security Policies', description: 'Create/modify security policies', category: 'Security', sortOrder: 3 },
  'security:threats:read': { displayName: 'View Threat Detection', description: 'View security threats', category: 'Security', sortOrder: 4 },
  'security:threats:manage': { displayName: 'Manage Threats', description: 'Respond to security threats', category: 'Security', sortOrder: 5 },
  'security:violations:read': { displayName: 'View Violations', description: 'View policy violations', category: 'Security', sortOrder: 6 },
  'security:violations:manage': { displayName: 'Manage Violations', description: 'Handle policy violations', category: 'Security', sortOrder: 7 },
  'security:ip-allowlist:read': { displayName: 'View IP Allowlist', description: 'View allowed IP addresses', category: 'Security', sortOrder: 8 },
  'security:ip-allowlist:write': { displayName: 'Manage IP Allowlist', description: 'Modify IP allowlist', category: 'Security', sortOrder: 9 },

  // Audit
  'audit:read': { displayName: 'View Audit Logs', description: 'View platform audit logs', category: 'Audit', sortOrder: 1 },
  'audit:export': { displayName: 'Export Audit Logs', description: 'Export audit log data', category: 'Audit', sortOrder: 2 },
  'audit:configure': { displayName: 'Configure Audit Settings', description: 'Modify audit log settings', category: 'Audit', sortOrder: 3 },
  'audit:retention': { displayName: 'Manage Retention', description: 'Configure log retention policies', category: 'Audit', sortOrder: 4 },

  // Analytics
  'analytics:dashboard': { displayName: 'Analytics Dashboard', description: 'View analytics overview', category: 'Analytics', sortOrder: 1 },
  'analytics:usage:read': { displayName: 'View Usage Analytics', description: 'View platform usage metrics', category: 'Analytics', sortOrder: 2 },
  'analytics:revenue:read': { displayName: 'View Revenue Analytics', description: 'View revenue/billing metrics', category: 'Analytics', sortOrder: 3 },
  'analytics:growth:read': { displayName: 'View Growth Analytics', description: 'View growth metrics', category: 'Analytics', sortOrder: 4 },
  'analytics:export': { displayName: 'Export Analytics', description: 'Export analytics data', category: 'Analytics', sortOrder: 5 },
  'analytics:reports:create': { displayName: 'Create Reports', description: 'Create custom reports', category: 'Analytics', sortOrder: 6 },
  'analytics:reports:schedule': { displayName: 'Schedule Reports', description: 'Schedule automated reports', category: 'Analytics', sortOrder: 7 },

  // Features
  'features:list': { displayName: 'List Feature Flags', description: 'View feature flags', category: 'Features', sortOrder: 1 },
  'features:read': { displayName: 'View Feature Details', description: 'View feature flag configuration', category: 'Features', sortOrder: 2 },
  'features:create': { displayName: 'Create Feature Flags', description: 'Create new feature flags', category: 'Features', sortOrder: 3 },
  'features:update': { displayName: 'Update Feature Flags', description: 'Modify feature flags', category: 'Features', sortOrder: 4 },
  'features:delete': { displayName: 'Delete Feature Flags', description: 'Remove feature flags', category: 'Features', sortOrder: 5 },
  'features:toggle': { displayName: 'Toggle Features', description: 'Enable/disable features', category: 'Features', sortOrder: 6 },
  'features:rollout': { displayName: 'Manage Rollouts', description: 'Configure feature rollouts', category: 'Features', sortOrder: 7 },

  // Billing
  'billing:dashboard': { displayName: 'Billing Dashboard', description: 'View billing overview', category: 'Billing', sortOrder: 1 },
  'billing:plans:read': { displayName: 'View Plans', description: 'View subscription plans', category: 'Billing', sortOrder: 2 },
  'billing:plans:write': { displayName: 'Manage Plans', description: 'Create/modify plans', category: 'Billing', sortOrder: 3 },
  'billing:subscriptions:read': { displayName: 'View Subscriptions', description: 'View org subscriptions', category: 'Billing', sortOrder: 4 },
  'billing:subscriptions:write': { displayName: 'Manage Subscriptions', description: 'Modify subscriptions', category: 'Billing', sortOrder: 5 },
  'billing:invoices:read': { displayName: 'View Invoices', description: 'View invoices', category: 'Billing', sortOrder: 6 },
  'billing:invoices:create': { displayName: 'Create Invoices', description: 'Generate invoices', category: 'Billing', sortOrder: 7 },
  'billing:refunds': { displayName: 'Process Refunds', description: 'Issue refunds', category: 'Billing', sortOrder: 8 },
  'billing:credits': { displayName: 'Manage Credits', description: 'Add/remove credits', category: 'Billing', sortOrder: 9 },

  // Support
  'support:tickets:list': { displayName: 'List Support Tickets', description: 'View support ticket list', category: 'Support', sortOrder: 1 },
  'support:tickets:read': { displayName: 'View Ticket Details', description: 'View ticket information', category: 'Support', sortOrder: 2 },
  'support:tickets:create': { displayName: 'Create Tickets', description: 'Create support tickets', category: 'Support', sortOrder: 3 },
  'support:tickets:respond': { displayName: 'Respond to Tickets', description: 'Reply to tickets', category: 'Support', sortOrder: 4 },
  'support:tickets:assign': { displayName: 'Assign Tickets', description: 'Assign tickets to agents', category: 'Support', sortOrder: 5 },
  'support:tickets:close': { displayName: 'Close Tickets', description: 'Close/resolve tickets', category: 'Support', sortOrder: 6 },
  'support:tickets:escalate': { displayName: 'Escalate Tickets', description: 'Escalate to higher priority', category: 'Support', sortOrder: 7 },
  'support:knowledge:read': { displayName: 'View Knowledge Base', description: 'View KB articles', category: 'Support', sortOrder: 8 },
  'support:knowledge:write': { displayName: 'Manage Knowledge Base', description: 'Create/edit KB articles', category: 'Support', sortOrder: 9 },

  // System
  'system:config:read': { displayName: 'View System Config', description: 'View system configuration', category: 'System', sortOrder: 1 },
  'system:config:write': { displayName: 'Modify System Config', description: 'Change system settings', category: 'System', sortOrder: 2 },
  'system:rules:read': { displayName: 'View System Rules', description: 'View automation rules', category: 'System', sortOrder: 3 },
  'system:rules:write': { displayName: 'Manage System Rules', description: 'Create/modify rules', category: 'System', sortOrder: 4 },
  'system:maintenance:read': { displayName: 'View Maintenance', description: 'View maintenance status', category: 'System', sortOrder: 5 },
  'system:maintenance:write': { displayName: 'Manage Maintenance', description: 'Schedule maintenance', category: 'System', sortOrder: 6 },
  'system:health:read': { displayName: 'View System Health', description: 'View health metrics', category: 'System', sortOrder: 7 },
  'system:logs:read': { displayName: 'View System Logs', description: 'View application logs', category: 'System', sortOrder: 8 },
  'system:cache:manage': { displayName: 'Manage Cache', description: 'Clear/manage caches', category: 'System', sortOrder: 9 },
  'system:jobs:read': { displayName: 'View Background Jobs', description: 'View job status', category: 'System', sortOrder: 10 },
  'system:jobs:manage': { displayName: 'Manage Background Jobs', description: 'Start/stop/retry jobs', category: 'System', sortOrder: 11 },

  // Notifications
  'notifications:list': { displayName: 'List Notifications', description: 'View notifications', category: 'Notifications', sortOrder: 1 },
  'notifications:create': { displayName: 'Create Notifications', description: 'Send notifications', category: 'Notifications', sortOrder: 2 },
  'notifications:broadcast': { displayName: 'Broadcast Messages', description: 'Send platform-wide messages', category: 'Notifications', sortOrder: 3 },
  'notifications:templates:read': { displayName: 'View Templates', description: 'View notification templates', category: 'Notifications', sortOrder: 4 },
  'notifications:templates:write': { displayName: 'Manage Templates', description: 'Create/edit templates', category: 'Notifications', sortOrder: 5 },

  // Integrations
  'integrations:list': { displayName: 'List Integrations', description: 'View integrations', category: 'Integrations', sortOrder: 1 },
  'integrations:read': { displayName: 'View Integration Details', description: 'View integration config', category: 'Integrations', sortOrder: 2 },
  'integrations:create': { displayName: 'Create Integrations', description: 'Add new integrations', category: 'Integrations', sortOrder: 3 },
  'integrations:update': { displayName: 'Update Integrations', description: 'Modify integrations', category: 'Integrations', sortOrder: 4 },
  'integrations:delete': { displayName: 'Delete Integrations', description: 'Remove integrations', category: 'Integrations', sortOrder: 5 },
  'integrations:webhooks:read': { displayName: 'View Webhooks', description: 'View webhook config', category: 'Integrations', sortOrder: 6 },
  'integrations:webhooks:write': { displayName: 'Manage Webhooks', description: 'Create/modify webhooks', category: 'Integrations', sortOrder: 7 },
  'integrations:api-clients:read': { displayName: 'View API Clients', description: 'View API client config', category: 'Integrations', sortOrder: 8 },
  'integrations:api-clients:write': { displayName: 'Manage API Clients', description: 'Create/modify API clients', category: 'Integrations', sortOrder: 9 },

  // Compliance
  'compliance:dashboard': { displayName: 'Compliance Dashboard', description: 'View compliance overview', category: 'Compliance', sortOrder: 1 },
  'compliance:frameworks:read': { displayName: 'View Frameworks', description: 'View compliance frameworks', category: 'Compliance', sortOrder: 2 },
  'compliance:frameworks:write': { displayName: 'Manage Frameworks', description: 'Configure frameworks', category: 'Compliance', sortOrder: 3 },
  'compliance:audits:read': { displayName: 'View Compliance Audits', description: 'View audit records', category: 'Compliance', sortOrder: 4 },
  'compliance:audits:write': { displayName: 'Manage Compliance Audits', description: 'Create/manage audits', category: 'Compliance', sortOrder: 5 },
  'compliance:legal-holds:read': { displayName: 'View Legal Holds', description: 'View legal holds', category: 'Compliance', sortOrder: 6 },
  'compliance:legal-holds:write': { displayName: 'Manage Legal Holds', description: 'Create/manage legal holds', category: 'Compliance', sortOrder: 7 },
  'compliance:data-retention:read': { displayName: 'View Data Retention', description: 'View retention policies', category: 'Compliance', sortOrder: 8 },
  'compliance:data-retention:write': { displayName: 'Manage Data Retention', description: 'Configure retention', category: 'Compliance', sortOrder: 9 },

  // Identity
  'identity:domains:read': { displayName: 'View Domains', description: 'View domain configuration', category: 'Identity', sortOrder: 1 },
  'identity:domains:write': { displayName: 'Manage Domains', description: 'Configure domains', category: 'Identity', sortOrder: 2 },
  'identity:sso:read': { displayName: 'View SSO Settings', description: 'View SSO configuration', category: 'Identity', sortOrder: 3 },
  'identity:sso:write': { displayName: 'Manage SSO', description: 'Configure SSO providers', category: 'Identity', sortOrder: 4 },
  'identity:scim:read': { displayName: 'View SCIM Settings', description: 'View SCIM configuration', category: 'Identity', sortOrder: 5 },
  'identity:scim:write': { displayName: 'Manage SCIM', description: 'Configure SCIM', category: 'Identity', sortOrder: 6 },
  'identity:devices:read': { displayName: 'View Devices', description: 'View registered devices', category: 'Identity', sortOrder: 7 },
  'identity:devices:write': { displayName: 'Manage Devices', description: 'Manage device access', category: 'Identity', sortOrder: 8 },

  // Operations
  'operations:incidents:read': { displayName: 'View Incidents', description: 'View incident reports', category: 'Operations', sortOrder: 1 },
  'operations:incidents:write': { displayName: 'Manage Incidents', description: 'Create/manage incidents', category: 'Operations', sortOrder: 2 },
  'operations:releases:read': { displayName: 'View Releases', description: 'View release information', category: 'Operations', sortOrder: 3 },
  'operations:releases:write': { displayName: 'Manage Releases', description: 'Plan/execute releases', category: 'Operations', sortOrder: 4 },
  'operations:capacity:read': { displayName: 'View Capacity', description: 'View capacity metrics', category: 'Operations', sortOrder: 5 },
  'operations:capacity:write': { displayName: 'Manage Capacity', description: 'Manage resources', category: 'Operations', sortOrder: 6 },

  // Super access (full access)
  'super:*': { displayName: 'Super Admin Access', description: 'Full platform access with all permissions', category: 'System', sortOrder: 999 },
} as const

/**
 * Tenant-level (organization) permissions
 */
export const TENANT_PERMISSIONS = {
  // Agents
  'agents:list': { displayName: 'List Agents', description: 'View agent list', category: 'Agents', sortOrder: 1 },
  'agents:read': { displayName: 'View Agent Details', description: 'View agent configuration', category: 'Agents', sortOrder: 2 },
  'agents:create': { displayName: 'Create Agents', description: 'Create new agents', category: 'Agents', sortOrder: 3 },
  'agents:update': { displayName: 'Update Agents', description: 'Modify agent settings', category: 'Agents', sortOrder: 4 },
  'agents:delete': { displayName: 'Delete Agents', description: 'Remove agents', category: 'Agents', sortOrder: 5 },
  'agents:execute': { displayName: 'Execute Agents', description: 'Run agent workflows', category: 'Agents', sortOrder: 6 },
  'agents:publish': { displayName: 'Publish Agents', description: 'Publish to production', category: 'Agents', sortOrder: 7 },

  // Workflows
  'workflows:list': { displayName: 'List Workflows', description: 'View workflow list', category: 'Workflows', sortOrder: 1 },
  'workflows:read': { displayName: 'View Workflow Details', description: 'View workflow configuration', category: 'Workflows', sortOrder: 2 },
  'workflows:create': { displayName: 'Create Workflows', description: 'Create new workflows', category: 'Workflows', sortOrder: 3 },
  'workflows:update': { displayName: 'Update Workflows', description: 'Modify workflows', category: 'Workflows', sortOrder: 4 },
  'workflows:delete': { displayName: 'Delete Workflows', description: 'Remove workflows', category: 'Workflows', sortOrder: 5 },
  'workflows:execute': { displayName: 'Execute Workflows', description: 'Run workflows', category: 'Workflows', sortOrder: 6 },
  'workflows:schedule': { displayName: 'Schedule Workflows', description: 'Set up scheduled runs', category: 'Workflows', sortOrder: 7 },

  // Reports
  'reports:list': { displayName: 'List Reports', description: 'View report list', category: 'Reports', sortOrder: 1 },
  'reports:read': { displayName: 'View Reports', description: 'View report content', category: 'Reports', sortOrder: 2 },
  'reports:create': { displayName: 'Create Reports', description: 'Create new reports', category: 'Reports', sortOrder: 3 },
  'reports:update': { displayName: 'Update Reports', description: 'Modify reports', category: 'Reports', sortOrder: 4 },
  'reports:delete': { displayName: 'Delete Reports', description: 'Remove reports', category: 'Reports', sortOrder: 5 },
  'reports:export': { displayName: 'Export Reports', description: 'Export report data', category: 'Reports', sortOrder: 6 },
  'reports:share': { displayName: 'Share Reports', description: 'Share with others', category: 'Reports', sortOrder: 7 },

  // Dashboards
  'dashboards:list': { displayName: 'List Dashboards', description: 'View dashboard list', category: 'Dashboards', sortOrder: 1 },
  'dashboards:read': { displayName: 'View Dashboards', description: 'View dashboard content', category: 'Dashboards', sortOrder: 2 },
  'dashboards:create': { displayName: 'Create Dashboards', description: 'Create new dashboards', category: 'Dashboards', sortOrder: 3 },
  'dashboards:update': { displayName: 'Update Dashboards', description: 'Modify dashboards', category: 'Dashboards', sortOrder: 4 },
  'dashboards:delete': { displayName: 'Delete Dashboards', description: 'Remove dashboards', category: 'Dashboards', sortOrder: 5 },
  'dashboards:share': { displayName: 'Share Dashboards', description: 'Share with others', category: 'Dashboards', sortOrder: 6 },

  // Data Sources
  'datasources:list': { displayName: 'List Data Sources', description: 'View data source list', category: 'Data Sources', sortOrder: 1 },
  'datasources:read': { displayName: 'View Data Source Details', description: 'View data source config', category: 'Data Sources', sortOrder: 2 },
  'datasources:create': { displayName: 'Create Data Sources', description: 'Add new data sources', category: 'Data Sources', sortOrder: 3 },
  'datasources:update': { displayName: 'Update Data Sources', description: 'Modify data sources', category: 'Data Sources', sortOrder: 4 },
  'datasources:delete': { displayName: 'Delete Data Sources', description: 'Remove data sources', category: 'Data Sources', sortOrder: 5 },
  'datasources:sync': { displayName: 'Sync Data Sources', description: 'Trigger data sync', category: 'Data Sources', sortOrder: 6 },

  // Team
  'team:list': { displayName: 'List Team Members', description: 'View team member list', category: 'Team', sortOrder: 1 },
  'team:read': { displayName: 'View Team Member Details', description: 'View member information', category: 'Team', sortOrder: 2 },
  'team:invite': { displayName: 'Invite Team Members', description: 'Send invitations', category: 'Team', sortOrder: 3 },
  'team:update': { displayName: 'Update Team Members', description: 'Modify member settings', category: 'Team', sortOrder: 4 },
  'team:remove': { displayName: 'Remove Team Members', description: 'Remove from organization', category: 'Team', sortOrder: 5 },
  'team:roles:assign': { displayName: 'Assign Roles', description: 'Change member roles', category: 'Team', sortOrder: 6 },

  // Organization Settings
  'org:settings:read': { displayName: 'View Org Settings', description: 'View organization settings', category: 'Organization Settings', sortOrder: 1 },
  'org:settings:write': { displayName: 'Manage Org Settings', description: 'Modify organization settings', category: 'Organization Settings', sortOrder: 2 },
  'org:branding:read': { displayName: 'View Branding', description: 'View branding settings', category: 'Organization Settings', sortOrder: 3 },
  'org:branding:write': { displayName: 'Manage Branding', description: 'Modify branding', category: 'Organization Settings', sortOrder: 4 },
  'org:billing:read': { displayName: 'View Billing', description: 'View billing information', category: 'Organization Settings', sortOrder: 5 },
  'org:billing:write': { displayName: 'Manage Billing', description: 'Modify billing settings', category: 'Organization Settings', sortOrder: 6 },
  'org:api-keys:read': { displayName: 'View API Keys', description: 'View API key list', category: 'Organization Settings', sortOrder: 7 },
  'org:api-keys:write': { displayName: 'Manage API Keys', description: 'Create/revoke API keys', category: 'Organization Settings', sortOrder: 8 },
  'org:integrations:read': { displayName: 'View Integrations', description: 'View org integrations', category: 'Organization Settings', sortOrder: 9 },
  'org:integrations:write': { displayName: 'Manage Integrations', description: 'Configure integrations', category: 'Organization Settings', sortOrder: 10 },
  'org:audit:read': { displayName: 'View Audit Logs', description: 'View organization audit logs', category: 'Organization Settings', sortOrder: 11 },

  // Audiences
  'audiences:list': { displayName: 'List Audiences', description: 'View audience list', category: 'Audiences', sortOrder: 1 },
  'audiences:read': { displayName: 'View Audiences', description: 'View audience details', category: 'Audiences', sortOrder: 2 },
  'audiences:create': { displayName: 'Create Audiences', description: 'Create new audiences', category: 'Audiences', sortOrder: 3 },
  'audiences:update': { displayName: 'Update Audiences', description: 'Modify audiences', category: 'Audiences', sortOrder: 4 },
  'audiences:delete': { displayName: 'Delete Audiences', description: 'Remove audiences', category: 'Audiences', sortOrder: 5 },

  // Charts
  'charts:list': { displayName: 'List Charts', description: 'View chart list', category: 'Charts', sortOrder: 1 },
  'charts:read': { displayName: 'View Charts', description: 'View chart details', category: 'Charts', sortOrder: 2 },
  'charts:create': { displayName: 'Create Charts', description: 'Create new charts', category: 'Charts', sortOrder: 3 },
  'charts:update': { displayName: 'Update Charts', description: 'Modify charts', category: 'Charts', sortOrder: 4 },
  'charts:delete': { displayName: 'Delete Charts', description: 'Remove charts', category: 'Charts', sortOrder: 5 },

  // Brand Tracking
  'brand-tracking:list': { displayName: 'List Brand Tracking', description: 'View brand tracking list', category: 'Brand Tracking', sortOrder: 1 },
  'brand-tracking:read': { displayName: 'View Brand Tracking', description: 'View brand tracking details', category: 'Brand Tracking', sortOrder: 2 },
  'brand-tracking:create': { displayName: 'Create Brand Tracking', description: 'Create new brand tracking', category: 'Brand Tracking', sortOrder: 3 },
  'brand-tracking:update': { displayName: 'Update Brand Tracking', description: 'Modify brand tracking', category: 'Brand Tracking', sortOrder: 4 },
  'brand-tracking:delete': { displayName: 'Delete Brand Tracking', description: 'Remove brand tracking', category: 'Brand Tracking', sortOrder: 5 },

  // Memory
  'memory:list': { displayName: 'List Memory', description: 'View memory entries', category: 'Memory', sortOrder: 1 },
  'memory:read': { displayName: 'View Memory', description: 'View memory details', category: 'Memory', sortOrder: 2 },
  'memory:create': { displayName: 'Create Memory', description: 'Create memory entries', category: 'Memory', sortOrder: 3 },
  'memory:update': { displayName: 'Update Memory', description: 'Modify memory entries', category: 'Memory', sortOrder: 4 },
  'memory:delete': { displayName: 'Delete Memory', description: 'Remove memory entries', category: 'Memory', sortOrder: 5 },

  // Hierarchy (organization tree)
  'hierarchy:read': { displayName: 'View Hierarchy', description: 'View organization hierarchy', category: 'Hierarchy', sortOrder: 1 },
  'hierarchy:write': { displayName: 'Manage Hierarchy', description: 'Create/edit child orgs', category: 'Hierarchy', sortOrder: 2 },
  'hierarchy:relationships:read': { displayName: 'View Relationships', description: 'View org relationships', category: 'Hierarchy', sortOrder: 3 },
  'hierarchy:relationships:write': { displayName: 'Manage Relationships', description: 'Create/edit relationships', category: 'Hierarchy', sortOrder: 4 },
  'hierarchy:sharing:read': { displayName: 'View Shared Resources', description: 'View shared resources', category: 'Hierarchy', sortOrder: 5 },
  'hierarchy:sharing:write': { displayName: 'Manage Sharing', description: 'Share resources', category: 'Hierarchy', sortOrder: 6 },

  // Admin access (full access to org)
  'admin:*': { displayName: 'Organization Admin', description: 'Full organization access', category: 'Organization Settings', sortOrder: 999 },
} as const

export type PlatformPermissionKey = keyof typeof PLATFORM_PERMISSIONS
export type TenantPermissionKey = keyof typeof TENANT_PERMISSIONS

/**
 * Get all permissions for a scope
 */
export function getAllPermissions(scope: RoleScope) {
  return scope === 'PLATFORM' ? PLATFORM_PERMISSIONS : TENANT_PERMISSIONS
}

/**
 * Get permission categories for a scope
 */
export function getPermissionCategories(scope: RoleScope) {
  return scope === 'PLATFORM' ? PERMISSION_CATEGORIES.PLATFORM : PERMISSION_CATEGORIES.TENANT
}
