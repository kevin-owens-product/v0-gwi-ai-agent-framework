/**
 * @prompt-id forge-v4.1:feature:saved-views:003
 * @generated-at 2026-01-25T00:00:00Z
 * @model claude-opus-4-5
 */

"use client"

import useSWR, { mutate as globalMutate } from 'swr'
import { useCallback, useMemo } from 'react'
import { useCurrentOrg } from './use-organization'

/**
 * SavedViewType enum matching Prisma schema
 */
export type SavedViewType = 'FAVORITE' | 'RECENT' | 'PINNED'

/**
 * SavedView entity interface
 */
export interface SavedView {
  id: string
  userId: string
  orgId: string
  name: string
  description: string | null
  type: SavedViewType
  entityType: string
  entityId: string
  isPinned: boolean
  sortOrder: number
  metadata: Record<string, unknown>
  createdAt: string
  updatedAt: string
}

/**
 * Input for creating a saved view
 */
export interface CreateSavedViewInput {
  name: string
  description?: string
  type: SavedViewType
  entityType: string
  entityId: string
  isPinned?: boolean
  sortOrder?: number
  metadata?: Record<string, unknown>
}

/**
 * Input for updating a saved view
 */
export interface UpdateSavedViewInput {
  name?: string
  description?: string | null
  isPinned?: boolean
  sortOrder?: number
  metadata?: Record<string, unknown>
}

/**
 * Filters for querying saved views
 */
export interface SavedViewFilters {
  type?: SavedViewType
  entityType?: string
  pinned?: boolean
  limit?: number
  offset?: number
}

/**
 * Response metadata from API
 */
interface SavedViewsMeta {
  total: number
  limit: number
  offset: number
  hasMore: boolean
}

/**
 * API response structure
 */
interface SavedViewsResponse {
  data: SavedView[]
  meta: SavedViewsMeta
}

/**
 * SWR fetcher with organization header
 */
const createFetcher = (orgId: string) => async (url: string) => {
  const response = await fetch(url, {
    headers: { 'x-organization-id': orgId },
  })
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }))
    throw new Error(error.error || 'Request failed')
  }
  return response.json()
}

/**
 * Build query string from filters
 */
function buildQueryString(filters: SavedViewFilters): string {
  const params = new URLSearchParams()
  if (filters.type) params.set('type', filters.type)
  if (filters.entityType) params.set('entityType', filters.entityType)
  if (filters.pinned !== undefined) params.set('pinned', String(filters.pinned))
  if (filters.limit) params.set('limit', String(filters.limit))
  if (filters.offset) params.set('offset', String(filters.offset))
  return params.toString()
}

/**
 * Hook for managing saved views with SWR caching and revalidation
 *
 * @example
 * ```tsx
 * function FavoritesPanel() {
 *   const { savedViews, isLoading, addFavorite, removeFavorite } = useSavedViews({ type: 'FAVORITE' })
 *
 *   return (
 *     <div>
 *       {savedViews.map(view => (
 *         <div key={view.id}>
 *           {view.name}
 *           <button onClick={() => removeFavorite(view.id)}>Remove</button>
 *         </div>
 *       ))}
 *     </div>
 *   )
 * }
 * ```
 */
