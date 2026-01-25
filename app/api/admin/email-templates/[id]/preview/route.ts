/**
 * @prompt-id forge-v4.1:feature:email-template-management:001
 * @generated-at 2026-01-25T00:00:00Z
 * @model claude-opus-4-5
 */

import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { validateSuperAdminSession } from "@/lib/super-admin"
import { cookies } from "next/headers"
import { renderTemplate } from "@/lib/email-templates"

// POST /api/admin/email-templates/[id]/preview - Preview template with sample data
export async function POST(
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
    const { data, version } = body

    // Get template
    let template
    if (version) {
      // Get specific version
      const templateVersion = await prisma.emailTemplateVersion.findFirst({
        where: {
          templateId: id,
          version: parseInt(version, 10),
        },
      })

      if (!templateVersion) {
        return NextResponse.json(
          { error: "Template version not found" },
          { status: 404 }
        )
      }

      // Get base template for variables and preview data
      const baseTemplate = await prisma.emailTemplate.findUnique({
        where: { id },
      })

      if (!baseTemplate) {
        return NextResponse.json({ error: "Template not found" }, { status: 404 })
      }

      template = {
        ...baseTemplate,
        subject: templateVersion.subject,
        htmlContent: templateVersion.htmlContent,
        textContent: templateVersion.textContent,
      }
    } else {
      template = await prisma.emailTemplate.findUnique({
        where: { id },
      })
    }

    if (!template) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 })
    }

    // Merge provided data with preview data defaults
    const previewData = template.previewData as Record<string, string>
    const mergedData = { ...previewData, ...data }

    // Render the template
    const rendered = renderTemplate(
      {
        subject: template.subject,
        htmlContent: template.htmlContent,
        textContent: template.textContent,
      },
      mergedData
    )

    return NextResponse.json({
      subject: rendered.subject,
      html: rendered.html,
      text: rendered.text,
      variables: template.variables,
      previewData: mergedData,
    })
  } catch (error) {
    console.error("Preview email template error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
