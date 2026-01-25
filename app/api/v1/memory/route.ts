import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { Prisma } from '@prisma/client'
import { getUserMembership, getValidatedOrgId } from '@/lib/tenant'
import { hasPermission } from '@/lib/permissions'
import { recordUsage } from '@/lib/billing'
import { z } from 'zod'

const createMemorySchema = z.object({
  agentId: z.string().optional(),
  type: z.enum(['CONTEXT', 'PREFERENCE', 'FACT', 'CONVERSATION', 'CACHE']),
  key: z.string().min(1).max(200),
  value: z.unknown(),
  metadata: z.record(z.unknown()).optional(),
  expiresAt: z.string().datetime().optional(),
})

// Schema for PATCH endpoint (used in [id]/route.ts)
export const updateMemorySchema = z.object({
  value: z.unknown().optional(),
  metadata: z.record(z.unknown()).optional(),
  expiresAt: z.string().datetime().optional(),
})

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const orgId = await getValidatedOrgId(request, session.user.id)
    if (!orgId) {
      return NextResponse.json({ error: 'Organization not found or access denied' }, { status: 404 })
    }

    const membership = await getUserMembership(session.user.id, orgId)
    if (!membership) {
      return NextResponse.json({ error: 'Not a member of this organization' }, { status: 403 })
    }

    if (!hasPermission(membership.role, 'memory:read')) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 })
    }

    const searchParams = request.nextUrl.searchParams
    const agentId = searchParams.get('agentId')
    const type = searchParams.get('type') as 'CONTEXT' | 'PREFERENCE' | 'FACT' | 'CONVERSATION' | 'CACHE' | null
    const key = searchParams.get('key')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100)

    const where: any = { orgId }
    if (agentId) where.agentId = agentId
    if (type) where.type = type
    if (key) where.key = { contains: key, mode: 'insensitive' }

    // Filter out expired memories
    where.OR = [
      { expiresAt: null },
      { expiresAt: { gt: new Date() } },
    ]

    const skip = (page - 1) * limit

    const [memories, total] = await Promise.all([
      prisma.memory.findMany({
        where,
        orderBy: { updatedAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.memory.count({ where }),
    ])

    recordUsage(orgId, 'API_CALLS', 1).catch(console.error)

    return NextResponse.json({
      memories,
      data: memories,
      total,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Error fetching memories:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const orgId = await getValidatedOrgId(request, session.user.id)
    if (!orgId) {
      return NextResponse.json({ error: 'Organization not found or access denied' }, { status: 404 })
    }

    const membership = await getUserMembership(session.user.id, orgId)
    if (!membership) {
      return NextResponse.json({ error: 'Not a member of this organization' }, { status: 403 })
    }

    if (!hasPermission(membership.role, 'memory:write')) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 })
    }

    const body = await request.json()
    const validationResult = createMemorySchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation error', details: validationResult.error.errors },
        { status: 400 }
      )
    }

    const { agentId, type, key, value, metadata, expiresAt } = validationResult.data

    // Upsert - update if exists, create if not
    const memory = await prisma.memory.upsert({
      where: {
        orgId_agentId_type_key: {
          orgId,
          agentId: agentId || '',
          type,
          key,
        },
      },
      update: {
        value: value as Prisma.InputJsonValue,
        metadata: (metadata || {}) as Prisma.InputJsonValue,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
      },
      create: {
        orgId,
        agentId: agentId || null,
        type,
        key,
        value: value as Prisma.InputJsonValue,
        metadata: (metadata || {}) as Prisma.InputJsonValue,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
      },
    })

    recordUsage(orgId, 'API_CALLS', 1).catch(console.error)

    return NextResponse.json(memory, { status: 201 })
  } catch (error) {
    console.error('Error creating memory:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const orgId = await getValidatedOrgId(request, session.user.id)
    if (!orgId) {
      return NextResponse.json({ error: 'Organization not found or access denied' }, { status: 404 })
    }

    const membership = await getUserMembership(session.user.id, orgId)
    if (!membership) {
      return NextResponse.json({ error: 'Not a member of this organization' }, { status: 403 })
    }

    if (!hasPermission(membership.role, 'memory:delete')) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 })
    }

    const searchParams = request.nextUrl.searchParams
    const agentId = searchParams.get('agentId')
    const type = searchParams.get('type') as 'CONTEXT' | 'PREFERENCE' | 'FACT' | 'CONVERSATION' | 'CACHE' | null
    const key = searchParams.get('key')
    const id = searchParams.get('id')

    if (id) {
      // Delete specific memory by ID
      await prisma.memory.delete({ where: { id } })
    } else if (agentId && type && key) {
      // Delete by composite key
      await prisma.memory.delete({
        where: {
          orgId_agentId_type_key: {
            orgId,
            agentId,
            type,
            key,
          },
        },
      })
    } else if (agentId) {
      // Delete all memories for an agent
      await prisma.memory.deleteMany({
        where: { orgId, agentId },
      })
    } else {
      return NextResponse.json(
        { error: 'Must specify id, or agentId with type and key, or agentId alone' },
        { status: 400 }
      )
    }

    recordUsage(orgId, 'API_CALLS', 1).catch(console.error)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting memory:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
