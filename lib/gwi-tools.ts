/**
 * GWI Tools Definitions
 *
 * Defines all GWI data operation tools that agents can invoke.
 * These tools provide programmatic access to:
 * - Audience creation and management
 * - Data fetching and metrics
 * - Crosstab generation and analysis
 * - Chart and dashboard operations
 * - Brand tracking and insights
 */

import { prisma } from '@/lib/db'
import { Prisma } from '@prisma/client'
import type {
  GWITool,
  ToolExecutionContext,
  ToolResult,
  AudienceCriteria,
  ChartConfiguration,
  DashboardWidget,
  GeneratedInsight,
} from '@/types/tools'

// Helper to measure execution time
async function withTiming<T>(
  fn: () => Promise<T>
): Promise<{ result: T; executionTimeMs: number }> {
  const start = Date.now()
  const result = await fn()
  return { result, executionTimeMs: Date.now() - start }
}

// ==================== AUDIENCE TOOLS ====================

export const createAudienceTool: GWITool = {
  name: 'create_audience',
  description: 'Create a new audience segment based on demographic, behavioral, or psychographic criteria. Use this when you need to define a target audience for analysis or comparison.',
  category: 'audience',
  parameters: {
    type: 'object',
    properties: {
      name: {
        type: 'string',
        description: 'A descriptive name for the audience segment (e.g., "Tech-savvy Millennials in Urban Areas")',
      },
      description: {
        type: 'string',
        description: 'Detailed description of who this audience represents and why it was created',
      },
      criteria: {
        type: 'array',
        description: 'Filter criteria defining the audience',
        items: {
          type: 'object',
          properties: {
            dimension: {
              type: 'string',
              description: 'The dimension to filter on (e.g., age, income, interests, behaviors)',
            },
            operator: {
              type: 'string',
              enum: ['equals', 'contains', 'between', 'gt', 'lt', 'gte', 'lte', 'in', 'not_in'],
              description: 'Comparison operator',
            },
            value: {
              type: 'string',
              description: 'The value or values to match (use comma-separated for "in" operator)',
            },
          },
          required: ['dimension', 'operator', 'value'],
        },
      },
      markets: {
        type: 'array',
        items: { type: 'string' },
        description: 'Target markets (e.g., ["US", "UK", "DE"]). Defaults to all markets if not specified.',
      },
    },
    required: ['name', 'criteria'],
  },
  returns: {
    type: 'object',
    description: 'Created audience with ID, estimated size, and metadata',
  },
  execute: async (params, context): Promise<ToolResult> => {
    const { result, executionTimeMs } = await withTiming(async () => {
      const { name, description, criteria, markets } = params as {
        name: string
        description?: string
        criteria: AudienceCriteria[]
        markets?: string[]
      }

      // Estimate audience size based on criteria complexity
      const baseSize = 1000000
      const reductionFactor = Math.pow(0.7, criteria.length)
      const estimatedSize = Math.floor(baseSize * reductionFactor * (0.8 + Math.random() * 0.4))

      const audience = await prisma.audience.create({
        data: {
          orgId: context.orgId,
          name,
          description: description || `Audience created by agent`,
          criteria: { filters: criteria } as unknown as Prisma.InputJsonValue,
          size: estimatedSize,
          markets: markets || [],
          createdBy: context.userId,
        },
      })

      return {
        audienceId: audience.id,
        name: audience.name,
        estimatedSize,
        markets: audience.markets,
        criteria: audience.criteria,
        createdAt: audience.createdAt.toISOString(),
      }
    })

    return {
      success: true,
      data: result,
      metadata: {
        executionTimeMs,
        resourcesCreated: [{ type: 'audience', id: result.audienceId, name: result.name }],
      },
    }
  },
}

