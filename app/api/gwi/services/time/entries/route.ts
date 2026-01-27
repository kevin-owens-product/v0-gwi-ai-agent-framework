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

    if (!hasGWIPermission(session.admin.role, "services:time:read")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get("status")
    const projectId = searchParams.get("projectId")
    const employeeId = searchParams.get("employeeId")
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")

    const where: Record<string, unknown> = {}

    if (status && status !== "all") {
      where.status = status
    }

    if (projectId) {
      where.projectId = projectId
    }

    if (employeeId) {
      where.employeeId = employeeId
    }

    if (startDate || endDate) {
      where.date = {}
      if (startDate) {
        (where.date as Record<string, unknown>).gte = new Date(startDate)
      }
      if (endDate) {
        (where.date as Record<string, unknown>).lte = new Date(endDate)
      }
    }

    const entries = await prisma.timeEntry.findMany({
      where,
      include: {
        employee: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        project: {
          select: { id: true, name: true, code: true },
        },
      },
      orderBy: { date: "desc" },
    })

    return NextResponse.json(entries)
  } catch (error) {
    console.error("Failed to fetch time entries:", error)
    return NextResponse.json(
      { error: "Failed to fetch time entries" },
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

    if (!hasGWIPermission(session.admin.role, "services:time:write")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()
    const {
      employeeId,
      projectId,
      date,
      hours,
      description,
      category,
      isBillable = true,
      hourlyRate,
      status = "DRAFT",
    } = body

    if (!employeeId || !date || !hours || !description) {
      return NextResponse.json(
        { error: "Employee, date, hours, and description are required" },
        { status: 400 }
      )
    }

    const entry = await prisma.timeEntry.create({
      data: {
        employeeId,
        projectId,
        date: new Date(date),
        hours,
        description,
        category,
        isBillable,
        hourlyRate,
        status,
      },
      include: {
        employee: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        project: {
          select: { id: true, name: true, code: true },
        },
      },
    })

    // Log the action
    await prisma.gWIAuditLog.create({
      data: {
        adminId: session.admin.id,
        action: "CREATE_TIME_ENTRY",
        resourceType: "timeEntry",
        resourceId: entry.id,
        newState: { employeeId, projectId, date, hours },
      },
    })

    return NextResponse.json(entry, { status: 201 })
  } catch (error) {
    console.error("Failed to create time entry:", error)
    return NextResponse.json(
      { error: "Failed to create time entry" },
      { status: 500 }
    )
  }
}
