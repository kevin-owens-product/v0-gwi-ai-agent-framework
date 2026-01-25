/**
 * @prompt-id forge-v4.1:feature:saved-views:002
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
import { Prisma } from '@prisma/client'

/**
 * Validation schema for updating a saved view
 */
const updateSavedViewSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be 100 characters or less').optional(),
  description: z.string().max(500, 'Description must be 500 characters or less').nullable().optional(),
  isPinned: z.boolean().optional(),
  sortOrder: z.number().int().min(0).optional(),
  metadata: z.record(z.unknown()).optional(),
})

/**
 * GET /api/v1/saved-views/[id] - Get a single saved view
 */
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

    // Check membership
    const membership = await getUserMembership(session.user.id, orgId)
    if (!membership) {
      return NextResponse.json({ error: 'Not a member of this organization' }, { status: 403 })
    }

    // Fetch the saved view - must belong to this user and org
    const savedView = await prisma.savedView.findFirst({
      where: {
        id,
        userId: session.user.id,
        orgId,
      },
    })

    if (!savedView) {
      return NextResponse.json({ error: 'Saved view not found' }, { status: 404 })
    }

    // Record API usage
    recordUsage(orgId, 'API_CALLS', 1).catch(console.error)

    return NextResponse.json({ data: savedView })
  } catch (error) {
    console.error('GET /api/v1/saved-views/[id] error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * PATCH /api/v1/saved-views/[id] - Update a saved view
 */
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

    // Check membership
    const membership = await getUserMembership(session.user.id, orgId)
    if (!membership) {
      return NextResponse.json({ error: 'Not a member of this organization' }, { status: 403 })
    }

    // Check saved view exists and belongs to this user
    const existingView = await prisma.savedView.findFirst({
      where: {
        id,
        userId: session.user.id,
        orgId,
      },
    })

    if (!existingView) {
      return NextResponse.json({ error: 'Saved view not found' }, { status: 404 })
    }

    // Parse and validate request body
    const body = await request.json()
    const validationResult = updateSavedViewSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation error', details: validationResult.error.errors },
        { status: 400 }
      )
    }

    const { metadata, ...restData } = validationResult.data

    // Build update data
    const updateData: Prisma.SavedViewUpdateInput = { ...restData }
    if (metadata !== undefined) {
      updateData.metadata = metadata as Prisma.InputJsonValue
    }

    // Update saved view
    const savedView = await prisma.savedView.update({
      where: { id },
      data: updateData,
    })

    // Log audit event
    await logAuditEvent(createAuditEventFromRequest(request, {
      orgId,
      userId: session.user.id,
      action: 'update',
      resourceType: 'saved_view',
      resourceId: savedView.id,
      metadata: { changes: Object.keys(validationResult.data) },
    }))

    // Record API usage
    recordUsage(orgId, 'API_CALLS', 1).catch(console.error)

    return NextResponse.json({ data: savedView })
  } catch (error) {
    console.error('PATCH /api/v1/saved-views/[id] error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * DELETE /api/v1/saved-views/[id] - Delete a saved view
 */
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

    // Check membership
    const membership = await getUserMembership(session.user.id, orgId)
    if (!membership) {
      return NextResponse.json({ error: 'Not a member of this organization' }, { status: 403 })
    }

    // Check saved view exists and belongs to this user
    const existingView = await prisma.savedView.findFirst({
      where: {
        id,
        userId: session.user.id,
        orgId,
      },
    })

    if (!existingView) {
      return NextResponse.json({ error: 'Saved view not found' }, { status: 404 })
    }

    // Delete saved view
    await prisma.savedView.delete({ where: { id } })

    // Log audit event
    await logAuditEvent(createAuditEventFromRequest(request, {
      orgId,
      userId: session.user.id,
      action: 'delete',
      resourceType: 'saved_view',
      resourceId: id,
      metadata: { name: existingView.name, entityType: existingView.entityType, entityId: existingView.entityId },
    }))

    // Record API usage
    recordUsage(orgId, 'API_CALLS', 1).catch(console.error)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('DELETE /api/v1/saved-views/[id] error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
