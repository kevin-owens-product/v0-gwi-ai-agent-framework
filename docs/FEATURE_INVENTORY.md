# Feature Inventory

**Project:** GWI AI Agent Framework
**Version:** 1.0.0
**Last Updated:** 2024-01-09
**Status:** Production Deployed on Render

---

## Executive Summary

- **Total Pages:** 70
- **Total Components:** 87
- **API Endpoints:** 11 route handlers
- **Custom Hooks:** 3 (with 7 convenience exports)
- **Utility Files:** 9
- **Database Models:** 13 core + 2 auth
- **Test Coverage:** 0% (needs implementation)

---

## Pages

### Public Pages (Unauthenticated)

| Route | Page Name | Status | Tests | Docs |
|-------|-----------|--------|-------|------|
| `/` | Landing/Home | ✅ | ⬜ | ⬜ |
| `/login` | Login | ✅ | ⬜ | ⬜ |
| `/signup` | Signup | ✅ | ⬜ | ⬜ |
| `/forgot-password` | Password Recovery | ✅ | ⬜ | ⬜ |
| `/about` | About Us | ✅ | ⬜ | ⬜ |
| `/pricing` | Pricing | ✅ | ⬜ | ⬜ |
| `/contact` | Contact | ✅ | ⬜ | ⬜ |
| `/blog` | Blog | ✅ | ⬜ | ⬜ |
| `/docs` | Documentation Hub | ✅ | ⬜ | ⬜ |
| `/docs/api` | API Documentation | ✅ | ⬜ | ⬜ |
| `/solutions` | Solutions Overview | ✅ | ⬜ | ⬜ |
| `/solutions/sales` | Sales Solution | ✅ | ⬜ | ⬜ |
| `/solutions/marketing` | Marketing Solution | ✅ | ⬜ | ⬜ |
| `/solutions/product` | Product Solution | ✅ | ⬜ | ⬜ |
| `/solutions/market-research` | Market Research | ✅ | ⬜ | ⬜ |
| `/solutions/insights` | Insights Solution | ✅ | ⬜ | ⬜ |
| `/solutions/ad-sales` | Ad Sales Solution | ✅ | ⬜ | ⬜ |
| `/solutions/innovation` | Innovation Solution | ✅ | ⬜ | ⬜ |
| `/careers` | Careers | ✅ | ⬜ | ⬜ |
| `/tutorials` | Tutorials | ✅ | ⬜ | ⬜ |
| `/case-studies` | Case Studies | ✅ | ⬜ | ⬜ |
| `/press` | Press | ✅ | ⬜ | ⬜ |
| `/security` | Security Info | ✅ | ⬜ | ⬜ |
| `/compliance` | Compliance | ✅ | ⬜ | ⬜ |
| `/terms` | Terms of Service | ✅ | ⬜ | ⬜ |
| `/privacy` | Privacy Policy | ✅ | ⬜ | ⬜ |
| `/cookies` | Cookie Policy | ✅ | ⬜ | ⬜ |
| `/roadmap` | Product Roadmap | ✅ | ⬜ | ⬜ |
| `/changelog` | Changelog | ✅ | ⬜ | ⬜ |
| `/partners` | Partners | ✅ | ⬜ | ⬜ |
| `/onboarding` | Onboarding | ✅ | ⬜ | ⬜ |

### Dashboard Pages (Authenticated)

