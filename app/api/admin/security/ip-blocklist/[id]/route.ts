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

    const entry = await prisma.iPBlocklist.findUnique({
      where: { id },
    })

    if (!entry) {
      return NextResponse.json({ error: "IP blocklist entry not found" }, { status: 404 })
    }

    // Check if entry is expired
    const isExpired = entry.expiresAt ? new Date(entry.expiresAt) < new Date() : false

    return NextResponse.json({
      entry: {
        ...entry,
        isExpired,
      },
    })
  } catch (error) {
    console.error("IP blocklist entry fetch error:", error)
    return NextResponse.json(
      { error: "Failed to fetch IP blocklist entry" },
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
      ipAddress,
      ipRange,
      type,
      reason,
      expiresAt,
      isActive,
      metadata,
    } = body

    const existingEntry = await prisma.iPBlocklist.findUnique({
      where: { id },
    })

    if (!existingEntry) {
      return NextResponse.json({ error: "IP blocklist entry not found" }, { status: 404 })
    }

    // Validate IP address format if provided
    if (ipAddress) {
      const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/
      const ipv6Regex = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/
      if (!ipv4Regex.test(ipAddress) && !ipv6Regex.test(ipAddress)) {
        return NextResponse.json(
          { error: "Invalid IP address format" },
          { status: 400 }
        )
      }

      // Check for duplicate if IP address is being changed
      if (ipAddress !== existingEntry.ipAddress) {
        const duplicate = await prisma.iPBlocklist.findFirst({
          where: {
            ipAddress,
            orgId: existingEntry.orgId,
            id: { not: id },
          },
        })

        if (duplicate) {
          return NextResponse.json(
            { error: "IP address already exists in blocklist for this scope" },
            { status: 409 }
          )
        }
      }
    }

    const updateData: Record<string, unknown> = {}
    if (ipAddress !== undefined) updateData.ipAddress = ipAddress
    if (ipRange !== undefined) updateData.ipRange = ipRange
    if (type !== undefined) updateData.type = type
    if (reason !== undefined) updateData.reason = reason
    if (expiresAt !== undefined) updateData.expiresAt = expiresAt ? new Date(expiresAt) : null
    if (isActive !== undefined) updateData.isActive = isActive
    if (metadata !== undefined) updateData.metadata = metadata

    const entry = await prisma.iPBlocklist.update({
      where: { id },
      data: updateData,
    })

    await logPlatformAudit({
      adminId: session.adminId,
      action: "update_ip_blocklist_entry",
      resourceType: "ip_blocklist",
      resourceId: id,
      targetOrgId: entry.orgId,
      details: {
        changes: Object.keys(body),
        previousIp: existingEntry.ipAddress,
        newIp: entry.ipAddress,
        previousActive: existingEntry.isActive,
        newActive: entry.isActive,
      },
    })

    return NextResponse.json({ entry })
  } catch (error) {
    console.error("IP blocklist entry update error:", error)
    return NextResponse.json(
      { error: "Failed to update IP blocklist entry" },
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

    const existingEntry = await prisma.iPBlocklist.findUnique({
      where: { id },
    })

    if (!existingEntry) {
      return NextResponse.json({ error: "IP blocklist entry not found" }, { status: 404 })
    }

    await prisma.iPBlocklist.delete({
      where: { id },
    })

    await logPlatformAudit({
      adminId: session.adminId,
      action: "delete_ip_blocklist_entry",
      resourceType: "ip_blocklist",
      resourceId: id,
      targetOrgId: existingEntry.orgId,
      details: {
        ipAddress: existingEntry.ipAddress,
        type: existingEntry.type,
        reason: existingEntry.reason,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("IP blocklist entry deletion error:", error)
    return NextResponse.json(
      { error: "Failed to delete IP blocklist entry" },
      { status: 500 }
    )
  }
}
