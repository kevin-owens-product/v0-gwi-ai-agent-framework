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

    const policy = await prisma.securityPolicy.findUnique({
      where: { id },
      include: {
        violations: {
          orderBy: { createdAt: "desc" },
          take: 10,
        },
        _count: {
          select: { violations: true },
        },
      },
    })

    if (!policy) {
      return NextResponse.json({ error: "Policy not found" }, { status: 404 })
    }

    return NextResponse.json({ policy })
  } catch (error) {
    console.error("Security policy fetch error:", error)
    return NextResponse.json(
      { error: "Failed to fetch security policy" },
      { status: 500 }
    )
  }
}

export async function PATCH(
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
      type,
      scope,
      enforcementMode,
      priority,
      isActive,
      targetOrgs,
      targetPlans,
      settings,
    } = body

    const existingPolicy = await prisma.securityPolicy.findUnique({
      where: { id },
    })

    if (!existingPolicy) {
      return NextResponse.json({ error: "Policy not found" }, { status: 404 })
    }

    const policy = await prisma.securityPolicy.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(type !== undefined && { type }),
        ...(scope !== undefined && { scope }),
        ...(enforcementMode !== undefined && { enforcementMode }),
        ...(priority !== undefined && { priority }),
        ...(isActive !== undefined && { isActive }),
        ...(targetOrgs !== undefined && { targetOrgs }),
        ...(targetPlans !== undefined && { targetPlans }),
        ...(settings !== undefined && { settings }),
      },
    })

    await logPlatformAudit({
      adminId: session.adminId,
      action: "update_security_policy",
      resourceType: "security_policy",
      resourceId: policy.id,
      details: {
        changes: Object.keys(body),
        previousActive: existingPolicy.isActive,
        newActive: policy.isActive,
      },
    })

    return NextResponse.json({ policy })
  } catch (error) {
    console.error("Security policy update error:", error)
    return NextResponse.json(
      { error: "Failed to update security policy" },
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

    const existingPolicy = await prisma.securityPolicy.findUnique({
      where: { id },
    })

    if (!existingPolicy) {
      return NextResponse.json({ error: "Policy not found" }, { status: 404 })
    }

    await prisma.securityPolicy.delete({
      where: { id },
    })

    await logPlatformAudit({
      adminId: session.adminId,
      action: "delete_security_policy",
      resourceType: "security_policy",
      resourceId: id,
      details: {
        name: existingPolicy.name,
        type: existingPolicy.type,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Security policy deletion error:", error)
    return NextResponse.json(
      { error: "Failed to delete security policy" },
      { status: 500 }
    )
  }
}
