import { NextRequest, NextResponse } from "next/server"
import { authenticateSuperAdmin } from "@/lib/super-admin"
import { cookies } from "next/headers"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null)

    if (!body) {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      )
    }

    const { email, password } = body

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

    // Provide more specific error messages for common issues
    const errorMessage = error instanceof Error ? error.message : "Unknown error"

    if (errorMessage.includes("prisma") || errorMessage.includes("database") || errorMessage.includes("connect")) {
      return NextResponse.json(
        { error: "Database connection error. Please try again later." },
        { status: 503 }
      )
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
