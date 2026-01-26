import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { prisma } from "@/lib/db"
import { validateSuperAdminSession } from "@/lib/super-admin"
import { hasGWIPermission } from "@/lib/gwi-permissions"

/**
 * GET /api/gwi/taxonomy/attributes/[id]
 * Fetch a single taxonomy attribute by ID
 */
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

    const attribute = await prisma.taxonomyAttribute.findUnique({
      where: { id },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            code: true,
            description: true,
            parentId: true,
            parent: {
              select: {
                id: true,
                name: true,
                code: true,
              },
            },
          },
        },
      },
    })

    if (!attribute) {
      return NextResponse.json(
        { error: "Taxonomy attribute not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(attribute)
  } catch (error) {
    console.error("Failed to fetch taxonomy attribute:", error)
    return NextResponse.json(
      { error: "Failed to fetch taxonomy attribute" },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/gwi/taxonomy/attributes/[id]
 * Update a taxonomy attribute
 *
 * Request body (all optional):
 * - name: string - Attribute name
 * - dataType: string - Data type
 * - allowedValues: array - Allowed values for enum types
 * - validationRules: object - Validation rules
 * - isRequired: boolean - Whether attribute is required
 */
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

    // Fetch existing attribute
    const existingAttribute = await prisma.taxonomyAttribute.findUnique({
      where: { id },
    })

    if (!existingAttribute) {
      return NextResponse.json(
        { error: "Taxonomy attribute not found" },
        { status: 404 }
      )
    }

    const body = await request.json()
    const {
      name,
      dataType,
      allowedValues,
      validationRules,
      isRequired,
    } = body

    // Build update data
    const updateData: Record<string, unknown> = {}

    // Validate and set name
    if (name !== undefined) {
      if (typeof name !== "string" || name.trim().length === 0) {
        return NextResponse.json(
          { error: "Name must be a non-empty string" },
          { status: 400 }
        )
      }
      updateData.name = name.trim()
    }

    // Validate and set dataType
    if (dataType !== undefined) {
      const validDataTypes = ["string", "number", "boolean", "date", "enum", "array", "object"]
      if (!validDataTypes.includes(dataType)) {
        return NextResponse.json(
          { error: `Data type must be one of: ${validDataTypes.join(", ")}` },
          { status: 400 }
        )
      }
      updateData.dataType = dataType
    }

    // Validate allowedValues for enum type
    const effectiveDataType = dataType || existingAttribute.dataType
    if (effectiveDataType === "enum") {
      if (allowedValues !== undefined) {
        if (!Array.isArray(allowedValues) || allowedValues.length === 0) {
          return NextResponse.json(
            { error: "Allowed values must be a non-empty array for enum data type" },
            { status: 400 }
          )
        }
        updateData.allowedValues = allowedValues
      }
    } else if (allowedValues !== undefined) {
      // Clear allowedValues if dataType is not enum
      updateData.allowedValues = null
    }

    // Set validationRules
    if (validationRules !== undefined) {
      updateData.validationRules = validationRules
    }

    // Set isRequired
    if (isRequired !== undefined) {
      if (typeof isRequired !== "boolean") {
        return NextResponse.json(
          { error: "isRequired must be a boolean" },
          { status: 400 }
        )
      }
      updateData.isRequired = isRequired
    }

    // Update the attribute
    const attribute = await prisma.taxonomyAttribute.update({
      where: { id },
      data: updateData,
      include: {
        category: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
    })

    // Log the action
    await prisma.gWIAuditLog.create({
      data: {
        adminId: session.admin.id,
        action: "UPDATE_TAXONOMY_ATTRIBUTE",
        resourceType: "taxonomy_attribute",
        resourceId: attribute.id,
        previousState: {
          name: existingAttribute.name,
          dataType: existingAttribute.dataType,
          isRequired: existingAttribute.isRequired,
        },
        newState: updateData as Record<string, string | number | boolean | null>,
      },
    })

    return NextResponse.json(attribute)
  } catch (error) {
    console.error("Failed to update taxonomy attribute:", error)
    return NextResponse.json(
      { error: "Failed to update taxonomy attribute" },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/gwi/taxonomy/attributes/[id]
 * Delete a taxonomy attribute
 */
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

    // Fetch existing attribute
    const attribute = await prisma.taxonomyAttribute.findUnique({
      where: { id },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
    })

    if (!attribute) {
      return NextResponse.json(
        { error: "Taxonomy attribute not found" },
        { status: 404 }
      )
    }

    // Delete the attribute
    await prisma.taxonomyAttribute.delete({
      where: { id },
    })

    // Log the action
    await prisma.gWIAuditLog.create({
      data: {
        adminId: session.admin.id,
        action: "DELETE_TAXONOMY_ATTRIBUTE",
        resourceType: "taxonomy_attribute",
        resourceId: id,
        previousState: {
          name: attribute.name,
          code: attribute.code,
          dataType: attribute.dataType,
          categoryId: attribute.categoryId,
          categoryName: attribute.category.name,
          isRequired: attribute.isRequired,
        },
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to delete taxonomy attribute:", error)
    return NextResponse.json(
      { error: "Failed to delete taxonomy attribute" },
      { status: 500 }
    )
  }
}
