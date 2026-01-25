/**
 * @prompt-id forge-v4.1:feature:custom-alerts:001
 * @generated-at 2024-01-25T00:00:00Z
 * @model claude-opus-4-5
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { getUserMembership, getValidatedOrgId } from '@/lib/tenant'
import { hasPermission } from '@/lib/permissions'
import { logAuditEvent, createAuditEventFromRequest } from '@/lib/audit'
import { recordUsage } from '@/lib/billing'
import { z } from 'zod'
import { Prisma } from '@prisma/client'

// Validation schema for alert condition
const alertConditionSchema = z.object({
  metric: z.string().min(1),
  operator: z.enum(['eq', 'neq', 'gt', 'gte', 'lt', 'lte', 'contains', 'not_contains']),
  value: z.union([z.string(), z.number(), z.boolean()]),
  unit: z.string().optional(),
})

// Validation schema for creating an alert
const createAlertSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  entityType: z.enum(['metric', 'audience', 'brand', 'report', 'agent', 'workflow']),
  entityId: z.string().optional(),
  condition: alertConditionSchema,
  channels: z.array(z.enum(['EMAIL', 'SLACK', 'WEBHOOK', 'IN_APP', 'SMS'])).min(1),
  recipients: z.array(z.string().email()).optional().default([]),
  webhookUrl: z.string().url().optional(),
  cooldownMinutes: z.number().int().min(5).max(1440).optional().default(60),
  metadata: z.record(z.unknown()).optional(),
})

// GET /api/v1/alerts - List user's custom alerts
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const orgId = await getValidatedOrgId(request, session.user.id)
    if (!orgId) {
      return NextResponse.json({ error: 'No organization found or access denied' }, { status: 404 })
    }

    // Check membership and permissions
    const membership = await getUserMembership(session.user.id, orgId)
    if (!membership) {
      return NextResponse.json({ error: 'Not a member of this organization' }, { status: 403 })
    }

    if (!hasPermission(membership.role, 'settings:read')) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 })
    }

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100)
    const entityType = searchParams.get('entityType')
    const isActive = searchParams.get('isActive')
    const search = searchParams.get('search')

    // Build query
    const where: Prisma.CustomAlertWhereInput = {
      orgId,
      userId: session.user.id,
    }

    if (entityType) {
      where.entityType = entityType
    }

    if (isActive !== null && isActive !== undefined) {
      where.isActive = isActive === 'true'
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ]
    }

    const skip = (page - 1) * limit

    // Fetch alerts with pagination
    const [alerts, total] = await Promise.all([
      prisma.customAlert.findMany({
        where,
        include: {
          user: { select: { id: true, name: true, email: true } },
          _count: { select: { alertHistory: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.customAlert.count({ where }),
    ])

    // Record API usage
    recordUsage(orgId, 'API_CALLS', 1).catch(console.error)

    return NextResponse.json({
      alerts,
      data: alerts,
      total,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Error fetching alerts:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/v1/alerts - Create a new alert
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const orgId = await getValidatedOrgId(request, session.user.id)
    if (!orgId) {
      return NextResponse.json({ error: 'No organization found or access denied' }, { status: 404 })
    }

    // Check membership and permissions
    const membership = await getUserMembership(session.user.id, orgId)
    if (!membership) {
      return NextResponse.json({ error: 'Not a member of this organization' }, { status: 403 })
    }

    if (!hasPermission(membership.role, 'settings:manage')) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 })
    }

    // Parse and validate request body
    const body = await request.json()
    const validationResult = createAlertSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation error', details: validationResult.error.errors },
        { status: 400 }
      )
    }

    const {
      name,
      description,
      entityType,
      entityId,
      condition,
      channels,
      recipients,
      webhookUrl,
      cooldownMinutes,
      metadata,
    } = validationResult.data

    // Create alert
    const alert = await prisma.customAlert.create({
      data: {
        orgId,
        userId: session.user.id,
        name,
        description,
        entityType,
        entityId,
        condition: condition as Prisma.InputJsonValue,
        channels,
        recipients,
        webhookUrl,
        cooldownMinutes,
        metadata: (metadata || {}) as Prisma.InputJsonValue,
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    })

    // Log audit event
    await logAuditEvent(createAuditEventFromRequest(request, {
      orgId,
      userId: session.user.id,
      action: 'create',
      resourceType: 'alert',
      resourceId: alert.id,
      metadata: { name, entityType, channels },
    }))

    // Record API usage
    recordUsage(orgId, 'API_CALLS', 1).catch(console.error)

    return NextResponse.json({ data: alert }, { status: 201 })
  } catch (error) {
    console.error('Error creating alert:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
