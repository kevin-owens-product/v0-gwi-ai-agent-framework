/**
 * @prompt-id forge-v4.1:feature:revenue-analytics:013
 * @generated-at 2026-01-25T00:00:00Z
 * @model claude-opus-4-5
 */

import { describe, it, expect, vi, beforeEach } from "vitest"
import { NextRequest } from "next/server"

// Mock prisma
vi.mock("@/lib/db", () => ({
  prisma: {
    revenueMetric: {
      findMany: vi.fn(),
    },
  },
}))

// Mock validateSuperAdminSession
vi.mock("@/lib/super-admin", () => ({
  validateSuperAdminSession: vi.fn(),
}))

// Mock cookies
vi.mock("next/headers", () => ({
  cookies: vi.fn(() => ({
    get: vi.fn((name: string) => {
      if (name === "adminToken") return { value: "test-token" }
      return undefined
    }),
  })),
}))

import { GET } from "./route"
import { prisma } from "@/lib/db"
import { validateSuperAdminSession } from "@/lib/super-admin"

describe("GET /api/admin/revenue", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("should return 401 if no token provided", async () => {
    vi.mocked(await import("next/headers")).cookies.mockResolvedValueOnce({
      get: vi.fn(() => undefined),
    } as never)

    const request = new NextRequest("http://localhost/api/admin/revenue")
    const response = await GET(request)

    expect(response.status).toBe(401)
    const data = await response.json()
    expect(data.error).toBe("Unauthorized")
  })

  it("should return 401 if session is invalid", async () => {
    vi.mocked(validateSuperAdminSession).mockResolvedValueOnce(null)

    const request = new NextRequest("http://localhost/api/admin/revenue")
    const response = await GET(request)

    expect(response.status).toBe(401)
    const data = await response.json()
    expect(data.error).toBe("Invalid session")
  })

  it("should return revenue metrics with summary", async () => {
    vi.mocked(validateSuperAdminSession).mockResolvedValueOnce({
      admin: { id: "admin-1", role: "SUPER_ADMIN" },
    } as never)

    const mockMetrics = [
      {
        id: "metric-1",
        date: new Date("2026-01-01"),
        period: "MONTHLY",
        mrr: 10000,
        arr: 120000,
        newMrr: 1000,
        expansionMrr: 500,
        contractionMrr: 200,
        churnMrr: 300,
        netNewMrr: 1000,
        totalCustomers: 100,
        newCustomers: 10,
        churnedCustomers: 5,
        arpu: 100,
        ltv: 2400,
        cac: null,
        byPlan: {},
        byRegion: {},
        byCohort: {},
        createdAt: new Date(),
      },
    ]

    vi.mocked(prisma.revenueMetric.findMany).mockResolvedValueOnce(mockMetrics as never)

    const request = new NextRequest("http://localhost/api/admin/revenue?period=MONTHLY")
    const response = await GET(request)

    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data.success).toBe(true)
    expect(data.summary).toBeDefined()
    expect(data.metrics).toHaveLength(1)
  })

  it("should handle date range parameters", async () => {
    vi.mocked(validateSuperAdminSession).mockResolvedValueOnce({
      admin: { id: "admin-1", role: "SUPER_ADMIN" },
    } as never)

    vi.mocked(prisma.revenueMetric.findMany).mockResolvedValueOnce([])

    const request = new NextRequest(
      "http://localhost/api/admin/revenue?period=MONTHLY&startDate=2026-01-01&endDate=2026-01-31"
    )
    const response = await GET(request)

    expect(response.status).toBe(200)
    expect(prisma.revenueMetric.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          period: "MONTHLY",
          date: expect.objectContaining({
            gte: expect.any(Date),
            lte: expect.any(Date),
          }),
        }),
      })
    )
  })

  it("should calculate growth rates correctly", async () => {
    vi.mocked(validateSuperAdminSession).mockResolvedValueOnce({
      admin: { id: "admin-1", role: "SUPER_ADMIN" },
    } as never)

    const mockMetrics = [
      {
        id: "metric-1",
        date: new Date("2026-02-01"),
        period: "MONTHLY",
        mrr: 11000, // 10% growth
        arr: 132000,
        newMrr: 1500,
        expansionMrr: 500,
        contractionMrr: 200,
        churnMrr: 300,
        netNewMrr: 1500,
        totalCustomers: 110,
        newCustomers: 15,
        churnedCustomers: 5,
        arpu: 100,
        ltv: 2400,
        cac: null,
        byPlan: {},
        byRegion: {},
        byCohort: {},
        createdAt: new Date(),
      },
      {
        id: "metric-2",
        date: new Date("2026-01-01"),
        period: "MONTHLY",
        mrr: 10000,
        arr: 120000,
        newMrr: 1000,
        expansionMrr: 400,
        contractionMrr: 100,
        churnMrr: 200,
        netNewMrr: 1100,
        totalCustomers: 100,
        newCustomers: 10,
        churnedCustomers: 3,
        arpu: 100,
        ltv: 2400,
        cac: null,
        byPlan: {},
        byRegion: {},
        byCohort: {},
        createdAt: new Date(),
      },
    ]

    vi.mocked(prisma.revenueMetric.findMany).mockResolvedValueOnce(mockMetrics as never)

    const request = new NextRequest("http://localhost/api/admin/revenue")
    const response = await GET(request)

    const data = await response.json()
    expect(data.summary.mrrGrowthRate).toBe(10) // 10% growth
    expect(data.summary.customerGrowthRate).toBe(10) // 10% growth
  })

  it("should limit results based on limit parameter", async () => {
    vi.mocked(validateSuperAdminSession).mockResolvedValueOnce({
      admin: { id: "admin-1", role: "SUPER_ADMIN" },
    } as never)

    vi.mocked(prisma.revenueMetric.findMany).mockResolvedValueOnce([])

    const request = new NextRequest("http://localhost/api/admin/revenue?limit=5")
    await GET(request)

    expect(prisma.revenueMetric.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        take: 5,
      })
    )
  })
})
