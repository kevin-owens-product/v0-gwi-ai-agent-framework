"use client"

import { useState, useCallback } from 'react'
import { useCurrentOrg } from './use-organization'
import type { AuditAction, AuditResourceType } from '@/lib/audit'

/**
 * Audit log entry
 */
export interface AuditLogEntry {
  id: string
  action: AuditAction
  resourceType: AuditResourceType
  resourceId?: string
  metadata?: Record<string, unknown>
  ipAddress?: string
  userAgent?: string
  timestamp: string
  user?: {
    id: string
    name: string
    email: string
  }
}

interface AuditLogFilters {
  action?: AuditAction
  resourceType?: AuditResourceType
  userId?: string
  startDate?: Date
  endDate?: Date
}

interface PaginationMeta {
  page: number
  limit: number
  total: number
  totalPages: number
}

/**
 * Hook for viewing audit logs.
 *
 * @example
 * ```tsx
 * function AuditLogPage() {
 *   const { logs, meta, isLoading, fetchLogs } = useAuditLog()
 *
 *   useEffect(() => {
 *     fetchLogs({ action: 'create' })
 *   }, [fetchLogs])
 *
 *   return logs.map(log => <AuditLogRow key={log.id} log={log} />)
 * }
 * ```
 */
export function useAuditLog(initialFilters?: AuditLogFilters) {
  const { org } = useCurrentOrg()
  const [logs, setLogs] = useState<AuditLogEntry[]>([])
  const [meta, setMeta] = useState<PaginationMeta>({ page: 1, limit: 50, total: 0, totalPages: 0 })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<AuditLogFilters>(initialFilters || {})

  const fetchLogs = useCallback(async (newFilters?: AuditLogFilters, page: number = 1) => {
    if (!org) return

    const currentFilters = newFilters ?? filters
    if (newFilters) setFilters(newFilters)

    setIsLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams()
      params.set('page', page.toString())
      if (currentFilters.action) params.set('action', currentFilters.action)
      if (currentFilters.resourceType) params.set('resourceType', currentFilters.resourceType)
      if (currentFilters.userId) params.set('userId', currentFilters.userId)
      if (currentFilters.startDate) params.set('startDate', currentFilters.startDate.toISOString())
      if (currentFilters.endDate) params.set('endDate', currentFilters.endDate.toISOString())

      const response = await fetch(`/api/v1/audit-log?${params}`, {
        headers: { 'x-organization-id': org.id },
      })

      if (!response.ok) throw new Error('Failed to fetch audit logs')

      const data = await response.json()
      setLogs(data.data)
      setMeta(data.meta)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setIsLoading(false)
    }
  }, [org, filters])

  const exportLogs = useCallback(async (format: 'csv' | 'json' = 'csv') => {
    if (!org) throw new Error('No organization selected')

    const params = new URLSearchParams()
    params.set('format', format)
    if (filters.action) params.set('action', filters.action)
    if (filters.resourceType) params.set('resourceType', filters.resourceType)
    if (filters.userId) params.set('userId', filters.userId)
    if (filters.startDate) params.set('startDate', filters.startDate.toISOString())
    if (filters.endDate) params.set('endDate', filters.endDate.toISOString())

    const response = await fetch(`/api/v1/audit-log/export?${params}`, {
      headers: { 'x-organization-id': org.id },
    })

    if (!response.ok) {
      throw new Error('Failed to export audit logs')
    }

    const blob = await response.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `audit-log-${new Date().toISOString().split('T')[0]}.${format}`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, [org, filters])

  return {
    logs,
    meta,
    filters,
    isLoading,
    error,
    fetchLogs,
    exportLogs,
    setFilters,
  }
}
