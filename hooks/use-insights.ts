"use client"

import { useState, useCallback } from 'react'
import { useCurrentOrg } from './use-organization'

/**
 * Insight types
 */
export type InsightType = 'trend' | 'anomaly' | 'recommendation' | 'comparison'

/**
 * Insight details
 */
export interface Insight {
  id: string
  agentId?: string
  type: InsightType
  title: string
  data: Record<string, unknown>
  confidenceScore: number
  createdAt: string
  agent?: {
    id: string
    name: string
    type: string
  }
}

interface InsightFilters {
  agentId?: string
  type?: InsightType
  startDate?: Date
  endDate?: Date
  minConfidence?: number
}

interface PaginationMeta {
  page: number
  limit: number
  total: number
  totalPages: number
}

/**
 * Hook for viewing and managing insights.
 *
 * @example
 * ```tsx
 * function InsightsPage() {
 *   const { insights, meta, fetchInsights, isLoading } = useInsights()
 *
 *   useEffect(() => {
 *     fetchInsights({ type: 'trend' })
 *   }, [fetchInsights])
 *
 *   return insights.map(insight => <InsightCard key={insight.id} insight={insight} />)
 * }
 * ```
 */
export function useInsights(initialFilters?: InsightFilters) {
  const { org } = useCurrentOrg()
  const [insights, setInsights] = useState<Insight[]>([])
  const [meta, setMeta] = useState<PaginationMeta>({ page: 1, limit: 20, total: 0, totalPages: 0 })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<InsightFilters>(initialFilters || {})

  const fetchInsights = useCallback(async (newFilters?: InsightFilters, page: number = 1) => {
    if (!org) return

    const currentFilters = newFilters ?? filters
    if (newFilters) setFilters(newFilters)

    setIsLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams()
      params.set('page', page.toString())
      if (currentFilters.agentId) params.set('agentId', currentFilters.agentId)
      if (currentFilters.type) params.set('type', currentFilters.type)
      if (currentFilters.startDate) params.set('startDate', currentFilters.startDate.toISOString())
      if (currentFilters.endDate) params.set('endDate', currentFilters.endDate.toISOString())
      if (currentFilters.minConfidence) params.set('minConfidence', currentFilters.minConfidence.toString())

      const response = await fetch(`/api/v1/insights?${params}`, {
        headers: { 'x-organization-id': org.id },
      })

      if (!response.ok) throw new Error('Failed to fetch insights')

      const data = await response.json()
      setInsights(data.data)
      setMeta(data.meta)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setIsLoading(false)
    }
  }, [org, filters])

  const exportInsights = useCallback(async (format: 'csv' | 'json' | 'pdf' = 'csv') => {
    if (!org) throw new Error('No organization selected')

    const params = new URLSearchParams()
    params.set('format', format)
    if (filters.agentId) params.set('agentId', filters.agentId)
    if (filters.type) params.set('type', filters.type)
    if (filters.startDate) params.set('startDate', filters.startDate.toISOString())
    if (filters.endDate) params.set('endDate', filters.endDate.toISOString())

    const response = await fetch(`/api/v1/insights/export?${params}`, {
      headers: { 'x-organization-id': org.id },
    })

    if (!response.ok) {
      throw new Error('Failed to export insights')
    }

    const blob = await response.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `insights-${new Date().toISOString().split('T')[0]}.${format}`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, [org, filters])

  return {
    insights,
    meta,
    filters,
    isLoading,
    error,
    fetchInsights,
    exportInsights,
    setFilters,
  }
}

/**
 * Hook for a single insight
 */
export function useInsight(id: string) {
  const { org } = useCurrentOrg()
  const [insight, setInsight] = useState<Insight | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchInsight = useCallback(async () => {
    if (!org || !id) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/v1/insights/${id}`, {
        headers: { 'x-organization-id': org.id },
      })

      if (!response.ok) throw new Error('Failed to fetch insight')

      const { data } = await response.json()
      setInsight(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setIsLoading(false)
    }
  }, [org, id])

  return {
    insight,
    isLoading,
    error,
    fetchInsight,
  }
}
