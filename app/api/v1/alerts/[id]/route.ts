/**
 * @prompt-id forge-v4.1:feature:custom-alerts:002
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

// Validation schema for updating an alert
const updateAlertSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional().nullable(),
  entityType: z.enum(['metric', 'audience', 'brand', 'report', 'agent', 'workflow']).optional(),
  entityId: z.string().optional().nullable(),
  condition: alertConditionSchema.optional(),
  channels: z.array(z.enum(['EMAIL', 'SLACK', 'WEBHOOK', 'IN_APP', 'SMS'])).min(1).optional(),
  recipients: z.array(z.string().email()).optional(),
  webhookUrl: z.string().url().optional().nullable(),
  isActive: z.boolean().optional(),
  cooldownMinutes: z.number().int().min(5).max(1440).optional(),
  metadata: z.record(z.unknown()).optional(),
})

// GET /api/v1/alerts/[id] - Get single alert with history
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
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

    // Fetch alert with recent history
    const alert = await prisma.customAlert.findFirst({
      where: {
        id,
        orgId,
        userId: session.user.id,
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
        alertHistory: {
          take: 10,
          orderBy: { triggeredAt: 'desc' },
        },
        _count: { select: { alertHistory: true } },
      },
    })

    if (!alert) {
      return NextResponse.json({ error: 'Alert not found' }, { status: 404 })
    }

    // Record API usage
    await recordUsage(orgId, 'API_CALLS', 1)

    return NextResponse.json({ data: alert })
  } catch (error) {
    console.error('Error fetching alert:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PATCH /api/v1/alerts/[id] - Update alert
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
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

    // Check alert exists and belongs to user
    const existingAlert = await prisma.customAlert.findFirst({
      where: {
        id,
        orgId,
        userId: session.user.id,
      },
    })

    if (!existingAlert) {
      return NextResponse.json({ error: 'Alert not found' }, { status: 404 })
    }

    // Parse and validate request body
    const body = await request.json()
    const validationResult = updateAlertSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation error', details: validationResult.error.errors },
        { status: 400 }
      )
    }

    // Build update data
    const { condition, metadata, ...restData } = validationResult.data
    const updateData: Prisma.CustomAlertUpdateInput = {
      ...restData,
    }

    if (condition !== undefined) {
      updateData.condition = condition as Prisma.InputJsonValue
    }

    if (metadata !== undefined) {
      updateData.metadata = metadata as Prisma.InputJsonValue
    }

    // Update alert
    const alert = await prisma.customAlert.update({
      where: { id },
      data: updateData,
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    })

    // Log audit event
    await logAuditEvent(createAuditEventFromRequest(request, {
      orgId,
      userId: session.user.id,
      action: 'update',
      resourceType: 'alert',
      resourceId: alert.id,
      metadata: { changes: Object.keys(validationResult.data) },
    }))

    // Record API usage
    await recordUsage(orgId, 'API_CALLS', 1)

    return NextResponse.json({ data: alert })
  } catch (error) {
    console.error('Error updating alert:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/v1/alerts/[id] - Delete alert
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
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

    // Check alert exists and belongs to user
    const existingAlert = await prisma.customAlert.findFirst({
      where: {
        id,
        orgId,
        userId: session.user.id,
      },
    })

    if (!existingAlert) {
      return NextResponse.json({ error: 'Alert not found' }, { status: 404 })
    }

    // Delete alert (cascades to history)
    await prisma.customAlert.delete({ where: { id } })

    // Log audit event
    await logAuditEvent(createAuditEventFromRequest(request, {
      orgId,
      userId: session.user.id,
      action: 'delete',
      resourceType: 'alert',
      resourceId: id,
      metadata: { name: existingAlert.name },
    }))

    // Record API usage
    await recordUsage(orgId, 'API_CALLS', 1)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting alert:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
