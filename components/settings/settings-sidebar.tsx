"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { User, Building2, Users, CreditCard, Bell, Shield, Key, Palette, FileText } from "lucide-react"

const settingsNav = [
  { name: "General", href: "/dashboard/settings/general", icon: Building2 },
  { name: "Profile", href: "/dashboard/settings/profile", icon: User },
  { name: "Team", href: "/dashboard/settings/team", icon: Users },
  { name: "Billing", href: "/dashboard/settings/billing", icon: CreditCard },
  { name: "Notifications", href: "/dashboard/settings/notifications", icon: Bell },
  { name: "Security", href: "/dashboard/settings/security", icon: Shield },
  { name: "API Keys", href: "/dashboard/settings/api-keys", icon: Key },
  { name: "Audit Log", href: "/dashboard/settings/audit-log", icon: FileText },
  { name: "Appearance", href: "/dashboard/settings/appearance", icon: Palette },
]

export function SettingsSidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-64 border-r bg-card p-6">
      <h2 className="text-lg font-semibold mb-6">Settings</h2>
      <nav className="space-y-1">
        {settingsNav.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
              pathname === item.href
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            <item.icon className="h-4 w-4" />
            {item.name}
          </Link>
        ))}
      </nav>
    </aside>
  )
}
