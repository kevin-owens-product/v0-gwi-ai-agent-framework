"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useTranslations } from "next-intl"
import { cn } from "@/lib/utils"
import { User, Building2, Users, Bell, Shield, Key, Palette, FileText, Zap, Webhook, Download, Keyboard } from "lucide-react"

const settingsNavKeys = [
  { key: "general", href: "/dashboard/settings/general", icon: Building2 },
  { key: "profile", href: "/dashboard/settings/profile", icon: User },
  { key: "team", href: "/dashboard/settings/team", icon: Users },
  { key: "planBilling", href: "/dashboard/settings/plan", icon: Zap },
  { key: "notifications", href: "/dashboard/settings/notifications", icon: Bell },
  { key: "security", href: "/dashboard/settings/security", icon: Shield },
  { key: "apiKeys", href: "/dashboard/settings/api-keys", icon: Key },
  { key: "webhooks", href: "/dashboard/settings/webhooks", icon: Webhook },
  { key: "shortcuts", href: "/dashboard/settings/shortcuts", icon: Keyboard },
  { key: "dataExports", href: "/dashboard/settings/security/data-exports", icon: Download },
  { key: "auditLog", href: "/dashboard/settings/audit-log", icon: FileText },
  { key: "appearance", href: "/dashboard/settings/appearance", icon: Palette },
]

export function SettingsSidebar() {
  const pathname = usePathname()
  const t = useTranslations("settings.sidebar")

  return (
    <aside className="w-64 border-r bg-card p-6">
      <h2 className="text-lg font-semibold mb-6">{t("title")}</h2>
      <nav className="space-y-1">
        {settingsNavKeys.map((item) => (
          <Link
            key={item.key}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
              pathname === item.href
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            <item.icon className="h-4 w-4" />
            {t(item.key)}
          </Link>
        ))}
      </nav>
    </aside>
  )
}
