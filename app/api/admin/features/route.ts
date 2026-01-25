import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { validateSuperAdminSession, createFeatureFlag } from "@/lib/super-admin"
import { logAdminActivity, AdminActivityAction, AdminResourceType } from "@/lib/admin-activity"
import { cookies } from "next/headers"

export async function GET() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("adminToken")?.value

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const session = await validateSuperAdminSession(token)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const flags = await prisma.featureFlag.findMany({
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json({ flags })
  } catch (error) {
    console.error("Get feature flags error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("adminToken")?.value

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const session = await validateSuperAdminSession(token)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()

    const flag = await createFeatureFlag({
      ...body,
      createdBy: session.admin.id,
    })

    // Log admin activity
    await logAdminActivity({
      adminId: session.admin.id,
      action: AdminActivityAction.FEATURE_FLAG_CREATE,
      resourceType: AdminResourceType.FEATURE_FLAG,
      resourceId: flag.id,
      description: `Created feature flag: ${flag.name}`,
      metadata: {
        flagKey: flag.key,
        isEnabled: flag.isEnabled,
        rolloutPercentage: flag.rolloutPercentage,
      },
    })

    return NextResponse.json({ flag })
  } catch (error) {
    console.error("Create feature flag error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
