import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { prisma } from "@/lib/db"
import bcrypt from "bcryptjs"
import { randomBytes } from "crypto"
import { canAccessGWIPortal } from "@/lib/gwi-permissions"

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

    // Find admin by email
    const admin = await prisma.superAdmin.findUnique({
      where: { email: email.toLowerCase() },
    })

    if (!admin || !admin.isActive) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      )
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, admin.passwordHash)
    if (!isValidPassword) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      )
    }

    // Check if user has GWI portal access
    if (!canAccessGWIPortal(admin.role)) {
      return NextResponse.json(
        { error: "You do not have access to the GWI portal. Required roles: GWI_ADMIN, DATA_ENGINEER, TAXONOMY_MANAGER, ML_ENGINEER, or SUPER_ADMIN." },
        { status: 403 }
      )
    }

    // Generate session token
    const token = randomBytes(32).toString("hex")
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

    // Create session
    const ipAddress = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || undefined
    const userAgent = request.headers.get("user-agent") || undefined

    await prisma.superAdminSession.create({
      data: {
        token,
        adminId: admin.id,
        expiresAt,
        ipAddress,
        userAgent,
      },
    })

    // Update last login
    await prisma.superAdmin.update({
      where: { id: admin.id },
      data: { lastLoginAt: new Date() },
    })

    // Set GWI-specific cookie
    const cookieStore = await cookies()
    const isProduction = process.env.NODE_ENV === "production"
    cookieStore.set("gwiToken", token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: "strict",
      expires: expiresAt,
      path: "/",
    })

    return NextResponse.json({
      success: true,
      admin: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: admin.role,
      },
    })
  } catch (error) {
    console.error("GWI login error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
