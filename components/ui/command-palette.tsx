"use client"

/**
 * Command Palette Component
 *
 * A searchable command palette for quick navigation and actions.
 * Uses cmdk library for the core functionality.
 *
 * @module components/ui/command-palette
 */

import * as React from "react"
import { useCallback, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Command as CommandPrimitive } from "cmdk"
import {
  LayoutDashboard,
  Bot,
  FileText,
  Settings,
  Search,
  Workflow,
  Users,
  BarChart3,
  Plug,
  Brain,
  Store,
  Inbox,
  Folder,
  Plus,
  Keyboard,
  User,
  HelpCircle,
} from "lucide-react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { ShortcutKey } from "@/components/ui/shortcut-key"

export interface CommandItem {
  id: string
  name: string
  description?: string
  icon?: React.ComponentType<{ className?: string }>
  shortcut?: string
  action?: () => void
  href?: string
  category: "navigation" | "actions" | "recent" | "settings"
  keywords?: string[]
}

interface CommandPaletteProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  recentItems?: CommandItem[]
  customItems?: CommandItem[]
}

const defaultNavigationItems: CommandItem[] = [
  {
    id: "dashboard",
    name: "Dashboard",
    description: "Go to dashboard overview",
    icon: LayoutDashboard,
    shortcut: "g d",
    href: "/dashboard",
    category: "navigation",
    keywords: ["home", "overview"],
  },
  {
    id: "agents",
    name: "Agents",
    description: "Manage AI agents",
    icon: Bot,
    shortcut: "g a",
    href: "/dashboard/agents",
    category: "navigation",
    keywords: ["ai", "automation", "bots"],
  },
  {
    id: "workflows",
    name: "Workflows",
    description: "View and edit workflows",
    icon: Workflow,
    shortcut: "g w",
    href: "/dashboard/workflows",
    category: "navigation",
    keywords: ["automation", "pipelines"],
  },
  {
    id: "reports",
    name: "Reports",
    description: "View generated reports",
    icon: FileText,
    shortcut: "g r",
    href: "/dashboard/reports",
    category: "navigation",
    keywords: ["documents", "exports"],
  },
  {
    id: "analytics",
    name: "Analytics",
    description: "Usage and performance metrics",
    icon: BarChart3,
    href: "/dashboard/analytics",
    category: "navigation",
    keywords: ["stats", "metrics", "usage"],
  },
  {
    id: "integrations",
    name: "Integrations",
    description: "Connected services",
    icon: Plug,
    href: "/dashboard/integrations",
    category: "navigation",
    keywords: ["connections", "apps", "services"],
  },
  {
    id: "memory",
    name: "Memory",
    description: "Context and history",
    icon: Brain,
    href: "/dashboard/memory",
    category: "navigation",
    keywords: ["context", "history", "data"],
  },
  {
    id: "store",
    name: "Agent Store",
    description: "Browse pre-built agents",
    icon: Store,
    href: "/dashboard/store",
    category: "navigation",
    keywords: ["marketplace", "templates"],
  },
  {
    id: "inbox",
    name: "Inbox",
    description: "Automated request handling",
    icon: Inbox,
    href: "/dashboard/inbox",
    category: "navigation",
    keywords: ["messages", "requests", "notifications"],
  },
  {
    id: "projects",
    name: "Projects",
    description: "Manage all projects",
    icon: Folder,
    href: "/dashboard/projects",
    category: "navigation",
    keywords: ["workspaces", "folders"],
  },
  {
    id: "team",
    name: "Team",
    description: "Team members and invitations",
    icon: Users,
    href: "/dashboard/settings/team",
    category: "navigation",
    keywords: ["members", "users", "people"],
  },
  {
    id: "settings",
    name: "Settings",
    description: "Application settings",
    icon: Settings,
    shortcut: "g s",
    href: "/dashboard/settings",
    category: "navigation",
    keywords: ["preferences", "configuration"],
  },
]

const defaultActionItems: CommandItem[] = [
  {
    id: "new-agent",
    name: "New Agent",
    description: "Create a new AI agent",
    icon: Plus,
    href: "/dashboard/agents/new",
    category: "actions",
    keywords: ["create", "add"],
  },
  {
    id: "new-workflow",
    name: "New Workflow",
    description: "Create a new workflow",
    icon: Plus,
    href: "/dashboard/workflows/new",
    category: "actions",
    keywords: ["create", "add"],
  },
  {
    id: "new-report",
    name: "New Report",
    description: "Generate a new report",
    icon: Plus,
    href: "/dashboard/reports/new",
    category: "actions",
    keywords: ["create", "add"],
  },
]

const defaultSettingsItems: CommandItem[] = [
  {
    id: "profile",
    name: "Profile Settings",
    description: "Edit your profile",
    icon: User,
    href: "/dashboard/settings/profile",
    category: "settings",
  },
  {
    id: "shortcuts",
    name: "Keyboard Shortcuts",
    description: "View and customize shortcuts",
    icon: Keyboard,
    shortcut: "?",
    href: "/dashboard/settings/shortcuts",
    category: "settings",
  },
  {
    id: "help",
    name: "Help & Support",
    description: "Get help and documentation",
    icon: HelpCircle,
    href: "/dashboard/help",
    category: "settings",
  },
]

/**
 * Command Palette component for quick navigation and actions
 *
 * @example
 * ```tsx
 * function App() {
 *   const [open, setOpen] = useState(false)
 *
 *   useKeyboardShortcuts({
 *     handlers: {
 *       openCommandPalette: () => setOpen(true)
 *     }
 *   })
 *
 *   return <CommandPalette open={open} onOpenChange={setOpen} />
 * }
 * ```
 */
