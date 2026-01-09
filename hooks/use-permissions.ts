"use client"

import { useMemo } from 'react'
import { useOrgRole } from './use-organization'
import {
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  getRolePermissions,
  canManageRole,
  type Permission,
} from '@/lib/permissions'

export function usePermissions() {
  const role = useOrgRole()

  const permissions = useMemo(() => {
    if (!role) return []
    return getRolePermissions(role)
  }, [role])

  const can = useMemo(() => {
    return (permission: Permission) => {
      if (!role) return false
      return hasPermission(role, permission)
    }
  }, [role])

  const canAny = useMemo(() => {
    return (requiredPermissions: Permission[]) => {
      if (!role) return false
      return hasAnyPermission(role, requiredPermissions)
    }
  }, [role])

  const canAll = useMemo(() => {
    return (requiredPermissions: Permission[]) => {
      if (!role) return false
      return hasAllPermissions(role, requiredPermissions)
    }
  }, [role])

  const canManage = useMemo(() => {
    return (targetRole: string) => {
      if (!role) return false
      return canManageRole(role, targetRole)
    }
  }, [role])

  return {
    role,
    permissions,
    can,
    canAny,
    canAll,
    canManage,
    isOwner: role === 'OWNER',
    isAdmin: role === 'ADMIN' || role === 'OWNER',
    isMember: role === 'MEMBER' || role === 'ADMIN' || role === 'OWNER',
  }
}

// Convenience hooks for common permission checks
export function useCanCreateAgents() {
  const { can } = usePermissions()
  return can('agents:write')
}

export function useCanDeleteAgents() {
  const { can } = usePermissions()
  return can('agents:delete')
}

export function useCanExecuteAgents() {
  const { can } = usePermissions()
  return can('agents:execute')
}

export function useCanManageTeam() {
  const { canAny } = usePermissions()
  return canAny(['team:invite', 'team:manage'])
}

export function useCanManageBilling() {
  const { can } = usePermissions()
  return can('billing:manage')
}

export function useCanViewAuditLogs() {
  const { can } = usePermissions()
  return can('audit:read')
}
