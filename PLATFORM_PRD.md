# COMPREHENSIVE PLATFORM PRODUCT REQUIREMENTS DOCUMENT (PRD)
## GWI AI Agent Framework - Complete Platform Rebuild

**Version:** 1.0
**Status:** Production Ready
**Last Updated:** January 2026

---

## 1. WHAT IS THIS PLATFORM?

### 1.1 Product Overview

The **GWI AI Agent Framework** is an enterprise SaaS platform that transforms consumer research data into actionable insights through AI-powered agents. It is a multi-tenant research intelligence platform that enables organizations to:

- **Automate complex research workflows** through intelligent agent orchestration
- **Generate verified, cited insights** with full data provenance tracking
- **Collaborate at enterprise scale** with role-based access control and team management
- **Integrate with GWI's research data** (Global Web Index) for consumer intelligence
- **Build custom AI agents** for specialized research tasks

### 1.2 Core Value Proposition

1. **Automated Research Workflows** - Multi-step agent pipelines execute complex research autonomously
2. **Verified Insights** - Every output includes citations, confidence scores, and data provenance
3. **Enterprise Collaboration** - Team workspaces, projects, and granular role-based access control
4. **Extensible Agent System** - Pre-built domain agents plus custom agent creation capabilities
5. **Advanced Organization Hierarchy** - Support for complex multi-level organizational structures (agencies, holding companies, franchises, etc.)
6. **Enterprise Security & Compliance** - SSO, SCIM, device trust, security policies, and full compliance framework

### 1.3 Target Users

- **Research Analysts** - Generate audience profiles, track trends, create client deliverables
- **Insights Managers** - Oversee team output, ensure quality standards, manage client relationships
- **Data Engineers** - Build custom integrations, create specialized agents, maintain data pipelines
- **Marketing Strategists** - Receive actionable audience insights, understand consumer behavior
- **Enterprise Administrators** - Manage access, ensure compliance, monitor usage

---

## 2. OVERALL ARCHITECTURE

### 2.1 Technology Stack

**Frontend:**
- **Framework:** Next.js 16 (App Router with Server Components)
- **UI Components:** shadcn/ui + Radix UI
- **Styling:** Tailwind CSS v4 with dark mode support
- **Forms:** React Hook Form + Zod for type-safe validation
- **Charts:** Recharts for data visualization
- **State Management:** React Context + SWR for server state sync
- **Testing:** Vitest, Testing Library, Playwright E2E
- **HTTP Client:** SWR for data fetching and caching

**Backend:**
- **Runtime:** Node.js 20 LTS
- **API:** Next.js Route Handlers (REST API)
- **Database:** PostgreSQL (primary data store)
- **Cache:** Redis/Upstash (session storage, rate limiting)
- **Search:** Full-text search via PostgreSQL
- **ORM:** Prisma (with comprehensive schema management)
- **Job Queue:** Support for async job processing

**Authentication & Authorization:**
- **Session Management:** NextAuth.js v5 (cookies-based)
- **OAuth:** Google, Azure AD support
- **SSO:** SAML, OIDC, Azure AD, Okta, Google Workspace, OneLogin
- **SCIM:** User provisioning via SCIM protocol
- **Password Security:** bcrypt hashing

**AI/ML Integration:**
- **Primary LLM:** Anthropic Claude API
- **Secondary LLM:** OpenAI GPT (optional)
- **GWI Integration:** GWI Platform API, Spark API, Spark MCP
- **Tool Calling:** LLM tool/function calling with registry

**Infrastructure:**
- **Deployment:** Vercel (primary) or Render (production)
- **CDN:** Vercel Edge Network / Global distribution
- **Monitoring:** Sentry for error tracking
- **Email:** Resend for transactional emails
- **Billing:** Stripe integration
- **Rate Limiting:** Upstash Redis-based rate limiting
- **Storage:** S3-compatible object storage

### 2.2 High-Level Architecture Diagram

```
┌─────────────────────────────────────────┐
│         CLIENT LAYER (Next.js)          │
│  ├─ Web App (React Server Components)  │
│  ├─ Mobile-optimized UI                 │
│  └─ API SDK / REST Clients              │
└──────────────────┬──────────────────────┘
                   │
┌──────────────────▼──────────────────────┐
│    MIDDLEWARE LAYER                     │
│  ├─ Authentication (NextAuth)           │
│  ├─ Authorization (Role-based)          │
│  ├─ Rate Limiting (Upstash)             │
│  └─ Request Routing & Validation        │
└──────────────────┬──────────────────────┘
                   │
┌──────────────────▼──────────────────────┐
│    APPLICATION LAYER (Services)        │
│  ├─ Agent Service (execution & runs)   │
│  ├─ Workflow Engine (orchestration)    │
│  ├─ Tool Registry & Execution          │
│  ├─ Report Generator                   │
│  ├─ Memory Service (context storage)   │
│  ├─ Hierarchy Service (org structures) │
│  ├─ Billing & Entitlements             │
│  ├─ Change Tracking                    │
│  └─ Audit Logging                      │
└──────────────────┬──────────────────────┘
                   │
┌──────────────────▼──────────────────────┐
│    DATA LAYER                           │
│  ├─ PostgreSQL (main DB)               │
│  ├─ Redis/Upstash (cache & sessions)  │
│  ├─ S3 Storage (reports & exports)    │
│  └─ GWI Data Lake (consumer data)     │
└─────────────────────────────────────────┘
```

---

## 3. ALL MAJOR FEATURES & FUNCTIONALITY

### 3.1 Core Agent System

**Agents** are the fundamental building blocks of the platform:

- **Agent Types:**
  - `RESEARCH` - Data gathering and research
  - `ANALYSIS` - Analytical processing
  - `REPORTING` - Report generation
  - `MONITORING` - Ongoing monitoring/tracking
  - `CUSTOM` - User-defined agents

