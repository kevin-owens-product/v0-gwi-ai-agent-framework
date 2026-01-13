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
    const type = searchParams.get("type")
    const scope = searchParams.get("scope")
    const search = searchParams.get("search")

    const where: Record<string, unknown> = {}

    if (type && type !== "all") {
      where.type = type
    }
    if (scope && scope !== "all") {
      where.scope = scope
    }
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ]
    }

    const policies = await prisma.securityPolicy.findMany({
      where,
      orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
      include: {
        _count: {
          select: { violations: true },
        },
      },
    })

    const formattedPolicies = policies.map((policy) => ({
      ...policy,
      violationCount: policy._count.violations,
      _count: undefined,
    }))

    return NextResponse.json({ policies: formattedPolicies })
  } catch (error) {
    console.error("Security policies fetch error:", error)
    return NextResponse.json(
      { error: "Failed to fetch security policies" },
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
      type,
      scope,
      enforcementMode,
      priority,
      isActive,
      targetOrgs,
      targetPlans,
      settings,
    } = body

    if (!name || !type) {
      return NextResponse.json(
        { error: "Name and type are required" },
        { status: 400 }
      )
    }

    const policy = await prisma.securityPolicy.create({
      data: {
        name,
        description,
        type,
        scope: scope || "PLATFORM",
        enforcementMode: enforcementMode || "ENFORCE",
        priority: priority || 0,
        isActive: isActive ?? true,
        targetOrgs: targetOrgs || [],
        targetPlans: targetPlans || [],
        settings: settings || {},
        createdBy: session.adminId,
      },
    })

    await logPlatformAudit({
      adminId: session.adminId,
      action: "create_security_policy",
      resourceType: "security_policy",
      resourceId: policy.id,
      details: { name, type, scope, enforcementMode },
    })

    return NextResponse.json({ policy }, { status: 201 })
  } catch (error) {
    console.error("Security policy creation error:", error)
    return NextResponse.json(
      { error: "Failed to create security policy" },
      { status: 500 }
    )
  }
}