| Route | Page Name | Status | Tests | Docs | Auth Level |
|-------|-----------|--------|-------|------|------------|
| `/dashboard` | Dashboard Home | ✅ | ⬜ | ⬜ | User+ |
| `/dashboard/agents` | Agent List | ✅ | ⬜ | ⬜ | User+ |
| `/dashboard/agents/new` | Create Agent | ✅ | ⬜ | ⬜ | Admin+ |
| `/dashboard/agents/[id]` | Agent Detail | ✅ | ⬜ | ⬜ | User+ |
| `/dashboard/workflows` | Workflow List | ✅ | ⬜ | ⬜ | User+ |
| `/dashboard/workflows/new` | Create Workflow | ✅ | ⬜ | ⬜ | Admin+ |
| `/dashboard/workflows/[id]` | Workflow Detail | ✅ | ⬜ | ⬜ | User+ |
| `/dashboard/reports` | Reports List | ✅ | ⬜ | ⬜ | User+ |
| `/dashboard/reports/new` | Create Report | ✅ | ⬜ | ⬜ | Admin+ |
| `/dashboard/reports/[id]` | Report Viewer | ✅ | ⬜ | ⬜ | User+ |
| `/dashboard/analytics` | Analytics | ✅ | ⬜ | ⬜ | User+ |
| `/dashboard/projects` | Projects List | ✅ | ⬜ | ⬜ | User+ |
| `/dashboard/projects/[id]` | Project Detail | ✅ | ⬜ | ⬜ | User+ |
| `/dashboard/playground` | Agent Playground | ✅ | ⬜ | ⬜ | User+ |
| `/dashboard/integrations` | Data Integrations | ✅ | ⬜ | ⬜ | Admin+ |
| `/dashboard/store` | Agent Store | ✅ | ⬜ | ⬜ | User+ |
| `/dashboard/store/[id]` | Store Item Detail | ✅ | ⬜ | ⬜ | User+ |
| `/dashboard/memory` | Memory Browser | ✅ | ⬜ | ⬜ | User+ |
| `/dashboard/inbox` | Notifications | ✅ | ⬜ | ⬜ | User+ |
| `/dashboard/crosstabs` | Crosstabs | ✅ | ⬜ | ⬜ | User+ |
| `/dashboard/crosstabs/new` | Create Crosstab | ✅ | ⬜ | ⬜ | Admin+ |
| `/dashboard/charts` | Charts | ✅ | ⬜ | ⬜ | User+ |
| `/dashboard/charts/new` | Create Chart | ✅ | ⬜ | ⬜ | Admin+ |
| `/dashboard/audiences` | Audiences | ✅ | ⬜ | ⬜ | User+ |
| `/dashboard/audiences/new` | Create Audience | ✅ | ⬜ | ⬜ | Admin+ |
| `/dashboard/notifications` | Notification Settings | ✅ | ⬜ | ⬜ | User+ |
| `/dashboard/templates` | Report Templates | ✅ | ⬜ | ⬜ | User+ |
| `/dashboard/teams` | Team Overview | ✅ | ⬜ | ⬜ | Admin+ |
| `/dashboard/dashboards` | Dashboard Widgets | ✅ | ⬜ | ⬜ | User+ |
| `/dashboard/help` | Help & Support | ✅ | ⬜ | ⬜ | User+ |

### Settings Pages (Authenticated)

| Route | Page Name | Status | Tests | Docs | Auth Level |
|-------|-----------|--------|-------|------|------------|
| `/dashboard/settings` | Settings Home | ✅ | ⬜ | ⬜ | User+ |
| `/dashboard/settings/general` | General Settings | ✅ | ⬜ | ⬜ | Admin+ |
| `/dashboard/settings/profile` | User Profile | ✅ | ⬜ | ⬜ | User+ |
| `/dashboard/settings/appearance` | Appearance | ✅ | ⬜ | ⬜ | User+ |
| `/dashboard/settings/team` | Team Management | ✅ | ⬜ | ⬜ | Admin+ |
| `/dashboard/settings/billing` | Billing & Plans | ✅ | ⬜ | ⬜ | Admin+ |
| `/dashboard/settings/api-keys` | API Keys | ✅ | ⬜ | ⬜ | Admin+ |
| `/dashboard/settings/security` | Security | ✅ | ⬜ | ⬜ | User+ |
| `/dashboard/settings/notifications` | Notifications | ✅ | ⬜ | ⬜ | User+ |

---

## Components

### UI Components (Base Library)

