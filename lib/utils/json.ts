/**
 * Safely parse JSON string, handling empty strings and invalid JSON
 * @param jsonString - The JSON string to parse
 * @param fallback - Value to return if parsing fails or string is empty (default: null)
 * @returns Parsed JSON object or fallback value
 */
export function safeJsonParse<T = unknown>(
  jsonString: string | null | undefined,
  fallback: T | null = null
): T | null {
  if (!jsonString || typeof jsonString !== 'string') {
    return fallback
  }

  const trimmed = jsonString.trim()
  if (trimmed === '') {
    return fallback
  }

  try {
    return JSON.parse(trimmed) as T
  } catch (error) {
    console.error('Failed to parse JSON:', error)
    return fallback
  }
}

/**
 * Safely parse JSON string with error throwing for validation
 * @param jsonString - The JSON string to parse
 * @param fieldName - Name of the field for error messages
 * @returns Parsed JSON object
 * @throws Error if JSON is invalid
 */
export function parseJsonOrThrow<T = unknown>(
  jsonString: string | null | undefined,
  fieldName = 'JSON'
): T {
  if (!jsonString || typeof jsonString !== 'string') {
    throw new Error(`${fieldName} is required`)
  }

  const trimmed = jsonString.trim()
  if (trimmed === '') {
    throw new Error(`${fieldName} cannot be empty`)
  }

  try {
    return JSON.parse(trimmed) as T
  } catch (error) {
    throw new Error(`Invalid JSON format for ${fieldName}: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Check if a string is valid JSON without parsing it
 * @param jsonString - The JSON string to validate
 * @returns true if valid JSON, false otherwise
 */
export function isValidJson(jsonString: string | null | undefined): boolean {
  if (!jsonString || typeof jsonString !== 'string') {
    return false
  }

  const trimmed = jsonString.trim()
  if (trimmed === '') {
    return false
  }

  try {
    JSON.parse(trimmed)
    return true
  } catch {
    return false
  }
}
