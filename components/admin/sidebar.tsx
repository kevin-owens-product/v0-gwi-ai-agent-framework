"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState, useEffect, useRef, useCallback, createContext, useContext } from "react"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Building2,
  Users,
  Flag,
  Scale,
  TicketCheck,
  HeartPulse,
  Settings,
  Bell,
  FileText,
  Shield,
  LogOut,
  CreditCard,
  Sparkles,
  Network,
  Lock,
  AlertTriangle,
  Eye,
  Fingerprint,
  Globe,
  Key,
  Webhook,
  AppWindow,
  BarChart3,
  Megaphone,
  Server,
  AlertCircle,
  Calendar,
  Rocket,
  Gauge,
  FileSearch,
  Gavel,
  Download,
  ChevronDown,
  Smartphone,
  UserCog,
  ChevronsUpDown,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAdmin } from "@/components/providers/admin-provider"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"

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
const SIDEBAR_STATE_KEY = "admin-sidebar-state"

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
      { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
      { name: "Real-time Analytics", href: "/admin/analytics", icon: BarChart3 },
    ],
  },
  {
    title: "Organization Management",
    defaultOpen: true,
    items: [
      { name: "Tenants", href: "/admin/tenants", icon: Building2 },
      { name: "Users", href: "/admin/users", icon: Users },
      { name: "Hierarchy", href: "/admin/hierarchy", icon: Network },
      { name: "Health Scores", href: "/admin/health", icon: HeartPulse },
    ],
  },
  {
    title: "Security Center",
    defaultOpen: true,
    items: [
      { name: "Security Overview", href: "/admin/security", icon: Shield },
      { name: "Security Policies", href: "/admin/security/policies", icon: Lock },
      { name: "Threat Detection", href: "/admin/security/threats", icon: AlertTriangle },
      { name: "Security Violations", href: "/admin/security/violations", icon: Eye },
      { name: "IP Management", href: "/admin/security/ip-blocklist", icon: Globe },
    ],
  },
  {
    title: "Identity & Access",
    defaultOpen: false,
    items: [
      { name: "Roles & Permissions", href: "/admin/roles", icon: Shield },
      { name: "Domain Management", href: "/admin/identity/domains", icon: Globe },
      { name: "SSO Configuration", href: "/admin/identity/sso", icon: Key },
      { name: "SCIM Provisioning", href: "/admin/identity/scim", icon: UserCog },
      { name: "Device Trust", href: "/admin/identity/devices", icon: Smartphone },
      { name: "Device Management", href: "/admin/devices", icon: Smartphone },
    ],
  },
  {
    title: "Compliance & Legal",
    defaultOpen: false,
    items: [
      { name: "Compliance Overview", href: "/admin/compliance", icon: Fingerprint },
      { name: "Frameworks", href: "/admin/compliance/frameworks", icon: FileSearch },
      { name: "Legal Holds", href: "/admin/compliance/legal-holds", icon: Gavel },
      { name: "Attestations", href: "/admin/compliance/attestations", icon: FileSearch },
      { name: "Audits", href: "/admin/compliance/audits", icon: FileText },
      { name: "Data Exports", href: "/admin/compliance/data-exports", icon: Download },
      { name: "Retention Policies", href: "/admin/compliance/retention-policies", icon: Calendar },
    ],
  },
  {
    title: "Platform Operations",
    defaultOpen: false,
    items: [
      { name: "Operations Center", href: "/admin/operations", icon: Server },
      { name: "Incidents", href: "/admin/operations/incidents", icon: AlertCircle },
      { name: "Maintenance", href: "/admin/operations/maintenance", icon: Calendar },
      { name: "Releases", href: "/admin/operations/releases", icon: Rocket },
      { name: "Capacity", href: "/admin/operations/capacity", icon: Gauge },
    ],
  },
  {
    title: "API & Integrations",
    defaultOpen: false,
    items: [
      { name: "API Clients", href: "/admin/integrations/api-clients", icon: Key },
      { name: "Webhooks", href: "/admin/integrations/webhooks", icon: Webhook },
      { name: "App Marketplace", href: "/admin/integrations/apps", icon: AppWindow },
    ],
  },
  {
    title: "Billing & Plans",
    defaultOpen: false,
    items: [
      { name: "Plans", href: "/admin/plans", icon: CreditCard },
      { name: "Features", href: "/admin/entitlement-features", icon: Sparkles },
      { name: "Feature Flags", href: "/admin/features", icon: Flag },
    ],
  },
  {
    title: "Communication",
    defaultOpen: false,
    items: [
      { name: "Broadcast Center", href: "/admin/broadcast", icon: Megaphone },
      { name: "Notifications", href: "/admin/notifications", icon: Bell },
      { name: "Support Tickets", href: "/admin/support", icon: TicketCheck },
    ],
  },
  {
    title: "System",
    defaultOpen: false,
    items: [
      { name: "System Rules", href: "/admin/rules", icon: Scale },
      { name: "Audit Log", href: "/admin/audit", icon: FileText },
      { name: "Admins", href: "/admin/admins", icon: Shield },
      { name: "Settings", href: "/admin/settings", icon: Settings },
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
    if (href === "/admin") return pathname === "/admin"
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
  // Only run once on mount, not on every isOpen change
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
              ? "text-slate-200 bg-slate-800/50"
              : "text-slate-400 hover:text-slate-300 hover:bg-slate-800/30"
          )}
          aria-expanded={isOpen}
        >
          <span className="flex items-center gap-2">
            {section.title}
            {hasActiveItem && !isOpen && (
              <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" title="Contains active page" />
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
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white hover:translate-x-0.5"
              )}
            >
              <item.icon className="h-4 w-4 flex-shrink-0" />
              <span className="truncate">{item.name}</span>
              {item.badge && (
                <span className="ml-auto flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1.5 text-xs font-medium text-white">
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

export function AdminSidebar() {
  const { admin } = useAdmin()

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
    await fetch("/api/admin/auth/logout", { method: "POST" })
    window.location.href = "/admin/login"
  }

  return (
    <SidebarContext.Provider value={sidebarContextValue}>
      <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-slate-700 bg-slate-900 hidden lg:flex flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center border-b border-slate-700 px-6">
          <Link href="/admin" className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <Shield className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <span className="text-base font-semibold text-white">Admin Portal</span>
              <p className="text-xs text-slate-400">Enterprise Platform</p>
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
            <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
              <span className="text-sm font-medium text-primary">
                {admin.name.split(" ").map(n => n[0]).join("").toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{admin.name}</p>
              <p className="text-xs text-slate-400 truncate">{admin.role.replace("_", " ")}</p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="w-full border-slate-600 text-slate-300 hover:bg-slate-800 hover:text-white"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign out
          </Button>
        </div>
      </aside>
    </SidebarContext.Provider>
  )
}
