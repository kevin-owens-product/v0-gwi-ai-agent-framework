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

interface ModuleLink {
  name: string
  href: string
  icon: typeof Users
  description: string
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
  { name: "Audiences", href: "/dashboard/audiences", icon: Users, description: "Audience segments", color: "bg-blue-500/10 text-blue-400" },
  { name: "Brand Tracking", href: "/dashboard/brand-tracking", icon: Target, description: "Monitor brands", color: "bg-rose-500/10 text-rose-400" },
  { name: "Charts", href: "/dashboard/charts", icon: BarChart3, description: "Visualizations", color: "bg-emerald-500/10 text-emerald-400" },
  { name: "Crosstabs", href: "/dashboard/crosstabs", icon: Table2, description: "Compare data", color: "bg-violet-500/10 text-violet-400" },
  { name: "Dashboards", href: "/dashboard/dashboards", icon: PieChart, description: "Custom views", color: "bg-amber-500/10 text-amber-400" },
  { name: "Workflows", href: "/dashboard/workflows", icon: Workflow, description: "Automation", color: "bg-indigo-500/10 text-indigo-400" },
  { name: "Agents", href: "/dashboard/agents", icon: Bot, description: "AI assistants", color: "bg-pink-500/10 text-pink-400" },
  { name: "Templates", href: "/dashboard/templates", icon: LayoutTemplate, description: "Reusable prompts", color: "bg-orange-500/10 text-orange-400" },
  { name: "Reports", href: "/dashboard/reports", icon: FileText, description: "Generated outputs", color: "bg-teal-500/10 text-teal-400" },
  { name: "Projects", href: "/dashboard/projects", icon: Folder, description: "Project management", color: "bg-lime-500/10 text-lime-400" },
  { name: "Integrations", href: "/dashboard/integrations", icon: Plug, description: "Connected services", color: "bg-fuchsia-500/10 text-fuchsia-400" },
]

export function PlatformOverview({ moduleCounts = {} }: PlatformOverviewProps) {
  return (
    <Card className="bg-card/50 border-border/50">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <CardTitle className="text-base font-medium">Platform Modules</CardTitle>
        <Link href="/dashboard/store">
          <Button variant="ghost" size="sm" className="text-xs gap-1">
            Agent Store
            <ArrowRight className="h-3 w-3" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {modules.map((module) => {
            const Icon = module.icon
            const countKey = module.name.toLowerCase().replace(' ', '') as keyof typeof moduleCounts
            const count = moduleCounts[countKey]

            return (
              <Link key={module.name} href={module.href}>
                <div className="flex items-center gap-3 p-3 rounded-lg border border-border/50 bg-secondary/20 hover:bg-secondary/40 hover:border-accent/30 transition-all cursor-pointer group">
                  <div className={`p-2 rounded-lg ${module.color.split(' ')[0]}`}>
                    <Icon className={`h-4 w-4 ${module.color.split(' ')[1]}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate group-hover:text-accent transition-colors">
                      {module.name}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {count !== undefined ? `${count} items` : module.description}
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
