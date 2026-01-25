/**
 * @prompt-id forge-v4.1:feature:feature-usage-analytics:005
 * @generated-at 2026-01-25T00:00:00Z
 * @model claude-opus-4.5
 *
 * Feature Adoption Chart Component
 * Displays adoption rates across features using a bar chart
 */

"use client"

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  Legend,
} from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface FeatureData {
  featureKey: string
  featureName: string
  adoptionRate: number
  activeUsers: number
  category?: string
}

interface FeatureAdoptionChartProps {
  data: FeatureData[]
  title?: string
  description?: string
  showLegend?: boolean
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

export function FeatureAdoptionChart({
  data,
  title = "Feature Adoption Overview",
  description = "Adoption rates by feature",
  showLegend = true,
  height = 400,
}: FeatureAdoptionChartProps) {
  // Sort by adoption rate descending and take top 15
  const chartData = [...data]
    .sort((a, b) => b.adoptionRate - a.adoptionRate)
    .slice(0, 15)
    .map(item => ({
      name: item.featureName.length > 20
        ? item.featureName.substring(0, 17) + "..."
        : item.featureName,
      fullName: item.featureName,
      adoptionRate: item.adoptionRate,
      activeUsers: item.activeUsers,
      category: item.category || "other",
    }))

  // Get unique categories for legend
  const categories = [...new Set(chartData.map(d => d.category))]

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <div
            className="flex items-center justify-center text-muted-foreground"
            style={{ height }}
          >
            No adoption data available
          </div>
        ) : (
          <div style={{ width: "100%", height }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                layout="vertical"
                margin={{ top: 20, right: 30, left: 120, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  type="number"
                  domain={[0, 100]}
                  tick={{ fill: "hsl(var(--muted-foreground))" }}
                  tickFormatter={(value) => `${value}%`}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                  width={110}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--background))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                  formatter={(value: number, _name: string, props) => {
                    const payload = props.payload
                    return [
                      <span key="rate">{value.toFixed(1)}% adoption ({payload.activeUsers} users)</span>,
                      payload.fullName,
                    ]
                  }}
                />
                {showLegend && (
                  <Legend
                    payload={categories.map(cat => ({
                      value: cat.charAt(0).toUpperCase() + cat.slice(1),
                      type: "square",
                      color: CATEGORY_COLORS[cat] || "#8884d8",
                    }))}
                  />
                )}
                <Bar dataKey="adoptionRate" radius={[0, 4, 4, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={CATEGORY_COLORS[entry.category] || "#8884d8"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
