"use client"

import { useState, useCallback } from 'react'
import { useCurrentOrg } from './use-organization'
import type { Agent, AgentWithDetails, CreateAgentInput, UpdateAgentInput, RunAgentInput, PaginatedResponse } from '@/types'

interface UseAgentsOptions {
  page?: number
  limit?: number
  status?: string
  type?: string
}

export function useAgents(options: UseAgentsOptions = {}) {
  const { org } = useCurrentOrg()
  const [agents, setAgents] = useState<AgentWithDetails[]>([])
  const [meta, setMeta] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchAgents = useCallback(async () => {
    if (!org) return

    setIsLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams()
      if (options.page) params.set('page', options.page.toString())
      if (options.limit) params.set('limit', options.limit.toString())
      if (options.status) params.set('status', options.status)
      if (options.type) params.set('type', options.type)

      const response = await fetch(`/api/v1/agents?${params}`, {
        headers: { 'x-organization-id': org.id },
      })

      if (!response.ok) throw new Error('Failed to fetch agents')

      const data: PaginatedResponse<AgentWithDetails> = await response.json()
      setAgents(data.data)
      setMeta(data.meta)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setIsLoading(false)
    }
  }, [org, options.page, options.limit, options.status, options.type])

  const createAgent = useCallback(async (input: CreateAgentInput) => {
    if (!org) throw new Error('No organization selected')

    const response = await fetch('/api/v1/agents', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-organization-id': org.id,
      },
      body: JSON.stringify(input),
    })

    if (!response.ok) {
      const data = await response.json()
      throw new Error(data.error || 'Failed to create agent')
    }

    const { data } = await response.json()
    setAgents(prev => [data, ...prev])
    return data as AgentWithDetails
  }, [org])

  const updateAgent = useCallback(async (id: string, input: UpdateAgentInput) => {
    if (!org) throw new Error('No organization selected')

    const response = await fetch(`/api/v1/agents/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'x-organization-id': org.id,
      },
      body: JSON.stringify(input),
    })

    if (!response.ok) {
      const data = await response.json()
      throw new Error(data.error || 'Failed to update agent')
    }

    const { data } = await response.json()
    setAgents(prev => prev.map(a => a.id === id ? data : a))
    return data as AgentWithDetails
  }, [org])

  const deleteAgent = useCallback(async (id: string) => {
    if (!org) throw new Error('No organization selected')

    const response = await fetch(`/api/v1/agents/${id}`, {
      method: 'DELETE',
      headers: { 'x-organization-id': org.id },
    })

    if (!response.ok) {
      const data = await response.json()
      throw new Error(data.error || 'Failed to delete agent')
    }

    setAgents(prev => prev.filter(a => a.id !== id))
  }, [org])

  const runAgent = useCallback(async (id: string, input: RunAgentInput) => {
    if (!org) throw new Error('No organization selected')

    const response = await fetch(`/api/v1/agents/${id}/run`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-organization-id': org.id,
      },
      body: JSON.stringify(input),
    })

    if (!response.ok) {
      const data = await response.json()
      throw new Error(data.error || 'Failed to run agent')
    }

    return await response.json()
  }, [org])

  return {
    agents,
    meta,
    isLoading,
    error,
    fetchAgents,
    createAgent,
    updateAgent,
    deleteAgent,
    runAgent,
  }
}

export function useAgent(id: string) {
  const { org } = useCurrentOrg()
  const [agent, setAgent] = useState<AgentWithDetails | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchAgent = useCallback(async () => {
    if (!org || !id) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/v1/agents/${id}`, {
        headers: { 'x-organization-id': org.id },
      })

      if (!response.ok) throw new Error('Failed to fetch agent')

      const { data } = await response.json()
      setAgent(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setIsLoading(false)
    }
  }, [org, id])

  return {
    agent,
    isLoading,
    error,
    fetchAgent,
  }
}
