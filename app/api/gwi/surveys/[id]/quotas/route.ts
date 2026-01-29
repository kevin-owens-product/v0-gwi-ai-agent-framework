import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { prisma } from "@/lib/db"
import { validateSuperAdminSession } from "@/lib/super-admin"
import { hasGWIPermission } from "@/lib/gwi-permissions"

export async function GET(
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
    })

    if (!survey) {
      return NextResponse.json({ error: "Survey not found" }, { status: 404 })
    }

    const { searchParams } = new URL(request.url)
    const includeInactive = searchParams.get("includeInactive") === "true"

    const quotas = await prisma.surveyQuota.findMany({
      where: {
        surveyId: id,
        ...(includeInactive ? {} : { isActive: true }),
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(quotas)
  } catch (error) {
    console.error("Failed to fetch quotas:", error)
    return NextResponse.json(
      { error: "Failed to fetch quotas" },
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
    })

    if (!survey) {
      return NextResponse.json({ error: "Survey not found" }, { status: 404 })
    }

    const body = await request.json()
    const { name, targetCount, conditions, isActive = true } = body

    if (!name || targetCount === undefined) {
      return NextResponse.json(
        { error: "Name and targetCount are required" },
        { status: 400 }
      )
    }

    if (targetCount < 0) {
      return NextResponse.json(
        { error: "targetCount must be non-negative" },
        { status: 400 }
      )
    }

    const quota = await prisma.surveyQuota.create({
      data: {
        surveyId: id,
        name,
        targetCount,
        currentCount: 0,
        conditions: conditions || {},
        isActive,
      },
    })

    // Log the action
    await prisma.gWIAuditLog.create({
      data: {
        adminId: session.admin.id,
        action: "CREATE_QUOTA",
        resourceType: "survey_quota",
        resourceId: quota.id,
        newState: {
          surveyId: id,
          name,
          targetCount,
        },
      },
    })

    return NextResponse.json(quota, { status: 201 })
  } catch (error) {
    console.error("Failed to create quota:", error)
    return NextResponse.json(
      { error: "Failed to create quota" },
      { status: 500 }
    )
  }
}
