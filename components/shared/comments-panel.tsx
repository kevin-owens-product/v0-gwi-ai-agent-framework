"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  MessageSquare,
  Send,
  MoreHorizontal,
  Reply,
  Trash2,
  Pin,
  AtSign,
  Clock,
  Check,
  Loader2,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface Comment {
  id: string
  content: string
  createdAt: string
  author: {
    id: string
    name: string
    email: string
    avatar?: string
  }
  isPinned: boolean
  isResolved: boolean
  replies: Comment[]
  mentions: string[]
  attachedTo?: {
    type: "cell" | "row" | "audience" | "metric"
    id: string
    label: string
  }
}

interface CommentsPanelProps {
  resourceType: "audience" | "crosstab"
  resourceId: string
  currentUserId: string
  className?: string
}

// Mock comments
const mockComments: Comment[] = [
  {
    id: "1",
    content: "The Gen Z numbers for TikTok seem surprisingly high. Should we validate against the latest survey wave?",
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    author: { id: "1", name: "Sarah Chen", email: "sarah@example.com" },
    isPinned: true,
    isResolved: false,
    replies: [
      {
        id: "1-1",
        content: "@Marcus confirmed - this matches our Q4 data. TikTok adoption in this segment has accelerated.",
        createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
        author: { id: "2", name: "Marcus Johnson", email: "marcus@example.com" },
        isPinned: false,
        isResolved: false,
        replies: [],
        mentions: ["Marcus"],
      },
    ],
    mentions: [],
    attachedTo: { type: "cell", id: "tiktok-genz", label: "TikTok / Gen Z" },
  },
  {
    id: "2",
    content: "We should highlight the LinkedIn vs Facebook crossover for Millennials in the presentation. Interesting finding!",
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    author: { id: "3", name: "Emily Thompson", email: "emily@example.com" },
    isPinned: false,
    isResolved: true,
    replies: [],
    mentions: [],
  },
  {
    id: "3",
    content: "Consider adding Threads to future iterations of this analysis.",
    createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    author: { id: "1", name: "Sarah Chen", email: "sarah@example.com" },
    isPinned: false,
    isResolved: false,
    replies: [],
    mentions: [],
  },
]

