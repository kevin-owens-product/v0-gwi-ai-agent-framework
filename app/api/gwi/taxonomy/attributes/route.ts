import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { prisma } from "@/lib/db"
import { validateSuperAdminSession } from "@/lib/super-admin"
import { hasGWIPermission } from "@/lib/gwi-permissions"

/**
 * GET /api/gwi/taxonomy/attributes
 * List taxonomy attributes with optional filtering by categoryId
 *
 * Query parameters:
 * - categoryId: string (optional) - Filter by category
 * - dataType: string (optional) - Filter by data type
 * - isRequired: boolean (optional) - Filter by required status
 */
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

    if (!hasGWIPermission(session.admin.role, "taxonomy:read")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const searchParams = request.nextUrl.searchParams
    const categoryId = searchParams.get("categoryId")
    const dataType = searchParams.get("dataType")
    const isRequired = searchParams.get("isRequired")

    // Build where clause
    const where: Record<string, unknown> = {}

    if (categoryId) {
      where.categoryId = categoryId
    }

    if (dataType) {
      where.dataType = dataType
    }

    if (isRequired !== null && isRequired !== undefined) {
      where.isRequired = isRequired === "true"
    }

    const attributes = await prisma.taxonomyAttribute.findMany({
      where,
      include: {
        category: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
      orderBy: [
        { category: { name: "asc" } },
        { name: "asc" },
      ],
    })

    return NextResponse.json(attributes)
  } catch (error) {
    console.error("Failed to fetch taxonomy attributes:", error)
    return NextResponse.json(
      { error: "Failed to fetch taxonomy attributes" },
      { status: 500 }
    )
  }
}

/**
 * POST /api/gwi/taxonomy/attributes
 * Create a new taxonomy attribute
 *
 * Request body:
 * - categoryId: string (required) - Parent category ID
 * - name: string (required) - Attribute name
 * - code: string (required) - Unique code within category
 * - dataType: string (required) - Data type (string, number, boolean, date, enum, array)
 * - allowedValues: array (optional) - Allowed values for enum types
 * - validationRules: object (optional) - Validation rules
 * - isRequired: boolean (optional) - Whether attribute is required
 */
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

    if (!hasGWIPermission(session.admin.role, "taxonomy:write")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()
    const {
      categoryId,
      name,
      code,
      dataType,
      allowedValues,
      validationRules,
      isRequired = false,
    } = body

    // Validate required fields
    if (!categoryId) {
      return NextResponse.json(
        { error: "Category ID is required" },
        { status: 400 }
      )
    }

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json(
        { error: "Name is required and must be a non-empty string" },
        { status: 400 }
      )
    }

    if (!code || typeof code !== "string" || code.trim().length === 0) {
      return NextResponse.json(
        { error: "Code is required and must be a non-empty string" },
        { status: 400 }
      )
    }

    // Validate code format (alphanumeric with underscores)
    const codeRegex = /^[a-z][a-z0-9_]*$/i
    if (!codeRegex.test(code.trim())) {
      return NextResponse.json(
        { error: "Code must start with a letter and contain only alphanumeric characters and underscores" },
        { status: 400 }
      )
    }

    // Validate data type
    const validDataTypes = ["string", "number", "boolean", "date", "enum", "array", "object"]
    if (!dataType || !validDataTypes.includes(dataType)) {
      return NextResponse.json(
        { error: `Data type must be one of: ${validDataTypes.join(", ")}` },
        { status: 400 }
      )
    }

    // Validate allowedValues for enum type
    if (dataType === "enum") {
      if (!allowedValues || !Array.isArray(allowedValues) || allowedValues.length === 0) {
        return NextResponse.json(
          { error: "Allowed values are required for enum data type" },
          { status: 400 }
        )
      }
    }

    // Verify category exists
    const category = await prisma.taxonomyCategory.findUnique({
      where: { id: categoryId },
    })

    if (!category) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      )
    }

    // Check for duplicate code within category
    const existingAttribute = await prisma.taxonomyAttribute.findUnique({
      where: {
        categoryId_code: {
          categoryId,
          code: code.trim(),
        },
      },
    })

    if (existingAttribute) {
      return NextResponse.json(
        { error: "An attribute with this code already exists in this category" },
        { status: 409 }
      )
    }

    // Create the attribute
    const attribute = await prisma.taxonomyAttribute.create({
      data: {
        categoryId,
        name: name.trim(),
        code: code.trim(),
        dataType,
        allowedValues: allowedValues || null,
        validationRules: validationRules || null,
        isRequired,
      },
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
        action: "CREATE_TAXONOMY_ATTRIBUTE",
        resourceType: "taxonomy_attribute",
        resourceId: attribute.id,
        newState: {
          categoryId,
          name: attribute.name,
          code: attribute.code,
          dataType,
          isRequired,
        },
      },
    })

    return NextResponse.json(attribute, { status: 201 })
  } catch (error) {
    console.error("Failed to create taxonomy attribute:", error)
    return NextResponse.json(
      { error: "Failed to create taxonomy attribute" },
      { status: 500 }
    )
  }
}
