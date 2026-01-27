"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Sparkles, Calendar, ChevronDown } from "lucide-react"
import Link from "next/link"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useTranslations } from "next-intl"

export function DashboardHeader() {
  const t = useTranslations('dashboard.header')

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="space-y-1">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">{t('missionControl')}</h1>
          <Badge variant="outline" className="border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs">
            <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            {t('allSystemsOperational')}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">{t('realTimeOverview')}</p>
      </div>

      <div className="flex items-center gap-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2 text-muted-foreground bg-transparent">
              <Calendar className="h-4 w-4" />
              {t('last7Days')}
              <ChevronDown className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>{t('last24Hours')}</DropdownMenuItem>
            <DropdownMenuItem>{t('last7Days')}</DropdownMenuItem>
            <DropdownMenuItem>{t('last30Days')}</DropdownMenuItem>
            <DropdownMenuItem>{t('last90Days')}</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Link href="/dashboard/playground">
          <Button variant="outline" size="sm" className="gap-2 bg-transparent">
            <Sparkles className="h-4 w-4" />
            {t('playground')}
          </Button>
        </Link>

        <Link href="/dashboard/workflows/new">
          <Button size="sm" className="gap-2">
            <Plus className="h-4 w-4" />
            {t('newWorkflow')}
          </Button>
        </Link>
      </div>
    </div>
  )
}
