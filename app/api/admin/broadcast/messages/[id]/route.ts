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

    const message = await prisma.broadcastMessage.findUnique({
      where: { id },
    })

    if (!message) {
      return NextResponse.json({ error: "Broadcast message not found" }, { status: 404 })
    }

    // Get target organization details if specific orgs targeted
    const targetOrgDetails = message.targetOrgs.length > 0
      ? await prisma.organization.findMany({
          where: { id: { in: message.targetOrgs } },
          select: { id: true, name: true, slug: true, planTier: true },
        })
      : []

    // Get audit logs related to this message
    const auditLogs = await prisma.platformAuditLog.findMany({
      where: {
        resourceType: "broadcast_message",
        resourceId: id,
      },
      orderBy: { timestamp: "desc" },
      take: 20,
    })

    // Get creator details if available
    let creator = null
    if (message.createdBy) {
      creator = await prisma.superAdmin.findUnique({
        where: { id: message.createdBy },
        select: { id: true, email: true, name: true },
      })
    }

    return NextResponse.json({
      message: {
        ...message,
        targetOrgDetails,
        auditLogs,
        creator,
      },
    })
  } catch (error) {
    console.error("Get broadcast message error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function PUT(
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

    // Check if message exists
    const existingMessage = await prisma.broadcastMessage.findUnique({
      where: { id },
    })

    if (!existingMessage) {
      return NextResponse.json({ error: "Broadcast message not found" }, { status: 404 })
    }

    // Only allow editing draft messages
    if (existingMessage.status !== "DRAFT") {
      return NextResponse.json(
        { error: "Only draft messages can be edited" },
        { status: 400 }
      )
    }

    // Validate type if provided
    const validTypes = ["ANNOUNCEMENT", "PRODUCT_UPDATE", "MAINTENANCE", "SECURITY_ALERT", "MARKETING", "SURVEY"]
    if (body.type && !validTypes.includes(body.type)) {
      return NextResponse.json({ error: "Invalid broadcast type" }, { status: 400 })
    }

    // Validate priority if provided
    const validPriorities = ["LOW", "NORMAL", "HIGH", "URGENT"]
    if (body.priority && !validPriorities.includes(body.priority)) {
      return NextResponse.json({ error: "Invalid priority" }, { status: 400 })
    }

    // Validate target type if provided
    const validTargetTypes = ["ALL", "SPECIFIC_ORGS", "SPECIFIC_PLANS", "SPECIFIC_ROLES"]
    if (body.targetType && !validTargetTypes.includes(body.targetType)) {
      return NextResponse.json({ error: "Invalid target type" }, { status: 400 })
    }

    // Validate channels if provided
    const validChannels = ["IN_APP", "EMAIL", "PUSH", "SMS", "SLACK"]
    if (body.channels) {
      const invalidChannels = body.channels.filter((c: string) => !validChannels.includes(c))
      if (invalidChannels.length > 0) {
        return NextResponse.json({ error: `Invalid channels: ${invalidChannels.join(", ")}` }, { status: 400 })
      }
    }

    // Build update data
    const updateData: Record<string, unknown> = {}

    if (body.title !== undefined) updateData.title = body.title.trim()
    if (body.content !== undefined) updateData.content = body.content.trim()
    if (body.contentHtml !== undefined) updateData.contentHtml = body.contentHtml
    if (body.type !== undefined) updateData.type = body.type
    if (body.priority !== undefined) updateData.priority = body.priority
    if (body.targetType !== undefined) updateData.targetType = body.targetType
    if (body.targetOrgs !== undefined) updateData.targetOrgs = body.targetOrgs
    if (body.targetPlans !== undefined) updateData.targetPlans = body.targetPlans
    if (body.targetRoles !== undefined) updateData.targetRoles = body.targetRoles
    if (body.channels !== undefined) updateData.channels = body.channels
    if (body.expiresAt !== undefined) updateData.expiresAt = body.expiresAt ? new Date(body.expiresAt) : null
    if (body.metadata !== undefined) updateData.metadata = body.metadata

    const message = await prisma.broadcastMessage.update({
      where: { id },
      data: updateData,
    })

    // Log the action
    await prisma.platformAuditLog.create({
      data: {
        action: "broadcast_message_updated",
        resourceType: "broadcast_message",
        resourceId: message.id,
        adminId: session.admin.id,
        details: {
          updatedFields: Object.keys(updateData),
        },
      },
    })

    return NextResponse.json({ message })
  } catch (error) {
    console.error("Update broadcast message error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function DELETE(
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

    // Check if message exists
    const existingMessage = await prisma.broadcastMessage.findUnique({
      where: { id },
    })

    if (!existingMessage) {
      return NextResponse.json({ error: "Broadcast message not found" }, { status: 404 })
    }

    // Don't allow deleting messages that are currently being sent
    if (existingMessage.status === "SENDING") {
      return NextResponse.json(
        { error: "Cannot delete a message that is currently being sent" },
        { status: 400 }
      )
    }

    await prisma.broadcastMessage.delete({
      where: { id },
    })

    // Log the action
    await prisma.platformAuditLog.create({
      data: {
        action: "broadcast_message_deleted",
        resourceType: "broadcast_message",
        resourceId: id,
        adminId: session.admin.id,
        details: {
          title: existingMessage.title,
          status: existingMessage.status,
        },
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete broadcast message error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
