# Admin Portal Integration - Phase 1 Complete

## Overview

This integration brings advanced admin portal features into the user-facing frontend, enabling self-service capabilities while maintaining security and multi-tenancy boundaries.

## What's Been Implemented (Phase 1)

### 1. Core Infrastructure ✅

#### API Middleware & Utilities
- **`lib/api/withOrganization.ts`** - Middleware for multi-tenant API requests
- **`lib/api/withRole.ts`** - Role-based access control middleware
- **`lib/features.ts`** - Feature access checking and usage tracking
- **`lib/permissions.ts`** - Enhanced with additional permission types

#### React Hooks
- **`hooks/useFeatureAccess.ts`** - Check feature availability and usage
- **`hooks/useOrganization.ts`** - Organization context and permissions

### 2. Feature Gate System ✅

Created a complete feature gating system for controlling access to premium features:

- **`components/features/FeatureGate.tsx`** - Wrap features to control access
- **`components/features/UpgradePrompt.tsx`** - Show upgrade prompts
- **`components/features/FeatureBadge.tsx`** - Display plan tier badges
- **`components/features/UsageMeter.tsx`** - Visual usage indicators
- **`components/features/UsageInline.tsx`** - Inline usage displays

### 3. Plan & Billing APIs ✅

New API endpoints for plan and feature management:

- `GET /api/v1/organization` - Get current organization details
- `GET /api/v1/organization/plan` - Get plan and features
- `GET /api/v1/organization/features` - List all features
- `GET /api/v1/organization/features/[key]` - Check specific feature
- `GET /api/v1/organization/usage` - Get usage metrics
- `GET /api/v1/organization/members/me` - Get current member info
- `POST /api/v1/organization/plan/upgrade` - Request plan upgrade

### 4. Plan & Billing UI ✅

- **`app/dashboard/settings/plan/page.tsx`** - Complete plan management page with:
  - Current plan display
  - Usage meters against limits
  - Plan comparison
  - Feature list
  - Upgrade flow

Updated navigation:
- Added "Plan & Billing" to settings sidebar
- Link: `/dashboard/settings/plan`

## How to Use

### For Developers

#### 1. Wrapping Features with Feature Gates

```tsx
import { FeatureGate } from '@/components/features/FeatureGate'

// Soft gate - shows upgrade prompt
<FeatureGate feature="ADVANCED_ANALYTICS" mode="soft">
  <AdvancedAnalytics />
</FeatureGate>

// Hard gate - hides completely
<FeatureGate feature="SSO_CONFIGURATION" mode="hard">
  <SSOSettings />
</FeatureGate>
```

#### 2. Checking Feature Access in Code

```tsx
import { useFeatureAccess } from '@/hooks/useFeatureAccess'

function MyComponent() {
  const { hasAccess, usage, limit, isAtLimit } = useFeatureAccess('API_REQUESTS')

  if (isAtLimit) {
    return <UpgradePrompt />
  }

  return <div>You have {limit - usage} requests remaining</div>
}
```

#### 3. Displaying Usage Meters

```tsx
import { UsageMeter } from '@/components/features/UsageMeter'

<UsageMeter
  feature="TEAM_MEMBERS"
  label="Team Members"
  warnAt={80}
/>
```

#### 4. Checking Permissions

```tsx
import { usePermission } from '@/hooks/useOrganization'

function AdminOnlyButton() {
  const { hasPermission } = usePermission('billing:manage')

  if (!hasPermission) return null

  return <Button>Manage Billing</Button>
}
```

#### 5. Creating Protected API Routes

```typescript
import { withOrganization } from '@/lib/api/withOrganization'
import { withRole } from '@/lib/api/withRole'

export const GET = withOrganization(
  withRole(['OWNER', 'ADMIN'], async (req, res) => {
    const { organizationId } = req.organization

    // Your logic here - automatically scoped to organization
  })
)
```

### For Users

#### Viewing Your Plan
1. Navigate to **Settings** → **Plan & Billing**
2. View your current plan tier (Starter, Professional, Enterprise)
3. See usage metrics against plan limits
4. Compare available plans

#### Upgrading Your Plan
1. Go to **Settings** → **Plan & Billing**
2. Review plan comparison section
3. Click "Upgrade to [Plan Name]"
4. Request will be submitted to billing team

#### Monitoring Usage
- Usage meters show current consumption vs limits
- Warning indicators at 80% usage
- Error indicators at 100% usage
- Monthly usage resets automatically

## Architecture

### Multi-Tenancy
- All API requests require `X-Organization-Id` header
- Automatically added by fetch interceptor
- All queries scoped to current organization
- Organization context managed via React Context

### Feature Access Hierarchy
1. **Entitlement Overrides** (highest priority)
   - Organization-specific feature grants
   - Can have expiration dates
   - Set by admin portal

