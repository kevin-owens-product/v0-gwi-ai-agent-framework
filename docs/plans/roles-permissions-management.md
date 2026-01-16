# Roles & Permissions Management System

## Overview

This document outlines the implementation plan for a comprehensive roles and permissions management system in the admin portal. The system covers both platform-level (super admin) and tenant-level roles with granular permissions and role hierarchy support.

## Current State Analysis

| Component | Location | Status |
|-----------|----------|--------|
| SuperAdmin model | `prisma/schema.prisma:1234-1254` | ✅ Exists (hardcoded enum) |
| SuperAdminRole enum | `prisma/schema.prisma` | ✅ Hardcoded (4 roles) |
| Role permissions mapping | `lib/super-admin.ts` | ✅ Hardcoded in code |
| Tenant-level permissions | `lib/permissions.ts` | ✅ Comprehensive RBAC |
| Admin details page | `app/admin/admins/[id]/page.tsx` | ✅ View-only |

**Key Gap**: Roles and permissions are currently hardcoded. No UI exists to create custom roles, modify permissions, or dynamically manage the permission system.

---

## Architecture Design

### Design Principles

1. **Dynamic Roles**: Database-driven roles that can be created, modified, and deleted
2. **Granular Permissions**: Fine-grained permission system with maximum flexibility
3. **Role Hierarchy**: Automatic permission inheritance based on role priority
4. **No Overrides**: Role determines all permissions - no per-admin overrides
5. **Dual Scope**: Supports both platform (super admin) and tenant-level roles

### Role Hierarchy Model

```
Platform Level (Super Admin Roles):
┌─────────────────────────────────────────────────────┐
│ SUPER_ADMIN (priority: 100)                         │
│   └── Inherits all permissions                      │
│       └── ADMIN (priority: 80)                      │
│           └── Inherits: SUPPORT + ANALYST + more    │
│               ├── SUPPORT (priority: 60)            │
│               │   └── Support-focused permissions   │
│               └── ANALYST (priority: 40)            │
│                   └── Read-only analytics           │
└─────────────────────────────────────────────────────┘

Tenant Level (Organization Roles):
┌─────────────────────────────────────────────────────┐
│ OWNER (priority: 100)                               │
│   └── Full organization access                      │
│       └── ADMIN (priority: 80)                      │
│           └── Full feature access                   │
│               └── MEMBER (priority: 60)             │
│                   └── Standard access               │
│                       └── VIEWER (priority: 40)     │
│                           └── Read-only access      │
└─────────────────────────────────────────────────────┘
```

---

## Database Schema

### New Models

```prisma
// Dynamic role definition
model AdminRole {
  id              String   @id @default(cuid())
  name            String   @unique
  displayName     String
  description     String?
  scope           RoleScope @default(PLATFORM)
  permissions     String[] @default([])
  isSystem        Boolean  @default(false)
  isActive        Boolean  @default(true)
  priority        Int      @default(0)
  parentRoleId    String?
  color           String?  // For UI display
  icon            String?  // For UI display
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  createdById     String?

  // Relations
  parentRole      AdminRole?  @relation("RoleHierarchy", fields: [parentRoleId], references: [id])
  childRoles      AdminRole[] @relation("RoleHierarchy")
  superAdmins     SuperAdmin[]
  creator         SuperAdmin? @relation("RoleCreator", fields: [createdById], references: [id])

  @@index([scope])
  @@index([isActive])
  @@index([priority])
}

enum RoleScope {
  PLATFORM  // Super admin roles
  TENANT    // Organization-level roles
}

// Permission registry
model Permission {
  id              String   @id @default(cuid())
  key             String   @unique
  displayName     String
  description     String?
  category        String
  scope           RoleScope @default(PLATFORM)
  isActive        Boolean  @default(true)
  sortOrder       Int      @default(0)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@index([category])
  @@index([scope])
  @@index([isActive])
}

// Audit log for role changes
model RoleAuditLog {
  id              String   @id @default(cuid())
  roleId          String
  action          RoleAuditAction
  performedById   String
  previousState   Json?
  newState        Json?
  ipAddress       String?
  userAgent       String?
  createdAt       DateTime @default(now())

  role            AdminRole @relation(fields: [roleId], references: [id], onDelete: Cascade)
  performedBy     SuperAdmin @relation(fields: [performedById], references: [id])

  @@index([roleId])
  @@index([performedById])
  @@index([createdAt])
}

enum RoleAuditAction {
  CREATED
  UPDATED
  DELETED
  PERMISSIONS_CHANGED
  ADMIN_ASSIGNED
  ADMIN_UNASSIGNED
  ACTIVATED
  DEACTIVATED
}
```

