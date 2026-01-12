import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { prisma } from "@/lib/db"

export async function POST() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("adminToken")?.value

    if (token) {
      // Delete the session from database
      await prisma.superAdminSession.deleteMany({
        where: { token },
      })
    }

    // Clear the cookie
    cookieStore.delete("adminToken")

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Admin logout error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
