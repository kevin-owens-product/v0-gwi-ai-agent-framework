/**
 * GWI Advanced Sample Data Generator
 *
 * Provides realistic consumer insights data for charts
 * Based on typical GWI audience research patterns
 */

export interface GWIDataPoint {
  name: string
  value: number
  previousValue?: number
  change?: number
  category?: string
  segment?: string
  benchmark?: number
  confidence?: number
  sampleSize?: number
}

export interface GWITimeSeriesPoint {
  date: string
  value: number
  projected?: boolean
  annotation?: string
}

export interface GWIComparisonData {
  metric: string
  current: number
  previous: number
  benchmark: number
  change: number
}

// Demographics data for various chart types
export const demographicsData: GWIDataPoint[] = [
  { name: "Gen Z (18-24)", value: 23, previousValue: 19, change: 21, category: "age", benchmark: 18 },
  { name: "Millennials (25-34)", value: 31, previousValue: 28, change: 11, category: "age", benchmark: 27 },
  { name: "Gen X (35-44)", value: 22, previousValue: 24, change: -8, category: "age", benchmark: 24 },
  { name: "Boomers (45-54)", value: 15, previousValue: 17, change: -12, category: "age", benchmark: 19 },
  { name: "Seniors (55+)", value: 9, previousValue: 12, change: -25, category: "age", benchmark: 12 },
]

// Social media platform usage
export const socialMediaData: GWIDataPoint[] = [
  { name: "Instagram", value: 78, previousValue: 72, benchmark: 65, sampleSize: 12500 },
  { name: "TikTok", value: 67, previousValue: 54, benchmark: 48, sampleSize: 12500 },
  { name: "YouTube", value: 89, previousValue: 86, benchmark: 82, sampleSize: 12500 },
  { name: "Facebook", value: 62, previousValue: 68, benchmark: 71, sampleSize: 12500 },
  { name: "Twitter/X", value: 34, previousValue: 38, benchmark: 35, sampleSize: 12500 },
  { name: "LinkedIn", value: 28, previousValue: 25, benchmark: 22, sampleSize: 12500 },
  { name: "Snapchat", value: 45, previousValue: 42, benchmark: 38, sampleSize: 12500 },
  { name: "Pinterest", value: 31, previousValue: 29, benchmark: 27, sampleSize: 12500 },
]

// Brand health metrics
export const brandHealthData: GWIDataPoint[] = [
  { name: "Brand Awareness", value: 72, benchmark: 65, segment: "Target Audience" },
  { name: "Brand Consideration", value: 48, benchmark: 42, segment: "Target Audience" },
  { name: "Brand Preference", value: 31, benchmark: 28, segment: "Target Audience" },
  { name: "Purchase Intent", value: 24, benchmark: 19, segment: "Target Audience" },
  { name: "Brand Loyalty", value: 67, benchmark: 58, segment: "Existing Customers" },
  { name: "Net Promoter", value: 42, benchmark: 35, segment: "Existing Customers" },
]

// Media consumption time series
export const mediaConsumptionTimeSeries: GWITimeSeriesPoint[] = [
  { date: "Jan", value: 4.2 },
  { date: "Feb", value: 4.5 },
  { date: "Mar", value: 4.8 },
  { date: "Apr", value: 5.1 },
  { date: "May", value: 5.4 },
  { date: "Jun", value: 5.2 },
  { date: "Jul", value: 5.6 },
  { date: "Aug", value: 5.8, annotation: "Peak engagement" },
  { date: "Sep", value: 5.5 },
  { date: "Oct", value: 5.3 },
  { date: "Nov", value: 5.7 },
  { date: "Dec", value: 6.1 },
  { date: "Jan (proj)", value: 6.3, projected: true },
  { date: "Feb (proj)", value: 6.5, projected: true },
]

// Purchase drivers (radar chart data)
export const purchaseDriversData: GWIDataPoint[] = [
  { name: "Price", value: 85, benchmark: 78 },
  { name: "Quality", value: 92, benchmark: 85 },
  { name: "Brand Trust", value: 78, benchmark: 72 },
  { name: "Sustainability", value: 65, benchmark: 52 },
  { name: "Convenience", value: 88, benchmark: 81 },
  { name: "Reviews", value: 72, benchmark: 68 },
  { name: "Innovation", value: 58, benchmark: 45 },
  { name: "Social Proof", value: 62, benchmark: 55 },
]