export function useSavedViews(filters: SavedViewFilters = {}) {
  const { org } = useCurrentOrg()
  const orgId = org?.id

  const queryString = buildQueryString(filters)
  const cacheKey = orgId ? `/api/v1/saved-views?${queryString}` : null

  const fetcher = useMemo(() => orgId ? createFetcher(orgId) : null, [orgId])

  const { data, error, isLoading, isValidating, mutate } = useSWR<SavedViewsResponse>(
    cacheKey,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 5000,
    }
  )

  /**
   * Create a new saved view
   */
  const createSavedView = useCallback(async (input: CreateSavedViewInput): Promise<SavedView> => {
    if (!orgId) throw new Error('No organization selected')

    const response = await fetch('/api/v1/saved-views', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-organization-id': orgId,
      },
      body: JSON.stringify(input),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Failed to create saved view' }))
      throw new Error(errorData.error || 'Failed to create saved view')
    }

    const { data: savedView } = await response.json()

    // Optimistically update the cache
    mutate(
      (current) => current ? { ...current, data: [savedView, ...current.data] } : undefined,
      { revalidate: true }
    )

    // Also invalidate related caches
    globalMutate((key) => typeof key === 'string' && key.startsWith('/api/v1/saved-views'))

    return savedView
  }, [orgId, mutate])

  /**
   * Update an existing saved view
   */
  const updateSavedView = useCallback(async (id: string, input: UpdateSavedViewInput): Promise<SavedView> => {
    if (!orgId) throw new Error('No organization selected')

    const response = await fetch(`/api/v1/saved-views/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'x-organization-id': orgId,
      },
      body: JSON.stringify(input),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Failed to update saved view' }))
      throw new Error(errorData.error || 'Failed to update saved view')
    }

    const { data: savedView } = await response.json()

    // Optimistically update the cache
    mutate(
      (current) => current ? {
        ...current,
        data: current.data.map(v => v.id === id ? savedView : v)
      } : undefined,
      { revalidate: true }
    )

    // Also invalidate related caches
    globalMutate((key) => typeof key === 'string' && key.startsWith('/api/v1/saved-views'))

    return savedView
  }, [orgId, mutate])

  /**
   * Delete a saved view
   */
  const deleteSavedView = useCallback(async (id: string): Promise<void> => {
    if (!orgId) throw new Error('No organization selected')

    const response = await fetch(`/api/v1/saved-views/${id}`, {
      method: 'DELETE',
      headers: {
        'x-organization-id': orgId,
      },
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Failed to delete saved view' }))
      throw new Error(errorData.error || 'Failed to delete saved view')
    }

    // Optimistically update the cache
    mutate(
      (current) => current ? {
        ...current,
        data: current.data.filter(v => v.id !== id),
        meta: { ...current.meta, total: current.meta.total - 1 }
      } : undefined,
      { revalidate: true }
    )

    // Also invalidate related caches
    globalMutate((key) => typeof key === 'string' && key.startsWith('/api/v1/saved-views'))
  }, [orgId, mutate])

  /**
   * Toggle the pinned status of a saved view
   */
  const togglePinned = useCallback(async (id: string, currentPinned: boolean): Promise<SavedView> => {
    return updateSavedView(id, { isPinned: !currentPinned })
  }, [updateSavedView])

  /**
   * Quick action: Add an entity as a favorite
   */
  const addFavorite = useCallback(async (
    entityType: string,
    entityId: string,
    name: string,
    metadata?: Record<string, unknown>
  ): Promise<SavedView> => {
    return createSavedView({
      name,
      type: 'FAVORITE',
      entityType,
      entityId,
      metadata,
    })
  }, [createSavedView])

  /**
   * Quick action: Remove a saved view by its ID
   */
  const removeFavorite = useCallback(async (id: string): Promise<void> => {
    return deleteSavedView(id)
  }, [deleteSavedView])

  /**
   * Check if an entity is saved (by entityType and entityId)
   */
  const isSaved = useCallback((entityType: string, entityId: string): boolean => {
    if (!data?.data) return false
    return data.data.some(v => v.entityType === entityType && v.entityId === entityId)
  }, [data?.data])

  /**
   * Get saved view for a specific entity
   */
  const getSavedViewForEntity = useCallback((entityType: string, entityId: string): SavedView | undefined => {
    if (!data?.data) return undefined
    return data.data.find(v => v.entityType === entityType && v.entityId === entityId)
  }, [data?.data])

  return {
    savedViews: data?.data ?? [],
    meta: data?.meta ?? { total: 0, limit: 50, offset: 0, hasMore: false },
    isLoading,
    isValidating,
    error: error?.message ?? null,
    createSavedView,
    updateSavedView,
    deleteSavedView,
    togglePinned,
    addFavorite,
    removeFavorite,
    isSaved,
    getSavedViewForEntity,
    refresh: () => mutate(),
  }
}

/**
 * Hook to get a single saved view by ID
 */
export function useSavedView(id: string | null) {
  const { org } = useCurrentOrg()
  const orgId = org?.id

  const fetcher = useMemo(() => orgId ? createFetcher(orgId) : null, [orgId])

  const { data, error, isLoading, mutate } = useSWR<{ data: SavedView }>(
    id && orgId ? `/api/v1/saved-views/${id}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
    }
  )

  return {
    savedView: data?.data ?? null,
    isLoading,
    error: error?.message ?? null,
    refresh: () => mutate(),
  }
}

/**
 * Hook specifically for pinned items
 */
export function usePinnedViews() {
  return useSavedViews({ pinned: true, limit: 20 })
}

/**
 * Hook specifically for favorites
 */
export function useFavorites(entityType?: string) {
  return useSavedViews({ type: 'FAVORITE', entityType, limit: 100 })
}

/**
 * Hook specifically for recent views
 */
export function useRecentViews(entityType?: string, limit: number = 10) {
  return useSavedViews({ type: 'RECENT', entityType, limit })
}
