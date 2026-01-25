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
import type { EmailTemplateCategory } from "@prisma/client"

// GET /api/admin/email-templates - List all templates
export async function GET(request: NextRequest) {
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

    const searchParams = request.nextUrl.searchParams
    const category = searchParams.get("category") as EmailTemplateCategory | null
    const isActive = searchParams.get("isActive")
    const search = searchParams.get("search")

    const where: Record<string, unknown> = {}

    if (category) {
      where.category = category
    }

    if (isActive !== null) {
      where.isActive = isActive === "true"
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { slug: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ]
    }

    const templates = await prisma.emailTemplate.findMany({
      where,
      orderBy: [
        { category: "asc" },
        { name: "asc" },
      ],
      select: {
        id: true,
        name: true,
        slug: true,
        subject: true,
        description: true,
        category: true,
        isActive: true,
        isSystem: true,
        version: true,
        lastEditedBy: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            versions: true,
          },
        },
      },
    })

    // Group by category
    const categories = [
      "AUTHENTICATION",
      "ONBOARDING",
      "NOTIFICATION",
      "MARKETING",
      "TRANSACTIONAL",
      "SYSTEM",
    ] as const

    const groupedTemplates = categories.map((cat) => ({
      category: cat,
      templates: templates.filter((t) => t.category === cat),
    }))

    return NextResponse.json({
      templates,
      grouped: groupedTemplates,
      total: templates.length,
    })
  } catch (error) {
    console.error("Get email templates error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// POST /api/admin/email-templates - Create a new template
export async function POST(request: NextRequest) {
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

    const body = await request.json()
    const {
      name,
      slug,
      subject,
      description,
      category,
      htmlContent,
      textContent,
      variables,
      previewData,
      isActive = true,
    } = body

    // Validate required fields
    if (!name || !slug || !subject || !category || !htmlContent) {
      return NextResponse.json(
        { error: "Missing required fields: name, slug, subject, category, htmlContent" },
        { status: 400 }
      )
    }

    // Check if slug already exists
    const existing = await prisma.emailTemplate.findUnique({
      where: { slug },
    })

    if (existing) {
      return NextResponse.json(
        { error: "A template with this slug already exists" },
        { status: 409 }
      )
    }

    // Extract variables from content if not provided
    const extractedVariables = extractVariables(`${subject} ${htmlContent} ${textContent || ""}`)
    const templateVariables = variables || extractedVariables.map((v) => ({
      name: v,
      description: "",
      required: false,
    }))

    const template = await prisma.emailTemplate.create({
      data: {
        name,
        slug,
        subject,
        description,
        category,
        htmlContent,
        textContent,
        variables: templateVariables,
        previewData: previewData || {},
        isActive,
        isSystem: false,
        lastEditedBy: session.admin.id,
      },
    })

    // Create initial version
    await prisma.emailTemplateVersion.create({
      data: {
        templateId: template.id,
        version: 1,
        subject,
        htmlContent,
        textContent,
        changedBy: session.admin.id,
        changeNote: "Initial creation",
      },
    })

    // Log audit
    await logPlatformAudit({
      adminId: session.admin.id,
      action: "create_email_template",
      resourceType: "email_template",
      resourceId: template.id,
      details: { name, slug, category },
    })

    return NextResponse.json({ template }, { status: 201 })
  } catch (error) {
    console.error("Create email template error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
