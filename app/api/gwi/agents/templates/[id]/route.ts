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

    if (!hasGWIPermission(session.admin.role, "agents:read")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const template = await prisma.systemAgentTemplate.findUnique({
      where: { id },
      include: {
        createdBy: { select: { id: true, name: true, email: true } },
        organization: { select: { id: true, name: true, slug: true } },
      },
    })

    if (!template) {
      return NextResponse.json({ error: "Agent template not found" }, { status: 404 })
    }

    return NextResponse.json(template)
  } catch (error) {
    console.error("Failed to fetch agent template:", error)
    return NextResponse.json(
      { error: "Failed to fetch agent template" },
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

    if (!hasGWIPermission(session.admin.role, "agents:write")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const existingTemplate = await prisma.systemAgentTemplate.findUnique({
      where: { id },
    })

    if (!existingTemplate) {
      return NextResponse.json({ error: "Agent template not found" }, { status: 404 })
    }

    const body = await request.json()
    const {
      name,
      description,
      category,
      configuration,
      defaultTools,
      defaultPrompts,
      isPublished,
    } = body

    // Validate required fields
    if (name !== undefined && !name.trim()) {
      return NextResponse.json(
        { error: "Name cannot be empty" },
        { status: 400 }
      )
    }

    if (category !== undefined && !category.trim()) {
      return NextResponse.json(
        { error: "Category cannot be empty" },
        { status: 400 }
      )
    }

    // Build update data
    const updateData: Record<string, unknown> = {}
    if (name !== undefined) updateData.name = name
    if (description !== undefined) updateData.description = description
    if (category !== undefined) updateData.category = category
    if (configuration !== undefined) updateData.configuration = configuration
    if (defaultTools !== undefined) updateData.defaultTools = defaultTools
    if (defaultPrompts !== undefined) updateData.defaultPrompts = defaultPrompts
    if (isPublished !== undefined) updateData.isPublished = isPublished

    // Increment version on significant changes
    const significantChange =
      configuration !== undefined ||
      defaultTools !== undefined ||
      defaultPrompts !== undefined ||
      (isPublished !== undefined && isPublished !== existingTemplate.isPublished)

    if (significantChange) {
      updateData.version = existingTemplate.version + 1
    }

    const template = await prisma.systemAgentTemplate.update({
      where: { id },
      data: updateData,
      include: {
        createdBy: { select: { id: true, name: true, email: true } },
        organization: { select: { id: true, name: true, slug: true } },
      },
    })

    // Log the action
    await prisma.gWIAuditLog.create({
      data: {
        adminId: session.admin.id,
        action: "UPDATE_AGENT_TEMPLATE",
        resourceType: "agent_template",
        resourceId: template.id,
        previousState: {
          name: existingTemplate.name,
          description: existingTemplate.description,
          category: existingTemplate.category,
          isPublished: existingTemplate.isPublished,
          version: existingTemplate.version,
        },
        newState: updateData as Record<string, string | number | boolean | null>,
      },
    })

    return NextResponse.json(template)
  } catch (error) {
    console.error("Failed to update agent template:", error)
    return NextResponse.json(
      { error: "Failed to update agent template" },
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

    if (!hasGWIPermission(session.admin.role, "agents:write")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const template = await prisma.systemAgentTemplate.findUnique({
      where: { id },
    })

    if (!template) {
      return NextResponse.json({ error: "Agent template not found" }, { status: 404 })
    }

    await prisma.systemAgentTemplate.delete({
      where: { id },
    })

    // Log the action
    await prisma.gWIAuditLog.create({
      data: {
        adminId: session.admin.id,
        action: "DELETE_AGENT_TEMPLATE",
        resourceType: "agent_template",
        resourceId: id,
        previousState: {
          name: template.name,
          description: template.description,
          category: template.category,
          isPublished: template.isPublished,
          version: template.version,
        },
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to delete agent template:", error)
    return NextResponse.json(
      { error: "Failed to delete agent template" },
      { status: 500 }
    )
  }
}
