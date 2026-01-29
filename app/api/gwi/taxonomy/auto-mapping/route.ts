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

    if (!hasGWIPermission(session.admin.role, "taxonomy:read")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const surveyId = searchParams.get("surveyId")
    const questionId = searchParams.get("questionId")
    const targetCategoryCode = searchParams.get("targetCategoryCode")

    const where: Record<string, unknown> = {}
    if (surveyId) where.surveyId = surveyId
    if (questionId) where.questionId = questionId
    if (targetCategoryCode) where.targetCategoryCode = targetCategoryCode

    const mappings = await prisma.taxonomyAutoMapping.findMany({
      where: {
        ...where,
        isActive: true,
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(mappings)
  } catch (error) {
    console.error("Failed to fetch auto-mappings:", error)
    return NextResponse.json(
      { error: "Failed to fetch auto-mappings" },
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

    if (!hasGWIPermission(session.admin.role, "taxonomy:write")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()
    const {
      surveyId,
      questionId,
      sourcePattern,
      targetCategoryCode,
      targetAttributeCode,
      transformation,
      confidence = 1.0,
      isActive = true,
    } = body

    if (!sourcePattern || !targetCategoryCode) {
      return NextResponse.json(
        { error: "sourcePattern and targetCategoryCode are required" },
        { status: 400 }
      )
    }

    // Verify target category exists
    const category = await prisma.taxonomyCategory.findUnique({
      where: { code: targetCategoryCode },
    })

    if (!category) {
      return NextResponse.json(
        { error: "Target category not found" },
        { status: 404 }
      )
    }

    // Verify attribute exists if provided
    if (targetAttributeCode) {
      const attribute = await prisma.taxonomyAttribute.findFirst({
        where: {
          categoryId: category.id,
          code: targetAttributeCode,
        },
      })

      if (!attribute) {
        return NextResponse.json(
          { error: "Target attribute not found" },
          { status: 404 }
        )
      }
    }

    const mapping = await prisma.taxonomyAutoMapping.create({
      data: {
        surveyId: surveyId || null,
        questionId: questionId || null,
        sourcePattern,
        targetCategoryCode,
        targetAttributeCode: targetAttributeCode || null,
        transformation: transformation || null,
        confidence,
        isActive,
      },
    })

    // Log the action
    await prisma.gWIAuditLog.create({
      data: {
        adminId: session.admin.id,
        action: "CREATE_AUTO_MAPPING",
        resourceType: "taxonomy_auto_mapping",
        resourceId: mapping.id,
        newState: {
          targetCategoryCode,
          targetAttributeCode,
          confidence,
        },
      },
    })

    return NextResponse.json(mapping, { status: 201 })
  } catch (error) {
    console.error("Failed to create auto-mapping:", error)
    return NextResponse.json(
      { error: "Failed to create auto-mapping" },
      { status: 500 }
    )
  }
}
