/**
 * @prompt-id forge-v4.1:feature:custom-alerts:004
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

// Validation schema for acknowledging an alert
const acknowledgeSchema = z.object({
  historyId: z.string().min(1),
  notes: z.string().max(500).optional(),
  status: z.enum(['ACKNOWLEDGED', 'RESOLVED', 'IGNORED']).optional().default('ACKNOWLEDGED'),
})

// POST /api/v1/alerts/[id]/acknowledge - Acknowledge alert
export async function POST(
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

    // Verify alert exists and belongs to user
    const alert = await prisma.customAlert.findFirst({
      where: {
        id,
        orgId,
        userId: session.user.id,
      },
    })

    if (!alert) {
      return NextResponse.json({ error: 'Alert not found' }, { status: 404 })
    }

    // Parse and validate request body
    const body = await request.json()
    const validationResult = acknowledgeSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation error', details: validationResult.error.errors },
        { status: 400 }
      )
    }

    const { historyId, notes, status } = validationResult.data

    // Verify history entry exists and belongs to this alert
    const historyEntry = await prisma.alertHistory.findFirst({
      where: {
        id: historyId,
        alertId: id,
      },
    })

    if (!historyEntry) {
      return NextResponse.json({ error: 'Alert history entry not found' }, { status: 404 })
    }

    // Update history entry
    const updatedHistory = await prisma.alertHistory.update({
      where: { id: historyId },
      data: {
        status,
        acknowledgedBy: session.user.id,
        acknowledgedAt: new Date(),
        notes,
        ...(status === 'RESOLVED' && { resolvedAt: new Date() }),
      },
    })

    // Log audit event
    await logAuditEvent(createAuditEventFromRequest(request, {
      orgId,
      userId: session.user.id,
      action: 'acknowledge',
      resourceType: 'alert',
      resourceId: id,
      metadata: { historyId, status, notes },
    }))

    // Record API usage
    await recordUsage(orgId, 'API_CALLS', 1)

    return NextResponse.json({ data: updatedHistory })
  } catch (error) {
    console.error('Error acknowledging alert:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
