import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  detectPortalType,
  getPortalCookieName,
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  canAccessResource,
  canModifyResource,
  isSessionValid,
  getSessionRemainingTime,
  isSessionExpiringSoon,
  isUserSession,
  isAdminSession,
  isGWISession,
  type PortalSession,
  type PortalType,
} from './portal-session'

// Mock dependencies
vi.mock('next/headers', () => ({
  cookies: vi.fn(),
}))

vi.mock('@/lib/auth', () => ({
  auth: vi.fn(),
}))

vi.mock('@/lib/super-admin', () => ({
  validateSuperAdminSession: vi.fn(),
  SUPER_ADMIN_ROLE_PERMISSIONS: {
    SUPER_ADMIN: ['super:*', 'tenants:read', 'tenants:write'],
    ADMIN: ['tenants:read'],
  },
  hasSuperAdminPermission: vi.fn((role, permission) => {
    if (role === 'SUPER_ADMIN') return true
    if (role === 'ADMIN' && permission === 'tenants:read') return true
    return false
  }),
}))

vi.mock('@/lib/gwi-permissions', () => ({
  GWI_ROLE_PERMISSIONS: {
    GWI_ADMIN: ['gwi:*'],
    DATA_ENGINEER: ['pipelines:read', 'pipelines:write', 'datasources:read'],
    TAXONOMY_MANAGER: ['surveys:read', 'surveys:write', 'taxonomy:read'],
  },
  hasGWIPermission: vi.fn((role, permission) => {
    if (role === 'GWI_ADMIN') return true
    if (role === 'DATA_ENGINEER' && permission.startsWith('pipelines:')) return true
    if (role === 'DATA_ENGINEER' && permission === 'datasources:read') return true
    if (role === 'TAXONOMY_MANAGER' && permission.startsWith('surveys:')) return true
    if (role === 'TAXONOMY_MANAGER' && permission === 'taxonomy:read') return true
    return false
  }),
}))

