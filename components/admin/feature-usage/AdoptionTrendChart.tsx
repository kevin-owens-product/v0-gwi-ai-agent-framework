/**
 * @prompt-id forge-v4.1:feature:feature-usage-analytics:008
 * @generated-at 2026-01-25T00:00:00Z
 * @model claude-opus-4.5
 *
 * Adoption Trend Chart Component
 * Displays adoption trends over time using an area chart
 */

"use client"

import { useState, useMemo } from "react"
import { useTranslations } from "next-intl"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"

interface TrendDataPoint {
  date: string
  [featureKey: string]: string | number
}

interface FeatureInfo {
  featureKey: string
  featureName: string
  category: string
}

interface AdoptionTrendChartProps {
  data: TrendDataPoint[]
  features: FeatureInfo[]
  title?: string
  description?: string
  height?: number
}

const CATEGORY_COLORS: Record<string, string> = {
  agents: "#8884d8",
  audiences: "#82ca9d",
  dashboards: "#ffc658",
  reports: "#ff7300",
  workflows: "#00C49F",
  charts: "#FFBB28",
  crosstabs: "#FF8042",
  api: "#a4de6c",
  data: "#d0ed57",
  collaboration: "#8dd1e1",
  settings: "#83a6ed",
}

const FEATURE_COLORS = [
  "#8884d8",
  "#82ca9d",
  "#ffc658",
  "#ff7300",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#a4de6c",
  "#d0ed57",
  "#8dd1e1",
]

export function AdoptionTrendChart({
  data,
  features,
  title,
  description,
  height = 400,
}: AdoptionTrendChartProps) {
  const t = useTranslations("admin.analytics.adoptionTrend")
  const displayTitle = title || t("title")
  const displayDescription = description || t("description")

  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [selectedFeatures, setSelectedFeatures] = useState<Set<string>>(
    new Set(features.slice(0, 5).map(f => f.featureKey))
  )

  // Filter features by category
  const filteredFeatures = useMemo(() => {
    if (categoryFilter === "all") return features
    return features.filter(f => f.category === categoryFilter)
  }, [features, categoryFilter])

  // Get unique categories
  const categories = useMemo(() => {
    return [...new Set(features.map(f => f.category))].sort()
  }, [features])

  // Prepare chart data with only selected features
  const chartData = useMemo(() => {
    if (data.length === 0) return []

    return data.map(point => {
      const newPoint: TrendDataPoint = { date: point.date }
      for (const featureKey of selectedFeatures) {
        if (point[featureKey] !== undefined) {
          newPoint[featureKey] = point[featureKey]
        }
      }
      return newPoint
    })
  }, [data, selectedFeatures])

  const handleFeatureToggle = (featureKey: string) => {
    const newSelected = new Set(selectedFeatures)
    if (newSelected.has(featureKey)) {
      newSelected.delete(featureKey)
    } else {
      // Limit to 10 features for readability
      if (newSelected.size < 10) {
        newSelected.add(featureKey)
      }
    }
    setSelectedFeatures(newSelected)
  }

  const handleSelectAll = () => {
    if (selectedFeatures.size === filteredFeatures.length) {
      setSelectedFeatures(new Set())
    } else {
      setSelectedFeatures(new Set(filteredFeatures.slice(0, 10).map(f => f.featureKey)))
    }
  }

  // Get color for feature
  const getFeatureColor = (featureKey: string, index: number): string => {
    const feature = features.find(f => f.featureKey === featureKey)
    if (feature?.category && CATEGORY_COLORS[feature.category]) {
      // Slightly vary the color based on index within category
      const baseColor = CATEGORY_COLORS[feature.category]
      return baseColor
    }
    return FEATURE_COLORS[index % FEATURE_COLORS.length]
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{displayTitle}</CardTitle>
            <CardDescription>{displayDescription}</CardDescription>
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder={t("filterByCategory")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("allCategories")}</SelectItem>
              {categories.map(cat => (
                <SelectItem key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex gap-6">
          {/* Feature selection panel */}
          <div className="w-48 flex-shrink-0">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">{t("features")}</span>
              <button
                onClick={handleSelectAll}
                className="text-xs text-primary hover:underline"
              >
                {selectedFeatures.size === filteredFeatures.length ? t("clear") : t("selectAll")}
              </button>
            </div>
            <ScrollArea className="h-[300px] border rounded-md p-2">
              <div className="space-y-2">
                {filteredFeatures.map((feature, index) => (
                  <div key={feature.featureKey} className="flex items-center gap-2">
                    <Checkbox
                      id={feature.featureKey}
                      checked={selectedFeatures.has(feature.featureKey)}
                      onCheckedChange={() => handleFeatureToggle(feature.featureKey)}
                    />
                    <label
                      htmlFor={feature.featureKey}
                      className="text-xs cursor-pointer flex-1 truncate"
                      title={feature.featureName}
                    >
                      <span
                        className="inline-block w-2 h-2 rounded-full mr-1"
                        style={{ backgroundColor: getFeatureColor(feature.featureKey, index) }}
                      />
                      {feature.featureName}
                    </label>
                  </div>
                ))}
              </div>
            </ScrollArea>
            <p className="text-xs text-muted-foreground mt-2">
              {t("featuresSelected", { count: selectedFeatures.size, max: 10 })}
            </p>
          </div>

          {/* Chart */}
          <div className="flex-1" style={{ height }}>
            {chartData.length === 0 || selectedFeatures.size === 0 ? (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                {selectedFeatures.size === 0
                  ? t("selectFeaturesPrompt")
                  : t("noData")
                }
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={chartData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                >
                  <defs>
                    {Array.from(selectedFeatures).map((featureKey, index) => (
                      <linearGradient
                        key={featureKey}
                        id={`gradient-${featureKey}`}
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor={getFeatureColor(featureKey, index)}
                          stopOpacity={0.3}
                        />
                        <stop
                          offset="95%"
                          stopColor={getFeatureColor(featureKey, index)}
                          stopOpacity={0}
                        />
                      </linearGradient>
                    ))}
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis
                    dataKey="date"
                    className="text-xs"
                    tick={{ fill: "hsl(var(--muted-foreground))" }}
                  />
                  <YAxis
                    className="text-xs"
                    tick={{ fill: "hsl(var(--muted-foreground))" }}
                    tickFormatter={(value) => `${value}%`}
                    domain={[0, 100]}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--background))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                    formatter={(value: number) => [`${value.toFixed(1)}%`, t("adoption")]}
                  />
                  <Legend />
                  {Array.from(selectedFeatures).map((featureKey, index) => {
                    const feature = features.find(f => f.featureKey === featureKey)
                    return (
                      <Area
                        key={featureKey}
                        type="monotone"
                        dataKey={featureKey}
                        name={feature?.featureName || featureKey}
                        stroke={getFeatureColor(featureKey, index)}
                        strokeWidth={2}
                        fillOpacity={1}
                        fill={`url(#gradient-${featureKey})`}
                      />
                    )
                  })}
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
