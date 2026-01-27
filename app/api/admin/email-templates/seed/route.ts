/**
 * @prompt-id forge-v4.1:feature:email-template-management:001
 * @generated-at 2026-01-25T00:00:00Z
 * @model claude-opus-4-5
 */

import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { validateSuperAdminSession, logPlatformAudit } from "@/lib/super-admin"
import { cookies } from "next/headers"
import { DEFAULT_SYSTEM_TEMPLATES } from "@/lib/email-templates"

// POST /api/admin/email-templates/seed - Seed default system templates
export async function POST(_request: NextRequest) {
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

    // Check if admin has super admin role (only super admins can seed templates)
    if (session.admin.role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { error: "Only super admins can seed templates" },
        { status: 403 }
      )
    }

    const results = {
      created: [] as string[],
      skipped: [] as string[],
      errors: [] as { slug: string; error: string }[],
    }

    for (const template of DEFAULT_SYSTEM_TEMPLATES) {
      try {
        const existing = await prisma.emailTemplate.findUnique({
          where: { slug: template.slug },
        })

        if (existing) {
          results.skipped.push(template.slug)
          continue
        }

        const created = await prisma.emailTemplate.create({
          data: {
            name: template.name,
            slug: template.slug,
            subject: template.subject,
            description: template.description,
            category: template.category,
            htmlContent: template.htmlContent,
            textContent: template.textContent,
            variables: template.variables,
            previewData: template.previewData,
            isSystem: true,
            isActive: true,
            lastEditedBy: session.admin.id,
          },
        })

        // Create initial version
        await prisma.emailTemplateVersion.create({
          data: {
            templateId: created.id,
            version: 1,
            subject: template.subject,
            htmlContent: template.htmlContent,
            textContent: template.textContent,
            changedBy: session.admin.id,
            changeNote: "Initial system template",
          },
        })

        results.created.push(template.slug)
      } catch (error) {
        results.errors.push({
          slug: template.slug,
          error: error instanceof Error ? error.message : "Unknown error",
        })
      }
    }

    // Log audit
    await logPlatformAudit({
      adminId: session.admin.id,
      action: "seed_email_templates",
      resourceType: "email_template",
      details: {
        created: results.created,
        skipped: results.skipped,
        errors: results.errors,
      },
    })

    return NextResponse.json({
      success: true,
      message: `Seeded ${results.created.length} templates, skipped ${results.skipped.length} existing templates`,
      results,
    })
  } catch (error) {
    console.error("Seed email templates error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
