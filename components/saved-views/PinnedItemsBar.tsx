/**
 * @prompt-id forge-v4.1:feature:saved-views:006
 * @generated-at 2026-01-25T00:00:00Z
 * @model claude-opus-4-5
 */

"use client"

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils'
import { usePinnedViews, type SavedView } from '@/hooks/use-saved-views'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Pin,
  X,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  FileText,
  BarChart3,
  Bot,
  Users,
  PieChart,
  Target,
  Table2,
  ExternalLink,
  Trash2,
} from 'lucide-react'

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

/**
 * Entity type to color mapping
 */
const entityTypeColors: Record<string, string> = {
  dashboard: 'bg-blue-500',
  report: 'bg-emerald-500',
  agent: 'bg-purple-500',
  audience: 'bg-orange-500',
  chart: 'bg-cyan-500',
  crosstab: 'bg-pink-500',
  'brand-tracking': 'bg-amber-500',
}

interface PinnedItemProps {
  view: SavedView
  onUnpin: (id: string) => void
  onRemove: (id: string) => void
  isProcessing?: boolean
}

function PinnedItem({ view, onUnpin, onRemove, isProcessing }: PinnedItemProps) {
  const t = useTranslations('savedViews')
  const IconComponent = entityTypeIcons[view.entityType] || FileText
  const basePath = entityTypeRoutes[view.entityType] || '/dashboard'
  const href = `${basePath}/${view.entityId}`
  const dotColor = entityTypeColors[view.entityType] || 'bg-gray-500'

  return (
    <div
      className={cn(
        "group relative flex items-center gap-2 px-3 py-1.5 rounded-md bg-muted/50 hover:bg-muted transition-colors shrink-0",
        isProcessing && "opacity-50 pointer-events-none"
      )}
    >
      <div className={cn("h-1.5 w-1.5 rounded-full shrink-0", dotColor)} />
      <Link
        href={href}
        className="flex items-center gap-1.5 text-sm font-medium truncate max-w-[150px] hover:text-primary transition-colors"
      >
        <IconComponent className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
        <span className="truncate">{view.name}</span>
      </Link>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity ml-1 shrink-0"
          >
            <X className="h-3 w-3" />
            <span className="sr-only">{t('actions')}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40">
          <DropdownMenuItem asChild>
            <Link href={href} className="cursor-pointer">
              <ExternalLink className="mr-2 h-4 w-4" />
              {t('open')}
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => onUnpin(view.id)}>
            <Pin className="mr-2 h-4 w-4" />
            {t('unpin')}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => onRemove(view.id)}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            {t('remove')}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

interface PinnedItemsBarProps {
  className?: string
  /**
   * Show navigation arrows when items overflow
   */
  showNavigation?: boolean
  /**
   * Maximum height for the bar
   */
  maxHeight?: number
}

/**
 * A horizontal bar component displaying pinned/quick-access items
 *
 * @example
 * ```tsx
 * // Basic usage in a layout
 * <div className="border-b">
 *   <PinnedItemsBar />
 * </div>
 * ```
 *
 * @example
 * ```tsx
 * // With custom styling
 * <PinnedItemsBar
 *   className="bg-muted/30 px-4"
 *   showNavigation={true}
 * />
 * ```
 */
