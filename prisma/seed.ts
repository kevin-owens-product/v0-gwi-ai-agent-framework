import { PrismaClient, Role, PlanTier, AgentType, AgentStatus, AgentRunStatus, DataSourceType, DataSourceStatus, UsageMetric, SubscriptionStatus, InvitationStatus, BrandTrackingStatus, ReportType, ReportStatus } from '@prisma/client'
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

  // Clean super admin portal data
  await prisma.platformAuditLog.deleteMany()
  await prisma.superAdminSession.deleteMany()
  await prisma.superAdmin.deleteMany()
  await prisma.featureFlag.deleteMany()

  // Clean entitlement system data
  await prisma.tenantEntitlement.deleteMany()
  await prisma.planFeature.deleteMany()
  await prisma.feature.deleteMany()
  await prisma.plan.deleteMany()
  await prisma.systemRule.deleteMany()
  await prisma.ticketResponse.deleteMany()
  await prisma.supportTicket.deleteMany()
  await prisma.tenantHealthScore.deleteMany()
  await prisma.systemNotification.deleteMany()
  await prisma.systemConfig.deleteMany()
  await prisma.organizationSuspension.deleteMany()
  await prisma.userBan.deleteMany()

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
  await prisma.report.deleteMany()
  await prisma.chart.deleteMany()
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

  // Additional users for comprehensive testing
  const bannedUser = await prisma.user.create({
    data: {
      email: 'banned@example.com',
      name: 'Banned User',
      passwordHash: defaultPassword,
      emailVerified: new Date(),
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=banned'
    }
  })

  const suspiciousUser = await prisma.user.create({
    data: {
      email: 'suspicious@example.com',
      name: 'Suspicious Account',
      passwordHash: defaultPassword,
      emailVerified: null, // Unverified
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=suspicious'
    }
  })

  const inactiveUser = await prisma.user.create({
    data: {
      email: 'inactive@oldcompany.com',
      name: 'Inactive User',
      passwordHash: defaultPassword,
      emailVerified: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000), // Verified 1 year ago
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=inactive'
    }
  })

  const trialUser = await prisma.user.create({
    data: {
      email: 'trial@startup.io',
      name: 'Trial User',
      passwordHash: defaultPassword,
      emailVerified: new Date(),
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=trial'
    }
  })

  const enterpriseUser2 = await prisma.user.create({
    data: {
      email: 'mike@enterprise.co',
      name: 'Mike Enterprise',
      passwordHash: defaultPassword,
      emailVerified: new Date(),
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=mike'
    }
  })

  // ==================== ADDITIONAL ORGANIZATIONS ====================
  console.log('🏢 Creating additional organizations for testing...')

  const suspendedOrg = await prisma.organization.create({
    data: {
      name: 'Suspended Corp',
      slug: 'suspended-corp',
      planTier: PlanTier.PROFESSIONAL,
      settings: {
        theme: 'light',
        timezone: 'America/Chicago',
        features: {}
      }
    }
  })

  const billingIssueOrg = await prisma.organization.create({
    data: {
      name: 'Billing Issue Inc',
      slug: 'billing-issue-inc',
      planTier: PlanTier.STARTER,
      settings: {
        theme: 'dark',
        timezone: 'America/New_York',
        features: {}
      }
    }
  })

  const trialOrg = await prisma.organization.create({
    data: {
      name: 'Trial Company',
      slug: 'trial-company',
      planTier: PlanTier.STARTER,
      settings: {
        theme: 'system',
        timezone: 'Europe/Berlin',
        features: {}
      }
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
      { orgId: enterpriseCo.id, userId: enterpriseUser2.id, role: Role.ADMIN },
    ]
  })

  // Suspended Corp memberships
  await prisma.organizationMember.createMany({
    data: [
      { orgId: suspendedOrg.id, userId: bannedUser.id, role: Role.OWNER },
      { orgId: suspendedOrg.id, userId: suspiciousUser.id, role: Role.MEMBER },
    ]
  })

  // Billing Issue Inc memberships
  await prisma.organizationMember.createMany({
    data: [
      { orgId: billingIssueOrg.id, userId: inactiveUser.id, role: Role.OWNER },
    ]
  })

  // Trial Company memberships
  await prisma.organizationMember.createMany({
    data: [
      { orgId: trialOrg.id, userId: trialUser.id, role: Role.OWNER },
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

  const _runningRun = await prisma.agentRun.create({
    data: {
      agentId: weeklyReportAgent.id,
      orgId: acmeCorp.id,
      status: AgentRunStatus.RUNNING,
      tokensUsed: 1200,
      startedAt: new Date(now.getTime() - 5 * 60 * 1000),
      input: { reportType: 'weekly', dateRange: 'last_7_days' }
    }
  })

  const _failedRun = await prisma.agentRun.create({
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

  const _pendingRun = await prisma.agentRun.create({
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

  // Create audiences with explicit IDs for reliable API access
  const _audience1 = await prisma.audience.create({
    data: {
      id: '1',
      orgId: acmeCorp.id,
      name: 'Gen Z Digital Natives',
      description: 'Young consumers aged 18-25 who are highly engaged with social media and digital platforms. Early adopters of new technology and trends.',
      criteria: {
        ageRange: { min: 18, max: 25 },
        behaviors: ['heavy_social_media_users', 'mobile_first', 'streaming_subscribers'],
        interests: ['gaming', 'short_form_video', 'sustainability', 'mental_health'],
        platforms: ['TikTok', 'Instagram', 'YouTube', 'Discord'],
        purchaseDrivers: ['brand_values', 'peer_recommendations', 'social_proof']
      },
      size: 42500000,
      markets: ['US', 'UK', 'AU', 'CA', 'DE'],
      isFavorite: true,
      usageCount: 156,
      lastUsed: new Date(now.getTime() - 2 * 60 * 60 * 1000),
      createdBy: adminUser.id
    }
  })

  const _audience2 = await prisma.audience.create({
    data: {
      id: '2',
      orgId: acmeCorp.id,
      name: 'Affluent Millennials',
      description: 'High-income millennials aged 28-40 with disposable income. Quality-conscious consumers who value experiences and premium products.',
      criteria: {
        ageRange: { min: 28, max: 40 },
        income: { min: 100000, currency: 'USD' },
        behaviors: ['premium_purchasers', 'experience_seekers', 'brand_loyal'],
        interests: ['travel', 'fine_dining', 'fitness', 'investment', 'real_estate'],
        lifestyle: ['urban_professional', 'health_conscious', 'career_focused']
      },
      size: 28300000,
      markets: ['US', 'UK', 'DE', 'FR', 'JP'],
      isFavorite: true,
      usageCount: 234,
      lastUsed: new Date(now.getTime() - 4 * 60 * 60 * 1000),
      createdBy: johnDoe.id
    }
  })

  const _audience3 = await prisma.audience.create({
    data: {
      id: '3',
      orgId: acmeCorp.id,
      name: 'Eco-Conscious Consumers',
      description: 'Environmentally aware consumers who prioritize sustainability in purchasing decisions. Willing to pay premium for eco-friendly products.',
      criteria: {
        behaviors: ['sustainable_shoppers', 'ethical_consumers', 'recyclers'],
        interests: ['climate_change', 'renewable_energy', 'organic_products', 'zero_waste'],
        values: ['environmental_responsibility', 'social_impact', 'transparency'],
        purchaseDrivers: ['sustainability_certifications', 'carbon_footprint', 'ethical_sourcing']
      },
      size: 35800000,
      markets: ['US', 'UK', 'DE', 'NL', 'SE', 'DK', 'NO'],
      isFavorite: true,
      usageCount: 189,
      lastUsed: new Date(now.getTime() - 8 * 60 * 60 * 1000),
      createdBy: janeSmith.id
    }
  })

  const _audience4 = await prisma.audience.create({
    data: {
      id: '4',
      orgId: acmeCorp.id,
      name: 'Tech Early Adopters',
      description: 'Technology enthusiasts who are first to try new products and services. Influential in shaping tech trends and opinions.',
      criteria: {
        behaviors: ['early_adopters', 'tech_influencers', 'gadget_collectors'],
        interests: ['AI', 'VR_AR', 'smart_home', 'electric_vehicles', 'crypto'],
        platforms: ['Reddit', 'Twitter', 'ProductHunt', 'HackerNews'],
        purchaseDrivers: ['innovation', 'features', 'cutting_edge_tech']
      },
      size: 18500000,
      markets: ['US', 'UK', 'JP', 'KR', 'DE', 'CN'],
      isFavorite: false,
      usageCount: 145,
      lastUsed: new Date(now.getTime() - 24 * 60 * 60 * 1000),
      createdBy: adminUser.id
    }
  })

  const _audience5 = await prisma.audience.create({
    data: {
      id: '5',
      orgId: acmeCorp.id,
      name: 'Health & Wellness Enthusiasts',
      description: 'Consumers prioritizing physical and mental wellness. Regular exercisers, healthy eaters, and mindfulness practitioners.',
      criteria: {
        behaviors: ['regular_exercisers', 'healthy_eaters', 'supplement_users', 'meditation_practitioners'],
        interests: ['fitness', 'nutrition', 'mental_health', 'yoga', 'running'],
        purchaseDrivers: ['health_benefits', 'natural_ingredients', 'scientific_backing']
      },
      size: 52000000,
      markets: ['US', 'UK', 'AU', 'CA', 'DE', 'NL'],
      isFavorite: true,
      usageCount: 267,
      lastUsed: new Date(now.getTime() - 3 * 60 * 60 * 1000),
      createdBy: johnDoe.id
    }
  })

  const _audience6 = await prisma.audience.create({
    data: {
      id: '6',
      orgId: acmeCorp.id,
      name: 'Remote Workers',
      description: 'Professionals working from home or hybrid arrangements. High demand for productivity tools, home office equipment, and work-life balance solutions.',
      criteria: {
        employment: ['remote_full_time', 'hybrid', 'freelancer', 'digital_nomad'],
        behaviors: ['home_office_setup', 'video_conferencing', 'productivity_app_users'],
        interests: ['productivity', 'work_life_balance', 'home_improvement', 'coworking'],
        purchaseDrivers: ['functionality', 'comfort', 'productivity_gains']
      },
      size: 68000000,
      markets: ['US', 'UK', 'DE', 'NL', 'AU', 'CA', 'ES', 'PT'],
      isFavorite: false,
      usageCount: 98,
      lastUsed: new Date(now.getTime() - 48 * 60 * 60 * 1000),
      createdBy: janeSmith.id
    }
  })

  const _audience7 = await prisma.audience.create({
    data: {
      id: '7',
      orgId: acmeCorp.id,
      name: 'Luxury Seekers',
      description: 'High-net-worth individuals interested in luxury goods and premium experiences. Value exclusivity, craftsmanship, and status.',
      criteria: {
        income: { min: 200000, currency: 'USD' },
        behaviors: ['luxury_purchasers', 'exclusive_membership', 'premium_travel'],
        interests: ['luxury_fashion', 'fine_watches', 'premium_cars', 'private_travel'],
        purchaseDrivers: ['exclusivity', 'craftsmanship', 'heritage', 'status']
      },
      size: 8500000,
      markets: ['US', 'UK', 'FR', 'IT', 'CH', 'AE', 'SG', 'HK'],
      isFavorite: false,
      usageCount: 67,
      lastUsed: new Date(now.getTime() - 72 * 60 * 60 * 1000),
      createdBy: adminUser.id
    }
  })

  const _audience8 = await prisma.audience.create({
    data: {
      id: '8',
      orgId: acmeCorp.id,
      name: 'Parents with Young Children',
      description: 'Parents with children under 12. High focus on family-oriented products, education, and safety.',
      criteria: {
        familyStatus: 'parents_young_children',
        childrenAges: { min: 0, max: 12 },
        behaviors: ['family_oriented_shopping', 'safety_conscious', 'educational_content_consumers'],
        interests: ['parenting', 'education', 'family_activities', 'child_development'],
        purchaseDrivers: ['safety', 'educational_value', 'convenience', 'durability']
      },
      size: 45000000,
      markets: ['US', 'UK', 'AU', 'CA', 'DE', 'FR'],
      isFavorite: true,
      usageCount: 178,
      lastUsed: new Date(now.getTime() - 6 * 60 * 60 * 1000),
      createdBy: johnDoe.id
    }
  })

  const _audience9 = await prisma.audience.create({
    data: {
      id: '9',
      orgId: techStartup.id,
      name: 'SaaS Power Users',
      description: 'Heavy users of SaaS applications across productivity, collaboration, and development tools. High willingness to pay for premium features.',
      criteria: {
        behaviors: ['multi_saas_users', 'power_users', 'feature_maximizers'],
        interests: ['productivity', 'automation', 'integrations', 'team_collaboration'],
        tools: ['Slack', 'Notion', 'Figma', 'GitHub', 'Asana'],
        purchaseDrivers: ['efficiency', 'integrations', 'team_features']
      },
      size: 15000000,
      markets: ['US', 'UK', 'DE', 'CA', 'AU', 'NL'],
      isFavorite: true,
      usageCount: 89,
      lastUsed: new Date(now.getTime() - 12 * 60 * 60 * 1000),
      createdBy: bobWilson.id
    }
  })

  const _audience10 = await prisma.audience.create({
    data: {
      id: '10',
      orgId: techStartup.id,
      name: 'Startup Founders',
      description: 'Founders and co-founders of startups. High interest in growth tools, funding, and scaling strategies.',
      criteria: {
        role: ['founder', 'co_founder', 'ceo_startup'],
        companyStage: ['pre_seed', 'seed', 'series_a', 'series_b'],
        behaviors: ['networking', 'fundraising', 'growth_hacking'],
        interests: ['venture_capital', 'scaling', 'hiring', 'product_market_fit'],
        purchaseDrivers: ['roi', 'scalability', 'founder_friendly']
      },
      size: 2500000,
      markets: ['US', 'UK', 'DE', 'IL', 'SG', 'IN'],
      isFavorite: true,
      usageCount: 56,
      lastUsed: new Date(now.getTime() - 18 * 60 * 60 * 1000),
      createdBy: bobWilson.id
    }
  })

  const _audience11 = await prisma.audience.create({
    data: {
      id: '11',
      orgId: enterpriseCo.id,
      name: 'Enterprise Decision Makers',
      description: 'C-level and senior executives at large enterprises. Key decision makers for B2B purchases and strategic initiatives.',
      criteria: {
        role: ['ceo', 'cfo', 'cto', 'cmo', 'vp', 'director'],
        companySize: { min: 1000 },
        behaviors: ['strategic_purchasers', 'vendor_evaluators', 'budget_holders'],
        interests: ['digital_transformation', 'enterprise_software', 'risk_management'],
        purchaseDrivers: ['reliability', 'security', 'support', 'compliance']
      },
      size: 5800000,
      markets: ['US', 'UK', 'DE', 'FR', 'JP', 'AU'],
      isFavorite: true,
      usageCount: 234,
      lastUsed: new Date(now.getTime() - 4 * 60 * 60 * 1000),
      createdBy: sarahEnterprise.id
    }
  })

  // Get created audience IDs for use in crosstabs
  const allAudiences = await prisma.audience.findMany({ where: { orgId: { in: [acmeCorp.id, techStartup.id] } } })

  // ==================== DASHBOARDS ====================
  console.log('📊 Creating dashboards...')

  // Create dashboards with explicit IDs for reliable API access
  await prisma.dashboard.create({
    data: {
      id: '1',
      orgId: acmeCorp.id,
      name: 'Brand Performance Overview',
      description: 'Executive dashboard tracking key brand metrics across all tracked brands. Real-time health scores, market share trends, and competitive positioning.',
      layout: [
        { i: 'brand-health', x: 0, y: 0, w: 4, h: 2 },
        { i: 'market-share', x: 4, y: 0, w: 4, h: 2 },
        { i: 'nps-trend', x: 8, y: 0, w: 4, h: 2 },
        { i: 'awareness-funnel', x: 0, y: 2, w: 6, h: 3 },
        { i: 'competitor-radar', x: 6, y: 2, w: 6, h: 3 },
        { i: 'sentiment-timeline', x: 0, y: 5, w: 12, h: 2 }
      ],
      widgets: [
        { id: 'brand-health', type: 'gauge', title: 'Overall Brand Health', metric: 'brandHealth', threshold: { warning: 70, danger: 50 } },
        { id: 'market-share', type: 'pie', title: 'Market Share Distribution', metric: 'marketShare', showLegend: true },
        { id: 'nps-trend', type: 'line', title: 'NPS Trend (12 Months)', metric: 'nps', period: '12m', showTrendline: true },
        { id: 'awareness-funnel', type: 'funnel', title: 'Brand Funnel', stages: ['awareness', 'consideration', 'preference', 'loyalty'] },
        { id: 'competitor-radar', type: 'radar', title: 'Competitive Positioning', metrics: ['awareness', 'consideration', 'preference', 'loyalty', 'nps'] },
        { id: 'sentiment-timeline', type: 'area', title: 'Sentiment Over Time', metric: 'sentimentScore', showAnnotations: true }
      ],
      status: 'PUBLISHED',
      isPublic: false,
      views: 1247,
      createdBy: adminUser.id
    }
  })

  await prisma.dashboard.create({
    data: {
      id: '2',
      orgId: acmeCorp.id,
      name: 'Audience Insights Dashboard',
      description: 'Deep dive into audience segments. Demographics, behavioral patterns, and engagement metrics across key consumer groups.',
      layout: [
        { i: 'audience-sizes', x: 0, y: 0, w: 6, h: 2 },
        { i: 'age-distribution', x: 6, y: 0, w: 6, h: 2 },
        { i: 'engagement-heatmap', x: 0, y: 2, w: 8, h: 3 },
        { i: 'platform-breakdown', x: 8, y: 2, w: 4, h: 3 },
        { i: 'interest-treemap', x: 0, y: 5, w: 12, h: 3 }
      ],
      widgets: [
        { id: 'audience-sizes', type: 'bar', title: 'Audience Sizes', dataSource: 'audiences', metric: 'size', sortBy: 'desc' },
        { id: 'age-distribution', type: 'donut', title: 'Age Distribution', segments: ['18-24', '25-34', '35-44', '45-54', '55+'] },
        { id: 'engagement-heatmap', type: 'heatmap', title: 'Engagement by Audience & Platform', xAxis: 'platform', yAxis: 'audience' },
        { id: 'platform-breakdown', type: 'pie', title: 'Platform Preference', dataSource: 'platform_usage' },
        { id: 'interest-treemap', type: 'treemap', title: 'Interest Categories', dataSource: 'interests', colorScale: 'category' }
      ],
      status: 'PUBLISHED',
      isPublic: false,
      views: 892,
      createdBy: johnDoe.id
    }
  })

  await prisma.dashboard.create({
    data: {
      id: '3',
      orgId: acmeCorp.id,
      name: 'Competitive Analysis Hub',
      description: 'Monitor competitor brand performance. Side-by-side comparisons, trend analysis, and share of voice tracking.',
      layout: [
        { i: 'competitor-table', x: 0, y: 0, w: 12, h: 3 },
        { i: 'share-of-voice', x: 0, y: 3, w: 6, h: 2 },
        { i: 'sentiment-comparison', x: 6, y: 3, w: 6, h: 2 },
        { i: 'trend-lines', x: 0, y: 5, w: 12, h: 3 }
      ],
      widgets: [
        { id: 'competitor-table', type: 'table', title: 'Competitor Scorecard', columns: ['brand', 'awareness', 'consideration', 'preference', 'nps', 'sentiment'] },
        { id: 'share-of-voice', type: 'bar', title: 'Share of Voice', metric: 'sov', stacked: true },
        { id: 'sentiment-comparison', type: 'bar', title: 'Sentiment Comparison', metric: 'sentiment', showBenchmark: true },
        { id: 'trend-lines', type: 'line', title: 'Brand Health Trends (All Competitors)', multiSeries: true, period: '6m' }
      ],
      status: 'PUBLISHED',
      isPublic: false,
      views: 756,
      createdBy: janeSmith.id
    }
  })

  await prisma.dashboard.create({
    data: {
      id: '4',
      orgId: acmeCorp.id,
      name: 'Marketing Campaign Tracker',
      description: 'Track campaign impact on brand metrics. Pre/post analysis, attribution modeling, and ROI calculations.',
      layout: [
        { i: 'campaign-lift', x: 0, y: 0, w: 4, h: 2 },
        { id: 'roi-metric', x: 4, y: 0, w: 4, h: 2 },
        { i: 'reach-metric', x: 8, y: 0, w: 4, h: 2 },
        { i: 'lift-analysis', x: 0, y: 2, w: 6, h: 3 },
        { i: 'channel-performance', x: 6, y: 2, w: 6, h: 3 }
      ],
      widgets: [
        { id: 'campaign-lift', type: 'metric', title: 'Brand Lift', value: '+12.5%', trend: 'up', comparison: 'vs. pre-campaign' },
        { id: 'roi-metric', type: 'metric', title: 'Campaign ROI', value: '3.2x', trend: 'up', comparison: 'vs. target 2.5x' },
        { id: 'reach-metric', type: 'metric', title: 'Total Reach', value: '45.2M', trend: 'up', comparison: '+15% vs. plan' },
        { id: 'lift-analysis', type: 'bar', title: 'Metric Lift by Campaign', grouped: true, metrics: ['awareness', 'consideration', 'intent'] },
        { id: 'channel-performance', type: 'bar', title: 'Performance by Channel', channels: ['TV', 'Digital', 'Social', 'OOH', 'Radio'] }
      ],
      status: 'PUBLISHED',
      isPublic: false,
      views: 543,
      createdBy: adminUser.id
    }
  })

  await prisma.dashboard.create({
    data: {
      id: '5',
      orgId: acmeCorp.id,
      name: 'Consumer Trends Monitor',
      description: 'Track emerging consumer trends and behavioral shifts. Trend velocity, adoption curves, and predictive signals.',
      layout: [
        { i: 'trending-topics', x: 0, y: 0, w: 6, h: 3 },
        { i: 'adoption-curve', x: 6, y: 0, w: 6, h: 3 },
        { i: 'sentiment-stream', x: 0, y: 3, w: 12, h: 2 },
        { i: 'predictions', x: 0, y: 5, w: 12, h: 2 }
      ],
      widgets: [
        { id: 'trending-topics', type: 'wordcloud', title: 'Trending Topics', dataSource: 'social_listening', timeframe: '7d' },
        { id: 'adoption-curve', type: 'line', title: 'Trend Adoption Curves', multiSeries: true, showPhases: true },
        { id: 'sentiment-stream', type: 'stream', title: 'Real-time Sentiment', refreshRate: '5m' },
        { id: 'predictions', type: 'cards', title: 'Trend Predictions', showConfidence: true, count: 4 }
      ],
      status: 'DRAFT',
      isPublic: false,
      views: 234,
      createdBy: janeSmith.id
    }
  })

  await prisma.dashboard.create({
    data: {
      id: '6',
      orgId: techStartup.id,
      name: 'Startup Market Overview',
      description: 'Key metrics for startup market analysis. Market sizing, growth rates, and competitive landscape.',
      layout: [
        { i: 'market-size', x: 0, y: 0, w: 4, h: 2 },
        { i: 'growth-rate', x: 4, y: 0, w: 4, h: 2 },
        { i: 'competition-index', x: 8, y: 0, w: 4, h: 2 },
        { i: 'market-map', x: 0, y: 2, w: 12, h: 4 }
      ],
      widgets: [
        { id: 'market-size', type: 'metric', title: 'TAM', value: '$4.2B', trend: 'up', yoy: '+18%' },
        { id: 'growth-rate', type: 'metric', title: 'Market Growth', value: '23%', trend: 'up', comparison: 'CAGR' },
        { id: 'competition-index', type: 'gauge', title: 'Competition Intensity', value: 72, max: 100 },
        { id: 'market-map', type: 'scatter', title: 'Competitive Landscape', xAxis: 'market_share', yAxis: 'growth_rate', bubbleSize: 'revenue' }
      ],
      status: 'PUBLISHED',
      isPublic: false,
      views: 189,
      createdBy: bobWilson.id
    }
  })

  await prisma.dashboard.create({
    data: {
      id: '7',
      orgId: enterpriseCo.id,
      name: 'Enterprise Analytics Hub',
      description: 'Comprehensive enterprise analytics dashboard with drill-down capabilities and custom reporting.',
      layout: [
        { i: 'kpi-row', x: 0, y: 0, w: 12, h: 1 },
        { i: 'revenue-trend', x: 0, y: 1, w: 8, h: 3 },
        { i: 'segment-pie', x: 8, y: 1, w: 4, h: 3 },
        { i: 'regional-map', x: 0, y: 4, w: 6, h: 3 },
        { i: 'product-table', x: 6, y: 4, w: 6, h: 3 }
      ],
      widgets: [
        { id: 'kpi-row', type: 'kpi-strip', metrics: ['revenue', 'users', 'retention', 'nps'], comparison: 'yoy' },
        { id: 'revenue-trend', type: 'area', title: 'Revenue Trend', metric: 'revenue', period: '24m', showForecast: true },
        { id: 'segment-pie', type: 'pie', title: 'Revenue by Segment', dataSource: 'segments' },
        { id: 'regional-map', type: 'choropleth', title: 'Performance by Region', metric: 'revenue', colorScale: 'sequential' },
        { id: 'product-table', type: 'table', title: 'Product Performance', sortable: true, exportable: true }
      ],
      status: 'PUBLISHED',
      isPublic: false,
      views: 2341,
      createdBy: sarahEnterprise.id
    }
  })

  // ==================== CROSSTABS ====================
  console.log('📋 Creating crosstabs...')

  // Create 16 comprehensive crosstabs organized by category
  await prisma.crosstab.createMany({
    data: [
      // ============================================================================
      // SOCIAL & PLATFORM ANALYSIS (3 crosstabs)
      // ============================================================================
      {
        id: 'social-1',
        orgId: acmeCorp.id,
        name: 'Generational Social Media Platform Analysis',
        description: 'Comprehensive analysis of social media platform usage and engagement across generational cohorts',
        audiences: allAudiences.filter(a => a.orgId === acmeCorp.id).slice(0, 4).map(a => a.id),
        metrics: ['daily_usage', 'engagement_rate', 'content_creation', 'time_spent', 'purchase_influence', 'ad_receptivity', 'brand_discovery', 'trust_level'],
        filters: { platforms: ['TikTok', 'Instagram', 'YouTube', 'Facebook', 'Twitter', 'LinkedIn'], period: 'last_quarter' },
        results: {
          rows: [
            { platform: 'TikTok', gen_z: 89.2, millennials: 58.5, gen_x: 22.3, boomers: 8.5 },
            { platform: 'Instagram', gen_z: 92.5, millennials: 82.3, gen_x: 48.5, boomers: 28.2 },
            { platform: 'YouTube', gen_z: 95.8, millennials: 88.5, gen_x: 72.3, boomers: 55.8 },
            { platform: 'Facebook', gen_z: 32.5, millennials: 68.2, gen_x: 78.5, boomers: 72.3 },
            { platform: 'Twitter/X', gen_z: 45.2, millennials: 52.8, gen_x: 42.5, boomers: 32.5 },
            { platform: 'LinkedIn', gen_z: 28.5, millennials: 72.3, gen_x: 68.5, boomers: 42.8 }
          ],
          metadata: { sampleSize: 85000, confidence: 0.95, lastUpdated: now.toISOString(), metric: 'percentage_active_users' }
        },
        views: 1245,
        createdBy: adminUser.id
      },
      {
        id: 'social-2',
        orgId: acmeCorp.id,
        name: 'TikTok vs Instagram Engagement by Age',
        description: 'Head-to-head comparison of TikTok and Instagram engagement metrics across age demographics',
        audiences: allAudiences.filter(a => a.orgId === acmeCorp.id).slice(0, 5).map(a => a.id),
        metrics: ['engagement_rate', 'avg_session_time', 'content_interactions', 'share_rate', 'save_rate', 'comment_rate'],
        filters: { platforms: ['TikTok', 'Instagram'], contentTypes: ['video', 'stories', 'reels'] },
        results: {
          rows: [
            { metric: 'Engagement Rate', tiktok_18_24: 8.5, instagram_18_24: 3.2, tiktok_25_34: 6.2, instagram_25_34: 2.8, tiktok_35_plus: 4.5, instagram_35_plus: 2.2 },
            { metric: 'Avg Session (min)', tiktok_18_24: 52.3, instagram_18_24: 28.5, tiktok_25_34: 38.5, instagram_25_34: 25.2, tiktok_35_plus: 22.5, instagram_35_plus: 18.8 },
            { metric: 'Daily Opens', tiktok_18_24: 12.5, instagram_18_24: 8.2, tiktok_25_34: 8.5, instagram_25_34: 7.5, tiktok_35_plus: 5.2, instagram_35_plus: 6.2 },
            { metric: 'Share Rate (%)', tiktok_18_24: 15.2, instagram_18_24: 8.5, tiktok_25_34: 12.3, instagram_25_34: 7.2, tiktok_35_plus: 8.5, instagram_35_plus: 5.8 }
          ],
          metadata: { sampleSize: 42000, confidence: 0.95, lastUpdated: now.toISOString() }
        },
        views: 892,
        createdBy: johnDoe.id
      },
      {
        id: 'social-3',
        orgId: acmeCorp.id,
        name: 'Content Format Preferences by Generation',
        description: 'Analysis of preferred content formats (video, images, text, audio) across generational segments',
        audiences: allAudiences.filter(a => a.orgId === acmeCorp.id).slice(0, 4).map(a => a.id),
        metrics: ['preference_score', 'engagement_rate', 'completion_rate', 'share_likelihood', 'brand_recall', 'purchase_intent', 'time_spent'],
        filters: { formats: ['short_video', 'long_video', 'images', 'carousels', 'stories', 'live_streams', 'podcasts'] },
        results: {
          rows: [
            { format: 'Short Video (<60s)', gen_z: 92.5, millennials: 78.5, gen_x: 52.3, boomers: 35.2 },
            { format: 'Long Video (>3min)', gen_z: 68.5, millennials: 72.3, gen_x: 65.8, boomers: 58.5 },
            { format: 'Image Carousels', gen_z: 75.2, millennials: 82.5, gen_x: 68.2, boomers: 55.8 },
            { format: 'Stories/Ephemeral', gen_z: 88.5, millennials: 72.5, gen_x: 42.3, boomers: 22.5 },
            { format: 'Live Streams', gen_z: 58.2, millennials: 52.5, gen_x: 38.5, boomers: 28.2 },
            { format: 'Podcasts/Audio', gen_z: 52.3, millennials: 68.5, gen_x: 58.2, boomers: 42.5 }
          ],
          metadata: { sampleSize: 35000, confidence: 0.95, metric: 'preference_percentage' }
        },
        views: 567,
        createdBy: janeSmith.id
      },

      // ============================================================================
      // COMMERCE & PURCHASE BEHAVIOR (3 crosstabs)
      // ============================================================================
      {
        id: 'commerce-1',
        orgId: acmeCorp.id,
        name: 'Income Segment Purchase Channel Preferences',
        description: 'Purchase channel preferences and behaviors across different income segments',
        audiences: allAudiences.filter(a => a.orgId === acmeCorp.id).slice(0, 5).map(a => a.id),
        metrics: ['channel_preference', 'avg_order_value', 'purchase_frequency', 'return_rate', 'loyalty_score', 'cross_channel_usage', 'mobile_share', 'social_commerce'],
        filters: { channels: ['online_direct', 'marketplace', 'retail_store', 'social_commerce', 'mobile_app'], income_bands: ['<50K', '50-100K', '100-150K', '150K+'] },
        results: {
          rows: [
            { channel: 'Brand Website', under_50k: 28.5, income_50_100k: 42.3, income_100_150k: 55.8, over_150k: 68.2 },
            { channel: 'Amazon/Marketplace', under_50k: 72.5, income_50_100k: 65.2, income_100_150k: 52.3, over_150k: 42.5 },
            { channel: 'Physical Retail', under_50k: 58.2, income_50_100k: 52.5, income_100_150k: 62.3, over_150k: 72.5 },
            { channel: 'Social Commerce', under_50k: 42.5, income_50_100k: 38.2, income_100_150k: 28.5, over_150k: 22.3 },
            { channel: 'Mobile App', under_50k: 52.3, income_50_100k: 58.5, income_100_150k: 62.5, over_150k: 55.8 }
          ],
          metadata: { sampleSize: 62000, confidence: 0.95, metric: 'percentage_primary_channel' }
        },
        views: 1056,
        createdBy: adminUser.id
      },
      {
        id: 'commerce-2',
        orgId: acmeCorp.id,
        name: 'E-commerce vs In-Store by Product Category',
        description: 'Channel preference analysis for different product categories',
        audiences: allAudiences.filter(a => a.orgId === acmeCorp.id).slice(0, 6).map(a => a.id),
        metrics: ['online_share', 'store_share', 'omnichannel_rate', 'return_rate', 'avg_basket_size'],
        filters: { categories: ['electronics', 'apparel', 'grocery', 'beauty', 'home', 'sports'] },
        results: {
          rows: [
            { category: 'Electronics', online: 72.5, in_store: 18.5, omnichannel: 9.0 },
            { category: 'Apparel', online: 48.2, in_store: 38.5, omnichannel: 13.3 },
            { category: 'Grocery', online: 22.5, in_store: 68.2, omnichannel: 9.3 },
            { category: 'Beauty', online: 55.8, in_store: 32.5, omnichannel: 11.7 },
            { category: 'Home & Garden', online: 42.3, in_store: 45.2, omnichannel: 12.5 },
            { category: 'Sports & Fitness', online: 52.5, in_store: 35.8, omnichannel: 11.7 }
          ],
          metadata: { sampleSize: 78000, confidence: 0.95, lastUpdated: now.toISOString() }
        },
        views: 789,
        createdBy: johnDoe.id
      },
      {
        id: 'commerce-3',
        orgId: acmeCorp.id,
        name: 'Subscription Service Adoption by Segment',
        description: 'Subscription service usage and preferences across consumer segments',
        audiences: allAudiences.filter(a => a.orgId === acmeCorp.id).slice(0, 5).map(a => a.id),
        metrics: ['adoption_rate', 'avg_subscriptions', 'monthly_spend', 'churn_rate', 'satisfaction', 'likelihood_to_add'],
        filters: { categories: ['streaming', 'meal_kits', 'beauty_boxes', 'fitness', 'software', 'news_media'] },
        results: {
          rows: [
            { category: 'Video Streaming', gen_z: 92.5, millennials: 88.2, gen_x: 75.5, boomers: 58.2 },
            { category: 'Music Streaming', gen_z: 85.2, millennials: 78.5, gen_x: 52.3, boomers: 32.5 },
            { category: 'Meal Kits', gen_z: 18.5, millennials: 35.2, gen_x: 28.5, boomers: 15.8 },
            { category: 'Fitness Apps', gen_z: 42.5, millennials: 38.2, gen_x: 25.5, boomers: 12.3 },
            { category: 'News/Media', gen_z: 15.2, millennials: 28.5, gen_x: 42.3, boomers: 55.8 }
          ],
          metadata: { sampleSize: 45000, confidence: 0.95, metric: 'active_subscription_rate' }
        },
        views: 654,
        createdBy: janeSmith.id
      },

      // ============================================================================
      // BRAND & COMPETITIVE INTELLIGENCE (3 crosstabs)
      // ============================================================================
      {
        id: 'brand-1',
        orgId: acmeCorp.id,
        name: 'Brand Awareness Competitive Landscape',
        description: 'Competitive brand awareness and consideration metrics across audience segments',
        audiences: allAudiences.filter(a => a.orgId === acmeCorp.id).slice(0, 6).map(a => a.id),
        metrics: ['unaided_awareness', 'aided_awareness', 'consideration', 'preference', 'usage', 'loyalty', 'nps', 'share_of_voice'],
        filters: { industry: 'sportswear', brands: ['Nike', 'Adidas', 'Puma', 'Under Armour', 'New Balance', 'Lululemon'] },
        results: {
          rows: [
            { brand: 'Nike', unaided: 78.5, aided: 95.2, consideration: 68.5, preference: 42.3, nps: 58 },
            { brand: 'Adidas', unaided: 62.3, aided: 92.5, consideration: 58.2, preference: 28.5, nps: 45 },
            { brand: 'Puma', unaided: 35.2, aided: 85.5, consideration: 42.5, preference: 15.8, nps: 38 },
            { brand: 'Under Armour', unaided: 42.5, aided: 82.3, consideration: 45.2, preference: 18.5, nps: 32 },
            { brand: 'New Balance', unaided: 38.5, aided: 78.5, consideration: 48.2, preference: 22.3, nps: 52 },
            { brand: 'Lululemon', unaided: 28.5, aided: 72.5, consideration: 38.5, preference: 25.8, nps: 62 }
          ],
          metadata: { sampleSize: 52000, confidence: 0.95, industry: 'sportswear' }
        },
        views: 1423,
        createdBy: adminUser.id
      },
      {
        id: 'brand-2',
        orgId: acmeCorp.id,
        name: 'Brand Health Funnel by Market',
        description: 'Brand funnel metrics (awareness to purchase) across key geographic markets',
        audiences: allAudiences.filter(a => a.orgId === acmeCorp.id).slice(0, 5).map(a => a.id),
        metrics: ['awareness', 'familiarity', 'consideration', 'preference', 'purchase'],
        filters: { markets: ['US', 'UK', 'Germany', 'France', 'Japan'], brand: 'Nike' },
        results: {
          rows: [
            { market: 'United States', awareness: 96.5, familiarity: 88.2, consideration: 72.5, preference: 45.2, purchase: 38.5 },
            { market: 'United Kingdom', awareness: 94.2, familiarity: 85.5, consideration: 68.2, preference: 42.3, purchase: 35.2 },
            { market: 'Germany', awareness: 92.5, familiarity: 82.3, consideration: 62.5, preference: 38.5, purchase: 32.5 },
            { market: 'France', awareness: 90.8, familiarity: 78.5, consideration: 58.2, preference: 35.8, purchase: 28.5 },
            { market: 'Japan', awareness: 95.2, familiarity: 88.5, consideration: 75.2, preference: 48.5, purchase: 42.3 }
          ],
          metadata: { sampleSize: 85000, confidence: 0.95, brand: 'Nike' }
        },
        views: 876,
        createdBy: johnDoe.id
      },
      {
        id: 'brand-3',
        orgId: acmeCorp.id,
        name: 'Competitive NPS Benchmarking',
        description: 'Net Promoter Score comparison across competitors with promoter/detractor breakdown',
        audiences: allAudiences.filter(a => a.orgId === acmeCorp.id).slice(0, 4).map(a => a.id),
        metrics: ['nps', 'promoters', 'passives', 'detractors'],
        filters: { industry: 'sportswear', period: 'last_quarter' },
        results: {
          rows: [
            { brand: 'Nike', nps: 58, promoters: 68, passives: 22, detractors: 10 },
            { brand: 'Lululemon', nps: 62, promoters: 72, passives: 18, detractors: 10 },
            { brand: 'New Balance', nps: 52, promoters: 62, passives: 28, detractors: 10 },
            { brand: 'Adidas', nps: 45, promoters: 58, passives: 29, detractors: 13 },
            { brand: 'Under Armour', nps: 32, promoters: 48, passives: 36, detractors: 16 }
          ],
          metadata: { sampleSize: 42000, confidence: 0.95, period: 'Q4 2024' }
        },
        views: 567,
        createdBy: janeSmith.id
      },

      // ============================================================================
      // MEDIA & CONTENT CONSUMPTION (3 crosstabs)
      // ============================================================================
      {
        id: 'media-1',
        orgId: acmeCorp.id,
        name: 'Media Consumption by Daypart',
        description: 'Media consumption patterns across different times of day by audience segment',
        audiences: allAudiences.filter(a => a.orgId === acmeCorp.id).slice(0, 5).map(a => a.id),
        metrics: ['reach', 'time_spent', 'engagement', 'ad_receptivity', 'content_type', 'device_usage', 'multitasking_rate', 'attention_quality'],
        filters: { dayparts: ['early_morning', 'morning_commute', 'daytime', 'evening_prime', 'late_night'], media: ['tv', 'streaming', 'social', 'radio', 'podcast'] },
        results: {
          rows: [
            { daypart: 'Early Morning (5-8am)', tv: 22.5, streaming: 15.2, social: 42.5, radio: 28.5, podcast: 18.2 },
            { daypart: 'Morning Commute (8-10am)', tv: 8.5, streaming: 12.3, social: 55.2, radio: 42.5, podcast: 35.8 },
            { daypart: 'Daytime (10am-5pm)', tv: 15.2, streaming: 22.5, social: 48.5, radio: 32.5, podcast: 28.2 },
            { daypart: 'Evening Prime (7-10pm)', tv: 58.5, streaming: 72.3, social: 52.5, radio: 12.5, podcast: 22.5 },
            { daypart: 'Late Night (10pm+)', tv: 32.5, streaming: 55.8, social: 45.2, radio: 8.5, podcast: 15.2 }
          ],
          metadata: { sampleSize: 38000, metric: 'percentage_reach', confidence: 0.95 }
        },
        views: 892,
        createdBy: adminUser.id
      },
      {
        id: 'media-2',
        orgId: acmeCorp.id,
        name: 'Streaming Service Preferences by Age',
        description: 'Streaming service usage and satisfaction across age demographics',
        audiences: allAudiences.filter(a => a.orgId === acmeCorp.id).slice(0, 4).map(a => a.id),
        metrics: ['subscription_rate', 'monthly_hours', 'satisfaction', 'likelihood_to_churn', 'content_preference', 'ad_tolerance'],
        filters: { services: ['Netflix', 'Disney+', 'HBO Max', 'Amazon Prime', 'Hulu', 'Apple TV+'] },
        results: {
          rows: [
            { service: 'Netflix', age_18_24: 78.5, age_25_34: 82.3, age_35_44: 75.2, age_45_plus: 62.5 },
            { service: 'Disney+', age_18_24: 52.3, age_25_34: 68.5, age_35_44: 72.5, age_45_plus: 45.2 },
            { service: 'HBO Max', age_18_24: 42.5, age_25_34: 55.8, age_35_44: 48.2, age_45_plus: 38.5 },
            { service: 'Amazon Prime', age_18_24: 58.2, age_25_34: 72.5, age_35_44: 78.5, age_45_plus: 68.2 },
            { service: 'YouTube Premium', age_18_24: 35.2, age_25_34: 28.5, age_35_44: 18.5, age_45_plus: 12.3 }
          ],
          metadata: { sampleSize: 55000, metric: 'active_subscription_rate', confidence: 0.95 }
        },
        views: 654,
        createdBy: johnDoe.id
      },
      {
        id: 'media-3',
        orgId: acmeCorp.id,
        name: 'News Source Trust by Demographics',
        description: 'Trust levels in different news sources across demographic segments',
        audiences: allAudiences.filter(a => a.orgId === acmeCorp.id).slice(0, 5).map(a => a.id),
        metrics: ['trust_score', 'usage_frequency', 'credibility', 'recommendation_rate', 'political_lean_perception', 'ad_receptivity', 'subscription_intent'],
        filters: { sources: ['traditional_tv', 'newspapers', 'social_media', 'podcasts', 'online_news', 'local_news'] },
        results: {
          rows: [
            { source: 'Traditional TV News', gen_z: 32.5, millennials: 42.5, gen_x: 58.2, boomers: 72.5 },
            { source: 'Print Newspapers', gen_z: 18.5, millennials: 28.5, gen_x: 48.2, boomers: 68.5 },
            { source: 'Social Media News', gen_z: 42.5, millennials: 35.2, gen_x: 22.5, boomers: 15.2 },
            { source: 'Podcasts', gen_z: 48.5, millennials: 55.8, gen_x: 42.3, boomers: 28.5 },
            { source: 'Online News Sites', gen_z: 55.2, millennials: 62.5, gen_x: 58.2, boomers: 48.5 }
          ],
          metadata: { sampleSize: 42000, metric: 'trust_percentage', confidence: 0.95 }
        },
        views: 423,
        createdBy: janeSmith.id
      },

      // ============================================================================
      // DEMOGRAPHICS & SEGMENTATION (2 crosstabs)
      // ============================================================================
      {
        id: 'demo-1',
        orgId: acmeCorp.id,
        name: 'Sustainability Attitudes by Consumer Segment',
        description: 'Environmental attitudes and sustainable purchasing behavior across consumer segments',
        audiences: allAudiences.filter(a => a.orgId === acmeCorp.id).slice(0, 5).map(a => a.id),
        metrics: ['concern_level', 'purchase_impact', 'willingness_to_pay_more', 'brand_switching', 'greenwashing_skepticism', 'action_intent', 'category_relevance', 'information_seeking'],
        filters: { topics: ['climate_change', 'plastic_reduction', 'carbon_footprint', 'ethical_sourcing', 'circular_economy'] },
        results: {
          rows: [
            { attitude: 'Very Concerned', gen_z: 68.5, millennials: 58.2, gen_x: 45.5, boomers: 38.2, eco_conscious: 95.2 },
            { attitude: 'Pay Premium (10%+)', gen_z: 52.3, millennials: 48.5, gen_x: 35.2, boomers: 28.5, eco_conscious: 85.5 },
            { attitude: 'Switched Brands', gen_z: 62.5, millennials: 55.8, gen_x: 42.3, boomers: 32.5, eco_conscious: 88.2 },
            { attitude: 'Research Before Buy', gen_z: 72.5, millennials: 68.2, gen_x: 52.5, boomers: 42.3, eco_conscious: 92.5 },
            { attitude: 'Skeptical of Claims', gen_z: 58.5, millennials: 52.3, gen_x: 48.2, boomers: 55.8, eco_conscious: 75.2 }
          ],
          metadata: { sampleSize: 65000, confidence: 0.95, lastUpdated: now.toISOString() }
        },
        views: 1087,
        createdBy: adminUser.id
      },
      {
        id: 'demo-2',
        orgId: techStartup.id,
        name: 'Tech Adoption by Income Level',
        description: 'Technology adoption rates and attitudes across different income brackets',
        audiences: allAudiences.filter(a => a.orgId === techStartup.id).map(a => a.id),
        metrics: ['adoption_rate', 'spending', 'early_adopter_index', 'brand_preference', 'upgrade_frequency'],
        filters: { categories: ['smartphones', 'smart_home', 'wearables', 'ev_vehicles', 'ai_assistants'] },
        results: {
          rows: [
            { tech: 'Latest Smartphone', under_50k: 42.5, income_50_100k: 65.2, income_100_150k: 82.5, over_150k: 92.3 },
            { tech: 'Smart Home Devices', under_50k: 28.5, income_50_100k: 48.5, income_100_150k: 72.3, over_150k: 88.5 },
            { tech: 'Wearable Tech', under_50k: 22.3, income_50_100k: 42.5, income_100_150k: 62.5, over_150k: 78.2 },
            { tech: 'Electric Vehicle', under_50k: 5.2, income_50_100k: 12.5, income_100_150k: 28.5, over_150k: 52.3 },
            { tech: 'AI Assistants', under_50k: 35.2, income_50_100k: 52.3, income_100_150k: 68.5, over_150k: 82.5 }
          ],
          metadata: { sampleSize: 32000, metric: 'ownership_rate', confidence: 0.92 }
        },
        views: 345,
        createdBy: bobWilson.id
      },

      // ============================================================================
      // MARKET & GEOGRAPHIC ANALYSIS (2 crosstabs)
      // ============================================================================
      {
        id: 'market-1',
        orgId: acmeCorp.id,
        name: 'Global Market Digital Behavior Comparison',
        description: 'Digital behavior and platform usage patterns across global markets',
        audiences: allAudiences.filter(a => a.orgId === acmeCorp.id).slice(0, 8).map(a => a.id),
        metrics: ['internet_penetration', 'mobile_usage', 'social_media_adoption', 'ecommerce_share', 'digital_payments', 'streaming_adoption', 'gaming_engagement', 'digital_ad_spend'],
        filters: { markets: ['US', 'UK', 'Germany', 'France', 'Japan', 'China', 'Brazil', 'India'] },
        results: {
          rows: [
            { market: 'United States', internet: 92.5, mobile: 85.2, social: 72.5, ecommerce: 21.5 },
            { market: 'United Kingdom', internet: 95.2, mobile: 88.5, social: 78.2, ecommerce: 28.5 },
            { market: 'Germany', internet: 91.5, mobile: 82.3, social: 65.2, ecommerce: 18.5 },
            { market: 'Japan', internet: 93.8, mobile: 92.5, social: 72.5, ecommerce: 12.5 },
            { market: 'China', internet: 73.5, mobile: 98.2, social: 85.5, ecommerce: 52.3 },
            { market: 'Brazil', internet: 81.2, mobile: 92.5, social: 88.5, ecommerce: 15.2 },
            { market: 'India', internet: 52.5, mobile: 78.5, social: 45.2, ecommerce: 8.5 }
          ],
          metadata: { sampleSize: 185000, metric: 'percentage', confidence: 0.95, lastUpdated: now.toISOString() }
        },
        views: 2156,
        createdBy: adminUser.id
      },
      {
        id: 'market-2',
        orgId: enterpriseCo.id,
        name: 'US vs UK vs Germany Consumer Attitudes',
        description: 'Cross-market comparison of consumer attitudes, values, and purchase behaviors',
        audiences: [allAudiences.find(a => a.name === 'Enterprise Decision Makers')?.id].filter(Boolean) as string[],
        metrics: ['price_sensitivity', 'brand_loyalty', 'quality_focus', 'sustainability_priority', 'innovation_openness', 'privacy_concern', 'ad_receptivity', 'local_preference', 'online_trust', 'service_expectations'],
        filters: { markets: ['US', 'UK', 'Germany'], categories: ['all'] },
        results: {
          rows: [
            { attitude: 'Price Sensitivity', us: 65.2, uk: 72.5, germany: 78.5 },
            { attitude: 'Brand Loyalty', us: 52.3, uk: 58.2, germany: 68.5 },
            { attitude: 'Quality Focus', us: 72.5, uk: 75.8, germany: 88.2 },
            { attitude: 'Sustainability Priority', us: 55.2, uk: 62.5, germany: 78.5 },
            { attitude: 'Privacy Concern', us: 58.5, uk: 65.2, germany: 85.5 },
            { attitude: 'Local Brand Preference', us: 42.5, uk: 48.5, germany: 62.3 }
          ],
          metadata: { sampleSize: 45000, metric: 'importance_score', confidence: 0.95 }
        },
        views: 876,
        createdBy: sarahEnterprise.id
      }
    ]
  })

  // ==================== CHARTS ====================
  console.log('📈 Creating charts...')

  // Create charts with explicit IDs for reliable API access
  await prisma.chart.create({
    data: {
      id: '1',
      orgId: acmeCorp.id,
      name: 'Brand Health Trend Analysis',
      description: 'Weekly brand health scores over the past 12 months with trend analysis and predictions',
      type: 'LINE',
      config: {
        xAxis: { type: 'time', label: 'Date' },
        yAxis: { type: 'linear', label: 'Brand Health Score', min: 0, max: 100 },
        series: ['Nike', 'Adidas', 'Under Armour', 'Puma'],
        colors: ['#FF6B35', '#004E89', '#1A936F', '#F4D35E'],
        showLegend: true,
        showTrendline: true,
        annotations: [
          { date: '2024-06-15', label: 'Nike Campaign Launch', type: 'event' },
          { date: '2024-09-01', label: 'Holiday Season Start', type: 'period' }
        ]
      },
      data: {
        labels: Array.from({ length: 52 }, (_, i) => {
          const d = new Date(now.getTime() - (51 - i) * 7 * 24 * 60 * 60 * 1000)
          return d.toISOString().split('T')[0]
        }),
        datasets: [
          { label: 'Nike', data: Array.from({ length: 52 }, () => 75 + Math.random() * 15) },
          { label: 'Adidas', data: Array.from({ length: 52 }, () => 68 + Math.random() * 12) },
          { label: 'Under Armour', data: Array.from({ length: 52 }, () => 55 + Math.random() * 15) },
          { label: 'Puma', data: Array.from({ length: 52 }, () => 60 + Math.random() * 12) }
        ]
      },
      status: 'PUBLISHED',
      createdBy: adminUser.id
    }
  })

  await prisma.chart.create({
    data: {
      id: '2',
      orgId: acmeCorp.id,
      name: 'Market Share Distribution',
      description: 'Current market share distribution across tracked brands in the sportswear category',
      type: 'PIE',
      config: {
        showLabels: true,
        showPercentages: true,
        innerRadius: 0,
        colors: ['#FF6B35', '#004E89', '#1A936F', '#F4D35E', '#88CCF1', '#D64045']
      },
      data: {
        labels: ['Nike', 'Adidas', 'Under Armour', 'Puma', 'New Balance', 'Others'],
        datasets: [{ data: [32.5, 22.8, 8.5, 12.2, 7.8, 16.2] }]
      },
      status: 'PUBLISHED',
      createdBy: johnDoe.id
    }
  })

  await prisma.chart.create({
    data: {
      id: '3',
      orgId: acmeCorp.id,
      name: 'Audience Engagement Funnel',
      description: 'Conversion funnel from awareness to purchase across all audiences',
      type: 'FUNNEL',
      config: {
        stages: ['Awareness', 'Consideration', 'Preference', 'Intent', 'Purchase'],
        colors: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'],
        showConversionRates: true,
        orientation: 'vertical'
      },
      data: {
        values: [100, 68.5, 45.2, 28.5, 18.2],
        conversions: [68.5, 66.0, 63.1, 63.9]
      },
      status: 'PUBLISHED',
      createdBy: janeSmith.id
    }
  })

  await prisma.chart.create({
    data: {
      id: '4',
      orgId: acmeCorp.id,
      name: 'Competitive Radar Chart',
      description: 'Multi-dimensional competitive analysis across key brand metrics',
      type: 'RADAR',
      config: {
        dimensions: ['Awareness', 'Consideration', 'Preference', 'Loyalty', 'NPS', 'Sentiment'],
        maxValue: 100,
        showArea: true,
        opacity: 0.3
      },
      data: {
        labels: ['Awareness', 'Consideration', 'Preference', 'Loyalty', 'NPS', 'Sentiment'],
        datasets: [
          { label: 'Nike', data: [85, 72, 65, 78, 62, 75], color: '#FF6B35' },
          { label: 'Adidas', data: [78, 65, 58, 68, 52, 68], color: '#004E89' },
          { label: 'Puma', data: [68, 55, 48, 58, 45, 62], color: '#1A936F' }
        ]
      },
      status: 'PUBLISHED',
      createdBy: adminUser.id
    }
  })

  await prisma.chart.create({
    data: {
      id: '5',
      orgId: acmeCorp.id,
      name: 'Sentiment Heatmap by Platform',
      description: 'Brand sentiment analysis across social media platforms and time',
      type: 'HEATMAP',
      config: {
        xAxis: { label: 'Platform' },
        yAxis: { label: 'Week' },
        colorScale: { min: -1, max: 1, colors: ['#EF4444', '#F59E0B', '#10B981'] },
        showValues: true
      },
      data: {
        xLabels: ['Twitter', 'Instagram', 'Facebook', 'TikTok', 'YouTube', 'LinkedIn'],
        yLabels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
        values: [
          [0.65, 0.78, 0.52, 0.85, 0.72, 0.68],
          [0.58, 0.82, 0.48, 0.88, 0.75, 0.72],
          [0.72, 0.75, 0.55, 0.82, 0.78, 0.65],
          [0.68, 0.85, 0.58, 0.92, 0.82, 0.70]
        ]
      },
      status: 'PUBLISHED',
      createdBy: johnDoe.id
    }
  })

  await prisma.chart.create({
    data: {
      id: '6',
      orgId: acmeCorp.id,
      name: 'Age Demographics Distribution',
      description: 'Audience distribution by age group with brand preference overlay',
      type: 'BAR',
      config: {
        orientation: 'vertical',
        stacked: false,
        grouped: true,
        showLabels: true,
        xAxis: { label: 'Age Group' },
        yAxis: { label: 'Percentage' }
      },
      data: {
        labels: ['18-24', '25-34', '35-44', '45-54', '55+'],
        datasets: [
          { label: 'Brand A Preference', data: [28.5, 35.2, 22.8, 18.5, 12.2], color: '#3B82F6' },
          { label: 'Brand B Preference', data: [22.3, 28.5, 32.5, 25.8, 18.5], color: '#10B981' }
        ]
      },
      status: 'PUBLISHED',
      createdBy: janeSmith.id
    }
  })

  await prisma.chart.create({
    data: {
      id: '7',
      orgId: acmeCorp.id,
      name: 'NPS Score Trend',
      description: 'Net Promoter Score trend over time with industry benchmark',
      type: 'AREA',
      config: {
        xAxis: { type: 'time', label: 'Month' },
        yAxis: { label: 'NPS Score', min: -100, max: 100 },
        fill: true,
        showBenchmark: true,
        benchmarkValue: 45,
        gradient: true
      },
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        datasets: [
          { label: 'NPS', data: [52, 48, 55, 58, 52, 62, 65, 58, 68, 72, 68, 75], color: '#3B82F6' }
        ],
        benchmark: { label: 'Industry Average', value: 45 }
      },
      status: 'PUBLISHED',
      createdBy: adminUser.id
    }
  })

  await prisma.chart.create({
    data: {
      id: '8',
      orgId: acmeCorp.id,
      name: 'Interest Category Treemap',
      description: 'Audience interest categories sized by engagement level',
      type: 'TREEMAP',
      config: {
        colorScale: 'category',
        showLabels: true,
        showValues: true,
        groupBy: 'category'
      },
      data: {
        children: [
          { name: 'Technology', value: 42500, children: [
            { name: 'AI & ML', value: 15000 },
            { name: 'Mobile', value: 12500 },
            { name: 'Gaming', value: 15000 }
          ]},
          { name: 'Lifestyle', value: 38000, children: [
            { name: 'Fitness', value: 18000 },
            { name: 'Travel', value: 12000 },
            { name: 'Food', value: 8000 }
          ]},
          { name: 'Entertainment', value: 35000, children: [
            { name: 'Streaming', value: 20000 },
            { name: 'Music', value: 10000 },
            { name: 'Sports', value: 5000 }
          ]}
        ]
      },
      status: 'PUBLISHED',
      createdBy: johnDoe.id
    }
  })

  await prisma.chart.create({
    data: {
      id: '9',
      orgId: techStartup.id,
      name: 'User Growth Trajectory',
      description: 'Monthly active users growth with cohort retention overlay',
      type: 'LINE',
      config: {
        xAxis: { type: 'time', label: 'Month' },
        yAxis: { label: 'Users (thousands)', type: 'linear' },
        showArea: true,
        showDataPoints: true,
        smoothing: 0.3
      },
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        datasets: [
          { label: 'MAU', data: [125, 142, 168, 195, 228, 265, 312, 358, 415, 478, 542, 628], color: '#8B5CF6' },
          { label: 'DAU', data: [45, 52, 62, 75, 88, 102, 125, 145, 168, 195, 225, 262], color: '#10B981' }
        ]
      },
      status: 'PUBLISHED',
      createdBy: bobWilson.id
    }
  })

  await prisma.chart.create({
    data: {
      id: '10',
      orgId: enterpriseCo.id,
      name: 'Revenue by Region',
      description: 'Quarterly revenue breakdown by geographic region',
      type: 'DONUT',
      config: {
        innerRadius: 60,
        showLabels: true,
        showPercentages: true,
        legend: { position: 'right' }
      },
      data: {
        labels: ['North America', 'Europe', 'Asia Pacific', 'Latin America', 'Middle East & Africa'],
        datasets: [{ data: [42.5, 28.2, 18.5, 6.8, 4.0] }]
      },
      status: 'PUBLISHED',
      createdBy: sarahEnterprise.id
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
    _totalDays: number,
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
      id: '1',
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
      id: '2',
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
      id: '3',
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
      id: '4',
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
      id: '5',
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
      id: '6',
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
      id: '7',
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
      id: '8',
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

  // ==================== REPORTS ====================
  console.log('📄 Creating reports...')

  // Create 20 advanced reports organized by solution area with explicit IDs for reliable API access

  // ============================================================================
  // CORE SOLUTION AREA REPORTS (3 reports)
  // ============================================================================
  await prisma.report.create({
    data: {
      id: 'core-1',
      orgId: acmeCorp.id,
      title: 'Global Audience Segmentation Analysis 2024',
      description: 'Deep dive into audience segments across 52 global markets, identifying key behavioral patterns, demographic clusters, and engagement opportunities.',
      type: ReportType.PRESENTATION,
      status: ReportStatus.PUBLISHED,
      content: {
        agent: 'Audience Explorer Agent',
        solutionArea: 'Core',
        slides: [
          { type: 'title', title: 'Global Audience Segmentation', subtitle: '2024 Analysis Report' },
          { type: 'overview', title: 'Executive Summary', keyFindings: ['12 distinct audience segments identified', '2.8B addressable consumers', '35% growth in digital-first segment'] },
          { type: 'segments', title: 'Primary Segments', data: [
            { name: 'Digital Natives', size: '485M', growth: '+18%', engagement: 'Very High' },
            { name: 'Value Seekers', size: '620M', growth: '+8%', engagement: 'Medium' },
            { name: 'Premium Aspirers', size: '340M', growth: '+22%', engagement: 'High' },
            { name: 'Eco-Conscious', size: '280M', growth: '+45%', engagement: 'High' }
          ]},
          { type: 'demographics', title: 'Demographic Distribution', charts: ['age_breakdown', 'income_levels', 'geographic_spread'] },
          { type: 'behaviors', title: 'Behavioral Insights', patterns: ['Mobile-first browsing', 'Social commerce adoption', 'Subscription fatigue', 'Privacy awareness'] },
          { type: 'recommendations', title: 'Strategic Actions', items: ['Prioritize Digital Natives for new product launches', 'Develop value messaging for price-sensitive segments', 'Invest in sustainability messaging'] }
        ],
        dataSources: ['GWI Core', 'GWI USA', 'GWI Zeitgeist'],
        markets: ['United States', 'United Kingdom', 'Germany', 'France', 'Japan'],
        metadata: { generatedAt: now.toISOString(), period: 'Q4 2024', sampleSize: 850000 }
      },
      thumbnail: '/presentation-slides.png',
      agentId: audienceAnalysisAgent.id,
      views: 892,
      createdBy: adminUser.id
    }
  })

  await prisma.report.create({
    data: {
      id: 'core-2',
      orgId: acmeCorp.id,
      title: 'Millennial vs Gen Z Behavioral Comparison',
      description: 'Comprehensive persona analysis comparing Millennial and Gen Z consumer behaviors, preferences, and brand relationships.',
      type: ReportType.DASHBOARD,
      status: ReportStatus.PUBLISHED,
      content: {
        agent: 'Persona Architect Agent',
        solutionArea: 'Core',
        widgets: [
          { type: 'comparison_header', title: 'Generation Comparison Dashboard', generations: ['Millennials (25-40)', 'Gen Z (16-24)'] },
          { type: 'kpi_row', metrics: [
            { label: 'Total Addressable', millennial: '1.8B', genZ: '2.1B' },
            { label: 'Avg. Spend/Year', millennial: '$4,200', genZ: '$2,800' },
            { label: 'Brand Loyalty Index', millennial: 72, genZ: 58 }
          ]},
          { type: 'chart', title: 'Platform Preferences', chartType: 'grouped_bar', data: {
            platforms: ['TikTok', 'Instagram', 'YouTube', 'Facebook', 'Twitter'],
            millennial: [35, 78, 82, 68, 42],
            genZ: [89, 85, 92, 22, 28]
          }},
          { type: 'chart', title: 'Purchase Drivers', chartType: 'radar', categories: ['Price', 'Quality', 'Brand Values', 'Convenience', 'Sustainability', 'Social Proof'] },
          { type: 'insights', title: 'Key Differentiators', items: [
            'Gen Z 3x more likely to discover brands on TikTok',
            'Millennials show 40% higher brand loyalty',
            'Both prioritize sustainability but Gen Z acts on it more'
          ]},
          { type: 'table', title: 'Top Brand Affinities', columns: ['Brand', 'Millennial Affinity', 'Gen Z Affinity', 'Gap'] }
        ],
        refreshRate: '24h',
        lastUpdated: now.toISOString(),
        metadata: { period: 'Q4 2024', respondents: 125000 }
      },
      thumbnail: '/analytics-dashboard.png',
      agentId: audienceAnalysisAgent.id,
      views: 1247,
      createdBy: johnDoe.id
    }
  })

  await prisma.report.create({
    data: {
      id: 'core-3',
      orgId: acmeCorp.id,
      title: 'Cultural Shifts in Consumer Values Q4 2024',
      description: 'Analysis of emerging cultural trends and shifting consumer values impacting brand perception and purchase behavior.',
      type: ReportType.PDF,
      status: ReportStatus.PUBLISHED,
      content: {
        agent: 'Culture Tracker Agent',
        solutionArea: 'Core',
        sections: [
          { title: 'Executive Summary', content: 'Consumer values are undergoing rapid transformation, driven by economic uncertainty, climate concerns, and technological disruption.' },
          { title: 'Top Cultural Shifts', trends: [
            { name: 'Conscious Consumption', impact: 'High', growth: '+28%', description: 'Consumers increasingly evaluate purchases through ethical and environmental lens' },
            { name: 'Digital Wellness', impact: 'Medium', growth: '+35%', description: 'Growing awareness of screen time and desire for digital-physical balance' },
            { name: 'Community Over Individualism', impact: 'High', growth: '+22%', description: 'Shift from personal branding to collective experiences and local connections' },
            { name: 'Authenticity Imperative', impact: 'Very High', growth: '+40%', description: 'Rejection of polished marketing in favor of genuine brand communication' }
          ]},
          { title: 'Regional Variations', markets: [
            { region: 'North America', primaryTrend: 'Digital Wellness', uniqueFactor: 'Political polarization affecting brand choices' },
            { region: 'Europe', primaryTrend: 'Conscious Consumption', uniqueFactor: 'Regulatory pressure driving sustainability' },
            { region: 'APAC', primaryTrend: 'Community Focus', uniqueFactor: 'Rising nationalism influencing local brand preference' }
          ]},
          { title: 'Implications for Brands', recommendations: ['Lead with purpose, not product', 'Embrace imperfection in content', 'Build community touchpoints', 'Demonstrate measurable impact'] },
          { title: 'Methodology', details: 'Social listening analysis of 2.5M conversations, survey of 50,000 respondents across 15 markets' }
        ],
        pageCount: 42,
        metadata: { generatedAt: now.toISOString(), markets: 15, conversationsAnalyzed: 2500000 }
      },
      thumbnail: '/pdf-report-document.jpg',
      agentId: marketResearchAgent.id,
      views: 654,
      createdBy: janeSmith.id
    }
  })

  // ============================================================================
  // SALES SOLUTION AREA REPORTS (3 reports)
  // ============================================================================
  await prisma.report.create({
    data: {
      id: 'sales-1',
      orgId: acmeCorp.id,
      title: 'Enterprise Buyer Persona Deep Dive',
      description: 'Detailed buyer personas for enterprise software purchasing, including decision-making patterns, pain points, and engagement preferences.',
      type: ReportType.PRESENTATION,
      status: ReportStatus.PUBLISHED,
      content: {
        agent: 'Buyer Persona Agent',
        solutionArea: 'Sales',
        slides: [
          { type: 'title', title: 'Enterprise Buyer Personas', subtitle: 'Data-Driven Sales Intelligence' },
          { type: 'persona', name: 'The Strategic CTO', demographics: { age: '42-55', company: 'Enterprise 1000+', budget: '$500K+' }, motivations: ['Digital transformation', 'Cost optimization', 'Competitive advantage'], painPoints: ['Legacy system integration', 'Change management', 'Vendor lock-in'], channels: ['LinkedIn', 'Industry events', 'Peer referrals'] },
          { type: 'persona', name: 'The Pragmatic VP Engineering', demographics: { age: '35-48', company: 'Mid-market', budget: '$100K-500K' }, motivations: ['Team productivity', 'Technical excellence', 'Scalability'], painPoints: ['Resource constraints', 'Technical debt', 'Talent retention'], channels: ['Technical blogs', 'GitHub', 'Dev conferences'] },
          { type: 'persona', name: 'The Innovation Director', demographics: { age: '38-52', company: 'Fortune 500', budget: '$1M+' }, motivations: ['Market disruption', 'Emerging tech adoption', 'Strategic partnerships'], painPoints: ['ROI demonstration', 'Internal politics', 'Speed to market'], channels: ['Executive networks', 'Thought leadership', 'Advisory boards'] },
          { type: 'journey', title: 'Buyer Journey Map', stages: ['Awareness', 'Consideration', 'Evaluation', 'Decision', 'Implementation'] },
          { type: 'tactics', title: 'Engagement Strategies', items: ['Lead with business outcomes', 'Provide technical depth on request', 'Leverage peer testimonials', 'Offer proof-of-concept programs'] }
        ],
        metadata: { generatedAt: now.toISOString(), personasResearched: 3, respondents: 8500 }
      },
      thumbnail: '/presentation-slides.png',
      agentId: audienceAnalysisAgent.id,
      views: 423,
      createdBy: johnDoe.id
    }
  })

  await prisma.report.create({
    data: {
      id: 'sales-2',
      orgId: acmeCorp.id,
      title: 'Competitive Battlecard: Tech Industry Q4',
      description: 'Sales battlecard with competitive positioning, objection handling, and win strategies against top 5 competitors.',
      type: ReportType.PDF,
      status: ReportStatus.PUBLISHED,
      content: {
        agent: 'Competitive Intelligence Agent',
        solutionArea: 'Sales',
        sections: [
          { title: 'Competitive Overview', summary: 'Analysis of top 5 competitors by market share, positioning, and recent activity' },
          { title: 'Competitor A - Market Leader', marketShare: '32%', positioning: 'Enterprise-first, premium pricing', strengths: ['Brand recognition', 'Ecosystem lock-in', 'Global support'], weaknesses: ['Slow innovation', 'Complex pricing', 'Poor mid-market fit'], winStrategy: 'Emphasize agility and TCO advantages', objectionHandlers: [
            { objection: 'You\'re not as established', response: 'Our modern architecture delivers 40% faster implementation with dedicated support' },
            { objection: 'Integration concerns', response: 'Pre-built connectors for 200+ enterprise systems, plus open API' }
          ]},
          { title: 'Competitor B - Challenger', marketShare: '18%', positioning: 'Price disruptor', strengths: ['Aggressive pricing', 'Simple deployment'], weaknesses: ['Limited features', 'Support issues', 'Scalability concerns'], winStrategy: 'Focus on total cost of ownership and enterprise readiness' },
          { title: 'Win/Loss Analysis', data: { wins: { vsCompA: 42, vsCompB: 68 }, losses: { vsCompA: 31, vsCompB: 22 }, primaryWinReasons: ['Product capabilities', 'Customer success', 'Pricing transparency'], primaryLossReasons: ['Incumbent relationship', 'Budget constraints', 'Feature gaps'] }},
          { title: 'Talk Tracks', scenarios: ['Initial discovery', 'Technical evaluation', 'Procurement negotiation'] }
        ],
        pageCount: 28,
        metadata: { generatedAt: now.toISOString(), competitorsAnalyzed: 5, dealsAnalyzed: 340 }
      },
      thumbnail: '/pdf-report-document.jpg',
      agentId: marketResearchAgent.id,
      views: 312,
      createdBy: janeSmith.id
    }
  })

  await prisma.report.create({
    data: {
      id: 'sales-3',
      orgId: techStartup.id,
      title: 'Account Prioritization Model Dashboard',
      description: 'Interactive dashboard for scoring and prioritizing accounts based on fit, intent, and engagement signals.',
      type: ReportType.DASHBOARD,
      status: ReportStatus.DRAFT,
      content: {
        agent: 'Account Scoring Agent',
        solutionArea: 'Sales',
        widgets: [
          { type: 'score_distribution', title: 'Account Score Distribution', buckets: ['Hot (80+)', 'Warm (60-79)', 'Nurture (40-59)', 'Cold (<40)'], counts: [45, 128, 234, 412] },
          { type: 'top_accounts', title: 'Priority Accounts', columns: ['Account', 'Score', 'Signals', 'Next Action'], rows: 25 },
          { type: 'scoring_factors', title: 'Score Components', factors: [
            { name: 'Firmographic Fit', weight: 30, description: 'Company size, industry, tech stack' },
            { name: 'Intent Signals', weight: 35, description: 'Website visits, content engagement, search behavior' },
            { name: 'Engagement Level', weight: 25, description: 'Email opens, meeting attendance, demo requests' },
            { name: 'Relationship Strength', weight: 10, description: 'Executive connections, past interactions' }
          ]},
          { type: 'trends', title: 'Score Movement', chartType: 'waterfall', period: '30d' },
          { type: 'alerts', title: 'Score Alerts', items: ['12 accounts moved to Hot this week', '3 engaged accounts showing buying signals', '5 accounts at risk of churning'] }
        ],
        filters: ['Industry', 'Region', 'Account Owner', 'Score Range'],
        lastUpdated: now.toISOString(),
        metadata: { accountsScored: 819, modelVersion: '2.3' }
      },
      thumbnail: '/analytics-dashboard.png',
      views: 0,
      createdBy: bobWilson.id
    }
  })

  // ============================================================================
  // INSIGHTS SOLUTION AREA REPORTS (2 reports)
  // ============================================================================
  await prisma.report.create({
    data: {
      id: 'insights-1',
      orgId: acmeCorp.id,
      title: 'Consumer Motivation Analysis: Sustainability',
      description: 'Deep analysis of sustainability as a purchase driver, exploring motivations, barriers, and segment-specific attitudes.',
      type: ReportType.PRESENTATION,
      status: ReportStatus.PUBLISHED,
      content: {
        agent: 'Motivation Decoder Agent',
        solutionArea: 'Insights',
        slides: [
          { type: 'title', title: 'Sustainability Motivations', subtitle: 'Understanding the Green Consumer' },
          { type: 'overview', title: 'Key Findings', stats: { careAboutSustainability: '78%', willingToPayMore: '62%', switchedBrands: '45%', skepticalOfClaims: '55%' }},
          { type: 'motivations', title: 'Primary Drivers', ranked: [
            { motivation: 'Environmental concern', strength: 85, segment: 'All ages' },
            { motivation: 'Health & wellness connection', strength: 72, segment: 'Parents, 35-54' },
            { motivation: 'Social signaling', strength: 68, segment: 'Gen Z, Urban' },
            { motivation: 'Cost savings (long-term)', strength: 58, segment: 'Value-conscious' },
            { motivation: 'Quality perception', strength: 52, segment: 'Premium buyers' }
          ]},
          { type: 'barriers', title: 'Purchase Barriers', items: ['Price premium perception', 'Greenwashing skepticism', 'Convenience trade-offs', 'Lack of clear information'] },
          { type: 'segments', title: 'Attitude Segments', data: [
            { segment: 'Eco-Champions', size: '18%', behavior: 'Active seekers, premium payers' },
            { segment: 'Considerers', size: '35%', behavior: 'Open but price-sensitive' },
            { segment: 'Skeptics', size: '28%', behavior: 'Need proof, distrust claims' },
            { segment: 'Indifferent', size: '19%', behavior: 'Other priorities dominate' }
          ]},
          { type: 'implications', title: 'Strategic Implications', recommendations: ['Lead with proof, not promises', 'Make sustainable choice the easy choice', 'Connect sustainability to personal benefit'] }
        ],
        metadata: { generatedAt: now.toISOString(), respondents: 42000, markets: ['US', 'UK', 'DE', 'FR', 'JP'] }
      },
      thumbnail: '/presentation-slides.png',
      agentId: audienceAnalysisAgent.id,
      views: 789,
      createdBy: janeSmith.id
    }
  })

  await prisma.report.create({
    data: {
      id: 'insights-2',
      orgId: acmeCorp.id,
      title: 'Cross-Market Insights: US vs UK vs Germany',
      description: 'Comparative analysis of consumer behavior, brand perception, and market dynamics across three key markets.',
      type: ReportType.DASHBOARD,
      status: ReportStatus.PUBLISHED,
      content: {
        agent: 'Global Perspective Agent',
        solutionArea: 'Insights',
        widgets: [
          { type: 'market_overview', title: 'Market Comparison', markets: [
            { name: 'United States', population: '331M', digitalPenetration: '92%', ecommerceShare: '21%' },
            { name: 'United Kingdom', population: '67M', digitalPenetration: '95%', ecommerceShare: '28%' },
            { name: 'Germany', population: '83M', digitalPenetration: '91%', ecommerceShare: '18%' }
          ]},
          { type: 'chart', title: 'Brand Awareness Comparison', chartType: 'grouped_bar', metrics: ['Aided Awareness', 'Unaided Awareness', 'Consideration', 'Preference'] },
          { type: 'chart', title: 'Channel Preferences', chartType: 'stacked_bar', channels: ['Social', 'Search', 'Email', 'TV', 'OOH'] },
          { type: 'heatmap', title: 'Cultural Factors Matrix', factors: ['Price Sensitivity', 'Brand Loyalty', 'Sustainability Focus', 'Digital Adoption', 'Privacy Concerns'] },
          { type: 'insights', title: 'Key Differentiators', items: [
            'US: Highest brand switching, lowest loyalty',
            'UK: Most advanced in social commerce',
            'Germany: Strongest privacy concerns, data reluctance'
          ]},
          { type: 'recommendations', title: 'Localization Needs', items: ['Adjust pricing strategy by market', 'Customize messaging for cultural values', 'Adapt channel mix significantly'] }
        ],
        refreshRate: 'weekly',
        lastUpdated: now.toISOString(),
        metadata: { marketsCompared: 3, metricsTracked: 45 }
      },
      thumbnail: '/analytics-dashboard.png',
      agentId: marketResearchAgent.id,
      views: 1056,
      createdBy: adminUser.id
    }
  })

  // ============================================================================
  // AD SALES SOLUTION AREA REPORTS (3 reports)
  // ============================================================================
  await prisma.report.create({
    data: {
      id: 'adsales-1',
      orgId: acmeCorp.id,
      title: 'Premium Audience Package: Tech Enthusiasts',
      description: 'Curated audience package for advertisers targeting tech enthusiasts, including reach, engagement metrics, and activation recommendations.',
      type: ReportType.PRESENTATION,
      status: ReportStatus.PUBLISHED,
      content: {
        agent: 'Audience Packager Agent',
        solutionArea: 'Ad Sales',
        slides: [
          { type: 'title', title: 'Tech Enthusiasts Audience Package', subtitle: 'Premium Targeting Opportunity' },
          { type: 'audience_overview', title: 'Audience Profile', stats: { totalReach: '45M', avgAge: 32, maleSkew: '62%', incomeIndex: 142 }},
          { type: 'composition', title: 'Segment Breakdown', segments: [
            { name: 'Early Adopters', share: '28%', value: 'Highest engagement, premium CPM' },
            { name: 'Tech Professionals', share: '35%', value: 'B2B crossover potential' },
            { name: 'Gaming Enthusiasts', share: '22%', value: 'High frequency, younger demo' },
            { name: 'Smart Home Owners', share: '15%', value: 'High HHI, purchase intent' }
          ]},
          { type: 'behaviors', title: 'Key Behaviors', items: ['4.2 devices owned on average', '3x more likely to pre-order products', '85% research online before purchase', '68% active in tech communities'] },
          { type: 'activation', title: 'Recommended Tactics', channels: [
            { channel: 'Programmatic Display', reach: '38M', cpm: '$12.50', performance: 'High viewability' },
            { channel: 'Connected TV', reach: '22M', cpm: '$28.00', performance: 'Premium completion rates' },
            { channel: 'Native Content', reach: '15M', cpm: '$18.00', performance: 'Highest engagement' }
          ]},
          { type: 'pricing', title: 'Package Options', tiers: ['Standard ($50K min)', 'Premium ($150K min)', 'Exclusive ($500K min)'] }
        ],
        metadata: { generatedAt: now.toISOString(), audienceSize: 45000000, dataFreshness: 'Monthly' }
      },
      thumbnail: '/presentation-slides.png',
      agentId: audienceAnalysisAgent.id,
      views: 534,
      createdBy: johnDoe.id
    }
  })

  await prisma.report.create({
    data: {
      id: 'adsales-2',
      orgId: techStartup.id,
      title: 'Q1 2025 Media Planning Recommendations',
      description: 'Strategic media planning recommendations for Q1 2025 based on audience behavior, market trends, and competitive activity.',
      type: ReportType.PDF,
      status: ReportStatus.DRAFT,
      content: {
        agent: 'Media Planner Agent',
        solutionArea: 'Ad Sales',
        sections: [
          { title: 'Executive Summary', summary: 'Q1 2025 presents unique opportunities with post-holiday engagement recovery and major cultural moments.' },
          { title: 'Market Context', factors: ['Economic uncertainty driving value-seeking', 'Privacy changes impacting targeting', 'CTV adoption accelerating', 'Retail media networks maturing'] },
          { title: 'Budget Allocation', recommendation: {
            digital: { share: '65%', channels: ['Programmatic 40%', 'Social 35%', 'Search 25%'] },
            traditional: { share: '25%', channels: ['CTV/Streaming 60%', 'Audio 25%', 'OOH 15%'] },
            emerging: { share: '10%', channels: ['Retail Media', 'Gaming', 'Influencer'] }
          }},
          { title: 'Timing Strategy', calendar: [
            { period: 'Early January', focus: 'Resolution/wellness messaging', intensity: 'High' },
            { period: 'Late January', focus: 'Value propositions', intensity: 'Medium' },
            { period: 'February', focus: 'Valentine\'s + brand building', intensity: 'High' },
            { period: 'March', focus: 'Spring transition, consideration', intensity: 'Medium' }
          ]},
          { title: 'Measurement Framework', kpis: ['Brand lift', 'Attention metrics', 'Conversion attribution', 'Incremental reach'] },
          { title: 'Risk Factors', risks: ['Cookie deprecation timeline', 'Economic downturn impact', 'Political ad competition'] }
        ],
        pageCount: 35,
        metadata: { generatedAt: now.toISOString(), planningPeriod: 'Q1 2025', markets: ['US'] }
      },
      thumbnail: '/pdf-report-document.jpg',
      views: 0,
      createdBy: bobWilson.id
    }
  })

  await prisma.report.create({
    data: {
      id: 'adsales-3',
      orgId: acmeCorp.id,
      title: 'Automotive Advertiser Pitch Deck',
      description: 'Custom pitch deck for automotive category advertisers, featuring audience insights, success stories, and partnership opportunities.',
      type: ReportType.PRESENTATION,
      status: ReportStatus.PUBLISHED,
      content: {
        agent: 'Pitch Generator Agent',
        solutionArea: 'Ad Sales',
        slides: [
          { type: 'title', title: 'Reaching Auto Intenders', subtitle: 'Your Audience Awaits' },
          { type: 'opportunity', title: 'Market Opportunity', stats: { autoIntenders: '28M', avgResearchTime: '89 days', touchpointsBeforePurchase: 24 }},
          { type: 'audience', title: 'Our Auto Audience', profiles: [
            { segment: 'Luxury Seekers', size: '4.2M', income: '$150K+', motivation: 'Status, technology' },
            { segment: 'Family First', size: '8.5M', income: '$75-150K', motivation: 'Safety, space, value' },
            { segment: 'Eco-Drivers', size: '6.8M', income: '$80K+', motivation: 'Sustainability, innovation' },
            { segment: 'Performance Fans', size: '3.1M', income: '$100K+', motivation: 'Power, design, brand' }
          ]},
          { type: 'capabilities', title: 'Targeting Capabilities', features: ['In-market signals', 'Dealership proximity', 'Competitive conquesting', 'Lifecycle targeting'] },
          { type: 'case_study', title: 'Success Story', client: 'Major OEM', results: { brandLift: '+18%', dealerTraffic: '+32%', costPerVisit: '-24%' }},
          { type: 'packages', title: 'Partnership Options', tiers: ['Awareness Package', 'Consideration Package', 'Full Funnel Package'] },
          { type: 'cta', title: 'Next Steps', actions: ['Custom audience analysis', 'Competitive share of voice', 'Campaign simulation'] }
        ],
        metadata: { generatedAt: now.toISOString(), category: 'Automotive', proposalValue: '$2.5M' }
      },
      thumbnail: '/presentation-slides.png',
      agentId: marketResearchAgent.id,
      views: 267,
      createdBy: janeSmith.id
    }
  })

  // ============================================================================
  // MARKETING SOLUTION AREA REPORTS (3 reports)
  // ============================================================================
  await prisma.report.create({
    data: {
      id: 'marketing-1',
      orgId: acmeCorp.id,
      title: 'Holiday Campaign Performance Forecast',
      description: 'Predictive analysis of holiday campaign performance based on historical data, market trends, and competitive benchmarks.',
      type: ReportType.DASHBOARD,
      status: ReportStatus.PUBLISHED,
      content: {
        agent: 'Performance Predictor Agent',
        solutionArea: 'Marketing',
        widgets: [
          { type: 'forecast_summary', title: 'Campaign Forecast', predictions: { expectedROAS: 4.2, confidenceInterval: '3.8-4.6', budgetEfficiency: 'High' }},
          { type: 'chart', title: 'Daily Performance Projection', chartType: 'area', metrics: ['Impressions', 'Clicks', 'Conversions'], period: '45 days' },
          { type: 'channel_forecast', title: 'Channel Performance', channels: [
            { name: 'Paid Social', projectedROAS: 3.8, trend: 'stable', confidence: '85%' },
            { name: 'Paid Search', projectedROAS: 5.2, trend: 'up', confidence: '90%' },
            { name: 'Display', projectedROAS: 2.4, trend: 'down', confidence: '75%' },
            { name: 'Email', projectedROAS: 8.5, trend: 'up', confidence: '92%' }
          ]},
          { type: 'scenarios', title: 'What-If Scenarios', options: [
            { scenario: 'Increase budget 20%', impact: '+15% revenue, ROAS drops to 3.9' },
            { scenario: 'Shift to email', impact: '+8% revenue, ROAS improves to 4.5' },
            { scenario: 'Cut display', impact: 'Flat revenue, ROAS improves to 4.8' }
          ]},
          { type: 'risks', title: 'Risk Factors', items: ['Competitor promotion activity', 'Inventory constraints', 'Economic headwinds'] },
          { type: 'recommendations', title: 'Optimization Actions', items: ['Front-load budget in first 2 weeks', 'Reserve 15% for real-time optimization', 'A/B test creative variations'] }
        ],
        lastUpdated: now.toISOString(),
        metadata: { campaignPeriod: 'Nov 15 - Dec 31', totalBudget: '$2.4M', historicalDataYears: 3 }
      },
      thumbnail: '/analytics-dashboard.png',
      agentId: marketResearchAgent.id,
      views: 1423,
      createdBy: adminUser.id
    }
  })

  await prisma.report.create({
    data: {
      id: 'marketing-2',
      orgId: acmeCorp.id,
      title: 'Social Media Trend Analysis: TikTok vs Instagram',
      description: 'Visual comparison of platform trends, content performance, and audience behavior on TikTok and Instagram.',
      type: ReportType.INFOGRAPHIC,
      status: ReportStatus.PUBLISHED,
      content: {
        agent: 'Trend Forecaster Agent',
        solutionArea: 'Marketing',
        sections: [
          { type: 'header', title: 'TikTok vs Instagram', subtitle: '2024 Platform Showdown' },
          { type: 'stats_comparison', metrics: [
            { metric: 'Monthly Active Users', tiktok: '1.5B', instagram: '2.0B' },
            { metric: 'Avg. Time Spent/Day', tiktok: '95 min', instagram: '53 min' },
            { metric: 'Engagement Rate', tiktok: '5.96%', instagram: '0.83%' },
            { metric: 'Content Reach', tiktok: '118%', instagram: '13.5%' }
          ]},
          { type: 'audience_split', data: {
            tiktok: { genZ: '60%', millennial: '26%', genX: '14%' },
            instagram: { genZ: '31%', millennial: '35%', genX: '34%' }
          }},
          { type: 'trending_formats', platforms: [
            { platform: 'TikTok', trends: ['Long-form (3+ min)', 'Storytimes', 'Educational content', 'Duets/Stitches'] },
            { platform: 'Instagram', trends: ['Reels (15-30 sec)', 'Carousel posts', 'Stories with polls', 'Broadcast channels'] }
          ]},
          { type: 'brand_implications', insights: [
            'TikTok: Best for awareness and virality',
            'Instagram: Best for consideration and conversion',
            'Both: Authenticity beats production value'
          ]},
          { type: 'predictions', title: '2025 Outlook', items: ['TikTok Shop growth', 'Instagram pivoting to creators', 'Both pushing AI content tools'] }
        ],
        dimensions: { width: 1200, height: 2800 },
        colorScheme: 'gradient',
        metadata: { generatedAt: now.toISOString(), dataSource: 'GWI Zeitgeist + Platform APIs' }
      },
      thumbnail: '/analytics-dashboard.png',
      views: 2156,
      createdBy: johnDoe.id
    }
  })

  await prisma.report.create({
    data: {
      id: 'marketing-3',
      orgId: techStartup.id,
      title: 'Content Strategy Framework: Gen Z Engagement',
      description: 'Strategic framework for creating content that resonates with Gen Z audiences across platforms.',
      type: ReportType.PDF,
      status: ReportStatus.DRAFT,
      content: {
        agent: 'Content Creator Agent',
        solutionArea: 'Marketing',
        sections: [
          { title: 'Executive Summary', summary: 'Gen Z demands authenticity, entertainment, and value. This framework provides a systematic approach to content that converts.' },
          { title: 'Gen Z Content Preferences', insights: [
            { preference: 'Authentic over polished', evidence: '72% prefer user-generated style content' },
            { preference: 'Entertainment first', evidence: '85% want to be entertained, even by brands' },
            { preference: 'Values alignment', evidence: '68% research brand values before purchase' },
            { preference: 'Interactive experiences', evidence: '3x engagement on polls, quizzes, challenges' }
          ]},
          { title: 'Content Pillars Framework', pillars: [
            { pillar: 'Educational', share: '25%', purpose: 'Build authority, provide value', formats: ['How-tos', 'Explainers', 'Tips'] },
            { pillar: 'Entertainment', share: '35%', purpose: 'Drive reach and engagement', formats: ['Trends', 'Humor', 'Challenges'] },
            { pillar: 'Community', share: '25%', purpose: 'Build connection and loyalty', formats: ['UGC', 'Collabs', 'Behind-scenes'] },
            { pillar: 'Conversion', share: '15%', purpose: 'Drive business outcomes', formats: ['Social proof', 'Offers', 'Product demos'] }
          ]},
          { title: 'Platform Strategy', platforms: [
            { platform: 'TikTok', focus: 'Entertainment + Education', frequency: '1-2x daily', bestTimes: ['7-9am', '7-11pm'] },
            { platform: 'Instagram', focus: 'Community + Conversion', frequency: '1x daily + stories', bestTimes: ['11am-1pm', '7-9pm'] },
            { platform: 'YouTube', focus: 'Education (long-form)', frequency: '2x weekly', bestTimes: ['Thursday-Saturday'] }
          ]},
          { title: 'Measurement Framework', kpis: ['Engagement rate by pillar', 'Share/save ratio', 'Comment sentiment', 'Profile visits', 'Conversion attribution'] },
          { title: 'Implementation Roadmap', phases: ['Audit current content', 'Develop pillar themes', 'Create content calendar', 'Test and optimize'] }
        ],
        pageCount: 32,
        metadata: { generatedAt: now.toISOString(), targetAudience: 'Gen Z (16-24)', contentTypes: 12 }
      },
      thumbnail: '/pdf-report-document.jpg',
      views: 0,
      createdBy: bobWilson.id
    }
  })

  // ============================================================================
  // PRODUCT DEVELOPMENT SOLUTION AREA REPORTS (2 reports)
  // ============================================================================
  await prisma.report.create({
    data: {
      id: 'product-1',
      orgId: techStartup.id,
      title: 'New Product Opportunity Landscape 2025',
      description: 'Analysis of emerging product opportunities based on unmet consumer needs, market gaps, and technology trends.',
      type: ReportType.PRESENTATION,
      status: ReportStatus.PUBLISHED,
      content: {
        agent: 'Opportunity Scout Agent',
        solutionArea: 'Product Development',
        slides: [
          { type: 'title', title: 'Product Opportunity Landscape', subtitle: '2025 Innovation Roadmap' },
          { type: 'methodology', title: 'How We Found Opportunities', steps: ['Analyzed 500K consumer conversations', 'Surveyed 25K consumers on unmet needs', 'Mapped competitive white spaces', 'Assessed technology readiness'] },
          { type: 'opportunity', rank: 1, title: 'AI-Powered Personal Finance', score: 92, tam: '$18B', competition: 'Fragmented', unmetNeed: '68% want automated financial optimization', barriers: ['Trust', 'Regulation'], timeToMarket: '12-18 months' },
          { type: 'opportunity', rank: 2, title: 'Sustainable Subscription Boxes', score: 87, tam: '$8B', competition: 'Growing', unmetNeed: '54% want curated eco-friendly products', barriers: ['Unit economics', 'Supply chain'], timeToMarket: '6-12 months' },
          { type: 'opportunity', rank: 3, title: 'Mental Wellness Gaming', score: 84, tam: '$12B', competition: 'Emerging', unmetNeed: '71% of Gen Z want mental health support in games', barriers: ['Clinical validation', 'Stigma'], timeToMarket: '18-24 months' },
          { type: 'opportunity', rank: 4, title: 'Hyper-Local Community Platforms', score: 81, tam: '$5B', competition: 'Low', unmetNeed: '62% feel disconnected from local community', barriers: ['Network effects', 'Monetization'], timeToMarket: '12-18 months' },
          { type: 'matrix', title: 'Opportunity Matrix', axes: ['Market Attractiveness', 'Strategic Fit'] },
          { type: 'recommendations', title: 'Recommended Actions', items: ['Deep dive on top 2 opportunities', 'Consumer co-creation sessions', 'MVP scoping and feasibility'] }
        ],
        metadata: { generatedAt: now.toISOString(), opportunitiesEvaluated: 45, dataPoints: 125000 }
      },
      thumbnail: '/presentation-slides.png',
      agentId: startupResearchAgent.id,
      views: 876,
      createdBy: bobWilson.id
    }
  })

  await prisma.report.create({
    data: {
      id: 'product-2',
      orgId: techStartup.id,
      title: 'Feature Prioritization Matrix: Mobile App',
      description: 'Data-driven feature prioritization for mobile app roadmap based on user demand, effort, and strategic value.',
      type: ReportType.DASHBOARD,
      status: ReportStatus.PUBLISHED,
      content: {
        agent: 'Feature Prioritizer Agent',
        solutionArea: 'Product Development',
        widgets: [
          { type: 'matrix', title: 'Prioritization Matrix', axes: { x: 'Implementation Effort', y: 'User Value' }, quadrants: ['Quick Wins', 'Strategic Bets', 'Fill-ins', 'Deprioritize'] },
          { type: 'feature_list', title: 'Ranked Features', features: [
            { name: 'Offline Mode', score: 94, userDemand: 'Very High', effort: 'Medium', priority: 'P0' },
            { name: 'Social Sharing', score: 88, userDemand: 'High', effort: 'Low', priority: 'P0' },
            { name: 'Dark Mode', score: 85, userDemand: 'High', effort: 'Low', priority: 'P1' },
            { name: 'Biometric Login', score: 82, userDemand: 'High', effort: 'Medium', priority: 'P1' },
            { name: 'Custom Notifications', score: 78, userDemand: 'Medium', effort: 'Medium', priority: 'P2' },
            { name: 'AR Features', score: 65, userDemand: 'Medium', effort: 'High', priority: 'P3' }
          ]},
          { type: 'chart', title: 'User Request Volume', chartType: 'bar', period: '6 months' },
          { type: 'comparison', title: 'Competitive Gap Analysis', features: ['Offline', 'Social', 'Personalization'], vsCompetitors: 3 },
          { type: 'impact', title: 'Projected Impact', metrics: { retentionLift: '+12%', npsImprovement: '+8 pts', conversionIncrease: '+15%' }},
          { type: 'roadmap', title: 'Suggested Roadmap', quarters: ['Q1: Offline + Social', 'Q2: Dark Mode + Biometric', 'Q3: Notifications', 'Q4: AR Exploration'] }
        ],
        lastUpdated: now.toISOString(),
        metadata: { featuresEvaluated: 28, userFeedbackPoints: 15000, competitorsAnalyzed: 5 }
      },
      thumbnail: '/analytics-dashboard.png',
      agentId: startupResearchAgent.id,
      views: 445,
      createdBy: bobWilson.id
    }
  })

  // ============================================================================
  // MARKET RESEARCH SOLUTION AREA REPORTS (2 reports)
  // ============================================================================
  await prisma.report.create({
    data: {
      id: 'research-1',
      orgId: enterpriseCo.id,
      title: 'Financial Services Market Landscape Report',
      description: 'Comprehensive market analysis of the financial services sector including market sizing, segmentation, and growth opportunities.',
      type: ReportType.PDF,
      status: ReportStatus.PUBLISHED,
      content: {
        agent: 'Market Mapper Agent',
        solutionArea: 'Market Research',
        sections: [
          { title: 'Executive Summary', highlights: ['$12.5T global market', '8.2% CAGR through 2028', 'Digital transformation driving growth', 'Regulatory complexity increasing'] },
          { title: 'Market Sizing', data: {
            global: { size: '$12.5T', growth: '8.2%', keyDrivers: ['Digital adoption', 'Emerging markets', 'Wealth transfer'] },
            byRegion: [
              { region: 'North America', size: '$4.8T', share: '38%', growth: '6.5%' },
              { region: 'Europe', size: '$3.2T', share: '26%', growth: '5.8%' },
              { region: 'Asia Pacific', size: '$3.5T', share: '28%', growth: '12.5%' },
              { region: 'Rest of World', size: '$1.0T', share: '8%', growth: '9.2%' }
            ]
          }},
          { title: 'Segmentation', segments: [
            { segment: 'Retail Banking', size: '$4.2T', trend: 'Consolidating', opportunity: 'Digital-only banks' },
            { segment: 'Wealth Management', size: '$3.1T', trend: 'Growing', opportunity: 'Robo-advisory, democratization' },
            { segment: 'Insurance', size: '$2.8T', trend: 'Transforming', opportunity: 'InsurTech, usage-based' },
            { segment: 'Payments', size: '$2.4T', trend: 'Disrupting', opportunity: 'Embedded finance, BNPL' }
          ]},
          { title: 'Competitive Landscape', tiers: ['Global Leaders', 'Regional Champions', 'Specialists', 'Disruptors'] },
          { title: 'Consumer Trends', insights: ['Trust in traditional institutions declining', 'Demand for personalization rising', 'ESG investing mainstream', 'Mobile-first expectation'] },
          { title: 'Strategic Implications', recommendations: ['Accelerate digital transformation', 'Partner with fintechs', 'Invest in data capabilities', 'Focus on customer experience'] }
        ],
        appendices: ['Methodology', 'Data sources', 'Company profiles'],
        pageCount: 68,
        metadata: { generatedAt: now.toISOString(), industry: 'Financial Services', dataPoints: 250000 }
      },
      thumbnail: '/pdf-report-document.jpg',
      agentId: enterpriseAnalysisAgent.id,
      views: 1678,
      createdBy: sarahEnterprise.id
    }
  })

  await prisma.report.create({
    data: {
      id: 'research-2',
      orgId: enterpriseCo.id,
      title: 'Consumer Survey Results: Brand Perception',
      description: 'Raw survey data export with cross-tabulations and statistical analysis of brand perception study.',
      type: ReportType.EXPORT,
      status: ReportStatus.ARCHIVED,
      content: {
        agent: 'Survey Analyzer Agent',
        solutionArea: 'Market Research',
        datasets: [
          { name: 'raw_responses', format: 'csv', rows: 8500, columns: 45, description: 'Individual survey responses' },
          { name: 'cross_tabs', format: 'xlsx', sheets: 12, description: 'Cross-tabulations by demographics' },
          { name: 'significance_tests', format: 'csv', rows: 250, columns: 8, description: 'Statistical significance results' },
          { name: 'open_ends_coded', format: 'csv', rows: 3200, columns: 5, description: 'Coded open-ended responses' },
          { name: 'weighting_scheme', format: 'xlsx', sheets: 2, description: 'Sample weighting methodology' }
        ],
        visualizations: [
          { name: 'brand_funnel', format: 'png', description: 'Awareness-consideration-preference funnel' },
          { name: 'perception_map', format: 'svg', description: 'Perceptual mapping of brands' },
          { name: 'segment_profiles', format: 'pdf', pages: 8, description: 'Detailed segment profiles' }
        ],
        methodology: {
          sampleSize: 8500,
          methodology: 'Online panel',
          fieldDates: 'Sep 1-15, 2024',
          markets: ['US', 'UK', 'DE'],
          confidenceLevel: '95%',
          marginOfError: '±1.1%'
        },
        metadata: { generatedAt: now.toISOString(), studyType: 'Brand Tracking', wave: 'Q3 2024' }
      },
      thumbnail: '/analytics-dashboard.png',
      agentId: enterpriseAnalysisAgent.id,
      views: 923,
      createdBy: sarahEnterprise.id
    }
  })

  // ============================================================================
  // INNOVATION SOLUTION AREA REPORTS (2 reports)
  // ============================================================================
  await prisma.report.create({
    data: {
      id: 'innovation-1',
      orgId: acmeCorp.id,
      title: 'Emerging Trends Synthesis: AI & Consumer Tech',
      description: 'Synthesis of emerging technology trends and their implications for consumer behavior and business strategy.',
      type: ReportType.PRESENTATION,
      status: ReportStatus.PUBLISHED,
      content: {
        agent: 'Trend Synthesizer Agent',
        solutionArea: 'Innovation',
        slides: [
          { type: 'title', title: 'AI & Consumer Tech Trends', subtitle: 'What\'s Next for 2025' },
          { type: 'trend', rank: 1, name: 'Generative AI Goes Mainstream', maturity: 'Emerging', timeframe: '12-18 months', consumerAdoption: '42%', implications: ['Content creation democratized', 'Search behavior changing', 'Trust/authenticity concerns'] },
          { type: 'trend', rank: 2, name: 'Ambient Computing', maturity: 'Early', timeframe: '24-36 months', consumerAdoption: '18%', implications: ['Screenless interactions', 'Privacy redefined', 'Always-on engagement'] },
          { type: 'trend', rank: 3, name: 'Spatial Computing (AR/VR)', maturity: 'Emerging', timeframe: '18-24 months', consumerAdoption: '24%', implications: ['Immersive commerce', 'Virtual experiences', 'New content formats'] },
          { type: 'trend', rank: 4, name: 'Decentralized Identity', maturity: 'Early', timeframe: '36-48 months', consumerAdoption: '8%', implications: ['User data ownership', 'Portable digital identity', 'New trust models'] },
          { type: 'synthesis', title: 'Converging Trends', insight: 'AI + Ambient + Spatial = Seamless, personalized, immersive consumer experiences' },
          { type: 'implications', title: 'Business Implications', areas: [
            { area: 'Marketing', impact: 'AI-generated personalization at scale, new immersive formats' },
            { area: 'Product', impact: 'Voice/gesture interfaces, spatial features, AI assistants' },
            { area: 'Operations', impact: 'AI automation, predictive everything, digital twins' }
          ]},
          { type: 'actions', title: 'Recommended Actions', items: ['Establish AI governance framework', 'Experiment with spatial content', 'Develop voice strategy', 'Monitor decentralization signals'] }
        ],
        metadata: { generatedAt: now.toISOString(), trendsAnalyzed: 28, sourcesReviewed: 150 }
      },
      thumbnail: '/presentation-slides.png',
      agentId: marketResearchAgent.id,
      views: 1534,
      createdBy: adminUser.id
    }
  })

  await prisma.report.create({
    data: {
      id: 'innovation-2',
      orgId: techStartup.id,
      title: 'Innovation Validation Report: Smart Home Products',
      description: 'Consumer validation study for new smart home product concepts including desirability, feasibility, and viability assessment.',
      type: ReportType.PDF,
      status: ReportStatus.DRAFT,
      content: {
        agent: 'Innovation Validator Agent',
        solutionArea: 'Innovation',
        sections: [
          { title: 'Study Overview', purpose: 'Validate 5 smart home concepts with target consumers', methodology: 'Concept testing (n=2,500) + Qualitative deep dives (n=45)' },
          { title: 'Concept A: AI Home Manager', scores: { desirability: 78, feasibility: 65, viability: 72 }, totalScore: 72, verdict: 'Proceed with refinement', feedback: ['Strong interest in automation', 'Privacy concerns significant', 'Price sensitivity high'] },
          { title: 'Concept B: Predictive Energy System', scores: { desirability: 82, feasibility: 58, viability: 68 }, totalScore: 69, verdict: 'Technical validation needed', feedback: ['Sustainability appeal strong', 'ROI must be clear', 'Installation concerns'] },
          { title: 'Concept C: Family Wellness Hub', scores: { desirability: 85, feasibility: 72, viability: 75 }, totalScore: 77, verdict: 'Strong candidate - accelerate', feedback: ['High emotional resonance', 'Trust in health data critical', 'Integration with existing devices wanted'] },
          { title: 'Concept D: Smart Security Companion', scores: { desirability: 71, feasibility: 80, viability: 70 }, totalScore: 74, verdict: 'Proceed - differentiation needed', feedback: ['Crowded market', 'AI features differentiate', 'Subscription resistance'] },
          { title: 'Concept E: Elderly Care Monitor', scores: { desirability: 88, feasibility: 68, viability: 62 }, totalScore: 73, verdict: 'Pivot business model', feedback: ['Strongest emotional need', 'B2B2C opportunity', 'Regulatory complexity'] },
          { title: 'Recommendations', actions: [
            'Fast-track Concept C (Family Wellness Hub)',
            'Conduct technical deep-dive on Concept B',
            'Explore B2B model for Concept E',
            'Park Concepts A and D for future consideration'
          ]},
          { title: 'Next Steps', timeline: ['Week 1-2: Concept C business case', 'Week 3-4: Prototype development', 'Week 5-8: Beta testing'] }
        ],
        pageCount: 48,
        metadata: { generatedAt: now.toISOString(), conceptsTested: 5, respondents: 2545 }
      },
      thumbnail: '/pdf-report-document.jpg',
      agentId: startupResearchAgent.id,
      views: 0,
      createdBy: bobWilson.id
    }
  })

  // ==================== ENTITLEMENT SYSTEM ====================
  console.log('🎫 Creating plans and features...')

  // Create Features
  const featureAdvancedAnalytics = await prisma.feature.create({
    data: {
      key: 'advanced_analytics',
      name: 'Advanced Analytics',
      description: 'Access to advanced analytics dashboards and reports',
      category: 'ANALYTICS',
      valueType: 'BOOLEAN',
      defaultValue: false,
      sortOrder: 1,
    }
  })

  const featureCustomBranding = await prisma.feature.create({
    data: {
      key: 'custom_branding',
      name: 'Custom Branding',
      description: 'White-label platform with custom logos and colors',
      category: 'CUSTOMIZATION',
      valueType: 'BOOLEAN',
      defaultValue: false,
      sortOrder: 2,
    }
  })

  const featureSso = await prisma.feature.create({
    data: {
      key: 'sso',
      name: 'Single Sign-On',
      description: 'SAML/OIDC SSO integration',
      category: 'SECURITY',
      valueType: 'BOOLEAN',
      defaultValue: false,
      sortOrder: 3,
    }
  })

  const featureAuditLog = await prisma.feature.create({
    data: {
      key: 'audit_log',
      name: 'Audit Log',
      description: 'Detailed audit logging for compliance',
      category: 'SECURITY',
      valueType: 'BOOLEAN',
      defaultValue: false,
      sortOrder: 4,
    }
  })

  const featureApiAccess = await prisma.feature.create({
    data: {
      key: 'api_access',
      name: 'API Access',
      description: 'Programmatic API access',
      category: 'API',
      valueType: 'BOOLEAN',
      defaultValue: false,
      sortOrder: 5,
    }
  })

  const featurePrioritySupport = await prisma.feature.create({
    data: {
      key: 'priority_support',
      name: 'Priority Support',
      description: '24/7 priority customer support',
      category: 'SUPPORT',
      valueType: 'BOOLEAN',
      defaultValue: false,
      sortOrder: 6,
    }
  })

  const featureDataExport = await prisma.feature.create({
    data: {
      key: 'data_export',
      name: 'Data Export',
      description: 'Export data to CSV, Excel, and other formats',
      category: 'CORE',
      valueType: 'BOOLEAN',
      defaultValue: true,
      sortOrder: 7,
    }
  })

  const featureCustomAgents = await prisma.feature.create({
    data: {
      key: 'custom_agents',
      name: 'Custom Agents',
      description: 'Create and configure custom AI agents',
      category: 'AGENTS',
      valueType: 'BOOLEAN',
      defaultValue: false,
      sortOrder: 8,
    }
  })

  const featureAdvancedWorkflows = await prisma.feature.create({
    data: {
      key: 'advanced_workflows',
      name: 'Advanced Workflows',
      description: 'Complex multi-step workflow automation',
      category: 'AGENTS',
      valueType: 'BOOLEAN',
      defaultValue: false,
      sortOrder: 9,
    }
  })

  const featureMultiTenant = await prisma.feature.create({
    data: {
      key: 'multi_tenant',
      name: 'Multi-Tenant Hierarchy',
      description: 'Manage multiple organizations in a hierarchy',
      category: 'ADVANCED',
      valueType: 'BOOLEAN',
      defaultValue: false,
      sortOrder: 10,
    }
  })

  // Create Plans
  const starterPlan = await prisma.plan.create({
    data: {
      name: 'starter',
      displayName: 'Starter',
      description: 'Perfect for small teams getting started',
      tier: 'STARTER',
      isActive: true,
      isPublic: true,
      sortOrder: 1,
      monthlyPrice: 0,
      yearlyPrice: 0,
      limits: {
        agentRuns: 100,
        teamSeats: 3,
        dataSources: 5,
        apiCallsPerMin: 100,
        retentionDays: 30,
        tokensPerMonth: 100000,
        dashboards: 3,
        reports: 10,
        workflows: 2,
        brandTrackings: 1,
      },
    }
  })

  const professionalPlan = await prisma.plan.create({
    data: {
      name: 'professional',
      displayName: 'Professional',
      description: 'For growing teams that need more power',
      tier: 'PROFESSIONAL',
      isActive: true,
      isPublic: true,
      sortOrder: 2,
      monthlyPrice: 9900, // $99
      yearlyPrice: 99900, // $999
      limits: {
        agentRuns: 1000,
        teamSeats: 10,
        dataSources: 25,
        apiCallsPerMin: 500,
        retentionDays: 90,
        tokensPerMonth: 1000000,
        dashboards: 20,
        reports: 100,
        workflows: 10,
        brandTrackings: 5,
      },
    }
  })

  const enterprisePlan = await prisma.plan.create({
    data: {
      name: 'enterprise',
      displayName: 'Enterprise',
      description: 'For large organizations with advanced needs',
      tier: 'ENTERPRISE',
      isActive: true,
      isPublic: true,
      sortOrder: 3,
      monthlyPrice: 49900, // $499
      yearlyPrice: 499900, // $4999
      limits: {
        agentRuns: -1, // unlimited
        teamSeats: -1,
        dataSources: -1,
        apiCallsPerMin: 2000,
        retentionDays: 365,
        tokensPerMonth: -1,
        dashboards: -1,
        reports: -1,
        workflows: -1,
        brandTrackings: -1,
      },
    }
  })

  // Assign features to Starter plan
  await prisma.planFeature.createMany({
    data: [
      { planId: starterPlan.id, featureId: featureDataExport.id, value: true },
    ]
  })

  // Assign features to Professional plan
  await prisma.planFeature.createMany({
    data: [
      { planId: professionalPlan.id, featureId: featureDataExport.id, value: true },
      { planId: professionalPlan.id, featureId: featureAdvancedAnalytics.id, value: true },
      { planId: professionalPlan.id, featureId: featureApiAccess.id, value: true },
      { planId: professionalPlan.id, featureId: featureCustomAgents.id, value: true },
      { planId: professionalPlan.id, featureId: featureCustomBranding.id, value: true },
    ]
  })

  // Assign features to Enterprise plan
  await prisma.planFeature.createMany({
    data: [
      { planId: enterprisePlan.id, featureId: featureDataExport.id, value: true },
      { planId: enterprisePlan.id, featureId: featureAdvancedAnalytics.id, value: true },
      { planId: enterprisePlan.id, featureId: featureApiAccess.id, value: true },
      { planId: enterprisePlan.id, featureId: featureCustomAgents.id, value: true },
      { planId: enterprisePlan.id, featureId: featureCustomBranding.id, value: true },
      { planId: enterprisePlan.id, featureId: featureSso.id, value: true },
      { planId: enterprisePlan.id, featureId: featureAuditLog.id, value: true },
      { planId: enterprisePlan.id, featureId: featurePrioritySupport.id, value: true },
      { planId: enterprisePlan.id, featureId: featureAdvancedWorkflows.id, value: true },
      { planId: enterprisePlan.id, featureId: featureMultiTenant.id, value: true },
    ]
  })

  console.log('   Created 3 plans with 10 features')

  // ==================== SUMMARY ====================
  console.log('\n✅ Database seeding completed!')
  // ==================== SUPER ADMINS ====================
  console.log('🔐 Creating super admin accounts...')

  // Helper to hash passwords for super admin (uses SHA256, not bcrypt)
  function hashSuperAdminPassword(password: string): string {
    return crypto.createHash('sha256').update(password).digest('hex')
  }

  // Super Admin accounts with different roles
  await prisma.superAdmin.create({
    data: {
      email: 'superadmin@gwi.com',
      name: 'Super Administrator',
      passwordHash: hashSuperAdminPassword('SuperAdmin123!'),
      role: 'SUPER_ADMIN',
      permissions: ['super:*'],
      isActive: true,
    }
  })

  await prisma.superAdmin.create({
    data: {
      email: 'admin@gwi.com',
      name: 'Platform Admin',
      passwordHash: hashSuperAdminPassword('Admin123!'),
      role: 'ADMIN',
      permissions: [
        'tenants:read', 'tenants:write', 'tenants:suspend',
        'users:read', 'users:write', 'users:ban',
        'analytics:read', 'analytics:export',
        'features:read', 'features:write',
        'rules:read', 'rules:write',
        'support:read', 'support:write', 'support:manage',
        'config:read',
        'audit:read',
        'notifications:read', 'notifications:write',
        'billing:read',
        'admins:read',
      ],
      isActive: true,
    }
  })

  await prisma.superAdmin.create({
    data: {
      email: 'support@gwi.com',
      name: 'Support Agent',
      passwordHash: hashSuperAdminPassword('Support123!'),
      role: 'SUPPORT',
      permissions: [
        'tenants:read',
        'users:read',
        'analytics:read',
        'features:read',
        'support:read', 'support:write',
        'audit:read',
        'notifications:read',
        'billing:read',
      ],
      isActive: true,
    }
  })

  await prisma.superAdmin.create({
    data: {
      email: 'analyst@gwi.com',
      name: 'Data Analyst',
      passwordHash: hashSuperAdminPassword('Analyst123!'),
      role: 'ANALYST',
      permissions: [
        'tenants:read',
        'users:read',
        'analytics:read', 'analytics:export',
        'features:read',
        'audit:read',
      ],
      isActive: true,
    }
  })

  // Demo super admin for easy testing
  await prisma.superAdmin.create({
    data: {
      email: 'demo-admin@gwi.com',
      name: 'Demo Admin',
      passwordHash: hashSuperAdminPassword('demo123'),
      role: 'SUPER_ADMIN',
      permissions: ['super:*'],
      isActive: true,
    }
  })

  // ==================== FEATURE FLAGS ====================
  console.log('🚩 Creating feature flags...')

  await prisma.featureFlag.create({
    data: {
      key: 'ai_insights_v2',
      name: 'AI Insights V2',
      description: 'Next-generation AI-powered insights with deeper analysis capabilities',
      type: 'BOOLEAN',
      defaultValue: false,
      isEnabled: true,
      rolloutPercentage: 75,
      allowedPlans: ['PROFESSIONAL', 'ENTERPRISE'],
    }
  })

  await prisma.featureFlag.create({
    data: {
      key: 'brand_tracking_realtime',
      name: 'Real-time Brand Tracking',
      description: 'Enable real-time brand health monitoring and alerts',
      type: 'BOOLEAN',
      defaultValue: false,
      isEnabled: true,
      rolloutPercentage: 50,
      allowedPlans: ['ENTERPRISE'],
    }
  })

  await prisma.featureFlag.create({
    data: {
      key: 'advanced_crosstabs',
      name: 'Advanced Crosstab Analysis',
      description: 'Multi-dimensional crosstab analysis with statistical significance testing',
      type: 'BOOLEAN',
      defaultValue: false,
      isEnabled: true,
      rolloutPercentage: 100,
      allowedPlans: ['PROFESSIONAL', 'ENTERPRISE'],
    }
  })

  await prisma.featureFlag.create({
    data: {
      key: 'custom_agents',
      name: 'Custom Agent Builder',
      description: 'Allow users to create custom AI agents with specialized prompts',
      type: 'BOOLEAN',
      defaultValue: false,
      isEnabled: false,
      rolloutPercentage: 0,
    }
  })

  await prisma.featureFlag.create({
    data: {
      key: 'api_rate_limit',
      name: 'API Rate Limit',
      description: 'Requests per minute limit for API access',
      type: 'NUMBER',
      defaultValue: 100,
      isEnabled: true,
      rolloutPercentage: 100,
    }
  })

  await prisma.featureFlag.create({
    data: {
      key: 'export_formats',
      name: 'Export Formats',
      description: 'Available export formats for reports and data',
      type: 'JSON',
      defaultValue: ['pdf', 'csv', 'xlsx'],
      isEnabled: true,
      rolloutPercentage: 100,
    }
  })

  await prisma.featureFlag.create({
    data: {
      key: 'dark_mode',
      name: 'Dark Mode Theme',
      description: 'Enable dark mode UI theme for all users',
      type: 'BOOLEAN',
      defaultValue: true,
      isEnabled: true,
      rolloutPercentage: 100,
    }
  })

  await prisma.featureFlag.create({
    data: {
      key: 'multi_language_support',
      name: 'Multi-Language Support',
      description: 'Enable support for multiple languages in reports and UI',
      type: 'JSON',
      defaultValue: ['en', 'es', 'fr', 'de'],
      isEnabled: true,
      rolloutPercentage: 80,
      allowedPlans: ['PROFESSIONAL', 'ENTERPRISE'],
    }
  })

  await prisma.featureFlag.create({
    data: {
      key: 'advanced_permissions',
      name: 'Advanced Permission System',
      description: 'Granular role-based access control with custom permissions',
      type: 'BOOLEAN',
      defaultValue: false,
      isEnabled: true,
      rolloutPercentage: 60,
      allowedPlans: ['ENTERPRISE'],
    }
  })

  await prisma.featureFlag.create({
    data: {
      key: 'webhook_notifications',
      name: 'Webhook Notifications',
      description: 'Send real-time webhook notifications for events',
      type: 'BOOLEAN',
      defaultValue: false,
      isEnabled: true,
      rolloutPercentage: 90,
      allowedPlans: ['PROFESSIONAL', 'ENTERPRISE'],
    }
  })

  await prisma.featureFlag.create({
    data: {
      key: 'data_retention_days',
      name: 'Data Retention Period',
      description: 'Number of days to retain historical data',
      type: 'NUMBER',
      defaultValue: 365,
      isEnabled: true,
      rolloutPercentage: 100,
    }
  })

  await prisma.featureFlag.create({
    data: {
      key: 'ai_model_selection',
      name: 'AI Model Selection',
      description: 'Allow users to select different AI models for analysis',
      type: 'JSON',
      defaultValue: { default: 'gpt-4', available: ['gpt-4', 'gpt-3.5-turbo', 'claude-3'] },
      isEnabled: false,
      rolloutPercentage: 0,
      allowedPlans: ['ENTERPRISE'],
    }
  })

  await prisma.featureFlag.create({
    data: {
      key: 'scheduled_reports',
      name: 'Scheduled Reports',
      description: 'Enable automatic scheduled report generation and delivery',
      type: 'BOOLEAN',
      defaultValue: false,
      isEnabled: true,
      rolloutPercentage: 75,
      allowedPlans: ['PROFESSIONAL', 'ENTERPRISE'],
    }
  })

  await prisma.featureFlag.create({
    data: {
      key: 'bulk_data_import',
      name: 'Bulk Data Import',
      description: 'Allow importing large datasets in bulk via CSV/Excel',
      type: 'BOOLEAN',
      defaultValue: true,
      isEnabled: true,
      rolloutPercentage: 100,
    }
  })

  // ==================== SYSTEM RULES ====================
  console.log('📋 Creating system rules...')

  await prisma.systemRule.create({
    data: {
      name: 'API Rate Limiting',
      description: 'Enforce API rate limits based on plan tier',
      type: 'RATE_LIMIT',
      conditions: {
        metric: 'api_calls_per_minute',
        limits: { STARTER: 50, PROFESSIONAL: 200, ENTERPRISE: 1000 }
      },
      actions: {
        type: 'throttle',
        message: 'Rate limit exceeded. Please wait before making more requests.'
      },
      isActive: true,
      priority: 100,
      triggerCount: 1247,
      lastTriggered: new Date(now.getTime() - 5 * 60 * 1000),
    }
  })

  await prisma.systemRule.create({
    data: {
      name: 'Token Usage Alert',
      description: 'Alert when organization approaches token usage limit',
      type: 'USAGE',
      conditions: {
        metric: 'monthly_token_usage',
        threshold: 0.8,
        comparison: 'greater_than_percentage_of_limit'
      },
      actions: {
        type: 'notification',
        recipients: ['org_admins'],
        template: 'usage_warning'
      },
      isActive: true,
      priority: 80,
      triggerCount: 89,
      lastTriggered: new Date(now.getTime() - 2 * 60 * 60 * 1000),
    }
  })

  await prisma.systemRule.create({
    data: {
      name: 'Auto-Suspend Inactive Trials',
      description: 'Automatically suspend trial accounts after 14 days of inactivity',
      type: 'AUTO_SUSPEND',
      conditions: {
        accountType: 'trial',
        inactivityDays: 14,
        excludeWithPaymentMethod: true
      },
      actions: {
        type: 'suspend',
        suspensionType: 'PARTIAL',
        notifyUser: true,
        template: 'trial_inactive_suspension'
      },
      isActive: true,
      priority: 50,
      triggerCount: 23,
      lastTriggered: new Date(now.getTime() - 24 * 60 * 60 * 1000),
    }
  })

  await prisma.systemRule.create({
    data: {
      name: 'Content Policy Enforcement',
      description: 'Block inappropriate content in AI-generated outputs',
      type: 'CONTENT_POLICY',
      conditions: {
        scanTypes: ['ai_output', 'user_input', 'report_content'],
        categories: ['hate_speech', 'violence', 'adult_content', 'pii']
      },
      actions: {
        type: 'block_and_log',
        alertAdmins: true,
        userMessage: 'Content policy violation detected. This content cannot be processed.'
      },
      isActive: true,
      priority: 200,
      triggerCount: 7,
      lastTriggered: new Date(now.getTime() - 72 * 60 * 60 * 1000),
    }
  })

  await prisma.systemRule.create({
    data: {
      name: 'Failed Payment Auto-Action',
      description: 'Handle failed payment attempts and subscription issues',
      type: 'BILLING',
      conditions: {
        event: 'payment_failed',
        retryCount: 3,
        daysSinceFailure: 7
      },
      actions: {
        type: 'downgrade',
        targetPlan: 'STARTER',
        notifyUser: true,
        gracePeriodDays: 3
      },
      isActive: true,
      priority: 90,
      triggerCount: 12,
      lastTriggered: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
    }
  })

  await prisma.systemRule.create({
    data: {
      name: 'GDPR Data Deletion',
      description: 'Automatically process GDPR data deletion requests',
      type: 'COMPLIANCE',
      conditions: {
        requestType: 'gdpr_deletion',
        verificationRequired: true,
        cooldownPeriod: 30
      },
      actions: {
        type: 'schedule_deletion',
        notifyUser: true,
        notifyDPO: true,
        retentionExemptions: ['legal_hold', 'audit_logs']
      },
      isActive: true,
      priority: 150,
      triggerCount: 34,
      lastTriggered: new Date(now.getTime() - 12 * 60 * 60 * 1000),
    }
  })

  await prisma.systemRule.create({
    data: {
      name: 'Suspicious Login Detection',
      description: 'Detect and block suspicious login attempts',
      type: 'SECURITY',
      conditions: {
        triggers: ['new_device', 'unusual_location', 'multiple_failed_attempts'],
        failedAttemptThreshold: 5,
        locationChangeRadius: 500
      },
      actions: {
        type: 'require_verification',
        methods: ['email', 'sms'],
        lockoutDuration: 30,
        notifyUser: true
      },
      isActive: true,
      priority: 250,
      triggerCount: 156,
      lastTriggered: new Date(now.getTime() - 1 * 60 * 60 * 1000),
    }
  })

  await prisma.systemRule.create({
    data: {
      name: 'Storage Quota Enforcement',
      description: 'Enforce storage quotas based on plan tier',
      type: 'USAGE',
      conditions: {
        metric: 'storage_used_gb',
        limits: { STARTER: 10, PROFESSIONAL: 100, ENTERPRISE: 1000 },
        warningThreshold: 0.8
      },
      actions: {
        type: 'block_uploads',
        notifyUser: true,
        template: 'storage_limit_warning'
      },
      isActive: true,
      priority: 70,
      triggerCount: 45,
      lastTriggered: new Date(now.getTime() - 6 * 60 * 60 * 1000),
    }
  })

  await prisma.systemRule.create({
    data: {
      name: 'Scheduled Maintenance Notification',
      description: 'Send notifications before scheduled maintenance windows',
      type: 'NOTIFICATION',
      conditions: {
        eventType: 'scheduled_maintenance',
        advanceNoticeDays: [7, 1, 0],
        affectedServices: ['all']
      },
      actions: {
        type: 'send_notification',
        channels: ['email', 'in_app', 'webhook'],
        template: 'maintenance_notice'
      },
      isActive: true,
      priority: 40,
      triggerCount: 8,
      lastTriggered: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000),
    }
  })

  await prisma.systemRule.create({
    data: {
      name: 'API Abuse Detection',
      description: 'Detect and prevent API abuse patterns',
      type: 'SECURITY',
      conditions: {
        patterns: ['rapid_enumeration', 'credential_stuffing', 'scraping'],
        detectionWindow: 300,
        sensitivityLevel: 'high'
      },
      actions: {
        type: 'temporary_ban',
        duration: 3600,
        alertSecurityTeam: true,
        logDetails: true
      },
      isActive: true,
      priority: 300,
      triggerCount: 23,
      lastTriggered: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
    }
  })

  await prisma.systemRule.create({
    data: {
      name: 'Trial Expiration Handler',
      description: 'Handle trial account expirations and conversions',
      type: 'BILLING',
      conditions: {
        accountType: 'trial',
        daysBeforeExpiration: [7, 3, 1, 0],
        hasPaymentMethod: false
      },
      actions: {
        type: 'send_reminder',
        template: 'trial_expiring',
        offerDiscount: true,
        discountPercent: 20
      },
      isActive: true,
      priority: 60,
      triggerCount: 89,
      lastTriggered: new Date(now.getTime() - 8 * 60 * 60 * 1000),
    }
  })

  await prisma.systemRule.create({
    data: {
      name: 'Data Export Compliance',
      description: 'Ensure data exports comply with regional regulations',
      type: 'COMPLIANCE',
      conditions: {
        exportTypes: ['bulk_export', 'report_download', 'api_export'],
        regions: ['EU', 'CA', 'BR'],
        dataTypes: ['pii', 'financial', 'health']
      },
      actions: {
        type: 'add_audit_trail',
        requireApproval: true,
        encryptExport: true,
        notifyDPO: true
      },
      isActive: true,
      priority: 180,
      triggerCount: 67,
      lastTriggered: new Date(now.getTime() - 4 * 60 * 60 * 1000),
    }
  })

  // ==================== SUPPORT TICKETS ====================
  console.log('🎫 Creating support tickets...')

  const ticket1 = await prisma.supportTicket.create({
    data: {
      ticketNumber: 'TKT-202501-00001',
      orgId: acmeCorp.id,
      userId: johnDoe.id,
      subject: 'Cannot export large crosstab to PDF',
      description: 'When I try to export a crosstab with more than 50 rows to PDF, the export fails with a timeout error. This is blocking our quarterly report delivery.',
      category: 'TECHNICAL',
      priority: 'HIGH',
      status: 'IN_PROGRESS',
      tags: ['export', 'pdf', 'crosstab', 'performance'],
      firstResponseAt: new Date(now.getTime() - 2 * 60 * 60 * 1000),
    }
  })

  await prisma.ticketResponse.create({
    data: {
      ticketId: ticket1.id,
      responderId: 'support-agent-1',
      responderType: 'admin',
      message: 'Thank you for reporting this issue. I\'ve escalated this to our engineering team. As a workaround, you can try exporting in CSV format and converting to PDF using a third-party tool. We\'ll update you once we have a fix.',
      isInternal: false,
    }
  })

  await prisma.ticketResponse.create({
    data: {
      ticketId: ticket1.id,
      responderId: 'support-agent-1',
      responderType: 'admin',
      message: 'Engineering confirmed this is a memory issue with large exports. Fix scheduled for next release (v2.4.1).',
      isInternal: true,
    }
  })

  const ticket2 = await prisma.supportTicket.create({
    data: {
      ticketNumber: 'TKT-202501-00002',
      orgId: techStartup.id,
      userId: bobWilson.id,
      subject: 'Request for API rate limit increase',
      description: 'Our team has grown significantly and we\'re hitting our API rate limits during peak hours. We\'d like to request a rate limit increase from 200 to 500 requests per minute.',
      category: 'FEATURE_REQUEST',
      priority: 'MEDIUM',
      status: 'WAITING_ON_INTERNAL',
      tags: ['api', 'rate-limit', 'upgrade'],
      firstResponseAt: new Date(now.getTime() - 24 * 60 * 60 * 1000),
    }
  })

  await prisma.ticketResponse.create({
    data: {
      ticketId: ticket2.id,
      responderId: 'support-agent-2',
      responderType: 'admin',
      message: 'I understand your need for higher rate limits. I\'ve forwarded this to our sales team to discuss upgrade options that would better suit your growing needs.',
      isInternal: false,
    }
  })

  await prisma.supportTicket.create({
    data: {
      ticketNumber: 'TKT-202501-00003',
      orgId: acmeCorp.id,
      userId: janeSmith.id,
      subject: 'Billing discrepancy on last invoice',
      description: 'Our last invoice shows charges for 15 team seats but we only have 12 active users. Please review and adjust.',
      category: 'BILLING',
      priority: 'MEDIUM',
      status: 'OPEN',
      tags: ['billing', 'invoice', 'seats'],
    }
  })

  await prisma.supportTicket.create({
    data: {
      ticketNumber: 'TKT-202501-00004',
      orgId: enterpriseCo.id,
      userId: sarahEnterprise.id,
      subject: 'SSO integration not working after domain change',
      description: 'We recently changed our company domain from old-company.com to enterprise-co.com. Now SSO authentication is failing for all users.',
      category: 'TECHNICAL',
      priority: 'URGENT',
      status: 'IN_PROGRESS',
      tags: ['sso', 'authentication', 'domain'],
      firstResponseAt: new Date(now.getTime() - 30 * 60 * 1000),
    }
  })

  await prisma.supportTicket.create({
    data: {
      ticketNumber: 'TKT-202501-00005',
      orgId: techStartup.id,
      subject: 'Feature suggestion: Slack integration',
      description: 'It would be great to have native Slack integration for receiving alerts and sharing insights directly to our team channels.',
      category: 'FEATURE_REQUEST',
      priority: 'LOW',
      status: 'OPEN',
      tags: ['integration', 'slack', 'notifications'],
    }
  })

  await prisma.supportTicket.create({
    data: {
      ticketNumber: 'TKT-202501-00006',
      orgId: acmeCorp.id,
      userId: adminUser.id,
      subject: 'Security audit request',
      description: 'Our compliance team needs the latest SOC 2 report and security documentation for our annual vendor review.',
      category: 'SECURITY',
      priority: 'MEDIUM',
      status: 'RESOLVED',
      tags: ['security', 'compliance', 'soc2'],
      resolvedAt: new Date(now.getTime() - 48 * 60 * 60 * 1000),
      firstResponseAt: new Date(now.getTime() - 72 * 60 * 60 * 1000),
    }
  })

  await prisma.supportTicket.create({
    data: {
      ticketNumber: 'TKT-202501-00007',
      orgId: enterpriseCo.id,
      userId: sarahEnterprise.id,
      subject: 'Need custom report template',
      description: 'We need a custom branded report template that matches our corporate design guidelines. Can you help us set this up?',
      category: 'FEATURE_REQUEST',
      priority: 'LOW',
      status: 'WAITING_ON_CUSTOMER',
      tags: ['branding', 'reports', 'customization'],
      firstResponseAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
    }
  })

  await prisma.supportTicket.create({
    data: {
      ticketNumber: 'TKT-202501-00008',
      orgId: techStartup.id,
      userId: bobWilson.id,
      subject: 'Data import failed with timeout',
      description: 'Trying to import a 50MB CSV file but keep getting timeout errors after about 2 minutes. The file has approximately 500,000 rows of survey data.',
      category: 'BUG_REPORT',
      priority: 'HIGH',
      status: 'IN_PROGRESS',
      tags: ['import', 'csv', 'performance', 'timeout'],
      firstResponseAt: new Date(now.getTime() - 4 * 60 * 60 * 1000),
    }
  })

  await prisma.supportTicket.create({
    data: {
      ticketNumber: 'TKT-202501-00009',
      orgId: acmeCorp.id,
      userId: janeSmith.id,
      subject: 'AI agent producing inconsistent results',
      description: 'The sentiment analysis agent is giving different results for the same text input when run multiple times. Expected deterministic output.',
      category: 'BUG_REPORT',
      priority: 'MEDIUM',
      status: 'OPEN',
      tags: ['ai', 'agent', 'sentiment', 'consistency'],
    }
  })

  await prisma.supportTicket.create({
    data: {
      ticketNumber: 'TKT-202501-00010',
      orgId: enterpriseCo.id,
      subject: 'Request for dedicated account manager',
      description: 'As we scale our usage, we would like to have a dedicated account manager assigned to our organization for better support coordination.',
      category: 'ACCOUNT',
      priority: 'MEDIUM',
      status: 'RESOLVED',
      tags: ['account', 'support', 'enterprise'],
      resolvedAt: new Date(now.getTime() - 24 * 60 * 60 * 1000),
      firstResponseAt: new Date(now.getTime() - 48 * 60 * 60 * 1000),
    }
  })

  await prisma.supportTicket.create({
    data: {
      ticketNumber: 'TKT-202501-00011',
      orgId: suspendedOrg.id,
      subject: 'Appeal account suspension',
      description: 'Our account was suspended due to alleged ToS violation. We believe this was a mistake and would like to appeal this decision.',
      category: 'ACCOUNT',
      priority: 'URGENT',
      status: 'WAITING_ON_INTERNAL',
      tags: ['suspension', 'appeal', 'tos'],
      firstResponseAt: new Date(now.getTime() - 2 * 60 * 60 * 1000),
    }
  })

  await prisma.supportTicket.create({
    data: {
      ticketNumber: 'TKT-202501-00012',
      orgId: billingIssueOrg.id,
      subject: 'Payment method update not working',
      description: 'I am trying to update our credit card information but the form keeps showing an error. We need to resolve this before our subscription lapses.',
      category: 'BILLING',
      priority: 'HIGH',
      status: 'IN_PROGRESS',
      tags: ['payment', 'credit-card', 'billing'],
      firstResponseAt: new Date(now.getTime() - 1 * 60 * 60 * 1000),
    }
  })

  await prisma.supportTicket.create({
    data: {
      ticketNumber: 'TKT-202501-00013',
      orgId: trialOrg.id,
      subject: 'Questions about enterprise features',
      description: 'We are evaluating your platform for our organization. Can you provide more details about SSO integration and audit logging capabilities?',
      category: 'OTHER',
      priority: 'LOW',
      status: 'RESOLVED',
      tags: ['trial', 'evaluation', 'enterprise', 'sso'],
      resolvedAt: new Date(now.getTime() - 12 * 60 * 60 * 1000),
      firstResponseAt: new Date(now.getTime() - 18 * 60 * 60 * 1000),
    }
  })

  await prisma.supportTicket.create({
    data: {
      ticketNumber: 'TKT-202501-00014',
      orgId: acmeCorp.id,
      userId: johnDoe.id,
      subject: 'Dashboard widget not loading',
      description: 'The brand health widget on our main dashboard shows a spinning loader indefinitely. Other widgets work fine. Started happening after the latest update.',
      category: 'BUG_REPORT',
      priority: 'MEDIUM',
      status: 'CLOSED',
      tags: ['dashboard', 'widget', 'ui', 'bug'],
      resolvedAt: new Date(now.getTime() - 6 * 60 * 60 * 1000),
      firstResponseAt: new Date(now.getTime() - 10 * 60 * 60 * 1000),
    }
  })

  // ==================== TENANT HEALTH SCORES ====================
  console.log('💚 Creating tenant health scores...')

  await prisma.tenantHealthScore.create({
    data: {
      orgId: acmeCorp.id,
      overallScore: 87,
      engagementScore: 92,
      usageScore: 82,
      healthIndicators: {
        dailyActiveUsers: 45,
        weeklyAgentRuns: 234,
        featureAdoption: 0.78,
        supportTickets: 2,
        nps: 72
      },
      riskLevel: 'HEALTHY',
      churnProbability: 0.05,
      recommendations: ['Consider upgrading to Enterprise for advanced features', 'Enable brand tracking for competitive insights'],
    }
  })

  await prisma.tenantHealthScore.create({
    data: {
      orgId: techStartup.id,
      overallScore: 64,
      engagementScore: 58,
      usageScore: 70,
      healthIndicators: {
        dailyActiveUsers: 8,
        weeklyAgentRuns: 45,
        featureAdoption: 0.45,
        supportTickets: 3,
        nps: 45
      },
      riskLevel: 'AT_RISK',
      churnProbability: 0.35,
      recommendations: ['Schedule customer success call', 'Offer training session on advanced features', 'Consider temporary rate limit increase'],
    }
  })

  await prisma.tenantHealthScore.create({
    data: {
      orgId: enterpriseCo.id,
      overallScore: 95,
      engagementScore: 98,
      usageScore: 92,
      healthIndicators: {
        dailyActiveUsers: 127,
        weeklyAgentRuns: 1456,
        featureAdoption: 0.94,
        supportTickets: 1,
        nps: 89
      },
      riskLevel: 'HEALTHY',
      churnProbability: 0.02,
      recommendations: ['Potential case study candidate', 'Consider for beta program'],
    }
  })

  // Historical health scores (30 days ago)
  await prisma.tenantHealthScore.create({
    data: {
      orgId: acmeCorp.id,
      overallScore: 82,
      engagementScore: 85,
      usageScore: 79,
      healthIndicators: {
        dailyActiveUsers: 38,
        weeklyAgentRuns: 198,
        featureAdoption: 0.72,
        supportTickets: 4,
        nps: 68
      },
      riskLevel: 'HEALTHY',
      churnProbability: 0.08,
      recommendations: ['Improve feature adoption', 'Address support ticket backlog'],
      calculatedAt: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
    }
  })

  await prisma.tenantHealthScore.create({
    data: {
      orgId: techStartup.id,
      overallScore: 71,
      engagementScore: 68,
      usageScore: 74,
      healthIndicators: {
        dailyActiveUsers: 11,
        weeklyAgentRuns: 62,
        featureAdoption: 0.51,
        supportTickets: 1,
        nps: 52
      },
      riskLevel: 'AT_RISK',
      churnProbability: 0.28,
      recommendations: ['Monitor closely for engagement drop', 'Consider proactive outreach'],
      calculatedAt: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
    }
  })

  await prisma.tenantHealthScore.create({
    data: {
      orgId: enterpriseCo.id,
      overallScore: 93,
      engagementScore: 96,
      usageScore: 90,
      healthIndicators: {
        dailyActiveUsers: 119,
        weeklyAgentRuns: 1320,
        featureAdoption: 0.91,
        supportTickets: 2,
        nps: 86
      },
      riskLevel: 'HEALTHY',
      churnProbability: 0.03,
      recommendations: ['Strong account - consider upsell opportunities'],
      calculatedAt: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
    }
  })

  // Historical health scores (60 days ago)
  await prisma.tenantHealthScore.create({
    data: {
      orgId: acmeCorp.id,
      overallScore: 78,
      engagementScore: 80,
      usageScore: 76,
      healthIndicators: {
        dailyActiveUsers: 32,
        weeklyAgentRuns: 156,
        featureAdoption: 0.65,
        supportTickets: 3,
        nps: 62
      },
      riskLevel: 'HEALTHY',
      churnProbability: 0.12,
      recommendations: ['Onboarding follow-up needed', 'Schedule training session'],
      calculatedAt: new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000),
    }
  })

  await prisma.tenantHealthScore.create({
    data: {
      orgId: techStartup.id,
      overallScore: 55,
      engagementScore: 48,
      usageScore: 62,
      healthIndicators: {
        dailyActiveUsers: 5,
        weeklyAgentRuns: 28,
        featureAdoption: 0.35,
        supportTickets: 5,
        nps: 38
      },
      riskLevel: 'CRITICAL',
      churnProbability: 0.52,
      recommendations: ['Urgent intervention needed', 'Escalate to customer success manager', 'Offer extended trial'],
      calculatedAt: new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000),
    }
  })

  await prisma.tenantHealthScore.create({
    data: {
      orgId: enterpriseCo.id,
      overallScore: 91,
      engagementScore: 94,
      usageScore: 88,
      healthIndicators: {
        dailyActiveUsers: 108,
        weeklyAgentRuns: 1180,
        featureAdoption: 0.88,
        supportTickets: 0,
        nps: 84
      },
      riskLevel: 'HEALTHY',
      churnProbability: 0.04,
      recommendations: ['Account growing steadily', 'Good candidate for reference customer'],
      calculatedAt: new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000),
    }
  })

  // ==================== SYSTEM NOTIFICATIONS ====================
  console.log('📢 Creating system notifications...')

  await prisma.systemNotification.create({
    data: {
      title: 'Scheduled Maintenance',
      message: 'We will be performing scheduled maintenance on Saturday, January 18th from 2:00 AM to 4:00 AM UTC. During this time, the platform may experience brief interruptions.',
      type: 'MAINTENANCE',
      targetType: 'ALL',
      isActive: true,
      scheduledFor: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000),
      expiresAt: new Date(now.getTime() + 6 * 24 * 60 * 60 * 1000),
    }
  })

  await prisma.systemNotification.create({
    data: {
      title: 'New Feature: AI Insights V2',
      message: 'We\'re excited to announce AI Insights V2 with deeper analysis capabilities, trend predictions, and automated recommendations. Available now for Professional and Enterprise plans!',
      type: 'FEATURE',
      targetType: 'SPECIFIC_PLANS',
      targetPlans: ['PROFESSIONAL', 'ENTERPRISE'],
      isActive: true,
    }
  })

  await prisma.systemNotification.create({
    data: {
      title: 'API Deprecation Notice',
      message: 'The v1 API endpoints for audience creation will be deprecated on March 1st, 2025. Please migrate to the v2 API. See documentation for migration guide.',
      type: 'WARNING',
      targetType: 'ALL',
      isActive: true,
      expiresAt: new Date('2025-03-01'),
    }
  })

  await prisma.systemNotification.create({
    data: {
      title: 'Special Offer: Upgrade to Enterprise',
      message: 'For a limited time, get 20% off your first year of Enterprise plan. Contact sales to learn more.',
      type: 'PROMOTION',
      targetType: 'SPECIFIC_PLANS',
      targetPlans: ['STARTER', 'PROFESSIONAL'],
      isActive: true,
      expiresAt: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
    }
  })

  // ==================== PLATFORM AUDIT LOGS ====================
  console.log('📝 Creating platform audit logs...')

  const superAdmin = await prisma.superAdmin.findFirst({ where: { email: 'superadmin@gwi.com' } })
  const platformAdmin = await prisma.superAdmin.findFirst({ where: { email: 'admin@gwi.com' } })

  if (superAdmin && platformAdmin) {
    await prisma.platformAuditLog.createMany({
      data: [
        {
          adminId: superAdmin.id,
          action: 'login',
          resourceType: 'super_admin',
          resourceId: superAdmin.id,
          details: { email: 'superadmin@gwi.com' },
          ipAddress: '192.168.1.100',
          userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
          timestamp: new Date(now.getTime() - 2 * 60 * 60 * 1000),
        },
        {
          adminId: platformAdmin.id,
          action: 'update_feature_flag',
          resourceType: 'feature_flag',
          resourceId: 'ai_insights_v2',
          details: { field: 'rolloutPercentage', oldValue: 50, newValue: 75 },
          ipAddress: '192.168.1.101',
          timestamp: new Date(now.getTime() - 4 * 60 * 60 * 1000),
        },
        {
          adminId: superAdmin.id,
          action: 'view_tenant',
          resourceType: 'organization',
          targetOrgId: acmeCorp.id,
          details: { reason: 'Support escalation review' },
          ipAddress: '192.168.1.100',
          timestamp: new Date(now.getTime() - 6 * 60 * 60 * 1000),
        },
        {
          adminId: platformAdmin.id,
          action: 'respond_ticket',
          resourceType: 'support_ticket',
          resourceId: ticket1.id,
          details: { ticketNumber: 'TKT-202501-00001' },
          ipAddress: '192.168.1.101',
          timestamp: new Date(now.getTime() - 8 * 60 * 60 * 1000),
        },
        {
          adminId: superAdmin.id,
          action: 'create_system_rule',
          resourceType: 'system_rule',
          details: { ruleName: 'API Rate Limiting' },
          ipAddress: '192.168.1.100',
          timestamp: new Date(now.getTime() - 24 * 60 * 60 * 1000),
        },
        {
          adminId: platformAdmin.id,
          action: 'calculate_health_score',
          resourceType: 'tenant_health',
          targetOrgId: techStartup.id,
          details: { score: 64, riskLevel: 'AT_RISK' },
          ipAddress: '192.168.1.101',
          timestamp: new Date(now.getTime() - 48 * 60 * 60 * 1000),
        },
        {
          action: 'login_failed',
          resourceType: 'super_admin',
          details: { email: 'unknown@hacker.com', reason: 'invalid_credentials' },
          ipAddress: '45.33.32.156',
          userAgent: 'curl/7.64.1',
          timestamp: new Date(now.getTime() - 72 * 60 * 60 * 1000),
        },
        {
          adminId: superAdmin.id,
          action: 'create_notification',
          resourceType: 'system_notification',
          details: { title: 'Scheduled Maintenance', type: 'MAINTENANCE' },
          ipAddress: '192.168.1.100',
          timestamp: new Date(now.getTime() - 96 * 60 * 60 * 1000),
        },
      ]
    })
  }

  // ==================== SYSTEM CONFIG ====================
  console.log('⚙️ Creating system configuration...')

  await prisma.systemConfig.createMany({
    data: [
      {
        key: 'platform.maintenance_mode',
        value: false,
        description: 'Enable maintenance mode to block all user access',
        category: 'platform',
        isPublic: true,
      },
      {
        key: 'platform.signup_enabled',
        value: true,
        description: 'Allow new user registrations',
        category: 'platform',
        isPublic: true,
      },
      {
        key: 'ai.default_model',
        value: 'claude-3-sonnet',
        description: 'Default AI model for agent operations',
        category: 'ai',
        isPublic: false,
      },
      {
        key: 'ai.max_tokens_per_request',
        value: 4096,
        description: 'Maximum tokens per AI request',
        category: 'ai',
        isPublic: false,
      },
      {
        key: 'billing.trial_days',
        value: 14,
        description: 'Number of days for free trial',
        category: 'billing',
        isPublic: true,
      },
      {
        key: 'billing.grace_period_days',
        value: 7,
        description: 'Grace period after payment failure',
        category: 'billing',
        isPublic: false,
      },
      {
        key: 'security.max_login_attempts',
        value: 5,
        description: 'Max failed login attempts before lockout',
        category: 'security',
        isPublic: false,
      },
      {
        key: 'security.session_timeout_hours',
        value: 24,
        description: 'Session timeout in hours',
        category: 'security',
        isPublic: false,
      },
    ]
  })

  // ==================== USER BANS ====================
  console.log('🚫 Creating user bans...')

  if (superAdmin && platformAdmin) {
    // Platform-wide permanent ban
    await prisma.userBan.create({
      data: {
        userId: bannedUser.id,
        orgId: null, // Platform-wide ban
        reason: 'Multiple violations of terms of service including sharing credentials and automated scraping.',
        bannedBy: superAdmin.id,
        banType: 'PERMANENT',
        expiresAt: null,
        appealStatus: 'REJECTED',
        appealNotes: 'Appeal denied on 2025-01-05. User showed no willingness to comply with ToS.',
        metadata: {
          previousWarnings: 3,
          incidentIds: ['INC-2024-001', 'INC-2024-012', 'INC-2025-003'],
          ipAddresses: ['45.33.32.156', '192.168.1.200']
        }
      }
    })

    // Temporary ban with pending appeal
    await prisma.userBan.create({
      data: {
        userId: suspiciousUser.id,
        orgId: null,
        reason: 'Suspicious activity detected - unusual API request patterns suggesting automated usage.',
        bannedBy: platformAdmin.id,
        banType: 'TEMPORARY',
        expiresAt: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        appealStatus: 'PENDING',
        appealNotes: 'User claims their API integration had a bug. Under review.',
        metadata: {
          detectedAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          requestsPerMinute: 500,
          normalRate: 50
        }
      }
    })

    // Shadow ban for spam behavior
    await prisma.userBan.create({
      data: {
        userId: inactiveUser.id,
        orgId: billingIssueOrg.id, // Org-specific ban
        reason: 'Account flagged for promotional spam in shared workspaces.',
        bannedBy: platformAdmin.id,
        banType: 'SHADOW',
        expiresAt: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000), // 30 days
        appealStatus: 'NONE',
        metadata: {
          spamCount: 15,
          affectedWorkspaces: ['marketing-insights', 'q4-planning']
        }
      }
    })
  }

  // ==================== ORGANIZATION SUSPENSIONS ====================
  console.log('⛔ Creating organization suspensions...')

  if (superAdmin && platformAdmin) {
    // Full suspension for ToS violation
    await prisma.organizationSuspension.create({
      data: {
        orgId: suspendedOrg.id,
        reason: 'Severe terms of service violation: Automated data harvesting detected across multiple endpoints.',
        suspendedBy: superAdmin.id,
        suspensionType: 'FULL',
        expiresAt: null, // Indefinite
        isActive: true,
        notes: 'Owner contacted via email on 2025-01-10. No response. Legal review pending.'
      }
    })

    // Billing hold suspension
    await prisma.organizationSuspension.create({
      data: {
        orgId: billingIssueOrg.id,
        reason: 'Failed payment after 3 retry attempts. Invoice #INV-2025-0042 overdue by 14 days.',
        suspendedBy: platformAdmin.id,
        suspensionType: 'BILLING_HOLD',
        expiresAt: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000), // Grace period
        isActive: true,
        notes: 'Customer support ticket TKT-202501-00010 opened. Awaiting updated payment method.'
      }
    })

    // Investigation suspension (not active - was resolved)
    await prisma.organizationSuspension.create({
      data: {
        orgId: techStartup.id,
        reason: 'Security incident reported - potential unauthorized access to admin credentials.',
        suspendedBy: superAdmin.id,
        suspensionType: 'INVESTIGATION',
        expiresAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000), // Expired 5 days ago
        isActive: false,
        notes: 'Investigation concluded: False alarm. User forgot their password and triggered security alerts. Suspension lifted on 2025-01-08.'
      }
    })

    // Add more audit logs for bans and suspensions
    await prisma.platformAuditLog.createMany({
      data: [
        {
          adminId: superAdmin.id,
          action: 'ban_user',
          resourceType: 'user',
          targetUserId: bannedUser.id,
          details: { banType: 'PERMANENT', reason: 'Multiple ToS violations' },
          ipAddress: '192.168.1.100',
          timestamp: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
        },
        {
          adminId: platformAdmin.id,
          action: 'ban_user',
          resourceType: 'user',
          targetUserId: suspiciousUser.id,
          details: { banType: 'TEMPORARY', reason: 'Suspicious activity' },
          ipAddress: '192.168.1.101',
          timestamp: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
        },
        {
          adminId: superAdmin.id,
          action: 'suspend_org',
          resourceType: 'organization',
          targetOrgId: suspendedOrg.id,
          details: { suspensionType: 'FULL', reason: 'ToS violation' },
          ipAddress: '192.168.1.100',
          timestamp: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000),
        },
        {
          adminId: platformAdmin.id,
          action: 'suspend_org',
          resourceType: 'organization',
          targetOrgId: billingIssueOrg.id,
          details: { suspensionType: 'BILLING_HOLD', reason: 'Failed payment' },
          ipAddress: '192.168.1.101',
          timestamp: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
        },
        {
          adminId: superAdmin.id,
          action: 'lift_suspension',
          resourceType: 'organization',
          targetOrgId: techStartup.id,
          details: { previousType: 'INVESTIGATION', reason: 'Investigation completed - false alarm' },
          ipAddress: '192.168.1.100',
          timestamp: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
        },
        {
          adminId: platformAdmin.id,
          action: 'impersonate_user',
          resourceType: 'user',
          targetUserId: trialUser.id,
          details: { reason: 'Customer support - helping with onboarding' },
          ipAddress: '192.168.1.101',
          timestamp: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
        },
      ]
    })
  }

  // ==================== ADDITIONAL TENANT HEALTH SCORES ====================
  console.log('💚 Creating additional tenant health scores...')

  await prisma.tenantHealthScore.create({
    data: {
      orgId: suspendedOrg.id,
      overallScore: 12,
      engagementScore: 5,
      usageScore: 19,
      healthIndicators: {
        dailyActiveUsers: 0,
        weeklyAgentRuns: 0,
        featureAdoption: 0.1,
        supportTickets: 5,
        nps: -50
      },
      riskLevel: 'CRITICAL',
      churnProbability: 0.95,
      recommendations: ['Account suspended - resolve ToS violation', 'Legal review required'],
    }
  })

  await prisma.tenantHealthScore.create({
    data: {
      orgId: billingIssueOrg.id,
      overallScore: 35,
      engagementScore: 28,
      usageScore: 42,
      healthIndicators: {
        dailyActiveUsers: 2,
        weeklyAgentRuns: 12,
        featureAdoption: 0.25,
        supportTickets: 2,
        nps: 20
      },
      riskLevel: 'CRITICAL',
      churnProbability: 0.72,
      recommendations: ['Resolve billing issue immediately', 'Offer payment plan option', 'Customer success outreach required'],
    }
  })

  await prisma.tenantHealthScore.create({
    data: {
      orgId: trialOrg.id,
      overallScore: 58,
      engagementScore: 65,
      usageScore: 51,
      healthIndicators: {
        dailyActiveUsers: 3,
        weeklyAgentRuns: 28,
        featureAdoption: 0.52,
        supportTickets: 1,
        nps: 55
      },
      riskLevel: 'AT_RISK',
      churnProbability: 0.45,
      recommendations: ['Trial ending soon - send conversion offer', 'Schedule demo of premium features', 'Assign customer success manager'],
    }
  })

  console.log('\n📊 Summary:')
  console.log('   Organizations: 6')
  console.log('   Users: 12')
  console.log('   Organization Memberships: 16')
  console.log('   Agents: 7')
  console.log('   Agent Runs: 15+')
  console.log('   Data Sources: 7')
  console.log('   Insights: 7')
  console.log('   Audiences: 11')
  console.log('   Crosstabs: 16')
  console.log('   Dashboards: 7')
  console.log('   Charts: 10')
  console.log('   Reports: 20')
  console.log('   Audit Logs: 10')
  console.log('   Usage Records: 150+')
  console.log('   Billing Subscriptions: 3')
  console.log('   API Keys: 3')
  console.log('   Invitations: 4')
  console.log('   SSO Configurations: 1')
  console.log('   Brand Trackings: 8 (Nike, Spotify, Tesla, Patagonia, Oatly, Airbnb, Peloton, Notion)')
  console.log('   Brand Tracking Snapshots: 378+ (52+45+78+36+28+42+65+32 weekly snapshots)')
  console.log('')
  console.log('   === Admin Portal Data ===')
  console.log('   Super Admins: 5')
  console.log('   Feature Flags: 14')
  console.log('   System Rules: 12')
  console.log('   Support Tickets: 14')
  console.log('   Ticket Responses: 4')
  console.log('   Tenant Health Scores: 12')
  console.log('   System Notifications: 4')
  console.log('   Platform Audit Logs: 14')
  console.log('   System Config: 8')
  console.log('   User Bans: 3')
  console.log('   Organization Suspensions: 3')

  console.log('\n🔑 Test Credentials:')
  console.log('')
  console.log('   ═══════════════════════════════════════════════════════════')
  console.log('   PLATFORM LOGIN (Regular Users)')
  console.log('   ═══════════════════════════════════════════════════════════')
  console.log('   Demo User (easiest):')
  console.log('     Email: demo@example.com')
  console.log('     Password: demo123')
  console.log('   ────────────────────────────────────────')
  console.log('   Admin User (Acme Corp Owner):')
  console.log('     Email: admin@acme.com')
  console.log('     Password: Password123!')
  console.log('   ────────────────────────────────────────')
  console.log('   All other platform users use: Password123!')
  console.log('')
  console.log('   ═══════════════════════════════════════════════════════════')
  console.log('   ADMIN PORTAL LOGIN (Super Admins)')
  console.log('   ═══════════════════════════════════════════════════════════')
  console.log('   Demo Admin (easiest):')
  console.log('     Email: demo-admin@gwi.com')
  console.log('     Password: demo123')
  console.log('     Role: SUPER_ADMIN (full access)')
  console.log('   ────────────────────────────────────────')
  console.log('   Super Administrator:')
  console.log('     Email: superadmin@gwi.com')
  console.log('     Password: SuperAdmin123!')
  console.log('     Role: SUPER_ADMIN (full access)')
  console.log('   ────────────────────────────────────────')
  console.log('   Platform Admin:')
  console.log('     Email: admin@gwi.com')
  console.log('     Password: Admin123!')
  console.log('     Role: ADMIN (standard admin ops)')
  console.log('   ────────────────────────────────────────')
  console.log('   Support Agent:')
  console.log('     Email: support@gwi.com')
  console.log('     Password: Support123!')
  console.log('     Role: SUPPORT (customer support)')
  console.log('   ────────────────────────────────────────')
  console.log('   Data Analyst:')
  console.log('     Email: analyst@gwi.com')
  console.log('     Password: Analyst123!')
  console.log('     Role: ANALYST (read-only analytics)')
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
