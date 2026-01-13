import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  adminFetch,
  adminGet,
  adminPost,
  adminPatch,
  adminDelete,
  buildQueryString,
  AdminAuthError,
  AdminApiError
} from './admin-fetch'

// Mock global fetch
const mockFetch = vi.fn()
global.fetch = mockFetch

// Mock window.location
const mockLocation = {
  href: ''
}
Object.defineProperty(window, 'location', {
  value: mockLocation,
  writable: true
})

describe('admin-fetch', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockLocation.href = ''
  })

  describe('AdminAuthError', () => {
    it('should create error with default message', () => {
      const error = new AdminAuthError()
      expect(error.message).toBe('Unauthorized')
      expect(error.name).toBe('AdminAuthError')
    })

    it('should create error with custom message', () => {
      const error = new AdminAuthError('Custom auth error')
      expect(error.message).toBe('Custom auth error')
      expect(error.name).toBe('AdminAuthError')
    })

    it('should be instance of Error', () => {
      const error = new AdminAuthError()
      expect(error).toBeInstanceOf(Error)
    })
  })

  describe('AdminApiError', () => {
    it('should create error with message and status', () => {
      const error = new AdminApiError('Not found', 404)
      expect(error.message).toBe('Not found')
      expect(error.status).toBe(404)
      expect(error.name).toBe('AdminApiError')
    })

    it('should be instance of Error', () => {
      const error = new AdminApiError('Test error', 500)
      expect(error).toBeInstanceOf(Error)
    })

    it('should store status code', () => {
      const error = new AdminApiError('Forbidden', 403)
      expect(error.status).toBe(403)
    })
  })

  describe('adminFetch', () => {
    it('should include credentials by default', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ data: 'test' })
      })

      await adminFetch('http://localhost/api/admin/test')

      expect(mockFetch).toHaveBeenCalledWith('http://localhost/api/admin/test', expect.objectContaining({
        credentials: 'include'
      }))
    })

    it('should set Content-Type header', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ data: 'test' })
      })

      await adminFetch('http://localhost/api/admin/test')

      expect(mockFetch).toHaveBeenCalledWith('http://localhost/api/admin/test', expect.objectContaining({
        headers: expect.objectContaining({
          'Content-Type': 'application/json'
        })
      }))
    })

    it('should merge custom headers', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ data: 'test' })
      })

      await adminFetch('http://localhost/api/admin/test', {
        headers: {
          'X-Custom-Header': 'value'
        }
      })

      expect(mockFetch).toHaveBeenCalledWith('http://localhost/api/admin/test', expect.objectContaining({
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
          'X-Custom-Header': 'value'
        })
      }))
    })

    it('should return parsed JSON on success', async () => {
      const mockData = { id: '123', name: 'Test' }
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockData
      })

      const result = await adminFetch('http://localhost/api/admin/test')

      expect(result).toEqual(mockData)
    })

    it('should redirect on 401 status', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({ error: 'Unauthorized' })
      })

      await expect(adminFetch('http://localhost/api/admin/test')).rejects.toThrow(AdminAuthError)
      expect(mockLocation.href).toBe('/admin/login')
    })

    it('should throw AdminAuthError on 401', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({ error: 'Unauthorized' })
      })

      await expect(adminFetch('http://localhost/api/admin/test')).rejects.toThrow(AdminAuthError)
    })

    it('should throw AdminApiError on 404', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({ error: 'Not found' })
      })

      try {
        await adminFetch('http://localhost/api/admin/test')
        expect.fail('Should have thrown AdminApiError')
      } catch (error) {
        expect(error).toBeInstanceOf(AdminApiError)
        expect((error as AdminApiError).status).toBe(404)
        expect((error as AdminApiError).message).toBe('Not found')
      }
    })

    it('should throw AdminApiError on 500', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ error: 'Internal server error' })
      })

      try {
        await adminFetch('http://localhost/api/admin/test')
        expect.fail('Should have thrown AdminApiError')
      } catch (error) {
        expect(error).toBeInstanceOf(AdminApiError)
        expect((error as AdminApiError).status).toBe(500)
        expect((error as AdminApiError).message).toBe('Internal server error')
      }
    })

    it('should handle error response without JSON body', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => { throw new Error('Invalid JSON') }
      })

      try {
        await adminFetch('http://localhost/api/admin/test')
        expect.fail('Should have thrown AdminApiError')
      } catch (error) {
        expect(error).toBeInstanceOf(AdminApiError)
        expect((error as AdminApiError).message).toBe('Unknown error')
      }
    })

    it('should use default HTTP status message if no error in response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
        json: async () => ({})
      })

      try {
        await adminFetch('http://localhost/api/admin/test')
        expect.fail('Should have thrown AdminApiError')
      } catch (error) {
        expect(error).toBeInstanceOf(AdminApiError)
        expect((error as AdminApiError).message).toBe('HTTP 403')
      }
    })

    it('should pass through custom fetch options', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ data: 'test' })
      })

      await adminFetch('http://localhost/api/admin/test', {
        method: 'POST',
        body: JSON.stringify({ test: 'data' })
      })

      expect(mockFetch).toHaveBeenCalledWith('http://localhost/api/admin/test', expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ test: 'data' })
      }))
    })

    it('should support skipAuth option', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ data: 'test' })
      })

      await adminFetch('http://localhost/api/admin/test', { skipAuth: true })

      // skipAuth should not be passed to fetch
      expect(mockFetch).toHaveBeenCalledWith('http://localhost/api/admin/test', expect.not.objectContaining({
        skipAuth: true
      }))
    })
  })

  describe('adminGet', () => {
    it('should make GET request', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ data: 'test' })
      })

      await adminGet('http://localhost/api/admin/test')

      expect(mockFetch).toHaveBeenCalledWith('http://localhost/api/admin/test', expect.objectContaining({
        method: 'GET'
      }))
    })

    it('should return typed response', async () => {
      interface TestResponse {
        id: string
        name: string
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ id: '123', name: 'Test' })
      })

      const result = await adminGet<TestResponse>('http://localhost/api/admin/test')

      expect(result.id).toBe('123')
      expect(result.name).toBe('Test')
    })
  })

  describe('adminPost', () => {
    it('should make POST request with body', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ id: '123' })
      })

      const data = { name: 'Test', value: 42 }
      await adminPost('http://localhost/api/admin/test', data)

      expect(mockFetch).toHaveBeenCalledWith('http://localhost/api/admin/test', expect.objectContaining({
        method: 'POST',
        body: JSON.stringify(data)
      }))
    })

    it('should return typed response', async () => {
      interface CreateResponse {
        id: string
        created: boolean
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: async () => ({ id: '123', created: true })
      })

      const result = await adminPost<CreateResponse>('http://localhost/api/admin/test', {})

      expect(result.id).toBe('123')
      expect(result.created).toBe(true)
    })
  })

  describe('adminPatch', () => {
    it('should make PATCH request with body', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ updated: true })
      })

      const data = { name: 'Updated' }
      await adminPatch('/api/admin/test/123', data)

      expect(mockFetch).toHaveBeenCalledWith('/api/admin/test/123', expect.objectContaining({
        method: 'PATCH',
        body: JSON.stringify(data)
      }))
    })

    it('should return typed response', async () => {
      interface UpdateResponse {
        id: string
        updated: boolean
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ id: '123', updated: true })
      })

      const result = await adminPatch<UpdateResponse>('/api/admin/test/123', {})

      expect(result.id).toBe('123')
      expect(result.updated).toBe(true)
    })
  })

  describe('adminDelete', () => {
    it('should make DELETE request', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ deleted: true })
      })

      await adminDelete('/api/admin/test/123')

      expect(mockFetch).toHaveBeenCalledWith('/api/admin/test/123', expect.objectContaining({
        method: 'DELETE'
      }))
    })

    it('should return typed response', async () => {
      interface DeleteResponse {
        id: string
        deleted: boolean
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ id: '123', deleted: true })
      })

      const result = await adminDelete<DeleteResponse>('/api/admin/test/123')

      expect(result.id).toBe('123')
      expect(result.deleted).toBe(true)
    })
  })

  describe('buildQueryString', () => {
    it('should build query string from params', () => {
      const params = {
        page: 1,
        limit: 20,
        search: 'test'
      }

      const result = buildQueryString(params)

      expect(result).toBe('?page=1&limit=20&search=test')
    })

    it('should filter out undefined values', () => {
      const params = {
        page: 1,
        limit: undefined,
        search: 'test'
      }

      const result = buildQueryString(params)

      expect(result).toBe('?page=1&search=test')
    })

    it('should filter out null values', () => {
      const params = {
        page: 1,
        limit: null,
        search: 'test'
      }

      const result = buildQueryString(params)

      expect(result).toBe('?page=1&search=test')
    })

    it('should filter out empty strings', () => {
      const params = {
        page: 1,
        limit: 20,
        search: ''
      }

      const result = buildQueryString(params)

      expect(result).toBe('?page=1&limit=20')
    })

    it('should URL encode parameter values', () => {
      const params = {
        search: 'test query',
        filter: 'a&b=c'
      }

      const result = buildQueryString(params)

      expect(result).toContain('search=test%20query')
      expect(result).toContain('filter=a%26b%3Dc')
    })

    it('should handle boolean values', () => {
      const params = {
        active: true,
        archived: false
      }

      const result = buildQueryString(params)

      expect(result).toBe('?active=true&archived=false')
    })

    it('should handle numeric values', () => {
      const params = {
        page: 5,
        limit: 100,
        count: 0
      }

      const result = buildQueryString(params)

      expect(result).toBe('?page=5&limit=100&count=0')
    })

    it('should return empty string for empty params', () => {
      const result = buildQueryString({})

      expect(result).toBe('')
    })

    it('should return empty string when all values filtered', () => {
      const params = {
        a: undefined,
        b: null,
        c: ''
      }

      const result = buildQueryString(params)

      expect(result).toBe('')
    })

    it('should handle special characters in keys', () => {
      const params = {
        'special-key': 'value',
        'another_key': 'test'
      }

      const result = buildQueryString(params)

      expect(result).toContain('special-key=value')
      expect(result).toContain('another_key=test')
    })
  })

  describe('Authentication Flow', () => {
    it('should include credentials for authenticated requests', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ data: 'test' })
      })

      await adminGet('/api/admin/analytics')

      expect(mockFetch).toHaveBeenCalledWith('/api/admin/analytics', expect.objectContaining({
        credentials: 'include'
      }))
    })

    it('should redirect to login after 401 response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({ error: 'Session expired' })
      })

      await expect(adminPost('http://localhost/api/admin/test', {})).rejects.toThrow(AdminAuthError)
      expect(mockLocation.href).toBe('/admin/login')
    })

    it('should handle multiple requests with same session', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ data: 'test' })
      })

      await adminGet('/api/admin/test1')
      await adminGet('/api/admin/test2')
      await adminGet('/api/admin/test3')

      expect(mockFetch).toHaveBeenCalledTimes(3)
      expect(mockFetch).toHaveBeenNthCalledWith(1, '/api/admin/test1', expect.objectContaining({
        credentials: 'include'
      }))
      expect(mockFetch).toHaveBeenNthCalledWith(2, '/api/admin/test2', expect.objectContaining({
        credentials: 'include'
      }))
      expect(mockFetch).toHaveBeenNthCalledWith(3, '/api/admin/test3', expect.objectContaining({
        credentials: 'include'
      }))
    })
  })

  describe('Error Handling Edge Cases', () => {
    it('should handle 403 Forbidden', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
        json: async () => ({ error: 'Insufficient permissions' })
      })

      try {
        await adminGet('/api/admin/restricted')
        expect.fail('Should have thrown AdminApiError')
      } catch (error) {
        expect(error).toBeInstanceOf(AdminApiError)
        expect((error as AdminApiError).status).toBe(403)
      }
    })

    it('should handle network errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'))

      await expect(adminGet('http://localhost/api/admin/test')).rejects.toThrow('Network error')
    })

    it('should handle timeout errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Request timeout'))

      await expect(adminGet('http://localhost/api/admin/test')).rejects.toThrow('Request timeout')
    })
  })
})
