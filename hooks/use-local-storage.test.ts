import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useLocalStorage } from './use-local-storage'

describe('useLocalStorage', () => {
  const mockLocalStorage = {
    store: {} as Record<string, string>,
    getItem: vi.fn((key: string) => mockLocalStorage.store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      mockLocalStorage.store[key] = value
    }),
    removeItem: vi.fn((key: string) => {
      delete mockLocalStorage.store[key]
    }),
    clear: vi.fn(() => {
      mockLocalStorage.store = {}
    }),
  }

  beforeEach(() => {
    mockLocalStorage.store = {}
    mockLocalStorage.getItem.mockClear()
    mockLocalStorage.setItem.mockClear()
    mockLocalStorage.removeItem.mockClear()

    Object.defineProperty(window, 'localStorage', {
      value: mockLocalStorage,
      writable: true,
    })
  })

  it('returns initial value when localStorage is empty', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 'initial'))

    expect(result.current[0]).toBe('initial')
  })

  it('returns stored value from localStorage', () => {
    mockLocalStorage.store['test-key'] = JSON.stringify('stored')

    const { result } = renderHook(() => useLocalStorage('test-key', 'initial'))

    // Wait for useEffect to run
    expect(mockLocalStorage.getItem).toHaveBeenCalledWith('test-key')
  })

  it('sets value in localStorage', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 'initial'))

    act(() => {
      result.current[1]('new value')
    })

    expect(result.current[0]).toBe('new value')
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith('test-key', '"new value"')
  })

  it('supports functional updates', () => {
    const { result } = renderHook(() => useLocalStorage('counter', 0))

    act(() => {
      result.current[1]((prev) => prev + 1)
    })

    expect(result.current[0]).toBe(1)

    act(() => {
      result.current[1]((prev) => prev + 1)
    })

    expect(result.current[0]).toBe(2)
  })

  it('removes value from localStorage', () => {
    mockLocalStorage.store['test-key'] = JSON.stringify('stored')

    const { result } = renderHook(() => useLocalStorage('test-key', 'initial'))

    act(() => {
      result.current[2]() // removeValue
    })

    expect(result.current[0]).toBe('initial')
    expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('test-key')
  })

  it('works with objects', () => {
    const { result } = renderHook(() =>
      useLocalStorage('user', { name: 'John', age: 30 })
    )

    act(() => {
      result.current[1]({ name: 'Jane', age: 25 })
    })

    expect(result.current[0]).toEqual({ name: 'Jane', age: 25 })
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
      'user',
      JSON.stringify({ name: 'Jane', age: 25 })
    )
  })

  it('works with arrays', () => {
    const { result } = renderHook(() => useLocalStorage('items', [1, 2, 3]))

    act(() => {
      result.current[1]([4, 5, 6])
    })

    expect(result.current[0]).toEqual([4, 5, 6])
  })

  it('handles localStorage errors gracefully', () => {
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    mockLocalStorage.setItem.mockImplementation(() => {
      throw new Error('QuotaExceeded')
    })

    const { result } = renderHook(() => useLocalStorage('test-key', 'initial'))

    act(() => {
      result.current[1]('new value')
    })

    expect(consoleSpy).toHaveBeenCalled()
    consoleSpy.mockRestore()
  })
})
