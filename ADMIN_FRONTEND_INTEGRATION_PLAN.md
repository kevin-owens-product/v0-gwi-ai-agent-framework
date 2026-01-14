# Admin Portal to User Frontend Integration Plan

## Executive Summary

This document outlines the comprehensive plan to integrate advanced admin portal features into the user-facing frontend, enabling self-service capabilities while maintaining security and multi-tenancy boundaries.

---

## Current State Analysis

### Admin Portal Features (Platform-Level)
- 30+ admin-only pages for platform management
- Comprehensive security, compliance, and operations tools
- Tenant health monitoring and analytics
- Complete plan and entitlement management
- Advanced identity and access management

### User Dashboard Features (Organization-Level)
- Core GWI features (audiences, brand tracking, charts, crosstabs)
- Agent and workflow builders
- Basic settings and API key management
- Limited team management
- No plan/billing visibility
- No security policy management
- No resource sharing capabilities

### Gap Analysis
**Missing critical user-facing features:**
1. ✗ Plan visibility and upgrade flows
2. ✗ Feature limit indicators and usage meters
3. ✗ Self-service security configuration
4. ✗ Organization hierarchy management
5. ✗ Advanced team and access management
6. ✗ Webhook and integration management
7. ✗ Comprehensive audit log viewing
8. ✗ Data export requests (GDPR compliance)
9. ✗ SSO configuration for organizations
10. ✗ Domain verification for enterprises

---

## Integration Architecture

### Security Principles

1. **Separation of Concerns**
   - Admin portal: Platform management (SuperAdmin)
   - User dashboard: Organization management (OrganizationMember)
   - Clear permission boundaries

2. **Role-Based Access Control**
   - OWNER: Full organization control
   - ADMIN: Most management capabilities
   - MEMBER: Standard feature access
   - VIEWER: Read-only access

3. **Multi-Tenancy Enforcement**
   - All user APIs scoped to current organization
   - Hierarchy respects parent-child relationships
   - Resource sharing requires explicit permissions

### API Strategy

**Existing APIs to Leverage:**
- `/api/v1/*` - User-scoped endpoints (already multi-tenant)
- `/api/admin/*` - Platform-level (admin only, reference for patterns)

**New APIs Needed:**
- `/api/v1/organization/plan` - Current plan and limits
- `/api/v1/organization/billing` - Billing management
- `/api/v1/organization/security` - Security settings
- `/api/v1/organization/team` - Enhanced team management
- `/api/v1/organization/webhooks` - Webhook management
- `/api/v1/organization/sso` - SSO configuration
- `/api/v1/organization/domains` - Domain verification
- `/api/v1/organization/exports` - Data export requests
- `/api/v1/organization/children` - Child organization management

---

## Integration Phases

## Phase 1: Plans, Billing & Feature Limits (Foundation)

**Priority**: CRITICAL - Users need visibility into what they're paying for

### 1.1 Plan & Subscription Visibility

**New Pages:**
- `/dashboard/settings/plan` - Current plan overview
- `/dashboard/settings/billing` - Billing and invoices

**Components:**
- `PlanCard` - Display plan details and features
- `PlanComparison` - Compare available plans
- `FeatureLimitIndicator` - Show usage vs limits
- `UsageMeter` - Visual usage indicators
- `UpgradePrompt` - CTAs for plan upgrades

**Features:**
- Display current plan tier (STARTER, PROFESSIONAL, ENTERPRISE)
- Show included features and limits
- Real-time usage metrics against limits
- Feature availability badges throughout app
- Plan comparison table
- Upgrade/downgrade request flow
- Billing history and invoices (Stripe integration)
- Payment method management

**API Endpoints:**
```typescript
GET  /api/v1/organization/plan              // Current plan details
GET  /api/v1/organization/features          // Feature entitlements
GET  /api/v1/organization/usage             // Current usage metrics
POST /api/v1/organization/plan/upgrade      // Request upgrade
GET  /api/v1/organization/billing/invoices  // Billing history
PUT  /api/v1/organization/billing/payment   // Update payment method
```

**Data Required:**
- Plan limits (from Plan.limits JSON)
- Current usage counts (UsageRecord)
- Feature entitlements (TenantEntitlement + PlanFeature)
- Billing subscription (BillingSubscription)