describe('Portal Session Management', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // ============================================================================
  // Portal Type Detection Tests
  // ============================================================================

  describe('detectPortalType', () => {
    describe('User Portal Detection', () => {
      it('should detect user portal from /dashboard path', () => {
        expect(detectPortalType('/dashboard')).toBe('user')
      })

      it('should detect user portal from /dashboard/settings path', () => {
        expect(detectPortalType('/dashboard/settings')).toBe('user')
      })

      it('should detect user portal from /settings path', () => {
        expect(detectPortalType('/settings')).toBe('user')
      })

      it('should detect user portal from /projects path', () => {
        expect(detectPortalType('/projects')).toBe('user')
      })

      it('should detect user portal from /projects/123 path', () => {
        expect(detectPortalType('/projects/123')).toBe('user')
      })

      it('should detect user portal from /agents path', () => {
        expect(detectPortalType('/agents')).toBe('user')
      })
    })

    describe('Admin Portal Detection', () => {
      it('should detect admin portal from /admin path', () => {
        expect(detectPortalType('/admin')).toBe('admin')
      })

      it('should detect admin portal from /admin/tenants path', () => {
        expect(detectPortalType('/admin/tenants')).toBe('admin')
      })

      it('should detect admin portal from /admin/users/123 path', () => {
        expect(detectPortalType('/admin/users/123')).toBe('admin')
      })

      it('should detect admin portal from /api/admin path', () => {
        expect(detectPortalType('/api/admin')).toBe('admin')
      })

      it('should detect admin portal from /api/admin/tenants path', () => {
        expect(detectPortalType('/api/admin/tenants')).toBe('admin')
      })
    })

    describe('GWI Portal Detection', () => {
      it('should detect gwi portal from /gwi path', () => {
        expect(detectPortalType('/gwi')).toBe('gwi')
      })

      it('should detect gwi portal from /gwi/surveys path', () => {
        expect(detectPortalType('/gwi/surveys')).toBe('gwi')
      })

      it('should detect gwi portal from /gwi/pipelines/123 path', () => {
        expect(detectPortalType('/gwi/pipelines/123')).toBe('gwi')
      })

      it('should detect gwi portal from /api/gwi path', () => {
        expect(detectPortalType('/api/gwi')).toBe('gwi')
      })

      it('should detect gwi portal from /api/gwi/surveys path', () => {
        expect(detectPortalType('/api/gwi/surveys')).toBe('gwi')
      })
    })

    describe('Default Portal Detection', () => {
      it('should default to user portal for unknown paths', () => {
        expect(detectPortalType('/unknown')).toBe('user')
      })

      it('should default to user portal for root path', () => {
        expect(detectPortalType('/')).toBe('user')
      })

      it('should default to user portal for /api/v1 paths', () => {
        expect(detectPortalType('/api/v1/insights')).toBe('user')
      })
    })
  })

  describe('getPortalCookieName', () => {
    it('should return adminToken for admin portal', () => {
      expect(getPortalCookieName('admin')).toBe('adminToken')
    })

    it('should return gwiToken for gwi portal', () => {
      expect(getPortalCookieName('gwi')).toBe('gwiToken')
    })

    it('should return null for user portal (uses NextAuth)', () => {
      expect(getPortalCookieName('user')).toBeNull()
    })
  })

  // ============================================================================
  // Permission Checking Tests
  // ============================================================================

  describe('hasPermission', () => {
    const createMockSession = (
      type: PortalType,
      role: string,
      permissions: string[]
    ): PortalSession => ({
      type,
      userId: 'user-123',
      email: 'test@example.com',
      name: 'Test User',
      role,
      permissions,
      expiresAt: new Date(Date.now() + 3600000),
      raw: { type } as PortalSession['raw'],
    })

    describe('Wildcard Permission Checks', () => {
      it('should grant access with matching wildcard permission', () => {
        const session = createMockSession('gwi', 'GWI_ADMIN', ['surveys:*'])
        expect(hasPermission(session, 'surveys:read')).toBe(true)
        expect(hasPermission(session, 'surveys:write')).toBe(true)
      })

      it('should grant access with super:* wildcard', () => {
        const session = createMockSession('admin', 'SUPER_ADMIN', ['super:*'])
        expect(hasPermission(session, 'tenants:read')).toBe(true)
        expect(hasPermission(session, 'anything:else')).toBe(true)
      })

      it('should grant access with gwi:* wildcard', () => {
        const session = createMockSession('gwi', 'GWI_ADMIN', ['gwi:*'])
        expect(hasPermission(session, 'surveys:read')).toBe(true)
        expect(hasPermission(session, 'pipelines:write')).toBe(true)
      })
    })

    describe('Direct Permission Checks', () => {
      it('should grant access with exact permission match', () => {
        const session = createMockSession('gwi', 'DATA_ENGINEER', [
          'pipelines:read',
          'pipelines:write',
        ])
        expect(hasPermission(session, 'pipelines:read')).toBe(true)
      })

      it('should deny access without matching permission', () => {
        const session = createMockSession('gwi', 'DATA_ENGINEER', [
          'pipelines:read',
        ])
        expect(hasPermission(session, 'surveys:write')).toBe(false)
      })
    })

    describe('User Portal Permission Checks', () => {
      it('should check user portal permissions from session', () => {
        const session = createMockSession('user', 'user', ['user:*'])
        expect(hasPermission(session, 'user:read')).toBe(true)
      })

      it('should deny user portal access without permission', () => {
        const session = createMockSession('user', 'user', ['user:read'])
        expect(hasPermission(session, 'admin:write')).toBe(false)
      })
    })
  })

  describe('hasAnyPermission', () => {
    const createMockSession = (permissions: string[]): PortalSession => ({
      type: 'gwi',
      userId: 'user-123',
      email: 'test@example.com',
      name: 'Test User',
      role: 'DATA_ENGINEER',
      permissions,
      expiresAt: new Date(Date.now() + 3600000),
      raw: { type: 'gwi' } as PortalSession['raw'],
    })

    it('should return true if any permission matches', () => {
      const session = createMockSession(['pipelines:read', 'datasources:read'])
      expect(
        hasAnyPermission(session, ['surveys:read', 'pipelines:read'])
      ).toBe(true)
    })

    it('should return false if no permission matches', () => {
      const session = createMockSession(['pipelines:read'])
      expect(
        hasAnyPermission(session, ['surveys:read', 'taxonomy:write'])
      ).toBe(false)
    })

    it('should return true with empty permissions array', () => {
      const session = createMockSession(['pipelines:read'])
      expect(hasAnyPermission(session, [])).toBe(false) // Empty array means no permissions to check
    })
  })

  describe('hasAllPermissions', () => {
    const createMockSession = (permissions: string[], role: string = 'SUPPORT'): PortalSession => ({
      type: 'gwi',
      userId: 'user-123',
      email: 'test@example.com',
      name: 'Test User',
      role,
      permissions,
      expiresAt: new Date(Date.now() + 3600000),
      raw: { type: 'gwi' } as PortalSession['raw'],
    })

    it('should return true if all permissions match', () => {
      const session = createMockSession([
        'pipelines:read',
        'pipelines:write',
        'datasources:read',
      ])
      expect(
        hasAllPermissions(session, ['pipelines:read', 'pipelines:write'])
      ).toBe(true)
    })

    it('should return false if any permission is missing', () => {
      // Use SUPPORT role which doesn't have pipelines:write via role-based permissions
      const session = createMockSession(['pipelines:read'], 'SUPPORT')
      expect(
        hasAllPermissions(session, ['pipelines:read', 'pipelines:write'])
      ).toBe(false)
    })

    it('should return true with empty permissions array', () => {
      const session = createMockSession(['pipelines:read'])
      expect(hasAllPermissions(session, [])).toBe(true)
    })
  })

  // ============================================================================
  // Resource Access Control Tests
  // ============================================================================

  describe('canAccessResource', () => {
    const createMockSession = (
      type: PortalType,
      permissions: string[],
      organizationId?: string,
      role?: string
    ): PortalSession => ({
      type,
      userId: 'user-123',
      email: 'test@example.com',
      name: 'Test User',
      role: role || (type === 'user' ? 'user' : type === 'admin' ? 'ADMIN' : 'SUPPORT'),
      permissions,
      organizationId,
      expiresAt: new Date(Date.now() + 3600000),
      raw: { type } as PortalSession['raw'],
    })

    describe('User Portal Resource Access', () => {
      it('should allow access to own organization resources', () => {
        const session = createMockSession('user', ['user:*'], 'org-123')
        expect(canAccessResource(session, 'org-123')).toBe(true)
      })

      it('should deny access to other organization resources', () => {
        const session = createMockSession('user', ['user:*'], 'org-123')
        expect(canAccessResource(session, 'org-456')).toBe(false)
      })
    })

    describe('Admin Portal Resource Access', () => {
      it('should allow admin with tenants:read to access any org', () => {
        const session = createMockSession('admin', ['tenants:read'])
        expect(canAccessResource(session, 'any-org')).toBe(true)
      })

      it('should allow admin with tenants:impersonate to access any org', () => {
        const session = createMockSession('admin', ['tenants:impersonate'])
        expect(canAccessResource(session, 'any-org')).toBe(true)
      })

      it('should allow admin with super:* to access any org', () => {
        const session = createMockSession('admin', ['super:*'])
        expect(canAccessResource(session, 'any-org')).toBe(true)
      })

      it('should deny admin without proper permissions', () => {
        // Use SUPPORT role which doesn't have tenants:read or tenants:impersonate
        const session = createMockSession('admin', ['other:permission'], undefined, 'SUPPORT')
        expect(canAccessResource(session, 'any-org')).toBe(false)
      })
    })

    describe('GWI Portal Resource Access', () => {
      it('should allow gwi user with gwi:* to access any org', () => {
        const session = createMockSession('gwi', ['gwi:*'], undefined, 'GWI_ADMIN')
        expect(canAccessResource(session, 'any-org')).toBe(true)
      })

      it('should allow gwi user with datasources:read to access any org', () => {
        const session = createMockSession('gwi', ['datasources:read'], undefined, 'DATA_ENGINEER')
        expect(canAccessResource(session, 'any-org')).toBe(true)
      })

      it('should deny gwi user without proper permissions', () => {
        // Use SUPPORT role which doesn't have gwi:* or datasources:read permissions
        const session = createMockSession('gwi', ['pipelines:read'], undefined, 'SUPPORT')
        expect(canAccessResource(session, 'any-org')).toBe(false)
      })
    })
  })

  describe('canModifyResource', () => {
    const createMockSession = (
      type: PortalType,
      permissions: string[],
      organizationId?: string
    ): PortalSession => ({
      type,
      userId: 'user-123',
      email: 'test@example.com',
      name: 'Test User',
      role: type === 'user' ? 'user' : 'GWI_ADMIN',
      permissions,
      organizationId,
      expiresAt: new Date(Date.now() + 3600000),
      raw: { type } as PortalSession['raw'],
    })

    it('should allow user to modify own organization resources', () => {
      const session = createMockSession('user', ['user:*'], 'org-123')
      expect(canModifyResource(session, 'org-123')).toBe(true)
    })

    it('should deny user from modifying other organization resources', () => {
      const session = createMockSession('user', ['user:*'], 'org-123')
      expect(canModifyResource(session, 'org-456')).toBe(false)
    })

    it('should allow admin with tenants:write to modify any org', () => {
      const session = createMockSession('admin', ['tenants:write'])
      expect(canModifyResource(session, 'any-org')).toBe(true)
    })

    it('should allow gwi user with gwi:* to modify any org', () => {
      const session = createMockSession('gwi', ['gwi:*'])
      expect(canModifyResource(session, 'any-org')).toBe(true)
    })
  })

  // ============================================================================
  // Session Validation Tests
  // ============================================================================

  describe('isSessionValid', () => {
    const createMockSession = (expiresAt: Date): PortalSession => ({
      type: 'user',
      userId: 'user-123',
      email: 'test@example.com',
      name: 'Test User',
      role: 'user',
      permissions: ['user:*'],
      expiresAt,
      raw: { type: 'user' } as PortalSession['raw'],
    })

    it('should return true for non-expired session', () => {
      const session = createMockSession(new Date(Date.now() + 3600000))
      expect(isSessionValid(session)).toBe(true)
    })

    it('should return false for expired session', () => {
      const session = createMockSession(new Date(Date.now() - 3600000))
      expect(isSessionValid(session)).toBe(false)
    })

    it('should return false for session expiring now', () => {
      const session = createMockSession(new Date(Date.now() - 1))
      expect(isSessionValid(session)).toBe(false)
    })
  })

  describe('getSessionRemainingTime', () => {
    const createMockSession = (expiresAt: Date): PortalSession => ({
      type: 'user',
      userId: 'user-123',
      email: 'test@example.com',
      name: 'Test User',
      role: 'user',
      permissions: ['user:*'],
      expiresAt,
      raw: { type: 'user' } as PortalSession['raw'],
    })

    it('should return positive time for non-expired session', () => {
      const futureTime = Date.now() + 3600000
      const session = createMockSession(new Date(futureTime))
      const remaining = getSessionRemainingTime(session)
      expect(remaining).toBeGreaterThan(0)
      expect(remaining).toBeLessThanOrEqual(3600000)
    })

    it('should return 0 for expired session', () => {
      const session = createMockSession(new Date(Date.now() - 3600000))
      expect(getSessionRemainingTime(session)).toBe(0)
    })
  })

  describe('isSessionExpiringSoon', () => {
    const createMockSession = (expiresAt: Date): PortalSession => ({
      type: 'user',
      userId: 'user-123',
      email: 'test@example.com',
      name: 'Test User',
      role: 'user',
      permissions: ['user:*'],
      expiresAt,
      raw: { type: 'user' } as PortalSession['raw'],
    })

    it('should return true for session expiring within window', () => {
      const session = createMockSession(new Date(Date.now() + 60000)) // 1 minute
      expect(isSessionExpiringSoon(session, 300000)).toBe(true) // 5 minute window
    })

    it('should return false for session not expiring soon', () => {
      const session = createMockSession(new Date(Date.now() + 3600000)) // 1 hour
      expect(isSessionExpiringSoon(session, 300000)).toBe(false) // 5 minute window
    })

    it('should use default 5-minute window', () => {
      const session = createMockSession(new Date(Date.now() + 60000)) // 1 minute
      expect(isSessionExpiringSoon(session)).toBe(true)
    })
  })

  // ============================================================================
  // Type Guard Tests
  // ============================================================================

  describe('Type Guards', () => {
    const createMockSession = (type: PortalType): PortalSession => ({
      type,
      userId: 'user-123',
      email: 'test@example.com',
      name: 'Test User',
      role: 'user',
      permissions: ['user:*'],
      expiresAt: new Date(Date.now() + 3600000),
      raw: { type } as PortalSession['raw'],
    })

    describe('isUserSession', () => {
      it('should return true for user session', () => {
        const session = createMockSession('user')
        expect(isUserSession(session)).toBe(true)
      })

      it('should return false for admin session', () => {
        const session = createMockSession('admin')
        expect(isUserSession(session)).toBe(false)
      })

      it('should return false for gwi session', () => {
        const session = createMockSession('gwi')
        expect(isUserSession(session)).toBe(false)
      })
    })

    describe('isAdminSession', () => {
      it('should return true for admin session', () => {
        const session = createMockSession('admin')
        expect(isAdminSession(session)).toBe(true)
      })

      it('should return false for user session', () => {
        const session = createMockSession('user')
        expect(isAdminSession(session)).toBe(false)
      })

      it('should return false for gwi session', () => {
        const session = createMockSession('gwi')
        expect(isAdminSession(session)).toBe(false)
      })
    })

    describe('isGWISession', () => {
      it('should return true for gwi session', () => {
        const session = createMockSession('gwi')
        expect(isGWISession(session)).toBe(true)
      })

      it('should return false for user session', () => {
        const session = createMockSession('user')
        expect(isGWISession(session)).toBe(false)
      })

      it('should return false for admin session', () => {
        const session = createMockSession('admin')
        expect(isGWISession(session)).toBe(false)
      })
    })
  })
})
