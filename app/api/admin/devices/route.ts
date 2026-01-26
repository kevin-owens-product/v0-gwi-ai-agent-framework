import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { prisma } from "@/lib/db"
import { validateSuperAdminSession, logPlatformAudit } from "@/lib/super-admin"

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("adminToken")?.value

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const session = await validateSuperAdminSession(token)
    if (!session) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "20")
    const search = searchParams.get("search")
    const type = searchParams.get("type")
    const status = searchParams.get("status")
    const isCompliant = searchParams.get("isCompliant")
    const platform = searchParams.get("platform")

    const where: Record<string, unknown> = {}

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { deviceId: { contains: search, mode: "insensitive" } },
        { model: { contains: search, mode: "insensitive" } },
        { user: { email: { contains: search, mode: "insensitive" } } },
      ]
    }

    if (type && type !== "all") {
      where.type = type
    }

    if (status && status !== "all") {
      where.trustStatus = status
    }

    if (isCompliant && isCompliant !== "all") {
      where.isCompliant = isCompliant === "true"
    }

    if (platform && platform !== "all") {
      where.platform = platform
    }

    const [rawDevices, total] = await Promise.all([
      prisma.trustedDevice.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.trustedDevice.count({ where }),
    ])

    // Query users separately since TrustedDevice doesn't have a relation to User
    const userIds = [...new Set(rawDevices.map(d => d.userId))]
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: {
        id: true,
        email: true,
        name: true,
      },
    })
    const userMap = new Map(users.map(u => [u.id, u]))
    const devices = rawDevices.map(device => ({
      ...device,
      user: userMap.get(device.userId) || null,
    }))

    // Get stats
    const [totalDevices, trustedCount, pendingCount, nonCompliantCount] = await Promise.all([
      prisma.trustedDevice.count(),
      prisma.trustedDevice.count({ where: { trustStatus: "TRUSTED" } }),
      prisma.trustedDevice.count({ where: { trustStatus: "PENDING" } }),
      prisma.trustedDevice.count({ where: { isCompliant: false } }),
    ])

    return NextResponse.json({
      devices,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      stats: {
        total: totalDevices,
        trusted: trustedCount,
        pending: pendingCount,
        nonCompliant: nonCompliantCount,
      },
    })
  } catch (error) {
    console.error("Devices fetch error:", error)
    return NextResponse.json(
      { error: "Failed to fetch devices" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
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
      userId,
      deviceId,
      name,
      type,
      platform,
      osVersion,
      model,
      manufacturer,
      trustStatus,
      isCompliant,
      isManaged,
      metadata,
    } = body

    if (!userId || !deviceId || !type) {
      return NextResponse.json(
        { error: "User ID, Device ID, and device type are required" },
        { status: 400 }
      )
    }

    // Validate device type
    const validTypes = ["DESKTOP", "LAPTOP", "MOBILE", "TABLET", "OTHER"]
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: "Invalid device type" },
        { status: 400 }
      )
    }

    // Validate trust status
    const validStatuses = ["PENDING", "TRUSTED", "BLOCKED", "REVOKED"]
    if (trustStatus && !validStatuses.includes(trustStatus)) {
      return NextResponse.json(
        { error: "Invalid trust status" },
        { status: 400 }
      )
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    // Check if device ID already exists
    const existingDevice = await prisma.trustedDevice.findUnique({
      where: { deviceId },
    })

    if (existingDevice) {
      return NextResponse.json(
        { error: "A device with this ID already exists" },
        { status: 409 }
      )
    }

    // Create the device
    const device = await prisma.trustedDevice.create({
      data: {
        userId,
        deviceId,
        name: name || null,
        type,
        platform: platform || null,
        osVersion: osVersion || null,
        model: model || null,
        manufacturer: manufacturer || null,
        trustStatus: trustStatus || "PENDING",
        trustedAt: trustStatus === "TRUSTED" ? new Date() : null,
        trustedBy: trustStatus === "TRUSTED" ? session.adminId : null,
        isCompliant: isCompliant ?? true,
        isManaged: isManaged ?? false,
        metadata: metadata || {},
      },
    })

    await logPlatformAudit({
      adminId: session.adminId,
      action: "create_device",
      resourceType: "trusted_device",
      resourceId: device.id,
      details: { userId, deviceId, type, trustStatus: device.trustStatus },
    })

    return NextResponse.json({ device }, { status: 201 })
  } catch (error) {
    console.error("Device creation error:", error)
    return NextResponse.json(
      { error: "Failed to create device" },
      { status: 500 }
    )
  }
}
