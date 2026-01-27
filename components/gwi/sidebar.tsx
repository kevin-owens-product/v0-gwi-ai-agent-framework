"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState, useEffect, useRef, useCallback, createContext, useContext } from "react"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  ClipboardList,
  FileQuestion,
  MessageSquare,
  Send,
  Tags,
  GitBranch,
  CheckCircle,
  Workflow,
  Play,
  Calendar,
  ShieldCheck,
  Brain,
  FileCode,
  BarChart3,
  TestTube,
  Bot,
  Wrench,
  Puzzle,
  Database,
  RefreshCw,
  Activity,
  AlertTriangle,
  Bell,
  Settings,
  Users,
  FileText,
  Key,
  LogOut,
  ChevronDown,
  Sparkles,
  LineChart,
  Layers,
  Briefcase,
  Building2,
  FolderKanban,
  Clock,
  Receipt,
  Truck,
  UsersRound,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useGWIAdmin } from "@/components/providers/gwi-provider"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { useSidebar } from "@/components/providers/sidebar-provider"

interface NavItem {
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  badge?: string | number
}

interface NavSection {
  title: string
  items: NavItem[]
  defaultOpen?: boolean
}

// Storage key for persisting menu state
const SIDEBAR_STATE_KEY = "gwi-sidebar-state"

// Context for sidebar-wide controls
interface SidebarContextType {
  expandAll: () => void
  collapseAll: () => void
  registerSection: (title: string, setIsOpen: (open: boolean) => void) => void
  unregisterSection: (title: string) => void
}

const SidebarContext = createContext<SidebarContextType | null>(null)

function useSidebarContext() {
  return useContext(SidebarContext)
}

// Helper to load persisted state
function loadPersistedState(): Record<string, boolean> {
  if (typeof window === "undefined") return {}
  try {
    const stored = localStorage.getItem(SIDEBAR_STATE_KEY)
    return stored ? JSON.parse(stored) : {}
  } catch {
    return {}
  }
}

// Helper to save state
function savePersistedState(state: Record<string, boolean>) {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(SIDEBAR_STATE_KEY, JSON.stringify(state))
  } catch {
    // Ignore storage errors
  }
}

const navSections: NavSection[] = [
  {
    title: "Overview",
    defaultOpen: true,
    items: [
      { name: "Dashboard", href: "/gwi", icon: LayoutDashboard },
      { name: "Activity Feed", href: "/gwi/activity", icon: Activity },
      { name: "Quick Actions", href: "/gwi/quick-actions", icon: Sparkles },
    ],
  },
  {
    title: "Survey Management",
    defaultOpen: true,
    items: [
      { name: "Surveys", href: "/gwi/surveys", icon: ClipboardList },
      { name: "Questions", href: "/gwi/surveys/questions", icon: FileQuestion },
      { name: "Responses", href: "/gwi/surveys/responses", icon: MessageSquare },
      { name: "Distribution", href: "/gwi/surveys/distribution", icon: Send },
    ],
  },
  {
    title: "Taxonomy",
    defaultOpen: false,
    items: [
      { name: "Categories", href: "/gwi/taxonomy", icon: Tags },
      { name: "Attributes", href: "/gwi/taxonomy/attributes", icon: Layers },
      { name: "Mapping Rules", href: "/gwi/taxonomy/mappings", icon: GitBranch },
      { name: "Validation", href: "/gwi/taxonomy/validation", icon: CheckCircle },
    ],
  },
  {
    title: "Data Pipelines",
    defaultOpen: false,
    items: [
      { name: "Pipelines", href: "/gwi/pipelines", icon: Workflow },
      { name: "Pipeline Runs", href: "/gwi/pipelines/runs", icon: Play },
      { name: "Schedules", href: "/gwi/pipelines/schedules", icon: Calendar },
      { name: "Validation Rules", href: "/gwi/pipelines/validation", icon: ShieldCheck },
    ],
  },
  {
    title: "LLM Configuration",
    defaultOpen: false,
    items: [
      { name: "Models", href: "/gwi/llm", icon: Brain },
      { name: "Prompts", href: "/gwi/llm/prompts", icon: FileCode },
      { name: "Usage & Costs", href: "/gwi/llm/usage", icon: BarChart3 },
      { name: "Testing", href: "/gwi/llm/testing", icon: TestTube },
    ],
  },
  {
    title: "Agent Configuration",
    defaultOpen: false,
    items: [
      { name: "System Agents", href: "/gwi/agents", icon: Bot },
      { name: "Agent Templates", href: "/gwi/agents/templates", icon: FileCode },
      { name: "Tools", href: "/gwi/agents/tools", icon: Wrench },
      { name: "Capabilities", href: "/gwi/agents/capabilities", icon: Puzzle },
    ],
  },
  {
    title: "Data Sources",
    defaultOpen: false,
    items: [
      { name: "Connections", href: "/gwi/data-sources", icon: Database },
      { name: "Schemas", href: "/gwi/data-sources/schemas", icon: FileText },
      { name: "Sync Status", href: "/gwi/data-sources/sync", icon: RefreshCw },
      { name: "Data Quality", href: "/gwi/data-sources/quality", icon: LineChart },
    ],
  },
  {
    title: "Monitoring",
    defaultOpen: false,
    items: [
      { name: "Pipeline Health", href: "/gwi/monitoring/pipelines", icon: Activity },
      { name: "LLM Performance", href: "/gwi/monitoring/llm", icon: BarChart3 },
      { name: "Error Logs", href: "/gwi/monitoring/errors", icon: AlertTriangle },
      { name: "Alerts", href: "/gwi/monitoring/alerts", icon: Bell },
    ],
  },
  {
    title: "System",
    defaultOpen: false,
    items: [
      { name: "Settings", href: "/gwi/system/settings", icon: Settings },
      { name: "Access Control", href: "/gwi/system/access", icon: Users },
      { name: "Audit Logs", href: "/gwi/system/audit", icon: FileText },
      { name: "API Keys", href: "/gwi/system/api-keys", icon: Key },
    ],
  },
  {
    title: "Services Management",
    defaultOpen: false,
    items: [
      { name: "Dashboard", href: "/gwi/services", icon: Briefcase },
      { name: "Clients", href: "/gwi/services/clients", icon: Building2 },
      { name: "Projects", href: "/gwi/services/projects", icon: FolderKanban },
      { name: "Time Tracking", href: "/gwi/services/time", icon: Clock },
      { name: "Invoicing", href: "/gwi/services/invoicing", icon: Receipt },
      { name: "Vendors", href: "/gwi/services/vendors", icon: Truck },
      { name: "Team", href: "/gwi/services/team", icon: UsersRound },
    ],
  },
]

