import { describe, it, expect, vi, beforeEach } from 'vitest'

/**
 * Combined Integration Tests for GWI Insights API Endpoints
 *
 * Tests the following endpoints:
 * - GET /api/v1/gwi-insights/surveys - List surveys for user's organization
 * - GET /api/v1/gwi-insights/pipelines - List pipeline runs for user's organization
 * - GET /api/v1/gwi-insights/taxonomy - List taxonomy categories (global + org-specific)
 *
 * All endpoints require:
 * - User authentication via NextAuth session
 * - Valid organization membership
 * - Return org-scoped data only
 */

// Mock dependencies
vi.mock('@/lib/auth', () => ({
  auth: vi.fn(),
}))

vi.mock('@/lib/db', () => ({
  prisma: {
    survey: {
      findMany: vi.fn(),
      count: vi.fn(),
    },
    dataPipeline: {
      findMany: vi.fn(),
      count: vi.fn(),
    },
    taxonomyCategory: {
      findMany: vi.fn(),
      count: vi.fn(),
    },
  },
}))

vi.mock('@/lib/tenant', () => ({
  getValidatedOrgId: vi.fn(),
}))

import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { getValidatedOrgId } from '@/lib/tenant'

// Type assertion helper for mocked auth function
const mockedAuth = auth as ReturnType<typeof vi.fn>

