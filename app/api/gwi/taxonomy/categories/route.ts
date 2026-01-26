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

    if (!hasGWIPermission(session.admin.role, "taxonomy:read")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const categories = await prisma.taxonomyCategory.findMany({
      include: {
        _count: {
          select: {
            attributes: true,
            children: true,
          },
        },
      },
      orderBy: { name: "asc" },
    })

    return NextResponse.json(categories)
  } catch (error) {
    console.error("Failed to fetch categories:", error)
    return NextResponse.json(
      { error: "Failed to fetch categories" },
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

    if (!hasGWIPermission(session.admin.role, "taxonomy:write")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()
    const { name, code, description, parentId, isActive = true } = body

    if (!name || !code) {
      return NextResponse.json(
        { error: "Name and code are required" },
        { status: 400 }
      )
    }

    // Check for unique code
    const existing = await prisma.taxonomyCategory.findUnique({
      where: { code },
    })

    if (existing) {
      return NextResponse.json(
        { error: "Category code already exists" },
        { status: 400 }
      )
    }

    const category = await prisma.taxonomyCategory.create({
      data: {
        name,
        code,
        description,
        parentId,
        isActive,
      },
    })

    await prisma.gWIAuditLog.create({
      data: {
        adminId: session.admin.id,
        action: "CREATE_CATEGORY",
        resourceType: "taxonomy_category",
        resourceId: category.id,
        newState: { name, code, parentId },
      },
    })

    return NextResponse.json(category, { status: 201 })
  } catch (error) {
    console.error("Failed to create category:", error)
    return NextResponse.json(
      { error: "Failed to create category" },
      { status: 500 }
    )
  }
}
