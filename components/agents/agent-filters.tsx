"use client"

import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { SlidersHorizontal } from "lucide-react"

export function AgentFilters() {
  const t = useTranslations("agents.filters")

  return (
    <div className="flex items-center gap-2">
      <Select defaultValue="popular">
        <SelectTrigger className="w-[130px] bg-secondary">
          <SelectValue placeholder={t("sort")} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="popular">{t("mostPopular")}</SelectItem>
          <SelectItem value="recent">{t("recentlyAdded")}</SelectItem>
          <SelectItem value="name">{t("name")}</SelectItem>
          <SelectItem value="usage">{t("mostUsed")}</SelectItem>
        </SelectContent>
      </Select>
      <Button variant="outline" size="icon">
        <SlidersHorizontal className="h-4 w-4" />
      </Button>
    </div>
  )
}
