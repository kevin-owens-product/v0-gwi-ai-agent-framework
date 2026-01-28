/**
 * @prompt-id forge-v4.1:feature:revenue-analytics:009
 * @generated-at 2026-01-25T00:00:00Z
 * @model claude-opus-4-5
 */

"use client"

import { useTranslations } from "next-intl"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface CohortData {
  cohortDate: string
  initialCustomers: number
  currentCustomers: number
  initialMrr: number
  currentMrr: number
  retentionRate: number
  revenueRetention: number
  monthsActive: number
}

interface CohortAnalysisTableProps {
  data: CohortData[]
  isLoading?: boolean
}

export function CohortAnalysisTable({ data, isLoading }: CohortAnalysisTableProps) {
  const t = useTranslations("admin.analytics.cohortAnalysis")
  const tTable = useTranslations('ui.table')
  const tLoading = useTranslations('ui.loading')

  const formatCurrency = (value: number) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(2)}M`
    if (value >= 1000) return `$${(value / 1000).toFixed(1)}K`
    return `$${value.toFixed(2)}`
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString("en-US", { month: "short", year: "numeric" })
  }

  const getRetentionColor = (rate: number) => {
    if (rate >= 90) return "text-green-500"
    if (rate >= 75) return "text-yellow-500"
    return "text-red-500"
  }

  const getRevenueRetentionBadge = (rate: number) => {
    if (rate >= 100) {
      return (
        <Badge variant="default" className="bg-green-500">
          {rate.toFixed(1)}%
        </Badge>
      )
    }
    if (rate >= 90) {
      return (
        <Badge variant="secondary">
          {rate.toFixed(1)}%
        </Badge>
      )
    }
    return (
      <Badge variant="destructive">
        {rate.toFixed(1)}%
      </Badge>
    )
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("title")}</CardTitle>
          <CardDescription>{tLoading('loading')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-10 bg-muted rounded animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("title")}</CardTitle>
          <CardDescription>{t("description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-48 flex items-center justify-center text-muted-foreground">
            {tTable('noResults')}
          </div>
        </CardContent>
      </Card>
    )
  }

  // Calculate cohort averages
  const avgRetention = data.length > 0
    ? data.reduce((sum, c) => sum + c.retentionRate, 0) / data.length
    : 0

  const avgRevenueRetention = data.length > 0
    ? data.reduce((sum, c) => sum + c.revenueRetention, 0) / data.length
    : 0

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{t("title")}</CardTitle>
            <CardDescription>{t("description")}</CardDescription>
          </div>
          <div className="flex gap-4 text-sm">
            <div className="text-right">
              <div className="text-muted-foreground">{t("avgLogoRetention")}</div>
              <div className={`font-semibold ${getRetentionColor(avgRetention)}`}>
                {avgRetention.toFixed(1)}%
              </div>
            </div>
            <div className="text-right">
              <div className="text-muted-foreground">{t("avgRevenueRetention")}</div>
              <div className={`font-semibold ${avgRevenueRetention >= 100 ? "text-green-500" : "text-yellow-500"}`}>
                {avgRevenueRetention.toFixed(1)}%
              </div>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("table.cohort")}</TableHead>
                <TableHead className="text-right">{t("table.initial")}</TableHead>
                <TableHead className="text-right">{t("table.current")}</TableHead>
                <TableHead className="text-right">{t("table.initialMrr")}</TableHead>
                <TableHead className="text-right">{t("table.currentMrr")}</TableHead>
                <TableHead className="text-center">{t("table.logoRetention")}</TableHead>
                <TableHead className="text-center">{t("table.revenueRetention")}</TableHead>
                <TableHead className="text-right">{t("table.months")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((cohort) => {
                const customerDelta = cohort.currentCustomers - cohort.initialCustomers
                const mrrDelta = cohort.currentMrr - cohort.initialMrr

                return (
                  <TableRow key={cohort.cohortDate}>
                    <TableCell className="font-medium">
                      {formatDate(cohort.cohortDate)}
                    </TableCell>
                    <TableCell className="text-right">
                      {cohort.initialCustomers}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        {cohort.currentCustomers}
                        {customerDelta !== 0 && (
                          <span className={`text-xs ${customerDelta > 0 ? "text-green-500" : "text-red-500"}`}>
                            ({customerDelta > 0 ? "+" : ""}{customerDelta})
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(cohort.initialMrr)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        {formatCurrency(cohort.currentMrr)}
                        {mrrDelta !== 0 && (
                          <span className={`text-xs ${mrrDelta > 0 ? "text-green-500" : "text-red-500"}`}>
                            ({mrrDelta > 0 ? "+" : ""}{formatCurrency(mrrDelta)})
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className={getRetentionColor(cohort.retentionRate)}>
                        {cohort.retentionRate.toFixed(1)}%
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      {getRevenueRetentionBadge(cohort.revenueRetention)}
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {cohort.monthsActive}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>

        {/* Retention Heatmap */}
        <div className="mt-6">
          <h4 className="text-sm font-medium mb-3">{t("retentionHeatmap")}</h4>
          <div className="flex flex-wrap gap-2">
            {data.map((cohort) => {
              const intensity = cohort.retentionRate / 100
              const bgColor = `rgba(34, 197, 94, ${intensity})`

              return (
                <div
                  key={cohort.cohortDate}
                  className="flex flex-col items-center p-2 rounded border text-xs"
                  style={{ backgroundColor: bgColor }}
                  title={`${formatDate(cohort.cohortDate)}: ${cohort.retentionRate.toFixed(1)}% retention`}
                >
                  <span className="font-medium">{formatDate(cohort.cohortDate).slice(0, 3)}</span>
                  <span className={intensity > 0.5 ? "text-white" : ""}>
                    {cohort.retentionRate.toFixed(0)}%
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
