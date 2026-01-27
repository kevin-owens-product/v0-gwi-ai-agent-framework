/**
 * Client-side tracking wrapper for Workflows page
 */
'use client';

import { PageTracker } from "@/components/tracking/PageTracker";
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { WorkflowFilters } from "@/components/workflows/workflow-filters"
import { Plus, Search } from "lucide-react"
import Link from "next/link"
import { useTranslations } from "next-intl"

export function WorkflowsPageTracker() {
  return <PageTracker pageName="Workflows List" />;
}

export function WorkflowsPageContent() {
  const t = useTranslations('dashboard.pages.workflows')

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t('title')}</h1>
          <p className="text-muted-foreground">{t('description')}</p>
        </div>
        <Link href="/dashboard/workflows/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            {t('newWorkflow')}
          </Button>
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder={t('searchPlaceholder')} className="pl-10 bg-secondary" />
        </div>
        <WorkflowFilters />
      </div>
    </>
  )
}
