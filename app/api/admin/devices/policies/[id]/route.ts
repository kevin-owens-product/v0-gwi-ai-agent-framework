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

    const policy = await prisma.devicePolicy.findUnique({
      where: { id },
    })

    if (!policy) {
      return NextResponse.json({ error: "Policy not found" }, { status: 404 })
    }

    // Get count of affected devices (devices that match this policy's criteria)
    const affectedDevicesCount = await prisma.trustedDevice.count({
      where: {
        OR: [
          ...(policy.allowedPlatforms.length > 0
            ? [{ platform: { in: policy.allowedPlatforms } }]
            : []),
          ...(policy.blockedPlatforms.length > 0
            ? [{ platform: { notIn: policy.blockedPlatforms } }]
            : []),
        ].length > 0
          ? [
              ...(policy.allowedPlatforms.length > 0
                ? [{ platform: { in: policy.allowedPlatforms } }]
                : []),
            ]
          : [{}],
      },
    })

    return NextResponse.json({
      policy: {
        ...policy,
        affectedDevicesCount,
      },
    })
  } catch (error) {
    console.error("Device policy fetch error:", error)
    return NextResponse.json(
      { error: "Failed to fetch device policy" },
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
      scope,
      targetOrgs,
      targetPlans,
      requireEncryption,
      requirePasscode,
      requireBiometric,
      requireMDM,
      minOSVersion,
      allowedPlatforms,
      blockedPlatforms,
      blockOnViolation,
      wipeOnViolation,
      notifyOnViolation,
      isActive,
      priority,
    } = body

    const existingPolicy = await prisma.devicePolicy.findUnique({
      where: { id },
    })

    if (!existingPolicy) {
      return NextResponse.json({ error: "Policy not found" }, { status: 404 })
    }

    const policy = await prisma.devicePolicy.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(scope !== undefined && { scope }),
        ...(targetOrgs !== undefined && { targetOrgs }),
        ...(targetPlans !== undefined && { targetPlans }),
        ...(requireEncryption !== undefined && { requireEncryption }),
        ...(requirePasscode !== undefined && { requirePasscode }),
        ...(requireBiometric !== undefined && { requireBiometric }),
        ...(requireMDM !== undefined && { requireMDM }),
        ...(minOSVersion !== undefined && { minOSVersion }),
        ...(allowedPlatforms !== undefined && { allowedPlatforms }),
        ...(blockedPlatforms !== undefined && { blockedPlatforms }),
        ...(blockOnViolation !== undefined && { blockOnViolation }),
        ...(wipeOnViolation !== undefined && { wipeOnViolation }),
        ...(notifyOnViolation !== undefined && { notifyOnViolation }),
        ...(isActive !== undefined && { isActive }),
        ...(priority !== undefined && { priority }),
      },
    })

    await logPlatformAudit({
      adminId: session.adminId,
      action: "update_device_policy",
      resourceType: "device_policy",
      resourceId: policy.id,
      details: {
        changes: Object.keys(body),
        previousActive: existingPolicy.isActive,
        newActive: policy.isActive,
      },
    })

    return NextResponse.json({ policy })
  } catch (error) {
    console.error("Device policy update error:", error)
    return NextResponse.json(
      { error: "Failed to update device policy" },
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

    const existingPolicy = await prisma.devicePolicy.findUnique({
      where: { id },
    })

    if (!existingPolicy) {
      return NextResponse.json({ error: "Policy not found" }, { status: 404 })
    }

    await prisma.devicePolicy.delete({
      where: { id },
    })

    await logPlatformAudit({
      adminId: session.adminId,
      action: "delete_device_policy",
      resourceType: "device_policy",
      resourceId: id,
      details: {
        name: existingPolicy.name,
        scope: existingPolicy.scope,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Device policy deletion error:", error)
    return NextResponse.json(
      { error: "Failed to delete device policy" },
      { status: 500 }
    )
  }
}
