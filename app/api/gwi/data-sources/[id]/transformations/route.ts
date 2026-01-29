import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { prisma } from "@/lib/db"
import { validateSuperAdminSession } from "@/lib/super-admin"
import { hasGWIPermission } from "@/lib/gwi-permissions"

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
        configuration: true,
      },
    })

    if (!dataSource) {
      return NextResponse.json(
        { error: "Data source not found" },
        { status: 404 }
      )
    }

    // In a real implementation, transformations would be stored in a separate table
    // For now, return empty array
    return NextResponse.json({
      dataSource: {
        id: dataSource.id,
        name: dataSource.name,
        type: dataSource.type,
      },
      transformations: [],
    })
  } catch (error) {
    console.error("Failed to fetch transformations:", error)
    return NextResponse.json(
      { error: "Failed to fetch transformations" },
      { status: 500 }
    )
  }
}

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

    const dataSource = await prisma.gWIDataSourceConnection.findUnique({
      where: { id },
    })

    if (!dataSource) {
      return NextResponse.json(
        { error: "Data source not found" },
        { status: 404 }
      )
    }

    const body = await request.json()
    const { name, type, config } = body

    if (!name || !type || !config) {
      return NextResponse.json(
        { error: "Name, type, and config are required" },
        { status: 400 }
      )
    }

    // In a real implementation, this would create a transformation rule
    // For now, return success
    return NextResponse.json({
      success: true,
      message: "Transformation created (stub implementation)",
      transformation: {
        id: "temp-id",
        name,
        type,
        config,
      },
    })
  } catch (error) {
    console.error("Failed to create transformation:", error)
    return NextResponse.json(
      { error: "Failed to create transformation" },
      { status: 500 }
    )
  }
}
