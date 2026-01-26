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

    const category = await prisma.taxonomyCategory.findUnique({
      where: { id },
      include: {
        parent: { select: { id: true, name: true, code: true } },
        children: {
          select: {
            id: true,
            name: true,
            code: true,
            description: true,
            isActive: true,
            _count: { select: { attributes: true, children: true } },
          },
          orderBy: { name: "asc" },
        },
        attributes: {
          orderBy: { name: "asc" },
        },
        organization: { select: { id: true, name: true, slug: true } },
        _count: {
          select: {
            attributes: true,
            children: true,
          },
        },
      },
    })

    if (!category) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 })
    }

    return NextResponse.json(category)
  } catch (error) {
    console.error("Failed to fetch category:", error)
    return NextResponse.json(
      { error: "Failed to fetch category" },
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

    if (!hasGWIPermission(session.admin.role, "taxonomy:write")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const existingCategory = await prisma.taxonomyCategory.findUnique({
      where: { id },
    })

    if (!existingCategory) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 })
    }

    const body = await request.json()
    const { name, description, parentId, isActive, isGlobal } = body

    // Validate name if provided
    if (name !== undefined) {
      if (!name.trim()) {
        return NextResponse.json(
          { error: "Name is required" },
          { status: 400 }
        )
      }
      if (name.length < 2 || name.length > 100) {
        return NextResponse.json(
          { error: "Name must be between 2 and 100 characters" },
          { status: 400 }
        )
      }
    }

    // Validate description length if provided
    if (description !== undefined && description && description.length > 500) {
      return NextResponse.json(
        { error: "Description must be less than 500 characters" },
        { status: 400 }
      )
    }

    // Validate parentId if provided - prevent circular references
    if (parentId !== undefined && parentId !== null) {
      // Check if parent exists
      const parentCategory = await prisma.taxonomyCategory.findUnique({
        where: { id: parentId },
      })

      if (!parentCategory) {
        return NextResponse.json(
          { error: "Parent category not found" },
          { status: 400 }
        )
      }

      // Check for circular reference - ensure the new parent is not a descendant
      const isDescendant = await checkIsDescendant(id, parentId)
      if (isDescendant) {
        return NextResponse.json(
          { error: "Cannot set a descendant category as parent (circular reference)" },
          { status: 400 }
        )
      }
    }

    const updateData: Record<string, unknown> = {}
    if (name !== undefined) updateData.name = name.trim()
    if (description !== undefined) updateData.description = description?.trim() || null
    if (parentId !== undefined) updateData.parentId = parentId || null
    if (isActive !== undefined) updateData.isActive = isActive

    // Handle organization scoping
    if (isGlobal !== undefined) {
      updateData.orgId = isGlobal ? null : existingCategory.orgId
    }

    // Increment version on significant changes
    const significantChange =
      (name !== undefined && name !== existingCategory.name) ||
      (isActive !== undefined && isActive !== existingCategory.isActive) ||
      (parentId !== undefined && parentId !== existingCategory.parentId)

    if (significantChange) {
      updateData.version = existingCategory.version + 1
    }

    const category = await prisma.taxonomyCategory.update({
      where: { id },
      data: updateData,
      include: {
        parent: { select: { id: true, name: true, code: true } },
        organization: { select: { id: true, name: true, slug: true } },
        _count: {
          select: {
            attributes: true,
            children: true,
          },
        },
      },
    })

    // Log the action
    await prisma.gWIAuditLog.create({
      data: {
        adminId: session.admin.id,
        action: "UPDATE_CATEGORY",
        resourceType: "taxonomy_category",
        resourceId: category.id,
        previousState: {
          name: existingCategory.name,
          description: existingCategory.description,
          parentId: existingCategory.parentId,
          isActive: existingCategory.isActive,
          orgId: existingCategory.orgId,
        },
        newState: updateData as Record<string, string | number | boolean | null>,
      },
    })

    return NextResponse.json(category)
  } catch (error) {
    console.error("Failed to update category:", error)
    return NextResponse.json(
      { error: "Failed to update category" },
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

    if (!hasGWIPermission(session.admin.role, "taxonomy:write")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const category = await prisma.taxonomyCategory.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            children: true,
            attributes: true,
          },
        },
      },
    })

    if (!category) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 })
    }

    // Check if category has children - require explicit handling
    if (category._count.children > 0) {
      return NextResponse.json(
        {
          error: "Cannot delete category with child categories. Delete or move children first.",
          childCount: category._count.children,
        },
        { status: 400 }
      )
    }

    // Delete associated attributes first (cascade should handle this, but being explicit)
    await prisma.taxonomyAttribute.deleteMany({
      where: { categoryId: id },
    })

    // Delete the category
    await prisma.taxonomyCategory.delete({
      where: { id },
    })

    // Log the action
    await prisma.gWIAuditLog.create({
      data: {
        adminId: session.admin.id,
        action: "DELETE_CATEGORY",
        resourceType: "taxonomy_category",
        resourceId: id,
        previousState: {
          name: category.name,
          code: category.code,
          description: category.description,
          parentId: category.parentId,
          isActive: category.isActive,
          orgId: category.orgId,
          attributeCount: category._count.attributes,
        },
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to delete category:", error)
    return NextResponse.json(
      { error: "Failed to delete category" },
      { status: 500 }
    )
  }
}

/**
 * Helper function to check if potentialDescendantId is a descendant of categoryId
 * Used to prevent circular references when updating parent
 */
async function checkIsDescendant(
  categoryId: string,
  potentialDescendantId: string
): Promise<boolean> {
  // If they're the same, it's definitely a problem
  if (categoryId === potentialDescendantId) {
    return true
  }

  // Get all descendants of categoryId
  const children = await prisma.taxonomyCategory.findMany({
    where: { parentId: categoryId },
    select: { id: true },
  })

  for (const child of children) {
    if (child.id === potentialDescendantId) {
      return true
    }
    const isDescendantOfChild = await checkIsDescendant(child.id, potentialDescendantId)
    if (isDescendantOfChild) {
      return true
    }
  }

  return false
}