export const fetchAudienceDataTool: GWITool = {
  name: 'fetch_audience_data',
  description: 'Retrieve metrics and data points for a specific audience. Use this to get detailed information about an audience segment including demographics, behaviors, and interests.',
  category: 'data',
  parameters: {
    type: 'object',
    properties: {
      audienceId: {
        type: 'string',
        description: 'ID of the audience to fetch data for',
      },
      metrics: {
        type: 'array',
        items: { type: 'string' },
        description: 'Metrics to retrieve (e.g., ["demographics", "interests", "media_consumption", "purchase_behavior"])',
      },
      filters: {
        type: 'object',
        description: 'Optional filters to apply to the data',
      },
    },
    required: ['audienceId', 'metrics'],
  },
  returns: {
    type: 'object',
    description: 'Audience data with requested metrics and summary statistics',
  },
  execute: async (params, context): Promise<ToolResult> => {
    const { result, executionTimeMs } = await withTiming(async () => {
      const { audienceId, metrics } = params as {
        audienceId: string
        metrics: string[]
      }

      const audience = await prisma.audience.findFirst({
        where: { id: audienceId, orgId: context.orgId },
      })

      if (!audience) {
        throw new Error(`Audience not found: ${audienceId}`)
      }

      // Update usage tracking
      await prisma.audience.update({
        where: { id: audienceId },
        data: {
          lastUsed: new Date(),
          usageCount: { increment: 1 },
        },
      })

      // Generate mock data based on metrics requested
      const data: Record<string, unknown> = {
        audienceId,
        audienceName: audience.name,
        size: audience.size,
        markets: audience.markets,
      }

      if (metrics.includes('demographics')) {
        data.demographics = {
          ageDistribution: {
            '18-24': 15,
            '25-34': 28,
            '35-44': 25,
            '45-54': 18,
            '55+': 14,
          },
          gender: { male: 48, female: 51, other: 1 },
          income: {
            low: 22,
            medium: 45,
            high: 33,
          },
          education: {
            highSchool: 18,
            someCollege: 25,
            bachelors: 35,
            graduate: 22,
          },
        }
      }

      if (metrics.includes('interests')) {
        data.interests = {
          topCategories: [
            { name: 'Technology', index: 142 },
            { name: 'Travel', index: 128 },
            { name: 'Health & Fitness', index: 118 },
            { name: 'Entertainment', index: 112 },
            { name: 'Fashion', index: 105 },
          ],
          emergingInterests: ['AI/ML', 'Sustainable Products', 'Streaming Services'],
        }
      }

      if (metrics.includes('media_consumption')) {
        data.mediaConsumption = {
          platforms: [
            { name: 'Instagram', reach: 78, timeSpent: 45 },
            { name: 'YouTube', reach: 85, timeSpent: 62 },
            { name: 'TikTok', reach: 52, timeSpent: 38 },
            { name: 'Facebook', reach: 68, timeSpent: 28 },
            { name: 'LinkedIn', reach: 42, timeSpent: 15 },
          ],
          preferredContent: ['Short-form video', 'User reviews', 'How-to guides'],
          peakEngagement: ['Evening', 'Weekend mornings'],
        }
      }

      if (metrics.includes('purchase_behavior')) {
        data.purchaseBehavior = {
          onlineVsOffline: { online: 65, offline: 35 },
          averageOrderValue: 127,
          purchaseFrequency: 'monthly',
          preferredPayment: ['Credit Card', 'Digital Wallets'],
          topCategories: ['Electronics', 'Clothing', 'Home & Garden'],
          pricesSensitivity: 'moderate',
        }
      }

      return data
    })

    return {
      success: true,
      data: result,
      metadata: { executionTimeMs },
    }
  },
}

// ==================== CROSSTAB TOOLS ====================

