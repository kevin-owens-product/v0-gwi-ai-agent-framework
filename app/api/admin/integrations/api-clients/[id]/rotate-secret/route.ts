import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { validateSuperAdminSession } from "@/lib/super-admin"
import { cookies } from "next/headers"
import { randomBytes, createHash } from "crypto"

// Generate a secure client secret
function generateClientSecret(): string {
  return `sec_${randomBytes(32).toString("hex")}`
}

// Hash a secret for storage
function hashSecret(secret: string): string {
  return createHash("sha256").update(secret).digest("hex")
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("adminToken")?.value

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const session = await validateSuperAdminSession(token)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    const existing = await prisma.aPIClient.findUnique({
      where: { id },
    })

    if (!existing) {
      return NextResponse.json({ error: "API client not found" }, { status: 404 })
    }

    if (existing.status === "REVOKED") {
      return NextResponse.json(
        { error: "Cannot rotate secret for revoked client" },
        { status: 400 }
      )
    }

    // Generate new secret
    const newSecret = generateClientSecret()
    const newSecretHash = hashSecret(newSecret)

    // Update client with new secret
    const client = await prisma.aPIClient.update({
      where: { id },
      data: {
        clientSecretHash: newSecretHash,
      },
    })

    // Log to audit
    await prisma.platformAuditLog.create({
      data: {
        adminId: session.adminId,
        action: "api_client.secret_rotated",
        resourceType: "APIClient",
        resourceId: client.id,
        targetOrgId: client.orgId,
        details: {
          name: client.name,
          clientId: client.clientId,
        },
      },
    })

    return NextResponse.json({
      success: true,
      clientSecret: newSecret, // Return the new plain secret once
      message: "Client secret rotated successfully. Please save the new secret as it will not be shown again.",
    })
  } catch (error) {
    console.error("Rotate client secret error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
