/**
 * Admin API fetch wrapper with proper authentication and error handling
 */

export class AdminAuthError extends Error {
  constructor(message: string = "Unauthorized") {
    super(message)
    this.name = "AdminAuthError"
  }
}

export class AdminApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = "AdminApiError"
    this.status = status
  }
}

interface FetchOptions extends RequestInit {
  skipAuth?: boolean
}

/**
 * Wrapper for admin API calls that handles authentication properly
 */
export async function adminFetch<T = unknown>(
  url: string,
  options: FetchOptions = {}
): Promise<T> {
  const { skipAuth, ...fetchOptions } = options

  const response = await fetch(url, {
    ...fetchOptions,
    credentials: "include", // Always include cookies
    headers: {
      "Content-Type": "application/json",
      ...fetchOptions.headers,
    },
  })

  if (response.status === 401) {
    // Redirect to login on auth failure
    if (typeof window !== "undefined") {
      window.location.href = "/admin/login"
    }
    throw new AdminAuthError()
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: "Unknown error" }))
    throw new AdminApiError(errorData.error || `HTTP ${response.status}`, response.status)
  }

  return response.json()
}

/**
 * GET request wrapper
 */
export async function adminGet<T = unknown>(url: string): Promise<T> {
  return adminFetch<T>(url, { method: "GET" })
}

/**
 * POST request wrapper
 */
export async function adminPost<T = unknown>(url: string, data: unknown): Promise<T> {
  return adminFetch<T>(url, {
    method: "POST",
    body: JSON.stringify(data),
  })
}

/**
 * PATCH request wrapper
 */
export async function adminPatch<T = unknown>(url: string, data: unknown): Promise<T> {
  return adminFetch<T>(url, {
    method: "PATCH",
    body: JSON.stringify(data),
  })
}

/**
 * DELETE request wrapper
 */
export async function adminDelete<T = unknown>(url: string): Promise<T> {
  return adminFetch<T>(url, { method: "DELETE" })
}

/**
 * Build query string from params object
 */
export function buildQueryString(params: Record<string, string | number | boolean | undefined | null>): string {
  const filtered = Object.entries(params)
    .filter(([, value]) => value !== undefined && value !== null && value !== "")
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)

  return filtered.length > 0 ? `?${filtered.join("&")}` : ""
}
