"use client"

import { useMemo, useState, useCallback, useRef } from "react"
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
  ComposedChart,
  ReferenceLine,
  Brush,
  ZAxis,
} from "recharts"
import { Loader2, Activity, TrendingUp, TrendingDown, Minus, ZoomIn, ZoomOut, Download } from "lucide-react"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { generateAdvancedSampleData, gwiColorPalettes, formatters, type GWIChartTemplate } from "./data/gwi-sample-data"

export type AdvancedChartType =
  | "BAR"
  | "HORIZONTAL_BAR"
  | "GROUPED_BAR"
  | "STACKED_BAR"
  | "LINE"
  | "MULTI_LINE"
  | "AREA"
  | "STACKED_AREA"
  | "PIE"
  | "DONUT"
  | "RADAR"
  | "SCATTER"
  | "BUBBLE"
  | "FUNNEL"
  | "TREEMAP"
  | "HEATMAP"
  | "COMBO"
  | "WATERFALL"
  | "BULLET"
  | "METRIC"
  | "SPARKLINE"
  | "COMPARISON_BAR"

export interface AdvancedChartDataPoint {
  name: string
  value: number
  [key: string]: string | number | boolean | undefined
}

export interface AdvancedChartConfig {
  colors?: string[]
  colorPalette?: keyof typeof gwiColorPalettes
  xAxisKey?: string
  yAxisKey?: string
  dataKey?: string
  dataKeys?: string[]
  showLegend?: boolean
  showGrid?: boolean
  showTooltip?: boolean
  showBrush?: boolean
  showZoom?: boolean
  showAnnotations?: boolean
  showBenchmark?: boolean
  showChange?: boolean
  showTrendline?: boolean
  benchmarkValue?: number
  benchmarkLabel?: string
  height?: number
  animate?: boolean
  animationDuration?: number
  horizontal?: boolean
  stacked?: boolean
  fillOpacity?: number
  strokeWidth?: number
  borderRadius?: number
  innerRadius?: number
  outerRadius?: number
  formatter?: keyof typeof formatters
  title?: string
  subtitle?: string
  interactive?: boolean
}

export interface AdvancedChartRendererProps {
  type: AdvancedChartType
  data: AdvancedChartDataPoint[]
  config?: AdvancedChartConfig
  isLoading?: boolean
  className?: string
  template?: GWIChartTemplate
  onDataPointClick?: (data: any, index: number) => void
  onExport?: (format: "png" | "svg" | "csv") => void
}

// Custom tooltip component
const CustomTooltip = ({
  active,
  payload,
  label,
  formatter,
  showChange,
}: any) => {
  if (!active || !payload || !payload.length) return null

  return (
    <div className="bg-popover border border-border rounded-lg shadow-lg p-3 min-w-[180px]">
      <p className="text-sm font-medium text-foreground mb-2">{label}</p>
      {payload.map((entry: any, index: number) => {
        const change = entry.payload?.change
        const formattedValue = formatter && formatter in formatters ? formatters[formatter as keyof typeof formatters](entry.value) : entry.value

        return (
          <div key={index} className="flex items-center justify-between gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-muted-foreground">{entry.name || entry.dataKey}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium">{formattedValue}</span>
              {showChange && change !== undefined && (
                <span
                  className={cn(
                    "text-xs flex items-center",
                    change > 0 ? "text-green-500" : change < 0 ? "text-red-500" : "text-muted-foreground"
                  )}
                >
                  {change > 0 ? (
                    <TrendingUp className="w-3 h-3 mr-0.5" />
                  ) : change < 0 ? (
                    <TrendingDown className="w-3 h-3 mr-0.5" />
                  ) : (
                    <Minus className="w-3 h-3 mr-0.5" />
                  )}
                  {Math.abs(change)}%
                </span>
              )}
            </div>
          </div>
        )
      })}
      {payload[0]?.payload?.benchmark !== undefined && (
        <div className="mt-2 pt-2 border-t border-border text-xs text-muted-foreground">
          Benchmark: {formatter && formatter in formatters ? formatters[formatter as keyof typeof formatters](payload[0].payload.benchmark) : payload[0].payload.benchmark}
        </div>
      )}
      {payload[0]?.payload?.sampleSize && (
        <div className="text-xs text-muted-foreground">
          Sample: n={formatters.compact(payload[0].payload.sampleSize)}
        </div>
      )}
    </div>
  )
}