**User Experience:**
- Plan badge in navigation
- Usage warnings at 80% of limit
- Soft blocks with upgrade prompts when limit reached
- Inline feature badges: "Pro Feature" / "Enterprise Only"

### 1.2 Feature Gate System

**Components:**
- `FeatureGate` - Wrap features requiring specific plan
- `useFeatureAccess` - Hook to check feature availability
- `useUsageLimit` - Hook to check usage limits

**Implementation:**
```typescript
// Example usage
<FeatureGate feature="ADVANCED_ANALYTICS" fallback={<UpgradePrompt />}>
  <AdvancedAnalytics />
</FeatureGate>

// Hook usage
const { hasAccess, limit, usage } = useFeatureAccess('API_REQUESTS')
if (usage >= limit) {
  // Show upgrade prompt
}
```

**Integration Points:**
- Wrap premium features across entire app
- Add badges to navigation items
- Show limits in tooltips
- Display usage in relevant pages

---

## Phase 2: Enhanced Team & Access Management

**Priority**: HIGH - Organizations need better team control

### 2.1 Advanced Team Management

**Enhanced Pages:**
- `/dashboard/settings/team` - Enhanced team listing
- `/dashboard/settings/team/invitations` - Invitation management
- `/dashboard/settings/team/roles` - Role configuration

**New Components:**
- `TeamMemberTable` - Enhanced member listing
- `InviteTeamMemberDialog` - Multi-invite support
- `RolePermissionMatrix` - Visual role permissions
- `MemberActivityTimeline` - Activity tracking
- `BulkMemberActions` - Bulk operations

**Features:**
- Invite multiple users at once
- Set role during invitation
- Pending invitation management
- Resend/cancel invitations
- Member activity history
- Last active tracking
- Bulk role changes
- Member search and filtering
- Export member list

**API Endpoints:**
```typescript
GET    /api/v1/organization/team                    // Enhanced team list
POST   /api/v1/organization/team/invite             // Invite members
DELETE /api/v1/organization/team/invitations/[id]   // Cancel invitation
POST   /api/v1/organization/team/invitations/[id]/resend  // Resend
PUT    /api/v1/organization/team/members/[id]/role  // Change role
DELETE /api/v1/organization/team/members/[id]       // Remove member
POST   /api/v1/organization/team/bulk               // Bulk operations
```

### 2.2 Role-Based Permissions UI

**Components:**
- `PermissionGuard` - Component-level permission check
- `usePermission` - Permission checking hook

**Features:**
- Visual permission matrix
- Role comparison
- Custom role creation (Enterprise only)
- Permission inheritance visualization

---

## Phase 3: Security & Compliance (Enterprise Features)

**Priority**: HIGH - Required for enterprise customers

### 3.1 SSO Configuration

**New Pages:**
- `/dashboard/settings/security/sso` - SSO configuration

**Components:**
- `SSOProviderSelector` - Choose provider (SAML, OIDC, Azure AD, Okta)
- `SSOConfigurationForm` - Provider-specific config
- `SSOTestConnection` - Test SSO setup
- `SSOEnforcementToggle` - Enforce SSO login

**Features:**
- Configure SAML 2.0
- Configure OpenID Connect
- Pre-configured templates for Azure AD, Okta, Google Workspace
- Test connection before enabling
- SSO enforcement option
- Multiple provider support
- Metadata upload/download
- Certificate management

**API Endpoints:**
```typescript
GET    /api/v1/organization/sso              // List SSO configs
POST   /api/v1/organization/sso              // Create SSO config
GET    /api/v1/organization/sso/[id]         // Get config
PUT    /api/v1/organization/sso/[id]         // Update config
DELETE /api/v1/organization/sso/[id]         // Delete config
POST   /api/v1/organization/sso/[id]/test    // Test connection
PUT    /api/v1/organization/sso/[id]/enforce // Toggle enforcement
```

**User Experience:**
- Step-by-step wizard
- Provider-specific instructions
- Real-time validation
- Test before enforcement
- Fallback options for emergencies

### 3.2 Domain Verification

**New Pages:**
- `/dashboard/settings/security/domains` - Domain management

**Components:**
- `DomainVerificationForm` - Add domain
- `DomainVerificationStatus` - Status indicator
- `DNSRecordDisplay` - Show DNS records to add

