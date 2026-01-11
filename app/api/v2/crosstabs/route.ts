import { NextResponse } from "next/server"

// Enhanced API v2 for Cross-tabs
// Provides comprehensive CRUD operations with advanced features

interface CrosstabV2 {
  id: string
  name: string
  description: string
  audiences: {
    id: string
    name: string
    size: number
  }[]
  metrics: {
    id: string
    name: string
    category: string
  }[]
  data: {
    metric: string
    values: Record<string, number>
  }[]
  config: {
    baseAudience?: string
    showSignificance: boolean
    showIndexing: boolean
    confidenceLevel: number
  }
  status: "draft" | "active" | "archived"
  folderId?: string
  tags: string[]
  metadata: {
    createdBy: string
    createdAt: string
    updatedAt: string
    version: number
    views: number
    exports: number
    lastViewed?: string
  }
  insights?: {
    id: string
    type: string
    title: string
    description: string
    priority: string
  }[]
}

interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  meta?: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasMore: boolean
  }
  links?: {
    self: string
    next?: string
    prev?: string
  }
}

// Mock database
const crosstabsDB: CrosstabV2[] = [
  {
    id: "ct-1",
    name: "Generational Social Media Analysis",
    description: "Comprehensive multi-generational analysis of social platform usage",
    audiences: [
      { id: "gen-z", name: "Gen Z (18-24)", size: 2100000 },
      { id: "mill", name: "Millennials (25-40)", size: 3800000 },
      { id: "gen-x", name: "Gen X (41-56)", size: 2900000 },
      { id: "boom", name: "Boomers (57+)", size: 2500000 },
    ],
    metrics: [
      { id: "tiktok", name: "TikTok", category: "Social Media" },
      { id: "instagram", name: "Instagram", category: "Social Media" },
      { id: "facebook", name: "Facebook", category: "Social Media" },
      { id: "youtube", name: "YouTube", category: "Social Media" },
    ],
    data: [
      { metric: "TikTok", values: { "Gen Z (18-24)": 87, "Millennials (25-40)": 52, "Gen X (41-56)": 24, "Boomers (57+)": 8 } },
      { metric: "Instagram", values: { "Gen Z (18-24)": 82, "Millennials (25-40)": 71, "Gen X (41-56)": 48, "Boomers (57+)": 28 } },
      { metric: "Facebook", values: { "Gen Z (18-24)": 42, "Millennials (25-40)": 68, "Gen X (41-56)": 78, "Boomers (57+)": 72 } },
      { metric: "YouTube", values: { "Gen Z (18-24)": 91, "Millennials (25-40)": 85, "Gen X (41-56)": 76, "Boomers (57+)": 62 } },
    ],
    config: {
      baseAudience: "Millennials (25-40)",
      showSignificance: true,
      showIndexing: true,
      confidenceLevel: 0.95,
    },
    status: "active",
    tags: ["social-media", "generations", "platform-analysis"],
    metadata: {
      createdBy: "user-1",
      createdAt: "2025-01-01T00:00:00Z",
      updatedAt: "2025-01-08T12:00:00Z",
      version: 5,
      views: 1892,
      exports: 156,
      lastViewed: "2025-01-08T14:00:00Z",
    },
    insights: [
      {
        id: "i-1",
        type: "difference",
        title: "TikTok: 79 point gap",
        description: "Gen Z leads at 87% while Boomers at 8%",
        priority: "high",
      },
    ],
  },
]

