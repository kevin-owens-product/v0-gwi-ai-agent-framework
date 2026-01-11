import { faker } from '@faker-js/faker'

// Types aligned with Prisma schema
export type PlanTier = 'STARTER' | 'PROFESSIONAL' | 'ENTERPRISE'
export type Role = 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER'
export type AgentType = 'RESEARCH' | 'ANALYSIS' | 'REPORTING' | 'MONITORING' | 'CUSTOM'
export type AgentStatus = 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'ARCHIVED'
export type AgentRunStatus = 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'CANCELLED'
export type DataSourceType = 'API' | 'DATABASE' | 'FILE_UPLOAD' | 'WEBHOOK' | 'INTEGRATION'
export type DataSourceStatus = 'PENDING' | 'CONNECTED' | 'ERROR' | 'DISABLED'
export type UsageMetric = 'AGENT_RUNS' | 'TOKENS_CONSUMED' | 'API_CALLS' | 'DATA_SOURCES' | 'TEAM_SEATS' | 'STORAGE_GB'
export type SubscriptionStatus = 'TRIALING' | 'ACTIVE' | 'PAST_DUE' | 'CANCELED' | 'UNPAID'
export type InvitationStatus = 'PENDING' | 'ACCEPTED' | 'EXPIRED' | 'REVOKED'

/**
 * Factory for creating mock User objects
 */
export function createUser(overrides: Record<string, unknown> = {}) {
  return {
    id: faker.string.uuid(),
    email: faker.internet.email().toLowerCase(),
    name: faker.person.fullName(),
    avatarUrl: faker.image.avatar(),
    passwordHash: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.u7Kq2Gg6Ey6Onu', // "password123"
    emailVerified: faker.date.past(),
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent(),
    ...overrides,
  }
}

/**
 * Factory for creating mock Organization objects
 */
export function createOrganization(overrides: Record<string, unknown> = {}) {
  const name = faker.company.name()
  return {
    id: faker.string.uuid(),
    name,
    slug: faker.helpers.slugify(name).toLowerCase(),
    planTier: faker.helpers.arrayElement(['STARTER', 'PROFESSIONAL', 'ENTERPRISE'] as const),
    settings: {},
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent(),
    ...overrides,
  }
}

/**
 * Factory for creating mock OrganizationMember objects
 */
export function createMembership(overrides: Record<string, unknown> = {}) {
  return {
    id: faker.string.uuid(),
    orgId: faker.string.uuid(),
    userId: faker.string.uuid(),
    role: faker.helpers.arrayElement(['OWNER', 'ADMIN', 'MEMBER', 'VIEWER'] as const),
    invitedBy: faker.helpers.maybe(() => faker.string.uuid()) || null,
    joinedAt: faker.date.past(),
    ...overrides,
  }
}

/**
 * Factory for creating mock Account objects (OAuth)
 */
export function createAccount(overrides: Record<string, unknown> = {}) {
  const provider = faker.helpers.arrayElement(['google', 'microsoft-entra-id'])
  return {
    id: faker.string.uuid(),
    userId: faker.string.uuid(),
    type: 'oauth',
    provider,
    providerAccountId: faker.string.alphanumeric(21),
    refresh_token: faker.string.alphanumeric(100),
    access_token: faker.string.alphanumeric(100),
    expires_at: Math.floor(Date.now() / 1000) + 3600,
    token_type: 'Bearer',
    scope: 'openid profile email',
    id_token: null,
    session_state: null,
    ...overrides,
  }
}

/**
 * Factory for creating mock Session objects
 */
export function createSession(overrides: Record<string, unknown> = {}) {
  return {
    id: faker.string.uuid(),
    sessionToken: faker.string.uuid(),
    userId: faker.string.uuid(),
    expires: faker.date.future(),
    ipAddress: faker.internet.ip(),
    userAgent: faker.internet.userAgent(),
    ...overrides,
  }
}

/**
 * Factory for creating mock VerificationToken objects
 */
