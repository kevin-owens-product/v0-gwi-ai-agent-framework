import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useDebounce } from './use-debounce'

describe('useDebounce', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('initial', 500))

    expect(result.current).toBe('initial')
  })

  it('debounces value changes', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 500),
      { initialProps: { value: 'initial' } }
    )

    expect(result.current).toBe('initial')

    // Update value
    rerender({ value: 'updated' })

    // Value should not change immediately
    expect(result.current).toBe('initial')

    // Fast-forward time
    act(() => {
      vi.advanceTimersByTime(500)
    })

    // Now value should be updated
    expect(result.current).toBe('updated')
  })

  it('uses default delay of 500ms', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value),
      { initialProps: { value: 'initial' } }
    )

    rerender({ value: 'updated' })

    act(() => {
      vi.advanceTimersByTime(499)
    })
    expect(result.current).toBe('initial')

    act(() => {
      vi.advanceTimersByTime(1)
    })
    expect(result.current).toBe('updated')
  })

  it('cancels pending debounce on new value', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 500),
      { initialProps: { value: 'initial' } }
    )

    rerender({ value: 'first' })

    act(() => {
      vi.advanceTimersByTime(300)
    })

    // Update again before debounce completes
    rerender({ value: 'second' })

    act(() => {
      vi.advanceTimersByTime(300)
    })

    // Should still show initial because second debounce hasn't completed
    expect(result.current).toBe('initial')

    act(() => {
      vi.advanceTimersByTime(200)
    })

    // Now should show 'second', not 'first'
    expect(result.current).toBe('second')
  })

  it('works with different types', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 100),
      { initialProps: { value: 42 } }
    )

    expect(result.current).toBe(42)

    rerender({ value: 100 })

    act(() => {
      vi.advanceTimersByTime(100)
    })

    expect(result.current).toBe(100)
  })

  it('works with objects', () => {
    const initial = { name: 'test' }
    const updated = { name: 'updated' }

    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 100),
      { initialProps: { value: initial } }
    )

    expect(result.current).toEqual(initial)

    rerender({ value: updated })

    act(() => {
      vi.advanceTimersByTime(100)
    })

    expect(result.current).toEqual(updated)
  })
})
