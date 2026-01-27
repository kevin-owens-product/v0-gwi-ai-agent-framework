"use client"

/**
 * Unified Sidebar Component
 *
 * A configurable sidebar component that supports both admin and dashboard layouts.
 * Use the `variant` prop to switch between styles, or compose your own configuration.
 *
 * @module components/layout/sidebar
 *
 * @example
 * Basic admin sidebar:
 * ```tsx
 * <AppSidebar variant="admin" user={adminUser} onLogout={handleLogout} />
 * ```
 *
 * @example
 * Dashboard sidebar with custom sections:
 * ```tsx
 * <AppSidebar
 *   variant="dashboard"
 *   navSections={customSections}
 *   user={currentUser}
 *   branding={{ title: "My App", subtitle: "Dashboard" }}
 * />
 * ```
 */

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import {
  ChevronDown,
  ChevronRight,
  Plus,
  Search,
  Layers,
  LogOut,
  type LucideIcon,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

// ============================================================================
// TYPES
// ============================================================================

export interface NavItem {
  /** Display name for the navigation item */
  name: string
  /** URL path for the navigation item */
  href: string
  /** Icon component to display */
  icon: LucideIcon
  /** Optional badge to display (e.g., notification count) */
  badge?: string | number
  /** Optional description for tooltips */
  description?: string
}

export interface NavChild {
  /** Display name for the child item */
  name: string
  /** URL path for the child item */
  href: string
  /** Optional color indicator (Tailwind class) */
  color?: string
}

export interface NavSection {
  /** Unique identifier for the section */
  id?: string
  /** Section title displayed in the sidebar */
  title: string
  /** Navigation items in this section */
  items: NavItem[]
  /** Whether the section is expanded by default */
  defaultOpen?: boolean
  /** Optional child items (e.g., project list) */
  children?: NavChild[]
}

export interface SidebarUser {
  /** User's display name */
  name: string
  /** User's email address */
  email?: string
  /** User's role or title */
  role?: string
  /** User's initials (auto-generated if not provided) */
  initials?: string
}

export interface SidebarBranding {
  /** Main title displayed in the header */
  title: string
  /** Optional subtitle */
  subtitle?: string
  /** Icon component for the logo */
  icon?: LucideIcon
  /** URL to navigate to when clicking the logo */
  href?: string
}

export interface AppSidebarProps {
  /** Visual variant of the sidebar */
  variant?: "admin" | "dashboard"
  /** Navigation sections to display */
  navSections?: NavSection[]
  /** Bottom navigation items */
  bottomNavItems?: NavItem[]
  /** Current user information */
  user?: SidebarUser
  /** Branding configuration */
  branding?: SidebarBranding
  /** Logout handler for admin variant */
  onLogout?: () => void
  /** Whether the sidebar is collapsible */
  collapsible?: boolean
  /** Initial collapsed state */
  defaultCollapsed?: boolean
  /** Custom action button configuration */
  actionButton?: {
    label: string
    href: string
    icon?: LucideIcon
  }
  /** Show search button */
  showSearch?: boolean
  /** Additional CSS classes */
  className?: string
}

// ============================================================================
// HELPER COMPONENTS
// ============================================================================

interface NavSectionComponentProps {
  section: NavSection
  variant: "admin" | "dashboard"
  isCompact: boolean
  pathname: string
}

function NavSectionComponent({
  section,
  variant,
  isCompact,
  pathname,
}: NavSectionComponentProps) {
  const [isOpen, setIsOpen] = useState(section.defaultOpen ?? false)

  const isActive = (href: string) => {
    const basePath = variant === "admin" ? "/admin" : "/dashboard"
    if (href === basePath) return pathname === basePath
    return pathname.startsWith(href)
  }

  const hasActiveItem = section.items.some((item) => isActive(item.href))

  useEffect(() => {
    if (hasActiveItem && !isOpen) {
      setIsOpen(true)
    }
  }, [hasActiveItem, isOpen])

  const isAdminVariant = variant === "admin"

  if (isCompact) {
    return (
      <div className="space-y-0.5 px-2">
        {section.items.map((item) => (
          <Tooltip key={item.name}>
            <TooltipTrigger asChild>
              <Link
                href={item.href}
                className={cn(
                  "flex h-9 w-full items-center justify-center rounded-md transition-colors relative",
                  isActive(item.href)
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground/60 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.badge && (
                  <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[10px] font-medium text-accent-foreground">
                    {item.badge}
                  </span>
                )}
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right" className="flex flex-col">
              <span className="font-medium">{item.name}</span>
              {item.description && (
                <span className="text-xs text-muted-foreground">
                  {item.description}
                </span>
              )}
            </TooltipContent>
          </Tooltip>
        ))}
      </div>
    )
  }

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="mb-1">
      <CollapsibleTrigger asChild>
        <button
          className={cn(
            "flex w-full items-center justify-between px-3 py-2 text-xs font-semibold uppercase tracking-wider rounded-md transition-colors",
            isAdminVariant
              ? isOpen || hasActiveItem
                ? "text-slate-200 bg-slate-800/50"
                : "text-slate-400 hover:text-slate-300 hover:bg-slate-800/30"
              : "px-4 py-1.5 text-[11px] text-sidebar-foreground/40 hover:text-sidebar-foreground/60"
          )}
        >
          <span>{section.title}</span>
          {isAdminVariant ? (
            <ChevronDown
              className={cn(
                "h-3.5 w-3.5 transition-transform duration-200",
                isOpen ? "rotate-0" : "-rotate-90"
              )}
            />
          ) : (
            <ChevronRight
              className={cn("h-3 w-3 transition-transform", isOpen && "rotate-90")}
            />
          )}
        </button>
      </CollapsibleTrigger>
      <CollapsibleContent className="mt-1">
        <div className={cn("space-y-0.5", isAdminVariant ? "pl-1" : "px-2")}>
          {section.items.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-all",
                isActive(item.href)
                  ? isAdminVariant
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-sidebar-accent text-sidebar-accent-foreground"
                  : isAdminVariant
                    ? "text-slate-300 hover:bg-slate-800 hover:text-white hover:translate-x-0.5"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
              )}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              <span className="truncate">{item.name}</span>
              {item.badge && (
                <span
                  className={cn(
                    "ml-auto flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[11px] font-medium",
                    isAdminVariant
                      ? "bg-red-500 text-white min-w-[20px]"
                      : "bg-accent text-accent-foreground"
                  )}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          ))}

          {/* Child items (e.g., project list) */}
          {section.children && (
            <div className="ml-4 mt-1 space-y-0.5 border-l border-sidebar-border pl-3">
              {section.children.map((child) => (
                <Link
                  key={child.name}
                  href={child.href}
                  className={cn(
                    "flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors",
                    isActive(child.href)
                      ? "text-sidebar-accent-foreground font-medium"
                      : "text-sidebar-foreground/60 hover:text-sidebar-foreground"
                  )}
                >
                  {child.color && (
                    <div className={cn("h-2 w-2 rounded-full shrink-0", child.color)} />
                  )}
                  <span className="truncate">{child.name}</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function AppSidebar({
  variant = "dashboard",
  navSections = [],
  bottomNavItems = [],
  user,
  branding,
  onLogout,
  collapsible = true,
  defaultCollapsed = false,
  actionButton,
  showSearch = false,
  className,
}: AppSidebarProps) {
  const pathname = usePathname()
  const [isCompact, setIsCompact] = useState(defaultCollapsed)
  const [_openGroups, _setOpenGroups] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {}
    navSections.forEach((section) => {
      initial[section.id || section.title] = section.defaultOpen ?? false
    })
    return initial
  })

  const isAdminVariant = variant === "admin"
  const userInitials =
    user?.initials ||
    user?.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase() ||
    "?"

  const sidebarWidth = isAdminVariant ? "w-64" : isCompact ? "w-16" : "w-60"

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 h-screen border-r hidden lg:flex flex-col transition-all duration-200",
          isAdminVariant
            ? "bg-slate-900 border-slate-700"
            : "bg-sidebar border-border",
          sidebarWidth,
          className
        )}
      >
        {/* Logo / Branding */}
        <div
          className={cn(
            "flex items-center border-b",
            isAdminVariant
              ? "h-16 border-slate-700 px-6"
              : "h-14 border-sidebar-border",
            isCompact && !isAdminVariant ? "justify-center px-2" : "px-4"
          )}
        >
          <Link
            href={branding?.href || (isAdminVariant ? "/admin" : "/")}
            className="flex items-center gap-2"
          >
            <div
              className={cn(
                "flex items-center justify-center rounded-lg shrink-0",
                isAdminVariant
                  ? "h-9 w-9 bg-primary"
                  : "h-8 w-8 bg-accent"
              )}
            >
              {branding?.icon ? (
                <branding.icon
                  className={cn(
                    "h-5 w-5",
                    isAdminVariant ? "text-primary-foreground" : "text-accent-foreground"
                  )}
                />
              ) : (
                <span
                  className={cn(
                    "text-sm font-bold",
                    isAdminVariant ? "text-primary-foreground" : "text-accent-foreground"
                  )}
                >
                  {branding?.title?.[0] || "G"}
                </span>
              )}
            </div>
            {(!isCompact || isAdminVariant) && (
              <div>
                <span
                  className={cn(
                    "font-semibold",
                    isAdminVariant
                      ? "text-base text-white"
                      : "text-base text-sidebar-foreground"
                  )}
                >
                  {branding?.title || (isAdminVariant ? "Admin Portal" : "GWI Insights")}
                </span>
                {branding?.subtitle && isAdminVariant && (
                  <p className="text-xs text-slate-400">{branding.subtitle}</p>
                )}
              </div>
            )}
          </Link>
        </div>

        {/* Quick Actions (Dashboard variant) */}
        {!isAdminVariant && (actionButton || showSearch) && (
          <div
            className={cn(
              "p-2 border-b border-sidebar-border",
              isCompact && "flex justify-center"
            )}
          >
            {isCompact ? (
              actionButton && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link href={actionButton.href}>
                      <Button size="icon" className="h-9 w-9">
                        {actionButton.icon ? (
                          <actionButton.icon className="h-4 w-4" />
                        ) : (
                          <Plus className="h-4 w-4" />
                        )}
                      </Button>
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side="right">{actionButton.label}</TooltipContent>
                </Tooltip>
              )
            ) : (
              <div className="flex gap-2">
                {actionButton && (
                  <Link href={actionButton.href} className="flex-1">
                    <Button className="w-full gap-2 h-9" size="sm">
                      {actionButton.icon ? (
                        <actionButton.icon className="h-4 w-4" />
                      ) : (
                        <Plus className="h-4 w-4" />
                      )}
                      {actionButton.label}
                    </Button>
                  </Link>
                )}
                {showSearch && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-9 w-9 shrink-0 bg-transparent"
                      >
                        <Search className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="right">Search</TooltipContent>
                  </Tooltip>
                )}
              </div>
            )}
          </div>
        )}

        {/* Navigation */}
        <ScrollArea className={cn("flex-1", isAdminVariant ? "py-4 px-3" : "py-2")}>
          {navSections.map((section) => (
            <NavSectionComponent
              key={section.id || section.title}
              section={section}
              variant={variant}
              isCompact={isCompact && !isAdminVariant}
              pathname={pathname}
            />
          ))}
        </ScrollArea>

        {/* Bottom Navigation */}
        {bottomNavItems.length > 0 && (
          <div className="border-t border-sidebar-border p-2 space-y-0.5">
            {bottomNavItems.map((item) =>
              isCompact && !isAdminVariant ? (
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
              )
            )}

            {/* Collapse Toggle */}
            {collapsible && !isAdminVariant && !isCompact && (
              <button
                onClick={() => setIsCompact(true)}
                className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-sidebar-foreground/40 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
              >
                <Layers className="h-4 w-4" />
                Collapse
              </button>
            )}
          </div>
        )}

        {/* User Section */}
        {user && (
          <div
            className={cn(
              "border-t",
              isAdminVariant
                ? "border-slate-700 p-4"
                : "border-sidebar-border",
              !isAdminVariant && (isCompact ? "p-2" : "p-3")
            )}
          >
            {isAdminVariant ? (
              // Admin user section
              <>
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                    <span className="text-sm font-medium text-primary">
                      {userInitials}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">
                      {user.name}
                    </p>
                    {user.role && (
                      <p className="text-xs text-slate-400 truncate">
                        {user.role.replace("_", " ")}
                      </p>
                    )}
                  </div>
                </div>
                {onLogout && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full border-slate-600 text-slate-300 hover:bg-slate-800 hover:text-white"
                    onClick={onLogout}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign out
                  </Button>
                )}
              </>
            ) : isCompact ? (
              // Dashboard compact user section
              <>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button className="flex h-9 w-full items-center justify-center rounded-md hover:bg-sidebar-accent/50">
                      <div className="h-7 w-7 rounded-full bg-gradient-to-br from-accent to-accent/60 flex items-center justify-center">
                        <span className="text-xs font-medium text-accent-foreground">
                          {userInitials}
                        </span>
                      </div>
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <div>
                      <p className="font-medium">{user.name}</p>
                      {user.email && (
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      )}
                    </div>
                  </TooltipContent>
                </Tooltip>
                {collapsible && (
                  <button
                    onClick={() => setIsCompact(false)}
                    className="flex h-9 w-full items-center justify-center rounded-md text-sidebar-foreground/40 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground mt-1"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                )}
              </>
            ) : (
              // Dashboard expanded user section
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-accent to-accent/60 flex items-center justify-center shrink-0">
                  <span className="text-xs font-medium text-accent-foreground">
                    {userInitials}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-sidebar-foreground truncate">
                    {user.name}
                  </p>
                  {user.email && (
                    <p className="text-xs text-sidebar-foreground/50 truncate">
                      {user.email}
                    </p>
                  )}
                </div>
                {collapsible && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 shrink-0"
                    onClick={() => setIsCompact(true)}
                  >
                    <ChevronDown className="h-4 w-4 rotate-90" />
                  </Button>
                )}
              </div>
            )}
          </div>
        )}
      </aside>
    </TooltipProvider>
  )
}

