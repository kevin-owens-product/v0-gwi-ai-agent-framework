/**
 * @prompt-id forge-v4.1:feature:scheduled-exports:003
 * @generated-at 2026-01-25T00:00:00Z
 * @model claude-opus-4.5
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { getUserMembership, getValidatedOrgId } from '@/lib/tenant'
import { hasPermission } from '@/lib/permissions'
import { logAuditEvent, createAuditEventFromRequest } from '@/lib/audit'
import { recordUsage } from '@/lib/billing'
import { Prisma } from '@prisma/client'

// POST /api/v1/scheduled-exports/[id]/run - Trigger an immediate export run
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

    if (!hasPermission(membership.role, 'exports:execute')) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 })
    }

    // Check scheduled export exists and belongs to user
    const scheduledExport = await prisma.scheduledExport.findFirst({
      where: { id, orgId, userId: session.user.id },
    })

    if (!scheduledExport) {
      return NextResponse.json({ error: 'Scheduled export not found' }, { status: 404 })
    }

    // Create export history entry for this run
    const exportHistory = await prisma.exportHistory.create({
      data: {
        scheduledExportId: id,
        status: 'PENDING',
        format: scheduledExport.format,
        recipientCount: scheduledExport.recipients.length,
        metadata: {
          triggeredManually: true,
          triggeredBy: session.user.id,
        } as Prisma.InputJsonValue,
      },
    })

    // Log audit event
    await logAuditEvent(createAuditEventFromRequest(request, {
      orgId,
      userId: session.user.id,
      action: 'execute',
      resourceType: 'scheduled_export',
      resourceId: id,
      metadata: { historyId: exportHistory.id },
    }))

    // Record usage
    await recordUsage(orgId, 'API_CALLS', 1)

    // Start export process in background
    executeExport(exportHistory.id, scheduledExport)

    return NextResponse.json({
      data: {
        historyId: exportHistory.id,
        status: 'PENDING',
        message: 'Export started successfully',
      },
    }, { status: 202 })
  } catch (error) {
    console.error('Error triggering export run:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Background export execution
async function executeExport(
  historyId: string,
  scheduledExport: {
    id: string
    name: string
    entityType: string
    entityId: string
    format: string
    recipients: string[]
    metadata: Prisma.JsonValue
  }
) {
  try {
    // Update status to PROCESSING
    await prisma.exportHistory.update({
      where: { id: historyId },
      data: { status: 'PROCESSING' },
    })

    const startTime = Date.now()

    // Simulate export generation (in production, this would call actual export service)
    // Based on entityType, fetch the data and generate the export file
    await new Promise(resolve => setTimeout(resolve, 2000)) // Simulate processing time

    // Generate file URL (in production, this would be a real storage URL)
    const fileUrl = `/exports/${scheduledExport.id}/${historyId}.${scheduledExport.format.toLowerCase()}`
    const fileSize = Math.floor(Math.random() * 1000000) + 10000 // Simulated file size

    // Update export history with success
    await prisma.exportHistory.update({
      where: { id: historyId },
      data: {
        status: 'COMPLETED',
        fileUrl,
        fileSize,
        completedAt: new Date(),
        metadata: {
          processingTimeMs: Date.now() - startTime,
          entityType: scheduledExport.entityType,
          entityId: scheduledExport.entityId,
        } as Prisma.InputJsonValue,
      },
    })

    // Update scheduled export with last run info
    await prisma.scheduledExport.update({
      where: { id: scheduledExport.id },
      data: {
        lastRunAt: new Date(),
        lastStatus: 'COMPLETED',
        lastError: null,
      },
    })

    // Send to recipients (in production, this would send emails)
    if (scheduledExport.recipients.length > 0) {
      console.log(`Sending export to ${scheduledExport.recipients.length} recipients:`, scheduledExport.recipients)
      // await sendExportEmail(scheduledExport.recipients, fileUrl, scheduledExport.name)
    }

  } catch (error) {
    console.error('Export execution error:', error)

    // Update export history with failure
    await prisma.exportHistory.update({
      where: { id: historyId },
      data: {
        status: 'FAILED',
        error: error instanceof Error ? error.message : 'Unknown error',
        completedAt: new Date(),
      },
    })

    // Update scheduled export with last error
    await prisma.scheduledExport.update({
      where: { id: scheduledExport.id },
      data: {
        lastRunAt: new Date(),
        lastStatus: 'FAILED',
        lastError: error instanceof Error ? error.message : 'Unknown error',
      },
    })
  }
}
