# GWI AI Agent Framework - Enterprise SaaS Transformation

## Project Overview

**Repository:** https://github.com/kevin-owens-product/v0-gwi-ai-agent-framework  
**Current State:** v0-generated Next.js MVP deployed on Vercel  
**Target State:** Production-ready enterprise SaaS platform on Render  
**Workflow:** Uses prd-to-deploy skill for orchestration

---

## Mission

Transform the GWI AI Agent Framework from a v0 prototype into a fully-functional, enterprise-grade SaaS platform. The platform automates insights processes through AI agents across multiple use cases. This transformation adds multi-tenancy, authentication, RBAC, audit logging, billing, and enterprise security—then deploys to Render with Postgres.

---

## Phase 1: Discovery & Codebase Analysis

### 1.1 Clone and Analyze Repository

```bash
git clone https://github.com/kevin-owens-product/v0-gwi-ai-agent-framework.git
cd v0-gwi-ai-agent-framework
```

**Analyze and document:**
- Current file structure and routing patterns
- Existing components in `/components` (shadcn/ui inventory)
- Utility functions in `/lib`
- Any API routes in `/app/api`
- Current styling approach in `/styles`
- Dependencies in `package.json`

### 1.2 Identify Preservation vs Replacement

**Preserve:**
- Core agent UI components and workflows
- Insights visualization components
- shadcn/ui component library setup
- Tailwind configuration
- Any working business logic

**Replace/Add:**
- Vercel-specific configurations → Render-compatible
- Add database layer (currently none)
- Add authentication system
- Add multi-tenancy architecture
- Add enterprise features

### 1.3 Architecture Decision Record

Create `/docs/architecture/ADR-001-enterprise-transformation.md` documenting:
- Current architecture assessment
- Target architecture design
- Migration strategy
- Risk mitigation approach

---

## Phase 2: Database Layer (Render Postgres)

### 2.1 Prisma Schema

Create `prisma/schema.prisma`:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ==================== MULTI-TENANCY ====================

model Organization {
  id          String   @id @default(cuid())
  name        String
  slug        String   @unique
  planTier    PlanTier @default(STARTER)
  settings    Json     @default("{}")
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  members       OrganizationMember[]
  agents        Agent[]
  dataSources   DataSource[]
  insights      Insight[]
  auditLogs     AuditLog[]
  usageRecords  UsageRecord[]
  apiKeys       ApiKey[]
  ssoConfig     SSOConfiguration?
  subscription  BillingSubscription?
  invitations   Invitation[]
}

model OrganizationMember {
  id        String   @id @default(cuid())
  orgId     String
  userId    String
  role      Role     @default(MEMBER)
  invitedBy String?
  joinedAt  DateTime @default(now())

  organization Organization @relation(fields: [orgId], references: [id], onDelete: Cascade)
  user         User         @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([orgId, userId])
  @@index([orgId])
  @@index([userId])
}

enum PlanTier {
  STARTER
  PROFESSIONAL
  ENTERPRISE
}

enum Role {
  OWNER
  ADMIN
  MEMBER
  VIEWER
}

// ==================== USERS & AUTH ====================

model User {
  id            String    @id @default(cuid())
  email         String    @unique
  name          String?
  avatarUrl     String?
  passwordHash  String?
  emailVerified DateTime?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  memberships   OrganizationMember[]
  sessions      Session[]
  accounts      Account[]
  apiKeys       ApiKey[]
  auditLogs     AuditLog[]
  agentsCreated Agent[]
}

