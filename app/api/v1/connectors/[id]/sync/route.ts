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
import { DataSyncStatus } from '@prisma/client'

// POST /api/v1/connectors/[id]/sync - Trigger manual sync
export async function POST(
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
    const connector = await prisma.dataConnector.findFirst({
      where: { id, orgId },
    })

    if (!connector) {
      return NextResponse.json({ error: 'Connector not found' }, { status: 404 })
    }

    if (!connector.isActive) {
      return NextResponse.json({ error: 'Connector is not active' }, { status: 400 })
    }

    // Check if there's already a running sync
    const runningSync = await prisma.dataSyncLog.findFirst({
      where: {
        connectorId: id,
        status: { in: ['PENDING', 'RUNNING'] },
      },
    })

    if (runningSync) {
      return NextResponse.json(
        { error: 'A sync is already in progress', syncLogId: runningSync.id },
        { status: 409 }
      )
    }

    // Create sync log entry
    const syncLog = await prisma.dataSyncLog.create({
      data: {
        connectorId: id,
        status: 'PENDING',
        metadata: {
          triggeredBy: session.user.id,
          manual: true,
        },
      },
    })

    // Update connector last sync attempt
    await prisma.dataConnector.update({
      where: { id },
      data: {
        lastSyncStatus: 'PENDING',
      },
    })

    // Log audit event
    await logAuditEvent(
      createAuditEventFromRequest(request, {
        orgId,
        userId: session.user.id,
        action: 'execute',
        resourceType: 'data_source',
        resourceId: id,
        metadata: { syncLogId: syncLog.id, action: 'sync' },
      })
    )

    // Record API usage
    recordUsage(orgId, 'API_CALLS', 1).catch(console.error)

    // In production, this would trigger an async sync job
    // For now, simulate the sync process
    simulateSync(id, syncLog.id).catch(console.error)

    return NextResponse.json(
      {
        message: 'Sync started',
        syncLogId: syncLog.id,
        status: 'PENDING',
      },
      { status: 202 }
    )
  } catch (error) {
    console.error('Error triggering sync:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// GET /api/v1/connectors/[id]/sync - Get sync history
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

    // Check connector exists in org
    const connector = await prisma.dataConnector.findFirst({
      where: { id, orgId },
      select: { id: true },
    })

    if (!connector) {
      return NextResponse.json({ error: 'Connector not found' }, { status: 404 })
    }

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100)
    const status = searchParams.get('status') as DataSyncStatus | null

    // Build query
    const where: any = { connectorId: id }
    if (status) where.status = status

    const skip = (page - 1) * limit

    // Fetch sync logs with pagination
    const [syncLogs, total] = await Promise.all([
      prisma.dataSyncLog.findMany({
        where,
        orderBy: { startedAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.dataSyncLog.count({ where }),
    ])

    // Record API usage
    recordUsage(orgId, 'API_CALLS', 1).catch(console.error)

    return NextResponse.json({
      data: syncLogs,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Error fetching sync history:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * Simulates a sync process (for demonstration)
 * In production, this would be an async job queue worker
 */
async function simulateSync(connectorId: string, syncLogId: string): Promise<void> {
  try {
    // Mark as running
    await prisma.dataSyncLog.update({
      where: { id: syncLogId },
      data: { status: 'RUNNING' },
    })

    await prisma.dataConnector.update({
      where: { id: connectorId },
      data: { lastSyncStatus: 'RUNNING' },
    })

    // Simulate processing time (1-3 seconds)
    await new Promise((resolve) => setTimeout(resolve, 1000 + Math.random() * 2000))

    // Simulate success (90% of the time)
    const success = Math.random() > 0.1
    const recordsProcessed = success ? Math.floor(Math.random() * 10000) + 100 : 0
    const recordsFailed = success ? Math.floor(Math.random() * 10) : 0
    const bytesTransferred = success ? recordsProcessed * 512 : 0

    const status: DataSyncStatus = success ? 'COMPLETED' : 'FAILED'

    // Update sync log
    await prisma.dataSyncLog.update({
      where: { id: syncLogId },
      data: {
        status,
        recordsProcessed,
        recordsFailed,
        bytesTransferred,
        completedAt: new Date(),
        error: success ? null : 'Simulated error: Connection timeout',
      },
    })

    // Update connector
    await prisma.dataConnector.update({
      where: { id: connectorId },
      data: {
        lastSyncAt: new Date(),
        lastSyncStatus: status,
        errorCount: success ? 0 : { increment: 1 },
      },
    })
  } catch (error) {
    console.error('Sync simulation error:', error)

    // Mark as failed
    await prisma.dataSyncLog.update({
      where: { id: syncLogId },
      data: {
        status: 'FAILED',
        completedAt: new Date(),
        error: error instanceof Error ? error.message : 'Unknown error',
      },
    })

    await prisma.dataConnector.update({
      where: { id: connectorId },
      data: {
        lastSyncStatus: 'FAILED',
        errorCount: { increment: 1 },
      },
    })
  }
}
