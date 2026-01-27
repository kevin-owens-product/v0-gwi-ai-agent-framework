import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { validateSuperAdminSession } from "@/lib/super-admin"
import { cookies } from "next/headers"

export async function POST(
  _request: NextRequest,
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

    // Only allow cancelling scheduled messages
    if (existingMessage.status !== "SCHEDULED") {
      return NextResponse.json(
        { error: "Only scheduled messages can be cancelled" },
        { status: 400 }
      )
    }

    const message = await prisma.broadcastMessage.update({
      where: { id },
      data: {
        status: "CANCELLED",
        scheduledFor: null,
      },
    })

    // Log the action
    await prisma.platformAuditLog.create({
      data: {
        action: "broadcast_message_cancelled",
        resourceType: "broadcast_message",
        resourceId: message.id,
        adminId: session.admin.id,
        details: {
          title: message.title,
          originalScheduledFor: existingMessage.scheduledFor?.toISOString(),
        },
      },
    })

    return NextResponse.json({ message })
  } catch (error) {
    console.error("Cancel broadcast message error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
