import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { prisma } from "@/lib/db"
import { validateSuperAdminSession, logPlatformAudit } from "@/lib/super-admin"

export async function GET(
  _request: NextRequest,
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

    const framework = await prisma.complianceFramework.findUnique({
      where: { id },
      include: {
        attestations: {
          orderBy: { createdAt: "desc" },
          take: 10,
        },
        audits: {
          orderBy: { scheduledDate: "desc" },
          take: 10,
        },
        _count: {
          select: {
            attestations: true,
            audits: true,
          },
        },
      },
    })

    if (!framework) {
      return NextResponse.json({ error: "Framework not found" }, { status: 404 })
    }

    return NextResponse.json({ framework })
  } catch (error) {
    console.error("Compliance framework fetch error:", error)
    return NextResponse.json(
      { error: "Failed to fetch compliance framework" },
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
      name,
      code,
      description,
      version,
      requirements,
      controls,
      isActive,
      metadata,
    } = body

    const existingFramework = await prisma.complianceFramework.findUnique({
      where: { id },
    })

    if (!existingFramework) {
      return NextResponse.json({ error: "Framework not found" }, { status: 404 })
    }

    // Check for code uniqueness if changing code
    if (code && code !== existingFramework.code) {
      const codeExists = await prisma.complianceFramework.findUnique({
        where: { code },
      })
      if (codeExists) {
        return NextResponse.json(
          { error: "Framework with this code already exists" },
          { status: 400 }
        )
      }
    }

    const framework = await prisma.complianceFramework.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(code !== undefined && { code }),
        ...(description !== undefined && { description }),
        ...(version !== undefined && { version }),
        ...(requirements !== undefined && { requirements }),
        ...(controls !== undefined && { controls }),
        ...(isActive !== undefined && { isActive }),
        ...(metadata !== undefined && { metadata }),
      },
    })

    await logPlatformAudit({
      adminId: session.adminId,
      action: "update_compliance_framework",
      resourceType: "compliance_framework",
      resourceId: framework.id,
      details: {
        changes: Object.keys(body),
        previousActive: existingFramework.isActive,
        newActive: framework.isActive,
      },
    })

    return NextResponse.json({ framework })
  } catch (error) {
    console.error("Compliance framework update error:", error)
    return NextResponse.json(
      { error: "Failed to update compliance framework" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  _request: NextRequest,
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

    const existingFramework = await prisma.complianceFramework.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            attestations: true,
            audits: true,
          },
        },
      },
    })

    if (!existingFramework) {
      return NextResponse.json({ error: "Framework not found" }, { status: 404 })
    }

    // Prevent deletion if there are associated attestations or audits
    if (existingFramework._count.attestations > 0 || existingFramework._count.audits > 0) {
      return NextResponse.json(
        { error: "Cannot delete framework with existing attestations or audits. Deactivate it instead." },
        { status: 400 }
      )
    }

    await prisma.complianceFramework.delete({
      where: { id },
    })

    await logPlatformAudit({
      adminId: session.adminId,
      action: "delete_compliance_framework",
      resourceType: "compliance_framework",
      resourceId: id,
      details: {
        name: existingFramework.name,
        code: existingFramework.code,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Compliance framework deletion error:", error)
    return NextResponse.json(
      { error: "Failed to delete compliance framework" },
      { status: 500 }
    )
  }
}
