"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState, useEffect, useRef, useCallback, createContext, useContext } from "react"
import { useTranslations } from "next-intl"
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
  Activity,
  Mail,
  Tags,
  Database,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAdmin } from "@/components/providers/admin-provider"
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
    titleKey: "sections.overview",
    defaultOpen: true,
    items: [
      { nameKey: "items.dashboard", href: "/admin", icon: LayoutDashboard },
      { nameKey: "items.realTimeAnalytics", href: "/admin/analytics", icon: BarChart3 },
    ],
  },
  {
    titleKey: "sections.organizationManagement",
    defaultOpen: true,
    items: [
      { nameKey: "items.tenants", href: "/admin/tenants", icon: Building2 },
      { nameKey: "items.users", href: "/admin/users", icon: Users },
      { nameKey: "items.hierarchy", href: "/admin/hierarchy", icon: Network },
      { nameKey: "items.healthScores", href: "/admin/health-scores", icon: HeartPulse },
    ],
  },
  {
    titleKey: "sections.securityCenter",
    defaultOpen: true,
    items: [
      { nameKey: "items.securityOverview", href: "/admin/security", icon: Shield },
      { nameKey: "items.securityPolicies", href: "/admin/security/policies", icon: Lock },
      { nameKey: "items.threatDetection", href: "/admin/security/threats", icon: AlertTriangle },
      { nameKey: "items.securityViolations", href: "/admin/security/violations", icon: Eye },
      { nameKey: "items.ipManagement", href: "/admin/security/ip-blocklist", icon: Globe },
    ],
  },
  {
    titleKey: "sections.identityAccess",
    defaultOpen: false,
    items: [
      { nameKey: "items.rolesPermissions", href: "/admin/roles", icon: Shield },
      { nameKey: "items.domainManagement", href: "/admin/identity/domains", icon: Globe },
      { nameKey: "items.ssoConfiguration", href: "/admin/identity/sso", icon: Key },
      { nameKey: "items.scimProvisioning", href: "/admin/identity/scim", icon: UserCog },
      { nameKey: "items.deviceTrust", href: "/admin/identity/devices", icon: Smartphone },
      { nameKey: "items.deviceManagement", href: "/admin/devices", icon: Smartphone },
    ],
  },
  {
    titleKey: "sections.complianceLegal",
    defaultOpen: false,
    items: [
      { nameKey: "items.complianceOverview", href: "/admin/compliance", icon: Fingerprint },
      { nameKey: "items.frameworks", href: "/admin/compliance/frameworks", icon: FileSearch },
      { nameKey: "items.legalHolds", href: "/admin/compliance/legal-holds", icon: Gavel },
      { nameKey: "items.attestations", href: "/admin/compliance/attestations", icon: FileSearch },
      { nameKey: "items.audits", href: "/admin/compliance/audits", icon: FileText },
      { nameKey: "items.dataExports", href: "/admin/compliance/data-exports", icon: Download },
      { nameKey: "items.retentionPolicies", href: "/admin/compliance/retention-policies", icon: Calendar },
    ],
  },
  {
    titleKey: "sections.platformOperations",
    defaultOpen: false,
    items: [
      { nameKey: "items.operationsCenter", href: "/admin/operations", icon: Server },
      { nameKey: "items.incidents", href: "/admin/operations/incidents", icon: AlertCircle },
      { nameKey: "items.statusPage", href: "/admin/status", icon: Activity },
      { nameKey: "items.maintenance", href: "/admin/operations/maintenance", icon: Calendar },
      { nameKey: "items.releases", href: "/admin/operations/releases", icon: Rocket },
      { nameKey: "items.capacity", href: "/admin/operations/capacity", icon: Gauge },
    ],
  },
  {
    titleKey: "sections.apiIntegrations",
    defaultOpen: false,
    items: [
      { nameKey: "items.apiClients", href: "/admin/integrations/api-clients", icon: Key },
      { nameKey: "items.webhooks", href: "/admin/integrations/webhooks", icon: Webhook },
      { nameKey: "items.appMarketplace", href: "/admin/integrations/apps", icon: AppWindow },
    ],
  },
  {
    titleKey: "sections.billingPlans",
    defaultOpen: false,
    items: [
      { nameKey: "items.plans", href: "/admin/plans", icon: CreditCard },
      { nameKey: "items.entitlementFeatures", href: "/admin/entitlement-features", icon: Sparkles },
      { nameKey: "items.featureFlags", href: "/admin/features", icon: Flag },
    ],
  },
  {
    titleKey: "sections.communication",
    defaultOpen: false,
    items: [
      { nameKey: "items.broadcastCenter", href: "/admin/broadcast", icon: Megaphone },
      { nameKey: "items.emailTemplates", href: "/admin/email-templates", icon: Mail },
      { nameKey: "items.notifications", href: "/admin/notifications", icon: Bell },
      { nameKey: "items.supportTickets", href: "/admin/support", icon: TicketCheck },
    ],
  },
  {
    titleKey: "sections.gwiManagement",
    defaultOpen: false,
    items: [
      { nameKey: "items.surveys", href: "/admin/gwi/surveys", icon: FileText },
      { nameKey: "items.taxonomyVersions", href: "/admin/gwi/taxonomy/versions", icon: Tags },
      { nameKey: "items.taxonomyAutoMapping", href: "/admin/gwi/taxonomy/auto-mapping", icon: Tags },
      { nameKey: "items.dataSources", href: "/admin/gwi/data-sources", icon: Database },
    ],
  },
  {
    titleKey: "sections.system",
    defaultOpen: false,
    items: [
      { nameKey: "items.systemRules", href: "/admin/rules", icon: Scale },
      { nameKey: "items.adminActivity", href: "/admin/activity", icon: BarChart3 },
      { nameKey: "items.auditLog", href: "/admin/audit", icon: FileText },
      { nameKey: "items.admins", href: "/admin/admins", icon: Shield },
      { nameKey: "items.settings", href: "/admin/settings", icon: Settings },
    ],
  },
]