model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text
  session_state     String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
  @@index([userId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  ipAddress    String?
  userAgent    String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
}

model SSOConfiguration {
  id          String  @id @default(cuid())
  orgId       String  @unique
  provider    String  // 'saml' | 'oidc'
  metadataUrl String?
  clientId    String?
  clientSecret String?
  enabled     Boolean @default(false)

  organization Organization @relation(fields: [orgId], references: [id], onDelete: Cascade)
}

// ==================== AGENT FRAMEWORK CORE ====================

model Agent {
  id            String      @id @default(cuid())
  orgId         String
  name          String
  description   String?
  type          AgentType
  configuration Json        @default("{}")
  status        AgentStatus @default(DRAFT)
  createdBy     String
  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt

  organization Organization @relation(fields: [orgId], references: [id], onDelete: Cascade)
  creator      User         @relation(fields: [createdBy], references: [id])
  runs         AgentRun[]

  @@index([orgId])
  @@index([createdBy])
}

enum AgentType {
  RESEARCH
  ANALYSIS
  REPORTING
  MONITORING
  CUSTOM
}

enum AgentStatus {
  DRAFT
  ACTIVE
  PAUSED
  ARCHIVED
}

model AgentRun {
  id          String        @id @default(cuid())
  agentId     String
  orgId       String
  input       Json
  output      Json?
  status      AgentRunStatus @default(PENDING)
  tokensUsed  Int           @default(0)
  startedAt   DateTime      @default(now())
  completedAt DateTime?
  errorMessage String?

  agent    Agent     @relation(fields: [agentId], references: [id], onDelete: Cascade)
  insights Insight[]

  @@index([agentId])
  @@index([orgId])
  @@index([status])
}

enum AgentRunStatus {
  PENDING
  RUNNING
  COMPLETED
  FAILED
  CANCELLED
}

model DataSource {
  id               String           @id @default(cuid())
  orgId            String
  name             String
  type             DataSourceType
  connectionConfig Json             @default("{}")
  lastSync         DateTime?
  status           DataSourceStatus @default(PENDING)
  createdAt        DateTime         @default(now())
  updatedAt        DateTime         @updatedAt

  organization Organization @relation(fields: [orgId], references: [id], onDelete: Cascade)

  @@index([orgId])
}

enum DataSourceType {
  API
  DATABASE
  FILE_UPLOAD
  WEBHOOK
  INTEGRATION
}

enum DataSourceStatus {
  PENDING
  CONNECTED
  ERROR
  DISABLED
}

model Insight {
  id              String   @id @default(cuid())
  orgId           String
  agentRunId      String?
  type            String
  title           String
  data            Json
  confidenceScore Float?
  createdAt       DateTime @default(now())

  organization Organization @relation(fields: [orgId], references: [id], onDelete: Cascade)
  agentRun     AgentRun?    @relation(fields: [agentRunId], references: [id])

  @@index([orgId])
  @@index([agentRunId])
}

// ==================== ENTERPRISE FEATURES ====================

model AuditLog {
  id           String   @id @default(cuid())
  orgId        String
  userId       String?
  action       String
  resourceType String
  resourceId   String?
  metadata     Json     @default("{}")
  ipAddress    String?
  userAgent    String?
  timestamp    DateTime @default(now())

  organization Organization @relation(fields: [orgId], references: [id], onDelete: Cascade)
  user         User?        @relation(fields: [userId], references: [id])

  @@index([orgId])
  @@index([userId])
  @@index([timestamp])
  @@index([action])
}

model UsageRecord {
  id         String    @id @default(cuid())
  orgId      String
  metricType UsageMetric
  quantity   Int
  recordedAt DateTime  @default(now())

  organization Organization @relation(fields: [orgId], references: [id], onDelete: Cascade)

  @@index([orgId])
  @@index([metricType])
  @@index([recordedAt])
}

enum UsageMetric {
  AGENT_RUNS
  TOKENS_CONSUMED
  API_CALLS
  DATA_SOURCES
  TEAM_SEATS
  STORAGE_GB
}

model BillingSubscription {
  id                   String             @id @default(cuid())
  orgId                String             @unique
  stripeCustomerId     String?
  stripeSubscriptionId String?
  planId               String
  status               SubscriptionStatus @default(TRIALING)
  currentPeriodEnd     DateTime?
  cancelAtPeriodEnd    Boolean            @default(false)
  createdAt            DateTime           @default(now())
  updatedAt            DateTime           @updatedAt

  organization Organization @relation(fields: [orgId], references: [id], onDelete: Cascade)
}

enum SubscriptionStatus {
  TRIALING
  ACTIVE
  PAST_DUE
  CANCELED
  UNPAID
}

model ApiKey {
  id          String    @id @default(cuid())
  orgId       String
  userId      String
  name        String
  keyPrefix   String    // First 8 chars for identification
  keyHash     String    // SHA-256 hash of full key
  permissions String[]  @default([])
  rateLimit   Int       @default(100) // requests per minute
  lastUsed    DateTime?
  expiresAt   DateTime?
  createdAt   DateTime  @default(now())

  organization Organization @relation(fields: [orgId], references: [id], onDelete: Cascade)
  user         User         @relation(fields: [userId], references: [id])

  @@index([orgId])
  @@index([keyHash])
}

model Invitation {
  id        String           @id @default(cuid())
  orgId     String
  email     String
  role      Role             @default(MEMBER)
  token     String           @unique
  status    InvitationStatus @default(PENDING)
  expiresAt DateTime
  createdAt DateTime         @default(now())

  organization Organization @relation(fields: [orgId], references: [id], onDelete: Cascade)

  @@index([orgId])
  @@index([email])
  @@index([token])
}

enum InvitationStatus {
  PENDING
  ACCEPTED
  EXPIRED
  REVOKED
}
```

### 2.2 Database Utilities

Create `lib/db.ts`:

```typescript
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export default prisma
```

---

## Phase 3: Authentication & Authorization

### 3.1 NextAuth v5 Configuration

Create `lib/auth.ts`:

```typescript
import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import Credentials from "next-auth/providers/credentials"
import Google from "next-auth/providers/google"
import MicrosoftEntraID from "next-auth/providers/microsoft-entra-id"
import bcrypt from "bcryptjs"
import { prisma } from "./db"

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null
        
        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string }
        })
        
        if (!user || !user.passwordHash) return null
        
        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.passwordHash
        )
        
        if (!isValid) return null
        
        return { id: user.id, email: user.email, name: user.name }
      }
    }),
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    MicrosoftEntraID({
      clientId: process.env.AZURE_AD_CLIENT_ID!,
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET!,
      tenantId: process.env.AZURE_AD_TENANT_ID!,
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string
      }
      return session
    },
  },
})
```

### 3.2 RBAC Permissions System

Create `lib/permissions.ts`:

```typescript
export const PERMISSIONS = {
  // Agents
  'agents:read': 'View agents',
  'agents:write': 'Create and edit agents',
  'agents:delete': 'Delete agents',
  'agents:execute': 'Run agents',
  
  // Insights
  'insights:read': 'View insights',
  'insights:export': 'Export insights',
  
  // Data Sources
  'data_sources:read': 'View data sources',
  'data_sources:write': 'Create and edit data sources',
  'data_sources:delete': 'Delete data sources',
  
  // Team
  'team:read': 'View team members',
  'team:invite': 'Invite team members',
  'team:manage': 'Manage team roles',
  
  // Billing
  'billing:read': 'View billing info',
  'billing:manage': 'Manage subscription',
  
  // Settings
  'settings:read': 'View settings',
  'settings:manage': 'Manage settings',
  
  // Audit
  'audit:read': 'View audit logs',
  
  // Admin
  'admin:*': 'Full admin access',
} as const

