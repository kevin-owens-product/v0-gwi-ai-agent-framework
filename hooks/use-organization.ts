"use client"

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import { useSession } from 'next-auth/react'
import type { OrganizationContext, Role, PlanTier } from '@/types'

interface OrganizationState {
  currentOrg: OrganizationContext | null
  organizations: OrganizationContext[]
  isLoading: boolean
  error: string | null
}

interface OrganizationContextValue extends OrganizationState {
  setCurrentOrg: (org: OrganizationContext) => void
  refreshOrganizations: () => Promise<void>
}

const OrganizationCtx = createContext<OrganizationContextValue | undefined>(undefined)

export function OrganizationProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession()
  const [state, setState] = useState<OrganizationState>({
    currentOrg: null,
    organizations: [],
    isLoading: true,
    error: null,
  })

  const fetchOrganizations = useCallback(async () => {
    if (!session?.user?.id) return

    try {
      const response = await fetch('/api/user/organizations')
      if (!response.ok) throw new Error('Failed to fetch organizations')

      const data = await response.json()

      setState(prev => ({
        ...prev,
        organizations: data.organizations,
        currentOrg: data.organizations[0] || null,
        isLoading: false,
        error: null,
      }))
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }))
    }
  }, [session?.user?.id])

  useEffect(() => {
    if (status === 'authenticated') {
      fetchOrganizations()
    } else if (status === 'unauthenticated') {
      setState({
        currentOrg: null,
        organizations: [],
        isLoading: false,
        error: null,
      })
    }
  }, [status, fetchOrganizations])

  const setCurrentOrg = useCallback((org: OrganizationContext) => {
    setState(prev => ({ ...prev, currentOrg: org }))
    // Optionally persist selection to localStorage
    localStorage.setItem('currentOrgId', org.id)
  }, [])

  const value: OrganizationContextValue = {
    ...state,
    setCurrentOrg,
    refreshOrganizations: fetchOrganizations,
  }

  return (
    <OrganizationCtx.Provider value={value}>
      {children}
    </OrganizationCtx.Provider>
  )
}

export function useOrganization() {
  const context = useContext(OrganizationCtx)
  if (context === undefined) {
    throw new Error('useOrganization must be used within an OrganizationProvider')
  }
  return context
}

// Convenience hooks
export function useCurrentOrg() {
  const { currentOrg, isLoading } = useOrganization()
  return { org: currentOrg, isLoading }
}

export function useOrgRole(): Role | null {
  const { currentOrg } = useOrganization()
  return currentOrg?.role || null
}

export function useOrgPlan(): PlanTier | null {
  const { currentOrg } = useOrganization()
  return currentOrg?.planTier || null
}