**Features:**
- Add custom domains
- DNS verification (TXT record)
- Email domain enforcement
- Auto-invite users from verified domains
- Domain-based access control

**API Endpoints:**
```typescript
GET    /api/v1/organization/domains           // List domains
POST   /api/v1/organization/domains           // Add domain
GET    /api/v1/organization/domains/[id]      // Get domain
DELETE /api/v1/organization/domains/[id]      // Remove domain
POST   /api/v1/organization/domains/[id]/verify  // Trigger verification
```

### 3.3 Audit Log Viewer

**New Pages:**
- `/dashboard/settings/security/audit` - Enhanced audit log

**Components:**
- `AuditLogTable` - Filterable audit log
- `AuditEventDetails` - Event detail modal
- `AuditLogExport` - Export functionality
- `AuditLogFilters` - Advanced filtering

**Features:**
- Filter by user, action, resource, date
- Event type categorization
- Search audit logs
- Export to CSV
- IP address tracking
- Diff view for changes
- Retention period indicator

**API Enhancement:**
```typescript
GET /api/v1/audit-logs  // Enhanced with filtering, pagination, export
```

### 3.4 Data Export Requests (GDPR)

**New Pages:**
- `/dashboard/settings/compliance/exports` - Data export requests

**Components:**
- `DataExportRequestForm` - Request data export
- `DataExportStatus` - Export status tracker
- `DataExportDownload` - Download completed exports

**Features:**
- Request all organization data
- Request user-specific data
- Export format selection (JSON, CSV)
- Status tracking (PENDING, PROCESSING, COMPLETED)
- Download link (expires after 7 days)
- Email notification when ready

**API Endpoints:**
```typescript
GET    /api/v1/organization/exports        // List export requests
POST   /api/v1/organization/exports        // Create export request
GET    /api/v1/organization/exports/[id]   // Get export status
GET    /api/v1/organization/exports/[id]/download  // Download
```

### 3.5 Security Settings

**New Pages:**
- `/dashboard/settings/security` - Security overview and settings

**Components:**
- `PasswordPolicySettings` - Password requirements
- `SessionSettings` - Session timeout configuration
- `MFASettings` - MFA enforcement
- `IPAllowlistSettings` - IP-based access control

**Features (Role: OWNER/ADMIN only):**
- Password policy configuration
  - Minimum length
  - Complexity requirements
  - Expiration period
  - History (prevent reuse)
- Session management
  - Session timeout
  - Concurrent session limit
  - Idle timeout
- MFA enforcement
  - Require for all users
  - Require for admins only
  - Grace period
- IP allowlist
  - Restrict access to specific IPs
  - CIDR notation support
  - Bypass for specific users

**API Endpoints:**
```typescript
GET /api/v1/organization/security/policies     // Get all policies
PUT /api/v1/organization/security/policies     // Update policies
GET /api/v1/organization/security/ip-allowlist // Get IP allowlist
POST /api/v1/organization/security/ip-allowlist // Add IP range
DELETE /api/v1/organization/security/ip-allowlist/[id] // Remove
```

---

## Phase 4: Webhooks & Integration Management

**Priority**: MEDIUM - Needed for automation and integrations

### 4.1 Webhook Management

**New Pages:**
- `/dashboard/settings/webhooks` - Webhook endpoints

**Components:**
- `WebhookEndpointList` - List endpoints
- `WebhookCreateForm` - Create webhook
- `WebhookTestTool` - Test endpoint
- `WebhookDeliveryLog` - Delivery history
- `WebhookSigningSecret` - Security keys

**Features:**
- Create webhook endpoints
- Subscribe to event types (agent.completed, workflow.failed, etc.)
- Secret key generation
- Signature verification instructions
- Test webhook delivery
- Delivery history and retry
- Webhook health status
- Disable/enable endpoints

**API Endpoints:**
```typescript
GET    /api/v1/webhooks              // List webhooks
POST   /api/v1/webhooks              // Create webhook
GET    /api/v1/webhooks/[id]         // Get webhook
PUT    /api/v1/webhooks/[id]         // Update webhook
DELETE /api/v1/webhooks/[id]         // Delete webhook
POST   /api/v1/webhooks/[id]/test    // Test webhook
GET    /api/v1/webhooks/[id]/deliveries  // Delivery log
POST   /api/v1/webhooks/[id]/rotate-secret  // Rotate secret
```