export type Permission = keyof typeof PERMISSIONS

export const ROLE_PERMISSIONS: Record<string, Permission[]> = {
  OWNER: ['admin:*'],
  ADMIN: [
    'agents:read', 'agents:write', 'agents:delete', 'agents:execute',
    'insights:read', 'insights:export',
    'data_sources:read', 'data_sources:write', 'data_sources:delete',
    'team:read', 'team:invite', 'team:manage',
    'settings:read', 'settings:manage',
    'audit:read',
  ],
  MEMBER: [
    'agents:read', 'agents:write', 'agents:execute',
    'insights:read',
    'data_sources:read',
    'team:read',
  ],
  VIEWER: [
    'agents:read',
    'insights:read',
  ],
}

export function hasPermission(
  userRole: string,
  requiredPermission: Permission
): boolean {
  const permissions = ROLE_PERMISSIONS[userRole] || []
  
  if (permissions.includes('admin:*')) return true
  
  return permissions.includes(requiredPermission)
}

export function hasAnyPermission(
  userRole: string,
  requiredPermissions: Permission[]
): boolean {
  return requiredPermissions.some(p => hasPermission(userRole, p))
}
```

### 3.3 Tenant Context

Create `lib/tenant.ts`:

```typescript
import { headers } from 'next/headers'
import { prisma } from './db'

