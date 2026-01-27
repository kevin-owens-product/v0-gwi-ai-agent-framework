"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useTranslations } from "next-intl"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Bot,
  Workflow,
  Brain,
  Settings,
  HelpCircle,
  ChevronDown,
  ChevronRight,
  Plus,
  BarChart3,
  FileText,
  Store,
  Plug,
  Folder,
  Inbox,
  LayoutTemplate,
  Sparkles,
  Search,
  Layers,
  Users,
  Table2,
  PieChart,
  Target,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { OrganizationSwitcher } from "./OrganizationSwitcher"
import { LanguageSwitcher } from "@/components/ui/language-switcher"

// Storage key for persisting sidebar state
const SIDEBAR_COMPACT_KEY = "dashboard-sidebar-compact"

// Helper to load persisted state
function loadCompactState(): boolean {
  if (typeof window === "undefined") return false
  try {
    const stored = localStorage.getItem(SIDEBAR_COMPACT_KEY)
    return stored === "true"
  } catch {
    return false
  }
}

// Helper to save state
function saveCompactState(isCompact: boolean) {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(SIDEBAR_COMPACT_KEY, String(isCompact))
  } catch {
    // Ignore storage errors
  }
}

// Navigation configuration using translation keys
const getNavGroups = (t: ReturnType<typeof useTranslations<'dashboard.sidebar'>>) => [
  {
    id: "work",
    label: t('sections.work'),
    defaultOpen: true,
    items: [
      { name: t('items.home'), href: "/dashboard", icon: LayoutDashboard, description: t('items.homeDesc') },
      { name: t('items.playground'), href: "/dashboard/playground", icon: Sparkles, description: t('items.playgroundDesc') },
      { name: t('items.inbox'), href: "/dashboard/inbox", icon: Inbox, badge: 3, description: t('items.inboxDesc') },
    ],
  },
  {
    id: "projects",
    label: t('sections.projects'),
    defaultOpen: true,
    items: [{ name: t('items.allProjects'), href: "/dashboard/projects", icon: Folder, description: t('items.allProjectsDesc') }],
    children: [
      { name: "Gen Z Sustainability", href: "/dashboard/projects/gen-z-sustainability", color: "bg-emerald-500" },
      { name: "Q4 Campaign", href: "/dashboard/projects/q4-campaign", color: "bg-blue-500" },
      { name: "Market Expansion", href: "/dashboard/projects/market-expansion", color: "bg-amber-500" },
    ],
  },
  {
    id: "gwi-tools",
    label: t('sections.gwiTools'),
    defaultOpen: true,
    items: [
      { name: t('items.audiences'), href: "/dashboard/audiences", icon: Users, description: t('items.audiencesDesc') },
      { name: t('items.brandTracking'), href: "/dashboard/brand-tracking", icon: Target, description: t('items.brandTrackingDesc') },
      { name: t('items.charts'), href: "/dashboard/charts", icon: BarChart3, description: t('items.chartsDesc') },
      { name: t('items.crosstabs'), href: "/dashboard/crosstabs", icon: Table2, description: t('items.crosstabsDesc') },
      { name: t('items.dashboards'), href: "/dashboard/dashboards", icon: PieChart, description: t('items.dashboardsDesc') },
    ],
  },
  {
    id: "build",
    label: t('sections.build'),
    defaultOpen: false,
    items: [
      { name: t('items.workflows'), href: "/dashboard/workflows", icon: Workflow, description: t('items.workflowsDesc') },
      { name: t('items.agents'), href: "/dashboard/agents", icon: Bot, description: t('items.agentsDesc') },
      { name: t('items.templates'), href: "/dashboard/templates", icon: LayoutTemplate, description: t('items.templatesDesc') },
    ],
  },
  {
    id: "discover",
    label: t('sections.discover'),
    defaultOpen: false,
    items: [
      { name: t('items.agentStore'), href: "/dashboard/store", icon: Store, description: t('items.agentStoreDesc') },
      { name: t('items.reports'), href: "/dashboard/reports", icon: FileText, description: t('items.reportsDesc') },
      { name: t('items.analytics'), href: "/dashboard/analytics", icon: BarChart3, description: t('items.analyticsDesc') },
    ],
  },
  {
    id: "system",
    label: t('sections.system'),
    defaultOpen: false,
    items: [
      { name: t('items.integrations'), href: "/dashboard/integrations", icon: Plug, description: t('items.integrationsDesc') },
      { name: t('items.memory'), href: "/dashboard/memory", icon: Brain, description: t('items.memoryDesc') },
    ],
  },
]

