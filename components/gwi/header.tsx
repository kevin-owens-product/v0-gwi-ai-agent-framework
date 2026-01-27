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
import { useSidebar } from "@/components/providers/sidebar-provider"
import { useTranslations } from "@/lib/i18n"

function generateBreadcrumbs(pathname: string, t: ReturnType<typeof useTranslations>) {
  const routeLabels: Record<string, string> = {
    gwi: t('breadcrumbs.gwiPortal'),
    // Survey Management
    surveys: t('breadcrumbs.surveys'),
    questions: t('breadcrumbs.questions'),
    responses: t('breadcrumbs.responses'),
    distribution: t('breadcrumbs.distribution'),
    // Taxonomy
    taxonomy: t('breadcrumbs.taxonomy'),
    categories: t('breadcrumbs.categories'),
    attributes: t('breadcrumbs.attributes'),
    mappings: t('breadcrumbs.mappings'),
    validation: t('breadcrumbs.validation'),
    // Pipelines
    pipelines: t('breadcrumbs.pipelines'),
    runs: t('breadcrumbs.runs'),
    schedules: t('breadcrumbs.schedules'),
    // LLM
    llm: t('breadcrumbs.llm'),
    models: t('breadcrumbs.models'),
    prompts: t('breadcrumbs.prompts'),
    usage: t('breadcrumbs.usage'),
    testing: t('breadcrumbs.testing'),
    // Agents
    agents: t('breadcrumbs.agents'),
    templates: t('breadcrumbs.templates'),
    tools: t('breadcrumbs.tools'),
    capabilities: t('breadcrumbs.capabilities'),
    // Data Sources
    "data-sources": t('breadcrumbs.dataSources'),
    schemas: t('breadcrumbs.schemas'),
    sync: t('breadcrumbs.sync'),
    quality: t('breadcrumbs.quality'),
    connections: t('breadcrumbs.connections'),
    // Monitoring
    monitoring: t('breadcrumbs.monitoring'),
    errors: t('breadcrumbs.errors'),
    alerts: t('breadcrumbs.alerts'),
    health: t('breadcrumbs.health'),
    // System
    system: t('breadcrumbs.system'),
    settings: t('breadcrumbs.settings'),
    access: t('breadcrumbs.access'),
    audit: t('breadcrumbs.audit'),
    "api-keys": t('breadcrumbs.apiKeys'),
    // Overview
    activity: t('breadcrumbs.activity'),
    "quick-actions": t('breadcrumbs.quickActions'),
    // Dynamic route segments (IDs will be handled separately)
    new: t('breadcrumbs.new'),
    edit: t('breadcrumbs.edit'),
    details: t('breadcrumbs.details'),
  }

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
  const { toggleMobile } = useSidebar()
  const t = useTranslations('gwi')
  const breadcrumbs = generateBreadcrumbs(pathname, t)

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6 dark:border-slate-700 dark:bg-slate-900">
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        onClick={toggleMobile}
        aria-label="Toggle navigation menu"
      >
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
            placeholder={t('header.search')}
            className="w-64 pl-9 bg-slate-50 border-slate-200 dark:bg-slate-800 dark:border-slate-700"
          />
        </div>

        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative" aria-label={t('header.notificationsUnread', { count: 3 })}>
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-emerald-500 text-[10px] font-medium text-white flex items-center justify-center">
                3
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel>{t('header.notifications')}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="flex flex-col items-start gap-1 py-3">
              <span className="font-medium">{t('header.pipelineCompleted')}</span>
              <span className="text-xs text-slate-500">{t('header.pipelineCompletedDesc')}</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="flex flex-col items-start gap-1 py-3">
              <span className="font-medium">{t('header.newSurveyResponses')}</span>
              <span className="text-xs text-slate-500">{t('header.newSurveyResponsesDesc', { count: 150 })}</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="flex flex-col items-start gap-1 py-3">
              <span className="font-medium">{t('header.llmUsageAlert')}</span>
              <span className="text-xs text-slate-500">{t('header.llmUsageAlertDesc')}</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="justify-center">
              <Link href="/gwi/monitoring/alerts" className="text-emerald-600 text-sm font-medium">
                {t('header.viewAllNotifications')}
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
              <Link href="/gwi/system/settings">{t('breadcrumbs.settings')}</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/admin">{t('header.switchToAdmin')}</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-red-600"
              onClick={async () => {
                await fetch("/api/admin/auth/logout", { method: "POST" })
                window.location.href = "/login?type=admin"
              }}
            >
              {t('header.signOut')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
