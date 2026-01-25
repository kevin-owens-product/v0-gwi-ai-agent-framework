"use client"

/**
 * Shortcuts Modal Component
 *
 * Displays all available keyboard shortcuts grouped by category.
 * Accessible via the "?" key or from the settings menu.
 *
 * @module components/ui/shortcuts-modal
 */

import { Keyboard } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ShortcutKey } from "@/components/ui/shortcut-key"
import {
  DEFAULT_SHORTCUTS,
  getShortcutsByCategory,
  CATEGORY_LABELS,
  type ShortcutCategory,
  type ShortcutDefinition,
} from "@/lib/keyboard-shortcuts"
import { cn } from "@/lib/utils"

interface ShortcutsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  shortcuts?: ShortcutDefinition[]
}

/**
 * Modal displaying all available keyboard shortcuts
 *
 * @example
 * ```tsx
 * function App() {
 *   const [showShortcuts, setShowShortcuts] = useState(false)
 *
 *   useKeyboardShortcuts({
 *     handlers: {
 *       showShortcuts: () => setShowShortcuts(true)
 *     }
 *   })
 *
 *   return (
 *     <ShortcutsModal
 *       open={showShortcuts}
 *       onOpenChange={setShowShortcuts}
 *     />
 *   )
 * }
 * ```
 */
export function ShortcutsModal({
  open,
  onOpenChange,
  shortcuts = DEFAULT_SHORTCUTS,
}: ShortcutsModalProps) {
  const groupedShortcuts = getShortcutsByCategory(shortcuts)

  // Filter out empty categories
  const activeCategories = (Object.keys(groupedShortcuts) as ShortcutCategory[]).filter(
    (category) => groupedShortcuts[category].length > 0
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <div className="flex items-center gap-2">
            <Keyboard className="h-5 w-5 text-muted-foreground" />
            <DialogTitle>Keyboard Shortcuts</DialogTitle>
          </div>
          <DialogDescription>
            Navigate and perform actions quickly with keyboard shortcuts
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh]">
          <div className="p-6 space-y-6">
            {activeCategories.map((category) => (
              <ShortcutCategory
                key={category}
                title={CATEGORY_LABELS[category]}
                shortcuts={groupedShortcuts[category]}
              />
            ))}
          </div>
        </ScrollArea>

        <div className="border-t px-6 py-4 bg-muted/30">
          <p className="text-sm text-muted-foreground text-center">
            Press{" "}
            <ShortcutKey binding="escape" size="sm" variant="outline" />{" "}
            to close or{" "}
            <span className="text-foreground font-medium">
              Settings {">"} Shortcuts
            </span>{" "}
            to customize
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}

/**
 * Category section with shortcuts list
 */
function ShortcutCategory({
  title,
  shortcuts,
}: {
  title: string
  shortcuts: ShortcutDefinition[]
}) {
  // Only show enabled shortcuts
  const enabledShortcuts = shortcuts.filter((s) => s.enabledByDefault)

  if (enabledShortcuts.length === 0) return null

  return (
    <div>
      <h3 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wider">
        {title}
      </h3>
      <div className="space-y-1">
        {enabledShortcuts.map((shortcut) => (
          <ShortcutRow key={shortcut.id} shortcut={shortcut} />
        ))}
      </div>
    </div>
  )
}

/**
 * Individual shortcut row
 */
function ShortcutRow({ shortcut }: { shortcut: ShortcutDefinition }) {
  return (
    <div className="flex items-center justify-between py-2 px-3 rounded-md hover:bg-muted/50 transition-colors">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium">{shortcut.name}</p>
        <p className="text-xs text-muted-foreground truncate">
          {shortcut.description}
        </p>
      </div>
      <ShortcutKey
        binding={shortcut.defaultBinding}
        size="default"
        variant="outline"
        className="ml-4 shrink-0"
      />
    </div>
  )
}

/**
 * Compact shortcuts reference for tooltips or inline help
 */
export function ShortcutsReference({
  shortcuts = DEFAULT_SHORTCUTS,
  maxItems = 5,
  className,
}: {
  shortcuts?: ShortcutDefinition[]
  maxItems?: number
  className?: string
}) {
  const topShortcuts = shortcuts
    .filter((s) => s.enabledByDefault)
    .slice(0, maxItems)

  return (
    <div className={cn("space-y-2", className)}>
      {topShortcuts.map((shortcut) => (
        <div
          key={shortcut.id}
          className="flex items-center justify-between text-sm"
        >
          <span className="text-muted-foreground">{shortcut.name}</span>
          <ShortcutKey
            binding={shortcut.defaultBinding}
            size="sm"
            variant="ghost"
          />
        </div>
      ))}
      <div className="pt-2 border-t text-center">
        <span className="text-xs text-muted-foreground">
          Press <ShortcutKey binding="?" size="sm" variant="ghost" /> for all shortcuts
        </span>
      </div>
    </div>
  )
}
