"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState, useEffect, useRef, useCallback, createContext, useContext } from "react"
import { useTranslations } from "next-intl"
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
import { LanguageSwitcher } from "@/components/ui/language-switcher"

interface NavItem {
  nameKey: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  badge?: string | number
}

interface NavSection {
  titleKey: string
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
    titleKey: "sections.overview",
    defaultOpen: true,
    items: [
      { nameKey: "items.dashboard", href: "/gwi", icon: LayoutDashboard },
      { nameKey: "items.activityFeed", href: "/gwi/activity", icon: Activity },
      { nameKey: "items.quickActions", href: "/gwi/quick-actions", icon: Sparkles },
    ],
  },
  {
    titleKey: "sections.surveyManagement",
    defaultOpen: true,
    items: [
      { nameKey: "items.surveys", href: "/gwi/surveys", icon: ClipboardList },
      { nameKey: "items.questions", href: "/gwi/surveys/questions", icon: FileQuestion },
      { nameKey: "items.responses", href: "/gwi/surveys/responses", icon: MessageSquare },
      { nameKey: "items.distribution", href: "/gwi/surveys/distribution", icon: Send },
    ],
  },
  {
    titleKey: "sections.taxonomy",
    defaultOpen: false,
    items: [
      { nameKey: "items.categories", href: "/gwi/taxonomy", icon: Tags },
      { nameKey: "items.attributes", href: "/gwi/taxonomy/attributes", icon: Layers },
      { nameKey: "items.mappingRules", href: "/gwi/taxonomy/mappings", icon: GitBranch },
      { nameKey: "items.validation", href: "/gwi/taxonomy/validation", icon: CheckCircle },
    ],
  },
  {
    titleKey: "sections.dataPipelines",
    defaultOpen: false,
    items: [
      { nameKey: "items.pipelines", href: "/gwi/pipelines", icon: Workflow },
      { nameKey: "items.pipelineRuns", href: "/gwi/pipelines/runs", icon: Play },
      { nameKey: "items.schedules", href: "/gwi/pipelines/schedules", icon: Calendar },
      { nameKey: "items.validationRules", href: "/gwi/pipelines/validation", icon: ShieldCheck },
    ],
  },
  {
    titleKey: "sections.llmConfiguration",
    defaultOpen: false,
    items: [
      { nameKey: "items.models", href: "/gwi/llm", icon: Brain },
      { nameKey: "items.prompts", href: "/gwi/llm/prompts", icon: FileCode },
      { nameKey: "items.usageCosts", href: "/gwi/llm/usage", icon: BarChart3 },
      { nameKey: "items.testing", href: "/gwi/llm/testing", icon: TestTube },
    ],
  },
  {
    titleKey: "sections.agentConfiguration",
    defaultOpen: false,
    items: [
      { nameKey: "items.systemAgents", href: "/gwi/agents", icon: Bot },
      { nameKey: "items.agentTemplates", href: "/gwi/agents/templates", icon: FileCode },
      { nameKey: "items.tools", href: "/gwi/agents/tools", icon: Wrench },
      { nameKey: "items.capabilities", href: "/gwi/agents/capabilities", icon: Puzzle },
    ],
  },
  {
    titleKey: "sections.dataSources",
    defaultOpen: false,
    items: [
      { nameKey: "items.connections", href: "/gwi/data-sources", icon: Database },
      { nameKey: "items.schemas", href: "/gwi/data-sources/schemas", icon: FileText },
      { nameKey: "items.syncStatus", href: "/gwi/data-sources/sync", icon: RefreshCw },
      { nameKey: "items.dataQuality", href: "/gwi/data-sources/quality", icon: LineChart },
    ],
  },
  {
    titleKey: "sections.monitoring",
    defaultOpen: false,
    items: [
      { nameKey: "items.pipelineHealth", href: "/gwi/monitoring/pipelines", icon: Activity },
      { nameKey: "items.llmPerformance", href: "/gwi/monitoring/llm", icon: BarChart3 },
      { nameKey: "items.errorLogs", href: "/gwi/monitoring/errors", icon: AlertTriangle },
      { nameKey: "items.alerts", href: "/gwi/monitoring/alerts", icon: Bell },
    ],
  },
  {
    titleKey: "sections.system",
    defaultOpen: false,
    items: [
      { nameKey: "items.settings", href: "/gwi/system/settings", icon: Settings },
      { nameKey: "items.accessControl", href: "/gwi/system/access", icon: Users },
      { nameKey: "items.auditLogs", href: "/gwi/system/audit", icon: FileText },
      { nameKey: "items.apiKeys", href: "/gwi/system/api-keys", icon: Key },
    ],
  },
  {
    titleKey: "sections.servicesManagement",
    defaultOpen: false,
    items: [
      { nameKey: "items.dashboard", href: "/gwi/services", icon: Briefcase },
      { nameKey: "items.clients", href: "/gwi/services/clients", icon: Building2 },
      { nameKey: "items.projects", href: "/gwi/services/projects", icon: FolderKanban },
      { nameKey: "items.timeTracking", href: "/gwi/services/time", icon: Clock },
      { nameKey: "items.invoicing", href: "/gwi/services/invoicing", icon: Receipt },
      { nameKey: "items.vendors", href: "/gwi/services/vendors", icon: Truck },
      { nameKey: "items.team", href: "/gwi/services/team", icon: UsersRound },
    ],
  },
]

