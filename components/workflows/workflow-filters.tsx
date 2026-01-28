"use client"

import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Filter } from "lucide-react"

export function WorkflowFilters() {
  const t = useTranslations("dashboard.pages.workflows.filters")

  return (
    <div className="flex items-center gap-2">
      <Select defaultValue="all">
        <SelectTrigger className="w-[140px] bg-secondary">
          <SelectValue placeholder={t("status")} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{t("allStatus")}</SelectItem>
          <SelectItem value="active">{t("active")}</SelectItem>
          <SelectItem value="completed">{t("completed")}</SelectItem>
          <SelectItem value="scheduled">{t("scheduled")}</SelectItem>
          <SelectItem value="failed">{t("failed")}</SelectItem>
        </SelectContent>
      </Select>
      <Select defaultValue="recent">
        <SelectTrigger className="w-[140px] bg-secondary">
          <SelectValue placeholder={t("sortBy")} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="recent">{t("mostRecent")}</SelectItem>
          <SelectItem value="name">{t("name")}</SelectItem>
          <SelectItem value="runs">{t("mostRuns")}</SelectItem>
        </SelectContent>
      </Select>
      <Button variant="outline" size="icon">
        <Filter className="h-4 w-4" />
      </Button>
    </div>
  )
}