function NavSectionComponent({ section }: { section: NavSection }) {
  const pathname = usePathname()
  const sidebarContext = useSidebarContext()

  // Track if user has manually interacted with this section
  const userInteracted = useRef(false)
  const initializedRef = useRef(false)

  // Initialize state from persisted storage or defaults
  const [isOpen, setIsOpen] = useState(() => {
    const persisted = loadPersistedState()
    if (section.title in persisted) {
      return persisted[section.title]
    }
    return section.defaultOpen ?? false
  })

  const isActive = (href: string) => {
    if (href === "/gwi") return pathname === "/gwi"
    return pathname.startsWith(href)
  }

  const hasActiveItem = section.items.some((item) => isActive(item.href))

  // Handle open state changes with persistence
  const handleOpenChange = useCallback((open: boolean) => {
    userInteracted.current = true
    setIsOpen(open)

    // Persist to localStorage
    const currentState = loadPersistedState()
    currentState[section.title] = open
    savePersistedState(currentState)
  }, [section.title])

  // Auto-expand on initial render if has active item and user hasn't interacted
  useEffect(() => {
    if (!initializedRef.current && hasActiveItem && !userInteracted.current) {
      setIsOpen(true)
      initializedRef.current = true
    }
  }, [hasActiveItem])

  // Register with sidebar context for expand/collapse all
  useEffect(() => {
    if (sidebarContext) {
      sidebarContext.registerSection(section.title, (open) => {
        userInteracted.current = true
        setIsOpen(open)
        const currentState = loadPersistedState()
        currentState[section.title] = open
        savePersistedState(currentState)
      })
      return () => sidebarContext.unregisterSection(section.title)
    }
  }, [sidebarContext, section.title])

  return (
    <Collapsible open={isOpen} onOpenChange={handleOpenChange} className="mb-1">
      <CollapsibleTrigger asChild>
        <button
          className={cn(
            "flex w-full items-center justify-between px-3 py-2 text-xs font-semibold uppercase tracking-wider rounded-md transition-all duration-200",
            isOpen || hasActiveItem
              ? "text-emerald-200 bg-emerald-900/50"
              : "text-slate-400 hover:text-slate-300 hover:bg-slate-800/30"
          )}
          aria-expanded={isOpen}
        >
          <span className="flex items-center gap-2">
            {section.title}
            {hasActiveItem && !isOpen && (
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" title="Contains active page" />
            )}
          </span>
          <ChevronDown
            className={cn(
              "h-3.5 w-3.5 transition-transform duration-200 ease-out",
              isOpen ? "rotate-0" : "-rotate-90"
            )}
          />
        </button>
      </CollapsibleTrigger>
      <CollapsibleContent className="mt-1 animate-in fade-in-0 slide-in-from-top-1 duration-200">
        <div className="space-y-0.5 pl-1">
          {section.items.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150",
                isActive(item.href)
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white hover:translate-x-0.5"
              )}
            >
              <item.icon className="h-4 w-4 flex-shrink-0" />
              <span className="truncate">{item.name}</span>
              {item.badge && (
                <span className="ml-auto flex h-5 min-w-[20px] items-center justify-center rounded-full bg-emerald-500 px-1.5 text-xs font-medium text-white">
                  {item.badge}
                </span>
              )}
            </Link>
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}