// Market share pie/donut data
export const marketShareData: GWIDataPoint[] = [
  { name: "Brand A", value: 32, previousValue: 28, category: "leader" },
  { name: "Brand B", value: 24, previousValue: 26, category: "challenger" },
  { name: "Brand C", value: 18, previousValue: 17, category: "challenger" },
  { name: "Brand D", value: 12, previousValue: 14, category: "follower" },
  { name: "Others", value: 14, previousValue: 15, category: "others" },
]

// Funnel data for conversion analysis
export const conversionFunnelData: GWIDataPoint[] = [
  { name: "Awareness", value: 100, segment: "top" },
  { name: "Interest", value: 72, segment: "top" },
  { name: "Consideration", value: 48, segment: "middle" },
  { name: "Intent", value: 32, segment: "middle" },
  { name: "Evaluation", value: 24, segment: "bottom" },
  { name: "Purchase", value: 18, segment: "bottom" },
  { name: "Loyalty", value: 12, segment: "post" },
  { name: "Advocacy", value: 8, segment: "post" },
]

// Content preference treemap
export const contentPreferenceData: GWIDataPoint[] = [
  { name: "Short Videos", value: 28, category: "Video" },
  { name: "Long-form Video", value: 18, category: "Video" },
  { name: "Live Streams", value: 12, category: "Video" },
  { name: "Articles", value: 15, category: "Written" },
  { name: "Blogs", value: 8, category: "Written" },
  { name: "Podcasts", value: 11, category: "Audio" },
  { name: "Music", value: 22, category: "Audio" },
  { name: "Social Posts", value: 16, category: "Social" },
]

// Multi-series comparison data
export const generationComparisonData = [
  { name: "Social Media", genZ: 92, millennials: 85, genX: 68, boomers: 45 },
  { name: "Streaming", genZ: 88, millennials: 82, genX: 72, boomers: 52 },
  { name: "E-commerce", genZ: 78, millennials: 84, genX: 76, boomers: 58 },
  { name: "Mobile Banking", genZ: 72, millennials: 78, genX: 62, boomers: 38 },
  { name: "Smart Home", genZ: 45, millennials: 52, genX: 48, boomers: 32 },
  { name: "VR/AR", genZ: 38, millennials: 28, genX: 15, boomers: 8 },
]

// Scatter plot data for correlation analysis
export const correlationData = [
  { x: 25, y: 82, segment: "High Engagers", size: 1200, name: "Segment A" },
  { x: 35, y: 75, segment: "High Engagers", size: 2400, name: "Segment B" },
  { x: 45, y: 68, segment: "Medium Engagers", size: 3200, name: "Segment C" },
  { x: 28, y: 72, segment: "High Engagers", size: 1800, name: "Segment D" },
  { x: 52, y: 55, segment: "Medium Engagers", size: 2800, name: "Segment E" },
  { x: 38, y: 48, segment: "Low Engagers", size: 1500, name: "Segment F" },
  { x: 62, y: 42, segment: "Low Engagers", size: 2100, name: "Segment G" },
  { x: 55, y: 62, segment: "Medium Engagers", size: 2600, name: "Segment H" },
]

// Waterfall chart data for attribution
export const attributionData: GWIDataPoint[] = [
  { name: "Base Awareness", value: 45, category: "base" },
  { name: "TV Advertising", value: 12, category: "positive" },
  { name: "Digital Ads", value: 8, category: "positive" },
  { name: "Social Media", value: 15, category: "positive" },
  { name: "Influencers", value: 6, category: "positive" },
  { name: "PR Coverage", value: 4, category: "positive" },
  { name: "Seasonality", value: -5, category: "negative" },
  { name: "Final Awareness", value: 85, category: "total" },
]

// Benchmark comparison
export const benchmarkComparisonData: GWIComparisonData[] = [
  { metric: "Brand Awareness", current: 72, previous: 65, benchmark: 68, change: 10.8 },
  { metric: "Ad Recall", current: 48, previous: 42, benchmark: 45, change: 14.3 },
  { metric: "Purchase Intent", current: 31, previous: 28, benchmark: 25, change: 10.7 },
  { metric: "Brand Favorability", current: 58, previous: 52, benchmark: 55, change: 11.5 },
  { metric: "Recommendation", current: 42, previous: 38, benchmark: 40, change: 10.5 },
]