export function createVerificationToken(overrides: Record<string, unknown> = {}) {
  return {
    identifier: faker.internet.email().toLowerCase(),
    token: faker.string.hexadecimal({ length: 64, casing: 'lower' }),
    expires: faker.date.future(),
    ...overrides,
  }
}

/**
 * Factory for creating mock SSOConfiguration objects
 */
export function createSSOConfiguration(overrides: Record<string, unknown> = {}) {
  const provider = faker.helpers.arrayElement(['saml', 'oidc'])
  return {
    id: faker.string.uuid(),
    orgId: faker.string.uuid(),
    provider,
    metadataUrl: provider === 'saml' ? faker.internet.url() : null,
    clientId: provider === 'oidc' ? faker.string.alphanumeric(32) : null,
    clientSecret: provider === 'oidc' ? faker.string.alphanumeric(64) : null,
    enabled: faker.datatype.boolean(),
    ...overrides,
  }
}

/**
 * Factory for creating mock Agent objects
 */
export function createAgent(overrides: Record<string, unknown> = {}) {
  return {
    id: faker.string.uuid(),
    orgId: faker.string.uuid(),
    name: `${faker.commerce.productAdjective()} ${faker.commerce.product()} Agent`,
    description: faker.lorem.sentence(),
    type: faker.helpers.arrayElement(['RESEARCH', 'ANALYSIS', 'REPORTING', 'MONITORING', 'CUSTOM'] as const),
    configuration: {
      model: 'claude-sonnet-4-20250514',
      maxTokens: 4096,
      temperature: 0.7,
    },
    status: faker.helpers.arrayElement(['DRAFT', 'ACTIVE', 'PAUSED', 'ARCHIVED'] as const),
    createdBy: faker.string.uuid(),
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent(),
    ...overrides,
  }
}

/**
 * Factory for creating mock Agent with full details (includes relations)
 */
export function createAgentWithDetails(overrides: Record<string, unknown> = {}) {
  const agent = createAgent(overrides)
  return {
    ...agent,
    creator: {
      id: agent.createdBy,
      name: faker.person.fullName(),
      email: faker.internet.email().toLowerCase(),
    },
    _count: {
      runs: faker.number.int({ min: 0, max: 100 }),
    },
    ...overrides,
  }
}

/**
 * Factory for creating mock AgentRun objects
 */
export function createAgentRun(overrides: Record<string, unknown> = {}) {
  const status = (overrides.status as string) || faker.helpers.arrayElement(['PENDING', 'RUNNING', 'COMPLETED', 'FAILED', 'CANCELLED'] as const)
  const completedStatuses = ['COMPLETED', 'FAILED', 'CANCELLED']
  return {
    id: faker.string.uuid(),
    agentId: faker.string.uuid(),
    orgId: faker.string.uuid(),
    input: { query: faker.lorem.sentence() },
    output: status === 'COMPLETED' ? { result: faker.lorem.paragraphs(2) } : null,
    status,
    tokensUsed: status === 'COMPLETED' ? faker.number.int({ min: 100, max: 10000 }) : 0,
    startedAt: faker.date.recent(),
    completedAt: completedStatuses.includes(status) ? faker.date.recent() : null,
    errorMessage: status === 'FAILED' ? faker.lorem.sentence() : null,
    ...overrides,
  }
}

/**
 * Factory for creating mock Insight objects
 */
export function createInsight(overrides: Record<string, unknown> = {}) {
  return {
    id: faker.string.uuid(),
    orgId: faker.string.uuid(),
    agentRunId: faker.helpers.maybe(() => faker.string.uuid()) || null,
    type: faker.helpers.arrayElement(['trend', 'anomaly', 'recommendation', 'summary', 'comparison'] as const),
    title: faker.lorem.sentence(),
    data: {
      content: faker.lorem.paragraphs(2),
      metrics: {
        value: faker.number.int({ min: 1, max: 100 }),
        change: faker.number.float({ min: -50, max: 50, fractionDigits: 2 }),
      },
    },
    confidenceScore: faker.number.float({ min: 0.5, max: 1, fractionDigits: 2 }),
    createdAt: faker.date.recent(),
    ...overrides,
  }
}

