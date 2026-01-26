import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { prisma } from "@/lib/db"
import { validateSuperAdminSession } from "@/lib/super-admin"
import { hasGWIPermission } from "@/lib/gwi-permissions"

// Helper to get organization ID from request
function getOrganizationId(request: NextRequest): string | null {
  return request.headers.get("X-Organization-Id")
}

export async function GET(request: NextRequest) {
  try {
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

    const searchParams = request.nextUrl.searchParams
    const type = searchParams.get("type")
    const syncStatus = searchParams.get("syncStatus")
    const orgId = getOrganizationId(request)

    const where: Record<string, unknown> = {}

    // Filter by organization if provided
    if (orgId) {
      where.orgId = orgId
    }

    if (type) {
      where.type = type
    }

    if (syncStatus) {
      where.syncStatus = syncStatus
    }

    const dataSources = await prisma.gWIDataSourceConnection.findMany({
      where,
      include: {
        createdBy: { select: { id: true, name: true, email: true } },
        organization: { select: { id: true, name: true, slug: true } },
      },
      orderBy: { createdAt: "desc" },
    })

    // Remove sensitive credentials from response
    const sanitizedDataSources = dataSources.map((ds) => ({
      ...ds,
      credentials: ds.credentials ? { encrypted: true } : null,
      connectionString: ds.connectionString ? "***" : null,
    }))

    return NextResponse.json(sanitizedDataSources)
  } catch (error) {
    console.error("Failed to fetch data sources:", error)
    return NextResponse.json(
      { error: "Failed to fetch data sources" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
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

    const body = await request.json()
    const {
      name,
      type,
      connectionString,
      configuration,
      credentials,
      isActive = true,
      orgId,
    } = body
    const headerOrgId = getOrganizationId(request)
    const organizationId = orgId || headerOrgId

    if (!name || !type || !configuration) {
      return NextResponse.json(
        { error: "Name, type, and configuration are required" },
        { status: 400 }
      )
    }

    // Validate data source type
    const validTypes = [
      "postgresql",
      "mysql",
      "bigquery",
      "snowflake",
      "api",
      "s3",
      "salesforce",
      "mongodb",
    ]
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: `Invalid type. Must be one of: ${validTypes.join(", ")}` },
        { status: 400 }
      )
    }

    // Validate organization exists if provided
    if (organizationId) {
      const org = await prisma.organization.findUnique({
        where: { id: organizationId },
      })
      if (!org) {
        return NextResponse.json(
          { error: "Organization not found" },
          { status: 404 }
        )
      }
    }

    const dataSource = await prisma.gWIDataSourceConnection.create({
      data: {
        name,
        type,
        connectionString,
        configuration,
        credentials,
        isActive,
        createdById: session.admin.id,
        orgId: organizationId,
      },
      include: {
        createdBy: { select: { id: true, name: true, email: true } },
        organization: { select: { id: true, name: true, slug: true } },
      },
    })

    await prisma.gWIAuditLog.create({
      data: {
        adminId: session.admin.id,
        action: "CREATE_DATA_SOURCE",
        resourceType: "data_source_connection",
        resourceId: dataSource.id,
        newState: { name, type, isActive, orgId: organizationId },
      },
    })

    // Remove sensitive data from response
    const sanitizedDataSource = {
      ...dataSource,
      credentials: dataSource.credentials ? { encrypted: true } : null,
      connectionString: dataSource.connectionString ? "***" : null,
    }

    return NextResponse.json(sanitizedDataSource, { status: 201 })
  } catch (error) {
    console.error("Failed to create data source:", error)
    return NextResponse.json(
      { error: "Failed to create data source" },
      { status: 500 }
    )
  }
}
