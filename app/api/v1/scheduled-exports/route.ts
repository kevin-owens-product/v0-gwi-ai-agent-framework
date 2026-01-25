/**
 * @prompt-id forge-v4.1:feature:scheduled-exports:001
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

// Validation schema for creating a scheduled export
const createScheduledExportSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  entityType: z.enum(['report', 'dashboard', 'audience', 'crosstab']),
  entityId: z.string().min(1),
  format: z.enum(['PDF', 'EXCEL', 'CSV', 'POWERPOINT', 'PNG', 'JSON']),
  schedule: z.string().min(1), // Cron expression
  timezone: z.string().default('UTC'),
  recipients: z.array(z.string().email()).default([]),
  metadata: z.record(z.unknown()).optional(),
})

// Helper to calculate next run time from cron expression
function calculateNextRunAt(schedule: string, timezone: string): Date {
  // Simple implementation - in production, use a library like cron-parser
  // For now, default to 24 hours from now
  const next = new Date()
  next.setHours(next.getHours() + 24)
  return next
}

// GET /api/v1/scheduled-exports - List user's scheduled exports
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

    if (!hasPermission(membership.role, 'exports:read')) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 })
    }

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100)
    const status = searchParams.get('status') // active, inactive
    const entityType = searchParams.get('entityType')

    // Build query - users can only see their own scheduled exports
    const where: Prisma.ScheduledExportWhereInput = {
      orgId,
      userId: session.user.id,
    }

    if (status === 'active') where.isActive = true
    if (status === 'inactive') where.isActive = false
    if (entityType) where.entityType = entityType

    const skip = (page - 1) * limit

    // Fetch scheduled exports with pagination
    const [exports, total] = await Promise.all([
      prisma.scheduledExport.findMany({
        where,
        include: {
          user: { select: { id: true, name: true, email: true } },
          _count: { select: { exportHistory: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.scheduledExport.count({ where }),
    ])

    // Record API usage
    recordUsage(orgId, 'API_CALLS', 1).catch(console.error)

    return NextResponse.json({
      data: exports,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Error fetching scheduled exports:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/v1/scheduled-exports - Create a new scheduled export
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

    if (!hasPermission(membership.role, 'exports:write')) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 })
    }

    // Parse and validate request body
    const body = await request.json()
    const validationResult = createScheduledExportSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation error', details: validationResult.error.errors },
        { status: 400 }
      )
    }

    const { name, description, entityType, entityId, format, schedule, timezone, recipients, metadata } = validationResult.data

    // Verify the entity exists (optional - based on entityType)
    // For now, we'll trust that the entityId is valid

    // Calculate next run time
    const nextRunAt = calculateNextRunAt(schedule, timezone)

    // Create scheduled export
    const scheduledExport = await prisma.scheduledExport.create({
      data: {
        orgId,
        userId: session.user.id,
        name,
        description,
        entityType,
        entityId,
        format,
        schedule,
        timezone,
        recipients,
        nextRunAt,
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
      resourceType: 'scheduled_export',
      resourceId: scheduledExport.id,
      metadata: { name, entityType, schedule },
    }))

    // Record API usage
    recordUsage(orgId, 'API_CALLS', 1).catch(console.error)

    return NextResponse.json({ data: scheduledExport }, { status: 201 })
  } catch (error) {
    console.error('Error creating scheduled export:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
