import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { prisma } from "@/lib/db"
import { validateSuperAdminSession, logPlatformAudit } from "@/lib/super-admin"

export async function POST(
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

    const existingDevice = await prisma.trustedDevice.findUnique({
      where: { id },
    })

    if (!existingDevice) {
      return NextResponse.json({ error: "Device not found" }, { status: 404 })
    }

    if (existingDevice.trustStatus === "TRUSTED") {
      return NextResponse.json(
        { error: "Device is already trusted" },
        { status: 400 }
      )
    }

    if (existingDevice.trustStatus === "BLOCKED") {
      return NextResponse.json(
        { error: "Device is blocked. Unblock before approving trust." },
        { status: 400 }
      )
    }

    const device = await prisma.trustedDevice.update({
      where: { id },
      data: {
        trustStatus: "TRUSTED",
        trustedAt: new Date(),
        trustedBy: session.adminId,
      },
    })

    // Query user separately since TrustedDevice doesn't have a relation to User
    const user = await prisma.user.findUnique({
      where: { id: device.userId },
      select: {
        id: true,
        email: true,
        name: true,
      },
    })

    await logPlatformAudit({
      adminId: session.adminId,
      action: "approve_device_trust",
      resourceType: "device",
      resourceId: device.id,
      details: {
        deviceId: device.deviceId,
        previousStatus: existingDevice.trustStatus,
        userId: device.userId,
        type: device.type,
        platform: device.platform,
      },
    })

    return NextResponse.json({
      device: { ...device, user },
      message: "Device trust approved successfully",
    })
  } catch (error) {
    console.error("Device trust approval error:", error)
    return NextResponse.json(
      { error: "Failed to approve device trust" },
      { status: 500 }
    )
  }
}
