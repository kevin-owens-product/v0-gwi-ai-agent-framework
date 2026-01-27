import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { prisma } from "@/lib/db"
import { validateSuperAdminSession } from "@/lib/super-admin"
import { hasGWIPermission } from "@/lib/gwi-permissions"

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
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

    const client = await prisma.serviceClient.findUnique({
      where: { id },
      include: {
        contacts: {
          orderBy: [{ isPrimary: "desc" }, { createdAt: "asc" }],
        },
        projects: {
          orderBy: { createdAt: "desc" },
          take: 10,
        },
        invoices: {
          orderBy: { issueDate: "desc" },
          take: 10,
        },
        _count: {
          select: {
            projects: true,
            invoices: true,
            contacts: true,
          },
        },
      },
    })

    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 })
    }

    return NextResponse.json(client)
  } catch (error) {
    console.error("Failed to fetch client:", error)
    return NextResponse.json(
      { error: "Failed to fetch client" },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
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
      logoUrl,
      status,
      billingAddress,
      taxId,
      paymentTerms,
      currency,
      accountManagerId,
      notes,
      tags,
    } = body

    const existing = await prisma.serviceClient.findUnique({
      where: { id },
    })

    if (!existing) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 })
    }

    const client = await prisma.serviceClient.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(industry !== undefined && { industry }),
        ...(website !== undefined && { website }),
        ...(logoUrl !== undefined && { logoUrl }),
        ...(status !== undefined && { status }),
        ...(billingAddress !== undefined && { billingAddress }),
        ...(taxId !== undefined && { taxId }),
        ...(paymentTerms !== undefined && { paymentTerms }),
        ...(currency !== undefined && { currency }),
        ...(accountManagerId !== undefined && { accountManagerId }),
        ...(notes !== undefined && { notes }),
        ...(tags !== undefined && { tags }),
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
        action: "UPDATE_SERVICE_CLIENT",
        resourceType: "serviceClient",
        resourceId: id,
        previousState: existing,
        newState: client,
      },
    })

    return NextResponse.json(client)
  } catch (error) {
    console.error("Failed to update client:", error)
    return NextResponse.json(
      { error: "Failed to update client" },
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
    const token = cookieStore.get("gwiToken")?.value

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const session = await validateSuperAdminSession(token)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (!hasGWIPermission(session.admin.role, "services:clients:delete")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const existing = await prisma.serviceClient.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            projects: true,
            invoices: true,
          },
        },
      },
    })

    if (!existing) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 })
    }

    // Check if client has projects or invoices
    if (existing._count.projects > 0 || existing._count.invoices > 0) {
      return NextResponse.json(
        { error: "Cannot delete client with existing projects or invoices. Archive it instead." },
        { status: 400 }
      )
    }

    await prisma.serviceClient.delete({
      where: { id },
    })

    // Log the action
    await prisma.gWIAuditLog.create({
      data: {
        adminId: session.admin.id,
        action: "DELETE_SERVICE_CLIENT",
        resourceType: "serviceClient",
        resourceId: id,
        previousState: existing,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to delete client:", error)
    return NextResponse.json(
      { error: "Failed to delete client" },
      { status: 500 }
    )
  }
}