export function CommandPalette({
  open,
  onOpenChange,
  recentItems = [],
  customItems = [],
}: CommandPaletteProps) {
  const router = useRouter()
  const [search, setSearch] = useState("")

  const allItems = React.useMemo(() => {
    const items = [
      ...recentItems,
      ...defaultNavigationItems,
      ...defaultActionItems,
      ...defaultSettingsItems,
      ...customItems,
    ]
    // Remove duplicates by id
    return items.filter(
      (item, index, self) => index === self.findIndex((t) => t.id === item.id)
    )
  }, [recentItems, customItems])

  const runCommand = useCallback(
    (item: CommandItem) => {
      onOpenChange(false)
      setSearch("")

      if (item.action) {
        item.action()
      } else if (item.href) {
        router.push(item.href)
      }
    },
    [onOpenChange, router]
  )

  // Reset search when closing
  useEffect(() => {
    if (!open) {
      setSearch("")
    }
  }, [open])

  const groupedItems = React.useMemo(() => {
    const groups: Record<string, CommandItem[]> = {
      recent: [],
      navigation: [],
      actions: [],
      settings: [],
    }

    allItems.forEach((item) => {
      if (groups[item.category]) {
        groups[item.category].push(item)
      }
    })

    return groups
  }, [allItems])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="overflow-hidden p-0 shadow-lg max-w-[640px]"
        showCloseButton={false}
      >
        <CommandPrimitive
          className="flex h-full w-full flex-col overflow-hidden rounded-md bg-popover text-popover-foreground"
          loop
        >
          {/* Search Input */}
          <div className="flex items-center border-b px-3">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <CommandPrimitive.Input
              value={search}
              onValueChange={setSearch}
              placeholder="Type a command or search..."
              className="flex h-12 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
            />
            <ShortcutKey binding="escape" size="sm" variant="ghost" />
          </div>

          {/* Results List */}
          <CommandPrimitive.List className="max-h-[400px] overflow-y-auto overflow-x-hidden p-2">
            <CommandPrimitive.Empty className="py-6 text-center text-sm text-muted-foreground">
              No results found.
            </CommandPrimitive.Empty>

            {/* Recent Items */}
            {groupedItems.recent.length > 0 && (
              <CommandPrimitive.Group heading="Recent">
                <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                  Recent
                </div>
                {groupedItems.recent.map((item) => (
                  <CommandItemRow
                    key={item.id}
                    item={item}
                    onSelect={() => runCommand(item)}
                  />
                ))}
              </CommandPrimitive.Group>
            )}

            {/* Navigation */}
            {groupedItems.navigation.length > 0 && (
              <CommandPrimitive.Group>
                <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                  Navigation
                </div>
                {groupedItems.navigation.map((item) => (
                  <CommandItemRow
                    key={item.id}
                    item={item}
                    onSelect={() => runCommand(item)}
                  />
                ))}
              </CommandPrimitive.Group>
            )}

            {/* Actions */}
            {groupedItems.actions.length > 0 && (
              <CommandPrimitive.Group>
                <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                  Actions
                </div>
                {groupedItems.actions.map((item) => (
                  <CommandItemRow
                    key={item.id}
                    item={item}
                    onSelect={() => runCommand(item)}
                  />
                ))}
              </CommandPrimitive.Group>
            )}

            {/* Settings */}
            {groupedItems.settings.length > 0 && (
              <CommandPrimitive.Group>
                <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                  Settings
                </div>
                {groupedItems.settings.map((item) => (
                  <CommandItemRow
                    key={item.id}
                    item={item}
                    onSelect={() => runCommand(item)}
                  />
                ))}
              </CommandPrimitive.Group>
            )}
          </CommandPrimitive.List>

          {/* Footer */}
          <div className="flex items-center justify-between border-t px-3 py-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1">
                <ShortcutKey binding="arrowup" size="sm" variant="ghost" />
                <ShortcutKey binding="arrowdown" size="sm" variant="ghost" />
                <span>to navigate</span>
              </span>
              <span className="flex items-center gap-1">
                <ShortcutKey binding="enter" size="sm" variant="ghost" />
                <span>to select</span>
              </span>
            </div>
            <span className="flex items-center gap-1">
              <ShortcutKey binding="?" size="sm" variant="ghost" />
              <span>for shortcuts</span>
            </span>
          </div>
        </CommandPrimitive>
      </DialogContent>
    </Dialog>
  )
}

/**
 * Individual command item row
 */
function CommandItemRow({
  item,
  onSelect,
}: {
  item: CommandItem
  onSelect: () => void
}) {
  const Icon = item.icon

  return (
    <CommandPrimitive.Item
      value={`${item.name} ${item.description || ""} ${item.keywords?.join(" ") || ""}`}
      onSelect={onSelect}
      className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-2 text-sm outline-none data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground"
    >
      {Icon && <Icon className="mr-3 h-4 w-4 shrink-0 opacity-60" />}
      <div className="flex flex-col flex-1 min-w-0">
        <span className="truncate">{item.name}</span>
        {item.description && (
          <span className="text-xs text-muted-foreground truncate">
            {item.description}
          </span>
        )}
      </div>
      {item.shortcut && (
        <ShortcutKey
          binding={item.shortcut}
          size="sm"
          variant="ghost"
          className="ml-auto shrink-0"
        />
      )}
    </CommandPrimitive.Item>
  )
}

// Re-export Command primitives for custom usage
export {
  CommandPrimitive as Command,
}
