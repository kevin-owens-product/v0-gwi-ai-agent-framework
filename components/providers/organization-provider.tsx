"use client"

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import type { Role, PlanTier } from '@/types'

interface OrganizationData {
  id: string
  name: string
  slug: string
  planTier: PlanTier
  settings?: Record<string, unknown>
  subscription?: {
    id: string
    status: string
    planId: string
    currentPeriodEnd?: string
  } | null
}

interface MembershipData {
  id: string
  role: Role
  joinedAt: string
}

interface UserData {
  id: string
  name: string
  email: string
  image?: string
}

interface OrganizationListItem {
  id: string
  name: string
  slug: string
  planTier: PlanTier
}

interface OrganizationContextValue {
  organization: OrganizationData
  membership: MembershipData
  organizations: OrganizationListItem[]
  user: UserData
  setCurrentOrganization: (orgId: string) => void
}

const OrganizationContext = createContext<OrganizationContextValue | undefined>(undefined)

interface OrganizationProviderProps {
  children: ReactNode
  organization: OrganizationData
  membership: MembershipData
  organizations: OrganizationListItem[]
  user: UserData
}

export function OrganizationProvider({
  children,
  organization: initialOrganization,
  membership: initialMembership,
  organizations,
  user,
}: OrganizationProviderProps) {
  const [_currentOrgId, setCurrentOrgId] = useState(initialOrganization.id)

  const setCurrentOrganization = useCallback(async (orgId: string) => {
    // Set cookie for server-side persistence
    document.cookie = `currentOrgId=${orgId}; path=/; max-age=${60 * 60 * 24 * 365}`
    setCurrentOrgId(orgId)
    // Refresh to get new org data
    window.location.reload()
  }, [])

  const value: OrganizationContextValue = {
    organization: initialOrganization,
    membership: initialMembership,
    organizations,
    user,
    setCurrentOrganization,
  }

  return (
    <OrganizationContext.Provider value={value}>
      {children}
    </OrganizationContext.Provider>
  )
}

export function useOrganizationContext() {
  const context = useContext(OrganizationContext)
  if (context === undefined) {
    throw new Error('useOrganizationContext must be used within an OrganizationProvider')
  }
  return context
}

// Convenience hooks
export function useCurrentOrganization() {
  const { organization } = useOrganizationContext()
  return organization
}

export function useCurrentUser() {
  const { user } = useOrganizationContext()
  return user
}

export function useCurrentMembership() {
  const { membership } = useOrganizationContext()
  return membership
}

export function useUserRole(): Role {
  const { membership } = useOrganizationContext()
  return membership.role
}

export function useOrgPlanTier(): PlanTier {
  const { organization } = useOrganizationContext()
  return organization.planTier
}

export function useOrganizationsList() {
  const { organizations, setCurrentOrganization } = useOrganizationContext()
  return { organizations, setCurrentOrganization }
}