- **Agent Lifecycle:**
  - `DRAFT` - Being created/configured
  - `ACTIVE` - Published and available
  - `PAUSED` - Temporarily disabled
  - `ARCHIVED` - Retired/historical

- **Agent Capabilities:**
  - Configuration-driven behavior
  - Tool invocation (function calling)
  - Memory management (short/long-term context)
  - Error handling and retries
  - Token usage tracking
  - Output generation with citations

**Agent Runs** - Track individual agent executions:
- Input parameters
- Output results
- Execution status (PENDING, RUNNING, COMPLETED, FAILED, CANCELLED)
- Token consumption
- Generated insights
- Error messages and logs

### 3.2 Workflow Orchestration

**Workflows** compose multiple agents into coordinated sequences:

- **Workflow Creation:**
  - Define agent sequences in execution order
  - Configure cron-based or on-demand scheduling
  - Set parameters and data flow between agents
  - Version control and rollback support

- **Workflow Execution:**
  - Multi-step agent execution pipelines
  - Data passing between agent steps
  - Conditional branching (future)
  - Automatic retry logic
  - Full audit trails

- **Workflow Run Tracking:**
  - Execution history
  - Per-step status and timing
  - Aggregate outputs
  - Error recovery

### 3.3 Report & Dashboard System

**Reports** - Customer-facing deliverables:
- Multiple formats: PRESENTATION, DASHBOARD, PDF, EXPORT, INFOGRAPHIC
- Auto-generated from agent runs
- Published vs. Draft states
- View count tracking
- Exportable as PDF or presentations
- Customizable templates

**Dashboards** - Real-time visualization:
- Custom widget configurations
- Grid-based layout system
- Multiple widget types (charts, tables, metrics)
- Public/private sharing
- Real-time data updates via WebSockets
- Interactive drill-down capabilities

### 3.4 Audience & Crosstab System

**Audiences** - Segmentation and targeting:
- Define audiences using demographic, behavioral, and psychographic criteria
- Multiple filter operators (equals, contains, between, in, not_in)
- Market/regional scoping
- Audience size estimation
- Reusable definitions
- Favorites and usage tracking

**Crosstabs** - Multi-dimensional analysis:
- Compare multiple audiences against various metrics
- Support for complex filtering
- Cached result caching
- Data export capabilities
- Time-series comparisons

### 3.5 Brand Tracking System

**Brand Tracking** - Ongoing brand health monitoring:
- Track multiple brands and competitors
- Audience-based performance metrics
- Automated snapshot scheduling
- Custom metrics configuration
- Alert thresholds and notifications
- Historical snapshots for trend analysis

**Brand Metrics Tracked:**
- Brand health score
- Market share
- Sentiment analysis
- Brand awareness
- Consideration metrics
- Preference scores
- Loyalty metrics
- Net Promoter Score (NPS)

### 3.6 Data Visualization & Charts

**Charts** - Flexible data visualization:
- Multiple chart types: BAR, LINE, PIE, DONUT, AREA, SCATTER, HEATMAP, TREEMAP, FUNNEL, RADAR
- Custom data source configuration
- Interactive filtering
- Export as image/data
- Dashboard integration
- Draft/Published states

### 3.7 Template System

**Templates** - Reusable agent configurations:
- Categories: RESEARCH, ANALYSIS, BRIEFS, CUSTOM
- Pre-built prompts with variable substitution
- Tag-based organization
- Global vs. organization-scoped
- Usage tracking and favorites
- Cloning and customization

### 3.8 Memory & Context Management

**Memory Service** - Persistent agent context:
- Types: CONTEXT, PREFERENCE, FACT, CONVERSATION, CACHE
- Agent-scoped and organization-scoped storage
- Expiration support for temporary data
- Key-value metadata storage
- De-duplication support (input hash tracking)

**Tool Memory** - Cache for expensive operations:
- Tracks tool execution results
- Prevents duplicate API calls
- Input hash-based caching
- Resource tracking
- TTL support

### 3.9 Change Tracking & Insights

**Entity Versioning:**
- Full version history for all major entities
- Delta tracking (what changed)
- Change summaries and human-readable descriptions
- Rollback capability

**Change Alerts:**
- Automated alerts for significant changes
- Multiple alert types: SIGNIFICANT_INCREASE, DECREASE, THRESHOLD_CROSSED, ANOMALY_DETECTED
- Severity levels: INFO, WARNING, CRITICAL
- Smart notifications

**Change Summaries:**
- Periodic aggregations (daily, weekly, monthly)
- Top changes highlighting
- Impact metrics
- User-specific tracking

### 3.10 Multi-Organization Hierarchy System

**Organization Types Supported:**
- `STANDARD` - Individual organization
- `AGENCY` - Managing client organizations
- `HOLDING_COMPANY` - Parent owning subsidiaries
- `SUBSIDIARY` - Owned by holding company
- `BRAND` - Individual brand entity
- `SUB_BRAND` - Under parent brand
- `DIVISION` - Business division
- `DEPARTMENT` - Department within org
- `FRANCHISE` - Franchise organization
- `FRANCHISEE` - Individual franchise location
- `RESELLER` - Partner that resells
- `CLIENT` - Client being managed
- `REGIONAL` - Regional entity
- `PORTFOLIO_COMPANY` - In PE/VC portfolio

**Hierarchy Features:**
- Multi-level parent-child relationships
- Materialized path for efficient queries
- Max depth configuration
- Automatic hierarchy validation
- Ancestor and descendant queries

