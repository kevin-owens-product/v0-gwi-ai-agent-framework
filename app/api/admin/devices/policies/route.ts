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
    const scope = searchParams.get("scope")
    const isActive = searchParams.get("isActive")

    const where: Record<string, unknown> = {}

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ]
    }

    if (scope && scope !== "all") {
      where.scope = scope
    }

    if (isActive && isActive !== "all") {
      where.isActive = isActive === "true"
    }

    const [policies, total] = await Promise.all([
      prisma.devicePolicy.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
      }),
      prisma.devicePolicy.count({ where }),
    ])

    // Get stats
    const [totalPolicies, activeCount, enforcingCount] = await Promise.all([
      prisma.devicePolicy.count(),
      prisma.devicePolicy.count({ where: { isActive: true } }),
      prisma.devicePolicy.count({ where: { isActive: true, blockOnViolation: true } }),
    ])

    return NextResponse.json({
      policies,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      stats: {
        total: totalPolicies,
        active: activeCount,
        enforcing: enforcingCount,
      },
    })
  } catch (error) {
    console.error("Device policies fetch error:", error)
    return NextResponse.json(
      { error: "Failed to fetch device policies" },
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

    if (!name) {
      return NextResponse.json(
        { error: "Policy name is required" },
        { status: 400 }
      )
    }

    const policy = await prisma.devicePolicy.create({
      data: {
        name,
        description,
        scope: scope || "PLATFORM",
        targetOrgs: targetOrgs || [],
        targetPlans: targetPlans || [],
        requireEncryption: requireEncryption ?? false,
        requirePasscode: requirePasscode ?? false,
        requireBiometric: requireBiometric ?? false,
        requireMDM: requireMDM ?? false,
        minOSVersion: minOSVersion || {},
        allowedPlatforms: allowedPlatforms || [],
        blockedPlatforms: blockedPlatforms || [],
        blockOnViolation: blockOnViolation ?? false,
        wipeOnViolation: wipeOnViolation ?? false,
        notifyOnViolation: notifyOnViolation ?? true,
        isActive: isActive ?? true,
        priority: priority || 0,
        createdBy: session.adminId,
      },
    })

    await logPlatformAudit({
      adminId: session.adminId,
      action: "create_device_policy",
      resourceType: "device_policy",
      resourceId: policy.id,
      details: {
        name,
        scope: policy.scope,
        isActive: policy.isActive,
      },
    })

    return NextResponse.json({ policy }, { status: 201 })
  } catch (error) {
    console.error("Device policy creation error:", error)
    return NextResponse.json(
      { error: "Failed to create device policy" },
      { status: 500 }
    )
  }
}