export function CommentsPanel({
  resourceType: _resourceType,
  resourceId: _resourceId,
  currentUserId,
  className,
}: CommentsPanelProps) {
  const [comments, setComments] = useState<Comment[]>(mockComments)
  const [newComment, setNewComment] = useState("")
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyContent, setReplyContent] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [filter, setFilter] = useState<"all" | "pinned" | "unresolved">("all")

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffMins < 1) return "Just now"
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString()
  }

  const handleSubmitComment = async () => {
    if (!newComment.trim()) return

    setIsSubmitting(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500))

    const comment: Comment = {
      id: Date.now().toString(),
      content: newComment,
      createdAt: new Date().toISOString(),
      author: { id: currentUserId, name: "You", email: "you@example.com" },
      isPinned: false,
      isResolved: false,
      replies: [],
      mentions: [],
    }

    setComments([comment, ...comments])
    setNewComment("")
    setIsSubmitting(false)
  }

  const handleSubmitReply = async (parentId: string) => {
    if (!replyContent.trim()) return

    setIsSubmitting(true)
    await new Promise(resolve => setTimeout(resolve, 500))

    const reply: Comment = {
      id: `${parentId}-${Date.now()}`,
      content: replyContent,
      createdAt: new Date().toISOString(),
      author: { id: currentUserId, name: "You", email: "you@example.com" },
      isPinned: false,
      isResolved: false,
      replies: [],
      mentions: [],
    }

    setComments(comments.map(c => {
      if (c.id === parentId) {
        return { ...c, replies: [...c.replies, reply] }
      }
      return c
    }))

    setReplyingTo(null)
    setReplyContent("")
    setIsSubmitting(false)
  }

  const togglePin = (commentId: string) => {
    setComments(comments.map(c => {
      if (c.id === commentId) {
        return { ...c, isPinned: !c.isPinned }
      }
      return c
    }))
  }

  const toggleResolved = (commentId: string) => {
    setComments(comments.map(c => {
      if (c.id === commentId) {
        return { ...c, isResolved: !c.isResolved }
      }
      return c
    }))
  }

  const deleteComment = (commentId: string) => {
    setComments(comments.filter(c => c.id !== commentId))
  }

  const filteredComments = comments.filter(c => {
    if (filter === "pinned") return c.isPinned
    if (filter === "unresolved") return !c.isResolved
    return true
  })

  const pinnedCount = comments.filter(c => c.isPinned).length
  const unresolvedCount = comments.filter(c => !c.isResolved).length

  const CommentItem = ({ comment, isReply = false }: { comment: Comment; isReply?: boolean }) => (
    <div className={cn("space-y-3", isReply && "ml-8 mt-3")}>
      <div className="flex items-start gap-3">
        <Avatar className="h-8 w-8">
          <AvatarImage src={comment.author.avatar} />
          <AvatarFallback className="text-xs">
            {comment.author.name.split(" ").map(n => n[0]).join("")}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-medium text-sm">{comment.author.name}</span>
              <span className="text-xs text-muted-foreground">{formatTime(comment.createdAt)}</span>
              {comment.isPinned && (
                <Pin className="h-3 w-3 text-primary" />
              )}
              {comment.isResolved && (
                <Badge variant="secondary" className="text-xs">Resolved</Badge>
              )}
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-6 w-6">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {!isReply && (
                  <>
                    <DropdownMenuItem onClick={() => togglePin(comment.id)}>
                      <Pin className="h-4 w-4 mr-2" />
                      {comment.isPinned ? "Unpin" : "Pin"}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => toggleResolved(comment.id)}>
                      <Check className="h-4 w-4 mr-2" />
                      {comment.isResolved ? "Reopen" : "Resolve"}
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuItem
                  onClick={() => deleteComment(comment.id)}
                  className="text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Attached to indicator */}
          {comment.attachedTo && (
            <Badge variant="outline" className="text-xs mt-1">
              {comment.attachedTo.label}
            </Badge>
          )}

          <p className="text-sm mt-1 whitespace-pre-wrap">{comment.content}</p>

          {/* Reply button */}
          {!isReply && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-xs mt-2"
              onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
            >
              <Reply className="h-3 w-3 mr-1" />
              Reply
            </Button>
          )}

          {/* Reply input */}
          {replyingTo === comment.id && (
            <div className="mt-3 flex gap-2">
              <Textarea
                placeholder="Write a reply..."
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                className="min-h-[60px] text-sm"
              />
              <div className="flex flex-col gap-1">
                <Button
                  size="sm"
                  onClick={() => handleSubmitReply(comment.id)}
                  disabled={isSubmitting || !replyContent.trim()}
                >
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setReplyingTo(null)
                    setReplyContent("")
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Replies */}
      {comment.replies.map(reply => (
        <CommentItem key={reply.id} comment={reply} isReply />
      ))}
    </div>
  )

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">Comments</h3>
          <Badge variant="secondary">{comments.length}</Badge>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2">
        <Button
          variant={filter === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("all")}
        >
          All
        </Button>
        <Button
          variant={filter === "pinned" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("pinned")}
        >
          <Pin className="h-3 w-3 mr-1" />
          Pinned ({pinnedCount})
        </Button>
        <Button
          variant={filter === "unresolved" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("unresolved")}
        >
          <Clock className="h-3 w-3 mr-1" />
          Open ({unresolvedCount})
        </Button>
      </div>

      {/* New Comment Input */}
      <Card className="p-4">
        <Textarea
          placeholder="Add a comment... Use @ to mention someone"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          className="min-h-[80px] mb-3"
        />
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <AtSign className="h-3 w-3" />
            <span>@mention to notify</span>
          </div>
          <Button
            onClick={handleSubmitComment}
            disabled={isSubmitting || !newComment.trim()}
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Send className="h-4 w-4 mr-2" />
            )}
            Post
          </Button>
        </div>
      </Card>

      {/* Comments List */}
      <div className="space-y-4">
        {filteredComments.map(comment => (
          <Card key={comment.id} className={cn("p-4", comment.isPinned && "bg-primary/5 border-primary/20")}>
            <CommentItem comment={comment} />
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredComments.length === 0 && (
        <Card className="p-8 text-center">
          <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h4 className="font-medium mb-2">No comments yet</h4>
          <p className="text-sm text-muted-foreground">
            Be the first to start the conversation
          </p>
        </Card>
      )}
    </div>
  )
}
