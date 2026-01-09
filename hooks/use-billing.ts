"use client"

import { useState, useCallback } from 'react'
import { useCurrentOrg } from './use-organization'

/**
 * Subscription details
 */
export interface Subscription {
  id: string
  planId: string
  planTier: 'STARTER' | 'PROFESSIONAL' | 'ENTERPRISE'
  status: 'TRIALING' | 'ACTIVE' | 'PAST_DUE' | 'CANCELED' | 'UNPAID'
  currentPeriodStart: string
  currentPeriodEnd: string
  cancelAtPeriodEnd: boolean
  trialEnd?: string
}

/**
 * Usage metrics
 */
export interface UsageMetrics {
  agentRuns: { used: number; limit: number }
  tokensConsumed: { used: number; limit: number }
  apiCalls: { used: number; limit: number }
  dataSources: { used: number; limit: number }
  teamSeats: { used: number; limit: number }
}

/**
 * Invoice details
 */
export interface Invoice {
  id: string
  amount: number
  currency: string
  status: 'draft' | 'open' | 'paid' | 'void' | 'uncollectible'
  invoiceDate: string
  dueDate?: string
  pdfUrl?: string
}

/**
 * Hook for managing subscription and billing.
 *
 * @example
 * ```tsx
 * function BillingPage() {
 *   const { subscription, usage, fetchSubscription, fetchUsage } = useBilling()
 *
 *   useEffect(() => {
 *     fetchSubscription()
 *     fetchUsage()
 *   }, [fetchSubscription, fetchUsage])
 *
 *   return (
 *     <div>
 *       <p>Plan: {subscription?.planTier}</p>
 *       <p>Agent Runs: {usage?.agentRuns.used} / {usage?.agentRuns.limit}</p>
 *     </div>
 *   )
 * }
 * ```
 */
export function useBilling() {
  const { org } = useCurrentOrg()
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [usage, setUsage] = useState<UsageMetrics | null>(null)
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchSubscription = useCallback(async () => {
    if (!org) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/v1/billing/subscription', {
        headers: { 'x-organization-id': org.id },
      })

      if (!response.ok) throw new Error('Failed to fetch subscription')

      const data = await response.json()
      setSubscription(data.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setIsLoading(false)
    }
  }, [org])

  const fetchUsage = useCallback(async () => {
    if (!org) return

    try {
      const response = await fetch('/api/v1/billing/usage', {
        headers: { 'x-organization-id': org.id },
      })

      if (!response.ok) throw new Error('Failed to fetch usage')

      const data = await response.json()
      setUsage(data.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    }
  }, [org])

  const fetchInvoices = useCallback(async () => {
    if (!org) return

    try {
      const response = await fetch('/api/v1/billing/invoices', {
        headers: { 'x-organization-id': org.id },
      })

      if (!response.ok) throw new Error('Failed to fetch invoices')

      const data = await response.json()
      setInvoices(data.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    }
  }, [org])

  const createCheckoutSession = useCallback(async (priceId: string): Promise<string> => {
    if (!org) throw new Error('No organization selected')

    const response = await fetch('/api/v1/billing/checkout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-organization-id': org.id,
      },
      body: JSON.stringify({
        priceId,
        successUrl: `${window.location.origin}/dashboard/settings/billing?success=true`,
        cancelUrl: `${window.location.origin}/dashboard/settings/billing?canceled=true`,
      }),
    })

    if (!response.ok) {
      const data = await response.json()
      throw new Error(data.error || 'Failed to create checkout session')
    }

    const { url } = await response.json()
    return url
  }, [org])

  const createPortalSession = useCallback(async (): Promise<string> => {
    if (!org) throw new Error('No organization selected')

    const response = await fetch('/api/v1/billing/portal', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-organization-id': org.id,
      },
      body: JSON.stringify({
        returnUrl: `${window.location.origin}/dashboard/settings/billing`,
      }),
    })

    if (!response.ok) {
      const data = await response.json()
      throw new Error(data.error || 'Failed to create portal session')
    }

    const { url } = await response.json()
    return url
  }, [org])

  return {
    subscription,
    usage,
    invoices,
    isLoading,
    error,
    fetchSubscription,
    fetchUsage,
    fetchInvoices,
    createCheckoutSession,
    createPortalSession,
  }
}

/**
 * Convenience hook for just subscription data
 */
export function useSubscription() {
  const { subscription, isLoading, error, fetchSubscription } = useBilling()
  return { subscription, isLoading, error, fetchSubscription }
}

/**
 * Convenience hook for just usage data
 */
export function useUsage() {
  const { usage, isLoading, error, fetchUsage } = useBilling()
  return { usage, isLoading, error, fetchUsage }
}
