/**
 * @prompt-id forge-v4.1:feature:data-export:002
 * @generated-at 2026-01-25T00:00:00Z
 * @model claude-opus-4.5
 *
 * POST /api/v1/data-export/request
 *
 * GDPR Data Export Request API
 * Allows users to request an export of their personal data
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { createExportRequest, generateExport } from '@/lib/data-export'
import { logAuditEvent, createAuditEventFromRequest } from '@/lib/audit'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id

    // Get request body (optional parameters)
    let body: { type?: 'GDPR_REQUEST' | 'USER_DATA_REQUEST' } = {}
    try {
      body = await request.json()
    } catch {
      // No body provided, use defaults
    }

    const exportType = body.type || 'GDPR_REQUEST'

    // Validate export type
    if (!['GDPR_REQUEST', 'USER_DATA_REQUEST'].includes(exportType)) {
      return NextResponse.json(
        { error: 'Invalid export type. Must be GDPR_REQUEST or USER_DATA_REQUEST' },
        { status: 400 }
      )
    }

    // Check rate limiting - max 1 export per 24 hours
    const recentExport = await prisma.dataExport.findFirst({
      where: {
        userId,
        createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
        status: { notIn: ['FAILED', 'CANCELLED'] },
      },
    })

    if (recentExport) {
      return NextResponse.json(
        {
          error: 'Rate limit exceeded',
          message: 'You can only request one data export per 24 hours',
          existingExportId: recentExport.id,
          existingExportStatus: recentExport.status,
        },
        { status: 429 }
      )
    }

    // Create the export request
    const exportRecord = await createExportRequest(userId, exportType)

    // Get user's organization for audit logging
    const membership = await prisma.organizationMember.findFirst({
      where: { userId },
      select: { orgId: true },
    })

    // Log the export request
    if (membership) {
      await logAuditEvent(
        createAuditEventFromRequest(request, {
          orgId: membership.orgId,
          userId,
          action: 'export',
          resourceType: 'user',
          resourceId: userId,
          metadata: {
            exportId: exportRecord.id,
            exportType,
            gdprRequest: true,
          },
        })
      )
    }

    // Start processing the export asynchronously
    // In production, this would be handled by a job queue
    generateExport(userId, exportRecord.id).catch((error) => {
      console.error('Background export failed:', error)
    })

    return NextResponse.json(
      {
        success: true,
        export: {
          id: exportRecord.id,
          status: exportRecord.status,
          type: exportRecord.type,
          format: exportRecord.format,
          createdAt: exportRecord.createdAt,
          expiresAt: exportRecord.expiresAt,
        },
        message:
          'Your data export request has been submitted. You will be notified when it is ready for download. GDPR requires processing within 30 days, but most exports complete within a few minutes.',
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Data export request error:', error)

    if (error instanceof Error && error.message === 'An export request is already in progress') {
      return NextResponse.json(
        { error: 'An export request is already in progress' },
        { status: 409 }
      )
    }

    return NextResponse.json({ error: 'Failed to create data export request' }, { status: 500 })
  }
}