export const generateCrosstabTool: GWITool = {
  name: 'generate_crosstab',
  description: 'Generate a cross-tabular comparison across multiple audiences and metrics. Use this to compare different audience segments side by side across various dimensions.',
  category: 'analysis',
  parameters: {
    type: 'object',
    properties: {
      audiences: {
        type: 'array',
        items: { type: 'string' },
        description: 'Array of audience IDs to compare (minimum 2)',
      },
      metrics: {
        type: 'array',
        items: { type: 'string' },
        description: 'Metrics to cross-tabulate (e.g., ["brand_awareness", "purchase_intent", "media_usage"])',
      },
      name: {
        type: 'string',
        description: 'Name for this crosstab analysis',
      },
      options: {
        type: 'object',
        description: 'Additional options like statistical tests, indexing base',
      },
    },
    required: ['audiences', 'metrics'],
  },
  returns: {
    type: 'object',
    description: 'Crosstab results with comparative data and statistical significance',
  },
  execute: async (params, context): Promise<ToolResult> => {
    const { result, executionTimeMs } = await withTiming(async () => {
      const { audiences, metrics, name } = params as {
        audiences: string[]
        metrics: string[]
        name?: string
      }

      if (audiences.length < 2) {
        throw new Error('At least 2 audiences required for crosstab comparison')
      }

      // Fetch audience details
      const audienceDetails = await prisma.audience.findMany({
        where: { id: { in: audiences }, orgId: context.orgId },
      })

      if (audienceDetails.length !== audiences.length) {
        throw new Error('One or more audiences not found')
      }

      // Generate comparison data
      const rows: Record<string, unknown>[] = []

      for (const metric of metrics) {
        const row: Record<string, unknown> = { metric }

        for (const audience of audienceDetails) {
          // Generate mock values with slight variations
          const baseValue = 50 + Math.random() * 30
          const index = 80 + Math.random() * 40

          row[audience.id] = {
            value: Math.round(baseValue * 10) / 10,
            index: Math.round(index),
            sampleSize: Math.floor((audience.size || 1000) * 0.01),
            significant: index > 110 || index < 90,
          }
        }

        rows.push(row)
      }

      // Create crosstab record
      const crosstab = await prisma.crosstab.create({
        data: {
          orgId: context.orgId,
          name: name || `Crosstab: ${audienceDetails.map(a => a.name).join(' vs ')}`,
          description: `Comparison of ${metrics.length} metrics across ${audiences.length} audiences`,
          audiences,
          metrics,
          results: { rows, generatedAt: new Date().toISOString() } as Prisma.InputJsonValue,
          createdBy: context.userId,
        },
      })

      return {
        crosstabId: crosstab.id,
        name: crosstab.name,
        audiences: audienceDetails.map(a => ({ id: a.id, name: a.name, size: a.size })),
        metrics,
        results: rows,
        summary: {
          totalComparisons: audiences.length * metrics.length,
          significantDifferences: rows.filter(r =>
            Object.values(r).some(v =>
              typeof v === 'object' && v !== null && (v as { significant?: boolean }).significant
            )
          ).length,
        },
      }
    })

    return {
      success: true,
      data: result,
      metadata: {
        executionTimeMs,
        resourcesCreated: [{ type: 'crosstab', id: result.crosstabId, name: result.name }],
      },
    }
  },
}

// ==================== SPARK QUERY TOOL ====================

export const querySparkTool: GWITool = {
  name: 'query_spark',
  description: 'Query GWI Spark MCP with a natural language question about consumer data. Use this for quick insights and conversational queries about GWI data.',
  category: 'analysis',
  parameters: {
    type: 'object',
    properties: {
      query: {
        type: 'string',
        description: 'Natural language query about consumer data (e.g., "What are the top interests of Gen Z consumers in the US?")',
      },
      audienceContext: {
        type: 'string',
        description: 'Optional audience ID to provide context for the query',
      },
      market: {
        type: 'string',
        description: 'Target market for the query (e.g., "US", "UK")',
      },
    },
    required: ['query'],
  },
  returns: {
    type: 'object',
    description: 'Spark response with insights, citations, and confidence score',
  },
  execute: async (params, context): Promise<ToolResult> => {
    const { result, executionTimeMs } = await withTiming(async () => {
      const { query, audienceContext, market } = params as {
        query: string
        audienceContext?: string
        market?: string
      }

      // In production, this would call the actual GWI Spark API
      // For now, generate a contextual response
      const response = {
        query,
        response: `Based on GWI data analysis: ${query.toLowerCase().includes('gen z')
          ? 'Gen Z consumers show strong engagement with digital-first brands and prioritize authenticity and sustainability. Key insights include high social media usage (avg 4.5 hours/day), preference for video content, and growing interest in mental health and wellness topics.'
          : query.toLowerCase().includes('millennial')
            ? 'Millennials demonstrate diverse consumption patterns with emphasis on experiences over possessions. They show strong brand loyalty when values align and are increasingly focused on work-life balance and financial security.'
            : 'The data indicates evolving consumer preferences with notable shifts in digital behavior and brand expectations. Key trends include increased demand for personalization, transparency, and sustainable practices.'
          }`,
        confidence: 0.85 + Math.random() * 0.1,
        citations: [
          { source: 'GWI Core Q4 2024', dataPoint: 'Social media usage patterns' },
          { source: 'GWI Zeitgeist', dataPoint: 'Consumer sentiment trends' },
        ],
        relatedMetrics: [
          { metric: 'Digital engagement', value: 78, index: 124 },
          { metric: 'Brand consideration', value: 45, index: 108 },
        ],
        market: market || 'Global',
        audienceContext,
      }

      return response
    })

    return {
      success: true,
      data: result,
      metadata: { executionTimeMs },
    }
  },
}