export async function getCurrentOrganization() {
  const headersList = headers()
  const host = headersList.get('host') || ''
  
  // Extract subdomain (e.g., acme.gwi-insights.com -> acme)
  const subdomain = host.split('.')[0]
  
  if (!subdomain || subdomain === 'www' || subdomain === 'app') {
    return null
  }
  
  const org = await prisma.organization.findUnique({
    where: { slug: subdomain },
    include: {
      subscription: true,
      ssoConfig: true,
    }
  })
  
  return org
}

export async function getUserOrganizations(userId: string) {
  const memberships = await prisma.organizationMember.findMany({
    where: { userId },
    include: {
      organization: {
        include: {
          subscription: true,
        }
      }
    }
  })
  
  return memberships.map(m => ({
    ...m.organization,
    role: m.role,
  }))
}

export async function getUserMembership(userId: string, orgId: string) {
  return prisma.organizationMember.findUnique({
    where: {
      orgId_userId: { orgId, userId }
    }
  })
}
```

---

## Phase 4: Audit Logging

Create `lib/audit.ts`:

```typescript
import { prisma } from './db'

export interface AuditEvent {
  orgId: string
  userId?: string
  action: 'create' | 'read' | 'update' | 'delete' | 'execute' | 'export' | 'login' | 'logout' | 'invite'
  resourceType: 'agent' | 'insight' | 'data_source' | 'user' | 'settings' | 'api_key' | 'invitation' | 'organization'
  resourceId?: string
  metadata?: Record<string, any>
  ipAddress?: string
  userAgent?: string
}

export async function logAuditEvent(event: AuditEvent) {
  try {
    await prisma.auditLog.create({
      data: {
        orgId: event.orgId,
        userId: event.userId,
        action: event.action,
        resourceType: event.resourceType,
        resourceId: event.resourceId,
        metadata: event.metadata || {},
        ipAddress: event.ipAddress,
        userAgent: event.userAgent,
      }
    })
  } catch (error) {
    console.error('Failed to log audit event:', error)
  }
}

export async function getAuditLogs(
  orgId: string,
  options: {
    limit?: number
    offset?: number
    action?: string
    resourceType?: string
    userId?: string
    startDate?: Date
    endDate?: Date
  } = {}
) {
  const { limit = 50, offset = 0, action, resourceType, userId, startDate, endDate } = options
  
  const where: any = { orgId }
  
  if (action) where.action = action
  if (resourceType) where.resourceType = resourceType
  if (userId) where.userId = userId
  if (startDate || endDate) {
    where.timestamp = {}
    if (startDate) where.timestamp.gte = startDate
    if (endDate) where.timestamp.lte = endDate
  }
  
  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      include: { user: { select: { id: true, name: true, email: true } } },
      orderBy: { timestamp: 'desc' },
      take: limit,
      skip: offset,
    }),
    prisma.auditLog.count({ where })
  ])
  
  return { logs, total }
}
```

---

## Phase 5: Usage Metering & Billing

Create `lib/billing.ts`:

```typescript
import Stripe from 'stripe'
import { prisma } from './db'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
})

export const PLAN_LIMITS = {
  STARTER: {
    agentRuns: 100,
    teamSeats: 3,
    dataSources: 5,
    apiCallsPerMin: 100,
    retentionDays: 30,
  },
  PROFESSIONAL: {
    agentRuns: 1000,
    teamSeats: 10,
    dataSources: 25,
    apiCallsPerMin: 500,
    retentionDays: 90,
  },
  ENTERPRISE: {
    agentRuns: -1, // unlimited
    teamSeats: -1,
    dataSources: -1,
    apiCallsPerMin: 2000,
    retentionDays: 365,
  },
}