| Component | Location | Props Documented | Tests | Accessibility |
|-----------|----------|------------------|-------|---------------|
| Button | `components/ui/button.tsx` | ⬜ | ⬜ | ⬜ |
| Input | `components/ui/input.tsx` | ⬜ | ⬜ | ⬜ |
| Textarea | `components/ui/textarea.tsx` | ⬜ | ⬜ | ⬜ |
| Label | `components/ui/label.tsx` | ⬜ | ⬜ | ⬜ |
| Card | `components/ui/card.tsx` | ⬜ | ⬜ | ⬜ |
| Badge | `components/ui/badge.tsx` | ⬜ | ⬜ | ⬜ |
| Avatar | `components/ui/avatar.tsx` | ⬜ | ⬜ | ⬜ |
| Tabs | `components/ui/tabs.tsx` | ⬜ | ⬜ | ⬜ |
| Dialog | `components/ui/dialog.tsx` | ⬜ | ⬜ | ⬜ |
| Dropdown Menu | `components/ui/dropdown-menu.tsx` | ⬜ | ⬜ | ⬜ |
| Sheet | `components/ui/sheet.tsx` | ⬜ | ⬜ | ⬜ |
| Select | `components/ui/select.tsx` | ⬜ | ⬜ | ⬜ |
| Checkbox | `components/ui/checkbox.tsx` | ⬜ | ⬜ | ⬜ |
| Radio Group | `components/ui/radio-group.tsx` | ⬜ | ⬜ | ⬜ |
| Switch | `components/ui/switch.tsx` | ⬜ | ⬜ | ⬜ |
| Slider | `components/ui/slider.tsx` | ⬜ | ⬜ | ⬜ |
| Progress | `components/ui/progress.tsx` | ⬜ | ⬜ | ⬜ |
| Skeleton | `components/ui/skeleton.tsx` | ⬜ | ⬜ | ⬜ |
| Accordion | `components/ui/accordion.tsx` | ⬜ | ⬜ | ⬜ |
| Scroll Area | `components/ui/scroll-area.tsx` | ⬜ | ⬜ | ⬜ |
| Separator | `components/ui/separator.tsx` | ⬜ | ⬜ | ⬜ |
| Tooltip | `components/ui/tooltip.tsx` | ⬜ | ⬜ | ⬜ |
| Table | `components/ui/table.tsx` | ⬜ | ⬜ | ⬜ |

### Dashboard Components

| Component | Location | Props Documented | Tests | Accessibility |
|-----------|----------|------------------|-------|---------------|
| Sidebar | `components/dashboard/sidebar.tsx` | ⬜ | ⬜ | ⬜ |
| Mobile Sidebar | `components/dashboard/mobile-sidebar.tsx` | ⬜ | ⬜ | ⬜ |
| Header | `components/dashboard/header.tsx` | ⬜ | ⬜ | ⬜ |
| Dashboard Header | `components/dashboard/dashboard-header.tsx` | ⬜ | ⬜ | ⬜ |
| Overview | `components/dashboard/overview.tsx` | ⬜ | ⬜ | ⬜ |
| Hero Metrics | `components/dashboard/hero-metrics.tsx` | ⬜ | ⬜ | ⬜ |
| Usage Stats | `components/dashboard/usage-stats.tsx` | ⬜ | ⬜ | ⬜ |
| Quick Actions | `components/dashboard/quick-actions.tsx` | ⬜ | ⬜ | ⬜ |
| Insights Panel | `components/dashboard/insights-panel.tsx` | ⬜ | ⬜ | ⬜ |
| Live Activity Feed | `components/dashboard/live-activity-feed.tsx` | ⬜ | ⬜ | ⬜ |
| Recent Workflows | `components/dashboard/recent-workflows.tsx` | ⬜ | ⬜ | ⬜ |
| Active Agents | `components/dashboard/active-agents.tsx` | ⬜ | ⬜ | ⬜ |
| Agent Orchestrator | `components/dashboard/agent-orchestrator.tsx` | ⬜ | ⬜ | ⬜ |
| Performance Charts | `components/dashboard/performance-charts.tsx` | ⬜ | ⬜ | ⬜ |

### Landing Page Components

| Component | Location | Props Documented | Tests | Accessibility |
|-----------|----------|------------------|-------|---------------|
| Header | `components/landing/header.tsx` | ⬜ | ⬜ | ⬜ |
| Hero Section | `components/landing/hero-section.tsx` | ⬜ | ⬜ | ⬜ |
| Features Section | `components/landing/features-section.tsx` | ⬜ | ⬜ | ⬜ |
| Stats Section | `components/landing/stats-section.tsx` | ⬜ | ⬜ | ⬜ |
| Agents Showcase | `components/landing/agents-showcase.tsx` | ⬜ | ⬜ | ⬜ |
| Inbox Agents Section | `components/landing/inbox-agents-section.tsx` | ⬜ | ⬜ | ⬜ |
| Playground Showcase | `components/landing/playground-showcase.tsx` | ⬜ | ⬜ | ⬜ |
| Workflow Demo | `components/landing/workflow-demo.tsx` | ⬜ | ⬜ | ⬜ |
| Reports Section | `components/landing/reports-section.tsx` | ⬜ | ⬜ | ⬜ |
| Pricing Section | `components/landing/pricing-section.tsx` | ⬜ | ⬜ | ⬜ |
| Logo Cloud | `components/landing/logo-cloud.tsx` | ⬜ | ⬜ | ⬜ |
| CTA Section | `components/landing/cta-section.tsx` | ⬜ | ⬜ | ⬜ |
| Footer | `components/landing/footer.tsx` | ⬜ | ⬜ | ⬜ |

