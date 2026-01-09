import type {
  User,
  Organization,
  OrganizationMember,
  Agent,
  AgentRun,
  Insight,
  DataSource,
  AuditLog,
  ApiKey,
  Invitation,
  BillingSubscription,
  Role,
  PlanTier,
  AgentType,
  AgentStatus,
  AgentRunStatus,
  DataSourceType,
  DataSourceStatus,
  UsageMetric,
  SubscriptionStatus,
  InvitationStatus,
} from '@prisma/client'

// Re-export Prisma types
export type {
  User,
  Organization,
  OrganizationMember,
  Agent,
  AgentRun,
  Insight,
  DataSource,
  AuditLog,
  ApiKey,
  Invitation,
  BillingSubscription,
  Role,
  PlanTier,
  AgentType,
  AgentStatus,
  AgentRunStatus,
  DataSourceType,
  DataSourceStatus,
  UsageMetric,
  SubscriptionStatus,
  InvitationStatus,
}

// Extended types with relations
export type UserWithMemberships = User & {
  memberships: (OrganizationMember & {
    organization: Organization
  })[]
}

export type OrganizationWithMembers = Organization & {
  members: (OrganizationMember & {
    user: Pick<User, 'id' | 'name' | 'email' | 'avatarUrl'>
  })[]
  subscription: BillingSubscription | null
  _count: {
    members: number
    agents: number
    dataSources: number
  }
}

export type AgentWithDetails = Agent & {
  creator: Pick<User, 'id' | 'name' | 'email'>
  runs?: AgentRun[]
  _count: {
    runs: number
  }
}

export type AgentRunWithInsights = AgentRun & {
  agent: Agent
  insights: Insight[]
}

export type AuditLogWithUser = AuditLog & {
  user: Pick<User, 'id' | 'name' | 'email'> | null
}

// Session types
export interface SessionUser {
  id: string
  email: string
  name: string | null
  image?: string | null
}

export interface OrganizationContext {
  id: string
  name: string
  slug: string
  planTier: PlanTier
  role: Role
}

// API Response types
export interface ApiResponse<T> {
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  meta: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// Form types
export interface CreateAgentInput {
  name: string
  description?: string
  type: AgentType
  configuration?: Record<string, unknown>
}

export interface UpdateAgentInput {
  name?: string
  description?: string
  status?: AgentStatus
  configuration?: Record<string, unknown>
}

export interface RunAgentInput {
  input: Record<string, unknown>
}

export interface InviteMemberInput {
  email: string
  role: Role
}

export interface CreateOrganizationInput {
  name: string
}

// Usage & Billing types
export interface UsageSummary {
  agentRuns: number
  tokensConsumed: number
  apiCalls: number
  dataSources: number
  teamSeats: number
  storageGb: number
}

export interface PlanLimits {
  agentRuns: number
  teamSeats: number
  dataSources: number
  apiCallsPerMin: number
  retentionDays: number
  tokensPerMonth: number
}

// Audit types
export interface AuditFilter {
  action?: string
  resourceType?: string
  userId?: string
  startDate?: Date
  endDate?: Date
}

// Notification types
export interface Notification {
  id: string
  type: 'info' | 'success' | 'warning' | 'error'
  title: string
  message?: string
  timestamp: Date
  read: boolean
}

// Search types
export interface SearchResult {
  type: 'agent' | 'insight' | 'report' | 'workflow'
  id: string
  title: string
  description?: string
  url: string
}