**Organization Relationships:**
- `OWNERSHIP` - Full ownership/control
- `MANAGEMENT` - Agency managing client
- `PARTNERSHIP` - Collaboration
- `LICENSING` - Licensing agreement
- `RESELLER` - Reseller relationship
- `WHITE_LABEL` - White-label partnership
- `DATA_SHARING` - Data sharing only
- `CONSORTIUM` - Part of group

**Billing Consolidation:**
- Independent billing per organization
- Parent-pays model (parent subsidizes child)
- Consolidated billing across hierarchy
- Pass-through billing (with markup)
- Partial subsidy models

**Resource Sharing:**
- Share templates, audiences, datasources, workflows, agents, charts
- Fine-grained permissions (view, edit, delete, re-share)
- Scope: NONE, READ_ONLY, FULL_ACCESS, INHERIT
- Expiration dates on shares
- Propagation to child orgs

### 3.11 Role-Based Access Control (RBAC)

**Organization-Level Roles:**
- `OWNER` - Full control
- `ADMIN` - Administrative access
- `MEMBER` - Standard team member
- `VIEWER` - Read-only access

**Dynamic Role System (Enterprise):**
- Custom role definitions
- Flexible permission configuration
- Role inheritance hierarchy
- System vs. custom roles
- Color/icon customization

**Permission Model:**
- Resource-based permissions (agents:read, workflows:create, etc.)
- Role-permission mapping
- Permission categories: Core, Analytics, Agents, Integrations, Security, Support, Customization, API, Advanced
- Audit trails for permission changes

**Role Inheritance:**
- Rules for inheriting parent org roles
- Directional inheritance (up/down hierarchy)
- Depth control
- Conditional inheritance based on org type
- Approval workflows

### 3.12 Billing & Entitlement System

**Plan Tiers:**
- `STARTER` - Small teams, limited features
- `PROFESSIONAL` - Growing organizations
- `ENTERPRISE` - Large-scale deployments, unlimited features

**Plan Features:**
- Agent runs limits
- Team seats
- Data sources
- API call limits
- Data retention
- Token consumption
- Dashboards and reports
- Workflows and brand trackings
- Custom features per plan

**Entitlements:**
- Plan-based entitlements
- Feature-specific overrides (grant/deny individual features)
- Temporary feature access with expiration
- Usage tracking and alerts
- Soft/hard limits with enforcement

**Billing Integration:**
- Stripe payments
- Monthly and yearly billing
- Trial periods
- Subscription management
- MRR/ARR tracking
- Usage-based billing (future)

### 3.13 Data Integration & Sources

**Data Sources:**
- Types: API, DATABASE, FILE_UPLOAD, WEBHOOK, INTEGRATION
- Status tracking: PENDING, CONNECTED, ERROR, DISABLED
- Connection configuration management
- Sync scheduling and status
- Error handling and retry

**GWI Integration:**
- **Spark MCP API** - Conversational AI queries over GWI data
- **Spark API** - Quick insights generation
- **Platform API** - Audience creation and data fetching
- **Crosstab Generation** - Multi-dimensional analysis

### 3.14 API & Integration Management

**API Keys:**
- Organization and user-scoped keys
- Bearer token authentication
- Permissions-based scoping
- Rate limiting per key
- Expiration support
- Usage tracking

**OAuth Clients:**
- Confidential (server-to-server)
- Public (SPAs, mobile)
- Service (machine-to-machine)
- Redirect URI configuration
- Scope management
- Grant types

**Webhooks:**
- Event-based delivery
- Retry policies and handling
- Request signing and verification
- Delivery statistics
- Health monitoring
- Auto-disabling on repeated failures

**Integration Apps:**
- Marketplace of integrations
- Categories: Productivity, Communication, Project Management, CRM, Analytics, etc.
- Installation and uninstallation
- Configuration per install
- Rating and reviews
- Official vs. community apps

### 3.15 Audit & Security

**Audit Logging:**
- Organization-level audit logs
- Action tracking with metadata
- User and resource identification
- IP address and user agent capture
- Comprehensive action history
- Queryable and exportable

**Platform Audit Logs:**
- Super admin actions
- Targeted organization and user impacts
- Changes to critical configurations
- Full traceability

**Hierarchy Audit:**
- Organization hierarchy changes
- Relationship creations/modifications
- Access grants and revocations
- Settings inheritance tracking

**Change Tracking:**
- Entity version control
- Delta tracking
- Entity-level history
- Rollback support

### 3.16 Enterprise Features

**SSO & Identity Management:**
- SAML 2.0 support
- OIDC support
- Azure AD, Okta, Google Workspace integration
- Domain-based auto-join
- SSO enforcement per domain
- Custom attribute mapping
- JIT (Just-In-Time) provisioning

**SCIM Integration:**
- User provisioning and deprovisioning
- Group/team synchronization
- Auto-deactivation of removed users
- Default role assignment
- Sync error tracking

**Device Trust & MDM:**
- Device registration and trust
- Platform compliance checking
- Biometric authentication support
- Device encryption requirements
- EMM/MDM integration
- Device blocking on policy violation

**Security Policies:**
- Password policies
- Session timeout
- MFA requirements
- IP allowlisting/blocklisting
- Data access restrictions
- File sharing policies
- External sharing controls
- DLP (Data Loss Prevention)
- Encryption requirements
- API access policies
- Data retention policies

**Compliance & Legal:**
- SOC2, HIPAA, GDPR compliance frameworks
- Attestation tracking
- Compliance audits (internal/external)
- Legal holds for litigation support
- Data export (GDPR, eDiscovery)
- Data retention and deletion policies
- Regulatory requirement tracking

**Incident Management:**
- Incident tracking and response
- Severity levels (MINOR, MODERATE, MAJOR, CRITICAL)
- Status workflow (INVESTIGATING, IDENTIFIED, MONITORING, RESOLVED, POSTMORTEM)
- Timeline and root cause documentation
- Public status page updates
- Affected service and organization tracking