### Agent Components

| Component | Location | Props Documented | Tests | Accessibility |
|-----------|----------|------------------|-------|---------------|
| Agent Grid | `components/agents/agent-grid.tsx` | ⬜ | ⬜ | ⬜ |
| Agent Builder | `components/agents/agent-builder.tsx` | ⬜ | ⬜ | ⬜ |
| Agent Filters | `components/agents/agent-filters.tsx` | ⬜ | ⬜ | ⬜ |
| Agent Detail | `components/agents/agent-detail.tsx` | ⬜ | ⬜ | ⬜ |

### Workflow Components

| Component | Location | Props Documented | Tests | Accessibility |
|-----------|----------|------------------|-------|---------------|
| Workflow List | `components/workflows/workflow-list.tsx` | ⬜ | ⬜ | ⬜ |
| Workflow Builder | `components/workflows/workflow-builder.tsx` | ⬜ | ⬜ | ⬜ |
| Workflow Filters | `components/workflows/workflow-filters.tsx` | ⬜ | ⬜ | ⬜ |
| Workflow Detail | `components/workflows/workflow-detail.tsx` | ⬜ | ⬜ | ⬜ |

### Report Components

| Component | Location | Props Documented | Tests | Accessibility |
|-----------|----------|------------------|-------|---------------|
| Reports Grid | `components/reports/reports-grid.tsx` | ⬜ | ⬜ | ⬜ |
| Report Builder | `components/reports/report-builder.tsx` | ⬜ | ⬜ | ⬜ |
| Reports Filters | `components/reports/reports-filters.tsx` | ⬜ | ⬜ | ⬜ |
| Report Templates | `components/reports/report-templates.tsx` | ⬜ | ⬜ | ⬜ |
| Report Stats | `components/reports/report-stats.tsx` | ⬜ | ⬜ | ⬜ |
| Reports Header | `components/reports/reports-header.tsx` | ⬜ | ⬜ | ⬜ |
| Report Viewer | `components/reports/report-viewer.tsx` | ⬜ | ⬜ | ⬜ |

### Analytics Components

| Component | Location | Props Documented | Tests | Accessibility |
|-----------|----------|------------------|-------|---------------|
| Analytics Overview | `components/analytics/analytics-overview.tsx` | ⬜ | ⬜ | ⬜ |
| Analytics Header | `components/analytics/analytics-header.tsx` | ⬜ | ⬜ | ⬜ |
| Agent Performance | `components/analytics/agent-performance.tsx` | ⬜ | ⬜ | ⬜ |
| Usage Charts | `components/analytics/usage-charts.tsx` | ⬜ | ⬜ | ⬜ |
| Top Queries | `components/analytics/top-queries.tsx` | ⬜ | ⬜ | ⬜ |
| Team Activity | `components/analytics/team-activity.tsx` | ⬜ | ⬜ | ⬜ |

### Playground Components

| Component | Location | Props Documented | Tests | Accessibility |
|-----------|----------|------------------|-------|---------------|
| Playground Header | `components/playground/header.tsx` | ⬜ | ⬜ | ⬜ |
| Canvas | `components/playground/canvas.tsx` | ⬜ | ⬜ | ⬜ |
| Chat | `components/playground/chat.tsx` | ⬜ | ⬜ | ⬜ |
| Chat Message | `components/playground/chat-message.tsx` | ⬜ | ⬜ | ⬜ |
| Playground Sidebar | `components/playground/sidebar.tsx` | ⬜ | ⬜ | ⬜ |
| Toolbar | `components/playground/toolbar.tsx` | ⬜ | ⬜ | ⬜ |
| Command Palette | `components/playground/command-palette.tsx` | ⬜ | ⬜ | ⬜ |
| Context Panel | `components/playground/context-panel.tsx` | ⬜ | ⬜ | ⬜ |
| Source Preview | `components/playground/source-preview.tsx` | ⬜ | ⬜ | ⬜ |

### Memory Components

