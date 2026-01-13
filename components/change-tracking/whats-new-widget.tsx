"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Sparkles,
  Bell,
  ChevronRight,
  Users,
  BarChart3,
  Lightbulb,
  PieChart,
  FileText,
  LayoutDashboard,
  Target,
  Check,
  X,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface NewItemCategory {
  entityType: string
  count: number
  label: string
  items?: Array<{
    id: string
    name: string
    createdAt: string
  }>
}

interface WhatsNewData {
  since: string
  newItems: NewItemCategory[]
  totalNewItems: number
  changesCount: number
  categories: NewItemCategory[]
}

interface WhatsNewWidgetProps {
  variant?: "compact" | "expanded" | "popover"
  onViewAll?: () => void
  onViewItem?: (entityType: string, entityId: string) => void
  className?: string
}

const ENTITY_ICONS: Record<string, React.ReactNode> = {
  audience: <Users className="h-4 w-4" />,
  crosstab: <BarChart3 className="h-4 w-4" />,
  insight: <Lightbulb className="h-4 w-4" />,
  chart: <PieChart className="h-4 w-4" />,
  report: <FileText className="h-4 w-4" />,
  dashboard: <LayoutDashboard className="h-4 w-4" />,
  brand_tracking: <Target className="h-4 w-4" />,
}

const ENTITY_COLORS: Record<string, string> = {
  audience: "text-blue-500",
  crosstab: "text-purple-500",
  insight: "text-amber-500",
  chart: "text-green-500",
  report: "text-pink-500",
  dashboard: "text-cyan-500",
  brand_tracking: "text-orange-500",
}