const getBottomNavItems = (t: ReturnType<typeof useTranslations<'dashboard.sidebar'>>) => [
  { name: t('items.settings'), href: "/dashboard/settings", icon: Settings },
  { name: t('items.help'), href: "/dashboard/help", icon: HelpCircle },
]

export function DashboardSidebar() {
  const pathname = usePathname()
  const t = useTranslations('dashboard.sidebar')

  const navGroups = getNavGroups(t)
  const bottomNavItems = getBottomNavItems(t)

  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {}
    navGroups.forEach((group) => {
      initial[group.id] = group.defaultOpen
    })
    return initial
  })
  const [isCompact, setIsCompact] = useState(() => loadCompactState())

  // Persist compact state changes
  const handleCompactChange = (compact: boolean) => {
    setIsCompact(compact)
    saveCompactState(compact)
  }

  const toggleGroup = (groupId: string) => {
    setOpenGroups((prev) => ({ ...prev, [groupId]: !prev[groupId] }))
  }

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/")

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 h-screen border-r border-border bg-sidebar hidden lg:flex flex-col transition-all duration-200",
          isCompact ? "w-16" : "w-64",
        )}
      >
        {/* Logo */}
        <div
          className={cn(
            "flex h-14 items-center border-b border-sidebar-border",
            isCompact ? "justify-center px-2" : "px-4",
          )}
        >
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent shrink-0">
              <span className="text-sm font-bold text-accent-foreground">G</span>
            </div>
            {!isCompact && <span className="text-base font-semibold text-sidebar-foreground">{t('brandName')}</span>}
          </Link>
        </div>

        {/* Quick Actions */}
        <div className={cn("p-2 border-b border-sidebar-border", isCompact && "flex justify-center")}>
          {isCompact ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <Link href="/dashboard/playground">
                  <Button size="icon" className="h-9 w-9">
                    <Plus className="h-4 w-4" />
                  </Button>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right">{t('newSession')}</TooltipContent>
            </Tooltip>
          ) : (
            <div className="flex gap-2">
              <Link href="/dashboard/playground" className="flex-1">
                <Button className="w-full gap-2 h-9" size="sm">
                  <Plus className="h-4 w-4" />
                  {t('newSession')}
                </Button>
              </Link>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon" className="h-9 w-9 shrink-0 bg-transparent">
                    <Search className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">{t('searchShortcut')} (⌘K)</TooltipContent>
              </Tooltip>
            </div>
          )}
        </div>

        {/* Navigation Groups */}
        <nav className="flex-1 overflow-y-auto py-2">
          {navGroups.map((group) => (
            <div key={group.id} className="mb-1">
              {/* Group Header */}
              {!isCompact && (
                <button
                  onClick={() => toggleGroup(group.id)}
                  className="flex w-full items-center justify-between px-4 py-1.5 text-[11px] font-medium uppercase tracking-wider text-sidebar-foreground/40 hover:text-sidebar-foreground/60"
                >
                  {group.label}
                  <ChevronRight className={cn("h-3 w-3 transition-transform", openGroups[group.id] && "rotate-90")} />
                </button>
              )}

              {/* Group Items */}
              {(isCompact || openGroups[group.id]) && (
                <div className={cn("space-y-0.5", isCompact ? "px-2" : "px-2")}>
                  {group.items.map((item) =>
                    isCompact ? (
                      <Tooltip key={item.name}>
                        <TooltipTrigger asChild>
                          <Link
                            href={item.href}
                            className={cn(
                              "flex h-9 w-full items-center justify-center rounded-md transition-colors relative",
                              isActive(item.href)
                                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                                : "text-sidebar-foreground/60 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground",
                            )}
                          >
                            <item.icon className="h-4 w-4" />
                            {'badge' in item && item.badge && (
                              <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[10px] font-medium text-accent-foreground">
                                {item.badge}
                              </span>
                            )}
                          </Link>
                        </TooltipTrigger>
                        <TooltipContent side="right" className="flex flex-col">
                          <span className="font-medium">{item.name}</span>
                          <span className="text-xs text-muted-foreground">{item.description}</span>
                        </TooltipContent>
                      </Tooltip>
                    ) : (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={cn(
                          "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                          isActive(item.href)
                            ? "bg-sidebar-accent text-sidebar-accent-foreground"
                            : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground",
                        )}
                      >
                        <item.icon className="h-4 w-4 shrink-0" />
                        <span className="truncate">{item.name}</span>
                        {'badge' in item && item.badge && (
                          <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1.5 text-[11px] font-medium text-accent-foreground">
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    ),
                  )}

                  {/* Project Children */}
                  {group.children && !isCompact && (
                    <div className="ml-4 mt-1 space-y-0.5 border-l border-sidebar-border pl-3">
                      {group.children.map((child) => (
                        <Link
                          key={child.name}
                          href={child.href}
                          className={cn(
                            "flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors",
                            isActive(child.href)
                              ? "text-sidebar-accent-foreground font-medium"
                              : "text-sidebar-foreground/60 hover:text-sidebar-foreground",
                          )}
                        >
                          <div className={cn("h-2 w-2 rounded-full shrink-0", child.color)} />
                          <span className="truncate">{child.name}</span>
                        </Link>
                      ))}
                      <Link
                        href="/dashboard/projects"
                        className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-sidebar-foreground/40 hover:text-sidebar-foreground/60"
                      >
                        <Plus className="h-3 w-3" />
                        <span>{t('items.newProject')}</span>
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* Bottom Section */}
        <div className="border-t border-sidebar-border p-2 space-y-0.5">
          {bottomNavItems.map((item) =>
            isCompact ? (
              <Tooltip key={item.name}>
                <TooltipTrigger asChild>
                  <Link
                    href={item.href}
                    className="flex h-9 w-full items-center justify-center rounded-md text-sidebar-foreground/60 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                  >
                    <item.icon className="h-4 w-4" />
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right">{item.name}</TooltipContent>
              </Tooltip>
            ) : (
              <Link
                key={item.name}
                href={item.href}
                className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-sidebar-foreground/60 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
              >
                <item.icon className="h-4 w-4" />
                {item.name}
              </Link>
            ),
          )}

          {/* Language Switcher */}
          {!isCompact && (
            <div className="px-3 py-2">
              <LanguageSwitcher showLabel variant="ghost" size="sm" />
            </div>
          )}

          {/* Collapse Toggle */}
          {!isCompact && (
            <button
              onClick={() => handleCompactChange(true)}
              className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-sidebar-foreground/40 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
              aria-label="Collapse sidebar"
            >
              <Layers className="h-4 w-4" />
              {t('collapse')}
            </button>
          )}
        </div>

        {/* User Section */}
        <div className={cn("border-t border-sidebar-border", isCompact ? "p-2" : "p-3")}>
          {isCompact ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="flex h-9 w-full items-center justify-center rounded-md hover:bg-sidebar-accent/50">
                  <div className="h-7 w-7 rounded-full bg-gradient-to-br from-accent to-accent/60 flex items-center justify-center">
                    <span className="text-xs font-medium text-accent-foreground">JD</span>
                  </div>
                </button>
              </TooltipTrigger>
              <TooltipContent side="right">
                <div>
                  <p className="font-medium">John Doe</p>
                  <p className="text-xs text-muted-foreground">john@company.com</p>
                </div>
              </TooltipContent>
            </Tooltip>
          ) : (
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-accent to-accent/60 flex items-center justify-center shrink-0">
                <span className="text-xs font-medium text-accent-foreground">JD</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-sidebar-foreground truncate">John Doe</p>
                <p className="text-xs text-sidebar-foreground/50 truncate">john@company.com</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 shrink-0"
                onClick={() => handleCompactChange(true)}
                aria-label="Collapse sidebar"
              >
                <ChevronDown className="h-4 w-4 rotate-90" />
              </Button>
            </div>
          )}

          {/* Expand button when compact */}
          {isCompact && (
            <button
              onClick={() => handleCompactChange(false)}
              className="flex h-9 w-full items-center justify-center rounded-md text-sidebar-foreground/40 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground mt-1"
              aria-label="Expand sidebar"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          )}
        </div>
      </aside>
    </TooltipProvider>
  )
}

export { DashboardSidebar as Sidebar }
