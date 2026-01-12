import { NextRequest, NextResponse } from "next/server"
import { authenticateSuperAdmin } from "@/lib/super-admin"
import { cookies } from "next/headers"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      )
    }

    const ipAddress = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || undefined
    const userAgent = request.headers.get("user-agent") || undefined

    const result = await authenticateSuperAdmin(email, password, ipAddress, userAgent)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 401 }
      )
    }

    // Set cookie
    const cookieStore = await cookies()
    cookieStore.set("adminToken", result.token!, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      expires: result.expiresAt,
      path: "/",
    })

    return NextResponse.json({
      success: true,
      admin: result.admin,
    })
  } catch (error) {
    console.error("Admin login error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