### SuperAdmin Model Update

```prisma
model SuperAdmin {
  // ... existing fields ...

  // Replace enum-based role with dynamic role relation
  roleId          String?
  adminRole       AdminRole? @relation(fields: [roleId], references: [id])

  // Keep legacy field during migration, then remove
  // role            SuperAdminRole  @default(ADMIN) -- DEPRECATED

  // Remove permissions array (now managed by role)
  // permissions     String[]        @default([]) -- DEPRECATED

  // New relations
  createdRoles    AdminRole[] @relation("RoleCreator")
  roleAuditLogs   RoleAuditLog[]
}
```

---

## Permission Registry

### Platform-Level Permissions (Super Admin)

#### Organizations Category
| Permission Key | Display Name | Description |
|----------------|--------------|-------------|
| `organizations:list` | List Organizations | View list of all organizations |
| `organizations:read` | View Organization Details | View detailed organization information |
| `organizations:create` | Create Organizations | Create new organizations |
| `organizations:update` | Update Organizations | Modify organization settings |
| `organizations:delete` | Delete Organizations | Permanently delete organizations |
| `organizations:suspend` | Suspend Organizations | Suspend organization access |
| `organizations:restore` | Restore Organizations | Restore suspended organizations |
| `organizations:export` | Export Organization Data | Export organization data |
| `organizations:impersonate` | Impersonate Organization | Access org as if logged in |

#### Users Category
| Permission Key | Display Name | Description |
|----------------|--------------|-------------|
| `users:list` | List Users | View list of all users |
| `users:read` | View User Details | View detailed user information |
| `users:create` | Create Users | Create new user accounts |
| `users:update` | Update Users | Modify user information |
| `users:delete` | Delete Users | Permanently delete user accounts |
| `users:ban` | Ban Users | Ban users from platform |
| `users:unban` | Unban Users | Remove user bans |
| `users:reset-password` | Reset User Passwords | Force password reset for users |
| `users:export` | Export User Data | Export user data |
| `users:impersonate` | Impersonate Users | Access platform as user |

#### Admins Category
| Permission Key | Display Name | Description |
|----------------|--------------|-------------|
| `admins:list` | List Admins | View list of all admins |
| `admins:read` | View Admin Details | View detailed admin information |
| `admins:create` | Create Admins | Create new admin accounts |
| `admins:update` | Update Admins | Modify admin information |
| `admins:delete` | Delete Admins | Delete admin accounts |
| `admins:reset-password` | Reset Admin Passwords | Force password reset for admins |
| `admins:manage-2fa` | Manage Admin 2FA | Enable/disable admin 2FA |
| `admins:revoke-sessions` | Revoke Admin Sessions | Force logout admin sessions |

#### Roles Category
| Permission Key | Display Name | Description |
|----------------|--------------|-------------|
| `roles:list` | List Roles | View list of all roles |
| `roles:read` | View Role Details | View role permissions and assignments |
| `roles:create` | Create Roles | Create new custom roles |
| `roles:update` | Update Roles | Modify role permissions |
| `roles:delete` | Delete Roles | Delete custom roles |
| `roles:assign` | Assign Roles | Assign roles to admins |

