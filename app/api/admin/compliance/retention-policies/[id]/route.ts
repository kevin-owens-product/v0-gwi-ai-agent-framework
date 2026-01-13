import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { prisma } from "@/lib/db"
import { validateSuperAdminSession, logPlatformAudit } from "@/lib/super-admin"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const cookieStore = await cookies()
    const token = cookieStore.get("adminToken")?.value

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const session = await validateSuperAdminSession(token)
    if (!session) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 })
    }

    const policy = await prisma.dataRetentionPolicy.findUnique({
      where: { id },
    })

    if (!policy) {
      return NextResponse.json({ error: "Retention policy not found" }, { status: 404 })
    }

    // Fetch target organization details if applicable
    const targetOrganizations = policy.targetOrgs.length > 0
      ? await prisma.organization.findMany({
          where: { id: { in: policy.targetOrgs } },
          select: { id: true, name: true, slug: true },
        })
      : []

    // Calculate days until next run
    const daysUntilNextRun = policy.nextRun
      ? Math.ceil((policy.nextRun.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      : null

    return NextResponse.json({
      policy: {
        ...policy,
        targetOrganizations,
        daysUntilNextRun,
        retentionPeriod: policy.retentionDays === -1 ? "Forever" : `${policy.retentionDays} days`,
      },
    })
  } catch (error) {
    console.error("Retention policy fetch error:", error)
    return NextResponse.json(
      { error: "Failed to fetch retention policy" },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const cookieStore = await cookies()
    const token = cookieStore.get("adminToken")?.value

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const session = await validateSuperAdminSession(token)
    if (!session) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 })
    }

    const body = await request.json()
    const {
      name,
      description,
      dataType,
      retentionDays,
      scope,
      targetOrgs,
      targetPlans,
      deleteAction,
      isActive,
      lastRun,
      nextRun,
    } = body

    const existingPolicy = await prisma.dataRetentionPolicy.findUnique({
      where: { id },
    })

    if (!existingPolicy) {
      return NextResponse.json({ error: "Retention policy not found" }, { status: 404 })
    }

    // Validate retention days if provided
    if (retentionDays !== undefined && retentionDays !== -1) {
      if (typeof retentionDays !== "number" || retentionDays < 0) {
        return NextResponse.json(
          { error: "Retention days must be a positive number or -1 for forever" },
          { status: 400 }
        )
      }
    }

    // Validate target orgs if provided
    if (targetOrgs && targetOrgs.length > 0) {
      const orgs = await prisma.organization.findMany({
        where: { id: { in: targetOrgs } },
      })

      if (orgs.length !== targetOrgs.length) {
        return NextResponse.json(
          { error: "One or more target organizations not found" },
          { status: 404 }
        )
      }
    }

    const policy = await prisma.dataRetentionPolicy.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(dataType !== undefined && { dataType }),
        ...(retentionDays !== undefined && { retentionDays }),
        ...(scope !== undefined && { scope }),
        ...(targetOrgs !== undefined && { targetOrgs }),
        ...(targetPlans !== undefined && { targetPlans }),
        ...(deleteAction !== undefined && { deleteAction }),
        ...(isActive !== undefined && { isActive }),
        ...(lastRun !== undefined && { lastRun: lastRun ? new Date(lastRun) : null }),
        ...(nextRun !== undefined && { nextRun: nextRun ? new Date(nextRun) : null }),
      },
    })

    await logPlatformAudit({
      adminId: session.adminId,
      action: "update_retention_policy",
      resourceType: "data_retention_policy",
      resourceId: policy.id,
      details: {
        changes: Object.keys(body),
        previousActive: existingPolicy.isActive,
        newActive: policy.isActive,
      },
    })

    return NextResponse.json({ policy })
  } catch (error) {
    console.error("Retention policy update error:", error)
    return NextResponse.json(
      { error: "Failed to update retention policy" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const cookieStore = await cookies()
    const token = cookieStore.get("adminToken")?.value

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const session = await validateSuperAdminSession(token)
    if (!session) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 })
    }

    const existingPolicy = await prisma.dataRetentionPolicy.findUnique({
      where: { id },
    })

    if (!existingPolicy) {
      return NextResponse.json({ error: "Retention policy not found" }, { status: 404 })
    }

    // Warn if deleting an active policy
    if (existingPolicy.isActive) {
      // Could optionally require explicit confirmation
      // For now, just proceed with deletion
    }

    await prisma.dataRetentionPolicy.delete({
      where: { id },
    })

    await logPlatformAudit({
      adminId: session.adminId,
      action: "delete_retention_policy",
      resourceType: "data_retention_policy",
      resourceId: id,
      details: {
        name: existingPolicy.name,
        dataType: existingPolicy.dataType,
        wasActive: existingPolicy.isActive,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Retention policy deletion error:", error)
    return NextResponse.json(
      { error: "Failed to delete retention policy" },
      { status: 500 }
    )
  }
}