### 3.17 Admin Portal

**Super Admin Capabilities:**
- Organization management (create, suspend, delete)
- User management and banning
- Plan and billing management
- Feature flag control
- System rule configuration
- Security policy enforcement
- Compliance and audit management
- Support ticket management
- Health monitoring

**Dynamic Admin Roles:**
- Custom role definitions at platform level
- System roles (SUPER_ADMIN, ADMIN, SUPPORT, ANALYST)
- Granular permissions per role
- Role hierarchy and inheritance
- Audit trail for role changes

**Platform Operations:**
- Release management with staged rollouts
- Maintenance windows scheduling
- Incident management and tracking
- Capacity monitoring and alerts
- System rules and automation
- Feature flags and gradual rollouts
- Performance monitoring

**Customer Support:**
- Support ticket system
- Categories: BILLING, TECHNICAL, FEATURE_REQUEST, BUG_REPORT, ACCOUNT, SECURITY
- Priority levels and SLAs
- Assignment and routing
- Ticket responses and internal notes
- Resolution tracking

---

## 4. KEY COMPONENTS & THEIR RESPONSIBILITIES

### 4.1 Core Services

| Service | Responsibility |
|---------|-----------------|
| **Agent Service** | Agent creation, execution, status management, run tracking |
| **Workflow Engine** | Workflow orchestration, scheduling, multi-agent execution |
| **Tool Registry** | Tool definition, validation, execution, parameter resolution |
| **LLM Service** | LLM provider abstraction, token tracking, retry logic, tool calling |
| **Report Generator** | Report creation, PDF generation, formatting, export |
| **Memory Service** | Context storage, retrieval, TTL management, deduplication |
| **Hierarchy Service** | Org hierarchy management, relationship handling, queries |
| **Billing Service** | Usage tracking, limit enforcement, subscription management |
| **Audit Service** | Event logging, audit trail maintenance, compliance tracking |
| **Change Tracking** | Version history, delta tracking, change summaries |
| **Features Service** | Feature gating, entitlement checking, usage limits |
| **Permissions Service** | Role checking, permission validation, inheritance |
| **Email Service** | Transactional email, notifications, templates |
| **Rate Limiter** | Request rate limiting, quota management per plan |

### 4.2 API Middleware

| Middleware | Purpose |
|-----------|---------|
| **withOrganization** | Multi-tenant context extraction and enforcement |
| **withRole** | Role-based authorization checking |
| **withAuth** | Session and API key authentication |
| **checkRateLimit** | Rate limiting enforcement |
| **recordUsage** | Usage metric tracking |
| **logAudit** | Automatic audit event creation |

### 4.3 Frontend Components

**Major Component Categories:**
- **UI Base Components** - Reusable Radix/shadcn components (Button, Input, Card, Dialog, etc.)
- **Layout Components** - Header, Sidebar, Navigation, Breadcrumbs
- **Dashboard Components** - Overview cards, metrics, charts, widgets
- **Agent Components** - Agent list, editor, run history, results
- **Workflow Components** - Workflow builder, executor, run tracker
- **Report Components** - Report viewer, builder, export dialog
- **Audience Components** - Audience builder, editor, comparison
- **Crosstab Components** - Crosstab builder, results viewer
- **Chart Components** - Chart editor, visualization
- **Settings Components** - User, organization, security, team settings
- **Admin Components** - Super admin dashboard, org management, role management
- **Integrations Components** - Integration marketplace, installation UI
- **Brand Tracking Components** - Brand health dashboard, snapshot viewer

---

## 5. DATABASE SCHEMA & DATA MODELS

### 5.1 Core Domain Models (60+ models total)

#### Authentication & Users
- **User** - User accounts with auth details
- **Account** - OAuth provider accounts
- **Session** - Active sessions
- **VerificationToken** - Email verification tokens

#### Organizations & Hierarchy
- **Organization** - Main org entity with hierarchy support
- **OrganizationMember** - User memberships with roles
- **OrgRelationship** - Cross-org relationships (partnership, ownership, etc.)
- **SharedResourceAccess** - Resource sharing between orgs
- **RoleInheritanceRule** - Rules for role propagation in hierarchy
- **HierarchyAuditLog** - Changes to org hierarchy
- **HierarchyTemplate** - Pre-built org structures
- **CrossOrgInvitation** - Cross-organization invitations

#### Agents & Workflows
- **Agent** - Agent definitions
- **AgentRun** - Individual agent execution records
- **Workflow** - Workflow definitions
- **WorkflowRun** - Workflow execution records
- **DataSource** - External data source connections

#### Data & Insights
- **Insight** - Generated insights from agent runs
- **Audience** - Audience segment definitions
- **Crosstab** - Multi-dimensional analysis results
- **Chart** - Chart configurations and data
- **Dashboard** - Dashboard widget collections
- **Report** - Report definitions and content
- **Memory** - Agent and organization context storage
- **ToolMemory** - Cached tool execution results

#### Brand Tracking
- **BrandTracking** - Brand monitoring setup
- **BrandTrackingSnapshot** - Point-in-time brand metrics

#### Templates & Reusables
- **Template** - Prompt/workflow templates

#### Billing & Entitlements
- **BillingSubscription** - Stripe subscription tracking
- **Plan** - Pricing plan definitions
- **Feature** - Feature definitions
- **PlanFeature** - Features per plan
- **TenantEntitlement** - Organization-specific entitlements
- **UsageRecord** - Usage metrics tracking

