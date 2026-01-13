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

    const flag = await prisma.featureFlag.findUnique({
      where: { id },
    })

    if (!flag) {
      return NextResponse.json({ error: "Feature flag not found" }, { status: 404 })
    }

    // Get organizations using this flag
    const allowedOrgDetails = flag.allowedOrgs.length > 0
      ? await prisma.organization.findMany({
          where: { id: { in: flag.allowedOrgs } },
          select: { id: true, name: true, slug: true, planTier: true },
        })
      : []

    const blockedOrgDetails = flag.blockedOrgs.length > 0
      ? await prisma.organization.findMany({
          where: { id: { in: flag.blockedOrgs } },
          select: { id: true, name: true, slug: true, planTier: true },
        })
      : []

    // Get audit logs related to this feature flag
    const auditLogs = await prisma.platformAuditLog.findMany({
      where: {
        resourceType: "feature_flag",
        resourceId: id,
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    })

    return NextResponse.json({
      flag: {
        ...flag,
        allowedOrgDetails,
        blockedOrgDetails,
        auditLogs,
      },
    })
  } catch (error) {
    console.error("Get feature flag error:", error)
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

    const flag = await prisma.featureFlag.update({
      where: { id },
      data: body,
    })

    return NextResponse.json({ flag })
  } catch (error) {
    console.error("Update feature flag error:", error)
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

    await prisma.featureFlag.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete feature flag error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