**Webhook Events:**
- `agent.run.started`
- `agent.run.completed`
- `agent.run.failed`
- `workflow.run.started`
- `workflow.run.completed`
- `workflow.run.failed`
- `report.generated`
- `insight.created`
- `user.invited`
- `member.added`
- `member.removed`

### 4.2 Integration Marketplace

**New Pages:**
- `/dashboard/integrations/marketplace` - Browse integrations
- `/dashboard/integrations/installed` - Installed integrations

**Components:**
- `IntegrationCard` - Integration preview
- `IntegrationDetails` - Full integration info
- `IntegrationInstallFlow` - OAuth installation
- `IntegrationSettings` - Per-integration config

**Features:**
- Browse available integrations
- OAuth installation flow
- Integration permissions review
- Configuration management
- Usage tracking per integration
- Uninstall capability

**API Endpoints:**
```typescript
GET    /api/v1/integrations/marketplace       // Browse available
GET    /api/v1/integrations/installed         // Installed apps
POST   /api/v1/integrations/install           // Install app
DELETE /api/v1/integrations/[id]              // Uninstall
GET    /api/v1/integrations/[id]/settings     // Get settings
PUT    /api/v1/integrations/[id]/settings     // Update settings
```

---

## Phase 5: Organization Hierarchy & Resource Sharing

**Priority**: MEDIUM - Important for enterprise multi-org setups

### 5.1 Organization Hierarchy Viewer

**New Pages:**
- `/dashboard/organization/hierarchy` - Organization tree
- `/dashboard/organization/children` - Child organizations

**Components:**
- `OrganizationTreeView` - Interactive hierarchy tree
- `OrganizationCard` - Organization details card
- `CreateChildOrgDialog` - Create sub-organization
- `OrgRelationshipGraph` - Visual relationship map

**Features:**
- View organization hierarchy
- See parent organization (if applicable)
- List child organizations
- Create child organizations (if plan allows)
- Move between organizations (if member of multiple)
- Organization switcher in navigation

**API Endpoints:**
```typescript
GET  /api/v1/organization/hierarchy         // Full hierarchy tree
GET  /api/v1/organization/children          // Child orgs
POST /api/v1/organization/children          // Create child org
GET  /api/v1/organization/parent            // Parent org
POST /api/v1/organization/move              // Move org in hierarchy
```

### 5.2 Resource Sharing

**New Pages:**
- `/dashboard/organization/sharing` - Shared resources

**Components:**
- `SharedResourceList` - Resources shared with/by this org
- `ShareResourceDialog` - Share a resource
- `SharedAccessPermissions` - Permission levels
- `CrossOrgInvitation` - Invite from another org

**Features:**
- Share agents with other organizations
- Share workflows across hierarchy
- Share templates
- Share audiences
- Permission levels (VIEW, EDIT, ADMIN)
- Revoke access
- Accept/decline shared resources

**API Endpoints:**
```typescript
GET    /api/v1/organization/sharing                    // Shared resources
POST   /api/v1/organization/sharing                    // Share resource
DELETE /api/v1/organization/sharing/[id]               // Revoke access
PUT    /api/v1/organization/sharing/[id]/permissions   // Update permissions
GET    /api/v1/organization/sharing/invitations        // Cross-org invites
POST   /api/v1/organization/sharing/invitations/[id]/accept  // Accept
POST   /api/v1/organization/sharing/invitations/[id]/decline // Decline
```

### 5.3 Organization Switcher

**Component:**
- `OrganizationSwitcher` - Dropdown to switch between orgs

**Features:**
- List all organizations user is member of
- Quick switch between orgs
- Show current organization
- Display role in each org
- Recently viewed organizations

**Implementation:**
- Update session to track current organization
- Middleware to set organization context
- All queries scoped to current organization

---

## Phase 6: Enhanced Analytics & Insights

**Priority**: MEDIUM - Valuable for understanding usage

### 6.1 Organization Analytics Dashboard

**Enhanced Pages:**
- `/dashboard/analytics` - Comprehensive analytics

**New Components:**
- `UsageAnalytics` - Detailed usage breakdown
- `CostAnalytics` - Cost tracking and forecasting
- `TeamActivityAnalytics` - Team usage patterns
- `FeatureUsageChart` - Feature adoption metrics
- `APIUsageChart` - API consumption trends

