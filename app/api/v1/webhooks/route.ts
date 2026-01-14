import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { hasPermission } from '@/lib/permissions'
import crypto from 'crypto'

/**
 * GET /api/v1/webhooks
 * Get webhook endpoints
 */
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const orgId = request.headers.get('x-organization-id')
    if (!orgId) {
      return NextResponse.json({ error: 'Organization ID required' }, { status: 400 })
    }

    const member = await prisma.organizationMember.findFirst({
      where: { userId: session.user.id, organizationId: orgId },
    })

    if (!member || !hasPermission(member.role, 'webhooks:view')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const webhooks = await prisma.webhookEndpoint.findMany({
      where: { organizationId: orgId },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(webhooks)
  } catch (error) {
    console.error('Error fetching webhooks:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * POST /api/v1/webhooks
 * Create webhook endpoint
 */
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const orgId = request.headers.get('x-organization-id')
    if (!orgId) {
      return NextResponse.json({ error: 'Organization ID required' }, { status: 400 })
    }

    const member = await prisma.organizationMember.findFirst({
      where: { userId: session.user.id, organizationId: orgId },
    })

    if (!member || !hasPermission(member.role, 'webhooks:manage')) {
      return NextResponse.json(
        { error: 'You do not have permission to manage webhooks' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { url, events, description } = body

    if (!url || !events || !Array.isArray(events)) {
      return NextResponse.json({ error: 'URL and events required' }, { status: 400 })
    }

    // Generate secret
    const secret = `whsec_${crypto.randomBytes(32).toString('hex')}`

    const webhook = await prisma.webhookEndpoint.create({
      data: {
        organizationId: orgId,
        url,
        events,
        description,
        secret,
        enabled: true,
      },
    })

    await prisma.auditLog.create({
      data: {
        action: 'WEBHOOK_CREATED',
        entityType: 'WEBHOOK_ENDPOINT',
        entityId: webhook.id,
        userId: session.user.id,
        organizationId: orgId,
        metadata: { url, events },
      },
    })

    return NextResponse.json(webhook)
  } catch (error) {
    console.error('Error creating webhook:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