#### Security Category
| Permission Key | Display Name | Description |
|----------------|--------------|-------------|
| `security:dashboard` | Security Dashboard | View security overview |
| `security:policies:read` | View Security Policies | View security policy settings |
| `security:policies:write` | Manage Security Policies | Create/modify security policies |
| `security:threats:read` | View Threat Detection | View security threats |
| `security:threats:manage` | Manage Threats | Respond to security threats |
| `security:violations:read` | View Violations | View policy violations |
| `security:violations:manage` | Manage Violations | Handle policy violations |
| `security:ip-allowlist:read` | View IP Allowlist | View allowed IP addresses |
| `security:ip-allowlist:write` | Manage IP Allowlist | Modify IP allowlist |

#### Audit Category
| Permission Key | Display Name | Description |
|----------------|--------------|-------------|
| `audit:read` | View Audit Logs | View platform audit logs |
| `audit:export` | Export Audit Logs | Export audit log data |
| `audit:configure` | Configure Audit Settings | Modify audit log settings |
| `audit:retention` | Manage Retention | Configure log retention policies |

#### Analytics Category
| Permission Key | Display Name | Description |
|----------------|--------------|-------------|
| `analytics:dashboard` | Analytics Dashboard | View analytics overview |
| `analytics:usage:read` | View Usage Analytics | View platform usage metrics |
| `analytics:revenue:read` | View Revenue Analytics | View revenue/billing metrics |
| `analytics:growth:read` | View Growth Analytics | View growth metrics |
| `analytics:export` | Export Analytics | Export analytics data |
| `analytics:reports:create` | Create Reports | Create custom reports |
| `analytics:reports:schedule` | Schedule Reports | Schedule automated reports |

#### Features Category
| Permission Key | Display Name | Description |
|----------------|--------------|-------------|
| `features:list` | List Feature Flags | View feature flags |
| `features:read` | View Feature Details | View feature flag configuration |
| `features:create` | Create Feature Flags | Create new feature flags |
| `features:update` | Update Feature Flags | Modify feature flags |
| `features:delete` | Delete Feature Flags | Remove feature flags |
| `features:toggle` | Toggle Features | Enable/disable features |
| `features:rollout` | Manage Rollouts | Configure feature rollouts |

#### Billing Category
| Permission Key | Display Name | Description |
|----------------|--------------|-------------|
| `billing:dashboard` | Billing Dashboard | View billing overview |
| `billing:plans:read` | View Plans | View subscription plans |
| `billing:plans:write` | Manage Plans | Create/modify plans |
| `billing:subscriptions:read` | View Subscriptions | View org subscriptions |
| `billing:subscriptions:write` | Manage Subscriptions | Modify subscriptions |
| `billing:invoices:read` | View Invoices | View invoices |
| `billing:invoices:create` | Create Invoices | Generate invoices |
| `billing:refunds` | Process Refunds | Issue refunds |
| `billing:credits` | Manage Credits | Add/remove credits |

#### Support Category
| Permission Key | Display Name | Description |
|----------------|--------------|-------------|
| `support:tickets:list` | List Support Tickets | View support ticket list |
| `support:tickets:read` | View Ticket Details | View ticket information |
| `support:tickets:create` | Create Tickets | Create support tickets |
| `support:tickets:respond` | Respond to Tickets | Reply to tickets |
| `support:tickets:assign` | Assign Tickets | Assign tickets to agents |
| `support:tickets:close` | Close Tickets | Close/resolve tickets |
| `support:tickets:escalate` | Escalate Tickets | Escalate to higher priority |
| `support:knowledge:read` | View Knowledge Base | View KB articles |
| `support:knowledge:write` | Manage Knowledge Base | Create/edit KB articles |