function NavSectionComponent({ section }: { section: NavSection }) {
  const pathname = usePathname()
  const sidebarContext = useSidebarContext()
  const t = useTranslations("admin.navigation")

  // Track if user has manually interacted with this section
  const userInteracted = useRef(false)

  const sectionTitle = t(section.titleKey)

  const isActive = (href: string) => {
    if (href === "/admin") return pathname === "/admin"
    return pathname.startsWith(href)
  }

  const hasActiveItem = section.items.some((item) => isActive(item.href))

  // Initialize state consistently for SSR and client
  // Always start with defaultOpen or false to ensure server/client match
  const [isOpen, setIsOpen] = useState(section.defaultOpen ?? false)

  // Hydrate state from localStorage and active items after mount
  // This prevents hydration mismatch by updating only after client hydration
  useEffect(() => {
    // Check persisted state first
    const persisted = loadPersistedState()
    if (sectionTitle in persisted) {
      setIsOpen(persisted[sectionTitle])
      return
    }
    
    // If section has active item, open it by default (unless user interacted)
    if (hasActiveItem && !userInteracted.current) {
      setIsOpen(true)
    }
  }, [hasActiveItem, sectionTitle])

  // Handle open state changes with persistence
  const handleOpenChange = useCallback((open: boolean) => {
    userInteracted.current = true
    setIsOpen(open)

    // Persist to localStorage
    if (typeof window !== "undefined") {
      const currentState = loadPersistedState()
      currentState[sectionTitle] = open
      savePersistedState(currentState)
    }
  }, [sectionTitle])

  // Register with sidebar context for expand/collapse all
  useEffect(() => {
    if (!sidebarContext) return

    sidebarContext.registerSection(sectionTitle, (open) => {
      userInteracted.current = true
      setIsOpen(open)
      const currentState = loadPersistedState()
      currentState[sectionTitle] = open
      savePersistedState(currentState)
    })
    return () => sidebarContext.unregisterSection(sectionTitle)
  }, [sidebarContext, sectionTitle])

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
            {sectionTitle}
            {hasActiveItem && !isOpen && (
              // eslint-disable-next-line local/no-hardcoded-strings
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
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150",
                isActive(item.href)
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white hover:translate-x-0.5"
              )}
            >
              <item.icon className="h-4 w-4 flex-shrink-0" />
              <span className="truncate">{t(item.nameKey)}</span>
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

function SidebarContent({ onLogout }: { onLogout: () => void }) {
  const { admin } = useAdmin()
  const t = useTranslations("admin.navigation")

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
        <Link href="/admin" className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <Shield className="h-5 w-5 text-primary-foreground" />
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
        <div className="flex">
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
          onClick={onLogout}
        >
          <LogOut className="h-4 w-4 mr-2" />
          {t("user.signOut")}
        </Button>
      </div>
    </SidebarContext.Provider>
  )
}

export function AdminSidebar() {
  const { isMobileOpen, setMobileOpen } = useSidebar()
  const t = useTranslations("admin.navigation")

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
    window.location.href = "/login?type=admin"
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
            <SheetTitle>{t("navigationMenu")}</SheetTitle>
          </SheetHeader>
          <div className="flex flex-col h-full">
            <SidebarContent onLogout={handleLogout} />
          </div>
        </SheetContent>
      </Sheet>
    </SidebarContext.Provider>
  )
}
