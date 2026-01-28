"use client"

import { useState, useRef, useCallback, useEffect, KeyboardEvent } from 'react'
import { useTranslations } from "next-intl"
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Send, AtSign, X } from 'lucide-react'
import { useTeamMembers, type TeamMember } from '@/hooks/use-team'

interface CommentInputProps {
  onSubmit: (content: string, mentions: string[]) => Promise<void>
  onCancel?: () => void
  isSubmitting?: boolean
  placeholder?: string
  autoFocus?: boolean
  className?: string
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

export function CommentInput({
  onSubmit,
  onCancel,
  isSubmitting = false,
  placeholder,
  autoFocus = false,
  className,
}: CommentInputProps) {
  const t = useTranslations("collaboration")
  const [content, setContent] = useState('')
  const [mentions, setMentions] = useState<string[]>([])
  const [showMentionPopover, setShowMentionPopover] = useState(false)
  const [mentionSearch, setMentionSearch] = useState('')
  const [cursorPosition, setCursorPosition] = useState(0)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const { members, fetchMembers } = useTeamMembers()

  useEffect(() => {
    fetchMembers()
  }, [fetchMembers])

  const filteredMembers = members.filter(member => {
    const searchLower = mentionSearch.toLowerCase()
    return (
      member.user.name?.toLowerCase().includes(searchLower) ||
      member.user.email.toLowerCase().includes(searchLower)
    )
  }).slice(0, 5)

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // Handle @ key for mentions
    if (e.key === '@') {
      setShowMentionPopover(true)
      setMentionSearch('')
    }

    // Handle escape to close mention popover
    if (e.key === 'Escape' && showMentionPopover) {
      e.preventDefault()
      setShowMentionPopover(false)
    }

    // Handle enter with modifier to submit
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const handleChange = (value: string) => {
    setContent(value)

    // Check if we're in a mention context
    const cursorPos = textareaRef.current?.selectionStart || 0
    setCursorPosition(cursorPos)

    // Find the @ symbol before cursor
    const beforeCursor = value.slice(0, cursorPos)
    const lastAtIndex = beforeCursor.lastIndexOf('@')

    if (lastAtIndex !== -1) {
      const textAfterAt = beforeCursor.slice(lastAtIndex + 1)
      // Check if there's no space after @ (still typing mention)
      if (!textAfterAt.includes(' ')) {
        setMentionSearch(textAfterAt)
        setShowMentionPopover(true)
      } else {
        setShowMentionPopover(false)
      }
    } else {
      setShowMentionPopover(false)
    }
  }

  const insertMention = useCallback((member: TeamMember) => {
    const beforeCursor = content.slice(0, cursorPosition)
    const afterCursor = content.slice(cursorPosition)
    const lastAtIndex = beforeCursor.lastIndexOf('@')

    if (lastAtIndex !== -1) {
      const beforeAt = beforeCursor.slice(0, lastAtIndex)
      const mentionText = member.user.name || member.user.email.split('@')[0]
      const newContent = `${beforeAt}@${mentionText} ${afterCursor}`
      setContent(newContent)

      // Add to mentions list if not already there
      if (!mentions.includes(member.userId)) {
        setMentions([...mentions, member.userId])
      }
    }

    setShowMentionPopover(false)
    textareaRef.current?.focus()
  }, [content, cursorPosition, mentions])

  const handleSubmit = async () => {
    if (!content.trim() || isSubmitting) return

    try {
      await onSubmit(content.trim(), mentions)
      setContent('')
      setMentions([])
    } catch (error) {
      console.error('Failed to submit comment:', error)
    }
  }

  const handleCancel = () => {
    setContent('')
    setMentions([])
    onCancel?.()
  }

  const isEmpty = !content.trim()

  return (
    <div className={cn('relative', className)}>
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => handleChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder || t("writeCommentPlaceholder")}
            disabled={isSubmitting}
            autoFocus={autoFocus}
            rows={3}
            className={cn(
              'resize-none pr-10',
              isSubmitting && 'opacity-50'
            )}
          />

          {/* Mention trigger button */}
          <Popover open={showMentionPopover} onOpenChange={setShowMentionPopover}>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-2 top-2 h-6 w-6"
                onClick={() => {
                  const textarea = textareaRef.current
                  if (textarea) {
                    const cursorPos = textarea.selectionStart
                    const before = content.slice(0, cursorPos)
                    const after = content.slice(cursorPos)
                    setContent(before + '@' + after)
                    setCursorPosition(cursorPos + 1)
                    setMentionSearch('')
                    setShowMentionPopover(true)
                    setTimeout(() => textarea.focus(), 0)
                  }
                }}
              >
                <AtSign className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-64 p-0">
              <div className="p-2">
                <p className="text-xs text-muted-foreground mb-2">{t("mentionTeamMember")}</p>
                {filteredMembers.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-2 px-1">
                    {mentionSearch ? t("noMembersFound") : t("startTypingToSearch")}
                  </p>
                ) : (
                  <div className="space-y-1">
                    {filteredMembers.map((member) => (
                      <button
                        key={member.userId}
                        type="button"
                        className="w-full flex items-center gap-2 p-2 rounded-md hover:bg-muted transition-colors text-left"
                        onClick={() => insertMention(member)}
                      >
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={member.user.avatarUrl || undefined} />
                          <AvatarFallback className="text-xs">
                            {getInitials(member.user.name, member.user.email)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {member.user.name || member.user.email}
                          </p>
                          {member.user.name && (
                            <p className="text-xs text-muted-foreground truncate">
                              {member.user.email}
                            </p>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between mt-2">
        <p className="text-xs text-muted-foreground">
          {t("pressToSubmit")}
        </p>

        <div className="flex gap-2">
          {onCancel && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              <X className="h-4 w-4 mr-1" />
              {t("cancel")}
            </Button>
          )}
          <Button
            type="button"
            size="sm"
            onClick={handleSubmit}
            disabled={isEmpty || isSubmitting}
          >
            <Send className="h-4 w-4 mr-1" />
            {isSubmitting ? t("sending") : t("send")}
          </Button>
        </div>
      </div>
    </div>
  )
}
