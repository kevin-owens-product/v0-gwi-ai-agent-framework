"use client"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, Download, RefreshCw } from "lucide-react"

export function AnalyticsHeader() {
  const t = useTranslations("dashboard.analytics.header")
  
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-3xl font-bold">{t("title")}</h1>
        <p className="text-muted-foreground">{t("description")}</p>
      </div>
      <div className="flex items-center gap-3">
        <Select defaultValue="30d">
          <SelectTrigger className="w-40">
            <Calendar className="mr-2 h-4 w-4" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">{t("period.last7Days")}</SelectItem>
            <SelectItem value="30d">{t("period.last30Days")}</SelectItem>
            <SelectItem value="90d">{t("period.last90Days")}</SelectItem>
            <SelectItem value="1y">{t("period.lastYear")}</SelectItem>
            <SelectItem value="custom">{t("period.customRange")}</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" size="icon">
          <RefreshCw className="h-4 w-4" />
        </Button>
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" />
          {t("export")}
        </Button>
      </div>
    </div>
  )
}
