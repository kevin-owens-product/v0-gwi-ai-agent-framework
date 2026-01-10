import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { getOrgIdFromRequest } from '@/lib/shared-utils'
import { getUserMembership } from '@/lib/tenant'
import { hasPermission } from '@/lib/permissions'
import { z } from 'zod'

const createIntegrationSchema = z.object({
  name: z.string().min(1),
  type: z.enum(['SLACK', 'WEBHOOK', 'ZAPIER', 'API', 'CUSTOM']),
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

    // Return available integration types
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

    // Get configured integrations (would need Integration model)
    // For now, return available ones
    return NextResponse.json({
      available: availableIntegrations,
      configured: [], // TODO: Fetch from database
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

    const { name, type, config } = validation.data

    // In production, create Integration record
    // For now, return success
    return NextResponse.json({
      success: true,
      integration: {
        id: 'int_' + Date.now(),
        name,
        type,
        status: 'ACTIVE',
        createdAt: new Date(),
      },
    })
  } catch (error) {
    console.error('POST /api/v1/integrations error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
