import { faker } from '@faker-js/faker'

/**
 * Factory for creating mock User objects
 */
export function createUser(overrides: Partial<ReturnType<typeof createUser>> = {}) {
  return {
    id: faker.string.uuid(),
    email: faker.internet.email(),
    name: faker.person.fullName(),
    avatarUrl: faker.image.avatar(),
    passwordHash: faker.string.alphanumeric(60),
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent(),
    ...overrides,
  }
}

/**
 * Factory for creating mock Organization objects
 */
export function createOrganization(overrides: Partial<ReturnType<typeof createOrganization>> = {}) {
  const name = faker.company.name()
  return {
    id: faker.string.uuid(),
    name,
    slug: faker.helpers.slugify(name).toLowerCase(),
    planTier: faker.helpers.arrayElement(['STARTER', 'PROFESSIONAL', 'ENTERPRISE'] as const),
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent(),
    ...overrides,
  }
}

/**
 * Factory for creating mock OrganizationMember objects
 */
export function createMembership(overrides: Partial<ReturnType<typeof createMembership>> = {}) {
  return {
    id: faker.string.uuid(),
    orgId: faker.string.uuid(),
    userId: faker.string.uuid(),
    role: faker.helpers.arrayElement(['OWNER', 'ADMIN', 'MEMBER', 'VIEWER'] as const),
    createdAt: faker.date.past(),
    ...overrides,
  }
}

/**
 * Factory for creating mock Agent objects
 */
export function createAgent(overrides: Partial<ReturnType<typeof createAgent>> = {}) {
  return {
    id: faker.string.uuid(),
    orgId: faker.string.uuid(),
    name: faker.commerce.productName() + ' Agent',
    description: faker.lorem.sentence(),
    type: faker.helpers.arrayElement(['RESEARCH', 'ANALYSIS', 'REPORTING', 'MONITORING', 'CUSTOM'] as const),
    status: faker.helpers.arrayElement(['DRAFT', 'ACTIVE', 'PAUSED', 'ARCHIVED'] as const),
    configuration: {},
    createdBy: faker.string.uuid(),
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent(),
    ...overrides,
  }
}

/**
 * Factory for creating mock Agent with full details
 */
