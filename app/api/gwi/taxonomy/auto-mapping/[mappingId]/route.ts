import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { prisma } from "@/lib/db"
import { validateSuperAdminSession } from "@/lib/super-admin"
import { hasGWIPermission } from "@/lib/gwi-permissions"

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ mappingId: string }> }
) {
  try {
    const { mappingId } = await params
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

    const existingMapping = await prisma.taxonomyAutoMapping.findUnique({
      where: { id: mappingId },
    })

    if (!existingMapping) {
      return NextResponse.json({ error: "Mapping not found" }, { status: 404 })
    }

    const body = await request.json()
    const {
      sourcePattern,
      targetCategoryCode,
      targetAttributeCode,
      transformation,
      confidence,
      isActive,
    } = body

    const updateData: Record<string, unknown> = {}
    if (sourcePattern !== undefined) updateData.sourcePattern = sourcePattern
    if (targetCategoryCode !== undefined) {
      // Verify category exists
      const category = await prisma.taxonomyCategory.findUnique({
        where: { code: targetCategoryCode },
      })
      if (!category) {
        return NextResponse.json(
          { error: "Target category not found" },
          { status: 404 }
        )
      }
      updateData.targetCategoryCode = targetCategoryCode
    }
    if (targetAttributeCode !== undefined) {
      updateData.targetAttributeCode = targetAttributeCode || null
    }
    if (transformation !== undefined) updateData.transformation = transformation
    if (confidence !== undefined) updateData.confidence = confidence
    if (isActive !== undefined) updateData.isActive = isActive

    const mapping = await prisma.taxonomyAutoMapping.update({
      where: { id: mappingId },
      data: updateData,
    })

    // Log the action
    await prisma.gWIAuditLog.create({
      data: {
        adminId: session.admin.id,
        action: "UPDATE_AUTO_MAPPING",
        resourceType: "taxonomy_auto_mapping",
        resourceId: mappingId,
        previousState: {
          targetCategoryCode: existingMapping.targetCategoryCode,
          confidence: existingMapping.confidence,
        },
        newState: updateData,
      },
    })

    return NextResponse.json(mapping)
  } catch (error) {
    console.error("Failed to update auto-mapping:", error)
    return NextResponse.json(
      { error: "Failed to update auto-mapping" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ mappingId: string }> }
) {
  try {
    const { mappingId } = await params
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

    const existingMapping = await prisma.taxonomyAutoMapping.findUnique({
      where: { id: mappingId },
    })

    if (!existingMapping) {
      return NextResponse.json({ error: "Mapping not found" }, { status: 404 })
    }

    await prisma.taxonomyAutoMapping.delete({
      where: { id: mappingId },
    })

    // Log the action
    await prisma.gWIAuditLog.create({
      data: {
        adminId: session.admin.id,
        action: "DELETE_AUTO_MAPPING",
        resourceType: "taxonomy_auto_mapping",
        resourceId: mappingId,
        previousState: {
          targetCategoryCode: existingMapping.targetCategoryCode,
        },
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to delete auto-mapping:", error)
    return NextResponse.json(
      { error: "Failed to delete auto-mapping" },
      { status: 500 }
    )
  }
}
