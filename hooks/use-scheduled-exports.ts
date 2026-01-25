/**
 * @prompt-id forge-v4.1:feature:scheduled-exports:004
 * @generated-at 2026-01-25T00:00:00Z
 * @model claude-opus-4.5
 */

"use client"

import useSWR from 'swr'
import { useCallback } from 'react'
import { useCurrentOrg } from './use-organization'

// Types
export type ExportFormat = 'PDF' | 'EXCEL' | 'CSV' | 'POWERPOINT' | 'PNG' | 'JSON'
export type ExportStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED'
export type EntityType = 'report' | 'dashboard' | 'audience' | 'crosstab'

export interface ScheduledExport {
  id: string
  orgId: string
  userId: string
  name: string
  description: string | null
  entityType: EntityType
  entityId: string
  format: ExportFormat
  schedule: string
  timezone: string
  recipients: string[]
  isActive: boolean
  lastRunAt: string | null
  nextRunAt: string | null
  lastStatus: ExportStatus | null
  lastError: string | null
  metadata: Record<string, unknown>
  createdAt: string
  updatedAt: string
  user: {
    id: string
    name: string | null
    email: string
  }
  _count?: {
    exportHistory: number
  }
}

export interface ExportHistory {
  id: string
  scheduledExportId: string
  status: ExportStatus
  format: ExportFormat
  fileUrl: string | null
  fileSize: number | null
  error: string | null
  startedAt: string
  completedAt: string | null
  recipientCount: number
  metadata: Record<string, unknown>
}

export interface ScheduledExportWithHistory extends ScheduledExport {
  exportHistory: ExportHistory[]
}

export interface CreateScheduledExportInput {
  name: string
  description?: string
  entityType: EntityType
  entityId: string
  format: ExportFormat
  schedule: string
  timezone?: string
  recipients?: string[]
  metadata?: Record<string, unknown>
}

export interface UpdateScheduledExportInput {
  name?: string
  description?: string | null
  schedule?: string
  timezone?: string
  recipients?: string[]
  isActive?: boolean
  format?: ExportFormat
  metadata?: Record<string, unknown>
}

interface UseScheduledExportsOptions {
  page?: number
  limit?: number
  status?: 'active' | 'inactive'
  entityType?: EntityType
}

const fetcher = async (url: string, orgId: string) => {
  const response = await fetch(url, {
    headers: { 'x-organization-id': orgId },
  })
  if (!response.ok) {
    const data = await response.json()
    throw new Error(data.error || 'Failed to fetch')
  }
  return response.json()
}

/**
 * Hook to manage scheduled exports
 */
export function useScheduledExports(options: UseScheduledExportsOptions = {}) {
  const { org } = useCurrentOrg()

  // Build query string
  const params = new URLSearchParams()
  if (options.page) params.set('page', options.page.toString())
  if (options.limit) params.set('limit', options.limit.toString())
  if (options.status) params.set('status', options.status)
  if (options.entityType) params.set('entityType', options.entityType)

  const queryString = params.toString()
  const url = `/api/v1/scheduled-exports${queryString ? `?${queryString}` : ''}`

  const { data, error, isLoading, mutate } = useSWR(
    org ? [url, org.id] : null,
    ([url, orgId]) => fetcher(url, orgId),
    {
      revalidateOnFocus: false,
      dedupingInterval: 5000,
    }
  )

  const createExport = useCallback(async (input: CreateScheduledExportInput) => {
    if (!org) throw new Error('No organization selected')

    const response = await fetch('/api/v1/scheduled-exports', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-organization-id': org.id,
      },
      body: JSON.stringify(input),
    })

    if (!response.ok) {
      const data = await response.json()
      throw new Error(data.error || 'Failed to create scheduled export')
    }

    const result = await response.json()
    mutate()
    return result.data as ScheduledExport
  }, [org, mutate])

  const updateExport = useCallback(async (id: string, input: UpdateScheduledExportInput) => {
    if (!org) throw new Error('No organization selected')

    const response = await fetch(`/api/v1/scheduled-exports/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'x-organization-id': org.id,
      },
      body: JSON.stringify(input),
    })

    if (!response.ok) {
      const data = await response.json()
      throw new Error(data.error || 'Failed to update scheduled export')
    }

    const result = await response.json()
    mutate()
    return result.data as ScheduledExport
  }, [org, mutate])

  const deleteExport = useCallback(async (id: string) => {
    if (!org) throw new Error('No organization selected')

    const response = await fetch(`/api/v1/scheduled-exports/${id}`, {
      method: 'DELETE',
      headers: { 'x-organization-id': org.id },
    })

    if (!response.ok) {
      const data = await response.json()
      throw new Error(data.error || 'Failed to delete scheduled export')
    }

    mutate()
  }, [org, mutate])

  const runExport = useCallback(async (id: string) => {
    if (!org) throw new Error('No organization selected')

    const response = await fetch(`/api/v1/scheduled-exports/${id}/run`, {
      method: 'POST',
      headers: { 'x-organization-id': org.id },
    })

    if (!response.ok) {
      const data = await response.json()
      throw new Error(data.error || 'Failed to run export')
    }

    const result = await response.json()
    mutate()
    return result.data
  }, [org, mutate])

  return {
    exports: (data?.data || []) as ScheduledExport[],
    meta: data?.meta || { page: 1, limit: 20, total: 0, totalPages: 0 },
    isLoading,
    error: error?.message || null,
    createExport,
    updateExport,
    deleteExport,
    runExport,
    refresh: mutate,
  }
}

/**
 * Hook to get a single scheduled export with history
 */
export function useScheduledExport(id: string | null, historyLimit: number = 10) {
  const { org } = useCurrentOrg()

  const url = id ? `/api/v1/scheduled-exports/${id}?historyLimit=${historyLimit}` : null

  const { data, error, isLoading, mutate } = useSWR(
    org && url ? [url, org.id] : null,
    ([url, orgId]) => fetcher(url, orgId),
    {
      revalidateOnFocus: false,
      refreshInterval: 10000, // Refresh every 10s to check for export status updates
    }
  )

  const runExport = useCallback(async () => {
    if (!org || !id) throw new Error('No organization or export selected')

    const response = await fetch(`/api/v1/scheduled-exports/${id}/run`, {
      method: 'POST',
      headers: { 'x-organization-id': org.id },
    })

    if (!response.ok) {
      const data = await response.json()
      throw new Error(data.error || 'Failed to run export')
    }

    const result = await response.json()
    mutate()
    return result.data
  }, [org, id, mutate])

  return {
    export: data?.data as ScheduledExportWithHistory | null,
    isLoading,
    error: error?.message || null,
    runExport,
    refresh: mutate,
  }
}

/**
 * Hook to get export history for a scheduled export
 */
export function useExportHistory(exportId: string | null, limit: number = 20) {
  const { org } = useCurrentOrg()

  const url = exportId ? `/api/v1/scheduled-exports/${exportId}?historyLimit=${limit}` : null

  const { data, error, isLoading, mutate } = useSWR(
    org && url ? [url, org.id] : null,
    ([url, orgId]) => fetcher(url, orgId),
    {
      revalidateOnFocus: false,
      refreshInterval: 5000, // Refresh every 5s to check for updates
    }
  )

  return {
    history: (data?.data?.exportHistory || []) as ExportHistory[],
    isLoading,
    error: error?.message || null,
    refresh: mutate,
  }
}
