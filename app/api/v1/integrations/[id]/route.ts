import { NextRequest, NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { getOrgIdFromRequest } from '@/lib/shared-utils'
import { getUserMembership } from '@/lib/tenant'
import { hasPermission } from '@/lib/permissions'
import { logAuditEvent, createAuditEventFromRequest } from '@/lib/audit'
import { recordUsage } from '@/lib/billing'
import { z } from 'zod'

const updateIntegrationSchema = z.object({
  status: z.enum(['ACTIVE', 'PAUSED', 'UNINSTALLED']).optional(),
  configuration: z.record(z.unknown()).optional(),
})

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

    const orgId = await getOrgIdFromRequest(request, session.user.id)
    if (!orgId) {
      return NextResponse.json({ error: 'No organization found' }, { status: 404 })
    }

    const membership = await getUserMembership(session.user.id, orgId)
    if (!membership || !hasPermission(membership.role, 'integrations:write')) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 })
    }

    const body = await request.json()
    const validation = updateIntegrationSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation error', details: validation.error.errors },
        { status: 400 }
      )
    }

    // Try to find as IntegrationInstall first
    const install = await prisma.integrationInstall.findFirst({
      where: { id, orgId },
      include: { app: true },
    })

    if (install) {
      const updated = await prisma.integrationInstall.update({
        where: { id },
        data: {
          ...(validation.data.status && { status: validation.data.status }),
          ...(validation.data.configuration && {
            configuration: validation.data.configuration as Prisma.InputJsonValue,
          }),
          ...(validation.data.status === 'UNINSTALLED' && {
            uninstalledAt: new Date(),
            uninstalledBy: session.user.id,
          }),
        },
        include: {
          app: {
            select: {
              id: true,
              name: true,
              description: true,
              iconUrl: true,
              category: true,
            },
          },
        },
      })

      await logAuditEvent(createAuditEventFromRequest(request, {
        orgId,
        userId: session.user.id,
        action: 'update',
        resourceType: 'integration',
        resourceId: id,
        metadata: validation.data,
      }))

      recordUsage(orgId, 'API_CALLS', 1).catch(console.error)

      return NextResponse.json({
        success: true,
        integration: {
          id: updated.id,
          appId: updated.appId,
          name: updated.app.name,
          description: updated.app.description,
          icon: updated.app.iconUrl,
          category: updated.app.category,
          status: updated.status,
          configuration: updated.configuration,
          createdAt: updated.createdAt,
        },
      })
    }

    // Try to find as WebhookEndpoint
    const webhook = await prisma.webhookEndpoint.findFirst({
      where: { id, orgId },
    })

    if (webhook) {
      const updated = await prisma.webhookEndpoint.update({
        where: { id },
        data: {
          ...(validation.data.status && {
            status: validation.data.status === 'ACTIVE' ? 'ACTIVE' : 'DISABLED',
          }),
          ...(validation.data.status === 'DISABLED' && {
            disabledAt: new Date(),
            disabledReason: 'User request',
          }),
        },
      })

      await logAuditEvent(createAuditEventFromRequest(request, {
        orgId,
        userId: session.user.id,
        action: 'update',
        resourceType: 'webhook',
        resourceId: id,
        metadata: validation.data,
      }))

      recordUsage(orgId, 'API_CALLS', 1).catch(console.error)

      return NextResponse.json({
        success: true,
        integration: {
          id: updated.id,
          name: updated.name,
          url: updated.url,
          type: 'WEBHOOK',
          status: updated.status,
          createdAt: updated.createdAt,
        },
      })
    }

    return NextResponse.json({ error: 'Integration not found' }, { status: 404 })
  } catch (error) {
    console.error('Error updating integration:', error)
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

    const orgId = await getOrgIdFromRequest(request, session.user.id)
    if (!orgId) {
      return NextResponse.json({ error: 'No organization found' }, { status: 404 })
    }

    const membership = await getUserMembership(session.user.id, orgId)
    if (!membership || !hasPermission(membership.role, 'integrations:delete')) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 })
    }

    // Try to find as IntegrationInstall first
    const install = await prisma.integrationInstall.findFirst({
      where: { id, orgId },
    })

    if (install) {
      // Soft delete by setting status to UNINSTALLED
      await prisma.integrationInstall.update({
        where: { id },
        data: {
          status: 'UNINSTALLED',
          uninstalledAt: new Date(),
          uninstalledBy: session.user.id,
        },
      })

      await logAuditEvent(createAuditEventFromRequest(request, {
        orgId,
        userId: session.user.id,
        action: 'delete',
        resourceType: 'integration',
        resourceId: id,
      }))

      recordUsage(orgId, 'API_CALLS', 1).catch(console.error)

      return NextResponse.json({ success: true })
    }

    // Try to find as WebhookEndpoint
    const webhook = await prisma.webhookEndpoint.findFirst({
      where: { id, orgId },
    })

    if (webhook) {
      await prisma.webhookEndpoint.delete({ where: { id } })

      await logAuditEvent(createAuditEventFromRequest(request, {
        orgId,
        userId: session.user.id,
        action: 'delete',
        resourceType: 'webhook',
        resourceId: id,
      }))

      recordUsage(orgId, 'API_CALLS', 1).catch(console.error)

      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'Integration not found' }, { status: 404 })
  } catch (error) {
    console.error('Error deleting integration:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