// Regional data for geo charts
export const regionalData: GWIDataPoint[] = [
  { name: "North America", value: 78, benchmark: 72, sampleSize: 5200 },
  { name: "Europe", value: 72, benchmark: 68, sampleSize: 8400 },
  { name: "Asia Pacific", value: 85, benchmark: 75, sampleSize: 12600 },
  { name: "Latin America", value: 68, benchmark: 62, sampleSize: 3200 },
  { name: "Middle East", value: 62, benchmark: 58, sampleSize: 2100 },
  { name: "Africa", value: 55, benchmark: 48, sampleSize: 1800 },
]

// Chart type to data mapping
export type GWIChartTemplate =
  | "social-platform-reach"
  | "generation-comparison"
  | "brand-health-tracker"
  | "media-consumption-trend"
  | "purchase-drivers"
  | "market-share"
  | "conversion-funnel"
  | "content-preference"
  | "regional-breakdown"
  | "benchmark-comparison"
  | "audience-correlation"
  | "attribution-waterfall"

export interface GWIChartConfig {
  title: string
  description: string
  chartType: string
  data: any[]
  config?: Record<string, any>
}

export const gwiChartTemplates: Record<GWIChartTemplate, GWIChartConfig> = {
  "social-platform-reach": {
    title: "Social Media Platform Penetration",
    description: "Monthly active usage among target audience (18-45)",
    chartType: "BAR",
    data: socialMediaData,
    config: { showBenchmark: true, sortBy: "value", direction: "desc" },
  },
  "generation-comparison": {
    title: "Digital Behavior by Generation",
    description: "Technology adoption rates across age groups",
    chartType: "GROUPED_BAR",
    data: generationComparisonData,
    config: { showLegend: true, stacked: false },
  },
  "brand-health-tracker": {
    title: "Brand Health Metrics",
    description: "Key brand KPIs vs. industry benchmark",
    chartType: "BULLET",
    data: brandHealthData,
    config: { showBenchmark: true, showTarget: true },
  },
  "media-consumption-trend": {
    title: "Daily Media Consumption Hours",
    description: "Average hours per day across all platforms",
    chartType: "AREA",
    data: mediaConsumptionTimeSeries,
    config: { showProjection: true, showAnnotations: true },
  },
  "purchase-drivers": {
    title: "Purchase Decision Drivers",
    description: "Importance factors for target audience",
    chartType: "RADAR",
    data: purchaseDriversData,
    config: { showBenchmark: true, fillOpacity: 0.3 },
  },
  "market-share": {
    title: "Market Share Distribution",
    description: "Category share by brand",
    chartType: "DONUT",
    data: marketShareData,
    config: { showChange: true, innerRadius: 60 },
  },
  "conversion-funnel": {
    title: "Customer Journey Funnel",
    description: "Conversion rates through purchase journey",
    chartType: "FUNNEL",
    data: conversionFunnelData,
    config: { showPercentage: true, showDropoff: true },
  },
  "content-preference": {
    title: "Content Format Preference",
    description: "Share of time spent by content type",
    chartType: "TREEMAP",
    data: contentPreferenceData,
    config: { groupBy: "category", showLabels: true },
  },
  "regional-breakdown": {
    title: "Regional Performance",
    description: "Key metric by geographic region",
    chartType: "BAR",
    data: regionalData,
    config: { horizontal: true, showBenchmark: true },
  },
  "benchmark-comparison": {
    title: "Performance vs. Benchmark",
    description: "Current period vs. previous and industry average",
    chartType: "COMPARISON_BAR",
    data: benchmarkComparisonData,
    config: { showChange: true, highlightAboveBenchmark: true },
  },
  "audience-correlation": {
    title: "Audience Segment Analysis",
    description: "Engagement vs. spending correlation by segment",
    chartType: "SCATTER",
    data: correlationData,
    config: { showTrendline: true, bubbleSize: "size" },
  },
  "attribution-waterfall": {
    title: "Awareness Attribution",
    description: "Contribution by marketing channel",
    chartType: "WATERFALL",
    data: attributionData,
    config: { showTotal: true, colorByCategory: true },
  },
}

/**
 * Generate deterministic sample data based on chart type and seed
 */
