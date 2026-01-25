"use client"

import { useState, useCallback, useMemo } from 'react'

/**
 * @prompt-id forge-v4.1:feature:bulk-operations:001
 * @generated-at 2026-01-25T00:00:00Z
 * @model claude-opus-4-5
 */

export interface BulkSelectionOptions<T> {
  /** Function to get unique ID from an item */
  getItemId: (item: T) => string
  /** Maximum number of items that can be selected */
  maxSelection?: number
  /** Callback when selection changes */
  onSelectionChange?: (selectedIds: Set<string>) => void
}

export interface BulkSelectionResult<T> {
  /** Currently selected item IDs */
  selectedIds: Set<string>
  /** Number of selected items */
  selectedCount: number
  /** Whether all visible items are selected */
  isAllSelected: boolean
  /** Whether some (but not all) visible items are selected */
  isIndeterminate: boolean
  /** Whether a specific item is selected */
  isSelected: (id: string) => boolean
  /** Select a single item */
  select: (id: string) => void
  /** Deselect a single item */
  deselect: (id: string) => void
  /** Toggle selection of a single item */
  toggle: (id: string) => void
  /** Select all visible items */
  selectAll: (items: T[]) => void
  /** Deselect all items */
  deselectAll: () => void
  /** Select items across pages (with IDs) */
  selectAcrossPages: (ids: string[]) => void
  /** Set selection directly */
  setSelection: (ids: Set<string>) => void
  /** Get selected items from a list */
  getSelectedItems: (items: T[]) => T[]
  /** Check if selection limit is reached */
  isMaxReached: boolean
}

/**
 * Hook for managing bulk selection of items.
 * Supports select all, select visible, select across pages, and individual selection.
 *
 * @example
 * ```tsx
 * function UserList({ users }: { users: User[] }) {
 *   const {
 *     selectedIds,
 *     isSelected,
 *     toggle,
 *     selectAll,
 *     deselectAll,
 *     isAllSelected,
 *     isIndeterminate,
 *     selectedCount,
 *   } = useBulkSelection({
 *     getItemId: (user) => user.id,
 *     maxSelection: 100,
 *   })
 *
 *   return (
 *     <div>
 *       <Checkbox
 *         checked={isAllSelected}
 *         indeterminate={isIndeterminate}
 *         onCheckedChange={(checked) => {
 *           if (checked) selectAll(users)
 *           else deselectAll()
 *         }}
 *       />
 *       <span>{selectedCount} selected</span>
 *       {users.map(user => (
 *         <Checkbox
 *           key={user.id}
 *           checked={isSelected(user.id)}
 *           onCheckedChange={() => toggle(user.id)}
 *         />
 *       ))}
 *     </div>
 *   )
 * }
 * ```
 */
export function useBulkSelection<T>({
  getItemId,
  maxSelection,
  onSelectionChange,
}: BulkSelectionOptions<T>): BulkSelectionResult<T> {
  const [selectedIds, setSelectedIdsInternal] = useState<Set<string>>(new Set())

  const setSelection = useCallback((ids: Set<string>) => {
    const newIds = maxSelection ? new Set([...ids].slice(0, maxSelection)) : ids
    setSelectedIdsInternal(newIds)
    onSelectionChange?.(newIds)
  }, [maxSelection, onSelectionChange])

  const select = useCallback((id: string) => {
    setSelectedIdsInternal(prev => {
      if (maxSelection && prev.size >= maxSelection) {
        return prev
      }
      const newSet = new Set(prev)
      newSet.add(id)
      onSelectionChange?.(newSet)
      return newSet
    })
  }, [maxSelection, onSelectionChange])

  const deselect = useCallback((id: string) => {
    setSelectedIdsInternal(prev => {
      const newSet = new Set(prev)
      newSet.delete(id)
      onSelectionChange?.(newSet)
      return newSet
    })
  }, [onSelectionChange])

  const toggle = useCallback((id: string) => {
    setSelectedIdsInternal(prev => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        if (maxSelection && newSet.size >= maxSelection) {
          return prev
        }
        newSet.add(id)
      }
      onSelectionChange?.(newSet)
      return newSet
    })
  }, [maxSelection, onSelectionChange])

  const selectAll = useCallback((items: T[]) => {
    const ids = items.map(getItemId)
    const newSet = maxSelection
      ? new Set(ids.slice(0, maxSelection))
      : new Set(ids)
    setSelectedIdsInternal(newSet)
    onSelectionChange?.(newSet)
  }, [getItemId, maxSelection, onSelectionChange])

  const deselectAll = useCallback(() => {
    const newSet = new Set<string>()
    setSelectedIdsInternal(newSet)
    onSelectionChange?.(newSet)
  }, [onSelectionChange])

  const selectAcrossPages = useCallback((ids: string[]) => {
    const newSet = maxSelection
      ? new Set(ids.slice(0, maxSelection))
      : new Set(ids)
    setSelectedIdsInternal(newSet)
    onSelectionChange?.(newSet)
  }, [maxSelection, onSelectionChange])

  const isSelected = useCallback((id: string) => {
    return selectedIds.has(id)
  }, [selectedIds])

  const getSelectedItems = useCallback((items: T[]) => {
    return items.filter(item => selectedIds.has(getItemId(item)))
  }, [selectedIds, getItemId])

  const selectedCount = selectedIds.size

  const isMaxReached = useMemo(() => {
    return maxSelection !== undefined && selectedIds.size >= maxSelection
  }, [maxSelection, selectedIds.size])

  return {
    selectedIds,
    selectedCount,
    isAllSelected: false, // Must be computed with visible items
    isIndeterminate: false, // Must be computed with visible items
    isSelected,
    select,
    deselect,
    toggle,
    selectAll,
    deselectAll,
    selectAcrossPages,
    setSelection,
    getSelectedItems,
    isMaxReached,
  }
}

/**
 * Hook for managing bulk selection with awareness of visible items.
 * Extends useBulkSelection with proper isAllSelected and isIndeterminate calculation.
 */
export function useBulkSelectionWithVisibility<T>(
  options: BulkSelectionOptions<T> & { visibleItems: T[] }
): BulkSelectionResult<T> {
  const { visibleItems, ...bulkOptions } = options
  const baseResult = useBulkSelection(bulkOptions)

  const visibleIds = useMemo(() => {
    return new Set(visibleItems.map(options.getItemId))
  }, [visibleItems, options.getItemId])

  const selectedVisibleCount = useMemo(() => {
    let count = 0
    for (const id of visibleIds) {
      if (baseResult.selectedIds.has(id)) {
        count++
      }
    }
    return count
  }, [visibleIds, baseResult.selectedIds])

  const isAllSelected = visibleItems.length > 0 && selectedVisibleCount === visibleItems.length
  const isIndeterminate = selectedVisibleCount > 0 && selectedVisibleCount < visibleItems.length

  return {
    ...baseResult,
    isAllSelected,
    isIndeterminate,
  }
}

export default useBulkSelection
