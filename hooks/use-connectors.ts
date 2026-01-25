/**
 * @prompt-id forge-v4.1:feature:data-connectors:001
 * @generated-at 2026-01-25T00:00:00Z
 * @model claude-opus-4-5
 */

"use client"

import { useState, useCallback } from 'react'
import { useCurrentOrg } from './use-organization'
import type { DataConnectorType, DataSyncStatus } from '@prisma/client'

/**
 * Connector with provider metadata (credentials excluded)
 */
export interface Connector {
  id: string
  orgId: string
  name: string
  description: string | null
  type: DataConnectorType
  provider: string
  config: Record<string, unknown>
  syncSchedule: string | null
  lastSyncAt: Date | null
  lastSyncStatus: DataSyncStatus | null
  isActive: boolean
  errorCount: number
  metadata: Record<string, unknown>
  createdAt: Date
  updatedAt: Date
  _count: {
    syncLogs: number
  }
  providerMeta: {
    name: string
    description?: string
    icon: string
    authType: string
    type?: string
  } | null
}

/**
 * Sync log entry
 */
export interface SyncLog {
  id: string
  connectorId: string
  status: DataSyncStatus
  recordsProcessed: number
  recordsFailed: number
  bytesTransferred: number
  startedAt: Date
  completedAt: Date | null
  error: string | null
  metadata: Record<string, unknown>
}

/**
 * Connector with sync history
 */
export interface ConnectorWithHistory extends Connector {
  syncLogs: SyncLog[]
}

/**
 * Input for creating a connector
 */
export interface CreateConnectorInput {
  name: string
  description?: string
  type: DataConnectorType
  provider: string
  credentials?: Record<string, unknown>
  config?: Record<string, unknown>
  syncSchedule?: string | null
}

/**
 * Input for updating a connector
 */
export interface UpdateConnectorInput {
  name?: string
  description?: string
  credentials?: Record<string, unknown>
  config?: Record<string, unknown>
  syncSchedule?: string | null
  isActive?: boolean
}

/**
 * Pagination metadata
 */
interface PaginationMeta {
  page: number
  limit: number
  total: number
  totalPages: number
}

/**
 * Options for listing connectors
 */
interface UseConnectorsOptions {
  page?: number
  limit?: number
  type?: DataConnectorType
  provider?: string
  isActive?: boolean
  search?: string
}

/**
 * Hook for managing data connectors
 */
