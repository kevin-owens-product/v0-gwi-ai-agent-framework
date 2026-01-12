import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { validateSuperAdminSession, suspendOrganization, liftOrganizationSuspension } from "@/lib/super-admin"

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
    const { reason, suspensionType = "FULL", expiresAt, notes } = body

    if (!reason) {
      return NextResponse.json(
        { error: "Reason is required" },
        { status: 400 }
      )
    }

    const suspension = await suspendOrganization({
      orgId: id,
      reason,
      suspendedBy: session.admin.id,
      suspensionType,
      expiresAt: expiresAt ? new Date(expiresAt) : undefined,
      notes,
    })

    return NextResponse.json({ suspension })
  } catch (error) {
    console.error("Suspend tenant error:", error)
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

    await liftOrganizationSuspension(id, session.admin.id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Lift suspension error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
