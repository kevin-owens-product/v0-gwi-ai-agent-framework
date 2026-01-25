/**
 * @prompt-id forge-v4.1:feature:data-connectors:001
 * @generated-at 2026-01-25T00:00:00Z
 * @model claude-opus-4-5
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { getUserMembership, getValidatedOrgId } from '@/lib/tenant'
import { hasPermission } from '@/lib/permissions'
import { logAuditEvent, createAuditEventFromRequest } from '@/lib/audit'
import { checkRateLimit, getRateLimitHeaders, getRateLimitIdentifier } from '@/lib/rate-limit'
import { recordUsage } from '@/lib/billing'
import { z } from 'zod'
import { Prisma, DataConnectorType } from '@prisma/client'
import { CONNECTOR_PROVIDERS, type ConnectorProviderType } from '@/lib/connectors'

// Validation schema for creating a connector
const createConnectorSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  description: z.string().optional(),
  type: z.nativeEnum(DataConnectorType),
  provider: z.string().min(1, 'Provider is required'),
  credentials: z.record(z.unknown()).default({}),
  config: z.record(z.unknown()).default({}),
  syncSchedule: z.string().nullable().optional(),
})

// GET /api/v1/connectors - List connectors for organization
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

    // Check rate limit
    const org = await prisma.organization.findUnique({
      where: { id: orgId },
      select: { planTier: true },
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

    if (!hasPermission(membership.role, 'integrations:read')) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 })
    }

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100)
    const offset = parseInt(searchParams.get('offset') || '0')
    const type = searchParams.get('type') as DataConnectorType | null
    const provider = searchParams.get('provider')
    const isActive = searchParams.get('isActive')
    const search = searchParams.get('search')

    // Build query
    const where: Prisma.DataConnectorWhereInput = { orgId }
    if (type) where.type = type
    if (provider) where.provider = provider
    if (isActive !== null && isActive !== undefined) {
      where.isActive = isActive === 'true'
    }
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { provider: { contains: search, mode: 'insensitive' } },
      ]
    }

    // Calculate skip
    const skip = offset > 0 ? offset : (page - 1) * limit

    // Fetch connectors with pagination
    const [connectors, total] = await Promise.all([
      prisma.dataConnector.findMany({
        where,
        include: {
          _count: { select: { syncLogs: true } },
        },
        orderBy: { updatedAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.dataConnector.count({ where }),
    ])

    // Map connectors to include provider metadata (exclude credentials)
    const connectorsWithMeta = connectors.map((connector) => {
      const providerConfig = CONNECTOR_PROVIDERS[connector.provider as ConnectorProviderType]
      return {
        ...connector,
        credentials: undefined, // Never expose credentials
        providerMeta: providerConfig
          ? {
              name: providerConfig.name,
              icon: providerConfig.icon,
              authType: providerConfig.authType,
            }
          : null,
      }
    })

    // Record API usage
    recordUsage(orgId, 'API_CALLS', 1).catch(console.error)

    return NextResponse.json(
      {
        connectors: connectorsWithMeta,
        data: connectorsWithMeta,
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
    console.error('Error fetching connectors:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/v1/connectors - Create a new connector
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

    if (!hasPermission(membership.role, 'integrations:write')) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 })
    }

    // Parse and validate request body
    const body = await request.json()
    const validationResult = createConnectorSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation error', details: validationResult.error.errors },
        { status: 400 }
      )
    }

    const { name, description, type, provider, credentials, config, syncSchedule } =
      validationResult.data

    // Validate provider exists
    const providerConfig = CONNECTOR_PROVIDERS[provider as ConnectorProviderType]
    if (!providerConfig) {
      return NextResponse.json({ error: 'Invalid provider' }, { status: 400 })
    }

    // Check for duplicate name in org
    const existing = await prisma.dataConnector.findFirst({
      where: { orgId, name },
    })
    if (existing) {
      return NextResponse.json(
        { error: 'A connector with this name already exists' },
        { status: 409 }
      )
    }

    // Create connector
    const connector = await prisma.dataConnector.create({
      data: {
        orgId,
        name,
        description,
        type,
        provider,
        credentials: credentials as Prisma.InputJsonValue,
        config: config as Prisma.InputJsonValue,
        syncSchedule: syncSchedule || null,
        isActive: true,
      },
      include: {
        _count: { select: { syncLogs: true } },
      },
    })

    // Log audit event
    await logAuditEvent(
      createAuditEventFromRequest(request, {
        orgId,
        userId: session.user.id,
        action: 'create',
        resourceType: 'data_source',
        resourceId: connector.id,
        metadata: { name, type, provider },
      })
    )

    // Record API usage
    recordUsage(orgId, 'API_CALLS', 1).catch(console.error)

    // Return connector without credentials
    return NextResponse.json(
      {
        ...connector,
        credentials: undefined,
        providerMeta: {
          name: providerConfig.name,
          icon: providerConfig.icon,
          authType: providerConfig.authType,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating connector:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
