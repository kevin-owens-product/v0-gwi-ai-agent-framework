"use client"

import Link from "next/link"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Plus, Upload } from "lucide-react"

export function ReportsHeader() {
  const t = useTranslations("reports")

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-3xl font-bold">{t("header.title")}</h1>
        <p className="text-muted-foreground">{t("header.description")}</p>
      </div>
      <div className="flex items-center gap-3">
        <Button variant="outline">
          <Upload className="mr-2 h-4 w-4" />
          {t("header.import")}
        </Button>
        <Button asChild>
          <Link href="/dashboard/reports/new">
            <Plus className="mr-2 h-4 w-4" />
            {t("header.newReport")}
          </Link>
        </Button>
      </div>
    </div>
  )
}
