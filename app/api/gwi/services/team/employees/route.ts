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

    if (!hasGWIPermission(session.admin.role, "services:team:read")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get("status")
    const departmentId = searchParams.get("departmentId")
    const search = searchParams.get("search")

    const where: Record<string, unknown> = {}

    if (status && status !== "all") {
      where.status = status
    }

    if (departmentId) {
      where.departmentId = departmentId
    }

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: "insensitive" } },
        { lastName: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ]
    }

    const employees = await prisma.serviceEmployee.findMany({
      where,
      include: {
        department: {
          select: { id: true, name: true, code: true },
        },
        role: {
          select: { id: true, name: true, code: true },
        },
        manager: {
          select: { id: true, firstName: true, lastName: true },
        },
        _count: {
          select: {
            skills: true,
            projectAssignments: true,
            timeEntries: true,
          },
        },
      },
      orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
    })

    return NextResponse.json(employees)
  } catch (error) {
    console.error("Failed to fetch employees:", error)
    return NextResponse.json(
      { error: "Failed to fetch employees" },
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

    if (!hasGWIPermission(session.admin.role, "services:team:write")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()
    const {
      firstName,
      lastName,
      email,
      phone,
      status = "ACTIVE",
      employmentType = "FULL_TIME",
      departmentId,
      roleId,
      managerId,
      hireDate,
      hourlyRate,
      annualSalary,
      weeklyCapacityHours = 40,
    } = body

    if (!firstName || !lastName || !email) {
      return NextResponse.json(
        { error: "First name, last name, and email are required" },
        { status: 400 }
      )
    }

    // Check for duplicate email
    const existing = await prisma.serviceEmployee.findUnique({
      where: { email },
    })

    if (existing) {
      return NextResponse.json(
        { error: "An employee with this email already exists" },
        { status: 400 }
      )
    }

    const employee = await prisma.serviceEmployee.create({
      data: {
        firstName,
        lastName,
        email,
        phone,
        status,
        employmentType,
        departmentId,
        roleId,
        managerId,
        hireDate: hireDate ? new Date(hireDate) : null,
        hourlyRate,
        annualSalary,
        weeklyCapacityHours,
      },
      include: {
        department: {
          select: { id: true, name: true, code: true },
        },
        role: {
          select: { id: true, name: true, code: true },
        },
        manager: {
          select: { id: true, firstName: true, lastName: true },
        },
        _count: {
          select: {
            skills: true,
            projectAssignments: true,
            timeEntries: true,
          },
        },
      },
    })

    // Log the action
    await prisma.gWIAuditLog.create({
      data: {
        adminId: session.admin.id,
        action: "CREATE_SERVICE_EMPLOYEE",
        resourceType: "serviceEmployee",
        resourceId: employee.id,
        newState: { firstName, lastName, email, status },
      },
    })

    return NextResponse.json(employee, { status: 201 })
  } catch (error) {
    console.error("Failed to create employee:", error)
    return NextResponse.json(
      { error: "Failed to create employee" },
      { status: 500 }
    )
  }
}
