"use client"

import { useState, useEffect } from 'react'

/**
 * Hook for debouncing a value.
 * Useful for search inputs and other frequent updates.
 *
 * @param value - The value to debounce
 * @param delay - Delay in milliseconds (default: 500ms)
 * @returns The debounced value
 *
 * @example
 * ```tsx
 * function SearchInput() {
 *   const [query, setQuery] = useState('')
 *   const debouncedQuery = useDebounce(query, 300)
 *
 *   useEffect(() => {
 *     if (debouncedQuery) {
 *       searchApi(debouncedQuery)
 *     }
 *   }, [debouncedQuery])
 *
 *   return <input value={query} onChange={(e) => setQuery(e.target.value)} />
 * }
 * ```
 */
export function useDebounce<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(timer)
    }
  }, [value, delay])

  return debouncedValue
}