export function WhatsNewWidget({
  variant = "compact",
  onViewAll,
  onViewItem,
  className,
}: WhatsNewWidgetProps) {
  const [data, setData] = useState<WhatsNewData | null>(null)
  const [loading, setLoading] = useState(true)
  const [dismissed, setDismissed] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    fetchWhatsNew()
  }, [])

  const fetchWhatsNew = async () => {
    try {
      const response = await fetch("/api/v1/changes/whats-new")
      if (response.ok) {
        const result = await response.json()
        setData(result)
      }
    } catch (error) {
      console.error("Failed to fetch what's new:", error)
    } finally {
      setLoading(false)
    }
  }

  const markAsSeen = async () => {
    try {
      await fetch("/api/v1/changes/whats-new", { method: "POST" })
      setDismissed(true)
    } catch (error) {
      console.error("Failed to mark as seen:", error)
    }
  }

  const formatSince = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return "today"
    if (diffDays === 1) return "yesterday"
    if (diffDays < 7) return `${diffDays} days ago`
    return date.toLocaleDateString()
  }

  const totalCount = data ? data.totalNewItems + data.changesCount : 0

  if (loading) {
    if (variant === "popover") {
      return (
        <Button variant="ghost" size="icon" className="relative" disabled>
          <Bell className="h-5 w-5" />
        </Button>
      )
    }
    return <Skeleton className={cn("h-32 w-full", className)} />
  }

  if (!data || (totalCount === 0 && variant !== "expanded")) {
    if (variant === "popover") {
      return (
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
        </Button>
      )
    }
    return null
  }

  if (dismissed && variant !== "expanded") {
    return null
  }

  // Popover variant
  if (variant === "popover") {
    return (
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            {totalCount > 0 && (
              <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                {totalCount > 99 ? "99+" : totalCount}
              </span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-0" align="end">
          <div className="p-4 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                <h4 className="font-semibold">What&apos;s New</h4>
              </div>
              <Badge variant="secondary">{totalCount} updates</Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Since {formatSince(data.since)}
            </p>
          </div>

          <div className="max-h-80 overflow-y-auto">
            {data.categories.length > 0 ? (
              <div className="divide-y">
                {data.categories.map((category) => (
                  <div key={category.entityType} className="p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={ENTITY_COLORS[category.entityType]}>
                        {ENTITY_ICONS[category.entityType]}
                      </span>
                      <span className="font-medium text-sm">{category.label}</span>
                      <Badge variant="secondary" className="ml-auto text-xs">
                        {category.count}
                      </Badge>
                    </div>
                    {category.items && category.items.slice(0, 3).map((item) => (
                      <button
                        key={item.id}
                        className="w-full text-left p-2 rounded hover:bg-muted text-sm flex items-center gap-2"
                        onClick={() => {
                          onViewItem?.(category.entityType, item.id)
                          setIsOpen(false)
                        }}
                      >
                        <span className="truncate flex-1">{item.name}</span>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center">
                <Check className="h-8 w-8 mx-auto text-green-500 mb-2" />
                <p className="text-sm text-muted-foreground">You&apos;re all caught up!</p>
              </div>
            )}
          </div>

          <div className="p-3 border-t bg-muted/30">
            <div className="flex items-center gap-2">
              <Button
                variant="default"
                size="sm"
                className="flex-1"
                onClick={() => {
                  onViewAll?.()
                  setIsOpen(false)
                }}
              >
                View All Changes
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  markAsSeen()
                  setIsOpen(false)
                }}
              >
                Mark as Seen
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    )
  }

  // Compact variant
  if (variant === "compact") {
    return (
      <Card className={cn("p-4", className)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h4 className="font-medium">What&apos;s New</h4>
              <p className="text-sm text-muted-foreground">
                {totalCount} updates since {formatSince(data.since)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="default" size="sm" onClick={onViewAll}>
              View All
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setDismissed(true)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Quick categories */}
        {data.categories.length > 0 && (
          <div className="flex items-center gap-4 mt-4 pt-4 border-t">
            {data.categories.slice(0, 4).map((category) => (
              <div key={category.entityType} className="flex items-center gap-2">
                <span className={ENTITY_COLORS[category.entityType]}>
                  {ENTITY_ICONS[category.entityType]}
                </span>
                <span className="text-sm">
                  {category.count} {category.label.toLowerCase()}
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>
    )
  }

  // Expanded variant
  return (
    <Card className={cn("p-6", className)}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Sparkles className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">What&apos;s New</h3>
            <p className="text-sm text-muted-foreground">
              Updates since {formatSince(data.since)}
            </p>
          </div>
        </div>
        <Badge variant="secondary" className="text-lg px-4 py-1">
          {totalCount} updates
        </Badge>
      </div>

      {data.categories.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {data.categories.map((category) => (
            <Card
              key={category.entityType}
              className="p-4 hover:border-primary/50 transition-colors cursor-pointer"
              onClick={() => onViewAll?.()}
            >
              <div className="flex items-center gap-3 mb-3">
                <div
                  className={cn(
                    "h-10 w-10 rounded-lg flex items-center justify-center",
                    `bg-${category.entityType === "audience" ? "blue" : category.entityType === "insight" ? "amber" : "primary"}-100`,
                    ENTITY_COLORS[category.entityType]
                  )}
                >
                  {ENTITY_ICONS[category.entityType]}
                </div>
                <div>
                  <h4 className="font-medium">{category.label}</h4>
                  <p className="text-sm text-muted-foreground">
                    {category.count} new
                  </p>
                </div>
              </div>

              {category.items && category.items.length > 0 && (
                <div className="space-y-2">
                  {category.items.slice(0, 3).map((item) => (
                    <button
                      key={item.id}
                      className="w-full text-left p-2 rounded bg-muted/50 hover:bg-muted text-sm flex items-center justify-between"
                      onClick={(e) => {
                        e.stopPropagation()
                        onViewItem?.(category.entityType, item.id)
                      }}
                    >
                      <span className="truncate">{item.name}</span>
                      <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    </button>
                  ))}
                  {category.items.length > 3 && (
                    <p className="text-xs text-muted-foreground text-center">
                      +{category.items.length - 3} more
                    </p>
                  )}
                </div>
              )}
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <Check className="h-12 w-12 mx-auto text-green-500 mb-4" />
          <h4 className="font-medium mb-2">You&apos;re All Caught Up!</h4>
          <p className="text-sm text-muted-foreground">
            No new updates since your last visit.
          </p>
        </div>
      )}

      <div className="flex items-center justify-end gap-2 mt-6 pt-6 border-t">
        <Button variant="outline" onClick={markAsSeen}>
          Mark All as Seen
        </Button>
        <Button onClick={onViewAll}>
          View All Changes
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    </Card>
  )
}