/**
 * Factory for creating mock DataSource objects
 */
export function createDataSource(overrides: Record<string, unknown> = {}) {
  const type = overrides.type || faker.helpers.arrayElement(['API', 'DATABASE', 'FILE_UPLOAD', 'WEBHOOK', 'INTEGRATION'] as const)
  return {
    id: faker.string.uuid(),
    orgId: faker.string.uuid(),
    name: `${faker.company.name()} ${type}`,
    type,
    connectionConfig: {
      url: type === 'API' ? faker.internet.url() : undefined,
      apiKey: type === 'API' ? '••••••••' + faker.string.alphanumeric(4) : undefined,
      host: type === 'DATABASE' ? faker.internet.domainName() : undefined,
      port: type === 'DATABASE' ? faker.number.int({ min: 1000, max: 9999 }) : undefined,
    },
    lastSync: faker.helpers.maybe(() => faker.date.recent()) || null,
    status: faker.helpers.arrayElement(['PENDING', 'CONNECTED', 'ERROR', 'DISABLED'] as const),
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent(),
    ...overrides,
  }
}

/**
 * Factory for creating mock AuditLog objects
 */
export function createAuditLog(overrides: Record<string, unknown> = {}) {
  return {
    id: faker.string.uuid(),
    orgId: faker.string.uuid(),
    userId: faker.helpers.maybe(() => faker.string.uuid()) || null,
    action: faker.helpers.arrayElement(['create', 'read', 'update', 'delete', 'execute', 'export', 'login', 'logout', 'invite', 'join', 'leave'] as const),
    resourceType: faker.helpers.arrayElement(['agent', 'insight', 'data_source', 'user', 'settings', 'api_key', 'invitation', 'organization', 'agent_run', 'workflow'] as const),
    resourceId: faker.helpers.maybe(() => faker.string.uuid()) || null,
    metadata: {},
    ipAddress: faker.internet.ip(),
    userAgent: faker.internet.userAgent(),
    timestamp: faker.date.recent(),
    ...overrides,
  }
}

/**
 * Factory for creating mock AuditLog with user details
 */
export function createAuditLogWithUser(overrides: Record<string, unknown> = {}) {
  const log = createAuditLog(overrides)
  return {
    ...log,
    user: log.userId ? {
      id: log.userId,
      name: faker.person.fullName(),
      email: faker.internet.email().toLowerCase(),
    } : null,
    ...overrides,
  }
}

/**
 * Factory for creating mock UsageRecord objects
 */
export function createUsageRecord(overrides: Record<string, unknown> = {}) {
  return {
    id: faker.string.uuid(),
    orgId: faker.string.uuid(),
    metricType: faker.helpers.arrayElement(['AGENT_RUNS', 'TOKENS_CONSUMED', 'API_CALLS', 'DATA_SOURCES', 'TEAM_SEATS', 'STORAGE_GB'] as const),
    quantity: faker.number.int({ min: 1, max: 1000 }),
    recordedAt: faker.date.recent(),
    ...overrides,
  }
}

/**
 * Factory for creating mock BillingSubscription objects
 */
export function createBillingSubscription(overrides: Record<string, unknown> = {}) {
  return {
    id: faker.string.uuid(),
    orgId: faker.string.uuid(),
    stripeCustomerId: `cus_${faker.string.alphanumeric(14)}`,
    stripeSubscriptionId: `sub_${faker.string.alphanumeric(14)}`,
    planId: faker.helpers.arrayElement(['starter', 'professional', 'enterprise']),
    status: faker.helpers.arrayElement(['TRIALING', 'ACTIVE', 'PAST_DUE', 'CANCELED', 'UNPAID'] as const),
    currentPeriodEnd: faker.date.future(),
    cancelAtPeriodEnd: false,
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent(),
    ...overrides,
  }
}

/**
 * Factory for creating mock ApiKey objects
 */
