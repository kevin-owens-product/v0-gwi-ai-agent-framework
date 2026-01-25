"use client"

import { useState, useEffect, useCallback } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { cn } from '@/lib/utils'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  MessageSquare,
  MoreVertical,
  Pencil,
  Trash2,
  CheckCircle2,
  XCircle,
  Reply,
  ChevronDown,
  ChevronRight,
} from 'lucide-react'
import { useComments, type Comment } from '@/hooks/use-comments'
import { CommentInput } from './CommentInput'

interface CommentThreadProps {
  entityType: string
  entityId: string
  className?: string
  currentUserId?: string
  onCommentCountChange?: (count: number) => void
}

interface CommentCardProps {
  comment: Comment
  currentUserId?: string
  onReply: (parentId: string) => void
  onEdit: (comment: Comment) => void
  onDelete: (id: string) => void
  onResolve: (id: string, resolved: boolean) => void
  depth?: number
}

function getInitials(name: string | null | undefined, email: string): string {
  if (name) {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }
  return email.slice(0, 2).toUpperCase()
}

function CommentCard({
  comment,
  currentUserId,
  onReply,
  onEdit,
  onDelete,
  onResolve,
  depth = 0,
}: CommentCardProps) {
  const [showReplies, setShowReplies] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState(comment.content)
  const isAuthor = comment.userId === currentUserId
  const hasReplies = (comment._count?.replies ?? 0) > 0 || (comment.replies?.length ?? 0) > 0
  const replyCount = comment._count?.replies ?? comment.replies?.length ?? 0

  const handleEditSave = () => {
    if (editContent.trim() && editContent !== comment.content) {
      onEdit({ ...comment, content: editContent })
    }
    setIsEditing(false)
  }

  const handleEditCancel = () => {
    setEditContent(comment.content)
    setIsEditing(false)
  }

  return (
    <div className={cn('relative', depth > 0 && 'ml-8 pl-4 border-l-2 border-muted')}>
      <div className={cn(
        'group rounded-lg p-3 transition-colors',
        comment.isResolved && 'bg-muted/30',
        !comment.isResolved && 'hover:bg-muted/50'
      )}>
        <div className="flex items-start gap-3">
          <Avatar className="h-8 w-8 shrink-0">
            <AvatarImage src={comment.user.image || undefined} />
            <AvatarFallback className="text-xs">
              {getInitials(comment.user.name, comment.user.email)}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-medium text-sm">
                {comment.user.name || comment.user.email}
              </span>
              <span className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
              </span>
              {comment.isResolved && (
                <Badge variant="secondary" className="text-xs">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Resolved
                </Badge>
              )}
            </div>

            {isEditing ? (
              <div className="mt-2 space-y-2">
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="w-full min-h-[80px] p-2 text-sm border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                  autoFocus
                />
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleEditSave}>Save</Button>
                  <Button size="sm" variant="outline" onClick={handleEditCancel}>Cancel</Button>
                </div>
              </div>
            ) : (
              <p className="mt-1 text-sm text-foreground whitespace-pre-wrap break-words">
                {comment.content}
              </p>
            )}

            {!isEditing && (
              <div className="flex items-center gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-xs"
                  onClick={() => onReply(comment.id)}
                >
                  <Reply className="h-3 w-3 mr-1" />
                  Reply
                </Button>

                {hasReplies && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-xs"
                    onClick={() => setShowReplies(!showReplies)}
                  >
                    {showReplies ? (
                      <ChevronDown className="h-3 w-3 mr-1" />
                    ) : (
                      <ChevronRight className="h-3 w-3 mr-1" />
                    )}
                    {replyCount} {replyCount === 1 ? 'reply' : 'replies'}
                  </Button>
                )}
              </div>
            )}
          </div>

          {!isEditing && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {isAuthor && (
                  <DropdownMenuItem onClick={() => setIsEditing(true)}>
                    <Pencil className="h-4 w-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={() => onResolve(comment.id, !comment.isResolved)}>
                  {comment.isResolved ? (
                    <>
                      <XCircle className="h-4 w-4 mr-2" />
                      Unresolve
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Resolve
                    </>
                  )}
                </DropdownMenuItem>
                {isAuthor && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive"
                      onClick={() => onDelete(comment.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      {/* Nested replies */}
      {showReplies && comment.replies && comment.replies.length > 0 && (
        <div className="mt-2 space-y-2">
          {comment.replies.map((reply) => (
            <CommentCard
              key={reply.id}
              comment={reply}
              currentUserId={currentUserId}
              onReply={onReply}
              onEdit={onEdit}
              onDelete={onDelete}
              onResolve={onResolve}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function CommentSkeleton() {
  return (
    <div className="flex items-start gap-3 p-3">
      <Skeleton className="h-8 w-8 rounded-full" />
      <div className="flex-1 space-y-2">
        <div className="flex gap-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-16" />
        </div>
        <Skeleton className="h-12 w-full" />
      </div>
    </div>
  )
}

export function CommentThread({
  entityType,
  entityId,
  className,
  currentUserId,
  onCommentCountChange,
}: CommentThreadProps) {
  const {
    comments,
    total,
    isLoading,
    error,
    fetchComments,
    createComment,
    updateComment,
    deleteComment,
    resolveComment,
  } = useComments()

  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    fetchComments({ entityType, entityId, parentId: null })
  }, [fetchComments, entityType, entityId])

  useEffect(() => {
    onCommentCountChange?.(total)
  }, [total, onCommentCountChange])

  const handleCreateComment = useCallback(async (content: string, mentions: string[]) => {
    setIsSubmitting(true)
    try {
      await createComment({
        entityType,
        entityId,
        content,
        mentions,
      })
    } finally {
      setIsSubmitting(false)
    }
  }, [createComment, entityType, entityId])

  const handleReply = useCallback(async (content: string, mentions: string[]) => {
    if (!replyingTo) return
    setIsSubmitting(true)
    try {
      await createComment({
        entityType,
        entityId,
        content,
        parentId: replyingTo,
        mentions,
      })
      setReplyingTo(null)
      // Refresh to get nested replies
      await fetchComments({ entityType, entityId, parentId: null })
    } finally {
      setIsSubmitting(false)
    }
  }, [createComment, entityType, entityId, replyingTo, fetchComments])

  const handleEdit = useCallback(async (comment: Comment) => {
    await updateComment(comment.id, { content: comment.content })
  }, [updateComment])

  const handleDelete = useCallback(async (id: string) => {
    await deleteComment(id)
  }, [deleteComment])

  const handleResolve = useCallback(async (id: string, resolved: boolean) => {
    await resolveComment(id, resolved)
  }, [resolveComment])

  if (error) {
    return (
      <div className={cn('rounded-lg border border-destructive/50 bg-destructive/10 p-4', className)}>
        <p className="text-sm text-destructive">Failed to load comments: {error}</p>
        <Button
          variant="outline"
          size="sm"
          className="mt-2"
          onClick={() => fetchComments({ entityType, entityId, parentId: null })}
        >
          Retry
        </Button>
      </div>
    )
  }

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex items-center gap-2">
        <MessageSquare className="h-5 w-5 text-muted-foreground" />
        <h3 className="font-medium">Comments</h3>
        {total > 0 && (
          <Badge variant="secondary" className="text-xs">
            {total}
          </Badge>
        )}
      </div>

      {/* New comment input */}
      <CommentInput
        onSubmit={handleCreateComment}
        isSubmitting={isSubmitting}
        placeholder="Add a comment..."
      />

      {/* Comments list */}
      <div className="space-y-2">
        {isLoading ? (
          <>
            <CommentSkeleton />
            <CommentSkeleton />
          </>
        ) : comments.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            No comments yet. Be the first to comment!
          </p>
        ) : (
          comments.map((comment) => (
            <div key={comment.id}>
              <CommentCard
                comment={comment}
                currentUserId={currentUserId}
                onReply={setReplyingTo}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onResolve={handleResolve}
              />

              {/* Reply input */}
              {replyingTo === comment.id && (
                <div className="ml-11 mt-2">
                  <CommentInput
                    onSubmit={handleReply}
                    onCancel={() => setReplyingTo(null)}
                    isSubmitting={isSubmitting}
                    placeholder={`Reply to ${comment.user.name || comment.user.email}...`}
                    autoFocus
                  />
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