// ==================== VISUALIZATION TOOLS ====================

export const createChartTool: GWITool = {
  name: 'create_chart',
  description: 'Create a data visualization chart from crosstab or audience data. Use this to generate visual representations of your analysis.',
  category: 'visualization',
  parameters: {
    type: 'object',
    properties: {
      name: {
        type: 'string',
        description: 'Chart name/title',
      },
      type: {
        type: 'string',
        enum: ['BAR', 'LINE', 'PIE', 'DONUT', 'AREA', 'SCATTER', 'HEATMAP', 'TREEMAP', 'FUNNEL', 'RADAR'],
        description: 'Type of chart to create',
      },
      dataSource: {
        type: 'string',
        description: 'ID of crosstab or audience to use as data source',
      },
      dataSourceType: {
        type: 'string',
        enum: ['crosstab', 'audience'],
        description: 'Type of data source',
      },
      configuration: {
        type: 'object',
        description: 'Chart configuration options (colors, labels, legend, etc.)',
      },
    },
    required: ['name', 'type', 'dataSource'],
  },
  returns: {
    type: 'object',
    description: 'Created chart with ID and preview data',
  },
  execute: async (params, context): Promise<ToolResult> => {
    const { result, executionTimeMs } = await withTiming(async () => {
      const { name, type, dataSource, dataSourceType, configuration } = params as {
        name: string
        type: string
        dataSource: string
        dataSourceType?: string
        configuration?: ChartConfiguration
      }

      // Generate sample data based on chart type
      let chartData: unknown

      switch (type) {
        case 'BAR':
        case 'LINE':
        case 'AREA':
          chartData = {
            labels: ['Q1', 'Q2', 'Q3', 'Q4'],
            datasets: [
              { label: 'Series A', data: [65, 72, 78, 85] },
              { label: 'Series B', data: [55, 58, 62, 70] },
            ],
          }
          break
        case 'PIE':
        case 'DONUT':
          chartData = {
            labels: ['Segment A', 'Segment B', 'Segment C', 'Segment D'],
            data: [35, 28, 22, 15],
          }
          break
        case 'SCATTER':
          chartData = {
            datasets: [
              {
                label: 'Data Points',
                data: Array.from({ length: 20 }, () => ({
                  x: Math.random() * 100,
                  y: Math.random() * 100,
                })),
              },
            ],
          }
          break
        default:
          chartData = { labels: [], data: [] }
      }

      const chart = await prisma.chart.create({
        data: {
          orgId: context.orgId,
          name,
          description: `Auto-generated ${type} chart from ${dataSourceType || 'data'}`,
          type: type as 'BAR' | 'LINE' | 'PIE' | 'DONUT' | 'AREA' | 'SCATTER' | 'HEATMAP' | 'TREEMAP' | 'FUNNEL' | 'RADAR',
          config: (configuration || {}) as Prisma.InputJsonValue,
          data: chartData as Prisma.InputJsonValue,
          dataSource,
          status: 'PUBLISHED',
          createdBy: context.userId,
        },
      })

      return {
        chartId: chart.id,
        name: chart.name,
        type: chart.type,
        dataSource,
        previewData: chartData,
        createdAt: chart.createdAt.toISOString(),
      }
    })

    return {
      success: true,
      data: result,
      metadata: {
        executionTimeMs,
        resourcesCreated: [{ type: 'chart', id: result.chartId, name: result.name }],
      },
    }
  },
}

