// Core chart components
export { ChartRenderer, generateSampleData } from "./chart-renderer"
export type { ChartType, ChartDataPoint, ChartRendererProps } from "./chart-renderer"
export { InteractiveChartEditor } from "./interactive-chart-editor"

// Advanced chart components
export {
  AdvancedChartRenderer,
  generateAdvancedSampleData,
  gwiColorPalettes,
  formatters,
} from "./advanced-chart-renderer"
export type {
  AdvancedChartType,
  AdvancedChartDataPoint,
  AdvancedChartConfig,
  AdvancedChartRendererProps,
  GWIChartTemplate,
} from "./advanced-chart-renderer"

// Chart template gallery
export { ChartTemplateGallery } from "./chart-template-gallery"

// Comparison component
export { ChartComparison, comparisonScenarios } from "./chart-comparison"

// GWI sample data
export {
  demographicsData,
  socialMediaData,
  brandHealthData,
  mediaConsumptionTimeSeries,
  purchaseDriversData,
  marketShareData,
  conversionFunnelData,
  contentPreferenceData,
  generationComparisonData,
  correlationData,
  attributionData,
  benchmarkComparisonData,
  regionalData,
  gwiChartTemplates,
} from "./data/gwi-sample-data"
export type {
  GWIDataPoint,
  GWITimeSeriesPoint,
  GWIComparisonData,
  GWIChartConfig,
} from "./data/gwi-sample-data"
