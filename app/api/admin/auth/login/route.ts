import { NextRequest, NextResponse } from "next/server"
import { authenticateSuperAdmin } from "@/lib/super-admin"
import { checkAuthRateLimit, getRateLimitHeaders } from "@/lib/rate-limit"
import { cookies } from "next/headers"
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
    const rateLimit = await checkAuthRateLimit(request, 'adminLogin')
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

    const ipAddress = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || undefined
    const userAgent = request.headers.get("user-agent") || undefined

    const result = await authenticateSuperAdmin(email, password, ipAddress, userAgent)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 401 }
      )
    }

    // Set secure cookie for admin authentication
    const cookieStore = await cookies()
    const isProduction = process.env.NODE_ENV === "production"
    cookieStore.set("adminToken", result.token!, {
      httpOnly: true,
      secure: isProduction, // Secure in production (localhost doesn't support secure cookies)
      sameSite: "strict", // Strict to prevent CSRF on admin routes
      expires: result.expiresAt,
      path: "/", // Needed for both /admin pages and /api/admin routes
    })

    return NextResponse.json({
      success: true,
      admin: result.admin,
    })
  } catch (error) {
    console.error("Admin login error:", error)

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
