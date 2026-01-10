import { PrismaClient, Role, PlanTier, AgentType, AgentStatus, AgentRunStatus, DataSourceType, DataSourceStatus, UsageMetric, SubscriptionStatus, InvitationStatus, DashboardStatus } from '@prisma/client'
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
  await prisma.crosstab.deleteMany()
  await prisma.dashboard.deleteMany()
  await prisma.audience.deleteMany()
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

  // ==================== AUDIENCES ====================
  console.log('👥 Creating audiences...')

  const genZAudience = await prisma.audience.create({
    data: {
      orgId: acmeCorp.id,
      name: 'Gen Z (18-24)',
      description: 'Digital natives born 1997-2009, highly active on social media and mobile-first',
      criteria: {
        ageRange: { min: 18, max: 24 },
        generation: 'gen_z',
        interests: ['social_media', 'gaming', 'streaming', 'sustainability']
      },
      size: 4850000,
      markets: ['US', 'UK', 'DE', 'FR'],
      isFavorite: true,
      createdBy: adminUser.id
    }
  })

  const millennialsAudience = await prisma.audience.create({
    data: {
      orgId: acmeCorp.id,
      name: 'Millennials (25-40)',
      description: 'Tech-savvy generation balancing work and life, value experiences over possessions',
      criteria: {
        ageRange: { min: 25, max: 40 },
        generation: 'millennials',
        interests: ['career', 'travel', 'wellness', 'sustainability']
      },
      size: 7200000,
      markets: ['US', 'UK', 'DE', 'FR', 'ES'],
      isFavorite: true,
      createdBy: adminUser.id
    }
  })

  const genXAudience = await prisma.audience.create({
    data: {
      orgId: acmeCorp.id,
      name: 'Gen X (41-56)',
      description: 'Established professionals with high purchasing power, value quality and reliability',
      criteria: {
        ageRange: { min: 41, max: 56 },
        generation: 'gen_x',
        interests: ['family', 'finance', 'home', 'health']
      },
      size: 5100000,
      markets: ['US', 'UK', 'DE'],
      isFavorite: false,
      createdBy: johnDoe.id
    }
  })

  const boomersAudience = await prisma.audience.create({
    data: {
      orgId: acmeCorp.id,
      name: 'Boomers (57+)',
      description: 'Experienced consumers with wealth accumulation, prefer traditional media channels',
      criteria: {
        ageRange: { min: 57, max: 75 },
        generation: 'boomers',
        interests: ['travel', 'health', 'grandchildren', 'news']
      },
      size: 6800000,
      markets: ['US', 'UK'],
      isFavorite: false,
      createdBy: johnDoe.id
    }
  })

  const affluentConsumers = await prisma.audience.create({
    data: {
      orgId: acmeCorp.id,
      name: 'Affluent Consumers ($150K+)',
      description: 'High-income households with premium purchasing behavior',
      criteria: {
        incomeRange: { min: 150000 },
        lifestyle: 'premium',
        interests: ['luxury', 'travel', 'investing', 'fine_dining']
      },
      size: 2400000,
      markets: ['US', 'UK', 'DE', 'FR', 'CH'],
      isFavorite: true,
      createdBy: adminUser.id
    }
  })

  const sustainabilityFocused = await prisma.audience.create({
    data: {
      orgId: acmeCorp.id,
      name: 'Sustainability Advocates',
      description: 'Environmentally conscious consumers willing to pay premium for eco-friendly products',
      criteria: {
        values: ['sustainability', 'ethical_consumption'],
        behaviors: ['recycles', 'buys_organic', 'reduces_plastic']
      },
      size: 3200000,
      markets: ['US', 'UK', 'DE', 'NL', 'SE'],
      isFavorite: true,
      createdBy: janeSmith.id
    }
  })

  const techEnthusiasts = await prisma.audience.create({
    data: {
      orgId: acmeCorp.id,
      name: 'Tech Enthusiasts',
      description: 'Early adopters who follow tech trends and influence purchase decisions',
      criteria: {
        interests: ['technology', 'gadgets', 'gaming', 'innovation'],
        behaviors: ['early_adopter', 'tech_reviewer', 'influencer']
      },
      size: 1800000,
      markets: ['US', 'UK', 'JP', 'KR', 'DE'],
      isFavorite: false,
      createdBy: johnDoe.id
    }
  })

  const urbanProfessionals = await prisma.audience.create({
    data: {
      orgId: acmeCorp.id,
      name: 'Urban Professionals',
      description: 'City-dwelling professionals with busy lifestyles, convenience-oriented',
      criteria: {
        location: 'urban',
        occupation: 'professional',
        lifestyle: ['busy', 'convenience_focused', 'health_conscious']
      },
      size: 4100000,
      markets: ['US', 'UK', 'DE', 'FR', 'JP'],
      isFavorite: false,
      createdBy: adminUser.id
    }
  })

  // Tech Startup audiences
  await prisma.audience.create({
    data: {
      orgId: techStartup.id,
      name: 'SaaS Decision Makers',
      description: 'Business leaders responsible for software purchasing decisions',
      criteria: {
        role: ['cto', 'cio', 'it_director', 'procurement'],
        companySize: { min: 50 }
      },
      size: 450000,
      markets: ['US', 'UK', 'DE'],
      isFavorite: true,
      createdBy: bobWilson.id
    }
  })

  await prisma.audience.create({
    data: {
      orgId: techStartup.id,
      name: 'Startup Founders',
      description: 'Entrepreneurs building early-stage companies',
      criteria: {
        role: ['founder', 'co_founder', 'ceo'],
        companyStage: ['seed', 'series_a']
      },
      size: 180000,
      markets: ['US', 'UK'],
      isFavorite: true,
      createdBy: bobWilson.id
    }
  })

  // Enterprise audiences
  await prisma.audience.create({
    data: {
      orgId: enterpriseCo.id,
      name: 'Enterprise Buyers',
      description: 'Large organization decision makers with complex buying processes',
      criteria: {
        companySize: { min: 1000 },
        role: ['vp', 'director', 'senior_manager'],
        budget: { min: 100000 }
      },
      size: 320000,
      markets: ['US', 'UK', 'DE', 'FR', 'JP', 'AU'],
      isFavorite: true,
      createdBy: sarahEnterprise.id
    }
  })

  // ==================== CROSSTABS ====================
  console.log('📊 Creating crosstabs...')

  // Social Media Platform Analysis Crosstab
  await prisma.crosstab.create({
    data: {
      orgId: acmeCorp.id,
      name: 'Generational Social Media Platform Analysis',
      description: 'Compare social platform usage, engagement, and content preferences across generational cohorts',
      audiences: [genZAudience.id, millennialsAudience.id, genXAudience.id, boomersAudience.id],
      metrics: ['TikTok Usage', 'Instagram Usage', 'Facebook Usage', 'YouTube Usage', 'LinkedIn Usage', 'Twitter/X Usage', 'Snapchat Usage', 'Pinterest Usage'],
      filters: {
        timeframe: 'last_30_days',
        markets: ['US', 'UK'],
        metric_type: 'percentage'
      },
      results: {
        data: [
          { audience: 'Gen Z (18-24)', 'TikTok Usage': 78, 'Instagram Usage': 82, 'Facebook Usage': 32, 'YouTube Usage': 91, 'LinkedIn Usage': 18, 'Twitter/X Usage': 38, 'Snapchat Usage': 65, 'Pinterest Usage': 24 },
          { audience: 'Millennials (25-40)', 'TikTok Usage': 52, 'Instagram Usage': 74, 'Facebook Usage': 68, 'YouTube Usage': 85, 'LinkedIn Usage': 45, 'Twitter/X Usage': 42, 'Snapchat Usage': 28, 'Pinterest Usage': 38 },
          { audience: 'Gen X (41-56)', 'TikTok Usage': 24, 'Instagram Usage': 48, 'Facebook Usage': 78, 'YouTube Usage': 72, 'LinkedIn Usage': 52, 'Twitter/X Usage': 35, 'Snapchat Usage': 8, 'Pinterest Usage': 42 },
          { audience: 'Boomers (57+)', 'TikTok Usage': 8, 'Instagram Usage': 22, 'Facebook Usage': 82, 'YouTube Usage': 58, 'LinkedIn Usage': 28, 'Twitter/X Usage': 18, 'Snapchat Usage': 2, 'Pinterest Usage': 35 }
        ],
        generatedAt: new Date().toISOString(),
        sampleSize: 12500
      },
      views: 342,
      createdBy: adminUser.id
    }
  })

  // Purchase Channel Preferences Crosstab
  await prisma.crosstab.create({
    data: {
      orgId: acmeCorp.id,
      name: 'Income Segment Purchase Channel Preferences',
      description: 'Analyze shopping channel preferences and behaviors across income segments',
      audiences: [affluentConsumers.id, millennialsAudience.id, genXAudience.id],
      metrics: ['E-commerce', 'In-Store Retail', 'Mobile Apps', 'Social Commerce', 'Subscription Services', 'D2C Brands', 'Marketplaces'],
      filters: {
        timeframe: 'last_90_days',
        markets: ['US'],
        category: 'retail'
      },
      results: {
        data: [
          { audience: 'Affluent Consumers ($150K+)', 'E-commerce': 72, 'In-Store Retail': 58, 'Mobile Apps': 68, 'Social Commerce': 28, 'Subscription Services': 64, 'D2C Brands': 52, 'Marketplaces': 45 },
          { audience: 'Millennials (25-40)', 'E-commerce': 78, 'In-Store Retail': 42, 'Mobile Apps': 82, 'Social Commerce': 45, 'Subscription Services': 58, 'D2C Brands': 48, 'Marketplaces': 72 },
          { audience: 'Gen X (41-56)', 'E-commerce': 68, 'In-Store Retail': 72, 'Mobile Apps': 52, 'Social Commerce': 18, 'Subscription Services': 42, 'D2C Brands': 32, 'Marketplaces': 65 }
        ],
        generatedAt: new Date().toISOString(),
        sampleSize: 8200
      },
      views: 186,
      createdBy: johnDoe.id
    }
  })

  // Brand Health Funnel Crosstab
  await prisma.crosstab.create({
    data: {
      orgId: acmeCorp.id,
      name: 'Brand Health Funnel Analysis',
      description: 'Track brand metrics through the purchase funnel against key competitors',
      audiences: [genZAudience.id, millennialsAudience.id, affluentConsumers.id],
      metrics: ['Awareness', 'Consideration', 'Preference', 'Purchase', 'Loyalty', 'Advocacy', 'NPS Score'],
      filters: {
        brands: ['our_brand', 'competitor_a', 'competitor_b', 'competitor_c'],
        timeframe: 'current_quarter',
        markets: ['US', 'UK', 'DE']
      },
      results: {
        data: [
          { audience: 'Gen Z (18-24)', 'Awareness': 68, 'Consideration': 52, 'Preference': 38, 'Purchase': 24, 'Loyalty': 72, 'Advocacy': 45, 'NPS Score': 42 },
          { audience: 'Millennials (25-40)', 'Awareness': 82, 'Consideration': 68, 'Preference': 54, 'Purchase': 42, 'Loyalty': 78, 'Advocacy': 58, 'NPS Score': 56 },
          { audience: 'Affluent Consumers ($150K+)', 'Awareness': 75, 'Consideration': 62, 'Preference': 48, 'Purchase': 38, 'Loyalty': 82, 'Advocacy': 65, 'NPS Score': 62 }
        ],
        generatedAt: new Date().toISOString(),
        sampleSize: 6800
      },
      views: 278,
      createdBy: adminUser.id
    }
  })

  // Sustainability Attitudes Crosstab
  await prisma.crosstab.create({
    data: {
      orgId: acmeCorp.id,
      name: 'Sustainability Attitudes by Consumer Segment',
      description: 'Compare environmental attitudes and sustainable purchasing behaviors',
      audiences: [sustainabilityFocused.id, genZAudience.id, millennialsAudience.id, affluentConsumers.id],
      metrics: ['Pay Premium for Eco', 'Check Brand Ethics', 'Reduce Plastic', 'Buy Second-Hand', 'Carbon Awareness', 'Support Local', 'Boycott Unethical Brands'],
      filters: {
        timeframe: 'last_6_months',
        markets: ['US', 'UK', 'DE', 'NL']
      },
      results: {
        data: [
          { audience: 'Sustainability Advocates', 'Pay Premium for Eco': 82, 'Check Brand Ethics': 88, 'Reduce Plastic': 92, 'Buy Second-Hand': 68, 'Carbon Awareness': 78, 'Support Local': 85, 'Boycott Unethical Brands': 75 },
          { audience: 'Gen Z (18-24)', 'Pay Premium for Eco': 58, 'Check Brand Ethics': 72, 'Reduce Plastic': 65, 'Buy Second-Hand': 72, 'Carbon Awareness': 62, 'Support Local': 55, 'Boycott Unethical Brands': 68 },
          { audience: 'Millennials (25-40)', 'Pay Premium for Eco': 52, 'Check Brand Ethics': 65, 'Reduce Plastic': 58, 'Buy Second-Hand': 45, 'Carbon Awareness': 55, 'Support Local': 62, 'Boycott Unethical Brands': 58 },
          { audience: 'Affluent Consumers ($150K+)', 'Pay Premium for Eco': 68, 'Check Brand Ethics': 58, 'Reduce Plastic': 52, 'Buy Second-Hand': 22, 'Carbon Awareness': 48, 'Support Local': 72, 'Boycott Unethical Brands': 42 }
        ],
        generatedAt: new Date().toISOString(),
        sampleSize: 9400
      },
      views: 156,
      createdBy: janeSmith.id
    }
  })

  // Media Consumption Crosstab
  await prisma.crosstab.create({
    data: {
      orgId: acmeCorp.id,
      name: 'Media Consumption by Daypart',
      description: 'Understand media consumption patterns throughout the day for optimal ad scheduling',
      audiences: [genZAudience.id, millennialsAudience.id, genXAudience.id, urbanProfessionals.id],
      metrics: ['Linear TV', 'Streaming Video', 'Social Media', 'Podcasts', 'Radio', 'News Sites', 'Gaming', 'Music Streaming'],
      filters: {
        dayparts: ['morning_6_9', 'daytime_9_17', 'evening_17_21', 'late_night_21_24'],
        markets: ['US']
      },
      results: {
        data: [
          { audience: 'Gen Z (18-24)', 'Linear TV': 12, 'Streaming Video': 78, 'Social Media': 92, 'Podcasts': 42, 'Radio': 18, 'News Sites': 35, 'Gaming': 68, 'Music Streaming': 85 },
          { audience: 'Millennials (25-40)', 'Linear TV': 28, 'Streaming Video': 72, 'Social Media': 78, 'Podcasts': 58, 'Radio': 32, 'News Sites': 55, 'Gaming': 45, 'Music Streaming': 72 },
          { audience: 'Gen X (41-56)', 'Linear TV': 52, 'Streaming Video': 58, 'Social Media': 48, 'Podcasts': 45, 'Radio': 48, 'News Sites': 68, 'Gaming': 22, 'Music Streaming': 42 },
          { audience: 'Urban Professionals', 'Linear TV': 22, 'Streaming Video': 65, 'Social Media': 72, 'Podcasts': 68, 'Radio': 42, 'News Sites': 75, 'Gaming': 28, 'Music Streaming': 65 }
        ],
        generatedAt: new Date().toISOString(),
        sampleSize: 7800
      },
      views: 234,
      createdBy: johnDoe.id
    }
  })

  // Streaming Service Comparison Crosstab
  await prisma.crosstab.create({
    data: {
      orgId: acmeCorp.id,
      name: 'Streaming Service Competitive Analysis',
      description: 'Compare streaming platform usage, satisfaction, and engagement metrics',
      audiences: [genZAudience.id, millennialsAudience.id, genXAudience.id],
      metrics: ['Weekly Usage', 'Satisfaction Score', 'Value Perception', 'Content Quality', 'Would Recommend', 'Cancel Intent'],
      filters: {
        platforms: ['netflix', 'disney_plus', 'amazon_prime', 'hbo_max', 'hulu', 'apple_tv', 'youtube_premium'],
        timeframe: 'current_month'
      },
      results: {
        data: [
          { audience: 'Gen Z (18-24)', 'Weekly Usage': 85, 'Satisfaction Score': 78, 'Value Perception': 65, 'Content Quality': 82, 'Would Recommend': 72, 'Cancel Intent': 18 },
          { audience: 'Millennials (25-40)', 'Weekly Usage': 78, 'Satisfaction Score': 75, 'Value Perception': 58, 'Content Quality': 78, 'Would Recommend': 68, 'Cancel Intent': 22 },
          { audience: 'Gen X (41-56)', 'Weekly Usage': 62, 'Satisfaction Score': 72, 'Value Perception': 55, 'Content Quality': 75, 'Would Recommend': 65, 'Cancel Intent': 25 }
        ],
        generatedAt: new Date().toISOString(),
        sampleSize: 5200
      },
      views: 198,
      createdBy: adminUser.id
    }
  })

  // Tech Startup Crosstabs
  await prisma.crosstab.create({
    data: {
      orgId: techStartup.id,
      name: 'SaaS Purchase Decision Factors',
      description: 'Analyze what factors drive B2B software purchasing decisions',
      audiences: [],
      metrics: ['Price', 'Features', 'Integration', 'Support', 'Security', 'Scalability', 'User Reviews'],
      filters: {
        companySize: ['smb', 'mid_market', 'enterprise'],
        industry: ['tech', 'finance', 'healthcare', 'retail']
      },
      results: {
        data: [
          { segment: 'SMB (10-100)', 'Price': 85, 'Features': 72, 'Integration': 58, 'Support': 65, 'Security': 55, 'Scalability': 42, 'User Reviews': 78 },
          { segment: 'Mid-Market (100-1000)', 'Price': 68, 'Features': 78, 'Integration': 72, 'Support': 75, 'Security': 72, 'Scalability': 68, 'User Reviews': 58 },
          { segment: 'Enterprise (1000+)', 'Price': 45, 'Features': 82, 'Integration': 85, 'Support': 88, 'Security': 92, 'Scalability': 85, 'User Reviews': 42 }
        ],
        generatedAt: new Date().toISOString(),
        sampleSize: 2400
      },
      views: 89,
      createdBy: bobWilson.id
    }
  })

  // Enterprise Crosstabs
  await prisma.crosstab.create({
    data: {
      orgId: enterpriseCo.id,
      name: 'Global Market Digital Behavior Comparison',
      description: 'Compare digital behaviors and preferences across key global markets',
      audiences: [],
      metrics: ['Mobile-First', 'Social Commerce', 'Voice Search', 'AR/VR Adoption', 'Contactless Payments', 'Smart Home', 'Wearables'],
      filters: {
        markets: ['US', 'UK', 'DE', 'JP', 'CN', 'BR', 'IN'],
        demographic: 'all_adults'
      },
      results: {
        data: [
          { market: 'United States', 'Mobile-First': 72, 'Social Commerce': 45, 'Voice Search': 58, 'AR/VR Adoption': 28, 'Contactless Payments': 62, 'Smart Home': 48, 'Wearables': 42 },
          { market: 'United Kingdom', 'Mobile-First': 68, 'Social Commerce': 38, 'Voice Search': 52, 'AR/VR Adoption': 22, 'Contactless Payments': 78, 'Smart Home': 42, 'Wearables': 38 },
          { market: 'Germany', 'Mobile-First': 58, 'Social Commerce': 28, 'Voice Search': 42, 'AR/VR Adoption': 18, 'Contactless Payments': 55, 'Smart Home': 52, 'Wearables': 35 },
          { market: 'Japan', 'Mobile-First': 82, 'Social Commerce': 52, 'Voice Search': 35, 'AR/VR Adoption': 32, 'Contactless Payments': 85, 'Smart Home': 38, 'Wearables': 48 },
          { market: 'China', 'Mobile-First': 92, 'Social Commerce': 78, 'Voice Search': 68, 'AR/VR Adoption': 45, 'Contactless Payments': 95, 'Smart Home': 62, 'Wearables': 58 }
        ],
        generatedAt: new Date().toISOString(),
        sampleSize: 25000
      },
      views: 412,
      createdBy: sarahEnterprise.id
    }
  })

  // ==================== DASHBOARDS ====================
  console.log('📈 Creating dashboards...')

  // Marketing Performance Dashboard
  await prisma.dashboard.create({
    data: {
      orgId: acmeCorp.id,
      name: 'Marketing Performance Overview',
      description: 'Track key marketing metrics, campaign performance, and audience engagement',
      layout: [
        { i: 'kpi-1', x: 0, y: 0, w: 3, h: 2 },
        { i: 'kpi-2', x: 3, y: 0, w: 3, h: 2 },
        { i: 'kpi-3', x: 6, y: 0, w: 3, h: 2 },
        { i: 'kpi-4', x: 9, y: 0, w: 3, h: 2 },
        { i: 'chart-1', x: 0, y: 2, w: 6, h: 4 },
        { i: 'chart-2', x: 6, y: 2, w: 6, h: 4 },
        { i: 'table-1', x: 0, y: 6, w: 12, h: 4 }
      ],
      widgets: [
        { id: 'kpi-1', type: 'kpi', title: 'Total Reach', value: '2.4M', change: 12.5, trend: 'up' },
        { id: 'kpi-2', type: 'kpi', title: 'Engagement Rate', value: '4.8%', change: 0.8, trend: 'up' },
        { id: 'kpi-3', type: 'kpi', title: 'Brand Awareness', value: '68%', change: 5.2, trend: 'up' },
        { id: 'kpi-4', type: 'kpi', title: 'Share of Voice', value: '24%', change: -2.1, trend: 'down' },
        { id: 'chart-1', type: 'line', title: 'Engagement Trend', dataSource: 'engagement_metrics', timeframe: 'last_30_days' },
        { id: 'chart-2', type: 'bar', title: 'Channel Performance', dataSource: 'channel_metrics' },
        { id: 'table-1', type: 'crosstab', title: 'Audience Segments Performance', crosstabId: 'latest' }
      ],
      status: DashboardStatus.PUBLISHED,
      isPublic: false,
      views: 1245,
      createdBy: adminUser.id
    }
  })

  // Audience Insights Dashboard
  await prisma.dashboard.create({
    data: {
      orgId: acmeCorp.id,
      name: 'Audience Insights Dashboard',
      description: 'Deep-dive into audience demographics, behaviors, and preferences',
      layout: [
        { i: 'chart-demo', x: 0, y: 0, w: 6, h: 4 },
        { i: 'chart-interest', x: 6, y: 0, w: 6, h: 4 },
        { i: 'chart-platform', x: 0, y: 4, w: 4, h: 4 },
        { i: 'chart-device', x: 4, y: 4, w: 4, h: 4 },
        { i: 'chart-location', x: 8, y: 4, w: 4, h: 4 }
      ],
      widgets: [
        { id: 'chart-demo', type: 'pie', title: 'Age Distribution', dataSource: 'demographics', dimension: 'age' },
        { id: 'chart-interest', type: 'bar', title: 'Top Interests', dataSource: 'interests', limit: 10 },
        { id: 'chart-platform', type: 'donut', title: 'Platform Preference', dataSource: 'platforms' },
        { id: 'chart-device', type: 'donut', title: 'Device Usage', dataSource: 'devices' },
        { id: 'chart-location', type: 'treemap', title: 'Geographic Distribution', dataSource: 'locations' }
      ],
      status: DashboardStatus.PUBLISHED,
      isPublic: false,
      views: 892,
      createdBy: johnDoe.id
    }
  })

  // Brand Health Dashboard
  await prisma.dashboard.create({
    data: {
      orgId: acmeCorp.id,
      name: 'Brand Health Tracker',
      description: 'Monitor brand awareness, consideration, and sentiment over time',
      layout: [
        { i: 'funnel', x: 0, y: 0, w: 6, h: 5 },
        { i: 'nps', x: 6, y: 0, w: 3, h: 5 },
        { i: 'sentiment', x: 9, y: 0, w: 3, h: 5 },
        { i: 'trend', x: 0, y: 5, w: 8, h: 4 },
        { i: 'competitors', x: 8, y: 5, w: 4, h: 4 }
      ],
      widgets: [
        { id: 'funnel', type: 'funnel', title: 'Brand Health Funnel', stages: ['Awareness', 'Consideration', 'Preference', 'Purchase', 'Loyalty'] },
        { id: 'nps', type: 'gauge', title: 'Net Promoter Score', value: 42, min: -100, max: 100 },
        { id: 'sentiment', type: 'gauge', title: 'Brand Sentiment', value: 72, min: 0, max: 100 },
        { id: 'trend', type: 'line', title: 'Brand Metrics Trend', metrics: ['awareness', 'consideration', 'preference'], timeframe: 'last_12_months' },
        { id: 'competitors', type: 'radar', title: 'Competitive Positioning', competitors: ['Brand A', 'Brand B', 'Brand C'] }
      ],
      status: DashboardStatus.PUBLISHED,
      isPublic: false,
      views: 567,
      createdBy: adminUser.id
    }
  })

  // Social Media Analytics Dashboard
  await prisma.dashboard.create({
    data: {
      orgId: acmeCorp.id,
      name: 'Social Media Analytics',
      description: 'Track social media performance across all platforms',
      layout: [
        { i: 'followers', x: 0, y: 0, w: 3, h: 2 },
        { i: 'engagement', x: 3, y: 0, w: 3, h: 2 },
        { i: 'reach', x: 6, y: 0, w: 3, h: 2 },
        { i: 'mentions', x: 9, y: 0, w: 3, h: 2 },
        { i: 'platform-breakdown', x: 0, y: 2, w: 6, h: 4 },
        { i: 'content-performance', x: 6, y: 2, w: 6, h: 4 }
      ],
      widgets: [
        { id: 'followers', type: 'kpi', title: 'Total Followers', value: '1.2M', change: 8.5, trend: 'up' },
        { id: 'engagement', type: 'kpi', title: 'Avg Engagement', value: '5.2%', change: 1.2, trend: 'up' },
        { id: 'reach', type: 'kpi', title: 'Weekly Reach', value: '3.8M', change: 15.3, trend: 'up' },
        { id: 'mentions', type: 'kpi', title: 'Brand Mentions', value: '12.4K', change: -5.2, trend: 'down' },
        { id: 'platform-breakdown', type: 'bar', title: 'Platform Performance', platforms: ['Instagram', 'TikTok', 'Facebook', 'LinkedIn', 'Twitter'] },
        { id: 'content-performance', type: 'heatmap', title: 'Best Posting Times', dimensions: ['day', 'hour'] }
      ],
      status: DashboardStatus.PUBLISHED,
      isPublic: true,
      views: 2341,
      createdBy: janeSmith.id
    }
  })

  // Consumer Trends Dashboard
  await prisma.dashboard.create({
    data: {
      orgId: acmeCorp.id,
      name: 'Consumer Trends Monitor',
      description: 'Stay ahead of emerging consumer trends and market shifts',
      layout: [
        { i: 'trending-topics', x: 0, y: 0, w: 6, h: 4 },
        { i: 'sentiment-analysis', x: 6, y: 0, w: 6, h: 4 },
        { i: 'category-growth', x: 0, y: 4, w: 12, h: 4 }
      ],
      widgets: [
        { id: 'trending-topics', type: 'wordcloud', title: 'Trending Topics', dataSource: 'social_listening' },
        { id: 'sentiment-analysis', type: 'area', title: 'Sentiment Over Time', metrics: ['positive', 'neutral', 'negative'] },
        { id: 'category-growth', type: 'bar', title: 'Category Growth Rates', categories: ['Sustainability', 'Wellness', 'Tech', 'Experience', 'Value'] }
      ],
      status: DashboardStatus.DRAFT,
      isPublic: false,
      views: 128,
      createdBy: johnDoe.id
    }
  })

  // Tech Startup Dashboard
  await prisma.dashboard.create({
    data: {
      orgId: techStartup.id,
      name: 'Product Analytics Dashboard',
      description: 'Track product usage, feature adoption, and user engagement',
      layout: [
        { i: 'dau', x: 0, y: 0, w: 4, h: 2 },
        { i: 'retention', x: 4, y: 0, w: 4, h: 2 },
        { i: 'nps', x: 8, y: 0, w: 4, h: 2 },
        { i: 'feature-usage', x: 0, y: 2, w: 6, h: 4 },
        { i: 'user-journey', x: 6, y: 2, w: 6, h: 4 }
      ],
      widgets: [
        { id: 'dau', type: 'kpi', title: 'Daily Active Users', value: '24.5K', change: 12.3, trend: 'up' },
        { id: 'retention', type: 'kpi', title: '30-Day Retention', value: '42%', change: 3.5, trend: 'up' },
        { id: 'nps', type: 'kpi', title: 'Product NPS', value: '48', change: 5, trend: 'up' },
        { id: 'feature-usage', type: 'bar', title: 'Feature Adoption', features: ['Dashboard', 'Reports', 'API', 'Integrations', 'Collaboration'] },
        { id: 'user-journey', type: 'funnel', title: 'User Activation Funnel', stages: ['Signup', 'Onboarding', 'First Action', 'Habit', 'Advocate'] }
      ],
      status: DashboardStatus.PUBLISHED,
      isPublic: false,
      views: 456,
      createdBy: bobWilson.id
    }
  })

  // Enterprise Dashboard
  await prisma.dashboard.create({
    data: {
      orgId: enterpriseCo.id,
      name: 'Global Market Intelligence',
      description: 'Comprehensive view of market performance across regions',
      layout: [
        { i: 'world-map', x: 0, y: 0, w: 8, h: 5 },
        { i: 'region-kpis', x: 8, y: 0, w: 4, h: 5 },
        { i: 'market-trends', x: 0, y: 5, w: 6, h: 4 },
        { i: 'competitor-share', x: 6, y: 5, w: 6, h: 4 }
      ],
      widgets: [
        { id: 'world-map', type: 'map', title: 'Market Performance by Region', metric: 'revenue', regions: ['NA', 'EMEA', 'APAC', 'LATAM'] },
        { id: 'region-kpis', type: 'table', title: 'Regional KPIs', columns: ['Region', 'Revenue', 'Growth', 'Market Share'] },
        { id: 'market-trends', type: 'line', title: 'Market Trends', timeframe: 'last_24_months' },
        { id: 'competitor-share', type: 'pie', title: 'Competitive Market Share' }
      ],
      status: DashboardStatus.PUBLISHED,
      isPublic: false,
      views: 892,
      createdBy: sarahEnterprise.id
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
  console.log('   Audiences: 11')
  console.log('   Crosstabs: 9')
  console.log('   Dashboards: 7')
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
