"use client"

import { Button } from "@/components/ui/button"
import { Plus, Play, Upload, Sparkles } from "lucide-react"
import Link from "next/link"
import { useTranslations } from "next-intl"

const actions = [
  { nameKey: "newWorkflow", icon: Plus, href: "/dashboard/workflows/new", primary: true },
  { nameKey: "openPlayground", icon: Sparkles, href: "/dashboard/playground", primary: false },
  { nameKey: "runAgent", icon: Play, href: "/dashboard/agents", primary: false },
  { nameKey: "importData", icon: Upload, href: "/dashboard/import", primary: false },
]

export function QuickActions() {
  const t = useTranslations('dashboard.quickActions')

  return (
    <div className="flex flex-wrap gap-3">
      {actions.map((action) => (
        <Link key={action.nameKey} href={action.href}>
          <Button variant={action.primary ? "default" : "secondary"} size="sm" className="gap-2">
            <action.icon className="h-4 w-4" />
            {t(action.nameKey)}
          </Button>
        </Link>
      ))}
    </div>
  )
}
