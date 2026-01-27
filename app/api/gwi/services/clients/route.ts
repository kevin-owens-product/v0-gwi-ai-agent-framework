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

    if (!hasGWIPermission(session.admin.role, "services:clients:read")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get("status")
    const search = searchParams.get("search")
    const industry = searchParams.get("industry")

    const where: Record<string, unknown> = {}

    if (status && status !== "all") {
      where.status = status
    }

    if (industry) {
      where.industry = industry
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { industry: { contains: search, mode: "insensitive" } },
      ]
    }

    const clients = await prisma.serviceClient.findMany({
      where,
      include: {
        contacts: {
          where: { isPrimary: true },
          take: 1,
        },
        _count: {
          select: {
            projects: true,
            invoices: true,
            contacts: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(clients)
  } catch (error) {
    console.error("Failed to fetch clients:", error)
    return NextResponse.json(
      { error: "Failed to fetch clients" },
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

    if (!hasGWIPermission(session.admin.role, "services:clients:write")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()
    const {
      name,
      industry,
      website,
      status = "LEAD",
      billingAddress,
      taxId,
      paymentTerms = 30,
      currency = "USD",
      notes,
      tags = [],
    } = body

    if (!name) {
      return NextResponse.json(
        { error: "Client name is required" },
        { status: 400 }
      )
    }

    // Generate slug from name
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")

    // Check for duplicate slug
    const existing = await prisma.serviceClient.findUnique({
      where: { slug },
    })

    const finalSlug = existing ? `${slug}-${Date.now()}` : slug

    const client = await prisma.serviceClient.create({
      data: {
        name,
        slug: finalSlug,
        industry,
        website,
        status,
        billingAddress,
        taxId,
        paymentTerms,
        currency,
        notes,
        tags,
      },
      include: {
        contacts: true,
        _count: {
          select: {
            projects: true,
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
        action: "CREATE_SERVICE_CLIENT",
        resourceType: "serviceClient",
        resourceId: client.id,
        newState: { name, industry, status },
      },
    })

    return NextResponse.json(client, { status: 201 })
  } catch (error) {
    console.error("Failed to create client:", error)
    return NextResponse.json(
      { error: "Failed to create client" },
      { status: 500 }
    )
  }
}