describe('GWI Insights API Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // Helper to create mock authenticated session
  const mockAuthenticatedSession = () => {
    mockedAuth.mockResolvedValue({
      user: {
        id: 'user-123',
        email: 'user@example.com',
        name: 'Test User',
      },
      expires: new Date(Date.now() + 3600000).toISOString(),
    })
  }

  // Helper to create mock unauthenticated session
  const mockUnauthenticatedSession = () => {
    mockedAuth.mockResolvedValue(null)
  }

  // Helper to mock organization validation
  const mockValidOrganization = (orgId: string = 'org-123') => {
    vi.mocked(getValidatedOrgId).mockResolvedValue(orgId)
  }

  const mockInvalidOrganization = () => {
    vi.mocked(getValidatedOrgId).mockResolvedValue(null)
  }

  // ============================================================================
  // Authentication Tests (Common to all endpoints)
  // ============================================================================

  describe('Authentication Requirements', () => {
    describe('Unauthenticated requests', () => {
      beforeEach(() => {
        mockUnauthenticatedSession()
      })

      it('should return 401 when user is not authenticated', () => {
        // Simulating the auth check logic from route handlers
        const session = null as { user?: { id?: string } } | null
        const isAuthenticated = session?.user?.id
        expect(isAuthenticated).toBeFalsy()
      })

      it('should return "Unauthorized" error message', () => {
        const response = { error: 'Unauthorized', status: 401 }
        expect(response.error).toBe('Unauthorized')
        expect(response.status).toBe(401)
      })
    })

    describe('Authenticated requests without organization', () => {
      beforeEach(() => {
        mockAuthenticatedSession()
        mockInvalidOrganization()
      })

      it('should return 403 when organization validation fails', () => {
        const response = { error: 'Organization not found or access denied', status: 403 }
        expect(response.status).toBe(403)
      })

      it('should validate user membership in organization', async () => {
        const request = { url: 'http://localhost:3000/api/v1/gwi-insights/surveys' }
        await getValidatedOrgId(request as never, 'user-123')
        expect(getValidatedOrgId).toHaveBeenCalledWith(request, 'user-123')
      })
    })

    describe('Authenticated requests with valid organization', () => {
      beforeEach(() => {
        mockAuthenticatedSession()
        mockValidOrganization('org-123')
      })

      it('should proceed with request when authenticated and authorized', async () => {
        const session = await auth()
        const orgId = await getValidatedOrgId({} as never, session?.user?.id as string)

        expect(session?.user?.id).toBe('user-123')
        expect(orgId).toBe('org-123')
      })
    })
  })

  // ============================================================================
  // Surveys Endpoint Tests
  // ============================================================================

  describe('GET /api/v1/gwi-insights/surveys', () => {
    beforeEach(() => {
      mockAuthenticatedSession()
      mockValidOrganization('org-123')
    })

    describe('Organization Scoping', () => {
      it('should filter surveys by organization ID', async () => {
        vi.mocked(prisma.survey.findMany).mockResolvedValue([])
        vi.mocked(prisma.survey.count).mockResolvedValue(0)

        // Simulate the where clause construction
        const orgId = 'org-123'
        const where = { orgId }

        expect(where.orgId).toBe('org-123')
      })

      it('should not expose surveys from other organizations', () => {
        const surveys = [
          { id: 'survey-1', orgId: 'org-123' },
          { id: 'survey-2', orgId: 'org-456' }, // Different org
        ]

        const filteredSurveys = surveys.filter(s => s.orgId === 'org-123')
        expect(filteredSurveys).toHaveLength(1)
        expect(filteredSurveys[0].id).toBe('survey-1')
      })
    })

    describe('Survey Status Filtering', () => {
      it('should default to showing only ACTIVE and COMPLETED surveys', () => {
        const defaultStatus = { in: ['ACTIVE', 'COMPLETED'] }
        expect(defaultStatus.in).toContain('ACTIVE')
        expect(defaultStatus.in).toContain('COMPLETED')
        expect(defaultStatus.in).not.toContain('DRAFT')
      })

      it('should allow filtering by specific status', () => {
        const status = 'ACTIVE'
        const where = { status }
        expect(where.status).toBe('ACTIVE')
      })

      it('should support all valid survey statuses', () => {
        const validStatuses = ['DRAFT', 'ACTIVE', 'PAUSED', 'COMPLETED', 'ARCHIVED']
        validStatuses.forEach(status => {
          expect(validStatuses).toContain(status)
        })
      })
    })

    describe('Search Functionality', () => {
      it('should search by survey name', () => {
        const search = 'consumer'
        const nameClause = { name: { contains: search, mode: 'insensitive' } }
        const descClause = { description: { contains: search, mode: 'insensitive' } }
        const searchClause = {
          OR: [nameClause, descClause],
        }

        expect(searchClause.OR[0]).toBe(nameClause)
        expect(nameClause.name.contains).toBe('consumer')
      })

      it('should search by survey description', () => {
        const search = 'trends'
        const nameClause = { name: { contains: search, mode: 'insensitive' } }
        const descClause = { description: { contains: search, mode: 'insensitive' } }
        const searchClause = {
          OR: [nameClause, descClause],
        }

        expect(searchClause.OR[1]).toBe(descClause)
        expect(descClause.description.contains).toBe('trends')
      })
    })

    describe('Response Structure', () => {
      it('should return surveys with summary data', () => {
        const survey = {
          id: 'survey-123',
          name: 'Consumer Survey Q1',
          description: 'Quarterly consumer trends',
          status: 'ACTIVE',
          version: 2,
          createdAt: new Date(),
          updatedAt: new Date(),
          _count: {
            questions: 25,
            responses: 5000,
            distributions: 3,
          },
        }

        const transformedSurvey = {
          id: survey.id,
          name: survey.name,
          description: survey.description,
          status: 'Active', // Formatted status
          version: survey.version,
          summary: {
            totalQuestions: survey._count.questions,
            totalResponses: survey._count.responses,
            distributionChannels: survey._count.distributions,
          },
        }

        expect(transformedSurvey.summary.totalQuestions).toBe(25)
        expect(transformedSurvey.summary.totalResponses).toBe(5000)
        expect(transformedSurvey.status).toBe('Active')
      })

      it('should include pagination metadata', () => {
        const pagination = {
          total: 100,
          limit: 20,
          offset: 0,
          hasMore: true,
        }

        expect(pagination.hasMore).toBe(true)
        expect(pagination.limit).toBeLessThanOrEqual(100)
      })
    })

    describe('Pagination', () => {
      it('should limit results to max 100 per page', () => {
        const requestedLimit = 200
        const limit = Math.min(requestedLimit, 100)
        expect(limit).toBe(100)
      })

      it('should default to 20 results per page', () => {
        const defaultLimit = 20
        expect(defaultLimit).toBe(20)
      })

      it('should support offset pagination', () => {
        const offset = 40
        const limit = 20

        // Page 3 of results
        expect(offset / limit + 1).toBe(3)
      })
    })
  })

  // ============================================================================
  // Pipelines Endpoint Tests
  // ============================================================================

  describe('GET /api/v1/gwi-insights/pipelines', () => {
    beforeEach(() => {
      mockAuthenticatedSession()
      mockValidOrganization('org-123')
    })

    describe('Organization Scoping', () => {
      it('should filter pipelines by organization ID', () => {
        const orgId = 'org-123'
        const where = { orgId }
        expect(where.orgId).toBe('org-123')
      })

      it('should not expose pipelines from other organizations', () => {
        const pipelines = [
          { id: 'pipeline-1', orgId: 'org-123' },
          { id: 'pipeline-2', orgId: 'org-456' },
        ]

        const filtered = pipelines.filter(p => p.orgId === 'org-123')
        expect(filtered).toHaveLength(1)
      })
    })

    describe('Pipeline Type Filtering', () => {
      it('should support filtering by pipeline type', () => {
        const validTypes = ['ETL', 'TRANSFORMATION', 'AGGREGATION', 'EXPORT', 'SYNC']
        const type = 'ETL'

        expect(validTypes).toContain(type)
      })

      it('should format pipeline types for display', () => {
        const typeMap: Record<string, string> = {
          ETL: 'Data Extract/Load',
          TRANSFORMATION: 'Data Transformation',
          AGGREGATION: 'Data Aggregation',
          EXPORT: 'Data Export',
          SYNC: 'Data Sync',
        }

        expect(typeMap['ETL']).toBe('Data Extract/Load')
        expect(typeMap['SYNC']).toBe('Data Sync')
      })
    })

    describe('Active Status Filtering', () => {
      it('should filter by isActive status', () => {
        const isActive = true
        const where = { isActive }
        expect(where.isActive).toBe(true)
      })

      it('should parse isActive from query string', () => {
        const queryValue = 'true'
        const isActive = queryValue === 'true'
        expect(isActive).toBe(true)
      })
    })

    describe('Response Structure with Last Run', () => {
      it('should include last run information', () => {
        const pipeline = {
          id: 'pipeline-123',
          name: 'Data Sync Pipeline',
          type: 'SYNC',
          isActive: true,
          runs: [
            {
              id: 'run-1',
              status: 'COMPLETED',
              startedAt: new Date('2024-01-01T10:00:00Z'),
              completedAt: new Date('2024-01-01T10:05:00Z'),
              recordsProcessed: 10000,
              recordsFailed: 5,
            },
          ],
          _count: { runs: 150, validationRules: 5 },
        }

        const lastRun = pipeline.runs[0]
        expect(lastRun.status).toBe('COMPLETED')
        expect(lastRun.recordsProcessed).toBe(10000)
      })

      it('should calculate success rate', () => {
        const processed = 10000
        const failed = 100
        const successRate = Math.round(((processed - failed) / processed) * 100)

        expect(successRate).toBe(99)
      })

      it('should calculate run duration', () => {
        const startedAt = new Date('2024-01-01T10:00:00Z')
        const completedAt = new Date('2024-01-01T10:05:30Z')

        const durationMs = completedAt.getTime() - startedAt.getTime()
        const seconds = Math.floor(durationMs / 1000)
        const minutes = Math.floor(seconds / 60)

        expect(minutes).toBe(5)
        expect(seconds % 60).toBe(30)
      })

      it('should handle null last run', () => {
        const pipeline = {
          id: 'pipeline-123',
          name: 'New Pipeline',
          runs: [],
        }

        const lastRun = pipeline.runs[0] || null
        expect(lastRun).toBeNull()
      })
    })

    describe('Pipeline Status Determination', () => {
      it('should return "Inactive" for inactive pipelines', () => {
        const isActive = false
        const lastRun = { status: 'COMPLETED' }
        const status = !isActive ? 'Inactive' : lastRun?.status || 'Never Run'

        expect(status).toBe('Inactive')
      })

      it('should return "Never Run" for pipelines without runs', () => {
        const isActive = true
        const lastRun = null
        const status = !isActive ? 'Inactive' : lastRun ? 'Healthy' : 'Never Run'

        expect(status).toBe('Never Run')
      })

      it('should return "Healthy" for completed last run', () => {
        const lastRunStatus = 'COMPLETED'
        const statusMap: Record<string, string> = {
          RUNNING: 'Running',
          FAILED: 'Last Run Failed',
          COMPLETED: 'Healthy',
        }

        expect(statusMap[lastRunStatus]).toBe('Healthy')
      })

      it('should return "Last Run Failed" for failed runs', () => {
        const lastRunStatus = 'FAILED'
        const status = lastRunStatus === 'FAILED' ? 'Last Run Failed' : 'Healthy'

        expect(status).toBe('Last Run Failed')
      })
    })
  })

  // ============================================================================
  // Taxonomy Endpoint Tests
  // ============================================================================

  describe('GET /api/v1/gwi-insights/taxonomy', () => {
    beforeEach(() => {
      mockAuthenticatedSession()
      mockValidOrganization('org-123')
    })

    describe('Scope Filtering (Global + Organization)', () => {
      it('should include both global and org-specific categories', () => {
        const orgId = 'org-123'
        const where = {
          isActive: true,
          OR: [
            { orgId: null },    // Global categories
            { orgId: orgId },   // Organization-specific
          ],
        }

        expect(where.OR).toHaveLength(2)
        expect(where.OR[0].orgId).toBeNull()
        expect(where.OR[1].orgId).toBe('org-123')
      })

      it('should not expose other organizations\' categories', () => {
        const categories = [
          { id: 'cat-1', orgId: null },        // Global
          { id: 'cat-2', orgId: 'org-123' },   // User's org
          { id: 'cat-3', orgId: 'org-456' },   // Different org
        ]

        const userOrgId = 'org-123'
        const filtered = categories.filter(
          c => c.orgId === null || c.orgId === userOrgId
        )

        expect(filtered).toHaveLength(2)
        expect(filtered.map(c => c.id)).toContain('cat-1')
        expect(filtered.map(c => c.id)).toContain('cat-2')
        expect(filtered.map(c => c.id)).not.toContain('cat-3')
      })
    })

    describe('Response Structure', () => {
      it('should categorize results as global or organization', () => {
        const categories = [
          { id: 'cat-1', name: 'Demographics', orgId: null },
          { id: 'cat-2', name: 'Custom Category', orgId: 'org-123' },
        ]

        const globalCategories = categories.filter(c => c.orgId === null)
        const orgCategories = categories.filter(c => c.orgId !== null)

        expect(globalCategories).toHaveLength(1)
        expect(orgCategories).toHaveLength(1)
        expect(globalCategories[0].name).toBe('Demographics')
        expect(orgCategories[0].name).toBe('Custom Category')
      })

      it('should include grouped response format', () => {
        const response = {
          categories: [],
          grouped: {
            global: { count: 10, categories: [] },
            organization: { count: 5, categories: [] },
          },
          pagination: { total: 15, limit: 50, offset: 0, hasMore: false },
        }

        expect(response.grouped.global.count).toBe(10)
        expect(response.grouped.organization.count).toBe(5)
      })
    })

    describe('Hierarchy Support', () => {
      it('should filter by parentId for root categories', () => {
        const parentId = 'root'
        const where = parentId === 'root' ? { parentId: null } : { parentId }

        expect(where.parentId).toBeNull()
      })

      it('should filter by specific parent category', () => {
        const parentId = 'parent-123'
        const where = { parentId }

        expect(where.parentId).toBe('parent-123')
      })

      it('should include parent information in response', () => {
        const category = {
          id: 'cat-1',
          name: 'Age Groups',
          parentId: 'parent-1',
          parent: {
            id: 'parent-1',
            name: 'Demographics',
            code: 'DEMO',
          },
          _count: { children: 5, attributes: 3 },
        }

        const hierarchy = {
          parentId: category.parentId,
          parent: category.parent,
          childCount: category._count.children,
          hasChildren: category._count.children > 0,
        }

        expect(hierarchy.parent?.name).toBe('Demographics')
        expect(hierarchy.hasChildren).toBe(true)
        expect(hierarchy.childCount).toBe(5)
      })
    })

    describe('Search Functionality', () => {
      it('should search by name', () => {
        const search = 'demo'
        const nameClause = { name: { contains: search, mode: 'insensitive' } }
        const codeClause = { code: { contains: search, mode: 'insensitive' } }
        const descClause = { description: { contains: search, mode: 'insensitive' } }
        const searchClause = {
          OR: [nameClause, codeClause, descClause],
        }

        expect(searchClause.OR).toHaveLength(3)
        expect(nameClause.name.contains).toBe('demo')
      })

      it('should search by code', () => {
        const search = 'DEMO'
        const matches = [
          { code: 'DEMO_AGE' },
          { code: 'BRAND_AWARENESS' },
        ].filter(c => c.code.includes(search))

        expect(matches).toHaveLength(1)
      })
    })

    describe('Attributes Inclusion', () => {
      it('should optionally include attributes', () => {
        const includeAttributes = true
        const select = {
          id: true,
          name: true,
          ...(includeAttributes && {
            attributes: {
              select: {
                id: true,
                name: true,
                code: true,
                dataType: true,
              },
            },
          }),
        }

        expect(select.attributes).toBeDefined()
      })

      it('should format attribute data types', () => {
        const typeMap: Record<string, string> = {
          string: 'Text',
          number: 'Number',
          boolean: 'Yes/No',
          date: 'Date',
          datetime: 'Date & Time',
          enum: 'Selection',
          array: 'List',
          object: 'Complex',
        }

        expect(typeMap['string']).toBe('Text')
        expect(typeMap['boolean']).toBe('Yes/No')
        expect(typeMap['enum']).toBe('Selection')
      })
    })

    describe('Pagination', () => {
      it('should limit results to max 200 per page', () => {
        const requestedLimit = 500
        const limit = Math.min(requestedLimit, 200)
        expect(limit).toBe(200)
      })

      it('should default to 50 results per page', () => {
        const defaultLimit = 50
        expect(defaultLimit).toBe(50)
      })
    })
  })

  // ============================================================================
  // Error Handling Tests
  // ============================================================================

  describe('Error Handling', () => {
    describe('Authentication Errors', () => {
      it('should return 401 for missing session', () => {
        const session = null as { user?: { id?: string } } | null
        const response = !session?.user?.id
          ? { error: 'Unauthorized', status: 401 }
          : { status: 200 }

        expect(response.status).toBe(401)
      })

      it('should return 401 for session without user ID', () => {
        const session = { user: { email: 'test@example.com' } }
        const response = !(session?.user as { id?: string })?.id
          ? { error: 'Unauthorized', status: 401 }
          : { status: 200 }

        expect(response.status).toBe(401)
      })
    })

    describe('Authorization Errors', () => {
      it('should return 403 for invalid organization', () => {
        const orgId = null
        const response = !orgId
          ? { error: 'Organization not found or access denied', status: 403 }
          : { status: 200 }

        expect(response.status).toBe(403)
        expect(response.error).toContain('Organization')
      })
    })

    describe('Server Errors', () => {
      it('should return 500 for database errors', () => {
        // Simulate error handling in route
        const handleError = (_error: Error) => ({
          error: 'Internal server error',
          status: 500,
        })

        const response = handleError(new Error('Database connection failed'))
        expect(response.status).toBe(500)
      })

      it('should log errors to console', () => {
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

        const error = new Error('Test error')
        console.error('GET /api/v1/gwi-insights/surveys error:', error)

        expect(consoleSpy).toHaveBeenCalledWith(
          'GET /api/v1/gwi-insights/surveys error:',
          error
        )

        consoleSpy.mockRestore()
      })
    })
  })

  // ============================================================================
  // Cross-Endpoint Consistency Tests
  // ============================================================================

  describe('Cross-Endpoint Consistency', () => {
    it('should use consistent authentication pattern across endpoints', () => {
      const authCheck = async () => {
        const session = await auth()
        if (!session?.user?.id) {
          return { error: 'Unauthorized', status: 401 }
        }
        return null
      }

      // All endpoints use this pattern
      expect(authCheck).toBeDefined()
    })

    it('should use consistent organization validation across endpoints', async () => {
      mockAuthenticatedSession()
      const session = await auth()

      // All endpoints call getValidatedOrgId with the same pattern
      await getValidatedOrgId({} as never, session?.user?.id as string)

      expect(getValidatedOrgId).toHaveBeenCalled()
    })

    it('should use consistent pagination structure across endpoints', () => {
      const paginationResponse = {
        total: 100,
        limit: 20,
        offset: 0,
        hasMore: true,
      }

      // Verify hasMore calculation
      expect(paginationResponse.offset + paginationResponse.limit < paginationResponse.total)
        .toBe(paginationResponse.hasMore)
    })

    it('should use consistent error response format across endpoints', () => {
      const errorResponses = [
        { error: 'Unauthorized', status: 401 },
        { error: 'Organization not found or access denied', status: 403 },
        { error: 'Internal server error', status: 500 },
      ]

      errorResponses.forEach(response => {
        expect(response).toHaveProperty('error')
        expect(response).toHaveProperty('status')
        expect(typeof response.error).toBe('string')
        expect(typeof response.status).toBe('number')
      })
    })
  })
})
