"use client"

import { use } from "react"
import { ReportBuilder } from "@/components/reports/report-builder"

export default function EditReportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  return <ReportBuilder reportId={id} />
}