// Custom legend component
const CustomLegend = ({ payload }: any) => {
  if (!payload) return null

  return (
    <div className="flex flex-wrap justify-center gap-4 mt-4">
      {payload.map((entry: any, index: number) => (
        <div key={index} className="flex items-center gap-2 text-sm">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-muted-foreground">{entry.value}</span>
        </div>
      ))}
    </div>
  )
}

export function AdvancedChartRenderer({
  type,
  data,
  config = {},
  isLoading = false,
  className = "",
  template,
  onDataPointClick,
  onExport,
}: AdvancedChartRendererProps) {
  const t = useTranslations('ui.empty')
  const tLoading = useTranslations('ui.loading')
  const chartRef = useRef<HTMLDivElement>(null)
  const [zoomLevel, setZoomLevel] = useState(1)
  const [activeIndex, setActiveIndex] = useState<number | null>(null)

  const {
    colors,
    colorPalette = "gwiBrand",
    xAxisKey = "name",
    dataKey = "value",
    dataKeys = [],
    showLegend = true,
    showGrid = true,
    showTooltip = true,
    showBrush = false,
    showZoom = false,
    showBenchmark = false,
    showChange = false,
    benchmarkValue,
    benchmarkLabel = "Benchmark",
    height = 300,
    animate = true,
    animationDuration = 800,
    horizontal = false,
    stacked: _stacked = false,
    fillOpacity = 0.8,
    strokeWidth = 2,
    borderRadius = 4,
    innerRadius = 60,
    outerRadius = 80,
    formatter = "percentage",
    interactive = true,
  } = config

  // Get colors from palette or use provided colors
  const chartColors = useMemo(() => {
    if (colors?.length) return colors
    return gwiColorPalettes[colorPalette] || gwiColorPalettes.gwiBrand
  }, [colors, colorPalette])

  // Get chart data - use template data if available, otherwise use provided data
  // Always ensure we return a valid array to prevent Recharts errors
  const chartData = useMemo(() => {
    // If template is specified, always use template data
    if (template) {
      const templateData = generateAdvancedSampleData(type, template)
      return Array.isArray(templateData) ? templateData : []
    }
    // Validate provided data is a non-empty array
    if (data && Array.isArray(data) && data.length > 0) {
      return data
    }
    // Fall back to generated sample data
    const sampleData = generateAdvancedSampleData(type)
    return Array.isArray(sampleData) ? sampleData : []
  }, [data, type, template])

  // Handle data point click
  const handleClick = useCallback(
    (data: any, index: number) => {
      if (interactive && onDataPointClick) {
        onDataPointClick(data, index)
      }
      setActiveIndex(index)
    },
    [interactive, onDataPointClick]
  )

  // Zoom handlers
  const handleZoomIn = useCallback(() => {
    setZoomLevel((prev) => Math.min(prev + 0.2, 2))
  }, [])

  const handleZoomOut = useCallback(() => {
    setZoomLevel((prev) => Math.max(prev - 0.2, 0.5))
  }, [])

  // Export handler
  const handleExport = useCallback(
    (format: "png" | "svg" | "csv") => {
      if (onExport) {
        onExport(format)
      }
    },
    [onExport]
  )

  if (isLoading) {
    return (
      <div className={cn("flex items-center justify-center", className)} style={{ height }}>
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="text-sm text-muted-foreground">{tLoading('pleaseWait')}</span>
        </div>
      </div>
    )
  }

  if (!chartData || !Array.isArray(chartData) || chartData.length === 0) {
    return (
      <div
        className={cn("flex flex-col items-center justify-center text-muted-foreground", className)}
        style={{ height }}
      >
        <Activity className="h-12 w-12 mb-2 opacity-50" />
        <span className="text-sm">{t('noData')}</span>
        <span className="text-xs mt-1">{t('getStarted')}</span>
      </div>
    )
  }

  const commonAxisProps = {
    tick: { fill: "hsl(var(--muted-foreground))", fontSize: 11 },
    tickLine: { stroke: "hsl(var(--border))" },
    axisLine: { stroke: "hsl(var(--border))" },
  }

  const tooltipProps = showTooltip
    ? {
        content: <CustomTooltip formatter={formatter} showChange={showChange} />,
      }
    : undefined

  const legendProps = showLegend ? { content: <CustomLegend /> } : undefined

  const renderChart = () => {
    switch (type) {
      case "BAR":
      case "HORIZONTAL_BAR": {
        const isHorizontal = type === "HORIZONTAL_BAR" || horizontal
        // Check if we have multiple series (dataKeys provided and data has those keys)
        const hasMultipleSeries = dataKeys.length > 0 && chartData.some((d: any) => dataKeys.some(key => key in d))

        return (
          <BarChart
            data={chartData}
            layout={isHorizontal ? "vertical" : "horizontal"}
            margin={{ top: 20, right: 30, left: isHorizontal ? 100 : 20, bottom: 20 }}
          >
            {showGrid && <CartesianGrid strokeDasharray="3 3" className="stroke-muted/30" />}
            {isHorizontal ? (
              <>
                <XAxis type="number" {...commonAxisProps} />
                <YAxis dataKey={xAxisKey} type="category" {...commonAxisProps} width={90} />
              </>
            ) : (
              <>
                <XAxis dataKey={xAxisKey} {...commonAxisProps} />
                <YAxis {...commonAxisProps} />
              </>
            )}
            {showTooltip && <Tooltip {...tooltipProps} />}
            {showLegend && <Legend {...legendProps} />}
            {showBenchmark && benchmarkValue && (
              <ReferenceLine
                x={isHorizontal ? benchmarkValue : undefined}
                y={isHorizontal ? undefined : benchmarkValue}
                stroke="hsl(var(--destructive))"
                strokeDasharray="5 5"
                label={{ value: benchmarkLabel, position: "top", fill: "hsl(var(--destructive))" }}
              />
            )}
            {hasMultipleSeries ? (
              // Render multiple bars for multi-series data
              dataKeys.map((key, index) => (
                <Bar
                  key={key}
                  dataKey={key}
                  name={key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                  fill={chartColors[index % chartColors.length]}
                  radius={borderRadius}
                  animationDuration={animate ? animationDuration : 0}
                />
              ))
            ) : (
              // Render single bar for simple data
              <Bar
                dataKey={dataKey}
                fill={chartColors[0]}
                radius={borderRadius}
                animationDuration={animate ? animationDuration : 0}
                onClick={handleClick}
              >
                {chartData.map((_entry: any, index: number) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={chartColors[index % chartColors.length]}
                    opacity={activeIndex === null || activeIndex === index ? fillOpacity : 0.3}
                    cursor={interactive ? "pointer" : "default"}
                  />
                ))}
              </Bar>
            )}
            {showBrush && <Brush dataKey={xAxisKey} height={30} stroke={chartColors[0]} />}
          </BarChart>
        )
      }

      case "GROUPED_BAR":
      case "STACKED_BAR": {
        const keys = dataKeys.length > 0 ? dataKeys : ["genZ", "millennials", "genX", "boomers"]
        const keyLabels: Record<string, string> = {
          genZ: "Gen Z",
          millennials: "Millennials",
          genX: "Gen X",
          boomers: "Boomers",
        }

        return (
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" className="stroke-muted/30" />}
            <XAxis dataKey={xAxisKey} {...commonAxisProps} />
            <YAxis {...commonAxisProps} />
            {showTooltip && <Tooltip {...tooltipProps} />}
            {showLegend && <Legend {...legendProps} />}
            {keys.map((key, index) => (
              <Bar
                key={key}
                dataKey={key}
                name={keyLabels[key] || key}
                fill={chartColors[index % chartColors.length]}
                radius={type === "STACKED_BAR" ? 0 : borderRadius}
                stackId={type === "STACKED_BAR" ? "stack" : undefined}
                animationDuration={animate ? animationDuration : 0}
              />
            ))}
            {showBrush && <Brush dataKey={xAxisKey} height={30} stroke={chartColors[0]} />}
          </BarChart>
        )
      }

      case "LINE":
      case "MULTI_LINE": {
        // Use the configured xAxisKey or try to detect if data has 'date' or 'name' key
        const lineXAxisKey = chartData[0]?.date !== undefined ? "date" : xAxisKey
        // Check if we have multiple series
        const hasMultipleLineSeries = dataKeys.length > 0 && chartData.some((d: any) => dataKeys.some(key => key in d))

        return (
          <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" className="stroke-muted/30" />}
            <XAxis dataKey={lineXAxisKey} {...commonAxisProps} />
            <YAxis {...commonAxisProps} />
            {showTooltip && <Tooltip {...tooltipProps} />}
            {showLegend && <Legend {...legendProps} />}
            {hasMultipleLineSeries ? (
              // Render multiple lines for multi-series data
              dataKeys.map((key, index) => (
                <Line
                  key={key}
                  type="monotone"
                  dataKey={key}
                  name={key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                  stroke={chartColors[index % chartColors.length]}
                  strokeWidth={strokeWidth}
                  dot={{ fill: chartColors[index % chartColors.length], strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                  animationDuration={animate ? animationDuration : 0}
                />
              ))
            ) : (
              <>
                <Line
                  type="monotone"
                  dataKey={dataKey}
                  stroke={chartColors[0]}
                  strokeWidth={strokeWidth}
                  dot={{ fill: chartColors[0], strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                  animationDuration={animate ? animationDuration : 0}
                />
                {chartData.some((d: any) => d.projected) && (
                  <Line
                    type="monotone"
                    dataKey={dataKey}
                    stroke={chartColors[0]}
                    strokeWidth={strokeWidth}
                    strokeDasharray="5 5"
                    dot={false}
                    data={chartData.filter((d: any) => d.projected)}
                  />
                )}
              </>
            )}
            {showBrush && <Brush dataKey={lineXAxisKey} height={30} stroke={chartColors[0]} />}
          </LineChart>
        )
      }

      case "AREA":
      case "STACKED_AREA": {
        // Use the configured xAxisKey or try to detect if data has 'date' or 'name' key
        const areaXAxisKey = chartData[0]?.date !== undefined ? "date" : xAxisKey
        // Check if we have multiple series
        const hasMultipleAreaSeries = dataKeys.length > 0 && chartData.some((d: any) => dataKeys.some(key => key in d))

        return (
          <AreaChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
            <defs>
              {hasMultipleAreaSeries ? (
                dataKeys.map((key, index) => (
                  <linearGradient key={key} id={`colorGradient-${key}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={chartColors[index % chartColors.length]} stopOpacity={0.8} />
                    <stop offset="95%" stopColor={chartColors[index % chartColors.length]} stopOpacity={0.1} />
                  </linearGradient>
                ))
              ) : (
                <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={chartColors[0]} stopOpacity={0.8} />
                  <stop offset="95%" stopColor={chartColors[0]} stopOpacity={0.1} />
                </linearGradient>
              )}
            </defs>
            {showGrid && <CartesianGrid strokeDasharray="3 3" className="stroke-muted/30" />}
            <XAxis dataKey={areaXAxisKey} {...commonAxisProps} />
            <YAxis {...commonAxisProps} />
            {showTooltip && <Tooltip {...tooltipProps} />}
            {showLegend && <Legend {...legendProps} />}
            {hasMultipleAreaSeries ? (
              dataKeys.map((key, index) => (
                <Area
                  key={key}
                  type="monotone"
                  dataKey={key}
                  name={key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                  stroke={chartColors[index % chartColors.length]}
                  strokeWidth={strokeWidth}
                  fill={`url(#colorGradient-${key})`}
                  stackId={type === "STACKED_AREA" ? "stack" : undefined}
                  animationDuration={animate ? animationDuration : 0}
                />
              ))
            ) : (
              <Area
                type="monotone"
                dataKey={dataKey}
                stroke={chartColors[0]}
                strokeWidth={strokeWidth}
                fill="url(#colorGradient)"
                animationDuration={animate ? animationDuration : 0}
              />
            )}
            {showBrush && <Brush dataKey={areaXAxisKey} height={30} stroke={chartColors[0]} />}
          </AreaChart>
        )
      }

      case "PIE":
        return (
          <PieChart>
            {showTooltip && <Tooltip {...tooltipProps} />}
            {showLegend && <Legend {...legendProps} />}
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={true}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              outerRadius={outerRadius}
              fill={chartColors[0]}
              dataKey={dataKey}
              animationDuration={animate ? animationDuration : 0}
              onClick={handleClick}
            >
              {chartData.map((_, index: number) => (
                <Cell
                  key={`cell-${index}`}
                  fill={chartColors[index % chartColors.length]}
                  opacity={activeIndex === null || activeIndex === index ? fillOpacity : 0.3}
                  cursor={interactive ? "pointer" : "default"}
                />
              ))}
            </Pie>
          </PieChart>
        )

      case "DONUT":
        return (
          <PieChart>
            {showTooltip && <Tooltip {...tooltipProps} />}
            {showLegend && <Legend {...legendProps} />}
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              innerRadius={innerRadius}
              outerRadius={outerRadius}
              fill={chartColors[0]}
              dataKey={dataKey}
              animationDuration={animate ? animationDuration : 0}
              onClick={handleClick}
            >
              {chartData.map((_, index: number) => (
                <Cell
                  key={`cell-${index}`}
                  fill={chartColors[index % chartColors.length]}
                  opacity={activeIndex === null || activeIndex === index ? fillOpacity : 0.3}
                  cursor={interactive ? "pointer" : "default"}
                />
              ))}
            </Pie>
            {/* Center text */}
            <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle">
              <tspan x="50%" dy="-0.5em" className="fill-foreground text-2xl font-bold">
                {chartData.reduce((sum: number, d: any) => sum + d.value, 0)}%
              </tspan>
              <tspan x="50%" dy="1.5em" className="fill-muted-foreground text-xs">
                Total
              </tspan>
            </text>
          </PieChart>
        )

      case "RADAR":
        return (
          <RadarChart cx="50%" cy="50%" outerRadius="70%" data={chartData}>
            <PolarGrid stroke="hsl(var(--border))" />
            <PolarAngleAxis dataKey={xAxisKey} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} />
            {showTooltip && <Tooltip {...tooltipProps} />}
            {showLegend && <Legend {...legendProps} />}
            <Radar
              name="Current"
              dataKey={dataKey}
              stroke={chartColors[0]}
              fill={chartColors[0]}
              fillOpacity={fillOpacity * 0.6}
              animationDuration={animate ? animationDuration : 0}
            />
            {showBenchmark && (
              <Radar
                name="Benchmark"
                dataKey="benchmark"
                stroke={chartColors[2]}
                fill={chartColors[2]}
                fillOpacity={fillOpacity * 0.3}
                strokeDasharray="5 5"
              />
            )}
          </RadarChart>
        )

      case "SCATTER":
      case "BUBBLE":
        return (
          <ScatterChart margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" className="stroke-muted/30" />}
            <XAxis type="number" dataKey="x" name="x" {...commonAxisProps} />
            <YAxis type="number" dataKey="y" name="y" {...commonAxisProps} />
            {type === "BUBBLE" && <ZAxis type="number" dataKey="size" range={[100, 1000]} />}
            {showTooltip && <Tooltip {...tooltipProps} cursor={{ strokeDasharray: "3 3" }} />}
            {showLegend && <Legend {...legendProps} />}
            <Scatter
              name="Segments"
              data={chartData}
              fill={chartColors[0]}
              animationDuration={animate ? animationDuration : 0}
              onClick={handleClick}
            >
              {chartData.map((entry: any, index: number) => {
                const segmentColors: Record<string, string> = {
                  "High Engagers": chartColors[0],
                  "Medium Engagers": chartColors[1],
                  "Low Engagers": chartColors[2],
                }
                return (
                  <Cell
                    key={`cell-${index}`}
                    fill={segmentColors[entry.segment] || chartColors[index % chartColors.length]}
                    opacity={activeIndex === null || activeIndex === index ? fillOpacity : 0.3}
                    cursor={interactive ? "pointer" : "default"}
                  />
                )
              })}
            </Scatter>
          </ScatterChart>
        )

      case "FUNNEL":
        return (
          <FunnelChart>
            {showTooltip && <Tooltip {...tooltipProps} />}
            {showLegend && <Legend {...legendProps} />}
            <Funnel
              dataKey={dataKey}
              data={chartData}
              isAnimationActive={animate}
              animationDuration={animationDuration}
            >
              {chartData.map((_, index: number) => (
                <Cell
                  key={`cell-${index}`}
                  fill={chartColors[index % chartColors.length]}
                  opacity={activeIndex === null || activeIndex === index ? fillOpacity : 0.4}
                />
              ))}
              <LabelList
                position="right"
                fill="hsl(var(--foreground))"
                stroke="none"
                dataKey={xAxisKey}
                fontSize={12}
              />
              <LabelList
                position="center"
                fill="#fff"
                stroke="none"
                dataKey={dataKey}
                formatter={(value: number) => `${value}%`}
                fontSize={14}
                fontWeight="bold"
              />
            </Funnel>
          </FunnelChart>
        )

      case "TREEMAP":
        return (
          <Treemap
            data={chartData}
            dataKey={dataKey}
            aspectRatio={4 / 3}
            stroke="hsl(var(--background))"
            fill={chartColors[0]}
            animationDuration={animate ? animationDuration : 0}
          >
            {chartData.map((_: any, index: number) => (
              <Cell
                key={`cell-${index}`}
                fill={chartColors[index % chartColors.length]}
                opacity={activeIndex === null || activeIndex === index ? fillOpacity : 0.3}
              />
            ))}
          </Treemap>
        )

      case "COMBO":
        return (
          <ComposedChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" className="stroke-muted/30" />}
            <XAxis dataKey={xAxisKey} {...commonAxisProps} />
            <YAxis {...commonAxisProps} />
            {showTooltip && <Tooltip {...tooltipProps} />}
            {showLegend && <Legend {...legendProps} />}
            <Bar
              dataKey={dataKey}
              fill={chartColors[0]}
              radius={borderRadius}
              animationDuration={animate ? animationDuration : 0}
            />
            <Line
              type="monotone"
              dataKey="benchmark"
              stroke={chartColors[1]}
              strokeWidth={strokeWidth}
              dot={{ fill: chartColors[1] }}
            />
            {showBrush && <Brush dataKey={xAxisKey} height={30} stroke={chartColors[0]} />}
          </ComposedChart>
        )

      case "WATERFALL": {
        let cumulative = 0
        const waterfallData = chartData.map((item: any) => {
          const start = item.category === "base" || item.category === "total" ? 0 : cumulative
          const end = item.category === "total" ? item.value : cumulative + item.value
          cumulative = item.category === "base" ? item.value : cumulative + (item.category === "total" ? 0 : item.value)
          return {
            ...item,
            start,
            end,
            height: Math.abs(end - start),
          }
        })

        return (
          <BarChart data={waterfallData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" className="stroke-muted/30" />}
            <XAxis dataKey={xAxisKey} {...commonAxisProps} />
            <YAxis {...commonAxisProps} />
            {showTooltip && <Tooltip {...tooltipProps} />}
            <Bar dataKey="start" stackId="waterfall" fill="transparent" />
            <Bar
              dataKey="height"
              stackId="waterfall"
              animationDuration={animate ? animationDuration : 0}
            >
              {waterfallData.map((entry: any, index: number) => {
                let color = chartColors[0]
                if (entry.category === "positive") color = "#22c55e"
                else if (entry.category === "negative") color = "#ef4444"
                else if (entry.category === "total") color = chartColors[0]
                return <Cell key={`cell-${index}`} fill={color} />
              })}
              <LabelList
                dataKey="value"
                position="top"
                formatter={(value: number) => (value > 0 ? `+${value}` : value)}
                fill="hsl(var(--foreground))"
                fontSize={11}
              />
            </Bar>
          </BarChart>
        )
      }

      case "BULLET":
        return (
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 20, right: 30, left: 100, bottom: 20 }}
          >
            {showGrid && <CartesianGrid strokeDasharray="3 3" className="stroke-muted/30" horizontal={false} />}
            <XAxis type="number" domain={[0, 100]} {...commonAxisProps} />
            <YAxis dataKey={xAxisKey} type="category" {...commonAxisProps} width={90} />
            {showTooltip && <Tooltip {...tooltipProps} />}
            {/* Benchmark bar (background) */}
            <Bar dataKey="benchmark" fill="hsl(var(--muted))" barSize={40} animationDuration={animate ? animationDuration : 0} />
            {/* Actual value bar */}
            <Bar dataKey={dataKey} fill={chartColors[0]} barSize={20} animationDuration={animate ? animationDuration : 0}>
              {chartData.map((entry: any, index: number) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.value >= entry.benchmark ? "#22c55e" : chartColors[0]}
                />
              ))}
            </Bar>
          </BarChart>
        )

      case "COMPARISON_BAR":
        return (
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 20, right: 30, left: 120, bottom: 20 }}
          >
            {showGrid && <CartesianGrid strokeDasharray="3 3" className="stroke-muted/30" horizontal={false} />}
            <XAxis type="number" {...commonAxisProps} />
            <YAxis dataKey="metric" type="category" {...commonAxisProps} width={110} />
            {showTooltip && <Tooltip {...tooltipProps} />}
            {showLegend && <Legend {...legendProps} />}
            <Bar dataKey="previous" name="Previous" fill={chartColors[1]} barSize={12} animationDuration={animate ? animationDuration : 0} />
            <Bar dataKey="benchmark" name="Benchmark" fill="hsl(var(--muted))" barSize={12} animationDuration={animate ? animationDuration : 0} />
            <Bar dataKey="current" name="Current" fill={chartColors[0]} barSize={12} animationDuration={animate ? animationDuration : 0}>
              <LabelList
                dataKey="change"
                position="right"
                formatter={(value: number) => `${value > 0 ? "+" : ""}${value.toFixed(1)}%`}
                fill="hsl(var(--foreground))"
                fontSize={10}
              />
            </Bar>
          </BarChart>
        )

      case "METRIC": {
        const metricValue = chartData[0]?.value ?? 0
        const metricName = chartData[0]?.name ?? "Metric"
        const change = chartData[0]?.change
        const benchmark = chartData[0]?.benchmark

        return (
          <div className="flex flex-col items-center justify-center h-full p-6">
            <Activity className="h-10 w-10 text-primary mb-3" />
            <span className="text-5xl font-bold">{formatter ? formatters[formatter](metricValue) : metricValue}</span>
            <span className="text-sm text-muted-foreground mt-2">{metricName}</span>
            {change !== undefined && (
              <div
                className={cn(
                  "flex items-center gap-1 mt-2 text-sm",
                  change > 0 ? "text-green-500" : change < 0 ? "text-red-500" : "text-muted-foreground"
                )}
              >
                {change > 0 ? <TrendingUp className="w-4 h-4" /> : change < 0 ? <TrendingDown className="w-4 h-4" /> : <Minus className="w-4 h-4" />}
                <span>{change > 0 ? "+" : ""}{change}% vs. previous</span>
              </div>
            )}
            {benchmark !== undefined && (
              <span className="text-xs text-muted-foreground mt-1">
                Benchmark: {formatter ? formatters[formatter](benchmark) : benchmark}
              </span>
            )}
          </div>
        )
      }

      case "SPARKLINE":
        return (
          <AreaChart data={chartData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
            <defs>
              <linearGradient id="sparkGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={chartColors[0]} stopOpacity={0.3} />
                <stop offset="95%" stopColor={chartColors[0]} stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area
              type="monotone"
              dataKey={dataKey}
              stroke={chartColors[0]}
              strokeWidth={1.5}
              fill="url(#sparkGradient)"
              animationDuration={animate ? animationDuration : 0}
            />
          </AreaChart>
        )

      case "HEATMAP": {
        const keys = ["genZ", "millennials", "genX", "boomers"]
        const keyLabels: Record<string, string> = {
          genZ: "Gen Z",
          millennials: "Millennials",
          genX: "Gen X",
          boomers: "Boomers",
        }

        return (
          <div className="w-full overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr>
                  <th className="p-2 text-left font-medium text-muted-foreground"></th>
                  {keys.map((key) => (
                    <th key={key} className="p-2 text-center font-medium text-muted-foreground">
                      {keyLabels[key]}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {chartData.map((row: any, rowIndex: number) => (
                  <tr key={rowIndex}>
                    <td className="p-2 font-medium">{row.name}</td>
                    {keys.map((key) => {
                      const value = row[key]
                      const maxValue = 100
                      const intensity = value / maxValue
                      const bgColor = `rgba(99, 102, 241, ${0.1 + intensity * 0.8})`
                      return (
                        <td
                          key={key}
                          className="p-2 text-center transition-all hover:ring-2 hover:ring-primary cursor-pointer"
                          style={{ backgroundColor: bgColor }}
                          onClick={() => handleClick({ ...row, key, value }, rowIndex)}
                        >
                          <span className={intensity > 0.5 ? "text-white font-medium" : ""}>
                            {value}%
                          </span>
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      }

      default:
        return (
          <div className="flex items-center justify-center text-muted-foreground" style={{ height }}>
            Unsupported chart type: {type}
          </div>
        )
    }
  }

  const scaledHeight = height * zoomLevel

  return (
    <div ref={chartRef} className={cn("relative", className)}>
      {/* Toolbar */}
      {(showZoom || onExport) && (
        <div className="absolute top-0 right-0 z-10 flex items-center gap-1 p-1 bg-background/80 backdrop-blur-sm rounded-lg border shadow-sm">
          {showZoom && (
            <>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleZoomOut}>
                <ZoomOut className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleZoomIn}>
                <ZoomIn className="h-4 w-4" />
              </Button>
            </>
          )}
          {onExport && (
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleExport("png")}>
              <Download className="h-4 w-4" />
            </Button>
          )}
        </div>
      )}

      {/* Chart */}
      <div style={{ width: "100%", height: scaledHeight, transition: "height 0.3s ease" }}>
        {type === "HEATMAP" ? (
          renderChart()
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            {renderChart()}
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}

// Re-export for convenience
export { generateAdvancedSampleData, gwiColorPalettes, formatters }
export type { GWIChartTemplate }