#### Security & Compliance
- **SSOConfiguration** - SSO provider configuration
- **EnterpriseSSO** - SAML/OIDC SSO setup
- **SCIMIntegration** - SCIM provisioning config
- **TrustedDevice** - Device trust management
- **DevicePolicy** - Device requirements
- **SecurityPolicy** - Security policy definitions
- **SecurityViolation** - Policy violation tracking
- **ThreatEvent** - Security threat tracking
- **IPBlocklist** - IP blocking rules
- **ComplianceFramework** - Compliance framework definitions
- **ComplianceAttestation** - Compliance attestation status
- **ComplianceAudit** - Compliance audit records
- **LegalHold** - Legal hold for litigation
- **DataExport** - Data export requests
- **DataRetentionPolicy** - Data lifecycle policies

#### API & Integration Management
- **ApiKey** - API key authentication
- **APIClient** - OAuth clients
- **WebhookEndpoint** - Webhook subscriptions
- **WebhookDelivery** - Webhook delivery tracking
- **IntegrationApp** - Marketplace apps
- **IntegrationInstall** - App installations

#### Super Admin & Platform
- **SuperAdmin** - Platform super admins
- **SuperAdminSession** - Super admin sessions
- **AdminRole** - Dynamic role definitions
- **Permission** - Permission registry
- **RoleAuditLog** - Role change tracking
- **FeatureFlag** - Feature flags for gradual rollout
- **SystemRule** - Automated system rules
- **UserBan** - User ban tracking
- **SupportTicket** - Support ticket system
- **TicketResponse** - Support ticket responses
- **TenantHealthScore** - Org health metrics
- **PlatformAuditLog** - Platform-level audit

#### Notifications & Communications
- **SystemNotification** - System-wide notifications
- **BroadcastMessage** - Broadcast messages to users
- **SystemConfig** - System configuration

#### Operations & Monitoring
- **PlatformIncident** - Incident tracking
- **IncidentUpdate** - Incident status updates
- **MaintenanceWindow** - Scheduled maintenance
- **ReleaseManagement** - Release tracking
- **CapacityMetric** - Infrastructure metrics

#### Domain Management
- **DomainVerification** - Domain verification for white-labeling
- **OrganizationSuspension** - Suspension management

#### Analytics & Reporting
- **AnalyticsSnapshot** - Platform metrics snapshots
- **CustomReport** - Custom admin reports
- **EntityVersion** - Entity version control
- **AnalysisHistory** - Analysis result history
- **ChangeSummary** - Periodic change summaries
- **UserChangeTracker** - User change tracking
- **ChangeAlert** - Change notifications

---

## 6. AUTHENTICATION & AUTHORIZATION APPROACH

### 6.1 Authentication Mechanisms

**Session-Based (Browser):**
- NextAuth.js v5 with JWT and database sessions
- Secure HTTP-only cookies
- Session duration configurable
- Session token storage in database

**API Key-Based (Programmatic):**
- Bearer token in Authorization header
- SHA-256 hashing for key storage
- Key prefix for identification
- Organization-scoped permissions
- Per-key rate limiting

**OAuth 2.0:**
- Google OAuth (id_token flow)
- Azure AD / Microsoft Entra ID
- Multi-provider support

**SSO (Enterprise):**
- SAML 2.0 support
- OIDC support
- Custom metadata URL configuration
- Attribute mapping
- JIT provisioning

**MFA (Multi-Factor Authentication):**
- TOTP support
- Backup codes
- Device trust integration
- Platform-wide enforcement option

### 6.2 Authorization Model

**Role-Based Access Control (RBAC):**
```
User -> OrganizationMember (role: OWNER | ADMIN | MEMBER | VIEWER)
     -> Dynamic AdminRole (for super admins)
```

**Permission System:**
- Resource-based permissions (e.g., "agents:create", "workflows:delete")
- Role-permission mapping
- Permission categories for organization
- Inheritance in org hierarchy

**Feature-Based Entitlements:**
- Plan determines available features
- Tenant-specific overrides possible
- Feature values: BOOLEAN, NUMBER, STRING, JSON
- Usage tracking and soft/hard limits

**Token & Key Management:**
- API key expiration
- Rate limits per key
- Permission scopes per key
- Usage tracking and audit

### 6.3 Multi-Tenancy Enforcement

**Request-Level Isolation:**
- Organization ID from header (`x-organization-id`) or cookies
- All queries scoped to organization
- Cross-org access explicitly tracked
- Audit logging of cross-org actions

**Data Isolation:**
- Organization foreign keys on all primary resources
- Soft multi-tenancy (not hard isolation, but enforced at application layer)
- Shared resources explicitly modeled
- Hierarchy-aware queries

**Access Control Layers:**
1. Authentication (user identity verified)
2. Membership (user member of org)
3. Authorization (user has permission in org)
4. Feature entitlement (org has feature access)
5. Rate limiting (org within quota)

---

## 7. API STRUCTURE & ENDPOINTS

### 7.1 API Organization

**Base URL:** `/api`
**Current Version:** v1
**Auth Header:** `x-organization-id` (required for authenticated routes)

### 7.2 Core API Endpoint Groups (71 route handlers)

| Endpoint Group | Count | Purpose |
|---|---|---|
| Agents | 4+ | Create, list, read, update agents |
| Workflows | 4+ | Manage workflow definitions |
| Reports | 6+ | Generate, list, view, export reports |
| Agents & Analytics | Multiple | Analytics and insights |
| Audiences | 6+ | Audience management and analysis |
| Crosstabs | 4+ | Multi-dimensional analysis |
| Charts | 4+ | Chart management |
| Dashboards | 4+ | Dashboard widgets |
| Brand Tracking | 4+ | Brand health monitoring |
| Templates | 6+ | Template management |
| Memory | 3+ | Context storage access |
| GWI Integration | 5+ | GWI platform API proxying |
| Hierarchy | 6+ | Org hierarchy operations |
| Billing | 4+ | Plan and usage endpoints |
| Organization | 6+ | Org management |
| Team | 4+ | Team member management |
| Users | 3+ | User management |
| Settings | 4+ | Configuration endpoints |
| API Keys | 3+ | API key management |
| Webhooks | 3+ | Webhook management |
| Integrations | 4+ | Integration marketplace |
| Evolution | 3+ | Historical analysis tracking |
| Audit | 3+ | Audit log access |
| Chat | 2+ | Real-time chat |
| Data Sources | 2+ | Data integration |
| Notifications | 3+ | Notification management |
| Admin | Many | Platform admin operations |
| Auth | 6+ | Authentication endpoints |