| Component | Location | Props Documented | Tests | Accessibility |
|-----------|----------|------------------|-------|---------------|
| Memory Overview | `components/memory/memory-overview.tsx` | ⬜ | ⬜ | ⬜ |
| Memory Stats | `components/memory/memory-stats.tsx` | ⬜ | ⬜ | ⬜ |
| Memory Browser | `components/memory/memory-browser.tsx` | ⬜ | ⬜ | ⬜ |

### Integration Components

| Component | Location | Props Documented | Tests | Accessibility |
|-----------|----------|------------------|-------|---------------|
| Integrations Header | `components/integrations/integrations-header.tsx` | ⬜ | ⬜ | ⬜ |
| Integrations Grid | `components/integrations/integrations-grid.tsx` | ⬜ | ⬜ | ⬜ |
| Connected Integrations | `components/integrations/connected-integrations.tsx` | ⬜ | ⬜ | ⬜ |

### Settings Components

| Component | Location | Props Documented | Tests | Accessibility |
|-----------|----------|------------------|-------|---------------|
| Settings Sidebar | `components/settings/settings-sidebar.tsx` | ⬜ | ⬜ | ⬜ |

### Other Components

| Component | Location | Props Documented | Tests | Accessibility |
|-----------|----------|------------------|-------|---------------|
| Theme Provider | `components/theme-provider.tsx` | ⬜ | ⬜ | N/A |

---

## API Endpoints

### Authentication Endpoints

| Method | Endpoint | Auth | Rate Limited | Tests | Docs |
|--------|----------|------|--------------|-------|------|
| POST/GET | `/api/auth/[...nextauth]` | No | No | ⬜ | ⬜ |
| POST | `/api/auth/register` | No | Yes | ⬜ | ⬜ |

### Agent Endpoints

| Method | Endpoint | Auth | Rate Limited | Tests | Docs |
|--------|----------|------|--------------|-------|------|
| GET | `/api/v1/agents` | Yes | Yes | ⬜ | ⬜ |
| POST | `/api/v1/agents` | Yes | Yes | ⬜ | ⬜ |
| GET | `/api/v1/agents/[id]` | Yes | Yes | ⬜ | ⬜ |
| PATCH | `/api/v1/agents/[id]` | Yes | Yes | ⬜ | ⬜ |
| DELETE | `/api/v1/agents/[id]` | Yes | Yes | ⬜ | ⬜ |
| POST | `/api/v1/agents/[id]/run` | Yes | Yes | ⬜ | ⬜ |

### GWI Platform Endpoints

| Method | Endpoint | Auth | Rate Limited | Tests | Docs |
|--------|----------|------|--------------|-------|------|
| POST | `/api/gwi/platform/data` | No | No | ⬜ | ⬜ |
| POST | `/api/gwi/platform/audiences/create` | No | No | ⬜ | ⬜ |
| POST | `/api/gwi/platform/crosstab` | No | No | ⬜ | ⬜ |
| POST | `/api/gwi/spark-mcp/query` | No | No | ⬜ | ⬜ |

### System Endpoints

| Method | Endpoint | Auth | Rate Limited | Tests | Docs |
|--------|----------|------|--------------|-------|------|
| GET | `/api/health` | No | No | ⬜ | ⬜ |
| POST | `/api/webhooks/stripe` | No | No | ⬜ | ⬜ |

---

## Hooks

| Hook | File | Purpose | Tests |
|------|------|---------|-------|
| `useAgents` | `hooks/use-agents.ts` | Fetch, create, update, delete, run agents | ⬜ |
| `useAgent` | `hooks/use-agents.ts` | Fetch single agent details | ⬜ |
| `useOrganization` | `hooks/use-organization.ts` | Organization context and state | ⬜ |
| `useCurrentOrg` | `hooks/use-organization.ts` | Get current organization | ⬜ |
| `useOrgRole` | `hooks/use-organization.ts` | Get user's role in current org | ⬜ |
| `useOrgPlan` | `hooks/use-organization.ts` | Get organization's plan tier | ⬜ |
| `usePermissions` | `hooks/use-permissions.ts` | Check user permissions | ⬜ |
| `useCanCreateAgents` | `hooks/use-permissions.ts` | Check agents:write permission | ⬜ |
| `useCanDeleteAgents` | `hooks/use-permissions.ts` | Check agents:delete permission | ⬜ |
| `useCanExecuteAgents` | `hooks/use-permissions.ts` | Check agents:execute permission | ⬜ |
| `useCanManageTeam` | `hooks/use-permissions.ts` | Check team management permissions | ⬜ |
| `useCanManageBilling` | `hooks/use-permissions.ts` | Check billing:manage permission | ⬜ |
| `useCanViewAuditLogs` | `hooks/use-permissions.ts` | Check audit:read permission | ⬜ |

