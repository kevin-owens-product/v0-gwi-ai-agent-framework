import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { validateSuperAdminSession } from "@/lib/super-admin"
import { cookies } from "next/headers"

export async function GET(
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

    const plan = await prisma.plan.findUnique({
      where: { id },
      include: {
        features: {
          include: {
            feature: true,
          },
        },
        _count: {
          select: {
            tenantEntitlements: true,
          },
        },
      },
    })

    if (!plan) {
      return NextResponse.json({ error: "Plan not found" }, { status: 404 })
    }

    // Get count of organizations using this plan
    const orgsUsingPlan = await prisma.tenantEntitlement.count({
      where: {
        planId: id,
        isActive: true,
      },
    })

    return NextResponse.json({
      plan,
      orgsUsingPlan,
    })
  } catch (error) {
    console.error("Get plan error:", error)
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
      name,
      displayName,
      description,
      tier,
      isActive,
      isPublic,
      sortOrder,
      monthlyPrice,
      yearlyPrice,
      stripePriceIdMonthly,
      stripePriceIdYearly,
      limits,
      metadata,
      features, // Array of { featureId, value, limit }
    } = body

    // Check if plan exists
    const existing = await prisma.plan.findUnique({
      where: { id },
    })

    if (!existing) {
      return NextResponse.json({ error: "Plan not found" }, { status: 404 })
    }

    // Check for name conflicts
    if (name && name !== existing.name) {
      const nameConflict = await prisma.plan.findUnique({
        where: { name },
      })
      if (nameConflict) {
        return NextResponse.json(
          { error: "A plan with this name already exists" },
          { status: 400 }
        )
      }
    }

    // Update plan
    const plan = await prisma.plan.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(displayName !== undefined && { displayName }),
        ...(description !== undefined && { description }),
        ...(tier !== undefined && { tier }),
        ...(isActive !== undefined && { isActive }),
        ...(isPublic !== undefined && { isPublic }),
        ...(sortOrder !== undefined && { sortOrder }),
        ...(monthlyPrice !== undefined && { monthlyPrice }),
        ...(yearlyPrice !== undefined && { yearlyPrice }),
        ...(stripePriceIdMonthly !== undefined && { stripePriceIdMonthly }),
        ...(stripePriceIdYearly !== undefined && { stripePriceIdYearly }),
        ...(limits !== undefined && { limits }),
        ...(metadata !== undefined && { metadata }),
      },
      include: {
        features: {
          include: { feature: true },
        },
      },
    })

    // Update features if provided
    if (features !== undefined) {
      // Remove existing features
      await prisma.planFeature.deleteMany({
        where: { planId: id },
      })

      // Add new features
      if (features.length > 0) {
        await prisma.planFeature.createMany({
          data: features.map((f: { featureId: string; value: unknown; limit?: number }) => ({
            planId: id,
            featureId: f.featureId,
            value: f.value ?? true,
            limit: f.limit,
          })),
        })
      }
    }

    // Log action
    await prisma.platformAuditLog.create({
      data: {
        adminId: session.admin.id,
        action: "PLAN_UPDATED",
        resourceType: "Plan",
        resourceId: id,
        details: { planName: plan.name, changes: Object.keys(body) },
      },
    })

    // Fetch updated plan with features
    const updatedPlan = await prisma.plan.findUnique({
      where: { id },
      include: {
        features: {
          include: { feature: true },
        },
      },
    })

    return NextResponse.json({ plan: updatedPlan })
  } catch (error) {
    console.error("Update plan error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function DELETE(
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

    // Check if plan exists
    const existing = await prisma.plan.findUnique({
      where: { id },
    })

    if (!existing) {
      return NextResponse.json({ error: "Plan not found" }, { status: 404 })
    }

    // Check if any tenants are using this plan
    const tenantsUsingPlan = await prisma.tenantEntitlement.count({
      where: {
        planId: id,
        isActive: true,
      },
    })

    if (tenantsUsingPlan > 0) {
      return NextResponse.json(
        { error: `Cannot delete plan: ${tenantsUsingPlan} tenant(s) are currently using it` },
        { status: 400 }
      )
    }

    // Delete plan
    await prisma.plan.delete({
      where: { id },
    })

    // Log action
    await prisma.platformAuditLog.create({
      data: {
        adminId: session.admin.id,
        action: "PLAN_DELETED",
        resourceType: "Plan",
        resourceId: id,
        details: { planName: existing.name },
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete plan error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
