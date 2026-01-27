"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import {
  Users,
  Target,
  BarChart3,
  Table2,
  PieChart,
  Workflow,
  Bot,
  LayoutTemplate,
  FileText,
  Plug,
  ArrowRight,
  Folder,
} from "lucide-react"
import { useTranslations } from "next-intl"

interface ModuleLink {
  nameKey: string
  href: string
  icon: typeof Users
  descriptionKey: string
  color: string
  count?: number
}

interface PlatformOverviewProps {
  moduleCounts?: {
    audiences?: number
    brandTracking?: number
    charts?: number
    crosstabs?: number
    dashboards?: number
    workflows?: number
    agents?: number
    templates?: number
    reports?: number
    integrations?: number
    projects?: number
  }
}

const modules: ModuleLink[] = [
  { nameKey: "audiences", href: "/dashboard/audiences", icon: Users, descriptionKey: "audienceSegments", color: "bg-blue-500/10 text-blue-400" },
  { nameKey: "brandTracking", href: "/dashboard/brand-tracking", icon: Target, descriptionKey: "monitorBrands", color: "bg-rose-500/10 text-rose-400" },
  { nameKey: "charts", href: "/dashboard/charts", icon: BarChart3, descriptionKey: "visualizations", color: "bg-emerald-500/10 text-emerald-400" },
  { nameKey: "crosstabs", href: "/dashboard/crosstabs", icon: Table2, descriptionKey: "compareData", color: "bg-violet-500/10 text-violet-400" },
  { nameKey: "dashboards", href: "/dashboard/dashboards", icon: PieChart, descriptionKey: "customViews", color: "bg-amber-500/10 text-amber-400" },
  { nameKey: "workflows", href: "/dashboard/workflows", icon: Workflow, descriptionKey: "automation", color: "bg-indigo-500/10 text-indigo-400" },
  { nameKey: "agents", href: "/dashboard/agents", icon: Bot, descriptionKey: "aiAssistants", color: "bg-pink-500/10 text-pink-400" },
  { nameKey: "templates", href: "/dashboard/templates", icon: LayoutTemplate, descriptionKey: "reusablePrompts", color: "bg-orange-500/10 text-orange-400" },
  { nameKey: "reports", href: "/dashboard/reports", icon: FileText, descriptionKey: "generatedOutputs", color: "bg-teal-500/10 text-teal-400" },
  { nameKey: "projects", href: "/dashboard/projects", icon: Folder, descriptionKey: "projectManagement", color: "bg-lime-500/10 text-lime-400" },
  { nameKey: "integrations", href: "/dashboard/integrations", icon: Plug, descriptionKey: "connectedServices", color: "bg-fuchsia-500/10 text-fuchsia-400" },
]

export function PlatformOverview({ moduleCounts = {} }: PlatformOverviewProps) {
  const t = useTranslations('dashboard.platform')

  return (
    <Card className="bg-card/50 border-border/50">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <CardTitle className="text-base font-medium">{t('platformModules')}</CardTitle>
        <Link href="/dashboard/store">
          <Button variant="ghost" size="sm" className="text-xs gap-1">
            {t('agentStore')}
            <ArrowRight className="h-3 w-3" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {modules.map((module) => {
            const Icon = module.icon
            const countKey = module.nameKey.replace(/([A-Z])/g, '').toLowerCase() as keyof typeof moduleCounts
            const count = moduleCounts[countKey]

            return (
              <Link key={module.nameKey} href={module.href}>
                <div className="flex items-center gap-3 p-3 rounded-lg border border-border/50 bg-secondary/20 hover:bg-secondary/40 hover:border-accent/30 transition-all cursor-pointer group">
                  <div className={`p-2 rounded-lg ${module.color.split(' ')[0]}`}>
                    <Icon className={`h-4 w-4 ${module.color.split(' ')[1]}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate group-hover:text-accent transition-colors">
                      {t(module.nameKey)}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {count !== undefined ? t('items', { count }) : t(module.descriptionKey)}
                    </p>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