#### System Category
| Permission Key | Display Name | Description |
|----------------|--------------|-------------|
| `system:config:read` | View System Config | View system configuration |
| `system:config:write` | Modify System Config | Change system settings |
| `system:rules:read` | View System Rules | View automation rules |
| `system:rules:write` | Manage System Rules | Create/modify rules |
| `system:maintenance:read` | View Maintenance | View maintenance status |
| `system:maintenance:write` | Manage Maintenance | Schedule maintenance |
| `system:health:read` | View System Health | View health metrics |
| `system:logs:read` | View System Logs | View application logs |
| `system:cache:manage` | Manage Cache | Clear/manage caches |
| `system:jobs:read` | View Background Jobs | View job status |
| `system:jobs:manage` | Manage Background Jobs | Start/stop/retry jobs |

#### Notifications Category
| Permission Key | Display Name | Description |
|----------------|--------------|-------------|
| `notifications:list` | List Notifications | View notifications |
| `notifications:create` | Create Notifications | Send notifications |
| `notifications:broadcast` | Broadcast Messages | Send platform-wide messages |
| `notifications:templates:read` | View Templates | View notification templates |
| `notifications:templates:write` | Manage Templates | Create/edit templates |

#### Integrations Category
| Permission Key | Display Name | Description |
|----------------|--------------|-------------|
| `integrations:list` | List Integrations | View integrations |
| `integrations:read` | View Integration Details | View integration config |
| `integrations:create` | Create Integrations | Add new integrations |
| `integrations:update` | Update Integrations | Modify integrations |
| `integrations:delete` | Delete Integrations | Remove integrations |
| `integrations:webhooks:read` | View Webhooks | View webhook config |
| `integrations:webhooks:write` | Manage Webhooks | Create/modify webhooks |
| `integrations:api-clients:read` | View API Clients | View API client config |
| `integrations:api-clients:write` | Manage API Clients | Create/modify API clients |

#### Compliance Category
| Permission Key | Display Name | Description |
|----------------|--------------|-------------|
| `compliance:dashboard` | Compliance Dashboard | View compliance overview |
| `compliance:frameworks:read` | View Frameworks | View compliance frameworks |
| `compliance:frameworks:write` | Manage Frameworks | Configure frameworks |
| `compliance:audits:read` | View Compliance Audits | View audit records |
| `compliance:audits:write` | Manage Compliance Audits | Create/manage audits |
| `compliance:legal-holds:read` | View Legal Holds | View legal holds |
| `compliance:legal-holds:write` | Manage Legal Holds | Create/manage legal holds |
| `compliance:data-retention:read` | View Data Retention | View retention policies |
| `compliance:data-retention:write` | Manage Data Retention | Configure retention |

#### Identity Category
| Permission Key | Display Name | Description |
|----------------|--------------|-------------|
| `identity:domains:read` | View Domains | View domain configuration |
| `identity:domains:write` | Manage Domains | Configure domains |
| `identity:sso:read` | View SSO Settings | View SSO configuration |
| `identity:sso:write` | Manage SSO | Configure SSO providers |
| `identity:scim:read` | View SCIM Settings | View SCIM configuration |
| `identity:scim:write` | Manage SCIM | Configure SCIM |
| `identity:devices:read` | View Devices | View registered devices |
| `identity:devices:write` | Manage Devices | Manage device access |

#### Operations Category
| Permission Key | Display Name | Description |
|----------------|--------------|-------------|
| `operations:incidents:read` | View Incidents | View incident reports |
| `operations:incidents:write` | Manage Incidents | Create/manage incidents |
| `operations:releases:read` | View Releases | View release information |
| `operations:releases:write` | Manage Releases | Plan/execute releases |
| `operations:capacity:read` | View Capacity | View capacity metrics |
| `operations:capacity:write` | Manage Capacity | Manage resources |

### Tenant-Level Permissions (Organization)

