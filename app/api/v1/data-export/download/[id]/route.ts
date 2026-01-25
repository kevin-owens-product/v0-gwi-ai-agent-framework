/**
 * @prompt-id forge-v4.1:feature:data-export:004
 * @generated-at 2026-01-25T00:00:00Z
 * @model claude-opus-4.5
 *
 * GET /api/v1/data-export/download/[id]
 *
 * Download a completed data export
 * Returns the export file as JSON for download
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { canDownloadExport, collectUserData } from '@/lib/data-export'
import { logAuditEvent, createAuditEventFromRequest } from '@/lib/audit'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: exportId } = await params

    // Authenticate user
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id

    // Check if export can be downloaded
    const { canDownload, reason } = await canDownloadExport(exportId, userId)

    if (!canDownload) {
      const statusCode = reason === 'Unauthorized' ? 403 : 400
      return NextResponse.json(
        { error: reason || 'Export not available for download' },
        { status: statusCode }
      )
    }

    // Get the export record
    const exportRecord = await prisma.dataExport.findUnique({
      where: { id: exportId },
    })

    if (!exportRecord || !exportRecord.userId) {
      return NextResponse.json({ error: 'Export not found' }, { status: 404 })
    }

    // Regenerate the export data (in production, this would be fetched from storage)
    const userData = await collectUserData(exportRecord.userId)

    // Update the export metadata
    userData.exportMetadata.exportId = exportId

    // Format as JSON
    const exportContent = JSON.stringify(userData, null, 2)

    // Log the download event
    const membership = await prisma.organizationMember.findFirst({
      where: { userId },
      select: { orgId: true },
    })

    if (membership) {
      await logAuditEvent(
        createAuditEventFromRequest(request, {
          orgId: membership.orgId,
          userId,
          action: 'export',
          resourceType: 'user',
          resourceId: exportId,
          metadata: {
            exportId,
            action: 'download',
            gdprRequest: true,
          },
        })
      )
    }

    // Return as downloadable JSON file
    const filename = `data-export-${exportId}-${new Date().toISOString().split('T')[0]}.json`

    return new NextResponse(exportContent, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': String(Buffer.byteLength(exportContent, 'utf8')),
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'X-Content-Type-Options': 'nosniff',
      },
    })
  } catch (error) {
    console.error('Data export download error:', error)
    return NextResponse.json(
      { error: 'Failed to download export' },
      { status: 500 }
    )
  }
}
