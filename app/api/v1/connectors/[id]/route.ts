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
import { recordUsage } from '@/lib/billing'
import { z } from 'zod'
import { Prisma } from '@prisma/client'
import { CONNECTOR_PROVIDERS, type ConnectorProviderType } from '@/lib/connectors'

// Validation schema for updating a connector
const updateConnectorSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().optional(),
  credentials: z.record(z.unknown()).optional(),
  config: z.record(z.unknown()).optional(),
  syncSchedule: z.string().nullable().optional(),
  isActive: z.boolean().optional(),
})

// GET /api/v1/connectors/[id] - Get connector by ID with sync history
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

    if (!hasPermission(membership.role, 'integrations:read')) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 })
    }

    // Fetch connector with recent sync logs
    const connector = await prisma.dataConnector.findFirst({
      where: { id, orgId },
      include: {
        syncLogs: {
          take: 20,
          orderBy: { startedAt: 'desc' },
        },
        _count: { select: { syncLogs: true } },
      },
    })

    if (!connector) {
      return NextResponse.json({ error: 'Connector not found' }, { status: 404 })
    }

    // Get provider metadata
    const providerConfig = CONNECTOR_PROVIDERS[connector.provider as ConnectorProviderType]

    // Record API usage
    await recordUsage(orgId, 'API_CALLS', 1)

    return NextResponse.json({
      data: {
        ...connector,
        credentials: undefined, // Never expose credentials
        providerMeta: providerConfig
          ? {
              name: providerConfig.name,
              description: providerConfig.description,
              icon: providerConfig.icon,
              authType: providerConfig.authType,
              type: providerConfig.type,
            }
          : null,
      },
    })
  } catch (error) {
    console.error('Error fetching connector:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PATCH /api/v1/connectors/[id] - Update connector
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

    if (!hasPermission(membership.role, 'integrations:write')) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 })
    }

    // Check connector exists in org
    const existingConnector = await prisma.dataConnector.findFirst({
      where: { id, orgId },
    })

    if (!existingConnector) {
      return NextResponse.json({ error: 'Connector not found' }, { status: 404 })
    }

    // Parse and validate request body
    const body = await request.json()
    const validationResult = updateConnectorSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation error', details: validationResult.error.errors },
        { status: 400 }
      )
    }

    const { name, description, credentials, config, syncSchedule, isActive } = validationResult.data

    // Check for duplicate name if changing name
    if (name && name !== existingConnector.name) {
      const duplicate = await prisma.dataConnector.findFirst({
        where: { orgId, name, id: { not: id } },
      })
      if (duplicate) {
        return NextResponse.json(
          { error: 'A connector with this name already exists' },
          { status: 409 }
        )
      }
    }

    // Build update data
    const updateData: Prisma.DataConnectorUpdateInput = {}
    if (name !== undefined) updateData.name = name
    if (description !== undefined) updateData.description = description
    if (credentials !== undefined) updateData.credentials = credentials as Prisma.InputJsonValue
    if (config !== undefined) updateData.config = config as Prisma.InputJsonValue
    if (syncSchedule !== undefined) updateData.syncSchedule = syncSchedule
    if (isActive !== undefined) updateData.isActive = isActive

    // Update connector
    const connector = await prisma.dataConnector.update({
      where: { id },
      data: updateData,
      include: {
        _count: { select: { syncLogs: true } },
      },
    })

    // Log audit event
    await logAuditEvent(
      createAuditEventFromRequest(request, {
        orgId,
        userId: session.user.id,
        action: 'update',
        resourceType: 'data_source',
        resourceId: connector.id,
        metadata: { changes: Object.keys(validationResult.data) },
      })
    )

    // Record API usage
    await recordUsage(orgId, 'API_CALLS', 1)

    // Get provider metadata
    const providerConfig = CONNECTOR_PROVIDERS[connector.provider as ConnectorProviderType]

    return NextResponse.json({
      data: {
        ...connector,
        credentials: undefined,
        providerMeta: providerConfig
          ? {
              name: providerConfig.name,
              icon: providerConfig.icon,
              authType: providerConfig.authType,
            }
          : null,
      },
    })
  } catch (error) {
    console.error('Error updating connector:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/v1/connectors/[id] - Delete connector
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

    if (!hasPermission(membership.role, 'integrations:delete')) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 })
    }

    // Check connector exists in org
    const existingConnector = await prisma.dataConnector.findFirst({
      where: { id, orgId },
    })

    if (!existingConnector) {
      return NextResponse.json({ error: 'Connector not found' }, { status: 404 })
    }

    // Delete connector (cascades to sync logs)
    await prisma.dataConnector.delete({ where: { id } })

    // Log audit event
    await logAuditEvent(
      createAuditEventFromRequest(request, {
        orgId,
        userId: session.user.id,
        action: 'delete',
        resourceType: 'data_source',
        resourceId: id,
        metadata: { name: existingConnector.name, provider: existingConnector.provider },
      })
    )

    // Record API usage
    await recordUsage(orgId, 'API_CALLS', 1)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting connector:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
