import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { prisma } from "@/lib/db"
import { validateSuperAdminSession, logPlatformAudit } from "@/lib/super-admin"

export async function GET(
  _request: NextRequest,
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

    const legalHold = await prisma.legalHold.findUnique({
      where: { id },
      include: {
        exports: {
          orderBy: { createdAt: "desc" },
          take: 10,
        },
      },
    })

    if (!legalHold) {
      return NextResponse.json({ error: "Legal hold not found" }, { status: 404 })
    }

    // Fetch organization details if applicable
    const organization = legalHold.orgId
      ? await prisma.organization.findUnique({
          where: { id: legalHold.orgId },
          select: { id: true, name: true, slug: true },
        })
      : null

    // Fetch custodian details
    const custodianDetails = legalHold.custodians.length > 0
      ? await prisma.user.findMany({
          where: { id: { in: legalHold.custodians } },
          select: { id: true, name: true, email: true },
        })
      : []

    return NextResponse.json({
      legalHold: {
        ...legalHold,
        organization,
        custodianDetails,
      },
    })
  } catch (error) {
    console.error("Legal hold fetch error:", error)
    return NextResponse.json(
      { error: "Failed to fetch legal hold" },
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
      caseNumber,
      custodians,
      endDate,
      status,
      scope,
      notes,
      metadata,
    } = body

    const existingHold = await prisma.legalHold.findUnique({
      where: { id },
    })

    if (!existingHold) {
      return NextResponse.json({ error: "Legal hold not found" }, { status: 404 })
    }

    // Check for case number uniqueness if changing
    if (caseNumber && caseNumber !== existingHold.caseNumber) {
      const caseExists = await prisma.legalHold.findUnique({
        where: { caseNumber },
      })
      if (caseExists) {
        return NextResponse.json(
          { error: "Legal hold with this case number already exists" },
          { status: 400 }
        )
      }
    }

    // Handle release
    const releaseData: Record<string, unknown> = {}
    if (status === "RELEASED" && existingHold.status !== "RELEASED") {
      releaseData.releasedBy = session.adminId
      releaseData.releasedAt = new Date()
    }

    const legalHold = await prisma.legalHold.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(caseNumber !== undefined && { caseNumber }),
        ...(custodians !== undefined && { custodians }),
        ...(endDate !== undefined && { endDate: endDate ? new Date(endDate) : null }),
        ...(status !== undefined && { status }),
        ...(scope !== undefined && { scope }),
        ...(notes !== undefined && { notes }),
        ...(metadata !== undefined && { metadata }),
        ...releaseData,
      },
    })

    await logPlatformAudit({
      adminId: session.adminId,
      action: "update_legal_hold",
      resourceType: "legal_hold",
      resourceId: legalHold.id,
      targetOrgId: legalHold.orgId ?? undefined,
      details: {
        changes: Object.keys(body),
        previousStatus: existingHold.status,
        newStatus: legalHold.status,
      },
    })

    return NextResponse.json({ legalHold })
  } catch (error) {
    console.error("Legal hold update error:", error)
    return NextResponse.json(
      { error: "Failed to update legal hold" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  _request: NextRequest,
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

    const existingHold = await prisma.legalHold.findUnique({
      where: { id },
      include: {
        _count: {
          select: { exports: true },
        },
      },
    })

    if (!existingHold) {
      return NextResponse.json({ error: "Legal hold not found" }, { status: 404 })
    }

    // Prevent deletion of active legal holds
    if (existingHold.status === "ACTIVE") {
      return NextResponse.json(
        { error: "Cannot delete active legal holds. Release the hold first." },
        { status: 400 }
      )
    }

    // Prevent deletion if there are associated exports
    if (existingHold._count.exports > 0) {
      return NextResponse.json(
        { error: "Cannot delete legal hold with associated data exports" },
        { status: 400 }
      )
    }

    await prisma.legalHold.delete({
      where: { id },
    })

    await logPlatformAudit({
      adminId: session.adminId,
      action: "delete_legal_hold",
      resourceType: "legal_hold",
      resourceId: id,
      targetOrgId: existingHold.orgId ?? undefined,
      details: {
        name: existingHold.name,
        caseNumber: existingHold.caseNumber,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Legal hold deletion error:", error)
    return NextResponse.json(
      { error: "Failed to delete legal hold" },
      { status: 500 }
    )
  }
}
