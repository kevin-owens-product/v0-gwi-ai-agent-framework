import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { prisma } from "@/lib/db"
import { validateSuperAdminSession } from "@/lib/super-admin"
import { hasGWIPermission } from "@/lib/gwi-permissions"

export async function GET(
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

    if (!hasGWIPermission(session.admin.role, "pipelines:read")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const pipeline = await prisma.dataPipeline.findUnique({
      where: { id },
      include: {
        createdBy: { select: { id: true, name: true, email: true } },
        organization: { select: { id: true, name: true, slug: true } },
        runs: {
          take: 10,
          orderBy: { startedAt: "desc" },
        },
        validationRules: {
          orderBy: { createdAt: "desc" },
        },
        _count: {
          select: {
            runs: true,
            validationRules: true,
          },
        },
      },
    })

    if (!pipeline) {
      return NextResponse.json({ error: "Pipeline not found" }, { status: 404 })
    }

    return NextResponse.json(pipeline)
  } catch (error) {
    console.error("Failed to fetch pipeline:", error)
    return NextResponse.json(
      { error: "Failed to fetch pipeline" },
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

    if (!hasGWIPermission(session.admin.role, "pipelines:write")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const existingPipeline = await prisma.dataPipeline.findUnique({
      where: { id },
    })

    if (!existingPipeline) {
      return NextResponse.json({ error: "Pipeline not found" }, { status: 404 })
    }

    const body = await request.json()
    const { name, description, type, configuration, schedule, isActive } = body

    // Validate required fields if provided
    if (name !== undefined && !name.trim()) {
      return NextResponse.json(
        { error: "Pipeline name cannot be empty" },
        { status: 400 }
      )
    }

    if (type !== undefined) {
      const validTypes = ["ETL", "TRANSFORMATION", "AGGREGATION", "EXPORT", "SYNC"]
      if (!validTypes.includes(type)) {
        return NextResponse.json(
          { error: `Invalid pipeline type. Must be one of: ${validTypes.join(", ")}` },
          { status: 400 }
        )
      }
    }

    if (configuration !== undefined && typeof configuration !== "object") {
      return NextResponse.json(
        { error: "Configuration must be a valid JSON object" },
        { status: 400 }
      )
    }

    if (schedule !== undefined && schedule !== null && schedule !== "") {
      // Basic cron validation: should have 5 parts
      const cronParts = schedule.trim().split(/\s+/)
      if (cronParts.length !== 5) {
        return NextResponse.json(
          { error: "Invalid cron schedule. Must have 5 parts (minute hour day month weekday)" },
          { status: 400 }
        )
      }
    }

    const updateData: Record<string, unknown> = {}
    if (name !== undefined) updateData.name = name.trim()
    if (description !== undefined) updateData.description = description?.trim() || null
    if (type !== undefined) updateData.type = type
    if (configuration !== undefined) updateData.configuration = configuration
    if (schedule !== undefined) updateData.schedule = schedule || null
    if (isActive !== undefined) updateData.isActive = isActive

    const pipeline = await prisma.dataPipeline.update({
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
        action: "UPDATE_PIPELINE",
        resourceType: "pipeline",
        resourceId: pipeline.id,
        previousState: {
          name: existingPipeline.name,
          description: existingPipeline.description,
          type: existingPipeline.type,
          schedule: existingPipeline.schedule,
          isActive: existingPipeline.isActive,
        },
        newState: updateData,
      },
    })

    return NextResponse.json(pipeline)
  } catch (error) {
    console.error("Failed to update pipeline:", error)
    return NextResponse.json(
      { error: "Failed to update pipeline" },
      { status: 500 }
    )
  }
}

export async function DELETE(
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

    if (!hasGWIPermission(session.admin.role, "pipelines:delete")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const pipeline = await prisma.dataPipeline.findUnique({
      where: { id },
    })

    if (!pipeline) {
      return NextResponse.json({ error: "Pipeline not found" }, { status: 404 })
    }

    // Delete the pipeline (cascade will delete runs and validation rules)
    await prisma.dataPipeline.delete({
      where: { id },
    })

    // Log the action
    await prisma.gWIAuditLog.create({
      data: {
        adminId: session.admin.id,
        action: "DELETE_PIPELINE",
        resourceType: "pipeline",
        resourceId: id,
        previousState: {
          name: pipeline.name,
          description: pipeline.description,
          type: pipeline.type,
          schedule: pipeline.schedule,
          isActive: pipeline.isActive,
        },
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to delete pipeline:", error)
    return NextResponse.json(
      { error: "Failed to delete pipeline" },
      { status: 500 }
    )
  }
}
