import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { prisma } from "@/lib/db"
import { validateSuperAdminSession } from "@/lib/super-admin"
import { hasGWIPermission } from "@/lib/gwi-permissions"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; versionId: string }> }
) {
  try {
    const { id, versionId } = await params
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
      include: {
        questions: { orderBy: { order: "asc" } },
        routingRules: { where: { isActive: true } },
      },
    })

    if (!survey) {
      return NextResponse.json({ error: "Survey not found" }, { status: 404 })
    }

    // Get the version to compare
    const version = await prisma.surveyVersion.findFirst({
      where: { id: versionId, surveyId: id },
    })

    if (!version) {
      return NextResponse.json({ error: "Version not found" }, { status: 404 })
    }

    // Get compare version if provided
    const { searchParams } = new URL(request.url)
    const compareVersionId = searchParams.get("compareVersionId")

    let compareVersion = null
    if (compareVersionId) {
      compareVersion = await prisma.surveyVersion.findFirst({
        where: { id: compareVersionId, surveyId: id },
      })
    }

    // Compare current survey with version
    const versionQuestions = version.questions as Array<Record<string, unknown>>
    const currentQuestions = survey.questions

    const questionChanges: Array<{
      type: "added" | "removed" | "modified"
      question: unknown
      changes?: Record<string, unknown>
    }> = []

    // Find added/modified questions
    for (const currentQ of currentQuestions) {
      const versionQ = versionQuestions.find(
        (vq) => vq.code === currentQ.code
      )

      if (!versionQ) {
        questionChanges.push({
          type: "added",
          question: currentQ,
        })
      } else {
        // Check for modifications
        const changes: Record<string, unknown> = {}
        if (currentQ.text !== versionQ.text) {
          changes.text = { from: versionQ.text, to: currentQ.text }
        }
        if (JSON.stringify(currentQ.options) !== JSON.stringify(versionQ.options)) {
          changes.options = { from: versionQ.options, to: currentQ.options }
        }
        if (currentQ.type !== versionQ.type) {
          changes.type = { from: versionQ.type, to: currentQ.type }
        }

        if (Object.keys(changes).length > 0) {
          questionChanges.push({
            type: "modified",
            question: currentQ,
            changes,
          })
        }
      }
    }

    // Find removed questions
    for (const versionQ of versionQuestions) {
      const currentQ = currentQuestions.find((cq) => cq.code === versionQ.code)
      if (!currentQ) {
        questionChanges.push({
          type: "removed",
          question: versionQ,
        })
      }
    }

    // Compare routing rules
    const versionRouting = (version.routingRules || []) as Array<Record<string, unknown>>
    const currentRouting = survey.routingRules

    const routingChanges: Array<{
      type: "added" | "removed" | "modified"
      rule: unknown
    }> = []

    // Find added/modified routing rules
    for (const currentR of currentRouting) {
      const versionR = versionRouting.find(
        (vr) => vr.id === currentR.id
      )

      if (!versionR) {
        routingChanges.push({
          type: "added",
          rule: currentR,
        })
      } else if (JSON.stringify(currentR) !== JSON.stringify(versionR)) {
        routingChanges.push({
          type: "modified",
          rule: currentR,
        })
      }
    }

    // Find removed routing rules
    for (const versionR of versionRouting) {
      const currentR = currentRouting.find((cr) => cr.id === versionR.id)
      if (!currentR) {
        routingChanges.push({
          type: "removed",
          rule: versionR,
        })
      }
    }

    return NextResponse.json({
      version,
      compareVersion,
      currentSurvey: {
        id: survey.id,
        name: survey.name,
        version: survey.version,
        status: survey.status,
      },
      changes: {
        questions: questionChanges,
        routing: routingChanges,
        summary: {
          questionsAdded: questionChanges.filter((c) => c.type === "added").length,
          questionsRemoved: questionChanges.filter((c) => c.type === "removed").length,
          questionsModified: questionChanges.filter((c) => c.type === "modified").length,
          routingAdded: routingChanges.filter((c) => c.type === "added").length,
          routingRemoved: routingChanges.filter((c) => c.type === "removed").length,
          routingModified: routingChanges.filter((c) => c.type === "modified").length,
        },
      },
    })
  } catch (error) {
    console.error("Failed to compare versions:", error)
    return NextResponse.json(
      { error: "Failed to compare versions" },
      { status: 500 }
    )
  }
}
