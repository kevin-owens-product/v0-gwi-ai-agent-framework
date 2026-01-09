"use client"

import { useState, useCallback } from 'react'
import { useCurrentOrg } from './use-organization'

/**
 * Data source types
 */
export type DataSourceType = 'API' | 'DATABASE' | 'FILE_UPLOAD' | 'WEBHOOK' | 'INTEGRATION'

/**
 * Data source status
 */
export type DataSourceStatus = 'PENDING' | 'CONNECTED' | 'ERROR' | 'DISABLED'

/**
 * Data source details
 */
export interface DataSource {
  id: string
  name: string
  type: DataSourceType
  status: DataSourceStatus
  configuration: Record<string, unknown>
  lastSyncAt?: string
  errorMessage?: string
  createdAt: string
  updatedAt: string
}

interface CreateDataSourceInput {
  name: string
  type: DataSourceType
  configuration: Record<string, unknown>
}

interface UpdateDataSourceInput {
  name?: string
  configuration?: Record<string, unknown>
  status?: DataSourceStatus
}

/**
 * Hook for managing data sources.
 *
 * @example
 * ```tsx
 * function DataSourcesPage() {
 *   const { dataSources, createDataSource, testConnection, fetchDataSources } = useDataSources()
 *
 *   useEffect(() => {
 *     fetchDataSources()
 *   }, [fetchDataSources])
 *
 *   const handleAdd = async () => {
 *     await createDataSource({
 *       name: 'My API',
 *       type: 'API',
 *       configuration: { endpoint: 'https://api.example.com' },
 *     })
 *   }
 * }
 * ```
 */
export function useDataSources() {
  const { org } = useCurrentOrg()
  const [dataSources, setDataSources] = useState<DataSource[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchDataSources = useCallback(async () => {
    if (!org) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/v1/data-sources', {
        headers: { 'x-organization-id': org.id },
      })

      if (!response.ok) throw new Error('Failed to fetch data sources')

      const data = await response.json()
      setDataSources(data.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setIsLoading(false)
    }
  }, [org])

  const createDataSource = useCallback(async (input: CreateDataSourceInput) => {
    if (!org) throw new Error('No organization selected')

    const response = await fetch('/api/v1/data-sources', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-organization-id': org.id,
      },
      body: JSON.stringify(input),
    })

    if (!response.ok) {
      const data = await response.json()
      throw new Error(data.error || 'Failed to create data source')
    }

    const { data } = await response.json()
    setDataSources(prev => [data, ...prev])
    return data as DataSource
  }, [org])

  const updateDataSource = useCallback(async (id: string, input: UpdateDataSourceInput) => {
    if (!org) throw new Error('No organization selected')

    const response = await fetch(`/api/v1/data-sources/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'x-organization-id': org.id,
      },
      body: JSON.stringify(input),
    })

    if (!response.ok) {
      const data = await response.json()
      throw new Error(data.error || 'Failed to update data source')
    }

    const { data } = await response.json()
    setDataSources(prev => prev.map(ds => ds.id === id ? data : ds))
    return data as DataSource
  }, [org])

  const deleteDataSource = useCallback(async (id: string) => {
    if (!org) throw new Error('No organization selected')

    const response = await fetch(`/api/v1/data-sources/${id}`, {
      method: 'DELETE',
      headers: { 'x-organization-id': org.id },
    })

    if (!response.ok) {
      const data = await response.json()
      throw new Error(data.error || 'Failed to delete data source')
    }

    setDataSources(prev => prev.filter(ds => ds.id !== id))
  }, [org])

  const testConnection = useCallback(async (id: string): Promise<{ success: boolean; message: string }> => {
    if (!org) throw new Error('No organization selected')

    const response = await fetch(`/api/v1/data-sources/${id}/test`, {
      method: 'POST',
      headers: { 'x-organization-id': org.id },
    })

    const data = await response.json()
    return data
  }, [org])

  const syncDataSource = useCallback(async (id: string) => {
    if (!org) throw new Error('No organization selected')

    const response = await fetch(`/api/v1/data-sources/${id}/sync`, {
      method: 'POST',
      headers: { 'x-organization-id': org.id },
    })

    if (!response.ok) {
      const data = await response.json()
      throw new Error(data.error || 'Failed to sync data source')
    }

    // Refresh the data source to get updated status
    await fetchDataSources()
  }, [org, fetchDataSources])

  return {
    dataSources,
    isLoading,
    error,
    fetchDataSources,
    createDataSource,
    updateDataSource,
    deleteDataSource,
    testConnection,
    syncDataSource,
  }
}

/**
 * Hook for a single data source
 */
export function useDataSource(id: string) {
  const { org } = useCurrentOrg()
  const [dataSource, setDataSource] = useState<DataSource | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchDataSource = useCallback(async () => {
    if (!org || !id) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/v1/data-sources/${id}`, {
        headers: { 'x-organization-id': org.id },
      })

      if (!response.ok) throw new Error('Failed to fetch data source')

      const { data } = await response.json()
      setDataSource(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setIsLoading(false)
    }
  }, [org, id])

  return {
    dataSource,
    isLoading,
    error,
    fetchDataSource,
  }
}
