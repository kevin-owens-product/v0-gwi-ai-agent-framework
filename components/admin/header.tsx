"use client"

import { usePathname } from "next/navigation"
import { Bell, Search, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAdmin } from "@/components/providers/admin-provider"

const pageTitles: Record<string, string> = {
  "/admin": "Dashboard",
  "/admin/tenants": "Tenant Management",
  "/admin/users": "User Management",
  "/admin/features": "Feature Flags",
  "/admin/rules": "System Rules",
  "/admin/support": "Support Tickets",
  "/admin/health": "Health Scores",
  "/admin/notifications": "Notifications",
  "/admin/audit": "Audit Log",
  "/admin/admins": "Admin Management",
  "/admin/settings": "System Settings",
}

export function AdminHeader() {
  const pathname = usePathname()
  const { admin } = useAdmin()

  const title = pageTitles[pathname] || "Admin Portal"

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border bg-background/95 backdrop-blur px-6">
      <Button variant="ghost" size="icon" className="lg:hidden">
        <Menu className="h-5 w-5" />
      </Button>

      <div className="flex-1">
        <h1 className="text-xl font-semibold">{title}</h1>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search tenants, users..."
            className="w-64 pl-9"
          />
        </div>

        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-destructive text-[10px] font-medium text-destructive-foreground flex items-center justify-center">
            3
          </span>
        </Button>

        <div className="hidden md:flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">Logged in as</span>
          <span className="font-medium">{admin.name}</span>
        </div>
      </div>
    </header>
  )
}
