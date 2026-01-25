/**
 * @prompt-id forge-v4.1:feature:saved-views:001
 * @generated-at 2026-01-25T00:00:00Z
 * @model claude-opus-4-5
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { getValidatedOrgId, getUserMembership } from '@/lib/tenant'
import { logAuditEvent, createAuditEventFromRequest } from '@/lib/audit'
import { recordUsage } from '@/lib/billing'
import { z } from 'zod'
import { Prisma, SavedViewType } from '@prisma/client'

/**
 * Validation schema for creating a saved view
 */
const createSavedViewSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be 100 characters or less'),
  description: z.string().max(500, 'Description must be 500 characters or less').optional(),
  type: z.nativeEnum(SavedViewType),
  entityType: z.string().min(1, 'Entity type is required').max(50, 'Entity type must be 50 characters or less'),
  entityId: z.string().min(1, 'Entity ID is required'),
  isPinned: z.boolean().optional().default(false),
  sortOrder: z.number().int().min(0).optional().default(0),
  metadata: z.record(z.unknown()).optional().default({}),
})

/**
 * GET /api/v1/saved-views - List user's saved views
 *
 * Query parameters:
 * - type: Filter by SavedViewType (FAVORITE, RECENT, PINNED)
 * - entityType: Filter by entity type (dashboard, report, agent, audience, etc.)
 * - pinned: Filter by pinned status (true/false)
 * - limit: Maximum number of results (default: 50, max: 100)
 * - offset: Number of results to skip (default: 0)
 */
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

    // Check membership
    const membership = await getUserMembership(session.user.id, orgId)
    if (!membership) {
      return NextResponse.json({ error: 'Not a member of this organization' }, { status: 403 })
    }

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams
    const type = searchParams.get('type') as SavedViewType | null
    const entityType = searchParams.get('entityType')
    const pinnedParam = searchParams.get('pinned')
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100)
    const offset = parseInt(searchParams.get('offset') || '0')

    // Build where clause - saved views are user-specific within an org
    const where: Prisma.SavedViewWhereInput = {
      userId: session.user.id,
      orgId,
    }

    if (type && Object.values(SavedViewType).includes(type)) {
      where.type = type
    }

    if (entityType) {
      where.entityType = entityType
    }

    if (pinnedParam !== null) {
      where.isPinned = pinnedParam === 'true'
    }

    // Fetch saved views with pagination
    const [savedViews, total] = await Promise.all([
      prisma.savedView.findMany({
        where,
        orderBy: [
          { isPinned: 'desc' },
          { sortOrder: 'asc' },
          { updatedAt: 'desc' },
        ],
        skip: offset,
        take: limit,
      }),
      prisma.savedView.count({ where }),
    ])

    // Record API usage (don't await to not slow response)
    recordUsage(orgId, 'API_CALLS', 1).catch(console.error)

    return NextResponse.json({
      data: savedViews,
      meta: {
        total,
        limit,
        offset,
        hasMore: offset + savedViews.length < total,
      },
    })
  } catch (error) {
    console.error('GET /api/v1/saved-views error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * POST /api/v1/saved-views - Create a new saved view
 */
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

    // Check membership
    const membership = await getUserMembership(session.user.id, orgId)
    if (!membership) {
      return NextResponse.json({ error: 'Not a member of this organization' }, { status: 403 })
    }

    // Parse and validate request body
    const body = await request.json()
    const validationResult = createSavedViewSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation error', details: validationResult.error.errors },
        { status: 400 }
      )
    }

    const { name, description, type, entityType, entityId, isPinned, sortOrder, metadata } = validationResult.data

    // Check if a saved view already exists for this user + entity combination
    const existingView = await prisma.savedView.findUnique({
      where: {
        userId_entityType_entityId: {
          userId: session.user.id,
          entityType,
          entityId,
        },
      },
    })

    if (existingView) {
      return NextResponse.json(
        { error: 'A saved view for this entity already exists', existingId: existingView.id },
        { status: 409 }
      )
    }

    // Create saved view
    const savedView = await prisma.savedView.create({
      data: {
        userId: session.user.id,
        orgId,
        name,
        description,
        type,
        entityType,
        entityId,
        isPinned,
        sortOrder,
        metadata: metadata as Prisma.InputJsonValue,
      },
    })

    // Log audit event
    await logAuditEvent(createAuditEventFromRequest(request, {
      orgId,
      userId: session.user.id,
      action: 'create',
      resourceType: 'saved_view',
      resourceId: savedView.id,
      metadata: { name, type, entityType, entityId },
    }))

    // Record API usage
    recordUsage(orgId, 'API_CALLS', 1).catch(console.error)

    return NextResponse.json({ data: savedView }, { status: 201 })
  } catch (error) {
    console.error('POST /api/v1/saved-views error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