**Features:**
- Total usage metrics (agents, workflows, API calls)
- Usage by team member
- Usage trends over time
- Cost per feature (if applicable)
- Projected costs based on trends
- Export analytics data
- Custom date ranges
- Usage by feature/tool

**API Endpoints:**
```typescript
GET /api/v1/analytics/usage              // Usage metrics
GET /api/v1/analytics/costs              // Cost breakdown
GET /api/v1/analytics/team-activity      // Team analytics
GET /api/v1/analytics/feature-adoption   // Feature usage
GET /api/v1/analytics/api-usage          // API consumption
```

### 6.2 Organization Health Score

**Component:**
- `OrganizationHealthCard` - Health score indicator

**Features:**
- Health score (0-100)
- Contributing factors:
  - Activity level
  - Feature adoption
  - Team engagement
  - Integration usage
- Recommendations for improvement
- Trend over time

**API Endpoint:**
```typescript
GET /api/v1/organization/health  // Health score and recommendations
```

---

## Phase 7: Advanced Communication & Support

**Priority**: LOW - Nice to have

### 7.1 In-App Announcements

**Component:**
- `AnnouncementBanner` - Platform announcements
- `WhatsNewPanel` - What's new panel

**Features:**
- Display broadcast messages from admin
- Dismissible announcements
- Priority levels (info, warning, critical)
- Targeted announcements by plan tier
- Release notes viewer

**API Endpoints:**
```typescript
GET /api/v1/announcements        // Active announcements
PUT /api/v1/announcements/[id]/dismiss  // Dismiss
GET /api/v1/whats-new            // Recent updates
```

### 7.2 Support Ticket System

**New Pages:**
- `/dashboard/support/tickets` - Support tickets

**Components:**
- `SupportTicketList` - List tickets
- `CreateTicketForm` - Create ticket
- `TicketDetailView` - Ticket conversation
- `TicketPriorityBadge` - Priority indicator

**Features:**
- Create support tickets
- Categorize by type (bug, feature request, question)
- Priority selection
- Attach files
- Ticket conversation thread
- Status tracking (OPEN, IN_PROGRESS, RESOLVED, CLOSED)
- Email notifications

**API Endpoints:**
```typescript
GET    /api/v1/support/tickets          // List tickets
POST   /api/v1/support/tickets          // Create ticket
GET    /api/v1/support/tickets/[id]     // Get ticket
POST   /api/v1/support/tickets/[id]/reply  // Reply to ticket
PUT    /api/v1/support/tickets/[id]/close  // Close ticket
```

---

## Technical Implementation Details

### Component Architecture

**Shared Component Library:**
```
/components
  /ui                    # Base UI components (shadcn/ui)
  /dashboard             # Dashboard-specific components
  /settings              # Settings page components
  /organization          # Organization management
  /billing               # Billing and plan components
  /security              # Security components
  /team                  # Team management
  /webhooks              # Webhook components
  /integrations          # Integration components
  /analytics             # Analytics components
```

### API Middleware & Utilities

**Organization Context Middleware:**
```typescript
// /lib/api/withOrganization.ts
export function withOrganization(handler) {
  return async (req, res) => {
    const session = await getServerSession(req, res, authOptions)
    const orgId = req.headers['x-organization-id'] || session.user.defaultOrgId

    const member = await prisma.organizationMember.findFirst({
      where: { userId: session.user.id, organizationId: orgId }
    })

    if (!member) return res.status(403).json({ error: 'Not a member' })

    req.organization = { id: orgId, role: member.role }
    return handler(req, res)
  }
}
```

**Permission Checking:**
```typescript
// /lib/permissions.ts
const PERMISSIONS = {
  'manage:team': ['OWNER', 'ADMIN'],
  'manage:billing': ['OWNER'],
  'manage:security': ['OWNER', 'ADMIN'],
  'manage:webhooks': ['OWNER', 'ADMIN'],
  'view:analytics': ['OWNER', 'ADMIN', 'MEMBER'],
  'manage:integrations': ['OWNER', 'ADMIN'],
}

export function hasPermission(role: Role, permission: string): boolean {
  return PERMISSIONS[permission]?.includes(role) ?? false
}
```