export function generateAdvancedSampleData(
  chartType: string,
  template?: GWIChartTemplate,
  seed?: string
): any[] {
  // If template is specified, return template data
  if (template && gwiChartTemplates[template]) {
    return gwiChartTemplates[template].data
  }

  // Generate deterministic hash from seed
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

  // Return appropriate sample data based on chart type
  switch (chartType.toUpperCase()) {
    case "BAR":
    case "HORIZONTAL_BAR":
      return socialMediaData.map((d, i) => ({
        ...d,
        value: Math.max(10, Math.min(95, d.value + ((seedOffset + i) % 20) - 10)),
      }))

    case "LINE":
    case "AREA":
      return mediaConsumptionTimeSeries.map((d, i) => ({
        ...d,
        value: Math.max(2, Math.min(8, d.value + ((seedOffset + i) % 10) / 10 - 0.5)),
      }))

    case "PIE":
    case "DONUT":
      return marketShareData.map((d, i) => ({
        ...d,
        value: Math.max(5, Math.min(40, d.value + ((seedOffset + i) % 10) - 5)),
      }))

    case "RADAR":
      return purchaseDriversData.map((d, i) => ({
        ...d,
        value: Math.max(40, Math.min(95, d.value + ((seedOffset + i) % 15) - 7)),
      }))

    case "FUNNEL":
      return conversionFunnelData

    case "TREEMAP":
      return contentPreferenceData

    case "SCATTER":
      return correlationData.map((d, i) => ({
        ...d,
        x: Math.max(20, Math.min(70, d.x + ((seedOffset + i) % 10) - 5)),
        y: Math.max(30, Math.min(90, d.y + ((seedOffset + i) % 15) - 7)),
      }))

    case "HEATMAP":
      return generationComparisonData

    case "GROUPED_BAR":
    case "STACKED_BAR":
      return generationComparisonData

    case "WATERFALL":
      return attributionData

    case "BULLET":
      return brandHealthData

    default:
      return demographicsData.map((d, i) => ({
        ...d,
        value: Math.max(5, Math.min(40, d.value + ((seedOffset + i) % 10) - 5)),
      }))
  }
}

// =============================================================================
// ADVANCED CHART DATA SETS
// =============================================================================

// Multi-year trend data for time-series analysis
export const multiYearTrendData = [
  { year: "2020", socialMedia: 62, streaming: 58, ecommerce: 52, mobileBank: 45 },
  { year: "2021", socialMedia: 68, streaming: 72, ecommerce: 68, mobileBank: 55 },
  { year: "2022", socialMedia: 72, streaming: 78, ecommerce: 75, mobileBank: 62 },
  { year: "2023", socialMedia: 75, streaming: 82, ecommerce: 82, mobileBank: 72 },
  { year: "2024", socialMedia: 78, streaming: 85, ecommerce: 88, mobileBank: 78 },
  { year: "2025 (proj)", socialMedia: 82, streaming: 88, ecommerce: 92, mobileBank: 85, projected: true },
]

// Detailed platform comparison across metrics
export const platformComparisonMatrix: GWIDataPoint[] = [
  { name: "Instagram", value: 78, category: "Reach", segment: "18-34" },
  { name: "Instagram", value: 65, category: "Engagement", segment: "18-34" },
  { name: "Instagram", value: 42, category: "Purchase Intent", segment: "18-34" },
  { name: "TikTok", value: 72, category: "Reach", segment: "18-34" },
  { name: "TikTok", value: 82, category: "Engagement", segment: "18-34" },
  { name: "TikTok", value: 38, category: "Purchase Intent", segment: "18-34" },
  { name: "YouTube", value: 88, category: "Reach", segment: "18-34" },
  { name: "YouTube", value: 58, category: "Engagement", segment: "18-34" },
  { name: "YouTube", value: 35, category: "Purchase Intent", segment: "18-34" },
  { name: "Facebook", value: 52, category: "Reach", segment: "18-34" },
  { name: "Facebook", value: 35, category: "Engagement", segment: "18-34" },
  { name: "Facebook", value: 28, category: "Purchase Intent", segment: "18-34" },
]

