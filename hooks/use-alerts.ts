/**
 * @prompt-id forge-v4.1:feature:custom-alerts:005
 * @generated-at 2024-01-25T00:00:00Z
 * @model claude-opus-4-5
 */

"use client"

import { useState, useCallback } from 'react'
import { useCurrentOrg } from './use-organization'

// Types
export type AlertChannel = 'EMAIL' | 'SLACK' | 'WEBHOOK' | 'IN_APP' | 'SMS'
export type AlertStatus = 'TRIGGERED' | 'ACKNOWLEDGED' | 'RESOLVED' | 'IGNORED'
export type AlertOperator = 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'contains' | 'not_contains'
export type AlertEntityType = 'metric' | 'audience' | 'brand' | 'report' | 'agent' | 'workflow'

export interface AlertCondition {
  metric: string
  operator: AlertOperator
  value: string | number | boolean
  unit?: string
}

export interface CustomAlert {
  id: string
  orgId: string
  userId: string
  name: string
  description: string | null
  entityType: string
  entityId: string | null
  condition: AlertCondition
  channels: AlertChannel[]
  recipients: string[]
  webhookUrl: string | null
  isActive: boolean
  cooldownMinutes: number
  lastTriggeredAt: string | null
  triggerCount: number
  metadata: Record<string, unknown>
  createdAt: string
  updatedAt: string
  user?: {
    id: string
    name: string | null
    email: string
  }
  alertHistory?: AlertHistoryEntry[]
  _count?: {
    alertHistory: number
  }
}

export interface AlertHistoryEntry {
  id: string
  alertId: string
  triggeredAt: string
  condition: AlertCondition
  currentValue: unknown
  previousValue: unknown | null
  status: AlertStatus
  notifiedVia: AlertChannel[]
  acknowledgedBy: string | null
  acknowledgedAt: string | null
  resolvedAt: string | null
  notes: string | null
}

export interface CreateAlertInput {
  name: string
  description?: string
  entityType: AlertEntityType
  entityId?: string
  condition: AlertCondition
  channels: AlertChannel[]
  recipients?: string[]
  webhookUrl?: string
  cooldownMinutes?: number
  metadata?: Record<string, unknown>
}

export interface UpdateAlertInput {
  name?: string
  description?: string | null
  entityType?: AlertEntityType
  entityId?: string | null
  condition?: AlertCondition
  channels?: AlertChannel[]
  recipients?: string[]
  webhookUrl?: string | null
  isActive?: boolean
  cooldownMinutes?: number
  metadata?: Record<string, unknown>
}

export interface AcknowledgeAlertInput {
  historyId: string
  notes?: string
  status?: 'ACKNOWLEDGED' | 'RESOLVED' | 'IGNORED'
}

interface UseAlertsOptions {
  page?: number
  limit?: number
  entityType?: string
  isActive?: boolean
}

interface PaginatedResponse<T> {
  data: T[]
  meta: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

/**
 * Hook for managing custom alerts.
 *
 * @example
 * ```tsx
 * function AlertsPage() {
 *   const { alerts, createAlert, fetchAlerts, isLoading } = useAlerts()
 *
 *   useEffect(() => {
 *     fetchAlerts()
 *   }, [fetchAlerts])
 *
 *   const handleCreate = async () => {
 *     await createAlert({
 *       name: 'Low Sentiment Alert',
 *       entityType: 'metric',
 *       condition: { metric: 'sentiment', operator: 'lt', value: 60 },
 *       channels: ['EMAIL', 'IN_APP'],
 *     })
 *   }
 * }
 * ```
 */
export function useAlerts(options: UseAlertsOptions = {}) {
  const { org } = useCurrentOrg()
  const [alerts, setAlerts] = useState<CustomAlert[]>([])
  const [meta, setMeta] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchAlerts = useCallback(async () => {
    if (!org) return

    setIsLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams()
      if (options.page) params.set('page', options.page.toString())
      if (options.limit) params.set('limit', options.limit.toString())
      if (options.entityType) params.set('entityType', options.entityType)
      if (options.isActive !== undefined) params.set('isActive', options.isActive.toString())

      const response = await fetch(`/api/v1/alerts?${params}`, {
        headers: { 'x-organization-id': org.id },
      })

      if (!response.ok) throw new Error('Failed to fetch alerts')

      const data: PaginatedResponse<CustomAlert> = await response.json()
      setAlerts(data.data)
      setMeta(data.meta)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setIsLoading(false)
    }
  }, [org, options.page, options.limit, options.entityType, options.isActive])

