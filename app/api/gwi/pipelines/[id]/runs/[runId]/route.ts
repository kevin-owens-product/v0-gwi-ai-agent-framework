import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { prisma } from "@/lib/db"
import { validateSuperAdminSession } from "@/lib/super-admin"
import { hasGWIPermission } from "@/lib/gwi-permissions"

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; runId: string }> }
) {
  try {
    const { id, runId } = await params
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

    const run = await prisma.pipelineRun.findUnique({
      where: { id: runId },
      include: {
        pipeline: {
          select: {
            id: true,
            name: true,
            type: true,
            description: true,
            configuration: true,
            schedule: true,
            isActive: true,
          },
        },
      },
    })

    if (!run) {
      return NextResponse.json({ error: "Pipeline run not found" }, { status: 404 })
    }

    // Verify the run belongs to the specified pipeline
    if (run.pipelineId !== id) {
      return NextResponse.json({ error: "Pipeline run not found" }, { status: 404 })
    }

    return NextResponse.json(run)
  } catch (error) {
    console.error("Failed to fetch pipeline run:", error)
    return NextResponse.json(
      { error: "Failed to fetch pipeline run" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; runId: string }> }
) {
  try {
    const { id, runId } = await params
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

    const run = await prisma.pipelineRun.findUnique({
      where: { id: runId },
      include: {
        pipeline: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    if (!run) {
      return NextResponse.json({ error: "Pipeline run not found" }, { status: 404 })
    }

    // Verify the run belongs to the specified pipeline
    if (run.pipelineId !== id) {
      return NextResponse.json({ error: "Pipeline run not found" }, { status: 404 })
    }

    // Can only cancel pending or running pipelines
    if (!["PENDING", "RUNNING"].includes(run.status)) {
      return NextResponse.json(
        { error: `Cannot cancel a pipeline run with status: ${run.status}` },
        { status: 400 }
      )
    }

    // Update the run status to cancelled
    const cancelledRun = await prisma.pipelineRun.update({
      where: { id: runId },
      data: {
        status: "CANCELLED",
        completedAt: new Date(),
        errorLog: [
          ...(Array.isArray(run.errorLog) ? run.errorLog : []),
          {
            timestamp: new Date().toISOString(),
            level: "INFO",
            message: `Pipeline run cancelled by ${session.admin.name || session.admin.email}`,
          },
        ],
      },
    })

    // Log the action
    await prisma.gWIAuditLog.create({
      data: {
        adminId: session.admin.id,
        action: "CANCEL_PIPELINE_RUN",
        resourceType: "pipeline_run",
        resourceId: runId,
        previousState: {
          status: run.status,
        },
        newState: {
          status: "CANCELLED",
          cancelledAt: cancelledRun.completedAt,
          pipelineId: id,
          pipelineName: run.pipeline.name,
        },
      },
    })

    return NextResponse.json(cancelledRun)
  } catch (error) {
    console.error("Failed to cancel pipeline run:", error)
    return NextResponse.json(
      { error: "Failed to cancel pipeline run" },
      { status: 500 }
    )
  }
}
