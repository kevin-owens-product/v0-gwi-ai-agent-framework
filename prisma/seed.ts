import { PrismaClient, Role, PlanTier, AgentType, AgentStatus, AgentRunStatus, DataSourceType, DataSourceStatus, UsageMetric, SubscriptionStatus, InvitationStatus } from '@prisma/client'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'

const prisma = new PrismaClient()

// Helper to hash passwords
async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

// Helper to generate API key hash
function hashApiKey(key: string): string {
  return crypto.createHash('sha256').update(key).digest('hex')
}

async function main() {
  console.log('🌱 Starting database seed...')

  // Clean existing data (in reverse order of dependencies)
  console.log('🧹 Cleaning existing data...')
  await prisma.insight.deleteMany()
  await prisma.agentRun.deleteMany()
  await prisma.agent.deleteMany()
  await prisma.dataSource.deleteMany()
  await prisma.auditLog.deleteMany()
  await prisma.usageRecord.deleteMany()
  await prisma.apiKey.deleteMany()
  await prisma.invitation.deleteMany()
  await prisma.billingSubscription.deleteMany()
  await prisma.sSOConfiguration.deleteMany()
  await prisma.organizationMember.deleteMany()
  await prisma.session.deleteMany()
  await prisma.account.deleteMany()
  await prisma.user.deleteMany()
  await prisma.organization.deleteMany()

  // ==================== ORGANIZATIONS ====================
  console.log('🏢 Creating organizations...')

  const acmeCorp = await prisma.organization.create({
    data: {
      name: 'Acme Corporation',
      slug: 'acme-corp',
      planTier: PlanTier.PROFESSIONAL,
      settings: {
        theme: 'light',
        timezone: 'America/New_York',
        features: { advancedAnalytics: true, customBranding: true }
      }
    }
  })

  const techStartup = await prisma.organization.create({
    data: {
      name: 'Tech Startup Inc',
      slug: 'tech-startup',
      planTier: PlanTier.STARTER,
      settings: {
        theme: 'dark',
        timezone: 'America/Los_Angeles',
        features: {}
      }
    }
  })

  const enterpriseCo = await prisma.organization.create({
    data: {
      name: 'Enterprise Solutions Ltd',
      slug: 'enterprise-solutions',
      planTier: PlanTier.ENTERPRISE,
      settings: {
        theme: 'system',
        timezone: 'Europe/London',
        features: { advancedAnalytics: true, customBranding: true, sso: true, auditLog: true }
      }
    }
  })

  // ==================== USERS ====================
  console.log('👥 Creating users...')

  const defaultPassword = await hashPassword('Password123!')

  // Admin user (owner of Acme Corp)
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@acme.com',
      name: 'Admin User',
      passwordHash: defaultPassword,
      emailVerified: new Date(),
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin'
    }
  })

  // Regular users
  const johnDoe = await prisma.user.create({
    data: {
      email: 'john.doe@acme.com',
      name: 'John Doe',
      passwordHash: defaultPassword,
      emailVerified: new Date(),
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=john'
    }
  })

  const janeSmith = await prisma.user.create({
    data: {
      email: 'jane.smith@acme.com',
      name: 'Jane Smith',
      passwordHash: defaultPassword,
      emailVerified: new Date(),
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=jane'
    }
  })

  const bobWilson = await prisma.user.create({
    data: {
      email: 'bob@techstartup.io',
      name: 'Bob Wilson',
      passwordHash: defaultPassword,
      emailVerified: new Date(),
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=bob'
    }
  })

  const sarahEnterprise = await prisma.user.create({
    data: {
      email: 'sarah@enterprise.co',
      name: 'Sarah Enterprise',
      passwordHash: defaultPassword,
      emailVerified: new Date(),
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah'
    }
  })

  const viewerUser = await prisma.user.create({
    data: {
      email: 'viewer@acme.com',
      name: 'Viewer Account',
      passwordHash: defaultPassword,
      emailVerified: new Date(),
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=viewer'
    }
  })

  // Demo user for easy testing
  const demoUser = await prisma.user.create({
    data: {
      email: 'demo@example.com',
      name: 'Demo User',
      passwordHash: await hashPassword('demo123'),
      emailVerified: new Date(),
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=demo'
    }
  })

  // ==================== ORGANIZATION MEMBERSHIPS ====================
  console.log('🔗 Creating organization memberships...')

  // Acme Corp memberships
  await prisma.organizationMember.createMany({
    data: [
      { orgId: acmeCorp.id, userId: adminUser.id, role: Role.OWNER },
      { orgId: acmeCorp.id, userId: johnDoe.id, role: Role.ADMIN },
      { orgId: acmeCorp.id, userId: janeSmith.id, role: Role.MEMBER },
      { orgId: acmeCorp.id, userId: viewerUser.id, role: Role.VIEWER },
      { orgId: acmeCorp.id, userId: demoUser.id, role: Role.MEMBER },
    ]
  })

  // Tech Startup memberships
  await prisma.organizationMember.createMany({
    data: [
      { orgId: techStartup.id, userId: bobWilson.id, role: Role.OWNER },
      { orgId: techStartup.id, userId: demoUser.id, role: Role.ADMIN },
    ]
  })

  // Enterprise Solutions memberships
  await prisma.organizationMember.createMany({
    data: [
      { orgId: enterpriseCo.id, userId: sarahEnterprise.id, role: Role.OWNER },
      { orgId: enterpriseCo.id, userId: demoUser.id, role: Role.VIEWER },
    ]
  })

  // ==================== AGENTS ====================
  console.log('🤖 Creating agents...')

  const marketResearchAgent = await prisma.agent.create({
    data: {
      orgId: acmeCorp.id,
      name: 'Market Research Agent',
      description: 'Analyzes market trends and competitor data from GWI insights',
      type: AgentType.RESEARCH,
      status: AgentStatus.ACTIVE,
      createdBy: adminUser.id,
      configuration: {
        model: 'gpt-4',
        temperature: 0.7,
        maxTokens: 4000,
        dataSources: ['gwi-platform', 'competitor-feeds'],
        outputFormat: 'structured-report'
      }
    }
  })

  const audienceAnalysisAgent = await prisma.agent.create({
    data: {
      orgId: acmeCorp.id,
      name: 'Audience Analysis Agent',
      description: 'Deep-dives into audience segments and behavioral patterns',
      type: AgentType.ANALYSIS,
      status: AgentStatus.ACTIVE,
      createdBy: johnDoe.id,
      configuration: {
        model: 'gpt-4',
        temperature: 0.5,
        maxTokens: 8000,
        segments: ['millennials', 'gen-z', 'professionals'],
        metrics: ['engagement', 'sentiment', 'purchase-intent']
      }
    }
  })

  const weeklyReportAgent = await prisma.agent.create({
    data: {
      orgId: acmeCorp.id,
      name: 'Weekly Report Generator',
      description: 'Automatically generates weekly performance reports',
      type: AgentType.REPORTING,
      status: AgentStatus.ACTIVE,
      createdBy: janeSmith.id,
      configuration: {
        model: 'gpt-4',
        schedule: 'weekly',
        recipients: ['team@acme.com'],
        includeCharts: true,
        format: 'pdf'
      }
    }
  })

  const socialMonitorAgent = await prisma.agent.create({
    data: {
      orgId: acmeCorp.id,
      name: 'Social Media Monitor',
      description: 'Monitors brand mentions and sentiment across social platforms',
      type: AgentType.MONITORING,
      status: AgentStatus.PAUSED,
      createdBy: adminUser.id,
      configuration: {
        platforms: ['twitter', 'instagram', 'linkedin'],
        keywords: ['acme', 'acmecorp', '@acme'],
        alertThreshold: -0.3,
        checkInterval: '15m'
      }
    }
  })

  const customAgent = await prisma.agent.create({
    data: {
      orgId: acmeCorp.id,
      name: 'Custom Data Pipeline',
      description: 'Custom agent for specialized data processing workflows',
      type: AgentType.CUSTOM,
      status: AgentStatus.DRAFT,
      createdBy: johnDoe.id,
      configuration: {
        steps: ['fetch', 'transform', 'analyze', 'output'],
        customCode: true
      }
    }
  })

  // Tech Startup agents
  const startupResearchAgent = await prisma.agent.create({
    data: {
      orgId: techStartup.id,
      name: 'Competitor Intel Agent',
      description: 'Tracks competitor activities and market positioning',
      type: AgentType.RESEARCH,
      status: AgentStatus.ACTIVE,
      createdBy: bobWilson.id,
      configuration: {
        competitors: ['competitor-a', 'competitor-b'],
        trackingMetrics: ['pricing', 'features', 'reviews']
      }
    }
  })

  // Enterprise agents
  const enterpriseAnalysisAgent = await prisma.agent.create({
    data: {
      orgId: enterpriseCo.id,
      name: 'Enterprise Analytics Agent',
      description: 'Advanced analytics for enterprise-scale data processing',
      type: AgentType.ANALYSIS,
      status: AgentStatus.ACTIVE,
      createdBy: sarahEnterprise.id,
      configuration: {
        model: 'gpt-4-turbo',
        maxTokens: 16000,
        parallelProcessing: true,
        dataRetention: '90d'
      }
    }
  })

  // ==================== AGENT RUNS ====================
  console.log('🏃 Creating agent runs...')

  const now = new Date()
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000)
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

  const completedRun1 = await prisma.agentRun.create({
    data: {
      agentId: marketResearchAgent.id,
      orgId: acmeCorp.id,
      status: AgentRunStatus.COMPLETED,
      tokensUsed: 3542,
      startedAt: oneHourAgo,
      completedAt: new Date(oneHourAgo.getTime() + 45000),
      input: { query: 'Analyze Q4 market trends in consumer electronics', region: 'North America' },
      output: {
        summary: 'Consumer electronics market showing 12% YoY growth',
        keyFindings: ['Mobile accessories up 23%', 'Smart home devices stabilizing', 'Wearables declining 5%'],
        confidence: 0.87
      }
    }
  })

  const completedRun2 = await prisma.agentRun.create({
    data: {
      agentId: audienceAnalysisAgent.id,
      orgId: acmeCorp.id,
      status: AgentRunStatus.COMPLETED,
      tokensUsed: 5821,
      startedAt: oneDayAgo,
      completedAt: new Date(oneDayAgo.getTime() + 120000),
      input: { segment: 'millennials', metrics: ['purchase_intent', 'brand_awareness'] },
      output: {
        segmentSize: 28500000,
        purchaseIntent: 0.42,
        brandAwareness: 0.67,
        topInterests: ['sustainability', 'tech', 'experiences']
      }
    }
  })

  const runningRun = await prisma.agentRun.create({
    data: {
      agentId: weeklyReportAgent.id,
      orgId: acmeCorp.id,
      status: AgentRunStatus.RUNNING,
      tokensUsed: 1200,
      startedAt: new Date(now.getTime() - 5 * 60 * 1000),
      input: { reportType: 'weekly', dateRange: 'last_7_days' }
    }
  })

  const failedRun = await prisma.agentRun.create({
    data: {
      agentId: socialMonitorAgent.id,
      orgId: acmeCorp.id,
      status: AgentRunStatus.FAILED,
      tokensUsed: 156,
      startedAt: oneWeekAgo,
      completedAt: new Date(oneWeekAgo.getTime() + 5000),
      input: { platforms: ['twitter'], keywords: ['acme'] },
      errorMessage: 'API rate limit exceeded. Please try again later.'
    }
  })

  const pendingRun = await prisma.agentRun.create({
    data: {
      agentId: customAgent.id,
      orgId: acmeCorp.id,
      status: AgentRunStatus.PENDING,
      tokensUsed: 0,
      input: { pipeline: 'custom-etl', source: 'external-api' }
    }
  })

  // More completed runs for history
  for (let i = 0; i < 10; i++) {
    const daysAgo = new Date(now.getTime() - (i + 2) * 24 * 60 * 60 * 1000)
    await prisma.agentRun.create({
      data: {
        agentId: marketResearchAgent.id,
        orgId: acmeCorp.id,
        status: AgentRunStatus.COMPLETED,
        tokensUsed: Math.floor(Math.random() * 5000) + 1000,
        startedAt: daysAgo,
        completedAt: new Date(daysAgo.getTime() + Math.random() * 120000),
        input: { query: `Historical research query ${i + 1}`, automated: true },
        output: { summary: `Analysis results for query ${i + 1}`, dataPoints: Math.floor(Math.random() * 100) }
      }
    })
  }

  // ==================== DATA SOURCES ====================
  console.log('📊 Creating data sources...')

  await prisma.dataSource.createMany({
    data: [
      {
        orgId: acmeCorp.id,
        name: 'GWI Platform API',
        type: DataSourceType.API,
        status: DataSourceStatus.CONNECTED,
        lastSync: new Date(now.getTime() - 30 * 60 * 1000),
        connectionConfig: {
          endpoint: 'https://api.globalwebindex.com/v2',
          authType: 'api_key',
          syncInterval: '1h'
        }
      },
      {
        orgId: acmeCorp.id,
        name: 'Internal Analytics DB',
        type: DataSourceType.DATABASE,
        status: DataSourceStatus.CONNECTED,
        lastSync: new Date(now.getTime() - 15 * 60 * 1000),
        connectionConfig: {
          type: 'postgresql',
          host: 'analytics.internal',
          database: 'metrics',
          ssl: true
        }
      },
      {
        orgId: acmeCorp.id,
        name: 'CSV Data Uploads',
        type: DataSourceType.FILE_UPLOAD,
        status: DataSourceStatus.CONNECTED,
        lastSync: oneDayAgo,
        connectionConfig: {
          supportedFormats: ['csv', 'xlsx', 'json'],
          maxFileSize: '50MB'
        }
      },
      {
        orgId: acmeCorp.id,
        name: 'Slack Notifications',
        type: DataSourceType.WEBHOOK,
        status: DataSourceStatus.CONNECTED,
        connectionConfig: {
          webhookUrl: 'https://hooks.slack.com/services/xxx',
          events: ['agent_completed', 'insight_generated']
        }
      },
      {
        orgId: acmeCorp.id,
        name: 'Salesforce Integration',
        type: DataSourceType.INTEGRATION,
        status: DataSourceStatus.ERROR,
        connectionConfig: {
          platform: 'salesforce',
          instanceUrl: 'https://acme.salesforce.com',
          error: 'OAuth token expired'
        }
      },
      {
        orgId: techStartup.id,
        name: 'GWI Spark API',
        type: DataSourceType.API,
        status: DataSourceStatus.CONNECTED,
        lastSync: oneHourAgo,
        connectionConfig: {
          endpoint: 'https://spark.globalwebindex.com/api',
          authType: 'bearer'
        }
      },
      {
        orgId: enterpriseCo.id,
        name: 'Enterprise Data Warehouse',
        type: DataSourceType.DATABASE,
        status: DataSourceStatus.CONNECTED,
        lastSync: new Date(now.getTime() - 5 * 60 * 1000),
        connectionConfig: {
          type: 'snowflake',
          account: 'enterprise-co',
          warehouse: 'analytics_wh'
        }
      }
    ]
  })

  // ==================== INSIGHTS ====================
  console.log('💡 Creating insights...')

  await prisma.insight.createMany({
    data: [
      {
        orgId: acmeCorp.id,
        agentRunId: completedRun1.id,
        type: 'market_trend',
        title: 'Consumer Electronics Growth Accelerating',
        confidenceScore: 0.92,
        data: {
          trend: 'upward',
          growthRate: 12.3,
          period: 'Q4 2024',
          keyDrivers: ['holiday season', 'new product launches', 'price drops']
        }
      },
      {
        orgId: acmeCorp.id,
        agentRunId: completedRun1.id,
        type: 'competitor_analysis',
        title: 'Competitor X Gaining Market Share',
        confidenceScore: 0.78,
        data: {
          competitor: 'Competitor X',
          marketShareChange: 2.5,
          strategy: 'aggressive pricing',
          threat_level: 'medium'
        }
      },
      {
        orgId: acmeCorp.id,
        agentRunId: completedRun2.id,
        type: 'audience_segment',
        title: 'Millennial Purchase Intent Rising',
        confidenceScore: 0.85,
        data: {
          segment: 'millennials',
          metric: 'purchase_intent',
          change: 8.5,
          topCategories: ['sustainable products', 'tech gadgets', 'experiences']
        }
      },
      {
        orgId: acmeCorp.id,
        type: 'anomaly_detection',
        title: 'Unusual Traffic Pattern Detected',
        confidenceScore: 0.67,
        data: {
          metric: 'website_traffic',
          deviation: 145,
          possibleCauses: ['viral content', 'competitor outage', 'marketing campaign']
        }
      },
      {
        orgId: acmeCorp.id,
        type: 'recommendation',
        title: 'Optimize Ad Spend for Gen-Z',
        confidenceScore: 0.89,
        data: {
          recommendation: 'Shift 15% of ad budget to TikTok and Instagram Reels',
          expectedImpact: '+23% engagement',
          confidence: 'high',
          implementation: 'immediate'
        }
      },
      {
        orgId: techStartup.id,
        type: 'market_opportunity',
        title: 'Untapped Market Segment Identified',
        confidenceScore: 0.74,
        data: {
          segment: 'remote workers 35-44',
          opportunity: 'productivity tools',
          marketSize: '$2.3B',
          competition: 'low'
        }
      },
      {
        orgId: enterpriseCo.id,
        type: 'performance_alert',
        title: 'Campaign ROI Exceeding Targets',
        confidenceScore: 0.95,
        data: {
          campaign: 'Q4 Brand Awareness',
          actualROI: 3.2,
          targetROI: 2.5,
          status: 'exceeding'
        }
      }
    ]
  })

  // ==================== AUDIT LOGS ====================
  console.log('📝 Creating audit logs...')

  const auditActions = [
    { action: 'user.login', resourceType: 'session', userId: adminUser.id },
    { action: 'agent.create', resourceType: 'agent', resourceId: marketResearchAgent.id, userId: adminUser.id },
    { action: 'agent.run.start', resourceType: 'agent_run', resourceId: completedRun1.id, userId: johnDoe.id },
    { action: 'agent.run.complete', resourceType: 'agent_run', resourceId: completedRun1.id, userId: null },
    { action: 'data_source.connect', resourceType: 'data_source', userId: janeSmith.id },
    { action: 'settings.update', resourceType: 'organization', resourceId: acmeCorp.id, userId: adminUser.id },
    { action: 'member.invite', resourceType: 'invitation', userId: adminUser.id },
    { action: 'api_key.create', resourceType: 'api_key', userId: johnDoe.id },
    { action: 'insight.export', resourceType: 'insight', userId: janeSmith.id },
    { action: 'report.generate', resourceType: 'report', userId: johnDoe.id },
  ]

  for (let i = 0; i < auditActions.length; i++) {
    const auditAction = auditActions[i]
    await prisma.auditLog.create({
      data: {
        orgId: acmeCorp.id,
        userId: auditAction.userId,
        action: auditAction.action,
        resourceType: auditAction.resourceType,
        resourceId: auditAction.resourceId,
        ipAddress: '192.168.1.' + (100 + i),
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
        timestamp: new Date(now.getTime() - i * 60 * 60 * 1000),
        metadata: { source: 'web', version: '1.0.0' }
      }
    })
  }

  // ==================== USAGE RECORDS ====================
  console.log('📈 Creating usage records...')

  // Generate usage records for the past 30 days
  for (let day = 0; day < 30; day++) {
    const recordDate = new Date(now.getTime() - day * 24 * 60 * 60 * 1000)

    await prisma.usageRecord.createMany({
      data: [
        {
          orgId: acmeCorp.id,
          metricType: UsageMetric.AGENT_RUNS,
          quantity: Math.floor(Math.random() * 50) + 10,
          recordedAt: recordDate
        },
        {
          orgId: acmeCorp.id,
          metricType: UsageMetric.TOKENS_CONSUMED,
          quantity: Math.floor(Math.random() * 100000) + 20000,
          recordedAt: recordDate
        },
        {
          orgId: acmeCorp.id,
          metricType: UsageMetric.API_CALLS,
          quantity: Math.floor(Math.random() * 500) + 100,
          recordedAt: recordDate
        },
        {
          orgId: techStartup.id,
          metricType: UsageMetric.AGENT_RUNS,
          quantity: Math.floor(Math.random() * 20) + 5,
          recordedAt: recordDate
        },
        {
          orgId: techStartup.id,
          metricType: UsageMetric.TOKENS_CONSUMED,
          quantity: Math.floor(Math.random() * 30000) + 5000,
          recordedAt: recordDate
        }
      ]
    })
  }

  // Current resource usage
  await prisma.usageRecord.createMany({
    data: [
      { orgId: acmeCorp.id, metricType: UsageMetric.DATA_SOURCES, quantity: 5 },
      { orgId: acmeCorp.id, metricType: UsageMetric.TEAM_SEATS, quantity: 5 },
      { orgId: acmeCorp.id, metricType: UsageMetric.STORAGE_GB, quantity: 12 },
      { orgId: techStartup.id, metricType: UsageMetric.DATA_SOURCES, quantity: 1 },
      { orgId: techStartup.id, metricType: UsageMetric.TEAM_SEATS, quantity: 2 },
      { orgId: techStartup.id, metricType: UsageMetric.STORAGE_GB, quantity: 3 },
      { orgId: enterpriseCo.id, metricType: UsageMetric.DATA_SOURCES, quantity: 8 },
      { orgId: enterpriseCo.id, metricType: UsageMetric.TEAM_SEATS, quantity: 25 },
      { orgId: enterpriseCo.id, metricType: UsageMetric.STORAGE_GB, quantity: 150 },
    ]
  })

  // ==================== BILLING SUBSCRIPTIONS ====================
  console.log('💳 Creating billing subscriptions...')

  await prisma.billingSubscription.createMany({
    data: [
      {
        orgId: acmeCorp.id,
        stripeCustomerId: 'cus_acme_test_123',
        stripeSubscriptionId: 'sub_acme_test_456',
        planId: 'professional_monthly',
        status: SubscriptionStatus.ACTIVE,
        currentPeriodEnd: new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000),
        cancelAtPeriodEnd: false
      },
      {
        orgId: techStartup.id,
        stripeCustomerId: 'cus_startup_test_789',
        stripeSubscriptionId: 'sub_startup_test_012',
        planId: 'starter_monthly',
        status: SubscriptionStatus.TRIALING,
        currentPeriodEnd: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
        cancelAtPeriodEnd: false
      },
      {
        orgId: enterpriseCo.id,
        stripeCustomerId: 'cus_enterprise_test_345',
        stripeSubscriptionId: 'sub_enterprise_test_678',
        planId: 'enterprise_yearly',
        status: SubscriptionStatus.ACTIVE,
        currentPeriodEnd: new Date(now.getTime() + 300 * 24 * 60 * 60 * 1000),
        cancelAtPeriodEnd: false
      }
    ]
  })

  // ==================== API KEYS ====================
  console.log('🔑 Creating API keys...')

  const apiKey1 = 'gwi_live_acme_' + crypto.randomBytes(24).toString('hex')
  const apiKey2 = 'gwi_test_acme_' + crypto.randomBytes(24).toString('hex')
  const apiKey3 = 'gwi_live_startup_' + crypto.randomBytes(24).toString('hex')

  await prisma.apiKey.createMany({
    data: [
      {
        orgId: acmeCorp.id,
        userId: adminUser.id,
        name: 'Production API Key',
        keyPrefix: apiKey1.substring(0, 12),
        keyHash: hashApiKey(apiKey1),
        permissions: ['agents:read', 'agents:write', 'insights:read', 'data:read'],
        rateLimit: 1000,
        lastUsed: oneHourAgo
      },
      {
        orgId: acmeCorp.id,
        userId: johnDoe.id,
        name: 'Development API Key',
        keyPrefix: apiKey2.substring(0, 12),
        keyHash: hashApiKey(apiKey2),
        permissions: ['agents:read', 'insights:read'],
        rateLimit: 100,
        lastUsed: oneDayAgo
      },
      {
        orgId: techStartup.id,
        userId: bobWilson.id,
        name: 'Main API Key',
        keyPrefix: apiKey3.substring(0, 12),
        keyHash: hashApiKey(apiKey3),
        permissions: ['agents:read', 'agents:write', 'insights:read'],
        rateLimit: 500
      }
    ]
  })

  // ==================== INVITATIONS ====================
  console.log('✉️ Creating invitations...')

  await prisma.invitation.createMany({
    data: [
      {
        orgId: acmeCorp.id,
        email: 'newuser@acme.com',
        role: Role.MEMBER,
        token: crypto.randomBytes(32).toString('hex'),
        status: InvitationStatus.PENDING,
        expiresAt: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
      },
      {
        orgId: acmeCorp.id,
        email: 'contractor@external.com',
        role: Role.VIEWER,
        token: crypto.randomBytes(32).toString('hex'),
        status: InvitationStatus.PENDING,
        expiresAt: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000)
      },
      {
        orgId: acmeCorp.id,
        email: 'expired@test.com',
        role: Role.MEMBER,
        token: crypto.randomBytes(32).toString('hex'),
        status: InvitationStatus.EXPIRED,
        expiresAt: oneWeekAgo
      },
      {
        orgId: enterpriseCo.id,
        email: 'analyst@enterprise.co',
        role: Role.MEMBER,
        token: crypto.randomBytes(32).toString('hex'),
        status: InvitationStatus.ACCEPTED,
        expiresAt: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
      }
    ]
  })

  // ==================== SSO CONFIGURATION ====================
  console.log('🔐 Creating SSO configurations...')

  await prisma.sSOConfiguration.create({
    data: {
      orgId: enterpriseCo.id,
      provider: 'saml',
      metadataUrl: 'https://login.enterprise.co/saml/metadata',
      enabled: true
    }
  })

  // ==================== SUMMARY ====================
  console.log('\n✅ Database seeding completed!')
  console.log('\n📊 Summary:')
  console.log('   Organizations: 3')
  console.log('   Users: 7')
  console.log('   Organization Memberships: 10')
  console.log('   Agents: 7')
  console.log('   Agent Runs: 15+')
  console.log('   Data Sources: 7')
  console.log('   Insights: 7')
  console.log('   Audit Logs: 10')
  console.log('   Usage Records: 150+')
  console.log('   Billing Subscriptions: 3')
  console.log('   API Keys: 3')
  console.log('   Invitations: 4')
  console.log('   SSO Configurations: 1')

  console.log('\n🔑 Test Credentials:')
  console.log('   ────────────────────────────────────────')
  console.log('   Demo User (easiest):')
  console.log('     Email: demo@example.com')
  console.log('     Password: demo123')
  console.log('   ────────────────────────────────────────')
  console.log('   Admin User (Acme Corp Owner):')
  console.log('     Email: admin@acme.com')
  console.log('     Password: Password123!')
  console.log('   ────────────────────────────────────────')
  console.log('   All other users use: Password123!')
  console.log('')
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
