import { PrismaClient, Role, PlanTier, AgentType, AgentStatus, AgentRunStatus, DataSourceType, DataSourceStatus, UsageMetric, SubscriptionStatus, InvitationStatus, BrandTrackingStatus } from '@prisma/client'
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
  await prisma.brandTrackingSnapshot.deleteMany()
  await prisma.brandTracking.deleteMany()
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

  // ==================== BRAND TRACKING ====================
  console.log('🎯 Creating brand tracking data...')

  // Helper function to generate realistic brand metrics with progression
  function generateBrandMetricsForDate(
    baseAwareness: number,
    baseHealth: number,
    baseNps: number,
    dayIndex: number,
    totalDays: number,
    trend: 'up' | 'down' | 'stable'
  ) {
    // Add realistic progression based on trend
    const trendMultiplier = trend === 'up' ? 1.003 : trend === 'down' ? 0.997 : 1
    const progressFactor = Math.pow(trendMultiplier, dayIndex)

    // Add natural variance
    const variance = () => (Math.random() - 0.5) * 4

    const awareness = Math.min(95, Math.max(20, baseAwareness * progressFactor + variance()))
    const consideration = awareness * (0.55 + Math.random() * 0.15) + variance()
    const preference = consideration * (0.6 + Math.random() * 0.15) + variance()
    const loyalty = preference * (0.65 + Math.random() * 0.15) + variance()

    return {
      brandHealth: Math.min(100, Math.max(40, baseHealth * progressFactor + variance())),
      awareness,
      consideration,
      preference,
      loyalty,
      nps: Math.min(80, Math.max(-10, baseNps * progressFactor + variance() * 3)),
      marketShare: 15 + Math.random() * 20 + (dayIndex * (trend === 'up' ? 0.1 : trend === 'down' ? -0.05 : 0)),
      sentimentScore: 0.3 + Math.random() * 0.5,
    }
  }

  // Nike Brand Tracking - Strong, upward trend
  const nikeBrandTracking = await prisma.brandTracking.create({
    data: {
      orgId: acmeCorp.id,
      brandName: 'Nike',
      description: 'Global leader in athletic footwear and apparel. Tracking brand health, awareness, and competitive positioning across key demographics.',
      industry: 'Sportswear & Athletic Apparel',
      competitors: ['Adidas', 'Under Armour', 'Puma', 'New Balance', 'Reebok'],
      audiences: ['Gen Z Athletes', 'Millennials', 'Fitness Enthusiasts', 'Sneaker Culture'],
      status: BrandTrackingStatus.ACTIVE,
      schedule: '0 6 * * *',
      metrics: {
        brandAwareness: true,
        consideration: true,
        preference: true,
        loyalty: true,
        nps: true,
        sentimentAnalysis: true
      },
      alertThresholds: {
        brandHealth: { min: 70, max: 100 },
        nps: { min: 40, max: 100 }
      },
      createdBy: adminUser.id,
      snapshotCount: 52,
      lastSnapshot: new Date(now.getTime() - 2 * 60 * 60 * 1000),
    }
  })

  // Create 52 weeks of historical data for Nike (weekly snapshots)
  const nikeSnapshots = []
  for (let week = 51; week >= 0; week--) {
    const snapshotDate = new Date(now.getTime() - week * 7 * 24 * 60 * 60 * 1000)
    const metrics = generateBrandMetricsForDate(78, 82, 58, 51 - week, 52, 'up')

    nikeSnapshots.push({
      brandTrackingId: nikeBrandTracking.id,
      orgId: acmeCorp.id,
      snapshotDate,
      metrics,
      brandHealth: metrics.brandHealth,
      awareness: metrics.awareness,
      consideration: metrics.consideration,
      preference: metrics.preference,
      loyalty: metrics.loyalty,
      nps: metrics.nps,
      marketShare: metrics.marketShare,
      sentimentScore: metrics.sentimentScore,
      competitorData: {
        'Adidas': { awareness: 72 + Math.random() * 5, consideration: 45 + Math.random() * 8, marketShare: 18 + Math.random() * 4, sentiment: 0.65 + Math.random() * 0.15 },
        'Under Armour': { awareness: 58 + Math.random() * 8, consideration: 32 + Math.random() * 6, marketShare: 8 + Math.random() * 3, sentiment: 0.55 + Math.random() * 0.2 },
        'Puma': { awareness: 62 + Math.random() * 6, consideration: 35 + Math.random() * 7, marketShare: 10 + Math.random() * 3, sentiment: 0.6 + Math.random() * 0.15 },
        'New Balance': { awareness: 55 + Math.random() * 8, consideration: 38 + Math.random() * 6, marketShare: 7 + Math.random() * 3, sentiment: 0.7 + Math.random() * 0.1 },
        'Reebok': { awareness: 48 + Math.random() * 8, consideration: 25 + Math.random() * 5, marketShare: 5 + Math.random() * 2, sentiment: 0.5 + Math.random() * 0.2 },
      },
      audienceBreakdown: {
        '18-24': { awareness: metrics.awareness * 1.15, preference: metrics.preference * 1.2, nps: metrics.nps * 1.1 },
        '25-34': { awareness: metrics.awareness * 1.1, preference: metrics.preference * 1.1, nps: metrics.nps * 1.05 },
        '35-44': { awareness: metrics.awareness, preference: metrics.preference * 0.95, nps: metrics.nps },
        '45-54': { awareness: metrics.awareness * 0.9, preference: metrics.preference * 0.85, nps: metrics.nps * 0.95 },
        '55+': { awareness: metrics.awareness * 0.8, preference: metrics.preference * 0.7, nps: metrics.nps * 0.9 },
      },
      insights: week === 0 ? [
        'Brand awareness increased 12% year-over-year, driven by successful athlete partnerships',
        'Gen Z engagement outpacing other demographics by 23% - TikTok campaigns showing strong ROI',
        'NPS score reached all-time high of 62 following sustainability initiative launch',
        'Market share gains primarily coming from Under Armour and Reebok customer acquisition',
        'Recommendation: Double down on digital-first marketing to maintain Gen Z momentum'
      ] : [],
    })
  }
  await prisma.brandTrackingSnapshot.createMany({ data: nikeSnapshots })

  // Spotify Brand Tracking - Tech/Entertainment, stable with seasonal bumps
  const spotifyBrandTracking = await prisma.brandTracking.create({
    data: {
      orgId: acmeCorp.id,
      brandName: 'Spotify',
      description: 'Leading music streaming platform. Monitoring brand perception, user engagement metrics, and competitive landscape against Apple Music and YouTube Music.',
      industry: 'Music Streaming & Entertainment',
      competitors: ['Apple Music', 'YouTube Music', 'Amazon Music', 'Tidal', 'Deezer'],
      audiences: ['Music Enthusiasts', 'Podcast Listeners', 'Premium Subscribers', 'Gen Z'],
      status: BrandTrackingStatus.ACTIVE,
      schedule: '0 8 * * 1',
      metrics: {
        brandAwareness: true,
        consideration: true,
        preference: true,
        loyalty: true,
        nps: true,
        sentimentAnalysis: true
      },
      alertThresholds: {
        brandHealth: { min: 65, max: 100 },
        nps: { min: 35, max: 100 }
      },
      createdBy: johnDoe.id,
      snapshotCount: 45,
      lastSnapshot: new Date(now.getTime() - 5 * 60 * 60 * 1000),
    }
  })

  const spotifySnapshots = []
  for (let week = 44; week >= 0; week--) {
    const snapshotDate = new Date(now.getTime() - week * 7 * 24 * 60 * 60 * 1000)
    const metrics = generateBrandMetricsForDate(85, 78, 52, 44 - week, 45, 'up')

    spotifySnapshots.push({
      brandTrackingId: spotifyBrandTracking.id,
      orgId: acmeCorp.id,
      snapshotDate,
      metrics,
      brandHealth: metrics.brandHealth,
      awareness: metrics.awareness,
      consideration: metrics.consideration,
      preference: metrics.preference,
      loyalty: metrics.loyalty,
      nps: metrics.nps,
      marketShare: metrics.marketShare,
      sentimentScore: metrics.sentimentScore,
      competitorData: {
        'Apple Music': { awareness: 80 + Math.random() * 5, consideration: 55 + Math.random() * 8, marketShare: 22 + Math.random() * 4, sentiment: 0.7 + Math.random() * 0.1 },
        'YouTube Music': { awareness: 75 + Math.random() * 8, consideration: 48 + Math.random() * 8, marketShare: 18 + Math.random() * 4, sentiment: 0.6 + Math.random() * 0.15 },
        'Amazon Music': { awareness: 65 + Math.random() * 8, consideration: 35 + Math.random() * 6, marketShare: 12 + Math.random() * 3, sentiment: 0.55 + Math.random() * 0.2 },
        'Tidal': { awareness: 35 + Math.random() * 8, consideration: 18 + Math.random() * 5, marketShare: 3 + Math.random() * 2, sentiment: 0.65 + Math.random() * 0.15 },
        'Deezer': { awareness: 25 + Math.random() * 6, consideration: 12 + Math.random() * 4, marketShare: 2 + Math.random() * 1, sentiment: 0.5 + Math.random() * 0.2 },
      },
      audienceBreakdown: {
        '18-24': { awareness: metrics.awareness * 1.12, preference: metrics.preference * 1.25, nps: metrics.nps * 1.15 },
        '25-34': { awareness: metrics.awareness * 1.08, preference: metrics.preference * 1.15, nps: metrics.nps * 1.1 },
        '35-44': { awareness: metrics.awareness * 0.98, preference: metrics.preference * 0.9, nps: metrics.nps * 0.95 },
        '45-54': { awareness: metrics.awareness * 0.85, preference: metrics.preference * 0.75, nps: metrics.nps * 0.85 },
        '55+': { awareness: metrics.awareness * 0.7, preference: metrics.preference * 0.55, nps: metrics.nps * 0.75 },
      },
      insights: week === 0 ? [
        'Spotify Wrapped campaign generated 340% increase in social mentions year-over-year',
        'Podcast exclusive content driving 18% lift in premium subscription conversions',
        'Apple Music closing awareness gap in 25-34 demographic - recommend targeted campaigns',
        'AI-powered DJ feature receiving exceptionally positive sentiment (0.89 score)',
        'Recommendation: Invest in audiobook expansion to capture growing segment'
      ] : [],
    })
  }
  await prisma.brandTrackingSnapshot.createMany({ data: spotifySnapshots })

  // Tesla Brand Tracking - Innovative but volatile sentiment
  const teslaBrandTracking = await prisma.brandTracking.create({
    data: {
      orgId: acmeCorp.id,
      brandName: 'Tesla',
      description: 'Electric vehicle pioneer and clean energy company. Tracking brand perception, purchase intent, and sentiment across EV market segments.',
      industry: 'Electric Vehicles & Clean Energy',
      competitors: ['Ford', 'Rivian', 'Lucid Motors', 'BMW', 'Mercedes-Benz EQ'],
      audiences: ['EV Enthusiasts', 'Tech Early Adopters', 'Eco-Conscious Consumers', 'Luxury Auto Buyers'],
      status: BrandTrackingStatus.ACTIVE,
      schedule: '0 7 * * *',
      metrics: {
        brandAwareness: true,
        consideration: true,
        preference: true,
        loyalty: true,
        nps: true,
        sentimentAnalysis: true
      },
      alertThresholds: {
        brandHealth: { min: 60, max: 100 },
        sentimentScore: { min: 0.3, max: 1 }
      },
      createdBy: adminUser.id,
      snapshotCount: 78,
      lastSnapshot: new Date(now.getTime() - 4 * 60 * 60 * 1000),
    }
  })

  const teslaSnapshots = []
  for (let week = 77; week >= 0; week--) {
    const snapshotDate = new Date(now.getTime() - week * 7 * 24 * 60 * 60 * 1000)
    const metrics = generateBrandMetricsForDate(88, 74, 48, 77 - week, 78, 'stable')
    // Tesla has more sentiment volatility
    metrics.sentimentScore = 0.4 + Math.random() * 0.4

    teslaSnapshots.push({
      brandTrackingId: teslaBrandTracking.id,
      orgId: acmeCorp.id,
      snapshotDate,
      metrics,
      brandHealth: metrics.brandHealth,
      awareness: metrics.awareness,
      consideration: metrics.consideration,
      preference: metrics.preference,
      loyalty: metrics.loyalty,
      nps: metrics.nps,
      marketShare: 28 + Math.random() * 8,
      sentimentScore: metrics.sentimentScore,
      competitorData: {
        'Ford': { awareness: 75 + Math.random() * 5, consideration: 42 + Math.random() * 8, marketShare: 15 + Math.random() * 4, sentiment: 0.6 + Math.random() * 0.15 },
        'Rivian': { awareness: 45 + Math.random() * 10, consideration: 28 + Math.random() * 8, marketShare: 6 + Math.random() * 3, sentiment: 0.72 + Math.random() * 0.12 },
        'Lucid Motors': { awareness: 35 + Math.random() * 8, consideration: 22 + Math.random() * 6, marketShare: 3 + Math.random() * 2, sentiment: 0.68 + Math.random() * 0.15 },
        'BMW': { awareness: 82 + Math.random() * 5, consideration: 38 + Math.random() * 6, marketShare: 12 + Math.random() * 3, sentiment: 0.7 + Math.random() * 0.1 },
        'Mercedes-Benz EQ': { awareness: 78 + Math.random() * 5, consideration: 35 + Math.random() * 5, marketShare: 10 + Math.random() * 3, sentiment: 0.72 + Math.random() * 0.1 },
      },
      audienceBreakdown: {
        '18-24': { awareness: metrics.awareness * 1.1, preference: metrics.preference * 0.95, nps: metrics.nps * 1.05 },
        '25-34': { awareness: metrics.awareness * 1.15, preference: metrics.preference * 1.2, nps: metrics.nps * 1.1 },
        '35-44': { awareness: metrics.awareness * 1.08, preference: metrics.preference * 1.15, nps: metrics.nps * 1.05 },
        '45-54': { awareness: metrics.awareness * 0.95, preference: metrics.preference * 1.1, nps: metrics.nps * 0.95 },
        '55+': { awareness: metrics.awareness * 0.85, preference: metrics.preference * 0.8, nps: metrics.nps * 0.85 },
      },
      insights: week === 0 ? [
        'Brand awareness remains industry-leading at 91% among EV-considerers',
        'Sentiment volatility detected - recommend monitoring social media more closely',
        'Cybertruck launch generated 2.3M social mentions with mixed sentiment (0.58)',
        'Rivian gaining consideration among eco-conscious segment - watch competitor closely',
        'Recommendation: Focus messaging on reliability and service network expansion'
      ] : [],
    })
  }
  await prisma.brandTrackingSnapshot.createMany({ data: teslaSnapshots })

  // Patagonia Brand Tracking - Strong sustainability brand, upward trend
  const patagoniaBrandTracking = await prisma.brandTracking.create({
    data: {
      orgId: acmeCorp.id,
      brandName: 'Patagonia',
      description: 'Outdoor apparel company with strong sustainability positioning. Tracking brand perception among eco-conscious consumers and outdoor enthusiasts.',
      industry: 'Outdoor Apparel & Sustainability',
      competitors: ['The North Face', 'REI', 'Arc\'teryx', 'Columbia', 'Cotopaxi'],
      audiences: ['Outdoor Enthusiasts', 'Eco-Conscious Millennials', 'Premium Apparel Buyers', 'Adventure Travelers'],
      status: BrandTrackingStatus.ACTIVE,
      schedule: '0 9 * * 1',
      metrics: {
        brandAwareness: true,
        consideration: true,
        preference: true,
        loyalty: true,
        nps: true,
        sentimentAnalysis: true
      },
      alertThresholds: {
        brandHealth: { min: 75, max: 100 },
        nps: { min: 50, max: 100 }
      },
      createdBy: janeSmith.id,
      snapshotCount: 36,
      lastSnapshot: new Date(now.getTime() - 8 * 60 * 60 * 1000),
    }
  })

  const patagoniaSnapshots = []
  for (let week = 35; week >= 0; week--) {
    const snapshotDate = new Date(now.getTime() - week * 7 * 24 * 60 * 60 * 1000)
    const metrics = generateBrandMetricsForDate(68, 85, 72, 35 - week, 36, 'up')

    patagoniaSnapshots.push({
      brandTrackingId: patagoniaBrandTracking.id,
      orgId: acmeCorp.id,
      snapshotDate,
      metrics,
      brandHealth: metrics.brandHealth,
      awareness: metrics.awareness,
      consideration: metrics.consideration,
      preference: metrics.preference,
      loyalty: metrics.loyalty,
      nps: metrics.nps,
      marketShare: 12 + Math.random() * 6,
      sentimentScore: 0.75 + Math.random() * 0.2,
      competitorData: {
        'The North Face': { awareness: 78 + Math.random() * 5, consideration: 52 + Math.random() * 8, marketShare: 22 + Math.random() * 4, sentiment: 0.65 + Math.random() * 0.15 },
        'REI': { awareness: 62 + Math.random() * 8, consideration: 48 + Math.random() * 8, marketShare: 15 + Math.random() * 4, sentiment: 0.72 + Math.random() * 0.12 },
        'Arc\'teryx': { awareness: 45 + Math.random() * 8, consideration: 38 + Math.random() * 6, marketShare: 8 + Math.random() * 3, sentiment: 0.78 + Math.random() * 0.1 },
        'Columbia': { awareness: 72 + Math.random() * 6, consideration: 42 + Math.random() * 6, marketShare: 18 + Math.random() * 4, sentiment: 0.58 + Math.random() * 0.15 },
        'Cotopaxi': { awareness: 28 + Math.random() * 8, consideration: 22 + Math.random() * 6, marketShare: 4 + Math.random() * 2, sentiment: 0.82 + Math.random() * 0.1 },
      },
      audienceBreakdown: {
        '18-24': { awareness: metrics.awareness * 1.08, preference: metrics.preference * 1.15, nps: metrics.nps * 1.1 },
        '25-34': { awareness: metrics.awareness * 1.2, preference: metrics.preference * 1.3, nps: metrics.nps * 1.15 },
        '35-44': { awareness: metrics.awareness * 1.1, preference: metrics.preference * 1.2, nps: metrics.nps * 1.1 },
        '45-54': { awareness: metrics.awareness * 0.95, preference: metrics.preference * 1.05, nps: metrics.nps * 1.0 },
        '55+': { awareness: metrics.awareness * 0.8, preference: metrics.preference * 0.85, nps: metrics.nps * 0.95 },
      },
      insights: week === 0 ? [
        'Highest NPS in outdoor apparel category at 74 - sustainability messaging resonating strongly',
        '"Don\'t Buy This Jacket" philosophy driving 28% higher brand loyalty than competitors',
        'Worn Wear program contributing to 15% repeat purchase rate increase',
        '25-34 demographic showing exceptional engagement - key growth segment identified',
        'Recommendation: Expand Worn Wear program and amplify repair/reuse messaging'
      ] : [],
    })
  }
  await prisma.brandTrackingSnapshot.createMany({ data: patagoniaSnapshots })

  // Oatly Brand Tracking - Challenger brand, rapid growth
  const oatlyBrandTracking = await prisma.brandTracking.create({
    data: {
      orgId: acmeCorp.id,
      brandName: 'Oatly',
      description: 'Plant-based dairy alternative leader. Tracking brand disruption metrics, awareness growth, and competitive positioning in alt-milk category.',
      industry: 'Plant-Based Foods & Beverages',
      competitors: ['Califia Farms', 'Silk', 'Alpro', 'Minor Figures', 'Planet Oat'],
      audiences: ['Vegans & Vegetarians', 'Lactose Intolerant', 'Health-Conscious Millennials', 'Coffee Culture'],
      status: BrandTrackingStatus.ACTIVE,
      schedule: '0 10 * * 1',
      metrics: {
        brandAwareness: true,
        consideration: true,
        preference: true,
        loyalty: true,
        nps: true,
        sentimentAnalysis: true
      },
      alertThresholds: {
        brandHealth: { min: 60, max: 100 },
        awareness: { min: 40, max: 100 }
      },
      createdBy: johnDoe.id,
      snapshotCount: 28,
      lastSnapshot: new Date(now.getTime() - 12 * 60 * 60 * 1000),
    }
  })

  const oatlySnapshots = []
  for (let week = 27; week >= 0; week--) {
    const snapshotDate = new Date(now.getTime() - week * 7 * 24 * 60 * 60 * 1000)
    const metrics = generateBrandMetricsForDate(52, 72, 55, 27 - week, 28, 'up')

    oatlySnapshots.push({
      brandTrackingId: oatlyBrandTracking.id,
      orgId: acmeCorp.id,
      snapshotDate,
      metrics,
      brandHealth: metrics.brandHealth,
      awareness: metrics.awareness,
      consideration: metrics.consideration,
      preference: metrics.preference,
      loyalty: metrics.loyalty,
      nps: metrics.nps,
      marketShare: 18 + Math.random() * 8,
      sentimentScore: 0.68 + Math.random() * 0.2,
      competitorData: {
        'Califia Farms': { awareness: 42 + Math.random() * 8, consideration: 35 + Math.random() * 6, marketShare: 15 + Math.random() * 4, sentiment: 0.7 + Math.random() * 0.12 },
        'Silk': { awareness: 68 + Math.random() * 6, consideration: 45 + Math.random() * 6, marketShare: 25 + Math.random() * 5, sentiment: 0.58 + Math.random() * 0.15 },
        'Alpro': { awareness: 55 + Math.random() * 8, consideration: 38 + Math.random() * 6, marketShare: 18 + Math.random() * 4, sentiment: 0.62 + Math.random() * 0.15 },
        'Minor Figures': { awareness: 22 + Math.random() * 8, consideration: 18 + Math.random() * 5, marketShare: 5 + Math.random() * 2, sentiment: 0.78 + Math.random() * 0.1 },
        'Planet Oat': { awareness: 38 + Math.random() * 8, consideration: 28 + Math.random() * 6, marketShare: 12 + Math.random() * 4, sentiment: 0.6 + Math.random() * 0.15 },
      },
      audienceBreakdown: {
        '18-24': { awareness: metrics.awareness * 1.25, preference: metrics.preference * 1.35, nps: metrics.nps * 1.2 },
        '25-34': { awareness: metrics.awareness * 1.3, preference: metrics.preference * 1.4, nps: metrics.nps * 1.25 },
        '35-44': { awareness: metrics.awareness * 1.05, preference: metrics.preference * 1.1, nps: metrics.nps * 1.05 },
        '45-54': { awareness: metrics.awareness * 0.85, preference: metrics.preference * 0.8, nps: metrics.nps * 0.9 },
        '55+': { awareness: metrics.awareness * 0.6, preference: metrics.preference * 0.55, nps: metrics.nps * 0.8 },
      },
      insights: week === 0 ? [
        'Awareness grew 45% YoY - fastest growth in plant-based category',
        'Coffee shop partnerships (Starbucks, Blue Bottle) driving 65% of trial conversions',
        'Distinctive packaging and brand voice creating 2x share of voice vs. competitors',
        'Gen Z preference 40% higher than category average - brand personality resonating',
        'Recommendation: Expand barista edition line and deepen specialty coffee partnerships'
      ] : [],
    })
  }
  await prisma.brandTrackingSnapshot.createMany({ data: oatlySnapshots })

  // Airbnb Brand Tracking - Travel recovery, strong brand
  const airbnbBrandTracking = await prisma.brandTracking.create({
    data: {
      orgId: techStartup.id,
      brandName: 'Airbnb',
      description: 'Travel accommodation marketplace. Tracking brand recovery post-pandemic, trust metrics, and competitive positioning against traditional hospitality.',
      industry: 'Travel & Hospitality',
      competitors: ['Booking.com', 'Vrbo', 'Hotels.com', 'Expedia', 'Marriott Bonvoy'],
      audiences: ['Millennial Travelers', 'Remote Workers', 'Experience Seekers', 'Budget Travelers'],
      status: BrandTrackingStatus.ACTIVE,
      schedule: '0 6 * * 2',
      metrics: {
        brandAwareness: true,
        consideration: true,
        preference: true,
        loyalty: true,
        nps: true,
        sentimentAnalysis: true
      },
      alertThresholds: {
        brandHealth: { min: 65, max: 100 },
        nps: { min: 30, max: 100 }
      },
      createdBy: bobWilson.id,
      snapshotCount: 42,
      lastSnapshot: new Date(now.getTime() - 18 * 60 * 60 * 1000),
    }
  })

  const airbnbSnapshots = []
  for (let week = 41; week >= 0; week--) {
    const snapshotDate = new Date(now.getTime() - week * 7 * 24 * 60 * 60 * 1000)
    const metrics = generateBrandMetricsForDate(82, 76, 45, 41 - week, 42, 'up')

    airbnbSnapshots.push({
      brandTrackingId: airbnbBrandTracking.id,
      orgId: techStartup.id,
      snapshotDate,
      metrics,
      brandHealth: metrics.brandHealth,
      awareness: metrics.awareness,
      consideration: metrics.consideration,
      preference: metrics.preference,
      loyalty: metrics.loyalty,
      nps: metrics.nps,
      marketShare: 22 + Math.random() * 8,
      sentimentScore: 0.62 + Math.random() * 0.22,
      competitorData: {
        'Booking.com': { awareness: 85 + Math.random() * 5, consideration: 58 + Math.random() * 8, marketShare: 28 + Math.random() * 5, sentiment: 0.6 + Math.random() * 0.15 },
        'Vrbo': { awareness: 58 + Math.random() * 8, consideration: 38 + Math.random() * 6, marketShare: 15 + Math.random() * 4, sentiment: 0.58 + Math.random() * 0.15 },
        'Hotels.com': { awareness: 72 + Math.random() * 6, consideration: 45 + Math.random() * 6, marketShare: 18 + Math.random() * 4, sentiment: 0.55 + Math.random() * 0.15 },
        'Expedia': { awareness: 78 + Math.random() * 5, consideration: 48 + Math.random() * 6, marketShare: 20 + Math.random() * 4, sentiment: 0.52 + Math.random() * 0.18 },
        'Marriott Bonvoy': { awareness: 65 + Math.random() * 8, consideration: 42 + Math.random() * 6, marketShare: 22 + Math.random() * 5, sentiment: 0.68 + Math.random() * 0.12 },
      },
      audienceBreakdown: {
        '18-24': { awareness: metrics.awareness * 1.1, preference: metrics.preference * 1.2, nps: metrics.nps * 1.15 },
        '25-34': { awareness: metrics.awareness * 1.15, preference: metrics.preference * 1.25, nps: metrics.nps * 1.1 },
        '35-44': { awareness: metrics.awareness * 1.05, preference: metrics.preference * 1.1, nps: metrics.nps * 1.0 },
        '45-54': { awareness: metrics.awareness * 0.95, preference: metrics.preference * 0.9, nps: metrics.nps * 0.95 },
        '55+': { awareness: metrics.awareness * 0.8, preference: metrics.preference * 0.7, nps: metrics.nps * 0.85 },
      },
      insights: week === 0 ? [
        'Brand trust scores recovering - up 18 points from 2022 low',
        'Experiences category driving 35% of new user acquisition',
        'Remote work trend benefiting long-stay bookings (28+ days up 65%)',
        'Host quality concerns impacting NPS - verification program helping',
        'Recommendation: Amplify guest protection messaging and host quality initiatives'
      ] : [],
    })
  }
  await prisma.brandTrackingSnapshot.createMany({ data: airbnbSnapshots })

  // Peloton Brand Tracking - Declining trend, needs attention
  const pelotonBrandTracking = await prisma.brandTracking.create({
    data: {
      orgId: enterpriseCo.id,
      brandName: 'Peloton',
      description: 'Connected fitness platform. Monitoring brand health during market correction, subscriber retention, and competitive threats from traditional fitness.',
      industry: 'Connected Fitness & Wellness',
      competitors: ['Apple Fitness+', 'Mirror', 'Tonal', 'NordicTrack', 'Echelon'],
      audiences: ['Home Fitness Enthusiasts', 'Affluent Millennials', 'Working Parents', 'Fitness Beginners'],
      status: BrandTrackingStatus.ACTIVE,
      schedule: '0 7 * * 1',
      metrics: {
        brandAwareness: true,
        consideration: true,
        preference: true,
        loyalty: true,
        nps: true,
        sentimentAnalysis: true
      },
      alertThresholds: {
        brandHealth: { min: 55, max: 100 },
        nps: { min: 25, max: 100 }
      },
      createdBy: sarahEnterprise.id,
      snapshotCount: 65,
      lastSnapshot: new Date(now.getTime() - 6 * 60 * 60 * 1000),
    }
  })

  const pelotonSnapshots = []
  for (let week = 64; week >= 0; week--) {
    const snapshotDate = new Date(now.getTime() - week * 7 * 24 * 60 * 60 * 1000)
    const metrics = generateBrandMetricsForDate(75, 68, 42, 64 - week, 65, 'down')

    pelotonSnapshots.push({
      brandTrackingId: pelotonBrandTracking.id,
      orgId: enterpriseCo.id,
      snapshotDate,
      metrics,
      brandHealth: metrics.brandHealth,
      awareness: metrics.awareness,
      consideration: metrics.consideration,
      preference: metrics.preference,
      loyalty: metrics.loyalty,
      nps: metrics.nps,
      marketShare: 35 + Math.random() * 10 - (64 - week) * 0.2,
      sentimentScore: 0.5 + Math.random() * 0.25,
      competitorData: {
        'Apple Fitness+': { awareness: 72 + Math.random() * 6, consideration: 48 + Math.random() * 8, marketShare: 22 + Math.random() * 5, sentiment: 0.75 + Math.random() * 0.1 },
        'Mirror': { awareness: 35 + Math.random() * 8, consideration: 22 + Math.random() * 6, marketShare: 8 + Math.random() * 3, sentiment: 0.6 + Math.random() * 0.15 },
        'Tonal': { awareness: 32 + Math.random() * 8, consideration: 25 + Math.random() * 6, marketShare: 6 + Math.random() * 3, sentiment: 0.72 + Math.random() * 0.12 },
        'NordicTrack': { awareness: 65 + Math.random() * 6, consideration: 42 + Math.random() * 6, marketShare: 18 + Math.random() * 4, sentiment: 0.55 + Math.random() * 0.18 },
        'Echelon': { awareness: 42 + Math.random() * 8, consideration: 32 + Math.random() * 6, marketShare: 12 + Math.random() * 4, sentiment: 0.58 + Math.random() * 0.15 },
      },
      audienceBreakdown: {
        '18-24': { awareness: metrics.awareness * 0.85, preference: metrics.preference * 0.8, nps: metrics.nps * 0.9 },
        '25-34': { awareness: metrics.awareness * 1.1, preference: metrics.preference * 1.15, nps: metrics.nps * 1.05 },
        '35-44': { awareness: metrics.awareness * 1.2, preference: metrics.preference * 1.25, nps: metrics.nps * 1.1 },
        '45-54': { awareness: metrics.awareness * 1.05, preference: metrics.preference * 1.1, nps: metrics.nps * 1.0 },
        '55+': { awareness: metrics.awareness * 0.75, preference: metrics.preference * 0.7, nps: metrics.nps * 0.85 },
      },
      insights: week === 0 ? [
        'ALERT: Brand health declined 12 points over past 6 months - requires immediate attention',
        'Apple Fitness+ gaining significant ground in consideration metrics (+22% YoY)',
        'Core loyalists (35-44) maintaining strong NPS but new user acquisition struggling',
        'Price perception issue identified - 45% cite cost as barrier to consideration',
        'Recommendation: Focus on value messaging and introduce lower-tier subscription options'
      ] : [],
    })
  }
  await prisma.brandTrackingSnapshot.createMany({ data: pelotonSnapshots })

  // Notion Brand Tracking - B2B/Productivity, strong growth
  const notionBrandTracking = await prisma.brandTracking.create({
    data: {
      orgId: techStartup.id,
      brandName: 'Notion',
      description: 'All-in-one workspace for notes, docs, and project management. Tracking adoption metrics, enterprise penetration, and competitive positioning.',
      industry: 'Productivity Software & SaaS',
      competitors: ['Confluence', 'Coda', 'Monday.com', 'Asana', 'ClickUp'],
      audiences: ['Knowledge Workers', 'Startups', 'Enterprise Teams', 'Students'],
      status: BrandTrackingStatus.ACTIVE,
      schedule: '0 8 * * 3',
      metrics: {
        brandAwareness: true,
        consideration: true,
        preference: true,
        loyalty: true,
        nps: true,
        sentimentAnalysis: true
      },
      alertThresholds: {
        brandHealth: { min: 70, max: 100 },
        nps: { min: 45, max: 100 }
      },
      createdBy: bobWilson.id,
      snapshotCount: 32,
      lastSnapshot: new Date(now.getTime() - 10 * 60 * 60 * 1000),
    }
  })

  const notionSnapshots = []
  for (let week = 31; week >= 0; week--) {
    const snapshotDate = new Date(now.getTime() - week * 7 * 24 * 60 * 60 * 1000)
    const metrics = generateBrandMetricsForDate(62, 80, 65, 31 - week, 32, 'up')

    notionSnapshots.push({
      brandTrackingId: notionBrandTracking.id,
      orgId: techStartup.id,
      snapshotDate,
      metrics,
      brandHealth: metrics.brandHealth,
      awareness: metrics.awareness,
      consideration: metrics.consideration,
      preference: metrics.preference,
      loyalty: metrics.loyalty,
      nps: metrics.nps,
      marketShare: 15 + Math.random() * 8 + (31 - week) * 0.15,
      sentimentScore: 0.72 + Math.random() * 0.18,
      competitorData: {
        'Confluence': { awareness: 72 + Math.random() * 6, consideration: 48 + Math.random() * 6, marketShare: 28 + Math.random() * 5, sentiment: 0.52 + Math.random() * 0.2 },
        'Coda': { awareness: 28 + Math.random() * 8, consideration: 22 + Math.random() * 5, marketShare: 5 + Math.random() * 2, sentiment: 0.7 + Math.random() * 0.12 },
        'Monday.com': { awareness: 58 + Math.random() * 8, consideration: 42 + Math.random() * 6, marketShare: 18 + Math.random() * 4, sentiment: 0.62 + Math.random() * 0.15 },
        'Asana': { awareness: 62 + Math.random() * 6, consideration: 45 + Math.random() * 6, marketShare: 20 + Math.random() * 4, sentiment: 0.6 + Math.random() * 0.15 },
        'ClickUp': { awareness: 45 + Math.random() * 8, consideration: 38 + Math.random() * 6, marketShare: 12 + Math.random() * 4, sentiment: 0.65 + Math.random() * 0.15 },
      },
      audienceBreakdown: {
        '18-24': { awareness: metrics.awareness * 1.3, preference: metrics.preference * 1.4, nps: metrics.nps * 1.2 },
        '25-34': { awareness: metrics.awareness * 1.25, preference: metrics.preference * 1.35, nps: metrics.nps * 1.15 },
        '35-44': { awareness: metrics.awareness * 1.05, preference: metrics.preference * 1.1, nps: metrics.nps * 1.0 },
        '45-54': { awareness: metrics.awareness * 0.8, preference: metrics.preference * 0.75, nps: metrics.nps * 0.9 },
        '55+': { awareness: metrics.awareness * 0.55, preference: metrics.preference * 0.5, nps: metrics.nps * 0.8 },
      },
      insights: week === 0 ? [
        'Enterprise adoption accelerating - 85% YoY growth in teams >100 users',
        'AI features launch driving 40% increase in feature engagement',
        'Student/startup segment showing highest NPS (72) - strong product-market fit',
        'Confluence users actively considering switch - opportunity in enterprise migration',
        'Recommendation: Invest in enterprise sales team and migration tooling'
      ] : [],
    })
  }
  await prisma.brandTrackingSnapshot.createMany({ data: notionSnapshots })

  // Update brand tracking counts
  await prisma.brandTracking.update({ where: { id: nikeBrandTracking.id }, data: { snapshotCount: 52 } })
  await prisma.brandTracking.update({ where: { id: spotifyBrandTracking.id }, data: { snapshotCount: 45 } })
  await prisma.brandTracking.update({ where: { id: teslaBrandTracking.id }, data: { snapshotCount: 78 } })
  await prisma.brandTracking.update({ where: { id: patagoniaBrandTracking.id }, data: { snapshotCount: 36 } })
  await prisma.brandTracking.update({ where: { id: oatlyBrandTracking.id }, data: { snapshotCount: 28 } })
  await prisma.brandTracking.update({ where: { id: airbnbBrandTracking.id }, data: { snapshotCount: 42 } })
  await prisma.brandTracking.update({ where: { id: pelotonBrandTracking.id }, data: { snapshotCount: 65 } })
  await prisma.brandTracking.update({ where: { id: notionBrandTracking.id }, data: { snapshotCount: 32 } })

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
  console.log('   Brand Trackings: 8 (Nike, Spotify, Tesla, Patagonia, Oatly, Airbnb, Peloton, Notion)')
  console.log('   Brand Tracking Snapshots: 378+ (52+45+78+36+28+42+65+32 weekly snapshots)')

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
