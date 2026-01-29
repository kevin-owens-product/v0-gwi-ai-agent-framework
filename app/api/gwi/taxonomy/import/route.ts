import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { prisma } from "@/lib/db"
import { validateSuperAdminSession } from "@/lib/super-admin"
import { hasGWIPermission } from "@/lib/gwi-permissions"

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

    if (!hasGWIPermission(session.admin.role, "taxonomy:write")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      )
    }

    // Parse CSV/Excel file
    const text = await file.text()
    const lines = text.split("\n").filter((line) => line.trim())
    const headers = lines[0].split(",").map((h) => h.trim())

    // Expected headers: name, code, description, parentCode (optional)
    const categories = []
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(",").map((v) => v.trim())
      const category: Record<string, string> = {}
      headers.forEach((header, index) => {
        category[header] = values[index] || ""
      })
      categories.push(category)
    }

    const results = {
      created: 0,
      updated: 0,
      errors: [] as string[],
    }

    // Process categories
    for (const categoryData of categories) {
      try {
        if (!categoryData.name || !categoryData.code) {
          results.errors.push(
            `Skipping row: missing name or code - ${JSON.stringify(categoryData)}`
          )
          continue
        }

        // Check if category exists
        const existing = await prisma.taxonomyCategory.findUnique({
          where: { code: categoryData.code },
        })

        if (existing) {
          // Update existing
          await prisma.taxonomyCategory.update({
            where: { code: categoryData.code },
            data: {
              name: categoryData.name,
              description: categoryData.description || null,
            },
          })
          results.updated++
        } else {
          // Create new
          let parentId = null
          if (categoryData.parentCode) {
            const parent = await prisma.taxonomyCategory.findUnique({
              where: { code: categoryData.parentCode },
            })
            if (parent) {
              parentId = parent.id
            }
          }

          await prisma.taxonomyCategory.create({
            data: {
              name: categoryData.name,
              code: categoryData.code,
              description: categoryData.description || null,
              parentId,
              isActive: true,
              version: 1,
            },
          })
          results.created++
        }
      } catch (error) {
        results.errors.push(
          `Error processing ${categoryData.code}: ${error instanceof Error ? error.message : "Unknown error"}`
        )
      }
    }

    // Log the action
    await prisma.gWIAuditLog.create({
      data: {
        adminId: session.admin.id,
        action: "IMPORT_TAXONOMY",
        resourceType: "taxonomy",
        newState: {
          created: results.created,
          updated: results.updated,
          errors: results.errors.length,
        },
      },
    })

    return NextResponse.json({
      success: true,
      results,
    })
  } catch (error) {
    console.error("Failed to import taxonomy:", error)
    return NextResponse.json(
      { error: "Failed to import taxonomy" },
      { status: 500 }
    )
  }
}
