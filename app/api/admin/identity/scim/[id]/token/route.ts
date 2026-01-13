import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { prisma } from "@/lib/db"
import { validateSuperAdminSession, logPlatformAudit } from "@/lib/super-admin"
import { randomBytes, createHash } from "crypto"

// Generate a secure SCIM bearer token
function generateSCIMToken(): { token: string; hashedToken: string; prefix: string } {
  const token = `scim_${randomBytes(32).toString("hex")}`
  const hashedToken = createHash("sha256").update(token).digest("hex")
  const prefix = token.substring(0, 12)
  return { token, hashedToken, prefix }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const cookieStore = await cookies()
    const token = cookieStore.get("adminToken")?.value

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const session = await validateSuperAdminSession(token)
    if (!session) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 })
    }

    const existing = await prisma.sCIMIntegration.findUnique({
      where: { id },
    })

    if (!existing) {
      return NextResponse.json({ error: "SCIM integration not found" }, { status: 404 })
    }

    // Generate new token
    const { token: newScimToken, hashedToken, prefix } = generateSCIMToken()

    const scimIntegration = await prisma.sCIMIntegration.update({
      where: { id },
      data: {
        bearerToken: hashedToken,
        tokenPrefix: prefix,
        metadata: {
          ...(existing.metadata as Record<string, unknown>),
          lastTokenRotation: new Date().toISOString(),
          previousTokenPrefix: existing.tokenPrefix,
        },
      },
    })

    await logPlatformAudit({
      adminId: session.adminId,
      action: "regenerate_scim_token",
      resourceType: "scim_integration",
      resourceId: id,
      details: {
        orgId: existing.orgId,
        previousTokenPrefix: existing.tokenPrefix,
        newTokenPrefix: prefix,
      },
    })

    return NextResponse.json({
      success: true,
      scimIntegration: {
        id: scimIntegration.id,
        orgId: scimIntegration.orgId,
        endpoint: scimIntegration.endpoint,
        bearerToken: newScimToken, // Return the actual token only during regeneration
        tokenPrefix: prefix,
      },
      message: "IMPORTANT: Save the new bearer token now. It will not be shown again. The previous token is now invalid.",
    })
  } catch (error) {
    console.error("SCIM token regeneration error:", error)
    return NextResponse.json(
      { error: "Failed to regenerate SCIM token" },
      { status: 500 }
    )
  }
}
