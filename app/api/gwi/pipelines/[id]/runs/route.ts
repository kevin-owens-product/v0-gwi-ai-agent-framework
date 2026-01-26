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

    // Verify the pipeline exists
    const pipeline = await prisma.dataPipeline.findUnique({
      where: { id },
    })

    if (!pipeline) {
      return NextResponse.json({ error: "Pipeline not found" }, { status: 404 })
    }

    // Parse query parameters for filtering and pagination
    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 100)
    const offset = parseInt(searchParams.get("offset") || "0")

    const where: Record<string, unknown> = {
      pipelineId: id,
    }

    if (status && ["PENDING", "RUNNING", "COMPLETED", "FAILED", "CANCELLED"].includes(status)) {
      where.status = status
    }

    const [runs, total] = await Promise.all([
      prisma.pipelineRun.findMany({
        where,
        orderBy: { startedAt: "desc" },
        take: limit,
        skip: offset,
      }),
      prisma.pipelineRun.count({ where }),
    ])

    return NextResponse.json({
      runs,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + runs.length < total,
      },
    })
  } catch (error) {
    console.error("Failed to fetch pipeline runs:", error)
    return NextResponse.json(
      { error: "Failed to fetch pipeline runs" },
      { status: 500 }
    )
  }
}

export async function POST(
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

    if (!hasGWIPermission(session.admin.role, "pipelines:write")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Verify the pipeline exists and is active
    const pipeline = await prisma.dataPipeline.findUnique({
      where: { id },
    })

    if (!pipeline) {
      return NextResponse.json({ error: "Pipeline not found" }, { status: 404 })
    }

    if (!pipeline.isActive) {
      return NextResponse.json(
        { error: "Cannot trigger a run for an inactive pipeline" },
        { status: 400 }
      )
    }

    // Check if there's already a running execution
    const runningRun = await prisma.pipelineRun.findFirst({
      where: {
        pipelineId: id,
        status: { in: ["PENDING", "RUNNING"] },
      },
    })

    if (runningRun) {
      return NextResponse.json(
        { error: "Pipeline already has a pending or running execution" },
        { status: 409 }
      )
    }

    // Create a new pipeline run
    const run = await prisma.pipelineRun.create({
      data: {
        pipelineId: id,
        status: "PENDING",
        startedAt: new Date(),
      },
    })

    // Log the action
    await prisma.gWIAuditLog.create({
      data: {
        adminId: session.admin.id,
        action: "TRIGGER_PIPELINE_RUN",
        resourceType: "pipeline_run",
        resourceId: run.id,
        newState: {
          pipelineId: id,
          pipelineName: pipeline.name,
          triggeredAt: run.startedAt,
        },
      },
    })

    return NextResponse.json(run, { status: 201 })
  } catch (error) {
    console.error("Failed to trigger pipeline run:", error)
    return NextResponse.json(
      { error: "Failed to trigger pipeline run" },
      { status: 500 }
    )
  }
}