### 7.3 Sample API Endpoint Patterns

```
GET    /api/v1/agents                    # List agents
POST   /api/v1/agents                    # Create agent
GET    /api/v1/agents/:id                # Get agent
PUT    /api/v1/agents/:id                # Update agent
DELETE /api/v1/agents/:id                # Delete agent
POST   /api/v1/agents/:id/runs           # Run agent

GET    /api/v1/workflows                 # List workflows
POST   /api/v1/workflows                 # Create workflow
POST   /api/v1/workflows/:id/runs        # Execute workflow

GET    /api/v1/audiences                 # List audiences
POST   /api/v1/audiences                 # Create audience
POST   /api/v1/audiences/:id/estimate    # Estimate size
POST   /api/v1/audiences/:id/lookalike   # Lookalike analysis

POST   /api/v1/crosstabs                 # Create crosstab
GET    /api/v1/crosstabs/:id             # Get results

GET    /api/v1/organization              # Get org details
GET    /api/v1/organization/plan         # Get plan info
GET    /api/v1/organization/usage        # Get usage metrics
GET    /api/v1/organization/features     # List features

GET    /api/v1/audit                     # Audit log access
GET    /api/v1/api-keys                  # Manage API keys

POST   /api/gwi/spark-mcp/query          # GWI Spark MCP queries
POST   /api/gwi/platform/audiences       # GWI audience creation
POST   /api/gwi/platform/crosstab        # GWI crosstab generation
```

### 7.4 Authentication & Authorization

**Required Headers:**
```
Authorization: Bearer gwi_live_xxxx... (for API keys)
x-organization-id: org_xxxx...         (organization context)
```

**Rate Limiting (per plan tier):**
- Starter: 100 req/min
- Professional: 500 req/min
- Enterprise: 2,000 req/min

