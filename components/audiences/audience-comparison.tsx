"use client"

import { useState, useEffect } from "react"
import { useTranslations } from "next-intl"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Users,
  ArrowLeftRight,
  TrendingUp,
  TrendingDown,
  Minus,
  BarChart3,
  Download,
  Table2,
} from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"

interface AudienceProfile {
  id: string
  name: string
  size: string
  demographics?: { label: string; value: string }[]
  behaviors?: string[]
  interests?: string[]
}

interface AudienceComparisonProps {
  primaryAudience: AudienceProfile
  availableAudiences: AudienceProfile[]
  className?: string
}

// Mock comparison metrics
const comparisonMetrics = [
  { category: "Demographics", metrics: [
    { name: "Age 18-34", field: "young" },
    { name: "Age 35-54", field: "middle" },
    { name: "Age 55+", field: "senior" },
    { name: "Female", field: "female" },
    { name: "Urban", field: "urban" },
    { name: "College+", field: "college" },
    { name: "HH Income $100K+", field: "high_income" },
  ]},
  { category: "Social Media", metrics: [
    { name: "TikTok", field: "tiktok" },
    { name: "Instagram", field: "instagram" },
    { name: "Facebook", field: "facebook" },
    { name: "YouTube", field: "youtube" },
    { name: "LinkedIn", field: "linkedin" },
  ]},
  { category: "Shopping", metrics: [
    { name: "Online Primary", field: "online_shopping" },
    { name: "In-Store Primary", field: "instore_shopping" },
    { name: "Brand Loyal", field: "brand_loyal" },
    { name: "Deal Seeker", field: "deal_seeker" },
    { name: "Premium Buyer", field: "premium_buyer" },
  ]},
  { category: "Values", metrics: [
    { name: "Eco-Conscious", field: "eco_conscious" },
    { name: "Health Focused", field: "health_focused" },
    { name: "Tech Enthusiast", field: "tech_enthusiast" },
    { name: "Family Oriented", field: "family_oriented" },
    { name: "Career Driven", field: "career_driven" },
  ]},
]

// Generate mock comparison data
function generateComparisonData(audience1Id: string, audience2Id: string) {
  const seed = (audience1Id + audience2Id).split('').reduce((a, b) => a + b.charCodeAt(0), 0)
  const random = (min: number, max: number, offset: number) => {
    const x = Math.sin(seed + offset) * 10000
    return Math.floor((x - Math.floor(x)) * (max - min + 1)) + min
  }

  const data: Record<string, { audience1: number; audience2: number }> = {}
  let offset = 0

  for (const category of comparisonMetrics) {
    for (const metric of category.metrics) {
      data[metric.field] = {
        audience1: random(15, 85, offset++),
        audience2: random(15, 85, offset++),
      }
    }
  }

  return data
}