export function useConnectors(options: UseConnectorsOptions = {}) {
  const { org } = useCurrentOrg()
  const [connectors, setConnectors] = useState<Connector[]>([])
  const [meta, setMeta] = useState<PaginationMeta>({ page: 1, limit: 20, total: 0, totalPages: 0 })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /**
   * Fetch connectors list
   */
  const fetchConnectors = useCallback(async () => {
    if (!org) return

    setIsLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams()
      if (options.page) params.set('page', options.page.toString())
      if (options.limit) params.set('limit', options.limit.toString())
      if (options.type) params.set('type', options.type)
      if (options.provider) params.set('provider', options.provider)
      if (options.isActive !== undefined) params.set('isActive', options.isActive.toString())
      if (options.search) params.set('search', options.search)

      const response = await fetch(`/api/v1/connectors?${params}`, {
        headers: { 'x-organization-id': org.id },
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to fetch connectors')
      }

      const data = await response.json()
      setConnectors(data.data || data.connectors)
      setMeta(data.meta)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setIsLoading(false)
    }
  }, [org, options.page, options.limit, options.type, options.provider, options.isActive, options.search])

  /**
   * Create a new connector
   */
  const createConnector = useCallback(async (input: CreateConnectorInput): Promise<Connector> => {
    if (!org) throw new Error('No organization selected')

    const response = await fetch('/api/v1/connectors', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-organization-id': org.id,
      },
      body: JSON.stringify(input),
    })

    if (!response.ok) {
      const data = await response.json()
      throw new Error(data.error || 'Failed to create connector')
    }

    const connector = await response.json()
    setConnectors((prev) => [connector, ...prev])
    return connector
  }, [org])

  /**
   * Update an existing connector
   */
  const updateConnector = useCallback(async (id: string, input: UpdateConnectorInput): Promise<Connector> => {
    if (!org) throw new Error('No organization selected')

    const response = await fetch(`/api/v1/connectors/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'x-organization-id': org.id,
      },
      body: JSON.stringify(input),
    })

    if (!response.ok) {
      const data = await response.json()
      throw new Error(data.error || 'Failed to update connector')
    }

    const { data: connector } = await response.json()
    setConnectors((prev) => prev.map((c) => (c.id === id ? connector : c)))
    return connector
  }, [org])

  /**
   * Delete a connector
   */
  const deleteConnector = useCallback(async (id: string): Promise<void> => {
    if (!org) throw new Error('No organization selected')

    const response = await fetch(`/api/v1/connectors/${id}`, {
      method: 'DELETE',
      headers: { 'x-organization-id': org.id },
    })

    if (!response.ok) {
      const data = await response.json()
      throw new Error(data.error || 'Failed to delete connector')
    }

    setConnectors((prev) => prev.filter((c) => c.id !== id))
  }, [org])

  /**
   * Trigger a sync
   */
  const triggerSync = useCallback(async (id: string): Promise<{ syncLogId: string; status: string }> => {
    if (!org) throw new Error('No organization selected')

    const response = await fetch(`/api/v1/connectors/${id}/sync`, {
      method: 'POST',
      headers: { 'x-organization-id': org.id },
    })

    if (!response.ok) {
      const data = await response.json()
      throw new Error(data.error || 'Failed to trigger sync')
    }

    const result = await response.json()

    // Optimistically update connector status
    setConnectors((prev) => prev.map((c) =>
      c.id === id ? { ...c, lastSyncStatus: 'PENDING' as DataSyncStatus } : c
    ))

    return result
  }, [org])

  /**
   * Test connector connection
   */
  const testConnection = useCallback(async (id: string): Promise<{
    success: boolean
    message: string
    details?: Record<string, unknown>
  }> => {
    if (!org) throw new Error('No organization selected')

    const response = await fetch(`/api/v1/connectors/${id}/test`, {
      method: 'POST',
      headers: { 'x-organization-id': org.id },
    })

    if (!response.ok) {
      const data = await response.json()
      throw new Error(data.error || 'Failed to test connection')
    }

    return await response.json()
  }, [org])

  return {
    connectors,
    meta,
    isLoading,
    error,
    fetchConnectors,
    createConnector,
    updateConnector,
    deleteConnector,
    triggerSync,
    testConnection,
  }
}

/**
 * Hook for a single connector with sync history
 */
export function useConnector(id: string) {
  const { org } = useCurrentOrg()
  const [connector, setConnector] = useState<ConnectorWithHistory | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /**
   * Fetch connector details
   */
  const fetchConnector = useCallback(async () => {
    if (!org || !id) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/v1/connectors/${id}`, {
        headers: { 'x-organization-id': org.id },
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to fetch connector')
      }

      const { data } = await response.json()
      setConnector(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setIsLoading(false)
    }
  }, [org, id])

  /**
   * Trigger a sync
   */
  const triggerSync = useCallback(async (): Promise<{ syncLogId: string; status: string }> => {
    if (!org || !id) throw new Error('No connector selected')

    const response = await fetch(`/api/v1/connectors/${id}/sync`, {
      method: 'POST',
      headers: { 'x-organization-id': org.id },
    })

    if (!response.ok) {
      const data = await response.json()
      throw new Error(data.error || 'Failed to trigger sync')
    }

    const result = await response.json()

    // Update connector state
    if (connector) {
      setConnector({ ...connector, lastSyncStatus: 'PENDING' as DataSyncStatus })
    }

    return result
  }, [org, id, connector])

  /**
   * Test connection
   */
  const testConnection = useCallback(async (): Promise<{
    success: boolean
    message: string
    details?: Record<string, unknown>
  }> => {
    if (!org || !id) throw new Error('No connector selected')

    const response = await fetch(`/api/v1/connectors/${id}/test`, {
      method: 'POST',
      headers: { 'x-organization-id': org.id },
    })

    if (!response.ok) {
      const data = await response.json()
      throw new Error(data.error || 'Failed to test connection')
    }

    return await response.json()
  }, [org, id])

  /**
   * Get sync history
   */
  const fetchSyncHistory = useCallback(async (options: { page?: number; limit?: number; status?: DataSyncStatus } = {}): Promise<{
    data: SyncLog[]
    meta: PaginationMeta
  }> => {
    if (!org || !id) throw new Error('No connector selected')

    const params = new URLSearchParams()
    if (options.page) params.set('page', options.page.toString())
    if (options.limit) params.set('limit', options.limit.toString())
    if (options.status) params.set('status', options.status)

    const response = await fetch(`/api/v1/connectors/${id}/sync?${params}`, {
      headers: { 'x-organization-id': org.id },
    })

    if (!response.ok) {
      const data = await response.json()
      throw new Error(data.error || 'Failed to fetch sync history')
    }

    return await response.json()
  }, [org, id])

  return {
    connector,
    isLoading,
    error,
    fetchConnector,
    triggerSync,
    testConnection,
    fetchSyncHistory,
  }
}
