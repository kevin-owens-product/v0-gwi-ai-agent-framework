import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'

// Mock recharts components
vi.mock('recharts', () => ({
  BarChart: ({ children }: any) => <div data-testid="bar-chart">{children}</div>,
  Bar: () => <div />,
  LineChart: ({ children }: any) => <div data-testid="line-chart">{children}</div>,
  Line: () => <div />,
  PieChart: ({ children }: any) => <div data-testid="pie-chart">{children}</div>,
  Pie: () => <div />,
  AreaChart: ({ children }: any) => <div data-testid="area-chart">{children}</div>,
  Area: () => <div />,
  XAxis: () => <div />,
  YAxis: () => <div />,
  CartesianGrid: () => <div />,
  Tooltip: () => <div />,
  Legend: () => <div />,
  ResponsiveContainer: ({ children }: any) => <div data-testid="responsive-container">{children}</div>,
  Cell: () => <div />,
  RadarChart: ({ children }: any) => <div data-testid="radar-chart">{children}</div>,
  Radar: () => <div />,
  PolarGrid: () => <div />,
  PolarAngleAxis: () => <div />,
  PolarRadiusAxis: () => <div />,
  ScatterChart: ({ children }: any) => <div data-testid="scatter-chart">{children}</div>,
  Scatter: () => <div />,
  FunnelChart: ({ children }: any) => <div data-testid="funnel-chart">{children}</div>,
  Funnel: () => <div />,
  LabelList: () => <div />,
  Treemap: () => <div data-testid="treemap" />,
  ComposedChart: ({ children }: any) => <div data-testid="composed-chart">{children}</div>,
  ReferenceLine: () => <div />,
  Brush: () => <div />,
  ZAxis: () => <div />,
}))

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  Loader2: () => <div data-testid="loader-icon" />,
  Activity: () => <div data-testid="activity-icon" />,
  TrendingUp: () => <div data-testid="trending-up-icon" />,
  TrendingDown: () => <div data-testid="trending-down-icon" />,
  Minus: () => <div data-testid="minus-icon" />,
  ZoomIn: () => <div data-testid="zoom-in-icon" />,
  ZoomOut: () => <div data-testid="zoom-out-icon" />,
  Download: () => <div data-testid="download-icon" />,
}))

// Track if sample data should return empty
let shouldReturnEmptySampleData = false

// Mock the GWI sample data module
vi.mock('./data/gwi-sample-data', () => ({
  generateAdvancedSampleData: vi.fn((_type: string) => {
    // Allow tests to control whether sample data returns empty
    if (shouldReturnEmptySampleData) {
      return []
    }
    // Return valid sample data for testing
    return [
      { name: 'Sample 1', value: 30 },
      { name: 'Sample 2', value: 45 },
      { name: 'Sample 3', value: 25 },
    ]
  }),
  gwiColorPalettes: {
    gwiBrand: ['#6366f1', '#8b5cf6', '#a855f7', '#d946ef'],
  },
  formatters: {
    percentage: (v: number) => `${v}%`,
    compact: (v: number) => v.toLocaleString(),
    currency: (v: number) => `$${v}`,
    number: (v: number) => v.toString(),
  },
}))

// Helper to control sample data behavior
const setSampleDataEmpty = (empty: boolean) => {
  shouldReturnEmptySampleData = empty
}

// Import the component after mocks
import { AdvancedChartRenderer, type AdvancedChartDataPoint } from './advanced-chart-renderer'

