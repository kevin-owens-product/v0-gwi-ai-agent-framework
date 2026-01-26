"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { Bell, Search, ChevronRight, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useGWIAdmin } from "@/components/providers/gwi-provider"

// Route to breadcrumb mapping
const routeLabels: Record<string, string> = {
  gwi: "GWI Portal",
  surveys: "Surveys",
  questions: "Questions",
  responses: "Responses",
  distribution: "Distribution",
  taxonomy: "Taxonomy",
  categories: "Categories",
  attributes: "Attributes",
  mappings: "Mapping Rules",
  validation: "Validation",
  pipelines: "Pipelines",
  runs: "Pipeline Runs",
  schedules: "Schedules",
  llm: "LLM Configuration",
  models: "Models",
  prompts: "Prompts",
  usage: "Usage & Costs",
  testing: "Testing",
  agents: "Agents",
  templates: "Templates",
  tools: "Tools",
  capabilities: "Capabilities",
  "data-sources": "Data Sources",
  schemas: "Schemas",
  sync: "Sync Status",
  quality: "Data Quality",
  monitoring: "Monitoring",
  errors: "Error Logs",
  alerts: "Alerts",
  system: "System",
  settings: "Settings",
  access: "Access Control",
  audit: "Audit Logs",
  "api-keys": "API Keys",
  activity: "Activity Feed",
  "quick-actions": "Quick Actions",
}

function generateBreadcrumbs(pathname: string) {
  const segments = pathname.split("/").filter(Boolean)
  const breadcrumbs: { label: string; href: string }[] = []

  let currentPath = ""
  for (const segment of segments) {
    currentPath += `/${segment}`
    const label = routeLabels[segment] || segment.charAt(0).toUpperCase() + segment.slice(1)
    breadcrumbs.push({ label, href: currentPath })
  }

  return breadcrumbs
}

export function GWIHeader() {
  const pathname = usePathname()
  const { admin } = useGWIAdmin()
  const breadcrumbs = generateBreadcrumbs(pathname)

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6 dark:border-slate-700 dark:bg-slate-900">
      {/* Mobile Menu Button */}
      <Button variant="ghost" size="icon" className="lg:hidden">
        <Menu className="h-5 w-5" />
      </Button>

      {/* Breadcrumbs */}
      <nav className="hidden lg:flex items-center space-x-1 text-sm">
        {breadcrumbs.map((crumb, index) => (
          <span key={crumb.href} className="flex items-center">
            {index > 0 && (
              <ChevronRight className="h-4 w-4 mx-1 text-slate-400" />
            )}
            {index === breadcrumbs.length - 1 ? (
              <span className="font-medium text-slate-900 dark:text-white">
                {crumb.label}
              </span>
            ) : (
              <Link
                href={crumb.href}
                className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
              >
                {crumb.label}
              </Link>
            )}
          </span>
        ))}
      </nav>

      {/* Right Actions */}
      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            type="search"
            placeholder="Search..."
            className="w-64 pl-9 bg-slate-50 border-slate-200 dark:bg-slate-800 dark:border-slate-700"
          />
        </div>

        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-emerald-500 text-[10px] font-medium text-white flex items-center justify-center">
                3
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel>Notifications</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="flex flex-col items-start gap-1 py-3">
              <span className="font-medium">Pipeline completed</span>
              <span className="text-xs text-slate-500">Survey data import finished successfully</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="flex flex-col items-start gap-1 py-3">
              <span className="font-medium">New survey responses</span>
              <span className="text-xs text-slate-500">150 new responses received</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="flex flex-col items-start gap-1 py-3">
              <span className="font-medium">LLM usage alert</span>
              <span className="text-xs text-slate-500">Approaching monthly token limit</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="justify-center">
              <Link href="/gwi/monitoring/alerts" className="text-emerald-600 text-sm font-medium">
                View all notifications
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-emerald-600/20 flex items-center justify-center">
                <span className="text-xs font-medium text-emerald-600">
                  {admin.name.split(" ").map(n => n[0]).join("").toUpperCase()}
                </span>
              </div>
              <span className="hidden md:inline text-sm font-medium">{admin.name}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>
              <div className="flex flex-col">
                <span>{admin.name}</span>
                <span className="text-xs font-normal text-slate-500">{admin.email}</span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/gwi/system/settings">Settings</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/admin">Switch to Admin Portal</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-red-600"
              onClick={async () => {
                await fetch("/api/admin/auth/logout", { method: "POST" })
                window.location.href = "/login?type=admin"
              }}
            >
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
