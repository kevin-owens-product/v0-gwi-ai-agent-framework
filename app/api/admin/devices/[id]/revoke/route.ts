import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { prisma } from "@/lib/db"
import { validateSuperAdminSession, logPlatformAudit } from "@/lib/super-admin"

export async function POST(
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

    const body = await request.json().catch(() => ({}))
    const { reason } = body

    const existingDevice = await prisma.trustedDevice.findUnique({
      where: { id },
    })

    if (!existingDevice) {
      return NextResponse.json({ error: "Device not found" }, { status: 404 })
    }

    if (existingDevice.trustStatus === "REVOKED") {
      return NextResponse.json(
        { error: "Device trust is already revoked" },
        { status: 400 }
      )
    }

    const device = await prisma.trustedDevice.update({
      where: { id },
      data: {
        trustStatus: "REVOKED",
        trustedAt: null,
        trustedBy: null,
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
      action: "revoke_device_trust",
      resourceType: "device",
      resourceId: device.id,
      details: {
        deviceId: device.deviceId,
        reason: reason || "Trust revoked by admin",
        previousStatus: existingDevice.trustStatus,
        userId: device.userId,
      },
    })

    return NextResponse.json({
      device: deviceWithUser,
      message: "Device trust revoked successfully",
    })
  } catch (error) {
    console.error("Device revoke error:", error)
    return NextResponse.json(
      { error: "Failed to revoke device trust" },
      { status: 500 }
    )
  }
}
