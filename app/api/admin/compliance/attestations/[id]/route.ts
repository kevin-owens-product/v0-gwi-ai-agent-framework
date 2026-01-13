import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { prisma } from "@/lib/db"
import { validateSuperAdminSession, logPlatformAudit } from "@/lib/super-admin"

export async function GET(
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

    const attestation = await prisma.complianceAttestation.findUnique({
      where: { id },
      include: {
        framework: true,
      },
    })

    if (!attestation) {
      return NextResponse.json({ error: "Attestation not found" }, { status: 404 })
    }

    // Fetch organization details
    const organization = await prisma.organization.findUnique({
      where: { id: attestation.orgId },
      select: { id: true, name: true, slug: true },
    })

    return NextResponse.json({
      attestation: {
        ...attestation,
        organization,
      },
    })
  } catch (error) {
    console.error("Compliance attestation fetch error:", error)
    return NextResponse.json(
      { error: "Failed to fetch compliance attestation" },
      { status: 500 }
    )
  }
}

export async function PUT(
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

    const body = await request.json()
    const {
      status,
      score,
      findings,
      evidence,
      attestedBy,
      attestedAt,
      validUntil,
      notes,
      metadata,
    } = body

    const existingAttestation = await prisma.complianceAttestation.findUnique({
      where: { id },
    })

    if (!existingAttestation) {
      return NextResponse.json({ error: "Attestation not found" }, { status: 404 })
    }

    const attestation = await prisma.complianceAttestation.update({
      where: { id },
      data: {
        ...(status !== undefined && { status }),
        ...(score !== undefined && { score }),
        ...(findings !== undefined && { findings }),
        ...(evidence !== undefined && { evidence }),
        ...(attestedBy !== undefined && { attestedBy }),
        ...(attestedAt !== undefined && { attestedAt: attestedAt ? new Date(attestedAt) : null }),
        ...(validUntil !== undefined && { validUntil: validUntil ? new Date(validUntil) : null }),
        ...(notes !== undefined && { notes }),
        ...(metadata !== undefined && { metadata }),
      },
      include: {
        framework: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
    })

    await logPlatformAudit({
      adminId: session.adminId,
      action: "update_compliance_attestation",
      resourceType: "compliance_attestation",
      resourceId: attestation.id,
      targetOrgId: attestation.orgId,
      details: {
        changes: Object.keys(body),
        previousStatus: existingAttestation.status,
        newStatus: attestation.status,
      },
    })

    return NextResponse.json({ attestation })
  } catch (error) {
    console.error("Compliance attestation update error:", error)
    return NextResponse.json(
      { error: "Failed to update compliance attestation" },
      { status: 500 }
    )
  }
}

export async function DELETE(
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

    const existingAttestation = await prisma.complianceAttestation.findUnique({
      where: { id },
      include: {
        framework: {
          select: { name: true, code: true },
        },
      },
    })

    if (!existingAttestation) {
      return NextResponse.json({ error: "Attestation not found" }, { status: 404 })
    }

    await prisma.complianceAttestation.delete({
      where: { id },
    })

    await logPlatformAudit({
      adminId: session.adminId,
      action: "delete_compliance_attestation",
      resourceType: "compliance_attestation",
      resourceId: id,
      targetOrgId: existingAttestation.orgId,
      details: {
        frameworkCode: existingAttestation.framework.code,
        status: existingAttestation.status,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Compliance attestation deletion error:", error)
    return NextResponse.json(
      { error: "Failed to delete compliance attestation" },
      { status: 500 }
    )
  }
}