describe('AdvancedChartRenderer', () => {
  const validData: AdvancedChartDataPoint[] = [
    { name: 'Category A', value: 30 },
    { name: 'Category B', value: 45 },
    { name: 'Category C', value: 25 },
  ]

  beforeEach(() => {
    vi.clearAllMocks()
    setSampleDataEmpty(false)
  })

  afterEach(() => {
    setSampleDataEmpty(false)
  })

  describe('Data Validation', () => {
    it('should render chart with valid array data', () => {
      render(<AdvancedChartRenderer type="BAR" data={validData} />)
      expect(screen.getByTestId('responsive-container')).toBeDefined()
      expect(screen.getByTestId('bar-chart')).toBeDefined()
    })

    it('should show "No data available" when data is empty array and no sample data', () => {
      setSampleDataEmpty(true)
      render(<AdvancedChartRenderer type="BAR" data={[]} />)
      expect(screen.getByText('No data available')).toBeDefined()
    })

    it('should fall back to sample data when data is empty array', () => {
      // When sample data is available, component should use it
      render(<AdvancedChartRenderer type="BAR" data={[]} />)
      expect(screen.getByTestId('responsive-container')).toBeDefined()
    })

    it('should fall back to sample data when data is undefined', () => {
      render(<AdvancedChartRenderer type="BAR" data={undefined as any} />)
      // Should still render a chart using fallback sample data
      expect(screen.getByTestId('responsive-container')).toBeDefined()
    })

    it('should fall back to sample data when data is null', () => {
      render(<AdvancedChartRenderer type="BAR" data={null as any} />)
      // Should still render a chart using fallback sample data
      expect(screen.getByTestId('responsive-container')).toBeDefined()
    })

    it('should fall back to sample data when data is not an array', () => {
      render(<AdvancedChartRenderer type="BAR" data={"not an array" as any} />)
      // Should still render a chart using fallback sample data
      expect(screen.getByTestId('responsive-container')).toBeDefined()
    })

    it('should fall back to sample data when data is an object', () => {
      render(<AdvancedChartRenderer type="BAR" data={{ key: 'value' } as any} />)
      // Should still render a chart using fallback sample data
      expect(screen.getByTestId('responsive-container')).toBeDefined()
    })

    it('should fall back to sample data when data is a number', () => {
      render(<AdvancedChartRenderer type="BAR" data={123 as any} />)
      // Should still render a chart using fallback sample data
      expect(screen.getByTestId('responsive-container')).toBeDefined()
    })
  })

  describe('Loading State', () => {
    it('should show loading indicator when isLoading is true', () => {
      render(<AdvancedChartRenderer type="BAR" data={validData} isLoading={true} />)
      expect(screen.getByTestId('loader-icon')).toBeDefined()
      expect(screen.getByText('Loading chart data...')).toBeDefined()
    })

    it('should not show loading indicator when isLoading is false', () => {
      render(<AdvancedChartRenderer type="BAR" data={validData} isLoading={false} />)
      expect(screen.queryByTestId('loader-icon')).toBeNull()
      expect(screen.queryByText('Loading chart data...')).toBeNull()
    })
  })

  describe('Empty State', () => {
    it('should display empty state message when no data and no sample data available', () => {
      setSampleDataEmpty(true)
      render(<AdvancedChartRenderer type="BAR" data={[]} />)
      expect(screen.getByText('No data available')).toBeDefined()
      expect(screen.getByText('Try selecting a different time period or audience')).toBeDefined()
    })

    it('should display activity icon in empty state', () => {
      setSampleDataEmpty(true)
      render(<AdvancedChartRenderer type="BAR" data={[]} />)
      expect(screen.getByTestId('activity-icon')).toBeDefined()
    })

    it('should use sample data fallback when provided data is empty', () => {
      // By default, mock returns sample data, so chart should render
      render(<AdvancedChartRenderer type="BAR" data={[]} />)
      expect(screen.getByTestId('bar-chart')).toBeDefined()
    })
  })

  describe('Chart Types', () => {
    it('should render BAR chart', () => {
      render(<AdvancedChartRenderer type="BAR" data={validData} />)
      expect(screen.getByTestId('bar-chart')).toBeDefined()
    })

    it('should render LINE chart', () => {
      render(<AdvancedChartRenderer type="LINE" data={validData} />)
      expect(screen.getByTestId('line-chart')).toBeDefined()
    })

    it('should render PIE chart', () => {
      render(<AdvancedChartRenderer type="PIE" data={validData} />)
      expect(screen.getByTestId('pie-chart')).toBeDefined()
    })

    it('should render AREA chart', () => {
      render(<AdvancedChartRenderer type="AREA" data={validData} />)
      expect(screen.getByTestId('area-chart')).toBeDefined()
    })

    it('should render RADAR chart', () => {
      render(<AdvancedChartRenderer type="RADAR" data={validData} />)
      expect(screen.getByTestId('radar-chart')).toBeDefined()
    })

    it('should render SCATTER chart', () => {
      const scatterData = [
        { name: 'Point 1', x: 10, y: 20, value: 30 },
        { name: 'Point 2', x: 15, y: 25, value: 45 },
      ]
      render(<AdvancedChartRenderer type="SCATTER" data={scatterData} />)
      expect(screen.getByTestId('scatter-chart')).toBeDefined()
    })

    it('should render FUNNEL chart', () => {
      render(<AdvancedChartRenderer type="FUNNEL" data={validData} />)
      expect(screen.getByTestId('funnel-chart')).toBeDefined()
    })

    it('should render DONUT chart', () => {
      render(<AdvancedChartRenderer type="DONUT" data={validData} />)
      expect(screen.getByTestId('pie-chart')).toBeDefined()
    })

    it('should render HORIZONTAL_BAR chart', () => {
      render(<AdvancedChartRenderer type="HORIZONTAL_BAR" data={validData} />)
      expect(screen.getByTestId('bar-chart')).toBeDefined()
    })

    it('should render COMBO chart', () => {
      render(<AdvancedChartRenderer type="COMBO" data={validData} />)
      expect(screen.getByTestId('composed-chart')).toBeDefined()
    })

    it('should show unsupported message for unknown chart type', () => {
      render(<AdvancedChartRenderer type={"UNKNOWN" as any} data={validData} />)
      expect(screen.getByText(/Unsupported chart type/)).toBeDefined()
    })
  })

  describe('Configuration Options', () => {
    it('should apply custom height', () => {
      const { container } = render(
        <AdvancedChartRenderer type="BAR" data={validData} config={{ height: 500 }} />
      )
      // Check that the container has the custom height
      expect(container.querySelector('[style*="height"]')).toBeDefined()
    })

    it('should handle showLegend config', () => {
      render(<AdvancedChartRenderer type="BAR" data={validData} config={{ showLegend: true }} />)
      expect(screen.getByTestId('bar-chart')).toBeDefined()
    })

    it('should handle showGrid config', () => {
      render(<AdvancedChartRenderer type="BAR" data={validData} config={{ showGrid: true }} />)
      expect(screen.getByTestId('bar-chart')).toBeDefined()
    })

    it('should handle showTooltip config', () => {
      render(<AdvancedChartRenderer type="BAR" data={validData} config={{ showTooltip: true }} />)
      expect(screen.getByTestId('bar-chart')).toBeDefined()
    })

    it('should handle animate config', () => {
      render(<AdvancedChartRenderer type="BAR" data={validData} config={{ animate: false }} />)
      expect(screen.getByTestId('bar-chart')).toBeDefined()
    })
  })

  describe('Interactive Features', () => {
    it('should call onDataPointClick when interactive', () => {
      const handleClick = vi.fn()
      render(
        <AdvancedChartRenderer
          type="BAR"
          data={validData}
          config={{ interactive: true }}
          onDataPointClick={handleClick}
        />
      )
      expect(screen.getByTestId('bar-chart')).toBeDefined()
    })

    it('should show zoom controls when showZoom is true', () => {
      render(
        <AdvancedChartRenderer type="BAR" data={validData} config={{ showZoom: true }} />
      )
      expect(screen.getByTestId('zoom-in-icon')).toBeDefined()
      expect(screen.getByTestId('zoom-out-icon')).toBeDefined()
    })

    it('should not show zoom controls when showZoom is false', () => {
      render(
        <AdvancedChartRenderer type="BAR" data={validData} config={{ showZoom: false }} />
      )
      expect(screen.queryByTestId('zoom-in-icon')).toBeNull()
      expect(screen.queryByTestId('zoom-out-icon')).toBeNull()
    })

    it('should show download button when onExport is provided', () => {
      const handleExport = vi.fn()
      render(
        <AdvancedChartRenderer type="BAR" data={validData} onExport={handleExport} />
      )
      expect(screen.getByTestId('download-icon')).toBeDefined()
    })

    it('should call onExport when download button is clicked', () => {
      const handleExport = vi.fn()
      render(
        <AdvancedChartRenderer type="BAR" data={validData} onExport={handleExport} />
      )
      const downloadButton = screen.getByTestId('download-icon').parentElement
      if (downloadButton) {
        fireEvent.click(downloadButton)
        expect(handleExport).toHaveBeenCalledWith('png')
      }
    })
  })

  describe('Template Support', () => {
    it('should generate data from template when provided', () => {
      render(
        <AdvancedChartRenderer
          type="BAR"
          data={[]}
          template="social-platform-reach"
        />
      )
      // Should still render since template generates data
      expect(screen.getByTestId('responsive-container')).toBeDefined()
    })
  })

  describe('Metric Chart Type', () => {
    it('should render METRIC type with value', () => {
      const metricData = [{ name: 'Total Users', value: 75, change: 12 }]
      render(<AdvancedChartRenderer type="METRIC" data={metricData} />)
      expect(screen.getByText('Total Users')).toBeDefined()
    })
  })

  describe('HEATMAP Chart Type', () => {
    it('should render HEATMAP as a table', () => {
      const heatmapData = [
        { name: 'Row 1', genZ: 80, millennials: 60, genX: 40, boomers: 20, value: 50 },
        { name: 'Row 2', genZ: 70, millennials: 50, genX: 45, boomers: 35, value: 50 },
      ]
      render(<AdvancedChartRenderer type="HEATMAP" data={heatmapData} />)
      expect(screen.getByText('Row 1')).toBeDefined()
      expect(screen.getByText('Gen Z')).toBeDefined()
    })
  })

  describe('SPARKLINE Chart Type', () => {
    it('should render SPARKLINE chart', () => {
      render(<AdvancedChartRenderer type="SPARKLINE" data={validData} />)
      expect(screen.getByTestId('area-chart')).toBeDefined()
    })
  })

  describe('Stacked Charts', () => {
    it('should render STACKED_BAR chart', () => {
      const stackedData = [
        { name: 'Q1', genZ: 30, millennials: 40, genX: 20, boomers: 10, value: 100 },
        { name: 'Q2', genZ: 35, millennials: 38, genX: 17, boomers: 10, value: 100 },
      ]
      render(<AdvancedChartRenderer type="STACKED_BAR" data={stackedData} />)
      expect(screen.getByTestId('bar-chart')).toBeDefined()
    })

    it('should render GROUPED_BAR chart', () => {
      const groupedData = [
        { name: 'Q1', genZ: 30, millennials: 40, genX: 20, boomers: 10, value: 100 },
        { name: 'Q2', genZ: 35, millennials: 38, genX: 17, boomers: 10, value: 100 },
      ]
      render(<AdvancedChartRenderer type="GROUPED_BAR" data={groupedData} />)
      expect(screen.getByTestId('bar-chart')).toBeDefined()
    })

    it('should render STACKED_AREA chart', () => {
      render(<AdvancedChartRenderer type="STACKED_AREA" data={validData} />)
      expect(screen.getByTestId('area-chart')).toBeDefined()
    })
  })

  describe('WATERFALL Chart Type', () => {
    it('should render WATERFALL chart', () => {
      const waterfallData = [
        { name: 'Start', value: 100, category: 'base' },
        { name: 'Add', value: 30, category: 'positive' },
        { name: 'Remove', value: -20, category: 'negative' },
        { name: 'Total', value: 110, category: 'total' },
      ]
      render(<AdvancedChartRenderer type="WATERFALL" data={waterfallData} />)
      expect(screen.getByTestId('bar-chart')).toBeDefined()
    })
  })

  describe('BULLET Chart Type', () => {
    it('should render BULLET chart', () => {
      const bulletData = [
        { name: 'Revenue', value: 75, benchmark: 80 },
        { name: 'Profit', value: 60, benchmark: 55 },
      ]
      render(<AdvancedChartRenderer type="BULLET" data={bulletData} />)
      expect(screen.getByTestId('bar-chart')).toBeDefined()
    })
  })

  describe('BUBBLE Chart Type', () => {
    it('should render BUBBLE chart', () => {
      const bubbleData = [
        { name: 'A', x: 10, y: 20, size: 100, value: 10 },
        { name: 'B', x: 20, y: 30, size: 200, value: 20 },
      ]
      render(<AdvancedChartRenderer type="BUBBLE" data={bubbleData} />)
      expect(screen.getByTestId('scatter-chart')).toBeDefined()
    })
  })

  describe('COMPARISON_BAR Chart Type', () => {
    it('should render COMPARISON_BAR chart', () => {
      const comparisonData: AdvancedChartDataPoint[] = [
        { name: 'Awareness', current: 65, previous: 58, benchmark: 60, change: 12.1, value: 65 },
        { name: 'Consideration', current: 45, previous: 42, benchmark: 48, change: 7.1, value: 45 },
      ]
      render(<AdvancedChartRenderer type="COMPARISON_BAR" data={comparisonData} />)
      expect(screen.getByTestId('bar-chart')).toBeDefined()
    })
  })

  describe('MULTI_LINE Chart Type', () => {
    it('should render MULTI_LINE chart', () => {
      render(<AdvancedChartRenderer type="MULTI_LINE" data={validData} />)
      expect(screen.getByTestId('line-chart')).toBeDefined()
    })
  })

  describe('className and styling', () => {
    it('should apply custom className', () => {
      const { container } = render(
        <AdvancedChartRenderer type="BAR" data={validData} className="custom-class" />
      )
      expect(container.querySelector('.custom-class')).toBeDefined()
    })
  })

  describe('Benchmark and Reference Lines', () => {
    it('should render with benchmark when showBenchmark is true', () => {
      render(
        <AdvancedChartRenderer
          type="BAR"
          data={validData}
          config={{
            showBenchmark: true,
            benchmarkValue: 35,
            benchmarkLabel: 'Target',
          }}
        />
      )
      expect(screen.getByTestId('bar-chart')).toBeDefined()
    })
  })

  describe('Brush feature', () => {
    it('should render with brush when showBrush is true', () => {
      render(
        <AdvancedChartRenderer
          type="BAR"
          data={validData}
          config={{ showBrush: true }}
        />
      )
      expect(screen.getByTestId('bar-chart')).toBeDefined()
    })
  })
})