// Category-level breakdown for treemap
export const categoryBreakdownData = [
  { name: "Social Media", value: 35, category: "Digital", children: [
    { name: "Instagram", value: 12 },
    { name: "TikTok", value: 10 },
    { name: "YouTube", value: 8 },
    { name: "Other", value: 5 },
  ]},
  { name: "Streaming", value: 28, category: "Entertainment", children: [
    { name: "Netflix", value: 10 },
    { name: "YouTube TV", value: 8 },
    { name: "Disney+", value: 6 },
    { name: "Other", value: 4 },
  ]},
  { name: "E-commerce", value: 22, category: "Shopping", children: [
    { name: "Amazon", value: 12 },
    { name: "Social Commerce", value: 5 },
    { name: "DTC Brands", value: 5 },
  ]},
  { name: "Gaming", value: 15, category: "Entertainment", children: [
    { name: "Mobile", value: 8 },
    { name: "Console", value: 5 },
    { name: "PC", value: 2 },
  ]},
]

// Comprehensive audience segment data
export const audienceSegmentData = [
  { segment: "Gen Z Digital Natives", awareness: 82, consideration: 65, purchase: 48, loyalty: 72, nps: 45 },
  { segment: "Millennial Parents", awareness: 75, consideration: 72, purchase: 58, loyalty: 78, nps: 52 },
  { segment: "Gen X Professionals", awareness: 68, consideration: 58, purchase: 52, loyalty: 82, nps: 48 },
  { segment: "Boomer Traditionalists", awareness: 55, consideration: 42, purchase: 38, loyalty: 88, nps: 42 },
  { segment: "Eco-Conscious Shoppers", awareness: 72, consideration: 68, purchase: 55, loyalty: 75, nps: 58 },
  { segment: "Tech Early Adopters", awareness: 88, consideration: 78, purchase: 62, loyalty: 68, nps: 62 },
  { segment: "Budget-Conscious", awareness: 62, consideration: 55, purchase: 72, loyalty: 58, nps: 35 },
  { segment: "Luxury Seekers", awareness: 78, consideration: 62, purchase: 45, loyalty: 85, nps: 55 },
]

// Day-part analysis data
export const daypartAnalysisData = [
  { time: "6-9 AM", social: 35, streaming: 22, news: 48, shopping: 12 },
  { time: "9-12 PM", social: 42, streaming: 18, news: 35, shopping: 28 },
  { time: "12-3 PM", social: 55, streaming: 25, news: 28, shopping: 35 },
  { time: "3-6 PM", social: 62, streaming: 32, news: 22, shopping: 42 },
  { time: "6-9 PM", social: 72, streaming: 65, news: 38, shopping: 48 },
  { time: "9-12 AM", social: 58, streaming: 78, news: 25, shopping: 28 },
]

// Cross-platform journey data
export const customerJourneyData = [
  { stage: "Discovery", social: 45, search: 35, display: 12, referral: 8 },
  { stage: "Research", social: 28, search: 52, display: 8, referral: 12 },
  { stage: "Consideration", social: 22, search: 38, display: 15, referral: 25 },
  { stage: "Purchase", social: 18, search: 28, display: 22, referral: 32 },
  { stage: "Advocacy", social: 55, search: 12, display: 8, referral: 25 },
]

// Export color palettes
export const gwiColorPalettes = {
  default: ["#6366f1", "#8b5cf6", "#a855f7", "#d946ef", "#ec4899", "#f43f5e"],
  ocean: ["#0ea5e9", "#06b6d4", "#14b8a6", "#10b981", "#22c55e", "#84cc16"],
  sunset: ["#f97316", "#f59e0b", "#eab308", "#ef4444", "#dc2626", "#b91c1c"],
  forest: ["#22c55e", "#16a34a", "#15803d", "#166534", "#14532d", "#064e3b"],
  professional: ["#1e40af", "#3b82f6", "#60a5fa", "#93c5fd", "#bfdbfe", "#dbeafe"],
  gwiBrand: ["#4F46E5", "#7C3AED", "#EC4899", "#F59E0B", "#10B981", "#3B82F6"],
  comparison: ["#6366f1", "#94a3b8", "#22c55e"],
  sentiment: ["#22c55e", "#f59e0b", "#ef4444"],
  generational: ["#6366f1", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981"],
}

// Export formatting utilities
export const formatters = {
  percentage: (value: number) => `${value}%`,
  decimal: (value: number) => value.toFixed(1),
  compact: (value: number) => {
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`
    if (value >= 1000) return `${(value / 1000).toFixed(1)}K`
    return value.toString()
  },
  currency: (value: number) => `$${value.toLocaleString()}`,
  change: (value: number) => (value >= 0 ? `+${value}%` : `${value}%`),
}
