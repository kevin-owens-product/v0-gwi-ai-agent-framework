import { NextResponse } from "next/server"

// Enhanced API v2 for Audiences
// Provides comprehensive CRUD operations with advanced features

interface AudienceV2 {
  id: string
  name: string
  description: string
  criteria: {
    attributes: { dimension: string; operator: string; value: string }[]
    aiQuery?: string
  }
  estimatedSize: number
  markets: string[]
  status: "draft" | "active" | "archived"
  folderId?: string
  tags: string[]
  isFavorite: boolean
  metadata: {
    createdBy: string
    createdAt: string
    updatedAt: string
    version: number
    lastUsed?: string
    usageCount: number
  }
  sharing: {
    isPublic: boolean
    sharedWith: string[]
    permissions: Record<string, "view" | "edit" | "admin">
  }
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
    first: string
    last: string
  }
}

// Mock database
const audiencesDB: AudienceV2[] = [
  {
    id: "aud-1",
    name: "Eco-Conscious Millennials",
    description: "Sustainability-focused consumers aged 25-40",
    criteria: {
      attributes: [
        { dimension: "age", operator: "between", value: "25-40" },
        { dimension: "interests", operator: "contains", value: "sustainability" },
      ],
      aiQuery: "Millennials who care about sustainability",
    },
    estimatedSize: 1200000,
    markets: ["US", "UK", "DE"],
    status: "active",
    tags: ["sustainability", "millennials"],
    isFavorite: true,
    metadata: {
      createdBy: "user-1",
      createdAt: "2025-01-01T00:00:00Z",
      updatedAt: "2025-01-08T12:00:00Z",
      version: 3,
      lastUsed: "2025-01-08T10:00:00Z",
      usageCount: 45,
    },
    sharing: {
      isPublic: false,
      sharedWith: ["user-2", "user-3"],
      permissions: { "user-2": "view", "user-3": "edit" },
    },
  },
  {
    id: "aud-2",
    name: "Tech Early Adopters",
    description: "Innovation enthusiasts who are first to try new technologies",
    criteria: {
      attributes: [
        { dimension: "behavior", operator: "is", value: "early_adopter" },
        { dimension: "interests", operator: "contains", value: "technology" },
      ],
    },
    estimatedSize: 850000,
    markets: ["US", "JP", "KR"],
    status: "active",
    tags: ["technology", "innovation"],
    isFavorite: false,
    metadata: {
      createdBy: "user-1",
      createdAt: "2025-01-02T00:00:00Z",
      updatedAt: "2025-01-07T15:00:00Z",
      version: 2,
      lastUsed: "2025-01-07T14:30:00Z",
      usageCount: 32,
    },
    sharing: {
      isPublic: true,
      sharedWith: [],
      permissions: {},
    },
  },
]

