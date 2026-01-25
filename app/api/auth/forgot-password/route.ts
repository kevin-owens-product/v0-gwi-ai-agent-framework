import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { sendEmail, getPasswordResetEmailHtml } from '@/lib/email'
import { checkAuthRateLimit, getRateLimitHeaders } from '@/lib/rate-limit'
import { randomBytes } from 'crypto'
import { z } from 'zod'

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
})

export async function POST(request: NextRequest) {
  try {
    // Check rate limit (3 requests per 15 minutes per IP)
    const rateLimit = await checkAuthRateLimit(request, 'forgotPassword')
    if (!rateLimit.success) {
      return NextResponse.json(
        { error: 'Too many password reset requests. Please try again later.' },
        { status: 429, headers: getRateLimitHeaders(rateLimit) }
      )
    }

    const body = await request.json()

    const validationResult = forgotPasswordSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.errors[0].message },
        { status: 400 }
      )
    }

    const { email } = validationResult.data
    const normalizedEmail = email.toLowerCase()

    // Find user (but don't reveal if they exist)
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    })

    // Always return success to prevent email enumeration attacks
    if (!user) {
      console.log(`Password reset requested for non-existent email: ${normalizedEmail}`)
      return NextResponse.json({
        message: 'If an account exists with this email, a password reset link has been sent.',
      })
    }

    // Generate secure token
    const token = randomBytes(32).toString('hex')
    const expires = new Date(Date.now() + 60 * 60 * 1000) // 1 hour from now

    // Delete any existing tokens for this email
    await prisma.verificationToken.deleteMany({
      where: { identifier: normalizedEmail },
    })

    // Create new verification token
    await prisma.verificationToken.create({
      data: {
        identifier: normalizedEmail,
        token,
        expires,
      },
    })

    // Build reset URL
    const baseUrl = process.env.NEXTAUTH_URL || process.env.RENDER_EXTERNAL_URL || 'http://localhost:3000'
    const resetUrl = `${baseUrl}/reset-password?token=${token}`

    // Send email
    try {
      await sendEmail({
        to: normalizedEmail,
        subject: 'Reset your GWI password',
        html: getPasswordResetEmailHtml({
          resetUrl,
          userName: user.name || undefined,
        }),
      })
    } catch (emailError) {
      console.error('Failed to send password reset email:', emailError)
      // Don't expose email errors to prevent enumeration
    }

    return NextResponse.json({
      message: 'If an account exists with this email, a password reset link has been sent.',
    })
  } catch (error) {
    console.error('Forgot password error:', error)
    return NextResponse.json(
      { error: 'An error occurred. Please try again.' },
      { status: 500 }
    )
  }
}
