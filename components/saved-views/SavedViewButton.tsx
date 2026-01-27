/**
 * @prompt-id forge-v4.1:feature:saved-views:005
 * @generated-at 2026-01-25T00:00:00Z
 * @model claude-opus-4-5
 */

"use client"

import { useState, useCallback } from 'react'
import { cn } from '@/lib/utils'
import { useFavorites, type SavedView } from '@/hooks/use-saved-views'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Star, Loader2 } from 'lucide-react'

interface SavedViewButtonProps {
  /**
   * The type of entity being saved (dashboard, report, agent, audience, etc.)
   */
  entityType: string
  /**
   * The unique identifier of the entity
   */
  entityId: string
  /**
   * The display name for the saved view
   */
  name: string
  /**
   * Optional additional metadata to store with the saved view
   */
  metadata?: Record<string, unknown>
  /**
   * Button size variant
   */
  size?: 'default' | 'sm' | 'lg' | 'icon' | 'icon-sm' | 'icon-lg'
  /**
   * Additional CSS classes
   */
  className?: string
  /**
   * Show label text next to the icon
   */
  showLabel?: boolean
  /**
   * Callback when the item is added to favorites
   */
  onAdd?: (savedView: SavedView) => void
  /**
   * Callback when the item is removed from favorites
   */
  onRemove?: (id: string) => void
  /**
   * Callback when an error occurs
   */
  onError?: (error: Error) => void
}

/**
 * A star/favorite button component for adding/removing items from saved views
 *
 * @example
 * ```tsx
 * // Basic usage
 * <SavedViewButton
 *   entityType="dashboard"
 *   entityId="dash_123"
 *   name="Q4 Sales Dashboard"
 * />
 * ```
 *
 * @example
 * ```tsx
 * // With label and callbacks
 * <SavedViewButton
 *   entityType="report"
 *   entityId="rpt_456"
 *   name="Monthly Report"
 *   showLabel
 *   onAdd={(view) => toast.success('Added to favorites')}
 *   onRemove={() => toast.success('Removed from favorites')}
 * />
 * ```
 *
 * @example
 * ```tsx
 * // With custom metadata
 * <SavedViewButton
 *   entityType="agent"
 *   entityId="agt_789"
 *   name="Research Agent"
 *   metadata={{ agentType: 'RESEARCH', lastRun: new Date().toISOString() }}
 * />
 * ```
 */
export function SavedViewButton({
  entityType,
  entityId,
  name,
  metadata,
  size = 'icon',
  className,
  showLabel = false,
  onAdd,
  onRemove,
  onError,
}: SavedViewButtonProps) {
  const [isProcessing, setIsProcessing] = useState(false)

  const {
    isLoading,
    addFavorite,
    removeFavorite,
    getSavedViewForEntity,
  } = useFavorites(entityType)

  const savedView = getSavedViewForEntity(entityType, entityId)
  const isSaved = !!savedView

  const handleClick = useCallback(async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (isProcessing || isLoading) return

    setIsProcessing(true)
    try {
      if (isSaved && savedView) {
        await removeFavorite(savedView.id)
        onRemove?.(savedView.id)
      } else {
        const newView = await addFavorite(entityType, entityId, name, metadata)
        onAdd?.(newView)
      }
    } catch (error) {
      console.error('Failed to toggle favorite:', error)
      onError?.(error instanceof Error ? error : new Error('Failed to toggle favorite'))
    } finally {
      setIsProcessing(false)
    }
  }, [
    isProcessing,
    isLoading,
    isSaved,
    savedView,
    entityType,
    entityId,
    name,
    metadata,
    addFavorite,
    removeFavorite,
    onAdd,
    onRemove,
    onError,
  ])

  const buttonContent = (
    <>
      {isProcessing ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Star
          className={cn(
            "h-4 w-4 transition-colors",
            isSaved && "fill-yellow-400 text-yellow-400"
          )}
        />
      )}
      {showLabel && (
        <span className="ml-1.5">
          {isSaved ? 'Remove from Favorites' : 'Add to Favorites'}
        </span>
      )}
    </>
  )

  const button = (
    <Button
      variant="ghost"
      size={size}
      className={cn(
        "transition-all",
        isSaved && "text-yellow-500 hover:text-yellow-600",
        !isSaved && "text-muted-foreground hover:text-foreground",
        className
      )}
      onClick={handleClick}
      disabled={isProcessing || isLoading}
      aria-label={isSaved ? 'Remove from favorites' : 'Add to favorites'}
      aria-pressed={isSaved}
    >
      {buttonContent}
    </Button>
  )

  if (showLabel) {
    return button
  }

  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          {button}
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <p>{isSaved ? 'Remove from favorites' : 'Add to favorites'}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

/**
 * Controlled version of SavedViewButton for use in list contexts
 * where the saved state is already known
 */
interface ControlledSavedViewButtonProps {
  isSaved: boolean
  isLoading?: boolean
  onToggle: () => void
  size?: 'default' | 'sm' | 'lg' | 'icon' | 'icon-sm' | 'icon-lg'
  className?: string
  showLabel?: boolean
}

export function ControlledSavedViewButton({
  isSaved,
  isLoading = false,
  onToggle,
  size = 'icon',
  className,
  showLabel = false,
}: ControlledSavedViewButtonProps) {
  const buttonContent = (
    <>
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Star
          className={cn(
            "h-4 w-4 transition-colors",
            isSaved && "fill-yellow-400 text-yellow-400"
          )}
        />
      )}
      {showLabel && (
        <span className="ml-1.5">
          {isSaved ? 'Remove from Favorites' : 'Add to Favorites'}
        </span>
      )}
    </>
  )

  const button = (
    <Button
      variant="ghost"
      size={size}
      className={cn(
        "transition-all",
        isSaved && "text-yellow-500 hover:text-yellow-600",
        !isSaved && "text-muted-foreground hover:text-foreground",
        className
      )}
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        onToggle()
      }}
      disabled={isLoading}
      aria-label={isSaved ? 'Remove from favorites' : 'Add to favorites'}
      aria-pressed={isSaved}
    >
      {buttonContent}
    </Button>
  )

  if (showLabel) {
    return button
  }

  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          {button}
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <p>{isSaved ? 'Remove from favorites' : 'Add to favorites'}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

export default SavedViewButton