export function createApiKey(overrides: Record<string, unknown> = {}) {
  const planPrefix = faker.helpers.arrayElement(['starter', 'professional', 'enterprise'])
  return {
    id: faker.string.uuid(),
    orgId: faker.string.uuid(),
    userId: faker.string.uuid(),
    name: `${faker.word.adjective()} API Key`,
    keyPrefix: `gwi_${planPrefix}_`,
    keyHash: faker.string.hexadecimal({ length: 64, casing: 'lower' }),
    permissions: ['agents:read', 'agents:execute', 'insights:read'],
    rateLimit: faker.number.int({ min: 100, max: 1000 }),
    lastUsed: faker.helpers.maybe(() => faker.date.recent()) || null,
    expiresAt: faker.helpers.maybe(() => faker.date.future()) || null,
    createdAt: faker.date.past(),
    ...overrides,
  }
}

/**
 * Factory for creating mock Invitation objects
 */
export function createInvitation(overrides: Record<string, unknown> = {}) {
  return {
    id: faker.string.uuid(),
    orgId: faker.string.uuid(),
    email: faker.internet.email().toLowerCase(),
    role: faker.helpers.arrayElement(['ADMIN', 'MEMBER', 'VIEWER'] as const),
    token: faker.string.hexadecimal({ length: 64, casing: 'lower' }),
    status: faker.helpers.arrayElement(['PENDING', 'ACCEPTED', 'EXPIRED', 'REVOKED'] as const),
    expiresAt: faker.date.future(),
    createdAt: faker.date.recent(),
    ...overrides,
  }
}

/**
 * Factory for creating mock OrganizationContext (for hooks)
 */
export function createOrganizationContext(overrides: Record<string, unknown> = {}) {
  return {
    id: faker.string.uuid(),
    name: faker.company.name(),
    slug: faker.helpers.slugify(faker.company.name()).toLowerCase(),
    role: faker.helpers.arrayElement(['OWNER', 'ADMIN', 'MEMBER', 'VIEWER'] as const),
    planTier: faker.helpers.arrayElement(['STARTER', 'PROFESSIONAL', 'ENTERPRISE'] as const),
    ...overrides,
  }
}

/**
 * Factory for creating a collection of mock agents
 */
export function createAgentList(count: number = 10) {
  return Array.from({ length: count }, () => createAgentWithDetails())
}

/**
 * Factory for creating a collection of mock insights
 */
export function createInsightList(count: number = 10) {
  return Array.from({ length: count }, () => createInsight())
}

/**
 * Factory for creating a collection of mock audit logs
 */
export function createAuditLogList(count: number = 50) {
  return Array.from({ length: count }, () => createAuditLogWithUser())
}

/**
 * Factory for creating a collection of mock data sources
 */
export function createDataSourceList(count: number = 5) {
  return Array.from({ length: count }, () => createDataSource())
}

/**
 * Factory for creating a collection of mock team members
 */
export function createTeamMemberList(count: number = 5) {
  return Array.from({ length: count }, (_, i) => {
    const user = createUser()
    const membership = createMembership({
      userId: user.id,
      role: i === 0 ? 'OWNER' : faker.helpers.arrayElement(['ADMIN', 'MEMBER', 'VIEWER'] as const),
    })
    return {
      ...membership,
      user,
    }
  })
}

/**
 * Factory for creating a collection of mock API keys
 */
export function createApiKeyList(count: number = 3) {
  return Array.from({ length: count }, () => createApiKey())
}

/**
 * Factory for creating a collection of mock usage records for a period
 */
export function createUsageRecordList(count: number = 30, orgId?: string) {
  const id = orgId || faker.string.uuid()
  return Array.from({ length: count }, () => createUsageRecord({ orgId: id }))
}

/**
 * Factory for creating a paginated response structure
 */
export function createPaginatedResponse<T>(data: T[], page = 1, limit = 20, total?: number) {
  const totalCount = total ?? data.length
  return {
    data,
    meta: {
      page,
      limit,
      total: totalCount,
      totalPages: Math.ceil(totalCount / limit),
    },
  }
}
