/**
 * @prompt-id forge-v4.1:feature:saved-views:004
 * @generated-at 2026-01-25T00:00:00Z
 * @model claude-opus-4-5
 */

"use client"

import { useState } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { useFavorites, useRecentViews, type SavedView } from '@/hooks/use-saved-views'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { TooltipProvider } from '@/components/ui/tooltip'
import {
  Star,
  Clock,
  Pin,
  MoreHorizontal,
  Trash2,
  ChevronRight,
  ChevronDown,
  FileText,
  BarChart3,
  Bot,
  Users,
  PieChart,
  Target,
  Table2,
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

/**
 * Entity type to icon mapping
 */
const entityTypeIcons: Record<string, React.ElementType> = {
  dashboard: PieChart,
  report: FileText,
  agent: Bot,
  audience: Users,
  chart: BarChart3,
  crosstab: Table2,
  'brand-tracking': Target,
}

/**
 * Entity type to route mapping
 */
const entityTypeRoutes: Record<string, string> = {
  dashboard: '/dashboard/dashboards',
  report: '/dashboard/reports',
  agent: '/dashboard/agents',
  audience: '/dashboard/audiences',
  chart: '/dashboard/charts',
  crosstab: '/dashboard/crosstabs',
  'brand-tracking': '/dashboard/brand-tracking',
}

interface SavedViewItemProps {
  view: SavedView
  onRemove: (id: string) => void
  onTogglePin: (id: string, isPinned: boolean) => void
  isRemoving?: boolean
}

function SavedViewItem({ view, onRemove, onTogglePin, isRemoving }: SavedViewItemProps) {
  const IconComponent = entityTypeIcons[view.entityType] || FileText
  const basePath = entityTypeRoutes[view.entityType] || '/dashboard'
  const href = `${basePath}/${view.entityId}`

  return (
    <div
      className={cn(
        "group flex items-center gap-2 px-2 py-1.5 rounded-md transition-colors hover:bg-muted/50",
        isRemoving && "opacity-50 pointer-events-none"
      )}
    >
      <Link
        href={href}
        className="flex-1 flex items-center gap-2 min-w-0"
      >
        <IconComponent className="h-4 w-4 shrink-0 text-muted-foreground" />
        <span className="truncate text-sm">{view.name}</span>
        {view.isPinned && (
          <Pin className="h-3 w-3 shrink-0 text-primary" />
        )}
      </Link>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <MoreHorizontal className="h-3.5 w-3.5" />
            <span className="sr-only">Actions</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40">
          <DropdownMenuItem onClick={() => onTogglePin(view.id, view.isPinned)}>
            <Pin className="mr-2 h-4 w-4" />
            {view.isPinned ? 'Unpin' : 'Pin to top'}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => onRemove(view.id)}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Remove
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

interface SectionProps {
  title: string
  icon: React.ElementType
  views: SavedView[]
  isLoading: boolean
  emptyMessage: string
  onRemove: (id: string) => void
  onTogglePin: (id: string, isPinned: boolean) => void
  defaultOpen?: boolean
  removingIds: Set<string>
}

function Section({
  title,
  icon: Icon,
  views,
  isLoading,
  emptyMessage,
  onRemove,
  onTogglePin,
  defaultOpen = true,
  removingIds,
}: SectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <div className="mb-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between px-2 py-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
      >
        <span className="flex items-center gap-2">
          <Icon className="h-3.5 w-3.5" />
          {title}
          {views.length > 0 && (
            <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded-full">
              {views.length}
            </span>
          )}
        </span>
        {isOpen ? (
          <ChevronDown className="h-3.5 w-3.5" />
        ) : (
          <ChevronRight className="h-3.5 w-3.5" />
        )}
      </button>

      {isOpen && (
        <div className="mt-1 space-y-0.5">
          {isLoading ? (
            <div className="space-y-2 px-2">
              <Skeleton className="h-7 w-full" />
              <Skeleton className="h-7 w-full" />
              <Skeleton className="h-7 w-3/4" />
            </div>
          ) : views.length === 0 ? (
            <p className="px-2 py-2 text-xs text-muted-foreground">{emptyMessage}</p>
          ) : (
            views.map((view) => (
              <SavedViewItem
                key={view.id}
                view={view}
                onRemove={onRemove}
                onTogglePin={onTogglePin}
                isRemoving={removingIds.has(view.id)}
              />
            ))
          )}
        </div>
      )}
    </div>
  )
}

interface SavedViewsPanelProps {
  className?: string
  showRecent?: boolean
  showFavorites?: boolean
  entityType?: string
}

/**
 * Sidebar panel component for displaying favorites and recent items
 *
 * @example
 * ```tsx
 * <SavedViewsPanel className="w-60" />
 * ```
 *
 * @example
 * ```tsx
 * // Show only favorites for a specific entity type
 * <SavedViewsPanel
 *   showRecent={false}
 *   showFavorites={true}
 *   entityType="dashboard"
 * />
 * ```
 */
export function SavedViewsPanel({
  className,
  showRecent = true,
  showFavorites = true,
  entityType,
}: SavedViewsPanelProps) {
  const [removingIds, setRemovingIds] = useState<Set<string>>(new Set())

  const {
    savedViews: favorites,
    isLoading: favoritesLoading,
    deleteSavedView: deleteFavorite,
    togglePinned: toggleFavoritePinned,
  } = useFavorites(entityType)

  const {
    savedViews: recentViews,
    isLoading: recentLoading,
    deleteSavedView: deleteRecent,
    togglePinned: toggleRecentPinned,
  } = useRecentViews(entityType)

  const handleRemove = async (id: string, deleteFunc: (id: string) => Promise<void>) => {
    setRemovingIds(prev => new Set(prev).add(id))
    try {
      await deleteFunc(id)
    } catch (error) {
      console.error('Failed to remove saved view:', error)
    } finally {
      setRemovingIds(prev => {
        const next = new Set(prev)
        next.delete(id)
        return next
      })
    }
  }

  const handleTogglePin = async (
    id: string,
    isPinned: boolean,
    toggleFunc: (id: string, isPinned: boolean) => Promise<SavedView>
  ) => {
    try {
      await toggleFunc(id, isPinned)
    } catch (error) {
      console.error('Failed to toggle pin:', error)
    }
  }

  // Sort favorites to show pinned items first
  const sortedFavorites = [...favorites].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1
    if (!a.isPinned && b.isPinned) return 1
    return a.sortOrder - b.sortOrder
  })

  return (
    <TooltipProvider delayDuration={300}>
      <div className={cn("flex flex-col", className)}>
        <ScrollArea className="flex-1">
          <div className="p-2">
            {showFavorites && (
              <Section
                title="Favorites"
                icon={Star}
                views={sortedFavorites}
                isLoading={favoritesLoading}
                emptyMessage="Star items to add them to favorites"
                onRemove={(id) => handleRemove(id, deleteFavorite)}
                onTogglePin={(id, isPinned) => handleTogglePin(id, isPinned, toggleFavoritePinned)}
                defaultOpen={true}
                removingIds={removingIds}
              />
            )}

            {showRecent && (
              <Section
                title="Recent"
                icon={Clock}
                views={recentViews}
                isLoading={recentLoading}
                emptyMessage="No recent items"
                onRemove={(id) => handleRemove(id, deleteRecent)}
                onTogglePin={(id, isPinned) => handleTogglePin(id, isPinned, toggleRecentPinned)}
                defaultOpen={true}
                removingIds={removingIds}
              />
            )}
          </div>
        </ScrollArea>
      </div>
    </TooltipProvider>
  )
}

export default SavedViewsPanel
