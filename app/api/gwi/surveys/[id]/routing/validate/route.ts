import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { prisma } from "@/lib/db"
import { validateSuperAdminSession } from "@/lib/super-admin"
import { hasGWIPermission } from "@/lib/gwi-permissions"

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

    if (!hasGWIPermission(session.admin.role, "surveys:read")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Verify survey exists
    const survey = await prisma.survey.findUnique({
      where: { id },
      include: {
        questions: { orderBy: { order: "asc" } },
        routingRules: {
          where: { isActive: true },
          include: {
            sourceQuestion: true,
            targetQuestion: true,
          },
        },
      },
    })

    if (!survey) {
      return NextResponse.json({ error: "Survey not found" }, { status: 404 })
    }

    const body = await request.json()
    const { answers } = body // Test answers to validate against

    const errors: string[] = []
    const warnings: string[] = []

    // Validate routing rules
    for (const rule of survey.routingRules) {
      // Check if source question exists
      if (rule.sourceQuestionId && !rule.sourceQuestion) {
        errors.push(`Routing rule ${rule.id}: Source question not found`)
        continue
      }

      // Check if target question exists
      if (rule.targetQuestionId && !rule.targetQuestion) {
        errors.push(`Routing rule ${rule.id}: Target question not found`)
        continue
      }

      // Validate condition structure
      if (rule.condition && typeof rule.condition === "object") {
        const condition = rule.condition as Record<string, unknown>
        if (!condition.type || !condition.field) {
          errors.push(`Routing rule ${rule.id}: Invalid condition structure`)
        }
      }

      // Test condition evaluation if answers provided
      if (answers && rule.sourceQuestionId && rule.condition) {
        try {
          const condition = rule.condition as Record<string, unknown>
          const fieldValue = answers[condition.field as string]
          const conditionType = condition.type as string
          const conditionValue = condition.value

          let result = false
          switch (conditionType) {
            case "equals":
              result = fieldValue === conditionValue
              break
            case "contains":
              result = String(fieldValue).includes(String(conditionValue))
              break
            case "greater":
              result = Number(fieldValue) > Number(conditionValue)
              break
            case "less":
              result = Number(fieldValue) < Number(conditionValue)
              break
            case "not_equals":
              result = fieldValue !== conditionValue
              break
            case "in":
              result = Array.isArray(conditionValue) && conditionValue.includes(fieldValue)
              break
          }

          if (result && rule.action === "skip_to" && !rule.targetQuestionId) {
            errors.push(`Routing rule ${rule.id}: skip_to action requires target question`)
          }
        } catch (error) {
          warnings.push(`Routing rule ${rule.id}: Could not evaluate condition - ${error instanceof Error ? error.message : "Unknown error"}`)
        }
      }
    }

    // Check for circular references
    const questionIds = new Set(survey.questions.map((q) => q.id))
    for (const rule of survey.routingRules) {
      if (rule.sourceQuestionId === rule.targetQuestionId) {
        warnings.push(`Routing rule ${rule.id}: Source and target are the same question`)
      }
    }

    return NextResponse.json({
      valid: errors.length === 0,
      errors,
      warnings,
      rulesChecked: survey.routingRules.length,
    })
  } catch (error) {
    console.error("Failed to validate routing:", error)
    return NextResponse.json(
      { error: "Failed to validate routing" },
      { status: 500 }
    )
  }
}
