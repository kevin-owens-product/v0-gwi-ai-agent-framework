import { describe, it, expect } from 'vitest'
import {
  PERMISSIONS,
  ROLE_PERMISSIONS,
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  getRolePermissions,
  canManageRole,
} from './permissions'

describe('PERMISSIONS constant', () => {
  it('contains all expected permission keys', () => {
    expect(PERMISSIONS).toHaveProperty('agents:read')
    expect(PERMISSIONS).toHaveProperty('agents:write')
    expect(PERMISSIONS).toHaveProperty('agents:delete')
    expect(PERMISSIONS).toHaveProperty('agents:execute')
    expect(PERMISSIONS).toHaveProperty('insights:read')
    expect(PERMISSIONS).toHaveProperty('insights:export')
    expect(PERMISSIONS).toHaveProperty('data_sources:read')
    expect(PERMISSIONS).toHaveProperty('data_sources:write')
    expect(PERMISSIONS).toHaveProperty('data_sources:delete')
    expect(PERMISSIONS).toHaveProperty('team:read')
    expect(PERMISSIONS).toHaveProperty('team:invite')
    expect(PERMISSIONS).toHaveProperty('team:manage')
    expect(PERMISSIONS).toHaveProperty('billing:read')
    expect(PERMISSIONS).toHaveProperty('billing:manage')
    expect(PERMISSIONS).toHaveProperty('settings:read')
    expect(PERMISSIONS).toHaveProperty('settings:manage')
    expect(PERMISSIONS).toHaveProperty('audit:read')
    expect(PERMISSIONS).toHaveProperty('admin:*')
  })

  it('has descriptions for all permissions', () => {
    Object.values(PERMISSIONS).forEach((description) => {
      expect(typeof description).toBe('string')
      expect(description.length).toBeGreaterThan(0)
    })
  })
})

describe('ROLE_PERMISSIONS constant', () => {
  it('defines permissions for all roles', () => {
    expect(ROLE_PERMISSIONS).toHaveProperty('OWNER')
    expect(ROLE_PERMISSIONS).toHaveProperty('ADMIN')
    expect(ROLE_PERMISSIONS).toHaveProperty('MEMBER')
    expect(ROLE_PERMISSIONS).toHaveProperty('VIEWER')
  })

  it('OWNER has admin:* permission', () => {
    expect(ROLE_PERMISSIONS.OWNER).toContain('admin:*')
  })

  it('ADMIN has extensive permissions but not admin:*', () => {
    expect(ROLE_PERMISSIONS.ADMIN).not.toContain('admin:*')
    expect(ROLE_PERMISSIONS.ADMIN).toContain('agents:read')
    expect(ROLE_PERMISSIONS.ADMIN).toContain('agents:write')
    expect(ROLE_PERMISSIONS.ADMIN).toContain('agents:delete')
    expect(ROLE_PERMISSIONS.ADMIN).toContain('team:manage')
    expect(ROLE_PERMISSIONS.ADMIN).toContain('audit:read')
  })

  it('MEMBER has limited permissions', () => {
    expect(ROLE_PERMISSIONS.MEMBER).toContain('agents:read')
    expect(ROLE_PERMISSIONS.MEMBER).toContain('agents:write')
    expect(ROLE_PERMISSIONS.MEMBER).toContain('agents:execute')
    expect(ROLE_PERMISSIONS.MEMBER).not.toContain('agents:delete')
    expect(ROLE_PERMISSIONS.MEMBER).not.toContain('team:manage')
  })

  it('VIEWER has read-only permissions', () => {
    expect(ROLE_PERMISSIONS.VIEWER).toContain('agents:read')
    expect(ROLE_PERMISSIONS.VIEWER).toContain('insights:read')
    expect(ROLE_PERMISSIONS.VIEWER).not.toContain('agents:write')
    expect(ROLE_PERMISSIONS.VIEWER).not.toContain('agents:execute')
  })
})

describe('hasPermission', () => {
  it('returns true for OWNER with any permission', () => {
    expect(hasPermission('OWNER', 'agents:read')).toBe(true)
    expect(hasPermission('OWNER', 'agents:write')).toBe(true)
    expect(hasPermission('OWNER', 'agents:delete')).toBe(true)
    expect(hasPermission('OWNER', 'billing:manage')).toBe(true)
    expect(hasPermission('OWNER', 'admin:*')).toBe(true)
  })

  it('returns true for ADMIN with allowed permissions', () => {
    expect(hasPermission('ADMIN', 'agents:read')).toBe(true)
    expect(hasPermission('ADMIN', 'agents:write')).toBe(true)
    expect(hasPermission('ADMIN', 'agents:delete')).toBe(true)
    expect(hasPermission('ADMIN', 'team:manage')).toBe(true)
    expect(hasPermission('ADMIN', 'audit:read')).toBe(true)
  })

  it('returns false for ADMIN with billing:manage', () => {
    expect(hasPermission('ADMIN', 'billing:manage')).toBe(false)
    expect(hasPermission('ADMIN', 'billing:read')).toBe(false)
  })

  it('returns true for MEMBER with basic permissions', () => {
    expect(hasPermission('MEMBER', 'agents:read')).toBe(true)
    expect(hasPermission('MEMBER', 'agents:write')).toBe(true)
    expect(hasPermission('MEMBER', 'agents:execute')).toBe(true)
    expect(hasPermission('MEMBER', 'insights:read')).toBe(true)
  })

  it('returns false for MEMBER with admin permissions', () => {
    expect(hasPermission('MEMBER', 'agents:delete')).toBe(false)
    expect(hasPermission('MEMBER', 'team:manage')).toBe(false)
    expect(hasPermission('MEMBER', 'settings:manage')).toBe(false)
    expect(hasPermission('MEMBER', 'billing:manage')).toBe(false)
  })

  it('returns limited permissions for VIEWER', () => {
    expect(hasPermission('VIEWER', 'agents:read')).toBe(true)
    expect(hasPermission('VIEWER', 'insights:read')).toBe(true)
    expect(hasPermission('VIEWER', 'agents:write')).toBe(false)
    expect(hasPermission('VIEWER', 'agents:execute')).toBe(false)
  })

  it('returns false for unknown role', () => {
    expect(hasPermission('UNKNOWN', 'agents:read')).toBe(false)
    expect(hasPermission('', 'agents:read')).toBe(false)
  })
})

