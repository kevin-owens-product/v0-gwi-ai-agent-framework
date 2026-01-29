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

    if (!hasGWIPermission(session.admin.role, "surveys:read")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Verify survey exists
    const survey = await prisma.survey.findUnique({
      where: { id },
    })

    if (!survey) {
      return NextResponse.json({ error: "Survey not found" }, { status: 404 })
    }

    const versions = await prisma.surveyVersion.findMany({
      where: { surveyId: id },
      orderBy: { versionNumber: "desc" },
    })

    return NextResponse.json(versions)
  } catch (error) {
    console.error("Failed to fetch versions:", error)
    return NextResponse.json(
      { error: "Failed to fetch versions" },
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

    if (!hasGWIPermission(session.admin.role, "surveys:write")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Verify survey exists
    const survey = await prisma.survey.findUnique({
      where: { id },
      include: {
        questions: { orderBy: { order: "asc" } },
        routingRules: { where: { isActive: true } },
      },
    })

    if (!survey) {
      return NextResponse.json({ error: "Survey not found" }, { status: 404 })
    }

    const body = await request.json()
    const { name, description, distribution = 100 } = body

    if (!name) {
      return NextResponse.json(
        { error: "Name is required" },
        { status: 400 }
      )
    }

    if (distribution < 0 || distribution > 100) {
      return NextResponse.json(
        { error: "Distribution must be between 0 and 100" },
        { status: 400 }
      )
    }

    // Get the next version number
    const lastVersion = await prisma.surveyVersion.findFirst({
      where: { surveyId: id },
      orderBy: { versionNumber: "desc" },
    })

    const versionNumber = lastVersion ? lastVersion.versionNumber + 1 : 1

    // Create snapshot of questions and routing
    const questionsSnapshot = survey.questions.map((q) => ({
      id: q.id,
      code: q.code,
      text: q.text,
      type: q.type,
      options: q.options,
      validationRules: q.validationRules,
      order: q.order,
      required: q.required,
      taxonomyLinks: q.taxonomyLinks,
      displayLogic: q.displayLogic,
      pipingRules: q.pipingRules,
      randomization: q.randomization,
      loopConfig: q.loopConfig,
    }))

    const routingSnapshot = survey.routingRules.map((r) => ({
      id: r.id,
      sourceQuestionId: r.sourceQuestionId,
      condition: r.condition,
      targetQuestionId: r.targetQuestionId,
      action: r.action,
      priority: r.priority,
    }))

    const version = await prisma.surveyVersion.create({
      data: {
        surveyId: id,
        versionNumber,
        name,
        description: description || null,
        questions: questionsSnapshot,
        routingRules: routingSnapshot,
        distribution,
        isActive: true,
      },
    })

    // Log the action
    await prisma.gWIAuditLog.create({
      data: {
        adminId: session.admin.id,
        action: "CREATE_SURVEY_VERSION",
        resourceType: "survey_version",
        resourceId: version.id,
        newState: {
          surveyId: id,
          versionNumber,
          name,
          distribution,
        },
      },
    })

    return NextResponse.json(version, { status: 201 })
  } catch (error) {
    console.error("Failed to create version:", error)
    return NextResponse.json(
      { error: "Failed to create version" },
      { status: 500 }
    )
  }
}