export async function recordUsage(
  orgId: string,
  metricType: 'AGENT_RUNS' | 'TOKENS_CONSUMED' | 'API_CALLS' | 'DATA_SOURCES' | 'TEAM_SEATS' | 'STORAGE_GB',
  quantity: number
) {
  await prisma.usageRecord.create({
    data: { orgId, metricType, quantity }
  })
}

export async function getUsageSummary(orgId: string, startDate: Date, endDate: Date) {
  const records = await prisma.usageRecord.groupBy({
    by: ['metricType'],
    where: {
      orgId,
      recordedAt: { gte: startDate, lte: endDate }
    },
    _sum: { quantity: true }
  })
  
  return records.reduce((acc, r) => {
    acc[r.metricType] = r._sum.quantity || 0
    return acc
  }, {} as Record<string, number>)
}

export async function checkUsageLimit(
  orgId: string,
  metricType: keyof typeof PLAN_LIMITS.STARTER
): Promise<{ allowed: boolean; current: number; limit: number }> {
  const org = await prisma.organization.findUnique({
    where: { id: orgId },
    select: { planTier: true }
  })
  
  const limit = PLAN_LIMITS[org?.planTier || 'STARTER'][metricType]
  
  if (limit === -1) return { allowed: true, current: 0, limit: -1 }
  
  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)
  
  const usage = await getUsageSummary(orgId, startOfMonth, new Date())
  const current = usage[metricType.toUpperCase()] || 0
  
  return { allowed: current < limit, current, limit }
}
```

---

## Phase 6: API Rate Limiting

Create `lib/rate-limit.ts`:

```typescript
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'
import { PLAN_LIMITS } from './billing'

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

export function createRateLimiter(planTier: 'STARTER' | 'PROFESSIONAL' | 'ENTERPRISE') {
  const limit = PLAN_LIMITS[planTier].apiCallsPerMin
  
  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(limit, '1 m'),
    analytics: true,
  })
}

export async function checkRateLimit(
  identifier: string,
  planTier: 'STARTER' | 'PROFESSIONAL' | 'ENTERPRISE' = 'STARTER'
) {
  const limiter = createRateLimiter(planTier)
  const result = await limiter.limit(identifier)
  
  return {
    success: result.success,
    limit: result.limit,
    remaining: result.remaining,
    reset: result.reset,
  }
}
```

---

## Phase 7: Middleware

Create `middleware.ts`:

```typescript
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { auth } from './lib/auth'