**Feature Access Checking:**
```typescript
// /lib/features.ts
export async function checkFeatureAccess(
  orgId: string,
  featureKey: string
): Promise<{ hasAccess: boolean; limit?: number; usage?: number }> {
  const org = await prisma.organization.findUnique({
    where: { id: orgId },
    include: {
      plan: {
        include: {
          planFeatures: {
            where: { feature: { key: featureKey } },
            include: { feature: true }
          }
        }
      },
      entitlements: {
        where: {
          feature: { key: featureKey },
          OR: [
            { expiresAt: null },
            { expiresAt: { gt: new Date() } }
          ]
        }
      }
    }
  })

  // Check entitlement override first
  const entitlement = org.entitlements[0]
  if (entitlement) {
    return {
      hasAccess: entitlement.value === true || entitlement.value === 'true',
      limit: entitlement.limit
    }
  }

  // Check plan feature
  const planFeature = org.plan.planFeatures[0]
  if (planFeature) {
    const usage = await getFeatureUsage(orgId, featureKey)
    return {
      hasAccess: true,
      limit: planFeature.limit,
      usage
    }
  }

  return { hasAccess: false }
}
```

### React Hooks

**useFeatureAccess:**
```typescript
export function useFeatureAccess(featureKey: string) {
  const { data, isLoading } = useSWR(
    `/api/v1/organization/features/${featureKey}`,
    fetcher
  )

  return {
    hasAccess: data?.hasAccess ?? false,
    limit: data?.limit,
    usage: data?.usage,
    isLoading,
    percentage: data?.limit ? (data.usage / data.limit) * 100 : 0,
    isNearLimit: data?.limit ? data.usage >= data.limit * 0.8 : false,
    isAtLimit: data?.limit ? data.usage >= data.limit : false,
  }
}
```

**usePermission:**
```typescript
export function usePermission(permission: string) {
  const { data: session } = useSession()
  const { data: member } = useSWR(
    `/api/v1/organization/members/me`,
    fetcher
  )

  return hasPermission(member?.role, permission)
}
```

**useOrganization:**
```typescript
export function useOrganization() {
  const { data, mutate } = useSWR('/api/v1/organization', fetcher)

  return {
    organization: data,
    isLoading: !data,
    refresh: mutate,
  }
}
```

### Database Migrations

**New Indexes Needed:**
```prisma
// For performance
@@index([organizationId, userId])  // OrganizationMember
@@index([organizationId, status])  // BillingSubscription
@@index([organizationId, key])     // Feature lookups
@@index([tenantId, feature])       // TenantEntitlement
```

---

## UI/UX Patterns

### Navigation Updates

**Current:**
- Simple sidebar with main features

**Enhanced:**
1. **Organization Switcher** - Top of sidebar
2. **Plan Badge** - Show current plan tier
3. **Settings Submenu** - Expanded settings navigation
   - General
   - Team
   - Security (new)
     - SSO (new)
     - Domains (new)
     - Audit Log (new)
   - Webhooks (new)
   - Plan & Billing (new)
   - API Keys
   - Integrations (enhanced)
   - Appearance
4. **Organization Menu** (new for multi-org)
   - Hierarchy
   - Child Organizations
   - Shared Resources

### Feature Gating Patterns

**Soft Gate** - Show feature with upgrade prompt:
```tsx
<FeatureGate feature="ADVANCED_ANALYTICS" mode="soft">
  <AdvancedAnalytics />
</FeatureGate>
// Renders with overlay: "Upgrade to Professional to unlock"
```

**Hard Gate** - Hide feature completely:
```tsx
<FeatureGate feature="SSO_CONFIGURATION" mode="hard">
  <SSOSettings />
</FeatureGate>
// Doesn't render at all if not available
```

**Badge** - Show plan requirement:
```tsx
<FeatureBadge feature="WEBHOOKS" />
// Renders: "Pro" or "Enterprise" badge
```

### Usage Meter Patterns

**Progress Bar:**
```tsx
<UsageMeter
  feature="API_REQUESTS"
  label="API Requests"
  showPercentage
  warnAt={80}
/>
```

**Inline Indicator:**
```tsx
<UsageInline feature="TEAM_MEMBERS">
  5 / 10 members used
</UsageInline>
```

---

## Security Considerations

### 1. Authorization Layers

