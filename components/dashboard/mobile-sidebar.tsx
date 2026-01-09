"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  X,
  LayoutDashboard,
  Bot,
  Workflow,
  Brain,
  Settings,
  HelpCircle,
  Plus,
  BarChart3,
  FileText,
  Store,
  Plug,
  Folder,
  Inbox,
  LayoutTemplate,
  Sparkles,
} from "lucide-react"
import { Button } from "@/components/ui/button"

const mobileNavGroups = [
  {
    section: "Work",
    items: [
      { name: "Home", href: "/dashboard", icon: LayoutDashboard },
      { name: "Playground", href: "/dashboard/playground", icon: Sparkles },
      { name: "Inbox", href: "/dashboard/inbox", icon: Inbox, badge: 3 },
    ],
  },
  {
    section: "Projects",
    items: [{ name: "All Projects", href: "/dashboard/projects", icon: Folder }],
  },
  {
    section: "Build",
    items: [
      { name: "Workflows", href: "/dashboard/workflows", icon: Workflow },
      { name: "Agents", href: "/dashboard/agents", icon: Bot },
      { name: "Templates", href: "/dashboard/templates", icon: LayoutTemplate },
    ],
  },
  {
    section: "Discover",
    items: [
      { name: "Agent Store", href: "/dashboard/store", icon: Store },
      { name: "Reports", href: "/dashboard/reports", icon: FileText },
      { name: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
    ],
  },
  {
    section: "System",
    items: [
      { name: "Integrations", href: "/dashboard/integrations", icon: Plug },
      { name: "Memory", href: "/dashboard/memory", icon: Brain },
      { name: "Settings", href: "/dashboard/settings", icon: Settings },
      { name: "Help", href: "/dashboard/help", icon: HelpCircle },
    ],
  },
]

interface MobileSidebarProps {
  open: boolean
  onClose: () => void
}

export function MobileSidebar({ open, onClose }: MobileSidebarProps) {
  const pathname = usePathname()

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-y-0 left-0 w-72 bg-sidebar border-r border-sidebar-border flex flex-col">
        {/* Header */}
        <div className="flex h-14 items-center justify-between border-b border-sidebar-border px-4">
          <Link href="/" className="flex items-center gap-2" onClick={onClose}>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent">
              <span className="text-sm font-bold text-accent-foreground">G</span>
            </div>
            <span className="text-base font-semibold text-sidebar-foreground">GWI Insights</span>
          </Link>
          <button onClick={onClose} className="p-2 text-sidebar-foreground/70 hover:text-sidebar-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Quick Action */}
        <div className="p-3 border-b border-sidebar-border">
          <Link href="/dashboard/playground" onClick={onClose}>
            <Button className="w-full gap-2" size="sm">
              <Plus className="h-4 w-4" />
              New Session
            </Button>
          </Link>
        </div>

        {/* Navigation Groups */}
        <nav className="flex-1 overflow-y-auto py-2 px-2">
          {mobileNavGroups.map((group) => (
            <div key={group.section} className="mb-3">
              <div className="px-3 py-1.5 text-[11px] font-medium uppercase tracking-wider text-sidebar-foreground/40">
                {group.section}
              </div>
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={onClose}
                      className={cn(
                        "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                        isActive
                          ? "bg-sidebar-accent text-sidebar-accent-foreground"
                          : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground",
                      )}
                    >
                      <item.icon className="h-4 w-4" />
                      {item.name}
                      {item.badge && (
                        <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1.5 text-[11px] font-medium text-accent-foreground">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  )
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* User Section */}
        <div className="border-t border-sidebar-border p-3">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-accent to-accent/60 flex items-center justify-center">
              <span className="text-xs font-medium text-accent-foreground">JD</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-sidebar-foreground truncate">John Doe</p>
              <p className="text-xs text-sidebar-foreground/50 truncate">john@company.com</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
