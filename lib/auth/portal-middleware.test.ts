import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest, NextResponse } from 'next/server'
import {
  authenticateRequest,
  authenticatePortal,
  authenticateAdmin,
  authenticateGWI,
  authenticateUser,
  withAuth,
  withAdminAuth,
  withGWIAuth,
  withUserAuth,
  checkResourceAccess,
  checkPermission,
  getRequestMetadata,
  createAuditContext,
  unauthorizedResponse,
  forbiddenResponse,
  loginRedirect,
} from './portal-middleware'
import type { PortalSession } from './portal-session'

// Mock portal-session module
vi.mock('./portal-session', () => ({
  getPortalSession: vi.fn(),
  getPortalSessionByType: vi.fn(),
  hasPermission: vi.fn((session, permission) => {
    if (session.permissions.includes('super:*') || session.permissions.includes('gwi:*')) return true
    return session.permissions.includes(permission)
  }),
  hasAnyPermission: vi.fn((session, permissions) => {
    if (session.permissions.includes('super:*') || session.permissions.includes('gwi:*')) return true
    return permissions.some((p: string) => session.permissions.includes(p))
  }),
  hasAllPermissions: vi.fn((session, permissions) => {
    if (session.permissions.includes('super:*') || session.permissions.includes('gwi:*')) return true
    return permissions.every((p: string) => session.permissions.includes(p))
  }),
  canAccessResource: vi.fn((session, orgId) => {
    if (session.type === 'user') return session.organizationId === orgId
    return session.permissions.includes('super:*') || session.permissions.includes('gwi:*')
  }),
}))

// Mock unified-audit module
vi.mock('@/lib/audit/unified-audit', () => ({
  createAuditContext: vi.fn((session, _request) => ({
    portal: session.type.toUpperCase(),
    userId: session.type === 'user' ? session.userId : undefined,
    adminId: session.type !== 'user' ? session.userId : undefined,
    email: session.email,
    role: session.role,
  })),
  logAudit: vi.fn(),
}))

// Import mocked functions
import { getPortalSession, getPortalSessionByType } from './portal-session'