#### Agents Category
| Permission Key | Display Name | Description |
|----------------|--------------|-------------|
| `agents:list` | List Agents | View agent list |
| `agents:read` | View Agent Details | View agent configuration |
| `agents:create` | Create Agents | Create new agents |
| `agents:update` | Update Agents | Modify agent settings |
| `agents:delete` | Delete Agents | Remove agents |
| `agents:execute` | Execute Agents | Run agent workflows |
| `agents:publish` | Publish Agents | Publish to production |

#### Workflows Category
| Permission Key | Display Name | Description |
|----------------|--------------|-------------|
| `workflows:list` | List Workflows | View workflow list |
| `workflows:read` | View Workflow Details | View workflow configuration |
| `workflows:create` | Create Workflows | Create new workflows |
| `workflows:update` | Update Workflows | Modify workflows |
| `workflows:delete` | Delete Workflows | Remove workflows |
| `workflows:execute` | Execute Workflows | Run workflows |
| `workflows:schedule` | Schedule Workflows | Set up scheduled runs |

#### Reports Category
| Permission Key | Display Name | Description |
|----------------|--------------|-------------|
| `reports:list` | List Reports | View report list |
| `reports:read` | View Reports | View report content |
| `reports:create` | Create Reports | Create new reports |
| `reports:update` | Update Reports | Modify reports |
| `reports:delete` | Delete Reports | Remove reports |
| `reports:export` | Export Reports | Export report data |
| `reports:share` | Share Reports | Share with others |

#### Dashboards Category
| Permission Key | Display Name | Description |
|----------------|--------------|-------------|
| `dashboards:list` | List Dashboards | View dashboard list |
| `dashboards:read` | View Dashboards | View dashboard content |
| `dashboards:create` | Create Dashboards | Create new dashboards |
| `dashboards:update` | Update Dashboards | Modify dashboards |
| `dashboards:delete` | Delete Dashboards | Remove dashboards |
| `dashboards:share` | Share Dashboards | Share with others |

#### Data Sources Category
| Permission Key | Display Name | Description |
|----------------|--------------|-------------|
| `datasources:list` | List Data Sources | View data source list |
| `datasources:read` | View Data Source Details | View data source config |
| `datasources:create` | Create Data Sources | Add new data sources |
| `datasources:update` | Update Data Sources | Modify data sources |
| `datasources:delete` | Delete Data Sources | Remove data sources |
| `datasources:sync` | Sync Data Sources | Trigger data sync |

#### Team Category
| Permission Key | Display Name | Description |
|----------------|--------------|-------------|
| `team:list` | List Team Members | View team member list |
| `team:read` | View Team Member Details | View member information |
| `team:invite` | Invite Team Members | Send invitations |
| `team:update` | Update Team Members | Modify member settings |
| `team:remove` | Remove Team Members | Remove from organization |
| `team:roles:assign` | Assign Roles | Change member roles |

#### Organization Settings Category
| Permission Key | Display Name | Description |
|----------------|--------------|-------------|
| `org:settings:read` | View Org Settings | View organization settings |
| `org:settings:write` | Manage Org Settings | Modify organization settings |
| `org:branding:read` | View Branding | View branding settings |
| `org:branding:write` | Manage Branding | Modify branding |
| `org:billing:read` | View Billing | View billing information |
| `org:billing:write` | Manage Billing | Modify billing settings |
| `org:api-keys:read` | View API Keys | View API key list |
| `org:api-keys:write` | Manage API Keys | Create/revoke API keys |
| `org:integrations:read` | View Integrations | View org integrations |
| `org:integrations:write` | Manage Integrations | Configure integrations |

---

## Default Role Configurations

### Platform (Super Admin) Default Roles

#### SUPER_ADMIN (Priority: 100)
- **Description**: Full platform access with all permissions
- **Permissions**: `*` (all permissions)
- **System Role**: Yes (cannot be deleted)
- **Parent Role**: None (top of hierarchy)

