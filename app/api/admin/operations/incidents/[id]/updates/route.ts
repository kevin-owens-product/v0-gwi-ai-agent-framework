import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { validateSuperAdminSession } from "@/lib/super-admin"
import { cookies } from "next/headers"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("adminToken")?.value

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const session = await validateSuperAdminSession(token)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "50")
    const isPublic = searchParams.get("isPublic")

    // Verify incident exists
    const incident = await prisma.platformIncident.findUnique({
      where: { id },
    })

    if (!incident) {
      return NextResponse.json({ error: "Incident not found" }, { status: 404 })
    }

    const where: Record<string, unknown> = {
      incidentId: id,
    }

    if (isPublic !== null && isPublic !== undefined) {
      where.isPublic = isPublic === "true"
    }

    const [updates, total] = await Promise.all([
      prisma.incidentUpdate.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.incidentUpdate.count({ where }),
    ])

    // Get poster details
    const posterIds = updates.map(u => u.postedBy).filter(Boolean) as string[]
    const posterDetails = posterIds.length > 0
      ? await prisma.superAdmin.findMany({
          where: { id: { in: posterIds } },
          select: { id: true, name: true, email: true },
        })
      : []

    const posterMap = new Map(posterDetails.map(p => [p.id, p]))

    const updatesWithPosters = updates.map(update => ({
      ...update,
      poster: update.postedBy ? posterMap.get(update.postedBy) || null : null,
    }))

    return NextResponse.json({
      updates: updatesWithPosters,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    })
  } catch (error) {
    console.error("Get incident updates error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("adminToken")?.value

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const session = await validateSuperAdminSession(token)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()

    const { message, status, isPublic = true } = body

    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      )
    }

    // Verify incident exists and update its status if provided
    const incident = await prisma.platformIncident.findUnique({
      where: { id },
    })

    if (!incident) {
      return NextResponse.json({ error: "Incident not found" }, { status: 404 })
    }

    // Create the update
    const update = await prisma.incidentUpdate.create({
      data: {
        incidentId: id,
        message,
        status: status || null,
        isPublic,
        postedBy: session.admin.id,
      },
    })

    // Update incident status and timeline if status provided
    if (status && status !== incident.status) {
      const timeline = incident.timeline as Array<Record<string, unknown>>
      await prisma.platformIncident.update({
        where: { id },
        data: {
          status,
          timeline: [
            ...timeline,
            {
              timestamp: new Date().toISOString(),
              event: `Status changed to ${status}: ${message}`,
              actor: session.admin.name || session.admin.email,
            },
          ],
          ...(status === "RESOLVED" && !incident.resolvedAt
            ? { resolvedAt: new Date() }
            : {}),
          ...(status === "MONITORING" && !incident.mitigatedAt
            ? { mitigatedAt: new Date() }
            : {}),
          ...(status === "IDENTIFIED" && !incident.acknowledgedAt
            ? { acknowledgedAt: new Date() }
            : {}),
        },
      })
    }

    // Log audit
    await prisma.platformAuditLog.create({
      data: {
        adminId: session.admin.id,
        action: "CREATE",
        resourceType: "incident_update",
        resourceId: update.id,
        details: { incidentId: id, message, status },
      },
    })

    return NextResponse.json({ update }, { status: 201 })
  } catch (error) {
    console.error("Create incident update error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
