import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { validateSuperAdminSession } from "@/lib/super-admin"
import { cookies } from "next/headers"
import { IntegrationCategory, IntegrationStatus } from "@prisma/client"

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

    const app = await prisma.integrationApp.findUnique({
      where: { id },
      include: {
        installations: {
          orderBy: { createdAt: "desc" },
          take: 10,
        },
        _count: {
          select: {
            installations: true,
          },
        },
      },
    })

    if (!app) {
      return NextResponse.json({ error: "Integration app not found" }, { status: 404 })
    }

    // Get installation statistics
    const installStats = await prisma.integrationInstall.groupBy({
      by: ["status"],
      where: { appId: id },
      _count: true,
    })

    const statusCounts = {
      ACTIVE: 0,
      PAUSED: 0,
      UNINSTALLED: 0,
    }

    installStats.forEach(s => {
      statusCounts[s.status as keyof typeof statusCounts] = s._count
    })

    // Get organizations for recent installations
    const orgIds = app.installations.map(i => i.orgId)
    const orgs = await prisma.organization.findMany({
      where: { id: { in: orgIds } },
      select: { id: true, name: true, slug: true },
    })
    const orgMap = new Map(orgs.map(o => [o.id, o]))

    const installationsWithOrgs = app.installations.map(install => ({
      ...install,
      organization: orgMap.get(install.orgId),
    }))

    return NextResponse.json({
      app: {
        ...app,
        installations: installationsWithOrgs,
        installStats: statusCounts,
      },
    })
  } catch (error) {
    console.error("Get integration app error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function PUT(
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

    const existing = await prisma.integrationApp.findUnique({
      where: { id },
    })

    if (!existing) {
      return NextResponse.json({ error: "Integration app not found" }, { status: 404 })
    }

    const {
      name,
      description,
      shortDescription,
      category,
      developer,
      developerUrl,
      supportUrl,
      privacyUrl,
      iconUrl,
      bannerUrl,
      status,
      isOfficial,
      isFeatured,
      requiredScopes,
      optionalScopes,
      setupInstructions,
      configSchema,
      allowedPlans,
      blockedOrgs,
      metadata,
    } = body

    const updateData: Record<string, unknown> = {}
    if (name !== undefined) updateData.name = name
    if (description !== undefined) updateData.description = description
    if (shortDescription !== undefined) updateData.shortDescription = shortDescription
    if (category !== undefined) updateData.category = category as IntegrationCategory
    if (developer !== undefined) updateData.developer = developer
    if (developerUrl !== undefined) updateData.developerUrl = developerUrl
    if (supportUrl !== undefined) updateData.supportUrl = supportUrl
    if (privacyUrl !== undefined) updateData.privacyUrl = privacyUrl
    if (iconUrl !== undefined) updateData.iconUrl = iconUrl
    if (bannerUrl !== undefined) updateData.bannerUrl = bannerUrl
    if (status !== undefined) {
      updateData.status = status as IntegrationStatus
      // Set publishedAt when publishing
      if (status === "PUBLISHED" && existing.status !== "PUBLISHED") {
        updateData.publishedAt = new Date()
      }
    }
    if (isOfficial !== undefined) updateData.isOfficial = isOfficial
    if (isFeatured !== undefined) updateData.isFeatured = isFeatured
    if (requiredScopes !== undefined) updateData.requiredScopes = requiredScopes
    if (optionalScopes !== undefined) updateData.optionalScopes = optionalScopes
    if (setupInstructions !== undefined) updateData.setupInstructions = setupInstructions
    if (configSchema !== undefined) updateData.configSchema = configSchema
    if (allowedPlans !== undefined) updateData.allowedPlans = allowedPlans
    if (blockedOrgs !== undefined) updateData.blockedOrgs = blockedOrgs
    if (metadata !== undefined) updateData.metadata = metadata

    const app = await prisma.integrationApp.update({
      where: { id },
      data: updateData,
    })

    // Log to audit
    await prisma.platformAuditLog.create({
      data: {
        adminId: session.adminId,
        action: "integration_app.updated",
        resourceType: "IntegrationApp",
        resourceId: app.id,
        details: {
          updates: Object.keys(updateData),
        },
      },
    })

    return NextResponse.json({ app })
  } catch (error) {
    console.error("Update integration app error:", error)
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
  return PUT(request, { params })
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

    const existing = await prisma.integrationApp.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            installations: {
              where: { status: "ACTIVE" },
            },
          },
        },
      },
    })

    if (!existing) {
      return NextResponse.json({ error: "Integration app not found" }, { status: 404 })
    }

    // Check if there are active installations
    if (existing._count.installations > 0) {
      return NextResponse.json(
        {
          error: "Cannot delete app with active installations. Set status to DEPRECATED first.",
        },
        { status: 400 }
      )
    }

    // Delete the app (this will cascade to installations)
    await prisma.integrationApp.delete({
      where: { id },
    })

    // Log to audit
    await prisma.platformAuditLog.create({
      data: {
        adminId: session.adminId,
        action: "integration_app.deleted",
        resourceType: "IntegrationApp",
        resourceId: id,
        details: {
          name: existing.name,
          slug: existing.slug,
        },
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete integration app error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
