import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { prisma } from "@/lib/db"
import { Prisma } from "@prisma/client"
import { validateSuperAdminSession } from "@/lib/super-admin"
import { hasGWIPermission } from "@/lib/gwi-permissions"

/**
 * GET /api/gwi/data-sources/[id]/sync
 * Get the current sync status for a data source
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const cookieStore = await cookies()
    const token = cookieStore.get("gwiToken")?.value

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const session = await validateSuperAdminSession(token)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (!hasGWIPermission(session.admin.role, "datasources:read")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const dataSource = await prisma.gWIDataSourceConnection.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        type: true,
        syncStatus: true,
        lastSyncAt: true,
        errorLog: true,
        isActive: true,
      },
    })

    if (!dataSource) {
      return NextResponse.json(
        { error: "Data source not found" },
        { status: 404 }
      )
    }

    // Calculate sync health based on status and error log
    const syncHealth = calculateSyncHealth(dataSource)

    return NextResponse.json({
      id: dataSource.id,
      name: dataSource.name,
      type: dataSource.type,
      syncStatus: dataSource.syncStatus,
      lastSyncAt: dataSource.lastSyncAt,
      isActive: dataSource.isActive,
      syncHealth,
      errorLog: dataSource.errorLog,
    })
  } catch (error) {
    console.error("Failed to fetch data source sync status:", error)
    return NextResponse.json(
      { error: "Failed to fetch sync status" },
      { status: 500 }
    )
  }
}

/**
 * POST /api/gwi/data-sources/[id]/sync
 * Trigger a sync for a data source
 *
 * Request body (optional):
 * - fullSync: boolean - Whether to perform a full sync (default: false, incremental)
 * - options: object - Additional sync options
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const cookieStore = await cookies()
    const token = cookieStore.get("gwiToken")?.value

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const session = await validateSuperAdminSession(token)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (!hasGWIPermission(session.admin.role, "datasources:write")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Fetch the data source
    const dataSource = await prisma.gWIDataSourceConnection.findUnique({
      where: { id },
    })

    if (!dataSource) {
      return NextResponse.json(
        { error: "Data source not found" },
        { status: 404 }
      )
    }

    // Check if data source is active
    if (!dataSource.isActive) {
      return NextResponse.json(
        { error: "Data source is not active. Enable it before syncing." },
        { status: 400 }
      )
    }

    // Check if a sync is already in progress
    if (dataSource.syncStatus === "syncing") {
      return NextResponse.json(
        { error: "A sync is already in progress for this data source" },
        { status: 409 }
      )
    }

    // Parse request body
    let fullSync = false
    let options: Record<string, unknown> = {}

    try {
      const body = await request.json()
      fullSync = body.fullSync === true
      options = body.options || {}
    } catch {
      // Empty body is acceptable
    }

    // Update sync status to syncing
    const updatedDataSource = await prisma.gWIDataSourceConnection.update({
      where: { id },
      data: {
        syncStatus: "syncing",
        errorLog: undefined, // Clear previous errors by setting to undefined (keeps existing value)
      },
    })

    // Log the sync trigger action
    await prisma.gWIAuditLog.create({
      data: {
        adminId: session.admin.id,
        action: "TRIGGER_DATA_SOURCE_SYNC",
        resourceType: "data_source_connection",
        resourceId: dataSource.id,
        newState: {
          name: dataSource.name,
          type: dataSource.type,
          fullSync,
          options,
          previousStatus: dataSource.syncStatus,
          previousSyncAt: dataSource.lastSyncAt?.toISOString() ?? null,
        } as Prisma.InputJsonValue,
      },
    })

    // Start the sync process asynchronously
    // In production, this would trigger an actual sync job/worker
    startSyncProcess(id, fullSync, options, session.admin.id).catch((error) => {
      console.error("Sync process failed:", error)
    })

    return NextResponse.json({
      message: "Sync triggered successfully",
      dataSource: {
        id: updatedDataSource.id,
        name: updatedDataSource.name,
        type: updatedDataSource.type,
        syncStatus: updatedDataSource.syncStatus,
      },
      syncType: fullSync ? "full" : "incremental",
      triggeredAt: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Failed to trigger data source sync:", error)
    return NextResponse.json(
      { error: "Failed to trigger sync" },
      { status: 500 }
    )
  }
}

/**
 * Calculate sync health based on status and error history
 */
function calculateSyncHealth(dataSource: {
  syncStatus: string
  lastSyncAt: Date | null
  errorLog: unknown
  isActive: boolean
}): "healthy" | "warning" | "error" | "unknown" {
  if (!dataSource.isActive) {
    return "unknown"
  }

  if (dataSource.syncStatus === "error" || dataSource.errorLog) {
    return "error"
  }

  if (dataSource.syncStatus === "syncing") {
    return "healthy"
  }

  if (!dataSource.lastSyncAt) {
    return "warning"
  }

  // Check if last sync was more than 24 hours ago
  const lastSyncTime = new Date(dataSource.lastSyncAt).getTime()
  const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000

  if (lastSyncTime < oneDayAgo) {
    return "warning"
  }

  return "healthy"
}

/**
 * Simulates the sync process
 * In production, this would connect to actual data sources and perform real syncs
 */
async function startSyncProcess(
  dataSourceId: string,
  fullSync: boolean,
  options: Record<string, unknown>,
  adminId: string
): Promise<void> {
  // Simulate sync duration based on sync type
  const syncDuration = fullSync ? 5000 : 2000

  await new Promise((resolve) => setTimeout(resolve, syncDuration))

  // Simulate success/failure (90% success rate for demo)
  const success = Math.random() > 0.1

  try {
    if (success) {
      // Update data source with successful sync
      await prisma.gWIDataSourceConnection.update({
        where: { id: dataSourceId },
        data: {
          syncStatus: "completed",
          lastSyncAt: new Date(),
          errorLog: Prisma.JsonNull,
        },
      })

      // Log successful sync
      await prisma.gWIAuditLog.create({
        data: {
          adminId,
          action: "DATA_SOURCE_SYNC_COMPLETED",
          resourceType: "data_source_connection",
          resourceId: dataSourceId,
          newState: {
            fullSync,
            options,
            completedAt: new Date().toISOString(),
            duration: syncDuration,
          } as Prisma.InputJsonValue,
        },
      })
    } else {
      // Simulate sync failure
      const errorMessage = "Connection timeout while fetching data"
      const errorLog = {
        message: errorMessage,
        timestamp: new Date().toISOString(),
        details: {
          fullSync,
          options,
          stage: "data_fetch",
        },
      } as Prisma.InputJsonValue

      await prisma.gWIDataSourceConnection.update({
        where: { id: dataSourceId },
        data: {
          syncStatus: "error",
          errorLog,
        },
      })

      // Log failed sync
      await prisma.gWIAuditLog.create({
        data: {
          adminId,
          action: "DATA_SOURCE_SYNC_FAILED",
          resourceType: "data_source_connection",
          resourceId: dataSourceId,
          newState: {
            fullSync,
            options,
            failedAt: new Date().toISOString(),
            error: errorMessage,
          } as Prisma.InputJsonValue,
        },
      })
    }
  } catch (error) {
    console.error("Error updating sync status:", error)

    // Attempt to set error status
    try {
      await prisma.gWIDataSourceConnection.update({
        where: { id: dataSourceId },
        data: {
          syncStatus: "error",
          errorLog: {
            message: "Internal error during sync process",
            timestamp: new Date().toISOString(),
          },
        },
      })
    } catch {
      // If this also fails, just log it
      console.error("Failed to update error status")
    }
  }
}