#### ADMIN (Priority: 80)
- **Description**: Standard admin with most management capabilities
- **Inherits From**: SUPPORT, ANALYST
- **System Role**: Yes
- **Permissions**: All except:
  - `admins:delete`
  - `admins:manage-2fa`
  - `roles:delete`
  - `system:config:write`
  - `system:maintenance:write`

#### SUPPORT (Priority: 60)
- **Description**: Customer support with limited write access
- **System Role**: Yes
- **Permissions**:
  - `organizations:list`, `organizations:read`
  - `users:list`, `users:read`, `users:reset-password`
  - `support:*` (all support permissions)
  - `audit:read`
  - `analytics:dashboard`, `analytics:usage:read`
  - `billing:dashboard`, `billing:subscriptions:read`, `billing:invoices:read`
  - `notifications:list`, `notifications:create`

#### ANALYST (Priority: 40)
- **Description**: Read-only analytics access
- **System Role**: Yes
- **Permissions**:
  - `organizations:list`, `organizations:read`
  - `users:list`, `users:read`
  - `analytics:*` (all analytics permissions)
  - `audit:read`
  - `features:list`, `features:read`

### Tenant (Organization) Default Roles

#### OWNER (Priority: 100)
- **Description**: Full organization access
- **Permissions**: `*` (all tenant permissions)
- **System Role**: Yes
- **Parent Role**: None

#### ADMIN (Priority: 80)
- **Description**: Full feature access, limited billing/team management
- **System Role**: Yes
- **Inherits From**: MEMBER
- **Permissions**: All except:
  - `org:billing:write`
  - `team:remove` (for owners)

#### MEMBER (Priority: 60)
- **Description**: Standard feature access
- **System Role**: Yes
- **Inherits From**: VIEWER
- **Permissions**:
  - All `:list`, `:read`, `:create`, `:update`, `:execute` permissions
  - No `:delete`, `:manage`, or admin permissions

#### VIEWER (Priority: 40)
- **Description**: Read-only access
- **System Role**: Yes
- **Permissions**:
  - All `:list` and `:read` permissions only

---

## API Endpoints

### Roles API

| Method | Endpoint | Description | Required Permission |
|--------|----------|-------------|---------------------|
| GET | `/api/admin/roles` | List all roles | `roles:list` |
| GET | `/api/admin/roles/:id` | Get role details | `roles:read` |
| POST | `/api/admin/roles` | Create new role | `roles:create` |
| PUT | `/api/admin/roles/:id` | Update role | `roles:update` |
| DELETE | `/api/admin/roles/:id` | Delete role | `roles:delete` |
| GET | `/api/admin/roles/:id/admins` | Get admins with role | `roles:read` |
| POST | `/api/admin/roles/:id/assign` | Assign role to admin | `roles:assign` |
| GET | `/api/admin/roles/:id/audit` | Get role audit log | `audit:read` |

### Permissions API

| Method | Endpoint | Description | Required Permission |
|--------|----------|-------------|---------------------|
| GET | `/api/admin/permissions` | List all permissions | `roles:read` |
| GET | `/api/admin/permissions/categories` | Get grouped by category | `roles:read` |
| GET | `/api/admin/permissions/:scope` | Get by scope | `roles:read` |

---

## UI Components

### File Structure