describe('hasAnyPermission', () => {
  it('returns true if user has any of the permissions', () => {
    expect(hasAnyPermission('MEMBER', ['agents:read', 'billing:manage'])).toBe(true)
    expect(hasAnyPermission('ADMIN', ['billing:manage', 'team:manage'])).toBe(true)
  })

  it('returns false if user has none of the permissions', () => {
    expect(hasAnyPermission('VIEWER', ['agents:write', 'billing:manage'])).toBe(false)
    expect(hasAnyPermission('MEMBER', ['billing:manage', 'admin:*'])).toBe(false)
  })

  it('returns true for OWNER with any permission list', () => {
    expect(hasAnyPermission('OWNER', ['billing:manage', 'admin:*'])).toBe(true)
    expect(hasAnyPermission('OWNER', ['agents:read'])).toBe(true)
  })

  it('handles empty permission array', () => {
    expect(hasAnyPermission('OWNER', [])).toBe(false)
    expect(hasAnyPermission('MEMBER', [])).toBe(false)
  })
})

describe('hasAllPermissions', () => {
  it('returns true if user has all permissions', () => {
    expect(hasAllPermissions('ADMIN', ['agents:read', 'agents:write', 'agents:delete'])).toBe(true)
    expect(hasAllPermissions('MEMBER', ['agents:read', 'agents:write'])).toBe(true)
  })

  it('returns false if user is missing any permission', () => {
    expect(hasAllPermissions('MEMBER', ['agents:read', 'agents:delete'])).toBe(false)
    expect(hasAllPermissions('ADMIN', ['agents:read', 'billing:manage'])).toBe(false)
  })

  it('returns true for OWNER with any permission list', () => {
    expect(hasAllPermissions('OWNER', ['agents:read', 'billing:manage', 'admin:*'])).toBe(true)
  })

  it('handles empty permission array', () => {
    expect(hasAllPermissions('OWNER', [])).toBe(true)
    expect(hasAllPermissions('MEMBER', [])).toBe(true)
  })
})

describe('getRolePermissions', () => {
  it('returns all permissions for OWNER', () => {
    const permissions = getRolePermissions('OWNER')
    expect(permissions).toContain('agents:read')
    expect(permissions).toContain('agents:write')
    expect(permissions).toContain('billing:manage')
    expect(permissions).toContain('admin:*')
  })

  it('returns specific permissions for ADMIN', () => {
    const permissions = getRolePermissions('ADMIN')
    expect(permissions).toEqual(ROLE_PERMISSIONS.ADMIN)
  })

  it('returns specific permissions for MEMBER', () => {
    const permissions = getRolePermissions('MEMBER')
    expect(permissions).toEqual(ROLE_PERMISSIONS.MEMBER)
  })

  it('returns specific permissions for VIEWER', () => {
    const permissions = getRolePermissions('VIEWER')
    expect(permissions).toEqual(ROLE_PERMISSIONS.VIEWER)
  })

  it('returns empty array for unknown role', () => {
    const permissions = getRolePermissions('UNKNOWN')
    expect(permissions).toEqual([])
  })
})

describe('canManageRole', () => {
  it('OWNER can manage all other roles', () => {
    expect(canManageRole('OWNER', 'ADMIN')).toBe(true)
    expect(canManageRole('OWNER', 'MEMBER')).toBe(true)
    expect(canManageRole('OWNER', 'VIEWER')).toBe(true)
  })

  it('OWNER cannot manage OWNER', () => {
    expect(canManageRole('OWNER', 'OWNER')).toBe(false)
  })

  it('ADMIN can manage MEMBER and VIEWER', () => {
    expect(canManageRole('ADMIN', 'MEMBER')).toBe(true)
    expect(canManageRole('ADMIN', 'VIEWER')).toBe(true)
  })

  it('ADMIN cannot manage ADMIN or OWNER', () => {
    expect(canManageRole('ADMIN', 'ADMIN')).toBe(false)
    expect(canManageRole('ADMIN', 'OWNER')).toBe(false)
  })

  it('MEMBER can manage VIEWER', () => {
    expect(canManageRole('MEMBER', 'VIEWER')).toBe(true)
  })

  it('MEMBER cannot manage MEMBER, ADMIN, or OWNER', () => {
    expect(canManageRole('MEMBER', 'MEMBER')).toBe(false)
    expect(canManageRole('MEMBER', 'ADMIN')).toBe(false)
    expect(canManageRole('MEMBER', 'OWNER')).toBe(false)
  })

  it('VIEWER cannot manage any role', () => {
    expect(canManageRole('VIEWER', 'VIEWER')).toBe(false)
    expect(canManageRole('VIEWER', 'MEMBER')).toBe(false)
    expect(canManageRole('VIEWER', 'ADMIN')).toBe(false)
    expect(canManageRole('VIEWER', 'OWNER')).toBe(false)
  })

  it('unknown roles have level 0', () => {
    expect(canManageRole('UNKNOWN', 'VIEWER')).toBe(false)
    expect(canManageRole('OWNER', 'UNKNOWN')).toBe(true)
  })
})
