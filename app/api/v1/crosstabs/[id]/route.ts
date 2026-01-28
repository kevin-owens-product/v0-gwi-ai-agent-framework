import { NextRequest, NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { getValidatedOrgId, getUserMembership } from '@/lib/tenant'
import { hasPermission } from '@/lib/permissions'
import { logAuditEvent, createAuditEventFromRequest } from '@/lib/audit'
import { recordUsage } from '@/lib/billing'
import { z } from 'zod'

const updateCrosstabSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().optional(),
  audiences: z.array(z.string()).optional(),
  metrics: z.array(z.string()).optional(),
  filters: z.record(z.unknown()).optional(),
  results: z.record(z.unknown()).optional(),
})

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

    const membership = await getUserMembership(session.user.id, orgId)
    if (!membership) {
      return NextResponse.json({ error: 'Not a member of this organization' }, { status: 403 })
    }

    if (!hasPermission(membership.role, 'crosstabs:read')) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 })
    }

    const crosstab = await prisma.crosstab.findFirst({
      where: { id, orgId },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
          },
        },
      },
    })

    if (!crosstab) {
      return NextResponse.json({ error: 'Crosstab not found' }, { status: 404 })
    }

    // Fetch audience details if audience IDs are provided
    const audienceIds = crosstab.audiences || []
    const audiences = audienceIds.length > 0 ? await prisma.audience.findMany({
      where: {
        id: { in: audienceIds },
        orgId,
      },
      select: {
        id: true,
        name: true,
        size: true,
        description: true,
      },
    }) : []

    // Increment views
    await prisma.crosstab.update({
      where: { id },
      data: { views: { increment: 1 } },
    })

    recordUsage(orgId, 'API_CALLS', 1).catch(console.error)

    return NextResponse.json({
      data: {
        ...crosstab,
        audiences: audiences.map(a => ({
          id: a.id,
          name: a.name,
          size: a.size || 0,
        })),
      },
    })
  } catch (error) {
    console.error('Error fetching crosstab:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

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

    const membership = await getUserMembership(session.user.id, orgId)
    if (!membership) {
      return NextResponse.json({ error: 'Not a member of this organization' }, { status: 403 })
    }

    if (!hasPermission(membership.role, 'crosstabs:write')) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 })
    }

    const existingCrosstab = await prisma.crosstab.findFirst({
      where: { id, orgId },
    })

    if (!existingCrosstab) {
      return NextResponse.json({ error: 'Crosstab not found' }, { status: 404 })
    }

    const body = await request.json()
    const validationResult = updateCrosstabSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation error', details: validationResult.error.errors },
        { status: 400 }
      )
    }

    const { filters, results, ...rest } = validationResult.data
    const crosstab = await prisma.crosstab.update({
      where: { id },
      data: {
        ...rest,
        ...(filters !== undefined && { filters: filters as Prisma.InputJsonValue }),
        ...(results !== undefined && { results: results as Prisma.InputJsonValue }),
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
          },
        },
      },
    })

    await logAuditEvent(createAuditEventFromRequest(request, {
      orgId,
      userId: session.user.id,
      action: 'update',
      resourceType: 'crosstab',
      resourceId: id,
      metadata: validationResult.data,
    }))

    recordUsage(orgId, 'API_CALLS', 1).catch(console.error)

    return NextResponse.json({ data: crosstab })
  } catch (error) {
    console.error('Error updating crosstab:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

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

    const membership = await getUserMembership(session.user.id, orgId)
    if (!membership) {
      return NextResponse.json({ error: 'Not a member of this organization' }, { status: 403 })
    }

    if (!hasPermission(membership.role, 'crosstabs:delete')) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 })
    }

    const existingCrosstab = await prisma.crosstab.findFirst({
      where: { id, orgId },
    })

    if (!existingCrosstab) {
      return NextResponse.json({ error: 'Crosstab not found' }, { status: 404 })
    }

    await prisma.crosstab.delete({ where: { id } })

    await logAuditEvent(createAuditEventFromRequest(request, {
      orgId,
      userId: session.user.id,
      action: 'delete',
      resourceType: 'crosstab',
      resourceId: id,
    }))

    recordUsage(orgId, 'API_CALLS', 1).catch(console.error)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting crosstab:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