export function PinnedItemsBar({
  className,
  showNavigation = true,
}: PinnedItemsBarProps) {
  const t = useTranslations('savedViews')
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set())
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  const {
    savedViews: pinnedViews,
    isLoading,
    togglePinned,
    deleteSavedView,
  } = usePinnedViews()

  // Check scroll position to show/hide navigation arrows
  const checkScroll = () => {
    if (!scrollRef.current) return
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
    setCanScrollLeft(scrollLeft > 0)
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 1)
  }

  useEffect(() => {
    checkScroll()
    window.addEventListener('resize', checkScroll)
    return () => window.removeEventListener('resize', checkScroll)
  }, [pinnedViews])

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return
    const scrollAmount = 200
    scrollRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    })
    setTimeout(checkScroll, 300)
  }

  const handleUnpin = async (id: string) => {
    setProcessingIds(prev => new Set(prev).add(id))
    try {
      await togglePinned(id, true)
    } catch (error) {
      console.error('Failed to unpin:', error)
    } finally {
      setProcessingIds(prev => {
        const next = new Set(prev)
        next.delete(id)
        return next
      })
    }
  }

  const handleRemove = async (id: string) => {
    setProcessingIds(prev => new Set(prev).add(id))
    try {
      await deleteSavedView(id)
    } catch (error) {
      console.error('Failed to remove:', error)
    } finally {
      setProcessingIds(prev => {
        const next = new Set(prev)
        next.delete(id)
        return next
      })
    }
  }

  // Don't render if there are no pinned items and not loading
  if (!isLoading && pinnedViews.length === 0) {
    return null
  }

  return (
    <TooltipProvider delayDuration={300}>
      <div className={cn("relative flex items-center gap-2 py-2 px-4", className)}>
        {/* Pin icon label */}
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground shrink-0">
          <Pin className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">{t('pinned')}</span>
        </div>

        {/* Divider */}
        <div className="h-4 w-px bg-border shrink-0" />

        {/* Left navigation arrow */}
        {showNavigation && canScrollLeft && (
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 shrink-0 absolute left-12 z-10 bg-background/80 backdrop-blur-sm"
            onClick={() => scroll('left')}
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">{t('scrollLeft')}</span>
          </Button>
        )}

        {/* Scrollable content */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-x-auto scrollbar-hide"
          onScroll={checkScroll}
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          <div className="flex items-center gap-2">
            {isLoading ? (
              <>
                <Skeleton className="h-8 w-32 rounded-md" />
                <Skeleton className="h-8 w-28 rounded-md" />
                <Skeleton className="h-8 w-36 rounded-md" />
              </>
            ) : (
              pinnedViews.map((view) => (
                <PinnedItem
                  key={view.id}
                  view={view}
                  onUnpin={handleUnpin}
                  onRemove={handleRemove}
                  isProcessing={processingIds.has(view.id)}
                />
              ))
            )}
          </div>
        </div>

        {/* Right navigation arrow */}
        {showNavigation && canScrollRight && (
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 shrink-0 absolute right-4 z-10 bg-background/80 backdrop-blur-sm"
            onClick={() => scroll('right')}
          >
            <ChevronRight className="h-4 w-4" />
            <span className="sr-only">{t('scrollRight')}</span>
          </Button>
        )}
      </div>
    </TooltipProvider>
  )
}

/**
 * Compact version of PinnedItemsBar for smaller spaces
 */
export function CompactPinnedItemsBar({ className }: { className?: string }) {
  const t = useTranslations('savedViews')
  const { savedViews: pinnedViews, isLoading } = usePinnedViews()

  if (!isLoading && pinnedViews.length === 0) {
    return null
  }

  return (
    <TooltipProvider delayDuration={300}>
      <div className={cn("flex items-center gap-1", className)}>
        {isLoading ? (
          <>
            <Skeleton className="h-6 w-6 rounded" />
            <Skeleton className="h-6 w-6 rounded" />
          </>
        ) : (
          pinnedViews.slice(0, 5).map((view) => {
            const IconComponent = entityTypeIcons[view.entityType] || FileText
            const basePath = entityTypeRoutes[view.entityType] || '/dashboard'
            const href = `${basePath}/${view.entityId}`

            return (
              <Tooltip key={view.id}>
                <TooltipTrigger asChild>
                  <Link
                    href={href}
                    className="group flex items-center justify-center h-7 w-7 rounded bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <IconComponent className="h-3.5 w-3.5 text-muted-foreground group-hover:text-foreground transition-colors" />
                  </Link>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{view.name}</p>
                </TooltipContent>
              </Tooltip>
            )
          })
        )}
        {pinnedViews.length > 5 && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
              >
                <MoreHorizontal className="h-3.5 w-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{t('morePinned', { count: pinnedViews.length - 5 })}</p>
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </TooltipProvider>
  )
}

export default PinnedItemsBar
