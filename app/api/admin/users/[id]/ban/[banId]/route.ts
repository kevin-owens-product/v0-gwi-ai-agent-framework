import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { validateSuperAdminSession, liftUserBan } from "@/lib/super-admin"

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; banId: string }> }
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

    const { banId } = await params

    await liftUserBan(banId, session.admin.id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Lift ban error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
