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

    const device = await prisma.trustedDevice.findUnique({
      where: { id },
    })

    if (!device) {
      return NextResponse.json({ error: "Device not found" }, { status: 404 })
    }

    // Fetch user details separately
    const user = await prisma.user.findUnique({
      where: { id: device.userId },
      select: {
        id: true,
        email: true,
        name: true,
        avatarUrl: true,
        memberships: {
          include: {
            organization: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
          },
        },
      },
    })

    const deviceWithUser = { ...device, user }

    // Get device activity logs if available
    const activityLogs = await prisma.platformAuditLog.findMany({
      where: {
        resourceType: "device",
        resourceId: id,
      },
      orderBy: { timestamp: "desc" },
      take: 20,
    })

    return NextResponse.json({
      device: {
        ...deviceWithUser,
        activityLogs,
      },
    })
  } catch (error) {
    console.error("Device fetch error:", error)
    return NextResponse.json(
      { error: "Failed to fetch device" },
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
      isCompliant,
      complianceChecks,
      isManaged,
    } = body

    const existingDevice = await prisma.trustedDevice.findUnique({
      where: { id },
    })

    if (!existingDevice) {
      return NextResponse.json({ error: "Device not found" }, { status: 404 })
    }

    const device = await prisma.trustedDevice.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(isCompliant !== undefined && { isCompliant }),
        ...(complianceChecks !== undefined && { complianceChecks }),
        ...(isManaged !== undefined && { isManaged }),
        ...(isCompliant !== undefined && { lastComplianceCheck: new Date() }),
      },
    })

    // Fetch user details separately
    const deviceUser = await prisma.user.findUnique({
      where: { id: device.userId },
      select: { id: true, email: true, name: true },
    })

    const deviceWithUser = { ...device, user: deviceUser }

    await logPlatformAudit({
      adminId: session.adminId,
      action: "update_device",
      resourceType: "device",
      resourceId: device.id,
      details: {
        changes: Object.keys(body),
        deviceId: device.deviceId,
      },
    })

    return NextResponse.json({ device: deviceWithUser })
  } catch (error) {
    console.error("Device update error:", error)
    return NextResponse.json(
      { error: "Failed to update device" },
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

    const existingDevice = await prisma.trustedDevice.findUnique({
      where: { id },
    })

    if (!existingDevice) {
      return NextResponse.json({ error: "Device not found" }, { status: 404 })
    }

    await prisma.trustedDevice.delete({
      where: { id },
    })

    await logPlatformAudit({
      adminId: session.adminId,
      action: "delete_device",
      resourceType: "device",
      resourceId: id,
      details: {
        deviceId: existingDevice.deviceId,
        type: existingDevice.type,
        userId: existingDevice.userId,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Device deletion error:", error)
    return NextResponse.json(
      { error: "Failed to delete device" },
      { status: 500 }
    )
  }
}
