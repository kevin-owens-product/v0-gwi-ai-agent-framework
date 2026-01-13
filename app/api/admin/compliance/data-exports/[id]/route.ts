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

    const dataExport = await prisma.dataExport.findUnique({
      where: { id },
      include: {
        legalHold: {
          select: {
            id: true,
            name: true,
            caseNumber: true,
            status: true,
          },
        },
      },
    })

    if (!dataExport) {
      return NextResponse.json({ error: "Data export not found" }, { status: 404 })
    }

    // Fetch organization and user details
    const [organization, user, requestedByUser] = await Promise.all([
      dataExport.orgId
        ? prisma.organization.findUnique({
            where: { id: dataExport.orgId },
            select: { id: true, name: true, slug: true },
          })
        : null,
      dataExport.userId
        ? prisma.user.findUnique({
            where: { id: dataExport.userId },
            select: { id: true, name: true, email: true },
          })
        : null,
      prisma.user.findUnique({
        where: { id: dataExport.requestedBy },
        select: { id: true, name: true, email: true },
      }),
    ])

    return NextResponse.json({
      export: {
        ...dataExport,
        organization,
        user,
        requestedByUser,
        fileSize: dataExport.fileSize ? Number(dataExport.fileSize) : null,
      },
    })
  } catch (error) {
    console.error("Data export fetch error:", error)
    return NextResponse.json(
      { error: "Failed to fetch data export" },
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
      status,
      scope,
      format,
      fileUrl,
      fileSize,
      expiresAt,
      error: exportError,
      startedAt,
      completedAt,
      metadata,
    } = body

    const existingExport = await prisma.dataExport.findUnique({
      where: { id },
    })

    if (!existingExport) {
      return NextResponse.json({ error: "Data export not found" }, { status: 404 })
    }

    const dataExport = await prisma.dataExport.update({
      where: { id },
      data: {
        ...(status !== undefined && { status }),
        ...(scope !== undefined && { scope }),
        ...(format !== undefined && { format }),
        ...(fileUrl !== undefined && { fileUrl }),
        ...(fileSize !== undefined && { fileSize: BigInt(fileSize) }),
        ...(expiresAt !== undefined && { expiresAt: expiresAt ? new Date(expiresAt) : null }),
        ...(exportError !== undefined && { error: exportError }),
        ...(startedAt !== undefined && { startedAt: startedAt ? new Date(startedAt) : null }),
        ...(completedAt !== undefined && { completedAt: completedAt ? new Date(completedAt) : null }),
        ...(metadata !== undefined && { metadata }),
      },
      include: {
        legalHold: {
          select: {
            id: true,
            name: true,
            caseNumber: true,
          },
        },
      },
    })

    await logPlatformAudit({
      adminId: session.adminId,
      action: "update_data_export",
      resourceType: "data_export",
      resourceId: dataExport.id,
      targetOrgId: dataExport.orgId,
      targetUserId: dataExport.userId,
      details: {
        changes: Object.keys(body),
        previousStatus: existingExport.status,
        newStatus: dataExport.status,
      },
    })

    return NextResponse.json({
      export: {
        ...dataExport,
        fileSize: dataExport.fileSize ? Number(dataExport.fileSize) : null,
      },
    })
  } catch (error) {
    console.error("Data export update error:", error)
    return NextResponse.json(
      { error: "Failed to update data export" },
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

    const existingExport = await prisma.dataExport.findUnique({
      where: { id },
    })

    if (!existingExport) {
      return NextResponse.json({ error: "Data export not found" }, { status: 404 })
    }

    // Prevent deletion of exports that are currently processing
    if (existingExport.status === "PROCESSING") {
      return NextResponse.json(
        { error: "Cannot delete export that is currently processing" },
        { status: 400 }
      )
    }

    // Prevent deletion of exports associated with active legal holds
    if (existingExport.legalHoldId) {
      const legalHold = await prisma.legalHold.findUnique({
        where: { id: existingExport.legalHoldId },
      })

      if (legalHold && legalHold.status === "ACTIVE") {
        return NextResponse.json(
          { error: "Cannot delete export associated with an active legal hold" },
          { status: 400 }
        )
      }
    }

    await prisma.dataExport.delete({
      where: { id },
    })

    await logPlatformAudit({
      adminId: session.adminId,
      action: "delete_data_export",
      resourceType: "data_export",
      resourceId: id,
      targetOrgId: existingExport.orgId,
      targetUserId: existingExport.userId,
      details: {
        type: existingExport.type,
        status: existingExport.status,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Data export deletion error:", error)
    return NextResponse.json(
      { error: "Failed to delete data export" },
      { status: 500 }
    )
  }
}