  const createAlert = useCallback(async (input: CreateAlertInput): Promise<CustomAlert> => {
    if (!org) throw new Error('No organization selected')

    const response = await fetch('/api/v1/alerts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-organization-id': org.id,
      },
      body: JSON.stringify(input),
    })

    if (!response.ok) {
      const data = await response.json()
      throw new Error(data.error || 'Failed to create alert')
    }

    const { data } = await response.json()
    setAlerts(prev => [data, ...prev])
    return data as CustomAlert
  }, [org])

  const updateAlert = useCallback(async (id: string, input: UpdateAlertInput): Promise<CustomAlert> => {
    if (!org) throw new Error('No organization selected')

    const response = await fetch(`/api/v1/alerts/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'x-organization-id': org.id,
      },
      body: JSON.stringify(input),
    })

    if (!response.ok) {
      const data = await response.json()
      throw new Error(data.error || 'Failed to update alert')
    }

    const { data } = await response.json()
    setAlerts(prev => prev.map(a => a.id === id ? data : a))
    return data as CustomAlert
  }, [org])

  const deleteAlert = useCallback(async (id: string) => {
    if (!org) throw new Error('No organization selected')

    const response = await fetch(`/api/v1/alerts/${id}`, {
      method: 'DELETE',
      headers: { 'x-organization-id': org.id },
    })

    if (!response.ok) {
      const data = await response.json()
      throw new Error(data.error || 'Failed to delete alert')
    }

    setAlerts(prev => prev.filter(a => a.id !== id))
  }, [org])

  const toggleAlert = useCallback(async (id: string, isActive: boolean): Promise<CustomAlert> => {
    return updateAlert(id, { isActive })
  }, [updateAlert])

  return {
    alerts,
    meta,
    isLoading,
    error,
    fetchAlerts,
    createAlert,
    updateAlert,
    deleteAlert,
    toggleAlert,
  }
}

/**
 * Hook for managing a single alert with its history.
 */
export function useAlert(id: string) {
  const { org } = useCurrentOrg()
  const [alert, setAlert] = useState<CustomAlert | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchAlert = useCallback(async () => {
    if (!org || !id) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/v1/alerts/${id}`, {
        headers: { 'x-organization-id': org.id },
      })

      if (!response.ok) throw new Error('Failed to fetch alert')

      const { data } = await response.json()
      setAlert(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setIsLoading(false)
    }
  }, [org, id])

  return {
    alert,
    isLoading,
    error,
    fetchAlert,
  }
}

/**
 * Hook for managing alert history.
 */
export function useAlertHistory(alertId: string) {
  const { org } = useCurrentOrg()
  const [history, setHistory] = useState<AlertHistoryEntry[]>([])
  const [meta, setMeta] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchHistory = useCallback(async (page = 1, limit = 20, status?: AlertStatus) => {
    if (!org || !alertId) return

    setIsLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams()
      params.set('page', page.toString())
      params.set('limit', limit.toString())
      if (status) params.set('status', status)

      const response = await fetch(`/api/v1/alerts/${alertId}/history?${params}`, {
        headers: { 'x-organization-id': org.id },
      })

      if (!response.ok) throw new Error('Failed to fetch alert history')

      const data = await response.json()
      setHistory(data.data)
      setMeta(data.meta)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setIsLoading(false)
    }
  }, [org, alertId])

  const acknowledgeAlert = useCallback(async (input: AcknowledgeAlertInput): Promise<AlertHistoryEntry> => {
    if (!org) throw new Error('No organization selected')

    const response = await fetch(`/api/v1/alerts/${alertId}/acknowledge`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-organization-id': org.id,
      },
      body: JSON.stringify(input),
    })

    if (!response.ok) {
      const data = await response.json()
      throw new Error(data.error || 'Failed to acknowledge alert')
    }

    const { data } = await response.json()
    setHistory(prev => prev.map(h => h.id === input.historyId ? data : h))
    return data as AlertHistoryEntry
  }, [org, alertId])

  return {
    history,
    meta,
    isLoading,
    error,
    fetchHistory,
    acknowledgeAlert,
  }
}
