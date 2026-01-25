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

    // Verify incident exists
    const incident = await prisma.statusPageIncident.findUnique({
      where: { id },
    })

    if (!incident) {
      return NextResponse.json({ error: "Incident not found" }, { status: 404 })
    }

    const updates = await prisma.statusPageUpdate.findMany({
      where: { incidentId: id },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json({ updates })
  } catch (error) {
    console.error("Get status page incident updates error:", error)
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

    // Verify incident exists
    const incident = await prisma.statusPageIncident.findUnique({
      where: { id },
    })

    if (!incident) {
      return NextResponse.json({ error: "Incident not found" }, { status: 404 })
    }

    // Create the update
    const update = await prisma.statusPageUpdate.create({
      data: {
        incidentId: id,
        message,
        status: status || incident.status,
        isPublic,
        createdBy: session.admin.id,
      },
    })

    // Update incident status if provided
    if (status && status !== incident.status) {
      const updateData: Record<string, unknown> = { status }

      // Set resolved timestamp if resolving
      if (status === "RESOLVED" && !incident.resolvedAt) {
        updateData.resolvedAt = new Date()
      }

      await prisma.statusPageIncident.update({
        where: { id },
        data: updateData,
      })
    }

    // Log audit
    await prisma.platformAuditLog.create({
      data: {
        adminId: session.admin.id,
        action: "CREATE",
        resourceType: "status_page_update",
        resourceId: update.id,
        details: { incidentId: id, message, status },
      },
    })

    // In production, notify subscribers here
    // await notifySubscribers(incident, update)

    return NextResponse.json({ update }, { status: 201 })
  } catch (error) {
    console.error("Create status page incident update error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
