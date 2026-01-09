"use client"

import { useState, useCallback } from 'react'
import { useCurrentOrg } from './use-organization'

/**
 * API Key details
 */
export interface ApiKey {
  id: string
  name: string
  keyPrefix: string
  permissions: string[]
  rateLimit: number
  expiresAt: string | null
  lastUsedAt: string | null
  createdAt: string
}

/**
 * Full API key (only shown once on creation)
 */
export interface ApiKeyWithSecret extends ApiKey {
  key: string
}

interface CreateApiKeyInput {
  name: string
  permissions: string[]
  rateLimit?: number
  expiresAt?: string
}

/**
 * Hook for managing API keys.
 *
 * @example
 * ```tsx
 * function ApiKeysPage() {
 *   const { apiKeys, createApiKey, revokeApiKey, fetchApiKeys } = useApiKeys()
 *
 *   useEffect(() => {
 *     fetchApiKeys()
 *   }, [fetchApiKeys])
 *
 *   const handleCreate = async () => {
 *     const newKey = await createApiKey({
 *       name: 'Production Key',
 *       permissions: ['agents:read', 'agents:execute'],
 *     })
 *     // Show newKey.key to user ONCE
 *   }
 * }
 * ```
 */
export function useApiKeys() {
  const { org } = useCurrentOrg()
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchApiKeys = useCallback(async () => {
    if (!org) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/v1/api-keys', {
        headers: { 'x-organization-id': org.id },
      })

      if (!response.ok) throw new Error('Failed to fetch API keys')

      const data = await response.json()
      setApiKeys(data.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setIsLoading(false)
    }
  }, [org])

  const createApiKey = useCallback(async (input: CreateApiKeyInput): Promise<ApiKeyWithSecret> => {
    if (!org) throw new Error('No organization selected')

    const response = await fetch('/api/v1/api-keys', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-organization-id': org.id,
      },
      body: JSON.stringify(input),
    })

    if (!response.ok) {
      const data = await response.json()
      throw new Error(data.error || 'Failed to create API key')
    }

    const { data } = await response.json()
    // Add to list without the secret key
    const { key, ...keyWithoutSecret } = data
    setApiKeys(prev => [keyWithoutSecret, ...prev])
    return data as ApiKeyWithSecret
  }, [org])

  const revokeApiKey = useCallback(async (keyId: string) => {
    if (!org) throw new Error('No organization selected')

    const response = await fetch(`/api/v1/api-keys/${keyId}`, {
      method: 'DELETE',
      headers: { 'x-organization-id': org.id },
    })

    if (!response.ok) {
      const data = await response.json()
      throw new Error(data.error || 'Failed to revoke API key')
    }

    setApiKeys(prev => prev.filter(k => k.id !== keyId))
  }, [org])

  return {
    apiKeys,
    isLoading,
    error,
    fetchApiKeys,
    createApiKey,
    revokeApiKey,
  }
}