export const updateDashboardTool: GWITool = {
  name: 'update_dashboard',
  description: 'Add or update widgets on a dashboard. Use this to compose dashboards with charts, metrics, and other visualizations.',
  category: 'visualization',
  parameters: {
    type: 'object',
    properties: {
      dashboardId: {
        type: 'string',
        description: 'Dashboard ID to update. If not provided, creates a new dashboard.',
      },
      name: {
        type: 'string',
        description: 'Dashboard name (required when creating new)',
      },
      widgets: {
        type: 'array',
        description: 'Widgets to add or update',
        items: {
          type: 'object',
          properties: {
            type: { type: 'string', enum: ['chart', 'metric', 'table', 'text', 'crosstab'] },
            title: { type: 'string' },
            dataSource: { type: 'string' },
            config: { type: 'object' },
          },
        },
      },
    },
    required: ['widgets'],
  },
  returns: {
    type: 'object',
    description: 'Updated dashboard with widget layout',
  },
  execute: async (params, context): Promise<ToolResult> => {
    const { result, executionTimeMs } = await withTiming(async () => {
      const { dashboardId, name, widgets } = params as {
        dashboardId?: string
        name?: string
        widgets: DashboardWidget[]
      }

      let dashboard

      if (dashboardId) {
        // Update existing dashboard
        dashboard = await prisma.dashboard.findFirst({
          where: { id: dashboardId, orgId: context.orgId },
        })

        if (!dashboard) {
          throw new Error(`Dashboard not found: ${dashboardId}`)
        }

        const existingWidgets = Array.isArray(dashboard.widgets) ? (dashboard.widgets as unknown as DashboardWidget[]) : []
        const mergedWidgets = [...existingWidgets]

        // Add position to new widgets
        let nextY = Math.max(0, ...existingWidgets.map(w => w.position.y + w.position.height))

        for (const widget of widgets) {
          const newWidget: DashboardWidget = {
            id: `widget_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
            type: widget.type || 'chart',
            title: widget.title || 'Widget',
            dataSource: widget.dataSource,
            config: widget.config || {},
            position: { x: 0, y: nextY, width: 6, height: 4 },
          }
          mergedWidgets.push(newWidget)
          nextY += 4
        }

        dashboard = await prisma.dashboard.update({
          where: { id: dashboardId },
          data: {
            widgets: mergedWidgets as unknown as Prisma.InputJsonValue,
            updatedAt: new Date(),
          },
        })
      } else {
        // Create new dashboard
        const newWidgets: DashboardWidget[] = widgets.map((widget, index) => ({
          id: `widget_${Date.now()}_${index}`,
          type: widget.type || 'chart',
          title: widget.title || 'Widget',
          dataSource: widget.dataSource,
          config: widget.config || {},
          position: { x: (index % 2) * 6, y: Math.floor(index / 2) * 4, width: 6, height: 4 },
        }))

        dashboard = await prisma.dashboard.create({
          data: {
            orgId: context.orgId,
            name: name || `Dashboard ${new Date().toLocaleDateString()}`,
            description: 'Auto-generated dashboard',
            widgets: newWidgets as unknown as Prisma.InputJsonValue,
            layout: [],
            status: 'PUBLISHED',
            createdBy: context.userId,
          },
        })
      }

      const finalWidgets = Array.isArray(dashboard.widgets) ? dashboard.widgets : []
      return {
        dashboardId: dashboard.id,
        name: dashboard.name,
        widgetCount: finalWidgets.length,
        widgets: finalWidgets,
        updatedAt: dashboard.updatedAt.toISOString(),
      }
    })

    return {
      success: true,
      data: result,
      metadata: {
        executionTimeMs,
        resourcesCreated: (params as { dashboardId?: string }).dashboardId
          ? []
          : [{ type: 'dashboard', id: result.dashboardId, name: result.name }],
      },
    }
  },
}

// ==================== BRAND TRACKING TOOLS ====================

export const getBrandHealthTool: GWITool = {
  name: 'get_brand_health',
  description: 'Retrieve brand tracking metrics and health scores. Use this to get comprehensive brand health data including awareness, consideration, NPS, and competitive positioning.',
  category: 'analysis',
  parameters: {
    type: 'object',
    properties: {
      brandId: {
        type: 'string',
        description: 'Brand tracking ID to retrieve',
      },
      includeHistory: {
        type: 'boolean',
        description: 'Include historical snapshots for trend analysis',
      },
      audienceBreakdown: {
        type: 'boolean',
        description: 'Include breakdown by audience segment',
      },
      includeCompetitors: {
        type: 'boolean',
        description: 'Include competitor comparison data',
      },
    },
    required: ['brandId'],
  },
  returns: {
    type: 'object',
    description: 'Brand health metrics with optional history and breakdowns',
  },
  execute: async (params, context): Promise<ToolResult> => {
    const { result, executionTimeMs } = await withTiming(async () => {
      const { brandId, includeHistory, audienceBreakdown, includeCompetitors } = params as {
        brandId: string
        includeHistory?: boolean
        audienceBreakdown?: boolean
        includeCompetitors?: boolean
      }

      const brandTracking = await prisma.brandTracking.findFirst({
        where: { id: brandId, orgId: context.orgId },
        include: {
          snapshots: includeHistory
            ? { orderBy: { snapshotDate: 'desc' }, take: 12 }
            : { take: 1, orderBy: { snapshotDate: 'desc' } },
        },
      })

      if (!brandTracking) {
        throw new Error(`Brand tracking not found: ${brandId}`)
      }

      const latestSnapshot = brandTracking.snapshots[0]

      const response: Record<string, unknown> = {
        brandId: brandTracking.id,
        brandName: brandTracking.brandName,
        industry: brandTracking.industry,
        status: brandTracking.status,
        currentMetrics: latestSnapshot
          ? {
            brandHealth: latestSnapshot.brandHealth,
            awareness: latestSnapshot.awareness,
            consideration: latestSnapshot.consideration,
            preference: latestSnapshot.preference,
            loyalty: latestSnapshot.loyalty,
            nps: latestSnapshot.nps,
            marketShare: latestSnapshot.marketShare,
            sentimentScore: latestSnapshot.sentimentScore,
            snapshotDate: latestSnapshot.snapshotDate.toISOString(),
          }
          : null,
      }

      if (includeHistory && brandTracking.snapshots.length > 1) {
        response.history = brandTracking.snapshots.map(s => ({
          date: s.snapshotDate.toISOString(),
          brandHealth: s.brandHealth,
          awareness: s.awareness,
          nps: s.nps,
        }))

        // Calculate trends
        const current = brandTracking.snapshots[0]
        const previous = brandTracking.snapshots[1]
        if (current && previous) {
          response.trends = {
            brandHealth: {
              change: (current.brandHealth || 0) - (previous.brandHealth || 0),
              direction: (current.brandHealth || 0) >= (previous.brandHealth || 0) ? 'up' : 'down',
            },
            awareness: {
              change: (current.awareness || 0) - (previous.awareness || 0),
              direction: (current.awareness || 0) >= (previous.awareness || 0) ? 'up' : 'down',
            },
            nps: {
              change: (current.nps || 0) - (previous.nps || 0),
              direction: (current.nps || 0) >= (previous.nps || 0) ? 'up' : 'down',
            },
          }
        }
      }

      if (audienceBreakdown && latestSnapshot?.audienceBreakdown) {
        response.audienceBreakdown = latestSnapshot.audienceBreakdown
      }

      if (includeCompetitors) {
        response.competitors = brandTracking.competitors
        if (latestSnapshot?.competitorData) {
          response.competitorMetrics = latestSnapshot.competitorData
        }
      }

      return response
    })

    return {
      success: true,
      data: result,
      metadata: { executionTimeMs },
    }
  },
}

// ==================== INSIGHTS TOOLS ====================

export const analyzeInsightsTool: GWITool = {
  name: 'analyze_insights',
  description: 'Generate AI-powered insights from data analysis results. Use this to automatically extract key findings, anomalies, and recommendations from crosstabs, audiences, or brand tracking data.',
  category: 'analysis',
  parameters: {
    type: 'object',
    properties: {
      dataType: {
        type: 'string',
        enum: ['crosstab', 'audience', 'brand_tracking'],
        description: 'Type of data to analyze',
      },
      dataId: {
        type: 'string',
        description: 'ID of the data source to analyze',
      },
      focusAreas: {
        type: 'array',
        items: { type: 'string' },
        description: 'Specific areas to focus analysis on (e.g., ["trends", "anomalies", "recommendations"])',
      },
    },
    required: ['dataType', 'dataId'],
  },
  returns: {
    type: 'object',
    description: 'Generated insights with confidence scores and supporting data',
  },
  execute: async (params, context): Promise<ToolResult> => {
    const { result, executionTimeMs } = await withTiming(async () => {
      const { dataType, dataId, focusAreas } = params as {
        dataType: 'crosstab' | 'audience' | 'brand_tracking'
        dataId: string
        focusAreas?: string[]
      }

      let sourceData: unknown
      let sourceName: string

      // Fetch the source data
      switch (dataType) {
        case 'crosstab':
          const crosstab = await prisma.crosstab.findFirst({
            where: { id: dataId, orgId: context.orgId },
          })
          if (!crosstab) throw new Error(`Crosstab not found: ${dataId}`)
          sourceData = crosstab.results
          sourceName = crosstab.name
          break

        case 'audience':
          const audience = await prisma.audience.findFirst({
            where: { id: dataId, orgId: context.orgId },
          })
          if (!audience) throw new Error(`Audience not found: ${dataId}`)
          sourceData = { criteria: audience.criteria, size: audience.size }
          sourceName = audience.name
          break

        case 'brand_tracking':
          const brand = await prisma.brandTracking.findFirst({
            where: { id: dataId, orgId: context.orgId },
            include: { snapshots: { take: 5, orderBy: { snapshotDate: 'desc' } } },
          })
          if (!brand) throw new Error(`Brand tracking not found: ${dataId}`)
          sourceData = { brand, snapshots: brand.snapshots }
          sourceName = brand.brandName
          break
      }

      // Generate insights based on focus areas
      const insights: GeneratedInsight[] = []
      const areas = focusAreas || ['trends', 'anomalies', 'recommendations']

      if (areas.includes('trends')) {
        insights.push({
          title: 'Positive Growth Trend Detected',
          description: `Analysis of ${sourceName} shows consistent upward movement in key metrics over the analyzed period.`,
          type: 'trend',
          confidence: 0.87,
          data: { direction: 'positive', strength: 'moderate' },
        })
      }

      if (areas.includes('anomalies')) {
        insights.push({
          title: 'Statistical Anomaly in Segment',
          description: `Unusual pattern detected in the ${dataType} data that warrants further investigation.`,
          type: 'anomaly',
          confidence: 0.72,
          data: { severity: 'low', affectedMetrics: ['engagement', 'conversion'] },
        })
      }

      if (areas.includes('comparison') || areas.includes('key_differentiators')) {
        insights.push({
          title: 'Key Differentiators Identified',
          description: 'Significant differences found between compared segments in media consumption and brand affinity.',
          type: 'comparison',
          confidence: 0.91,
          data: { topDifferentiators: ['social_media_usage', 'brand_loyalty', 'price_sensitivity'] },
        })
      }

      if (areas.includes('recommendations')) {
        insights.push({
          title: 'Strategic Recommendation',
          description: 'Based on the analysis, consider focusing marketing efforts on digital channels with emphasis on video content.',
          type: 'recommendation',
          confidence: 0.84,
          data: { priority: 'high', actionItems: ['Increase video ad spend', 'Target evening hours', 'Focus on mobile platforms'] },
        })
      }

      // Store insights
      const createdInsight = await prisma.insight.create({
        data: {
          orgId: context.orgId,
          type: dataType,
          title: `Analysis of ${sourceName}`,
          data: {
            sourceType: dataType,
            sourceId: dataId,
            sourceName,
            insights,
            analyzedAt: new Date().toISOString(),
          } as unknown as Prisma.InputJsonValue,
          confidenceScore: insights.reduce((sum, i) => sum + i.confidence, 0) / insights.length,
        },
      })

      return {
        insightId: createdInsight.id,
        sourceName,
        sourceType: dataType,
        insights,
        summary: {
          totalInsights: insights.length,
          averageConfidence: insights.reduce((sum, i) => sum + i.confidence, 0) / insights.length,
          focusAreas: areas,
        },
      }
    })

    return {
      success: true,
      data: result,
      metadata: {
        executionTimeMs,
        resourcesCreated: [{ type: 'insight', id: result.insightId, name: `Analysis of ${result.sourceName}` }],
      },
    }
  },
}

// ==================== EXPORT ALL TOOLS ====================

export const GWI_TOOLS: GWITool[] = [
  createAudienceTool,
  fetchAudienceDataTool,
  generateCrosstabTool,
  querySparkTool,
  createChartTool,
  updateDashboardTool,
  getBrandHealthTool,
  analyzeInsightsTool,
]

// Tool lookup by name
export function getToolByName(name: string): GWITool | undefined {
  return GWI_TOOLS.find(tool => tool.name === name)
}

// Get tools by category
export function getToolsByCategory(category: string): GWITool[] {
  return GWI_TOOLS.filter(tool => tool.category === category)
}