**Response Headers:**
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1704067200000
```

### 7.5 Error Handling

**Standard Error Response:**
```json
{
  "error": "Permission denied",
  "code": "PERMISSION_DENIED",
  "status": 403,
  "details": {}
}
```

**Status Codes:**
- 200 OK - Success
- 201 Created - Resource created
- 204 No Content - Success with no data
- 400 Bad Request - Validation error
- 401 Unauthorized - Authentication required
- 403 Forbidden - Permission denied
- 404 Not Found - Resource not found
- 409 Conflict - Resource conflict
- 429 Too Many Requests - Rate limited
- 500 Internal Server Error - Server error

---

## 8. FRONTEND STRUCTURE & UI PATTERNS

### 8.1 Page Organization

**Public Pages (28+):**
- Landing page
- Login / Signup
- Pricing, Features
- Documentation
- Blog, Case Studies
- About, Careers
- Terms, Privacy, Security, Compliance

**Authenticated Pages (35+):**
- Dashboard home
- Agents (list, create, detail, runs)
- Workflows (list, create, detail, runs)
- Reports (list, create, view, export)
- Audiences (list, create, compare)
- Crosstabs (list, create, results)
- Charts (list, create, edit)
- Dashboards (list, create, edit)
- Brand Tracking (list, create, snapshots)
- Templates (list, browse, use)
- Memory Browser
- Notifications & Inbox
- Playground (agent testing)
- Store (agent marketplace)

**Settings Pages (10+):**
- Profile
- Organization Settings
- Team Management
- Billing & Plans
- API Keys
- Security & Authentication
- Appearance & Preferences
- Integrations
- Notification Preferences

**Admin Pages (25+):**
- Organizations Management
- Users & Roles
- Billing & Plans
- Feature Flags
- Security Policies
- Compliance & Audits
- Incidents & Operations
- Support Tickets
- Integrations Marketplace
- System Configuration
- Health & Monitoring

### 8.2 Component Architecture

**UI Primitive Components:**
- Button, Input, Textarea, Label
- Card, Badge, Avatar
- Tabs, Dialog, Sheet
- Dropdown Menu, Select
- Checkbox, Radio, Switch, Slider
- Progress, Skeleton
- Accordion, Scroll Area
- Table, Separator, Tooltip

**Composite Components:**
- Forms with validation
- Charts with Recharts
- Data tables with sorting/filtering
- Modals and dialogs
- Sidebar navigation
- Command palette (cmdk)
- Toast notifications (Sonner)

**Layout Patterns:**
- Responsive grid layouts
- Sidebar + main content
- Header with breadcrumbs
- Tab-based navigation
- Drawer panels (Vaul)
- Resizable panels (react-resizable-panels)

### 8.3 State Management

**Server-Side State:**
- Next.js Server Components
- Data fetching at component level
- Incremental Static Regeneration (ISR)

**Client-Side State:**
- React Context for global state
- SWR for data caching and revalidation
- React Hook Form for form state
- Local component state with useState

**Real-Time Updates:**
- WebSocket connections (future)
- Server-Sent Events (SSE)
- SWR polling with configurable intervals

### 8.4 Design System & Theming

**Styling:**
- Tailwind CSS v4
- Custom design tokens
- Dark mode support
- Responsive breakpoints
- CSS variables for theming

**Color Palette:**
- Primary, Secondary, Accent colors
- Neutral grayscale
- Semantic colors (success, warning, danger)
- Dark mode variants

**Typography:**
- System font stack
- Standardized sizing (xs, sm, base, lg, xl, 2xl)
- Font weights (400, 500, 600, 700)

---

## 9. INTEGRATION POINTS (External Services & APIs)

### 9.1 Third-Party Service Integrations

| Service | Purpose | Integration Type |
|---------|---------|------------------|
| **Stripe** | Billing & payments | Webhook + API |
| **Resend** | Transactional email | API |
| **Anthropic (Claude)** | Primary LLM | API |
| **OpenAI** | Secondary LLM option | API |
| **GWI Platform API** | Consumer research data | REST API |
| **GWI Spark API** | Quick insights | REST API |
| **GWI Spark MCP** | Conversational queries | API |
| **Upstash Redis** | Caching & rate limiting | REST API |
| **S3** | File storage | AWS SDK |
| **Vercel** | Hosting & deployment | Platform |
| **PostgreSQL** | Database | SQL |
| **Sentry** | Error tracking | SDK |
| **Next.js Auth** | Authentication | Built-in |

### 9.2 GWI Integration Details

**Spark MCP (Model Context Protocol):**
- Conversational AI queries over GWI data
- Natural language questions
- Real-time data access

**Spark API:**
- Quick insights generation
- Topic-based analysis
- Audience insights

**Platform API:**
- Audience creation and management
- Data fetching with metrics
- Crosstab generation
- Complex demographic filtering

**Data Available:**
- Demographic data
- Behavioral profiles
- Psychographic information
- Interest and affinity data
- Device and platform usage
- Geo-location insights
- Market and trend data

### 9.3 Webhook Integrations

**Inbound Webhooks:**
- Stripe payment events
- GitHub push events (CI/CD)
- External data source webhooks
- Custom integration webhooks

**Outbound Webhooks:**
- Agent completion events
- Report generation events
- Workflow execution events
- Change notifications
- Alert triggers

### 9.4 OAuth & SSO Providers

**Consumer SSO:**
- Google OAuth
- Microsoft (Azure AD)

**Enterprise SSO:**
- SAML 2.0 compliant providers
- OIDC compliant providers
- Azure AD / Entra ID
- Okta
- Google Workspace
- OneLogin
- Ping Identity

### 9.5 Email Service Integration

**Via Resend:**
- Welcome emails
- Password reset emails
- Invitation emails
- Notification emails
- Report delivery emails
- Alert notifications

---

## 10. UNIQUE & COMPLEX FEATURES

### 10.1 Multi-Level Organization Hierarchy

**Complexity Aspects:**
- Support for 10+ different organization types
- Arbitrary nesting depth (with configurable max)
- Multiple relationship types between organizations
- Resource sharing across hierarchies
- Permission inheritance with rules
- Consolidated billing across organizations
- Efficient queries using materialized paths

**Real-World Use Cases:**
- **Agency Structure:** Agency -> Client (with management permissions)
- **Holding Company:** Holding -> Subsidiary -> Brand -> Sub-brand
- **Franchise Network:** Franchiser -> Multiple Franchise Locations
- **Reseller Channel:** Reseller -> End Customers
- **Enterprise:** Headquarters -> Divisions -> Departments

### 10.2 Advanced AI Agent Orchestration

**Complexity Aspects:**
- Multi-step agent pipelines with data flow
- LLM tool calling with function definitions
- Context management across steps
- Token tracking and budgeting
- Retry logic with exponential backoff
- Memory persistence for long-running tasks
- Integration with multiple LLM providers
- Custom tool registry system

**Advanced Capabilities:**
- Agent composition (agents calling other agents)
- Conditional branching (future)
- Scheduled execution
- Real-time streaming responses
- Error handling and recovery
- Cost optimization

### 10.3 Entitlement & Feature Flag System

**Complexity Aspects:**
- Hierarchical plan system (Starter -> Professional -> Enterprise)
- Per-feature value definitions (boolean, numeric, string, JSON)
- Tenant-specific feature overrides
- Feature value defaults and customization
- Feature expiration (temporary access)
- Usage-based limits with enforcement
- Soft-limits (warnings) vs. hard-limits (blocking)
- Feature inheritance in hierarchy

**Real-World Scenarios:**
- Plan A has "5 dashboards", Plan B has "20 dashboards"
- Customer granted temporary access to "advanced analytics" until date X
- Enterprise customer given unlimited "agent runs" despite Starter base plan
- System blocks report creation when org hits monthly report limit

### 10.4 Change Tracking & Notification System

**Complexity Aspects:**
- Full version history with delta tracking
- Change-based alerts with severity levels
- Aggregated change summaries (daily/weekly/monthly)
- Anomaly detection
- Per-user change tracking preferences
- Threshold-based alerts
- Change impact scoring

**Real-World Usage:**
- "Alert when brand health drops >5%"
- "Weekly summary of all audience changes"
- "Notify me when crosstab results have significant shift"
- "Archive old versions automatically after 6 months"

### 10.5 Enterprise Security & Compliance

**Complexity Aspects:**
- Multi-layer security policies (password, MFA, IP allowlist, etc.)
- Device trust management and MDM integration
- Policy enforcement modes (monitor, warn, enforce, strict)
- Automated threat detection and response
- Legal hold for litigation support
- GDPR data subject request handling
- Compliance framework attestation
- Incident management with timeline tracking

**Real-World Scenarios:**
- Enforce MFA for enterprise customers only
- Automatically block access from non-approved IPs
- Detect impossible travel (login from two locations)
- Prevent data exfiltration via DLP policies
- Support eDiscovery with legal holds
- Maintain compliance certifications (SOC2, HIPAA, GDPR)

### 10.6 Multi-Tenant Resource Sharing

**Complexity Aspects:**
- Fine-grained permissions per resource (view, edit, delete, re-share)
- Scope control (read-only, full-access, inherit)
- Expiration dates on shares
- Propagation rules (share with children)
- Resource type specificity
- Cross-org relationship awareness
- Audit trail for all access

**Supported Shared Resources:**
- Templates
- Audiences
- Data sources
- Brand tracking setups
- Workflows
- Agents
- Charts

### 10.7 Intelligent Change Detection

**Complexity Aspects:**
- Automated anomaly detection across metrics
- Smart threshold calculation based on history
- Trend reversal detection
- Change severity calculation
- Contextual change summaries
- User-specific change notifications
- Historical change tracking

**Examples:**
- Audience size changes by >20%
- Brand sentiment reverses direction
- Crosstab metric moves outside normal range
- New data available for watched entities

### 10.8 Role-Based Hierarchy Inheritance

**Complexity Aspects:**
- Rules for parent-to-child role mapping
- Conditional inheritance based on org type
- Approval workflows for inherited roles
- Multi-level inheritance (grandparent -> parent -> child)
- Directional control (inherit up/down)
- Priority-based rule evaluation
- Dynamic role generation

**Real Scenario:**
- Child org inherits parent org's ADMIN as child's MEMBER
- Sub-brand inherits brand's OWNER as Sub-brand's ADMIN
- Franchise inherits Franchiser's permissions conditionally

---

## 11. KEY TECHNICAL DECISIONS

### 11.1 Frontend Architecture
- **Server Components as Default** - Reduces client JS, improves performance
- **SWR for Data** - Handles caching, revalidation, and synchronization
- **Component Composition** - Building blocks over kitchen-sink components
- **Tailwind CSS** - Utility-first styling for rapid iteration

### 11.2 Backend Architecture
- **Next.js Route Handlers** - Unified frontend/backend in same codebase
- **Prisma ORM** - Type-safe database access with migrations
- **Middleware Stack** - Clean separation of authentication, authorization, rate limiting
- **Tool Registry Pattern** - Dynamic tool management for agents

### 11.3 Data Management
- **PostgreSQL Primary** - ACID compliance, JSON support, reliability
- **Redis Caching** - Session storage, rate limiting, temporary data
- **Soft Multi-Tenancy** - Application-level enforcement vs. database-level
- **Version Control** - Entity versioning for audit and rollback

### 11.4 Security Approach
- **Defense in Depth** - Multiple layers of auth, authorization, rate limiting
- **Audit Everything** - Comprehensive logging for compliance
- **Encryption at Rest** - Database encryption, key management
- **HTTPS Only** - Transport security enforced
- **SameSite Cookies** - CSRF protection

---

## 12. DEPLOYMENT & INFRASTRUCTURE

### 12.1 Deployment Platforms

**Primary:**
- Vercel (edge runtime, auto-scaling, DX-focused)

**Alternative:**
- Render (self-hosted, PostgreSQL included)
- Docker containerization support

### 12.2 Environment Configuration

**Build Environments:**
- Development (full Sentry, hot reload)
- Staging (production-like, for testing)
- Production (optimized, monitoring enabled)

**Memory-Constrained Builds:**
- Disabled source maps
- Reduced parallelism
- No Sentry webpack plugin
- ~200-300MB memory savings

### 12.3 Monitoring & Observability

- **Sentry** - Error tracking, performance monitoring
- **Custom Metrics** - Usage, capacity, health metrics
- **Structured Logging** - JSON logs for parsing
- **Health Checks** - `/api/health` endpoint

### 12.4 Database Migrations

- **Prisma Migrate** - Schema versioning
- **Automatic Seed** - Development data population
- **Backward Compatible** - Migrations never break existing code

### 12.5 CI/CD Pipeline

- **Linting:** ESLint, TypeScript type checking
- **Testing:** Vitest unit tests, Playwright E2E tests
- **Build:** Next.js build with optimizations
- **Deployment:** Automated to production on main branch

---

## 13. PERFORMANCE TARGETS

| Metric | Target | Importance |
|--------|--------|-----------|
| Page Load Time | < 2.5s (p95) | High |
| API Response Time | < 500ms (p95) | High |
| Agent Execution | < 30 seconds | High |
| Report Generation | < 2 minutes | Medium |
| Crosstab Generation | < 10 seconds | Medium |
| Platform Uptime | 99.9% | Critical |
| Citation Accuracy | > 95% | Critical |
| Mobile Optimization | LCP < 2.5s | High |

---

## 14. TESTING STRATEGY

**Unit Tests:**
- Business logic (agents, workflows, billing)
- Utility functions
- Permission checking
- Entitlement validation

**Integration Tests:**
- API endpoint testing
- Database operations
- Multi-step workflows
- Authentication flows

**E2E Tests:**
- Critical user journeys
- Agent creation and execution
- Report generation
- Workflow execution

**Load Testing:**
- Concurrent user simulation
- Rate limiting verification
- Database performance

---

## SUMMARY

This is a comprehensive enterprise SaaS platform combining:
1. **AI Agent Orchestration** - Multi-LLM, tool-calling, memory management
2. **Research Intelligence** - GWI integration, audience analysis, brand tracking
3. **Enterprise Architecture** - Multi-tenant, hierarchies, complex relationships
4. **Security & Compliance** - SSO, SCIM, policies, legal holds, compliance frameworks
5. **Sophisticated Entitlements** - Feature flags, usage limits, plan management
6. **Advanced Change Tracking** - Versioning, anomaly detection, smart notifications
7. **Integration Hub** - APIs, webhooks, OAuth, marketplace

**Total Scope:** 60+ database models, 71+ API endpoints, 25+ admin pages, 35+ user pages, comprehensive test coverage, production-ready infrastructure.

This document provides sufficient detail for a complete rebuild from scratch.