---

## Utilities

### lib/utils.ts

| Function | Purpose | Tests |
|----------|---------|-------|
| `cn` | Class name merging (clsx + tailwind-merge) | ⬜ |

### lib/auth.ts

| Function | Purpose | Tests |
|----------|---------|-------|
| `handlers` | NextAuth route handlers | ⬜ |
| `auth` | Auth session getter | ⬜ |
| `signIn` | Sign in function | ⬜ |
| `signOut` | Sign out function | ⬜ |
| `hashPassword` | Bcrypt password hashing | ⬜ |
| `comparePassword` | Bcrypt password comparison | ⬜ |
| `generateUniqueSlug` | Generate unique org slugs | ⬜ |

### lib/db.ts

| Export | Purpose | Tests |
|--------|---------|-------|
| `prisma` | Prisma client singleton | ⬜ |

### lib/permissions.ts

| Function/Export | Purpose | Tests |
|-----------------|---------|-------|
| `PERMISSIONS` | Permission definitions (18 permissions) | ⬜ |
| `ROLE_PERMISSIONS` | Role to permission mapping | ⬜ |
| `hasPermission` | Check single permission | ⬜ |
| `hasAnyPermission` | Check any of multiple permissions | ⬜ |
| `hasAllPermissions` | Check all of multiple permissions | ⬜ |
| `getRolePermissions` | Get all permissions for role | ⬜ |
| `canManageRole` | Check role hierarchy | ⬜ |

### lib/audit.ts

| Function/Type | Purpose | Tests |
|---------------|---------|-------|
| `AuditAction` | Audit action types (11 types) | ⬜ |
| `AuditResourceType` | Resource type definitions (10 types) | ⬜ |
| `AuditEvent` | Audit event interface | ⬜ |
| `logAuditEvent` | Log single audit event | ⬜ |
| `getAuditLogs` | Query audit logs with filters | ⬜ |
| `createAuditEventFromRequest` | Extract audit data from HTTP request | ⬜ |
| `logBatchAuditEvents` | Batch audit logging | ⬜ |

### lib/tenant.ts

| Function | Purpose | Tests |
|----------|---------|-------|
| `getCurrentOrganization` | Get current org from session | ⬜ |
| `getUserOrganizations` | Get all orgs for user | ⬜ |
| `getUserMembership` | Get user's membership in org | ⬜ |
| `generateUniqueSlug` | Generate unique subdomain slug | ⬜ |

### lib/rate-limit.ts

| Function/Type | Purpose | Tests |
|---------------|---------|-------|
| `RateLimitResult` | Rate limit result interface | ⬜ |
| `checkRateLimit` | Check rate limit by plan tier | ⬜ |
| `checkApiKeyRateLimit` | Check rate limit for API key | ⬜ |
| `getRateLimitHeaders` | Generate rate limit headers | ⬜ |
| `getRateLimitIdentifier` | Get identifier from request | ⬜ |

### lib/billing.ts

| Function/Export | Purpose | Tests |
|-----------------|---------|-------|
| `PLAN_LIMITS` | Plan tier limits configuration | ⬜ |
| `PLAN_PRICES` | Plan pricing configuration | ⬜ |
| `getStripe` | Get Stripe client instance | ⬜ |
| `recordUsage` | Record usage metric | ⬜ |
| `checkUsageLimit` | Check if usage limit exceeded | ⬜ |

### lib/gwi-api.ts

| Function/Class | Purpose | Tests |
|----------------|---------|-------|
| `GWIClient` | GWI Platform API client class | ⬜ |
| `querySparkMCP` | Query Spark MCP | ⬜ |
| `getInsights` | Get insights from GWI | ⬜ |
| `createAudience` | Create audience definition | ⬜ |

---

## Database Models

