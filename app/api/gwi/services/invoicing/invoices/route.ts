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

    if (!hasGWIPermission(session.admin.role, "services:invoicing:read")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get("status")
    const clientId = searchParams.get("clientId")
    const search = searchParams.get("search")

    const where: Record<string, unknown> = {}

    if (status && status !== "all") {
      where.status = status
    }

    if (clientId) {
      where.clientId = clientId
    }

    if (search) {
      where.OR = [
        { invoiceNumber: { contains: search, mode: "insensitive" } },
      ]
    }

    const invoices = await prisma.invoice.findMany({
      where,
      include: {
        client: {
          select: { id: true, name: true, slug: true },
        },
        _count: {
          select: { lineItems: true },
        },
      },
      orderBy: { issueDate: "desc" },
    })

    return NextResponse.json(invoices)
  } catch (error) {
    console.error("Failed to fetch invoices:", error)
    return NextResponse.json(
      { error: "Failed to fetch invoices" },
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

    if (!hasGWIPermission(session.admin.role, "services:invoicing:write")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()
    const {
      clientId,
      dueDate,
      currency = "USD",
      taxRate = 0,
      notes,
      terms,
      lineItems = [],
    } = body

    if (!clientId || !dueDate) {
      return NextResponse.json(
        { error: "Client and due date are required" },
        { status: 400 }
      )
    }

    // Generate invoice number
    const lastInvoice = await prisma.invoice.findFirst({
      orderBy: { createdAt: "desc" },
      select: { invoiceNumber: true },
    })

    let nextNumber = 1
    if (lastInvoice?.invoiceNumber) {
      const match = lastInvoice.invoiceNumber.match(/INV-(\d+)/)
      if (match) {
        nextNumber = parseInt(match[1]) + 1
      }
    }
    const invoiceNumber = `INV-${nextNumber.toString().padStart(5, "0")}`

    // Calculate totals
    const subtotal = lineItems.reduce(
      (sum: number, item: { amount: number }) => sum + (item.amount || 0),
      0
    )
    const taxAmount = subtotal * (taxRate / 100)
    const total = subtotal + taxAmount

    const invoice = await prisma.invoice.create({
      data: {
        clientId,
        invoiceNumber,
        status: "DRAFT",
        dueDate: new Date(dueDate),
        currency,
        subtotal,
        taxRate,
        taxAmount,
        total,
        amountDue: total,
        notes,
        terms,
        lineItems: {
          create: lineItems.map(
            (
              item: {
                projectId?: string
                type?: string
                description: string
                quantity: number
                unitPrice: number
                amount: number
                hours?: number
                hourlyRate?: number
                taxable?: boolean
              },
              index: number
            ) => ({
              projectId: item.projectId,
              type: item.type || "SERVICE",
              description: item.description,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              amount: item.amount,
              hours: item.hours,
              hourlyRate: item.hourlyRate,
              taxable: item.taxable !== false,
              sortOrder: index,
            })
          ),
        },
      },
      include: {
        client: {
          select: { id: true, name: true, slug: true },
        },
        lineItems: true,
        _count: {
          select: { lineItems: true },
        },
      },
    })

    // Log the action
    await prisma.gWIAuditLog.create({
      data: {
        adminId: session.admin.id,
        action: "CREATE_INVOICE",
        resourceType: "invoice",
        resourceId: invoice.id,
        newState: { invoiceNumber, clientId, total },
      },
    })

    return NextResponse.json(invoice, { status: 201 })
  } catch (error) {
    console.error("Failed to create invoice:", error)
    return NextResponse.json(
      { error: "Failed to create invoice" },
      { status: 500 }
    )
  }
}
