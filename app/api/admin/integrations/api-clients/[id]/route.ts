import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { validateSuperAdminSession } from "@/lib/super-admin"
import { cookies } from "next/headers"
import { APIClientType, APIClientStatus } from "@prisma/client"

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

    const client = await prisma.aPIClient.findUnique({
      where: { id },
    })

    if (!client) {
      return NextResponse.json({ error: "API client not found" }, { status: 404 })
    }

    // Get organization details
    const org = await prisma.organization.findUnique({
      where: { id: client.orgId },
      select: { id: true, name: true, slug: true },
    })

    // Calculate daily request counts (simulated - would come from actual API logs)
    const usageStats = {
      totalRequests: Number(client.totalRequests),
      lastUsedAt: client.lastUsedAt,
      rateLimit: client.rateLimit,
      dailyLimit: client.dailyLimit,
      monthlyLimit: client.monthlyLimit,
    }

    return NextResponse.json({
      client: {
        ...client,
        totalRequests: Number(client.totalRequests),
        organization: org,
        usageStats,
      },
    })
  } catch (error) {
    console.error("Get API client error:", error)
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

    const existing = await prisma.aPIClient.findUnique({
      where: { id },
    })

    if (!existing) {
      return NextResponse.json({ error: "API client not found" }, { status: 404 })
    }

    const {
      name,
      description,
      type,
      status,
      redirectUris,
      allowedScopes,
      allowedGrants,
      rateLimit,
      dailyLimit,
      monthlyLimit,
      metadata,
    } = body

    const updateData: Record<string, unknown> = {}
    if (name !== undefined) updateData.name = name
    if (description !== undefined) updateData.description = description
    if (type !== undefined) updateData.type = type as APIClientType
    if (status !== undefined) updateData.status = status as APIClientStatus
    if (redirectUris !== undefined) updateData.redirectUris = redirectUris
    if (allowedScopes !== undefined) updateData.allowedScopes = allowedScopes
    if (allowedGrants !== undefined) updateData.allowedGrants = allowedGrants
    if (rateLimit !== undefined) updateData.rateLimit = rateLimit
    if (dailyLimit !== undefined) updateData.dailyLimit = dailyLimit
    if (monthlyLimit !== undefined) updateData.monthlyLimit = monthlyLimit
    if (metadata !== undefined) updateData.metadata = metadata

    const client = await prisma.aPIClient.update({
      where: { id },
      data: updateData,
    })

    // Log to audit
    await prisma.platformAuditLog.create({
      data: {
        adminId: session.adminId,
        action: "api_client.updated",
        resourceType: "APIClient",
        resourceId: client.id,
        targetOrgId: client.orgId,
        details: {
          updates: Object.keys(updateData),
        },
      },
    })

    return NextResponse.json({
      client: {
        ...client,
        totalRequests: Number(client.totalRequests),
      },
    })
  } catch (error) {
    console.error("Update API client error:", error)
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
  // PATCH is an alias for PUT with partial updates
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

    const existing = await prisma.aPIClient.findUnique({
      where: { id },
    })

    if (!existing) {
      return NextResponse.json({ error: "API client not found" }, { status: 404 })
    }

    // Soft delete by setting status to REVOKED
    const client = await prisma.aPIClient.update({
      where: { id },
      data: { status: "REVOKED" },
    })

    // Log to audit
    await prisma.platformAuditLog.create({
      data: {
        adminId: session.adminId,
        action: "api_client.revoked",
        resourceType: "APIClient",
        resourceId: client.id,
        targetOrgId: client.orgId,
        details: {
          name: client.name,
          clientId: client.clientId,
        },
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete API client error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
