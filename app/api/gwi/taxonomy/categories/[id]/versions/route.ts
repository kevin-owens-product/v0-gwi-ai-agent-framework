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

    if (!hasGWIPermission(session.admin.role, "taxonomy:read")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Verify category exists
    const category = await prisma.taxonomyCategory.findUnique({
      where: { id },
    })

    if (!category) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 })
    }

    const versions = await prisma.taxonomyVersion.findMany({
      where: { categoryId: id },
      include: {
        createdBy: { select: { id: true, name: true, email: true } },
      },
      orderBy: { versionNumber: "desc" },
    })

    return NextResponse.json(versions)
  } catch (error) {
    console.error("Failed to fetch taxonomy versions:", error)
    return NextResponse.json(
      { error: "Failed to fetch taxonomy versions" },
      { status: 500 }
    )
  }
}

export async function POST(
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

    if (!hasGWIPermission(session.admin.role, "taxonomy:write")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Get category with attributes
    const category = await prisma.taxonomyCategory.findUnique({
      where: { id },
      include: {
        attributes: true,
        children: true,
      },
    })

    if (!category) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 })
    }

    const body = await request.json()
    const { changeLog } = body

    // Get the next version number
    const lastVersion = await prisma.taxonomyVersion.findFirst({
      where: { categoryId: id },
      orderBy: { versionNumber: "desc" },
    })

    const versionNumber = lastVersion ? lastVersion.versionNumber + 1 : 1

    // Create snapshot
    const snapshot = {
      id: category.id,
      name: category.name,
      code: category.code,
      description: category.description,
      parentId: category.parentId,
      version: category.version,
      isActive: category.isActive,
      attributes: category.attributes,
      children: category.children.map((c) => ({
        id: c.id,
        name: c.name,
        code: c.code,
      })),
    }

    const version = await prisma.taxonomyVersion.create({
      data: {
        categoryId: id,
        versionNumber,
        snapshot,
        changeLog: changeLog || null,
        createdById: session.admin.id,
      },
      include: {
        createdBy: { select: { id: true, name: true, email: true } },
      },
    })

    // Log the action
    await prisma.gWIAuditLog.create({
      data: {
        adminId: session.admin.id,
        action: "CREATE_TAXONOMY_VERSION",
        resourceType: "taxonomy_version",
        resourceId: version.id,
        newState: {
          categoryId: id,
          versionNumber,
        },
      },
    })

    return NextResponse.json(version, { status: 201 })
  } catch (error) {
    console.error("Failed to create taxonomy version:", error)
    return NextResponse.json(
      { error: "Failed to create taxonomy version" },
      { status: 500 }
    )
  }
}
