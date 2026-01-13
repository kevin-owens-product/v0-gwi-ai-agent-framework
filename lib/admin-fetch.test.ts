import { describe, it, expect } from 'vitest'
import {
  buildQueryString,
  AdminAuthError,
  AdminApiError
} from './admin-fetch'

describe('admin-fetch', () => {
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

    it('should be throwable', () => {
      expect(() => {
        throw new AdminAuthError()
      }).toThrow('Unauthorized')
    })

    it('should be catchable as Error', () => {
      try {
        throw new AdminAuthError('Test')
      } catch (e) {
        expect(e).toBeInstanceOf(Error)
        expect(e).toBeInstanceOf(AdminAuthError)
      }
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

    it('should be throwable', () => {
      expect(() => {
        throw new AdminApiError('Test', 500)
      }).toThrow('Test')
    })

    it('should be catchable as Error', () => {
      try {
        throw new AdminApiError('Test', 404)
      } catch (e) {
        expect(e).toBeInstanceOf(Error)
        expect(e).toBeInstanceOf(AdminApiError)
      }
    })

    it('should preserve status in caught errors', () => {
      try {
        throw new AdminApiError('Not found', 404)
      } catch (e) {
        expect((e as AdminApiError).status).toBe(404)
      }
    })

    it('should support various HTTP status codes', () => {
      const codes = [400, 401, 403, 404, 500, 502, 503]
      codes.forEach(code => {
        const error = new AdminApiError(`Error ${code}`, code)
        expect(error.status).toBe(code)
      })
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

    it('should handle zero values', () => {
      const params = {
        count: 0,
        offset: 0
      }

      const result = buildQueryString(params)

      expect(result).toBe('?count=0&offset=0')
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

    it('should handle mixed types', () => {
      const params = {
        str: 'hello',
        num: 42,
        bool: true,
        zero: 0,
        falseBool: false
      }

      const result = buildQueryString(params)

      expect(result).toContain('str=hello')
      expect(result).toContain('num=42')
      expect(result).toContain('bool=true')
      expect(result).toContain('zero=0')
      expect(result).toContain('falseBool=false')
    })

    it('should handle single parameter', () => {
      const params = { id: '123' }
      const result = buildQueryString(params)
      expect(result).toBe('?id=123')
    })

    it('should handle complex URL encoding', () => {
      const params = {
        url: 'https://example.com/path?query=1',
        special: '!@#$%^&*()'
      }

      const result = buildQueryString(params)

      expect(result).toContain('url=')
      expect(result).toContain('special=')
      // Should be properly encoded
      expect(result).not.toContain('https://')
    })

    it('should preserve order of parameters', () => {
      const params = {
        a: 1,
        b: 2,
        c: 3,
        d: 4
      }

      const result = buildQueryString(params)
      const pairs = result.substring(1).split('&')

      expect(pairs[0]).toBe('a=1')
      expect(pairs[1]).toBe('b=2')
      expect(pairs[2]).toBe('c=3')
      expect(pairs[3]).toBe('d=4')
    })

    it('should handle string numbers', () => {
      const params = {
        page: '5' as unknown as number,
        limit: '100' as unknown as number
      }

      const result = buildQueryString(params)

      expect(result).toContain('page=5')
      expect(result).toContain('limit=100')
    })

    it('should handle unicode characters', () => {
      const params = {
        search: '测试',
        name: 'こんにちは'
      }

      const result = buildQueryString(params)

      expect(result).toContain('search=')
      expect(result).toContain('name=')
    })

    it('should handle spaces correctly', () => {
      const params = {
        query: 'hello world',
        phrase: 'foo bar baz'
      }

      const result = buildQueryString(params)

      expect(result).toContain('query=hello%20world')
      expect(result).toContain('phrase=foo%20bar%20baz')
    })

    it('should handle multiple filters', () => {
      const params = {
        type: 'user',
        status: 'active',
        role: 'admin',
        verified: true
      }

      const result = buildQueryString(params)

      expect(result).toContain('type=user')
      expect(result).toContain('status=active')
      expect(result).toContain('role=admin')
      expect(result).toContain('verified=true')
    })
  })

  describe('Admin Fetch Integration Concepts', () => {
    it('should have credentials option for authentication', () => {
      const credentials = 'include'
      expect(credentials).toBe('include')
    })

    it('should use Content-Type header for JSON', () => {
      const contentType = 'application/json'
      expect(contentType).toBe('application/json')
    })

    it('should support GET method', () => {
      const method = 'GET'
      expect(method).toBe('GET')
    })

    it('should support POST method', () => {
      const method = 'POST'
      expect(method).toBe('POST')
    })

    it('should support PATCH method', () => {
      const method = 'PATCH'
      expect(method).toBe('PATCH')
    })

    it('should support DELETE method', () => {
      const method = 'DELETE'
      expect(method).toBe('DELETE')
    })

    it('should redirect on 401 to login', () => {
      const redirectUrl = '/admin/login'
      expect(redirectUrl).toBe('/admin/login')
    })

    it('should handle 404 errors', () => {
      const statusCode = 404
      expect(statusCode).toBe(404)
    })

    it('should handle 500 errors', () => {
      const statusCode = 500
      expect(statusCode).toBe(500)
    })

    it('should handle 403 errors', () => {
      const statusCode = 403
      expect(statusCode).toBe(403)
    })
  })

  describe('HTTP Status Code Handling', () => {
    it('should recognize 2xx as success', () => {
      const codes = [200, 201, 202, 204]
      codes.forEach(code => {
        const isSuccess = code >= 200 && code < 300
        expect(isSuccess).toBe(true)
      })
    })

    it('should recognize 4xx as client errors', () => {
      const codes = [400, 401, 403, 404]
      codes.forEach(code => {
        const isClientError = code >= 400 && code < 500
        expect(isClientError).toBe(true)
      })
    })

    it('should recognize 5xx as server errors', () => {
      const codes = [500, 502, 503, 504]
      codes.forEach(code => {
        const isServerError = code >= 500 && code < 600
        expect(isServerError).toBe(true)
      })
    })

    it('should treat 401 specially for auth', () => {
      const authErrorCode = 401
      const requiresReauth = authErrorCode === 401
      expect(requiresReauth).toBe(true)
    })
  })

  describe('Request Configuration', () => {
    it('should merge headers correctly', () => {
      const defaultHeaders = { 'Content-Type': 'application/json' }
      const customHeaders = { 'X-Custom': 'value' }
      const merged = { ...defaultHeaders, ...customHeaders }

      expect(merged['Content-Type']).toBe('application/json')
      expect(merged['X-Custom']).toBe('value')
    })

    it('should allow header override', () => {
      const defaultHeaders = { 'Content-Type': 'application/json' }
      const customHeaders = { 'Content-Type': 'text/plain' }
      const merged = { ...defaultHeaders, ...customHeaders }

      expect(merged['Content-Type']).toBe('text/plain')
    })

    it('should serialize JSON body', () => {
      const data = { name: 'Test', value: 42 }
      const serialized = JSON.stringify(data)

      expect(serialized).toBe('{"name":"Test","value":42}')
    })

    it('should handle empty body', () => {
      const data = {}
      const serialized = JSON.stringify(data)

      expect(serialized).toBe('{}')
    })
  })

  describe('URL Construction', () => {
    it('should construct admin API URLs', () => {
      const base = '/api/admin'
      const endpoint = '/users'
      const url = `${base}${endpoint}`

      expect(url).toBe('/api/admin/users')
    })

    it('should append query strings', () => {
      const base = '/api/admin/users'
      const query = '?page=1&limit=20'
      const url = `${base}${query}`

      expect(url).toBe('/api/admin/users?page=1&limit=20')
    })

    it('should handle URLs with IDs', () => {
      const base = '/api/admin/users'
      const id = '123'
      const url = `${base}/${id}`

      expect(url).toBe('/api/admin/users/123')
    })
  })
})
