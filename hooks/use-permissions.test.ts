import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import {
  usePermissions,
  useCanCreateAgents,
  useCanDeleteAgents,
  useCanExecuteAgents,
  useCanManageTeam,
  useCanManageBilling,
  useCanViewAuditLogs,
} from './use-permissions'

// Mock the organization hook
const mockRole = vi.fn()

vi.mock('./use-organization', () => ({
  useOrgRole: () => mockRole(),
}))

describe('usePermissions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockRole.mockReturnValue(null)
  })

  describe('with no role', () => {
    it('returns empty permissions', () => {
      mockRole.mockReturnValue(null)

      const { result } = renderHook(() => usePermissions())

      expect(result.current.permissions).toEqual([])
      expect(result.current.role).toBeNull()
    })

    it('denies all permission checks', () => {
      mockRole.mockReturnValue(null)

      const { result } = renderHook(() => usePermissions())

      expect(result.current.can('agents:read')).toBe(false)
      expect(result.current.canAny(['agents:read', 'agents:write'])).toBe(false)
      expect(result.current.canAll(['agents:read'])).toBe(false)
      expect(result.current.canManage('MEMBER')).toBe(false)
    })

    it('returns false for all role flags', () => {
      mockRole.mockReturnValue(null)

      const { result } = renderHook(() => usePermissions())

      expect(result.current.isOwner).toBe(false)
      expect(result.current.isAdmin).toBe(false)
      expect(result.current.isMember).toBe(false)
    })
  })

  describe('with OWNER role', () => {
    beforeEach(() => {
      mockRole.mockReturnValue('OWNER')
    })

    it('returns OWNER role', () => {
      const { result } = renderHook(() => usePermissions())

      expect(result.current.role).toBe('OWNER')
    })

    it('has all permissions', () => {
      const { result } = renderHook(() => usePermissions())

      expect(result.current.can('agents:read')).toBe(true)
      expect(result.current.can('agents:write')).toBe(true)
      expect(result.current.can('agents:delete')).toBe(true)
      expect(result.current.can('billing:manage')).toBe(true)
      expect(result.current.can('team:manage')).toBe(true)
      expect(result.current.can('audit:read')).toBe(true)
    })

    it('can manage all roles', () => {
      const { result } = renderHook(() => usePermissions())

      expect(result.current.canManage('ADMIN')).toBe(true)
      expect(result.current.canManage('MEMBER')).toBe(true)
      expect(result.current.canManage('VIEWER')).toBe(true)
    })

    it('returns true for all role flags', () => {
      const { result } = renderHook(() => usePermissions())

      expect(result.current.isOwner).toBe(true)
      expect(result.current.isAdmin).toBe(true)
      expect(result.current.isMember).toBe(true)
    })
  })

  describe('with ADMIN role', () => {
    beforeEach(() => {
      mockRole.mockReturnValue('ADMIN')
    })

    it('returns ADMIN role', () => {
      const { result } = renderHook(() => usePermissions())

      expect(result.current.role).toBe('ADMIN')
    })

    it('has most permissions except billing:manage', () => {
      const { result } = renderHook(() => usePermissions())

      expect(result.current.can('agents:read')).toBe(true)
      expect(result.current.can('agents:write')).toBe(true)
      expect(result.current.can('agents:delete')).toBe(true)
      expect(result.current.can('team:manage')).toBe(true)
      expect(result.current.can('audit:read')).toBe(true)
      expect(result.current.can('billing:manage')).toBe(false)
    })

    it('can manage MEMBER and VIEWER roles', () => {
      const { result } = renderHook(() => usePermissions())

      expect(result.current.canManage('MEMBER')).toBe(true)
      expect(result.current.canManage('VIEWER')).toBe(true)
      expect(result.current.canManage('ADMIN')).toBe(false)
      expect(result.current.canManage('OWNER')).toBe(false)
    })

    it('returns correct role flags', () => {
      const { result } = renderHook(() => usePermissions())

      expect(result.current.isOwner).toBe(false)
      expect(result.current.isAdmin).toBe(true)
      expect(result.current.isMember).toBe(true)
    })
  })

  describe('with MEMBER role', () => {
    beforeEach(() => {
      mockRole.mockReturnValue('MEMBER')
    })

    it('returns MEMBER role', () => {
      const { result } = renderHook(() => usePermissions())

      expect(result.current.role).toBe('MEMBER')
    })

    it('has basic permissions', () => {
      const { result } = renderHook(() => usePermissions())

      expect(result.current.can('agents:read')).toBe(true)
      expect(result.current.can('agents:write')).toBe(true)
      expect(result.current.can('agents:execute')).toBe(true)
      expect(result.current.can('insights:read')).toBe(true)
      expect(result.current.can('data_sources:read')).toBe(true)
    })

    it('does not have admin permissions', () => {
      const { result } = renderHook(() => usePermissions())

      expect(result.current.can('agents:delete')).toBe(false)
      expect(result.current.can('team:manage')).toBe(false)
      expect(result.current.can('billing:manage')).toBe(false)
      expect(result.current.can('settings:manage')).toBe(false)
    })

    it('can only manage VIEWER role', () => {
      const { result } = renderHook(() => usePermissions())

      // MEMBER (level 2) can manage VIEWER (level 1)
      expect(result.current.canManage('VIEWER')).toBe(true)
      // MEMBER cannot manage same or higher roles
      expect(result.current.canManage('MEMBER')).toBe(false)
      expect(result.current.canManage('ADMIN')).toBe(false)
    })

    it('returns correct role flags', () => {
      const { result } = renderHook(() => usePermissions())

      expect(result.current.isOwner).toBe(false)
      expect(result.current.isAdmin).toBe(false)
      expect(result.current.isMember).toBe(true)
    })
  })

  describe('with VIEWER role', () => {
    beforeEach(() => {
      mockRole.mockReturnValue('VIEWER')
    })

    it('returns VIEWER role', () => {
      const { result } = renderHook(() => usePermissions())

      expect(result.current.role).toBe('VIEWER')
    })

    it('has read-only permissions', () => {
      const { result } = renderHook(() => usePermissions())

      expect(result.current.can('agents:read')).toBe(true)
      expect(result.current.can('insights:read')).toBe(true)
    })

    it('does not have write permissions', () => {
      const { result } = renderHook(() => usePermissions())

      expect(result.current.can('agents:write')).toBe(false)
      expect(result.current.can('agents:execute')).toBe(false)
      expect(result.current.can('agents:delete')).toBe(false)
    })

    it('returns correct role flags', () => {
      const { result } = renderHook(() => usePermissions())

      expect(result.current.isOwner).toBe(false)
      expect(result.current.isAdmin).toBe(false)
      expect(result.current.isMember).toBe(false)
    })
  })

  describe('canAny', () => {
    it('returns true if user has at least one permission', () => {
      mockRole.mockReturnValue('MEMBER')

      const { result } = renderHook(() => usePermissions())

      expect(result.current.canAny(['agents:read', 'billing:manage'])).toBe(true)
    })

    it('returns false if user has none of the permissions', () => {
      mockRole.mockReturnValue('VIEWER')

      const { result } = renderHook(() => usePermissions())

      expect(result.current.canAny(['agents:write', 'billing:manage'])).toBe(false)
    })
  })

  describe('canAll', () => {
    it('returns true if user has all permissions', () => {
      mockRole.mockReturnValue('MEMBER')

      const { result } = renderHook(() => usePermissions())

      expect(result.current.canAll(['agents:read', 'agents:write'])).toBe(true)
    })

    it('returns false if user is missing any permission', () => {
      mockRole.mockReturnValue('MEMBER')

      const { result } = renderHook(() => usePermissions())

      expect(result.current.canAll(['agents:read', 'agents:delete'])).toBe(false)
    })
  })
})

