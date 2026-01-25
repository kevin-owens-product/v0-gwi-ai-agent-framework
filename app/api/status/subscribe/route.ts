import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { randomBytes } from "crypto"

// Public endpoint - no auth required
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      )
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      )
    }

    // Check if already subscribed
    const existingSubscription = await prisma.statusPageSubscription.findUnique({
      where: { email: email.toLowerCase() },
    })

    if (existingSubscription) {
      // If already subscribed and verified, return success
      if (existingSubscription.isVerified && !existingSubscription.unsubscribedAt) {
        return NextResponse.json({
          success: true,
          message: "Already subscribed to status updates",
        })
      }

      // If unsubscribed, resubscribe
      if (existingSubscription.unsubscribedAt) {
        const verifyToken = randomBytes(32).toString("hex")

        await prisma.statusPageSubscription.update({
          where: { id: existingSubscription.id },
          data: {
            unsubscribedAt: null,
            verifyToken,
            isVerified: false,
            subscribedAt: new Date(),
          },
        })

        // In production, send verification email here
        // await sendVerificationEmail(email, verifyToken)

        return NextResponse.json({
          success: true,
          message: "Verification email sent. Please check your inbox.",
        })
      }

      // If not verified, resend verification
      if (!existingSubscription.isVerified) {
        const verifyToken = randomBytes(32).toString("hex")

        await prisma.statusPageSubscription.update({
          where: { id: existingSubscription.id },
          data: { verifyToken },
        })

        // In production, send verification email here
        // await sendVerificationEmail(email, verifyToken)

        return NextResponse.json({
          success: true,
          message: "Verification email resent. Please check your inbox.",
        })
      }
    }

    // Create new subscription
    const verifyToken = randomBytes(32).toString("hex")

    await prisma.statusPageSubscription.create({
      data: {
        email: email.toLowerCase(),
        verifyToken,
        isVerified: true, // For demo purposes, auto-verify. In production, set to false and send verification email
        preferences: {
          allIncidents: true,
          impactLevels: ["MINOR", "MAJOR", "CRITICAL"],
        },
      },
    })

    // In production, send verification email here
    // await sendVerificationEmail(email, verifyToken)

    return NextResponse.json({
      success: true,
      message: "Successfully subscribed to status updates",
    })
  } catch (error) {
    console.error("Subscribe error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