const publicPaths = [
  '/',
  '/login',
  '/signup',
  '/forgot-password',
  '/api/auth',
  '/api/webhooks',
]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Allow public paths
  if (publicPaths.some(path => pathname.startsWith(path))) {
    return NextResponse.next()
  }
  
  // Check authentication
  const session = await auth()
  
  if (!session) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(loginUrl)
  }
  
  // Add security headers
  const response = NextResponse.next()
  
  response.headers.set('X-DNS-Prefetch-Control', 'on')
  response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload')
  response.headers.set('X-Frame-Options', 'SAMEORIGIN')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
  
  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|public).*)'],
}
```

---

## Phase 8: Application Structure

### 8.1 Target Directory Structure

```
/
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx
│   │   ├── signup/
│   │   │   └── page.tsx
│   │   └── layout.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx                 # Authenticated shell with sidebar
│   │   ├── page.tsx                   # Dashboard home
│   │   ├── agents/
│   │   │   ├── page.tsx               # Agent list
│   │   │   ├── new/page.tsx           # Create agent
│   │   │   └── [id]/
│   │   │       ├── page.tsx           # Agent detail
│   │   │       └── runs/page.tsx      # Agent run history
│   │   ├── insights/
│   │   │   ├── page.tsx               # Insights dashboard
│   │   │   └── [id]/page.tsx          # Insight detail
│   │   ├── data-sources/
│   │   │   ├── page.tsx               # Data source list
│   │   │   └── new/page.tsx           # Add data source
│   │   └── settings/
│   │       ├── page.tsx               # General settings
│   │       ├── team/page.tsx          # Team management
│   │       ├── billing/page.tsx       # Subscription & usage
│   │       ├── api-keys/page.tsx      # API key management
│   │       ├── sso/page.tsx           # SSO configuration
│   │       └── audit-log/page.tsx     # Audit log viewer
│   ├── api/
│   │   ├── v1/
│   │   │   ├── agents/
│   │   │   │   ├── route.ts           # GET (list), POST (create)
│   │   │   │   └── [id]/
│   │   │   │       ├── route.ts       # GET, PATCH, DELETE
│   │   │   │       └── run/route.ts   # POST (execute)
│   │   │   ├── insights/route.ts
│   │   │   └── data-sources/route.ts
│   │   ├── auth/[...nextauth]/route.ts
│   │   └── webhooks/
│   │       └── stripe/route.ts
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── ui/                            # shadcn/ui (preserve existing)
│   ├── agents/
│   │   ├── agent-card.tsx
│   │   ├── agent-form.tsx
│   │   ├── agent-run-status.tsx
│   │   └── agent-type-selector.tsx
│   ├── insights/
│   │   ├── insight-card.tsx
│   │   ├── insight-chart.tsx
│   │   └── insight-filters.tsx
│   ├── dashboard/
│   │   ├── sidebar.tsx
│   │   ├── header.tsx
│   │   ├── stats-cards.tsx
│   │   └── recent-activity.tsx
│   ├── settings/
│   │   ├── team-member-row.tsx
│   │   ├── invite-form.tsx
│   │   ├── api-key-row.tsx
│   │   └── audit-log-table.tsx
│   └── shared/
│       ├── data-table.tsx
│       ├── empty-state.tsx
│       ├── loading-skeleton.tsx
│       └── page-header.tsx
├── lib/
│   ├── db.ts
│   ├── auth.ts
│   ├── permissions.ts
│   ├── tenant.ts
│   ├── audit.ts
│   ├── billing.ts
│   ├── rate-limit.ts
│   └── utils.ts                       # Preserve existing utilities
├── hooks/
│   ├── use-organization.ts
│   ├── use-permissions.ts
│   └── use-agents.ts
├── types/
│   └── index.ts
├── public/
├── styles/                            # Preserve existing
├── render.yaml
├── .env.example
├── package.json
└── README.md
```

### 8.2 Package.json Updates

Add to existing `package.json`:

```json
{
  "dependencies": {
    "@prisma/client": "^5.22.0",
    "next-auth": "^5.0.0-beta.25",
    "@auth/prisma-adapter": "^2.7.4",
    "bcryptjs": "^2.4.3",
    "stripe": "^17.3.1",
    "@upstash/ratelimit": "^2.0.4",
    "@upstash/redis": "^1.34.3",
    "zod": "^3.23.8",
    "@tanstack/react-query": "^5.62.2",
    "date-fns": "^4.1.0"
  },
  "devDependencies": {
    "prisma": "^5.22.0",
    "@types/bcryptjs": "^2.4.6"
  },
  "scripts": {
    "postinstall": "prisma generate",
    "db:migrate": "prisma migrate deploy",
    "db:push": "prisma db push",
    "db:studio": "prisma studio"
  }
}
```

---

## Phase 9: Render Deployment

### 9.1 render.yaml Blueprint

Create `render.yaml`:

```yaml
services:
  # Main Web Application
  - type: web
    name: gwi-ai-platform
    runtime: node
    plan: standard
    region: oregon
    buildCommand: |
      npm ci
      npx prisma generate
      npm run build
    startCommand: npm start
    healthCheckPath: /api/health
    autoDeploy: true
    envVars:
      - key: DATABASE_URL
        fromDatabase:
          name: gwi-postgres
          property: connectionString
      - key: NEXTAUTH_SECRET
        generateValue: true
      - key: NEXTAUTH_URL
        sync: false
      - key: NODE_ENV
        value: production
      - key: STRIPE_SECRET_KEY
        sync: false
      - key: STRIPE_WEBHOOK_SECRET
        sync: false
      - key: GOOGLE_CLIENT_ID
        sync: false
      - key: GOOGLE_CLIENT_SECRET
        sync: false
      - key: AZURE_AD_CLIENT_ID
        sync: false
      - key: AZURE_AD_CLIENT_SECRET
        sync: false
      - key: AZURE_AD_TENANT_ID
        sync: false
      - key: UPSTASH_REDIS_REST_URL
        sync: false
      - key: UPSTASH_REDIS_REST_TOKEN
        sync: false
      - key: ANTHROPIC_API_KEY
        sync: false
      - key: OPENAI_API_KEY
        sync: false

