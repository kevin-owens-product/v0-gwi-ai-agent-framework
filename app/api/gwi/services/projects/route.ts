import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { prisma } from "@/lib/db"
import { validateSuperAdminSession } from "@/lib/super-admin"
import { hasGWIPermission } from "@/lib/gwi-permissions"

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

    if (!hasGWIPermission(session.admin.role, "services:projects:read")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get("status")
    const clientId = searchParams.get("clientId")
    const search = searchParams.get("search")

    const where: Record<string, unknown> = {}

    if (status && status !== "all") {
      where.status = status
    }

    if (clientId) {
      where.clientId = clientId
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { code: { contains: search, mode: "insensitive" } },
      ]
    }

    const projects = await prisma.serviceProject.findMany({
      where,
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
      orderBy: { createdAt: "desc" },
    })

    // Transform projects to ensure all fields are properly formatted
    const transformedProjects = projects.map((project) => ({
      ...project,
      completionPercent: project.completionPercent ?? 0,
      budgetAmount: project.budgetAmount ? project.budgetAmount.toString() : null,
      budgetHours: project.budgetHours ? project.budgetHours.toString() : null,
      defaultHourlyRate: project.defaultHourlyRate ? project.defaultHourlyRate.toString() : null,
    }))

    return NextResponse.json(transformedProjects)
  } catch (error) {
    console.error("Failed to fetch projects:", error)
    return NextResponse.json(
      { error: "Failed to fetch projects" },
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

    if (!hasGWIPermission(session.admin.role, "services:projects:write")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()
    const {
      clientId,
      name,
      description,
      status = "DRAFT",
      billingType = "TIME_MATERIALS",
      startDate,
      endDate,
      budgetAmount,
      budgetCurrency = "USD",
      budgetHours,
      defaultHourlyRate,
      projectManagerId,
      notes,
      tags = [],
    } = body

    if (!clientId || !name) {
      return NextResponse.json(
        { error: "Client and project name are required" },
        { status: 400 }
      )
    }

    // Generate project code
    const lastProject = await prisma.serviceProject.findFirst({
      orderBy: { createdAt: "desc" },
      select: { code: true },
    })

    let nextNumber = 1
    if (lastProject?.code) {
      const match = lastProject.code.match(/PRJ-(\d+)/)
      if (match) {
        nextNumber = parseInt(match[1]) + 1
      }
    }
    const code = `PRJ-${nextNumber.toString().padStart(4, "0")}`

    const project = await prisma.serviceProject.create({
      data: {
        clientId,
        name,
        code,
        description,
        status,
        billingType,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        budgetAmount,
        budgetCurrency,
        budgetHours,
        defaultHourlyRate,
        projectManagerId,
        notes,
        tags,
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
        action: "CREATE_SERVICE_PROJECT",
        resourceType: "serviceProject",
        resourceId: project.id,
        newState: { name, code, clientId, status },
      },
    })

    return NextResponse.json(project, { status: 201 })
  } catch (error) {
    console.error("Failed to create project:", error)
    return NextResponse.json(
      { error: "Failed to create project" },
      { status: 500 }
    )
  }
}