| Model | Purpose | Fields | Indexes |
|-------|---------|--------|---------|
| `Organization` | Multi-tenant workspace | id, name, slug, planTier, createdAt, updatedAt | slug (unique) |
| `User` | User accounts | id, email, name, avatar, passwordHash, createdAt | email (unique) |
| `OrganizationMember` | Team membership | id, orgId, userId, role, createdAt | orgId+userId (unique) |
| `Agent` | AI agents | id, orgId, name, description, type, status, configuration, createdBy, createdAt, updatedAt | orgId, status, type |
| `AgentRun` | Agent execution records | id, agentId, status, input, output, tokensUsed, startedAt, completedAt | agentId, status |
| `DataSource` | External data connections | id, orgId, name, type, status, configuration, lastSyncAt | orgId, status |
| `Insight` | Generated insights | id, orgId, agentId, type, title, data, confidenceScore, createdAt | orgId, agentId |
| `AuditLog` | Activity logging | id, orgId, userId, action, resourceType, resourceId, metadata, ipAddress, userAgent, timestamp | orgId, action, timestamp |
| `UsageRecord` | Metered usage tracking | id, orgId, metricType, value, recordedAt | orgId, metricType, recordedAt |
| `BillingSubscription` | Stripe subscription | id, orgId, stripeCustomerId, stripeSubscriptionId, planId, status | orgId (unique) |
| `ApiKey` | API authentication | id, orgId, name, keyPrefix, keyHash, permissions, rateLimit, expiresAt, lastUsedAt | keyHash (unique) |
| `Invitation` | Team invites | id, orgId, email, role, status, expiresAt, createdAt | orgId, email, status |
| `SSOConfiguration` | Enterprise SSO | id, orgId, provider, metadata, enabled | orgId (unique) |
| `Account` | OAuth account linking | id, userId, provider, providerAccountId | provider+providerAccountId (unique) |
| `Session` | Session tokens | id, userId, sessionToken, expires | sessionToken (unique) |

---

## Permissions Matrix

| Permission | Owner | Admin | Member | Viewer |
|------------|-------|-------|--------|--------|
| `agents:read` | ✅ | ✅ | ✅ | ✅ |
| `agents:write` | ✅ | ✅ | ✅ | ❌ |
| `agents:delete` | ✅ | ✅ | ❌ | ❌ |
| `agents:execute` | ✅ | ✅ | ✅ | ❌ |
| `insights:read` | ✅ | ✅ | ✅ | ✅ |
| `insights:export` | ✅ | ✅ | ❌ | ❌ |
| `data_sources:read` | ✅ | ✅ | ✅ | ❌ |
| `data_sources:write` | ✅ | ✅ | ❌ | ❌ |
| `data_sources:delete` | ✅ | ✅ | ❌ | ❌ |
| `team:read` | ✅ | ✅ | ✅ | ❌ |
| `team:invite` | ✅ | ✅ | ❌ | ❌ |
| `team:manage` | ✅ | ✅ | ❌ | ❌ |
| `billing:read` | ✅ | ❌ | ❌ | ❌ |
| `billing:manage` | ✅ | ❌ | ❌ | ❌ |
| `settings:read` | ✅ | ✅ | ❌ | ❌ |
| `settings:manage` | ✅ | ✅ | ❌ | ❌ |
| `audit:read` | ✅ | ✅ | ❌ | ❌ |
| `admin:*` | ✅ | ❌ | ❌ | ❌ |

---

## Plan Limits

| Feature | Starter | Professional | Enterprise |
|---------|---------|--------------|------------|
| Agent Runs/month | 100 | 1,000 | Unlimited |
| Team Seats | 3 | 10 | Unlimited |
| Data Sources | 5 | 25 | Unlimited |
| API Calls/min | 100 | 500 | 2,000 |
| Tokens/month | 100K | 1M | Unlimited |

---

## Testing Status Summary

| Category | Total | Tested | Coverage |
|----------|-------|--------|----------|
| Pages | 70 | 0 | 0% |
| Components | 87 | 0 | 0% |
| API Endpoints | 11 | 0 | 0% |
| Hooks | 13 | 0 | 0% |
| Utilities | 25+ | 0 | 0% |

---

## Next Steps

1. **Phase 1**: Set up testing infrastructure (Vitest, Playwright, MSW)
2. **Phase 2**: Create test factories and mock handlers
3. **Phase 3**: Write unit tests for utilities and hooks
4. **Phase 4**: Write component tests
5. **Phase 5**: Write API route tests
6. **Phase 6**: Create E2E tests for critical flows
7. **Phase 7**: Add JSDoc documentation
8. **Phase 8**: Update TypeScript strictness and ESLint config
