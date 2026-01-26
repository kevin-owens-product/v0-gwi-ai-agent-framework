import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { prisma } from "@/lib/db"
import { validateSuperAdminSession } from "@/lib/super-admin"
import { hasGWIPermission } from "@/lib/gwi-permissions"

// Helper to sanitize data source response (hide sensitive credentials)
function sanitizeDataSource(dataSource: Record<string, unknown>) {
  return {
    ...dataSource,
    credentials: dataSource.credentials ? { encrypted: true } : null,
    connectionString: dataSource.connectionString ? "***" : null,
  }
}

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
      include: {
        createdBy: { select: { id: true, name: true, email: true } },
        organization: { select: { id: true, name: true, slug: true } },
      },
    })

    if (!dataSource) {
      return NextResponse.json({ error: "Data source not found" }, { status: 404 })
    }

    return NextResponse.json(sanitizeDataSource(dataSource as unknown as Record<string, unknown>))
  } catch (error) {
    console.error("Failed to fetch data source:", error)
    return NextResponse.json(
      { error: "Failed to fetch data source" },
      { status: 500 }
    )
  }
}

export async function PATCH(
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

    const existingDataSource = await prisma.gWIDataSourceConnection.findUnique({
      where: { id },
    })

    if (!existingDataSource) {
      return NextResponse.json({ error: "Data source not found" }, { status: 404 })
    }

    const body = await request.json()
    const {
      name,
      connectionString,
      configuration,
      credentials,
      isActive,
    } = body

    // Build update data object - only include fields that were provided
    const updateData: Record<string, unknown> = {}

    if (name !== undefined) {
      if (typeof name !== "string" || name.trim().length === 0) {
        return NextResponse.json(
          { error: "Name must be a non-empty string" },
          { status: 400 }
        )
      }
      updateData.name = name.trim()
    }

    if (connectionString !== undefined) {
      // Allow empty string to clear connection string, but validate non-empty strings
      if (connectionString !== "" && typeof connectionString !== "string") {
        return NextResponse.json(
          { error: "Connection string must be a string" },
          { status: 400 }
        )
      }
      updateData.connectionString = connectionString || null
    }

    if (configuration !== undefined) {
      if (typeof configuration !== "object" || configuration === null) {
        return NextResponse.json(
          { error: "Configuration must be an object" },
          { status: 400 }
        )
      }
      // Merge with existing configuration to preserve fields not being updated
      updateData.configuration = {
        ...(existingDataSource.configuration as Record<string, unknown>),
        ...configuration,
      }
    }

    if (credentials !== undefined) {
      // Allow null to clear credentials
      if (credentials !== null && (typeof credentials !== "object")) {
        return NextResponse.json(
          { error: "Credentials must be an object or null" },
          { status: 400 }
        )
      }

      if (credentials === null) {
        updateData.credentials = null
      } else {
        // Only update credentials if new values are provided
        // Check if any credential fields have non-empty values
        const hasNewCredentials = Object.values(credentials).some(
          (v) => v !== undefined && v !== ""
        )
        if (hasNewCredentials) {
          // Merge with existing credentials if any
          const existingCreds = existingDataSource.credentials as Record<string, unknown> || {}
          const newCreds = { ...existingCreds }

          // Only update fields that have non-empty values
          for (const [key, value] of Object.entries(credentials)) {
            if (value !== undefined && value !== "") {
              newCreds[key] = value
            }
          }
          updateData.credentials = newCreds
        }
      }
    }

    if (isActive !== undefined) {
      if (typeof isActive !== "boolean") {
        return NextResponse.json(
          { error: "isActive must be a boolean" },
          { status: 400 }
        )
      }
      updateData.isActive = isActive
    }

    // Perform the update
    const dataSource = await prisma.gWIDataSourceConnection.update({
      where: { id },
      data: updateData,
      include: {
        createdBy: { select: { id: true, name: true, email: true } },
        organization: { select: { id: true, name: true, slug: true } },
      },
    })

    // Log the action
    await prisma.gWIAuditLog.create({
      data: {
        adminId: session.admin.id,
        action: "UPDATE_DATA_SOURCE",
        resourceType: "data_source_connection",
        resourceId: dataSource.id,
        previousState: {
          name: existingDataSource.name,
          isActive: existingDataSource.isActive,
          // Don't log sensitive data
          hasCredentials: !!existingDataSource.credentials,
          hasConnectionString: !!existingDataSource.connectionString,
        },
        newState: {
          name: dataSource.name,
          isActive: dataSource.isActive,
          hasCredentials: !!dataSource.credentials,
          hasConnectionString: !!dataSource.connectionString,
        },
      },
    })

    return NextResponse.json(sanitizeDataSource(dataSource as unknown as Record<string, unknown>))
  } catch (error) {
    console.error("Failed to update data source:", error)
    return NextResponse.json(
      { error: "Failed to update data source" },
      { status: 500 }
    )
  }
}

export async function DELETE(
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

    if (!hasGWIPermission(session.admin.role, "datasources:delete")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const dataSource = await prisma.gWIDataSourceConnection.findUnique({
      where: { id },
    })

    if (!dataSource) {
      return NextResponse.json({ error: "Data source not found" }, { status: 404 })
    }

    // Delete the data source
    await prisma.gWIDataSourceConnection.delete({
      where: { id },
    })

    // Log the action
    await prisma.gWIAuditLog.create({
      data: {
        adminId: session.admin.id,
        action: "DELETE_DATA_SOURCE",
        resourceType: "data_source_connection",
        resourceId: id,
        previousState: {
          name: dataSource.name,
          type: dataSource.type,
          isActive: dataSource.isActive,
          orgId: dataSource.orgId,
        },
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to delete data source:", error)
    return NextResponse.json(
      { error: "Failed to delete data source" },
      { status: 500 }
    )
  }
}
