"use client"

import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ScatterChart,
  Scatter,
  FunnelChart,
  Funnel,
  LabelList,
  Treemap,
} from "recharts"
import { Loader2, Activity } from "lucide-react"
import { useTranslations } from "next-intl"

export type ChartType = "BAR" | "LINE" | "PIE" | "DONUT" | "AREA" | "SCATTER" | "HEATMAP" | "TREEMAP" | "FUNNEL" | "RADAR" | "METRIC"

export interface ChartDataPoint {
  name: string
  value: number
  [key: string]: string | number
}

export interface ChartRendererProps {
  type: ChartType
  data: ChartDataPoint[]
  config?: {
    colors?: string[]
    xAxisKey?: string
    yAxisKey?: string
    dataKey?: string
    showLegend?: boolean
    showGrid?: boolean
    showTooltip?: boolean
    height?: number
  }
  isLoading?: boolean
  className?: string
}

// Fallback colors if CSS variables not available
const FALLBACK_COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff7300", "#00C49F", "#FFBB28", "#FF8042"]

export function ChartRenderer({
  type,
  data,
  config = {},
  isLoading = false,
  className = "",
}: ChartRendererProps) {
  const t = useTranslations('ui.empty')
  const {
    colors = FALLBACK_COLORS,
    xAxisKey = "name",
    dataKey = "value",
    showLegend = true,
    showGrid = true,
    showTooltip = true,
    height = 300,
  } = config

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center ${className}`} style={{ height }}>
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  // Ensure data is a valid array
  const chartData = Array.isArray(data) ? data : []

  if (chartData.length === 0) {
    return (
      <div className={`flex items-center justify-center text-muted-foreground ${className}`} style={{ height }}>
        {t('noData')}
      </div>
    )
  }

  const commonProps = {
    data: chartData,
    margin: { top: 20, right: 30, left: 20, bottom: 20 },
  }

  const renderChart = () => {
    switch (type) {
      case "BAR":
        return (
          <BarChart {...commonProps}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />}
            <XAxis dataKey={xAxisKey} className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))" }} />
            <YAxis className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))" }} />
            {showTooltip && <Tooltip contentStyle={{ backgroundColor: "hsl(var(--background))", border: "1px solid hsl(var(--border))" }} />}
            {showLegend && <Legend />}
            <Bar dataKey={dataKey} fill={colors[0]} radius={[4, 4, 0, 0]}>
              {chartData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Bar>
          </BarChart>
        )

      case "LINE":
        return (
          <LineChart {...commonProps}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />}
            <XAxis dataKey={xAxisKey} className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))" }} />
            <YAxis className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))" }} />
            {showTooltip && <Tooltip contentStyle={{ backgroundColor: "hsl(var(--background))", border: "1px solid hsl(var(--border))" }} />}
            {showLegend && <Legend />}
            <Line type="monotone" dataKey={dataKey} stroke={colors[0]} strokeWidth={2} dot={{ fill: colors[0] }} />
          </LineChart>
        )

      case "AREA":
        return (
          <AreaChart {...commonProps}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />}
            <XAxis dataKey={xAxisKey} className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))" }} />
            <YAxis className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))" }} />
            {showTooltip && <Tooltip contentStyle={{ backgroundColor: "hsl(var(--background))", border: "1px solid hsl(var(--border))" }} />}
            {showLegend && <Legend />}
            <Area type="monotone" dataKey={dataKey} stroke={colors[0]} fill={colors[0]} fillOpacity={0.3} />
          </AreaChart>
        )

      case "PIE":
        return (
          <PieChart>
            {showTooltip && <Tooltip contentStyle={{ backgroundColor: "hsl(var(--background))", border: "1px solid hsl(var(--border))" }} />}
            {showLegend && <Legend />}
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name ?? ''} ${typeof percent === 'number' ? (percent * 100).toFixed(0) : 0}%`}
              outerRadius={80}
              fill={colors[0]}
              dataKey={dataKey}
            >
              {chartData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Pie>
          </PieChart>
        )

      case "DONUT":
        return (
          <PieChart>
            {showTooltip && <Tooltip contentStyle={{ backgroundColor: "hsl(var(--background))", border: "1px solid hsl(var(--border))" }} />}
            {showLegend && <Legend />}
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name ?? ''} ${typeof percent === 'number' ? (percent * 100).toFixed(0) : 0}%`}
              innerRadius={40}
              outerRadius={80}
              fill={colors[0]}
              dataKey={dataKey}
            >
              {chartData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Pie>
          </PieChart>
        )

      case "RADAR":
        return (
          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
            <PolarGrid />
            <PolarAngleAxis dataKey={xAxisKey} className="text-xs" />
            <PolarRadiusAxis />
            {showTooltip && <Tooltip contentStyle={{ backgroundColor: "hsl(var(--background))", border: "1px solid hsl(var(--border))" }} />}
            {showLegend && <Legend />}
            <Radar name="Value" dataKey={dataKey} stroke={colors[0]} fill={colors[0]} fillOpacity={0.5} />
          </RadarChart>
        )

      case "SCATTER":
        return (
          <ScatterChart {...commonProps}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />}
            <XAxis dataKey={xAxisKey} type="number" name={xAxisKey} className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))" }} />
            <YAxis dataKey={dataKey} type="number" name={dataKey} className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))" }} />
            {showTooltip && <Tooltip contentStyle={{ backgroundColor: "hsl(var(--background))", border: "1px solid hsl(var(--border))" }} />}
            {showLegend && <Legend />}
            <Scatter name="Data" data={chartData} fill={colors[0]} />
          </ScatterChart>
        )

      case "FUNNEL":
        return (
          <FunnelChart>
            {showTooltip && <Tooltip contentStyle={{ backgroundColor: "hsl(var(--background))", border: "1px solid hsl(var(--border))" }} />}
            {showLegend && <Legend />}
            <Funnel dataKey={dataKey} data={chartData} isAnimationActive>
              {chartData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
              <LabelList position="right" fill="#000" stroke="none" dataKey={xAxisKey} />
            </Funnel>
          </FunnelChart>
        )

      case "TREEMAP":
        return (
          <Treemap
            data={chartData}
            dataKey={dataKey}
            aspectRatio={4 / 3}
            stroke="#fff"
            fill={colors[0]}
          >
            {chartData.map((_, index) => (
              <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
            ))}
          </Treemap>
        )

      case "HEATMAP":
        // Heatmap is complex - render as a colored bar chart as fallback
        return (
          <BarChart {...commonProps} layout="vertical">
            {showGrid && <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />}
            <XAxis type="number" className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))" }} />
            <YAxis dataKey={xAxisKey} type="category" className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))" }} />
            {showTooltip && <Tooltip contentStyle={{ backgroundColor: "hsl(var(--background))", border: "1px solid hsl(var(--border))" }} />}
            {showLegend && <Legend />}
            <Bar dataKey={dataKey} fill={colors[0]}>
              {chartData.map((entry, index) => {
                const intensity = (entry[dataKey] as number) / Math.max(...chartData.map(d => d[dataKey] as number))
                return <Cell key={`cell-${index}`} fill={`rgba(136, 132, 216, ${0.3 + intensity * 0.7})`} />
              })}
            </Bar>
          </BarChart>
        )

      case "METRIC":
        // Metric displays a single KPI value prominently
        const metricValue = chartData[0]?.value ?? 0
        const metricName = chartData[0]?.name ?? "Metric"
        return (
          <div className="flex flex-col items-center justify-center h-full p-4">
            <Activity className="h-8 w-8 text-primary mb-2" />
            <span className="text-3xl font-bold">{metricValue}</span>
            <span className="text-sm text-muted-foreground">{metricName}</span>
          </div>
        )

      default:
        return (
          <div className="flex items-center justify-center text-muted-foreground" style={{ height }}>
            Unsupported chart type: {type}
          </div>
        )
    }
  }

  return (
    <div className={className} style={{ width: "100%", height }}>
      <ResponsiveContainer width="100%" height="100%">
        {renderChart()}
      </ResponsiveContainer>
    </div>
  )
}

// Helper function to generate sample data for previews
// Uses deterministic values to avoid hydration mismatches between server and client
export function generateSampleData(type: ChartType, count: number = 6, seed?: string): ChartDataPoint[] {
  const labels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
  const categories = ["Social Media", "Email", "Search", "Display", "Video", "Referral"]

  // Generate a hash from the seed for deterministic but varied values
  const hashSeed = (str: string): number => {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash
    }
    return Math.abs(hash)
  }

  const seedOffset = seed ? hashSeed(seed) : 0

  // Deterministic values based on position to avoid hydration issues
  const getValueForIndex = (index: number, chartType: ChartType): number => {
    // Use different base patterns for different chart types to make them look varied
    const patterns: Record<string, number[]> = {
      BAR: [65, 82, 45, 78, 92, 58, 73, 88, 52, 69, 85, 61],
      LINE: [42, 58, 65, 72, 68, 85, 92, 88, 78, 95, 82, 89],
      AREA: [55, 62, 48, 75, 82, 68, 91, 85, 72, 88, 79, 94],
      PIE: [35, 25, 20, 12, 5, 3],
      DONUT: [30, 28, 22, 12, 5, 3],
      FUNNEL: [100, 85, 65, 45, 30, 20],
      TREEMAP: [45, 38, 32, 28, 22, 18],
      RADAR: [72, 85, 68, 92, 78, 55, 88, 62, 75, 82, 69, 91],
      SCATTER: [45, 72, 38, 85, 52, 68, 91, 35, 78, 62, 88, 55],
      HEATMAP: [88, 65, 78, 52, 92, 45, 72, 85, 58, 95, 68, 82],
      METRIC: [85],
    }
    const pattern = patterns[chartType] || patterns.BAR
    // Apply seed offset to get varied but deterministic values
    const adjustedIndex = (index + seedOffset) % pattern.length
    const baseValue = pattern[adjustedIndex]
    // Add slight variation based on seed without breaking determinism
    const variation = seed ? ((seedOffset + index) % 20) - 10 : 0
    return Math.max(5, Math.min(100, baseValue + variation))
  }

  switch (type) {
    case "PIE":
    case "DONUT":
    case "FUNNEL":
    case "TREEMAP":
      return categories.slice(0, count).map((name, index) => ({
        name,
        value: getValueForIndex(index, type),
      }))

    case "METRIC":
      // Metrics only need a single data point
      return [{ name: "Value", value: getValueForIndex(0, type) }]

    default:
      return labels.slice(0, count).map((name, index) => ({
        name,
        value: getValueForIndex(index, type),
      }))
  }
}

// Export index file content
export { ChartRenderer as default }