// GET /api/v2/audiences
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)

    // Pagination
    const page = parseInt(searchParams.get("page") || "1")
    const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 100)

    // Filtering
    const status = searchParams.get("status")
    const search = searchParams.get("search")
    const markets = searchParams.get("markets")?.split(",")
    const tags = searchParams.get("tags")?.split(",")
    const folderId = searchParams.get("folder_id")
    const isFavorite = searchParams.get("is_favorite")

    // Sorting
    const sortBy = searchParams.get("sort_by") || "updatedAt"
    const sortOrder = searchParams.get("sort_order") || "desc"

    // Include options
    const includeMetrics = searchParams.get("include_metrics") === "true"
    const includeHistory = searchParams.get("include_history") === "true"

    // Filter audiences
    let filtered = [...audiencesDB]

    if (status) {
      filtered = filtered.filter((a) => a.status === status)
    }
    if (search) {
      const searchLower = search.toLowerCase()
      filtered = filtered.filter(
        (a) =>
          a.name.toLowerCase().includes(searchLower) ||
          a.description.toLowerCase().includes(searchLower) ||
          a.tags.some((t) => t.toLowerCase().includes(searchLower))
      )
    }
    if (markets) {
      filtered = filtered.filter((a) =>
        markets.some((m) => a.markets.includes(m))
      )
    }
    if (tags) {
      filtered = filtered.filter((a) =>
        tags.some((t) => a.tags.includes(t))
      )
    }
    if (folderId) {
      filtered = filtered.filter((a) => a.folderId === folderId)
    }
    if (isFavorite === "true") {
      filtered = filtered.filter((a) => a.isFavorite)
    }

    // Sort
    filtered.sort((a, b) => {
      let aVal: any, bVal: any
      if (sortBy === "name") {
        aVal = a.name
        bVal = b.name
      } else if (sortBy === "size") {
        aVal = a.estimatedSize
        bVal = b.estimatedSize
      } else if (sortBy === "usageCount") {
        aVal = a.metadata.usageCount
        bVal = b.metadata.usageCount
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

    // Build response
    const baseUrl = "/api/v2/audiences"
    const response: ApiResponse<AudienceV2[]> = {
      success: true,
      data: paginated,
      meta: {
        page,
        limit,
        total,
        totalPages,
        hasMore: page < totalPages,
      },
      links: {
        self: `${baseUrl}?page=${page}&limit=${limit}`,
        first: `${baseUrl}?page=1&limit=${limit}`,
        last: `${baseUrl}?page=${totalPages}&limit=${limit}`,
        ...(page > 1 && { prev: `${baseUrl}?page=${page - 1}&limit=${limit}` }),
        ...(page < totalPages && { next: `${baseUrl}?page=${page + 1}&limit=${limit}` }),
      },
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error("GET audiences error:", error)
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    )
  }
}

// POST /api/v2/audiences
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

    // Create new audience
    const newAudience: AudienceV2 = {
      id: `aud-${Date.now()}`,
      name: body.name,
      description: body.description || "",
      criteria: body.criteria || { attributes: [] },
      estimatedSize: body.estimatedSize || 0,
      markets: body.markets || ["Global"],
      status: body.status || "draft",
      folderId: body.folderId,
      tags: body.tags || [],
      isFavorite: body.isFavorite || false,
      metadata: {
        createdBy: body.createdBy || "anonymous",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        version: 1,
        usageCount: 0,
      },
      sharing: {
        isPublic: body.isPublic || false,
        sharedWith: body.sharedWith || [],
        permissions: body.permissions || {},
      },
    }

    audiencesDB.push(newAudience)

    const response: ApiResponse<AudienceV2> = {
      success: true,
      data: newAudience,
    }

    return NextResponse.json(response, { status: 201 })
  } catch (error) {
    console.error("POST audience error:", error)
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    )
  }
}

// Bulk operations endpoint
export async function PATCH(request: Request) {
  try {
    const body = await request.json()
    const { action, audienceIds, data } = body

    if (!action || !audienceIds || !Array.isArray(audienceIds)) {
      return NextResponse.json(
        { success: false, error: "Action and audienceIds are required" },
        { status: 400 }
      )
    }

    const results: { id: string; success: boolean; error?: string }[] = []

    for (const id of audienceIds) {
      const index = audiencesDB.findIndex((a) => a.id === id)
      if (index === -1) {
        results.push({ id, success: false, error: "Not found" })
        continue
      }

      switch (action) {
        case "archive":
          audiencesDB[index].status = "archived"
          audiencesDB[index].metadata.updatedAt = new Date().toISOString()
          break
        case "unarchive":
          audiencesDB[index].status = "active"
          audiencesDB[index].metadata.updatedAt = new Date().toISOString()
          break
        case "favorite":
          audiencesDB[index].isFavorite = true
          break
        case "unfavorite":
          audiencesDB[index].isFavorite = false
          break
        case "move":
          if (data?.folderId !== undefined) {
            audiencesDB[index].folderId = data.folderId
          }
          break
        case "tag":
          if (data?.tags && Array.isArray(data.tags)) {
            audiencesDB[index].tags = [...new Set([...audiencesDB[index].tags, ...data.tags])]
          }
          break
        case "delete":
          audiencesDB.splice(index, 1)
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
    console.error("PATCH audiences error:", error)
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    )
  }
}