describe('convenience hooks', () => {
  describe('useCanCreateAgents', () => {
    it('returns true for MEMBER role', () => {
      mockRole.mockReturnValue('MEMBER')

      const { result } = renderHook(() => useCanCreateAgents())

      expect(result.current).toBe(true)
    })

    it('returns false for VIEWER role', () => {
      mockRole.mockReturnValue('VIEWER')

      const { result } = renderHook(() => useCanCreateAgents())

      expect(result.current).toBe(false)
    })
  })

  describe('useCanDeleteAgents', () => {
    it('returns true for ADMIN role', () => {
      mockRole.mockReturnValue('ADMIN')

      const { result } = renderHook(() => useCanDeleteAgents())

      expect(result.current).toBe(true)
    })

    it('returns false for MEMBER role', () => {
      mockRole.mockReturnValue('MEMBER')

      const { result } = renderHook(() => useCanDeleteAgents())

      expect(result.current).toBe(false)
    })
  })

  describe('useCanExecuteAgents', () => {
    it('returns true for MEMBER role', () => {
      mockRole.mockReturnValue('MEMBER')

      const { result } = renderHook(() => useCanExecuteAgents())

      expect(result.current).toBe(true)
    })

    it('returns false for VIEWER role', () => {
      mockRole.mockReturnValue('VIEWER')

      const { result } = renderHook(() => useCanExecuteAgents())

      expect(result.current).toBe(false)
    })
  })

  describe('useCanManageTeam', () => {
    it('returns true for ADMIN role', () => {
      mockRole.mockReturnValue('ADMIN')

      const { result } = renderHook(() => useCanManageTeam())

      expect(result.current).toBe(true)
    })

    it('returns false for MEMBER role', () => {
      mockRole.mockReturnValue('MEMBER')

      const { result } = renderHook(() => useCanManageTeam())

      expect(result.current).toBe(false)
    })
  })

  describe('useCanManageBilling', () => {
    it('returns true for OWNER role', () => {
      mockRole.mockReturnValue('OWNER')

      const { result } = renderHook(() => useCanManageBilling())

      expect(result.current).toBe(true)
    })

    it('returns false for ADMIN role', () => {
      mockRole.mockReturnValue('ADMIN')

      const { result } = renderHook(() => useCanManageBilling())

      expect(result.current).toBe(false)
    })
  })

  describe('useCanViewAuditLogs', () => {
    it('returns true for ADMIN role', () => {
      mockRole.mockReturnValue('ADMIN')

      const { result } = renderHook(() => useCanViewAuditLogs())

      expect(result.current).toBe(true)
    })

    it('returns false for MEMBER role', () => {
      mockRole.mockReturnValue('MEMBER')

      const { result } = renderHook(() => useCanViewAuditLogs())

      expect(result.current).toBe(false)
    })
  })
})