```
app/
├── admin/
│   └── roles/
│       ├── page.tsx                    # Roles list page
│       ├── new/
│       │   └── page.tsx                # Create role page
│       └── [id]/
│           ├── page.tsx                # Role detail/edit page
│           └── audit/
│               └── page.tsx            # Role audit log
├── api/
│   └── admin/
│       ├── roles/
│       │   ├── route.ts                # GET (list), POST (create)
│       │   └── [id]/
│       │       ├── route.ts            # GET, PUT, DELETE
│       │       ├── admins/
│       │       │   └── route.ts        # GET admins with role
│       │       ├── assign/
│       │       │   └── route.ts        # POST assign role
│       │       └── audit/
│       │           └── route.ts        # GET audit log
│       └── permissions/
│           └── route.ts                # GET permissions
components/
└── admin/
    └── roles/
        ├── roles-table.tsx             # DataTable component
        ├── role-form.tsx               # Create/edit form
        ├── permission-matrix.tsx       # Permission selection grid
        ├── permission-category.tsx     # Category accordion
        ├── role-hierarchy-tree.tsx     # Visual hierarchy
        ├── role-badge.tsx              # Role display badge
        ├── assign-role-dialog.tsx      # Role assignment modal
        └── role-audit-table.tsx        # Audit log table
lib/
├── permissions/
│   ├── index.ts                        # Main exports
│   ├── registry.ts                     # Permission definitions
│   ├── constants.ts                    # Permission constants
│   └── utils.ts                        # Helper functions
└── roles/
    ├── index.ts                        # Main exports
    ├── service.ts                      # Role operations
    ├── hierarchy.ts                    # Hierarchy logic
    └── defaults.ts                     # Default role configs
```

### Key Components

#### RolesTable
- Sortable, filterable DataTable
- Columns: Name, Scope, Priority, Admins Count, Status, Actions
- Quick actions: Edit, Clone, Delete (for custom roles)
- System role indicator

#### PermissionMatrix
- Accordion-based category groups
- Checkbox grid for permission selection
- "Select All" per category
- Search/filter permissions
- Visual indication of inherited permissions
- Disabled state for system roles (SUPER_ADMIN only)

#### RoleHierarchyTree
- Visual tree representation
- Drag-and-drop reordering (future)
- Expand/collapse nodes
- Permission inheritance indicators

---

## Implementation Phases

### Phase 1: Database Schema & Migration
1. Add AdminRole model
2. Add Permission model
3. Add RoleAuditLog model
4. Update SuperAdmin model
5. Create seed script for default roles/permissions
6. Run migrations

### Phase 2: Core Library Functions
1. Create permission registry (`lib/permissions/registry.ts`)
2. Create role service (`lib/roles/service.ts`)
3. Implement hierarchy logic (`lib/roles/hierarchy.ts`)
4. Update auth checks in `lib/super-admin.ts`

### Phase 3: Backend APIs
1. Implement Roles CRUD API
2. Implement Permissions API
3. Implement role assignment API
4. Add audit logging

### Phase 4: Frontend - Roles List
1. Create roles list page
2. Build RolesTable component
3. Add role badges
4. Integrate with API

### Phase 5: Frontend - Role Management
1. Create role form component
2. Build PermissionMatrix component
3. Create/edit role pages
4. Clone role functionality

### Phase 6: Frontend - Integration
1. Update admin sidebar navigation
2. Update admin creation/edit to use roles
3. Add role hierarchy visualization
4. Integrate audit log view

### Phase 7: Testing & Polish
1. Unit tests for role service
2. API integration tests
3. E2E tests for role management
4. Permission check testing
5. Migration testing

---

## Security Considerations

1. **Permission Checks**: All role management requires appropriate permissions
2. **System Role Protection**: Cannot delete or severely modify system roles
3. **Self-Demotion Prevention**: Admins cannot remove their own role access
4. **Audit Trail**: All changes logged with full context
5. **Hierarchy Enforcement**: Cannot assign higher-priority role than own
6. **Input Validation**: Strict validation on all inputs
7. **Rate Limiting**: Protect against abuse

---

## Migration Strategy

1. **Backward Compatibility**: Keep legacy `role` enum during transition
2. **Data Migration**: Map existing admins to new dynamic roles
3. **Gradual Rollout**: Feature flag for new role system
4. **Rollback Plan**: Ability to revert to enum-based system

---

## Success Metrics

- All existing functionality preserved
- No permission escalation vulnerabilities
- Role management operations < 500ms
- 100% audit coverage for role changes
- Zero downtime migration
