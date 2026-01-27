/**
 * @prompt-id forge-v4.1:feature:email-template-management:001
 * @generated-at 2026-01-25T00:00:00Z
 * @model claude-opus-4-5
 */

import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { validateSuperAdminSession, logPlatformAudit } from "@/lib/super-admin"
import { cookies } from "next/headers"
import { extractVariables } from "@/lib/email-templates"

// GET /api/admin/email-templates/[id] - Get template with versions
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

    const template = await prisma.emailTemplate.findUnique({
      where: { id },
      include: {
        versions: {
          orderBy: { version: "desc" },
          take: 20,
        },
      },
    })

    if (!template) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 })
    }

    // Get audit logs
    const auditLogs = await prisma.platformAuditLog.findMany({
      where: {
        resourceType: "email_template",
        resourceId: id,
      },
      orderBy: { timestamp: "desc" },
      take: 10,
    })

    return NextResponse.json({
      template: {
        ...template,
        auditLogs,
      },
    })
  } catch (error) {
    console.error("Get email template error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// PATCH /api/admin/email-templates/[id] - Update template (creates new version)
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

    const existing = await prisma.emailTemplate.findUnique({
      where: { id },
    })

    if (!existing) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 })
    }

    const {
      name,
      subject,
      description,
      category,
      htmlContent,
      textContent,
      variables,
      previewData,
      isActive,
      changeNote,
    } = body

    // Check if content changed (requires new version)
    const contentChanged =
      (subject !== undefined && subject !== existing.subject) ||
      (htmlContent !== undefined && htmlContent !== existing.htmlContent) ||
      (textContent !== undefined && textContent !== existing.textContent)

    // Update variables if content changed
    let updatedVariables = variables
    if (contentChanged && !variables) {
      const newSubject = subject ?? existing.subject
      const newHtml = htmlContent ?? existing.htmlContent
      const newText = textContent ?? existing.textContent
      const extractedVariables = extractVariables(
        `${newSubject} ${newHtml} ${newText || ""}`
      )

      // Merge with existing variables to preserve descriptions
      const existingVars = existing.variables as Array<{
        name: string
        description: string
        required: boolean
        defaultValue?: string
      }>
      const existingVarMap = new Map(existingVars.map((v) => [v.name, v]))

      updatedVariables = extractedVariables.map((name) => {
        const existing = existingVarMap.get(name)
        return (
          existing || {
            name,
            description: "",
            required: false,
          }
        )
      })
    }

    // Build update data
    const updateData: Record<string, unknown> = {
      lastEditedBy: session.admin.id,
      updatedAt: new Date(),
    }

    if (name !== undefined) updateData.name = name
    if (subject !== undefined) updateData.subject = subject
    if (description !== undefined) updateData.description = description
    if (category !== undefined) updateData.category = category
    if (htmlContent !== undefined) updateData.htmlContent = htmlContent
    if (textContent !== undefined) updateData.textContent = textContent
    if (updatedVariables !== undefined) updateData.variables = updatedVariables
    if (previewData !== undefined) updateData.previewData = previewData
    if (isActive !== undefined) updateData.isActive = isActive

    // If content changed, increment version and create version record
    if (contentChanged) {
      updateData.version = existing.version + 1

      await prisma.emailTemplateVersion.create({
        data: {
          templateId: id,
          version: existing.version + 1,
          subject: subject ?? existing.subject,
          htmlContent: htmlContent ?? existing.htmlContent,
          textContent: textContent ?? existing.textContent,
          changedBy: session.admin.id,
          changeNote: changeNote || "Content updated",
        },
      })
    }

    const template = await prisma.emailTemplate.update({
      where: { id },
      data: updateData,
      include: {
        versions: {
          orderBy: { version: "desc" },
          take: 5,
        },
      },
    })

    // Log audit
    await logPlatformAudit({
      adminId: session.admin.id,
      action: "update_email_template",
      resourceType: "email_template",
      resourceId: id,
      details: {
        changes: Object.keys(body),
        contentChanged,
        newVersion: contentChanged ? template.version : undefined,
      },
    })

    return NextResponse.json({ template })
  } catch (error) {
    console.error("Update email template error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/email-templates/[id] - Delete template (if not system)
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

    const template = await prisma.emailTemplate.findUnique({
      where: { id },
    })

    if (!template) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 })
    }

    if (template.isSystem) {
      return NextResponse.json(
        { error: "System templates cannot be deleted" },
        { status: 403 }
      )
    }

    // Delete template (versions will be deleted via cascade)
    await prisma.emailTemplate.delete({
      where: { id },
    })

    // Log audit
    await logPlatformAudit({
      adminId: session.admin.id,
      action: "delete_email_template",
      resourceType: "email_template",
      resourceId: id,
      details: { name: template.name, slug: template.slug },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete email template error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
