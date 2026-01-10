"use client"

import { useSearchParams } from "next/navigation"
import { ReportBuilder } from "@/components/reports/report-builder"

export default function NewReportPage() {
  const searchParams = useSearchParams()
  const templateId = searchParams.get("template")
  const templateTitle = searchParams.get("title")
  const templateDescription = searchParams.get("description")

  return (
    <ReportBuilder
      templateId={templateId || undefined}
      templateTitle={templateTitle || undefined}
      templateDescription={templateDescription || undefined}
    />
  )
}