function SidebarContent({ onLogout }: { onLogout: () => void }) {
  const { admin } = useGWIAdmin()

  // Track all section setters for expand/collapse all
  const sectionSettersRef = useRef<Map<string, (open: boolean) => void>>(new Map())

  const registerSection = useCallback((title: string, setIsOpen: (open: boolean) => void) => {
    sectionSettersRef.current.set(title, setIsOpen)
  }, [])

  const unregisterSection = useCallback((title: string) => {
    sectionSettersRef.current.delete(title)
  }, [])

  const expandAll = useCallback(() => {
    sectionSettersRef.current.forEach((setIsOpen) => setIsOpen(true))
  }, [])

  const collapseAll = useCallback(() => {
    sectionSettersRef.current.forEach((setIsOpen) => setIsOpen(false))
  }, [])

  const sidebarContextValue: SidebarContextType = {
    expandAll,
    collapseAll,
    registerSection,
    unregisterSection,
  }

  return (
    <SidebarContext.Provider value={sidebarContextValue}>
      {/* Logo */}
      <div className="flex h-16 items-center border-b border-slate-700 px-6">
        <Link href="/gwi" className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-600">
            <Database className="h-5 w-5 text-white" />
          </div>
          <div>
            <span className="text-base font-semibold text-white">GWI Portal</span>
            <p className="text-xs text-slate-400">Team Tools</p>
          </div>
        </Link>
      </div>

      {/* Navigation Controls */}
      <div className="px-3 pt-3 pb-1 flex justify-end">
        <button
          onClick={expandAll}
          className="text-xs text-slate-500 hover:text-slate-300 px-2 py-1 rounded transition-colors"
          title="Expand all sections"
          aria-label="Expand all sections"
        >
          Expand all
        </button>
        <span className="text-slate-600 mx-1">|</span>
        <button
          onClick={collapseAll}
          className="text-xs text-slate-500 hover:text-slate-300 px-2 py-1 rounded transition-colors"
          title="Collapse all sections"
          aria-label="Collapse all sections"
        >
          Collapse all
        </button>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 py-2 px-3">
        {navSections.map((section) => (
          <NavSectionComponent key={section.title} section={section} />
        ))}
      </ScrollArea>

      {/* User Section */}
      <div className="border-t border-slate-700 p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="h-10 w-10 rounded-full bg-emerald-600/20 flex items-center justify-center">
            <span className="text-sm font-medium text-emerald-400">
              {admin.name.split(" ").map(n => n[0]).join("").toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{admin.name}</p>
            <p className="text-xs text-slate-400 truncate">{admin.role.replace(/_/g, " ")}</p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="w-full border-slate-600 text-slate-300 hover:bg-slate-800 hover:text-white"
          onClick={onLogout}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Sign out
        </Button>
      </div>
    </SidebarContext.Provider>
  )
}

export function GWISidebar() {
  const { admin } = useGWIAdmin()
  const { isMobileOpen, setMobileOpen } = useSidebar()

  // Track all section setters for expand/collapse all
  const sectionSettersRef = useRef<Map<string, (open: boolean) => void>>(new Map())

  const registerSection = useCallback((title: string, setIsOpen: (open: boolean) => void) => {
    sectionSettersRef.current.set(title, setIsOpen)
  }, [])

  const unregisterSection = useCallback((title: string) => {
    sectionSettersRef.current.delete(title)
  }, [])

  const expandAll = useCallback(() => {
    sectionSettersRef.current.forEach((setIsOpen) => setIsOpen(true))
  }, [])

  const collapseAll = useCallback(() => {
    sectionSettersRef.current.forEach((setIsOpen) => setIsOpen(false))
  }, [])

  const sidebarContextValue: SidebarContextType = {
    expandAll,
    collapseAll,
    registerSection,
    unregisterSection,
  }

  const handleLogout = async () => {
    await fetch("/api/gwi/auth/logout", { method: "POST" })
    window.location.href = "/login?type=gwi"
  }

  return (
    <SidebarContext.Provider value={sidebarContextValue}>
      {/* Desktop Sidebar */}
      <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-slate-700 bg-slate-900 hidden lg:flex flex-col">
        <SidebarContent onLogout={handleLogout} />
      </aside>

      {/* Mobile Sidebar */}
      <Sheet open={isMobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-64 p-0 bg-slate-900 border-slate-700">
          <SheetHeader className="sr-only">
            <SheetTitle>Navigation Menu</SheetTitle>
          </SheetHeader>
          <div className="flex flex-col h-full">
            <SidebarContent onLogout={handleLogout} />
          </div>
        </SheetContent>
      </Sheet>
    </SidebarContext.Provider>
  )
}
