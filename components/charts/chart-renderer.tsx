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
import { Loader2 } from "lucide-react"

export type ChartType = "BAR" | "LINE" | "PIE" | "DONUT" | "AREA" | "SCATTER" | "HEATMAP" | "TREEMAP" | "FUNNEL" | "RADAR"

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

// Default color palette
const _DEFAULT_COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
]

// Fallback colors if CSS variables not available
const FALLBACK_COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff7300", "#00C49F", "#FFBB28", "#FF8042"]

export function ChartRenderer({
  type,
  data,
  config = {},
  isLoading = false,
  className = "",
}: ChartRendererProps) {
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
        No data available
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
export function generateSampleData(type: ChartType, count: number = 6): ChartDataPoint[] {
  const labels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
  const categories = ["Social Media", "Email", "Search", "Display", "Video", "Referral"]

  switch (type) {
    case "PIE":
    case "DONUT":
    case "FUNNEL":
    case "TREEMAP":
      return categories.slice(0, count).map((name) => ({
        name,
        value: Math.floor(Math.random() * 100) + 20,
      }))

    default:
      return labels.slice(0, count).map((name) => ({
        name,
        value: Math.floor(Math.random() * 100) + 20,
      }))
  }
}

// Export index file content
export { ChartRenderer as default }
