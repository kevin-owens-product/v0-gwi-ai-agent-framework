import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { logAuditEvent } from "@/lib/audit-logger"

const updateTemplateSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().optional(),
  category: z.enum(["research", "analysis", "briefs", "custom"]).optional(),
  prompt: z.string().min(1).optional(),
  tags: z.array(z.string()).optional(),
  variables: z.array(z.object({
    name: z.string(),
    type: z.enum(["text", "number", "select", "multiselect"]),
    required: z.boolean(),
    defaultValue: z.any().optional(),
    options: z.array(z.string()).optional(),
  })).optional(),
  isFavorite: z.boolean().optional(),
})

interface RouteParams {
  params: Promise<{
    id: string
  }>
}

// GET /api/v1/templates/[id] - Get single template
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    const template = await prisma.template.findUnique({
      where: { id },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    if (!template) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 })
    }

    // Increment usage count
    await prisma.template.update({
      where: { id },
      data: {
        usageCount: { increment: 1 },
        lastUsed: new Date(),
      },
    })

    return NextResponse.json({ data: template })
  } catch (error) {
    console.error("Error fetching template:", error)
    return NextResponse.json({ error: "Failed to fetch template" }, { status: 500 })
  }
}

// PATCH /api/v1/templates/[id] - Update template
export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const body = await req.json()
    const validated = updateTemplateSchema.parse(body)

    const template = await prisma.template.findUnique({
      where: { id },
    })

    if (!template) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 })
    }

    // Check if user can update (creator or has permission)
    if (template.createdBy !== session.user.id) {
      const hasPermission = await checkPermission(session.user.id, template.orgId, "templates:write")
      if (!hasPermission) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
      }
    }

    const updated = await prisma.template.update({
      where: { id },
      data: {
        ...(validated.name && { name: validated.name }),
        ...(validated.description !== undefined && { description: validated.description }),
        ...(validated.category && { category: validated.category.toUpperCase() }),
        ...(validated.prompt && { prompt: validated.prompt }),
        ...(validated.tags && { tags: validated.tags }),
        ...(validated.variables && { variables: validated.variables }),
        ...(validated.isFavorite !== undefined && { isFavorite: validated.isFavorite }),
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    await logAuditEvent({
      userId: session.user.id,
      orgId: template.orgId,
      action: "update",
      resourceType: "template",
      resourceId: id,
      metadata: { changes: validated },
    })

    return NextResponse.json({ data: updated })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    console.error("Error updating template:", error)
    return NextResponse.json({ error: "Failed to update template" }, { status: 500 })
  }
}

// DELETE /api/v1/templates/[id] - Delete template
export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    const template = await prisma.template.findUnique({
      where: { id },
    })

    if (!template) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 })
    }

    // Check if user can delete (creator or has delete permission)
    if (template.createdBy !== session.user.id) {
      const hasPermission = await checkPermission(session.user.id, template.orgId, "templates:delete")
      if (!hasPermission) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
      }
    }

    await prisma.template.delete({
      where: { id },
    })

    await logAuditEvent({
      userId: session.user.id,
      orgId: template.orgId,
      action: "delete",
      resourceType: "template",
      resourceId: id,
      metadata: { name: template.name },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting template:", error)
    return NextResponse.json({ error: "Failed to delete template" }, { status: 500 })
  }
}

async function checkPermission(userId: string, orgId: string, permission: string): Promise<boolean> {
  // In production, check actual permissions
  return true
}
