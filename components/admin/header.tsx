"use client"

import { usePathname } from "next/navigation"
import { useTranslations } from "next-intl"
import { Bell, Search, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { useAdmin } from "@/components/providers/admin-provider"
import { useSidebar } from "@/components/providers/sidebar-provider"

export function AdminHeader() {
  const pathname = usePathname()
  const { admin } = useAdmin()
  const { toggleMobile } = useSidebar()
  const t = useTranslations("admin.header")
  const tNav = useTranslations("admin.navigation.items")

  const pageTitleKeys: Record<string, string> = {
    "/admin": "dashboard",
    "/admin/tenants": "tenants",
    "/admin/users": "users",
    "/admin/features": "featureFlags",
    "/admin/rules": "systemRules",
    "/admin/support": "supportTickets",
    "/admin/health": "healthScores",
    "/admin/notifications": "notifications",
    "/admin/audit": "auditLog",
    "/admin/admins": "admins",
    "/admin/settings": "settings",
  }

  const titleKey = pageTitleKeys[pathname]
  const title = titleKey ? tNav(titleKey as any) : t("search")

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border bg-background/95 backdrop-blur px-6">
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        onClick={toggleMobile}
        aria-label={tNav("dashboard")}
      >
        <Menu className="h-5 w-5" />
      </Button>

      <div className="flex-1">
        <h1 className="text-xl font-semibold">{title}</h1>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={t("searchPlaceholder")}
            className="w-64 pl-9"
          />
        </div>

        <ThemeToggle />

        <Button variant="ghost" size="icon" className="relative" aria-label={t("notifications")}>
          <Bell className="h-5 w-5" />
          <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-destructive text-[10px] font-medium text-destructive-foreground flex items-center justify-center">
            3
          </span>
        </Button>

        <div className="hidden md:flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">{t("loggedInAs")}</span>
          <span className="font-medium">{admin.name}</span>
        </div>
      </div>
    </header>
  )
}
