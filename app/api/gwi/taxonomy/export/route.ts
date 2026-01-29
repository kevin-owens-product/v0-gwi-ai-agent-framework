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

    if (!hasGWIPermission(session.admin.role, "taxonomy:read")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const format = searchParams.get("format") || "csv"
    const categoryId = searchParams.get("categoryId")

    // Fetch categories
    const where: Record<string, unknown> = { isActive: true }
    if (categoryId) {
      where.id = categoryId
    }

    const categories = await prisma.taxonomyCategory.findMany({
      where,
      include: {
        parent: { select: { code: true } },
        attributes: true,
      },
      orderBy: { code: "asc" },
    })

    if (format === "csv") {
      // Generate CSV
      const headers = ["name", "code", "description", "parentCode", "version"]
      const rows = categories.map((cat) => [
        cat.name,
        cat.code,
        cat.description || "",
        cat.parent?.code || "",
        String(cat.version),
      ])

      const csv = [
        headers.join(","),
        ...rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")),
      ].join("\n")

      return new NextResponse(csv, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="taxonomy-export-${new Date().toISOString().split("T")[0]}.csv"`,
        },
      })
    } else {
      // JSON format
      const exportData = categories.map((cat) => ({
        name: cat.name,
        code: cat.code,
        description: cat.description,
        parentCode: cat.parent?.code || null,
        version: cat.version,
        attributes: cat.attributes.map((attr) => ({
          name: attr.name,
          code: attr.code,
          dataType: attr.dataType,
          allowedValues: attr.allowedValues,
        })),
      }))

      return NextResponse.json(exportData, {
        headers: {
          "Content-Disposition": `attachment; filename="taxonomy-export-${new Date().toISOString().split("T")[0]}.json"`,
        },
      })
    }
  } catch (error) {
    console.error("Failed to export taxonomy:", error)
    return NextResponse.json(
      { error: "Failed to export taxonomy" },
      { status: 500 }
    )
  }
}
