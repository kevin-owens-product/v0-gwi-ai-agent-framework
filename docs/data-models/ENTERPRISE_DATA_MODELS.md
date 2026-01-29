# Enterprise Data Models

**Version:** 1.0  
**Last Updated:** January 2026  
**Status:** Production Ready

---

## Table of Contents

1. [Overview](#overview)
2. [Organization Hierarchy](#organization-hierarchy)
3. [Organization Relationships](#organization-relationships)
4. [Shared Resources](#shared-resources)
5. [Role Inheritance](#role-inheritance)
6. [SSO Configuration](#sso-configuration)
7. [Billing & Subscriptions](#billing--subscriptions)
8. [Audit & Compliance](#audit--compliance)
9. [User Management](#user-management)

---

## Overview

Enterprise data models support advanced multi-tenancy features including organization hierarchies, resource sharing, role inheritance, SSO, billing, and compliance tracking.

**Database:** PostgreSQL  
**ORM:** Prisma  
**Schema File:** `prisma/schema.prisma`

---

## Organization Hierarchy

### Hierarchy Fields

**Model:** `Organization`

| Field | Type | Description |
|-------|------|-------------|
| `orgType` | `OrganizationType` | Type of organization |
| `parentOrgId` | `String?` | Direct parent organization |
| `rootOrgId` | `String?` | Top-level organization |
| `hierarchyPath` | `String` | Materialized path (e.g., "/rootId/parentId/id/") |
| `hierarchyLevel` | `Int` | Depth in hierarchy (0 = root) |
| `maxChildDepth` | `Int` | Maximum allowed child depth |
| `displayOrder` | `Int` | Ordering among siblings |
| `hierarchySettings` | `Json` | Hierarchy-specific configurations |
| `inheritSettings` | `Boolean` | Whether to inherit parent settings |
| `allowChildOrgs` | `Boolean` | Whether this org can have children |

### Organization Types

**Enum:** `OrganizationType`

- `STANDARD` - Default individual organization
- `AGENCY` - Marketing/advertising agency managing clients
- `HOLDING_COMPANY` - Parent company owning multiple subsidiaries
- `SUBSIDIARY` - Company owned by a holding company
- `BRAND` - Individual brand entity
- `SUB_BRAND` - Sub-brand under a parent brand
- `DIVISION` - Business division within an enterprise
- `DEPARTMENT` - Department within a division or org
- `FRANCHISE` - Franchise organization
- `FRANCHISEE` - Individual franchise location
- `RESELLER` - Partner that resells to clients
- `CLIENT` - Client organization (managed by agency/reseller)
- `REGIONAL` - Regional entity (e.g., EMEA, APAC)
- `PORTFOLIO_COMPANY` - Company within a PE/VC portfolio

### Hierarchy Relationships

```typescript
// Self-referential relationships
parentOrg      Organization?  @relation("OrgHierarchy")
childOrgs      Organization[] @relation("OrgHierarchy")
rootOrg        Organization?  @relation("RootOrgRef")
descendantOrgs Organization[] @relation("RootOrgRef")
```

### Usage Example

```typescript
import { prisma } from '@/lib/db'

// Create child organization
const childOrg = await prisma.organization.create({
  data: {
    name: 'Subsidiary Corp',
    slug: 'subsidiary-corp',
    parentOrgId: parentOrgId,
    rootOrgId: rootOrgId,
    hierarchyPath: `/${rootOrgId}/${parentOrgId}/`,
    hierarchyLevel: 2,
    orgType: 'SUBSIDIARY',
    allowChildOrgs: false,
  },
})

// Query hierarchy
const orgWithChildren = await prisma.organization.findUnique({
  where: { id: orgId },
  include: {
    childOrgs: true,
    parentOrg: true,
    rootOrg: true,
  },
})
```

---

## Organization Relationships

**Model:** `OrgRelationship`  
**Purpose:** Cross-organization relationships (partnerships, management, etc.)

### Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | `String` | Unique identifier (CUID) |
| `fromOrgId` | `String` | Organization initiating relationship |
| `toOrgId` | `String` | Organization being related to |
| `relationshipType` | `OrgRelationshipType` | Type of relationship |
| `status` | `RelationshipStatus` | Status (PENDING, ACTIVE, SUSPENDED, TERMINATED) |
| `permissions` | `Json` | Granular permissions |
| `accessLevel` | `ResourceSharingScope` | Access level (NONE, READ_ONLY, FULL_ACCESS, INHERIT) |
| `billingRelation` | `BillingRelationship` | Billing relationship type |
| `billingConfig` | `Json` | Billing configuration |
| `contractStart` | `DateTime?` | Contract start date |
| `contractEnd` | `DateTime?` | Contract end date |
| `notes` | `String?` | Relationship notes |
| `metadata` | `Json` | Additional metadata |
| `initiatedBy` | `String` | User who created relationship |
| `approvedBy` | `String?` | User who approved |
| `approvedAt` | `DateTime?` | Approval timestamp |
| `createdAt` | `DateTime` | Creation timestamp |
| `updatedAt` | `DateTime` | Last update timestamp |

### Relationship Types

**Enum:** `OrgRelationshipType`

- `OWNERSHIP` - Full ownership (holding company → subsidiary)
- `MANAGEMENT` - Management access (agency → client)
- `PARTNERSHIP` - Partnership/collaboration
- `LICENSING` - Licensing agreement (franchisor → franchisee)
- `RESELLER` - Reseller relationship
- `WHITE_LABEL` - White-label partnership
- `DATA_SHARING` - Data sharing agreement only
- `CONSORTIUM` - Part of a consortium/group

### Billing Relationships

**Enum:** `BillingRelationship`

- `INDEPENDENT` - Each org handles own billing
- `PARENT_PAYS` - Parent pays for child
- `CONSOLIDATED` - Consolidated billing across hierarchy
- `PASS_THROUGH` - Parent bills but passes costs through
- `SUBSIDIZED` - Parent partially subsidizes

### Usage Example

```typescript
import { prisma } from '@/lib/db'

// Create relationship
const relationship = await prisma.orgRelationship.create({
  data: {
    fromOrgId: 'agency_123',
    toOrgId: 'client_456',
    relationshipType: 'MANAGEMENT',
    status: 'ACTIVE',
    accessLevel: 'FULL_ACCESS',
    billingRelation: 'PARENT_PAYS',
    initiatedBy: 'user_123',
    approvedBy: 'user_456',
    approvedAt: new Date(),
  },
})
```

---

## Shared Resources

**Model:** `SharedResourceAccess`  
**Purpose:** Cross-organization resource sharing

### Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | `String` | Unique identifier (CUID) |
| `ownerOrgId` | `String` | Organization that owns the resource |
| `targetOrgId` | `String` | Organization granted access |
| `resourceType` | `SharedResourceType` | Type of resource |
| `resourceId` | `String?` | Specific resource ID (null = all of type) |
| `accessLevel` | `ResourceSharingScope` | Access level |
| `canView` | `Boolean` | Can view resource |
| `canEdit` | `Boolean` | Can edit resource |
| `canDelete` | `Boolean` | Can delete resource |
| `canShare` | `Boolean` | Can re-share with others |
| `propagateToChildren` | `Boolean` | Share with target's children too |
| `expiresAt` | `DateTime?` | Expiration timestamp |
| `isActive` | `Boolean` | Active status |
| `grantedBy` | `String` | User who granted access |
| `createdAt` | `DateTime` | Creation timestamp |
| `updatedAt` | `DateTime` | Last update timestamp |

### Resource Types

**Enum:** `SharedResourceType`

- `TEMPLATE` - Report/dashboard templates
- `AUDIENCE` - Audience definitions
- `DATA_SOURCE` - Data source configurations
- `BRAND_TRACKING` - Brand tracking setups
- `WORKFLOW` - Workflow configurations
- `AGENT` - AI agent configurations

### Usage Example

```typescript
import { prisma } from '@/lib/db'

// Share resource
const share = await prisma.sharedResourceAccess.create({
  data: {
    ownerOrgId: 'parent_org',
    targetOrgId: 'child_org',
    resourceType: 'TEMPLATE',
    resourceId: 'template_123',
    accessLevel: 'READ_ONLY',
    canView: true,
    canEdit: false,
    canDelete: false,
    canShare: false,
    propagateToChildren: true,
    grantedBy: 'user_123',
  },
})
```

---

## Role Inheritance

**Model:** `RoleInheritanceRule`  
**Purpose:** Define role inheritance across organization hierarchy

### Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | `String` | Unique identifier (CUID) |
| `orgId` | `String` | Organization where rule applies |
| `name` | `String` | Rule name |
| `description` | `String?` | Rule description |
| `sourceRole` | `Role` | Source role (in parent org) |
| `sourceOrgType` | `OrganizationType?` | Optional: only apply for certain org types |
| `targetRole` | `Role` | Target role (in this/child org) |
| `inheritUp` | `Boolean` | Role inherits upward to parent |
| `inheritDown` | `Boolean` | Role inherits downward to children |
| `inheritLevels` | `Int` | How many levels to inherit (-1 = unlimited) |
| `requiresApproval` | `Boolean` | Requires approval |
| `conditions` | `Json` | Additional conditions |
| `isActive` | `Boolean` | Active status |
| `priority` | `Int` | Priority (higher = evaluated first) |
| `createdBy` | `String` | Creator user ID |
| `createdAt` | `DateTime` | Creation timestamp |
| `updatedAt` | `DateTime` | Last update timestamp |

### Usage Example

```typescript
import { prisma } from '@/lib/db'

// Create inheritance rule
const rule = await prisma.roleInheritanceRule.create({
  data: {
    orgId: 'org_123',
    name: 'Admin inherits to children',
    sourceRole: 'ADMIN',
    targetRole: 'ADMIN',
    inheritDown: true,
    inheritLevels: 2,
    isActive: true,
    priority: 10,
    createdBy: 'user_123',
  },
})
```

---

## SSO Configuration

**Model:** `SSOConfiguration`  
**Purpose:** Single Sign-On configuration for organizations

### Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | `String` | Unique identifier (CUID) |
| `orgId` | `String` | Organization ID (unique) |
| `provider` | `String` | Provider ('saml' \| 'oidc' \| 'azure_ad') |
| `metadataUrl` | `String?` | Metadata URL |
| `clientId` | `String?` | OAuth client ID |
| `clientSecret` | `String?` | OAuth client secret (encrypted) |
| `settings` | `Json` | Additional settings |
| `enabled` | `Boolean` | Enabled status |

### Usage Example

```typescript
import { prisma } from '@/lib/db'

// Configure SSO
const sso = await prisma.sSOConfiguration.upsert({
  where: { orgId: 'org_123' },
  create: {
    orgId: 'org_123',
    provider: 'azure_ad',
    clientId: 'client_id_123',
    clientSecret: 'encrypted_secret',
    settings: {
      tenantId: 'tenant_123',
      scopes: ['openid', 'profile', 'email'],
    },
    enabled: true,
  },
  update: {
    enabled: true,
  },
})
```

---

## Billing & Subscriptions

**Model:** `BillingSubscription`  
**Purpose:** Stripe subscription management

### Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | `String` | Unique identifier (CUID) |
| `orgId` | `String` | Organization ID (unique) |
| `stripeCustomerId` | `String?` | Stripe customer ID |
| `stripeSubscriptionId` | `String?` | Stripe subscription ID |
| `planId` | `String` | Plan identifier |
| `status` | `SubscriptionStatus` | Subscription status |
| `currentPeriodEnd` | `DateTime?` | Current period end date |
| `cancelAtPeriodEnd` | `Boolean` | Cancel at period end |
| `createdAt` | `DateTime` | Creation timestamp |
| `updatedAt` | `DateTime` | Last update timestamp |

### Subscription Status

**Enum:** `SubscriptionStatus`

- `TRIALING` - In trial period
- `ACTIVE` - Active subscription
- `PAST_DUE` - Payment past due
- `CANCELED` - Canceled subscription
- `UNPAID` - Unpaid subscription

### Usage Record

**Model:** `UsageRecord`  
**Purpose:** Track usage metrics for billing

### Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | `String` | Unique identifier (CUID) |
| `orgId` | `String` | Organization ID |
| `metricType` | `UsageMetric` | Metric type |
| `quantity` | `Int` | Quantity |
| `recordedAt` | `DateTime` | Recording timestamp |

### Usage Metrics

**Enum:** `UsageMetric`

- `AGENT_RUNS` - Number of agent executions
- `TOKENS_CONSUMED` - LLM tokens consumed
- `API_CALLS` - API calls made
- `DATA_SOURCES` - Data sources connected
- `TEAM_SEATS` - Team member count
- `STORAGE_GB` - Storage used (GB)

### Usage Example

```typescript
import { prisma } from '@/lib/db'

// Record usage
await prisma.usageRecord.create({
  data: {
    orgId: 'org_123',
    metricType: 'AGENT_RUNS',
    quantity: 1,
    recordedAt: new Date(),
  },
})

// Get subscription
const subscription = await prisma.billingSubscription.findUnique({
  where: { orgId: 'org_123' },
})
```

---

## Audit & Compliance

### Audit Log

**Model:** `AuditLog`  
**Purpose:** Track all actions for compliance

### Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | `String` | Unique identifier (CUID) |
| `orgId` | `String` | Organization ID |
| `userId` | `String?` | User ID (null for system actions) |
| `action` | `String` | Action type |
| `resourceType` | `String` | Resource type |
| `resourceId` | `String?` | Resource ID |
| `metadata` | `Json` | Additional metadata |
| `ipAddress` | `String?` | IP address |
| `userAgent` | `String?` | User agent |
| `timestamp` | `DateTime` | Action timestamp |

### Hierarchy Audit Log

**Model:** `HierarchyAuditLog`  
**Purpose:** Track hierarchy-specific actions

### Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | `String` | Unique identifier (CUID) |
| `orgId` | `String` | Organization affected |
| `actorOrgId` | `String?` | Organization of the actor |
| `actorUserId` | `String` | User ID of actor |
| `action` | `HierarchyAction` | Action type |
| `targetOrgId` | `String?` | Target org for relationship actions |
| `previousState` | `Json?` | State before change |
| `newState` | `Json?` | State after change |
| `metadata` | `Json` | Additional metadata |
| `ipAddress` | `String?` | IP address |
| `userAgent` | `String?` | User agent |
| `timestamp` | `DateTime` | Action timestamp |

### Hierarchy Actions

**Enum:** `HierarchyAction`

- `ORG_CREATED` - Organization created
- `ORG_MOVED` - Changed parent
- `ORG_TYPE_CHANGED` - Organization type changed
- `RELATIONSHIP_CREATED` - Relationship created
- `RELATIONSHIP_UPDATED` - Relationship updated
- `RELATIONSHIP_TERMINATED` - Relationship terminated

### Usage Example

```typescript
import { prisma } from '@/lib/db'

// Log action
await prisma.auditLog.create({
  data: {
    orgId: 'org_123',
    userId: 'user_123',
    action: 'agent.created',
    resourceType: 'agent',
    resourceId: 'agent_123',
    metadata: { name: 'Research Agent' },
    ipAddress: '192.168.1.1',
    userAgent: 'Mozilla/5.0...',
  },
})
```

---

## User Management

### User Ban

**Model:** `UserBan`  
**Purpose:** Ban users from platform or organization

### Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | `String` | Unique identifier (CUID) |
| `userId` | `String` | User ID |
| `orgId` | `String?` | Organization ID (null = platform-wide) |
| `reason` | `String` | Ban reason |
| `bannedBy` | `String` | Super admin ID |
| `banType` | `BanType` | Ban type |
| `expiresAt` | `DateTime?` | Expiration (null for permanent) |
| `appealStatus` | `AppealStatus` | Appeal status |
| `appealNotes` | `String?` | Appeal notes |
| `metadata` | `Json` | Additional metadata |
| `createdAt` | `DateTime` | Creation timestamp |
| `updatedAt` | `DateTime` | Last update timestamp |

### Ban Types

**Enum:** `BanType`

- `TEMPORARY` - Temporary ban
- `PERMANENT` - Permanent ban
- `SHADOW` - User can access but actions are limited

### Organization Suspension

**Model:** `OrganizationSuspension`  
**Purpose:** Suspend organizations

### Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | `String` | Unique identifier (CUID) |
| `orgId` | `String` | Organization ID |
| `reason` | `String` | Suspension reason |
| `suspendedBy` | `String` | Super admin ID |
| `suspensionType` | `SuspensionType` | Suspension type |
| `expiresAt` | `DateTime?` | Expiration (null for indefinite) |
| `isActive` | `Boolean` | Active status |
| `notes` | `String?` | Additional notes |
| `createdAt` | `DateTime` | Creation timestamp |
| `updatedAt` | `DateTime` | Last update timestamp |

### Suspension Types

**Enum:** `SuspensionType`

- `FULL` - Complete suspension (no access)
- `PARTIAL` - Limited functionality
- `BILLING_HOLD` - Suspended due to billing issues
- `INVESTIGATION` - Under investigation

### Usage Example

```typescript
import { prisma } from '@/lib/db'

// Ban user
await prisma.userBan.create({
  data: {
    userId: 'user_123',
    orgId: 'org_123',
    reason: 'Violation of terms',
    bannedBy: 'admin_123',
    banType: 'TEMPORARY',
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
  },
})

// Suspend organization
await prisma.organizationSuspension.create({
  data: {
    orgId: 'org_123',
    reason: 'Billing issue',
    suspendedBy: 'admin_123',
    suspensionType: 'BILLING_HOLD',
    isActive: true,
  },
})
```

---

## Best Practices

### 1. Hierarchy Queries

```typescript
// Use materialized path for efficient queries
const descendants = await prisma.organization.findMany({
  where: {
    hierarchyPath: { startsWith: `/${rootOrgId}/` },
  },
})
```

### 2. Relationship Management

```typescript
// Always check relationship status
const relationship = await prisma.orgRelationship.findFirst({
  where: {
    fromOrgId: 'org_1',
    toOrgId: 'org_2',
    status: 'ACTIVE',
  },
})
```

### 3. Audit Logging

```typescript
// Log all critical actions
await prisma.auditLog.create({
  data: {
    orgId,
    userId,
    action: 'resource.deleted',
    resourceType: 'agent',
    resourceId: agentId,
    metadata: { name: agentName },
  },
})
```

### 4. Resource Sharing

```typescript
// Check access before sharing
const hasAccess = await prisma.sharedResourceAccess.findFirst({
  where: {
    ownerOrgId: resourceOrgId,
    targetOrgId: requestingOrgId,
    resourceType: 'TEMPLATE',
    resourceId: templateId,
    isActive: true,
  },
})
```

---

## Related Documentation

- [Core Data Models](./CORE_DATA_MODELS.md) - Organization, User, Agent models
- [GWI Data Models](./GWI_DATA_MODELS.md) - GWI-specific models
- [Security Architecture](../security/SECURITY_ARCHITECTURE.md) - Security patterns
- [Compliance](../security/COMPLIANCE.md) - Compliance requirements

---

**Last Updated:** January 2026  
**Maintained By:** Engineering Team
