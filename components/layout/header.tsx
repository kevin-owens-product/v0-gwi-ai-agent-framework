"use client"

/**
 * Unified Header Component
 *
 * A configurable header component that supports both admin and dashboard layouts.
 * Use the `variant` prop to switch between styles.
 *
 * @module components/layout/header
 *
 * @example
 * Admin header with page title:
 * ```tsx
 * <AppHeader variant="admin" title="User Management" user={adminUser} />
 * ```
 *
 * @example
 * Dashboard header with search:
 * ```tsx
 * <AppHeader
 *   variant="dashboard"
 *   searchPlaceholder="Search agents, workflows..."
 *   onMenuClick={() => setMobileMenuOpen(true)}
 * />
 * ```
 */

import * as React from "react"
import { useState } from "react"
import { Bell, Search, Menu, type LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

// ============================================================================
// TYPES
// ============================================================================

export interface HeaderUser {
  /** User's display name */
  name: string
  /** User's initials (auto-generated if not provided) */
  initials?: string
}

export interface HeaderAction {
  /** Unique identifier for the action */
  id: string
  /** Icon component to display */
  icon: LucideIcon
  /** Aria label for accessibility */
  label: string
  /** Click handler */
  onClick?: () => void
  /** Badge count to display */
  badge?: number
  /** Whether this is the notification bell */
  isNotification?: boolean
}

export interface AppHeaderProps {
  /** Visual variant of the header */
  variant?: "admin" | "dashboard"
  /** Page title (admin variant) */
  title?: string
  /** Current user information */
  user?: HeaderUser
  /** Search placeholder text */
  searchPlaceholder?: string
  /** Handler for search input changes */
  onSearchChange?: (value: string) => void
  /** Handler for search submission */
  onSearchSubmit?: (value: string) => void
  /** Handler for mobile menu button click */
  onMenuClick?: () => void
  /** Custom actions to display */
  actions?: HeaderAction[]
  /** Whether to show the search input */
  showSearch?: boolean
  /** Whether to show notifications */
  showNotifications?: boolean
  /** Notification count */
  notificationCount?: number
  /** Handler for notification click */
  onNotificationClick?: () => void
  /** Additional CSS classes */
  className?: string
  /** Children to render in the header */
  children?: React.ReactNode
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function AppHeader({
  variant = "dashboard",
  title,
  user,
  searchPlaceholder = "Search...",
  onSearchChange,
  onSearchSubmit,
  onMenuClick,
  actions = [],
  showSearch = true,
  showNotifications = true,
  notificationCount = 0,
  onNotificationClick,
  className,
  children,
}: AppHeaderProps) {
  const [searchValue, setSearchValue] = useState("")

  const isAdminVariant = variant === "admin"

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchValue(value)
    onSearchChange?.(value)
  }

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      onSearchSubmit?.(searchValue)
    }
  }

  const userInitials =
    user?.initials ||
    user?.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase() ||
    "?"

  return (
    <header
      className={cn(
        "sticky top-0 z-30 flex items-center gap-4 border-b px-6",
        isAdminVariant
          ? "h-16 border-border bg-background/95 backdrop-blur"
          : "h-16 border-border bg-background/80 backdrop-blur-xl",
        className
      )}
    >
      {/* Mobile Menu Button */}
      {onMenuClick ? (
        <button
          className="lg:hidden p-2 -ml-2 text-muted-foreground hover:text-foreground"
          onClick={onMenuClick}
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>
      ) : (
        <Button variant="ghost" size="icon" className="lg:hidden" onClick={onMenuClick}>
          <Menu className="h-5 w-5" />
        </Button>
      )}

      {/* Title (Admin) or Search (Dashboard) */}
      <div className="flex-1 flex items-center gap-4">
        {isAdminVariant ? (
          <h1 className="text-xl font-semibold">{title || "Dashboard"}</h1>
        ) : (
          showSearch && (
            <div className="relative max-w-md flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={searchPlaceholder}
                value={searchValue}
                onChange={handleSearchChange}
                onKeyDown={handleSearchKeyDown}
                className="pl-10 bg-secondary border-border"
              />
            </div>
          )
        )}
      </div>

      {/* Custom children */}
      {children}

      {/* Actions */}
      <div className="flex items-center gap-4">
        {/* Admin Search */}
        {isAdminVariant && showSearch && (
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={searchPlaceholder}
              value={searchValue}
              onChange={handleSearchChange}
              onKeyDown={handleSearchKeyDown}
              className="w-64 pl-9"
            />
          </div>
        )}

        {/* Custom Actions */}
        {actions.map((action) => (
          <Button
            key={action.id}
            variant="ghost"
            size="icon"
            className="relative"
            onClick={action.onClick}
            aria-label={action.label}
          >
            <action.icon className={isAdminVariant ? "h-5 w-5" : "h-4 w-4"} />
            {action.badge !== undefined && action.badge > 0 && (
              <span
                className={cn(
                  "absolute flex items-center justify-center rounded-full font-medium",
                  isAdminVariant
                    ? "-top-1 -right-1 h-4 w-4 bg-destructive text-[10px] text-destructive-foreground"
                    : "top-1 right-1 h-2 w-2 bg-accent"
                )}
              >
                {isAdminVariant && action.badge}
              </span>
            )}
          </Button>
        ))}

        {/* Notifications */}
        {showNotifications && (
          <Button
            variant="ghost"
            size="icon"
            className="relative"
            onClick={onNotificationClick}
            aria-label="Notifications"
          >
            <Bell className={isAdminVariant ? "h-5 w-5" : "h-4 w-4"} />
            {notificationCount > 0 && (
              <span
                className={cn(
                  "absolute flex items-center justify-center rounded-full font-medium",
                  isAdminVariant
                    ? "-top-1 -right-1 h-4 w-4 bg-destructive text-[10px] text-destructive-foreground"
                    : "top-1 right-1 h-2 w-2 bg-accent"
                )}
              >
                {isAdminVariant && notificationCount}
              </span>
            )}
          </Button>
        )}

        {/* User Info (Admin) */}
        {isAdminVariant && user && (
          <div className="hidden md:flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Logged in as</span>
            <span className="font-medium">{user.name}</span>
          </div>
        )}

        {/* User Avatar (Dashboard mobile) */}
        {!isAdminVariant && user && (
          <div className="h-8 w-8 rounded-full bg-accent/20 flex items-center justify-center lg:hidden">
            <span className="text-xs font-medium text-accent">{userInitials}</span>
          </div>
        )}
      </div>
    </header>
  )
}

// ============================================================================
// PAGE TITLE MAP HELPER
// ============================================================================

/**
 * Creates a page title lookup function from a route-to-title mapping.
 * Useful for automatically setting page titles based on the current route.
 *
 * @example
 * ```tsx
 * const getPageTitle = createPageTitleLookup({
 *   "/admin": "Dashboard",
 *   "/admin/users": "User Management",
 * }, "Admin Portal")
 *
 * const title = getPageTitle("/admin/users") // "User Management"
 * ```
 */
export function createPageTitleLookup(
  pageTitles: Record<string, string>,
  defaultTitle: string
): (pathname: string) => string {
  return (pathname: string) => pageTitles[pathname] || defaultTitle
}

