"use client"

import { useState, useCallback } from 'react'
import { useCurrentOrg } from './use-organization'

/**
 * Shared link permission type
 */
export type SharedLinkPermission = 'VIEW' | 'COMMENT' | 'DOWNLOAD'

/**
 * Shared link view record
 */
export interface SharedLinkView {
  id: string
  sharedLinkId: string
  viewerEmail: string | null
  viewerIp: string | null
  userAgent: string | null
  viewedAt: string
}

/**
 * Shared link with user details
 */
export interface SharedLink {
  id: string
  orgId: string
  userId: string
  entityType: string
  entityId: string
  token: string
  hasPassword: boolean
  expiresAt: string | null
  maxViews: number | null
  viewCount: number
  allowedEmails: string[]
  permissions: SharedLinkPermission
  isActive: boolean
  lastViewedAt: string | null
  createdAt: string
  updatedAt: string
  shareUrl: string
  user: {
    id: string
    name: string | null
    email: string
    image: string | null
  }
  _count?: {
    views: number
  }
  views?: SharedLinkView[]
}

interface CreateSharedLinkInput {
  entityType: string
  entityId: string
  password?: string
  expiresAt?: string
  maxViews?: number
  allowedEmails?: string[]
  permissions?: SharedLinkPermission
}

interface UpdateSharedLinkInput {
  password?: string | null
  expiresAt?: string | null
  maxViews?: number | null
  allowedEmails?: string[]
  permissions?: SharedLinkPermission
  isActive?: boolean
}

interface SharedLinkFilters {
  entityType?: string
  entityId?: string
  onlyMine?: boolean
}

/**
 * Hook for managing shared links.
 *
 * @example
 * ```tsx
 * function SharePanel({ reportId }: { reportId: string }) {
 *   const { sharedLinks, isLoading, fetchSharedLinks, createSharedLink } = useSharedLinks()
 *
 *   useEffect(() => {
 *     fetchSharedLinks({ entityType: 'report', entityId: reportId })
 *   }, [fetchSharedLinks, reportId])
 *
 *   const handleShare = async () => {
 *     const link = await createSharedLink({
 *       entityType: 'report',
 *       entityId: reportId,
 *       permissions: 'VIEW',
 *     })
 *     navigator.clipboard.writeText(link.shareUrl)
 *   }
 *
 *   return <Button onClick={handleShare}>Create Share Link</Button>
 * }
 * ```
 */
export function useSharedLinks() {
  const { org } = useCurrentOrg()
  const [sharedLinks, setSharedLinks] = useState<SharedLink[]>([])
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchSharedLinks = useCallback(async (filters: SharedLinkFilters = {}, page: number = 1, limit: number = 50) => {
    if (!org) return

    setIsLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams()
      params.set('offset', ((page - 1) * limit).toString())
      params.set('limit', limit.toString())

      if (filters.entityType) params.set('entityType', filters.entityType)
      if (filters.entityId) params.set('entityId', filters.entityId)
      if (filters.onlyMine) params.set('onlyMine', 'true')

      const response = await fetch(`/api/v1/shared-links?${params}`, {
        headers: { 'x-organization-id': org.id },
      })

      if (!response.ok) throw new Error('Failed to fetch shared links')

      const data = await response.json()
      setSharedLinks(data.data)
      setTotal(data.total)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setIsLoading(false)
    }
  }, [org])

  const createSharedLink = useCallback(async (input: CreateSharedLinkInput) => {
    if (!org) throw new Error('No organization selected')

    const response = await fetch('/api/v1/shared-links', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-organization-id': org.id,
      },
      body: JSON.stringify(input),
    })

    if (!response.ok) {
      const data = await response.json()
      throw new Error(data.error || 'Failed to create shared link')
    }

    const { data } = await response.json()
    setSharedLinks(prev => [data, ...prev])
    setTotal(prev => prev + 1)
    return data as SharedLink
  }, [org])

  const updateSharedLink = useCallback(async (id: string, input: UpdateSharedLinkInput) => {
    if (!org) throw new Error('No organization selected')

    const response = await fetch(`/api/v1/shared-links/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'x-organization-id': org.id,
      },
      body: JSON.stringify(input),
    })

    if (!response.ok) {
      const data = await response.json()
      throw new Error(data.error || 'Failed to update shared link')
    }

    const { data } = await response.json()
    setSharedLinks(prev => prev.map(l => l.id === id ? data : l))
    return data as SharedLink
  }, [org])

  const revokeSharedLink = useCallback(async (id: string) => {
    return updateSharedLink(id, { isActive: false })
  }, [updateSharedLink])

  const deleteSharedLink = useCallback(async (id: string) => {
    if (!org) throw new Error('No organization selected')

    const response = await fetch(`/api/v1/shared-links/${id}`, {
      method: 'DELETE',
      headers: { 'x-organization-id': org.id },
    })

    if (!response.ok) {
      const data = await response.json()
      throw new Error(data.error || 'Failed to delete shared link')
    }

    setSharedLinks(prev => prev.filter(l => l.id !== id))
    setTotal(prev => prev - 1)
  }, [org])

  return {
    sharedLinks,
    total,
    isLoading,
    error,
    fetchSharedLinks,
    createSharedLink,
    updateSharedLink,
    revokeSharedLink,
    deleteSharedLink,
  }
}

/**
 * Hook for a single shared link with view history.
 */
export function useSharedLink(id: string) {
  const { org } = useCurrentOrg()
  const [sharedLink, setSharedLink] = useState<SharedLink | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchSharedLink = useCallback(async () => {
    if (!org || !id) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/v1/shared-links/${id}`, {
        headers: { 'x-organization-id': org.id },
      })

      if (!response.ok) throw new Error('Failed to fetch shared link')

      const { data } = await response.json()
      setSharedLink(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setIsLoading(false)
    }
  }, [org, id])

  return {
    sharedLink,
    isLoading,
    error,
    fetchSharedLink,
  }
}

/**
 * Hook for accessing shared content publicly (no auth required).
 */
export function usePublicSharedContent(token: string) {
  const [metadata, setMetadata] = useState<{
    entityType: string
    entityId: string
    permissions: SharedLinkPermission
    requiresPassword: boolean
    requiresEmail: boolean
    sharedBy: { id: string; name: string | null; image: string | null }
    createdAt: string
  } | null>(null)
  const [content, setContent] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchMetadata = useCallback(async () => {
    if (!token) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/public/shared/${token}`)

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to access shared content')
      }

      const { data } = await response.json()
      setMetadata(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setIsLoading(false)
    }
  }, [token])

  const accessContent = useCallback(async (password?: string, viewerEmail?: string) => {
    if (!token) throw new Error('No token provided')

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/public/shared/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password, viewerEmail }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to access shared content')
      }

      const { data } = await response.json()
      setContent(data.content)
      return data
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      setError(message)
      throw new Error(message)
    } finally {
      setIsLoading(false)
    }
  }, [token])

  return {
    metadata,
    content,
    isLoading,
    error,
    fetchMetadata,
    accessContent,
  }
}