**Three levels of authorization:**
1. **Authentication** - Is user logged in?
2. **Organization Membership** - Is user member of this org?
3. **Role Permission** - Does user's role allow this action?

### 2. API Security

**All v1 endpoints MUST:**
- Validate session
- Validate organization membership
- Check role permissions
- Scope queries to organization
- Audit sensitive operations

**Example:**
```typescript
export default withAuth(withOrganization(withRole(['OWNER', 'ADMIN'],
  async (req, res) => {
    // Handler only runs if authenticated, member, and has role
    const { organizationId } = req.organization

    // All queries scoped to org
    const webhooks = await prisma.webhookEndpoint.findMany({
      where: { organizationId }
    })

    res.json(webhooks)
  }
)))
```

### 3. Data Isolation

**Prevent cross-organization data leaks:**
- Always include `organizationId` in WHERE clauses
- Use organization-scoped queries
- Validate resource ownership before operations
- No direct ID lookups without org check

### 4. Audit Logging

**Log all sensitive operations:**
- Security setting changes
- Team member changes
- Plan upgrades/downgrades
- SSO configuration
- Domain verification
- Webhook creation/deletion
- Data export requests

---

## Testing Strategy

### 1. Unit Tests
- Feature access checking logic
- Permission validation
- Usage limit calculations
- Webhook signature generation

### 2. Integration Tests
- API endpoint authorization
- Organization scoping
- Role-based access
- Feature gates

### 3. E2E Tests
- Complete user flows:
  - Plan upgrade flow
  - SSO configuration
  - Team invitation
  - Webhook creation
  - Domain verification
- Multi-organization switching
- Permission boundaries

---

## Rollout Strategy

### Phase 1: Foundation (Week 1-2)
- [ ] Implement plan visibility API
- [ ] Create billing page
- [ ] Build feature gate system
- [ ] Add usage meters
- [ ] Plan comparison page
- [ ] Upgrade flow

### Phase 2: Team & Access (Week 3)
- [ ] Enhanced team management
- [ ] Invitation system improvements
- [ ] Role permission UI
- [ ] Activity tracking

### Phase 3: Security (Week 4-5)
- [ ] SSO configuration
- [ ] Domain verification
- [ ] Enhanced audit log
- [ ] Data export requests
- [ ] Security settings page

### Phase 4: Integrations (Week 6)
- [ ] Webhook management
- [ ] Integration marketplace
- [ ] OAuth flow improvements

### Phase 5: Hierarchy (Week 7)
- [ ] Organization hierarchy viewer
- [ ] Resource sharing
- [ ] Organization switcher
- [ ] Child organization management

### Phase 6: Analytics (Week 8)
- [ ] Enhanced analytics dashboard
- [ ] Health score
- [ ] Cost tracking
- [ ] Team activity analytics

### Phase 7: Communication (Week 9)
- [ ] Announcement system
- [ ] Support ticket system
- [ ] In-app notifications

### Testing & Polish (Week 10)
- [ ] Comprehensive testing
- [ ] Performance optimization
- [ ] Documentation
- [ ] User guides

---

## Success Metrics

### Adoption Metrics
- % of organizations viewing plan details
- % of users requesting plan upgrades
- % of enterprises configuring SSO
- % of organizations using webhooks
- % of multi-org users utilizing switcher

### Engagement Metrics
- Feature discovery rate
- Support ticket reduction (self-service)
- Team invitation completion rate
- Webhook delivery success rate

### Business Metrics
- Plan upgrade conversion rate
- Feature adoption by tier
- Churn reduction (better visibility)
- Support cost reduction

---

## Documentation Requirements

### User Documentation
1. **Plan & Billing Guide**
   - Understanding your plan
   - Feature limits
   - How to upgrade
   - Billing management

2. **Team Management Guide**
   - Inviting members
   - Role permissions
   - Managing access

3. **Security Setup Guide**
   - SSO configuration by provider
   - Domain verification steps
   - Security best practices

4. **Webhook Guide**
   - Setting up webhooks
   - Event types
   - Signature verification
   - Troubleshooting

5. **Organization Hierarchy Guide**
   - Creating child organizations
   - Resource sharing
   - Switching organizations

### Developer Documentation
1. **API Reference**
   - All new v1 endpoints
   - Authentication
   - Rate limits
   - Webhooks

