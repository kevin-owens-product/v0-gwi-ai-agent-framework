import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { hashPassword } from '@/lib/auth'
import { checkAuthRateLimit, getRateLimitHeaders } from '@/lib/rate-limit'
import { z } from 'zod'

const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
})

export async function POST(request: NextRequest) {
  try {
    // Check rate limit (5 attempts per 15 minutes per IP)
    const rateLimit = await checkAuthRateLimit(request, 'resetPassword')
    if (!rateLimit.success) {
      return NextResponse.json(
        { error: 'Too many password reset attempts. Please try again later.' },
        { status: 429, headers: getRateLimitHeaders(rateLimit) }
      )
    }

    const body = await request.json()

    const validationResult = resetPasswordSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.errors[0].message },
        { status: 400 }
      )
    }

    const { token, password } = validationResult.data

    // Find the verification token
    const verificationToken = await prisma.verificationToken.findUnique({
      where: { token },
    })

    if (!verificationToken) {
      return NextResponse.json(
        { error: 'Invalid or expired reset link' },
        { status: 400 }
      )
    }

    // Check if token is expired
    if (verificationToken.expires < new Date()) {
      // Clean up expired token
      await prisma.verificationToken.delete({
        where: { token },
      })
      return NextResponse.json(
        { error: 'Reset link has expired. Please request a new one.' },
        { status: 400 }
      )
    }

    // Find the user
    const user = await prisma.user.findUnique({
      where: { email: verificationToken.identifier },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Hash the new password
    const passwordHash = await hashPassword(password)

    // Update user password and delete the token in a transaction
    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: { passwordHash },
      }),
      prisma.verificationToken.delete({
        where: { token },
      }),
    ])

    return NextResponse.json({
      message: 'Password has been reset successfully',
    })
  } catch (error) {
    console.error('Reset password error:', error)
    return NextResponse.json(
      { error: 'An error occurred. Please try again.' },
      { status: 500 }
    )
  }
}

// Validate token without resetting password
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.json(
        { valid: false, error: 'Token is required' },
        { status: 400 }
      )
    }

    const verificationToken = await prisma.verificationToken.findUnique({
      where: { token },
    })

    if (!verificationToken) {
      return NextResponse.json(
        { valid: false, error: 'Invalid reset link' },
        { status: 400 }
      )
    }

    if (verificationToken.expires < new Date()) {
      return NextResponse.json(
        { valid: false, error: 'Reset link has expired' },
        { status: 400 }
      )
    }

    return NextResponse.json({ valid: true })
  } catch (error) {
    console.error('Validate token error:', error)
    return NextResponse.json(
      { valid: false, error: 'An error occurred' },
      { status: 500 }
    )
  }
}
