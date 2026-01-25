/**
 * @prompt-id forge-v4.1:feature:bulk-operations:007
 * @generated-at 2026-01-25T00:00:00Z
 * @model claude-opus-4-5
 */

import { describe, it, expect, vi } from 'vitest'
import { renderHook, act } from "@testing-library/react"
import { useBulkSelection, useBulkSelectionWithVisibility } from "./use-bulk-selection"

interface TestItem {
  id: string
  name: string
}

const testItems: TestItem[] = [
  { id: "1", name: "Item 1" },
  { id: "2", name: "Item 2" },
  { id: "3", name: "Item 3" },
  { id: "4", name: "Item 4" },
  { id: "5", name: "Item 5" },
]

describe("useBulkSelection", () => {
  const getItemId = (item: TestItem) => item.id

  describe("initial state", () => {
    it("should start with empty selection", () => {
      const { result } = renderHook(() =>
        useBulkSelection({ getItemId })
      )

      expect(result.current.selectedIds.size).toBe(0)
      expect(result.current.selectedCount).toBe(0)
    })
  })

  describe("select", () => {
    it("should add item to selection", () => {
      const { result } = renderHook(() =>
        useBulkSelection({ getItemId })
      )

      act(() => {
        result.current.select("1")
      })

      expect(result.current.selectedIds.has("1")).toBe(true)
      expect(result.current.selectedCount).toBe(1)
    })

    it("should respect maxSelection limit", () => {
      const { result } = renderHook(() =>
        useBulkSelection({ getItemId, maxSelection: 2 })
      )

      act(() => {
        result.current.select("1")
        result.current.select("2")
        result.current.select("3") // Should be ignored
      })

      expect(result.current.selectedCount).toBe(2)
      expect(result.current.selectedIds.has("3")).toBe(false)
      expect(result.current.isMaxReached).toBe(true)
    })
  })

  describe("deselect", () => {
    it("should remove item from selection", () => {
      const { result } = renderHook(() =>
        useBulkSelection({ getItemId })
      )

      act(() => {
        result.current.select("1")
        result.current.select("2")
      })

      act(() => {
        result.current.deselect("1")
      })

      expect(result.current.selectedIds.has("1")).toBe(false)
      expect(result.current.selectedIds.has("2")).toBe(true)
      expect(result.current.selectedCount).toBe(1)
    })
  })

  describe("toggle", () => {
    it("should toggle selection state", () => {
      const { result } = renderHook(() =>
        useBulkSelection({ getItemId })
      )

      act(() => {
        result.current.toggle("1")
      })
      expect(result.current.selectedIds.has("1")).toBe(true)

      act(() => {
        result.current.toggle("1")
      })
      expect(result.current.selectedIds.has("1")).toBe(false)
    })

    it("should respect maxSelection when toggling on", () => {
      const { result } = renderHook(() =>
        useBulkSelection({ getItemId, maxSelection: 1 })
      )

      act(() => {
        result.current.toggle("1")
      })

      act(() => {
        result.current.toggle("2") // Should be ignored
      })

      expect(result.current.selectedIds.has("1")).toBe(true)
      expect(result.current.selectedIds.has("2")).toBe(false)
    })
  })

  describe("selectAll", () => {
    it("should select all provided items", () => {
      const { result } = renderHook(() =>
        useBulkSelection({ getItemId })
      )

      act(() => {
        result.current.selectAll(testItems)
      })

      expect(result.current.selectedCount).toBe(5)
      testItems.forEach(item => {
        expect(result.current.selectedIds.has(item.id)).toBe(true)
      })
    })

    it("should respect maxSelection", () => {
      const { result } = renderHook(() =>
        useBulkSelection({ getItemId, maxSelection: 3 })
      )

      act(() => {
        result.current.selectAll(testItems)
      })

      expect(result.current.selectedCount).toBe(3)
    })
  })

  describe("deselectAll", () => {
    it("should clear all selections", () => {
      const { result } = renderHook(() =>
        useBulkSelection({ getItemId })
      )

      act(() => {
        result.current.selectAll(testItems)
      })

      act(() => {
        result.current.deselectAll()
      })

      expect(result.current.selectedCount).toBe(0)
    })
  })

  describe("selectAcrossPages", () => {
    it("should select by IDs", () => {
      const { result } = renderHook(() =>
        useBulkSelection({ getItemId })
      )

      act(() => {
        result.current.selectAcrossPages(["1", "3", "5"])
      })

      expect(result.current.selectedCount).toBe(3)
      expect(result.current.selectedIds.has("1")).toBe(true)
      expect(result.current.selectedIds.has("2")).toBe(false)
      expect(result.current.selectedIds.has("3")).toBe(true)
    })
  })

  describe("isSelected", () => {
    it("should return correct selection status", () => {
      const { result } = renderHook(() =>
        useBulkSelection({ getItemId })
      )

      act(() => {
        result.current.select("1")
      })

      expect(result.current.isSelected("1")).toBe(true)
      expect(result.current.isSelected("2")).toBe(false)
    })
  })

  describe("getSelectedItems", () => {
    it("should return selected items from list", () => {
      const { result } = renderHook(() =>
        useBulkSelection({ getItemId })
      )

      act(() => {
        result.current.select("1")
        result.current.select("3")
      })

      const selectedItems = result.current.getSelectedItems(testItems)
      expect(selectedItems).toHaveLength(2)
      expect(selectedItems.map(i => i.id)).toEqual(["1", "3"])
    })
  })

  describe("onSelectionChange callback", () => {
    it("should call callback when selection changes", () => {
      const onSelectionChange = vi.fn()

      const { result } = renderHook(() =>
        useBulkSelection({ getItemId, onSelectionChange })
      )

      act(() => {
        result.current.select("1")
      })

      expect(onSelectionChange).toHaveBeenCalled()
      const callArg = onSelectionChange.mock.calls[0][0]
      expect(callArg.has("1")).toBe(true)
    })
  })
})

describe("useBulkSelectionWithVisibility", () => {
  const getItemId = (item: TestItem) => item.id

  it("should calculate isAllSelected correctly", () => {
    const visibleItems = testItems.slice(0, 3)

    const { result } = renderHook(() =>
      useBulkSelectionWithVisibility({
        getItemId,
        visibleItems,
      })
    )

    expect(result.current.isAllSelected).toBe(false)

    act(() => {
      result.current.selectAll(visibleItems)
    })

    expect(result.current.isAllSelected).toBe(true)
  })

  it("should calculate isIndeterminate correctly", () => {
    const visibleItems = testItems.slice(0, 3)

    const { result } = renderHook(() =>
      useBulkSelectionWithVisibility({
        getItemId,
        visibleItems,
      })
    )

    expect(result.current.isIndeterminate).toBe(false)

    act(() => {
      result.current.select("1")
    })

    expect(result.current.isIndeterminate).toBe(true)
    expect(result.current.isAllSelected).toBe(false)

    act(() => {
      result.current.select("2")
      result.current.select("3")
    })

    expect(result.current.isIndeterminate).toBe(false)
    expect(result.current.isAllSelected).toBe(true)
  })

  it("should handle empty visible items", () => {
    const { result } = renderHook(() =>
      useBulkSelectionWithVisibility({
        getItemId,
        visibleItems: [],
      })
    )

    expect(result.current.isAllSelected).toBe(false)
    expect(result.current.isIndeterminate).toBe(false)
  })
})
