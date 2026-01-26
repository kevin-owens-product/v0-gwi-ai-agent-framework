import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { prisma } from "@/lib/db"
import { validateSuperAdminSession } from "@/lib/super-admin"
import { hasGWIPermission } from "@/lib/gwi-permissions"

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("adminToken")?.value

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const session = await validateSuperAdminSession(token)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (!hasGWIPermission(session.admin.role, "pipelines:read")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const pipelines = await prisma.dataPipeline.findMany({
      include: {
        createdBy: { select: { id: true, name: true } },
        _count: {
          select: { runs: true, validationRules: true },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(pipelines)
  } catch (error) {
    console.error("Failed to fetch pipelines:", error)
    return NextResponse.json(
      { error: "Failed to fetch pipelines" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("adminToken")?.value

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const session = await validateSuperAdminSession(token)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (!hasGWIPermission(session.admin.role, "pipelines:write")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()
    const { name, description, type, configuration, schedule, isActive = true } = body

    if (!name || !type || !configuration) {
      return NextResponse.json(
        { error: "Name, type, and configuration are required" },
        { status: 400 }
      )
    }

    const pipeline = await prisma.dataPipeline.create({
      data: {
        name,
        description,
        type,
        configuration,
        schedule,
        isActive,
        createdById: session.admin.id,
      },
      include: {
        createdBy: { select: { id: true, name: true } },
      },
    })

    await prisma.gWIAuditLog.create({
      data: {
        adminId: session.admin.id,
        action: "CREATE_PIPELINE",
        resourceType: "pipeline",
        resourceId: pipeline.id,
        newState: { name, type, schedule },
      },
    })

    return NextResponse.json(pipeline, { status: 201 })
  } catch (error) {
    console.error("Failed to create pipeline:", error)
    return NextResponse.json(
      { error: "Failed to create pipeline" },
      { status: 500 }
    )
  }
}
