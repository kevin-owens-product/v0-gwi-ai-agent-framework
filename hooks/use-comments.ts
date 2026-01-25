"use client"

import { useState, useCallback } from 'react'
import { useCurrentOrg } from './use-organization'

/**
 * Comment with user details
 */
export interface Comment {
  id: string
  orgId: string
  userId: string
  entityType: string
  entityId: string
  parentId: string | null
  content: string
  mentions: string[]
  isResolved: boolean
  resolvedBy: string | null
  resolvedAt: string | null
  createdAt: string
  updatedAt: string
  user: {
    id: string
    name: string | null
    email: string
    image: string | null
  }
  _count?: {
    replies: number
  }
  replies?: Comment[]
}

interface CreateCommentInput {
  entityType: string
  entityId: string
  content: string
  parentId?: string
  mentions?: string[]
}

interface UpdateCommentInput {
  content?: string
  isResolved?: boolean
}

interface CommentFilters {
  entityType: string
  entityId: string
  parentId?: string | null
}

/**
 * Hook for managing comments on entities.
 *
 * @example
 * ```tsx
 * function CommentSection({ reportId }: { reportId: string }) {
 *   const { comments, isLoading, fetchComments, createComment } = useComments()
 *
 *   useEffect(() => {
 *     fetchComments({ entityType: 'report', entityId: reportId })
 *   }, [fetchComments, reportId])
 *
 *   const handleSubmit = async (content: string) => {
 *     await createComment({
 *       entityType: 'report',
 *       entityId: reportId,
 *       content,
 *     })
 *   }
 *
 *   return comments.map(c => <CommentCard key={c.id} comment={c} />)
 * }
 * ```
 */
export function useComments() {
  const { org } = useCurrentOrg()
  const [comments, setComments] = useState<Comment[]>([])
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchComments = useCallback(async (filters: CommentFilters, page: number = 1, limit: number = 50) => {
    if (!org) return

    setIsLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams()
      params.set('entityType', filters.entityType)
      params.set('entityId', filters.entityId)
      params.set('offset', ((page - 1) * limit).toString())
      params.set('limit', limit.toString())

      if (filters.parentId !== undefined) {
        params.set('parentId', filters.parentId === null ? 'null' : filters.parentId)
      }

      const response = await fetch(`/api/v1/comments?${params}`, {
        headers: { 'x-organization-id': org.id },
      })

      if (!response.ok) throw new Error('Failed to fetch comments')

      const data = await response.json()
      setComments(data.data)
      setTotal(data.total)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setIsLoading(false)
    }
  }, [org])

  const createComment = useCallback(async (input: CreateCommentInput) => {
    if (!org) throw new Error('No organization selected')

    const response = await fetch('/api/v1/comments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-organization-id': org.id,
      },
      body: JSON.stringify(input),
    })

    if (!response.ok) {
      const data = await response.json()
      throw new Error(data.error || 'Failed to create comment')
    }

    const { data } = await response.json()
    setComments(prev => [...prev, data])
    setTotal(prev => prev + 1)
    return data as Comment
  }, [org])

  const updateComment = useCallback(async (id: string, input: UpdateCommentInput) => {
    if (!org) throw new Error('No organization selected')

    const response = await fetch(`/api/v1/comments/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'x-organization-id': org.id,
      },
      body: JSON.stringify(input),
    })

    if (!response.ok) {
      const data = await response.json()
      throw new Error(data.error || 'Failed to update comment')
    }

    const { data } = await response.json()
    setComments(prev => prev.map(c => c.id === id ? data : c))
    return data as Comment
  }, [org])

  const deleteComment = useCallback(async (id: string) => {
    if (!org) throw new Error('No organization selected')

    const response = await fetch(`/api/v1/comments/${id}`, {
      method: 'DELETE',
      headers: { 'x-organization-id': org.id },
    })

    if (!response.ok) {
      const data = await response.json()
      throw new Error(data.error || 'Failed to delete comment')
    }

    setComments(prev => prev.filter(c => c.id !== id))
    setTotal(prev => prev - 1)
  }, [org])

  const resolveComment = useCallback(async (id: string, resolved: boolean = true) => {
    return updateComment(id, { isResolved: resolved })
  }, [updateComment])

  return {
    comments,
    total,
    isLoading,
    error,
    fetchComments,
    createComment,
    updateComment,
    deleteComment,
    resolveComment,
  }
}

/**
 * Hook for a single comment with replies.
 */
export function useComment(id: string) {
  const { org } = useCurrentOrg()
  const [comment, setComment] = useState<Comment | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchComment = useCallback(async () => {
    if (!org || !id) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/v1/comments/${id}`, {
        headers: { 'x-organization-id': org.id },
      })

      if (!response.ok) throw new Error('Failed to fetch comment')

      const { data } = await response.json()
      setComment(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setIsLoading(false)
    }
  }, [org, id])

  return {
    comment,
    isLoading,
    error,
    fetchComment,
  }
}