export function createAgentWithDetails(overrides: Partial<ReturnType<typeof createAgentWithDetails>> = {}) {
  const agent = createAgent(overrides)
  return {
    ...agent,
    creator: {
      id: agent.createdBy,
      name: faker.person.fullName(),
      email: faker.internet.email(),
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
export function createAgentRun(overrides: Partial<ReturnType<typeof createAgentRun>> = {}) {
  const status = faker.helpers.arrayElement(['PENDING', 'RUNNING', 'COMPLETED', 'FAILED', 'CANCELLED'] as const)
  return {
    id: faker.string.uuid(),
    agentId: faker.string.uuid(),
    status,
    input: { query: faker.lorem.sentence() },
    output: status === 'COMPLETED' ? { result: faker.lorem.paragraph() } : null,
    tokensUsed: status === 'COMPLETED' ? faker.number.int({ min: 100, max: 10000 }) : null,
    startedAt: faker.date.recent(),
    completedAt: status === 'COMPLETED' || status === 'FAILED' ? faker.date.recent() : null,
    ...overrides,
  }
}

/**
 * Factory for creating mock Insight objects
 */
export function createInsight(overrides: Partial<ReturnType<typeof createInsight>> = {}) {
  return {
    id: faker.string.uuid(),
    orgId: faker.string.uuid(),
    agentId: faker.string.uuid(),
    type: faker.helpers.arrayElement(['trend', 'anomaly', 'recommendation', 'comparison'] as const),
    title: faker.lorem.sentence(),
    data: {
      value: faker.number.int({ min: 1, max: 100 }),
      change: faker.number.float({ min: -50, max: 50, fractionDigits: 2 }),
      details: faker.lorem.paragraph(),
    },
    confidenceScore: faker.number.float({ min: 0.5, max: 1, fractionDigits: 2 }),
    createdAt: faker.date.past(),
    ...overrides,
  }
}

/**
 * Factory for creating mock DataSource objects
 */
export function createDataSource(overrides: Partial<ReturnType<typeof createDataSource>> = {}) {
  return {
    id: faker.string.uuid(),
    orgId: faker.string.uuid(),
    name: faker.commerce.productName() + ' Data',
    type: faker.helpers.arrayElement(['API', 'DATABASE', 'FILE_UPLOAD', 'WEBHOOK', 'INTEGRATION'] as const),
    status: faker.helpers.arrayElement(['PENDING', 'CONNECTED', 'ERROR', 'DISABLED'] as const),
    configuration: {
      endpoint: faker.internet.url(),
    },
    lastSyncAt: faker.date.recent(),
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent(),
    ...overrides,
  }
}

/**
 * Factory for creating mock AuditLog objects
 */
export function createAuditLog(overrides: Partial<ReturnType<typeof createAuditLog>> = {}) {
  return {
    id: faker.string.uuid(),
    orgId: faker.string.uuid(),
    userId: faker.string.uuid(),
    action: faker.helpers.arrayElement(['create', 'read', 'update', 'delete', 'execute', 'export', 'login', 'logout', 'invite', 'join', 'leave'] as const),
    resourceType: faker.helpers.arrayElement(['agent', 'insight', 'data_source', 'user', 'settings', 'api_key', 'invitation', 'organization', 'agent_run', 'workflow'] as const),
    resourceId: faker.string.uuid(),
    metadata: {},
    ipAddress: faker.internet.ip(),
    userAgent: faker.internet.userAgent(),
    timestamp: faker.date.recent(),
    ...overrides,
  }
}

/**
 * Factory for creating mock ApiKey objects
 */
export function createApiKey(overrides: Partial<ReturnType<typeof createApiKey>> = {}) {
  return {
    id: faker.string.uuid(),
    orgId: faker.string.uuid(),
    name: faker.commerce.productName() + ' Key',
    keyPrefix: 'gwi_' + faker.string.alphanumeric(8),
    keyHash: faker.string.alphanumeric(64),
    permissions: ['agents:read', 'agents:execute'],
    rateLimit: faker.number.int({ min: 100, max: 1000 }),
    expiresAt: faker.date.future(),
    lastUsedAt: faker.date.recent(),
    createdAt: faker.date.past(),
    ...overrides,
  }
}

/**
 * Factory for creating mock Invitation objects
 */
export function createInvitation(overrides: Partial<ReturnType<typeof createInvitation>> = {}) {
  return {
    id: faker.string.uuid(),
    orgId: faker.string.uuid(),
    email: faker.internet.email(),
    role: faker.helpers.arrayElement(['ADMIN', 'MEMBER', 'VIEWER'] as const),
    status: faker.helpers.arrayElement(['PENDING', 'ACCEPTED', 'EXPIRED', 'REVOKED'] as const),
    expiresAt: faker.date.future(),
    createdAt: faker.date.past(),
    ...overrides,
  }
}

/**
 * Factory for creating mock UsageRecord objects
 */
export function createUsageRecord(overrides: Partial<ReturnType<typeof createUsageRecord>> = {}) {
  return {
    id: faker.string.uuid(),
    orgId: faker.string.uuid(),
    metricType: faker.helpers.arrayElement(['AGENT_RUNS', 'TOKENS_CONSUMED', 'API_CALLS', 'DATA_SOURCES', 'TEAM_SEATS', 'STORAGE_GB'] as const),
    value: faker.number.int({ min: 1, max: 1000 }),
    recordedAt: faker.date.recent(),
    ...overrides,
  }
}

/**
 * Factory for creating mock OrganizationContext (for hooks)
 */
export function createOrganizationContext(overrides: Partial<ReturnType<typeof createOrganizationContext>> = {}) {
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
  return Array.from({ length: count }, () => createAuditLog())
}
