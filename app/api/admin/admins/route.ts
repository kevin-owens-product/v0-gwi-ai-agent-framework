import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { validateSuperAdminSession, hashPassword, hasSuperAdminPermission } from "@/lib/super-admin"
import { logAdminActivity, AdminActivityAction, AdminResourceType } from "@/lib/admin-activity"
import { cookies } from "next/headers"

export async function GET() {
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

    const admins = await prisma.superAdmin.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        twoFactorEnabled: true,
        lastLoginAt: true,
        lastLoginIp: true,
        createdAt: true,
      },
      orderBy: { createdAt: "asc" },
    })

    return NextResponse.json({ admins })
  } catch (error) {
    console.error("Get admins error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
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

    // Only SUPER_ADMIN can create other admins
    if (!hasSuperAdminPermission(session.admin.role, "admins:write")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()
    const { email, name, password, role = "ADMIN", isActive = true } = body

    if (!email || !name || !password) {
      return NextResponse.json(
        { error: "Email, name, and password are required" },
        { status: 400 }
      )
    }

    // Check if email already exists
    const existing = await prisma.superAdmin.findUnique({
      where: { email },
    })

    if (existing) {
      return NextResponse.json(
        { error: "Email already exists" },
        { status: 400 }
      )
    }

    const admin = await prisma.superAdmin.create({
      data: {
        email,
        name,
        passwordHash: await hashPassword(password),
        role,
        isActive,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    })

    // Log admin activity
    await logAdminActivity({
      adminId: session.admin.id,
      action: AdminActivityAction.ADMIN_CREATE,
      resourceType: AdminResourceType.ADMIN,
      resourceId: admin.id,
      description: `Created new admin: ${admin.name}`,
      metadata: {
        newAdminEmail: admin.email,
        newAdminRole: admin.role,
      },
    })

    return NextResponse.json({ admin })
  } catch (error) {
    console.error("Create admin error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
