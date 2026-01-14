import useSWR from 'swr'
import type { Organization, Plan } from '@prisma/client'

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export interface OrganizationWithPlan extends Organization {
  plan: Plan | null
}

/**
 * Hook to get current organization details
 */
export function useOrganization() {
  const { data, error, isLoading, mutate } = useSWR<OrganizationWithPlan>(
    '/api/v1/organization',
    fetcher
  )

  return {
    organization: data,
    isLoading,
    error,
    refresh: mutate,
  }
}

/**
 * Hook to get current user's role in the organization
 */
export function useOrganizationMember() {
  const { data, error, isLoading, mutate } = useSWR<any>(
    '/api/v1/organization/members/me',
    fetcher
  )

  return {
    member: data,
    role: data?.role,
    isOwner: data?.role === 'OWNER',
    isAdmin: data?.role === 'ADMIN' || data?.role === 'OWNER',
    isMember: data?.role === 'MEMBER' || data?.role === 'ADMIN' || data?.role === 'OWNER',
    isViewer: data?.role === 'VIEWER',
    isLoading,
    error,
    refresh: mutate,
  }
}

/**
 * Hook to check if user has specific permission
 */
export function usePermission(permission: string) {
  const { member, isLoading } = useOrganizationMember()

  // Import hasPermission dynamically to avoid circular dependencies
  const checkPermission = () => {
    if (!member?.role) return false

    // Owner has all permissions
    if (member.role === 'OWNER') return true

    // Import permission checker
    try {
      const { hasPermission: checkPerm } = require('@/lib/permissions')
      return checkPerm(member.role, permission)
    } catch (e) {
      console.error('Error checking permission:', e)
      return false
    }
  }

  return {
    hasPermission: !isLoading && checkPermission(),
    isLoading,
  }
}

/**
 * Hook to get organization plan details
 */
export function useOrganizationPlan() {
  const { data, error, isLoading, mutate } = useSWR<any>(
    '/api/v1/organization/plan',
    fetcher
  )

  return {
    plan: data?.plan,
    tier: data?.plan?.tier,
    limits: data?.plan?.limits,
    features: data?.features ?? [],
    isLoading,
    error,
    refresh: mutate,
  }
}

/**
 * Hook to get organization usage metrics
 */
export function useOrganizationUsage() {
  const { data, error, isLoading, mutate } = useSWR<any>(
    '/api/v1/organization/usage',
    fetcher
  )

  return {
    usage: data ?? {},
    isLoading,
    error,
    refresh: mutate,
  }
}
