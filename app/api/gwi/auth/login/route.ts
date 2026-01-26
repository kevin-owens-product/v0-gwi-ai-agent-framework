import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { prisma } from "@/lib/db"
import bcrypt from "bcryptjs"
import { randomBytes } from "crypto"
import { canAccessGWIPortal } from "@/lib/gwi-permissions"
import { checkAuthRateLimit, getRateLimitHeaders } from "@/lib/rate-limit"
import { Prisma } from "@prisma/client"

// Error codes that indicate transient/retriable database issues
const TRANSIENT_ERROR_CODES = new Set([
  'P1001', // Can't reach database server
  'P1002', // Database server reached but timed out
  'P1008', // Operations timed out
  'P1017', // Server closed the connection
  'P2024', // Timed out fetching a new connection from the pool
])

function isServiceUnavailableError(error: unknown): boolean {
  // Check for Prisma-specific errors
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    return TRANSIENT_ERROR_CODES.has(error.code)
  }
  if (error instanceof Prisma.PrismaClientInitializationError) {
    return true
  }

  // Check error message for connection-related issues
  if (error instanceof Error) {
    const message = error.message.toLowerCase()
    return (
      message.includes('connection') ||
      message.includes('timeout') ||
      message.includes('econnrefused') ||
      message.includes('econnreset') ||
      message.includes('prisma') ||
      message.includes('database') ||
      message.includes('socket')
    )
  }

  return false
}

export async function POST(request: NextRequest) {
  try {
    // Check rate limit (5 attempts per 15 minutes per IP)
    const rateLimit = await checkAuthRateLimit(request, 'gwiLogin')
    if (!rateLimit.success) {
      return NextResponse.json(
        { error: 'Too many login attempts. Please try again later.' },
        { status: 429, headers: getRateLimitHeaders(rateLimit) }
      )
    }

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

    // Check for transient database/connection errors
    if (isServiceUnavailableError(error)) {
      return NextResponse.json(
        {
          error: "Service temporarily unavailable. Please try again in a moment.",
          retryable: true
        },
        {
          status: 503,
          headers: {
            'Retry-After': '5', // Suggest client retry after 5 seconds
          }
        }
      )
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