export function AudienceComparison({
  primaryAudience,
  availableAudiences,
  className,
}: AudienceComparisonProps) {
  const t = useTranslations("audiences")
  const [comparisonAudienceId, setComparisonAudienceId] = useState<string>("")
  const [comparisonData, setComparisonData] = useState<Record<string, { audience1: number; audience2: number }>>({})

  const comparisonAudience = availableAudiences.find(a => a.id === comparisonAudienceId)

  useEffect(() => {
    if (comparisonAudienceId) {
      setComparisonData(generateComparisonData(primaryAudience.id, comparisonAudienceId))
    }
  }, [primaryAudience.id, comparisonAudienceId])

  const getDifferenceIndicator = (diff: number) => {
    if (diff > 15) return { icon: <TrendingUp className="h-4 w-4 text-green-500" />, color: "text-green-600", label: "Higher" }
    if (diff < -15) return { icon: <TrendingDown className="h-4 w-4 text-red-500" />, color: "text-red-600", label: "Lower" }
    return { icon: <Minus className="h-4 w-4 text-gray-400" />, color: "text-gray-500", label: "Similar" }
  }

  const getKeyDifferences = () => {
    if (!comparisonData || Object.keys(comparisonData).length === 0) return []

    const differences = Object.entries(comparisonData)
      .map(([field, values]) => ({
        field,
        diff: values.audience1 - values.audience2,
        absDiff: Math.abs(values.audience1 - values.audience2),
      }))
      .sort((a, b) => b.absDiff - a.absDiff)
      .slice(0, 5)

    return differences.map(d => {
      const metricName = comparisonMetrics
        .flatMap(c => c.metrics)
        .find(m => m.field === d.field)?.name || d.field

      return {
        name: metricName,
        diff: d.diff,
        ...getDifferenceIndicator(d.diff),
      }
    })
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ArrowLeftRight className="h-5 w-5" />
          <h2 className="text-lg font-semibold">{t("comparison.title")}</h2>
        </div>
        {comparisonAudience && (
          <Link href={`/dashboard/crosstabs/new?audiences=${primaryAudience.id},${comparisonAudienceId}`}>
            <Button size="sm">
              <Table2 className="h-4 w-4 mr-2" />
              {t("comparison.createCrosstab")}
            </Button>
          </Link>
        )}
      </div>

      {/* Audience Selector */}
      <div className="grid grid-cols-3 gap-4 items-center">
        {/* Primary Audience */}
        <Card className="p-4 bg-primary/5 border-primary/20">
          <div className="flex items-center gap-2 mb-2">
            <Users className="h-4 w-4 text-primary" />
            <span className="text-xs text-muted-foreground">{t("comparison.primary")}</span>
          </div>
          <h3 className="font-medium">{primaryAudience.name}</h3>
          <p className="text-sm text-muted-foreground">{t("comparison.consumers", { count: primaryAudience.size })}</p>
        </Card>

        {/* VS Divider */}
        <div className="flex justify-center">
          <Badge variant="outline" className="text-lg px-4 py-2">{t("comparison.vs")}</Badge>
        </div>

        {/* Comparison Selector */}
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Users className="h-4 w-4" />
            <span className="text-xs text-muted-foreground">{t("comparison.compareWith")}</span>
          </div>
          <Select value={comparisonAudienceId} onValueChange={setComparisonAudienceId}>
            <SelectTrigger>
              <SelectValue placeholder={t("comparison.selectAudience")} />
            </SelectTrigger>
            <SelectContent>
              {availableAudiences
                .filter(a => a.id !== primaryAudience.id)
                .map((audience) => (
                  <SelectItem key={audience.id} value={audience.id}>
                    {audience.name}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
          {comparisonAudience && (
            <p className="text-sm text-muted-foreground mt-2">{t("comparison.consumers", { count: comparisonAudience.size })}</p>
          )}
        </Card>
      </div>

      {/* Comparison Results */}
      {comparisonAudience && comparisonData && Object.keys(comparisonData).length > 0 && (
        <>
          {/* Key Differences */}
          <Card className="p-4">
            <h3 className="font-medium mb-3 flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              {t("comparison.keyDifferences")}
            </h3>
            <div className="space-y-2">
              {getKeyDifferences().map((diff) => (
                <div key={diff.name} className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
                  <span className="text-sm font-medium">{diff.name}</span>
                  <div className="flex items-center gap-2">
                    {diff.icon}
                    <span className={cn("text-sm font-mono", diff.color)}>
                      {diff.diff > 0 ? "+" : ""}{diff.diff} pts
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Detailed Comparison */}
          <div className="space-y-4">
            {comparisonMetrics.map((category) => (
              <Card key={category.category} className="p-4">
                <h3 className="font-medium mb-3">{category.category}</h3>
                <div className="space-y-3">
                  {category.metrics.map((metric) => {
                    const data = comparisonData[metric.field]
                    if (!data) return null
                    const diff = data.audience1 - data.audience2
                    const indicator = getDifferenceIndicator(diff)

                    return (
                      <div key={metric.field} className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span>{metric.name}</span>
                          <div className="flex items-center gap-2">
                            {indicator.icon}
                            <span className={cn("font-mono text-xs", indicator.color)}>
                              {diff > 0 ? "+" : ""}{diff} pts
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {/* Primary audience bar */}
                          <div className="flex-1">
                            <div className="h-2 bg-muted rounded-full overflow-hidden">
                              <div
                                className="h-full bg-primary transition-all duration-500"
                                style={{ width: `${data.audience1}%` }}
                              />
                            </div>
                          </div>
                          <span className="text-xs font-mono w-10 text-right">{data.audience1}%</span>
                          <span className="text-xs text-muted-foreground w-4 text-center">|</span>
                          <span className="text-xs font-mono w-10">{data.audience2}%</span>
                          {/* Comparison audience bar */}
                          <div className="flex-1">
                            <div className="h-2 bg-muted rounded-full overflow-hidden">
                              <div
                                className="h-full bg-blue-500 transition-all duration-500"
                                style={{ width: `${data.audience2}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </Card>
            ))}
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center gap-6 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-primary" />
              <span>{primaryAudience.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-blue-500" />
              <span>{comparisonAudience.name}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-center gap-4">
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              {t("comparison.exportComparison")}
            </Button>
            <Link href={`/dashboard/crosstabs/new?audiences=${primaryAudience.id},${comparisonAudienceId}`}>
              <Button>
                <BarChart3 className="h-4 w-4 mr-2" />
                {t("comparison.fullCrosstabAnalysis")}
              </Button>
            </Link>
          </div>
        </>
      )}

      {/* Empty State */}
      {!comparisonAudience && (
        <Card className="p-12 text-center">
          <ArrowLeftRight className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h3 className="font-medium mb-2">{t("comparison.selectToCompare")}</h3>
          <p className="text-sm text-muted-foreground">
            {t("comparison.selectToCompareDescription")}
          </p>
        </Card>
      )}
    </div>
  )
}
