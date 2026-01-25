/**
 * @prompt-id forge-v4.1:feature:data-export:003
 * @generated-at 2026-01-25T00:00:00Z
 * @model claude-opus-4.5
 *
 * GET /api/v1/data-export/status
 *
 * Check the status of data export requests
 * Returns all exports for the authenticated user or a specific export by ID
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getExportStatus, getUserExports } from '@/lib/data-export'

export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id
    const searchParams = request.nextUrl.searchParams
    const exportId = searchParams.get('id')

    // If specific export ID is provided, return that export
    if (exportId) {
      const exportRecord = await getExportStatus(exportId, userId)

      if (!exportRecord) {
        return NextResponse.json(
          { error: 'Export not found or unauthorized' },
          { status: 404 }
        )
      }

      // Calculate progress based on status
      let progress = 0
      switch (exportRecord.status) {
        case 'PENDING':
          progress = 10
          break
        case 'PROCESSING':
          progress = 50
          break
        case 'COMPLETED':
          progress = 100
          break
        case 'FAILED':
        case 'EXPIRED':
        case 'CANCELLED':
          progress = 0
          break
      }

      return NextResponse.json({
        export: {
          ...exportRecord,
          progress,
          downloadAvailable: exportRecord.status === 'COMPLETED' &&
            exportRecord.expiresAt &&
            new Date() < new Date(exportRecord.expiresAt),
        },
      })
    }

    // Return all exports for the user
    const exports = await getUserExports(userId)

    // Calculate summary statistics
    const stats = {
      total: exports.length,
      pending: exports.filter((e) => e.status === 'PENDING').length,
      processing: exports.filter((e) => e.status === 'PROCESSING').length,
      completed: exports.filter((e) => e.status === 'COMPLETED').length,
      failed: exports.filter((e) => e.status === 'FAILED').length,
      expired: exports.filter((e) => e.status === 'EXPIRED').length,
    }

    // Add download availability to each export
    const exportsWithDownloadStatus = exports.map((exp) => ({
      ...exp,
      downloadAvailable:
        exp.status === 'COMPLETED' &&
        exp.expiresAt &&
        new Date() < new Date(exp.expiresAt),
    }))

    return NextResponse.json({
      exports: exportsWithDownloadStatus,
      stats,
    })
  } catch (error) {
    console.error('Data export status error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch export status' },
      { status: 500 }
    )
  }
}
