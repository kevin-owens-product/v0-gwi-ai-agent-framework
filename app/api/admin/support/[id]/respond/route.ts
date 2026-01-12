import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { validateSuperAdminSession } from "@/lib/super-admin"
import { cookies } from "next/headers"

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
    const { message, isInternal = false } = body

    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      )
    }

    // Get the ticket
    const ticket = await prisma.supportTicket.findUnique({
      where: { id },
    })

    if (!ticket) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 })
    }

    // Create response
    const response = await prisma.ticketResponse.create({
      data: {
        ticketId: id,
        responderId: session.admin.id,
        responderType: "admin",
        message,
        isInternal,
      },
    })

    // Update ticket - set first response time if not set
    const updateData: Record<string, unknown> = {}
    if (!ticket.firstResponseAt && !isInternal) {
      updateData.firstResponseAt = new Date()
    }
    if (ticket.status === "OPEN") {
      updateData.status = "IN_PROGRESS"
    }

    if (Object.keys(updateData).length > 0) {
      await prisma.supportTicket.update({
        where: { id },
        data: updateData,
      })
    }

    return NextResponse.json({ response })
  } catch (error) {
    console.error("Create ticket response error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