databases:
  - name: gwi-postgres
    plan: pro
    region: oregon
    postgresMajorVersion: 16
    databaseName: gwi_production
```

### 9.2 Environment Variables Template

Create `.env.example`:

```bash
# Database (provided by Render)
DATABASE_URL="postgresql://user:password@host:5432/dbname"

# NextAuth
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"
NEXTAUTH_URL="https://your-domain.com"

# OAuth Providers (optional - for SSO)
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
AZURE_AD_CLIENT_ID=""
AZURE_AD_CLIENT_SECRET=""
AZURE_AD_TENANT_ID=""

# Stripe Billing
STRIPE_SECRET_KEY="sk_live_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
STRIPE_STARTER_PRICE_ID="price_..."
STRIPE_PROFESSIONAL_PRICE_ID="price_..."
STRIPE_ENTERPRISE_PRICE_ID="price_..."

# Rate Limiting (Upstash Redis)
UPSTASH_REDIS_REST_URL=""
UPSTASH_REDIS_REST_TOKEN=""

# AI Providers
ANTHROPIC_API_KEY=""
OPENAI_API_KEY=""

# App Config
APP_URL="https://your-domain.com"
```

---

## Phase 10: Health Check Endpoint

Create `app/api/health/route.ts`:

```typescript
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    // Check database connection
    await prisma.$queryRaw`SELECT 1`
    
    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: 'connected',
    })
  } catch (error) {
    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      database: 'disconnected',
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 503 })
  }
}
```

---

## Execution Instructions

### Using prd-to-deploy Workflow

1. **Clone repository:**
   ```bash
   git clone https://github.com/kevin-owens-product/v0-gwi-ai-agent-framework.git
   cd v0-gwi-ai-agent-framework
   ```

2. **Analyze and preserve existing code:**
   - Review `/components` for reusable UI
   - Review `/app` for existing page structure
   - Review `/lib` for utilities to keep

3. **Implement phases incrementally:**
   - Add Prisma schema and generate client
   - Add authentication layer
   - Add enterprise features (audit, billing, RBAC)
   - Migrate existing pages to authenticated layout
   - Add settings/admin pages

4. **Commit after each phase:**
   ```bash
   git add .
   git commit -m "feat: [phase description]"
   ```

5. **Push to GitHub:**
   ```bash
   git push origin main
   ```

6. **Deploy to Render using MCP:**
   - Workspace ID: `tea-d4pe6ckhg0os73eokitg`
   - Create Postgres database first
   - Create web service linked to GitHub repo
   - Configure environment variables
   - Monitor deployment logs

7. **Run database migrations:**
   ```bash
   npx prisma migrate deploy
   ```

---

## Success Criteria

- [ ] Existing MVP functionality preserved and working
- [ ] Multi-tenant data isolation verified
- [ ] User can sign up, log in, create organization
- [ ] RBAC enforced on all protected routes
- [ ] Agents can be created, configured, and executed
- [ ] Insights generated and displayed
- [ ] Audit logs capturing all sensitive actions
- [ ] Team invitations working
- [ ] API keys can be created and used
- [ ] Rate limiting active on API endpoints
- [ ] Health check endpoint responding
- [ ] All security headers present
- [ ] Deployed on Render with Postgres connected
- [ ] Environment variables properly configured

---

## Deliverables

Upon completion, provide:

1. **Live Render URL** - Production deployment
2. **GitHub repository** - Updated with enterprise features
3. **Database confirmation** - Migrations applied successfully
4. **Admin setup** - First user/org creation instructions
5. **API documentation** - Endpoint reference
6. **Environment checklist** - Required variables for production
