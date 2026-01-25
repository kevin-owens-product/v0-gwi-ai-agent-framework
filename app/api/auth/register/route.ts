import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { hashPassword } from '@/lib/auth'
import { generateUniqueSlug } from '@/lib/tenant'
import { checkAuthRateLimit, getRateLimitHeaders } from '@/lib/rate-limit'
import { z } from 'zod'

const registerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  organizationName: z.string().min(1, "Organization name is required"),
})

export async function POST(request: NextRequest) {
  try {
    // Check rate limit (3 registrations per hour per IP)
    const rateLimit = await checkAuthRateLimit(request, 'register')
    if (!rateLimit.success) {
      return NextResponse.json(
        { error: 'Too many registration attempts. Please try again later.' },
        { status: 429, headers: getRateLimitHeaders(rateLimit) }
      )
    }

    const body = await request.json()

    // Validate input
    const validationResult = registerSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.errors[0].message },
        { status: 400 }
      )
    }

    const { name, email, password, organizationName } = validationResult.data

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      )
    }

    // Hash password
    const passwordHash = await hashPassword(password)

    // Generate unique org slug
    const slug = await generateUniqueSlug(organizationName)

    // Create user, organization, and membership in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create user
      const user = await tx.user.create({
        data: {
          email: email.toLowerCase(),
          name,
          passwordHash,
          emailVerified: null,
        }
      })

      // Create organization
      const organization = await tx.organization.create({
        data: {
          name: organizationName,
          slug,
          planTier: 'STARTER',
          settings: {},
        }
      })

      // Create membership (user is owner)
      await tx.organizationMember.create({
        data: {
          orgId: organization.id,
          userId: user.id,
          role: 'OWNER',
        }
      })

      // Create trial subscription
      await tx.billingSubscription.create({
        data: {
          orgId: organization.id,
          planId: 'starter',
          status: 'TRIALING',
          currentPeriodEnd: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days
        }
      })

      return { user, organization }
    })

    return NextResponse.json({
      success: true,
      user: {
        id: result.user.id,
        email: result.user.email,
        name: result.user.name,
      },
      organization: {
        id: result.organization.id,
        name: result.organization.name,
        slug: result.organization.slug,
      },
    }, { status: 201 })
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'An error occurred during registration. Please try again.' },
      { status: 500 }
    )
  }
}