function NavSectionComponent({ section }: { section: NavSection }) {
  const pathname = usePathname()
  const sidebarContext = useSidebarContext()
  const t = useTranslations("gwi.navigation")

  // Track if user has manually interacted with this section
  const userInteracted = useRef(false)
  const initializedRef = useRef(false)

  // Initialize state from persisted storage or defaults
  const [isOpen, setIsOpen] = useState(() => {
    const persisted = loadPersistedState()
    if (section.titleKey in persisted) {
      return persisted[section.titleKey]
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
    currentState[section.titleKey] = open
    savePersistedState(currentState)
  }, [section.titleKey])

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
      sidebarContext.registerSection(section.titleKey, (open) => {
        userInteracted.current = true
        setIsOpen(open)
        const currentState = loadPersistedState()
        currentState[section.titleKey] = open
        savePersistedState(currentState)
      })
      return () => sidebarContext.unregisterSection(section.titleKey)
    }
    return undefined
  }, [sidebarContext, section.titleKey])

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
            {t(section.titleKey)}
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
              key={item.nameKey}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150",
                isActive(item.href)
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white hover:translate-x-0.5"
              )}
            >
              <item.icon className="h-4 w-4 flex-shrink-0" />
              <span className="truncate">{t(item.nameKey)}</span>
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
  const t = useTranslations("gwi.navigation")

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
            <span className="text-base font-semibold text-white">{t("portal.title")}</span>
            <p className="text-xs text-slate-400">{t("portal.subtitle")}</p>
          </div>
        </Link>
      </div>

      {/* Navigation Controls */}
      <div className="px-3 pt-3 pb-1 flex justify-between items-center">
        <LanguageSwitcher variant="outline" size="sm" className="border-slate-600 text-slate-300 hover:bg-slate-800 hover:text-white" />
        <div className="flex items-center">
          <button
            onClick={expandAll}
            className="text-xs text-slate-500 hover:text-slate-300 px-2 py-1 rounded transition-colors"
            title={t("controls.expandAll")}
            aria-label={t("controls.expandAll")}
          >
            {t("controls.expandAll")}
          </button>
          <span className="text-slate-600 mx-1">|</span>
          <button
            onClick={collapseAll}
            className="text-xs text-slate-500 hover:text-slate-300 px-2 py-1 rounded transition-colors"
            title={t("controls.collapseAll")}
            aria-label={t("controls.collapseAll")}
          >
            {t("controls.collapseAll")}
          </button>
        </div>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 py-2 px-3">
        {navSections.map((section) => (
          <NavSectionComponent key={section.titleKey} section={section} />
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
          {t("user.signOut")}
        </Button>
      </div>
    </SidebarContext.Provider>
  )
}

export function GWISidebar() {
  const t = useTranslations("gwi")
  useGWIAdmin()
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
            <SheetTitle>{t("navigation.mobileMenu")}</SheetTitle>
          </SheetHeader>
          <div className="flex flex-col h-full">
            <SidebarContent onLogout={handleLogout} />
          </div>
        </SheetContent>
      </Sheet>
    </SidebarContext.Provider>
  )
}
