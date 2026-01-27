import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { prisma } from "@/lib/db"

export async function POST(_request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const gwiToken = cookieStore.get("gwiToken")?.value

    if (gwiToken) {
      // Delete the session from database
      await prisma.superAdminSession.deleteMany({
        where: { token: gwiToken },
      })

      // Clear the cookie
      cookieStore.delete("gwiToken")
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("GWI logout error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
