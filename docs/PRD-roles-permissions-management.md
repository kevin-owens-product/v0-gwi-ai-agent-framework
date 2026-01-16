# Product Requirements Document (PRD)
# Dynamic Roles & Permissions Management System

**Version:** 1.0
**Status:** Implemented
**Last Updated:** January 2026

---

## 1. Executive Summary

### 1.1 Overview
This document defines the requirements for a comprehensive roles and permissions management system within the admin portal. The system enables administrators to create, manage, and remove roles with granular permissions for both platform-level (super admin) and tenant-level (organization) users.

### 1.2 Problem Statement
The existing system uses hardcoded role enums with static permission mappings, limiting flexibility and requiring code changes to modify access controls. Administrators cannot create custom roles, adjust permissions, or implement organization-specific access policies without developer intervention.

### 1.3 Goals
- **Dynamic Roles**: Replace hardcoded enums with database-driven role definitions
- **Granular Permissions**: Implement fine-grained permissions (150+ individual permissions)
- **Role Hierarchy**: Support permission inheritance through role priority levels
- **Dual Scope**: Separate platform-level and tenant-level role management
- **Full Audit Trail**: Track all role and permission changes
- **No Per-User Overrides**: Role assignment determines all permissions (no individual exceptions)

---

## 2. User Personas

### 2.1 Super Admin
- **Description**: Platform administrator with full system access
- **Needs**: Manage all platform roles, assign roles to other admins, view audit logs
- **Pain Points**: Currently cannot create custom roles for specialized admin functions

### 2.2 Platform Admin
- **Description**: Standard administrator with operational responsibilities
- **Needs**: View roles, understand their permissions, manage organization access
- **Pain Points**: Limited visibility into what permissions each role grants

### 2.3 Organization Owner
- **Description**: Tenant administrator who owns an organization
- **Needs**: Manage team member roles within their organization
- **Pain Points**: Cannot create custom roles for specialized team functions

---

## 3. Functional Requirements

### 3.1 Role Management

#### 3.1.1 Role CRUD Operations
| Requirement | Description | Priority |
|-------------|-------------|----------|
| FR-ROLE-001 | Create new custom roles with name, description, and permissions | P0 |
| FR-ROLE-002 | View list of all roles with filtering by scope and status | P0 |
| FR-ROLE-003 | View detailed role information including permissions | P0 |
| FR-ROLE-004 | Update role name, description, and permissions | P0 |
| FR-ROLE-005 | Delete custom roles (system roles protected) | P0 |
| FR-ROLE-006 | Clone existing roles as templates for new roles | P1 |
| FR-ROLE-007 | Activate/deactivate roles without deletion | P1 |

#### 3.1.2 Role Properties
| Property | Type | Required | Description |
|----------|------|----------|-------------|
| name | string | Yes | Unique identifier (slug format) |
| displayName | string | Yes | Human-readable name |
| description | string | No | Detailed description of role purpose |
| scope | enum | Yes | PLATFORM or TENANT |
| permissions | string[] | Yes | Array of permission keys |
| isSystem | boolean | Yes | System roles cannot be deleted |
| isActive | boolean | Yes | Inactive roles cannot be assigned |
| priority | integer | Yes | Higher = more privileges (0-100) |
| parentRoleId | string | No | Parent role for inheritance |
| color | string | No | Hex color for UI display |
| icon | string | No | Icon name for UI display |

#### 3.1.3 Role Hierarchy
- Roles have a priority level (0-100) determining hierarchy position
- Higher priority roles can manage lower priority roles
- Optional parent-child relationships for permission inheritance
- Inherited permissions are clearly indicated in the UI

### 3.2 Permission Management

#### 3.2.1 Permission Structure
Permissions follow a hierarchical naming convention:
```
{category}:{action}
{category}:{subcategory}:{action}
```

Examples:
- `organizations:read` - View organization details
- `organizations:impersonate` - Access organization as if logged in
- `security:policies:write` - Create/modify security policies

#### 3.2.2 Platform Permissions (Super Admin)

**Categories and Permission Counts:**