// GET /api/v2/crosstabs
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)

    // Pagination
    const page = parseInt(searchParams.get("page") || "1")
    const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 100)

    // Filtering
    const status = searchParams.get("status")
    const search = searchParams.get("search")
    const tags = searchParams.get("tags")?.split(",")
    const folderId = searchParams.get("folder_id")

    // Sorting
    const sortBy = searchParams.get("sort_by") || "updatedAt"
    const sortOrder = searchParams.get("sort_order") || "desc"

    // Include options
    const includeData = searchParams.get("include_data") !== "false"
    const includeInsights = searchParams.get("include_insights") === "true"

    // Filter crosstabs
    let filtered = [...crosstabsDB]

    if (status) {
      filtered = filtered.filter((c) => c.status === status)
    }
    if (search) {
      const searchLower = search.toLowerCase()
      filtered = filtered.filter(
        (c) =>
          c.name.toLowerCase().includes(searchLower) ||
          c.description.toLowerCase().includes(searchLower) ||
          c.tags.some((t) => t.toLowerCase().includes(searchLower))
      )
    }
    if (tags) {
      filtered = filtered.filter((c) =>
        tags.some((t) => c.tags.includes(t))
      )
    }
    if (folderId) {
      filtered = filtered.filter((c) => c.folderId === folderId)
    }

    // Sort
    filtered.sort((a, b) => {
      let aVal: any, bVal: any
      if (sortBy === "name") {
        aVal = a.name
        bVal = b.name
      } else if (sortBy === "views") {
        aVal = a.metadata.views
        bVal = b.metadata.views
      } else {
        aVal = new Date(a.metadata.updatedAt).getTime()
        bVal = new Date(b.metadata.updatedAt).getTime()
      }

      if (sortOrder === "asc") {
        return aVal > bVal ? 1 : -1
      }
      return aVal < bVal ? 1 : -1
    })

    // Paginate
    const total = filtered.length
    const totalPages = Math.ceil(total / limit)
    const offset = (page - 1) * limit
    const paginated = filtered.slice(offset, offset + limit)

    // Transform based on include options
    const transformed = paginated.map((c) => ({
      ...c,
      ...(includeData ? { data: c.data } : {}),
      ...(includeInsights ? { insights: c.insights } : {}),
    }))

    const response: ApiResponse<CrosstabV2[]> = {
      success: true,
      data: transformed as CrosstabV2[],
      meta: {
        page,
        limit,
        total,
        totalPages,
        hasMore: page < totalPages,
      },
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error("GET crosstabs error:", error)
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    )
  }
}

// POST /api/v2/crosstabs
export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Validate required fields
    if (!body.name || typeof body.name !== "string") {
      return NextResponse.json(
        { success: false, error: "Name is required" },
        { status: 400 }
      )
    }
    if (!body.audiences || !Array.isArray(body.audiences) || body.audiences.length === 0) {
      return NextResponse.json(
        { success: false, error: "At least one audience is required" },
        { status: 400 }
      )
    }
    if (!body.metrics || !Array.isArray(body.metrics) || body.metrics.length === 0) {
      return NextResponse.json(
        { success: false, error: "At least one metric is required" },
        { status: 400 }
      )
    }

    // Create new crosstab
    const newCrosstab: CrosstabV2 = {
      id: `ct-${Date.now()}`,
      name: body.name,
      description: body.description || "",
      audiences: body.audiences,
      metrics: body.metrics,
      data: body.data || [],
      config: body.config || {
        showSignificance: true,
        showIndexing: false,
        confidenceLevel: 0.95,
      },
      status: body.status || "draft",
      folderId: body.folderId,
      tags: body.tags || [],
      metadata: {
        createdBy: body.createdBy || "anonymous",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        version: 1,
        views: 0,
        exports: 0,
      },
    }

    crosstabsDB.push(newCrosstab)

    const response: ApiResponse<CrosstabV2> = {
      success: true,
      data: newCrosstab,
    }

    return NextResponse.json(response, { status: 201 })
  } catch (error) {
    console.error("POST crosstab error:", error)
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    )
  }
}

// Bulk operations
export async function PATCH(request: Request) {
  try {
    const body = await request.json()
    const { action, crosstabIds, data } = body

    if (!action || !crosstabIds || !Array.isArray(crosstabIds)) {
      return NextResponse.json(
        { success: false, error: "Action and crosstabIds are required" },
        { status: 400 }
      )
    }

    const results: { id: string; success: boolean; error?: string }[] = []

    for (const id of crosstabIds) {
      const index = crosstabsDB.findIndex((c) => c.id === id)
      if (index === -1) {
        results.push({ id, success: false, error: "Not found" })
        continue
      }

      switch (action) {
        case "archive":
          crosstabsDB[index].status = "archived"
          crosstabsDB[index].metadata.updatedAt = new Date().toISOString()
          break
        case "unarchive":
          crosstabsDB[index].status = "active"
          crosstabsDB[index].metadata.updatedAt = new Date().toISOString()
          break
        case "move":
          if (data?.folderId !== undefined) {
            crosstabsDB[index].folderId = data.folderId
          }
          break
        case "tag":
          if (data?.tags && Array.isArray(data.tags)) {
            crosstabsDB[index].tags = [...new Set([...crosstabsDB[index].tags, ...data.tags])]
          }
          break
        case "delete":
          crosstabsDB.splice(index, 1)
          break
        case "regenerate_insights":
          // In production, this would trigger insight regeneration
          break
        default:
          results.push({ id, success: false, error: "Unknown action" })
          continue
      }

      results.push({ id, success: true })
    }

    return NextResponse.json({
      success: true,
      data: {
        action,
        results,
        processed: results.filter((r) => r.success).length,
        failed: results.filter((r) => !r.success).length,
      },
    })
  } catch (error) {
    console.error("PATCH crosstabs error:", error)
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    )
  }
}
