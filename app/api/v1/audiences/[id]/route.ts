import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { cookies } from 'next/headers'
import { getUserMembership } from '@/lib/tenant'
import { hasPermission } from '@/lib/permissions'
import { logAuditEvent, createAuditEventFromRequest } from '@/lib/audit'
import { recordUsage } from '@/lib/billing'
import { z } from 'zod'
import { Prisma } from '@prisma/client'

const updateAudienceSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().optional(),
  criteria: z.record(z.unknown()).optional(),
  size: z.number().optional(),
  markets: z.array(z.string()).optional(),
  isFavorite: z.boolean().optional(),
})

async function getOrgId(request: NextRequest, userId: string): Promise<string | null> {
  const headerOrgId = request.headers.get('x-organization-id')
  if (headerOrgId) return headerOrgId

  const cookieStore = await cookies()
  const memberships = await prisma.organizationMember.findMany({
    where: { userId },
    include: { organization: true },
    orderBy: { joinedAt: 'asc' },
  })

  if (memberships.length === 0) return null

  return cookieStore.get('currentOrgId')?.value || memberships[0].organization.id
}

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

    const orgId = await getOrgId(request, session.user.id)
    if (!orgId) {
      return NextResponse.json({ error: 'No organization found' }, { status: 404 })
    }

    const membership = await getUserMembership(session.user.id, orgId)
    if (!membership) {
      return NextResponse.json({ error: 'Not a member of this organization' }, { status: 403 })
    }

    if (!hasPermission(membership.role, 'audiences:read')) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 })
    }

    const audience = await prisma.audience.findFirst({
      where: { id, orgId },
    })

    if (!audience) {
      return NextResponse.json({ error: 'Audience not found' }, { status: 404 })
    }

    // Update usage stats
    await prisma.audience.update({
      where: { id },
      data: {
        lastUsed: new Date(),
        usageCount: { increment: 1 },
      },
    })

    recordUsage(orgId, 'API_CALLS', 1).catch(console.error)

    return NextResponse.json({ data: audience })
  } catch (error) {
    console.error('Error fetching audience:', error)
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

    const orgId = await getOrgId(request, session.user.id)
    if (!orgId) {
      return NextResponse.json({ error: 'No organization found' }, { status: 404 })
    }

    const membership = await getUserMembership(session.user.id, orgId)
    if (!membership) {
      return NextResponse.json({ error: 'Not a member of this organization' }, { status: 403 })
    }

    if (!hasPermission(membership.role, 'audiences:write')) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 })
    }

    const existingAudience = await prisma.audience.findFirst({
      where: { id, orgId },
    })

    if (!existingAudience) {
      return NextResponse.json({ error: 'Audience not found' }, { status: 404 })
    }

    const body = await request.json()
    const validationResult = updateAudienceSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation error', details: validationResult.error.errors },
        { status: 400 }
      )
    }

    // Cast criteria to proper Prisma type if present
    const updateData = {
      ...validationResult.data,
      ...(validationResult.data.criteria && {
        criteria: validationResult.data.criteria as Prisma.InputJsonValue
      })
    }
    const audience = await prisma.audience.update({
      where: { id },
      data: updateData,
    })

    await logAuditEvent(createAuditEventFromRequest(request, {
      orgId,
      userId: session.user.id,
      action: 'update',
      resourceType: 'audience',
      resourceId: id,
      metadata: validationResult.data,
    }))

    recordUsage(orgId, 'API_CALLS', 1).catch(console.error)

    return NextResponse.json({ data: audience })
  } catch (error) {
    console.error('Error updating audience:', error)
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

    const orgId = await getOrgId(request, session.user.id)
    if (!orgId) {
      return NextResponse.json({ error: 'No organization found' }, { status: 404 })
    }

    const membership = await getUserMembership(session.user.id, orgId)
    if (!membership) {
      return NextResponse.json({ error: 'Not a member of this organization' }, { status: 403 })
    }

    if (!hasPermission(membership.role, 'audiences:delete')) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 })
    }

    const existingAudience = await prisma.audience.findFirst({
      where: { id, orgId },
    })

    if (!existingAudience) {
      return NextResponse.json({ error: 'Audience not found' }, { status: 404 })
    }

    await prisma.audience.delete({ where: { id } })

    await logAuditEvent(createAuditEventFromRequest(request, {
      orgId,
      userId: session.user.id,
      action: 'delete',
      resourceType: 'audience',
      resourceId: id,
    }))

    recordUsage(orgId, 'API_CALLS', 1).catch(console.error)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting audience:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
