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

    if (!hasGWIPermission(session.admin.role, "services:projects:read")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const project = await prisma.serviceProject.findUnique({
      where: { id },
      include: {
        client: {
          select: { id: true, name: true, slug: true },
        },
        teamMembers: {
          include: {
            employee: {
              select: { id: true, firstName: true, lastName: true, email: true },
            },
          },
        },
        deliverables: {
          orderBy: { sortOrder: "asc" },
        },
        milestones: {
          orderBy: { dueDate: "asc" },
        },
        _count: {
          select: {
            timeEntries: true,
            invoiceLineItems: true,
          },
        },
      },
    })

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 })
    }

    return NextResponse.json(project)
  } catch (error) {
    console.error("Failed to fetch project:", error)
    return NextResponse.json(
      { error: "Failed to fetch project" },
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

    if (!hasGWIPermission(session.admin.role, "services:projects:write")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()

    const existing = await prisma.serviceProject.findUnique({
      where: { id },
    })

    if (!existing) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 })
    }

    const project = await prisma.serviceProject.update({
      where: { id },
      data: {
        ...(body.name !== undefined && { name: body.name }),
        ...(body.description !== undefined && { description: body.description }),
        ...(body.status !== undefined && { status: body.status }),
        ...(body.billingType !== undefined && { billingType: body.billingType }),
        ...(body.startDate !== undefined && {
          startDate: body.startDate ? new Date(body.startDate) : null,
        }),
        ...(body.endDate !== undefined && {
          endDate: body.endDate ? new Date(body.endDate) : null,
        }),
        ...(body.budgetAmount !== undefined && { budgetAmount: body.budgetAmount }),
        ...(body.budgetHours !== undefined && { budgetHours: body.budgetHours }),
        ...(body.defaultHourlyRate !== undefined && {
          defaultHourlyRate: body.defaultHourlyRate,
        }),
        ...(body.completionPercent !== undefined && {
          completionPercent: body.completionPercent,
        }),
        ...(body.projectManagerId !== undefined && {
          projectManagerId: body.projectManagerId,
        }),
        ...(body.notes !== undefined && { notes: body.notes }),
        ...(body.tags !== undefined && { tags: body.tags }),
      },
      include: {
        client: {
          select: { id: true, name: true, slug: true },
        },
        _count: {
          select: {
            teamMembers: true,
            deliverables: true,
            milestones: true,
            timeEntries: true,
          },
        },
      },
    })

    // Log the action
    await prisma.gWIAuditLog.create({
      data: {
        adminId: session.admin.id,
        action: "UPDATE_SERVICE_PROJECT",
        resourceType: "serviceProject",
        resourceId: id,
        previousState: existing,
        newState: project,
      },
    })

    return NextResponse.json(project)
  } catch (error) {
    console.error("Failed to update project:", error)
    return NextResponse.json(
      { error: "Failed to update project" },
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

    if (!hasGWIPermission(session.admin.role, "services:projects:manage")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const existing = await prisma.serviceProject.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            timeEntries: true,
            invoiceLineItems: true,
          },
        },
      },
    })

    if (!existing) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 })
    }

    if (existing._count.timeEntries > 0 || existing._count.invoiceLineItems > 0) {
      return NextResponse.json(
        {
          error:
            "Cannot delete project with time entries or invoices. Archive it instead.",
        },
        { status: 400 }
      )
    }

    await prisma.serviceProject.delete({
      where: { id },
    })

    // Log the action
    await prisma.gWIAuditLog.create({
      data: {
        adminId: session.admin.id,
        action: "DELETE_SERVICE_PROJECT",
        resourceType: "serviceProject",
        resourceId: id,
        previousState: existing,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to delete project:", error)
    return NextResponse.json(
      { error: "Failed to delete project" },
      { status: 500 }
    )
  }
}
