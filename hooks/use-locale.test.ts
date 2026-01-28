import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useLocalePreference } from './use-locale'
import { server } from '@/tests/mocks/server'
import { http, HttpResponse } from 'msw'

// Mock next/navigation
const mockRefresh = vi.fn()
const mockRouter = {
  refresh: mockRefresh,
}

vi.mock('next/navigation', () => ({
  useRouter: () => mockRouter,
}))

describe('useLocalePreference', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockRefresh.mockClear()
  })

  it('should initialize with default locale', async () => {
    server.use(
      http.get('/api/settings/language', () => {
        return HttpResponse.json({ locale: 'en' })
      })
    )

    const { result } = renderHook(() => useLocalePreference())

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.locale).toBe('en')
  })

  it('should fetch locale from API on mount', async () => {
    server.use(
      http.get('/api/settings/language', () => {
        return HttpResponse.json({ locale: 'es' })
      })
    )

    const { result } = renderHook(() => useLocalePreference())

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.locale).toBe('es')
  })

  it('should handle API fetch error gracefully', async () => {
    server.use(
      http.get('/api/settings/language', () => {
        return HttpResponse.error()
      })
    )

    const { result } = renderHook(() => useLocalePreference())

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    // Should still have default locale
    expect(result.current.locale).toBe('en')
  })

  it('should handle invalid locale from API', async () => {
    server.use(
      http.get('/api/settings/language', () => {
        return HttpResponse.json({ locale: 'invalid-locale' })
      })
    )

    const { result } = renderHook(() => useLocalePreference())

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    // Should keep default locale if invalid
    expect(result.current.locale).toBe('en')
  })

  it('should set locale successfully', async () => {
    server.use(
      http.get('/api/settings/language', () => {
        return HttpResponse.json({ locale: 'en' })
      }),
      http.post('/api/settings/language', () => {
        return HttpResponse.json({})
      })
    )

    const { result } = renderHook(() => useLocalePreference())

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    const setLocaleResult = await result.current.setLocale('en')

    expect(setLocaleResult).toBe(true)
    expect(mockRefresh).toHaveBeenCalled()
    expect(result.current.locale).toBe('en')
  })

  it('should handle setLocale API error', async () => {
    server.use(
      http.get('/api/settings/language', () => {
        return HttpResponse.json({ locale: 'en' })
      }),
      http.post('/api/settings/language', () => {
        return HttpResponse.error()
      })
    )

    const { result } = renderHook(() => useLocalePreference())

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    const setLocaleResult = await result.current.setLocale('es')

    expect(setLocaleResult).toBe(false)
    expect(result.current.locale).toBe('en') // Should not change on error
  })

  it('should handle setLocale API failure response', async () => {
    server.use(
      http.get('/api/settings/language', () => {
        return HttpResponse.json({ locale: 'en' })
      }),
      http.post('/api/settings/language', () => {
        return HttpResponse.json({}, { status: 400 })
      })
    )

    const { result } = renderHook(() => useLocalePreference())

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    const setLocaleResult = await result.current.setLocale('es')

    expect(setLocaleResult).toBe(false)
    expect(result.current.locale).toBe('en') // Should not change on failure
  })

  it('should show loading state initially', () => {
    server.use(
      http.get('/api/settings/language', () => {
        return new Promise(() => {
          // Never resolves to keep loading state
        })
      })
    )

    const { result } = renderHook(() => useLocalePreference())

    expect(result.current.isLoading).toBe(true)
  })
})
