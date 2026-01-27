import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { validateSuperAdminSession } from "@/lib/super-admin"
import { cookies } from "next/headers"

export async function GET(
  _request: NextRequest,
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

    const feature = await prisma.feature.findUnique({
      where: { id },
      include: {
        plans: {
          include: {
            plan: {
              select: {
                id: true,
                name: true,
                displayName: true,
                tier: true,
              },
            },
          },
        },
        _count: {
          select: {
            tenantEntitlements: true,
          },
        },
      },
    })

    if (!feature) {
      return NextResponse.json({ error: "Feature not found" }, { status: 404 })
    }

    return NextResponse.json({ feature })
  } catch (error) {
    console.error("Get feature error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function PATCH(
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
    const body = await request.json()

    const {
      key,
      name,
      description,
      category,
      isActive,
      sortOrder,
      valueType,
      defaultValue,
      metadata,
    } = body

    // Check if feature exists
    const existing = await prisma.feature.findUnique({
      where: { id },
    })

    if (!existing) {
      return NextResponse.json({ error: "Feature not found" }, { status: 404 })
    }

    // Check for key conflicts
    if (key && key !== existing.key) {
      // Validate key format
      if (!/^[a-z][a-z0-9_]*$/.test(key)) {
        return NextResponse.json(
          { error: "Key must be in snake_case format" },
          { status: 400 }
        )
      }

      const keyConflict = await prisma.feature.findUnique({
        where: { key },
      })
      if (keyConflict) {
        return NextResponse.json(
          { error: "A feature with this key already exists" },
          { status: 400 }
        )
      }
    }

    const feature = await prisma.feature.update({
      where: { id },
      data: {
        ...(key !== undefined && { key }),
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(category !== undefined && { category }),
        ...(isActive !== undefined && { isActive }),
        ...(sortOrder !== undefined && { sortOrder }),
        ...(valueType !== undefined && { valueType }),
        ...(defaultValue !== undefined && { defaultValue }),
        ...(metadata !== undefined && { metadata }),
      },
    })

    // Log action
    await prisma.platformAuditLog.create({
      data: {
        adminId: session.admin.id,
        action: "FEATURE_UPDATED",
        resourceType: "Feature",
        resourceId: id,
        details: { featureKey: feature.key, changes: Object.keys(body) },
      },
    })

    return NextResponse.json({ feature })
  } catch (error) {
    console.error("Update feature error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  _request: NextRequest,
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

    // Check if feature exists
    const existing = await prisma.feature.findUnique({
      where: { id },
    })

    if (!existing) {
      return NextResponse.json({ error: "Feature not found" }, { status: 404 })
    }

    // Check if feature is in use
    const plansUsingFeature = await prisma.planFeature.count({
      where: { featureId: id },
    })

    if (plansUsingFeature > 0) {
      return NextResponse.json(
        { error: `Cannot delete feature: It is used in ${plansUsingFeature} plan(s)` },
        { status: 400 }
      )
    }

    // Delete feature
    await prisma.feature.delete({
      where: { id },
    })

    // Log action
    await prisma.platformAuditLog.create({
      data: {
        adminId: session.admin.id,
        action: "FEATURE_DELETED",
        resourceType: "Feature",
        resourceId: id,
        details: { featureKey: existing.key },
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete feature error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
