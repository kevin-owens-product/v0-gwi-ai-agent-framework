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

  await prisma.crosstab.createMany({
    data: [
      {
        orgId: acmeCorp.id,
        name: 'Brand Awareness by Age Group',
        description: 'Cross-tabulation of brand awareness metrics across different age demographics',
        audiences: allAudiences.filter(a => a.orgId === acmeCorp.id).slice(0, 4).map(a => a.id),
        metrics: ['awareness', 'consideration', 'preference', 'purchase_intent'],
        filters: { period: 'last_quarter', markets: ['US', 'UK', 'DE'] },
        results: {
          rows: [
            { segment: '18-24', awareness: 78.5, consideration: 52.3, preference: 38.2, purchase_intent: 28.5 },
            { segment: '25-34', awareness: 82.1, consideration: 58.7, preference: 45.6, purchase_intent: 35.2 },
            { segment: '35-44', awareness: 85.3, consideration: 62.4, preference: 48.9, purchase_intent: 38.7 },
            { segment: '45-54', awareness: 79.8, consideration: 55.2, preference: 42.1, purchase_intent: 32.4 },
            { segment: '55+', awareness: 72.4, consideration: 48.6, preference: 35.8, purchase_intent: 26.1 }
          ],
          metadata: { sampleSize: 15420, confidence: 0.95, lastUpdated: now.toISOString() }
        },
        views: 234,
        createdBy: adminUser.id
      },
      {
        orgId: acmeCorp.id,
        name: 'Platform Usage by Audience',
        description: 'Social media and digital platform usage patterns across key audience segments',
        audiences: allAudiences.filter(a => a.orgId === acmeCorp.id).slice(0, 5).map(a => a.id),
        metrics: ['daily_active_users', 'time_spent', 'engagement_rate', 'content_creation'],
        filters: { platforms: ['Instagram', 'TikTok', 'YouTube', 'Twitter', 'LinkedIn'] },
        results: {
          rows: [
            { platform: 'TikTok', gen_z: 85.2, millennials: 62.4, gen_x: 28.5, boomers: 12.3 },
            { platform: 'Instagram', gen_z: 92.1, millennials: 78.5, gen_x: 52.3, boomers: 35.2 },
            { platform: 'YouTube', gen_z: 95.8, millennials: 88.2, gen_x: 72.4, boomers: 58.6 },
            { platform: 'Twitter', gen_z: 42.3, millennials: 55.8, gen_x: 48.2, boomers: 38.5 },
            { platform: 'LinkedIn', gen_z: 28.5, millennials: 68.2, gen_x: 72.5, boomers: 45.2 }
          ],
          metadata: { sampleSize: 28500, confidence: 0.95, lastUpdated: now.toISOString() }
        },
        views: 456,
        createdBy: johnDoe.id
      },
      {
        orgId: acmeCorp.id,
        name: 'Purchase Drivers by Segment',
        description: 'Key purchase decision factors across different consumer segments',
        audiences: allAudiences.filter(a => a.orgId === acmeCorp.id).slice(0, 6).map(a => a.id),
        metrics: ['price_sensitivity', 'brand_loyalty', 'quality_focus', 'convenience', 'sustainability'],
        filters: { categories: ['consumer_goods', 'technology', 'fashion'] },
        results: {
          rows: [
            { driver: 'Price', gen_z: 72.5, millennials: 65.2, eco_conscious: 48.5, luxury: 22.3, parents: 78.5 },
            { driver: 'Quality', gen_z: 58.2, millennials: 75.8, eco_conscious: 82.3, luxury: 95.2, parents: 85.2 },
            { driver: 'Brand Values', gen_z: 78.5, millennials: 68.2, eco_conscious: 92.5, luxury: 75.8, parents: 62.3 },
            { driver: 'Convenience', gen_z: 82.3, millennials: 78.5, eco_conscious: 55.2, luxury: 88.5, parents: 92.5 },
            { driver: 'Sustainability', gen_z: 68.5, millennials: 62.3, eco_conscious: 98.2, luxury: 45.5, parents: 58.2 }
          ],
          metadata: { sampleSize: 42000, confidence: 0.95, lastUpdated: now.toISOString() }
        },
        views: 678,
        createdBy: janeSmith.id
      },
      {
        orgId: acmeCorp.id,
        name: 'Media Consumption Patterns',
        description: 'Media consumption habits and preferences across audience segments',
        audiences: allAudiences.filter(a => a.orgId === acmeCorp.id).slice(0, 4).map(a => a.id),
        metrics: ['streaming_hours', 'traditional_tv', 'podcast_listening', 'news_consumption', 'gaming'],
        filters: { period: 'weekly_average' },
        results: {
          rows: [
            { media: 'Streaming Video', gen_z: 4.2, millennials: 3.8, gen_x: 2.5, boomers: 1.8 },
            { media: 'Traditional TV', gen_z: 0.8, millennials: 1.2, gen_x: 2.8, boomers: 4.5 },
            { media: 'Podcasts', gen_z: 1.5, millennials: 2.2, gen_x: 1.8, boomers: 0.8 },
            { media: 'Social Media', gen_z: 3.5, millennials: 2.8, gen_x: 1.5, boomers: 0.8 },
            { media: 'Gaming', gen_z: 2.8, millennials: 1.5, gen_x: 0.8, boomers: 0.3 }
          ],
          metadata: { sampleSize: 18500, unit: 'hours_per_day', confidence: 0.95 }
        },
        views: 345,
        createdBy: adminUser.id
      },
      {
        orgId: acmeCorp.id,
        name: 'Brand Health by Market',
        description: 'Brand health metrics comparison across key geographic markets',
        audiences: allAudiences.filter(a => a.orgId === acmeCorp.id).slice(0, 3).map(a => a.id),
        metrics: ['brand_health', 'awareness', 'nps', 'market_share'],
        filters: { brands: ['Nike', 'Spotify', 'Tesla'] },
        results: {
          rows: [
            { market: 'United States', nike: 85.2, spotify: 78.5, tesla: 72.3 },
            { market: 'United Kingdom', nike: 82.5, spotify: 82.3, tesla: 68.5 },
            { market: 'Germany', nike: 78.2, spotify: 75.8, tesla: 75.2 },
            { market: 'Japan', nike: 88.5, spotify: 62.3, tesla: 58.5 },
            { market: 'Australia', nike: 84.2, spotify: 80.5, tesla: 70.2 }
          ],
          metadata: { metric: 'brand_health_score', sampleSize: 52000, confidence: 0.95 }
        },
        views: 567,
        createdBy: johnDoe.id
      },
      {
        orgId: acmeCorp.id,
        name: 'Competitive NPS Analysis',
        description: 'Net Promoter Score comparison across competitors by audience segment',
        audiences: allAudiences.filter(a => a.orgId === acmeCorp.id).slice(0, 4).map(a => a.id),
        metrics: ['nps', 'promoters', 'passives', 'detractors'],
        filters: { industry: 'sportswear', period: 'last_quarter' },
        results: {
          rows: [
            { brand: 'Nike', nps: 58, promoters: 68, passives: 22, detractors: 10 },
            { brand: 'Adidas', nps: 45, promoters: 58, passives: 29, detractors: 13 },
            { brand: 'Under Armour', nps: 32, promoters: 48, passives: 36, detractors: 16 },
            { brand: 'Puma', nps: 38, promoters: 52, passives: 34, detractors: 14 },
            { brand: 'New Balance', nps: 52, promoters: 62, passives: 28, detractors: 10 }
          ],
          metadata: { sampleSize: 28500, confidence: 0.95, industry: 'sportswear' }
        },
        views: 432,
        createdBy: janeSmith.id
      },
      {
        orgId: techStartup.id,
        name: 'SaaS Adoption by Company Size',
        description: 'SaaS tool adoption rates across different company sizes',
        audiences: allAudiences.filter(a => a.orgId === techStartup.id).map(a => a.id),
        metrics: ['adoption_rate', 'tools_per_user', 'spending', 'churn_rate'],
        filters: { category: 'productivity_tools' },
        results: {
          rows: [
            { size: '1-10 employees', adoption: 92.5, tools: 8.2, spending: 125, churn: 5.2 },
            { size: '11-50 employees', adoption: 88.2, tools: 12.5, spending: 85, churn: 4.8 },
            { size: '51-200 employees', adoption: 82.5, tools: 15.8, spending: 68, churn: 3.5 },
            { size: '201-1000 employees', adoption: 75.8, tools: 18.2, spending: 52, churn: 2.8 },
            { size: '1000+ employees', adoption: 68.5, tools: 22.5, spending: 45, churn: 1.5 }
          ],
          metadata: { sampleSize: 5800, unit: 'per_employee_monthly', confidence: 0.92 }
        },
        views: 189,
        createdBy: bobWilson.id
      },
      {
        orgId: techStartup.id,
        name: 'Developer Tool Preferences',
        description: 'Programming language and tool preferences among developer audiences',
        audiences: allAudiences.filter(a => a.orgId === techStartup.id).map(a => a.id),
        metrics: ['usage_rate', 'satisfaction', 'recommendation_score'],
        filters: { role: 'software_developer' },
        results: {
          rows: [
            { tool: 'VS Code', usage: 78.5, satisfaction: 88.2, recommendation: 92.5 },
            { tool: 'GitHub', usage: 85.2, satisfaction: 82.5, recommendation: 88.5 },
            { tool: 'Docker', usage: 62.5, satisfaction: 75.8, recommendation: 78.2 },
            { tool: 'Jira', usage: 58.2, satisfaction: 52.3, recommendation: 48.5 },
            { tool: 'Slack', usage: 72.5, satisfaction: 78.5, recommendation: 82.3 }
          ],
          metadata: { sampleSize: 12500, confidence: 0.95 }
        },
        views: 234,
        createdBy: bobWilson.id
      },
      {
        orgId: enterpriseCo.id,
        name: 'Enterprise Software Evaluation',
        description: 'Key factors in enterprise software purchasing decisions',
        audiences: [allAudiences.find(a => a.name === 'Enterprise Decision Makers')?.id].filter(Boolean) as string[],
        metrics: ['importance_score', 'satisfaction', 'vendor_comparison'],
        filters: { purchase_value: 'over_100k', decision_timeline: '6_months' },
        results: {
          rows: [
            { factor: 'Security & Compliance', importance: 95.2, satisfaction: 72.5, gap: 22.7 },
            { factor: 'Integration Capabilities', importance: 88.5, satisfaction: 65.8, gap: 22.7 },
            { factor: 'Scalability', importance: 85.2, satisfaction: 78.2, gap: 7.0 },
            { factor: 'Vendor Support', importance: 82.5, satisfaction: 68.5, gap: 14.0 },
            { factor: 'Total Cost of Ownership', importance: 78.5, satisfaction: 55.2, gap: 23.3 }
          ],
          metadata: { sampleSize: 2800, confidence: 0.92, avg_deal_size: 285000 }
        },
        views: 456,
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

  // Create 10 advanced reports with explicit IDs for reliable API access
  await prisma.report.create({
    data: {
      id: '1',
      orgId: acmeCorp.id,
      title: 'Q4 2024 Brand Performance Summary',
      description: 'Comprehensive quarterly analysis of brand health metrics, market share trends, and competitive positioning across all tracked brands.',
      type: ReportType.PRESENTATION,
      status: ReportStatus.PUBLISHED,
      content: {
        slides: [
          { type: 'title', title: 'Q4 2024 Brand Performance', subtitle: 'Executive Summary' },
          { type: 'metrics', title: 'Key Highlights', data: { brandHealth: 82.5, nps: 62, marketShare: 28.5, yoyGrowth: 12.3 } },
          { type: 'chart', title: 'Brand Health Trend', chartType: 'line', dataSource: 'brand_tracking' },
          { type: 'comparison', title: 'Competitive Analysis', brands: ['Nike', 'Adidas', 'Puma', 'Under Armour'] },
          { type: 'insights', title: 'Key Takeaways', bullets: ['Strong brand awareness growth in Gen Z', 'NPS improved 8 points YoY', 'Market share gains in premium segment'] },
          { type: 'recommendations', title: 'Strategic Recommendations', items: ['Double down on digital marketing', 'Expand sustainability messaging', 'Target emerging markets'] }
        ],
        metadata: { generatedAt: now.toISOString(), period: 'Q4 2024', author: 'AI Research Agent' }
      },
      thumbnail: '/key-findings-chart-with-statistics.jpg',
      agentId: marketResearchAgent.id,
      views: 342,
      createdBy: adminUser.id
    }
  })

  await prisma.report.create({
    data: {
      id: '2',
      orgId: acmeCorp.id,
      title: 'Gen Z Consumer Insights Deep Dive',
      description: 'In-depth analysis of Gen Z consumer behavior, preferences, and brand affinities across digital platforms.',
      type: ReportType.PDF,
      status: ReportStatus.PUBLISHED,
      content: {
        sections: [
          { title: 'Executive Summary', content: 'Gen Z represents a $360B market opportunity with unique consumption patterns...' },
          { title: 'Digital Platform Usage', data: { tiktok: 85.2, instagram: 92.1, youtube: 95.8, snapchat: 78.5 } },
          { title: 'Brand Preferences', insights: ['Authenticity over perfection', 'Values-driven purchasing', 'Peer influence critical'] },
          { title: 'Purchase Drivers', factors: ['Sustainability', 'Social proof', 'Brand purpose', 'Digital experience'] },
          { title: 'Media Consumption', patterns: { streaming: 4.2, socialMedia: 3.5, gaming: 2.8, podcasts: 1.5 } },
          { title: 'Recommendations', actions: ['Invest in TikTok presence', 'Emphasize sustainability', 'Leverage influencer partnerships'] }
        ],
        charts: ['platform_usage', 'purchase_drivers', 'media_consumption'],
        pageCount: 24,
        metadata: { generatedAt: now.toISOString(), audienceSegment: 'Gen Z', sampleSize: 15420 }
      },
      thumbnail: '/gen-z-consumer-behavior-infographic.jpg',
      agentId: audienceAnalysisAgent.id,
      views: 567,
      createdBy: johnDoe.id
    }
  })

  await prisma.report.create({
    data: {
      id: '3',
      orgId: acmeCorp.id,
      title: 'Competitive Landscape Analysis 2024',
      description: 'Strategic analysis of competitive positioning, market share dynamics, and emerging threats in the sportswear industry.',
      type: ReportType.PRESENTATION,
      status: ReportStatus.PUBLISHED,
      content: {
        slides: [
          { type: 'title', title: 'Competitive Landscape 2024', subtitle: 'Market Intelligence Report' },
          { type: 'marketMap', title: 'Market Positioning', quadrants: ['Leaders', 'Challengers', 'Niche Players', 'Emerging'] },
          { type: 'shareOfVoice', title: 'Share of Voice Analysis', platforms: ['Social', 'Search', 'Media'] },
          { type: 'swot', title: 'Competitive SWOT', competitors: ['Adidas', 'Under Armour', 'Puma'] },
          { type: 'trends', title: 'Market Trends', items: ['DTC acceleration', 'Sustainability focus', 'Athleisure growth'] },
          { type: 'threats', title: 'Emerging Threats', competitors: ['On Running', 'Hoka', 'Allbirds'] }
        ],
        metadata: { generatedAt: now.toISOString(), industry: 'Sportswear', competitorsAnalyzed: 12 }
      },
      thumbnail: '/presentation-slides.png',
      agentId: marketResearchAgent.id,
      views: 423,
      createdBy: janeSmith.id
    }
  })

  await prisma.report.create({
    data: {
      id: '4',
      orgId: acmeCorp.id,
      title: 'Brand Health Dashboard - Weekly Snapshot',
      description: 'Real-time dashboard showing key brand health indicators with week-over-week comparisons.',
      type: ReportType.DASHBOARD,
      status: ReportStatus.PUBLISHED,
      content: {
        widgets: [
          { type: 'kpi', title: 'Brand Health Score', value: 84.2, change: 2.3, trend: 'up' },
          { type: 'kpi', title: 'Net Promoter Score', value: 62, change: 5, trend: 'up' },
          { type: 'kpi', title: 'Market Share', value: 28.5, change: 0.8, trend: 'up' },
          { type: 'kpi', title: 'Sentiment Score', value: 0.78, change: 0.05, trend: 'up' },
          { type: 'chart', title: 'Weekly Trend', chartType: 'line', period: '4w' },
          { type: 'chart', title: 'Competitor Comparison', chartType: 'bar', competitors: 5 },
          { type: 'table', title: 'Top Performing Segments', rows: 5 },
          { type: 'alerts', title: 'Attention Required', items: ['NPS drop in 45-54 segment', 'Competitor campaign detected'] }
        ],
        refreshRate: '1h',
        lastUpdated: now.toISOString(),
        metadata: { period: 'Weekly', brands: ['Nike'] }
      },
      thumbnail: '/analytics-dashboard.png',
      views: 1245,
      createdBy: adminUser.id
    }
  })

  await prisma.report.create({
    data: {
      id: '5',
      orgId: acmeCorp.id,
      title: 'Sustainability Perception Study',
      description: 'Consumer perception analysis of brand sustainability initiatives and their impact on purchase intent.',
      type: ReportType.PDF,
      status: ReportStatus.PUBLISHED,
      content: {
        sections: [
          { title: 'Research Overview', methodology: 'Mixed methods: Survey (n=5,000) + Social listening' },
          { title: 'Key Findings', highlights: ['72% consider sustainability in purchases', 'Greenwashing concerns rising', 'Transparency is critical'] },
          { title: 'Brand Rankings', data: { patagonia: 92, nike: 68, adidas: 72, underArmour: 45 } },
          { title: 'Consumer Segments', segments: ['Eco-Warriors', 'Conscious Consumers', 'Skeptics', 'Indifferent'] },
          { title: 'Impact on Purchase', correlation: 0.68, priceElasticity: 0.23 },
          { title: 'Recommendations', actions: ['Increase transparency', 'Third-party certifications', 'Circular economy initiatives'] }
        ],
        appendix: { methodology: true, rawData: true, bibliography: true },
        pageCount: 36,
        metadata: { studyPeriod: 'Sep-Oct 2024', markets: ['US', 'UK', 'DE', 'FR'] }
      },
      thumbnail: '/pdf-report-document.jpg',
      agentId: audienceAnalysisAgent.id,
      views: 289,
      createdBy: janeSmith.id
    }
  })

  await prisma.report.create({
    data: {
      id: '6',
      orgId: acmeCorp.id,
      title: 'Social Media Performance Infographic',
      description: 'Visual summary of social media performance metrics across all platforms.',
      type: ReportType.INFOGRAPHIC,
      status: ReportStatus.PUBLISHED,
      content: {
        sections: [
          { type: 'header', title: 'Social Media Performance', period: 'Q4 2024' },
          { type: 'platform_stats', platforms: [
            { name: 'Instagram', followers: '12.5M', engagement: '4.2%', growth: '+15%' },
            { name: 'TikTok', followers: '8.2M', engagement: '8.5%', growth: '+45%' },
            { name: 'Twitter', followers: '5.8M', engagement: '2.1%', growth: '+8%' },
            { name: 'YouTube', subscribers: '3.2M', avgViews: '450K', growth: '+22%' }
          ]},
          { type: 'top_content', posts: ['Behind the scenes campaign video', 'Athlete partnership announcement', 'Sustainability milestone'] },
          { type: 'sentiment', positive: 78, neutral: 15, negative: 7 },
          { type: 'comparison', vsCompetitors: '+23% engagement', vsIndustry: '+35% growth' }
        ],
        dimensions: { width: 1200, height: 2400 },
        colorScheme: 'brand',
        metadata: { generatedAt: now.toISOString(), platforms: 4 }
      },
      thumbnail: '/infographic-sports-audience.jpg',
      views: 876,
      createdBy: johnDoe.id
    }
  })

  await prisma.report.create({
    data: {
      id: '7',
      orgId: techStartup.id,
      title: 'Market Entry Analysis - APAC Region',
      description: 'Strategic analysis for market expansion into Asia-Pacific markets including market sizing, competitive landscape, and entry strategies.',
      type: ReportType.PRESENTATION,
      status: ReportStatus.PUBLISHED,
      content: {
        slides: [
          { type: 'title', title: 'APAC Market Entry Strategy', subtitle: 'Expansion Opportunity Assessment' },
          { type: 'marketSize', title: 'Market Opportunity', tam: '$42B', sam: '$8.5B', som: '$1.2B' },
          { type: 'countryAnalysis', title: 'Priority Markets', countries: ['Japan', 'South Korea', 'Singapore', 'Australia'] },
          { type: 'competitive', title: 'Local Competition', players: ['Local Champion A', 'Global Player B', 'Regional C'] },
          { type: 'entryModes', title: 'Entry Strategies', options: ['Direct entry', 'Partnership', 'Acquisition'] },
          { type: 'timeline', title: 'Implementation Roadmap', phases: ['Research', 'Pilot', 'Scale'] },
          { type: 'financials', title: 'Investment Requirements', capex: '$5M', timeline: '18 months', roi: '3.2x' }
        ],
        metadata: { generatedAt: now.toISOString(), region: 'APAC', markets: 4 }
      },
      thumbnail: '/executive-summary-slide-with-key-metrics.jpg',
      agentId: startupResearchAgent.id,
      views: 156,
      createdBy: bobWilson.id
    }
  })

  await prisma.report.create({
    data: {
      id: '8',
      orgId: techStartup.id,
      title: 'User Acquisition Cost Analysis',
      description: 'Detailed breakdown of customer acquisition costs by channel with optimization recommendations.',
      type: ReportType.PDF,
      status: ReportStatus.PUBLISHED,
      content: {
        sections: [
          { title: 'Executive Summary', cac: 45.80, ltv: 285, ltvCacRatio: 6.2 },
          { title: 'Channel Performance', channels: [
            { name: 'Paid Social', cac: 52.30, volume: 3500, quality: 'High' },
            { name: 'Organic Search', cac: 12.40, volume: 2200, quality: 'Very High' },
            { name: 'Paid Search', cac: 68.90, volume: 1800, quality: 'Medium' },
            { name: 'Referral', cac: 8.50, volume: 1200, quality: 'Very High' },
            { name: 'Content Marketing', cac: 22.10, volume: 950, quality: 'High' }
          ]},
          { title: 'Cohort Analysis', retention: { m1: 85, m3: 62, m6: 48, m12: 35 } },
          { title: 'Optimization Opportunities', savings: '$125K/quarter', actions: ['Reduce paid search spend', 'Scale referral program', 'Invest in content'] },
          { title: 'Benchmarks', industry: { avgCac: 65, topQuartile: 38 } }
        ],
        pageCount: 18,
        metadata: { period: 'Q4 2024', currency: 'USD' }
      },
      thumbnail: '/key-findings-chart.jpg',
      views: 234,
      createdBy: bobWilson.id
    }
  })

  await prisma.report.create({
    data: {
      id: '9',
      orgId: enterpriseCo.id,
      title: 'Enterprise Brand Audit 2024',
      description: 'Comprehensive brand audit covering brand equity, perception, and strategic positioning across enterprise segments.',
      type: ReportType.PDF,
      status: ReportStatus.PUBLISHED,
      content: {
        sections: [
          { title: 'Brand Equity Assessment', score: 78.5, components: { awareness: 85, loyalty: 72, quality: 82, associations: 75 } },
          { title: 'Stakeholder Perception', segments: [
            { name: 'C-Suite', perception: 82, priorities: ['Reliability', 'Innovation', 'ROI'] },
            { name: 'IT Decision Makers', perception: 78, priorities: ['Security', 'Integration', 'Support'] },
            { name: 'End Users', perception: 71, priorities: ['Ease of use', 'Performance', 'Features'] }
          ]},
          { title: 'Competitive Position', rank: 3, totalMarket: 12, gapToLeader: 8.5 },
          { title: 'Brand Architecture', recommendation: 'Endorsed brand strategy', rationale: 'Leverage corporate equity while enabling product differentiation' },
          { title: 'Action Plan', initiatives: ['Thought leadership program', 'Customer advocacy', 'Visual identity refresh'] }
        ],
        appendices: ['Research methodology', 'Detailed survey results', 'Competitive profiles'],
        pageCount: 52,
        metadata: { auditScope: 'Global', segments: 5, respondents: 2500 }
      },
      thumbnail: '/audience-segments-diagram.jpg',
      agentId: enterpriseAnalysisAgent.id,
      views: 412,
      createdBy: sarahEnterprise.id
    }
  })

  await prisma.report.create({
    data: {
      id: '10',
      orgId: enterpriseCo.id,
      title: 'Quarterly Business Review Export',
      description: 'Exportable data package containing all key metrics and insights for quarterly business review.',
      type: ReportType.EXPORT,
      status: ReportStatus.PUBLISHED,
      content: {
        datasets: [
          { name: 'brand_metrics', format: 'csv', rows: 1250, columns: 18 },
          { name: 'audience_segments', format: 'csv', rows: 85, columns: 24 },
          { name: 'competitive_data', format: 'csv', rows: 420, columns: 15 },
          { name: 'campaign_performance', format: 'csv', rows: 36, columns: 22 },
          { name: 'financial_summary', format: 'xlsx', sheets: 4 }
        ],
        visualizations: [
          { name: 'executive_dashboard', format: 'png', dimensions: '1920x1080' },
          { name: 'trend_charts', format: 'svg', count: 8 },
          { name: 'infographics', format: 'pdf', pages: 4 }
        ],
        documentation: {
          dataDict: true,
          methodology: true,
          changelog: true
        },
        exportedAt: now.toISOString(),
        metadata: { period: 'Q4 2024', dataPoints: 125000, formats: ['CSV', 'XLSX', 'PNG', 'SVG', 'PDF'] }
      },
      thumbnail: '/data-export-spreadsheet.jpg',
      views: 189,
      createdBy: sarahEnterprise.id
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
  console.log('   Crosstabs: 9')
  console.log('   Dashboards: 7')
  console.log('   Charts: 10')
  console.log('   Reports: 10')
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