2. **Feature Gate System**
   - How to gate features
   - Adding new features
   - Testing gated features

3. **Permission System**
   - Role definitions
   - Permission checking
   - Adding new permissions

---

## Appendix: API Endpoints Summary

### New v1 Endpoints to Implement

```typescript
// Plans & Billing
GET    /api/v1/organization/plan
GET    /api/v1/organization/features
GET    /api/v1/organization/features/[key]
GET    /api/v1/organization/usage
POST   /api/v1/organization/plan/upgrade
GET    /api/v1/organization/billing/invoices
PUT    /api/v1/organization/billing/payment

// Team Management
GET    /api/v1/organization/team
POST   /api/v1/organization/team/invite
DELETE /api/v1/organization/team/invitations/[id]
POST   /api/v1/organization/team/invitations/[id]/resend
PUT    /api/v1/organization/team/members/[id]/role
DELETE /api/v1/organization/team/members/[id]
POST   /api/v1/organization/team/bulk

// Security
GET    /api/v1/organization/sso
POST   /api/v1/organization/sso
GET    /api/v1/organization/sso/[id]
PUT    /api/v1/organization/sso/[id]
DELETE /api/v1/organization/sso/[id]
POST   /api/v1/organization/sso/[id]/test
PUT    /api/v1/organization/sso/[id]/enforce

GET    /api/v1/organization/domains
POST   /api/v1/organization/domains
GET    /api/v1/organization/domains/[id]
DELETE /api/v1/organization/domains/[id]
POST   /api/v1/organization/domains/[id]/verify

GET    /api/v1/organization/security/policies
PUT    /api/v1/organization/security/policies
GET    /api/v1/organization/security/ip-allowlist
POST   /api/v1/organization/security/ip-allowlist
DELETE /api/v1/organization/security/ip-allowlist/[id]

// Compliance
GET    /api/v1/organization/exports
POST   /api/v1/organization/exports
GET    /api/v1/organization/exports/[id]
GET    /api/v1/organization/exports/[id]/download

// Webhooks
GET    /api/v1/webhooks
POST   /api/v1/webhooks
GET    /api/v1/webhooks/[id]
PUT    /api/v1/webhooks/[id]
DELETE /api/v1/webhooks/[id]
POST   /api/v1/webhooks/[id]/test
GET    /api/v1/webhooks/[id]/deliveries
POST   /api/v1/webhooks/[id]/rotate-secret

// Integrations
GET    /api/v1/integrations/marketplace
GET    /api/v1/integrations/installed
POST   /api/v1/integrations/install
DELETE /api/v1/integrations/[id]
GET    /api/v1/integrations/[id]/settings
PUT    /api/v1/integrations/[id]/settings

// Hierarchy & Sharing
GET    /api/v1/organization/hierarchy
GET    /api/v1/organization/children
POST   /api/v1/organization/children
GET    /api/v1/organization/parent
POST   /api/v1/organization/move

GET    /api/v1/organization/sharing
POST   /api/v1/organization/sharing
DELETE /api/v1/organization/sharing/[id]
PUT    /api/v1/organization/sharing/[id]/permissions
GET    /api/v1/organization/sharing/invitations
POST   /api/v1/organization/sharing/invitations/[id]/accept
POST   /api/v1/organization/sharing/invitations/[id]/decline

// Analytics
GET    /api/v1/analytics/usage
GET    /api/v1/analytics/costs
GET    /api/v1/analytics/team-activity
GET    /api/v1/analytics/feature-adoption
GET    /api/v1/analytics/api-usage
GET    /api/v1/organization/health

// Communication
GET    /api/v1/announcements
PUT    /api/v1/announcements/[id]/dismiss
GET    /api/v1/whats-new

GET    /api/v1/support/tickets
POST   /api/v1/support/tickets
GET    /api/v1/support/tickets/[id]
POST   /api/v1/support/tickets/[id]/reply
PUT    /api/v1/support/tickets/[id]/close
```

---

## Next Steps

1. **Review & Approve** this plan
2. **Prioritize phases** based on business needs
3. **Assign resources** to each phase
4. **Begin implementation** with Phase 1
5. **Iterate** based on user feedback

---

**Document Version**: 1.0
**Last Updated**: 2026-01-14
**Status**: Ready for Implementation
