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

    const audit = await prisma.complianceAudit.findUnique({
      where: { id },
      include: {
        framework: true,
      },
    })

    if (!audit) {
      return NextResponse.json({ error: "Audit not found" }, { status: 404 })
    }

    // Fetch organization details if applicable
    const organization = audit.orgId
      ? await prisma.organization.findUnique({
          where: { id: audit.orgId },
          select: { id: true, name: true, slug: true },
        })
      : null

    return NextResponse.json({
      audit: {
        ...audit,
        organization,
      },
    })
  } catch (error) {
    console.error("Compliance audit fetch error:", error)
    return NextResponse.json(
      { error: "Failed to fetch compliance audit" },
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
      type,
      status,
      scheduledDate,
      startedAt,
      completedAt,
      auditor,
      findings,
      recommendations,
      score,
      reportUrl,
      metadata,
    } = body

    const existingAudit = await prisma.complianceAudit.findUnique({
      where: { id },
    })

    if (!existingAudit) {
      return NextResponse.json({ error: "Audit not found" }, { status: 404 })
    }

    const audit = await prisma.complianceAudit.update({
      where: { id },
      data: {
        ...(type !== undefined && { type }),
        ...(status !== undefined && { status }),
        ...(scheduledDate !== undefined && { scheduledDate: new Date(scheduledDate) }),
        ...(startedAt !== undefined && { startedAt: startedAt ? new Date(startedAt) : null }),
        ...(completedAt !== undefined && { completedAt: completedAt ? new Date(completedAt) : null }),
        ...(auditor !== undefined && { auditor }),
        ...(findings !== undefined && { findings }),
        ...(recommendations !== undefined && { recommendations }),
        ...(score !== undefined && { score }),
        ...(reportUrl !== undefined && { reportUrl }),
        ...(metadata !== undefined && { metadata }),
      },
      include: {
        framework: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
    })

    await logPlatformAudit({
      adminId: session.adminId,
      action: "update_compliance_audit",
      resourceType: "compliance_audit",
      resourceId: audit.id,
      targetOrgId: audit.orgId ?? undefined,
      details: {
        changes: Object.keys(body),
        previousStatus: existingAudit.status,
        newStatus: audit.status,
      },
    })

    return NextResponse.json({ audit })
  } catch (error) {
    console.error("Compliance audit update error:", error)
    return NextResponse.json(
      { error: "Failed to update compliance audit" },
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

    const existingAudit = await prisma.complianceAudit.findUnique({
      where: { id },
      include: {
        framework: {
          select: { name: true, code: true },
        },
      },
    })

    if (!existingAudit) {
      return NextResponse.json({ error: "Audit not found" }, { status: 404 })
    }

    // Prevent deletion of completed audits
    if (existingAudit.status === "COMPLETED") {
      return NextResponse.json(
        { error: "Cannot delete completed audits" },
        { status: 400 }
      )
    }

    await prisma.complianceAudit.delete({
      where: { id },
    })

    await logPlatformAudit({
      adminId: session.adminId,
      action: "delete_compliance_audit",
      resourceType: "compliance_audit",
      resourceId: id,
      targetOrgId: existingAudit.orgId ?? undefined,
      details: {
        frameworkCode: existingAudit.framework.code,
        status: existingAudit.status,
        scheduledDate: existingAudit.scheduledDate,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Compliance audit deletion error:", error)
    return NextResponse.json(
      { error: "Failed to delete compliance audit" },
      { status: 500 }
    )
  }
}
