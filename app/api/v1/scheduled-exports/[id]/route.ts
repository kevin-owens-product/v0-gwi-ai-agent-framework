/**
 * @prompt-id forge-v4.1:feature:scheduled-exports:002
 * @generated-at 2026-01-25T00:00:00Z
 * @model claude-opus-4.5
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

// Validation schema for updating a scheduled export
const updateScheduledExportSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().optional().nullable(),
  schedule: z.string().min(1).optional(),
  timezone: z.string().optional(),
  recipients: z.array(z.string().email()).optional(),
  isActive: z.boolean().optional(),
  format: z.enum(['PDF', 'EXCEL', 'CSV', 'POWERPOINT', 'PNG', 'JSON']).optional(),
  metadata: z.record(z.unknown()).optional(),
})

// Helper to calculate next run time from cron expression
function calculateNextRunAt(schedule: string, timezone: string): Date {
  // Simple implementation - in production, use a library like cron-parser
  const next = new Date()
  next.setHours(next.getHours() + 24)
  return next
}

// GET /api/v1/scheduled-exports/[id] - Get a single scheduled export with history
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

    if (!hasPermission(membership.role, 'exports:read')) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 })
    }

    // Parse query parameters for history pagination
    const searchParams = request.nextUrl.searchParams
    const historyLimit = Math.min(parseInt(searchParams.get('historyLimit') || '10'), 50)

    // Fetch scheduled export with history
    const scheduledExport = await prisma.scheduledExport.findFirst({
      where: {
        id,
        orgId,
        userId: session.user.id, // Users can only see their own exports
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
        exportHistory: {
          orderBy: { startedAt: 'desc' },
          take: historyLimit,
        },
        _count: { select: { exportHistory: true } },
      },
    })

    if (!scheduledExport) {
      return NextResponse.json({ error: 'Scheduled export not found' }, { status: 404 })
    }

    // Record API usage
    await recordUsage(orgId, 'API_CALLS', 1)

    return NextResponse.json({ data: scheduledExport })
  } catch (error) {
    console.error('Error fetching scheduled export:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PATCH /api/v1/scheduled-exports/[id] - Update a scheduled export
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

    if (!hasPermission(membership.role, 'exports:write')) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 })
    }

    // Check scheduled export exists and belongs to user
    const existingExport = await prisma.scheduledExport.findFirst({
      where: { id, orgId, userId: session.user.id },
    })

    if (!existingExport) {
      return NextResponse.json({ error: 'Scheduled export not found' }, { status: 404 })
    }

    // Parse and validate request body
    const body = await request.json()
    const validationResult = updateScheduledExportSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation error', details: validationResult.error.errors },
        { status: 400 }
      )
    }

    const { metadata, schedule, timezone, ...restData } = validationResult.data

    // Prepare update data
    const updateData: Prisma.ScheduledExportUpdateInput = {
      ...restData,
    }

    // If schedule or timezone changed, recalculate next run time
    if (schedule || timezone) {
      updateData.schedule = schedule || existingExport.schedule
      updateData.timezone = timezone || existingExport.timezone
      updateData.nextRunAt = calculateNextRunAt(
        updateData.schedule as string,
        updateData.timezone as string
      )
    }

    if (metadata) {
      updateData.metadata = metadata as Prisma.InputJsonValue
    }

    // Update scheduled export
    const scheduledExport = await prisma.scheduledExport.update({
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
      resourceType: 'scheduled_export',
      resourceId: id,
      metadata: { changes: Object.keys(validationResult.data) },
    }))

    // Record API usage
    await recordUsage(orgId, 'API_CALLS', 1)

    return NextResponse.json({ data: scheduledExport })
  } catch (error) {
    console.error('Error updating scheduled export:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/v1/scheduled-exports/[id] - Delete a scheduled export
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

    if (!hasPermission(membership.role, 'exports:delete')) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 })
    }

    // Check scheduled export exists and belongs to user
    const existingExport = await prisma.scheduledExport.findFirst({
      where: { id, orgId, userId: session.user.id },
    })

    if (!existingExport) {
      return NextResponse.json({ error: 'Scheduled export not found' }, { status: 404 })
    }

    // Delete scheduled export (cascades to history)
    await prisma.scheduledExport.delete({ where: { id } })

    // Log audit event
    await logAuditEvent(createAuditEventFromRequest(request, {
      orgId,
      userId: session.user.id,
      action: 'delete',
      resourceType: 'scheduled_export',
      resourceId: id,
      metadata: { name: existingExport.name },
    }))

    // Record API usage
    await recordUsage(orgId, 'API_CALLS', 1)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting scheduled export:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
