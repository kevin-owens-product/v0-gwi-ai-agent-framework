/**
 * @prompt-id forge-v4.1:feature:email-template-management:001
 * @generated-at 2026-01-25T00:00:00Z
 * @model claude-opus-4-5
 */

import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { validateSuperAdminSession, logPlatformAudit } from "@/lib/super-admin"
import { cookies } from "next/headers"
import { renderTemplate, validateVariables } from "@/lib/email-templates"
import { sendEmail } from "@/lib/email"

// POST /api/admin/email-templates/[id]/test - Send test email
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
    const { to, data } = body

    if (!to) {
      return NextResponse.json(
        { error: "Recipient email address is required" },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(to)) {
      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400 }
      )
    }

    // Get template
    const template = await prisma.emailTemplate.findUnique({
      where: { id },
    })

    if (!template) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 })
    }

    // Merge provided data with preview data defaults
    const previewData = template.previewData as Record<string, string>
    const mergedData = { ...previewData, ...data }

    // Validate required variables
    const validation = validateVariables(template, mergedData)
    if (!validation.valid) {
      return NextResponse.json(
        {
          error: "Missing required variables",
          missing: validation.missing,
        },
        { status: 400 }
      )
    }

    // Render the template
    const rendered = renderTemplate(
      {
        subject: template.subject,
        htmlContent: template.htmlContent,
        textContent: template.textContent,
      },
      mergedData
    )

    // Add test prefix to subject
    const testSubject = `[TEST] ${rendered.subject}`

    // Send the test email
    const result = await sendEmail({
      to,
      subject: testSubject,
      html: rendered.html,
    })

    // Log audit
    await logPlatformAudit({
      adminId: session.admin.id,
      action: "send_test_email",
      resourceType: "email_template",
      resourceId: id,
      details: {
        templateName: template.name,
        templateSlug: template.slug,
        recipient: to,
        emailId: result.id,
      },
    })

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: `Test email sent to ${to}`,
        emailId: result.id,
      })
    } else {
      return NextResponse.json(
        {
          success: false,
          error: "Failed to send test email",
        },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error("Send test email error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