describe('Portal Middleware', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // Helper to create mock NextRequest
  const createMockRequest = (
    url: string = 'http://localhost:3000/api/gwi/surveys',
    headers: Record<string, string> = {}
  ): NextRequest => {
    const request = new NextRequest(url, {
      headers: new Headers(headers),
    })
    return request
  }

  // Helper to create mock session
  const createMockSession = (
    type: 'user' | 'admin' | 'gwi' = 'gwi',
    permissions: string[] = ['gwi:*'],
    overrides: Partial<PortalSession> = {}
  ): PortalSession => ({
    type,
    userId: 'user-123',
    email: 'test@example.com',
    name: 'Test User',
    role: type === 'gwi' ? 'GWI_ADMIN' : type === 'admin' ? 'SUPER_ADMIN' : 'user',
    permissions,
    organizationId: type === 'user' ? 'org-123' : undefined,
    expiresAt: new Date(Date.now() + 3600000),
    raw: { type } as PortalSession['raw'],
    ...overrides,
  })

  // ============================================================================
  // authenticateRequest Tests
  // ============================================================================

  describe('authenticateRequest', () => {
    describe('Authentication Success', () => {
      it('should return success with session when authenticated', async () => {
        const mockSession = createMockSession('gwi')
        vi.mocked(getPortalSession).mockResolvedValue(mockSession)

        const request = createMockRequest()
        const result = await authenticateRequest(request)

        expect(result.success).toBe(true)
        if (result.success) {
          expect(result.session).toEqual(mockSession)
        }
      })

      it('should pass with required permissions when user has them', async () => {
        const mockSession = createMockSession('gwi', ['surveys:read', 'surveys:write'])
        vi.mocked(getPortalSession).mockResolvedValue(mockSession)

        const request = createMockRequest()
        const result = await authenticateRequest(request, {
          requiredPermissions: ['surveys:read'],
        })

        expect(result.success).toBe(true)
      })

      it('should pass with any permissions when user has one', async () => {
        const mockSession = createMockSession('gwi', ['surveys:read'])
        vi.mocked(getPortalSession).mockResolvedValue(mockSession)

        const request = createMockRequest()
        const result = await authenticateRequest(request, {
          anyPermissions: ['surveys:read', 'pipelines:read'],
        })

        expect(result.success).toBe(true)
      })

      it('should pass custom authorize function', async () => {
        const mockSession = createMockSession('gwi')
        vi.mocked(getPortalSession).mockResolvedValue(mockSession)

        const request = createMockRequest()
        const result = await authenticateRequest(request, {
          authorize: async (session) => session.type === 'gwi',
        })

        expect(result.success).toBe(true)
      })
    })

    describe('Authentication Failure - 401 Unauthorized', () => {
      it('should return 401 when no session exists', async () => {
        vi.mocked(getPortalSession).mockResolvedValue(null)

        const request = createMockRequest()
        const result = await authenticateRequest(request)

        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.status).toBe(401)
          expect(result.error).toBe('Unauthorized')
        }
      })

      it('should return 401 response object', async () => {
        vi.mocked(getPortalSession).mockResolvedValue(null)

        const request = createMockRequest()
        const result = await authenticateRequest(request)

        if (!result.success) {
          expect(result.response).toBeInstanceOf(NextResponse)
          expect(result.response.status).toBe(401)
        }
      })
    })

    describe('Authorization Failure - 403 Forbidden', () => {
      it('should return 403 when missing required permissions', async () => {
        const mockSession = createMockSession('gwi', ['pipelines:read'])
        vi.mocked(getPortalSession).mockResolvedValue(mockSession)

        const request = createMockRequest()
        const result = await authenticateRequest(request, {
          requiredPermissions: ['surveys:write'],
        })

        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.status).toBe(403)
          expect(result.error).toContain('Insufficient permissions')
        }
      })

      it('should return 403 when missing all of any permissions', async () => {
        const mockSession = createMockSession('gwi', ['monitoring:read'])
        vi.mocked(getPortalSession).mockResolvedValue(mockSession)

        const request = createMockRequest()
        const result = await authenticateRequest(request, {
          anyPermissions: ['surveys:read', 'pipelines:read'],
        })

        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.status).toBe(403)
        }
      })

      it('should return 403 when custom authorize fails', async () => {
        const mockSession = createMockSession('gwi')
        vi.mocked(getPortalSession).mockResolvedValue(mockSession)

        const request = createMockRequest()
        const result = await authenticateRequest(request, {
          authorize: async () => false,
        })

        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.status).toBe(403)
          expect(result.error).toBe('Forbidden')
        }
      })
    })
  })

  // ============================================================================
  // authenticatePortal Tests
  // ============================================================================

  describe('authenticatePortal', () => {
    it('should authenticate for correct portal type', async () => {
      const mockSession = createMockSession('gwi')
      vi.mocked(getPortalSessionByType).mockResolvedValue(mockSession)

      const request = createMockRequest()
      const result = await authenticatePortal('gwi', request)

      expect(result.success).toBe(true)
      expect(getPortalSessionByType).toHaveBeenCalledWith('gwi')
    })

    it('should return 401 when session portal type does not match', async () => {
      const mockSession = createMockSession('admin')
      vi.mocked(getPortalSessionByType).mockResolvedValue(mockSession)

      const request = createMockRequest()
      const result = await authenticatePortal('gwi', request)

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.status).toBe(401)
        expect(result.error).toContain('Invalid portal session')
      }
    })

    it('should apply permission checks for portal authentication', async () => {
      const mockSession = createMockSession('gwi', ['surveys:read'])
      vi.mocked(getPortalSessionByType).mockResolvedValue(mockSession)

      const request = createMockRequest()
      const result = await authenticatePortal('gwi', request, {
        requiredPermissions: ['surveys:write'],
      })

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.status).toBe(403)
      }
    })
  })

  // ============================================================================
  // Portal-Specific Authentication Tests
  // ============================================================================

  describe('authenticateAdmin', () => {
    it('should authenticate admin portal requests', async () => {
      const mockSession = createMockSession('admin', ['super:*'])
      vi.mocked(getPortalSessionByType).mockResolvedValue(mockSession)

      const request = createMockRequest('http://localhost:3000/api/admin/tenants')
      const result = await authenticateAdmin(request)

      expect(result.success).toBe(true)
      expect(getPortalSessionByType).toHaveBeenCalledWith('admin')
    })

    it('should apply admin-specific permission checks', async () => {
      const mockSession = createMockSession('admin', ['tenants:read'])
      vi.mocked(getPortalSessionByType).mockResolvedValue(mockSession)

      const request = createMockRequest()
      const result = await authenticateAdmin(request, {
        requiredPermissions: ['tenants:write'],
      })

      expect(result.success).toBe(false)
    })
  })

  describe('authenticateGWI', () => {
    it('should authenticate GWI portal requests', async () => {
      const mockSession = createMockSession('gwi', ['gwi:*'])
      vi.mocked(getPortalSessionByType).mockResolvedValue(mockSession)

      const request = createMockRequest('http://localhost:3000/api/gwi/surveys')
      const result = await authenticateGWI(request)

      expect(result.success).toBe(true)
      expect(getPortalSessionByType).toHaveBeenCalledWith('gwi')
    })

    it('should apply GWI-specific permission checks', async () => {
      const mockSession = createMockSession('gwi', ['surveys:read'])
      vi.mocked(getPortalSessionByType).mockResolvedValue(mockSession)

      const request = createMockRequest()
      const result = await authenticateGWI(request, {
        requiredPermissions: ['pipelines:write'],
      })

      expect(result.success).toBe(false)
    })
  })

  describe('authenticateUser', () => {
    it('should authenticate user portal requests', async () => {
      const mockSession = createMockSession('user', ['user:*'])
      vi.mocked(getPortalSessionByType).mockResolvedValue(mockSession)

      const request = createMockRequest('http://localhost:3000/api/v1/insights')
      const result = await authenticateUser(request)

      expect(result.success).toBe(true)
      expect(getPortalSessionByType).toHaveBeenCalledWith('user')
    })
  })

  // ============================================================================
  // Higher-Order Function Tests
  // ============================================================================

  describe('withAuth', () => {
    it('should wrap handler and pass session on success', async () => {
      const mockSession = createMockSession('gwi')
      vi.mocked(getPortalSession).mockResolvedValue(mockSession)

      const handler = vi.fn().mockResolvedValue(
        NextResponse.json({ success: true })
      )
      const wrappedHandler = withAuth(handler)

      const request = createMockRequest()
      const response = await wrappedHandler(request)

      expect(handler).toHaveBeenCalledWith(request, mockSession, undefined)
      expect(response.status).toBe(200)
    })

    it('should return 401 without calling handler when not authenticated', async () => {
      vi.mocked(getPortalSession).mockResolvedValue(null)

      const handler = vi.fn()
      const wrappedHandler = withAuth(handler)

      const request = createMockRequest()
      const response = await wrappedHandler(request)

      expect(handler).not.toHaveBeenCalled()
      expect(response.status).toBe(401)
    })

    it('should return 403 without calling handler when lacking permissions', async () => {
      const mockSession = createMockSession('gwi', ['pipelines:read'])
      vi.mocked(getPortalSession).mockResolvedValue(mockSession)

      const handler = vi.fn()
      const wrappedHandler = withAuth(handler, {
        requiredPermissions: ['surveys:write'],
      })

      const request = createMockRequest()
      const response = await wrappedHandler(request)

      expect(handler).not.toHaveBeenCalled()
      expect(response.status).toBe(403)
    })

    it('should pass context to handler', async () => {
      const mockSession = createMockSession('gwi')
      vi.mocked(getPortalSession).mockResolvedValue(mockSession)

      const handler = vi.fn().mockResolvedValue(
        NextResponse.json({ success: true })
      )
      const wrappedHandler = withAuth(handler)

      const request = createMockRequest()
      const context = { params: Promise.resolve({ id: '123' }) }
      await wrappedHandler(request, context)

      expect(handler).toHaveBeenCalledWith(request, mockSession, context)
    })
  })

  describe('withAdminAuth', () => {
    it('should authenticate as admin portal', async () => {
      const mockSession = createMockSession('admin', ['super:*'])
      vi.mocked(getPortalSessionByType).mockResolvedValue(mockSession)

      const handler = vi.fn().mockResolvedValue(
        NextResponse.json({ success: true })
      )
      const wrappedHandler = withAdminAuth(handler)

      const request = createMockRequest()
      await wrappedHandler(request)

      expect(getPortalSessionByType).toHaveBeenCalledWith('admin')
      expect(handler).toHaveBeenCalled()
    })

    it('should return 401 for non-admin sessions', async () => {
      const mockSession = createMockSession('gwi')
      vi.mocked(getPortalSessionByType).mockResolvedValue(mockSession)

      const handler = vi.fn()
      const wrappedHandler = withAdminAuth(handler)

      const request = createMockRequest()
      const response = await wrappedHandler(request)

      expect(handler).not.toHaveBeenCalled()
      expect(response.status).toBe(401)
    })
  })

  describe('withGWIAuth', () => {
    it('should authenticate as GWI portal', async () => {
      const mockSession = createMockSession('gwi', ['gwi:*'])
      vi.mocked(getPortalSessionByType).mockResolvedValue(mockSession)

      const handler = vi.fn().mockResolvedValue(
        NextResponse.json({ success: true })
      )
      const wrappedHandler = withGWIAuth(handler)

      const request = createMockRequest()
      await wrappedHandler(request)

      expect(getPortalSessionByType).toHaveBeenCalledWith('gwi')
      expect(handler).toHaveBeenCalled()
    })

    it('should return 401 for non-GWI sessions', async () => {
      const mockSession = createMockSession('admin')
      vi.mocked(getPortalSessionByType).mockResolvedValue(mockSession)

      const handler = vi.fn()
      const wrappedHandler = withGWIAuth(handler)

      const request = createMockRequest()
      const response = await wrappedHandler(request)

      expect(handler).not.toHaveBeenCalled()
      expect(response.status).toBe(401)
    })

    it('should apply GWI permission checks', async () => {
      const mockSession = createMockSession('gwi', ['pipelines:read'])
      vi.mocked(getPortalSessionByType).mockResolvedValue(mockSession)

      const handler = vi.fn()
      const wrappedHandler = withGWIAuth(handler, {
        requiredPermissions: ['surveys:write'],
      })

      const request = createMockRequest()
      const response = await wrappedHandler(request)

      expect(handler).not.toHaveBeenCalled()
      expect(response.status).toBe(403)
    })
  })

  describe('withUserAuth', () => {
    it('should authenticate as user portal', async () => {
      const mockSession = createMockSession('user', ['user:*'])
      vi.mocked(getPortalSessionByType).mockResolvedValue(mockSession)

      const handler = vi.fn().mockResolvedValue(
        NextResponse.json({ success: true })
      )
      const wrappedHandler = withUserAuth(handler)

      const request = createMockRequest()
      await wrappedHandler(request)

      expect(getPortalSessionByType).toHaveBeenCalledWith('user')
      expect(handler).toHaveBeenCalled()
    })
  })

  // ============================================================================
  // Resource Authorization Tests
  // ============================================================================

  describe('checkResourceAccess', () => {
    it('should return null when access is allowed', () => {
      const mockSession = createMockSession('user', ['user:*'], {
        organizationId: 'org-123',
      })

      const result = checkResourceAccess(mockSession, 'org-123')
      expect(result).toBeNull()
    })

    it('should return 403 response when access is denied', () => {
      const mockSession = createMockSession('user', ['user:*'], {
        organizationId: 'org-123',
      })

      const result = checkResourceAccess(mockSession, 'org-456')
      expect(result).toBeInstanceOf(NextResponse)
      expect(result?.status).toBe(403)
    })
  })

  describe('checkPermission', () => {
    it('should return null when permission is granted', () => {
      const mockSession = createMockSession('gwi', ['surveys:read'])

      const result = checkPermission(mockSession, 'surveys:read')
      expect(result).toBeNull()
    })

    it('should return 403 response when permission is denied', () => {
      const mockSession = createMockSession('gwi', ['pipelines:read'])

      const result = checkPermission(mockSession, 'surveys:write')
      expect(result).toBeInstanceOf(NextResponse)
      expect(result?.status).toBe(403)
    })

    it('should include permission name in error message', async () => {
      const mockSession = createMockSession('gwi', ['pipelines:read'])

      const result = checkPermission(mockSession, 'surveys:write')
      if (result) {
        const body = await result.json()
        expect(body.error).toContain('surveys:write')
      }
    })
  })

  // ============================================================================
  // Request Metadata Tests
  // ============================================================================

  describe('getRequestMetadata', () => {
    it('should extract IP address from x-forwarded-for header', () => {
      const request = createMockRequest('http://localhost:3000', {
        'x-forwarded-for': '192.168.1.1, 10.0.0.1',
      })

      const metadata = getRequestMetadata(request)
      expect(metadata.ipAddress).toBe('192.168.1.1')
    })

    it('should extract IP address from x-real-ip header', () => {
      const request = createMockRequest('http://localhost:3000', {
        'x-real-ip': '192.168.1.1',
      })

      const metadata = getRequestMetadata(request)
      expect(metadata.ipAddress).toBe('192.168.1.1')
    })

    it('should extract user agent', () => {
      const request = createMockRequest('http://localhost:3000', {
        'user-agent': 'Mozilla/5.0 Test Browser',
      })

      const metadata = getRequestMetadata(request)
      expect(metadata.userAgent).toBe('Mozilla/5.0 Test Browser')
    })

    it('should return undefined for missing headers', () => {
      const request = createMockRequest()

      const metadata = getRequestMetadata(request)
      expect(metadata.ipAddress).toBeUndefined()
      expect(metadata.userAgent).toBeUndefined()
    })
  })

  // ============================================================================
  // Audit Context Tests
  // ============================================================================

  describe('createAuditContext', () => {
    it('should create audit context from session and request', () => {
      const mockSession = createMockSession('gwi')
      const request = createMockRequest()

      const context = createAuditContext(mockSession, request)

      expect(context).toBeDefined()
      expect(context.portal).toBe('GWI')
      expect(context.email).toBe('test@example.com')
    })
  })

  // ============================================================================
  // Response Helper Tests
  // ============================================================================

  describe('unauthorizedResponse', () => {
    it('should return 401 status', () => {
      const response = unauthorizedResponse()
      expect(response.status).toBe(401)
    })

    it('should include default error message', async () => {
      const response = unauthorizedResponse()
      const body = await response.json()
      expect(body.error).toBe('Unauthorized')
    })

    it('should include custom error message', async () => {
      const response = unauthorizedResponse('Custom unauthorized message')
      const body = await response.json()
      expect(body.error).toBe('Custom unauthorized message')
    })
  })

  describe('forbiddenResponse', () => {
    it('should return 403 status', () => {
      const response = forbiddenResponse()
      expect(response.status).toBe(403)
    })

    it('should include default error message', async () => {
      const response = forbiddenResponse()
      const body = await response.json()
      expect(body.error).toBe('Forbidden')
    })

    it('should include custom error message', async () => {
      const response = forbiddenResponse('Custom forbidden message')
      const body = await response.json()
      expect(body.error).toBe('Custom forbidden message')
    })
  })

  describe('loginRedirect', () => {
    beforeEach(() => {
      process.env.NEXTAUTH_URL = 'http://localhost:3000'
    })

    it('should redirect to user login', () => {
      const response = loginRedirect('user')
      expect(response.status).toBe(307) // NextResponse.redirect uses 307
    })

    it('should redirect to admin login with type parameter', () => {
      const response = loginRedirect('admin')
      const location = response.headers.get('location')
      expect(location).toContain('/login')
      expect(location).toContain('type=admin')
    })

    it('should redirect to gwi login with type parameter', () => {
      const response = loginRedirect('gwi')
      const location = response.headers.get('location')
      expect(location).toContain('/login')
      expect(location).toContain('type=gwi')
    })

    it('should include return URL when provided', () => {
      const response = loginRedirect('admin', '/admin/tenants')
      const location = response.headers.get('location')
      expect(location).toContain('returnUrl=')
      expect(location).toContain(encodeURIComponent('/admin/tenants'))
    })
  })
})
