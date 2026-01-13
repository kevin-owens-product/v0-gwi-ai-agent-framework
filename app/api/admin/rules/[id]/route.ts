import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { validateSuperAdminSession } from "@/lib/super-admin"
import { cookies } from "next/headers"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params

    const rule = await prisma.systemRule.findUnique({
      where: { id },
    })

    if (!rule) {
      return NextResponse.json({ error: "System rule not found" }, { status: 404 })
    }

    // Get organizations this rule applies to
    const appliedOrgDetails = rule.appliesTo.length > 0
      ? await prisma.organization.findMany({
          where: { id: { in: rule.appliesTo } },
          select: { id: true, name: true, slug: true, planTier: true },
        })
      : []

    const excludedOrgDetails = rule.excludeOrgs.length > 0
      ? await prisma.organization.findMany({
          where: { id: { in: rule.excludeOrgs } },
          select: { id: true, name: true, slug: true, planTier: true },
        })
      : []

    // Get audit logs related to this rule
    const auditLogs = await prisma.platformAuditLog.findMany({
      where: {
        resourceType: "system_rule",
        resourceId: id,
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    })

    return NextResponse.json({
      rule: {
        ...rule,
        appliedOrgDetails,
        excludedOrgDetails,
        auditLogs,
      },
    })
  } catch (error) {
    console.error("Get system rule error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params
    const body = await request.json()

    const rule = await prisma.systemRule.update({
      where: { id },
      data: body,
    })

    return NextResponse.json({ rule })
  } catch (error) {
    console.error("Update system rule error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params

    await prisma.systemRule.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete system rule error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
