import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { validateSuperAdminSession } from "@/lib/super-admin"
import { cookies } from "next/headers"
import { Role } from "@prisma/client"

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
    const body = await request.json().catch(() => ({}))

    // Check if message exists
    const existingMessage = await prisma.broadcastMessage.findUnique({
      where: { id },
    })

    if (!existingMessage) {
      return NextResponse.json({ error: "Broadcast message not found" }, { status: 404 })
    }

    // Only allow sending draft or scheduled messages
    if (existingMessage.status !== "DRAFT" && existingMessage.status !== "SCHEDULED") {
      return NextResponse.json(
        { error: "Only draft or scheduled messages can be sent" },
        { status: 400 }
      )
    }

    const scheduledFor = body.scheduledFor ? new Date(body.scheduledFor) : null

    // Calculate estimated recipients based on targeting
    let totalRecipients = 0

    if (existingMessage.targetType === "ALL") {
      totalRecipients = await prisma.user.count({
        where: { emailVerified: { not: null } },
      })
    } else if (existingMessage.targetType === "SPECIFIC_ORGS" && existingMessage.targetOrgs.length > 0) {
      totalRecipients = await prisma.user.count({
        where: {
          emailVerified: { not: null },
          memberships: { some: { orgId: { in: existingMessage.targetOrgs } } },
        },
      })
    } else if (existingMessage.targetType === "SPECIFIC_PLANS" && existingMessage.targetPlans.length > 0) {
      // Get organizations with specific plans
      const orgs = await prisma.organization.findMany({
        where: { planTier: { in: existingMessage.targetPlans } },
        select: { id: true },
      })
      const orgIds = orgs.map((o) => o.id)
      totalRecipients = await prisma.user.count({
        where: {
          emailVerified: { not: null },
          memberships: { some: { orgId: { in: orgIds } } },
        },
      })
    } else if (existingMessage.targetRoles.length > 0) {
      totalRecipients = await prisma.user.count({
        where: {
          emailVerified: { not: null },
          memberships: { some: { role: { in: existingMessage.targetRoles as Role[] } } },
        },
      })
    }

    // Determine new status and update data
    let newStatus: "SCHEDULED" | "SENDING"
    let updateData: Record<string, unknown>

    if (scheduledFor && scheduledFor > new Date()) {
      // Schedule for later
      newStatus = "SCHEDULED"
      updateData = {
        status: newStatus,
        scheduledFor,
        totalRecipients,
      }
    } else {
      // Send immediately
      newStatus = "SENDING"
      updateData = {
        status: newStatus,
        sentAt: new Date(),
        scheduledFor: null,
        totalRecipients,
      }
    }

    const message = await prisma.broadcastMessage.update({
      where: { id },
      data: updateData,
    })

    // Log the action
    await prisma.platformAuditLog.create({
      data: {
        action: scheduledFor ? "broadcast_message_scheduled" : "broadcast_message_sent",
        resourceType: "broadcast_message",
        resourceId: message.id,
        
        adminId: session.admin.id,
        details: {
          title: message.title,
          scheduledFor: scheduledFor?.toISOString() || null,
          totalRecipients,
          channels: message.channels,
        },
      },
    })

    // If sending immediately, simulate sending completion
    // In production, this would be handled by a background job
    if (newStatus === "SENDING") {
      // Simulate async send completion - update to SENT status
      await prisma.broadcastMessage.update({
        where: { id },
        data: {
          status: "SENT",
          delivered: totalRecipients,
        },
      })
    }

    return NextResponse.json({
      message: {
        ...message,
        status: newStatus === "SENDING" ? "SENT" : newStatus,
      },
      scheduled: !!scheduledFor,
      totalRecipients,
    })
  } catch (error) {
    console.error("Send broadcast message error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