2. **Plan Features**
   - Features included in plan
   - Defined limits per plan tier

3. **Default Behavior**
   - No access if not in entitlements or plan

### Permission System
- Role-based (OWNER, ADMIN, MEMBER, VIEWER)
- Permission checks at component and API level
- Hierarchical (OWNER > ADMIN > MEMBER > VIEWER)

## What's Next (Upcoming Phases)

### Phase 2: Enhanced Team Management
- Multi-user invitations
- Enhanced role management
- Activity tracking
- Bulk operations

### Phase 3: Security & Compliance
- SSO configuration (SAML, OIDC)
- Domain verification
- Enhanced audit log viewer
- Data export requests (GDPR)
- Security policy settings

### Phase 4: Webhooks & Integration Management
- Webhook endpoint management
- Integration marketplace
- OAuth app installation
- Delivery logs and monitoring

### Phase 5: Organization Hierarchy & Resource Sharing
- View organization tree
- Create child organizations
- Share resources across orgs
- Cross-org relationships

### Phase 6: Enhanced Analytics & Insights
- Comprehensive usage analytics
- Cost tracking and forecasting
- Health scores
- Team activity analytics

## Database Schema

### Key Models Used
- **Organization** - Tenant entity
- **OrganizationMember** - User-org membership
- **Plan** - Plan definitions
- **Feature** - Feature definitions
- **PlanFeature** - Plan-feature relationships
- **TenantEntitlement** - Org-specific feature overrides
- **UsageRecord** - Usage tracking

### Important Relationships
```
Organization
  ├─ has one Plan
  ├─ has many PlanFeatures (through Plan)
  ├─ has many TenantEntitlements (overrides)
  ├─ has many OrganizationMembers
  └─ has many UsageRecords

Plan
  └─ has many PlanFeatures

Feature
  ├─ belongs to many Plans (through PlanFeature)
  └─ belongs to many Organizations (through TenantEntitlement)
```

## Security Considerations

### Authentication Layers
1. **Session** - User must be authenticated
2. **Organization Membership** - User must be member of org
3. **Role Permission** - User's role must allow action

### API Security
- All v1 endpoints validate session
- Organization membership checked on every request
- Role permissions enforced
- Queries scoped to organization
- Sensitive operations audited

### Data Isolation
- No direct ID lookups without org check
- Always include `organizationId` in WHERE clauses
- Organization-scoped queries only
- Prevent cross-org data leaks

## Testing

### Manual Testing Checklist
- [ ] Visit `/dashboard/settings/plan`
- [ ] Verify current plan displays correctly
- [ ] Check usage meters show accurate data
- [ ] Test upgrade flow (request submission)
- [ ] Verify plan comparison displays all tiers
- [ ] Check feature list shows plan features

### API Testing
```bash
# Get organization info
curl -H "X-Organization-Id: org_123" http://localhost:3000/api/v1/organization

# Get plan details
curl -H "X-Organization-Id: org_123" http://localhost:3000/api/v1/organization/plan

# Check feature access
curl -H "X-Organization-Id: org_123" http://localhost:3000/api/v1/organization/features/ADVANCED_ANALYTICS

# Get usage metrics
curl -H "X-Organization-Id: org_123" http://localhost:3000/api/v1/organization/usage
```

## Configuration

### Environment Variables
No new environment variables required for Phase 1.

### Feature Keys
Define features in your database with these recommended keys:
- `TEAM_MEMBERS` - Team member limit
- `AGENTS` - Agent creation limit
- `WORKFLOW_RUNS` - Monthly workflow execution limit
- `API_REQUESTS` - Monthly API request limit
- `ADVANCED_ANALYTICS` - Advanced analytics access
- `SSO_CONFIGURATION` - SSO setup access (Enterprise)
- `WEBHOOKS` - Webhook access

## Troubleshooting

### Feature Access Not Working
1. Check organization has a plan assigned
2. Verify feature exists in database
3. Check PlanFeature relationship exists
4. Look for entitlement overrides
5. Check usage tracking is recording correctly

### API Returns 403
1. Verify `X-Organization-Id` header is present
2. Check user is member of organization
3. Verify user's role has required permission
4. Check middleware is properly chained

### Usage Not Tracking
1. Ensure `UsageRecord` entries are being created
2. Check `resourceType` matches feature key
3. Verify date range in queries
4. Check aggregation logic

## Support

For questions or issues:
1. Check this README
2. Review the comprehensive plan document: `ADMIN_FRONTEND_INTEGRATION_PLAN.md`
3. Check API endpoint documentation
4. Review component source code comments

## Contributors

Integration implemented following the comprehensive plan documented in:
- `ADMIN_FRONTEND_INTEGRATION_PLAN.md`

---

**Status**: Phase 1 Complete ✅
**Last Updated**: 2026-01-14
**Version**: 1.0
