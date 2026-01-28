import { NextRequest, NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { getOrgIdFromRequest } from '@/lib/shared-utils'
import { getUserMembership } from '@/lib/tenant'
import { hasPermission } from '@/lib/permissions'
import { logAuditEvent, createAuditEventFromRequest } from '@/lib/audit'
import { recordUsage } from '@/lib/billing'
import { z } from 'zod'

const createIntegrationSchema = z.object({
  appId: z.string().optional(), // For marketplace apps
  name: z.string().min(1).optional(), // For custom integrations
  type: z.enum(['SLACK', 'WEBHOOK', 'ZAPIER', 'API', 'CUSTOM']).optional(),
  config: z.record(z.unknown()),
})

// GET /api/v1/integrations - List integrations
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const orgId = await getOrgIdFromRequest(request, session.user.id)
    if (!orgId) {
      return NextResponse.json({ error: 'No organization found' }, { status: 404 })
    }

    const membership = await getUserMembership(session.user.id, orgId)
    if (!membership) {
      return NextResponse.json({ error: 'Not a member' }, { status: 403 })
    }

    // Get configured integrations from IntegrationInstall
    const configuredInstalls = await prisma.integrationInstall.findMany({
      where: {
        orgId,
        status: 'ACTIVE',
      },
      include: {
        app: {
          select: {
            id: true,
            name: true,
            description: true,
            iconUrl: true,
            category: true,
            slug: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    // Get webhook endpoints
    const webhooks = await prisma.webhookEndpoint.findMany({
      where: {
        orgId,
        status: 'ACTIVE',
      },
      select: {
        id: true,
        name: true,
        url: true,
        events: true,
        status: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    // Return available integration types (static list)
    const availableIntegrations = [
      {
        type: 'SLACK',
        name: 'Slack',
        description: 'Send notifications to Slack channels',
        icon: '💬',
        configFields: ['webhookUrl', 'channel'],
      },
      {
        type: 'WEBHOOK',
        name: 'Webhook',
        description: 'Send HTTP POST requests to custom endpoints',
        icon: '🔗',
        configFields: ['url', 'method', 'headers'],
      },
      {
        type: 'ZAPIER',
        name: 'Zapier',
        description: 'Connect with 5000+ apps via Zapier',
        icon: '⚡',
        configFields: ['zapierWebhookUrl'],
      },
      {
        type: 'API',
        name: 'REST API',
        description: 'Access GWI platform via REST API',
        icon: '🔌',
        configFields: ['apiKey', 'baseUrl'],
      },
      {
        type: 'CUSTOM',
        name: 'Custom Integration',
        description: 'Build custom integrations',
        icon: '🛠️',
        configFields: ['code'],
      },
    ]

    recordUsage(orgId, 'API_CALLS', 1).catch(console.error)

    return NextResponse.json({
      available: availableIntegrations,
      configured: configuredInstalls.map(install => ({
        id: install.id,
        appId: install.appId,
        name: install.app.name,
        description: install.app.description,
        icon: install.app.iconUrl,
        category: install.app.category,
        status: install.status,
        configuration: install.configuration,
        createdAt: install.createdAt,
        lastUsedAt: install.lastUsedAt,
      })),
      webhooks: webhooks.map(wh => ({
        id: wh.id,
        name: wh.name,
        url: wh.url,
        events: wh.events,
        status: wh.status,
        createdAt: wh.createdAt,
      })),
    })
  } catch (error) {
    console.error('GET /api/v1/integrations error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/v1/integrations - Create integration
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const orgId = await getOrgIdFromRequest(request, session.user.id)
    if (!orgId) {
      return NextResponse.json({ error: 'No organization found' }, { status: 404 })
    }

    const membership = await getUserMembership(session.user.id, orgId)
    if (!membership || !hasPermission(membership.role, 'integrations:write')) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 })
    }

    const body = await request.json()
    const validation = createIntegrationSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation error', details: validation.error.errors },
        { status: 400 }
      )
    }

    const { appId, name, type, config } = validation.data

    // If appId is provided, create IntegrationInstall for marketplace app
    if (appId) {
      const app = await prisma.integrationApp.findUnique({
        where: { id: appId },
      })

      if (!app) {
        return NextResponse.json({ error: 'Integration app not found' }, { status: 404 })
      }

      // Check if already installed
      const existing = await prisma.integrationInstall.findUnique({
        where: {
          appId_orgId: {
            appId,
            orgId,
          },
        },
      })

      if (existing && existing.status === 'ACTIVE') {
        return NextResponse.json({ error: 'Integration already installed' }, { status: 409 })
      }

      // Create or reactivate installation
      const install = await prisma.integrationInstall.upsert({
        where: {
          appId_orgId: {
            appId,
            orgId,
          },
        },
        update: {
          status: 'ACTIVE',
          configuration: (config || {}) as Prisma.InputJsonValue,
          installedBy: session.user.id,
          uninstalledAt: null,
          uninstalledBy: null,
        },
        create: {
          appId,
          orgId,
          status: 'ACTIVE',
          installedBy: session.user.id,
          configuration: (config || {}) as Prisma.InputJsonValue,
          grantedScopes: app.requiredScopes,
        },
        include: {
          app: {
            select: {
              id: true,
              name: true,
              description: true,
              iconUrl: true,
              category: true,
            },
          },
        },
      })

      await logAuditEvent(createAuditEventFromRequest(request, {
        orgId,
        userId: session.user.id,
        action: 'create',
        resourceType: 'integration',
        resourceId: install.id,
        metadata: { appId, appName: app.name },
      }))

      recordUsage(orgId, 'API_CALLS', 1).catch(console.error)

      return NextResponse.json({
        success: true,
        integration: {
          id: install.id,
          appId: install.appId,
          name: install.app.name,
          description: install.app.description,
          icon: install.app.iconUrl,
          category: install.app.category,
          status: install.status,
          configuration: install.configuration,
          createdAt: install.createdAt,
        },
      }, { status: 201 })
    }

    // For webhook integrations, use WebhookEndpoint
    if (type === 'WEBHOOK' && config?.url) {
      const crypto = await import('crypto')
      const secret = crypto.randomBytes(32).toString('hex')

      const webhook = await prisma.webhookEndpoint.create({
        data: {
          orgId,
          url: config.url as string,
          name: name || 'Custom Webhook',
          description: config.description as string || undefined,
          events: (config.events as string[]) || [],
          secret,
          status: 'ACTIVE',
          createdBy: session.user.id,
          retryPolicy: (config.retryPolicy || {}) as Prisma.InputJsonValue,
          timeout: (config.timeout as number) || 30,
        },
      })

      await logAuditEvent(createAuditEventFromRequest(request, {
        orgId,
        userId: session.user.id,
        action: 'create',
        resourceType: 'webhook',
        resourceId: webhook.id,
        metadata: { name: webhook.name, url: webhook.url },
      }))

      recordUsage(orgId, 'API_CALLS', 1).catch(console.error)

      return NextResponse.json({
        success: true,
        integration: {
          id: webhook.id,
          name: webhook.name,
          url: webhook.url,
          type: 'WEBHOOK',
          status: webhook.status,
          createdAt: webhook.createdAt,
        },
      }, { status: 201 })
    }

    // For other types (SLACK, ZAPIER, API, CUSTOM), we could create a simple IntegrationInstall
    // with a custom app, or use WebhookEndpoint. For now, return error for unsupported types
    return NextResponse.json(
      { error: 'Integration type not yet supported. Use appId for marketplace apps or WEBHOOK type for webhooks.' },
      { status: 400 }
    )
  } catch (error) {
    console.error('POST /api/v1/integrations error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