| Category | Permissions | Description |
|----------|-------------|-------------|
| Organizations | 9 | CRUD + suspend/restore/export/impersonate |
| Users | 10 | CRUD + ban/unban/reset-password/export/impersonate |
| Admins | 8 | CRUD + reset-password/manage-2fa/revoke-sessions |
| Roles | 6 | CRUD + assign |
| Security | 9 | Dashboard + policies/threats/violations/ip-allowlist |
| Audit | 4 | Read + export/configure/retention |
| Analytics | 7 | Dashboard + usage/revenue/growth/export/reports |
| Features | 7 | CRUD + toggle/rollout |
| Billing | 9 | Dashboard + plans/subscriptions/invoices/refunds/credits |
| Support | 9 | Tickets CRUD + knowledge base |
| System | 11 | Config + rules/maintenance/health/logs/cache/jobs |
| Notifications | 5 | List + create/broadcast/templates |
| Integrations | 9 | CRUD + webhooks/api-clients |
| Compliance | 9 | Dashboard + frameworks/audits/legal-holds/data-retention |
| Identity | 8 | Domains + SSO/SCIM/devices |
| Operations | 6 | Incidents + releases/capacity |

**Total Platform Permissions: 116**

#### 3.2.3 Tenant Permissions (Organization)

**Categories and Permission Counts:**

| Category | Permissions | Description |
|----------|-------------|-------------|
| Agents | 7 | CRUD + execute/publish |
| Workflows | 7 | CRUD + execute/schedule |
| Reports | 7 | CRUD + export/share |
| Dashboards | 6 | CRUD + share |
| Data Sources | 6 | CRUD + sync |
| Team | 6 | List/read + invite/update/remove/roles:assign |
| Organization Settings | 11 | Settings + branding/billing/api-keys/integrations/audit |
| Audiences | 5 | CRUD |
| Charts | 5 | CRUD |
| Brand Tracking | 5 | CRUD |
| Memory | 5 | CRUD |
| Hierarchy | 6 | Read/write + relationships/sharing |

**Total Tenant Permissions: 76**

### 3.3 Role Assignment

#### 3.3.1 Assignment Rules
| Requirement | Description | Priority |
|-------------|-------------|----------|
| FR-ASSIGN-001 | Assign single role to admin (no multiple roles) | P0 |
| FR-ASSIGN-002 | Only assign roles with equal or lower priority | P0 |
| FR-ASSIGN-003 | Cannot remove own role (self-demotion prevention) | P0 |
| FR-ASSIGN-004 | View all admins assigned to a specific role | P0 |
| FR-ASSIGN-005 | Bulk role assignment to multiple admins | P2 |

### 3.4 Audit Logging

#### 3.4.1 Logged Events
| Event | Data Captured |
|-------|---------------|
| CREATED | New role full state, creator ID |
| UPDATED | Previous state, new state, changed fields |
| DELETED | Final state before deletion |
| PERMISSIONS_CHANGED | Previous permissions, new permissions |
| ADMIN_ASSIGNED | Admin ID, role ID |
| ADMIN_UNASSIGNED | Admin ID, role ID |
| ACTIVATED | Role ID, activator ID |
| DEACTIVATED | Role ID, deactivator ID |

#### 3.4.2 Audit Metadata
- Timestamp
- Performer ID
- IP Address
- User Agent
- Change description (human-readable)

---

## 4. Default Role Configurations

### 4.1 Platform Roles (Pre-configured)

