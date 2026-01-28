/**
 * GWI API Client Utilities
 * 
 * Provides authenticated fetch wrappers for GWI API endpoints
 * Ensures credentials are included in all requests
 */

/**
 * Authenticated fetch wrapper for GWI API endpoints
 * Automatically includes credentials and handles errors
 */
export async function gwiFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const response = await fetch(url, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })

  if (!response.ok) {
    // Try to parse error message
    let errorMessage = `Request failed with status ${response.status}`
    try {
      const errorData = await response.json()
      errorMessage = errorData.error || errorMessage
    } catch {
      // If response is not JSON, use default message
    }

    // Throw error with status and message
    const error = new Error(errorMessage) as Error & { status: number }
    error.status = response.status
    throw error
  }

  return response
}

/**
 * GET request helper
 */
export async function gwiGet<T = unknown>(url: string): Promise<T> {
  const response = await gwiFetch(url, { method: 'GET' })
  return response.json()
}

/**
 * POST request helper
 */
export async function gwiPost<T = unknown>(
  url: string,
  data: unknown
): Promise<T> {
  const response = await gwiFetch(url, {
    method: 'POST',
    body: JSON.stringify(data),
  })
  return response.json()
}

/**
 * PATCH request helper
 */
export async function gwiPatch<T = unknown>(
  url: string,
  data: unknown
): Promise<T> {
  const response = await gwiFetch(url, {
    method: 'PATCH',
    body: JSON.stringify(data),
  })
  return response.json()
}

/**
 * PUT request helper
 */
export async function gwiPut<T = unknown>(
  url: string,
  data: unknown
): Promise<T> {
  const response = await gwiFetch(url, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
  return response.json()
}

/**
 * DELETE request helper
 */
export async function gwiDelete<T = unknown>(url: string): Promise<T> {
  const response = await gwiFetch(url, { method: 'DELETE' })
  return response.json()
}
