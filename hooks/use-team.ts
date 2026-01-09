"use client"

import { useState, useCallback } from 'react'
import { useCurrentOrg } from './use-organization'

/**
 * Team member with user details
 */
export interface TeamMember {
  id: string
  userId: string
  role: 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER'
  createdAt: string
  user: {
    id: string
    name: string
    email: string
    avatarUrl?: string
  }
}

/**
 * Invitation details
 */
export interface Invitation {
  id: string
  email: string
  role: 'ADMIN' | 'MEMBER' | 'VIEWER'
  status: 'PENDING' | 'ACCEPTED' | 'EXPIRED' | 'REVOKED'
  expiresAt: string
  createdAt: string
}

interface InviteMemberInput {
  email: string
  role: 'ADMIN' | 'MEMBER' | 'VIEWER'
}

/**
 * Hook for managing team members.
 *
 * @example
 * ```tsx
 * function TeamList() {
 *   const { members, isLoading, fetchMembers } = useTeamMembers()
 *
 *   useEffect(() => {
 *     fetchMembers()
 *   }, [fetchMembers])
 *
 *   if (isLoading) return <Skeleton />
 *   return members.map(m => <MemberCard key={m.id} member={m} />)
 * }
 * ```
 */
export function useTeamMembers() {
  const { org } = useCurrentOrg()
  const [members, setMembers] = useState<TeamMember[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchMembers = useCallback(async () => {
    if (!org) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/v1/team/members', {
        headers: { 'x-organization-id': org.id },
      })

      if (!response.ok) throw new Error('Failed to fetch team members')

      const data = await response.json()
      setMembers(data.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setIsLoading(false)
    }
  }, [org])

  const updateMemberRole = useCallback(async (memberId: string, role: TeamMember['role']) => {
    if (!org) throw new Error('No organization selected')

    const response = await fetch(`/api/v1/team/members/${memberId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'x-organization-id': org.id,
      },
      body: JSON.stringify({ role }),
    })

    if (!response.ok) {
      const data = await response.json()
      throw new Error(data.error || 'Failed to update member role')
    }

    const { data } = await response.json()
    setMembers(prev => prev.map(m => m.id === memberId ? data : m))
    return data as TeamMember
  }, [org])

  const removeMember = useCallback(async (memberId: string) => {
    if (!org) throw new Error('No organization selected')

    const response = await fetch(`/api/v1/team/members/${memberId}`, {
      method: 'DELETE',
      headers: { 'x-organization-id': org.id },
    })

    if (!response.ok) {
      const data = await response.json()
      throw new Error(data.error || 'Failed to remove member')
    }

    setMembers(prev => prev.filter(m => m.id !== memberId))
  }, [org])

  return {
    members,
    isLoading,
    error,
    fetchMembers,
    updateMemberRole,
    removeMember,
  }
}

/**
 * Hook for managing team invitations.
 *
 * @example
 * ```tsx
 * function InviteForm() {
 *   const { inviteMember, isLoading } = useInvitations()
 *
 *   const handleInvite = async (email: string) => {
 *     await inviteMember({ email, role: 'MEMBER' })
 *   }
 * }
 * ```
 */
export function useInvitations() {
  const { org } = useCurrentOrg()
  const [invitations, setInvitations] = useState<Invitation[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchInvitations = useCallback(async () => {
    if (!org) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/v1/team/invitations', {
        headers: { 'x-organization-id': org.id },
      })

      if (!response.ok) throw new Error('Failed to fetch invitations')

      const data = await response.json()
      setInvitations(data.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setIsLoading(false)
    }
  }, [org])

  const inviteMember = useCallback(async (input: InviteMemberInput) => {
    if (!org) throw new Error('No organization selected')

    const response = await fetch('/api/v1/team/invitations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-organization-id': org.id,
      },
      body: JSON.stringify(input),
    })

    if (!response.ok) {
      const data = await response.json()
      throw new Error(data.error || 'Failed to send invitation')
    }

    const { data } = await response.json()
    setInvitations(prev => [data, ...prev])
    return data as Invitation
  }, [org])

  const revokeInvitation = useCallback(async (invitationId: string) => {
    if (!org) throw new Error('No organization selected')

    const response = await fetch(`/api/v1/team/invitations/${invitationId}`, {
      method: 'DELETE',
      headers: { 'x-organization-id': org.id },
    })

    if (!response.ok) {
      const data = await response.json()
      throw new Error(data.error || 'Failed to revoke invitation')
    }

    setInvitations(prev => prev.filter(i => i.id !== invitationId))
  }, [org])

  return {
    invitations,
    isLoading,
    error,
    fetchInvitations,
    inviteMember,
    revokeInvitation,
  }
}