#### Super Admin
- **Priority:** 100
- **Permissions:** `super:*` (all permissions)
- **System Role:** Yes (cannot be deleted)
- **Color:** Purple (#8B5CF6)
- **Icon:** Shield

#### Platform Admin
- **Priority:** 80
- **Permissions:** 73 specific permissions (excludes destructive operations)
- **Exclusions:** `admins:delete`, `admins:manage-2fa`, `roles:delete`, `system:config:write`, `system:maintenance:write`
- **System Role:** Yes
- **Color:** Blue (#3B82F6)
- **Icon:** UserCog

#### Support Agent
- **Priority:** 60
- **Permissions:** 21 permissions (support-focused + read-only platform access)
- **Focus:** Support tickets, user assistance, basic analytics
- **System Role:** Yes
- **Color:** Green (#10B981)
- **Icon:** Headphones

#### Analyst
- **Priority:** 40
- **Permissions:** 15 permissions (read-only analytics)
- **Focus:** Analytics, reports, dashboards (read + export)
- **System Role:** Yes
- **Color:** Amber (#F59E0B)
- **Icon:** BarChart

### 4.2 Tenant Roles (Pre-configured)

#### Organization Owner
- **Priority:** 100
- **Permissions:** `admin:*` (all tenant permissions)
- **System Role:** Yes
- **Color:** Purple (#8B5CF6)
- **Icon:** Crown

#### Organization Admin
- **Priority:** 80
- **Permissions:** 68 permissions (all features, limited billing/team)
- **Exclusions:** `org:billing:write`, `team:remove` (for owners)
- **System Role:** Yes
- **Color:** Blue (#3B82F6)
- **Icon:** UserCog

#### Organization Member
- **Priority:** 60
- **Permissions:** 42 permissions (standard feature access)
- **Focus:** Create/update content, limited settings access
- **Exclusions:** Delete operations, admin functions
- **System Role:** Yes
- **Color:** Green (#10B981)
- **Icon:** User

#### Organization Viewer
- **Priority:** 40
- **Permissions:** 26 permissions (read-only)
- **Focus:** List and read operations only
- **System Role:** Yes
- **Color:** Gray (#6B7280)
- **Icon:** Eye

---

## 5. Technical Architecture

### 5.1 Data Model

```
┌─────────────────────────────────────────────────────────────────┐
│                         AdminRole                                │
├─────────────────────────────────────────────────────────────────┤
│ id: String (CUID)                                               │
│ name: String (unique, slug)                                     │
│ displayName: String                                             │
│ description: String?                                            │
│ scope: RoleScope (PLATFORM | TENANT)                           │
│ permissions: String[]                                           │
│ isSystem: Boolean                                               │
│ isActive: Boolean                                               │
│ priority: Int (0-100)                                          │
│ parentRoleId: String? (self-reference)                         │
│ color: String?                                                  │
│ icon: String?                                                   │
│ createdById: String? (FK -> SuperAdmin)                        │
│ createdAt: DateTime                                             │
│ updatedAt: DateTime                                             │
└─────────────────────────────────────────────────────────────────┘
         │                                    │
         │ 1:N                                │ 1:N
         ▼                                    ▼
┌─────────────────────┐            ┌─────────────────────────────┐
│    SuperAdmin       │            │      RoleAuditLog            │
├─────────────────────┤            ├─────────────────────────────┤
│ id: String          │            │ id: String                   │
│ adminRoleId: String?│            │ roleId: String (FK)          │
│ ...                 │            │ action: RoleAuditAction      │
└─────────────────────┘            │ performedById: String (FK)   │
                                   │ previousState: Json?         │
                                   │ newState: Json?              │
                                   │ changes: Json?               │
                                   │ ipAddress: String?           │
                                   │ userAgent: String?           │
                                   │ createdAt: DateTime          │
                                   └─────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                        Permission                                │
├─────────────────────────────────────────────────────────────────┤
│ id: String (CUID)                                               │
│ key: String (unique, e.g., "organizations:read")               │
│ displayName: String                                             │
│ description: String?                                            │
│ category: String                                                │
│ scope: RoleScope                                                │
│ isActive: Boolean                                               │
│ sortOrder: Int                                                  │
│ createdAt: DateTime                                             │
│ updatedAt: DateTime                                             │
└─────────────────────────────────────────────────────────────────┘
```

### 5.2 API Endpoints

#### Roles API
| Method | Endpoint | Description | Permission |
|--------|----------|-------------|------------|
| GET | `/api/admin/roles` | List roles (filterable) | `roles:list` |
| POST | `/api/admin/roles` | Create new role | `roles:create` |
| GET | `/api/admin/roles/:id` | Get role details | `roles:read` |
| PUT | `/api/admin/roles/:id` | Update role | `roles:update` |
| DELETE | `/api/admin/roles/:id` | Delete role | `roles:delete` |
| POST | `/api/admin/roles/:id` (action=clone) | Clone role | `roles:create` |
| POST | `/api/admin/roles/:id/assign` | Assign to admin | `roles:assign` |
| DELETE | `/api/admin/roles/:id/assign` | Remove from admin | `roles:assign` |
| GET | `/api/admin/roles/:id/audit` | View audit log | `audit:read` |

#### Permissions API
| Method | Endpoint | Description | Permission |
|--------|----------|-------------|------------|
| GET | `/api/admin/permissions` | List all permissions | `roles:read` |
| GET | `/api/admin/permissions?scope=PLATFORM` | Platform permissions | `roles:read` |
| GET | `/api/admin/permissions?scope=TENANT` | Tenant permissions | `roles:read` |

### 5.3 File Structure

```
lib/
├── permissions/
│   ├── constants.ts      # All permission definitions
│   └── index.ts          # Exports + helper functions
├── roles/
│   ├── service.ts        # Core role operations
│   ├── defaults.ts       # Default role configurations
│   └── index.ts          # Exports + seeding functions

app/
├── api/admin/
│   ├── roles/
│   │   ├── route.ts              # GET (list), POST (create)
│   │   └── [id]/
│   │       ├── route.ts          # GET, PUT, DELETE, POST (clone)
│   │       ├── assign/route.ts   # POST, DELETE (assignment)
│   │       └── audit/route.ts    # GET (audit log)
│   └── permissions/
│       └── route.ts              # GET (list permissions)
├── admin/roles/
│   ├── page.tsx                  # Roles list page
│   ├── new/page.tsx              # Create role page
│   └── [id]/page.tsx             # Role detail/edit page

components/admin/roles/
├── permission-matrix.tsx         # Permission selection UI
└── (other role-specific components)
```

---

## 6. User Interface Requirements

### 6.1 Roles List Page

**Features:**
- Tab navigation: Platform Roles | Tenant Roles
- DataTable with columns: Name, Description, Scope, Priority, Admins Count, Status, Actions
- Quick actions: Edit, Clone, Delete (custom roles only)
- System role badge indicator
- Color-coded role badges
- Search and filter capabilities
- Create new role button

**Mockup Layout:**
```
┌─────────────────────────────────────────────────────────────┐
│ Roles & Permissions                              [+ New Role]│
├─────────────────────────────────────────────────────────────┤
│ [Platform Roles] [Tenant Roles]                              │
├─────────────────────────────────────────────────────────────┤
│ Search: [________________] Filter: [All ▼] [Active ▼]        │
├─────────────────────────────────────────────────────────────┤
│ Name          │ Priority │ Admins │ Status │ Actions        │
│───────────────│──────────│────────│────────│────────────────│
│ 🛡️ Super Admin │ 100      │ 2      │ Active │ [View]         │
│ 👤 Platform Ad │ 80       │ 5      │ Active │ [View][Clone]  │
│ 🎧 Support Agt │ 60       │ 8      │ Active │ [View][Clone]  │
│ 📊 Analyst     │ 40       │ 3      │ Active │ [View][Clone]  │
│ ✏️ Custom Role │ 50       │ 1      │ Active │ [Edit][Delete] │
└─────────────────────────────────────────────────────────────┘
```

### 6.2 Role Detail/Edit Page

**Tabs:**
1. **Details** - Name, description, scope, priority, parent role, color, icon
2. **Permissions** - Permission matrix with category accordions
3. **Assigned Admins** - List of admins with this role
4. **Audit Log** - History of changes

**Permission Matrix Features:**
- Accordion-based category grouping
- Checkbox for each permission
- "Select All" per category
- Search/filter permissions
- Inherited permissions shown as disabled with indicator
- Permission count per category

### 6.3 Create Role Page

**Fields:**
- Name (auto-generates slug)
- Display Name
- Description
- Scope (Platform/Tenant - determines available permissions)
- Parent Role (optional, for inheritance)
- Priority (slider or input, 0-100)
- Color picker
- Icon selector
- Permission matrix

---

## 7. Security Requirements

| Requirement | Description |
|-------------|-------------|
| SEC-001 | All role operations require appropriate permissions |
| SEC-002 | System roles cannot be deleted or have critical permissions removed |
| SEC-003 | Admins cannot assign roles with higher priority than their own |
| SEC-004 | Admins cannot remove their own role assignment |
| SEC-005 | All changes are logged with full audit trail |
| SEC-006 | Input validation on all role properties |
| SEC-007 | Rate limiting on role management APIs |
| SEC-008 | Permission checks enforce scope isolation (platform vs tenant) |

---

## 8. Migration Strategy

### 8.1 Data Migration
1. Create new database tables (AdminRole, Permission, RoleAuditLog)
2. Seed default roles and permissions
3. Map existing SuperAdmin.role enum values to new AdminRole records
4. Update SuperAdmin records with adminRoleId reference
5. Maintain backward compatibility during transition

### 8.2 Legacy Role Mapping
| Legacy Enum | New Role Name |
|-------------|---------------|
| SUPER_ADMIN | super-admin |
| ADMIN | platform-admin |
| SUPPORT | support-agent |
| ANALYST | analyst |

---

## 9. Success Metrics

| Metric | Target |
|--------|--------|
| Role management operations latency | < 500ms |
| Audit coverage | 100% of role changes |
| Permission check latency | < 10ms |
| Custom roles created | Track adoption |
| Zero permission escalation vulnerabilities | Critical |

---

## 10. Future Enhancements (Out of Scope)

- Bulk role assignment
- Role templates marketplace
- Conditional permissions (time-based, IP-based)
- Permission groups/bundles
- Role expiration dates
- Role approval workflows
- Integration with external identity providers
- Custom permission creation via UI

---

## 11. Appendix

### A. Complete Permission Reference

#### Platform Permissions (PLATFORM scope)

**Organizations:**
- `organizations:list` - List Organizations
- `organizations:read` - View Organization Details
- `organizations:create` - Create Organizations
- `organizations:update` - Update Organizations
- `organizations:delete` - Delete Organizations
- `organizations:suspend` - Suspend Organizations
- `organizations:restore` - Restore Organizations
- `organizations:export` - Export Organization Data
- `organizations:impersonate` - Impersonate Organization

**Users:**
- `users:list` - List Users
- `users:read` - View User Details
- `users:create` - Create Users
- `users:update` - Update Users
- `users:delete` - Delete Users
- `users:ban` - Ban Users
- `users:unban` - Unban Users
- `users:reset-password` - Reset User Passwords
- `users:export` - Export User Data
- `users:impersonate` - Impersonate Users

**Admins:**
- `admins:list` - List Admins
- `admins:read` - View Admin Details
- `admins:create` - Create Admins
- `admins:update` - Update Admins
- `admins:delete` - Delete Admins
- `admins:reset-password` - Reset Admin Passwords
- `admins:manage-2fa` - Manage Admin 2FA
- `admins:revoke-sessions` - Revoke Admin Sessions

**Roles:**
- `roles:list` - List Roles
- `roles:read` - View Role Details
- `roles:create` - Create Roles
- `roles:update` - Update Roles
- `roles:delete` - Delete Roles
- `roles:assign` - Assign Roles

**Security:**
- `security:dashboard` - Security Dashboard
- `security:policies:read` - View Security Policies
- `security:policies:write` - Manage Security Policies
- `security:threats:read` - View Threat Detection
- `security:threats:manage` - Manage Threats
- `security:violations:read` - View Violations
- `security:violations:manage` - Manage Violations
- `security:ip-allowlist:read` - View IP Allowlist
- `security:ip-allowlist:write` - Manage IP Allowlist

**Audit:**
- `audit:read` - View Audit Logs
- `audit:export` - Export Audit Logs
- `audit:configure` - Configure Audit Settings
- `audit:retention` - Manage Retention

**Analytics:**
- `analytics:dashboard` - Analytics Dashboard
- `analytics:usage:read` - View Usage Analytics
- `analytics:revenue:read` - View Revenue Analytics
- `analytics:growth:read` - View Growth Analytics
- `analytics:export` - Export Analytics
- `analytics:reports:create` - Create Reports
- `analytics:reports:schedule` - Schedule Reports

**Features:**
- `features:list` - List Feature Flags
- `features:read` - View Feature Details
- `features:create` - Create Feature Flags
- `features:update` - Update Feature Flags
- `features:delete` - Delete Feature Flags
- `features:toggle` - Toggle Features
- `features:rollout` - Manage Rollouts

**Billing:**
- `billing:dashboard` - Billing Dashboard
- `billing:plans:read` - View Plans
- `billing:plans:write` - Manage Plans
- `billing:subscriptions:read` - View Subscriptions
- `billing:subscriptions:write` - Manage Subscriptions
- `billing:invoices:read` - View Invoices
- `billing:invoices:create` - Create Invoices
- `billing:refunds` - Process Refunds
- `billing:credits` - Manage Credits

**Support:**
- `support:tickets:list` - List Support Tickets
- `support:tickets:read` - View Ticket Details
- `support:tickets:create` - Create Tickets
- `support:tickets:respond` - Respond to Tickets
- `support:tickets:assign` - Assign Tickets
- `support:tickets:close` - Close Tickets
- `support:tickets:escalate` - Escalate Tickets
- `support:knowledge:read` - View Knowledge Base
- `support:knowledge:write` - Manage Knowledge Base

**System:**
- `system:config:read` - View System Config
- `system:config:write` - Modify System Config
- `system:rules:read` - View System Rules
- `system:rules:write` - Manage System Rules
- `system:maintenance:read` - View Maintenance
- `system:maintenance:write` - Manage Maintenance
- `system:health:read` - View System Health
- `system:logs:read` - View System Logs
- `system:cache:manage` - Manage Cache
- `system:jobs:read` - View Background Jobs
- `system:jobs:manage` - Manage Background Jobs

**Notifications:**
- `notifications:list` - List Notifications
- `notifications:create` - Create Notifications
- `notifications:broadcast` - Broadcast Messages
- `notifications:templates:read` - View Templates
- `notifications:templates:write` - Manage Templates

**Integrations:**
- `integrations:list` - List Integrations
- `integrations:read` - View Integration Details
- `integrations:create` - Create Integrations
- `integrations:update` - Update Integrations
- `integrations:delete` - Delete Integrations
- `integrations:webhooks:read` - View Webhooks
- `integrations:webhooks:write` - Manage Webhooks
- `integrations:api-clients:read` - View API Clients
- `integrations:api-clients:write` - Manage API Clients

**Compliance:**
- `compliance:dashboard` - Compliance Dashboard
- `compliance:frameworks:read` - View Frameworks
- `compliance:frameworks:write` - Manage Frameworks
- `compliance:audits:read` - View Compliance Audits
- `compliance:audits:write` - Manage Compliance Audits
- `compliance:legal-holds:read` - View Legal Holds
- `compliance:legal-holds:write` - Manage Legal Holds
- `compliance:data-retention:read` - View Data Retention
- `compliance:data-retention:write` - Manage Data Retention

**Identity:**
- `identity:domains:read` - View Domains
- `identity:domains:write` - Manage Domains
- `identity:sso:read` - View SSO Settings
- `identity:sso:write` - Manage SSO
- `identity:scim:read` - View SCIM Settings
- `identity:scim:write` - Manage SCIM
- `identity:devices:read` - View Devices
- `identity:devices:write` - Manage Devices

**Operations:**
- `operations:incidents:read` - View Incidents
- `operations:incidents:write` - Manage Incidents
- `operations:releases:read` - View Releases
- `operations:releases:write` - Manage Releases
- `operations:capacity:read` - View Capacity
- `operations:capacity:write` - Manage Capacity

**Super Access:**
- `super:*` - Super Admin Access (grants all permissions)

#### Tenant Permissions (TENANT scope)

**Agents:**
- `agents:list` - List Agents
- `agents:read` - View Agent Details
- `agents:create` - Create Agents
- `agents:update` - Update Agents
- `agents:delete` - Delete Agents
- `agents:execute` - Execute Agents
- `agents:publish` - Publish Agents

**Workflows:**
- `workflows:list` - List Workflows
- `workflows:read` - View Workflow Details
- `workflows:create` - Create Workflows
- `workflows:update` - Update Workflows
- `workflows:delete` - Delete Workflows
- `workflows:execute` - Execute Workflows
- `workflows:schedule` - Schedule Workflows

**Reports:**
- `reports:list` - List Reports
- `reports:read` - View Reports
- `reports:create` - Create Reports
- `reports:update` - Update Reports
- `reports:delete` - Delete Reports
- `reports:export` - Export Reports
- `reports:share` - Share Reports

**Dashboards:**
- `dashboards:list` - List Dashboards
- `dashboards:read` - View Dashboards
- `dashboards:create` - Create Dashboards
- `dashboards:update` - Update Dashboards
- `dashboards:delete` - Delete Dashboards
- `dashboards:share` - Share Dashboards

**Data Sources:**
- `datasources:list` - List Data Sources
- `datasources:read` - View Data Source Details
- `datasources:create` - Create Data Sources
- `datasources:update` - Update Data Sources
- `datasources:delete` - Delete Data Sources
- `datasources:sync` - Sync Data Sources

**Team:**
- `team:list` - List Team Members
- `team:read` - View Team Member Details
- `team:invite` - Invite Team Members
- `team:update` - Update Team Members
- `team:remove` - Remove Team Members
- `team:roles:assign` - Assign Roles

**Organization Settings:**
- `org:settings:read` - View Org Settings
- `org:settings:write` - Manage Org Settings
- `org:branding:read` - View Branding
- `org:branding:write` - Manage Branding
- `org:billing:read` - View Billing
- `org:billing:write` - Manage Billing
- `org:api-keys:read` - View API Keys
- `org:api-keys:write` - Manage API Keys
- `org:integrations:read` - View Integrations
- `org:integrations:write` - Manage Integrations
- `org:audit:read` - View Audit Logs

**Audiences:**
- `audiences:list` - List Audiences
- `audiences:read` - View Audiences
- `audiences:create` - Create Audiences
- `audiences:update` - Update Audiences
- `audiences:delete` - Delete Audiences

**Charts:**
- `charts:list` - List Charts
- `charts:read` - View Charts
- `charts:create` - Create Charts
- `charts:update` - Update Charts
- `charts:delete` - Delete Charts

**Brand Tracking:**
- `brand-tracking:list` - List Brand Tracking
- `brand-tracking:read` - View Brand Tracking
- `brand-tracking:create` - Create Brand Tracking
- `brand-tracking:update` - Update Brand Tracking
- `brand-tracking:delete` - Delete Brand Tracking

**Memory:**
- `memory:list` - List Memory
- `memory:read` - View Memory
- `memory:create` - Create Memory
- `memory:update` - Update Memory
- `memory:delete` - Delete Memory

**Hierarchy:**
- `hierarchy:read` - View Hierarchy
- `hierarchy:write` - Manage Hierarchy
- `hierarchy:relationships:read` - View Relationships
- `hierarchy:relationships:write` - Manage Relationships
- `hierarchy:sharing:read` - View Shared Resources
- `hierarchy:sharing:write` - Manage Sharing

**Admin Access:**
- `admin:*` - Organization Admin (grants all tenant permissions)

---

### B. Technology Stack

| Component | Technology |
|-----------|------------|
| Framework | Next.js 16 (App Router) |
| UI | React 19, shadcn/ui, Tailwind CSS |
| Database | PostgreSQL |
| ORM | Prisma |
| Authentication | NextAuth.js |
| State Management | React Server Components + Client state |
| API | Next.js Route Handlers |

---

*End of Document*
