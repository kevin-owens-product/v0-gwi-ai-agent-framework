import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { cookies } from 'next/headers'
import { getUserMembership } from '@/lib/tenant'
import { hasPermission } from '@/lib/permissions'
import { logAuditEvent, createAuditEventFromRequest } from '@/lib/audit'
import { checkRateLimit, getRateLimitHeaders, getRateLimitIdentifier } from '@/lib/rate-limit'
import { recordUsage } from '@/lib/billing'
import { z } from 'zod'

// Validation schema for creating an agent
const createAgentSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  type: z.enum(['RESEARCH', 'ANALYSIS', 'REPORTING', 'MONITORING', 'CUSTOM']),
  configuration: z.record(z.unknown()).optional(),
})

// Helper to get org ID from header or cookies
async function getOrgId(request: NextRequest, userId: string): Promise<string | null> {
  // First try header
  const headerOrgId = request.headers.get('x-organization-id')
  if (headerOrgId) return headerOrgId

  // Fall back to cookies
  const cookieStore = await cookies()
  const memberships = await prisma.organizationMember.findMany({
    where: { userId },
    include: { organization: true },
    orderBy: { joinedAt: 'asc' },
  })

  if (memberships.length === 0) return null

  return cookieStore.get('currentOrgId')?.value || memberships[0].organization.id
}

// GET /api/v1/agents - List agents for organization
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const orgId = await getOrgId(request, session.user.id)
    if (!orgId) {
      return NextResponse.json({ error: 'No organization found' }, { status: 404 })
    }

    // Check rate limit
    const org = await prisma.organization.findUnique({
      where: { id: orgId },
      select: { planTier: true }
    })

    const rateLimitResult = await checkRateLimit(
      getRateLimitIdentifier(request, session.user.id, orgId),
      org?.planTier || 'STARTER'
    )

    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429, headers: getRateLimitHeaders(rateLimitResult) }
      )
    }

    // Check membership and permissions
    const membership = await getUserMembership(session.user.id, orgId)
    if (!membership) {
      return NextResponse.json({ error: 'Not a member of this organization' }, { status: 403 })
    }

    if (!hasPermission(membership.role, 'agents:read')) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 })
    }

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100)
    const offset = parseInt(searchParams.get('offset') || '0')
    const status = searchParams.get('status') as 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'ARCHIVED' | null
    const type = searchParams.get('type') as 'RESEARCH' | 'ANALYSIS' | 'REPORTING' | 'MONITORING' | 'CUSTOM' | null
    const search = searchParams.get('search')

    // Build query
    const where: any = { orgId }
    if (status) where.status = status
    if (type) where.type = type
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ]
    }

    // Calculate skip - use offset if provided, otherwise use page
    const skip = offset > 0 ? offset : (page - 1) * limit

    // Fetch agents with pagination
    const [agents, total] = await Promise.all([
      prisma.agent.findMany({
        where,
        include: {
          creator: { select: { id: true, name: true, email: true } },
          _count: { select: { runs: true } },
        },
        orderBy: { updatedAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.agent.count({ where }),
    ])

    // Record API usage (don't await to not slow response)
    recordUsage(orgId, 'API_CALLS', 1).catch(console.error)

    return NextResponse.json(
      {
        agents, // Also include as 'agents' for simpler access
        data: agents,
        total,
        meta: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
      { headers: getRateLimitHeaders(rateLimitResult) }
    )
  } catch (error) {
    console.error('Error fetching agents:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/v1/agents - Create a new agent
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const orgId = await getOrgId(request, session.user.id)
    if (!orgId) {
      return NextResponse.json({ error: 'No organization found' }, { status: 404 })
    }

    // Check membership and permissions
    const membership = await getUserMembership(session.user.id, orgId)
    if (!membership) {
      return NextResponse.json({ error: 'Not a member of this organization' }, { status: 403 })
    }

    if (!hasPermission(membership.role, 'agents:write')) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 })
    }

    // Parse and validate request body
    const body = await request.json()
    const validationResult = createAgentSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation error', details: validationResult.error.errors },
        { status: 400 }
      )
    }

    const { name, description, type, configuration } = validationResult.data

    // Create agent
    const agent = await prisma.agent.create({
      data: {
        orgId,
        name,
        description,
        type,
        configuration: configuration || {},
        createdBy: session.user.id,
      },
      include: {
        creator: { select: { id: true, name: true, email: true } },
      },
    })

    // Log audit event
    await logAuditEvent(createAuditEventFromRequest(request, {
      orgId,
      userId: session.user.id,
      action: 'create',
      resourceType: 'agent',
      resourceId: agent.id,
      metadata: { name, type },
    }))

    // Record API usage
    recordUsage(orgId, 'API_CALLS', 1).catch(console.error)

    return NextResponse.json(agent, { status: 201 })
  } catch (error) {
    console.error('Error creating agent:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
