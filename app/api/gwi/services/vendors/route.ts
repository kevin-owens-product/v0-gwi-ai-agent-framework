import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { prisma } from "@/lib/db"
import { validateSuperAdminSession } from "@/lib/super-admin"
import { hasGWIPermission } from "@/lib/gwi-permissions"

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("gwiToken")?.value

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const session = await validateSuperAdminSession(token)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (!hasGWIPermission(session.admin.role, "services:vendors:read")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get("status")
    const type = searchParams.get("type")
    const search = searchParams.get("search")

    const where: Record<string, unknown> = {}

    if (status && status !== "all") {
      where.status = status
    }

    if (type && type !== "all") {
      where.type = type
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ]
    }

    const vendors = await prisma.serviceVendor.findMany({
      where,
      include: {
        contacts: {
          where: { isPrimary: true },
          take: 1,
        },
        _count: {
          select: {
            invoices: true,
            contacts: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(vendors)
  } catch (error) {
    console.error("Failed to fetch vendors:", error)
    return NextResponse.json(
      { error: "Failed to fetch vendors" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("gwiToken")?.value

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const session = await validateSuperAdminSession(token)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (!hasGWIPermission(session.admin.role, "services:vendors:write")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()
    const {
      name,
      type = "CONTRACTOR",
      status = "ACTIVE",
      email,
      phone,
      website,
      address,
      taxId,
      paymentTerms = 30,
      currency = "USD",
      defaultHourlyRate,
      notes,
      tags = [],
    } = body

    if (!name) {
      return NextResponse.json(
        { error: "Vendor name is required" },
        { status: 400 }
      )
    }

    // Generate slug from name
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")

    // Check for duplicate slug
    const existing = await prisma.serviceVendor.findUnique({
      where: { slug },
    })

    const finalSlug = existing ? `${slug}-${Date.now()}` : slug

    const vendor = await prisma.serviceVendor.create({
      data: {
        name,
        slug: finalSlug,
        type,
        status,
        email,
        phone,
        website,
        address,
        taxId,
        paymentTerms,
        currency,
        defaultHourlyRate,
        notes,
        tags,
      },
      include: {
        contacts: true,
        _count: {
          select: {
            invoices: true,
            contacts: true,
          },
        },
      },
    })

    // Log the action
    await prisma.gWIAuditLog.create({
      data: {
        adminId: session.admin.id,
        action: "CREATE_SERVICE_VENDOR",
        resourceType: "serviceVendor",
        resourceId: vendor.id,
        newState: { name, type, status },
      },
    })

    return NextResponse.json(vendor, { status: 201 })
  } catch (error) {
    console.error("Failed to create vendor:", error)
    return NextResponse.json(
      { error: "Failed to create vendor" },
      { status: 500 }
    )
  }
}
